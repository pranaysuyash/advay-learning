import { motion } from 'framer-motion';

interface AnimatedHandProps {
  className?: string;
}

export function AnimatedHand({ className = '' }: AnimatedHandProps) {
  const handPath = "M30,120 C30,100 40,80 60,80 C80,80 90,100 90,120 L90,180 C90,200 70,220 50,220 C30,220 10,200 10,180 L10,120 C10,100 20,80 40,80";

  return (
    <div className={`relative ${className}`}>
      <svg
        viewBox="0 0 200 250"
        className="w-full h-full"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <motion.g
          animate={{
            x: [0, 50, 100, 50, 0],
            y: [0, -30, 0, -30, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            repeatType: 'loop',
            ease: 'easeInOut',
          }}
        >
          <motion.path
            d={handPath}
            fill="#FCD34D"
            stroke="#F59E0B"
            strokeWidth="3"
            animate={{
              rotate: [0, -5, 5, 0],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          <circle cx="40" cy="85" r="4" fill="#78350F" />
          <motion.path
            d="M40,95 Q45,100 40,105 Q35,100 40,95"
            stroke="#78350F"
            strokeWidth="2"
            strokeLinecap="round"
            animate={{
              d: [
                'M40,95 Q45,100 40,105 Q35,100 40,95',
                'M40,95 Q45,100 40,108 Q35,100 40,95',
                'M40,95 Q45,100 40,105 Q35,100 40,95',
              ],
            }}
            transition={{
              duration: 0.5,
              repeat: Infinity,
              repeatType: 'mirror',
            }}
          />
        </motion.g>
        <motion.circle
          cx="40"
          cy="85"
          r={15}
          fill="none"
          stroke="#6B9BD2"
          strokeWidth="2"
          strokeDasharray="5 3"
          animate={{
            r: [15, 20, 15],
            opacity: [0.5, 0.2, 0.5],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </svg>
      <motion.div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-8 bg-pip-orange/20 rounded-full blur-md"
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </div>
  );
}

interface HandTutorialOverlayProps {
  isOpen: boolean;
  onComplete: () => void;
}

export function HandTutorialOverlay({ isOpen, onComplete }: HandTutorialOverlayProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40 max-w-sm mx-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.3 }}
        className="bg-white/95 backdrop-blur-md border-2 border-brand-primary/30 rounded-2xl p-4 shadow-xl"
      >
        <div className="flex items-center gap-4">
          {/* Animated hand icon */}
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="w-16 h-16 bg-brand-primary/10 rounded-xl flex items-center justify-center flex-shrink-0"
          >
            <span className="text-3xl">👆</span>
          </motion.div>

          <div className="flex-1">
            <h3 className="font-bold text-text-primary text-lg leading-tight">
              Pinch to draw, release to stop
            </h3>
            <p className="text-text-secondary text-sm mt-1">
              Touch thumb & index finger together
            </p>
          </div>

          <button
            onClick={onComplete}
            className="px-3 py-1.5 bg-brand-primary hover:bg-brand-primary-hover text-white rounded-lg font-semibold text-sm transition flex-shrink-0"
          >
            Got it
          </button>
        </div>
      </motion.div>
    </div>
  );
}
