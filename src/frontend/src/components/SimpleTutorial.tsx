import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UIIcon } from './ui/Icon';
import { VoiceButton } from './ui/VoiceButton';

interface SimpleTutorialProps {
  onComplete: () => void;
  onSkip: () => void;
  mode: 'camera' | 'touch';
}

export function SimpleTutorial({ onComplete, onSkip, mode }: SimpleTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const cameraSteps = [
    {
      title: 'Wave Hello! 👋',
      description: 'Hold your hand up so the camera can see it. Wave to say hello!',
      icon: '👋',
      color: 'from-orange-400 to-pink-500',
    },
    {
      title: 'Pinch to Grab 👌',
      description: 'Pinch your thumb and index finger together to pick things up!',
      icon: '👌',
      color: 'from-green-400 to-emerald-500',
    },
  ];

  const touchSteps = [
    {
      title: 'Use Your Finger 👆',
      description: 'Touch and drag on the screen to draw and play!',
      icon: '👆',
      color: 'from-blue-400 to-indigo-500',
    },
    {
      title: 'Tap to Select ✨',
      description: 'Tap buttons and objects to interact with them!',
      icon: '✨',
      color: 'from-purple-400 to-pink-500',
    },
  ];

  const steps = mode === 'camera' ? cameraSteps : touchSteps;
  const currentStepData = steps[currentStep];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  return (
    <div className='fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50'>
      <AnimatePresence mode='wait'>
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, scale: 0.9, x: 50 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          exit={{ opacity: 0, scale: 0.9, x: -50 }}
          transition={{ duration: 0.3 }}
          className='bg-white rounded-3xl p-6 md:p-8 max-w-md mx-4 shadow-2xl'
        >
          {/* Progress Dots */}
          <div className='flex justify-center gap-2 mb-6'>
            {steps.map((_, idx) => (
              <div
                key={idx}
                className={`w-3 h-3 rounded-full transition-all ${
                  idx === currentStep
                    ? 'bg-brand-primary w-6'
                    : idx < currentStep
                    ? 'bg-brand-primary'
                    : 'bg-slate-200'
                }`}
              />
            ))}
          </div>

          {/* Content */}
          <div className='text-center'>
            {/* Icon */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
              className={`w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br ${currentStepData.color} flex items-center justify-center text-5xl shadow-lg`}
            >
              {currentStepData.icon}
            </motion.div>

            {/* Title */}
            <h2 className='text-2xl md:text-3xl font-bold text-slate-800 mb-3'>
              {currentStepData.title}
            </h2>

            {/* Description */}
            <p className='text-slate-600 text-lg leading-relaxed mb-4'>
              {currentStepData.description}
            </p>

            {/* Voice Button */}
            <div className='mb-6'>
              <VoiceButton
                text={`${currentStepData.title}. ${currentStepData.description}`}
                label='🔊 Listen'
                size='md'
                variant='secondary'
                autoPlay={true}
              />
            </div>

            {/* Mode Badge */}
            <div className='mb-6'>
              <span
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
                  mode === 'camera'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-blue-100 text-blue-700'
                }`}
              >
                <UIIcon name={mode === 'camera' ? 'camera' : 'hand'} size={16} />
                {mode === 'camera' ? 'Camera Mode' : 'Touch Mode'}
              </span>
            </div>
          </div>

          {/* Buttons */}
          <div className='flex justify-between items-center gap-4'>
            <button
              onClick={onSkip}
              className='px-4 py-2 text-slate-400 hover:text-slate-600 font-medium transition'
            >
              Skip
            </button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleNext}
              className='px-8 py-3 bg-brand-primary hover:bg-brand-primary-hover text-white rounded-xl font-bold text-lg shadow-lg transition flex items-center gap-2'
            >
              {currentStep === steps.length - 1 ? (
                <>
                  Start Playing! 🎮
                </>
              ) : (
                <>
                  Next
                  <UIIcon name='arrow-right' size={20} />
                </>
              )}
            </motion.button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
