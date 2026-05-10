const path = require('path');
const { pathToFileURL } = require('url');
const bcrypt = require('bcrypt');
const { query, pool } = require('../config/db');

const SALT_ROUNDS = 10;

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
  const slug = `${slugify(gadget.name)}-${slugify(gadget.brand)}`;

  const sql = `
    INSERT INTO gadgets (
      category_id,
      brand_id,
      name,
      slug,
      model,
      price,
      release_date,
      description,
      average_rating,
      total_reviews,
      status
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    ON CONFLICT (slug)
    DO UPDATE SET
      category_id = EXCLUDED.category_id,
      brand_id = EXCLUDED.brand_id,
      name = EXCLUDED.name,
      model = EXCLUDED.model,
      price = EXCLUDED.price,
      release_date = EXCLUDED.release_date,
      description = EXCLUDED.description,
      average_rating = EXCLUDED.average_rating,
      total_reviews = EXCLUDED.total_reviews,
      status = EXCLUDED.status,
      updated_at = NOW()
    RETURNING id
  `;

  const values = [
    categoryId,
    brandId,
    gadget.name,
    slug,
    gadget.model || null,
    gadget.price || null,
    gadget.releaseDate || null,
    gadget.description || null,
    gadget.averageRating || 0,
    gadget.totalReviews || 0,
    'published',
  ];

  const result = await query(sql, values);
  return result.rows[0].id;
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
  await query(
    'INSERT INTO saved_gadgets (user_id, gadget_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
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