/**
 * Progress Queue Constants
 * 
 * Centralized configuration for progress tracking behavior.
 * All magic numbers should live here with documentation.
 */

/** Maximum items in queue to prevent memory bloat and localStorage quota issues */
export const MAX_QUEUE_SIZE = 50;

/** Maximum retry attempts for failed sync operations */
export const MAX_RETRIES = 5;

/** Base delay for retry backoff in milliseconds */
export const RETRY_BASE_DELAY_MS = 1000;

/** Maximum delay between retries in milliseconds */
export const MAX_RETRY_DELAY_MS = 16000;

/** Jitter range in milliseconds (added to delay to prevent thundering herd) */
export const RETRY_JITTER_MS = 500;

/** Debounce window for rapid enqueue operations in milliseconds */
export const ENQUEUE_DEBOUNCE_MS = 100;

/** Minimum ms between enqueue() calls from the same profile_id (per-profile gate) */
export const ENQUEUE_RATE_LIMIT_MS = 50;

/** Maximum enqueue() calls allowed globally per minute (circuit-breaker ceiling) */
export const MAX_ENQUEUE_PER_MINUTE = 120;

/** Duration of the global throughput measurement window in milliseconds */
export const ENQUEUE_WINDOW_MS = 60_000;

/** localStorage key for queue persistence */
export const STORAGE_KEY = 'advay:progressQueue:v1';

/** localStorage key for dead letter queue */
export const DEAD_LETTER_STORAGE_KEY = 'advay:progressQueue:deadLetters:v1';

/** Valid states for a progress item */
export const VALID_STATUSES = ['pending', 'synced', 'error'] as const;

/** Score bounds for validation */
export const SCORE_BOUNDS = {
  min: 0,
  max: 1000000,
} as const;

/** Duration bounds in seconds */
export const DURATION_BOUNDS = {
  min: 0,
  max: 3600, // 1 hour max session
} as const;
