/**
 * Math Jumpers Game
 *
 * A number line platformer where kids solve math problems by jumping
 * their character to the correct answer tile.
 *
 * "What is 2 + 3?" → Jump to tile "5"!
 *
 * @ticket GQ-002, GQ-003, GQ-004, GQ-005, GQ-007
 */

import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Webcam from 'react-webcam';
import { KenneyIcon } from '../components/ui/KenneyIcon';

import { GameShell } from '../components/GameShell';
import { GameContainer } from '../components/GameContainer';
import { useGameHandTracking } from '../hooks/useGameHandTracking';
import { useGameDrops } from '../hooks/useGameDrops';
import { useAudio } from '../utils/hooks/useAudio';
import { triggerHaptic } from '../utils/haptics';
import { useTTS } from '../hooks/useTTS';
import type { TrackedHandFrame } from '../types/tracking';
import {
  LEVEL_CONFIGS,
  type Difficulty,
  type GameState,
  createInitialState,
  startGame,
  movePlayerToPlatform,
  updatePlayerPosition,
  checkAnswer,
  nextProblem,
  updateTimer,
  getFeedbackMessage,
  calculateFinalScore,
} from '../games/mathJumpersLogic';

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;

export const MathJumpersContent = memo(function MathJumpersGame() {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const webcamRef = useRef<Webcam>(null);
  const gameLoopRef = useRef<number | null>(null);
  const lastTimeRef = useRef(0);
  
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [gameState, setGameState] = useState<GameState>(() => createInitialState());
  const [showCelebration, setShowCelebration] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; emoji: string } | null>(null);
  const [isLoading] = useState(false);
  
  const { onGameComplete } = useGameDrops('math-jumpers');
  const { playSuccess, playError, playCelebration } = useAudio();
  const { speak, isEnabled: ttsEnabled } = useTTS();
  
  const gameStateRef = useRef(gameState);
  gameStateRef.current = gameState;
  
  // Handle hand tracking - move player based on hand X position
  const handleHandFrame = useCallback((frame: TrackedHandFrame) => {
    if (!frame.indexTip || gameStateRef.current.status !== 'playing') return;
    
    const handX = frame.indexTip.x;
    
    // Find nearest platform to hand position
    const platforms = gameStateRef.current.platforms;
    if (platforms.length === 0) return;
    
    let nearestPlatform = platforms[0];
    let minDistance = Math.abs(platforms[0].x - handX);
    
    for (const platform of platforms) {
      const distance = Math.abs(platform.x - handX);
      if (distance < minDistance) {
        minDistance = distance;
        nearestPlatform = platform;
      }
    }
    
    // If close enough to a platform and not already jumping there, jump
    if (minDistance < 0.15 && !gameStateRef.current.player.isJumping) {
      setGameState((prev) => movePlayerToPlatform(prev, nearestPlatform.id));
    }
  }, []);
  
  const { handVisible } = useGameHandTracking({
    gameName: 'MathJumpers',
    webcamRef,
    onFrame: handleHandFrame,
  });
  
  // Game loop
  useEffect(() => {
    const gameLoop = (timestamp: number) => {
      const deltaTime = (timestamp - lastTimeRef.current) / 1000;
      lastTimeRef.current = timestamp;
      
      if (gameStateRef.current.status === 'playing') {
        setGameState((prev) => updatePlayerPosition(prev, deltaTime));
      }
      
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };
    
    gameLoopRef.current = requestAnimationFrame(gameLoop);
    
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, []);
  
  // Timer
  useEffect(() => {
    if (gameState.status !== 'playing') return;
    
    const timer = setInterval(() => {
      setGameState((prev) => {
        const updated = updateTimer(prev);
        if (updated.status === 'wrong' && prev.status === 'playing') {
          playError();
          if (ttsEnabled) speak('Time\'s up! Try the next one.');
        }
        return updated;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [gameState.status, playError, speak, ttsEnabled]);
  
  // Check answer when player lands on a platform
  useEffect(() => {
    if (gameState.player.onPlatform !== null && gameState.status === 'playing') {
      const { state: newState, isCorrect } = checkAnswer(gameState);
      
      if (isCorrect) {
        playSuccess();
        triggerHaptic('success');
        const fb = getFeedbackMessage(newState.streak);
        setFeedback(fb);
        if (ttsEnabled) {
          const noun = newState.problemsSolved === 1 ? 'problem' : 'problems';
          speak(`${fb.message}! ${newState.problemsSolved} ${noun} solved!`);
        }
        
        // Delay before next problem
        setTimeout(() => {
          setGameState((prev) => {
            const next = nextProblem(prev, difficulty);
            if (next.status === 'complete') {
              setShowCelebration(true);
              playCelebration();
              const finalScore = calculateFinalScore(next);
              onGameComplete(finalScore.total);
            }
            return next;
          });
          setFeedback(null);
        }, 1500);
      } else if (!isCorrect) {
        playError();
        triggerHaptic('error');
        if (ttsEnabled) speak('Not quite! Try again.');
        
        // Reset to try again
        setTimeout(() => {
          setGameState((prev) => ({
            ...prev,
            status: 'playing',
            player: {
              ...prev.player,
              x: 0.5,
              y: 0.3,
              targetX: null,
              isJumping: false,
              onPlatform: null,
            },
          }));
        }, 1500);
      }
      
      setGameState(newState);
    }
  }, [gameState.player.onPlatform, gameState.status, difficulty, playSuccess, playError, playCelebration, speak, ttsEnabled, onGameComplete]);
  
  // Draw canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || isLoading) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear
    ctx.fillStyle = '#87CEEB'; // Sky blue
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Draw clouds
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.beginPath();
    ctx.arc(150, 100, 40, 0, Math.PI * 2);
    ctx.arc(200, 100, 50, 0, Math.PI * 2);
    ctx.arc(250, 100, 40, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw platforms
    gameState.platforms.forEach((platform) => {
      const x = platform.x * CANVAS_WIDTH;
      const y = platform.y * CANVAS_HEIGHT;
      const w = platform.width * CANVAS_WIDTH;
      const h = platform.height * CANVAS_HEIGHT;
      
      // Platform base
      ctx.fillStyle = '#4CAF50';
      ctx.fillRect(x - w / 2, y, w, h);
      
      // Platform top
      ctx.fillStyle = '#81C784';
      ctx.fillRect(x - w / 2, y, w, 8);
      
      // Number on platform
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 32px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(platform.number.toString(), x, y + h / 2 + 10);
    });
    
    // Draw player
    const playerX = gameState.player.x * CANVAS_WIDTH;
    const playerY = gameState.player.y * CANVAS_HEIGHT;
    const playerSize = 50;
    
    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.beginPath();
    ctx.ellipse(playerX, playerY + playerSize + 10, 20, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Player character (emoji for now, could use Kenney sprite)
    ctx.font = '40px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(gameState.player.isJumping ? '🚀' : '👾', playerX, playerY + playerSize / 2);
    
  }, [gameState, isLoading]);
  
  const handleStart = useCallback(() => {
    setGameState((prev) => startGame(prev, difficulty));
    if (ttsEnabled) {
      const config = LEVEL_CONFIGS[difficulty];
      speak(`Solve ${config.totalProblems} math problems! Move your hand to jump to the answer!`);
    }
  }, [difficulty, speak, ttsEnabled]);
  
  const handlePlatformClick = useCallback((platformId: number) => {
    if (gameState.status !== 'playing') return;
    setGameState((prev) => movePlayerToPlatform(prev, platformId));
  }, [gameState.status]);
  
  const handleGameComplete = useCallback(() => {
    const finalScore = calculateFinalScore(gameState);
    onGameComplete(finalScore.total);
    navigate('/games');
  }, [gameState, onGameComplete, navigate]);
  
  return (
    <GameContainer
      title="Math Jumpers"
      score={gameState.score}
      showScore={gameState.status !== 'idle'}
      isPlaying={gameState.status === 'playing'}
      isHandDetected={handVisible}
      webcamRef={webcamRef}
    >
      <div className="relative w-full h-full flex flex-col items-center justify-center">
        {isLoading ? (
          <div className="text-2xl text-white">Loading...</div>
        ) : gameState.status === 'idle' ? (
          <div className="flex flex-col items-center gap-6">
            <h2 className="text-3xl font-bold text-white">Choose Difficulty</h2>
            <div className="flex gap-4">
              {(['easy', 'medium', 'hard'] as Difficulty[]).map((diff) => (
                <button
                  key={diff}
                  onClick={() => setDifficulty(diff)}
                  className={`px-6 py-3 rounded-xl font-bold capitalize transition-all ${
                    difficulty === diff
                      ? 'bg-yellow-400 text-yellow-900 scale-110'
                      : 'bg-white/20 text-white hover:bg-white/30'
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
              Start Game! 🚀
            </button>
          </div>
        ) : (
          <>
            {/* Problem Display */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/90 px-8 py-4 rounded-2xl shadow-xl">
              <div className="text-4xl font-bold text-gray-800">
                {gameState.problem?.display || '⏳ Get ready…'}
              </div>
            </div>
            
            {/* Streak Display */}
            {gameState.streak > 1 && (
              <div className="absolute top-4 right-4 bg-orange-500 text-white px-4 py-2 rounded-full font-bold">
                🔥 {gameState.streak} streak!
              </div>
            )}
            
            {/* Game Canvas */}
            <canvas
              ref={canvasRef}
              width={CANVAS_WIDTH}
              height={CANVAS_HEIGHT}
              className="rounded-xl shadow-2xl"
              style={{ maxWidth: '100%', maxHeight: '70vh' }}
              aria-label="Math Jumpers game area"
              role="img"
            />
            
            {/* Platform Buttons (for mouse/touch) */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-4">
              {gameState.platforms.map((platform) => (
                <button
                  key={platform.id}
                  onClick={() => handlePlatformClick(platform.id)}
                  disabled={gameState.status !== 'playing' || gameState.player.isJumping}
                  aria-label={`Jump to ${platform.number}`}
                  className={`w-16 h-16 rounded-xl font-bold text-2xl transition-all ${
                    gameState.player.onPlatform === platform.id
                      ? 'bg-green-500 text-white scale-110'
                      : 'bg-white/80 text-gray-800 hover:bg-white hover:scale-105'
                  } ${gameState.status !== 'playing' ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {platform.number}
                </button>
              ))}
            </div>
            
            {/* Feedback */}
            <AnimatePresence>
              {feedback && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-yellow-400 text-yellow-900 px-8 py-4 rounded-2xl text-2xl font-bold shadow-2xl"
                >
                  {feedback.emoji} {feedback.message}
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Progress */}
            <div className="absolute bottom-4 left-4 bg-white/80 px-4 py-2 rounded-lg text-gray-800 font-bold">
              Problem {gameState.problemsSolved + 1} of {gameState.totalProblems}
            </div>
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
                <KenneyIcon type="star" size={80} className="mx-auto mb-4" />
                <h2 className="text-3xl font-bold text-gray-800 mb-2">Game Complete!</h2>
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
                    Play Again
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

export const MathJumpers = memo(function MathJumpersShell() {
  return (
    <GameShell gameId="math-jumpers" gameName="Math Jumpers" showWellnessTimer={true} enableErrorBoundary={true}>
      <MathJumpersContent />
    </GameShell>
  );
});

export default MathJumpers;
