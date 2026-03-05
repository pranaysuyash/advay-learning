import { memo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { GameContainer } from '../components/GameContainer';
import { GameShell } from '../components/GameShell';
import { useGameDrops } from '../hooks/useGameDrops';
import { useGameSessionProgress } from '../hooks/useGameSessionProgress';
import { useStreakTracking } from '../hooks/useStreakTracking';
import { useAudio } from '../utils/hooks/useAudio';
import {
  createSizeSortingRound,
  evaluateSizeSortingPick,
  calculateScore,
  type SizeSortingRound,
} from '../games/sizeSortingLogic';
import { triggerHaptic } from '../utils/haptics';

function SizeSortingGame() {
  const navigate = useNavigate();
  const { playClick, playSuccess, playError, playCelebration } = useAudio();
  const { onGameComplete } = useGameDrops('size-sorting');

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
  const [activeRound, setActiveRound] = useState<SizeSortingRound | null>(null);
  const [pickedIds, setPickedIds] = useState<string[]>([]);
  const [feedback, setFeedback] = useState('Tap items in the right size order.');

  const roundsPerSession = 6;

  useGameSessionProgress({
    gameName: 'Size Sorting',
    score,
    level: 1,
    isPlaying: Boolean(activeRound),
    metaData: {
      round,
      correct,
      roundsPerSession,
    },
  });

  const startRound = () => {
    setActiveRound(createSizeSortingRound());
    setPickedIds([]);
    setRound((prev) => prev + 1);
    setFeedback('Tap items in the right size order.');
  };

  const startGame = () => {
    playClick();
    setScore(0);
    setCorrect(0);
    setRound(0);
    resetStreak();
    startRound();
  };

  const handlePick = async (itemId: string) => {
    if (!activeRound) return;
    playClick();

    const result = evaluateSizeSortingPick(activeRound, pickedIds, itemId);
    if (!result.ok) {
      // Wrong pick - break streak
      resetStreak();
      triggerHaptic('error');
      playError();
      setFeedback(
        activeRound.instruction === 'small-to-big'
          ? 'Try the smaller item first.'
          : 'Try the bigger item first.',
      );
      return;
    }

    const nextPicked = [...pickedIds, itemId];
    setPickedIds(nextPicked);
    playSuccess();
    triggerHaptic('success');

    if (result.completed) {
      // Round completed - build streak
      incrementStreak();

      // Calculate score with streak and instruction multiplier
      const points = calculateScore(streak + 1, activeRound.instruction);
      const nextScore = score + points;
      setScore(nextScore);

      // Show score popup
      setScorePopup({ points });
      setTimeout(() => setScorePopup(null), 700);

      setCorrect((prev) => prev + 1);
      setFeedback('Great sorting!');

      const isFinalRound = round >= roundsPerSession;
      if (isFinalRound) {
        playCelebration();
        triggerHaptic('celebration');
        await onGameComplete(nextScore);
        setTimeout(() => {
          setActiveRound(null);
        }, 1000);
        return;
      }

      setTimeout(() => {
        startRound();
      }, 1000);
      return;
    }

    setFeedback('Nice! Keep going in order.');
  };

  const handleFinish = async () => {
    playClick();
    await onGameComplete(score);
    navigate('/games');
  };

  return (
    <GameContainer
      title='Size Sorting'
      score={score}
      level={1}
      showScore
      reportSession={false}
      onHome={() => navigate('/games')}
    >
      <div className='h-full overflow-auto p-4 md:p-6'>
        <div className='max-w-4xl mx-auto space-y-4'>
          {!activeRound ? (
            <div className='rounded-3xl border-3 border-[#F2CC8F] bg-white p-8 text-center shadow-[0_6px_0_#E5B86E] space-y-5'>
              <p className='text-sm font-black uppercase tracking-widest text-[#16A34A]'>Logic & Cognitive</p>
              <h2 className='text-4xl font-black text-slate-900'>Size Sorting</h2>
              <p className='text-lg font-bold text-slate-600' data-ux-goal='Sort objects by size from small to big or big to small.'>
                Sort objects by size in the right order.
              </p>
              <p className='text-base font-bold text-slate-500' data-ux-instruction='Tap each object in the size order shown.'>
                Tap each object in size order.
              </p>
              <button
                type='button'
                onClick={startGame}
                className='px-12 py-4 rounded-2xl bg-[#16A34A] text-white font-black text-2xl shadow-[0_4px_0_#15803D]'
              >
                Start Sorting 📏
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
                    🔥 {streak} Round Streak! 🔥
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
                <p className='text-xl font-black text-slate-900 mt-1'>
                  {activeRound.instruction === 'small-to-big'
                    ? 'Tap from Smallest to Biggest'
                    : 'Tap from Biggest to Smallest'}
                </p>
              </div>

              <div className='grid grid-cols-1 sm:grid-cols-3 gap-3'>
                {activeRound.items.map((item) => {
                  const selected = pickedIds.includes(item.id);
                  return (
                    <button
                      key={item.id}
                      type='button'
                      disabled={selected}
                      onClick={() => {
                        void handlePick(item.id);
                      }}
                      className={`rounded-2xl border-2 p-5 text-center transition-all ${
                        selected
                          ? 'border-emerald-400 bg-emerald-50 opacity-80'
                          : 'border-[#F2CC8F] bg-white hover:border-[#16A34A]'
                      }`}
                    >
                      <div className='text-6xl'>{item.emoji}</div>
                      <p className='mt-2 font-black text-slate-800'>{item.label}</p>
                      {selected && <p className='text-sm font-bold text-emerald-700 mt-1'>Picked</p>}
                    </button>
                  );
                })}
              </div>

              {/* Stats */}
              <div className='flex gap-4 justify-center'>
                <div className='bg-emerald-50 border-2 border-emerald-200 px-4 py-2 rounded-xl text-center'>
                  <p className='text-xs font-black uppercase text-emerald-600'>Correct</p>
                  <p className='text-2xl font-black text-emerald-700'>{correct}</p>
                </div>
                <div className='bg-green-50 border-2 border-green-200 px-4 py-2 rounded-xl text-center'>
                  <p className='text-xs font-black uppercase text-green-600'>Score</p>
                  <p className='text-2xl font-black text-green-700'>{score}</p>
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
                  className='px-5 py-2 rounded-xl bg-[#16A34A] text-white font-black shadow-[0_3px_0_#15803D]'
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

export const SizeSorting = memo(function SizeSortingPage() {
  return (
    <GameShell gameId='size-sorting' gameName='Size Sorting' showWellnessTimer enableErrorBoundary>
      <SizeSortingGame />
    </GameShell>
  );
});
