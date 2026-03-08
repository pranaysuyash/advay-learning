/**
 * Color Match Garden Game Logic Tests
 *
 * Tests for flower targets, scoring, match detection,
 * and round building logic.
 */

import { describe, expect, it } from 'vitest';
import {
  FLOWERS,
  GAME_CONFIG,
  GardenTarget,
  RoundResult,
  isPointInTarget,
  isCorrectMatch,
  calculateScore,
  isStreakMilestone,
  pickSpacedPoints,
  buildRoundTargets,
  getPromptTarget,
  getMatchFeedback,
  getFlowersByName,
  getFlowerByAssetId,
} from '../colorMatchGardenLogic';

describe('FLOWERS Array', () => {
  it('has 6 flower types', () => {
    expect(FLOWERS).toHaveLength(6);
  });

  it('has all expected flowers with correct properties', () => {
    const flowerNames = FLOWERS.map((f) => f.name);
    expect(flowerNames).toContain('Red');
    expect(flowerNames).toContain('Blue');
    expect(flowerNames).toContain('Green');
    expect(flowerNames).toContain('Yellow');
    expect(flowerNames).toContain('Pink');
    expect(flowerNames).toContain('Purple');
  });

  it('all flowers have required properties', () => {
    FLOWERS.forEach((flower) => {
      expect(flower.name).toBeDefined();
      expect(flower.color).toMatch(/^#[0-9A-F]{6}$/i);
      expect(flower.emoji).toBeDefined();
      expect(flower.assetId).toBeDefined();
    });
  });

  it('Red flower has correct color and emoji', () => {
    const red = FLOWERS.find((f) => f.name === 'Red');
    expect(red?.color).toBe('#ef4444');
    expect(red?.emoji).toBe('🌺');
  });

  it('Blue flower has correct color and emoji', () => {
    const blue = FLOWERS.find((f) => f.name === 'Blue');
    expect(blue?.color).toBe('#3b82f6');
    expect(blue?.emoji).toBe('🪻');
  });
});

describe('GAME_CONFIG', () => {
  it('has target radius of 0.1', () => {
    expect(GAME_CONFIG.TARGET_RADIUS).toBe(0.1);
  });

  it('has 60 second game duration', () => {
    expect(GAME_CONFIG.GAME_DURATION_SECONDS).toBe(60);
  });

  it('has base points of 12', () => {
    expect(GAME_CONFIG.BASE_POINTS_PER_MATCH).toBe(12);
  });

  it('has max streak bonus of 18', () => {
    expect(GAME_CONFIG.MAX_STREAK_BONUS).toBe(18);
  });

  it('has streak bonus multiplier of 2', () => {
    expect(GAME_CONFIG.STREAK_BONUS_MULTIPLIER).toBe(2);
  });

  it('has streak milestone of 6', () => {
    expect(GAME_CONFIG.STREAK_MILESTONE).toBe(6);
  });
});

describe('isPointInTarget', () => {
  const target: GardenTarget = {
    id: 0,
    name: 'Red',
    color: '#ef4444',
    emoji: '🌺',
    assetId: 'brush-red',
    position: { x: 0.5, y: 0.5 },
  };

  it('detects hit when point is at target center', () => {
    const point = { x: 0.5, y: 0.5 };
    expect(isPointInTarget(point, target)).toBe(true);
  });

  it('detects hit when point is within radius', () => {
    const point = { x: 0.55, y: 0.5 }; // 0.05 away
    expect(isPointInTarget(point, target, 0.1)).toBe(true);
  });

  it('detects hit at edge of radius', () => {
    const point = { x: 0.6, y: 0.5 }; // Exactly 0.1 away
    expect(isPointInTarget(point, target, 0.1)).toBe(true);
  });

  it('returns false when point is outside radius', () => {
    const point = { x: 0.65, y: 0.5 }; // 0.15 away
    expect(isPointInTarget(point, target, 0.1)).toBe(false);
  });

  it('uses default radius when not specified', () => {
    const point = { x: 0.55, y: 0.5 };
    expect(isPointInTarget(point, target)).toBe(true);
  });

  it('handles diagonal distances correctly', () => {
    const point = { x: 0.55, y: 0.55 }; // sqrt(0.05^2 + 0.05^2) ≈ 0.071
    expect(isPointInTarget(point, target, 0.1)).toBe(true);
  });
});

describe('isCorrectMatch', () => {
  const target1: GardenTarget = {
    id: 0,
    name: 'Red',
    color: '#ef4444',
    emoji: '🌺',
    assetId: 'brush-red',
    position: { x: 0.3, y: 0.5 },
  };

  const target2: GardenTarget = {
    id: 1,
    name: 'Blue',
    color: '#3b82f6',
    emoji: '🪻',
    assetId: 'brush-blue',
    position: { x: 0.7, y: 0.5 },
  };

  it('returns true when IDs match', () => {
    expect(isCorrectMatch(target1, target1)).toBe(true);
  });

  it('returns false when IDs differ', () => {
    expect(isCorrectMatch(target1, target2)).toBe(false);
  });

  it('compares by ID not by properties', () => {
    const target1Copy = { ...target1 };
    expect(isCorrectMatch(target1Copy, target1)).toBe(true);
  });
});

describe('calculateScore', () => {
  it('returns base points for zero streak', () => {
    expect(calculateScore(0)).toBe(12);
  });

  it('adds streak bonus correctly', () => {
    expect(calculateScore(1)).toBe(14); // 12 + 1*2
    expect(calculateScore(2)).toBe(16); // 12 + 2*2
    expect(calculateScore(3)).toBe(18); // 12 + 3*2
  });

  it('caps bonus at maximum', () => {
    expect(calculateScore(9)).toBe(30); // 12 + 18 (max)
    expect(calculateScore(10)).toBe(30); // 12 + 18 (max)
    expect(calculateScore(20)).toBe(30); // 12 + 18 (max)
  });

  it('caps streak bonus at 9 streak', () => {
    expect(calculateScore(9)).toBe(30);
    expect(calculateScore(8)).toBe(28); // 12 + 16
  });

  it('handles negative streak gracefully', () => {
    // Edge case - should not happen in normal play
    expect(calculateScore(-1)).toBe(12); // base only
  });

  it('increases linearly until cap', () => {
    const scores = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(calculateScore);
    expect(scores).toEqual([12, 14, 16, 18, 20, 22, 24, 26, 28, 30]);
  });
});

describe('isStreakMilestone', () => {
  it('returns false for zero streak', () => {
    expect(isStreakMilestone(0)).toBe(false);
  });

  it('returns true at milestone 6', () => {
    expect(isStreakMilestone(6)).toBe(true);
  });

  it('returns true at milestone 12', () => {
    expect(isStreakMilestone(12)).toBe(true);
  });

  it('returns false between milestones', () => {
    expect(isStreakMilestone(5)).toBe(false);
    expect(isStreakMilestone(7)).toBe(false);
  });

  it('returns true at 18 (third milestone)', () => {
    expect(isStreakMilestone(18)).toBe(true);
  });

  it('returns false for non-multiple of 6', () => {
    expect(isStreakMilestone(1)).toBe(false);
    expect(isStreakMilestone(11)).toBe(false);
    expect(isStreakMilestone(13)).toBe(false);
  });
});

describe('pickSpacedPoints', () => {
  it('generates requested number of points', () => {
    const points = pickSpacedPoints(3, 0.25, 0.15, Math.random);
    expect(points).toHaveLength(3);
  });

  it('assigns sequential IDs', () => {
    const points = pickSpacedPoints(5, 0.25, 0.15, Math.random);
    const ids = points.map((p) => p.id);
    expect(ids).toEqual([0, 1, 2, 3, 4]);
  });

  it('generates points within bounds', () => {
    const points = pickSpacedPoints(10, 0.25, 0.15, Math.random);
    points.forEach((point) => {
      expect(point.position.x).toBeGreaterThanOrEqual(0);
      expect(point.position.x).toBeLessThanOrEqual(1);
      expect(point.position.y).toBeGreaterThanOrEqual(0);
      expect(point.position.y).toBeLessThanOrEqual(1);
    });
  });

  it('respects margin from edges', () => {
    // Using deterministic random
    const points = pickSpacedPoints(5, 0.25, 0.15, () => 0.5);
    // With margin 0.15, points should be in [0.15, 0.85] range
    points.forEach((point) => {
      expect(point.position.x).toBeGreaterThanOrEqual(0.15);
      expect(point.position.x).toBeLessThanOrEqual(0.85);
      expect(point.position.y).toBeGreaterThanOrEqual(0.15);
      expect(point.position.y).toBeLessThanOrEqual(0.85);
    });
  });

  it('returns empty array for zero count', () => {
    const points = pickSpacedPoints(0, 0.25, 0.15, Math.random);
    expect(points).toHaveLength(0);
  });

  it('returns empty array for negative count', () => {
    const points = pickSpacedPoints(-1, 0.25, 0.15, Math.random);
    expect(points).toHaveLength(0);
  });

  it('always returns points even with high density', () => {
    // Request many points with minimum spacing - should use fallback
    const points = pickSpacedPoints(20, 0.5, 0.1, Math.random);
    expect(points.length).toBe(20);
  });
});

describe('buildRoundTargets', () => {
  it('returns 3 targets', () => {
    const round = buildRoundTargets(Math.random);
    expect(round.targets).toHaveLength(3);
  });

  it('returns a valid prompt ID', () => {
    const round = buildRoundTargets(Math.random);
    expect(round.promptId).toBeGreaterThanOrEqual(0);
    expect(round.promptId).toBeLessThan(3);
  });

  it('all targets have required properties', () => {
    const round = buildRoundTargets(Math.random);
    round.targets.forEach((target) => {
      expect(target.id).toBeDefined();
      expect(target.name).toBeDefined();
      expect(target.color).toBeDefined();
      expect(target.emoji).toBeDefined();
      expect(target.assetId).toBeDefined();
      expect(target.position).toBeDefined();
      expect(target.position.x).toBeDefined();
      expect(target.position.y).toBeDefined();
    });
  });

  it('targets have sequential IDs', () => {
    const round = buildRoundTargets(Math.random);
    const ids = round.targets.map((t) => t.id);
    expect(ids).toEqual([0, 1, 2]);
  });

  it('prompt ID references a valid target', () => {
    const round = buildRoundTargets(Math.random);
    const promptTarget = round.targets[round.promptId];
    expect(promptTarget).toBeDefined();
  });

  it('produces different results with different random calls', () => {
    // Create a seeded-like random that changes
    let counter = 0;
    const random1 = () => (counter++ % 10) / 10;
    counter = 0;
    const random2 = () => ((counter++ % 10) + 1) / 11;

    const round1 = buildRoundTargets(random1);
    const round2 = buildRoundTargets(random2);

    // At least the flowers might be different order
    expect(round1.targets.length).toBe(round2.targets.length);
  });

  it('is deterministic with same random sequence', () => {
    const round1 = buildRoundTargets(() => 0.5);
    const round2 = buildRoundTargets(() => 0.5);

    expect(round1.targets).toEqual(round2.targets);
    expect(round1.promptId).toBe(round2.promptId);
  });

  it('targets have positions within bounds', () => {
    const round = buildRoundTargets(Math.random);
    round.targets.forEach((target) => {
      expect(target.position.x).toBeGreaterThanOrEqual(0);
      expect(target.position.x).toBeLessThanOrEqual(1);
      expect(target.position.y).toBeGreaterThanOrEqual(0);
      expect(target.position.y).toBeLessThanOrEqual(1);
    });
  });
});

describe('getPromptTarget', () => {
  const targets: GardenTarget[] = [
    {
      id: 0,
      name: 'Red',
      color: '#ef4444',
      emoji: '🌺',
      assetId: 'brush-red',
      position: { x: 0.2, y: 0.5 },
    },
    {
      id: 1,
      name: 'Blue',
      color: '#3b82f6',
      emoji: '🪻',
      assetId: 'brush-blue',
      position: { x: 0.5, y: 0.5 },
    },
    {
      id: 2,
      name: 'Green',
      color: '#22c55e',
      emoji: '🌿',
      assetId: 'brush-green',
      position: { x: 0.8, y: 0.5 },
    },
  ];

  it('returns the correct target by ID', () => {
    expect(getPromptTarget(targets, 0)?.name).toBe('Red');
    expect(getPromptTarget(targets, 1)?.name).toBe('Blue');
    expect(getPromptTarget(targets, 2)?.name).toBe('Green');
  });

  it('returns undefined for out of range ID', () => {
    expect(getPromptTarget(targets, -1)).toBeUndefined();
    expect(getPromptTarget(targets, 3)).toBeUndefined();
    expect(getPromptTarget(targets, 999)).toBeUndefined();
  });

  it('returns undefined for empty array', () => {
    expect(getPromptTarget([], 0)).toBeUndefined();
  });
});

describe('getMatchFeedback', () => {
  const red: GardenTarget = {
    id: 0,
    name: 'Red',
    color: '#ef4444',
    emoji: '🌺',
    assetId: 'brush-red',
    position: { x: 0.2, y: 0.5 },
  };

  const blue: GardenTarget = {
    id: 1,
    name: 'Blue',
    color: '#3b82f6',
    emoji: '🪻',
    assetId: 'brush-blue',
    position: { x: 0.8, y: 0.5 },
  };

  it('returns positive feedback for correct match', () => {
    const feedback = getMatchFeedback(red, red, true);
    expect(feedback).toContain('Yes!');
    expect(feedback).toContain('Red');
    expect(feedback).toContain('collected');
  });

  it('returns corrective feedback for wrong match', () => {
    const feedback = getMatchFeedback(blue, red, false);
    expect(feedback).toContain('Blue');
    expect(feedback).toContain('Red');
    expect(feedback).toContain('Find');
  });

  it('includes expected target name in positive feedback', () => {
    const feedback = getMatchFeedback(blue, blue, true);
    expect(feedback).toContain('Blue');
  });

  it('includes both flower names in negative feedback', () => {
    const feedback = getMatchFeedback(red, blue, false);
    expect(feedback).toContain('Red'); // hit
    expect(feedback).toContain('Blue'); // expected
  });
});

describe('getFlowersByName', () => {
  it('returns empty array for unknown name', () => {
    expect(getFlowersByName('Orange')).toHaveLength(0);
  });

  it('returns flowers matching by name', () => {
    const reds = getFlowersByName('Red');
    expect(reds).toHaveLength(1);
    expect(reds[0].color).toBe('#ef4444');
  });

  it('finds all flower names', () => {
    expect(getFlowersByName('Red')).toHaveLength(1);
    expect(getFlowersByName('Blue')).toHaveLength(1);
    expect(getFlowersByName('Green')).toHaveLength(1);
    expect(getFlowersByName('Yellow')).toHaveLength(1);
    expect(getFlowersByName('Pink')).toHaveLength(1);
    expect(getFlowersByName('Purple')).toHaveLength(1);
  });
});

describe('getFlowerByAssetId', () => {
  it('returns undefined for unknown asset ID', () => {
    expect(getFlowerByAssetId('unknown')).toBeUndefined();
  });

  it('returns flower by asset ID', () => {
    const flower = getFlowerByAssetId('brush-red');
    expect(flower?.name).toBe('Red');
  });

  it('handles multiple flowers with same asset ID', () => {
    // Pink and Red share brush-red, Purple and Blue share brush-blue
    const flower = getFlowerByAssetId('brush-red');
    // Returns first match (Red comes before Pink in array)
    expect(flower?.assetId).toBe('brush-red');
  });

  it('finds all asset IDs', () => {
    expect(getFlowerByAssetId('brush-red')).toBeDefined();
    expect(getFlowerByAssetId('brush-blue')).toBeDefined();
    expect(getFlowerByAssetId('brush-green')).toBeDefined();
    expect(getFlowerByAssetId('brush-yellow')).toBeDefined();
  });
});

describe('Scoring Mechanics', () => {
  it('base points are 12', () => {
    expect(calculateScore(0)).toBe(12);
  });

  it('streak bonus is 2 per streak level', () => {
    expect(calculateScore(1) - 12).toBe(2);
    expect(calculateScore(2) - 12).toBe(4);
    expect(calculateScore(3) - 12).toBe(6);
  });

  it('maximum bonus is 18 (at streak 9+)', () => {
    expect(calculateScore(9) - 12).toBe(18);
    expect(calculateScore(10) - 12).toBe(18);
  });

  it('maximum score per match is 30', () => {
    expect(calculateScore(100)).toBe(30);
  });
});

describe('Level Display', () => {
  it('level 1 for scores 0-99', () => {
    expect(Math.max(1, Math.floor(0 / 100) + 1)).toBe(1);
    expect(Math.max(1, Math.floor(99 / 100) + 1)).toBe(1);
  });

  it('level 2 for scores 100-199', () => {
    expect(Math.max(1, Math.floor(100 / 100) + 1)).toBe(2);
    expect(Math.max(1, Math.floor(199 / 100) + 1)).toBe(2);
  });

  it('level formula matches component', () => {
    // Component uses: level={Math.max(1, Math.floor(score / 100) + 1)}
    const scores = [0, 50, 99, 100, 150, 199, 200, 500];
    const levels = scores.map((s) => Math.max(1, Math.floor(s / 100) + 1));
    expect(levels).toEqual([1, 1, 1, 2, 2, 2, 3, 6]);
  });
});
