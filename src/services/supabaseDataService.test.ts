/**
 * Tests for Supabase Data Service
 *
 * Tests all CRUD operations for habits, logs, and metadata with:
 * - Success scenarios
 * - Error handling (not found, duplicate constraints, auth errors)
 * - RLS enforcement (user_id injection)
 * - Type safety and data validation
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Habit, Log, Metadata } from '../types/database';

// Mock the Supabase client - must be done before imports
vi.mock('../lib/supabaseClient', () => {
  return {
    supabase: {
      from: vi.fn(),
      auth: {
        getSession: vi.fn(),
      },
    },
    getCurrentUser: vi.fn(),
    getSession: vi.fn(),
    isAuthenticated: vi.fn(),
  };
});

// Import after mocking
import { supabase, getCurrentUser } from '../lib/supabaseClient';
import {
  getHabits,
  getHabit,
  createHabit,
  updateHabit,
  deleteHabit,
  getLogs,
  createLog,
  updateLog,
  deleteLog,
  getMetadata,
  updateMetadata,
  SupabaseDataError,
} from './supabaseDataService';

describe('SupabaseDataService', () => {
  const mockUser = {
    id: 'test-user-id-123',
    email: 'test@example.com',
    app_metadata: {},
    user_metadata: {},
    aud: 'authenticated',
    created_at: '2024-01-01T00:00:00Z',
  };

  const mockHabit: Habit = {
    habit_id: 'habit_12345678',
    user_id: 'test-user-id-123',
    name: 'Exercise',
    category: 'Health',
    status: 'active',
    created_date: '2024-01-01T00:00:00Z',
    modified_date: '2024-01-01T00:00:00Z',
  };

  const mockLog: Log = {
    log_id: 'log_12345678',
    habit_id: 'habit_12345678',
    user_id: 'test-user-id-123',
    date: '2024-01-15',
    status: 'done',
    notes: 'Great session!',
    created_date: '2024-01-15T00:00:00Z',
    modified_date: '2024-01-15T00:00:00Z',
  };

  const mockMetadata: Metadata = {
    user_id: 'test-user-id-123',
    sheet_version: '2.0',
    last_sync: '2024-01-15T00:00:00Z',
    created_date: '2024-01-01T00:00:00Z',
    modified_date: '2024-01-15T00:00:00Z',
  };

  // Helper to create a chainable query mock
  const createQueryMock = (result: { data: any; error: any }) => {
    const chainable = {
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      upsert: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue(result),
      then: (resolve: any) => resolve(result), // Make it thenable for await
    };
    return chainable;
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Default: user is authenticated
    vi.mocked(getCurrentUser).mockResolvedValue(mockUser);
  });

  describe('Authentication', () => {
    it('should throw SupabaseDataError when user is not authenticated', async () => {
      vi.mocked(getCurrentUser).mockResolvedValue(null);

      await expect(getHabits()).rejects.toThrow(SupabaseDataError);
      await expect(getHabits()).rejects.toThrow(
        'User must be authenticated to perform this operation'
      );
    });
  });

  describe('Habit Operations', () => {
    describe('getHabits', () => {
      it('should fetch all habits for authenticated user', async () => {
        const habits = [mockHabit, { ...mockHabit, habit_id: 'habit_87654321' }];
        const queryMock = createQueryMock({ data: habits, error: null });
        vi.mocked(supabase.from).mockReturnValue(queryMock as any);

        const result = await getHabits();

        expect(result).toEqual(habits);
        expect(supabase.from).toHaveBeenCalledWith('habits');
        expect(queryMock.select).toHaveBeenCalledWith('*');
        expect(queryMock.eq).toHaveBeenCalledWith('user_id', 'test-user-id-123');
      });

      it('should fetch only active habits when activeOnly=true', async () => {
        const activeHabits = [mockHabit];
        const queryMock = createQueryMock({ data: activeHabits, error: null });
        vi.mocked(supabase.from).mockReturnValue(queryMock as any);

        const result = await getHabits(true);

        expect(result).toEqual(activeHabits);
        expect(queryMock.eq).toHaveBeenCalledWith('status', 'active');
      });

      it('should return empty array when no habits exist', async () => {
        const queryMock = createQueryMock({ data: null, error: null });
        vi.mocked(supabase.from).mockReturnValue(queryMock as any);

        const result = await getHabits();

        expect(result).toEqual([]);
      });

      it('should throw SupabaseDataError on database error', async () => {
        const dbError = { message: 'Database connection failed', code: 'DB_ERROR' };
        const queryMock = createQueryMock({ data: null, error: dbError });
        vi.mocked(supabase.from).mockReturnValue(queryMock as any);

        await expect(getHabits()).rejects.toThrow(SupabaseDataError);
        await expect(getHabits()).rejects.toThrow('Failed to fetch habits');
      });
    });

    describe('getHabit', () => {
      it('should fetch a single habit by ID', async () => {
        const queryMock = createQueryMock({ data: mockHabit, error: null });
        vi.mocked(supabase.from).mockReturnValue(queryMock as any);

        const result = await getHabit('habit_12345678');

        expect(result).toEqual(mockHabit);
        expect(queryMock.eq).toHaveBeenCalledWith('habit_id', 'habit_12345678');
        expect(queryMock.eq).toHaveBeenCalledWith('user_id', 'test-user-id-123');
      });

      it('should return null when habit not found (PGRST116 error)', async () => {
        const notFoundError = { message: 'Not found', code: 'PGRST116' };
        const queryMock = createQueryMock({ data: null, error: notFoundError });
        vi.mocked(supabase.from).mockReturnValue(queryMock as any);

        const result = await getHabit('nonexistent_habit');

        expect(result).toBeNull();
      });

      it('should throw SupabaseDataError on other database errors', async () => {
        const dbError = { message: 'Database error', code: 'DB_ERROR' };
        const queryMock = createQueryMock({ data: null, error: dbError });
        vi.mocked(supabase.from).mockReturnValue(queryMock as any);

        await expect(getHabit('habit_12345678')).rejects.toThrow(SupabaseDataError);
      });
    });

    describe('createHabit', () => {
      it('should create a new habit with user_id auto-injected', async () => {
        const newHabit = {
          habit_id: 'habit_new123',
          name: 'Meditate',
          category: 'Health',
          status: 'active' as const,
        };
        const createdHabit = { ...newHabit, ...mockHabit };

        const queryMock = createQueryMock({ data: createdHabit, error: null });
        vi.mocked(supabase.from).mockReturnValue(queryMock as any);

        const result = await createHabit(newHabit);

        expect(supabase.from).toHaveBeenCalledWith('habits');
        expect(queryMock.insert).toHaveBeenCalledWith([{
          ...newHabit,
          user_id: 'test-user-id-123',
        }]);
        expect(result).toHaveProperty('user_id', 'test-user-id-123');
      });

      it('should throw SupabaseDataError on insert failure', async () => {
        const dbError = { message: 'Insert failed', code: 'DB_ERROR' };
        const queryMock = createQueryMock({ data: null, error: dbError });
        vi.mocked(supabase.from).mockReturnValue(queryMock as any);

        await expect(
          createHabit({
            habit_id: 'habit_123',
            name: 'Test',
            status: 'active',
          })
        ).rejects.toThrow(SupabaseDataError);
      });
    });

    describe('updateHabit', () => {
      it('should update an existing habit', async () => {
        const updatedHabit = { ...mockHabit, name: 'Updated Exercise' };
        const queryMock = createQueryMock({ data: updatedHabit, error: null });
        vi.mocked(supabase.from).mockReturnValue(queryMock as any);

        const result = await updateHabit(updatedHabit);

        expect(supabase.from).toHaveBeenCalledWith('habits');
        expect(queryMock.update).toHaveBeenCalledWith({
          name: 'Updated Exercise',
          category: 'Health',
          status: 'active',
        });
        expect(queryMock.eq).toHaveBeenCalledWith('habit_id', 'habit_12345678');
        expect(queryMock.eq).toHaveBeenCalledWith('user_id', 'test-user-id-123');
        expect(result).toEqual(updatedHabit);
      });

      it('should throw SupabaseDataError on update failure', async () => {
        const dbError = { message: 'Update failed', code: 'DB_ERROR' };
        const queryMock = createQueryMock({ data: null, error: dbError });
        vi.mocked(supabase.from).mockReturnValue(queryMock as any);

        await expect(updateHabit(mockHabit)).rejects.toThrow(SupabaseDataError);
      });
    });

    describe('deleteHabit', () => {
      it('should soft delete a habit (mark as inactive)', async () => {
        const deletedHabit = { ...mockHabit, status: 'inactive' as const };
        const queryMock = createQueryMock({ data: deletedHabit, error: null });
        vi.mocked(supabase.from).mockReturnValue(queryMock as any);

        const result = await deleteHabit('habit_12345678');

        expect(queryMock.update).toHaveBeenCalledWith({ status: 'inactive' });
        expect(queryMock.eq).toHaveBeenCalledWith('habit_id', 'habit_12345678');
        expect(result.status).toBe('inactive');
      });

      it('should throw SupabaseDataError on delete failure', async () => {
        const dbError = { message: 'Delete failed', code: 'DB_ERROR' };
        const queryMock = createQueryMock({ data: null, error: dbError });
        vi.mocked(supabase.from).mockReturnValue(queryMock as any);

        await expect(deleteHabit('habit_12345678')).rejects.toThrow(SupabaseDataError);
      });
    });
  });

  describe('Log Operations', () => {
    describe('getLogs', () => {
      it('should fetch all logs for authenticated user', async () => {
        const logs = [mockLog, { ...mockLog, log_id: 'log_87654321' }];
        const queryMock = createQueryMock({ data: logs, error: null });
        vi.mocked(supabase.from).mockReturnValue(queryMock as any);

        const result = await getLogs();

        expect(result).toEqual(logs);
        expect(supabase.from).toHaveBeenCalledWith('logs');
        expect(queryMock.eq).toHaveBeenCalledWith('user_id', 'test-user-id-123');
      });

      it('should filter logs by habit_id', async () => {
        const queryMock = createQueryMock({ data: [mockLog], error: null });
        vi.mocked(supabase.from).mockReturnValue(queryMock as any);

        await getLogs('habit_12345678');

        expect(queryMock.eq).toHaveBeenCalledWith('habit_id', 'habit_12345678');
      });

      it('should filter logs by date', async () => {
        const queryMock = createQueryMock({ data: [mockLog], error: null });
        vi.mocked(supabase.from).mockReturnValue(queryMock as any);

        await getLogs(undefined, '2024-01-15');

        expect(queryMock.eq).toHaveBeenCalledWith('date', '2024-01-15');
      });

      it('should filter logs by both habit_id and date', async () => {
        const queryMock = createQueryMock({ data: [mockLog], error: null });
        vi.mocked(supabase.from).mockReturnValue(queryMock as any);

        await getLogs('habit_12345678', '2024-01-15');

        expect(queryMock.eq).toHaveBeenCalledWith('habit_id', 'habit_12345678');
        expect(queryMock.eq).toHaveBeenCalledWith('date', '2024-01-15');
      });

      it('should return empty array when no logs exist', async () => {
        const queryMock = createQueryMock({ data: null, error: null });
        vi.mocked(supabase.from).mockReturnValue(queryMock as any);

        const result = await getLogs();

        expect(result).toEqual([]);
      });
    });

    describe('createLog', () => {
      it('should create a new log with user_id auto-injected', async () => {
        const newLog = {
          log_id: 'log_new123',
          habit_id: 'habit_12345678',
          date: '2024-01-16',
          status: 'done' as const,
          notes: 'Test log',
        };
        const createdLog = { ...newLog, ...mockLog };

        const queryMock = createQueryMock({ data: createdLog, error: null });
        vi.mocked(supabase.from).mockReturnValue(queryMock as any);

        const result = await createLog(newLog);

        expect(queryMock.insert).toHaveBeenCalledWith([{
          ...newLog,
          user_id: 'test-user-id-123',
        }]);
        expect(result).toHaveProperty('user_id', 'test-user-id-123');
      });

      it('should throw SupabaseDataError on duplicate constraint violation (23505)', async () => {
        const duplicateError = {
          message: 'duplicate key value violates unique constraint',
          code: '23505',
        };
        const queryMock = createQueryMock({ data: null, error: duplicateError });
        vi.mocked(supabase.from).mockReturnValue(queryMock as any);

        await expect(
          createLog({
            log_id: 'log_123',
            habit_id: 'habit_12345678',
            date: '2024-01-15',
            status: 'done',
          })
        ).rejects.toThrow('A log already exists for this habit on 2024-01-15');
      });
    });

    describe('updateLog', () => {
      it('should update an existing log', async () => {
        const updatedLog = { ...mockLog, status: 'not_done' as const };
        const queryMock = createQueryMock({ data: updatedLog, error: null });
        vi.mocked(supabase.from).mockReturnValue(queryMock as any);

        const result = await updateLog(updatedLog);

        expect(queryMock.update).toHaveBeenCalledWith({
          status: 'not_done',
          notes: 'Great session!',
          date: '2024-01-15',
        });
        expect(queryMock.eq).toHaveBeenCalledWith('log_id', 'log_12345678');
        expect(result).toEqual(updatedLog);
      });
    });

    describe('deleteLog', () => {
      it('should hard delete a log', async () => {
        const queryMock = createQueryMock({ data: null, error: null });
        vi.mocked(supabase.from).mockReturnValue(queryMock as any);

        await deleteLog('log_12345678');

        expect(supabase.from).toHaveBeenCalledWith('logs');
        expect(queryMock.delete).toHaveBeenCalled();
        expect(queryMock.eq).toHaveBeenCalledWith('log_id', 'log_12345678');
        expect(queryMock.eq).toHaveBeenCalledWith('user_id', 'test-user-id-123');
      });

      it('should throw SupabaseDataError on delete failure', async () => {
        const dbError = { message: 'Delete failed', code: 'DB_ERROR' };
        const queryMock = createQueryMock({ data: null, error: dbError });
        vi.mocked(supabase.from).mockReturnValue(queryMock as any);

        await expect(deleteLog('log_12345678')).rejects.toThrow(SupabaseDataError);
      });
    });
  });

  describe('Metadata Operations', () => {
    describe('getMetadata', () => {
      it('should fetch metadata for authenticated user', async () => {
        const queryMock = createQueryMock({ data: mockMetadata, error: null });
        vi.mocked(supabase.from).mockReturnValue(queryMock as any);

        const result = await getMetadata();

        expect(result).toEqual(mockMetadata);
        expect(supabase.from).toHaveBeenCalledWith('metadata');
        expect(queryMock.eq).toHaveBeenCalledWith('user_id', 'test-user-id-123');
      });

      it('should return null when metadata not found (PGRST116 error)', async () => {
        const notFoundError = { message: 'Not found', code: 'PGRST116' };
        const queryMock = createQueryMock({ data: null, error: notFoundError });
        vi.mocked(supabase.from).mockReturnValue(queryMock as any);

        const result = await getMetadata();

        expect(result).toBeNull();
      });
    });

    describe('updateMetadata', () => {
      it('should upsert metadata with user_id auto-injected', async () => {
        const metadataUpdate = {
          sheet_version: '2.1',
          last_sync: '2024-01-16T00:00:00Z',
        };
        const updatedMetadata = { ...mockMetadata, ...metadataUpdate };

        const queryMock = createQueryMock({ data: updatedMetadata, error: null });
        vi.mocked(supabase.from).mockReturnValue(queryMock as any);

        const result = await updateMetadata(metadataUpdate);

        expect(supabase.from).toHaveBeenCalledWith('metadata');
        expect(queryMock.upsert).toHaveBeenCalledWith(
          [{
            ...metadataUpdate,
            user_id: 'test-user-id-123',
          }],
          { onConflict: 'user_id' }
        );
        expect(result.sheet_version).toBe('2.1');
      });

      it('should throw SupabaseDataError on upsert failure', async () => {
        const dbError = { message: 'Upsert failed', code: 'DB_ERROR' };
        const queryMock = createQueryMock({ data: null, error: dbError });
        vi.mocked(supabase.from).mockReturnValue(queryMock as any);

        await expect(updateMetadata({ sheet_version: '2.0' })).rejects.toThrow(
          SupabaseDataError
        );
      });
    });
  });

  describe('Error Handling', () => {
    it('should wrap unexpected errors in SupabaseDataError', async () => {
      vi.mocked(getCurrentUser).mockRejectedValue(new Error('Unexpected error'));

      await expect(getHabits()).rejects.toThrow(SupabaseDataError);
      await expect(getHabits()).rejects.toThrow('Unexpected error fetching habits');

      // Reset the mock for other tests
      vi.mocked(getCurrentUser).mockResolvedValue(mockUser);
    });

    it('should preserve SupabaseDataError when thrown', async () => {
      const customError = new SupabaseDataError('Custom error', 'testOperation');
      vi.mocked(getCurrentUser).mockRejectedValueOnce(customError);

      await expect(getHabits()).rejects.toThrow(customError);
    });

    it('should include operation name in error', async () => {
      vi.mocked(getCurrentUser).mockResolvedValueOnce(null);

      try {
        await createHabit({
          habit_id: 'test',
          name: 'test',
          status: 'active',
        });
      } catch (error) {
        expect(error).toBeInstanceOf(SupabaseDataError);
        expect((error as SupabaseDataError).operation).toBe('getCurrentUserId');
      }
    });
  });
});
