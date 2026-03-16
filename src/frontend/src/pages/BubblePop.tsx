/**
 * Bubble Pop Game
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
import { AssetPreloader } from '../components/AssetPreloader';
import { GameShell } from '../components/GameShell';
import { GameContainer } from '../components/GameContainer';
import { CelebrationOverlay } from '../components/CelebrationOverlay';
import { useGameCompletion } from '../hooks/useGameCompletion';
import { useStreakTracking } from '../hooks/useStreakTracking';
import { STREAK_MILESTONE_INTERVAL } from '../games/constants';
import { useAudio } from '../utils/hooks/useAudio';
import { triggerHaptic } from '../utils/haptics';
import { useMicrophoneInput } from '../hooks/useMicrophoneInput';
import { useTTS } from '../hooks/useTTS';
import { VoiceInstructions } from '../components/game/VoiceInstructions';
import { KenneyIcon } from '../components/ui/KenneyIcon';
import {
  initializeGame,
  startGame,
  updateBubbles,
  checkBlowHits,
  getStats,
  endGame,
  advanceLevel,
  BUBBLE_GAME_CONFIG,
  type GameState,
  type Bubble,
} from '../games/bubblePopLogic';
import { GameHUD } from '../components/game/GameHUD';
import { GameBackground } from '../components/game/GameBackground';

const CRITICAL_ASSETS: import('../components/AssetPreloader').AssetToPreload[] = [
  { type: 'image', src: '/assets/kenney/platformer/hud/hud_heart.png', priority: 'critical' },
  { type: 'image', src: '/assets/kenney/platformer/hud/hud_heart_empty.png', priority: 'critical' },
];

// Animation constants
const TARGET_FPS = 60;
const FRAME_TIME = 1000 / TARGET_FPS;

// Destructure config for cleaner usage
const {
  BLOW_THRESHOLD,
  MIN_BLOW_DURATION,
  BLOW_COOLDOWN,
} = BUBBLE_GAME_CONFIG;

// Inner game component
const BubblePopGame = memo(function BubblePopGameComponent() {
  const navigate = useNavigate();
  const reducedMotion = useReducedMotion();
  const [assetsLoaded, setAssetsLoaded] = useState(false);
  const { completeGame, saveProgress } = useGameCompletion('bubble-pop');

  // Audio
  const { playClick } = useAudio();
  const { speak, stop: stopTTS, isEnabled: ttsEnabled } = useTTS();

  // Game state
  const [gameState, setGameState] = useState<GameState>(initializeGame());
  const [showMenu, setShowMenu] = useState(true);
  const [showCelebration, setShowCelebration] = useState(false);

  // Streak tracking
  const { streak, showMilestone, scorePopup, incrementStreak, resetStreak, setScorePopup } = useStreakTracking();

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
        triggerHaptic('celebration');
        await saveProgress({
          score: finalScore,
          completed: true,
          level: gameState.level,
          metadata: {
            poppedCount: gameState.poppedCount,
            missedCount: gameState.missedCount,
          },
        });
        completeGame({ score: finalScore, level: gameState.level });
      } catch (err) {
        // Error handled by GameShell error boundary
        console.error('Failed to save progress:', err);
      }
    },
    [saveProgress, completeGame, gameState.level, gameState.poppedCount, gameState.missedCount]
  );

  // Microphone input for blow detection - using config constants
  const {
    isActive,
    volume,
    isBlowing,
    error: micError,
    start,
    stop,
  } = useMicrophoneInput({
    blowThreshold: BLOW_THRESHOLD,
    minBlowDuration: MIN_BLOW_DURATION,
    cooldown: BLOW_COOLDOWN,
    onBlow: () => {
      setGameState((prev) => {
        // Use current volume for hit detection radius
        const newState = checkBlowHits(prev, prev.blowStrength || 0.5);
        if (newState.poppedCount > prev.poppedCount) {
          const newlyPopped = newState.poppedCount - prev.poppedCount;
          lastPopTimeRef.current = Date.now();

          // Find newly popped bubbles for particle effects
          const newlyPoppedBubbles = newState.bubbles.filter(
            b => b.isPopped && !prev.bubbles.find(pb => pb.id === b.id)?.isPopped
          );

          // Add particle effects
          if (newlyPoppedBubbles.length > 0) {
            const newParticles = newlyPoppedBubbles.map(b => ({
              id: `${b.id}-${Date.now()}`,
              x: b.x,
              y: b.y,
              color: b.color,
            }));
            setPoppedBubbles(prevParticles => [...prevParticles, ...newParticles]);

            // Remove particles after animation
            setTimeout(() => {
              setPoppedBubbles(prevParticles =>
                prevParticles.filter(p => !newParticles.find(np => np.id === p.id))
              );
            }, 500);
          }

          // Build streak and calculate bonus
          const newStreak = incrementStreak(newlyPopped);

          // Calculate score with streak bonus
          const basePoints = newlyPopped * 10;
          const streakBonus = Math.min(newStreak * 2, 20);
          const totalPoints = basePoints + streakBonus;

          // Show score popup at first popped bubble position
          if (newlyPoppedBubbles.length > 0) {
            const firstBubble = newlyPoppedBubbles[0];
            setScorePopup({
              points: totalPoints,
              x: firstBubble.x * 100,
              y: firstBubble.y * 100
            });
          }

          // Haptics
          triggerHaptic('success');

          // TTS feedback
          if (ttsEnabled) {
            if (newState.poppedCount % STREAK_MILESTONE_INTERVAL === 0) {
              void speak(`${newState.poppedCount} bubbles popped! Great job!`);
            } else if (newlyPopped >= 3) {
              void speak('Wow! You popped a lot!');
            }
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

          if (isActive && volume > BLOW_THRESHOLD) {
            newState = checkBlowHits(newState, volume);
          }

          // Check for level advancement (every N pops or N seconds)
          const { LEVEL_ADVANCE_POPS, LEVEL_ADVANCE_TIME_SECONDS, MAX_LEVEL } = BUBBLE_GAME_CONFIG;
          const popsForNextLevel = newState.level * LEVEL_ADVANCE_POPS;
          const timeForNextLevel = newState.level * LEVEL_ADVANCE_TIME_SECONDS;
          const elapsedTime = BUBBLE_GAME_CONFIG.GAME_DURATION_SECONDS - newState.timeLeft;

          if (newState.level < MAX_LEVEL &&
            (newState.poppedCount >= popsForNextLevel || elapsedTime >= timeForNextLevel)) {
            newState = advanceLevel(newState);

            // Announce level up via TTS (with cooldown to prevent spam)
            if (ttsEnabled && newState.level > lastAnnouncedLevelRef.current) {
              lastAnnouncedLevelRef.current = newState.level;
              void speak(`Level ${newState.level}! Bubbles are getting faster!`);
            }
          }

          // Check for game over
          if (newState.timeLeft <= 0 && !prev.gameOver) {
            newState = endGame(newState);
            void handleGameComplete(newState.score);
            setShowCelebration(true);

            // Final stats announcement
            if (ttsEnabled) {
              const finalMessage = newState.poppedCount >= 20
                ? `Amazing! You popped ${newState.poppedCount} bubbles!`
                : `Great job! You popped ${newState.poppedCount} bubbles!`;
              void speak(finalMessage);
            }
          }

          return newState;
        });

        lastFrameTimeRef.current = timestamp;
      }

      // Use functional state check to avoid stale ref issues (BP-01 fix)
      setGameState(current => {
        if (!current.gameOver) {
          animationFrameRef.current = requestAnimationFrame(gameLoop);
        }
        return current;
      });
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

  // Inactivity detection - encourage player if no pops for 8 seconds
  useEffect(() => {
    if (!isActive || showMenu || gameState.gameOver) return;

    const checkInactivity = setInterval(() => {
      const timeSinceLastPop = Date.now() - lastPopTimeRef.current;
      const gameTimeElapsed = BUBBLE_GAME_CONFIG.GAME_DURATION_SECONDS - gameState.timeLeft;

      // Only encourage after game has started (3s grace period) and if inactive
      if (gameTimeElapsed > 3 && timeSinceLastPop > 8000 && gameState.poppedCount === 0) {
        if (ttsEnabled) {
          void speak("Try blowing gently into the microphone to pop bubbles!");
        }
        // Reset to avoid spam
        lastPopTimeRef.current = Date.now();
      } else if (gameTimeElapsed > 5 && timeSinceLastPop > 10000 && gameState.poppedCount > 0) {
        // Encouragement for returning players
        if (ttsEnabled) {
          const encouragements = [
            "Keep going! You're doing great!",
            "Blow harder to pop more bubbles!",
            "Almost there! Keep popping!",
          ];
          const randomEncouragement = encouragements[Math.floor(Math.random() * encouragements.length)];
          void speak(randomEncouragement);
        }
        lastPopTimeRef.current = Date.now();
      }
    }, 2000);

    return () => clearInterval(checkInactivity);
  }, [isActive, showMenu, gameState.gameOver, gameState.timeLeft, gameState.poppedCount, ttsEnabled]);

  // Start game handler
  const handleStartGame = async () => {
    playClick();
    await start();
    setGameState(startGame(gameState));
    setShowMenu(false);
    setShowCelebration(false);
    resetStreak();
    lastFrameTimeRef.current = 0;
    lastAnnouncedLevelRef.current = 1;

    // Welcome TTS
    if (ttsEnabled) {
      void speak("Let's pop some bubbles! Blow into the microphone!");
    }
  };

  // Reset game handler
  const handleResetGame = () => {
    playClick();
    stop();
    stopTTS();
    setGameState(initializeGame());
    setShowMenu(true);
    setShowCelebration(false);
    resetStreak();
    lastFrameTimeRef.current = 0;
    lastAnnouncedLevelRef.current = 1;
  };

  // Track last announced level to prevent spam
  const lastAnnouncedLevelRef = useRef(1);

  // Track popped bubbles for particle effects
  const [poppedBubbles, setPoppedBubbles] = useState<Array<{ id: string; x: number; y: number; color: string }>>([]);

  // Track last pop time for activity detection
  const lastPopTimeRef = useRef<number>(0);

  // Stats for display
  const stats = getStats(gameState);

  if (!assetsLoaded) {
    return (
      <AssetPreloader
        assets={CRITICAL_ASSETS}
        onComplete={() => setAssetsLoaded(true)}
        minDisplayTime={800}
      />
    );
  }

  return (
    <div className="relative">
      <GameBackground type="solid_sky" className="absolute inset-0" />
      <div className="relative z-10">
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
            <div className="absolute top-0 left-0 right-0 z-10 px-4 pt-2">
              <GameHUD
                score={gameState.score}
                streak={streak}
                levelInfo={
                  <div className="flex gap-4 items-center">
                    <div className="bg-purple-100 text-purple-700 px-3 py-1 rounded-xl font-bold border-2 border-purple-200 shadow-sm">
                      Level {gameState.level}
                    </div>
                    <div className={`px-3 py-1 rounded-xl font-bold border-2 shadow-sm ${gameState.timeLeft < 10 ? 'bg-red-100 text-red-600 border-red-200 animate-pulse' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                      ⏳ {Math.ceil(gameState.timeLeft)}s
                    </div>
                  </div>
                }
              />
            </div>

            {/* Score Popup Animation */}
            {scorePopup && (
              <motion.div
                initial={{ opacity: 0, y: 0, scale: 0.5 }}
                animate={{ opacity: 1, y: -40, scale: 1.2 }}
                exit={{ opacity: 0 }}
                style={{
                  position: 'absolute',
                  left: `${scorePopup.x}%`,
                  top: `${scorePopup.y}%`,
                  transform: 'translate(-50%, -50%)'
                }}
                className="pointer-events-none z-50"
              >
                <div className="text-4xl font-black text-green-500 drop-shadow-lg">
                  +{scorePopup.points}
                </div>
              </motion.div>
            )}

            {/* Streak Milestone */}
            {showMilestone && (
              <motion.div
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1.2, rotate: 0 }}
                exit={{ scale: 0 }}
                className="absolute top-1/3 left-1/2 -translate-x-1/2 pointer-events-none z-50"
              >
                <div className="bg-gradient-to-r from-yellow-300 via-orange-400 to-pink-500 px-6 py-3 rounded-2xl shadow-xl text-white font-black text-2xl">
                  <div className='flex items-center justify-center gap-2'><KenneyIcon type='heart' size={20} /> {streak} Streak! <KenneyIcon type='heart' size={20} /></div>
                </div>
              </motion.div>
            )}

            {/* Time HUD migrated to GameHUD above */}

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

            {/* Pop Particle Effects */}
            {!reducedMotion && poppedBubbles.map((particle) => (
              <div key={particle.id} className="absolute inset-0 pointer-events-none">
                {/* Main pop ring */}
                <motion.div
                  className="absolute rounded-full border-4"
                  style={{
                    left: `${particle.x}%`,
                    top: `${particle.y}%`,
                    borderColor: particle.color,
                    backgroundColor: 'transparent',
                  }}
                  initial={{ width: 40, height: 40, x: -20, y: -20, opacity: 1, scale: 0.5 }}
                  animate={{ opacity: 0, scale: 2 }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                />
                {/* Sparkle particles */}
                {[...Array(4)].map((_, i) => (
                  <motion.div
                    key={`${particle.id}-sparkle-${i}`}
                    className="absolute w-2 h-2 rounded-full"
                    style={{
                      left: `${particle.x}%`,
                      top: `${particle.y}%`,
                      backgroundColor: particle.color,
                    }}
                    initial={{ x: 0, y: 0, opacity: 1 }}
                    animate={{
                      x: Math.cos((i * Math.PI) / 2) * 30,
                      y: Math.sin((i * Math.PI) / 2) * 30,
                      opacity: 0,
                    }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                  />
                ))}
              </div>
            ))}
          </>
        )}

        {/* Celebration */}
        {showCelebration && (
          <CelebrationOverlay
            show={showCelebration}
            letter='🫧'
            accuracy={stats.accuracy}
            onComplete={handleResetGame}
            message='Bubble burst!'
          />
        )}
      </div>
    </GameContainer>
      </div>
    </div>
  );
});

// Main export wrapped with GameShell
export const BubblePop = memo(function BubblePopComponent() {
  return (
    <GameShell
      gameId="bubble-pop"
      gameName="Bubble Pop"
      showWellnessTimer={true}
      enableErrorBoundary={true}
    >
      <BubblePopGame />
    </GameShell>
  );
});

export default BubblePop;
