/**
 * Shadow Portal Game
 *
 * A magical game where children use their body silhouette to guide
 * falling light particles into portals. Raise both arms to create a wind gust!
 *
 * @ticket GQ-001
 * @spec docs/games/shadow-portal-spec.md
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

import { GameShell } from '../components/GameShell';
import { GameCursor } from '../components/game/GameCursor';
import { HandTrackingStatus } from '../components/game/HandTrackingStatus';
import { CameraThumbnail } from '../components/game/CameraThumbnail';
import { CelebrationOverlay } from '../components/CelebrationOverlay';
import { VoiceInstructions } from '../components/game/VoiceInstructions';

import { useGameHandTracking } from '../hooks/useGameHandTracking';
import { useStreakTracking } from '../hooks/useStreakTracking';
import { useGameDrops } from '../hooks/useGameDrops';
import { useGameSessionProgress } from '../hooks/useGameSessionProgress';
import { useAudio } from '../utils/hooks/useAudio';
import { useTTS } from '../hooks/useTTS';
import { triggerHaptic } from '../utils/haptics';
import type { TrackedHandFrame } from '../utils/handTrackingFrame';

// Import particle logic module
import {
  createParticles,
  distance,
  calculatePortalScore,
  areAllPortalsFull,
  createPortalsFromConfig,
  createLevelObstacles,
  checkObstacleCollision,
  bounceOffObstacle,
  updateMovingObstacle,
  DEFAULT_LEVELS,
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  LEVEL_DURATION_SECONDS,
  GRACE_PERIOD_SECONDS,
  WIND_GUST_COOLDOWN_MS,
  WIND_GUST_DURATION_MS,
  WIND_FORCE,
  ARMS_UP_THRESHOLD,
  PORTAL_RADIUS,
  PARTICLE_RADIUS,
  GRAVITY,
  BOUNCE_DAMPING,
  type Particle,
  type Portal,
  type Obstacle,
} from '../games/shadowPortal/particles';

// ─── COLORS ───────────────────────────────────────────────────────────────────

const COLORS = {
  background: '#0f0f23',
  portalGlow: '#a855f7',
  portalInner: '#7c3aed',
  particle: '#fbbf24',
  silhouette: 'rgba(15, 15, 35, 0.8)',
  silhouetteBorder: '#4c1d95',
  windGust: 'rgba(56, 189, 248, 0.3)',
};

// ─── TYPES ─────────────────────────────────────────────────────────────────────

type GameState = 'tutorial' | 'playing' | 'levelComplete' | 'gameOver' | 'paused';

// ─── RENDER STATE ─────────────────────────────────────────────────────────────

interface RenderState {
  portals: Portal[];
  obstacles: Obstacle[];
  windGustActive: boolean;
  leftHandX: number;
  leftHandY: number;
  rightHandX: number;
  rightHandY: number;
  mouseBarrier: { x: number; y: number } | null;
  particles: Particle[];
}

// ─── MODULE-LEVEL HELPERS ─────────────────────────────────────────────────────

function updateParticle(
  particle: Particle,
  dt: number,
  windGustActive: boolean,
  obstacles: Obstacle[],
  mouseBarrier: { x: number; y: number } | null
): void {
  particle.vy += GRAVITY * dt;
  particle.y += particle.vy * dt;
  particle.x += particle.vx * dt;

  if (windGustActive) {
    particle.vy += WIND_FORCE.y * 0.1 * dt;
  }

  if (particle.x < PARTICLE_RADIUS) {
    particle.x = PARTICLE_RADIUS;
    particle.vx *= -BOUNCE_DAMPING;
  }
  if (particle.x > CANVAS_WIDTH - PARTICLE_RADIUS) {
    particle.x = CANVAS_WIDTH - PARTICLE_RADIUS;
    particle.vx *= -BOUNCE_DAMPING;
  }
  if (particle.y < PARTICLE_RADIUS) {
    particle.y = PARTICLE_RADIUS;
    particle.vy *= -BOUNCE_DAMPING;
  }
  if (particle.y > CANVAS_HEIGHT - PARTICLE_RADIUS) {
    particle.y = CANVAS_HEIGHT - PARTICLE_RADIUS;
    particle.vy *= -BOUNCE_DAMPING;
  }

  if (obstacles.length > 0) {
    for (const obstacle of obstacles) {
      if (checkObstacleCollision(particle, obstacle)) {
        const bounced = bounceOffObstacle(particle, obstacle);
        particle.x = bounced.x;
        particle.y = bounced.y;
        particle.vx = bounced.vx;
        particle.vy = bounced.vy;
        break;
      }
    }
  }

  if (mouseBarrier) {
    const dist = distance(particle.x, particle.y, mouseBarrier.x, mouseBarrier.y);
    if (dist < 60) {
      const angle = Math.atan2(particle.y - mouseBarrier.y, particle.x - mouseBarrier.x);
      particle.vx = Math.cos(angle) * 2;
      particle.vy = Math.sin(angle) * 2;
    }
  }
}

function renderFrame(ctx: CanvasRenderingContext2D, state: RenderState): void {
  const {
    portals,
    obstacles,
    windGustActive,
    leftHandX,
    leftHandY,
    rightHandX,
    rightHandY,
    mouseBarrier,
    particles,
  } = state;

  ctx.fillStyle = COLORS.background;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  if (windGustActive) {
    ctx.fillStyle = COLORS.windGust;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    for (let i = 0; i < 20; i++) {
      const x = Math.random() * CANVAS_WIDTH;
      const y = Math.random() * CANVAS_HEIGHT;
      ctx.beginPath();
      ctx.arc(x, y, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  portals.forEach(portal => {
    const progress = portal.count / portal.target;

    const gradient = ctx.createRadialGradient(
      portal.x, portal.y, 0,
      portal.x, portal.y, portal.radius * 1.5
    );
    gradient.addColorStop(0, `${COLORS.portalGlow}88`);
    gradient.addColorStop(1, 'transparent');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(portal.x, portal.y, portal.radius * 1.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = COLORS.portalInner;
    ctx.beginPath();
    ctx.arc(portal.x, portal.y, portal.radius, 0, Math.PI * 2);
    ctx.fill();

    if (progress > 0) {
      ctx.fillStyle = `${COLORS.particle}cc`;
      ctx.beginPath();
      ctx.arc(portal.x, portal.y, portal.radius * progress, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = 'white';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${portal.count}/${portal.target}`, portal.x, portal.y);
  });

  obstacles.forEach(obstacle => {
    ctx.fillStyle = '#4a5568';
    ctx.strokeStyle = '#718096';
    ctx.lineWidth = 3;
    ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    ctx.strokeRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);

    ctx.fillStyle = '#fbbf24';
    const stripeWidth = 10;
    for (let i = 0; i < obstacle.width + obstacle.height; i += stripeWidth * 2) {
      const startY = obstacle.y + (i % obstacle.height);
      const startX = obstacle.x + Math.floor(i / obstacle.height) * stripeWidth;
      if (startY < obstacle.y + obstacle.height && startX < obstacle.x + obstacle.width) {
        ctx.fillRect(startX, startY, stripeWidth, 5);
      }
    }

    if (obstacle.type === 'moving') {
      ctx.fillStyle = 'rgba(251, 191, 36, 0.3)';
      ctx.beginPath();
      const arrowY = obstacle.y + obstacle.height / 2;
      ctx.moveTo(obstacle.x - 5, arrowY - 10);
      ctx.lineTo(obstacle.x - 5, arrowY + 10);
      ctx.lineTo(obstacle.x + 5, arrowY);
      ctx.fill();
      ctx.beginPath();
      const arrowX2 = obstacle.x + obstacle.width;
      ctx.moveTo(arrowX2 + 5, arrowY - 10);
      ctx.lineTo(arrowX2 + 5, arrowY + 10);
      ctx.lineTo(arrowX2 - 5, arrowY);
      ctx.fill();
    }
  });

  const handIndicatorRadius = 20;

  if (leftHandY < 0.95) {
    const leftX = leftHandX * CANVAS_WIDTH;
    const leftY = leftHandY * CANVAS_HEIGHT;

    const gradL = ctx.createRadialGradient(leftX, leftY, 0, leftX, leftY, handIndicatorRadius * 2);
    gradL.addColorStop(0, 'rgba(168, 85, 247, 0.6)');
    gradL.addColorStop(1, 'transparent');
    ctx.fillStyle = gradL;
    ctx.beginPath();
    ctx.arc(leftX, leftY, handIndicatorRadius * 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(168, 85, 247, 0.9)';
    ctx.beginPath();
    ctx.arc(leftX, leftY, handIndicatorRadius, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'white';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('L', leftX, leftY + 4);
  }

  if (rightHandY < 0.95) {
    const rightX = rightHandX * CANVAS_WIDTH;
    const rightY = rightHandY * CANVAS_HEIGHT;

    const gradR = ctx.createRadialGradient(rightX, rightY, 0, rightX, rightY, handIndicatorRadius * 2);
    gradR.addColorStop(0, 'rgba(168, 85, 247, 0.6)');
    gradR.addColorStop(1, 'transparent');
    ctx.fillStyle = gradR;
    ctx.beginPath();
    ctx.arc(rightX, rightY, handIndicatorRadius * 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(168, 85, 247, 0.9)';
    ctx.beginPath();
    ctx.arc(rightX, rightY, handIndicatorRadius, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'white';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('R', rightX, rightY + 4);
  }

  if (leftHandY < ARMS_UP_THRESHOLD && rightHandY < ARMS_UP_THRESHOLD) {
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.8)';
    ctx.lineWidth = 4;
    ctx.setLineDash([10, 10]);
    ctx.beginPath();
    ctx.moveTo(leftHandX * CANVAS_WIDTH, leftHandY * CANVAS_HEIGHT);
    ctx.lineTo(rightHandX * CANVAS_WIDTH, rightHandY * CANVAS_HEIGHT);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  ctx.fillStyle = COLORS.particle;
  particles.forEach(particle => {
    if (!particle.active) return;
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, PARTICLE_RADIUS, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = `${COLORS.particle}44`;
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, PARTICLE_RADIUS * 2, 0, Math.PI * 2);
    ctx.fill();
  });

  if (mouseBarrier) {
    ctx.fillStyle = 'rgba(168, 85, 247, 0.3)';
    ctx.beginPath();
    ctx.arc(mouseBarrier.x, mouseBarrier.y, 60, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = COLORS.portalGlow;
    ctx.lineWidth = 3;
    ctx.stroke();
  }
}

// ─── MAIN COMPONENT ─────────────────────────────────────────────────────────

function ShadowPortalGame() {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafIdRef = useRef<number | null>(null);
  const webcamRef = useRef<any>(null);

  const { playClick, playSuccess, playPop, playCelebration, playError } = useAudio();
  const { speak } = useTTS();
  const { onGameComplete } = useGameDrops('shadow-portal');

  // Game state
  const [gameState, setGameState] = useState<GameState>('tutorial');
  const [currentLevel, setCurrentLevel] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(LEVEL_DURATION_SECONDS);

  // Portals and particles
  const [portals, setPortals] = useState<Portal[]>([]);
  const particlesRef = useRef<Particle[]>([]);

  // Wind gust state
  const [windGustActive, setWindGustActive] = useState(false);
  const [canWindGust, setCanWindGust] = useState(true);
  const windGustTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Hand tracking
  const [leftHandY, setLeftHandY] = useState(1);
  const [rightHandY, setRightHandY] = useState(1);
  const [leftHandX, setLeftHandX] = useState(0.5);
  const [rightHandX, setRightHandX] = useState(0.5);
  const [isTrackingLost, _setIsTrackingLost] = useState(false);

  // Fallback mouse position
  const [mouseBarrier, setMouseBarrier] = useState<{ x: number; y: number } | null>(null);

  // Obstacles for Level 3
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);

  // Streak tracking
  const { streak, showMilestone, incrementStreak, resetStreak } = useStreakTracking();

  // Session progress
  useGameSessionProgress({
    gameName: 'Shadow Portal',
    score,
    level: currentLevel + 1,
    isPlaying: gameState === 'playing',
    metaData: { particles: particlesRef.current.filter(p => p.active).length },
  });

  // Initialize level
  const initLevel = useCallback((levelIndex: number) => {
    const config = DEFAULT_LEVELS[levelIndex];
    const newPortals = createPortalsFromConfig(config, PORTAL_RADIUS);

    setPortals(newPortals);
    setObstacles(createLevelObstacles(config.level));
    particlesRef.current = [];
    setTimeLeft(LEVEL_DURATION_SECONDS);
    setScore(0);
    resetStreak();
    setCanWindGust(true);
    setWindGustActive(false);
  }, [resetStreak]);

  // Start game
  const startGame = useCallback(() => {
    setCurrentLevel(0);
    initLevel(0);
    setGameState('playing');
    playClick();
    speak("Move your body to guide the lights into the portal!");
  }, [initLevel, playClick, speak]);

  // Next level
  const nextLevel = useCallback(() => {
    if (currentLevel < DEFAULT_LEVELS.length - 1) {
      const next = currentLevel + 1;
      setCurrentLevel(next);
      initLevel(next);
      setGameState('playing');
      speak(`Level ${next + 1}! Guide more lights into the portals!`);
    } else {
      // Game complete!
      setGameState('levelComplete');
      playCelebration();
      void onGameComplete();
      speak("Amazing! You completed all the levels!");
    }
  }, [currentLevel, initLevel, playCelebration, speak, onGameComplete]);

  // Handle hand tracking frame
  const handleFrame = useCallback((frame: TrackedHandFrame) => {
    if (gameState !== 'playing') return;

    // Get hand positions from hands array
    // hands[0] is typically the left hand, hands[1] is the right hand
    // We check the x position to determine which is which (left < 0.5, right > 0.5)
    if (frame.hands.length >= 2) {
      const hand0 = frame.hands[0];
      const hand1 = frame.hands[1];

      // Use index finger tip (landmark 8) for hand position
      const hand0Tip = hand0[8];
      const hand1Tip = hand1[8];

      if (hand0Tip && hand1Tip) {
        // Determine which is left and which is right based on x position
        if (hand0Tip.x < hand1Tip.x) {
          setLeftHandY(hand0Tip.y);
          setLeftHandX(hand0Tip.x);
          setRightHandY(hand1Tip.y);
          setRightHandX(hand1Tip.x);
        } else {
          setLeftHandY(hand1Tip.y);
          setLeftHandX(hand1Tip.x);
          setRightHandY(hand0Tip.y);
          setRightHandX(hand0Tip.x);
        }
      }
    } else if (frame.hands.length === 1) {
      const hand = frame.hands[0];
      const tip = hand[8];
      if (tip) {
        // If only one hand, assume it's the dominant hand
        if (tip.x < 0.5) {
          setLeftHandY(tip.y);
          setLeftHandX(tip.x);
        } else {
          setRightHandY(tip.y);
          setRightHandX(tip.x);
        }
      }
    }

    // Check for wind gust gesture (both arms up)
    const armsUp =
      leftHandY < ARMS_UP_THRESHOLD && rightHandY < ARMS_UP_THRESHOLD;

    if (armsUp && canWindGust) {
      setCanWindGust(false);
      setWindGustActive(true);
      playPop();

      // Apply wind force to all particles
      particlesRef.current.forEach(p => {
        if (p.active && !p.inPortal) {
          p.vy += WIND_FORCE.y;
        }
      });

      // Reset wind gust
      setTimeout(() => setWindGustActive(false), WIND_GUST_DURATION_MS);

      // Cooldown
      if (windGustTimerRef.current) {
        clearTimeout(windGustTimerRef.current);
      }
      windGustTimerRef.current = setTimeout(() => {
        setCanWindGust(true);
      }, WIND_GUST_COOLDOWN_MS);
    }
  }, [gameState, canWindGust, playPop]);

  // Hand tracking setup
  const {
    startTracking,
    stopTracking,
  } = useGameHandTracking({
    gameName: 'ShadowPortal',
    targetFps: 30,
    webcamRef,
    onFrame: handleFrame,
  });

  // Fallback mode state (not yet implemented, placeholder for future use)
  const [isFallbackMode, _setIsFallbackMode] = useState(false);

  // Fallback controls - simpler mouse tracking
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (gameState === 'playing') {
        const canvas = canvasRef.current;
        if (canvas) {
          const rect = canvas.getBoundingClientRect();
          const x = ((e.clientX - rect.left) / rect.width) * CANVAS_WIDTH;
          const y = ((e.clientY - rect.top) / rect.height) * CANVAS_HEIGHT;
          setMouseBarrier({ x, y });
        }
      }
    };

    const handleMouseClick = () => {
      if (gameState === 'playing' && canWindGust) {
        setCanWindGust(false);
        setWindGustActive(true);
        playPop();
        particlesRef.current.forEach(p => {
          if (p.active && !p.inPortal) {
            p.vy += WIND_FORCE.y;
          }
        });
        setTimeout(() => setWindGustActive(false), WIND_GUST_DURATION_MS);
        setTimeout(() => setCanWindGust(true), WIND_GUST_COOLDOWN_MS);
      }
    };

    const handleMouseUp = () => {
      setMouseBarrier(null);
    };

    if (isFallbackMode) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('click', handleMouseClick);
      window.addEventListener('mouseup', handleMouseUp);

      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('click', handleMouseClick);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [gameState, canWindGust, isFallbackMode, playPop]);

  // Game loop
  useEffect(() => {
    if (gameState !== 'playing') {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
      return;
    }

    const config = DEFAULT_LEVELS[currentLevel];
    let lastSpawnTime = 0;
    let lastTime = performance.now();
    let gracePeriodActive = true;
    let gracePeriodTimer = setTimeout(() => {
      gracePeriodActive = false;
    }, GRACE_PERIOD_SECONDS * 1000);

    // Timer countdown
    const timerInterval = setInterval(() => {
      if (!gracePeriodActive) {
        setTimeLeft(prev => {
          const newTime = prev - 1;
          if (newTime <= 0) {
            clearInterval(timerInterval);
            setGameState('gameOver');
            playError();
            speak("Time's up! Try again!");
            return 0;
          }
          return newTime;
        });
      }
    }, 1000);

    const gameLoop = (time: number) => {
      const dt = (time - lastTime) / 16.66; // Normalize to 60fps
      lastTime = time;

      const canvas = canvasRef.current;
      if (!canvas) {
        rafIdRef.current = requestAnimationFrame(gameLoop);
        return;
      }

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Spawn new particles
      if (time - lastSpawnTime > config.particleSpawnRate) {
        const newParticles = createParticles(1, config.particleSpeed, CANVAS_WIDTH);
        particlesRef.current.push(...newParticles);
        lastSpawnTime = time;
      }

      // Update particles
      particlesRef.current.forEach(particle => {
        if (!particle.active) return;

        updateParticle(particle, dt, windGustActive, obstacles, mouseBarrier);

        // Check portal collision (needs React state setters — kept inline)
        portals.forEach(portal => {
          const dist = distance(particle.x, particle.y, portal.x, portal.y);
          const hitRadius = portal.radius + PARTICLE_RADIUS * 2; // Generous hitbox

          if (dist < hitRadius && !particle.inPortal) {
            // Particle enters portal!
            particle.inPortal = true;
            particle.active = false;

            // Update portal
            setPortals(prev => prev.map((p, i) =>
              i === portals.indexOf(portal)
                ? { ...p, count: p.count + 1 }
                : p
            ));

            // Score
            const newStreak = incrementStreak(1);
            const points = calculatePortalScore(1, newStreak);
            setScore(s => s + points);

            playSuccess();
            triggerHaptic('success');

            // Check if portal is full
            if (portal.count >= portal.target) {
              speak("Portal full!");
            }
          }
        });

        // Remove particles that are in portals
        if (particle.inPortal) {
          particle.active = false;
        }
      });

      // Clean up inactive particles
      particlesRef.current = particlesRef.current.filter(p => p.active);

      // Check win condition (all portals full)
      if (areAllPortalsFull(portals)) {
        clearInterval(timerInterval);
        clearTimeout(gracePeriodTimer);
        setGameState('levelComplete');
        playCelebration();
        triggerHaptic('celebration');
        speak(`Amazing! You filled all the portals!`);
        setTimeout(nextLevel, 3000);
        return; // Stop game loop
      }

      // Update moving obstacles
      if (obstacles.some(o => o.type === 'moving')) {
        setObstacles(prev => prev.map(o =>
          o.type === 'moving' ? updateMovingObstacle(o, dt) : o
        ));
      }

      // ─── RENDER ─────────────────────────────────────────────────────
      renderFrame(ctx, {
        portals,
        obstacles,
        windGustActive,
        leftHandX,
        leftHandY,
        rightHandX,
        rightHandY,
        mouseBarrier,
        particles: particlesRef.current,
      });

      rafIdRef.current = requestAnimationFrame(gameLoop);
    };

    rafIdRef.current = requestAnimationFrame(gameLoop);

    return () => {
      clearInterval(timerInterval);
      clearTimeout(gracePeriodTimer);
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [gameState, currentLevel, portals, obstacles, windGustActive, mouseBarrier, playSuccess, playCelebration, speak, nextLevel, incrementStreak, triggerHaptic, playError]);

  // Start tracking when playing
  useEffect(() => {
    if (gameState === 'playing') {
      if (!isFallbackMode) {
        startTracking();
      }
    } else {
      stopTracking();
    }
  }, [gameState, isFallbackMode, startTracking, stopTracking]);

  return (
    <GameShell gameId="shadow-portal" gameName="Shadow Portal" showWellnessTimer={true}>
      <div className="relative w-full h-screen bg-gradient-to-b from-indigo-950 to-purple-950">
        {/* Canvas */}
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="absolute inset-0 w-full h-full object-contain"
        />

        {/* UI Overlay */}
        {gameState === 'tutorial' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-3xl p-8 max-w-md mx-4 text-center"
            >
              <div className="text-6xl mb-4">✨</div>
              <h1 className="text-3xl font-black text-purple-900 mb-4">
                Shadow Portal
              </h1>
              <p className="text-lg text-purple-700 mb-6">
                Move your body to guide magical light particles into the portal!
              </p>
              <button
                onClick={startGame}
                className="px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-bold text-xl shadow-lg"
              >
                Start! 🌟
              </button>
              <VoiceInstructions
                instructions="Move your body to guide the lights into the portal!"
                autoSpeak={true}
                showReplayButton={true}
              />
            </motion.div>
          </div>
        )}

        {/* In-game HUD */}
        {(gameState === 'playing' || gameState === 'levelComplete' || gameState === 'gameOver') && (
          <>
            {/* Top HUD */}
            <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
              {/* Level */}
              <div className="bg-white/90 backdrop-blur rounded-2xl px-4 py-2">
                <p className="text-sm font-bold text-purple-600">Level</p>
                <p className="text-2xl font-black text-purple-900">{currentLevel + 1}</p>
              </div>

              {/* Timer */}
              <div className="bg-white/90 backdrop-blur rounded-2xl px-4 py-2">
                <p className="text-sm font-bold text-purple-600">Time</p>
                <p className={`text-2xl font-black ${timeLeft <= 10 ? 'text-red-500' : 'text-purple-900'}`}>
                  {timeLeft}s
                </p>
              </div>

              {/* Score */}
              <div className="bg-white/90 backdrop-blur rounded-2xl px-4 py-2">
                <p className="text-sm font-bold text-purple-600">Score</p>
                <p className="text-2xl font-black text-purple-900">{score}</p>
              </div>
            </div>

            {/* Wind Gust Indicator */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
              <div className={`px-6 py-3 rounded-full font-bold text-white ${canWindGust ? 'bg-purple-500' : 'bg-gray-500'} shadow-lg`}>
                {canWindGust ? 'Raise both arms! 🌬️' : 'Cooling down... ⏳'}
              </div>
            </div>

            {/* Fallback indicator */}
            {isFallbackMode && (
              <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-yellow-400 text-yellow-900 px-4 py-2 rounded-full font-bold">
                Mouse mode active
              </div>
            )}
          </>
        )}

        {/* Level Complete */}
        {gameState === 'levelComplete' && (
          <CelebrationOverlay
            show={true}
            letter={<span className="text-6xl">✨</span>}
            accuracy={100}
            onComplete={nextLevel}
            message={`Amazing! Score: ${score}`}
          />
        )}

        {/* Game Over */}
        {gameState === 'gameOver' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-3xl p-8 max-w-md mx-4 text-center"
            >
              <div className="text-6xl mb-4">⏰</div>
              <h1 className="text-3xl font-black text-purple-900 mb-2">
                Time's Up!
              </h1>
              <p className="text-lg text-purple-700 mb-2">Final Score: {score}</p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={startGame}
                  className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-bold"
                >
                  Try Again
                </button>
                <button
                  onClick={() => navigate('/games')}
                  className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-2xl font-bold"
                >
                  Games
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Streak Milestone */}
        <AnimatePresence>
          {showMilestone && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none z-50"
            >
              <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-8 py-4 rounded-full font-bold text-2xl shadow-lg">
                🔥 {streak} Streak! 🔥
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Camera Thumbnail */}
      <CameraThumbnail webcamRef={webcamRef} isHandDetected={!isTrackingLost} visible={gameState === 'playing'} />

      {/* Hand Tracking Status */}
      {gameState === 'playing' && (
        <HandTrackingStatus
          isHandDetected={!isTrackingLost}
          pauseOnHandLost={true}
          voicePrompt={true}
          showMascot={true}
        />
      )}

      {/* Fallback Cursor */}
      {isFallbackMode && gameState === 'playing' && mouseBarrier && (
        <GameCursor
          position={{
            x: mouseBarrier.x / CANVAS_WIDTH,
            y: mouseBarrier.y / CANVAS_HEIGHT,
          }}
          size={84}
          isPinching={false}
          isHandDetected={true}
          showTrail={true}
          coordinateSpace="normalized"
        />
      )}
    </GameShell>
  );
}

export default function ShadowPortal() {
  return <ShadowPortalGame />;
}
