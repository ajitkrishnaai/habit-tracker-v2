/**
 * Data Validation Tests
 *
 * Tests for data validation utilities
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  validateHabitName,
  validateCategory,
  validateDate,
  validateNotes,
  validateLogStatus,
  validateHabitStatus,
  validateUUID,
  validateHabit,
  sanitizeHabitName,
  sanitizeCategory,
  sanitizeNotes,
} from './dataValidation';
import { storageService } from '../services/storage';
import type { Habit } from '../types/habit';

describe('Data Validation', () => {
  beforeEach(async () => {
    await storageService.initDB();
    await storageService.clearAll();
  });

  afterEach(async () => {
    await storageService.clearAll();
    storageService.close();
  });

  describe('validateHabitName', () => {
    it('should reject empty name', async () => {
      const result = await validateHabitName('');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('cannot be empty');
    });

    it('should reject whitespace-only name', async () => {
      const result = await validateHabitName('   ');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('cannot be empty');
    });

    it('should reject name longer than 100 characters', async () => {
      const longName = 'a'.repeat(101);
      const result = await validateHabitName(longName);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('100 characters');
    });

    it('should accept valid name', async () => {
      const result = await validateHabitName('Morning Exercise');
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should accept name with exactly 100 characters', async () => {
      const name = 'a'.repeat(100);
      const result = await validateHabitName(name);
      expect(result.isValid).toBe(true);
    });

    it('should detect duplicate names (case-insensitive)', async () => {
      const habit: Habit = {
        habit_id: 'habit_1',
        name: 'Morning Exercise',
        status: 'active',
        created_date: '2025-01-01',
        modified_date: '2025-01-01',
      };

      await storageService.saveHabit(habit);

      const result = await validateHabitName('morning exercise');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('already exists');
    });

    it('should allow same name when editing existing habit', async () => {
      const habit: Habit = {
        habit_id: 'habit_1',
        name: 'Morning Exercise',
        status: 'active',
        created_date: '2025-01-01',
        modified_date: '2025-01-01',
      };

      await storageService.saveHabit(habit);

      const result = await validateHabitName('Morning Exercise', 'habit_1');
      expect(result.isValid).toBe(true);
    });

    it('should trim whitespace before validation', async () => {
      const result = await validateHabitName('  Morning Exercise  ');
      expect(result.isValid).toBe(true);
    });
  });

  describe('validateCategory', () => {
    it('should accept undefined category', () => {
      const result = validateCategory(undefined);
      expect(result.isValid).toBe(true);
    });

    it('should accept valid category', () => {
      const result = validateCategory('Health');
      expect(result.isValid).toBe(true);
    });

    it('should reject empty string category', () => {
      const result = validateCategory('   ');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('cannot be empty');
    });

    it('should reject category longer than 50 characters', () => {
      const longCategory = 'a'.repeat(51);
      const result = validateCategory(longCategory);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('50 characters');
    });
  });

  describe('validateDate', () => {
    it('should accept today\'s date', () => {
      const today = new Date().toISOString().split('T')[0];
      const result = validateDate(today);
      expect(result.isValid).toBe(true);
    });

    it('should accept date within 5 days past', () => {
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      const dateStr = threeDaysAgo.toISOString().split('T')[0];

      const result = validateDate(dateStr);
      expect(result.isValid).toBe(true);
    });

    it('should reject date more than 5 days in past', () => {
      const sixDaysAgo = new Date();
      sixDaysAgo.setDate(sixDaysAgo.getDate() - 6);
      const dateStr = sixDaysAgo.toISOString().split('T')[0];

      const result = validateDate(dateStr);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('5 days in the past');
    });

    it('should reject future date', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dateStr = tomorrow.toISOString().split('T')[0];

      const result = validateDate(dateStr);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('cannot be in the future');
    });

    it('should reject invalid date format', () => {
      const result = validateDate('2025/01/01');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('ISO 8601');
    });

    it('should reject invalid date', () => {
      const result = validateDate('2025-13-45');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Invalid date');
    });

    it('should accept date at exactly 5 days ago', () => {
      const fiveDaysAgo = new Date();
      fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
      const dateStr = fiveDaysAgo.toISOString().split('T')[0];

      const result = validateDate(dateStr);
      expect(result.isValid).toBe(true);
    });
  });

  describe('validateNotes', () => {
    it('should accept undefined notes', () => {
      const result = validateNotes(undefined);
      expect(result.isValid).toBe(true);
    });

    it('should accept empty notes', () => {
      const result = validateNotes('');
      expect(result.isValid).toBe(true);
    });

    it('should accept valid notes', () => {
      const result = validateNotes('Completed morning exercise at 7am');
      expect(result.isValid).toBe(true);
    });

    it('should reject notes longer than 5000 characters', () => {
      const longNotes = 'a'.repeat(5001);
      const result = validateNotes(longNotes);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('5000 characters');
    });

    it('should accept notes with exactly 5000 characters', () => {
      const notes = 'a'.repeat(5000);
      const result = validateNotes(notes);
      expect(result.isValid).toBe(true);
    });
  });

  describe('validateLogStatus', () => {
    it('should accept "done"', () => {
      const result = validateLogStatus('done');
      expect(result.isValid).toBe(true);
    });

    it('should accept "not_done"', () => {
      const result = validateLogStatus('not_done');
      expect(result.isValid).toBe(true);
    });

    it('should accept "no_data"', () => {
      const result = validateLogStatus('no_data');
      expect(result.isValid).toBe(true);
    });

    it('should reject invalid status', () => {
      const result = validateLogStatus('completed');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('done, not_done, no_data');
    });
  });

  describe('validateHabitStatus', () => {
    it('should accept "active"', () => {
      const result = validateHabitStatus('active');
      expect(result.isValid).toBe(true);
    });

    it('should accept "inactive"', () => {
      const result = validateHabitStatus('inactive');
      expect(result.isValid).toBe(true);
    });

    it('should reject invalid status', () => {
      const result = validateHabitStatus('archived');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('active, inactive');
    });
  });

  describe('validateUUID', () => {
    it('should accept valid UUID-like string', () => {
      const result = validateUUID('habit_123456789');
      expect(result.isValid).toBe(true);
    });

    it('should reject empty string', () => {
      const result = validateUUID('');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('cannot be empty');
    });

    it('should reject very short ID', () => {
      const result = validateUUID('abc');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('too short');
    });
  });

  describe('validateHabit', () => {
    it('should reject habit without name', async () => {
      const habit = {
        habit_id: 'habit_1',
        status: 'active' as const,
      };

      const result = await validateHabit(habit, true);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('required');
    });

    it('should accept valid new habit', async () => {
      const habit: Partial<Habit> = {
        name: 'Morning Exercise',
        category: 'Health',
        status: 'active',
        created_date: '2025-01-01',
        modified_date: '2025-01-01',
      };

      const result = await validateHabit(habit, true);
      expect(result.isValid).toBe(true);
    });

    it('should validate habit name', async () => {
      const habit: Partial<Habit> = {
        name: '',
      };

      const result = await validateHabit(habit, true);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('required');
    });

    it('should validate category', async () => {
      const habit: Partial<Habit> = {
        name: 'Test',
        category: 'a'.repeat(51),
      };

      const result = await validateHabit(habit, true);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('50 characters');
    });

    it('should validate status', async () => {
      const habit: any = {
        name: 'Test',
        status: 'invalid',
      };

      const result = await validateHabit(habit, true);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('active, inactive');
    });
  });

  describe('Sanitization Functions', () => {
    describe('sanitizeHabitName', () => {
      it('should trim whitespace', () => {
        expect(sanitizeHabitName('  Morning Exercise  ')).toBe('Morning Exercise');
      });

      it('should preserve internal whitespace', () => {
        expect(sanitizeHabitName('Morning  Exercise')).toBe('Morning  Exercise');
      });
    });

    describe('sanitizeCategory', () => {
      it('should trim whitespace', () => {
        expect(sanitizeCategory('  Health  ')).toBe('Health');
      });

      it('should return undefined for empty string', () => {
        expect(sanitizeCategory('   ')).toBeUndefined();
      });

      it('should return undefined for undefined', () => {
        expect(sanitizeCategory(undefined)).toBeUndefined();
      });
    });

    describe('sanitizeNotes', () => {
      it('should trim whitespace', () => {
        expect(sanitizeNotes('  Great workout  ')).toBe('Great workout');
      });

      it('should return undefined for empty string', () => {
        expect(sanitizeNotes('   ')).toBeUndefined();
      });

      it('should return undefined for undefined', () => {
        expect(sanitizeNotes(undefined)).toBeUndefined();
      });
    });
  });
});
