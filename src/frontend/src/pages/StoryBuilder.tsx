import { memo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { GameContainer } from '../components/GameContainer';
import { GameShell } from '../components/GameShell';
import { useGameDrops } from '../hooks/useGameDrops';
import { useGameSessionProgress } from '../hooks/useGameSessionProgress';
import { useAudio } from '../utils/hooks/useAudio';
import {
  createStoryBuilderRound,
  evaluateStoryWordPick,
  type StoryBuilderRound,
} from '../games/storyBuilderLogic';

function StoryBuilderGame() {
  const navigate = useNavigate();
  const { playClick, playSuccess, playError, playCelebration } = useAudio();
  const { onGameComplete } = useGameDrops('story-builder');

  const [score, setScore] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [round, setRound] = useState(0);
  const [usedPromptIds, setUsedPromptIds] = useState<string[]>([]);
  const [activeRound, setActiveRound] = useState<StoryBuilderRound | null>(null);
  const [pickedWords, setPickedWords] = useState<string[]>([]);
  const [feedback, setFeedback] = useState('Build the sentence in the right order.');

  const roundsPerSession = 6;

  useGameSessionProgress({
    gameName: 'Story Builder',
    score,
    level: 1,
    isPlaying: Boolean(activeRound),
    metaData: { round, correct, roundsPerSession },
  });

  const startRound = () => {
    const next = createStoryBuilderRound(usedPromptIds);
    setActiveRound(next);
    setUsedPromptIds((prev) => [...prev, next.id]);
    setPickedWords([]);
    setRound((prev) => prev + 1);
    setFeedback('Build the sentence in the right order.');
  };

  const startGame = () => {
    playClick();
    startRound();
  };

  const handlePick = async (word: string) => {
    if (!activeRound) return;

    playClick();
    const result = evaluateStoryWordPick(activeRound, pickedWords, word);
    if (!result.ok) {
      playError();
      setFeedback('Try a different word first.');
      return;
    }

    const nextPicked = [...pickedWords, word];
    setPickedWords(nextPicked);

    if (!result.completed) {
      playSuccess();
      setFeedback('Nice! Keep building the sentence.');
      return;
    }

    playSuccess();
    setCorrect((prev) => prev + 1);
    setScore((prev) => prev + 25);
    setFeedback(`Great sentence: ${activeRound.orderedWords.join(' ')}.`);

    if (round >= roundsPerSession) {
      playCelebration();
      await onGameComplete(score + 25);
      setTimeout(() => {
        setActiveRound(null);
      }, 1100);
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
      title='Story Builder'
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
              <h2 className='text-4xl font-black text-slate-900'>Story Builder</h2>
              <p className='text-lg font-bold text-slate-600' data-ux-goal='Build simple sentences in the correct order.'>
                Put words in order to build short story sentences.
              </p>
              <p className='text-base font-bold text-slate-500' data-ux-instruction='Tap words in the order that makes a complete sentence.'>
                Tap words in order to make a complete sentence.
              </p>
              <button
                type='button'
                onClick={startGame}
                className='px-12 py-4 rounded-2xl bg-[#0EA5E9] text-white font-black text-2xl shadow-[0_4px_0_#0369A1]'
              >
                Start Story 📝
              </button>
            </div>
          ) : (
            <>
              <div className='rounded-2xl border-2 border-[#F2CC8F] bg-white p-4 shadow-[0_4px_0_#E5B86E]'>
                <p className='text-sm font-black uppercase tracking-wide text-slate-500'>Round {round} / {roundsPerSession}</p>
                <p className='text-xl font-black text-slate-900 mt-1'>{activeRound.prompt}</p>
              </div>

              <div className='rounded-2xl border-2 border-[#F2CC8F] bg-white p-4'>
                <p className='text-sm font-bold uppercase tracking-wide text-slate-500 mb-2'>Your sentence</p>
                <div className='min-h-16 rounded-xl bg-[#F0F9FF] border-2 border-dashed border-[#7DD3FC] p-3 flex flex-wrap gap-2'>
                  {pickedWords.length === 0 ? (
                    <span className='text-slate-400 font-bold'>Sentence appears here...</span>
                  ) : (
                    pickedWords.map((word) => (
                      <span key={`${word}-${pickedWords.indexOf(word)}`} className='px-3 py-1 rounded-full bg-white border-2 border-[#7DD3FC] font-black text-slate-700'>
                        {word}
                      </span>
                    ))
                  )}
                </div>
              </div>

              <div className='rounded-2xl border-2 border-[#F2CC8F] bg-white p-4'>
                <p className='text-sm font-bold uppercase tracking-wide text-slate-500 mb-3'>Tap the next word</p>
                <div className='grid grid-cols-2 sm:grid-cols-3 gap-3'>
                  {activeRound.options.map((word) => (
                    <button
                      key={word}
                      type='button'
                      disabled={pickedWords.includes(word)}
                      onClick={() => {
                        void handlePick(word);
                      }}
                      className='rounded-xl border-2 border-[#F2CC8F] bg-[#ECFEFF] px-4 py-3 text-xl font-black text-slate-800 hover:border-[#0EA5E9] disabled:opacity-60'
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

export const StoryBuilder = memo(function StoryBuilderPage() {
  return (
    <GameShell gameId='story-builder' gameName='Story Builder' showWellnessTimer enableErrorBoundary>
      <StoryBuilderGame />
    </GameShell>
  );
});
