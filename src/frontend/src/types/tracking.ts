/**
 * Shared types for hand tracking across all camera-based games
 * @see docs/RESEARCH_HAND_TRACKING_CENTRALIZATION.md
 * @ticket TCK-20260131-142
 */

/** 2D point in normalized coordinates (0-1) */
export interface Point {
  x: number;
  y: number;
}

/** 3D point with optional Z coordinate */
export interface Point3D extends Point {
  z?: number;
}

/** MediaPipe landmark (21 per hand) */
export interface Landmark extends Point3D {
  visibility?: number;
}

/** Hand data from MediaPipe */
export interface HandData {
  landmarks: Landmark[];
  worldLandmarks?: Point3D[];
  handedness?: 'Left' | 'Right';
  score?: number;
}

/** Pinch detection state */
export interface PinchState {
  isPinching: boolean;
  distance: number;
  startThreshold: number;
  releaseThreshold: number;
}

/** Pinch detection result */
export interface PinchResult {
  state: PinchState;
  transition: 'start' | 'continue' | 'release' | 'none';
}

/** Options for useHandTracking hook */
export interface UseHandTrackingOptions {
  /** Maximum number of hands to detect (default: 2) */
  numHands?: number;
  /** Minimum confidence for hand detection (default: 0.3) */
  minDetectionConfidence?: number;
  /** Minimum confidence for hand presence (default: 0.3) */
  minHandPresenceConfidence?: number;
  /** Minimum confidence for tracking (default: 0.3) */
  minTrackingConfidence?: number;
  /** Preferred delegate - will fallback if unavailable (default: 'GPU') */
  delegate?: 'GPU' | 'CPU';
  /** Enable automatic GPU→CPU fallback (default: true) */
  enableFallback?: boolean;
}

/** Return value of useHandTracking hook */
export interface UseHandTrackingReturn {
  /** The HandLandmarker instance (null if not initialized) */
  landmarker: any | null;
  /** Whether the model is currently loading */
  isLoading: boolean;
  /** Error if initialization failed */
  error: Error | null;
  /** Whether the landmarker is ready to use */
  isReady: boolean;
  /** Initialize the hand landmarker */
  initialize: () => Promise<void>;
  /** Reset/error recovery */
  reset: () => void;
}

/** Options for useGameLoop hook */
export interface UseGameLoopOptions {
  /** Callback for each frame */
  onFrame: (deltaTime: number, fps: number) => void;
  /** Whether the loop is running */
  isRunning: boolean;
  /** Target FPS (default: 30) */
  targetFps?: number;
}

/** Return value of useGameLoop hook */
export interface UseGameLoopReturn {
  /** Current FPS */
  fps: number;
  /** Average FPS over last second */
  averageFps: number;
  /** Whether the loop is currently running */
  isRunning: boolean;
  /** Start the loop */
  start: () => void;
  /** Stop the loop */
  stop: () => void;
}

/** Options for drawing utilities */
export interface DrawOptions {
  /** Stroke color (default: '#000000') */
  color?: string;
  /** Line width (default: 10) */
  lineWidth?: number;
  /** Enable glow effect (default: true) */
  enableGlow?: boolean;
  /** Glow color (default: same as color) */
  glowColor?: string;
  /** Glow blur amount (default: 10) */
  glowBlur?: number;
}

/** Options for pinch detection */
export interface PinchOptions {
  /** Threshold to start pinch (default: 0.05) */
  startThreshold?: number;
  /** Threshold to release pinch (default: 0.07) */
  releaseThreshold?: number;
  /** Which landmarks to use for pinch (default: [4, 8] thumb and index) */
  landmarks?: [number, number];
}

/** Segment of connected points */
export type PointSegment = Point[];

/** Compressed point for storage */
export interface CompressedPoint {
  x: number;  // 0-1 normalized
  y: number;  // 0-1 normalized
}
