const express = require('express');
const userController = require('../controllers/userController');
const { authenticate } = require('../middlewares/authMiddleware');

const router = express.Router();

// Semua rute user butuh login
router.use(authenticate);

router.get('/profile', userController.getProfile);
router.get('/wishlist', userController.getWishlist);
router.get('/reviews', userController.getReviews);

module.exports = router;