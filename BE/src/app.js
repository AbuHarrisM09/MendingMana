const express = require('express');
const cors = require('cors');
const env = require('./config/env');

const app = express();

app.use(
  cors({
    origin: env.clientOrigin,
    credentials: true,
  })
);
app.use(express.json());

app.get('/', (req, res) => {
  res.status(200).json({
    message: 'MendingMana backend is running.',
    docs: '/api/health',
  });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'mendingmana-backend',
    environment: env.nodeEnv,
    timestamp: new Date().toISOString(),
  });
});

app.get('/api', (req, res) => {
  res.status(200).json({
    message: 'MendingMana API initial setup is running.',
  });
});

module.exports = app;
