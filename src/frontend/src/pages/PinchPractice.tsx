/**
 * Pinch Practice Game
 *
 * Fine motor skill exercises using pinch gestures:
 * - Hold: Pinch and hold targets
 * - Drag: Move objects to zones
 * - Sort: Sort colored balls to matching zones
 * - Target: Hit numbered targets in order
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
import { useGameDrops } from '../hooks/useGameDrops';
import { useAudio } from '../utils/hooks/useAudio';
import { triggerHaptic } from '../utils/haptics';
import { useTTS } from '../hooks/useTTS';
import type { TrackedHandFrame } from '../types/tracking';
import {
  type Difficulty,
  type GameState,
  createInitialState,
  startGame,
  handlePinchStart,
  handlePinchHold,
  handlePinchRelease,
  completeExercise,
  nextExercise,
  updateTimer,
  getFeedbackMessage,
  calculateFinalScore,
  getExerciseTypeName,
} from '../games/pinchPracticeLogic';

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;

export const PinchPracticeContent = memo(function PinchPracticeGame() {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const webcamRef = useRef<Webcam>(null);
  
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [gameState, setGameState] = useState<GameState>(() => createInitialState());
  const [showCelebration, setShowCelebration] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; emoji: string } | null>(null);
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number } | null>(null);
  
  const { onGameComplete } = useGameDrops('pinch-practice');
  const { playSuccess, playCelebration } = useAudio();
  const { speak, isEnabled: ttsEnabled } = useTTS();
  
  const gameStateRef = useRef(gameState);
  gameStateRef.current = gameState;
  
  // Get current exercise
  const currentExercise = gameState.exercises[gameState.currentExerciseIndex];
  
  // Handle hand tracking
  const handleHandFrame = useCallback((frame: TrackedHandFrame) => {
    if (!frame.indexTip) return;
    
    const cursor = { x: frame.indexTip.x, y: frame.indexTip.y };
    setCursorPos(cursor);
    
    const state = gameStateRef.current;
    if (state.status !== 'playing') return;
    
    const timestamp = Date.now();
    
    if (frame.pinch?.state.isPinching) {
      if (!state.heldTargetId) {
        // Starting pinch - try to grab
        setGameState((prev) => handlePinchStart(prev, cursor, timestamp));
      } else {
        // Continuing pinch - hold/drag
        setGameState((prev) => handlePinchHold(prev, cursor, timestamp));
      }
    } else if (state.heldTargetId) {
      // Released pinch - drop
      const { state: newState, exerciseComplete } = handlePinchRelease(
        state,
        cursor,
        timestamp
      );
      
      setGameState(newState);
      
      if (exerciseComplete) {
        playSuccess();
        triggerHaptic('success');
        const fb = getFeedbackMessage(newState.streak);
        setFeedback(fb);
        if (ttsEnabled) speak(`${fb.message}! Exercise complete!`);
        
        // Complete exercise after delay
        setTimeout(() => {
          setGameState((prev) => {
            const completed = completeExercise(prev);
            if (completed.status === 'complete') {
              setShowCelebration(true);
              playCelebration();
              const finalScore = calculateFinalScore(completed);
              onGameComplete(finalScore.total);
            }
            return completed;
          });
          setFeedback(null);
          
          // Move to next exercise after celebration
          setTimeout(() => {
            setGameState((prev) => nextExercise(prev));
          }, 1500);
        }, 500);
      }
    }
  }, [playSuccess, playCelebration, speak, ttsEnabled, onGameComplete]);
  
  const { handVisible, pinch } = useGameHandTracking({
    gameName: 'PinchPractice',
    webcamRef,
    onFrame: handleHandFrame,
  });
  
  // Timer
  useEffect(() => {
    if (gameState.status !== 'playing') return;
    
    const timer = setInterval(() => {
      setGameState((prev) => updateTimer(prev));
    }, 1000);
    
    return () => clearInterval(timer);
  }, [gameState.status]);
  
  // Draw canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear
    ctx.fillStyle = '#f5f5f5';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Draw grid pattern
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 1;
    for (let i = 0; i < CANVAS_WIDTH; i += 50) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, CANVAS_HEIGHT);
      ctx.stroke();
    }
    for (let i = 0; i < CANVAS_HEIGHT; i += 50) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(CANVAS_WIDTH, i);
      ctx.stroke();
    }
    
    if (!currentExercise) return;
    
    // Draw drop zones first (behind targets)
    currentExercise.dropZones?.forEach((zone) => {
      const x = zone.x * CANVAS_WIDTH;
      const y = zone.y * CANVAS_HEIGHT;
      const w = zone.width * CANVAS_WIDTH;
      const h = zone.height * CANVAS_HEIGHT;
      
      // Zone background
      ctx.fillStyle = zone.color;
      ctx.fillRect(x - w / 2, y - h / 2, w, h);
      
      // Zone border
      ctx.strokeStyle = zone.acceptedColors[0] || '#666';
      ctx.lineWidth = 3;
      ctx.strokeRect(x - w / 2, y - h / 2, w, h);
      
      // Zone label
      ctx.fillStyle = '#666';
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(zone.label, x, y + 5);
    });
    
    // Draw targets
    currentExercise.targets.forEach((target) => {
      const x = target.x * CANVAS_WIDTH;
      const y = target.y * CANVAS_HEIGHT;
      const r = target.radius * Math.min(CANVAS_WIDTH, CANVAS_HEIGHT);
      
      // Target glow if held
      if (target.held) {
        ctx.beginPath();
        ctx.arc(x, y, r + 10, 0, Math.PI * 2);
        ctx.fillStyle = `${target.color}40`;
        ctx.fill();
      }
      
      // Target circle
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = target.color;
      ctx.fill();
      
      // Target border
      ctx.strokeStyle = target.held ? '#fff' : '#333';
      ctx.lineWidth = target.held ? 4 : 2;
      ctx.stroke();
      
      // Hold progress ring (for hold exercise)
      if (target.held && target.holdProgress > 0) {
        ctx.beginPath();
        ctx.arc(x, y, r + 8, -Math.PI / 2, (-Math.PI / 2) + (target.holdProgress / 100) * Math.PI * 2);
        ctx.strokeStyle = '#4CAF50';
        ctx.lineWidth = 4;
        ctx.stroke();
      }
      
      // Target label
      if (target.label) {
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 16px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(target.label, x, y);
      }
    });
    
    // Draw cursor
    if (cursorPos) {
      const cx = cursorPos.x * CANVAS_WIDTH;
      const cy = cursorPos.y * CANVAS_HEIGHT;
      
      // Cursor dot
      ctx.beginPath();
      ctx.arc(cx, cy, 8, 0, Math.PI * 2);
      ctx.fillStyle = pinch?.isPinching ? '#4CAF50' : '#2196F3';
      ctx.fill();
      
      // Cursor ring
      ctx.beginPath();
      ctx.arc(cx, cy, 12, 0, Math.PI * 2);
      ctx.strokeStyle = pinch?.isPinching ? '#4CAF50' : '#2196F3';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Pinch indicator
      if (pinch?.isPinching) {
        ctx.beginPath();
        ctx.arc(cx, cy, 16, 0, Math.PI * 2);
        ctx.strokeStyle = '#4CAF50';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }
  }, [currentExercise, cursorPos, pinch]);
  
  const handleStart = useCallback(() => {
    setGameState((prev) => startGame(prev, difficulty));
    if (ttsEnabled) {
      speak('Pinch Practice! Use your fingers to pinch and move objects!');
    }
  }, [difficulty, speak, ttsEnabled]);
  
  const handleGameComplete = useCallback(() => {
    const finalScore = calculateFinalScore(gameState);
    onGameComplete(finalScore.total);
    navigate('/games');
  }, [gameState, onGameComplete, navigate]);
  
  // Mouse fallback handlers
  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (gameState.status !== 'playing') return;
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const cursor = {
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    };
    
    const timestamp = Date.now();
    setGameState((prev) => handlePinchStart(prev, cursor, timestamp));
  }, [gameState.status]);
  
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const cursor = {
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    };
    
    setCursorPos(cursor);
    
    if (gameState.status === 'playing' && gameState.heldTargetId) {
      const timestamp = Date.now();
      setGameState((prev) => handlePinchHold(prev, cursor, timestamp));
    }
  }, [gameState.status, gameState.heldTargetId]);
  
  const handleMouseUp = useCallback(() => {
    if (gameState.status !== 'playing' || !gameState.heldTargetId) return;
    
    const cursor = cursorPos || { x: 0.5, y: 0.5 };
    const timestamp = Date.now();
    
    const { state: newState, exerciseComplete } = handlePinchRelease(
      gameState,
      cursor,
      timestamp
    );
    
    setGameState(newState);
    
    if (exerciseComplete) {
      playSuccess();
      triggerHaptic('success');
      const fb = getFeedbackMessage(newState.streak);
      setFeedback(fb);
      
      setTimeout(() => {
        setGameState((prev) => {
          const completed = completeExercise(prev);
          if (completed.status === 'complete') {
            setShowCelebration(true);
            playCelebration();
            const finalScore = calculateFinalScore(completed);
            onGameComplete(finalScore.total);
          }
          return completed;
        });
        setFeedback(null);
        
        setTimeout(() => {
          setGameState((prev) => nextExercise(prev));
        }, 1500);
      }, 500);
    }
  }, [gameState, cursorPos, playSuccess, playCelebration, onGameComplete]);
  
  return (
    <GameContainer
      title="Pinch Practice"
      score={gameState.score}
      isPlaying={gameState.status === 'playing'}
      isHandDetected={handVisible}
      webcamRef={webcamRef}
    >
      <div className="relative w-full h-full flex flex-col items-center justify-center">
        {gameState.status === 'idle' ? (
          <div className="flex flex-col items-center gap-6">
            <h2 className="text-3xl font-bold text-gray-800">Choose Difficulty</h2>
            <p className="text-gray-600 text-center max-w-md">
              Practice your fine motor skills with pinch exercises!
              <br />
              🤏 Pinch to grab, move, and sort objects
            </p>
            <div className="flex gap-4">
              {(['easy', 'medium', 'hard'] as Difficulty[]).map((diff) => (
                <button
                  key={diff}
                  onClick={() => setDifficulty(diff)}
                  className={`px-6 py-3 rounded-xl font-bold capitalize transition-all ${
                    difficulty === diff
                      ? 'bg-blue-500 text-white scale-110'
                      : 'bg-white text-gray-700 hover:bg-gray-100 shadow-md'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
            <button
              onClick={handleStart}
              className="mt-4 px-8 py-4 bg-green-500 hover:bg-green-600 text-white text-xl font-bold rounded-2xl shadow-lg transition-all hover:scale-105"
            >
              Start Practice! 🤏
            </button>
          </div>
        ) : (
          <>
            {/* Exercise Info */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white px-6 py-3 rounded-2xl shadow-xl">
              <div className="text-sm text-gray-500 uppercase tracking-wide">
                Exercise {gameState.exercisesCompleted + 1} of {gameState.totalExercises}
              </div>
              <div className="text-lg font-bold text-gray-800">
                {currentExercise && getExerciseTypeName(currentExercise.type)}
              </div>
            </div>
            
            {/* Instructions */}
            {currentExercise && (
              <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-blue-100 text-blue-800 px-6 py-3 rounded-xl shadow-md max-w-md text-center">
                {currentExercise.instructions}
              </div>
            )}
            
            {/* Streak Display */}
            {gameState.streak > 1 && (
              <div className="absolute top-4 right-4 bg-orange-500 text-white px-4 py-2 rounded-full font-bold shadow-lg">
                🔥 {gameState.streak} streak
              </div>
            )}
            
            {/* Game Canvas */}
            <canvas
              ref={canvasRef}
              width={CANVAS_WIDTH}
              height={CANVAS_HEIGHT}
              className="rounded-xl shadow-2xl cursor-crosshair"
              style={{ maxWidth: '100%', maxHeight: '60vh' }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            />
            
            {/* Pinch Status */}
            <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-white/80 px-4 py-2 rounded-lg">
              <div className={`w-3 h-3 rounded-full ${pinch?.isPinching ? 'bg-green-500' : 'bg-gray-400'}`} />
              <span className="text-sm font-medium text-gray-700">
                {pinch?.isPinching ? 'Pinching!' : 'Not pinching'}
              </span>
            </div>
            
            {/* Feedback */}
            <AnimatePresence>
              {feedback && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-green-500 text-white px-8 py-4 rounded-2xl text-2xl font-bold shadow-2xl"
                >
                  {feedback.emoji} {feedback.message}
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
                <div className="text-6xl mb-4">🤏🎉</div>
                <h2 className="text-3xl font-bold text-gray-800 mb-2">Practice Complete!</h2>
                <p className="text-gray-600 mb-4">Your pinch skills are improving!</p>
                {(() => {
                  const scores = calculateFinalScore(gameState);
                  return (
                    <>
                      <p className="text-xl text-gray-600 mb-2">Base Score: {scores.baseScore}</p>
                      <p className="text-lg text-green-600 mb-1">Accuracy Bonus: +{scores.accuracyBonus}</p>
                      <p className="text-lg text-orange-600 mb-4">Streak Bonus: +{scores.streakBonus}</p>
                      <p className="text-3xl font-bold text-purple-600 mb-6">Total: {scores.total}</p>
                    </>
                  );
                })()}
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={() => {
                      setShowCelebration(false);
                      setGameState(createInitialState());
                    }}
                    className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl"
                  >
                    Practice Again
                  </button>
                  <button
                    onClick={handleGameComplete}
                    className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl"
                  >
                    Done
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

export const PinchPractice = memo(function PinchPracticeShell() {
  return (
    <GameShell gameId="pinch-practice" gameName="Pinch Practice">
      <PinchPracticeContent />
    </GameShell>
  );
});

export default PinchPractice;
