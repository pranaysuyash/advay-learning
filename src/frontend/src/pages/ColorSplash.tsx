import { useCallback, useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GameContainer } from '../components/GameContainer';
import { GameShell } from '../components/GameShell';
import { GameCursor } from '../components/game/GameCursor';
import { CursorEmbodiment } from '../components/game/CursorEmbodiment';
import { useAudio } from '../utils/hooks/useAudio';
import { useGameCompletion } from '../hooks/useGameCompletion';
import { useGameSessionProgress } from '../hooks/useGameSessionProgress';
import { useStreakTracking } from '../hooks/useStreakTracking';
import { useGameHandTracking } from '../hooks/useGameHandTracking';
import { triggerHaptic } from '../utils/haptics';
import type { Point } from '../types/tracking';
import type { HandTrackingRuntimeMeta } from '../hooks/useHandTrackingRuntime';
import type { TrackedHandFrame } from '../utils/handTrackingFrame';
import {
  LEVELS,
  generateObjects,
  splashObject,
  COLORS,
  ColorObject,
  ColorName,
} from '../games/colorSplashLogic';

function ColorSplashContent() {
  const navigate = useNavigate();
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const [currentLevel, _setCurrentLevel] = useState(1);
  const [objects, setObjects] = useState<ColorObject[]>([]);
  const [targetColor, setTargetColor] = useState<ColorName>('red');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameState, setGameState] = useState<'start' | 'playing' | 'complete'>(
    'start',
  );
  const [correct, setCorrect] = useState(0);
  const [cursor, setCursor] = useState<Point | null>(null);
  const [isHandTrackingActive, setIsHandTrackingActive] = useState(false);

  // Streak tracking
  const { streak, showMilestone, incrementStreak, resetStreak } =
    useStreakTracking();

  const timerRef = useRef<number | null>(null);

  // Refs for closure access in handleFrame
  const objectsRef = useRef(objects);
  const targetColorRef = useRef(targetColor);
  const scoreRef = useRef(score);

  useEffect(() => {
    objectsRef.current = objects;
  }, [objects]);
  useEffect(() => {
    targetColorRef.current = targetColor;
  }, [targetColor]);
  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  const { playClick, playSuccess, playError, playPop } = useAudio();
  const { completeGame } = useGameCompletion('color-splash');
  useGameSessionProgress({
    gameName: 'Color Splash',
    score,
    level: currentLevel,
    isPlaying: gameState === 'playing',
  });

  const level = LEVELS.find((l) => l.id === currentLevel) || LEVELS[0];

  const startGame = useCallback(() => {
    const { objects: newObjects, targetColor: newTarget } =
      generateObjects(level);
    setObjects(newObjects);
    setTargetColor(newTarget);
    setScore(0);
    setCorrect(0);
    resetStreak();
    setTimeLeft(level.timeLimit);
    setGameState('playing');
    playClick();
  }, [level, playClick, resetStreak]);

  const handleObjectClick = useCallback(
    (objectId: number) => {
      if (gameState !== 'playing') return;

      const result = splashObject(objects, objectId, targetColor);

      if (result.correct) {
        // Streak and scoring
        const newStreak = incrementStreak();
        const streakBonus = Math.min(newStreak * 3, 20);

        playPop();
        triggerHaptic('success');
        setObjects((prev) =>
          prev.map((o) => (o.id === objectId ? { ...o, splashed: true } : o)),
        );
        setCorrect((c) => c + 1);
        setScore((s) => s + result.scoreDelta + streakBonus);

        if (result.allSplashed) {
          setGameState('complete');
          completeGame({ score: score + 50 + streakBonus });
          playSuccess();
        }
      } else {
        playError();
        triggerHaptic('error');
        resetStreak();
        setScore((s) => Math.max(s + result.scoreDelta, 0));
      }
    },
    [
      gameState,
      objects,
      targetColor,
      score,
      completeGame,
      playPop,
      playError,
      playSuccess,
    ],
  );

  const handleBack = useCallback(() => {
    navigate('/games');
  }, [navigate]);

  // Hand tracking frame handler
  const handleFrame = useCallback(
    (frame: TrackedHandFrame, _meta: HandTrackingRuntimeMeta) => {
      const tip = frame.indexTip;
      if (!tip) {
        setCursor(null);
        setIsHandTrackingActive(false);
        return;
      }
      setCursor(tip);
      setIsHandTrackingActive(true);

      // Check for pinch to splash
      if (frame.pinch.transition !== 'start') return;

      // Find object under cursor
      const currentObjects = objectsRef.current;
      const hitObject = currentObjects.find((obj) => {
        if (obj.splashed) return false;
        const dx = tip.x - obj.x / 100;
        const dy = tip.y - obj.y / 100;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < 0.08; // 8% radius
      });

      if (hitObject) {
        handleObjectClick(hitObject.id);
      }
    },
    [handleObjectClick],
  );

  // Initialize hand tracking
  const {
    isLoading: isModelLoading,
    isReady: isHandTrackingReady,
    startTracking,
    webcamRef,
  } = useGameHandTracking({
    gameName: 'ColorSplash',
    targetFps: 30,
    isRunning: gameState === 'playing',
    onFrame: handleFrame,
    onNoVideoFrame: () => setCursor(null),
  });

  // Start tracking when game starts
  useEffect(() => {
    if (gameState === 'playing' && !isHandTrackingReady && !isModelLoading) {
      void startTracking();
    }
  }, [gameState, isHandTrackingReady, isModelLoading, startTracking]);

  useEffect(() => {
    if (gameState === 'playing') {
      timerRef.current = window.setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1) {
            setGameState('complete');
            completeGame({ score });
            playSuccess();
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [gameState, score, completeGame, playSuccess]);

  return (
    <GameContainer
      title='Color Splash'
      onHome={handleBack}
      reportSession={false}
      webcamRef={webcamRef}
      isHandDetected={isHandTrackingReady}
      isPlaying={gameState === 'playing'}
    >
      <div
        ref={gameAreaRef}
        className='relative w-full h-full bg-gradient-to-b from-amber-50 to-orange-100 rounded-lg overflow-hidden'
      >
        {gameState === 'start' && (
          <div className='absolute inset-0 flex flex-col items-center justify-center z-10'>
            <h2 className='text-4xl font-bold text-orange-600 mb-4'>
              Color Splash!
            </h2>
            <p className='text-lg text-orange-700 mb-2 text-center px-4'>
              Splash all the{' '}
              <span
                className='font-bold text-2xl'
                style={{ color: COLORS[targetColor].hex }}
              >
                {targetColor}
              </span>{' '}
              items!
            </p>
            <p className='text-sm text-orange-500 mb-8'>
              Tap the right colors to splash them!
            </p>
            <button
              type='button'
              onClick={startGame}
              className='px-8 py-4 bg-orange-500 text-white text-xl font-bold rounded-full shadow-lg hover:bg-orange-600 transition-colors'
            >
              Start Splashing!
            </button>
          </div>
        )}

        {gameState === 'complete' && (
          <div className='absolute inset-0 flex flex-col items-center justify-center z-10'>
            <h2 className='text-4xl font-bold text-green-600 mb-4'>Amazing!</h2>
            <p className='text-2xl text-green-700 mb-2'>
              You splashed {correct} items!
            </p>
            <p className='text-xl text-green-600 mb-8'>Score: {score}</p>
            <button
              type='button'
              onClick={handleBack}
              className='px-8 py-4 bg-green-500 text-white text-xl font-bold rounded-full shadow-lg hover:bg-green-600 transition-colors'
            >
              Play More Games!
            </button>
          </div>
        )}

        {gameState === 'playing' && (
          <>
            <div className='absolute top-4 left-4 bg-white/90 rounded-xl px-6 py-3 shadow-lg'>
              <p className='text-lg font-bold'>
                Splash:{' '}
                <span
                  className='text-2xl'
                  style={{ color: COLORS[targetColor].hex }}
                >
                  {targetColor.toUpperCase()}
                </span>
              </p>
            </div>

            <div className='absolute top-4 right-4 bg-white/90 rounded-lg px-4 py-2'>
              <p className='text-lg font-bold text-orange-500'>
                Time: {timeLeft}s
              </p>
            </div>

            <div className='absolute bottom-4 left-4 bg-white/80 rounded-lg px-4 py-2'>
              <p className='text-sm text-gray-600'>Score: {score}</p>
            </div>

            {streak > 0 && (
              <div className='absolute bottom-4 right-4 bg-orange-100 rounded-lg px-4 py-2 border-2 border-orange-200'>
                <p className='text-sm text-orange-600 font-bold'>🔥 {streak}</p>
              </div>
            )}

            {/* Streak Milestone Overlay */}
            {showMilestone && (
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: 180 }}
                className='absolute inset-0 flex items-center justify-center pointer-events-none z-20'
              >
                <div className='bg-gradient-to-r from-orange-400 to-red-500 text-white px-6 py-3 rounded-full font-bold text-xl shadow-lg'>
                  🔥 {streak} Streak! 🔥
                </div>
              </motion.div>
            )}

            {/* Hand tracking cursor */}
            {cursor && (
              <GameCursor
                position={cursor}
                coordinateSpace='normalized'
                containerRef={gameAreaRef}
                isPinching={false}
                isHandDetected={true}
                size={84}
                color='#f97316'
              />
            )}

            <CursorEmbodiment
              position={cursor ?? { x: 0.5, y: 0.5 }}
              coordinateSpace='normalized'
              containerRef={gameAreaRef}
              isHandDetected={isHandTrackingActive}
              isPinching={false}
              gameName='ColorSplash'
            />

            {objects.map((obj) => (
              <button
                key={obj.id}
                type='button'
                onClick={() => handleObjectClick(obj.id)}
                disabled={obj.splashed}
                className={`absolute flex items-center justify-center text-4xl transition-all duration-300 ${
                  obj.splashed
                    ? 'opacity-0 scale-150 pointer-events-none'
                    : 'hover:scale-110 active:scale-95'
                }`}
                style={{
                  left: `${obj.x}%`,
                  top: `${obj.y}%`,
                  transform: 'translate(-50%, -50%)',
                  width: obj.size,
                  height: obj.size,
                }}
              >
                {obj.emoji}
              </button>
            ))}
          </>
        )}
      </div>
    </GameContainer>
  );
}

export const ColorSplash = () => (
  <GameShell
    gameId='color-splash'
    gameName='Color Splash'
    showWellnessTimer={true}
    enableErrorBoundary={true}
  >
    <ColorSplashContent />
  </GameShell>
);

export default ColorSplash;
