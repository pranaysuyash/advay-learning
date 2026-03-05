import { useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { GameContainer } from '../components/GameContainer';
import { useAudio } from '../utils/hooks/useAudio';
import { triggerHaptic } from '../utils/haptics';
import { useGameDrops } from '../hooks/useGameDrops';
import { useGameSessionProgress } from '../hooks/useGameSessionProgress';
import { LEVELS, getWordsForLevel, checkAnswer, type SyllableWord } from '../games/syllableClapLogic';
import { STREAK_MILESTONE_INTERVAL } from '../games/constants';

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
  const [lastAnswer, setLastAnswer] = useState<number | null>(null);
  const [gameState, setGameState] = useState<'start' | 'playing' | 'complete'>('start');
  const [streak, setStreak] = useState(0);
  const [scorePopup, setScorePopup] = useState<{ points: number } | null>(null);
  const [showStreakMilestone, setShowStreakMilestone] = useState(false);

  const { playClick, playError, playCelebration } = useAudio();
  const { onGameComplete } = useGameDrops('syllable-clap');

  useGameSessionProgress({
    gameName: 'Syllable Clap',
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
    setStreak(0);
    setScorePopup(null);
    setShowStreakMilestone(false);
    setShowResult(false);
    setFeedback('');
    setLastAnswer(null);
    setGameState('playing');
  };

  const handleAnswer = (answer: number) => {
    if (showResult || !words[currentIndex]) return;
    playClick();
    const currentWord = words[currentIndex];
    const isCorrect = checkAnswer(currentWord.syllableCount, answer);
    setShowResult(true);
    setLastAnswer(answer);
    if (isCorrect) {
      // Build streak
      const newStreak = streak + 1;
      setStreak(newStreak);
      
      // Calculate score with streak bonus
      const basePoints = 15;
      const streakBonus = Math.min(newStreak * 3, 15);
      const totalPoints = basePoints + streakBonus;
      setScore((s) => s + totalPoints);
      setCorrect((c) => c + 1);
      
      // Show score popup
      setScorePopup({ points: totalPoints });
      setTimeout(() => setScorePopup(null), 700);
      
      // Haptics
      triggerHaptic('success');

      // Milestone every 5
      if (newStreak > 0 && newStreak % STREAK_MILESTONE_INTERVAL === 0) {
        setShowStreakMilestone(true);
        triggerHaptic('celebration');
        playCelebration();
      }
      
      setFeedback(`✅ Yes! "${currentWord.word}" has ${currentWord.syllableCount} syllable${currentWord.syllableCount > 1 ? 's' : ''}!`);
    } else {
      // Wrong - break streak
      setStreak(0);
      setShowStreakMilestone(false);
      triggerHaptic('error');
      playError();
      setFeedback(`❌ "${currentWord.word}" has ${currentWord.syllableCount} syllable${currentWord.syllableCount > 1 ? 's' : ''}!`);
    }
    setTimeout(() => {
      if (currentIndex < words.length - 1) {
        setCurrentIndex((i) => i + 1);
        setRound((r) => r + 1);
        setShowResult(false);
        setFeedback('');
        setLastAnswer(null);
      } else {
        setGameState('complete');
        triggerHaptic('celebration');
        if (correct >= words.length * 0.8) playCelebration();
      }
    }, 2500);
  };

  const handleStart = () => { playClick(); startGame(); };
  const handleFinish = useCallback(async () => {
    playClick();
    await onGameComplete(correct);
    navigate('/games');
  }, [correct, onGameComplete, navigate, playClick]);

  const currentWord = words[currentIndex];
  const maxSyllables = LEVELS[currentLevel - 1]?.maxSyllables ?? 3;

  return (
    <GameContainer
      title='Syllable Clap'
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
                className={`px-5 py-2 rounded-full font-black text-sm transition-all shadow-[0_3px_0_#1D4ED8] ${currentLevel === l.level
                    ? 'bg-[#3B82F6] text-white border-2 border-blue-600'
                    : 'bg-white text-slate-700 border-2 border-[#F2CC8F] hover:border-blue-300'
                  }`}
              >
                Level {l.level}
              </button>
            ))}
          </div>

          {/* Menu */}
          {gameState === 'start' && (
            <div className='flex flex-col items-center gap-6 bg-white rounded-3xl border-3 border-[#F2CC8F] p-10 shadow-[0_6px_0_#E5B86E] text-center'>
              <div className='text-7xl'>👏</div>
              <div>
                <h2 className='text-4xl font-black text-slate-900 tracking-tight'>Syllable Clap!</h2>
                <p className='text-lg font-bold text-slate-600 mt-2'>
                  Listen to a word and clap out its syllables — then tap the right number!
                </p>
              </div>
              <div className='flex items-center gap-3 text-sm font-bold text-slate-600'>
                <span className='px-3 py-1 bg-blue-50 rounded-full border border-blue-200'>Score +25 per correct</span>
                <span className='px-3 py-1 bg-purple-50 rounded-full border border-purple-200'>10 words per round</span>
              </div>
              <button
                type='button'
                onClick={handleStart}
                className='px-12 py-5 bg-[#3B82F6] hover:bg-blue-600 text-white rounded-2xl font-black text-2xl shadow-[0_4px_0_#1D4ED8] hover:scale-105 active:scale-95 transition-all'
              >
                Start Clapping! 👏
              </button>
            </div>
          )}

          {/* Playing */}
          {gameState === 'playing' && currentWord && (
            <>
              {/* Progress bar */}
              <div className='bg-white rounded-2xl border-2 border-[#F2CC8F] px-5 py-3 shadow-[0_3px_0_#E5B86E]'>
                <div className='flex items-center justify-between mb-2'>
                  <span className='text-sm font-black uppercase tracking-widest text-blue-400'>Word {currentIndex + 1} of {words.length}</span>
                  <span className='text-sm font-black text-slate-500'>Correct: {correct}</span>
                </div>
                <div className='w-full h-2 bg-slate-100 rounded-full overflow-hidden'>
                  <div
                    className='h-full bg-[#3B82F6] rounded-full transition-all'
                    style={{ width: `${((currentIndex) / words.length) * 100}%` }}
                  />
                </div>
              </div>

              {/* Kenney Heart HUD */}
              <div className="flex items-center justify-center gap-1 bg-white rounded-2xl px-4 py-2 border-2 border-pink-200 shadow-sm">
                {Array.from({ length: 5 }).map((_, i) => (
                  <img
                    key={i}
                    src={streak >= (i + 1) * 2
                      ? '/assets/kenney/platformer/hud/hud_heart.png'
                      : '/assets/kenney/platformer/hud/hud_heart_empty.png'}
                    alt=""
                    className="w-7 h-7"
                  />
                ))}
                <span className="ml-2 text-base font-bold text-pink-500">x{streak}</span>
              </div>

              {/* Score Popup Animation */}
              {scorePopup && (
                <motion.div
                  initial={{ opacity: 0, y: 0, scale: 0.5 }}
                  animate={{ opacity: 1, y: -40, scale: 1.2 }}
                  exit={{ opacity: 0 }}
                  className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-50"
                >
                  <div className="text-5xl font-black text-green-500 drop-shadow-lg">
                    +{scorePopup.points}
                  </div>
                </motion.div>
              )}

              {/* Streak Milestone */}
              {showStreakMilestone && (
                <motion.div
                  initial={{ scale: 0, rotate: -20 }}
                  animate={{ scale: 1.2, rotate: 0 }}
                  exit={{ scale: 0 }}
                  className="fixed top-1/3 left-1/2 -translate-x-1/2 pointer-events-none z-50"
                >
                  <div className="bg-gradient-to-r from-yellow-300 via-orange-400 to-pink-500 px-6 py-3 rounded-2xl shadow-xl text-white font-black text-2xl">
                    🔥 {streak} Streak! 🔥
                  </div>
                </motion.div>
              )}

              {/* Word card */}
              <div className='bg-gradient-to-br from-blue-50 via-purple-50 to-white rounded-3xl border-3 border-[#F2CC8F] p-8 shadow-[0_6px_0_#E5B86E] text-center'>
                <div className='text-7xl mb-4'>{currentWord.emoji}</div>
                <p className='text-5xl font-black text-purple-600 mb-3'>"{currentWord.word}"</p>
                <p className='text-sm font-bold text-slate-400'>💡 {currentWord.hint}</p>
                <p className='text-lg font-black text-slate-700 mt-4'>How many syllables?</p>
              </div>

              {/* Syllable number buttons */}
              <div className='flex gap-4 justify-center'>
                {Array.from({ length: maxSyllables }, (_, i) => i + 1).map((num) => {
                  const isCorrectNum = num === currentWord.syllableCount;
                  const isSelected = num === lastAnswer;
                  return (
                    <button
                      key={num}
                      type='button'
                      onClick={() => handleAnswer(num)}
                      disabled={showResult}
                      className={[
                        'w-20 h-20 rounded-2xl font-black text-3xl transition-all border-3',
                        showResult
                          ? isCorrectNum
                            ? 'bg-emerald-100 border-emerald-400 text-emerald-700 scale-110 shadow-[0_4px_0_#6EE7B7]'
                            : isSelected
                              ? 'bg-red-100 border-red-400 text-red-700'
                              : 'bg-slate-50 border-slate-200 text-slate-300'
                          : 'bg-white border-[#F2CC8F] text-slate-900 hover:border-blue-400 hover:scale-110 hover:bg-blue-50 active:scale-95 cursor-pointer shadow-[0_4px_0_#E5B86E]',
                      ].join(' ')}
                    >
                      {num}
                    </button>
                  );
                })}
              </div>

              {/* Clap hint */}
              <div className='text-center text-sm font-bold text-slate-400'>
                Tap the number! 👆 Or clap along and count.
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
            </>
          )}

          {/* Complete */}
          {gameState === 'complete' && (
            <div className='flex flex-col items-center gap-5 bg-white rounded-3xl border-3 border-[#F2CC8F] p-10 shadow-[0_6px_0_#E5B86E] text-center'>
              <div className='text-7xl'>🎉</div>
              <h2 className='text-4xl font-black text-slate-900'>Great Job!</h2>
              <div className='grid grid-cols-3 gap-4 w-full max-w-sm'>
                <div className='bg-emerald-50 border-2 border-emerald-200 px-4 py-3 rounded-xl'>
                  <p className='text-xs font-black uppercase text-emerald-600'>Correct</p>
                  <p className='text-3xl font-black text-emerald-700'>{correct}/{words.length}</p>
                </div>
                <div className='bg-blue-50 border-2 border-blue-200 px-4 py-3 rounded-xl'>
                  <p className='text-xs font-black uppercase text-blue-600'>Accuracy</p>
                  <p className='text-3xl font-black text-blue-700'>{Math.round((correct / words.length) * 100)}%</p>
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
                  className='px-8 py-4 bg-[#3B82F6] text-white rounded-xl font-black shadow-[0_4px_0_#1D4ED8] hover:scale-105 active:scale-95 transition-all'
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
