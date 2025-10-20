/**
 * E2E Tests: Demo Mode Onboarding Flow
 *
 * Tests the complete demo mode user journey from entry to conversion triggers
 *
 * Coverage:
 * - Demo mode entry (clicking "Try Without Signing In")
 * - Demo banner visibility and persistence
 * - Conversion modal triggers (3 habits, first log, progress page)
 * - Milestone toast notifications
 * - Locked progress preview
 * - Expiry warning (day 5-7)
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
  });
}

/**
 * Sets demo start date to specific days ago
 */
async function setDemoStartDate(page: Page, daysAgo: number) {
  await page.evaluate((days) => {
    const metrics = JSON.parse(
      localStorage.getItem('habitTracker_demoMetrics') || '{}'
    );
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    metrics.demo_start_date = startDate.toISOString();
    localStorage.setItem('habitTracker_demoMetrics', JSON.stringify(metrics));
  }, daysAgo);
}

/**
 * Adds a habit via the UI
 */
async function addHabit(page: Page, habitName: string) {
  await page.click('button:has-text("Add Habit")');
  await page.fill('input[placeholder*="habit name" i]', habitName);
  await page.click('button:has-text("Save")');

  // Wait for habit to appear in list
  await page.waitForSelector(`text=${habitName}`, { timeout: 5000 });
}

/**
 * Waits for toast notification to appear
 */
async function waitForToast(page: Page, expectedText: string) {
  const toast = page.locator('[role="alert"]', { hasText: expectedText });
  await toast.waitFor({ state: 'visible', timeout: 5000 });
  return toast;
}

/**
 * Waits for conversion modal to appear
 */
async function waitForConversionModal(page: Page) {
  const modal = page.locator('[role="dialog"]');
  await modal.waitFor({ state: 'visible', timeout: 5000 });
  return modal;
}

// ============================================================================
// Test Suite: Demo Mode Entry
// ============================================================================

test.describe('Demo Mode Entry', () => {
  test.beforeEach(async ({ page }) => {
    // Clear any existing demo data
    await page.goto('/');
    await clearDemoData(page);
  });

  test('should allow user to try app without signing in', async ({ page }) => {
    await page.goto('/');

    // Verify "Try Without Signing In" button exists
    const demoButton = page.locator('button:has-text("Try Without Signing In")');
    await expect(demoButton).toBeVisible();

    // Click button
    await demoButton.click();

    // Should redirect to /daily-log
    await expect(page).toHaveURL(/\/daily-log$/);

    // Demo banner should be visible
    const demoBanner = page.locator('text=You\'re trying Habit Tracker');
    await expect(demoBanner).toBeVisible();
  });

  test('should initialize demo metrics in localStorage', async ({ page }) => {
    await page.goto('/');
    await page.click('button:has-text("Try Without Signing In")');

    // Check localStorage was initialized
    const metrics = await page.evaluate(() => {
      return localStorage.getItem('habitTracker_demoMetrics');
    });

    expect(metrics).not.toBeNull();
    const parsed = JSON.parse(metrics!);
    expect(parsed.demo_habits_added).toBe(0);
    expect(parsed.demo_logs_completed).toBe(0);
    expect(parsed.demo_progress_visits).toBe(0);
    expect(parsed.demo_conversion_shown).toBe(false);
    expect(parsed.demo_start_date).toBeDefined();
  });

  test('should show demo banner on all protected routes', async ({ page }) => {
    await page.goto('/');
    await page.click('button:has-text("Try Without Signing In")');

    // Check demo banner on daily-log
    await expect(page.locator('text=You\'re trying Habit Tracker')).toBeVisible();

    // Navigate to manage-habits
    await page.click('a:has-text("Manage Habits")');
    await expect(page).toHaveURL(/\/manage-habits$/);
    await expect(page.locator('text=You\'re trying Habit Tracker')).toBeVisible();

    // Navigate to progress
    await page.click('a:has-text("Progress")');
    await expect(page).toHaveURL(/\/progress$/);
    await expect(page.locator('text=You\'re trying Habit Tracker')).toBeVisible();
  });

  test('demo banner should have functional "Sign In" button', async ({ page }) => {
    await page.goto('/');
    await page.click('button:has-text("Try Without Signing In")');

    // Click "Sign In" button in demo banner
    const signInButton = page.locator('.demo-banner button:has-text("Sign In")');
    await signInButton.click();

    // Should navigate back to welcome page
    await expect(page).toHaveURL('/');
  });
});

// ============================================================================
// Test Suite: Milestone Celebrations
// ============================================================================

