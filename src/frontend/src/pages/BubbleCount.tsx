import { useCallback, useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { GameContainer } from '../components/GameContainer';
import { useAudio } from '../utils/hooks/useAudio';
import { useGameDrops } from '../hooks/useGameDrops';
import { useGameSessionProgress } from '../hooks/useGameSessionProgress';
import {
  LEVELS,
  createGame,
  checkAnswer,
  generateQuestion,
  calculateScore,
  type BubbleGroup,
} from '../games/bubbleCountLogic';

const GAME_COLORS = {
  bubble: '#60A5FA',
  bubbleHighlight: '#93C5FD',
  selected: '#3B82F6',
  correct: '#22C55E',
  wrong: '#EF4444',
  background: '#EFF6FF',
};

export function BubbleCount() {
  const navigate = useNavigate();
  const [currentLevel, setCurrentLevel] = useState(1);
  const [groups, setGroups] = useState<BubbleGroup[]>([]);
  const [targetCount, setTargetCount] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameState, setGameState] = useState<'start' | 'playing' | 'complete'>('start');
  const [selectedGroup, setSelectedGroup] = useState<number | null>(null);
  const [showResult, setShowResult] = useState<boolean | null>(null);
  const [round, setRound] = useState(1);

  const timerRef = useRef<number | null>(null);
  const groupsRef = useRef<BubbleGroup[]>([]);

  const { playSuccess, playClick, playError } = useAudio();
  const { onGameComplete } = useGameDrops('bubble-count');
  useGameSessionProgress({ gameName: 'Bubble Count', score, level: currentLevel, isPlaying: gameState === 'playing' });

  const TOTAL_ROUNDS = 5;

  const startGame = useCallback(() => {
    const { groups: newGroups, config } = createGame(currentLevel);
    setGroups(newGroups);
    groupsRef.current = newGroups;
    const question = generateQuestion(config, newGroups);
    setTargetCount(question);
    setScore(0);
    setTimeLeft(45);
    setRound(1);
    setSelectedGroup(null);
    setShowResult(null);
    setGameState('playing');
    playClick();
  }, [currentLevel, playClick]);

  const handleComplete = useCallback(() => {
    setGameState('complete');
    onGameComplete(score);
    playSuccess();
  }, [score, onGameComplete, playSuccess]);

  const handleGroupClick = useCallback((groupId: number) => {
    if (gameState !== 'playing' || showResult !== null) return;

    setSelectedGroup(groupId);
    const isCorrect = checkAnswer(groupId, groupsRef.current, targetCount);
    setShowResult(isCorrect);

    if (isCorrect) {
      const points = calculateScore(true, timeLeft);
      setScore(s => s + points);
      playSuccess();

      setTimeout(() => {
        if (round < TOTAL_ROUNDS) {
          const { groups: newGroups, config } = createGame(currentLevel);
          setGroups(newGroups);
          groupsRef.current = newGroups;
          const question = generateQuestion(config, newGroups);
          setTargetCount(question);
          setRound(r => r + 1);
          setSelectedGroup(null);
          setShowResult(null);
          setTimeLeft(45);
          playClick();
        } else {
          handleComplete();
        }
      }, 1000);
    } else {
      playError();
      setTimeout(() => {
        setSelectedGroup(null);
        setShowResult(null);
      }, 800);
    }
  }, [gameState, showResult, targetCount, timeLeft, round, currentLevel, playSuccess, playError, playClick, handleComplete]);

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

  if (gameState === 'start') {
    return (
      <GameContainer title="Bubble Count" onHome={() => navigate('/games')} reportSession={false}>
        <div className="flex flex-col items-center justify-center h-full gap-6 p-8">
          <h2 className="text-3xl font-bold text-blue-600">Bubble Count 🫧</h2>
          <p className="text-lg text-slate-700 text-center">
            Count the bubbles in each group and tap the group that has the right number!
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
            className="px-8 py-4 text-xl font-bold text-white rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
          >
            Start Game
          </button>
        </div>
      </GameContainer>
    );
  }

  if (gameState === 'complete') {
    return (
      <GameContainer title="Bubble Count" onHome={() => navigate('/games')} reportSession={false}>
        <div className="flex flex-col items-center justify-center h-full gap-6 p-8">
          <h2 className="text-4xl font-bold text-blue-600">Great Counting! 🫧</h2>
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
    <GameContainer title="Bubble Count" onHome={() => navigate('/games')} reportSession={false}>
      <div
        className="relative w-full h-full"
        style={{ backgroundColor: GAME_COLORS.background }}
      >
        <div className="absolute top-4 left-4 right-4 flex justify-between">
          <div className="bg-white/80 rounded-lg px-4 py-2 shadow">
            <span className="font-bold text-slate-700">Score: {score}</span>
          </div>
          <div className="bg-white/80 rounded-lg px-4 py-2 shadow">
            <span className="font-bold text-slate-700">Round: {round}/{TOTAL_ROUNDS}</span>
          </div>
          <div className="bg-white/80 rounded-lg px-4 py-2 shadow">
            <span className="font-bold text-slate-700">Time: {timeLeft}s</span>
          </div>
        </div>

        <div className="absolute top-20 left-0 right-0 flex flex-col items-center gap-8 p-4">
          <div className="bg-white rounded-xl px-8 py-4 shadow-lg">
            <p className="text-xl font-bold text-slate-700 text-center">
              Find the group with <span className="text-blue-600 text-2xl">{targetCount}</span> bubbles!
            </p>
          </div>

          <div className="flex gap-8 flex-wrap justify-center">
            {groups.map((group) => (
              <button
                type="button"
                key={group.id}
                disabled={showResult !== null}
                onClick={() => handleGroupClick(group.id)}
                className="relative transition-transform hover:scale-105 active:scale-95"
                style={{
                  transform: 'translate(-50%, -50%)',
                }}
              >
                <div
                  className="flex items-center justify-center rounded-full"
                  style={{
                    width: `${group.radius * 2 + 20}px`,
                    height: `${group.radius * 2 + 20}px`,
                    backgroundColor: selectedGroup === group.id 
                      ? (showResult === true ? GAME_COLORS.correct : showResult === false ? GAME_COLORS.wrong : GAME_COLORS.selected)
                      : 'white',
                    border: `3px solid ${
                      selectedGroup === group.id 
                        ? (showResult === true ? '#16A34A' : showResult === false ? '#DC2626' : '#2563EB')
                        : GAME_COLORS.bubble
                    }`,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  }}
                >
                  {Array.from({ length: group.count }).map((_, i) => (
                    <div
                      key={`bubble-${group.id}-${i}`}
                      className="absolute rounded-full"
                      style={{
                        width: '12px',
                        height: '12px',
                        backgroundColor: GAME_COLORS.bubble,
                        boxShadow: 'inset -2px -2px 4px rgba(0,0,0,0.1)',
                        top: `${20 + (i % 3) * 15}%`,
                        left: `${20 + Math.floor(i / 3) * 25}%`,
                      }}
                    />
                  ))}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </GameContainer>
  );
}
