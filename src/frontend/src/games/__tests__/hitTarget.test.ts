import { describe, expect, it } from 'vitest';

import { findHitTarget } from '../hitTarget';

describe('findHitTarget', () => {
  const targets = [
    { id: 'a', position: { x: 0.2, y: 0.2 } },
    { id: 'b', position: { x: 0.8, y: 0.8 } },
  ];

  it('returns matching target when point is inside radius', () => {
    const hit = findHitTarget({ x: 0.22, y: 0.22 }, targets, 0.05);
    expect(hit?.id).toBe('a');
  });

  it('returns null when no target is hit', () => {
    const hit = findHitTarget({ x: 0.5, y: 0.5 }, targets, 0.05);
    expect(hit).toBeNull();
  });

  it('returns null when radius is invalid', () => {
    const hit = findHitTarget({ x: 0.2, y: 0.2 }, targets, 0);
    expect(hit).toBeNull();
  });
});
