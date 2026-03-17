/**
 * Gesture Detection Utilities
 *
 * Utilities for detecting hand gestures beyond basic cursor tracking.
 * Detects pointing gestures, pinching, and other hand configurations.
 */

import type { Point } from '../types/tracking';

export interface NormalizedLandmark {
  x: number;
  y: number;
  z?: number;
}

export interface PointingGesture {
  isPointing: boolean;
  pointingDirection: Point;
  pointingRay: {
    origin: Point;
    direction: Point;
  };
  confidence: number;
}

/**
 * Detect if the hand is making a pointing gesture.
 *
 * A pointing gesture is detected when:
 * - Index finger is extended (straight)
 * - Other fingers are curled (not extended)
 * - Palm is roughly facing the camera
 *
 * @param landmarks - Normalized hand landmarks from MediaPipe
 * @returns Pointing gesture data
 */
export function detectPointingGesture(
  landmarks: NormalizedLandmark[],
): PointingGesture {
  if (!landmarks || landmarks.length < 21) {
    return {
      isPointing: false,
      pointingDirection: { x: 0, y: 0 },
      pointingRay: { origin: { x: 0, y: 0 }, direction: { x: 0, y: 0 } },
      confidence: 0,
    };
  }

  // MediaPipe hand landmark indices:
  // 0: Wrist
  // 5, 9, 13, 17: Finger MCP joints (thumb, index, middle, ring, pinky)
  // 6, 10, 14, 18: Finger PIP joints
  // 7, 11, 15, 19: Finger DIP joints
  // 8, 12, 16, 20: Finger tips

  const wrist = landmarks[0];
  const indexMCP = landmarks[5];
  const indexTip = landmarks[8];
  const middleMCP = landmarks[9];
  const middleTip = landmarks[12];
  const ringMCP = landmarks[13];
  const ringTip = landmarks[16];
  const pinkyMCP = landmarks[17];
  const pinkyTip = landmarks[20];

  // Check if index finger is extended
  // Compare distance from wrist to index tip vs wrist to index MCP
  const wristToIndexMCP = distance(wrist, indexMCP);
  const wristToIndexTip = distance(wrist, indexTip);
  const indexExtended = wristToIndexTip > wristToIndexMCP * 1.5;

  // Check if middle, ring, and pinky fingers are curled
  const wristToMiddleMCP = distance(wrist, middleMCP);
  const wristToMiddleTip = distance(wrist, middleTip);
  const middleCurled = wristToMiddleTip < wristToMiddleMCP * 1.3;

  const wristToRingMCP = distance(wrist, ringMCP);
  const wristToRingTip = distance(wrist, ringTip);
  const ringCurled = wristToRingTip < wristToRingMCP * 1.3;

  const wristToPinkyMCP = distance(wrist, pinkyMCP);
  const wristToPinkyTip = distance(wrist, pinkyTip);
  const pinkyCurled = wristToPinkyTip < wristToPinkyMCP * 1.3;

  // Pointing gesture requires: index extended, other fingers curled
  const isPointing = indexExtended && middleCurled && ringCurled && pinkyCurled;

  // Calculate pointing direction (from wrist through index tip)
  const pointingDirection: Point = {
    x: indexTip.x - wrist.x,
    y: indexTip.y - wrist.y,
  };

  // Normalize the direction
  const length = Math.sqrt(pointingDirection.x ** 2 + pointingDirection.y ** 2);
  if (length > 0) {
    pointingDirection.x /= length;
    pointingDirection.y /= length;
  }

  // Calculate confidence based on how clearly the gesture matches
  let confidence = 0;
  if (isPointing) {
    confidence = 0.5; // Base confidence for meeting basic criteria

    // Increase confidence if index finger is very straight
    if (wristToIndexTip > wristToIndexMCP * 2.0) {
      confidence += 0.2;
    }

    // Increase confidence if other fingers are very curled
    if (middleCurled && ringCurled && pinkyCurled) {
      confidence += 0.2;
    }

    // Increase confidence if palm is facing forward (wrist z is close to finger z values)
    const palmZ = wrist.z ?? 0;
    const fingerZ = indexTip.z ?? 0;
    if (Math.abs(palmZ - fingerZ) < 0.1) {
      confidence += 0.1;
    }
  }

  return {
    isPointing,
    pointingDirection,
    pointingRay: {
      origin: { x: indexTip.x, y: indexTip.y },
      direction: pointingDirection,
    },
    confidence: Math.min(confidence, 1),
  };
}

/**
 * Calculate the Euclidean distance between two points.
 */
function distance(a: NormalizedLandmark, b: NormalizedLandmark): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const dz = (a.z ?? 0) - (b.z ?? 0);
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

