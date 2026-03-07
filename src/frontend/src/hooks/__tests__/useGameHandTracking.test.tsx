import React, { useRef, useEffect } from 'react';
import { render, screen, act } from '@testing-library/react';
import { vi } from 'vitest';
import useGameHandTracking, { resolveHandTrackingRuntimeMode } from '../useGameHandTracking';

// mocks (same as before)
vi.mock('../useHandTracking', () => ({
  useHandTracking: () => ({
    landmarker: null,
    isLoading: false,
    error: null,
    isReady: true,
    initialize: vi.fn(async () => {}),
    reset: vi.fn(async () => {}),
  }),
}));

vi.mock('../useVisionWorkerRuntime', () => ({
  useVisionWorkerRuntime: () => ({
    isReady: true,
    error: null,
    isLoading: false,
    supportsWorkerRuntime: false,
  }),
}));

vi.mock('../useGameLoop', () => ({ useGameLoop: () => {} }));
vi.mock('./useFeatureFlag', () => ({ useFeatureFlag: () => false }));
vi.mock('react-webcam', () => ({ __esModule: true, default: vi.fn(() => null) }));

const defaultOpts = { gameName: 'Test' };

describe('useGameHandTracking', () => {
  function HookTester(props: any) {
    const ref = useRef<any>(null);
    ref.current = useGameHandTracking(props.opts);
    // expose to window for inspection
    (window as any).hookResult = ref.current;
    return null;
  }

  it('returns default shape and allows start/stop', async () => {
    render(<HookTester opts={defaultOpts} />);
    const result = (window as any).hookResult;
    // initial hook is not ready until tracking started
    expect(result.isReady).toBe(false);
    expect(result.cursor).toBeNull();
    expect(typeof result.startTracking).toBe('function');

    await act(async () => {
      await result.startTracking();
    });

    act(() => {
      result.stopTracking();
    });

    expect(result.isTracking).not.toBeDefined();
  });

  it('resolveHandTrackingRuntimeMode logic', () => {
    expect(resolveHandTrackingRuntimeMode({ workerSupported: false })).toBe('main-thread');
    expect(resolveHandTrackingRuntimeMode({ requestedMode: 'main-thread', workerSupported: true })).toBe('main-thread');
  });
});