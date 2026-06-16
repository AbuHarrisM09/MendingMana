const express = require('express');
const gadgetController = require('../controllers/gadgetController');
const upload = require('../middlewares/uploadMiddleware');
const { authenticate, requireRole } = require('../middlewares/authMiddleware');
const { cacheMiddleware, invalidateCache } = require('../middlewares/cacheMiddleware');

const router = express.Router();

// Middleware helper to clear gadget and admin dashboard caches on success
const clearGadgetCache = (req, res, next) => {
	res.on('finish', () => {
		if (res.statusCode >= 200 && res.statusCode < 300) {
			invalidateCache('*gadgets*');
			invalidateCache('*admin/dashboard*');
		}
	});
	next();
};

// Publik: metadata lists (Categories & Brands)
router.get('/categories', cacheMiddleware(3600), gadgetController.getCategories);
router.get('/brands', cacheMiddleware(3600), gadgetController.getBrands);

// Publik: list gadgets (Cache 5 menit)
router.get('/', cacheMiddleware(300), gadgetController.getGadgets);

// Publik: gadget detail (Cache 5 menit)
router.get('/:id', cacheMiddleware(300), gadgetController.getGadgetById);

// Admin: create gadget + upload multi images
router.post(
	'/',
	authenticate,
	requireRole('admin'),
	clearGadgetCache,
	upload.array('images', 5),
	gadgetController.createGadget,
);

// Admin: update gadget + upload multi images (optional)
router.put(
	'/:id',
	authenticate,
	requireRole('admin'),
	clearGadgetCache,
	upload.array('images', 5),
	gadgetController.updateGadget,
);

// Admin: delete gadget
router.delete(
	'/:id',
	authenticate,
	requireRole('admin'),
	clearGadgetCache,
	gadgetController.deleteGadget,
);

module.exports = router;