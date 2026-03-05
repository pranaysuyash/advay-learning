import { memo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { GameContainer } from '../components/GameContainer';
import { GameShell } from '../components/GameShell';
import { useGameDrops } from '../hooks/useGameDrops';
import { useGameSessionProgress } from '../hooks/useGameSessionProgress';
import { useStreakTracking } from '../hooks/useStreakTracking';
import { useAudio } from '../utils/hooks/useAudio';
import {
  NUMBER_SEQUENCE_LEVELS,
  createNumberSequenceRound,
  calculateScore,
  type NumberSequenceRound,
} from '../games/numberSequenceLogic';
import { triggerHaptic } from '../utils/haptics';

function NumberSequenceGame() {
  const navigate = useNavigate();
  const { playClick, playSuccess, playError, playCelebration } = useAudio();
  const { onGameComplete } = useGameDrops('number-sequence');

  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [round, setRound] = useState(0);
  const {
    streak,
    maxStreak,
    showMilestone,
    scorePopup,
    incrementStreak,
    resetStreak,
    setScorePopup,
  } = useStreakTracking();
  const [activeRound, setActiveRound] = useState<NumberSequenceRound | null>(null);
  const [feedback, setFeedback] = useState('Find the missing number.');
  const [showResult, setShowResult] = useState(false);

  const roundsPerSession = 8;

  useGameSessionProgress({
    gameName: 'Number Sequence',
    score,
    level,
    isPlaying: Boolean(activeRound),
    metaData: {
      round,
      correct,
      roundsPerSession,
    },
  });

  const startRound = (nextLevel = level) => {
    setActiveRound(createNumberSequenceRound(nextLevel));
    setRound((prev) => prev + 1);
    setShowResult(false);
    setFeedback('Find the missing number.');
  };

  const startGame = () => {
    playClick();
    setScore(0);
    setCorrect(0);
    setRound(0);
    resetStreak();
    startRound();
  };

  const handleAnswer = async (value: number) => {
    if (!activeRound || showResult) return;

    playClick();
    setShowResult(true);
    const ok = value === activeRound.answer;

    if (ok) {
      // Correct answer - build streak
      incrementStreak();

      // Calculate score with streak and level
      const points = calculateScore(streak + 1, level);
      setScore((prev) => prev + points);

      // Show score popup
      setScorePopup({ points });
      setTimeout(() => setScorePopup(null), 700);

      // Haptic feedback
      triggerHaptic('success');

      playSuccess();
      setCorrect((prev) => prev + 1);
      setFeedback(`Correct! ${activeRound.answer} fits the pattern.`);
    } else {
      // Wrong answer - break streak
      resetStreak();
      triggerHaptic('error');
      playError();
      setFeedback(`Try again next round. The answer was ${activeRound.answer}.`);
    }

    const isFinalRound = round >= roundsPerSession;
    if (isFinalRound) {
      playCelebration();
      triggerHaptic('celebration');
      await onGameComplete(score + (ok ? calculateScore(streak + (ok ? 1 : 0), level) : 0));
      setTimeout(() => {
        setActiveRound(null);
      }, 1200);
      return;
    }

    setTimeout(() => {
      startRound();
    }, 1000);
  };

  const handleFinish = async () => {
    playClick();
    await onGameComplete(score);
    navigate('/games');
  };

  return (
    <GameContainer
      title='Number Sequence'
      score={score}
      level={level}
      showScore
      reportSession={false}
      onHome={() => navigate('/games')}
    >
      <div className='h-full overflow-auto p-4 md:p-6'>
        <div className='max-w-4xl mx-auto space-y-4'>
          <div className='flex gap-2 justify-center'>
            {NUMBER_SEQUENCE_LEVELS.map((entry) => (
              <button
                key={entry.level}
                type='button'
                onClick={() => {
                  setLevel(entry.level);
                  setActiveRound(null);
                  setRound(0);
                  setFeedback('Find the missing number.');
                }}
                className={`px-4 py-2 rounded-full border-2 font-black text-sm ${
                  level === entry.level
                    ? 'bg-[#3B82F6] text-white border-[#1D4ED8]'
                    : 'bg-white text-slate-700 border-[#F2CC8F]'
                }`}
              >
                Level {entry.level}
              </button>
            ))}
          </div>

          {!activeRound ? (
            <div className='rounded-3xl border-3 border-[#F2CC8F] bg-white p-8 text-center shadow-[0_6px_0_#E5B86E] space-y-5'>
              <p className='text-sm font-black uppercase tracking-widest text-[#1D4ED8]'>Numeracy</p>
              <h2 className='text-4xl font-black text-slate-900'>Number Sequence</h2>
              <p className='text-lg font-bold text-slate-600' data-ux-goal='Complete number patterns by selecting the missing number.'>
                Complete the pattern by selecting the missing number.
              </p>
              <p className='text-base font-bold text-slate-500' data-ux-instruction='Look at the sequence and tap the number that fits.'>
                Look at the sequence and tap the number that fits.
              </p>
              <button
                type='button'
                onClick={startGame}
                className='px-12 py-4 rounded-2xl bg-[#3B82F6] text-white font-black text-2xl shadow-[0_4px_0_#1D4ED8]'
              >
                Start Pattern Game 🔢
              </button>
            </div>
          ) : (
            <>
              {/* Streak HUD */}
              <div className='flex items-center justify-center gap-3 bg-white rounded-xl border-2 border-orange-200 px-4 py-2 shadow-sm'>
                <span className='font-black text-lg'>🔥 Streak</span>
                <div className='flex gap-1'>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <img
                      key={i}
                      src={
                        streak >= i * 2
                          ? '/assets/kenney/platformer/hud/hud_heart.png'
                          : '/assets/kenney/platformer/hud/hud_heart_empty.png'
                      }
                      alt={streak >= i * 2 ? 'filled heart' : 'empty heart'}
                      className='w-6 h-6'
                    />
                  ))}
                </div>
                <span className='font-black text-2xl text-orange-500 min-w-[2ch] text-center'>
                  {streak}
                </span>
              </div>

              {/* Streak milestone popup */}
              {showMilestone && (
                <div className='animate-bounce bg-orange-100 border-2 border-orange-300 rounded-xl px-6 py-3 text-center'>
                  <p className='text-xl font-black text-orange-600'>
                    🔥 {streak} Streak! 🔥
                  </p>
                </div>
              )}

              {/* Score popup */}
              {scorePopup && (
                <div className='font-black text-3xl text-green-500 animate-bounce text-center'>
                  +{scorePopup.points}
                </div>
              )}

              <div className='rounded-2xl border-2 border-[#F2CC8F] bg-white p-4 shadow-[0_4px_0_#E5B86E]'>
                <p className='text-sm font-black uppercase tracking-wide text-slate-500'>Round {round} / {roundsPerSession}</p>
                <div className='mt-3 grid grid-cols-5 gap-2 text-center'>
                  {activeRound.sequence.map((value, idx) => (
                    <div
                      key={`${value}-${idx}`}
                      className='rounded-xl border-2 border-[#F2CC8F] bg-[#F8FAFC] px-3 py-4 text-3xl font-black text-slate-800'
                    >
                      {idx === activeRound.missingIndex ? '?' : value}
                    </div>
                  ))}
                </div>
              </div>

              <div className='rounded-2xl border-2 border-[#F2CC8F] bg-white p-4'>
                <p className='text-sm font-bold uppercase tracking-wide text-slate-500 mb-3'>Choose the missing number</p>
                <div className='grid grid-cols-2 sm:grid-cols-4 gap-3'>
                  {activeRound.options.map((option) => (
                    <button
                      key={option}
                      type='button'
                      disabled={showResult}
                      onClick={() => {
                        void handleAnswer(option);
                      }}
                      className='rounded-xl border-2 border-[#F2CC8F] bg-[#EFF6FF] px-4 py-3 text-2xl font-black text-slate-800 hover:border-[#3B82F6] disabled:opacity-70'
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              {/* Stats */}
              <div className='flex gap-4 justify-center'>
                <div className='bg-blue-50 border-2 border-blue-200 px-4 py-2 rounded-xl text-center'>
                  <p className='text-xs font-black uppercase text-blue-600'>Correct</p>
                  <p className='text-2xl font-black text-blue-700'>{correct}</p>
                </div>
                <div className='bg-orange-50 border-2 border-orange-200 px-4 py-2 rounded-xl text-center'>
                  <p className='text-xs font-black uppercase text-orange-600'>Best Streak</p>
                  <p className='text-2xl font-black text-orange-700'>{maxStreak}</p>
                </div>
              </div>

              <div className='rounded-2xl border-2 border-[#F2CC8F] bg-white p-4 flex items-center justify-between'>
                <p className='font-bold text-slate-700'>{feedback}</p>
                <button
                  type='button'
                  onClick={() => {
                    void handleFinish();
                  }}
                  className='px-5 py-2 rounded-xl bg-[#3B82F6] text-white font-black shadow-[0_3px_0_#1D4ED8]'
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

export const NumberSequence = memo(function NumberSequencePage() {
  return (
    <GameShell gameId='number-sequence' gameName='Number Sequence' showWellnessTimer enableErrorBoundary>
      <NumberSequenceGame />
    </GameShell>
  );
});