test.describe('Milestone Celebrations', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await clearDemoData(page);
    await page.click('button:has-text("Try Without Signing In")');
    await page.waitForURL(/\/daily-log$/);
  });

  test('should show toast after adding first habit', async ({ page }) => {
    await page.click('a:has-text("Manage Habits")');

    await addHabit(page, 'Morning Run');

    // Wait for milestone toast
    const toast = await waitForToast(page, 'Great start! Add 2 more to build your routine.');
    await expect(toast).toBeVisible();
  });

  test('should show toast after adding 3rd habit', async ({ page }) => {
    await page.click('a:has-text("Manage Habits")');

    await addHabit(page, 'Morning Run');
    await page.waitForTimeout(500); // Wait for first toast to disappear

    await addHabit(page, 'Read 30 minutes');
    await page.waitForTimeout(500);

    await addHabit(page, 'Meditate');

    // Wait for 3-habits milestone toast
    const toast = await waitForToast(page, 'You\'ve added 3 habits');
    await expect(toast).toBeVisible();
  });

  test('should not repeat milestone toasts', async ({ page }) => {
    await page.click('a:has-text("Manage Habits")');

    // Add first habit
    await addHabit(page, 'Morning Run');
    await waitForToast(page, 'Great start!');

    // Wait for toast to disappear
    await page.waitForTimeout(5000);

    // Add second habit - should not show first_habit milestone again
    await addHabit(page, 'Read 30 minutes');

    // Verify no toast appears (should timeout)
    const toast = page.locator('[role="alert"]', { hasText: 'Great start!' });
    await expect(toast).not.toBeVisible({ timeout: 2000 });
  });
});

// ============================================================================
// Test Suite: Conversion Triggers
// ============================================================================

test.describe('Conversion Triggers', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await clearDemoData(page);
    await page.click('button:has-text("Try Without Signing In")');
    await page.waitForURL(/\/daily-log$/);
  });

  test('should show conversion modal after adding 3 habits', async ({ page }) => {
    await page.click('a:has-text("Manage Habits")');

    // Add 3 habits
    await addHabit(page, 'Habit 1');
    await page.waitForTimeout(500);
    await addHabit(page, 'Habit 2');
    await page.waitForTimeout(500);
    await addHabit(page, 'Habit 3');

    // Wait for conversion modal
    const modal = await waitForConversionModal(page);
    await expect(modal).toBeVisible();

    // Verify modal content
    await expect(modal.locator('text=You\'re building momentum')).toBeVisible();
    await expect(modal.locator('button:has-text("Sign In to Save Progress")')).toBeVisible();
    await expect(modal.locator('button:has-text("Continue in Demo Mode")')).toBeVisible();
  });

  test('should show conversion modal after completing first log', async ({ page }) => {
    // First, add a habit
    await page.click('a:has-text("Manage Habits")');
    await addHabit(page, 'Morning Run');
    await page.click('a:has-text("Daily Log")');

    // Complete first log
    const toggle = page.locator('.toggle-switch').first();
    await toggle.click();

    // Save logs
    await page.click('button:has-text("Save Logs")');
    await page.waitForSelector('text=Logs saved successfully', { timeout: 5000 });

    // Wait for conversion modal
    const modal = await waitForConversionModal(page);
    await expect(modal).toBeVisible();
    await expect(modal.locator('text=Great start')).toBeVisible();
  });

  test('should show conversion modal when visiting Progress page', async ({ page }) => {
    // Navigate to Progress page
    await page.click('a:has-text("Progress")');

    // Wait for conversion modal
    const modal = await waitForConversionModal(page);
    await expect(modal).toBeVisible();
    await expect(modal.locator('text=Unlock Your Analytics')).toBeVisible();
  });

  test('should only show conversion modal once', async ({ page }) => {
    await page.click('a:has-text("Manage Habits")');

    // Add 3 habits to trigger modal
    await addHabit(page, 'Habit 1');
    await page.waitForTimeout(500);
    await addHabit(page, 'Habit 2');
    await page.waitForTimeout(500);
    await addHabit(page, 'Habit 3');

    // Wait for modal and dismiss it
    const modal = await waitForConversionModal(page);
    await modal.locator('button:has-text("Continue in Demo Mode")').click();
    await expect(modal).not.toBeVisible();

    // Add another habit - modal should not appear again
    await page.waitForTimeout(1000);
    await addHabit(page, 'Habit 4');

    // Verify modal does not appear
    const modal2 = page.locator('[role="dialog"]');
    await expect(modal2).not.toBeVisible({ timeout: 2000 });
  });

  test('conversion modal should be dismissible by clicking overlay', async ({ page }) => {
    await page.click('a:has-text("Progress")');

    const modal = await waitForConversionModal(page);

    // Click overlay (outside modal content)
    await page.locator('.modal-overlay').click({ position: { x: 10, y: 10 } });

    // Modal should disappear
    await expect(modal).not.toBeVisible();
  });

  test('conversion modal should be dismissible by clicking X button', async ({ page }) => {
    await page.click('a:has-text("Progress")');

    const modal = await waitForConversionModal(page);

    // Click X button
    await modal.locator('button[aria-label*="Close" i]').click();

    // Modal should disappear
    await expect(modal).not.toBeVisible();
  });
});

