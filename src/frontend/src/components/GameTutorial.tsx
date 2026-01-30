import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X } from 'lucide-react';

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
      icon: <Hand className="w-12 h-12" />
    },
    {
      title: 'Pinch Your Fingers',
      description: 'Pinch your thumb and index finger together',
      icon: <HandHelping className="w-12 h-12" />
    },
    {
      title: 'Trace the Letter',
      description: 'Use your finger to trace the letter on the screen',
      icon: <PenTool className="w-12 h-12" />
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
            <h2 className="text-2xl font-bold mb-2 text-orange-500">
              How to Play
            </h2>
            <div className="space-y-8">
              <div className="mb-4">
                <div className="flex items-center justify-center mb-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 ${currentStep === 0 ? 'bg-orange-500 text-white' : 'bg-orange-100 text-orange-400'}`}>
                    <span className="text-xl font-bold">{currentStep + 1}</span>
                  </div>
                  <div className="text-gray-600">
                    {currentStep > 0 && <span className="text-orange-500 mr-2">Step {currentStep}</span>}
                    {steps[currentStep].title}
                  </div>
                </div>
                <p className="text-gray-700 text-lg leading-relaxed">
                  {steps[currentStep].description}
                </p>
                <div className="flex items-center justify-center mb-4">
                  <div className="text-orange-500">
                    {steps[currentStep].icon}
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center gap-4">
                <button
                  onClick={handleSkip}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 font-semibold transition"
                >
                  Skip
                </button>
                <button
                  onClick={handleNext}
                  className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold transition"
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
