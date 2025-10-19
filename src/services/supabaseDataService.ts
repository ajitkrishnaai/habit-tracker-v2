/**
 * Supabase Data Service
 *
 * Provides CRUD operations for habits, logs, and metadata using Supabase.
 * All operations automatically enforce Row-Level Security (RLS) based on
 * the authenticated user's session.
 *
 * Features:
 * - Type-safe database operations using Database schema types
 * - Automatic user_id injection from auth session
 * - Comprehensive error handling with context
 * - Soft delete for habits (mark as 'inactive' instead of removing)
 * - Unique constraint enforcement (habit names, log dates)
 *
 * Usage:
 *   import { supabaseDataService } from '@/services/supabaseDataService';
 *   const habits = await supabaseDataService.getHabits(true); // active only
 */

import { supabase, getCurrentUser } from '../lib/supabaseClient';
import type { Habit, Log, Metadata } from '../types/database';

/**
 * Custom error class for Supabase data operations
 */
export class SupabaseDataError extends Error {
  constructor(
    message: string,
    public operation: string,
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'SupabaseDataError';
  }
}

/**
 * Helper function to get the current authenticated user ID
 * Throws if no user is authenticated
 */
async function getCurrentUserId(): Promise<string> {
  const user = await getCurrentUser();
  if (!user) {
    throw new SupabaseDataError(
      'User must be authenticated to perform this operation',
      'getCurrentUserId'
    );
  }
  return user.id;
}

/**
 * Habit Operations
 */

/**
 * Fetch habits for the authenticated user
 * @param activeOnly - If true, only return habits with status='active'
 * @returns Array of habits sorted by created_date (oldest first)
 */
export async function getHabits(activeOnly = false): Promise<Habit[]> {
  try {
    const userId = await getCurrentUserId();

    let query = supabase
      .from('habits')
      .select('*')
      .eq('user_id', userId)
      .order('created_date', { ascending: true });

    if (activeOnly) {
      query = query.eq('status', 'active');
    }

    const { data, error } = await query;

    if (error) {
      throw new SupabaseDataError(
        `Failed to fetch habits: ${error.message}`,
        'getHabits',
        error
      );
    }

    return data || [];
  } catch (error) {
    if (error instanceof SupabaseDataError) {
      throw error;
    }
    throw new SupabaseDataError(
      'Unexpected error fetching habits',
      'getHabits',
      error
    );
  }
}

/**
 * Fetch a single habit by ID
 * @param habitId - The habit_id to fetch
 * @returns The habit if found, null otherwise
 */
export async function getHabit(habitId: string): Promise<Habit | null> {
  try {
    const userId = await getCurrentUserId();

    const { data, error } = await supabase
      .from('habits')
      .select('*')
      .eq('habit_id', habitId)
      .eq('user_id', userId)
      .single();

    if (error) {
      // 'PGRST116' is Supabase's "not found" error code
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new SupabaseDataError(
        `Failed to fetch habit: ${error.message}`,
        'getHabit',
        error
      );
    }

    return data;
  } catch (error) {
    if (error instanceof SupabaseDataError) {
      throw error;
    }
    throw new SupabaseDataError(
      'Unexpected error fetching habit',
      'getHabit',
      error
    );
  }
}

/**
 * Create a new habit
 * @param habit - Habit data (user_id will be auto-injected)
 * @returns The created habit with all fields populated
 */
export async function createHabit(
  habit: Omit<Habit, 'user_id' | 'created_date' | 'modified_date'>
): Promise<Habit> {
  try {
    const userId = await getCurrentUserId();

    const { data, error } = await supabase
      .from('habits')
      .insert({
        habit_id: habit.habit_id,
        user_id: userId,
        name: habit.name,
        category: habit.category,
        status: habit.status,
      } as any)
      .select()
      .single();

    if (error) {
      throw new SupabaseDataError(
        `Failed to create habit: ${error.message}`,
        'createHabit',
        error
      );
    }

    return data;
  } catch (error) {
    if (error instanceof SupabaseDataError) {
      throw error;
    }
    throw new SupabaseDataError(
      'Unexpected error creating habit',
      'createHabit',
      error
    );
  }
}

