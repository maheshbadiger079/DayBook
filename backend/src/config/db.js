const { Pool } = require('pg');
const config = require('./env');

// PostgreSQL Connection Pool configuration
// Connection pooling allows reusing existing database connections instead of
// creating and tearing down a new TCP connection on every single request.
const pool = new Pool({
  host: config.db.host,
  port: config.db.port,
  database: config.db.name,
  user: config.db.user,
  password: config.db.password,
  ssl: config.db.ssl,
  max: config.db.max,
  idleTimeoutMillis: config.db.idleTimeoutMillis,
  connectionTimeoutMillis: config.db.connectionTimeoutMillis,
});

// Pool error handling for unexpected errors on idle clients
pool.on('error', (err) => {
  console.error('[PostgreSQL Pool Error]: Unexpected error on idle client', err);
});

/**
 * Executes a parameterized SQL query safely
 * @param {string} text - SQL query string with placeholders ($1, $2, etc.)
 * @param {Array} params - Array of parameter values
 */
const query = async (text, params = []) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    if (config.nodeEnv === 'development') {
      console.log(`[SQL Query] duration: ${duration}ms | rows: ${res.rowCount}`);
    }
    return res;
  } catch (error) {
    console.error(`[SQL Error]: ${error.message} \nQuery: ${text}`);
    throw error;
  }
};

/**
 * Tests database connectivity
 */
const testConnection = async () => {
  try {
    const res = await pool.query('SELECT NOW() as current_time, current_database() as db_name, version() as version;');
    console.log(`[PostgreSQL Connected]: Database "${res.rows[0].db_name}" at ${res.rows[0].current_time}`);
    return {
      connected: true,
      database: res.rows[0].db_name,
      timestamp: res.rows[0].current_time,
      version: res.rows[0].version,
    };
  } catch (err) {
    console.error('[PostgreSQL Connection Failed]:', err.message);
    return {
      connected: false,
      error: err.message,
    };
  }
};

module.exports = {
  pool,
  query,
  testConnection,
};
