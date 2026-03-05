import React, { useCallback, useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { GameContainer } from './GameContainer';
import { AccessDenied } from './ui/AccessDenied';
import { useSubscription } from '../hooks/useSubscription';
import { useProgressStore } from '../store';
import { progressQueue } from '../services/progressQueue';
import { useGameDrops } from '../hooks/useGameDrops';

// exported interface describes the shape of the context value
export interface GamePageContext {
  score: number;
  setScore: React.Dispatch<React.SetStateAction<number>>;
  currentLevel: number;
  setCurrentLevel: React.Dispatch<React.SetStateAction<number>>;
  handleFinish: (opts?: {
    finalScore?: number;
    level?: number;
  }) => Promise<void>;
}

// actual React context object; consumers will import this
export const GamePageContext = React.createContext<GamePageContext | null>(
  null,
);

// small reusable UI shown anytime a game child throws or save fails
function GameErrorScreen({
  message,
  onHome,
}: {
  message?: string;
  onHome?: () => void;
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
              onClick={onHome}
              className='px-6 py-3 bg-slate-200 rounded-xl font-bold'
            >
              Home
            </button>
          )}
          <button
            onClick={() => window.location.reload()}
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
// previously triggered hook-order mismatches in tests.
class GamePageErrorBoundary extends React.Component<
  { children: React.ReactNode; onHome: () => void },
  { error: Error | null }
> {
  constructor(props: { children: React.ReactNode; onHome: () => void }) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error) {
    // we could log to monitoring here, but do not touch parent state
    console.error('GamePage rendering error:', error);
  }

  render() {
    if (this.state.error) {
      // only render the inner error UI; outer GameContainer remains intact
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
  children: (ctx: GamePageContext) => React.ReactNode;
}

export function GamePage({
  title,
  gameId,
  reportSession = true,
  children,
}: GamePageProps) {
  // ALL HOOKS MUST BE CALLED FIRST, BEFORE ANY CONDITIONAL RETURNS
  const navigate = useNavigate();
  const { canAccessGame, isLoading: subLoading } = useSubscription();
  const { currentProfile, recordGamePlay } = useProgressStore();
  const { onGameComplete } = useGameDrops(gameId);

  // internal refs keep the latest values synchronously so callers can
  // update and immediately finish without having to pass explicit opts.
  const scoreRef = useRef(0);
  const levelRef = useRef(1);
  const startTimeRef = useRef<number>(Date.now());

  const [score, _setScore] = useState(0);
  const [currentLevel, _setCurrentLevel] = useState(1);

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

  // progress helper – this does *not* catch so that callers can handle
  // failures in one place. `handleFinish` is responsible for updating state.
  const handleGameComplete = useCallback(
    async (finalScore: number, level: number) => {
      if (!currentProfile) {
        // missing profile usually means the user navigated away or the
        // session expired; treat as an error so the caller can react.
        throw new Error('No profile selected');
      }
      const durationSeconds = Math.floor((Date.now() - startTimeRef.current) / 1000);
      recordGamePlay(currentProfile.id, gameId, durationSeconds, finalScore);
      await progressQueue.add({
        profileId: currentProfile.id,
        gameId,
        score: finalScore,
        completed: true,
        metadata: { level },
      });
      onGameComplete(finalScore);
    },
    [currentProfile, gameId, onGameComplete, recordGamePlay],
  );

  const handleFinish = useCallback(
    async (opts?: { finalScore?: number; level?: number }) => {
      if (submittingRef.current) return;
      submittingRef.current = true;
      const finalScore = opts?.finalScore ?? scoreRef.current;
      const level = opts?.level ?? levelRef.current;

      try {
        await handleGameComplete(finalScore, level);
      } catch (err) {
        console.error('Progress save failed', err);
        setError(err as Error);
      } finally {
        submittingRef.current = false;
      }
      // navigation should be handled by caller via context or external link
    },
    [handleGameComplete],
  );

  const ctxValue = useMemo(
    () => ({ score, setScore, currentLevel, setCurrentLevel, handleFinish }),
    [score, currentLevel, handleFinish],
  );

  // NOW we can do conditional early returns after all hooks are called

  // rendering
  if (subLoading) {
    return (
      <div
        role='status'
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

  // save-error UI – boundary handles render‑time errors
  if (error) {
    // reuse the shared error screen inside the existing container so the
    // header/home button stays visible; also pass onHome for consistency
    return (
      <GameContainer title={title} onHome={() => navigate('/games')}>
        <GameErrorScreen
          message={error.message}
          onHome={() => navigate('/games')}
        />
      </GameContainer>
    );
  }

  return (
    <GameContainer
      title={title}
      onHome={() => navigate('/games')}
      showScore={reportSession}
      score={score}
    >
      <GamePageErrorBoundary onHome={() => navigate('/games')}>
        <GamePageContext.Provider value={ctxValue}>
          {children(ctxValue)}
        </GamePageContext.Provider>
      </GamePageErrorBoundary>
    </GameContainer>
  );
}
