import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GameContainer } from '../components/GameContainer';
import { useAudio } from '../utils/hooks/useAudio';
import { useGameDrops } from '../hooks/useGameDrops';
import { useGameSessionProgress } from '../hooks/useGameSessionProgress';
import { LEVELS, generatePattern, generateOptions, type PatternItem } from '../games/patternPlayLogic';

const COLOR_MAP: Record<string, string> = {
  red: 'bg-red-500', blue: 'bg-blue-500', green: 'bg-green-500', purple: 'bg-purple-500', orange: 'bg-orange-500',
};

export function PatternPlay() {
  const navigate = useNavigate();
  const [currentLevel, setCurrentLevel] = useState(1);
  const [pattern, setPattern] = useState<{ shown: PatternItem[]; answer: PatternItem } | null>(null);
  const [options, setOptions] = useState<PatternItem[]>([]);
  const [score, setScore] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [round, setRound] = useState(0);
  const [gameState, setGameState] = useState<'start' | 'playing' | 'complete'>('start');
  const [feedback, setFeedback] = useState('');

  const { playClick, playSuccess, playError } = useAudio();
  const { onGameComplete } = useGameDrops('pattern-play');

  useGameSessionProgress({ gameName: 'Pattern Play', score, level: currentLevel, isPlaying: true, metaData: { correct, round } });

  const startGame = () => {
    const newPattern = generatePattern(currentLevel);
    setPattern(newPattern);
    setOptions(generateOptions(newPattern.answer));
    setScore(0);
    setCorrect(0);
    setRound(0);
    setGameState('playing');
    setFeedback('');
  };

  const handleAnswer = (answer: PatternItem) => {
    if (!pattern || gameState !== 'playing') return;
    playClick();
    if (answer.shape === pattern.answer.shape && answer.color === pattern.answer.color) {
      playSuccess();
      setCorrect(c => c + 1);
      setScore(s => s + 25);
      setFeedback('Pattern complete!');
    } else {
      playError();
      setFeedback('Try the next one!');
    }
    setTimeout(() => {
      if (round >= 4) {
        setGameState('complete');
      } else {
        setRound(r => r + 1);
        const newPattern = generatePattern(currentLevel);
        setPattern(newPattern);
        setOptions(generateOptions(newPattern.answer));
        setFeedback('');
      }
    }, 1000);
  };

  const handleStart = () => { playClick(); startGame(); };
  const handleFinish = useCallback(async () => { playClick(); await onGameComplete(correct); navigate('/games'); }, [correct, onGameComplete, navigate, playClick]);

  return (
    <GameContainer title="Pattern Play" onHome={() => navigate('/games')} reportSession={false}>
      <div className="flex flex-col items-center gap-4 p-4">
        <div className="flex gap-2">
          {LEVELS.map((l) => (
            <button type="button" key={l.level} onClick={() => { playClick(); setCurrentLevel(l.level); }}
              className={`px-4 py-2 rounded-full font-bold ${currentLevel === l.level ? 'bg-pink-500 text-white' : 'bg-gray-200'}`}>
              Level {l.level}
            </button>
          ))}
        </div>

        {gameState === 'start' && (
          <div className="text-center">
            <p className="text-6xl mb-4">🔮</p>
            <h2 className="text-2xl font-bold mb-2">Pattern Play!</h2>
            <p className="mb-4">Complete the pattern!</p>
            <button type="button" onClick={handleStart} className="px-8 py-4 bg-pink-500 text-white rounded-2xl font-bold text-xl">Start!</button>
          </div>
        )}

        {gameState === 'playing' && pattern && (
          <div className="text-center">
            <p className="text-xl font-bold mb-4">What comes next?</p>
            <div className="flex gap-2 mb-6">
              {pattern.shown.map((item, idx) => (
                <div key={idx} className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl ${COLOR_MAP[item.color] || 'bg-gray-300'}`}>
                  {item.shape}
                </div>
              ))}
              <div className="w-12 h-12 rounded-lg bg-gray-300 flex items-center justify-center text-2xl">?</div>
            </div>
            <div className="flex gap-3 mb-4">
              {options.map((opt, idx) => (
                <button key={idx} type="button" onClick={() => handleAnswer(opt)}
                  className={`w-16 h-16 rounded-lg flex items-center justify-center text-3xl ${COLOR_MAP[opt.color] || 'bg-gray-300'}`}>
                  {opt.shape}
                </button>
              ))}
            </div>
            <p className="text-lg font-medium text-purple-600">{feedback}</p>
            <div className="flex gap-4 mt-4">
              <div className="bg-green-100 px-4 py-2 rounded-xl text-center"><p className="text-sm">Correct</p><p className="text-2xl font-bold">{correct}</p></div>
              <div className="bg-pink-100 px-4 py-2 rounded-xl text-center"><p className="text-sm">Round</p><p className="text-2xl font-bold">{round + 1}/5</p></div>
            </div>
          </div>
        )}

        {gameState === 'complete' && (
          <div className="text-center">
            <p className="text-6xl mb-4">🎉</p>
            <h2 className="text-2xl font-bold mb-2">Pattern Master!</h2>
            <p className="text-xl mb-4">You got {correct} right!</p>
            <p className="text-2xl font-bold text-green-600 mb-4">Score: {score}</p>
            <button type="button" onClick={handleStart} className="px-6 py-3 bg-pink-500 text-white rounded-xl font-bold mr-4">Play Again</button>
            <button type="button" onClick={handleFinish} className="px-6 py-3 bg-gray-200 rounded-xl font-bold">Finish</button>
          </div>
        )}
      </div>
    </GameContainer>
  );
}
