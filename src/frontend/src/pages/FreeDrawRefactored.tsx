/**
 * Free Draw / Finger Painting Game
 *
 * Open-ended creative canvas for pure artistic expression.
 */

import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Palette, Paintbrush, Trash2, Save } from 'lucide-react';
import { GameShell } from '../components/GameShell';
import { GameContainer } from '../components/GameContainer';
import { AccessDenied } from '../components/ui/AccessDenied';
import { useSubscription } from '../hooks/useSubscription';
import { progressQueue } from '../services/progressQueue';
import { useProgressStore } from '../store';
import WellnessTimer from '../components/WellnessTimer';
import { GlobalErrorBoundary } from '../components/errors/GlobalErrorBoundary';
import { useGameDrops } from '../hooks/useGameDrops';
import { useAudio } from '../utils/hooks/useAudio';
import { useGameHandTracking } from '../hooks/useGameHandTracking';
import { useHandClick } from '../hooks/useHandClick';
import type { Point } from '../types/tracking';
import {
  type GameState,
  initializeGame,
  startStroke,
  continueStroke,
  endStroke,
  clearCanvas,
  setBrushColor,
  exportCanvas,
  isCanvasEmpty,
  COLOR_PALETTE,
} from '../games/freeDrawLogic';

export const FreeDraw = memo(function FreeDrawComponent() {
  const navigate = useNavigate();
  const reducedMotion = useReducedMotion();
  const { canAccessGame, isLoading: subLoading } = useSubscription();
  const hasAccess = canAccessGame('free-draw');
  const { currentProfile } = useProgressStore();
  const { onGameComplete } = useGameDrops('free-draw');

  const { playClick } = useAudio();
  const [gameState, setGameState] = useState<GameState>(initializeGame());
  const [showMenu, setShowMenu] = useState(true);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lastPointRef = useRef<Point | null>(null);
  const wasPinchingRef = useRef(false);

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
    return <AccessDenied gameName='Free Draw' gameId='free-draw' />;
  }

  // Error state
  if (error) {
    return (
      <GameContainer title='Free Draw' onHome={() => navigate('/games')}>
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
          gameId: 'free-draw',
          score: finalScore,
          completed: true,
          metadata: {
            strokesCreated: gameState.canvas.strokes.length,
            brushType: gameState.currentBrush.type,
          },
        });
        onGameComplete(finalScore);
      } catch (err) {
        console.error('Failed to save progress:', err);
        setError(err as Error);
      }
    },
    [
      currentProfile,
      gameState.canvas.strokes.length,
      gameState.currentBrush.type,
      onGameComplete,
    ],
  );

  const { cursor, pinch } = useGameHandTracking({
    gameName: 'FreeDraw',
    targetFps: 30,
  });
  useHandClick(pinch.isPinching, cursor, !showMenu);

  useEffect(() => {
    if (showMenu || !cursor || !canvasRef.current) {
      if (wasPinchingRef.current) {
        setGameState((prev) => endStroke(prev));
      }
      wasPinchingRef.current = false;
      return;
    }

    const canvas = canvasRef.current;
    const point: Point = {
      x: cursor.x * canvas.width,
      y: cursor.y * canvas.height,
    };

    if (pinch.isPinching && !wasPinchingRef.current) {
      setGameState((prev) => startStroke(prev, point));
    } else if (pinch.isPinching) {
      setGameState((prev) => continueStroke(prev, point));
    } else if (!pinch.isPinching && wasPinchingRef.current) {
      setGameState((prev) => endStroke(prev));
    }

    lastPointRef.current = point;
    wasPinchingRef.current = pinch.isPinching;
  }, [cursor, pinch.isPinching, showMenu]);

  // Canvas rendering
  useEffect(() => {
    try {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Clear and redraw
      ctx.fillStyle = gameState.canvas.backgroundColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw strokes
      const strokesToDraw = gameState.canvas.currentStroke
        ? [...gameState.canvas.strokes, gameState.canvas.currentStroke]
        : gameState.canvas.strokes;

      strokesToDraw.forEach((stroke) => {
        if (!stroke.points.length) return;
        ctx.beginPath();
        ctx.strokeStyle = stroke.brush.color;
        ctx.lineWidth = stroke.brush.size;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
        stroke.points.forEach((point) => ctx.lineTo(point.x, point.y));
        ctx.stroke();
      });
    } catch (err) {
      console.error('Canvas rendering failed:', err);
      setError(err as Error);
    }
  }, [
    gameState.canvas.backgroundColor,
    gameState.canvas.currentStroke,
    gameState.canvas.strokes,
  ]);

  const handleStart = useCallback(() => {
    playClick();
    setShowMenu(false);
    setGameState(initializeGame());
  }, [playClick]);

  const handleStop = useCallback(async () => {
    try {
      playClick();
      if (!isCanvasEmpty(gameState)) {
        await handleGameComplete(100);
      }
      setShowMenu(true);
      navigate('/dashboard');
    } catch (err) {
      console.error('Stop failed:', err);
      setError(err as Error);
    }
  }, [gameState, handleGameComplete, navigate, playClick]);

  const handleClear = useCallback(() => {
    try {
      playClick();
      setGameState((prev) => clearCanvas(prev));
    } catch (err) {
      console.error('Clear failed:', err);
      setError(err as Error);
    }
  }, [playClick]);

  const handleSave = useCallback(async () => {
    try {
      playClick();
      if (!canvasRef.current) return;
      const dataUrl = exportCanvas(canvasRef.current);
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `free-draw-${Date.now()}.png`;
      link.click();
      setShowSaveSuccess(true);
      setTimeout(() => setShowSaveSuccess(false), 2000);
    } catch (err) {
      console.error('Save failed:', err);
      setError(err as Error);
    }
  }, [playClick]);

  return (
    <GlobalErrorBoundary>
      <div className='min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-4'>
        {showMenu ? (
          <motion.div
            className='max-w-2xl mx-auto mt-20 bg-white rounded-[2.5rem] border-3 border-[#F2CC8F] p-12 shadow-[0_4px_0_#E5B86E] text-center'
            initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
            animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
            transition={reducedMotion ? { duration: 0.01 } : { duration: 0.3 }}
          >
            <div className='flex justify-center gap-4 mb-6'>
              <Palette className='w-20 h-20 text-purple-500' />
              <Paintbrush className='w-20 h-20 text-pink-500' />
            </div>
            <h1 className='text-4xl font-black text-advay-slate mb-4'>
              Free Draw!
            </h1>
            <p className='text-xl text-text-secondary mb-8'>
              Create beautiful art with your finger!
            </p>

            <motion.button
              onClick={handleStart}
              whileHover={reducedMotion ? {} : { scale: 1.05 }}
              whileTap={reducedMotion ? {} : { scale: 0.95 }}
              className='px-10 py-5 bg-[#3B82F6] hover:bg-blue-600 text-white rounded-2xl font-black text-xl shadow-lg transition-all'
            >
              Start Drawing!
            </motion.button>
          </motion.div>
        ) : (
          <div className='max-w-6xl mx-auto'>
            <div className='flex justify-between items-center mb-4'>
              <motion.button
                onClick={handleStop}
                whileHover={reducedMotion ? {} : { scale: 1.05 }}
                whileTap={reducedMotion ? {} : { scale: 0.95 }}
                className='px-6 py-3 bg-white border-2 border-[#F2CC8F] rounded-xl font-bold hover:bg-slate-50'
              >
                Back
              </motion.button>

              <div className='flex gap-2'>
                <motion.button
                  onClick={handleClear}
                  whileHover={reducedMotion ? {} : { scale: 1.05 }}
                  whileTap={reducedMotion ? {} : { scale: 0.95 }}
                  className='px-4 py-2 bg-red-100 text-red-600 rounded-xl font-bold'
                >
                  <Trash2 className='w-5 h-5 inline' /> Clear
                </motion.button>
                <motion.button
                  onClick={handleSave}
                  whileHover={reducedMotion ? {} : { scale: 1.05 }}
                  whileTap={reducedMotion ? {} : { scale: 0.95 }}
                  className='px-4 py-2 bg-green-100 text-green-600 rounded-xl font-bold'
                >
                  <Save className='w-5 h-5 inline' /> Save
                </motion.button>
              </div>
            </div>

            <div className='bg-white rounded-2xl border-3 border-[#F2CC8F] p-4 shadow-lg'>
              <canvas
                ref={canvasRef}
                width={800}
                height={600}
                className='w-full cursor-crosshair touch-none rounded-xl'
                onMouseDown={(e) => {
                  try {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;
                    setGameState((prev) => startStroke(prev, { x, y }));
                    lastPointRef.current = { x, y };
                  } catch (err) {
                    console.error('Mouse down failed:', err);
                    setError(err as Error);
                  }
                }}
                onMouseMove={(e) => {
                  try {
                    if (!lastPointRef.current) return;
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;
                    setGameState((prev) => continueStroke(prev, { x, y }));
                    lastPointRef.current = { x, y };
                  } catch (err) {
                    console.error('Mouse move failed:', err);
                    setError(err as Error);
                  }
                }}
                onMouseUp={() => {
                  try {
                    setGameState((prev) => endStroke(prev));
                    lastPointRef.current = null;
                  } catch (err) {
                    console.error('Mouse up failed:', err);
                    setError(err as Error);
                  }
                }}
                onMouseLeave={() => {
                  try {
                    setGameState((prev) => endStroke(prev));
                    lastPointRef.current = null;
                  } catch (err) {
                    console.error('Mouse leave failed:', err);
                    setError(err as Error);
                  }
                }}
              />
            </div>

            {/* Color palette */}
            <div className='mt-4 flex flex-wrap gap-2 justify-center'>
              {COLOR_PALETTE.map((color) => (
                <motion.button
                  key={color}
                  onClick={() => {
                    try {
                      playClick();
                      setGameState((prev) => setBrushColor(prev, color));
                    } catch (err) {
                      console.error('Color change failed:', err);
                    }
                  }}
                  whileHover={reducedMotion ? {} : { scale: 1.1 }}
                  whileTap={reducedMotion ? {} : { scale: 0.9 }}
                  className={`w-12 h-12 rounded-full border-4 ${
                    gameState.currentBrush.color === color
                      ? 'border-slate-800 scale-110'
                      : 'border-white'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
        )}

        {showSaveSuccess && (
          <motion.div
            initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
            animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
            className='fixed top-4 right-4 bg-green-100 text-green-700 px-6 py-3 rounded-xl font-bold shadow-lg'
          >
            Art saved! 🎨
          </motion.div>
        )}

        {/* Wellness timer */}
        <WellnessTimer />
      </div>
    </GlobalErrorBoundary>
  );
});

export default FreeDraw;
