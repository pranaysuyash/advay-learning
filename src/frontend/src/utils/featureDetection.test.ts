import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  detectCameraSupport,
  detectMediaPipeSupport,
  detectWebGLSupport,
  detectCameraHardware,
  detectSecureContext,
  detectModernCameraAPI,
  calculateEnhancementLevel,
  detectFeatures,
  hasBasicCameraSupport,
  hasFullEnhancementSupport,
  type FeatureDetectionResult,
} from './featureDetection';

// Mock the global objects
const mockMediaDevices = {
  getUserMedia: vi.fn(),
  enumerateDevices: vi.fn(),
};

const mockNavigator = {
  mediaDevices: mockMediaDevices,
};

const mockWindow = {
  isSecureContext: true,
  Hands: vi.fn(),
};

// Store original values for restoration
let originalNavigator: any;
let originalIsSecureContext: boolean;
let originalHands: any;
let originalGetContext: any;

Object.defineProperty(window, 'navigator', {
  value: mockNavigator,
  writable: true,
});

Object.defineProperty(window, 'isSecureContext', {
  value: true,
  writable: true,
});

describe('FeatureDetection', () => {
  beforeEach(() => {
    // Save original values
    originalNavigator = (window as any).navigator;
    originalIsSecureContext = (window as any).isSecureContext;
    originalHands = (window as any).Hands;
    originalGetContext = HTMLCanvasElement.prototype.getContext;

    // Reset mocks
    vi.clearAllMocks();

    // Set up default secure context
    (window as any).isSecureContext = true;

    // Reset navigator mock
    Object.defineProperty(window, 'navigator', {
      value: mockNavigator,
      writable: true,
    });

    // Mock successful camera API
    mockMediaDevices.getUserMedia = vi.fn().mockResolvedValue({});
    mockMediaDevices.enumerateDevices = vi.fn().mockResolvedValue([
      { kind: 'videoinput', deviceId: '1' },
    ]);

    // Mock MediaPipe availability
    (window as any).Hands = vi.fn();

    // Mock WebGL support
    HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue({});
  });

  afterEach(() => {
    // Restore original values
    (window as any).navigator = originalNavigator;
    (window as any).isSecureContext = originalIsSecureContext;
    (window as any).Hands = originalHands;
    HTMLCanvasElement.prototype.getContext = originalGetContext;

    // Clear mocks
    vi.clearAllMocks();
  });

  describe('detectCameraSupport', () => {
    it('should return true when camera APIs are available', () => {
      expect(detectCameraSupport()).toBe(true);
    });

    it('should return false when mediaDevices is not available', () => {
      const originalMediaDevices = (window as any).navigator.mediaDevices;
      (window as any).navigator.mediaDevices = undefined;
      expect(detectCameraSupport()).toBe(false);
      (window as any).navigator.mediaDevices = originalMediaDevices;
    });

    it('should return false when getUserMedia is not available', () => {
      const originalGetUserMedia = mockMediaDevices.getUserMedia;
      mockMediaDevices.getUserMedia = undefined as any;
      expect(detectCameraSupport()).toBe(false);
      mockMediaDevices.getUserMedia = originalGetUserMedia;
    });

    it('should return false when enumerateDevices is not available', () => {
      const originalEnumerateDevices = mockMediaDevices.enumerateDevices;
      mockMediaDevices.enumerateDevices = undefined as any;
      expect(detectCameraSupport()).toBe(false);
      mockMediaDevices.enumerateDevices = originalEnumerateDevices;
    });
  });

  describe('detectMediaPipeSupport', () => {
    it('should return true when MediaPipe Hands is available', () => {
      expect(detectMediaPipeSupport()).toBe(true);
    });

    it('should return false when MediaPipe Hands is not available', () => {
      delete (window as any).Hands;
      expect(detectMediaPipeSupport()).toBe(false);
    });

    it('should return false when window is undefined (SSR)', () => {
      const originalWindow = global.window;
      delete (global as any).window;
      expect(detectMediaPipeSupport()).toBe(false);
      global.window = originalWindow;
    });
  });

  describe('detectWebGLSupport', () => {
    it('should return true when WebGL is available', () => {
      expect(detectWebGLSupport()).toBe(true);
    });

    it('should return false when WebGL context creation fails', () => {
      HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue(null);
      expect(detectWebGLSupport()).toBe(false);
    });

    it('should return false when window is undefined (SSR)', () => {
      const originalWindow = global.window;
      delete (global as any).window;
      expect(detectWebGLSupport()).toBe(false);
      global.window = originalWindow;
    });
  });

  describe('detectCameraHardware', () => {
    it('should return true when camera devices are available', async () => {
      const result = await detectCameraHardware();
      expect(result).toBe(true);
    });

    it('should return false when no camera devices are found', async () => {
      const originalEnumerateDevices = mockMediaDevices.enumerateDevices;
      mockMediaDevices.enumerateDevices = vi.fn().mockResolvedValue([
        { kind: 'audioinput', deviceId: '1' },
      ]);
      const result = await detectCameraHardware();
      expect(result).toBe(false);
      mockMediaDevices.enumerateDevices = originalEnumerateDevices;
    });

    it('should return false when camera support is not available', async () => {
      const originalEnumerateDevices = mockMediaDevices.enumerateDevices;
      mockMediaDevices.enumerateDevices = undefined as any;
      const result = await detectCameraHardware();
      expect(result).toBe(false);
      mockMediaDevices.enumerateDevices = originalEnumerateDevices;
    });

    it('should return false when enumerateDevices throws an error', async () => {
      const originalEnumerateDevices = mockMediaDevices.enumerateDevices;
      mockMediaDevices.enumerateDevices = vi.fn().mockRejectedValue(new Error('Permission denied'));
      const result = await detectCameraHardware();
      expect(result).toBe(false);
      mockMediaDevices.enumerateDevices = originalEnumerateDevices;
    });
  });

  describe('detectSecureContext', () => {
    it('should return true when in secure context', () => {
      expect(detectSecureContext()).toBe(true);
    });

    it('should return false when not in secure context', () => {
      Object.defineProperty(window, 'isSecureContext', { value: false });
      expect(detectSecureContext()).toBe(false);
    });

    it('should return false when window is undefined (SSR)', () => {
      const originalWindow = global.window;
      delete (global as any).window;
      expect(detectSecureContext()).toBe(false);
      global.window = originalWindow;
    });
  });

  describe('detectModernCameraAPI', () => {
    it('should return true when modern camera API is available', () => {
      expect(detectModernCameraAPI()).toBe(true);
    });

    it('should return false when getUserMedia is not a function', () => {
      const originalGetUserMedia = mockMediaDevices.getUserMedia;
      mockMediaDevices.getUserMedia = 'not a function' as any;
      expect(detectModernCameraAPI()).toBe(false);
      mockMediaDevices.getUserMedia = originalGetUserMedia;
    });

    it('should return false when mediaDevices is not available', () => {
      const originalMediaDevices = (window as any).navigator.mediaDevices;
      (window as any).navigator.mediaDevices = undefined;
      expect(detectModernCameraAPI()).toBe(false);
      (window as any).navigator.mediaDevices = originalMediaDevices;
    });
  });

  describe('calculateEnhancementLevel', () => {
    it('should return "none" when camera is not supported', () => {
      const result: FeatureDetectionResult = {
        cameraSupported: false,
        mediaPipeSupported: true,
        webGLSupported: true,
        hasCamera: true,
        isSecureContext: true,
        modernCameraAPI: true,
        enhancementLevel: 'none',
      };
      expect(calculateEnhancementLevel(result)).toBe('none');
    });

    it('should return "none" when not in secure context', () => {
      const result: FeatureDetectionResult = {
        cameraSupported: true,
        mediaPipeSupported: true,
        webGLSupported: true,
        hasCamera: true,
        isSecureContext: false,
        modernCameraAPI: true,
        enhancementLevel: 'none',
      };
      expect(calculateEnhancementLevel(result)).toBe('none');
    });

    it('should return "full" when all features are supported', () => {
      const result: FeatureDetectionResult = {
        cameraSupported: true,
        mediaPipeSupported: true,
        webGLSupported: true,
        hasCamera: true,
        isSecureContext: true,
        modernCameraAPI: true,
        enhancementLevel: 'none',
      };
      expect(calculateEnhancementLevel(result)).toBe('full');
    });

    it('should return "basic" when camera is available but MediaPipe is not', () => {
      const result: FeatureDetectionResult = {
        cameraSupported: true,
        mediaPipeSupported: false,
        webGLSupported: true,
        hasCamera: true,
        isSecureContext: true,
        modernCameraAPI: true,
        enhancementLevel: 'none',
      };
      expect(calculateEnhancementLevel(result)).toBe('basic');
    });
  });

  describe('detectFeatures', () => {
    it('should return comprehensive feature detection result', async () => {
      const result = await detectFeatures();

      expect(result).toHaveProperty('cameraSupported', true);
      expect(result).toHaveProperty('mediaPipeSupported', true);
      expect(result).toHaveProperty('webGLSupported', true);
      expect(result).toHaveProperty('hasCamera', true);
      expect(result).toHaveProperty('isSecureContext', true);
      expect(result).toHaveProperty('modernCameraAPI', true);
      expect(result).toHaveProperty('enhancementLevel');
      expect(['none', 'basic', 'full']).toContain(result.enhancementLevel);
    });

    it('should handle detection failures gracefully', async () => {
      // Save original values
      const originalEnumerateDevices = mockMediaDevices.enumerateDevices;
      const originalIsSecureContext = (window as any).isSecureContext;
      const originalHands = (window as any).Hands;
      const originalGetContext = HTMLCanvasElement.prototype.getContext;

      // Simulate all features unavailable
      mockMediaDevices.enumerateDevices = vi.fn().mockRejectedValue(new Error());
      delete (window as any).Hands;
      HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue(null);
      (window as any).isSecureContext = false;

      const result = await detectFeatures();

      expect(result.cameraSupported).toBe(true); // Still true due to mock setup
      expect(result.mediaPipeSupported).toBe(false);
      expect(result.webGLSupported).toBe(false);
      expect(result.hasCamera).toBe(false);
      expect(result.isSecureContext).toBe(false);
      expect(result.enhancementLevel).toBe('none');

      // Restore original values
      mockMediaDevices.enumerateDevices = originalEnumerateDevices;
      (window as any).isSecureContext = originalIsSecureContext;
      (window as any).Hands = originalHands;
      HTMLCanvasElement.prototype.getContext = originalGetContext;
    });
  });

  describe('hasBasicCameraSupport', () => {
    it('should return true when basic camera support is available', () => {
      expect(hasBasicCameraSupport()).toBe(true);
    });

    it('should return false when not in secure context', () => {
      const originalIsSecureContext = (window as any).isSecureContext;
      Object.defineProperty(window, 'isSecureContext', { value: false });
      expect(hasBasicCameraSupport()).toBe(false);
      (window as any).isSecureContext = originalIsSecureContext;
    });

    it('should return false when camera API is not supported', () => {
      const originalMediaDevices = (window as any).navigator.mediaDevices;
      (window as any).navigator.mediaDevices = undefined;
      expect(hasBasicCameraSupport()).toBe(false);
      (window as any).navigator.mediaDevices = originalMediaDevices;
    });
  });

  describe('hasFullEnhancementSupport', () => {
    it('should return true when all enhancement features are supported', () => {
      expect(hasFullEnhancementSupport()).toBe(true);
    });

    it('should return false when MediaPipe is not available', () => {
      const originalHands = (window as any).Hands;
      delete (window as any).Hands;
      expect(hasFullEnhancementSupport()).toBe(false);
      (window as any).Hands = originalHands;
    });

    it('should return false when WebGL is not supported', () => {
      const originalGetContext = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue(null);
      expect(hasFullEnhancementSupport()).toBe(false);
      HTMLCanvasElement.prototype.getContext = originalGetContext;
    });

    it('should return false when not in secure context', () => {
      const originalIsSecureContext = (window as any).isSecureContext;
      Object.defineProperty(window, 'isSecureContext', { value: false });
      expect(hasFullEnhancementSupport()).toBe(false);
      (window as any).isSecureContext = originalIsSecureContext;
    });
  });
});