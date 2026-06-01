const { query, pool } = require('../config/db');

// ─── READ ────────────────────────────────────────────────────────────

/**
 * Ambil semua gadget dengan brand, category, dan images.
 */
async function findAllGadgets() {
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
    ORDER BY g.created_at DESC
  `;
  const { rows } = await query(sql);
  return rows;
}

/**
 * Ambil detail gadget by ID (termasuk images).
 */
async function findGadgetById(gadgetId) {
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
    WHERE g.id = $1
    LIMIT 1
  `;
  const { rows } = await query(sql, [gadgetId]);
  return rows[0] || null;
}

/**
 * Ambil spesifikasi teknis gadget.
 */
async function findSpecsByGadgetId(gadgetId) {
  const sql = `
    SELECT spec_group, spec_key, spec_value, value_type, display_order
    FROM gadget_specs
    WHERE gadget_id = $1
    ORDER BY display_order ASC, spec_key ASC
  `;
  const { rows } = await query(sql, [gadgetId]);
  return rows;
}

/**
 * Cek apakah gadget ada (by ID langsung).
 */
async function gadgetExistsRaw(client, gadgetId) {
  const { rows } = await client.query('SELECT * FROM gadgets WHERE id = $1 LIMIT 1', [gadgetId]);
  return rows[0] || null;
}

/**
 * Ambil daftar kolom tabel gadgets.
 */
async function getGadgetsColumns(client) {
  const { rows } = await client.query(
    `SELECT column_name
     FROM information_schema.columns
     WHERE table_schema = 'public' AND table_name = 'gadgets'`
  );
  return new Set(rows.map(r => r.column_name));
}

/**
 * Ambil nama brand by ID.
 */
async function findBrandNameById(client, brandId) {
  const { rows } = await client.query('SELECT name FROM brands WHERE id = $1 LIMIT 1', [brandId]);
  return rows[0]?.name || null;
}

/**
 * Ambil nama category by ID.
 */
async function findCategoryNameById(client, categoryId) {
  const { rows } = await client.query('SELECT name FROM categories WHERE id = $1 LIMIT 1', [categoryId]);
  return rows[0]?.name || null;
}

// ─── WRITE ───────────────────────────────────────────────────────────

/**
 * Insert gadget baru (dalam transaksi).
 */
async function insertGadget(client, { columns, values }) {
  const placeholders = values.map((_, idx) => `$${idx + 1}`).join(', ');
  const sql = `
    INSERT INTO gadgets (${columns.join(', ')})
    VALUES (${placeholders})
    RETURNING *
  `;
  const { rows } = await client.query(sql, values);
  return rows[0];
}

/**
 * Update gadget secara dinamis (dalam transaksi).
 */
async function updateGadget(client, gadgetId, updateFields, updateValues) {
  updateValues.push(gadgetId);
  const paramIndex = updateValues.length;
  const sql = `
    UPDATE gadgets
    SET ${updateFields.join(', ')}, updated_at = NOW()
    WHERE id = $${paramIndex}
    RETURNING *
  `;
  const { rows } = await client.query(sql, updateValues);
  return rows[0];
}

/**
 * Hapus gadget dari database.
 */
async function deleteGadget(client, gadgetId) {
  await client.query('DELETE FROM gadgets WHERE id = $1', [gadgetId]);
}

// ─── MEDIA ───────────────────────────────────────────────────────────

/**
 * Ambil semua media (gambar) milik gadget.
 */
async function findMediaByGadgetId(client, gadgetId) {
  const { rows } = await client.query(
    'SELECT file_url FROM gadget_media WHERE gadget_id = $1',
    [gadgetId]
  );
  return rows;
}

/**
 * Hapus semua media milik gadget.
 */
async function deleteMediaByGadgetId(client, gadgetId) {
  await client.query('DELETE FROM gadget_media WHERE gadget_id = $1', [gadgetId]);
}

/**
 * Insert satu media baru untuk gadget.
 */
async function insertMedia(client, { gadgetId, mediaType, fileUrl, isPrimary }) {
  await client.query(
    `INSERT INTO gadget_media (gadget_id, media_type, file_url, is_primary) VALUES ($1, $2, $3, $4)`,
    [gadgetId, mediaType, fileUrl, isPrimary]
  );
}

// ─── SPECS ───────────────────────────────────────────────────────────

/**
 * Hapus semua spec rows milik gadget.
 */
async function deleteSpecsByGadgetId(client, gadgetId) {
  await client.query('DELETE FROM gadget_specs WHERE gadget_id = $1', [gadgetId]);
}

/**
 * Insert satu spec row untuk gadget.
 */
async function insertSpec(client, { gadgetId, specGroup, specKey, specValue, displayOrder }) {
  await client.query(
    `INSERT INTO gadget_specs (gadget_id, spec_group, spec_key, spec_value, display_order)
     VALUES ($1, $2, $3, $4, $5)`,
    [gadgetId, specGroup, specKey, specValue, displayOrder]
  );
}

// ─── METADATA ────────────────────────────────────────────────────────

async function findAllCategories() {
  const { rows } = await query('SELECT * FROM categories ORDER BY name ASC');
  return rows;
}

async function findAllBrands() {
  const { rows } = await query('SELECT * FROM brands ORDER BY name ASC');
  return rows;
}

module.exports = {
  findAllGadgets,
  findGadgetById,
  findSpecsByGadgetId,
  gadgetExistsRaw,
  getGadgetsColumns,
  findBrandNameById,
  findCategoryNameById,
  insertGadget,
  updateGadget,
  deleteGadget,
  findMediaByGadgetId,
  deleteMediaByGadgetId,
  insertMedia,
  deleteSpecsByGadgetId,
  insertSpec,
  findAllCategories,
  findAllBrands,
};
