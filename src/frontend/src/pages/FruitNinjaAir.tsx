/**
 * Fruit Ninja Air Game
 *
 * @ticket GQ-002, GQ-003, GQ-004, GQ-005, GQ-007
 */

import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { GameContainer } from '../components/GameContainer';
import { GameShell } from '../components/GameShell';
import { useAudio } from '../utils/hooks/useAudio';
import { useGameCompletion } from '../hooks/useGameCompletion';
import { useStreakTracking } from '../hooks/useStreakTracking';
import { useGameSessionProgress } from '../hooks/useGameSessionProgress';
import { triggerHaptic } from '../utils/haptics';
import { LEVELS, spawnFruit, updateFruits, checkSlice, type Fruit } from '../games/fruitNinjaAirLogic';
import { HandTrackingStatus } from '../components/game/HandTrackingStatus';
import { CameraThumbnail } from '../components/game/CameraThumbnail';
import { useGameHandTracking } from '../hooks/useGameHandTracking';
import type { TrackedHandFrame } from '../types/tracking';
import { GameCursor } from '../components/game/GameCursor';
import type { Point } from '../types/tracking';
import { VoiceInstructions, useVoiceInstructions } from '../components/game/VoiceInstructions';
import { GameStartButton } from '../components/game/GameStartButton';
import { GameHUD } from '../components/game/GameHUD';

// Fix internal canvas resolution to scale well
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;

