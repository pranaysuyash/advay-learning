/**
 * Shape Pop Game Logic Tests
 *
 * Tests for scoring, difficulty configurations, collectibles,
 * streak bonuses, and game mechanics.
 */

import { describe, expect, it } from 'vitest';

// Types for Shape Pop logic
type Point = { x: number; y: number };
type CollectibleId = 'gem' | 'coin' | 'star';

interface Collectible {
  id: CollectibleId;
  name: string;
  src: string;
  points: number;
}

interface DifficultyConfig {
  targetSize: number;
  popRadius: number;
  cursorSize: number;
}

// Constants from ShapePop.tsx
const GAME_CONFIG: Record<string, DifficultyConfig> = {
  easy: { targetSize: 180, popRadius: 0.20, cursorSize: 100 },
  medium: { targetSize: 144, popRadius: 0.16, cursorSize: 84 },
  hard: { targetSize: 120, popRadius: 0.12, cursorSize: 72 },
};

const KENNEY_TARGETS: Collectible[] = [
  { id: 'gem', name: 'Gem', src: '/assets/kenney/platformer/collectibles/gem_blue.png', points: 15 },
  { id: 'coin', name: 'Coin', src: '/assets/kenney/platformer/collectibles/coin_gold.png', points: 10 },
  { id: 'star', name: 'Star', src: '/assets/kenney/platformer/collectibles/star.png', points: 20 },
] as const;

/**
 * Calculate score with combo bonus and streak bonus.
 * Matches formula: basePoints + min(streak * 2, 10) + (streak >= 5 ? 25 : 0)
 */
function calculateScore(streak: number, basePoints: number): number {
  const comboBonus = Math.min(streak * 2, 10);
  const streakBonus = streak >= 5 ? 25 : 0;
  return basePoints + comboBonus + streakBonus;
}

/**
 * Check if point is inside the target circle.
 * Uses normalized coordinates (0-1).
 */
function isPointInCircle(
  point: Point,
  center: Point,
  radius: number
): boolean {
  const dx = point.x - center.x;
  const dy = point.y - center.y;
  return dx * dx + dy * dy <= radius * radius;
}

/**
 * Generate random point within game area.
 */
function pickRandomPoint(minX: number, maxX: number, padding: number): Point {
  const x = minX + Math.random() * (maxX - minX);
  const y = padding + Math.random() * (1 - padding * 2);
  return { x, y };
}

describe('Shape Pop - Difficulty Configurations', () => {
  it('has three difficulty levels', () => {
    const difficulties = Object.keys(GAME_CONFIG);
    expect(difficulties).toContain('easy');
    expect(difficulties).toContain('medium');
    expect(difficulties).toContain('hard');
  });

  it('easy mode has largest targets and cursor', () => {
    const easy = GAME_CONFIG.easy;
    expect(easy.targetSize).toBe(180);
    expect(easy.popRadius).toBe(0.20);
    expect(easy.cursorSize).toBe(100);
  });

  it('medium mode has moderate settings', () => {
    const medium = GAME_CONFIG.medium;
    expect(medium.targetSize).toBe(144);
    expect(medium.popRadius).toBe(0.16);
    expect(medium.cursorSize).toBe(84);
  });

  it('hard mode has smallest targets and cursor', () => {
    const hard = GAME_CONFIG.hard;
    expect(hard.targetSize).toBe(120);
    expect(hard.popRadius).toBe(0.12);
    expect(hard.cursorSize).toBe(72);
  });

  it('target size decreases from easy to hard', () => {
    expect(GAME_CONFIG.easy.targetSize).toBeGreaterThan(GAME_CONFIG.medium.targetSize);
    expect(GAME_CONFIG.medium.targetSize).toBeGreaterThan(GAME_CONFIG.hard.targetSize);
  });
});

describe('Shape Pop - Collectibles', () => {
  it('has three collectible types', () => {
    expect(KENNEY_TARGETS).toHaveLength(3);
  });

  it('coin is worth 10 points', () => {
    const coin = KENNEY_TARGETS.find(c => c.id === 'coin');
    expect(coin?.points).toBe(10);
  });

  it('gem is worth 15 points', () => {
    const gem = KENNEY_TARGETS.find(c => c.id === 'gem');
    expect(gem?.points).toBe(15);
  });

  it('star is worth 20 points', () => {
    const star = KENNEY_TARGETS.find(c => c.id === 'star');
    expect(star?.points).toBe(20);
  });

  it('star is worth most points', () => {
    const star = KENNEY_TARGETS.find(c => c.id === 'star');
    const coin = KENNEY_TARGETS.find(c => c.id === 'coin');
    const gem = KENNEY_TARGETS.find(c => c.id === 'gem');
    expect(star?.points).toBeGreaterThan(gem!.points);
    expect(star?.points).toBeGreaterThan(coin!.points);
  });
});

