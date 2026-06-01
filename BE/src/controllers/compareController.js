const { pool } = require('../config/db');
const { parseGadgetId } = require('../services/dbHelper');
const { getComparisonData } = require('../services/compareService');
const compareModel = require('../models/compareModel');

// 1. Instant / On-the-fly Comparison (Public)
exports.compareInstant = async (req, res) => {
  try {
    let idsInput = req.body.gadgetIds || req.body.ids || req.query.ids;

    if (typeof idsInput === 'string') {
      idsInput = idsInput.split(',').map(s => s.trim());
    }

    if (!Array.isArray(idsInput)) {
      return res.status(400).json({ message: 'Input gadgetIds harus bertipe array atau string yang dipisahkan koma.' });
    }

    const gadgetIds = idsInput.map(parseGadgetId).filter(id => id !== null);
    if (gadgetIds.length === 0) {
      return res.status(400).json({ message: 'Daftar gadgetIds tidak valid atau kosong.' });
    }

    const result = await getComparisonData(gadgetIds);
    res.status(200).json(result);
  } catch (err) {
    console.error('Error in compareInstant:', err);
    res.status(500).json({ message: 'Gagal memproses perbandingan gadget.' });
  }
};

// 2. Get All Comparison Sessions for Current User
exports.getSessions = async (req, res) => {
  try {
    const userId = req.user.id;
    const rows = await compareModel.findSessionsByUser(userId);

    const sessions = rows.map(row => ({
      id: row.id,
      title: row.title,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      gadgets: row.gadgets.map(g => ({
        ...g,
        image: g.image
          ? (g.image.startsWith('http') || g.image.startsWith('data:') ? g.image : `http://localhost:5000${g.image}`)
          : null,
      })),
    }));

    res.status(200).json(sessions);
  } catch (err) {
    console.error('Error in getSessions:', err);
    res.status(500).json({ message: 'Gagal mengambil sesi komparasi.' });
  }
};

// 3. Create New Comparison Session
exports.createSession = async (req, res) => {
  const client = await pool.connect();
  try {
    const userId = req.user.id;
    let { title, gadgetIds } = req.body;

    if (gadgetIds && typeof gadgetIds === 'string') {
      gadgetIds = gadgetIds.split(',').map(s => s.trim());
    }

    const parsedGadgetIds = Array.isArray(gadgetIds)
      ? gadgetIds.map(parseGadgetId).filter(id => id !== null)
      : [];

    await client.query('BEGIN');

    // Auto-generate title
    if (!title || title.trim() === '') {
      if (parsedGadgetIds.length > 0) {
        const names = await compareModel.findGadgetNamesByIds(client, parsedGadgetIds);
        title = `Komparasi: ${names.join(' vs ')}`;
        if (names.length < parsedGadgetIds.length) title += ' ...';
      } else {
        title = 'Komparasi Baru';
      }
    }

    const session = await compareModel.insertSession(client, userId, title);

    for (const gadgetId of parsedGadgetIds) {
      await compareModel.insertSessionItem(client, session.id, gadgetId);
    }

    await client.query('COMMIT');
    res.status(201).json({ message: 'Sesi komparasi berhasil dibuat.', session });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error in createSession:', err);
    res.status(500).json({ message: 'Gagal membuat sesi komparasi.' });
  } finally {
    client.release();
  }
};

// 4. Get Detailed Session By ID
exports.getSessionById = async (req, res) => {
  try {
    const userId = req.user.id;
    const sessionId = req.params.id;

    const session = await compareModel.findSessionByIdAndUser(sessionId, userId);
    if (!session) {
      return res.status(404).json({ message: 'Sesi komparasi tidak ditemukan.' });
    }

    const gadgetIds = await compareModel.findItemsBySessionId(sessionId);
    const comparisonData = await getComparisonData(gadgetIds);

    res.status(200).json({
      id: session.id,
      title: session.title,
      createdAt: session.created_at,
      updatedAt: session.updated_at,
      ...comparisonData,
    });
  } catch (err) {
    console.error('Error in getSessionById:', err);
    res.status(500).json({ message: 'Gagal mengambil detail sesi komparasi.' });
  }
};

