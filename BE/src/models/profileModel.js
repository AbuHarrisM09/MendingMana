const { query } = require('../config/db');

// ─── READ ────────────────────────────────────────────────────────────

/**
 * Ambil profil user berdasarkan ID, termasuk statistik review & wishlist.
 */
async function findUserProfileById(userId) {
  const sql = `
    SELECT id, full_name, username, email, role_id, profile_image_url, bio, created_at
    FROM users WHERE id = $1
  `;
  const { rows } = await query(sql, [userId]);
  return rows[0] || null;
}

/**
 * Ambil statistik ringkasan user (total review, total wishlist).
 */
async function getUserStats(userId) {
  const sql = `
    SELECT 
      (SELECT COUNT(*) FROM reviews WHERE user_id = $1 AND parent_review_id IS NULL AND is_deleted = false) AS total_reviews,
      (SELECT COUNT(*) FROM saved_gadgets WHERE user_id = $1) AS total_wishlist
  `;
  const { rows } = await query(sql, [userId]);
  return rows[0] || { total_reviews: 0, total_wishlist: 0 };
}

/**
 * Ambil daftar wishlist user (dengan info gadget).
 */
async function findWishlistByUser(userId) {
  const sql = `
    SELECT 
      g.id, g.name, g.price, b.name AS brand_name, c.name AS category_name, sg.created_at AS saved_at,
      (SELECT json_agg(file_url) FROM gadget_media gm WHERE gm.gadget_id = g.id AND gm.is_primary = true) AS images
    FROM saved_gadgets sg
    JOIN gadgets g ON sg.gadget_id = g.id
    LEFT JOIN brands b ON g.brand_id = b.id
    LEFT JOIN categories c ON g.category_id = c.id
    WHERE sg.user_id = $1
    ORDER BY sg.created_at DESC
  `;
  const { rows } = await query(sql, [userId]);
  return rows;
}

/**
 * Ambil daftar ulasan milik user.
 */
async function findReviewsByUser(userId) {
  const sql = `
    SELECT r.id, r.rating, r.title, r.review_text, r.created_at, g.id AS gadget_id, g.name AS gadget_name
    FROM reviews r
    JOIN gadgets g ON r.gadget_id = g.id
    WHERE r.user_id = $1 AND r.parent_review_id IS NULL AND r.is_deleted = false
    ORDER BY r.created_at DESC
  `;
  const { rows } = await query(sql, [userId]);
  return rows;
}

module.exports = {
  findUserProfileById,
  getUserStats,
  findWishlistByUser,
  findReviewsByUser,
};
