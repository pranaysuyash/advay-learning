import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

import { CelebrationOverlay } from '../components/CelebrationOverlay';
import { GameCursor } from '../components/game/GameCursor';
import { GameContainer } from '../components/GameContainer';
import { GameControls } from '../components/GameControls';
import type { GameControl } from '../components/GameControls';
import { useGameDrops } from '../hooks/useGameDrops';
import { useGameHandTracking } from '../hooks/useGameHandTracking';
import type { HandTrackingRuntimeMeta } from '../hooks/useHandTrackingRuntime';
import { useTTS } from '../hooks/useTTS';
import { useAudio } from '../utils/hooks/useAudio';
import { VoiceInstructions } from '../components/game/VoiceInstructions';
import { triggerHaptic } from '../utils/haptics';
import { findHitTarget } from '../games/hitTarget';
import {
  loadWordBank,
  loadCurriculum,
  pickWord,
  createLetterTargets,
  type LetterTarget,
} from '../games/wordBuilderLogic';

// Unified Analytics SDK
import {
  startSession,
  endSession,
  getAnalyticsSummary,
  getStoredSessions,
  clearAnalytics,
  type AnalyticsSession,
  wordBuilder,
  isWordBuilderExtension,
} from '../analytics';
import type { Point } from '../types/tracking';
import { randomFloat01 } from '../utils/random';
import type { TrackedHandFrame } from '../utils/handTrackingFrame';
import {
  assetLoader,
  SOUND_ASSETS,
  WEATHER_BACKGROUNDS,
} from '../utils/assets';
import { STREAK_MILESTONE_INTERVAL, STREAK_MILESTONE_DURATION_MS } from '../games/constants';

const HIT_RADIUS = 0.15; // Increased from 0.1 for kids' easier targeting
const MAX_LEVEL = 3;
const CURSOR_SIZE = 84; // Increased for easier visibility
const TARGET_SIZE = 120; // Increased from 80 for kids' fingers
type WordBuilderMode = 'explore' | 'phonics';

const PHONICS_STAGES: { id: string; label: string }[] = [
  { id: 'cvc_a', label: 'CVC Short A' },
  { id: 'cvc_e', label: 'CVC Short E' },
  { id: 'cvc_all', label: 'All CVC' },
  { id: 'blends', label: 'Simple Blends' },
  { id: 'digraphs', label: 'Digraphs (SH/CH/TH/WH)' },
  { id: 'long_vowels', label: 'Long Vowels' },
  { id: 'sight_words_3', label: 'Sight Words' },
  { id: 'advanced', label: 'Advanced' },
];

const SETTINGS_HOLD_MS = 900;

