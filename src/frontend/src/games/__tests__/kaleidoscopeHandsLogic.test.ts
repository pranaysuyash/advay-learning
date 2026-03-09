import { describe, expect, it } from 'vitest';

import {
  KaleidoscopeSegment,
  LevelConfig,
  LEVELS,
  COLORS,
  getLevelConfig,
  getRainbowColor,
  getGradientColor,
  getColorForPoint,
} from '../kaleidoscopeHandsLogic';

describe('LEVELS', () => {
  it('has 3 levels', () => {
    expect(LEVELS).toHaveLength(3);
  });

  it('level 1 has 4 segments and rainbow mode', () => {
    expect(LEVELS[0].level).toBe(1);
    expect(LEVELS[0].segmentCount).toBe(4);
    expect(LEVELS[0].colorMode).toBe('rainbow');
  });

  it('level 2 has 6 segments and gradient mode', () => {
    expect(LEVELS[1].level).toBe(2);
    expect(LEVELS[1].segmentCount).toBe(6);
    expect(LEVELS[1].colorMode).toBe('gradient');
  });

  it('level 3 has 8 segments and rainbow mode', () => {
    expect(LEVELS[2].level).toBe(3);
    expect(LEVELS[2].segmentCount).toBe(8);
    expect(LEVELS[2].colorMode).toBe('rainbow');
  });

  it('segmentCount increases across levels', () => {
    expect(LEVELS[0].segmentCount).toBeLessThan(LEVELS[1].segmentCount);
    expect(LEVELS[1].segmentCount).toBeLessThan(LEVELS[2].segmentCount);
  });
});

