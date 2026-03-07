/**
 * Steady Hand Lab Game Logic Tests
 *
 * Tests for hold progress mechanics, target positioning,
 * and edge cases for the Steady Hand Lab educational game.
 */

import { describe, expect, it } from 'vitest';

import { pickTargetPoint, updateHoldProgress, type HoldProgressOptions } from '../steadyHandLogic';

describe('steadyHandLogic - Hold Progress Mechanics', () => {
  it('increases progress while inside target', () => {
    const next = updateHoldProgress({
      current: 0.2,
      isInside: true,
      deltaTimeMs: 500,
      holdDurationMs: 2000,
    });

    expect(next).toBeCloseTo(0.45, 5);
  });

  it('decays progress while outside target', () => {
    const next = updateHoldProgress({
      current: 0.8,
      isInside: false,
      deltaTimeMs: 700,
      decayDurationMs: 1400,
    });

    expect(next).toBeCloseTo(0.3, 5);
  });

  it('clamps progress between 0 and 1', () => {
    expect(
      updateHoldProgress({ current: 0.95, isInside: true, deltaTimeMs: 500 }),
    ).toBe(1);
    expect(
      updateHoldProgress({ current: 0.05, isInside: false, deltaTimeMs: 500 }),
    ).toBe(0);
  });

  it('uses default duration values when not provided', () => {
    // Test default holdDurationMs = 2500
    const next = updateHoldProgress({
      current: 0,
      isInside: true,
      deltaTimeMs: 1250, // Half of default hold duration
    });

    expect(next).toBeCloseTo(0.5, 5);
  });

  it('uses default decay duration when not provided', () => {
    // Test default decayDurationMs = 1400
    // 700ms is half of decay time, so 0.5 - 0.5 = 0
    const next = updateHoldProgress({
      current: 0.5,
      isInside: false,
      deltaTimeMs: 700, // Half of default decay duration (1400ms)
    });

    // 700ms / 1400ms = 0.5, so we lose half our progress
    expect(next).toBeCloseTo(0, 5);
  });

  it('handles zero deltaTime without changing progress', () => {
    const next = updateHoldProgress({
      current: 0.5,
      isInside: true,
      deltaTimeMs: 0,
    });

    expect(next).toBe(0.5);
  });

  it('handles negative deltaTime without changing progress', () => {
    const next = updateHoldProgress({
      current: 0.5,
      isInside: true,
      deltaTimeMs: -100,
    });

    expect(next).toBe(0.5);
  });

  it('completes full hold cycle from 0 to 1', () => {
    let progress = 0;
    const stepMs = 100;
    const totalHoldTime = 2500;

    for (let elapsed = 0; elapsed < totalHoldTime; elapsed += stepMs) {
      progress = updateHoldProgress({
        current: progress,
        isInside: true,
        deltaTimeMs: stepMs,
      });
    }

    expect(progress).toBe(1);
  });

  it('completes full decay cycle from 1 to 0', () => {
    let progress = 1;
    const stepMs = 100;
    const totalDecayTime = 1400;

    for (let elapsed = 0; elapsed < totalDecayTime; elapsed += stepMs) {
      progress = updateHoldProgress({
        current: progress,
        isInside: false,
        deltaTimeMs: stepMs,
      });
    }

    // Due to floating point arithmetic, progress may be very close to 0 but not exactly 0
    expect(progress).toBeGreaterThanOrEqual(0);
    expect(progress).toBeLessThan(0.001);
  });
});

describe('steadyHandLogic - Custom Duration Behavior', () => {
  it('respects custom hold duration', () => {
    const next = updateHoldProgress({
      current: 0,
      isInside: true,
      deltaTimeMs: 500,
      holdDurationMs: 1000, // 1 second hold
    });

    // 500ms / 1000ms = 0.5
    expect(next).toBeCloseTo(0.5, 5);
  });

  it('respects custom decay duration', () => {
    const next = updateHoldProgress({
      current: 1,
      isInside: false,
      deltaTimeMs: 500,
      decayDurationMs: 1000, // 1 second decay
    });

    // 1 - (500ms / 1000ms) = 0.5
    expect(next).toBeCloseTo(0.5, 5);
  });

  it('allows both custom durations simultaneously', () => {
    // First build up progress with fast hold
    let progress = updateHoldProgress({
      current: 0,
      isInside: true,
      deltaTimeMs: 250,
      holdDurationMs: 500,
    });

    expect(progress).toBeCloseTo(0.5, 5);

    // Then decay with slow decay
    progress = updateHoldProgress({
      current: progress,
      isInside: false,
      deltaTimeMs: 500,
      decayDurationMs: 2000,
    });

    // 0.5 - (500/2000) = 0.25
    expect(progress).toBeCloseTo(0.25, 5);
  });
});

describe('steadyHandLogic - Edge Cases and Boundaries', () => {
  it('handles progress exactly at 0 boundary', () => {
    const next = updateHoldProgress({
      current: 0,
      isInside: false,
      deltaTimeMs: 100,
    });

    expect(next).toBe(0);
  });

  it('handles progress exactly at 1 boundary', () => {
    const next = updateHoldProgress({
      current: 1,
      isInside: true,
      deltaTimeMs: 100,
    });

    expect(next).toBe(1);
  });

  it('handles rapid inside/outside transitions', () => {
    let progress = 0.5;

    // Go inside
    progress = updateHoldProgress({
      current: progress,
      isInside: true,
      deltaTimeMs: 100,
    });

    // Go outside
    progress = updateHoldProgress({
      current: progress,
      isInside: false,
      deltaTimeMs: 100,
    });

    // Should be different from original due to different rates
    expect(progress).toBeGreaterThan(0);
    expect(progress).toBeLessThan(1);
  });

  it('handles very small deltaTime values', () => {
    const next = updateHoldProgress({
      current: 0.5,
      isInside: true,
      deltaTimeMs: 1,
    });

    // Should make a tiny change
    expect(next).toBeGreaterThan(0.5);
    expect(next).toBeLessThan(0.51);
  });

  it('handles very large deltaTime values', () => {
    const next = updateHoldProgress({
      current: 0,
      isInside: true,
      deltaTimeMs: 10000, // 10 seconds
    });

    // Should clamp to 1
    expect(next).toBe(1);
  });
});

