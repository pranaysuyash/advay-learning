import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSettingsStore } from '../store';
import { Mascot } from './Mascot';

interface OnboardingFlowProps {
  onComplete?: () => void;
  onSkip?: () => void;
}

type Step = 'welcome' | 'camera' | 'gesture';

export function OnboardingFlow({ onComplete, onSkip }: OnboardingFlowProps) {
  const { hydrated, onboardingCompleted, updateSettings } = useSettingsStore();
  const [currentStep, setCurrentStep] = useState<Step>('welcome');
  const [cameraStatus, setCameraStatus] = useState<
    'pending' | 'success' | 'error'
  >('pending');
  const [visible, setVisible] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const steps: Step[] = ['welcome', 'camera', 'gesture'];
  const currentIndex = steps.indexOf(currentStep);

  const cleanup = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  const handleComplete = useCallback(() => {
    cleanup();
    setVisible(false);
    updateSettings({ onboardingCompleted: true, tutorialCompleted: true });
    onComplete?.();
  }, [cleanup, updateSettings, onComplete]);

  const handleSkip = useCallback(() => {
    cleanup();
    setVisible(false);
    updateSettings({ onboardingCompleted: true });
    onSkip?.();
  }, [cleanup, updateSettings, onSkip]);

  const handleNext = useCallback(() => {
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    } else {
      handleComplete();
    }
  }, [currentIndex, steps, handleComplete]);

  const testCamera = useCallback(async () => {
    try {
      setCameraStatus('pending');
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      updateSettings({ cameraPermissionState: 'granted', cameraEnabled: true });
      setCameraStatus('success');
    } catch {
      updateSettings({ cameraPermissionState: 'denied' });
      setCameraStatus('error');
    }
  }, [updateSettings]);

  useEffect(() => {
    if (currentStep === 'camera' && cameraStatus === 'pending') {
      testCamera();
    }
  }, [currentStep, cameraStatus, testCamera]);

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  useEffect(() => {
    // Only show onboarding after store has been hydrated to avoid flash of UI on first render
    if (hydrated && !onboardingCompleted) {
      setVisible(true);
    }

    if (onboardingCompleted) {
      setVisible(false);
    }
  }, [hydrated, onboardingCompleted]);

  if (!visible) return null;

  return (
    <AnimatePresence mode='wait'>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className='fixed inset-0 bg-slate-900/95 backdrop-blur-sm flex items-center justify-center z-50'
      >
        <div className='w-full max-w-lg mx-4'>
          <div className='flex justify-center gap-2 mb-8'>
            {steps.map((step, i) => (
              <motion.div
                key={step}
                className={`h-2 rounded-full transition-all ${
                  i <= currentIndex ? 'bg-orange-500 w-8' : 'bg-slate-600 w-2'
                }`}
                animate={{ scale: i === currentIndex ? 1.1 : 1 }}
              />
            ))}
          </div>

          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className='bg-slate-800 rounded-3xl p-8 shadow-2xl border border-slate-700'
          >
            {currentStep === 'welcome' && (
              <WelcomeStep onNext={handleNext} onSkip={handleSkip} />
            )}
            {currentStep === 'camera' && (
              <CameraStep
                status={cameraStatus}
                videoRef={videoRef}
                onRetry={testCamera}
                onNext={handleNext}
                onSkip={handleSkip}
              />
            )}
            {currentStep === 'gesture' && (
              <GestureStep onComplete={handleComplete} onSkip={handleSkip} />
            )}
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

function WelcomeStep({
  onNext,
  onSkip,
}: {
  onNext: () => void;
  onSkip: () => void;
}) {
  return (
    <div className='text-center'>
      <Mascot state='happy' className='mb-4' enableVideo={false} />

      <h1 className='text-3xl font-bold text-white mb-3'>
        Welcome to Learn with Your Hands!
      </h1>
      <p className='text-slate-300 text-lg mb-8'>
        Hi! I&apos;m Pip, and I&apos;ll help you learn letters by drawing in the
        air with your fingers!
      </p>

      <div className='space-y-3'>
        <button
          onClick={onNext}
          className='w-full px-6 py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold text-lg transition shadow-lg'
        >
          Let&apos;s Get Started! 🎉
        </button>
        <button
          onClick={onSkip}
          className='w-full px-6 py-3 text-slate-400 hover:text-white font-medium transition'
        >
          Skip Tutorial
        </button>
      </div>
    </div>
  );
}

function CameraStep({
  status,
  videoRef,
  onRetry,
  onNext,
  onSkip,
}: {
  status: 'pending' | 'success' | 'error';
  videoRef: React.RefObject<HTMLVideoElement | null>;
  onRetry: () => void;
  onNext: () => void;
  onSkip: () => void;
}) {
  return (
    <div className='text-center'>
      <h2 className='text-2xl font-bold text-white mb-3'>Camera Setup</h2>
      <p className='text-slate-300 mb-6'>
        We need camera access to see your hand movements. Don&apos;t worry—your
        video stays on your device!
      </p>

      <div className='relative w-full aspect-video bg-slate-900 rounded-2xl overflow-hidden mb-6 border-2 border-slate-700'>
        {status === 'pending' && (
          <div className='absolute inset-0 flex items-center justify-center'>
            <motion.div
              className='w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full'
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
          </div>
        )}
        {status === 'success' && (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className='w-full h-full object-cover'
            />
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className='absolute top-4 right-4 bg-green-500 text-white rounded-full p-2'
            >
              <svg
                className='w-6 h-6'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={3}
                  d='M5 13l4 4L19 7'
                />
              </svg>
            </motion.div>
          </>
        )}
        {status === 'error' && (
          <div className='absolute inset-0 flex flex-col items-center justify-center p-4'>
            <div className='text-red-400 text-5xl mb-3'>📷</div>
            <p className='text-red-400 font-medium mb-2'>
              Camera access denied
            </p>
            <p className='text-slate-400 text-sm text-center'>
              Please allow camera access in your browser settings to use hand
              tracking
            </p>
          </div>
        )}
      </div>

      <div className='space-y-3'>
        {status === 'success' && (
          <button
            onClick={onNext}
            className='w-full px-6 py-4 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold text-lg transition shadow-lg'
          >
            Camera Works! Next →
          </button>
        )}
        {status === 'error' && (
          <button
            onClick={onRetry}
            className='w-full px-6 py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold text-lg transition shadow-lg'
          >
            Try Again
          </button>
        )}
        <button
          onClick={onSkip}
          className='w-full px-6 py-3 text-slate-400 hover:text-white font-medium transition'
        >
          {status === 'error' ? 'Continue Without Camera' : 'Skip'}
        </button>
      </div>
    </div>
  );
}

function GestureStep({
  onComplete,
  onSkip,
}: {
  onComplete: () => void;
  onSkip: () => void;
}) {
  return (
    <div className='text-center'>
      <h2 className='text-2xl font-bold text-white mb-3'>The Pinch Gesture</h2>
      <p className='text-slate-300 mb-6'>
        Touch your thumb and index finger together to draw. Release to stop
        drawing.
      </p>

      <div className='relative h-48 mb-6'>
        <motion.div
          className='absolute inset-0 flex items-center justify-center'
          animate={{
            scale: [1, 0.9, 1],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <div className='relative'>
            <motion.div
              className='text-8xl'
              animate={{
                rotate: [0, -5, 5, 0],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              🤏
            </motion.div>
            <motion.div
              className='absolute -top-2 -right-2 w-6 h-6 bg-orange-400 rounded-full'
              animate={{
                scale: [0, 1.2, 0],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeOut',
                delay: 0.3,
              }}
            />
            <motion.div
              className='absolute -bottom-4 left-1/2 -translate-x-1/2'
              animate={{
                y: [0, 20],
                opacity: [1, 0],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeOut',
                delay: 0.5,
              }}
            >
              <div className='w-1 h-8 bg-gradient-to-b from-orange-400 to-transparent rounded-full' />
            </motion.div>
          </div>
        </motion.div>
      </div>

      <div className='grid grid-cols-2 gap-4 mb-6 text-left'>
        <div className='bg-slate-700/50 rounded-xl p-4'>
          <div className='text-2xl mb-2'>👆👍</div>
          <div className='text-white font-medium'>Pinch = Draw</div>
          <div className='text-slate-400 text-sm'>Fingers together</div>
        </div>
        <div className='bg-slate-700/50 rounded-xl p-4'>
          <div className='text-2xl mb-2'>✋</div>
          <div className='text-white font-medium'>Open = Stop</div>
          <div className='text-slate-400 text-sm'>Fingers apart</div>
        </div>
      </div>

      <div className='space-y-3'>
        <button
          onClick={onComplete}
          className='w-full px-6 py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold text-lg transition shadow-lg'
        >
          Start Playing! 🎮
        </button>
        <button
          onClick={onSkip}
          className='w-full px-6 py-3 text-slate-400 hover:text-white font-medium transition'
        >
          Skip
        </button>
      </div>
    </div>
  );
}
