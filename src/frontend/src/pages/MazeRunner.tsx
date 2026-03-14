/**
 * Maze Runner Game
 *
 * Navigate your finger through the maze without touching walls!
 * Hand-tracking maze navigation game.
 *
 * @ticket GQ-002, GQ-003, GQ-004, GQ-005, GQ-007
 */

import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Webcam from 'react-webcam';

import { GameShell } from '../components/GameShell';
import { GameContainer } from '../components/GameContainer';
import { useGameHandTracking } from '../hooks/useGameHandTracking';
import { useGameCompletion } from '../hooks/useGameCompletion';
import { useAudio } from '../utils/hooks/useAudio';
import { triggerHaptic } from '../utils/haptics';
import { useTTS } from '../hooks/useTTS';
import type { TrackedHandFrame } from '../types/tracking';
import {
  type Difficulty,
  type GameState,
  type Maze,
  createInitialState,
  startGame,
  updatePlayerPosition,
  updateTimer,
  calculateFinalScore,
  getWallHitMessage,
  getDifficultyName,
  DIFFICULTY_CONFIGS,
} from '../games/mazeRunnerLogic';

const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 600;

export const MazeRunnerContent = memo(function MazeRunnerGame() {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const webcamRef = useRef<Webcam>(null);

  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [gameState, setGameState] = useState<GameState>(() => createInitialState());
  const [showCelebration, setShowCelebration] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number } | null>(null);

  const { completeGame } = useGameCompletion('maze-runner');
  const { playSuccess, playError, playCelebration } = useAudio();
  const { speak, isEnabled: ttsEnabled } = useTTS();

  const gameStateRef = useRef(gameState);
  gameStateRef.current = gameState;

  // Draw maze
  const drawMaze = useCallback(
    (ctx: CanvasRenderingContext2D, maze: Maze) => {
      const cellSize = CANVAS_WIDTH / maze.width;

      ctx.strokeStyle = '#333';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';

      // Draw all walls
      for (let y = 0; y < maze.height; y++) {
        for (let x = 0; x < maze.width; x++) {
          const cell = maze.cells[y][x];
          const px = x * cellSize;
          const py = y * cellSize;

          ctx.beginPath();

          if (cell.walls.top) {
            ctx.moveTo(px, py);
            ctx.lineTo(px + cellSize, py);
          }
          if (cell.walls.right) {
            ctx.moveTo(px + cellSize, py);
            ctx.lineTo(px + cellSize, py + cellSize);
          }
          if (cell.walls.bottom) {
            ctx.moveTo(px + cellSize, py + cellSize);
            ctx.lineTo(px, py + cellSize);
          }
          if (cell.walls.left) {
            ctx.moveTo(px, py + cellSize);
            ctx.lineTo(px, py);
          }

          ctx.stroke();
        }
      }

      // Draw start (green circle)
      const startX = maze.start.x * CANVAS_WIDTH;
      const startY = maze.start.y * CANVAS_HEIGHT;
      ctx.fillStyle = '#4CAF50';
      ctx.beginPath();
      ctx.arc(startX, startY, cellSize * 0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('START', startX, startY + 4);

      // Draw end (red circle with flag)
      const endX = maze.end.x * CANVAS_WIDTH;
      const endY = maze.end.y * CANVAS_HEIGHT;
      ctx.fillStyle = '#FF5252';
      ctx.beginPath();
      ctx.arc(endX, endY, cellSize * 0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.fillText('EXIT', endX, endY + 4);
    },
    []
  );

  // Draw player and path
  const drawPlayer = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      const { playerPos, path, maze } = gameState;
      if (!maze) return;

      const cellSize = CANVAS_WIDTH / maze.width;

      // Draw path trail
      if (path.length > 1) {
        ctx.strokeStyle = '#2196F3';
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();

        path.forEach((pos, i) => {
          const x = pos.x * CANVAS_WIDTH;
          const y = pos.y * CANVAS_HEIGHT;
          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        });

        ctx.stroke();
      }

      // Draw player cursor
      const px = playerPos.x * CANVAS_WIDTH;
      const py = playerPos.y * CANVAS_HEIGHT;

      // Glow effect
      ctx.shadowColor = '#2196F3';
      ctx.shadowBlur = 20;
      ctx.fillStyle = '#2196F3';
      ctx.beginPath();
      ctx.arc(px, py, cellSize * 0.25, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Inner circle
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(px, py, cellSize * 0.15, 0, Math.PI * 2);
      ctx.fill();
    },
    [gameState]
  );

  // Handle hand tracking
  const handleHandFrame = useCallback(
    async (frame: TrackedHandFrame) => {
      if (!frame.indexTip || gameStateRef.current.status !== 'playing') return;

      const cursor = { x: frame.indexTip.x, y: frame.indexTip.y };
      setCursorPos(cursor);

      const { state: newState, hitWall, reachedExit } = updatePlayerPosition(
        gameStateRef.current,
        cursor
      );

      setGameState(newState);

      if (hitWall) {
        playError();
        triggerHaptic('error');
        const message = getWallHitMessage(newState.wallHits, newState.maxWallHits);
        setFeedback(message);
        if (ttsEnabled) speak(message);

        if (newState.status === 'wall-hit') {
          setTimeout(() => {
            setGameState((prev) => createInitialState({ difficulty: prev.difficulty, timeLimit: DIFFICULTY_CONFIGS[prev.difficulty].timeLimit, maxWallHits: prev.maxWallHits }));
          }, 2000);
        } else {
          setTimeout(() => setFeedback(null), 1500);
        }
      }

      if (reachedExit) {
        playSuccess();
        triggerHaptic('celebration');
        playCelebration();
        const scores = calculateFinalScore(newState);
        await completeGame({ score: scores.total, level: 1 });
        setShowCelebration(true);
        if (ttsEnabled) speak('Maze complete! Great job!');
      }
    },
    [playSuccess, playError, playCelebration, speak, ttsEnabled, completeGame]
  );

  const { handVisible } = useGameHandTracking({
    gameName: 'MazeRunner',
    webcamRef,
    onFrame: handleHandFrame,
  });

  // Timer
  useEffect(() => {
    if (gameState.status !== 'playing') return;

    const timer = setInterval(() => {
      setGameState((prev) => {
        const updated = updateTimer(prev);
        if (updated.status === 'wall-hit' && prev.status === 'playing') {
          playError();
          if (ttsEnabled) speak("Time's up! Try again.");
          setTimeout(() => {
            setGameState((p) => createInitialState({ difficulty: p.difficulty, timeLimit: DIFFICULTY_CONFIGS[p.difficulty].timeLimit, maxWallHits: p.maxWallHits }));
          }, 2000);
        }
        return updated;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState.status, playError, speak, ttsEnabled]);

  // Draw canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw maze
    if (gameState.maze) {
      drawMaze(ctx, gameState.maze);
      drawPlayer(ctx);
    }

    // Draw hand cursor
    if (cursorPos && gameState.status === 'playing') {
      const cx = cursorPos.x * CANVAS_WIDTH;
      const cy = cursorPos.y * CANVAS_HEIGHT;

      ctx.strokeStyle = '#FF9800';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx, cy, 10, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(cx, cy, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#FF9800';
      ctx.fill();
    }
  }, [gameState, cursorPos, drawMaze, drawPlayer]);

  const handleStart = useCallback(() => {
    setGameState((prev) => startGame(prev, difficulty));
    if (ttsEnabled) {
      speak(`Navigate through the ${getDifficultyName(difficulty)} maze. Don't touch the walls!`);
    }
  }, [difficulty, speak, ttsEnabled]);

  const handleGameComplete = useCallback(() => {
    setShowCelebration(false);
    setGameState(createInitialState());
  }, []);

  // Mouse fallback
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (gameState.status !== 'playing') return;

      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      const cursor = {
        x: (e.clientX - rect.left) / rect.width,
        y: (e.clientY - rect.top) / rect.height,
      };

      setCursorPos(cursor);

      const { state: newState, hitWall, reachedExit } = updatePlayerPosition(
        gameState,
        cursor
      );

      setGameState(newState);

      if (hitWall) {
        playError();
        const message = getWallHitMessage(newState.wallHits, newState.maxWallHits);
        setFeedback(message);
        if (newState.status === 'wall-hit') {
          setTimeout(() => {
            setGameState((prev) => createInitialState({ difficulty: prev.difficulty, timeLimit: DIFFICULTY_CONFIGS[prev.difficulty].timeLimit, maxWallHits: prev.maxWallHits }));
          }, 2000);
        } else {
          setTimeout(() => setFeedback(null), 1500);
        }
      }

      if (reachedExit) {
        playSuccess();
        playCelebration();
        setShowCelebration(true);
      }
    },
    [gameState, playSuccess, playError, playCelebration]
  );

  return (
    <GameContainer
      title="Maze Runner"
      score={gameState.score}
      isPlaying={gameState.status === 'playing'}
      isHandDetected={handVisible}
      webcamRef={webcamRef}
    >
      <div className="relative w-full h-full flex flex-col items-center justify-center">
        {gameState.status === 'idle' ? (
          <div className="flex flex-col items-center gap-6">
            <h2 className="text-3xl font-bold text-gray-800">Maze Runner</h2>
            <p className="text-gray-600 text-center max-w-md">
              Navigate your finger through the maze!
              <br />
              🚫 Don't touch the walls!
            </p>

            <div className="flex gap-4">
              {(['easy', 'medium', 'hard'] as Difficulty[]).map((diff) => (
                <button
                  key={diff}
                  onClick={() => setDifficulty(diff)}
                  className={`px-6 py-3 rounded-xl font-bold capitalize transition-all ${
                    difficulty === diff
                      ? 'bg-purple-500 text-white scale-110'
                      : 'bg-white text-gray-700 hover:bg-gray-100 shadow-md'
                  }`}
                >
                  {getDifficultyName(diff)}
                </button>
              ))}
            </div>

            <div className="text-sm text-gray-500">
              {difficulty === 'easy' && '8x8 maze • 60 seconds • 5 wall hits allowed'}
              {difficulty === 'medium' && '12x12 maze • 90 seconds • 3 wall hits allowed'}
              {difficulty === 'hard' && '16x16 maze • 120 seconds • 2 wall hits allowed'}
            </div>

            <button
              onClick={handleStart}
              className="mt-4 px-8 py-4 bg-green-500 hover:bg-green-600 text-white text-xl font-bold rounded-2xl shadow-lg transition-all hover:scale-105"
            >
              Start Maze! 🏃
            </button>
          </div>
        ) : (
          <>
            {/* Status Bar */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-6 bg-white px-6 py-3 rounded-2xl shadow-xl">
              <div className="text-center">
                <div className="text-xs text-gray-500 uppercase">Time</div>
                <div className={`text-xl font-bold ${gameState.timeLeft < 10 ? 'text-red-500' : 'text-gray-800'}`}>
                  {gameState.timeLeft}s
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-500 uppercase">Wall Hits</div>
                <div className={`text-xl font-bold ${
                  gameState.wallHits >= gameState.maxWallHits - 1 ? 'text-red-500' : 'text-gray-800'
                }`}>
                  {gameState.wallHits}/{gameState.maxWallHits}
                </div>
              </div>
            </div>

            {/* Maze Canvas */}
            <canvas
              ref={canvasRef}
              width={CANVAS_WIDTH}
              height={CANVAS_HEIGHT}
              className="rounded-xl shadow-2xl cursor-crosshair bg-gray-50"
              style={{ maxWidth: '90vw', maxHeight: '60vh' }}
              onMouseMove={handleMouseMove}
            />

            {/* Instructions */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-blue-100 text-blue-800 px-4 py-2 rounded-lg text-sm">
              Move your finger to navigate • Avoid walls • Reach the exit!
            </div>

            {/* Feedback */}
            <AnimatePresence>
              {feedback && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  className="absolute top-1/4 left-1/2 -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg"
                >
                  💥 {feedback}
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}

        {/* Celebration */}
        <AnimatePresence>
          {showCelebration && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 flex items-center justify-center z-50"
            >
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white rounded-3xl p-8 text-center max-w-md"
              >
                <div className="text-6xl mb-4">🏆🎉</div>
                <h2 className="text-3xl font-bold text-gray-800 mb-2">Maze Complete!</h2>
                <p className="text-gray-600 mb-4">You navigated the maze perfectly!</p>
                {(() => {
                  const scores = calculateFinalScore(gameState);
                  return (
                    <>
                      <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                        <div className="bg-gray-100 p-2 rounded">
                          <div className="text-gray-500">Base Score</div>
                          <div className="font-bold">{scores.baseScore}</div>
                        </div>
                        <div className="bg-green-100 p-2 rounded">
                          <div className="text-green-600">Time Bonus</div>
                          <div className="font-bold">+{scores.timeBonus}</div>
                        </div>
                        <div className="bg-blue-100 p-2 rounded">
                          <div className="text-blue-600">Path Bonus</div>
                          <div className="font-bold">+{scores.pathBonus}</div>
                        </div>
                        <div className="bg-red-100 p-2 rounded">
                          <div className="text-red-600">Wall Penalty</div>
                          <div className="font-bold">-{scores.wallPenalty}</div>
                        </div>
                      </div>
                      <p className="text-3xl font-bold text-purple-600 mb-6">Total: {scores.total}</p>
                    </>
                  );
                })()}
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={handleGameComplete}
                    className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl"
                  >
                    Play Again
                  </button>
                  <button
                    onClick={() => navigate('/games')}
                    className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white font-bold rounded-xl"
                  >
                    Exit
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </GameContainer>
  );
});

export const MazeRunner = memo(function MazeRunnerShell() {
  return (
    <GameShell gameId="maze-runner" gameName="Maze Runner">
      <MazeRunnerContent />
    </GameShell>
  );
});

export default MazeRunner;
