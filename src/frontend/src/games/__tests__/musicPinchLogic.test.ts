import { describe, expect, it } from 'vitest';

import {
  getLaneFromNormalizedX,
  pickNextLane,
} from '../musicPinchLogic';

describe('getLaneFromNormalizedX', () => {
  describe('with default 3 lanes', () => {
    it('maps 0 to lane 0', () => {
      expect(getLaneFromNormalizedX(0)).toBe(0);
      expect(getLaneFromNormalizedX(0.0)).toBe(0);
    });

    it('maps values < 0.333 to lane 0', () => {
      expect(getLaneFromNormalizedX(0.1)).toBe(0);
      expect(getLaneFromNormalizedX(0.2)).toBe(0);
      expect(getLaneFromNormalizedX(0.32)).toBe(0);
    });

    it('maps 0.5 to lane 1', () => {
      expect(getLaneFromNormalizedX(0.5)).toBe(1);
    });

    it('maps middle third to lane 1', () => {
      expect(getLaneFromNormalizedX(0.34)).toBe(1);
      expect(getLaneFromNormalizedX(0.6)).toBe(1);
      expect(getLaneFromNormalizedX(0.66)).toBe(1);
    });

    it('maps values > 0.666 to lane 2', () => {
      expect(getLaneFromNormalizedX(0.67)).toBe(2);
      expect(getLaneFromNormalizedX(0.8)).toBe(2);
      expect(getLaneFromNormalizedX(0.99)).toBe(2);
    });

    it('maps 1 to lane 2 (last lane)', () => {
      expect(getLaneFromNormalizedX(1)).toBe(2);
    });
  });

  describe('clamping behavior', () => {
    it('clamps negative values to lane 0', () => {
      expect(getLaneFromNormalizedX(-0.1)).toBe(0);
      expect(getLaneFromNormalizedX(-1)).toBe(0);
      expect(getLaneFromNormalizedX(-999)).toBe(0);
    });

    it('clamps values > 1 to last lane', () => {
      expect(getLaneFromNormalizedX(1.1)).toBe(2);
      expect(getLaneFromNormalizedX(2)).toBe(2);
      expect(getLaneFromNormalizedX(999)).toBe(2);
    });
  });

  describe('with different lane counts', () => {
    it('handles 2 lanes', () => {
      expect(getLaneFromNormalizedX(0, 2)).toBe(0);
      expect(getLaneFromNormalizedX(0.4, 2)).toBe(0);
      expect(getLaneFromNormalizedX(0.6, 2)).toBe(1);
      expect(getLaneFromNormalizedX(1, 2)).toBe(1);
    });

    it('handles 4 lanes', () => {
      expect(getLaneFromNormalizedX(0, 4)).toBe(0);
      expect(getLaneFromNormalizedX(0.24, 4)).toBe(0);
      expect(getLaneFromNormalizedX(0.26, 4)).toBe(1);
      expect(getLaneFromNormalizedX(0.74, 4)).toBe(2);
      expect(getLaneFromNormalizedX(0.76, 4)).toBe(3);
      expect(getLaneFromNormalizedX(1, 4)).toBe(3);
    });

    it('handles 5 lanes', () => {
      expect(getLaneFromNormalizedX(0, 5)).toBe(0);
      expect(getLaneFromNormalizedX(0.5, 5)).toBe(2);
      expect(getLaneFromNormalizedX(1, 5)).toBe(4);
    });

    it('handles single lane (always returns 0)', () => {
      expect(getLaneFromNormalizedX(0, 1)).toBe(0);
      expect(getLaneFromNormalizedX(0.5, 1)).toBe(0);
      expect(getLaneFromNormalizedX(1, 1)).toBe(0);
    });

    it('handles zero lanes (returns 0)', () => {
      expect(getLaneFromNormalizedX(0.5, 0)).toBe(0);
    });
  });

  describe('edge cases', () => {
    it('handles boundary at 0.333 for 3 lanes', () => {
      expect(getLaneFromNormalizedX(0.333, 3)).toBe(0);
      expect(getLaneFromNormalizedX(0.334, 3)).toBe(1);
    });

    it('handles boundary at 0.666 for 3 lanes', () => {
      expect(getLaneFromNormalizedX(0.666, 3)).toBe(1);
      expect(getLaneFromNormalizedX(0.667, 3)).toBe(2);
    });

    it('handles very small positive values', () => {
      expect(getLaneFromNormalizedX(0.0001)).toBe(0);
    });

    it('handles very large values close to 1', () => {
      expect(getLaneFromNormalizedX(0.9999)).toBe(2);
    });
  });
});

