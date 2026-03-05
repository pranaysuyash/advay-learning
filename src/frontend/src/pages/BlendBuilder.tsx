/**
 * Blend Builder Game
 *
 * @ticket GQ-002, GQ-003, GQ-004, GQ-005, GQ-007
 */

import { memo, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GameContainer } from '../components/GameContainer';
import { GameShell } from '../components/GameShell';
import { useAudio } from '../utils/hooks/useAudio';
import { useGameDrops } from '../hooks/useGameDrops';
import { useGameSessionProgress } from '../hooks/useGameSessionProgress';
import { useStreakTracking } from '../hooks/useStreakTracking';
import { triggerHaptic } from '../utils/haptics';
import { LEVELS, getWordsForLevel, checkAnswer, type BlendWord } from '../games/blendBuilderLogic';

const BlendBuilderGame = memo(function BlendBuilderGameComponent() {
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

  // Streak tracking
  const { streak, showMilestone, scorePopup, incrementStreak, resetStreak, setScorePopup } = useStreakTracking();

  const { playClick, playSuccess, playError, playCelebration } = useAudio();
  const { onGameComplete } = useGameDrops('blend-builder');

  useGameSessionProgress({
    gameName: 'Blend Builder',
    score,
    level: currentLevel,
    isPlaying: gameState === 'playing',
    metaData: { correct, round },
  });

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
    resetStreak();
  };

  const handleSubmit = () => {
    if (showResult || !words[currentIndex]) return;
    playClick();
    const currentWord = words[currentIndex];
    const isCorrect = checkAnswer(currentWord.word, userAnswer);
    setShowResult(true);
    if (isCorrect) {
      playSuccess();
      const newStreak = incrementStreak();
      setCorrect((c) => c + 1);
      const basePoints = 10;
      const streakBonus = Math.min(newStreak * 2, 15);
      const totalPoints = basePoints + streakBonus;
      setScore((s) => s + totalPoints);
      setScorePopup({ points: totalPoints, x: 50, y: 30 });
      setFeedback(`✅ "${currentWord.word}" — well done!`);
      triggerHaptic('success');
      if (newStreak > 0 && newStreak % 5 === 0) {
        playCelebration();
        triggerHaptic('celebration');
      }
    } else {
      playError();
      resetStreak();
      triggerHaptic('error');
      setFeedback(`❌ The word is "${currentWord.word}"!`);
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
        if (correct >= words.length * 0.8) playCelebration();
      }
    }, 2000);
  };

  const handleStart = () => { playClick(); startGame(); };
  const handleFinish = useCallback(async () => {
    playClick();
    await onGameComplete(correct);
    navigate('/games');
  }, [correct, onGameComplete, navigate, playClick]);

  const currentWord = words[currentIndex];

  return (
    <GameContainer
      title='Blend Builder'
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
                onClick={() => { playClick(); setCurrentLevel(l.level); setGameState('start'); resetStreak(); }}
                className={`px-5 py-2 rounded-full font-black text-sm transition-all shadow-[0_3px_0_#15803D] ${currentLevel === l.level
                    ? 'bg-[#22C55E] text-white border-2 border-green-600'
                    : 'bg-white text-slate-700 border-2 border-[#F2CC8F] hover:border-green-300'
                  }`}
              >
                Level {l.level}
              </button>
            ))}
          </div>

          {/* Menu */}
          {gameState === 'start' && (
            <div className='flex flex-col items-center gap-6 bg-white rounded-3xl border-3 border-[#F2CC8F] p-10 shadow-[0_6px_0_#E5B86E] text-center'>
              <div className='text-7xl'>🔤</div>
              <div>
                <h2 className='text-4xl font-black text-slate-900 tracking-tight'>Blend Builder!</h2>
                <p className='text-lg font-bold text-slate-600 mt-2'>
                  Blend the sounds together to make a real word — then type it!
                </p>
              </div>
              <div className='flex items-center gap-3 text-sm font-bold text-slate-600'>
                <span className='px-3 py-1 bg-green-50 rounded-full border border-green-200'>Score +30 per correct</span>
                <span className='px-3 py-1 bg-yellow-50 rounded-full border border-yellow-200'>Build phonics skills</span>
              </div>
              <button
                type='button'
                onClick={handleStart}
                className='px-12 py-5 bg-[#22C55E] hover:bg-green-600 text-white rounded-2xl font-black text-2xl shadow-[0_4px_0_#15803D] hover:scale-105 active:scale-95 transition-all'
              >
                Start Building! 🔤
              </button>
            </div>
          )}

          {/* Playing */}
          {gameState === 'playing' && currentWord && (
            <>
              {/* Progress bar */}
              <div className='bg-white rounded-2xl border-2 border-[#F2CC8F] px-5 py-3 shadow-[0_3px_0_#E5B86E]'>
                <div className='flex items-center justify-between mb-2'>
                  <span className='text-sm font-black uppercase tracking-widest text-green-500'>Word {currentIndex + 1} of {words.length}</span>
                  <div className='flex items-center gap-3'>
                    {streak > 0 && (
                      <span className='text-sm font-black text-orange-500 flex items-center gap-1 animate-pulse'>
                        🔥 {streak}
                      </span>
                    )}
                    <span className='text-sm font-black text-slate-500'>Correct: {correct}</span>
                  </div>
                </div>
                <div className='w-full h-2 bg-slate-100 rounded-full overflow-hidden'>
                  <div
                    className='h-full bg-[#22C55E] rounded-full transition-all'
                    style={{ width: `${((currentIndex) / words.length) * 100}%` }}
                  />
                </div>
              </div>

              {/* Blend card */}
              <div className='bg-gradient-to-br from-green-50 via-yellow-50 to-white rounded-3xl border-3 border-[#F2CC8F] p-8 shadow-[0_6px_0_#E5B86E] text-center'>
                <p className='text-sm font-bold text-slate-400 mb-4'>💡 {currentWord.hint}</p>
                <div className='flex items-center justify-center gap-4'>
                  <span className='text-5xl md:text-6xl font-black text-purple-600 bg-purple-50 border-3 border-purple-200 px-6 py-3 rounded-2xl shadow-[0_3px_0_#A78BFA]'>
                    {currentWord.onset}
                  </span>
                  <span className='text-4xl font-black text-slate-400'>+</span>
                  <span className='text-5xl md:text-6xl font-black text-blue-600 bg-blue-50 border-3 border-blue-200 px-6 py-3 rounded-2xl shadow-[0_3px_0_#93C5FD]'>
                    {currentWord.rime}
                  </span>
                </div>
                <p className='text-lg font-black text-slate-700 mt-5'>What word do these sounds make?</p>
              </div>

              {/* Input */}
              <div className='flex gap-3 items-center'>
                <input
                  type='text'
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value.toLowerCase())}
                  placeholder='Type the word...'
                  disabled={showResult}
                  autoFocus
                  className={[
                    'flex-1 px-5 py-4 text-2xl font-black text-center rounded-2xl border-3 outline-none transition-all',
                    showResult
                      ? feedback.startsWith('✅')
                        ? 'border-emerald-400 bg-emerald-50 text-emerald-700'
                        : 'border-red-400 bg-red-50 text-red-700'
                      : 'border-[#F2CC8F] bg-white focus:border-green-400 focus:shadow-[0_0_0_3px_#BBF7D0]',
                  ].join(' ')}
                  onKeyDown={(e) => e.key === 'Enter' && !showResult && userAnswer && handleSubmit()}
                />
                <button
                  type='button'
                  onClick={handleSubmit}
                  disabled={showResult || !userAnswer.trim()}
                  className='px-6 py-4 bg-[#22C55E] hover:bg-green-600 text-white rounded-2xl font-black text-lg shadow-[0_4px_0_#15803D] hover:scale-105 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100'
                >
                  Check ✓
                </button>
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

              {/* Score Popup */}
              {scorePopup && (
                <div
                  className='fixed pointer-events-none z-50 animate-bounce'
                  style={{
                    left: `${scorePopup.x}%`,
                    top: `${scorePopup.y}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                >
                  <div className='bg-gradient-to-br from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-full font-black text-xl shadow-lg animate-pulse'>
                    +{scorePopup.points}
                  </div>
                </div>
              )}

              {/* Streak Milestone */}
              {showMilestone && (
                <div className='fixed inset-0 flex items-center justify-center pointer-events-none z-50'>
                  <div className='bg-gradient-to-br from-orange-400 to-red-500 text-white px-8 py-4 rounded-3xl font-black text-3xl shadow-2xl animate-pulse border-4 border-yellow-300'>
                    🔥 {streak} STREAK! 🔥
                  </div>
                </div>
              )}
            </>
          )}

          {/* Complete */}
          {gameState === 'complete' && (
            <div className='flex flex-col items-center gap-5 bg-white rounded-3xl border-3 border-[#F2CC8F] p-10 shadow-[0_6px_0_#E5B86E] text-center'>
              <div className='text-7xl'>🎉</div>
              <h2 className='text-4xl font-black text-slate-900'>Blending Master!</h2>
              <div className='grid grid-cols-3 gap-4 w-full max-w-sm'>
                <div className='bg-emerald-50 border-2 border-emerald-200 px-4 py-3 rounded-xl'>
                  <p className='text-xs font-black uppercase text-emerald-600'>Correct</p>
                  <p className='text-3xl font-black text-emerald-700'>{correct}/{words.length}</p>
                </div>
                <div className='bg-yellow-50 border-2 border-yellow-200 px-4 py-3 rounded-xl'>
                  <p className='text-xs font-black uppercase text-yellow-600'>Accuracy</p>
                  <p className='text-3xl font-black text-yellow-700'>{Math.round((correct / words.length) * 100)}%</p>
                </div>
                <div className='bg-green-50 border-2 border-green-200 px-4 py-3 rounded-xl'>
                  <p className='text-xs font-black uppercase text-green-600'>Score</p>
                  <p className='text-3xl font-black text-green-700'>{score}</p>
                </div>
              </div>
              <div className='flex gap-3'>
                <button
                  type='button'
                  onClick={handleStart}
                  className='px-8 py-4 bg-[#22C55E] text-white rounded-xl font-black shadow-[0_4px_0_#15803D] hover:scale-105 active:scale-95 transition-all'
                >
                  Play Again
                </button>
                <button
                  type='button'
                  onClick={handleFinish}
                  className='px-8 py-4 bg-slate-100 text-slate-700 rounded-xl font-black border-2 border-slate-200 hover:bg-slate-200 transition-all'
                >
                  Finish
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </GameContainer>
  );
});

// Main export wrapped with GameShell
export const BlendBuilder = memo(function BlendBuilderComponent() {
  return (
    <GameShell
      gameId="blend-builder"
      gameName="Blend Builder"
      showWellnessTimer={true}
      enableErrorBoundary={true}
    >
      <BlendBuilderGame />
    </GameShell>
  );
});
