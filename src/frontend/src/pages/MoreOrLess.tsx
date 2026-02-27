import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GameContainer } from '../components/GameContainer';
import { useAudio } from '../utils/hooks/useAudio';
import { useGameDrops } from '../hooks/useGameDrops';
import { useGameSessionProgress } from '../hooks/useGameSessionProgress';
import { LEVELS, generateQuestion, type CompareQuestion } from '../games/moreOrLessLogic';

export function MoreOrLess() {
  const navigate = useNavigate();
  const [currentLevel, setCurrentLevel] = useState(1);
  const [question, setQuestion] = useState<CompareQuestion | null>(null);
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<'left' | 'right' | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [feedback, setFeedback] = useState('Which group has more?');

  const { playClick, playSuccess, playError } = useAudio();
  const { onGameComplete } = useGameDrops('more-or-less');

  useGameSessionProgress({ gameName: 'More or Less', score, level: currentLevel, isPlaying: true, metaData: { correct, round } });

  const startNewRound = () => {
    const newQuestion = generateQuestion(currentLevel);
    setQuestion(newQuestion);
    setRound((r) => r + 1);
    setSelectedAnswer(null);
    setShowResult(false);
    setFeedback(newQuestion.question === 'more' ? 'Which group has MORE?' : 'Which group has LESS?');
  };

  const handleAnswer = (side: 'left' | 'right') => {
    if (showResult || !question) return;
    playClick();
    setSelectedAnswer(side);
    setShowResult(true);
    const correctAnswer = question.question === 'more'
      ? (question.left.count > question.right.count ? 'left' : 'right')
      : (question.left.count < question.right.count ? 'left' : 'right');
    if (side === correctAnswer) {
      playSuccess();
      setCorrect((c) => c + 1);
      setScore((s) => s + 20);
      setFeedback('Correct! Great job!');
    } else {
      playError();
      setFeedback(`The answer is ${correctAnswer === 'left' ? 'this one' : 'this one'}!`);
    }
    setTimeout(startNewRound, 2000);
  };

  const handleStart = () => { playClick(); startNewRound(); };
  const handleFinish = useCallback(async () => { playClick(); await onGameComplete(Math.round(score / 20)); navigate('/games'); }, [score, onGameComplete, navigate, playClick]);

  const renderEmoji = (emoji: string, count: number) => {
    return Array.from({ length: count }).map((_, idx) => (
      <span key={`${emoji}-${idx}`} className="text-3xl">{emoji}</span>
    ));
  };

  return (
    <GameContainer title="More or Less" onHome={() => navigate('/games')} reportSession={false}>
      <div className="flex flex-col items-center gap-4 p-4">
        <div className="flex gap-2">
          {LEVELS.map((l) => (
            <button type="button" key={l.level} onClick={() => { playClick(); setCurrentLevel(l.level); }}
              className={`px-4 py-2 rounded-full font-bold ${currentLevel === l.level ? 'bg-purple-500 text-white' : 'bg-gray-200'}`}>
              Level {l.level}
            </button>
          ))}
        </div>

        {!question ? (
          <div className="text-center">
            <p className="text-6xl mb-4">⚖️</p>
            <h2 className="text-2xl font-bold mb-2">More or Less!</h2>
            <p className="mb-4">Compare groups and find which has more or less!</p>
            <button type="button" onClick={handleStart} className="px-8 py-4 bg-purple-500 text-white rounded-2xl font-bold text-xl">Start Comparing! 🔢</button>
          </div>
        ) : (
          <>
            <p className="text-xl font-bold">{question.question === 'more' ? 'Which has MORE?' : 'Which has LESS?'}</p>
            <div className="flex gap-8 items-center">
              <div className="flex flex-col items-center gap-2">
                <div className="flex flex-wrap justify-center gap-1 p-4 bg-blue-50 rounded-xl min-w-32">
                  {renderEmoji(question.left.emoji, question.left.count)}
                </div>
                <button type="button" onClick={() => handleAnswer('left')} disabled={showResult}
                  className={`px-6 py-3 rounded-xl font-bold text-lg transition-all ${showResult ? (question.left.count > question.right.count === (question.question === 'more') ? 'bg-green-400' : selectedAnswer === 'left' ? 'bg-red-400' : 'bg-gray-200') : 'bg-blue-200 hover:bg-blue-300'}`}>
                  This One
                </button>
              </div>
              <span className="text-2xl font-bold text-gray-400">vs</span>
              <div className="flex flex-col items-center gap-2">
                <div className="flex flex-wrap justify-center gap-1 p-4 bg-pink-50 rounded-xl min-w-32">
                  {renderEmoji(question.right.emoji, question.right.count)}
                </div>
                <button type="button" onClick={() => handleAnswer('right')} disabled={showResult}
                  className={`px-6 py-3 rounded-xl font-bold text-lg transition-all ${showResult ? (question.right.count > question.left.count === (question.question === 'more') ? 'bg-green-400' : selectedAnswer === 'right' ? 'bg-red-400' : 'bg-gray-200') : 'bg-pink-200 hover:bg-pink-300'}`}>
                  This One
                </button>
              </div>
            </div>
            <p className="text-lg font-medium text-purple-600">{feedback}</p>
            <div className="flex gap-4">
              <div className="bg-green-100 px-4 py-2 rounded-xl text-center"><p className="text-sm">Correct</p><p className="text-2xl font-bold">{correct}</p></div>
              <div className="bg-purple-100 px-4 py-2 rounded-xl text-center"><p className="text-sm">Score</p><p className="text-2xl font-bold">{score}</p></div>
            </div>
          </>
        )}

        {question && (
          <div className="flex gap-3">
            <button type="button" onClick={handleStart} className="px-6 py-3 bg-gray-200 rounded-xl font-bold">Next</button>
            <button type="button" onClick={handleFinish} className="px-6 py-3 bg-purple-500 text-white rounded-xl font-bold">Finish</button>
          </div>
        )}
      </div>
    </GameContainer>
  );
}
