import { memo } from 'react';
import { UIIcon } from '../ui/Icon';
import type { IconName } from '../ui/Icon';
import { useAudio } from '../../utils/hooks/useAudio';
import { GameStatChip } from './GameStatChip';
import { GameProgressBar } from './GameProgressBar';

export interface GameStatConfig {
  icon: IconName;
  value: React.ReactNode;
  /** sr-only accessible label */
  label?: string;
}

export interface GameTopBarProps {
  /** Game title */
  title: string;
  /** Exit handler — should navigate to /games */
  onExit: () => void;
  /** Primary stat (score, timer) — max 1 */
  primaryStat?: GameStatConfig;
  /** Secondary stat (level, round) — max 1 */
  secondaryStat?: GameStatConfig;
  /** Progress bar (0–100) */
  progress?: {
    value: number;
    label?: string;
  };
  /** Pause button handler */
  onPause?: () => void;
}

export const GameTopBar = memo(function GameTopBar({
  title,
  onExit,
  primaryStat,
  secondaryStat,
  progress,
  onPause,
}: GameTopBarProps) {
  const { playClick } = useAudio();

  return (
    <header className="bg-white border-b-3 border-[#F2CC8F] shadow-soft shrink-0 z-40">
      {/* Main row */}
      <div className="min-h-[64px] flex items-center justify-between px-4 sm:px-6 relative">
        {/* Left: Exit */}
        <button
          type="button"
          onClick={() => {
            playClick();
            onExit();
          }}
          className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-advay-slate rounded-2xl border-2 border-[#F2CC8F] transition-colors min-h-[44px] focus-visible:ring-2 focus-visible:ring-[#3B82F6] focus-visible:ring-offset-2"
          aria-label="Exit game"
        >
          <UIIcon name="back" size={20} />
          <span className="hidden sm:inline text-sm font-bold uppercase tracking-wider">
            Exit Game
          </span>
        </button>

        {/* Center: Title */}
        <h1 className="text-h2 font-black text-advay-slate tracking-tight absolute left-1/2 -translate-x-1/2 max-w-[200px] sm:max-w-none truncate text-center">
          {title}
        </h1>

        {/* Right: Stats + Pause */}
        <div className="flex items-center gap-2 sm:gap-3">
          {secondaryStat && (
            <GameStatChip
              icon={secondaryStat.icon}
              value={secondaryStat.value}
              label={secondaryStat.label}
              className="hidden sm:flex"
            />
          )}

          {primaryStat && (
            <GameStatChip
              icon={primaryStat.icon}
              value={primaryStat.value}
              label={primaryStat.label}
            />
          )}

          {onPause && (
            <button
              type="button"
              onClick={() => {
                playClick();
                onPause();
              }}
              className="flex items-center justify-center p-3 bg-slate-100 hover:bg-slate-200 text-advay-slate rounded-2xl border-2 border-[#F2CC8F] transition-colors min-h-[44px] min-w-[44px] focus-visible:ring-2 focus-visible:ring-[#3B82F6] focus-visible:ring-offset-2"
              aria-label="Pause game"
            >
              <UIIcon name="timer" size={20} />
            </button>
          )}
        </div>
      </div>

      {/* Optional progress bar */}
      {progress && (
        <div className="px-4 sm:px-6 pb-2">
          <GameProgressBar
            value={progress.value}
            label={progress.label}
          />
        </div>
      )}
    </header>
  );
});
