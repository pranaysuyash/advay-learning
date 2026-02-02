// Global test setup: provide a minimal working mock for @mediapipe/tasks-vision
import { vi } from 'vitest';

// Provide a lightweight FilesetResolver + landmarker implementations
vi.mock('@mediapipe/tasks-vision', () => {
  const createStubLandmarker = (resultKey: string) => ({
    // minimal methods used by hooks
    detectForVideo: () => ({ [resultKey]: [] }),
    close: () => {},
  });

  return {
    FilesetResolver: {
      forVisionTasks: async () => ({}),
    },
    PoseLandmarker: {
      createFromOptions: async () => createStubLandmarker('landmarks'),
    },
    FaceLandmarker: {
      createFromOptions: async () => createStubLandmarker('faceLandmarks'),
    },
    HandLandmarker: {
      createFromOptions: async () => createStubLandmarker('handLandmarks'),
    },
  };
});
