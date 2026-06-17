const dotenv = require('dotenv');

dotenv.config();

function toNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

const env = {
  nodeEnv: process.env.NODE_ENV,
  port: toNumber(process.env.PORT, 5000),
  clientOrigin: process.env.CLIENT_ORIGIN,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN,
  db: {
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: toNumber(process.env.DB_PORT, 5432),
    ssl: process.env.DB_SSL === 'true',
    connectionString: process.env.DATABASE_URL || null,
  },
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
  redisUrl: process.env.REDIS_URL || null,
  smtp: {
    host: process.env.SMTP_HOST || null,
    port: toNumber(process.env.SMTP_PORT, 587),
    user: process.env.SMTP_USER || null,
    pass: process.env.SMTP_PASS || null,
    from: process.env.SMTP_FROM || null,
  },
};

module.exports = env;