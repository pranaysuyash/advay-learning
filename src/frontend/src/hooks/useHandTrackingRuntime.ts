import { useCallback, useEffect, useRef, type RefObject } from 'react';
import type Webcam from 'react-webcam';

import type { PinchOptions } from '../types/tracking';
import { createDefaultPinchState } from '../utils/pinchDetection';
import {
  buildTrackedHandFrame,
  type TrackedHandFrame,
} from '../utils/handTrackingFrame';
import { getHandLandmarkLists } from '../utils/landmarkUtils';
import { useGameLoop } from './useGameLoop';
import {
  OneEuroPointFilter,
  type OneEuroFilterOptions,
} from '../utils/oneEuroFilter';

type HandLandmarkerLike = {
  detectForVideo: (video: HTMLVideoElement, timestamp: number) => unknown;
};

export interface HandTrackingRuntimeMeta {
  timestamp: number;
  deltaTimeMs: number;
  fps: number;
  video: HTMLVideoElement;
}

export interface UseHandTrackingRuntimeOptions {
  isRunning: boolean;
  handLandmarker: HandLandmarkerLike | null;
  webcamRef: RefObject<Webcam | null>;
  onFrame: (frame: TrackedHandFrame, meta: HandTrackingRuntimeMeta) => void;
  onNoVideoFrame?: () => void;
  onError?: (error: unknown) => void;
  targetFps?: number;
  pinchOptions?: PinchOptions;
  resetPinchOnNoHand?: boolean;
  /** Options for One-Euro smoothing on indexTip. Set to false to disable. Default: enabled. */
  smoothing?: OneEuroFilterOptions | false;
}

export interface UseHandTrackingRuntimeReturn {
  resetPinchState: () => void;
}

/**
 * Shared hand-tracking runtime for camera games.
 *
 * Base responsibilities:
 * - Read video frames from Webcam
 * - Run MediaPipe detectForVideo
 * - Normalize hand lists + mirrored fingertip coordinates
 * - Compute pinch transitions with shared thresholds
 *
 * Each game provides custom behavior in onFrame callback.
 */
export function useHandTrackingRuntime(
  options: UseHandTrackingRuntimeOptions,
): UseHandTrackingRuntimeReturn {
  const {
    isRunning,
    handLandmarker,
    webcamRef,
    onFrame,
    onNoVideoFrame,
    onError,
    targetFps = 30,
    pinchOptions,
    resetPinchOnNoHand = true,
    smoothing,
  } = options;

  const onFrameRef = useRef(onFrame);
  const onNoVideoFrameRef = useRef(onNoVideoFrame);
  const onErrorRef = useRef(onError);
  const pinchStateRef = useRef(createDefaultPinchState(pinchOptions));
  const smootherRef = useRef<OneEuroPointFilter | null>(
    smoothing === false ? null : new OneEuroPointFilter(smoothing),
  );

  useEffect(() => {
    onFrameRef.current = onFrame;
  }, [onFrame]);

  useEffect(() => {
    onNoVideoFrameRef.current = onNoVideoFrame;
  }, [onNoVideoFrame]);

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  const resetPinchState = useCallback(() => {
    pinchStateRef.current = createDefaultPinchState(pinchOptions);
  }, [pinchOptions]);

  useGameLoop({
    isRunning: isRunning && handLandmarker !== null,
    targetFps,
    onFrame: useCallback(
      (deltaTimeMs: number, fps: number) => {
        const video = webcamRef.current?.video;
        if (
          !video ||
          video.readyState < 2 ||
          video.videoWidth === 0 ||
          video.videoHeight === 0 ||
          !handLandmarker
        ) {
          onNoVideoFrameRef.current?.();
          return;
        }

        const timestamp = performance.now();

        try {
          const results = handLandmarker.detectForVideo(video, timestamp);
          const hands = getHandLandmarkLists(results);
          const frame = buildTrackedHandFrame({
            hands,
            previousPinchState: pinchStateRef.current,
            pinchOptions,
            resetPinchOnNoHand,
            indexTipSmoother: smootherRef.current,
            timestamp: timestamp / 1000,
          });

          pinchStateRef.current = frame.pinch.state;

          onFrameRef.current(frame, {
            timestamp,
            deltaTimeMs,
            fps,
            video,
          });
        } catch (error) {
          onErrorRef.current?.(error);
        }
      },
      [handLandmarker, webcamRef, pinchOptions, resetPinchOnNoHand],
    ),
  });

  return {
    resetPinchState,
  };
}

export default useHandTrackingRuntime;
