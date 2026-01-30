import { describe, it, expect, beforeEach } from 'vitest';
import { progressQueue, ProgressItem } from '../progressQueue';

beforeEach(() => {
  localStorage.clear();
});

describe('progressQueue', () => {
  it('enqueues and returns pending items', () => {
    const item: ProgressItem = {
      idempotency_key: 'k1',
      profile_id: 'p1',
      activity_type: 'letter_tracing',
      content_id: 'A',
      score: 80,
      timestamp: new Date().toISOString(),
    };

    progressQueue.enqueue(item);

    const pending = progressQueue.getPending('p1');
    expect(pending.length).toBe(1);
    expect(pending[0].idempotency_key).toBe('k1');
  });

  it('marks item as synced', () => {
    const item: ProgressItem = {
      idempotency_key: 'k2',
      profile_id: 'p1',
      activity_type: 'letter_tracing',
      content_id: 'B',
      score: 70,
      timestamp: new Date().toISOString(),
    };
    progressQueue.enqueue(item);
    progressQueue.markSynced('k2');
    const pending = progressQueue.getPending('p1');
    expect(pending.length).toBe(0);
  });
});
