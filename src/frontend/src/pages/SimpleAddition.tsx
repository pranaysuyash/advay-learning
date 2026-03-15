/**
 * Simple Addition Game
 *
 * Kids solve addition problems with visual representations.
 * "2 + 3 = ?" shown with apples, stars, blocks, or balls!
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
import { useAutoGameCompletion } from '../hooks/useAutoGameCompletion';
import { useAudio } from '../utils/hooks/useAudio';
import { triggerHaptic } from '../utils/haptics';
import { useTTS } from '../hooks/useTTS';
import type { TrackedHandFrame } from '../types/tracking';
import {
  type Difficulty,
  type GameState,
  createInitialState,
  startGame,
  checkAnswer,
  nextProblem,
  updateTimer,
  calculateFinalScore,
  getFeedbackMessage,
  getDifficultyName,
  getVisualEmoji,
} from '../games/simpleAdditionLogic';

export const SimpleAdditionContent = memo(function SimpleAdditionGame() {
  const navigate = useNavigate();
  const webcamRef = useRef<Webcam>(null);

  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [gameState, setGameState] = useState<GameState>(() => createInitialState());
  const [showCelebration, setShowCelebration] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; emoji: string } | null>(null);
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number } | null>(null);
  const [hoveredOption, setHoveredOption] = useState<number | null>(null);

  const { playSuccess, playError, playCelebration } = useAudio();
  const { speak, isEnabled: ttsEnabled } = useTTS();
  const finalScore = gameState.status === 'complete' ? calculateFinalScore(gameState).total : gameState.score;
  const { resetAutoCompletion } = useAutoGameCompletion('simple-addition', {
    when: gameState.status === 'complete',
    score: finalScore,
    level: difficulty === 'easy' ? 1 : difficulty === 'medium' ? 2 : 3,
    metadata: {
      difficulty,
      problemsSolved: gameState.problemsSolved,
      streak: gameState.streak,
    },
  });

  const gameStateRef = useRef(gameState);
  gameStateRef.current = gameState;

  const problem = gameState.currentProblem;

  // Handle hand tracking
  const handleHandFrame = useCallback((frame: TrackedHandFrame) => {
    if (!frame.indexTip) return;

    const cursor = { x: frame.indexTip.x, y: frame.indexTip.y };
    setCursorPos(cursor);

    // Check if hovering over an option in the 2-column grid
    if (gameStateRef.current.status === 'playing' && problem) {
      const options = problem.options;
      const numCols = 2; // Assuming 2 columns on mobile/tablet view

      for (let i = 0; i < options.length; i++) {
        const row = Math.floor(i / numCols);
        const col = i % numCols;

        // Define zones (normalized 0-1)
        // Adjust these to match the grid visually
        const zoneWidth = 0.3;
        const zoneHeight = 0.15;
        const startX = 0.2 + col * 0.35;
        const startY = 0.5 + row * 0.2;

        if (cursor.x >= startX && cursor.x < startX + zoneWidth &&
          cursor.y >= startY && cursor.y < startY + zoneHeight) {
          setHoveredOption(i);
          return;
        }
      }
      setHoveredOption(null);
    }

    // Handle pinch selection
    if (frame.pinch?.state.isPinching && hoveredOption !== null &&
      gameStateRef.current.status === 'playing') {
      handleSelectAnswer(problem!.options[hoveredOption]);
    }
  }, [hoveredOption, problem]);

  const { handVisible } = useGameHandTracking({
    gameName: 'SimpleAddition',
    webcamRef,
    onFrame: handleHandFrame,
  });

  // Timer
  useEffect(() => {
    if (gameState.status !== 'playing') return;

    const timer = setInterval(() => {
      setGameState((prev) => {
        const updated = updateTimer(prev);
        if (updated.status === 'wrong' && prev.status === 'playing') {
          playError();
          if (ttsEnabled) speak("Time's up!");
          setTimeout(() => {
            setGameState((p) => nextProblem(p));
            setFeedback(null);
          }, 1500);
        }
        return updated;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState.status, playError, speak, ttsEnabled]);

  const handleSelectAnswer = useCallback((answer: number) => {
    if (gameState.status !== 'playing') return;

    const { state: newState, isCorrect } = checkAnswer(gameState, answer);
    setGameState(newState);

    if (isCorrect) {
      playSuccess();
      triggerHaptic('success');
      const fb = getFeedbackMessage(newState.streak);
      setFeedback(fb);
      if (ttsEnabled) speak(`${fb.message}! ${answer} is correct!`);

      // Check if game complete
      if (newState.problemsSolved >= newState.totalProblems) {
        setTimeout(() => {
          setGameState((prev) => {
            const completed = { ...prev, status: 'complete' as const };
            setShowCelebration(true);
            playCelebration();
            return completed;
          });
        }, 1500);
      } else {
        // Next problem after delay
        setTimeout(() => {
          setGameState((prev) => {
            const next = nextProblem(prev);
            if (next.currentProblem && ttsEnabled) {
              const p = next.currentProblem;
              speak(`${p.num1} plus ${p.num2} equals what?`);
            }
            return next;
          });
          setFeedback(null);
        }, 1500);
      }
    } else {
      playError();
      triggerHaptic('error');
      setFeedback({ message: 'Try again!', emoji: '❌' });
      if (ttsEnabled) speak("Not quite! Try again!");

      setTimeout(() => {
        setGameState((prev) => ({ ...prev, status: 'playing' }));
        setFeedback(null);
      }, 1500);
    }
  }, [gameState, playSuccess, playError, playCelebration, speak, ttsEnabled]);

  const handleStart = useCallback(() => {
    resetAutoCompletion();
    setGameState((prev) => startGame(prev, difficulty));
    if (ttsEnabled) {
      speak(`Let's practice addition! Choose the correct answer!`);
    }
  }, [difficulty, speak, ttsEnabled, resetAutoCompletion]);

  // Auto-start game on mount (skip pre-game menu for instant play)
  useEffect(() => {
    if (gameState.status === 'idle') {
      // Small delay for camera to initialize
      const timer = setTimeout(() => {
        handleStart();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [gameState.status, handleStart]);

  const handleGameComplete = useCallback(() => {
    setShowCelebration(false);
    resetAutoCompletion();
    setGameState(createInitialState());
  }, [resetAutoCompletion]);

  // Render visual representations
  const renderVisuals = (count: number, emoji: string) => {
    return (
      <div className="flex flex-wrap gap-2 justify-center max-w-[200px]">
        {Array.from({ length: count }).map((_, i) => (
          <motion.span
            key={i}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="text-3xl"
          >
            {emoji}
          </motion.span>
        ))}
      </div>
    );
  };

  return (
    <GameContainer
      title="Simple Addition"
      score={gameState.score}
      isPlaying={gameState.status === 'playing'}
      isHandDetected={handVisible}
      webcamRef={webcamRef}
    >
      <div className="relative w-full h-full flex flex-col items-center justify-center p-4">
        {gameState.status === 'idle' ? (
          <div className="flex flex-col items-center gap-6">
            <h2 className="text-4xl font-bold text-gray-800">Simple Addition</h2>
            <p className="text-gray-600 text-center max-w-md text-lg">
              Solve addition problems with pictures!
              <br />
              🍎➕🍎🟰❓
            </p>

            <div className="flex gap-4">
              {(['easy', 'medium', 'hard'] as Difficulty[]).map((diff) => (
                <button
                  key={diff}
                  onClick={() => setDifficulty(diff)}
                  className={`px-6 py-3 rounded-xl font-bold capitalize transition-all ${difficulty === diff
                      ? 'bg-green-500 text-white scale-110'
                      : 'bg-white text-gray-700 hover:bg-gray-100 shadow-md'
                    }`}
                >
                  {getDifficultyName(diff)}
                </button>
              ))}
            </div>

            <button
              onClick={handleStart}
              className="mt-4 px-8 py-4 bg-blue-500 hover:bg-blue-600 text-white text-xl font-bold rounded-2xl shadow-lg transition-all hover:scale-105"
            >
              Start Adding! ➕
            </button>
          </div>
        ) : (
          <>
            {/* Progress */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white px-6 py-2 rounded-full shadow-md">
              <span className="text-gray-600 font-medium">
                Problem {gameState.problemsSolved + 1} of {gameState.totalProblems}
              </span>
            </div>

            {/* Streak */}
            {gameState.streak > 1 && (
              <div className="absolute top-4 right-4 bg-orange-500 text-white px-4 py-2 rounded-full font-bold">
                🔥 {gameState.streak} streak
              </div>
            )}

            {/* Timer */}
            <div className={`absolute top-4 left-4 px-4 py-2 rounded-full font-bold ${gameState.timeLeft < 10 ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-700'
              }`}>
              ⏱️ {gameState.timeLeft}s
            </div>

            {/* Problem Display */}
            {problem && (
              <div className="flex flex-col items-center gap-6">
                {/* Visual representation */}
                <div className="flex items-center gap-8">
                  <div className="flex flex-col items-center gap-2">
                    {renderVisuals(problem.num1, getVisualEmoji(problem.visualType))}
                    <span className="text-2xl font-bold text-gray-700">{problem.num1}</span>
                  </div>

                  <span className="text-5xl font-bold text-blue-500">+</span>

                  <div className="flex flex-col items-center gap-2">
                    {renderVisuals(problem.num2, getVisualEmoji(problem.visualType))}
                    <span className="text-2xl font-bold text-gray-700">{problem.num2}</span>
                  </div>

                  <span className="text-5xl font-bold text-gray-400">=</span>

                  <div className="flex flex-col items-center gap-2">
                    <div className="w-20 h-20 border-4 border-dashed border-gray-300 rounded-xl flex items-center justify-center">
                      <span className="text-4xl">?</span>
                    </div>
                    <span className="text-2xl font-bold text-gray-400">?</span>
                  </div>
                </div>

                {/* Answer Options */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                  {problem.options.map((option, index) => (
                    <motion.button
                      key={option}
                      onClick={() => handleSelectAnswer(option)}
                      disabled={gameState.status !== 'playing'}
                      whileHover={{ scale: gameState.status === 'playing' ? 1.05 : 1 }}
                      whileTap={{ scale: gameState.status === 'playing' ? 0.95 : 1 }}
                      className={`
                        relative px-8 py-6 rounded-2xl text-3xl font-bold transition-all
                        ${hoveredOption === index ? 'ring-4 ring-blue-400' : ''}
                        ${gameState.status !== 'playing'
                          ? 'opacity-50 cursor-not-allowed bg-gray-100'
                          : 'bg-white hover:bg-blue-50 shadow-lg cursor-pointer'
                        }
                      `}
                    >
                      {option}
                      {hoveredOption === index && gameState.status === 'playing' && (
                        <motion.div
                          layoutId="hover"
                          className="absolute inset-0 border-4 border-blue-400 rounded-2xl"
                        />
                      )}
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* Feedback */}
            <AnimatePresence>
              {feedback && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
                    px-8 py-4 rounded-2xl text-2xl font-bold shadow-2xl
                    ${feedback.message === 'Try again!' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}
                  `}
                >
                  {feedback.emoji} {feedback.message}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Cursor */}
            {cursorPos && (
              <div
                className="absolute w-4 h-4 bg-blue-500 rounded-full pointer-events-none"
                style={{
                  left: `${cursorPos.x * 100}%`,
                  top: `${cursorPos.y * 100}%`,
                  transform: 'translate(-50%, -50%)',
                }}
              />
            )}
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
                <div className="text-6xl mb-4">🎉🏆🎉</div>
                <h2 className="text-3xl font-bold text-gray-800 mb-2">Great Job!</h2>
                <p className="text-gray-600 mb-4">You're a math superstar!</p>
                {(() => {
                  const scores = calculateFinalScore(gameState);
                  return (
                    <>
                      <p className="text-xl text-gray-600 mb-2">Score: {scores.baseScore}</p>
                      <p className="text-lg text-green-600 mb-1">Accuracy Bonus: +{scores.accuracyBonus}</p>
                      <p className="text-lg text-orange-600 mb-4">Streak Bonus: +{scores.streakBonus}</p>
                      <p className="text-3xl font-bold text-blue-600 mb-6">Total: {scores.total}</p>
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
                    className="px-6 py-3 bg-[#10B981] hover:bg-emerald-600 text-white font-bold rounded-xl"
                  >
                    More Games 🎮
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

export const SimpleAddition = memo(function SimpleAdditionShell() {
  return (
    <GameShell gameId="simple-addition" gameName="Simple Addition">
      <SimpleAdditionContent />
    </GameShell>
  );
});

export default SimpleAddition;
