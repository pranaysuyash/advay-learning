import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

/**
 * SuccessAnimation - Celebration effects for successful actions
 *
 * CRITICAL FIXES FROM AUDIT:
 * - Immediate feedback <100ms after action (Issue FB-001)
 * - Visual celebration (particles, animations, confetti)
 * - Sound effects integration
 * - Character celebration animations
 * - Feedback persistence 2-3 seconds (toddler cognitive processing)
 * - Customizable celebration styles
 *
 * Issue References: FB-001 from EMOJI_MATCH_COMPREHENSIVE_VIDEO_AUDIT_COLLATION_2026-02-20.md
 */

interface SuccessAnimationProps {
  /** Whether to show the celebration */
  show: boolean;

  /** Type of celebration */
  type?: 'default' | 'confetti' | 'stars' | 'hearts' | 'fireworks';

  /** Custom message to display */
  message?: string;

  /** Duration in milliseconds (default: 2500ms) */
  duration?: number;

  /** Callback when animation completes */
  onComplete?: () => void;

  /** Particle count (default: 50) */
  particleCount?: number;

  /** Sound effect name to play (optional) */
  soundEffect?: string;

  /** Show character celebration (default: true) */
  showCharacter?: boolean;

  /** Custom character emoji (default: '🎉') */
  characterEmoji?: string;
}

interface Particle {
  id: string;
  x: number;
  y: number;
  angle: number;
  velocity: number;
  color: string;
  size: number;
  emoji?: string;
}

export function SuccessAnimation({
  show,
  type = 'default',
  message = 'Amazing!',
  duration = 2500, // MANDATORY: 2-3 seconds persistence
  onComplete,
  particleCount = 50,
  soundEffect,
  showCharacter = true,
  characterEmoji = '🎉',
}: SuccessAnimationProps) {
  const [particles, setParticles] = useState<Particle[]>([]);

  // Generate particles when shown
  useEffect(() => {
    if (show) {
      const newParticles = generateParticles(particleCount, type);
      setParticles(newParticles);

      // Play sound effect if provided
      if (soundEffect) {
        const audio = new Audio(soundEffect);
        audio.volume = 0.8;
        audio.play().catch(console.error);
      }

      // Auto-hide after duration
      const timer = setTimeout(() => {
        setParticles([]);
        if (onComplete) {
          onComplete();
        }
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [show, particleCount, type, soundEffect, duration, onComplete]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className='fixed inset-0 z-50 pointer-events-none flex items-center justify-center'
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Particles */}
          {particles.map((particle) => (
            <Particle key={particle.id} {...particle} duration={duration} />
          ))}

          {/* Message */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{
              type: 'spring',
              stiffness: 200,
              damping: 15,
            }}
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '24px',
              padding: '32px 48px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
              textAlign: 'center',
              border: '4px solid #FFD700',
            }}
          >
            {/* Character celebration */}
            {showCharacter && (
              <motion.div
                style={{
                  fontSize: '80px',
                  marginBottom: '16px',
                }}
                animate={{
                  rotate: [0, -10, 10, -10, 0],
                  scale: [1, 1.1, 1.1, 1.1, 1],
                }}
                transition={{
                  duration: 0.5,
                  repeat: Math.floor(duration / 500),
                }}
              >
                {characterEmoji}
              </motion.div>
            )}

            {/* Message text */}
            <h2
              style={{
                fontSize: '48px',
                fontWeight: 'bold',
                color: '#000000',
                margin: 0,
                // MANDATORY: 7:1 contrast ratio
                textShadow: '2px 2px 4px rgba(255, 215, 0, 0.3)',
              }}
            >
              {message}
            </h2>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Individual animated particle component
 */
function Particle({
  x,
  y,
  angle,
  velocity,
  color,
  size,
  emoji,
  duration,
}: Particle & { duration: number }) {
  // Calculate end position
  const distance = velocity * (duration / 1000);
  const endX = x + Math.cos(angle) * distance;
  const endY = y + Math.sin(angle) * distance - 100; // Add upward bias (gravity)

  return (
    <motion.div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: size,
        height: size,
        backgroundColor: emoji ? 'transparent' : color,
        borderRadius: '50%',
        fontSize: emoji ? size : undefined,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',
      }}
      initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
      animate={{
        x: endX - x,
        y: endY - y,
        opacity: 0,
        scale: 1,
        rotate: emoji ? 360 : 0,
      }}
      transition={{
        duration: duration / 1000,
        ease: 'easeOut',
      }}
    >
      {emoji}
    </motion.div>
  );
}

/**
 * Generate particles based on celebration type
 */
function generateParticles(count: number, type: string): Particle[] {
  const particles: Particle[] = [];
  const centerX = window.innerWidth / 2;
  const centerY = window.innerHeight / 2;

  const configs: Record<string, { colors: string[], emoji?: string, extraVelocity?: boolean }> = {
    default: {
      colors: ['#FFD700', '#FFA500', '#FF6B6B', '#4ECDC4', '#45B7D1'],
    },
    confetti: {
      colors: [
        '#FF6B6B',
        '#4ECDC4',
        '#45B7D1',
        '#FFA500',
        '#FFD700',
        '#95E1D3',
      ],
    },
    stars: { emoji: '⭐', colors: ['#FFD700'] },
    hearts: { emoji: '❤️', colors: ['#FF6B6B'] },
    fireworks: {
      colors: ['#FF6B6B', '#FFD700', '#4ECDC4', '#FFA500'],
      extraVelocity: true,
    },
  };

  const config = configs[type as keyof typeof configs] || configs.default;

  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
    const velocity = config.extraVelocity
      ? 200 + Math.random() * 300
      : 100 + Math.random() * 200;

    particles.push({
      id: `particle-${i}-${Date.now()}`,
      x: centerX,
      y: centerY,
      angle,
      velocity,
      color: config.colors[Math.floor(Math.random() * config.colors.length)],
      size: config.emoji ? 40 + Math.random() * 20 : 10 + Math.random() * 15,
      emoji: config.emoji,
    });
  }

  return particles;
}

