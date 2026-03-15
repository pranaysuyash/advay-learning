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
 * Displays a magical, exciting prompt for activating "Magic Vision"
 * - Frames camera as a superpower, not a permission
 * - Celebrates the magical capabilities it unlocks
 * - Makes the experience feel like unlocking a feature
 *
 * Props:
 * - onPermissionGranted: Called when user grants camera permission
 * - onPermissionDenied: Called when user denies or closes the prompt
 * - title: Custom title (defaults to magical headline)
 * - description: Custom description explaining the magic
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
  title = '✨ Activate Magic Vision! ✨',
  description,
  fullscreen = true,
}: CameraPermissionPromptProps) {
  const [isRequesting, setIsRequesting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const defaultDescription =
    "Wave your hands to draw in the air! Pinch to pop bubbles! Your gestures control the game. 🪄";

  const handleRequestPermission = useCallback(async () => {
    setIsRequesting(true);
    setError(null);

    try {
      // Activate Magic Vision!
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      // Stop the stream - we're just checking permission
      stream.getTracks().forEach((track) => track.stop());

      // Magic Vision activated!
      onPermissionGranted();
    } catch (err) {
      const errorNameRaw =
        (err as any)?.name || (err as any)?.constructor?.name || '';
      const errorMessage = String((err as any)?.message || 'Unknown error');
      const errorName = String(errorNameRaw);
      const msgLower = errorMessage.toLowerCase();

      // Handle specific error cases - reframed as "magic blocked"
      if (
        errorName === 'NotAllowedError' ||
        msgLower.includes('permission denied') ||
        msgLower.includes('notallowed')
      ) {
        setError('Magic Vision needs camera access. You can still play with touch! 👆');
      } else if (
        errorName === 'NotFoundError'
      ) {
        setError('No camera found. You can still play with touch mode!');
      } else if (
        errorName === 'NotReadableError'
      ) {
        setError(
          'Camera is busy. Close other apps and try again, or play with touch!',
        );
      } else if (errorName === 'SecurityError' || msgLower.includes('security')) {
        setError('Magic Vision not available here. You can still play with touch!');
      } else if (err instanceof DOMException) {
        setError(`Camera unavailable. You can still play with touch!`);
      } else {
        setError('Camera unavailable. You can still play with touch!');
      }


    } finally {
      setIsRequesting(false);
    }
  }, [onPermissionGranted]);

  const content = (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`${fullscreen ? 'fixed inset-0 flex items-center justify-center bg-gradient-to-br from-purple-900/40 to-blue-900/40 backdrop-blur-sm z-50 p-4' : 'relative'}`}
    >
      <div className={`${fullscreen ? 'w-full max-w-md' : 'w-full'} bg-white rounded-3xl shadow-2xl p-8 border-4 border-[#F2CC8F]`}>

        {/* Magical Sparkles Decoration */}
        <div className="absolute -top-6 -left-6 text-4xl animate-bounce">✨</div>
        <div className="absolute -top-6 -right-6 text-4xl animate-bounce" style={{animationDelay: '0.2s'}}>✨</div>
        <div className="absolute -bottom-6 -left-6 text-4xl animate-bounce" style={{animationDelay: '0.4s'}}>✨</div>
        <div className="absolute -bottom-6 -right-6 text-4xl animate-bounce" style={{animationDelay: '0.6s'}}>✨</div>

        {/* Magic Wand Icon */}
        <div className='flex justify-center mb-6'>
          <motion.div
            className='w-20 h-20 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center shadow-lg'
            animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <span className='text-5xl'>🪄</span>
          </motion.div>
        </div>

        {/* Title */}
        <h2 className='text-2xl md:text-3xl font-black text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600 mb-3'>
          {title}
        </h2>

        {/* Description */}
        <p className='text-center text-slate-700 font-bold mb-6'>{description || defaultDescription}</p>

        {/* Magic Features List */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-4 mb-6 border-2 border-purple-100">
          <p className="text-sm font-bold text-purple-800 mb-3">🌟 Magic Vision lets you:</p>
          <ul className="space-y-2 text-sm text-slate-700">
            <li className="flex items-center gap-2">
              <span className="text-lg">✋</span>
              <span>Draw letters in the air!</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-lg">👆</span>
              <span>Pop bubbles with gestures!</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-lg">🎯</span>
              <span>Control games without touching!</span>
            </li>
          </ul>
        </div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className='bg-orange-50 border-2 border-orange-200 rounded-2xl p-3 mb-6'
          >
            <p className='text-sm text-orange-700 font-bold'>{error}</p>
            <p className='text-xs text-orange-600 mt-2'>
              {/chrome/i.test(navigator.userAgent) && !(/edg/i.test(navigator.userAgent))
                ? '💡 Chrome: Settings → Privacy → Site Settings → Camera'
                : /safari/i.test(navigator.userAgent) && !(/chrome/i.test(navigator.userAgent))
                  ? '💡 Safari: Safari menu → Settings → Websites → Camera'
                  : /firefox/i.test(navigator.userAgent)
                    ? '💡 Firefox: Click the camera icon in the address bar'
                    : '💡 Check your browser settings to allow camera access'}
            </p>
          </motion.div>
        )}

        {/* Buttons */}
        <div className='flex flex-col gap-3'>
          <Button
            onClick={handleRequestPermission}
            disabled={isRequesting}
            size='lg'
            className='w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-black shadow-lg'
            aria-label='Activate Magic Vision'
          >
            {isRequesting ? '🪄 Awakening Magic...' : error ? 'Try Again 🪄' : 'Activate Magic Vision 🪄'}
          </Button>

          <Button
            onClick={onPermissionDenied}
            variant='secondary'
            size='lg'
            className='w-full font-bold'
            aria-label='Play with touch instead'
          >
            Play with Touch 👆
          </Button>
        </div>

        {/* Privacy Notice - Friendlier tone */}
        <div className="flex items-center justify-center gap-2 mt-6">
          <span className="text-2xl">🔒</span>
          <p className='text-xs text-slate-500 text-center'>
            Your camera stays private. Only you see you! 🛡️
          </p>
        </div>
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
