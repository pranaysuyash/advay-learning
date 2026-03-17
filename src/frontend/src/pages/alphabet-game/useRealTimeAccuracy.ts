import { useEffect, useRef } from 'react';
import {
  BASE_ACCURACY,
  MAX_ACCURACY,
  ACCURACY_POINT_DIVISOR,
  MIN_DRAW_POINTS_FOR_CHECK,
} from './constants';

interface UseRealTimeAccuracyProps {
  isPlaying: boolean;
  isPaused: boolean;
  drawnPointsRef: React.MutableRefObject<Array<{ x: number; y: number }>>;
  onAccuracyChange: (accuracy: number) => void;
  updateInterval?: number; // ms between updates (default: 200ms for smooth but not too frequent)
}

/**
 * Hook to calculate and update accuracy in real-time as the user draws
 *
 * This provides immediate feedback during tracing instead of waiting
 * for the user to click "Done" to see their accuracy.
 */
export function useRealTimeAccuracy({
  isPlaying,
  isPaused,
  drawnPointsRef,
  onAccuracyChange,
  updateInterval = 200,
}: UseRealTimeAccuracyProps) {
  const lastUpdateRef = useRef<number>(0);
  const lastPointCountRef = useRef<number>(0);
  const rafIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isPlaying || isPaused) return;

    let cancelled = false;

    const checkAndUpdate = () => {
      if (cancelled) return;

      const currentPointCount = drawnPointsRef.current.length;
      const now = Date.now();

      // Only update if:
      // 1. Points have been added since last check
      // 2. Enough time has passed since last update (throttling)
      if (
        currentPointCount !== lastPointCountRef.current &&
        now - lastUpdateRef.current >= updateInterval
      ) {
        lastPointCountRef.current = currentPointCount;
        lastUpdateRef.current = now;

        // Calculate accuracy based on points drawn
        // More points drawn = higher accuracy (covers more of the letter)
        const validPoints = drawnPointsRef.current.filter(
          (p) => !isNaN(p.x) && !isNaN(p.y)
        ).length;

        if (validPoints >= MIN_DRAW_POINTS_FOR_CHECK) {
          const accuracy = Math.min(
            MAX_ACCURACY,
            BASE_ACCURACY + Math.floor(validPoints / ACCURACY_POINT_DIVISOR)
          );
          onAccuracyChange(accuracy);
        } else if (validPoints > 0) {
          // Show partial accuracy for small number of points
          const partialAccuracy = Math.floor(
            (validPoints / MIN_DRAW_POINTS_FOR_CHECK) * BASE_ACCURACY
          );
          onAccuracyChange(partialAccuracy);
        }
      }

      rafIdRef.current = requestAnimationFrame(checkAndUpdate);
    };

    rafIdRef.current = requestAnimationFrame(checkAndUpdate);

    return () => {
      cancelled = true;
      if (rafIdRef.current != null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
    };
  }, [isPlaying, isPaused, onAccuracyChange, updateInterval]);
}
