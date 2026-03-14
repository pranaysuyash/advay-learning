/**
 * Kaleidoscope Hands Game - CV-Enhanced Version
 *
 * Draw beautiful kaleidoscope patterns with hand tracking!
 * Now with full hand tracking support - use your hand to draw in the air!
 *
 * @ticket TCK-20260314-005
 */

import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GameContainer } from '../components/GameContainer';
import { GameShell } from '../components/GameShell';
import { useAudio } from '../utils/hooks/useAudio';
import { useGameCompletion } from '../hooks/useGameCompletion';
import { triggerHaptic } from '../utils/haptics';
import { useGameSessionProgress } from '../hooks/useGameSessionProgress';
import { useGameHandTracking } from '../hooks/useGameHandTracking';
import { KenneyHandCursor } from '../components/game/KenneyHandCursor';
import type { Point, TrackedHandFrame } from '../types/tracking';
import Webcam from 'react-webcam';
import {
  LEVELS,
  getLevelConfig,
  getColorForPoint,
} from '../games/kaleidoscopeHandsLogic';
import { STREAK_MILESTONE_INTERVAL } from '../games/constants';

const CANVAS_SIZE = 400;

interface CanvasPoint {
  x: number;
  y: number;
}

// Inner game component
const KaleidoscopeHandsGame = memo(function KaleidoscopeHandsGameComponent() {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const canvasContainerRef = useRef<HTMLDivElement | null>(null);
  const webcamRef = useRef<Webcam>(null);
  
  const [currentLevel, setCurrentLevel] = useState(1);
  const [points, setPoints] = useState<CanvasPoint[]>([]);
  const [score, setScore] = useState(0);
  const strokeMilestoneRef = useRef(0);
  const colorProgressRef = useRef(0);
  
  // CV Hand tracking state
  const [, setCursor] = useState<Point | null>(null);
  const [cursorPx, setCursorPx] = useState<Point | null>(null);
  const [isPinching, setIsPinching] = useState(false);
  const [handDetected, setHandDetected] = useState(false);
  const lastPointRef = useRef<CanvasPoint | null>(null);
  const pinchCooldownRef = useRef(false);

  const { playClick, playPop } = useAudio();
  const { completeGame } = useGameCompletion('kaleidoscope-hands');
  const levelConfig = getLevelConfig(currentLevel);

  useGameSessionProgress({
    gameName: 'Kaleidoscope Hands',
    score,
    level: currentLevel,
    isPlaying: true,
    metaData: { pointsDrawn: points.length },
  });

  // Add a point to the drawing
  const addPoint = useCallback((x: number, y: number) => {
    // Normalize coordinates to 0-1
    const normalizedX = Math.max(0, Math.min(1, x));
    const normalizedY = Math.max(0, Math.min(1, y));
    
    // Avoid duplicate points
    if (lastPointRef.current && 
        Math.abs(lastPointRef.current.x - normalizedX) < 0.01 &&
        Math.abs(lastPointRef.current.y - normalizedY) < 0.01) {
      return;
    }
    
    const newPoint = { x: normalizedX, y: normalizedY };
    lastPointRef.current = newPoint;
    
    setPoints((prev) => {
      const newPoints = [...prev, newPoint];
      // Haptic feedback every 20 points
      if (newPoints.length % 20 === 0) {
        triggerHaptic('success');
        const newMilestone = Math.floor(newPoints.length / 20);
        if (newMilestone > strokeMilestoneRef.current) {
          strokeMilestoneRef.current = newMilestone;
          if (newMilestone % STREAK_MILESTONE_INTERVAL === 0) {
            triggerHaptic('celebration');
          }
        }
      }
      return newPoints;
    });
    playPop();
  }, [playPop]);

  // Handle hand tracking frame
  const handleFrame = useCallback(
    (frame: TrackedHandFrame) => {
      if (!canvasContainerRef.current) return;

      const rect = canvasContainerRef.current.getBoundingClientRect();

      if (frame.indexTip) {
        const tip = frame.indexTip;
        setHandDetected(true);
        setCursor(tip);
        setCursorPx({
          x: rect.left + tip.x * rect.width,
          y: rect.top + tip.y * rect.height,
        });

        // Draw when pinching OR when hand is moving (continuous drawing mode)
        // For kaleidoscope, we use pinch to toggle drawing mode
        if (frame.pinch.state.isPinching && !pinchCooldownRef.current) {
          setIsPinching(true);
          addPoint(tip.x, tip.y);
        } else if (!frame.pinch.state.isPinching) {
          setIsPinching(false);
          lastPointRef.current = null;
        }
      } else {
        setHandDetected(false);
        setCursor(null);
        setCursorPx(null);
        lastPointRef.current = null;
      }
    },
    [addPoint],
  );

  // Setup hand tracking
  useGameHandTracking({
    gameName: 'Kaleidoscope Hands',
    webcamRef,
    isRunning: true,
    onFrame: handleFrame,
    pinch: {
      startThreshold: 0.08,
      releaseThreshold: 0.1,
    },
    smoothing: {
      minCutoff: 1.0,
      beta: 0.2,
    },
  });

  // Draw on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx || typeof ctx.translate !== 'function') return;

    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    const centerX = CANVAS_SIZE / 2;
    const centerY = CANVAS_SIZE / 2;
    const segmentAngle = (Math.PI * 2) / levelConfig.segmentCount;

    // Draw kaleidoscope pattern
    for (let i = 0; i < levelConfig.segmentCount; i++) {
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(i * segmentAngle);

      if (points.length > 1) {
        ctx.beginPath();
        ctx.lineWidth = 6;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        for (let j = 0; j < points.length - 1; j++) {
          const p1 = points[j];
          const p2 = points[j + 1];

          ctx.strokeStyle = getColorForPoint(
            levelConfig.colorMode,
            (j / points.length + colorProgressRef.current) % 1,
          );
          ctx.beginPath();
          ctx.moveTo(
            p1.x * CANVAS_SIZE - centerX,
            p1.y * CANVAS_SIZE - centerY,
          );
          ctx.lineTo(
            p2.x * CANVAS_SIZE - centerX,
            p2.y * CANVAS_SIZE - centerY,
          );
          ctx.stroke();
        }

        // Mirror
        ctx.scale(-1, 1);
        for (let j = 0; j < points.length - 1; j++) {
          const p1 = points[j];
          const p2 = points[j + 1];

          ctx.strokeStyle = getColorForPoint(
            levelConfig.colorMode,
            (j / points.length + colorProgressRef.current) % 1,
          );
          ctx.beginPath();
          ctx.moveTo(
            p1.x * CANVAS_SIZE - centerX,
            p1.y * CANVAS_SIZE - centerY,
          );
          ctx.lineTo(
            p2.x * CANVAS_SIZE - centerX,
            p2.y * CANVAS_SIZE - centerY,
          );
          ctx.stroke();
        }
      }

      ctx.restore();
    }
  }, [points, levelConfig]);

  // Animate colors
  useEffect(() => {
    const interval = setInterval(() => {
      colorProgressRef.current = (colorProgressRef.current + 0.005) % 1;
      setScore(points.length * 10);
    }, 50);
    return () => clearInterval(interval);
  }, [points.length]);

  // Mouse fallback
  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (handDetected) return; // Don't use mouse when hand is detected
    
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    
    setCursorPx({ x: event.clientX, y: event.clientY });
    addPoint(x, y);
  };

  const handleLevelChange = (level: number) => {
    playClick();
    setCurrentLevel(level);
    setPoints([]);
    setScore(0);
    colorProgressRef.current = 0;
    lastPointRef.current = null;
  };

  const handleClear = () => {
    playClick();
    setPoints([]);
    setScore(0);
    lastPointRef.current = null;
  };

  const handleFinish = useCallback(async () => {
    playClick();
    const finalScore = Math.round(score / 10);
    await completeGame({ score: finalScore, level: currentLevel });
    navigate('/games');
  }, [score, completeGame, navigate, playClick, currentLevel]);

  return (
    <GameContainer
      title='Kaleidoscope Hands'
      onHome={() => navigate('/games')}
      reportSession={false}
    >
      {/* Hidden webcam for hand tracking */}
      <Webcam
        ref={webcamRef}
        className="hidden"
        videoConstraints={{ width: 640, height: 480, facingMode: 'user' }}
        audio={false}
      />

      {/* Hand cursor overlay */}
      {cursorPx && (
        <KenneyHandCursor
          position={cursorPx}
          coordinateSpace="viewport"
          state={isPinching ? 'grab' : 'point'}
          isPinching={isPinching}
          isHandDetected={handDetected}
          size={40}
          color="pink"
        />
      )}

      <div className='flex flex-col items-center gap-4 p-4 max-w-2xl mx-auto'>
        <div className='flex gap-2'>
          {LEVELS.map((level) => (
            <button
              type='button'
              key={level.level}
              onClick={() => handleLevelChange(level.level)}
              className={`px-4 py-2 rounded-full font-bold transition-all ${
                currentLevel === level.level
                  ? 'bg-pink-500 text-white shadow-lg'
                  : 'bg-slate-50 border-2 border-slate-200 text-slate-700 hover:border-slate-400'
              }`}
            >
              Level {level.level}
            </button>
          ))}
        </div>

        {/* Instructions */}
        <div className="text-center">
          <p className='text-gray-600 text-lg'>
            👋 Show your hand and pinch to draw! 🖱️ Or use your mouse
          </p>
          {handDetected && (
            <p className="text-pink-600 font-bold text-sm mt-1 animate-pulse">
              ✨ Hand detected! Pinch to draw ✨
            </p>
          )}
        </div>

        {/* Canvas Container */}
        <div
          ref={canvasContainerRef}
          onPointerMove={handlePointerMove}
          className="relative touch-none cursor-crosshair rounded-2xl shadow-xl border-4 border-pink-200 overflow-hidden"
          style={{ maxWidth: '100%', width: CANVAS_SIZE, height: CANVAS_SIZE }}
        >
          <canvas
            ref={canvasRef}
            width={CANVAS_SIZE}
            height={CANVAS_SIZE}
            className="block"
          />
          
          {/* Hand position indicator (when using mouse) */}
          {!handDetected && cursorPx && (
            <div
              className="absolute w-6 h-6 rounded-full bg-white border-3 border-pink-500 pointer-events-none transform -translate-x-1/2 -translate-y-1/2"
              style={{
                left: ((cursorPx.x - (canvasContainerRef.current?.getBoundingClientRect().left || 0)) / (canvasContainerRef.current?.offsetWidth || 1)) * 100 + '%',
                top: ((cursorPx.y - (canvasContainerRef.current?.getBoundingClientRect().top || 0)) / (canvasContainerRef.current?.offsetHeight || 1)) * 100 + '%',
              }}
            />
          )}
        </div>

        <div className='flex gap-4 text-center'>
          <div className='bg-purple-100 px-4 py-2 rounded-xl'>
            <p className='text-sm text-purple-600 font-medium'>Points</p>
            <p className='text-2xl font-bold text-purple-700'>
              {points.length}
            </p>
          </div>
          <div className='bg-pink-100 px-4 py-2 rounded-xl'>
            <p className='text-sm text-pink-600 font-medium'>Score</p>
            <p className='text-2xl font-bold text-pink-700'>{score}</p>
          </div>
        </div>

        <div className='flex gap-3'>
          <button
            type='button'
            onClick={handleClear}
            className='px-6 py-3 bg-slate-100 border-2 border-slate-200 hover:bg-slate-200 text-slate-700 rounded-xl font-black transition-all'
          >
            Clear
          </button>
          <button
            type='button'
            onClick={handleFinish}
            className='px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white rounded-xl font-bold shadow-lg transition-all'
          >
            Finish
          </button>
        </div>
      </div>
    </GameContainer>
  );
});

// Main export wrapped with GameShell
export const KaleidoscopeHands = memo(function KaleidoscopeHandsComponent() {
  return (
    <GameShell
      gameId="kaleidoscope-hands"
      gameName="Kaleidoscope Hands"
      showWellnessTimer={true}
      enableErrorBoundary={true}
    >
      <KaleidoscopeHandsGame />
    </GameShell>
  );
});

export default KaleidoscopeHands;
