const dotenv = require('dotenv');

dotenv.config();

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 5000,
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  jwtSecret: process.env.JWT_SECRET || 'change_me_in_env',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1d',
  db: {
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'mendingmana_db',
    password: process.env.DB_PASSWORD || '1234',
    port: Number(process.env.DB_PORT) || 5432,
    ssl: process.env.DB_SSL === 'true',
    connectionString: process.env.DATABASE_URL || null,
  },
};

module.exports = env;