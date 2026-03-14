/**
 * Wash Hands Dance Game
 *
 * Children follow Pip through 5 handwashing steps using hand gestures.
 * Each step is advanced by waving/moving hands in view of the camera.
 *
 * @ticket TCK-20260310-009
 */

import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { GameContainer } from '../components/GameContainer';
import { GameShell } from '../components/GameShell';
import { useGameHandTracking } from '../hooks/useGameHandTracking';
import { useGameCompletion } from '../hooks/useGameCompletion';
import { useGameSessionProgress } from '../hooks/useGameSessionProgress';
import { useAudio } from '../utils/hooks/useAudio';
import { useTTS } from '../hooks/useTTS';
import { CameraThumbnail } from '../components/game/CameraThumbnail';
import {
  WASH_STEPS,
  getStepById,
  getTotalSteps,
  calculateStars,
  calculateScore,
} from '../games/washHandsDanceLogic';
import { KenneyIcon } from '../components/ui/KenneyIcon';

// How many consecutive frames with hand movement to advance a step
const GESTURE_FRAMES_NEEDED = 20;
// Movement threshold (normalized 0-1) to count as a "wave"
const MOVEMENT_THRESHOLD = 0.015;

const WashHandsDanceGame = memo(function WashHandsDanceGameComponent() {
  const navigate = useNavigate();

  const [gameState, setGameState] = useState<'start' | 'playing' | 'complete'>('start');
  const [currentStep, setCurrentStep] = useState(0);
  const [attempts, setAttempts] = useState<number[]>(Array(getTotalSteps()).fill(0));
  const [totalScore, setTotalScore] = useState(0);
  const [gestureProgress, setGestureProgress] = useState(0); // 0-100 fill bar
  const [showStepSuccess, setShowStepSuccess] = useState(false);

  const gestureFramesRef = useRef(0);
  const lastCursorRef = useRef<{ x: number; y: number } | null>(null);
  const attemptsRef = useRef<number[]>(Array(getTotalSteps()).fill(0));
  const currentAttemptsRef = useRef(1);

  const { playSuccess, playCelebration, playClick } = useAudio();
  const { completeGame } = useGameCompletion('wash-hands-dance');
  const { speak, isEnabled: ttsEnabled } = useTTS();

  const {
    isReady,
    cursor,
    startTracking,
    stopTracking,
    webcamRef,
  } = useGameHandTracking({ gameName: 'WashHandsDance' });

  useGameSessionProgress({
    gameName: 'Wash Hands Dance',
    score: totalScore,
    level: currentStep + 1,
    isPlaying: gameState === 'playing',
    metaData: { stepsCompleted: currentStep, totalSteps: getTotalSteps() },
  });

  // Gesture detection: count frames where hand moved significantly
  useEffect(() => {
    if (gameState !== 'playing' || showStepSuccess) return;

    if (cursor && lastCursorRef.current) {
      const dx = Math.abs(cursor.x - lastCursorRef.current.x);
      const dy = Math.abs(cursor.y - lastCursorRef.current.y);
      const movement = dx + dy;

      if (movement > MOVEMENT_THRESHOLD) {
        gestureFramesRef.current += 1;
        setGestureProgress(Math.min(100, (gestureFramesRef.current / GESTURE_FRAMES_NEEDED) * 100));
      } else {
        // Decay slowly when not moving
        gestureFramesRef.current = Math.max(0, gestureFramesRef.current - 0.5);
        setGestureProgress(Math.max(0, (gestureFramesRef.current / GESTURE_FRAMES_NEEDED) * 100));
      }
    }

    lastCursorRef.current = cursor ?? null;
  }, [cursor, gameState, showStepSuccess]);

  // Advance step when gesture threshold reached
  useEffect(() => {
    if (gestureFramesRef.current >= GESTURE_FRAMES_NEEDED && gameState === 'playing' && !showStepSuccess) {
      handleStepComplete();
    }
  });

  const handleStepComplete = useCallback(() => {
    const stepScore = calculateScore(currentStep, currentAttemptsRef.current);
    setTotalScore((prev) => prev + stepScore);

    const updatedAttempts = [...attemptsRef.current];
    updatedAttempts[currentStep] = currentAttemptsRef.current;
    attemptsRef.current = updatedAttempts;
    setAttempts(updatedAttempts);

    gestureFramesRef.current = 0;
    setGestureProgress(0);
    setShowStepSuccess(true);
    void playSuccess();

    setTimeout(async () => {
      setShowStepSuccess(false);
      if (currentStep + 1 >= getTotalSteps()) {
        setGameState('complete');
        void playCelebration();
        await completeGame({ score: totalScore, level: 1 });
      } else {
        setCurrentStep((prev) => prev + 1);
        currentAttemptsRef.current = 1;
      }
    }, 1200);
  }, [currentStep, playSuccess, playCelebration, completeGame]);

  const startGame = useCallback(() => {
    setGameState('playing');
    setCurrentStep(0);
    setTotalScore(0);
    setGestureProgress(0);
    gestureFramesRef.current = 0;
    lastCursorRef.current = null;
    const fresh = Array(getTotalSteps()).fill(0);
    attemptsRef.current = fresh;
    setAttempts(fresh);
    currentAttemptsRef.current = 1;
    playClick();
    void startTracking();
    if (ttsEnabled) speak('Follow the 5 handwashing steps! Wave your hands to complete each step.');
  }, [startTracking, playClick, speak, ttsEnabled]);

  const handlePlayAgain = useCallback(() => {
    stopTracking();
    startGame();
  }, [stopTracking, startGame]);

  const handleFinish = useCallback(() => {
    stopTracking();
    navigate('/games');
  }, [stopTracking, navigate]);

  const step = getStepById(currentStep);
  const stars = calculateStars(attempts.map((a) => (a === 0 ? 1 : a)));
  const totalSteps = getTotalSteps();

  // COPY-001: Speak step instruction when step changes so non-reading children can follow
  useEffect(() => {
    if (gameState === 'playing' && step && ttsEnabled) {
      speak(`Step ${currentStep + 1}: ${step.instruction}`);
    }
  }, [currentStep, gameState]); // intentional: speak only when step/gameState change, not on every dep

  return (
    <GameContainer>
      {/* Start Screen */}
      {gameState === 'start' && (
        <div className="flex flex-col items-center gap-8 max-w-md w-full px-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center"
          >
            <div className="text-7xl mb-4">🧼</div>
            <h1 className="text-4xl font-black text-slate-900 mb-2">Wash Hands Dance</h1>
            <p className="text-lg text-slate-600">
              Follow the 5 handwashing steps! Wave your hands to complete each step.
            </p>
          </motion.div>

          <div className="grid grid-cols-5 gap-2 w-full">
            {WASH_STEPS.map((s) => (
              <div key={s.id} className="bg-blue-50 border-2 border-blue-200 rounded-xl p-2 text-center">
                <div className="text-2xl">{s.emoji}</div>
                <div className="text-xs font-bold text-blue-700 mt-1">{s.name}</div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={startGame}
            className="px-10 py-4 bg-blue-500 hover:bg-blue-600 text-white rounded-2xl font-black text-xl shadow-[0_4px_0_#1D4ED8] active:translate-y-1 active:shadow-none transition-all"
          >
            Start Washing! 🚿
          </button>
        </div>
      )}

      {/* Playing Screen */}
      {gameState === 'playing' && step && (
        <div className="flex flex-col items-center gap-4 w-full max-w-lg px-4">
          {/* Step progress dots */}
          <div className="flex gap-2">
            {WASH_STEPS.map((s, i) => (
              <div
                key={s.id}
                className={`w-3 h-3 rounded-full transition-all ${
                  i < currentStep
                    ? 'bg-green-500'
                    : i === currentStep
                    ? 'bg-blue-500 scale-125'
                    : 'bg-slate-200'
                }`}
              />
            ))}
          </div>

          {/* Step counter */}
          <p className="text-sm font-bold text-slate-500 uppercase tracking-wide">
            Step {currentStep + 1} of {totalSteps}
          </p>

          {/* Main step card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: -20 }}
              className="bg-white border-4 border-blue-300 rounded-3xl p-6 text-center shadow-lg w-full"
            >
              <div className="text-8xl mb-3">{step.emoji}</div>
              <h2 className="text-3xl font-black text-slate-900 mb-1">{step.name}</h2>
              <p className="text-lg text-slate-600 mb-2">{step.instruction}</p>
              <p className="text-sm text-slate-400 italic">{step.hint}</p>
            </motion.div>
          </AnimatePresence>

          {/* Step success overlay */}
          <AnimatePresence>
            {showStepSuccess && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center bg-green-500/20 z-10 rounded-3xl"
              >
                <div className="bg-white rounded-3xl p-8 shadow-xl text-center">
                  <div className="text-6xl mb-2">✅</div>
                  <p className="text-2xl font-black text-green-600">Great job!</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Gesture progress bar */}
          <div className="w-full bg-slate-100 rounded-full h-5 border-2 border-slate-200 overflow-hidden">
            <motion.div
              className="h-full bg-blue-400 rounded-full"
              animate={{ width: `${gestureProgress}%` }}
              transition={{ duration: 0.1 }}
            />
          </div>
          <p className="text-sm font-bold text-slate-500">
            {isReady ? '👋 Wave your hands to complete this step!' : '📷 Starting camera...'}
          </p>

          {/* Camera thumbnail */}
          <div className="w-full max-w-xs">
            <CameraThumbnail
              webcamRef={webcamRef}
              isHandDetected={isReady}
            />
          </div>

          {/* Score display */}
          <div className="flex items-center gap-2 text-slate-500 text-sm">
            <span className="font-bold">Score:</span>
            <span className="font-black text-blue-600 text-base">{totalScore}</span>
          </div>
        </div>
      )}

      {/* Complete Screen */}
      {gameState === 'complete' && (
        <div className="flex flex-col items-center gap-6 max-w-md w-full px-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-center"
          >
            <div className="flex justify-center mb-3"><KenneyIcon type='star' size={64} /></div>
            <h2 className="text-3xl font-black text-slate-900 mb-1">All Clean!</h2>
            <p className="text-lg text-slate-600">Your hands are squeaky clean!</p>
          </motion.div>

          {/* Stars */}
          <div className="flex gap-2 text-5xl">
            {Array.from({ length: 5 }).map((_, i) => (
              <motion.span
                key={i}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: i * 0.1 }}
              >
                {i < stars ? <KenneyIcon type='star' size={24} /> : <KenneyIcon type='heart_empty' size={24} />}
              </motion.span>
            ))}
          </div>

          {/* Score card */}
          <div className="grid grid-cols-2 gap-4 w-full">
            <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-4 text-center">
              <p className="text-sm font-bold text-blue-600 uppercase tracking-wide">Final Score</p>
              <p className="text-4xl font-black text-blue-700">{totalScore}</p>
            </div>
            <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-4 text-center">
              <p className="text-sm font-bold text-green-600 uppercase tracking-wide">Stars</p>
              <p className="text-4xl font-black text-green-700">{stars}/5</p>
            </div>
          </div>

          {/* Step breakdown */}
          <div className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl p-4">
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-3">Steps Breakdown</p>
            <div className="flex flex-col gap-2">
              {WASH_STEPS.map((s, i) => (
                <div key={s.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{s.emoji}</span>
                    <span className="text-sm font-bold text-slate-700">{s.name}</span>
                  </div>
                  <span className="text-sm font-black text-blue-600">
                    +{calculateScore(i, attempts[i] || 1)} pts
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 w-full">
            <button
              type="button"
              onClick={handlePlayAgain}
              className="flex-1 px-6 py-4 bg-blue-500 hover:bg-blue-600 text-white rounded-2xl font-black text-lg shadow-[0_4px_0_#1D4ED8] active:translate-y-1 active:shadow-none transition-all"
            >
              Play Again
            </button>
            <button
              type="button"
              onClick={handleFinish}
              className="flex-1 px-6 py-4 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-2xl font-black text-lg transition-all"
            >
              Finish
            </button>
          </div>
        </div>
      )}
    </GameContainer>
  );
});

export const WashHandsDance = memo(function WashHandsDanceComponent() {
  return (
    <GameShell
      gameId="wash-hands-dance"
      gameName="Wash Hands Dance"
      showWellnessTimer={true}
      enableErrorBoundary={true}
    >
      <WashHandsDanceGame />
    </GameShell>
  );
});

export default WashHandsDance;
