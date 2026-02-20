import { describe, it, expect } from 'vitest';

// Test the pure calculation logic from usePostureDetection

interface PostureData {
  shoulderAlignment: number;
  headPosition: { x: number; y: number; z: number };
  spineCurvature: number;
  timestamp: number;
}

interface PostureFeedback {
  type: 'good' | 'needsAdjustment' | 'poor' | 'warning' | 'critical';
  message: string;
  suggestions: string[];
}

describe('Posture Detection Calculations', () => {
  
  // Analyze posture from landmarks (extracted logic from usePostureDetection)
  const analyzePosture = (landmarks: { x: number; y: number; z?: number }[]): PostureData => {
    const nose = landmarks[0];
    const leftShoulder = landmarks[11];
    const rightShoulder = landmarks[12];
    const leftHip = landmarks[23];
    const rightHip = landmarks[24];
    
    // Calculate shoulder alignment (should be level)
    const shoulderDiff = Math.abs(leftShoulder.y - rightShoulder.y);
    const shoulderAlignment = Math.max(0, 1 - (shoulderDiff * 5));
    
    // Calculate spine straightness
    const shoulderMidpoint = { x: (leftShoulder.x + rightShoulder.x) / 2, y: (leftShoulder.y + rightShoulder.y) / 2 };
    const hipMidpoint = { x: (leftHip.x + rightHip.x) / 2, y: (leftHip.y + rightHip.y) / 2 };
    const spineDeviation = Math.abs(shoulderMidpoint.x - hipMidpoint.x);
    const spineStraightness = Math.max(0, 1 - (spineDeviation * 3));
    
    return {
      shoulderAlignment,
      headPosition: { x: nose.x, y: nose.y, z: nose.z || 0 },
      spineCurvature: spineStraightness,
      timestamp: Date.now()
    };
  };

  // Generate feedback based on posture data
  const generatePostureFeedback = (posture: PostureData): PostureFeedback => {
    const { shoulderAlignment, spineCurvature } = posture;

    if (shoulderAlignment < 0.6 || spineCurvature < 0.6) {
      return {
        type: 'critical',
        message: 'Please adjust your sitting position',
        suggestions: [
          'Sit up straight with your back against the chair',
          'Keep your shoulders level',
          'Position yourself centered in front of the camera'
        ]
      };
    } else if (shoulderAlignment < 0.8 || spineCurvature < 0.8) {
      return {
        type: 'warning',
        message: 'Good posture! Keep it up',
        suggestions: [
          'Remember to sit up straight',
          'Keep your shoulders relaxed and level'
        ]
      };
    } else {
      return {
        type: 'good',
        message: 'Great posture!',
        suggestions: [
          'Keep maintaining this excellent position',
          "You're learning in a healthy way!"
        ]
      };
    }
  };

  // Mock landmarks for good posture (need 33 landmarks)
  const goodPostureLandmarks: { x: number; y: number; z?: number }[] = [
    { x: 0.5, y: 0.2, z: 0 },    // 0 - nose
    { x: 0.5, y: 0.25, z: 0 },   // 1 - left eye
    { x: 0.5, y: 0.25, z: 0 },   // 2 - right eye
    { x: 0.5, y: 0.28, z: 0 },   // 3 - left ear
    { x: 0.5, y: 0.28, z: 0 },   // 4 - right ear
    { x: 0.5, y: 0.3, z: 0 },    // 5 - left shoulder
    { x: 0.5, y: 0.3, z: 0 },    // 6 - right shoulder
    { x: 0.5, y: 0.3, z: 0 },    // 7 - left elbow
    { x: 0.5, y: 0.3, z: 0 },    // 8 - right elbow
    { x: 0.5, y: 0.3, z: 0 },    // 9 - left wrist
    { x: 0.5, y: 0.3, z: 0 },    // 10 - right wrist
    { x: 0.5, y: 0.3, z: 0 },    // 11 - left shoulder (level)
    { x: 0.5, y: 0.3, z: 0 },    // 12 - right shoulder (level)
    { x: 0.5, y: 0.35, z: 0 },   // 13 - left elbow
    { x: 0.5, y: 0.35, z: 0 },   // 14 - right elbow
    { x: 0.5, y: 0.4, z: 0 },    // 15 - left wrist
    { x: 0.5, y: 0.4, z: 0 },    // 16 - right wrist
    { x: 0.5, y: 0.45, z: 0 },   // 17 - left pinky
    { x: 0.5, y: 0.45, z: 0 },   // 18 - right pinky
    { x: 0.5, y: 0.45, z: 0 },   // 19 - left index
    { x: 0.5, y: 0.45, z: 0 },   // 20 - right index
    { x: 0.5, y: 0.45, z: 0 },   // 21 - left thumb
    { x: 0.5, y: 0.45, z: 0 },   // 22 - right thumb
    { x: 0.5, y: 0.5, z: 0 },    // 23 - left hip
    { x: 0.5, y: 0.5, z: 0 },    // 24 - right hip (aligned)
    { x: 0.5, y: 0.55, z: 0 },   // 25 - left knee
    { x: 0.5, y: 0.55, z: 0 },   // 26 - right knee
    { x: 0.5, y: 0.6, z: 0 },    // 27 - left ankle
    { x: 0.5, y: 0.6, z: 0 },    // 28 - right ankle
    { x: 0.5, y: 0.6, z: 0 },    // 29 - left heel
    { x: 0.5, y: 0.6, z: 0 },    // 30 - right heel
    { x: 0.5, y: 0.6, z: 0 },    // 31 - left foot index
    { x: 0.5, y: 0.6, z: 0 },    // 32 - right foot index
  ];

  // Mock landmarks for poor posture (uneven shoulders)
  const poorPostureLandmarks: { x: number; y: number; z?: number }[] = Array(33).fill(null).map((_, i) => {
    if (i === 0) return { x: 0.5, y: 0.2, z: 0 }; // nose
    if (i === 11) return { x: 0.4, y: 0.35, z: 0 }; // left shoulder (lower)
    if (i === 12) return { x: 0.6, y: 0.25, z: 0 }; // right shoulder (higher)
    if (i === 23) return { x: 0.5, y: 0.5, z: 0 }; // left hip
    if (i === 24) return { x: 0.5, y: 0.5, z: 0 }; // right hip
    return { x: 0.5, y: 0.3, z: 0 };
  });

  it('should calculate good shoulder alignment for level shoulders', () => {
    const posture = analyzePosture(goodPostureLandmarks);
    expect(posture.shoulderAlignment).toBeGreaterThan(0.8);
  });

  it('should calculate poor shoulder alignment for uneven shoulders', () => {
    const posture = analyzePosture(poorPostureLandmarks);
    expect(posture.shoulderAlignment).toBeLessThan(0.6);
  });

  it('should generate good feedback for good posture', () => {
    const posture = analyzePosture(goodPostureLandmarks);
    const feedback = generatePostureFeedback(posture);
    expect(feedback.type).toBe('good');
    expect(feedback.message).toBe('Great posture!');
  });

  it('should generate critical feedback for poor posture', () => {
    const posture = analyzePosture(poorPostureLandmarks);
    const feedback = generatePostureFeedback(posture);
    expect(feedback.type).toBe('critical');
    expect(feedback.suggestions.length).toBeGreaterThan(0);
  });

  it('should calculate good spine curvature for aligned shoulders and hips', () => {
    const posture = analyzePosture(goodPostureLandmarks);
    expect(posture.spineCurvature).toBeGreaterThan(0.8);
  });

  it('should return correct head position', () => {
    const posture = analyzePosture(goodPostureLandmarks);
    expect(posture.headPosition.x).toBe(0.5);
    expect(posture.headPosition.y).toBe(0.2);
  });
});
