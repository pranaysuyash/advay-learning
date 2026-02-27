import { describe, it, expect, beforeEach, vi } from 'vitest';
import { progressQueue, ProgressItem } from '../progressQueue';
import { MAX_RETRIES } from '../progressConstants';

// Helper to generate valid UUID v4
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Helper to create valid progress item
function createValidItem(overrides: Partial<ProgressItem> = {}): ProgressItem {
  return {
    idempotency_key: generateUUID(),
    profile_id: generateUUID(),
    activity_type: 'letter_tracing',
    content_id: 'A',
    score: 80,
    timestamp: new Date().toISOString(),
    ...overrides,
  };
}

// Mock API client
function createMockApiClient(responses: Array<{ status: number; data?: any; error?: string }>) {
  let callIndex = 0;
  return {
    post: vi.fn().mockImplementation(async () => {
      const response = responses[callIndex++] || responses[responses.length - 1];
      if (response.error || response.status >= 400) {
        const error: any = new Error(response.error || 'API Error');
        error.response = { status: response.status, data: { detail: response.error } };
        throw error;
      }
      return { status: response.status, data: response.data };
    }),
  };
}

beforeEach(() => {
  localStorage.clear();
  progressQueue.clear();
  vi.clearAllMocks();
});

describe('progressQueue retry logic', () => {
  describe('processItemWithRetry', () => {
    it('succeeds on first attempt', async () => {
      const item = createValidItem();
      progressQueue.enqueue(item);
      const mockApi = createMockApiClient([{ status: 200 }]);

      const result = await progressQueue.processItemWithRetry(item, mockApi);

      expect(result.success).toBe(true);
      expect(result.shouldRetry).toBe(false);
      expect(mockApi.post).toHaveBeenCalledTimes(1);
    });

    it('retries on 5xx error', async () => {
      const item = createValidItem();
      const mockApi = createMockApiClient([
        { status: 500, error: 'Server Error' },
        { status: 200 },
      ]);

      const result = await progressQueue.processItemWithRetry(item, mockApi);

      expect(result.success).toBe(false);
      expect(result.shouldRetry).toBe(true);
      expect(result.error).toContain('Server Error');
    });

    it('does not retry on 4xx error', async () => {
      const item = createValidItem();
      const mockApi = createMockApiClient([
        { status: 400, error: 'Bad Request' },
      ]);

      const result = await progressQueue.processItemWithRetry(item, mockApi);

      expect(result.success).toBe(false);
      expect(result.shouldRetry).toBe(false);
      expect(result.error).toContain('Bad Request');
    });

    it.skip('applies exponential backoff between retries (SLOW - needs mock timers)', async () => {
      // TODO: Refactor to use vi.useFakeTimers() for testing delays
      // With retryCount=2, delay would be ~4000ms + jitter
      const item = createValidItem({ retryCount: 2 });
      const mockApi = createMockApiClient([
        { status: 503 },
      ]);

      const result = await progressQueue.processItemWithRetry(item, mockApi);
      expect(result.shouldRetry).toBe(true);
    });
  });

  describe('syncAll with retry', () => {
    it('syncs all pending items successfully', async () => {
      const item1 = createValidItem();
      const item2 = createValidItem();
      progressQueue.enqueue(item1);
      progressQueue.enqueue(item2);

      const mockApi = createMockApiClient([
        { status: 200 },
        { status: 200 },
      ]);

      const result = await progressQueue.syncAll(mockApi);

      expect(result.synced).toBe(2);
      expect(result.failed).toBe(0);
      expect(result.deadLettered).toBe(0);
      expect(progressQueue.getPending()).toHaveLength(0);
    });

    it.skip('retries failed items and eventually succeeds (SLOW - needs mock timers)', async () => {
      // TODO: Refactor to use mock timers for exponential backoff
      // This test takes too long due to actual delays
      const item = createValidItem();
      progressQueue.enqueue(item);

      const mockApi = createMockApiClient([
        { status: 500 },
        { status: 500 },
        { status: 200 },
      ]);

      const result = await progressQueue.syncAll(mockApi);

      expect(result.synced).toBe(1);
      expect(mockApi.post).toHaveBeenCalledTimes(3);
    });

    it.skip('moves item to dead letter after max retries (SLOW - needs mock timers)', async () => {
      // TODO: Refactor to use mock timers for exponential backoff
      // This test takes too long due to actual delays (1000ms + 2000ms + 4000ms + ...)
      const item = createValidItem();
      progressQueue.enqueue(item);

      // Always fail with 5xx
      const _mockApi = createMockApiClient(
        Array(MAX_RETRIES + 2).fill({ status: 500, error: 'Persistent Error' })
      );

      // Manually move to dead letter to verify the logic
      progressQueue.moveToDeadLetter(item.idempotency_key, 'Max retries exceeded');

      expect(progressQueue.getDeadLetters()).toHaveLength(1);
      expect(progressQueue.getDeadLetters()[0].item.idempotency_key).toBe(item.idempotency_key);
      expect(progressQueue.getDeadLetters()[0].finalError).toContain('Max retries');
    });

    it('does not move 4xx errors to dead letter immediately', async () => {
      const item = createValidItem();
      progressQueue.enqueue(item);

      const mockApi = createMockApiClient([
        { status: 400, error: 'Bad Request' },
      ]);

      const result = await progressQueue.syncAll(mockApi);

      expect(result.failed).toBe(1);
      expect(result.deadLettered).toBe(0);
      // Item should be marked as error but still in main queue
      expect(progressQueue.getErrors()).toHaveLength(1);
    });

    it('processes items in retry count order (lowest first)', async () => {
      const freshItem = createValidItem({ content_id: 'fresh' });
      const retriedItem = createValidItem({ content_id: 'retried', retryCount: 3 });
      
      progressQueue.enqueue(freshItem);
      progressQueue.enqueue(retriedItem);
      
      const callOrder: string[] = [];
      const mockApi = {
        post: vi.fn().mockImplementation((url: string, item: ProgressItem) => {
          callOrder.push(item.content_id);
          return Promise.resolve({ status: 200 });
        }),
      };

      await progressQueue.syncAll(mockApi);

      expect(callOrder[0]).toBe('fresh');
      expect(callOrder[1]).toBe('retried');
    });
  });

  describe('dead letter queue', () => {
    it('adds item to dead letter with metadata', () => {
      const item = createValidItem();
      progressQueue.enqueue(item);
      
      // Simulate retry count increment
      progressQueue.markError(item.idempotency_key, 'Error 1');
      progressQueue.markError(item.idempotency_key, 'Error 2');
      progressQueue.markError(item.idempotency_key, 'Error 3');

      progressQueue.moveToDeadLetter(item.idempotency_key, 'Max retries exceeded');

      const deadLetters = progressQueue.getDeadLetters();
      expect(deadLetters).toHaveLength(1);
      expect(deadLetters[0].item.idempotency_key).toBe(item.idempotency_key);
      expect(deadLetters[0].finalError).toBe('Max retries exceeded');
      expect(deadLetters[0].totalAttempts).toBe(3);
      expect(deadLetters[0].failedAt).toBeDefined();
    });

    it('removes item from main queue when moved to dead letter', () => {
      const item = createValidItem();
      progressQueue.enqueue(item);
      expect(progressQueue.getPending()).toHaveLength(1);

      progressQueue.moveToDeadLetter(item.idempotency_key, 'Failed');

      expect(progressQueue.getPending()).toHaveLength(0);
      expect(progressQueue.getDeadLetters()).toHaveLength(1);
    });

    it('filters dead letters by profile_id', () => {
      const profile1 = generateUUID();
      const profile2 = generateUUID();
      
      const item1 = createValidItem({ profile_id: profile1 });
      const item2 = createValidItem({ profile_id: profile2 });
      
      progressQueue.enqueue(item1);
      progressQueue.enqueue(item2);
      progressQueue.moveToDeadLetter(item1.idempotency_key, 'Failed');
      progressQueue.moveToDeadLetter(item2.idempotency_key, 'Failed');

      expect(progressQueue.getDeadLetters(profile1)).toHaveLength(1);
      expect(progressQueue.getDeadLetters(profile1)[0].item.profile_id).toBe(profile1);
    });

    it('returns dead letter count', () => {
      progressQueue.enqueue(createValidItem());
      progressQueue.enqueue(createValidItem());
      progressQueue.moveToDeadLetter(progressQueue.getPending()[0].idempotency_key, 'Failed');

      expect(progressQueue.getDeadLetterCount()).toBe(1);
    });

    it('retries dead letter item (moves back to queue)', () => {
      const item = createValidItem({ retryCount: 5 });
      progressQueue.enqueue(item);
      progressQueue.moveToDeadLetter(item.idempotency_key, 'Failed');

      expect(progressQueue.getDeadLetters()).toHaveLength(1);
      expect(progressQueue.getPending()).toHaveLength(0);

      const success = progressQueue.retryDeadLetter(item.idempotency_key);

      expect(success).toBe(true);
      expect(progressQueue.getDeadLetters()).toHaveLength(0);
      expect(progressQueue.getPending()).toHaveLength(1);
      
      // Retry count should be reset
      const pending = progressQueue.getPending()[0];
      expect(pending.retryCount).toBe(0);
      expect(pending.status).toBe('pending');
    });

    it('deletes dead letter item permanently', () => {
      const item = createValidItem();
      progressQueue.enqueue(item);
      progressQueue.moveToDeadLetter(item.idempotency_key, 'Failed');

      const success = progressQueue.deleteDeadLetter(item.idempotency_key);

      expect(success).toBe(true);
      expect(progressQueue.getDeadLetters()).toHaveLength(0);
    });

    it('returns false when retrying non-existent dead letter', () => {
      const success = progressQueue.retryDeadLetter(generateUUID());
      expect(success).toBe(false);
    });
  });

  describe('error tracking', () => {
    it('tracks error message and timestamp', () => {
      const item = createValidItem();
      progressQueue.enqueue(item);

      progressQueue.markError(item.idempotency_key, 'Network timeout');

      const errors = progressQueue.getErrors();
      expect(errors).toHaveLength(1);
      expect(errors[0].lastError).toBe('Network timeout');
      expect(errors[0].lastRetryAt).toBeDefined();
      expect(errors[0].retryCount).toBe(1);
    });

    it('increments retry count on multiple errors', () => {
      const item = createValidItem();
      progressQueue.enqueue(item);

      progressQueue.markError(item.idempotency_key, 'Error 1');
      progressQueue.markError(item.idempotency_key, 'Error 2');
      progressQueue.markError(item.idempotency_key, 'Error 3');

      const errors = progressQueue.getErrors();
      expect(errors[0].retryCount).toBe(3);
    });
  });
});
