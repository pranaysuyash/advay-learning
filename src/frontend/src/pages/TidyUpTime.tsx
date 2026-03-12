/**
 * Tidy Up Time Game
 * 
 * Children organize a messy room by dragging items to correct places.
 */

import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Clock, Star, Trophy, RotateCcw, Sparkles } from 'lucide-react';
import { GameShell } from '../components/GameShell';
import { GameContainer } from '../components/GameContainer';
import { useSubscription } from '../hooks/useSubscription';
import { useGameDrops } from '../hooks/useGameDrops';
import { useAudio } from '../utils/hooks/useAudio';
import { triggerHaptic } from '../utils/haptics';
import {
  type GameState,
  type RoomItem,
  type RoomZone,
  createInitialState,
  moveItem,
  tickTimer,
  getUnplacedItems,
  getStarRating,
} from '../games/tidyUpTimeLogic';

function TidyUpTimeGameContent() {
  const { canAccessGame, isLoading: subLoading } = useSubscription();
  const hasAccess = canAccessGame('tidy-up-time');
  const { onGameComplete: _onGameComplete } = useGameDrops('tidy-up-time');

  const { playClick, playSuccess, playCelebration, playError } = useAudio();
  const [gameState, setGameState] = useState<GameState>(createInitialState());
  const [showMenu, setShowMenu] = useState(true);
  const [selectedItem, setSelectedItem] = useState<RoomItem | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const timerRef = useRef<number | null>(null);

  // Timer effect
  useEffect(() => {
    if (!showMenu && !gameState.isComplete && !gameState.isGameOver) {
      timerRef.current = window.setInterval(() => {
        setGameState(prev => tickTimer(prev));
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [showMenu, gameState.isComplete, gameState.isGameOver]);

  // Check for game completion
  useEffect(() => {
    if (gameState.isComplete && !showCelebration) {
      playCelebration();
      triggerHaptic('celebration');
      setShowCelebration(true);
    }
    if (gameState.isGameOver) {
      playError();
      triggerHaptic('error');
    }
  }, [gameState.isComplete, gameState.isGameOver, showCelebration, playCelebration, playError]);

  // Start game
  const startGame = useCallback(() => {
    setGameState(createInitialState());
    setShowMenu(false);
    setShowCelebration(false);
    playClick();
  }, [playClick]);

  // Return to menu
  const returnToMenu = useCallback(() => {
    setShowMenu(true);
    setGameState(createInitialState());
    setShowCelebration(false);
    playClick();
  }, [playClick]);

  // Handle item selection
  const handleItemClick = useCallback((item: RoomItem) => {
    if (item.currentZone) return; // Already placed
    setSelectedItem(item);
    playClick();
    triggerHaptic('success');
  }, [playClick]);

  // Handle zone drop
  const handleZoneClick = useCallback((zone: RoomZone) => {
    if (!selectedItem) return;

    const newState = moveItem(gameState, selectedItem.id, zone);
    
    // Check if move was correct
    const item = gameState.items.find(i => i.id === selectedItem.id);
    if (item && item.correctZone === zone) {
      playSuccess();
      triggerHaptic('success');
    } else {
      playError();
      triggerHaptic('error');
    }

    setGameState(newState);
    setSelectedItem(null);
  }, [selectedItem, gameState, playSuccess, playError]);

  // Restart game
  const restartGame = useCallback(() => {
    setGameState(createInitialState());
    setShowCelebration(false);
    playClick();
  }, [playClick]);

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Loading state
  if (subLoading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-red-500'></div>
      </div>
    );
  }

  // Access denied
  if (!hasAccess) {
    return (
      <GameShell gameId='tidy-up-time' gameName='Tidy Up Time'>
        <div className='flex items-center justify-center min-h-screen'>
          <div className='text-center'>
            <h2 className='text-2xl font-bold text-white mb-4'>
              Access Denied
            </h2>
            <p className='text-gray-300'>
              Upgrade to access Tidy Up Time!
            </p>
          </div>
        </div>
      </GameShell>
    );
  }

  // Menu screen
  if (showMenu) {
    return (
      <GameShell gameId='tidy-up-time' gameName='Tidy Up Time'>
        <GameContainer title='Tidy Up Time'>
          <div className='flex flex-col items-center justify-center min-h-[60vh] gap-8'>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className='text-8xl'
            >
              🧹
            </motion.div>
            
            <div className='text-center space-y-4'>
              <h1 className='text-4xl font-bold text-white'>Tidy Up Time</h1>
              <p className='text-xl text-gray-300'>
                Clean up the messy room! Put things where they belong.
              </p>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={startGame}
              type='button'
              className='flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xl font-bold rounded-full shadow-lg'
            >
              <Sparkles className='w-6 h-6' />
              Start Cleaning
            </motion.button>
          </div>
        </GameContainer>
      </GameShell>
    );
  }

  // Game complete screen
  if (gameState.isComplete || gameState.isGameOver) {
    const stars = getStarRating(gameState);
    const accuracy = Math.round((gameState.items.filter(i => i.currentZone === i.correctZone).length / gameState.items.length) * 100);

    return (
      <GameShell gameId='tidy-up-time' gameName='Tidy Up Time'>
        <GameContainer title='Tidy Up Time'>
          <div className='flex flex-col items-center justify-center min-h-[60vh] gap-6'>
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              className='text-8xl'
            >
              {gameState.isComplete ? '🎉' : '⏰'}
            </motion.div>
            
            <h1 className='text-4xl font-bold text-white'>
              {gameState.isComplete ? 'All Clean!' : 'Time\'s Up!'}
            </h1>

            <div className='flex gap-2'>
              {[1, 2, 3].map((star) => (
                <Star
                  key={star}
                  className={`w-10 h-10 ${
                    star <= stars ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'
                  }`}
                />
              ))}
            </div>

            <div className='text-center space-y-2 text-gray-300'>
              <p>Score: {gameState.score}</p>
              <p>Accuracy: {accuracy}%</p>
              <p>Moves: {gameState.moves}</p>
            </div>

            <div className='flex gap-4'>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={restartGame}
                type='button'
                className='flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-full'
              >
                <RotateCcw className='w-5 h-5' />
                Play Again
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={returnToMenu}
                type='button'
                className='flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-full'
              >
                <Home className='w-5 h-5' />
                Menu
              </motion.button>
            </div>
          </div>
        </GameContainer>
      </GameShell>
    );
  }

  // Game screen
  const unplacedItems = getUnplacedItems(gameState.items);

  return (
    <GameShell gameId='tidy-up-time' gameName='Tidy Up Time'>
      <GameContainer title='Tidy Up Time' onHome={returnToMenu}>
        <div className='relative w-full h-[70vh] bg-amber-50 rounded-xl overflow-hidden'>
          {/* Room background */}
          <div className='absolute inset-0 bg-gradient-to-b from-amber-100 to-amber-200'>
            {/* Floor */}
            <div className='absolute bottom-0 w-full h-1/3 bg-amber-300' />
          </div>

          {/* Drop zones */}
          {gameState.zones.map((zone) => (
            <motion.button
              key={zone.id}
              type='button'
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleZoneClick(zone.id)}
              className={`absolute rounded-xl border-3 border-dashed flex flex-col items-center justify-center transition-colors ${
                selectedItem ? 'cursor-pointer' : 'cursor-default'
              } ${
                selectedItem && selectedItem.correctZone === zone.id
                  ? 'bg-green-200 border-green-500'
                  : 'bg-white/50 border-gray-400'
              }`}
              style={{
                left: `${zone.x}%`,
                top: `${zone.y}%`,
                width: `${zone.width}%`,
                height: `${zone.height}%`,
              }}
            >
              <span className='text-4xl'>{zone.emoji}</span>
              <span className='text-xs font-bold text-gray-700 mt-1'>{zone.name}</span>
              {/* Items in zone */}
              <div className='flex flex-wrap justify-center gap-1 mt-2'>
                {gameState.items
                  .filter(i => i.currentZone === zone.id)
                  .map(i => (
                    <span key={i.id} className='text-2xl'>{i.emoji}</span>
                  ))}
              </div>
            </motion.button>
          ))}

          {/* Unplaced items */}
          <div className='absolute bottom-4 left-0 right-0 flex justify-center gap-3 flex-wrap px-4'>
            <AnimatePresence>
              {unplacedItems.map((item) => (
                <motion.button
                  key={item.id}
                  type='button'
                  layoutId={item.id}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleItemClick(item)}
                  className={`w-16 h-16 bg-white rounded-xl shadow-lg flex items-center justify-center text-3xl ${
                    selectedItem?.id === item.id ? 'ring-4 ring-blue-500' : ''
                  }`}
                >
                  {item.emoji}
                </motion.button>
              ))}
            </AnimatePresence>
          </div>

          {/* Selected item indicator */}
          {selectedItem && (
            <div className='absolute top-4 left-1/2 -translate-x-1/2 bg-blue-500 text-white px-4 py-2 rounded-full'>
              <p>Tap a zone to place: {selectedItem.emoji} {selectedItem.name}</p>
            </div>
          )}

          {/* HUD */}
          <div className='absolute top-4 left-4 flex gap-4'>
            <div className='bg-white/80 backdrop-blur-sm rounded-lg px-3 py-2 flex items-center gap-2'>
              <Clock className='w-5 h-5 text-blue-500' />
              <span className='font-bold text-gray-800'>{formatTime(gameState.timeRemaining)}</span>
            </div>
            <div className='bg-white/80 backdrop-blur-sm rounded-lg px-3 py-2 flex items-center gap-2'>
              <Trophy className='w-5 h-5 text-yellow-500' />
              <span className='font-bold text-gray-800'>{gameState.score}</span>
            </div>
          </div>

          {/* Instructions */}
          {unplacedItems.length > 0 && !selectedItem && (
            <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/70 backdrop-blur-sm rounded-xl px-6 py-4 text-center pointer-events-none'>
              <p className='text-white text-lg'>
                Tap an item, then tap where it goes!
              </p>
            </div>
          )}
        </div>
      </GameContainer>
    </GameShell>
  );
}

export const TidyUpTime = memo(function TidyUpTimeComponent() {
  return <TidyUpTimeGameContent />;
});

export default TidyUpTime;
