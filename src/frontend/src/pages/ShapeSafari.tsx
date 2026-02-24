/**
 * Shape Safari Game
 * 
 * Children trace hidden shapes in illustrated scenes to discover
 * animals and objects.
 * 
 * Educational Focus:
 * - Shape recognition (circle, square, triangle, star, etc.)
 * - Fine motor control through tracing
 * - Visual scanning and discovery
 * - Vocabulary building
 * 
 * Controls:
 * - Move finger near shape outline to see glow
 * - Touch outline and trace to reveal
 * - Mouse fallback supported
 */

import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import Webcam from 'react-webcam';
import { GameContainer } from '../components/GameContainer';
import { CelebrationOverlay } from '../components/CelebrationOverlay';
import { useGameDrops } from '../hooks/useGameDrops';
import { useAudio } from '../utils/hooks/useAudio';
import { useTTS } from '../hooks/useTTS';
import { VoiceInstructions } from '../components/game/VoiceInstructions';
import '../styles/animations.css';
import { useGameHandTracking } from '../hooks/useGameHandTracking';
import type { TrackedHandFrame, Point } from '../types/tracking';
import {
  type SafariScene,
  type GameState,
  type HiddenShape,
  SAFARI_SCENES,
  getRandomScene,
  initializeGame,
  findShapeAtPoint,
  checkShapeComplete,
  getHint,
  getShapeDisplayName,
  getProgress,
  calculateFinalScore,
} from '../games/shapeSafariLogic';

