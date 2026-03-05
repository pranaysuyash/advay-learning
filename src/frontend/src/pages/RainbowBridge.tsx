import { useCallback, useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GameContainer } from '../components/GameContainer';
import { useAudio } from '../utils/hooks/useAudio';
import { useGameDrops } from '../hooks/useGameDrops';
import { useGameSessionProgress } from '../hooks/useGameSessionProgress';
import { triggerHaptic } from '../utils/haptics';
import {
  RAINBOW_COLORS,
  createGame,
  checkDotClick,
  isGameComplete,
  calculateScore,
  type Dot,
} from '../games/rainbowBridgeLogic';
import { STREAK_MILESTONE_INTERVAL, STREAK_MILESTONE_DURATION_MS } from '../games/constants';

const GAME_COLORS = {
  sky: '#87CEEB',
  skyDark: '#4A90D9',
  dotDefault: '#FFFFFF',
  dotStroke: '#333333',
  dotLabel: '#333333',
  dotConnected: '#10B981',
  grass: '#22C55E',
} as const;

interface RainbowSegment {
  startDot: Dot;
  endDot: Dot;
  color: string;
}

interface LevelConfig {
  level: number;
  dotCount: number;
}

const LEVELS: LevelConfig[] = [
  { level: 1, dotCount: 5 },
  { level: 2, dotCount: 7 },
  { level: 3, dotCount: 10 },
];

