process.env.WOTA_DATABASE_URL = 'mysql://test:test@localhost/testdb';

const request = require('supertest');
const express = require('express');

jest.mock('../../db/queries');
const queries = require('../../db/queries');

jest.mock('fs');
const fs = require('fs');

const summitsRouter = require('../../routes/summits');

const app = express();
app.use(express.json());
app.use('/api/summits', summitsRouter);

const mockGeoJSON = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: {
        wotaId: 'OF-1',
        title: 'Test Summit 1',
        height: 600,
        book: 'The Outlying Fells',
        bookId: 'OF'
      },
      geometry: {
        type: 'Point',
        coordinates: [-3.14, 54.36]
      }
    },
    {
      type: 'Feature',
      properties: {
        wotaId: 'EF-5',
        title: 'Test Summit 2',
        height: 700,
        book: 'The Eastern Fells',
        bookId: 'EF'
      },
      geometry: {
        type: 'Point',
        coordinates: [-3.15, 54.37]
      }
    }
  ]
};

const mockDbRows = [
  {
    wotaid: 1,
    book: 'OF',
    name: 'Test Summit 1',
    last_act_by: 'G3ABC',
    last_act_date: new Date('2025-12-15')
  },
  {
    wotaid: 5,
    book: 'EF',
    name: 'Test Summit 2',
    last_act_by: null,
    last_act_date: null
  }
];

