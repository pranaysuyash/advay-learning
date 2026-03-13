/**
 * Catch & Sort Game
 * Falling object sorting game
 */
import { memo, useCallback, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { GameShell } from '../components/GameShell';
import { GameContainer } from '../components/GameContainer';
import { AccessDenied } from '../components/ui/AccessDenied';
import { useSubscription } from '../hooks/useSubscription';
import { useAutoGameCompletion } from '../hooks/useAutoGameCompletion';
import { GlobalErrorBoundary } from '../components/errors/GlobalErrorBoundary';
import { createInitialState, startChallenge, spawnObject, updateObjects, catchObject, CHALLENGES } from '../games/catchSortLogic';
import { useAudio } from '../utils/hooks/useAudio';

const GAME_WIDTH = 600;
const GAME_HEIGHT = 400;

export const CatchSortContent = memo(function CatchSortComponent() {
  const navigate = useNavigate();
  const { canAccessGame, isLoading: subLoading } = useSubscription();
  const hasAccess = canAccessGame('catch-sort');
  const { playSuccess, playError } = useAudio();
  const [state, setState] = useState(createInitialState());
  const currentChallenge = CHALLENGES.find(c => c.id === state.currentChallengeId);
  const { resetAutoCompletion } = useAutoGameCompletion('catch-sort', {
    when: state.status === 'failure',
    score: state.score,
    level: currentChallenge ? CHALLENGES.findIndex((c) => c.id === currentChallenge.id) + 1 : 1,
    metadata: {
      missed: state.missed,
      challengeId: state.currentChallengeId,
    },
  });

  useEffect(() => {
    if (state.status !== 'playing') return;
    const spawnInterval = setInterval(() => {
      setState((prev) => spawnObject(prev));
    }, 1500);
    return () => clearInterval(spawnInterval);
  }, [state.status]);

  useEffect(() => {
    if (state.status !== 'playing') return;
    const updateInterval = setInterval(() => {
      setState((prev) => updateObjects(prev));
    }, 50);
    return () => clearInterval(updateInterval);
  }, [state.status]);

  const handleCatch = useCallback((objectId: string, binType: string) => {
    setState((prev) => {
      const newState = catchObject(prev, objectId, binType);
      if (newState.score > prev.score) playSuccess();
      else if (newState.missed > prev.missed) playError();
      return newState;
    });
  }, [playSuccess, playError]);

  if (subLoading) return <div className='flex items-center justify-center min-h-screen'><div className='animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500'></div></div>;
  if (!hasAccess) return <AccessDenied gameName='Catch & Sort' gameId='catch-sort' />;

  if (state.status === 'menu') {
    return (
      <GameContainer title='Catch & Sort' onHome={() => navigate('/games')}>
        <div className='flex flex-col items-center justify-center min-h-[60vh] p-6'>
          <h2 className='text-3xl font-bold text-cyan-700 mb-4'>🎯 Catch & Sort</h2>
          <p className='text-gray-600 mb-6'>Catch falling objects and sort them into the right bins!</p>
          <button onClick={() => { resetAutoCompletion(); setState((prev) => startChallenge(prev, CHALLENGES[0].id)); }} className='px-6 py-3 bg-cyan-500 text-white rounded-xl font-bold hover:bg-cyan-600'>Start Game</button>
        </div>
      </GameContainer>
    );
  }

  if (state.status === 'failure') {
    return (
      <GameContainer title='Catch & Sort' onHome={() => navigate('/games')} score={state.score}>
        <div className='flex flex-col items-center justify-center min-h-[60vh]'>
          <h2 className='text-3xl font-bold text-red-600 mb-2'>Time's Up!</h2>
          <p className='text-xl'>Final Score: {state.score}</p>
          <button onClick={() => { resetAutoCompletion(); setState(createInitialState()); }} className='mt-4 px-6 py-3 bg-cyan-500 text-white rounded-xl'>Play Again</button>
        </div>
      </GameContainer>
    );
  }

  const objectTypes = currentChallenge?.objectTypes || [];

  return (
    <GameContainer title='Catch & Sort' onHome={() => navigate('/games')} score={state.score}>
      <div className='p-4'>
        <div className='flex justify-between items-center mb-2 text-sm'>
          <div>Time: {state.timeLeft}s</div>
          <div>Level: {currentChallenge?.name}</div>
        </div>
        
        {/* Game Area */}
        <div className='relative bg-gradient-to-b from-sky-100 to-sky-50 rounded-xl overflow-hidden mb-4 mx-auto' style={{ width: GAME_WIDTH, height: GAME_HEIGHT }}>
          <AnimatePresence>
            {state.objects.map((obj) => (
              <motion.button
                key={obj.id}
                initial={{ opacity: 0, y: -20 }}
                animate={{ y: obj.y }}
                exit={{ opacity: 0 }}
                onClick={() => handleCatch(obj.id, obj.type)}
                className='absolute text-3xl cursor-pointer hover:scale-110 transition-transform'
                style={{ left: obj.x - 15 }}
              >
                {obj.emoji}
              </motion.button>
            ))}
          </AnimatePresence>
        </div>
        
        {/* Bins */}
        <div className='flex justify-around flex-wrap gap-2'>
          {objectTypes.map((type) => (
            <motion.button
              key={type}
              onClick={() => {
                const obj = state.objects.find((o) => o.y > GAME_HEIGHT - 80);
                if (obj) handleCatch(obj.id, type);
              }}
              className='flex flex-col items-center p-3 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors min-w-[80px]'
              whileTap={{ scale: 0.95 }}
            >
              <span className='text-2xl'>
                {type === 'fruit' ? '🍎' : type === 'vegetable' ? '🥕' : type === 'animal' ? '🐶' : type === 'shape' ? '🔴' : '1️⃣'}
              </span>
              <span className='text-xs mt-1 capitalize'>{type}</span>
            </motion.button>
          ))}
        </div>
        
        <p className='text-center text-xs text-gray-500 mt-4'>Click falling objects or tap the matching bin below!</p>
      </div>
    </GameContainer>
  );
});

export const CatchSort = () => (
  <GlobalErrorBoundary>
    <GameShell gameId='catch-sort' gameName='Catch & Sort'>
      <CatchSortContent />
    </GameShell>
  </GlobalErrorBoundary>
);

export default CatchSort;
