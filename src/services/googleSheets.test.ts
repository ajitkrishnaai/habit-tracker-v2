/**
 * Google Sheets Service Integration Tests
 *
 * Tests Google Sheets API interactions including sheet creation, initialization,
 * and batch read/write operations with proper error handling.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  initGoogleSheetsAPI,
  createNewSheet,
  initializeSheetStructure,
  checkSheetExists,
  readHabits,
  writeHabits,
  readLogs,
  writeLogs,
  readMetadata,
  writeMetadata,
  googleSheetsService,
} from './googleSheets';
import * as auth from './auth';
import type { Habit } from '../types/habit';
import type { LogEntry } from '../types/logEntry';
import type { Metadata } from '../types/metadata';

// Mock the auth service
vi.mock('./auth');

// Mock the storage service for googleSheetsService class methods
vi.mock('./storage', () => ({
  storageService: {
    getMetadata: vi.fn(),
  },
}));

describe('Google Sheets Service - Integration Tests', () => {
  const mockToken = 'mock-access-token-12345';
  const mockSheetId = 'test-sheet-id-abc123';
  let fetchMock: any;

  beforeEach(() => {
    // Mock getAccessToken to return valid token
    vi.mocked(auth.getAccessToken).mockReturnValue(mockToken);

    // Reset fetch mock
    fetchMock = vi.fn();
    global.fetch = fetchMock;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('initGoogleSheetsAPI', () => {
    it('should initialize without errors', async () => {
      const consoleSpy = vi.spyOn(console, 'log');

      await initGoogleSheetsAPI();

      expect(consoleSpy).toHaveBeenCalledWith('[GoogleSheets] API ready (using OAuth tokens)');
      consoleSpy.mockRestore();
    });

    it('should resolve immediately (no async operations)', async () => {
      const startTime = Date.now();
      await initGoogleSheetsAPI();
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(10); // Should be instant
    });
  });

  describe('createNewSheet', () => {
    it('should create a new sheet and return sheet ID', async () => {
      const mockResponse = {
        spreadsheetId: mockSheetId,
        properties: { title: 'My Habit Tracker' },
      };

      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const sheetId = await createNewSheet('My Habit Tracker');

      expect(sheetId).toBe(mockSheetId);
      expect(fetchMock).toHaveBeenCalledWith(
        'https://sheets.googleapis.com/v4/spreadsheets',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockToken}`,
            'Content-Type': 'application/json',
          }),
          body: expect.stringContaining('My Habit Tracker'),
        })
      );
    });

    it('should throw error when not authenticated', async () => {
      vi.mocked(auth.getAccessToken).mockReturnValue(null);

      await expect(createNewSheet('Test Sheet')).rejects.toThrow('Not authenticated');
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it('should throw error on API failure', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: false,
        statusText: 'Forbidden',
      });

      await expect(createNewSheet('Test Sheet')).rejects.toThrow(
        'Failed to create sheet: Forbidden'
      );
    });

    it('should handle network errors gracefully', async () => {
      fetchMock.mockRejectedValueOnce(new Error('Network error'));

      await expect(createNewSheet('Test Sheet')).rejects.toThrow('Network error');
    });
  });

  describe('initializeSheetStructure', () => {
    it('should initialize sheet with three tabs and headers', async () => {
      // Mock batchUpdate call (for adding tabs)
      fetchMock
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ replies: [] }),
        })
        // Mock batchUpdate call for headers
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ updatedCells: 18 }),
        });

      await initializeSheetStructure(mockSheetId);

      // Verify batchUpdate was called for structure
      expect(fetchMock).toHaveBeenNthCalledWith(
        1,
        `https://sheets.googleapis.com/v4/spreadsheets/${mockSheetId}:batchUpdate`,
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockToken}`,
          }),
        })
      );

      // Verify batchUpdate was called for headers
      expect(fetchMock).toHaveBeenNthCalledWith(
        2,
        `https://sheets.googleapis.com/v4/spreadsheets/${mockSheetId}/values:batchUpdate`,
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('Habits!A1:F1'),
        })
      );

      expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    it('should throw error when not authenticated', async () => {
      vi.mocked(auth.getAccessToken).mockReturnValue(null);

      await expect(initializeSheetStructure(mockSheetId)).rejects.toThrow('Not authenticated');
    });

    it('should handle structure creation failure', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: false,
        statusText: 'Bad Request',
      });

      await expect(initializeSheetStructure(mockSheetId)).rejects.toThrow(
        'Failed to initialize structure: Bad Request'
      );
    });
  });

  describe('checkSheetExists', () => {
    it('should return true when sheet exists', async () => {
      fetchMock.mockResolvedValueOnce({ ok: true });

      const exists = await checkSheetExists(mockSheetId);

      expect(exists).toBe(true);
      expect(fetchMock).toHaveBeenCalledWith(
        `https://sheets.googleapis.com/v4/spreadsheets/${mockSheetId}`,
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockToken}`,
          }),
        })
      );
    });

    it('should return false when sheet does not exist', async () => {
      fetchMock.mockResolvedValueOnce({ ok: false });

      const exists = await checkSheetExists(mockSheetId);

      expect(exists).toBe(false);
    });

    it('should return false when not authenticated', async () => {
      vi.mocked(auth.getAccessToken).mockReturnValue(null);

      const exists = await checkSheetExists(mockSheetId);

      expect(exists).toBe(false);
    });

    it('should return false on network error', async () => {
      fetchMock.mockRejectedValueOnce(new Error('Network error'));

      const exists = await checkSheetExists(mockSheetId);

      expect(exists).toBe(false);
    });
  });

  describe('Habit Operations - readHabits/writeHabits', () => {
    const mockHabits: Habit[] = [
      {
        habit_id: 'habit_001',
        name: 'Exercise',
        category: 'Health',
        status: 'active',
        created_date: '2025-01-01T00:00:00.000Z',
        modified_date: '2025-01-01T00:00:00.000Z',
      },
      {
        habit_id: 'habit_002',
        name: 'Read',
        status: 'active',
        created_date: '2025-01-02T00:00:00.000Z',
        modified_date: '2025-01-02T00:00:00.000Z',
      },
    ];

    describe('readHabits', () => {
      it('should read habits from Google Sheets', async () => {
        const mockResponse = {
          values: [
            ['habit_001', 'Exercise', 'Health', 'active', '2025-01-01T00:00:00.000Z', '2025-01-01T00:00:00.000Z'],
            ['habit_002', 'Read', '', 'active', '2025-01-02T00:00:00.000Z', '2025-01-02T00:00:00.000Z'],
          ],
        };

        fetchMock.mockResolvedValueOnce({
          ok: true,
          json: async () => mockResponse,
        });

        const habits = await readHabits(mockSheetId);

        expect(habits).toHaveLength(2);
        expect(habits[0]).toEqual(mockHabits[0]);
        expect(habits[1].name).toBe('Read');
        expect(habits[1].category).toBeUndefined();
      });

      it('should return empty array when no habits exist', async () => {
        fetchMock.mockResolvedValueOnce({
          ok: true,
          json: async () => ({ values: [] }),
        });

        const habits = await readHabits(mockSheetId);

        expect(habits).toEqual([]);
      });

      it('should handle missing values property', async () => {
        fetchMock.mockResolvedValueOnce({
          ok: true,
          json: async () => ({}),
        });

        const habits = await readHabits(mockSheetId);

        expect(habits).toEqual([]);
      });

      it('should throw error when not authenticated', async () => {
        vi.mocked(auth.getAccessToken).mockReturnValue(null);

        await expect(readHabits(mockSheetId)).rejects.toThrow('Not authenticated');
      });

      it('should throw error on API failure', async () => {
        fetchMock.mockResolvedValueOnce({
          ok: false,
          statusText: 'Not Found',
        });

        await expect(readHabits(mockSheetId)).rejects.toThrow('Failed to read habits: Not Found');
      });
    });

    describe('writeHabits', () => {
      it('should write habits to Google Sheets', async () => {
        fetchMock.mockResolvedValueOnce({
          ok: true,
          json: async () => ({ updatedCells: 12 }),
        });

        await writeHabits(mockSheetId, mockHabits);

        expect(fetchMock).toHaveBeenCalledWith(
          `https://sheets.googleapis.com/v4/spreadsheets/${mockSheetId}/values/Habits!A2:F?valueInputOption=RAW`,
          expect.objectContaining({
            method: 'PUT',
            headers: expect.objectContaining({
              Authorization: `Bearer ${mockToken}`,
              'Content-Type': 'application/json',
            }),
            body: expect.stringContaining('habit_001'),
          })
        );
      });

      it('should handle empty habits array', async () => {
        fetchMock.mockResolvedValueOnce({
          ok: true,
          json: async () => ({ updatedCells: 0 }),
        });

        await writeHabits(mockSheetId, []);

        expect(fetchMock).toHaveBeenCalled();
      });

      it('should convert undefined category to empty string', async () => {
        const habitWithoutCategory: Habit = {
          habit_id: 'habit_003',
          name: 'Meditate',
          status: 'active',
          created_date: '2025-01-03T00:00:00.000Z',
          modified_date: '2025-01-03T00:00:00.000Z',
        };

        fetchMock.mockResolvedValueOnce({
          ok: true,
          json: async () => ({ updatedCells: 6 }),
        });

        await writeHabits(mockSheetId, [habitWithoutCategory]);

        const callBody = JSON.parse(fetchMock.mock.calls[0][1].body);
        expect(callBody.values[0][2]).toBe(''); // Category should be empty string
      });

      it('should throw error when not authenticated', async () => {
        vi.mocked(auth.getAccessToken).mockReturnValue(null);

        await expect(writeHabits(mockSheetId, mockHabits)).rejects.toThrow('Not authenticated');
      });

      it('should throw error on API failure', async () => {
        fetchMock.mockResolvedValueOnce({
          ok: false,
          statusText: 'Internal Server Error',
          text: async () => 'Server error details',
        });

        await expect(writeHabits(mockSheetId, mockHabits)).rejects.toThrow(
          'Failed to write habits: Internal Server Error'
        );
      });
    });
  });

  describe('Log Operations - readLogs/writeLogs', () => {
    const mockLogs: LogEntry[] = [
      {
        log_id: 'log_001',
        habit_id: 'habit_001',
        date: '2025-01-15',
        status: 'done',
        notes: 'Great workout today!',
        timestamp: '2025-01-15T10:30:00.000Z',
      },
      {
        log_id: 'log_002',
        habit_id: 'habit_002',
        date: '2025-01-15',
        status: 'not_done',
        timestamp: '2025-01-15T22:00:00.000Z',
      },
    ];

    describe('readLogs', () => {
      it('should read logs from Google Sheets', async () => {
        const mockResponse = {
          values: [
            ['log_001', 'habit_001', '2025-01-15', 'done', 'Great workout today!', '2025-01-15T10:30:00.000Z'],
            ['log_002', 'habit_002', '2025-01-15', 'not_done', '', '2025-01-15T22:00:00.000Z'],
          ],
        };

        fetchMock.mockResolvedValueOnce({
          ok: true,
          json: async () => mockResponse,
        });

        const logs = await readLogs(mockSheetId);

        expect(logs).toHaveLength(2);
        expect(logs[0]).toEqual(mockLogs[0]);
        expect(logs[1].notes).toBeUndefined();
      });

      it('should return empty array when no logs exist', async () => {
        fetchMock.mockResolvedValueOnce({
          ok: true,
          json: async () => ({}),
        });

        const logs = await readLogs(mockSheetId);

        expect(logs).toEqual([]);
      });

      it('should throw error when not authenticated', async () => {
        vi.mocked(auth.getAccessToken).mockReturnValue(null);

        await expect(readLogs(mockSheetId)).rejects.toThrow('Not authenticated');
      });
    });

    describe('writeLogs', () => {
      it('should write logs to Google Sheets', async () => {
        fetchMock.mockResolvedValueOnce({
          ok: true,
          json: async () => ({ updatedCells: 12 }),
        });

        await writeLogs(mockSheetId, mockLogs);

        expect(fetchMock).toHaveBeenCalledWith(
          `https://sheets.googleapis.com/v4/spreadsheets/${mockSheetId}/values/Logs!A2:F?valueInputOption=RAW`,
          expect.objectContaining({
            method: 'PUT',
            body: expect.stringContaining('log_001'),
          })
        );
      });

      it('should convert undefined notes to empty string', async () => {
        const logWithoutNotes: LogEntry = {
          log_id: 'log_003',
          habit_id: 'habit_001',
          date: '2025-01-16',
          status: 'done',
          timestamp: '2025-01-16T08:00:00.000Z',
        };

        fetchMock.mockResolvedValueOnce({
          ok: true,
          json: async () => ({ updatedCells: 6 }),
        });

        await writeLogs(mockSheetId, [logWithoutNotes]);

        const callBody = JSON.parse(fetchMock.mock.calls[0][1].body);
        expect(callBody.values[0][4]).toBe(''); // Notes should be empty string
      });

      it('should throw error on API failure', async () => {
        fetchMock.mockResolvedValueOnce({
          ok: false,
          statusText: 'Service Unavailable',
          text: async () => 'Service temporarily unavailable',
        });

        await expect(writeLogs(mockSheetId, mockLogs)).rejects.toThrow(
          'Failed to write logs: Service Unavailable'
        );
      });
    });
  });

  describe('Metadata Operations - readMetadata/writeMetadata', () => {
    const mockMetadata: Metadata = {
      sheet_version: '1.0',
      last_sync: '2025-01-15T12:00:00.000Z',
      user_id: 'user_123',
      sheet_id: mockSheetId,
    };

    describe('readMetadata', () => {
      it('should read metadata from Google Sheets', async () => {
        const mockResponse = {
          values: [['1.0', '2025-01-15T12:00:00.000Z', 'user_123', mockSheetId]],
        };

        fetchMock.mockResolvedValueOnce({
          ok: true,
          json: async () => mockResponse,
        });

        const metadata = await readMetadata(mockSheetId);

        expect(metadata).toEqual(mockMetadata);
      });

      it('should return null when no metadata exists', async () => {
        fetchMock.mockResolvedValueOnce({
          ok: true,
          json: async () => ({ values: [] }),
        });

        const metadata = await readMetadata(mockSheetId);

        expect(metadata).toBeNull();
      });

      it('should throw error when not authenticated', async () => {
        vi.mocked(auth.getAccessToken).mockReturnValue(null);

        await expect(readMetadata(mockSheetId)).rejects.toThrow('Not authenticated');
      });
    });

    describe('writeMetadata', () => {
      it('should write metadata to Google Sheets', async () => {
        fetchMock.mockResolvedValueOnce({
          ok: true,
          json: async () => ({ updatedCells: 4 }),
        });

        await writeMetadata(mockSheetId, mockMetadata);

        expect(fetchMock).toHaveBeenCalledWith(
          `https://sheets.googleapis.com/v4/spreadsheets/${mockSheetId}/values/Metadata!A2:D2?valueInputOption=RAW`,
          expect.objectContaining({
            method: 'PUT',
            body: expect.stringContaining('1.0'),
          })
        );
      });

      it('should throw error on API failure', async () => {
        fetchMock.mockResolvedValueOnce({
          ok: false,
          statusText: 'Unauthorized',
          text: async () => 'Token expired',
        });

        await expect(writeMetadata(mockSheetId, mockMetadata)).rejects.toThrow(
          'Failed to write metadata: Unauthorized'
        );
      });
    });
  });

  describe('GoogleSheetsService Class - Wrapper Methods', () => {
    const mockStorageMetadata: Metadata = {
      sheet_version: '1.0',
      last_sync: '2025-01-15T12:00:00.000Z',
      user_id: 'user_123',
      sheet_id: mockSheetId,
    };

    beforeEach(async () => {
      // Clear cache before each test
      googleSheetsService.clearCache();

      // Mock storage service
      const { storageService } = await import('./storage');
      vi.mocked(storageService.getMetadata).mockResolvedValue(mockStorageMetadata);
    });

    it('should cache sheet ID after first retrieval', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ values: [] }),
      });

      const { storageService } = await import('./storage');

      await googleSheetsService.readHabits();

      // Storage should only be called once
      expect(storageService.getMetadata).toHaveBeenCalledTimes(1);

      // Second call should use cached sheet ID
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ values: [] }),
      });

      await googleSheetsService.readHabits();

      // Storage should still only be called once (using cache)
      expect(storageService.getMetadata).toHaveBeenCalledTimes(1);
    });

    it('should throw error when no sheet ID in metadata', async () => {
      const { storageService } = await import('./storage');
      vi.mocked(storageService.getMetadata).mockResolvedValue(null);

      await expect(googleSheetsService.readHabits()).rejects.toThrow(
        'No sheet ID found in metadata. User needs to authenticate first.'
      );
    });

    it('should clear cache on clearCache() call', async () => {
      fetchMock.mockResolvedValue({
        ok: true,
        json: async () => ({ values: [] }),
      });

      const { storageService } = await import('./storage');

      // First call
      await googleSheetsService.readHabits();
      expect(storageService.getMetadata).toHaveBeenCalledTimes(1);

      // Clear cache
      googleSheetsService.clearCache();

      // Second call should fetch metadata again
      await googleSheetsService.readHabits();
      expect(storageService.getMetadata).toHaveBeenCalledTimes(2);
    });

    it('should proxy writeHabits correctly', async () => {
      const mockHabits: Habit[] = [
        {
          habit_id: 'habit_001',
          name: 'Test',
          status: 'active',
          created_date: '2025-01-01T00:00:00.000Z',
          modified_date: '2025-01-01T00:00:00.000Z',
        },
      ];

      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ updatedCells: 6 }),
      });

      await googleSheetsService.writeHabits(mockHabits);

      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining(mockSheetId),
        expect.any(Object)
      );
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should log errors to console when operations fail', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      fetchMock.mockRejectedValueOnce(new Error('Network failure'));

      await expect(readHabits(mockSheetId)).rejects.toThrow('Network failure');

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[GoogleSheets] Error reading habits:',
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });

    it('should handle partial data in sheet rows', async () => {
      const mockResponse = {
        values: [
          ['habit_001'], // Only ID, missing other fields
          ['habit_002', 'Exercise'], // ID and name only
        ],
      };

      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const habits = await readHabits(mockSheetId);

      expect(habits).toHaveLength(2);
      expect(habits[0].habit_id).toBe('habit_001');
      expect(habits[0].name).toBe(''); // Default empty string
      expect(habits[0].status).toBe('active'); // Default status
      expect(habits[1].name).toBe('Exercise');
    });

    it('should handle concurrent operations without race conditions', async () => {
      fetchMock.mockResolvedValue({
        ok: true,
        json: async () => ({ values: [] }),
      });

      // Simulate concurrent reads
      const reads = Promise.all([
        readHabits(mockSheetId),
        readLogs(mockSheetId),
        readMetadata(mockSheetId),
      ]);

      await expect(reads).resolves.toBeDefined();
      expect(fetchMock).toHaveBeenCalledTimes(3);
    });
  });
});
