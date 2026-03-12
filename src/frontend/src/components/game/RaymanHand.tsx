/**
 * Rayman-Style Animated Hand Cursor
 * 
 * A floating, disconnected hand with smooth animations.
 * Inspired by Rayman games - whimsical, expressive, and responsive.
 * 
 * Features:
 * - Idle floating animation (gentle bobbing)
 * - Pinch animation (fingers close together)
 * - Grab animation (fist formation)
 * - Point animation (index finger extended)
 * - Smooth state transitions
 * 
 * @example
 * <RaymanHand 
 *   position={{ x: 100, y: 200 }} 
 *   state="idle"
 *   isPinching={false}
 * />
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useMemo, type RefObject } from 'react';

export type HandState = 'idle' | 'pointing' | 'pinching' | 'grabbing' | 'success';

interface RaymanHandProps {
  /** Position in viewport or normalized coordinates */
  position: { x: number; y: number };
  /** Coordinate space for position */
  coordinateSpace?: 'viewport' | 'normalized';
  /** Container reference for normalized coordinates */
  containerRef?: RefObject<HTMLElement | null>;
  /** Current hand state */
  state?: HandState;
  /** Whether user is pinching */
  isPinching?: boolean;
  /** Whether hand is detected */
  isHandDetected?: boolean;
  /** Size in pixels */
  size?: number;
  /** Color variant */
  color?: 'yellow' | 'green' | 'blue' | 'pink';
  /** Show shadow/glow effect */
  showGlow?: boolean;
  /** High contrast mode */
  highContrast?: boolean;
  /** Z-index for layering */
  zIndex?: number;
}

const HAND_COLORS = {
  yellow: { main: '#FCD34D', shadow: '#F59E0B', glow: 'rgba(251, 191, 36, 0.6)' },
  green: { main: '#86EFAC', shadow: '#22C55E', glow: 'rgba(34, 197, 94, 0.6)' },
  blue: { main: '#93C5FD', shadow: '#3B82F6', glow: 'rgba(59, 130, 246, 0.6)' },
  pink: { main: '#F9A8D4', shadow: '#EC4899', glow: 'rgba(236, 72, 153, 0.6)' },
};

