/**
 * Number Tracing Game - REFACTORED with GameShell
 *
 * Trace numbers by following dotted guides.
 * Demonstrates GameShell integration pattern.
 * 
 * @ticket GQ-002 - Subscription check
 * @ticket GQ-003 - Progress tracking
 * @ticket GQ-004 - Error handling
 * @ticket GQ-005 - Reduce motion
 * @ticket GQ-007 - Wellness features
 */

import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { GameShell } from '../components/GameShell';
import { GameContainer } from '../components/GameContainer';
import { useGameProgress } from '../hooks/useGameProgress';
import { useAudio } from '../utils/hooks/useAudio';
import { useGameDrops } from '../hooks/useGameDrops';
import { CelebrationOverlay } from '../components/CelebrationOverlay';
import {
  NUMBER_TEMPLATES as _NUMBER_TEMPLATES,
  buildScore,
  calculateTraceCoverage,
  getTemplateForDigit,
  nextDigit,
  type TracePoint,
} from '../games/numberTracingLogic';

const CANVAS_SIZE = 360;
const TOTAL_DIGITS = 10;

// Inner game component
interface NumberTracingGameProps {
  saveProgress: (data: { score: number; completed: boolean; level?: number; metadata?: Record<string, unknown> }) => Promise<void>;
}

