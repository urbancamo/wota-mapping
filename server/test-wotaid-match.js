require('dotenv').config();
const pool = require('./db/connection');

async function testWotaIdMatch() {
  try {
    // Get sample summits
    console.log('Sample summits wotaid values:');
    const [summits] = await pool.query('SELECT wotaid, book, name FROM summits LIMIT 5');
    console.log(summits);

    // Get sample activator_log
    console.log('\nSample activator_log wotaid values:');
    const [activations] = await pool.query('SELECT DISTINCT wotaid FROM activator_log LIMIT 5');
    console.log(activations);

    // Try the actual query that should work
    console.log('\nTesting actual query for M5TEA:');
    const [result] = await pool.query(`
      SELECT DISTINCT
        s.wotaid,
        s.sotaid,
        s.book,
        s.name,
        s.height,
        s.reference AS gridRef,
        s.last_act_by,
        s.last_act_date,
        s.humpid,
        s.gridid
      FROM summits s
      INNER JOIN activator_log al ON s.wotaid = al.wotaid
      WHERE al.activatedby = ?
      ORDER BY s.wotaid
      LIMIT 5
    `, ['M5TEA']);

    console.log(`Found ${result.length} summits`);
    console.log(result);

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

testWotaIdMatch();
