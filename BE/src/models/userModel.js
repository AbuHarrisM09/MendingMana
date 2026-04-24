const { query } = require('../config/db');

async function findUserByEmail(email) {
  const sql = `
    SELECT
      u.id,
      u.full_name,
      u.email,
      u.password_hash,
      u.is_banned,
      u.banned_until,
      u.banned_reason,
      r.name AS role_name
    FROM users u
    JOIN roles r ON r.id = u.role_id
    WHERE lower(u.email) = lower($1)
    LIMIT 1
  `;

  const { rows } = await query(sql, [email]);
  return rows[0] || null;
}

module.exports = {
  findUserByEmail,
};
