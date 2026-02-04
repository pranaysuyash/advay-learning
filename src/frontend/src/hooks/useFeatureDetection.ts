import { useEffect, useState } from 'react';
import {
  detectFeatures,
  FeatureDetectionResult,
  hasBasicCameraSupport,
  hasFullEnhancementSupport,
} from '../utils/featureDetection';

/**
 * Hook for detecting browser feature support
 * Performs feature detection on mount and provides results + status
 */
export function useFeatureDetection() {
  const [features, setFeatures] = useState<FeatureDetectionResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const detectAllFeatures = async () => {
      try {
        const result = await detectFeatures();
        if (isMounted) {
          setFeatures(result);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          const errorMessage = err instanceof Error ? err.message : 'Unknown error';
          setError(`Failed to detect features: ${errorMessage}`);
          // Still set a basic result even on error
          setFeatures({
            cameraSupported: false,
            mediaPipeSupported: false,
            webGLSupported: false,
            hasCamera: false,
            isSecureContext: false,
            modernCameraAPI: false,
            enhancementLevel: 'none',
          });
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    detectAllFeatures();

    return () => {
      isMounted = false;
    };
  }, []);

  return {
    features,
    isLoading,
    error,
    hasBasicCamera: features ? hasBasicCameraSupport() : false,
    hasFullEnhancement: features ? hasFullEnhancementSupport() : false,
  };
}

/**
 * Synchronous check for basic camera support
 * Useful for quick decisions without waiting for full detection
 */
export function useQuickCameraCheck(): boolean {
  return hasBasicCameraSupport();
}
