/**
 * Light Painter Game
 * 
 * Children draw glowing light trails on a dark canvas.
 * Creates a magical "light painting" effect.
 */

import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Trash2 } from 'lucide-react';
import { GameShell } from '../components/GameShell';
import { GameContainer } from '../components/GameContainer';
import { useSubscription } from '../hooks/useSubscription';
import { useGameDrops } from '../hooks/useGameDrops';
import { useAudio } from '../utils/hooks/useAudio';
import { triggerHaptic } from '../utils/haptics';
import { useGameHandTracking } from '../hooks/useGameHandTracking';
import type { Point } from '../types/tracking';
import {
  type GameState,
  type GlowColor,
  createInitialState,
  addTrailPoint,
  updateGlowSettings,
  clearCanvas,
  setBackgroundColor,
  getColorHex,
  GLOW_COLORS,
  BACKGROUND_COLORS,
} from '../games/lightPainterLogic';

function LightPainterGameContent() {
  const { canAccessGame, isLoading: subLoading } = useSubscription();
  const hasAccess = canAccessGame('light-painter');
  const { onGameComplete: _onGameComplete } = useGameDrops('light-painter');

  const { playClick } = useAudio();
  const [gameState, setGameState] = useState<GameState>(createInitialState());
  const [showMenu, setShowMenu] = useState(true);
  const [trailCount, setTrailCount] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const lastPointRef = useRef<Point | null>(null);

  // Hand tracking
  const { cursor, pinch } = useGameHandTracking({
    gameName: 'LightPainter',
    targetFps: 30,
  });

  // Handle hand tracking input
  useEffect(() => {
    if (showMenu || !cursor) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const point: Point = {
      x: cursor.x * canvas.width,
      y: cursor.y * canvas.height,
    };

    if (pinch.isPinching) {
      setGameState(prev => addTrailPoint(prev, point));
    }
  }, [cursor, pinch.isPinching, showMenu]);

  // Draw the canvas
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Fill background
    ctx.fillStyle = gameState.canvas.backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw trails with glow effect
    const now = Date.now();
    gameState.canvas.trails.forEach((trail) => {
      const age = now - trail.timestamp;
      const maxAge = 10000; // 10 seconds max
      const alpha = Math.max(0, 1 - age / maxAge);

      if (alpha > 0) {
        const hex = getColorHex(trail.color);
        
        // Outer glow
        ctx.beginPath();
        ctx.arc(trail.point.x, trail.point.y, trail.size * 1.5, 0, Math.PI * 2);
        ctx.fillStyle = hex + Math.floor(alpha * 60).toString(16).padStart(2, '0');
        ctx.fill();

        // Middle glow
        ctx.beginPath();
        ctx.arc(trail.point.x, trail.point.y, trail.size, 0, Math.PI * 2);
        ctx.fillStyle = hex + Math.floor(alpha * 150).toString(16).padStart(2, '0');
        ctx.fill();

        // Core bright spot
        ctx.beginPath();
        ctx.arc(trail.point.x, trail.point.y, trail.size * 0.4, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff' + Math.floor(alpha * 255).toString(16).padStart(2, '0');
        ctx.fill();
      }
    });

    animationRef.current = requestAnimationFrame(drawCanvas);
  }, [gameState.canvas.trails, gameState.canvas.backgroundColor]);

  // Setup canvas and animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas size
    const updateSize = () => {
      const container = canvas.parentElement;
      if (container) {
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);

    // Start animation loop
    animationRef.current = requestAnimationFrame(drawCanvas);

    return () => {
      window.removeEventListener('resize', updateSize);
      cancelAnimationFrame(animationRef.current);
    };
  }, [drawCanvas]);

  // Update trail count
  useEffect(() => {
    setTrailCount(gameState.canvas.trails.length);
  }, [gameState.canvas.trails.length]);

  // Handle touch/mouse input
  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    if (showMenu) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const point = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    lastPointRef.current = point;
    setGameState(prev => addTrailPoint(prev, point));
    triggerHaptic('success');
  }, [showMenu]);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    if (showMenu || !lastPointRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const point = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    
    // Interpolate between last point and current point for smooth trails
    const dx = point.x - lastPointRef.current.x;
    const dy = point.y - lastPointRef.current.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const steps = Math.max(1, Math.floor(dist / 5));
    
    for (let i = 1; i <= steps; i++) {
      const interpPoint = {
        x: lastPointRef.current.x + (dx * i) / steps,
        y: lastPointRef.current.y + (dy * i) / steps,
      };
      setGameState(prev => addTrailPoint(prev, interpPoint));
    }
    
    lastPointRef.current = point;
  }, [showMenu]);

  const handlePointerUp = useCallback(() => {
    lastPointRef.current = null;
  }, []);

  // Start game
  const startGame = useCallback(() => {
    setGameState(createInitialState());
    setShowMenu(false);
    playClick();
  }, [playClick]);

  // Return to menu
  const returnToMenu = useCallback(() => {
    setShowMenu(true);
    setGameState(createInitialState());
    playClick();
  }, [playClick]);

  // Clear canvas
  const handleClear = useCallback(() => {
    setGameState(prev => clearCanvas(prev));
    playClick();
  }, [playClick]);

  // Change glow color
  const handleColorChange = useCallback((color: GlowColor) => {
    setGameState(prev => updateGlowSettings(prev, { color }));
    playClick();
  }, [playClick]);

  // Change glow size
  const handleSizeChange = useCallback((size: number) => {
    setGameState(prev => updateGlowSettings(prev, { size }));
    playClick();
  }, [playClick]);

  // Change background
  const handleBgChange = useCallback((color: string) => {
    setGameState(prev => setBackgroundColor(prev, color));
    playClick();
  }, [playClick]);

  // Loading state
  if (subLoading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-red-500'></div>
      </div>
    );
  }

  // Access denied
  if (!hasAccess) {
    return (
      <GameShell gameId='light-painter' gameName='Light Painter'>
        <div className='flex items-center justify-center min-h-screen'>
          <div className='text-center'>
            <h2 className='text-2xl font-bold text-white mb-4'>
              Access Denied
            </h2>
            <p className='text-gray-300'>
              Upgrade to access Light Painter!
            </p>
          </div>
        </div>
      </GameShell>
    );
  }

  // Menu screen
  if (showMenu) {
    return (
      <GameShell gameId='light-painter' gameName='Light Painter'>
        <GameContainer title='Light Painter'>
          <div className='flex flex-col items-center justify-center min-h-[60vh] gap-8'>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className='text-8xl'
            >
              ✨
            </motion.div>
            
            <div className='text-center space-y-4'>
              <h1 className='text-4xl font-bold text-white'>Light Painter</h1>
              <p className='text-xl text-gray-300'>
                Draw with glowing light trails!
              </p>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={startGame}
              type='button'
              className='flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-500 text-white text-xl font-bold rounded-full shadow-lg'
            >
              <Sparkles className='w-6 h-6' />
              Start Painting
            </motion.button>
          </div>
        </GameContainer>
      </GameShell>
    );
  }

  // Game screen
  return (
    <GameShell gameId='light-painter' gameName='Light Painter'>
      <GameContainer title='Light Painter' onHome={returnToMenu}>
        <div className='relative w-full h-[70vh]'>
          {/* Canvas */}
          <canvas
            ref={canvasRef}
            className='absolute inset-0 rounded-xl cursor-crosshair touch-none'
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
          />

          {/* Color toolbar */}
          <div className='absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/50 backdrop-blur-sm rounded-full px-4 py-2'>
            {GLOW_COLORS.map((color) => (
              <button
                key={color.id}
                type='button'
                onClick={() => handleColorChange(color.id)}
                className={`w-8 h-8 rounded-full transition-all ${
                  gameState.currentGlow.color === color.id
                    ? 'scale-125 ring-2 ring-white'
                    : 'hover:scale-110'
                }`}
                style={{ backgroundColor: color.hex }}
                title={color.name}
              />
            ))}
          </div>

          {/* Size slider */}
          <div className='absolute top-20 left-4 flex flex-col items-center gap-2 bg-black/50 backdrop-blur-sm rounded-lg p-3'>
            <span className='text-xs text-gray-300'>Size</span>
            <input
              type='range'
              min='8'
              max='40'
              value={gameState.currentGlow.size}
              onChange={(e) => handleSizeChange(Number(e.target.value))}
              className='w-24 accent-cyan-400'
            />
          </div>

          {/* Background selector */}
          <div className='absolute top-4 right-4 flex items-center gap-2 bg-black/50 backdrop-blur-sm rounded-full px-3 py-2'>
            {BACKGROUND_COLORS.slice(0, 4).map((bg) => (
              <button
                key={bg}
                type='button'
                onClick={() => handleBgChange(bg)}
                className={`w-6 h-6 rounded-full border-2 transition-all ${
                  gameState.canvas.backgroundColor === bg
                    ? 'border-white'
                    : 'border-transparent'
                }`}
                style={{ backgroundColor: bg }}
              />
            ))}
          </div>

          {/* Trail count */}
          <div className='absolute bottom-4 left-4 bg-black/50 backdrop-blur-sm rounded-lg px-4 py-2'>
            <span className='text-white text-sm'>
              Trails: {trailCount}
            </span>
          </div>

          {/* Clear button */}
          <div className='absolute bottom-4 right-4'>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleClear}
              type='button'
              className='flex items-center gap-2 px-4 py-2 bg-red-500/80 text-white rounded-lg'
            >
              <Trash2 className='w-5 h-5' />
              Clear
            </motion.button>
          </div>

          {/* Instructions overlay */}
          {trailCount === 0 && (
            <div className='absolute inset-0 flex items-center justify-center pointer-events-none'>
              <div className='bg-black/70 backdrop-blur-sm rounded-xl px-6 py-4 text-center'>
                <p className='text-white text-lg'>
                  Touch or drag to draw with light!
                </p>
              </div>
            </div>
          )}
        </div>
      </GameContainer>
    </GameShell>
  );
}

export const LightPainter = memo(function LightPainterComponent() {
  return <LightPainterGameContent />;
});

export default LightPainter;
