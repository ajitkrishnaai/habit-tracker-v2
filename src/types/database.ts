/**
 * Database type definitions matching Supabase schema
 *
 * These types correspond to the tables defined in:
 * supabase/migrations/001_initial_schema.sql
 */

/**
 * Habit entity - represents a user's tracked habit
 */
export interface Habit {
  habit_id: string;           // Unique habit identifier (format: habit_XXXXXXXX)
  user_id: string;            // UUID - links to auth.users
  name: string;               // Habit name (1-100 chars, unique per user case-insensitive)
  category?: string;          // Optional category (max 50 chars)
  status: 'active' | 'inactive'; // Habit status
  created_date: string;       // ISO 8601 timestamp - auto-set on creation
  modified_date: string;      // ISO 8601 timestamp - auto-updated on changes
}

/**
 * Log entity - represents a daily log entry for a habit
 */
export interface Log {
  log_id: string;             // Unique log identifier (format: log_XXXXXXXX)
  habit_id: string;           // Links to habits table
  user_id: string;            // UUID - links to auth.users (denormalized for RLS)
  date: string;               // ISO 8601 date format (YYYY-MM-DD)
  status: 'done' | 'not_done' | 'no_data'; // Log status
  notes?: string;             // Optional notes (max 5000 chars)
  created_date: string;       // ISO 8601 timestamp - auto-set on creation
  modified_date: string;      // ISO 8601 timestamp - auto-updated on changes
}

/**
 * Metadata entity - stores app metadata for each user
 */
export interface Metadata {
  user_id: string;            // UUID - links to auth.users (PRIMARY KEY)
  sheet_version: string;      // App version (default '2.0')
  last_sync?: string;         // ISO 8601 timestamp - last sync time
  created_date: string;       // ISO 8601 timestamp - auto-set on creation
  modified_date: string;      // ISO 8601 timestamp - auto-updated on changes
}

/**
 * Database schema type - maps table names to their types
 * Useful for strongly-typed database operations
 */
export interface Database {
  public: {
    Tables: {
      habits: {
        Row: Habit;           // Type for SELECT queries
        Insert: Omit<Habit, 'created_date' | 'modified_date'>; // Type for INSERT (timestamps auto-generated)
        Update: Partial<Omit<Habit, 'habit_id' | 'user_id' | 'created_date' | 'modified_date'>>; // Type for UPDATE
      };
      logs: {
        Row: Log;             // Type for SELECT queries
        Insert: Omit<Log, 'created_date' | 'modified_date'>; // Type for INSERT (timestamps auto-generated)
        Update: Partial<Omit<Log, 'log_id' | 'habit_id' | 'user_id' | 'created_date' | 'modified_date'>>; // Type for UPDATE
      };
      metadata: {
        Row: Metadata;        // Type for SELECT queries
        Insert: Omit<Metadata, 'created_date' | 'modified_date'>; // Type for INSERT (timestamps auto-generated)
        Update: Partial<Omit<Metadata, 'user_id' | 'created_date' | 'modified_date'>>; // Type for UPDATE
      };
    };
  };
}

/**
 * User profile type - extracted from Supabase Auth session
 */
export interface UserProfile {
  id: string;                 // User's UUID from auth.users
  email: string;              // User's email address
  full_name?: string;         // Optional full name from metadata
  avatar_url?: string;        // Optional avatar URL
}
