const { query, pool } = require('../config/db');

// ─── SESSIONS ────────────────────────────────────────────────────────

/**
 * Ambil semua sesi komparasi milik user, beserta preview gadget.
 */
async function findSessionsByUser(userId) {
  const sql = `
    SELECT 
      cs.*,
      COALESCE(
        json_agg(
          json_build_object(
            'id', 'g-' || g.id,
            'name', g.name,
            'brand', b.name,
            'price', g.price,
            'image', (SELECT file_url FROM gadget_media WHERE gadget_id = g.id LIMIT 1)
          )
        ) FILTER (WHERE g.id IS NOT NULL),
        '[]'
      ) AS gadgets
    FROM comparison_sessions cs
    LEFT JOIN comparison_items ci ON ci.session_id = cs.id
    LEFT JOIN gadgets g ON ci.gadget_id = g.id
    LEFT JOIN brands b ON g.brand_id = b.id
    WHERE cs.user_id = $1
    GROUP BY cs.id
    ORDER BY cs.updated_at DESC
  `;
  const { rows } = await query(sql, [userId]);
  return rows;
}

/**
 * Ambil sesi komparasi by ID + ownership check.
 */
async function findSessionByIdAndUser(sessionId, userId) {
  const sql = `SELECT * FROM comparison_sessions WHERE id = $1 AND user_id = $2 LIMIT 1`;
  const { rows } = await query(sql, [sessionId, userId]);
  return rows[0] || null;
}

/**
 * Ambil daftar gadget ID dalam sebuah sesi.
 */
async function findItemsBySessionId(sessionId) {
  const sql = `SELECT gadget_id FROM comparison_items WHERE session_id = $1`;
  const { rows } = await query(sql, [sessionId]);
  return rows.map(r => r.gadget_id);
}

/**
 * Ambil nama-nama gadget dari array of IDs (untuk auto-generate title).
 */
async function findGadgetNamesByIds(client, gadgetIds) {
  const { rows } = await client.query(
    `SELECT name FROM gadgets WHERE id = ANY($1::bigint[]) LIMIT 3`,
    [gadgetIds]
  );
  return rows.map(r => r.name);
}

// ─── WRITE ───────────────────────────────────────────────────────────

/**
 * Insert sesi komparasi baru (dalam transaksi).
 */
async function insertSession(client, userId, title) {
  const sql = `INSERT INTO comparison_sessions (user_id, title) VALUES ($1, $2) RETURNING *`;
  const { rows } = await client.query(sql, [userId, title]);
  return rows[0];
}

/**
 * Insert item ke dalam sesi komparasi.
 */
async function insertSessionItem(client, sessionId, gadgetId) {
  await client.query(
    `INSERT INTO comparison_items (session_id, gadget_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
    [sessionId, gadgetId]
  );
}

/**
 * Update judul sesi.
 */
async function updateSessionTitle(client, sessionId, title) {
  if (title !== undefined) {
    await client.query(
      `UPDATE comparison_sessions SET title = $1, updated_at = NOW() WHERE id = $2`,
      [title, sessionId]
    );
  } else {
    await client.query(
      `UPDATE comparison_sessions SET updated_at = NOW() WHERE id = $1`,
      [sessionId]
    );
  }
}

/**
 * Touch updated_at pada sesi.
 */
async function touchSession(sessionId) {
  await query(
    `UPDATE comparison_sessions SET updated_at = NOW() WHERE id = $1`,
    [sessionId]
  );
}

/**
 * Hapus semua items dari sesi.
 */
async function deleteItemsBySessionId(client, sessionId) {
  await client.query(`DELETE FROM comparison_items WHERE session_id = $1`, [sessionId]);
}

/**
 * Hapus sesi komparasi (beserta items via CASCADE).
 */
async function deleteSession(sessionId, userId) {
  const result = await query(
    `DELETE FROM comparison_sessions WHERE id = $1 AND user_id = $2`,
    [sessionId, userId]
  );
  return result.rowCount;
}

/**
 * Hapus satu item dari sesi.
 */
async function deleteSessionItem(sessionId, gadgetId) {
  const result = await query(
    `DELETE FROM comparison_items WHERE session_id = $1 AND gadget_id = $2`,
    [sessionId, gadgetId]
  );
  return result.rowCount;
}

// ─── COMPARISON DATA ─────────────────────────────────────────────────

/**
 * Ambil gadget lengkap by array of IDs (untuk matriks komparasi).
 */
async function findGadgetsByIds(gadgetIds) {
  const sql = `
    SELECT 
      g.*,
      b.name AS brand_name,
      c.name AS category_name,
      (
        SELECT json_agg(file_url)
        FROM gadget_media gm
        WHERE gm.gadget_id = g.id
      ) AS images
    FROM gadgets g
    LEFT JOIN brands b ON g.brand_id = b.id
    LEFT JOIN categories c ON g.category_id = c.id
    WHERE g.id = ANY($1::bigint[])
  `;
  const { rows } = await query(sql, [gadgetIds]);
  return rows;
}

/**
 * Ambil semua specs untuk array of gadget IDs.
 */
async function findSpecsByGadgetIds(gadgetIds) {
  const sql = `
    SELECT gadget_id, spec_group, spec_key, spec_value
    FROM gadget_specs
    WHERE gadget_id = ANY($1::bigint[])
    ORDER BY display_order ASC, spec_key ASC
  `;
  const { rows } = await query(sql, [gadgetIds]);
  return rows;
}

module.exports = {
  findSessionsByUser,
  findSessionByIdAndUser,
  findItemsBySessionId,
  findGadgetNamesByIds,
  insertSession,
  insertSessionItem,
  updateSessionTitle,
  touchSession,
  deleteItemsBySessionId,
  deleteSession,
  deleteSessionItem,
  findGadgetsByIds,
  findSpecsByGadgetIds,
};
