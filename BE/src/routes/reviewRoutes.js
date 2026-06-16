const express = require('express');
const reviewController = require('../controllers/reviewController');
const { authenticate } = require('../middlewares/authMiddleware');

const router = express.Router();

/**
 * Review Routes
 * 
 * GET    /api/reviews/gadget/:id       → Publik: Ambil semua ulasan untuk sebuah gadget
 * POST   /api/reviews/gadget/:id       → Member: Buat ulasan baru
 * PUT    /api/reviews/:reviewId         → Member: Edit ulasan sendiri
 * DELETE /api/reviews/:reviewId         → Member/Admin: Hapus ulasan
 * POST   /api/reviews/:reviewId/vote    → Member: Vote (upvote/downvote) ulasan
 */

const { invalidateCache } = require('../middlewares/cacheMiddleware');

// Middleware helper to clear gadget and admin dashboard caches on review modifications
const clearReviewCache = (req, res, next) => {
  res.on('finish', () => {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      invalidateCache('*gadgets*');
      invalidateCache('*admin/dashboard*');
    }
  });
  next();
};

// Publik: Lihat ulasan gadget (mendukung opsional auth untuk menandai vote milik user)
router.get('/gadget/:id', optionalAuth, reviewController.getReviewsByGadget);

// Member: Buat ulasan baru
router.post('/gadget/:id', authenticate, clearReviewCache, reviewController.createReview);

// Member: Edit ulasan sendiri
router.put('/:reviewId', authenticate, clearReviewCache, reviewController.updateReview);

// Member/Admin: Hapus ulasan
router.delete('/:reviewId', authenticate, clearReviewCache, reviewController.deleteReview);

// Member: Vote ulasan
router.post('/:reviewId/vote', authenticate, reviewController.voteReview);

/**
 * Middleware opsional: mengisi req.user jika ada token, tapi tidak memblokir jika tidak ada.
 * Digunakan pada endpoint publik yang juga mau menunjukkan data user-specific (e.g. my_vote).
 */
function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization || '';
  if (!authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.replace('Bearer ', '').trim();
  try {
    const jwt = require('jsonwebtoken');
    const env = require('../config/env');
    const payload = jwt.verify(token, env.jwtSecret);
    req.user = payload;
  } catch (err) {
    // Token tidak valid, lanjutkan tanpa user
  }
  next();
}

module.exports = router;
