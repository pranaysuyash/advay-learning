/**
 * Beat Bounce Game
 *
 * @ticket GQ-002, GQ-003, GQ-004, GQ-005, GQ-007
 */

import { memo, useCallback, useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { GameContainer } from '../components/GameContainer';
import { GameShell } from '../components/GameShell';
import { useAudio } from '../utils/hooks/useAudio';
import { useGameDrops } from '../hooks/useGameDrops';
import { useGameSessionProgress } from '../hooks/useGameSessionProgress';
import { useStreakTracking } from '../hooks/useStreakTracking';
import { triggerHaptic } from '../utils/haptics';
import {
  LEVELS,
  createBalls,
  updateBall,
  checkBeatTiming,
  calculateScore,
  type BouncingBall,
} from '../games/beatBounceLogic';

const GAME_COLORS = {
  background: '#1a1a2e',
  ground: '#16213e',
  ball: '#e94560',
  ballGlow: '#ff6b6b',
  beatLine: '#0f3460',
  perfect: '#00ff88',
  good: '#ffaa00',
  miss: '#ff4444',
};

const BeatBounceGame = memo(function BeatBounceGameComponent() {
  const navigate = useNavigate();
  const [currentLevel, setCurrentLevel] = useState(1);
  const [balls, setBalls] = useState<BouncingBall[]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameState, setGameState] = useState<'start' | 'playing' | 'complete'>('start');
  const [combo, setCombo] = useState(0);
  const [lastHit, setLastHit] = useState<'perfect' | 'good' | 'miss' | null>(null);

  // Streak tracking
  const { streak, showMilestone, scorePopup, incrementStreak, resetStreak, setScorePopup } = useStreakTracking();

  const timerRef = useRef<number | null>(null);
  const gameLoopRef = useRef<number | null>(null);
  const lastTimeRef = useRef(0);
  const ballsRef = useRef<BouncingBall[]>([]);
  const beatTimeRef = useRef(0);

  const { playSuccess, playClick, playError } = useAudio();
  const { onGameComplete } = useGameDrops('beat-bounce');
  useGameSessionProgress({ gameName: 'Beat Bounce', score, level: currentLevel, isPlaying: gameState === 'playing' });

  const level = LEVELS.find(l => l.level === currentLevel) || LEVELS[0];

  const GRAVITY = 0.3;
  const BOUNCE_FACTOR = 0.85;
  const GROUND_Y = 75;

  const handleBack = useCallback(() => {
    navigate('/games');
  }, [navigate]);

  const startGame = useCallback(() => {
    const newBalls = createBalls(currentLevel);
    setBalls(newBalls);
    ballsRef.current = newBalls;
    setScore(0);
    setCombo(0);
    resetStreak();
    setTimeLeft(45);
    setLastHit(null);
    setGameState('playing');
    beatTimeRef.current = Date.now();
    playClick();
  }, [currentLevel, playClick, resetStreak]);

  const handleComplete = useCallback(() => {
    setGameState('complete');
    onGameComplete(score);
    playSuccess();
  }, [score, onGameComplete, playSuccess]);

  const handleTap = useCallback(() => {
    if (gameState !== 'playing') return;

    const currentBalls = ballsRef.current;
    if (currentBalls.length === 0) return;

    const ball = currentBalls[0];
    const timing = checkBeatTiming(ball.y, GROUND_Y, level.bpm);

    if (timing) {
      // Calculate streak and points
      const newStreak = incrementStreak();

      const basePoints = 10;
      const streakBonus = Math.min(newStreak * 2, 15);
      const totalPoints = basePoints + streakBonus;

      // Show score popup at ball position
      setScorePopup({ points: totalPoints, x: ball.x, y: ball.y });

      // Trigger haptic feedback
      triggerHaptic('success');

      const points = calculateScore(timing, combo);
      setScore(s => s + points);
      setCombo(c => c + 1);
      setLastHit(timing);

      if (timing === 'perfect') {
        playSuccess();
      } else {
        playClick();
      }

      const newBalls = [...currentBalls];
      newBalls[0] = { ...ball, y: 10, velocityY: 0 };
      setBalls(newBalls);
      ballsRef.current = newBalls;
    } else {
      // Reset streak on miss
      resetStreak();
      setCombo(0);
      setLastHit('miss');
      triggerHaptic('error');
      playError();
    }
  }, [gameState, level.bpm, combo, incrementStreak, resetStreak, playSuccess, playClick, playError]);

  useEffect(() => {
    if (gameState !== 'playing') {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
        gameLoopRef.current = null;
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

    const gameLoop = (timestamp: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp;
      const deltaTime = (timestamp - lastTimeRef.current) / 16;
      lastTimeRef.current = timestamp;

      setBalls(prevBalls => {
        const updatedBalls = prevBalls.map(ball => 
          updateBall(ball, GRAVITY, BOUNCE_FACTOR, GROUND_Y, deltaTime)
        );
        ballsRef.current = updatedBalls;
        return updatedBalls;
      });

      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoopRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    };
  }, [gameState, handleComplete]);

  const handleNextLevel = useCallback(() => {
    if (currentLevel < 3) {
      setCurrentLevel(prev => prev + 1);
      setGameState('start');
    } else {
      navigate('/games');
    }
  }, [currentLevel, navigate]);

  const getHitColor = () => {
    if (lastHit === 'perfect') return GAME_COLORS.perfect;
    if (lastHit === 'good') return GAME_COLORS.good;
    if (lastHit === 'miss') return GAME_COLORS.miss;
    return 'transparent';
  };

  if (gameState === 'start') {
    return (
      <GameContainer title="Beat Bounce" onHome={handleBack} reportSession={false}>
        <div className="flex flex-col items-center justify-center h-full gap-6 p-8">
          <h2 className="text-3xl font-bold text-pink-500">Beat Bounce 🎵</h2>
          <p className="text-lg text-slate-700 text-center">
            Tap when the ball hits the ground in sync with the beat!
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
          <p className="text-sm text-slate-500">BPM: {level.bpm}</p>
          <button
            type="button"
            onClick={startGame}
            className="px-8 py-4 text-xl font-bold text-white rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
          >
            Start Game
          </button>
        </div>
      </GameContainer>
    );
  }

  if (gameState === 'complete') {
    return (
      <GameContainer title="Beat Bounce" onHome={handleBack} reportSession={false}>
        <div className="flex flex-col items-center justify-center h-full gap-6 p-8">
          <h2 className="text-4xl font-bold text-pink-500">Great Beats! 🎵</h2>
          <p className="text-2xl font-bold text-slate-700">Score: {score}</p>
          <p className="text-lg text-slate-600">Max Combo: {combo}</p>
          <p className="text-lg text-slate-600">Best Streak: {streak}</p>
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
    <GameContainer title="Beat Bounce" onHome={handleBack} reportSession={false}>
      <button
        type="button"
        className="relative w-full h-full cursor-pointer"
        style={{ backgroundColor: GAME_COLORS.background }}
        onClick={handleTap}
        aria-label="Tap to hit the beat"
      >
        <div className="absolute top-4 left-4 right-4 flex justify-between">
          <div className="bg-white/20 backdrop-blur rounded-lg px-4 py-2">
            <span className="font-bold text-white">Score: {score}</span>
          </div>
          <div className="bg-white/20 backdrop-blur rounded-lg px-4 py-2">
            <span className="font-bold text-white">Combo: {combo}</span>
          </div>
          <div className="bg-white/20 backdrop-blur rounded-lg px-4 py-2">
            <span className="font-bold text-white">Time: {timeLeft}s</span>
          </div>
        </div>
        
        {/* Streak Counter HUD */}
        <div className="absolute top-16 left-1/2 transform -translate-x-1/2">
          <motion.div 
            className="flex items-center gap-2 bg-orange-500/80 backdrop-blur rounded-full px-4 py-2"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: streak > 0 ? 1 : 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          >
            <span className="text-2xl">🔥</span>
            <span className="font-bold text-white text-xl">{streak}</span>
          </motion.div>
        </div>

        <div
          className="absolute w-full transition-colors duration-100"
          style={{
            bottom: `${100 - GROUND_Y}%`,
            height: '8px',
            backgroundColor: getHitColor(),
            boxShadow: lastHit ? `0 0 20px ${getHitColor()}` : 'none',
          }}
        />

        {balls.map((ball) => (
          <div
            key={ball.id}
            className="absolute rounded-full transition-shadow"
            style={{
              left: `${ball.x}%`,
              top: `${ball.y}%`,
              width: '40px',
              height: '40px',
              transform: 'translate(-50%, -50%)',
              backgroundColor: GAME_COLORS.ball,
              boxShadow: `0 0 20px ${GAME_COLORS.ballGlow}`,
            }}
          />
        ))}

        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <p className="text-white/60 text-center">
            {lastHit === 'perfect' && <span className="text-green-400 font-bold">Perfect!</span>}
            {lastHit === 'good' && <span className="text-yellow-400 font-bold">Good!</span>}
            {lastHit === 'miss' && <span className="text-red-400 font-bold">Miss!</span>}
            {!lastHit && 'Tap on the beat!'}
          </p>
        </div>
        
        {/* Score Popup Animation */}
        <AnimatePresence>
          {scorePopup && (
            <motion.div
              key={`popup-${scorePopup.points}-${Date.now()}`}
              className="absolute pointer-events-none"
              style={{
                left: `${scorePopup.x}%`,
                top: `${scorePopup.y}%`,
              }}
              initial={{ opacity: 1, y: 0, scale: 0.5 }}
              animate={{ opacity: 0, y: -50, scale: 1.2 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
            >
              <span className="font-bold text-yellow-400 text-2xl drop-shadow-lg">
                +{scorePopup.points}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Streak Milestone Celebration */}
        <AnimatePresence>
          {showMilestone && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.2 }}
              transition={{ duration: 0.3 }}
            >
              <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl px-8 py-6 shadow-2xl">
                <motion.div
                  initial={{ y: 10 }}
                  animate={{ y: [-10, 10, -10] }}
                  transition={{ duration: 0.5, repeat: 2 }}
                  className="text-center"
                >
                  <span className="text-5xl">🔥</span>
                  <p className="text-white font-bold text-3xl mt-2">{streak} Streak!</p>
                  <p className="text-white/80 text-lg">Amazing!</p>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </button>
    </GameContainer>
  );
});

// Main export wrapped with GameShell
export const BeatBounce = memo(function BeatBounceComponent() {
  return (
    <GameShell
      gameId="beat-bounce"
      gameName="Beat Bounce"
      showWellnessTimer={true}
      enableErrorBoundary={true}
    >
      <BeatBounceGame />
    </GameShell>
  );
});
