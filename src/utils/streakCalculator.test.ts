/**
 * Tests for Streak Calculator Utility
 */

import { describe, it, expect } from 'vitest';
import {
  calculateCurrentStreak,
  calculateLongestStreak,
  calculateStreaks,
} from './streakCalculator';
import { LogEntry } from '../types/logEntry';

describe('streakCalculator', () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  const createLog = (
    daysAgo: number,
    status: 'done' | 'not_done' | 'no_data'
  ): LogEntry => {
    const date = new Date(today);
    date.setDate(date.getDate() - daysAgo);
    return {
      log_id: `log-${daysAgo}`,
      habit_id: 'habit-1',
      date: formatDate(date),
      status,
      timestamp: date.toISOString(),
    };
  };

  describe('calculateCurrentStreak', () => {
    it('should return 0 for empty logs array', () => {
      expect(calculateCurrentStreak([])).toBe(0);
    });

    it('should return 1 for single done entry today', () => {
      const logs = [createLog(0, 'done')];
      expect(calculateCurrentStreak(logs)).toBe(1);
    });

    it('should calculate consecutive done days from today', () => {
      const logs = [
        createLog(0, 'done'),
        createLog(1, 'done'),
        createLog(2, 'done'),
      ];
      expect(calculateCurrentStreak(logs)).toBe(3);
    });

    it('should reset to 0 when not_done is encountered', () => {
      const logs = [
        createLog(0, 'not_done'),
        createLog(1, 'done'),
        createLog(2, 'done'),
      ];
      expect(calculateCurrentStreak(logs)).toBe(0);
    });

    it('should stop counting at first gap (no log entry)', () => {
      const logs = [
        createLog(0, 'done'),
        createLog(1, 'done'),
        // No log for day 2
        createLog(3, 'done'),
      ];
      expect(calculateCurrentStreak(logs)).toBe(2);
    });

    it('should handle streak in the past (not including today)', () => {
      const logs = [
        // No log for today
        createLog(1, 'done'),
        createLog(2, 'done'),
        createLog(3, 'done'),
      ];
      expect(calculateCurrentStreak(logs)).toBe(0);
    });

    it('should stop at no_data status', () => {
      const logs = [
        createLog(0, 'done'),
        createLog(1, 'no_data'),
        createLog(2, 'done'),
      ];
      expect(calculateCurrentStreak(logs)).toBe(1);
    });

    it('should handle longer streak', () => {
      const logs = Array.from({ length: 10 }, (_, i) => createLog(i, 'done'));
      expect(calculateCurrentStreak(logs)).toBe(10);
    });

    it('should handle streak broken in the middle', () => {
      const logs = [
        createLog(0, 'done'),
        createLog(1, 'done'),
        createLog(2, 'not_done'),
        createLog(3, 'done'),
        createLog(4, 'done'),
      ];
      expect(calculateCurrentStreak(logs)).toBe(2);
    });
  });

  describe('calculateLongestStreak', () => {
    it('should return 0 for empty logs array', () => {
      expect(calculateLongestStreak([])).toBe(0);
    });

    it('should return 1 for single done entry', () => {
      const logs = [createLog(0, 'done')];
      expect(calculateLongestStreak(logs)).toBe(1);
    });

    it('should calculate longest consecutive streak', () => {
      const logs = [
        createLog(0, 'done'),
        createLog(1, 'done'),
        createLog(2, 'done'),
      ];
      expect(calculateLongestStreak(logs)).toBe(3);
    });

    it('should find longest streak when multiple streaks exist', () => {
      const logs = [
        createLog(0, 'done'),
        createLog(1, 'done'),
        createLog(2, 'not_done'),
        createLog(3, 'done'),
        createLog(4, 'done'),
        createLog(5, 'done'),
        createLog(6, 'done'),
      ];
      expect(calculateLongestStreak(logs)).toBe(4);
    });

    it('should handle streak reset by not_done', () => {
      const logs = [
        createLog(0, 'done'),
        createLog(1, 'not_done'),
        createLog(2, 'done'),
      ];
      expect(calculateLongestStreak(logs)).toBe(1);
    });

    it('should handle gaps in dates', () => {
      const logs = [
        createLog(0, 'done'),
        createLog(1, 'done'),
        // Gap at day 2
        createLog(3, 'done'),
        createLog(4, 'done'),
        createLog(5, 'done'),
      ];
      expect(calculateLongestStreak(logs)).toBe(3);
    });

    it('should ignore no_data entries', () => {
      const logs = [
        createLog(0, 'done'),
        createLog(1, 'done'),
        createLog(2, 'no_data'),
        createLog(3, 'done'),
      ];
      expect(calculateLongestStreak(logs)).toBe(2);
    });

    it('should handle all not_done entries', () => {
      const logs = [
        createLog(0, 'not_done'),
        createLog(1, 'not_done'),
        createLog(2, 'not_done'),
      ];
      expect(calculateLongestStreak(logs)).toBe(0);
    });

    it('should handle mixed statuses', () => {
      const logs = [
        createLog(0, 'done'),
        createLog(1, 'done'),
        createLog(2, 'done'),
        createLog(3, 'not_done'),
        createLog(4, 'done'),
        createLog(5, 'done'),
        createLog(6, 'not_done'),
        createLog(7, 'done'),
        createLog(8, 'done'),
        createLog(9, 'done'),
        createLog(10, 'done'),
        createLog(11, 'done'),
      ];
      expect(calculateLongestStreak(logs)).toBe(5);
    });
  });

  describe('calculateStreaks', () => {
    it('should return both current and longest streaks', () => {
      const logs = [
        createLog(0, 'done'),
        createLog(1, 'done'),
        createLog(2, 'not_done'),
        createLog(3, 'done'),
        createLog(4, 'done'),
        createLog(5, 'done'),
      ];
      const result = calculateStreaks(logs);
      expect(result).toEqual({
        current: 2,
        longest: 3,
      });
    });

    it('should handle current streak being the longest', () => {
      const logs = [
        createLog(0, 'done'),
        createLog(1, 'done'),
        createLog(2, 'done'),
        createLog(3, 'done'),
        createLog(4, 'not_done'),
        createLog(5, 'done'),
        createLog(6, 'done'),
      ];
      const result = calculateStreaks(logs);
      expect(result).toEqual({
        current: 4,
        longest: 4,
      });
    });

    it('should handle empty logs', () => {
      const result = calculateStreaks([]);
      expect(result).toEqual({
        current: 0,
        longest: 0,
      });
    });
  });
});
