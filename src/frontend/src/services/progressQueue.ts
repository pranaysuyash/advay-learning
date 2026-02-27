/**
 * Progress Queue Service
 * 
 * Offline progress queue with validation, duplicate detection, retry logic,
 * and dead letter queue. Uses repository pattern for testability.
 * 
 * Usage:
 *   // Production (default localStorage)
 *   import { progressQueue } from './progressQueue';
 *   
 *   // Testing (with DI)
 *   import { createProgressQueue } from './progressQueue';
 *   import { InMemoryProgressRepository } from '../repositories';
 *   const testQueue = createProgressQueue(new InMemoryProgressRepository());
 */

import { validateProgressItem, type ValidationResult } from './progressValidation';
import {
  MAX_QUEUE_SIZE,
  MAX_RETRIES,
  RETRY_BASE_DELAY_MS,
  MAX_RETRY_DELAY_MS,
  RETRY_JITTER_MS,
} from './progressConstants';
import { ProgressRepository, progressRepository } from '../repositories';

export interface ProgressItem {
  idempotency_key: string;
  profile_id: string;
  activity_type: string;
  content_id: string;
  score: number;
  duration_seconds?: number;
  completed?: boolean;
  meta_data?: Record<string, any>;
  timestamp: string; // ISO
  status?: 'pending' | 'synced' | 'error';
  retryCount?: number;
  lastError?: string;
  lastRetryAt?: string;
  syncedAt?: string;
}

export interface DeadLetterItem {
  item: ProgressItem;
  failedAt: string;
  finalError: string;
  totalAttempts: number;
}

export interface SyncResult {
  synced: number;
  failed: number;
  deadLettered: number;
  errors: Array<{ idempotency_key: string; error: string }>;
}

export interface EnqueueResult {
  success: boolean;
  item: ProgressItem;
  error?: string;
  validation?: ValidationResult;
}

type Subscriber = () => void;

/**
 * Calculate exponential backoff delay with jitter
 * Formula: min(base * 2^attempt, max) + random(0, jitter)
 */
function calculateRetryDelay(attemptNumber: number): number {
  const exponentialDelay = Math.min(
    RETRY_BASE_DELAY_MS * Math.pow(2, attemptNumber),
    MAX_RETRY_DELAY_MS
  );
  const jitter = Math.random() * RETRY_JITTER_MS;
  return exponentialDelay + jitter;
}

/**
 * Factory function to create a progress queue with dependency injection
 * 
 * @param repo - The repository to use for storage (localStorage, memory, etc.)
 * @returns Progress queue instance
 */