// 5. Update Session
exports.updateSession = async (req, res) => {
  const client = await pool.connect();
  try {
    const userId = req.user.id;
    const sessionId = req.params.id;
    let { title, gadgetIds } = req.body;

    const session = await compareModel.findSessionByIdAndUser(sessionId, userId);
    if (!session) {
      return res.status(404).json({ message: 'Sesi komparasi tidak ditemukan.' });
    }

    await client.query('BEGIN');

    await compareModel.updateSessionTitle(client, sessionId, title);

    if (gadgetIds !== undefined) {
      if (typeof gadgetIds === 'string') {
        gadgetIds = gadgetIds.split(',').map(s => s.trim());
      }
      const parsedGadgetIds = Array.isArray(gadgetIds)
        ? gadgetIds.map(parseGadgetId).filter(id => id !== null)
        : [];

      await compareModel.deleteItemsBySessionId(client, sessionId);
      for (const gadgetId of parsedGadgetIds) {
        await compareModel.insertSessionItem(client, sessionId, gadgetId);
      }
    }

    await client.query('COMMIT');
    res.status(200).json({ message: 'Sesi komparasi berhasil diperbarui.' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error in updateSession:', err);
    res.status(500).json({ message: 'Gagal memperbarui sesi komparasi.' });
  } finally {
    client.release();
  }
};

// 6. Delete Session
exports.deleteSession = async (req, res) => {
  try {
    const userId = req.user.id;
    const sessionId = req.params.id;

    const rowCount = await compareModel.deleteSession(sessionId, userId);
    if (rowCount === 0) {
      return res.status(404).json({ message: 'Sesi komparasi tidak ditemukan.' });
    }

    res.status(200).json({ message: 'Sesi komparasi berhasil dihapus.' });
  } catch (err) {
    console.error('Error in deleteSession:', err);
    res.status(500).json({ message: 'Gagal menghapus sesi komparasi.' });
  }
};

// 7. Add Single Item to Session
exports.addSessionItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const sessionId = req.params.id;
    const { gadgetId } = req.body;

    const parsedGadgetId = parseGadgetId(gadgetId);
    if (!parsedGadgetId) {
      return res.status(400).json({ message: 'ID gadget tidak valid.' });
    }

    const session = await compareModel.findSessionByIdAndUser(sessionId, userId);
    if (!session) {
      return res.status(404).json({ message: 'Sesi komparasi tidak ditemukan.' });
    }

    await compareModel.insertSessionItem(pool, sessionId, parsedGadgetId);
    await compareModel.touchSession(sessionId);

    res.status(200).json({ message: 'Gadget berhasil ditambahkan ke komparasi.' });
  } catch (err) {
    console.error('Error in addSessionItem:', err);
    res.status(500).json({ message: 'Gagal menambahkan gadget ke komparasi.' });
  }
};

// 8. Remove Single Item from Session
exports.removeSessionItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const sessionId = req.params.id;
    const { gadgetId } = req.params;

    const parsedGadgetId = parseGadgetId(gadgetId);
    if (!parsedGadgetId) {
      return res.status(400).json({ message: 'ID gadget tidak valid.' });
    }

    const session = await compareModel.findSessionByIdAndUser(sessionId, userId);
    if (!session) {
      return res.status(404).json({ message: 'Sesi komparasi tidak ditemukan.' });
    }

    const rowCount = await compareModel.deleteSessionItem(sessionId, parsedGadgetId);
    if (rowCount === 0) {
      return res.status(404).json({ message: 'Gadget tidak ditemukan di dalam sesi komparasi ini.' });
    }

    await compareModel.touchSession(sessionId);
    res.status(200).json({ message: 'Gadget berhasil dihapus dari komparasi.' });
  } catch (err) {
    console.error('Error in removeSessionItem:', err);
    res.status(500).json({ message: 'Gagal menghapus gadget dari komparasi.' });
  }
};
