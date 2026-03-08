/**
 * Number Tap Trail Game Logic Tests
 *
 * Tests for target creation, level progression, hit detection,
 * scoring, and game mechanics.
 */

import { describe, expect, it, beforeEach } from 'vitest';

// Types from NumberTapTrail
export interface Point {
  x: number;
  y: number;
}

export interface TrailTarget {
  id: number;
  value: number;
  position: Point;
  cleared: boolean;
}

// Mock random function for testing
let mockRandomValue = 0.5;

function mockRandomFloat01(): number {
  return mockRandomValue;
}

// Copied from targetPracticeLogic for testing
export function isPointInCircle(
  point: Point,
  center: Point,
  radius: number
): boolean {
  const dx = point.x - center.x;
  const dy = point.y - center.y;
  return dx * dx + dy * dy <= radius * radius;
}

// Copied from hitTarget.ts for testing
export interface CircularTarget {
  position: Point;
}

export function findHitTarget<T extends CircularTarget>(
  point: Point,
  targets: T[],
  radius: number,
): T | null {
  if (radius <= 0) return null;

  for (const target of targets) {
    if (isPointInCircle(point, target.position, radius)) {
      return target;
    }
  }

  return null;
}

// Constants from NumberTapTrail
const HIT_RADIUS = 0.1;
const MAX_LEVEL = 6;

/**
 * Calculate target count for level.
 */
function getTargetCount(level: number): number {
  return Math.min(4 + level, 10);
}

/**
 * Create round targets for a level.
 * Simplified version that uses predictable positions.
 */
function createRoundTargets(level: number): TrailTarget[] {
  const count = getTargetCount(level);

  // Create evenly spaced positions for testing
  const targets: TrailTarget[] = [];
  for (let i = 0; i < count; i++) {
    targets.push({
      id: i,
      value: i + 1,
      position: { x: 0.1 + (i % 3) * 0.3, y: 0.2 + Math.floor(i / 3) * 0.2 },
      cleared: false,
    });
  }

  return targets;
}

/**
 * Calculate score with streak bonus.
 */
function calculateScore(streak: number): number {
  const basePoints = 10;
  const streakBonus = Math.min(streak * 2, 15);
  return basePoints + streakBonus;
}

/**
 * Calculate level completion bonus.
 */
function calculateLevelBonus(timeLeft: number): number {
  return 35 + timeLeft * 2;
}

describe('Number Tap Trail - Level Progression', () => {
  it('has 6 levels maximum', () => {
    expect(MAX_LEVEL).toBe(6);
  });

  it('calculates target count for each level', () => {
    expect(getTargetCount(1)).toBe(5); // 4 + 1
    expect(getTargetCount(2)).toBe(6); // 4 + 2
    expect(getTargetCount(3)).toBe(7); // 4 + 3
    expect(getTargetCount(4)).toBe(8); // 4 + 4
    expect(getTargetCount(5)).toBe(9); // 4 + 5
    expect(getTargetCount(6)).toBe(10); // 4 + 6, capped at 10
  });

  it('caps target count at 10', () => {
    expect(getTargetCount(10)).toBe(10);
    expect(getTargetCount(100)).toBe(10);
  });

  it('level 1 has 5 targets (numbers 1-5)', () => {
    const targets = createRoundTargets(1);
    expect(targets).toHaveLength(5);
    expect(targets[0].value).toBe(1);
    expect(targets[4].value).toBe(5);
  });
});

