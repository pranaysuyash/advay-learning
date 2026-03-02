import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GameContainer } from '../components/GameContainer';
import { useAudio } from '../utils/hooks/useAudio';
import { useGameDrops } from '../hooks/useGameDrops';
import { useGameSessionProgress } from '../hooks/useGameSessionProgress';
import { LEVELS, generateQuestion, generateOptions, type Question } from '../games/mathSmashLogic';

export function MathSmash() {
  const navigate = useNavigate();
  const [currentLevel, setCurrentLevel] = useState(1);
  const [question, setQuestion] = useState<Question | null>(null);
  const [options, setOptions] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [round, setRound] = useState(0);
  const [gameState, setGameState] = useState<'start' | 'playing' | 'complete'>('start');
  const [feedback, setFeedback] = useState('');

  const { playClick, playSuccess, playError } = useAudio();
  const { onGameComplete } = useGameDrops('math-smash');

  useGameSessionProgress({ gameName: 'Math Smash', score, level: currentLevel, isPlaying: true, metaData: { correct, round } });

  const startGame = () => {
    const newQuestion = generateQuestion(currentLevel);
    setQuestion(newQuestion);
    setOptions(generateOptions(newQuestion.answer));
    setScore(0);
    setCorrect(0);
    setRound(0);
    setGameState('playing');
    setFeedback('');
  };

  const handleAnswer = (answer: number) => {
    if (!question || gameState !== 'playing') return;
    playClick();
    if (answer === question.answer) {
      playSuccess();
      setCorrect(c => c + 1);
      setScore(s => s + 25);
      setFeedback('Smashing! Correct!');
    } else {
      playError();
      setFeedback(`The answer was ${question.answer}!`);
    }
    setTimeout(() => {
      const newQuestion = generateQuestion(currentLevel);
      setQuestion(newQuestion);
      setOptions(generateOptions(newQuestion.answer));
      setRound(r => r + 1);
      setFeedback('');
      if (round >= 4) {
        setGameState('complete');
      }
    }, 1500);
  };

  const handleStart = () => { playClick(); startGame(); };
  const handleFinish = useCallback(async () => { playClick(); await onGameComplete(correct); navigate('/games'); }, [correct, onGameComplete, navigate, playClick]);

  return (
    <GameContainer title="Math Smash" onHome={() => navigate('/games')} reportSession={false}>
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
            <p className="text-6xl mb-4">🔨</p>
            <h2 className="text-2xl font-bold mb-2">Math Smash!</h2>
            <p className="mb-4">Solve math and smash the answer!</p>
            <button type="button" onClick={handleStart} className="px-8 py-4 bg-red-500 text-white rounded-2xl font-bold text-xl">Start!</button>
          </div>
        )}

        {gameState === 'playing' && question && (
          <div className="text-center">
            <p className="text-4xl font-bold mb-6">
              {question.num1} {question.operator} {question.num2} = ?
            </p>
            <div className="grid grid-cols-2 gap-4 mb-4">
              {options.map((opt) => (
                <button type="button" key={opt} onClick={() => handleAnswer(opt)}
                  className="p-6 bg-white rounded-xl shadow-md hover:bg-red-50 transition-all text-3xl font-bold text-red-600">
                  {opt}
                </button>
              ))}
            </div>
            <p className="text-lg font-medium text-purple-600">{feedback}</p>
            <div className="flex gap-4 mt-4">
              <div className="bg-green-100 px-4 py-2 rounded-xl text-center"><p className="text-sm">Correct</p><p className="text-2xl font-bold">{correct}</p></div>
              <div className="bg-red-100 px-4 py-2 rounded-xl text-center"><p className="text-sm">Round</p><p className="text-2xl font-bold">{round + 1}/5</p></div>
            </div>
          </div>
        )}

        {gameState === 'complete' && (
          <div className="text-center">
            <p className="text-6xl mb-4">🎉</p>
            <h2 className="text-2xl font-bold mb-2">Smashing!</h2>
            <p className="text-xl mb-4">You got {correct} right!</p>
            <p className="text-2xl font-bold text-green-600 mb-4">Score: {score}</p>
            <button type="button" onClick={handleStart} className="px-6 py-3 bg-red-500 text-white rounded-xl font-bold mr-4">Play Again</button>
            <button type="button" onClick={handleFinish} className="px-6 py-3 bg-gray-200 rounded-xl font-bold">Finish</button>
          </div>
        )}
      </div>
    </GameContainer>
  );
}
