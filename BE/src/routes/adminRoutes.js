const express = require('express');
const { getDashboard } = require('../controllers/adminDashboardController');
const { getUsers, banUser, unbanUser } = require('../controllers/adminUserController');
const { getReports, handleReport } = require('../controllers/adminReviewController');
const { authenticate, requireRole } = require('../middlewares/authMiddleware');
const { cacheMiddleware, invalidateCache } = require('../middlewares/cacheMiddleware');

const router = express.Router();

// Middleware helper to clear admin dashboard cache on success
const clearAdminCache = (req, res, next) => {
	res.on('finish', () => {
		if (res.statusCode >= 200 && res.statusCode < 300) {
			invalidateCache('*admin/dashboard*');
		}
	});
	next();
};

router.get('/dashboard', authenticate, requireRole('admin'), cacheMiddleware(300), getDashboard);

// User management
router.get('/users', authenticate, requireRole('admin'), getUsers);
router.patch('/users/:id/ban', authenticate, requireRole('admin'), clearAdminCache, banUser);
router.patch('/users/:id/unban', authenticate, requireRole('admin'), clearAdminCache, unbanUser);

// Review Moderation
router.get('/reviews/reports', authenticate, requireRole('admin'), getReports);
router.patch('/reviews/reports/:id', authenticate, requireRole('admin'), clearAdminCache, handleReport);

module.exports = router;
