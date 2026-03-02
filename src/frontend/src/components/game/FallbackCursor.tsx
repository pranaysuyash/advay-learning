/**
 * FallbackCursor Component
 * 
 * Visual cursor for tap-based fallback controls.
 * Follows pointer/touch position when camera is unavailable.
 * 
 * @ticket ISSUE-001
 */

import React from 'react';
import { motion } from 'framer-motion';

interface FallbackCursorProps {
  /** Cursor position in pixels */
  position: { x: number; y: number } | null;
  /** Whether cursor is visible */
  isVisible: boolean;
  /** Cursor size in pixels (default: 48) */
  size?: number;
  /** Whether cursor is in dwelling state */
  isDwelling?: boolean;
  /** Dwell progress for visual feedback (0-1) */
  dwellProgress?: number;
  /** Whether high contrast mode is enabled */
  highContrast?: boolean;
}

export const FallbackCursor: React.FC<FallbackCursorProps> = React.memo(({
  position,
  isVisible,
  size = 48,
  isDwelling = false,
  dwellProgress = 0,
  highContrast = false,
}) => {
  if (!isVisible || !position) return null;

  const radius = size / 2;
  const circumference = 2 * Math.PI * (radius - 4);
  const strokeDashoffset = circumference * (1 - dwellProgress);

  return (
    <motion.div
      className="pointer-events-none fixed z-50"
      style={{
        left: position.x - radius,
        top: position.y - radius,
        width: size,
        height: size,
      }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ 
        scale: isDwelling ? 1.2 : 1, 
        opacity: 1,
        x: position.x - radius,
        y: position.y - radius,
      }}
      transition={{
        type: 'spring',
        stiffness: 500,
        damping: 30,
        mass: 1,
      }}
    >
      {/* Main cursor circle */}
      <div
        className={`absolute inset-0 rounded-full border-4 transition-colors duration-150 ${
          highContrast
            ? 'bg-yellow-300 border-black'
            : isDwelling
            ? 'bg-emerald-400/30 border-emerald-500'
            : 'bg-white/50 border-blue-500'
        }`}
      />

      {/* Center dot */}
      <div
        className={`absolute rounded-full transition-colors duration-150 ${
          highContrast
            ? 'bg-black'
            : 'bg-blue-500'
        }`}
        style={{
          width: size * 0.25,
          height: size * 0.25,
          left: size * 0.375,
          top: size * 0.375,
        }}
      />

      {/* Dwell progress ring */}
      {isDwelling && dwellProgress > 0 && (
        <svg
          className="absolute inset-0 rotate-[-90deg]"
          width={size}
          height={size}
        >
          <circle
            cx={radius}
            cy={radius}
            r={radius - 4}
            fill="none"
            stroke="#10B981"
            strokeWidth={3}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-75"
          />
        </svg>
      )}

      {/* Dwelling indicator */}
      {isDwelling && (
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-emerald-500"
          animate={{ scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }}
          transition={{ repeat: Infinity, duration: 0.5 }}
        />
      )}
    </motion.div>
  );
});

FallbackCursor.displayName = 'FallbackCursor';

export default FallbackCursor;
