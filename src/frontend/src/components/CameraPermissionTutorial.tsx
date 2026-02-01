import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mascot } from './Mascot';

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
      title: "Pip Needs Your Help! 🐾",
      description: "Pip the Red Panda can see your hands move—but only if you let him! He needs to follow your finger to help rescue the lost letters.",
      emoji: '📹',
      mascotState: 'happy' as const,
      mascotMessage: "Hi! I can see your hands! Want to show me?",
    },
    {
      title: "Magic Hand Powers! ✨",
      description: "When you allow camera access, your hand becomes a magic wand! Move your finger to guide Pip, and pinch your thumb and finger together to draw magic lines!",
      emoji: '✋',
      mascotState: 'thinking' as const,
      mascotMessage: "Show me your 'claw'—pinch your thumb and finger!",
    },
    {
      title: "Don't Worry, Be Safe! 🔒",
      description: "Pip only looks at your hand—he can't see your face or anything else! No pictures are saved. It's like a magic mirror that only shows hands!",
      emoji: '🔒',
      mascotState: 'idle' as const,
      mascotMessage: "I only see hands, I promise! Nothing is saved.",
    },
    {
      title: "Two Ways to Play! 🎮",
      description: "You can use your magic hand powers OR use your finger on the screen like a regular game. Both work great! Pick what feels best for you.",
      emoji: '🎮',
      mascotState: 'happy' as const,
      mascotMessage: "Hand magic or finger touch—you choose!",
    },
    {
      title: "Ready to Rescue Letters? 🌟",
      description: "Allow camera access so Pip can see your hand and guide you to save the lost letters! Or play with touch—either way, you're a hero!",
      emoji: '🌟',
      mascotState: 'celebrating' as const,
      mascotMessage: "Let's go save some letters!",
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
    <div className='fixed inset-0 bg-gradient-to-br from-indigo-900/90 via-purple-900/90 to-pink-900/90 backdrop-blur-md flex items-center justify-center z-50 p-4'>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className='bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden border-4 border-yellow-300'
      >
        {/* Header with Progress */}
        <div className='bg-gradient-to-r from-orange-400 via-pink-500 to-purple-500 text-white p-6 relative'>
          <div className='flex items-center justify-between mb-4'>
            <div className='flex items-center gap-3'>
              <span className='text-4xl animate-bounce'>{step.emoji}</span>
              <h2 className='text-2xl md:text-3xl font-bold text-white drop-shadow-lg'>
                {step.title}
              </h2>
            </div>
            <button
              onClick={onDismiss}
              className='hover:bg-white/20 p-3 rounded-full transition min-h-[44px] min-w-[44px] flex items-center justify-center text-2xl'
              type='button'
              aria-label='Close'
            >
              ✕
            </button>
          </div>

          {/* Progress Bar */}
          <div className='w-full h-3 bg-white/30 rounded-full overflow-hidden'>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              className='h-full bg-white'
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
          <p className='text-sm mt-2 text-white/90 font-medium'>
            Step {currentStep + 1} of {steps.length}
          </p>
        </div>

        {/* Content */}
        <div className='p-6 md:p-8'>
          <AnimatePresence mode='wait'>
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className='space-y-6'
            >
              {/* Mascot with Speech Bubble */}
              <div className='flex flex-col items-center'>
                <Mascot
                  state={step.mascotState}
                  message={step.mascotMessage}
                  className='w-32 h-32 md:w-40 md:h-40'
                />
              </div>

              {/* Description Card */}
              <div className='bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200 rounded-2xl p-6 shadow-inner'>
                <p className='text-lg md:text-xl text-gray-700 leading-relaxed text-center font-medium'>
                  {step.description}
                </p>
              </div>

              {/* Visual Demo */}
              <div className='bg-white border-2 border-gray-200 rounded-xl p-4 shadow-sm'>
                {currentStep === 1 && (
                  <div className='flex justify-center gap-8 py-4'>
                    <div className='text-center'>
                      <div className='text-6xl mb-2'>☝️</div>
                      <p className='text-sm font-bold text-blue-600'>Point</p>
                      <p className='text-xs text-gray-500'>Finger moves</p>
                    </div>
                    <div className='text-center'>
                      <div className='text-6xl mb-2'>👌</div>
                      <p className='text-sm font-bold text-purple-600'>Pinch</p>
                      <p className='text-xs text-gray-500'>Thumb + finger</p>
                    </div>
                  </div>
                )}
                {currentStep === 2 && (
                  <div className='text-center py-4 space-y-3'>
                    <div className='flex items-center justify-center gap-3'>
                      <span className='text-3xl'>✅</span>
                      <p className='text-green-600 font-bold'>Pip sees: Your hand</p>
                    </div>
                    <div className="border-t border-gray-200"></div>
                    <div className='flex items-center justify-center gap-3'>
                      <span className='text-3xl'>❌</span>
                      <p className='text-red-500 font-bold line-through'>NOT saved or recorded</p>
                    </div>
                    <p className="text-sm text-gray-600 italic">Like a magic mirror for hands only!</p>
                  </div>
                )}
                {currentStep === 3 && (
                  <div className='grid grid-cols-2 gap-4 py-2'>
                    <div className='bg-gradient-to-br from-blue-100 to-blue-200 p-4 rounded-xl border-2 border-blue-300 text-center'>
                      <div className='text-4xl mb-2'>✋</div>
                      <p className='font-bold text-blue-700'>Hand Magic</p>
                      <p className='text-xs text-blue-600'>Move in the air!</p>
                    </div>
                    <div className='bg-gradient-to-br from-green-100 to-green-200 p-4 rounded-xl border-2 border-green-300 text-center'>
                      <div className='text-4xl mb-2'>👆</div>
                      <p className='font-bold text-green-700'>Touch Screen</p>
                      <p className='text-xs text-green-600'>Use your finger!</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Step Dots */}
          <div className='flex items-center justify-center gap-3 mt-6'>
            {steps.map((stepItem, idx) => (
              <motion.button
                key={stepItem.title}
                onClick={() => setCurrentStep(idx)}
                className={`h-3 rounded-full transition-all ${
                  idx === currentStep
                    ? 'bg-pink-500 w-8'
                    : 'bg-gray-300 w-3 hover:bg-gray-400'
                }`}
                type='button'
                aria-label={`Go to step ${idx + 1}`}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
              />
            ))}
          </div>
        </div>

        {/* Footer Buttons */}
        <div className='bg-gray-50 border-t border-gray-200 px-6 py-5 md:px-8 flex flex-wrap gap-3'>
          <button
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className='px-6 py-3 rounded-xl font-bold text-gray-700 bg-gray-200 hover:bg-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition min-h-[56px] text-base'
            type='button'
          >
            ← Back
          </button>

          <button
            onClick={onDismiss}
            className='flex-1 min-w-[120px] px-6 py-3 rounded-xl font-bold text-gray-700 bg-white border-2 border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition min-h-[56px] text-base'
            type='button'
          >
            Use Touch Instead
          </button>

          <motion.button
            onClick={handleNext}
            className='flex-1 min-w-[160px] px-6 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 transition shadow-lg min-h-[56px] text-base flex items-center justify-center gap-2'
            type='button'
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {currentStep === steps.length - 1 ? (
              <>
                <span>✨</span>
                <span>Let Pip See Me!</span>
              </>
            ) : (
              <>
                <span>Next</span>
                <span>→</span>
              </>
            )}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
