import { useCallback } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import { POINT_MIN_DISTANCE, MAX_DRAWN_POINTS } from './constants';

interface UsePointerHandlersProps {
  isPlaying: boolean;
  isDrawing: boolean;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  drawnPointsRef: React.MutableRefObject<Array<{ x: number; y: number }>>;
  lastDrawPointRef: React.MutableRefObject<{ x: number; y: number } | null>;
  pointerDownRef: React.MutableRefObject<boolean>;
  resetInactivityTimer: () => void;
}

export function usePointerHandlers({
  isPlaying,
  isDrawing,
  canvasRef,
  drawnPointsRef,
  lastDrawPointRef,
  pointerDownRef,
  resetInactivityTimer,
}: UsePointerHandlersProps): {
  handleCanvasPointerDown: (e: ReactPointerEvent<HTMLCanvasElement>) => void;
  handleCanvasPointerMove: (e: ReactPointerEvent<HTMLCanvasElement>) => void;
  handleCanvasPointerUpOrCancel: (e: ReactPointerEvent<HTMLCanvasElement>) => void;
} {
  const getCanvasPointFromPointerEvent = useCallback(
    (e: ReactPointerEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return null;
      const rect = canvas.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return null;
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      };
    },
    [canvasRef],
  );

  const handleCanvasPointerDown = useCallback(
    (e: ReactPointerEvent<HTMLCanvasElement>) => {
      if (!isPlaying || !isDrawing) return;
      resetInactivityTimer();
      const canvas = canvasRef.current;
      const point = getCanvasPointFromPointerEvent(e);
      if (!canvas || !point) return;

      pointerDownRef.current = true;
      (e.currentTarget as any).setPointerCapture?.(e.pointerId);

      // Add first point - will be rendered by the main loop
      lastDrawPointRef.current = point;
      drawnPointsRef.current.push({
        x: point.x / canvas.width,
        y: point.y / canvas.height,
      });
    },
    [
      getCanvasPointFromPointerEvent,
      isDrawing,
      isPlaying,
      resetInactivityTimer,
      canvasRef,
      pointerDownRef,
      lastDrawPointRef,
      drawnPointsRef,
    ],
  );

  const handleCanvasPointerMove = useCallback(
    (e: ReactPointerEvent<HTMLCanvasElement>) => {
      if (!isPlaying || !isDrawing || !pointerDownRef.current) return;
      resetInactivityTimer();
      const canvas = canvasRef.current;
      const point = getCanvasPointFromPointerEvent(e);
      if (!canvas || !point) return;

      // Only add point if moved enough
      const lastPoint =
        drawnPointsRef.current[drawnPointsRef.current.length - 1];
      const dist =
        lastPoint && !isNaN(lastPoint.x)
          ? Math.sqrt(
            Math.pow(point.x / canvas.width - lastPoint.x, 2) +
            Math.pow(point.y / canvas.height - lastPoint.y, 2),
          )
          : Infinity;

      if (dist > POINT_MIN_DISTANCE) {
        lastDrawPointRef.current = point;
        drawnPointsRef.current.push({
          x: point.x / canvas.width,
          y: point.y / canvas.height,
        });
        if (drawnPointsRef.current.length > MAX_DRAWN_POINTS) {
          drawnPointsRef.current.shift();
        }
      }
    },
    [
      getCanvasPointFromPointerEvent,
      isDrawing,
      isPlaying,
      resetInactivityTimer,
      canvasRef,
      pointerDownRef,
      lastDrawPointRef,
      drawnPointsRef,
    ],
  );

  const handleCanvasPointerUpOrCancel = useCallback(
    (e: ReactPointerEvent<HTMLCanvasElement>) => {
      pointerDownRef.current = false;
      (e.currentTarget as any).releasePointerCapture?.(e.pointerId);
      lastDrawPointRef.current = null;
      // Add break point to separate line segments
      drawnPointsRef.current.push({ x: NaN, y: NaN });
    },
    [pointerDownRef, lastDrawPointRef, drawnPointsRef],
  );

  return {
    handleCanvasPointerDown,
    handleCanvasPointerMove,
    handleCanvasPointerUpOrCancel,
  };
}
