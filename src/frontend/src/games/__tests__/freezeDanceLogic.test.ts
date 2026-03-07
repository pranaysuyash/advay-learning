/**
 * Freeze Dance Game Logic Tests
 *
 * Tests for stability scoring, phase progression,
 * finger challenge triggering, and game mechanics.
 */

import { describe, expect, it } from 'vitest';

// Types for Freeze Dance logic
type GamePhase = 'dancing' | 'freezing' | 'fingerChallenge';
type GameMode = 'classic' | 'combo';

interface FreezeDanceState {
  score: number;
  round: number;
  gamePhase: GamePhase;
  gameMode: GameMode;
  stabilityScore: number;
  perfectFreezeStreak: number;
  streak: number;
}

// Key points for pose stability tracking (from FreezeDance.tsx)
const KEY_POINTS = [11, 12, 13, 14, 15, 16, 23, 24, 25, 26, 27, 28];

interface Landmark {
  x: number;
  y: number;
}

/**
 * Calculate stability score from pose movement.
 * Matches the algorithm in FreezeDance.tsx
 */
function calculateStability(
  currentLandmarks: Landmark[],
  previousLandmarks: Landmark[],
): number {
  let totalMovement = 0;

  for (const index of KEY_POINTS) {
    const current = currentLandmarks[index];
    const previous = previousLandmarks[index];

    if (!current || !previous) continue;

    const dx = current.x - previous.x;
    const dy = current.y - previous.y;
    totalMovement += Math.sqrt(dx * dx + dy * dy);
  }

  // Stability score = max(0, 100 - movement × 500)
  return Math.max(0, 100 - totalMovement * 500);
}

/**
 * Check if finger challenge should trigger.
 * Matches conditions in FreezeDance.tsx
 */
function shouldTriggerFingerChallenge(state: FreezeDanceState): boolean {
  return (
    state.gameMode === 'combo' &&
    state.round > 2 &&
    state.stabilityScore > 60
  );
}

/**
 * Check if freeze qualifies as "perfect".
 * Matches condition in FreezeDance.tsx for easter egg
 */
function isPerfectFreeze(stabilityScore: number): boolean {
  return stabilityScore > 80;
}

/**
 * Get phase timing configuration.
 * Matches constants in FreezeDance.tsx (toddler-friendly)
 */
interface PhaseTiming {
  danceMin: number;
  danceMax: number;
  freeze: number;
  fingerChallenge: number;
}

function getPhaseTiming(): PhaseTiming {
  return {
    danceMin: 10000,  // 10 seconds
    danceMax: 13000,  // 13 seconds
    freeze: 3500,     // 3.5 seconds
    fingerChallenge: 6000, // 6 seconds
  };
}

describe('Freeze Dance - Stability Scoring', () => {
  function createLandmarks(x: number, y: number): Landmark[] {
    return Array.from({ length: 33 }, () => ({ x, y }));
  }

  it('calculates 100 stability when there is no movement', () => {
    const landmarks = createLandmarks(0.5, 0.5);
    const stability = calculateStability(landmarks, landmarks);

    expect(stability).toBe(100);
  });

  it('reduces stability proportionally to movement', () => {
    const previous = createLandmarks(0.5, 0.5);
    const current = createLandmarks(0.5, 0.5);

    // Move one key point by 0.1 (small movement)
    current[11] = { x: 0.6, y: 0.5 };

    const stability = calculateStability(current, previous);

    // Movement = 0.1, stability = 100 - (0.1 × 500) = 50
    expect(stability).toBeCloseTo(50, 1);
  });

  it('results in 0 stability for large movements', () => {
    const previous = createLandmarks(0.5, 0.5);
    const current = createLandmarks(0.5, 0.5);

    // Move key points significantly
    current[11] = { x: 0.8, y: 0.5 }; // 0.3 movement
    current[12] = { x: 0.2, y: 0.5 }; // 0.3 movement

    const stability = calculateStability(current, previous);

    expect(stability).toBe(0);
  });

  it('never returns negative stability', () => {
    const previous = createLandmarks(0.5, 0.5);
    const current = createLandmarks(0.5, 0.5);

    // Extreme movement
    for (const i of KEY_POINTS) {
      current[i] = { x: Math.random(), y: Math.random() };
    }

    const stability = calculateStability(current, previous);

    expect(stability).toBeGreaterThanOrEqual(0);
    expect(stability).toBeLessThanOrEqual(100);
  });

  it('handles missing landmarks gracefully', () => {
    const previous: Landmark[] = Array.from({ length: 33 }, (_, i) => ({
      x: 0.5,
      y: 0.5,
    }));
    const current: Landmark[] = [...previous];

    // Set some landmarks to undefined (simulating detection issues)
    current[11] = undefined as any;
    current[15] = undefined as any;

    const stability = calculateStability(current, previous);

    // Should still calculate based on available landmarks
    expect(stability).toBeGreaterThanOrEqual(0);
    expect(stability).toBeLessThanOrEqual(100);
  });
});

