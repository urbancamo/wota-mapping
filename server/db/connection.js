const mysql = require('mysql2/promise');

function parseDatabaseUrl(url) {
  const regex = /mysql:\/\/([^:]+):([^@]+)@([^/]+)\/(.+)/;
  const match = url.match(regex);

  if (!match) {
    throw new Error('Invalid WOTA_DATABASE_URL format');
  }

  return {
    host: match[3],
    user: match[1],
    password: match[2],
    database: match[4]
  };
}

const dbConfig = parseDatabaseUrl(process.env.WOTA_DATABASE_URL);

const pool = mysql.createPool({
  ...dbConfig,
  connectionLimit: 10,
  queueLimit: 0,
  waitForConnections: true,
  connectTimeout: 30000
});

pool.on('connection', () => {
  console.log('Database connection established');
});

pool.on('error', (err) => {
  console.error('Database pool error:', err.message);
});

// Transparent retry wrapper for queries over unreliable VPN link.
// Retries indefinitely with a fixed 1s interval since the database
// is assumed to be up but the connection may be slow. Timeout errors
// are retried immediately with no delay.
async function queryWithRetry(sql, params) {
  const RETRY_DELAY_MS = 1000;
  let attempt = 0;

  while (true) {
    attempt++;
    try {
      return await pool.query(sql, params);
    } catch (error) {
      const isTimeout = error.code === 'ETIMEDOUT' || error.code === 'ECONNRESET';
      console.error(
        `Database query failed (attempt ${attempt}): ${error.message}.${isTimeout ? ' Retrying immediately...' : ` Retrying in ${RETRY_DELAY_MS}ms...`}`
      );
      if (!isTimeout) {
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
      }
    }
  }
}

module.exports = {
  query: queryWithRetry,
  pool
};
