import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GameContainer } from '../components/GameContainer';
import { useAudio } from '../utils/hooks/useAudio';
import { useGameDrops } from '../hooks/useGameDrops';
import { useGameSessionProgress } from '../hooks/useGameSessionProgress';
import { LEVELS, getWordsForLevel, type SightWord } from '../games/sightWordFlashLogic';

export function SightWordFlash() {
  const navigate = useNavigate();
  const [currentLevel, setCurrentLevel] = useState(1);
  const [words, setWords] = useState<SightWord[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [showWord, setShowWord] = useState(false);
  const [gameState, setGameState] = useState<'start' | 'showing' | 'answering' | 'complete'>('start');

  const { playClick, playSuccess, playError } = useAudio();
  const { onGameComplete } = useGameDrops('sight-word-flash');

  useGameSessionProgress({ gameName: 'Sight Word Flash', score, level: currentLevel, isPlaying: true, metaData: { correct, round } });

  // Track pending show so we don't double-trigger
  const showPending = useRef(false);

  // When words are loaded and gameState is 'showing', display the current word
  useEffect(() => {
    if (gameState === 'showing' && words.length > 0 && !showWord && !showPending.current) {
      showPending.current = true;
      setShowWord(true);
      setTimeout(() => {
        setShowWord(false);
        setGameState('answering');
        showPending.current = false;
      }, 2000);
    }
  }, [gameState, words, showWord]);

  const startGame = () => {
    const newWords = getWordsForLevel(currentLevel);
    showPending.current = false;
    setWords(newWords);
    setCurrentIndex(0);
    setRound(0);
    setScore(0);
    setCorrect(0);
    setShowWord(false);
    setGameState('showing');
    // showCurrentWord is now driven by useEffect above once words & state are ready
  };

  const handleKnow = () => {
    playSuccess();
    setCorrect((c) => c + 1);
    setScore((s) => s + 20);
    nextWord();
  };

  const handleDontKnow = () => {
    playError();
    nextWord();
  };

  const nextWord = () => {
    if (currentIndex < words.length - 1) {
      setCurrentIndex((i) => i + 1);
      setRound((r) => r + 1);
      showPending.current = false;
      setShowWord(false);
      setGameState('showing');
    } else {
      setGameState('complete');
    }
  };

  const handleStart = () => { playClick(); startGame(); };
  const handleFinish = useCallback(async () => { playClick(); await onGameComplete(correct); navigate('/games'); }, [correct, onGameComplete, navigate, playClick]);

  const currentWord = words[currentIndex];

  return (
    <GameContainer title="Sight Word Flash" onHome={() => navigate('/games')} reportSession={false}>
      <div className="flex flex-col items-center gap-4 p-4">
        <div className="flex gap-2">
          {LEVELS.map((l) => (
            <button type="button" key={l.level} onClick={() => { playClick(); setCurrentLevel(l.level); }}
              className={`px-4 py-2 rounded-full font-bold ${currentLevel === l.level ? 'bg-red-500 text-white' : 'bg-gray-200'}`}>
              Level {l.level}
            </button>
          ))}
        </div>

        {gameState === 'start' && (
          <div className="text-center">
            <p className="text-6xl mb-4">👀</p>
            <h2 className="text-2xl font-bold mb-2">Sight Word Flash!</h2>
            <p className="mb-4">How many words do you know?</p>
            <button type="button" onClick={handleStart} className="px-8 py-4 bg-red-500 text-white rounded-2xl font-bold text-xl">Start Reading! 📖</button>
          </div>
        )}

        {gameState === 'showing' && (
          <div className="text-center">
            <p className="text-4xl text-gray-500 mb-4">Get ready...</p>
            <div className="w-48 h-48 bg-gray-100 rounded-full flex items-center justify-center animate-pulse">
              <span className="text-2xl">👀</span>
            </div>
          </div>
        )}

        {(gameState === 'showing' || gameState === 'answering') && showWord && (
          <div className="text-center animate-pulse">
            <p className="text-8xl font-bold text-purple-600">{currentWord?.word}</p>
          </div>
        )}

        {gameState === 'answering' && !showWord && currentWord && (
          <>
            <p className="text-xl font-bold">Did you know this word?</p>
            <p className="text-6xl font-bold text-purple-600 mb-4">{currentWord.word}</p>
            <div className="flex gap-4">
              <button type="button" onClick={handleKnow}
                className="px-8 py-4 bg-green-500 text-white rounded-xl font-bold text-xl">
                I Know It! ✓
              </button>
              <button type="button" onClick={handleDontKnow}
                className="px-8 py-4 bg-red-500 text-white rounded-xl font-bold text-xl">
                Skip It ✗
              </button>
            </div>
          </>
        )}

        {gameState === 'complete' && (
          <div className="text-center">
            <p className="text-6xl mb-4">🎉</p>
            <h2 className="text-2xl font-bold mb-2">Great Reading!</h2>
            <p className="text-xl mb-4">You know {correct} out of {words.length} words!</p>
            <p className="text-2xl font-bold text-green-600 mb-4">Score: {score}</p>
            <button type="button" onClick={handleStart} className="px-6 py-3 bg-red-500 text-white rounded-xl font-bold mr-4">Play Again</button>
            <button type="button" onClick={handleFinish} className="px-6 py-3 bg-gray-200 rounded-xl font-bold">Finish</button>
          </div>
        )}
      </div>
    </GameContainer>
  );
}
