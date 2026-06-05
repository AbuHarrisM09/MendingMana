const path = require('path');
const { pathToFileURL } = require('url');
const bcrypt = require('bcrypt');
const { query, pool } = require('../config/db');

const SALT_ROUNDS = 10;

const tableColumnCache = new Map();

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function buildUsername(fullName, fallback) {
  const base = slugify(fullName || '') || slugify(fallback || 'user');
  return base.slice(0, 40);
}

function mapCategoryName(name) {
  if (!name) return name;
  const normalized = name.trim();
  if (normalized.toLowerCase() === 'aksesori') return 'Accessory';
  return normalized;
}

async function getTableColumns(tableName) {
  if (tableColumnCache.has(tableName)) return tableColumnCache.get(tableName);

  const result = await query(
    `SELECT column_name, is_nullable, column_default
     FROM information_schema.columns
     WHERE table_schema = 'public' AND table_name = $1`,
    [tableName],
  );

  const columns = new Map();
  for (const row of result.rows) {
    columns.set(row.column_name, {
      isNullable: row.is_nullable === 'YES',
      hasDefault: row.column_default != null,
      columnDefault: row.column_default,
    });
  }

  tableColumnCache.set(tableName, columns);
  return columns;
}

function buildSummary(text, maxLen = 180) {
  if (!text) return null;
  const normalized = String(text).trim().replace(/\s+/g, ' ');
  if (normalized.length <= maxLen) return normalized;
  return normalized.slice(0, maxLen - 1).trimEnd() + '…';
}

function addIfColumnExists(columns, pairs, columnName, value) {
  if (!columns.has(columnName)) return;
  pairs.push([columnName, value]);
}

function computeRequiredFallback(columns, columnName, gadget, brandId, categoryId) {
  if (!columns.has(columnName)) return undefined;
  const meta = columns.get(columnName);
  if (meta.isNullable || meta.hasDefault) return undefined;

  if (columnName === 'brand') return gadget.brand || null;
  if (columnName === 'category') return mapCategoryName(gadget.category) || null;
  if (columnName === 'brand_id') return brandId ?? null;
  if (columnName === 'category_id') return categoryId ?? null;
  if (columnName === 'status') return 'published';
  if (columnName === 'stock') return 0;
  if (columnName === 'currency_code') return 'IDR';
  if (columnName === 'average_rating') return gadget.averageRating || 0;
  if (columnName === 'total_reviews') return gadget.totalReviews || 0;

  return undefined;
}

async function loadMockData() {
  const mockDataPath = path.resolve(
    __dirname,
    '..',
    '..',
    '..',
    'FE',
    'src',
    'data',
    'mockData.js',
  );
  const moduleUrl = pathToFileURL(mockDataPath).href;
  const mockModule = await import(moduleUrl);
  return mockModule;
}

async function getRoleId(roleName) {
  const { rows } = await query('SELECT id FROM roles WHERE name = $1 LIMIT 1', [roleName]);
  if (!rows[0]) {
    throw new Error(`Role '${roleName}' tidak ditemukan. Jalankan npm run db:init dulu.`);
  }
  return rows[0].id;
}

async function getOrCreateBrandId(brandName) {
  const { rows } = await query('SELECT id FROM brands WHERE name = $1 LIMIT 1', [brandName]);
  if (rows[0]) return rows[0].id;

  const insert = await query(
    'INSERT INTO brands (name) VALUES ($1) RETURNING id',
    [brandName],
  );
  return insert.rows[0].id;
}

async function getOrCreateCategoryId(categoryName) {
  const normalized = mapCategoryName(categoryName);
  const { rows } = await query('SELECT id FROM categories WHERE name = $1 LIMIT 1', [normalized]);
  if (rows[0]) return rows[0].id;

  const slug = slugify(normalized);
  const insert = await query(
    'INSERT INTO categories (name, slug) VALUES ($1, $2) RETURNING id',
    [normalized, slug],
  );
  return insert.rows[0].id;
}

async function upsertUser(seedUser) {
  const roleId = await getRoleId(seedUser.role || 'member');
  const passwordHash = await bcrypt.hash(seedUser.password || 'password123', SALT_ROUNDS);
  const username = buildUsername(seedUser.name, seedUser.email);
  const isBanned = seedUser.status === 'banned';

  const sql = `
    INSERT INTO users (full_name, username, email, password_hash, role_id, profile_image_url, is_verified, is_banned)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    ON CONFLICT (email)
    DO UPDATE SET
      full_name = EXCLUDED.full_name,
      username = EXCLUDED.username,
      password_hash = EXCLUDED.password_hash,
      role_id = EXCLUDED.role_id,
      profile_image_url = EXCLUDED.profile_image_url,
      is_verified = EXCLUDED.is_verified,
      is_banned = EXCLUDED.is_banned,
      updated_at = NOW()
    RETURNING id, email
  `;

  const values = [
    seedUser.name,
    username,
    seedUser.email,
    passwordHash,
    roleId,
    seedUser.avatar || null,
    true,
    isBanned,
  ];

  const result = await query(sql, values);
  return result.rows[0];
}