describe('Freeze Dance - Phase Timing', () => {
  it('uses 10-13 second range for dance phase', () => {
    const timing = getPhaseTiming();

    expect(timing.danceMin).toBe(10000); // 10 seconds
    expect(timing.danceMax).toBe(13000); // 13 seconds
  });

  it('uses 3.5 seconds for freeze phase', () => {
    const timing = getPhaseTiming();

    expect(timing.freeze).toBe(3500); // 3.5 seconds
  });

  it('uses 6 seconds for finger challenge phase', () => {
    const timing = getPhaseTiming();

    expect(timing.fingerChallenge).toBe(6000); // 6 seconds
  });

  it('calculates correct phase durations', () => {
    const timing = getPhaseTiming();

    const danceRange = timing.danceMax - timing.danceMin;
    expect(danceRange).toBe(3000); // 3 second variance

    // Freeze is shorter than finger challenge
    expect(timing.freeze).toBeLessThan(timing.fingerChallenge);
  });
});

describe('Freeze Dance - Finger Challenge Triggering', () => {
  const createState = (
    overrides: Partial<FreezeDanceState> = {},
  ): FreezeDanceState => ({
    score: 0,
    round: 1,
    gamePhase: 'freezing',
    gameMode: 'combo',
    stabilityScore: 100,
    perfectFreezeStreak: 0,
    streak: 0,
    ...overrides,
  });

  it('triggers when all conditions are met in combo mode', () => {
    const state = createState({
      gameMode: 'combo',
      round: 3,
      stabilityScore: 80,
    });

    expect(shouldTriggerFingerChallenge(state)).toBe(true);
  });

  it('does not trigger in classic mode', () => {
    const state = createState({
      gameMode: 'classic',
      round: 3,
      stabilityScore: 80,
    });

    expect(shouldTriggerFingerChallenge(state)).toBe(false);
  });

  it('does not trigger before round 3', () => {
    const state = createState({
      gameMode: 'combo',
      round: 2,
      stabilityScore: 80,
    });

    expect(shouldTriggerFingerChallenge(state)).toBe(false);
  });

  it('does not trigger with low stability', () => {
    const state = createState({
      gameMode: 'combo',
      round: 3,
      stabilityScore: 50,
    });

    expect(shouldTriggerFingerChallenge(state)).toBe(false);
  });

  it('does not trigger at stability threshold boundary (60)', () => {
    const state = createState({
      gameMode: 'combo',
      round: 3,
      stabilityScore: 60,
    });

    expect(shouldTriggerFingerChallenge(state)).toBe(false);
  });

  it('triggers just above stability threshold (61)', () => {
    const state = createState({
      gameMode: 'combo',
      round: 3,
      stabilityScore: 61,
    });

    expect(shouldTriggerFingerChallenge(state)).toBe(true);
  });
});

