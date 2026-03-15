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

  const cursorPoint = useMemo(() => {
    if (!cursor) return null;
    if (!containerRef?.current) return cursor;

    const rect = containerRef.current.getBoundingClientRect();
    return {
      x: rect.left + cursor.x * rect.width,
      y: rect.top + cursor.y * rect.height,
    };
  }, [cursor, containerRef]);

  useEffect(() => {
    if (!enabled) {
      if (hovering) {
        setHovering(false);
        onHoverChange?.(false);
      }
      return;
    }

    const target = targetRef.current;
    if (!target || !cursorPoint) {
      if (hovering) {
        setHovering(false);
        onHoverChange?.(false);
      }
      return;
    }

    const rect = target.getBoundingClientRect();
    const isOver = pointInRect(cursorPoint, rect);

    if (isOver !== hovering) {
      setHovering(isOver);
      onHoverChange?.(isOver);
    }

    if (isOver && pinchTransition === 'start') {
      onPinchStart?.();
    }
  }, [
    cursorPoint,
    targetRef,
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