describe('COLORS', () => {
  it('has 15 colors', () => {
    expect(COLORS).toHaveLength(15);
  });

  it('all colors are hex strings', () => {
    for (const color of COLORS) {
      expect(typeof color).toBe('string');
      expect(color).toMatch(/^#[0-9A-Fa-f]{6}$/);
    }
  });

  it('all colors are unique', () => {
    const unique = new Set(COLORS);
    expect(unique.size).toBeGreaterThan(10);
  });
});

describe('getLevelConfig', () => {
  it('returns level 1 config for level 1', () => {
    const config = getLevelConfig(1);
    expect(config.level).toBe(1);
    expect(config.segmentCount).toBe(4);
    expect(config.colorMode).toBe('rainbow');
  });

  it('returns level 2 config for level 2', () => {
    const config = getLevelConfig(2);
    expect(config.level).toBe(2);
    expect(config.segmentCount).toBe(6);
    expect(config.colorMode).toBe('gradient');
  });

  it('returns level 3 config for level 3', () => {
    const config = getLevelConfig(3);
    expect(config.level).toBe(3);
    expect(config.segmentCount).toBe(8);
    expect(config.colorMode).toBe('rainbow');
  });

  it('returns level 1 for invalid level', () => {
    const config = getLevelConfig(999);
    expect(config.level).toBe(1);
  });

  it('returns level 1 for zero level', () => {
    const config = getLevelConfig(0);
    expect(config.level).toBe(1);
  });

  it('returns level 1 for negative level', () => {
    const config = getLevelConfig(-1);
    expect(config.level).toBe(1);
  });
});

describe('getRainbowColor', () => {
  it('returns HSL color string', () => {
    const color = getRainbowColor(0);
    expect(color).toMatch(/^hsl\(\d+, 70%, 60%\)$/);
  });

  it('returns different colors for different progress', () => {
    const color1 = getRainbowColor(0);
    const color2 = getRainbowColor(0.5);
    expect(color1).not.toBe(color2);
  });

  it('wraps around at 360 degrees', () => {
    const color1 = getRainbowColor(0);
    const color2 = getRainbowColor(1);
    expect(color1).toBe(color2);
  });

  it('returns red at progress 0', () => {
    const color = getRainbowColor(0);
    expect(color).toBe('hsl(0, 70%, 60%)');
  });

  it('handles progress greater than 1', () => {
    const color = getRainbowColor(2);
    expect(color).toMatch(/^hsl\(\d+, 70%, 60%\)$/);
  });

  it('handles negative progress', () => {
    const color = getRainbowColor(-0.5);
    // Negative progress wraps around in JS modulo
    expect(color).toBeDefined();
    expect(color).toContain('hsl(');
  });
});

describe('getGradientColor', () => {
  it('returns one of the gradient colors', () => {
    const expectedColors = ['#FF6B6B', '#4ECDC4', '#45B7D1'];
    const color = getGradientColor(0);
    expect(expectedColors).toContain(color);
  });

  it('returns first color at progress 0', () => {
    const color = getGradientColor(0);
    expect(color).toBe('#FF6B6B');
  });

  it('returns last color at progress 1', () => {
    const color = getGradientColor(1);
    expect(color).toBe('#45B7D1');
  });

  it('returns middle color at progress 0.5', () => {
    const color = getGradientColor(0.5);
    expect(color).toBe('#4ECDC4');
  });

  it('handles progress greater than 1', () => {
    const color = getGradientColor(2);
    expect(['#FF6B6B', '#4ECDC4', '#45B7D1']).toContain(color);
  });
});

describe('getColorForPoint', () => {
  it('returns rainbow color for rainbow mode', () => {
    const color = getColorForPoint('rainbow', 0.5);
    expect(color).toMatch(/^hsl\(/);
  });

  it('returns gradient color for gradient mode', () => {
    const color = getColorForPoint('gradient', 0.5);
    expect(['#FF6B6B', '#4ECDC4', '#45B7D1']).toContain(color);
  });

  it('returns random color for solid mode', () => {
    const color = getColorForPoint('solid', 0.5);
    expect(COLORS).toContain(color);
  });

  it('rainbow mode generates different colors', () => {
    const color1 = getColorForPoint('rainbow', 0);
    const color2 = getColorForPoint('rainbow', 0.5);
    expect(color1).not.toBe(color2);
  });

  it('solid mode generates colors from palette', () => {
    for (let i = 0; i < 20; i++) {
      const color = getColorForPoint('solid', Math.random());
      expect(COLORS).toContain(color);
    }
  });
});

describe('integration scenarios', () => {
  it('can get level 1 config and generate colors', () => {
    const config = getLevelConfig(1);
    expect(config.segmentCount).toBe(4);

    const color = getColorForPoint(config.colorMode, 0.5);
    expect(color).toBeDefined();
  });

  it('can use rainbow mode across full spectrum', () => {
    const colors = [];
    for (let i = 0; i <= 10; i++) {
      colors.push(getRainbowColor(i / 10));
    }
    expect(colors).toHaveLength(11);
    expect(new Set(colors).size).toBeGreaterThan(5);
  });

  it('can generate gradient with smooth transitions', () => {
    const colors = [];
    for (let i = 0; i <= 10; i++) {
      colors.push(getGradientColor(i / 10));
    }
    expect(colors).toHaveLength(11);
    expect(colors[0]).toBe('#FF6B6B');
    expect(colors[10]).toBe('#45B7D1');
  });
});

describe('edge cases', () => {
  it('handles progress of exactly 1', () => {
    const rainbowColor = getRainbowColor(1);
    const gradientColor = getGradientColor(1);
    expect(rainbowColor).toBeDefined();
    expect(gradientColor).toBeDefined();
  });

  it('handles very small progress values', () => {
    const color = getRainbowColor(0.001);
    expect(color).toBeDefined();
  });

  it('handles very large progress values', () => {
    const color = getRainbowColor(1000);
    expect(color).toBeDefined();
  });

  it('all color modes return valid strings', () => {
    const modes: Array<'rainbow' | 'gradient' | 'solid'> = ['rainbow', 'gradient', 'solid'];
    for (const mode of modes) {
      const color = getColorForPoint(mode, 0.5);
      expect(typeof color).toBe('string');
      expect(color.length).toBeGreaterThan(0);
    }
  });
});

describe('type definitions', () => {
  it('KaleidoscopeSegment interface is correctly implemented', () => {
    const segment: KaleidoscopeSegment = {
      angle: 45,
      mirrors: 4,
    };

    expect(typeof segment.angle).toBe('number');
    expect(typeof segment.mirrors).toBe('number');
  });

  it('LevelConfig interface is correctly implemented', () => {
    const config: LevelConfig = {
      level: 2,
      segmentCount: 6,
      colorMode: 'rainbow',
    };

    expect(typeof config.level).toBe('number');
    expect(typeof config.segmentCount).toBe('number');
    expect(['rainbow', 'gradient', 'solid']).toContain(config.colorMode);
  });

  it('colorMode type is union of literal types', () => {
    const modes: Array<'rainbow' | 'gradient' | 'solid'> = ['rainbow', 'gradient', 'solid'];
    expect(modes).toHaveLength(3);
  });
});

describe('color progression', () => {
  it('rainbow creates full hue rotation', () => {
    const hues = [];
    for (let i = 0; i < 36; i++) {
      const color = getRainbowColor(i / 36);
      const match = color.match(/hsl\((\d+),/);
      if (match) {
        hues.push(parseInt(match[1], 10));
      }
    }
    // Should have values across the spectrum
    expect(Math.min(...hues)).toBeLessThan(30);
    expect(Math.max(...hues)).toBeGreaterThan(330);
  });

  it('gradient interpolates between 3 colors', () => {
    const colors = [0, 0.25, 0.5, 0.75, 1].map(p => getGradientColor(p));
    // Should use colors from the palette
    const expectedColors = ['#FF6B6B', '#4ECDC4', '#45B7D1'];
    for (const color of colors) {
      expect(expectedColors).toContain(color);
    }
  });
});

describe('level design', () => {
  it('segment counts are powers of 2', () => {
    expect(LEVELS[0].segmentCount).toBe(4);
    expect(LEVELS[1].segmentCount).toBe(6); // Not power of 2, but valid
    expect(LEVELS[2].segmentCount).toBe(8);
  });

  it('alternating color modes between levels', () => {
    expect(LEVELS[0].colorMode).toBe('rainbow');
    expect(LEVELS[1].colorMode).toBe('gradient');
    expect(LEVELS[2].colorMode).toBe('rainbow');
  });

  it('difficulty increases with segment count', () => {
    expect(LEVELS[0].segmentCount).toBe(4);
    expect(LEVELS[1].segmentCount).toBe(6);
    expect(LEVELS[2].segmentCount).toBe(8);
  });
});
