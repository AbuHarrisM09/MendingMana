const express = require('express');
const gadgetController = require('../controllers/gadgetController');
const upload = require('../middlewares/uploadMiddleware');
const { authenticate, requireRole } = require('../middlewares/authMiddleware');

const router = express.Router();

// Publik: metadata lists (Categories & Brands)
router.get('/categories', gadgetController.getCategories);
router.get('/brands', gadgetController.getBrands);

// Publik: list gadgets
router.get('/', gadgetController.getGadgets);

// Publik: gadget detail
router.get('/:id', gadgetController.getGadgetById);

// Admin: create gadget + upload multi images
router.post(
	'/',
	authenticate,
	requireRole('admin'),
	upload.array('images', 5),
	gadgetController.createGadget,
);

// Admin: update gadget + upload multi images (optional)
router.put(
	'/:id',
	authenticate,
	requireRole('admin'),
	upload.array('images', 5),
	gadgetController.updateGadget,
);

// Admin: delete gadget
router.delete(
	'/:id',
	authenticate,
	requireRole('admin'),
	gadgetController.deleteGadget,
);

module.exports = router;