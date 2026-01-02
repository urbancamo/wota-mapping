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
  connectTimeout: 10000
});

pool.on('connection', () => {
  console.log('Database connection established');
});

pool.on('error', (err) => {
  console.error('Database pool error:', err.message);
});

module.exports = pool;
