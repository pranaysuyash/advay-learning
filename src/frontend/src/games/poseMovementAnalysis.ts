export interface PoseLandmarkLike {
  x: number;
  y: number;
  z?: number;
  visibility?: number;
}

export interface PoseMetrics {
  noseY: number;
  shoulderY: number;
  hipY: number;
  ankleY: number;
  centerX: number;
  shoulderWidth: number;
  hipWidth: number;
  horizontalScale: number;
  torsoHeight: number;
  bodyHeight: number;
}

export interface PoseBaseline extends PoseMetrics {
  sampleCount: number;
}

export type PoseMovementType =
  | 'duck'
  | 'jump'
  | 'sidestep-left'
  | 'sidestep-right';

export interface MovementSignal {
  type: PoseMovementType;
  detected: boolean;
  confidence: number;
  primaryMetric: number;
  detail: string;
}

const REQUIRED_INDICES = [0, 11, 12, 23, 24, 27, 28] as const;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function average(values: number[]) {
  if (values.length === 0) {
    return 0;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function derivePoseMetrics(
  landmarks: PoseLandmarkLike[],
): PoseMetrics | null {
  if (!landmarks || landmarks.length < 29) {
    return null;
  }

  for (const index of REQUIRED_INDICES) {
    if (!landmarks[index]) {
      return null;
    }
  }

  const nose = landmarks[0];
  const leftShoulder = landmarks[11];
  const rightShoulder = landmarks[12];
  const leftHip = landmarks[23];
  const rightHip = landmarks[24];
  const leftAnkle = landmarks[27];
  const rightAnkle = landmarks[28];

  const shoulderY = average([leftShoulder.y, rightShoulder.y]);
  const hipY = average([leftHip.y, rightHip.y]);
  const ankleY = average([leftAnkle.y, rightAnkle.y]);
  const shoulderWidth = Math.abs(rightShoulder.x - leftShoulder.x);
  const hipWidth = Math.abs(rightHip.x - leftHip.x);
  const horizontalScale = average([shoulderWidth, hipWidth]);
  const centerX = average([
    leftShoulder.x,
    rightShoulder.x,
    leftHip.x,
    rightHip.x,
  ]);
  const torsoHeight = Math.max(hipY - shoulderY, 0.0001);
  const bodyHeight = Math.max(ankleY - nose.y, 0.0001);

  return {
    noseY: nose.y,
    shoulderY,
    hipY,
    ankleY,
    centerX,
    shoulderWidth,
    hipWidth,
    horizontalScale,
    torsoHeight,
    bodyHeight,
  };
}

export function createPoseBaseline(
  samples: PoseMetrics[],
): PoseBaseline | null {
  if (samples.length === 0) {
    return null;
  }

  return {
    noseY: average(samples.map((sample) => sample.noseY)),
    shoulderY: average(samples.map((sample) => sample.shoulderY)),
    hipY: average(samples.map((sample) => sample.hipY)),
    ankleY: average(samples.map((sample) => sample.ankleY)),
    centerX: average(samples.map((sample) => sample.centerX)),
    shoulderWidth: average(samples.map((sample) => sample.shoulderWidth)),
    hipWidth: average(samples.map((sample) => sample.hipWidth)),
    horizontalScale: average(samples.map((sample) => sample.horizontalScale)),
    torsoHeight: average(samples.map((sample) => sample.torsoHeight)),
    bodyHeight: average(samples.map((sample) => sample.bodyHeight)),
    sampleCount: samples.length,
  };
}

export function estimateDepthRatio(
  metrics: PoseMetrics,
  baseline: PoseBaseline,
): number {
  const widthRatio = metrics.horizontalScale / Math.max(baseline.horizontalScale, 0.0001);
  const heightRatio = metrics.bodyHeight / Math.max(baseline.bodyHeight, 0.0001);

  return clamp((widthRatio * 0.7) + (heightRatio * 0.3), 0.7, 1.45);
}

export function isPoseFrameStable(
  current: PoseMetrics,
  previous: PoseMetrics | null,
  tolerance = 0.025,
): boolean {
  if (!previous) {
    return true;
  }

  return (
    Math.abs(current.centerX - previous.centerX) <= tolerance &&
    Math.abs(current.noseY - previous.noseY) <= tolerance &&
    Math.abs(current.shoulderY - previous.shoulderY) <= tolerance &&
    Math.abs(current.hipY - previous.hipY) <= tolerance
  );
}

export function detectDuck(
  metrics: PoseMetrics,
  baseline: PoseBaseline,
): MovementSignal {
  const noseDrop = metrics.noseY - baseline.noseY;
  const shoulderDrop = metrics.shoulderY - baseline.shoulderY;
  const torsoCompression =
    1 - metrics.torsoHeight / Math.max(baseline.torsoHeight, 0.0001);

  const confidence = clamp(
    ((noseDrop / 0.12) * 0.45) +
      ((shoulderDrop / 0.1) * 0.35) +
      (torsoCompression * 0.2),
    0,
    1,
  );

  return {
    type: 'duck',
    detected: noseDrop > 0.055 && shoulderDrop > 0.04,
    confidence,
    primaryMetric: noseDrop,
    detail: `noseDrop=${noseDrop.toFixed(3)} shoulderDrop=${shoulderDrop.toFixed(3)} torsoCompression=${torsoCompression.toFixed(3)}`,
  };
}

export function detectJump(
  metrics: PoseMetrics,
  baseline: PoseBaseline,
): MovementSignal {
  const ankleLift = baseline.ankleY - metrics.ankleY;
  const hipLift = baseline.hipY - metrics.hipY;
  const noseLift = baseline.noseY - metrics.noseY;
  const depthRatio = estimateDepthRatio(metrics, baseline);

  const confidence = clamp(
    ((ankleLift / 0.14) * 0.5) +
      ((hipLift / 0.09) * 0.25) +
      ((noseLift / 0.09) * 0.15) +
      ((Math.max(depthRatio - 1, 0) / 0.15) * 0.1),
    0,
    1,
  );

  return {
    type: 'jump',
    detected: ankleLift > 0.05 && hipLift > 0.035 && noseLift > 0.025,
    confidence,
    primaryMetric: ankleLift,
    detail: `ankleLift=${ankleLift.toFixed(3)} hipLift=${hipLift.toFixed(3)} depthRatio=${depthRatio.toFixed(3)}`,
  };
}

export function detectSidestep(
  metrics: PoseMetrics,
  baseline: PoseBaseline,
): MovementSignal {
  const shift = metrics.centerX - baseline.centerX;
  const normalizedShift =
    Math.abs(shift) / Math.max(baseline.horizontalScale, 0.0001);
  const direction: PoseMovementType =
    shift >= 0 ? 'sidestep-right' : 'sidestep-left';
  const confidence = clamp(normalizedShift / 0.75, 0, 1);

  return {
    type: direction,
    detected: normalizedShift > 0.38,
    confidence,
    primaryMetric: normalizedShift,
    detail: `shift=${shift.toFixed(3)} normalizedShift=${normalizedShift.toFixed(3)}`,
  };
}

export function detectObstacleMovements(
  metrics: PoseMetrics,
  baseline: PoseBaseline,
): MovementSignal[] {
  const candidates = [
    detectDuck(metrics, baseline),
    detectJump(metrics, baseline),
    detectSidestep(metrics, baseline),
  ];

  return candidates.filter((candidate) => candidate.detected);
}

export function selectDominantMovement(
  movements: MovementSignal[],
): MovementSignal | null {
  if (movements.length === 0) {
    return null;
  }

  return movements.reduce((best, candidate) =>
    candidate.confidence > best.confidence ? candidate : best,
  );
}
