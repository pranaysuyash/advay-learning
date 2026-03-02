import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GameContainer } from '../components/GameContainer';
import { useAudio } from '../utils/hooks/useAudio';
import { useGameDrops } from '../hooks/useGameDrops';
import { useGameSessionProgress } from '../hooks/useGameSessionProgress';
import { LEVELS, generateTime, formatTime, type TimeQuestion } from '../games/timeTellLogic';

function renderClock(hour: number, minute: number, size: number = 200) {
  const hourAngle = (hour % 12) * 30 + minute * 0.5;
  const minuteAngle = minute * 6;
  return (
    <div className="relative rounded-full border-4 border-slate-700" style={{ width: size, height: size, backgroundColor: 'white' }}>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-1 h-1 bg-slate-700 rounded-full" />
      </div>
      <div className="absolute bottom-1/2 left-1/2 w-2 h-16 bg-slate-700 origin-bottom" style={{ transform: `translateX(-50%) rotate(${hourAngle}deg)` }} />
      <div className="absolute bottom-1/2 left-1/2 w-1 h-20 bg-slate-500 origin-bottom" style={{ transform: `translateX(-50%) rotate(${minuteAngle}deg)` }} />
    </div>
  );
}

export function TimeTell() {
  const navigate = useNavigate();
  const [currentLevel, setCurrentLevel] = useState(1);
  const [question, setQuestion] = useState<TimeQuestion | null>(null);
  const [score, setScore] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [round, setRound] = useState(0);
  const [gameState, setGameState] = useState<'start' | 'playing' | 'complete'>('start');
  const [feedback, setFeedback] = useState('');

  const { playClick, playSuccess, playError } = useAudio();
  const { onGameComplete } = useGameDrops('time-tell');

  useGameSessionProgress({ gameName: 'Time Tell', score, level: currentLevel, isPlaying: true, metaData: { correct, round } });

  const startGame = () => {
    const newQuestion = generateTime(currentLevel);
    setQuestion(newQuestion);
    setScore(0);
    setCorrect(0);
    setRound(0);
    setGameState('playing');
    setFeedback('');
  };

  const handleAnswer = (answer: string) => {
    if (!question || gameState !== 'playing') return;
    playClick();
    const correctAnswer = formatTime(question.hour, question.minute);
    if (answer === correctAnswer) {
      playSuccess();
      setCorrect(c => c + 1);
      setScore(s => s + 25);
      setFeedback('Perfect time!');
    } else {
      playError();
      setFeedback(`The time is ${correctAnswer}!`);
    }
    setTimeout(() => {
      if (round >= 4) {
        setGameState('complete');
      } else {
        setRound(r => r + 1);
        setQuestion(generateTime(currentLevel));
        setFeedback('');
      }
    }, 1500);
  };

  const handleStart = () => { playClick(); startGame(); };
  const handleFinish = useCallback(async () => { playClick(); await onGameComplete(correct); navigate('/games'); }, [correct, onGameComplete, navigate, playClick]);

  const options = question ? [
    formatTime(question.hour, question.minute),
    formatTime((question.hour % 12) + 1, question.minute),
    formatTime(question.hour === 1 ? 12 : question.hour - 1, question.minute),
    formatTime(question.hour, question.minute === 0 ? 30 : 0),
  ].sort(() => Math.random() - 0.5) : [];

  return (
    <GameContainer title="Time Tell" onHome={() => navigate('/games')} reportSession={false}>
      <div className="flex flex-col items-center gap-4 p-4">
        <div className="flex gap-2">
          {LEVELS.map((l) => (
            <button type="button" key={l.level} onClick={() => { playClick(); setCurrentLevel(l.level); }}
              className={`px-4 py-2 rounded-full font-bold ${currentLevel === l.level ? 'bg-indigo-500 text-white' : 'bg-gray-200'}`}>
              Level {l.level}
            </button>
          ))}
        </div>

        {gameState === 'start' && (
          <div className="text-center">
            <p className="text-6xl mb-4">🕐</p>
            <h2 className="text-2xl font-bold mb-2">Time Tell!</h2>
            <p className="mb-4">Learn to read the clock!</p>
            <button type="button" onClick={handleStart} className="px-8 py-4 bg-indigo-500 text-white rounded-2xl font-bold text-xl">Start!</button>
          </div>
        )}

        {gameState === 'playing' && question && (
          <div className="text-center">
            <p className="text-xl font-bold mb-4">What time is shown?</p>
            {renderClock(question.hour, question.minute, 180)}
            <div className="flex flex-wrap gap-2 justify-center mt-4 mb-2">
              {options.map((opt, idx) => (
                <button key={idx} type="button" onClick={() => handleAnswer(opt)}
                  className="px-4 py-2 bg-indigo-100 rounded-lg font-bold hover:bg-indigo-200">
                  {opt}
                </button>
              ))}
            </div>
            <p className="text-lg font-medium text-purple-600">{feedback}</p>
            <div className="flex gap-4 mt-4">
              <div className="bg-green-100 px-4 py-2 rounded-xl text-center"><p className="text-sm">Correct</p><p className="text-2xl font-bold">{correct}</p></div>
              <div className="bg-indigo-100 px-4 py-2 rounded-xl text-center"><p className="text-sm">Round</p><p className="text-2xl font-bold">{round + 1}/5</p></div>
            </div>
          </div>
        )}

        {gameState === 'complete' && (
          <div className="text-center">
            <p className="text-6xl mb-4">🎉</p>
            <h2 className="text-2xl font-bold mb-2">Time Master!</h2>
            <p className="text-xl mb-4">You got {correct} right!</p>
            <p className="text-2xl font-bold text-green-600 mb-4">Score: {score}</p>
            <button type="button" onClick={handleStart} className="px-6 py-3 bg-indigo-500 text-white rounded-xl font-bold mr-4">Play Again</button>
            <button type="button" onClick={handleFinish} className="px-6 py-3 bg-gray-200 rounded-xl font-bold">Finish</button>
          </div>
        )}
      </div>
    </GameContainer>
  );
}
