import { describe, expect, it, vi, beforeEach } from 'vitest';

import { supportsHaptics, triggerHaptic } from '../haptics';

describe('haptics', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('reports unsupported when vibrate is missing', () => {
    const original = (navigator as Navigator & { vibrate?: unknown }).vibrate;
    Object.defineProperty(navigator, 'vibrate', {
      configurable: true,
      value: undefined,
    });

    expect(supportsHaptics()).toBe(false);

    Object.defineProperty(navigator, 'vibrate', {
      configurable: true,
      value: original,
    });
  });

  it('uses default pattern for success', () => {
    const vibrate = vi.fn();
    Object.defineProperty(navigator, 'vibrate', {
      configurable: true,
      value: vibrate,
    });

    triggerHaptic('success');

    expect(vibrate).toHaveBeenCalledWith([50, 30, 50]);
  });

  it('uses custom pattern when provided', () => {
    const vibrate = vi.fn();
    Object.defineProperty(navigator, 'vibrate', {
      configurable: true,
      value: vibrate,
    });

    triggerHaptic('error', [10, 20, 30]);

    expect(vibrate).toHaveBeenCalledWith([10, 20, 30]);
  });
});
