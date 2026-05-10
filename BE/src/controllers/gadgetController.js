const { pool } = require('../config/db');

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

    // Buat slug
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now();

    // 2. Insert gadget
    const insertGadgetQ = `
      INSERT INTO gadgets (category_id, brand_id, name, slug, model, price, description, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *;
    `;
    const gadgetValues = [category_id, brand_id, name, slug, model, price, description, status || 'published'];
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