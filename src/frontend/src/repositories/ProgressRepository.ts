/**
 * ProgressRepository Interface
 * 
 * Abstracts storage operations for the progress queue.
 * Enables dependency injection for testability and allows
 * switching between localStorage, memory, or other backends.
 * 
 * @see LocalStorageProgressRepository - Production implementation
 * @see InMemoryProgressRepository - Test implementation
 */

import type { ProgressItem } from '../services/progressQueue';

export interface DeadLetterItem {
  item: ProgressItem;
  finalError: string;
  totalAttempts: number;
  failedAt: string;
}

export interface QueueStats {
  total: number;
  pending: number;
  error: number;
  synced: number;
  deadLetters: number;
}

export interface ProgressRepository {
  /**
   * Get all items from storage
   */
  getAll(): ProgressItem[];

  /**
   * Get items filtered by status
   */
  getByStatus(status: ProgressItem['status']): ProgressItem[];

  /**
   * Get pending items (queued for sync)
   */
  getPending(): ProgressItem[];

  /**
   * Get items that need retry (error status with retryCount < max)
   */
  getRetryable(maxRetries: number): ProgressItem[];

  /**
   * Save an item (create or update)
   */
  save(item: ProgressItem): void;

  /**
   * Save multiple items (batch operation)
   */
  saveMany(items: ProgressItem[]): void;

  /**
   * Remove an item by idempotency key
   */
  remove(idempotencyKey: string): boolean;

  /**
   * Remove multiple items by idempotency keys
   */
  removeMany(idempotencyKeys: string[]): number;

  /**
   * Find item by idempotency key
   */
  findById(idempotencyKey: string): ProgressItem | undefined;

  /**
   * Check if item exists
   */
  exists(idempotencyKey: string): boolean;

  /**
   * Update item status
   */
  updateStatus(
    idempotencyKey: string,
    status: ProgressItem['status'],
    metadata?: Partial<ProgressItem>
  ): boolean;

  /**
   * Mark item as synced
   */
  markSynced(idempotencyKey: string): boolean;

  /**
   * Mark item with error and increment retry count
   */
  markError(idempotencyKey: string, errorMessage: string): boolean;

  /**
   * Clear all items
   */
  clear(): void;

  /**
   * Get queue statistics
   */
  getStats(): QueueStats;

  /**
   * Get all dead letters
   */
  getDeadLetters(profileId?: string): DeadLetterItem[];

  /**
   * Add item to dead letter queue
   */
  addDeadLetter(item: DeadLetterItem): void;

  /**
   * Remove item from dead letter queue
   */
  removeDeadLetter(idempotencyKey: string): boolean;

  /**
   * Move item from dead letter back to pending queue
   */
  retryDeadLetter(idempotencyKey: string): boolean;

  /**
   * Get dead letter count
   */
  getDeadLetterCount(): number;

  /**
   * Subscribe to changes (optional - for reactive updates)
   */
  subscribe?(callback: () => void): () => void;
}