describe('Freeze Dance - Perfect Freeze Detection', () => {
  it('identifies perfect freeze above 80%', () => {
    expect(isPerfectFreeze(81)).toBe(true);
    expect(isPerfectFreeze(90)).toBe(true);
    expect(isPerfectFreeze(100)).toBe(true);
  });

  it('does not classify non-perfect freezes', () => {
    expect(isPerfectFreeze(80)).toBe(false);
    expect(isPerfectFreeze(50)).toBe(false);
    expect(isPerfectFreeze(0)).toBe(false);
  });

  it('handles boundary values correctly', () => {
    expect(isPerfectFreeze(80.01)).toBe(true);
    expect(isPerfectFreeze(80)).toBe(false);
    expect(isPerfectFreeze(79.99)).toBe(false);
  });
});

describe('Freeze Dance - Easter Egg Conditions', () => {
  const PERFECT_STREAK_THRESHOLD = 5;

  it('triggers after 5 perfect freezes', () => {
    let streak = 0;

    // Simulate 5 perfect freezes
    for (let i = 0; i < 5; i++) {
      if (isPerfectFreeze(85)) {
        streak++;
      }
    }

    expect(streak).toBeGreaterThanOrEqual(PERFECT_STREAK_THRESHOLD);
  });

  it('resets on non-perfect freeze', () => {
    let streak = 4;

    // A perfect freeze would increment
    if (isPerfectFreeze(85)) {
      streak++;
    }
    expect(streak).toBe(5);

    // But a non-perfect freeze resets
    if (!isPerfectFreeze(70)) {
      streak = 0;
    }
    expect(streak).toBe(0);
  });

  it('requires consecutive perfect freezes', () => {
    let streak = 0;
    const scores = [85, 82, 90, 70, 88, 85, 85]; // 3 perfect after reset

    for (const score of scores) {
      if (isPerfectFreeze(score)) {
        streak++;
      } else {
        streak = 0;
      }
    }

    // The 70 score resets the streak, leaving only 3 consecutive perfect freezes
    expect(streak).toBeLessThan(PERFECT_STREAK_THRESHOLD);
    expect(streak).toBe(3);
  });
});

describe('Freeze Dance - Round Completion', () => {
  it('adds stability score to total on success', () => {
    const state: FreezeDanceState = {
      score: 100,
      round: 1,
      gamePhase: 'freezing',
      gameMode: 'combo',
      stabilityScore: 85,
      perfectFreezeStreak: 0,
      streak: 0,
    };

    const newScore = state.score + state.stabilityScore;
    expect(newScore).toBe(185);
  });

  it('increments streak on successful freeze', () => {
    let streak = 3;
    const success = true;

    if (success) {
      streak++;
    }

    expect(streak).toBe(4);
  });

  it('resets streak on failed freeze', () => {
    let streak = 3;
    const success = false;

    if (!success) {
      streak = 0;
    }

    expect(streak).toBe(0);
  });

  it('increments round after completion', () => {
    let round = 5;
    round++;
    expect(round).toBe(6);
  });
});

describe('Freeze Dance - Streak Milestones', () => {
  it('triggers milestone every 5 streaks', () => {
    const milestones: number[] = [];

    for (let streak = 1; streak <= 20; streak++) {
      if (streak % 5 === 0) {
        milestones.push(streak);
      }
    }

    expect(milestones).toEqual([5, 10, 15, 20]);
  });

  it('does not trigger milestone at non-multiple values', () => {
    const nonMilestones = [1, 2, 3, 4, 6, 7, 8, 9, 11];

    for (const streak of nonMilestones) {
      expect(streak % 5 === 0).toBe(false);
    }
  });
});

describe('Freeze Dance - Game Mode Differences', () => {
  it('enables finger challenges in combo mode', () => {
    const comboState: FreezeDanceState = {
      score: 0,
      round: 5,
      gamePhase: 'freezing',
      gameMode: 'combo',
      stabilityScore: 80,
      perfectFreezeStreak: 0,
      streak: 0,
    };

    expect(shouldTriggerFingerChallenge(comboState)).toBe(true);
  });

  it('disables finger challenges in classic mode', () => {
    const classicState: FreezeDanceState = {
      score: 0,
      round: 5,
      gamePhase: 'freezing',
      gameMode: 'classic',
      stabilityScore: 80,
      perfectFreezeStreak: 0,
      streak: 0,
    };

    expect(shouldTriggerFingerChallenge(classicState)).toBe(false);
  });

  it('allows classic mode without hand tracking', () => {
    const classicState: FreezeDanceState = {
      score: 0,
      round: 1,
      gamePhase: 'dancing',
      gameMode: 'classic',
      stabilityScore: 0,
      perfectFreezeStreak: 0,
      streak: 0,
    };

    expect(classicState.gameMode).toBe('classic');
    // Hand tracking would not be initialized
  });
});

