import { useEffect } from 'react';
import {
  buildSegments,
  drawSegments,
  setupCanvas,
  drawLetterHint,
  addBreakPoint,
  shouldAddPoint,
  drawDirectionArrow,
} from '../../utils/drawing';
import { detectPinch, createDefaultPinchState } from '../../utils/pinchDetection';
import type { PinchState, Point } from '../../types/tracking';
import type { TrackedHandFrame } from '../../utils/handTrackingFrame';
import {
  TIP_SMOOTHING_ALPHA,
  MAX_DRAWN_POINTS,
} from './constants';

interface UseDrawingLoopProps {
  isPlaying: boolean;
  isPaused: boolean;
  currentLetterChar: string;
  currentLetterColor: string;
  showHints: boolean;
  useMouseMode: boolean;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  webcamRef: React.RefObject<Webcam | null>;
  latestTrackingFrameRef: React.MutableRefObject<TrackedHandFrame | null>;
  drawnPointsRef: React.MutableRefObject<Array<{ x: number; y: number }>>;
  pinchStateRef: React.MutableRefObject<PinchState>;
  smoothedTipRef: React.MutableRefObject<Point | null>;
  isPinchingRef: React.MutableRefObject<boolean>;
  isHandPresentRef: React.MutableRefObject<boolean>;
  isDrawingRef: React.MutableRefObject<boolean>;
  rafIdRef: React.MutableRefObject<number | null>;
  lastDrawPointRef: React.MutableRefObject<{ x: number; y: number } | null>;
  setIsPinching: (v: boolean) => void;
  setIsHandPresent: (v: boolean) => void;
}

