const { query } = require('../config/db');

// ─── READ ────────────────────────────────────────────────────────────

/**
 * Ambil seluruh wishlist milik user, lengkap dengan info gadget.
 */
async function findWishlistByUser(userId) {
  const sql = `
    SELECT 
      g.id, g.name, g.price, g.average_rating, g.total_reviews,
      b.name AS brand_name,
      c.name AS category_name,
      sg.created_at AS saved_at,
      (
        SELECT json_agg(file_url)
        FROM gadget_media gm
        WHERE gm.gadget_id = g.id
      ) AS images
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
 * Cek apakah gadget sudah ada di wishlist user.
 */
async function findSavedGadget(userId, gadgetId) {
  const sql = `SELECT id FROM saved_gadgets WHERE user_id = $1 AND gadget_id = $2`;
  const { rows } = await query(sql, [userId, gadgetId]);
  return rows[0] || null;
}

// ─── WRITE ───────────────────────────────────────────────────────────

/**
 * Tambahkan gadget ke wishlist.
 */
async function addToWishlist(userId, gadgetId) {
  const sql = `INSERT INTO saved_gadgets (user_id, gadget_id) VALUES ($1, $2) RETURNING *`;
  const { rows } = await query(sql, [userId, gadgetId]);
  return rows[0];
}

/**
 * Hapus gadget dari wishlist.
 * Mengembalikan baris yang dihapus, atau null jika tidak ada.
 */
async function removeFromWishlist(userId, gadgetId) {
  const sql = `DELETE FROM saved_gadgets WHERE user_id = $1 AND gadget_id = $2 RETURNING id`;
  const { rows } = await query(sql, [userId, gadgetId]);
  return rows[0] || null;
}

// ─── HELPERS ─────────────────────────────────────────────────────────

async function gadgetExists(gadgetId) {
  const { rows } = await query('SELECT id FROM gadgets WHERE id = $1', [gadgetId]);
  return rows.length > 0;
}

module.exports = {
  findWishlistByUser,
  findSavedGadget,
  addToWishlist,
  removeFromWishlist,
  gadgetExists,
};
