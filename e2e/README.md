# E2E Tests with Playwright

This directory contains end-to-end (E2E) tests for the Habit Tracker application using [Playwright](https://playwright.dev/).

## Overview

E2E tests verify complete user journeys through the application, testing:
- **User flows** - Full interactions from auth to habit management
- **Cross-page navigation** - Moving between different routes
- **Offline functionality** - PWA offline-first behavior
- **Data persistence** - Local storage and sync behavior
- **Real browser behavior** - Testing in Chrome, Firefox, and Safari

## Test Structure

```
e2e/
├── utils/              # Test helper functions
│   ├── auth-helpers.ts       # Authentication mocking and sign-in/out
│   ├── data-helpers.ts       # IndexedDB data seeding and querying
│   └── network-helpers.ts    # Offline/online simulation, API mocking
│
├── 01-first-time-user.spec.ts    # Onboarding and initial setup
├── 02-daily-logging.spec.ts      # Daily habit logging workflow
├── 03-habit-management.spec.ts   # CRUD operations for habits
├── 04-progress-view.spec.ts      # Analytics and progress tracking
└── 05-offline-sync.spec.ts       # Offline functionality and sync
```

## Running Tests

### Run all E2E tests (headless)
```bash
npm run test:e2e
```

### Run with UI (interactive mode)
```bash
npm run test:e2e:ui
```

### Run in headed mode (see browser)
```bash
npm run test:e2e:headed
```

### Debug mode (step through tests)
```bash
npm run test:e2e:debug
```

### Run specific test file
```bash
npx playwright test e2e/02-daily-logging.spec.ts
```

### Run specific test by name
```bash
npx playwright test -g "should create a new habit"
```

### View test report
```bash
npm run test:e2e:report
```

## Test Configuration

Configuration is in `playwright.config.ts`:

- **Base URL**: `http://localhost:5173` (Vite dev server)
- **Browsers**: Chrome (mobile & desktop), Safari (mobile), Firefox
- **Timeouts**: 30s per test, 10s per action
- **Retries**: 0 locally, 2 on CI
- **Screenshots**: Captured on failure
- **Videos**: Recorded on failure
- **Reports**: HTML report in `e2e-report/`

## Test Utilities

### Authentication Helpers (`auth-helpers.ts`)

```typescript
import { signIn, signOut, isAuthenticated } from './utils/auth-helpers';

// Mock authentication (bypasses real Google OAuth)
await signIn(page);

// Sign out
await signOut(page);

// Check auth state
const authenticated = await isAuthenticated(page);
```

### Data Helpers (`data-helpers.ts`)

```typescript
import { clearAllData, seedHabits, seedLogs, getHabits, getLogs } from './utils/data-helpers';

// Clear all data for fresh test
await clearAllData(page);

// Seed test habits
const habitIds = await seedHabits(page, [
  { name: 'Morning Run', category: 'Health', goal: 'Run 5K' },
]);

// Seed logs
await seedLogs(page, [
  { habitId: habitIds[0], date: '2025-10-15', status: 'done', notes: 'Great run!' },
]);

// Query data
const habits = await getHabits(page);
const logs = await getLogs(page);
```

### Network Helpers (`network-helpers.ts`)

```typescript
import { goOffline, goOnline, mockGoogleSheetsAPI, waitForSync } from './utils/network-helpers';

// Simulate offline
await goOffline(context);

// Go back online
await goOnline(context);

// Mock Google Sheets API
await mockGoogleSheetsAPI(page);

// Wait for sync to complete
await waitForSync(page);
```

## Writing New Tests

### Test Template

```typescript
import { test, expect } from '@playwright/test';
import { signIn } from './utils/auth-helpers';
import { clearAllData, seedHabits } from './utils/data-helpers';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    await clearAllData(page);
    await page.goto('/');
    await signIn(page);
  });

  test('should do something', async ({ page }) => {
    // Arrange
    await seedHabits(page, [{ name: 'Test Habit', category: 'Test', goal: 'Test' }]);
    await page.goto('/daily-log');

    // Act
    const toggle = page.locator('[data-testid="habit-toggle"]').first();
    await toggle.click();

    // Assert
    await expect(toggle).toHaveAttribute('aria-checked', 'true');
  });
});
```

### Best Practices

1. **Use semantic selectors**: Prefer `getByRole`, `getByLabel`, `getByText` over CSS selectors
2. **Wait for state, not time**: Use `waitForLoadState('networkidle')` instead of `waitForTimeout`
3. **Seed data explicitly**: Don't rely on previous tests - each test should set up its own data
4. **Test user journeys, not implementation**: Focus on what users do, not how code works
5. **Use data-testid sparingly**: Only when semantic selectors aren't sufficient
6. **Keep tests focused**: Each test should verify one user action or flow
7. **Handle async properly**: Always await Playwright actions

### Common Patterns

#### Clicking elements with dynamic text
```typescript
await page.locator('text=Morning Run').click();
await page.getByRole('button', { name: /Add Habit/i }).click();
```

#### Filling forms
```typescript
await page.getByLabel(/Habit Name/i).fill('New Habit');
await page.getByLabel(/Category/i).fill('Health');
```

#### Checking visibility
```typescript
await expect(page.locator('text=Success')).toBeVisible();
await expect(page.getByRole('button', { name: /Save/i })).toBeEnabled();
```

#### Navigation
```typescript
await page.goto('/daily-log');
await page.getByRole('link', { name: /Progress/i }).click();
await expect(page).toHaveURL('/progress');
```

## Debugging Tests

### Visual debugging with UI mode
```bash
npm run test:e2e:ui
```
This opens an interactive UI where you can:
- See tests run in real-time
- Step through each action
- Inspect DOM at any point
- Time-travel through test execution

### Debug specific test
```bash
npx playwright test -g "test name" --debug
```

### Use console.log in tests
```typescript
console.log('Debug info:', await page.content());
```

### Take screenshots manually
```typescript
await page.screenshot({ path: 'debug-screenshot.png' });
```

### Slow down execution
```typescript
test.use({ slowMo: 1000 }); // 1 second delay between actions
```

## CI/CD Integration

E2E tests run automatically on:
- Push to `main`, `develop`, or any `task-*` branch
- Pull requests to `main` or `develop`

See `.github/workflows/e2e-tests.yml` for CI configuration.

### Viewing CI Test Reports

1. Go to GitHub Actions tab
2. Click on the failed/passed workflow run
3. Download "playwright-report" artifact
4. Extract and open `index.html` in a browser

## Coverage

E2E tests provide functional coverage for:
- ✅ **Pages** - All 6 page components (WelcomePage, DailyLogPage, etc.)
- ✅ **User Flows** - 5 critical user journeys
- ✅ **Integration** - Service interactions (auth, storage, sync)
- ✅ **Offline Behavior** - PWA offline-first functionality
- ✅ **Cross-Browser** - Chrome, Firefox, Safari

Note: E2E tests don't increase unit test coverage metrics, but they provide **integration coverage** that unit tests can't.

## Known Limitations

1. **Google OAuth** - Tests use mock auth, not real OAuth flow
2. **Google Sheets API** - API calls are mocked to avoid real network requests
3. **Service Workers** - PWA service workers may not be fully tested in headed mode
4. **Time-based features** - Tests can't easily simulate "days passing"
5. **Mobile gestures** - Swipes and pinch-to-zoom not thoroughly tested

## Troubleshooting

### Tests failing locally but passing in CI
- Clear browser cache: `npx playwright install --force`
- Check Node version matches CI (Node 18)
- Ensure dev server is running on port 5173

### Tests timing out
- Increase timeout in `playwright.config.ts`
- Check network conditions (slow internet can affect initial page load)
- Use `await page.waitForLoadState('networkidle')` before assertions

### Flaky tests (intermittent failures)
- Add explicit waits: `await page.waitForSelector('[data-testid="element"]')`
- Increase action timeout for slow operations
- Use retry logic: `{ retries: 2 }` in test config

### Can't find element
- Check selector is correct using Playwright Inspector
- Ensure element is visible: `await expect(element).toBeVisible()`
- Wait for element to appear: `await page.waitForSelector('selector')`

## Resources

- [Playwright Documentation](https://playwright.dev/)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [Debugging Guide](https://playwright.dev/docs/debug)
- [API Reference](https://playwright.dev/docs/api/class-test)
