const { Pool } = require('pg');
const env = require('./env');

const poolConfig = env.db.connectionString
  ? {
      connectionString: env.db.connectionString,
      ssl: env.db.ssl ? { rejectUnauthorized: false } : false,
    }
  : {
      user: env.db.user,
      host: env.db.host,
      database: env.db.database,
      password: env.db.password,
      port: env.db.port,
      ssl: env.db.ssl ? { rejectUnauthorized: false } : false,
    };

const pool = new Pool(poolConfig);

async function query(text, params) {
  return pool.query(text, params);
}

async function checkDatabaseConnection() {
  await query('SELECT 1');
  return true;
}

module.exports = {
  pool,
  query,
  checkDatabaseConnection,
};