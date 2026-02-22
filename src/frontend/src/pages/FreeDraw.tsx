/**
 * Free Draw / Finger Painting Game
 * 
 * Open-ended creative canvas for pure artistic expression.
 * No objectives, no scores - just joyful creation!
 * 
 * Educational Focus:
 * - Creative expression and confidence
 * - Color theory (mixing)
 * - Cause-and-effect learning
 * - Fine motor control
 * 
 * Controls:
 * - Move finger to paint
 * - Pinch to change color/brush
 * - Shake to clear
 * - Two hands = two brushes
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Webcam from 'react-webcam';
import { GameContainer } from '../components/GameContainer';

import { useGameHandTracking } from '../hooks/useGameHandTracking';
import type { TrackedHandFrame, Point } from '../types/tracking';
import {
  type GameState,
  type BrushType,
  initializeGame,
  startStroke,
  continueStroke,
  endStroke,
  undo,
  redo,
  clearCanvas,
  setBrushType,
  setBrushColor,
  setBrushSize,
  setBackgroundColor,
  mixColors,
  getColorName,
  detectShake,
  exportCanvas,
  isCanvasEmpty,
  COLOR_PALETTE,
  BACKGROUND_COLORS,
  BRUSH_PRESETS,
} from '../games/freeDrawLogic';

export default function FreeDraw() {
  // ===== GAME STATE =====
  const [gameState, setGameState] = useState<GameState>(initializeGame());
  const [showColorMixer, setShowColorMixer] = useState(false);
  const [mixColor1, setMixColor1] = useState<string | null>(null);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [, setVelocityHistory] = useState<{ x: number; y: number }[]>([]);
  
  // Canvas refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  
  // ===== REFS =====
  const webcamRef = useRef<Webcam>(null);
  const lastPointRef = useRef<Point | null>(null);
  const lastTimeRef = useRef<number>(0);
  
  // ===== HAND TRACKING =====
  const handleHandFrame = useCallback((frame: TrackedHandFrame) => {
    if (!frame.indexTip) return;
    
    const { x, y } = frame.indexTip;
    const now = Date.now();
    
    // Calculate velocity for shake detection
    if (lastPointRef.current) {
      const dt = (now - lastTimeRef.current) / 1000;
      if (dt > 0) {
        const vx = (x - lastPointRef.current.x) / dt;
        const vy = (y - lastPointRef.current.y) / dt;
        
        setVelocityHistory(prev => {
          const newHistory = [...prev, { x: vx, y: vy }].slice(-10);
          
          // Check for shake
          if (detectShake(newHistory)) {
            handleClear();
            return [];
          }
          
          return newHistory;
        });
      }
    }
    
    lastPointRef.current = { x, y };
    lastTimeRef.current = now;
    
    // Handle drawing
    const isPinching = frame.pinch?.state.isPinching || false;
    
    if (isPinching && !gameState.isDrawing) {
      // Start drawing
      setGameState(prev => startStroke(prev, { x, y }));
    } else if (!isPinching && gameState.isDrawing) {
      // Stop drawing
      setGameState(prev => endStroke(prev));
      setVelocityHistory([]);
    } else if (isPinching && gameState.isDrawing) {
      // Continue drawing
      setGameState(prev => continueStroke(prev, { x, y }));
    }
  }, [gameState.isDrawing]);
  
  useGameHandTracking({
    gameName: 'FreeDraw',
    isRunning: true,
    webcamRef,
    onFrame: handleHandFrame,
  });
  
  // ===== CANVAS RENDERING =====
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const { width, height } = canvas;
    
    // Clear canvas with background color
    ctx.fillStyle = gameState.canvas.backgroundColor;
    ctx.fillRect(0, 0, width, height);
    
    // Draw all completed strokes
    gameState.canvas.strokes.forEach(stroke => {
      drawStroke(ctx, stroke, width, height);
    });
    
    // Draw current stroke
    if (gameState.canvas.currentStroke) {
      drawStroke(ctx, gameState.canvas.currentStroke, width, height);
    }
  }, [gameState.canvas]);
  
  // Helper to draw a stroke
  const drawStroke = (
    ctx: CanvasRenderingContext2D,
    stroke: { points: Point[]; brush: { type: BrushType; size: number; color: string; opacity: number; isRainbow: boolean } },
    width: number,
    height: number
  ) => {
    if (stroke.points.length < 2) return;
    
    const { brush, points } = stroke;
    
    ctx.save();
    ctx.globalAlpha = brush.opacity;
    
    switch (brush.type) {
      case 'eraser':
        ctx.globalCompositeOperation = 'destination-out';
        ctx.strokeStyle = 'rgba(0,0,0,1)';
        ctx.lineWidth = brush.size;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        break;
        
      case 'spray':
        // Spray paint effect
        points.forEach((point, i) => {
          if (i % 3 !== 0) return; // Sample every 3rd point
          const x = point.x * width;
          const y = point.y * height;
          
          for (let j = 0; j < 10; j++) {
            const angle = Math.random() * Math.PI * 2;
            const dist = Math.random() * brush.size;
            const px = x + Math.cos(angle) * dist;
            const py = y + Math.sin(angle) * dist;
            
            ctx.fillStyle = brush.isRainbow 
              ? `hsl(${(gameState.brushColorHue + i * 2) % 360}, 100%, 50%)`
              : brush.color;
            ctx.fillRect(px, py, 2, 2);
          }
        });
        ctx.restore();
        return;
        
      case 'glitter':
        // Glitter effect
        points.forEach((point, i) => {
          if (i % 2 !== 0) return;
          const x = point.x * width;
          const y = point.y * height;
          
          ctx.fillStyle = brush.isRainbow
            ? `hsl(${(gameState.brushColorHue + i * 3) % 360}, 100%, 70%)`
            : '#FFD700';
          ctx.beginPath();
          ctx.arc(x, y, Math.random() * 3 + 1, 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.restore();
        return;
        
      case 'neon':
        // Glow effect
        ctx.shadowBlur = 20;
        ctx.shadowColor = brush.isRainbow
          ? `hsl(${gameState.brushColorHue}, 100%, 50%)`
          : brush.color;
        ctx.strokeStyle = brush.isRainbow
          ? `hsl(${gameState.brushColorHue}, 100%, 70%)`
          : brush.color;
        ctx.lineWidth = brush.size;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        break;
        
      case 'rainbow':
        ctx.strokeStyle = `hsl(${gameState.brushColorHue}, 100%, 50%)`;
        ctx.lineWidth = brush.size;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        break;
        
      case 'flat':
        ctx.strokeStyle = brush.color;
        ctx.lineWidth = brush.size * 0.6;
        ctx.lineCap = 'butt';
        ctx.lineJoin = 'miter';
        break;
        
      case 'marker':
        ctx.strokeStyle = brush.color;
        ctx.lineWidth = brush.size * 0.8;
        ctx.lineCap = 'square';
        ctx.lineJoin = 'round';
        ctx.globalAlpha = brush.opacity * 0.8;
        break;
        
      default: // round
        ctx.strokeStyle = brush.color;
        ctx.lineWidth = brush.size;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
    }
    
    // Draw the stroke path
    ctx.beginPath();
    ctx.moveTo(points[0].x * width, points[0].y * height);
    
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x * width, points[i].y * height);
    }
    
    ctx.stroke();
    ctx.restore();
  };
  
  // Re-render when state changes
  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);
  
  // ===== MOUSE HANDLERS =====
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    
    setGameState(prev => startStroke(prev, { x, y }));
  };
  
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!gameState.isDrawing) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    
    setGameState(prev => continueStroke(prev, { x, y }));
  };
  
  const handleMouseUp = () => {
    setGameState(prev => endStroke(prev));
  };
  
  // ===== ACTION HANDLERS =====
  const handleUndo = () => setGameState(prev => undo(prev));
  const handleRedo = () => setGameState(prev => redo(prev));
  const handleClear = () => setGameState(prev => clearCanvas(prev));
  
  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas || isCanvasEmpty(gameState)) return;
    
    const dataUrl = exportCanvas(canvas);
    
    // Create download link
    const link = document.createElement('a');
    link.download = `artwork-${Date.now()}.png`;
    link.href = dataUrl;
    link.click();
    
    setShowSaveSuccess(true);
    setTimeout(() => setShowSaveSuccess(false), 2000);
  };
  
  const handleBrushTypeChange = (type: BrushType) => {
    setGameState(prev => setBrushType(prev, type));
  };
  
  const handleColorSelect = (color: string) => {
    if (showColorMixer) {
      if (!mixColor1) {
        setMixColor1(color);
      } else {
        // Mix colors
        const mixedColor = mixColors(mixColor1, color);
        setGameState(prev => setBrushColor(prev, mixedColor));
        setMixColor1(null);
        setShowColorMixer(false);
      }
    } else {
      setGameState(prev => setBrushColor(prev, color));
    }
  };
  
  const handleSizeChange = (delta: number) => {
    setGameState(prev => setBrushSize(prev, prev.currentBrush.size + delta));
  };
  
  const handleBackgroundChange = (color: string) => {
    setGameState(prev => setBackgroundColor(prev, color));
  };
  
  // ===== RENDER =====
  return (
    <GameContainer title="Free Draw" onHome={() => {}} showScore={false}>
      {/* Hidden webcam */}
      <div className="absolute top-0 right-0 w-32 h-24 opacity-0 pointer-events-none overflow-hidden">
        <Webcam
          ref={webcamRef}
          audio={false}
          videoConstraints={{ width: 320, height: 240, facingMode: 'user' }}
          className="w-full h-full object-cover"
        />
      </div>
      
      <div className="flex flex-col h-full">
        {/* Toolbar */}
        <div className="bg-white border-b border-slate-200 px-4 py-2">
          <div className="flex items-center justify-between flex-wrap gap-2">
            {/* Brush Type Selector */}
            <div className="flex gap-1">
              {(Object.keys(BRUSH_PRESETS) as BrushType[]).map(type => (
                <button
                  key={type}
                  onClick={() => handleBrushTypeChange(type)}
                  className={`
                    p-2 rounded-lg text-xl transition-all
                    ${gameState.currentBrush.type === type
                      ? 'bg-blue-100 border-2 border-blue-400'
                      : 'bg-slate-100 border-2 border-transparent hover:bg-slate-200'
                    }
                  `}
                  title={BRUSH_PRESETS[type].name}
                >
                  {BRUSH_PRESETS[type].emoji}
                </button>
              ))}
            </div>
            
            {/* Size Control */}
            <div className="flex items-center gap-2 bg-slate-100 rounded-lg px-3 py-1">
              <button
                onClick={() => handleSizeChange(-5)}
                className="w-6 h-6 flex items-center justify-center bg-white rounded hover:bg-slate-200"
              >
                −
              </button>
              <div className="flex items-center gap-2">
                <div
                  className="rounded-full bg-slate-800"
                  style={{
                    width: Math.max(4, gameState.currentBrush.size / 3),
                    height: Math.max(4, gameState.currentBrush.size / 3),
                  }}
                />
                <span className="text-xs text-slate-600 w-8 text-center">
                  {gameState.currentBrush.size}px
                </span>
              </div>
              <button
                onClick={() => handleSizeChange(5)}
                className="w-6 h-6 flex items-center justify-center bg-white rounded hover:bg-slate-200"
              >
                +
              </button>
            </div>
            
            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={handleUndo}
                disabled={gameState.undoStack.length === 0}
                className="px-3 py-1 bg-slate-100 hover:bg-slate-200 disabled:opacity-30 rounded-lg text-sm font-bold transition-colors"
              >
                ↶ Undo
              </button>
              <button
                onClick={handleRedo}
                disabled={gameState.redoStack.length === 0}
                className="px-3 py-1 bg-slate-100 hover:bg-slate-200 disabled:opacity-30 rounded-lg text-sm font-bold transition-colors"
              >
                ↷ Redo
              </button>
              <button
                onClick={handleClear}
                disabled={isCanvasEmpty(gameState)}
                className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 disabled:opacity-30 rounded-lg text-sm font-bold transition-colors"
              >
                🗑️ Clear
              </button>
              <button
                onClick={handleSave}
                disabled={isCanvasEmpty(gameState)}
                className="px-3 py-1 bg-green-100 hover:bg-green-200 text-green-700 disabled:opacity-30 rounded-lg text-sm font-bold transition-colors"
              >
                💾 Save
              </button>
            </div>
          </div>
          
          {/* Color Palette */}
          <div className="mt-2 flex items-center gap-2 flex-wrap">
            <span className="text-xs text-slate-500 font-bold">Colors:</span>
            {COLOR_PALETTE.map(color => (
              <button
                key={color}
                onClick={() => handleColorSelect(color)}
                className={`
                  w-8 h-8 rounded-full border-2 transition-all
                  ${gameState.currentBrush.color === color && !gameState.currentBrush.isRainbow
                    ? 'border-slate-800 scale-110'
                    : mixColor1 === color
                    ? 'border-yellow-400 scale-110'
                    : 'border-transparent hover:scale-110'
                  }
                `}
                style={{ backgroundColor: color }}
                title={getColorName(color)}
              />
            ))}
            
            {/* Rainbow brush button */}
            <button
              onClick={() => handleBrushTypeChange('rainbow')}
              className={`
                w-8 h-8 rounded-full border-2 flex items-center justify-center text-lg
                ${gameState.currentBrush.isRainbow
                  ? 'border-slate-800'
                  : 'border-transparent hover:scale-110'
                }
              `}
              style={{
                background: 'linear-gradient(45deg, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff)',
              }}
              title="Rainbow"
            >
              🌈
            </button>
            
            {/* Color Mixer Toggle */}
            <button
              onClick={() => {
                setShowColorMixer(!showColorMixer);
                setMixColor1(null);
              }}
              className={`
                ml-2 px-3 py-1 rounded-lg text-sm font-bold transition-colors
                ${showColorMixer
                  ? 'bg-purple-100 text-purple-700 border-2 border-purple-400'
                  : 'bg-slate-100 hover:bg-slate-200'
                }
              `}
            >
              🎨 Mix Colors
            </button>
            
            {showColorMixer && (
              <span className="text-xs text-purple-600">
                {mixColor1 ? 'Pick second color to mix' : 'Pick first color'}
              </span>
            )}
          </div>
          
          {/* Background Color */}
          <div className="mt-2 flex items-center gap-2">
            <span className="text-xs text-slate-500 font-bold">Background:</span>
            {BACKGROUND_COLORS.map(color => (
              <button
                key={color}
                onClick={() => handleBackgroundChange(color)}
                className={`
                  w-6 h-6 rounded border-2 transition-all
                  ${gameState.canvas.backgroundColor === color
                    ? 'border-slate-800'
                    : 'border-slate-300 hover:scale-110'
                  }
                `}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>
        
        {/* Canvas Area */}
        <div ref={canvasContainerRef} className="flex-1 relative bg-slate-100">
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full cursor-crosshair touch-none"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          />
          
          {/* Hint overlay */}
          {isCanvasEmpty(gameState) && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center text-slate-400">
                <div className="text-6xl mb-4">✋</div>
                <p className="text-lg font-bold">Pinch and move to draw!</p>
                <p className="text-sm">Shake hand to clear</p>
              </div>
            </div>
          )}
          
          {/* Save success notification */}
          {showSaveSuccess && (
            <div className="absolute top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg animate-bounce">
              ✅ Saved to downloads!
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="bg-white border-t border-slate-200 px-4 py-2 flex justify-between items-center text-xs text-slate-500">
          <div>
            Brush: {BRUSH_PRESETS[gameState.currentBrush.type].name} | 
            Color: {getColorName(gameState.currentBrush.color)} |
            Size: {gameState.currentBrush.size}px
          </div>
          <div>
            Strokes: {gameState.canvas.strokes.length}
          </div>
        </div>
      </div>
    </GameContainer>
  );
}
