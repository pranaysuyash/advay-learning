/**
 * Progress Queue Unit Tests
 *
 * Uses dependency injection with InMemoryProgressRepository for
 * complete test isolation. No localStorage dependencies.
 *
 * @ticket ISSUE-008 - Testability refactor
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  makeFreshQueue,
  makeQueueWithItems,
  makeQueueWithState,
  createValidItem,
  generateUUID,
} from '../../repositories/__tests__/testHelpers';
import { MAX_QUEUE_SIZE, ENQUEUE_RATE_LIMIT_MS, MAX_ENQUEUE_PER_MINUTE } from '../progressConstants';

describe('progressQueue (with DI)', () => {
  describe('enqueue', () => {
    it('enqueues valid item and returns success', () => {
      const { queue, repo } = makeFreshQueue();
      const item = createValidItem();

      const result = queue.enqueue(item);

      expect(result.success).toBe(true);
      expect(result.item.status).toBe('pending');

      const pending = repo.getPending();
      expect(pending).toHaveLength(1);
      expect(pending[0].idempotency_key).toBe(item.idempotency_key);
    });

    it('rejects item with invalid UUID format', () => {
      const { queue } = makeFreshQueue();
      const item = createValidItem({ idempotency_key: 'invalid-uuid' });

      const result = queue.enqueue(item);

      expect(result.success).toBe(false);
      expect(result.error).toContain('idempotency_key');
    });

    it('rejects item with missing required fields', () => {
      const { queue } = makeFreshQueue();
      const item = {
        idempotency_key: generateUUID(),
        // missing profile_id, activity_type, etc.
      } as any;

      const result = queue.enqueue(item);

      expect(result.success).toBe(false);
      expect(result.error).toContain('profile_id');
    });

    it('rejects item with score out of bounds', () => {
      const { queue } = makeFreshQueue();
      const item = createValidItem({ score: -10 });

      const result = queue.enqueue(item);

      expect(result.success).toBe(false);
      expect(result.error).toContain('score');
    });

    it('rejects duplicate idempotency_key', () => {
      const { queue } = makeFreshQueue();
      const id = generateUUID();
      const item1 = createValidItem({ idempotency_key: id });
      const item2 = createValidItem({ idempotency_key: id });

      queue.enqueue(item1);
      const result = queue.enqueue(item2);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Duplicate');
      expect(queue.getPending()).toHaveLength(1);
    });

    it('enforces MAX_QUEUE_SIZE by dropping oldest item', () => {
      const { queue } = makeFreshQueue();

      // Fill queue to capacity
      for (let i = 0; i < MAX_QUEUE_SIZE; i++) {
        queue.enqueue(createValidItem({ idempotency_key: generateUUID() }));
      }

      expect(queue.getPending()).toHaveLength(MAX_QUEUE_SIZE);

      // Add one more - should drop oldest
      const newItem = createValidItem({ content_id: 'newest' });
      queue.enqueue(newItem);

      expect(queue.getPending()).toHaveLength(MAX_QUEUE_SIZE);

      // Verify newest is present
      const items = queue.getPending();
      expect(items.some(i => i.content_id === 'newest')).toBe(true);
    });

    it('accepts valid optional fields', () => {
      const { queue, repo } = makeFreshQueue();
      const item = createValidItem({
        duration_seconds: 120,
        completed: true,
        meta_data: { letter: 'A', accuracy: 95 },
      });

      const result = queue.enqueue(item);

      expect(result.success).toBe(true);
      const pending = repo.getPending();
      expect(pending[0].duration_seconds).toBe(120);
      expect(pending[0].completed).toBe(true);
    });
  });

  describe('getPending', () => {
    it('returns only pending items', () => {
      const { queue } = makeQueueWithState({
        pending: 2,
        synced: 1,
        error: 1,
      });

      const pending = queue.getPending();

      expect(pending).toHaveLength(2);
      expect(pending.every(i => i.status === 'pending')).toBe(true);
    });

    it('filters by profile_id', () => {
      const profile1 = generateUUID();
      const profile2 = generateUUID();
      const { queue, repo } = makeFreshQueue();

      repo.save(createValidItem({ profile_id: profile1, status: 'pending' }));
      repo.save(createValidItem({ profile_id: profile2, status: 'pending' }));

      const pending = queue.getPending(profile1);

      expect(pending).toHaveLength(1);
      expect(pending[0].profile_id).toBe(profile1);
    });
  });

  describe('getPendingCount', () => {
    it('returns count of pending items', () => {
      const { queue } = makeQueueWithState({ pending: 3 });

      expect(queue.getPendingCount()).toBe(3);
    });
  });

  describe('getErrors', () => {
    it('returns only error items', () => {
      const { queue } = makeQueueWithState({
        pending: 1,
        error: 2,
      });

      const errors = queue.getErrors();

      expect(errors).toHaveLength(2);
      expect(errors.every(i => i.status === 'error')).toBe(true);
    });

    it('filters by profile_id', () => {
      const profile1 = generateUUID();
      const profile2 = generateUUID();
      const { queue, repo } = makeFreshQueue();

      repo.save(createValidItem({ profile_id: profile1, status: 'error' }));
      repo.save(createValidItem({ profile_id: profile2, status: 'error' }));

      const errors = queue.getErrors(profile1);

      expect(errors).toHaveLength(1);
      expect(errors[0].profile_id).toBe(profile1);
    });
  });

  describe('markSynced', () => {
    it('marks item as synced', () => {
      const { queue, repo } = makeFreshQueue();
      const item = createValidItem({ status: 'pending' });
      repo.save(item);

      queue.markSynced(item.idempotency_key);

      expect(repo.getByStatus('synced')).toHaveLength(1);
      expect(repo.getByStatus('pending')).toHaveLength(0);
    });

    it('handles non-existent idempotency_key gracefully', () => {
      const { queue } = makeFreshQueue();

      // Should not throw
      expect(() => queue.markSynced(generateUUID())).not.toThrow();
    });
  });

  describe('markError', () => {
    it('marks item as error with message', () => {
      const { queue, repo } = makeFreshQueue();
      const item = createValidItem({ status: 'pending' });
      repo.save(item);

      queue.markError(item.idempotency_key, 'Network timeout');

      const errorItems = repo.getByStatus('error');
      expect(errorItems).toHaveLength(1);
      expect(errorItems[0].lastError).toBe('Network timeout');
    });

    it('increments retry count on error', () => {
      const { queue, repo } = makeFreshQueue();
      const item = createValidItem({ status: 'pending', retryCount: 2 });
      repo.save(item);

      queue.markError(item.idempotency_key, 'Error');

      const errorItem = repo.getByStatus('error')[0];
      expect(errorItem.retryCount).toBe(3);
    });
  });

  describe('clear', () => {
    it('removes all items', () => {
      const { queue, repo } = makeQueueWithState({
        pending: 3,
        synced: 2,
        error: 1,
      });

      expect(repo.getAll()).toHaveLength(6);

      queue.clear();

      expect(repo.getAll()).toHaveLength(0);
    });
  });

  describe('subscribe', () => {
    it('notifies subscribers on change', () => {
      const { queue } = makeFreshQueue();
      const callback = vi.fn();

      queue.subscribe(callback);
      queue.enqueue(createValidItem());

      expect(callback).toHaveBeenCalled();
    });

    it('unsubscribe removes listener', () => {
      const { queue } = makeFreshQueue();
      const callback = vi.fn();

      const unsubscribe = queue.subscribe(callback);
      unsubscribe();

      queue.enqueue(createValidItem());

      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('rate-limiting (PQ-005)', () => {
    it('blocks second enqueue from same profile within ENQUEUE_RATE_LIMIT_MS window', () => {
      const { queue } = makeFreshQueue();
      const profileId = generateUUID();

      const item1 = createValidItem({ profile_id: profileId });
      const item2 = createValidItem({ profile_id: profileId });

      const result1 = queue.enqueue(item1);
      const result2 = queue.enqueue(item2);

      expect(result1.success).toBe(true);
      expect(result2.success).toBe(false);
      expect(result2.error).toContain('rate-limited');
    });

    it('allows enqueue from same profile after rate-limit window elapses', () => {
      const { queue } = makeFreshQueue();
      const profileId = generateUUID();

      const item1 = createValidItem({ profile_id: profileId });
      const item2 = createValidItem({ profile_id: profileId });

      queue.enqueue(item1);

      // Mock time passing
      vi.useFakeTimers();
      vi.advanceTimersByTime(ENQUEUE_RATE_LIMIT_MS + 100);

      const result2 = queue.enqueue(item2);

      vi.useRealTimers();
      expect(result2.success).toBe(true);
    });

    it('allows concurrent enqueues from different profiles within rate-limit window', () => {
      const { queue } = makeFreshQueue();
      const profile1 = generateUUID();
      const profile2 = generateUUID();

      const item1 = createValidItem({ profile_id: profile1 });
      const item2 = createValidItem({ profile_id: profile2 });

      const result1 = queue.enqueue(item1);
      const result2 = queue.enqueue(item2);

      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);
    });

    it('trips global circuit-breaker after MAX_ENQUEUE_PER_MINUTE successful enqueues', () => {
      const { queue } = makeFreshQueue();

      // Use fake timers to control time
      vi.useFakeTimers({ shouldAdvanceTime: true });

      // Fill up the circuit breaker
      for (let i = 0; i < MAX_ENQUEUE_PER_MINUTE; i++) {
        queue.enqueue(createValidItem());
      }

      // Next enqueue should be circuit-broken
      const result = queue.enqueue(createValidItem());

      vi.useRealTimers();

      expect(result.success).toBe(false);
      expect(result.error).toContain('circuit-breaker');
    });
  });

  describe('getStats', () => {
    it('returns correct counts for all statuses', () => {
      const { queue } = makeQueueWithState({
        pending: 2,
        synced: 3,
        error: 1,
        deadLetters: 2,
      });

      const stats = queue.getStats();

      expect(stats.total).toBe(6); // pending + synced + error
      expect(stats.pending).toBe(2);
      expect(stats.synced).toBe(3);
      expect(stats.error).toBe(1);
      expect(stats.deadLetters).toBe(2);
    });
  });
});