export function useDrawingLoop({
  isPlaying,
  isPaused,
  currentLetterChar,
  currentLetterColor,
  showHints,
  useMouseMode,
  canvasRef,
  webcamRef,
  latestTrackingFrameRef,
  drawnPointsRef,
  pinchStateRef,
  smoothedTipRef,
  isPinchingRef,
  isHandPresentRef,
  isDrawingRef,
  rafIdRef,
  lastDrawPointRef,
  setIsPinching,
  setIsHandPresent,
}: UseDrawingLoopProps): void {
  useEffect(() => {
    if (!isPlaying || isPaused) return;

    let cancelled = false;

    const loop = () => {
      if (cancelled) return;

      const webcam = webcamRef.current;
      const canvas = canvasRef.current;
      const video = webcam?.video;

      if (!canvas) {
        rafIdRef.current = requestAnimationFrame(loop);
        return;
      }

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        rafIdRef.current = requestAnimationFrame(loop);
        return;
      }

      const hasVideoFrame =
        !!video &&
        video.readyState >= 2 &&
        video.videoWidth > 0 &&
        video.videoHeight > 0;

      // Setup canvas dimensions
      if (hasVideoFrame && video) {
        setupCanvas(canvas, video);
      } else {
        const rect = canvas.getBoundingClientRect();
        const dpr =
          typeof window !== 'undefined' ? (window.devicePixelRatio ?? 1) : 1;
        const nextWidth = Math.max(1, Math.round(rect.width * dpr));
        const nextHeight = Math.max(1, Math.round(rect.height * dpr));
        if (nextWidth !== canvas.width || nextHeight !== canvas.height) {
          canvas.width = nextWidth;
          canvas.height = nextHeight;
        }
      }

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Animation progress for direction arrow
      const time = Date.now() / 1000;
      const animationProgress = (Math.sin(time) + 1) / 2; // 0 to 1 oscillating

      // Draw hint with better visibility
      if (showHints) {
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 4;
        drawLetterHint(ctx, currentLetterChar, canvas.width, canvas.height);
        ctx.shadowBlur = 0;

        // Draw animated direction arrow to guide tracing
        drawDirectionArrow(ctx, canvas.width, canvas.height, currentLetterChar, animationProgress, currentLetterColor);
      }

      // Draw all segments with improved smoothing (quadratic bezier)
      if (drawnPointsRef.current.length > 0) {
        const segments = buildSegments(drawnPointsRef.current);
        drawSegments(ctx, segments, canvas.width, canvas.height, {
          color: currentLetterColor,
          lineWidth: 12,
          enableGlow: true,
          glowBlur: 10,
        });
      }

      // Process pinch detection (skip when in mouse/touch fallback or when video/model isn't ready)
      if (!useMouseMode && hasVideoFrame && video) {
        const landmarks = latestTrackingFrameRef.current?.hands?.[0];
        if (landmarks && landmarks.length >= 9) {
          if (!isHandPresentRef.current) {
            isHandPresentRef.current = true;
            setIsHandPresent(true);
          }

          const pinchResult = detectPinch(landmarks, pinchStateRef.current);
          pinchStateRef.current = pinchResult.state;

          if (pinchResult.state.isPinching !== isPinchingRef.current) {
            isPinchingRef.current = pinchResult.state.isPinching;
            setIsPinching(pinchResult.state.isPinching);
          }

          // Compute fingertip point in normalized space (mirrored video, so invert X)
          const rawX = Math.min(1, Math.max(0, 1 - (landmarks[8]?.x ?? 0)));
          const rawY = Math.min(1, Math.max(0, landmarks[8]?.y ?? 0));
          const nextTip: Point = { x: rawX, y: rawY };

          // Exponential smoothing for cursor + drawing input to reduce jitter
          // alpha closer to 1 = more responsive; closer to 0 = smoother.
          if (!smoothedTipRef.current) {
            smoothedTipRef.current = nextTip;
          } else {
            smoothedTipRef.current = {
              x:
                smoothedTipRef.current.x +
                (nextTip.x - smoothedTipRef.current.x) * TIP_SMOOTHING_ALPHA,
              y:
                smoothedTipRef.current.y +
                (nextTip.y - smoothedTipRef.current.y) * TIP_SMOOTHING_ALPHA,
            };
          }

          // Draw a fingertip cursor so kids can see "ready" vs "pinching" feedback.
          if (smoothedTipRef.current) {
            const cx = smoothedTipRef.current.x * canvas.width;
            const cy = smoothedTipRef.current.y * canvas.height;
            const radius = Math.max(
              10,
              Math.round(Math.min(canvas.width, canvas.height) * 0.018),
            );

            ctx.save();
            ctx.beginPath();
            ctx.arc(cx, cy, radius, 0, Math.PI * 2);
            if (pinchResult.state.isPinching) {
              ctx.fillStyle = currentLetterColor;
              ctx.shadowColor = currentLetterColor;
              ctx.shadowBlur = 10;
              ctx.fill();
            } else {
              ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
              ctx.lineWidth = 3;
              ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
              ctx.shadowBlur = 6;
              ctx.stroke();
            }
            ctx.restore();
          }

          if (pinchResult.transition === 'release') {
            lastDrawPointRef.current = null;
            addBreakPoint(drawnPointsRef.current);
          } else if (
            pinchResult.transition === 'start' ||
            pinchResult.transition === 'continue'
          ) {
            if (isDrawingRef.current) {
              const nextPoint: Point = smoothedTipRef.current ?? nextTip;

              if (
                shouldAddPoint(
                  drawnPointsRef.current[drawnPointsRef.current.length - 1],
                  nextPoint,
                )
              ) {
                drawnPointsRef.current.push(nextPoint);
                if (drawnPointsRef.current.length > MAX_DRAWN_POINTS) {
                  drawnPointsRef.current.shift();
                }
              }
            }
          }
        } else {
          // No hand detected
          if (isPinchingRef.current) {
            isPinchingRef.current = false;
            setIsPinching(false);
            pinchStateRef.current = createDefaultPinchState();
            lastDrawPointRef.current = null;
          }
          if (isHandPresentRef.current) {
            isHandPresentRef.current = false;
            setIsHandPresent(false);
          }
          smoothedTipRef.current = null;
        }
      } else if (isPinchingRef.current) {
        // Ensure pinch UI resets when falling back to mouse mode
        isPinchingRef.current = false;
        setIsPinching(false);
        pinchStateRef.current = createDefaultPinchState();
        lastDrawPointRef.current = null;
        if (isHandPresentRef.current) {
          isHandPresentRef.current = false;
          setIsHandPresent(false);
        }
        smoothedTipRef.current = null;
      }

      rafIdRef.current = requestAnimationFrame(loop);
    };

    rafIdRef.current = requestAnimationFrame(loop);

    return () => {
      cancelled = true;
      if (rafIdRef.current != null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
    };
  }, [
    isPlaying,
    isPaused,
    currentLetterChar,
    currentLetterColor,
    showHints,
    useMouseMode,
  ]); // intentional: exhaustive deps would cause re-renders on every stroke
}
