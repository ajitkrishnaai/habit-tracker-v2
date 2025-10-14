/**
 * Storage Service Tests
 *
 * Tests for IndexedDB storage operations
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { StorageService } from './storage';
import type { Habit } from '../types/habit';
import type { LogEntry } from '../types/logEntry';
import type { Metadata } from '../types/metadata';

describe('StorageService', () => {
  let storageService: StorageService;

  beforeEach(async () => {
    storageService = new StorageService();
    await storageService.initDB();
  });

  afterEach(async () => {
    // Clear all data after each test
    await storageService.clearAll();
    storageService.close();
  });

  describe('initDB', () => {
    it('should initialize the database', async () => {
      // DB is already initialized in beforeEach
      // Just verify we can perform operations
      const habits = await storageService.getHabits();
      expect(Array.isArray(habits)).toBe(true);
    });

    it('should handle multiple initialization calls', async () => {
      await storageService.initDB();
      await storageService.initDB();
      const habits = await storageService.getHabits();
      expect(Array.isArray(habits)).toBe(true);
    });
  });

  describe('Habit Operations', () => {
    const mockHabit: Habit = {
      habit_id: 'habit_test-1',
      name: 'Morning Exercise',
      category: 'Health',
      status: 'active',
      created_date: '2025-01-01',
      modified_date: '2025-01-01',
    };

    it('should save a single habit', async () => {
      await storageService.saveHabit(mockHabit);
      const habit = await storageService.getHabit(mockHabit.habit_id);
      expect(habit).toEqual(mockHabit);
    });

    it('should save multiple habits', async () => {
      const habits: Habit[] = [
        mockHabit,
        {
          ...mockHabit,
          habit_id: 'habit_test-2',
          name: 'Read Books',
        },
      ];

      await storageService.saveHabits(habits);
      const retrieved = await storageService.getHabits();
      expect(retrieved.length).toBe(2);
    });

    it('should retrieve all habits', async () => {
      await storageService.saveHabit(mockHabit);
      const habits = await storageService.getHabits();
      expect(habits.length).toBe(1);
      expect(habits[0]).toEqual(mockHabit);
    });

    it('should retrieve only active habits', async () => {
      const activeHabit = mockHabit;
      const inactiveHabit: Habit = {
        ...mockHabit,
        habit_id: 'habit_test-2',
        name: 'Inactive Habit',
        status: 'inactive',
      };

      await storageService.saveHabits([activeHabit, inactiveHabit]);
      const activeHabits = await storageService.getHabits(true);

      expect(activeHabits.length).toBe(1);
      expect(activeHabits[0].status).toBe('active');
    });

    it('should retrieve a single habit by ID', async () => {
      await storageService.saveHabit(mockHabit);
      const habit = await storageService.getHabit(mockHabit.habit_id);
      expect(habit).toEqual(mockHabit);
    });

    it('should return null for non-existent habit', async () => {
      const habit = await storageService.getHabit('non-existent-id');
      expect(habit).toBeNull();
    });

    it('should mark habit as inactive when deleted', async () => {
      await storageService.saveHabit(mockHabit);
      await storageService.deleteHabit(mockHabit.habit_id);

      const habit = await storageService.getHabit(mockHabit.habit_id);
      expect(habit).not.toBeNull();
      expect(habit?.status).toBe('inactive');
    });

    it('should update habit when saved again', async () => {
      await storageService.saveHabit(mockHabit);

      const updatedHabit = {
        ...mockHabit,
        name: 'Updated Exercise',
        modified_date: '2025-01-02',
      };

      await storageService.saveHabit(updatedHabit);
      const habit = await storageService.getHabit(mockHabit.habit_id);
      expect(habit?.name).toBe('Updated Exercise');
    });

    it('should sort habits by created_date', async () => {
      const habit1: Habit = {
        ...mockHabit,
        habit_id: 'habit_1',
        created_date: '2025-01-03',
      };
      const habit2: Habit = {
        ...mockHabit,
        habit_id: 'habit_2',
        name: 'Second',
        created_date: '2025-01-01',
      };
      const habit3: Habit = {
        ...mockHabit,
        habit_id: 'habit_3',
        name: 'Third',
        created_date: '2025-01-02',
      };

      await storageService.saveHabits([habit1, habit2, habit3]);
      const habits = await storageService.getHabits();

      expect(habits[0].habit_id).toBe('habit_2');
      expect(habits[1].habit_id).toBe('habit_3');
      expect(habits[2].habit_id).toBe('habit_1');
    });
  });

  describe('Log Operations', () => {
    const mockLog: LogEntry = {
      log_id: 'log_test-1',
      habit_id: 'habit_test-1',
      date: '2025-01-01',
      status: 'done',
      notes: 'Completed morning exercise',
      timestamp: '2025-01-01T08:00:00Z',
    };

    it('should save a single log entry', async () => {
      await storageService.saveLog(mockLog);
      const logs = await storageService.getLogs();
      expect(logs.length).toBe(1);
      expect(logs[0]).toEqual(mockLog);
    });

    it('should save multiple log entries', async () => {
      const logs: LogEntry[] = [
        mockLog,
        {
          ...mockLog,
          log_id: 'log_test-2',
          date: '2025-01-02',
        },
      ];

      await storageService.saveLogs(logs);
      const retrieved = await storageService.getLogs();
      expect(retrieved.length).toBe(2);
    });

    it('should retrieve all logs', async () => {
      await storageService.saveLog(mockLog);
      const logs = await storageService.getLogs();
      expect(logs.length).toBe(1);
    });

    it('should filter logs by habit_id', async () => {
      const log1 = mockLog;
      const log2: LogEntry = {
        ...mockLog,
        log_id: 'log_test-2',
        habit_id: 'habit_test-2',
      };

      await storageService.saveLogs([log1, log2]);
      const logs = await storageService.getLogs('habit_test-1');

      expect(logs.length).toBe(1);
      expect(logs[0].habit_id).toBe('habit_test-1');
    });

    it('should filter logs by date', async () => {
      const log1 = mockLog;
      const log2: LogEntry = {
        ...mockLog,
        log_id: 'log_test-2',
        date: '2025-01-02',
      };

      await storageService.saveLogs([log1, log2]);
      const logs = await storageService.getLogs(undefined, '2025-01-01');

      expect(logs.length).toBe(1);
      expect(logs[0].date).toBe('2025-01-01');
    });

    it('should filter logs by habit_id and date', async () => {
      const logs: LogEntry[] = [
        mockLog,
        {
          ...mockLog,
          log_id: 'log_test-2',
          habit_id: 'habit_test-2',
          date: '2025-01-01',
        },
        {
          ...mockLog,
          log_id: 'log_test-3',
          habit_id: 'habit_test-1',
          date: '2025-01-02',
        },
      ];

      await storageService.saveLogs(logs);
      const filtered = await storageService.getLogs('habit_test-1', '2025-01-01');

      expect(filtered.length).toBe(1);
      expect(filtered[0].habit_id).toBe('habit_test-1');
      expect(filtered[0].date).toBe('2025-01-01');
    });

    it('should update log when saved again', async () => {
      await storageService.saveLog(mockLog);

      const updatedLog = {
        ...mockLog,
        status: 'not_done' as const,
        notes: 'Skipped today',
      };

      await storageService.saveLog(updatedLog);
      const logs = await storageService.getLogs(mockLog.habit_id, mockLog.date);
      expect(logs[0].status).toBe('not_done');
      expect(logs[0].notes).toBe('Skipped today');
    });
  });

  describe('Metadata Operations', () => {
    const mockMetadata: Metadata = {
      sheet_version: '1.0',
      last_sync: '2025-01-01T10:00:00Z',
      user_id: 'user_123',
      sheet_id: 'sheet_abc',
    };

    it('should save metadata', async () => {
      await storageService.saveMetadata(mockMetadata);
      const metadata = await storageService.getMetadata();
      expect(metadata).toEqual(mockMetadata);
    });

    it('should retrieve metadata', async () => {
      await storageService.saveMetadata(mockMetadata);
      const metadata = await storageService.getMetadata();
      expect(metadata).not.toBeNull();
      expect(metadata?.user_id).toBe('user_123');
    });

    it('should return null when no metadata exists', async () => {
      const metadata = await storageService.getMetadata();
      expect(metadata).toBeNull();
    });

    it('should update metadata when saved again', async () => {
      await storageService.saveMetadata(mockMetadata);

      const updatedMetadata = {
        ...mockMetadata,
        last_sync: '2025-01-02T10:00:00Z',
      };

      await storageService.saveMetadata(updatedMetadata);
      const metadata = await storageService.getMetadata();
      expect(metadata?.last_sync).toBe('2025-01-02T10:00:00Z');
    });
  });

  describe('clearAll', () => {
    it('should clear all data from the database', async () => {
      const mockHabit: Habit = {
        habit_id: 'habit_test-1',
        name: 'Test Habit',
        status: 'active',
        created_date: '2025-01-01',
        modified_date: '2025-01-01',
      };

      const mockLog: LogEntry = {
        log_id: 'log_test-1',
        habit_id: 'habit_test-1',
        date: '2025-01-01',
        status: 'done',
        timestamp: '2025-01-01T08:00:00Z',
      };

      const mockMetadata: Metadata = {
        sheet_version: '1.0',
        last_sync: '2025-01-01T10:00:00Z',
        user_id: 'user_123',
        sheet_id: 'sheet_abc',
      };

      await storageService.saveHabit(mockHabit);
      await storageService.saveLog(mockLog);
      await storageService.saveMetadata(mockMetadata);

      await storageService.clearAll();

      const habits = await storageService.getHabits();
      const logs = await storageService.getLogs();
      const metadata = await storageService.getMetadata();

      expect(habits.length).toBe(0);
      expect(logs.length).toBe(0);
      expect(metadata).toBeNull();
    });
  });
});
