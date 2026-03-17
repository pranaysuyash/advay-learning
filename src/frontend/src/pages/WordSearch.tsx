import { useCallback, useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

import { GameShell } from '../components/GameShell';
import { GameContainer } from '../components/GameContainer';
import { GameCursor } from '../components/game/GameCursor';
import { GameHUD } from '../components/game/GameHUD';
import { CelebrationEffects } from '../components/game/CelebrationEffects';
import { SuccessAnimation } from '../components/game/SuccessAnimation';
import { useAudio } from '../utils/hooks/useAudio';
import { useGameCompletion } from '../hooks/useGameCompletion';
import { useGameSessionProgress } from '../hooks/useGameSessionProgress';
import { useGameHandTracking } from '../hooks/useGameHandTracking';
import type { Point } from '../types/tracking';
import type { HandTrackingRuntimeMeta } from '../hooks/useHandTrackingRuntime';
import type { TrackedHandFrame } from '../utils/handTrackingFrame';
import { triggerHaptic } from '../utils/haptics';
import { LEVELS, generateWordSearch } from '../games/wordSearchLogic';
import {
  STREAK_MILESTONE_INTERVAL,
  STREAK_MILESTONE_DURATION_MS,
} from '../games/constants';

export function WordSearchContent() {
  const navigate = useNavigate();
  const [currentLevel, setCurrentLevel] = useState(1);
  const [grid, setGrid] = useState<string[][]>([]);
  const [words, setWords] = useState<string[]>([]);
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [selected, setSelected] = useState<{ x: number; y: number }[]>([]);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [showStreakMilestone, setShowStreakMilestone] = useState(false);
  const [gameState, setGameState] = useState<'start' | 'playing' | 'complete'>(
    'start',
  );
  const handleNoVideoFrame = useCallback(() => {
    setCursor(null);
  }, []);
  const [cursor, setCursor] = useState<Point | null>(null);
  const [triggerCelebration, setTriggerCelebration] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [dragPath, setDragPath] = useState<{ x: number; y: number }[]>([]);
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const { playClick, playSuccess } = useAudio();
  const { completeGame } = useGameCompletion('word-search');

  useGameSessionProgress({
    gameName: 'Word Search',
    score,
    level: currentLevel,
    isPlaying: gameState === 'playing',
    metaData: { foundWords: foundWords.length },
  });

  // Hand tracking frame handler
  const handleFrame = useCallback(
    (frame: TrackedHandFrame, _meta: HandTrackingRuntimeMeta) => {
      const tip = frame.indexTip;
      if (!tip) {
        setCursor(null);
        setIsDragging(false);
        setDragStart(null);
        setDragPath([]);
        return;
      }
      setCursor(tip);

      // Handle drag gesture using pinch
      if (gameState === 'playing' && gridRef.current && grid.length > 0) {
        const isPinching = frame.pinch.transition === 'start' || frame.pinch.transition === 'continue' || frame.pinch.state.distance < 0.1;

        if (isPinching && !isDragging) {
          // Start drag - find which cell we're on
          const rect = gridRef.current.getBoundingClientRect();
          const x = tip.x * rect.width + rect.left;
          const y = tip.y * rect.height + rect.top;
          const el = document.elementFromPoint(x, y);
          const cell = el?.closest('button[data-cell]');
          if (cell) {
            const cellX = parseInt(cell.getAttribute('data-cell-x') || '0');
            const cellY = parseInt(cell.getAttribute('data-cell-y') || '0');
            setIsDragging(true);
            setDragStart({ x: cellX, y: cellY });
            setDragPath([{ x: cellX, y: cellY }]);
            setSelected([{ x: cellX, y: cellY }]);
          }
        } else if (isPinching && isDragging && dragStart) {
          // Continue drag - add cells to path
          const rect = gridRef.current.getBoundingClientRect();
          const x = tip.x * rect.width + rect.left;
          const y = tip.y * rect.height + rect.top;
          const el = document.elementFromPoint(x, y);
          const cell = el?.closest('button[data-cell]');
          if (cell) {
            const cellX = parseInt(cell.getAttribute('data-cell-x') || '0');
            const cellY = parseInt(cell.getAttribute('data-cell-y') || '0');

            // Check if this cell is new
            const isNew = !dragPath.some(p => p.x === cellX && p.y === cellY);
            if (isNew) {
              // Check if it's adjacent to the last cell (or same row/col for word selection)
              const lastCell = dragPath[dragPath.length - 1];
              const isAdjacent = Math.abs(cellX - lastCell.x) <= 1 && Math.abs(cellY - lastCell.y) <= 1;

              if (isAdjacent) {
                const newPath = [...dragPath, { x: cellX, y: cellY }];
                setDragPath(newPath);
                setSelected(newPath);
              }
            }
          }
        } else if (!isPinching && isDragging) {
          // End drag - check for word
          setIsDragging(false);
          if (dragPath.length >= 2) {
            const word = dragPath.map(p => grid[p.x][p.y]).join('');
            const reversed = word.split('').reverse().join('');
            const handleWordFound = (foundWord: string) => {
              const newStreak = streak + 1;
              setStreak(newStreak);
              const basePoints = foundWord.length * 10;
              const streakBonus = Math.min(newStreak * 3, 20);
              const totalPoints = basePoints + streakBonus;

              playSuccess();
              triggerHaptic('success');
              setFoundWords((f) => [...f, foundWord]);
              setScore((s) => s + totalPoints);

              // Trigger celebration effects
              setTriggerCelebration(true);
              setTimeout(() => setTriggerCelebration(false), 800);

              // Milestone every 5
              if (newStreak > 0 && newStreak % STREAK_MILESTONE_INTERVAL === 0) {
                setShowStreakMilestone(true);
                triggerHaptic('celebration');
                setTimeout(
                  () => setShowStreakMilestone(false),
                  STREAK_MILESTONE_DURATION_MS,
                );
              }
            };

            if (words.includes(word) && !foundWords.includes(word)) {
              handleWordFound(word);
            } else if (words.includes(reversed) && !foundWords.includes(reversed)) {
              handleWordFound(reversed);
            }
          }
          setDragStart(null);
          setDragPath([]);
          setSelected([]);

          if (foundWords.length + 1 >= words.length) {
            setScore((s) => s + 50);
            setGameState('complete');
          }
        }
      }
    },
    [gameState, grid, isDragging, dragStart, dragPath, streak, words, foundWords, playSuccess],
  );

  // Hand tracking hook
  const {
    isLoading: isModelLoading,
    isReady: isHandTrackingReady,
    startTracking,
    webcamRef,
  } = useGameHandTracking({
    gameName: 'Word Search',
    targetFps: 30,
    isRunning: gameState === 'playing',
    onFrame: handleFrame,
    onNoVideoFrame: handleNoVideoFrame,
  });

  // Auto-start hand tracking when game is active
  useEffect(() => {
    if (gameState === 'playing' && !isHandTrackingReady && !isModelLoading) {
      void startTracking();
    }
  }, [gameState, isHandTrackingReady, isModelLoading, startTracking]);

  const startGame = () => {
    const { grid: newGrid, words: newWords } = generateWordSearch(currentLevel);
    setGrid(newGrid);
    setWords(newWords);
    setFoundWords([]);
    setSelected([]);
    setScore(0);
    setStreak(0);
    setShowStreakMilestone(false);
    setGameState('playing');
  };

  const handleCellClick = (x: number, y: number) => {
    if (gameState !== 'playing') return;
    playClick();
    const alreadySelected = selected.find((s) => s.x === x && s.y === y);
    if (alreadySelected) {
      setSelected(selected.filter((s) => s.x !== x || s.y !== y));
      return;
    }
    const newSelected = [...selected, { x, y }];
    setSelected(newSelected);

    if (newSelected.length >= 2) {
      const word = newSelected.map((s) => grid[s.x][s.y]).join('');
      const reversed = word.split('').reverse().join('');
      const handleWordFound = (foundWord: string) => {
        const newStreak = streak + 1;
        setStreak(newStreak);
        const basePoints = foundWord.length * 10;
        const streakBonus = Math.min(newStreak * 3, 20);
        const totalPoints = basePoints + streakBonus;

        playSuccess();
        triggerHaptic('success');
        setFoundWords((f) => [...f, foundWord]);
        setScore((s) => s + totalPoints);

        // Trigger celebration effects
        setTriggerCelebration(true);
        setTimeout(() => setTriggerCelebration(false), 800);

        // Milestone every 5
        if (newStreak > 0 && newStreak % STREAK_MILESTONE_INTERVAL === 0) {
          setShowStreakMilestone(true);
          triggerHaptic('celebration');
          setTimeout(
            () => setShowStreakMilestone(false),
            STREAK_MILESTONE_DURATION_MS,
          );
        }
      };

      if (words.includes(word) && !foundWords.includes(word)) {
        handleWordFound(word);
      } else if (words.includes(reversed) && !foundWords.includes(reversed)) {
        handleWordFound(reversed);
      }
      setSelected([]);

      if (foundWords.length + 1 >= words.length) {
        setScore((s) => s + 50);
        setGameState('complete');
      }
    }
  };

  const handleStart = () => {
    playClick();
    startGame();
  };
  const handleFinish = useCallback(async () => {
    playClick();
    await completeGame({ score: foundWords.length, level: currentLevel });
    navigate('/games');
  }, [foundWords.length, completeGame, navigate, playClick, currentLevel]);

  return (
    <GameContainer
      title='Word Search'
      onHome={() => navigate('/games')}
      reportSession={false}
      webcamRef={webcamRef}
      isHandDetected={!!cursor}
      isPlaying={gameState === 'playing'}
    >
      {/* Celebration effects */}
      <CelebrationEffects
        trigger={triggerCelebration}
        type="stars"
        particleCount={20}
        duration={1500}
      />

      <div ref={gameAreaRef} className='flex flex-col items-center gap-4 p-4'>
        <div className='flex gap-2'>
          {LEVELS.map((l) => (
            <button
              type='button'
              key={l.level}
              onClick={() => {
                playClick();
                setCurrentLevel(l.level);
              }}
              className={`px-4 py-2 rounded-full font-bold ${currentLevel === l.level ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              Level {l.level}
            </button>
          ))}
        </div>

        {gameState === 'start' && (
          <div className='text-center'>
            <p className='text-6xl mb-4'>🔍</p>
            <h2 className='text-2xl font-bold mb-2'>Word Search!</h2>
            <p className='mb-4'>Find hidden words!</p>
            <button
              type='button'
              onClick={handleStart}
              className='px-8 py-4 bg-blue-500 text-white rounded-2xl font-bold text-xl'
            >
              Start!
            </button>
          </div>
        )}

        {gameState === 'playing' && grid.length > 0 && (
          <>
            <GameHUD
              score={score}
              streak={streak > 0 ? streak : undefined}
              levelInfo={`Level ${currentLevel}`}
              rightHeaderContent={
                <div className='bg-blue-100 px-3 py-1 rounded-lg font-bold text-blue-700 text-sm'>
                  {foundWords.length} / {words.length} words
                </div>
              }
            />

            <div className='text-center mt-4'>
              <p className='text-sm text-gray-600 mb-2'>
                {cursor ? 'Pinch and drag across letters to select words!' : 'Click letters to spell words'}
              </p>
              <div className='flex gap-2 mb-4 flex-wrap justify-center'>
                {words.map((word) => (
                  <span
                    key={word}
                    className={`px-3 py-1 rounded-full text-sm font-bold ${foundWords.includes(word) ? 'bg-green-500 text-white' : 'bg-gray-200'}`}
                  >
                    {word}
                  </span>
                ))}
              </div>
            </div>
            <div
              ref={gridRef}
              className='grid gap-1 mb-4 relative'
              style={{ gridTemplateColumns: `repeat(${grid.length}, 1fr)` }}
            >
              {/* Drag trail visualization */}
              {dragPath.length > 1 && (
                <svg className='absolute inset-0 pointer-events-none' style={{ zIndex: 10 }}>
                  <polyline
                    points={dragPath.map(p => {
                      const cellSize = 32 + 4; // w-8 + gap
                      return `${p.x * cellSize + cellSize / 2},${p.y * cellSize + cellSize / 2}`;
                    }).join(' ')}
                    fill='none'
                    stroke='#3B82F6'
                    strokeWidth='4'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  />
                </svg>
              )}
              {grid.map((row, i) =>
                row.map((cell, j) => (
                  <button
                    key={`${i}-${j}`}
                    type='button'
                    data-cell
                    data-cell-x={i}
                    data-cell-y={j}
                    onClick={() => handleCellClick(i, j)}
                    className={`w-8 h-8 font-bold text-sm rounded ${selected.some((s) => s.x === i && s.y === j) ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                  >
                    {cell}
                  </button>
                )),
              )}
            </div>
            <div className='flex items-center justify-center gap-4'>
              <div className='text-xl font-bold'>Score: {score}</div>
              {streak > 0 && (
                <div className='text-orange-500 font-bold text-xl'>
                  🔥 {streak}
                </div>
              )}
            </div>
          </>
        )}

        {/* Streak Milestone Overlay */}
        {showStreakMilestone && (
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            className='fixed inset-0 flex items-center justify-center pointer-events-none z-50'
          >
            <div className='bg-gradient-to-r from-orange-400 to-red-500 text-white px-8 py-4 rounded-full font-bold text-2xl shadow-lg'>
              🔥 {streak} Streak! 🔥
            </div>
          </motion.div>
        )}

        {/* Hand tracking cursor */}
        {cursor && gameState === 'playing' && (
          <GameCursor
            position={cursor}
            coordinateSpace='normalized'
            containerRef={gameAreaRef}
            isPinching={isDragging}
            isHandDetected={true}
            size={64}
            color='#3B82F6'
          />
        )}

        {gameState === 'complete' && (
          <>
            <SuccessAnimation
              show={gameState === 'complete'}
              type="confetti"
              message="Amazing!"
              characterEmoji="🎉"
              particleCount={50}
              duration={2500}
            />
            <div className='text-center'>
              <p className='text-6xl mb-4'>🎉</p>
              <h2 className='text-2xl font-bold mb-2'>Great Job!</h2>
              <p className='text-xl mb-4'>You found all words!</p>
              <p className='text-2xl font-bold text-green-600 mb-4'>
                Score: {score}
              </p>
              <button
                type='button'
                onClick={handleStart}
                className='px-6 py-3 bg-blue-500 text-white rounded-xl font-bold mr-4'
              >
                Play Again
              </button>
              <button
                type='button'
                onClick={handleFinish}
                className='px-6 py-3 bg-gray-200 rounded-xl font-bold'
              >
                Finish
              </button>
            </div>
          </>
        )}
      </div>
    </GameContainer>
  );
}

export const WordSearch = () => (
  <GameShell gameId='word-search' gameName='Word Search'>
    <WordSearchContent />
  </GameShell>
);

export default WordSearch;
