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

  let features = geoJsonData.features;

  if (filterApplied) {
    features = features.filter(f => dbSummitNames.has(f.properties.title));
  }

  features = features.map(feature => {
    const summitName = feature.properties.title;
    const activationData = dbLookup[summitName] || { last_act_by: null, last_act_date: null };

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
