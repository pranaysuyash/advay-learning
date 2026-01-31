import { describe, it, expect, beforeEach } from 'vitest';
import {
  GestureRecognizer,
  GestureType,
  processGesture,
  Landmark,
} from '../gestureRecognizer';

// Helper to create mock landmarks
function createMockLandmark(x: number, y: number, z?: number): Landmark {
  return { x, y, z };
}

/**
 * Calculate Euclidean distance between two landmarks
 */
function distance(a: Landmark, b: Landmark): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Create hand landmarks for testing
 * MediaPipe hand landmarks (21 points):
 * 0: wrist
 * 1-4: thumb (CMC, MCP, IP, TIP)
 * 5-8: index (MCP, PIP, DIP, TIP)
 * 9-12: middle (MCP, PIP, DIP, TIP)
 * 13-16: ring (MCP, PIP, DIP, TIP)
 * 17-20: pinky (MCP, PIP, DIP, TIP)
 */
function createHandLandmarks(
  type: 'OPEN_PALM' | 'FIST' | 'THUMBS_UP' | 'POINT' | 'PEACE_SIGN'
): Landmark[] {
  const landmarks: Landmark[] = new Array(21).fill(null);
  
  // Wrist at center-bottom of hand
  landmarks[0] = createMockLandmark(0.5, 0.7);
  
  // Helper to position fingers based on extension state
  const addFinger = (
    baseIdx: number,
    extended: boolean,
    angle: number // angle in radians from vertical (negative = left, positive = right)
  ) => {
    const wrist = landmarks[0];
    // MCP joints form the knuckle row, slightly above wrist
    const mcpY = wrist.y - 0.12;
    const mcpX = wrist.x + Math.sin(angle) * 0.06;
    
    landmarks[baseIdx] = createMockLandmark(mcpX, mcpY); // MCP
    
    if (extended) {
      // Extended finger - tips extend outward and upward from wrist
      const fingerLength = 0.22;
      const dirX = Math.sin(angle);
      const dirY = -Math.cos(angle); // Upward
      
      // PIP joint (proximal interphalangeal) - 35% of the way
      landmarks[baseIdx + 1] = createMockLandmark(
        mcpX + dirX * fingerLength * 0.35,
        mcpY + dirY * fingerLength * 0.35
      );
      // DIP joint (distal interphalangeal) - 65% of the way
      landmarks[baseIdx + 2] = createMockLandmark(
        mcpX + dirX * fingerLength * 0.65,
        mcpY + dirY * fingerLength * 0.65
      );
      // TIP - 100% of the way
      landmarks[baseIdx + 3] = createMockLandmark(
        mcpX + dirX * fingerLength,
        mcpY + dirY * fingerLength
      );
    } else {
      // Curled finger - tips fold back toward the palm/wrist
      // For a fist, the tip should be closer to wrist than the PIP
      const curlInX = mcpX + Math.sin(angle) * 0.015;
      const curlInY = mcpY + 0.04; // Downward toward wrist
      
      landmarks[baseIdx + 1] = createMockLandmark(
        mcpX + Math.sin(angle) * 0.02,
        mcpY - 0.03 // Slightly up
      ); // PIP
      landmarks[baseIdx + 2] = createMockLandmark(
        curlInX + Math.sin(angle) * 0.005,
        curlInY - 0.02
      ); // DIP
      landmarks[baseIdx + 3] = createMockLandmark(curlInX, curlInY); // TIP - closer to wrist
    }
  };

  // Thumb positioning (special anatomy - extends sideways from wrist)
  const thumbExtended = type === 'OPEN_PALM' || type === 'THUMBS_UP';
  
  // Thumb CMC (carpometacarpal) - at wrist level, to the side
  landmarks[1] = createMockLandmark(0.38, 0.68); // CMC
  landmarks[2] = createMockLandmark(0.32, 0.62); // MCP
  
  if (thumbExtended) {
    if (type === 'THUMBS_UP') {
      // Thumbs up - thumb points upward
      landmarks[3] = createMockLandmark(0.28, 0.45); // IP
      landmarks[4] = createMockLandmark(0.26, 0.30); // TIP - high up
    } else {
      // Open palm - thumb extends outward to side
      landmarks[3] = createMockLandmark(0.22, 0.55); // IP
      landmarks[4] = createMockLandmark(0.15, 0.48); // TIP - far to the left
    }
  } else {
    // Curled thumb - tip close to palm center or below MCP
    landmarks[3] = createMockLandmark(0.30, 0.58); // IP
    landmarks[4] = createMockLandmark(0.35, 0.60); // TIP - curled inward
  }

  // Define finger extension for each gesture type
  const isExtended = {
    index: type !== 'FIST' && type !== 'THUMBS_UP',
    middle: type !== 'FIST' && type !== 'POINT' && type !== 'THUMBS_UP',
    ring: type === 'OPEN_PALM',
    pinky: type === 'OPEN_PALM', // Note: PEACE_SIGN only has index+middle, pinky is curled
  };

  // Index finger (-0.25 rad ~ -14 degrees, slightly left)
  addFinger(5, isExtended.index, -0.25);

  // Middle finger (0 rad = straight up)
  addFinger(9, isExtended.middle, 0);

  // Ring finger (0.18 rad ~ 10 degrees right)
  addFinger(13, isExtended.ring, 0.18);

  // Pinky (0.35 rad ~ 20 degrees right)
  addFinger(17, isExtended.pinky, 0.35);

  return landmarks;
}

