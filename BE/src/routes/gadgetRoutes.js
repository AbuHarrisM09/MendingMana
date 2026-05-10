const express = require('express');
const gadgetController = require('../controllers/gadgetController');
const upload = require('../middlewares/uploadMiddleware');
const { authenticate, requireRole } = require('../middlewares/authMiddleware');

const router = express.Router();

// Publik: list gadgets
router.get('/', gadgetController.getGadgets);

// Admin: create gadget + upload multi images
router.post(
	'/',
	authenticate,
	requireRole('admin'),
	upload.array('images', 5),
	gadgetController.createGadget,
);

module.exports = router;