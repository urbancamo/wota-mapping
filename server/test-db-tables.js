require('dotenv').config();
const pool = require('./db/connection');

async function checkTables() {
  try {
    const [tables] = await pool.query('SHOW TABLES');
    console.log('Available tables:');
    console.log(tables);

    // Check spots table structure
    console.log('\nSpots table structure:');
    const [spotsColumns] = await pool.query('DESCRIBE spots');
    console.log(spotsColumns);

    // Sample some spots data
    console.log('\nSample spots data (first 5):');
    const [spotsSample] = await pool.query('SELECT * FROM spots LIMIT 5');
    console.log(spotsSample);

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkTables();
