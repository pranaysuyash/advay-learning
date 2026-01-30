import { describe, expect, it } from 'vitest';

import { countExtendedFingersFromLandmarks } from '../FingerNumberShow';

type P = { x: number; y: number };

const makeLandmarks = (overrides: Partial<Record<number, P>>): P[] => {
  const base: P[] = Array.from({ length: 21 }, () => ({ x: 0.5, y: 0.5 }));
  for (const [key, value] of Object.entries(overrides)) {
    base[Number(key)] = value as P;
  }
  return base;
};

describe('countExtendedFingersFromLandmarks', () => {
  it('counts 5 when thumb + 4 fingers are extended (right-hand orientation)', () => {
    // Right-hand heuristic: index MCP x < pinky MCP x, and thumb tip x < thumb IP x
    const landmarks = makeLandmarks({
      5: { x: 0.4, y: 0.6 }, // index MCP
      17: { x: 0.6, y: 0.6 }, // pinky MCP

      3: { x: 0.35, y: 0.55 }, // thumb IP
      4: { x: 0.25, y: 0.55 }, // thumb tip (extended)

      6: { x: 0.42, y: 0.55 }, 8: { x: 0.42, y: 0.3 }, // index
      10: { x: 0.47, y: 0.55 }, 12: { x: 0.47, y: 0.3 }, // middle
      14: { x: 0.52, y: 0.55 }, 16: { x: 0.52, y: 0.3 }, // ring
      18: { x: 0.58, y: 0.55 }, 20: { x: 0.58, y: 0.3 }, // pinky
    });

    expect(countExtendedFingersFromLandmarks(landmarks)).toBe(5);
  });

  it('counts 5 when thumb + 4 fingers are extended (left-hand orientation)', () => {
    // Left-hand heuristic: index MCP x > pinky MCP x, and thumb tip x > thumb IP x
    const landmarks = makeLandmarks({
      5: { x: 0.6, y: 0.6 }, // index MCP
      17: { x: 0.4, y: 0.6 }, // pinky MCP

      3: { x: 0.65, y: 0.55 }, // thumb IP
      4: { x: 0.75, y: 0.55 }, // thumb tip (extended)

      6: { x: 0.58, y: 0.55 }, 8: { x: 0.58, y: 0.3 }, // index
      10: { x: 0.53, y: 0.55 }, 12: { x: 0.53, y: 0.3 }, // middle
      14: { x: 0.48, y: 0.55 }, 16: { x: 0.48, y: 0.3 }, // ring
      18: { x: 0.42, y: 0.55 }, 20: { x: 0.42, y: 0.3 }, // pinky
    });

    expect(countExtendedFingersFromLandmarks(landmarks)).toBe(5);
  });
});

