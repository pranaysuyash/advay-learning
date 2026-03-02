import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Mascot } from '../Mascot';
import { useAudio } from '../../utils/hooks/useAudio';

interface ParentGateProps {
  isOpen: boolean;
  onUnlock: () => void;
  onCancel?: () => void;
  holdDuration?: number;
  title?: string;
  message?: string;
}

export function ParentGate({
  isOpen,
  onUnlock,
  onCancel,
  holdDuration = 3000,
  title = 'Parent Access',
  message = 'Hold the button below for 3 seconds to access parent controls.',
}: ParentGateProps) {
  const [holding, setHolding] = useState(false);
  const [progress, setProgress] = useState(0);
  const [unlocked, setUnlocked] = useState(false);
  const startTimeRef = useRef<number>(0);
  const animationRef = useRef<number>(0);

  const holdTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const holdingRef = useRef(false);
  
  const { playPop, playClick, playSuccess } = useAudio();
  
  // Play pop sound when gate opens
  useEffect(() => {
    if (isOpen) {
      playPop();
    }
  }, [isOpen, playPop]);
  
  // Update holdingRef whenever holding state changes
  useEffect(() => {
    holdingRef.current = holding;
  }, [holding]);

  const animateProgress = useCallback(() => {
    const elapsed = Date.now() - startTimeRef.current;
    const newProgress = Math.min((elapsed / holdDuration) * 100, 100);

    setProgress(newProgress);

    if (newProgress >= 100) {
      setUnlocked(true);
      setHolding(false);
      holdingRef.current = false;
      // Play success sound when unlocked
      playSuccess();
      setTimeout(() => {
        onUnlock();
      }, 500);
    } else if (holdingRef.current) {
      animationRef.current = requestAnimationFrame(animateProgress);
    }
  }, [holdDuration, onUnlock, playSuccess]);

  const startHolding = useCallback(() => {
    if (unlocked) {
      return;
    }
    setHolding(true);
    holdingRef.current = true;
    startTimeRef.current = Date.now();
    // Play click sound when holding starts
    playClick();
    
    // Start the animation loop
    animationRef.current = requestAnimationFrame(animateProgress);

    // Also set a fallback timeout to complete unlock so tests using fake timers
    // (vi.useFakeTimers) can deterministically advance time and trigger unlock.
    if (holdTimeoutRef.current) {
      clearTimeout(holdTimeoutRef.current);
    }
    holdTimeoutRef.current = setTimeout(() => {
      setUnlocked(true);
      setHolding(false);
      holdingRef.current = false;
      // small delay to mimic UI transition before calling onUnlock
      setTimeout(() => onUnlock(), 500);
    }, holdDuration);
  }, [unlocked, holdDuration, onUnlock, animateProgress, playClick]);

  const stopHolding = useCallback(() => {
    if (unlocked) return;
    setHolding(false);
    holdingRef.current = false;
    setProgress(0);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    if (holdTimeoutRef.current) {
      clearTimeout(holdTimeoutRef.current);
      holdTimeoutRef.current = null;
    }
  }, [unlocked]);

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (holdTimeoutRef.current) {
        clearTimeout(holdTimeoutRef.current);
        holdTimeoutRef.current = null;
      }
    };
  }, []);

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50'>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className='w-full max-w-md mx-4 bg-bg-secondary border border-border rounded-2xl p-6 shadow-2xl'
      >
        <div className='text-center'>
          <Mascot
            state={unlocked ? 'celebrating' : holding ? 'thinking' : 'waiting'}
            message={unlocked ? 'Access granted!' : 'Parent controls ahead...'}
            className='mb-4'
            speakMessage={false}
          />

          <h2 className='text-xl font-bold text-text-primary mb-2'>{title}</h2>
          <p className='text-text-secondary mb-6'>{message}</p>

          <div className='space-y-4'>
            <div className='relative'>
              <button
                type='button'
                aria-label={`Hold for ${holdDuration / 1000} seconds to access settings`}
                onMouseDown={startHolding}
                onMouseUp={stopHolding}
                onMouseLeave={stopHolding}
                onTouchStart={startHolding}
                onTouchEnd={stopHolding}
                className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition-all ${
                  unlocked
                    ? 'bg-green-500 text-white'
                    : holding
                      ? 'bg-orange-500 text-white'
                      : 'bg-bg-tertiary text-text-primary hover:bg-border'
                }`}
                disabled={unlocked}
              >
                {unlocked
                  ? '✓ Access Granted'
                  : holding
                    ? `Hold... ${Math.round(progress)}%`
                    : 'Hold to Unlock'}
              </button>

              {holding && !unlocked && (
                <motion.div
                  className='absolute bottom-0 left-0 h-full bg-orange-500/30 rounded-xl -z-10'
                  initial={{ width: '0%' }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.1 }}
                />
              )}
            </div>

            {onCancel && (
              <button
                type='button'
                onClick={() => {
                  playClick();
                  onCancel();
                }}
                className='w-full py-3 text-text-muted hover:text-text-primary transition'
              >
                Cancel
              </button>
            )}
          </div>

          <p className='mt-4 text-xs text-text-muted'>
            This prevents accidental access to parent settings during gameplay.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
