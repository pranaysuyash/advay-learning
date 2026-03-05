import { memo, useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useFeatureFlag } from '../hooks/useFeatureFlag';
import { useFallbackControls } from '../hooks/useFallbackControls';
import { GameCursor } from '../components/game/GameCursor';
import { useNavigate } from 'react-router-dom';
import { GameContainer } from '../components/GameContainer';
import { GameShell } from '../components/GameShell';
import { AccessDenied } from '../components/ui/AccessDenied';
import { useSubscription } from '../hooks/useSubscription';
import { progressQueue } from '../services/progressQueue';
import { useProgressStore } from '../store';
import { GlobalErrorBoundary } from '../components/errors/GlobalErrorBoundary';
import { useAudio } from '../utils/hooks/useAudio';
import { useGameDrops } from '../hooks/useGameDrops';
import { useStreakTracking } from '../hooks/useStreakTracking';
import { triggerHaptic } from '../utils/haptics';
import {
  LEVELS,
  buildBeginningSoundsRound,
  checkAnswer,
  calculateScore,
  type BeginningSoundsRound,
} from '../games/beginningSoundsLogic';

// Inner game component
const BeginningSoundsGame = memo(function BeginningSoundsGameComponent() {
  const navigate = useNavigate();
  const reducedMotion = useReducedMotion();
  const { canAccessGame, isLoading: subLoading } = useSubscription();
  const hasAccess = canAccessGame('beginning-sounds');
  const { currentProfile } = useProgressStore();
  const { onGameComplete } = useGameDrops('beginning-sounds');
  
  const [currentLevel, setCurrentLevel] = useState(1);
  const [currentRound, setCurrentRound] = useState<BeginningSoundsRound | null>(null);
  const [roundIndex, setRoundIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [gameState, setGameState] = useState<'playing' | 'complete'>('playing');
  const [usedWords, setUsedWords] = useState<string[]>([]);
  const [feedback, setFeedback] = useState('Tap the sound you hear at the start!');
  const [error, setError] = useState<Error | null>(null);
  const {
    streak,
    maxStreak,
    showMilestone,
    scorePopup,
    incrementStreak,
    resetStreak,
    setScorePopup,
  } = useStreakTracking();

  const { playClick, playSuccess, playError, playCelebration } = useAudio();

  const levelConfig = useMemo(() => LEVELS.find((l) => l.level === currentLevel) ?? LEVELS[0], [currentLevel]);

  // voice fallback flag (placeholder)
  const voiceFallback = useFeatureFlag('controls.voiceFallbackV1');
  const [cursor, setCursor] = useState<{ x: number; y: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const snapTargets = useMemo(() => {
    const container = containerRef.current;
    if (!container || !currentRound) return [];
    const rect = container.getBoundingClientRect();
    return currentRound.options.map((option, idx) => {
      const el = optionRefs.current[idx];
      if (el) {
        const r = el.getBoundingClientRect();
        return {
          x: r.left + r.width / 2 - rect.left,
          y: r.top + r.height / 2 - rect.top,
          id: option.letter,
        };
      }
      return null;
    }).filter((t): t is { x: number; y: number; id: string } => !!t);
  }, [currentRound]);

  const fallback = useFallbackControls({
    enabled: voiceFallback,
    snap: { snapRadiusPx: 80, targets: snapTargets },
    onDwellSelect: (id) => handleAnswer(id),
    onCursorMove: (pos) => setCursor(pos),
    containerRef,
  });

  useEffect(() => {
    if (voiceFallback) {
      fallback.enable();
    } else {
      fallback.disable();
      setCursor(null);
    }
  }, [voiceFallback, fallback]);

  // Show loading while checking subscription
  if (subLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
      </div>
    );
  }

  // Check subscription access
  if (!hasAccess) {
    return <AccessDenied gameName="Beginning Sounds" gameId="beginning-sounds" />;
  }

  // Error state
  if (error) {
    return (
      <GameContainer title="Beginning Sounds" onHome={() => navigate('/games')}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Oops! Something went wrong</h2>
            <p className="text-slate-600 mb-4">{error.message}</p>
            <button
              onClick={() => {
                setError(null);
                window.location.reload();
              }}
              className="px-6 py-3 bg-[#3B82F6] text-white rounded-xl font-bold"
            >
              Try Again
            </button>
          </div>
        </div>
      </GameContainer>
    );
  }

  // Save progress on game complete
  const handleGameComplete = useCallback(async (finalScore: number) => {
    if (!currentProfile) return;
    
    try {
      await progressQueue.add({
        profileId: currentProfile.id,
        gameId: 'beginning-sounds',
        score: finalScore,
        completed: true,
        metadata: {
          level: currentLevel,
          correct: correctCount,
          rounds: levelConfig.roundCount,
        },
      });
      onGameComplete(finalScore);
    } catch (err) {
      console.error('Failed to save progress:', err);
      setError(err as Error);
    }
  }, [currentProfile, currentLevel, correctCount, levelConfig, onGameComplete]);

  const speakWord = useCallback((word: string) => {
    try {
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(word);
        utterance.rate = 0.7;
        utterance.pitch = 1.1;
        speechSynthesis.speak(utterance);
      }
    } catch (err) {
      console.error('Speech synthesis failed:', err);
    }
  }, []);

  const speakSound = useCallback((letter: string) => {
    try {
      if ('speechSynthesis' in window) {
        const sounds: Record<string, string> = {
          A: 'Ah like in Apple',
          B: 'Buh like in Ball',
          C: 'Kuh like in Cat',
          D: 'Duh like in Dog',
          E: 'Eh like in Egg',
          F: 'Fuh like in Fish',
          G: 'Guh like in Goat',
          H: 'Huh like in Hat',
          I: 'Ih like in Igloo',
          J: 'Juh like in Jam',
          K: 'Kuh like in Kite',
          L: 'Luh like in Lion',
          M: 'Muh like in Moon',
          N: 'Nuh like in Nest',
          O: 'Oh like in Octopus',
          P: 'Puh like in Pig',
          Q: 'Kwuh like in Queen',
          R: 'Ruh like in Rain',
          S: 'Suh like in Sun',
          T: 'Tuh like in Tree',
          U: 'Uh like in Umbrella',
          V: 'Vuh like in Van',
          W: 'Wuh like in Water',
          X: 'Ks like in Box',
          Y: 'Yuh like in Yellow',
          Z: 'Zuh like in Zoo',
        };
        const utterance = new SpeechSynthesisUtterance(sounds[letter] || letter);
        utterance.rate = 0.8;
        utterance.pitch = 1.2;
        speechSynthesis.speak(utterance);
      }
    } catch (err) {
      console.error('Speech synthesis failed:', err);
    }
  }, []);

  useEffect(() => {
    if (gameState === 'playing' && !currentRound) {
      try {
        const round = buildBeginningSoundsRound(currentLevel, usedWords);
        setCurrentRound(round);
        setUsedWords((prev) => [...prev, round.targetWord.word]);
      } catch (err) {
        console.error('Failed to build round:', err);
        setError(err as Error);
      }
    }
  }, [gameState, currentLevel, currentRound, usedWords]);

  const handleAnswer = useCallback((letter: string) => {
    if (showResult || !currentRound) return;

    try {
      playClick();
      setSelectedAnswer(letter);
      setShowResult(true);

      const isCorrect = checkAnswer(letter, currentRound.targetWord.firstLetter);
      
      if (isCorrect) {
        // Correct - build streak
        incrementStreak();

        // Calculate score with streak
        const roundScore = calculateScore(true, 5, levelConfig.timePerRound) + Math.min((streak + 1) * 3, 15);
        setScore((prev) => prev + roundScore);

        // Show popup
        setScorePopup({ points: roundScore, x: 50, y: 30 });
        setTimeout(() => setScorePopup(null), 700);

        // Haptics
        triggerHaptic('success');

        playSuccess();
        setCorrectCount((prev) => prev + 1);
        setFeedback(`Yes! ${currentRound.targetWord.firstSound} is for ${currentRound.targetWord.word}! ${currentRound.targetWord.emoji}`);
        speakSound(currentRound.targetWord.firstLetter);
      } else {
        // Wrong - break streak
        resetStreak();
        triggerHaptic('error');

        playError();
        setFeedback(`Oops! The answer is ${currentRound.targetWord.firstLetter} for ${currentRound.targetWord.word} ${currentRound.targetWord.emoji}`);
        speakSound(currentRound.targetWord.firstLetter);
      }

      setTimeout(async () => {
        const nextIndex = roundIndex + 1;
        if (nextIndex >= levelConfig.roundCount) {
          setGameState('complete');
          playCelebration();
          triggerHaptic('celebration');
          await handleGameComplete(score + (isCorrect ? calculateScore(true, 5, levelConfig.timePerRound) + Math.min(streak + 1, 5) * 3 : 0));
        } else {
          setRoundIndex(nextIndex);
          const newRound = buildBeginningSoundsRound(currentLevel, usedWords);
          setCurrentRound(newRound);
          setUsedWords((prev) => [...prev, newRound.targetWord.word]);
          setSelectedAnswer(null);
          setShowResult(false);
          setFeedback('Tap the sound you hear at the start!');
        }
      }, 2000);
    } catch (err) {
      console.error('Answer handling failed:', err);
      setError(err as Error);
    }
  }, [showResult, currentRound, levelConfig, roundIndex, usedWords, currentLevel, score, handleGameComplete, playClick, playSuccess, playError, playCelebration, speakSound]);

  const handlePlayWord = useCallback(() => {
    if (currentRound) {
      speakWord(currentRound.targetWord.word);
    }
  }, [currentRound, speakWord]);

  const handleLevelChange = useCallback((level: number) => {
    playClick();
    setCurrentLevel(level);
    setRoundIndex(0);
    setScore(0);
    setCorrectCount(0);
    setUsedWords([]);
    setCurrentRound(null);
    setGameState('playing');
    setSelectedAnswer(null);
    setShowResult(false);
    setFeedback('Tap the sound you hear at the start!');
    resetStreak();
  }, [playClick, resetStreak]);

  const handleRestart = useCallback(() => {
    playClick();
    setRoundIndex(0);
    setScore(0);
    setCorrectCount(0);
    setUsedWords([]);
    setCurrentRound(null);
    setGameState('playing');
    setSelectedAnswer(null);
    setShowResult(false);
    setFeedback('Tap the sound you hear at the start!');
    resetStreak();
  }, [playClick, resetStreak]);

  const handleFinish = useCallback(async () => {
    playClick();
    const finalScore = Math.round(score / levelConfig.roundCount);
    await handleGameComplete(finalScore);
    navigate('/games');
  }, [score, levelConfig, handleGameComplete, navigate, playClick]);

  return (
    <GlobalErrorBoundary>
      <GameContainer
        title="Beginning Sounds"
        score={score}
        level={currentLevel}
        onHome={() => navigate('/games')}
        reportSession={false}
      >
        <div className="flex flex-col items-center gap-4 p-4 max-w-2xl mx-auto">
          {voiceFallback && (
            <div className="w-full bg-yellow-100 text-yellow-800 p-2 rounded text-center">
              Voice fallback enabled. You can tap answers if voice recognition fails.
            </div>
          )}
          {/* Level selector */}
          <div className="flex gap-2">
            {LEVELS.map((level) => (
              <motion.button
                type="button"
                key={level.level}
                onClick={() => handleLevelChange(level.level)}
                whileHover={reducedMotion ? {} : { scale: 1.05 }}
                whileTap={reducedMotion ? {} : { scale: 0.95 }}
                className={`px-4 py-2 rounded-full font-bold transition-all ${
                  currentLevel === level.level
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'bg-slate-50 border-2 border-slate-200 text-slate-700 hover:border-slate-400'
                }`}
              >
                Level {level.level}
              </motion.button>
            ))}
          </div>

          {gameState === 'playing' && currentRound && (
            <>
              <div className="text-center">
                <p className="text-lg text-gray-700 font-medium mb-2">What sound does this word start with?</p>
                <motion.button
                  type="button"
                  onClick={handlePlayWord}
                  whileHover={reducedMotion ? {} : { scale: 1.05 }}
                  whileTap={reducedMotion ? {} : { scale: 0.95 }}
                  className="text-6xl bg-white p-4 rounded-2xl shadow-md transition-transform"
                >
                  {currentRound.targetWord.emoji}
                </motion.button>
                <p className="text-2xl font-bold text-gray-800 mt-2">{currentRound.targetWord.word}</p>
                <motion.button
                  type="button"
                  onClick={handlePlayWord}
                  whileHover={reducedMotion ? {} : { scale: 1.05 }}
                  whileTap={reducedMotion ? {} : { scale: 0.95 }}
                  className="mt-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full font-medium hover:bg-blue-200 transition-colors"
                >
                  🔊 Hear Word
                </motion.button>
              </div>

              <p className="text-lg text-purple-600 font-medium">{feedback}</p>

              <div ref={containerRef} {...fallback.handlers} className="grid grid-cols-2 gap-3 w-full max-w-md">
                {currentRound.options.map((option, idx) => {
                  let buttonClass = 'bg-white border-4 border-gray-200 hover:border-blue-300';

                  if (showResult) {
                    if (option.isCorrect) {
                      buttonClass = 'bg-green-100 border-4 border-green-400';
                    } else if (selectedAnswer === option.letter && !option.isCorrect) {
                      buttonClass = 'bg-red-100 border-4 border-red-400';
                    }
                  }

                  return (
                    <motion.button
                      type="button"
                      key={option.letter}
                      ref={(el) => { optionRefs.current[idx] = el; }}
                      onClick={() => handleAnswer(option.letter)}
                      disabled={showResult}
                      whileHover={reducedMotion ? {} : { scale: showResult ? 1 : 1.05 }}
                      whileTap={reducedMotion ? {} : { scale: showResult ? 1 : 0.95 }}
                      className={`${buttonClass} p-4 rounded-2xl font-bold text-3xl transition-all disabled:cursor-not-allowed`}
                    >
                      {option.letter}
                    </motion.button>
                  );
                })}
              </div>

              {cursor && (
                <GameCursor
                  position={cursor}
                  isPinching={false}
                  isHandDetected={false}
                  size={48}
                  highContrast={true}
                  icon="👆"
                />
              )}

              {/* Kenney Heart HUD */}
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <img
                    key={i}
                    src={streak >= (i + 1) * 2
                      ? '/assets/kenney/platformer/hud/hud_heart.png'
                      : '/assets/kenney/platformer/hud/hud_heart_empty.png'}
                    alt=""
                    className="w-8 h-8"
                  />
                ))}
                <span className="ml-2 text-lg font-bold text-pink-500">x{streak}</span>
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
              {showMilestone && (
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

              <div className="flex gap-4 text-center">
                <div className="bg-green-100 px-4 py-2 rounded-xl">
                  <p className="text-sm text-green-600 font-medium">Correct</p>
                  <p className="text-2xl font-bold text-green-700">{correctCount}</p>
                </div>
                <div className="bg-blue-100 px-4 py-2 rounded-xl">
                  <p className="text-sm text-blue-600 font-medium">Score</p>
                  <p className="text-2xl font-bold text-blue-700">{score}</p>
                </div>
                <div className="bg-purple-100 px-4 py-2 rounded-xl">
                  <p className="text-sm text-purple-600 font-medium">Round</p>
                  <p className="text-2xl font-bold text-purple-700">{roundIndex + 1}/{levelConfig.roundCount}</p>
                </div>
              </div>
            </>
          )}

          {gameState === 'complete' && (
            <div className="text-center">
              <p className="text-4xl mb-4">🎉</p>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Great Job!</h2>
              <p className="text-xl text-gray-600 mb-4">
                You got {correctCount} out of {levelConfig.roundCount} correct!
              </p>
              <p className="text-2xl font-bold text-purple-600 mb-2">Score: {score}</p>
              {maxStreak >= 5 && (
                <p className="text-lg font-bold text-orange-500 mb-6">🔥 Best Streak: {maxStreak}!</p>
              )}
            </div>
          )}

          <div className="flex gap-3">
            <motion.button
              type="button"
              onClick={handleRestart}
              whileHover={reducedMotion ? {} : { scale: 1.05 }}
              whileTap={reducedMotion ? {} : { scale: 0.95 }}
              className="px-6 py-3 bg-slate-100 border-2 border-slate-200 hover:bg-slate-200 text-slate-700 rounded-xl font-black transition-all"
            >
              Play Again
            </motion.button>
            <motion.button
              type="button"
              onClick={handleFinish}
              whileHover={reducedMotion ? {} : { scale: 1.05 }}
              whileTap={reducedMotion ? {} : { scale: 0.95 }}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-xl font-bold shadow-lg transition-all"
            >
              Finish
            </motion.button>
          </div>
        </div>
        
      </GameContainer>
    </GlobalErrorBoundary>
  );
});

// Main export wrapped with GameShell
export const BeginningSounds = memo(function BeginningSoundsComponent() {
  return (
    <GameShell
      gameId="beginning-sounds"
      gameName="Beginning Sounds"
      showWellnessTimer={true}
      enableErrorBoundary={true}
    >
      <BeginningSoundsGame />
    </GameShell>
  );
});
