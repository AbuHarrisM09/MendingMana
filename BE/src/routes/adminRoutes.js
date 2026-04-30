const express = require('express');
const { getDashboard } = require('../controllers/adminDashboardController');
const { authenticate, requireRole } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/dashboard', authenticate, requireRole('admin'), getDashboard);

module.exports = router;
