import { describe, it, expect } from 'vitest';
import { GestureRecognizer, Landmark } from '../gestureRecognizer';

function createMockLandmark(x: number, y: number, z?: number): Landmark {
  return { x, y, z };
}

function createHandLandmarks(type: 'OPEN_PALM' | 'FIST' | 'THUMBS_UP' | 'POINT' | 'PEACE_SIGN'): Landmark[] {
  const landmarks: Landmark[] = new Array(21).fill(null);
  
  landmarks[0] = createMockLandmark(0.5, 0.5); // Wrist
  
  const addFinger = (baseIdx: number, extended: boolean, angle: number) => {
    const wrist = landmarks[0];
    const baseX = wrist.x + Math.sin(angle) * 0.08;
    const baseY = wrist.y - 0.05;
    
    landmarks[baseIdx] = createMockLandmark(baseX, baseY); // MCP
    
    if (extended) {
      const length = 0.18;
      landmarks[baseIdx + 1] = createMockLandmark(baseX + Math.sin(angle) * length * 0.3, baseY - Math.cos(angle) * length * 0.3);
      landmarks[baseIdx + 2] = createMockLandmark(baseX + Math.sin(angle) * length * 0.6, baseY - Math.cos(angle) * length * 0.6);
      landmarks[baseIdx + 3] = createMockLandmark(baseX + Math.sin(angle) * length, baseY - Math.cos(angle) * length);
    } else {
      const curlX = baseX + Math.sin(angle) * 0.02;
      const curlY = baseY + 0.02;
      landmarks[baseIdx + 1] = createMockLandmark(baseX + Math.sin(angle) * 0.03, baseY - 0.02);
      landmarks[baseIdx + 2] = createMockLandmark(curlX + Math.sin(angle) * 0.01, curlY - 0.01);
      landmarks[baseIdx + 3] = createMockLandmark(curlX, curlY);
    }
  };

  // Thumb
  const thumbExtended = type === 'OPEN_PALM' || type === 'THUMBS_UP';
  const thumbTipY = thumbExtended ? 0.38 : 0.48;
  
  landmarks[1] = createMockLandmark(0.42, 0.50); // CMC
  landmarks[2] = createMockLandmark(0.38, 0.48); // MCP
  landmarks[3] = createMockLandmark(0.35, thumbTipY - 0.04); // IP
  landmarks[4] = createMockLandmark(0.32, thumbTipY); // TIP

  addFinger(5, type !== 'FIST', -0.3);        // Index
  addFinger(9, type !== 'FIST' && type !== 'POINT', 0);  // Middle
  addFinger(13, type === 'OPEN_PALM', 0.15);  // Ring
  addFinger(17, type === 'OPEN_PALM' || type === 'PEACE_SIGN', 0.3); // Pinky

  return landmarks;
}

describe('Debug Gesture Detection', () => {
  it('debug OPEN_PALM', () => {
    const recognizer = new GestureRecognizer({ minConfidence: 0.5 });
    const landmarks = createHandLandmarks('OPEN_PALM');
    
    // Calculate distances manually
    const wrist = landmarks[0];
    const thumbTip = landmarks[4];
    const thumbIP = landmarks[3];
    const thumbMCP = landmarks[2];
    const indexTip = landmarks[8];
    const indexPIP = landmarks[6];
    
    const dist = (a: Landmark, b: Landmark) => Math.sqrt((a.x-b.x)**2 + (a.y-b.y)**2);
    
    console.log('Wrist:', wrist);
    console.log('Thumb TIP:', thumbTip, 'MCP:', thumbMCP);
    console.log('Index TIP:', indexTip, 'PIP:', indexPIP);
    console.log('Thumb tip-MCP dist:', dist(thumbTip, thumbMCP));
    console.log('Thumb IP-MCP dist:', dist(thumbIP, thumbMCP));
    console.log('Index tip-wrist dist:', dist(indexTip, wrist));
    console.log('Index PIP-wrist dist:', dist(indexPIP, wrist));
    
    const result = recognizer.detect(landmarks);
    console.log('Result:', result);
    
    expect(result).not.toBeNull();
  });
});
