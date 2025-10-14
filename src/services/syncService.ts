/**
 * Sync Service
 *
 * Coordinates synchronization between local storage (IndexedDB) and Google Sheets.
 * Implements offline-first architecture with conflict resolution and automatic retry.
 */

import { storageService } from './storage';
import { syncQueueService } from './syncQueue';
import { googleSheetsService } from './googleSheets';
import type { Habit } from '../types/habit';
import type { LogEntry } from '../types/logEntry';

// Retry intervals in milliseconds: 30s, 60s, 120s
const RETRY_INTERVALS = [30000, 60000, 120000];

export type SyncStatus = 'idle' | 'syncing' | 'success' | 'error';

export interface SyncState {
  status: SyncStatus;
  lastSync: string | null; // ISO 8601 datetime of last successful sync
  error: string | null;
  pendingOperations: number;
}

/**
 * Sync Service for coordinating local and remote data
 */
class SyncService {
  private isOnline: boolean = navigator.onLine;
  private syncStatus: SyncStatus = 'idle';
  private lastSyncTime: string | null = null;
  private currentError: string | null = null;
  private retryTimeoutId: number | null = null;
  private listeners: Set<(state: SyncState) => void> = new Set();

  constructor() {
    this.setupNetworkListeners();
  }

  /**
   * Set up network status listeners
   */
  private setupNetworkListeners(): void {
    window.addEventListener('online', () => {
      this.isOnline = true;
      console.log('Connection restored, triggering sync...');
      this.syncOnOnline();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      console.log('Connection lost, entering offline mode...');
      this.updateStatus('idle', 'Offline - changes will be queued');
    });
  }