/**
 * Update an existing habit
 * @param habit - Habit data with habit_id (must belong to authenticated user)
 * @returns The updated habit
 */
export async function updateHabit(habit: Habit): Promise<Habit> {
  try {
    const userId = await getCurrentUserId();

    // @ts-expect-error - Supabase types infer 'never' for update, but this is valid
    const { data, error } = await supabase
      .from('habits')
      .update({
        name: habit.name,
        category: habit.category,
        status: habit.status,
      })
      .eq('habit_id', habit.habit_id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      throw new SupabaseDataError(
        `Failed to update habit: ${error.message}`,
        'updateHabit',
        error
      );
    }

    return data;
  } catch (error) {
    if (error instanceof SupabaseDataError) {
      throw error;
    }
    throw new SupabaseDataError(
      'Unexpected error updating habit',
      'updateHabit',
      error
    );
  }
}

/**
 * Soft delete a habit (marks as 'inactive' to preserve historical data)
 * @param habitId - The habit_id to delete
 * @returns The updated habit with status='inactive'
 */
export async function deleteHabit(habitId: string): Promise<Habit> {
  try {
    const userId = await getCurrentUserId();

    // @ts-expect-error - Supabase types infer 'never' for update, but this is valid
    const { data, error } = await supabase
      .from('habits')
      .update({
        status: 'inactive' as const,
      })
      .eq('habit_id', habitId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      throw new SupabaseDataError(
        `Failed to delete habit: ${error.message}`,
        'deleteHabit',
        error
      );
    }

    return data;
  } catch (error) {
    if (error instanceof SupabaseDataError) {
      throw error;
    }
    throw new SupabaseDataError(
      'Unexpected error deleting habit',
      'deleteHabit',
      error
    );
  }
}

/**
 * Log Operations
 */

/**
 * Fetch logs for the authenticated user
 * @param habitId - Optional filter by habit_id
 * @param date - Optional filter by specific date (ISO 8601 format YYYY-MM-DD)
 * @returns Array of logs sorted by date (newest first)
 */
export async function getLogs(
  habitId?: string,
  date?: string
): Promise<Log[]> {
  try {
    const userId = await getCurrentUserId();

    let query = supabase
      .from('logs')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (habitId) {
      query = query.eq('habit_id', habitId);
    }

    if (date) {
      query = query.eq('date', date);
    }

    const { data, error } = await query;

    if (error) {
      throw new SupabaseDataError(
        `Failed to fetch logs: ${error.message}`,
        'getLogs',
        error
      );
    }

    return data || [];
  } catch (error) {
    if (error instanceof SupabaseDataError) {
      throw error;
    }
    throw new SupabaseDataError(
      'Unexpected error fetching logs',
      'getLogs',
      error
    );
  }
}

/**
 * Create a new log entry
 * @param log - Log data (user_id will be auto-injected)
 * @returns The created log with all fields populated
 * @throws If a log already exists for the same habit_id and date
 */
export async function createLog(
  log: Omit<Log, 'user_id' | 'created_date' | 'modified_date'>
): Promise<Log> {
  try {
    const userId = await getCurrentUserId();

    const { data, error } = await supabase
      .from('logs')
      .insert({
        log_id: log.log_id,
        habit_id: log.habit_id,
        user_id: userId,
        date: log.date,
        status: log.status,
        notes: log.notes,
      } as any)
      .select()
      .single();

    if (error) {
      // Check for unique constraint violation (duplicate habit_id + date)
      if (error.code === '23505') {
        throw new SupabaseDataError(
          `A log already exists for this habit on ${log.date}`,
          'createLog',
          error
        );
      }
      throw new SupabaseDataError(
        `Failed to create log: ${error.message}`,
        'createLog',
        error
      );
    }

    return data;
  } catch (error) {
    if (error instanceof SupabaseDataError) {
      throw error;
    }
    throw new SupabaseDataError(
      'Unexpected error creating log',
      'createLog',
      error
    );
  }
}