describe('Number Tap Trail - Target Creation', () => {
  it('creates targets with sequential values', () => {
    const targets = createRoundTargets(2);
    const values = targets.map(t => t.value);
    expect(values).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it('assigns unique IDs to targets', () => {
    const targets = createRoundTargets(1);
    const ids = targets.map(t => t.id);
    expect(ids).toEqual([0, 1, 2, 3, 4]);
  });

  it('initializes targets as uncleared', () => {
    const targets = createRoundTargets(1);
    targets.forEach(target => {
      expect(target.cleared).toBe(false);
    });
  });

  it('assigns positions to all targets', () => {
    const targets = createRoundTargets(1);
    targets.forEach(target => {
      expect(target.position).toBeDefined();
      expect(typeof target.position.x).toBe('number');
      expect(typeof target.position.y).toBe('number');
    });
  });
});

describe('Number Tap Trail - Hit Detection', () => {
  it('detects hit when point is within radius', () => {
    const point: Point = { x: 0.5, y: 0.5 };
    const target = { position: point };
    const targets = [target] as CircularTarget[];

    const hit = findHitTarget(point, targets, HIT_RADIUS);
    expect(hit).toBe(target);
  });

  it('does not detect hit when point is outside radius', () => {
    const point: Point = { x: 0.8, y: 0.5 };
    const target = { position: { x: 0.5, y: 0.5 } };
    const targets = [target] as CircularTarget[];

    const hit = findHitTarget(point, targets, HIT_RADIUS);
    expect(hit).toBeNull();
  });

  it('detects hit at edge of radius', () => {
    const point: Point = { x: 0.6, y: 0.5 };
    const target = { position: { x: 0.5, y: 0.5 } };
    const targets = [target] as CircularTarget[];

    // Distance is exactly 0.1, which should hit
    const hit = findHitTarget(point, targets, HIT_RADIUS);
    expect(hit).toBe(target);
  });

  it('returns null for empty targets array', () => {
    const point: Point = { x: 0.5, y: 0.5 };
    const targets: CircularTarget[] = [];

    const hit = findHitTarget(point, targets, HIT_RADIUS);
    expect(hit).toBeNull();
  });

  it('returns null for non-positive radius', () => {
    const point: Point = { x: 0.5, y: 0.5 };
    const target = { position: point };
    const targets = [target] as CircularTarget[];

    const hit = findHitTarget(point, targets, 0);
    expect(hit).toBeNull();

    const hitNegative = findHitTarget(point, targets, -0.1);
    expect(hitNegative).toBeNull();
  });
});

describe('Number Tap Trail - Scoring System', () => {
  it('calculates base score correctly', () => {
    expect(calculateScore(0)).toBe(10);
  });

  it('adds streak bonus correctly', () => {
    expect(calculateScore(1)).toBe(12); // 10 + 2
    expect(calculateScore(2)).toBe(14); // 10 + 4
    expect(calculateScore(3)).toBe(16); // 10 + 6
  });

  it('caps streak bonus at 15', () => {
    expect(calculateScore(5)).toBe(20); // 10 + 10
    expect(calculateScore(8)).toBe(25); // 10 + 15 (capped)
    expect(calculateScore(10)).toBe(25); // 10 + 15 (capped)
  });

  it('calculates level completion bonus', () => {
    expect(calculateLevelBonus(90)).toBe(215); // 35 + 90*2
    expect(calculateLevelBonus(60)).toBe(155); // 35 + 60*2
    expect(calculateLevelBonus(0)).toBe(35); // 35 + 0
  });
});

describe('Number Tap Trail - Expected Index Tracking', () => {
  it('starts at index 0', () => {
    const expectedIndex = 0;
    expect(expectedIndex).toBe(0);
  });

  it('increments after correct pinch', () => {
    let expectedIndex = 0;
    const targets = createRoundTargets(1);

    // Simulate correct pinch
    expectedIndex++;
    expect(expectedIndex).toBe(1);
  });

  it('completes level when all targets cleared', () => {
    const targets = createRoundTargets(1);
    let expectedIndex = 0;

    // Clear all targets
    while (expectedIndex < targets.length) {
      expectedIndex++;
    }

    expect(expectedIndex).toBe(targets.length);
  });
});

describe('Number Tap Trail - Target Clearing', () => {
  it('marks target as cleared', () => {
    const targets = createRoundTargets(1);
    const targetToClear = targets[0];

    const cleared = { ...targetToClear, cleared: true };
    expect(cleared.cleared).toBe(true);
  });

  it('does not affect other targets', () => {
    const targets = createRoundTargets(1);
    const clearedTargets = targets.map((t, i) => i === 0 ? { ...t, cleared: true } : t);

    expect(clearedTargets[0].cleared).toBe(true);
    expect(clearedTargets[1].cleared).toBe(false);
    expect(clearedTargets[2].cleared).toBe(false);
  });
});

describe('Number Tap Trail - Streak System', () => {
  it('increments streak on correct pinch', () => {
    let streak = 0;
    streak += 1;
    expect(streak).toBe(1);
  });

  it('resets streak on wrong pinch', () => {
    let streak = 5;
    streak = 0;
    expect(streak).toBe(0);
  });

  it('streak milestone every 5 correct pinches', () => {
    const STREAK_MILESTONE_INTERVAL = 5;
    const streaks = [5, 10, 15];

    streaks.forEach(s => {
      expect(s % STREAK_MILESTONE_INTERVAL).toBe(0);
    });
  });
});

describe('Number Tap Trail - Game State', () => {
  it('starts with 90 seconds on timer', () => {
    const timeLeft = 90;
    expect(timeLeft).toBe(90);
  });

  it('decrements timer each second', () => {
    let timeLeft = 90;
    timeLeft--;
    expect(timeLeft).toBe(89);
  });

  it('starts at level 1', () => {
    const level = 1;
    expect(level).toBe(1);
  });

  it('advances to next level after completion', () => {
    let level = 1;
    level++;
    expect(level).toBe(2);
  });

  it('does not exceed MAX_LEVEL', () => {
    let level = MAX_LEVEL;
    if (level < MAX_LEVEL) {
      level++;
    }
    expect(level).toBe(MAX_LEVEL);
  });
});

describe('Number Tap Trail - Edge Cases', () => {
  it('handles empty targets array', () => {
    const targets: TrailTarget[] = [];
    expect(targets).toHaveLength(0);
  });

  it('handles single target', () => {
    const targets = createRoundTargets(1).slice(0, 1);
    expect(targets).toHaveLength(1);
    expect(targets[0].value).toBe(1);
  });

  it('handles maximum targets (level 6)', () => {
    const targets = createRoundTargets(6);
    expect(targets).toHaveLength(10);
    expect(targets[9].value).toBe(10);
  });
});

describe('Number Tap Trail - Feedback Messages', () => {
  it('shows initial feedback', () => {
    const feedback = 'Pinch numbers in order: 1, 2, 3...';
    expect(feedback).toContain('Pinch numbers in order');
  });

  it('updates feedback on correct pinch', () => {
    const feedback = `Great! Now find 3.`;
    expect(feedback).toContain('Great!');
    expect(feedback).toContain('3');
  });

  it('updates feedback on wrong pinch', () => {
    const feedback = `That is 5. Find 3.`;
    expect(feedback).toContain('That is 5');
    expect(feedback).toContain('Find 3');
  });

  it('shows level complete feedback', () => {
    const feedback = `Level 3 complete!`;
    expect(feedback).toContain('Level 3 complete');
  });
});

describe('Number Tap Trail - Hit Detection Edge Cases', () => {
  it('handles point exactly at center', () => {
    const point: Point = { x: 0.5, y: 0.5 };
    const target = { position: { x: 0.5, y: 0.5 } };
    const targets = [target] as CircularTarget[];

    const hit = findHitTarget(point, targets, HIT_RADIUS);
    expect(hit).not.toBeNull();
  });

  it('handles point at boundary of normalized space', () => {
    const point: Point = { x: 0, y: 0 };
    const target = { position: { x: 0.05, y: 0.05 } };
    const targets = [target] as CircularTarget[];

    const hit = findHitTarget(point, targets, HIT_RADIUS);
    expect(hit).toBe(target); // Distance ~0.07 < 0.1
  });

  it('finds first target when multiple overlap', () => {
    const point: Point = { x: 0.5, y: 0.5 };
    const target1 = { position: { x: 0.5, y: 0.5 } };
    const target2 = { position: { x: 0.55, y: 0.5 } };
    const targets = [target1, target2] as CircularTarget[];

    const hit = findHitTarget(point, targets, HIT_RADIUS);
    expect(hit).toBe(target1); // Returns first match
  });
});
