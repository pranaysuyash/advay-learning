import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { GameShell } from '../../components/GameShell';
import { GameContainer } from '../../components/GameContainer';
import { AccessDenied } from '../../components/ui/AccessDenied';
import { useSubscription } from '../../hooks/useSubscription';
import { GlobalErrorBoundary } from '../../components/errors/GlobalErrorBoundary';
import { useAudio } from '../../utils/hooks/useAudio';
import { useGameCompletion } from '../../hooks/useGameCompletion';
import { useGameHandTracking } from '../../hooks/useGameHandTracking';
import { useSettingsStore } from '../../store';
import type { TrackedHandFrame } from '../../utils/handTrackingFrame';
import type { HandTrackingRuntimeMeta } from '../../hooks/useHandTrackingRuntime';
import Webcam from 'react-webcam';

interface Particle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  type: 'light' | 'dark';
}

interface Portal {
  id: string;
  x: number;
  y: number;
  radius: number;
  targetType: 'light' | 'dark';
  isActive: boolean;
  progress: number;
}

const SHADOW_PORTAL_CONFIG = {
  particleCount: 15,
  portalCount: 3,
  gravity: 0.2,
  friction: 0.98,
  portalRadius: 60,
  particleSize: 8,
  gameDuration: 60,
  scorePerParticle: 10,
};

const updateParticlePhysics = (particle: Particle): Particle => {
  let newVY = particle.vy + SHADOW_PORTAL_CONFIG.gravity;
  let newVX = particle.vx * SHADOW_PORTAL_CONFIG.friction;
  let newX = particle.x + newVX;
  let newY = particle.y + newVY;

  if (newX < 0 || newX > 800) {
    newVX = -newVX * 0.8;
    newX = Math.max(0, Math.min(800, newX));
  }

  if (newY > 600) {
    newVY = -newVY * 0.6;
    newY = 600;
    newVX += (Math.random() - 0.5) * 2;
  }

  return { ...particle, x: newX, y: newY, vx: newVX, vy: newVY };
};

const checkPortalCollision = (portal: Portal, particle: Particle): boolean => {
  const dx = particle.x - portal.x;
  const dy = particle.y - portal.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  return distance < portal.radius && particle.type === portal.targetType;
};