export const ShapeSafari = memo(function ShapeSafari() {
  // ===== AUDIO =====
  const { playSuccess, playClick, playCelebration, playHover } = useAudio();
  const { speak, isEnabled: ttsEnabled } = useTTS();

  // ===== GAME STATE =====
  const { onGameComplete } = useGameDrops('shape-safari');
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [currentScene, setCurrentScene] = useState<SafariScene | null>(null);
  const [showMenu, setShowMenu] = useState(true);
  const [showCelebration, setShowCelebration] = useState(false);
  const [foundObject, setFoundObject] = useState<{ name: string; emoji: string } | null>(null);
  const [showHint, setShowHint] = useState<string | null>(null);

  // Canvas state
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasSize = useRef<{ width: number; height: number }>({ width: 800, height: 600 });
  const [isTracing, setIsTracing] = useState(false);
  const [currentPath, setCurrentPath] = useState<Point[]>([]);
  const [activeShape, setActiveShape] = useState<HiddenShape | null>(null);
  const [hoveredShape, setHoveredShape] = useState<HiddenShape | null>(null);

  // ===== REFS =====
  const webcamRef = useRef<Webcam>(null);
  const isPointerDownRef = useRef(false);
  const lastFoundTimeRef = useRef(0);

  // ===== HAND TRACKING =====
  const handleHandFrame = useCallback((frame: TrackedHandFrame) => {
    if (!frame.indexTip || !canvasRef.current || !gameState?.currentScene) return;

    const { x, y } = frame.indexTip;
    const canvas = canvasRef.current;

    // Check if near a shape outline
    const shape = findShapeAtPoint(
      { x, y },
      gameState.currentScene.shapes,
      canvas.width,
      canvas.height,
      40
    );

    // Play hover sound when changing shapes
    if (shape && shape.id !== hoveredShape?.id) {
      playHover();
    }
    setHoveredShape(shape);

    // Handle pinch for tracing
    const isPinching = frame.pinch?.state.isPinching || false;

    if (isPinching && !isPointerDownRef.current && shape && !shape.isFound) {
      // Start tracing
      isPointerDownRef.current = true;
      setIsTracing(true);
      setActiveShape(shape);
      setCurrentPath([{ x, y }]);
    } else if (!isPinching && isPointerDownRef.current) {
      // End tracing
      isPointerDownRef.current = false;
      handleTraceEnd();
    } else if (isPinching && isTracing && activeShape) {
      // Continue tracing
      setCurrentPath(prev => [...prev, { x, y }]);
    }
  }, [gameState, isTracing, activeShape]);

  useGameHandTracking({
    gameName: 'ShapeSafari',
    isRunning: !showMenu && !showCelebration,
    webcamRef,
    onFrame: handleHandFrame,
  });

  // ===== CANVAS RENDERING =====
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !gameState?.currentScene) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const scene = gameState.currentScene;
    const { width, height } = canvas;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, scene.gradientColors[0]);
    gradient.addColorStop(1, scene.gradientColors[1]);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Draw decorations
    ctx.font = `${Math.floor(width * 0.08)}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    scene.decorations.forEach(deco => {
      ctx.save();
      ctx.translate(deco.position.x * width, deco.position.y * height);
      ctx.rotate((deco.rotation * Math.PI) / 180);
      ctx.globalAlpha = 0.6;
      ctx.fillText(deco.emoji, 0, 0);
      ctx.restore();
    });

    // Draw shape outlines
    scene.shapes.forEach(shape => {
      if (shape.isFound) {
        // Draw found shape with glow
        ctx.save();
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 4;
        ctx.shadowColor = '#FFD700';
        ctx.shadowBlur = 20;

        if (shape.path) {
          ctx.stroke(shape.path);
        }

        // Draw found object emoji
        ctx.font = `${Math.floor(shape.size * width * 1.5)}px Arial`;
        ctx.fillText(
          shape.hiddenObject.emoji,
          shape.position.x * width,
          shape.position.y * height
        );
        ctx.restore();
      } else {
        // Draw hidden shape outline
        ctx.save();

        // Glow effect if hovered
        if (hoveredShape?.id === shape.id) {
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
          ctx.lineWidth = 4;
          ctx.shadowColor = 'rgba(255, 255, 255, 0.5)';
          ctx.shadowBlur = 15;
        } else {
          // Subtle hint
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
          ctx.lineWidth = 2;
        }

        if (shape.path) {
          ctx.stroke(shape.path);
        }
        ctx.restore();
      }
    });

    // Draw current tracing path
    if (isTracing && currentPath.length > 1) {
      ctx.save();
      ctx.strokeStyle = '#4CAF50';
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.shadowColor = '#4CAF50';
      ctx.shadowBlur = 10;

      ctx.beginPath();
      ctx.moveTo(currentPath[0].x * width, currentPath[0].y * height);
      for (let i = 1; i < currentPath.length; i++) {
        ctx.lineTo(currentPath[i].x * width, currentPath[i].y * height);
      }
      ctx.stroke();
      ctx.restore();
    }

    // Draw finger cursor
    if (hoveredShape && !hoveredShape.isFound) {
      ctx.save();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.beginPath();
      ctx.arc(
        hoveredShape.position.x * width,
        hoveredShape.position.y * height,
        hoveredShape.size * width * 1.2,
        0,
        Math.PI * 2
      );
      ctx.fill();
      ctx.restore();
    }
  }, [gameState, hoveredShape, isTracing, currentPath]);

  // Re-render canvas when state changes
  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  // ===== INTERACTION HANDLERS =====
  const handleTraceEnd = () => {
    if (!activeShape || !gameState || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const isComplete = checkShapeComplete(
      currentPath,
      activeShape,
      canvas.width,
      canvas.height
    );

    if (isComplete) {
      // Mark shape as found
      const updatedShapes = gameState.currentScene!.shapes.map(s =>
        s.id === activeShape.id ? { ...s, isFound: true } : s
      );

      const updatedScene = { ...gameState.currentScene!, shapes: updatedShapes };
      const newFoundShapes = new Set(gameState.foundShapes);
      newFoundShapes.add(activeShape.id);

      setGameState({
        ...gameState,
        currentScene: updatedScene,
        foundShapes: newFoundShapes,
      });

      // Show found object with sound
      playSuccess();
      setFoundObject({
        name: activeShape.hiddenObject.name,
        emoji: activeShape.hiddenObject.emoji,
      });
      lastFoundTimeRef.current = Date.now();
      setTimeout(() => setFoundObject(null), 2000);

      // Check if all shapes found
      const allFound = updatedShapes.every(s => s.isFound);
      if (allFound) {
        handleGameComplete();
      }
    }

    setIsTracing(false);
    setActiveShape(null);
    setCurrentPath([]);
  };

  // Mouse handlers for fallback
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !gameState?.currentScene) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    const shape = findShapeAtPoint(
      { x, y },
      gameState.currentScene.shapes,
      canvas.width,
      canvas.height,
      40
    );

    if (shape && !shape.isFound) {
      isPointerDownRef.current = true;
      setIsTracing(true);
      setActiveShape(shape);
      setCurrentPath([{ x, y }]);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !gameState?.currentScene) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    if (isTracing) {
      setCurrentPath(prev => [...prev, { x, y }]);
    } else {
      // Just hovering
      const shape = findShapeAtPoint(
        { x, y },
        gameState.currentScene.shapes,
        canvas.width,
        canvas.height,
        40
      );
      setHoveredShape(shape);
    }
  };

  const handleMouseUp = () => {
    if (isTracing) {
      handleTraceEnd();
    }
    isPointerDownRef.current = false;
  };

  // ===== GAME FLOW =====
  const startGame = (sceneId: string) => {
    playClick();
    const scene = SAFARI_SCENES.find(s => s.id === sceneId);
    if (!scene) return;

    setCurrentScene(scene);
    setShowMenu(false);
    setShowHint(null);

    // Canvas initialization happens in useEffect after menu is hidden
  };

  // Initialize canvas after menu is hidden (ensures canvas is rendered and has dimensions)
  useEffect(() => {
    if (!showMenu && currentScene && canvasRef.current) {
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();

      // Only initialize if canvas has valid dimensions
      if (rect.width > 0 && rect.height > 0) {
        canvas.width = rect.width;
        canvas.height = rect.height;
        canvasSize.current = { width: rect.width, height: rect.height };

        setGameState(initializeGame(currentScene, rect.width, rect.height));
      }
    }
  }, [showMenu, currentScene]);

  const handleGameComplete = () => {
    playCelebration();
    setShowCelebration(true);
    if (gameState) {
      calculateFinalScore(gameState);
      setGameState({ ...gameState, completed: true });
    }
  };

  const handleNextScene = () => {
    playClick();
    const nextScene = getRandomScene();
    startGame(nextScene.id);
  };

  const handleShowMenu = () => {
    playClick();
    onGameComplete();
    setShowMenu(true);
    setGameState(null);
    setCurrentScene(null);
  };

  const handleShowHint = () => {
    if (!gameState) return;
    const hint = getHint(gameState);
    if (hint) {
      setShowHint(`💡 ${hint.hint}`);
      setTimeout(() => setShowHint(null), 3000);
    }
  };

  // ===== RENDER HELPERS =====
  const progress = gameState ? getProgress(gameState) : { found: 0, total: 0 };

  // ===== RENDER =====
  return (
    <GameContainer title="Shape Safari" onHome={handleShowMenu}>
      {/* Hidden webcam for hand tracking */}
      <div className="absolute top-0 right-0 w-32 h-24 opacity-0 pointer-events-none overflow-hidden">
        <Webcam
          ref={webcamRef}
          audio={false}
          videoConstraints={{ width: 320, height: 240, facingMode: 'user' }}
          className="w-full h-full object-cover"
        />
      </div>

      {showMenu ? (
        // ===== SCENE SELECTION MENU =====
        <div className="flex flex-col items-center justify-center h-full p-6">
          {/* Animated Safari Icon */}
          <div className="relative mb-4">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center animate-float shadow-lg">
              <svg viewBox="0 0 100 100" className="w-16 h-16 text-white">
                <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="4" strokeDasharray="10,5" className="animate-spin-slow" />
                <path d="M50 20 L50 80 M20 50 L80 50" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
              </svg>
            </div>
            <div className="absolute -bottom-2 -right-2 text-3xl animate-bounce">🔍</div>
          </div>
          <h2 className="text-2xl font-bold text-advay-slate mb-2">Shape Safari!</h2>
          <p className="text-advay-slate mb-6 text-center max-w-md">
            Find hidden shapes by tracing around them with your finger.
            Discover animals and objects hiding in each scene!
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-4xl w-full">
            {SAFARI_SCENES.map(scene => (
              <button
                key={scene.id}
                onClick={() => startGame(scene.id)}
                className="relative overflow-hidden rounded-xl p-4 transition-all transform hover:scale-105 text-left group"
                style={{
                  background: `linear-gradient(135deg, ${scene.gradientColors[0]}, ${scene.gradientColors[1]})`,
                }}
              >
                <div className="text-4xl mb-2">{scene.decorations[0]?.emoji}</div>
                <h3 className="font-bold text-white text-sm mb-1 drop-shadow-md">
                  {scene.name}
                </h3>
                <p className="text-white/80 text-xs">
                  Find {scene.targetCount} {getShapeDisplayName(scene.targetShape === 'mixed' ? 'circle' : scene.targetShape)}s
                </p>
                <div className="mt-2 flex gap-1">
                  {Array.from({ length: scene.difficulty }).map((_, i) => (
                    <span key={i} className="text-yellow-300 text-xs">⭐</span>
                  ))}
                </div>
              </button>
            ))}
          </div>

          <div
            data-ux-goal={`Find ${currentScene?.targetCount} hidden shapes to discover animals and objects!`}
            data-ux-instruction="Move your finger near shapes to see them glow, then trace around them"
            className="mt-6 flex items-center gap-2 text-text-secondary text-sm bg-green-50 px-4 py-2 rounded-xl"
          >
            <span className="text-2xl">✋</span>
            <span>Move your finger near shapes to see them glow, then trace around them!</span>
          </div>
        </div>
      ) : (
        // ===== GAME AREA =====
        <div className="flex flex-col h-full">
          {/* Goal Banner with Semantic Attributes */}
          <div
            data-ux-goal={`Find ${progress.total} hidden shapes to discover animals and objects!`}
            data-ux-instruction="Move your finger near shapes to see them glow, then trace around them"
            data-ux-action="trace"
            data-ux-progress={`${progress.found}/${progress.total} shapes found`}
            className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 text-center shadow-[0_4px_0_#E5B86E]"
          >
            <div className="flex items-center justify-center gap-2">
              <span className="text-xl">🎯</span>
              <p className="font-black">GOAL: Find {progress.total} hidden {currentScene?.targetShape}s to discover animals!</p>
            </div>
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-2 bg-white/50 border-b border-[#F2CC8F]">
            <div>
              <h2 className="text-lg font-bold text-advay-slate">{currentScene?.name}</h2>
              <p className="text-advay-slate text-xs">{currentScene?.description}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-advay-slate text-sm">
                Found: <span className="text-green-500 font-bold">{progress.found}/{progress.total}</span>
              </div>
              <button
                onClick={handleShowHint}
                className="px-3 py-1 bg-yellow-100 hover:bg-yellow-200 text-yellow-700 rounded-lg text-sm transition-colors"
              >
                💡 Hint
              </button>
            </div>
          </div>

          {/* Hint Banner */}
          {showHint && (
            <div className="bg-yellow-100 border border-yellow-300 px-4 py-2 text-yellow-800 text-center animate-pulse">
              {showHint}
            </div>
          )}

          {/* Canvas */}
          <div className="flex-1 relative">
            <canvas
              ref={canvasRef}
              className="w-full h-full cursor-crosshair touch-none"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            />

            {/* Found Object Popup */}
            {foundObject && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="bg-white rounded-2xl p-6 shadow-2xl animate-bounce">
                  <div className="w-20 h-20 mx-auto mb-3 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center animate-pulse">
                    <svg viewBox="0 0 100 100" className="w-12 h-12 text-white">
                      <path d="M50 20 L60 40 L80 40 L65 55 L70 75 L50 60 L30 75 L35 55 L20 40 L40 40 Z" fill="currentColor" />
                    </svg>
                  </div>
                  <p className="text-advay-slate font-bold text-center">You found {foundObject.name}!</p>
                </div>
              </div>
            )}

            {/* Completion Message */}
            {gameState?.completed && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <div className="bg-white rounded-2xl p-8 text-center max-w-md">
                  <div className="text-6xl mb-4">🎉</div>
                  <h3 className="text-2xl font-bold text-advay-slate mb-2">Scene Complete!</h3>
                  <p className="text-advay-slate mb-2">
                    You found all the shapes in {currentScene?.name}!
                  </p>
                  <p className="text-green-600 font-bold text-lg mb-4">
                    Score: {calculateFinalScore(gameState)}
                  </p>
                  <div className="flex gap-3 justify-center">
                    <button
                      onClick={handleShowMenu}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-advay-slate rounded-lg transition-colors"
                    >
                      Back to Menu
                    </button>
                    <button
                      onClick={handleNextScene}
                      className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                    >
                      Next Scene →
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Celebration Overlay */}
      <CelebrationOverlay
        show={showCelebration}
        letter="✓"
        accuracy={100}
        onComplete={() => setShowCelebration(false)}
        message="All Shapes Found!"
      />
    </GameContainer>
  );
});

export default ShapeSafari;
