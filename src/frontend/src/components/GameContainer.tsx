import React, { ReactNode, useCallback, useEffect, useMemo, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { UIIcon } from './ui/Icon';
import { CameraThumbnail } from './game/CameraThumbnail';
import { useProfileStore } from '../store/profileStore';
import { recordGameSessionProgress } from '../services/progressTracking';

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
  /** Pass hand detection state to show camera thumbnail (optional) */
  isHandDetected?: boolean;
  /** Whether the game is actively playing (shows thumbnail only during play) */
  isPlaying?: boolean;
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
  isHandDetected,
  isPlaying,
}) => {
  const location = useLocation();
  const currentProfileId = useProfileStore((state) => state.currentProfile?.id);
  const resolvedProfileId = useMemo(() => {
    const stateProfileId = (location.state as { profileId?: string } | null)
      ?.profileId;
    return stateProfileId || currentProfileId || null;
  }, [currentProfileId, location.state]);

  const mountedAtRef = useRef<number>(Date.now());
  const sessionStartRef = useRef<number | null>(isPlaying === true ? Date.now() : null);
  const prevIsPlayingRef = useRef<boolean | undefined>(isPlaying);
  const latestScoreRef = useRef<number | undefined>(score);
  const latestLevelRef = useRef<number | undefined>(level);
  const latestTitleRef = useRef<string>(title || 'game');
  const lastReportedSessionRef = useRef<string | null>(null);

  useEffect(() => {
    latestScoreRef.current = score;
  }, [score]);

  useEffect(() => {
    latestLevelRef.current = level;
  }, [level]);

  useEffect(() => {
    latestTitleRef.current = title || 'game';
  }, [title]);

  const reportSession = useCallback(
    (reason: 'pause-stop' | 'unmount') => {
      const startMs =
        sessionStartRef.current ??
        (isPlaying === undefined ? mountedAtRef.current : null);
      if (!startMs) return;

      const durationSeconds = Math.max(0, Math.round((Date.now() - startMs) / 1000));
      const finalScore = Number(latestScoreRef.current ?? 0);
      const sessionId = `${startMs}`;
      if (lastReportedSessionRef.current === sessionId) return;

      // Ignore extremely short, zero-score "open and close" sessions.
      if (durationSeconds < 5 && finalScore <= 0) return;

      lastReportedSessionRef.current = sessionId;

      void recordGameSessionProgress({
        profileId: resolvedProfileId,
        gameName: latestTitleRef.current,
        score: finalScore,
        durationSeconds,
        level: latestLevelRef.current,
        routePath: location.pathname,
        sessionId,
        metaData: { end_reason: reason },
      });
    },
    [isPlaying, location.pathname, resolvedProfileId],
  );

  useEffect(() => {
    const wasPlaying = prevIsPlayingRef.current;
    const nowPlaying = isPlaying;

    if (nowPlaying === true && wasPlaying !== true) {
      sessionStartRef.current = Date.now();
      lastReportedSessionRef.current = null;
    }

    if (wasPlaying === true && nowPlaying === false) {
      reportSession('pause-stop');
      sessionStartRef.current = null;
    }

    prevIsPlayingRef.current = nowPlaying;
  }, [isPlaying, reportSession]);

  useEffect(
    () => () => {
      reportSession('unmount');
    },
    [reportSession],
  );

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
      <main className='flex-1 relative overflow-hidden bg-white/50'>
        {children}
        {/* Camera thumbnail for hand-tracking games */}
        {isHandDetected !== undefined && (
          <CameraThumbnail
            isHandDetected={!!isHandDetected}
            visible={isPlaying !== false}
          />
        )}
      </main>
    </div>
  );
};

export default GameContainer;
