const { pool } = require('../config/db');

exports.getProfile = async (req, res) => {
  const userId = req.user.sub;
  try {
    const userRes = await pool.query(
      `SELECT id, full_name, username, email, role_id, profile_image_url, bio, created_at 
       FROM users WHERE id = $1`,
      [userId]
    );

    if (!userRes.rows.length) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }
    const user = userRes.rows[0];

    const statsRes = await pool.query(
      `SELECT 
        (SELECT COUNT(*) FROM reviews WHERE user_id = $1 AND parent_review_id IS NULL AND is_deleted = false) as total_reviews,
        (SELECT COUNT(*) FROM saved_gadgets WHERE user_id = $1) as total_wishlist
      `, [userId]
    );
    const stats = statsRes.rows[0] || { total_reviews: 0, total_wishlist: 0 };

    res.json({
      user: {
        id: user.id,
        fullName: user.full_name,
        username: user.username,
        email: user.email,
        bio: user.bio,
        profileImageUrl: user.profile_image_url,
        createdAt: user.created_at,
      },
      stats: {
        totalReviews: Number(stats.total_reviews),
        totalWishlist: Number(stats.total_wishlist)
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

exports.getWishlist = async (req, res) => {
  const userId = req.user.sub;
  try {
    const query = `
      SELECT 
        g.id, g.name, g.price, b.name as brand_name, c.name as category_name, sg.created_at as saved_at,
        (SELECT json_agg(file_url) FROM gadget_media gm WHERE gm.gadget_id = g.id AND gm.is_primary = true) as images
      FROM saved_gadgets sg
      JOIN gadgets g ON sg.gadget_id = g.id
      LEFT JOIN brands b ON g.brand_id = b.id
      LEFT JOIN categories c ON g.category_id = c.id
      WHERE sg.user_id = $1
      ORDER BY sg.created_at DESC
    `;
    
    const { rows } = await pool.query(query, [userId]);
    const gadgets = rows.map(r => {
      let coverImage = null;
      if (r.images && r.images.length > 0) {
        coverImage = r.images[0];
        if (!coverImage.startsWith('http')) coverImage = `http://localhost:5000${coverImage}`;
      }
      
      return {
        id: "g-" + r.id, 
        name: r.name,
        brand: r.brand_name,
        category: r.category_name,
        price: Number(r.price),
        savedAt: r.saved_at,
        coverImage
      };
    });

    res.json(gadgets);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

exports.getReviews = async (req, res) => {
  const userId = req.user.sub;
  try {
    const query = `
      SELECT r.id, r.rating, r.title, r.review_text, r.created_at, g.id as gadget_id, g.name as gadget_name
      FROM reviews r
      JOIN gadgets g ON r.gadget_id = g.id
      WHERE r.user_id = $1 AND r.parent_review_id IS NULL AND r.is_deleted = false
      ORDER BY r.created_at DESC
    `;
    const { rows } = await pool.query(query, [userId]);
    const reviews = rows.map(r => ({
      id: r.id,
      gadgetId: "g-" + r.gadget_id,
      gadgetName: r.gadget_name,
      rating: r.rating,
      title: r.title,
      text: r.review_text,
      createdAt: r.created_at
    }));

    res.json(reviews);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};