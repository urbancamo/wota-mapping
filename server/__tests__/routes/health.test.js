process.env.WOTA_DATABASE_URL = 'mysql://test:test@localhost/testdb';

const request = require('supertest');
const express = require('express');

jest.mock('../../db/connection');
const pool = require('../../db/connection');

describe('Health Check Endpoint', () => {
  let app;

  beforeEach(() => {
    jest.clearAllMocks();

    app = express();
    app.use(express.json());

    app.get('/api/health', async (req, res) => {
      const health = {
        status: 'ok',
        timestamp: new Date().toISOString(),
        database: {
          connected: false,
          error: null
        }
      };

      try {
        await pool.query('SELECT 1');
        health.database.connected = true;
      } catch (error) {
        health.status = 'degraded';
        health.database.connected = false;
        health.database.error = error.message;
      }

      const statusCode = health.status === 'ok' ? 200 : 503;
      res.status(statusCode).json(health);
    });
  });

  test('should return 200 and healthy status when database is connected', async () => {
    pool.query.mockResolvedValue([[], []]);

    const response = await request(app).get('/api/health');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', 'ok');
    expect(response.body).toHaveProperty('timestamp');
    expect(response.body).toHaveProperty('database');
    expect(response.body.database.connected).toBe(true);
    expect(response.body.database.error).toBeNull();
  });

  test('should return 503 and degraded status when database is disconnected', async () => {
    pool.query.mockRejectedValue(new Error('Connection timeout'));

    const response = await request(app).get('/api/health');

    expect(response.status).toBe(503);
    expect(response.body).toHaveProperty('status', 'degraded');
    expect(response.body).toHaveProperty('timestamp');
    expect(response.body).toHaveProperty('database');
    expect(response.body.database.connected).toBe(false);
    expect(response.body.database.error).toBe('Connection timeout');
  });

  test('should include ISO timestamp in response', async () => {
    pool.query.mockResolvedValue([[], []]);

    const response = await request(app).get('/api/health');

    expect(response.body.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
  });

  test('should test database connection on each request', async () => {
    pool.query.mockResolvedValue([[], []]);

    await request(app).get('/api/health');
    await request(app).get('/api/health');

    expect(pool.query).toHaveBeenCalledTimes(2);
    expect(pool.query).toHaveBeenCalledWith('SELECT 1');
  });
});
