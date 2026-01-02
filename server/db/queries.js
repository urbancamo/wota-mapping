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
      INNER JOIN activator_log al ON s.wotaid = al.wotaid
      WHERE al.activatedby = ?
        AND al.year = ?
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
      WHERE NOT EXISTS (
        SELECT 1 FROM activator_log al
        WHERE al.wotaid = s.wotaid
        AND al.activatedby = ?
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
      WHERE NOT EXISTS (
        SELECT 1 FROM activator_log al
        WHERE al.wotaid = s.wotaid
        AND al.activatedby = ?
        AND al.year = ?
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

async function getSummitsChasedByCallsign(callsign) {
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
      INNER JOIN chaser_log cl ON s.wotaid = cl.wotaid
      WHERE cl.wkdby = ?
      ORDER BY s.wotaid
    `;
    const [rows] = await pool.query(query, [callsign.toUpperCase()]);
    return rows;
  } catch (error) {
    console.error('Error fetching summits chased by callsign:', error.message);
    throw error;
  }
}

async function getSummitsChasedByCallsignThisYear(callsign, year) {
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
      INNER JOIN chaser_log cl ON s.wotaid = cl.wotaid
      WHERE cl.wkdby = ?
        AND cl.year = ?
      ORDER BY s.wotaid
    `;
    const [rows] = await pool.query(query, [callsign.toUpperCase(), year]);
    return rows;
  } catch (error) {
    console.error('Error fetching summits chased by callsign this year:', error.message);
    throw error;
  }
}

async function getSummitsNotChasedByCallsign(callsign) {
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
      WHERE NOT EXISTS (
        SELECT 1 FROM chaser_log cl
        WHERE cl.wotaid = s.wotaid
        AND cl.wkdby = ?
      )
      ORDER BY s.wotaid
    `;
    const [rows] = await pool.query(query, [callsign.toUpperCase()]);
    return rows;
  } catch (error) {
    console.error('Error fetching summits not chased by callsign:', error.message);
    throw error;
  }
}

async function getSummitsNotChasedByCallsignThisYear(callsign, year) {
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
      WHERE NOT EXISTS (
        SELECT 1 FROM chaser_log cl
        WHERE cl.wotaid = s.wotaid
        AND cl.wkdby = ?
        AND cl.year = ?
      )
      ORDER BY s.wotaid
    `;
    const [rows] = await pool.query(query, [callsign.toUpperCase(), year]);
    return rows;
  } catch (error) {
    console.error('Error fetching summits not chased by callsign this year:', error.message);
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
  getSummitsChasedByCallsign,
  getSummitsChasedByCallsignThisYear,
  getSummitsNotChasedByCallsign,
  getSummitsNotChasedByCallsignThisYear
};