export function RaymanHand({
  position,
  coordinateSpace = 'viewport',
  containerRef,
  state = 'idle',
  isPinching = false,
  isHandDetected = true,
  size = 80,
  color = 'yellow',
  showGlow = true,
  highContrast = false,
  zIndex = 9999,
}: RaymanHandProps) {
  const resolvedPosition = useMemo(() => {
    if (coordinateSpace === 'normalized') {
      const rect = containerRef?.current?.getBoundingClientRect();
      if (rect) {
        return {
          x: rect.left + position.x * rect.width,
          y: rect.top + position.y * rect.height,
        };
      }
    }
    return position;
  }, [containerRef, coordinateSpace, position]);

  if (!isHandDetected) return null;

  const colors = HAND_COLORS[color];
  const effectiveState: HandState = state === 'idle' && isPinching ? 'pinching' : state;
  const handSize = Math.max(64, size);
  
  // High contrast overrides
  const mainColor = highContrast ? '#FFEB3B' : colors.main;
  const shadowColor = highContrast ? '#000000' : colors.shadow;
  const glowColor = highContrast ? 'rgba(255, 235, 59, 0.8)' : colors.glow;

  return (
    <motion.div
      data-testid="rayman-hand-cursor"
      style={{
        position: 'fixed',
        left: resolvedPosition.x - handSize / 2,
        top: resolvedPosition.y - handSize / 2,
        width: handSize,
        height: handSize,
        pointerEvents: 'none',
        zIndex,
      }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{
        scale: 1,
        opacity: 1,
        y: effectiveState === 'idle' ? [0, -8, 0] : 0,
      }}
      transition={{
        scale: { type: 'spring', stiffness: 400, damping: 20 },
        opacity: { duration: 0.2 },
        y: { duration: 1.5, repeat: effectiveState === 'idle' ? Infinity : 0, ease: 'easeInOut' },
      }}
    >
      {/* Glow effect */}
      {showGlow && (
        <motion.div
          style={{
            position: 'absolute',
            inset: -10,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${glowColor} 0%, transparent 70%)`,
            filter: 'blur(8px)',
          }}
          animate={{
            scale: effectiveState === 'pinching' ? [1, 1.2, 1] : [1, 1.1, 1],
            opacity: effectiveState === 'pinching' ? 1 : 0.7,
          }}
          transition={{
            duration: effectiveState === 'pinching' ? 0.3 : 1,
            repeat: effectiveState === 'pinching' ? 0 : Infinity,
          }}
        />
      )}

      {/* Hand SVG */}
      <svg
        width={handSize}
        height={handSize}
        viewBox="0 0 100 100"
        fill="none"
        style={{
          filter: `drop-shadow(0 4px 8px ${shadowColor}40)`,
        }}
      >
        <AnimatePresence mode="wait">
          {/* IDLE STATE - Open hand, relaxed */}
          {effectiveState === 'idle' && (
            <motion.g
              key="idle"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
            >
              {/* Palm */}
              <ellipse cx="50" cy="60" rx="22" ry="28" fill={mainColor} stroke={shadowColor} strokeWidth="3" />
              {/* Fingers - relaxed, slightly spread */}
              <rect x="32" y="20" width="10" height="25" rx="5" fill={mainColor} stroke={shadowColor} strokeWidth="2" transform="rotate(-15 37 32)" />
              <rect x="45" y="15" width="10" height="30" rx="5" fill={mainColor} stroke={shadowColor} strokeWidth="2" />
              <rect x="58" y="18" width="10" height="28" rx="5" fill={mainColor} stroke={shadowColor} strokeWidth="2" transform="rotate(10 63 32)" />
              <rect x="28" y="45" width="10" height="20" rx="5" fill={mainColor} stroke={shadowColor} strokeWidth="2" transform="rotate(-30 33 55)" />
            </motion.g>
          )}

          {/* POINTING STATE - Index finger extended */}
          {effectiveState === 'pointing' && (
            <motion.g
              key="pointing"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
            >
              {/* Palm */}
              <ellipse cx="50" cy="65" rx="20" ry="24" fill={mainColor} stroke={shadowColor} strokeWidth="3" />
              {/* Index finger - extended up */}
              <rect x="45" y="5" width="10" height="40" rx="5" fill={mainColor} stroke={shadowColor} strokeWidth="2" />
              {/* Other fingers - curled */}
              <ellipse cx="32" cy="60" rx="6" ry="10" fill={mainColor} stroke={shadowColor} strokeWidth="2" />
              <ellipse cx="68" cy="58" rx="6" ry="10" fill={mainColor} stroke={shadowColor} strokeWidth="2" />
              <ellipse cx="28" cy="68" rx="6" ry="8" fill={mainColor} stroke={shadowColor} strokeWidth="2" />
            </motion.g>
          )}

          {/* PINCHING STATE - Thumb and index close together */}
          {effectiveState === 'pinching' && (
            <motion.g
              key="pinching"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.15 }}
            >
              {/* Palm - smaller, more compact */}
              <ellipse cx="50" cy="70" rx="18" ry="22" fill={mainColor} stroke={shadowColor} strokeWidth="3" />
              {/* Index finger - curved down */}
              <path
                d="M 45 50 Q 45 30 48 25 Q 52 20 55 30"
                stroke={shadowColor}
                strokeWidth="8"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d="M 45 50 Q 45 30 48 25 Q 52 20 55 30"
                stroke={mainColor}
                strokeWidth="6"
                strokeLinecap="round"
                fill="none"
              />
              {/* Thumb - curved up to meet index */}
              <path
                d="M 35 65 Q 40 45 48 32"
                stroke={shadowColor}
                strokeWidth="8"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d="M 35 65 Q 40 45 48 32"
                stroke={mainColor}
                strokeWidth="6"
                strokeLinecap="round"
                fill="none"
              />
              {/* Pinch indicator dot */}
              <circle cx="50" cy="28" r="6" fill="#22C55E" opacity="0.8">
                <animate attributeName="r" values="4;8;4" dur="0.6s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="1;0.3;1" dur="0.6s" repeatCount="indefinite" />
              </circle>
            </motion.g>
          )}

          {/* GRABBING STATE - Fist */}
          {effectiveState === 'grabbing' && (
            <motion.g
              key="grabbing"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
            >
              {/* Fist - compact rounded shape */}
              <circle cx="50" cy="55" r="28" fill={mainColor} stroke={shadowColor} strokeWidth="3" />
              {/* Finger lines to show curled fingers */}
              <path d="M 35 45 Q 40 40 50 42" stroke={shadowColor} strokeWidth="2" fill="none" opacity="0.5" />
              <path d="M 32 52 Q 40 48 48 50" stroke={shadowColor} strokeWidth="2" fill="none" opacity="0.5" />
              <path d="M 32 60 Q 40 56 48 58" stroke={shadowColor} strokeWidth="2" fill="none" opacity="0.5" />
              {/* Thumb wrapped around */}
              <ellipse cx="42" cy="65" rx="10" ry="6" fill={mainColor} stroke={shadowColor} strokeWidth="2" transform="rotate(-30 42 65)" />
            </motion.g>
          )}

          {/* SUCCESS STATE - Open hand with sparkles */}
          {effectiveState === 'success' && (
            <motion.g
              key="success"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: [1, 1.2, 1] }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.5 }}
            >
              {/* Palm */}
              <ellipse cx="50" cy="60" rx="22" ry="28" fill={mainColor} stroke={shadowColor} strokeWidth="3" />
              {/* Fingers spread in celebration */}
              <rect x="25" y="25" width="10" height="28" rx="5" fill={mainColor} stroke={shadowColor} strokeWidth="2" transform="rotate(-25 30 39)" />
              <rect x="40" y="15" width="10" height="35" rx="5" fill={mainColor} stroke={shadowColor} strokeWidth="2" />
              <rect x="55" y="18" width="10" height="32" rx="5" fill={mainColor} stroke={shadowColor} strokeWidth="2" transform="rotate(15 60 34)" />
              <rect x="68" y="35" width="10" height="25" rx="5" fill={mainColor} stroke={shadowColor} strokeWidth="2" transform="rotate(35 73 47)" />
              {/* Sparkles */}
              <motion.circle cx="20" cy="30" r="4" fill="#34D399" 
                animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }} 
                transition={{ duration: 0.8, repeat: Infinity }} />
              <motion.circle cx="80" cy="25" r="3" fill="#FBBF24" 
                animate={{ scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }} 
                transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }} />
              <motion.circle cx="85" cy="70" r="3" fill="#60A5FA" 
                animate={{ scale: [1, 1.4, 1], opacity: [1, 0.5, 1] }} 
                transition={{ duration: 0.7, repeat: Infinity, delay: 0.4 }} />
            </motion.g>
          )}
        </AnimatePresence>
      </svg>

      {/* State label for debugging (optional) */}
      {process.env.NODE_ENV === 'development' && (
        <div
          style={{
            position: 'absolute',
            top: -20,
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: 10,
            color: shadowColor,
            fontWeight: 'bold',
            whiteSpace: 'nowrap',
          }}
        >
          {effectiveState}
        </div>
      )}
    </motion.div>
  );
}

export default RaymanHand;
