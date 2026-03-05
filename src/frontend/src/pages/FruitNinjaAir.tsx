/**
 * Fruit Ninja Air Game
 *
 * @ticket GQ-002, GQ-003, GQ-004, GQ-005, GQ-007
 */

import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GameContainer } from '../components/GameContainer';
import { GameShell } from '../components/GameShell';
import { useAudio } from '../utils/hooks/useAudio';
import { useGameDrops } from '../hooks/useGameDrops';
import { useGameSessionProgress } from '../hooks/useGameSessionProgress';
import { triggerHaptic } from '../utils/haptics';
import { LEVELS, spawnFruit, updateFruits, checkSlice, type Fruit } from '../games/fruitNinjaAirLogic';
import { STREAK_MILESTONE_INTERVAL, STREAK_MILESTONE_DURATION_MS } from '../games/constants';

const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 500;

const FruitNinjaAirGame = memo(function FruitNinjaAirGameComponent() {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [fruits, setFruits] = useState<Fruit[]>([]);
  const [slicedCount, setSlicedCount] = useState(0);
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState<'start' | 'playing' | 'complete'>('start');
  const [streak, setStreak] = useState(0);
  const [scorePopup, setScorePopup] = useState<{ points: number; x: number; y: number } | null>(null);
  const [showStreakMilestone, setShowStreakMilestone] = useState(false);
  const slicePathRef = useRef<{ x: number; y: number }[]>([]);
  const fruitIdRef = useRef(0);

  const { playClick, playPop, playCelebration } = useAudio();
  const { onGameComplete } = useGameDrops('fruit-ninja-air');
  const levelConfig = LEVELS[currentLevel - 1];

  useGameSessionProgress({
    gameName: 'Fruit Ninja Air',
    score,
    level: currentLevel,
    isPlaying: gameState === 'playing',
    metaData: { sliced: slicedCount, target: levelConfig.fruitsToSlice },
  });

  useEffect(() => {
    if (gameState !== 'playing') return;
    const spawner = setInterval(() => {
      if (fruits.length < 8) {
        const newFruit = spawnFruit(fruitIdRef.current++, CANVAS_WIDTH);
        setFruits((prev) => [...prev, newFruit]);
      }
    }, levelConfig.spawnRate);
    return () => clearInterval(spawner);
  }, [gameState, fruits.length, levelConfig.spawnRate]);

  useEffect(() => {
    if (gameState !== 'playing') return;
    const loop = setInterval(() => {
      setFruits((prev) => updateFruits(prev, CANVAS_HEIGHT));
    }, 16);
    return () => clearInterval(loop);
  }, [gameState]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(1, '#228B22');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    fruits.forEach((fruit) => {
      ctx.save();
      ctx.translate(fruit.x, fruit.y);
      ctx.rotate(fruit.rotation);
      ctx.font = '40px serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(fruit.emoji, 0, 0);
      ctx.restore();
    });

    if (slicePathRef.current.length > 1) {
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(slicePathRef.current[0].x, slicePathRef.current[0].y);
      for (let i = 1; i < slicePathRef.current.length; i++) {
        ctx.lineTo(slicePathRef.current[i].x, slicePathRef.current[i].y);
      }
      ctx.stroke();
    }
  }, [fruits]);

  const handlePointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (gameState !== 'playing') return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) * (CANVAS_WIDTH / rect.width);
    const y = (event.clientY - rect.top) * (CANVAS_HEIGHT / rect.height);

    slicePathRef.current.push({ x, y });
    if (slicePathRef.current.length > 10) slicePathRef.current.shift();

    const { sliced, remaining } = checkSlice(fruits, slicePathRef.current);
    if (sliced.length > 0) {
      playPop();
      
      // Streak and scoring
      const newStreak = streak + sliced.length;
      setStreak(newStreak);
      const basePoints = 10 * sliced.length;
      const streakBonus = Math.min(newStreak * 2, 15);
      const totalPoints = basePoints + streakBonus;
      setScore((prev) => prev + totalPoints);
      
      // Show popup at slice position
      if (slicePathRef.current.length > 0) {
        const lastPoint = slicePathRef.current[slicePathRef.current.length - 1];
        setScorePopup({ 
          points: totalPoints, 
          x: (lastPoint.x / CANVAS_WIDTH) * 100, 
          y: (lastPoint.y / CANVAS_HEIGHT) * 100 
        });
        setTimeout(() => setScorePopup(null), 700);
      }
      
      // Haptics
      triggerHaptic('success');

      // Milestone every 5
      if (newStreak > 0 && newStreak % STREAK_MILESTONE_INTERVAL === 0) {
        setShowStreakMilestone(true);
        triggerHaptic('celebration');
        setTimeout(() => setShowStreakMilestone(false), STREAK_MILESTONE_DURATION_MS);
      }
      
      setSlicedCount((prev) => prev + sliced.length);
      setFruits(remaining);

      if (slicedCount + sliced.length >= levelConfig.fruitsToSlice) {
        setGameState('complete');
        playCelebration();
      }
    }
  };

  const handleStart = () => { 
    playClick(); 
    setGameState('playing'); 
    setFruits([]); 
    setSlicedCount(0); 
    setScore(0); 
    setStreak(0);
    setScorePopup(null);
    setShowStreakMilestone(false);
    fruitIdRef.current = 0; 
  };
  const handleLevelChange = (level: number) => { playClick(); setCurrentLevel(level); };
  const handleFinish = useCallback(async () => { playClick(); await onGameComplete(Math.round(score / 10)); navigate('/games'); }, [score, onGameComplete, navigate, playClick]);

  return (
    <GameContainer title="Fruit Ninja Air" onHome={() => navigate('/games')} reportSession={false}>
      <div className="flex flex-col items-center gap-4 p-4">
        <div className="flex gap-2">
          {LEVELS.map((l) => (
            <button type="button" key={l.level} onClick={() => handleLevelChange(l.level)}
              className={`px-4 py-2 rounded-full font-black text-sm transition-all ${currentLevel === l.level ? 'bg-green-500 text-white shadow-[0_2px_0_#15803D]' : 'bg-white border-2 border-green-200 hover:border-green-400 text-slate-700'}`}>
              Level {l.level}
            </button>
          ))}
        </div>

        {gameState === 'start' && (
          <div className="text-center">
            <p className="text-6xl mb-4">🍉</p>
            <h2 className="text-2xl font-bold mb-2">Fruit Ninja Air!</h2>
            <p className="mb-4">Swipe to slice the fruits!</p>
            <button type="button" onClick={handleStart} className="px-8 py-4 bg-green-500 text-white rounded-2xl font-bold text-xl">
              Start Slicing! 🔪
            </button>
          </div>
        )}

        {gameState === 'playing' && (
          <>
            <div className="relative">
              <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT}
                onPointerMove={handlePointerMove}
                className="touch-none cursor-crosshair rounded-xl shadow-lg border-2 border-green-300"
                style={{ maxWidth: '100%', height: 'auto' }} />
              
              {/* Score Popup */}
              {scorePopup && (
                <motion.div
                  initial={{ opacity: 1, y: 0, scale: 1 }}
                  animate={{ opacity: 0, y: -50, scale: 1.2 }}
                  transition={{ duration: 0.7, ease: 'easeOut' }}
                  className="absolute pointer-events-none"
                  style={{
                    left: `${scorePopup.x}%`,
                    top: `${scorePopup.y}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                >
                  <div className="text-2xl font-bold text-green-500 drop-shadow-lg">
                    +{scorePopup.points}
                  </div>
                </motion.div>
              )}

              {/* Streak Milestone */}
              {showStreakMilestone && (
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0, rotate: 180 }}
                  className="absolute inset-0 flex items-center justify-center pointer-events-none"
                >
                  <div className="bg-gradient-to-r from-orange-400 to-red-500 text-white px-6 py-3 rounded-full font-bold text-xl shadow-lg">
                    🔥 {streak} Streak! 🔥
                  </div>
                </motion.div>
              )}
            </div>
            <div className="flex gap-4">
              <div className="bg-green-100 px-4 py-2 rounded-xl text-center">
                <p className="text-sm text-green-600">Sliced</p>
                <p className="text-2xl font-bold">{slicedCount}/{levelConfig.fruitsToSlice}</p>
              </div>
              <div className="bg-yellow-100 px-4 py-2 rounded-xl text-center">
                <p className="text-sm text-yellow-600">Score</p>
                <p className="text-2xl font-bold">{score}</p>
              </div>
              {streak > 0 && (
                <div className="bg-orange-100 px-4 py-2 rounded-xl text-center">
                  <p className="text-sm text-orange-600">Streak</p>
                  <p className="text-2xl font-bold">🔥 {streak}</p>
                </div>
              )}
            </div>
          </>
        )}

        {gameState === 'complete' && (
          <div className="text-center">
            <p className="text-4xl mb-4">🎉</p>
            <h2 className="text-3xl font-bold mb-2">Fruit Master!</h2>
            <p className="text-xl mb-4">You sliced {slicedCount} fruits!</p>
            <p className="text-2xl font-bold text-green-600 mb-6">Score: {score}</p>
          </div>
        )}

        {gameState !== 'start' && (
          <div className="flex gap-3">
            <button type="button" onClick={handleStart} className="px-6 py-3 bg-slate-100 border-2 border-slate-200 hover:bg-slate-200 text-slate-700 rounded-xl font-black transition-all">Play Again</button>
            <button type="button" onClick={handleFinish} className="px-6 py-3 bg-green-500 text-white rounded-xl font-bold">Finish</button>
          </div>
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
