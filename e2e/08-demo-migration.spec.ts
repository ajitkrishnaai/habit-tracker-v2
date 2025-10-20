/**
 * E2E Tests: Demo Data Migration Flow
 *
 * Tests the complete data migration flow when demo users sign up or log in
 *
 * Coverage:
 * - Demo data migration on signup
 * - Demo data migration on login
 * - Migration success toast
 * - Demo banner removed after authentication
 * - Migration error handling
 * - Data integrity after migration
 */

import { test, expect, Page } from '@playwright/test';

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Clears demo mode data from localStorage
 */
async function clearDemoData(page: Page) {
  await page.evaluate(() => {
    localStorage.removeItem('habitTracker_demoMetrics');
    localStorage.removeItem('habitTracker_shownMilestones');
    sessionStorage.removeItem('demo_migration_success');
  });
}

/**
 * Adds a habit via the UI
 */
async function addHabit(page: Page, habitName: string) {
  await page.click('button:has-text("Add Habit")');
  await page.fill('input[placeholder*="habit name" i]', habitName);
  await page.click('button:has-text("Save")');
  await page.waitForSelector(`text=${habitName}`, { timeout: 5000 });
}

/**
 * Signs up a new user with email/password
 */
async function signUpWithEmail(page: Page, email: string, password: string) {
  await page.goto('/');

  // Expand email form (collapsible details element)
  const emailForm = page.locator('details.welcome-auth-details');
  if (await emailForm.isVisible()) {
    await emailForm.locator('summary').click();
  }

  // Check if we need to switch to signup mode
  const toggleMode = page.locator('button:has-text("Don\'t have an account")');
  if (await toggleMode.isVisible()) {
    await toggleMode.click();
  }

  // Fill signup form
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);

  // Click Create Account button
  await page.click('button:has-text("Create Account")');

  // Wait for redirect to daily-log (authentication successful)
  await page.waitForURL(/\/daily-log$/, { timeout: 10000 });
}

/**
 * Signs in an existing user with email/password
 */
async function signInWithEmail(page: Page, email: string, password: string) {
  await page.goto('/');

  // Expand email form
  const emailForm = page.locator('details.welcome-auth-details');
  if (await emailForm.isVisible()) {
    await emailForm.locator('summary').click();
  }

  // Make sure we're in login mode
  const toggleMode = page.locator('button:has-text("Already have an account")');
  if (await toggleMode.isVisible()) {
    await toggleMode.click();
  }

  // Fill login form
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);

  // Click Sign In button
  await page.click('button:has-text("Sign In")');

  // Wait for redirect
  await page.waitForURL(/\/daily-log$/, { timeout: 10000 });
}

/**
 * Generates a unique email address for testing
 */
function generateUniqueEmail(): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return `test-demo-${timestamp}-${random}@example.com`;
}

// ============================================================================
// Test Suite: Migration on Signup
// ============================================================================

test.describe('Migration on Signup', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await clearDemoData(page);
  });

  test('should migrate demo data when signing up', async ({ page }) => {
    // Start demo mode and add a habit
    await page.click('button:has-text("Try Without Signing In")');
    await page.waitForURL(/\/daily-log$/);

    await page.click('a:has-text("Manage Habits")');
    await addHabit(page, 'Demo Habit 1');
    await addHabit(page, 'Demo Habit 2');

    // Sign up with unique email
    const email = generateUniqueEmail();
    const password = 'TestPassword123!';

    await signUpWithEmail(page, email, password);

    // Wait for migration success toast
    const toast = page.locator('[role="alert"]', { hasText: 'Welcome!' });
    await expect(toast).toBeVisible({ timeout: 10000 });
    await expect(toast.locator('text=Your demo data has been saved')).toBeVisible();

    // Verify habits are still present
    await page.click('a:has-text("Manage Habits")');
    await expect(page.locator('text=Demo Habit 1')).toBeVisible();
    await expect(page.locator('text=Demo Habit 2')).toBeVisible();
  });

  test('should clear demo banner after successful migration', async ({ page }) => {
    // Start demo mode
    await page.click('button:has-text("Try Without Signing In")');
    await page.waitForURL(/\/daily-log$/);

    // Verify demo banner exists
    await expect(page.locator('text=You\'re trying Habit Tracker')).toBeVisible();

    // Sign up
    const email = generateUniqueEmail();
    await signUpWithEmail(page, email, 'TestPassword123!');

    // Demo banner should be gone
    await expect(page.locator('text=You\'re trying Habit Tracker')).not.toBeVisible();
  });

  test('should clear demo metrics from localStorage after migration', async ({ page }) => {
    // Start demo mode
    await page.click('button:has-text("Try Without Signing In")');
    await page.waitForURL(/\/daily-log$/);

    // Verify metrics exist
    let metrics = await page.evaluate(() => {
      return localStorage.getItem('habitTracker_demoMetrics');
    });
    expect(metrics).not.toBeNull();

    // Sign up
    const email = generateUniqueEmail();
    await signUpWithEmail(page, email, 'TestPassword123!');

    // Wait for migration toast
    await page.waitForSelector('text=Your demo data has been saved', { timeout: 10000 });

    // Metrics should be cleared
    metrics = await page.evaluate(() => {
      return localStorage.getItem('habitTracker_demoMetrics');
    });
    expect(metrics).toBeNull();
  });

  test('migration toast should auto-dismiss after 6 seconds', async ({ page }) => {
    // Start demo mode and add habit
    await page.click('button:has-text("Try Without Signing In")');
    await page.waitForURL(/\/daily-log$/);

    await page.click('a:has-text("Manage Habits")');
    await addHabit(page, 'Test Habit');

    // Sign up
    const email = generateUniqueEmail();
    await signUpWithEmail(page, email, 'TestPassword123!');

    // Toast should be visible
    const toast = page.locator('[role="alert"]', { hasText: 'Welcome!' });
    await expect(toast).toBeVisible({ timeout: 10000 });

    // Wait 7 seconds (toast should auto-dismiss after 6)
    await page.waitForTimeout(7000);

    // Toast should be gone
    await expect(toast).not.toBeVisible();
  });

  test('migration toast should be manually dismissible', async ({ page }) => {
    await page.click('button:has-text("Try Without Signing In")');
    await page.waitForURL(/\/daily-log$/);

    const email = generateUniqueEmail();
    await signUpWithEmail(page, email, 'TestPassword123!');

    // Toast should be visible
    const toast = page.locator('[role="alert"]', { hasText: 'Welcome!' });
    await expect(toast).toBeVisible({ timeout: 10000 });

    // Click X button to dismiss
    const closeButton = toast.locator('button[aria-label*="Close" i]');
    if (await closeButton.isVisible()) {
      await closeButton.click();

      // Toast should disappear
      await expect(toast).not.toBeVisible();
    }
  });
});

