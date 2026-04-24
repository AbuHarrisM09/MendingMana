const express = require('express');
const cors = require('cors');
const env = require('./config/env');
const { checkDatabaseConnection } = require('./config/db');
const authRoutes = require('./routes/authRoutes');

const app = express();

app.use(
  cors({
    origin: env.clientOrigin,
    credentials: true,
  })
);
app.use(express.json());
app.use('/api/auth', authRoutes);

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