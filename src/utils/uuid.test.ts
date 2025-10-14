/**
 * UUID Utility Tests
 *
 * Tests for UUID generation and validation
 */

import { describe, it, expect } from 'vitest';
import {
  generateUUID,
  generateHabitId,
  generateLogId,
  isValidUUID,
  isValidHabitId,
  isValidLogId,
  generateShortId,
} from './uuid';

describe('UUID Utility', () => {
  describe('generateUUID', () => {
    it('should generate a valid UUID', () => {
      const uuid = generateUUID();
      expect(typeof uuid).toBe('string');
      expect(uuid.length).toBe(36); // UUID v4 format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
    });

    it('should generate unique UUIDs', () => {
      const uuid1 = generateUUID();
      const uuid2 = generateUUID();
      expect(uuid1).not.toBe(uuid2);
    });

    it('should generate UUID in correct format', () => {
      const uuid = generateUUID();
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      expect(uuidRegex.test(uuid)).toBe(true);
    });

    it('should have version 4 indicator', () => {
      const uuid = generateUUID();
      // The 15th character (index 14) should be '4' for UUID v4
      expect(uuid[14]).toBe('4');
    });

    it('should generate multiple unique UUIDs', () => {
      const uuids = new Set<string>();
      for (let i = 0; i < 100; i++) {
        uuids.add(generateUUID());
      }
      expect(uuids.size).toBe(100); // All should be unique
    });
  });

  describe('generateHabitId', () => {
    it('should generate habit ID with prefix', () => {
      const habitId = generateHabitId();
      expect(habitId.startsWith('habit_')).toBe(true);
    });

    it('should generate unique habit IDs', () => {
      const id1 = generateHabitId();
      const id2 = generateHabitId();
      expect(id1).not.toBe(id2);
    });

    it('should generate habit ID in correct format', () => {
      const habitId = generateHabitId();
      expect(habitId.length).toBeGreaterThan(10);
      expect(habitId.includes('habit_')).toBe(true);
    });
  });

  describe('generateLogId', () => {
    it('should generate log ID with prefix', () => {
      const logId = generateLogId();
      expect(logId.startsWith('log_')).toBe(true);
    });

    it('should generate unique log IDs', () => {
      const id1 = generateLogId();
      const id2 = generateLogId();
      expect(id1).not.toBe(id2);
    });

    it('should generate log ID in correct format', () => {
      const logId = generateLogId();
      expect(logId.length).toBeGreaterThan(10);
      expect(logId.includes('log_')).toBe(true);
    });
  });

  describe('isValidUUID', () => {
    it('should validate correct UUID v4', () => {
      const validUuid = '550e8400-e29b-41d4-a716-446655440000';
      expect(isValidUUID(validUuid)).toBe(true);
    });

    it('should validate generated UUID', () => {
      const uuid = generateUUID();
      expect(isValidUUID(uuid)).toBe(true);
    });

    it('should reject invalid UUID format', () => {
      expect(isValidUUID('not-a-uuid')).toBe(false);
      expect(isValidUUID('123')).toBe(false);
      expect(isValidUUID('')).toBe(false);
    });

    it('should reject UUID with wrong version', () => {
      // Version 3 UUID (should have '3' at position 14)
      const uuid = '550e8400-e29b-31d4-a716-446655440000';
      expect(isValidUUID(uuid)).toBe(false);
    });

    it('should be case insensitive', () => {
      const uuid = '550E8400-E29B-41D4-A716-446655440000';
      expect(isValidUUID(uuid)).toBe(true);
    });

    it('should reject UUID with invalid characters', () => {
      const invalidUuid = '550e8400-e29b-41d4-a716-44665544000g';
      expect(isValidUUID(invalidUuid)).toBe(false);
    });

    it('should reject UUID with wrong length', () => {
      const tooShort = '550e8400-e29b-41d4-a716';
      const tooLong = '550e8400-e29b-41d4-a716-446655440000-extra';
      expect(isValidUUID(tooShort)).toBe(false);
      expect(isValidUUID(tooLong)).toBe(false);
    });
  });

  describe('isValidHabitId', () => {
    it('should validate habit ID with correct prefix', () => {
      const habitId = generateHabitId();
      expect(isValidHabitId(habitId)).toBe(true);
    });

    it('should reject ID without habit_ prefix', () => {
      const uuid = generateUUID();
      expect(isValidHabitId(uuid)).toBe(false);
    });

    it('should reject ID with invalid UUID part', () => {
      const invalidId = 'habit_not-a-valid-uuid';
      expect(isValidHabitId(invalidId)).toBe(false);
    });

    it('should reject empty string', () => {
      expect(isValidHabitId('')).toBe(false);
    });

    it('should reject log ID', () => {
      const logId = generateLogId();
      expect(isValidHabitId(logId)).toBe(false);
    });
  });

  describe('isValidLogId', () => {
    it('should validate log ID with correct prefix', () => {
      const logId = generateLogId();
      expect(isValidLogId(logId)).toBe(true);
    });

    it('should reject ID without log_ prefix', () => {
      const uuid = generateUUID();
      expect(isValidLogId(uuid)).toBe(false);
    });

    it('should reject ID with invalid UUID part', () => {
      const invalidId = 'log_not-a-valid-uuid';
      expect(isValidLogId(invalidId)).toBe(false);
    });

    it('should reject empty string', () => {
      expect(isValidLogId('')).toBe(false);
    });

    it('should reject habit ID', () => {
      const habitId = generateHabitId();
      expect(isValidLogId(habitId)).toBe(false);
    });
  });

  describe('generateShortId', () => {
    it('should generate a short ID', () => {
      const shortId = generateShortId();
      expect(typeof shortId).toBe('string');
      expect(shortId.length).toBeGreaterThan(0);
      expect(shortId.length).toBeLessThan(30); // Shorter than UUID
    });

    it('should generate unique short IDs', () => {
      const id1 = generateShortId();
      const id2 = generateShortId();
      expect(id1).not.toBe(id2);
    });

    it('should include timestamp', () => {
      const shortId = generateShortId();
      expect(shortId).toContain('_');
      const timestamp = parseInt(shortId.split('_')[0]);
      expect(timestamp).toBeGreaterThan(0);
    });

    it('should generate many unique short IDs', () => {
      const ids = new Set<string>();
      for (let i = 0; i < 100; i++) {
        ids.add(generateShortId());
      }
      expect(ids.size).toBe(100);
    });
  });
});