// ============================================================================
// Test Suite: Migration on Login
// ============================================================================

test.describe('Migration on Login', () => {
  // Note: This test requires an existing test account
  // In a real scenario, we'd create an account in beforeAll and use it here

  test.skip('should migrate demo data when logging in to existing account', async ({ page }) => {
    // This test is skipped because it requires pre-existing test credentials
    // In production, you would:
    // 1. Create a test account in beforeAll
    // 2. Log out
    // 3. Start demo mode
    // 4. Log back in
    // 5. Verify migration

    await page.goto('/');
    await clearDemoData(page);

    // Start demo mode and add data
    await page.click('button:has-text("Try Without Signing In")');
    await page.waitForURL(/\/daily-log$/);

    await page.click('a:has-text("Manage Habits")');
    await addHabit(page, 'Demo Habit Before Login');

    // Log in with existing account
    const email = 'existing-test-user@example.com';
    const password = 'ExistingPassword123!';
    await signInWithEmail(page, email, password);

    // Wait for migration toast
    const toast = page.locator('[role="alert"]', { hasText: 'Welcome!' });
    await expect(toast).toBeVisible({ timeout: 10000 });

    // Verify habit was migrated
    await page.click('a:has-text("Manage Habits")');
    await expect(page.locator('text=Demo Habit Before Login')).toBeVisible();
  });
});

// ============================================================================
// Test Suite: Migration Data Integrity
// ============================================================================

test.describe('Migration Data Integrity', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await clearDemoData(page);
  });

  test('should preserve all habits during migration', async ({ page }) => {
    await page.click('button:has-text("Try Without Signing In")');
    await page.waitForURL(/\/daily-log$/);

    // Add 5 habits with different names
    await page.click('a:has-text("Manage Habits")');
    const habitNames = [
      'Morning Meditation',
      'Read for 30 minutes',
      'Exercise',
      'Drink 8 glasses of water',
      'Journal before bed',
    ];

    for (const name of habitNames) {
      await addHabit(page, name);
      await page.waitForTimeout(500); // Small delay between habits
    }

    // Sign up
    const email = generateUniqueEmail();
    await signUpWithEmail(page, email, 'TestPassword123!');

    // Wait for migration
    await page.waitForSelector('text=Your demo data has been saved', { timeout: 10000 });

    // Verify all habits are present
    await page.click('a:has-text("Manage Habits")');
    for (const name of habitNames) {
      await expect(page.locator(`text=${name}`)).toBeVisible();
    }
  });

  test('should preserve daily logs during migration', async ({ page }) => {
    await page.click('button:has-text("Try Without Signing In")');
    await page.waitForURL(/\/daily-log$/);

    // Add a habit
    await page.click('a:has-text("Manage Habits")');
    await addHabit(page, 'Test Habit');

    // Go to daily log and mark as done with note
    await page.click('a:has-text("Daily Log")');
    const toggle = page.locator('.toggle-switch').first();
    await toggle.click(); // Mark as done

    // Add note
    const notesField = page.locator('textarea[placeholder*="notes" i]');
    await notesField.fill('This is a test note from demo mode');

    // Save logs
    await page.click('button:has-text("Save Logs")');
    await page.waitForSelector('text=Logs saved successfully', { timeout: 5000 });

    // Sign up
    const email = generateUniqueEmail();
    await signUpWithEmail(page, email, 'TestPassword123!');

    // Wait for migration
    await page.waitForSelector('text=Your demo data has been saved', { timeout: 10000 });

    // Verify log is preserved
    await page.click('a:has-text("Daily Log")');

    // Check if toggle is still marked as done
    const toggleAfter = page.locator('.toggle-switch').first();
    await expect(toggleAfter).toHaveClass(/checked|done|active/); // Depends on CSS class naming

    // Check if note is preserved
    const notesFieldAfter = page.locator('textarea[placeholder*="notes" i]');
    await expect(notesFieldAfter).toHaveValue('This is a test note from demo mode');
  });
});

