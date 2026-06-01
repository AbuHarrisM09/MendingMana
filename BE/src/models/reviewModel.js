const { query, pool } = require('../config/db');

// ─── READ ────────────────────────────────────────────────────────────

/**
 * Ambil semua ulasan top-level untuk sebuah gadget.
 * Jika currentUserId diberikan, sertakan vote milik user tersebut.
 */
async function findReviewsByGadget(gadgetId, currentUserId = null) {
  const sql = `
    SELECT 
      r.id,
      r.user_id,
      u.full_name   AS user_name,
      u.profile_image_url AS user_avatar,
      r.rating,
      r.title,
      r.review_text,
      r.upvote_count,
      r.downvote_count,
      r.is_edited,
      r.created_at,
      r.updated_at,
      (
        SELECT json_agg(rm.file_url)
        FROM review_media rm
        WHERE rm.review_id = r.id
      ) AS media,
      ${currentUserId
        ? `(SELECT vote_type FROM review_votes rv WHERE rv.review_id = r.id AND rv.user_id = $2) AS my_vote`
        : `NULL AS my_vote`
      }
    FROM reviews r
    JOIN users u ON r.user_id = u.id
    WHERE r.gadget_id = $1
      AND r.parent_review_id IS NULL
      AND r.is_deleted = false
    ORDER BY r.created_at DESC
  `;

  const params = currentUserId ? [gadgetId, currentUserId] : [gadgetId];
  const { rows } = await query(sql, params);
  return rows;
}

/**
 * Ambil satu review berdasarkan ID (yang belum dihapus).
 */
async function findReviewById(reviewId) {
  const sql = `SELECT * FROM reviews WHERE id = $1 AND is_deleted = false`;
  const { rows } = await query(sql, [reviewId]);
  return rows[0] || null;
}

/**
 * Cek apakah user sudah pernah memberikan review top-level pada gadget ini.
 */
async function findExistingReview(gadgetId, userId) {
  const sql = `
    SELECT id FROM reviews
    WHERE gadget_id = $1
      AND user_id = $2
      AND parent_review_id IS NULL
      AND is_deleted = false
  `;
  const { rows } = await query(sql, [gadgetId, userId]);
  return rows[0] || null;
}

// ─── WRITE ───────────────────────────────────────────────────────────

/**
 * Insert review baru.
 */
async function insertReview({ gadgetId, userId, rating, title, reviewText }) {
  const sql = `
    INSERT INTO reviews (gadget_id, user_id, rating, title, review_text)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `;
  const { rows } = await query(sql, [gadgetId, userId, rating, title, reviewText]);
  return rows[0];
}

/**
 * Update review yang sudah ada (dynamic fields).
 * @param {number} reviewId
 * @param {object} fields - { rating?, title?, review_text? }
 */
async function updateReview(reviewId, fields) {
  const setClauses = [];
  const values = [];
  let idx = 1;

  if (fields.rating !== undefined) {
    setClauses.push(`rating = $${idx++}`);
    values.push(fields.rating);
  }
  if (fields.title !== undefined) {
    setClauses.push(`title = $${idx++}`);
    values.push(fields.title);
  }
  if (fields.review_text !== undefined) {
    setClauses.push(`review_text = $${idx++}`);
    values.push(fields.review_text);
  }

  if (setClauses.length === 0) return null;

  setClauses.push('is_edited = true');

  values.push(reviewId);
  const sql = `
    UPDATE reviews
    SET ${setClauses.join(', ')}, updated_at = NOW()
    WHERE id = $${idx}
    RETURNING *
  `;
  const { rows } = await query(sql, values);
  return rows[0];
}

/**
 * Soft-delete review.
 */
async function softDeleteReview(reviewId) {
  const sql = `UPDATE reviews SET is_deleted = true, updated_at = NOW() WHERE id = $1`;
  await query(sql, [reviewId]);
}

// ─── VOTES ───────────────────────────────────────────────────────────

/**
 * Ambil vote milik user tertentu pada sebuah review.
 */
async function findVote(reviewId, userId) {
  const sql = `SELECT id, vote_type FROM review_votes WHERE review_id = $1 AND user_id = $2`;
  const { rows } = await query(sql, [reviewId, userId]);
  return rows[0] || null;
}

/**
 * Proses vote (add / flip / toggle-off) dalam satu transaksi.
 * Mengembalikan { action, upvotes, downvotes }.
 */
async function processVote(reviewId, userId, voteType) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const existingRes = await client.query(
      'SELECT id, vote_type FROM review_votes WHERE review_id = $1 AND user_id = $2',
      [reviewId, userId]
    );

    let action = '';

    if (existingRes.rows.length > 0) {
      const current = existingRes.rows[0];

      if (current.vote_type === voteType) {
        // Toggle off
        await client.query('DELETE FROM review_votes WHERE id = $1', [current.id]);
        const col = voteType === 1 ? 'upvote_count' : 'downvote_count';
        await client.query(
          `UPDATE reviews SET ${col} = GREATEST(0, ${col} - 1) WHERE id = $1`,
          [reviewId]
        );
        action = 'removed';
      } else {
        // Flip
        await client.query(
          'UPDATE review_votes SET vote_type = $1, updated_at = NOW() WHERE id = $2',
          [voteType, current.id]
        );
        const [inc, dec] = voteType === 1
          ? ['upvote_count', 'downvote_count']
          : ['downvote_count', 'upvote_count'];
        await client.query(
          `UPDATE reviews SET ${inc} = ${inc} + 1, ${dec} = GREATEST(0, ${dec} - 1) WHERE id = $1`,
          [reviewId]
        );
        action = 'flipped';
      }
    } else {
      // New vote
      await client.query(
        'INSERT INTO review_votes (review_id, user_id, vote_type) VALUES ($1, $2, $3)',
        [reviewId, userId, voteType]
      );
      const col = voteType === 1 ? 'upvote_count' : 'downvote_count';
      await client.query(
        `UPDATE reviews SET ${col} = ${col} + 1 WHERE id = $1`,
        [reviewId]
      );
      action = 'added';
    }

    await client.query('COMMIT');

    // Ambil counter terbaru
    const updated = await query(
      'SELECT upvote_count, downvote_count FROM reviews WHERE id = $1',
      [reviewId]
    );

    return {
      action,
      upvotes: updated.rows[0].upvote_count,
      downvotes: updated.rows[0].downvote_count,
    };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

// ─── HELPERS ─────────────────────────────────────────────────────────

async function gadgetExists(gadgetId) {
  const { rows } = await query('SELECT id FROM gadgets WHERE id = $1', [gadgetId]);
  return rows.length > 0;
}

async function getUserName(userId) {
  const { rows } = await query('SELECT full_name FROM users WHERE id = $1', [userId]);
  return rows[0]?.full_name || null;
}

module.exports = {
  findReviewsByGadget,
  findReviewById,
  findExistingReview,
  insertReview,
  updateReview,
  softDeleteReview,
  findVote,
  processVote,
  gadgetExists,
  getUserName,
};
