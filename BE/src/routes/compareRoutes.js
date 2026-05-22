const express = require('express');
const compareController = require('../controllers/compareController');
const { authenticate } = require('../middlewares/authMiddleware');

const router = express.Router();

// 1. Publik: Komparasi instan / on-the-fly
router.post('/', compareController.compareInstant);
router.get('/', compareController.compareInstant);

// Semua rute di bawah ini memerlukan otentikasi (member)
router.use('/sessions', authenticate);

// 2. Member Only: Sesi Komparasi Tersimpan (CRUD)
router.get('/sessions', compareController.getSessions);
router.post('/sessions', compareController.createSession);
router.get('/sessions/:id', compareController.getSessionById);
router.put('/sessions/:id', compareController.updateSession);
router.delete('/sessions/:id', compareController.deleteSession);

// 3. Member Only: Item Sesi Komparasi
router.post('/sessions/:id/items', compareController.addSessionItem);
router.delete('/sessions/:id/items/:gadgetId', compareController.removeSessionItem);

module.exports = router;
