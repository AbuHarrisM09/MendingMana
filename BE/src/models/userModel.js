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
      u.profile_image_url,
      r.name AS role_name
    FROM users u
    JOIN roles r ON r.id = u.role_id
    WHERE lower(u.email) = lower($1)
    LIMIT 1
  `;

  const { rows } = await query(sql, [email]);
  return rows[0] || null;
}

async function findRoleByName(roleName) {
  const sql = `
    SELECT id, name
    FROM roles
    WHERE name = $1
    LIMIT 1
  `;

  const { rows } = await query(sql, [roleName]);
  return rows[0] || null;
}

async function createUser({ fullName, email, passwordHash, roleId, username = null, profileImageUrl = null }) {
  const sql = `
    INSERT INTO users (full_name, username, email, password_hash, role_id, is_verified, profile_image_url)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING id, full_name, email, role_id, profile_image_url
  `;

  const { rows } = await query(sql, [fullName, username, email, passwordHash, roleId, true, profileImageUrl]);
  return rows[0];
}

async function updateUserPassword(userId, passwordHash) {
  const sql = `
    UPDATE users
    SET password_hash = $1
    WHERE id = $2
    RETURNING id, email
  `;

  const { rows } = await query(sql, [passwordHash, userId]);
  return rows[0] || null;
}

module.exports = {
  findUserByEmail,
  findRoleByName,
  createUser,
  updateUserPassword,
};