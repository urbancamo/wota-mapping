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

async function getSummitsActivatedByCallsign(callsign) {
  try {
    const query = `
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
      WHERE s.last_act_by = ?
      ORDER BY s.wotaid
    `;
    const [rows] = await pool.query(query, [callsign.toUpperCase()]);
    return rows;
  } catch (error) {
    console.error('Error fetching summits activated by callsign:', error.message);
    throw error;
  }
}

async function getSummitsActivatedByCallsignThisYear(callsign, year) {
  try {
    const query = `
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
      INNER JOIN spots sp ON s.wotaid = sp.wotaid
      WHERE sp.call = ?
        AND YEAR(sp.datetime) = ?
      ORDER BY s.wotaid
    `;
    const [rows] = await pool.query(query, [callsign.toUpperCase(), year]);
    return rows;
  } catch (error) {
    console.error('Error fetching summits activated by callsign this year:', error.message);
    throw error;
  }
}

async function getSummitsNotActivatedByCallsign(callsign) {
  try {
    const query = `
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
      WHERE NOT EXISTS (
        SELECT 1 FROM spots sp
        WHERE sp.wotaid = s.wotaid
        AND sp.call = ?
      )
      ORDER BY s.wotaid
    `;
    const [rows] = await pool.query(query, [callsign.toUpperCase()]);
    return rows;
  } catch (error) {
    console.error('Error fetching summits not activated by callsign:', error.message);
    throw error;
  }
}

async function getSummitsNotActivatedByCallsignThisYear(callsign, year) {
  try {
    const query = `
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
      WHERE NOT EXISTS (
        SELECT 1 FROM spots sp
        WHERE sp.wotaid = s.wotaid
        AND sp.call = ?
        AND YEAR(sp.datetime) = ?
      )
      ORDER BY s.wotaid
    `;
    const [rows] = await pool.query(query, [callsign.toUpperCase(), year]);
    return rows;
  } catch (error) {
    console.error('Error fetching summits not activated by callsign this year:', error.message);
    throw error;
  }
}

async function getCallsignSamples(callsignPrefix) {
  try {
    const query = `
      SELECT DISTINCT call, COUNT(*) as count
      FROM spots
      WHERE call LIKE ?
      GROUP BY call
      ORDER BY count DESC
      LIMIT 20
    `;
    const [rows] = await pool.query(query, [callsignPrefix + '%']);
    return rows;
  } catch (error) {
    console.error('Error fetching callsign samples:', error.message);
    throw error;
  }
}

module.exports = {
  getAllSummits,
  getActivatedSummits,
  getUnactivatedSummits,
  getSummitsActivatedByCallsign,
  getSummitsActivatedByCallsignThisYear,
  getSummitsNotActivatedByCallsign,
  getSummitsNotActivatedByCallsignThisYear,
  getCallsignSamples
};
