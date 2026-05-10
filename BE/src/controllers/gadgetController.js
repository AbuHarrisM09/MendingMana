const { pool } = require('../config/db');

async function getGadgetsColumns(client) {
  const result = await client.query(
    `SELECT column_name
     FROM information_schema.columns
     WHERE table_schema = 'public' AND table_name = 'gadgets'`,
  );
  return new Set(result.rows.map((r) => r.column_name));
}

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
    const gadgets = rows.map(r => ({
      id: "g-" + r.id, // match frontend convention for now
      name: r.name,
      brand: r.brand_name,
      category: r.category_name,
      price: Number(r.price),
      images: r.images ? r.images.map(img => img.startsWith('http') ? img : `http://localhost:5000${img}`) : [],
      description: r.description,
      releaseDate: r.release_date,
      averageRating: Number(r.average_rating),
      totalReviews: Number(r.total_reviews),
      isNew: true, // simplified
      isTrending: true // simplified
    }));

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

    // 3. Insert images
    if (files && files.length > 0) {
      for (const file of files) {
        // file_url diakses di frontend menggunakan path /uploads/...
        const fileUrl = `/uploads/${file.filename}`;
        
        await client.query(
          `INSERT INTO gadget_media (gadget_id, media_type, file_url, is_primary) VALUES ($1, $2, $3, $4)`,
          [newGadget.id, 'image', fileUrl, true]
        );
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