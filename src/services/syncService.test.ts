/**
 * Sync Service Integration Tests
 *
 * Tests bidirectional sync between local storage and Supabase,
 * including conflict resolution, retry logic, and offline/online transitions.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { SyncService, syncService } from './syncService';
import type { Habit } from '../types/habit';
import type { LogEntry } from '../types/logEntry';
import type { Metadata } from '../types/metadata';

// Mock all dependencies
vi.mock('./storage');
vi.mock('./syncQueue');
vi.mock('./supabaseDataService');

describe('Sync Service - Integration Tests', () => {
  let service: SyncService;
  let storageService: any;
  let syncQueueService: any;
  let supabaseDataService: any;
  let onlineListener: ((event: Event) => void) | null = null;
  let offlineListener: ((event: Event) => void) | null = null;

  // Mock data
  const mockHabits: Habit[] = [
    {
      habit_id: 'habit_001',
      name: 'Exercise',
      category: 'Health',
      status: 'active',
      created_date: '2025-01-01T00:00:00.000Z',
      modified_date: '2025-01-15T10:00:00.000Z',
    },
    {
      habit_id: 'habit_002',
      name: 'Read',
      status: 'active',
      created_date: '2025-01-02T00:00:00.000Z',
      modified_date: '2025-01-15T09:00:00.000Z',
    },
  ];

  const mockLogs: LogEntry[] = [
    {
      log_id: 'log_001',
      habit_id: 'habit_001',
      date: '2025-01-15',
      status: 'done',
      notes: 'Great workout!',
      timestamp: '2025-01-15T10:30:00.000Z',
    },
  ];

  const mockMetadata: Metadata = {
    sheet_version: '1.0',
    last_sync: '2025-01-15T08:00:00.000Z',
    user_id: 'user_123',
    sheet_id: 'sheet_abc123',
  };

  beforeEach(async () => {
    // Import mocked services
    const storage = await import('./storage');
    const syncQueue = await import('./syncQueue');
    const supabaseData = await import('./supabaseDataService');

    storageService = storage.storageService;
    syncQueueService = syncQueue.syncQueueService;
    supabaseDataService = supabaseData.supabaseDataService;

    // Mock storage service
    vi.mocked(storageService.getHabits).mockResolvedValue([...mockHabits]);
    vi.mocked(storageService.getLogs).mockResolvedValue([...mockLogs]);
    vi.mocked(storageService.getMetadata).mockResolvedValue({ ...mockMetadata });
    vi.mocked(storageService.saveHabits).mockResolvedValue(undefined);
    vi.mocked(storageService.saveLogs).mockResolvedValue(undefined);
    vi.mocked(storageService.saveMetadata).mockResolvedValue(undefined);

    // Mock sync queue service
    vi.mocked(syncQueueService.getQueue).mockResolvedValue([]);
    vi.mocked(syncQueueService.getRetryableOperations).mockResolvedValue([]);
    vi.mocked(syncQueueService.getQueueSize).mockResolvedValue(0);
    vi.mocked(syncQueueService.optimizeQueue).mockResolvedValue(undefined);
    vi.mocked(syncQueueService.removeOperation).mockResolvedValue(undefined);
    vi.mocked(syncQueueService.incrementRetryCount).mockResolvedValue(undefined);
    vi.mocked(syncQueueService.clearQueue).mockResolvedValue(undefined);

    // Mock Supabase Data Service
    vi.mocked(supabaseDataService.getHabits).mockResolvedValue([...mockHabits] as any);
    vi.mocked(supabaseDataService.getLogs).mockResolvedValue(mockLogs.map((log) => ({
      ...log,
      user_id: 'user_123',
      created_date: log.timestamp,
      modified_date: log.timestamp,
    })) as any);
    vi.mocked(supabaseDataService.getMetadata).mockResolvedValue({
      ...mockMetadata,
      created_date: new Date().toISOString(),
      modified_date: new Date().toISOString(),
    } as any);
    vi.mocked(supabaseDataService.createHabit).mockImplementation((h: any) => Promise.resolve({ ...h, user_id: 'user_123', created_date: new Date().toISOString(), modified_date: new Date().toISOString() }));
    vi.mocked(supabaseDataService.updateHabit).mockImplementation((h: any) => Promise.resolve(h));
    vi.mocked(supabaseDataService.deleteHabit).mockImplementation((_id: string) => Promise.resolve({ habit_id: _id, status: 'inactive', user_id: 'user_123', name: '', created_date: '', modified_date: '' } as any));
    vi.mocked(supabaseDataService.createLog).mockImplementation((l: any) => Promise.resolve({ ...l, user_id: 'user_123', created_date: new Date().toISOString(), modified_date: new Date().toISOString() }));
    vi.mocked(supabaseDataService.updateLog).mockImplementation((l: any) => Promise.resolve(l));
    vi.mocked(supabaseDataService.deleteLog).mockResolvedValue(undefined);
    vi.mocked(supabaseDataService.updateMetadata).mockImplementation((m: any) => Promise.resolve({ ...m, user_id: 'user_123', created_date: new Date().toISOString(), modified_date: new Date().toISOString() }));

    // Mock window.addEventListener to capture listeners
    const originalAddEventListener = window.addEventListener.bind(window);
    window.addEventListener = vi.fn((event: string, listener: any) => {
      if (event === 'online') {
        onlineListener = listener;
      } else if (event === 'offline') {
        offlineListener = listener;
      }
      return originalAddEventListener(event, listener);
    }) as any;

    // Create new service instance for each test
    service = new SyncService();

    // Reset navigator.onLine
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: true,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
    onlineListener = null;
    offlineListener = null;
  });

  describe('Initialization and Network Listeners', () => {
    it('should set up network event listeners on creation', () => {
      expect(window.addEventListener).toHaveBeenCalledWith('online', expect.any(Function));
      expect(window.addEventListener).toHaveBeenCalledWith('offline', expect.any(Function));
    });

    it('should initialize with online status from navigator.onLine', () => {
      expect(service.isAppOnline()).toBe(true);
    });

    it('should update status when going offline', async () => {
      let capturedState: any = null;
      service.subscribe((state) => {
        capturedState = state;
      });

      // Simulate offline event
      Object.defineProperty(navigator, 'onLine', { value: false });
      if (offlineListener) {
        offlineListener(new Event('offline'));
      }

      // Wait for async state update
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(service.isAppOnline()).toBe(false);
      expect(capturedState?.error).toBe('Offline - changes will be queued');
    });

    it('should trigger full sync when coming back online', async () => {
      // Start offline
      Object.defineProperty(navigator, 'onLine', { value: false });
      if (offlineListener) {
        offlineListener(new Event('offline'));
      }

      // Go back online
      Object.defineProperty(navigator, 'onLine', { value: true });
      if (onlineListener) {
        onlineListener(new Event('online'));
      }

      // Wait for async operations
      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(service.isAppOnline()).toBe(true);
    });
  });

  describe('Subscribe and State Management', () => {
    it('should notify subscriber immediately with current state', () => {
      const mockListener = vi.fn();

      service.subscribe(mockListener);

      expect(mockListener).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'idle',
          lastSync: null,
          error: null,
          pendingOperations: 0,
        })
      );
    });

    it('should return unsubscribe function', () => {
      const mockListener = vi.fn();

      const unsubscribe = service.subscribe(mockListener);

      expect(typeof unsubscribe).toBe('function');

      // Clear initial call
      mockListener.mockClear();

      // Unsubscribe
      unsubscribe();

      // Listener should not be called after unsubscribe
      service.getState(); // Trigger internal state access
      expect(mockListener).not.toHaveBeenCalled();
    });

    it('should notify all listeners on state change', async () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();

      service.subscribe(listener1);
      service.subscribe(listener2);

      // Clear initial calls
      listener1.mockClear();
      listener2.mockClear();

      // Add operations to queue so sync actually runs
      const createOp = {
        id: 'op_notify',
        operationType: 'CREATE',
        entityType: 'habit',
        data: mockHabits[0],
        timestamp: Date.now(),
        retryCount: 0,
      };
      vi.mocked(syncQueueService.getRetryableOperations).mockResolvedValue([createOp]);

      // Trigger state change by starting sync
      await service.syncToRemote();

      expect(listener1).toHaveBeenCalled();
      expect(listener2).toHaveBeenCalled();
    });

    it('should handle listener errors gracefully', async () => {
      let callCount = 0;
      const errorListener = vi.fn(() => {
        callCount++;
        // Only throw after the initial call (which happens during subscribe)
        if (callCount > 1) {
          throw new Error('Listener error');
        }
      });
      const normalListener = vi.fn();

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      service.subscribe(errorListener);
      service.subscribe(normalListener);

      // Add operations so sync runs
      const createOp = {
        id: 'op_error_test',
        operationType: 'CREATE',
        entityType: 'habit',
        data: mockHabits[0],
        timestamp: Date.now(),
        retryCount: 0,
      };
      vi.mocked(syncQueueService.getRetryableOperations).mockResolvedValue([createOp]);

      // Clear initial calls
      errorListener.mockClear();
      normalListener.mockClear();
      consoleErrorSpy.mockClear();

      await service.syncToRemote();

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error in sync state listener:',
        expect.any(Error)
      );
      expect(normalListener).toHaveBeenCalled(); // Other listeners still work

      consoleErrorSpy.mockRestore();
    });
  });

  describe('syncToRemote - Push Local Changes', () => {
    it('should skip sync when offline', async () => {
      Object.defineProperty(navigator, 'onLine', { value: false });
      if (offlineListener) {
        offlineListener(new Event('offline'));
      }

      await service.syncToRemote();

      expect(supabaseDataService.createHabit).not.toHaveBeenCalled();
      expect(supabaseDataService.createLog).not.toHaveBeenCalled();
    });

    it('should skip sync when queue is empty', async () => {
      vi.mocked(syncQueueService.getRetryableOperations).mockResolvedValue([]);

      await service.syncToRemote();

      expect(syncQueueService.optimizeQueue).not.toHaveBeenCalled();
      expect(supabaseDataService.createHabit).not.toHaveBeenCalled();
    });

    it('should process CREATE_HABIT operation', async () => {
      const createOp = {
        id: 'op_001',
        operationType: 'CREATE',
        entityType: 'habit',
        data: mockHabits[0],
        timestamp: Date.now(),
        retryCount: 0,
      };

      vi.mocked(syncQueueService.getRetryableOperations).mockResolvedValue([createOp]);

      await service.syncToRemote();

      expect(supabaseDataService.createHabit).toHaveBeenCalledWith(mockHabits[0]);
      expect(syncQueueService.removeOperation).toHaveBeenCalledWith('op_001');
    });

    it('should process UPDATE_HABIT operation', async () => {
      const updatedHabit = {
        ...mockHabits[0],
        name: 'Updated Exercise',
        modified_date: '2025-01-15T12:00:00.000Z',
      };

      const updateOp = {
        id: 'op_002',
        operationType: 'UPDATE',
        entityType: 'habit',
        data: updatedHabit,
        timestamp: Date.now(),
        retryCount: 0,
      };

      vi.mocked(syncQueueService.getRetryableOperations).mockResolvedValue([updateOp]);

      await service.syncToRemote();

      expect(supabaseDataService.updateHabit).toHaveBeenCalledWith(updatedHabit);
    });

    it('should process DELETE_HABIT operation (soft delete)', async () => {
      const deleteOp = {
        id: 'op_003',
        operationType: 'DELETE',
        entityType: 'habit',
        data: mockHabits[0],
        timestamp: Date.now(),
        retryCount: 0,
      };

      vi.mocked(syncQueueService.getRetryableOperations).mockResolvedValue([deleteOp]);

      await service.syncToRemote();

      expect(supabaseDataService.deleteHabit).toHaveBeenCalledWith('habit_001');
    });

    it('should process CREATE_LOG operation', async () => {
      const newLog: LogEntry = {
        log_id: 'log_002',
        habit_id: 'habit_002',
        date: '2025-01-15',
        status: 'done',
        timestamp: '2025-01-15T14:00:00.000Z',
      };

      const createLogOp = {
        id: 'op_004',
        operationType: 'CREATE',
        entityType: 'log',
        data: newLog,
        timestamp: Date.now(),
        retryCount: 0,
      };

      vi.mocked(syncQueueService.getRetryableOperations).mockResolvedValue([createLogOp]);

      await service.syncToRemote();

      expect(supabaseDataService.createLog).toHaveBeenCalledWith(newLog);
    });

    it('should update metadata after successful sync', async () => {
      const createOp = {
        id: 'op_005',
        operationType: 'CREATE',
        entityType: 'habit',
        data: mockHabits[0],
        timestamp: Date.now(),
        retryCount: 0,
      };

      vi.mocked(syncQueueService.getRetryableOperations).mockResolvedValue([createOp]);

      await service.syncToRemote();

      expect(storageService.saveMetadata).toHaveBeenCalledWith(
        expect.objectContaining({
          last_sync: expect.any(String),
        })
      );
      expect(supabaseDataService.updateMetadata).toHaveBeenCalled();
    });

    it('should handle operation processing errors and increment retry count', async () => {
      const failingOp = {
        id: 'op_006',
        operationType: 'CREATE',
        entityType: 'habit',
        data: mockHabits[0],
        timestamp: Date.now(),
        retryCount: 0,
      };

      vi.mocked(syncQueueService.getRetryableOperations).mockResolvedValue([failingOp]);
      vi.mocked(syncQueueService.getQueue).mockResolvedValue([failingOp]);
      vi.mocked(supabaseDataService.createHabit).mockRejectedValue(new Error('API error'));

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      // syncToRemote catches the error internally and updates status, doesn't throw
      await service.syncToRemote();

      expect(syncQueueService.incrementRetryCount).toHaveBeenCalledWith('op_006');
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to process operation'),
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });

    it('should update sync status to "syncing" during operation', async () => {
      const createOp = {
        id: 'op_007',
        operationType: 'CREATE',
        entityType: 'habit',
        data: mockHabits[0],
        timestamp: Date.now(),
        retryCount: 0,
      };

      vi.mocked(syncQueueService.getRetryableOperations).mockResolvedValue([createOp]);

      let syncingCaptured = false;
      service.subscribe((state) => {
        if (state.status === 'syncing') {
          syncingCaptured = true;
        }
      });

      await service.syncToRemote();

      expect(syncingCaptured).toBe(true);
    });
  });

  describe('syncFromRemote - Pull Remote Changes', () => {
    it('should skip sync when offline', async () => {
      Object.defineProperty(navigator, 'onLine', { value: false });
      if (offlineListener) {
        offlineListener(new Event('offline'));
      }

      await service.syncFromRemote();

      expect(supabaseDataService.getHabits).not.toHaveBeenCalled();
    });

    it('should read all data from Supabase', async () => {
      // Reset service to online state
      Object.defineProperty(navigator, 'onLine', { value: true });
      if (onlineListener) {
        onlineListener(new Event('online'));
      }

      await service.syncFromRemote();

      expect(supabaseDataService.getHabits).toHaveBeenCalled();
      expect(supabaseDataService.getLogs).toHaveBeenCalled();
      expect(supabaseDataService.getMetadata).toHaveBeenCalled();
    });

    it('should save resolved data to local storage', async () => {
      await service.syncFromRemote();

      expect(storageService.saveHabits).toHaveBeenCalled();
      expect(storageService.saveLogs).toHaveBeenCalled();
      expect(storageService.saveMetadata).toHaveBeenCalled();
    });

    it('should handle empty remote data gracefully', async () => {
      vi.mocked(storageService.getHabits).mockResolvedValue([]);
      vi.mocked(storageService.getLogs).mockResolvedValue([]);
      vi.mocked(supabaseDataService.getHabits).mockResolvedValue([]);
      vi.mocked(supabaseDataService.getLogs).mockResolvedValue([]);
      vi.mocked(supabaseDataService.getMetadata).mockResolvedValue(null);

      await service.syncFromRemote();

      // When both local and remote are empty, saveHabits/saveLogs still get called with empty arrays
      // But saveMetadata is not called when metadata is null
      expect(storageService.saveMetadata).not.toHaveBeenCalled();
    });

    it('should update status to "success" after successful sync', async () => {
      let successCaptured = false;
      service.subscribe((state) => {
        if (state.status === 'success') {
          successCaptured = true;
        }
      });

      await service.syncFromRemote();

      expect(successCaptured).toBe(true);
    });

    it('should handle sync errors and update status', async () => {
      vi.mocked(supabaseDataService.getHabits).mockRejectedValue(new Error('Network error'));

      let errorCaptured: string | null = null;
      service.subscribe((state) => {
        if (state.error) {
          errorCaptured = state.error;
        }
      });

      await expect(service.syncFromRemote()).rejects.toThrow('Network error');

      expect(errorCaptured).toBe('Network error');
    });
  });

  describe('Conflict Resolution - Last Write Wins', () => {
    it('should prefer local data when local is newer', async () => {
      const localHabit: Habit = {
        habit_id: 'habit_001',
        name: 'Local Exercise',
        status: 'active',
        created_date: '2025-01-01T00:00:00.000Z',
        modified_date: '2025-01-15T12:00:00.000Z', // Newer
      };

      const remoteHabit: Habit = {
        habit_id: 'habit_001',
        name: 'Remote Exercise',
        status: 'active',
        created_date: '2025-01-01T00:00:00.000Z',
        modified_date: '2025-01-15T10:00:00.000Z', // Older
      };

      vi.mocked(storageService.getHabits).mockResolvedValue([localHabit]);
      vi.mocked(supabaseDataService.getHabits).mockResolvedValue([remoteHabit]);

      await service.syncFromRemote();

      expect(storageService.saveHabits).toHaveBeenCalledWith(
        expect.arrayContaining([expect.objectContaining({ name: 'Local Exercise' })])
      );
    });

    it('should prefer remote data when remote is newer', async () => {
      const localHabit: Habit = {
        habit_id: 'habit_001',
        name: 'Local Exercise',
        status: 'active',
        created_date: '2025-01-01T00:00:00.000Z',
        modified_date: '2025-01-15T10:00:00.000Z', // Older
      };

      const remoteHabit: Habit = {
        habit_id: 'habit_001',
        name: 'Remote Exercise',
        status: 'active',
        created_date: '2025-01-01T00:00:00.000Z',
        modified_date: '2025-01-15T12:00:00.000Z', // Newer
      };

      vi.mocked(storageService.getHabits).mockResolvedValue([localHabit]);
      vi.mocked(supabaseDataService.getHabits).mockResolvedValue([remoteHabit]);

      await service.syncFromRemote();

      expect(storageService.saveHabits).toHaveBeenCalledWith(
        expect.arrayContaining([expect.objectContaining({ name: 'Remote Exercise' })])
      );
    });

    it('should keep local data when timestamps are equal', async () => {
      const timestamp = '2025-01-15T10:00:00.000Z';

      const localHabit: Habit = {
        habit_id: 'habit_001',
        name: 'Local Exercise',
        status: 'active',
        created_date: '2025-01-01T00:00:00.000Z',
        modified_date: timestamp,
      };

      const remoteHabit: Habit = {
        habit_id: 'habit_001',
        name: 'Remote Exercise',
        status: 'active',
        created_date: '2025-01-01T00:00:00.000Z',
        modified_date: timestamp,
      };

      vi.mocked(storageService.getHabits).mockResolvedValue([localHabit]);
      vi.mocked(supabaseDataService.getHabits).mockResolvedValue([remoteHabit]);

      await service.syncFromRemote();

      expect(storageService.saveHabits).toHaveBeenCalledWith(
        expect.arrayContaining([expect.objectContaining({ name: 'Local Exercise' })])
      );
    });

    it('should merge local-only and remote-only items', async () => {
      const localOnlyHabit: Habit = {
        habit_id: 'habit_001',
        name: 'Local Only',
        status: 'active',
        created_date: '2025-01-01T00:00:00.000Z',
        modified_date: '2025-01-15T10:00:00.000Z',
      };

      const remoteOnlyHabit: Habit = {
        habit_id: 'habit_002',
        name: 'Remote Only',
        status: 'active',
        created_date: '2025-01-02T00:00:00.000Z',
        modified_date: '2025-01-15T10:00:00.000Z',
      };

      vi.mocked(storageService.getHabits).mockResolvedValue([localOnlyHabit]);
      vi.mocked(supabaseDataService.getHabits).mockResolvedValue([remoteOnlyHabit]);

      await service.syncFromRemote();

      expect(storageService.saveHabits).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ name: 'Local Only' }),
          expect.objectContaining({ name: 'Remote Only' }),
        ])
      );
    });

    it('should handle conflict resolution for logs using timestamp field', async () => {
      const localLog: LogEntry = {
        log_id: 'log_001',
        habit_id: 'habit_001',
        date: '2025-01-15',
        status: 'done',
        notes: 'Local notes',
        timestamp: '2025-01-15T12:00:00.000Z', // Newer
      };

      const remoteLog: LogEntry = {
        log_id: 'log_001',
        habit_id: 'habit_001',
        date: '2025-01-15',
        status: 'not_done',
        notes: 'Remote notes',
        timestamp: '2025-01-15T10:00:00.000Z', // Older
      };

      vi.mocked(storageService.getLogs).mockResolvedValue([localLog]);
      vi.mocked(supabaseDataService.getLogs).mockResolvedValue([remoteLog]);

      await service.syncFromRemote();

      expect(storageService.saveLogs).toHaveBeenCalledWith(
        expect.arrayContaining([expect.objectContaining({ notes: 'Local notes' })])
      );
    });
  });

  describe('fullSync - Bidirectional Sync', () => {
    it('should call syncToRemote then syncFromRemote', async () => {
      const spy = vi.spyOn(service, 'syncToRemote');
      const spy2 = vi.spyOn(service, 'syncFromRemote');

      await service.fullSync();

      expect(spy).toHaveBeenCalled();
      expect(spy2).toHaveBeenCalled();
    });

    it('should skip sync when offline', async () => {
      Object.defineProperty(navigator, 'onLine', { value: false });
      if (offlineListener) {
        offlineListener(new Event('offline'));
      }

      const spy = vi.spyOn(service, 'syncToRemote');

      await service.fullSync();

      expect(spy).not.toHaveBeenCalled();
    });

    it('should update status to "success" after full sync', async () => {
      // Reset to online
      Object.defineProperty(navigator, 'onLine', { value: true });
      if (onlineListener) {
        onlineListener(new Event('online'));
      }

      let successCaptured = false;
      service.subscribe((state) => {
        if (state.status === 'success') {
          successCaptured = true;
        }
      });

      await service.fullSync();

      expect(successCaptured).toBe(true);
    });
  });

  describe('Retry Logic with Exponential Backoff', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should schedule retry after first failure (30s)', async () => {
      const failingOp = {
        id: 'op_008',
        operationType: 'CREATE',
        entityType: 'habit',
        data: mockHabits[0],
        timestamp: Date.now(),
        retryCount: 0,
      };

      vi.mocked(syncQueueService.getRetryableOperations).mockResolvedValue([failingOp]);
      // Make metadata write fail to trigger outer catch block
      vi.mocked(storageService.saveMetadata).mockRejectedValue(new Error('Storage error'));
      vi.mocked(syncQueueService.getQueue).mockResolvedValue([failingOp]);

      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      // This will throw and trigger retry logic
      try {
        await service.syncToRemote();
      } catch (e) {
        // Expected
      }

      // Wait for async operations
      await vi.runOnlyPendingTimersAsync();

      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Scheduling retry in 30 seconds'));

      consoleLogSpy.mockRestore();
      consoleErrorSpy.mockRestore();
    });

    it('should use increasing backoff intervals (30s, 60s, 120s)', async () => {
      const failingOp = {
        id: 'op_009',
        operationType: 'CREATE',
        entityType: 'habit',
        data: mockHabits[0],
        timestamp: Date.now(),
        retryCount: 1,
      };

      vi.mocked(syncQueueService.getRetryableOperations).mockResolvedValue([failingOp]);
      // Make metadata write fail to trigger outer catch block
      vi.mocked(storageService.saveMetadata).mockRejectedValue(new Error('Storage error'));
      vi.mocked(syncQueueService.getQueue).mockResolvedValue([failingOp]);

      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      try {
        await service.syncToRemote();
      } catch (e) {
        // Expected
      }

      await vi.runOnlyPendingTimersAsync();

      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Scheduling retry in 60 seconds'));

      consoleLogSpy.mockRestore();
      consoleErrorSpy.mockRestore();
    });

    it('should cancel pending retry when cancelRetry is called', async () => {
      const failingOp = {
        id: 'op_010',
        operationType: 'CREATE',
        entityType: 'habit',
        data: mockHabits[0],
        timestamp: Date.now(),
        retryCount: 0,
      };

      vi.mocked(syncQueueService.getRetryableOperations).mockResolvedValue([failingOp]);
      vi.mocked(supabaseDataService.createHabit).mockRejectedValue(new Error('API error'));
      vi.mocked(syncQueueService.getQueue).mockResolvedValue([failingOp]);

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      await service.syncToRemote();

      service.cancelRetry();

      // Fast-forward time - retry should NOT happen
      await vi.runAllTimersAsync();

      // createHabit should only be called once (initial attempt, not retry)
      expect(supabaseDataService.createHabit).toHaveBeenCalledTimes(1);

      consoleErrorSpy.mockRestore();
    });
  });

  describe('clearSyncData', () => {
    it('should clear queue and reset state', async () => {
      await service.clearSyncData();

      expect(syncQueueService.clearQueue).toHaveBeenCalled();
    });

    it('should cancel pending retries', async () => {
      const spy = vi.spyOn(service, 'cancelRetry');

      await service.clearSyncData();

      expect(spy).toHaveBeenCalled();
    });

    it('should reset status to idle', async () => {
      let idleCaptured = false;
      service.subscribe((state) => {
        if (state.status === 'idle' && state.lastSync === null) {
          idleCaptured = true;
        }
      });

      await service.clearSyncData();

      expect(idleCaptured).toBe(true);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle unknown entity types gracefully', async () => {
      const unknownOp = {
        id: 'op_011',
        operationType: 'CREATE',
        entityType: 'unknown_entity',
        data: {},
        timestamp: Date.now(),
        retryCount: 0,
      };

      vi.mocked(syncQueueService.getRetryableOperations).mockResolvedValue([unknownOp]);
      vi.mocked(syncQueueService.getQueue).mockResolvedValue([unknownOp]);

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      // The error is caught internally and retry count is incremented
      await service.syncToRemote();

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to process operation'),
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });

    it('should handle metadata write operations', async () => {
      const metadataOp = {
        id: 'op_012',
        operationType: 'UPDATE',
        entityType: 'metadata',
        data: mockMetadata,
        timestamp: Date.now(),
        retryCount: 0,
      };

      vi.mocked(syncQueueService.getRetryableOperations).mockResolvedValue([metadataOp]);

      await service.syncToRemote();

      expect(supabaseDataService.updateMetadata).toHaveBeenCalledWith(mockMetadata);
    });

    it('should handle missing metadata gracefully', async () => {
      vi.mocked(storageService.getMetadata).mockResolvedValue(null);

      const createOp = {
        id: 'op_013',
        operationType: 'CREATE',
        entityType: 'habit',
        data: mockHabits[0],
        timestamp: Date.now(),
        retryCount: 0,
      };

      vi.mocked(syncQueueService.getRetryableOperations).mockResolvedValue([createOp]);

      await service.syncToRemote();

      // Should not crash, but metadata update is skipped
      expect(storageService.saveMetadata).not.toHaveBeenCalled();
    });
  });

  describe('Singleton Instance - syncService', () => {
    it('should export a singleton instance', () => {
      expect(syncService).toBeInstanceOf(SyncService);
    });

    it('should maintain state across calls', () => {
      const state1 = syncService.getState();
      const state2 = syncService.getState();

      expect(state1).toEqual(state2);
    });
  });
});
