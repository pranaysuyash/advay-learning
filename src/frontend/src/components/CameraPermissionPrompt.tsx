import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Button } from './ui/Button';

interface CameraPermissionPromptProps {
  onPermissionGranted: () => void;
  onPermissionDenied: () => void;
  title?: string;
  description?: string;
  fullscreen?: boolean;
}

/**
 * CameraPermissionPrompt
 * Displays a friendly, context-aware prompt explaining why camera is needed
 * and requesting user permission to access the camera.
 *
 * Props:
 * - onPermissionGranted: Called when user grants camera permission
 * - onPermissionDenied: Called when user denies or closes the prompt
 * - title: Custom title (defaults to "Ready to Play?")
 * - description: Custom description explaining why camera is needed
 * - fullscreen: If true, displays as fullscreen overlay; otherwise inline
 *
 * Usage:
 * <CameraPermissionPrompt
 *   onPermissionGranted={() => startGame()}
 *   onPermissionDenied={() => useTouchMode()}
 * />
 */
export function CameraPermissionPrompt({
  onPermissionGranted,
  onPermissionDenied,
  title = 'Ready to Play?',
  description,
  fullscreen = true,
}: CameraPermissionPromptProps) {
  const [isRequesting, setIsRequesting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const defaultDescription =
    "We'd love to see your hands move! Your camera helps Pip track your gestures to make the game fun and interactive. You can always play without it, too.";

  const handleRequestPermission = useCallback(async () => {
    setIsRequesting(true);
    setError(null);

    try {
      // Request camera permission
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      // Stop the stream - we're just checking permission
      stream.getTracks().forEach((track) => track.stop());

      // Permission granted
      onPermissionGranted();
    } catch (err) {
      const errorName = (err as any)?.name || '';
      const errorMessage = (err as any)?.message || 'Unknown error';

      // Handle specific error cases - check both instanceof and name property
      if (
        err instanceof DOMException ||
        errorName === 'NotAllowedError'
      ) {
        setError('Camera permission was denied. You can still play with touch!');
      } else if (
        errorName === 'NotFoundError'
      ) {
        setError('No camera found on this device. You can still play with touch!');
      } else if (
        errorName === 'NotReadableError'
      ) {
        setError(
          'Your camera is being used by another app. Close it and try again, or play with touch!',
        );
      } else if (err instanceof DOMException) {
        setError(`Camera error: ${errorMessage}. You can still play with touch!`);
      } else {
        setError('Unable to access camera. You can still play with touch!');
      }

      // After showing error, let user continue without camera
      setTimeout(() => {
        onPermissionDenied();
      }, 2000);
    } finally {
      setIsRequesting(false);
    }
  }, [onPermissionGranted, onPermissionDenied]);

  const content = (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`${fullscreen ? 'fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4' : 'relative'}`}
    >
      <div className={`${fullscreen ? 'w-full max-w-md' : 'w-full'} bg-white rounded-lg shadow-lg p-6`}>
        {/* Camera Icon */}
        <div className='flex justify-center mb-6'>
          <div className='w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center'>
            <svg
              className='w-8 h-8 text-blue-600'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z'
              />
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M15 13a3 3 0 11-6 0 3 3 0 016 0z'
              />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h2 className='text-2xl font-bold text-center text-text-primary mb-3'>{title}</h2>

        {/* Description */}
        <p className='text-center text-text-secondary mb-6'>{description || defaultDescription}</p>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className='bg-red-50 border border-red-200 rounded-lg p-3 mb-6'
          >
            <p className='text-sm text-red-700'>{error}</p>
          </motion.div>
        )}

        {/* Buttons */}
        <div className='flex flex-col gap-3'>
          <Button
            onClick={handleRequestPermission}
            disabled={isRequesting}
            size='lg'
            className='w-full'
            aria-label='Request camera permission'
          >
            {isRequesting ? 'Requesting Permission...' : 'Use Camera 📷'}
          </Button>

          <Button
            onClick={onPermissionDenied}
            variant='secondary'
            size='lg'
            className='w-full'
            aria-label='Skip camera and play with touch'
          >
            Play with Touch 👆
          </Button>
        </div>

        {/* Privacy Notice */}
        <p className='text-xs text-text-tertiary text-center mt-6'>
          Your camera feed stays on your device. We never store or share your video.
        </p>
      </div>
    </motion.div>
  );

  return content;
}

/**
 * CameraPermissionWrapper
 * HOC for game pages to handle camera permission flow.
 *
 * Usage:
 * <CameraPermissionWrapper
 *   onReady={() => startGame()}
 * >
 *   <GameComponent />
 * </CameraPermissionWrapper>
 */
interface CameraPermissionWrapperProps {
  children: React.ReactNode;
  onCameraGranted?: () => void;
  onCameraDenied?: () => void;
  skipPrompt?: boolean; // For demo mode or testing
}

export function CameraPermissionWrapper({
  children,
  onCameraGranted,
  onCameraDenied,
  skipPrompt = false,
}: CameraPermissionWrapperProps) {
  const [showPrompt, setShowPrompt] = useState(!skipPrompt);

  const handleGranted = useCallback(() => {
    setShowPrompt(false);
    onCameraGranted?.();
  }, [onCameraGranted]);

  const handleDenied = useCallback(() => {
    setShowPrompt(false);
    onCameraDenied?.();
  }, [onCameraDenied]);

  return (
    <>
      {showPrompt && (
        <CameraPermissionPrompt
          onPermissionGranted={handleGranted}
          onPermissionDenied={handleDenied}
        />
      )}
      {!showPrompt && children}
    </>
  );
}
