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
  const dbSummitNames = new Set();

  dbRows.forEach(row => {
    const summitName = row.name;
    dbLookup[summitName] = {
      last_act_by: row.last_act_by,
      last_act_date: row.last_act_date ? row.last_act_date.toISOString().split('T')[0] : null
    };
    dbSummitNames.add(summitName);
  });

  const features = geoJsonData.features.map(feature => {
    const summitName = feature.properties.title;
    const activationData = dbLookup[summitName] || { last_act_by: null, last_act_date: null };
    const matchesFilter = filterApplied ? dbSummitNames.has(summitName) : true;

    return {
      ...feature,
      properties: {
        ...feature.properties,
        last_act_by: activationData.last_act_by,
        last_act_date: activationData.last_act_date,
        matchesFilter: matchesFilter
      }
    };
  });

  return {
    type: 'FeatureCollection',
    features
  };
}

// Merge that includes the 4 boolean callsign flags for client-side filtering
function mergeSummitDataWithFlags(geoJsonData, dbRows) {
  const dbLookup = {};

  dbRows.forEach(row => {
    dbLookup[row.name] = {
      last_act_by: row.last_act_by,
      last_act_date: row.last_act_date ? row.last_act_date.toISOString().split('T')[0] : null,
      activated_ever: !!row.activated_ever,
      activated_year: !!row.activated_year,
      chased_ever: !!row.chased_ever,
      chased_year: !!row.chased_year
    };
  });

  const features = geoJsonData.features.map(feature => {
    const summitName = feature.properties.title;
    const data = dbLookup[summitName] || {
      last_act_by: null, last_act_date: null,
      activated_ever: false, activated_year: false,
      chased_ever: false, chased_year: false
    };

    return {
      ...feature,
      properties: {
        ...feature.properties,
        last_act_by: data.last_act_by,
        last_act_date: data.last_act_date,
        activated_ever: data.activated_ever,
        activated_year: data.activated_year,
        chased_ever: data.chased_ever,
        chased_year: data.chased_year,
        matchesFilter: true
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
    const { callsign, year, filterType } = req.query;

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

    const validFilterTypes = [
      'activated-year', 'activated-ever', 'not-activated-year', 'not-activated-ever',
      'chased-year', 'chased-ever', 'not-chased-year', 'not-chased-ever'
    ];

    if (filterType && !validFilterTypes.includes(filterType)) {
      return res.status(400).json({
        error: "Invalid 'filterType' parameter."
      });
    }

    const staticData = loadStaticSummitsData();

    // When callsign is provided without filterType, return all summits
    // with boolean flags so the client can filter locally without
    // further API calls.
    if (callsign && !filterType) {
      const yearValue = year ? parseInt(year) : new Date().getFullYear();
      const dbRows = await queries.getAllSummitsWithCallsignFlags(callsign, yearValue);
      const geoJson = mergeSummitDataWithFlags(staticData, dbRows);
      return res.json(geoJson);
    }

    let dbRows;
    let filterApplied = !!filterType;

    if (filterType && callsign) {
      const yearValue = year ? parseInt(year) : new Date().getFullYear();

      switch (filterType) {
        case 'activated-year':
          dbRows = await queries.getSummitsActivatedByCallsignThisYear(callsign, yearValue);
          break;
        case 'activated-ever':
          dbRows = await queries.getSummitsActivatedByCallsign(callsign);
          break;
        case 'not-activated-year':
          dbRows = await queries.getSummitsNotActivatedByCallsignThisYear(callsign, yearValue);
          break;
        case 'not-activated-ever':
          dbRows = await queries.getSummitsNotActivatedByCallsign(callsign);
          break;
        case 'chased-year':
          dbRows = await queries.getSummitsChasedByCallsignThisYear(callsign, yearValue);
          break;
        case 'chased-ever':
          dbRows = await queries.getSummitsChasedByCallsign(callsign);
          break;
        case 'not-chased-year':
          dbRows = await queries.getSummitsNotChasedByCallsignThisYear(callsign, yearValue);
          break;
        case 'not-chased-ever':
          dbRows = await queries.getSummitsNotChasedByCallsign(callsign);
          break;
        default:
          dbRows = await queries.getAllSummits();
      }
    } else {
      dbRows = await queries.getAllSummits();
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
