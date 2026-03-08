/**
 * Progress Queue Retry Logic Tests
 *
 * Tests for retry mechanism, dead letter queue, and sync operations.
 * Uses dependency injection for complete isolation.
 *
 * @ticket ISSUE-008 - Testability refactor
 */

import { describe, it, expect, vi } from 'vitest';
import {
  makeFreshQueue,
  makeQueueWithItems,
  createValidItem,
  generateUUID,
} from '../../repositories/__tests__/testHelpers';
import { MAX_RETRIES } from '../progressConstants';

// Mock API client factory
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
    getCallCount: () => callIndex,
  };
}

describe('progressQueue retry logic (with DI)', () => {
  describe('processItemWithRetry', () => {
    it('succeeds on first attempt', async () => {
      const { queue } = makeFreshQueue();
      const item = createValidItem();
      const mockApi = createMockApiClient([{ status: 200 }]);

      const result = await queue.processItemWithRetry(item, mockApi);

      expect(result.success).toBe(true);
      expect(result.shouldRetry).toBe(false);
      expect(mockApi.post).toHaveBeenCalledTimes(1);
    });

    it('retries on 5xx error', async () => {
      const { queue } = makeFreshQueue();
      const item = createValidItem();
      const mockApi = createMockApiClient([
        { status: 500, error: 'Server Error' },
        { status: 200 },
      ]);

      const result = await queue.processItemWithRetry(item, mockApi);

      expect(result.success).toBe(false);
      expect(result.shouldRetry).toBe(true);
      expect(result.error).toContain('Server Error');
    });

    it('does not retry on 4xx error', async () => {
      const { queue } = makeFreshQueue();
      const item = createValidItem();
      const mockApi = createMockApiClient([
        { status: 400, error: 'Bad Request' },
      ]);

      const result = await queue.processItemWithRetry(item, mockApi);

      expect(result.success).toBe(false);
      expect(result.shouldRetry).toBe(false);
      expect(result.error).toContain('Bad Request');
    });

    it('syncs all pending items successfully', async () => {
      const { queue } = makeFreshQueue();
      const item1 = createValidItem();
      const item2 = createValidItem();
      queue.enqueue(item1);
      queue.enqueue(item2);

      const mockApi = createMockApiClient([
        { status: 200 },
        { status: 200 },
      ]);

      const result = await queue.syncAll(mockApi);

      expect(result.synced).toBe(2);
      expect(result.failed).toBe(0);
      expect(queue.getPendingCount()).toBe(0);
    });

    it('processes items in retry count order (lowest first)', async () => {
      const { queue, repo } = makeFreshQueue();
      // Items need status to be retrieved by getByStatus
      const item1 = createValidItem({ retryCount: 5, status: 'pending' });
      const item2 = createValidItem({ retryCount: 1, status: 'pending' });
      const item3 = createValidItem({ retryCount: 3, status: 'pending' });
      repo.save(item1);
      repo.save(item2);
      repo.save(item3);

      const callOrder: number[] = [];
      const mockApi = {
        post: vi.fn().mockImplementation(async (_url: string, data: any) => {
          callOrder.push(data.retryCount || 0);
          return { status: 200 };
        }),
      };

      await queue.syncAll(mockApi);

      // Should process in order: 1, 3, 5
      expect(callOrder).toEqual([1, 3, 5]);
    });

    it('does not move 4xx errors to dead letter immediately', async () => {
      const { queue } = makeFreshQueue();
      const item = createValidItem();
      queue.enqueue(item);

      const mockApi = createMockApiClient([
        { status: 400, error: 'Bad Request' },
      ]);

      await queue.syncAll(mockApi);

      // 4xx errors don't go to dead letter, just marked as error
      expect(queue.getDeadLetters()).toHaveLength(0);
    });
  });

  describe('dead letter queue', () => {
    it('adds item to dead letter with metadata', () => {
      const { queue, repo } = makeFreshQueue();
      const item = createValidItem({ retryCount: MAX_RETRIES, status: 'error' });
      repo.save(item);

      const result = queue.moveToDeadLetter(item.idempotency_key, 'Max retries exceeded');

      expect(result).toBe(true);
      const deadLetters = queue.getDeadLetters();
      expect(deadLetters).toHaveLength(1);
      expect(deadLetters[0].finalError).toBe('Max retries exceeded');
      expect(deadLetters[0].totalAttempts).toBe(MAX_RETRIES);
    });

    it('removes item from main queue when moved to dead letter', () => {
      const { queue, repo } = makeFreshQueue();
      const item = createValidItem({ status: 'error' });
      repo.save(item);

      expect(repo.getAll()).toHaveLength(1);

      const result = queue.moveToDeadLetter(item.idempotency_key, 'Failed');

      expect(result).toBe(true);
      expect(repo.getAll()).toHaveLength(0);
      expect(queue.getDeadLetters()).toHaveLength(1);
    });

    it('filters dead letters by profile_id', () => {
      const { queue, repo } = makeFreshQueue();
      const profile1 = generateUUID();
      const profile2 = generateUUID();

      const item1 = createValidItem({ profile_id: profile1, status: 'error' });
      const item2 = createValidItem({ profile_id: profile2, status: 'error' });
      repo.save(item1);
      repo.save(item2);

      queue.moveToDeadLetter(item1.idempotency_key, 'Failed');
      queue.moveToDeadLetter(item2.idempotency_key, 'Failed');

      const profile1DeadLetters = queue.getDeadLetters(profile1);
      expect(profile1DeadLetters).toHaveLength(1);
      expect(profile1DeadLetters[0].item.profile_id).toBe(profile1);
    });

    it('returns dead letter count', () => {
      const { queue, repo } = makeFreshQueue();

      const item1 = createValidItem({ status: 'error' });
      const item2 = createValidItem({ status: 'error' });
      repo.save(item1);
      repo.save(item2);

      queue.moveToDeadLetter(item1.idempotency_key, 'Failed');
      queue.moveToDeadLetter(item2.idempotency_key, 'Failed');

      expect(queue.getDeadLetterCount()).toBe(2);
    });

    it('retries dead letter item (moves back to queue)', () => {
      const { queue, repo } = makeFreshQueue();
      const item = createValidItem();
      repo.save(item);
      queue.moveToDeadLetter(item.idempotency_key, 'Failed');

      expect(queue.getDeadLetters()).toHaveLength(1);
      expect(repo.getAll()).toHaveLength(0);

      const result = queue.retryDeadLetter(item.idempotency_key);

      expect(result).toBe(true);
      expect(queue.getDeadLetters()).toHaveLength(0);
      expect(repo.getPending()).toHaveLength(1);
    });

    it('deletes dead letter item permanently', () => {
      const { queue, repo } = makeFreshQueue();
      const item = createValidItem({ status: 'error' });
      repo.save(item);
      queue.moveToDeadLetter(item.idempotency_key, 'Failed');

      expect(queue.getDeadLetters()).toHaveLength(1);

      queue.deleteDeadLetter(item.idempotency_key);

      expect(queue.getDeadLetters()).toHaveLength(0);
    });

    it('returns false when retrying non-existent dead letter', () => {
      const { queue } = makeFreshQueue();

      const result = queue.retryDeadLetter(generateUUID());

      expect(result).toBe(false);
    });

    it('tracks error message and timestamp', () => {
      const { queue, repo } = makeFreshQueue();
      const item = createValidItem();
      repo.save(item);

      queue.markError(item.idempotency_key, 'Network timeout');

      const errorItem = repo.getByStatus('error')[0];
      expect(errorItem.lastError).toBe('Network timeout');
      expect(errorItem.lastRetryAt).toBeDefined();
    });

    it('increments retry count on multiple errors', () => {
      const { queue, repo } = makeFreshQueue();
      const item = createValidItem({ retryCount: 0 });
      repo.save(item);

      queue.markError(item.idempotency_key, 'Error 1');
      queue.markError(item.idempotency_key, 'Error 2');

      const errorItem = repo.getByStatus('error')[0];
      expect(errorItem.retryCount).toBe(2);
    });
  });
});
