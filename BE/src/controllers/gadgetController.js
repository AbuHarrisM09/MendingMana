const path = require('path');
const fs = require('fs').promises;
const { pool } = require('../config/db');

const { formatGadgetRow, parseGadgetId, getGadgetsColumns } = require('../services/dbHelper');

// Get all gadgets
exports.getGadgets = async (req, res) => {
  try {
    const query = `
      SELECT 
        g.*,
        b.name as brand_name,
        c.name as category_name,
        (
          SELECT json_agg(file_url)
          FROM gadget_media gm
          WHERE gm.gadget_id = g.id
        ) as images
      FROM gadgets g
      LEFT JOIN brands b ON g.brand_id = b.id
      LEFT JOIN categories c ON g.category_id = c.id
      ORDER BY g.created_at DESC
    `;
    const { rows } = await pool.query(query);
    
    // Format response to match frontend model
    const gadgets = rows.map(formatGadgetRow);

    res.status(200).json(gadgets);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

// Create new gadget (with images)
exports.createGadget = async (req, res) => {
  const client = await pool.connect();
  try {
    // 1. Ambil data teks dari form
    const { name, brand_id, category_id, model, price, description, status } = req.body;
    const files = req.files; // dari multer

    await client.query('BEGIN');

    const gadgetColumns = await getGadgetsColumns(client);

    // Jika skema DB punya kolom text brand/category yang wajib, isi dari tabel relasi
    let brandName = null;
    let categoryName = null;
    if (gadgetColumns.has('brand')) {
      const brandRes = await client.query('SELECT name FROM brands WHERE id = $1 LIMIT 1', [brand_id]);
      brandName = brandRes.rows[0]?.name || null;
    }
    if (gadgetColumns.has('category')) {
      const categoryRes = await client.query('SELECT name FROM categories WHERE id = $1 LIMIT 1', [category_id]);
      categoryName = categoryRes.rows[0]?.name || null;
    }

    // Buat slug
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now();

    // 2. Insert gadget (adaptif terhadap kolom yang ada)
    const columns = ['category_id', 'brand_id', 'name', 'slug', 'model', 'price', 'description', 'status'];
    const values = [category_id, brand_id, name, slug, model || null, price || null, description || null, status || 'published'];

    if (gadgetColumns.has('brand')) {
      columns.push('brand');
      values.push(brandName);
    }
    if (gadgetColumns.has('category')) {
      columns.push('category');
      values.push(categoryName);
    }

    const placeholders = values.map((_, idx) => `$${idx + 1}`).join(', ');
    const insertGadgetQ = `
      INSERT INTO gadgets (${columns.join(', ')})
      VALUES (${placeholders})
      RETURNING *;
    `;

    const gadgetValues = values;
    const gadgetRes = await client.query(insertGadgetQ, gadgetValues);
    const newGadget = gadgetRes.rows[0];

    // 3. Insert images (as Base64 Data URL)
    if (files && files.length > 0) {
      for (const file of files) {
        const fileUrl = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
        
        await client.query(
          `INSERT INTO gadget_media (gadget_id, media_type, file_url, is_primary) VALUES ($1, $2, $3, $4)`,
          [newGadget.id, 'image', fileUrl, true]
        );
      }
    }

    // 4. Insert specs
    const { specs } = req.body;
    if (specs) {
      let specsArray = [];
      try {
        specsArray = typeof specs === 'string' ? JSON.parse(specs) : specs;
      } catch (err) {
        console.error('Format specs tidak valid di createGadget:', err);
      }

      if (Array.isArray(specsArray)) {
        for (let i = 0; i < specsArray.length; i++) {
          const spec = specsArray[i];
          if (spec.spec_key && spec.spec_value) {
            await client.query(
              `INSERT INTO gadget_specs (gadget_id, spec_group, spec_key, spec_value, display_order)
               VALUES ($1, $2, $3, $4, $5)`,
              [newGadget.id, spec.spec_group || 'Umum', spec.spec_key, spec.spec_value, spec.display_order || i]
            );
          }
        }
      }
    }

    await client.query('COMMIT');
    res.status(201).json({ message: 'Gadget berhasil ditambahkan', gadget: newGadget });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ message: 'Gagal menambahkan gadget' });
  } finally {
    client.release();
  }
};

