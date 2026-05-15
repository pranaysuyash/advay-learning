/**
 * Alphabet Tracing Game
 * 
 * A simpler standalone version focused on letter tracing with hand tracking.
 * Kids trace letters using their index finger with pinch-to-draw mechanics.
 * 
 * @ticket GQ-002
 */

import { memo, useCallback, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import Webcam from 'react-webcam';
import { useNavigate } from 'react-router-dom';

import { GameShell } from '../components/GameShell';
import { GameContainer } from '../components/GameContainer';
import { GameControls, type GameControl } from '../components/GameControls';
import { CelebrationOverlay } from '../components/CelebrationOverlay';
import { GameCursor } from '../components/game/GameCursor';
import { Mascot } from '../components/Mascot';
import { OptionChips } from '../components/game/OptionChips';
import { VoiceInstructions } from '../components/game/VoiceInstructions';

import { useGameHandTracking } from '../hooks/useGameHandTracking';
import { useGameCompletion } from '../hooks/useGameCompletion';
import { useAudio } from '../utils/hooks/useAudio';
import { useTTS } from '../hooks/useTTS';
import { triggerHaptic } from '../utils/haptics';

import type { HandTrackingRuntimeMeta } from '../hooks/useHandTrackingRuntime';
import type { TrackedHandFrame } from '../utils/handTrackingFrame';
import type { Point } from '../types/tracking';

import {
  ALPHABET_LETTERS,
  evaluateTracing,
  calculateTracingScore,
  getNextLetter,
  smoothTracePoints,
} from '../games/alphabetTracingLogic';

interface TracePoint extends Point {
  timestamp: number;
}

interface DrawnStroke {
  points: TracePoint[];
}

const AlphabetTracingGame = memo(function AlphabetTracingComponent() {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const webcamRef = useRef<Webcam>(null);
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const lastDrawPointRef = useRef<Point | null>(null);
  const strokesRef = useRef<DrawnStroke[]>([]);
  const currentStrokeRef = useRef<TracePoint[]>([]);
  const lastUIUpdateAtRef = useRef(0);

  // Game state
  const [currentLetterIndex, setCurrentLetterIndex] = useState(0);
  const [isDrawing, setIsDrawing] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationStars, setCelebrationStars] = useState(0);
  const [gameCompleted, setGameCompleted] = useState(false);

  // Hand tracking state
  const [isPinching, setIsPinching] = useState(false);
  const [handCursor, setHandCursor] = useState<Point | null>(null);
  const [isHandTrackingEnabled, setIsHandTrackingEnabled] = useState(true);

  // Audio and TTS
  const { playPop, playSuccess, playError } = useAudio();
  const { speak, isEnabled: ttsEnabled } = useTTS();
  const { completeGame } = useGameCompletion('alphabet-tracing');

  const currentLetter = ALPHABET_LETTERS[currentLetterIndex];

  // Drawing functions
  const drawPoint = useCallback((x: number, y: number) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 8;
    ctx.strokeStyle = currentLetter.color;

    if (lastDrawPointRef.current) {
      ctx.beginPath();
      ctx.moveTo(lastDrawPointRef.current.x, lastDrawPointRef.current.y);
      ctx.lineTo(x, y);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fillStyle = currentLetter.color;
      ctx.fill();
    }
  }, [currentLetter.color]);

  // Initialize canvas guide
  const initCanvasGuide = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    ctx.save();
    ctx.strokeStyle = '#E5E7EB';
    ctx.lineWidth = 3;
    ctx.setLineDash([5, 5]);
    const scale = Math.min(canvas.width, canvas.height) * 0.6;
    ctx.font = `${scale}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#E5E7EB';
    ctx.fillText(
      currentLetter.char,
      canvas.width / 2,
      canvas.height / 2
    );
    ctx.restore();
  }, [currentLetter.char]);

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    initCanvasGuide();
    strokesRef.current = [];
    currentStrokeRef.current = [];
  }, [initCanvasGuide]);

  // Handle hand tracking frame
  const handleTrackingFrame = useCallback(
    (frame: TrackedHandFrame, _meta: HandTrackingRuntimeMeta) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const now = performance.now();
      const tip = frame.indexTip;

      if (!tip) {
        if (now - lastUIUpdateAtRef.current >= 100) {
          setHandCursor(null);
          setIsPinching(false);
          lastUIUpdateAtRef.current = now;
        }
        return;
      }

      const canvasX = tip.x * canvas.width;
      const canvasY = tip.y * canvas.height;

      if (now - lastUIUpdateAtRef.current >= 100) {
        setHandCursor({ x: canvasX, y: canvasY });
        setIsPinching(frame.pinch.state.isPinching);
        lastUIUpdateAtRef.current = now;
      }

      // Handle drawing
      if (frame.pinch.state.isPinching && gameStarted && !gameCompleted) {
        if (!isDrawing) {
          setIsDrawing(true);
          currentStrokeRef.current = [];
        }

        const point: TracePoint = {
          x: canvasX,
          y: canvasY,
          timestamp: now,
        };

        currentStrokeRef.current.push(point);
        drawPoint(canvasX, canvasY);
        lastDrawPointRef.current = { x: canvasX, y: canvasY };
      } else if (isDrawing) {
        // Pinch released - end stroke
        setIsDrawing(false);
        if (currentStrokeRef.current.length > 0) {
          strokesRef.current.push({ points: [...currentStrokeRef.current] });
          currentStrokeRef.current = [];
        }
        lastDrawPointRef.current = null;
      }
    },
    [gameStarted, gameCompleted, isDrawing, drawPoint]
  );

  const { isReady: isHandTrackingReady } = useGameHandTracking({
    gameName: 'AlphabetTracing',
    isRunning: gameStarted && isHandTrackingEnabled && !gameCompleted,
    webcamRef,
    targetFps: 30,
    onFrame: handleTrackingFrame,
    onNoVideoFrame: () => {
      const now = performance.now();
      if (now - lastUIUpdateAtRef.current >= 100) {
        setHandCursor(null);
        setIsPinching(false);
        lastUIUpdateAtRef.current = now;
      }
    },
  });

  // Check tracing
  const checkTracing = () => {
    // Flatten all strokes into trace points
    const allPoints = strokesRef.current.flatMap(stroke => stroke.points);
    
    if (allPoints.length < 5) {
      playError();
      if (ttsEnabled) speak('Try tracing the letter more!');
      return;
    }

    // Smooth the trace points
    const smoothedPoints = smoothTracePoints(
      allPoints.map(p => ({ x: p.x / 800, y: p.y / 600 })),
      3
    );

    const result = evaluateTracing(smoothedPoints, currentLetter, difficulty);
    const points = calculateTracingScore(result.accuracy, 5000, streak);

    setScore(prev => prev + points);
    setCelebrationStars(result.stars);

    if (result.passed) {
      playSuccess();
      triggerHaptic('success');
      setStreak(prev => prev + 1);
      setShowCelebration(true);

      if (ttsEnabled) {
        speak(`Great job! That's the letter ${currentLetter.char} for ${currentLetter.name}!`);
      }
    } else {
      playError();
      triggerHaptic('error');
      setStreak(0);

      if (ttsEnabled) {
        speak('Keep trying! Trace along the dotted line.');
      }
    }
  };

  // Next letter
  const nextLetter = () => {
    setShowCelebration(false);
    clearCanvas();

    const next = getNextLetter(currentLetterIndex);
    if (next) {
      setCurrentLetterIndex(next.index);
      if (ttsEnabled) {
        speak(`Now trace the letter ${next.letter.char}`);
      }
    } else {
      // Game complete
      setGameCompleted(true);
      completeGame({ score, completed: true });
    }
  };

  // Start game
  const startGame = () => {
    setGameStarted(true);
    clearCanvas();
    if (ttsEnabled) {
      speak(`Let's trace the letter ${currentLetter.char} for ${currentLetter.name}!`);
    }
  };

  // Reset game
  const resetGame = () => {
    setGameStarted(false);
    setGameCompleted(false);
    setCurrentLetterIndex(0);
    setScore(0);
    setStreak(0);
    setShowCelebration(false);
    clearCanvas();
  };

  // Go home
  const goToHome = () => {
    playPop();
    navigate('/dashboard');
  };

  // Game controls
  const gameControls: GameControl[] = useMemo(
    () => [
      {
        id: 'mode',
        icon: isHandTrackingEnabled ? 'hand' : 'pencil',
        label: isHandTrackingEnabled ? 'Hand Mode' : 'Mouse Mode',
        onClick: () => setIsHandTrackingEnabled(!isHandTrackingEnabled),
        variant: 'primary',
        isActive: isHandTrackingEnabled,
      },
      {
        id: 'clear',
        icon: 'x',
        label: 'Clear',
        onClick: clearCanvas,
        variant: 'danger',
      },
      {
        id: 'check',
        icon: 'check',
        label: 'Done',
        onClick: checkTracing,
        variant: 'success',
      },
    ],
    [isHandTrackingEnabled, clearCanvas, checkTracing]
  );

  // Menu controls
  const menuControls: GameControl[] = useMemo(
    () => [
      {
        id: 'home',
        icon: 'home',
        label: 'Home',
        onClick: goToHome,
        variant: 'secondary',
      },
      {
        id: 'start',
        icon: 'sparkles',
        label: 'Start Tracing!',
        onClick: startGame,
        variant: 'success',
      },
    ],
    [goToHome, startGame]
  );

  // Completion controls
  const completionControls: GameControl[] = useMemo(
    () => [
      {
        id: 'play-again',
        icon: 'rotate-ccw',
        label: 'Play Again',
        onClick: resetGame,
        variant: 'primary',
      },
      {
        id: 'home',
        icon: 'home',
        label: 'Home',
        onClick: goToHome,
        variant: 'secondary',
      },
    ],
    [resetGame, goToHome]
  );

  const normalizedCursor = handCursor
    ? { x: handCursor.x / 800, y: handCursor.y / 600 }
    : null;

  return (
    <>
      {gameStarted && !gameCompleted ? (
        <GameContainer
          webcamRef={webcamRef}
          title="Alphabet Tracing"
          score={score}
          onHome={goToHome}
          isHandDetected={isHandTrackingReady}
          isPlaying={gameStarted && !gameCompleted}
        >
          <div
            ref={gameAreaRef}
            className="relative w-full h-full bg-white/50"
            role="main"
            aria-label="Alphabet tracing game"
          >
            {/* Letter Display Header */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40">
              <div className="flex items-center gap-4 px-6 py-3 rounded-2xl border-3 border-[#F2CC8F] shadow-[0_4px_0_#E5B86E] backdrop-blur-md bg-white">
                <span className="text-5xl">{currentLetter.emoji}</span>
                <div className="text-center">
                  <span className="block text-4xl font-black text-[#3B82F6]">
                    {currentLetter.char}
                  </span>
                  <span className="text-sm font-bold text-text-secondary uppercase tracking-wider">
                    {currentLetter.name}
                  </span>
                </div>
              </div>
            </div>

            {/* Progress Indicator */}
            <div className="absolute top-4 right-4 z-40">
              <div className="bg-white px-5 py-3 rounded-2xl border-3 border-[#F2CC8F] shadow-[0_4px_0_#E5B86E]">
                <span className="text-sm font-bold text-text-secondary uppercase">
                  Letter
                </span>
                <span className="ml-2 font-black text-xl text-[#3B82F6]">
                  {currentLetterIndex + 1} / {ALPHABET_LETTERS.length}
                </span>
              </div>
            </div>

            {/* Streak Display */}
            {streak > 0 && (
              <div className="absolute top-20 left-4 z-40">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="bg-gradient-to-r from-yellow-300 to-orange-400 px-4 py-2 rounded-xl shadow-lg"
                >
                  <span className="text-white font-black text-lg">
                    🔥 {streak} Streak!
                  </span>
                </motion.div>
              </div>
            )}

            {/* Canvas for drawing */}
            <canvas
              ref={canvasRef}
              width={800}
              height={600}
              className="w-full h-full cursor-crosshair"
              onMouseDown={(e) => {
                if (!isHandTrackingEnabled) {
                  setIsDrawing(true);
                  const rect = canvasRef.current?.getBoundingClientRect();
                  if (rect) {
                    const x = (e.clientX - rect.left) * (800 / rect.width);
                    const y = (e.clientY - rect.top) * (600 / rect.height);
                    currentStrokeRef.current = [{ x, y, timestamp: Date.now() }];
                    lastDrawPointRef.current = { x, y };
                    drawPoint(x, y);
                  }
                }
              }}
              onMouseMove={(e) => {
                if (isDrawing && !isHandTrackingEnabled) {
                  const rect = canvasRef.current?.getBoundingClientRect();
                  if (rect) {
                    const x = (e.clientX - rect.left) * (800 / rect.width);
                    const y = (e.clientY - rect.top) * (600 / rect.height);
                    currentStrokeRef.current.push({
                      x,
                      y,
                      timestamp: Date.now(),
                    });
                    drawPoint(x, y);
                  }
                }
              }}
              onMouseUp={() => {
                setIsDrawing(false);
                if (currentStrokeRef.current.length > 0) {
                  strokesRef.current.push({
                    points: [...currentStrokeRef.current],
                  });
                  currentStrokeRef.current = [];
                }
                lastDrawPointRef.current = null;
              }}
              onMouseLeave={() => {
                if (isDrawing) {
                  setIsDrawing(false);
                  lastDrawPointRef.current = null;
                }
              }}
            />

            {/* Hand tracking cursor */}
            {normalizedCursor && isHandTrackingEnabled && (
              <GameCursor
                position={normalizedCursor}
                coordinateSpace="normalized"
                containerRef={gameAreaRef}
                isPinching={isPinching}
                isHandDetected
                size={64}
                color={currentLetter.color}
              />
            )}

            {/* Mascot */}
            <div className="absolute bottom-4 left-4 z-20">
              <Mascot
                state={isDrawing ? 'waiting' : 'idle'}
                message={
                  isDrawing
                    ? 'Great tracing! Keep going!'
                    : `Trace the letter ${currentLetter.char} with your finger!`
                }
              />
            </div>

            {/* Game Controls */}
            <GameControls controls={gameControls} position="bottom-right" />
          </div>
        </GameContainer>
      ) : (
        /* Menu / Completion Screen */
        <section className="max-w-5xl mx-auto px-4 py-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            {/* Header */}
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-6">
              <div>
                <h1 className="text-4xl font-black text-advay-slate mb-2 tracking-tight">
                  Alphabet Tracing
                </h1>
                <p className="text-text-secondary font-bold text-lg">
                  Learn your ABCs by tracing each letter!
                </p>
              </div>

              <div className="text-left sm:text-right bg-white p-4 rounded-2xl border-3 border-[#F2CC8F] shadow-[0_4px_0_#E5B86E]">
                <output className="block text-3xl font-black text-[#10B981] mb-1">
                  Score: {score}
                </output>
                {streak > 0 && (
                  <div className="text-sm font-bold text-orange-500">
                    🔥 {streak} Streak
                  </div>
                )}
              </div>
            </header>

            {/* Game Area */}
            <div className="bg-white border-3 border-[#F2CC8F] rounded-[2.5rem] p-8 md:p-12 mb-8 shadow-[0_4px_0_#E5B86E]">
              {!gameStarted ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="w-32 h-32 mx-auto mb-8 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center border-3 border-blue-200">
                    <span className="text-6xl">✏️</span>
                  </div>

                  <h2 className="text-4xl font-black text-advay-slate mb-4">
                    Learn the Alphabet!
                  </h2>
                  <p className="text-text-secondary font-bold mb-10 max-w-lg text-center text-lg leading-relaxed">
                    Trace each letter with your finger to learn the alphabet.
                    Each letter has a fun word and emoji to help you remember!
                  </p>

                  <div className="mb-10 w-full max-w-md bg-slate-50 p-6 rounded-[2rem] border-2 border-[#F2CC8F]">
                    <OptionChips
                      label="Difficulty"
                      theme="light"
                      options={(['easy', 'medium', 'hard'] as const).map((diff) => ({
                        id: diff,
                        label: diff.charAt(0).toUpperCase() + diff.slice(1),
                      }))}
                      selectedId={difficulty}
                      onSelect={(id) => setDifficulty(id as typeof difficulty)}
                      buttonMinHeightClassName="min-h-[56px]"
                    />
                  </div>

                  <GameControls controls={menuControls} position="bottom-center" />

                  {ttsEnabled && (
                    <VoiceInstructions
                      instructions={[
                        'Trace each letter with your finger.',
                        'Follow the dotted lines.',
                        'Learn words for each letter!',
                      ]}
                      autoSpeak={true}
                    />
                  )}
                </div>
              ) : (
                /* Game Completed Screen */
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-32 h-32 mx-auto mb-8 text-7xl">🏆</div>

                  <h2 className="text-4xl font-black text-[#10B981] mb-2">
                    Amazing!
                  </h2>
                  <p className="text-xl text-text-secondary font-bold mb-8">
                    You learned the whole alphabet!
                  </p>
                  <div className="text-3xl font-black text-advay-slate mb-10 border-3 border-[#F2CC8F] bg-slate-50 px-8 py-4 rounded-3xl">
                    Final Score: <span className="text-[#3B82F6]">{score}</span>
                  </div>

                  <GameControls controls={completionControls} position="bottom-center" />
                </div>
              )}
            </div>

            {/* Instructions */}
            <div className="bg-[#3B82F6]/5 border-3 border-[#3B82F6]/10 rounded-[2rem] p-8">
              <h2 className="text-2xl font-black mb-4 text-[#3B82F6]">
                How to Play
              </h2>
              <ul className="space-y-3 text-advay-slate font-bold text-lg">
                <li>• Trace each letter using your finger or mouse</li>
                <li>• Follow the dotted letter outline as a guide</li>
                <li>• Learn a new word for each letter (A is for Apple!)</li>
                <li>• Complete all 26 letters to finish the game</li>
                <li className="pt-2">
                  <strong className="text-[#E85D04]">Hand Tracking:</strong>{' '}
                  Pinch your thumb and index finger to draw!
                </li>
              </ul>
            </div>
          </motion.div>

          {/* Celebration Overlay */}
          <CelebrationOverlay
            show={showCelebration}
            letter={currentLetter.char}
            accuracy={celebrationStars * 33}
            message={`Great ${currentLetter.name}!`}
            onComplete={nextLetter}
          />
        </section>
      )}
    </>
  );
});

export const AlphabetTracing = memo(function AlphabetTracingShell() {
  return (
    <GameShell
      gameId="alphabet-tracing"
      gameName="Alphabet Tracing"
      showWellnessTimer={true}
      enableErrorBoundary={true}
    >
      <AlphabetTracingGame />
    </GameShell>
  );
});

export default AlphabetTracing;