/**
 * FailureAnimation - Gentle error feedback (no harsh visuals/sounds)
 *
 * CRITICAL FIXES FROM AUDIT:
 * - Gentle shake animation (not scary red X)
 * - Encouraging voice ("Try again!")
 * - No score penalties
 * - Soft colors and animations
 *
 * Issue References: FB-001 from EMOJI_MATCH_COMPREHENSIVE_VIDEO_AUDIT_COLLATION_2026-02-20.md
 */

interface FailureAnimationProps {
  /** Whether to show the feedback */
  show: boolean;

  /** Custom message (default: "Try again!") */
  message?: string;

  /** Target element to shake (ref) */
  targetRef?: React.RefObject<HTMLElement>;

  /** Callback when animation completes */
  onComplete?: () => void;

  /** Sound effect name (default: gentle boing) */
  soundEffect?: string;
}

export function FailureAnimation({
  show,
  message = 'Not quite! Try again!',
  targetRef,
  onComplete,
  soundEffect = '/sounds/gentle-try-again.mp3',
}: FailureAnimationProps) {
  useEffect(() => {
    if (show) {
      // Play gentle sound
      if (soundEffect) {
        const audio = new Audio(soundEffect);
        audio.volume = 0.5; // Softer than success sound
        audio.play().catch(console.error);
      }

      // Shake target element if provided
      if (targetRef?.current) {
        targetRef.current.style.animation = 'gentle-shake 0.3s ease-in-out';
        setTimeout(() => {
          if (targetRef.current) {
            targetRef.current.style.animation = '';
          }
        }, 300);
      }

      // Auto-complete after shake
      const timer = setTimeout(() => {
        if (onComplete) {
          onComplete();
        }
      }, 800);

      return () => clearTimeout(timer);
    }
  }, [show, targetRef, soundEffect, onComplete]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className='fixed top-1/4 left-1/2 transform -translate-x-1/2 z-50 pointer-events-none'
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
        >
          <div
            style={{
              backgroundColor: '#FFF9E6',
              borderRadius: '16px',
              padding: '16px 32px',
              border: '3px solid #FFC107',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
            }}
          >
            <p
              style={{
                fontSize: '24px',
                fontWeight: 'bold',
                color: '#856404',
                margin: 0,
                textAlign: 'center',
              }}
            >
              {message}
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * CSS Animation for gentle shake (add to your styles)
 */
export const shakeAnimationCSS = `
@keyframes gentle-shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}
`;

/**
 * Usage Example:
 *
 * ```tsx
 * function MyGame() {
 *   const [showSuccess, setShowSuccess] = useState(false);
 *   const [showFailure, setShowFailure] = useState(false);
 *   const targetRef = useRef<HTMLDivElement>(null);
 *
 *   function onCorrectMatch() {
 *     setShowSuccess(true);
 *     playSound('success-chime.mp3');
 *     speak("Amazing! You found it!");
 *   }
 *
 *   function onIncorrectAttempt() {
 *     setShowFailure(true);
 *     speak("Try again!");
 *   }
 *
 *   return (
 *     <div>
 *       <div ref={targetRef}>Target Element</div>
 *
 *       <SuccessAnimation
 *         show={showSuccess}
 *         type="confetti"
 *         message="Perfect!"
 *         onComplete={() => setShowSuccess(false)}
 *       />
 *
 *       <FailureAnimation
 *         show={showFailure}
 *         targetRef={targetRef}
 *         onComplete={() => setShowFailure(false)}
 *       />
 *     </div>
 *   );
 * }
 * ```
 *
 * Testing Requirements:
 * - [ ] Success feedback appears <100ms after action (frame analysis)
 * - [ ] Visual feedback persists 2-3 seconds
 * - [ ] Sound effects tested with target age group
 * - [ ] 95% of toddlers smile/show positive emotion after success
 * - [ ] Zero fear/frustration after failure feedback
 * - [ ] Particles don't cause performance issues (60fps maintained)
 */
