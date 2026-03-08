import { memo, useRef, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { GameContainer } from '../components/GameContainer';
import { useAudio } from '../utils/hooks/useAudio';
import { useGameDrops } from '../hooks/useGameDrops';
import { useStreakTracking } from '../hooks/useStreakTracking';
import { useGameSessionProgress } from '../hooks/useGameSessionProgress';
import { triggerHaptic } from '../utils/haptics';
import { HandTrackingStatus } from '../components/game/HandTrackingStatus';
import { CameraThumbnail } from '../components/game/CameraThumbnail';
import { useGameHandTracking } from '../hooks/useGameHandTracking';
import type { TrackedHandFrame } from '../types/tracking';
import { VoiceInstructions, useVoiceInstructions } from '../components/game/VoiceInstructions';

// Fix internal canvas resolution to scale well
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const GROUND_Y = CANVAS_HEIGHT - 64;

type GameStateType = 'start' | 'playing' | 'complete';

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface GameObject extends Rect {
  id: number;
  type: string;
  vx: number;
  vy: number;
  active: boolean;
  frameTimer: number;
  frameIndex: number;
  startY?: number;
}

function checkCollision(r1: Rect, r2: Rect, margin = 0.6): boolean {
  const mw = r1.w * (1 - margin);
  const mh = r1.h * (1 - margin);
  const r1Shrunken = {
    x: r1.x + mw / 2,
    y: r1.y + mh / 2,
    w: r1.w * margin,
    h: r1.h * margin,
  };
  const r2mw = r2.w * (1 - margin);
  const r2mh = r2.h * (1 - margin);
  const r2Shrunken = {
    x: r2.x + r2mw / 2,
    y: r2.y + r2mh / 2,
    w: r2.w * margin,
    h: r2.h * margin,
  };

  return (
    r1Shrunken.x < r2Shrunken.x + r2Shrunken.w &&
    r1Shrunken.x + r1Shrunken.w > r2Shrunken.x &&
    r1Shrunken.y < r2Shrunken.y + r2Shrunken.h &&
    r1Shrunken.y + r1Shrunken.h > r2Shrunken.y
  );
}

const PlatformerRunnerGame = memo(function PlatformerRunnerGameComponent() {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [gameState, setGameState] = useState<GameStateType>('start');
  const [score, setScore] = useState(0);
  const [coins, setCoins] = useState(0);

  const { streak, showMilestone, scorePopup, incrementStreak, resetStreak, setScorePopup } = useStreakTracking();
  const { playClick, playSuccess, playError } = useAudio();
  const { onGameComplete } = useGameDrops('platformer-runner');

  const webcamRef = useRef<Webcam>(null);
  const [isHandDetected, setIsHandDetected] = useState(false);
  const lastHandStateRef = useRef(false);
  const canJumpRef = useRef(true); // Must lower hand to jump again
  const { speak } = useVoiceInstructions();

  const gameLoopRef = useRef<number | null>(null);

  const playerRef = useRef<GameObject>({
    id: 0,
    type: 'player',
    x: 100,
    y: GROUND_Y - 64,
    w: 48,
    h: 64,
    vx: 5, // Auto run speed
    vy: 0,
    active: true,
    frameTimer: 0,
    frameIndex: 0,
  });
  const enemiesRef = useRef<GameObject[]>([]);
  const collectiblesRef = useRef<GameObject[]>([]);
  const cameraXRef = useRef(0);
  const furthestXRef = useRef(800);
  const objectIdCounter = useRef(0);

  useGameSessionProgress({
    gameName: 'Platform Runner',
    score,
    level: 1,
    isPlaying: gameState === 'playing',
    metaData: { coins, streak },
  });

  const doJump = useCallback(() => {
    if (gameState !== 'playing') return;
    const player = playerRef.current;
    if (player.y >= GROUND_Y - player.h - 5) { // On ground
      player.vy = -16;
      playClick(); // Jump sound essentially
      triggerHaptic('success');
    }
  }, [gameState, playClick]);

  const handleHandFrame = useCallback((frame: TrackedHandFrame) => {
    if (gameState !== 'playing') return;
    const tip = frame.indexTip;

    if (tip) {
      if (!lastHandStateRef.current) {
        setIsHandDetected(true);
        lastHandStateRef.current = true;
      }

      const handRaised = tip.y < 0.4; // Top 40% of screen
      const handLowered = tip.y > 0.6; // Bottom 40% of screen

      if (handRaised && canJumpRef.current) {
        doJump();
        canJumpRef.current = false;
      } else if (handLowered) {
        canJumpRef.current = true;
      }

    } else {
      if (lastHandStateRef.current) {
        setIsHandDetected(false);
        lastHandStateRef.current = false;
        canJumpRef.current = true; // reset jump state if hand lost
      }
    }
  }, [gameState, doJump]);

  const { isReady, isLoading, startTracking } = useGameHandTracking({
    gameName: 'PlatformerRunner',
    isRunning: gameState === 'playing',
    webcamRef,
    onFrame: handleHandFrame,
  });

  useEffect(() => {
    if (gameState === 'playing' && !isReady && !isLoading) {
      void startTracking();
    }
  }, [gameState, isReady, isLoading, startTracking]);

  // Spacebar fallback
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        doJump();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [doJump]);

  const setGameOver = useCallback(() => {
    setGameState('complete');
    playError();
    triggerHaptic('error');
    speak("Oh no, you hit a slime! Good run!");
  }, [playError, speak]);

  // Main physics loop
  useEffect(() => {
    if (gameState !== 'playing') return;

    let lastTime = performance.now();

    const gameLoop = (time: number) => {
      const dt = Math.min((time - lastTime) / 16.66, 2); // Cap dt to prevent massive jumps on lag
      lastTime = time;

      const player = playerRef.current;

      // Apply physics to player
      player.vy += 0.8 * dt; // Gravity
      player.x += player.vx * dt; // Auto run forward
      player.y += player.vy * dt;

      // Ground collision
      if (player.y > GROUND_Y - player.h) {
        player.y = GROUND_Y - player.h;
        player.vy = 0;
      }

      // Move camera tightly with player (keep player at left 200px)
      cameraXRef.current = player.x - 200;

      // Generate terrain ahead
      while (furthestXRef.current < player.x + CANVAS_WIDTH * 2) {
        const newX = furthestXRef.current + 300 + Math.random() * 400; // Scatter

        // 70% chance coin, 30% chance enemy
        if (Math.random() < 0.7) {
          // Spawn 1-3 coins in an arc or row
          const numCoins = Math.floor(Math.random() * 3) + 1;
          const baseY = GROUND_Y - 80 - Math.random() * 60; // Sometimes high for jumps
          for (let i = 0; i < numCoins; i++) {
            collectiblesRef.current.push({
              id: objectIdCounter.current++,
              type: Math.random() < 0.1 ? 'star' : 'coin',
              x: newX + i * 50,
              y: baseY - (i % 2 === 1 ? 50 : 0), // Arc pattern
              w: 32,
              h: 32,
              vx: 0,
              vy: 0,
              active: true,
              frameTimer: 0,
              frameIndex: 0
            });
          }
        } else {
          // Spawn enemy ground level
          enemiesRef.current.push({
            id: objectIdCounter.current++,
            type: 'slime',
            x: newX,
            y: GROUND_Y - 32,
            w: 48,
            h: 32,
            vx: -1, // Slow crawl left
            vy: 0,
            active: true,
            frameTimer: 0,
            frameIndex: 0
          });
        }
        furthestXRef.current = newX + 200; // Bump furthest
      }

      // Cleanup entities behind camera
      const cleanupDist = cameraXRef.current - 200;
      enemiesRef.current = enemiesRef.current.filter((e) => e.x > cleanupDist);
      collectiblesRef.current = collectiblesRef.current.filter((c) => c.x > cleanupDist);

      let isGameOver = false;

      // Update & Collide Enemies
      enemiesRef.current.forEach((enemy) => {
        if (!enemy.active) return;
        enemy.x += enemy.vx * dt;

        if (checkCollision(player, enemy)) {
          isGameOver = true;
        }
      });

      // Update & Collide Collectibles
      collectiblesRef.current.forEach((collectible) => {
        if (!collectible.active) return;

        if (checkCollision(player, collectible)) {
          collectible.active = false;

          const newStreak = incrementStreak(1);
          setCoins((c) => c + 1);

          const pts = collectible.type === 'star' ? 50 : 10;
          const streakBonus = Math.min(newStreak * 2, 15);
          const totalPoints = pts + streakBonus;

          setScore((s) => s + totalPoints);

          setScorePopup({
            points: totalPoints,
            x: ((collectible.x - cameraXRef.current) / CANVAS_WIDTH) * 100,
            y: (collectible.y / CANVAS_HEIGHT) * 100
          });

          // Audio & Haptics
          playSuccess();
          triggerHaptic('success');

          // Milestone every 5 
          if (newStreak > 0 && newStreak % 5 === 0) {
            triggerHaptic('celebration');
          }
        }
      });

      // Render
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#87CEEB';
          ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

          ctx.save();
          ctx.translate(-cameraXRef.current, 0);

          // Draw endless ground spanning the camera viewport bounds
          ctx.fillStyle = '#8B4513'; // Dirt brown
          const vpX = cameraXRef.current;
          ctx.fillRect(vpX - 100, GROUND_Y, CANVAS_WIDTH + 200, CANVAS_HEIGHT - GROUND_Y);
          // Draw grass trim
          ctx.fillStyle = '#228B22'; // Forest Green
          ctx.fillRect(vpX - 100, GROUND_Y, CANVAS_WIDTH + 200, 20);


          // Draw collectibles
          collectiblesRef.current.forEach((c) => {
            if (!c.active) return;
            ctx.fillStyle = c.type === 'star' ? '#FBBF24' : '#FDE047';
            ctx.beginPath();
            ctx.arc(c.x + c.w / 2, c.y + c.h / 2, c.w / 2, 0, Math.PI * 2);
            ctx.fill();
            // Inner ring
            ctx.fillStyle = c.type === 'star' ? '#F59E0B' : '#FACC15';
            ctx.beginPath();
            ctx.arc(c.x + c.w / 2, c.y + c.h / 2, c.w / 3, 0, Math.PI * 2);
            ctx.fill();
          });

          // Draw enemies
          enemiesRef.current.forEach((e) => {
            if (!e.active) return;
            ctx.fillStyle = '#DC2626'; // Slime Red
            ctx.beginPath();
            ctx.roundRect(e.x, e.y, e.w, e.h, [10, 10, 0, 0]);
            ctx.fill();
            // Eyes
            ctx.fillStyle = 'white';
            ctx.beginPath();
            ctx.arc(e.x + 10, e.y + e.h / 2, 4, 0, Math.PI * 2);
            ctx.arc(e.x + e.w - 10, e.y + e.h / 2, 4, 0, Math.PI * 2);
            ctx.fill();
          });

          // Draw player
          ctx.fillStyle = '#2563EB'; // Blue Player
          ctx.beginPath();
          ctx.roundRect(player.x, player.y, player.w, player.h, 10);
          ctx.fill();

          ctx.restore();
        }
      }

      if (isGameOver) {
        setGameOver();
      } else {
        gameLoopRef.current = requestAnimationFrame(gameLoop);
      }
    };

    gameLoopRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameState, incrementStreak, playSuccess, setGameOver, setScorePopup]);

  const handleStart = () => {
    playClick();
    setGameState('playing');
    setScore(0);
    setCoins(0);
    resetStreak();

    enemiesRef.current = [];
    collectiblesRef.current = [];
    playerRef.current.x = 100;
    playerRef.current.y = GROUND_Y - 64;
    playerRef.current.vy = 0;
    cameraXRef.current = 0;
    furthestXRef.current = 800; // Reset generation marker

    speak("Let's go! Raise your hand high to jump over the slimes and grab the coins!");
  };

  const handlePointerDown = () => {
    doJump();
  };

  const handleFinish = useCallback(async () => {
    playClick();
    await onGameComplete(Math.round(score / 10));
    navigate('/games');
  }, [score, onGameComplete, navigate, playClick]);

  return (
    <GameContainer title="Platform Runner" onHome={() => navigate('/games')} reportSession={false}>
      <div className="flex flex-col items-center gap-4 p-4 touch-none select-none">

        <CameraThumbnail webcamRef={webcamRef} isHandDetected={isHandDetected} visible={gameState === 'playing'} />

        {gameState === 'playing' && (
          <HandTrackingStatus
            isHandDetected={isHandDetected}
            pauseOnHandLost={true}
            voicePrompt={true}
            showMascot={true}
          />
        )}

        {gameState === 'start' && (
          <div className="text-center bg-white/80 p-12 rounded-[2rem] border-4 border-blue-300 shadow-xl max-w-xl mx-auto mt-10">
            <p className="text-[6rem] mb-4">🏃</p>
            <h2 className="text-4xl font-black mb-4 text-blue-600">Platform Runner!</h2>
            <p className="mb-6 text-xl font-bold text-slate-600">Raise your hand (or tap) to jump over slimes!</p>
            <button type="button" onClick={handleStart} className="px-10 py-5 bg-blue-500 hover:bg-blue-600 text-white rounded-2xl font-black text-2xl shadow-[0_6px_0_#1D4ED8] active:translate-y-2 active:shadow-none transition-all">
              Run! 👟
            </button>
            <VoiceInstructions
              instructions="Let's run! Raise your hand high to jump!"
              autoSpeak={true}
              showReplayButton={true}
            />
          </div>
        )}

        {gameState === 'playing' && (
          <>
            <div className="relative w-full max-w-2xl mx-auto aspect-[4/3]">
              <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT}
                onPointerDown={handlePointerDown}
                className="w-full h-full touch-none cursor-pointer rounded-[2rem] shadow-2xl border-4 border-blue-300 object-cover bg-sky-300"
              />

              {/* Score Popup */}
              {scorePopup && (
                <motion.div
                  initial={{ opacity: 1, y: 0, scale: 1 }}
                  animate={{ opacity: 0, y: -50, scale: 1.2 }}
                  transition={{ duration: 0.7, ease: 'easeOut' }}
                  className="absolute pointer-events-none z-20"
                  style={{
                    left: `${scorePopup.x}%`,
                    top: `${scorePopup.y}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                >
                  <div className="text-4xl font-black text-white drop-shadow-[0_4px_4px_rgba(234,179,8,0.8)] stroke-yellow-500" style={{ WebkitTextStroke: '2px #CA8A04' }}>
                    +{scorePopup.points}
                  </div>
                </motion.div>
              )}

              {/* Streak Milestone */}
              <AnimatePresence>
                {showMilestone && (
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0, rotate: 180 }}
                    className="absolute inset-0 flex items-center justify-center pointer-events-none z-30"
                  >
                    <div className="bg-gradient-to-r from-orange-400 to-red-500 text-white px-8 py-4 rounded-[2rem] font-black text-4xl shadow-2xl border-4 border-white">
                      🔥 {streak} Streak! 🔥
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="flex gap-4 relative z-10 -mt-2">
              <div className="bg-yellow-100 px-6 py-3 rounded-2xl text-center border-2 border-yellow-200">
                <p className="text-sm font-bold tracking-widest uppercase text-yellow-600">Coins</p>
                <p className="text-3xl font-black text-slate-800">{coins}</p>
              </div>
              <div className="bg-blue-100 px-6 py-3 rounded-2xl text-center border-2 border-blue-200">
                <p className="text-sm font-bold tracking-widest uppercase text-blue-600">Score</p>
                <p className="text-3xl font-black text-slate-800">{score}</p>
              </div>
              {streak > 0 && (
                <div className="bg-orange-100 px-6 py-3 rounded-2xl text-center border-2 border-orange-200">
                  <p className="text-sm font-bold tracking-widest uppercase text-orange-600">Streak</p>
                  <p className="text-3xl font-black text-orange-600">🔥 {streak}</p>
                </div>
              )}
            </div>
          </>
        )}

        {gameState === 'complete' && (
          <div className="text-center bg-white p-12 rounded-[2rem] border-4 border-blue-300 shadow-xl max-w-xl mx-auto mt-10">
            <p className="text-6xl mb-4">😵</p>
            <h2 className="text-4xl font-black mb-2 text-blue-600">Game Over!</h2>
            <p className="text-xl font-bold text-slate-600 mb-6">You grabbed {coins} coins!</p>
            <div className="bg-slate-100 rounded-2xl p-6 mb-8 inline-block">
              <p className="text-lg font-bold text-slate-500 mb-1">Final Score</p>
              <p className="text-5xl font-black text-slate-800">{score}</p>
            </div>
            <div className="flex gap-4 justify-center">
              <button type="button" onClick={handleFinish} className="px-8 py-4 bg-slate-200 border-2 border-slate-300 hover:bg-slate-300 text-slate-700 rounded-2xl font-black text-xl transition-all">Finish</button>
              <button type="button" onClick={handleStart} className="px-8 py-4 bg-blue-500 hover:bg-blue-600 text-white rounded-2xl font-black text-xl shadow-[0_4px_0_#1D4ED8] active:translate-y-1 active:shadow-none">Play Again</button>
            </div>
          </div>
        )}

      </div>
    </GameContainer>
  );
});

// Main export wrapped with GameShell
export const PlatformerRunner = memo(function PlatformerRunnerComponent() {
  return <PlatformerRunnerGame />;
});
