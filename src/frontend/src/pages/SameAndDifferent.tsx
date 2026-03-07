import { memo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { GameContainer } from '../components/GameContainer';
import { GameShell } from '../components/GameShell';
import { useGameDrops } from '../hooks/useGameDrops';
import { useGameSessionProgress } from '../hooks/useGameSessionProgress';
import { useAudio } from '../utils/hooks/useAudio';
import {
  createSameAndDifferentRound,
  isSameAndDifferentCorrect,
  type SameAndDifferentRound,
} from '../games/sameAndDifferentLogic';

function SameAndDifferentGame() {
  const navigate = useNavigate();
  const { playClick, playSuccess, playError, playCelebration } = useAudio();
  const { onGameComplete } = useGameDrops('same-and-different');

  const [score, setScore] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [round, setRound] = useState(0);
  const [activeRound, setActiveRound] = useState<SameAndDifferentRound | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [feedback, setFeedback] = useState('Are these the same or different?');

  const roundsPerSession = 8;

  useGameSessionProgress({
    gameName: 'Same and Different',
    score,
    level: 1,
    isPlaying: Boolean(activeRound),
    metaData: { round, correct, roundsPerSession },
  });

  const startRound = () => {
    setActiveRound(createSameAndDifferentRound());
    setRound((prev) => prev + 1);
    setShowResult(false);
    setFeedback('Are these the same or different?');
  };

  const startGame = () => {
    playClick();
    startRound();
  };

  const handleAnswer = async (answer: 'same' | 'different') => {
    if (!activeRound || showResult) return;
    playClick();
    setShowResult(true);

    const ok = isSameAndDifferentCorrect(activeRound, answer);
    if (ok) {
      playSuccess();
      setCorrect((prev) => prev + 1);
      setScore((prev) => prev + 20);
      setFeedback('Correct. Nice observing.');
    } else {
      playError();
      setFeedback(`Good try. These are ${activeRound.answer}.`);
    }

    if (round >= roundsPerSession) {
      playCelebration();
      await onGameComplete(score + (ok ? 20 : 0));
      setTimeout(() => setActiveRound(null), 850);
      return;
    }

    setTimeout(() => {
      startRound();
    }, 750);
  };

  const handleFinish = async () => {
    playClick();
    await onGameComplete(score);
    navigate('/games');
  };

  return (
    <GameContainer
      title='Same and Different'
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
              <p className='text-sm font-black uppercase tracking-widest text-[#15803D]'>Logic</p>
              <h2 className='text-4xl font-black text-slate-900'>Same and Different</h2>
              <p className='text-lg font-bold text-slate-600'>Look carefully and compare both cards.</p>
              <button
                type='button'
                onClick={startGame}
                className='px-12 py-4 rounded-2xl bg-[#15803D] text-white font-black text-2xl shadow-[0_4px_0_#14532D]'
              >
                Start Comparing
              </button>
            </div>
          ) : (
            <>
              <div className='rounded-2xl border-2 border-[#F2CC8F] bg-white p-4 shadow-[0_4px_0_#E5B86E]'>
                <p className='text-sm font-black uppercase tracking-wide text-slate-500'>Round {round} / {roundsPerSession}</p>
                <div className='mt-3 grid grid-cols-2 gap-3'>
                  <div className='rounded-xl border-2 border-slate-200 bg-slate-50 p-4 text-center'>
                    <p className='text-sm font-bold text-slate-500'>Card 1</p>
                    <p className='text-2xl font-black text-slate-800 mt-1'>
                      {activeRound.left.label}
                    </p>
                  </div>
                  <div className='rounded-xl border-2 border-slate-200 bg-slate-50 p-4 text-center'>
                    <p className='text-sm font-bold text-slate-500'>Card 2</p>
                    <p className='text-2xl font-black text-slate-800 mt-1'>
                      {activeRound.right.label}
                    </p>
                  </div>
                </div>
              </div>

              <div className='rounded-2xl border-2 border-[#F2CC8F] bg-white p-4'>
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                  <button
                    type='button'
                    disabled={showResult}
                    onClick={() => {
                      void handleAnswer('same');
                    }}
                    className='rounded-xl border-2 border-[#F2CC8F] bg-[#ECFDF3] px-4 py-4 text-2xl font-black text-slate-800 hover:border-[#15803D] disabled:opacity-70'
                  >
                    Same
                  </button>
                  <button
                    type='button'
                    disabled={showResult}
                    onClick={() => {
                      void handleAnswer('different');
                    }}
                    className='rounded-xl border-2 border-[#F2CC8F] bg-[#F0F9FF] px-4 py-4 text-2xl font-black text-slate-800 hover:border-[#0369A1] disabled:opacity-70'
                  >
                    Different
                  </button>
                </div>
              </div>

              <div className='rounded-2xl border-2 border-[#F2CC8F] bg-white p-4 flex items-center justify-between'>
                <p className='font-bold text-slate-700'>{feedback}</p>
                <button
                  type='button'
                  onClick={() => {
                    void handleFinish();
                  }}
                  className='px-5 py-2 rounded-xl bg-[#15803D] text-white font-black shadow-[0_3px_0_#14532D]'
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

export const SameAndDifferent = memo(function SameAndDifferentPage() {
  return (
    <GameShell
      gameId='same-and-different'
      gameName='Same and Different'
      showWellnessTimer
      enableErrorBoundary
    >
      <SameAndDifferentGame />
    </GameShell>
  );
});
