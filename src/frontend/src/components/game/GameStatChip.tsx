import { memo } from 'react';
import { UIIcon } from '../ui/Icon';
import type { IconName } from '../ui/Icon';

export interface GameStatChipProps {
  icon: IconName;
  value: React.ReactNode;
  /** sr-only accessible label */
  label?: string;
  variant?: 'default' | 'warning' | 'danger';
  className?: string;
}

const variantStyles = {
  default: {
    container: 'bg-white border-2 border-[#F2CC8F] shadow-soft',
    icon: 'text-[#F59E0B]',
    value: 'text-advay-slate',
  },
  warning: {
    container: 'bg-amber-50 border-2 border-amber-300 shadow-soft',
    icon: 'text-amber-500',
    value: 'text-advay-slate',
  },
  danger: {
    container: 'bg-red-50 border-2 border-red-300 shadow-soft',
    icon: 'text-red-500',
    value: 'text-red-600',
  },
} as const;

export const GameStatChip = memo(function GameStatChip({
  icon,
  value,
  label,
  variant = 'default',
  className = '',
}: GameStatChipProps) {
  const styles = variantStyles[variant];

  return (
    <div
      className={`flex items-center gap-2 px-4 py-2 rounded-2xl ${styles.container} ${className}`}
      role="status"
      aria-label={label}
    >
      <UIIcon name={icon} size={20} className={styles.icon} />
      <span className={`font-black text-lg ${styles.value}`}>{value}</span>
      {label && <span className="sr-only">{label}</span>}
    </div>
  );
});