describe('GestureRecognizer', () => {
  let recognizer: GestureRecognizer;

  beforeEach(() => {
    recognizer = new GestureRecognizer();
  });

  describe('detect', () => {
    it('returns null for invalid landmarks', () => {
      expect(recognizer.detect([])).toBeNull();
      expect(recognizer.detect(null as any)).toBeNull();
      expect(recognizer.detect([createMockLandmark(0, 0)])).toBeNull();
    });

    it('detects OPEN_PALM gesture', () => {
      const landmarks = createHandLandmarks('OPEN_PALM');
      const result = recognizer.detect(landmarks);

      expect(result).not.toBeNull();
      expect(result!.gesture).toBe('OPEN_PALM');
      expect(result!.confidence).toBeGreaterThan(0.8);
    });

    it('detects FIST gesture', () => {
      const landmarks = createHandLandmarks('FIST');
      const result = recognizer.detect(landmarks);

      expect(result).not.toBeNull();
      expect(result!.gesture).toBe('FIST');
      expect(result!.confidence).toBeGreaterThan(0.8);
    });

    it('detects POINT gesture', () => {
      const landmarks = createHandLandmarks('POINT');
      const result = recognizer.detect(landmarks);

      expect(result).not.toBeNull();
      expect(result!.gesture).toBe('POINT');
    });

    it('detects THUMBS_UP gesture', () => {
      const landmarks = createHandLandmarks('THUMBS_UP');
      const result = recognizer.detect(landmarks);

      expect(result).not.toBeNull();
      expect(result!.gesture).toBe('THUMBS_UP');
    });

    it('detects PEACE_SIGN gesture', () => {
      const landmarks = createHandLandmarks('PEACE_SIGN');
      const result = recognizer.detect(landmarks);

      expect(result).not.toBeNull();
      expect(result!.gesture).toBe('PEACE_SIGN');
    });

    it('returns UNKNOWN for ambiguous gestures', () => {
      // Create ambiguous landmarks (middle finger only extended)
      const landmarks = createHandLandmarks('FIST');
      // Modify to make it ambiguous - extend middle finger
      landmarks[10] = createMockLandmark(0.5, 0.45); // Middle PIP
      landmarks[11] = createMockLandmark(0.5, 0.35); // Middle DIP
      landmarks[12] = createMockLandmark(0.5, 0.25); // Middle tip extended
      
      const result = recognizer.detect(landmarks);
      // Should either detect as UNKNOWN or return null
      if (result) {
        expect(result.gesture).toBe('UNKNOWN');
      }
    });

    it('tracks gesture duration', () => {
      const landmarks = createHandLandmarks('OPEN_PALM');
      const startTime = 1000;
      
      const result1 = recognizer.detect(landmarks, startTime);
      expect(result1!.duration).toBe(0);
      
      const result2 = recognizer.detect(landmarks, startTime + 500);
      expect(result2!.duration).toBe(500);
      
      const result3 = recognizer.detect(landmarks, startTime + 1500);
      expect(result3!.duration).toBe(1500);
    });

    it('resets duration when gesture changes', () => {
      const openLandmarks = createHandLandmarks('OPEN_PALM');
      const fistLandmarks = createHandLandmarks('FIST');
      
      recognizer.detect(openLandmarks, 1000);
      const result2 = recognizer.detect(fistLandmarks, 1500);
      
      expect(result2!.gesture).toBe('FIST');
      expect(result2!.duration).toBe(0); // Reset because gesture changed
    });

    it('returns null when confidence is too low', () => {
      const landmarks = createHandLandmarks('OPEN_PALM');
      // Corrupt some landmarks to lower confidence
      landmarks[8] = createMockLandmark(NaN, NaN);
      
      const lowConfidenceRecognizer = new GestureRecognizer({ minConfidence: 0.95 });
      const result = lowConfidenceRecognizer.detect(landmarks);
      
      // Should return null due to low confidence
      expect(result).toBeNull();
    });
  });

  describe('reset', () => {
    it('clears gesture tracking state', () => {
      const landmarks = createHandLandmarks('OPEN_PALM');
      
      recognizer.detect(landmarks, 1000);
      recognizer.reset();
      const result = recognizer.detect(landmarks, 2000);
      
      expect(result!.duration).toBe(0);
    });
  });

  describe('custom configuration', () => {
    it('accepts custom minConfidence', () => {
      const customRecognizer = new GestureRecognizer({ minConfidence: 0.5 });
      const landmarks = createHandLandmarks('OPEN_PALM');
      
      const result = customRecognizer.detect(landmarks);
      expect(result).not.toBeNull();
    });

    it('accepts custom extension thresholds', () => {
      const customRecognizer = new GestureRecognizer({
        extensionThreshold: 0.01,
        thumbExtensionThreshold: 0.02,
      });
      const landmarks = createHandLandmarks('OPEN_PALM');
      
      const result = customRecognizer.detect(landmarks);
      expect(result!.gesture).toBe('OPEN_PALM');
    });
  });

  describe('static helper methods', () => {
    it('getGestureDescription returns correct descriptions', () => {
      expect(GestureRecognizer.getGestureDescription('OPEN_PALM')).toBe('Open hand');
      expect(GestureRecognizer.getGestureDescription('FIST')).toBe('Closed fist');
      expect(GestureRecognizer.getGestureDescription('THUMBS_UP')).toBe('Thumbs up');
      expect(GestureRecognizer.getGestureDescription('UNKNOWN')).toBe('Unknown gesture');
    });

    it('getGestureEmoji returns correct emojis', () => {
      expect(GestureRecognizer.getGestureEmoji('OPEN_PALM')).toBe('👋');
      expect(GestureRecognizer.getGestureEmoji('FIST')).toBe('✊');
      expect(GestureRecognizer.getGestureEmoji('THUMBS_UP')).toBe('👍');
      expect(GestureRecognizer.getGestureEmoji('UNKNOWN')).toBe('❓');
    });
  });

  describe('hand inference', () => {
    it('attempts to infer hand type', () => {
      const landmarks = createHandLandmarks('OPEN_PALM');
      const result = recognizer.detect(landmarks);
      
      // Should return one of the valid values
      expect(['left', 'right', 'unknown']).toContain(result!.hand);
    });
  });
});