export const ShadowPortal: React.FC = () => {
  const navigate = useNavigate();
  const { canAccessGame, isLoading: subLoading } = useSubscription();
  const hasAccess = canAccessGame('shadow-portal');
  const { playPop, playFanfare } = useAudio();
  const { completeGame } = useGameCompletion('shadow-portal');
  useSettingsStore((state) => state.showHints);

  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(SHADOW_PORTAL_CONFIG.gameDuration);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [_portals, setPortals] = useState<Portal[]>([]);
  const [gameStatus, setGameStatus] = useState<
    'menu' | 'playing' | 'won' | 'lost'
  >('menu');
  const [_tutorialStep, _setTutorialStep] = useState(0);
  const [isTutorialVisible, setIsTutorialVisible] = useState(true);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const webcamRef = useRef<Webcam>(null);
  const rafId = useRef<number | undefined>(undefined);

  // Hand tracking state
  const [isHandTrackingReady, setIsHandTrackingReady] = useState(false);
  const [_currentHandFrame, _setCurrentHandFrame] =
    useState<TrackedHandFrame | null>(null);

  const { startTracking, stopTracking: _stopTracking } = useGameHandTracking({
    gameName: 'ShadowPortal',
    webcamRef,
    handTracking: {
      numHands: 2,
      minDetectionConfidence: 0.5,
      minHandPresenceConfidence: 0.5,
      minTrackingConfidence: 0.5,
      delegate: 'GPU',
      enableFallback: true,
    },
    isRunning: isPlaying && isHandTrackingReady,
    onFrame: (frame: TrackedHandFrame, _meta: HandTrackingRuntimeMeta) => {
      _setCurrentHandFrame(frame);
    },
    onNoVideoFrame: () => {
      _setCurrentHandFrame(null);
    },
  });

  // Initialize game
  const initGame = useCallback(() => {
    // Create particles
    const newParticles: Particle[] = [];
    for (let i = 0; i < SHADOW_PORTAL_CONFIG.particleCount; i++) {
      newParticles.push({
        id: `particle-${i}`,
        x: Math.random() * 800,
        y: Math.random() * 200,
        vx: (Math.random() - 0.5) * 2,
        vy: Math.random() * 2,
        size: Math.random() * 4 + 4,
        color: Math.random() > 0.5 ? '#FFD700' : '#87CEEB',
        type: Math.random() > 0.5 ? 'light' : 'dark',
      });
    }

    // Create portals
    const newPortals: Portal[] = [];
    for (let i = 0; i < SHADOW_PORTAL_CONFIG.portalCount; i++) {
      newPortals.push({
        id: `portal-${i}`,
        x: 100 + i * 200,
        y: 500,
        radius: SHADOW_PORTAL_CONFIG.portalRadius,
        targetType: i % 2 === 0 ? 'light' : 'dark',
        isActive: true,
        progress: 0,
      });
    }

    setParticles(newParticles);
    setPortals(newPortals);
    setScore(0);
    setTimeLeft(SHADOW_PORTAL_CONFIG.gameDuration);
    setGameStatus('playing');
    setIsPlaying(true);
    setIsTutorialVisible(false);
  }, []);

  // Game loop
  const gameLoop = useCallback(() => {
    if (!isPlaying || gameStatus !== 'playing') return;

    setParticles((prev) => prev.map(updateParticlePhysics));

    const collectedIds: string[] = [];
    setPortals((prevPortals) => {
      const updated = prevPortals.map((portal) => {
        // Skip inactive portals
        if (!portal.isActive) return portal;

        let newProgress = portal.progress;

        particles.forEach((particle) => {
          if (checkPortalCollision(portal, particle)) {
            newProgress += 1;
            collectedIds.push(particle.id);
            playPop();
          }
        });

        if (newProgress >= 5) {
          playFanfare();
          setScore((s) => s + SHADOW_PORTAL_CONFIG.scorePerParticle * 5);
          return { ...portal, progress: 0, isActive: false };
        }
        return { ...portal, progress: newProgress };
      });

      if (updated.every((p) => !p.isActive)) {
        setGameStatus('won');
      }
      return updated;
    });

    if (collectedIds.length > 0) {
      setParticles((prev) => prev.filter((p) => !collectedIds.includes(p.id)));
    }

    rafId.current = requestAnimationFrame(gameLoop);
  }, [isPlaying, gameStatus, playPop, playFanfare, particles]);

  // Time management
  useEffect(() => {
    if (gameStatus !== 'playing') return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setGameStatus('lost');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameStatus]);

  // Start game loop
  useEffect(() => {
    if (gameStatus === 'playing') {
      rafId.current = requestAnimationFrame(gameLoop);
    }
    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [gameLoop, gameStatus]);

  // Start hand tracking when game starts
  useEffect(() => {
    if (isPlaying && !isHandTrackingReady) {
      startTracking().then(() => {
        setIsHandTrackingReady(true);
      });
    }
  }, [isPlaying, isHandTrackingReady, startTracking]);

  // Handle game completion
  useEffect(() => {
    if (gameStatus === 'won' || gameStatus === 'lost') {
      completeGame({
        score,
        level: 1,
        metadata: {
          timeLeft,
          particlesCollected: score / SHADOW_PORTAL_CONFIG.scorePerParticle,
        },
      });
    }
  }, [gameStatus, score, timeLeft, completeGame]);

  if (subLoading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-red-500'></div>
      </div>
    );
  }

  if (!hasAccess) {
    return <AccessDenied gameName='Shadow Portal' gameId='shadow-portal' />;
  }

  return (
    <GlobalErrorBoundary>
      <GameShell gameId='shadow-portal' gameName='Shadow Portal'>
        <GameContainer
          title='Shadow Portal'
          onHome={() => navigate('/games')}
          score={score}
        >
          <div className='relative w-full h-screen bg-gradient-to-b from-purple-900 via-blue-900 to-black overflow-hidden'>
            {/* Game Canvas */}
            <canvas
              ref={canvasRef}
              width={800}
              height={600}
              className='absolute inset-0 w-full h-full'
            />

            {/* Webcam feed (hidden but used for tracking) */}
            <Webcam
              ref={webcamRef}
              className='hidden'
              audio={false}
              height={600}
              width={800}
              screenshotFormat='image/jpeg'
              videoConstraints={{
                width: 800,
                height: 600,
                facingMode: 'user',
              }}
            />

            {/* UI Overlay */}
            <div className='absolute top-4 left-4 right-4 flex justify-between items-center text-white'>
              <div className='bg-black bg-opacity-50 px-4 py-2 rounded-lg'>
                <div className='text-sm opacity-75'>Score</div>
                <div className='text-2xl font-bold'>{score}</div>
              </div>

              <div className='bg-black bg-opacity-50 px-4 py-2 rounded-lg'>
                <div className='text-sm opacity-75'>Time</div>
                <div
                  className={`text-2xl font-bold ${timeLeft < 10 ? 'text-red-400 animate-pulse' : ''}`}
                >
                  {timeLeft}
                </div>
              </div>

              <div className='bg-black bg-opacity-50 px-4 py-2 rounded-lg'>
                <div className='text-sm opacity-75'>
                  Use your shadow to guide particles
                </div>
              </div>
            </div>

            {/* Tutorial Overlay */}
            {isTutorialVisible && (
              <div className='absolute inset-0 bg-black bg-opacity-80 flex items-center justify-center'>
                <div className='bg-white rounded-2xl p-8 text-center max-w-md'>
                  <h2 className='text-3xl font-bold text-purple-600 mb-4'>
                    Shadow Portal
                  </h2>
                  <p className='text-gray-600 mb-6'>
                    Use your body to create shadows that guide magical particles
                    into the glowing portals!
                  </p>
                  <div className='space-y-4 text-left'>
                    <div className='flex items-center space-x-3'>
                      <div className='w-4 h-4 bg-yellow-400 rounded-full'></div>
                      <span>Golden particles go to blue portals</span>
                    </div>
                    <div className='flex items-center space-x-3'>
                      <div className='w-4 h-4 bg-blue-400 rounded-full'></div>
                      <span>Blue particles go to golden portals</span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setIsTutorialVisible(false);
                      initGame();
                    }}
                    className='mt-6 bg-purple-600 text-white px-8 py-3 rounded-full font-bold hover:bg-purple-700 transition-colors'
                  >
                    Start Game
                  </button>
                </div>
              </div>
            )}

            {/* Game Over Overlay */}
            <AnimatePresence>
              {gameStatus === 'won' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className='absolute inset-0 bg-black bg-opacity-80 flex items-center justify-center'
                >
                  <div className='bg-white rounded-2xl p-8 text-center max-w-md'>
                    <div className='text-6xl mb-4'>🎉</div>
                    <h2 className='text-3xl font-bold text-green-600 mb-2'>
                      You Win!
                    </h2>
                    <p className='text-gray-600 mb-4'>
                      Great job guiding the particles!
                    </p>
                    <div className='text-2xl font-bold mb-6'>
                      Final Score: {score}
                    </div>
                    <button
                      onClick={() => {
                        setGameStatus('menu');
                        setIsTutorialVisible(true);
                      }}
                      className='bg-green-600 text-white px-8 py-3 rounded-full font-bold hover:bg-green-700 transition-colors'
                    >
                      Play Again
                    </button>
                  </div>
                </motion.div>
              )}

              {gameStatus === 'lost' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className='absolute inset-0 bg-black bg-opacity-80 flex items-center justify-center'
                >
                  <div className='bg-white rounded-2xl p-8 text-center max-w-md'>
                    <div className='text-6xl mb-4'>😢</div>
                    <h2 className='text-3xl font-bold text-red-600 mb-2'>
                      Time's Up!
                    </h2>
                    <p className='text-gray-600 mb-4'>
                      Don't worry, try again!
                    </p>
                    <div className='text-2xl font-bold mb-6'>
                      Final Score: {score}
                    </div>
                    <button
                      onClick={() => {
                        setGameStatus('menu');
                        setIsTutorialVisible(true);
                      }}
                      className='bg-red-600 text-white px-8 py-3 rounded-full font-bold hover:bg-red-700 transition-colors'
                    >
                      Try Again
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Menu Screen */}
            {gameStatus === 'menu' && !isTutorialVisible && (
              <div className='absolute inset-0 bg-black bg-opacity-80 flex items-center justify-center'>
                <div className='bg-white rounded-2xl p-8 text-center max-w-md'>
                  <h2 className='text-3xl font-bold text-purple-600 mb-4'>
                    Shadow Portal
                  </h2>
                  <p className='text-gray-600 mb-6'>
                    Guide magical particles with your shadow into the right
                    portals!
                  </p>
                  <button
                    onClick={initGame}
                    className='bg-purple-600 text-white px-8 py-3 rounded-full font-bold hover:bg-purple-700 transition-colors'
                  >
                    Start Game
                  </button>
                </div>
              </div>
            )}
          </div>
        </GameContainer>
      </GameShell>
    </GlobalErrorBoundary>
  );
};

export default ShadowPortal;
