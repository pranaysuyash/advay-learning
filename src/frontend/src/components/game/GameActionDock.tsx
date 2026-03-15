import { memo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { UIIcon } from '../ui/Icon';
import type { IconName } from '../ui/Icon';
import { useAudio } from '../../utils/hooks/useAudio';

export interface GameAction {
  id: string;
  icon: IconName;
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
}

export interface GameActionDockProps {
  /** Max 3 actions */
  actions: GameAction[];
  /** Position */
  position?: 'bottom-right' | 'bottom-center';
  className?: string;
}

const variantStyles = {
  primary: 'bg-white border-2 border-[#F2CC8F] text-advay-slate hover:bg-slate-50 shadow-soft',
  secondary: 'bg-white/80 border-2 border-slate-200 text-text-secondary hover:bg-white shadow-soft',
  danger: 'bg-red-50 border-2 border-red-200 text-red-600 hover:bg-red-100 shadow-soft',
} as const;

const positionStyles = {
  'bottom-right': 'bottom-4 right-4',
  'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
} as const;

export const GameActionDock = memo(function GameActionDock({
  actions,
  position = 'bottom-right',
  className = '',
}: GameActionDockProps) {
  const { playClick } = useAudio();
  const reducedMotion = useReducedMotion();

  // Enforce max 3 actions
  const visibleActions = actions.slice(0, 3);

  return (
    <motion.div
      initial={{ opacity: 0, y: reducedMotion ? 0 : 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reducedMotion ? 0.1 : 0.2 }}
      className={`absolute ${positionStyles[position]} z-30 pointer-events-auto ${className}`}
    >
      <fieldset aria-label="Game controls" className="flex gap-3">
        <legend className="sr-only">Game Controls</legend>
        {visibleActions.map((action) => (
          <button
            key={action.id}
            type="button"
            onClick={() => {
              playClick();
              action.onClick();
            }}
            className={`flex items-center gap-2 px-4 py-3 rounded-2xl font-bold text-sm transition-colors min-h-[60px] min-w-[60px] focus-visible:ring-2 focus-visible:ring-[#3B82F6] focus-visible:ring-offset-2 ${variantStyles[action.variant ?? 'primary']}`}
            aria-label={action.label}
          >
            <UIIcon name={action.icon} size={20} />
            <span className="hidden sm:inline">{action.label}</span>
          </button>
        ))}
      </fieldset>
    </motion.div>
  );
});
