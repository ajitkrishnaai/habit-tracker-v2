/**
 * Sync Queue Service
 *
 * Manages a queue of pending operations that need to be synced to Google Sheets.
 * When the app is offline, changes are queued here and processed when back online.
 */

export type OperationType = 'CREATE' | 'UPDATE' | 'DELETE';
export type EntityType = 'habit' | 'log' | 'metadata';

export interface QueuedOperation {
  id: string; // Unique operation ID
  timestamp: string; // ISO 8601 datetime when operation was queued
  operationType: OperationType;
  entityType: EntityType;
  entityId: string; // ID of the entity being modified
  data: any; // eslint-disable-line @typescript-eslint/no-explicit-any -- The data to sync (Habit, LogEntry, or Metadata)
  retryCount: number; // Number of times this operation has been retried
  lastRetry?: string; // ISO 8601 datetime of last retry attempt
}

const QUEUE_STORAGE_KEY = 'habitTracker_syncQueue';

/**
 * Sync Queue Service for managing offline changes
 */
class SyncQueueService {
  /**
   * Add an operation to the sync queue
   * @param operationType Type of operation (CREATE, UPDATE, DELETE)
   * @param entityType Type of entity (habit, log, metadata)
   * @param entityId ID of the entity
   * @param data The data to sync
   */
  async addToQueue(
    operationType: OperationType,
    entityType: EntityType,
    entityId: string,
    data: any // eslint-disable-line @typescript-eslint/no-explicit-any
  ): Promise<void> {
    const queue = await this.getQueue();

    const operation: QueuedOperation = {
      id: this.generateOperationId(),
      timestamp: new Date().toISOString(),
      operationType,
      entityType,
      entityId,
      data,
      retryCount: 0,
    };

    queue.push(operation);
    await this.saveQueue(queue);
  }

  /**
   * Get all pending operations from the queue
   * @returns Array of queued operations
   */
  async getQueue(): Promise<QueuedOperation[]> {
    try {
      const queueJson = localStorage.getItem(QUEUE_STORAGE_KEY);
      if (!queueJson) {
        return [];
      }
      return JSON.parse(queueJson) as QueuedOperation[];
    } catch (error) {
      console.error('Failed to parse sync queue:', error);
      return [];
    }
  }

  /**
   * Get the number of pending operations
   * @returns Count of queued operations
   */
  async getQueueSize(): Promise<number> {
    const queue = await this.getQueue();
    return queue.length;
  }

  /**
   * Get operations for a specific entity
   * @param entityId The entity ID to filter by
   * @returns Array of operations for the entity
   */
  async getOperationsForEntity(entityId: string): Promise<QueuedOperation[]> {
    const queue = await this.getQueue();
    return queue.filter((op) => op.entityId === entityId);
  }

  /**
   * Remove an operation from the queue
   * @param operationId The operation ID to remove
   */
  async removeOperation(operationId: string): Promise<void> {
    const queue = await this.getQueue();
    const filteredQueue = queue.filter((op) => op.id !== operationId);
    await this.saveQueue(filteredQueue);
  }

  /**
   * Clear all operations from the queue
   * Typically called after successful sync
   */
  async clearQueue(): Promise<void> {
    localStorage.removeItem(QUEUE_STORAGE_KEY);
  }

  /**
   * Clear operations for a specific entity type
   * @param entityType The entity type to clear
   */
  async clearQueueForEntityType(entityType: EntityType): Promise<void> {
    const queue = await this.getQueue();
    const filteredQueue = queue.filter((op) => op.entityType !== entityType);
    await this.saveQueue(filteredQueue);
  }

  /**
   * Update retry count for an operation
   * @param operationId The operation ID
   */
  async incrementRetryCount(operationId: string): Promise<void> {
    const queue = await this.getQueue();
    const operation = queue.find((op) => op.id === operationId);

    if (operation) {
      operation.retryCount++;
      operation.lastRetry = new Date().toISOString();
      await this.saveQueue(queue);
    }
  }

  /**
   * Get operations that need retry
   * @param maxRetries Maximum number of retries before giving up
   * @returns Array of operations that can be retried
   */
  async getRetryableOperations(maxRetries: number = 3): Promise<QueuedOperation[]> {
    const queue = await this.getQueue();
    return queue.filter((op) => op.retryCount < maxRetries);
  }

  /**
   * Get failed operations (exceeded max retries)
   * @param maxRetries Maximum number of retries
   * @returns Array of failed operations
   */
  async getFailedOperations(maxRetries: number = 3): Promise<QueuedOperation[]> {
    const queue = await this.getQueue();
    return queue.filter((op) => op.retryCount >= maxRetries);
  }

  /**
   * Optimize queue by removing duplicate operations for the same entity
   * Keeps only the most recent operation for each entity
   */
  async optimizeQueue(): Promise<void> {
    const queue = await this.getQueue();
    const entityMap = new Map<string, QueuedOperation>();

    // Process queue in order, keeping only the latest operation for each entity
    queue.forEach((op) => {
      const existing = entityMap.get(op.entityId);

      // Keep the operation with the latest timestamp
      if (!existing || new Date(op.timestamp) > new Date(existing.timestamp)) {
        entityMap.set(op.entityId, op);
      }
    });

    // Save optimized queue
    const optimizedQueue = Array.from(entityMap.values());
    await this.saveQueue(optimizedQueue);
  }

  /**
   * Check if there are pending operations
   * @returns True if queue has operations
   */
  async hasPendingOperations(): Promise<boolean> {
    const queue = await this.getQueue();
    return queue.length > 0;
  }

  /**
   * Save the queue to localStorage
   * @param queue The queue to save
   */
  private async saveQueue(queue: QueuedOperation[]): Promise<void> {
    try {
      localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queue));
    } catch (error) {
      console.error('Failed to save sync queue:', error);
      throw new Error('Failed to save sync queue');
    }
  }

  /**
   * Generate a unique operation ID
   * @returns A unique ID string
   */
  private generateOperationId(): string {
    return `op_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }
}

// Export singleton instance
export const syncQueueService = new SyncQueueService();

// Export class for testing
export { SyncQueueService };
