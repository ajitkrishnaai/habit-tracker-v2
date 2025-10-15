import { Page } from '@playwright/test';

/**
 * E2E Test Helper: Data Management
 *
 * Provides utilities for seeding test data and cleaning up after tests.
 * Uses IndexedDB directly for faster test setup.
 */

/**
 * Clear all IndexedDB data for a fresh test start
 */
export async function clearAllData(page: Page) {
  await page.evaluate(async () => {
    // Clear IndexedDB
    const dbs = await window.indexedDB.databases();
    for (const db of dbs) {
      if (db.name) {
        window.indexedDB.deleteDatabase(db.name);
      }
    }

    // Clear localStorage and sessionStorage
    localStorage.clear();
    sessionStorage.clear();
  });

  // Wait a bit for IndexedDB deletion to complete
  await page.waitForTimeout(100);
}

/**
 * Seed test habits into IndexedDB
 * Returns the created habit IDs for use in tests
 */
export async function seedHabits(
  page: Page,
  habits: Array<{ name: string; category: string; goal: string }>
): Promise<string[]> {
  return await page.evaluate(async (habitsData) => {
    const dbName = 'habitTrackerDB';
    const dbVersion = 1;

    // Open database
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = window.indexedDB.open(dbName, dbVersion);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('habits')) {
          db.createObjectStore('habits', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('logs')) {
          db.createObjectStore('logs', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('metadata')) {
          db.createObjectStore('metadata', { keyPath: 'key' });
        }
      };
    });

    // Add habits
    const habitIds: string[] = [];
    const transaction = db.transaction(['habits'], 'readwrite');
    const store = transaction.objectStore('habits');

    for (let i = 0; i < habitsData.length; i++) {
      const habit = habitsData[i];
      const id = `habit_${Date.now()}_${i}`;
      habitIds.push(id);

      store.add({
        id,
        name: habit.name,
        category: habit.category,
        goal: habit.goal,
        status: 'active',
        created_date: new Date().toISOString(),
        modified_date: new Date().toISOString(),
      });
    }

    await new Promise<void>((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });

    db.close();
    return habitIds;
  }, habits);
}

/**
 * Seed test logs into IndexedDB
 */
export async function seedLogs(
  page: Page,
  logs: Array<{
    habitId: string;
    date: string;
    status: 'done' | 'not_done';
    notes?: string;
  }>
) {
  await page.evaluate(async (logsData) => {
    const dbName = 'habitTrackerDB';
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = window.indexedDB.open(dbName);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });

    const transaction = db.transaction(['logs'], 'readwrite');
    const store = transaction.objectStore('logs');

    for (let i = 0; i < logsData.length; i++) {
      const log = logsData[i];
      store.add({
        id: `log_${Date.now()}_${i}`,
        habit_id: log.habitId,
        date: log.date,
        status: log.status,
        notes: log.notes || '',
        created_date: new Date().toISOString(),
        modified_date: new Date().toISOString(),
      });
    }

    await new Promise<void>((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });

    db.close();
  }, logs);
}

/**
 * Get all habits from IndexedDB
 */
export async function getHabits(page: Page): Promise<any[]> {
  return await page.evaluate(async () => {
    const dbName = 'habitTrackerDB';
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = window.indexedDB.open(dbName);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });

    const transaction = db.transaction(['habits'], 'readonly');
    const store = transaction.objectStore('habits');
    const request = store.getAll();

    const habits = await new Promise<any[]>((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    db.close();
    return habits;
  });
}

/**
 * Get all logs from IndexedDB
 */
export async function getLogs(page: Page): Promise<any[]> {
  return await page.evaluate(async () => {
    const dbName = 'habitTrackerDB';
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = window.indexedDB.open(dbName);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });

    const transaction = db.transaction(['logs'], 'readonly');
    const store = transaction.objectStore('logs');
    const request = store.getAll();

    const logs = await new Promise<any[]>((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    db.close();
    return logs;
  });
}
