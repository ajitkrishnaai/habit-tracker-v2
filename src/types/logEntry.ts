/**
 * Log Entry Entity Type Definition
 *
 * Represents a daily log entry for a habit.
 */

export interface LogEntry {
  log_id: string; // UUID
  habit_id: string; // Reference to Habit
  user_id?: string; // Optional user ID (populated by Supabase RLS)
  date: string; // ISO 8601 date (YYYY-MM-DD)
  status: 'done' | 'not_done' | 'no_data'; // Completion status
  notes?: string; // Optional notes (max 5000 chars)
  timestamp: string; // ISO 8601 datetime with timezone
}

/**
 * Type guard to check if an object is a valid LogEntry
 */
export const isLogEntry = (obj: any): obj is LogEntry => { // eslint-disable-line @typescript-eslint/no-explicit-any
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof obj.log_id === 'string' &&
    typeof obj.habit_id === 'string' &&
    typeof obj.date === 'string' &&
    (obj.status === 'done' || obj.status === 'not_done' || obj.status === 'no_data') &&
    (obj.notes === undefined || typeof obj.notes === 'string') &&
    typeof obj.timestamp === 'string'
  );
};
