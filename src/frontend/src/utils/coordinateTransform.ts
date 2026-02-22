/**
 * Coordinate Transformation Utilities
 *
 * CRITICAL FIXES FROM AUDIT:
 * - Proper hand-to-screen coordinate transformation
 * - Fixes 2787px offset bug from emoji match audit
 * - Handles aspect ratio correctly
 * - Clamps to screen bounds
 * - Supports mirrored camera (flip X axis)
 *
 * Issue References: HT-001 from EMOJI_MATCH_COMPREHENSIVE_VIDEO_AUDIT_COLLATION_2026-02-20.md
 *
 * Root Cause Analysis:
 * MediaPipe outputs normalized coordinates (0-1 range) in video feed space.
 * These must be transformed to screen pixel coordinates with proper aspect ratio handling.
 *
 * The emoji match bug showed:
 * - Hand detected at normalized (0.00071, 0.50126)
 * - Should map to screen (~2, 995) given video dimensions
 * - Instead rendered at (2624, 51) = 2787px offset
 * - Caused by missing/incorrect coordinate transformation
 */

/**
 * MediaPipe landmark point (normalized 0-1 coordinates)
 */
export interface NormalizedLandmark {
  x: number; // Normalized horizontal position (0-1, 0 = left, 1 = right)
  y: number; // Normalized vertical position (0-1, 0 = top, 1 = bottom)
  z?: number; // Depth (optional, relative to wrist)
}

/**
 * Screen coordinate point (pixel coordinates)
 */
export interface ScreenCoordinate {
  x: number; // Horizontal pixel position
  y: number; // Vertical pixel position
}

export interface Size {
  width: number;
  height: number;
}

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

/**
 * Map normalized landmark coordinates to the on-screen container when the video
 * is rendered with object-cover (cropping by aspect ratio).
 */
export function mapNormalizedPointToCover(
  landmark: NormalizedLandmark,
  videoSize: Size,
  containerSize: Size,
  options?: {
    /** Mirror horizontally (for selfie view) - default: true */
    mirrored?: boolean;
    /** Clamp to container bounds - default: true */
    clamp?: boolean;
  },
): NormalizedLandmark {
  const { mirrored = true, clamp = true } = options || {};

  if (
    !videoSize.width ||
    !videoSize.height ||
    !containerSize.width ||
    !containerSize.height
  ) {
    const fallbackX = mirrored ? 1 - landmark.x : landmark.x;
    return {
      x: clamp ? clamp01(fallbackX) : fallbackX,
      y: clamp ? clamp01(landmark.y) : landmark.y,
    };
  }

  const normalizedX = mirrored ? 1 - landmark.x : landmark.x;
  const scale = Math.max(
    containerSize.width / videoSize.width,
    containerSize.height / videoSize.height,
  );
  const scaledWidth = videoSize.width * scale;
  const scaledHeight = videoSize.height * scale;
  const offsetX = (containerSize.width - scaledWidth) / 2;
  const offsetY = (containerSize.height - scaledHeight) / 2;

  const x =
    (normalizedX * videoSize.width * scale + offsetX) / containerSize.width;
  const y =
    (landmark.y * videoSize.height * scale + offsetY) / containerSize.height;

  return {
    x: clamp ? clamp01(x) : x,
    y: clamp ? clamp01(y) : y,
  };
}

/**
 * Transform MediaPipe normalized landmarks to screen pixel coordinates
 *
 * MANDATORY: Use this function for ALL hand/pose tracking cursor positioning
 *
 * @param landmark - MediaPipe landmark with normalized coordinates (0-1)
 * @param videoWidth - Width of video feed in pixels (e.g., 640)
 * @param videoHeight - Height of video feed in pixels (e.g., 480)
 * @param canvasWidth - Width of game canvas/screen in pixels (e.g., window.innerWidth)
 * @param canvasHeight - Height of game canvas/screen in pixels (e.g., window.innerHeight)
 * @param options - Optional transformation options
 * @returns Screen coordinates in pixels
 *
 * @example
 * ```typescript
 * const indexTip = landmarks[8]; // MediaPipe hand landmark
 * const screenPos = handToScreenCoordinates(
 *   indexTip,
 *   640,  // Video width
 *   480,  // Video height
 *   window.innerWidth,
 *   window.innerHeight,
 *   { mirrored: true }
 * );
 * // screenPos: { x: 1024, y: 768 } (example)
 * ```
 */
