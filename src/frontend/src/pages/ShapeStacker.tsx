import { useCallback, useState, useEffect, useRef, type ReactNode as _ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GameContainer } from '../components/GameContainer';
import { GameShell } from '../components/GameShell';
import { useAudio } from '../utils/hooks/useAudio';
import { useGameDrops } from '../hooks/useGameDrops';
import { useGameProgress } from '../hooks/useGameProgress';
import { useGameSessionProgress } from '../hooks/useGameSessionProgress';
import { triggerHaptic } from '../utils/haptics';
import {
  createShapes,
  createTargets,
  checkMatch,
  calculateScore,
  type FallingShape,
  type TargetSlot,
} from '../games/shapeStackerLogic';
import { STREAK_MILESTONE_INTERVAL, STREAK_MILESTONE_DURATION_MS } from '../games/constants';


// SVG shapes for rendering
import type { JSX } from 'react';
const SHAPE_SVG: Record<string, JSX.Element> = {
  square: <svg viewBox="0 0 100 100" width="100%" height="100%"><rect x="10" y="10" width="80" height="80" fill="currentColor" /></svg>,
  circle: <svg viewBox="0 0 100 100" width="100%" height="100%"><circle cx="50" cy="50" r="40" fill="currentColor" /></svg>,
  triangle: <svg viewBox="0 0 100 100" width="100%" height="100%"><polygon points="50,10 90,90 10,90" fill="currentColor" /></svg>,
  star: <svg viewBox="0 0 100 100" width="100%" height="100%"><polygon points="50,5 61,35 98,35 68,57 79,91 50,70 21,91 32,57 2,35 39,35" fill="currentColor" /></svg>,
};

