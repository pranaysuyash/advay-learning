/**
 * Progress Repository Test Helpers
 *
 * Factory functions and utilities for creating testable progress queue
 * instances with isolated in-memory repositories.
 *
 * @ticket ISSUE-008 - Testability refactor
 */

import { createProgressQueue, ProgressItem, ProgressQueue } from '../../services/progressQueue';
import { InMemoryProgressRepository } from '../InMemoryProgressRepository';
import { ProgressRepository } from '../ProgressRepository';

/**
 * Generate a valid UUID v4 for testing
 */
export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Create a valid progress item with optional overrides
 */
export function createValidItem(overrides: Partial<ProgressItem> = {}): ProgressItem {
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

/**
 * Create a progress item with specific status
 */
export function createItemWithStatus(
  status: ProgressItem['status'],
  overrides: Partial<ProgressItem> = {}
): ProgressItem {
  return createValidItem({
    status,
    ...overrides,
  });
}

/**
 * Factory function to create an isolated progress queue for testing
 *
 * This is the PREFERRED way to create progress queues in tests.
 * It ensures complete isolation between tests.
 *
 * @example
 * ```typescript
 * const { queue, repo } = makeFreshQueue();
 * queue.enqueue(item);
 * expect(repo.getPending()).toHaveLength(1);
 * ```
 */
export function makeFreshQueue(): {
  queue: ProgressQueue;
  repo: InMemoryProgressRepository;
} {
  const repo = new InMemoryProgressRepository();
  const queue = createProgressQueue(repo);
  return { queue, repo };
}

/**
 * Create a progress queue pre-populated with items
 *
 * @example
 * ```typescript
 * const { queue, repo } = makeQueueWithItems([
 *   createValidItem(),
 *   createItemWithStatus('synced'),
 * ]);
 * ```
 */
export function makeQueueWithItems(
  items: ProgressItem[]
): {
  queue: ProgressQueue;
  repo: InMemoryProgressRepository;
} {
  const { queue, repo } = makeFreshQueue();
  for (const item of items) {
    repo.save(item);
  }
  return { queue, repo };
}

/**
 * Create a progress queue with a specific state for testing scenarios
 *
 * @example
 * ```typescript
 * const { queue } = makeQueueWithState({
 *   pending: 3,
 *   synced: 2,
 *   error: 1,
 * });
 * ```
 */
export function makeQueueWithState(state: {
  pending?: number;
  synced?: number;
  error?: number;
  deadLetters?: number;
}): {
  queue: ProgressQueue;
  repo: InMemoryProgressRepository;
} {
  const { queue, repo } = makeFreshQueue();
  const profileId = generateUUID();

  for (let i = 0; i < (state.pending || 0); i++) {
    repo.save(createValidItem({
      profile_id: profileId,
      status: 'pending',
    }));
  }

  for (let i = 0; i < (state.synced || 0); i++) {
    repo.save(createValidItem({
      profile_id: profileId,
      status: 'synced',
    }));
  }

  for (let i = 0; i < (state.error || 0); i++) {
    repo.save(createValidItem({
      profile_id: profileId,
      status: 'error',
    }));
  }

  for (let i = 0; i < (state.deadLetters || 0); i++) {
    repo.addDeadLetter({
      item: createValidItem({ profile_id: profileId }),
      failedAt: new Date().toISOString(),
      finalError: 'Test failure',
      totalAttempts: 3,
    });
  }

  return { queue, repo };
}

/**
 * Mock API client for testing sync operations
 */
export function createMockApiClient(options: {
  shouldFail?: boolean;
  failCount?: number;
  statusCode?: number;
} = {}) {
  const { shouldFail = false, failCount = 0, statusCode = 500 } = options;
  let attemptCount = 0;

  return {
    post: vi.fn().mockImplementation(async (url: string, data: any) => {
      attemptCount++;

      if (shouldFail && attemptCount <= failCount) {
        const error = new Error('API Error') as any;
        error.response = {
          status: statusCode,
          data: { detail: 'Test error' },
        };
        throw error;
      }

      return { data: { success: true } };
    }),
    getAttemptCount: () => attemptCount,
    reset: () => {
      attemptCount = 0;
    },
  };
}

/**
 * Wait for async operations to complete
 */
export function tick(ms = 0): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Assert that two dates are within acceptable range (for timing tests)
 */
export function expectDatesClose(
  actual: Date | string | null,
  expected: Date | string,
  toleranceMs = 1000
): void {
  const actualDate = actual ? new Date(actual).getTime() : 0;
  const expectedDate = new Date(expected).getTime();
  const diff = Math.abs(actualDate - expectedDate);
  expect(diff).toBeLessThan(toleranceMs);
}

// Re-export for convenience
export { InMemoryProgressRepository, ProgressRepository };
