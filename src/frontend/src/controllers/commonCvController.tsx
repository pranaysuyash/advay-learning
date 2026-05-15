import { useMemo, useEffect, useContext, useRef } from 'react';
import useGameHandTracking from '../hooks/useGameHandTracking';
import { useGamePoseTracking } from '../hooks/useGamePoseTracking';
import { useGameFaceTracking } from '../hooks/useGameFaceTracking';
import { SpatialInputContext } from '../context/SpatialInputContext';
// Lightweight wrapper around the CV input surface to provide a common interface.

/**
 * useCommonCvController — Unified CV input surface for all games.
 *
 * Bridges hand/pose/face/voice hooks into SpatialInputContext.
 * Always calls all hooks unconditionally (React rules requirement);
 * selection of which result to use is purely referentially determined
 * by the `modality` argument at render time.
 *
 * @param gameName  — human-readable name for logging
 * @param modality — which CV modality to expose (hand | pose | face | voice)
 */
export function useCommonCvController(
  gameName?: string,
  modality: 'hand' | 'pose' | 'face' | 'voice' = 'hand'
) {
  const cfg = useMemo(
    () => ({ gameName: gameName ?? 'CommonCVController', targetFps: 30 }),
    [gameName],
  );

  // Shared webcam ref for pose/face hooks (called unconditionally per React rules)
  const webcamRef = useRef(null);

  const handCV = useGameHandTracking(cfg);
  const poseCV = useGamePoseTracking({ gameName: cfg.gameName, webcamRef, enabled: modality === 'pose' });
  const faceCV = useGameFaceTracking({ gameName: cfg.gameName, webcamRef, enabled: modality === 'face' });

  const spatialCtx = useContext(SpatialInputContext);

  // Extract stable callback refs to avoid re-firing effect when cursor state changes.
  // setSpatialCursor/resetSpatialCursor are useCallback-wrapped and referentially stable,
  // but spatialCtx itself changes whenever cursor state updates (causing infinite loop).
  const setSpatialCursorRef = useRef(spatialCtx?.setSpatialCursor);
  const resetSpatialCursorRef = useRef(spatialCtx?.resetSpatialCursor);
  setSpatialCursorRef.current = spatialCtx?.setSpatialCursor;
  resetSpatialCursorRef.current = spatialCtx?.resetSpatialCursor;

  // Push cursor into the global context on every relevant change.
  useEffect(() => {
    const setSpatial = setSpatialCursorRef.current;
    const resetSpatial = resetSpatialCursorRef.current;
    if (!setSpatial || !resetSpatial) return;
    const cursor =
      modality === 'hand' ? handCV.cursor :
      modality === 'pose' ? poseCV.poseDetected ? { x: 0.5, y: 0.5 } : null :
      modality === 'face' ? faceCV.faceDetected ? { x: 0.5, y: 0.5 } : null :
      null;
    const isPinching = handCV.pinch?.isPinching ?? false;
    if (cursor) {
      setSpatial({ x: cursor.x, y: cursor.y }, true, isPinching);
    } else {
      resetSpatial();
    }
  }, [modality, handCV.cursor, handCV.pinch?.isPinching, poseCV.poseDetected, faceCV.faceDetected]);

  // Always return hand tracking result — it has the full interface
  // (isReady, cursor, startTracking, stopTracking) that consumers expect.
  // Pose/face modalities are bridged via SpatialInputContext above.
  return handCV;
}
