const { pool } = require('../config/db');

// Helper to parse gadget ID from format "g-ID" or raw numeric
function parseGadgetId(value) {
  if (!value) return null;
  const cleaned = String(value).startsWith('g-') ? String(value).slice(2) : String(value);
  const parsed = Number.parseInt(cleaned, 10);
  return Number.isNaN(parsed) ? null : parsed;
}

// Format gadget row helper
function formatGadgetRow(row) {
  return {
    id: `g-${row.id}`,
    name: row.name,
    brand: row.brand_name,
    category: row.category_name,
    price: Number(row.price),
    images: row.images
      ? row.images.map((img) => (img.startsWith('http') || img.startsWith('data:') ? img : `http://localhost:5000${img}`))
      : [],
    description: row.description,
    summary: row.summary,
    releaseDate: row.release_date,
    averageRating: Number(row.average_rating),
    totalReviews: Number(row.total_reviews)
  };
}

// Helper to construct side-by-side specs matrix
async function getComparisonData(gadgetIds) {
  if (!gadgetIds || gadgetIds.length === 0) {
    return { gadgets: [], specGroups: [] };
  }

  // 1. Fetch detailed gadgets
  const gadgetsQuery = `
    SELECT 
      g.*,
      b.name as brand_name,
      c.name as category_name,
      (
        SELECT json_agg(file_url)
        FROM gadget_media gm
        WHERE gm.gadget_id = g.id
      ) as images
    FROM gadgets g
    LEFT JOIN brands b ON g.brand_id = b.id
    LEFT JOIN categories c ON g.category_id = c.id
    WHERE g.id = ANY($1::bigint[])
  `;
  const gadgetsRes = await pool.query(gadgetsQuery, [gadgetIds]);
  const gadgets = gadgetsRes.rows.map(formatGadgetRow);

  if (gadgets.length === 0) {
    return { gadgets: [], specGroups: [] };
  }

  // 2. Fetch all specs for these gadgets
  const specsQuery = `
    SELECT gadget_id, spec_group, spec_key, spec_value
    FROM gadget_specs
    WHERE gadget_id = ANY($1::bigint[])
    ORDER BY display_order ASC, spec_key ASC
  `;
  const specsRes = await pool.query(specsQuery, [gadgetIds]);

  // 3. Build unified specifications matrix
  const specGroupsMap = {};

  for (const spec of specsRes.rows) {
    const gId = `g-${spec.gadget_id}`;
    const groupName = spec.spec_group || 'Umum';
    const keyName = spec.spec_key;
    const val = spec.spec_value;

    if (!specGroupsMap[groupName]) {
      specGroupsMap[groupName] = {};
    }
    if (!specGroupsMap[groupName][keyName]) {
      specGroupsMap[groupName][keyName] = {};
    }
    specGroupsMap[groupName][keyName][gId] = val;
  }

  // Transform nested map into final side-by-side spec groups
  const specGroups = Object.keys(specGroupsMap).map(groupName => {
    const keysMap = specGroupsMap[groupName];
    const specs = Object.keys(keysMap).map(keyName => {
      const values = {};
      // Ensure every compared gadget has a value entry (default null)
      for (const g of gadgets) {
        values[g.id] = keysMap[keyName][g.id] || null;
      }
      return {
        key: keyName,
        values: values
      };
    });
    return {
      group: groupName,
      specs: specs
    };
  });

  return { gadgets, specGroups };
}

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

