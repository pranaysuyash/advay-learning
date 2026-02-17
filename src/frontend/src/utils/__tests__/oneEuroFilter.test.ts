import { describe, expect, it } from 'vitest';

import { OneEuroScalarFilter, OneEuroPointFilter } from '../oneEuroFilter';

describe('OneEuroScalarFilter', () => {
  it('returns the first value unchanged', () => {
    const filter = new OneEuroScalarFilter();
    expect(filter.filter(0.5, 0)).toBe(0.5);
  });

  it('smooths jittery stationary values', () => {
    const filter = new OneEuroScalarFilter({ minCutoff: 1.0, beta: 0.007 });
    const dt = 1 / 30; // 30fps

    // Settle the filter at 0.5
    for (let i = 0; i < 30; i++) {
      filter.filter(0.5, i * dt);
    }

    // Inject jitter: alternating ±0.02 around 0.5
    const outputs: number[] = [];
    for (let i = 30; i < 60; i++) {
      const jittery = 0.5 + (i % 2 === 0 ? 0.02 : -0.02);
      outputs.push(filter.filter(jittery, i * dt));
    }

    // Output jitter should be much smaller than input jitter (0.04 peak-to-peak)
    const min = Math.min(...outputs);
    const max = Math.max(...outputs);
    const outputJitter = max - min;

    expect(outputJitter).toBeLessThan(0.02);
  });

  it('follows fast movements with low lag', () => {
    const filter = new OneEuroScalarFilter({ minCutoff: 1.0, beta: 0.007 });
    const dt = 1 / 30;

    // Start at 0.0
    filter.filter(0.0, 0);

    // Jump to 1.0 (fast movement)
    let output = 0;
    for (let i = 1; i <= 10; i++) {
      output = filter.filter(1.0, i * dt);
    }

    // After 10 frames (~333ms) should be close to 1.0
    expect(output).toBeGreaterThan(0.8);
  });

  it('resets state correctly', () => {
    const filter = new OneEuroScalarFilter();
    filter.filter(0.5, 0);
    filter.filter(0.6, 1 / 30);
    filter.reset();

    // After reset, first value should pass through unchanged
    expect(filter.filter(0.9, 1.0)).toBe(0.9);
  });
});

describe('OneEuroPointFilter', () => {
  it('filters x and y independently', () => {
    const filter = new OneEuroPointFilter({ minCutoff: 1.0, beta: 0.007 });
    const dt = 1 / 30;

    // First point passes through
    const first = filter.filter({ x: 0.5, y: 0.3 }, 0);
    expect(first.x).toBe(0.5);
    expect(first.y).toBe(0.3);

    // Subsequent points are smoothed
    const second = filter.filter({ x: 0.55, y: 0.35 }, dt);
    expect(second.x).toBeGreaterThan(0.5);
    expect(second.x).toBeLessThan(0.55);
    expect(second.y).toBeGreaterThan(0.3);
    expect(second.y).toBeLessThan(0.35);
  });

  it('smooths jittery 2D cursor positions', () => {
    const filter = new OneEuroPointFilter({ minCutoff: 1.0, beta: 0.007 });
    const dt = 1 / 30;

    // Settle at (0.5, 0.5)
    for (let i = 0; i < 30; i++) {
      filter.filter({ x: 0.5, y: 0.5 }, i * dt);
    }

    // Inject 2D jitter
    const outputs: Array<{ x: number; y: number }> = [];
    for (let i = 30; i < 60; i++) {
      const jx = 0.5 + (i % 2 === 0 ? 0.02 : -0.02);
      const jy = 0.5 + (i % 3 === 0 ? 0.015 : -0.015);
      outputs.push(filter.filter({ x: jx, y: jy }, i * dt));
    }

    const xMin = Math.min(...outputs.map((p) => p.x));
    const xMax = Math.max(...outputs.map((p) => p.x));
    expect(xMax - xMin).toBeLessThan(0.02);

    const yMin = Math.min(...outputs.map((p) => p.y));
    const yMax = Math.max(...outputs.map((p) => p.y));
    expect(yMax - yMin).toBeLessThan(0.015);
  });

  it('resets both axes', () => {
    const filter = new OneEuroPointFilter();
    filter.filter({ x: 0.1, y: 0.2 }, 0);
    filter.filter({ x: 0.3, y: 0.4 }, 1 / 30);
    filter.reset();

    const result = filter.filter({ x: 0.9, y: 0.8 }, 1.0);
    expect(result.x).toBe(0.9);
    expect(result.y).toBe(0.8);
  });
});
