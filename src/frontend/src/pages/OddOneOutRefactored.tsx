/**
 * Odd One Out Game - REFACTORED with GameShell
 *
 * Tap the item that doesn't belong.
 * 
 * @ticket GQ-002, GQ-003, GQ-004, GQ-005, GQ-007
 */

import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GameShell } from '../components/GameShell';
import { GameContainer } from '../components/GameContainer';
import { useGameProgress } from '../hooks/useGameProgress';
import { useAudio } from '../utils/hooks/useAudio';
import { useGameDrops } from '../hooks/useGameDrops';
import {
  LEVELS,
  buildOddOneOutRound,
  checkAnswer,
  calculateScore,
  type OddOneOutRound,
} from '../games/oddOneOutLogic';

// Inner game component
interface OddOneOutGameProps {
  saveProgress: (data: { score: number; completed: boolean; level?: number; metadata?: Record<string, unknown> }) => Promise<void>;
}

const OddOneOutGame = memo(function OddOneOutGameComponent({ saveProgress }: OddOneOutGameProps) {
  const navigate = useNavigate();
  const [currentLevel, setCurrentLevel] = useState(1);
  const [currentRound, setCurrentRound] = useState<OddOneOutRound | null>(null);
  const [roundIndex, setRoundIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [gameState, setGameState] = useState<'playing' | 'complete'>('playing');
  const [usedCategories, setUsedCategories] = useState<string[]>([]);
  const [feedback, setFeedback] = useState('Tap the one that does NOT belong!');

  const { playClick, playSuccess, playError } = useAudio();
  const { onGameComplete } = useGameDrops('odd-one-out');

  const levelConfig = useMemo(() => LEVELS.find((l) => l.level === currentLevel) ?? LEVELS[0], [currentLevel]);

  useEffect(() => {
    if (gameState === 'playing' && !currentRound) {
      const round = buildOddOneOutRound(currentLevel, usedCategories);
      setCurrentRound(round);
      setUsedCategories((prev) => [...prev, round.category]);
    }
  }, [gameState, currentLevel, currentRound, usedCategories]);

  const handleAnswer = (itemName: string) => {
    if (showResult || !currentRound) return;

    playClick();
    setSelectedAnswer(itemName);
    setShowResult(true);

    const isCorrect = checkAnswer(
      currentRound.items.find((i) => i.name === itemName)!,
      currentRound.oddItem
    );
    const roundScore = calculateScore(isCorrect, 5, levelConfig.timePerRound);

    if (isCorrect) {
      playSuccess();
      setCorrectCount((prev) => prev + 1);
      setScore((prev) => prev + roundScore);
      setFeedback(`Yes! ${currentRound.oddItem.name} doesn't belong!`);
    } else {
      playError();
      setFeedback(`The odd one out is ${currentRound.oddItem.name} ${currentRound.oddItem.emoji}`);
    }

    setTimeout(() => {
      const nextIndex = roundIndex + 1;
      if (nextIndex >= levelConfig.roundCount) {
        setGameState('complete');
      } else {
        setRoundIndex(nextIndex);
        const newRound = buildOddOneOutRound(currentLevel, usedCategories);
        setCurrentRound(newRound);
        setUsedCategories((prev) => [...prev, newRound.category]);
        setSelectedAnswer(null);
        setShowResult(false);
        setFeedback('Tap the one that does NOT belong!');
      }
    }, 2000);
  };

  const handleLevelChange = (level: number) => {
    playClick();
    setCurrentLevel(level);
    setRoundIndex(0);
    setScore(0);
    setCorrectCount(0);
    setUsedCategories([]);
    setCurrentRound(null);
    setGameState('playing');
    setSelectedAnswer(null);
    setShowResult(false);
    setFeedback('Tap the one that does NOT belong!');
  };

  const handleFinish = useCallback(async () => {
    playClick();
    const finalScore = Math.round(score / levelConfig.roundCount);
    try {
      await saveProgress({
        score: finalScore,
        completed: true,
        level: currentLevel,
        metadata: {
          correct: correctCount,
          total: levelConfig.roundCount,
        },
      });
      await onGameComplete(finalScore);
    } catch (err) {
      console.error('Failed to save progress:', err);
    }
    navigate('/games');
  }, [score, levelConfig, currentLevel, correctCount, saveProgress, onGameComplete, navigate, playClick]);

  const handleRestart = () => {
    playClick();
    setRoundIndex(0);
    setScore(0);
    setCorrectCount(0);
    setUsedCategories([]);
    setCurrentRound(null);
    setGameState('playing');
    setSelectedAnswer(null);
    setShowResult(false);
    setFeedback('Tap the one that does NOT belong!');
  };

  return (
    <GameContainer
      title="Odd One Out"
      onHome={() => navigate('/games')}
      reportSession={false}
    >
      <div className="flex flex-col items-center gap-4 p-4 max-w-2xl mx-auto">
        <div className="flex gap-2">
          {LEVELS.map((level) => (
            <button
              type="button"
              key={level.level}
              onClick={() => handleLevelChange(level.level)}
              className={`px-4 py-2 rounded-full font-bold transition-all ${currentLevel === level.level
                  ? 'bg-green-500 text-white shadow-lg'
                  : 'bg-slate-50 border-2 border-slate-200 text-slate-700 hover:border-slate-400'
                }`}
            >
              Level {level.level}
            </button>
          ))}
        </div>

        {gameState === 'playing' && currentRound && (
          <>
            <div className="text-center">
              <p className="text-lg text-gray-700 font-medium">{feedback}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 w-full max-w-md">
              {currentRound.items.map((item) => {
                let buttonClass = 'bg-white border-4 border-gray-200 hover:border-green-300';

                if (showResult) {
                  if (item.name === currentRound.oddItem.name) {
                    buttonClass = 'bg-yellow-100 border-4 border-yellow-400 animate-pulse';
                  } else if (selectedAnswer === item.name && item.name !== currentRound.oddItem.name) {
                    buttonClass = 'bg-red-100 border-4 border-red-400';
                  }
                }

                return (
                  <button
                    type="button"
                    key={item.name}
                    onClick={() => handleAnswer(item.name)}
                    disabled={showResult}
                    className={`${buttonClass} p-4 rounded-2xl font-bold text-5xl transition-all disabled:cursor-not-allowed`}
                  >
                    {item.emoji}
                  </button>
                );
              })}
            </div>

            <div className="flex gap-4 text-center">
              <div className="bg-green-100 px-4 py-2 rounded-xl">
                <p className="text-sm text-green-600 font-medium">Correct</p>
                <p className="text-2xl font-bold text-green-700">{correctCount}</p>
              </div>
              <div className="bg-blue-100 px-4 py-2 rounded-xl">
                <p className="text-sm text-blue-600 font-medium">Score</p>
                <p className="text-2xl font-bold text-blue-700">{score}</p>
              </div>
              <div className="bg-purple-100 px-4 py-2 rounded-xl">
                <p className="text-sm text-purple-600 font-medium">Round</p>
                <p className="text-2xl font-bold text-purple-700">{roundIndex + 1}/{levelConfig.roundCount}</p>
              </div>
            </div>
          </>
        )}

        {gameState === 'complete' && (
          <div className="text-center">
            <p className="text-4xl mb-4">🎉</p>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Great Job!</h2>
            <p className="text-xl text-gray-600 mb-4">
              You got {correctCount} out of {levelConfig.roundCount} correct!
            </p>
            <p className="text-2xl font-bold text-purple-600 mb-6">Score: {score}</p>
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleRestart}
            className="px-6 py-3 bg-slate-100 border-2 border-slate-200 hover:bg-slate-200 text-slate-700 rounded-xl font-black transition-all"
          >
            Play Again
          </button>
          <button
            type="button"
            onClick={handleFinish}
            className="px-6 py-3 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white rounded-xl font-bold shadow-lg transition-all"
          >
            Finish
          </button>
        </div>
      </div>
    </GameContainer>
  );
});

// Main export wrapped with GameShell
export const OddOneOut = memo(function OddOneOutComponent() {
  const { saveProgress } = useGameProgress('odd-one-out');

  return (
    <GameShell
      gameId="odd-one-out"
      gameName="Odd One Out"
      showWellnessTimer={true}
      enableErrorBoundary={true}
    >
      <OddOneOutGame saveProgress={saveProgress} />
    </GameShell>
  );
});
