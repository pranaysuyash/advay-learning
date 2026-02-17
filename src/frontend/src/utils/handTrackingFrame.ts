import type {
  Landmark,
  PinchOptions,
  PinchResult,
  PinchState,
  Point,
} from '../types/tracking';
import { createDefaultPinchState, detectPinch } from './pinchDetection';
import type { OneEuroPointFilter } from './oneEuroFilter';

export interface TrackedHandFrame {
  hands: Landmark[][];
  handCount: number;
  primaryHand: Landmark[] | null;
  rawIndexTip: Point | null;
  indexTip: Point | null;
  pinch: PinchResult;
}

export interface BuildTrackedHandFrameOptions {
  hands: Landmark[][];
  previousPinchState?: PinchState | null;
  pinchOptions?: PinchOptions;
  resetPinchOnNoHand?: boolean;
  /** Optional One-Euro filter for smoothing indexTip. Caller owns the instance. */
  indexTipSmoother?: OneEuroPointFilter | null;
  /** Timestamp in seconds for the smoother (e.g. performance.now() / 1000) */
  timestamp?: number;
}

function toPoint(landmark?: Landmark): Point | null {
  if (!landmark || typeof landmark.x !== 'number' || typeof landmark.y !== 'number') {
    return null;
  }

  return { x: landmark.x, y: landmark.y };
}

function toMirroredPoint(landmark?: Landmark): Point | null {
  const point = toPoint(landmark);
  if (!point) return null;

  return {
    x: Math.min(1, Math.max(0, 1 - point.x)),
    y: Math.min(1, Math.max(0, point.y)),
  };
}

function buildNoHandFrame(
  previousPinchState: PinchState | null,
  pinchOptions?: PinchOptions,
  resetPinchOnNoHand: boolean = true,
): TrackedHandFrame {
  const pinchState = resetPinchOnNoHand
    ? createDefaultPinchState(pinchOptions)
    : previousPinchState ?? createDefaultPinchState(pinchOptions);

  return {
    hands: [],
    handCount: 0,
    primaryHand: null,
    rawIndexTip: null,
    indexTip: null,
    pinch: {
      state: pinchState,
      transition: 'none',
    },
  };
}

export function buildTrackedHandFrame(
  options: BuildTrackedHandFrameOptions,
): TrackedHandFrame {
  const {
    hands,
    previousPinchState = null,
    pinchOptions,
    resetPinchOnNoHand = true,
    indexTipSmoother = null,
    timestamp,
  } = options;

  if (!hands.length) {
    indexTipSmoother?.reset();
    return buildNoHandFrame(
      previousPinchState,
      pinchOptions,
      resetPinchOnNoHand,
    );
  }

  const primaryHand = hands[0] ?? null;
  if (!primaryHand || primaryHand.length < 9) {
    indexTipSmoother?.reset();
    return buildNoHandFrame(
      previousPinchState,
      pinchOptions,
      resetPinchOnNoHand,
    );
  }

  const pinch = detectPinch(primaryHand, previousPinchState, pinchOptions);

  const mirroredTip = toMirroredPoint(primaryHand[8]);
  const smoothedTip =
    mirroredTip && indexTipSmoother && timestamp != null
      ? indexTipSmoother.filter(mirroredTip, timestamp)
      : mirroredTip;

  return {
    hands,
    handCount: hands.length,
    primaryHand,
    rawIndexTip: toPoint(primaryHand[8]),
    indexTip: smoothedTip,
    pinch,
  };
}
