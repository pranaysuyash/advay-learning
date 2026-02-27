import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GameContainer } from '../components/GameContainer';
import { useAudio } from '../utils/hooks/useAudio';
import { useGameDrops } from '../hooks/useGameDrops';
import { useGameSessionProgress } from '../hooks/useGameSessionProgress';
import { LEVELS, getWordsForLevel, checkAnswer, type BlendWord } from '../games/blendBuilderLogic';

export function BlendBuilder() {
  const navigate = useNavigate();
  const [currentLevel, setCurrentLevel] = useState(1);
  const [words, setWords] = useState<BlendWord[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [gameState, setGameState] = useState<'start' | 'playing' | 'complete'>('start');

  const { playClick, playSuccess, playError } = useAudio();
  const { onGameComplete } = useGameDrops('blend-builder');

  useGameSessionProgress({ gameName: 'Blend Builder', score, level: currentLevel, isPlaying: true, metaData: { correct, round } });

  const startGame = () => {
    const newWords = getWordsForLevel(currentLevel);
    setWords(newWords);
    setCurrentIndex(0);
    setRound(0);
    setScore(0);
    setCorrect(0);
    setUserAnswer('');
    setShowResult(false);
    setFeedback('');
    setGameState('playing');
  };

  const handleSubmit = () => {
    if (showResult || !words[currentIndex]) return;
    playClick();
    const currentWord = words[currentIndex];
    const isCorrect = checkAnswer(currentWord.word, userAnswer);
    setShowResult(true);
    if (isCorrect) {
      playSuccess();
      setCorrect((c) => c + 1);
      setScore((s) => s + 30);
      setFeedback(`Correct! The word is "${currentWord.word}"!`);
    } else {
      playError();
      setFeedback(`The word is "${currentWord.word}"!`);
    }
    setTimeout(() => {
      if (currentIndex < words.length - 1) {
        setCurrentIndex((i) => i + 1);
        setRound((r) => r + 1);
        setUserAnswer('');
        setShowResult(false);
        setFeedback('');
      } else {
        setGameState('complete');
      }
    }, 2000);
  };

  const handleStart = () => { playClick(); startGame(); };
  const handleFinish = useCallback(async () => { playClick(); await onGameComplete(correct); navigate('/games'); }, [correct, onGameComplete, navigate, playClick]);

  const currentWord = words[currentIndex];

  return (
    <GameContainer title="Blend Builder" onHome={() => navigate('/games')} reportSession={false}>
      <div className="flex flex-col items-center gap-4 p-4">
        <div className="flex gap-2">
          {LEVELS.map((l) => (
            <button type="button" key={l.level} onClick={() => { playClick(); setCurrentLevel(l.level); }}
              className={`px-4 py-2 rounded-full font-bold ${currentLevel === l.level ? 'bg-green-500 text-white' : 'bg-gray-200'}`}>
              Level {l.level}
            </button>
          ))}
        </div>

        {gameState === 'start' && (
          <div className="text-center">
            <p className="text-6xl mb-4">🧩</p>
            <h2 className="text-2xl font-bold mb-2">Blend Builder!</h2>
            <p className="mb-4">Blend the sounds to make a word!</p>
            <button type="button" onClick={handleStart} className="px-8 py-4 bg-green-500 text-white rounded-2xl font-bold text-xl">Start Building! 🅰️</button>
          </div>
        )}

        {gameState === 'playing' && currentWord && (
          <>
            <div className="bg-yellow-100 p-4 rounded-xl text-center">
              <p className="text-sm text-gray-600 mb-2">Hint: {currentWord.hint}</p>
              <p className="text-6xl font-bold text-purple-600 mb-2">
                {currentWord.onset} + {currentWord.rime}
              </p>
            </div>
            <p className="text-xl font-bold">What word do these sounds make?</p>
            <input
              type="text"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="Type the word..."
              disabled={showResult}
              className="px-6 py-3 text-2xl border-4 border-purple-300 rounded-xl text-center w-48"
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            />
            <button type="button" onClick={handleSubmit} disabled={showResult || !userAnswer}
              className="px-8 py-4 bg-green-500 text-white rounded-xl font-bold text-xl disabled:bg-gray-300">
              Check Answer
            </button>
            <p className="text-lg font-medium text-purple-600">{feedback}</p>
            <div className="flex gap-4">
              <div className="bg-green-100 px-4 py-2 rounded-xl text-center"><p className="text-sm">Correct</p><p className="text-2xl font-bold">{correct}</p></div>
              <div className="bg-yellow-100 px-4 py-2 rounded-xl text-center"><p className="text-sm">Word</p><p className="text-2xl font-bold">{currentIndex + 1}/{words.length}</p></div>
              <div className="bg-green-100 px-4 py-2 rounded-xl text-center"><p className="text-sm">Score</p><p className="text-2xl font-bold">{score}</p></div>
            </div>
          </>
        )}

        {gameState === 'complete' && (
          <div className="text-center">
            <p className="text-6xl mb-4">🎉</p>
            <h2 className="text-2xl font-bold mb-2">Great Job!</h2>
            <p className="text-xl mb-4">You got {correct} out of {words.length} words correct!</p>
            <p className="text-2xl font-bold text-green-600 mb-4">Score: {score}</p>
            <button type="button" onClick={handleStart} className="px-6 py-3 bg-green-500 text-white rounded-xl font-bold mr-4">Play Again</button>
            <button type="button" onClick={handleFinish} className="px-6 py-3 bg-gray-200 rounded-xl font-bold">Finish</button>
          </div>
        )}
      </div>
    </GameContainer>
  );
}
