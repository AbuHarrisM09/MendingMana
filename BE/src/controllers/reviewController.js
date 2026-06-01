const { parseGadgetId } = require('../services/dbHelper');
const reviewModel = require('../models/reviewModel');

/**
 * GET /api/reviews/gadget/:id
 * Publik: Ambil semua ulasan top-level untuk sebuah gadget.
 */
exports.getReviewsByGadget = async (req, res) => {
  try {
    const gadgetId = parseGadgetId(req.params.id);
    if (!gadgetId) {
      return res.status(400).json({ message: 'ID gadget tidak valid' });
    }

    const currentUserId = req.user?.sub || null;
    const rows = await reviewModel.findReviewsByGadget(gadgetId, currentUserId);

    const reviews = rows.map(r => ({
      id: r.id,
      userId: r.user_id,
      userName: r.user_name,
      userAvatar: r.user_avatar,
      rating: r.rating,
      title: r.title,
      text: r.review_text,
      upvotes: r.upvote_count,
      downvotes: r.downvote_count,
      isEdited: r.is_edited,
      myVote: r.my_vote || null,
      media: r.media || [],
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    }));

    res.json(reviews);
  } catch (err) {
    console.error('getReviewsByGadget error:', err);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

/**
 * POST /api/reviews/gadget/:id
 * Member: Membuat ulasan baru untuk sebuah gadget.
 */
exports.createReview = async (req, res) => {
  try {
    const gadgetId = parseGadgetId(req.params.id);
    if (!gadgetId) {
      return res.status(400).json({ message: 'ID gadget tidak valid' });
    }

    const userId = req.user.sub;
    const { rating, title, review_text } = req.body;

    // Validasi input
    if (!rating || !review_text) {
      return res.status(400).json({ message: 'Rating dan teks ulasan wajib diisi.' });
    }

    const ratingNum = Number(rating);
    if (ratingNum < 1 || ratingNum > 5 || !Number.isInteger(ratingNum)) {
      return res.status(400).json({ message: 'Rating harus bernilai integer antara 1 sampai 5.' });
    }

    if (review_text.trim().length < 10) {
      return res.status(400).json({ message: 'Teks ulasan minimal 10 karakter.' });
    }

    // Validasi bisnis
    const exists = await reviewModel.gadgetExists(gadgetId);
    if (!exists) {
      return res.status(404).json({ message: 'Gadget tidak ditemukan' });
    }

    const duplicate = await reviewModel.findExistingReview(gadgetId, userId);
    if (duplicate) {
      return res.status(409).json({ message: 'Anda sudah pernah mengulas gadget ini. Silakan edit ulasan Anda.' });
    }

    // Simpan
    const review = await reviewModel.insertReview({
      gadgetId,
      userId,
      rating: ratingNum,
      title: title?.trim() || null,
      reviewText: review_text.trim(),
    });

    const userName = await reviewModel.getUserName(userId);

    res.status(201).json({
      message: 'Ulasan berhasil ditambahkan.',
      review: {
        id: review.id,
        gadgetId: `g-${gadgetId}`,
        userId: review.user_id,
        userName: userName || 'Pengguna',
        rating: review.rating,
        title: review.title,
        text: review.review_text,
        createdAt: review.created_at,
      },
    });
  } catch (err) {
    console.error('createReview error:', err);
    res.status(500).json({ message: 'Terjadi kesalahan saat menyimpan ulasan.' });
  }
};

/**
 * PUT /api/reviews/:reviewId
 * Member: Edit ulasan sendiri.
 */
exports.updateReview = async (req, res) => {
  try {
    const reviewId = Number(req.params.reviewId);
    if (!reviewId || Number.isNaN(reviewId)) {
      return res.status(400).json({ message: 'ID ulasan tidak valid' });
    }

    const userId = req.user.sub;

    const existing = await reviewModel.findReviewById(reviewId);
    if (!existing) {
      return res.status(404).json({ message: 'Ulasan tidak ditemukan' });
    }
    if (existing.user_id !== userId) {
      return res.status(403).json({ message: 'Anda tidak memiliki izin untuk mengedit ulasan ini.' });
    }

    const { rating, title, review_text } = req.body;

    // Validasi opsional
    if (rating !== undefined) {
      const ratingNum = Number(rating);
      if (ratingNum < 1 || ratingNum > 5 || !Number.isInteger(ratingNum)) {
        return res.status(400).json({ message: 'Rating harus bernilai integer antara 1 sampai 5.' });
      }
    }
    if (review_text !== undefined && review_text.trim().length < 10) {
      return res.status(400).json({ message: 'Teks ulasan minimal 10 karakter.' });
    }

    const fields = {};
    if (rating !== undefined) fields.rating = Number(rating);
    if (title !== undefined) fields.title = title?.trim() || null;
    if (review_text !== undefined) fields.review_text = review_text.trim();

    if (Object.keys(fields).length === 0) {
      return res.status(400).json({ message: 'Tidak ada data yang diubah.' });
    }

    const updated = await reviewModel.updateReview(reviewId, fields);

    res.json({
      message: 'Ulasan berhasil diperbarui.',
      review: {
        id: updated.id,
        rating: updated.rating,
        title: updated.title,
        text: updated.review_text,
        isEdited: updated.is_edited,
        updatedAt: updated.updated_at,
      },
    });
  } catch (err) {
    console.error('updateReview error:', err);
    res.status(500).json({ message: 'Terjadi kesalahan saat memperbarui ulasan.' });
  }
};

/**
 * DELETE /api/reviews/:reviewId
 * Member: Soft-delete ulasan sendiri. Admin bisa hapus ulasan siapa pun.
 */
exports.deleteReview = async (req, res) => {
  try {
    const reviewId = Number(req.params.reviewId);
    if (!reviewId || Number.isNaN(reviewId)) {
      return res.status(400).json({ message: 'ID ulasan tidak valid' });
    }

    const userId = req.user.sub;

    const existing = await reviewModel.findReviewById(reviewId);
    if (!existing) {
      return res.status(404).json({ message: 'Ulasan tidak ditemukan' });
    }
    if (existing.user_id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Anda tidak memiliki izin untuk menghapus ulasan ini.' });
    }

    await reviewModel.softDeleteReview(reviewId);
    res.json({ message: 'Ulasan berhasil dihapus.' });
  } catch (err) {
    console.error('deleteReview error:', err);
    res.status(500).json({ message: 'Terjadi kesalahan saat menghapus ulasan.' });
  }
};

/**
 * POST /api/reviews/:reviewId/vote
 * Member: Vote (upvote/downvote) sebuah ulasan. Toggle off jika vote sama.
 */
exports.voteReview = async (req, res) => {
  try {
    const reviewId = Number(req.params.reviewId);
    if (!reviewId || Number.isNaN(reviewId)) {
      return res.status(400).json({ message: 'ID ulasan tidak valid' });
    }

    const userId = req.user.sub;
    const { vote_type } = req.body;

    if (vote_type !== 1 && vote_type !== -1) {
      return res.status(400).json({ message: 'vote_type harus 1 (upvote) atau -1 (downvote).' });
    }

    const existing = await reviewModel.findReviewById(reviewId);
    if (!existing) {
      return res.status(404).json({ message: 'Ulasan tidak ditemukan' });
    }
    if (existing.user_id === userId) {
      return res.status(400).json({ message: 'Anda tidak bisa vote ulasan Anda sendiri.' });
    }

    const result = await reviewModel.processVote(reviewId, userId, vote_type);

    res.json({
      message: result.action === 'removed' ? 'Vote dihapus.' : 'Vote berhasil disimpan.',
      action: result.action,
      upvotes: result.upvotes,
      downvotes: result.downvotes,
    });
  } catch (err) {
    console.error('voteReview error:', err);
    res.status(500).json({ message: 'Terjadi kesalahan saat memproses vote.' });
  }
};
