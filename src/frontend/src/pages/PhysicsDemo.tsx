/**
 * Physics Demo - Color Sort Prototype
 *
 * Demonstrates Matter.js integration for physics-based games.
 * Drop colored balls into matching buckets.
 */

import { memo, useEffect, useRef, useState, useCallback } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Matter from 'matter-js';
import { GameContainer } from '../components/GameContainer';
import { AccessDenied } from '../components/ui/AccessDenied';
import { useSubscription } from '../hooks/useSubscription';
import WellnessTimer from '../components/WellnessTimer';
import { GlobalErrorBoundary } from '../components/errors/GlobalErrorBoundary';
import {
  COLORS,
  initializeGame,
  createPhysicsWorld,
  dropBall,
  updateGameState,
  cleanupPhysics,
  getRandomColor,
  type GameState,
  type PhysicsBodies,
} from '../games/colorSortLogic';
import { useAudio } from '../utils/hooks/useAudio';

export const PhysicsDemo = memo(function PhysicsDemoComponent() {
  const navigate = useNavigate();
  const reducedMotion = useReducedMotion();
  const { canAccessGame, isLoading: subLoading } = useSubscription();
  const hasAccess = canAccessGame('physics-demo');

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const physicsRef = useRef<PhysicsBodies | null>(null);
  const runnerRef = useRef<Matter.Runner | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const { playClick, playSuccess, playError, playLevelUp } = useAudio();

  const [gameState, setGameState] = useState<GameState>(initializeGame());
  const [nextColor, setNextColor] = useState<string>(getRandomColor());
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);

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
    return <AccessDenied gameName='Physics Demo' gameId='physics-demo' />;
  }

  // Error state
  if (error) {
    return (
      <GameContainer title='Physics Demo' onHome={() => navigate('/games')}>
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

  // Initialize physics
  useEffect(() => {
    if (!canvasRef.current) return;

    try {
      const canvas = canvasRef.current;
      const width = canvas.width;
      const height = canvas.height;

      // Create physics world
      const physics = createPhysicsWorld(width, height);
      physicsRef.current = physics;

      // Create runner
      const runner = Matter.Runner.create();
      Matter.Runner.run(runner, physics.engine);
      runnerRef.current = runner;

      // Game loop
      const gameLoop = () => {
        if (physicsRef.current) {
          setGameState((prev) => {
            const { state, events } = updateGameState(
              prev,
              physicsRef.current!,
            );

            // Handle events
            events.forEach((event) => {
              switch (event.type) {
                case 'correct':
                  playSuccess();
                  setFeedback('✓ Correct!');
                  setTimeout(() => setFeedback(null), 1000);
                  break;
                case 'wrong':
                  playError();
                  setFeedback('✗ Wrong bucket!');
                  setTimeout(() => setFeedback(null), 1000);
                  break;
                case 'levelup':
                  playLevelUp();
                  setFeedback(`Level ${event.level}!`);
                  setTimeout(() => setFeedback(null), 2000);
                  break;
              }
            });

            return state;
          });
        }

        // Render
        render();

        animationFrameRef.current = requestAnimationFrame(gameLoop);
      };

      // Custom renderer
      const render = () => {
        const ctx = canvas.getContext('2d');
        if (!ctx || !physicsRef.current) return;

        // Clear canvas
        ctx.fillStyle = '#f0f9ff';
        ctx.fillRect(0, 0, width, height);

        // Draw buckets
        const bucketWidth = width / (COLORS.length + 1);
        COLORS.forEach((color, index) => {
          const x = bucketWidth * (index + 1);
          const y = height - 100;

          // Bucket background
          ctx.fillStyle = color.hex + '40';
          ctx.fillRect(x - bucketWidth / 3, y - 40, bucketWidth / 1.5, 120);

          // Bucket label
          ctx.fillStyle = color.hex;
          ctx.font = 'bold 16px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(color.name, x, y + 60);
        });

        // Draw bodies
        const bodies = Matter.Composite.allBodies(physicsRef.current.world);

        bodies.forEach((body) => {
          if (body.label === 'spawner') return;

          ctx.beginPath();

          if (body.label.includes('ball')) {
            ctx.arc(body.position.x, body.position.y, 20, 0, Math.PI * 2);
            ctx.fillStyle = body.render.fillStyle || '#999';
            ctx.fill();

            ctx.beginPath();
            ctx.arc(
              body.position.x - 5,
              body.position.y - 5,
              6,
              0,
              Math.PI * 2,
            );
            ctx.fillStyle = 'rgba(255,255,255,0.5)';
            ctx.fill();
          } else if (body.label.includes('bucket')) {
            const vertices = body.vertices;
            ctx.moveTo(vertices[0].x, vertices[0].y);
            for (let j = 1; j < vertices.length; j++) {
              ctx.lineTo(vertices[j].x, vertices[j].y);
            }
            ctx.lineTo(vertices[0].x, vertices[0].y);
            ctx.fillStyle = body.render.fillStyle || '#666';
            ctx.fill();
          }
        });
      };

      // Start game loop
      gameLoop();
      setGameState(startGame(initializeGame()));

      // Cleanup
      return () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
        if (runnerRef.current) {
          Matter.Runner.stop(runnerRef.current);
        }
        if (physicsRef.current) {
          cleanupPhysics(physicsRef.current);
        }
      };
    } catch (err) {
      console.error('Failed to initialize physics:', err);
      setError(err as Error);
    }
  }, []);

  // Handle canvas click to drop ball
  const handleCanvasClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      try {
        playClick();
        if (!canvasRef.current || !physicsRef.current) return;

        const rect = canvasRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const scaleX = canvasRef.current.width / rect.width;
        const canvasX = x * scaleX;

        // Drop ball
        const color = nextColor;
        const { updatedPhysics } = dropBall(physicsRef.current, canvasX, color);
        physicsRef.current = updatedPhysics;

        // Next color
        setNextColor(getRandomColor());

        setGameState((prev) => ({
          ...prev,
          ballsDropped: prev.ballsDropped + 1,
        }));
      } catch (err) {
        console.error('Canvas click failed:', err);
        setError(err as Error);
      }
    },
    [nextColor, playClick],
  );

  // Reset game
  const handleReset = () => {
    try {
      playClick();
      if (physicsRef.current) {
        physicsRef.current.balls.forEach((ball) => {
          Matter.Composite.remove(physicsRef.current!.world, ball);
        });
        physicsRef.current.balls = [];
      }

      setGameState(initializeGame());
      setNextColor(getRandomColor());
    } catch (err) {
      console.error('Reset failed:', err);
      setError(err as Error);
    }
  };

  return (
    <GlobalErrorBoundary>
      <GameContainer
        title='Physics Demo'
        onHome={() => navigate('/games')}
        showScore
        reportSession={false}
      >
        <div className='flex flex-col h-full bg-slate-50'>
          {/* Stats Bar */}
          <div className='flex justify-between items-center p-4 bg-white shadow-[0_4px_0_#E5B86E]'>
            <div className='flex gap-6'>
              <div>
                <span className='text-text-secondary text-sm'>Score:</span>
                <span className='font-bold text-blue-600 ml-2 text-xl'>
                  {gameState.score}
                </span>
              </div>
              <div>
                <span className='text-text-secondary text-sm'>Level:</span>
                <span className='font-bold text-purple-600 ml-2'>
                  {gameState.level}
                </span>
              </div>
              <div>
                <span className='text-text-secondary text-sm'>Sorted:</span>
                <span className='font-bold text-green-600 ml-2'>
                  {gameState.ballsSorted}
                </span>
              </div>
            </div>

            {/* Next Ball Preview */}
            <div className='flex items-center gap-3'>
              <span className='text-text-secondary text-sm'>Next:</span>
              <div
                className='w-8 h-8 rounded-full border-2 border-white shadow-md'
                style={{ backgroundColor: nextColor }}
              />
            </div>
          </div>

          {/* Feedback Overlay */}
          {feedback && (
            <motion.div
              initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={
                reducedMotion ? { duration: 0.01 } : { duration: 0.3 }
              }
              className='absolute top-20 left-1/2 -translate-x-1/2 bg-white/90 px-6 py-3 rounded-xl shadow-lg z-10'
            >
              <span className='text-xl font-bold'>{feedback}</span>
            </motion.div>
          )}

          {/* Game Canvas */}
          <div className='flex-1 relative'>
            <canvas
              ref={canvasRef}
              width={800}
              height={500}
              onClick={handleCanvasClick}
              className='w-full h-full cursor-crosshair'
              style={{ imageRendering: 'crisp-edges' }}
            />

            {/* Instructions */}
            <div className='absolute bottom-4 left-1/2 -translate-x-1/2 text-center text-text-secondary text-sm bg-white/80 px-4 py-2 rounded-lg'>
              Click anywhere to drop a ball! Match colors to the buckets.
            </div>
          </div>

          {/* Controls */}
          <div className='p-4 bg-white border-t flex justify-between items-center'>
            <div className='flex gap-2'>
              {COLORS.map((color) => (
                <div key={color.name} className='flex items-center gap-1'>
                  <div
                    className='w-4 h-4 rounded-full'
                    style={{ backgroundColor: color.hex }}
                  />
                  <span className='text-xs text-text-secondary'>
                    {color.name}
                  </span>
                </div>
              ))}
            </div>

            <motion.button
              onClick={handleReset}
              whileHover={reducedMotion ? {} : { scale: 1.05 }}
              whileTap={reducedMotion ? {} : { scale: 0.95 }}
              className='px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-medium'
            >
              Reset
            </motion.button>
          </div>

          {/* Wellness timer */}
          <WellnessTimer
            onBreakReminder={() => console.log('Break reminder')}
            onHydrationReminder={() => console.log('Hydration reminder')}
            onStretchReminder={() => console.log('Stretch reminder')}
          />
        </div>
      </GameContainer>
    </GlobalErrorBoundary>
  );
});

export default PhysicsDemo;

// Helper
function startGame(state: GameState): GameState {
  return { ...state, isPlaying: true };
}
