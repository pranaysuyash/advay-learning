import { memo, useRef, useState, useEffect, useCallback } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { GameContainer } from '../components/GameContainer';
import { AccessDenied } from '../components/ui/AccessDenied';
import { useSubscription } from '../hooks/useSubscription';
import { progressQueue } from '../services/progressQueue';
import { useProgressStore } from '../store';
import WellnessTimer from '../components/WellnessTimer';
import { GlobalErrorBoundary } from '../components/errors/GlobalErrorBoundary';
import { useGameHandTracking } from '../hooks/useGameHandTracking';
import { useGameDrops } from '../hooks/useGameDrops';
import { useAudio } from '../utils/hooks/useAudio';
import type { TrackedHandFrame } from '../types/tracking';

// --- Assets ---
const ASSET_BASE = '/assets/kenney/platformer';
const ASSETS = {
  player: {
    idle: `${ASSET_BASE}/characters/character_green_idle.png`,
    jump: `${ASSET_BASE}/characters/character_green_jump.png`,
    hit: `${ASSET_BASE}/characters/character_green_hit.png`,
    walkA: `${ASSET_BASE}/characters/character_green_walk_a.png`,
    walkB: `${ASSET_BASE}/characters/character_green_walk_b.png`,
  },
  enemies: {
    slimeA: `${ASSET_BASE}/enemies/slime_normal_walk_a.png`,
    slimeB: `${ASSET_BASE}/enemies/slime_normal_walk_b.png`,
    beeA: `${ASSET_BASE}/enemies/bee_a.png`,
    beeB: `${ASSET_BASE}/enemies/bee_b.png`,
  },
  tiles: {
    grass: `${ASSET_BASE}/tiles/terrain_grass_horizontal_middle.png`,
  },
  collectibles: {
    coin: `${ASSET_BASE}/collectibles/coin_gold.png`,
    gem: `${ASSET_BASE}/collectibles/gem_blue.png`,
    star: `${ASSET_BASE}/collectibles/star.png`,
  },
  hud: {
    heart: `${ASSET_BASE}/hud/hud_heart.png`,
    heartEmpty: `${ASSET_BASE}/hud/hud_heart_empty.png`,
  },
  bg: `${ASSET_BASE}/spritesheet-backgrounds-default.png`,
  sounds: {
    jump: `${ASSET_BASE}/sounds/sfx_jump.ogg`,
    coin: `${ASSET_BASE}/sounds/sfx_coin.ogg`,
    hurt: `${ASSET_BASE}/sounds/sfx_hurt.ogg`,
    bump: `${ASSET_BASE}/sounds/sfx_bump.ogg`,
    gem: `${ASSET_BASE}/sounds/sfx_gem.ogg`,
  },
};
void ASSETS;

// --- Types & Constants ---
type GameStateType = 'LOADING' | 'READY' | 'PLAYING' | 'GAMEOVER';

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

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const GROUND_Y = CANVAS_HEIGHT - 64;

