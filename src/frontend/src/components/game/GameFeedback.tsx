import { memo, useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { UIIcon } from '../ui/Icon';

export interface GameFeedbackProps {
  /** The message to show (null = hidden) */
  message: string | null;
  /** Visual variant */
  variant?: 'neutral' | 'success' | 'error' | 'encouragement';
  /** Auto-dismiss after ms (default: 2000, 0 = no auto-dismiss) */
  duration?: number;
  /** Callback when dismissed */
  onDismiss?: () => void;
}

const variantConfig = {
  neutral: { border: 'border-[#F2CC8F]', icon: null, iconColor: '' },
  success: { border: 'border-[#81B29A]', icon: 'check' as const, iconColor: 'text-[#81B29A]' },
  error: { border: 'border-[#E07A5F]', icon: 'x' as const, iconColor: 'text-[#E07A5F]' },
  encouragement: { border: 'border-[#F59E0B]', icon: 'star' as const, iconColor: 'text-[#F59E0B]' },
} as const;

export const GameFeedback = memo(function GameFeedback({
  message,
  variant = 'neutral',
  duration = 2000,
  onDismiss,
}: GameFeedbackProps) {
  const reducedMotion = useReducedMotion();
  const [visible, setVisible] = useState(false);
  const [displayMessage, setDisplayMessage] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (message) {
      setDisplayMessage(message);
      setVisible(true);

      if (duration > 0) {
        timerRef.current = setTimeout(() => {
          setVisible(false);
          onDismiss?.();
        }, duration);
      }
    } else {
      setVisible(false);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [message, duration, onDismiss]);

  const config = variantConfig[variant];

  return (
    <div
      className="absolute top-20 left-1/2 -translate-x-1/2 z-30 pointer-events-none"
      aria-live="polite"
      role="status"
    >
      <AnimatePresence
        onExitComplete={() => {
          if (!visible) setDisplayMessage(null);
        }}
      >
        {visible && displayMessage && (
          <motion.div
            key={displayMessage}
            initial={{ opacity: 0, y: reducedMotion ? 0 : -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reducedMotion ? 0.1 : 0.2 }}
            className={`bg-white/95 backdrop-blur-sm rounded-2xl border-3 ${config.border} shadow-soft px-6 py-3 min-w-[200px] max-w-[400px]`}
          >
            <div className="flex items-center justify-center gap-2">
              {config.icon && (
                <UIIcon name={config.icon} size={22} className={config.iconColor} />
              )}
              <span className="text-h3 font-black text-advay-slate">
                {displayMessage}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});
