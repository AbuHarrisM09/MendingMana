const path = require('path');
const fs = require('fs').promises;
const { pool } = require('../config/db');
const { formatGadgetRow, parseGadgetId } = require('../services/dbHelper');
const gadgetModel = require('../models/gadgetModel');

// ─── GET ALL GADGETS ─────────────────────────────────────────────────

exports.getGadgets = async (req, res) => {
  try {
    const rows = await gadgetModel.findAllGadgets();
    const gadgets = rows.map(formatGadgetRow);
    res.status(200).json(gadgets);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

// ─── GET GADGET DETAIL ───────────────────────────────────────────────

exports.getGadgetById = async (req, res) => {
  try {
    const gadgetId = parseGadgetId(req.params.id);
    if (!gadgetId) {
      return res.status(400).json({ message: 'ID gadget tidak valid' });
    }

    const row = await gadgetModel.findGadgetById(gadgetId);
    if (!row) {
      return res.status(404).json({ message: 'Gadget tidak ditemukan' });
    }

    const specs = await gadgetModel.findSpecsByGadgetId(gadgetId);
    const gadget = formatGadgetRow(row);
    gadget.specs = specs;

    res.status(200).json(gadget);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

// ─── CREATE GADGET ───────────────────────────────────────────────────

exports.createGadget = async (req, res) => {
  const client = await pool.connect();
  try {
    const { name, brand_id, category_id, model, price, description, status } = req.body;
    const files = req.files;

    await client.query('BEGIN');

    const gadgetColumns = await gadgetModel.getGadgetsColumns(client);

    // Resolve brand/category name jika kolomnya ada
    let brandName = null;
    let categoryName = null;
    if (gadgetColumns.has('brand')) {
      brandName = await gadgetModel.findBrandNameById(client, brand_id);
    }
    if (gadgetColumns.has('category')) {
      categoryName = await gadgetModel.findCategoryNameById(client, category_id);
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now();

    // Build kolom dan values secara dinamis
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

    const newGadget = await gadgetModel.insertGadget(client, { columns, values });

    // Insert images (Base64)
    if (files && files.length > 0) {
      for (const file of files) {
        const fileUrl = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
        await gadgetModel.insertMedia(client, {
          gadgetId: newGadget.id,
          mediaType: 'image',
          fileUrl,
          isPrimary: true,
        });
      }
    }

    // Insert specs
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
            await gadgetModel.insertSpec(client, {
              gadgetId: newGadget.id,
              specGroup: spec.spec_group || 'Umum',
              specKey: spec.spec_key,
              specValue: spec.spec_value,
              displayOrder: spec.display_order || i,
            });
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

// ─── UPDATE GADGET ───────────────────────────────────────────────────

exports.updateGadget = async (req, res) => {
  const client = await pool.connect();
  try {
    const gadgetId = parseGadgetId(req.params.id);
    if (!gadgetId) {
      return res.status(400).json({ message: 'ID gadget tidak valid' });
    }

    const { name, brand_id, category_id, model, price, description, status, specs } = req.body;
    const files = req.files;

    const currentGadget = await gadgetModel.gadgetExistsRaw(client, gadgetId);
    if (!currentGadget) {
      return res.status(404).json({ message: 'Gadget tidak ditemukan' });
    }

    await client.query('BEGIN');

    const gadgetColumns = await gadgetModel.getGadgetsColumns(client);

    let brandName = null;
    let categoryName = null;
    if (gadgetColumns.has('brand') && brand_id) {
      brandName = await gadgetModel.findBrandNameById(client, brand_id);
    }
    if (gadgetColumns.has('category') && category_id) {
      categoryName = await gadgetModel.findCategoryNameById(client, category_id);
    }

    // Build dynamic SET clauses
    const updateFields = [];
    const updateValues = [];
    let paramIndex = 1;

    if (category_id !== undefined) { updateFields.push(`category_id = $${paramIndex++}`); updateValues.push(category_id); }
    if (brand_id !== undefined) { updateFields.push(`brand_id = $${paramIndex++}`); updateValues.push(brand_id); }
    if (name !== undefined) {
      updateFields.push(`name = $${paramIndex++}`); updateValues.push(name);
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now();
      updateFields.push(`slug = $${paramIndex++}`); updateValues.push(slug);
    }
    if (model !== undefined) { updateFields.push(`model = $${paramIndex++}`); updateValues.push(model || null); }
    if (price !== undefined) { updateFields.push(`price = $${paramIndex++}`); updateValues.push(price || null); }
    if (description !== undefined) { updateFields.push(`description = $${paramIndex++}`); updateValues.push(description || null); }
    if (status !== undefined) { updateFields.push(`status = $${paramIndex++}`); updateValues.push(status); }

    if (gadgetColumns.has('brand') && brand_id !== undefined) {
      updateFields.push(`brand = $${paramIndex++}`); updateValues.push(brandName);
    }
    if (gadgetColumns.has('category') && category_id !== undefined) {
      updateFields.push(`category = $${paramIndex++}`); updateValues.push(categoryName);
    }

    let updatedGadget = currentGadget;
    if (updateFields.length > 0) {
      updatedGadget = await gadgetModel.updateGadget(client, gadgetId, updateFields, updateValues);
    }

    // Update images
    if (files && files.length > 0) {
      const oldMedia = await gadgetModel.findMediaByGadgetId(client, gadgetId);
      for (const media of oldMedia) {
        if (media.file_url && !media.file_url.startsWith('data:')) {
          const filename = media.file_url.replace(/^\/uploads\//, '');
          const filePath = path.join(__dirname, '..', '..', 'public', 'uploads', filename);
          try { await fs.unlink(filePath); } catch (e) { console.warn(`Gagal menghapus file ${filePath}:`, e.message); }
        }
      }

      await gadgetModel.deleteMediaByGadgetId(client, gadgetId);

      for (const file of files) {
        const fileUrl = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
        await gadgetModel.insertMedia(client, {
          gadgetId, mediaType: 'image', fileUrl, isPrimary: true,
        });
      }
    }

    // Update specs
    if (specs !== undefined) {
      let specsArray = [];
      try { specsArray = typeof specs === 'string' ? JSON.parse(specs) : specs; }
      catch (err) { console.error('Format specs tidak valid:', err); }

      if (Array.isArray(specsArray)) {
        await gadgetModel.deleteSpecsByGadgetId(client, gadgetId);
        for (let i = 0; i < specsArray.length; i++) {
          const spec = specsArray[i];
          if (spec.spec_key && spec.spec_value) {
            await gadgetModel.insertSpec(client, {
              gadgetId,
              specGroup: spec.spec_group || 'Umum',
              specKey: spec.spec_key,
              specValue: spec.spec_value,
              displayOrder: spec.display_order || i,
            });
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

// ─── DELETE GADGET ───────────────────────────────────────────────────

exports.deleteGadget = async (req, res) => {
  const client = await pool.connect();
  try {
    const gadgetId = parseGadgetId(req.params.id);
    if (!gadgetId) {
      return res.status(400).json({ message: 'ID gadget tidak valid' });
    }

    const existing = await gadgetModel.gadgetExistsRaw(client, gadgetId);
    if (!existing) {
      return res.status(404).json({ message: 'Gadget tidak ditemukan' });
    }

    await client.query('BEGIN');

    // Hapus file disk jika bukan Base64
    const media = await gadgetModel.findMediaByGadgetId(client, gadgetId);
    for (const m of media) {
      if (m.file_url && !m.file_url.startsWith('data:')) {
        const filename = m.file_url.replace(/^\/uploads\//, '');
        const filePath = path.join(__dirname, '..', '..', 'public', 'uploads', filename);
        try { await fs.unlink(filePath); } catch (e) { console.warn(`Gagal menghapus file ${filePath}:`, e.message); }
      }
    }

    await gadgetModel.deleteGadget(client, gadgetId);

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

// ─── METADATA ────────────────────────────────────────────────────────

exports.getCategories = async (req, res) => {
  try {
    const rows = await gadgetModel.findAllCategories();
    res.status(200).json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal mengambil kategori' });
  }
};

exports.getBrands = async (req, res) => {
  try {
    const rows = await gadgetModel.findAllBrands();
    res.status(200).json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal mengambil brand' });
  }
};