describe('pickNextLane', () => {
  describe('with default 3 lanes', () => {
    it('picks lane 0 when random < 0.333 (and current not 0)', () => {
      expect(pickNextLane(1, 3, 0.1)).toBe(0);
      expect(pickNextLane(1, 3, 0.2)).toBe(0);
      expect(pickNextLane(1, 3, 0.32)).toBe(0);
    });

    it('picks lane 1 when random in middle third (and current not 1)', () => {
      expect(pickNextLane(0, 3, 0.4)).toBe(1);
      expect(pickNextLane(2, 3, 0.5)).toBe(1);
      expect(pickNextLane(0, 3, 0.6)).toBe(1);
    });

    it('picks lane 2 when random > 0.666 (and current not 2)', () => {
      expect(pickNextLane(0, 3, 0.7)).toBe(2);
      expect(pickNextLane(0, 3, 0.8)).toBe(2);
      expect(pickNextLane(0, 3, 0.99)).toBe(2);
    });
  });

  describe('avoiding current lane', () => {
    it('picks different lane when random matches current', () => {
      // When current is 0 and random maps to 0, picks 1
      expect(pickNextLane(0, 3, 0.1)).toBe(1);

      // When current is 1 and random maps to 1, picks 2
      expect(pickNextLane(1, 3, 0.4)).toBe(2);

      // When current is 2 and random maps to 2, wraps to 0
      expect(pickNextLane(2, 3, 0.8)).toBe(0);
    });

    it('wraps around from last lane to first', () => {
      expect(pickNextLane(2, 3, 0.99)).toBe(0);
    });
  });

  describe('with different lane counts', () => {
    it('handles 2 lanes', () => {
      expect(pickNextLane(0, 2, 0.1)).toBe(1);
      expect(pickNextLane(1, 2, 0.6)).toBe(0);
    });

    it('handles 4 lanes', () => {
      expect(pickNextLane(0, 4, 0.1)).toBe(1);
      expect(pickNextLane(1, 4, 0.3)).toBe(2);
      expect(pickNextLane(2, 4, 0.6)).toBe(3);
      expect(pickNextLane(3, 4, 0.9)).toBe(0);
    });

    it('handles 5 lanes', () => {
      expect(pickNextLane(0, 5, 0.1)).toBe(1);
      expect(pickNextLane(4, 5, 0.9)).toBe(0);
    });

    it('handles single lane (always returns 0)', () => {
      expect(pickNextLane(0, 1, 0.5)).toBe(0);
      expect(pickNextLane(0, 1, 0.99)).toBe(0);
    });

    it('handles zero lanes (returns 0)', () => {
      expect(pickNextLane(0, 0, 0.5)).toBe(0);
    });
  });

  describe('random value handling', () => {
    it('handles random value of 0', () => {
      expect(pickNextLane(1, 3, 0)).toBe(0);
    });

    it('handles random value very close to 1', () => {
      expect(pickNextLane(0, 3, 0.999)).toBe(2);
    });

    it('clamps random value to 0.999999 max', () => {
      // Even with random = 1, it's clamped to avoid lane overflow
      const result = pickNextLane(0, 3, 1);
      expect([0, 1, 2]).toContain(result);
    });

    it('handles negative random values', () => {
      // Clamped to 0, then picks lane 0, which might equal current
      expect(pickNextLane(1, 3, -0.5)).toBe(0);
    });
  });

  describe('edge cases', () => {
    it('picks different lane when all lanes available', () => {
      const currentLane = 1;
      const nextLane = pickNextLane(currentLane, 3, 0.5);
      expect(nextLane).not.toBe(currentLane);
    });

    it('can pick any other lane besides current', () => {
      // With current = 1, should be able to get 0 or 2
      const results = new Set();
      for (let i = 0; i < 100; i++) {
        // Use different random values to potentially get different lanes
        const random = (i % 30) / 30; // 0 to 0.966
        results.add(pickNextLane(1, 3, random));
      }
      // Should have at least one result different from current
      expect(results.size).toBeGreaterThan(0);
      results.forEach(result => {
        expect([0, 2]).toContain(result);
      });
    });

    it('behaves consistently for same inputs', () => {
      expect(pickNextLane(1, 3, 0.5)).toBe(pickNextLane(1, 3, 0.5));
      expect(pickNextLane(0, 3, 0.1)).toBe(pickNextLane(0, 3, 0.1));
    });
  });
});

