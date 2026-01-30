import { describe, expect, it } from 'vitest';
import { hitTestRects } from '../hitTest';

describe('hitTestRects', () => {
  it('returns the index of the first rect containing the point', () => {
    const rects = [
      { left: 0, top: 0, right: 10, bottom: 10 },
      { left: 20, top: 0, right: 30, bottom: 10 },
    ];
    expect(hitTestRects({ x: 5, y: 5 }, rects)).toBe(0);
    expect(hitTestRects({ x: 25, y: 5 }, rects)).toBe(1);
  });

  it('returns null when the point hits no rect', () => {
    const rects = [{ left: 0, top: 0, right: 10, bottom: 10 }];
    expect(hitTestRects({ x: 11, y: 5 }, rects)).toBeNull();
  });
});

