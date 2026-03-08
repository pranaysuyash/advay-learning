/**
 * Match Status Badge
 *
 * Displays the current pose match status with dynamic styling.
 * Shows "Perfect Match!" when above 70%, otherwise shows percentage.
 */

import { Target } from 'lucide-react';

interface MatchStatusBadgeProps {
  matchProgress: number; // 0-100
}

export function MatchStatusBadge({ matchProgress }: MatchStatusBadgeProps) {
  const isPerfectMatch = matchProgress > 70;

  return (
    <div
      className={`absolute top-6 right-6 px-6 py-2 backdrop-blur-md rounded-full border-3 shadow-[0_4px_0_#E5B86E] transition-colors ${
        isPerfectMatch
          ? 'bg-[#10B981]/90 border-emerald-400'
          : 'bg-black/40 border-white/20'
      }`}
    >
      <span
        className={`text-sm font-black tracking-wide flex items-center gap-1 text-white`}
      >
        {isPerfectMatch ? (
          <>
            <Target className='w-4 h-4' /> Perfect Match!
          </>
        ) : (
          `${Math.round(matchProgress)}% Matched`
        )}
      </span>
    </div>
  );
}
