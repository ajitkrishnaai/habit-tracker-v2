/**
 * Tests for Percentage Calculator Utility
 */

import { describe, it, expect } from 'vitest';
import {
  calculateCompletionPercentage,
  formatCompletionStats,
} from './percentageCalculator';
import { LogEntry } from '../types/logEntry';

describe('percentageCalculator', () => {
  const createLog = (
    id: string,
    status: 'done' | 'not_done' | 'no_data'
  ): LogEntry => ({
    log_id: id,
    habit_id: 'habit-1',
    date: '2025-01-01',
    status,
    timestamp: new Date().toISOString(),
  });

  describe('calculateCompletionPercentage', () => {
    it('should return zero stats for empty logs array', () => {
      const result = calculateCompletionPercentage([]);
      expect(result).toEqual({
        doneCount: 0,
        totalLoggedDays: 0,
        percentage: 0,
        fractionText: '0/0 days',
        percentageText: '0%',
      });
    });

    it('should calculate 100% for all done entries', () => {
      const logs = [
        createLog('1', 'done'),
        createLog('2', 'done'),
        createLog('3', 'done'),
      ];
      const result = calculateCompletionPercentage(logs);
      expect(result).toEqual({
        doneCount: 3,
        totalLoggedDays: 3,
        percentage: 100,
        fractionText: '3/3 days',
        percentageText: '100%',
      });
    });

    it('should calculate 0% for all not_done entries', () => {
      const logs = [
        createLog('1', 'not_done'),
        createLog('2', 'not_done'),
        createLog('3', 'not_done'),
      ];
      const result = calculateCompletionPercentage(logs);
      expect(result).toEqual({
        doneCount: 0,
        totalLoggedDays: 3,
        percentage: 0,
        fractionText: '0/3 days',
        percentageText: '0%',
      });
    });

    it('should exclude no_data entries from calculation', () => {
      const logs = [
        createLog('1', 'done'),
        createLog('2', 'done'),
        createLog('3', 'no_data'),
        createLog('4', 'no_data'),
      ];
      const result = calculateCompletionPercentage(logs);
      expect(result).toEqual({
        doneCount: 2,
        totalLoggedDays: 2,
        percentage: 100,
        fractionText: '2/2 days',
        percentageText: '100%',
      });
    });

    it('should calculate correct percentage for mixed entries', () => {
      const logs = [
        createLog('1', 'done'),
        createLog('2', 'done'),
        createLog('3', 'done'),
        createLog('4', 'not_done'),
        createLog('5', 'not_done'),
      ];
      const result = calculateCompletionPercentage(logs);
      expect(result).toEqual({
        doneCount: 3,
        totalLoggedDays: 5,
        percentage: 60,
        fractionText: '3/5 days',
        percentageText: '60%',
      });
    });

    it('should round percentage to 1 decimal place', () => {
      const logs = [
        createLog('1', 'done'),
        createLog('2', 'done'),
        createLog('3', 'done'),
        createLog('4', 'done'),
        createLog('5', 'done'),
        createLog('6', 'done'),
        createLog('7', 'not_done'),
      ];
      const result = calculateCompletionPercentage(logs);
      // 6/7 = 85.714...
      expect(result.percentage).toBe(85.7);
      expect(result.percentageText).toBe('85.7%');
    });

    it('should handle the PRD example: 17/20 days = 85%', () => {
      const logs = [
        ...Array.from({ length: 17 }, (_, i) => createLog(`done-${i}`, 'done')),
        ...Array.from({ length: 3 }, (_, i) =>
          createLog(`not-${i}`, 'not_done')
        ),
      ];
      const result = calculateCompletionPercentage(logs);
      expect(result).toEqual({
        doneCount: 17,
        totalLoggedDays: 20,
        percentage: 85,
        fractionText: '17/20 days',
        percentageText: '85%',
      });
    });

    it('should exclude no_data from mixed entries', () => {
      const logs = [
        createLog('1', 'done'),
        createLog('2', 'done'),
        createLog('3', 'done'),
        createLog('4', 'not_done'),
        createLog('5', 'no_data'),
        createLog('6', 'no_data'),
        createLog('7', 'no_data'),
      ];
      const result = calculateCompletionPercentage(logs);
      expect(result).toEqual({
        doneCount: 3,
        totalLoggedDays: 4,
        percentage: 75,
        fractionText: '3/4 days',
        percentageText: '75%',
      });
    });

    it('should handle only no_data entries', () => {
      const logs = [
        createLog('1', 'no_data'),
        createLog('2', 'no_data'),
      ];
      const result = calculateCompletionPercentage(logs);
      expect(result).toEqual({
        doneCount: 0,
        totalLoggedDays: 0,
        percentage: 0,
        fractionText: '0/0 days',
        percentageText: '0%',
      });
    });

    it('should handle single done entry', () => {
      const logs = [createLog('1', 'done')];
      const result = calculateCompletionPercentage(logs);
      expect(result).toEqual({
        doneCount: 1,
        totalLoggedDays: 1,
        percentage: 100,
        fractionText: '1/1 days',
        percentageText: '100%',
      });
    });

    it('should handle single not_done entry', () => {
      const logs = [createLog('1', 'not_done')];
      const result = calculateCompletionPercentage(logs);
      expect(result).toEqual({
        doneCount: 0,
        totalLoggedDays: 1,
        percentage: 0,
        fractionText: '0/1 days',
        percentageText: '0%',
      });
    });
  });

  describe('formatCompletionStats', () => {
    it('should format stats correctly', () => {
      const stats = {
        doneCount: 17,
        totalLoggedDays: 20,
        percentage: 85,
        fractionText: '17/20 days',
        percentageText: '85%',
      };
      expect(formatCompletionStats(stats)).toBe('17/20 days - 85%');
    });

    it('should format zero stats correctly', () => {
      const stats = {
        doneCount: 0,
        totalLoggedDays: 0,
        percentage: 0,
        fractionText: '0/0 days',
        percentageText: '0%',
      };
      expect(formatCompletionStats(stats)).toBe('0/0 days - 0%');
    });

    it('should format decimal percentage correctly', () => {
      const stats = {
        doneCount: 6,
        totalLoggedDays: 7,
        percentage: 85.7,
        fractionText: '6/7 days',
        percentageText: '85.7%',
      };
      expect(formatCompletionStats(stats)).toBe('6/7 days - 85.7%');
    });
  });
});
