/**
 * Logic Box Push Game
 * Sokoban-style puzzle game
 */
import { memo, useCallback, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { GameShell } from '../components/GameShell';
import { GameContainer } from '../components/GameContainer';
import { AccessDenied } from '../components/ui/AccessDenied';
import { useSubscription } from '../hooks/useSubscription';
import { useAutoGameCompletion } from '../hooks/useAutoGameCompletion';
import { GlobalErrorBoundary } from '../components/errors/GlobalErrorBoundary';
import { createInitialState, startLevel, movePlayer, checkWin, resetLevel, LEVELS, type CellType } from '../games/logicBoxPushLogic';
import { useAudio } from '../utils/hooks/useAudio';

const CELL_SIZE = 40;

export const LogicBoxPushContent = memo(function LogicBoxPushComponent() {
  const navigate = useNavigate();
  const { canAccessGame, isLoading: subLoading } = useSubscription();
  const hasAccess = canAccessGame('logic-box-push');
  const { playSuccess } = useAudio();
  const [state, setState] = useState(createInitialState());
  const { resetAutoCompletion } = useAutoGameCompletion('logic-box-push', {
    when: state.status === 'success',
    score: state.moves,
    level: LEVELS.findIndex((l) => l.id === state.currentLevelId) + 1,
    metadata: {
      levelId: state.currentLevelId,
      moves: state.moves,
    },
  });

  const handleMove = useCallback((direction: 'up' | 'down' | 'left' | 'right') => {
    setState((prev) => {
      const newState = movePlayer(prev, direction);
      if (checkWin(newState) && prev.status !== 'success') {
        playSuccess();
        return { ...newState, status: 'success' };
      }
      return newState;
    });
  }, [playSuccess]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const keyMap: Record<string, 'up' | 'down' | 'left' | 'right'> = {
        ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
        w: 'up', s: 'down', a: 'left', d: 'right'
      };
      if (keyMap[e.key] && state.status === 'playing') {
        handleMove(keyMap[e.key]);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleMove, state.status]);

  if (subLoading) return <div className='flex items-center justify-center min-h-screen'><div className='animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500'></div></div>;
  if (!hasAccess) return <AccessDenied gameName='Logic Box Push' gameId='logic-box-push' />;

  if (state.status === 'menu') {
    return (
      <GameContainer title='Logic Box Push' onHome={() => navigate('/games')}>
        <div className='flex flex-col items-center justify-center min-h-[60vh] p-6'>
          <h2 className='text-3xl font-bold text-purple-700 mb-4'>📦 Logic Box Push</h2>
          <p className='text-gray-600 mb-6'>Push boxes onto target spots!</p>
          <p className='text-sm text-gray-500 mb-4'>Use arrow keys or WASD to move</p>
          <button onClick={() => { resetAutoCompletion(); setState(startLevel(createInitialState(), LEVELS[0].id)); }} className='px-6 py-3 bg-purple-500 text-white rounded-xl font-bold hover:bg-purple-600'>Start Game</button>
        </div>
      </GameContainer>
    );
  }

  if (state.status === 'success') {
    const currentLevelIndex = LEVELS.findIndex(l => l.id === state.currentLevelId);
    return (
      <GameContainer title='Logic Box Push' onHome={() => navigate('/games')}>
        <div className='flex flex-col items-center justify-center min-h-[60vh]'>
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className='text-6xl mb-4'>🎉</motion.div>
          <h2 className='text-3xl font-bold text-green-600 mb-2'>Level Complete!</h2>
          <p className='text-xl'>Moves: {state.moves} | Pushes: {state.pushes}</p>
          <div className='flex gap-4 mt-4'>
            {currentLevelIndex < LEVELS.length - 1 && (
              <button onClick={() => { resetAutoCompletion(); setState(startLevel(createInitialState(), LEVELS[currentLevelIndex + 1].id)); }} className='px-6 py-3 bg-green-500 text-white rounded-xl'>Next Level</button>
            )}
            <button onClick={() => { resetAutoCompletion(); setState(createInitialState()); }} className='px-6 py-3 bg-purple-500 text-white rounded-xl'>Menu</button>
          </div>
        </div>
      </GameContainer>
    );
  }

  const level = LEVELS.find(l => l.id === state.currentLevelId) || LEVELS[0];

  const getCellContent = (cell: CellType) => {
    switch (cell) {
      case 'player': return '😊';
      case 'box': return '📦';
      case 'target': return '⭕';
      case 'box-on-target': return '✅';
      case 'wall': return '🧱';
      default: return null;
    }
  };

  const getCellBg = (cell: CellType) => {
    switch (cell) {
      case 'wall': return 'bg-gray-600';
      case 'target': return 'bg-yellow-100';
      case 'box-on-target': return 'bg-green-200';
      default: return 'bg-gray-100';
    }
  };

  return (
    <GameContainer title='Logic Box Push' onHome={() => navigate('/games')}>
      <div className='p-4'>
        <div className='flex justify-between items-center mb-4'>
          <div className='text-sm font-medium'>{level.name}</div>
          <div className='text-sm'>Moves: {state.moves} | Pushes: {state.pushes}</div>
        </div>
        
        {/* Grid */}
        <div className='flex justify-center mb-4'>
          <div className='inline-block border-2 border-gray-400'>
            {state.grid.map((row, y) => (
              <div key={y} className='flex'>
                {row.map((cell, x) => (
                  <motion.div
                    key={`${y}-${x}`}
                    className={`flex items-center justify-center text-2xl ${getCellBg(cell)}`}
                    style={{ width: CELL_SIZE, height: CELL_SIZE }}
                    animate={cell === 'box' || cell === 'player' ? { scale: [1, 1.05, 1] } : {}}
                    transition={{ duration: 0.1 }}
                  >
                    {getCellContent(cell)}
                  </motion.div>
                ))}
              </div>
            ))}
          </div>
        </div>
        
        {/* Controls */}
        <div className='flex flex-col items-center gap-2'>
          <button onClick={() => handleMove('up')} className='px-4 py-2 bg-purple-200 rounded-lg'>⬆️</button>
          <div className='flex gap-2'>
            <button onClick={() => handleMove('left')} className='px-4 py-2 bg-purple-200 rounded-lg'>⬅️</button>
            <button onClick={() => handleMove('down')} className='px-4 py-2 bg-purple-200 rounded-lg'>⬇️</button>
            <button onClick={() => handleMove('right')} className='px-4 py-2 bg-purple-200 rounded-lg'>➡️</button>
          </div>
        </div>
        
        <div className='flex justify-center gap-4 mt-4'>
          <button onClick={() => { resetAutoCompletion(); setState((prev) => resetLevel(prev)); }} className='px-4 py-2 bg-yellow-500 text-white rounded-lg'>Reset Level</button>
          <button onClick={() => { resetAutoCompletion(); setState(createInitialState()); }} className='px-4 py-2 bg-gray-400 text-white rounded-lg'>Select Level</button>
        </div>
      </div>
    </GameContainer>
  );
});

export const LogicBoxPush = () => (
  <GlobalErrorBoundary>
    <GameShell gameId='logic-box-push' gameName='Logic Box Push'>
      <LogicBoxPushContent />
    </GameShell>
  </GlobalErrorBoundary>
);

export default LogicBoxPush;