export const WordBuilder = memo(function WordBuilderComponent() {
  const navigate = useNavigate();
  const levelTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const gameAreaRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [timeLeft, setTimeLeft] = useState(90);
  const [word, setWord] = useState('');
  const [targets, setTargets] = useState<LetterTarget[]>([]);
  const [gameMode, setGameMode] = useState<WordBuilderMode>(() => {
    const saved = localStorage.getItem('wordbuilder.mode');
    return saved === 'phonics' ? 'phonics' : 'explore';
  });
  const [phonicsStageId, setPhonicsStageId] = useState<string>(() => {
    return localStorage.getItem('wordbuilder.stageId') ?? 'cvc_all';
  });
  const [showSettings, setShowSettings] = useState(false);
  const [showInsights, setShowInsights] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<{
    summary: ReturnType<typeof getAnalyticsSummary>;
    sessions: AnalyticsSession[];
  } | null>(null);
  const [autoAdvance, setAutoAdvance] = useState<boolean>(() => {
    return localStorage.getItem('wordbuilder.autoAdvance') === 'true';
  });
  const [wordsCompletedInStage, setWordsCompletedInStage] = useState<number>(() => {
    return parseInt(localStorage.getItem('wordbuilder.wordsCompleted') ?? '0', 10);
  });
  const WORDS_PER_STAGE = 10; // Advance after this many words
  const [stepIndex, setStepIndex] = useState(0);
  const [cursor, setCursor] = useState<Point | null>(null);
  const [feedback, setFeedback] = useState('Pinch letters to spell the word!');
  const [showCelebration, setShowCelebration] = useState(false);
  const [, setCompletedLetters] = useState<string[]>([]);
  const [streak, setStreak] = useState(0);
  const [scorePopup, setScorePopup] = useState<{ points: number } | null>(null);
  const [showStreakMilestone, setShowStreakMilestone] = useState(false);

  const targetsRef = useRef<LetterTarget[]>(targets);
  const stepIndexRef = useRef(stepIndex);
  const wordRef = useRef(word);
  const levelRef = useRef(level);
  const timeLeftRef = useRef(timeLeft);
  const gameModeRef = useRef<WordBuilderMode>(gameMode);
  const phonicsStageIdRef = useRef<string>(phonicsStageId);
  const autoAdvanceRef = useRef<boolean>(autoAdvance);
  const wordsCompletedRef = useRef<number>(wordsCompletedInStage);
  const settingsHoldRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { playPop, playError, playCelebration, playClick } = useAudio();
  const { speak, isEnabled: ttsEnabled } = useTTS();
  const { onGameComplete, triggerEasterEgg } = useGameDrops('word-builder');

  useEffect(() => {
    targetsRef.current = targets;
  }, [targets]);
  useEffect(() => {
    stepIndexRef.current = stepIndex;
  }, [stepIndex]);
  useEffect(() => {
    wordRef.current = word;
  }, [word]);
  useEffect(() => {
    levelRef.current = level;
  }, [level]);
  useEffect(() => {
    timeLeftRef.current = timeLeft;
  }, [timeLeft]);
  useEffect(() => {
    gameModeRef.current = gameMode;
  }, [gameMode]);
  useEffect(() => {
    phonicsStageIdRef.current = phonicsStageId;
  }, [phonicsStageId]);
  useEffect(() => {
    autoAdvanceRef.current = autoAdvance;
  }, [autoAdvance]);
  useEffect(() => {
    wordsCompletedRef.current = wordsCompletedInStage;
  }, [wordsCompletedInStage]);

  // Batch localStorage writes for all settings (single write per state change)
  useEffect(() => {
    localStorage.setItem('wordbuilder.mode', gameMode);
    localStorage.setItem('wordbuilder.stageId', phonicsStageId);
    localStorage.setItem('wordbuilder.autoAdvance', String(autoAdvance));
    localStorage.setItem('wordbuilder.wordsCompleted', String(wordsCompletedInStage));
  }, [gameMode, phonicsStageId, autoAdvance, wordsCompletedInStage]);

  // Settings helpers
  const beginSettingsHold = () => {
    if (settingsHoldRef.current) clearTimeout(settingsHoldRef.current);
    settingsHoldRef.current = setTimeout(() => {
      setShowSettings(true);
      settingsHoldRef.current = null;
    }, SETTINGS_HOLD_MS);
  };

  const cancelSettingsHold = () => {
    if (settingsHoldRef.current) {
      clearTimeout(settingsHoldRef.current);
      settingsHoldRef.current = null;
    }
  };

  const applySettings = (nextMode: WordBuilderMode, nextStageId: string) => {
    setGameMode(nextMode);
    setPhonicsStageId(nextStageId);
    setWordsCompletedInStage(0); // Reset progress when changing settings

    // Restart cleanly if game is running to avoid mixed-mode state.
    if (isPlaying) {
      resetGame();
    }
    setShowSettings(false);
  };

  // Insights panel helpers
  const loadInsights = () => {
    const summary = getAnalyticsSummary();
    const sessions = getStoredSessions();
    setAnalyticsData({ summary, sessions });
    setShowInsights(true);
  };

  const exportAnalytics = () => {
    const sessions = getStoredSessions();
    const dataStr = JSON.stringify(sessions, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `wordbuilder-analytics-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const resetAnalytics = () => {
    if (confirm('Clear all learning analytics? This cannot be undone.')) {
      clearAnalytics();
      setAnalyticsData({ summary: getAnalyticsSummary(), sessions: [] });
    }
  };

  // Asset preloading for premium polish
  useEffect(() => {
    const preloadAssets = async () => {
      try {
        await Promise.all([
          assetLoader.loadImages(Object.values(WEATHER_BACKGROUNDS)),
          assetLoader.loadSounds(Object.values(SOUND_ASSETS)),
        ]);
      } catch (error) {
        console.error('Asset preload failed (non-blocking):', error);
      }
    };

    void preloadAssets();
  }, []);

  // Cleanup level timeout on unmount (lifecycle hardening)
  useEffect(() => {
    return () => {
      if (levelTimeoutRef.current) {
        clearTimeout(levelTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isPlaying || gameCompleted) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsPlaying(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPlaying, gameCompleted]);

  const startNewWord = useCallback(() => {
    const mode = gameModeRef.current;

    const newWord =
      mode === 'explore'
        ? pickWord({ mode: 'explore', level: levelRef.current }, randomFloat01)
        : pickWord({ mode: 'phonics', stageId: phonicsStageIdRef.current }, randomFloat01);

    if (!newWord) {
      setFeedback('Loading words...');
      return;
    }

    setWord(newWord.word);
    setStepIndex(0);
    setCompletedLetters([]);

    // Keep distractors gentle. You can tune this per-mode.
    const base = mode === 'phonics' ? 2 : 2 + Math.floor(levelRef.current / 2);
    const distractors = Math.min(3, base);

    setTargets(createLetterTargets(newWord.word, distractors, randomFloat01));
    setFeedback(`Spell: ${newWord.word}`);
    if (ttsEnabled) {
      void speak(`Spell the word: ${newWord.word}!`);
    }
  }, [speak, ttsEnabled]);

  useEffect(() => {
    if (!isPlaying || gameCompleted) return;
    startNewWord();
  }, [isPlaying, level, gameCompleted, startNewWord]);

  const completeWord = useCallback(() => {
    if (levelTimeoutRef.current) clearTimeout(levelTimeoutRef.current);

    playCelebration();
    setShowCelebration(true);
    setScore((prev) => prev + 30 + timeLeftRef.current);
    triggerEasterEgg('egg-first-word');

    // Increment words completed in phonics mode
    const mode = gameModeRef.current;
    let shouldAdvanceStage = false;
    if (mode === 'phonics') {
      const newCount = wordsCompletedRef.current + 1;
      setWordsCompletedInStage(newCount);

      // Check if we should auto-advance
      if (autoAdvanceRef.current && newCount >= WORDS_PER_STAGE) {
        shouldAdvanceStage = true;
      }
    }

    // Slower pacing for kids - 3 seconds instead of 1.8s
    levelTimeoutRef.current = setTimeout(() => {
      setShowCelebration(false);

      if (mode === 'explore') {
        if (levelRef.current >= MAX_LEVEL) {
          onGameComplete();
          setGameCompleted(true);
          setIsPlaying(false);
        } else {
          setLevel((prev) => prev + 1);
        }
      } else {
        // phonics mode
        if (shouldAdvanceStage) {
          // Auto-advance to next stage
          const currentIndex = PHONICS_STAGES.findIndex(s => s.id === phonicsStageIdRef.current);
          const nextStage = PHONICS_STAGES[currentIndex + 1];
          if (nextStage) {
            // Advance to next stage
            setPhonicsStageId(nextStage.id);
            setWordsCompletedInStage(0);
            if (ttsEnabled) {
              void speak(`Great job! Moving to ${nextStage.label}!`);
            }
          } else {
            // At last stage - stay here but celebrate completion
            setWordsCompletedInStage(0);
            if (ttsEnabled) {
              void speak('Amazing! You completed all phonics stages! Keep practicing!');
            }
          }
        }
        startNewWord();
      }

      levelTimeoutRef.current = null;
    }, 3000);
  }, [playCelebration, onGameComplete, startNewWord, ttsEnabled, speak]);

  const handleFrame = useCallback(
    (frame: TrackedHandFrame, _meta: HandTrackingRuntimeMeta) => {
      const tip = frame.indexTip;
      if (!tip) {
        if (cursor !== null) setCursor(null);
        return;
      }

      if (!cursor || cursor.x !== tip.x || cursor.y !== tip.y) {
        setCursor(tip);
      }

      if (frame.pinch.transition !== 'start') return;

      const activeTargets = targetsRef.current;
      const currentWord = wordRef.current;
      const currentStep = stepIndexRef.current;
      const expectedLetter = currentWord[currentStep];
      if (!expectedLetter) return;

      const hit = findHitTarget(tip, activeTargets, HIT_RADIUS);

      if (!hit) {
        setFeedback('Move closer to a letter and pinch.');
        playError();
        return;
      }

      // Record touch for unified analytics
      wordBuilder.recordTouch(expectedLetter, hit.letter, hit.letter === expectedLetter);

      if (hit.letter === expectedLetter) {
        // Build streak
        const newStreak = streak + 1;
        setStreak(newStreak);

        // Calculate score with streak bonus
        const basePoints = 15;
        const streakBonus = Math.min(newStreak * 3, 15);
        const totalPoints = basePoints + streakBonus;
        setScore((prev) => prev + totalPoints);

        // Show score popup
        setScorePopup({ points: totalPoints });
        setTimeout(() => setScorePopup(null), 700);

        playPop();
        triggerHaptic('success');
        setCompletedLetters((prev) => [...prev, hit.letter]);

        // Milestone every 5
        if (newStreak > 0 && newStreak % STREAK_MILESTONE_INTERVAL === 0) {
          setShowStreakMilestone(true);
          triggerHaptic('celebration');
          setTimeout(() => setShowStreakMilestone(false), STREAK_MILESTONE_DURATION_MS);
        }

        const nextStep = currentStep + 1;
        setStepIndex(nextStep);

        if (nextStep >= currentWord.length) {
          setFeedback(`${currentWord} complete!`);
          if (ttsEnabled) {
            void speak(`Great job! You spelled ${currentWord}!`);
          }
          triggerHaptic('celebration');
          wordBuilder.recordWordCompleted(currentWord); // Unified analytics
          completeWord();
        } else {
          setFeedback(`Great! Next: "${currentWord[nextStep]}"`);
          if (ttsEnabled) {
            void speak(`Great! Next letter: ${currentWord[nextStep]!}`);
          }
        }
      } else {
        // Wrong - break streak
        setStreak(0);
        setShowStreakMilestone(false);
        setFeedback(`That's "${hit.letter}". Find "${expectedLetter}".`);
        if (ttsEnabled) {
          void speak(`That's ${hit.letter}. Find ${expectedLetter}!`);
        }
        playError();
        triggerHaptic('error');
      }
    },
    [completeWord, cursor, playError, playPop, speak, ttsEnabled, word],
  );

  const {
    isLoading: isModelLoading,
    isReady: isHandTrackingReady,
    startTracking,
    webcamRef: _webcamRef,
  } = useGameHandTracking({
    gameName: 'WordBuilder',
    targetFps: 30,
    isRunning: isPlaying && !gameCompleted,
    onFrame: handleFrame,
    onNoVideoFrame: () => {
      if (cursor !== null) setCursor(null);
    },
  });

  useEffect(() => {
    if (
      isPlaying &&
      !gameCompleted &&
      !isHandTrackingReady &&
      !isModelLoading
    ) {
      void startTracking();
    }
  }, [
    gameCompleted,
    isHandTrackingReady,
    isModelLoading,
    isPlaying,
    startTracking,
  ]);

  const startGame = async () => {
    setFeedback('Loading words...');

    // Load word bank and curriculum before starting
    await loadWordBank();
    if (gameMode === 'phonics') {
      await loadCurriculum();
    }
    setGameCompleted(false);
    setScore(0);
    setStreak(0);
    setScorePopup(null);
    setShowStreakMilestone(false);
    setLevel(1);
    setTimeLeft(90);
    setStepIndex(0);
    setCompletedLetters([]);
    setFeedback('Pinch letters to spell the word!');
    setCursor(null);
    setIsPlaying(true);

    // Start unified analytics session
    const childId = localStorage.getItem('activeProfileId') || undefined;
    startSession('wordbuilder', childId);
    wordBuilder.initWordBuilderSession(gameMode, gameMode === 'phonics' ? phonicsStageId : undefined);

    if (ttsEnabled) {
      void speak("Let's build words together! Show me your hand!");
    }
    playClick();

    if (!isHandTrackingReady && !isModelLoading) {
      void startTracking();
    }
  };

  const resetGame = () => {
    if (levelTimeoutRef.current) {
      clearTimeout(levelTimeoutRef.current);
      levelTimeoutRef.current = null;
    }

    // End unified analytics session
    wordBuilder.finalizeAccuracy();
    wordBuilder.populateUniversalMetrics();
    endSession('completed');

    setIsPlaying(false);
    setGameCompleted(false);
    setTargets([]);
    setStepIndex(0);
    setCompletedLetters([]);
    setStreak(0);
    setScorePopup(null);
    setShowStreakMilestone(false);
    setCursor(null);
    setTimeLeft(90);
    setFeedback('Pinch letters to spell the word!');
  };

  const goHome = () => {
    assetLoader.playSound('pop', 0.3); // Audio feedback on navigation
    resetGame();
    navigate('/dashboard');
  };

  const controls: GameControl[] = [
    {
      id: 'start',
      icon: isPlaying ? 'rotate-ccw' : 'play',
      label: isPlaying ? 'Restart' : 'Start',
      onClick: startGame,
      variant: isPlaying ? 'secondary' : 'success',
    },
    {
      id: 'home',
      icon: 'home',
      label: 'Home',
      onClick: goHome,
      variant: 'primary',
    },
  ];

  const expectedLetter = word[stepIndex];

  return (
    <GameContainer
      webcamRef={_webcamRef}
      title='Word Builder'
      score={score}
      level={level}
      onHome={goHome}
      isHandDetected={isHandTrackingReady}
      isPlaying={isPlaying}
    >
      <div
        ref={gameAreaRef}
        className='absolute inset-0 bg-[#FFF8F0]'
        role='main'
        aria-label='Word Builder spelling game with gesture-based letter selection'
      >
        {/* Background layer for visual variety */}
        <div
          className='absolute inset-0 bg-cover bg-center opacity-8'
          style={{
            backgroundImage: `url(${WEATHER_BACKGROUNDS.rainy.url})`,
          }}
          aria-hidden='true'
        />

        <div className='absolute inset-4 md:inset-8 lg:inset-12 bg-white rounded-[3rem] border-[8px] border-[#F2CC8F] shadow-[0_4px_0_#E5B86E] overflow-hidden'>
          <div className='absolute inset-0 bg-gradient-to-b from-white/30 via-transparent to-white/40 backdrop-blur-sm pointer-events-none' />

          <div className='absolute top-8 left-1/2 -translate-x-1/2 px-8 py-3 rounded-full bg-white/95 backdrop-blur-sm border-3 border-[#F2CC8F] shadow-[0_4px_0_#E5B86E] text-advay-slate font-bold text-lg text-center min-w-[320px] z-20'>
            {feedback}
          </div>

          <div className='absolute top-8 right-8 px-6 py-3 rounded-[1.5rem] bg-white/95 border-3 border-[#F2CC8F] text-slate-400 font-bold text-xl shadow-[0_4px_0_#E5B86E] z-20'>
            Take your time!
          </div>

          {word && (
            <div className='absolute top-8 left-8 px-8 py-4 rounded-[2rem] bg-white border-3 border-[#F2CC8F] shadow-[0_4px_0_#E5B86E] z-20'>
              <span className='font-black tracking-widest text-3xl flex gap-2'>
                {word.split('').map((letter, i) => (
                  <span
                    key={i}
                    className={
                      i < stepIndex
                        ? 'text-[#10B981]'
                        : i === stepIndex
                          ? 'text-[#F59E0B] border-b-4 border-[#F59E0B] pb-1'
                          : 'text-slate-300'
                    }
                  >
                    {i < stepIndex ? letter : '_'}
                  </span>
                ))}
              </span>
            </div>
          )}

          {/* Kenney Heart HUD */}
          {isPlaying && (
            <div className="absolute bottom-8 left-8 flex items-center gap-1 bg-white/95 rounded-2xl px-4 py-2 border-3 border-pink-200 shadow-[0_4px_0_#F9A8D4] z-20">
              {Array.from({ length: 5 }).map((_, i) => (
                <img
                  key={i}
                  src={streak >= (i + 1) * 2
                    ? '/assets/kenney/platformer/hud/hud_heart.png'
                    : '/assets/kenney/platformer/hud/hud_heart_empty.png'}
                  alt=""
                  className="w-7 h-7"
                />
              ))}
              <span className="ml-2 text-base font-bold text-pink-500">x{streak}</span>
            </div>
          )}

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
          {showStreakMilestone && (
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

          {targets.map((target) => {
            const isExpected =
              target.letter === expectedLetter && target.isCorrect;
            const isCompleted =
              target.isCorrect && target.orderIndex < stepIndex;
            return (
              <div
                key={target.id}
                className={`absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-all duration-300 ${isCompleted ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}
                style={{
                  left: `${target.position.x * 100}%`,
                  top: `${target.position.y * 100}%`,
                  width: `${TARGET_SIZE}px`,
                  height: `${TARGET_SIZE}px`,
                }}
                aria-hidden='true'
              >
                <div
                  className={`absolute inset-0 rounded-full border-[6px] flex items-center justify-center font-black text-5xl shadow-[0_4px_0_#E5B86E] ${isExpected
                      ? 'border-[#F59E0B] bg-amber-50 text-[#F59E0B] z-10 scale-110'
                      : 'border-[#3B82F6] bg-blue-50 text-[#3B82F6]'
                    }`}
                >
                  {target.letter}
                </div>
              </div>
            );
          })}

          {cursor && (
            <GameCursor
              position={cursor}
              coordinateSpace='normalized'
              containerRef={gameAreaRef}
              isPinching={false}
              isHandDetected={isPlaying}
              size={CURSOR_SIZE}
              color='#3B82F6'
              highContrast={true}
              icon='👆'
            />
          )}

          {!isPlaying && !gameCompleted && (
            <div className='absolute inset-0 bg-[#FFF8F0]/80 backdrop-blur-sm z-40 flex items-center justify-center rounded-[2.5rem]'>
              <div className='bg-white border-3 border-[#F2CC8F] rounded-[3rem] p-12 text-center max-w-md w-[90%] shadow-[0_4px_0_#E5B86E] relative'>
                <div className='text-[5rem] mb-4 drop-shadow-[0_4px_0_#E5B86E] hover:scale-110 transition-transform'>
                  🔤
                </div>
                <h2 className='text-3xl md:text-4xl font-black text-advay-slate tracking-tight mb-4'>
                  Word Builder
                </h2>
                <p className='text-text-secondary font-bold text-xl mb-10'>
                  Pinch the letters in the correct order!
                </p>
                {ttsEnabled && (
                  <VoiceInstructions
                    instructions={[
                      'Spell the word.',
                      'Find the letters in order.',
                      'Pinch to select!',
                    ]}
                    autoSpeak={true}
                    showReplayButton={true}
                    replayButtonPosition='bottom-right'
                  />
                )}
                <button
                  type='button'
                  onClick={startGame}
                  className='w-full px-12 py-5 bg-[#3B82F6] hover:bg-blue-600 border-3 border-blue-200 hover:border-blue-300 text-white font-black rounded-full shadow-[0_4px_0_#E5B86E] text-2xl transition-transform hover:scale-[1.02] active:scale-95'
                >
                  Start Spelling
                </button>

                <div className='mt-4 text-sm text-slate-400 font-semibold'>
                  Parent settings: press and hold ⚙︎
                </div>

                <button
                  type='button'
                  onPointerDown={beginSettingsHold}
                  onPointerUp={cancelSettingsHold}
                  onPointerCancel={cancelSettingsHold}
                  onPointerLeave={cancelSettingsHold}
                  className='mt-2 inline-flex items-center justify-center w-14 h-14 rounded-full bg-slate-100 border-2 border-slate-200 text-2xl'
                  aria-label='Parent settings (press and hold)'
                >
                  ⚙︎
                </button>
              </div>
            </div>
          )}

          {gameCompleted && (
            <div className='absolute inset-0 bg-emerald-900/40 backdrop-blur-sm z-40 flex items-center justify-center rounded-[2.5rem]'>
              <div className='bg-white border-3 border-emerald-100 rounded-[3rem] p-12 text-center max-w-md w-[90%] shadow-[0_4px_0_#E5B86E]'>
                <div className='text-5xl mb-4 text-amber-500 font-bold drop-shadow-[0_4px_0_#E5B86E]'>
                  ★
                </div>
                <h2 className='text-4xl font-black text-[#10B981] mb-2'>
                  Word Master!
                </h2>
                <div className='inline-block bg-emerald-50 text-emerald-600 font-black text-2xl px-6 py-2 rounded-full mt-4'>
                  Score: {score}
                </div>
              </div>
            </div>
          )}

          {showSettings && (
            <div className='absolute inset-0 z-50 bg-[#FFF8F0]/80 backdrop-blur-sm flex items-center justify-center'>
              <div className='bg-white rounded-[2rem] border-[6px] border-[#F2CC8F] shadow-[0_6px_0_#E5B86E] w-[92%] max-w-lg p-8'>
                <div className='text-2xl font-black text-advay-slate mb-6'>
                  Parent Settings
                </div>

                <div className='space-y-6'>
                  <div>
                    <div className='font-bold text-slate-700 mb-2'>Mode</div>
                    <div className='flex gap-3'>
                      <button
                        type='button'
                        onClick={() => applySettings('explore', phonicsStageIdRef.current)}
                        className={`flex-1 py-3 rounded-xl border-2 font-black ${gameMode === 'explore'
                            ? 'bg-blue-50 border-blue-300 text-blue-700'
                            : 'bg-white border-slate-200 text-slate-500'
                          }`}
                      >
                        Explore
                      </button>
                      <button
                        type='button'
                        onClick={() => applySettings('phonics', phonicsStageIdRef.current)}
                        className={`flex-1 py-3 rounded-xl border-2 font-black ${gameMode === 'phonics'
                            ? 'bg-amber-50 border-amber-300 text-amber-700'
                            : 'bg-white border-slate-200 text-slate-500'
                          }`}
                      >
                        Phonics Path
                      </button>
                    </div>
                  </div>

                  <div className={`${gameMode === 'phonics' ? '' : 'opacity-50 pointer-events-none'}`}>
                    <div className='font-bold text-slate-700 mb-2'>Phonics stage</div>
                    <select
                      value={phonicsStageId}
                      onChange={(e) => setPhonicsStageId(e.target.value)}
                      className='w-full py-3 px-4 rounded-xl border-2 border-slate-200 font-bold'
                    >
                      {PHONICS_STAGES.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.label}
                        </option>
                      ))}
                    </select>

                    {/* Progress indicator */}
                    <div className='mt-3 text-sm text-slate-500'>
                      Progress: {wordsCompletedInStage} / {WORDS_PER_STAGE} words
                      {wordsCompletedInStage >= WORDS_PER_STAGE && autoAdvance && (
                        <span className='text-amber-600 font-bold ml-2'>→ Will advance!</span>
                      )}
                    </div>

                    {/* Auto-advance toggle */}
                    <div className='mt-4 flex items-center gap-3'>
                      <input
                        type='checkbox'
                        id='autoAdvance'
                        checked={autoAdvance}
                        onChange={(e) => setAutoAdvance(e.target.checked)}
                        className='w-5 h-5 rounded border-2 border-slate-300'
                      />
                      <label htmlFor='autoAdvance' className='font-bold text-slate-700 cursor-pointer'>
                        Auto-advance after {WORDS_PER_STAGE} words
                      </label>
                    </div>
                  </div>

                  {/* Insights button */}
                  <div className='pt-2 border-t-2 border-slate-100'>
                    <button
                      type='button'
                      onClick={loadInsights}
                      className='w-full py-3 rounded-xl border-2 border-emerald-200 bg-emerald-50 text-emerald-700 font-black hover:bg-emerald-100'
                    >
                      📊 View Learning Insights
                    </button>
                  </div>

                  <div className='flex gap-3 pt-2'>
                    <button
                      type='button'
                      onClick={() => setShowSettings(false)}
                      className='flex-1 py-3 rounded-xl border-2 border-slate-200 font-black text-slate-600'
                    >
                      Close
                    </button>
                    <button
                      type='button'
                      onClick={() => applySettings(gameMode, phonicsStageId)}
                      className='flex-1 py-3 rounded-xl border-2 border-blue-200 bg-blue-600 text-white font-black'
                    >
                      Apply
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Insights Panel */}
          {showInsights && analyticsData && (
            <div className='absolute inset-0 z-[60] bg-[#FFF8F0]/80 backdrop-blur-sm flex items-center justify-center'>
              <div className='bg-white rounded-[2rem] border-[6px] border-emerald-200 shadow-[0_6px_0_#10B981] w-[92%] max-w-lg p-8 max-h-[80vh] overflow-y-auto'>
                <div className='text-2xl font-black text-emerald-700 mb-2'>
                  📊 Learning Insights
                </div>
                <div className='text-sm text-slate-500 mb-6'>
                  Track your child's progress over time
                </div>

                {analyticsData.sessions.length === 0 ? (
                  <div className='text-center py-8 text-slate-400'>
                    No sessions yet. Play some games to see insights!
                  </div>
                ) : (
                  <div className='space-y-6'>
                    {/* Summary stats */}
                    <div className='grid grid-cols-2 gap-4'>
                      <div className='bg-blue-50 rounded-xl p-4 text-center'>
                        <div className='text-3xl font-black text-blue-600'>
                          {analyticsData.summary.totalSessions}
                        </div>
                        <div className='text-sm font-bold text-blue-700'>Total Sessions</div>
                      </div>
                      <div className='bg-amber-50 rounded-xl p-4 text-center'>
                        <div className='text-3xl font-black text-amber-600'>
                          {analyticsData.summary.totalItemsCompleted}
                        </div>
                        <div className='text-sm font-bold text-amber-700'>Words Spelled</div>
                      </div>
                    </div>

                    {/* Accuracy */}
                    <div className='bg-slate-50 rounded-xl p-4'>
                      <div className='flex justify-between items-center mb-2'>
                        <span className='font-bold text-slate-700'>Overall Accuracy</span>
                        <span className='text-2xl font-black text-emerald-600'>
                          {analyticsData.summary.overallAccuracy.toFixed(1)}%
                        </span>
                      </div>
                      <div className='w-full bg-slate-200 rounded-full h-3'>
                        <div
                          className='bg-emerald-500 h-3 rounded-full transition-all'
                          style={{ width: `${Math.min(analyticsData.summary.overallAccuracy, 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Top confusion */}
                    {analyticsData.summary.topConfusions.length > 0 && (
                      <div className='bg-red-50 rounded-xl p-4'>
                        <div className='font-bold text-red-700 mb-2'>Letters to Practice</div>
                        <div className='flex flex-wrap gap-2'>
                          {analyticsData.summary.topConfusions.slice(0, 3).map(([pair, count]) => (
                            <span
                              key={pair}
                              className='px-3 py-1 bg-red-100 text-red-700 rounded-full font-bold text-sm'
                            >
                              {pair}: {count}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Last session */}
                    {analyticsData.sessions.length > 0 && (
                      <div className='bg-slate-50 rounded-xl p-4'>
                        <div className='font-bold text-slate-700 mb-2'>Last Session</div>
                        <div className='text-sm text-slate-600 space-y-1'>
                          {(() => {
                            const session = analyticsData.sessions[analyticsData.sessions.length - 1];
                            const ext = session.extension;
                            if (!isWordBuilderExtension(ext)) return null;
                            return (
                              <>
                                <div>Words: {ext.wordsCompleted.length}</div>
                                <div>Accuracy: {ext.accuracy.toFixed(0)}%</div>
                              </>
                            );
                          })()}
                          <div className='text-xs text-slate-400'>
                            {new Date(analyticsData.sessions[analyticsData.sessions.length - 1].timestamp).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className='flex gap-3 pt-2'>
                      <button
                        type='button'
                        onClick={() => setShowInsights(false)}
                        className='flex-1 py-3 rounded-xl border-2 border-slate-200 font-black text-slate-600'
                      >
                        Back
                      </button>
                      <button
                        type='button'
                        onClick={exportAnalytics}
                        className='flex-1 py-3 rounded-xl border-2 border-emerald-200 bg-emerald-50 text-emerald-700 font-black'
                      >
                        Export JSON
                      </button>
                      <button
                        type='button'
                        onClick={resetAnalytics}
                        className='px-4 py-3 rounded-xl border-2 border-red-200 text-red-600 font-bold'
                        title='Clear all data'
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <GameControls controls={controls} position='bottom-right' />
      </div>

      {showCelebration && (
        <CelebrationOverlay
          show={showCelebration}
          letter={word}
          accuracy={100}
          message={`${word} spelled correctly!`}
          onComplete={() => setShowCelebration(false)}
        />
      )}
    </GameContainer>
  );
});

export default WordBuilder;
