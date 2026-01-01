const queries = require('../../db/queries');

jest.mock('../../db/connection', () => ({
  query: jest.fn()
}));

const pool = require('../../db/connection');

describe('Database Queries', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllSummits', () => {
    test('should return all summits from database', async () => {
      const mockRows = [
        {
          wotaid: 1,
          sotaid: null,
          book: 'OF',
          name: 'Test Summit',
          height: 600,
          gridRef: 'SD123456',
          last_act_by: 'G3ABC',
          last_act_date: '2025-12-15',
          humpid: null,
          gridid: 'SD1234'
        }
      ];

      pool.query.mockResolvedValue([mockRows, []]);

      const result = await queries.getAllSummits();

      expect(result).toEqual(mockRows);
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT')
      );
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('ORDER BY s.wotaid')
      );
    });

    test('should throw error on database failure', async () => {
      pool.query.mockRejectedValue(new Error('Database connection failed'));

      await expect(queries.getAllSummits()).rejects.toThrow('Database connection failed');
    });
  });

  describe('getActivatedSummits', () => {
    test('should return only activated summits', async () => {
      const mockRows = [
        {
          wotaid: 1,
          name: 'Activated Summit',
          last_act_by: 'G3ABC',
          last_act_date: '2025-12-15'
        }
      ];

      pool.query.mockResolvedValue([mockRows, []]);

      const result = await queries.getActivatedSummits();

      expect(result).toEqual(mockRows);
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE s.last_act_date IS NOT NULL')
      );
    });

    test('should throw error on database failure', async () => {
      pool.query.mockRejectedValue(new Error('Query failed'));

      await expect(queries.getActivatedSummits()).rejects.toThrow('Query failed');
    });
  });

  describe('getUnactivatedSummits', () => {
    test('should return only unactivated summits', async () => {
      const mockRows = [
        {
          wotaid: 2,
          name: 'Unactivated Summit',
          last_act_by: null,
          last_act_date: null
        }
      ];

      pool.query.mockResolvedValue([mockRows, []]);

      const result = await queries.getUnactivatedSummits();

      expect(result).toEqual(mockRows);
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE s.last_act_date IS NULL')
      );
    });

    test('should throw error on database failure', async () => {
      pool.query.mockRejectedValue(new Error('Query failed'));

      await expect(queries.getUnactivatedSummits()).rejects.toThrow('Query failed');
    });
  });
});
