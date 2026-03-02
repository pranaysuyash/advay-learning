import { describe, expect, it } from 'vitest';

import {
  createPoseBaseline,
  derivePoseMetrics,
  detectDuck,
  detectJump,
  detectSidestep,
  estimateDepthRatio,
  type PoseLandmarkLike,
} from '../poseMovementAnalysis';

function createPose(overrides: Partial<Record<number, Partial<PoseLandmarkLike>>> = {}) {
  const landmarks: PoseLandmarkLike[] = Array.from({ length: 33 }, () => ({
    x: 0.5,
    y: 0.5,
    z: 0,
    visibility: 1,
  }));

  const basePoints: Record<number, PoseLandmarkLike> = {
    0: { x: 0.5, y: 0.2, z: 0, visibility: 1 },
    11: { x: 0.4, y: 0.35, z: 0, visibility: 1 },
    12: { x: 0.6, y: 0.35, z: 0, visibility: 1 },
    23: { x: 0.43, y: 0.55, z: 0, visibility: 1 },
    24: { x: 0.57, y: 0.55, z: 0, visibility: 1 },
    27: { x: 0.44, y: 0.9, z: 0, visibility: 1 },
    28: { x: 0.56, y: 0.9, z: 0, visibility: 1 },
  };

  for (const [index, point] of Object.entries(basePoints)) {
    landmarks[Number(index)] = point;
  }

  for (const [index, patch] of Object.entries(overrides)) {
    landmarks[Number(index)] = {
      ...landmarks[Number(index)],
      ...patch,
    };
  }

  return landmarks;
}

describe('poseMovementAnalysis', () => {
  it('derives pose metrics from landmarks', () => {
    const metrics = derivePoseMetrics(createPose());

    expect(metrics).not.toBeNull();
    expect(metrics?.torsoHeight).toBeGreaterThan(0);
    expect(metrics?.bodyHeight).toBeGreaterThan(metrics?.torsoHeight ?? 0);
  });

  it('detects ducking from a lowered torso and head', () => {
    const baseline = createPoseBaseline([
      derivePoseMetrics(createPose())!,
      derivePoseMetrics(createPose())!,
    ])!;
    const duckMetrics = derivePoseMetrics(
      createPose({
        0: { y: 0.3 },
        11: { y: 0.43 },
        12: { y: 0.43 },
        23: { y: 0.6 },
        24: { y: 0.6 },
      }),
    )!;

    const result = detectDuck(duckMetrics, baseline);

    expect(result.detected).toBe(true);
    expect(result.confidence).toBeGreaterThan(0.6);
  });

  it('detects a jump when the full body lifts upward', () => {
    const baseline = createPoseBaseline([derivePoseMetrics(createPose())!])!;
    const jumpMetrics = derivePoseMetrics(
      createPose({
        0: { y: 0.14 },
        11: { y: 0.27 },
        12: { y: 0.27 },
        23: { y: 0.47 },
        24: { y: 0.47 },
        27: { y: 0.79 },
        28: { y: 0.79 },
      }),
    )!;

    const result = detectJump(jumpMetrics, baseline);

    expect(result.detected).toBe(true);
    expect(result.confidence).toBeGreaterThan(0.55);
  });

  it('detects a sidestep and direction from lateral body shift', () => {
    const baseline = createPoseBaseline([derivePoseMetrics(createPose())!])!;
    const sidestepMetrics = derivePoseMetrics(
      createPose({
        11: { x: 0.5 },
        12: { x: 0.7 },
        23: { x: 0.53 },
        24: { x: 0.67 },
        27: { x: 0.54 },
        28: { x: 0.66 },
      }),
    )!;

    const result = detectSidestep(sidestepMetrics, baseline);

    expect(result.detected).toBe(true);
    expect(result.type).toBe('sidestep-right');
  });

  it('estimates forward depth from increased body scale', () => {
    const baseline = createPoseBaseline([derivePoseMetrics(createPose())!])!;
    const nearerMetrics = derivePoseMetrics(
      createPose({
        11: { x: 0.34 },
        12: { x: 0.66 },
        23: { x: 0.37 },
        24: { x: 0.63 },
      }),
    )!;

    expect(estimateDepthRatio(nearerMetrics, baseline)).toBeGreaterThan(1);
  });
});
