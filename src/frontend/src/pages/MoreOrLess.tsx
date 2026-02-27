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
  const [selectedSide, setSelectedSide] = useState<'left' | 'right' | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [feedback, setFeedback] = useState('');

  const { playClick, playSuccess, playError, playCelebration } = useAudio();
  const { onGameComplete } = useGameDrops('more-or-less');

  useGameSessionProgress({
    gameName: 'More or Less',
    score,
    level: currentLevel,
    isPlaying: true,
    metaData: { correct, round },
  });

  const startNewRound = () => {
    const newQuestion = generateQuestion(currentLevel);
    setQuestion(newQuestion);
    setRound((r) => r + 1);
    setSelectedSide(null);
    setShowResult(false);
    setFeedback('');
  };

  const getCorrectSide = (q: CompareQuestion): 'left' | 'right' => {
    if (q.question === 'more') return q.left.count > q.right.count ? 'left' : 'right';
    return q.left.count < q.right.count ? 'left' : 'right';
  };

  const handleAnswer = (side: 'left' | 'right') => {
    if (showResult || !question) return;
    playClick();
    setSelectedSide(side);
    setShowResult(true);
    const correctSide = getCorrectSide(question);
    if (side === correctSide) {
      playSuccess();
      setCorrect((c) => c + 1);
      setScore((s) => s + 20);
      setFeedback('✅ Correct! Great job!');
      if (correct > 0 && (correct + 1) % 5 === 0) playCelebration();
    } else {
      playError();
      setFeedback(`❌ The ${correctSide} group has ${question.question}!`);
    }
    setTimeout(startNewRound, 2200);
  };

  const handleStart = () => { playClick(); startNewRound(); };
  const handleFinish = useCallback(async () => {
    playClick();
    await onGameComplete(Math.round(score / 20));
    navigate('/games');
  }, [score, onGameComplete, navigate, playClick]);

  const renderGroup = (emoji: string, count: number, side: 'left' | 'right') => {
    const correctSide = question ? getCorrectSide(question) : null;
    const isWinner = showResult && correctSide === side;
    const isLoser = showResult && correctSide !== side && selectedSide === side;
    return (
      <button
        type='button'
        onClick={() => handleAnswer(side)}
        disabled={showResult}
        className={[
          'flex-1 flex flex-col items-center gap-4 p-6 rounded-3xl border-3 transition-all',
          showResult
            ? isWinner
              ? 'bg-emerald-50 border-emerald-400 shadow-[0_4px_0_#6EE7B7] scale-105'
              : isLoser
                ? 'bg-red-50 border-red-300'
                : 'bg-slate-50 border-slate-200'
            : side === 'left'
              ? 'bg-blue-50 border-blue-300 hover:border-blue-500 hover:scale-105 active:scale-95 cursor-pointer shadow-[0_4px_0_#93C5FD]'
              : 'bg-pink-50 border-pink-300 hover:border-pink-500 hover:scale-105 active:scale-95 cursor-pointer shadow-[0_4px_0_#F9A8D4]',
        ].join(' ')}
      >
        <div className='flex flex-wrap justify-center gap-1 min-h-20 content-center'>
          {Array.from({ length: count }).map((_, i) => (
            <span key={i} className='text-3xl'>{emoji}</span>
          ))}
        </div>
        <span className='text-4xl font-black text-slate-700'>{count}</span>
        {showResult && isWinner && <span className='text-2xl'>✅</span>}
        {showResult && isLoser && <span className='text-2xl'>❌</span>}
      </button>
    );
  };

  return (
    <GameContainer
      title='More or Less'
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
                onClick={() => { playClick(); setCurrentLevel(l.level); setQuestion(null); }}
                className={`px-5 py-2 rounded-full font-black text-sm transition-all shadow-[0_3px_0_#6D28D9] ${currentLevel === l.level
                    ? 'bg-purple-500 text-white border-2 border-purple-600'
                    : 'bg-white text-slate-700 border-2 border-[#F2CC8F] hover:border-purple-300'
                  }`}
              >
                Level {l.level}
              </button>
            ))}
          </div>

          {/* Menu */}
          {!question ? (
            <div className='flex flex-col items-center gap-6 bg-white rounded-3xl border-3 border-[#F2CC8F] p-10 shadow-[0_6px_0_#E5B86E] text-center'>
              <div className='text-7xl'>⚖️</div>
              <div>
                <h2 className='text-4xl font-black text-slate-900 tracking-tight'>More or Less!</h2>
                <p className='text-lg font-bold text-slate-600 mt-2'>Compare two groups — which has MORE or LESS?</p>
              </div>
              <div className='flex items-center gap-4 text-sm font-bold text-slate-600'>
                <span className='px-3 py-1 bg-purple-50 rounded-full border border-purple-200'>Score +20 per correct</span>
                <span className='px-3 py-1 bg-blue-50 rounded-full border border-blue-200'>3 Levels</span>
              </div>
              <button
                type='button'
                onClick={handleStart}
                className='px-12 py-5 bg-purple-500 hover:bg-purple-600 text-white rounded-2xl font-black text-2xl shadow-[0_4px_0_#6D28D9] hover:scale-105 active:scale-95 transition-all'
              >
                Start Comparing! ⚖️
              </button>
            </div>
          ) : (
            <>
              {/* Question prompt */}
              <div className='bg-white rounded-2xl border-2 border-[#F2CC8F] px-5 py-4 shadow-[0_4px_0_#E5B86E] text-center'>
                <p className='text-sm font-black uppercase tracking-widest text-purple-400 mb-1'>Round {round}</p>
                <p className='text-3xl font-black text-slate-900'>
                  Which group has{' '}
                  <span className={question.question === 'more' ? 'text-emerald-500' : 'text-red-500'}>
                    {question.question.toUpperCase()}?
                  </span>
                </p>
              </div>

              {/* Side-by-side groups */}
              <div className='flex gap-4 items-stretch'>
                {renderGroup(question.left.emoji, question.left.count, 'left')}
                <div className='flex items-center'>
                  <span className='text-2xl font-black text-slate-400'>vs</span>
                </div>
                {renderGroup(question.right.emoji, question.right.count, 'right')}
              </div>

              {/* Feedback */}
              {feedback && (
                <div className={`rounded-2xl px-5 py-4 border-2 font-bold text-lg text-center ${feedback.startsWith('✅')
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                    : 'bg-red-50 border-red-300 text-red-700'
                  }`}>
                  {feedback}
                </div>
              )}

              {/* Stats + controls */}
              <div className='flex items-center justify-between'>
                <div className='flex gap-3'>
                  <div className='bg-emerald-50 border-2 border-emerald-200 px-4 py-2 rounded-xl text-center'>
                    <p className='text-xs font-black uppercase text-emerald-600'>Correct</p>
                    <p className='text-2xl font-black text-emerald-700'>{correct}</p>
                  </div>
                  <div className='bg-purple-50 border-2 border-purple-200 px-4 py-2 rounded-xl text-center'>
                    <p className='text-xs font-black uppercase text-purple-600'>Score</p>
                    <p className='text-2xl font-black text-purple-700'>{score}</p>
                  </div>
                </div>
                <button
                  type='button'
                  onClick={handleFinish}
                  className='px-6 py-3 rounded-xl bg-purple-500 text-white font-black shadow-[0_3px_0_#6D28D9] hover:scale-105 active:scale-95 transition-all'
                >
                  Finish
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </GameContainer>
  );
}
