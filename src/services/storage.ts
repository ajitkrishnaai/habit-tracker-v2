/**
 * Storage Service - IndexedDB Implementation
 *
 * Provides local storage functionality using IndexedDB for offline-first architecture.
 * All operations are asynchronous and return Promises.
 */

import type { Habit } from '../types/habit';
import type { LogEntry } from '../types/logEntry';
import type { Metadata } from '../types/metadata';

const DB_NAME = 'HabitTrackerDB';
const DB_VERSION = 1;

// Object store names
const STORES = {
  HABITS: 'habits',
  LOGS: 'logs',
  METADATA: 'metadata',
} as const;

/**
 * Storage service class for managing IndexedDB operations
 */
class StorageService {
  private db: IDBDatabase | null = null;
  private initPromise: Promise<void> | null = null;

  /**
   * Initialize IndexedDB with required object stores
   * Creates stores for habits, logs, and metadata if they don't exist
   */
  async initDB(): Promise<void> {
    // Return existing initialization promise if already in progress
    if (this.initPromise) {
      return this.initPromise;
    }

    // Return immediately if already initialized
    if (this.db) {
      return Promise.resolve();
    }

    this.initPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        reject(new Error('Failed to open IndexedDB'));
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create habits object store with habit_id as key
        if (!db.objectStoreNames.contains(STORES.HABITS)) {
          const habitStore = db.createObjectStore(STORES.HABITS, {
            keyPath: 'habit_id',
          });
          // Create index on status for querying active habits
          habitStore.createIndex('status', 'status', { unique: false });
          // Create index on created_date for sorting
          habitStore.createIndex('created_date', 'created_date', { unique: false });
        }

        // Create logs object store with log_id as key
        if (!db.objectStoreNames.contains(STORES.LOGS)) {
          const logStore = db.createObjectStore(STORES.LOGS, {
            keyPath: 'log_id',
          });
          // Create index on habit_id for querying logs by habit
          logStore.createIndex('habit_id', 'habit_id', { unique: false });
          // Create index on date for querying logs by date
          logStore.createIndex('date', 'date', { unique: false });
          // Create compound index for querying logs by habit and date
          logStore.createIndex('habit_date', ['habit_id', 'date'], { unique: false });
        }

        // Create metadata object store with a fixed key
        if (!db.objectStoreNames.contains(STORES.METADATA)) {
          db.createObjectStore(STORES.METADATA, { keyPath: 'sheet_id' });
        }
      };
    });

    return this.initPromise;
  }

  /**
   * Ensure database is initialized before any operation
   */
  private async ensureDB(): Promise<IDBDatabase> {
    await this.initDB();
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    return this.db;
  }

  /**
   * Save multiple habits to local storage
   * @param habits Array of habits to save
   */
  async saveHabits(habits: Habit[]): Promise<void> {
    const db = await this.ensureDB();
    const transaction = db.transaction([STORES.HABITS], 'readwrite');
    const store = transaction.objectStore(STORES.HABITS);

    const promises = habits.map(
      (habit) =>
        new Promise<void>((resolve, reject) => {
          const request = store.put(habit);
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        })
    );

    await Promise.all(promises);
  }

  /**
   * Retrieve all habits from local storage
   * @param activeOnly If true, only return active habits
   * @returns Array of habits
   */
  async getHabits(activeOnly: boolean = false): Promise<Habit[]> {
    const db = await this.ensureDB();
    const transaction = db.transaction([STORES.HABITS], 'readonly');
    const store = transaction.objectStore(STORES.HABITS);

    return new Promise((resolve, reject) => {
      if (activeOnly) {
        // Use status index to get only active habits
        const index = store.index('status');
        const request = index.getAll('active');

        request.onsuccess = () => {
          const habits = request.result as Habit[];
          // Sort by created_date
          habits.sort(
            (a, b) =>
              new Date(a.created_date).getTime() - new Date(b.created_date).getTime()
          );
          resolve(habits);
        };
        request.onerror = () => reject(request.error);
      } else {
        // Get all habits
        const request = store.getAll();

        request.onsuccess = () => {
          const habits = request.result as Habit[];
          // Sort by created_date
          habits.sort(
            (a, b) =>
              new Date(a.created_date).getTime() - new Date(b.created_date).getTime()
          );
          resolve(habits);
        };
        request.onerror = () => reject(request.error);
      }
    });
  }

  /**
   * Save a single habit to local storage
   * @param habit Habit to save
   */
  async saveHabit(habit: Habit): Promise<void> {
    const db = await this.ensureDB();
    const transaction = db.transaction([STORES.HABITS], 'readwrite');
    const store = transaction.objectStore(STORES.HABITS);

    return new Promise((resolve, reject) => {
      const request = store.put(habit);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get a single habit by ID
   * @param habitId The habit ID to retrieve
   * @returns The habit or null if not found
   */
  async getHabit(habitId: string): Promise<Habit | null> {
    const db = await this.ensureDB();
    const transaction = db.transaction([STORES.HABITS], 'readonly');
    const store = transaction.objectStore(STORES.HABITS);

    return new Promise((resolve, reject) => {
      const request = store.get(habitId);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Delete a habit (mark as inactive)
   * Note: We never permanently delete habits to retain historical data
   * @param habitId The habit ID to delete
   */
  async deleteHabit(habitId: string): Promise<void> {
    const habit = await this.getHabit(habitId);
    if (!habit) {
      throw new Error(`Habit with ID ${habitId} not found`);
    }

    // Mark as inactive instead of deleting
    habit.status = 'inactive';
    habit.modified_date = new Date().toISOString().split('T')[0];

    await this.saveHabit(habit);
  }

  /**
   * Save multiple log entries to local storage
   * @param logs Array of log entries to save
   */
  async saveLogs(logs: LogEntry[]): Promise<void> {
    const db = await this.ensureDB();
    const transaction = db.transaction([STORES.LOGS], 'readwrite');
    const store = transaction.objectStore(STORES.LOGS);

    const promises = logs.map(
      (log) =>
        new Promise<void>((resolve, reject) => {
          const request = store.put(log);
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        })
    );

    await Promise.all(promises);
  }

  /**
   * Retrieve log entries with optional filters
   * @param habitId Optional filter by habit ID
   * @param date Optional filter by date (ISO 8601 format: YYYY-MM-DD)
   * @returns Array of log entries
   */
  async getLogs(habitId?: string, date?: string): Promise<LogEntry[]> {
    const db = await this.ensureDB();
    const transaction = db.transaction([STORES.LOGS], 'readonly');
    const store = transaction.objectStore(STORES.LOGS);

    return new Promise((resolve, reject) => {
      if (habitId && date) {
        // Use compound index to filter by both habit_id and date
        const index = store.index('habit_date');
        const request = index.getAll([habitId, date]);

        request.onsuccess = () => resolve(request.result as LogEntry[]);
        request.onerror = () => reject(request.error);
      } else if (habitId) {
        // Use habit_id index
        const index = store.index('habit_id');
        const request = index.getAll(habitId);

        request.onsuccess = () => resolve(request.result as LogEntry[]);
        request.onerror = () => reject(request.error);
      } else if (date) {
        // Use date index
        const index = store.index('date');
        const request = index.getAll(date);

        request.onsuccess = () => resolve(request.result as LogEntry[]);
        request.onerror = () => reject(request.error);
      } else {
        // Get all logs
        const request = store.getAll();

        request.onsuccess = () => resolve(request.result as LogEntry[]);
        request.onerror = () => reject(request.error);
      }
    });
  }

  /**
   * Save a single log entry to local storage
   * @param log Log entry to save
   */
  async saveLog(log: LogEntry): Promise<void> {
    const db = await this.ensureDB();
    const transaction = db.transaction([STORES.LOGS], 'readwrite');
    const store = transaction.objectStore(STORES.LOGS);

    return new Promise((resolve, reject) => {
      const request = store.put(log);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Save metadata to local storage
   * @param metadata Metadata object to save
   */
  async saveMetadata(metadata: Metadata): Promise<void> {
    const db = await this.ensureDB();
    const transaction = db.transaction([STORES.METADATA], 'readwrite');
    const store = transaction.objectStore(STORES.METADATA);

    return new Promise((resolve, reject) => {
      const request = store.put(metadata);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Retrieve metadata from local storage
   * @returns Metadata object or null if not found
   */
  async getMetadata(): Promise<Metadata | null> {
    const db = await this.ensureDB();
    const transaction = db.transaction([STORES.METADATA], 'readonly');
    const store = transaction.objectStore(STORES.METADATA);

    return new Promise((resolve, reject) => {
      // Get all metadata entries (should only be one)
      const request = store.getAll();

      request.onsuccess = () => {
        const results = request.result as Metadata[];
        resolve(results.length > 0 ? results[0] : null);
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Clear all data from the database (useful for logout or reset)
   */
  async clearAll(): Promise<void> {
    const db = await this.ensureDB();
    const transaction = db.transaction(
      [STORES.HABITS, STORES.LOGS, STORES.METADATA],
      'readwrite'
    );

    const promises = [
      new Promise<void>((resolve, reject) => {
        const request = transaction.objectStore(STORES.HABITS).clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      }),
      new Promise<void>((resolve, reject) => {
        const request = transaction.objectStore(STORES.LOGS).clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      }),
      new Promise<void>((resolve, reject) => {
        const request = transaction.objectStore(STORES.METADATA).clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      }),
    ];

    await Promise.all(promises);
  }

  /**
   * Close the database connection
   */
  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
      this.initPromise = null;
    }
  }
}

// Export singleton instance
export const storageService = new StorageService();

// Export class for testing
export { StorageService };
