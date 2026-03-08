import { expect } from 'vitest';

import type {
  VisionProvider,
  VisionProviderStatus,
  VisionResult,
  VisionTask,
} from '../VisionProvider';

export interface VisionProviderHarnessOptions {
  provider: VisionProvider;
  task: VisionTask;
  makeVideoElement?: () => HTMLVideoElement;
  assertResult?: (result: VisionResult | null) => void;
}

/**
 * Reusable provider contract harness.
 *
 * This executes a common lifecycle used by all VisionProvider implementations:
 * init -> ready check -> detect -> callback contract -> dispose.
 */
export async function runVisionProviderHarness(
  options: VisionProviderHarnessOptions,
): Promise<void> {
  const {
    provider,
    task,
    makeVideoElement = () => document.createElement('video'),
    assertResult,
  } = options;

  // starts uninitialized for provider contract consistency
  const initialStatus = provider.getStatus();
  expect(['uninitialized', 'loading', 'ready', 'error']).toContain(
    initialStatus,
  );

  let seenResult: VisionResult | null = null;
  let seenError: Error | null = null;

  provider.onResult((result) => {
    seenResult = result;
  });

  provider.onError((error) => {
    seenError = error;
  });

  const initialized = await provider.init(task);
  expect(typeof initialized).toBe('boolean');

  if (!initialized) {
    // If init fails, provider should report error-like status and not be ready.
    const status = provider.getStatus() as VisionProviderStatus;
    expect(['error', 'uninitialized']).toContain(status);
    expect(provider.isReady(task)).toBe(false);
    provider.dispose();
    return;
  }

  expect(provider.isReady(task)).toBe(true);
  expect(provider.getStatus()).toBe('ready');

  const result = provider.detect(task, makeVideoElement());

  if (assertResult) {
    assertResult(result);
  } else {
    // default assertion: result is either null (graceful no data) or has timestamp
    if (result) {
      expect(result.timestamp).toBeGreaterThanOrEqual(0);
    }
  }

  // callback should either receive result or remain null if provider has no detections
  if (result) {
    expect(seenResult).not.toBeNull();
  }

  // no unexpected errors during normal harness run
  expect(seenError).toBeNull();

  provider.dispose();
  expect(provider.getStatus()).toBe('uninitialized');
  expect(provider.isReady(task)).toBe(false);
}
