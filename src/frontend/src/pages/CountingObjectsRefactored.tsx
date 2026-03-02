/**
 * Counting Objects Game - REFACTORED with GameShell
 * 
 * @ticket GQ-002, GQ-003, GQ-004, GQ-005, GQ-007
 */

import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GameContainer } from '../components/GameContainer';
import { useAudio } from '../utils/hooks/useAudio';
import { useGameDrops } from '../hooks/useGameDrops';
import { useGameSessionProgress } from '../hooks/useGameSessionProgress';
import { LEVELS, generateCountingScene, type CountingScene } from '../games/countingObjectsLogic';

const CountingObjectsGame = memo(function CountingObjectsGameComponent() {
  const navigate = useNavigate();
  const [currentLevel, setCurrentLevel] = useState(1);
  const [scene, setScene] = useState<CountingScene | null>(null);
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [feedback, setFeedback] = useState('How many do you see?');

  const { playClick, playSuccess, playError, playCelebration } = useAudio();
  const { onGameComplete } = useGameDrops('counting-objects');

  useGameSessionProgress({
    gameName: 'Counting Objects',
    score,
    level: currentLevel,
    isPlaying: true,
    metaData: { correct, round },
  });

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
      setFeedback(`✅ Correct! There are ${scene.answer} ${scene.targetItem}!`);
      if (correct > 0 && (correct + 1) % 5 === 0) playCelebration();
    } else {
      playError();
      setFeedback(`❌ There are ${scene.answer} ${scene.targetItem}.`);
    }
    setTimeout(startNewRound, 2000);
  };

  const handleStart = () => {
    playClick();
    startNewRound();
  };

  const handleFinish = useCallback(async () => {
    playClick();
    await onGameComplete(Math.round(score / 20));
    navigate('/games');
  }, [score, onGameComplete, navigate, playClick]);

  const answerOptions = scene
    ? [...new Set([scene.answer, scene.answer + 1, scene.answer - 1, scene.answer + 2])]
      .filter((n) => n > 0)
      .sort(() => Math.random() - 0.5)
      .slice(0, 4)
    : [];

  return (
    <GameContainer
      title='Counting Objects'
      score={score}
      level={currentLevel}
      showScore
      onHome={() => navigate('/games')}
      reportSession={false}
    >
      <div className='h-full overflow-auto p-4 md:p-6'>
        <div className='max-w-2xl mx-auto space-y-4'>

          {/* Level selector */}
          <div className='flex gap-2 justify-center'>
            {LEVELS.map((l) => (
              <button
                key={l.level}
                type='button'
                onClick={() => { playClick(); setCurrentLevel(l.level); setScene(null); }}
                className={`px-5 py-2 rounded-full font-black text-sm transition-all shadow-[0_3px_0_#C2410C] ${currentLevel === l.level
                    ? 'bg-[#F97316] text-white border-2 border-[#EA580C]'
                    : 'bg-white text-slate-700 border-2 border-[#F2CC8F] hover:border-orange-300'
                  }`}
              >
                Level {l.level}
              </button>
            ))}
          </div>

          {/* Menu */}
          {!scene ? (
            <div className='flex flex-col items-center gap-6 bg-white rounded-3xl border-3 border-[#F2CC8F] p-10 shadow-[0_6px_0_#E5B86E] text-center'>
              <div className='text-7xl'>🍎</div>
              <div>
                <h2 className='text-4xl font-black text-slate-900 tracking-tight'>Counting Objects!</h2>
                <p className='text-lg font-bold text-slate-600 mt-2'>Count the items and pick the right number!</p>
              </div>
              <div className='flex items-center gap-4 text-sm font-bold text-slate-600'>
                <span className='px-3 py-1 bg-orange-50 rounded-full border border-orange-200'>Score +20 per correct</span>
                <span className='px-3 py-1 bg-green-50 rounded-full border border-green-200'>3 Levels</span>
              </div>
              <button
                type='button'
                onClick={handleStart}
                className='px-12 py-5 bg-[#F97316] hover:bg-orange-600 text-white rounded-2xl font-black text-2xl shadow-[0_4px_0_#C2410C] hover:scale-105 active:scale-95 transition-all'
              >
                Start Counting! 🔢
              </button>
            </div>
          ) : (
            <>
              {/* Question */}
              <div className='bg-white rounded-2xl border-2 border-[#F2CC8F] p-5 shadow-[0_4px_0_#E5B86E]'>
                <p className='text-sm font-black uppercase tracking-widest text-orange-500 mb-2'>Round {round}</p>
                <p className='text-2xl font-black text-slate-900'>
                  How many <span className='text-[#F97316]'>{scene.targetItem}</span> do you see?
                </p>
              </div>

              {/* Items display */}
              <div className='bg-gradient-to-br from-orange-50 via-yellow-50 to-white rounded-2xl border-2 border-[#F2CC8F] p-6 shadow-[0_4px_0_#E5B86E] min-h-28 flex flex-wrap justify-center gap-2 items-center'>
                {scene.items.map((item, idx) =>
                  Array.from({ length: item.count }).map((_, jdx) => (
                    <span
                      key={`${item.emoji}-${idx}-${jdx}`}
                      className='text-4xl select-none hover:scale-110 transition-transform'
                    >
                      {item.emoji}
                    </span>
                  ))
                )}
              </div>

              {/* Answer choices */}
              <div className='grid grid-cols-2 gap-3'>
                {answerOptions.map((num) => {
                  const isCorrect = num === scene.answer;
                  const isSelected = num === selectedAnswer;
                  return (
                    <button
                      key={num}
                      type='button'
                      onClick={() => handleAnswer(num)}
                      disabled={showResult}
                      className={[
                        'p-5 rounded-2xl font-black text-3xl transition-all shadow-[0_4px_0_#E5B86E] border-2',
                        showResult
                          ? isCorrect
                            ? 'bg-emerald-100 border-emerald-400 text-emerald-700 scale-105'
                            : isSelected
                              ? 'bg-red-100 border-red-400 text-red-700'
                              : 'bg-slate-50 border-slate-200 text-slate-400'
                          : 'bg-white border-[#F2CC8F] text-slate-900 hover:border-orange-400 hover:scale-105 active:scale-95 cursor-pointer',
                      ].join(' ')}
                    >
                      {num}
                    </button>
                  );
                })}
              </div>

              {/* Feedback */}
              <div className={`rounded-2xl px-5 py-4 border-2 font-bold text-lg text-center transition-all ${showResult && selectedAnswer === scene.answer
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                  : showResult
                    ? 'bg-red-50 border-red-300 text-red-700'
                    : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}>
                {feedback}
              </div>

              {/* Stats + controls */}
              <div className='flex items-center justify-between gap-3'>
                <div className='flex gap-3'>
                  <div className='bg-emerald-50 border-2 border-emerald-200 px-4 py-2 rounded-xl text-center'>
                    <p className='text-xs font-black uppercase text-emerald-600'>Correct</p>
                    <p className='text-2xl font-black text-emerald-700'>{correct}</p>
                  </div>
                  <div className='bg-orange-50 border-2 border-orange-200 px-4 py-2 rounded-xl text-center'>
                    <p className='text-xs font-black uppercase text-orange-600'>Score</p>
                    <p className='text-2xl font-black text-orange-700'>{score}</p>
                  </div>
                </div>
                <div className='flex gap-2'>
                  <button
                    type='button'
                    onClick={startNewRound}
                    className='px-5 py-3 rounded-xl border-2 border-slate-200 bg-white font-black text-slate-700 hover:border-slate-300 transition-all'
                  >
                    Skip
                  </button>
                  <button
                    type='button'
                    onClick={handleFinish}
                    className='px-5 py-3 rounded-xl bg-[#F97316] text-white font-black shadow-[0_3px_0_#C2410C] hover:scale-105 active:scale-95 transition-all'
                  >
                    Finish
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </GameContainer>
  );
}

// Main export wrapped with GameShell
export const CountingObjects = memo(function CountingObjectsComponent() {
  return (
    <GameShell
      gameId="counting-objects"
      gameName="Counting Objects"
      showWellnessTimer={true}
      enableErrorBoundary={true}
    >
      <CountingObjectsGame />
    </GameShell>
  );
});
