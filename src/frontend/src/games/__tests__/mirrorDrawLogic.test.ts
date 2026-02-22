import { describe, expect, it } from 'vitest';

import {
  LEVELS,
  TEMPLATES,
  calculateMatchScore,
  getStars,
  getTemplatesForLevel,
  mirrorPoint,
  samplePoints,
} from '../mirrorDrawLogic';

describe('TEMPLATES', () => {
  it('has 20 total templates', () => {
    expect(TEMPLATES).toHaveLength(20);
  });

  it('has 5 templates per level', () => {
    for (const lvl of LEVELS) {
      const count = TEMPLATES.filter((t) => t.level === lvl.level).length;
      expect(count).toBe(5);
    }
  });

  it('all templates have non-empty points', () => {
    for (const t of TEMPLATES) {
      expect(t.points.length).toBeGreaterThanOrEqual(4);
    }
  });

  it('all templates have valid fields', () => {
    for (const t of TEMPLATES) {
      expect(typeof t.id).toBe('string');
      expect(typeof t.name).toBe('string');
      expect(typeof t.emoji).toBe('string');
      expect(t.id.length).toBeGreaterThan(0);
      expect([1, 2, 3, 4]).toContain(t.level);
    }
  });

  it('template points are within 0-1 range', () => {
    for (const t of TEMPLATES) {
      for (const p of t.points) {
        expect(p.x).toBeGreaterThanOrEqual(0);
        expect(p.x).toBeLessThanOrEqual(1);
        expect(p.y).toBeGreaterThanOrEqual(0);
        expect(p.y).toBeLessThanOrEqual(1);
      }
    }
  });
});

describe('LEVELS', () => {
  it('has 4 levels', () => {
    expect(LEVELS).toHaveLength(4);
  });

  it('thresholds increase with level', () => {
    for (let i = 1; i < LEVELS.length; i++) {
      expect(LEVELS[i].passThreshold).toBeGreaterThan(
        LEVELS[i - 1].passThreshold,
      );
    }
  });
});

describe('getTemplatesForLevel', () => {
  it('returns 5 templates for each level', () => {
    for (let level = 1; level <= 4; level++) {
      expect(getTemplatesForLevel(level)).toHaveLength(5);
    }
  });

  it('returns empty for invalid level', () => {
    expect(getTemplatesForLevel(99)).toHaveLength(0);
  });

  it('all returned templates match requested level', () => {
    const level2 = getTemplatesForLevel(2);
    for (const t of level2) {
      expect(t.level).toBe(2);
    }
  });
});

describe('mirrorPoint', () => {
  it('mirrors point across center line x=0.5', () => {
    expect(mirrorPoint({ x: 0.2, y: 0.3 })).toEqual({ x: 0.8, y: 0.3 });
  });

  it('center point stays at center', () => {
    expect(mirrorPoint({ x: 0.5, y: 0.5 })).toEqual({ x: 0.5, y: 0.5 });
  });

  it('preserves y coordinate', () => {
    const result = mirrorPoint({ x: 0.1, y: 0.9 });
    expect(result.y).toBe(0.9);
  });

  it('left edge mirrors to right edge', () => {
    const result = mirrorPoint({ x: 0.0, y: 0.5 });
    expect(result.x).toBeCloseTo(1.0);
  });
});

describe('samplePoints', () => {
  const dense = Array.from({ length: 100 }, (_, i) => ({
    x: i / 100,
    y: i / 100,
  }));

  it('returns requested count', () => {
    expect(samplePoints(dense, 10)).toHaveLength(10);
  });

  it('returns all points if count >= input length', () => {
    const few = [{ x: 0, y: 0 }, { x: 1, y: 1 }];
    expect(samplePoints(few, 5)).toHaveLength(2);
  });

  it('returns empty for empty input', () => {
    expect(samplePoints([], 5)).toHaveLength(0);
  });

  it('returns empty for count <= 0', () => {
    expect(samplePoints(dense, 0)).toHaveLength(0);
  });

  it('first and last points match input endpoints', () => {
    const sampled = samplePoints(dense, 10);
    expect(sampled[0]).toEqual(dense[0]);
    expect(sampled[sampled.length - 1]).toEqual(dense[dense.length - 1]);
  });
});

describe('getStars', () => {
  it('returns 3 stars for 90%+', () => {
    expect(getStars(0.95)).toBe(3);
    expect(getStars(0.90)).toBe(3);
  });

  it('returns 2 stars for 70-89%', () => {
    expect(getStars(0.85)).toBe(2);
    expect(getStars(0.70)).toBe(2);
  });

  it('returns 1 star for 30-69%', () => {
    expect(getStars(0.50)).toBe(1);
    expect(getStars(0.30)).toBe(1);
  });

  it('returns 0 stars for <30%', () => {
    expect(getStars(0.1)).toBe(0);
    expect(getStars(0)).toBe(0);
  });
});

describe('calculateMatchScore', () => {
  it('returns high accuracy for points that exactly match mirrored template', () => {
    const template = TEMPLATES[0]; // heart
    // Mirror the template points to create "perfect" user trace
    const perfectTrace = template.points.map((p) => ({
      x: 1.0 - p.x,
      y: p.y,
    }));
    const result = calculateMatchScore(perfectTrace, template, 1);
    expect(result.accuracy).toBeGreaterThan(0.9);
    expect(result.passed).toBe(true);
    expect(result.stars).toBe(3);
  });

  it('returns low accuracy for far-off points', () => {
    const template = TEMPLATES[0];
    const badTrace = [
      { x: 0.0, y: 0.0 },
      { x: 0.05, y: 0.0 },
      { x: 0.1, y: 0.0 },
    ];
    const result = calculateMatchScore(badTrace, template, 1);
    expect(result.accuracy).toBeLessThan(0.3);
  });

  it('returns 0 accuracy for fewer than 3 user points', () => {
    const template = TEMPLATES[0];
    const result = calculateMatchScore([{ x: 0.5, y: 0.5 }], template, 1);
    expect(result.accuracy).toBe(0);
    expect(result.passed).toBe(false);
  });

  it('uses level-specific pass threshold', () => {
    const template = TEMPLATES[0];
    const perfectTrace = template.points.map((p) => ({
      x: 1.0 - p.x,
      y: p.y,
    }));
    // Level 1 threshold is 0.4 — perfect trace should pass
    const result = calculateMatchScore(perfectTrace, template, 1);
    expect(result.passed).toBe(true);
  });

  it('returns valid MatchScore shape', () => {
    const template = TEMPLATES[0];
    const trace = template.points.map((p) => ({ x: 1.0 - p.x, y: p.y }));
    const result = calculateMatchScore(trace, template, 1);
    expect(result.accuracy).toBeGreaterThanOrEqual(0);
    expect(result.accuracy).toBeLessThanOrEqual(1);
    expect([0, 1, 2, 3]).toContain(result.stars);
    expect(typeof result.passed).toBe('boolean');
  });
});
