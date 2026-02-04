import { useState, useCallback } from 'react';

/**
 * useCameraPermission
 * Manages camera permission state for games.
 *
 * Returns:
 * - status: 'idle' | 'requesting' | 'granted' | 'denied'
 * - requestPermission: () => Promise<boolean> - Returns true if granted
 * - resetPermission: () => void - Resets to initial state
 * - error: string | null - Human-readable error message
 */

type PermissionStatus = 'idle' | 'requesting' | 'granted' | 'denied';

interface UseCameraPermissionReturn {
  status: PermissionStatus;
  requestPermission: () => Promise<boolean>;
  resetPermission: () => void;
  error: string | null;
  isGranted: boolean;
}

export function useCameraPermission(): UseCameraPermissionReturn {
  const [status, setStatus] = useState<PermissionStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    setStatus('requesting');
    setError(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      // Stop the stream - we're just checking permission
      stream.getTracks().forEach((track) => track.stop());

      setStatus('granted');
      return true;
    } catch (err) {
      let errorMsg = 'Unable to access camera';

      // In tests (and in some browsers), the thrown value may not be a real DOMException.
      // Use the standard `name` field when present.
      const errorName =
        err instanceof DOMException ? err.name : (err as any)?.name;
      const errorDetail =
        err instanceof DOMException ? err.message : (err as any)?.message;

      if (typeof errorName === 'string') {
        if (errorName === 'NotAllowedError') {
          errorMsg = 'Camera permission was denied. You can still play with touch!';
        } else if (errorName === 'NotFoundError') {
          errorMsg = 'No camera found on this device. You can still play with touch!';
        } else if (errorName === 'NotReadableError') {
          errorMsg =
            'Your camera is being used by another app. Close it and try again, or play with touch!';
        } else if (errorName === 'SecurityError') {
          errorMsg = 'Camera access is not allowed in this context. You can still play with touch!';
        } else {
          errorMsg = `Camera error: ${String(errorDetail ?? '')}. You can still play with touch!`;
        }
      }

      setError(errorMsg);
      setStatus('denied');
      return false;
    }
  }, []);

  const resetPermission = useCallback(() => {
    setStatus('idle');
    setError(null);
  }, []);

  return {
    status,
    requestPermission,
    resetPermission,
    error,
    isGranted: status === 'granted',
  };
}