/**
 * Cast a ray from a point in a direction and find where it intersects with a target area.
 *
 * This is useful for determining what the user is pointing at on screen.
 *
 * @param rayOrigin - Starting point of the ray (normalized 0-1)
 * @param rayDirection - Direction of the ray (normalized vector)
 * @param targetBounds - Bounding rectangle of the target area {x, y, width, height}
 * @returns Point of intersection or null if no intersection
 */
export function rayIntersectsRect(
  rayOrigin: Point,
  rayDirection: Point,
  targetBounds: { x: number; y: number; width: number; height: number },
): Point | null {
  // Convert ray from normalized to screen coordinates
  const rayOriginScreen = {
    x: rayOrigin.x * window.innerWidth,
    y: rayOrigin.y * window.innerHeight,
  };

  // Extend the ray in the pointing direction
  const rayLength = Math.max(window.innerWidth, window.innerHeight) * 2;
  const rayEnd = {
    x: rayOriginScreen.x + rayDirection.x * rayLength,
    y: rayOriginScreen.y + rayDirection.y * rayLength,
  };

  // Check if ray intersects with the target rectangle
  // Using line segment intersection with rectangle edges

  const rectLeft = targetBounds.x;
  const rectRight = targetBounds.x + targetBounds.width;
  const rectTop = targetBounds.y;
  const rectBottom = targetBounds.y + targetBounds.height;

  // Find intersection with rectangle boundaries
  let closestIntersection: Point | null = null;
  let closestDistance = Infinity;

  // Check intersection with each edge of the rectangle
  const edges = [
    { x1: rectLeft, y1: rectTop, x2: rectRight, y2: rectTop }, // Top
    { x1: rectRight, y1: rectTop, x2: rectRight, y2: rectBottom }, // Right
    { x1: rectRight, y1: rectBottom, x2: rectLeft, y2: rectBottom }, // Bottom
    { x1: rectLeft, y1: rectBottom, x2: rectLeft, y2: rectTop }, // Left
  ];

  for (const edge of edges) {
    const intersection = lineIntersection(
      rayOriginScreen.x,
      rayOriginScreen.y,
      rayEnd.x,
      rayEnd.y,
      edge.x1,
      edge.y1,
      edge.x2,
      edge.y2,
    );

    if (intersection) {
      const dist = distance(
        { x: rayOriginScreen.x / window.innerWidth, y: rayOriginScreen.y / window.innerHeight },
        { x: intersection.x / window.innerWidth, y: intersection.y / window.innerHeight }
      );
      if (dist < closestDistance) {
        closestDistance = dist;
        closestIntersection = intersection;
      }
    }
  }

  return closestIntersection;
}

/**
 * Find the intersection point of two line segments.
 */
function lineIntersection(
  x1: number, y1: number,
  x2: number, y2: number,
  x3: number, y3: number,
  x4: number, y4: number,
): Point | null {
  const denom = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1);
  if (Math.abs(denom) < 0.0001) {
    return null; // Lines are parallel
  }

  const ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denom;
  const ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denom;

  if (ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1) {
    return {
      x: x1 + ua * (x2 - x1),
      y: y1 + ua * (y2 - y1),
    };
  }

  return null;
}

/**
 * Calculate which item in a grid is being pointed at.
 *
 * @param pointingGesture - The detected pointing gesture
 * @param items - Array of item bounding rectangles
 * @returns The index of the pointed item, or null if none
 */
export function getPointedItem(
  pointingGesture: PointingGesture,
  items: Array<{ id: string; bounds: DOMRect }>,
): string | null {
  if (!pointingGesture.isPointing || pointingGesture.confidence < 0.5) {
    return null;
  }

  // For now, use simple proximity to index finger tip
  // In a more advanced implementation, we could use ray casting
  let closestItem: string | null = null;
  let closestDistance = Infinity;

  for (const item of items) {
    // Calculate distance from index tip to item center
    const itemCenter = {
      x: item.bounds.left + item.bounds.width / 2,
      y: item.bounds.top + item.bounds.height / 2,
    };

    const indexTipScreen = {
      x: pointingGesture.pointingRay.origin.x * window.innerWidth,
      y: pointingGesture.pointingRay.origin.y * window.innerHeight,
    };

    const dist = Math.sqrt(
      (itemCenter.x - indexTipScreen.x) ** 2 +
      (itemCenter.y - indexTipScreen.y) ** 2
    );

    if (dist < closestDistance) {
      closestDistance = dist;
      closestItem = item.id;
    }
  }

  // Only return if close enough (within 200px)
  if (closestDistance < 200) {
    return closestItem;
  }

  return null;
}

export default {
  detectPointingGesture,
  rayIntersectsRect,
  getPointedItem,
};
