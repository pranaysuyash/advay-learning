/**
 * Kenney-Style Pixel Art Hand Cursor
 * 
 * A sprite-based hand cursor using Kenney platformer aesthetic.
 * Features smooth animations and clear visual feedback.
 * 
 * @example
 * <KenneyHandCursor 
 *   position={{ x: 100, y: 200 }} 
 *   state="pointing"
 *   isPinching={true}
 * />
 */

import { motion } from 'framer-motion';
import { useMemo, type RefObject } from 'react';

export type HandCursorState = 'idle' | 'point' | 'pinch' | 'grab' | 'open';

interface KenneyHandCursorProps {
  /** Position in viewport or normalized coordinates */
  position: { x: number; y: number };
  /** Coordinate space */
  coordinateSpace?: 'viewport' | 'normalized';
  /** Container for normalized coordinates */
  containerRef?: RefObject<HTMLElement | null>;
  /** Current cursor state */
  state?: HandCursorState;
  /** Is user pinching */
  isPinching?: boolean;
  /** Is hand detected */
  isHandDetected?: boolean;
  /** Size in pixels */
  size?: number;
  /** Color theme */
  color?: 'yellow' | 'green' | 'blue' | 'pink' | 'orange';
  /** Show trail effect */
  showTrail?: boolean;
  /** Z-index */
  zIndex?: number;
}

const THEME_COLORS = {
  yellow: { primary: '#FCD34D', secondary: '#F59E0B', glow: 'rgba(251, 191, 36, 0.5)' },
  green: { primary: '#86EFAC', secondary: '#22C55E', glow: 'rgba(34, 197, 94, 0.5)' },
  blue: { primary: '#93C5FD', secondary: '#3B82F6', glow: 'rgba(59, 130, 246, 0.5)' },
  pink: { primary: '#F9A8D4', secondary: '#EC4899', glow: 'rgba(236, 72, 153, 0.5)' },
  orange: { primary: '#FDBA74', secondary: '#F97316', glow: 'rgba(249, 115, 22, 0.5)' },
};

/**
 * Pixel-art style hand using CSS box-shadow technique
 * Creates a retro, Kenney-style aesthetic
 */
function PixelHand({ 
  state, 
  color, 
  size 
}: { 
  state: HandCursorState; 
  color: typeof THEME_COLORS['yellow']; 
  size: number;
}) {
  const pixelSize = size / 16;
  
  // Pixel art patterns for each state
  const patterns: Record<HandCursorState, string> = {
    // Open hand, relaxed
    idle: `
      . . . X X X . . .
      . . X X X X X . .
      . X X X X X X X .
      X X X X X X X X X
      X X X X X X X X X
      . X X X X X X X .
      . . X X X X X . .
      . . . X X X . . .
    `,
    // Pointing finger extended
    point: `
      . . . X X X . . .
      . . X X X X X . .
      . X X X X X X X .
      X X X X X X X X X
      . . . X X X . . .
      . . . X X X . . .
      . . . X X X . . .
      . . . X X X . . .
    `,
    // Pinching - thumb and index close
    pinch: `
      . . . . . . . . .
      . . . . X X . . .
      . . . X X X X . .
      . . X X X X X X .
      . X X X X X X X X
      X X X X X X X X .
      . X X X X X X . .
      . . X X X X . . .
    `,
    // Fist/Grab
    grab: `
      . . . . . . . . .
      . . X X X X X . .
      . X X X X X X X .
      X X X X X X X X X
      X X X X X X X X X
      X X X X X X X X X
      . X X X X X X X .
      . . X X X X X . .
    `,
    // Fully open
    open: `
      X . . X X X . . X
      X . X X X X X . X
      X X X X X X X X X
      X X X X X X X X X
      X X X X X X X X X
      . X X X X X X X .
      . . X X X X X . .
      . . . X X X . . .
    `,
  };

  const pattern = patterns[state] || patterns.idle;
  const pixels = pattern.trim().split('\n').map(row => row.trim().split(/\s+/));

  return (
    <div
      style={{
        width: size,
        height: size,
        position: 'relative',
        imageRendering: 'pixelated',
      }}
    >
      {pixels.map((row, y) =>
        row.map((pixel, x) => {
          if (pixel === 'X') {
            return (
              <div
                key={`${x}-${y}`}
                style={{
                  position: 'absolute',
                  left: x * pixelSize,
                  top: y * pixelSize,
                  width: pixelSize,
                  height: pixelSize,
                  backgroundColor: color.primary,
                  border: `${pixelSize * 0.125}px solid ${color.secondary}`,
                  boxShadow: `inset ${pixelSize * 0.125}px ${pixelSize * 0.125}px 0 rgba(255,255,255,0.3),
                              inset -${pixelSize * 0.125}px -${pixelSize * 0.125}px 0 rgba(0,0,0,0.2)`,
                }}
              />
            );
          }
          return null;
        })
      )}
      
      {/* Pinch indicator */}
      {state === 'pinch' && (
        <motion.div
          style={{
            position: 'absolute',
            left: '50%',
            top: '30%',
            width: pixelSize * 3,
            height: pixelSize * 3,
            marginLeft: -pixelSize * 1.5,
            marginTop: -pixelSize * 1.5,
            borderRadius: '50%',
            backgroundColor: '#22C55E',
            border: `${pixelSize * 0.25}px solid white`,
          }}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [1, 0.5, 1],
          }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      )}
    </div>
  );
}

