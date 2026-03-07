import { memo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { GameContainer } from '../components/GameContainer';
import { GameShell } from '../components/GameShell';
import { useGameDrops } from '../hooks/useGameDrops';
import { useGameSessionProgress } from '../hooks/useGameSessionProgress';
import { useAudio } from '../utils/hooks/useAudio';
import {
  createShadowMatchRound,
  isShadowMatchCorrect,
  type ShadowMatchRound,
} from '../games/shadowMatchLogic';

function ShadowMatchGame() {
  const navigate = useNavigate();
  const { playClick, playSuccess, playError, playCelebration } = useAudio();
  const { onGameComplete } = useGameDrops('shadow-match');

  const [score, setScore] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [round, setRound] = useState(0);
  const [usedTargets, setUsedTargets] = useState<string[]>([]);
  const [activeRound, setActiveRound] = useState<ShadowMatchRound | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [feedback, setFeedback] = useState('Tap the object that matches the shadow.');

  const roundsPerSession = 7;

  useGameSessionProgress({
    gameName: 'Shadow Match',
    score,
    level: 1,
    isPlaying: Boolean(activeRound),
    metaData: { round, correct, roundsPerSession },
  });

  const startRound = () => {
    const next = createShadowMatchRound(usedTargets);
    setActiveRound(next);
    setUsedTargets((prev) => [...prev, next.target.id]);
    setRound((prev) => prev + 1);
    setShowResult(false);
    setFeedback('Tap the object that matches the shadow.');
  };

  const startGame = () => {
    playClick();
    startRound();
  };

  const handleAnswer = async (pickedId: string) => {
    if (!activeRound || showResult) return;

    playClick();
    setShowResult(true);
    const ok = isShadowMatchCorrect(activeRound, pickedId);

    if (ok) {
      playSuccess();
      setCorrect((prev) => prev + 1);
      setScore((prev) => prev + 20);
      setFeedback(`Correct! The shadow matches ${activeRound.target.objectName}.`);
    } else {
      playError();
      setFeedback(`Almost! The correct object is ${activeRound.target.objectName}.`);
    }

    if (round >= roundsPerSession) {
      playCelebration();
      await onGameComplete(score + (ok ? 20 : 0));
      setTimeout(() => {
        setActiveRound(null);
      }, 1100);
      return;
    }

    setTimeout(() => {
      startRound();
    }, 950);
  };

  const handleFinish = async () => {
    playClick();
    await onGameComplete(score);
    navigate('/games');
  };

  return (
    <GameContainer
      title='Shadow Match'
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
              <h2 className='text-4xl font-black text-slate-900'>Shadow Match</h2>
              <p className='text-lg font-bold text-slate-600' data-ux-goal='Match an object to its shadow.'>
                Look at the shadow and pick the matching object.
              </p>
              <p className='text-base font-bold text-slate-500' data-ux-instruction='Tap the object that has the same shape.'>
                Tap the object with the same shape as the shadow.
              </p>
              <button
                type='button'
                onClick={startGame}
                className='px-12 py-4 rounded-2xl bg-[#15803D] text-white font-black text-2xl shadow-[0_4px_0_#14532D]'
              >
                Start Matching 🌑
              </button>
            </div>
          ) : (
            <>
              <div className='rounded-2xl border-2 border-[#F2CC8F] bg-white p-4 shadow-[0_4px_0_#E5B86E]'>
                <p className='text-sm font-black uppercase tracking-wide text-slate-500'>Round {round} / {roundsPerSession}</p>
                <p className='text-lg font-black text-slate-900 mt-1'>Which object matches this shadow?</p>
                <div className='mt-3 text-center text-6xl' style={{ filter: 'grayscale(100%) brightness(0.15)' }}>
                  {activeRound.target.objectEmoji}
                </div>
              </div>

              <div className='grid grid-cols-1 sm:grid-cols-3 gap-3'>
                {activeRound.options.map((option) => (
                  <button
                    key={option.id}
                    type='button'
                    disabled={showResult}
                    onClick={() => {
                      void handleAnswer(option.id);
                    }}
                    className='rounded-2xl border-2 border-[#F2CC8F] bg-white p-5 hover:border-[#15803D] disabled:opacity-70'
                  >
                    <div className='text-5xl'>{option.objectEmoji}</div>
                    <p className='mt-2 font-black text-slate-800'>{option.objectName}</p>
                  </button>
                ))}
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

export const ShadowMatch = memo(function ShadowMatchPage() {
  return (
    <GameShell gameId='shadow-match' gameName='Shadow Match' showWellnessTimer enableErrorBoundary>
      <ShadowMatchGame />
    </GameShell>
  );
});
