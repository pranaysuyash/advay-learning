import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UIIcon } from './ui/Icon';

interface GameTutorialProps {
  onComplete: () => void;
  onSkip: () => void;
}

export function GameTutorial({ onComplete, onSkip }: GameTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: 'Show Your Hands',
      description: 'Hold your hands up so the camera can see them',
      icon: <UIIcon name="hand" size={48} className="w-12 h-12" />
    },
    {
      title: 'Pinch Your Fingers',
      description: 'Pinch your thumb and index finger together',
      icon: <UIIcon name="hand" size={48} className="w-12 h-12" />
    },
    {
      title: 'Trace the Letter',
      description: 'Use your finger to trace the letter on the screen',
      icon: <UIIcon name="pencil" size={48} className="w-12 h-12" />
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onSkip();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-2xl p-8 max-w-md mx-4 shadow-2xl"
        >
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2 text-brand-primary">
              How to Play
            </h2>
            <div className="space-y-8">
              <div className="mb-4">
                <div className="flex items-center justify-center mb-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 ${currentStep === 0 ? 'bg-brand-primary text-white' : 'bg-brand-accent text-brand-primary'}`}>
                    <span className="text-xl font-bold">{currentStep + 1}</span>
                  </div>
                  <div className="text-text-secondary">
                    {currentStep > 0 && <span className="text-brand-primary mr-2">Step {currentStep}</span>}
                    {steps[currentStep].title}
                  </div>
                </div>
                <p className="text-text-primary text-lg leading-relaxed">
                  {steps[currentStep].description}
                </p>
                <div className="flex items-center justify-center mb-4">
                  <div className="text-brand-primary">
                    {steps[currentStep].icon}
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center gap-4">
                <button
                  onClick={handleSkip}
                  className="px-4 py-2 text-text-secondary hover:text-text-primary font-semibold transition"
                >
                  Skip
                </button>
                <button
                  onClick={handleNext}
                  className="px-6 py-2 bg-brand-primary hover:bg-brand-primary-hover text-white rounded-lg font-semibold transition"
                >
                  {currentStep === steps.length - 1 ? 'Start Playing' : 'Next'}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
