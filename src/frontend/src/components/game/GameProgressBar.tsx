import { memo } from 'react';
import { useReducedMotion } from 'framer-motion';

export interface GameProgressBarProps {
  /** Progress value 0–100 */
  value: number;
  /** sr-only accessible label */
  label?: string;
  variant?: 'default' | 'success';
  className?: string;
}

const fillVariants = {
  default: 'bg-[#3B82F6]',
  success: 'bg-[#81B29A]',
} as const;

export const GameProgressBar = memo(function GameProgressBar({
  value,
  label,
  variant = 'default',
  className = '',
}: GameProgressBarProps) {
  const reducedMotion = useReducedMotion();
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div
      className={`h-2 bg-slate-200 rounded-full overflow-hidden ${className}`}
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label ?? 'Progress'}
    >
      <div
        className={`h-full rounded-full ${fillVariants[variant]}`}
        style={{
          width: `${clamped}%`,
          transition: reducedMotion ? 'none' : 'width 300ms ease',
        }}
      />
    </div>
  );
});
