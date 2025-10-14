/**
 * Date Helpers Tests
 *
 * Unit tests for date manipulation and formatting utilities.
 */

import { describe, it, expect } from 'vitest';
import {
  formatDateISO,
  formatDateDisplay,
  getPreviousDate,
  getNextDate,
  isWithinAllowedPastRange,
  canNavigateToPreviousDay,
  isTodayDate,
  getTodayAtMidnight,
  getCurrentTimestamp,
  MAX_PAST_DAYS,
} from './dateHelpers';

describe('dateHelpers', () => {
  describe('formatDateISO', () => {
    it('should format date as YYYY-MM-DD', () => {
      const date = new Date('2025-10-13T15:30:00');
      expect(formatDateISO(date)).toBe('2025-10-13');
    });

    it('should handle dates with single digit months/days', () => {
      const date = new Date('2025-01-05T10:00:00');
      expect(formatDateISO(date)).toBe('2025-01-05');
    });
  });

  describe('formatDateDisplay', () => {
    it('should show "Today" for current date', () => {
      const today = new Date();
      const display = formatDateDisplay(today);
      expect(display).toContain('Today');
    });

    it('should show "Yesterday" for previous day', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const display = formatDateDisplay(yesterday);
      expect(display).toContain('Yesterday');
    });

    it('should show full date for past dates', () => {
      const pastDate = new Date('2025-10-01T00:00:00');
      const display = formatDateDisplay(pastDate);
      expect(display).toMatch(/October \d+, 2025/);
    });
  });

  describe('getPreviousDate', () => {
    it('should get date 1 day before', () => {
      const date = new Date('2025-10-13T00:00:00');
      const previous = getPreviousDate(date);
      expect(formatDateISO(previous)).toBe('2025-10-12');
    });

    it('should get date N days before', () => {
      const date = new Date('2025-10-13T00:00:00');
      const previous = getPreviousDate(date, 5);
      expect(formatDateISO(previous)).toBe('2025-10-08');
    });
  });

  describe('getNextDate', () => {
    it('should get date 1 day after', () => {
      const date = new Date('2025-10-13T00:00:00');
      const next = getNextDate(date);
      expect(formatDateISO(next)).toBe('2025-10-14');
    });

    it('should get date N days after', () => {
      const date = new Date('2025-10-13T00:00:00');
      const next = getNextDate(date, 3);
      expect(formatDateISO(next)).toBe('2025-10-16');
    });
  });

  describe('isWithinAllowedPastRange', () => {
    it('should return true for today', () => {
      const today = new Date();
      expect(isWithinAllowedPastRange(today)).toBe(true);
    });

    it('should return true for dates within 5 days past', () => {
      const date = new Date();
      date.setDate(date.getDate() - 3);
      expect(isWithinAllowedPastRange(date)).toBe(true);
    });

    it('should return true for exactly 5 days in past', () => {
      const date = new Date();
      date.setDate(date.getDate() - MAX_PAST_DAYS);
      expect(isWithinAllowedPastRange(date)).toBe(true);
    });

    it('should return false for more than 5 days in past', () => {
      const date = new Date();
      date.setDate(date.getDate() - (MAX_PAST_DAYS + 1));
      expect(isWithinAllowedPastRange(date)).toBe(false);
    });

    it('should return false for future dates', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      expect(isWithinAllowedPastRange(futureDate)).toBe(false);
    });
  });

  describe('canNavigateToPreviousDay', () => {
    it('should return true when current date is today', () => {
      const today = new Date();
      expect(canNavigateToPreviousDay(today)).toBe(true);
    });

    it('should return true when 4 days in past (can go to 5th)', () => {
      const date = new Date();
      date.setDate(date.getDate() - 4);
      expect(canNavigateToPreviousDay(date)).toBe(true);
    });

    it('should return false when already at 5-day limit', () => {
      const date = new Date();
      date.setDate(date.getDate() - MAX_PAST_DAYS);
      expect(canNavigateToPreviousDay(date)).toBe(false);
    });
  });

  describe('isTodayDate', () => {
    it('should return true for today', () => {
      const today = new Date();
      expect(isTodayDate(today)).toBe(true);
    });

    it('should return false for yesterday', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      expect(isTodayDate(yesterday)).toBe(false);
    });

    it('should return false for tomorrow', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      expect(isTodayDate(tomorrow)).toBe(false);
    });
  });

  describe('getTodayAtMidnight', () => {
    it('should return today with time set to 00:00:00', () => {
      const today = getTodayAtMidnight();
      expect(today.getHours()).toBe(0);
      expect(today.getMinutes()).toBe(0);
      expect(today.getSeconds()).toBe(0);
      expect(today.getMilliseconds()).toBe(0);
    });
  });

  describe('getCurrentTimestamp', () => {
    it('should return ISO 8601 timestamp string', () => {
      const timestamp = getCurrentTimestamp();
      expect(timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });

    it('should be parseable as Date', () => {
      const timestamp = getCurrentTimestamp();
      const date = new Date(timestamp);
      expect(date).toBeInstanceOf(Date);
      expect(date.getTime()).not.toBeNaN();
    });
  });
});
