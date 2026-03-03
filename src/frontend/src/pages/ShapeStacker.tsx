import { useCallback, useState, useEffect, useRef, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { GameContainer } from '../components/GameContainer';
import { useAudio } from '../utils/hooks/useAudio';
import { useGameDrops } from '../hooks/useGameDrops';
import { useGameSessionProgress } from '../hooks/useGameSessionProgress';
import {
  createShapes,
  createTargets,
  checkMatch,
  calculateScore,
  type FallingShape,
  type TargetSlot,
} from '../games/shapeStackerLogic';

const GAME_COLORS = {
  background: '#F8FAFC',
  slot: '#E2E8F0',
  slotFilled: '#22C55E',
};

const SHAPE_SVG: Record<FallingShape['shape'], ReactNode> = {
  square: <rect x="5" y="5" width="30" height="30" />,
  circle: <circle cx="20" cy="20" r="18" />,
  triangle: <polygon points="20,5 35,35 5,35" />,
  star: <polygon points="20,2 25,15 38,15 28,24 32,37 20,29 8,37 12,24 2,15 15,15" />,
};

export function ShapeStacker() {
  const navigate = useNavigate();
  const [currentLevel, setCurrentLevel] = useState(1);
  const [shapes, setShapes] = useState<FallingShape[]>([]);
  const [targets, setTargets] = useState<TargetSlot[]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameState, setGameState] = useState<'start' | 'playing' | 'complete'>('start');
  const [matches, setMatches] = useState(0);

  const timerRef = useRef<number | null>(null);
  const gameLoopRef = useRef<number | null>(null);

  const { playSuccess, playClick, playError } = useAudio();
  const { onGameComplete } = useGameDrops('shape-stacker');
  useGameSessionProgress({ gameName: 'Shape Stacker', score, level: currentLevel, isPlaying: gameState === 'playing' });

  const FALL_SPEED = 0.15;

  const startGame = useCallback(() => {
    const newShapes = createShapes(currentLevel);
    const newTargets = createTargets(currentLevel);
    setShapes(newShapes);
    setTargets(newTargets);
    setScore(0);
    setMatches(0);
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
      playSuccess();

      const remainingShapes = shapes.filter(s => s.id !== shape.id);
      const unfilledTargets = targets.filter(t => !t.filled);
      
      if (unfilledTargets.length === 1 && remainingShapes.length === 0) {
        handleComplete();
      }
    } else {
      playError();
      setScore(s => Math.max(0, s - 20));
    }
  }, [gameState, shapes, targets, playSuccess, playError, handleComplete]);

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
          <div className="bg-white/80 rounded-lg px-4 py-2 shadow">
            <span className="font-bold text-slate-700">Time: {timeLeft}s</span>
          </div>
        </div>

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
