import { describe, expect, it } from 'vitest';

import { buildTrackedHandFrame } from '../handTrackingFrame';
import type { Landmark, PinchState } from '../../types/tracking';

const createLandmarks = (overrides: Partial<Record<number, Landmark>> = {}): Landmark[] => {
  const landmarks: Landmark[] = Array.from({ length: 21 }, () => ({ x: 0.5, y: 0.5, z: 0 }));
  for (const [index, point] of Object.entries(overrides)) {
    landmarks[Number(index)] = point as Landmark;
  }
  return landmarks;
};

describe('buildTrackedHandFrame', () => {
  it('returns empty frame when no hands are present', () => {
    const frame = buildTrackedHandFrame({ hands: [] });

    expect(frame.handCount).toBe(0);
    expect(frame.primaryHand).toBeNull();
    expect(frame.indexTip).toBeNull();
    expect(frame.pinch.transition).toBe('none');
    expect(frame.pinch.state.isPinching).toBe(false);
  });

  it('returns mirrored index fingertip coordinates', () => {
    const hand = createLandmarks({
      8: { x: 0.2, y: 0.7, z: 0 },
    });

    const frame = buildTrackedHandFrame({ hands: [hand] });

    expect(frame.rawIndexTip).toEqual({ x: 0.2, y: 0.7 });
    expect(frame.indexTip).toEqual({ x: 0.8, y: 0.7 });
  });

  it('detects pinch start and preserve prior state when configured', () => {
    const prevState: PinchState = {
      isPinching: false,
      distance: 0.1,
      startThreshold: 0.05,
      releaseThreshold: 0.07,
    };

    const pinchingHand = createLandmarks({
      4: { x: 0.0, y: 0.0, z: 0 },
      8: { x: 0.02, y: 0.0, z: 0 },
    });

    const pinchFrame = buildTrackedHandFrame({
      hands: [pinchingHand],
      previousPinchState: prevState,
    });

    expect(pinchFrame.pinch.transition).toBe('start');
    expect(pinchFrame.pinch.state.isPinching).toBe(true);

    const noHandFrame = buildTrackedHandFrame({
      hands: [],
      previousPinchState: pinchFrame.pinch.state,
      resetPinchOnNoHand: false,
    });

    expect(noHandFrame.pinch.state.isPinching).toBe(true);
  });
});
