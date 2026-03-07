import { memo, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { GameContainer } from '../components/GameContainer';
import { GameShell } from '../components/GameShell';
import { useGameDrops } from '../hooks/useGameDrops';
import { useGameSessionProgress } from '../hooks/useGameSessionProgress';
import { useAudio } from '../utils/hooks/useAudio';
import {
  createReadingAlongRound,
  isReadingAlongAnswerCorrect,
  type ReadingAlongRound,
} from '../games/readingAlongLogic';

function ReadingAlongGame() {
  const navigate = useNavigate();
  const { playClick, playSuccess, playError, playCelebration } = useAudio();
  const { onGameComplete } = useGameDrops('reading-along');

  const [score, setScore] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [round, setRound] = useState(0);
  const [usedIds, setUsedIds] = useState<string[]>([]);
  const [activeRound, setActiveRound] = useState<ReadingAlongRound | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [feedback, setFeedback] = useState('Tap the highlighted word.');

  const roundsPerSession = 7;

  useGameSessionProgress({
    gameName: 'Reading Along',
    score,
    level: 1,
    isPlaying: Boolean(activeRound),
    metaData: { round, correct, roundsPerSession },
  });

  const startRound = () => {
    const next = createReadingAlongRound(usedIds);
    setActiveRound(next);
    setUsedIds((prev) => [...prev, next.sentence.id]);
    setRound((prev) => prev + 1);
    setShowResult(false);
    setFeedback('Tap the highlighted word.');
  };

  const startGame = () => {
    playClick();
    startRound();
  };

  const handlePick = async (word: string) => {
    if (!activeRound || showResult) return;
    playClick();
    setShowResult(true);

    const ok = isReadingAlongAnswerCorrect(activeRound, word);
    if (ok) {
      playSuccess();
      setCorrect((prev) => prev + 1);
      setScore((prev) => prev + 20);
      setFeedback('Great reading. You picked the right word.');
    } else {
      playError();
      setFeedback(`Good try. The highlighted word is "${activeRound.sentence.targetWord}".`);
    }

    if (round >= roundsPerSession) {
      playCelebration();
      await onGameComplete(score + (ok ? 20 : 0));
      setTimeout(() => setActiveRound(null), 900);
      return;
    }

    setTimeout(() => {
      startRound();
    }, 800);
  };

  const handleFinish = async () => {
    playClick();
    await onGameComplete(score);
    navigate('/games');
  };

  const sentenceWords = useMemo(
    () => activeRound?.sentence.text.split(' ') ?? [],
    [activeRound],
  );

  return (
    <GameContainer
      title='Reading Along'
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
              <p className='text-sm font-black uppercase tracking-widest text-[#0EA5E9]'>Literacy</p>
              <h2 className='text-4xl font-black text-slate-900'>Reading Along</h2>
              <p className='text-lg font-bold text-slate-600'>Read the sentence and pick the target word.</p>
              <button
                type='button'
                onClick={startGame}
                className='px-12 py-4 rounded-2xl bg-[#0EA5E9] text-white font-black text-2xl shadow-[0_4px_0_#0369A1]'
              >
                Start Reading
              </button>
            </div>
          ) : (
            <>
              <div className='rounded-2xl border-2 border-[#F2CC8F] bg-white p-4 shadow-[0_4px_0_#E5B86E]'>
                <p className='text-sm font-black uppercase tracking-wide text-slate-500'>Round {round} / {roundsPerSession}</p>
                <div className='mt-3 flex flex-wrap gap-2'>
                  {sentenceWords.map((word, index) => {
                    const cleanWord = word.toLowerCase().replace(/[^a-z]/g, '');
                    const isTarget =
                      cleanWord === activeRound.sentence.targetWord.toLowerCase();
                    return (
                      <span
                        key={`${word}-${index}`}
                        className={`px-3 py-1 rounded-xl border-2 font-black ${
                          isTarget
                            ? 'border-[#0EA5E9] bg-[#E0F2FE] text-[#0C4A6E]'
                            : 'border-slate-200 bg-slate-50 text-slate-700'
                        }`}
                      >
                        {word}
                      </span>
                    );
                  })}
                </div>
              </div>

              <div className='rounded-2xl border-2 border-[#F2CC8F] bg-white p-4'>
                <p className='text-sm font-bold uppercase tracking-wide text-slate-500 mb-3'>Which word is highlighted?</p>
                <div className='grid grid-cols-1 sm:grid-cols-3 gap-3'>
                  {activeRound.options.map((word) => (
                    <button
                      key={word}
                      type='button'
                      disabled={showResult}
                      onClick={() => {
                        void handlePick(word);
                      }}
                      className='rounded-xl border-2 border-[#F2CC8F] bg-[#ECFEFF] px-4 py-3 text-xl font-black text-slate-800 hover:border-[#0EA5E9] disabled:opacity-70'
                    >
                      {word}
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
                  className='px-5 py-2 rounded-xl bg-[#0EA5E9] text-white font-black shadow-[0_3px_0_#0369A1]'
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

export const ReadingAlong = memo(function ReadingAlongPage() {
  return (
    <GameShell gameId='reading-along' gameName='Reading Along' showWellnessTimer enableErrorBoundary>
      <ReadingAlongGame />
    </GameShell>
  );
});
