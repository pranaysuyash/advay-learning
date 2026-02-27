import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GameContainer } from '../components/GameContainer';
import { useAudio } from '../utils/hooks/useAudio';
import { useGameDrops } from '../hooks/useGameDrops';
import { useGameSessionProgress } from '../hooks/useGameSessionProgress';
import { LEVELS, generateCountingScene, type CountingScene } from '../games/countingObjectsLogic';

export function CountingObjects() {
  const navigate = useNavigate();
  const [currentLevel, setCurrentLevel] = useState(1);
  const [scene, setScene] = useState<CountingScene | null>(null);
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [feedback, setFeedback] = useState('How many do you see?');

  const { playClick, playSuccess, playError } = useAudio();
  const { onGameComplete } = useGameDrops('counting-objects');

  useGameSessionProgress({ gameName: 'Counting Objects', score, level: currentLevel, isPlaying: true, metaData: { correct, round } });

  const startNewRound = () => {
    const newScene = generateCountingScene(currentLevel);
    setScene(newScene);
    setRound((r) => r + 1);
    setSelectedAnswer(null);
    setShowResult(false);
    setFeedback('How many do you see?');
  };

  const handleAnswer = (num: number) => {
    if (showResult || !scene) return;
    playClick();
    setSelectedAnswer(num);
    setShowResult(true);
    if (num === scene.answer) {
      playSuccess();
      setCorrect((c) => c + 1);
      setScore((s) => s + 20);
      setFeedback(`Correct! There are ${scene.answer} ${scene.targetItem}!`);
    } else {
      playError();
      setFeedback(`Oops! There are ${scene.answer} ${scene.targetItem}.`);
    }
    setTimeout(startNewRound, 2000);
  };

  const handleStart = () => { playClick(); startNewRound(); };
  const handleFinish = useCallback(async () => { playClick(); await onGameComplete(Math.round(score / 20)); navigate('/games'); }, [score, onGameComplete, navigate, playClick]);

  const answerOptions = scene ? [scene.answer, scene.answer + 1, scene.answer - 1, scene.answer + 2].filter((n) => n > 0).sort(() => Math.random() - 0.5).slice(0, 4) : [];

  return (
    <GameContainer title="Counting Objects" onHome={() => navigate('/games')} reportSession={false}>
      <div className="flex flex-col items-center gap-4 p-4">
        <div className="flex gap-2">
          {LEVELS.map((l) => (
            <button type="button" key={l.level} onClick={() => { playClick(); setCurrentLevel(l.level); }}
              className={`px-4 py-2 rounded-full font-bold ${currentLevel === l.level ? 'bg-orange-500 text-white' : 'bg-gray-200'}`}>
              Level {l.level}
            </button>
          ))}
        </div>

        {!scene ? (
          <div className="text-center">
            <p className="text-6xl mb-4">🍎</p>
            <h2 className="text-2xl font-bold mb-2">Counting Objects!</h2>
            <p className="mb-4">How many items can you count?</p>
            <button type="button" onClick={handleStart} className="px-8 py-4 bg-orange-500 text-white rounded-2xl font-bold text-xl">Start Counting! 🔢</button>
          </div>
        ) : (
          <>
            <p className="text-xl font-bold">How many {scene.targetItem}?</p>
            <div className="flex flex-wrap justify-center gap-2 p-4 bg-white rounded-xl">
              {scene.items.map((item, idx) => (
                <div key={`item-${item.emoji}-${idx}`} className="text-4xl">
                  {Array.from({ length: item.count }).map((__, jdx) => <span key={`${item.emoji}-${idx}-${jdx}`}>{item.emoji}</span>)}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3">
              {answerOptions.map((num) => (
                <button key={num} type="button" onClick={() => handleAnswer(num)} disabled={showResult}
                  className={`p-4 rounded-xl font-bold text-2xl transition-all ${showResult ? (num === scene.answer ? 'bg-green-400' : num === selectedAnswer ? 'bg-red-400' : 'bg-gray-200') : 'bg-orange-100 hover:bg-orange-200'}`}>
                  {num}
                </button>
              ))}
            </div>
            <p className="text-lg font-medium text-purple-600">{feedback}</p>
            <div className="flex gap-4">
              <div className="bg-green-100 px-4 py-2 rounded-xl text-center"><p className="text-sm">Correct</p><p className="text-2xl font-bold">{correct}</p></div>
              <div className="bg-orange-100 px-4 py-2 rounded-xl text-center"><p className="text-sm">Score</p><p className="text-2xl font-bold">{score}</p></div>
            </div>
          </>
        )}

        {scene && (
          <div className="flex gap-3">
            <button type="button" onClick={handleStart} className="px-6 py-3 bg-gray-200 rounded-xl font-bold">Next</button>
            <button type="button" onClick={handleFinish} className="px-6 py-3 bg-orange-500 text-white rounded-xl font-bold">Finish</button>
          </div>
        )}
      </div>
    </GameContainer>
  );
}
