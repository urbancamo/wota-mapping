const express = require('express');
const fs = require('fs');
const path = require('path');
const queries = require('../db/queries');

const router = express.Router();

const SUMMITS_JSON_PATH = path.join(__dirname, '../../data/summits.json');

function loadStaticSummitsData() {
  try {
    const data = fs.readFileSync(SUMMITS_JSON_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading static summits.json:', error.message);
    throw new Error('Failed to load summit data');
  }
}

function mergeSummitData(geoJsonData, dbRows, filterApplied) {
  const dbLookup = {};
  const dbWotaIds = new Set();

  dbRows.forEach(row => {
    const key = `${row.book}-${row.wotaid}`;
    dbLookup[key] = {
      last_act_by: row.last_act_by,
      last_act_date: row.last_act_date ? row.last_act_date.toISOString().split('T')[0] : null
    };
    dbWotaIds.add(key);
  });

  let features = geoJsonData.features;

  if (filterApplied) {
    features = features.filter(f => dbWotaIds.has(f.properties.wotaId));
  }

  features = features.map(feature => {
    const wotaId = feature.properties.wotaId;
    const activationData = dbLookup[wotaId] || { last_act_by: null, last_act_date: null };

    return {
      ...feature,
      properties: {
        ...feature.properties,
        last_act_by: activationData.last_act_by,
        last_act_date: activationData.last_act_date
      }
    };
  });

  return {
    type: 'FeatureCollection',
    features
  };
}

router.get('/', async (req, res) => {
  try {
    const { activated, callsign, year, notActivated } = req.query;

    if (activated !== undefined && activated !== 'true' && activated !== 'false') {
      return res.status(400).json({
        error: "Invalid 'activated' parameter. Must be 'true' or 'false'."
      });
    }

    if (notActivated !== undefined && notActivated !== 'true' && notActivated !== 'false') {
      return res.status(400).json({
        error: "Invalid 'notActivated' parameter. Must be 'true' or 'false'."
      });
    }

    if (callsign && typeof callsign !== 'string') {
      return res.status(400).json({
        error: "Invalid 'callsign' parameter. Must be a string."
      });
    }

    if (year && (isNaN(year) || year.length !== 4)) {
      return res.status(400).json({
        error: "Invalid 'year' parameter. Must be a 4-digit year."
      });
    }

    const staticData = loadStaticSummitsData();

    let dbRows;
    let filterApplied = false;

    if (callsign) {
      filterApplied = true;
      if (notActivated === 'true') {
        if (year) {
          dbRows = await queries.getSummitsNotActivatedByCallsignThisYear(callsign, parseInt(year));
        } else {
          dbRows = await queries.getSummitsNotActivatedByCallsign(callsign);
        }
      } else {
        if (year) {
          dbRows = await queries.getSummitsActivatedByCallsignThisYear(callsign, parseInt(year));
        } else {
          dbRows = await queries.getSummitsActivatedByCallsign(callsign);
        }
      }
    } else {
      filterApplied = activated !== undefined;
      if (activated === 'true') {
        dbRows = await queries.getActivatedSummits();
      } else if (activated === 'false') {
        dbRows = await queries.getUnactivatedSummits();
      } else {
        dbRows = await queries.getAllSummits();
      }
    }

    const geoJson = mergeSummitData(staticData, dbRows, filterApplied);

    res.json(geoJson);

  } catch (error) {
    console.error('Error in /api/summits:', error.message);

    if (error.message.includes('Failed to load summit data')) {
      return res.status(500).json({
        error: 'Failed to retrieve summit data. Please try again later.'
      });
    }

    return res.status(500).json({
      error: 'Database connection failed. Please try again later.'
    });
  }
});

module.exports = router;
