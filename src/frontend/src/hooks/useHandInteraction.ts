import { useEffect, useMemo, useState, type RefObject } from 'react';
import type { Point } from '../types/tracking';

export type HandPinchTransition = 'start' | 'continue' | 'release' | 'none';

export interface UseHandInteractionOptions {
  /** Normalized cursor position from hand tracking (0-1). */
  cursor: Point | null;
  /** Whether the hand is currently pinching. */
  isPinching: boolean;
  /** Pinch transition state (start/continue/release/none). */
  pinchTransition: HandPinchTransition;
  /** Optional container for normalized coordinate mapping. */
  containerRef?: RefObject<HTMLElement | null>;
  /** Target element to interact with. */
  targetRef: RefObject<HTMLElement | null>;
  /** Whether interaction is enabled. */
  enabled?: boolean;
  /** Called when hover state changes. */
  onHoverChange?: (hovering: boolean) => void;
  /** Called when a pinch-start occurs while hovering over the element. */
  onPinchStart?: () => void;
}

function pointInRect(point: { x: number; y: number }, rect: DOMRect) {
  return (
    point.x >= rect.left &&
    point.x <= rect.right &&
    point.y >= rect.top &&
    point.y <= rect.bottom
  );
}

export function useHandInteraction(options: UseHandInteractionOptions) {
  const {
    cursor,
    isPinching,
    pinchTransition,
    containerRef,
    targetRef,
    enabled = true,
    onHoverChange,
    onPinchStart,
  } = options;

  const [hovering, setHovering] = useState(false);

  // Convert target element bounds to normalized space when containerRef is available
  const isOverTargetNormalized = useMemo(() => {
    if (!cursor || !targetRef.current) return null;

    const target = targetRef.current;
    const targetRect = target.getBoundingClientRect();

    if (containerRef?.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      // Convert cursor to viewport coords for comparison
      const cursorViewport = {
        x: containerRect.left + cursor.x * containerRect.width,
        y: containerRect.top + cursor.y * containerRect.height,
      };
      return pointInRect(cursorViewport, targetRect);
    } else {
      // When no container, require caller to provide viewport coords or use normalized bounds
      // Convert target bounds to normalized space (0-1 based on window size)
      const targetNormalized = {
        left: targetRect.left / window.innerWidth,
        right: targetRect.right / window.innerWidth,
        top: targetRect.top / window.innerHeight,
        bottom: targetRect.bottom / window.innerHeight,
      };
      return (
        cursor.x >= targetNormalized.left &&
        cursor.x <= targetNormalized.right &&
        cursor.y >= targetNormalized.top &&
        cursor.y <= targetNormalized.bottom
      );
    }
  }, [cursor, containerRef, targetRef]);

  useEffect(() => {
    if (!enabled) {
      if (hovering) {
        setHovering(false);
        onHoverChange?.(false);
      }
      return;
    }

    const isOver = isOverTargetNormalized ?? false;

    if (isOver !== hovering) {
      setHovering(isOver);
      onHoverChange?.(isOver);
    }

    if (isOver && isPinching && pinchTransition === 'start') {
      onPinchStart?.();
    }
  }, [
    isOverTargetNormalized,
    hovering,
    isPinching,
    pinchTransition,
    enabled,
    onHoverChange,
    onPinchStart,
  ]);

  return {
    hovering,
  };
}
