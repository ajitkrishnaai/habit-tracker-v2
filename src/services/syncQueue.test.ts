/**
 * Sync Queue Service Tests
 *
 * Tests for offline change queue management
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { SyncQueueService } from './syncQueue';

describe('SyncQueueService', () => {
  let syncQueueService: SyncQueueService;

  beforeEach(() => {
    syncQueueService = new SyncQueueService();
    localStorage.clear();
  });

  afterEach(async () => {
    await syncQueueService.clearQueue();
  });

  describe('addToQueue', () => {
    it('should add an operation to the queue', async () => {
      await syncQueueService.addToQueue('CREATE', 'habit', 'habit_1', {
        name: 'Test Habit',
      });

      const queue = await syncQueueService.getQueue();
      expect(queue.length).toBe(1);
      expect(queue[0].entityType).toBe('habit');
      expect(queue[0].operationType).toBe('CREATE');
    });

    it('should add multiple operations', async () => {
      await syncQueueService.addToQueue('CREATE', 'habit', 'habit_1', {
        name: 'Habit 1',
      });
      await syncQueueService.addToQueue('UPDATE', 'log', 'log_1', { status: 'done' });

      const queue = await syncQueueService.getQueue();
      expect(queue.length).toBe(2);
    });

    it('should set timestamp on operation', async () => {
      const beforeTime = new Date().toISOString();
      await syncQueueService.addToQueue('CREATE', 'habit', 'habit_1', {
        name: 'Test',
      });
      const afterTime = new Date().toISOString();

      const queue = await syncQueueService.getQueue();
      expect(queue[0].timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
      expect(queue[0].timestamp >= beforeTime).toBe(true);
      expect(queue[0].timestamp <= afterTime).toBe(true);
    });

    it('should initialize retry count to 0', async () => {
      await syncQueueService.addToQueue('CREATE', 'habit', 'habit_1', {
        name: 'Test',
      });

      const queue = await syncQueueService.getQueue();
      expect(queue[0].retryCount).toBe(0);
      expect(queue[0].lastRetry).toBeUndefined();
    });
  });

  describe('getQueue', () => {
    it('should return empty array when queue is empty', async () => {
      const queue = await syncQueueService.getQueue();
      expect(Array.isArray(queue)).toBe(true);
      expect(queue.length).toBe(0);
    });

    it('should return all queued operations', async () => {
      await syncQueueService.addToQueue('CREATE', 'habit', 'habit_1', {
        name: 'Habit 1',
      });
      await syncQueueService.addToQueue('UPDATE', 'log', 'log_1', { status: 'done' });

      const queue = await syncQueueService.getQueue();
      expect(queue.length).toBe(2);
    });
  });

  describe('getQueueSize', () => {
    it('should return 0 for empty queue', async () => {
      const size = await syncQueueService.getQueueSize();
      expect(size).toBe(0);
    });

    it('should return correct queue size', async () => {
      await syncQueueService.addToQueue('CREATE', 'habit', 'habit_1', {
        name: 'Test',
      });
      await syncQueueService.addToQueue('UPDATE', 'habit', 'habit_2', {
        name: 'Test 2',
      });

      const size = await syncQueueService.getQueueSize();
      expect(size).toBe(2);
    });
  });

  describe('getOperationsForEntity', () => {
    it('should return operations for specific entity', async () => {
      await syncQueueService.addToQueue('CREATE', 'habit', 'habit_1', {
        name: 'Habit 1',
      });
      await syncQueueService.addToQueue('UPDATE', 'habit', 'habit_1', {
        name: 'Habit 1 Updated',
      });
      await syncQueueService.addToQueue('CREATE', 'habit', 'habit_2', {
        name: 'Habit 2',
      });

      const operations = await syncQueueService.getOperationsForEntity('habit_1');
      expect(operations.length).toBe(2);
      expect(operations.every((op) => op.entityId === 'habit_1')).toBe(true);
    });

    it('should return empty array for entity with no operations', async () => {
      const operations = await syncQueueService.getOperationsForEntity('habit_999');
      expect(operations.length).toBe(0);
    });
  });

  describe('removeOperation', () => {
    it('should remove operation from queue', async () => {
      await syncQueueService.addToQueue('CREATE', 'habit', 'habit_1', {
        name: 'Test',
      });

      const queue = await syncQueueService.getQueue();
      const operationId = queue[0].id;

      await syncQueueService.removeOperation(operationId);

      const updatedQueue = await syncQueueService.getQueue();
      expect(updatedQueue.length).toBe(0);
    });

    it('should only remove specified operation', async () => {
      await syncQueueService.addToQueue('CREATE', 'habit', 'habit_1', {
        name: 'Habit 1',
      });
      await syncQueueService.addToQueue('CREATE', 'habit', 'habit_2', {
        name: 'Habit 2',
      });

      const queue = await syncQueueService.getQueue();
      const firstOperationId = queue[0].id;

      await syncQueueService.removeOperation(firstOperationId);

      const updatedQueue = await syncQueueService.getQueue();
      expect(updatedQueue.length).toBe(1);
      expect(updatedQueue[0].entityId).toBe('habit_2');
    });
  });

  describe('clearQueue', () => {
    it('should clear all operations', async () => {
      await syncQueueService.addToQueue('CREATE', 'habit', 'habit_1', {
        name: 'Habit 1',
      });
      await syncQueueService.addToQueue('UPDATE', 'log', 'log_1', { status: 'done' });

      await syncQueueService.clearQueue();

      const queue = await syncQueueService.getQueue();
      expect(queue.length).toBe(0);
    });
  });

  describe('clearQueueForEntityType', () => {
    it('should clear operations for specific entity type', async () => {
      await syncQueueService.addToQueue('CREATE', 'habit', 'habit_1', {
        name: 'Habit 1',
      });
      await syncQueueService.addToQueue('CREATE', 'log', 'log_1', { status: 'done' });
      await syncQueueService.addToQueue('UPDATE', 'habit', 'habit_2', {
        name: 'Habit 2',
      });

      await syncQueueService.clearQueueForEntityType('habit');

      const queue = await syncQueueService.getQueue();
      expect(queue.length).toBe(1);
      expect(queue[0].entityType).toBe('log');
    });
  });

  describe('incrementRetryCount', () => {
    it('should increment retry count', async () => {
      await syncQueueService.addToQueue('CREATE', 'habit', 'habit_1', {
        name: 'Test',
      });

      const queue = await syncQueueService.getQueue();
      const operationId = queue[0].id;

      await syncQueueService.incrementRetryCount(operationId);

      const updatedQueue = await syncQueueService.getQueue();
      expect(updatedQueue[0].retryCount).toBe(1);
      expect(updatedQueue[0].lastRetry).toBeDefined();
    });

    it('should set lastRetry timestamp', async () => {
      await syncQueueService.addToQueue('CREATE', 'habit', 'habit_1', {
        name: 'Test',
      });

      const queue = await syncQueueService.getQueue();
      const operationId = queue[0].id;

      const beforeTime = new Date().toISOString();
      await syncQueueService.incrementRetryCount(operationId);
      const afterTime = new Date().toISOString();

      const updatedQueue = await syncQueueService.getQueue();
      expect(updatedQueue[0].lastRetry).toBeDefined();
      expect(updatedQueue[0].lastRetry! >= beforeTime).toBe(true);
      expect(updatedQueue[0].lastRetry! <= afterTime).toBe(true);
    });
  });

  describe('getRetryableOperations', () => {
    it('should return operations below max retries', async () => {
      await syncQueueService.addToQueue('CREATE', 'habit', 'habit_1', {
        name: 'Test 1',
      });
      await syncQueueService.addToQueue('CREATE', 'habit', 'habit_2', {
        name: 'Test 2',
      });

      const queue = await syncQueueService.getQueue();

      // Increment first operation to max retries
      for (let i = 0; i < 3; i++) {
        await syncQueueService.incrementRetryCount(queue[0].id);
      }

      const retryable = await syncQueueService.getRetryableOperations(3);
      expect(retryable.length).toBe(1);
      expect(retryable[0].entityId).toBe('habit_2');
    });

    it('should use custom max retries', async () => {
      await syncQueueService.addToQueue('CREATE', 'habit', 'habit_1', {
        name: 'Test',
      });

      const queue = await syncQueueService.getQueue();
      await syncQueueService.incrementRetryCount(queue[0].id);
      await syncQueueService.incrementRetryCount(queue[0].id);

      const retryable = await syncQueueService.getRetryableOperations(2);
      expect(retryable.length).toBe(0);
    });
  });

  describe('getFailedOperations', () => {
    it('should return operations that exceeded max retries', async () => {
      await syncQueueService.addToQueue('CREATE', 'habit', 'habit_1', {
        name: 'Test 1',
      });
      await syncQueueService.addToQueue('CREATE', 'habit', 'habit_2', {
        name: 'Test 2',
      });

      const queue = await syncQueueService.getQueue();

      // Increment first operation to max retries
      for (let i = 0; i < 3; i++) {
        await syncQueueService.incrementRetryCount(queue[0].id);
      }

      const failed = await syncQueueService.getFailedOperations(3);
      expect(failed.length).toBe(1);
      expect(failed[0].entityId).toBe('habit_1');
      expect(failed[0].retryCount).toBe(3);
    });
  });

  describe('optimizeQueue', () => {
    it('should keep only latest operation for each entity', async () => {
      await syncQueueService.addToQueue('CREATE', 'habit', 'habit_1', {
        name: 'First',
      });

      // Wait a bit to ensure different timestamps
      await new Promise((resolve) => setTimeout(resolve, 10));

      await syncQueueService.addToQueue('UPDATE', 'habit', 'habit_1', {
        name: 'Second',
      });

      // Wait again to ensure Third has a later timestamp
      await new Promise((resolve) => setTimeout(resolve, 10));

      await syncQueueService.addToQueue('UPDATE', 'habit', 'habit_1', {
        name: 'Third',
      });

      await syncQueueService.optimizeQueue();

      const queue = await syncQueueService.getQueue();
      expect(queue.length).toBe(1);
      expect(queue[0].data.name).toBe('Third');
    });

    it('should preserve operations for different entities', async () => {
      await syncQueueService.addToQueue('CREATE', 'habit', 'habit_1', {
        name: 'Habit 1',
      });
      await syncQueueService.addToQueue('CREATE', 'habit', 'habit_2', {
        name: 'Habit 2',
      });
      await syncQueueService.addToQueue('CREATE', 'log', 'log_1', { status: 'done' });

      await syncQueueService.optimizeQueue();

      const queue = await syncQueueService.getQueue();
      expect(queue.length).toBe(3);
    });
  });

  describe('hasPendingOperations', () => {
    it('should return false when queue is empty', async () => {
      const hasPending = await syncQueueService.hasPendingOperations();
      expect(hasPending).toBe(false);
    });

    it('should return true when queue has operations', async () => {
      await syncQueueService.addToQueue('CREATE', 'habit', 'habit_1', {
        name: 'Test',
      });

      const hasPending = await syncQueueService.hasPendingOperations();
      expect(hasPending).toBe(true);
    });
  });
});
