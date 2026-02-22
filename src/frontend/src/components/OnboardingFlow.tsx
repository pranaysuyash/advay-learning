import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSettingsStore } from '../store';
import { Mascot } from './Mascot';
import { Button } from './ui/Button';

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
        className='fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 overflow-hidden'
      >
        <div className='w-full max-w-xl mx-4 relative overflow-hidden'>
          {/* Progress Indicators */}
          <div className='flex justify-center gap-2 mb-6'>
            {steps.map((step, i) => (
              <motion.div
                key={step}
                className={`h-3 rounded-full transition-all border-2 flex items-center justify-center shadow-sm ${i <= currentIndex ? 'bg-[#10B981] border-[#10B981] w-12' : 'bg-white border-slate-200 w-3'
                  }`}
                animate={{ scale: i === currentIndex ? 1.1 : 1 }}
              />
            ))}
          </div>

          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 50, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -50, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className='bg-white rounded-[2.5rem] p-10 shadow-2xl border-4 border-slate-100 relative overflow-hidden text-center'
          >
            <div className='absolute -left-16 -bottom-16 w-48 h-48 bg-[#3B82F6]/10 rounded-full blur-3xl -z-10'></div>
            <div className='absolute -right-16 -top-16 w-48 h-48 bg-[#E85D04]/10 rounded-full blur-3xl -z-10'></div>

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
    <>
      <Mascot state='happy' className='mb-6 -mt-4' responsiveSize="lg" enableVideo={false} />

      <h1 className='text-3xl sm:text-4xl font-black text-slate-800 tracking-tight leading-tight mb-4'>
        Welcome to Learn with Your Hands!
      </h1>
      <p className='text-slate-500 font-bold text-lg mb-10'>
        Hi! I'm Pip, and I'll help you learn letters by drawing in the
        air with your fingers!
      </p>

      <div className='space-y-4 flex flex-col'>
        <Button
          onClick={onNext}
          size="lg"
          fullWidth
        >
          Let's Get Started! 🎉
        </Button>
        <button
          onClick={onSkip}
          className='w-full px-6 py-4 text-slate-400 hover:text-slate-600 font-bold tracking-widest uppercase transition-colors'
        >
          Skip Tutorial
        </button>
      </div>
    </>
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
    <>
      <div className="w-20 h-20 bg-blue-100 rounded-[1.5rem] flex items-center justify-center text-4xl mx-auto mb-6 shadow-sm border-2 border-white">
        📷
      </div>
      <h2 className='text-3xl font-black text-slate-800 tracking-tight mb-4'>Camera Setup</h2>
      <p className='text-slate-500 font-bold text-lg mb-8'>
        We need camera access to see your hand movements. Don't worry—your
        video stays entirely on your device!
      </p>

      <div className='relative w-full aspect-video bg-slate-100 rounded-[2rem] overflow-hidden mb-8 border-4 border-slate-200 shadow-inner'>
        {status === 'pending' && (
          <div className='absolute inset-0 flex items-center justify-center'>
            <motion.div
              className='w-16 h-16 border-4 border-[#3B82F6] border-t-transparent rounded-full'
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
              className='absolute top-4 right-4 bg-green-500 text-white rounded-full p-2 border-2 border-white shadow-sm'
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
                  strokeWidth={4}
                  d='M5 13l4 4L19 7'
                />
              </svg>
            </motion.div>
          </>
        )}
        {status === 'error' && (
          <div className='absolute inset-0 flex flex-col items-center justify-center p-6 bg-red-50 text-center text-balance'>
            <div className='text-red-500 text-5xl mb-4'>🔒</div>
            <p className='text-red-600 font-black text-xl mb-2'>
              Camera access denied
            </p>
            <p className='text-red-500/80 font-bold text-sm'>
              Please allow camera access in your browser settings to use hand
              tracking.
            </p>
          </div>
        )}
      </div>

      <div className='space-y-4 flex flex-col'>
        {status === 'success' && (
          <Button
            onClick={onNext}
            variant="success"
            size="lg"
            fullWidth
          >
            Camera Works! Next →
          </Button>
        )}
        {status === 'error' && (
          <Button
            onClick={onRetry}
            size="lg"
            fullWidth
          >
            Try Again
          </Button>
        )}
        <button
          onClick={onSkip}
          className='w-full px-6 py-4 text-slate-400 hover:text-slate-600 font-bold tracking-widest uppercase transition-colors'
        >
          {status === 'error' ? 'Continue Without Camera' : 'Skip Setup'}
        </button>
      </div>
    </>
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
    <>
      <div className="w-20 h-20 bg-green-100 rounded-[1.5rem] flex items-center justify-center text-4xl mx-auto mb-6 shadow-sm border-2 border-white">
        🤏
      </div>
      <h2 className='text-3xl font-black text-slate-800 tracking-tight mb-4'>The Pinch Gesture</h2>
      <p className='text-slate-500 font-bold text-lg mb-8 text-balance'>
        Touch your thumb and index finger together to draw. Release to stop
        drawing.
      </p>

      <div className='relative h-56 mb-8 bg-slate-50 rounded-[2rem] border-4 border-slate-100 overflow-hidden'>
        <motion.div
          className='absolute inset-0 flex items-center justify-center'
          animate={{
            scale: [1, 0.95, 1],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <div className='relative'>
            <motion.div
              className='text-[100px] drop-shadow-sm'
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
              className='absolute -top-2 -right-4 w-10 h-10 bg-[#E85D04]/40 rounded-full blur-sm'
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
              className='absolute -bottom-6 left-1/2 -translate-x-1/2'
              animate={{
                y: [0, 24],
                opacity: [1, 0],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeOut',
                delay: 0.5,
              }}
            >
              <div className='w-2 h-12 bg-gradient-to-b from-[#E85D04] to-transparent rounded-full' />
            </motion.div>
          </div>
        </motion.div>
      </div>

      <div className='grid grid-cols-2 gap-4 mb-10 text-left text-balance'>
        <div className='bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] p-5'>
          <div className='text-3xl mb-3'>👆👍</div>
          <div className='text-slate-800 font-black text-lg'>Pinch = Draw</div>
          <div className='text-slate-500 font-semibold text-sm'>Fingers together</div>
        </div>
        <div className='bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] p-5'>
          <div className='text-3xl mb-3'>✋</div>
          <div className='text-slate-800 font-black text-lg'>Open = Stop</div>
          <div className='text-slate-500 font-semibold text-sm'>Fingers apart</div>
        </div>
      </div>

      <div className='space-y-4 flex flex-col'>
        <Button
          onClick={onComplete}
          size="lg"
          fullWidth
        >
          Start Playing! 🎮
        </Button>
        <button
          onClick={onSkip}
          className='w-full px-6 py-4 text-slate-400 hover:text-slate-600 font-bold tracking-widest uppercase transition-colors'
        >
          Skip & Close
        </button>
      </div>
    </>
  );
}
