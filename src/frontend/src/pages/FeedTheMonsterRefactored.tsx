/**
 * Feed The Monster Game - REFACTORED with GameShell
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
  getEmotionForLevel,
  generateOptions,
  checkAnswer,
  calculateScore,
  type FoodItem,
  type MonsterEmotion,
} from '../games/feedTheMonsterLogic';

const GAME_COLORS = {
  background: '#FFF7ED',
  monster: '#8B5CF6',
  card: '#FFFFFF',
  correct: '#22C55E',
  wrong: '#EF4444',
};

const FeedTheMonsterGame = memo(function FeedTheMonsterGameComponent() {
  const navigate = useNavigate();
  const [currentLevel, setCurrentLevel] = useState(1);
  const [monster, setMonster] = useState<MonsterEmotion | null>(null);
  const [options, setOptions] = useState<FoodItem[]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameState, setGameState] = useState<'start' | 'playing' | 'complete'>('start');
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [showResult, setShowResult] = useState<boolean | null>(null);
  const [combo, setCombo] = useState(0);
  const [round, setRound] = useState(1);

  const timerRef = useRef<number | null>(null);
  const monsterRef = useRef<MonsterEmotion | null>(null);

  const { playSuccess, playClick, playError } = useAudio();
  const { onGameComplete } = useGameDrops('feed-the-monster');
  useGameSessionProgress({ gameName: 'Feed the Monster', score, level: currentLevel, isPlaying: gameState === 'playing' });

  const TOTAL_ROUNDS = 5;

  const startGame = useCallback(() => {
    const newMonster = getEmotionForLevel(currentLevel);
    setMonster(newMonster);
    monsterRef.current = newMonster;
    const newOptions = generateOptions(newMonster.emotion, currentLevel);
    setOptions(newOptions);
    setScore(0);
    setCombo(0);
    setTimeLeft(45);
    setRound(1);
    setSelectedFood(null);
    setShowResult(null);
    setGameState('playing');
    playClick();
  }, [currentLevel, playClick]);

  const handleComplete = useCallback(() => {
    setGameState('complete');
    onGameComplete(score);
    playSuccess();
  }, [score, onGameComplete, playSuccess]);

  const handleFoodClick = useCallback((food: FoodItem) => {
    if (gameState !== 'playing' || !monsterRef.current || showResult !== null) return;

    setSelectedFood(food);
    const isCorrect = checkAnswer(food, monsterRef.current.emotion);
    setShowResult(isCorrect);

    if (isCorrect) {
      const points = calculateScore(true, timeLeft, combo);
      setScore(s => s + points);
      setCombo(c => c + 1);
      playSuccess();

      setTimeout(() => {
        if (round < TOTAL_ROUNDS) {
          const newMonster = getEmotionForLevel(currentLevel);
          setMonster(newMonster);
          monsterRef.current = newMonster;
          const newOptions = generateOptions(newMonster.emotion, currentLevel);
          setOptions(newOptions);
          setRound(r => r + 1);
          setSelectedFood(null);
          setShowResult(null);
          setTimeLeft(45);
          playClick();
        } else {
          handleComplete();
        }
      }, 1000);
    } else {
      setCombo(0);
      playError();
      setTimeout(() => {
        setSelectedFood(null);
        setShowResult(null);
      }, 800);
    }
  }, [gameState, showResult, timeLeft, combo, round, currentLevel, playSuccess, playError, playClick, handleComplete]);

  useEffect(() => {
    if (gameState !== 'playing') {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    if (showResult !== null) return;

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
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState, showResult, handleComplete]);

  const handleNextLevel = useCallback(() => {
    if (currentLevel < 3) {
      setCurrentLevel(prev => prev + 1);
      setGameState('start');
    } else {
      navigate('/games');
    }
  }, [currentLevel, navigate]);

  const getMonsterStyle = () => {
    if (!monster) return {};
    switch (monster.emotion) {
      case 'happy': return { backgroundColor: '#FCD34D' };
      case 'sad': return { backgroundColor: '#93C5FD' };
      case 'calm': return { backgroundColor: '#A7F3D0' };
      case 'excited': return { backgroundColor: '#F472B6' };
      case 'angry': return { backgroundColor: '#FCA5A5' };
      default: return {};
    }
  };

  if (gameState === 'start') {
    return (
      <GameContainer title="Feed the Monster" onHome={() => navigate('/games')} reportSession={false}>
        <div className="flex flex-col items-center justify-center h-full gap-6 p-8">
          <h2 className="text-3xl font-bold text-purple-600">Feed the Monster 👾</h2>
          <p className="text-lg text-slate-700 text-center">
            The monster is feeling an emotion! Pick the right food to feed it!
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
            className="px-8 py-4 text-xl font-bold text-white rounded-xl bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600"
          >
            Start Game
          </button>
        </div>
      </GameContainer>
    );
  }

  if (gameState === 'complete') {
    return (
      <GameContainer title="Feed the Monster" onHome={() => navigate('/games')} reportSession={false}>
        <div className="flex flex-col items-center justify-center h-full gap-6 p-8">
          <h2 className="text-4xl font-bold text-purple-600">Yummy! 👾</h2>
          <p className="text-2xl font-bold text-slate-700">Score: {score}</p>
          <p className="text-lg text-slate-600">Rounds: {round}/{TOTAL_ROUNDS}</p>
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
    <GameContainer title="Feed the Monster" onHome={() => navigate('/games')} reportSession={false}>
      <div
        className="relative w-full h-full flex flex-col items-center justify-center"
        style={{ backgroundColor: GAME_COLORS.background }}
      >
        <div className="absolute top-4 left-4 right-4 flex justify-between">
          <div className="bg-white/80 rounded-lg px-4 py-2 shadow">
            <span className="font-bold text-slate-700">Score: {score}</span>
          </div>
          <div className="bg-white/80 rounded-lg px-4 py-2 shadow">
            <span className="font-bold text-slate-700">Combo: {combo}</span>
          </div>
          <div className="bg-white/80 rounded-lg px-4 py-2 shadow">
            <span className="font-bold text-slate-700">Time: {timeLeft}s</span>
          </div>
        </div>

        <div className="mb-8 text-center">
          <p className="text-lg text-slate-600 mb-2">Round {round}/{TOTAL_ROUNDS}</p>
          <div
            className="w-40 h-40 rounded-full flex items-center justify-center text-6xl shadow-2xl"
            style={getMonsterStyle()}
          >
            {monster?.emoji}
          </div>
          <p className="mt-4 text-xl font-bold text-slate-700">
            {monster?.prompt}
          </p>
          <p className="text-lg text-slate-500">
            What food matches this feeling?
          </p>
        </div>

        <div className="flex gap-4 flex-wrap justify-center max-w-md">
          {options.map((food) => (
            <button
              type="button"
              key={food.id}
              disabled={showResult !== null}
              onClick={() => handleFoodClick(food)}
              className="w-24 h-24 rounded-2xl flex flex-col items-center justify-center transition-transform hover:scale-105 active:scale-95 shadow-lg border-4"
              style={{
                backgroundColor: selectedFood?.id === food.id
                  ? (showResult === true ? GAME_COLORS.correct : showResult === false ? GAME_COLORS.wrong : GAME_COLORS.card)
                  : GAME_COLORS.card,
                borderColor: selectedFood?.id === food.id
                  ? (showResult === true ? '#16A34A' : showResult === false ? '#DC2626' : GAME_COLORS.monster)
                  : '#E5E7EB',
              }}
            >
              <span className="text-4xl">{food.emoji}</span>
              <span className="text-xs font-bold text-slate-600 mt-1">{food.name}</span>
            </button>
          ))}
        </div>

        {showResult !== null && (
          <div className="mt-6 text-2xl font-bold">
            {showResult ? (
              <span className="text-green-500">Correct! Yummy! 😋</span>
            ) : (
              <span className="text-red-500">Oops! Try again! 🤔</span>
            )}
          </div>
        )}
      </div>
    </GameContainer>
  );
}

// Main export wrapped with GameShell
export const FeedTheMonster = memo(function FeedTheMonsterComponent() {
  return (
    <GameShell
      gameId="feed-the-monster"
      gameName="Feed The Monster"
      showWellnessTimer={true}
      enableErrorBoundary={true}
    >
      <FeedTheMonsterGame />
    </GameShell>
  );
});
