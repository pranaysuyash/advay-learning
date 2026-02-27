import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GameContainer } from '../components/GameContainer';
import { useAudio } from '../utils/hooks/useAudio';
import { useGameDrops } from '../hooks/useGameDrops';
import { useGameSessionProgress } from '../hooks/useGameSessionProgress';
import { LEVELS, getWordsForLevel, checkAnswer, type SyllableWord } from '../games/syllableClapLogic';

export function SyllableClap() {
  const navigate = useNavigate();
  const [currentLevel, setCurrentLevel] = useState(1);
  const [words, setWords] = useState<SyllableWord[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [gameState, setGameState] = useState<'start' | 'playing' | 'complete'>('start');

  const { playClick, playSuccess, playError } = useAudio();
  const { onGameComplete } = useGameDrops('syllable-clap');

  useGameSessionProgress({ gameName: 'Syllable Clap', score, level: currentLevel, isPlaying: true, metaData: { correct, round } });

  const startGame = () => {
    const newWords = getWordsForLevel(currentLevel);
    setWords(newWords);
    setCurrentIndex(0);
    setRound(0);
    setScore(0);
    setCorrect(0);
    setShowResult(false);
    setFeedback('');
    setGameState('playing');
  };

  const handleAnswer = (answer: number) => {
    if (showResult || !words[currentIndex]) return;
    playClick();
    const currentWord = words[currentIndex];
    const isCorrect = checkAnswer(currentWord.syllableCount, answer);
    setShowResult(true);
    if (isCorrect) {
      playSuccess();
      setCorrect((c) => c + 1);
      setScore((s) => s + 25);
      setFeedback(`Correct! "${currentWord.word}" has ${currentWord.syllableCount} syllable${currentWord.syllableCount > 1 ? 's' : ''}!`);
    } else {
      playError();
      setFeedback(`"${currentWord.word}" has ${currentWord.syllableCount} syllable${currentWord.syllableCount > 1 ? 's' : ''}!`);
    }
    setTimeout(() => {
      if (currentIndex < words.length - 1) {
        setCurrentIndex((i) => i + 1);
        setRound((r) => r + 1);
        setShowResult(false);
        setFeedback('');
      } else {
        setGameState('complete');
      }
    }, 2500);
  };

  const handleStart = () => { playClick(); startGame(); };
  const handleFinish = useCallback(async () => { playClick(); await onGameComplete(correct); navigate('/games'); }, [correct, onGameComplete, navigate, playClick]);

  const currentWord = words[currentIndex];
  const maxSyllables = LEVELS[currentLevel - 1]?.maxSyllables ?? 3;

  return (
    <GameContainer title="Syllable Clap" onHome={() => navigate('/games')} reportSession={false}>
      <div className="flex flex-col items-center gap-4 p-4">
        <div className="flex gap-2">
          {LEVELS.map((l) => (
            <button type="button" key={l.level} onClick={() => { playClick(); setCurrentLevel(l.level); }}
              className={`px-4 py-2 rounded-full font-bold ${currentLevel === l.level ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
              Level {l.level}
            </button>
          ))}
        </div>

        {gameState === 'start' && (
          <div className="text-center">
            <p className="text-6xl mb-4">👏</p>
            <h2 className="text-2xl font-bold mb-2">Syllable Clap!</h2>
            <p className="mb-4">Clap or tap the number of syllables!</p>
            <button type="button" onClick={handleStart} className="px-8 py-4 bg-blue-500 text-white rounded-2xl font-bold text-xl">Start Clapping! 👏</button>
          </div>
        )}

        {gameState === 'playing' && currentWord && (
          <>
            <p className="text-6xl mb-2">{currentWord.emoji}</p>
            <p className="text-2xl font-bold text-purple-600">"{currentWord.word}"</p>
            <p className="text-sm text-gray-500 mb-4">Hint: {currentWord.hint}</p>
            <p className="text-lg font-bold">How many syllables?</p>
            <div className="flex gap-3">
              {Array.from({ length: maxSyllables }, (_, i) => i + 1).map((num) => (
                <button key={num} type="button" onClick={() => handleAnswer(num)} disabled={showResult}
                  className={`w-16 h-16 rounded-full font-bold text-2xl transition-all ${showResult ? (num === currentWord.syllableCount ? 'bg-green-400' : 'bg-gray-200') : 'bg-blue-200 hover:bg-blue-300'}`}>
                  {num}
                </button>
              ))}
            </div>
            <p className="text-lg font-medium text-purple-600">{feedback}</p>
            <div className="flex gap-4">
              <div className="bg-green-100 px-4 py-2 rounded-xl text-center"><p className="text-sm">Correct</p><p className="text-2xl font-bold">{correct}</p></div>
              <div className="bg-blue-100 px-4 py-2 rounded-xl text-center"><p className="text-sm">Word</p><p className="text-2xl font-bold">{currentIndex + 1}/{words.length}</p></div>
              <div className="bg-green-100 px-4 py-2 rounded-xl text-center"><p className="text-sm">Score</p><p className="text-2xl font-bold">{score}</p></div>
            </div>
          </>
        )}

        {gameState === 'complete' && (
          <div className="text-center">
            <p className="text-6xl mb-4">🎉</p>
            <h2 className="text-2xl font-bold mb-2">Great Job!</h2>
            <p className="text-xl mb-4">You got {correct} out of {words.length} correct!</p>
            <p className="text-2xl font-bold text-green-600 mb-4">Score: {score}</p>
            <button type="button" onClick={handleStart} className="px-6 py-3 bg-blue-500 text-white rounded-xl font-bold mr-4">Play Again</button>
            <button type="button" onClick={handleFinish} className="px-6 py-3 bg-gray-200 rounded-xl font-bold">Finish</button>
          </div>
        )}
      </div>
    </GameContainer>
  );
}