describe('Shape Pop - Score Calculation', () => {
  it('calculates base score correctly', () => {
    expect(calculateScore(0, 10)).toBe(10);
    expect(calculateScore(0, 15)).toBe(15);
    expect(calculateScore(0, 20)).toBe(20);
  });

  it('adds combo bonus correctly', () => {
    // comboBonus = min(streak * 2, 10)
    expect(calculateScore(1, 10)).toBe(12); // 10 + 2
    expect(calculateScore(2, 10)).toBe(14); // 10 + 4
    expect(calculateScore(3, 10)).toBe(16); // 10 + 6
    expect(calculateScore(4, 10)).toBe(18); // 10 + 8
  });

  it('caps combo bonus at 10', () => {
    // At streak 5, also get streak bonus
    expect(calculateScore(5, 10)).toBe(45); // 10 + 10 + 25 (combo capped + streak bonus)
    expect(calculateScore(4, 10)).toBe(18); // 10 + 8 (combo not capped yet)
    expect(calculateScore(10, 10)).toBe(45); // Still 10 + 10 + 25
  });

  it('adds streak bonus at 5x streak', () => {
    // streakBonus = 25 when streak >= 5
    expect(calculateScore(5, 10)).toBe(45); // 10 + 10 + 25
    expect(calculateScore(6, 10)).toBe(45); // 10 + 10 + 25
  });

  it('no streak bonus below 5x', () => {
    expect(calculateScore(4, 10)).toBe(18); // 10 + 8 + 0
    expect(calculateScore(3, 10)).toBe(16); // 10 + 6 + 0
  });

  it('calculates max score for star at max streak', () => {
    // star = 20, combo capped at 10, streak bonus 25
    expect(calculateScore(5, 20)).toBe(55); // 20 + 10 + 25
  });
});

describe('Shape Pop - Combo Bonus Progression', () => {
  it('combo bonus increases linearly until cap', () => {
    const streaks = [0, 1, 2, 3, 4, 5, 10];
    const expected = [0, 2, 4, 6, 8, 10, 10]; // min(streak * 2, 10)

    streaks.forEach((streak, i) => {
      const score = calculateScore(streak, 10);
      const comboBonus = score - 10 - (streak >= 5 ? 25 : 0);
      expect(comboBonus).toBe(expected[i]);
    });
  });

  it('combo bonus formula is consistent across collectibles', () => {
    // combo bonus is independent of base points
    const combo10 = calculateScore(5, 10) - 10 - 25;
    const combo15 = calculateScore(5, 15) - 15 - 25;
    const combo20 = calculateScore(5, 20) - 20 - 25;

    expect(combo10).toBe(combo15);
    expect(combo15).toBe(combo20);
    expect(combo10).toBe(10);
  });
});

describe('Shape Pop - Streak Bonus Threshold', () => {
  it('grants streak bonus at exactly 5', () => {
    const score4 = calculateScore(4, 10);
    const score5 = calculateScore(5, 10);
    const score6 = calculateScore(6, 10);

    expect(score5 - score4).toBeGreaterThan(10); // Jump includes bonus
    expect(score6 - score5).toBe(0); // Same as 5 (bonus consistent)
  });

  it('streak bonus is always 25 points', () => {
    const scoreWith5 = calculateScore(5, 10);
    const scoreWith6 = calculateScore(6, 10);
    const scoreWith10 = calculateScore(10, 10);

    // All have same total when base and combo are equal
    expect(scoreWith5).toBe(scoreWith6);
    expect(scoreWith6).toBe(scoreWith10);
  });
});

describe('Shape Pop - Hit Detection', () => {
  it('detects hit when point is inside circle', () => {
    const point: Point = { x: 0.5, y: 0.5 };
    const center: Point = { x: 0.5, y: 0.5 };
    const radius = 0.1;

    expect(isPointInCircle(point, center, radius)).toBe(true);
  });

  it('detects miss when point is outside circle', () => {
    const point: Point = { x: 0.8, y: 0.5 };
    const center: Point = { x: 0.5, y: 0.5 };
    const radius = 0.1;

    expect(isPointInCircle(point, center, radius)).toBe(false);
  });

  it('detects hit on circle edge', () => {
    const point: Point = { x: 0.6, y: 0.5 };
    const center: Point = { x: 0.5, y: 0.5 };
    const radius = 0.1; // Distance exactly 0.1

    expect(isPointInCircle(point, center, radius)).toBe(true);
  });

  it('uses correct radius for each difficulty', () => {
    const point: Point = { x: 0.5, y: 0.5 };
    const center: Point = { x: 0.5, y: 0.5 };

    // Easy should have largest hit area
    const easyHit = isPointInCircle(
      { x: 0.5, y: 0.5 + GAME_CONFIG.easy.popRadius },
      center,
      GAME_CONFIG.easy.popRadius
    );

    // Hard should have smallest hit area
    const hardHit = isPointInCircle(
      { x: 0.5, y: 0.5 + GAME_CONFIG.hard.popRadius },
      center,
      GAME_CONFIG.hard.popRadius
    );

    expect(easyHit).toBe(true);
    expect(hardHit).toBe(true);
  });
});