export function handToScreenCoordinates(
  landmark: NormalizedLandmark,
  videoWidth: number,
  videoHeight: number,
  canvasWidth: number,
  canvasHeight: number,
  options?: {
    /** Mirror horizontally (for selfie view) - default: true */
    mirrored?: boolean;
    /** Clamp to canvas bounds - default: true */
    clamp?: boolean;
    /** Margin from edges in pixels - default: 0 */
    margin?: number;
  },
): ScreenCoordinate {
  const { mirrored = true, clamp = true, margin = 0 } = options || {};

  // Step 1: Convert normalized coordinates to video pixel coordinates
  let videoX = landmark.x * videoWidth;
  let videoY = landmark.y * videoHeight;

  // Step 2: Mirror horizontally if camera is mirrored (typical selfie view)
  if (mirrored) {
    videoX = videoWidth - videoX;
  }

  // Step 3: Calculate scaling factors (handle aspect ratio)
  const scaleX = canvasWidth / videoWidth;
  const scaleY = canvasHeight / videoHeight;

  // Step 4: Apply scaling to get canvas coordinates
  let canvasX = videoX * scaleX;
  let canvasY = videoY * scaleY;

  // Step 5: Clamp to bounds (prevent cursor going off-screen)
  if (clamp) {
    canvasX = Math.max(margin, Math.min(canvasWidth - margin, canvasX));
    canvasY = Math.max(margin, Math.min(canvasHeight - margin, canvasY));
  }

  return {
    x: canvasX,
    y: canvasY,
  };
}

/**
 * Batch transform multiple landmarks to screen coordinates
 *
 * @param landmarks - Array of MediaPipe landmarks
 * @param videoWidth - Video width
 * @param videoHeight - Video height
 * @param canvasWidth - Canvas width
 * @param canvasHeight - Canvas height
 * @param options - Transformation options
 * @returns Array of screen coordinates
 */
export function landmarksToScreenCoordinates(
  landmarks: NormalizedLandmark[],
  videoWidth: number,
  videoHeight: number,
  canvasWidth: number,
  canvasHeight: number,
  options?: Parameters<typeof handToScreenCoordinates>[5],
): ScreenCoordinate[] {
  return landmarks.map((landmark) =>
    handToScreenCoordinates(
      landmark,
      videoWidth,
      videoHeight,
      canvasWidth,
      canvasHeight,
      options,
    ),
  );
}

/**
 * Smooth cursor position to reduce jitter
 *
 * Uses exponential moving average to smooth rapid position changes.
 * Recommended for hand tracking to reduce MediaPipe jitter.
 *
 * @param current - Current cursor position
 * @param target - New target position from hand tracking
 * @param smoothingFactor - Smoothing factor (0-1, higher = more smoothing) - default: 0.5
 * @returns Smoothed position
 *
 * @example
 * ```typescript
 * const [smoothPos, setSmoothPos] = useState({ x: 0, y: 0 });
 *
 * useEffect(() => {
 *   const rawPos = handToScreenCoordinates(...);
 *   const smoothed = smoothPosition(smoothPos, rawPos, 0.7);
 *   setSmoothPos(smoothed);
 * }, [landmarks]);
 * ```
 */
export function smoothPosition(
  current: ScreenCoordinate,
  target: ScreenCoordinate,
  smoothingFactor: number = 0.5,
): ScreenCoordinate {
  // Clamp smoothing factor (0-1)
  const alpha = Math.max(0, Math.min(1, smoothingFactor));

  return {
    x: current.x * alpha + target.x * (1 - alpha),
    y: current.y * alpha + target.y * (1 - alpha),
  };
}

/**
 * Kalman filter for advanced cursor smoothing
 *
 * More sophisticated than exponential smoothing, reduces jitter
 * while maintaining responsiveness to real movement.
 *
 * Usage: Create KalmanFilter instance, call update() on each frame.
 */
export class KalmanFilter {
  private stateX: number = 0;
  private stateY: number = 0;
  private varianceX: number = 1;
  private varianceY: number = 1;

  constructor(
    private processNoise: number = 0.01,
    private measurementNoise: number = 0.1,
  ) {}

