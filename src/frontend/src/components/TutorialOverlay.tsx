import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSettingsStore } from '../store';

interface TutorialOverlayProps {
  onDismiss?: () => void;
}

export function TutorialOverlay({ onDismiss }: TutorialOverlayProps) {
  const { tutorialCompleted, updateSettings } = useSettingsStore();
  const [visible, setVisible] = useState(!tutorialCompleted);

  const handleDismiss = useCallback(() => {
    setVisible(false);
    updateSettings({ tutorialCompleted: true });
    onDismiss?.();
  }, [updateSettings, onDismiss]);

  useEffect(() => {
    if (tutorialCompleted) {
      setVisible(false);
    }
  }, [tutorialCompleted]);

  if (!visible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50"
        onClick={handleDismiss}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className="bg-slate-800 rounded-3xl p-8 max-w-sm mx-4 text-center shadow-2xl border border-slate-700"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mb-6">
            <div className="relative w-32 h-32 mx-auto">
              <motion.div
                className="absolute inset-0 flex items-center justify-center"
                animate={{
                  scale: [1, 0.85, 1],
                }}
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                <svg
                  viewBox="0 0 100 100"
                  className="w-full h-full"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <motion.g
                    animate={{
                      rotate: [0, -5, 5, 0],
                    }}
                    transition={{
                      duration: 1.2,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  >
                    <path
                      d="M50 20c-8 0-14 6-14 14v20c0 8 6 14 14 14s14-6 14-14V34c0-8-6-14-14-14z"
                      fill="#FCD34D"
                      stroke="#F59E0B"
                      strokeWidth="2"
                    />
                    <circle cx="44" cy="38" r="3" fill="#78350F" />
                    <circle cx="56" cy="38" r="3" fill="#78350F" />
                    <path
                      d="M45 48c2.5 3 7.5 3 10 0"
                      stroke="#78350F"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <motion.g
                      animate={{
                        y: [0, -8, 0],
                        rotate: [0, 10, 0],
                      }}
                      transition={{
                        duration: 1.2,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                    >
                      <path
                        d="M30 55c-5 5-8 12-8 18 0 3 1 5 3 5h10c2 0 3-2 3-5 0-6-3-13-8-18z"
                        fill="#FCD34D"
                        stroke="#F59E0B"
                        strokeWidth="2"
                      />
                    </motion.g>
                    <motion.g
                      animate={{
                        y: [0, -8, 0],
                        rotate: [0, -10, 0],
                      }}
                      transition={{
                        duration: 1.2,
                        repeat: Infinity,
                        ease: 'easeInOut',
                        delay: 0.1,
                      }}
                    >
                      <path
                        d="M70 55c5 5 8 12 8 18 0 3-1 5-3 5H65c-2 0-3-2-3-5 0-6 3-13 8-18z"
                        fill="#FCD34D"
                        stroke="#F59E0B"
                        strokeWidth="2"
                      />
                    </motion.g>
                  </motion.g>
                </svg>
              </motion.div>
              <motion.div
                className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-2 bg-orange-400/30 rounded-full blur-sm"
                animate={{
                  scaleX: [1, 0.7, 1],
                  opacity: [0.3, 0.5, 0.3],
                }}
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-white mb-2">Pinch to Draw!</h2>
          <p className="text-slate-300 mb-6">
            Touch your thumb and index finger together to start drawing letters
          </p>

          <motion.div
            className="flex items-center justify-center gap-2 text-orange-400 mb-6"
            animate={{
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <span className="text-2xl">👆</span>
            <span className="text-xl font-bold">+</span>
            <span className="text-2xl">👍</span>
            <span className="text-xl font-bold">=</span>
            <span className="text-2xl">✨</span>
          </motion.div>

          <button
            onClick={handleDismiss}
            className="w-full px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-semibold transition shadow-lg"
          >
            Got it!
          </button>

          <p className="text-slate-500 text-sm mt-4">
            Tap anywhere to dismiss
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