async function upsertGadget(gadget, brandId, categoryId) {
  const columns = await getTableColumns('gadgets');

  const rawSlug = `${slugify(gadget.name)}-${slugify(gadget.brand)}`;
  const slug = rawSlug.slice(0, 180);

  const existing = await query('SELECT id FROM gadgets WHERE slug = $1 ORDER BY id ASC LIMIT 1', [slug]);

  const pairs = [];
  addIfColumnExists(columns, pairs, 'name', gadget.name);
  addIfColumnExists(columns, pairs, 'slug', slug);
  addIfColumnExists(columns, pairs, 'model', gadget.model || null);
  addIfColumnExists(columns, pairs, 'price', gadget.price || null);
  addIfColumnExists(columns, pairs, 'release_date', gadget.releaseDate || null);
  addIfColumnExists(columns, pairs, 'description', gadget.description || null);
  addIfColumnExists(columns, pairs, 'summary', buildSummary(gadget.description));
  addIfColumnExists(columns, pairs, 'average_rating', gadget.averageRating || 0);
  addIfColumnExists(columns, pairs, 'total_reviews', gadget.totalReviews || 0);
  addIfColumnExists(columns, pairs, 'status', 'published');
  addIfColumnExists(columns, pairs, 'brand_id', brandId);
  addIfColumnExists(columns, pairs, 'category_id', categoryId);
  addIfColumnExists(columns, pairs, 'brand', gadget.brand || null);
  addIfColumnExists(columns, pairs, 'category', mapCategoryName(gadget.category) || null);

  // Ensure we provide a value for required columns without defaults.
  for (const columnName of columns.keys()) {
    const fallback = computeRequiredFallback(columns, columnName, gadget, brandId, categoryId);
    if (fallback === undefined) continue;
    if (pairs.some(([name]) => name === columnName)) continue;
    pairs.push([columnName, fallback]);
  }

  const allowed = pairs.filter(([_, v]) => v !== undefined);
  const colNames = allowed.map(([k]) => k);
  const colValues = allowed.map(([_, v]) => v);
  const placeholders = colValues.map((_, idx) => `$${idx + 1}`);

  if (existing.rows[0]) {
    const updatePairs = allowed.filter(([name]) => name !== 'slug');
    if (updatePairs.length === 0) return existing.rows[0].id;

    const updateColNames = updatePairs.map(([name]) => name);
    const updateValues = updatePairs.map(([_, value]) => value);
    const setClauses = updateColNames.map((c, idx) => `${c} = $${idx + 1}`);

    const updateSql = `
      UPDATE gadgets
      SET ${setClauses.join(', ')}, updated_at = NOW()
      WHERE id = $${updateValues.length + 1}
      RETURNING id
    `;

    const update = await query(updateSql, [...updateValues, existing.rows[0].id]);
    return update.rows[0].id;
  }

  const insertSql = `
    INSERT INTO gadgets (${colNames.join(', ')})
    VALUES (${placeholders.join(', ')})
    RETURNING id
  `;

  const insert = await query(insertSql, colValues);
  return insert.rows[0].id;
}

async function ensureGadgetSpecs(gadgetId, specs = []) {
  let order = 0;
  for (const spec of specs) {
    const exists = await query(
      'SELECT 1 FROM gadget_specs WHERE gadget_id = $1 AND spec_key = $2 AND spec_value = $3 LIMIT 1',
      [gadgetId, spec.label, String(spec.value)],
    );
    if (exists.rows[0]) continue;

    await query(
      `INSERT INTO gadget_specs (gadget_id, spec_group, spec_key, spec_value, display_order)
       VALUES ($1, $2, $3, $4, $5)`,
      [gadgetId, 'general', spec.label, String(spec.value), order],
    );
    order += 1;
  }
}

async function ensureGadgetMedia(gadgetId, images = []) {
  let order = 0;
  for (const imageUrl of images) {
    const exists = await query(
      'SELECT 1 FROM gadget_media WHERE gadget_id = $1 AND file_url = $2 LIMIT 1',
      [gadgetId, imageUrl],
    );
    if (exists.rows[0]) {
      order += 1;
      continue;
    }

    await query(
      `INSERT INTO gadget_media (gadget_id, media_type, file_url, is_primary, display_order)
       VALUES ($1, $2, $3, $4, $5)`,
      [gadgetId, 'image', imageUrl, order === 0, order],
    );
    order += 1;
  }
}