// Game colors
const GAME_COLORS = {
  background: '#F3F4F6',
  slot: '#E5E7EB',
  slotFilled: '#D1D5DB',
  targetFilled: '#10B981',
  border: '#9CA3AF',
  borderFilled: '#059669',
};
function ShapeStackerContent() {
  const navigate = useNavigate();
  const [currentLevel, setCurrentLevel] = useState(1);
  const [shapes, setShapes] = useState<FallingShape[]>([]);
  const [targets, setTargets] = useState<TargetSlot[]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameState, setGameState] = useState<'start' | 'playing' | 'complete'>('start');
  const [matches, setMatches] = useState(0);
  const [streak, setStreak] = useState(0);
  const [scorePopup, setScorePopup] = useState<{ points: number; x: number; y: number } | null>(null);
  const [showStreakMilestone, setShowStreakMilestone] = useState(false);

  const timerRef = useRef<number | null>(null);
  const gameLoopRef = useRef<number | null>(null);

  const { playSuccess, playClick, playError } = useAudio();
  const { onGameComplete } = useGameDrops('shape-stacker');
  const { saveProgress: _saveProgress } = useGameProgress('shape-stacker');
  useGameSessionProgress({ gameName: 'Shape Stacker', score, level: currentLevel, isPlaying: gameState === 'playing' });

  const FALL_SPEED = 0.15;

  const startGame = useCallback(() => {
    const newShapes = createShapes(currentLevel);
    const newTargets = createTargets(currentLevel);
    setShapes(newShapes);
    setTargets(newTargets);
    setScore(0);
    setMatches(0);
    setStreak(0);
    setScorePopup(null);
    setShowStreakMilestone(false);
    setTimeLeft(45);
    setGameState('playing');
    playClick();
  }, [currentLevel, playClick]);

  const handleComplete = useCallback(() => {
    const finalScore = calculateScore(matches, targets.length, timeLeft);
    setScore(finalScore);
    setGameState('complete');
    onGameComplete(finalScore);
    playSuccess();
  }, [matches, targets.length, timeLeft, onGameComplete, playSuccess]);

  const handleShapeClick = useCallback((shape: FallingShape) => {
    if (gameState !== 'playing') return;

    const availableTarget = targets.find(t => !t.filled && checkMatch(shape, t));
    
    if (availableTarget) {
      setTargets(prev => prev.map(t => 
        t.id === availableTarget.id ? { ...t, filled: true } : t
      ));
      setShapes(prev => prev.filter(s => s.id !== shape.id));
      setMatches(m => m + 1);
      
      // Streak and scoring
      const newStreak = streak + 1;
      setStreak(newStreak);
      const basePoints = 15;
      const streakBonus = Math.min(newStreak * 2, 15);
      const totalPoints = basePoints + streakBonus;
      setScore(s => s + totalPoints);
      
      // Show popup at shape position
      setScorePopup({ points: totalPoints, x: shape.x, y: shape.y });
      setTimeout(() => setScorePopup(null), 700);
      
      playSuccess();
      triggerHaptic('success');

      // Milestone every 5
      if (newStreak > 0 && newStreak % STREAK_MILESTONE_INTERVAL === 0) {
        setShowStreakMilestone(true);
        triggerHaptic('celebration');
        setTimeout(() => setShowStreakMilestone(false), STREAK_MILESTONE_DURATION_MS);
      }

      const remainingShapes = shapes.filter(s => s.id !== shape.id);
      const unfilledTargets = targets.filter(t => !t.filled);
      
      if (unfilledTargets.length === 1 && remainingShapes.length === 0) {
        handleComplete();
      }
    } else {
      playError();
      triggerHaptic('error');
      setStreak(0);
      setScore(s => Math.max(0, s - 20));
    }
  }, [gameState, shapes, targets, playSuccess, playError, handleComplete, streak]);

  useEffect(() => {
    if (gameState !== 'playing') {
      if (timerRef.current) clearInterval(timerRef.current);
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
      return;
    }

    timerRef.current = window.setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    const gameLoop = () => {
      setShapes(prev => {
        const updated = prev.map(s => ({
          ...s,
          y: s.y + FALL_SPEED,
        }));

        const missedShapes = updated.filter(s => s.y > 100);
        if (missedShapes.length > 0) {
          playError();
          triggerHaptic('error');
          setStreak(0);
          setScore(s => Math.max(0, s - 30));
        }

        return updated.filter(s => s.y <= 100);
      });

      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoopRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    };
  }, [gameState, handleComplete, playError]);

  const handleNextLevel = useCallback(() => {
    if (currentLevel < 3) {
      setCurrentLevel(prev => prev + 1);
      setGameState('start');
    } else {
      navigate('/games');
    }
  }, [currentLevel, navigate]);

  const renderShape = (shape: FallingShape['shape'], color: string, size: number = 40) => (
    <svg width={size} height={size} viewBox="0 0 40 40" fill={color} aria-label={shape}>
      <title>{shape}</title>
      {SHAPE_SVG[shape]}
    </svg>
  );

  if (gameState === 'start') {
    return (
      <GameContainer title="Shape Stacker" onHome={() => navigate('/games')} reportSession={false}>
        <div className="flex flex-col items-center justify-center h-full gap-6 p-8">
          <h2 className="text-3xl font-bold text-indigo-600">Shape Stacker 🔷</h2>
          <p className="text-lg text-slate-700 text-center">
            Tap the falling shapes to match them with the target slots!
          </p>
          <div className="flex gap-4 items-center">
            <button
              type="button"
              onClick={() => setCurrentLevel(prev => Math.max(1, prev - 1))}
              className="px-4 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 font-bold"
            >
              -
            </button>
            <span className="px-4 py-2 font-bold text-slate-700">Level {currentLevel}</span>
            <button
              type="button"
              onClick={() => setCurrentLevel(prev => Math.min(3, prev + 1))}
              className="px-4 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 font-bold"
            >
              +
            </button>
          </div>
          <button
            type="button"
            onClick={startGame}
            className="px-8 py-4 text-xl font-bold text-white rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
          >
            Start Game
          </button>
        </div>
      </GameContainer>
    );
  }

  if (gameState === 'complete') {
    return (
      <GameContainer title="Shape Stacker" onHome={() => navigate('/games')} reportSession={false}>
        <div className="flex flex-col items-center justify-center h-full gap-6 p-8">
          <h2 className="text-4xl font-bold text-indigo-600">Stacked! 🔷</h2>
          <p className="text-2xl font-bold text-slate-700">Score: {score}</p>
          <p className="text-lg text-slate-600">Matches: {matches}/{targets.length}</p>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={startGame}
              className="px-6 py-3 text-lg font-bold text-white rounded-lg bg-blue-500 hover:bg-blue-600"
            >
              Play Again
            </button>
            <button
              type="button"
              onClick={handleNextLevel}
              className="px-6 py-3 text-lg font-bold text-white rounded-lg bg-green-500 hover:bg-green-600"
            >
              {currentLevel < 3 ? 'Next Level' : 'Back to Games'}
            </button>
          </div>
        </div>
      </GameContainer>
    );
  }

  return (
    <GameContainer title="Shape Stacker" onHome={() => navigate('/games')} reportSession={false}>
      <div
        className="relative w-full h-full"
        style={{ backgroundColor: GAME_COLORS.background }}
      >
        <div className="absolute top-4 left-4 right-4 flex justify-between">
          <div className="bg-white/80 rounded-lg px-4 py-2 shadow">
            <span className="font-bold text-slate-700">Score: {score}</span>
          </div>
          <div className="bg-white/80 rounded-lg px-4 py-2 shadow">
            <span className="font-bold text-slate-700">Matches: {matches}/{targets.length}</span>
          </div>
          {streak > 0 && (
            <div className="bg-orange-100 rounded-lg px-4 py-2 shadow border-2 border-orange-200">
              <span className="font-bold text-orange-600">🔥 {streak}</span>
            </div>
          )}
          <div className="bg-white/80 rounded-lg px-4 py-2 shadow">
            <span className="font-bold text-slate-700">Time: {timeLeft}s</span>
          </div>
        </div>

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
            className="absolute inset-0 flex items-center justify-center pointer-events-none z-30"
          >
            <div className="bg-gradient-to-r from-orange-400 to-red-500 text-white px-6 py-3 rounded-full font-bold text-xl shadow-lg">
              🔥 {streak} Streak! 🔥
            </div>
          </motion.div>
        )}

        <div className="absolute bottom-[30%] left-0 right-0 flex justify-center gap-8 px-8">
          {targets.map((target) => (
            <div
              key={target.id}
              className="w-16 h-16 rounded-xl flex items-center justify-center border-4 border-dashed transition-colors"
              style={{
                backgroundColor: target.filled ? GAME_COLORS.slotFilled : GAME_COLORS.slot,
                borderColor: target.filled ? '#16A34A' : '#94A3B8',
              }}
            >
              {target.filled ? renderShape(target.shape, target.color, 48) : renderShape(target.shape, target.color, 32)}
            </div>
          ))}
        </div>

        {shapes.map((shape) => (
          <button
            type="button"
            key={shape.id}
            onClick={() => handleShapeClick(shape)}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-transform hover:scale-110 active:scale-95"
            style={{
              left: `${shape.x}%`,
              top: `${shape.y}%`,
            }}
          >
            {renderShape(shape.shape, shape.color, 44)}
          </button>
        ))}
      </div>
    </GameContainer>
  );
}

export const ShapeStacker = () => (
  <GameShell
    gameId="shape-stacker"
    gameName="Shape Stacker"
    showWellnessTimer={true}
    enableErrorBoundary={true}
  >
    <ShapeStackerContent />
  </GameShell>
);

export default ShapeStacker;