// Get gadget detail by id
exports.getGadgetById = async (req, res) => {
  try {
    const gadgetId = parseGadgetId(req.params.id);
    if (!gadgetId) {
      return res.status(400).json({ message: 'ID gadget tidak valid' });
    }

    const query = `
      SELECT 
        g.*,
        b.name as brand_name,
        c.name as category_name,
        (
          SELECT json_agg(file_url)
          FROM gadget_media gm
          WHERE gm.gadget_id = g.id
        ) as images
      FROM gadgets g
      LEFT JOIN brands b ON g.brand_id = b.id
      LEFT JOIN categories c ON g.category_id = c.id
      WHERE g.id = $1
      LIMIT 1
    `;

    const { rows } = await pool.query(query, [gadgetId]);
    if (!rows.length) {
      return res.status(404).json({ message: 'Gadget tidak ditemukan' });
    }

    const specsQuery = `
      SELECT spec_group, spec_key, spec_value, value_type, display_order
      FROM gadget_specs
      WHERE gadget_id = $1
      ORDER BY display_order ASC, spec_key ASC
    `;
    const specsResult = await pool.query(specsQuery, [gadgetId]);

    const gadget = formatGadgetRow(rows[0]);
    gadget.specs = specsResult.rows;

    res.status(200).json(gadget);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

// Update existing gadget (with optional images and specs)
exports.updateGadget = async (req, res) => {
  const client = await pool.connect();
  try {
    const gadgetId = parseGadgetId(req.params.id);
    if (!gadgetId) {
      return res.status(400).json({ message: 'ID gadget tidak valid' });
    }

    const { name, brand_id, category_id, model, price, description, status, specs } = req.body;
    const files = req.files; // dari multer

    // Cek apakah gadget ada
    const existRes = await client.query('SELECT * FROM gadgets WHERE id = $1 LIMIT 1', [gadgetId]);
    if (existRes.rows.length === 0) {
      return res.status(404).json({ message: 'Gadget tidak ditemukan' });
    }
    const currentGadget = existRes.rows[0];

    await client.query('BEGIN');

    const gadgetColumns = await getGadgetsColumns(client);

    // Ambil data brand/category name jika kolomnya ada di DB
    let brandName = null;
    let categoryName = null;
    if (gadgetColumns.has('brand') && brand_id) {
      const brandRes = await client.query('SELECT name FROM brands WHERE id = $1 LIMIT 1', [brand_id]);
      brandName = brandRes.rows[0]?.name || null;
    }
    if (gadgetColumns.has('category') && category_id) {
      const categoryRes = await client.query('SELECT name FROM categories WHERE id = $1 LIMIT 1', [category_id]);
      categoryName = categoryRes.rows[0]?.name || null;
    }

    // Build update query secara dinamis
    const updateFields = [];
    const updateValues = [];
    let paramIndex = 1;

    if (category_id !== undefined) {
      updateFields.push(`category_id = $${paramIndex++}`);
      updateValues.push(category_id);
    }
    if (brand_id !== undefined) {
      updateFields.push(`brand_id = $${paramIndex++}`);
      updateValues.push(brand_id);
    }
    if (name !== undefined) {
      updateFields.push(`name = $${paramIndex++}`);
      updateValues.push(name);
      
      // Update slug juga
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now();
      updateFields.push(`slug = $${paramIndex++}`);
      updateValues.push(slug);
    }
    if (model !== undefined) {
      updateFields.push(`model = $${paramIndex++}`);
      updateValues.push(model || null);
    }
    if (price !== undefined) {
      updateFields.push(`price = $${paramIndex++}`);
      updateValues.push(price || null);
    }
    if (description !== undefined) {
      updateFields.push(`description = $${paramIndex++}`);
      updateValues.push(description || null);
    }
    if (status !== undefined) {
      updateFields.push(`status = $${paramIndex++}`);
      updateValues.push(status);
    }

    if (gadgetColumns.has('brand') && brand_id !== undefined) {
      updateFields.push(`brand = $${paramIndex++}`);
      updateValues.push(brandName);
    }
    if (gadgetColumns.has('category') && category_id !== undefined) {
      updateFields.push(`category = $${paramIndex++}`);
      updateValues.push(categoryName);
    }

    let updatedGadget = currentGadget;
    if (updateFields.length > 0) {
      updateValues.push(gadgetId);
      const updateGadgetQ = `
        UPDATE gadgets
        SET ${updateFields.join(', ')}, updated_at = NOW()
        WHERE id = $${paramIndex}
        RETURNING *;
      `;
      const updateRes = await client.query(updateGadgetQ, updateValues);
      updatedGadget = updateRes.rows[0];
    }

    // Pembaruan Gambar
    if (files && files.length > 0) {
      // 1. Ambil list gambar lama untuk dihapus dari disk (jika bukan Base64)
      const oldMediaRes = await client.query('SELECT file_url FROM gadget_media WHERE gadget_id = $1', [gadgetId]);
      for (const media of oldMediaRes.rows) {
        if (media.file_url && !media.file_url.startsWith('data:')) {
          const filename = media.file_url.replace(/^\/uploads\//, '');
          const filePath = path.join(__dirname, '..', '..', 'public', 'uploads', filename);
          try {
            await fs.unlink(filePath);
          } catch (unlinkErr) {
            console.warn(`Gagal menghapus file ${filePath}:`, unlinkErr.message);
          }
        }
      }

      // 2. Hapus relasi gambar lama dari DB
      await client.query('DELETE FROM gadget_media WHERE gadget_id = $1', [gadgetId]);

      // 3. Masukkan gambar baru (as Base64 Data URL)
      for (const file of files) {
        const fileUrl = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
        await client.query(
          `INSERT INTO gadget_media (gadget_id, media_type, file_url, is_primary) VALUES ($1, $2, $3, $4)`,
          [gadgetId, 'image', fileUrl, true]
        );
      }
    }

    // Pembaruan Spesifikasi
    if (specs !== undefined) {
      let specsArray = [];
      try {
        specsArray = typeof specs === 'string' ? JSON.parse(specs) : specs;
      } catch (err) {
        console.error('Format specs tidak valid:', err);
      }

      if (Array.isArray(specsArray)) {
        // Hapus spesifikasi lama
        await client.query('DELETE FROM gadget_specs WHERE gadget_id = $1', [gadgetId]);

        // Masukkan spesifikasi baru
        for (let i = 0; i < specsArray.length; i++) {
          const spec = specsArray[i];
          if (spec.spec_key && spec.spec_value) {
            await client.query(
              `INSERT INTO gadget_specs (gadget_id, spec_group, spec_key, spec_value, display_order)
               VALUES ($1, $2, $3, $4, $5)`,
              [gadgetId, spec.spec_group || 'Umum', spec.spec_key, spec.spec_value, spec.display_order || i]
            );
          }
        }
      }
    }

    await client.query('COMMIT');
    res.status(200).json({ message: 'Gadget berhasil diperbarui', gadget: updatedGadget });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ message: 'Gagal memperbarui gadget' });
  } finally {
    client.release();
  }
};

// Delete existing gadget (with media file unlinking)
exports.deleteGadget = async (req, res) => {
  const client = await pool.connect();
  try {
    const gadgetId = parseGadgetId(req.params.id);
    if (!gadgetId) {
      return res.status(400).json({ message: 'ID gadget tidak valid' });
    }

    // Cek apakah gadget ada
    const existRes = await client.query('SELECT * FROM gadgets WHERE id = $1 LIMIT 1', [gadgetId]);
    if (existRes.rows.length === 0) {
      return res.status(404).json({ message: 'Gadget tidak ditemukan' });
    }

    await client.query('BEGIN');

    // 1. Ambil list gambar untuk dihapus dari disk (jika bukan Base64)
    const mediaRes = await client.query('SELECT file_url FROM gadget_media WHERE gadget_id = $1', [gadgetId]);
    for (const media of mediaRes.rows) {
      if (media.file_url && !media.file_url.startsWith('data:')) {
        const filename = media.file_url.replace(/^\/uploads\//, '');
        const filePath = path.join(__dirname, '..', '..', 'public', 'uploads', filename);
        try {
          await fs.unlink(filePath);
        } catch (unlinkErr) {
          console.warn(`Gagal menghapus file ${filePath}:`, unlinkErr.message);
        }
      }
    }

    // 2. Hapus gadget utama dari DB (media & specs terhapus otomatis karena ON DELETE CASCADE)
    await client.query('DELETE FROM gadgets WHERE id = $1', [gadgetId]);

    await client.query('COMMIT');
    res.status(200).json({ message: 'Gadget berhasil dihapus' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ message: 'Gagal menghapus gadget' });
  } finally {
    client.release();
  }
};

// Get all categories
exports.getCategories = async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM categories ORDER BY name ASC');
    res.status(200).json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal mengambil kategori' });
  }
};

// Get all brands
exports.getBrands = async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM brands ORDER BY name ASC');
    res.status(200).json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal mengambil brand' });
  }
};