const NumberTracingGame = memo(function NumberTracingGameComponent({ saveProgress }: NumberTracingGameProps) {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const reducedMotion = useReducedMotion();
  
  const [currentDigit, setCurrentDigit] = useState(0);
  const [strokePoints, setStrokePoints] = useState<TracePoint[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastAccuracy, setLastAccuracy] = useState(0);
  const [score, setScore] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [feedback, setFeedback] = useState('Trace the number by following the dotted guide.');
  const [showCelebration, setShowCelebration] = useState(false);
  const [completedDigits, setCompletedDigits] = useState<number[]>([]);

  const { playClick, playSuccess, playError, playCelebration: _playCelebration } = useAudio();
  const { onGameComplete } = useGameDrops('number-tracing');
  const currentTemplate = useMemo(() => getTemplateForDigit(currentDigit), [currentDigit]);

  // Draw canvas
  useEffect(() => {
    try {
      const canvas = canvasRef.current;
      if (!canvas || !currentTemplate) return;
      const context = canvas.getContext('2d');
      if (!context) return;

      context.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
      context.fillStyle = '#F8FAFC';
      context.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

      // Draw guide points
      context.fillStyle = '#94A3B8';
      currentTemplate.guidePoints.forEach((point) => {
        context.beginPath();
        context.arc(point.x * CANVAS_SIZE, point.y * CANVAS_SIZE, 7, 0, Math.PI * 2);
        context.fill();
      });

      // Draw stroke
      context.strokeStyle = '#60A5FA';
      context.lineWidth = 8;
      context.lineJoin = 'round';
      context.lineCap = 'round';

      if (strokePoints.length > 0) {
        context.beginPath();
        context.moveTo(strokePoints[0].x * CANVAS_SIZE, strokePoints[0].y * CANVAS_SIZE);
        for (let i = 1; i < strokePoints.length; i += 1) {
          context.lineTo(strokePoints[i].x * CANVAS_SIZE, strokePoints[i].y * CANVAS_SIZE);
        }
        context.stroke();
      }
    } catch (err) {
      console.error('Canvas draw error:', err);
    }
  }, [currentTemplate, strokePoints]);

  const getPointFromEvent = (event: React.PointerEvent<HTMLCanvasElement>): TracePoint => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    return {
      x: Math.max(0, Math.min(1, x)),
      y: Math.max(0, Math.min(1, y)),
    };
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    playClick();
    setIsDrawing(true);
    setStrokePoints([getPointFromEvent(event)]);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    setStrokePoints((prev) => [...prev, getPointFromEvent(event)]);
  };

  const handlePointerUp = useCallback(() => {
    setIsDrawing(false);

    try {
      // Calculate accuracy
      const accuracy = calculateTraceCoverage(strokePoints, currentTemplate);
      setLastAccuracy(accuracy);

      if (accuracy >= 0.6) {
        // Success!
        playSuccess();
        const points = buildScore(accuracy, hintsUsed);
        const newScore = score + points;
        setScore(newScore);
        setCompletedDigits(prev => [...prev, currentDigit]);
        setFeedback(`Great job! ${points} points!`);

        // Check if all digits complete
        if (completedDigits.length + 1 >= TOTAL_DIGITS) {
          setShowCelebration(true);
          void saveProgress({
            score: newScore,
            completed: true,
            metadata: {
              completed_digits: [...completedDigits, currentDigit],
              total_accuracy: accuracy,
            },
          });
          onGameComplete(newScore);
        } else {
          // Next digit after delay
          setTimeout(() => {
            setCurrentDigit(nextDigit(currentDigit, completedDigits));
            setStrokePoints([]);
            setFeedback('Trace the next number!');
          }, reducedMotion ? 500 : 1500);
        }
      } else {
        // Try again
        playError();
        setFeedback('Keep trying! Follow the dots more closely.');
        setTimeout(() => {
          setStrokePoints([]);
        }, reducedMotion ? 300 : 1000);
      }
    } catch (err) {
      console.error('Trace evaluation error:', err);
      setFeedback('Oops! Try again.');
    }
  }, [isDrawing, strokePoints, currentTemplate, hintsUsed, score, currentDigit, completedDigits, playSuccess, playError, reducedMotion, saveProgress, onGameComplete]);

  const handleUseHint = () => {
    playClick();
    setHintsUsed(prev => prev + 1);
    setFeedback('Follow the dotted line with your finger!');
  };

  const handleReset = () => {
    playClick();
    setCurrentDigit(0);
    setCompletedDigits([]);
    setScore(0);
    setHintsUsed(0);
    setStrokePoints([]);
    setFeedback('Trace the number by following the dotted guide.');
    setShowCelebration(false);
  };

  return (
    <GameContainer
      title="Number Tracing"
      score={score}
      level={currentDigit + 1}
      onHome={() => navigate('/games')}
      showScore={true}
    >
      <div className="relative w-full h-full flex flex-col items-center justify-center p-4 bg-[#FFF8F0]">
        {/* Instructions */}
        <div className="bg-white rounded-2xl px-6 py-4 border-3 border-[#F2CC8F] shadow-[0_4px_0_#E5B86E] mb-4 max-w-md text-center">
          <p className="text-lg font-bold text-advay-slate">{feedback}</p>
          <p className="text-sm text-text-secondary mt-1">
            Number {currentDigit + 1} of {TOTAL_DIGITS}
          </p>
        </div>

        {/* Canvas */}
        <div className="relative bg-white rounded-3xl p-4 border-4 border-[#F2CC8F] shadow-[0_4px_0_#E5B86E]">
          <canvas
            ref={canvasRef}
            width={CANVAS_SIZE}
            height={CANVAS_SIZE}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            className="touch-none cursor-crosshair rounded-2xl"
            style={{ width: '300px', height: '300px' }}
          />

          {/* Accuracy indicator */}
          {lastAccuracy > 0 && (
            <motion.div
              initial={reducedMotion ? {} : { opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute -top-3 -right-3 bg-emerald-500 text-white rounded-full w-16 h-16 flex items-center justify-center border-4 border-white shadow-lg"
            >
              <span className="font-black text-lg">{Math.round(lastAccuracy * 100)}%</span>
            </motion.div>
          )}
        </div>

        {/* Controls */}
        <div className="flex gap-4 mt-6">
          <button
            onClick={handleUseHint}
            className="px-6 py-3 bg-amber-100 hover:bg-amber-200 text-amber-700 rounded-[1.5rem] font-black border-3 border-amber-300 shadow-[0_4px_0_#FCD34D] transition-all"
          >
            💡 Hint
          </button>
          <button
            onClick={() => {
              setStrokePoints([]);
              setFeedback('Try again! Follow the dots.');
            }}
            className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-[1.5rem] font-black border-3 border-slate-300 shadow-[0_4px_0_#CBD5E1] transition-all"
          >
            🔄 Clear
          </button>
        </div>

        {/* Progress */}
        <div className="flex gap-2 mt-4">
          {Array.from({ length: TOTAL_DIGITS }).map((_, i) => (
            <div
              key={i}
              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                completedDigits.includes(i)
                  ? 'bg-emerald-500 text-white'
                  : i === currentDigit
                  ? 'bg-blue-500 text-white'
                  : 'bg-slate-200 text-slate-400'
              }`}
            >
              {i}
            </div>
          ))}
        </div>

        {/* Celebration */}
        {showCelebration && (
          <CelebrationOverlay
            score={score}
            stats={{ accuracy: lastAccuracy, hints: hintsUsed }}
            onPlayAgain={handleReset}
            onExit={() => navigate('/games')}
          />
        )}
      </div>
    </GameContainer>
  );
});

// Main export wrapped with GameShell
export const NumberTracing = memo(function NumberTracingComponent() {
  const { saveProgress } = useGameProgress('number-tracing');

  return (
    <GameShell
      gameId="number-tracing"
      gameName="Number Tracing"
      showWellnessTimer={true}
      enableErrorBoundary={true}
    >
      <NumberTracingGame saveProgress={saveProgress} />
    </GameShell>
  );
});

export default NumberTracing;
