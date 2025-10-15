import { test, expect } from '@playwright/test';
import { signIn, signOut } from './utils/auth-helpers';
import { clearAllData } from './utils/data-helpers';

/**
 * E2E Test Suite: First-Time User Flow
 *
 * Tests the complete onboarding experience for a new user:
 * 1. Landing on Welcome page
 * 2. Authenticating with Google OAuth (mocked)
 * 3. Creating first habits
 * 4. Exploring the app navigation
 *
 * This represents the critical "first impression" user journey.
 */

test.describe('First-Time User Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Start fresh for each test
    await clearAllData(page);
  });

  test('should display welcome page for unauthenticated user', async ({ page }) => {
    await page.goto('/');

    // Check for welcome page elements
    await expect(page).toHaveTitle(/Habit Tracker/i);
    await expect(page.locator('h1')).toContainText(/Track Your Habits/i);

    // Should show sign-in button
    const signInButton = page.getByRole('button', { name: /sign in/i });
    await expect(signInButton).toBeVisible();

    // Should show features section
    await expect(page.locator('text=Your Data, Your Control')).toBeVisible();
    await expect(page.locator('text=Works Offline')).toBeVisible();
    await expect(page.locator('text=Mobile-First Design')).toBeVisible();
  });

  test('should redirect unauthenticated user from protected routes', async ({ page }) => {
    // Try to access daily log without auth
    await page.goto('/daily-log');

    // Should redirect to welcome page
    await expect(page).toHaveURL('/');
    await expect(page.locator('h1')).toContainText(/Track Your Habits/i);
  });

  test('should successfully sign in and navigate to daily log', async ({ page }) => {
    await page.goto('/');

    // Mock sign-in process
    await signIn(page);

    // Should be on daily log page
    await expect(page).toHaveURL('/daily-log');

    // Should see navigation
    await expect(page.getByRole('navigation')).toBeVisible();
    await expect(page.getByRole('link', { name: /Daily Log/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Progress/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Manage Habits/i })).toBeVisible();

    // Should see empty state (no habits yet)
    await expect(page.locator('text=No habits yet')).toBeVisible();
  });

  test('should complete first-time user journey: auth → add habits → log habits', async ({
    page,
  }) => {
    // Step 1: Sign in
    await page.goto('/');
    await signIn(page);
    await expect(page).toHaveURL('/daily-log');

    // Step 2: Navigate to Manage Habits
    await page.getByRole('link', { name: /Manage Habits/i }).click();
    await expect(page).toHaveURL('/manage-habits');

    // Step 3: Add first habit
    await page.getByRole('button', { name: /Add Habit/i }).click();

    // Fill out habit form
    await page.getByLabel(/Habit Name/i).fill('Morning Exercise');
    await page.getByLabel(/Category/i).fill('Health');
    await page.getByLabel(/Goal/i).fill('Exercise for 30 minutes every morning');

    // Submit form
    await page.getByRole('button', { name: /Save/i }).click();

    // Should see habit in list
    await expect(page.locator('text=Morning Exercise')).toBeVisible();
    await expect(page.locator('text=Health')).toBeVisible();

    // Step 4: Add second habit
    await page.getByRole('button', { name: /Add Habit/i }).click();
    await page.getByLabel(/Habit Name/i).fill('Read Before Bed');
    await page.getByLabel(/Category/i).fill('Learning');
    await page.getByLabel(/Goal/i).fill('Read for 20 minutes before sleep');
    await page.getByRole('button', { name: /Save/i }).click();

    await expect(page.locator('text=Read Before Bed')).toBeVisible();
    await expect(page.locator('text=Learning')).toBeVisible();

    // Step 5: Navigate to Daily Log
    await page.getByRole('link', { name: /Daily Log/i }).click();
    await expect(page).toHaveURL('/daily-log');

    // Should now see habits in daily log
    await expect(page.locator('text=Morning Exercise')).toBeVisible();
    await expect(page.locator('text=Read Before Bed')).toBeVisible();

    // Step 6: Toggle first habit as done
    const firstToggle = page
      .locator('[data-testid*="habit-toggle"]')
      .filter({ hasText: 'Morning Exercise' })
      .first();
    await firstToggle.click();

    // Toggle should be in "done" state
    await expect(firstToggle).toHaveAttribute('aria-checked', 'true');

    // Step 7: Add notes
    const notesField = page.getByLabel(/Notes/i);
    await notesField.fill('Great morning workout! Feeling energized.');

    // Step 8: Save (if there's a save button, or wait for auto-save)
    const saveButton = page.getByRole('button', { name: /Save/i });
    if (await saveButton.isVisible()) {
      await saveButton.click();
    }

    // Step 9: Check Progress page
    await page.getByRole('link', { name: /Progress/i }).click();
    await expect(page).toHaveURL('/progress');

    // Should see habit cards
    await expect(page.locator('text=Morning Exercise')).toBeVisible();
    await expect(page.locator('text=Read Before Bed')).toBeVisible();

    // Should show current streak
    await expect(page.locator('text=Current Streak')).toBeVisible();
  });

  test('should show footer with Privacy and Terms links', async ({ page }) => {
    await page.goto('/');
    await signIn(page);

    // Check footer exists
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();

    // Check links
    await expect(footer.getByRole('link', { name: /Privacy Policy/i })).toBeVisible();
    await expect(footer.getByRole('link', { name: /Terms of Service/i })).toBeVisible();

    // Click Privacy Policy
    await footer.getByRole('link', { name: /Privacy Policy/i }).click();
    await expect(page).toHaveURL('/privacy');
    await expect(page.locator('h1')).toContainText(/Privacy Policy/i);

    // Go back and click Terms
    await page.goBack();
    await footer.getByRole('link', { name: /Terms of Service/i }).click();
    await expect(page).toHaveURL('/terms');
    await expect(page.locator('h1')).toContainText(/Terms of Service/i);
  });

  test('should persist session across page reloads', async ({ page }) => {
    // Sign in
    await page.goto('/');
    await signIn(page);
    await expect(page).toHaveURL('/daily-log');

    // Reload page
    await page.reload();

    // Should still be authenticated
    await expect(page).toHaveURL('/daily-log');
    await expect(page.getByRole('navigation')).toBeVisible();
  });

  test('should sign out and return to welcome page', async ({ page }) => {
    // Sign in first
    await page.goto('/');
    await signIn(page);
    await expect(page).toHaveURL('/daily-log');

    // Sign out
    await signOut(page);

    // Should be back on welcome page
    await expect(page).toHaveURL('/');
    await expect(page.locator('h1')).toContainText(/Track Your Habits/i);

    // Try to access protected route
    await page.goto('/daily-log');
    await expect(page).toHaveURL('/'); // Should redirect
  });

  test('should handle navigation between all pages', async ({ page }) => {
    await page.goto('/');
    await signIn(page);

    // Test navigation to each page
    const pages = [
      { name: /Daily Log/i, url: '/daily-log' },
      { name: /Manage Habits/i, url: '/manage-habits' },
      { name: /Progress/i, url: '/progress' },
    ];

    for (const pageInfo of pages) {
      await page.getByRole('link', { name: pageInfo.name }).click();
      await expect(page).toHaveURL(pageInfo.url);

      // Active nav item should be highlighted
      const activeLink = page.getByRole('link', { name: pageInfo.name });
      await expect(activeLink).toHaveAttribute('aria-current', 'page');
    }
  });
});
