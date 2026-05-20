const express = require('express');
const cors = require('cors');
const env = require('./config/env');
const { checkDatabaseConnection } = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const gadgetRoutes = require('./routes/gadgetRoutes');
const userRoutes = require('./routes/userRoutes');
const path = require('path');

const app = express();

// Ekspos folder uploads secara statis agar foto bisa diakses dengan URL
app.use('/uploads', express.static(path.join(__dirname, '..', 'public', 'uploads')));

app.use(
  cors({
    origin: env.clientOrigin,
    credentials: true,
  })
);
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/gadgets', gadgetRoutes);
app.use('/api/user', userRoutes);

app.get('/', (req, res) => {
  res.status(200).json({
    message: 'MendingMana backend is running.',
    docs: '/api/health',
  });
});

app.get('/api/health', async (req, res) => {
  let databaseStatus = 'connected';

  try {
    await checkDatabaseConnection();
  } catch (error) {
    databaseStatus = 'disconnected';
  }

  res.status(databaseStatus === 'connected' ? 200 : 503).json({
    status: databaseStatus === 'connected' ? 'ok' : 'degraded',
    service: 'mendingmana-backend',
    environment: env.nodeEnv,
    database: databaseStatus,
    timestamp: new Date().toISOString(),
  });
});

app.get('/api', (req, res) => {
  res.status(200).json({
    message: 'MendingMana API initial setup is running.',
  });
});

module.exports = app;