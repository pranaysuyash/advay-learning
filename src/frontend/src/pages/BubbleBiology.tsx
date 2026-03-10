/**
 * Bubble Biology Game
 *
 * Pinch to grab cells and sort them into matching jars!
 *
 * Educational Focus:
 * - Basic biology vocabulary
 * - Classification skills
 * - Fine motor control (pinch gesture)
 *
 * Controls:
 * - CV Mode: Pinch gesture to grab, move, and drop cells
 * - Mouse Mode: Click to grab, move, and release cells
 */

import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { GameShell } from '../components/GameShell';
import { GameContainer } from '../components/GameContainer';
import { GameControls } from '../components/GameControls';
import type { GameControl } from '../components/GameControls';
import { CelebrationOverlay } from '../components/CelebrationOverlay';
import { useAudio } from '../utils/hooks/useAudio';
import { useGameDrops } from '../hooks/useGameDrops';
import { useStreakTracking } from '../hooks/useStreakTracking';
import { triggerHaptic } from '../utils/haptics';
import { useTTS } from '../hooks/useTTS';
import { VoiceInstructions } from '../components/game/VoiceInstructions';
import {
  CELL_TYPES,
  LEVEL_CONFIG,
  initializeGame,
  spawnCell,
  updateCells,
  checkJarCollision,
  calculateScore,
  grabCell,
  releaseCell,
  updateJarFill,
  isLevelComplete,
  type GameState,
} from '../games/bubbleBiologyLogic';

