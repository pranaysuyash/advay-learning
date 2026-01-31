/**
 * GestureRecognizer - Hand gesture detection from MediaPipe landmarks
 * 
 * Detects hand gestures (open palm, fist, thumbs up, point, etc.) from
 * MediaPipe HandLandmarker landmarks. Used for gesture-based game controls.
 * 
 * @see docs/RESEARCH_GESTURE_CONTROL_SYSTEM.md
 * @ticket TCK-20260131-110
 */

export interface Landmark {
  x: number;
  y: number;
  z?: number;
}

export interface GestureResult {
  /** The detected gesture type */
  gesture: GestureType;
  /** Confidence score 0-1 based on landmark clarity */
  confidence: number;
  /** Which hand detected (MediaPipe doesn't reliably provide this, so we infer) */
  hand: 'left' | 'right' | 'unknown';
  /** How long the gesture has been held (ms) */
  duration: number;
  /** Raw landmarks for debugging */
  landmarks?: Landmark[];
}

export type GestureType =
  | 'OPEN_PALM'
  | 'FIST'
  | 'THUMBS_UP'
  | 'THUMBS_DOWN'
  | 'POINT'
  | 'OK_SIGN'
  | 'PEACE_SIGN'
  | 'ROCK_ON'
  | 'UNKNOWN';

interface GestureConfig {
  /** Minimum confidence threshold for gesture detection (0-1) */
  minConfidence: number;
  /** Finger extension threshold - how much further tip must be from wrist than PIP */
  extensionThreshold: number;
  /** Thumb extension threshold - special case due to different anatomy */
  thumbExtensionThreshold: number;
}

const DEFAULT_CONFIG: GestureConfig = {
  minConfidence: 0.85,
  extensionThreshold: 0.02,
  thumbExtensionThreshold: 0.03,
};

/**
 * MediaPipe hand landmark indices:
 * 0: wrist
 * 1-4: thumb (CMC, MCP, IP, TIP)
 * 5-8: index finger (MCP, PIP, DIP, TIP)
 * 9-12: middle finger (MCP, PIP, DIP, TIP)
 * 13-16: ring finger (MCP, PIP, DIP, TIP)
 * 17-20: pinky (MCP, PIP, DIP, TIP)
 */
const LANDMARKS = {
  WRIST: 0,
  THUMB_CMC: 1,
  THUMB_MCP: 2,
  THUMB_IP: 3,
  THUMB_TIP: 4,
  INDEX_MCP: 5,
  INDEX_PIP: 6,
  INDEX_DIP: 7,
  INDEX_TIP: 8,
  MIDDLE_MCP: 9,
  MIDDLE_PIP: 10,
  MIDDLE_DIP: 11,
  MIDDLE_TIP: 12,
  RING_MCP: 13,
  RING_PIP: 14,
  RING_DIP: 15,
  RING_TIP: 16,
  PINKY_MCP: 17,
  PINKY_PIP: 18,
  PINKY_DIP: 19,
  PINKY_TIP: 20,
} as const;

/**
 * Calculate Euclidean distance between two points
 */
function distance(a: Landmark, b: Landmark): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Calculate palm center from wrist and finger bases
 */
function calculatePalmCenter(landmarks: Landmark[]): Landmark {
  const wrist = landmarks[LANDMARKS.WRIST];
  const indexMCP = landmarks[LANDMARKS.INDEX_MCP];
  const middleMCP = landmarks[LANDMARKS.MIDDLE_MCP];
  const ringMCP = landmarks[LANDMARKS.RING_MCP];
  const pinkyMCP = landmarks[LANDMARKS.PINKY_MCP];

  const points = [wrist, indexMCP, middleMCP, ringMCP, pinkyMCP].filter(Boolean);
  
  return {
    x: points.reduce((sum, p) => sum + p.x, 0) / points.length,
    y: points.reduce((sum, p) => sum + p.y, 0) / points.length,
  };
}

/**
 * Check if a finger is extended (tip further from wrist than PIP joint)
 */
function isFingerExtended(
  landmarks: Landmark[],
  tipIdx: number,
  pipIdx: number,
  wrist: Landmark,
  threshold: number
): boolean {
  const tip = landmarks[tipIdx];
  const pip = landmarks[pipIdx];
  
  if (!tip || !pip) return false;
  
  const tipDist = distance(tip, wrist);
  const pipDist = distance(pip, wrist);
  
  return tipDist > pipDist + threshold;
}

/**
 * GestureRecognizer - Main class for detecting hand gestures
 */
export class GestureRecognizer {
  private config: GestureConfig;
  private gestureStartTime: Map<GestureType, number> = new Map();
  private lastDetectedGesture: GestureType | null = null;

