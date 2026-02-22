import { motion, AnimatePresence } from 'framer-motion';
import { useTTS } from '../../hooks/useTTS';
import { useEffect, useRef } from 'react';

/**
 * HandTrackingStatus - Friendly indicator when hand is not detected
 *
 * CRITICAL FIXES FROM AUDIT:
 * - Friendly message, not error (Issue AC-001)
 * - Visual prompt to show hand
 * - Pause timer when hand lost
 * - Character animation (mascot points to camera)
 * - No game over due to tracking loss
 *
 * Issue References: AC-001, HT-003 from EMOJI_MATCH_COMPREHENSIVE_VIDEO_AUDIT_COLLATION_2026-02-20.md
 */

interface HandTrackingStatusProps {
  /** Whether hand is currently detected */
  isHandDetected: boolean;

  /** Callback when hand detection state changes */
  onHandDetectionChange?: (detected: boolean) => void;

  /** Whether to automatically pause game when hand not detected */
  pauseOnHandLost?: boolean;

  /** Whether to speak voice prompt when hand lost (default: true) */
  voicePrompt?: boolean;

  /** Custom message to display (optional) */
  customMessage?: string;

  /** Show mascot animation (default: true) */
  showMascot?: boolean;

  /** Compact mode (smaller indicator, less intrusive) */
  compact?: boolean;
}

export function HandTrackingStatus({
  isHandDetected,
  onHandDetectionChange,
  pauseOnHandLost = true,
  voicePrompt = true,
  customMessage,
  showMascot = true,
  compact = false,
}: HandTrackingStatusProps) {
  const { speak } = useTTS();
  const previousDetectedRef = useRef<boolean>(isHandDetected);

  // Notify parent component when detection state changes
  useEffect(() => {
    if (previousDetectedRef.current === isHandDetected) return;
    previousDetectedRef.current = isHandDetected;

    onHandDetectionChange?.(isHandDetected);

    // Voice prompt when hand is lost
    if (!isHandDetected && voicePrompt) {
      speak("I can't see your hand! Show it to the camera!");
    }
  }, [isHandDetected, onHandDetectionChange, speak, voicePrompt]);

  // If hand is detected, don't show anything
  if (isHandDetected) {
    return null;
  }

  const message = customMessage || 'Show me your hand! 👋';

  if (compact) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className='fixed top-4 left-1/2 transform -translate-x-1/2 z-50'
          style={{
            backgroundColor: '#FFF3CD',
            color: '#856404',
            border: '2px solid #FFC107',
            borderRadius: '12px',
            padding: '12px 24px',
            fontSize: '18px',
            fontWeight: 'bold',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
          }}
        >
          {message}
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        className='fixed inset-0 z-50 flex items-center justify-center'
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
        }}
      >
        <motion.div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '24px',
            padding: '48px',
            maxWidth: '600px',
            textAlign: 'center',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          }}
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          {/* Mascot animation (pointing to camera) */}
          {showMascot && (
            <motion.div
              style={{
                fontSize: '120px',
                marginBottom: '24px',
              }}
              animate={{
                rotate: [0, -10, 10, -10, 0],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              👆
            </motion.div>
          )}

          {/* Message */}
          <h2
            style={{
              fontSize: '36px',
              fontWeight: 'bold',
              color: '#000000',
              marginBottom: '16px',
            }}
          >
            {message}
          </h2>

          {/* Instructions */}
          <p
            style={{
              fontSize: '24px',
              color: '#666666',
              marginBottom: '32px',
            }}
          >
            Make sure your hand is in front of the camera
          </p>

          {/* Visual indicator */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '16px',
              fontSize: '18px',
              color: '#999999',
            }}
          >
            <motion.div
              style={{
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                backgroundColor: '#FF4444',
              }}
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
            <span>Looking for your hand...</span>
          </div>

          {pauseOnHandLost && (
            <p
              style={{
                fontSize: '16px',
                color: '#999999',
                marginTop: '24px',
                fontStyle: 'italic',
              }}
            >
              Game paused
            </p>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * HandTrackingQualityIndicator - Shows tracking quality/stability
 */
interface QualityIndicatorProps {
  /** Tracking quality score (0-1) */
  quality: number;

  /** Position to display (default: 'top-right') */
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

  /** Debug mode (shows numeric value) */
  debug?: boolean;
}

export function HandTrackingQualityIndicator({
  quality,
  position = 'top-right',
  debug = false,
}: QualityIndicatorProps) {
  const positionStyles = {
    'top-left': { top: '16px', left: '16px' },
    'top-right': { top: '16px', right: '16px' },
    'bottom-left': { bottom: '16px', left: '16px' },
    'bottom-right': { bottom: '16px', right: '16px' },
  };

  const color =
    quality > 0.8 ? '#4CAF50' : quality > 0.5 ? '#FFC107' : '#FF4444';
  const label = quality > 0.8 ? 'Good' : quality > 0.5 ? 'Fair' : 'Poor';

  return (
    <motion.div
      className='fixed z-40'
      style={{
        ...positionStyles[position],
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        borderRadius: '12px',
        padding: '8px 16px',
        color: '#FFFFFF',
        fontSize: '14px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      }}
    >
      <div
        style={{
          width: '12px',
          height: '12px',
          borderRadius: '50%',
          backgroundColor: color,
        }}
      />
      <span>
        Tracking: {label}
        {debug && ` (${(quality * 100).toFixed(0)}%)`}
      </span>
    </motion.div>
  );
}

/**
 * Usage Example:
 *
 * ```tsx
 * function MyGame() {
 *   const { isHandDetected, trackingQuality } = useHandTracking();
 *   const [isGamePaused, setIsGamePaused] = useState(false);
 *
 *   return (
 *     <div>
 *       <HandTrackingStatus
 *         isHandDetected={isHandDetected}
 *         onHandDetectionChange={(detected) => {
 *           setIsGamePaused(!detected);
 *         }}
 *       />
 *
 *       <HandTrackingQualityIndicator
 *         quality={trackingQuality}
 *         debug={import.meta.env.DEV}
 *       />
 *     </div>
 *   );
 * }
 * ```
 *
 * Testing Requirements:
 * - [ ] Hand occlusion detected within 500ms
 * - [ ] Timer pauses correctly when hand lost
 * - [ ] Prompt is friendly, not scary/confusing
 * - [ ] Game resumes smoothly when hand reappears
 * - [ ] Voice prompt plays once (not repeating)
 */