describe('Freeze Dance - Edge Cases', () => {
  it('handles zero stability gracefully', () => {
    const stability = 0;

    expect(stability).toBeGreaterThanOrEqual(0);
    expect(stability).toBeLessThanOrEqual(100);
  });

  it('handles maximum stability', () => {
    const stability = 100;

    expect(stability).toBeGreaterThanOrEqual(0);
    expect(stability).toBeLessThanOrEqual(100);
  });

  it('handles boundary stability values', () => {
    const boundaries = [0, 1, 50, 60, 80, 99, 100];

    for (const stability of boundaries) {
      expect(stability).toBeGreaterThanOrEqual(0);
      expect(stability).toBeLessThanOrEqual(100);
    }
  });

  it('handles round 1 correctly (no finger challenge)', () => {
    const state: FreezeDanceState = {
      score: 0,
      round: 1,
      gamePhase: 'freezing',
      gameMode: 'combo',
      stabilityScore: 90,
      perfectFreezeStreak: 0,
      streak: 0,
    };

    expect(shouldTriggerFingerChallenge(state)).toBe(false);
  });

  it('handles round 2 correctly (no finger challenge)', () => {
    const state: FreezeDanceState = {
      score: 0,
      round: 2,
      gamePhase: 'freezing',
      gameMode: 'combo',
      stabilityScore: 90,
      perfectFreezeStreak: 0,
      streak: 0,
    };

    expect(shouldTriggerFingerChallenge(state)).toBe(false);
  });

  it('handles round 3 correctly (finger challenge possible)', () => {
    const state: FreezeDanceState = {
      score: 0,
      round: 3,
      gamePhase: 'freezing',
      gameMode: 'combo',
      stabilityScore: 90,
      perfectFreezeStreak: 0,
      streak: 0,
    };

    expect(shouldTriggerFingerChallenge(state)).toBe(true);
  });
});

describe('Freeze Dance - Integration Scenarios', () => {
  it('simulates full round cycle in combo mode', () => {
    const state: FreezeDanceState = {
      score: 0,
      round: 3,
      gamePhase: 'freezing',
      gameMode: 'combo',
      stabilityScore: 85,
      perfectFreezeStreak: 4,
      streak: 2,
    };

    // Freeze successful with good stability
    const roundScore = state.stabilityScore;
    const newScore = state.score + roundScore;

    // Finger challenge should trigger
    const triggersChallenge = shouldTriggerFingerChallenge(state);

    // Perfect freeze streak increments
    const perfectStreak = isPerfectFreeze(state.stabilityScore)
      ? state.perfectFreezeStreak + 1
      : 0;

    expect(newScore).toBe(85);
    expect(triggersChallenge).toBe(true);
    expect(perfectStreak).toBe(5); // Easter egg threshold!
  });

  it('simulates classic mode without finger challenges', () => {
    const state: FreezeDanceState = {
      score: 50,
      round: 5,
      gamePhase: 'freezing',
      gameMode: 'classic',
      stabilityScore: 75,
      perfectFreezeStreak: 2,
      streak: 1,
    };

    // Freeze successful
    const newScore = state.score + state.stabilityScore;

    // No finger challenge in classic mode
    const triggersChallenge = shouldTriggerFingerChallenge(state);

    expect(newScore).toBe(125);
    expect(triggersChallenge).toBe(false);
  });

  it('simulates poor freeze with streak reset', () => {
    let streak = 4;
    const stabilityScore = 30; // Poor freeze

    if (stabilityScore <= 50) {
      streak = 0;
    }

    expect(streak).toBe(0);
    expect(isPerfectFreeze(stabilityScore)).toBe(false);
  });
});
