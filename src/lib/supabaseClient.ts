/**
 * Supabase Client Singleton
 *
 * This module initializes and exports a singleton instance of the Supabase client.
 * The client is configured with the project URL and anon key from environment variables.
 *
 * Usage:
 *   import { supabase } from '@/lib/supabaseClient';
 *   const { data, error } = await supabase.from('habits').select('*');
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

// Environment variables - must be set in .env.local
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl) {
  throw new Error(
    'Missing VITE_SUPABASE_URL environment variable. ' +
    'Please add it to your .env.local file. ' +
    'See SUPABASE_SETUP.md for setup instructions.'
  );
}

if (!supabaseAnonKey) {
  throw new Error(
    'Missing VITE_SUPABASE_ANON_KEY environment variable. ' +
    'Please add it to your .env.local file. ' +
    'See SUPABASE_SETUP.md for setup instructions.'
  );
}

/**
 * Supabase client instance with type-safe database schema
 *
 * Features:
 * - Automatic JWT token management (stored in localStorage by default)
 * - Automatic token refresh before expiration
 * - Type-safe database operations using Database schema
 * - Row-Level Security (RLS) enforcement on all queries
 *
 * Note: The anon key is safe to expose in the client because RLS policies
 * on the database prevent unauthorized access to user data.
 */
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Auto-refresh tokens before they expire
    autoRefreshToken: true,
    // Persist session in localStorage (can be changed to 'cookie' for SSR)
    persistSession: true,
    // Detect session changes across tabs/windows
    detectSessionInUrl: true,
  },
});

/**
 * Helper function to get the current session
 * Returns null if no active session
 */
export const getSession = async () => {
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    console.error('Error getting session:', error);
    return null;
  }
  return data.session;
};

/**
 * Helper function to get the current user
 * Returns null if not authenticated
 */
export const getCurrentUser = async () => {
  const session = await getSession();
  return session?.user ?? null;
};

/**
 * Helper function to check if user is authenticated
 */
export const isAuthenticated = async (): Promise<boolean> => {
  const session = await getSession();
  return session !== null;
};