describe('integration scenarios', () => {
  it('can track lane changes across multiple picks', () => {
    let currentLane = 0;

    currentLane = pickNextLane(currentLane, 3, 0.5);
    expect([1, 2]).toContain(currentLane);

    currentLane = pickNextLane(currentLane, 3, 0.2);
    expect([0, 1, 2]).toContain(currentLane);

    // Always picks a lane different from current
    const nextLane = pickNextLane(currentLane, 3, 0.7);
    expect(nextLane).not.toBe(currentLane);
  });

  it('can map screen position to lane', () => {
    // Touch at 20% of screen width -> lane 0
    const lane = getLaneFromNormalizedX(0.2);
    expect(lane).toBe(0);

    // Next pick should avoid lane 0
    const nextLane = pickNextLane(lane, 3, 0.1); // Would pick 0, but avoids it
    expect(nextLane).toBe(1);
  });

  it('handles full gameplay cycle', () => {
    // Simulate a simple gameplay loop
    let currentLane = 0;

    for (let i = 0; i < 10; i++) {
      const random = (i * 0.1) % 1;
      const nextLane = pickNextLane(currentLane, 3, random);
      expect(nextLane).not.toBe(currentLane);
      expect([0, 1, 2]).toContain(nextLane);
      currentLane = nextLane;
    }
  });
});

describe('type definitions', () => {
  it('getLaneFromNormalizedX returns number', () => {
    const result = getLaneFromNormalizedX(0.5);
    expect(typeof result).toBe('number');
  });

  it('pickNextLane returns number', () => {
    const result = pickNextLane(0, 3, 0.5);
    expect(typeof result).toBe('number');
  });

  it('lane counts are handled as numbers', () => {
    expect(getLaneFromNormalizedX(0.5, 3)).toBe(1);
    expect(pickNextLane(0, 3, 0.5)).not.toBe(0);
  });
});

describe('mathematical properties', () => {
  it('lane indices are always valid for given lane count', () => {
    for (let laneCount = 2; laneCount <= 5; laneCount++) {
      for (let x = 0; x <= 1; x += 0.1) {
        const lane = getLaneFromNormalizedX(x, laneCount);
        expect(lane).toBeGreaterThanOrEqual(0);
        expect(lane).toBeLessThan(laneCount);
      }
    }
  });

  it('next lane is always different from current', () => {
    for (let laneCount = 2; laneCount <= 5; laneCount++) {
      for (let current = 0; current < laneCount; current++) {
        for (let r = 0; r < 10; r++) {
          const random = r / 10;
          const next = pickNextLane(current, laneCount, random);
          expect(next).not.toBe(current);
          expect(next).toBeGreaterThanOrEqual(0);
          expect(next).toBeLessThan(laneCount);
        }
      }
    }
  });
});
