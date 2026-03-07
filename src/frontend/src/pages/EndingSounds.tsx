import { memo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { GameContainer } from '../components/GameContainer';
import { GameShell } from '../components/GameShell';
import { useGameDrops } from '../hooks/useGameDrops';
import { useGameSessionProgress } from '../hooks/useGameSessionProgress';
import { useAudio } from '../utils/hooks/useAudio';
import {
  createEndingSoundsRound,
  isEndingSoundCorrect,
  type EndingSoundsRound,
} from '../games/endingSoundsLogic';

function EndingSoundsGame() {
  const navigate = useNavigate();
  const { playClick, playSuccess, playError, playCelebration } = useAudio();
  const { onGameComplete } = useGameDrops('ending-sounds');

  const [score, setScore] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [round, setRound] = useState(0);
  const [usedWords, setUsedWords] = useState<string[]>([]);
  const [activeRound, setActiveRound] = useState<EndingSoundsRound | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [feedback, setFeedback] = useState('Find the ending sound.');

  const roundsPerSession = 8;

  useGameSessionProgress({
    gameName: 'Ending Sounds',
    score,
    level: 1,
    isPlaying: Boolean(activeRound),
    metaData: { round, correct, roundsPerSession },
  });

  const startRound = () => {
    const next = createEndingSoundsRound(usedWords);
    setActiveRound(next);
    setUsedWords((prev) => [...prev, next.target.word]);
    setRound((prev) => prev + 1);
    setShowResult(false);
    setFeedback('Find the ending sound.');
  };

  const startGame = () => {
    playClick();
    startRound();
  };

  const handleAnswer = async (letter: string) => {
    if (!activeRound || showResult) return;

    playClick();
    setShowResult(true);
    const ok = isEndingSoundCorrect(activeRound, letter);

    if (ok) {
      playSuccess();
      setCorrect((prev) => prev + 1);
      setScore((prev) => prev + 20);
      setFeedback(`Great! ${activeRound.target.word} ends with ${activeRound.target.endingLetter}.`);
    } else {
      playError();
      setFeedback(`Nice try! ${activeRound.target.word} ends with ${activeRound.target.endingLetter}.`);
    }

    if (round >= roundsPerSession) {
      playCelebration();
      await onGameComplete(score + (ok ? 20 : 0));
      setTimeout(() => {
        setActiveRound(null);
      }, 1200);
      return;
    }

    setTimeout(() => {
      startRound();
    }, 900);
  };

  const handleFinish = async () => {
    playClick();
    await onGameComplete(score);
    navigate('/games');
  };

  return (
    <GameContainer
      title='Ending Sounds'
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
              <p className='text-sm font-black uppercase tracking-widest text-[#7C3AED]'>Phonics</p>
              <h2 className='text-4xl font-black text-slate-900'>Ending Sounds</h2>
              <p className='text-lg font-bold text-slate-600' data-ux-goal='Identify the final sound in simple words.'>
                Listen to the word and pick its ending sound.
              </p>
              <p className='text-base font-bold text-slate-500' data-ux-instruction='Read the word and tap the correct ending letter.'>
                Read the word and tap the correct ending letter.
              </p>
              <button
                type='button'
                onClick={startGame}
                className='px-12 py-4 rounded-2xl bg-[#7C3AED] text-white font-black text-2xl shadow-[0_4px_0_#5B21B6]'
              >
                Start Sounds 🔤
              </button>
            </div>
          ) : (
            <>
              <div className='rounded-2xl border-2 border-[#F2CC8F] bg-white p-4 shadow-[0_4px_0_#E5B86E]'>
                <p className='text-sm font-black uppercase tracking-wide text-slate-500'>Round {round} / {roundsPerSession}</p>
                <div className='mt-3 text-center'>
                  <p className='text-6xl'>{activeRound.target.emoji}</p>
                  <p className='text-4xl font-black text-slate-900 mt-2'>{activeRound.target.word}</p>
                </div>
              </div>

              <div className='rounded-2xl border-2 border-[#F2CC8F] bg-white p-4'>
                <p className='text-sm font-bold uppercase tracking-wide text-slate-500 mb-3'>Pick the ending letter</p>
                <div className='grid grid-cols-2 sm:grid-cols-4 gap-3'>
                  {activeRound.options.map((option) => (
                    <button
                      key={option}
                      type='button'
                      disabled={showResult}
                      onClick={() => {
                        void handleAnswer(option);
                      }}
                      className='rounded-xl border-2 border-[#F2CC8F] bg-[#F5F3FF] px-4 py-3 text-3xl font-black text-slate-800 hover:border-[#7C3AED] disabled:opacity-70'
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              <div className='rounded-2xl border-2 border-[#F2CC8F] bg-white p-4 flex items-center justify-between'>
                <p className='font-bold text-slate-700'>{feedback}</p>
                <button
                  type='button'
                  onClick={() => {
                    void handleFinish();
                  }}
                  className='px-5 py-2 rounded-xl bg-[#7C3AED] text-white font-black shadow-[0_3px_0_#5B21B6]'
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

export const EndingSounds = memo(function EndingSoundsPage() {
  return (
    <GameShell gameId='ending-sounds' gameName='Ending Sounds' showWellnessTimer enableErrorBoundary>
      <EndingSoundsGame />
    </GameShell>
  );
});
