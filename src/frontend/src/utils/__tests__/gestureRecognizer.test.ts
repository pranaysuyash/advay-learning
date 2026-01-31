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
  
  // Wrist at center
  landmarks[0] = createMockLandmark(0.5, 0.5);
  
  // Helper to position fingers
  const addFinger = (
    baseIdx: number,
    extended: boolean,
    angle: number // angle in radians from vertical
  ) => {
    const wrist = landmarks[0];
    const baseX = wrist.x + Math.sin(angle) * 0.08;
    const baseY = wrist.y - 0.05; // MCP joints are slightly above wrist
    
    landmarks[baseIdx] = createMockLandmark(baseX, baseY); // MCP
    
    if (extended) {
      // Extended finger - tips far from wrist
      const length = 0.18;
      landmarks[baseIdx + 1] = createMockLandmark(
        baseX + Math.sin(angle) * length * 0.3,
        baseY - Math.cos(angle) * length * 0.3
      ); // PIP
      landmarks[baseIdx + 2] = createMockLandmark(
        baseX + Math.sin(angle) * length * 0.6,
        baseY - Math.cos(angle) * length * 0.6
      ); // DIP
      landmarks[baseIdx + 3] = createMockLandmark(
        baseX + Math.sin(angle) * length,
        baseY - Math.cos(angle) * length
      ); // TIP
    } else {
      // Curled finger - tips close to MCP (closer than PIP to wrist)
      const curlX = baseX + Math.sin(angle) * 0.02;
      const curlY = baseY + 0.02; // TIP below MCP
      
      landmarks[baseIdx + 1] = createMockLandmark(
        baseX + Math.sin(angle) * 0.03,
        baseY - 0.02
      ); // PIP - slightly extended
      landmarks[baseIdx + 2] = createMockLandmark(
        curlX + Math.sin(angle) * 0.01,
        curlY - 0.01
      ); // DIP
      landmarks[baseIdx + 3] = createMockLandmark(curlX, curlY); // TIP
    }
  };

  // Thumb (different positioning, offset to side)
  const thumbExtended = type === 'OPEN_PALM' || type === 'THUMBS_UP';
  const thumbTipY = thumbExtended ? 0.38 : 0.48;
  
  landmarks[1] = createMockLandmark(0.42, 0.50); // CMC
  landmarks[2] = createMockLandmark(0.38, 0.48); // MCP
  landmarks[3] = createMockLandmark(0.35, thumbTipY - 0.04); // IP
  landmarks[4] = createMockLandmark(0.32, thumbTipY); // TIP

  // Index finger (-0.3 rad ~ -17 degrees)
  addFinger(5, type !== 'FIST', -0.3);

  // Middle finger (0 rad = straight up)
  addFinger(9, type !== 'FIST' && type !== 'POINT', 0);

  // Ring finger (0.15 rad ~ 8.5 degrees)
  addFinger(13, type === 'OPEN_PALM', 0.15);

  // Pinky (0.3 rad ~ 17 degrees)
  addFinger(17, type === 'OPEN_PALM' || type === 'PEACE_SIGN', 0.3);

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
      // Modify to make it ambiguous
      landmarks[12] = createMockLandmark(0.5, 0.3); // Middle tip extended
      
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
