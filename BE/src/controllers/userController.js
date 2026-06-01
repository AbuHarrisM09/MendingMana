const profileModel = require('../models/profileModel');

exports.getProfile = async (req, res) => {
  const userId = req.user.sub;
  try {
    const user = await profileModel.findUserProfileById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    const stats = await profileModel.getUserStats(userId);

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
        totalWishlist: Number(stats.total_wishlist),
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

exports.getWishlist = async (req, res) => {
  const userId = req.user.sub;
  try {
    const rows = await profileModel.findWishlistByUser(userId);

    const gadgets = rows.map(r => {
      let coverImage = null;
      if (r.images && r.images.length > 0) {
        coverImage = r.images[0];
        if (!coverImage.startsWith('http')) coverImage = `http://localhost:5000${coverImage}`;
      }

      return {
        id: 'g-' + r.id,
        name: r.name,
        brand: r.brand_name,
        category: r.category_name,
        price: Number(r.price),
        savedAt: r.saved_at,
        coverImage,
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
    const rows = await profileModel.findReviewsByUser(userId);

    const reviews = rows.map(r => ({
      id: r.id,
      gadgetId: 'g-' + r.gadget_id,
      gadgetName: r.gadget_name,
      rating: r.rating,
      title: r.title,
      text: r.review_text,
      createdAt: r.created_at,
    }));

    res.json(reviews);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};