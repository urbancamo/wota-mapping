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
});