const BubbleBiologyContent = memo(function BubbleBiologyContent() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const lastTimeRef = useRef<number>(0);
  const spawnTimerRef = useRef<NodeJS.Timeout | undefined>(undefined);
  
  // Game state
  const [showMenu, setShowMenu] = useState(true);
  const [gameState, setGameState] = useState<GameState>(() => initializeGame());
  const [isGrabbing, setIsGrabbing] = useState(false);
  const isPlayingRef = useRef(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [feedback, setFeedback] = useState('Pinch cells to grab them!');
  
  // Streak tracking
  const { streak, incrementStreak, resetStreak } = useStreakTracking();
  
  // Hooks
  const { playPop, playSuccess, playError, playCelebration: playCelebrationSound } = useAudio();
  const { speak, isEnabled: ttsEnabled } = useTTS();
  const { onGameComplete } = useGameDrops('bubble-biology');
  
  // Keep isPlayingRef in sync so the animation loop always reads fresh value
  useEffect(() => { isPlayingRef.current = gameState.isPlaying; }, [gameState.isPlaying]);

  // Get canvas dimensions
  const getCanvasDimensions = useCallback(() => {
    if (!canvasRef.current) return { width: 800, height: 600 };
    const rect = canvasRef.current.getBoundingClientRect();
    return { width: rect.width, height: rect.height };
  }, []);
  
  // Game loop
  const gameLoop = useCallback((timestamp: number) => {
    if (!isPlayingRef.current) return;
    
    const deltaTime = timestamp - lastTimeRef.current;
    lastTimeRef.current = timestamp;
    
    const { height } = getCanvasDimensions();
    
    // Update cells (move downward)
    const { updatedCells, missedCount } = updateCells(
      gameState.currentCells,
      deltaTime,
      height
    );
    
    // Update score if cells missed
    if (missedCount > 0) {
      resetStreak();
      setGameState(prev => ({
        ...prev,
        cellsMissed: prev.cellsMissed + missedCount,
      }));
    }
    
    setGameState(prev => ({
      ...prev,
      currentCells: updatedCells,
    }));
    
    animationRef.current = requestAnimationFrame(gameLoop);
  }, [gameState.currentCells, getCanvasDimensions, resetStreak]);
  
  // Spawn cells periodically
  const startSpawning = useCallback(() => {
    const level = gameState.level;
    const config = LEVEL_CONFIG[level as 1|2|3] || LEVEL_CONFIG[1];
    
    spawnTimerRef.current = setInterval(() => {
      const { width } = getCanvasDimensions();
      const newCell = spawnCell(width, level);
      
      setGameState(prev => ({
        ...prev,
        currentCells: [...prev.currentCells, newCell],
      }));
    }, config.spawnRate);
  }, [gameState.level, getCanvasDimensions]);
  
  // Start game
  const handleStart = useCallback(() => {
    playPop();
    setShowMenu(false);
    setGameState(prev => ({ ...prev, isPlaying: true }));
    lastTimeRef.current = performance.now();
    
    if (ttsEnabled) {
      speak('Welcome to Bubble Biology! Pinch cells and drop them in the matching jars!');
    }
    
    // Start game loop
    animationRef.current = requestAnimationFrame(gameLoop);
    startSpawning();
  }, [playPop, ttsEnabled, speak, gameLoop, startSpawning]);
  
  // Stop game
  const stopGame = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    if (spawnTimerRef.current) {
      clearInterval(spawnTimerRef.current);
    }
    setGameState(prev => ({ ...prev, isPlaying: false }));
  }, []);
  
  // Handle mouse/touch interaction
  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!canvasRef.current || !gameState.isPlaying) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // If grabbing a cell, move it
    if (isGrabbing && gameState.grabbedCell) {
      setGameState(prev => ({
        ...prev,
        currentCells: prev.currentCells.map(cell =>
          cell.id === prev.grabbedCell?.id
            ? { ...cell, x, y }
            : cell
        ),
        grabbedCell: prev.grabbedCell
          ? { ...prev.grabbedCell, x, y }
          : null,
      }));
    }
  }, [gameState.isPlaying, gameState.grabbedCell, isGrabbing]);
  
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (!canvasRef.current || !gameState.isPlaying) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Try to grab a cell
    const { updatedCells, grabbedCell } = grabCell(gameState.currentCells, x, y);
    
    if (grabbedCell) {
      playPop();
      triggerHaptic('success');
      setIsGrabbing(true);
      setGameState(prev => ({
        ...prev,
        currentCells: updatedCells,
        grabbedCell,
      }));
    }
  }, [gameState.isPlaying, gameState.currentCells, playPop]);
  
  const handlePointerUp = useCallback(() => {
    if (!gameState.grabbedCell) {
      setIsGrabbing(false);
      return;
    }
    
    const { width, height } = getCanvasDimensions();
    const cell = gameState.grabbedCell;
    
    // Check if dropped in a jar
    const { jar, isCorrect } = checkJarCollision(cell, gameState.jars, width, height);
    
    if (jar) {
      if (isCorrect) {
        // Correct!
        playSuccess();
        triggerHaptic('success');
        incrementStreak();
        
        const points = calculateScore(true, gameState.level, streak);
        setGameState(prev => ({
          ...prev,
          score: prev.score + points,
          cellsSorted: prev.cellsSorted + 1,
          currentCells: prev.currentCells.filter(c => c.id !== cell.id),
          grabbedCell: null,
          jars: prev.jars.map(j =>
            j.id === jar.id ? updateJarFill(j) : j
          ),
        }));
        
        setFeedback(`Correct! +${points} points!`);
        
        if (ttsEnabled) {
          speak(`Great job! That's a ${cell.type.name}!`);
        }
        
        // Check level complete
        setTimeout(() => {
          const updatedJars = gameState.jars.map(j =>
            j.id === jar.id ? updateJarFill(j) : j
          );
          
          if (isLevelComplete(updatedJars)) {
            playCelebrationSound();
            triggerHaptic('celebration');
            setShowCelebration(true);
            
            if (ttsEnabled) {
              speak('Amazing! You sorted all the cells!');
            }
            
            setTimeout(() => {
              setShowCelebration(false);
              stopGame();
              setGameState(initializeGame(gameState.level + 1));
              setShowMenu(true);
            }, 2000);
          }
        }, 100);
      } else {
        // Wrong jar
        playError();
        triggerHaptic('error');
        resetStreak();
        
        const points = calculateScore(false, gameState.level, streak);
        setGameState(prev => ({
          ...prev,
          score: Math.max(0, prev.score + points),
          grabbedCell: null,
        }));
        
        setFeedback('Oops! That goes in a different jar!');
        
        if (ttsEnabled) {
          speak('Try again! That cell goes in a different jar.');
        }
      }
    } else {
      // Dropped outside jars - just release
      const releasedCell = releaseCell(cell, cell.x, cell.y);
      setGameState(prev => ({
        ...prev,
        currentCells: prev.currentCells.map(c =>
          c.id === cell.id ? releasedCell : c
        ),
        grabbedCell: null,
      }));
    }
    
    setIsGrabbing(false);
  }, [
    gameState,
    getCanvasDimensions,
    playSuccess,
    playError,
    playCelebrationSound,
    incrementStreak,
    resetStreak,
    stopGame,
    ttsEnabled,
    speak,
    streak,
  ]);
  
  // Finish game
  const handleFinish = useCallback(async () => {
    playPop();
    stopGame();
    await onGameComplete(gameState.cellsSorted);
  }, [playPop, stopGame, onGameComplete, gameState.cellsSorted]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (spawnTimerRef.current) {
        clearInterval(spawnTimerRef.current);
      }
    };
  }, []);
  
  // Menu controls
  const menuControls: GameControl[] = [
    { id: 'play', label: 'Play', icon: 'play', onClick: handleStart },
  ];
  
  // Game controls
  const gameControls: GameControl[] = [
    { id: 'menu', label: 'Menu', icon: 'home', onClick: () => { stopGame(); setShowMenu(true); } },
  ];
  
  // Render cells
  const renderCells = () => (
    <AnimatePresence>
      {gameState.currentCells.map(cell => (
        <motion.div
          key={cell.id}
          className="absolute pointer-events-none select-none"
          style={{
            left: cell.x - cell.radius,
            top: cell.y - cell.radius,
            width: cell.radius * 2,
            height: cell.radius * 2,
          }}
          initial={{ scale: 0 }}
          animate={{ scale: cell.isGrabbed ? 1.2 : 1 }}
          exit={{ scale: 0, opacity: 0 }}
        >
          <div
            className="w-full h-full rounded-full flex items-center justify-center text-4xl shadow-lg"
            style={{
              backgroundColor: cell.type.color + '40',
              border: `3px solid ${cell.type.color}`,
            }}
          >
            {cell.type.emoji}
          </div>
        </motion.div>
      ))}
    </AnimatePresence>
  );
  
  // Render jars
  const renderJars = () => {
    const { width, height } = getCanvasDimensions();
    
    return gameState.jars.map(jar => {
      const x = jar.x * width;
      const y = jar.y * height;
      const w = jar.width * width;
      const h = jar.height * height;
      const fillPercent = (jar.fillLevel / jar.maxCapacity) * 100;
      
      return (
        <div
          key={jar.id}
          className="absolute rounded-lg border-4 flex flex-col items-center justify-end overflow-hidden"
          style={{
            left: x - w / 2,
            top: y - h / 2,
            width: w,
            height: h,
            borderColor: jar.type.color,
            backgroundColor: jar.type.color + '20',
          }}
        >
          {/* Fill indicator */}
          <div
            className="absolute bottom-0 left-0 right-0 transition-all"
            style={{
              height: `${fillPercent}%`,
              backgroundColor: jar.type.color + '60',
            }}
          />
          
          {/* Jar label */}
          <div className="relative z-10 p-2 text-center">
            <div className="text-2xl">{jar.type.emoji}</div>
            <div className="text-xs font-bold" style={{ color: jar.type.color }}>
              {jar.type.name}
            </div>
            <div className="text-xs">
              {jar.fillLevel}/{jar.maxCapacity}
            </div>
          </div>
        </div>
      );
    });
  };
  
  return (
    <GameContainer>
      <VoiceInstructions
        instructions="Welcome to Bubble Biology! Pinch cells and drop them in the matching jars!"
      />
      
      {/* Header */}
      {!showMenu && (
        <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
          <div className="bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2 shadow-lg">
            <div className="text-sm text-gray-600">Score</div>
            <div className="text-xl font-bold text-blue-900">
              {gameState.score}
            </div>
          </div>
          
          <div className="bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2 shadow-lg">
            <div className="text-sm text-gray-600">Sorted</div>
            <div className="text-xl font-bold text-green-900">
              {gameState.cellsSorted} / {gameState.cellsSorted + gameState.cellsMissed}
            </div>
          </div>
          
          <div className="bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2 shadow-lg">
            <div className="text-sm text-gray-600">Level {gameState.level}</div>
            <div className="text-sm font-bold text-purple-900">
              Streak: {streak}
            </div>
          </div>
        </div>
      )}
      
      {/* Feedback */}
      {!showMenu && feedback && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-10">
          <motion.div
            className="bg-white/90 backdrop-blur-sm rounded-lg px-6 py-3 shadow-lg"
            key={feedback}
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            {feedback}
          </motion.div>
        </div>
      )}
      
      {/* Game Area */}
      {showMenu ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <h1 className="text-4xl font-bold text-blue-900 mb-4">
            Bubble Biology 🧫
          </h1>
          <p className="text-lg text-blue-800 mb-8 text-center max-w-md">
            Pinch cells and drop them in matching jars!
          </p>
          <div className="flex gap-4 mb-4">
            {CELL_TYPES.map(type => (
              <div key={type.id} className="text-4xl">{type.emoji}</div>
            ))}
          </div>
          <GameControls controls={menuControls} />
        </div>
      ) : (
        <div
          ref={canvasRef}
          className="flex-1 relative bg-gradient-to-b from-blue-100 to-blue-200"
          onPointerMove={handlePointerMove}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          style={{ touchAction: 'none' }}
        >
          {renderCells()}
          {renderJars()}
          
          {/* Done button */}
          <button
            onClick={handleFinish}
            className="absolute top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-20"
            type="button"
          >
            Done
          </button>
        </div>
      )}
      
      {/* Controls */}
      {!showMenu && <GameControls controls={gameControls} position="bottom-left" />}
      
      {/* Celebrations */}
      <CelebrationOverlay
        show={showCelebration}
        letter="B"
        accuracy={100}
        message="Level Complete!"
        onComplete={() => setShowCelebration(false)}
      />
    </GameContainer>
  );
});

export default function BubbleBiology() {
  return (
    <GameShell gameName="Bubble Biology" gameId="bubble-biology">
      <BubbleBiologyContent />
    </GameShell>
  );
}

export { BubbleBiology };