// Simple AABB Collision
function checkCollision(r1: Rect, r2: Rect, margin = 0.8): boolean {
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

export const PlatformerRunner = memo(function PlatformerRunnerComponent() {
  const navigate = useNavigate();
  const reducedMotion = useReducedMotion();
  const { canAccessGame, isLoading: subLoading } = useSubscription();
  const hasAccess = canAccessGame('platformer-runner');
  const { currentProfile } = useProgressStore();
  const { onGameComplete } = useGameDrops('platformer-runner');
  const { playClick, playSuccess, playError } = useAudio();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<GameStateType>('LOADING');
  const [score, setScore] = useState(0);
  const [coins, setCoins] = useState(0);
  const [lives, setLives] = useState(3);
  const [error, setError] = useState<Error | null>(null);

  const gameLoopRef = useRef<number | null>(null);
  const webcamRef = useRef<Webcam>(null);
  const playerRef = useRef<GameObject>({
    id: 0,
    type: 'player',
    x: 100,
    y: GROUND_Y - 64,
    w: 48,
    h: 64,
    vx: 0,
    vy: 0,
    active: true,
    frameTimer: 0,
    frameIndex: 0,
  });
  const enemiesRef = useRef<GameObject[]>([]);
  const collectiblesRef = useRef<GameObject[]>([]);
  const cameraXRef = useRef(0);

  // Show loading while checking subscription
  if (subLoading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-red-500'></div>
      </div>
    );
  }

  // Check subscription access
  if (!hasAccess) {
    return (
      <AccessDenied gameName='Platform Runner' gameId='platformer-runner' />
    );
  }

  // Error state
  if (error) {
    return (
      <GameContainer title='Platform Runner' onHome={() => navigate('/games')}>
        <div className='flex items-center justify-center min-h-screen'>
          <div className='text-center'>
            <h2 className='text-2xl font-bold text-red-600 mb-4'>
              Oops! Something went wrong
            </h2>
            <p className='text-slate-600 mb-4'>{error.message}</p>
            <button
              onClick={() => {
                setError(null);
                window.location.reload();
              }}
              className='px-6 py-3 bg-[#3B82F6] text-white rounded-xl font-bold'
            >
              Try Again
            </button>
          </div>
        </div>
      </GameContainer>
    );
  }

  // Save progress on game complete
  const handleGameComplete = useCallback(
    async (finalScore: number) => {
      if (!currentProfile) return;

      try {
        await progressQueue.add({
          profileId: currentProfile.id,
          gameId: 'platformer-runner',
          score: finalScore,
          completed: true,
          metadata: {
            coins: coins,
            lives: lives,
          },
        });
        onGameComplete(finalScore);
      } catch (err) {
        console.error('Failed to save progress:', err);
        setError(err as Error);
      }
    },
    [currentProfile, coins, lives, onGameComplete],
  );

  // Hand tracking for jump
  const handleHandFrame = useCallback(
    (frame: TrackedHandFrame) => {
      try {
        if (!frame.indexTip) return;

        // If hand is raised high, jump
        const handRaised = frame.indexTip.y < 0.3;
        if (handRaised && playerRef.current.y >= GROUND_Y - 64 - 5) {
          playerRef.current.vy = -15;
          playClick();
        }
      } catch (err) {
        console.error('Hand tracking failed:', err);
      }
    },
    [playClick],
  );

  const { handVisible } = useGameHandTracking({
    gameName: 'PlatformerRunner',
    webcamRef,
    onFrame: handleHandFrame,
  });

  // Initialize game
  useEffect(() => {
    try {
      // Initialize enemies
      enemiesRef.current = Array.from({ length: 10 }, (_, i) => ({
        id: i,
        type: 'slime',
        x: 400 + i * 300,
        y: GROUND_Y - 32,
        w: 48,
        h: 32,
        vx: -2,
        vy: 0,
        active: true,
        frameTimer: 0,
        frameIndex: 0,
        startY: GROUND_Y - 32,
      }));

      // Initialize collectibles
      collectiblesRef.current = Array.from({ length: 20 }, (_, i) => ({
        id: i,
        type: i % 5 === 0 ? 'star' : 'coin',
        x: 300 + i * 200,
        y: GROUND_Y - 100 - (i % 3) * 50,
        w: 32,
        h: 32,
        vx: 0,
        vy: 0,
        active: true,
        frameTimer: 0,
        frameIndex: 0,
      }));

      setGameState('READY');
    } catch (err) {
      console.error('Game init failed:', err);
      setError(err as Error);
    }
  }, []);

  // Game loop
  useEffect(() => {
    if (gameState !== 'PLAYING') return;

    try {
      const gameLoop = () => {
        const player = playerRef.current;

        // Apply gravity
        player.vy += 0.8;
        player.y += player.vy;

        // Ground collision
        if (player.y > GROUND_Y - player.h) {
          player.y = GROUND_Y - player.h;
          player.vy = 0;
        }

        // Move camera with player
        if (player.x > 300) {
          cameraXRef.current = player.x - 300;
        }

        // Update enemies
        enemiesRef.current.forEach((enemy) => {
          if (!enemy.active) return;

          enemy.x += enemy.vx;
          enemy.frameTimer++;
          if (enemy.frameTimer > 10) {
            enemy.frameIndex = (enemy.frameIndex + 1) % 2;
            enemy.frameTimer = 0;
          }

          // Collision with player
          if (checkCollision(player, enemy)) {
            if (player.vy > 0 && player.y < enemy.y) {
              // Jumped on enemy
              enemy.active = false;
              player.vy = -10;
              setScore((s) => s + 50);
              playSuccess();
            } else {
              // Hit by enemy
              setLives((l) => {
                const newLives = l - 1;
                if (newLives <= 0) {
                  setGameState('GAMEOVER');
                  void handleGameComplete(score);
                }
                return newLives;
              });
              playError();
            }
          }
        });

        // Update collectibles
        collectiblesRef.current.forEach((collectible) => {
          if (!collectible.active) return;

          if (checkCollision(player, collectible)) {
            collectible.active = false;
            if (collectible.type === 'coin') {
              setCoins((c) => c + 1);
              setScore((s) => s + 10);
            } else if (collectible.type === 'star') {
              setCoins((c) => c + 5);
              setScore((s) => s + 50);
            }
            playSuccess();
          }
        });

        // Render
        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext('2d');
          if (ctx) {
            // Clear
            ctx.fillStyle = '#87CEEB';
            ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

            ctx.save();
            ctx.translate(-cameraXRef.current, 0);

            // Draw ground
            ctx.fillStyle = '#8B4513';
            ctx.fillRect(0, GROUND_Y, 5000, CANVAS_HEIGHT - GROUND_Y);

            // Draw collectibles
            collectiblesRef.current.forEach((c) => {
              if (!c.active) return;
              ctx.fillStyle = c.type === 'coin' ? '#FFD700' : '#FFD700';
              ctx.beginPath();
              ctx.arc(c.x + c.w / 2, c.y + c.h / 2, c.w / 2, 0, Math.PI * 2);
              ctx.fill();
            });

            // Draw enemies
            enemiesRef.current.forEach((e) => {
              if (!e.active) return;
              ctx.fillStyle = '#90EE90';
              ctx.fillRect(e.x, e.y, e.w, e.h);
            });

            // Draw player
            ctx.fillStyle = '#32CD32';
            ctx.fillRect(player.x, player.y, player.w, player.h);

            ctx.restore();
          }
        }

        gameLoopRef.current = requestAnimationFrame(gameLoop);
      };

      gameLoopRef.current = requestAnimationFrame(gameLoop);
    } catch (err) {
      console.error('Game loop failed:', err);
      setError(err as Error);
    }

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameState, score, handleGameComplete, playSuccess, playError]);

  const handleStart = useCallback(() => {
    try {
      playClick();
      setGameState('PLAYING');
      setScore(0);
      setCoins(0);
      setLives(3);
      playerRef.current.x = 100;
      playerRef.current.y = GROUND_Y - 64;
      playerRef.current.vy = 0;
      cameraXRef.current = 0;
    } catch (err) {
      console.error('Game start failed:', err);
      setError(err as Error);
    }
  }, [playClick]);

  const handleStop = useCallback(async () => {
    try {
      playClick();
      await handleGameComplete(score);
      setGameState('READY');
      navigate('/dashboard');
    } catch (err) {
      console.error('Game stop failed:', err);
      setError(err as Error);
    }
  }, [score, handleGameComplete, navigate, playClick]);

  return (
    <GlobalErrorBoundary>
      <GameContainer
        title='Platform Runner'
        score={score}
        level={1}
        onHome={() => navigate('/games')}
        reportSession={false}
      >
        <div className='flex flex-col h-full bg-slate-50'>
          {/* Stats Bar */}
          <div className='flex justify-between items-center p-4 bg-white shadow-[0_4px_0_#E5B86F]'>
            <div className='flex gap-6'>
              <div>
                <span className='text-text-secondary text-sm'>Score:</span>
                <span className='font-bold text-blue-600 ml-2 text-xl'>
                  {score}
                </span>
              </div>
              <div>
                <span className='text-text-secondary text-sm'>Coins:</span>
                <span className='font-bold text-yellow-600 ml-2'>{coins}</span>
              </div>
              <div>
                <span className='text-text-secondary text-sm'>Lives:</span>
                <span className='font-bold text-red-600 ml-2'>{lives}</span>
              </div>
            </div>
          </div>

          {/* Game Canvas */}
          <div className='flex-1 relative'>
            {gameState === 'READY' && (
              <div className='absolute inset-0 flex items-center justify-center bg-black/50 z-10'>
                <motion.div
                  initial={
                    reducedMotion ? { opacity: 1 } : { opacity: 0, scale: 0.8 }
                  }
                  animate={
                    reducedMotion ? { opacity: 1 } : { opacity: 1, scale: 1 }
                  }
                  className='bg-white p-8 rounded-2xl text-center'
                >
                  <h2 className='text-2xl font-bold mb-4'>Platform Runner!</h2>
                  <p className='text-slate-600 mb-6'>
                    Raise your hand to jump!
                  </p>
                  <motion.button
                    onClick={handleStart}
                    whileHover={reducedMotion ? {} : { scale: 1.05 }}
                    whileTap={reducedMotion ? {} : { scale: 0.95 }}
                    className='px-8 py-4 bg-[#3B82F6] text-white rounded-xl font-bold'
                  >
                    Start Game
                  </motion.button>
                </motion.div>
              </div>
            )}

            {gameState === 'GAMEOVER' && (
              <div className='absolute inset-0 flex items-center justify-center bg-black/50 z-10'>
                <motion.div
                  initial={
                    reducedMotion ? { opacity: 1 } : { opacity: 0, scale: 0.8 }
                  }
                  animate={
                    reducedMotion ? { opacity: 1 } : { opacity: 1, scale: 1 }
                  }
                  className='bg-white p-8 rounded-2xl text-center'
                >
                  <h2 className='text-2xl font-bold text-red-600 mb-4'>
                    Game Over!
                  </h2>
                  <p className='text-slate-600 mb-4'>Score: {score}</p>
                  <p className='text-slate-600 mb-6'>Coins: {coins}</p>
                  <motion.button
                    onClick={handleStart}
                    whileHover={reducedMotion ? {} : { scale: 1.05 }}
                    whileTap={reducedMotion ? {} : { scale: 0.95 }}
                    className='px-8 py-4 bg-[#3B82F6] text-white rounded-xl font-bold mr-4'
                  >
                    Play Again
                  </motion.button>
                  <motion.button
                    onClick={handleStop}
                    whileHover={reducedMotion ? {} : { scale: 1.05 }}
                    whileTap={reducedMotion ? {} : { scale: 0.95 }}
                    className='px-8 py-4 bg-slate-200 text-slate-700 rounded-xl font-bold'
                  >
                    Exit
                  </motion.button>
                </motion.div>
              </div>
            )}

            <canvas
              ref={canvasRef}
              width={CANVAS_WIDTH}
              height={CANVAS_HEIGHT}
              className='w-full h-full'
            />
          </div>

          {/* Controls */}
          <div className='p-4 bg-white border-t flex justify-between items-center'>
            <div className='flex items-center gap-2'>
              <span className='text-sm text-slate-600'>Hand Status:</span>
              <span
                className={`px-3 py-1 rounded-full text-sm font-bold ${handVisible ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
              >
                {handVisible ? 'Visible' : 'Not Visible'}
              </span>
            </div>
            <motion.button
              onClick={handleStop}
              whileHover={reducedMotion ? {} : { scale: 1.05 }}
              whileTap={reducedMotion ? {} : { scale: 0.95 }}
              className='px-6 py-3 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold'
            >
              Stop
            </motion.button>
          </div>

          {/* Wellness timer */}
          <WellnessTimer />
        </div>
      </GameContainer>
    </GlobalErrorBoundary>
  );
});