// 2. Get All Comparison Sessions for Current User (Member Only)
exports.getSessions = async (req, res) => {
  try {
    const userId = req.user.id;

    const query = `
      SELECT 
        cs.*,
        COALESCE(
          json_agg(
            json_build_object(
              'id', 'g-' || g.id,
              'name', g.name,
              'brand', b.name,
              'price', g.price,
              'image', (SELECT file_url FROM gadget_media WHERE gadget_id = g.id LIMIT 1)
            )
          ) FILTER (WHERE g.id IS NOT NULL),
          '[]'
        ) as gadgets
      FROM comparison_sessions cs
      LEFT JOIN comparison_items ci ON ci.session_id = cs.id
      LEFT JOIN gadgets g ON ci.gadget_id = g.id
      LEFT JOIN brands b ON g.brand_id = b.id
      WHERE cs.user_id = $1
      GROUP BY cs.id
      ORDER BY cs.updated_at DESC
    `;

    const { rows } = await pool.query(query, [userId]);

    const sessions = rows.map(row => ({
      id: row.id,
      title: row.title,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      gadgets: row.gadgets.map(g => ({
        ...g,
        image: g.image ? (g.image.startsWith('http') || g.image.startsWith('data:') ? g.image : `http://localhost:5000${g.image}`) : null
      }))
    }));

    res.status(200).json(sessions);
  } catch (err) {
    console.error('Error in getSessions:', err);
    res.status(500).json({ message: 'Gagal mengambil sesi komparasi.' });
  }
};

