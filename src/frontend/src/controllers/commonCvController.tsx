import { useMemo, useEffect, useContext } from 'react';
import useGameHandTracking from '../hooks/useGameHandTracking';
import useGamePoseTracking from '../hooks/useGamePoseTracking';
import useGameFaceTracking from '../hooks/useGameFaceTracking';
import { SpatialInputContext } from '../context/SpatialInputContext';
// Lightweight wrapper around the CV input surface to provide a common interface.

export function useCommonCvController(
  gameName?: string,
  modality: 'hand' | 'pose' | 'face' | 'voice' = 'hand'
) {
  // Configuration for all CV modalities
  const cfg = useMemo(
    () => ({ gameName: gameName ?? 'CommonCVController', targetFps: 30 }),
    [gameName],
  );
  // Select modality-specific CV hook
  let cv: any;
  if (modality === 'pose') {
    cv = useGamePoseTracking(cfg as any);
  } else if (modality === 'face') {
    cv = useGameFaceTracking(cfg as any);
  } else {
    cv = useGameHandTracking(cfg as any);
  }
  // Mirror CV cursor events into the global spatial input context so all games
  // can share a common controller layer without bespoke wiring.
  const spatialCtx = useContext(SpatialInputContext);
  useEffect(() => {
    if (!spatialCtx) return;
    const cursor = cv?.cursor;
    const isActive = !!cursor;
    const isPinching = cv?.pinch?.isPinching ?? false;
    if (cursor) {
      spatialCtx.setSpatialCursor({ x: cursor.x, y: cursor.y }, isActive, isPinching);
    } else {
      spatialCtx.resetSpatialCursor();
    }
  }, [cv?.cursor, cv?.pinch?.isPinching, modality]);
  return cv;
}
