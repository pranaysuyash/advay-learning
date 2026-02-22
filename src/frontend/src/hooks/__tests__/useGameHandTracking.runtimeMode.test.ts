import { describe, expect, it } from 'vitest';

import { resolveHandTrackingRuntimeMode } from '../useGameHandTracking';

describe('resolveHandTrackingRuntimeMode', () => {
  it('falls back to main-thread when worker is not supported', () => {
    expect(
      resolveHandTrackingRuntimeMode({
        requestedMode: 'worker',
        workerSupported: false,
      }),
    ).toBe('main-thread');
  });

  it('returns worker mode when supported and requested', () => {
    expect(
      resolveHandTrackingRuntimeMode({
        requestedMode: 'worker',
        workerSupported: true,
      }),
    ).toBe('worker');
  });

  it('respects explicit main-thread request', () => {
    expect(
      resolveHandTrackingRuntimeMode({
        requestedMode: 'main-thread',
        workerSupported: true,
      }),
    ).toBe('main-thread');
  });
});
