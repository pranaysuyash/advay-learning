import { describe, expect, it } from 'vitest';
import { getMaxHandsForDifficultyIndex } from './handTrackingConfig';

describe('getMaxHandsForDifficultyIndex', () => {
  it('uses 4 hands for Duo Mode', () => {
    expect(getMaxHandsForDifficultyIndex(3)).toBe(4);
  });

  it('defaults to 2 hands for other levels', () => {
    expect(getMaxHandsForDifficultyIndex(0)).toBe(2);
    expect(getMaxHandsForDifficultyIndex(1)).toBe(2);
    expect(getMaxHandsForDifficultyIndex(2)).toBe(2);
    expect(getMaxHandsForDifficultyIndex(999)).toBe(2);
  });
});

