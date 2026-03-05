import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GameContainer } from '../components/GameContainer';
import { useAudio } from '../utils/hooks/useAudio';
import { useGameDrops } from '../hooks/useGameDrops';
import { useGameSessionProgress } from '../hooks/useGameSessionProgress';
import { triggerHaptic } from '../utils/haptics';
import { LEVELS, getWordsForLevel, type SightWord } from '../games/sightWordFlashLogic';
import { STREAK_MILESTONE_INTERVAL, STREAK_MILESTONE_DURATION_MS } from '../games/constants';

export function SightWordFlash() {
  const navigate = useNavigate();
  const [currentLevel, setCurrentLevel] = useState(1);
  const [words, setWords] = useState<SightWord[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [showWord, setShowWord] = useState(false);
  const [flashProgress, setFlashProgress] = useState(0); // 0-100 countdown for flash timer
  const [gameState, setGameState] = useState<'start' | 'showing' | 'answering' | 'complete'>('start');
  const [streak, setStreak] = useState(0);
  const [showStreakMilestone, setShowStreakMilestone] = useState(false);

  const { playClick, playSuccess, playError, playCelebration } = useAudio();
  const { onGameComplete } = useGameDrops('sight-word-flash');
  const showPending = useRef(false);
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useGameSessionProgress({
    gameName: 'Sight Word Flash',
    score,
    level: currentLevel,
    isPlaying: gameState !== 'start' && gameState !== 'complete',
    metaData: { correct, round },
  });

  // Flash word for 2s then move to answering
  useEffect(() => {
    if (gameState === 'showing' && words.length > 0 && !showWord && !showPending.current) {
      showPending.current = true;
      setShowWord(true);
      setFlashProgress(100);

      // Countdown animation
      const step = 100 / 20; // 20 ticks over 2s
      progressIntervalRef.current = setInterval(() => {
        setFlashProgress((p) => Math.max(p - step, 0));
      }, 100);

      setTimeout(() => {
        if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
        setShowWord(false);
        setGameState('answering');
        showPending.current = false;
      }, 2000);
    }
    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, [gameState, words, showWord]);

  const startGame = () => {
    const newWords = getWordsForLevel(currentLevel);
    showPending.current = false;
    setWords(newWords);
    setCurrentIndex(0);
    setRound(0);
    setScore(0);
    setCorrect(0);
    setStreak(0);
    setShowStreakMilestone(false);
    setShowWord(false);
    setFlashProgress(0);
    setGameState('showing');
  };

  const handleKnow = () => {
    const newStreak = streak + 1;
    setStreak(newStreak);
    const basePoints = 20;
    const streakBonus = Math.min(newStreak * 3, 20);
    const totalPoints = basePoints + streakBonus;
    
    playSuccess();
    triggerHaptic('success');
    setCorrect((c) => c + 1);
    setScore((s) => s + totalPoints);

    // Milestone every 5
    if (newStreak > 0 && newStreak % STREAK_MILESTONE_INTERVAL === 0) {
      setShowStreakMilestone(true);
      triggerHaptic('celebration');
      setTimeout(() => setShowStreakMilestone(false), STREAK_MILESTONE_DURATION_MS);
    }
    
    nextWord();
  };

  const handleDontKnow = () => {
    playError();
    triggerHaptic('error');
    setStreak(0);
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
      playCelebration();
    }
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
      title='Sight Word Flash'
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
                onClick={() => { playClick(); setCurrentLevel(l.level); setGameState('start'); }}
                className={`px-5 py-2 rounded-full font-black text-sm transition-all shadow-[0_3px_0_#B91C1C] ${currentLevel === l.level
                    ? 'bg-[#EF4444] text-white border-2 border-red-600'
                    : 'bg-white text-slate-700 border-2 border-[#F2CC8F] hover:border-red-300'
                  }`}
              >
                Level {l.level}
              </button>
            ))}
          </div>

          {/* Menu */}
          {gameState === 'start' && (
            <div className='flex flex-col items-center gap-6 bg-white rounded-3xl border-3 border-[#F2CC8F] p-10 shadow-[0_6px_0_#E5B86E] text-center'>
              <div className='text-7xl'>👀</div>
              <div>
                <h2 className='text-4xl font-black text-slate-900 tracking-tight'>Sight Word Flash!</h2>
                <p className='text-lg font-bold text-slate-600 mt-2'>
                  A word will flash on the screen. Remember it — then say if you know it!
                </p>
              </div>
              <div className='flex items-center gap-3 text-sm font-bold text-slate-600'>
                <span className='px-3 py-1 bg-red-50 rounded-full border border-red-200'>2 second flash</span>
                <span className='px-3 py-1 bg-purple-50 rounded-full border border-purple-200'>Score +20 per word</span>
              </div>
              <button
                type='button'
                onClick={handleStart}
                className='px-12 py-5 bg-[#EF4444] hover:bg-red-600 text-white rounded-2xl font-black text-2xl shadow-[0_4px_0_#B91C1C] hover:scale-105 active:scale-95 transition-all'
              >
                Start Reading! 📖
              </button>
            </div>
          )}

          {/* Showing — get ready + flash word */}
          {gameState === 'showing' && (
            <div className='flex flex-col items-center gap-6'>
              {/* Progress bar for flash timer */}
              {showWord && (
                <div className='w-full bg-slate-100 rounded-full h-2 overflow-hidden'>
                  <div
                    className='h-full bg-red-400 rounded-full transition-[width] duration-100'
                    style={{ width: `${flashProgress}%` }}
                  />
                </div>
              )}

              <div className='bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl border-3 border-[#F2CC8F] py-16 px-10 shadow-[0_6px_0_#E5B86E] text-center w-full min-h-48 flex items-center justify-center'>
                {showWord ? (
                  <p className='text-7xl md:text-8xl font-black text-purple-700 tracking-tight'>
                    {currentWord?.word}
                  </p>
                ) : (
                  <div className='flex flex-col items-center gap-4'>
                    <div className='w-20 h-20 rounded-full bg-purple-100 border-3 border-purple-300 flex items-center justify-center animate-pulse'>
                      <span className='text-4xl'>👀</span>
                    </div>
                    <p className='text-2xl font-black text-slate-400'>Get ready...</p>
                  </div>
                )}
              </div>

              <div className='text-sm font-bold text-slate-400 text-center'>
                Word {currentIndex + 1} of {words.length}
              </div>
            </div>
          )}

          {/* Streak Milestone Overlay */}
          {showStreakMilestone && (
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              className='fixed inset-0 flex items-center justify-center pointer-events-none z-50'
            >
              <div className='bg-gradient-to-r from-orange-400 to-red-500 text-white px-8 py-4 rounded-full font-bold text-2xl shadow-lg'>
                🔥 {streak} Streak! 🔥
              </div>
            </motion.div>
          )}

          {/* Answering */}
          {gameState === 'answering' && !showWord && currentWord && (
            <>
              <div className='bg-gradient-to-br from-slate-50 to-purple-50 rounded-3xl border-3 border-[#F2CC8F] py-10 px-10 shadow-[0_4px_0_#E5B86E] text-center'>
                <p className='text-sm font-black uppercase tracking-widest text-slate-400 mb-3'>Did you know this word?</p>
                <p className='text-6xl font-black text-purple-700'>{currentWord.word}</p>
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <button
                  type='button'
                  onClick={handleKnow}
                  className='py-6 rounded-3xl font-black text-xl bg-emerald-100 border-3 border-emerald-400 text-emerald-700 shadow-[0_4px_0_#6EE7B7] hover:scale-105 active:scale-95 transition-all'
                >
                  ✅ I Know It!
                </button>
                <button
                  type='button'
                  onClick={handleDontKnow}
                  className='py-6 rounded-3xl font-black text-xl bg-red-50 border-3 border-red-300 text-red-600 shadow-[0_4px_0_#FCA5A5] hover:scale-105 active:scale-95 transition-all'
                >
                  ❌ Skip It
                </button>
              </div>

              <div className='flex items-center justify-between'>
                <div className='flex gap-3'>
                  <div className='bg-emerald-50 border-2 border-emerald-200 px-4 py-2 rounded-xl text-center'>
                    <p className='text-xs font-black uppercase text-emerald-600'>Knew</p>
                    <p className='text-2xl font-black text-emerald-700'>{correct}</p>
                  </div>
                  <div className='bg-slate-50 border-2 border-slate-200 px-4 py-2 rounded-xl text-center'>
                    <p className='text-xs font-black uppercase text-slate-500'>Word</p>
                    <p className='text-2xl font-black text-slate-700'>{currentIndex + 1}/{words.length}</p>
                  </div>
                  {streak > 0 && (
                    <div className='bg-orange-50 border-2 border-orange-200 px-4 py-2 rounded-xl text-center'>
                      <p className='text-xs font-black uppercase text-orange-600'>Streak</p>
                      <p className='text-2xl font-black text-orange-700'>🔥 {streak}</p>
                    </div>
                  )}
                </div>
                <button
                  type='button'
                  onClick={handleFinish}
                  className='px-5 py-3 rounded-xl bg-red-500 text-white font-black shadow-[0_3px_0_#B91C1C] hover:scale-105 active:scale-95 transition-all'
                >
                  Finish
                </button>
              </div>
            </>
          )}

          {/* Complete */}
          {gameState === 'complete' && (
            <div className='flex flex-col items-center gap-5 bg-white rounded-3xl border-3 border-[#F2CC8F] p-10 shadow-[0_6px_0_#E5B86E] text-center'>
              <div className='text-7xl'>📚</div>
              <h2 className='text-4xl font-black text-slate-900'>Great Reading!</h2>
              <div className='grid grid-cols-3 gap-4 w-full max-w-sm'>
                <div className='bg-emerald-50 border-2 border-emerald-200 px-4 py-3 rounded-xl'>
                  <p className='text-xs font-black uppercase text-emerald-600'>Knew</p>
                  <p className='text-3xl font-black text-emerald-700'>{correct}/{words.length}</p>
                </div>
                <div className='bg-red-50 border-2 border-red-200 px-4 py-3 rounded-xl'>
                  <p className='text-xs font-black uppercase text-red-600'>Accuracy</p>
                  <p className='text-3xl font-black text-red-700'>{Math.round((correct / words.length) * 100)}%</p>
                </div>
                <div className='bg-purple-50 border-2 border-purple-200 px-4 py-3 rounded-xl'>
                  <p className='text-xs font-black uppercase text-purple-600'>Score</p>
                  <p className='text-3xl font-black text-purple-700'>{score}</p>
                </div>
              </div>
              <div className='flex gap-3'>
                <button
                  type='button'
                  onClick={handleStart}
                  className='px-8 py-4 bg-[#EF4444] text-white rounded-xl font-black shadow-[0_4px_0_#B91C1C] hover:scale-105 active:scale-95 transition-all'
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
}
