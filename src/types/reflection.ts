/**
 * TypeScript interfaces for AI reflection feature
 * Used by reflectionDataBuilder and aiReflectionService
 */

/**
 * Habit data included in reflection payload
 */
export interface ReflectionHabit {
  name: string;
  status: 'done' | 'not_done';
  streak_days: number;
  completed_last_7_days?: number;
  completed_last_30_days?: number;
  category?: string;
}

/**
 * Summary of recent tracking activity
 */
export interface RecentSummary {
  days_tracked_last_7: number;
  days_tracked_last_30: number;
  notable_observations: string[];
}

/**
 * Complete payload sent to Supabase Edge Function for reflection generation
 */
export interface ReflectionPayload {
  date: string; // ISO 8601 date (YYYY-MM-DD)
  time_of_day: 'morning' | 'afternoon' | 'evening';
  note_text: string;
  habits: ReflectionHabit[];
  recent_summary: RecentSummary;
}

/**
 * Response from Supabase Edge Function
 */
export interface ReflectionResponse {
  reflection: string;
  error?: boolean;
  error_type?: string;
  usage?: {
    input_tokens: number;
    output_tokens: number;
  };
}
