/**
 * Beat Bounce Game - REFACTORED with GameShell
 * 
 * @ticket GQ-002, GQ-003, GQ-004, GQ-005, GQ-007
 */

import { useCallback, useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { GameContainer } from '../components/GameContainer';
import { useAudio } from '../utils/hooks/useAudio';
import { useGameDrops } from '../hooks/useGameDrops';
import { useGameSessionProgress } from '../hooks/useGameSessionProgress';
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
    setTimeLeft(45);
    setLastHit(null);
    setGameState('playing');
    beatTimeRef.current = Date.now();
    playClick();
  }, [currentLevel, playClick]);

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
      setCombo(0);
      setLastHit('miss');
      playError();
    }
  }, [gameState, level.bpm, combo, playSuccess, playClick, playError]);

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
      </button>
    </GameContainer>
  );
}

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
