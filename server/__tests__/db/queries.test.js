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

  describe('getSummitsActivatedByCallsign', () => {
    test('should return summits activated by specific callsign', async () => {
      const mockRows = [
        {
          wotaid: 1,
          book: 'LD',
          name: 'Test Summit 1',
          last_act_by: 'M0XYZ',
          last_act_date: '2025-06-15'
        },
        {
          wotaid: 5,
          book: 'LD',
          name: 'Test Summit 2',
          last_act_by: 'M0XYZ',
          last_act_date: '2024-08-20'
        }
      ];

      pool.query.mockResolvedValue([mockRows, []]);

      const result = await queries.getSummitsActivatedByCallsign('M0XYZ');

      expect(result).toEqual(mockRows);
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('INNER JOIN spots sp ON s.wotaid = sp.wotaid'),
        ['M0XYZ']
      );
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE sp.call = ?'),
        ['M0XYZ']
      );
    });

    test('should convert callsign to uppercase', async () => {
      pool.query.mockResolvedValue([[], []]);

      await queries.getSummitsActivatedByCallsign('m0xyz');

      expect(pool.query).toHaveBeenCalledWith(
        expect.any(String),
        ['M0XYZ']
      );
    });

    test('should throw error on database failure', async () => {
      pool.query.mockRejectedValue(new Error('Query failed'));

      await expect(queries.getSummitsActivatedByCallsign('M0XYZ')).rejects.toThrow('Query failed');
    });
  });

  describe('getSummitsActivatedByCallsignThisYear', () => {
    test('should return summits activated by callsign in specific year', async () => {
      const mockRows = [
        {
          wotaid: 1,
          book: 'LD',
          name: 'Test Summit 1',
          last_act_by: 'M0XYZ',
          last_act_date: '2026-06-15'
        }
      ];

      pool.query.mockResolvedValue([mockRows, []]);

      const result = await queries.getSummitsActivatedByCallsignThisYear('M0XYZ', 2026);

      expect(result).toEqual(mockRows);
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('INNER JOIN spots sp ON s.wotaid = sp.wotaid'),
        ['M0XYZ', 2026]
      );
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE sp.call = ?'),
        ['M0XYZ', 2026]
      );
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('AND YEAR(sp.datetime) = ?'),
        ['M0XYZ', 2026]
      );
    });

    test('should convert callsign to uppercase', async () => {
      pool.query.mockResolvedValue([[], []]);

      await queries.getSummitsActivatedByCallsignThisYear('m0abc', 2026);

      expect(pool.query).toHaveBeenCalledWith(
        expect.any(String),
        ['M0ABC', 2026]
      );
    });

    test('should throw error on database failure', async () => {
      pool.query.mockRejectedValue(new Error('Query failed'));

      await expect(queries.getSummitsActivatedByCallsignThisYear('M0XYZ', 2026)).rejects.toThrow('Query failed');
    });
  });

  describe('getSummitsNotActivatedByCallsign', () => {
    test('should return summits not activated by specific callsign', async () => {
      const mockRows = [
        {
          wotaid: 2,
          book: 'LD',
          name: 'Unactivated Summit 1',
          last_act_by: null,
          last_act_date: null
        },
        {
          wotaid: 3,
          book: 'LD',
          name: 'Unactivated Summit 2',
          last_act_by: 'G3XYZ',
          last_act_date: '2024-05-10'
        }
      ];

      pool.query.mockResolvedValue([mockRows, []]);

      const result = await queries.getSummitsNotActivatedByCallsign('M0XYZ');

      expect(result).toEqual(mockRows);
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE NOT EXISTS'),
        ['M0XYZ']
      );
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('AND sp.call = ?'),
        ['M0XYZ']
      );
    });

    test('should convert callsign to uppercase', async () => {
      pool.query.mockResolvedValue([[], []]);

      await queries.getSummitsNotActivatedByCallsign('m0xyz');

      expect(pool.query).toHaveBeenCalledWith(
        expect.any(String),
        ['M0XYZ']
      );
    });

    test('should throw error on database failure', async () => {
      pool.query.mockRejectedValue(new Error('Query failed'));

      await expect(queries.getSummitsNotActivatedByCallsign('M0XYZ')).rejects.toThrow('Query failed');
    });
  });

  describe('getSummitsNotActivatedByCallsignThisYear', () => {
    test('should return summits not activated by callsign in specific year', async () => {
      const mockRows = [
        {
          wotaid: 2,
          book: 'LD',
          name: 'Not Activated This Year',
          last_act_by: null,
          last_act_date: null
        },
        {
          wotaid: 3,
          book: 'LD',
          name: 'Activated Different Year',
          last_act_by: 'M0XYZ',
          last_act_date: '2025-03-20'
        }
      ];

      pool.query.mockResolvedValue([mockRows, []]);

      const result = await queries.getSummitsNotActivatedByCallsignThisYear('M0XYZ', 2026);

      expect(result).toEqual(mockRows);
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE NOT EXISTS'),
        ['M0XYZ', 2026]
      );
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('AND sp.call = ?'),
        ['M0XYZ', 2026]
      );
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('AND YEAR(sp.datetime) = ?'),
        ['M0XYZ', 2026]
      );
    });

    test('should convert callsign to uppercase', async () => {
      pool.query.mockResolvedValue([[], []]);

      await queries.getSummitsNotActivatedByCallsignThisYear('m0abc', 2026);

      expect(pool.query).toHaveBeenCalledWith(
        expect.any(String),
        ['M0ABC', 2026]
      );
    });

    test('should throw error on database failure', async () => {
      pool.query.mockRejectedValue(new Error('Query failed'));

      await expect(queries.getSummitsNotActivatedByCallsignThisYear('M0XYZ', 2026)).rejects.toThrow('Query failed');
    });
  });
});
