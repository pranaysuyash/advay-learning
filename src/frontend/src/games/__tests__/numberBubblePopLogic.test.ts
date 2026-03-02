import { describe, expect, it } from 'vitest';
import { generateBubbles } from '../numberBubblePopLogic';

describe('numberBubblePopLogic', () => {
  it('always returns the requested bubble count', () => {
    const bubbles = generateBubbles(5, 1, 2);

    expect(bubbles).toHaveLength(5);
    expect(
      bubbles.every((bubble) => typeof bubble.number === 'number'),
    ).toBe(true);
  });

  it('keeps generated values inside the requested range', () => {
    const bubbles = generateBubbles(8, 3, 4);

    expect(
      bubbles.every((bubble) => bubble.number >= 1 && bubble.number <= 4),
    ).toBe(true);
  });
});
