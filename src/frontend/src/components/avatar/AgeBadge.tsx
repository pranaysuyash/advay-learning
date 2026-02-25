import { motion } from 'framer-motion';
import { getAgeBadgeColor } from './types';

interface AgeBadgeProps {
  age: number;
  size?: 'sm' | 'md' | 'lg';
  pulse?: boolean;
  className?: string;
}

const SIZE_MAP = {
  sm: { container: 'min-w-[16px] h-4 text-[10px]', dot: 'w-2 h-2' },
  md: { container: 'min-w-[20px] h-5 text-xs', dot: 'w-2.5 h-2.5' },
  lg: { container: 'min-w-[28px] h-7 text-sm', dot: 'w-3 h-3' },
};

/**
 * Age Badge Component
 * 
 * Displays child's age as a notification-style badge.
 * Color-coded by age group for quick visual recognition.
 * 
 * Age Groups:
 * - 2-3: Soft Pink
 * - 4-5: Sky Blue  
 * - 6-7: Lime Green
 * - 8+: Purple
 */
export function AgeBadge({
  age,
  size = 'md',
  pulse = false,
  className = '',
}: AgeBadgeProps) {
  const sizeClasses = SIZE_MAP[size];
  const bgColor = getAgeBadgeColor(age);
  const displayAge = Math.floor(age);

  return (
    <motion.div
      className={`
        inline-flex items-center justify-center
        rounded-full font-bold text-white shadow-sm
        ${sizeClasses.container}
        ${className}
      `}
      style={{ backgroundColor: bgColor }}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 500, damping: 15 }}
    >
      {/* Pulsing ring effect */}
      {pulse && (
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{ backgroundColor: bgColor }}
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.5, 0, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      )}
      
      <span className="relative z-10">{displayAge}</span>
    </motion.div>
  );
}

/**
 * Compact Age Dot
 * Just a colored dot for space-constrained layouts
 */
export function AgeDot({
  age,
  size = 'md',
  className = '',
}: AgeBadgeProps) {
  const sizeClasses = SIZE_MAP[size];
  const bgColor = getAgeBadgeColor(age);

  return (
    <div
      className={`
        inline-block rounded-full
        ${sizeClasses.dot}
        ${className}
      `}
      style={{ backgroundColor: bgColor }}
      title={`${Math.floor(age)} years old`}
    />
  );
}

/**
 * Age Badge with Label
 * Shows "5 years" style text with colored badge
 */
interface AgeBadgeWithLabelProps extends AgeBadgeProps {
  showYears?: boolean;
}

export function AgeBadgeWithLabel({
  age,
  showYears = true,
  ...badgeProps
}: AgeBadgeWithLabelProps) {
  return (
    <div className="inline-flex items-center gap-1.5">
      <AgeBadge age={age} {...badgeProps} />
      {showYears && (
        <span className="text-xs text-slate-500">
          {Math.floor(age)} {Math.floor(age) === 1 ? 'year' : 'years'}
        </span>
      )}
    </div>
  );
}

export default AgeBadge;
