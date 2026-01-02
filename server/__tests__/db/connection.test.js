describe('Database Connection', () => {
  let originalEnv;

  beforeEach(() => {
    originalEnv = process.env.WOTA_DATABASE_URL;
    jest.resetModules();
  });

  afterEach(() => {
    process.env.WOTA_DATABASE_URL = originalEnv;
  });

  test('should parse database URL correctly', () => {
    process.env.WOTA_DATABASE_URL = 'mysql://testuser:testpass@testhost.com/testdb';

    const mysql = require('mysql2/promise');
    const createPoolSpy = jest.spyOn(mysql, 'createPool');

    require('../../db/connection');

    expect(createPoolSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        host: 'testhost.com',
        user: 'testuser',
        password: 'testpass',
        database: 'testdb',
        connectionLimit: 10,
        queueLimit: 0,
        waitForConnections: true
      })
    );

    createPoolSpy.mockRestore();
  });

  test('should throw error for invalid database URL format', () => {
    process.env.WOTA_DATABASE_URL = 'invalid-url';

    expect(() => {
      require('../../db/connection');
    }).toThrow('Invalid WOTA_DATABASE_URL format');
  });

  test('should create connection pool with correct configuration', () => {
    process.env.WOTA_DATABASE_URL = 'mysql://user:pass@host/db';

    const mysql = require('mysql2/promise');
    const createPoolSpy = jest.spyOn(mysql, 'createPool');

    require('../../db/connection');

    expect(createPoolSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        connectionLimit: 10,
        queueLimit: 0,
        waitForConnections: true
      })
    );

    createPoolSpy.mockRestore();
  });
});
