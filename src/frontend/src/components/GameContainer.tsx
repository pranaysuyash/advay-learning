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
 * Standardized game container with minimal header and full-screen game area.
 * All games should use this for consistent layout.
 *
 * Layout:
 * - Minimal header (56px) with Home, Score, Settings
 * - Full-screen game area (calc(100vh - 56px))
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
    <div className={`fixed inset-0 bg-black flex flex-col ${className}`}>
      {/* Minimal Header - 56px height */}
      <header className='h-14 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-white/10 flex items-center justify-between px-4 shrink-0 z-50'>
        {/* Left: Home Button */}
        <button
          onClick={onHome}
          className='flex items-center gap-2 px-3 py-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition min-h-[44px]'
          type='button'
        >
          <UIIcon name='home' size={20} />
          <span className='hidden sm:inline text-sm font-medium'>Home</span>
        </button>

        {/* Center: Title */}
        {title && (
          <h1 className='text-white font-semibold text-sm sm:text-base absolute left-1/2 -translate-x-1/2'>
            {title}
          </h1>
        )}

        {/* Right: Score + Controls */}
        <div className='flex items-center gap-2'>
          {showScore && score !== undefined && (
            <div className='flex items-center gap-1 px-3 py-1.5 bg-pip-orange/20 border border-pip-orange/30 rounded-lg'>
              <UIIcon name='star' size={16} className='text-pip-orange' />
              <span className='text-pip-orange font-bold text-sm'>{score}</span>
            </div>
          )}

          {level !== undefined && (
            <div className='hidden sm:flex items-center gap-1 px-2 py-1.5 text-white/60 text-sm'>
              <span>Level {level}</span>
            </div>
          )}

          {onPause && (
            <button
              onClick={onPause}
              className='p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition min-h-[44px] min-w-[44px] flex items-center justify-center'
              type='button'
            >
              <UIIcon name='timer' size={20} />
            </button>
          )}

          {onSettings && (
            <button
              onClick={onSettings}
              className='p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition min-h-[44px] min-w-[44px] flex items-center justify-center'
              type='button'
            >
              <UIIcon name='lock' size={20} />
            </button>
          )}
        </div>
      </header>

      {/* Full-Screen Game Area */}
      <main className='flex-1 relative overflow-hidden'>{children}</main>
    </div>
  );
};

export default GameContainer;