// ============================================================================
// Test Suite: Locked Progress Preview
// ============================================================================

test.describe('Locked Progress Preview', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await clearDemoData(page);
    await page.click('button:has-text("Try Without Signing In")');
    await page.waitForURL(/\/daily-log$/);
  });

  test('should show locked preview on Progress page in demo mode', async ({ page }) => {
    await page.click('a:has-text("Progress")');

    // Wait for modal and dismiss it
    const modal = await waitForConversionModal(page);
    await modal.locator('button:has-text("Continue in Demo Mode")').click();

    // Verify locked preview is visible
    await expect(page.locator('text=Unlock Your Progress Analytics')).toBeVisible();
    await expect(page.locator('text=7-day & 30-day streak tracking')).toBeVisible();
    await expect(page.locator('text=Completion trends over time')).toBeVisible();
    await expect(page.locator('text=Notes sentiment analysis')).toBeVisible();
  });

  test('locked preview should have blurred background', async ({ page }) => {
    await page.click('a:has-text("Progress")');

    // Dismiss modal
    const modal = await waitForConversionModal(page);
    await modal.locator('button:has-text("Continue in Demo Mode")').click();

    // Check for blurred background element
    const blurredBg = page.locator('.locked-progress-preview .blurred-background');
    await expect(blurredBg).toBeVisible();
  });

  test('locked preview "Sign In to Unlock" button should navigate to welcome page', async ({ page }) => {
    await page.click('a:has-text("Progress")');

    // Dismiss modal
    const modal = await waitForConversionModal(page);
    await modal.locator('button:has-text("Continue in Demo Mode")').click();

    // Click "Sign In to Unlock" button
    await page.click('button:has-text("Sign In to Unlock")');

    // Should navigate to welcome page
    await expect(page).toHaveURL('/');
  });
});

// ============================================================================
// Test Suite: Demo Expiry Warning
// ============================================================================

test.describe('Demo Expiry Warning', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await clearDemoData(page);
    await page.click('button:has-text("Try Without Signing In")');
    await page.waitForURL(/\/daily-log$/);
  });

  test('should show expiry warning on day 5 (2 days remaining)', async ({ page }) => {
    // Set demo start date to 5 days ago
    await setDemoStartDate(page, 5);

    // Reload page to trigger expiry check
    await page.reload();

    // Wait for expiry warning
    const warning = page.locator('text=Your demo data will be deleted in 2 day');
    await expect(warning).toBeVisible();
  });

  test('should show expiry warning on day 6 (1 day remaining)', async ({ page }) => {
    await setDemoStartDate(page, 6);
    await page.reload();

    const warning = page.locator('text=Your demo data will be deleted in 1 day');
    await expect(warning).toBeVisible();
  });

  test('should not show expiry warning before day 5', async ({ page }) => {
    await setDemoStartDate(page, 3);
    await page.reload();

    // Warning should not be visible
    const warning = page.locator('.expiry-warning');
    await expect(warning).not.toBeVisible({ timeout: 2000 });
  });

  test('expiry warning should have "Sign In Now" button', async ({ page }) => {
    await setDemoStartDate(page, 5);
    await page.reload();

    const signInButton = page.locator('.expiry-warning button:has-text("Sign In Now")');
    await expect(signInButton).toBeVisible();

    // Click button
    await signInButton.click();

    // Should navigate to welcome page
    await expect(page).toHaveURL('/');
  });
});

// ============================================================================
// Test Suite: Demo Data Expiry
// ============================================================================

test.describe('Demo Data Expiry', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await clearDemoData(page);
  });

  test('should clear demo data and redirect after 7 days', async ({ page }) => {
    // Initialize demo mode
    await page.click('button:has-text("Try Without Signing In")');
    await page.waitForURL(/\/daily-log$/);

    // Add a habit to verify data exists
    await page.click('a:has-text("Manage Habits")');
    await addHabit(page, 'Test Habit');

    // Set demo start date to 7 days ago
    await setDemoStartDate(page, 7);

    // Try to access daily-log (should redirect to /)
    await page.goto('/daily-log');

    // Should redirect to welcome page
    await expect(page).toHaveURL('/');

    // Demo data should be cleared
    const metrics = await page.evaluate(() => {
      return localStorage.getItem('habitTracker_demoMetrics');
    });
    expect(metrics).toBeNull();
  });

  test('should allow access before 7 days', async ({ page }) => {
    await page.click('button:has-text("Try Without Signing In")');
    await page.waitForURL(/\/daily-log$/);

    // Set demo start date to 6 days ago (still valid)
    await setDemoStartDate(page, 6);

    // Reload page
    await page.reload();

    // Should still be on daily-log page
    await expect(page).toHaveURL(/\/daily-log$/);

    // Demo banner should still be visible
    await expect(page.locator('text=You\'re trying Habit Tracker')).toBeVisible();
  });
});
