/**
 * Bubble Pop Game - REFACTORED with GameShell
 *
 * Demonstrates GameShell integration pattern for quality compliance.
 * 
 * @ticket GQ-003 - Progress tracking
 * @ticket GQ-004 - Error handling
 * @ticket GQ-007 - Wellness features
 */

import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { GameShell } from '../components/GameShell';
import { GameContainer } from '../components/GameContainer';
import { useGameProgress } from '../hooks/useGameProgress';
import { CelebrationOverlay } from '../components/CelebrationOverlay';
import { useGameDrops } from '../hooks/useGameDrops';
import { useAudio } from '../utils/hooks/useAudio';
import { useMicrophoneInput } from '../hooks/useMicrophoneInput';
import { useTTS } from '../hooks/useTTS';
import { VoiceInstructions } from '../components/game/VoiceInstructions';
import {
  initializeGame,
  startGame,
  updateBubbles,
  checkBlowHits,
  getStats,
  endGame,
  type GameState,
  type Bubble,
} from '../games/bubblePopLogic';

const TARGET_FPS = 60;
const FRAME_TIME = 1000 / TARGET_FPS;

// Inner game component - receives progress hook from GameShell wrapper
interface BubblePopGameProps {
  saveProgress: (data: { score: number; completed: boolean; level?: number; metadata?: Record<string, unknown> }) => Promise<void>;
}