describe('steadyHandLogic - Target Point Generation', () => {
  it('picks a target point within margins', () => {
    const point = pickTargetPoint(0.5, 0.25, 0.2);

    expect(point.x).toBeGreaterThanOrEqual(0.2);
    expect(point.x).toBeLessThanOrEqual(0.8);
    expect(point.y).toBeGreaterThanOrEqual(0.2);
    expect(point.y).toBeLessThanOrEqual(0.8);
  });

  it('handles minimum margin values', () => {
    const point = pickTargetPoint(0.5, 0.5, 0.01); // Below min 0.05

    // Should clamp to 0.05
    expect(point.x).toBeGreaterThanOrEqual(0.05);
    expect(point.x).toBeLessThanOrEqual(0.95);
  });

  it('handles maximum margin values', () => {
    const point = pickTargetPoint(0.5, 0.5, 0.5); // Above max 0.45

    // Should clamp to 0.45
    expect(point.x).toBeGreaterThanOrEqual(0.45);
    expect(point.x).toBeLessThanOrEqual(0.55);
  });

  it('clamps out-of-bounds random values', () => {
    const point1 = pickTargetPoint(-0.5, 0.5, 0.2);
    expect(point1.x).toBeGreaterThanOrEqual(0.2);

    const point2 = pickTargetPoint(1.5, 0.5, 0.2);
    expect(point2.x).toBeLessThanOrEqual(0.8);

    const point3 = pickTargetPoint(0.5, -0.5, 0.2);
    expect(point3.y).toBeGreaterThanOrEqual(0.2);

    const point4 = pickTargetPoint(0.5, 1.5, 0.2);
    expect(point4.y).toBeLessThanOrEqual(0.8);
  });

  it('produces deterministic results for same inputs', () => {
    const point1 = pickTargetPoint(0.3, 0.7, 0.22);
    const point2 = pickTargetPoint(0.3, 0.7, 0.22);

    expect(point1.x).toBe(point2.x);
    expect(point1.y).toBe(point2.y);
  });

  it('spawns targets at screen center for mid inputs', () => {
    const point = pickTargetPoint(0.5, 0.5, 0.22);

    // With 0.22 margin and 0.5 input, should be exactly centered
    expect(point.x).toBeCloseTo(0.5, 5);
    expect(point.y).toBeCloseTo(0.5, 5);
  });
});

describe('steadyHandLogic - Integration Scenarios', () => {
  it('simulates complete target hold with interruptions', () => {
    let progress = 0;

    // Hold for 1 second
    progress = updateHoldProgress({
      current: progress,
      isInside: true,
      deltaTimeMs: 1000,
    });

    expect(progress).toBeCloseTo(0.4, 5); // 1000/2500

    // Lose tracking for 0.5 seconds
    progress = updateHoldProgress({
      current: progress,
      isInside: false,
      deltaTimeMs: 500,
    });

    expect(progress).toBeCloseTo(0.043, 2); // 0.4 - (500/1400)

    // Regain and hold to completion (need ~0.957 more)
    progress = updateHoldProgress({
      current: progress,
      isInside: true,
      deltaTimeMs: 2393, // ~0.957 * 2500
    });

    expect(progress).toBe(1);
  });

  it('simulates near-miss scenario with recovery', () => {
    let progress = 0.9;

    // Almost complete, then slip out
    progress = updateHoldProgress({
      current: progress,
      isInside: false,
      deltaTimeMs: 1260, // Would drop to ~0.0
    });

    expect(progress).toBe(0);

    // Recover from scratch
    progress = updateHoldProgress({
      current: progress,
      isInside: true,
      deltaTimeMs: 2500,
    });

    expect(progress).toBe(1);
  });

  it('simulates steady hand gameplay with realistic fluctuations', () => {
    let progress = 0;
    let inside = true;

    // Simulate 5 seconds of gameplay with micro-movements
    for (let i = 0; i < 50; i++) {
      // Alternate between inside and occasionally outside
      inside = i % 7 !== 0; // Outside every 7th frame

      progress = updateHoldProgress({
        current: progress,
        isInside: inside,
        deltaTimeMs: 100,
      });
    }

    // Despite some slips, should eventually complete with steady play
    expect(progress).toBeGreaterThan(0.5);
  });

  it('verifies progress never exceeds bounds in rapid updates', () => {
    let progress = 0.99;

    // Rapid updates while inside
    for (let i = 0; i < 10; i++) {
      progress = updateHoldProgress({
        current: progress,
        isInside: true,
        deltaTimeMs: 100,
      });
    }

    expect(progress).toBe(1);

    // Then rapid decay
    for (let i = 0; i < 20; i++) {
      progress = updateHoldProgress({
        current: progress,
        isInside: false,
        deltaTimeMs: 100,
      });
    }

    expect(progress).toBe(0);
  });
});