describe('processGesture', () => {
  let recognizer: GestureRecognizer;

  beforeEach(() => {
    recognizer = new GestureRecognizer();
  });

  it('returns empty state for null landmarks', () => {
    const state = processGesture(null, recognizer, 1000);
    
    expect(state.currentGesture).toBeNull();
    expect(state.confidence).toBe(0);
    expect(state.holdProgress).toBe(0);
    expect(state.isTriggered).toBe(false);
  });

  it('calculates hold progress correctly', () => {
    const landmarks = createHandLandmarks('OPEN_PALM');
    const holdDuration = 1000;
    const startTime = Date.now();
    
    const state1 = processGesture(landmarks, recognizer, holdDuration, startTime);
    expect(state1.holdProgress).toBe(0);
    expect(state1.isTriggered).toBe(false);
    
    const state2 = processGesture(landmarks, recognizer, holdDuration, startTime + 500);
    expect(state2.holdProgress).toBeGreaterThan(0.4);
    expect(state2.holdProgress).toBeLessThan(0.6);
    expect(state2.isTriggered).toBe(false);
    
    const state3 = processGesture(landmarks, recognizer, holdDuration, startTime + 1000);
    expect(state3.holdProgress).toBe(1);
    expect(state3.isTriggered).toBe(true);
  });

  it('resets recognizer when landmarks are null', () => {
    const landmarks = createHandLandmarks('OPEN_PALM');
    
    processGesture(landmarks, recognizer, 1000, 0);
    processGesture(null, recognizer, 1000, 500);
    const state = processGesture(landmarks, recognizer, 1000, 600);
    
    // holdProgress should have reset
    expect(state.holdProgress).toBe(0);
  });

  it('includes confidence in state', () => {
    const landmarks = createHandLandmarks('OPEN_PALM');
    const state = processGesture(landmarks, recognizer, 1000);
    
    expect(state.confidence).toBeGreaterThan(0.8);
  });
});

describe('Real-world gesture variations', () => {
  let recognizer: GestureRecognizer;

  beforeEach(() => {
    recognizer = new GestureRecognizer();
  });

  it('handles valid open palm consistently', () => {
    const landmarks = createHandLandmarks('OPEN_PALM');
    
    const result = recognizer.detect(landmarks);
    expect(result).not.toBeNull();
    if (result) {
      expect(result.gesture).toBe('OPEN_PALM');
      expect(result.confidence).toBeGreaterThan(0.8);
    }
  });

  it('handles valid fist consistently', () => {
    const landmarks = createHandLandmarks('FIST');
    
    const result = recognizer.detect(landmarks);
    expect(result).not.toBeNull();
    if (result) {
      expect(result.gesture).toBe('FIST');
      expect(result.confidence).toBeGreaterThan(0.8);
    }
  });

  it('handles valid point consistently', () => {
    const landmarks = createHandLandmarks('POINT');
    
    const result = recognizer.detect(landmarks);
    expect(result).not.toBeNull();
    if (result) {
      expect(result.gesture).toBe('POINT');
      expect(result.confidence).toBeGreaterThan(0.8);
    }
  });
});
