/**
 * Reading Along Game - Juice-Enhanced Version
 *
 * Features:
 * - TTS with word-by-word highlighting
 * - Celebration effects on correct answers
 * - Mascot feedback and encouragement
 * - Page-turn animations
 * - "Read to me" button
 *
 * @ticket TCK-20260314-004
 * @juice-score-target 7/10 (from 3/10)
 */

import { memo, useMemo, useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

import { GameContainer } from '../components/GameContainer';
import { GameShell } from '../components/GameShell';
import { useGameCompletion } from '../hooks/useGameCompletion';
import { useGameSessionProgress } from '../hooks/useGameSessionProgress';
import { useAudio } from '../utils/hooks/useAudio';
import { useTTS } from '../hooks/useTTS';
import { CelebrationEffects } from '../components/game/CelebrationEffects';
import { Mascot } from '../components/Mascot';
import { KenneyIcon } from '../components/ui/KenneyIcon';
import { triggerHaptic } from '../utils/haptics';
import { trackEvent } from '../analytics/launch';

import {
  createReadingAlongRound,
  isReadingAlongAnswerCorrect,
  type ReadingAlongRound,
} from '../games/readingAlongLogic';

// Word timing for TTS highlighting (ms per word)
const WORD_TIMING_MS = 350;
const CELEBRATION_DURATION = 2000;

interface WordHighlight {
  index: number;
  word: string;
  isTarget: boolean;
}

function ReadingAlongGame() {
  const navigate = useNavigate();
  const { playClick, playSuccess, playError, playCelebration } = useAudio();
  const { speak, isSpeaking, isEnabled: ttsEnabled } = useTTS();
  const { completeGame } = useGameCompletion('reading-along');

  // Game state
  const [score, setScore] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [round, setRound] = useState(0);
  const [usedIds, setUsedIds] = useState<string[]>([]);
  const [activeRound, setActiveRound] = useState<ReadingAlongRound | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [feedback, setFeedback] = useState('Tap the highlighted word.');
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  // Juice features state
  const [highlightedWordIndex, setHighlightedWordIndex] = useState<number>(-1);
  const [isReading, setIsReading] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationOrigin, setCelebrationOrigin] = useState({ x: 0, y: 0 });
  const [pageDirection, setPageDirection] = useState<'in' | 'out'>('in');
  const [mascotState, setMascotState] = useState<'idle' | 'happy' | 'celebrating'>('idle');
  const [mascotMessage, setMascotMessage] = useState<string>('');
  const [streak, setStreak] = useState(0);

  const roundsPerSession = 7;
  const sentenceWords = useMemo(
    () => activeRound?.sentence.text.split(' ') ?? [],
    [activeRound],
  );

  // TTS highlighting effect
  useEffect(() => {
    if (!isSpeaking) {
      setHighlightedWordIndex(-1);
      setIsReading(false);
    }
  }, [isSpeaking]);

  // Track game session progress
  useGameSessionProgress({
    gameName: 'Reading Along',
    score,
    level: 1,
    isPlaying: Boolean(activeRound),
    metaData: { round, correct, roundsPerSession, streak },
  });

  const showMascotFeedback = useCallback((type: 'correct' | 'streak' | 'complete') => {
    const messages = {
      correct: ['Great job!', 'You got it!', 'Amazing reading!', 'Perfect!'],
      streak: ['On fire! 🔥', 'Keep going!', 'Unstoppable!', 'Wow!'],
      complete: ['You did it!', 'Super reader! 🌟', 'All done!'],
    };
    const msgs = messages[type];
    const msg = msgs[Math.floor(Math.random() * msgs.length)];
    setMascotMessage(msg);
    setMascotState(type === 'complete' ? 'celebrating' : 'happy');
    setTimeout(() => {
      setMascotState('idle');
      setMascotMessage('');
    }, 3000);
  }, []);

  const readSentence = useCallback(async () => {
    if (!activeRound || !ttsEnabled || isReading) return;

    trackEvent('reading_along_tts_start', {
      sentence_id: activeRound.sentence.id,
      round,
    });

    setIsReading(true);
    setHighlightedWordIndex(-1);

    // Speak the full sentence
    void speak(activeRound.sentence.text);

    // Animate word highlighting in sync with TTS
    const words = activeRound.sentence.text.split(' ');
    for (let i = 0; i < words.length; i++) {
      setTimeout(() => {
        setHighlightedWordIndex(i);
      }, i * WORD_TIMING_MS);
    }

    // Reset highlighting after reading
    setTimeout(() => {
      setHighlightedWordIndex(-1);
      setIsReading(false);
    }, words.length * WORD_TIMING_MS + 500);
  }, [activeRound, ttsEnabled, isReading, speak, round]);

  const startRound = useCallback(() => {
    setPageDirection('out');
    setTimeout(() => {
      const next = createReadingAlongRound(usedIds);
      setActiveRound(next);
      setUsedIds((prev) => [...prev, next.sentence.id]);
      setRound((prev) => prev + 1);
      setShowResult(false);
      setIsCorrect(null);
      setFeedback('Tap the highlighted word.');
      setHighlightedWordIndex(-1);
      setPageDirection('in');

      // Auto-read after page turn animation
      setTimeout(() => {
        void readSentence();
      }, 600);
    }, 300);
  }, [usedIds, readSentence]);

  const startGame = useCallback(() => {
    playClick();
    trackEvent('reading_along_start', { mode: 'juice_enhanced' });
    startRound();
  }, [playClick, startRound]);

  const handlePick = useCallback(async (
    word: string,
    event?: React.MouseEvent | React.TouchEvent,
  ) => {
    if (!activeRound || showResult) return;

    playClick();
    setShowResult(true);

    // Get click position for celebration origin
    if (event) {
      const clientX = 'touches' in event ? event.touches[0]?.clientX : (event as React.MouseEvent).clientX;
      const clientY = 'touches' in event ? event.touches[0]?.clientY : (event as React.MouseEvent).clientY;
      setCelebrationOrigin({ x: clientX ?? window.innerWidth / 2, y: clientY ?? window.innerHeight / 2 });
    }

    const ok = isReadingAlongAnswerCorrect(activeRound, word);
    setIsCorrect(ok);

    if (ok) {
      playSuccess();
      playCelebration();
      triggerHaptic('success');
      setShowCelebration(true);
      setCorrect((prev) => prev + 1);
      setStreak((prev) => prev + 1);
      setScore((prev) => prev + 20 + streak * 5);
      setFeedback('Great reading! You found it! 🎉');
      showMascotFeedback(streak >= 2 ? 'streak' : 'correct');

      trackEvent('reading_along_correct', {
        sentence_id: activeRound.sentence.id,
        round,
        streak: streak + 1,
      });

      setTimeout(() => setShowCelebration(false), CELEBRATION_DURATION);
    } else {
      playError();
      triggerHaptic('error');
      setStreak(0);
      setFeedback(`Good try! The word was "${activeRound.sentence.targetWord}". 📖`);
      setMascotMessage('Keep trying!');
      setMascotState('happy');
      setTimeout(() => {
        setMascotState('idle');
        setMascotMessage('');
      }, 2000);

      trackEvent('reading_along_incorrect', {
        sentence_id: activeRound.sentence.id,
        selected: word,
        correct: activeRound.sentence.targetWord,
      });
    }

    if (round >= roundsPerSession) {
      setTimeout(async () => {
        playCelebration();
        showMascotFeedback('complete');
        const finalScore = score + (ok ? 20 + streak * 5 : 0);
        await completeGame({ score: finalScore, level: 1 });
        trackEvent('reading_along_complete', {
          score: finalScore,
          correct: correct + (ok ? 1 : 0),
          total_rounds: roundsPerSession,
        });
        setTimeout(() => setActiveRound(null), 1500);
      }, 1200);
      return;
    }

    setTimeout(() => {
      startRound();
    }, ok ? 1800 : 2500);
  }, [activeRound, showResult, playClick, playSuccess, playCelebration, playError, streak, score, correct, round, showMascotFeedback, startRound, completeGame]);

  const handleFinish = useCallback(async () => {
    playClick();
    await completeGame({ score, level: 1 });
    trackEvent('reading_along_finish_early', { score, round });
    navigate('/games');
  }, [playClick, completeGame, score, round, navigate]);

  // Calculate word highlighting
  const wordHighlights: WordHighlight[] = useMemo(() => {
    return sentenceWords.map((word, index) => ({
      index,
      word,
      isTarget: word.toLowerCase().replace(/[^a-z]/g, '') === activeRound?.sentence.targetWord.toLowerCase(),
    }));
  }, [sentenceWords, activeRound]);

  return (
    <GameContainer
      title='Reading Along'
      score={score}
      level={1}
      showScore
      reportSession={false}
      onHome={() => navigate('/games')}
    >
      {/* Celebration Effects */}
      <CelebrationEffects
        trigger={showCelebration}
        type='stars'
        origin={celebrationOrigin}
        particleCount={25}
        duration={CELEBRATION_DURATION}
        onComplete={() => setShowCelebration(false)}
      />

      {/* Mascot Feedback */}
      <div className="fixed bottom-4 left-4 z-40">
        <Mascot
          state={mascotState}
          message={mascotMessage}
          responsiveSize='sm'
          speakMessage={true}
        />
      </div>

      {/* Streak Indicator */}
      {streak > 1 && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className='fixed top-24 right-4 z-40 bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-full font-black text-lg shadow-lg flex items-center gap-2'
        >
          <KenneyIcon type='star' size={20} />
          <span>{streak} streak!</span>
        </motion.div>
      )}

      <div className='h-full overflow-auto p-4 md:p-6'>
        <div className='max-w-4xl mx-auto space-y-4'>
          <AnimatePresence mode='wait'>
            {!activeRound ? (
              // Start Screen
              <motion.div
                key='start'
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className='rounded-3xl border-4 border-[#F2CC8F] bg-white p-8 text-center shadow-[0_8px_0_#E5B86E] space-y-5'
              >
                <div className='flex justify-center mb-4'>
                  <Mascot state='happy' responsiveSize='md' speakMessage={false} />
                </div>
                <p className='text-sm font-black uppercase tracking-widest text-[#0EA5E9]'>Literacy</p>
                <h2 className='text-4xl font-black text-slate-900'>Reading Along</h2>
                <p className='text-lg font-bold text-slate-600'>
                  Listen to the sentence, then tap the target word!
                </p>
                <div className='flex justify-center gap-2 text-4xl'>
                  <span>📖</span>
                  <span>👂</span>
                  <span>✨</span>
                </div>
                <button
                  type='button'
                  onClick={startGame}
                  className='px-12 py-4 rounded-2xl bg-[#0EA5E9] text-white font-black text-2xl shadow-[0_6px_0_#0369A1] hover:shadow-[0_4px_0_#0369A1] hover:translate-y-1 active:shadow-none active:translate-y-2 transition-all'
                >
                  Start Reading! 📚
                </button>
              </motion.div>
            ) : (
              // Game Screen
              <motion.div
                key='game'
                initial={{ opacity: pageDirection === 'in' ? 0 : 1, x: pageDirection === 'in' ? 50 : 0 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
                className='space-y-4'
              >
                {/* Progress Bar */}
                <div className='rounded-2xl border-2 border-[#F2CC8F] bg-white p-4 shadow-[0_4px_0_#E5B86E]'>
                  <div className='flex items-center justify-between mb-2'>
                    <p className='text-sm font-black uppercase tracking-wide text-slate-500'>
                      Round {round} / {roundsPerSession}
                    </p>
                    <div className='flex items-center gap-2'>
                      <KenneyIcon type='star' size={16} />
                      <span className='font-bold text-slate-700'>{score}</span>
                    </div>
                  </div>
                  <div className='h-3 bg-slate-200 rounded-full overflow-hidden'>
                    <motion.div
                      className='h-full bg-gradient-to-r from-[#0EA5E9] to-[#22C55E]'
                      initial={{ width: 0 }}
                      animate={{ width: `${(round / roundsPerSession) * 100}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>

                {/* Sentence Card with TTS */}
                <div className='rounded-2xl border-4 border-[#0EA5E9] bg-white p-6 shadow-[0_8px_0_#0369A1]'>
                  <div className='flex items-center justify-between mb-4'>
                    <p className='text-sm font-black uppercase tracking-wide text-slate-500'>
                      Listen & Read
                    </p>
                    <button
                      type='button'
                      onClick={readSentence}
                      disabled={isReading || !ttsEnabled}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all ${
                        isReading
                          ? 'bg-orange-100 text-orange-600 animate-pulse'
                          : 'bg-[#0EA5E9] text-white hover:bg-[#0284C7] shadow-[0_4px_0_#0369A1] hover:shadow-[0_2px_0_#0369A1] hover:translate-y-0.5 active:shadow-none active:translate-y-1'
                      } ${!ttsEnabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {isReading ? (
                        <>
                          <span className='animate-bounce'>🔊</span>
                          <span>Reading...</span>
                        </>
                      ) : (
                        <>
                          <span>🔊</span>
                          <span>Read to me!</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Word-by-word Highlighting */}
                  <div className='bg-[#F0F9FF] rounded-xl p-6'>
                    <p className='text-2xl md:text-3xl font-black text-slate-800 leading-relaxed flex flex-wrap gap-x-3 gap-y-2 justify-center'>
                      {wordHighlights.map(({ word, index, isTarget }) => (
                        <motion.span
                          key={`${word}-${index}`}
                          className={`px-2 py-1 rounded-lg transition-all duration-200 ${
                            highlightedWordIndex === index
                              ? 'bg-yellow-300 text-slate-900 scale-110 shadow-md'
                              : isTarget && showResult
                                ? isCorrect
                                  ? 'bg-green-200 text-green-800'
                                  : 'bg-red-100 text-red-700'
                                : ''
                          }`}
                          animate={
                            highlightedWordIndex === index
                              ? { scale: [1, 1.1, 1] }
                              : {}
                          }
                        >
                          {word}
                        </motion.span>
                      ))}
                    </p>
                  </div>

                  {/* Target Word Hint (subtle) */}
                  <p className='text-center mt-4 text-sm font-bold text-slate-500'>
                    Find the word: <span className='text-[#0EA5E9] text-lg'>"{activeRound.sentence.targetWord}"</span>
                  </p>
                </div>

                {/* Options */}
                <div className='rounded-2xl border-2 border-[#F2CC8F] bg-white p-4 shadow-[0_4px_0_#E5B86E]'>
                  <p className='text-sm font-bold uppercase tracking-wide text-slate-500 mb-4 text-center'>
                    Tap the correct word!
                  </p>
                  <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
                    {activeRound.options.map((word, index) => (
                      <motion.button
                        key={word}
                        type='button'
                        disabled={showResult}
                        onClick={(e) => handlePick(word, e)}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: showResult ? 1 : 1.05 }}
                        whileTap={{ scale: showResult ? 1 : 0.95 }}
                        className={`rounded-xl border-4 px-6 py-5 text-2xl font-black transition-all ${
                          showResult
                            ? word === activeRound.sentence.targetWord
                              ? 'border-green-500 bg-green-100 text-green-800 shadow-[0_4px_0_#22C55E]'
                              : 'border-red-200 bg-red-50 text-red-400 opacity-70'
                            : 'border-[#F2CC8F] bg-[#ECFEFF] text-slate-800 hover:border-[#0EA5E9] hover:bg-[#E0F2FE] shadow-[0_4px_0_#E5B86E] hover:shadow-[0_2px_0_#E5B86E] hover:translate-y-0.5 active:shadow-none active:translate-y-1'
                        }`}
                      >
                        {word}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Feedback */}
                <AnimatePresence mode='wait'>
                  {showResult && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className={`rounded-2xl border-4 p-4 text-center font-black text-xl ${
                        isCorrect
                          ? 'border-green-400 bg-green-100 text-green-800'
                          : 'border-orange-300 bg-orange-50 text-orange-700'
                      }`}
                    >
                      {feedback}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Finish Button */}
                <div className='rounded-2xl border-2 border-slate-200 bg-white p-4 flex items-center justify-between'>
                  <p className='font-bold text-slate-500 text-sm'>
                    {round < roundsPerSession ? 'Need a break?' : 'Great job!'}
                  </p>
                  <button
                    type='button'
                    onClick={() => void handleFinish()}
                    className='px-5 py-2 rounded-xl bg-slate-200 text-slate-700 font-black hover:bg-slate-300 transition-colors'
                  >
                    {round < roundsPerSession ? 'Finish' : 'Done'} ✓
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
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

export default ReadingAlong;
