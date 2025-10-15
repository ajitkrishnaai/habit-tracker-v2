import { Page, BrowserContext } from '@playwright/test';

/**
 * E2E Test Helper: Network Management
 *
 * Provides utilities for simulating offline/online states and network conditions.
 * Essential for testing offline-first functionality and sync behavior.
 */

/**
 * Simulate offline mode
 * Disables network connectivity to test offline behavior
 */
export async function goOffline(context: BrowserContext) {
  await context.setOffline(true);
}

/**
 * Simulate online mode
 * Re-enables network connectivity
 */
export async function goOnline(context: BrowserContext) {
  await context.setOffline(false);
}

/**
 * Toggle network state
 * Convenience method to switch between online/offline
 */
export async function toggleNetwork(context: BrowserContext, online: boolean) {
  await context.setOffline(!online);
}

/**
 * Wait for network idle
 * Waits for all network requests to complete
 */
export async function waitForNetworkIdle(page: Page, timeout = 5000) {
  await page.waitForLoadState('networkidle', { timeout });
}

/**
 * Mock Google Sheets API responses
 * Intercepts Google Sheets API calls and returns mock data
 */
export async function mockGoogleSheetsAPI(page: Page) {
  // Mock Google Sheets read operations
  await page.route('**/v4/spreadsheets/**/values/**', (route) => {
    if (route.request().method() === 'GET') {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          range: 'Habits!A1:Z100',
          majorDimension: 'ROWS',
          values: [],
        }),
      });
    } else {
      route.continue();
    }
  });

  // Mock Google Sheets write operations
  await page.route('**/v4/spreadsheets/**/values/**:batchUpdate', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        spreadsheetId: 'mock-sheet-id',
        totalUpdatedRows: 1,
        totalUpdatedColumns: 10,
        totalUpdatedCells: 10,
      }),
    });
  });

  // Mock spreadsheet creation
  await page.route('**/v4/spreadsheets', (route) => {
    if (route.request().method() === 'POST') {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          spreadsheetId: 'mock-sheet-id',
          spreadsheetUrl: 'https://docs.google.com/spreadsheets/d/mock-sheet-id',
          sheets: [
            { properties: { title: 'Habits' } },
            { properties: { title: 'Logs' } },
            { properties: { title: 'Metadata' } },
          ],
        }),
      });
    } else {
      route.continue();
    }
  });
}

/**
 * Simulate slow network (throttling)
 * Useful for testing loading states and timeouts
 */
export async function simulateSlowNetwork(page: Page) {
  // Emulate slow 3G network
  const client = await page.context().newCDPSession(page);
  await client.send('Network.emulateNetworkConditions', {
    offline: false,
    downloadThroughput: (500 * 1024) / 8, // 500kb/s
    uploadThroughput: (500 * 1024) / 8,
    latency: 400, // 400ms latency
  });
}

/**
 * Reset network conditions to normal
 */
export async function resetNetworkConditions(page: Page) {
  const client = await page.context().newCDPSession(page);
  await client.send('Network.emulateNetworkConditions', {
    offline: false,
    downloadThroughput: -1, // No throttling
    uploadThroughput: -1,
    latency: 0,
  });
}

/**
 * Wait for sync to complete
 * Polls for sync indicator to show success state
 */
export async function waitForSync(page: Page, timeout = 10000) {
  await page.waitForSelector('[data-testid="sync-indicator"][data-status="success"]', {
    timeout,
    state: 'visible',
  });
}
