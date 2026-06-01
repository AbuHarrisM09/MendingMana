const express = require('express');
const wishlistController = require('../controllers/wishlistController');
const { authenticate } = require('../middlewares/authMiddleware');

const router = express.Router();

/**
 * Wishlist Routes — Semua rute membutuhkan autentikasi member.
 * 
 * GET    /api/wishlist                → Ambil seluruh daftar wishlist user
 * POST   /api/wishlist/toggle         → Toggle (tambah/hapus) gadget dari wishlist
 * GET    /api/wishlist/check/:gadgetId → Cek apakah gadget ada di wishlist user
 * DELETE /api/wishlist/:gadgetId       → Hapus gadget dari wishlist secara eksplisit
 */

router.use(authenticate);

router.get('/', wishlistController.getWishlist);
router.post('/toggle', wishlistController.toggleWishlist);
router.get('/check/:gadgetId', wishlistController.checkWishlist);
router.delete('/:gadgetId', wishlistController.removeFromWishlist);

module.exports = router;
