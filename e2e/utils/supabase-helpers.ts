import { Page } from '@playwright/test';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../../src/types/database';

/**
 * E2E Test Helper: Supabase Test User Management
 *
 * Provides utilities for creating, managing, and cleaning up test users
 * in Supabase for E2E testing. Includes RLS validation helpers.
 *
 * IMPORTANT: These helpers use the Supabase client directly from Node.js
 * to create/delete users and validate RLS policies.
 */

// Environment variables for Supabase connection
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
// Service role key for admin operations (user creation/deletion)
// NOTE: This should ONLY be used in tests, never in production code
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. ' +
    'Ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set.'
  );
}

/**
 * Create a Supabase client for test operations
 * Uses anon key by default, or service role key for admin operations
 */
export function createTestSupabaseClient(useServiceRole = false): SupabaseClient<Database> {
  const key = useServiceRole && supabaseServiceRoleKey ? supabaseServiceRoleKey : supabaseAnonKey!;

  return createClient<Database>(supabaseUrl!, key, {
    auth: {
      autoRefreshToken: true,
      persistSession: false, // Don't persist in tests
      detectSessionInUrl: false,
    },
  });
}

/**
 * Test user credentials
 */
export interface TestUser {
  email: string;
  password: string;
  name: string;
  id?: string;
}

/**
 * Generate a unique test user email
 * Uses timestamp to ensure uniqueness across test runs
 */
