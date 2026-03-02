/**
 * DwellTarget Component
 * 
 * Visual target element with dwell progress indication.
 * Shows circular progress ring when cursor is dwelling on target.
 * 
 * @ticket ISSUE-001
 */

import React from 'react';
import { motion } from 'framer-motion';

interface DwellTargetProps {
  /** Unique identifier for this target */
  id: string;
  /** Target position in pixels */
  x: number;
  /** Target position in pixels */
  y: number;
  /** Target size in pixels (default: 64) */
  size?: number;
  /** Whether cursor is currently dwelling on this target */
  isDwelling: boolean;
  /** Dwell progress (0-1) */
  dwellProgress: number;
  /** Whether this target is currently snapped */
  isSnapped: boolean;
  /** Content to display inside target */
  children: React.ReactNode;
  /** Click handler */
  onClick?: () => void;
  /** Additional CSS classes */
  className?: string;
}

export const DwellTarget: React.FC<DwellTargetProps> = React.memo(({
  id,
  x,
  y,
  size = 64,
  isDwelling,
  dwellProgress,
  isSnapped,
  children,
  onClick,
  className = '',
}) => {
  const radius = size / 2 - 4;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - dwellProgress);

  return (
    <motion.div
      id={id}
      className={`absolute flex items-center justify-center rounded-full cursor-pointer select-none ${className}`}
      style={{
        left: x - size / 2,
        top: y - size / 2,
        width: size,
        height: size,
      }}
      animate={{
        scale: isSnapped ? 1.1 : 1,
      }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 20,
      }}
      onClick={onClick}
    >
      {/* Background */}
      <div className={`absolute inset-0 rounded-full transition-colors duration-200 ${
        isSnapped 
          ? 'bg-amber-100 border-3 border-amber-400' 
          : 'bg-white border-3 border-slate-200'
      }`} />

      {/* Dwell progress ring */}
      {isDwelling && (
        <svg
          className="absolute inset-0 rotate-[-90deg]"
          width={size}
          height={size}
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#10B981"
            strokeWidth={4}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-75"
          />
        </svg>
      )}

      {/* Snapped indicator */}
      {isSnapped && !isDwelling && (
        <motion.div
          className="absolute inset-0 rounded-full border-3 border-amber-400"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ repeat: Infinity, duration: 1 }}
        />
      )}

      {/* Content */}
      <div className="relative z-10 flex items-center justify-center">
        {children}
      </div>
    </motion.div>
  );
});

DwellTarget.displayName = 'DwellTarget';

export default DwellTarget;
