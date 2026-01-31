import { describe, expect, it } from 'vitest';

import { countExtendedFingersFromLandmarks } from '../fingerCounting';

type P = { x: number; y: number };

const makeLandmarks = (overrides: Partial<Record<number, P>>): P[] => {
  const base: P[] = Array.from({ length: 21 }, () => ({ x: 0.5, y: 0.5 }));
  for (const [key, value] of Object.entries(overrides)) {
    base[Number(key)] = value as P;
  }
  return base;
};

describe('countExtendedFingersFromLandmarks', () => {
  it('counts 5 for an open palm (thumb + 4 fingers)', () => {
    const landmarks = makeLandmarks({
      // Wrist + MCPs to define palm center.
      0: { x: 0.5, y: 0.9 },
      5: { x: 0.42, y: 0.72 },
      9: { x: 0.5, y: 0.7 },
      13: { x: 0.58, y: 0.72 },
      17: { x: 0.66, y: 0.75 },

      // Thumb extended: tip further from palm center than IP.
      3: { x: 0.46, y: 0.78 },
      4: { x: 0.32, y: 0.7 },

      // Fingers extended (upright).
      6: { x: 0.43, y: 0.6 }, 8: { x: 0.43, y: 0.35 }, // index
      10: { x: 0.5, y: 0.6 }, 12: { x: 0.5, y: 0.32 }, // middle
      14: { x: 0.57, y: 0.6 }, 16: { x: 0.57, y: 0.35 }, // ring
      18: { x: 0.64, y: 0.62 }, 20: { x: 0.64, y: 0.38 }, // pinky
    });

    expect(countExtendedFingersFromLandmarks(landmarks)).toBe(5);
  });

  it('counts 4 when thumb is folded in', () => {
    const landmarks = makeLandmarks({
      0: { x: 0.5, y: 0.9 },
      5: { x: 0.42, y: 0.72 },
      9: { x: 0.5, y: 0.7 },
      13: { x: 0.58, y: 0.72 },
      17: { x: 0.66, y: 0.75 },

      // Thumb folded: tip close to palm, not further than IP.
      3: { x: 0.46, y: 0.78 },
      4: { x: 0.47, y: 0.79 },

      // Fingers extended.
      6: { x: 0.43, y: 0.6 }, 8: { x: 0.43, y: 0.35 },
      10: { x: 0.5, y: 0.6 }, 12: { x: 0.5, y: 0.32 },
      14: { x: 0.57, y: 0.6 }, 16: { x: 0.57, y: 0.35 },
      18: { x: 0.64, y: 0.62 }, 20: { x: 0.64, y: 0.38 },
    });

    expect(countExtendedFingersFromLandmarks(landmarks)).toBe(4);
  });

  it('counts an extended finger even when rotated sideways (distance fallback)', () => {
    const landmarks = makeLandmarks({
      // Wrist anchor.
      0: { x: 0.2, y: 0.5 },

      // Sideways index finger: tip and pip same y, but tip further from wrist.
      6: { x: 0.45, y: 0.5 },
      8: { x: 0.75, y: 0.5 },

      // Other fingers folded (tips not further than pip).
      10: { x: 0.42, y: 0.55 }, 12: { x: 0.38, y: 0.55 },
      14: { x: 0.42, y: 0.6 }, 16: { x: 0.39, y: 0.6 },
      18: { x: 0.42, y: 0.65 }, 20: { x: 0.4, y: 0.65 },

      // Thumb folded.
      3: { x: 0.28, y: 0.52 }, 4: { x: 0.27, y: 0.52 },
    });

    expect(countExtendedFingersFromLandmarks(landmarks)).toBe(1);
  });
});
