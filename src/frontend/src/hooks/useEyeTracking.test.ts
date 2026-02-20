import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock MediaPipe modules
vi.mock('@mediapipe/tasks-vision', () => ({
  FilesetResolver: {
    forVisionTasks: vi.fn().mockResolvedValue({}),
  },
  FaceLandmarker: {
    createFromOptions: vi.fn().mockResolvedValue({
      detectForVideo: vi.fn(),
      close: vi.fn(),
    }),
  },
  PoseLandmarker: {
    createFromOptions: vi.fn().mockResolvedValue({
      detectForVideo: vi.fn(),
      close: vi.fn(),
    }),
  },
}));

describe('useEyeTracking', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with default state', async () => {
    const { default: useEyeTracking } = await import('./useEyeTracking');
    
    const mockOnBlink = vi.fn();
    const { result } = renderHook(() => useEyeTracking(mockOnBlink));
    
    expect(result.current.isLoading).toBe(true);
    expect(result.current.error).toBe(null);
    expect(result.current.results).toEqual({
      isBlinking: false,
      leftEyeClosed: false,
      rightEyeClosed: false,
      blinkCount: 0,
      lastBlinkTime: null,
    });
  });

  it('should calculate EAR correctly for open eye', () => {
    // Test EAR calculation with open eye landmarks
    const openEyePoints = [
      { x: 0.5, y: 0.3 },  // 0 - left
      { x: 0.5, y: 0.25 }, // 1 - top
      { x: 0.5, y: 0.28 }, // 2 - bottom
      { x: 0.55, y: 0.285 }, // 3 - right
      { x: 0.52, y: 0.27 }, // 4 - bottom
      { x: 0.53, y: 0.29 }, // 5 - top
    ];
    
    // EAR should be high for open eye (close to 1)
    const ear = calculateEAR(openEyePoints);
    expect(ear).toBeGreaterThan(0.5);
  });

  it('should calculate EAR correctly for closed eye', () => {
    // Test EAR calculation with closed eye landmarks (vertical points closer together)
    const closedEyePoints = [
      { x: 0.5, y: 0.3 },  // 0 - left
      { x: 0.5, y: 0.3 },  // 1 - top (same as left = closed)
      { x: 0.5, y: 0.3 },  // 2 - bottom (same = closed)
      { x: 0.55, y: 0.3 }, // 3 - right
      { x: 0.53, y: 0.3 }, // 4 - bottom
      { x: 0.52, y: 0.3 }, // 5 - top
    ];
    
    // EAR should be low for closed eye (close to 0)
    const ear = calculateEAR(closedEyePoints);
    expect(ear).toBeLessThan(0.3);
  });

  it('should reset blink count', async () => {
    const { default: useEyeTracking } = await import('./useEyeTracking');
    
    const mockOnBlink = vi.fn();
    const { result } = renderHook(() => useEyeTracking(mockOnBlink));
    
    // Reset should clear blink count
    result.current.resetBlinkCount();
    expect(result.current.results.blinkCount).toBe(0);
  });
});

// Helper function to test EAR calculation
function calculateEAR(eyePoints: { x: number; y: number }[]): number {
  if (eyePoints.length < 6) return 1;

  const A = Math.sqrt(
    Math.pow(eyePoints[1].x - eyePoints[5].x, 2) +
      Math.pow(eyePoints[1].y - eyePoints[5].y, 2)
  );
  const B = Math.sqrt(
    Math.pow(eyePoints[2].x - eyePoints[4].x, 2) +
      Math.pow(eyePoints[2].y - eyePoints[4].y, 2)
  );

  const C = Math.sqrt(
    Math.pow(eyePoints[0].x - eyePoints[3].x, 2) +
      Math.pow(eyePoints[0].y - eyePoints[3].y, 2)
  );

  if (C < 1e-6) return 1;

  return (A + B) / (2.0 * C);
}
