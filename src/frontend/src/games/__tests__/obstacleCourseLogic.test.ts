import { describe, expect, it } from 'vitest';

import {
  advanceObstacleCourseState,
  completeCurrentObstacle,
  createObstacleCourseRoundState,
  createObstacleSequence,
  getCurrentObstacle,
} from '../obstacleCourseLogic';

describe('obstacleCourseLogic', () => {
  it('creates progressively longer sequences', () => {
    expect(createObstacleSequence(1)).toHaveLength(3);
    expect(createObstacleSequence(3)).toHaveLength(5);
  });

  it('advances score and obstacle index when an obstacle is completed', () => {
    const start = 1_000;
    const state = createObstacleCourseRoundState(1, start);
    const currentObstacle = getCurrentObstacle(state)!;

    const next = completeCurrentObstacle(
      state,
      {
        type: currentObstacle.action,
        detected: true,
        confidence: 0.9,
        primaryMetric: 1,
        detail: 'test',
      },
      start + 500,
    );

    expect(next.currentIndex).toBe(1);
    expect(next.completedObstacles).toBe(1);
    expect(next.score).toBeGreaterThan(state.score);
  });

  it('times out an obstacle and moves to the next one', () => {
    const start = 5_000;
    const state = createObstacleCourseRoundState(1, start);
    const currentObstacle = getCurrentObstacle(state)!;

    const next = advanceObstacleCourseState(
      state,
      start + currentObstacle.timeLimitMs + 1,
    );

    expect(next.currentIndex).toBe(1);
    expect(next.missedObstacles).toBe(1);
    expect(next.streak).toBe(0);
  });
});
