const express = require('express');
const { getDashboard } = require('../controllers/adminDashboardController');
const { getUsers, banUser, unbanUser } = require('../controllers/adminUserController');
const { authenticate, requireRole } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/dashboard', authenticate, requireRole('admin'), getDashboard);

// User management
router.get('/users', authenticate, requireRole('admin'), getUsers);
router.patch('/users/:id/ban', authenticate, requireRole('admin'), banUser);
router.patch('/users/:id/unban', authenticate, requireRole('admin'), unbanUser);

module.exports = router;
