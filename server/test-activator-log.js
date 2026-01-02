require('dotenv').config();
const pool = require('./db/connection');

async function testActivatorLog() {
  try {
    // Check if M5TEA exists in activator_log
    console.log('Checking for M5TEA in activator_log...');
    const [rows1] = await pool.query(
      'SELECT COUNT(*) as count FROM activator_log WHERE activatedby = ?',
      ['M5TEA']
    );
    console.log('M5TEA activations:', rows1[0].count);

    // Get sample of activators
    console.log('\nSample activators:');
    const [rows2] = await pool.query(
      'SELECT DISTINCT activatedby, COUNT(*) as count FROM activator_log GROUP BY activatedby ORDER BY count DESC LIMIT 10'
    );
    console.log(rows2);

    // Get sample of M5TEA if exists
    if (rows1[0].count > 0) {
      console.log('\nM5TEA activations sample:');
      const [rows3] = await pool.query(
        'SELECT * FROM activator_log WHERE activatedby = ? LIMIT 5',
        ['M5TEA']
      );
      console.log(rows3);
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

testActivatorLog();
