import { memo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { GameContainer } from '../components/GameContainer';
import { GameShell } from '../components/GameShell';
import { useGameDrops } from '../hooks/useGameDrops';
import { useGameSessionProgress } from '../hooks/useGameSessionProgress';
import { useAudio } from '../utils/hooks/useAudio';
import {
  createLetterSoundMatchRound,
  isLetterSoundMatchCorrect,
  type LetterSoundMatchRound,
} from '../games/letterSoundMatchLogic';

function LetterSoundMatchGame() {
  const navigate = useNavigate();
  const { playClick, playSuccess, playError, playCelebration } = useAudio();
  const { onGameComplete } = useGameDrops('letter-sound-match');

  const [score, setScore] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [round, setRound] = useState(0);
  const [usedLetters, setUsedLetters] = useState<string[]>([]);
  const [activeRound, setActiveRound] = useState<LetterSoundMatchRound | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [feedback, setFeedback] = useState('Pick the sound that matches the letter.');

  const roundsPerSession = 8;

  useGameSessionProgress({
    gameName: 'Letter Sound Match',
    score,
    level: 1,
    isPlaying: Boolean(activeRound),
    metaData: { round, correct, roundsPerSession },
  });

  const startRound = () => {
    const next = createLetterSoundMatchRound(usedLetters);
    setActiveRound(next);
    setUsedLetters((prev) => [...prev, next.target.letter]);
    setRound((prev) => prev + 1);
    setShowResult(false);
    setFeedback('Pick the sound that matches the letter.');
  };

  const startGame = () => {
    playClick();
    startRound();
  };

  const handleAnswer = async (sound: string) => {
    if (!activeRound || showResult) return;

    playClick();
    setShowResult(true);
    const ok = isLetterSoundMatchCorrect(activeRound, sound);

    if (ok) {
      playSuccess();
      setCorrect((prev) => prev + 1);
      setScore((prev) => prev + 20);
      setFeedback(
        `Yes. ${activeRound.target.letter} says ${activeRound.target.sound} like ${activeRound.target.example}.`,
      );
    } else {
      playError();
      setFeedback(`Try again next round. Correct sound: ${activeRound.target.sound}.`);
    }

    if (round >= roundsPerSession) {
      playCelebration();
      await onGameComplete(score + (ok ? 20 : 0));
      setTimeout(() => setActiveRound(null), 900);
      return;
    }

    setTimeout(() => {
      startRound();
    }, 850);
  };

  const handleFinish = async () => {
    playClick();
    await onGameComplete(score);
    navigate('/games');
  };

  return (
    <GameContainer
      title='Letter Sound Match'
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
              <h2 className='text-4xl font-black text-slate-900'>Letter Sound Match</h2>
              <p className='text-lg font-bold text-slate-600'>Match each letter with its sound.</p>
              <button
                type='button'
                onClick={startGame}
                className='px-12 py-4 rounded-2xl bg-[#7C3AED] text-white font-black text-2xl shadow-[0_4px_0_#5B21B6]'
              >
                Start Match
              </button>
            </div>
          ) : (
            <>
              <div className='rounded-2xl border-2 border-[#F2CC8F] bg-white p-4 shadow-[0_4px_0_#E5B86E]'>
                <p className='text-sm font-black uppercase tracking-wide text-slate-500'>Round {round} / {roundsPerSession}</p>
                <p className='text-base font-bold text-slate-500 mt-1'>Which sound matches this letter?</p>
                <p className='text-7xl font-black text-[#7C3AED] text-center mt-2'>{activeRound.target.letter}</p>
              </div>

              <div className='rounded-2xl border-2 border-[#F2CC8F] bg-white p-4'>
                <div className='grid grid-cols-1 sm:grid-cols-3 gap-3'>
                  {activeRound.options.map((option) => (
                    <button
                      key={option}
                      type='button'
                      disabled={showResult}
                      onClick={() => {
                        void handleAnswer(option);
                      }}
                      className='rounded-xl border-2 border-[#F2CC8F] bg-[#F5F3FF] px-4 py-4 text-2xl font-black text-slate-800 hover:border-[#7C3AED] disabled:opacity-70'
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

export const LetterSoundMatch = memo(function LetterSoundMatchPage() {
  return (
    <GameShell
      gameId='letter-sound-match'
      gameName='Letter Sound Match'
      showWellnessTimer
      enableErrorBoundary
    >
      <LetterSoundMatchGame />
    </GameShell>
  );
});