/**
 * Update an existing log entry
 * @param log - Log data with log_id (must belong to authenticated user)
 * @returns The updated log
 */
export async function updateLog(log: Log): Promise<Log> {
  try {
    const userId = await getCurrentUserId();

    // @ts-expect-error - Supabase types infer 'never' for update, but this is valid
    const { data, error} = await supabase
      .from('logs')
      .update({
        status: log.status,
        notes: log.notes,
        date: log.date,
      })
      .eq('log_id', log.log_id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      throw new SupabaseDataError(
        `Failed to update log: ${error.message}`,
        'updateLog',
        error
      );
    }

    return data;
  } catch (error) {
    if (error instanceof SupabaseDataError) {
      throw error;
    }
    throw new SupabaseDataError(
      'Unexpected error updating log',
      'updateLog',
      error
    );
  }
}

/**
 * Delete a log entry (hard delete)
 * @param logId - The log_id to delete
 * @returns void
 */
export async function deleteLog(logId: string): Promise<void> {
  try {
    const userId = await getCurrentUserId();

    const { error } = await supabase
      .from('logs')
      .delete()
      .eq('log_id', logId)
      .eq('user_id', userId);

    if (error) {
      throw new SupabaseDataError(
        `Failed to delete log: ${error.message}`,
        'deleteLog',
        error
      );
    }
  } catch (error) {
    if (error instanceof SupabaseDataError) {
      throw error;
    }
    throw new SupabaseDataError(
      'Unexpected error deleting log',
      'deleteLog',
      error
    );
  }
}

/**
 * Metadata Operations
 */

/**
 * Fetch metadata for the authenticated user
 * @returns The user's metadata, or null if not found
 */
export async function getMetadata(): Promise<Metadata | null> {
  try {
    const userId = await getCurrentUserId();

    const { data, error } = await supabase
      .from('metadata')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      // 'PGRST116' is Supabase's "not found" error code
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new SupabaseDataError(
        `Failed to fetch metadata: ${error.message}`,
        'getMetadata',
        error
      );
    }

    return data;
  } catch (error) {
    if (error instanceof SupabaseDataError) {
      throw error;
    }
    throw new SupabaseDataError(
      'Unexpected error fetching metadata',
      'getMetadata',
      error
    );
  }
}

/**
 * Update metadata for the authenticated user (upsert)
 * Creates new metadata if it doesn't exist, updates if it does
 * @param metadata - Metadata fields to update (user_id will be auto-injected)
 * @returns The updated metadata
 */
export async function updateMetadata(
  metadata: Omit<Metadata, 'user_id' | 'created_date' | 'modified_date'>
): Promise<Metadata> {
  try {
    const userId = await getCurrentUserId();

    const { data, error } = await supabase
      .from('metadata')
      .upsert(
        {
          user_id: userId,
          sheet_version: metadata.sheet_version,
          last_sync: metadata.last_sync,
        } as any,
        {
          onConflict: 'user_id', // Primary key
        }
      )
      .select()
      .single();

    if (error) {
      throw new SupabaseDataError(
        `Failed to update metadata: ${error.message}`,
        'updateMetadata',
        error
      );
    }

    return data;
  } catch (error) {
    if (error instanceof SupabaseDataError) {
      throw error;
    }
    throw new SupabaseDataError(
      'Unexpected error updating metadata',
      'updateMetadata',
      error
    );
  }
}

/**
 * Export all functions as a service object for convenience
 */
export const supabaseDataService = {
  // Habit operations
  getHabits,
  getHabit,
  createHabit,
  updateHabit,
  deleteHabit,

  // Log operations
  getLogs,
  createLog,
  updateLog,
  deleteLog,

  // Metadata operations
  getMetadata,
  updateMetadata,
};
