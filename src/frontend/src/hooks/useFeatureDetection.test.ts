import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useFeatureDetection, useQuickCameraCheck } from './useFeatureDetection';
import * as featureDetection from '../utils/featureDetection';

// Mock the featureDetection module
vi.mock('../utils/featureDetection', () => ({
  detectFeatures: vi.fn(),
  hasBasicCameraSupport: vi.fn(),
  hasFullEnhancementSupport: vi.fn(),
}));

describe('useFeatureDetection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with loading state', () => {
    vi.mocked(featureDetection.detectFeatures).mockResolvedValue({
      cameraSupported: true,
      mediaPipeSupported: true,
      webGLSupported: true,
      hasCamera: true,
      isSecureContext: true,
      modernCameraAPI: true,
      enhancementLevel: 'full',
    });

    const { result } = renderHook(() => useFeatureDetection());

    expect(result.current.isLoading).toBe(true);
    expect(result.current.features).toBe(null);
    expect(result.current.error).toBe(null);
  });

  it('should detect features on mount', async () => {
    const mockFeatures = {
      cameraSupported: true,
      mediaPipeSupported: true,
      webGLSupported: true,
      hasCamera: true,
      isSecureContext: true,
      modernCameraAPI: true,
      enhancementLevel: 'full' as const,
    };

    vi.mocked(featureDetection.detectFeatures).mockResolvedValue(mockFeatures);
    vi.mocked(featureDetection.hasBasicCameraSupport).mockReturnValue(true);
    vi.mocked(featureDetection.hasFullEnhancementSupport).mockReturnValue(true);

    const { result } = renderHook(() => useFeatureDetection());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.features).toEqual(mockFeatures);
    expect(result.current.error).toBe(null);
    expect(result.current.hasBasicCamera).toBe(true);
    expect(result.current.hasFullEnhancement).toBe(true);
  });

  it('should handle detection errors gracefully', async () => {
    const mockError = new Error('Detection failed');
    vi.mocked(featureDetection.detectFeatures).mockRejectedValue(mockError);
    vi.mocked(featureDetection.hasBasicCameraSupport).mockReturnValue(false);

    const { result } = renderHook(() => useFeatureDetection());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toContain('Detection failed');
    expect(result.current.features?.enhancementLevel).toBe('none');
    expect(result.current.hasBasicCamera).toBe(false);
  });

  it('should set features to minimal on detection error', async () => {
    vi.mocked(featureDetection.detectFeatures).mockRejectedValue(
      new Error('Detection failed')
    );

    const { result } = renderHook(() => useFeatureDetection());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.features).toEqual({
      cameraSupported: false,
      mediaPipeSupported: false,
      webGLSupported: false,
      hasCamera: false,
      isSecureContext: false,
      modernCameraAPI: false,
      enhancementLevel: 'none',
    });
  });

  it('should cleanup on unmount', async () => {
    vi.mocked(featureDetection.detectFeatures).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    const { unmount } = renderHook(() => useFeatureDetection());

    // Should not throw on unmount
    expect(() => unmount()).not.toThrow();
  });
});

describe('useQuickCameraCheck', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return camera support status synchronously', () => {
    vi.mocked(featureDetection.hasBasicCameraSupport).mockReturnValue(true);

    const { result } = renderHook(() => useQuickCameraCheck());

    expect(result.current).toBe(true);
  });

  it('should return false when camera not supported', () => {
    vi.mocked(featureDetection.hasBasicCameraSupport).mockReturnValue(false);

    const { result } = renderHook(() => useQuickCameraCheck());

    expect(result.current).toBe(false);
  });
});
