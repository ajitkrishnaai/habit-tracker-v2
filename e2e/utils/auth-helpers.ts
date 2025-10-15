import { Page } from '@playwright/test';

/**
 * E2E Test Helper: Authentication
 *
 * Provides utilities for bypassing Google OAuth in E2E tests.
 * Uses localStorage mock auth flag for testing without real OAuth.
 */

/**
 * Mock user authentication for testing
 * Sets up localStorage with mock auth token and user data
 */
export async function mockAuth(page: Page) {
  // Set mock auth flag (app checks this in dev mode)
  await page.evaluate(() => {
    localStorage.setItem('habitTracker_mockAuth', 'true');
    localStorage.setItem(
      'habitTracker_mockUser',
      JSON.stringify({
        id: 'test-user-123',
        email: 'testuser@example.com',
        name: 'Test User',
        picture: 'https://via.placeholder.com/100',
      })
    );
  });
}

/**
 * Sign in as a mock user
 * Navigates to welcome page, sets up mock auth, then redirects to daily log
 */
export async function signIn(page: Page) {
  // Go to welcome page
  await page.goto('/');

  // Set up mock authentication
  await mockAuth(page);

  // Navigate to daily log (default authenticated page)
  await page.goto('/daily-log');

  // Wait for page to be fully loaded
  await page.waitForLoadState('networkidle');
}

/**
 * Sign out the current user
 * Clears localStorage and navigates back to welcome page
 */
export async function signOut(page: Page) {
  // Clear all auth data
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  // Navigate to welcome page
  await page.goto('/');
  await page.waitForLoadState('networkidle');
}

/**
 * Check if user is authenticated
 * Returns true if mock auth flag is set
 */
export async function isAuthenticated(page: Page): Promise<boolean> {
  return await page.evaluate(() => {
    return localStorage.getItem('habitTracker_mockAuth') === 'true';
  });
}
