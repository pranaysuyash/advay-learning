import React from 'react';
import { motion } from 'framer-motion';
import { UIIcon, IconName } from './ui/Icon';

export interface GameControl {
  id: string;
  icon: IconName;
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  disabled?: boolean;
  isActive?: boolean;
  ariaLabel?: string;
}

interface GameControlsProps {
  controls: GameControl[];
  position?:
    | 'bottom-left'
    | 'bottom-right'
    | 'bottom-center'
    | 'top-left'
    | 'top-right';
  className?: string;
}

/**
 * Standardized game controls component.
 * Provides consistent button placement and styling across all games.
 *
 * All buttons are 56px minimum for kid-friendly touch targets.
 */
export const GameControls: React.FC<GameControlsProps> = ({
  controls,
  position = 'bottom-right',
  className = '',
}) => {
  const positionClasses = {
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
  };

  const getVariantClasses = (variant?: string, isActive?: boolean) => {
    const baseClasses =
      'flex items-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm transition-all min-h-[56px] shadow-lg';

    if (isActive) {
      return `${baseClasses} bg-pip-orange text-white shadow-pip-orange/30`;
    }

    switch (variant) {
      case 'primary':
        return `${baseClasses} bg-white/90 text-advay-slate border border-border hover:bg-white`;
      case 'secondary':
        return `${baseClasses} bg-white/70 text-advay-slate border border-border hover:bg-white/90`;
      case 'danger':
        return `${baseClasses} bg-error text-white hover:bg-red-700`;
      case 'success':
        return `${baseClasses} bg-success text-white hover:bg-success-hover`;
      default:
        return `${baseClasses} bg-white/90 text-advay-slate border border-border hover:bg-white`;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`absolute ${positionClasses[position]} flex flex-wrap gap-3 pointer-events-auto z-50 ${className}`}
    >
      <fieldset aria-label='Game controls'>
        <legend className='sr-only'>Game Controls</legend>
        {controls.map((control) => (
          <motion.button
            key={control.id}
            onClick={control.onClick}
            disabled={control.disabled}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={getVariantClasses(control.variant, control.isActive)}
            type='button'
            aria-label={control.ariaLabel}
          >
            <UIIcon name={control.icon} size={20} />
            <span className='hidden sm:inline'>{control.label}</span>
          </motion.button>
        ))}
      </fieldset>
    </motion.div>
  );
};

export default GameControls;
