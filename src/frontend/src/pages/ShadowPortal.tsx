/**
 * Shadow Portal Game
 *
 * Your body silhouette blocks and guides falling light particles into portals.
 * Move your body, raise arms, make "tunnels" with your silhouette!
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
  type SilhouetteRegion,
  createInitialState,
  startGame,
  updateParticles,
  spawnParticles,
  updateTimer,
  checkGameComplete,
  calculateFinalScore,
  getComboText,
  getDifficultyName,
} from '../games/shadowPortalLogic';

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;

export const ShadowPortalContent = memo(function ShadowPortalGame() {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const webcamRef = useRef<Webcam>(null);
  const gameLoopRef = useRef<number | null>(null);
  const lastTimeRef = useRef(0);

  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [gameState, setGameState] = useState<GameState>(() => createInitialState());
  const [silhouetteRegions, setSilhouetteRegions] = useState<SilhouetteRegion[]>([]);
  const [showCelebration, setShowCelebration] = useState(false);
  const [comboText, setComboText] = useState<string>('');

  const { completeGame } = useGameCompletion('shadow-portal');
  const { playSuccess, playError, playCelebration } = useAudio();
  const { speak, isEnabled: ttsEnabled } = useTTS();

  const gameStateRef = useRef(gameState);
  gameStateRef.current = gameState;

  // Draw game
  const drawGame = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      // Clear with gradient background
      const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
      gradient.addColorStop(0, '#1a1a2e');
      gradient.addColorStop(1, '#16213e');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Draw stars
      ctx.fillStyle = '#ffffff';
      for (let i = 0; i < 50; i++) {
        const x = (i * 137.5) % CANVAS_WIDTH;
        const y = (i * 73.3) % CANVAS_HEIGHT;
        const size = (i % 3) + 1;
        ctx.globalAlpha = 0.3 + (i % 5) * 0.1;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // Draw portals
      gameState.portals.forEach((portal) => {
        const x = portal.x * CANVAS_WIDTH;
        const y = portal.y * CANVAS_HEIGHT;
        const w = portal.width * CANVAS_WIDTH;
        const h = portal.height * CANVAS_HEIGHT;

        // Portal glow
        const portalGradient = ctx.createRadialGradient(x, y, 0, x, y, w);
        portalGradient.addColorStop(0, portal.color);
        portalGradient.addColorStop(0.5, `${portal.color}80`);
        portalGradient.addColorStop(1, 'transparent');
        ctx.fillStyle = portalGradient;
        ctx.beginPath();
        ctx.arc(x, y, w, 0, Math.PI * 2);
        ctx.fill();

        // Portal core
        ctx.fillStyle = portal.color;
        ctx.beginPath();
        ctx.ellipse(x, y, w / 2, h / 2, 0, 0, Math.PI * 2);
        ctx.fill();

        // Progress indicator
        const progress = portal.particlesCollected / portal.targetParticles;
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(x, y, w / 2 + 5, -Math.PI / 2, -Math.PI / 2 + progress * Math.PI * 2);
        ctx.stroke();

        // Count
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 16px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`${portal.particlesCollected}/${portal.targetParticles}`, x, y + 5);
      });

      // Draw silhouette regions (for debugging/visualization)
      silhouetteRegions.forEach((region) => {
        if (region.isActive) {
          const x = region.x * CANVAS_WIDTH;
          const y = region.y * CANVAS_HEIGHT;
          const w = region.width * CANVAS_WIDTH;
          const h = region.height * CANVAS_HEIGHT;

          ctx.fillStyle = 'rgba(100, 200, 255, 0.3)';
          ctx.fillRect(x, y, w, h);
          ctx.strokeStyle = 'rgba(100, 200, 255, 0.6)';
          ctx.lineWidth = 2;
          ctx.strokeRect(x, y, w, h);
        }
      });

      // Draw particles
      gameState.particles.forEach((particle) => {
        if (particle.captured || particle.missed) return;

        const x = particle.x * CANVAS_WIDTH;
        const y = particle.y * CANVAS_HEIGHT;
        const r = particle.radius * Math.min(CANVAS_WIDTH, CANVAS_HEIGHT);

        // Glow
        const glowGradient = ctx.createRadialGradient(x, y, 0, x, y, r * 2);
        glowGradient.addColorStop(0, particle.color);
        glowGradient.addColorStop(0.5, `${particle.color}80`);
        glowGradient.addColorStop(1, 'transparent');
        ctx.fillStyle = glowGradient;
        ctx.beginPath();
        ctx.arc(x, y, r * 2, 0, Math.PI * 2);
        ctx.fill();

        // Core
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();

        // Type indicator
        if (particle.type === 'bonus') {
          ctx.fillStyle = '#FFD700';
          ctx.font = '12px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('★', x, y + 4);
        } else if (particle.type === 'obstacle') {
          ctx.strokeStyle = '#FF4444';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(x - r * 0.5, y - r * 0.5);
          ctx.lineTo(x + r * 0.5, y + r * 0.5);
          ctx.moveTo(x + r * 0.5, y - r * 0.5);
          ctx.lineTo(x - r * 0.5, y + r * 0.5);
          ctx.stroke();
        }
      });
    },
    [gameState, silhouetteRegions]
  );

  // Handle hand tracking for silhouette
  const handleHandFrame = useCallback(
    (frame: TrackedHandFrame) => {
      if (!frame.indexTip) {
        setSilhouetteRegions([]);
        return;
      }

      // Create silhouette region based on hand position
      // In a real implementation, this would use body segmentation
      // For now, we use hand position as a simple silhouette
      if (frame.indexTip) {
        setSilhouetteRegions([
          {
            x: frame.indexTip.x - 0.08,
            y: frame.indexTip.y - 0.08,
            width: 0.16,
            height: 0.16,
            isActive: true,
          },
        ]);
      } else {
        setSilhouetteRegions([]);
      }
    },
    []
  );

  const { handVisible } = useGameHandTracking({
    gameName: 'ShadowPortal',
    webcamRef,
    onFrame: handleHandFrame,
  });

  // Game loop
  useEffect(() => {
    const gameLoop = (timestamp: number) => {
      const deltaTime = (timestamp - lastTimeRef.current) / 1000;
      lastTimeRef.current = timestamp;

      if (gameStateRef.current.status === 'playing') {
        setGameState((prev) => {
          let updated = spawnParticles(prev, deltaTime);
          updated = updateParticles(updated, deltaTime, silhouetteRegions);
          updated = checkGameComplete(updated);

          if (updated.status === 'complete' && prev.status === 'playing') {
            playSuccess();
            playCelebration();
            triggerHaptic('celebration');
            setShowCelebration(true);
            const scores = calculateFinalScore(updated);
            (async () => {
              await completeGame({ score: scores.total, level: 1 });
            })();
            if (ttsEnabled) speak('All portals filled! Amazing!');
          }

          if (updated.status === 'gameover' && prev.status === 'playing') {
            playError();
            if (ttsEnabled) speak('Game over! Try again!');
          }

          return updated;
        });
      }

      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoopRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [silhouetteRegions, playSuccess, playError, playCelebration, speak, ttsEnabled, completeGame]);

  // Timer
  useEffect(() => {
    if (gameState.status !== 'playing') return;

    const timer = setInterval(() => {
      setGameState((prev) => updateTimer(prev));
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState.status]);

  // Combo text effect
  useEffect(() => {
    const text = getComboText(gameState.streak);
    if (text) {
      setComboText(text);
      const timer = setTimeout(() => setComboText(''), 1500);
      return () => clearTimeout(timer);
    }
  }, [gameState.streak]);

  // Draw canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    drawGame(ctx);
  }, [drawGame]);

  const handleStart = useCallback(() => {
    setGameState((prev) => startGame(prev, difficulty));
    if (ttsEnabled) {
      speak('Shadow Portal! Use your hands to guide particles into the portals!');
    }
  }, [difficulty, speak, ttsEnabled]);

  const handleGameComplete = useCallback(() => {
    setShowCelebration(false);
    setGameState(createInitialState());
  }, []);

  // Mouse fallback
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;

      setSilhouetteRegions([
        {
          x: x - 0.05,
          y: y - 0.05,
          width: 0.1,
          height: 0.1,
          isActive: true,
        },
      ]);
    },
    []
  );

  return (
    <GameContainer
      title="Shadow Portal"
      score={gameState.score}
      isPlaying={gameState.status === 'playing'}
      isHandDetected={handVisible}
      webcamRef={webcamRef}
    >
      <div className="relative w-full h-full flex flex-col items-center justify-center">
        {gameState.status === 'idle' ? (
          <div className="flex flex-col items-center gap-6">
            <h2 className="text-3xl font-bold text-white drop-shadow-lg">Shadow Portal</h2>
            <p className="text-gray-300 text-center max-w-md">
              Use your hands to guide falling light particles into the portals!
              <br />
              ✨ Block, deflect, and guide the particles
            </p>

            <div className="flex gap-4">
              {(['easy', 'medium', 'hard'] as Difficulty[]).map((diff) => (
                <button
                  key={diff}
                  onClick={() => setDifficulty(diff)}
                  className={`px-6 py-3 rounded-xl font-bold capitalize transition-all ${
                    difficulty === diff
                      ? 'bg-purple-500 text-white scale-110'
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                >
                  {getDifficultyName(diff)}
                </button>
              ))}
            </div>

            <div className="text-sm text-gray-400">
              Fill all 3 portals to win!
            </div>

            <button
              onClick={handleStart}
              className="mt-4 px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white text-xl font-bold rounded-2xl shadow-lg transition-all hover:scale-105"
            >
              Start Game! ✨
            </button>
          </div>
        ) : (
          <>
            {/* HUD */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-6 bg-black/50 backdrop-blur px-6 py-3 rounded-2xl">
              <div className="text-center">
                <div className="text-xs text-gray-400 uppercase">Time</div>
                <div className={`text-xl font-bold ${gameState.timeLeft < 10 ? 'text-red-400' : 'text-white'}`}>
                  {gameState.timeLeft}s
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-400 uppercase">Score</div>
                <div className="text-xl font-bold text-white">{gameState.score}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-400 uppercase">Missed</div>
                <div className={`text-xl font-bold ${
                  gameState.particlesMissed >= gameState.maxMissed - 1 ? 'text-red-400' : 'text-white'
                }`}>
                  {gameState.particlesMissed}/{gameState.maxMissed}
                </div>
              </div>
              {gameState.comboMultiplier > 1 && (
                <div className="text-center">
                  <div className="text-xs text-yellow-400 uppercase">Combo</div>
                  <div className="text-xl font-bold text-yellow-400">x{gameState.comboMultiplier.toFixed(1)}</div>
                </div>
              )}
            </div>

            {/* Game Canvas */}
            <canvas
              ref={canvasRef}
              width={CANVAS_WIDTH}
              height={CANVAS_HEIGHT}
              className="rounded-xl shadow-2xl cursor-crosshair"
              style={{ maxWidth: '90vw', maxHeight: '60vh' }}
              onMouseMove={handleMouseMove}
            />

            {/* Instructions */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur text-white px-4 py-2 rounded-lg text-sm">
              Move your hands to block and guide particles into portals!
            </div>

            {/* Combo Text */}
            <AnimatePresence>
              {comboText && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  className="absolute top-1/4 left-1/2 -translate-x-1/2 text-4xl font-bold text-yellow-400 drop-shadow-lg"
                  style={{ textShadow: '0 0 20px rgba(255, 215, 0, 0.8)' }}
                >
                  {comboText}
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}

        {/* Celebration / Game Over */}
        <AnimatePresence>
          {(showCelebration || gameState.status === 'gameover') && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/70 flex items-center justify-center z-50"
            >
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-gradient-to-br from-purple-900 to-blue-900 rounded-3xl p-8 text-center max-w-md border border-purple-500/50"
              >
                {gameState.status === 'complete' ? (
                  <>
                    <div className="text-6xl mb-4">🌟✨🌟</div>
                    <h2 className="text-3xl font-bold text-white mb-2">Portals Filled!</h2>
                    <p className="text-purple-200 mb-4">You guided the particles to safety!</p>
                  </>
                ) : (
                  <>
                    <div className="text-6xl mb-4">💫</div>
                    <h2 className="text-3xl font-bold text-white mb-2">Game Over</h2>
                    <p className="text-gray-300 mb-4">Too many particles missed!</p>
                  </>
                )}
                {(() => {
                  const scores = calculateFinalScore(gameState);
                  return (
                    <>
                      <div className="grid grid-cols-3 gap-3 text-sm mb-6">
                        <div className="bg-white/10 p-2 rounded">
                          <div className="text-gray-400">Base</div>
                          <div className="font-bold text-white">{scores.baseScore}</div>
                        </div>
                        <div className="bg-white/10 p-2 rounded">
                          <div className="text-green-400">Portal</div>
                          <div className="font-bold text-white">+{scores.portalBonus}</div>
                        </div>
                        <div className="bg-white/10 p-2 rounded">
                          <div className="text-yellow-400">Time</div>
                          <div className="font-bold text-white">+{scores.timeBonus}</div>
                        </div>
                      </div>
                      <p className="text-3xl font-bold text-yellow-400 mb-6">Total: {scores.total}</p>
                    </>
                  );
                })()}
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={handleGameComplete}
                    className="px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white font-bold rounded-xl"
                  >
                    Play Again
                  </button>
                  <button
                    onClick={() => navigate('/games')}
                    className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-bold rounded-xl"
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

export const ShadowPortal = memo(function ShadowPortalShell() {
  return (
    <GameShell gameId="shadow-portal" gameName="Shadow Portal">
      <ShadowPortalContent />
    </GameShell>
  );
});

export default ShadowPortal;