  /**
   * Subscribe to sync state changes
   * @param listener Callback function that receives sync state
   * @returns Unsubscribe function
   */
  subscribe(listener: (state: SyncState) => void): () => void {
    this.listeners.add(listener);
    // Immediately call with current state
    listener(this.getState());

    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Get current sync state
   */
  getState(): SyncState {
    return {
      status: this.syncStatus,
      lastSync: this.lastSyncTime,
      error: this.currentError,
      pendingOperations: 0, // Will be updated asynchronously
    };
  }

  /**
   * Notify all listeners of state change
   */
  private async notifyListeners(): Promise<void> {
    const pendingOps = await syncQueueService.getQueueSize();
    const state: SyncState = {
      status: this.syncStatus,
      lastSync: this.lastSyncTime,
      error: this.currentError,
      pendingOperations: pendingOps,
    };

    this.listeners.forEach((listener) => {
      try {
        listener(state);
      } catch (error) {
        console.error('Error in sync state listener:', error);
      }
    });
  }

  /**
   * Update sync status and notify listeners
   */
  private async updateStatus(status: SyncStatus, error: string | null = null): Promise<void> {
    this.syncStatus = status;
    this.currentError = error;
    if (status === 'success') {
      this.lastSyncTime = new Date().toISOString();
    }
    await this.notifyListeners();
  }

  /**
   * Check if the app is online
   */
  isAppOnline(): boolean {
    return this.isOnline;
  }

  /**
   * Sync changes to remote (Google Sheets)
   * Processes the sync queue and pushes changes
   */
  async syncToRemote(): Promise<void> {
    if (!this.isOnline) {
      console.log('Offline - changes queued for later sync');
      return;
    }

    const queue = await syncQueueService.getRetryableOperations();
    if (queue.length === 0) {
      console.log('No pending operations to sync');
      return;
    }

    await this.updateStatus('syncing');

    try {
      // Optimize queue before processing
      await syncQueueService.optimizeQueue();
      const optimizedQueue = await syncQueueService.getRetryableOperations();

      // Process each operation
      for (const operation of optimizedQueue) {
        try {
          await this.processOperation(operation);
          await syncQueueService.removeOperation(operation.id);
        } catch (error) {
          console.error(`Failed to process operation ${operation.id}:`, error);
          await syncQueueService.incrementRetryCount(operation.id);
        }
      }

      // Update metadata with last sync time
      const metadata = await storageService.getMetadata();
      if (metadata) {
        metadata.last_sync = new Date().toISOString();
        await storageService.saveMetadata(metadata);
        await googleSheetsService.writeMetadata(metadata);
      }

      await this.updateStatus('success');
      console.log('Sync to remote completed successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown sync error';
      await this.updateStatus('error', errorMessage);
      console.error('Sync to remote failed:', error);
      this.scheduleRetry();
      throw error;
    }
  }

  /**
   * Sync changes from remote (Google Sheets) to local storage
   */
  async syncFromRemote(): Promise<void> {
    if (!this.isOnline) {
      console.log('Offline - cannot sync from remote');
      return;
    }

    await this.updateStatus('syncing');

    try {
      // Read data from Google Sheets
      const [habits, logs, metadata] = await Promise.all([
        googleSheetsService.readHabits(),
        googleSheetsService.readLogs(),
        googleSheetsService.readMetadata(),
      ]);

      // Get local data for conflict resolution
      const localHabits = await storageService.getHabits();
      const localLogs = await storageService.getLogs();

      // Resolve conflicts using last-write-wins strategy
      const resolvedHabits = this.resolveConflicts(localHabits, habits);
      const resolvedLogs = this.resolveConflicts(localLogs, logs);

      // Save resolved data to local storage
      if (resolvedHabits.length > 0) {
        await storageService.saveHabits(resolvedHabits);
      }
      if (resolvedLogs.length > 0) {
        await storageService.saveLogs(resolvedLogs);
      }
      if (metadata) {
        await storageService.saveMetadata(metadata);
      }

      await this.updateStatus('success');
      console.log('Sync from remote completed successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown sync error';
      await this.updateStatus('error', errorMessage);
      console.error('Sync from remote failed:', error);
      this.scheduleRetry();
      throw error;
    }
  }

  /**
   * Perform full bidirectional sync
   */
  async fullSync(): Promise<void> {
    if (!this.isOnline) {
      console.log('Offline - cannot perform full sync');
      return;
    }

    await this.updateStatus('syncing');

    try {
      // First, push local changes to remote
      await this.syncToRemote();

      // Then, pull remote changes to local
      await this.syncFromRemote();

      await this.updateStatus('success');
      console.log('Full sync completed successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown sync error';
      await this.updateStatus('error', errorMessage);
      console.error('Full sync failed:', error);
      this.scheduleRetry();
      throw error;
    }
  }

  /**
   * Trigger sync when coming back online
   */
  private async syncOnOnline(): Promise<void> {
    try {
      await this.fullSync();
    } catch (error) {
      console.error('Auto-sync on reconnect failed:', error);
    }
  }

  /**
   * Process a single queued operation
   */
  private async processOperation(operation: any): Promise<void> {
    const { operationType, entityType, data } = operation;

    switch (entityType) {
      case 'habit':
        if (operationType === 'CREATE' || operationType === 'UPDATE') {
          const habits = await googleSheetsService.readHabits();
          const updatedHabits = habits.filter((h: Habit) => h.habit_id !== data.habit_id);
          updatedHabits.push(data);
          await googleSheetsService.writeHabits(updatedHabits);
        } else if (operationType === 'DELETE') {
          const habits = await googleSheetsService.readHabits();
          const updatedHabits = habits.map((h: Habit) =>
            h.habit_id === data.habit_id ? { ...h, status: 'inactive' as const } : h
          );
          await googleSheetsService.writeHabits(updatedHabits);
        }
        break;

      case 'log':
        if (operationType === 'CREATE' || operationType === 'UPDATE') {
          const logs = await googleSheetsService.readLogs();
          const updatedLogs = logs.filter((l: LogEntry) => l.log_id !== data.log_id);
          updatedLogs.push(data);
          await googleSheetsService.writeLogs(updatedLogs);
        }
        break;

      case 'metadata':
        await googleSheetsService.writeMetadata(data);
        break;

      default:
        throw new Error(`Unknown entity type: ${entityType}`);
    }
  }

  /**
   * Resolve conflicts between local and remote data using last-write-wins
   * @param localData Local data array
   * @param remoteData Remote data array
   * @returns Resolved data array
   */
  private resolveConflicts<T extends { modified_date?: string; timestamp?: string }>(
    localData: T[],
    remoteData: T[]
  ): T[] {
    // Create a map of remote data by ID
    const remoteMap = new Map<string, T>();
    remoteData.forEach((item: any) => {
      const id = item.habit_id || item.log_id;
      if (id) {
        remoteMap.set(id, item);
      }
    });

    // Create result array
    const result: T[] = [];
    const processedIds = new Set<string>();

    // Process local data
    localData.forEach((localItem: any) => {
      const id = localItem.habit_id || localItem.log_id;
      if (!id) return;

      processedIds.add(id);
      const remoteItem = remoteMap.get(id);

      if (!remoteItem) {
        // Only in local - keep it
        result.push(localItem);
      } else {
        // In both - compare timestamps for last-write-wins
        const localTimestamp = localItem.modified_date || localItem.timestamp || '';
        const remoteTimestamp = remoteItem.modified_date || remoteItem.timestamp || '';

        if (!localTimestamp || !remoteTimestamp) {
          // If we can't determine timestamps, prefer local
          result.push(localItem);
        } else {
          const localTime = new Date(localTimestamp).getTime();
          const remoteTime = new Date(remoteTimestamp).getTime();

          if (localTime >= remoteTime) {
            result.push(localItem);
          } else {
            result.push(remoteItem);
          }
        }
      }
    });

    // Add remote items that weren't in local
    remoteData.forEach((remoteItem: any) => {
      const id = remoteItem.habit_id || remoteItem.log_id;
      if (id && !processedIds.has(id)) {
        result.push(remoteItem);
      }
    });

    return result;
  }

  /**
   * Schedule automatic retry with exponential backoff
   */
  private scheduleRetry(): void {
    // Clear existing retry timeout
    if (this.retryTimeoutId !== null) {
      window.clearTimeout(this.retryTimeoutId);
    }

    // Get failed operations to determine retry count
    syncQueueService.getQueue().then((queue) => {
      if (queue.length === 0) return;

      // Use the max retry count from the queue
      const maxRetryCount = Math.max(...queue.map((op) => op.retryCount));
      const retryIndex = Math.min(maxRetryCount, RETRY_INTERVALS.length - 1);
      const retryDelay = RETRY_INTERVALS[retryIndex];

      console.log(`Scheduling retry in ${retryDelay / 1000} seconds...`);

      this.retryTimeoutId = window.setTimeout(() => {
        console.log('Retrying sync...');
        this.fullSync().catch((error) => {
          console.error('Retry failed:', error);
        });
      }, retryDelay);
    });
  }

  /**
   * Cancel any pending retry
   */
  cancelRetry(): void {
    if (this.retryTimeoutId !== null) {
      window.clearTimeout(this.retryTimeoutId);
      this.retryTimeoutId = null;
    }
  }

  /**
   * Clear all sync data (useful for logout)
   */
  async clearSyncData(): Promise<void> {
    await syncQueueService.clearQueue();
    this.cancelRetry();
    this.lastSyncTime = null;
    this.currentError = null;
    await this.updateStatus('idle');
  }
}

// Export singleton instance
export const syncService = new SyncService();

// Export class for testing
export { SyncService };
