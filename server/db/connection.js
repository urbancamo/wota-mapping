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
// Uses exponential backoff with jitter, retrying indefinitely since
// the database is assumed to be up but the connection may be slow.
async function queryWithRetry(sql, params) {
  const MAX_DELAY_MS = 15000;
  let delay = 1000;
  let attempt = 0;

  while (true) {
    attempt++;
    try {
      return await pool.query(sql, params);
    } catch (error) {
      const jitter = Math.random() * 500;
      const waitTime = Math.min(delay + jitter, MAX_DELAY_MS);
      console.error(
        `Database query failed (attempt ${attempt}): ${error.message}. Retrying in ${Math.round(waitTime)}ms...`
      );
      await new Promise(resolve => setTimeout(resolve, waitTime));
      delay = Math.min(delay * 2, MAX_DELAY_MS);
    }
  }
}

module.exports = {
  query: queryWithRetry,
  pool
};
