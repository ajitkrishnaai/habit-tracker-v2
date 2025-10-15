import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright Configuration for Habit Tracker E2E Tests
 *
 * This configuration:
 * - Runs tests against local Vite dev server (port 5173)
 * - Tests on Chrome, Firefox, and Safari (Webkit)
 * - Uses mobile viewport for mobile-first testing
 * - Captures screenshots/videos on test failure
 * - Supports parallel test execution
 */
export default defineConfig({
  // Test directory
  testDir: './e2e',

  // Maximum time one test can run
  timeout: 30 * 1000,

  // Test execution settings
  fullyParallel: true, // Run tests in parallel for speed
  forbidOnly: !!process.env.CI, // Fail CI if test.only is used
  retries: process.env.CI ? 2 : 0, // Retry on CI
  workers: process.env.CI ? 1 : undefined, // Limit workers on CI

  // Reporter to use
  reporter: [
    ['html', { outputFolder: 'e2e-report' }],
    ['list'], // Console output
  ],

  // Shared settings for all tests
  use: {
    // Base URL for all tests
    baseURL: 'http://localhost:5173',

    // Collect trace on first retry for debugging
    trace: 'on-first-retry',

    // Screenshot on failure
    screenshot: 'only-on-failure',

    // Video on failure
    video: 'retain-on-failure',

    // Action timeout
    actionTimeout: 10 * 1000,
  },

  // Configure projects for different browsers and viewports
  projects: [
    // Mobile Chrome (primary target - mobile-first app)
    {
      name: 'Mobile Chrome',
      use: {
        ...devices['Pixel 5'],
        // Override viewport to test minimum supported width (320px)
        viewport: { width: 375, height: 667 },
      },
    },

    // Desktop Chrome
    {
      name: 'Desktop Chrome',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 },
      },
    },

    // Mobile Safari (iOS testing)
    {
      name: 'Mobile Safari',
      use: {
        ...devices['iPhone 13'],
      },
    },

    // Firefox (cross-browser testing)
    {
      name: 'Firefox',
      use: {
        ...devices['Desktop Firefox'],
        viewport: { width: 1280, height: 720 },
      },
    },
  ],

  // Web server configuration
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI, // Reuse existing server in dev
    timeout: 120 * 1000, // 2 minutes to start
    stdout: 'ignore', // Don't clutter test output
    stderr: 'pipe',
  },
});
