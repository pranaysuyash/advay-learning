import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

/**
 * GameCursor - Mandatory cursor component applying emoji match audit fixes
 *
 * CRITICAL FIXES FROM AUDIT:
 * - Size: 70px (not 10-15px)
 * - Color: Bright yellow (#FFD700) with dark outline
 * - Contrast: 7:1 minimum (WCAG AAA)
 * - Visibility: 100% of frames (z-index: 9999)
 * - Trail effect for movement clarity
 * - Pinch state visualization
 *
 * Issue References: UI-001, HT-001 from EMOJI_MATCH_COMPREHENSIVE_VIDEO_AUDIT_COLLATION_2026-02-20.md
 */

interface GameCursorProps {
  /** Cursor position in screen coordinates */
  position: { x: number; y: number };

  /** Cursor size in pixels (default: 70px, minimum: 60px) */
  size?: number;

  /** Primary cursor color (default: bright yellow #FFD700) */
  color?: string;

  /** Outline color for contrast (default: black #000000) */
  outlineColor?: string;

  /** Outline width in pixels (default: 3px) */
  outlineWidth?: number;

  /** Whether hand is performing pinch gesture */
  isPinching?: boolean;

  /** Whether hand is detected (affects visibility) */
  isHandDetected?: boolean;

  /** Enable trailing effect (default: true) */
  showTrail?: boolean;

  /** Enable pulsing animation when hand detected (default: true) */
  pulseAnimation?: boolean;

  /** High contrast mode (increases outline, changes colors) */
  highContrast?: boolean;

  /** Custom cursor icon/emoji (optional) */
  icon?: string;
}

/**
 * PositionTrail - Stores recent cursor positions for trail effect
 */
interface TrailPoint {
  x: number;
  y: number;
  timestamp: number;
}

export function GameCursor({
  position,
  size = 70, // MANDATORY: 60-80px range
  color = '#FFD700', // Bright yellow
  outlineColor = '#000000',
  outlineWidth = 3,
  isPinching = false,
  isHandDetected = true,
  showTrail = true,
  pulseAnimation = true,
  highContrast = false,
  icon,
}: GameCursorProps) {
  const [trail, setTrail] = useState<TrailPoint[]>([]);

  // MANDATORY: Enforce minimum size
  const cursorSize = Math.max(60, size);

  // High contrast mode overrides
  const finalColor = highContrast ? '#FFFF00' : color; // Pure yellow in high contrast
  const finalOutlineColor = highContrast ? '#000000' : outlineColor;
  const finalOutlineWidth = highContrast ? outlineWidth + 2 : outlineWidth;

  // Update trail
  useEffect(() => {
    if (showTrail && isHandDetected) {
      const now = Date.now();
      const newPoint: TrailPoint = {
        x: position.x,
        y: position.y,
        timestamp: now,
      };

      // Keep trail of last 5 positions, remove old ones (>300ms)
      setTrail((prev) => {
        const updated = [...prev, newPoint];
        return updated.filter((p) => now - p.timestamp < 300).slice(-5);
      });
    } else {
      setTrail([]);
    }
  }, [position.x, position.y, showTrail, isHandDetected]);

  // Don't render if hand not detected
  if (!isHandDetected) {
    return null;
  }

  return (
    <>
      {/* Trail effect */}
      {showTrail &&
        trail.map((point, index) => {
          const age = Date.now() - point.timestamp;
          const opacity = Math.max(0, (300 - age) / 300);
          const trailSize = cursorSize * (0.5 + opacity * 0.5);

          return (
            <motion.div
              key={`trail-${point.timestamp}-${index}`}
              style={{
                position: 'fixed',
                left: point.x - trailSize / 2,
                top: point.y - trailSize / 2,
                width: trailSize,
                height: trailSize,
                borderRadius: '50%',
                backgroundColor: finalColor,
                opacity: opacity * 0.4,
                pointerEvents: 'none',
                zIndex: 9998,
                boxShadow: `0 0 ${trailSize / 4}px ${finalColor}`,
              }}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.1 }}
            />
          );
        })}

      {/* Main cursor */}
      <motion.div
        style={{
          position: 'fixed',
          left: position.x - cursorSize / 2,
          top: position.y - cursorSize / 2,
          width: cursorSize,
          height: cursorSize,
          borderRadius: '50%',
          backgroundColor: finalColor,
          border: `${finalOutlineWidth}px solid ${finalOutlineColor}`,
          pointerEvents: 'none',
          zIndex: 9999, // MANDATORY: Top layer
          boxShadow: `0 0 ${cursorSize / 2}px ${finalColor}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: icon ? cursorSize * 0.6 : undefined,
        }}
        animate={{
          scale: isPinching ? 1.3 : pulseAnimation ? [1, 1.1, 1] : 1,
          backgroundColor: isPinching ? '#00FF00' : finalColor, // Green when pinching
        }}
        transition={{
          scale: {
            duration: isPinching ? 0.1 : pulseAnimation ? 1.5 : 0,
            repeat: pulseAnimation && !isPinching ? Infinity : 0,
          },
          backgroundColor: {
            duration: 0.1,
          },
        }}
      >
        {icon && <span>{icon}</span>}

        {/* Pinch indicator */}
        {isPinching && (
          <motion.div
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              border: `4px solid #00FF00`,
              boxShadow: '0 0 20px #00FF00',
            }}
            initial={{ scale: 1, opacity: 1 }}
            animate={{ scale: 1.5, opacity: 0 }}
            transition={{ duration: 0.3, repeat: Infinity }}
          />
        )}
      </motion.div>

      {/* Accessibility: Screen reader announcement */}
      <div
        className='sr-only'
        role='status'
        aria-live='polite'
        aria-atomic='true'
      >
        {isPinching
          ? 'Pinching'
          : isHandDetected
            ? 'Hand detected'
            : 'No hand detected'}
      </div>
    </>
  );
}

/**
 * Usage Example:
 *
 * ```tsx
 * function MyGame() {
 *   const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
 *   const [isPinching, setIsPinching] = useState(false);
 *   const { landmarks, isHandDetected } = useHandTracking();
 *
 *   useEffect(() => {
 *     if (landmarks && landmarks.length > 0) {
 *       const indexTip = landmarks[8];
 *       const screenPos = handToScreenCoordinates(indexTip, ...);
 *       setCursorPos(screenPos);
 *       setIsPinching(detectPinchGesture(landmarks));
 *     }
 *   }, [landmarks]);
 *
 *   return (
 *     <div>
 *       <GameCursor
 *         position={cursorPos}
 *         isPinching={isPinching}
 *         isHandDetected={isHandDetected}
 *       />
 *     </div>
 *   );
 * }
 * ```
 *
 * Testing Requirements:
 * - [ ] Cursor visible in 100% of gameplay frames
 * - [ ] Cursor size ≥60px measured
 * - [ ] Contrast ratio ≥4.5:1 (preferably 7:1) verified
 * - [ ] Cursor follows hand within 50px tolerance
 * - [ ] Pinch animation triggers within 100ms
 * - [ ] High contrast mode tested
 */
