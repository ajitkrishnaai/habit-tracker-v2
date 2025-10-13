/**
 * Habit Entity Type Definition
 *
 * Represents a user's tracked habit.
 */

export interface Habit {
  habit_id: string; // UUID
  name: string; // 1-100 characters
  category?: string; // Optional category for organization
  status: 'active' | 'inactive'; // Never permanently delete, mark as inactive
  created_date: string; // ISO 8601 format (YYYY-MM-DD)
  modified_date: string; // ISO 8601 format (YYYY-MM-DD)
}

/**
 * Type guard to check if an object is a valid Habit
 */
export const isHabit = (obj: any): obj is Habit => {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof obj.habit_id === 'string' &&
    typeof obj.name === 'string' &&
    (obj.category === undefined || typeof obj.category === 'string') &&
    (obj.status === 'active' || obj.status === 'inactive') &&
    typeof obj.created_date === 'string' &&
    typeof obj.modified_date === 'string'
  );
};