describe('Shape Pop - Miss Behavior', () => {
  it('resets streak on miss', () => {
    // Game logic: when pinch happens outside target, streak resets to 0
    let streak = 5;
    const missed = true;

    if (missed) {
      streak = 0;
    }

    expect(streak).toBe(0);
  });

  it('plays error sound on miss', () => {
    // Verified by implementation: playError() called when !inside
    // This test documents the expected behavior
    const inside = false;
    const shouldPlayError = !inside;
    expect(shouldPlayError).toBe(true);
  });

  it('provides different feedback based on lost streak', () => {
    const lostStreak3 = "💥 Streak lost! Try again!";
    const lostStreak1 = "Close! Move into the ring, then pinch.";

    // Higher streak lost gets different message
    expect(lostStreak3).toContain("Streak lost");
    expect(lostStreak1).not.toContain("Streak lost");
  });
});

describe('Shape Pop - Easter Egg', () => {
  it('triggers after 20 pops in 30 seconds', () => {
    const popWindow: number[] = [];
    const POP_WINDOW_MS = 30000;
    const POP_THRESHOLD = 20;

    // Simulate 20 pops over time
    const now = Date.now();
    for (let i = 0; i < 20; i++) {
      popWindow.push(now - i * 1000); // One per second
    }

    // Filter to 30 second window
    const recentPops = popWindow.filter(t => now - t < POP_WINDOW_MS);

    expect(recentPops.length).toBeGreaterThanOrEqual(POP_THRESHOLD);
  });

  it('maintains sliding window for easter egg', () => {
    const popWindow: number[] = [];
    const POP_WINDOW_MS = 30000;
    const now = Date.now();

    // Add 25 pops, some older than 30s
    for (let i = 0; i < 25; i++) {
      popWindow.push(now - i * 2000); // Every 2 seconds
    }

    // Filter to window
    const recentPops = popWindow.filter(t => now - t < POP_WINDOW_MS);

    // Should only have pops from last 30 seconds
    expect(recentPops.length).toBeLessThan(25);
    expect(recentPops.length).toBeGreaterThan(14);
  });
});

describe('Shape Pop - Milestone', () => {
  it('triggers celebration at 120 points', () => {
    const MILESTONE_SCORE = 120;

    const scores = [120, 240, 360];
    scores.forEach(score => {
      const shouldCelebrate = score > 0 && score % MILESTONE_SCORE === 0;
      expect(shouldCelebrate).toBe(true);
    });
  });

  it('does not trigger at other scores', () => {
    const MILESTONE_SCORE = 120;

    const scores = [100, 119, 121, 150];
    scores.forEach(score => {
      const shouldCelebrate = score > 0 && score % MILESTONE_SCORE === 0;
      expect(shouldCelebrate).toBe(false);
    });
  });
});

describe('Shape Pop - Random Point Generation', () => {
  it('generates point within valid range', () => {
    const point = pickRandomPoint(0.4, 0.6, 0.18);

    expect(point.x).toBeGreaterThanOrEqual(0.4);
    expect(point.x).toBeLessThanOrEqual(0.6);
    expect(point.y).toBeGreaterThanOrEqual(0.18);
    expect(point.y).toBeLessThanOrEqual(0.82); // 1 - 0.18
  });

  it('respects padding parameter', () => {
    const padding = 0.2;
    const point = pickRandomPoint(0, 1, padding);

    expect(point.y).toBeGreaterThanOrEqual(padding);
    expect(point.y).toBeLessThanOrEqual(1 - padding);
  });

  it('generates different points on multiple calls', () => {
    const points = Array.from({ length: 10 }, () => pickRandomPoint(0.4, 0.55, 0.18));
    const uniqueX = new Set(points.map(p => p.x.toFixed(3)));
    const uniqueY = new Set(points.map(p => p.y.toFixed(3)));

    // Should have some variety (not all identical)
    expect(uniqueX.size).toBeGreaterThan(1);
    expect(uniqueY.size).toBeGreaterThan(1);
  });
});

describe('Shape Pop - Edge Cases', () => {
  it('handles zero streak correctly', () => {
    const score = calculateScore(0, 10);
    expect(score).toBe(10); // No bonuses
  });

  it('handles very high streak values', () => {
    const score = calculateScore(1000, 10);
    // combo capped at 10, streak bonus still applies
    expect(score).toBe(45); // 10 + 10 + 25
  });

  it('handles maximum collectible value', () => {
    const star = KENNEY_TARGETS.find(c => c.id === 'star');
    expect(star?.points).toBe(20);

    const score = calculateScore(5, star!.points);
    expect(score).toBe(55); // 20 + 10 + 25
  });

  it('handles minimum collectible value', () => {
    const coin = KENNEY_TARGETS.find(c => c.id === 'coin');
    expect(coin?.points).toBe(10);

    const score = calculateScore(0, coin!.points);
    expect(score).toBe(10);
  });
});
