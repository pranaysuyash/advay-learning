import { describe, expect, it } from 'vitest';

import {
  BRUSH_TYPES,
  COLORS,
  addPointToStroke,
  createStroke,
  detectShake,
  getBrushConfig,
  getRainbowHue,
  nextBrush,
  nextColor,
} from '../airCanvasLogic';

describe('COLORS', () => {
  it('has 6 entries', () => {
    expect(COLORS).toHaveLength(6);
  });

  it('all entries are hex color strings', () => {
    for (const c of COLORS) {
      expect(c).toMatch(/^#[0-9A-Fa-f]{6}$/);
    }
  });
});

describe('BRUSH_TYPES', () => {
  it('has 4 entries', () => {
    expect(BRUSH_TYPES).toHaveLength(4);
  });
});

describe('nextColor', () => {
  it('cycles to the next color', () => {
    expect(nextColor(COLORS[0])).toBe(COLORS[1]);
    expect(nextColor(COLORS[1])).toBe(COLORS[2]);
  });

  it('wraps around from last to first', () => {
    expect(nextColor(COLORS[COLORS.length - 1])).toBe(COLORS[0]);
  });

  it('returns first color for unknown input', () => {
    expect(nextColor('#000000')).toBe(COLORS[0]);
  });
});

describe('nextBrush', () => {
  it('cycles to the next brush', () => {
    expect(nextBrush('rainbow')).toBe('sparkle');
    expect(nextBrush('sparkle')).toBe('neon');
  });

  it('wraps around from last to first', () => {
    expect(nextBrush('glow')).toBe('rainbow');
  });

  it('returns first brush for unknown input', () => {
    expect(nextBrush('unknown' as never)).toBe('rainbow');
  });
});

describe('createStroke', () => {
  it('creates an empty stroke with correct type and color', () => {
    const stroke = createStroke('neon', '#FF0000');
    expect(stroke.points).toHaveLength(0);
    expect(stroke.brushType).toBe('neon');
    expect(stroke.color).toBe('#FF0000');
  });
});

describe('addPointToStroke', () => {
  it('adds a point to the stroke immutably', () => {
    const s0 = createStroke('rainbow', '#00CC00');
    const s1 = addPointToStroke(s0, 0.5, 0.3, 100);

    expect(s0.points).toHaveLength(0); // original unchanged
    expect(s1.points).toHaveLength(1);
    expect(s1.points[0]).toEqual({ x: 0.5, y: 0.3, timestamp: 100 });
  });

  it('accumulates multiple points', () => {
    let s = createStroke('glow', '#0088FF');
    s = addPointToStroke(s, 0.1, 0.1, 0);
    s = addPointToStroke(s, 0.2, 0.2, 16);
    s = addPointToStroke(s, 0.3, 0.3, 32);
    expect(s.points).toHaveLength(3);
  });
});

describe('detectShake', () => {
  it('returns false for fewer than 4 positions', () => {
    expect(detectShake([{ x: 0, y: 0, t: 0 }])).toBe(false);
    expect(detectShake([])).toBe(false);
  });

  it('returns true for rapid zig-zag movement', () => {
    const positions = [
      { x: 0.0, y: 0.5, t: 0 },
      { x: 0.9, y: 0.5, t: 1 },
      { x: 0.0, y: 0.5, t: 2 },
      { x: 0.9, y: 0.5, t: 3 },
      { x: 0.0, y: 0.5, t: 4 },
    ];
    expect(detectShake(positions)).toBe(true);
  });

  it('returns false for slow movement', () => {
    const positions = [
      { x: 0.50, y: 0.5, t: 0 },
      { x: 0.51, y: 0.5, t: 100 },
      { x: 0.52, y: 0.5, t: 200 },
      { x: 0.53, y: 0.5, t: 300 },
    ];
    expect(detectShake(positions)).toBe(false);
  });

  it('respects custom threshold', () => {
    const positions = [
      { x: 0.0, y: 0.5, t: 0 },
      { x: 0.1, y: 0.5, t: 1 },
      { x: 0.0, y: 0.5, t: 2 },
      { x: 0.1, y: 0.5, t: 3 },
    ];
    // velocity = 0.1/1 = 0.1 per segment
    expect(detectShake(positions, 0.05)).toBe(true);
    expect(detectShake(positions, 0.2)).toBe(false);
  });
});

describe('getRainbowHue', () => {
  it('returns 0 for first point', () => {
    expect(getRainbowHue(0, 10)).toBe(0);
  });

  it('returns value in 0-360 range', () => {
    for (let i = 0; i < 20; i++) {
      const hue = getRainbowHue(i, 20);
      expect(hue).toBeGreaterThanOrEqual(0);
      expect(hue).toBeLessThanOrEqual(360);
    }
  });

  it('returns 0 for zero totalPoints', () => {
    expect(getRainbowHue(5, 0)).toBe(0);
  });

  it('returns 180 for midpoint', () => {
    expect(getRainbowHue(5, 10)).toBe(180);
  });
});

describe('getBrushConfig', () => {
  it('returns valid config for all brush types', () => {
    for (const brush of BRUSH_TYPES) {
      const config = getBrushConfig(brush, '#FF0000');
      expect(config.lineWidth).toBeGreaterThan(0);
      expect(config.shadowBlur).toBeGreaterThan(0);
      expect(typeof config.shadowColor).toBe('string');
      expect(config.globalAlpha).toBeGreaterThan(0);
      expect(config.globalAlpha).toBeLessThanOrEqual(1);
      expect(config.lineCap).toBe('round');
    }
  });

  it('neon brush has thicker line than sparkle', () => {
    const neon = getBrushConfig('neon', '#FF0000');
    const sparkle = getBrushConfig('sparkle', '#FF0000');
    expect(neon.lineWidth).toBeGreaterThan(sparkle.lineWidth);
  });

  it('glow brush has lower alpha (softer) than neon', () => {
    const glow = getBrushConfig('glow', '#FF0000');
    const neon = getBrushConfig('neon', '#FF0000');
    expect(glow.globalAlpha).toBeLessThan(neon.globalAlpha);
  });
});
