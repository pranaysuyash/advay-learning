import { describe, it, expect, beforeEach } from 'vitest';
import { progressQueue, ProgressItem } from '../progressQueue';
import { MAX_QUEUE_SIZE } from '../progressConstants';

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

beforeEach(() => {
  localStorage.clear();
  progressQueue.clear();
});

describe('progressQueue', () => {
  describe('enqueue', () => {
    it('enqueues valid item and returns success', () => {
      const item = createValidItem();

      const result = progressQueue.enqueue(item);

      expect(result.success).toBe(true);
      expect(result.item.status).toBe('pending');
      
      const pending = progressQueue.getPending(item.profile_id);
      expect(pending.length).toBe(1);
      expect(pending[0].idempotency_key).toBe(item.idempotency_key);
    });

    it('rejects item with invalid UUID format', () => {
      const item = createValidItem({ idempotency_key: 'invalid-uuid' });

      const result = progressQueue.enqueue(item);

      expect(result.success).toBe(false);
      expect(result.error).toContain('idempotency_key');
      expect(progressQueue.getPending()).toHaveLength(0);
    });

    it('rejects item with missing required fields', () => {
      const item = {
        idempotency_key: generateUUID(),
        // missing profile_id, activity_type, etc.
      } as ProgressItem;

      const result = progressQueue.enqueue(item);

      expect(result.success).toBe(false);
      expect(result.error).toContain('profile_id');
    });

    it('rejects item with score out of bounds', () => {
      const item = createValidItem({ score: -10 });

      const result = progressQueue.enqueue(item);

      expect(result.success).toBe(false);
      expect(result.error).toContain('score');
    });

    it('rejects duplicate idempotency_key', () => {
      const id = generateUUID();
      const item1 = createValidItem({ idempotency_key: id });
      const item2 = createValidItem({ idempotency_key: id });

      progressQueue.enqueue(item1);
      const result = progressQueue.enqueue(item2);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Duplicate');
      expect(progressQueue.getPending()).toHaveLength(1);
    });

    it('enforces MAX_QUEUE_SIZE by dropping oldest item', () => {
      // Fill queue to capacity
      for (let i = 0; i < MAX_QUEUE_SIZE; i++) {
        progressQueue.enqueue(createValidItem({ idempotency_key: generateUUID() }));
      }
      
      expect(progressQueue.getPending()).toHaveLength(MAX_QUEUE_SIZE);
      
      // Add one more - should drop oldest
      const newItem = createValidItem({ content_id: 'newest' });
      progressQueue.enqueue(newItem);
      
      expect(progressQueue.getPending()).toHaveLength(MAX_QUEUE_SIZE);
      
      // Verify newest is present
      const items = progressQueue.getPending();
      expect(items.some(i => i.content_id === 'newest')).toBe(true);
    });

    it('accepts valid optional fields', () => {
      const item = createValidItem({
        duration_seconds: 120,
        completed: true,
        meta_data: { letter: 'A', accuracy: 95 },
      });

      const result = progressQueue.enqueue(item);

      expect(result.success).toBe(true);
      const pending = progressQueue.getPending();
      expect(pending[0].duration_seconds).toBe(120);
      expect(pending[0].completed).toBe(true);
    });
  });

  describe('getPending', () => {
    it('returns only pending items', () => {
      const item1 = createValidItem();
      const item2 = createValidItem();
      
      progressQueue.enqueue(item1);
      progressQueue.enqueue(item2);
      progressQueue.markSynced(item1.idempotency_key);

      const pending = progressQueue.getPending();

      expect(pending).toHaveLength(1);
      expect(pending[0].idempotency_key).toBe(item2.idempotency_key);
    });

    it('filters by profile_id', () => {
      const profile1 = generateUUID();
      const profile2 = generateUUID();
      
      progressQueue.enqueue(createValidItem({ profile_id: profile1 }));
      progressQueue.enqueue(createValidItem({ profile_id: profile2 }));

      const pending = progressQueue.getPending(profile1);

      expect(pending).toHaveLength(1);
      expect(pending[0].profile_id).toBe(profile1);
    });
  });

  describe('getPendingCount', () => {
    it('returns count of pending items', () => {
      progressQueue.enqueue(createValidItem());
      progressQueue.enqueue(createValidItem());

      expect(progressQueue.getPendingCount()).toBe(2);
    });
  });

  describe('markSynced', () => {
    it('marks item as synced', () => {
      const item = createValidItem();
      progressQueue.enqueue(item);
      
      progressQueue.markSynced(item.idempotency_key);

      const pending = progressQueue.getPending();
      expect(pending).toHaveLength(0);
    });

    it('handles non-existent idempotency_key gracefully', () => {
      // Should not throw
      expect(() => progressQueue.markSynced(generateUUID())).not.toThrow();
    });
  });

  describe('markError', () => {
    it('marks item as error with message', () => {
      const item = createValidItem();
      progressQueue.enqueue(item);
      
      progressQueue.markError(item.idempotency_key, 'Network timeout');

      // Error items are not pending
      expect(progressQueue.getPending()).toHaveLength(0);
      
      // But item is still in storage with error status
      const allItems = JSON.parse(localStorage.getItem('advay:progressQueue:v1') || '[]');
      const errorItem = allItems.find((i: ProgressItem) => i.idempotency_key === item.idempotency_key);
      expect(errorItem.status).toBe('error');
      expect(errorItem.lastError).toBe('Network timeout');
    });
  });

  describe('clear', () => {
    it('removes all items', () => {
      progressQueue.enqueue(createValidItem());
      progressQueue.enqueue(createValidItem());

      progressQueue.clear();

      expect(progressQueue.getPending()).toHaveLength(0);
      expect(localStorage.getItem('advay:progressQueue:v1')).toBeNull();
    });
  });

  describe('subscribe', () => {
    it('notifies subscribers on change', () => {
      const callback = vi.fn();
      progressQueue.subscribe(callback);

      progressQueue.enqueue(createValidItem());

      expect(callback).toHaveBeenCalled();
    });

    it('unsubscribe removes listener', () => {
      const callback = vi.fn();
      const unsubscribe = progressQueue.subscribe(callback);

      unsubscribe();
      progressQueue.enqueue(createValidItem());

      expect(callback).not.toHaveBeenCalled();
    });
  });
});
