/**
 * useFallbackControls Tests - ISSUE-001
 * 
 * Tests for tap/dwell/snap fallback control system.
 * 
 * @ticket ISSUE-001
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFallbackControls } from '../useFallbackControls';

describe('useFallbackControls', () => {
  const mockContainer = {
    getBoundingClientRect: () => ({
      left: 0,
      top: 0,
      right: 800,
      bottom: 600,
      width: 800,
      height: 600,
    }),
  };

  const mockContainerRef = { current: mockContainer as unknown as HTMLElement };

  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('should initialize with disabled state', () => {
    const { result } = renderHook(() => useFallbackControls({
      enabled: false,
    }));

    expect(result.current.cursor).toBeNull();
    expect(result.current.isDwelling).toBe(false);
    expect(result.current.dwellProgress).toBe(0);
    expect(result.current.snappedTargetId).toBeNull();
  });

  it('should enable and disable controls', () => {
    const { result } = renderHook(() => useFallbackControls({
      enabled: false,
    }));

    act(() => {
      result.current.enable();
    });

    // Should be enabled (internal state, cursor still null until pointer move)

    act(() => {
      result.current.disable();
    });

    expect(result.current.cursor).toBeNull();
    expect(result.current.isDwelling).toBe(false);
  });

  it('should expose handler functions', () => {
    const { result } = renderHook(() => useFallbackControls({
      enabled: true,
    }));

    expect(typeof result.current.handlers.onPointerMove).toBe('function');
    expect(typeof result.current.handlers.onPointerDown).toBe('function');
    expect(typeof result.current.handlers.onPointerUp).toBe('function');
    expect(typeof result.current.handlers.onPointerLeave).toBe('function');
  });

  it('should calculate snap targets correctly', () => {
    const onDwellSelect = vi.fn();
    const { result } = renderHook(() => useFallbackControls({
      enabled: true,
      containerRef: mockContainerRef,
      snap: {
        snapRadiusPx: 50,
        targets: [
          { x: 100, y: 100, id: 'target-1' },
          { x: 300, y: 300, id: 'target-2' },
        ],
      },
      onDwellSelect,
    }));

    // Simulate pointer move near target-1
    act(() => {
      result.current.handlers.onPointerMove({
        clientX: 105,
        clientY: 105,
      } as PointerEvent);
    });

    // Should snap to target-1 (within 50px radius)
    expect(result.current.snappedTargetId).toBe('target-1');
  });

  it('should not snap when outside radius', () => {
    const { result } = renderHook(() => useFallbackControls({
      enabled: true,
      containerRef: mockContainerRef,
      snap: {
        snapRadiusPx: 20,
        targets: [
          { x: 100, y: 100, id: 'target-1' },
        ],
      },
    }));

    // Simulate pointer move far from target
    act(() => {
      result.current.handlers.onPointerMove({
        clientX: 500,
        clientY: 500,
      } as PointerEvent);
    });

    expect(result.current.snappedTargetId).toBeNull();
  });

  it('should trigger dwell selection after dwell time', () => {
    const onDwellSelect = vi.fn();
    const onProgress = vi.fn();
    
    const { result } = renderHook(() => useFallbackControls({
      enabled: true,
      containerRef: mockContainerRef,
      dwell: {
        dwellTimeMs: 400,
        onProgress,
      },
      snap: {
        snapRadiusPx: 50,
        targets: [{ x: 100, y: 100, id: 'target-1' }],
      },
      onDwellSelect,
    }));

    // Move to target
    act(() => {
      result.current.handlers.onPointerMove({
        clientX: 100,
        clientY: 100,
      } as PointerEvent);
    });

    expect(result.current.isDwelling).toBe(true);

    // Advance past dwell time
    act(() => {
      vi.advanceTimersByTime(400);
    });

    // Should trigger selection
    expect(onDwellSelect).toHaveBeenCalledWith('target-1');
  });

  it('should cancel dwell when moving away', () => {
    const onDwellSelect = vi.fn();
    
    const { result } = renderHook(() => useFallbackControls({
      enabled: true,
      containerRef: mockContainerRef,
      dwell: {
        dwellTimeMs: 400,
      },
      snap: {
        snapRadiusPx: 50,
        targets: [{ x: 100, y: 100, id: 'target-1' }],
      },
      onDwellSelect,
    }));

    // Move to target
    act(() => {
      result.current.handlers.onPointerMove({
        clientX: 100,
        clientY: 100,
      } as PointerEvent);
    });

    expect(result.current.isDwelling).toBe(true);

    // Move away
    act(() => {
      result.current.handlers.onPointerMove({
        clientX: 500,
        clientY: 500,
      } as PointerEvent);
    });

    expect(result.current.isDwelling).toBe(false);
    expect(result.current.dwellProgress).toBe(0);

    // Advance timers
    act(() => {
      vi.advanceTimersByTime(500);
    });

    // Should not trigger
    expect(onDwellSelect).not.toHaveBeenCalled();
  });

  it('should handle pointer down for immediate selection', () => {
    const onDwellSelect = vi.fn();
    
    const { result } = renderHook(() => useFallbackControls({
      enabled: true,
      containerRef: mockContainerRef,
      snap: {
        snapRadiusPx: 50,
        targets: [{ x: 100, y: 100, id: 'target-1' }],
      },
      onDwellSelect,
    }));

    // Click on target
    act(() => {
      result.current.handlers.onPointerDown({
        clientX: 100,
        clientY: 100,
      } as PointerEvent);
    });

    expect(onDwellSelect).toHaveBeenCalledWith('target-1');
  });

  it('should clear cursor on pointer leave', () => {
    const { result } = renderHook(() => useFallbackControls({
      enabled: true,
      containerRef: mockContainerRef,
    }));

    // Move to set cursor
    act(() => {
      result.current.handlers.onPointerMove({
        clientX: 100,
        clientY: 100,
      } as PointerEvent);
    });

    expect(result.current.cursor).not.toBeNull();

    // Leave
    act(() => {
      result.current.handlers.onPointerLeave();
    });

    expect(result.current.cursor).toBeNull();
  });
});
