const { parseGadgetId } = require('../services/dbHelper');
const wishlistModel = require('../models/wishlistModel');

/**
 * POST /api/wishlist/toggle
 * Member: Tambah/hapus gadget dari wishlist (toggle).
 */
exports.toggleWishlist = async (req, res) => {
  try {
    const userId = req.user.sub;
    const gadgetId = parseGadgetId(req.body.gadget_id);

    if (!gadgetId) {
      return res.status(400).json({ message: 'ID gadget tidak valid.' });
    }

    const exists = await wishlistModel.gadgetExists(gadgetId);
    if (!exists) {
      return res.status(404).json({ message: 'Gadget tidak ditemukan.' });
    }

    const saved = await wishlistModel.findSavedGadget(userId, gadgetId);

    if (saved) {
      await wishlistModel.removeFromWishlist(userId, gadgetId);
      return res.json({ message: 'Gadget dihapus dari wishlist.', saved: false });
    }

    await wishlistModel.addToWishlist(userId, gadgetId);
    res.status(201).json({ message: 'Gadget ditambahkan ke wishlist.', saved: true });
  } catch (err) {
    console.error('toggleWishlist error:', err);
    res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
  }
};

/**
 * GET /api/wishlist/check/:gadgetId
 * Member: Cek apakah gadget tertentu ada di wishlist user.
 */
exports.checkWishlist = async (req, res) => {
  try {
    const userId = req.user.sub;
    const gadgetId = parseGadgetId(req.params.gadgetId);

    if (!gadgetId) {
      return res.status(400).json({ message: 'ID gadget tidak valid.' });
    }

    const saved = await wishlistModel.findSavedGadget(userId, gadgetId);
    res.json({ saved: !!saved });
  } catch (err) {
    console.error('checkWishlist error:', err);
    res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
  }
};

/**
 * GET /api/wishlist
 * Member: Ambil seluruh daftar wishlist user saat ini.
 */
exports.getWishlist = async (req, res) => {
  try {
    const userId = req.user.sub;
    const rows = await wishlistModel.findWishlistByUser(userId);

    const gadgets = rows.map(r => {
      let coverImage = null;
      if (r.images && r.images.length > 0) {
        coverImage = r.images[0];
        if (!coverImage.startsWith('http') && !coverImage.startsWith('data:')) {
          coverImage = `http://localhost:5000${coverImage}`;
        }
      }

      return {
        id: `g-${r.id}`,
        name: r.name,
        brand: r.brand_name,
        category: r.category_name,
        price: Number(r.price),
        averageRating: Number(r.average_rating || 0),
        totalReviews: Number(r.total_reviews || 0),
        savedAt: r.saved_at,
        coverImage,
      };
    });

    res.json(gadgets);
  } catch (err) {
    console.error('getWishlist error:', err);
    res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
  }
};

/**
 * DELETE /api/wishlist/:gadgetId
 * Member: Hapus gadget spesifik dari wishlist.
 */
exports.removeFromWishlist = async (req, res) => {
  try {
    const userId = req.user.sub;
    const gadgetId = parseGadgetId(req.params.gadgetId);

    if (!gadgetId) {
      return res.status(400).json({ message: 'ID gadget tidak valid.' });
    }

    const removed = await wishlistModel.removeFromWishlist(userId, gadgetId);
    if (!removed) {
      return res.status(404).json({ message: 'Gadget tidak ada di wishlist.' });
    }

    res.json({ message: 'Gadget berhasil dihapus dari wishlist.' });
  } catch (err) {
    console.error('removeFromWishlist error:', err);
    res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
  }
};
