// Global test setup: provide a minimal working mock for @mediapipe/tasks-vision
import { vi } from 'vitest';

// Define missing globals used by runtime configuration
(globalThis as any).__BETA_LOCAL_AI_ENABLED__ = false;

// Mock LLM service to prevent real initialization / config lookups
vi.mock('../../src/services/ai/llm', () => ({
  LLMService: class {
    constructor() {}
  },
  // preserve any other exports as needed
}));

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
