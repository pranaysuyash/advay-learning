/**
 * StruggleIndicator Component
 * Shows attention level badges for activities that need parent intervention
 */
import { motion } from 'framer-motion';
import { UIIcon } from '../ui/Icon';

interface StruggleIndicatorProps {
  attentionLevel: 'none' | 'low' | 'medium' | 'high';
  reason?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const config = {
  none: {
    color: 'bg-emerald-100 border-emerald-200 text-emerald-700',
    icon: 'check',
    label: 'On Track',
  },
  low: {
    color: 'bg-blue-100 border-blue-200 text-blue-700',
    icon: 'info',
    label: 'Good',
  },
  medium: {
    color: 'bg-yellow-100 border-yellow-200 text-yellow-700',
    icon: 'warning',
    label: 'Practice More',
  },
  high: {
    color: 'bg-orange-100 border-orange-200 text-orange-700',
    icon: 'warning',
    label: 'Needs Help',
  },
};

const sizeClasses = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-3 py-1 text-sm',
  lg: 'px-4 py-2 text-base',
};

export function StruggleIndicator({
  attentionLevel,
  reason,
  showLabel = true,
  size = 'md',
}: StruggleIndicatorProps) {
  const { color, icon, label } = config[attentionLevel];

  return (
    <div className="flex items-center gap-2">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={`inline-flex items-center gap-1.5 rounded-lg border-2 font-bold uppercase tracking-wider ${color} ${sizeClasses[size]}`}
      >
        <UIIcon name={icon as any} size={size === 'sm' ? 12 : size === 'md' ? 14 : 16} />
        {showLabel && <span>{label}</span>}
      </motion.div>
      {reason && (
        <span className="text-sm text-slate-500 font-medium hidden sm:inline">
          {reason}
        </span>
      )}
    </div>
  );
}

/**
 * Compact dot indicator for list views
 */
export function StruggleDot({
  attentionLevel,
  size = 'md',
}: {
  attentionLevel: 'none' | 'low' | 'medium' | 'high';
  size?: 'sm' | 'md' | 'lg';
}) {
  const colors = {
    none: 'bg-emerald-400',
    low: 'bg-blue-400',
    medium: 'bg-yellow-400',
    high: 'bg-orange-500',
  };

  const sizes = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  };

  return (
    <div
      className={`rounded-full ${colors[attentionLevel]} ${sizes[size]}`}
      title={attentionLevel === 'high' ? 'Needs help' : attentionLevel === 'medium' ? 'Practice more' : 'On track'}
    />
  );
}
