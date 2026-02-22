/**
 * Physics Demo - Color Sort Prototype
 * 
 * Demonstrates Matter.js integration for physics-based games.
 * Drop colored balls into matching buckets.
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import Matter from 'matter-js';
import { GameContainer } from '../components/GameContainer';
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

export default function PhysicsDemo() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const physicsRef = useRef<PhysicsBodies | null>(null);
  const runnerRef = useRef<Matter.Runner | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  
  const [gameState, setGameState] = useState<GameState>(initializeGame());
  const [nextColor, setNextColor] = useState<string>(getRandomColor());
  const [feedback, setFeedback] = useState<string | null>(null);
  
  // Initialize physics
  useEffect(() => {
    if (!canvasRef.current) return;
    
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
        setGameState(prev => {
          const { state, events } = updateGameState(prev, physicsRef.current!);
          
          // Handle events
          events.forEach(event => {
            switch (event.type) {
              case 'correct':
                setFeedback('✓ Correct!');
                setTimeout(() => setFeedback(null), 1000);
                break;
              case 'wrong':
                setFeedback('✗ Wrong bucket!');
                setTimeout(() => setFeedback(null), 1000);
                break;
              case 'levelup':
                setFeedback(`🎉 Level ${event.level}!`);
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
        ctx.fillStyle = color.hex + '40';  // Semi-transparent
        ctx.fillRect(x - bucketWidth / 3, y - 40, bucketWidth / 1.5, 120);
        
        // Bucket label
        ctx.fillStyle = color.hex;
        ctx.font = 'bold 16px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(color.name, x, y + 60);
      });
      
      // Draw bodies
      const bodies = Matter.Composite.allBodies(physicsRef.current.world);
      
      bodies.forEach(body => {
        if (body.label === 'spawner') return;  // Skip spawner
        
        ctx.beginPath();
        
        if (body.label.includes('ball')) {
          // Draw ball
          ctx.arc(body.position.x, body.position.y, 20, 0, Math.PI * 2);
          ctx.fillStyle = body.render.fillStyle || '#999';
          ctx.fill();
          
          // Ball highlight
          ctx.beginPath();
          ctx.arc(body.position.x - 5, body.position.y - 5, 6, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(255,255,255,0.5)';
          ctx.fill();
        } else if (body.label.includes('bucket')) {
          // Draw bucket parts
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
  }, []);
  
  // Handle canvas click to drop ball
  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
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
    
    setGameState(prev => ({
      ...prev,
      ballsDropped: prev.ballsDropped + 1,
    }));
  }, [nextColor]);
  
  // Reset game
  const handleReset = () => {
    if (physicsRef.current) {
      // Remove all balls
      physicsRef.current.balls.forEach(ball => {
        Matter.Composite.remove(physicsRef.current!.world, ball);
      });
      physicsRef.current.balls = [];
    }
    
    setGameState(initializeGame());
    setNextColor(getRandomColor());
  };
  
  return (
    <GameContainer title="Physics Demo" onHome={() => {}}>
      <div className="flex flex-col h-full bg-slate-50">
        {/* Stats Bar */}
        <div className="flex justify-between items-center p-4 bg-white shadow-sm">
          <div className="flex gap-6">
            <div>
              <span className="text-slate-500 text-sm">Score:</span>
              <span className="font-bold text-blue-600 ml-2 text-xl">{gameState.score}</span>
            </div>
            <div>
              <span className="text-slate-500 text-sm">Level:</span>
              <span className="font-bold text-purple-600 ml-2">{gameState.level}</span>
            </div>
            <div>
              <span className="text-slate-500 text-sm">Sorted:</span>
              <span className="font-bold text-green-600 ml-2">{gameState.ballsSorted}</span>
            </div>
          </div>
          
          {/* Next Ball Preview */}
          <div className="flex items-center gap-3">
            <span className="text-slate-500 text-sm">Next:</span>
            <div
              className="w-8 h-8 rounded-full border-2 border-white shadow-md"
              style={{ backgroundColor: nextColor }}
            />
          </div>
        </div>
        
        {/* Feedback Overlay */}
        {feedback && (
          <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-white/90 px-6 py-3 rounded-xl shadow-lg z-10">
            <span className="text-xl font-bold">{feedback}</span>
          </div>
        )}
        
        {/* Game Canvas */}
        <div className="flex-1 relative">
          <canvas
            ref={canvasRef}
            width={800}
            height={500}
            onClick={handleCanvasClick}
            className="w-full h-full cursor-crosshair"
            style={{ imageRendering: 'crisp-edges' }}
          />
          
          {/* Instructions */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center text-slate-500 text-sm bg-white/80 px-4 py-2 rounded-lg">
            Click anywhere to drop a ball! Match colors to the buckets.
          </div>
        </div>
        
        {/* Controls */}
        <div className="p-4 bg-white border-t flex justify-between items-center">
          <div className="flex gap-2">
            {COLORS.map(color => (
              <div key={color.name} className="flex items-center gap-1">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: color.hex }}
                />
                <span className="text-xs text-slate-500">{color.name}</span>
              </div>
            ))}
          </div>
          
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-medium"
          >
            Reset
          </button>
        </div>
      </div>
    </GameContainer>
  );
}

// Helper
function startGame(state: GameState): GameState {
  return { ...state, isPlaying: true };
}