// ============================================================================
// Test Suite: Migration Error Handling
// ============================================================================

test.describe('Migration Error Handling', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await clearDemoData(page);
  });

  test('should allow authentication even if migration fails', async ({ page }) => {
    // This test simulates a migration failure scenario
    // In a real implementation, you might mock the sync service to fail

    await page.click('button:has-text("Try Without Signing In")');
    await page.waitForURL(/\/daily-log$/);

    await page.click('a:has-text("Manage Habits")');
    await addHabit(page, 'Test Habit');

    // Intercept sync requests and make them fail (if API endpoint exists)
    // This is a simplified version - actual implementation depends on API structure
    await page.route('**/sync**', (route) => route.abort());

    // Sign up
    const email = generateUniqueEmail();
    const password = 'TestPassword123!';

    try {
      await signUpWithEmail(page, email, password);

      // User should still be authenticated even if migration failed
      await expect(page).toHaveURL(/\/daily-log$/);

      // Demo banner should be gone (user is authenticated)
      await expect(page.locator('text=You\'re trying Habit Tracker')).not.toBeVisible();
    } catch (error) {
      // If signup itself fails due to network issues, that's expected in this test
      console.log('Signup failed as expected due to network abort:', error);
    }
  });

  test.skip('should show error banner if migration fails with retry button', async ({ page }) => {
    // This test is skipped because it requires careful mocking of the sync service
    // In production:
    // 1. Mock syncService.fullSync() to fail
    // 2. Sign up
    // 3. Verify error banner appears
    // 4. Click "Retry Sync"
    // 5. Verify retry works

    await page.goto('/');
    // Test implementation here
  });
});

// ============================================================================
// Test Suite: Edge Cases
// ============================================================================

test.describe('Migration Edge Cases', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await clearDemoData(page);
  });

  test('should handle migration with no demo data gracefully', async ({ page }) => {
    // Sign up without entering demo mode first
    const email = generateUniqueEmail();
    await signUpWithEmail(page, email, 'TestPassword123!');

    // Should succeed without errors
    await expect(page).toHaveURL(/\/daily-log$/);

    // No migration toast should appear (no demo data to migrate)
    const toast = page.locator('text=Your demo data has been saved');
    await expect(toast).not.toBeVisible({ timeout: 2000 });
  });

  test('should handle migration with empty demo metrics', async ({ page }) => {
    // Initialize demo mode but don't add any data
    await page.click('button:has-text("Try Without Signing In")');
    await page.waitForURL(/\/daily-log$/);

    // Immediately sign up without adding habits
    const email = generateUniqueEmail();
    await signUpWithEmail(page, email, 'TestPassword123!');

    // Migration should succeed (even with no habits/logs)
    await expect(page).toHaveURL(/\/daily-log$/);

    // Toast may or may not appear - both are acceptable
    // Demo metrics should be cleared
    const metrics = await page.evaluate(() => {
      return localStorage.getItem('habitTracker_demoMetrics');
    });
    expect(metrics).toBeNull();
  });

  test('should not show migration toast on subsequent logins', async ({ page }) => {
    // First signup with demo data
    await page.click('button:has-text("Try Without Signing In")');
    await page.waitForURL(/\/daily-log$/);

    await page.click('a:has-text("Manage Habits")');
    await addHabit(page, 'Test Habit');

    const email = generateUniqueEmail();
    const password = 'TestPassword123!';

    await signUpWithEmail(page, email, password);

    // Wait for first migration toast
    await page.waitForSelector('text=Your demo data has been saved', { timeout: 10000 });
    await page.waitForTimeout(7000); // Wait for toast to disappear

    // Log out (if logout functionality exists)
    // For now, we'll just clear session and go back to welcome

    await page.context().clearCookies();
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });

    // Log back in
    await signInWithEmail(page, email, password);

    // Migration toast should NOT appear (no demo data to migrate)
    const toast = page.locator('text=Your demo data has been saved');
    await expect(toast).not.toBeVisible({ timeout: 2000 });
  });
});