export function KenneyHandCursor({
  position,
  coordinateSpace = 'viewport',
  containerRef,
  state = 'idle',
  isPinching = false,
  isHandDetected = true,
  size = 64,
  color = 'yellow',
  showTrail = true,
  zIndex = 9999,
}: KenneyHandCursorProps) {
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

  const theme = THEME_COLORS[color];
  const effectiveState: HandCursorState = state === 'idle' && isPinching ? 'pinch' : state;

  return (
    <motion.div
      data-testid="kenney-hand-cursor"
      style={{
        position: 'fixed',
        left: resolvedPosition.x - size / 2,
        top: resolvedPosition.y - size / 2,
        width: size,
        height: size,
        pointerEvents: 'none',
        zIndex,
      }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{
        scale: 1,
        opacity: 1,
        y: effectiveState === 'idle' ? [0, -4, 0] : 0,
      }}
      transition={{
        scale: { type: 'spring', stiffness: 400, damping: 20 },
        y: { duration: 2, repeat: effectiveState === 'idle' ? Infinity : 0, ease: 'easeInOut' },
      }}
    >
      {/* Glow effect */}
      <motion.div
        style={{
          position: 'absolute',
          inset: -8,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${theme.glow} 0%, transparent 70%)`,
        }}
        animate={{
          opacity: effectiveState === 'pinch' ? [0.8, 1, 0.8] : 0.6,
          scale: effectiveState === 'pinch' ? [1, 1.1, 1] : 1,
        }}
        transition={{ duration: 0.5, repeat: Infinity }}
      />

      {/* Hand */}
      <motion.div
        animate={{
          scale: effectiveState === 'pinch' ? 0.9 : 1,
          rotate: effectiveState === 'point' ? -15 : 0,
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        <PixelHand state={effectiveState} color={theme} size={size} />
      </motion.div>

      {/* Trail dots */}
      {showTrail && effectiveState !== 'idle' && (
        <>
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              style={{
                position: 'absolute',
                width: size * 0.15,
                height: size * 0.15,
                borderRadius: '50%',
                backgroundColor: theme.primary,
                left: -size * (0.3 + i * 0.2),
                top: '50%',
                marginTop: -size * 0.075,
              }}
              initial={{ opacity: 0.6, scale: 1 }}
              animate={{ opacity: 0, scale: 0.5 }}
              transition={{
                duration: 0.4,
                delay: i * 0.1,
                repeat: Infinity,
              }}
            />
          ))}
        </>
      )}
    </motion.div>
  );
}

export default KenneyHandCursor;
