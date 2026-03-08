/**
 * Yoga Progress Bars
 *
 * Displays two progress bars for the Yoga Animals game:
 * 1. Match Progress - How well the pose matches (green when >70%, blue otherwise)
 * 2. Hold Progress - Progress toward completing the 2-second hold (amber)
 */

import { motion } from 'framer-motion';

interface YogaProgressBarsProps {
  matchProgress: number; // 0-100
  holdTime: number; // Current hold time in milliseconds
  holdDuration: number; // Required hold duration in milliseconds (default: 2000)
  reducedMotion?: boolean;
}

export function YogaProgressBars({
  matchProgress,
  holdTime,
  holdDuration = 2000,
  reducedMotion = false,
}: YogaProgressBarsProps) {
  const holdProgress = Math.min((holdTime / holdDuration) * 100, 100);
  const isGoodMatch = matchProgress > 70;

  return (
    <div className='space-y-6'>
      {/* Match Progress Bar */}
      <div>
        <div className='flex justify-between font-bold text-text-secondary mb-2 uppercase tracking-wide text-sm'>
          <span>Pose Match</span>
          <span className={isGoodMatch ? 'text-[#10B981]' : ''}>
            {Math.round(matchProgress)}%
          </span>
        </div>
        <div className='h-6 bg-slate-100 rounded-full overflow-hidden border-2 border-[#F2CC8F]/50 p-1'>
          <motion.div
            className={`h-full rounded-full ${
              isGoodMatch ? 'bg-[#10B981]' : 'bg-[#3B82F6]'
            }`}
            initial={reducedMotion ? { width: `${matchProgress}%` } : { width: 0 }}
            animate={{ width: `${matchProgress}%` }}
            transition={
              reducedMotion
                ? { duration: 0.01 }
                : { type: 'spring', bounce: 0, duration: 0.3 }
            }
          />
        </div>
      </div>

      {/* Hold Progress Bar */}
      <div>
        <div className='flex justify-between font-bold text-text-secondary mb-2 uppercase tracking-wide text-sm'>
          <span>Hold the pose!</span>
          <span className={holdProgress >= 100 ? 'text-amber-500' : ''}>
            {Math.round(holdProgress)}%
          </span>
        </div>
        <div className='h-6 bg-slate-100 rounded-full overflow-hidden border-2 border-[#F2CC8F]/50 p-1'>
          <motion.div
            className='h-full bg-[#F59E0B] rounded-full'
            animate={{ width: `${holdProgress}%` }}
            transition={
              reducedMotion ? { duration: 0.01 } : { type: 'tween', duration: 0.1 }
            }
          />
        </div>
      </div>
    </div>
  );
}