  public update(measurement: ScreenCoordinate): ScreenCoordinate {
    // Prediction step
    const predictedVarianceX = this.varianceX + this.processNoise;
    const predictedVarianceY = this.varianceY + this.processNoise;

    // Update step (Kalman gain)
    const gainX =
      predictedVarianceX / (predictedVarianceX + this.measurementNoise);
    const gainY =
      predictedVarianceY / (predictedVarianceY + this.measurementNoise);

    // Update state
    this.stateX = this.stateX + gainX * (measurement.x - this.stateX);
    this.stateY = this.stateY + gainY * (measurement.y - this.stateY);

    // Update variance
    this.varianceX = (1 - gainX) * predictedVarianceX;
    this.varianceY = (1 - gainY) * predictedVarianceY;

    return {
      x: this.stateX,
      y: this.stateY,
    };
  }

  public reset() {
    this.stateX = 0;
    this.stateY = 0;
    this.varianceX = 1;
    this.varianceY = 1;
  }
}

/**
 * Calculate distance between two screen coordinates (pixels)
 */
export function distanceBetween(
  a: ScreenCoordinate,
  b: ScreenCoordinate,
): number {
  return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
}

/**
 * Check if point is within circular target
 *
 * @param point - Cursor position
 * @param target - Target center position
 * @param radius - Target radius in pixels
 * @returns true if point is within target
 */
export function isWithinTarget(
  point: ScreenCoordinate,
  target: ScreenCoordinate,
  radius: number,
): boolean {
  return distanceBetween(point, target) <= radius;
}

/**
 * Check if point is within rectangular target
 */
export function isWithinRect(
  point: ScreenCoordinate,
  rect: { x: number; y: number; width: number; height: number },
): boolean {
  return (
    point.x >= rect.x &&
    point.x <= rect.x + rect.width &&
    point.y >= rect.y &&
    point.y <= rect.y + rect.height
  );
}

/**
 * Magnetic snap: Snap cursor to target if within snap distance
 *
 * MANDATORY: Implement for all games targeting toddlers (ages 2-4)
 *
 * @param cursor - Current cursor position
 * @param target - Target center position
 * @param snapDistance - Distance threshold for snapping (default: 100px)
 * @param snapStrength - Snap interpolation factor (0-1, default: 0.3)
 * @returns Snapped position (or original if outside snap distance)
 *
 * @example
 * ```typescript
 * const snappedPos = magneticSnap(cursorPos, targetPos, 100, 0.3);
 * setCursorPos(snappedPos);
 * ```
 */
export function magneticSnap(
  cursor: ScreenCoordinate,
  target: ScreenCoordinate,
  snapDistance: number = 100,
  snapStrength: number = 0.3,
): ScreenCoordinate {
  const distance = distanceBetween(cursor, target);

  // Outside snap range - no change
  if (distance > snapDistance) {
    return cursor;
  }

  // Inside snap range - interpolate toward target
  const t = snapStrength * (1 - distance / snapDistance);

  return {
    x: cursor.x + (target.x - cursor.x) * t,
    y: cursor.y + (target.y - cursor.y) * t,
  };
}

/**
 * Testing Requirements:
 *
 * Coordinate Accuracy Test:
 * - [ ] Move hand to top-left corner: cursor should be at (0, 0) ± 50px
 * - [ ] Move hand to top-right corner: cursor should be at (width, 0) ± 50px
 * - [ ] Move hand to bottom-left corner: cursor should be at (0, height) ± 50px
 * - [ ] Move hand to bottom-right corner: cursor should be at (width, height) ± 50px
 * - [ ] Move hand to center: cursor should be at (width/2, height/2) ± 50px
 *
 * Aspect Ratio Test:
 * - [ ] Test on 16:9 screen (1920x1080)
 * - [ ] Test on 4:3 screen (1024x768)
 * - [ ] Test on ultrawide screen (2560x1080)
 * - [ ] Verify no distortion/stretching
 *
 * Mirroring Test:
 * - [ ] Mirrored mode: moving hand left should move cursor left (selfie view)
 * - [ ] Non-mirrored mode: moving hand left should move cursor right (back camera)
 *
 * Smoothing Test:
 * - [ ] Rapid hand movement: cursor should follow smoothly (no jumps >100px)
 * - [ ] Still hand: cursor should have <10px jitter
 * - [ ] Kalman filter: jitter reduced by 50%+ compared to raw coords
 *
 * Performance Test:
 * - [ ] Coordinate transformation: <1ms per frame (measure with console.time)
 * - [ ] Smoothing: <0.5ms per frame
 * - [ ] No memory leaks after 1000+ frames
 */
