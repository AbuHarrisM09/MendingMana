const { query } = require('../config/db');

async function getAllMembers({ search = '', status = 'all', page = 1, limit = 15 }) {
  const offset = (page - 1) * limit;
  const params = [];
  let paramIndex = 1;

  let whereClause = `WHERE r.name = 'member'`;

  if (search) {
    whereClause += ` AND (
      lower(u.full_name) LIKE lower($${paramIndex})
      OR lower(u.email) LIKE lower($${paramIndex})
    )`;
    params.push(`%${search}%`);
    paramIndex++;
  }

  if (status === 'active') {
    whereClause += ` AND (u.is_banned = FALSE OR (u.banned_until IS NOT NULL AND u.banned_until <= NOW()))`;
  } else if (status === 'banned') {
    whereClause += ` AND (u.is_banned = TRUE AND (u.banned_until IS NULL OR u.banned_until > NOW()))`;
  }

  // Count query
  const countSql = `
    SELECT COUNT(*)::integer AS total
    FROM users u
    JOIN roles r ON r.id = u.role_id
    ${whereClause}
  `;
  const { rows: countRows } = await query(countSql, params);
  const total = countRows[0].total;

  // Data query
  const dataSql = `
    SELECT
      u.id,
      u.full_name,
      u.username,
      u.email,
      u.profile_image_url,
      u.is_banned,
      u.banned_reason,
      u.banned_until,
      u.created_at,
      u.last_login_at,
      r.name AS role_name,
      COALESCE(review_stats.total_reviews, 0)::integer AS total_reviews,
      COALESCE(review_stats.avg_rating, 0)::numeric(3,2) AS avg_rating
    FROM users u
    JOIN roles r ON r.id = u.role_id
    LEFT JOIN (
      SELECT
        user_id,
        COUNT(*)::integer AS total_reviews,
        ROUND(AVG(rating)::numeric, 2) AS avg_rating
      FROM reviews
      WHERE parent_review_id IS NULL
        AND is_deleted = FALSE
        AND rating IS NOT NULL
      GROUP BY user_id
    ) review_stats ON review_stats.user_id = u.id
    ${whereClause}
    ORDER BY u.created_at DESC
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
  `;

  const dataParams = [...params, limit, offset];
  const { rows } = await query(dataSql, dataParams);

  return {
    users: rows,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

async function findMemberById(userId) {
  const sql = `
    SELECT
      u.id,
      u.full_name,
      u.email,
      u.is_banned,
      u.banned_reason,
      u.banned_until,
      r.name AS role_name
    FROM users u
    JOIN roles r ON r.id = u.role_id
    WHERE u.id = $1 AND r.name = 'member'
    LIMIT 1
  `;
  const { rows } = await query(sql, [userId]);
  return rows[0] || null;
}

async function banUser(userId, { reason = null, bannedUntil = null }) {
  const sql = `
    UPDATE users
    SET
      is_banned = TRUE,
      banned_reason = $2,
      banned_until = $3,
      updated_at = NOW()
    WHERE id = $1
    RETURNING id, full_name, email, is_banned, banned_reason, banned_until
  `;
  const { rows } = await query(sql, [userId, reason, bannedUntil]);
  return rows[0] || null;
}

async function unbanUser(userId) {
  const sql = `
    UPDATE users
    SET
      is_banned = FALSE,
      banned_reason = NULL,
      banned_until = NULL,
      updated_at = NOW()
    WHERE id = $1
    RETURNING id, full_name, email, is_banned
  `;
  const { rows } = await query(sql, [userId]);
  return rows[0] || null;
}

module.exports = {
  getAllMembers,
  findMemberById,
  banUser,
  unbanUser,
};
