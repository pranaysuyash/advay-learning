/**
 * CVProvider - Centralized computer vision input for all games
 *
 * Unifies hand/pose/face/voice modalities behind a single interface.
 * Games consume cursor state via SpatialInputContext (shared with GlobalCVCursor)
 * without needing to know which CV modality is active.
 *
 * Usage:
 *   // In App.tsx:
 *   <CVProvider>
 *     <App />
 *   </CVProvider>
 *
 *   // In a game page:
 *   const { cursor, webcamRef, isReady, startTracking, stopTracking } = useCV('hand');
 *
 * @see docs/CV_CONTROLS_IMPLEMENTATION_GUIDE_2026-03-14.md
 */

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
  type ReactNode,
  type RefObject,
} from 'react';
import Webcam from 'react-webcam';
import useGameHandTracking from '../hooks/useGameHandTracking';
import { useGamePoseTracking } from '../hooks/useGamePoseTracking';
import { useGameFaceTracking } from '../hooks/useGameFaceTracking';
import { SpatialInputContext } from '../context/SpatialInputContext';

/** Supported CV modalities */
export type CVModality = 'hand' | 'pose' | 'face' | 'voice';

/** Unified cursor shape across all modalities */
export interface CVCursor {
  x: number;
  y: number;
}

/** Unified CV state returned to games */
export interface CVState {
  isReady: boolean;
  isLoading: boolean;
  error: string | Error | null;
  cursor: CVCursor | null;
  webcamRef: RefObject<Webcam | null>;
  startTracking: () => Promise<void>;
  stopTracking: () => void;
}

/** Context shape for CVProvider */
interface CVContextType {
  /** Register a game with a specific modality */
  registerGame: (gameName: string, modality: CVModality) => void;
  /** Current CV state for the active game */
  cvState: CVState | null;
  /** Active modality */
  activeModality: CVModality;
  /** Active game name */
  activeGameName: string | null;
}

const CVContext = createContext<CVContextType | undefined>(undefined);

interface CVProviderProps {
  children: ReactNode;
}

export function CVProvider({ children }: CVProviderProps) {
  const [activeGameName, setActiveGameName] = useState<string | null>(null);
  const [activeModality, setActiveModality] = useState<CVModality>('hand');
  const webcamRef = useRef<Webcam>(null);

  // Pose/face bridge state → pushed into SpatialInputContext
  const spatialCtx = useContext(SpatialInputContext);

  // Extract stable callback refs to avoid re-firing effects when cursor state changes.
  // spatialCtx itself changes whenever cursor updates (it includes cursor in useMemo),
  // so depending on spatialCtx directly causes an infinite render loop.
  const setSpatialCursorRef = useRef(spatialCtx?.setSpatialCursor);
  const resetSpatialCursorRef = useRef(spatialCtx?.resetSpatialCursor);
  setSpatialCursorRef.current = spatialCtx?.setSpatialCursor;
  resetSpatialCursorRef.current = spatialCtx?.resetSpatialCursor;

  // Always call all modality hooks unconditionally (React rules requirement).
  // Which hook's result is used is determined by activeModality via useMemo below.
  const handTracking = useGameHandTracking({
    gameName: activeGameName ?? 'CVProvider',
    webcamRef,
    targetFps: 30,
  });
  const poseTracking = useGamePoseTracking({
    gameName: activeGameName ?? 'CVProvider',
    webcamRef,
  });
  const faceTracking = useGameFaceTracking({
    gameName: activeGameName ?? 'CVProvider',
    webcamRef,
  });

  // Pose ↔ SpatialInputContext bridge — active only when modality === 'pose'
  useEffect(() => {
    const setSpatial = setSpatialCursorRef.current;
    const resetSpatial = resetSpatialCursorRef.current;
    if (activeModality !== 'pose' || !setSpatial || !resetSpatial) return;
    if (poseTracking.poseDetected) {
      setSpatial({ x: 0.5, y: 0.5 }, true, false);
    } else {
      resetSpatial();
    }
  }, [activeModality, poseTracking.poseDetected]);

  // Face ↔ SpatialInputContext bridge — active only when modality === 'face'
  useEffect(() => {
    const setSpatial = setSpatialCursorRef.current;
    const resetSpatial = resetSpatialCursorRef.current;
    if (activeModality !== 'face' || !setSpatial || !resetSpatial) return;
    if (faceTracking.faceDetected) {
      setSpatial({ x: 0.5, y: 0.5 }, true, false);
    } else {
      resetSpatial();
    }
  }, [activeModality, faceTracking.faceDetected]);

  // Build unified cvState based on active modality — selection is deterministic
  const cvState: CVState | null = useMemo(() => {
    if (!activeGameName) return null;

    if (activeModality === 'pose') {
      return {
        isReady: !poseTracking.isLoading && !poseTracking.error,
        isLoading: poseTracking.isLoading,
        error: poseTracking.error,
        cursor: poseTracking.poseDetected ? { x: 0.5, y: 0.5 } : null,
        webcamRef,
        startTracking: async () => {},
        stopTracking: () => {},
      };
    }

    if (activeModality === 'face') {
      return {
        isReady: !faceTracking.isLoading && !faceTracking.error,
        isLoading: faceTracking.isLoading,
        error: faceTracking.error,
        cursor: faceTracking.faceDetected ? { x: 0.5, y: 0.5 } : null,
        webcamRef,
        startTracking: async () => {},
        stopTracking: () => {},
      };
    }

    // Default: hand tracking
    return {
      isReady: handTracking.isReady,
      isLoading: handTracking.isLoading,
      error: handTracking.error,
      cursor: handTracking.cursor,
      webcamRef,
      startTracking: handTracking.startTracking,
      stopTracking: handTracking.stopTracking,
    };
  }, [activeGameName, activeModality, handTracking, poseTracking, faceTracking]);

  const registerGame = useCallback((gameName: string, modality: CVModality) => {
    setActiveGameName(gameName);
    setActiveModality(modality);
  }, []);

  const value = useMemo(
    () => ({
      registerGame,
      cvState,
      activeModality,
      activeGameName,
    }),
    [cvState, activeModality, activeGameName, registerGame],
  );

  return <CVContext.Provider value={value}>{children}</CVContext.Provider>;
}

/** Hook for game pages to consume unified CV state */
// eslint-disable-next-line react-refresh/only-export-components
export function useCV(modality: CVModality = 'hand'): CVState {
  const ctx = useContext(CVContext);
  useEffect(() => {
    if (!ctx) return;
    ctx.registerGame(`${modality}Game`, modality);
  }, [ctx, modality]);

  if (!ctx || !ctx.cvState) {
    return {
      isReady: false,
      isLoading: true,
      error: null,
      cursor: null,
      webcamRef: { current: null },
      startTracking: async () => {},
      stopTracking: () => {},
    };
  }

  return ctx.cvState;
}

/** Hook to check if a specific modality is available */
// eslint-disable-next-line react-refresh/only-export-components
export function useCVModality(modality: CVModality): boolean {
  const ctx = useContext(CVContext);
  if (!ctx) return false;
  return ctx.activeModality === modality;
}
