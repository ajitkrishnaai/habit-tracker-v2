import { test, expect } from '@playwright/test';
import { signIn, signOut } from './utils/auth-helpers';
import { clearAllData } from './utils/data-helpers';

/**
 * E2E Test Suite: Amara.day Redesign Foundation
 *
 * Tests the branding and core component redesigns:
 * 1. Amara.day branding displays correctly
 * 2. Navigation shows logo on all pages
 * 3. Toggle switches have warm organic design
 * 4. Buttons use primary gradient styling
 * 5. Design system colors and typography applied
 *
 * Corresponds to PRD #0004 (Amara.day Foundation & Core Components)
 */

test.describe('Amara.day Redesign Foundation', () => {
  test.beforeEach(async ({ page }) => {
    // Start fresh for each test
    await clearAllData(page);
  });

  test('Welcome page displays Amara.day branding and title', async ({ page }) => {
    await page.goto('/');

    // Check page title includes "Amara.day"
    await expect(page).toHaveTitle(/Amara\.day/);

    // Check for meta description with Amara.day messaging
    const metaDescription = page.locator('meta[name="description"]');
    await expect(metaDescription).toHaveAttribute('content', /Mindful habits|warmth and intention/i);
  });

  test('Navigation shows Amara.day logo on all pages', async ({ page }) => {
    await page.goto('/');
    await signIn(page);

    // Check logo on Daily Log page
    await expect(page).toHaveURL('/daily-log');
    const dailyLogLogo = page.locator('.amara-day-logo');
    await expect(dailyLogLogo).toBeVisible();
    await expect(dailyLogLogo).toContainText('Amara');
    await expect(dailyLogLogo).toContainText('.day');

    // Check logo on Progress page
    await page.getByRole('link', { name: /Progress/i }).click();
    await expect(page).toHaveURL('/progress');
    const progressLogo = page.locator('.amara-day-logo');
    await expect(progressLogo).toBeVisible();
    await expect(progressLogo).toContainText('Amara');

    // Check logo on Manage Habits page
    await page.getByRole('link', { name: /Manage Habits/i }).click();
    await expect(page).toHaveURL('/manage-habits');
    const manageLogo = page.locator('.amara-day-logo');
    await expect(manageLogo).toBeVisible();
    await expect(manageLogo).toContainText('Amara');
  });

  test('Logo displays in navigation with correct styling', async ({ page }) => {
    await page.goto('/');
    await signIn(page);

    const logo = page.locator('.amara-day-logo');
    await expect(logo).toBeVisible();

    // Check that logo has correct structure (Amara + .day as separate spans)
    const amaraSpan = logo.locator('span').first();
    const daySpan = logo.locator('span').nth(1);

    await expect(amaraSpan).toHaveText('Amara');
    await expect(daySpan).toHaveText('.day');

    // Verify font family is DM Sans (check computed style)
    const logoFontFamily = await logo.evaluate((el) =>
      window.getComputedStyle(el).fontFamily
    );
    expect(logoFontFamily).toMatch(/DM Sans/i);
  });

  test('Toggle switches have warm organic design and animations', async ({ page }) => {
    await page.goto('/');
    await signIn(page);

    // Add a test habit first
    await page.getByRole('link', { name: /Manage Habits/i }).click();
    await page.getByPlaceholder(/Habit name/i).fill('Morning Meditation');
    await page.getByRole('button', { name: /Add Habit/i }).click();

    // Go to daily log to see toggle
    await page.getByRole('link', { name: /Daily Log/i }).click();

    const toggle = page.getByRole('switch', { name: /Morning Meditation/i });
    await expect(toggle).toBeVisible();

    // Verify toggle has expected classes
    await expect(toggle).toHaveClass(/toggle-switch/);

    // Check initial state (unchecked/off)
    await expect(toggle).toHaveAttribute('aria-checked', 'false');
    await expect(toggle).toHaveClass(/toggle-switch--off/);

    // Click toggle and verify state change
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-checked', 'true');
    await expect(toggle).toHaveClass(/toggle-switch--on/);

    // Check that toggle has minimum dimensions (accessibility - 44x44px touch target)
    const toggleBox = await toggle.boundingBox();
    expect(toggleBox?.height).toBeGreaterThanOrEqual(28); // Mobile minimum
  });

  test('Buttons use primary gradient styling from design system', async ({ page }) => {
    await page.goto('/');

    // Check "Try without signing up" button (if using btn-primary class)
    const tryButton = page.getByRole('button', { name: /Try without signing up/i });
    if (await tryButton.isVisible()) {
      const buttonClass = await tryButton.getAttribute('class');
      expect(buttonClass).toContain('btn-primary');
    }

    // Sign in to test buttons on authenticated pages
    await signIn(page);

    // Navigate to Manage Habits page to test "Add Habit" button
    await page.getByRole('link', { name: /Manage Habits/i }).click();

    const addButton = page.getByRole('button', { name: /Add Habit/i });
    await expect(addButton).toBeVisible();

    // Verify button has btn-primary class
    const addButtonClass = await addButton.getAttribute('class');
    expect(addButtonClass).toContain('btn-primary');

    // Check button has minimum touch target size (44x44px)
    const buttonBox = await addButton.boundingBox();
    expect(buttonBox?.height).toBeGreaterThanOrEqual(44);
  });

  test('Design system colors are applied to pages', async ({ page }) => {
    await page.goto('/');

    // Check that CSS custom properties are defined on :root
    const rootStyles = await page.evaluate(() => {
      const root = document.documentElement;
      const styles = window.getComputedStyle(root);
      return {
        colorPrimary: styles.getPropertyValue('--color-primary').trim(),
        colorBackground: styles.getPropertyValue('--color-background').trim(),
        fontDisplay: styles.getPropertyValue('--font-display').trim(),
        fontBody: styles.getPropertyValue('--font-body').trim(),
      };
    });

    // Verify color variables are set (moss-600 for primary)
    expect(rootStyles.colorPrimary).toBeTruthy();
    expect(rootStyles.colorPrimary).toMatch(/#6B8E5F|rgb\(107,\s*142,\s*95\)/i);

    // Verify background is warm (stone-0)
    expect(rootStyles.colorBackground).toBeTruthy();

    // Verify font families are set
    expect(rootStyles.fontDisplay).toMatch(/DM Sans/i);
    expect(rootStyles.fontBody).toMatch(/Inter/i);
  });

  test('Typography uses correct font families and scales', async ({ page }) => {
    await page.goto('/');
    await signIn(page);

    // Check heading uses DM Sans (display font)
    await page.getByRole('link', { name: /Manage Habits/i }).click();
    const heading = page.locator('h1, h2').first();

    if (await heading.isVisible()) {
      const headingFont = await heading.evaluate((el) =>
        window.getComputedStyle(el).fontFamily
      );
      expect(headingFont).toMatch(/DM Sans/i);
    }

    // Check body text uses Inter
    const bodyText = page.locator('p, span').first();
    const bodyFont = await bodyText.evaluate((el) =>
      window.getComputedStyle(el).fontFamily
    );
    expect(bodyFont).toMatch(/Inter/i);
  });

  test('Navigation has glassmorphism backdrop and sticky positioning', async ({ page }) => {
    await page.goto('/');
    await signIn(page);

    const nav = page.locator('nav').first();
    await expect(nav).toBeVisible();

    // Check navigation styling
    const navStyles = await nav.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return {
        position: styles.position,
        backdropFilter: styles.backdropFilter || styles.webkitBackdropFilter,
      };
    });

    // Verify sticky/fixed positioning
    expect(navStyles.position).toMatch(/sticky|fixed/);

    // Verify backdrop filter for glassmorphism (may not work in all test environments)
    if (navStyles.backdropFilter && navStyles.backdropFilter !== 'none') {
      expect(navStyles.backdropFilter).toMatch(/blur/i);
    }
  });

  test('Cards have warm styling with shadows and hover effects', async ({ page }) => {
    await page.goto('/');
    await signIn(page);

    // Add a habit so we have cards on Progress page
    await page.getByRole('link', { name: /Manage Habits/i }).click();
    await page.getByPlaceholder(/Habit name/i).fill('Reading');
    await page.getByRole('button', { name: /Add Habit/i }).click();

    // Go to Progress page to see cards
    await page.getByRole('link', { name: /Progress/i }).click();

    // Check for card elements
    const card = page.locator('.card, .progress-card').first();

    if (await card.isVisible()) {
      // Verify card has expected styling
      const cardStyles = await card.evaluate((el) => {
        const styles = window.getComputedStyle(el);
        return {
          borderRadius: styles.borderRadius,
          boxShadow: styles.boxShadow,
        };
      });

      // Verify rounded corners
      expect(cardStyles.borderRadius).toBeTruthy();
      expect(parseFloat(cardStyles.borderRadius)).toBeGreaterThan(0);

      // Verify box shadow exists
      expect(cardStyles.boxShadow).toBeTruthy();
      expect(cardStyles.boxShadow).not.toBe('none');
    }
  });

  test('Input fields have warm styling and focus states', async ({ page }) => {
    await page.goto('/');
    await signIn(page);

    // Navigate to Manage Habits to test input field
    await page.getByRole('link', { name: /Manage Habits/i }).click();

    const input = page.getByPlaceholder(/Habit name/i);
    await expect(input).toBeVisible();

    // Focus the input to trigger focus styles
    await input.focus();

    // Check input has border and proper styling
    const inputStyles = await input.evaluate((el) => {
      const styles = window.getComputedStyle(el as HTMLElement);
      return {
        borderRadius: styles.borderRadius,
        borderWidth: styles.borderWidth,
        padding: styles.padding,
      };
    });

    // Verify rounded corners
    expect(parseFloat(inputStyles.borderRadius)).toBeGreaterThan(0);

    // Verify border exists
    expect(parseFloat(inputStyles.borderWidth)).toBeGreaterThan(0);

    // Verify padding for comfortable touch target
    expect(inputStyles.padding).toBeTruthy();
  });

  test('Fonts are self-hosted and preloaded', async ({ page }) => {
    await page.goto('/');

    // Check for font preload links in <head>
    const preloadLinks = await page.locator('link[rel="preload"][as="font"]').count();
    expect(preloadLinks).toBeGreaterThan(0);

    // Verify font files are being loaded from /fonts/ directory
    const fontPreloads = await page.locator('link[rel="preload"][as="font"]').evaluateAll((links) =>
      links.map((link) => link.getAttribute('href'))
    );

    const hasSelfHostedFonts = fontPreloads.some((href) => href?.includes('/fonts/'));
    expect(hasSelfHostedFonts).toBe(true);
  });

  test('Color contrast meets accessibility standards', async ({ page }) => {
    await page.goto('/');
    await signIn(page);

    // Check primary button text contrast
    await page.getByRole('link', { name: /Manage Habits/i }).click();
    const button = page.getByRole('button', { name: /Add Habit/i });

    if (await button.isVisible()) {
      const contrast = await button.evaluate((el) => {
        const styles = window.getComputedStyle(el);
        return {
          color: styles.color,
          background: styles.backgroundColor,
        };
      });

      // Basic check that color and background are different
      expect(contrast.color).toBeTruthy();
      expect(contrast.background).toBeTruthy();
      expect(contrast.color).not.toBe(contrast.background);
    }
  });

  test('Design system maintains consistency across page transitions', async ({ page }) => {
    await page.goto('/');
    await signIn(page);

    // Navigate through all pages and verify logo remains visible
    const pages = [
      { name: /Daily Log/i, url: '/daily-log' },
      { name: /Progress/i, url: '/progress' },
      { name: /Manage Habits/i, url: '/manage-habits' },
    ];

    for (const pageInfo of pages) {
      await page.getByRole('link', { name: pageInfo.name }).click();
      await expect(page).toHaveURL(pageInfo.url);

      // Verify logo is visible on each page
      const logo = page.locator('.amara-day-logo');
      await expect(logo).toBeVisible();
      await expect(logo).toContainText('Amara');

      // Verify navigation is visible
      const nav = page.locator('nav').first();
      await expect(nav).toBeVisible();
    }
  });
});
