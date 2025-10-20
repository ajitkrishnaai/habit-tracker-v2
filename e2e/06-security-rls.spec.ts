import { test, expect } from '@playwright/test';
import { signIn, cleanupTestUser, createUser } from './utils/auth-helpers';
import { clearAllData } from './utils/data-helpers';
import { validateRLS_CannotAccessOtherUserData, getCurrentUserId, type TestUser } from './utils/supabase-helpers';

/**
 * E2E Test Suite: Row-Level Security (RLS) Validation
 *
 * Tests that Supabase RLS policies correctly isolate user data:
 * 1. Users can only see their own habits, logs, and metadata
 * 2. Users cannot query or modify other users' data
 * 3. Unauthenticated users cannot access any data
 *
 * These tests are critical for data privacy and security.
 */

test.describe('Row-Level Security (RLS)', () => {
  let userA: TestUser;
  let userB: TestUser;

  test.beforeAll(async () => {
    // Create two test users for RLS testing
    userA = await createUser('User A');
    userB = await createUser('User B');
  });

  test.afterAll(async () => {
    // Clean up test users
    await cleanupTestUser(userA);
    await cleanupTestUser(userB);
  });

  test('should prevent User A from accessing User B\'s habits', async ({ page, context }) => {
    // Sign in as User A
    await clearAllData(page);
    await signIn(page, userA);

    // Navigate to manage habits and create a habit as User A
    await page.goto('/manage-habits');
    await page.getByRole('button', { name: /Add Habit/i }).click();
    await page.getByLabel(/Habit Name/i).fill('User A Habit');
    await page.getByRole('button', { name: /Save/i }).click();

    // Verify User A can see their own habit
    await expect(page.locator('text=User A Habit')).toBeVisible();

    // Get User A's ID
    const userAId = await getCurrentUserId(page);
    expect(userAId).toBe(userA.id);

    // Open a new page in a new context for User B
    const userBPage = await context.newPage();
    await clearAllData(userBPage);
    await signIn(userBPage, userB);

    // Navigate to manage habits as User B
    await userBPage.goto('/manage-habits');

    // User B should NOT see User A's habit
    await expect(userBPage.locator('text=User A Habit')).not.toBeVisible();

    // Validate RLS at the database level
    const rlsWorking = await validateRLS_CannotAccessOtherUserData(userBPage, userA.id!);
    expect(rlsWorking).toBe(true);

    await userBPage.close();
  });

  test('should prevent User B from accessing User A\'s logs', async ({ page, context }) => {
    // Sign in as User A
    await clearAllData(page);
    await signIn(page, userA);

    // Create a habit and log it as User A
    await page.goto('/manage-habits');
    await page.getByRole('button', { name: /Add Habit/i }).click();
    await page.getByLabel(/Habit Name/i).fill('Morning Jog');
    await page.getByRole('button', { name: /Save/i }).click();

    // Log the habit
    await page.goto('/daily-log');
    const toggle = page.locator('[role="switch"]').first();
    await toggle.click();

    // Add notes
    await page.getByLabel(/notes/i).fill('User A private notes');
    await page.getByRole('button', { name: /Save/i }).click();

    // Wait for sync
    await page.waitForTimeout(1000);

    // Open a new page for User B
    const userBPage = await context.newPage();
    await clearAllData(userBPage);
    await signIn(userBPage, userB);

    // User B navigates to progress page
    await userBPage.goto('/progress');

    // User B should NOT see User A's logs or notes
    await expect(userBPage.locator('text=Morning Jog')).not.toBeVisible();
    await expect(userBPage.locator('text=User A private notes')).not.toBeVisible();

    // Validate RLS at database level
    const rlsWorking = await validateRLS_CannotAccessOtherUserData(userBPage, userA.id!);
    expect(rlsWorking).toBe(true);

    await userBPage.close();
  });

  test('should ensure each user only sees their own data', async ({ page, context }) => {
    // Sign in as User A and create data
    await clearAllData(page);
    await signIn(page, userA);

    await page.goto('/manage-habits');
    await page.getByRole('button', { name: /Add Habit/i }).click();
    await page.getByLabel(/Habit Name/i).fill('User A Exclusive Habit');
    await page.getByRole('button', { name: /Save/i }).click();

    // Verify User A sees their habit
    await expect(page.locator('text=User A Exclusive Habit')).toBeVisible();

    // Sign in as User B in a new page
    const userBPage = await context.newPage();
    await clearAllData(userBPage);
    await signIn(userBPage, userB);

    await userBPage.goto('/manage-habits');
    await userBPage.getByRole('button', { name: /Add Habit/i }).click();
    await userBPage.getByLabel(/Habit Name/i).fill('User B Exclusive Habit');
    await userBPage.getByRole('button', { name: /Save/i }).click();

    // Verify User B sees their habit but NOT User A's
    await expect(userBPage.locator('text=User B Exclusive Habit')).toBeVisible();
    await expect(userBPage.locator('text=User A Exclusive Habit')).not.toBeVisible();

    // Go back to User A's page and verify they still only see their own
    await page.goto('/manage-habits');
    await expect(page.locator('text=User A Exclusive Habit')).toBeVisible();
    await expect(page.locator('text=User B Exclusive Habit')).not.toBeVisible();

    await userBPage.close();
  });

  test('should prevent unauthenticated access to protected data', async ({ page }) => {
    // Don't sign in - try to access protected routes as unauthenticated
    await clearAllData(page);

    // Try to access daily log
    await page.goto('/daily-log');

    // Should redirect to welcome page
    await expect(page).toHaveURL('/');

    // Try to access manage habits
    await page.goto('/manage-habits');

    // Should redirect to welcome page
    await expect(page).toHaveURL('/');

    // Try to access progress
    await page.goto('/progress');

    // Should redirect to welcome page
    await expect(page).toHaveURL('/');
  });

  test('should maintain data isolation after user sign-out and sign-in', async ({ page }) => {
    // Sign in as User A and create a habit
    await clearAllData(page);
    await signIn(page, userA);

    await page.goto('/manage-habits');
    await page.getByRole('button', { name: /Add Habit/i }).click();
    await page.getByLabel(/Habit Name/i).fill('Persistent Habit A');
    await page.getByRole('button', { name: /Save/i }).click();

    // Wait for sync
    await page.waitForTimeout(1000);

    // Sign out
    await page.goto('/');
    await page.evaluate(async () => {
      const { createClient } = await import('@supabase/supabase-js');
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      const supabase = createClient(supabaseUrl, supabaseAnonKey);
      await supabase.auth.signOut();
    });

    // Sign in as User B
    await clearAllData(page);
    await signIn(page, userB);

    await page.goto('/manage-habits');

    // User B should NOT see User A's habit
    await expect(page.locator('text=Persistent Habit A')).not.toBeVisible();

    // Create User B's habit
    await page.getByRole('button', { name: /Add Habit/i }).click();
    await page.getByLabel(/Habit Name/i).fill('Persistent Habit B');
    await page.getByRole('button', { name: /Save/i }).click();

    await expect(page.locator('text=Persistent Habit B')).toBeVisible();

    // Sign out User B and sign in User A again
    await page.evaluate(async () => {
      const { createClient } = await import('@supabase/supabase-js');
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      const supabase = createClient(supabaseUrl, supabaseAnonKey);
      await supabase.auth.signOut();
    });

    await clearAllData(page);
    await signIn(page, userA);

    await page.goto('/manage-habits');

    // User A should see their habit, not User B's
    await expect(page.locator('text=Persistent Habit A')).toBeVisible();
    await expect(page.locator('text=Persistent Habit B')).not.toBeVisible();
  });
});
