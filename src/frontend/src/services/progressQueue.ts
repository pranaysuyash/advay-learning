// Offline progress queue service
// Simple IndexedDB fallback to localStorage (lightweight implementation for scaffolding)

import { validateProgressItem, type ValidationResult } from './progressValidation';
import {
  MAX_QUEUE_SIZE,
  MAX_RETRIES,
  RETRY_BASE_DELAY_MS,
  MAX_RETRY_DELAY_MS,
  RETRY_JITTER_MS,
  STORAGE_KEY,
  DEAD_LETTER_STORAGE_KEY,
} from './progressConstants';

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

// In-memory Set to track known IDs for O(1) duplicate detection
// This is session-only; persisted items are checked against storage
const _knownIds = new Set<string>();

function load(): ProgressItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Failed to load progress queue', e);
    return [];
  }
}

function save(items: ProgressItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    console.error('Failed to save progress queue', e);
    // TODO: Implement fallback or dead letter queue for quota exceeded
  }
}

function loadDeadLetters(): DeadLetterItem[] {
  try {
    const raw = localStorage.getItem(DEAD_LETTER_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Failed to load dead letter queue', e);
    return [];
  }
}

function saveDeadLetters(items: DeadLetterItem[]) {
  try {
    localStorage.setItem(DEAD_LETTER_STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    console.error('Failed to save dead letter queue', e);
  }
}

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
 * Check if an item with the given idempotency_key already exists
 * Uses in-memory Set for O(1) lookup of session items
 */
function isDuplicate(idempotencyKey: string): boolean {
  // Check in-memory Set first (current session)
  if (_knownIds.has(idempotencyKey)) {
    return true;
  }
  
  // Check persisted storage
  const items = load();
  return items.some(item => item.idempotency_key === idempotencyKey);
}

type Subscriber = () => void;

export interface EnqueueResult {
  success: boolean;
  item: ProgressItem;
  error?: string;
  validation?: ValidationResult;
}

export const progressQueue = {
  _subscribers: new Set<Subscriber>(),

  /**
   * Add a progress item to the queue
   * 
   * Validations performed:
   * - Schema validation (all required fields present and valid)
   * - Duplicate detection (idempotency_key must be unique)
   * - Queue size limit (MAX_QUEUE_SIZE)
   * 
   * @param item - The progress item to enqueue
   * @returns EnqueueResult with success status and any errors
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

    const items = load();

    // Size limit check
    if (items.length >= MAX_QUEUE_SIZE) {
      console.warn('[ProgressQueue] Queue full, dropping oldest item');
      items.shift(); // Remove oldest
    }

    // Add item with initial retry count
    const itemWithStatus: ProgressItem = { 
      ...item, 
      status: 'pending',
      retryCount: 0,
    };
    items.push(itemWithStatus);
    
    // Track in memory Set for fast duplicate detection
    _knownIds.add(item.idempotency_key);
    
    save(items);
    this._notify();

    return { success: true, item: itemWithStatus };
  },

  /**
   * Get all pending items, optionally filtered by profile
   */
  getPending(profileId?: string): ProgressItem[] {
    return load().filter(
      (i) =>
        i.status === 'pending' && (!profileId || i.profile_id === profileId),
    );
  },

  /**
   * Get count of pending items
   */
  getPendingCount(profileId?: string): number {
    return this.getPending(profileId).length;
  },

  /**
   * Get all items marked as error (for retry visibility)
   */
  getErrors(profileId?: string): ProgressItem[] {
    return load().filter(
      (i) =>
        i.status === 'error' && (!profileId || i.profile_id === profileId),
    );
  },

  /**
   * Mark an item as synced
   */
  markSynced(idempotency_key: string) {
    const items = load();
    const idx = items.findIndex((i) => i.idempotency_key === idempotency_key);
    if (idx !== -1) {
      items[idx].status = 'synced';
      items[idx].retryCount = 0;
      items[idx].lastError = undefined;
      save(items);
      this._notify();
    }
  },

  /**
   * Mark an item as error (for retry logic)
   */
  markError(idempotency_key: string, errorMessage?: string) {
    const items = load();
    const idx = items.findIndex((i) => i.idempotency_key === idempotency_key);
    if (idx !== -1) {
      const currentRetryCount = items[idx].retryCount || 0;
      items[idx].status = 'error';
      items[idx].retryCount = currentRetryCount + 1;
      items[idx].lastError = errorMessage;
      items[idx].lastRetryAt = new Date().toISOString();
      save(items);
      this._notify();
    }
  },

  /**
   * Move an item to dead letter queue (permanently failed)
   */
  moveToDeadLetter(idempotency_key: string, finalError: string) {
    const items = load();
    const idx = items.findIndex((i) => i.idempotency_key === idempotency_key);
    if (idx === -1) return;

    const item = items[idx];
    const deadLetters = loadDeadLetters();
    
    deadLetters.push({
      item,
      failedAt: new Date().toISOString(),
      finalError,
      totalAttempts: item.retryCount || 1,
    });

    // Remove from main queue
    items.splice(idx, 1);
    
    save(items);
    saveDeadLetters(deadLetters);
    this._notify();

    console.warn('[ProgressQueue] Moved to dead letter:', idempotency_key, finalError);
  },

  /**
   * Get all dead letter items
   */
  getDeadLetters(profileId?: string): DeadLetterItem[] {
    const deadLetters = loadDeadLetters();
    if (!profileId) return deadLetters;
    return deadLetters.filter(d => d.item.profile_id === profileId);
  },

  /**
   * Get count of dead letter items
   */
  getDeadLetterCount(profileId?: string): number {
    return this.getDeadLetters(profileId).length;
  },

  /**
   * Retry a dead letter item
   */
  retryDeadLetter(idempotency_key: string): boolean {
    const deadLetters = loadDeadLetters();
    const idx = deadLetters.findIndex(d => d.item.idempotency_key === idempotency_key);
    if (idx === -1) return false;

    const deadItem = deadLetters[idx];
    
    // Remove from dead letters
    deadLetters.splice(idx, 1);
    saveDeadLetters(deadLetters);

    // Reset and re-enqueue
    const retryItem: ProgressItem = {
      ...deadItem.item,
      status: 'pending',
      retryCount: 0,
      lastError: undefined,
      lastRetryAt: undefined,
    };

    const items = load();
    items.push(retryItem);
    save(items);
    this._notify();

    console.log('[ProgressQueue] Retrying dead letter:', idempotency_key);
    return true;
  },

  /**
   * Delete a dead letter item permanently
   */
  deleteDeadLetter(idempotency_key: string): boolean {
    const deadLetters = loadDeadLetters();
    const idx = deadLetters.findIndex(d => d.item.idempotency_key === idempotency_key);
    if (idx === -1) return false;

    deadLetters.splice(idx, 1);
    saveDeadLetters(deadLetters);
    this._notify();

    return true;
  },

  subscribe(cb: Subscriber): () => void {
    this._subscribers.add(cb);
    return () => {
      this._subscribers.delete(cb);
    };
  },

  _notify() {
    this._subscribers.forEach((cb) => {
      try {
        cb();
      } catch (e) {
        console.error('progressQueue subscriber error', e);
      }
    });
  },

  /**
   * Clear all items (use with caution - mainly for testing)
   */
  clear() {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(DEAD_LETTER_STORAGE_KEY);
    _knownIds.clear();
    this._notify();
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

      // Don't retry 4xx errors (client errors)
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
   * Sync all pending items with exponential backoff retry
   */
  async syncAll(apiClient: any): Promise<SyncResult> {
    const result: SyncResult = { synced: 0, failed: 0, deadLettered: 0, errors: [] };
    const items = load().filter((i) => i.status === 'pending' || i.status === 'error');
    
    if (items.length === 0) return result;

    // Sort by retry count (lowest first) to prioritize fresh items
    items.sort((a, b) => (a.retryCount || 0) - (b.retryCount || 0));

    for (const item of items) {
      const processResult = await this.processItemWithRetry(item, apiClient);

      if (processResult.success) {
        this.markSynced(item.idempotency_key);
        result.synced++;
      } else if (processResult.shouldRetry) {
        // Update retry count and continue to next item
        this.markError(item.idempotency_key, processResult.error);
        result.errors.push({ idempotency_key: item.idempotency_key, error: processResult.error || 'Unknown' });
      } else {
        // Permanent failure - move to dead letter if max retries reached
        const currentRetries = item.retryCount || 0;
        if (currentRetries >= MAX_RETRIES) {
          this.moveToDeadLetter(item.idempotency_key, processResult.error || 'Max retries exceeded');
          result.deadLettered++;
        } else {
          // Client error (4xx) - don't retry but keep in queue for manual intervention
          this.markError(item.idempotency_key, processResult.error);
          result.failed++;
        }
        result.errors.push({ idempotency_key: item.idempotency_key, error: processResult.error || 'Permanent failure' });
      }
    }

    this._notify();
    
    console.log('[ProgressQueue] Sync complete:', result);
    return result;
  },
};
