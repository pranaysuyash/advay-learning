import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CameraPermissionTutorialProps {
  onDismiss: () => void;
  onRequestPermission: () => void;
}

export function CameraPermissionTutorial({
  onDismiss,
  onRequestPermission,
}: CameraPermissionTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: '📹 Camera Permission Needed',
      description:
        "Advay uses your camera to detect your hand and finger movements for interactive learning. We never store or send video anywhere—only process hand positions in real-time.",
      icon: 'video',
      emoji: '📹',
    },
    {
      title: '👆 How Hand Tracking Works',
      description:
        'When you allow camera access, Advay detects your hand position using MediaPipe. Your index finger (pointer) controls the cursor, and you can make a pinch gesture (thumb touching index finger) to interact with the game.',
      icon: 'hand',
      emoji: '👆',
    },
    {
      title: '🎮 Game Modes',
      description:
        'Some games let you toggle between Hand Mode and Mouse Mode using the button. Try hand mode for a fun, hands-on experience—or use mouse clicks if hand tracking isn\'t working.',
      icon: 'gamepad',
      emoji: '🎮',
    },
    {
      title: '🔒 Your Privacy',
      description:
        'No video is saved, recorded, or sent to servers. Only hand position data is processed locally on your device. You can deny camera permission and still use mouse/click mode.',
      icon: 'lock',
      emoji: '🔒',
    },
    {
      title: '✨ Ready to Begin?',
      description:
        'Allow camera permission to unlock hand-tracking games. You can change this decision anytime in your browser settings.',
      icon: 'star',
      emoji: '✨',
    },
  ];

  const step = steps[currentStep];

  const handleNext = useCallback(() => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onRequestPermission();
    }
  }, [currentStep, steps.length, onRequestPermission]);

  const handlePrevious = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  }, [currentStep]);

  const progressPercent = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className='fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4'>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className='bg-gradient-to-br from-white via-white to-blue-50/30 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto'
      >
        {/* Header */}
        <div className='bg-gradient-to-r from-blue-500 to-cyan-500 text-white p-8'>
          <div className='flex items-center justify-between mb-4'>
            <div className='flex items-center gap-3'>
              <span className='text-4xl'>{step.emoji}</span>
              <h2 className='text-3xl font-bold'>{step.title}</h2>
            </div>
            <button
              onClick={onDismiss}
              className='hover:bg-white/20 p-2 rounded-lg transition'
              type='button'
              aria-label='Close tutorial'
            >
              <span className='text-2xl'>✕</span>
            </button>
          </div>

          {/* Progress Bar */}
          <div className='w-full h-2 bg-white/30 rounded-full overflow-hidden'>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              className='h-full bg-white'
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Content */}
        <div className='p-8'>
          <AnimatePresence mode='wait'>
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <p className='text-lg text-gray-700 mb-6 leading-relaxed'>
                {step.description}
              </p>

              {/* Visual Aid for Each Step */}
              <div className='bg-blue-50/50 border border-blue-200 rounded-xl p-6 mb-6'>
                {currentStep === 1 && (
                  <div className='text-center space-y-4'>
                    <div className='text-6xl'>✌️</div>
                    <p className='text-sm text-gray-600'>
                      Index finger (pointer) moves the cursor
                    </p>
                    <div className='text-4xl'>👌</div>
                    <p className='text-sm text-gray-600'>
                      Thumb + Index pinch to interact
                    </p>
                  </div>
                )}
                {currentStep === 2 && (
                  <div className='grid grid-cols-2 gap-4'>
                    <div className='bg-white p-4 rounded-lg border-2 border-blue-300'>
                      <p className='font-bold text-center mb-2'>Hand Mode</p>
                      <p className='text-sm text-gray-600 text-center'>
                        Use hand gestures to play
                      </p>
                    </div>
                    <div className='bg-white p-4 rounded-lg border-2 border-gray-300'>
                      <p className='font-bold text-center mb-2'>Mouse Mode</p>
                      <p className='text-sm text-gray-600 text-center'>
                        Use mouse clicks (fallback)
                      </p>
                    </div>
                  </div>
                )}
                {currentStep === 3 && (
                  <div className='text-center space-y-3'>
                    <p className='text-sm font-bold text-blue-600'>✅ Processing</p>
                    <p className='text-sm text-gray-600'>
                      Hand position processed locally on your device
                    </p>
                    <p className='text-sm font-bold text-red-600'>❌ NOT Stored</p>
                    <p className='text-sm text-gray-600'>
                      No video saved or sent to servers
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Step Indicator */}
          <div className='flex items-center justify-center gap-2 mb-6'>
            {steps.map((_, idx) => (
              <motion.button
                key={idx}
                onClick={() => setCurrentStep(idx)}
                className={`h-2 rounded-full transition ${
                  idx === currentStep
                    ? 'bg-blue-500 w-8'
                    : 'bg-gray-300 w-2 hover:bg-gray-400'
                }`}
                type='button'
                aria-label={`Go to step ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Footer with Buttons */}
        <div className='bg-gray-50 border-t border-gray-200 px-8 py-6 flex gap-3'>
          <button
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className='px-6 py-2 rounded-lg font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition'
            type='button'
          >
            ← Previous
          </button>

          <button
            onClick={onDismiss}
            className='flex-1 px-6 py-2 rounded-lg font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition'
            type='button'
          >
            Skip
          </button>

          <button
            onClick={handleNext}
            className='flex-1 px-6 py-2 rounded-lg font-medium text-white bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 transition'
            type='button'
          >
            {currentStep === steps.length - 1 ? 'Enable Camera' : 'Next →'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
