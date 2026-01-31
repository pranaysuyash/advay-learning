/**
 * Pinch detection utility with hysteresis
 * 
 * Provides consistent pinch detection across all camera-based games
 * with proper hysteresis to prevent flickering between states.
 * 
 * @see docs/RESEARCH_HAND_TRACKING_CENTRALIZATION.md
 * @ticket TCK-20260131-142
 * 
 * Hysteresis explanation:
 * - Start threshold (0.05): Must be tighter to start pinching
 * - Release threshold (0.07): Can be looser to stop pinching
 * - This makes it easier to stop drawing than to start, improving UX
 */

import type {
  Landmark,
  PinchState,
  PinchResult,
  PinchOptions,
} from '../types/tracking';

const DEFAULT_PINCH_OPTIONS: Required<PinchOptions> = {
  startThreshold: 0.05,
  releaseThreshold: 0.07,
  landmarks: [4, 8], // Thumb tip (4) and index tip (8)
};

/**
 * Create default pinch state
 * 
 * @param options - Optional custom thresholds
 * @returns Default pinch state
 */
export function createDefaultPinchState(options?: PinchOptions): PinchState {
  const opts = { ...DEFAULT_PINCH_OPTIONS, ...options };
  return {
    isPinching: false,
    distance: 1.0,
    startThreshold: opts.startThreshold,
    releaseThreshold: opts.releaseThreshold,
  };
}

/**
 * Calculate distance between two landmarks
 * 
 * @param a - First landmark
 * @param b - Second landmark
 * @returns Euclidean distance
 */
function landmarkDistance(a: Landmark, b: Landmark): number {
  const dx = (a.x ?? 0) - (b.x ?? 0);
  const dy = (a.y ?? 0) - (b.y ?? 0);
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Detect pinch with hysteresis
 * 
 * @param landmarks - Hand landmarks from MediaPipe
 * @param previousState - Previous pinch state (null for first call)
 * @param options - Pinch detection options
 * @returns Pinch result with state and transition
 * 
 * @example
 * ```tsx
 * const [pinchState, setPinchState] = useState(createDefaultPinchState());
 * 
 * useEffect(() => {
 *   if (landmarks) {
 *     const result = detectPinch(landmarks, pinchState);
 *     setPinchState(result.state);
 *     
 *     if (result.transition === 'start') {
 *       console.log('Pinch started!');
 *     } else if (result.transition === 'release') {
 *       console.log('Pinch released!');
 *     }
 *   }
 * }, [landmarks]);
 * ```
 */
export function detectPinch(
  landmarks: Landmark[],
  previousState: PinchState | null,
  options?: PinchOptions
): PinchResult {
  const opts = { ...DEFAULT_PINCH_OPTIONS, ...options };
  
  // Validate landmarks
  if (!landmarks || landmarks.length < 9) {
    return {
      state: previousState || createDefaultPinchState(options),
      transition: 'none',
    };
  }
  
  const [landmarkA, landmarkB] = opts.landmarks;
  const pointA = landmarks[landmarkA];
  const pointB = landmarks[landmarkB];
  
  if (!pointA || !pointB) {
    return {
      state: previousState || createDefaultPinchState(options),
      transition: 'none',
    };
  }
  
  // Calculate distance
  const distance = landmarkDistance(pointA, pointB);
  
  // Determine previous state
  const wasPinching = previousState?.isPinching ?? false;
  
  // Apply hysteresis
  let isPinching = wasPinching;
  
  if (!wasPinching && distance < opts.startThreshold) {
    // Not pinching, but now close enough to start
    isPinching = true;
  } else if (wasPinching && distance > opts.releaseThreshold) {
    // Currently pinching, but now far enough to release
    isPinching = false;
  }
  // Otherwise maintain current state (hysteresis zone)
  
  // Determine transition
  let transition: PinchResult['transition'] = 'none';
  if (isPinching && !wasPinching) {
    transition = 'start';
  } else if (!isPinching && wasPinching) {
    transition = 'release';
  } else if (isPinching && wasPinching) {
    transition = 'continue';
  }
  
  return {
    state: {
      isPinching,
      distance,
      startThreshold: opts.startThreshold,
      releaseThreshold: opts.releaseThreshold,
    },
    transition,
  };
}

/**
 * Simple pinch detection without hysteresis
 * Use for quick checks where state management isn't needed
 * 
 * @param landmarks - Hand landmarks
 * @param threshold - Distance threshold (default: 0.05)
 * @returns True if pinching
 */
export function isPinching(
  landmarks: Landmark[],
  threshold: number = 0.05
): boolean {
  if (!landmarks || landmarks.length < 9) return false;
  
  const thumbTip = landmarks[4];
  const indexTip = landmarks[8];
  
  if (!thumbTip || !indexTip) return false;
  
  const distance = landmarkDistance(thumbTip, indexTip);
  return distance < threshold;
}

/**
 * Get pinch distance
 * 
 * @param landmarks - Hand landmarks
 * @returns Distance between thumb and index (1.0 if invalid)
 */
export function getPinchDistance(landmarks: Landmark[]): number {
  if (!landmarks || landmarks.length < 9) return 1.0;
  
  const thumbTip = landmarks[4];
  const indexTip = landmarks[8];
  
  if (!thumbTip || !indexTip) return 1.0;
  
  return landmarkDistance(thumbTip, indexTip);
}
