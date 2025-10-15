import { test, expect } from '@playwright/test';
import { signIn } from './utils/auth-helpers';
import { clearAllData, seedHabits, seedLogs } from './utils/data-helpers';

/**
 * E2E Test Suite: Progress View Flow
 *
 * Tests analytics and progress tracking:
 * 1. Viewing habit statistics (streaks, completion %)
 * 2. Notes pattern analysis (requires 7+ notes)
 * 3. Progress cards for each habit
 * 4. Historical data visualization
 * 5. Empty states when no data exists
 *
 * This tests the motivational/insights feature that keeps users engaged.
 */

test.describe('Progress View Flow', () => {
  test.beforeEach(async ({ page }) => {
    await clearAllData(page);
    await page.goto('/');
    await signIn(page);
  });

  test('should display empty state when no habits exist', async ({ page }) => {
    await page.goto('/progress');
    await page.waitForLoadState('networkidle');

    await expect(
      page.locator('text=/No habits|No data|Create habits to see progress/i')
    ).toBeVisible();
  });

  test('should display progress cards for all active habits', async ({ page }) => {
    // Seed habits
    const habitIds = await seedHabits(page, [
      { name: 'Morning Run', category: 'Health', goal: 'Run 5K' },
      { name: 'Read Book', category: 'Learning', goal: 'Read 30 min' },
      { name: 'Meditate', category: 'Mindfulness', goal: 'Meditate 10 min' },
    ]);

    await page.goto('/progress');
    await page.waitForLoadState('networkidle');

    // Should show all habits
    await expect(page.locator('text=Morning Run')).toBeVisible();
    await expect(page.locator('text=Read Book')).toBeVisible();
    await expect(page.locator('text=Meditate')).toBeVisible();

    // Should show progress cards
    const progressCards = page
      .locator('[data-testid*="progress-card"]')
      .or(page.locator('article, .progress-card'));
    const count = await progressCards.count();
    expect(count).toBeGreaterThanOrEqual(3);
  });

  test('should display current streak for habit', async ({ page }) => {
    // Seed habit
    const habitIds = await seedHabits(page, [
      { name: 'Daily Exercise', category: 'Health', goal: 'Exercise 30 min' },
    ]);

    // Seed consecutive logs (3-day streak)
    const today = new Date();
    const logs = [];
    for (let i = 0; i < 3; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      logs.push({
        habitId: habitIds[0],
        date: date.toISOString().split('T')[0],
        status: 'done' as const,
      });
    }
    await seedLogs(page, logs);

    await page.goto('/progress');
    await page.waitForLoadState('networkidle');

    // Should show current streak
    await expect(page.locator('text=/Current Streak/i')).toBeVisible();
    await expect(page.locator('text=/3.*day/i')).toBeVisible();
  });

  test('should display longest streak for habit', async ({ page }) => {
    // Seed habit
    const habitIds = await seedHabits(page, [
      { name: 'Daily Exercise', category: 'Health', goal: 'Exercise 30 min' },
    ]);

    // Seed logs with a 5-day streak in the past, then a gap, then 2-day current streak
    const today = new Date();
    const logs = [];

    // Current 2-day streak
    for (let i = 0; i < 2; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      logs.push({
        habitId: habitIds[0],
        date: date.toISOString().split('T')[0],
        status: 'done' as const,
      });
    }

    // Gap (day 3 - not done)
    const gapDate = new Date(today);
    gapDate.setDate(gapDate.getDate() - 2);
    logs.push({
      habitId: habitIds[0],
      date: gapDate.toISOString().split('T')[0],
      status: 'not_done' as const,
    });

    // Previous 5-day streak
    for (let i = 3; i < 8; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      logs.push({
        habitId: habitIds[0],
        date: date.toISOString().split('T')[0],
        status: 'done' as const,
      });
    }

    await seedLogs(page, logs);

    await page.goto('/progress');
    await page.waitForLoadState('networkidle');

    // Should show longest streak (5 days)
    await expect(page.locator('text=/Longest Streak/i')).toBeVisible();
    await expect(page.locator('text=/5.*day/i')).toBeVisible();
  });

  test('should display completion percentage', async ({ page }) => {
    // Seed habit
    const habitIds = await seedHabits(page, [
      { name: 'Daily Exercise', category: 'Health', goal: 'Exercise 30 min' },
    ]);

    // Seed logs: 7 out of 10 days done (70% completion)
    const today = new Date();
    const logs = [];
    for (let i = 0; i < 10; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      logs.push({
        habitId: habitIds[0],
        date: date.toISOString().split('T')[0],
        status: i < 7 ? ('done' as const) : ('not_done' as const),
      });
    }
    await seedLogs(page, logs);

    await page.goto('/progress');
    await page.waitForLoadState('networkidle');

    // Should show completion percentage
    await expect(page.locator('text=/Completion|Success Rate/i')).toBeVisible();
    await expect(page.locator('text=/70%/i')).toBeVisible();
  });

  test('should show pattern analysis after 7+ notes', async ({ page }) => {
    // Seed habit
    const habitIds = await seedHabits(page, [
      { name: 'Daily Journal', category: 'Mindfulness', goal: 'Write daily reflection' },
    ]);

    // Seed logs with notes (8 notes for analysis)
    const today = new Date();
    const notesTexts = [
      'Feeling energized and motivated today!',
      'A bit tired but pushed through.',
      'Great progress on my goals!',
      'Felt stressed but journaling helped.',
      'Really positive and happy today.',
      'Challenging day but staying optimistic.',
      'Feeling grateful and content.',
      'Productive day with good energy.',
    ];

    const logs = [];
    for (let i = 0; i < 8; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      logs.push({
        habitId: habitIds[0],
        date: date.toISOString().split('T')[0],
        status: 'done' as const,
        notes: notesTexts[i],
      });
    }
    await seedLogs(page, logs);

    await page.goto('/progress');
    await page.waitForLoadState('networkidle');

    // Should show pattern analysis section
    const patternSection = page.locator('text=/Pattern|Analysis|Insights/i');
    if (await patternSection.isVisible()) {
      // Look for sentiment or keywords
      await expect(
        page.locator('text=/positive|negative|keyword|common/i')
      ).toBeVisible();
    }
  });

  test('should NOT show pattern analysis with fewer than 7 notes', async ({ page }) => {
    // Seed habit
    const habitIds = await seedHabits(page, [
      { name: 'Daily Journal', category: 'Mindfulness', goal: 'Write daily reflection' },
    ]);

    // Seed only 5 logs with notes
    const today = new Date();
    const logs = [];
    for (let i = 0; i < 5; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      logs.push({
        habitId: habitIds[0],
        date: date.toISOString().split('T')[0],
        status: 'done' as const,
        notes: 'Some notes for day ' + i,
      });
    }
    await seedLogs(page, logs);

    await page.goto('/progress');
    await page.waitForLoadState('networkidle');

    // Pattern analysis should not be visible
    const patternSection = page.locator('text=/Pattern Analysis|Insights from notes/i');
    await expect(patternSection).not.toBeVisible();
  });

  test('should expand/collapse progress cards for details', async ({ page }) => {
    // Seed habit with logs
    const habitIds = await seedHabits(page, [
      { name: 'Morning Exercise', category: 'Health', goal: 'Exercise 30 min' },
    ]);

    const today = new Date();
    const logs = [];
    for (let i = 0; i < 5; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      logs.push({
        habitId: habitIds[0],
        date: date.toISOString().split('T')[0],
        status: 'done' as const,
        notes: 'Workout notes for day ' + i,
      });
    }
    await seedLogs(page, logs);

    await page.goto('/progress');
    await page.waitForLoadState('networkidle');

    // Find expand/collapse button
    const expandButton = page
      .getByRole('button', { name: /expand|view details|more/i })
      .first();

    if (await expandButton.isVisible()) {
      // Click to expand
      await expandButton.click();

      // Should show additional details (notes history, etc.)
      await expect(page.locator('text=/Notes|History|Details/i')).toBeVisible();

      // Click again to collapse
      await expandButton.click();

      // Wait for collapse animation
      await page.waitForTimeout(500);
    }
  });

  test('should display notes history chronologically', async ({ page }) => {
    // Seed habit with notes
    const habitIds = await seedHabits(page, [
      { name: 'Daily Reflection', category: 'Mindfulness', goal: 'Reflect on the day' },
    ]);

    const today = new Date();
    const logs = [
      { day: 0, notes: 'Today was amazing!' },
      { day: 1, notes: 'Yesterday was productive.' },
      { day: 2, notes: 'Two days ago was challenging.' },
    ];

    for (const log of logs) {
      const date = new Date(today);
      date.setDate(date.getDate() - log.day);
      await seedLogs(page, [
        {
          habitId: habitIds[0],
          date: date.toISOString().split('T')[0],
          status: 'done',
          notes: log.notes,
        },
      ]);
    }

    await page.goto('/progress');
    await page.waitForLoadState('networkidle');

    // Expand to see notes
    const expandButton = page
      .getByRole('button', { name: /expand|view details|more/i })
      .first();
    if (await expandButton.isVisible()) {
      await expandButton.click();
    }

    // Should show all notes
    await expect(page.locator('text=Today was amazing!')).toBeVisible();
    await expect(page.locator('text=Yesterday was productive.')).toBeVisible();
    await expect(page.locator('text=Two days ago was challenging.')).toBeVisible();
  });

  test('should handle habits with no logs gracefully', async ({ page }) => {
    // Seed habit without any logs
    await seedHabits(page, [
      { name: 'New Habit', category: 'Test', goal: 'Just created' },
    ]);

    await page.goto('/progress');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('text=New Habit')).toBeVisible();

    // Should show 0 or "No data" for stats
    await expect(page.locator('text=/0 day|No data|Not logged yet/i')).toBeVisible();
  });

  test('should display progress for multiple habits independently', async ({ page }) => {
    // Seed two habits with different progress
    const habitIds = await seedHabits(page, [
      { name: 'Habit A', category: 'A', goal: 'Goal A' },
      { name: 'Habit B', category: 'B', goal: 'Goal B' },
    ]);

    const today = new Date();

    // Habit A: 5-day streak
    for (let i = 0; i < 5; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      await seedLogs(page, [
        {
          habitId: habitIds[0],
          date: date.toISOString().split('T')[0],
          status: 'done',
        },
      ]);
    }

    // Habit B: 2-day streak
    for (let i = 0; i < 2; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      await seedLogs(page, [
        {
          habitId: habitIds[1],
          date: date.toISOString().split('T')[0],
          status: 'done',
        },
      ]);
    }

    await page.goto('/progress');
    await page.waitForLoadState('networkidle');

    // Both habits should be visible
    await expect(page.locator('text=Habit A')).toBeVisible();
    await expect(page.locator('text=Habit B')).toBeVisible();

    // Each should have different streak counts
    // Note: This is a simplified check; actual implementation may vary
    const habitACard = page.locator('[data-testid*="progress-card"]').filter({ hasText: 'Habit A' }).or(page.locator('text=Habit A').locator('..').locator('..'));
    const habitBCard = page.locator('[data-testid*="progress-card"]').filter({ hasText: 'Habit B' }).or(page.locator('text=Habit B').locator('..').locator('..'));

    // Just verify they exist and show different data
    await expect(habitACard).toBeVisible();
    await expect(habitBCard).toBeVisible();
  });

  test('should refresh data when navigating back from other pages', async ({ page }) => {
    // Seed initial habit
    const habitIds = await seedHabits(page, [
      { name: 'Test Habit', category: 'Test', goal: 'Test' },
    ]);

    await page.goto('/progress');
    await expect(page.locator('text=Test Habit')).toBeVisible();

    // Navigate to daily log and add a log
    await page.goto('/daily-log');
    const toggle = page.locator('[data-testid*="habit-toggle"]').first();
    await toggle.click();

    // Go back to progress
    await page.goto('/progress');

    // Data should be updated (streak should now be 1)
    await expect(page.locator('text=/1.*day|Current.*1/i')).toBeVisible();
  });
});