  constructor(config: Partial<GestureConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Detect gesture from MediaPipe hand landmarks
   * @param landmarks - 21 hand landmarks from MediaPipe
   * @param timestamp - Current timestamp (ms) for duration calculation
   * @returns GestureResult or null if no gesture detected
   */
  detect(landmarks: Landmark[], timestamp: number = Date.now()): GestureResult | null {
    if (!landmarks || landmarks.length < 21) {
      return null;
    }

    const gesture = this.identifyGesture(landmarks);
    
    if (gesture === 'UNKNOWN') {
      this.gestureStartTime.clear();
      this.lastDetectedGesture = null;
      return null;
    }

    // Calculate duration
    if (gesture !== this.lastDetectedGesture) {
      this.gestureStartTime.clear();
      this.gestureStartTime.set(gesture, timestamp);
      this.lastDetectedGesture = gesture;
    }

    const startTime = this.gestureStartTime.get(gesture) || timestamp;
    const duration = timestamp - startTime;

    // Calculate confidence based on landmark clarity
    const confidence = this.calculateConfidence(landmarks, gesture);

    if (confidence < this.config.minConfidence) {
      return null;
    }

    return {
      gesture,
      confidence,
      hand: this.inferHand(landmarks),
      duration,
      landmarks: (import.meta as any)?.env?.DEV ? landmarks : undefined,
    };
  }

  /**
   * Identify which gesture is being made
   */
  private identifyGesture(landmarks: Landmark[]): GestureType {
    const wrist = landmarks[LANDMARKS.WRIST];
    const palmCenter = calculatePalmCenter(landmarks);

    // Check finger states
    const indexExtended = isFingerExtended(
      landmarks, LANDMARKS.INDEX_TIP, LANDMARKS.INDEX_PIP, wrist, this.config.extensionThreshold
    );
    const middleExtended = isFingerExtended(
      landmarks, LANDMARKS.MIDDLE_TIP, LANDMARKS.MIDDLE_PIP, wrist, this.config.extensionThreshold
    );
    const ringExtended = isFingerExtended(
      landmarks, LANDMARKS.RING_TIP, LANDMARKS.RING_PIP, wrist, this.config.extensionThreshold
    );
    const pinkyExtended = isFingerExtended(
      landmarks, LANDMARKS.PINKY_TIP, LANDMARKS.PINKY_PIP, wrist, this.config.extensionThreshold
    );

    // Thumb check - more complex due to different anatomy
    const thumbTip = landmarks[LANDMARKS.THUMB_TIP];
    const thumbIP = landmarks[LANDMARKS.THUMB_IP];
    const thumbExtended = thumbTip && thumbIP && 
      distance(thumbTip, palmCenter) > distance(thumbIP, palmCenter) + this.config.thumbExtensionThreshold;

    const extendedCount = [indexExtended, middleExtended, ringExtended, pinkyExtended].filter(Boolean).length;

    // Gesture detection logic
    
    // 1. FIST: All fingers curled
    if (extendedCount === 0 && !thumbExtended) {
      return 'FIST';
    }

    // 2. OPEN_PALM: All fingers extended
    if (extendedCount === 4 && thumbExtended) {
      return 'OPEN_PALM';
    }

    // 3. POINT: Only index extended
    if (indexExtended && !middleExtended && !ringExtended && !pinkyExtended) {
      return 'POINT';
    }

    // 4. THUMBS_UP: Thumb extended up, others curled
    if (thumbExtended && extendedCount === 0) {
      // Check if thumb is pointing up (y coordinate lower = higher on screen)
      if (thumbTip.y < landmarks[LANDMARKS.THUMB_MCP].y) {
        return 'THUMBS_UP';
      } else {
        return 'THUMBS_DOWN';
      }
    }

    // 5. PEACE_SIGN: Index and middle extended, others curled
    if (indexExtended && middleExtended && !ringExtended && !pinkyExtended) {
      return 'PEACE_SIGN';
    }

    // 6. ROCK_ON: Index and pinky extended, middle and ring curled
    if (indexExtended && !middleExtended && !ringExtended && pinkyExtended) {
      return 'ROCK_ON';
    }

    // 7. OK_SIGN: Thumb and index touching, others extended
    if (thumbTip && indexExtended && middleExtended && ringExtended && pinkyExtended) {
      const thumbIndexDist = distance(thumbTip, landmarks[LANDMARKS.INDEX_TIP]);
      if (thumbIndexDist < 0.05) { // Very close together
        return 'OK_SIGN';
      }
    }

    return 'UNKNOWN';
  }

  /**
   * Calculate confidence score based on landmark quality
   */
  private calculateConfidence(landmarks: Landmark[], gesture: GestureType): number {
    // Check landmark visibility (z coordinate should be reasonable)
    let visibleCount = 0;
    let totalConfidence = 0;

    for (const landmark of landmarks) {
      if (landmark && typeof landmark.x === 'number' && typeof landmark.y === 'number') {
        visibleCount++;
        // Penalize extreme z values (hand very close/far from camera)
        const zPenalty = landmark.z ? Math.max(0, 1 - Math.abs(landmark.z) * 2) : 1;
        totalConfidence += zPenalty;
      }
    }

    const visibilityScore = visibleCount / landmarks.length;
    const zScore = totalConfidence / landmarks.length;

    // Base confidence on visibility and z-position
    let confidence = (visibilityScore * 0.6 + zScore * 0.4);

    // Boost confidence for high-reliability gestures
    if (gesture === 'OPEN_PALM' || gesture === 'FIST' || gesture === 'POINT') {
      confidence = Math.min(1, confidence * 1.1);
    }

    // Reduce confidence for lower-reliability gestures
    if (gesture === 'THUMBS_DOWN' || gesture === 'OK_SIGN' || gesture === 'ROCK_ON') {
      confidence = confidence * 0.9;
    }

    return Math.min(1, Math.max(0, confidence));
  }

  /**
   * Infer which hand is being detected
   * Note: MediaPipe doesn't reliably provide this, so we use heuristics
   */
  private inferHand(landmarks: Landmark[]): 'left' | 'right' | 'unknown' {
    const wrist = landmarks[LANDMARKS.WRIST];
    const indexMCP = landmarks[LANDMARKS.INDEX_MCP];
    const pinkyMCP = landmarks[LANDMARKS.PINKY_MCP];

    if (!wrist || !indexMCP || !pinkyMCP) {
      return 'unknown';
    }

    // Heuristic: For right hand, pinky is on the right side of index (from camera perspective)
    // Note: This is flipped for mirrored camera feeds
    const isPinkyRight = pinkyMCP.x > indexMCP.x;
    
    // Since we typically mirror the camera for selfie view, we invert
    return isPinkyRight ? 'left' : 'right';
  }

  /**
   * Reset internal state (call when hand is lost)
   */
  reset(): void {
    this.gestureStartTime.clear();
    this.lastDetectedGesture = null;
  }

  /**
   * Get descriptive text for a gesture
   */
  static getGestureDescription(gesture: GestureType): string {
    const descriptions: Record<GestureType, string> = {
      'OPEN_PALM': 'Open hand',
      'FIST': 'Closed fist',
      'THUMBS_UP': 'Thumbs up',
      'THUMBS_DOWN': 'Thumbs down',
      'POINT': 'Pointing finger',
      'OK_SIGN': 'OK sign',
      'PEACE_SIGN': 'Peace sign',
      'ROCK_ON': 'Rock on',
      'UNKNOWN': 'Unknown gesture',
    };
    return descriptions[gesture] || 'Unknown';
  }

  /**
   * Get emoji for a gesture
   */
  static getGestureEmoji(gesture: GestureType): string {
    const emojis: Record<GestureType, string> = {
      'OPEN_PALM': '👋',
      'FIST': '✊',
      'THUMBS_UP': '👍',
      'THUMBS_DOWN': '👎',
      'POINT': '👉',
      'OK_SIGN': '👌',
      'PEACE_SIGN': '✌️',
      'ROCK_ON': '🤘',
      'UNKNOWN': '❓',
    };
    return emojis[gesture] || '❓';
  }
}

/**
 * Hook-friendly wrapper for gesture detection with state management
 */
export interface GestureState {
  currentGesture: GestureType | null;
  confidence: number;
  holdProgress: number; // 0-1
  isTriggered: boolean;
}

export function processGesture(
  landmarks: Landmark[] | null,
  recognizer: GestureRecognizer,
  holdDuration: number,
  timestamp: number = Date.now()
): GestureState {
  if (!landmarks) {
    recognizer.reset();
    return {
      currentGesture: null,
      confidence: 0,
      holdProgress: 0,
      isTriggered: false,
    };
  }

  const result = recognizer.detect(landmarks, timestamp);

  if (!result) {
    return {
      currentGesture: null,
      confidence: 0,
      holdProgress: 0,
      isTriggered: false,
    };
  }

  const holdProgress = Math.min(1, result.duration / holdDuration);
  const isTriggered = holdProgress >= 1;

  return {
    currentGesture: result.gesture,
    confidence: result.confidence,
    holdProgress,
    isTriggered,
  };
}

export default GestureRecognizer;
