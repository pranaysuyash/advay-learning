/**
 * useFallbackControls Hook
 * 
 * Provides tap/dwell/snap fallback controls for CV-based games.
 * Enables gameplay without camera via touch/mouse interactions.
 * 
 * @see docs/components/FALLBACK_CONTROLS.md
 * @ticket ISSUE-001
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';

export interface DwellConfig {
  /** Dwell time in milliseconds (default: 400ms) */
  dwellTimeMs: number;
  /** Visual feedback progress callback */
  onProgress?: (progress: number) => void;
}

export interface SnapConfig {
  /** Snap radius in pixels (default: 32px) */
  snapRadiusPx: number;
  /** Targets to snap to */
  targets: Array<{ x: number; y: number; id: string }>;
}

export interface UseFallbackControlsOptions {
  /** Whether fallback controls are enabled */
  enabled: boolean;
  /** Dwell configuration for dwell-based selection */
  dwell?: DwellConfig;
  /** Snap configuration for magnetic targeting */
  snap?: SnapConfig;
  /** Callback when a target is selected via dwell */
  onDwellSelect?: (targetId: string) => void;
  /** Callback when cursor position changes */
  onCursorMove?: (position: { x: number; y: number }) => void;
  /** Container element ref for coordinate calculations */
  containerRef?: React.RefObject<HTMLElement | null>;
}

export interface UseFallbackControlsReturn {
  /** Current cursor position in pixel coordinates */
  cursor: { x: number; y: number } | null;
  /** Whether cursor is currently dwelling on a target */
  isDwelling: boolean;
  /** Current dwell progress (0-1) */
  dwellProgress: number;
  /** Currently snapped target ID, if any */
  snappedTargetId: string | null;
  /** Handlers to attach to container element */
  handlers: {
    onPointerMove: (e: ReactPointerEvent<HTMLElement>) => void;
    onPointerDown: (e: ReactPointerEvent<HTMLElement>) => void;
    onPointerUp: (e: ReactPointerEvent<HTMLElement>) => void;
    onPointerLeave: () => void;
  };
  /** Enable fallback controls */
  enable: () => void;
  /** Disable fallback controls */
  disable: () => void;
}

const DEFAULT_DWELL_TIME_MS = 400;
const DEFAULT_SNAP_RADIUS_PX = 32;

export function useFallbackControls(
  options: UseFallbackControlsOptions
): UseFallbackControlsReturn {
  const {
    enabled: initialEnabled,
    dwell,
    snap,
    onDwellSelect,
    onCursorMove,
    containerRef,
  } = options;

  const [enabled, setEnabled] = useState(initialEnabled);
  const [cursor, setCursor] = useState<{ x: number; y: number } | null>(null);
  const [isDwelling, setIsDwelling] = useState(false);
  const [dwellProgress, setDwellProgress] = useState(0);
  const [snappedTargetId, setSnappedTargetId] = useState<string | null>(null);

  const dwellStartTimeRef = useRef<number | null>(null);
  const dwellTimerRef = useRef<NodeJS.Timeout | null>(null);
  const currentDwellTargetRef = useRef<string | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const dwellTimeMs = dwell?.dwellTimeMs ?? DEFAULT_DWELL_TIME_MS;

  // Find nearest snap target
  const findSnapTarget = useCallback(
    (x: number, y: number): string | null => {
      if (!snap?.targets?.length) return null;

      let nearest: { id: string; distance: number } | null = null;
      const snapRadius = snap.snapRadiusPx ?? DEFAULT_SNAP_RADIUS_PX;

      for (const target of snap.targets) {
        const distance = Math.hypot(target.x - x, target.y - y);
        if (distance <= snapRadius && (!nearest || distance < nearest.distance)) {
          nearest = { id: target.id, distance };
        }
      }

      return nearest?.id ?? null;
    },
    [snap]
  );

  // Cancel current dwell
  const cancelDwell = useCallback(() => {
    if (dwellTimerRef.current) {
      clearTimeout(dwellTimerRef.current);
      dwellTimerRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    dwellStartTimeRef.current = null;
    currentDwellTargetRef.current = null;
    setIsDwelling(false);
    setDwellProgress(0);
  }, []);

  // Start dwell on a target
  const startDwell = useCallback(
    (targetId: string) => {
      if (!enabled || !onDwellSelect) return;

      // Cancel any existing dwell
      cancelDwell();

      currentDwellTargetRef.current = targetId;
      dwellStartTimeRef.current = Date.now();
      setIsDwelling(true);

      // Progress animation
      const updateProgress = () => {
        if (!dwellStartTimeRef.current) return;
        const elapsed = Date.now() - dwellStartTimeRef.current;
        const progress = Math.min(elapsed / dwellTimeMs, 1);
        setDwellProgress(progress);
        dwell?.onProgress?.(progress);

        if (progress < 1) {
          animationFrameRef.current = requestAnimationFrame(updateProgress);
        }
      };
      animationFrameRef.current = requestAnimationFrame(updateProgress);

      // Complete dwell
      dwellTimerRef.current = setTimeout(() => {
        if (currentDwellTargetRef.current === targetId) {
          onDwellSelect(targetId);
        }
        cancelDwell();
      }, dwellTimeMs);
    },
    [enabled, dwellTimeMs, dwell, onDwellSelect, cancelDwell]
  );

  // Handle pointer move
  const handlePointerMove = useCallback(
    (e: ReactPointerEvent<HTMLElement>) => {
      if (!enabled) return;

      const container = containerRef?.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      setCursor({ x, y });
      onCursorMove?.({ x, y });

      // Check for snap targets
      const snapTarget = findSnapTarget(x, y);
      setSnappedTargetId(snapTarget);

      // Handle dwell logic
      if (snapTarget) {
        if (currentDwellTargetRef.current !== snapTarget) {
          startDwell(snapTarget);
        }
      } else {
        cancelDwell();
      }
    },
    [enabled, containerRef, onCursorMove, findSnapTarget, startDwell, cancelDwell]
  );

  // Handle pointer down (immediate selection)
  const handlePointerDown = useCallback(
    (e: ReactPointerEvent<HTMLElement>) => {
      if (!enabled) return;

      const container = containerRef?.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Check if clicking on a snap target
      const snapTarget = findSnapTarget(x, y);
      if (snapTarget && onDwellSelect) {
        onDwellSelect(snapTarget);
      }

      cancelDwell();
    },
    [enabled, containerRef, findSnapTarget, onDwellSelect, cancelDwell]
  );

  // Handle pointer up
  const handlePointerUp = useCallback(() => {
    // No-op for now, could be used for drag operations
  }, []);

  // Handle pointer leave
  const handlePointerLeave = useCallback(() => {
    setCursor(null);
    cancelDwell();
    setSnappedTargetId(null);
  }, [cancelDwell]);

  // Enable/disable controls
  const enable = useCallback(() => {
    setEnabled(true);
  }, []);

  const disable = useCallback(() => {
    setEnabled(false);
    cancelDwell();
    setCursor(null);
  }, [cancelDwell]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancelDwell();
    };
  }, [cancelDwell]);

  return {
    cursor,
    isDwelling,
    dwellProgress,
    snappedTargetId,
    handlers: {
      onPointerMove: handlePointerMove,
      onPointerDown: handlePointerDown,
      onPointerUp: handlePointerUp,
      onPointerLeave: handlePointerLeave,
    },
    enable,
    disable,
  };
}

export default useFallbackControls;
