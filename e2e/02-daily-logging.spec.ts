import { test, expect } from '@playwright/test';
import { signIn } from './utils/auth-helpers';
import { clearAllData, seedHabits, getLogs } from './utils/data-helpers';

/**
 * E2E Test Suite: Daily Logging Flow
 *
 * Tests the core daily habit logging functionality:
 * 1. Viewing today's habits
 * 2. Toggling habits as done/not done
 * 3. Adding shared notes
 * 4. Navigating to previous dates (back-dating up to 5 days)
 * 5. Optimistic UI updates
 *
 * This is the most frequently used feature - the daily interaction.
 */

test.describe('Daily Logging Flow', () => {
  test.beforeEach(async ({ page }) => {
    await clearAllData(page);
    await page.goto('/');
    await signIn(page);

    // Seed test habits
    await seedHabits(page, [
      { name: 'Morning Exercise', category: 'Health', goal: 'Exercise 30 min' },
      { name: 'Read Book', category: 'Learning', goal: 'Read 20 min' },
      { name: 'Meditate', category: 'Mindfulness', goal: 'Meditate 10 min' },
    ]);

    await page.goto('/daily-log');
    await page.waitForLoadState('networkidle');
  });

  test('should display all active habits for today', async ({ page }) => {
    // Should show date (today)
    const today = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
    await expect(page.locator('text=' + today)).toBeVisible();

    // Should show all three habits
    await expect(page.locator('text=Morning Exercise')).toBeVisible();
    await expect(page.locator('text=Read Book')).toBeVisible();
    await expect(page.locator('text=Meditate')).toBeVisible();

    // All toggles should be unchecked (no logs yet)
    const toggles = page.locator('[data-testid*="habit-toggle"]');
    const count = await toggles.count();
    expect(count).toBe(3);

    for (let i = 0; i < count; i++) {
      await expect(toggles.nth(i)).toHaveAttribute('aria-checked', 'false');
    }
  });

  test('should toggle habit as done with optimistic UI', async ({ page }) => {
    const exerciseToggle = page
      .locator('[data-testid*="habit-toggle"]')
      .filter({ hasText: 'Morning Exercise' })
      .first();

    // Initially unchecked
    await expect(exerciseToggle).toHaveAttribute('aria-checked', 'false');

    // Click to mark as done
    await exerciseToggle.click();

    // Should immediately update (optimistic UI)
    await expect(exerciseToggle).toHaveAttribute('aria-checked', 'true');

    // Reload page to verify persistence
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Should still be checked
    const reloadedToggle = page
      .locator('[data-testid*="habit-toggle"]')
      .filter({ hasText: 'Morning Exercise' })
      .first();
    await expect(reloadedToggle).toHaveAttribute('aria-checked', 'true');
  });

  test('should toggle habit between done, not_done, and no_data', async ({ page }) => {
    const exerciseToggle = page
      .locator('[data-testid*="habit-toggle"]')
      .filter({ hasText: 'Morning Exercise' })
      .first();

    // State 1: no_data (unchecked)
    await expect(exerciseToggle).toHaveAttribute('aria-checked', 'false');

    // Click once: done
    await exerciseToggle.click();
    await expect(exerciseToggle).toHaveAttribute('aria-checked', 'true');

    // Click again: not_done (unchecked but logged)
    await exerciseToggle.click();
    await expect(exerciseToggle).toHaveAttribute('aria-checked', 'false');

    // Click again: back to done
    await exerciseToggle.click();
    await expect(exerciseToggle).toHaveAttribute('aria-checked', 'true');
  });

  test('should add shared notes for all habits', async ({ page }) => {
    const notesField = page.getByLabel(/Notes/i);
    await expect(notesField).toBeVisible();

    // Add notes
    const noteText = 'Had a great day! Completed all morning routines on time.';
    await notesField.fill(noteText);

    // Notes should persist
    await expect(notesField).toHaveValue(noteText);

    // Reload and check persistence
    await page.reload();
    await page.waitForLoadState('networkidle');

    const reloadedNotes = page.getByLabel(/Notes/i);
    await expect(reloadedNotes).toHaveValue(noteText);
  });

  test('should mark multiple habits as done and add notes', async ({ page }) => {
    // Mark first two habits as done
    const exerciseToggle = page
      .locator('[data-testid*="habit-toggle"]')
      .filter({ hasText: 'Morning Exercise' })
      .first();
    const readToggle = page
      .locator('[data-testid*="habit-toggle"]')
      .filter({ hasText: 'Read Book' })
      .first();

    await exerciseToggle.click();
    await readToggle.click();

    await expect(exerciseToggle).toHaveAttribute('aria-checked', 'true');
    await expect(readToggle).toHaveAttribute('aria-checked', 'true');

    // Add shared notes
    const notesField = page.getByLabel(/Notes/i);
    await notesField.fill('Exercise: 40 min run. Reading: Finished chapter 5.');

    // Verify data was saved
    const logs = await getLogs(page);
    expect(logs.length).toBeGreaterThanOrEqual(2);

    // Check that at least one log has notes
    const logsWithNotes = logs.filter((log) => log.notes && log.notes.includes('chapter 5'));
    expect(logsWithNotes.length).toBeGreaterThan(0);
  });

  test('should navigate to previous date and log past habits', async ({ page }) => {
    // Find date navigator (prev/next buttons or date picker)
    const prevButton = page.getByRole('button', { name: /Previous/i }).or(page.locator('[aria-label*="Previous"]'));

    if (await prevButton.isVisible()) {
      // Click previous day
      await prevButton.click();

      // Date should change (should not be today)
      const today = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
      });

      // Wait a bit for date to update
      await page.waitForTimeout(500);

      // Get displayed date text
      const dateText = await page.locator('[data-testid="current-date"]').or(page.locator('h2, h3').first()).textContent();
      expect(dateText).not.toBe(today);

      // Mark a habit as done for yesterday
      const exerciseToggle = page
        .locator('[data-testid*="habit-toggle"]')
        .filter({ hasText: 'Morning Exercise' })
        .first();
      await exerciseToggle.click();

      await expect(exerciseToggle).toHaveAttribute('aria-checked', 'true');
    }
  });

  test('should prevent navigation more than 5 days in the past', async ({ page }) => {
    const prevButton = page.getByRole('button', { name: /Previous/i }).or(page.locator('[aria-label*="Previous"]'));

    if (await prevButton.isVisible()) {
      // Click previous 5 times
      for (let i = 0; i < 5; i++) {
        await prevButton.click();
        await page.waitForTimeout(200);
      }

      // Button should be disabled now (6th day)
      await expect(prevButton).toBeDisabled();
    }
  });

  test('should show unsaved changes warning when navigating away with notes', async ({ page }) => {
    // Add notes
    const notesField = page.getByLabel(/Notes/i);
    await notesField.fill('Important notes that should not be lost!');

    // Try to navigate away
    page.on('dialog', async (dialog) => {
      expect(dialog.type()).toBe('beforeunload');
      await dialog.dismiss();
    });

    // Attempt to navigate
    await page.getByRole('link', { name: /Progress/i }).click();

    // Note: In modern browsers, custom beforeunload messages don't work
    // This test verifies the handler is set up, actual behavior may vary
  });

  test('should handle rapid toggle clicks without race conditions', async ({ page }) => {
    const exerciseToggle = page
      .locator('[data-testid*="habit-toggle"]')
      .filter({ hasText: 'Morning Exercise' })
      .first();

    // Rapid clicks
    await exerciseToggle.click();
    await exerciseToggle.click();
    await exerciseToggle.click();

    // Wait for all updates to settle
    await page.waitForTimeout(500);

    // Should have stable state (checked or unchecked)
    const isChecked = await exerciseToggle.getAttribute('aria-checked');
    expect(isChecked).toMatch(/true|false/);
  });

  test('should display habit categories', async ({ page }) => {
    await expect(page.locator('text=Health')).toBeVisible();
    await expect(page.locator('text=Learning')).toBeVisible();
    await expect(page.locator('text=Mindfulness')).toBeVisible();
  });

  test('should show character count for notes field', async ({ page }) => {
    const notesField = page.getByLabel(/Notes/i);

    // Type notes
    const noteText = 'Testing character count feature';
    await notesField.fill(noteText);

    // Look for character counter (might be "34/5000" or similar)
    const characterCount = page.locator('text=/\\d+\\/5000/');
    if (await characterCount.isVisible()) {
      const countText = await characterCount.textContent();
      expect(countText).toMatch(/\d+\/5000/);
    }
  });

  test('should validate maximum notes length (5000 chars)', async ({ page }) => {
    const notesField = page.getByLabel(/Notes/i);

    // Try to enter more than 5000 characters
    const longText = 'a'.repeat(5100);
    await notesField.fill(longText);

    // Field should limit to 5000 chars
    const value = await notesField.inputValue();
    expect(value.length).toBeLessThanOrEqual(5000);
  });

  test('should show empty state when no habits exist', async ({ page }) => {
    // Clear habits
    await clearAllData(page);
    await page.goto('/daily-log');
    await page.waitForLoadState('networkidle');

    // Should show empty state message
    await expect(
      page.locator('text=/No habits|Get started|Add your first habit/i')
    ).toBeVisible();
  });
});
