/**
 * Letter Catcher Game
 *
 * @ticket GQ-002, GQ-003, GQ-004, GQ-005, GQ-007
 */

import { memo, useCallback, useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Webcam from 'react-webcam';
import { GameContainer } from '../components/GameContainer';
import { GameShell } from '../components/GameShell';
import { useAudio } from '../utils/hooks/useAudio';
import { useGameCompletion } from '../hooks/useGameCompletion';
import { useStreakTracking } from '../hooks/useStreakTracking';
import { GameHUD } from '../components/game/GameHUD';
import { useGameSessionProgress } from '../hooks/useGameSessionProgress';
import { triggerHaptic } from '../utils/haptics';
import { useGameHandTracking } from '../hooks/useGameHandTracking';
import type { TrackedHandFrame } from '../types/tracking';
import { GameCursor } from '../components/game/GameCursor';
import type { Point } from '../types/tracking';
import { CameraThumbnail } from '../components/game/CameraThumbnail';
import { HandTrackingStatus } from '../components/game/HandTrackingStatus';
import {
  LEVELS,
  spawnLetter,
  updatePositions,
  checkCatch,
  type FallingLetter,
} from '../games/letterCatcherLogic';

const LetterCatcherGame = memo(function LetterCatcherGameComponent() {
  const navigate = useNavigate();
  const [currentLevel, setCurrentLevel] = useState(1);
  const [letters, setLetters] = useState<FallingLetter[]>([]);
  const [targetLetter, setTargetLetter] = useState('A');
  const [bucketX, setBucketX] = useState(175);
  const [score, setScore] = useState(0);
  const [caught, setCaught] = useState(0);
  const [missed, setMissed] = useState(0);
  const [gameState, setGameState] = useState<'start' | 'playing' | 'complete'>(
    'start',
  );

  // Streak tracking
  const { streak, showMilestone, scorePopup, incrementStreak, resetStreak, setScorePopup } = useStreakTracking();

  const webcamRef = useRef<Webcam>(null);
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const [cursor, setCursor] = useState<Point | null>(null);
  const [isHandDetected, setIsHandDetected] = useState(false);
  const lastHandStateRef = useRef(false);
  const lastCatchTimeRef = useRef(0);
  const lettersRef = useRef(letters);
  lettersRef.current = letters;

  const letterIdRef = useRef(0);

  const { playClick, playSuccess, playError } = useAudio();
  const { completeGame } = useGameCompletion('letter-catcher');
  useGameSessionProgress({
    gameName: 'Letter Catcher',
    score,
    level: currentLevel,
    isPlaying: true,
    metaData: { caught, missed },
  });

  const startGame = () => {
    setTargetLetter(LETTERS[Math.floor(Math.random() * LETTERS.length)]);
    setLetters([]);
    setScore(0);
    setCaught(0);
    setMissed(0);
    resetStreak();
    setGameState('playing');
    letterIdRef.current = 0;
  };

  // Combined physics + spawn loop using rAF with ref-based state
  // Replaces dual setInterval(50ms physics + spawn) that drove React state 20x/sec
  const lastSpawnTimeRef = useRef(0);
  const lastPhysicsTimeRef = useRef(0);

  useEffect(() => {
    if (gameState !== 'playing') return;
    let rafId: number;
    const config = LEVELS[currentLevel - 1];
    lastSpawnTimeRef.current = performance.now();
    lastPhysicsTimeRef.current = performance.now();

    const loop = (now: number) => {
      // Physics at ~50ms intervals
      if (now - lastPhysicsTimeRef.current >= 50) {
        lastPhysicsTimeRef.current = now;
        const current = lettersRef.current;
        const updated = updatePositions(current, config.speed);
        const missedLetters = updated.filter((l) => l.y > 300);
        if (missedLetters.length > 0) {
          setMissed((m) => m + missedLetters.length);
          playError();
        }
        const alive = updated.filter((l) => l.y <= 300);
        if (alive.length !== current.length || missedLetters.length > 0) {
          setLetters(alive);
        }
        lettersRef.current = alive;
      }

      // Spawn at configured rate
      if (now - lastSpawnTimeRef.current >= config.spawnRate) {
        lastSpawnTimeRef.current = now;
        const newLetter = spawnLetter(letterIdRef.current++);
        setLetters((prev) => [...prev, newLetter]);
      }

      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, [gameState, currentLevel, playError]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (gameState !== 'playing') return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    setBucketX(Math.max(20, Math.min(330, x)));
    const caughtLetter = letters.find((l) => checkCatch(l, x));
    if (caughtLetter) {
      if (caughtLetter.letter === targetLetter) {
        playSuccess();
        const newStreak = incrementStreak();
        const basePoints = 10;
        const streakBonus = Math.min(newStreak * 2, 15);
        const totalPoints = basePoints + streakBonus;
        setScorePopup({ points: totalPoints, x: caughtLetter.x, y: caughtLetter.y });
        triggerHaptic('success');
        if (newStreak > 0 && newStreak % 5 === 0) {
          triggerHaptic('celebration');
        }
        setCaught((prevCaught) => {
          const nextCaught = prevCaught + 1;
          if (nextCaught > 5) {
            setGameState('complete');
          }
          return nextCaught;
        });
        setScore((s) => s + totalPoints);
      } else {
        playError();
        resetStreak();
        triggerHaptic('error');
        setScore((s) => Math.max(s - 10, 0));
      }
      setLetters((prev) => prev.filter((l) => l.id !== caughtLetter.id));
    }
  };

  const handleStart = () => {
    playClick();
    startGame();
  };
  const handleFinish = useCallback(async () => {
    playClick();
    await completeGame({ score: caught, level: currentLevel });
    navigate('/games');
  }, [caught, completeGame, navigate, playClick, currentLevel]);

  // Hand tracking frame handler
  const handleHandFrame = useCallback(
    (frame: TrackedHandFrame) => {
      if (gameState !== 'playing') return;
      const tip = frame.indexTip;

      // Update hand detection state on transition
      const detected = tip !== null;
      if (detected !== lastHandStateRef.current) {
        lastHandStateRef.current = detected;
        setIsHandDetected(detected);
      }

      if (!tip) return;

      setCursor({ x: tip.x, y: tip.y });

      // Convert normalized coords to game area (350px wide, bucket 20-330)
      const x = tip.x * 350;
      setBucketX(Math.max(20, Math.min(330, x)));

      // Debounce catches to avoid duplicate between hand + mouse
      const now = Date.now();
      if (now - lastCatchTimeRef.current < 200) return;

      const currentLetters = lettersRef.current;
      const caughtLetter = currentLetters.find((l) => checkCatch(l, x));
      if (caughtLetter) {
        lastCatchTimeRef.current = now;
        if (caughtLetter.letter === targetLetter) {
          playSuccess();
          const newStreak = incrementStreak();
          const basePoints = 10;
          const streakBonus = Math.min(newStreak * 2, 15);
          const totalPoints = basePoints + streakBonus;
          setScorePopup({ points: totalPoints, x: caughtLetter.x, y: caughtLetter.y });
          triggerHaptic('success');
          if (newStreak > 0 && newStreak % 5 === 0) {
            triggerHaptic('celebration');
          }
          setCaught((prevCaught) => {
            const nextCaught = prevCaught + 1;
            if (nextCaught > 5) {
              setGameState('complete');
            }
            return nextCaught;
          });
          setScore((s) => s + totalPoints);
        } else {
          playError();
          resetStreak();
          triggerHaptic('error');
          setScore((s) => Math.max(s - 10, 0));
        }
        setLetters((prev) => prev.filter((l) => l.id !== caughtLetter.id));
      }
    },
    [gameState, targetLetter, playSuccess, playError, incrementStreak, resetStreak, setScorePopup],
  );

  const { isReady, isLoading, startTracking } = useGameHandTracking({
    gameName: 'LetterCatcher',
    webcamRef,
    onFrame: handleHandFrame,
    isRunning: gameState === 'playing',
  });

  // Auto-start hand tracking when game begins
  useEffect(() => {
    if (gameState === 'playing' && !isReady && !isLoading) {
      void startTracking();
    }
  }, [gameState, isReady, isLoading, startTracking]);

  const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  return (
    <GameContainer
      title='Letter Catcher'
      onHome={() => navigate('/games')}
      reportSession={false}
      webcamRef={webcamRef}
      isHandDetected={isHandDetected}
    >
      <div ref={gameAreaRef} className='flex flex-col items-center gap-4 p-4 relative'>
        <div className='flex gap-2'>
          {LEVELS.map((l) => (
            <button
              type='button'
              key={l.level}
              onClick={() => {
                playClick();
                setCurrentLevel(l.level);
              }}
              className={`px-4 py-2 rounded-full font-bold ${currentLevel === l.level ? 'bg-amber-500 text-white' : 'bg-gray-200'}`}
            >
              Level {l.level}
            </button>
          ))}
        </div>

        {gameState === 'start' && (
          <div className='text-center'>
            <p className='text-6xl mb-4'>🪣</p>
            <h2 className='text-2xl font-bold mb-2'>Letter Catcher!</h2>
            <p className='mb-4'>
              Catch the letter:{' '}
              <span className='text-amber-600 font-bold'>{targetLetter}</span>
            </p>
            <button
              type='button'
              onClick={handleStart}
              className='px-8 py-4 bg-amber-500 text-white rounded-2xl font-bold text-xl'
            >
              Start!
            </button>
          </div>
        )}

        {gameState === 'playing' && (
          <div
            className='relative w-80 h-100 bg-slate-100 rounded-xl overflow-hidden cursor-crosshair'
            onMouseMove={handleMouseMove}
          >
            <GameHUD
              score={score}
              streak={streak}
              level={currentLevel}
              levelInfo={`Catch: ${targetLetter}`}
              showHearts={true}
            />
            <AnimatePresence>
              {scorePopup && (
                <motion.div
                  initial={{ opacity: 1, y: scorePopup.y || 0, x: scorePopup.x || 0, scale: 1 }}
                  animate={{ opacity: 0, y: (scorePopup.y || 0) - 40, scale: 1.2 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.7, ease: 'easeOut' }}
                  className='absolute text-green-600 font-bold text-lg pointer-events-none'
                  style={{ left: scorePopup.x || 0, top: scorePopup.y || 0 }}
                >
                  +{scorePopup.points}
                </motion.div>
              )}
            </AnimatePresence>
            <AnimatePresence>
              {showMilestone && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  transition={{ duration: 0.3 }}
                  className='absolute inset-0 flex items-center justify-center pointer-events-none z-10'
                >
                  <div className='bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-2xl font-bold text-2xl shadow-lg flex items-center gap-2'>
                    <span className='text-3xl'>🔥</span>
                    <span>{streak} STREAK!</span>
                    <span className='text-3xl'>🔥</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            {letters.map((letter) => (
              <div
                key={letter.id}
                className='absolute text-3xl font-bold'
                style={{ left: letter.x, top: letter.y }}
              >
                {letter.letter}
              </div>
            ))}
            <div className='absolute bottom-2 left-0 right-0 flex justify-center'>
              <div className='text-4xl'>🪣</div>
            </div>
            <div className='absolute bottom-2' style={{ left: bucketX }}>
              👆
            </div>
            <CameraThumbnail webcamRef={webcamRef} isHandDetected={isHandDetected} visible={gameState === 'playing'} />
            <HandTrackingStatus isHandDetected={isHandDetected} compact />
          </div>
        )}

        {gameState === 'complete' && (
          <div className='text-center'>
            <p className='text-6xl mb-4'>🎉</p>
            <h2 className='text-2xl font-bold mb-2'>Great Job!</h2>
            <p className='text-xl mb-4'>Caught {caught} letters!</p>
            {streak > 0 && (
              <p className='text-lg mb-2 text-orange-500 font-bold'>
                🔥 Best Streak: {streak}
              </p>
            )}
            <p className='text-2xl font-bold text-green-600 mb-4'>
              Score: {score}
            </p>
            <button
              type='button'
              onClick={handleStart}
              className='px-6 py-3 bg-amber-500 text-white rounded-xl font-bold mr-4'
            >
              Play Again
            </button>
            <button
              type='button'
              onClick={handleFinish}
              className='px-6 py-3 bg-gray-200 rounded-xl font-bold'
            >
              Finish
            </button>
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
export const LetterCatcher = memo(function LetterCatcherComponent() {
  return (
    <GameShell
      gameId="letter-catcher"
      gameName="Letter Catcher"
      showWellnessTimer={true}
      enableErrorBoundary={true}
    >
      <LetterCatcherGame />
    </GameShell>
  );
});
