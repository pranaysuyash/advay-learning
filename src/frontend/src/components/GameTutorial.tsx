import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Webcam from 'react-webcam';
import { UIIcon } from './ui/Icon';
import { VoiceButton } from './ui/VoiceButton';
import { useGameHandTracking } from '../hooks/useGameHandTracking';
import type { TrackedHandFrame } from '../utils/handTrackingFrame';
import type { HandTrackingRuntimeMeta } from '../hooks/useHandTrackingRuntime';

interface GameTutorialProps {
  onComplete: () => void;
  onSkip: () => void;
  onSkipCamera?: () => void;
}

export function GameTutorial({ onComplete, onSkip, onSkipCamera }: GameTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [handDetected, setHandDetected] = useState(false);
  const [pinchDetected, setPinchDetected] = useState(false);
  const [canAutoAdvance, setCanAutoAdvance] = useState(false);
  const [stepReady, setStepReady] = useState(false);

  const webcamRef = useRef<Webcam>(null);
  const handDetectedRef = useRef(false);
  const advanceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const steps = [
    {
      id: 'camera',
      title: 'Allow Camera Access',
      description:
        'Click "Allow" when your browser asks for camera permission so hand tracking can work',
      alternativeDescription: 'Or play with your finger on the screen!',
      icon: <UIIcon name='camera' size={48} className='w-12 h-12' />,
      hasAlternative: true,
      showWebcam: true,
      autoAdvance: false, // Manual advance for camera permission
    },
    {
      id: 'hands',
      title: 'Show Your Hands',
      description: 'Hold your hands up so the camera can see them',
      icon: <UIIcon name='hand' size={48} className='w-12 h-12' />,
      showWebcam: true,
      autoAdvance: true, // Auto-detect hands
      detectCondition: () => handDetected,
      detectMessage: handDetected ? '✅ Hands detected!' : 'Waiting for hands...',
    },
    {
      id: 'pinch',
      title: 'Pinch Your Fingers',
      description: 'Pinch your thumb and index finger together',
      icon: <UIIcon name='hand' size={48} className='w-12 h-12' />,
      showWebcam: true,
      autoAdvance: true, // Auto-detect pinch
      detectCondition: () => pinchDetected,
      detectMessage: pinchDetected ? '✅ Pinch detected!' : 'Pinch thumb and index finger...',
    },
    {
      id: 'trace',
      title: 'Trace the Letter',
      description: 'Use your finger to trace the letter on the screen',
      icon: <UIIcon name='pencil' size={48} className='w-12 h-12' />,
      showWebcam: false,
      autoAdvance: false,
    },
  ];

  const currentStepData = steps[currentStep];

  // Hand tracking frame handler
  const handleHandFrame = useCallback((frame: TrackedHandFrame, _meta: HandTrackingRuntimeMeta) => {
    if (currentStep === 1 && frame.indexTip) {
      // "Show Your Hands" step - detect any hand
      if (!handDetectedRef.current) {
        setHandDetected(true);
        handDetectedRef.current = true;
      }
    } else if (currentStep === 2 && frame.pinch) {
      // "Pinch Your Fingers" step - detect pinch
      const isPinching = frame.pinch.state.isPinching || frame.pinch.transition === 'start' || frame.pinch.transition === 'continue';
      if (isPinching && !pinchDetected) {
        setPinchDetected(true);
      }
    }
  }, [currentStep, handDetected, pinchDetected]);

  const { isReady } = useGameHandTracking({
    gameName: 'GameTutorial',
    webcamRef,
    onFrame: handleHandFrame,
    isRunning: currentStep === 1 || currentStep === 2, // Only track during hands/pinch steps
  });

  // Auto-advance when detection condition is met
  useEffect(() => {
    if (!currentStepData.autoAdvance || !currentStepData.detectCondition) return;

    const checkCondition = () => {
      if (currentStepData.detectCondition?.() && stepReady) {
        setCanAutoAdvance(true);
        // Auto-advance after showing success briefly
        advanceTimeoutRef.current = setTimeout(() => {
          handleNext();
        }, 800);
      }
    };

    checkCondition();
    return () => {
      if (advanceTimeoutRef.current) {
        clearTimeout(advanceTimeoutRef.current);
      }
    };
  }, [currentStep, handDetected, pinchDetected, stepReady]);

  // Mark step as ready after a brief delay for animations
  useEffect(() => {
    setStepReady(false);
    setCanAutoAdvance(false);
    const timer = setTimeout(() => setStepReady(true), 500);
    return () => clearTimeout(timer);
  }, [currentStep]);

  // Reset detection state when moving to relevant steps
  useEffect(() => {
    if (currentStep === 1) {
      // Reset for hands detection
      setHandDetected(false);
      handDetectedRef.current = false;
    } else if (currentStep === 2) {
      // Reset for pinch detection
      setPinchDetected(false);
    }
  }, [currentStep]);

  const handleNext = useCallback(() => {
    if (advanceTimeoutRef.current) {
      clearTimeout(advanceTimeoutRef.current);
      advanceTimeoutRef.current = null;
    }
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      onComplete();
    }
  }, [currentStep, steps.length, onComplete]);

  const handleSkip = useCallback(() => {
    onSkip();
  }, [onSkip]);

  const handleSkipCamera = useCallback(() => {
    if (onSkipCamera) {
      onSkipCamera();
    } else {
      onSkip();
    }
  }, [onSkipCamera, onSkip]);

  return (
    <div className='fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50'>
      <AnimatePresence>
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.3 }}
          className='bg-white rounded-2xl p-8 max-w-lg mx-4 shadow-2xl w-full'
        >
          <div className='text-center'>
            {/* Play Now - skip tutorial */}
            <button
              onClick={onComplete}
              className='mb-4 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl font-bold text-lg shadow-lg transition flex items-center justify-center gap-2 mx-auto'
            >
              <span>▶</span> Play Now — Skip Tutorial
            </button>

            <h2 className='text-2xl font-bold mb-2 text-brand-primary'>
              How to Play
            </h2>
            <div className='space-y-6'>
              {/* Step indicator */}
              <div className='flex items-center justify-center gap-2 mb-4'>
                {steps.map((_, idx) => (
                  <div
                    key={idx}
                    className={`h-2 rounded-full transition-all ${
                      idx === currentStep
                        ? 'w-8 bg-brand-primary'
                        : idx < currentStep
                          ? 'w-4 bg-green-500'
                          : 'w-2 bg-gray-300'
                    }`}
                  />
                ))}
              </div>

              {/* Camera preview for relevant steps */}
              {currentStepData.showWebcam && (
                <div className='relative mx-auto w-48 h-36 bg-black rounded-xl overflow-hidden border-2 border-gray-200'>
                  <Webcam
                    ref={webcamRef}
                    audio={false}
                    screenshotFormat='image/jpeg'
                    videoConstraints={{ width: 320, height: 240, facingMode: 'user' }}
                    className='w-full h-full object-cover'
                    mirrored
                  />
                  {!isReady && (
                    <div className='absolute inset-0 flex items-center justify-center bg-black/50'>
                      <div className='w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin' />
                    </div>
                  )}
                  {/* Detection indicator */}
                  {currentStepData.autoAdvance && (
                    <div className='absolute bottom-2 left-2 right-2 bg-black/70 text-white text-sm px-2 py-1 rounded-lg'>
                      {currentStepData.detectMessage}
                    </div>
                  )}
                </div>
              )}

              {/* Step content */}
              <div className='mb-4'>
                <div className='flex items-center justify-center mb-3'>
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-3 ${
                      currentStep === 0
                        ? 'bg-brand-primary text-white'
                        : 'bg-brand-accent text-brand-primary'
                    }`}
                  >
                    <span className='text-xl font-bold'>{currentStep + 1}</span>
                  </div>
                  <div className='text-text-secondary'>
                    {currentStep > 0 && (
                      <span className='text-brand-primary mr-2'>
                        Step {currentStep}
                      </span>
                    )}
                    {currentStepData.title}
                  </div>
                </div>
                <p className='text-text-primary text-lg leading-relaxed'>
                  {currentStepData.description}
                </p>

                {/* Voice prompt - only play when step is ready */}
                {stepReady && (
                  <div className='mt-3'>
                    <VoiceButton
                      text={`${currentStepData.title}. ${currentStepData.description}`}
                      label='🔊 Listen'
                      size='md'
                      variant='secondary'
                      autoPlay={false}
                    />
                  </div>
                )}

                {/* Show alternative option for camera step */}
                {'hasAlternative' in currentStepData && currentStepData.hasAlternative && (
                  <div className='mt-4 p-4 bg-surface-secondary rounded-xl border border-border'>
                    <p className='text-text-secondary text-sm mb-2'>
                      {currentStepData.alternativeDescription}
                    </p>
                    <button
                      onClick={handleSkipCamera}
                      className='px-4 py-2 bg-success hover:bg-success-hover text-white rounded-lg font-semibold text-sm transition flex items-center justify-center gap-2 mx-auto'
                    >
                      <UIIcon name='hand' size={16} />
                      Play with Touch/Mouse
                    </button>
                  </div>
                )}

                <div className='flex items-center justify-center mb-4 mt-4'>
                  <div className='text-brand-primary'>
                    {currentStepData.icon}
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className='flex justify-between items-center gap-4'>
                <button
                  onClick={handleSkip}
                  className='px-4 py-2 text-text-secondary hover:text-text-primary font-semibold transition'
                >
                  Skip
                </button>
                {(canAutoAdvance || !currentStepData.autoAdvance) && (
                  <button
                    onClick={handleNext}
                    className='px-6 py-2 bg-brand-primary hover:bg-brand-primary-hover text-white rounded-lg font-semibold transition'
                  >
                    {currentStep === steps.length - 1 ? 'Start Playing' : 'Next'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
