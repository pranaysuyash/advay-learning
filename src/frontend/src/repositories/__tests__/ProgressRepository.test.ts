import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryProgressRepository } from '../InMemoryProgressRepository';
import { LocalStorageProgressRepository } from '../LocalStorageProgressRepository';
import { ProgressRepository, DeadLetterItem } from '../ProgressRepository';
import { ProgressItem } from '../../services/progressValidation';

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
    status: 'pending',
    ...overrides,
  };
}

// Shared test suite for both implementations
function runRepositoryTests(
  name: string,
  createRepo: () => ProgressRepository,
  cleanup: () => void
) {
  describe(`${name} - Basic Operations`, () => {
    let repo: ProgressRepository;

    beforeEach(() => {
      cleanup();
      repo = createRepo();
    });

    describe('getAll', () => {
      it('returns empty array when no items', () => {
        expect(repo.getAll()).toEqual([]);
      });

      it('returns all saved items', () => {
        const item1 = createValidItem();
        const item2 = createValidItem();
        repo.save(item1);
        repo.save(item2);

        const all = repo.getAll();
        expect(all).toHaveLength(2);
        expect(all.map(i => i.idempotency_key)).toContain(item1.idempotency_key);
        expect(all.map(i => i.idempotency_key)).toContain(item2.idempotency_key);
      });
    });

    describe('save', () => {
      it('saves new item', () => {
        const item = createValidItem();
        repo.save(item);

        expect(repo.getAll()).toHaveLength(1);
        expect(repo.findById(item.idempotency_key)).toEqual(item);
      });

      it('updates existing item by idempotency_key', () => {
        const item = createValidItem({ score: 50 });
        repo.save(item);

        const updated = { ...item, score: 100, status: 'synced' as const };
        repo.save(updated);

        expect(repo.getAll()).toHaveLength(1);
        expect(repo.findById(item.idempotency_key)?.score).toBe(100);
        expect(repo.findById(item.idempotency_key)?.status).toBe('synced');
      });
    });

    describe('saveMany', () => {
      it('saves multiple items in batch', () => {
        const items = [createValidItem(), createValidItem(), createValidItem()];
        repo.saveMany(items);

        expect(repo.getAll()).toHaveLength(3);
      });

      it('updates existing items and adds new ones', () => {
        const item1 = createValidItem({ score: 50 });
        repo.save(item1);

        const updated1 = { ...item1, score: 100 };
        const item2 = createValidItem();

        repo.saveMany([updated1, item2]);

        expect(repo.getAll()).toHaveLength(2);
        expect(repo.findById(item1.idempotency_key)?.score).toBe(100);
      });
    });

    describe('findById', () => {
      it('finds existing item', () => {
        const item = createValidItem();
        repo.save(item);

        expect(repo.findById(item.idempotency_key)).toEqual(item);
      });

      it('returns undefined for non-existent item', () => {
        expect(repo.findById(generateUUID())).toBeUndefined();
      });
    });

    describe('exists', () => {
      it('returns true for existing item', () => {
        const item = createValidItem();
        repo.save(item);

        expect(repo.exists(item.idempotency_key)).toBe(true);
      });

      it('returns false for non-existent item', () => {
        expect(repo.exists(generateUUID())).toBe(false);
      });
    });

    describe('remove', () => {
      it('removes existing item and returns true', () => {
        const item = createValidItem();
        repo.save(item);

        const result = repo.remove(item.idempotency_key);

        expect(result).toBe(true);
        expect(repo.getAll()).toHaveLength(0);
      });

      it('returns false for non-existent item', () => {
        const result = repo.remove(generateUUID());
        expect(result).toBe(false);
      });
    });

    describe('removeMany', () => {
      it('removes multiple items and returns count', () => {
        const item1 = createValidItem();
        const item2 = createValidItem();
        const item3 = createValidItem();
        repo.save(item1);
        repo.save(item2);
        repo.save(item3);

        const removed = repo.removeMany([item1.idempotency_key, item2.idempotency_key]);

        expect(removed).toBe(2);
        expect(repo.getAll()).toHaveLength(1);
      });
    });

    describe('clear', () => {
      it('removes all items', () => {
        repo.save(createValidItem());
        repo.save(createValidItem());

        repo.clear();

        expect(repo.getAll()).toHaveLength(0);
      });
    });
  });

  describe(`${name} - Status Operations`, () => {
    let repo: ProgressRepository;

    beforeEach(() => {
      cleanup();
      repo = createRepo();
    });

    describe('getByStatus', () => {
      it('returns items filtered by status', () => {
        const pending = createValidItem({ status: 'pending' });
        const synced = createValidItem({ status: 'synced' });
        const error = createValidItem({ status: 'error' });

        repo.save(pending);
        repo.save(synced);
        repo.save(error);

        expect(repo.getByStatus('pending')).toHaveLength(1);
        expect(repo.getByStatus('synced')).toHaveLength(1);
        expect(repo.getByStatus('error')).toHaveLength(1);
      });
    });

    describe('getPending', () => {
      it('returns pending and error items', () => {
        const pending = createValidItem({ status: 'pending' });
        const error = createValidItem({ status: 'error' });
        const synced = createValidItem({ status: 'synced' });

        repo.save(pending);
        repo.save(error);
        repo.save(synced);

        const pendingItems = repo.getPending();
        expect(pendingItems).toHaveLength(2);
        expect(pendingItems.map(i => i.status)).toContain('pending');
        expect(pendingItems.map(i => i.status)).toContain('error');
      });
    });

    describe('getRetryable', () => {
      it('returns error items with retryCount < max', () => {
        const retryable = createValidItem({ status: 'error', retryCount: 2 });
        const exhausted = createValidItem({ status: 'error', retryCount: 5 });
        const pending = createValidItem({ status: 'pending' });

        repo.save(retryable);
        repo.save(exhausted);
        repo.save(pending);

        const retryableItems = repo.getRetryable(5);
        expect(retryableItems).toHaveLength(1);
        expect(retryableItems[0].idempotency_key).toBe(retryable.idempotency_key);
      });
    });

    describe('updateStatus', () => {
      it('updates status and metadata', () => {
        const item = createValidItem();
        repo.save(item);

        const result = repo.updateStatus(item.idempotency_key, 'synced', {
          syncedAt: '2024-01-01T00:00:00Z',
        });

        expect(result).toBe(true);
        const updated = repo.findById(item.idempotency_key);
        expect(updated?.status).toBe('synced');
        expect(updated?.syncedAt).toBe('2024-01-01T00:00:00Z');
      });

      it('returns false for non-existent item', () => {
        const result = repo.updateStatus(generateUUID(), 'synced');
        expect(result).toBe(false);
      });
    });

    describe('markSynced', () => {
      it('marks item as synced with timestamp', () => {
        const item = createValidItem();
        repo.save(item);

        const result = repo.markSynced(item.idempotency_key);

        expect(result).toBe(true);
        const updated = repo.findById(item.idempotency_key);
        expect(updated?.status).toBe('synced');
        expect(updated?.syncedAt).toBeDefined();
      });
    });

    describe('markError', () => {
      it('marks item as error with message and increments retry count', () => {
        const item = createValidItem({ retryCount: 2 });
        repo.save(item);

        const result = repo.markError(item.idempotency_key, 'Network timeout');

        expect(result).toBe(true);
        const updated = repo.findById(item.idempotency_key);
        expect(updated?.status).toBe('error');
        expect(updated?.retryCount).toBe(3);
        expect(updated?.lastError).toBe('Network timeout');
        expect(updated?.lastRetryAt).toBeDefined();
      });
    });
  });

  describe(`${name} - Statistics`, () => {
    let repo: ProgressRepository;

    beforeEach(() => {
      cleanup();
      repo = createRepo();
    });

    describe('getStats', () => {
      it('returns correct statistics', () => {
        repo.save(createValidItem({ status: 'pending' }));
        repo.save(createValidItem({ status: 'pending' }));
        repo.save(createValidItem({ status: 'error' }));
        repo.save(createValidItem({ status: 'synced' }));

        const stats = repo.getStats();

        expect(stats.total).toBe(4);
        expect(stats.pending).toBe(2);
        expect(stats.error).toBe(1);
        expect(stats.synced).toBe(1);
        expect(stats.deadLetters).toBe(0);
      });
    });
  });

  describe(`${name} - Dead Letter Queue`, () => {
    let repo: ProgressRepository;

    beforeEach(() => {
      cleanup();
      repo = createRepo();
    });

    describe('addDeadLetter', () => {
      it('adds item to dead letter queue and removes from main', () => {
        const item = createValidItem();
        repo.save(item);

        const deadLetter: DeadLetterItem = {
          item,
          finalError: 'Max retries exceeded',
          totalAttempts: 5,
          failedAt: new Date().toISOString(),
        };

        repo.addDeadLetter(deadLetter);

        expect(repo.getDeadLetters()).toHaveLength(1);
        expect(repo.getAll()).toHaveLength(0);
      });
    });

    describe('getDeadLetters', () => {
      it('returns all dead letters', () => {
        const item1 = createValidItem();
        const item2 = createValidItem();

        repo.addDeadLetter({
          item: item1,
          finalError: 'Failed',
          totalAttempts: 5,
          failedAt: new Date().toISOString(),
        });
        repo.addDeadLetter({
          item: item2,
          finalError: 'Failed',
          totalAttempts: 5,
          failedAt: new Date().toISOString(),
        });

        expect(repo.getDeadLetters()).toHaveLength(2);
      });

      it('filters by profile_id when provided', () => {
        const profile1 = generateUUID();
        const profile2 = generateUUID();
        const item1 = createValidItem({ profile_id: profile1 });
        const item2 = createValidItem({ profile_id: profile2 });

        repo.addDeadLetter({
          item: item1,
          finalError: 'Failed',
          totalAttempts: 5,
          failedAt: new Date().toISOString(),
        });
        repo.addDeadLetter({
          item: item2,
          finalError: 'Failed',
          totalAttempts: 5,
          failedAt: new Date().toISOString(),
        });

        const profile1DeadLetters = repo.getDeadLetters(profile1);
        expect(profile1DeadLetters).toHaveLength(1);
        expect(profile1DeadLetters[0].item.profile_id).toBe(profile1);
      });
    });

    describe('removeDeadLetter', () => {
      it('removes dead letter and returns true', () => {
        const item = createValidItem();
        repo.addDeadLetter({
          item,
          finalError: 'Failed',
          totalAttempts: 5,
          failedAt: new Date().toISOString(),
        });

        const result = repo.removeDeadLetter(item.idempotency_key);

        expect(result).toBe(true);
        expect(repo.getDeadLetters()).toHaveLength(0);
      });

      it('returns false for non-existent dead letter', () => {
        const result = repo.removeDeadLetter(generateUUID());
        expect(result).toBe(false);
      });
    });

    describe('retryDeadLetter', () => {
      it('moves dead letter back to pending queue with reset retry count', () => {
        const item = createValidItem({ retryCount: 5, status: 'error' });
        repo.addDeadLetter({
          item,
          finalError: 'Failed',
          totalAttempts: 5,
          failedAt: new Date().toISOString(),
        });

        const result = repo.retryDeadLetter(item.idempotency_key);

        expect(result).toBe(true);
        expect(repo.getDeadLetters()).toHaveLength(0);
        expect(repo.getPending()).toHaveLength(1);

        const retried = repo.findById(item.idempotency_key);
        expect(retried?.status).toBe('pending');
        expect(retried?.retryCount).toBe(0);
        expect(retried?.lastError).toBeUndefined();
      });

      it('returns false for non-existent dead letter', () => {
        const result = repo.retryDeadLetter(generateUUID());
        expect(result).toBe(false);
      });
    });

    describe('getDeadLetterCount', () => {
      it('returns correct count', () => {
        expect(repo.getDeadLetterCount()).toBe(0);

        repo.addDeadLetter({
          item: createValidItem(),
          finalError: 'Failed',
          totalAttempts: 5,
          failedAt: new Date().toISOString(),
        });

        expect(repo.getDeadLetterCount()).toBe(1);
      });
    });
  });

  describe(`${name} - Subscription`, () => {
    let repo: ProgressRepository;

    beforeEach(() => {
      cleanup();
      repo = createRepo();
    });

    it('notifies subscribers on changes', () => {
      const callback = vi.fn();
      const unsubscribe = repo.subscribe!(callback);

      repo.save(createValidItem());

      expect(callback).toHaveBeenCalled();

      unsubscribe();
    });

    it('stops notifying after unsubscribe', () => {
      const callback = vi.fn();
      const unsubscribe = repo.subscribe!(callback);

      // First, verify subscription works
      repo.save(createValidItem());
      expect(callback).toHaveBeenCalledTimes(1);

      // Unsubscribe
      unsubscribe();

      // Save again - should not trigger callback
      repo.save(createValidItem());
      expect(callback).toHaveBeenCalledTimes(1); // Still 1, not 2
    });
  });
}

// Run tests for both implementations
describe('ProgressRepository Implementations', () => {
  // InMemory tests
  runRepositoryTests(
    'InMemoryProgressRepository',
    () => new InMemoryProgressRepository(),
    () => {}
  );

  // LocalStorage tests
  runRepositoryTests(
    'LocalStorageProgressRepository',
    () => new LocalStorageProgressRepository('test:progress:v1', 'test:dead:v1'),
    () => {
      localStorage.clear();
    }
  );
});
