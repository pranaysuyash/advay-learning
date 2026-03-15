import { memo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Button } from '../ui/Button';
import { UIIcon } from '../ui/Icon';
import type { IconName } from '../ui/Icon';
import { GameStatChip } from './GameStatChip';

export type ResultVariant = 'complete' | 'gameOver' | 'timeUp';

export interface ResultStat {
  label: string;
  value: string | number;
  icon?: IconName;
}

export interface GameResultScreenProps {
  /** Which ending */
  variant: ResultVariant;
  /** Override headline */
  title?: string;
  /** Supporting message */
  message?: string;
  /** Stats (max 3) */
  stats?: ResultStat[];
  /** Star rating 0–3 */
  stars?: number;
  /** Primary action */
  primaryAction: {
    label: string;
    onClick: () => void;
    icon?: IconName;
  };
  /** Secondary action */
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
}

const VARIANT_DEFAULTS: Record<
  ResultVariant,
  { emoji: string; title: string; message: string }
> = {
  complete: {
    emoji: '🎉',
    title: 'Great Job!',
    message: "You're a superstar!",
  },
  gameOver: {
    emoji: '💪',
    title: 'Game Over',
    message: "Don't worry, try again!",
  },
  timeUp: {
    emoji: '⏰',
    title: "Time's Up!",
    message: 'You ran out of time!',
  },
};

export const GameResultScreen = memo(function GameResultScreen({
  variant,
  title,
  message,
  stats,
  stars,
  primaryAction,
  secondaryAction,
}: GameResultScreenProps) {
  const reducedMotion = useReducedMotion();
  const defaults = VARIANT_DEFAULTS[variant];

  return (
    <div className="absolute inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: reducedMotion ? 1 : 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          duration: reducedMotion ? 0.1 : 0.3,
          type: reducedMotion ? 'tween' : 'spring',
          bounce: 0.3,
        }}
        className="bg-white rounded-2xl border-3 border-[#F2CC8F] shadow-soft-lg p-8 text-center w-full max-w-[420px]"
        role="dialog"
        aria-label={title ?? defaults.title}
      >
        {/* Emoji */}
        <div className="text-6xl mb-4">{defaults.emoji}</div>

        {/* Title */}
        <h2 className="text-h1 font-black text-advay-slate tracking-tight mb-2">
          {title ?? defaults.title}
        </h2>

        {/* Message */}
        <p className="text-body font-bold text-text-secondary mb-6">
          {message ?? defaults.message}
        </p>

        {/* Stars */}
        {stars !== undefined && (
          <div className="flex justify-center gap-2 mb-6">
            {[0, 1, 2].map((i) => (
              <UIIcon
                key={i}
                name="star"
                size={32}
                className={
                  i < stars
                    ? 'text-[#F59E0B]'
                    : 'text-slate-300'
                }
              />
            ))}
          </div>
        )}

        {/* Stats */}
        {stats && stats.length > 0 && (
          <div className="flex justify-center gap-3 mb-6 flex-wrap">
            {stats.slice(0, 3).map((stat) => (
              <GameStatChip
                key={stat.label}
                icon={stat.icon ?? 'star'}
                value={stat.value}
                label={stat.label}
              />
            ))}
          </div>
        )}

        {/* Primary action */}
        <Button
          variant="primary"
          size="lg"
          fullWidth
          icon={primaryAction.icon ?? 'play'}
          onClick={primaryAction.onClick}
        >
          {primaryAction.label}
        </Button>

        {/* Secondary action */}
        {secondaryAction && (
          <Button
            variant="ghost"
            size="md"
            className="mt-3"
            onClick={secondaryAction.onClick}
          >
            {secondaryAction.label}
          </Button>
        )}
      </motion.div>
    </div>
  );
});
