/**
 * useGameSubscription Tests
 *
 * @ticket GQ-002
 * @see docs/audit/src__frontend__src__hooks__useGameSubscription.ts.md
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useGameSubscription } from '../useGameSubscription';

// Mock useSubscription with controllable state
const mockCanAccessGame = vi.fn();
let mockIsLoading = false;
let mockStatusSource: string | null = null;
let mockErrorReason: string | null = null;

vi.mock('../useSubscription', () => ({
  useSubscription: () => ({
    canAccessGame: mockCanAccessGame,
    isLoading: mockIsLoading,
    statusSource: mockStatusSource,
    errorReason: mockErrorReason,
  }),
}));

describe('useGameSubscription', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCanAccessGame.mockImplementation((gameId: string) => gameId === 'allowed-game');
    mockIsLoading = false;
    mockStatusSource = null;
    mockErrorReason = null;
  });

  // ==========================================================================
  // Basic Access Control Tests
  // ==========================================================================

  it('returns hasAccess=true for allowed game', () => {
    const { result } = renderHook(() => useGameSubscription('allowed-game'));

    expect(result.current.hasAccess).toBe(true);
    expect(result.current.gameId).toBe('allowed-game');
  });

  it('returns hasAccess=false for denied game', () => {
    const { result } = renderHook(() => useGameSubscription('denied-game'));

    expect(result.current.hasAccess).toBe(false);
  });

  it('returns hasAccess=false during loading', () => {
    mockIsLoading = true;

    const { result } = renderHook(() => useGameSubscription('any-game'));

    expect(result.current.isLoading).toBe(true);
    expect(result.current.hasAccess).toBe(false);
  });

  // ==========================================================================
  // Error State Tests
  // ==========================================================================

  it('returns error for api_error status', () => {
    mockStatusSource = 'api_error';
    mockErrorReason = 'Network timeout';

    const { result } = renderHook(() => useGameSubscription('test-game'));

    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe('Network timeout');
  });

  it('returns error for invalid_plan status', () => {
    mockStatusSource = 'invalid_plan';
    mockErrorReason = 'Subscription expired';

    const { result } = renderHook(() => useGameSubscription('test-game'));

    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe('Subscription expired');
  });

  it('returns null error when no error status', () => {
    mockStatusSource = null;

    const { result } = renderHook(() => useGameSubscription('test-game'));

    expect(result.current.error).toBeNull();
  });

  it('uses default error message when errorReason is null', () => {
    mockStatusSource = 'api_error';
    mockErrorReason = null;

    const { result } = renderHook(() => useGameSubscription('test-game'));

    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe(
      'Subscription service is temporarily unavailable.',
    );
  });

  // ==========================================================================
  // Error Object Stability Tests (FIND-001)
  // ==========================================================================

  it('maintains stable error reference when error state unchanged', () => {
    mockStatusSource = 'api_error';
    mockErrorReason = 'Same error';

    const { result, rerender } = renderHook(() =>
      useGameSubscription('test-game'),
    );

    const firstError = result.current.error;
    rerender();
    const secondError = result.current.error;

    expect(firstError).toBe(secondError);
  });

  it('creates new error reference when error state changes', () => {
    mockStatusSource = 'api_error';
    mockErrorReason = 'First error';

    const { result, rerender } = renderHook(() =>
      useGameSubscription('test-game'),
    );

    const firstError = result.current.error;

    // Change the error state
    mockErrorReason = 'Second error';
    rerender();

    const secondError = result.current.error;

    expect(firstError).not.toBe(secondError);
    expect(secondError?.message).toBe('Second error');
  });
});