const FruitNinjaAirGame = memo(function FruitNinjaAirGameComponent() {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [fruits, setFruits] = useState<Fruit[]>([]);
  const [slicedCount, setSlicedCount] = useState(0);
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState<'start' | 'playing' | 'complete'>('start');

  // Streak tracking
  const { streak, showMilestone, scorePopup, incrementStreak, resetStreak, setScorePopup } = useStreakTracking();

  const slicePathRef = useRef<{ x: number; y: number }[]>([]);
  const fruitIdRef = useRef(0);

  const { playClick, playPop, playCelebration } = useAudio();
  const { completeGame } = useGameCompletion('fruit-ninja-air');
  const levelConfig = LEVELS[currentLevel - 1];

  useGameSessionProgress({
    gameName: 'Fruit Ninja Air',
    score,
    level: currentLevel,
    isPlaying: gameState === 'playing',
    metaData: { sliced: slicedCount, target: levelConfig.fruitsToSlice, streak },
  });

  const webcamRef = useRef<Webcam>(null);
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const [cursor, setCursor] = useState<Point | null>(null);
  const [isHandDetected, setIsHandDetected] = useState(false);
  const lastHandStateRef = useRef(false);
  const { speak } = useVoiceInstructions();

  const pushSlicePoint = useCallback((x: number, y: number) => {
    slicePathRef.current.push({ x, y });
    if (slicePathRef.current.length > 10) slicePathRef.current.shift();

    // Check slice logic immediately since mouse events and hand frames come in fast
    setFruits((prevFruits) => {
      const { sliced, remaining } = checkSlice(prevFruits, slicePathRef.current);
      if (sliced.length > 0) {
        playPop();

        const newStreak = incrementStreak(sliced.length);
        const basePoints = 10 * sliced.length;
        const streakBonus = Math.min(newStreak * 2, 15);
        const totalPoints = basePoints + streakBonus;
        setScore((prev) => prev + totalPoints);

        if (slicePathRef.current.length > 0) {
          const lastPoint = slicePathRef.current[slicePathRef.current.length - 1];
          setScorePopup({
            points: totalPoints,
            x: (lastPoint.x / CANVAS_WIDTH) * 100,
            y: (lastPoint.y / CANVAS_HEIGHT) * 100
          });
        }

        triggerHaptic('success');
        if (newStreak > 0 && newStreak % 5 === 0) {
          triggerHaptic('celebration');
        }

        setSlicedCount((prev) => prev + sliced.length);
        return remaining;
      }
      return prevFruits;
    });
  }, [incrementStreak, playPop, setScorePopup]);

  const handleHandFrame = useCallback((frame: TrackedHandFrame) => {
    if (gameState !== 'playing') return;
    const tip = frame.indexTip;

    if (tip) {
      setCursor({ x: tip.x, y: tip.y });
      // Scale from [0..1] proportional to internal canvas
      pushSlicePoint(tip.x * CANVAS_WIDTH, tip.y * CANVAS_HEIGHT);

      if (!lastHandStateRef.current) {
        setIsHandDetected(true);
        lastHandStateRef.current = true;
        speak("I see your hand! Keep slicing!");
      }
    } else {
      if (lastHandStateRef.current) {
        // Clear the slice path if the hand vanishes
        slicePathRef.current = [];
        setIsHandDetected(false);
        lastHandStateRef.current = false;
        speak("I can't see your hand! Show it to the camera!");
      }
    }
  }, [gameState, pushSlicePoint, speak]);

  const { isReady, isLoading, startTracking } = useGameHandTracking({
    gameName: 'FruitNinjaAir',
    isRunning: gameState === 'playing',
    webcamRef,
    onFrame: handleHandFrame,
  });

  useEffect(() => {
    if (gameState === 'playing' && !isReady && !isLoading) {
      void startTracking();
    }
  }, [gameState, isReady, isLoading, startTracking]);

  // Check complete state safely
  useEffect(() => {
    if (gameState === 'playing' && slicedCount >= levelConfig.fruitsToSlice) {
      setGameState('complete');
      playCelebration();
      speak("Incredible! You are a master fruit ninja!");
    }
  }, [gameState, slicedCount, levelConfig.fruitsToSlice, playCelebration, speak]);

  useEffect(() => {
    if (gameState !== 'playing') return;
    const spawner = setInterval(() => {
      if (fruits.length < 8) {
        setFruits((prev) => [...prev, spawnFruit(fruitIdRef.current++, CANVAS_WIDTH, CANVAS_HEIGHT)]);
      }
    }, levelConfig.spawnRate);
    return () => clearInterval(spawner);
  }, [gameState, fruits.length, levelConfig.spawnRate]);

  // Combined physics + canvas render loop using rAF instead of setInterval
  // This avoids setInterval(16ms) calling setFruits() 60x/sec which caused
  // React re-render + canvas repaint on every tick.
  const fruitsRef = useRef<Fruit[]>(fruits);
  fruitsRef.current = fruits;

  useEffect(() => {
    if (gameState !== 'playing') return;
    let rafId: number;

    const renderLoop = () => {
      // Update physics via ref to avoid React re-render per frame
      const updated = updateFruits(fruitsRef.current, CANVAS_HEIGHT, 0.4);

      // Decay slice trail when hand isn't moving
      if (slicePathRef.current.length > 0) {
        slicePathRef.current.shift();
      }

      // Only push state update if array length changed (fruit expired off-screen)
      if (updated.length !== fruitsRef.current.length) {
        setFruits(updated);
      }
      fruitsRef.current = updated;

      // Canvas render directly — no React dependency
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
          ctx.fillStyle = '#87CEEB';
          ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

          // Draw slice path
          if (slicePathRef.current.length > 1) {
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.lineWidth = 12;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.beginPath();
            ctx.moveTo(slicePathRef.current[0].x, slicePathRef.current[0].y);
            for (let i = 1; i < slicePathRef.current.length; i++) {
              ctx.lineTo(slicePathRef.current[i].x, slicePathRef.current[i].y);
            }
            ctx.stroke();

            ctx.strokeStyle = '#60A5FA';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(slicePathRef.current[0].x, slicePathRef.current[0].y);
            for (let i = 1; i < slicePathRef.current.length; i++) {
              ctx.lineTo(slicePathRef.current[i].x, slicePathRef.current[i].y);
            }
            ctx.stroke();
          }

          updated.forEach((fruit) => {
            ctx.save();
            ctx.translate(fruit.x, fruit.y);
            ctx.rotate(fruit.rotation * Math.PI);
            ctx.font = '60px serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(fruit.emoji, 0, 0);
            ctx.restore();
          });
        }
      }

      rafId = requestAnimationFrame(renderLoop);
    };

    rafId = requestAnimationFrame(renderLoop);
    return () => cancelAnimationFrame(rafId);
  }, [gameState]);

  const handlePointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    // Basic fallback support
    if (gameState !== 'playing') return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) * (CANVAS_WIDTH / rect.width);
    const y = (event.clientY - rect.top) * (CANVAS_HEIGHT / rect.height);
    pushSlicePoint(x, y);
  };

  const handleStart = () => {
    playClick();
    setGameState('playing');
    setFruits([]);
    setSlicedCount(0);
    setScore(0);
    resetStreak();
    fruitIdRef.current = 0;
    slicePathRef.current = [];
    speak("Wave your hands to slice the flying fruit!");
  };

  const handleLevelChange = (level: number) => { playClick(); setCurrentLevel(level); };
  const handleFinish = useCallback(async () => {
    playClick();
    const finalScore = Math.round(score / 10);
    await completeGame({ score: finalScore, level: currentLevel });
    navigate('/games');
  }, [score, completeGame, navigate, playClick, currentLevel]);

  return (
    <GameContainer title="Fruit Ninja Air" onHome={() => navigate('/games')} reportSession={false} webcamRef={webcamRef} isHandDetected={isHandDetected}>
      <div ref={gameAreaRef} className="flex flex-col items-center gap-4 p-4 touch-none select-none relative">

        <CameraThumbnail webcamRef={webcamRef} isHandDetected={isHandDetected} visible={gameState === 'playing'} />

        {gameState === 'playing' && (
          <HandTrackingStatus
            isHandDetected={isHandDetected}
            pauseOnHandLost={true}
            voicePrompt={true}
            showMascot={true}
          />
        )}

        <div className="flex gap-2 relative z-10">
          {LEVELS.map((l) => (
            <button type="button" key={l.level} onClick={() => handleLevelChange(l.level)}
              className={`px-4 py-2 rounded-full font-black text-sm transition-all ${currentLevel === l.level ? 'bg-green-500 text-white shadow-[0_2px_0_#15803D]' : 'bg-white border-2 border-green-200 hover:border-green-400 text-slate-700'}`}>
              Level {l.level}
            </button>
          ))}
        </div>

        {gameState === 'start' && (
          <div className="text-center bg-white/80 p-12 rounded-[2rem] border-4 border-green-300 shadow-xl max-w-xl mx-auto mt-10">
            <p className="text-[6rem] mb-4">🍉</p>
            <h2 className="text-4xl font-black mb-4 text-green-600">Fruit Ninja Air!</h2>
            <p className="mb-6 text-xl font-bold text-slate-600">Wave your hands to slice the fruits as they fly up!</p>
            <br />
            <GameStartButton
              onClick={handleStart}
              text="SLICE"
            />
            <br />
            <VoiceInstructions
              instructions="Let's be a fruit ninja! Slice the flying fruit with your hands!"
              autoSpeak={true}
              showReplayButton={true}
            />
          </div>
        )}

        {gameState === 'playing' && (
          <>
            <div className="relative w-full max-w-2xl mx-auto aspect-[4/3]">
              <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT}
                onPointerMove={handlePointerMove}
                className="w-full h-full touch-none cursor-crosshair rounded-[2rem] shadow-2xl border-4 border-green-300 object-cover bg-sky-300"
              />

              {/* Score Popup */}
              {scorePopup && (
                <motion.div
                  initial={{ opacity: 1, y: 0, scale: 1 }}
                  animate={{ opacity: 0, y: -50, scale: 1.2 }}
                  transition={{ duration: 0.7, ease: 'easeOut' }}
                  className="absolute pointer-events-none z-20"
                  style={{
                    left: `${scorePopup.x}%`,
                    top: `${scorePopup.y}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                >
                  <div className="text-4xl font-black text-white drop-shadow-[0_4px_4px_rgba(34,197,94,0.8)] stroke-green-600" style={{ WebkitTextStroke: '2px #166534' }}>
                    +{scorePopup.points}
                  </div>
                </motion.div>
              )}

              {/* Streak Milestone */}
              <AnimatePresence>
                {showMilestone && (
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0, rotate: 180 }}
                    className="absolute inset-0 flex items-center justify-center pointer-events-none z-30"
                  >
                    <div className="bg-gradient-to-r from-orange-400 to-red-500 text-white px-8 py-4 rounded-[2rem] font-black text-4xl shadow-2xl border-4 border-white">
                      🔥 {streak} Streak! 🔥
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="absolute top-0 left-0 right-0 z-10 px-4 pt-2">
              <GameHUD
                score={score}
                streak={streak}
                level={currentLevel}
                progressPercentage={(slicedCount / levelConfig.fruitsToSlice) * 100}
                rightHeaderContent={
                  <div className="bg-white/90 backdrop-blur-sm px-4 py-1.5 rounded-xl font-black border-2 border-slate-200 text-slate-600 shadow-sm">
                    🍎 {slicedCount} / {levelConfig.fruitsToSlice}
                  </div>
                }
              />
            </div>
          </>
        )}

        {gameState === 'complete' && (
          <div className="text-center bg-white p-12 rounded-[2rem] border-4 border-green-300 shadow-xl max-w-xl mx-auto mt-10">
            <p className="text-6xl mb-4">🎉</p>
            <h2 className="text-4xl font-black mb-2 text-green-600">Fruit Master!</h2>
            <p className="text-xl font-bold text-slate-600 mb-6">You sliced {slicedCount} fruits beautifully!</p>
            <div className="bg-slate-100 rounded-2xl p-6 mb-8 inline-block">
              <p className="text-lg font-bold text-slate-500 mb-1">Final Score</p>
              <p className="text-5xl font-black text-slate-800">{score}</p>
            </div>
            <div className="flex gap-4 justify-center">
              <button type="button" onClick={handleFinish} className="px-8 py-4 bg-slate-200 border-2 border-slate-300 hover:bg-slate-300 text-slate-700 rounded-2xl font-black text-xl transition-all">Finish</button>
              <button type="button" onClick={handleStart} className="px-8 py-4 bg-green-500 hover:bg-green-600 text-white rounded-2xl font-black text-xl shadow-[0_4px_0_#15803D] active:translate-y-1 active:shadow-none">Play Again</button>
            </div>
          </div>
        )}

      {cursor && (
        <GameCursor
          position={cursor}
          coordinateSpace="normalized"
          containerRef={gameAreaRef}
          isPinching={false}
          isHandDetected={true}
          size={64}
          color="#22c55e"
        />
      )}
      </div>
    </GameContainer>
  );
});

// Main export wrapped with GameShell
export const FruitNinjaAir = memo(function FruitNinjaAirComponent() {
  return (
    <GameShell
      gameId="fruit-ninja-air"
      gameName="Fruit Ninja Air"
      showWellnessTimer={true}
      enableErrorBoundary={true}
    >
      <FruitNinjaAirGame />
    </GameShell>
  );
});