export function RainbowBridge() {
  const navigate = useNavigate();
  const [currentLevel, _setCurrentLevel] = useState(1);
  const [dots, setDots] = useState<Dot[]>([]);
  const [currentDotIndex, setCurrentDotIndex] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(30);
  const [gameState, setGameState] = useState<'start' | 'playing' | 'complete'>('start');
  const [rainbowSegments, setRainbowSegments] = useState<RainbowSegment[]>([]);
  const [streak, setStreak] = useState(0);
  const [showStreakMilestone, setShowStreakMilestone] = useState(false);

  const timerRef = useRef<number | null>(null);
  const dotsRef = useRef<Dot[]>([]);
  const currentIndexRef = useRef(0);

  const { playPop, playSuccess, playClick } = useAudio();
  const { onGameComplete } = useGameDrops('rainbow-bridge');
  useGameSessionProgress({ gameName: 'Rainbow Bridge', score, level: currentLevel, isPlaying: gameState === 'playing' });

  const level = LEVELS.find(l => l.level === currentLevel) || LEVELS[0];

  const startGame = useCallback(() => {
    const { dots: newDots } = createGame(currentLevel);
    setDots(newDots);
    dotsRef.current = newDots;
    setCurrentDotIndex(0);
    currentIndexRef.current = 0;
    setScore(0);
    setStreak(0);
    setShowStreakMilestone(false);
    setTimeLeft(45);
    setRainbowSegments([]);
    setGameState('playing');
    playClick();
  }, [currentLevel, playClick]);

  const handleComplete = useCallback(() => {
    setGameState('complete');
    onGameComplete(score);
    playSuccess();
  }, [score, onGameComplete, playSuccess]);

  const handleDotPress = useCallback((x: number, y: number) => {
    if (gameState !== 'playing') return;

    const currentIndex = currentIndexRef.current;
    const dotsData = dotsRef.current;

    const result = checkDotClick(x, y, dotsData, currentIndex);

    if (result.success) {
      // Streak tracking
      const newStreak = streak + 1;
      setStreak(newStreak);
      
      playPop();
      triggerHaptic('success');

      // Milestone every 5 dots
      if (newStreak > 0 && newStreak % STREAK_MILESTONE_INTERVAL === 0) {
        setShowStreakMilestone(true);
        triggerHaptic('celebration');
        setTimeout(() => setShowStreakMilestone(false), STREAK_MILESTONE_DURATION_MS);
      }
      
      const newDots = [...dotsData];
      newDots[currentIndex] = { ...newDots[currentIndex], connected: true };
      setDots(newDots);
      dotsRef.current = newDots;

      if (currentIndex > 0) {
        const newSegment: RainbowSegment = {
          startDot: newDots[currentIndex - 1],
          endDot: newDots[currentIndex],
          color: RAINBOW_COLORS[Math.min(currentIndex - 1, RAINBOW_COLORS.length - 1)],
        };
        setRainbowSegments(prev => [...prev, newSegment]);
      }

      const nextIndex = result.nextIndex;
      setCurrentDotIndex(nextIndex);
      currentIndexRef.current = nextIndex;

      if (isGameComplete(newDots)) {
        const finalScore = calculateScore(timeLeft, currentLevel);
        setScore(finalScore);
        handleComplete();
      }
    }
  }, [gameState, timeLeft, currentLevel, playPop, handleComplete]);

  useEffect(() => {
    if (gameState !== 'playing') {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
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

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [gameState, handleComplete]);

  const handleNextLevel = useCallback(() => {
    if (currentLevel < 3) {
      _setCurrentLevel(prev => prev + 1);
      setGameState('start');
    } else {
      navigate('/games');
    }
  }, [currentLevel, navigate]);

  const handleRestart = useCallback(() => {
    startGame();
  }, [startGame]);

  if (gameState === 'start') {
    return (
      <GameContainer title="Rainbow Bridge">
        <div className="flex flex-col items-center justify-center h-full gap-6 p-8">
          <h2 className="text-3xl font-bold text-purple-600">Rainbow Bridge 🌈</h2>
          <p className="text-lg text-slate-700 text-center">
            Tap the numbered dots in order from 1 to {level.dotCount} to build a rainbow!
          </p>
          <div className="flex gap-4 items-center">
            <button
              type="button"
              onClick={() => _setCurrentLevel(prev => Math.max(1, prev - 1))}
              className="px-4 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 font-bold"
            >
              -
            </button>
            <span className="px-4 py-2 font-bold text-slate-700">Level {currentLevel}</span>
            <button
              type="button"
              onClick={() => _setCurrentLevel(prev => Math.min(3, prev + 1))}
              className="px-4 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 font-bold"
            >
              +
            </button>
          </div>
          <button
            type="button"
            onClick={startGame}
            className="px-8 py-4 text-xl font-bold text-white rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          >
            Start Game
          </button>
        </div>
      </GameContainer>
    );
  }

  if (gameState === 'complete') {
    return (
      <GameContainer title="Rainbow Bridge">
        <div className="flex flex-col items-center justify-center h-full gap-6 p-8">
          <h2 className="text-4xl font-bold text-purple-600">Rainbow Complete! 🌈</h2>
          <p className="text-2xl font-bold text-slate-700">Score: {score}</p>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={handleRestart}
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
    <GameContainer title="Rainbow Bridge">
      <div
        className="relative w-full h-full"
        style={{ background: `linear-gradient(180deg, ${GAME_COLORS.sky} 60%, ${GAME_COLORS.grass} 60%)` }}
      >
        <div className="absolute top-4 left-4 right-4 flex justify-between">
          <div className="bg-white/80 rounded-lg px-4 py-2 shadow">
            <span className="font-bold text-slate-700">Score: {score}</span>
          </div>
          <div className="bg-white/80 rounded-lg px-4 py-2 shadow">
            <span className="font-bold text-slate-700">Next: {currentDotIndex + 1}</span>
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

        {/* Streak Milestone Overlay */}
        {showStreakMilestone && (
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

        <svg className="w-full h-full absolute top-0 left-0" style={{ pointerEvents: 'none' }} aria-label="Rainbow segments">
          <title>Rainbow Bridge</title>
          {rainbowSegments.map((segment, i) => (
            <line
              key={`segment-${segment.startDot.number}-${segment.endDot.number}-${i}`}
              x1={`${segment.startDot.x}%`}
              y1={`${segment.startDot.y}%`}
              x2={`${segment.endDot.x}%`}
              y2={`${segment.endDot.y}%`}
              stroke={segment.color}
              strokeWidth="6"
              strokeLinecap="round"
            />
          ))}
        </svg>

        {dots.map((dot) => (
          <button
            type="button"
            key={dot.id}
            disabled={dot.connected}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center transition-transform hover:scale-110 active:scale-95"
            style={{
              left: `${dot.x}%`,
              top: `${dot.y}%`,
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              backgroundColor: dot.connected ? GAME_COLORS.dotConnected : GAME_COLORS.dotDefault,
              border: `3px solid ${dot.connected ? '#059669' : GAME_COLORS.dotStroke}`,
              boxShadow: dot.connected ? `0 0 15px ${RAINBOW_COLORS[Math.min(dot.id, RAINBOW_COLORS.length - 1)]}` : '0 4px 6px rgba(0,0,0,0.2)',
            }}
            onClick={() => handleDotPress(dot.x, dot.y)}
          >
            <span
              className="font-bold text-base"
              style={{ color: dot.connected ? '#FFFFFF' : GAME_COLORS.dotLabel }}
            >
              {dot.number}
            </span>
          </button>
        ))}
      </div>
    </GameContainer>
  );
}
