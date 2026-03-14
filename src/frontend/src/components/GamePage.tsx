import React, { useCallback, useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { GameContainer } from './GameContainer';
import { AccessDenied } from './ui/AccessDenied';
import { useSubscription } from '../hooks/useSubscription';
import { useGameProgress } from '../hooks/useGameProgress';
import { useProgressStore } from '../store';
import { useGameDrops } from '../hooks/useGameDrops';
import { trackLaunchEvent } from '../analytics/launch';
import {
  GamePageContext as GamePageContextObject,
  type GamePageContextValue,
} from './GamePageContext';

// re-export for backward compatibility
export type { GamePageContextValue } from './GamePageContext';
export const GamePageContext = GamePageContextObject;

// small reusable UI shown anytime a game child throws or save fails
function GameErrorScreen({
  message,
  onHome,
  onRetry,
}: {
  message?: string;
  onHome?: () => void;
  onRetry?: () => void;
}) {
  return (
    <div className='flex items-center justify-center min-h-full'>
      <div className='text-center'>
        <h2 className='text-2xl font-bold text-red-600 mb-4'>Oops!</h2>
        <p className='text-slate-600 mb-4'>
          {message || 'Something went wrong.'}
        </p>
        <div className='flex gap-3 justify-center'>
          {onHome && (
            <button
              type='button'
              onClick={onHome}
              className='px-6 py-3 bg-slate-200 rounded-xl font-bold'
            >
              Home
            </button>
          )}
          <button
            type='button'
            onClick={onRetry ?? (() => window.location.reload())}
            className='px-6 py-3 bg-[#3B82F6] text-white rounded-xl font-bold'
          >
            Reload
          </button>
        </div>
      </div>
    </div>
  );
}

// simple error boundary that catches render-time exceptions and shows
// an inline fallback (same UI as the GamePage error state). The boundary does
// not update the parent state, which avoids nested render/update races that
// previously triggered hook-order mismatches in tests. The parent passes a
// `retryKey` that increments to force a full unmount/remount of children.
class GamePageErrorBoundary extends React.Component<
  { children: React.ReactNode; onHome: () => void; gameId: string; retryKey: number },
  { error: Error | null }
> {
  constructor(props: { children: React.ReactNode; onHome: () => void; gameId: string; retryKey: number }) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error) {
    trackLaunchEvent('game_render_error', {
      gameId: this.props.gameId,
      message: error.message,
    });
    console.error('GamePage rendering error:', error);
  }

  render() {
    if (this.state.error) {
      return (
        <GameErrorScreen
          message={this.state.error.message}
          onHome={this.props.onHome}
        />
      );
    }
    return this.props.children;
  }
}

interface GamePageProps {
  title: string;
  gameId: string;
  reportSession?: boolean;
  /** Called after successful save with final score and level */
  onComplete?: (finalScore: number, level: number) => void;
  children: (ctx: GamePageContextValue) => React.ReactNode;
}