export function generateTestUserEmail(prefix = 'test'): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${prefix}-${timestamp}-${random}@e2etest.local`;
}

/**
 * Create a test user in Supabase
 * Returns user credentials for login
 *
 * NOTE: Supabase requires email confirmation by default. For tests, you should:
 * 1. Disable email confirmation in Supabase dashboard (Auth > Settings > Enable email confirmations: OFF)
 * OR
 * 2. Use auto-confirm (requires service role key)
 */
export async function createTestUser(name?: string): Promise<TestUser> {
  const email = generateTestUserEmail();
  const password = 'TestPassword123!'; // Consistent password for all test users
  const userName = name || 'Test User';

  const supabase = createTestSupabaseClient(false); // Use anon key for signup

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name: userName,
      },
      // Auto-confirm email for testing (requires email confirmation disabled in Supabase)
      emailRedirectTo: undefined,
    },
  });

  if (error) {
    throw new Error(`Failed to create test user: ${error.message}`);
  }

  if (!data.user) {
    throw new Error('No user returned from signUp');
  }

  return {
    email,
    password,
    name: userName,
    id: data.user.id,
  };
}

/**
 * Delete a test user and all their data from Supabase
 * Requires service role key for admin operations
 *
 * @param userId - The user ID to delete
 */
export async function deleteTestUser(userId: string): Promise<void> {
  if (!supabaseServiceRoleKey) {
    console.warn('SUPABASE_SERVICE_ROLE_KEY not set. Skipping user deletion.');
    console.warn('Test users will remain in database. Set SUPABASE_SERVICE_ROLE_KEY to enable cleanup.');
    return;
  }

  const supabase = createTestSupabaseClient(true); // Use service role key

  // Delete user's data (cascade deletes should handle logs)
  await supabase.from('habits').delete().eq('user_id', userId);
  await supabase.from('metadata').delete().eq('user_id', userId);

  // Delete the user account
  const { error } = await supabase.auth.admin.deleteUser(userId);

  if (error) {
    console.error(`Failed to delete test user ${userId}:`, error.message);
    // Don't throw - we want tests to continue even if cleanup fails
  }
}

/**
 * Clean up all test data for a user
 * Deletes habits, logs, and metadata but keeps the user account
 */
export async function cleanupTestUserData(userId: string): Promise<void> {
  const supabase = createTestSupabaseClient(true); // Use service role key if available

  // Delete in order: logs (child), habits (parent), metadata
  await supabase.from('habits').delete().eq('user_id', userId);
  await supabase.from('metadata').delete().eq('user_id', userId);
}

/**
 * Sign in a test user via Supabase in the browser context
 * Sets up the Supabase session in localStorage so the app recognizes the user
 */
export async function signInTestUser(page: Page, user: TestUser): Promise<void> {
  // Execute sign-in in the browser context
  await page.evaluate(
    async ({ email, password, supabaseUrl, supabaseAnonKey }) => {
      // Import Supabase in browser context
      const { createClient } = await import('@supabase/supabase-js');

      const supabase = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          autoRefreshToken: true,
          persistSession: true, // Persist in browser localStorage
          detectSessionInUrl: true,
        },
      });

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw new Error(`Failed to sign in test user: ${error.message}`);
      }

      if (!data.session) {
        throw new Error('No session returned from sign in');
      }

      // Session is automatically stored in localStorage by Supabase
      console.log('[E2E Test] Test user signed in:', email);
    },
    {
      email: user.email,
      password: user.password,
      supabaseUrl: supabaseUrl!,
      supabaseAnonKey: supabaseAnonKey!,
    }
  );

  // Wait for auth state to settle
  await page.waitForTimeout(500);
}

/**
 * Sign out the current user in the browser context
 */
export async function signOutTestUser(page: Page): Promise<void> {
  await page.evaluate(
    async ({ supabaseUrl, supabaseAnonKey }) => {
      const { createClient } = await import('@supabase/supabase-js');

      const supabase = createClient(supabaseUrl, supabaseAnonKey);
      await supabase.auth.signOut();

      console.log('[E2E Test] Test user signed out');
    },
    {
      supabaseUrl: supabaseUrl!,
      supabaseAnonKey: supabaseAnonKey!,
    }
  );

  // Clear all browser storage
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  await page.waitForTimeout(500);
}

/**
 * Validate RLS: Ensure user A cannot access user B's data
 *
 * @param userAPage - Page context for user A
 * @param userBId - User B's ID
 * @returns true if RLS is working (user A cannot access user B's data)
 */
export async function validateRLS_CannotAccessOtherUserData(
  userAPage: Page,
  userBId: string
): Promise<boolean> {
  return await userAPage.evaluate(
    async ({ targetUserId, supabaseUrl, supabaseAnonKey }) => {
      const { createClient } = await import('@supabase/supabase-js');

      const supabase = createClient(supabaseUrl, supabaseAnonKey);

      // Try to query habits for user B
      const { data: habits, error: habitsError } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', targetUserId);

      // Try to query logs for user B (using a known habit ID if we had one)
      const { data: logs, error: logsError } = await supabase
        .from('logs')
        .select('*')
        .eq('user_id', targetUserId);

      // Try to query metadata for user B
      const { data: metadata, error: metadataError } = await supabase
        .from('metadata')
        .select('*')
        .eq('user_id', targetUserId);

      // RLS should return empty arrays (not errors) when trying to access other user's data
      // Some RLS implementations return errors, some return empty results
      const habitsBlocked = !habits || habits.length === 0;
      const logsBlocked = !logs || logs.length === 0;
      const metadataBlocked = !metadata || metadata.length === 0;

      console.log('[E2E RLS Test] Access check results:', {
        habitsBlocked,
        logsBlocked,
        metadataBlocked,
        habitsError: habitsError?.message,
        logsError: logsError?.message,
        metadataError: metadataError?.message,
      });

      return habitsBlocked && logsBlocked && metadataBlocked;
    },
    {
      targetUserId: userBId,
      supabaseUrl: supabaseUrl!,
      supabaseAnonKey: supabaseAnonKey!,
    }
  );
}

/**
 * Get the current authenticated user ID from the browser context
 */
export async function getCurrentUserId(page: Page): Promise<string | null> {
  return await page.evaluate(
    async ({ supabaseUrl, supabaseAnonKey }) => {
      const { createClient } = await import('@supabase/supabase-js');

      const supabase = createClient(supabaseUrl, supabaseAnonKey);
      const { data: { session } } = await supabase.auth.getSession();

      return session?.user?.id ?? null;
    },
    {
      supabaseUrl: supabaseUrl!,
      supabaseAnonKey: supabaseAnonKey!,
    }
  );
}
