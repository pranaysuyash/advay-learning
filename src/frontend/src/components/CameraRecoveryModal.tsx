import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UIIcon } from './ui/Icon';
import { Mascot } from './Mascot';
import confetti from 'canvas-confetti';

interface CameraRecoveryModalProps {
  isOpen: boolean;
  onRetryCamera: () => void;
  onContinueWithMouse: () => void;
  onSaveAndExit: () => void;
  errorMessage?: string;
}

export function CameraRecoveryModal({
  isOpen,
  onRetryCamera,
  onContinueWithMouse,
  onSaveAndExit,
  errorMessage = 'Camera connection lost',
}: CameraRecoveryModalProps) {
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetryCamera = useCallback(async () => {
    setIsRetrying(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach((track) => track.stop());
      // Success! Let the parent handle the state update
      onRetryCamera();
    } catch {
      // Still failed, stay in modal
      setIsRetrying(false);
    }
  }, [onRetryCamera]);

  const triggerCelebration = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#E85D04', '#F2CC8F', '#81B29A', '#3B82F6'],
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className='fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4'
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className='bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl'
          >
            {/* Mascot with concerned state */}
            <div className='flex justify-center mb-6'>
              <Mascot
                state='thinking'
                message="Uh oh! The camera stopped working."
              />
            </div>

            {/* Error message */}
            <div className='text-center mb-6'>
              <h2 className='text-2xl font-bold text-advay-slate mb-2'>
                Camera Needs Help
              </h2>
              <p className='text-text-secondary'>
                {errorMessage}. Don't worry — you can still play! Choose an option below:
              </p>
            </div>

            {/* Recovery Options */}
            <div className='space-y-4'>
              {/* Option 1: Retry Camera */}
              <button
                type="button"
                onClick={handleRetryCamera}
                disabled={isRetrying}
                className='w-full px-6 py-4 bg-pip-orange text-white rounded-2xl font-bold text-lg shadow-soft hover:bg-pip-rust transition-all hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-3'
              >
                {isRetrying ? (
                  <>
                    <div className='w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin' />
                    Checking camera...
                  </>
                ) : (
                  <>
                    <UIIcon name='camera' size={24} />
                    Try Camera Again
                  </>
                )}
              </button>

              {/* Option 2: Continue with Mouse/Touch */}
              <button
                type="button"
                onClick={() => {
                  triggerCelebration();
                  onContinueWithMouse();
                }}
                className='w-full px-6 py-4 bg-success text-white rounded-2xl font-bold text-lg shadow-soft hover:bg-success-hover transition-all hover:scale-[1.02] flex items-center justify-center gap-3'
              >
                <UIIcon name='hand' size={24} />
                Continue with Touch/Mouse
              </button>

              {/* Option 3: Save and Exit */}
              <button
                type="button"
                onClick={onSaveAndExit}
                className='w-full px-6 py-4 bg-white text-text-primary border-2 border-border rounded-2xl font-bold text-lg hover:bg-bg-tertiary transition-all flex items-center justify-center gap-3'
              >
                <UIIcon name='home' size={24} />
                Save Progress & Go Home
              </button>
            </div>

            {/* Help text */}
            <p className='text-center text-text-muted text-sm mt-6'>
              Need help with camera permissions?{' '}
              <button
                type="button"
                onClick={() => {
                  window.open('https://support.google.com/chrome/answer/2693767', '_blank');
                }}
                className='text-pip-orange hover:underline font-medium'
              >
                Learn more
              </button>
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default CameraRecoveryModal;