const BubblePopGame = memo(function BubblePopGameComponent({ saveProgress }: BubblePopGameProps) {
  const navigate = useNavigate();
  const reducedMotion = useReducedMotion();
  const { onGameComplete } = useGameDrops('bubble-pop');

  // Audio
  const { playClick, playLevelUp: _playLevelUp } = useAudio();
  const { speak, stop: stopTTS, isEnabled: ttsEnabled } = useTTS();

  // Game state
  const [gameState, setGameState] = useState<GameState>(initializeGame());
  const [showMenu, setShowMenu] = useState(true);
  const [showCelebration, setShowCelebration] = useState(false);

  // Animation refs
  const lastFrameTimeRef = useRef<number>(0);
  const animationFrameRef = useRef<number | null>(null);
  const gameStateRef = useRef<GameState>(gameState);

  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  // Save progress on game complete - using GameShell's saveProgress
  const handleGameComplete = useCallback(
    async (finalScore: number) => {
      try {
        await saveProgress({
          score: finalScore,
          completed: true,
          level: gameState.level,
          metadata: {
            poppedCount: gameState.poppedCount,
            missedCount: gameState.missedCount,
          },
        });
        onGameComplete(finalScore);
      } catch (err) {
        // Error handled by GameShell error boundary
        console.error('Failed to save progress:', err);
      }
    },
    [saveProgress, gameState.level, gameState.poppedCount, gameState.missedCount, onGameComplete]
  );

  // Microphone input for blow detection
  const {
    isActive,
    volume,
    isBlowing,
    error: micError,
    start,
    stop,
  } = useMicrophoneInput({
    blowThreshold: 0.12,
    minBlowDuration: 100,
    cooldown: 200,
    onBlow: () => {
      setGameState((prev) => {
        const newState = checkBlowHits(prev, 0.5);
        if (ttsEnabled && newState.poppedCount > prev.poppedCount) {
          const newlyPopped = newState.poppedCount - prev.poppedCount;
          if (newState.poppedCount % 5 === 0) {
            void speak(`${newState.poppedCount} bubbles popped! Great job!`);
          } else if (newlyPopped >= 3) {
            void speak('Wow! You popped a lot!');
          }
        }
        return newState;
      });
    },
  });

  // Handle mic error
  useEffect(() => {
    if (micError) {
      // Error will be caught by GameShell error boundary
      throw new Error(`Microphone error: ${micError}`);
    }
  }, [micError]);

  // Game loop
  const gameLoop = useCallback(
    (timestamp: number) => {
      if (!lastFrameTimeRef.current) {
        lastFrameTimeRef.current = timestamp;
      }

      const deltaTime = timestamp - lastFrameTimeRef.current;

      if (deltaTime >= FRAME_TIME) {
        setGameState((prev) => {
          let newState = updateBubbles(prev, deltaTime);

          if (isActive && volume > 0.12) {
            newState = checkBlowHits(newState, volume);
          }

          // Check for game over
          if (newState.timeLeft <= 0 && !prev.gameOver) {
            newState = endGame(newState);
            void handleGameComplete(newState.score);
            setShowCelebration(true);
          }

          return newState;
        });

        lastFrameTimeRef.current = timestamp;
      }

      if (!gameStateRef.current.gameOver) {
        animationFrameRef.current = requestAnimationFrame(gameLoop);
      }
    },
    [isActive, volume, handleGameComplete]
  );

  // Start/stop game loop
  useEffect(() => {
    if (!showMenu && !gameState.gameOver) {
      animationFrameRef.current = requestAnimationFrame(gameLoop);
    }
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [showMenu, gameState.gameOver, gameLoop]);

  // Cleanup microphone on unmount
  useEffect(() => {
    return () => {
      stop();
      stopTTS();
    };
  }, [stop, stopTTS]);

  // Start game handler
  const handleStartGame = async () => {
    playClick();
    await start();
    setGameState(startGame(gameState));
    setShowMenu(false);
    setShowCelebration(false);
    lastFrameTimeRef.current = 0;
  };

  // Reset game handler
  const handleResetGame = () => {
    playClick();
    stop();
    stopTTS();
    setGameState(initializeGame());
    setShowMenu(true);
    setShowCelebration(false);
    lastFrameTimeRef.current = 0;
  };

  // Stats for display
  const stats = getStats(gameState);

  return (
    <GameContainer
      title="Bubble Pop"
      score={gameState.score}
      onHome={() => {
        stop();
        navigate('/games');
      }}
      onPause={() => {
        stop();
        setShowMenu(true);
      }}
      isPlaying={!showMenu && !gameState.gameOver}
    >
      <VoiceInstructions
        instructions={[
          'Blow into the microphone to pop bubbles!',
          'The louder you blow, the more bubbles pop!',
        ]}
        autoSpeak={showMenu}
      />

      {/* Game Content */}
      <div className="relative w-full h-full flex flex-col items-center justify-center p-4">
        {/* Menu Screen */}
        {showMenu && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-[2.5rem] p-8 border-3 border-[#F2CC8F] shadow-[0_4px_0_#E5B86E] text-center max-w-md w-full"
          >
            <div className="text-6xl mb-4">🫧</div>
            <h1 className="text-4xl font-black text-advay-slate mb-4">Bubble Pop</h1>
            <p className="text-lg text-text-secondary mb-6">
              Blow into your microphone to pop bubbles!
            </p>
            <button
              onClick={handleStartGame}
              className="w-full py-4 bg-[#3B82F6] hover:bg-blue-600 text-white rounded-[1.5rem] font-black text-xl shadow-[0_4px_0_#1D4ED8] transition-all"
            >
              Start Blowing!
            </button>
          </motion.div>
        )}

        {/* Game Screen */}
        {!showMenu && (
          <>
            {/* Score */}
            <div className="absolute top-4 right-4 bg-white rounded-2xl px-6 py-3 border-3 border-[#F2CC8F] shadow-[0_4px_0_#E5B86E]">
              <div className="text-sm font-bold text-text-secondary">Score</div>
              <div className="text-3xl font-black text-advay-slate">{gameState.score}</div>
            </div>

            {/* Time */}
            <div className="absolute top-4 left-4 bg-white rounded-2xl px-6 py-3 border-3 border-[#F2CC8F] shadow-[0_4px_0_#E5B86E]">
              <div className="text-sm font-bold text-text-secondary">Time</div>
              <div className={`text-3xl font-black ${gameState.timeLeft < 10 ? 'text-red-500' : 'text-advay-slate'}`}>
                {Math.ceil(gameState.timeLeft)}s
              </div>
            </div>

            {/* Volume Meter */}
            <div className="absolute bottom-4 left-4 right-4 max-w-md mx-auto">
              <div className="bg-white rounded-2xl p-4 border-3 border-[#F2CC8F] shadow-[0_4px_0_#E5B86E]">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">🎤</span>
                  <span className="font-bold text-advay-slate">Blow Power</span>
                </div>
                <div className="h-6 bg-slate-100 rounded-full overflow-hidden border-2 border-[#F2CC8F]">
                  <motion.div
                    className="h-full bg-gradient-to-r from-blue-400 to-blue-600"
                    animate={{ width: `${Math.min(volume * 100 * 3, 100)}%` }}
                    transition={reducedMotion ? { duration: 0 } : { duration: 0.1 }}
                  />
                </div>
                {isBlowing && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center mt-2 font-bold text-blue-600"
                  >
                    💨 Blowing detected!
                  </motion.div>
                )}
              </div>
            </div>

            {/* Bubbles */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {gameState.bubbles.map((bubble: Bubble) => (
                <motion.div
                  key={bubble.id}
                  className="absolute rounded-full border-2 border-white/50"
                  style={{
                    left: `${bubble.x}%`,
                    top: `${bubble.y}%`,
                    width: bubble.size,
                    height: bubble.size,
                    backgroundColor: bubble.color,
                  }}
                  initial={reducedMotion ? {} : { scale: 0 }}
                  animate={reducedMotion ? {} : { scale: 1 }}
                  transition={{ duration: 0.2 }}
                />
              ))}
            </div>
          </>
        )}

        {/* Celebration */}
        {showCelebration && (
          <CelebrationOverlay
            show={showCelebration}
            letter={String(gameState.score)}
            accuracy={stats.accuracy}
            onComplete={handleResetGame}
          />
        )}
      </div>
    </GameContainer>
  );
});

// Main export wrapped with GameShell
export const BubblePop = memo(function BubblePopComponent() {
  const { saveProgress } = useGameProgress('bubble-pop');

  return (
    <GameShell
      gameId="bubble-pop"
      gameName="Bubble Pop"
      showWellnessTimer={true}
      enableErrorBoundary={true}
    >
      <BubblePopGame saveProgress={saveProgress} />
    </GameShell>
  );
});

export default BubblePop;
