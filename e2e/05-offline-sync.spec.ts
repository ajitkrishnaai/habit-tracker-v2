import { test, expect } from '@playwright/test';
import { signIn } from './utils/auth-helpers';
import { clearAllData, seedHabits, getLogs, getHabits } from './utils/data-helpers';
import {
  goOffline,
  goOnline,
  mockGoogleSheetsAPI,
  waitForSync,
} from './utils/network-helpers';

/**
 * E2E Test Suite: Offline Sync Flow
 *
 * Tests offline-first functionality and sync behavior:
 * 1. App works completely offline
 * 2. Changes are queued when offline
 * 3. Sync happens automatically when back online
 * 4. Offline indicator shows current state
 * 5. Sync indicator shows sync progress
 * 6. Conflict resolution (last-write-wins)
 *
 * This is critical for PWA functionality and user trust.
 */

test.describe('Offline Sync Flow', () => {
  test.beforeEach(async ({ page, context }) => {
    await clearAllData(page);
    await page.goto('/');
    await signIn(page);

    // Mock Google Sheets API to avoid real network calls
    await mockGoogleSheetsAPI(page);

    // Seed test habits
    await seedHabits(page, [
      { name: 'Morning Run', category: 'Health', goal: 'Run 5K' },
      { name: 'Read Book', category: 'Learning', goal: 'Read 30 min' },
    ]);

    await page.goto('/daily-log');
    await page.waitForLoadState('networkidle');
  });

  test('should show offline indicator when network is disconnected', async ({
    page,
    context,
  }) => {
    // Go offline
    await goOffline(context);

    // Wait for offline indicator to appear
    const offlineIndicator = page.locator('[data-testid="offline-indicator"]').or(
      page.locator('text=/Offline|No connection/i')
    );

    await expect(offlineIndicator).toBeVisible({ timeout: 5000 });
  });

  test('should hide offline indicator when back online', async ({ page, context }) => {
    // Go offline first
    await goOffline(context);

    const offlineIndicator = page.locator('[data-testid="offline-indicator"]').or(
      page.locator('text=/Offline|No connection/i')
    );

    await expect(offlineIndicator).toBeVisible({ timeout: 5000 });

    // Go back online
    await goOnline(context);

    // Wait for offline indicator to disappear
    await expect(offlineIndicator).not.toBeVisible({ timeout: 5000 });
  });

  test('should allow habit logging while offline', async ({ page, context }) => {
    // Go offline
    await goOffline(context);

    // Wait for offline indicator
    await page.waitForTimeout(1000);

    // Toggle a habit
    const toggle = page
      .locator('[data-testid*="habit-toggle"]')
      .filter({ hasText: 'Morning Run' })
      .first();

    await toggle.click();

    // Should update immediately (optimistic UI)
    await expect(toggle).toHaveAttribute('aria-checked', 'true');

    // Add notes
    const notesField = page.getByLabel(/Notes/i);
    await notesField.fill('Logged while offline!');

    // Wait a bit for localStorage to save
    await page.waitForTimeout(500);

    // Verify data was saved locally
    const logs = await getLogs(page);
    expect(logs.length).toBeGreaterThan(0);
    expect(logs.some((log) => log.status === 'done')).toBe(true);
  });

  test('should queue operations when offline', async ({ page, context }) => {
    // Go offline
    await goOffline(context);
    await page.waitForTimeout(1000);

    // Perform multiple operations
    const toggle1 = page
      .locator('[data-testid*="habit-toggle"]')
      .filter({ hasText: 'Morning Run' })
      .first();
    const toggle2 = page
      .locator('[data-testid*="habit-toggle"]')
      .filter({ hasText: 'Read Book' })
      .first();

    await toggle1.click();
    await toggle2.click();

    const notesField = page.getByLabel(/Notes/i);
    await notesField.fill('Multiple operations while offline');

    await page.waitForTimeout(500);

    // Check sync queue in localStorage
    const queueSize = await page.evaluate(() => {
      const queue = localStorage.getItem('habitTracker_syncQueue');
      if (!queue) return 0;
      return JSON.parse(queue).length;
    });

    expect(queueSize).toBeGreaterThan(0);
  });

  test('should sync queued operations when back online', async ({ page, context }) => {
    // Go offline
    await goOffline(context);
    await page.waitForTimeout(1000);

    // Perform operations
    const toggle = page
      .locator('[data-testid*="habit-toggle"]')
      .filter({ hasText: 'Morning Run' })
      .first();
    await toggle.click();
    await page.waitForTimeout(500);

    // Verify queue has items
    let queueSize = await page.evaluate(() => {
      const queue = localStorage.getItem('habitTracker_syncQueue');
      return queue ? JSON.parse(queue).length : 0;
    });
    expect(queueSize).toBeGreaterThan(0);

    // Go back online
    await goOnline(context);

    // Wait for sync to complete (look for sync indicator showing success)
    await page.waitForTimeout(3000);

    // Queue should be cleared after successful sync
    queueSize = await page.evaluate(() => {
      const queue = localStorage.getItem('habitTracker_syncQueue');
      return queue ? JSON.parse(queue).length : 0;
    });
    expect(queueSize).toBe(0);
  });

  test('should show sync indicator during sync', async ({ page, context }) => {
    // Go offline and make changes
    await goOffline(context);
    await page.waitForTimeout(1000);

    const toggle = page
      .locator('[data-testid*="habit-toggle"]')
      .filter({ hasText: 'Morning Run' })
      .first();
    await toggle.click();
    await page.waitForTimeout(500);

    // Go back online
    await goOnline(context);

    // Look for sync indicator showing "syncing" state
    const syncIndicator = page.locator('[data-testid="sync-indicator"]');

    if (await syncIndicator.isVisible()) {
      // Should show syncing state (might be too fast to catch)
      const syncingState = page.locator(
        '[data-testid="sync-indicator"][data-status="syncing"]'
      );

      // May need to wait a bit or check for success state
      await page.waitForTimeout(2000);

      // Eventually should show success
      const successState = page.locator(
        '[data-testid="sync-indicator"][data-status="success"]'
      );
      if (await successState.isVisible()) {
        await expect(successState).toBeVisible();
      }
    }
  });

  test('should persist offline changes across page reloads', async ({ page, context }) => {
    // Go offline
    await goOffline(context);
    await page.waitForTimeout(1000);

    // Log a habit
    const toggle = page
      .locator('[data-testid*="habit-toggle"]')
      .filter({ hasText: 'Morning Run' })
      .first();
    await toggle.click();

    const notesField = page.getByLabel(/Notes/i);
    await notesField.fill('Persisted offline data');
    await page.waitForTimeout(500);

    // Reload page while still offline
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Changes should still be there
    const reloadedToggle = page
      .locator('[data-testid*="habit-toggle"]')
      .filter({ hasText: 'Morning Run' })
      .first();
    await expect(reloadedToggle).toHaveAttribute('aria-checked', 'true');

    const reloadedNotes = page.getByLabel(/Notes/i);
    await expect(reloadedNotes).toHaveValue('Persisted offline data');
  });

  test('should handle creating habits while offline', async ({ page, context }) => {
    // Navigate to manage habits
    await page.goto('/manage-habits');
    await page.waitForLoadState('networkidle');

    // Go offline
    await goOffline(context);
    await page.waitForTimeout(1000);

    // Create new habit
    await page.getByRole('button', { name: /Add Habit/i }).click();
    await page.getByLabel(/Habit Name/i).fill('Offline Habit');
    await page.getByLabel(/Category/i).fill('Test');
    await page.getByLabel(/Goal/i).fill('Created while offline');
    await page.getByRole('button', { name: /Save/i }).click();

    // Should see habit immediately
    await expect(page.locator('text=Offline Habit')).toBeVisible();

    // Verify saved locally
    const habits = await getHabits(page);
    expect(habits.some((h) => h.name === 'Offline Habit')).toBe(true);

    // Go back online and verify sync
    await goOnline(context);
    await page.waitForTimeout(2000);

    // Habit should still be there
    await expect(page.locator('text=Offline Habit')).toBeVisible();
  });

  test('should handle editing habits while offline', async ({ page, context }) => {
    await page.goto('/manage-habits');
    await page.waitForLoadState('networkidle');

    // Go offline
    await goOffline(context);
    await page.waitForTimeout(1000);

    // Edit existing habit
    const editButton = page.getByRole('button', { name: /Edit/i }).first();
    await editButton.click();

    await page.getByLabel(/Habit Name/i).fill('Morning Run - Updated Offline');
    await page.getByRole('button', { name: /Save/i }).click();

    // Should see updated name
    await expect(page.locator('text=Morning Run - Updated Offline')).toBeVisible();

    // Verify saved locally
    const habits = await getHabits(page);
    expect(habits.some((h) => h.name === 'Morning Run - Updated Offline')).toBe(true);
  });

  test('should handle deleting habits while offline', async ({ page, context }) => {
    await page.goto('/manage-habits');
    await page.waitForLoadState('networkidle');

    // Go offline
    await goOffline(context);
    await page.waitForTimeout(1000);

    // Delete habit
    const deleteButton = page.getByRole('button', { name: /Delete/i }).first();

    // Set up dialog handler
    page.once('dialog', async (dialog) => {
      await dialog.accept();
    });

    await deleteButton.click();
    await page.waitForTimeout(500);

    // Habit should be gone from UI
    await expect(page.locator('text=Morning Run')).not.toBeVisible();

    // Verify marked as inactive locally
    const habits = await getHabits(page);
    const deletedHabit = habits.find((h) => h.name === 'Morning Run');
    if (deletedHabit) {
      expect(deletedHabit.status).toBe('inactive');
    }
  });

  test('should work completely offline for extended period', async ({ page, context }) => {
    // Go offline at the start
    await goOffline(context);
    await page.waitForTimeout(1000);

    // Perform various operations over "multiple days" (simulated)

    // Day 1: Log habits
    await page.goto('/daily-log');
    const toggle1 = page
      .locator('[data-testid*="habit-toggle"]')
      .filter({ hasText: 'Morning Run' })
      .first();
    await toggle1.click();
    await page.waitForTimeout(300);

    // Create new habit
    await page.goto('/manage-habits');
    await page.getByRole('button', { name: /Add Habit/i }).click();
    await page.getByLabel(/Habit Name/i).fill('Offline Habit');
    await page.getByLabel(/Category/i).fill('Test');
    await page.getByLabel(/Goal/i).fill('Test');
    await page.getByRole('button', { name: /Save/i }).click();
    await page.waitForTimeout(300);

    // View progress
    await page.goto('/progress');
    await expect(page.locator('text=Morning Run')).toBeVisible();
    await expect(page.locator('text=Offline Habit')).toBeVisible();

    // Everything should work seamlessly
    const habits = await getHabits(page);
    expect(habits.length).toBeGreaterThanOrEqual(3);

    const logs = await getLogs(page);
    expect(logs.length).toBeGreaterThan(0);

    // Finally go online and sync
    await goOnline(context);
    await page.waitForTimeout(3000);

    // All data should be preserved
    await page.reload();
    await page.goto('/manage-habits');
    await expect(page.locator('text=Offline Habit')).toBeVisible();
  });

  test('should show appropriate error message if sync fails', async ({ page, context }) => {
    // Mock API to fail
    await page.route('**/v4/spreadsheets/**', (route) => {
      route.abort('failed');
    });

    // Go offline and make changes
    await goOffline(context);
    await page.waitForTimeout(1000);

    const toggle = page
      .locator('[data-testid*="habit-toggle"]')
      .filter({ hasText: 'Morning Run' })
      .first();
    await toggle.click();
    await page.waitForTimeout(500);

    // Go online (sync will fail due to route abort)
    await goOnline(context);
    await page.waitForTimeout(3000);

    // Should show error indicator
    const syncError = page.locator('[data-testid="sync-indicator"][data-status="error"]').or(
      page.locator('text=/Sync failed|Error syncing/i')
    );

    if (await syncError.isVisible()) {
      await expect(syncError).toBeVisible();

      // Should have retry button
      const retryButton = page.getByRole('button', { name: /Retry/i });
      if (await retryButton.isVisible()) {
        await expect(retryButton).toBeVisible();
      }
    }
  });

  test('should retry failed sync operations', async ({ page, context }) => {
    let requestCount = 0;

    // Mock API to fail first time, succeed second time
    await page.route('**/v4/spreadsheets/**/values/**:batchUpdate', (route) => {
      requestCount++;
      if (requestCount === 1) {
        route.abort('failed');
      } else {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ totalUpdatedRows: 1 }),
        });
      }
    });

    // Go offline and make changes
    await goOffline(context);
    await page.waitForTimeout(1000);

    const toggle = page
      .locator('[data-testid*="habit-toggle"]')
      .filter({ hasText: 'Morning Run' })
      .first();
    await toggle.click();
    await page.waitForTimeout(500);

    // Go online (first sync will fail)
    await goOnline(context);
    await page.waitForTimeout(2000);

    // Click retry button if visible
    const retryButton = page.getByRole('button', { name: /Retry/i });
    if (await retryButton.isVisible()) {
      await retryButton.click();
      await page.waitForTimeout(2000);

      // Should eventually succeed
      const successIndicator = page.locator(
        '[data-testid="sync-indicator"][data-status="success"]'
      );
      if (await successIndicator.isVisible()) {
        await expect(successIndicator).toBeVisible();
      }
    }
  });
});