// 3. Create New Comparison Session (Member Only)
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

    // Auto-generate title if none provided
    if (!title || title.trim() === '') {
      if (parsedGadgetIds.length > 0) {
        const namesRes = await client.query(
          `SELECT name FROM gadgets WHERE id = ANY($1::bigint[]) LIMIT 3`,
          [parsedGadgetIds]
        );
        const names = namesRes.rows.map(r => r.name);
        title = `Komparasi: ${names.join(' vs ')}`;
        if (namesRes.rows.length < parsedGadgetIds.length) {
          title += ' ...';
        }
      } else {
        title = 'Komparasi Baru';
      }
    }

    // Insert session
    const sessionRes = await client.query(
      `INSERT INTO comparison_sessions (user_id, title) VALUES ($1, $2) RETURNING *`,
      [userId, title]
    );
    const session = sessionRes.rows[0];

    // Insert items
    if (parsedGadgetIds.length > 0) {
      for (const gadgetId of parsedGadgetIds) {
        await client.query(
          `INSERT INTO comparison_items (session_id, gadget_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
          [session.id, gadgetId]
        );
      }
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

// 4. Get Detailed Session By ID (Member Only)
exports.getSessionById = async (req, res) => {
  try {
    const userId = req.user.id;
    const sessionId = req.params.id;

    // Check ownership
    const sessionRes = await pool.query(
      `SELECT * FROM comparison_sessions WHERE id = $1 AND user_id = $2 LIMIT 1`,
      [sessionId, userId]
    );

    if (sessionRes.rows.length === 0) {
      return res.status(404).json({ message: 'Sesi komparasi tidak ditemukan.' });
    }

    const session = sessionRes.rows[0];

    // Fetch gadget IDs in this session
    const itemsRes = await pool.query(
      `SELECT gadget_id FROM comparison_items WHERE session_id = $1`,
      [sessionId]
    );
    const gadgetIds = itemsRes.rows.map(r => r.gadget_id);

    // Get unified matrix data
    const comparisonData = await getComparisonData(gadgetIds);

    res.status(200).json({
      id: session.id,
      title: session.title,
      createdAt: session.created_at,
      updatedAt: session.updated_at,
      ...comparisonData
    });
  } catch (err) {
    console.error('Error in getSessionById:', err);
    res.status(500).json({ message: 'Gagal mengambil detail sesi komparasi.' });
  }
};

// 5. Update Session (Member Only)
exports.updateSession = async (req, res) => {
  const client = await pool.connect();
  try {
    const userId = req.user.id;
    const sessionId = req.params.id;
    let { title, gadgetIds } = req.body;

    // Check ownership
    const checkRes = await client.query(
      `SELECT * FROM comparison_sessions WHERE id = $1 AND user_id = $2 LIMIT 1`,
      [sessionId, userId]
    );

    if (checkRes.rows.length === 0) {
      return res.status(404).json({ message: 'Sesi komparasi tidak ditemukan.' });
    }

    await client.query('BEGIN');

    // Update title if provided
    if (title !== undefined) {
      await client.query(
        `UPDATE comparison_sessions SET title = $1, updated_at = NOW() WHERE id = $2`,
        [title, sessionId]
      );
    } else {
      await client.query(
        `UPDATE comparison_sessions SET updated_at = NOW() WHERE id = $1`,
        [sessionId]
      );
    }

    // Sync gadget items if provided
    if (gadgetIds !== undefined) {
      if (typeof gadgetIds === 'string') {
        gadgetIds = gadgetIds.split(',').map(s => s.trim());
      }
      
      const parsedGadgetIds = Array.isArray(gadgetIds)
        ? gadgetIds.map(parseGadgetId).filter(id => id !== null)
        : [];

      // Remove old items
      await client.query(`DELETE FROM comparison_items WHERE session_id = $1`, [sessionId]);

      // Add new items
      for (const gadgetId of parsedGadgetIds) {
        await client.query(
          `INSERT INTO comparison_items (session_id, gadget_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
          [sessionId, gadgetId]
        );
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

// 6. Delete Session (Member Only)
exports.deleteSession = async (req, res) => {
  try {
    const userId = req.user.id;
    const sessionId = req.params.id;

    const result = await pool.query(
      `DELETE FROM comparison_sessions WHERE id = $1 AND user_id = $2`,
      [sessionId, userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Sesi komparasi tidak ditemukan.' });
    }

    res.status(200).json({ message: 'Sesi komparasi berhasil dihapus.' });
  } catch (err) {
    console.error('Error in deleteSession:', err);
    res.status(500).json({ message: 'Gagal menghapus sesi komparasi.' });
  }
};

// 7. Add Single Item to Session (Member Only)
exports.addSessionItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const sessionId = req.params.id;
    const { gadgetId } = req.body;

    const parsedGadgetId = parseGadgetId(gadgetId);
    if (!parsedGadgetId) {
      return res.status(400).json({ message: 'ID gadget tidak valid.' });
    }

    // Check ownership
    const checkRes = await pool.query(
      `SELECT * FROM comparison_sessions WHERE id = $1 AND user_id = $2 LIMIT 1`,
      [sessionId, userId]
    );

    if (checkRes.rows.length === 0) {
      return res.status(404).json({ message: 'Sesi komparasi tidak ditemukan.' });
    }

    // Insert item
    await pool.query(
      `INSERT INTO comparison_items (session_id, gadget_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
      [sessionId, parsedGadgetId]
    );

    // Touch updated_at
    await pool.query(
      `UPDATE comparison_sessions SET updated_at = NOW() WHERE id = $1`,
      [sessionId]
    );

    res.status(200).json({ message: 'Gadget berhasil ditambahkan ke komparasi.' });
  } catch (err) {
    console.error('Error in addSessionItem:', err);
    res.status(500).json({ message: 'Gagal menambahkan gadget ke komparasi.' });
  }
};

// 8. Remove Single Item from Session (Member Only)
exports.removeSessionItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const sessionId = req.params.id;
    const { gadgetId } = req.params;

    const parsedGadgetId = parseGadgetId(gadgetId);
    if (!parsedGadgetId) {
      return res.status(400).json({ message: 'ID gadget tidak valid.' });
    }

    // Check ownership
    const checkRes = await pool.query(
      `SELECT * FROM comparison_sessions WHERE id = $1 AND user_id = $2 LIMIT 1`,
      [sessionId, userId]
    );

    if (checkRes.rows.length === 0) {
      return res.status(404).json({ message: 'Sesi komparasi tidak ditemukan.' });
    }

    // Delete item
    const result = await pool.query(
      `DELETE FROM comparison_items WHERE session_id = $1 AND gadget_id = $2`,
      [sessionId, parsedGadgetId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Gadget tidak ditemukan di dalam sesi komparasi ini.' });
    }

    // Touch updated_at
    await pool.query(
      `UPDATE comparison_sessions SET updated_at = NOW() WHERE id = $1`,
      [sessionId]
    );

    res.status(200).json({ message: 'Gadget berhasil dihapus dari komparasi.' });
  } catch (err) {
    console.error('Error in removeSessionItem:', err);
    res.status(500).json({ message: 'Gagal menghapus gadget dari komparasi.' });
  }
};
