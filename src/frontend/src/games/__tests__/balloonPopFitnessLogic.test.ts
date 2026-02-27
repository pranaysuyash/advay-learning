import { describe, expect, it } from 'vitest';

import {
  GAME_CONFIG,
  initializeGame,
  shouldAdvanceLevel,
} from '../balloonPopFitnessLogic';

describe('balloonPopFitnessLogic.shouldAdvanceLevel', () => {
  it('does not advance at game start', () => {
    const state = initializeGame(1);
    expect(shouldAdvanceLevel(state)).toBe(false);
  });

  it('advances level 1 at the first level boundary', () => {
    const state = {
      ...initializeGame(1),
      timeRemaining: GAME_CONFIG.GAME_DURATION - GAME_CONFIG.LEVEL_DURATION,
    };
    expect(shouldAdvanceLevel(state)).toBe(true);
  });

  it('does not advance level 2 before the second boundary', () => {
    const state = {
      ...initializeGame(2),
      timeRemaining: 1000,
    };
    expect(shouldAdvanceLevel(state)).toBe(false);
  });

  it('never advances when the timer has reached zero', () => {
    const state = {
      ...initializeGame(2),
      timeRemaining: 0,
      gameActive: false,
    };
    expect(shouldAdvanceLevel(state)).toBe(false);
  });
});
