import { renderHook, act } from '@testing-library/react';
import { useCameraPermission } from './useCameraPermission';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('useCameraPermission', () => {
  let mockGetUserMedia: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockGetUserMedia = vi.fn(() => ({
      getTracks: () => [{ stop: vi.fn() }],
    }));

    Object.defineProperty(navigator, 'mediaDevices', {
      value: { getUserMedia: mockGetUserMedia },
      writable: true,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Initial State', () => {
    it('starts in idle state', () => {
      const { result } = renderHook(() => useCameraPermission());

      expect(result.current.status).toBe('idle');
      expect(result.current.isGranted).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });

  describe('Request Permission', () => {
    it('transitions to requesting state while requesting', () => {
      mockGetUserMedia.mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            setTimeout(() => {
              resolve({
                getTracks: () => [{ stop: vi.fn() }],
              });
            }, 100);
          }),
      );

      const { result } = renderHook(() => useCameraPermission());

      act(() => {
        result.current.requestPermission();
      });

      expect(result.current.status).toBe('requesting');
    });

    it('transitions to granted when permission is granted', async () => {
      const { result } = renderHook(() => useCameraPermission());

      await act(async () => {
        const granted = await result.current.requestPermission();
        expect(granted).toBe(true);
      });

      expect(result.current.status).toBe('granted');
      expect(result.current.isGranted).toBe(true);
      expect(result.current.error).toBeNull();
    });

    it('stops media stream after permission check', async () => {
      const mockStop = vi.fn();
      mockGetUserMedia.mockResolvedValueOnce({
        getTracks: () => [{ stop: mockStop }],
      });

      const { result } = renderHook(() => useCameraPermission());

      await act(async () => {
        await result.current.requestPermission();
      });

      expect(mockStop).toHaveBeenCalled();
    });

    it('handles NotAllowedError', async () => {
      mockGetUserMedia.mockRejectedValueOnce(
        Object.assign(new Error('Permission denied'), {
          name: 'NotAllowedError',
        }),
      );

      const { result } = renderHook(() => useCameraPermission());

      await act(async () => {
        const granted = await result.current.requestPermission();
        expect(granted).toBe(false);
      });

      expect(result.current.status).toBe('denied');
      expect(result.current.isGranted).toBe(false);
      expect(result.current.error).toContain('Camera permission was denied');
    });

    it('handles NotFoundError', async () => {
      mockGetUserMedia.mockRejectedValueOnce(
        Object.assign(new Error('No camera found'), {
          name: 'NotFoundError',
        }),
      );

      const { result } = renderHook(() => useCameraPermission());

      await act(async () => {
        await result.current.requestPermission();
      });

      expect(result.current.error).toContain('No camera found');
    });

    it('handles NotReadableError', async () => {
      mockGetUserMedia.mockRejectedValueOnce(
        Object.assign(new Error('Camera in use'), {
          name: 'NotReadableError',
        }),
      );

      const { result } = renderHook(() => useCameraPermission());

      await act(async () => {
        await result.current.requestPermission();
      });

      expect(result.current.error).toContain('being used by another app');
    });

    it('handles SecurityError', async () => {
      mockGetUserMedia.mockRejectedValueOnce(
        Object.assign(new Error('Security error'), {
          name: 'SecurityError',
        }),
      );

      const { result } = renderHook(() => useCameraPermission());

      await act(async () => {
        await result.current.requestPermission();
      });

      expect(result.current.error).toContain('not allowed in this context');
    });

    it('handles generic errors', async () => {
      mockGetUserMedia.mockRejectedValueOnce(new Error('Unknown error'));

      const { result } = renderHook(() => useCameraPermission());

      await act(async () => {
        await result.current.requestPermission();
      });

      expect(result.current.status).toBe('denied');
      expect(result.current.error).toBeDefined();
    });
  });

  describe('Reset Permission', () => {
    it('resets to idle state', async () => {
      const { result } = renderHook(() => useCameraPermission());

      await act(async () => {
        await result.current.requestPermission();
      });

      expect(result.current.status).toBe('granted');

      act(() => {
        result.current.resetPermission();
      });

      expect(result.current.status).toBe('idle');
      expect(result.current.isGranted).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('resets error state', async () => {
      mockGetUserMedia.mockRejectedValueOnce(
        Object.assign(new Error('Permission denied'), {
          name: 'NotAllowedError',
        }),
      );

      const { result } = renderHook(() => useCameraPermission());

      await act(async () => {
        await result.current.requestPermission();
      });

      expect(result.current.error).not.toBeNull();

      act(() => {
        result.current.resetPermission();
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('Camera API Constraints', () => {
    it('requests ideal video resolution', async () => {
      const { result } = renderHook(() => useCameraPermission());

      await act(async () => {
        await result.current.requestPermission();
      });

      expect(mockGetUserMedia).toHaveBeenCalledWith({
        video: {
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });
    });
  });
});
