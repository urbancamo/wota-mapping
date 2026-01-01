const pool = require('./connection');

const baseQuery = `
  SELECT
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
`;

async function getAllSummits() {
  try {
    const [rows] = await pool.query(`${baseQuery} ORDER BY s.wotaid`);
    return rows;
  } catch (error) {
    console.error('Error fetching all summits:', error.message);
    throw error;
  }
}

async function getActivatedSummits() {
  try {
    const [rows] = await pool.query(
      `${baseQuery} WHERE s.last_act_date IS NOT NULL ORDER BY s.wotaid`
    );
    return rows;
  } catch (error) {
    console.error('Error fetching activated summits:', error.message);
    throw error;
  }
}

async function getUnactivatedSummits() {
  try {
    const [rows] = await pool.query(
      `${baseQuery} WHERE s.last_act_date IS NULL ORDER BY s.wotaid`
    );
    return rows;
  } catch (error) {
    console.error('Error fetching unactivated summits:', error.message);
    throw error;
  }
}

module.exports = {
  getAllSummits,
  getActivatedSummits,
  getUnactivatedSummits
};