export function GamePage({
  title,
  gameId,
  reportSession = true,
  onComplete,
  children,
}: GamePageProps) {
  // ALL HOOKS MUST BE CALLED FIRST, BEFORE ANY CONDITIONAL RETURNS
  const navigate = useNavigate();
  const { canAccessGame, isLoading: subLoading } = useSubscription();
  const { currentProfile, recordGamePlay } = useProgressStore();
  const { onGameComplete } = useGameDrops(gameId);
  const { saveProgress } = useGameProgress(gameId);

  // internal refs keep the latest values synchronously so callers can
  // update and immediately finish without having to pass explicit opts.
  const scoreRef = useRef(0);
  const levelRef = useRef(1);
  const startTimeRef = useRef<number>(Date.now());

  const [score, _setScore] = useState(0);
  const [currentLevel, _setCurrentLevel] = useState(1);
  // retryKey increments to force error boundary remount on retry
  const [retryKey, setRetryKey] = useState(0);

  const setScore: React.Dispatch<React.SetStateAction<number>> = useCallback(
    (u) => {
      const next =
        typeof u === 'function'
          ? (u as (prev: number) => number)(scoreRef.current)
          : u;
      scoreRef.current = next;
      _setScore(next);
    },
    [],
  );

  const setCurrentLevel: React.Dispatch<React.SetStateAction<number>> =
    useCallback((u) => {
      const next =
        typeof u === 'function'
          ? (u as (prev: number) => number)(levelRef.current)
          : u;
      levelRef.current = next;
      _setCurrentLevel(next);
    }, []);

  // save-error state (progress queue failures) – not used for render-time
  // exceptions because those are handled by the boundary above.
  const [error, setError] = useState<Error | null>(null);
  const submittingRef = useRef(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // progress helper – this does *not* catch so that callers can handle
  // failures in one place. `handleFinish` is responsible for updating state.
  const handleGameComplete = useCallback(
    async (finalScore: number, level: number) => {
      if (!currentProfile) {
        throw new Error('No profile selected');
      }
      const durationSeconds = Math.floor((Date.now() - startTimeRef.current) / 1000);
      recordGamePlay(currentProfile.id, gameId, durationSeconds, finalScore);
      await saveProgress({
        score: finalScore,
        completed: true,
        level,
      });
      onGameComplete(finalScore);
    },
    [currentProfile, gameId, onGameComplete, recordGamePlay, saveProgress],
  );

  const handleFinish = useCallback(
    async (opts?: { finalScore?: number; level?: number }) => {
      if (submittingRef.current) return;
      submittingRef.current = true;
      setIsSubmitting(true);
      const finalScore = opts?.finalScore ?? scoreRef.current;
      const level = opts?.level ?? levelRef.current;

      try {
        await handleGameComplete(finalScore, level);
        // F5: Reset timer for next round in multi-round games
        startTimeRef.current = Date.now();
        // F4: Notify caller of completion
        onComplete?.(finalScore, level);
      } catch (err) {
        console.error('Progress save failed', err);
        setError(err as Error);
      } finally {
        submittingRef.current = false;
        setIsSubmitting(false);
      }
    },
    [handleGameComplete, onComplete],
  );

  const handleRetry = useCallback(() => {
    setError(null);
    scoreRef.current = 0;
    levelRef.current = 1;
    startTimeRef.current = Date.now();
    setRetryKey((k) => k + 1);
  }, []);

  const ctxValue = useMemo(
    () => ({ score, setScore, currentLevel, setCurrentLevel, isSubmitting, handleFinish }),
    [score, currentLevel, isSubmitting, handleFinish, setScore, setCurrentLevel],
  );

  // NOW we can do conditional early returns after all hooks are called

  if (subLoading) {
    return (
      <div
        role='status'
        aria-label='Loading game…'
        className='flex items-center justify-center min-h-screen'
      >
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-red-500'></div>
      </div>
    );
  }

  const hasAccess = canAccessGame(gameId);
  if (!hasAccess) {
    return <AccessDenied gameName={title} gameId={gameId} />;
  }

  if (error) {
    return (
      <GameContainer title={title} reportSession={reportSession} onHome={() => navigate('/games')}>
        <GameErrorScreen
          message={error.message}
          onHome={() => navigate('/games')}
          onRetry={handleRetry}
        />
      </GameContainer>
    );
  }

  return (
    <GameContainer
      title={title}
      onHome={() => navigate('/games')}
      showScore={reportSession}
      reportSession={reportSession}
      score={score}
    >
      <GamePageErrorBoundary
        key={retryKey}
        onHome={() => navigate('/games')}
        gameId={gameId}
        retryKey={retryKey}
      >
        <GamePageContext.Provider value={ctxValue}>
          {children(ctxValue)}
        </GamePageContext.Provider>
      </GamePageErrorBoundary>
    </GameContainer>
  );
}
