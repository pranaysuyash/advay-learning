import type {
  Landmark,
  PinchOptions,
  PinchResult,
  PinchState,
  Point,
} from '../types/tracking';
import { createDefaultPinchState, detectPinch } from './pinchDetection';

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
  } = options;

  if (!hands.length) {
    return buildNoHandFrame(
      previousPinchState,
      pinchOptions,
      resetPinchOnNoHand,
    );
  }

  const primaryHand = hands[0] ?? null;
  if (!primaryHand || primaryHand.length < 9) {
    return buildNoHandFrame(
      previousPinchState,
      pinchOptions,
      resetPinchOnNoHand,
    );
  }

  const pinch = detectPinch(primaryHand, previousPinchState, pinchOptions);

  return {
    hands,
    handCount: hands.length,
    primaryHand,
    rawIndexTip: toPoint(primaryHand[8]),
    indexTip: toMirroredPoint(primaryHand[8]),
    pinch,
  };
}
