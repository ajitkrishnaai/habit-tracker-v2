/**
 * Unit tests for reflectionDataBuilder
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  buildReflectionPayload,
  getTimeOfDay,
  type PendingChange
} from './reflectionDataBuilder';
import { storageService } from '../services/storage';
import type { LogEntry } from '../types/logEntry';
import type { Habit } from '../types/habit';

// Mock storage service
vi.mock('../services/storage', () => ({
  storageService: {
    getLogs: vi.fn(),
    getHabits: vi.fn()
  }
}));

// Mock date helpers to use consistent dates
vi.mock('./dateHelpers', () => ({
  formatDateISO: (date: Date) => date.toISOString().split('T')[0],
  getTodayAtMidnight: () => new Date('2025-11-16T00:00:00Z')
}));

describe('reflectionDataBuilder', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Set a consistent "today" date for all tests
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-11-16T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('getTimeOfDay', () => {
    it('should return "morning" for 8 AM', () => {
      vi.setSystemTime(new Date('2025-11-16T08:00:00'));
      expect(getTimeOfDay()).toBe('morning');
    });

    it('should return "afternoon" for 2 PM', () => {
      vi.setSystemTime(new Date('2025-11-16T14:00:00'));
      expect(getTimeOfDay()).toBe('afternoon');
    });

    it('should return "evening" for 8 PM', () => {
      vi.setSystemTime(new Date('2025-11-16T20:00:00'));
      expect(getTimeOfDay()).toBe('evening');
    });

    it('should return "evening" for 2 AM', () => {
      vi.setSystemTime(new Date('2025-11-16T02:00:00'));
      expect(getTimeOfDay()).toBe('evening');
    });
  });

  describe('buildReflectionPayload', () => {
    it('should build payload for single habit with 5-day streak', async () => {
      // Mock habit
      const mockHabit: Habit = {
        habit_id: 'habit_1',
        user_id: 'user_1',
        name: 'Meditation',
        category: 'Mindfulness',
        status: 'active',
        created_date: '2025-11-10',
        modified_date: '2025-11-10'
      };

      // Mock logs (5-day streak)
      const mockLogs: LogEntry[] = [
        { log_id: 'log_1', habit_id: 'habit_1', user_id: 'user_1', date: '2025-11-16', status: 'done', notes: '', timestamp: '2025-11-16T12:00:00Z' },
        { log_id: 'log_2', habit_id: 'habit_1', user_id: 'user_1', date: '2025-11-15', status: 'done', notes: '', timestamp: '2025-11-15T12:00:00Z' },
        { log_id: 'log_3', habit_id: 'habit_1', user_id: 'user_1', date: '2025-11-14', status: 'done', notes: '', timestamp: '2025-11-14T12:00:00Z' },
        { log_id: 'log_4', habit_id: 'habit_1', user_id: 'user_1', date: '2025-11-13', status: 'done', notes: '', timestamp: '2025-11-13T12:00:00Z' },
        { log_id: 'log_5', habit_id: 'habit_1', user_id: 'user_1', date: '2025-11-12', status: 'done', notes: '', timestamp: '2025-11-12T12:00:00Z' }
      ];

      vi.mocked(storageService.getHabits).mockResolvedValue([mockHabit]);
      vi.mocked(storageService.getLogs).mockResolvedValue(mockLogs);

      const pendingChanges = new Map<string, PendingChange>([
        ['habit_1', {
          habitId: 'habit_1',
          habitName: 'Meditation',
          habitCategory: 'Mindfulness',
          newStatus: 'done',
          previousStatus: 'no_data'
        }]
      ]);

      const payload = await buildReflectionPayload(pendingChanges, 'Feeling great today!');

      expect(payload.date).toBe('2025-11-16');
      expect(payload.note_text).toBe('Feeling great today!');
      expect(payload.habits).toHaveLength(1);
      expect(payload.habits[0]).toEqual({
        name: 'Meditation',
        status: 'done',
        streak_days: 5,
        completed_last_7_days: 5,
        completed_last_30_days: 5,
        category: 'Mindfulness'
      });
    });

    it('should build payload for multiple habits with mixed completion', async () => {
      const mockHabits: Habit[] = [
        {
          habit_id: 'habit_1',
          user_id: 'user_1',
          name: 'Meditation',
          category: 'Mindfulness',
          status: 'active',
          created_date: '2025-11-01',
          modified_date: '2025-11-01'
        },
        {
          habit_id: 'habit_2',
          user_id: 'user_1',
          name: 'Running',
          category: 'Fitness',
          status: 'active',
          created_date: '2025-11-01',
          modified_date: '2025-11-01'
        }
      ];

      const mockLogs: LogEntry[] = [
        // Meditation: 3-day streak
        { log_id: 'log_1', habit_id: 'habit_1', user_id: 'user_1', date: '2025-11-16', status: 'done', notes: '', timestamp: '2025-11-16T12:00:00Z' },
        { log_id: 'log_2', habit_id: 'habit_1', user_id: 'user_1', date: '2025-11-15', status: 'done', notes: '', timestamp: '2025-11-15T12:00:00Z' },
        { log_id: 'log_3', habit_id: 'habit_1', user_id: 'user_1', date: '2025-11-14', status: 'done', notes: '', timestamp: '2025-11-14T12:00:00Z' },

        // Running: 1-day streak (broke yesterday)
        { log_id: 'log_4', habit_id: 'habit_2', user_id: 'user_1', date: '2025-11-16', status: 'done', notes: '', timestamp: '2025-11-16T12:00:00Z' },
        { log_id: 'log_5', habit_id: 'habit_2', user_id: 'user_1', date: '2025-11-15', status: 'not_done', notes: '', timestamp: '2025-11-15T12:00:00Z' },
        { log_id: 'log_6', habit_id: 'habit_2', user_id: 'user_1', date: '2025-11-14', status: 'done', notes: '', timestamp: '2025-11-14T12:00:00Z' }
      ];

      vi.mocked(storageService.getHabits).mockResolvedValue(mockHabits);
      vi.mocked(storageService.getLogs).mockResolvedValue(mockLogs);

      const pendingChanges = new Map<string, PendingChange>([
        ['habit_1', {
          habitId: 'habit_1',
          habitName: 'Meditation',
          habitCategory: 'Mindfulness',
          newStatus: 'done'
        }],
        ['habit_2', {
          habitId: 'habit_2',
          habitName: 'Running',
          habitCategory: 'Fitness',
          newStatus: 'done'
        }]
      ]);

      const payload = await buildReflectionPayload(pendingChanges, 'Great workout day!');

      expect(payload.habits).toHaveLength(2);

      // Check Meditation stats
      const meditation = payload.habits.find(h => h.name === 'Meditation');
      expect(meditation).toBeDefined();
      expect(meditation?.streak_days).toBe(3);
      expect(meditation?.completed_last_7_days).toBe(3);

      // Check Running stats
      const running = payload.habits.find(h => h.name === 'Running');
      expect(running).toBeDefined();
      expect(running?.streak_days).toBe(1);
      expect(running?.completed_last_7_days).toBe(2); // 2 done in last 7 days
    });

    it('should handle first-time user with no logs', async () => {
      const mockHabit: Habit = {
        habit_id: 'habit_1',
        user_id: 'user_1',
        name: 'Meditation',
        category: 'Mindfulness',
        status: 'active',
        created_date: '2025-11-16',
        modified_date: '2025-11-16'
      };

      vi.mocked(storageService.getHabits).mockResolvedValue([mockHabit]);
      vi.mocked(storageService.getLogs).mockResolvedValue([]);

      const pendingChanges = new Map<string, PendingChange>([
        ['habit_1', {
          habitId: 'habit_1',
          habitName: 'Meditation',
          newStatus: 'done'
        }]
      ]);

      const payload = await buildReflectionPayload(pendingChanges, 'Starting my journey!');

      expect(payload.habits).toHaveLength(1);
      expect(payload.habits[0]).toEqual({
        name: 'Meditation',
        status: 'done',
        streak_days: 0, // No streak yet
        completed_last_7_days: 0,
        completed_last_30_days: 0,
        category: undefined
      });
      expect(payload.recent_summary.days_tracked_last_7).toBe(0);
      expect(payload.recent_summary.notable_observations).toEqual([]);
    });

    it('should truncate note text at 1000 characters', async () => {
      vi.mocked(storageService.getHabits).mockResolvedValue([]);
      vi.mocked(storageService.getLogs).mockResolvedValue([]);

      const longNote = 'a'.repeat(1500);
      const pendingChanges = new Map<string, PendingChange>();

      const payload = await buildReflectionPayload(pendingChanges, longNote);

      expect(payload.note_text).toHaveLength(1000);
      expect(payload.note_text).toBe('a'.repeat(1000));
    });

    it('should handle empty pending changes', async () => {
      vi.mocked(storageService.getHabits).mockResolvedValue([]);
      vi.mocked(storageService.getLogs).mockResolvedValue([]);

      const pendingChanges = new Map<string, PendingChange>();

      const payload = await buildReflectionPayload(pendingChanges, 'Just checking in');

      expect(payload.habits).toEqual([]);
      expect(payload.note_text).toBe('Just checking in');
      expect(payload.date).toBe('2025-11-16');
    });

    it('should include notable_observations field in recent_summary', async () => {
      const mockHabit: Habit = {
        habit_id: 'habit_1',
        user_id: 'user_1',
        name: 'Meditation',
        category: 'Mindfulness',
        status: 'active',
        created_date: '2025-10-20',
        modified_date: '2025-10-20'
      };

      // Create 5 logs with strongly positive sentiment notes in last 30 days
      const mockLogs: LogEntry[] = [
        { log_id: 'log_1', habit_id: 'habit_1', user_id: 'user_1', date: '2025-11-16', status: 'done', notes: 'Feeling wonderful, calm and peaceful today!', timestamp: '2025-11-16T12:00:00Z' },
        { log_id: 'log_2', habit_id: 'habit_1', user_id: 'user_1', date: '2025-11-15', status: 'done', notes: 'Very calm and great session, absolutely amazing!', timestamp: '2025-11-15T12:00:00Z' },
        { log_id: 'log_3', habit_id: 'habit_1', user_id: 'user_1', date: '2025-11-14', status: 'done', notes: 'Calm and focused, feeling fantastic!', timestamp: '2025-11-14T12:00:00Z' },
        { log_id: 'log_4', habit_id: 'habit_1', user_id: 'user_1', date: '2025-11-13', status: 'done', notes: 'Peaceful meditation, so relaxing and joyful', timestamp: '2025-11-13T12:00:00Z' },
        { log_id: 'log_5', habit_id: 'habit_1', user_id: 'user_1', date: '2025-11-12', status: 'done', notes: 'Amazing calm feeling, incredibly happy!', timestamp: '2025-11-12T12:00:00Z' }
      ];

      vi.mocked(storageService.getHabits).mockResolvedValue([mockHabit]);
      vi.mocked(storageService.getLogs).mockResolvedValue(mockLogs);

      const pendingChanges = new Map<string, PendingChange>([
        ['habit_1', {
          habitId: 'habit_1',
          habitName: 'Meditation',
          newStatus: 'done'
        }]
      ]);

      const payload = await buildReflectionPayload(pendingChanges, 'Another great meditation');

      // Check that notable_observations array exists (may be empty or populated)
      expect(Array.isArray(payload.recent_summary.notable_observations)).toBe(true);
      // If observations were generated, they should contain habit names
      if (payload.recent_summary.notable_observations.length > 0) {
        expect(payload.recent_summary.notable_observations[0]).toContain('Meditation');
      }
    });

    it('should calculate days_tracked correctly', async () => {
      const mockHabits: Habit[] = [
        {
          habit_id: 'habit_1',
          user_id: 'user_1',
          name: 'Meditation',
          status: 'active',
          created_date: '2025-10-01',
          modified_date: '2025-10-01'
        },
        {
          habit_id: 'habit_2',
          user_id: 'user_1',
          name: 'Running',
          status: 'active',
          created_date: '2025-10-01',
          modified_date: '2025-10-01'
        }
      ];

      // 6 unique dates in last 7 days, multiple habits per day
      const mockLogs: LogEntry[] = [
        { log_id: 'log_1', habit_id: 'habit_1', user_id: 'user_1', date: '2025-11-16', status: 'done', notes: '', timestamp: '2025-11-16T12:00:00Z' },
        { log_id: 'log_2', habit_id: 'habit_2', user_id: 'user_1', date: '2025-11-16', status: 'done', notes: '', timestamp: '2025-11-16T12:00:00Z' },
        { log_id: 'log_3', habit_id: 'habit_1', user_id: 'user_1', date: '2025-11-15', status: 'done', notes: '', timestamp: '2025-11-15T12:00:00Z' },
        { log_id: 'log_4', habit_id: 'habit_2', user_id: 'user_1', date: '2025-11-15', status: 'done', notes: '', timestamp: '2025-11-15T12:00:00Z' },
        { log_id: 'log_5', habit_id: 'habit_1', user_id: 'user_1', date: '2025-11-14', status: 'done', notes: '', timestamp: '2025-11-14T12:00:00Z' },
        { log_id: 'log_6', habit_id: 'habit_1', user_id: 'user_1', date: '2025-11-13', status: 'done', notes: '', timestamp: '2025-11-13T12:00:00Z' },
        { log_id: 'log_7', habit_id: 'habit_1', user_id: 'user_1', date: '2025-11-12', status: 'done', notes: '', timestamp: '2025-11-12T12:00:00Z' },
        { log_id: 'log_8', habit_id: 'habit_1', user_id: 'user_1', date: '2025-11-11', status: 'done', notes: '', timestamp: '2025-11-11T12:00:00Z' }
      ];

      vi.mocked(storageService.getHabits).mockResolvedValue(mockHabits);
      vi.mocked(storageService.getLogs).mockResolvedValue(mockLogs);

      const pendingChanges = new Map<string, PendingChange>([
        ['habit_1', {
          habitId: 'habit_1',
          habitName: 'Meditation',
          newStatus: 'done'
        }]
      ]);

      const payload = await buildReflectionPayload(pendingChanges, 'Test');

      expect(payload.recent_summary.days_tracked_last_7).toBe(6);
    });

    it('should handle storage errors gracefully', async () => {
      vi.mocked(storageService.getHabits).mockRejectedValue(new Error('IndexedDB error'));
      vi.mocked(storageService.getLogs).mockRejectedValue(new Error('IndexedDB error'));

      const pendingChanges = new Map<string, PendingChange>([
        ['habit_1', {
          habitId: 'habit_1',
          habitName: 'Meditation',
          newStatus: 'done'
        }]
      ]);

      const payload = await buildReflectionPayload(pendingChanges, 'Error test');

      // Should return minimal payload on error
      expect(payload.date).toBe('2025-11-16');
      expect(payload.note_text).toBe('Error test');
      expect(payload.habits).toEqual([]);
      expect(payload.recent_summary.days_tracked_last_7).toBe(0);
    });
  });
});
