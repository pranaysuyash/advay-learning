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

import {
  validateProgressItem,
  type ValidationResult,
} from './progressValidation';
import { trackLaunchEvent } from '../analytics/launch';
import {
  MAX_QUEUE_SIZE,
  MAX_RETRIES,
  RETRY_BASE_DELAY_MS,
  MAX_RETRY_DELAY_MS,
  RETRY_JITTER_MS,
  ENQUEUE_RATE_LIMIT_MS,
  MAX_ENQUEUE_PER_MINUTE,
  ENQUEUE_WINDOW_MS,
} from './progressConstants';
import { ProgressRepository, progressRepository } from '../repositories';
import { progressApi } from '../services/api';

export interface ProgressItem {
  idempotency_key: string;
  profile_id: string;
  activity_type: string;
  content_id: string;
  score: number;
  duration_seconds?: number;
  completed?: boolean;
  meta_data?: Record<string, unknown>;
  timestamp: string; // ISO
  status?: 'pending' | 'synced' | 'error';
  retryCount?: number;
  lastError?: string;
  lastRetryAt?: string;
  nextRetryAt?: string;
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

export interface LegacyProgressItem {
  profileId?: string;
  gameId?: string;
  metadata?: Record<string, unknown>;
  score?: number;
  completed?: boolean;
  duration_seconds?: number;
  timestamp?: string;
}

export interface ApiClient {
  post(url: string, data: unknown): Promise<{ status: number; data?: unknown }>;
}

type Subscriber = () => void;

const MAX_ERROR_MESSAGE_LENGTH = 200;

/** TTL for rate-limit map entries (5 minutes) */
const RATE_LIMIT_ENTRY_TTL_MS = 5 * 60 * 1000;

/** How often to prune stale rate-limit entries */
const RATE_LIMIT_PRUNE_INTERVAL_MS = 60 * 1000;

/**
 * Calculate exponential backoff delay with jitter
 * Formula: min(base * 2^attempt, max) + random(0, jitter)
 */
function calculateRetryDelay(attemptNumber: number): number {
  const exponentialDelay = Math.min(
    RETRY_BASE_DELAY_MS * Math.pow(2, attemptNumber),
    MAX_RETRY_DELAY_MS,
  );
  const jitter = Math.random() * RETRY_JITTER_MS;
  return exponentialDelay + jitter;
}

/**
 * Sanitize error message for safe storage (F9)
 */
function sanitizeError(message: string): string {
  return message.slice(0, MAX_ERROR_MESSAGE_LENGTH);
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

  // F3: Batched notification scheduling
  let _notifyScheduled = false;
  function _scheduleNotify() {
    if (_notifyScheduled) return;
    _notifyScheduled = true;
    queueMicrotask(() => {
      _notifyScheduled = false;
      _notify();
    });
  }

  // F2: Rate-limiting state with TTL tracking
  const _lastEnqueueAt = new Map<string, number>();
  let _lastPruneAt = Date.now();
  // Global: sliding window counter to enforce MAX_ENQUEUE_PER_MINUTE
  let _enqueueWindowStart = Date.now();
  let _enqueueWindowCount = 0;

  function _notify() {
    _subscribers.forEach((cb) => {
      try {
        cb();
      } catch (e) {
        console.error('[ProgressQueue] subscriber error', e);
      }
    });
  }

  /** F2: Prune stale rate-limit entries older than TTL */
  function _pruneRateLimitEntries() {
    const now = Date.now();
    if (now - _lastPruneAt < RATE_LIMIT_PRUNE_INTERVAL_MS) return;
    _lastPruneAt = now;
    for (const [key, timestamp] of _lastEnqueueAt) {
      if (now - timestamp > RATE_LIMIT_ENTRY_TTL_MS) {
        _lastEnqueueAt.delete(key);
      }
    }
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

  const queue = {
    /**
     * Backward-compatible API used by several game pages.
     * Converts legacy payloads to canonical ProgressItem shape.
     */
    add(item: ProgressItem | LegacyProgressItem): EnqueueResult {
      const candidate = item as ProgressItem;
      if (
        candidate.idempotency_key &&
        candidate.profile_id &&
        candidate.content_id
      ) {
        return queue.enqueue(candidate);
      }

      const legacy = item as LegacyProgressItem;
      const idempotencyKey =
        typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

      const normalized: ProgressItem = {
        idempotency_key: idempotencyKey,
        profile_id: legacy.profileId || '',
        activity_type: 'game_completion',
        content_id: legacy.gameId || 'unknown-game',
        score: legacy.score ?? 0,
        duration_seconds: legacy.duration_seconds,
        completed: legacy.completed ?? true,
        meta_data: legacy.metadata ?? {},
        timestamp: legacy.timestamp || new Date().toISOString(),
      };

      return queue.enqueue(normalized);
    },

    /**
     * Add a progress item to the queue
     */
    enqueue(item: ProgressItem): EnqueueResult {
      _pruneRateLimitEntries();

      // Per-profile rate-limit gate
      const now = Date.now();
      const lastAt = _lastEnqueueAt.get(item.profile_id) ?? 0;
      if (now - lastAt < ENQUEUE_RATE_LIMIT_MS) {
        console.warn(
          `[ProgressQueue] Rate-limited (per-profile): ${item.profile_id} — ` +
            `${now - lastAt}ms since last enqueue (min: ${ENQUEUE_RATE_LIMIT_MS}ms)`,
        );
        return {
          success: false,
          item,
          error: 'rate-limited: too many enqueue calls from this profile',
        };
      }

      // Global sliding-window circuit-breaker
      if (now - _enqueueWindowStart > ENQUEUE_WINDOW_MS) {
        _enqueueWindowStart = now;
        _enqueueWindowCount = 0;
      }
      if (_enqueueWindowCount >= MAX_ENQUEUE_PER_MINUTE) {
        console.warn(
          `[ProgressQueue] Circuit-breaker tripped: ${_enqueueWindowCount} enqueues in last minute ` +
            `(max: ${MAX_ENQUEUE_PER_MINUTE})`,
        );
        return {
          success: false,
          item,
          error: 'rate-limited: global enqueue circuit-breaker',
        };
      }

      // Validation
      const validation = validateProgressItem(item);
      if (!validation.valid) {
        console.warn('[ProgressQueue] Validation failed:', validation.errors);
        return {
          success: false,
          item,
          error: `Validation failed: ${validation.errors.map((e) => `${e.field}: ${e.message}`).join(', ')}`,
          validation,
        };
      }

      // Duplicate detection
      if (isDuplicate(item.idempotency_key)) {
        console.warn(
          '[ProgressQueue] Duplicate item ignored:',
          item.idempotency_key,
        );
        return {
          success: false,
          item,
          error: 'Duplicate idempotency_key',
        };
      }

      // Size limit check — evict oldest if at capacity
      const stats = repo.getStats();
      if (stats.total >= MAX_QUEUE_SIZE) {
        console.warn('[ProgressQueue] Queue full, dropping oldest item');
        const all = repo.getAll();
        if (all.length > 0) {
          const evictedKey = all[0].idempotency_key;
          try {
            repo.remove(evictedKey);
          } catch (e) {
            console.error('[ProgressQueue] Failed to evict oldest item:', e);
          }
          // F7: Clean up _knownIds for evicted item
          _knownIds.delete(evictedKey);
        }
      }

      // Add item with initial status
      const itemWithStatus: ProgressItem = {
        ...item,
        status: 'pending',
        retryCount: 0,
      };

      try {
        repo.save(itemWithStatus);
      } catch (e) {
        console.error('[ProgressQueue] Failed to save item:', e);
        return {
          success: false,
          item,
          error: 'Storage error: failed to persist item',
        };
      }
      _knownIds.add(item.idempotency_key);
      // Record successful enqueue for rate-limiting tracking
      _lastEnqueueAt.set(item.profile_id, Date.now());
      _enqueueWindowCount++;
      _scheduleNotify();

      return { success: true, item: itemWithStatus };
    },

    /**
     * Get all pending items, optionally filtered by profile
     */
    getPending(profileId?: string): ProgressItem[] {
      const pending = repo.getByStatus('pending');
      if (!profileId) return pending;
      return pending.filter((i) => i.profile_id === profileId);
    },

    /**
     * Get count of pending items
     */
    getPendingCount(profileId?: string): number {
      return queue.getPending(profileId).length;
    },

    /**
     * Get all items marked as error
     */
    getErrors(profileId?: string): ProgressItem[] {
      const errors = repo.getByStatus('error');
      if (!profileId) return errors;
      return errors.filter((i) => i.profile_id === profileId);
    },

    /**
     * Mark an item as synced
     */
    markSynced(idempotency_key: string): boolean {
      let result: boolean;
      try {
        result = repo.markSynced(idempotency_key);
      } catch (e) {
        console.error('[ProgressQueue] Failed to mark synced:', e);
        return false;
      }
      if (result) {
        _knownIds.delete(idempotency_key);
        _scheduleNotify();
      }
      return result;
    },

    /**
     * Mark an item as error
     */
    markError(idempotency_key: string, errorMessage?: string): boolean {
      let result: boolean;
      try {
        result = repo.markError(
          idempotency_key,
          errorMessage || 'Unknown error',
        );
      } catch (e) {
        console.error('[ProgressQueue] Failed to mark error:', e);
        return false;
      }
      if (result) _scheduleNotify();
      return result;
    },

    /**
     * Move an item to dead letter queue
     */
    moveToDeadLetter(idempotency_key: string, finalError: string): boolean {
      let item: ProgressItem | undefined;
      try {
        item = repo.findById(idempotency_key);
      } catch (e) {
        console.error(
          '[ProgressQueue] Failed to find item for dead letter:',
          e,
        );
        return false;
      }
      if (!item) return false;

      try {
        repo.addDeadLetter({
          item,
          failedAt: new Date().toISOString(),
          finalError: sanitizeError(finalError),
          totalAttempts: item.retryCount || 1,
        });
        // Explicitly remove from main queue
        repo.remove(idempotency_key);
      } catch (e) {
        console.error('[ProgressQueue] Failed to move to dead letter:', e);
        return false;
      }

      _knownIds.delete(idempotency_key);
      _scheduleNotify();
      console.warn(
        '[ProgressQueue] Moved to dead letter:',
        idempotency_key,
        finalError,
      );
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
      let result: boolean;
      try {
        result = repo.retryDeadLetter(idempotency_key);
      } catch (e) {
        console.error('[ProgressQueue] Failed to retry dead letter:', e);
        return false;
      }
      if (result) {
        _scheduleNotify();
        console.log('[ProgressQueue] Retrying dead letter:', idempotency_key);
      }
      return result;
    },

    /**
     * Delete a dead letter item permanently
     */
    deleteDeadLetter(idempotency_key: string): boolean {
      let result: boolean;
      try {
        result = repo.removeDeadLetter(idempotency_key);
      } catch (e) {
        console.error('[ProgressQueue] Failed to delete dead letter:', e);
        return false;
      }
      if (result) _scheduleNotify();
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
      try {
        repo.clear();
      } catch (e) {
        console.error('[ProgressQueue] Failed to clear repo:', e);
      }
      _knownIds.clear();
      _scheduleNotify();
    },

    /**
     * Get queue statistics
     */
    getStats() {
      return repo.getStats();
    },

    /**
     * Process a single item with non-blocking retry logic (F1)
     *
     * Instead of blocking with setTimeout, this function:
     * - Attempts the API call once
     * - On 5xx/network errors, calculates backoff and sets nextRetryAt on the item
     * - Returns immediately so the UI stays responsive
     * - The next sync cycle will check nextRetryAt before retrying
     */
    async processItemWithRetry(
      item: ProgressItem,
      _apiClient: ApiClient,
    ): Promise<{ success: boolean; shouldRetry: boolean; error?: string }> {
       const retryCount = item.retryCount || 0;

       // Check if item is still in backoff period
       if (
         item.nextRetryAt &&
         Date.now() < new Date(item.nextRetryAt).getTime()
       ) {
         return { success: false, shouldRetry: false, error: 'Still in backoff period' };
       }

       try {
         await progressApi.saveProgress(item.profile_id, item);
         return { success: true, shouldRetry: false };
       } catch (error: unknown) {
         const err = error as {
           response?: { status?: number; data?: { error?: { message?: string }; detail?: string } };
           message?: string;
         };
         const errorMessage =
           err?.response?.data?.error?.message ||
           err?.response?.data?.detail ||
           err?.message ||
           'Unknown error';
         const statusCode = err?.response?.status;

        // Don't retry 4xx errors (client errors are permanent)
        if (statusCode !== undefined && statusCode >= 400 && statusCode < 500) {
          console.error(
            '[ProgressQueue] Client error, not retrying:',
            item.idempotency_key,
            statusCode,
          );
          return { success: false, shouldRetry: false, error: errorMessage };
        }

        // Check if max retries reached
        if (retryCount >= MAX_RETRIES) {
          console.error(
            '[ProgressQueue] Max retries reached:',
            item.idempotency_key,
          );
          return {
            success: false,
            shouldRetry: false,
            error: `Max retries reached: ${errorMessage}`,
          };
        }

        // F1: Non-blocking backoff — record when next retry should happen
        const delay = calculateRetryDelay(retryCount);
        const nextRetryAt = new Date(Date.now() + delay).toISOString();
        console.log(
          `[ProgressQueue] Retry ${retryCount + 1}/${MAX_RETRIES} for ${item.idempotency_key} scheduled at ${nextRetryAt}`,
        );

        return { success: false, shouldRetry: true, error: errorMessage };
      }
    },

    /**
     * Sync all pending and error items with non-blocking retry logic
     */
    async syncAll(apiClient: ApiClient): Promise<SyncResult> {
      const result: SyncResult = {
        synced: 0,
        failed: 0,
        deadLettered: 0,
        errors: [],
      };
      const items = [
        ...repo.getByStatus('pending'),
        ...repo.getByStatus('error'),
      ];

      if (items.length === 0) return result;

      // Sort by retry count (lowest first) to prioritize fresh items
      items.sort((a, b) => (a.retryCount || 0) - (b.retryCount || 0));

      for (const item of items) {
        const processResult = await queue.processItemWithRetry(item, apiClient);

        if (processResult.success) {
          queue.markSynced(item.idempotency_key);
          result.synced++;
        } else if (processResult.shouldRetry) {
          // F1: Non-blocking — set nextRetryAt timestamp instead of blocking
          const delay = calculateRetryDelay(item.retryCount || 0);
          const updatedItem: ProgressItem = {
            ...item,
            status: 'pending',
            retryCount: (item.retryCount || 0) + 1,
            lastError: processResult.error,
            lastRetryAt: new Date().toISOString(),
            nextRetryAt: new Date(Date.now() + delay).toISOString(),
          };
          try {
            repo.save(updatedItem);
          } catch (e) {
            console.error('[ProgressQueue] Failed to save retry state:', e);
          }
          result.errors.push({
            idempotency_key: item.idempotency_key,
            error: `Retry ${updatedItem.retryCount}/${MAX_RETRIES}: ${processResult.error || 'Unknown'}`,
          });
        } else {
          // Permanent failure
          const currentRetries = item.retryCount || 0;
          if (currentRetries >= MAX_RETRIES) {
            queue.moveToDeadLetter(
              item.idempotency_key,
              processResult.error || 'Max retries exceeded',
            );
            result.deadLettered++;
          } else {
            queue.markError(item.idempotency_key, processResult.error);
            result.failed++;
          }
          result.errors.push({
            idempotency_key: item.idempotency_key,
            error: processResult.error || 'Permanent failure',
          });
        }
      }

      _scheduleNotify();

      console.log('[ProgressQueue] Sync complete:', result);

      // Analytics: record aggregate sync result
      try {
        trackLaunchEvent('progress_sync_result', {
          synced: result.synced,
          failed: result.failed,
          deadLettered: result.deadLettered,
        });
      } catch (e) {
        console.warn('[ProgressQueue] analytics error', e);
      }

      return result;
    },

    // Internal access for tests
    _knownIds,
    _repo: repo,
  };

  return queue;
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
