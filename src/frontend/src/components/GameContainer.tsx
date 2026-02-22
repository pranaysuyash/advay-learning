import React, { ReactNode } from 'react';
import { UIIcon } from './ui/Icon';

interface GameContainerProps {
  children: ReactNode;
  title?: string;
  score?: number;
  level?: number;
  onHome?: () => void;
  onPause?: () => void;
  onSettings?: () => void;
  showScore?: boolean;
  className?: string;
}

/**
 * Standardized game container with V1 Header and game area.
 * All games should use this for consistent layout.
 *
 * Layout:
 * - Playful V1 header (72px) with Home, Score, Settings
 * - Full-screen game area (calc(100vh - 72px))
 * - Consistent styling across all games
 */
export const GameContainer: React.FC<GameContainerProps> = ({
  children,
  title,
  score,
  level,
  onHome,
  onPause,
  onSettings,
  showScore = true,
  className = '',
}) => {
  return (
    <div className={`fixed inset-0 bg-[#FFF8F0] font-nunito flex flex-col overflow-hidden ${className}`}>
      {/* V1 Playful Header - 72px height */}
      <header className='h-[72px] bg-white border-b-4 border-slate-200 shadow-sm flex items-center justify-between px-4 sm:px-6 shrink-0 z-50'>
        {/* Left: Home Button */}
        <button
          onClick={onHome}
          className='flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl border-2 border-slate-200 transition-colors shadow-sm focus:outline-none focus:border-[#3B82F6]'
          type='button'
        >
          <UIIcon name='home' size={22} className="text-slate-500" />
          <span className='hidden sm:inline text-sm font-bold uppercase tracking-wider'>Exit</span>
        </button>

        {/* Center: Title */}
        {title && (
          <h1 className='text-slate-800 font-black text-xl sm:text-2xl absolute left-1/2 -translate-x-1/2 tracking-tight'>
            {title}
          </h1>
        )}

        {/* Right: Score + Controls */}
        <div className='flex items-center gap-3'>
          {level !== undefined && (
            <div className='hidden sm:flex items-center gap-1 px-3 py-2 bg-[#3B82F6]/10 border-2 border-[#3B82F6]/20 rounded-xl shadow-sm'>
              <span className='text-sm font-bold text-[#3B82F6] uppercase tracking-wider'>Level</span>
              <span className='text-lg font-black text-[#3B82F6]'>{level}</span>
            </div>
          )}

          {showScore && score !== undefined && (
            <div className='flex items-center gap-2 px-4 py-2 bg-[#F59E0B]/10 border-2 border-[#F59E0B]/20 rounded-xl shadow-sm'>
              <UIIcon name='star' size={20} className='text-[#F59E0B]' />
              <span className='text-[#F59E0B] font-black text-lg'>{score}</span>
            </div>
          )}

          {onPause && (
            <button
              onClick={onPause}
              className='p-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl border-2 border-slate-200 transition-colors shadow-sm flex items-center justify-center focus:outline-none focus:border-[#3B82F6]'
              type='button'
              aria-label="Pause Game"
            >
              <UIIcon name='timer' size={22} className="text-slate-500" />
            </button>
          )}

          {onSettings && (
            <button
              onClick={onSettings}
              className='p-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl border-2 border-slate-200 transition-colors shadow-sm flex items-center justify-center focus:outline-none focus:border-[#3B82F6]'
              type='button'
              aria-label="Game Settings"
            >
              <UIIcon name='lock' size={22} className="text-slate-500" />
            </button>
          )}
        </div>
      </header>

      {/* Full-Screen Game Area */}
      <main className='flex-1 relative overflow-hidden bg-white/50'>{children}</main>
    </div>
  );
};

export default GameContainer;
