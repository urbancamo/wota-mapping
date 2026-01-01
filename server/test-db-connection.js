require('dotenv').config();
const queries = require('./db/queries');

async function testDatabaseConnection() {
  console.log('Testing database connection...\n');

  try {
    console.log('1. Fetching all summits...');
    const allSummits = await queries.getAllSummits();
    console.log(`   ✓ Found ${allSummits.length} total summits`);
    if (allSummits.length > 0) {
      console.log('   Sample:', allSummits[0]);
    }

    console.log('\n2. Fetching activated summits...');
    const activated = await queries.getActivatedSummits();
    console.log(`   ✓ Found ${activated.length} activated summits`);
    if (activated.length > 0) {
      console.log('   Sample:', activated[0]);
    }

    console.log('\n3. Fetching unactivated summits...');
    const unactivated = await queries.getUnactivatedSummits();
    console.log(`   ✓ Found ${unactivated.length} unactivated summits`);
    if (unactivated.length > 0) {
      console.log('   Sample:', unactivated[0]);
    }

    console.log('\n✓ All database queries successful!');
    console.log(`\nSummary:`);
    console.log(`  Total summits: ${allSummits.length}`);
    console.log(`  Activated: ${activated.length}`);
    console.log(`  Unactivated: ${unactivated.length}`);

    process.exit(0);
  } catch (error) {
    console.error('\n✗ Database connection failed:', error.message);
    process.exit(1);
  }
}

testDatabaseConnection();
