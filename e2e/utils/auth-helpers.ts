import { Page } from '@playwright/test';
import {
  createTestUser,
  deleteTestUser,
  signInTestUser,
  signOutTestUser,
  getCurrentUserId,
  type TestUser
} from './supabase-helpers';

/**
 * E2E Test Helper: Authentication (Supabase Edition)
 *
 * Provides utilities for managing real Supabase authentication in E2E tests.
 * Creates and manages test users, handles sign-in/sign-out, and cleanup.
 *
 * MIGRATION NOTE: This replaces the old mock auth system with real Supabase auth.
 * Tests now create actual users in Supabase, which provides more realistic testing
 * and allows us to validate Row-Level Security (RLS) policies.
 */

// Store test user for cleanup
let currentTestUser: TestUser | null = null;

/**
 * Sign in a test user
 * Creates a new test user in Supabase and signs them in
 *
 * @param page - Playwright page context
 * @param existingUser - Optional existing user to sign in (for multi-user tests)
 * @returns The test user credentials
 */
export async function signIn(page: Page, existingUser?: TestUser): Promise<TestUser> {
  let user: TestUser;

  if (existingUser) {
    // Use provided user
    user = existingUser;
  } else {
    // Create a new test user
    user = await createTestUser('Test User');
    currentTestUser = user;
  }

  // Go to welcome page first
  await page.goto('/');
  await page.waitForLoadState('domcontentloaded');

  // Sign in the user (sets up Supabase session in browser)
  await signInTestUser(page, user);

  // Navigate to daily log (default authenticated page)
  await page.goto('/daily-log');
  await page.waitForLoadState('networkidle');

  // Verify we're actually signed in
  const userId = await getCurrentUserId(page);
  if (!userId) {
    throw new Error('Failed to sign in test user - no user ID found');
  }

  return user;
}

/**
 * Sign out the current test user
 * Clears the Supabase session and all browser storage
 *
 * @param page - Playwright page context
 */
export async function signOut(page: Page): Promise<void> {
  // Sign out via Supabase
  await signOutTestUser(page);

  // Clear IndexedDB as well
  await page.evaluate(async () => {
    const dbs = await window.indexedDB.databases();
    for (const db of dbs) {
      if (db.name) {
        window.indexedDB.deleteDatabase(db.name);
      }
    }
  });

  // Navigate to welcome page
  await page.goto('/');
  await page.waitForLoadState('networkidle');
}

/**
 * Check if user is currently authenticated
 * Checks for valid Supabase session in browser
 *
 * @param page - Playwright page context
 * @returns true if user has a valid session
 */
export async function isAuthenticated(page: Page): Promise<boolean> {
  const userId = await getCurrentUserId(page);
  return userId !== null;
}

/**
 * Clean up test user after test completes
 * Deletes the user and all their data from Supabase
 *
 * Should be called in test afterEach or afterAll hooks
 *
 * @param user - Optional specific user to delete (otherwise uses currentTestUser)
 */
export async function cleanupTestUser(user?: TestUser): Promise<void> {
  const userToDelete = user || currentTestUser;

  if (userToDelete && userToDelete.id) {
    await deleteTestUser(userToDelete.id);
  }

  currentTestUser = null;
}

/**
 * Get the currently signed-in test user
 * Returns null if no user is signed in
 */
export function getCurrentTestUser(): TestUser | null {
  return currentTestUser;
}

/**
 * Create a new test user without signing in
 * Useful for multi-user RLS testing scenarios
 *
 * @param name - Optional name for the user
 * @returns The created test user credentials
 */
export async function createUser(name?: string): Promise<TestUser> {
  return await createTestUser(name);
}