describe('GET /api/summits', () => {
  beforeEach(() => {
    fs.readFileSync.mockReturnValue(JSON.stringify(mockGeoJSON));
    jest.clearAllMocks();
  });

  test('should return all summits with activation data', async () => {
    queries.getAllSummits.mockResolvedValue(mockDbRows);

    const response = await request(app).get('/api/summits');

    expect(response.status).toBe(200);
    expect(response.body.type).toBe('FeatureCollection');
    expect(response.body.features).toHaveLength(2);
    expect(response.body.features[0].properties.last_act_by).toBe('G3ABC');
    expect(response.body.features[0].properties.last_act_date).toBe('2025-12-15');
    expect(response.body.features[1].properties.last_act_by).toBeNull();
    expect(response.body.features[1].properties.last_act_date).toBeNull();
  });

  test('should return only activated summits when activated=true', async () => {
    queries.getActivatedSummits.mockResolvedValue([mockDbRows[0]]);

    const response = await request(app).get('/api/summits?activated=true');

    expect(response.status).toBe(200);
    expect(response.body.features).toHaveLength(1);
    expect(response.body.features[0].properties.last_act_date).toBe('2025-12-15');
  });

  test('should return only unactivated summits when activated=false', async () => {
    queries.getUnactivatedSummits.mockResolvedValue([mockDbRows[1]]);

    const response = await request(app).get('/api/summits?activated=false');

    expect(response.status).toBe(200);
    expect(response.body.features).toHaveLength(1);
    expect(response.body.features[0].properties.last_act_date).toBeNull();
  });

  test('should return 400 for invalid activated parameter', async () => {
    const response = await request(app).get('/api/summits?activated=invalid');

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("Invalid 'activated' parameter. Must be 'true' or 'false'.");
  });

  test('should return 500 on database error', async () => {
    queries.getAllSummits.mockRejectedValue(new Error('Database connection failed'));

    const response = await request(app).get('/api/summits');

    expect(response.status).toBe(500);
    expect(response.body.error).toBe('Database connection failed. Please try again later.');
  });

  test('should return 500 on file read error', async () => {
    fs.readFileSync.mockImplementation(() => {
      throw new Error('File not found');
    });

    const response = await request(app).get('/api/summits');

    expect(response.status).toBe(500);
    expect(response.body.error).toBe('Failed to retrieve summit data. Please try again later.');
  });

  test('should return valid GeoJSON structure', async () => {
    queries.getAllSummits.mockResolvedValue(mockDbRows);

    const response = await request(app).get('/api/summits');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('type', 'FeatureCollection');
    expect(response.body).toHaveProperty('features');
    expect(Array.isArray(response.body.features)).toBe(true);

    response.body.features.forEach(feature => {
      expect(feature).toHaveProperty('type', 'Feature');
      expect(feature).toHaveProperty('geometry');
      expect(feature).toHaveProperty('properties');
      expect(feature.geometry).toHaveProperty('type', 'Point');
      expect(feature.geometry).toHaveProperty('coordinates');
      expect(Array.isArray(feature.geometry.coordinates)).toBe(true);
    });
  });

  test('should prefetch all summits with callsign flags when callsign provided without filterType', async () => {
    const mockFlagRows = [
      { ...mockDbRows[0], activated_ever: 1, activated_year: 1, chased_ever: 0, chased_year: 0 },
      { ...mockDbRows[1], activated_ever: 0, activated_year: 0, chased_ever: 1, chased_year: 0 }
    ];
    queries.getAllSummitsWithCallsignFlags.mockResolvedValue(mockFlagRows);

    const response = await request(app).get('/api/summits?callsign=M0XYZ');

    expect(response.status).toBe(200);
    expect(queries.getAllSummitsWithCallsignFlags).toHaveBeenCalled();
    expect(response.body.features).toHaveLength(2);
    expect(response.body.features[0].properties.activated_ever).toBe(true);
    expect(response.body.features[0].properties.chased_ever).toBe(false);
    expect(response.body.features[1].properties.activated_ever).toBe(false);
    expect(response.body.features[1].properties.chased_ever).toBe(true);
    // All summits have matchesFilter true (no filter active yet)
    expect(response.body.features[0].properties.matchesFilter).toBe(true);
    expect(response.body.features[1].properties.matchesFilter).toBe(true);
  });

  test('should prefetch with specific year when callsign and year provided', async () => {
    const mockFlagRows = [
      { ...mockDbRows[0], activated_ever: 1, activated_year: 1, chased_ever: 0, chased_year: 0 },
      { ...mockDbRows[1], activated_ever: 0, activated_year: 0, chased_ever: 0, chased_year: 0 }
    ];
    queries.getAllSummitsWithCallsignFlags.mockResolvedValue(mockFlagRows);

    const response = await request(app).get('/api/summits?callsign=M0XYZ&year=2026');

    expect(response.status).toBe(200);
    expect(queries.getAllSummitsWithCallsignFlags).toHaveBeenCalledWith('M0XYZ', 2026);
    expect(response.body.features).toHaveLength(2);
  });

  test('should return 400 for invalid year parameter', async () => {
    const response = await request(app).get('/api/summits?callsign=M0XYZ&year=20');

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("Invalid 'year' parameter. Must be a 4-digit year.");
  });

  test('should return 400 for non-numeric year parameter', async () => {
    const response = await request(app).get('/api/summits?callsign=M0XYZ&year=abcd');

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("Invalid 'year' parameter. Must be a 4-digit year.");
  });

  test('should filter summits not activated by callsign', async () => {
    queries.getSummitsNotActivatedByCallsign.mockResolvedValue([mockDbRows[1]]);

    const response = await request(app).get('/api/summits?callsign=M0XYZ&notActivated=true');

    expect(response.status).toBe(200);
    expect(queries.getSummitsNotActivatedByCallsign).toHaveBeenCalledWith('M0XYZ');
    expect(response.body.features).toHaveLength(1);
  });

  test('should filter summits not activated by callsign this year', async () => {
    queries.getSummitsNotActivatedByCallsignThisYear.mockResolvedValue([mockDbRows[1]]);

    const response = await request(app).get('/api/summits?callsign=M0XYZ&year=2026&notActivated=true');

    expect(response.status).toBe(200);
    expect(queries.getSummitsNotActivatedByCallsignThisYear).toHaveBeenCalledWith('M0XYZ', 2026);
    expect(response.body.features).toHaveLength(1);
  });

  test('should return 400 for invalid notActivated parameter', async () => {
    const response = await request(app).get('/api/summits?callsign=M0XYZ&notActivated=invalid');

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("Invalid 'notActivated' parameter. Must be 'true' or 'false'.");
  });
});
