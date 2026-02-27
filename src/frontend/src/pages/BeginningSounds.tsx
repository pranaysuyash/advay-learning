import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GameContainer } from '../components/GameContainer';
import { useAudio } from '../utils/hooks/useAudio';
import { useGameDrops } from '../hooks/useGameDrops';
import { useGameSessionProgress } from '../hooks/useGameSessionProgress';
import {
  LEVELS,
  buildBeginningSoundsRound,
  checkAnswer,
  calculateScore,
  type BeginningSoundsRound,
} from '../games/beginningSoundsLogic';

export function BeginningSounds() {
  const navigate = useNavigate();
  const [currentLevel, setCurrentLevel] = useState(1);
  const [currentRound, setCurrentRound] = useState<BeginningSoundsRound | null>(null);
  const [roundIndex, setRoundIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [gameState, setGameState] = useState<'playing' | 'complete'>('playing');
  const [usedWords, setUsedWords] = useState<string[]>([]);
  const [feedback, setFeedback] = useState('Tap the sound you hear at the start!');

  const { playClick, playSuccess, playError } = useAudio();
  const { onGameComplete } = useGameDrops('beginning-sounds');

  const levelConfig = useMemo(() => LEVELS.find((l) => l.level === currentLevel) ?? LEVELS[0], [currentLevel]);

  useGameSessionProgress({
    gameName: 'Beginning Sounds',
    score,
    level: currentLevel,
    isPlaying: gameState === 'playing',
    metaData: {
      correct: correctCount,
      round: roundIndex,
    },
  });

  const speakWord = useCallback((word: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.rate = 0.7;
      utterance.pitch = 1.1;
      speechSynthesis.speak(utterance);
    }
  }, []);

  const speakSound = useCallback((letter: string) => {
    if ('speechSynthesis' in window) {
      const sounds: Record<string, string> = {
        A: 'Ah like in Apple',
        B: 'Buh like in Ball',
        C: 'Kuh like in Cat',
        D: 'Duh like in Dog',
        E: 'Eh like in Egg',
        F: 'Fuh like in Fish',
        G: 'Guh like in Goat',
        H: 'Huh like in Hat',
        I: 'Ih like in Igloo',
        J: 'Juh like in Jam',
        K: 'Kuh like in Kite',
        L: 'Luh like in Lion',
        M: 'Muh like in Moon',
        N: 'Nuh like in Nest',
        O: 'Oh like in Octopus',
        P: 'Puh like in Pig',
        Q: 'Kwuh like in Queen',
        R: 'Ruh like in Rain',
        S: 'Suh like in Sun',
        T: 'Tuh like in Tree',
        U: 'Uh like in Umbrella',
        V: 'Vuh like in Van',
        W: 'Wuh like in Water',
        X: 'Ks like in Box',
        Y: 'Yuh like in Yellow',
        Z: 'Zuh like in Zoo',
      };
      const utterance = new SpeechSynthesisUtterance(sounds[letter] || letter);
      utterance.rate = 0.8;
      utterance.pitch = 1.2;
      speechSynthesis.speak(utterance);
    }
  }, []);

  useEffect(() => {
    if (gameState === 'playing' && !currentRound) {
      const round = buildBeginningSoundsRound(currentLevel, usedWords);
      setCurrentRound(round);
      setUsedWords((prev) => [...prev, round.targetWord.word]);
    }
  }, [gameState, currentLevel, currentRound, usedWords]);

  const handleAnswer = (letter: string) => {
    if (showResult || !currentRound) return;

    playClick();
    setSelectedAnswer(letter);
    setShowResult(true);

    const isCorrect = checkAnswer(letter, currentRound.targetWord.firstLetter);
    const roundScore = calculateScore(isCorrect, 5, levelConfig.timePerRound);

    if (isCorrect) {
      playSuccess();
      setCorrectCount((prev) => prev + 1);
      setScore((prev) => prev + roundScore);
      setFeedback(`Yes! ${currentRound.targetWord.firstSound} is for ${currentRound.targetWord.word}! ${currentRound.targetWord.emoji}`);
      speakSound(currentRound.targetWord.firstLetter);
    } else {
      playError();
      setFeedback(`Oops! The answer is ${currentRound.targetWord.firstLetter} for ${currentRound.targetWord.word} ${currentRound.targetWord.emoji}`);
      speakSound(currentRound.targetWord.firstLetter);
    }

    setTimeout(() => {
      const nextIndex = roundIndex + 1;
      if (nextIndex >= levelConfig.roundCount) {
        setGameState('complete');
      } else {
        setRoundIndex(nextIndex);
        const newRound = buildBeginningSoundsRound(currentLevel, usedWords);
        setCurrentRound(newRound);
        setUsedWords((prev) => [...prev, newRound.targetWord.word]);
        setSelectedAnswer(null);
        setShowResult(false);
        setFeedback('Tap the sound you hear at the start!');
      }
    }, 2000);
  };

  const handlePlayWord = () => {
    if (currentRound) {
      speakWord(currentRound.targetWord.word);
    }
  };

  const handleLevelChange = (level: number) => {
    playClick();
    setCurrentLevel(level);
    setRoundIndex(0);
    setScore(0);
    setCorrectCount(0);
    setUsedWords([]);
    setCurrentRound(null);
    setGameState('playing');
    setSelectedAnswer(null);
    setShowResult(false);
    setFeedback('Tap the sound you hear at the start!');
  };

  const handleFinish = useCallback(async () => {
    playClick();
    const finalScore = Math.round(score / levelConfig.roundCount);
    await onGameComplete(finalScore);
    navigate('/games');
  }, [score, levelConfig, onGameComplete, navigate, playClick]);

  const handleRestart = () => {
    playClick();
    setRoundIndex(0);
    setScore(0);
    setCorrectCount(0);
    setUsedWords([]);
    setCurrentRound(null);
    setGameState('playing');
    setSelectedAnswer(null);
    setShowResult(false);
    setFeedback('Tap the sound you hear at the start!');
  };

  return (
    <GameContainer
      title="Beginning Sounds"
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
                  ? 'bg-blue-500 text-white shadow-lg'
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
              <p className="text-lg text-gray-700 font-medium mb-2">What sound does this word start with?</p>
              <button
                type="button"
                onClick={handlePlayWord}
                className="text-6xl bg-white p-4 rounded-2xl shadow-md hover:scale-105 transition-transform"
              >
                {currentRound.targetWord.emoji}
              </button>
              <p className="text-2xl font-bold text-gray-800 mt-2">{currentRound.targetWord.word}</p>
              <button
                type="button"
                onClick={handlePlayWord}
                className="mt-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full font-medium hover:bg-blue-200 transition-colors"
              >
                🔊 Hear Word
              </button>
            </div>

            <p className="text-lg text-purple-600 font-medium">{feedback}</p>

            <div className="grid grid-cols-2 gap-3 w-full max-w-md">
              {currentRound.options.map((option) => {
                let buttonClass = 'bg-white border-4 border-gray-200 hover:border-blue-300';

                if (showResult) {
                  if (option.isCorrect) {
                    buttonClass = 'bg-green-100 border-4 border-green-400';
                  } else if (selectedAnswer === option.letter && !option.isCorrect) {
                    buttonClass = 'bg-red-100 border-4 border-red-400';
                  }
                }

                return (
                  <button
                    type="button"
                    key={option.letter}
                    onClick={() => handleAnswer(option.letter)}
                    disabled={showResult}
                    className={`${buttonClass} p-4 rounded-2xl font-bold text-3xl transition-all disabled:cursor-not-allowed`}
                  >
                    {option.letter}
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
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-xl font-bold shadow-lg transition-all"
          >
            Finish
          </button>
        </div>
      </div>
    </GameContainer>
  );
}
