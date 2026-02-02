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
          r="15"
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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.3 }}
        className="bg-bg-secondary border border-border rounded-2xl p-8 max-w-md mx-4 shadow-2xl text-center"
      >
        <motion.div
          className="mb-6"
          animate={{
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <AnimatedHand className="w-48 h-48 mx-auto" />
        </motion.div>

        <h2 className="text-2xl font-bold text-text-primary mb-3">
          Trace with Your Finger!
        </h2>
        <p className="text-text-secondary mb-6 text-lg">
          Watch the hand and trace the letter with your finger.
        </p>

        <motion.button
          onClick={onComplete}
          className="px-8 py-3 bg-brand-primary hover:bg-brand-primary-hover text-white rounded-xl font-semibold transition"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          animate={{
            boxShadow: [
              '0 0 0 0 rgba(196, 90, 61, 0)',
              '0 0 0 10px rgba(196, 90, 61, 0.2)',
              '0 0 0 20px rgba(196, 90, 61, 0)',
            ],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
        >
          Let's Trace!
        </motion.button>

        <p className="text-text-muted text-sm mt-4">
          Pinch your thumb and index finger together to draw
        </p>
      </motion.div>
    </div>
  );
}