async function ensureReviewMedia(reviewId, photos = []) {
  for (const photoUrl of photos) {
    const exists = await query(
      'SELECT 1 FROM review_media WHERE review_id = $1 AND file_url = $2 LIMIT 1',
      [reviewId, photoUrl],
    );
    if (exists.rows[0]) continue;

    await query(
      'INSERT INTO review_media (review_id, file_url) VALUES ($1, $2)',
      [reviewId, photoUrl],
    );
  }
}

async function ensureReview(review, gadgetId, userId) {
  const exists = await query(
    `SELECT id FROM reviews
     WHERE gadget_id = $1 AND user_id = $2 AND title = $3 AND created_at = $4
     LIMIT 1`,
    [gadgetId, userId, review.title, review.createdAt],
  );
  if (exists.rows[0]) return exists.rows[0].id;

  const insert = await query(
    `INSERT INTO reviews (
      gadget_id,
      user_id,
      rating,
      title,
      review_text,
      upvote_count,
      downvote_count,
      created_at,
      updated_at
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING id`,
    [
      gadgetId,
      userId,
      review.rating || null,
      review.title || null,
      review.content || '',
      review.upvotes || 0,
      review.downvotes || 0,
      review.createdAt || new Date().toISOString(),
      review.updatedAt || new Date().toISOString(),
    ],
  );

  return insert.rows[0].id;
}

async function ensureWishlist(userId, gadgetId) {
  const exists = await query(
    'SELECT 1 FROM saved_gadgets WHERE user_id = $1 AND gadget_id = $2 LIMIT 1',
    [userId, gadgetId],
  );
  if (exists.rows[0]) return;

  await query(
    'INSERT INTO saved_gadgets (user_id, gadget_id) VALUES ($1, $2)',
    [userId, gadgetId],
  );
}

async function seedMockData() {
  const { mockGadgets, mockUsers, mockReviews, mockWishlist } = await loadMockData();
  const userIdMap = new Map();
  const gadgetIdMap = new Map();

  try {
    for (const user of mockUsers || []) {
      const saved = await upsertUser(user);
      userIdMap.set(user.id, saved.id);
      console.log(`Seeded user: ${saved.email} (id=${saved.id})`);
    }

    for (const gadget of mockGadgets || []) {
      const brandId = await getOrCreateBrandId(gadget.brand);
      const categoryId = await getOrCreateCategoryId(gadget.category);
      const gadgetId = await upsertGadget(gadget, brandId, categoryId);
      gadgetIdMap.set(gadget.id, gadgetId);

      await ensureGadgetSpecs(gadgetId, gadget.specs || []);
      await ensureGadgetMedia(gadgetId, gadget.images || []);

      console.log(`Seeded gadget: ${gadget.name} (id=${gadgetId})`);
    }

    for (const review of mockReviews || []) {
      const gadgetId = gadgetIdMap.get(review.gadgetId);
      const userId = userIdMap.get(review.userId);

      if (!gadgetId || !userId) {
        console.warn(`Skip review ${review.id}: missing user/gadget reference.`);
        continue;
      }

      const reviewId = await ensureReview(review, gadgetId, userId);
      await ensureReviewMedia(reviewId, review.photos || []);

      if (review.reportedBy && review.reportedBy.length > 0) {
        for (const reporterMockId of review.reportedBy) {
          const reporterUserId = userIdMap.get(reporterMockId);
          if (!reporterUserId) continue;

          const exists = await query(
            'SELECT 1 FROM review_reports WHERE review_id = $1 AND reporter_user_id = $2 LIMIT 1',
            [reviewId, reporterUserId]
          );
          if (!exists.rows[0]) {
            await query(
              `INSERT INTO review_reports (review_id, user_id, reporter_user_id, reason_code, reason, status)
               VALUES ($1, $2, $3, $4, $5, $6)`,
              [reviewId, reporterUserId, reporterUserId, 'spam', 'Konten ulasan dilaporkan oleh pengguna sebagai tidak pantas atau spam.', review.status || 'pending']
            );
            console.log(`Seeded report on review ${reviewId} by user ${reporterUserId}`);
          }
        }
      }
    }

    for (const item of mockWishlist || []) {
      const gadgetId = gadgetIdMap.get(item.gadgetId);
      const userId = userIdMap.get(item.userId);
      if (!gadgetId || !userId) continue;
      await ensureWishlist(userId, gadgetId);
    }

    console.log('Seed mock data selesai.');
  } catch (error) {
    console.error('Gagal melakukan seed mock data.');
    console.error(error.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

seedMockData();