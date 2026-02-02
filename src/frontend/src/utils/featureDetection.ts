/**
 * Feature Detection Utility
 *
 * Provides comprehensive detection for browser capabilities and API support,
 * enabling progressive enhancement for camera and MediaPipe features.
 *
 * Used by demo flow to determine available functionality and provide appropriate fallbacks.
 */

export interface FeatureDetectionResult {
  /** Camera API is supported and available */
  cameraSupported: boolean;
  /** MediaPipe library can be loaded */
  mediaPipeSupported: boolean;
  /** WebGL is available for MediaPipe processing */
  webGLSupported: boolean;
  /** Device has camera hardware */
  hasCamera: boolean;
  /** HTTPS is required for camera access */
  isSecureContext: boolean;
  /** Browser supports modern camera APIs */
  modernCameraAPI: boolean;
  /** Overall progressive enhancement level */
  enhancementLevel: 'none' | 'basic' | 'full';
}

/**
 * Detects camera API support and availability
 */
export function detectCameraSupport(): boolean {
  return !!(
    navigator.mediaDevices &&
    (navigator.mediaDevices as any).getUserMedia &&
    navigator.mediaDevices.enumerateDevices
  );
}

/**
 * Detects MediaPipe library availability
 * Note: This checks for the global MediaPipe object after loading
 */
export function detectMediaPipeSupport(): boolean {
  return typeof window !== 'undefined' && !!(window as any).Hands;
}

/**
 * Detects WebGL support required for MediaPipe processing
 */
export function detectWebGLSupport(): boolean {
  if (typeof window === 'undefined') return false;

  try {
    const canvas = document.createElement('canvas');
    const gl =
      canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    return !!gl;
  } catch {
    return false;
  }
}

/**
 * Checks if the device has camera hardware
 */
export async function detectCameraHardware(): Promise<boolean> {
  if (!detectCameraSupport()) return false;

  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices.some((device) => device.kind === 'videoinput');
  } catch {
    return false;
  }
}

/**
 * Checks if we're in a secure context (required for camera access)
 */
export function detectSecureContext(): boolean {
  return typeof window !== 'undefined' && window.isSecureContext;
}

/**
 * Detects support for modern camera APIs (getUserMedia with constraints)
 */
export function detectModernCameraAPI(): boolean {
  return !!(
    navigator.mediaDevices &&
    navigator.mediaDevices.getUserMedia &&
    typeof navigator.mediaDevices.getUserMedia === 'function'
  );
}

/**
 * Determines the progressive enhancement level based on detected features
 */
export function calculateEnhancementLevel(
  result: FeatureDetectionResult,
): 'none' | 'basic' | 'full' {
  if (!result.cameraSupported || !result.isSecureContext) {
    return 'none';
  }

  if (result.mediaPipeSupported && result.webGLSupported && result.hasCamera) {
    return 'full';
  }

  if (result.modernCameraAPI && result.hasCamera) {
    return 'basic';
  }

  return 'none';
}

/**
 * Comprehensive feature detection for progressive enhancement
 */
export async function detectFeatures(): Promise<FeatureDetectionResult> {
  const [cameraSupported, mediaPipeSupported, webGLSupported, hasCamera] =
    await Promise.all([
      Promise.resolve(detectCameraSupport()),
      Promise.resolve(detectMediaPipeSupport()),
      Promise.resolve(detectWebGLSupport()),
      detectCameraHardware(),
    ]);

  const isSecureContext = detectSecureContext();
  const modernCameraAPI = detectModernCameraAPI();

  const result: FeatureDetectionResult = {
    cameraSupported,
    mediaPipeSupported,
    webGLSupported,
    hasCamera,
    isSecureContext,
    modernCameraAPI,
    enhancementLevel: 'none', // Will be calculated below
  };

  result.enhancementLevel = calculateEnhancementLevel(result);

  return result;
}

/**
 * Quick synchronous check for basic camera support
 * Useful for initial UI decisions without async operations
 */
export function hasBasicCameraSupport(): boolean {
  return detectCameraSupport() && detectSecureContext();
}

/**
 * Checks if full MediaPipe functionality is available
 */
export function hasFullEnhancementSupport(): boolean {
  return (
    detectCameraSupport() &&
    detectMediaPipeSupport() &&
    detectWebGLSupport() &&
    detectSecureContext()
  );
}
