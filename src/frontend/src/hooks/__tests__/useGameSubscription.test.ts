/**
 * useGameSubscription Tests
 * 
 * @ticket GQ-002
 */

import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useGameSubscription } from '../useGameSubscription';

vi.mock('../useSubscription', () => ({
  useSubscription: vi.fn(() => ({
    canAccessGame: vi.fn((gameId: string) => gameId === 'allowed-game'),
    isLoading: false,
    error: null,
  })),
}));

describe('useGameSubscription', () => {
  it('should return hasAccess=true for allowed game', () => {
    const { result } = renderHook(() => useGameSubscription('allowed-game'));
    
    expect(result.current.hasAccess).toBe(true);
    expect(result.current.gameId).toBe('allowed-game');
  });

  it('should return hasAccess=false for denied game', () => {
    const { result } = renderHook(() => useGameSubscription('denied-game'));
    
    expect(result.current.hasAccess).toBe(false);
  });

  it('should return isLoading state', () => {
    const { result } = renderHook(() => useGameSubscription('any-game'));
    
    expect(typeof result.current.isLoading).toBe('boolean');
  });
});