export function createProgressQueue(repo: ProgressRepository) {
  // In-memory Set to track known IDs for O(1) duplicate detection
  // This is session-only; persisted items are checked against storage
  const _knownIds = new Set<string>();
  const _subscribers = new Set<Subscriber>();

  function _notify() {
    _subscribers.forEach((cb) => {
      try {
        cb();
      } catch (e) {
        console.error('[ProgressQueue] subscriber error', e);
      }
    });
  }

  /**
   * Check if an item with the given idempotency_key already exists
   */
  function isDuplicate(idempotencyKey: string): boolean {
    if (_knownIds.has(idempotencyKey)) {
      return true;
    }
    return repo.exists(idempotencyKey);
  }

  return {
    /**
     * Add a progress item to the queue
     */
    enqueue(item: ProgressItem): EnqueueResult {
      // Validation
      const validation = validateProgressItem(item);
      if (!validation.valid) {
        console.warn('[ProgressQueue] Validation failed:', validation.errors);
        return {
          success: false,
          item,
          error: `Validation failed: ${validation.errors.map(e => `${e.field}: ${e.message}`).join(', ')}`,
          validation,
        };
      }

      // Duplicate detection
      if (isDuplicate(item.idempotency_key)) {
        console.warn('[ProgressQueue] Duplicate item ignored:', item.idempotency_key);
        return {
          success: false,
          item,
          error: 'Duplicate idempotency_key',
        };
      }

      // Size limit check
      const stats = repo.getStats();
      if (stats.total >= MAX_QUEUE_SIZE) {
        console.warn('[ProgressQueue] Queue full, dropping oldest item');
        const all = repo.getAll();
        if (all.length > 0) {
          repo.remove(all[0].idempotency_key);
        }
      }

      // Add item with initial status
      const itemWithStatus: ProgressItem = {
        ...item,
        status: 'pending',
        retryCount: 0,
      };

      repo.save(itemWithStatus);
      _knownIds.add(item.idempotency_key);
      _notify();

      return { success: true, item: itemWithStatus };
    },

    /**
     * Get all pending items, optionally filtered by profile
     */
    getPending(profileId?: string): ProgressItem[] {
      const pending = repo.getByStatus('pending');
      if (!profileId) return pending;
      return pending.filter(i => i.profile_id === profileId);
    },

    /**
     * Get count of pending items
     */
    getPendingCount(profileId?: string): number {
      return this.getPending(profileId).length;
    },

    /**
     * Get all items marked as error
     */
    getErrors(profileId?: string): ProgressItem[] {
      const errors = repo.getByStatus('error');
      if (!profileId) return errors;
      return errors.filter(i => i.profile_id === profileId);
    },

    /**
     * Mark an item as synced
     */
    markSynced(idempotency_key: string): boolean {
      const result = repo.markSynced(idempotency_key);
      if (result) _notify();
      return result;
    },

    /**
     * Mark an item as error
     */
    markError(idempotency_key: string, errorMessage?: string): boolean {
      const result = repo.markError(idempotency_key, errorMessage || 'Unknown error');
      if (result) _notify();
      return result;
    },

    /**
     * Move an item to dead letter queue
     */
    moveToDeadLetter(idempotency_key: string, finalError: string): boolean {
      const item = repo.findById(idempotency_key);
      if (!item) return false;

      repo.addDeadLetter({
        item,
        failedAt: new Date().toISOString(),
        finalError,
        totalAttempts: item.retryCount || 1,
      });

      _notify();
      console.warn('[ProgressQueue] Moved to dead letter:', idempotency_key, finalError);
      return true;
    },

    /**
     * Get all dead letter items
     */
    getDeadLetters(profileId?: string): DeadLetterItem[] {
      return repo.getDeadLetters(profileId);
    },

    /**
     * Get count of dead letter items
     */
    getDeadLetterCount(profileId?: string): number {
      if (profileId) {
        return repo.getDeadLetters(profileId).length;
      }
      return repo.getDeadLetterCount();
    },

    /**
     * Retry a dead letter item
     */
    retryDeadLetter(idempotency_key: string): boolean {
      const result = repo.retryDeadLetter(idempotency_key);
      if (result) {
        _notify();
        console.log('[ProgressQueue] Retrying dead letter:', idempotency_key);
      }
      return result;
    },

    /**
     * Delete a dead letter item permanently
     */
    deleteDeadLetter(idempotency_key: string): boolean {
      const result = repo.removeDeadLetter(idempotency_key);
      if (result) _notify();
      return result;
    },

    /**
     * Subscribe to changes
     */
    subscribe(cb: Subscriber): () => void {
      _subscribers.add(cb);
      return () => {
        _subscribers.delete(cb);
      };
    },

    /**
     * Clear all items
     */
    clear() {
      repo.clear();
      _knownIds.clear();
      _notify();
    },

    /**
     * Get queue statistics
     */
    getStats() {
      return repo.getStats();
    },

    /**
     * Process a single item with retry logic
     */
    async processItemWithRetry(
      item: ProgressItem,
      apiClient: any
    ): Promise<{ success: boolean; shouldRetry: boolean; error?: string }> {
      const retryCount = item.retryCount || 0;

      try {
        await apiClient.post('/api/v1/progress/', item);
        return { success: true, shouldRetry: false };
      } catch (error: any) {
        const errorMessage = error?.response?.data?.detail || error?.message || 'Unknown error';
        const statusCode = error?.response?.status;

        // Don't retry 4xx errors
        if (statusCode >= 400 && statusCode < 500) {
          console.error('[ProgressQueue] Client error, not retrying:', item.idempotency_key, statusCode);
          return { success: false, shouldRetry: false, error: errorMessage };
        }

        // Check if max retries reached
        if (retryCount >= MAX_RETRIES) {
          console.error('[ProgressQueue] Max retries reached:', item.idempotency_key);
          return { success: false, shouldRetry: false, error: `Max retries reached: ${errorMessage}` };
        }

        // Calculate and apply backoff
        const delay = calculateRetryDelay(retryCount);
        console.log(`[ProgressQueue] Retry ${retryCount + 1}/${MAX_RETRIES} for ${item.idempotency_key} after ${Math.round(delay)}ms`);

        await new Promise(resolve => setTimeout(resolve, delay));

        return { success: false, shouldRetry: true, error: errorMessage };
      }
    },

    /**
     * Sync all pending and error items with retry logic
     */
    async syncAll(apiClient: any): Promise<SyncResult> {
      const result: SyncResult = { synced: 0, failed: 0, deadLettered: 0, errors: [] };
      const items = [...repo.getByStatus('pending'), ...repo.getByStatus('error')];

      if (items.length === 0) return result;

      // Sort by retry count (lowest first) to prioritize fresh items
      items.sort((a, b) => (a.retryCount || 0) - (b.retryCount || 0));

      for (const item of items) {
        const processResult = await this.processItemWithRetry(item, apiClient);

        if (processResult.success) {
          this.markSynced(item.idempotency_key);
          result.synced++;
        } else if (processResult.shouldRetry) {
          this.markError(item.idempotency_key, processResult.error);
          result.errors.push({ idempotency_key: item.idempotency_key, error: processResult.error || 'Unknown' });
        } else {
          // Permanent failure
          const currentRetries = item.retryCount || 0;
          if (currentRetries >= MAX_RETRIES) {
            this.moveToDeadLetter(item.idempotency_key, processResult.error || 'Max retries exceeded');
            result.deadLettered++;
          } else {
            this.markError(item.idempotency_key, processResult.error);
            result.failed++;
          }
          result.errors.push({ idempotency_key: item.idempotency_key, error: processResult.error || 'Permanent failure' });
        }
      }

      _notify();

      console.log('[ProgressQueue] Sync complete:', result);
      return result;
    },

    // Internal access for tests
    _knownIds,
    _repo: repo,
  };
}

/**
 * Default progress queue instance using localStorage
 * 
 * Use this for production code. For testing, use createProgressQueue()
 * with InMemoryProgressRepository.
 */
export const progressQueue = createProgressQueue(progressRepository);

// Type for the progress queue
export type ProgressQueue = ReturnType<typeof createProgressQueue>;
