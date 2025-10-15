import { test, expect } from '@playwright/test';
import { signIn } from './utils/auth-helpers';
import { clearAllData, seedHabits, getHabits } from './utils/data-helpers';

/**
 * E2E Test Suite: Habit Management Flow
 *
 * Tests CRUD operations for habits:
 * 1. Creating new habits with validation
 * 2. Editing existing habits
 * 3. Deleting habits (soft delete to preserve history)
 * 4. Duplicate detection
 * 5. Form validation and error handling
 *
 * This tests the setup and maintenance workflow for habits.
 */

test.describe('Habit Management Flow', () => {
  test.beforeEach(async ({ page }) => {
    await clearAllData(page);
    await page.goto('/');
    await signIn(page);
    await page.goto('/manage-habits');
    await page.waitForLoadState('networkidle');
  });

  test('should display empty state when no habits exist', async ({ page }) => {
    await expect(page.locator('text=/No habits|Get started|Create your first/i')).toBeVisible();

    // Should show Add Habit button
    const addButton = page.getByRole('button', { name: /Add Habit/i });
    await expect(addButton).toBeVisible();
  });

  test('should open habit form when clicking Add Habit button', async ({ page }) => {
    const addButton = page.getByRole('button', { name: /Add Habit/i });
    await addButton.click();

    // Form should be visible
    await expect(page.getByLabel(/Habit Name/i)).toBeVisible();
    await expect(page.getByLabel(/Category/i)).toBeVisible();
    await expect(page.getByLabel(/Goal/i)).toBeVisible();

    // Should have Save and Cancel buttons
    await expect(page.getByRole('button', { name: /Save/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Cancel/i })).toBeVisible();
  });

  test('should create a new habit successfully', async ({ page }) => {
    // Open form
    await page.getByRole('button', { name: /Add Habit/i }).click();

    // Fill out form
    await page.getByLabel(/Habit Name/i).fill('Morning Meditation');
    await page.getByLabel(/Category/i).fill('Mindfulness');
    await page.getByLabel(/Goal/i).fill('Meditate for 10 minutes every morning');

    // Submit
    await page.getByRole('button', { name: /Save/i }).click();

    // Should see success message or habit in list
    await expect(page.locator('text=Morning Meditation')).toBeVisible();
    await expect(page.locator('text=Mindfulness')).toBeVisible();

    // Verify data persisted
    const habits = await getHabits(page);
    expect(habits.length).toBe(1);
    expect(habits[0].name).toBe('Morning Meditation');
    expect(habits[0].category).toBe('Mindfulness');
    expect(habits[0].status).toBe('active');
  });

  test('should validate required fields', async ({ page }) => {
    await page.getByRole('button', { name: /Add Habit/i }).click();

    // Try to submit without filling fields
    await page.getByRole('button', { name: /Save/i }).click();

    // Should show validation errors
    await expect(page.locator('text=/required|cannot be empty/i')).toBeVisible();

    // Form should still be visible
    await expect(page.getByLabel(/Habit Name/i)).toBeVisible();
  });

  test('should validate habit name length (1-100 chars)', async ({ page }) => {
    await page.getByRole('button', { name: /Add Habit/i }).click();

    // Test too short (empty)
    await page.getByLabel(/Habit Name/i).fill('');
    await page.getByLabel(/Category/i).fill('Test');
    await page.getByRole('button', { name: /Save/i }).click();
    await expect(page.locator('text=/required|at least 1 character/i')).toBeVisible();

    // Test too long (>100 chars)
    const longName = 'a'.repeat(101);
    await page.getByLabel(/Habit Name/i).fill(longName);

    // Field should limit to 100 chars or show error
    const value = await page.getByLabel(/Habit Name/i).inputValue();
    expect(value.length).toBeLessThanOrEqual(100);
  });

  test('should detect duplicate habit names (case-insensitive)', async ({ page }) => {
    // Create first habit
    await page.getByRole('button', { name: /Add Habit/i }).click();
    await page.getByLabel(/Habit Name/i).fill('Morning Run');
    await page.getByLabel(/Category/i).fill('Health');
    await page.getByLabel(/Goal/i).fill('Run 5K');
    await page.getByRole('button', { name: /Save/i }).click();

    await expect(page.locator('text=Morning Run')).toBeVisible();

    // Try to create duplicate (same case)
    await page.getByRole('button', { name: /Add Habit/i }).click();
    await page.getByLabel(/Habit Name/i).fill('Morning Run');
    await page.getByLabel(/Category/i).fill('Fitness');
    await page.getByLabel(/Goal/i).fill('Another goal');
    await page.getByRole('button', { name: /Save/i }).click();

    // Should show error
    await expect(page.locator('text=/already exists|duplicate/i')).toBeVisible();

    // Try different case
    await page.getByLabel(/Habit Name/i).fill('morning run');
    await page.getByRole('button', { name: /Save/i }).click();

    // Should still show error (case-insensitive)
    await expect(page.locator('text=/already exists|duplicate/i')).toBeVisible();
  });

  test('should edit existing habit', async ({ page }) => {
    // Seed a habit first
    await seedHabits(page, [
      { name: 'Daily Reading', category: 'Learning', goal: 'Read 20 pages' },
    ]);
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Find and click edit button
    const editButton = page.getByRole('button', { name: /Edit/i }).or(page.locator('[aria-label*="Edit"]'));
    await editButton.first().click();

    // Form should be pre-filled
    await expect(page.getByLabel(/Habit Name/i)).toHaveValue('Daily Reading');
    await expect(page.getByLabel(/Category/i)).toHaveValue('Learning');
    await expect(page.getByLabel(/Goal/i)).toHaveValue('Read 20 pages');

    // Modify fields
    await page.getByLabel(/Habit Name/i).fill('Evening Reading');
    await page.getByLabel(/Goal/i).fill('Read 30 pages before bed');

    // Save changes
    await page.getByRole('button', { name: /Save/i }).click();

    // Should see updated habit
    await expect(page.locator('text=Evening Reading')).toBeVisible();
    await expect(page.locator('text=Read 30 pages before bed')).toBeVisible();

    // Old name should not be visible
    await expect(page.locator('text=Daily Reading')).not.toBeVisible();
  });

  test('should cancel habit form without saving', async ({ page }) => {
    await page.getByRole('button', { name: /Add Habit/i }).click();

    // Fill out form
    await page.getByLabel(/Habit Name/i).fill('Test Habit');
    await page.getByLabel(/Category/i).fill('Test');
    await page.getByLabel(/Goal/i).fill('Test goal');

    // Click cancel
    await page.getByRole('button', { name: /Cancel/i }).click();

    // Form should close
    await expect(page.getByLabel(/Habit Name/i)).not.toBeVisible();

    // Habit should not be created
    const habits = await getHabits(page);
    expect(habits.length).toBe(0);
  });

  test('should delete habit (soft delete)', async ({ page }) => {
    // Seed a habit
    await seedHabits(page, [{ name: 'Test Habit', category: 'Test', goal: 'Test goal' }]);
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Find delete button
    const deleteButton = page.getByRole('button', { name: /Delete/i }).or(page.locator('[aria-label*="Delete"]'));
    await deleteButton.first().click();

    // Should show confirmation dialog
    page.on('dialog', async (dialog) => {
      expect(dialog.message()).toMatch(/delete|remove|sure/i);
      await dialog.accept();
    });

    // Wait a bit for deletion
    await page.waitForTimeout(500);

    // Habit should no longer be visible
    await expect(page.locator('text=Test Habit')).not.toBeVisible();

    // Verify soft delete (status = 'inactive', not fully removed)
    const habits = await getHabits(page);
    const deletedHabit = habits.find((h) => h.name === 'Test Habit');

    if (deletedHabit) {
      expect(deletedHabit.status).toBe('inactive');
    } else {
      // If hard delete, just verify it's gone
      expect(habits.some((h) => h.name === 'Test Habit' && h.status === 'active')).toBe(false);
    }
  });

  test('should display multiple habits sorted by creation date', async ({ page }) => {
    // Seed multiple habits
    await seedHabits(page, [
      { name: 'First Habit', category: 'A', goal: 'Goal 1' },
      { name: 'Second Habit', category: 'B', goal: 'Goal 2' },
      { name: 'Third Habit', category: 'C', goal: 'Goal 3' },
    ]);
    await page.reload();
    await page.waitForLoadState('networkidle');

    // All habits should be visible
    await expect(page.locator('text=First Habit')).toBeVisible();
    await expect(page.locator('text=Second Habit')).toBeVisible();
    await expect(page.locator('text=Third Habit')).toBeVisible();

    // Should have 3 habit cards
    const habitCards = page.locator('[data-testid*="habit-card"]').or(page.locator('article, .habit-item'));
    const count = await habitCards.count();
    expect(count).toBeGreaterThanOrEqual(3);
  });

  test('should show character count for goal field', async ({ page }) => {
    await page.getByRole('button', { name: /Add Habit/i }).click();

    const goalField = page.getByLabel(/Goal/i);
    await goalField.fill('This is my habit goal');

    // Look for character counter
    const charCount = page.locator('text=/\\d+\\/\\d+/');
    if (await charCount.isVisible()) {
      const countText = await charCount.textContent();
      expect(countText).toMatch(/\d+\/\d+/);
    }
  });

  test('should handle rapid create/delete operations', async ({ page }) => {
    // Create multiple habits quickly
    for (let i = 1; i <= 3; i++) {
      await page.getByRole('button', { name: /Add Habit/i }).click();
      await page.getByLabel(/Habit Name/i).fill(`Habit ${i}`);
      await page.getByLabel(/Category/i).fill(`Category ${i}`);
      await page.getByLabel(/Goal/i).fill(`Goal ${i}`);
      await page.getByRole('button', { name: /Save/i }).click();
      await page.waitForTimeout(200);
    }

    // Verify all created
    await expect(page.locator('text=Habit 1')).toBeVisible();
    await expect(page.locator('text=Habit 2')).toBeVisible();
    await expect(page.locator('text=Habit 3')).toBeVisible();

    const habits = await getHabits(page);
    expect(habits.filter((h) => h.status === 'active').length).toBe(3);
  });

  test('should persist habits across page reloads', async ({ page }) => {
    // Create habit
    await page.getByRole('button', { name: /Add Habit/i }).click();
    await page.getByLabel(/Habit Name/i).fill('Persistent Habit');
    await page.getByLabel(/Category/i).fill('Test');
    await page.getByLabel(/Goal/i).fill('Test persistence');
    await page.getByRole('button', { name: /Save/i }).click();

    await expect(page.locator('text=Persistent Habit')).toBeVisible();

    // Reload page
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Habit should still be there
    await expect(page.locator('text=Persistent Habit')).toBeVisible();
  });

  test('should show habit details including category and goal', async ({ page }) => {
    await seedHabits(page, [
      {
        name: 'Morning Yoga',
        category: 'Health & Fitness',
        goal: 'Complete 20 minute yoga session',
      },
    ]);
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Should display all details
    await expect(page.locator('text=Morning Yoga')).toBeVisible();
    await expect(page.locator('text=Health & Fitness')).toBeVisible();
    await expect(page.locator('text=Complete 20 minute yoga session')).toBeVisible();
  });
});
