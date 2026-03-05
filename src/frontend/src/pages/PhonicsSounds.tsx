import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTTS } from '../hooks/useTTS';
import { VoiceInstructions } from '../components/game/VoiceInstructions';

import { CelebrationOverlay } from '../components/CelebrationOverlay';
import { GameCursor } from '../components/game/GameCursor';
import { GameContainer } from '../components/GameContainer';
import { GameControls } from '../components/GameControls';
import type { GameControl } from '../components/GameControls';
import { useGameDrops } from '../hooks/useGameDrops';
import { useGameHandTracking } from '../hooks/useGameHandTracking';
import type { HandTrackingRuntimeMeta } from '../hooks/useHandTrackingRuntime';
import { useAudio } from '../utils/hooks/useAudio';
import {
  LEVELS,
  buildPhonicsRound,
  type PhonicsTarget,
  type Phoneme,
} from '../games/phonicsSoundsLogic';
import { assetLoader, SOUND_ASSETS } from '../utils/assets';
import { isPointInCircle } from '../games/targetPracticeLogic';
import { triggerHaptic } from '../utils/haptics';
import type { Point } from '../types/tracking';
import type { TrackedHandFrame } from '../utils/handTrackingFrame';
import { STREAK_MILESTONE_INTERVAL } from '../games/constants';

const HIT_RADIUS = 0.12;
const MAX_LEVEL = 3;

// Letter card background colors for visual variety
const CARD_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
  '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F',
];

export const PhonicsSounds = memo(function PhonicsSoundsComponent() {
  const navigate = useNavigate();
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const webcamRef = useRef<Webcam>(null);
  const levelTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const roundTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const speakTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const nextRoundTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const celebrationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isAdvancingRef = useRef(false);

  const [isPlaying, setIsPlaying] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [level, setLevel] = useState(1);
  const [round, setRound] = useState(1);
  const [, setTimeLeft] = useState(20);
  const [targets, setTargets] = useState<PhonicsTarget[]>([]);
  const [targetPhoneme, setTargetPhoneme] = useState<Phoneme | null>(null);
  const [cursor, setCursor] = useState<Point | null>(null);
  const [feedback, setFeedback] = useState('Pinch the letter that makes this sound!');
  const [showCelebration, setShowCelebration] = useState(false);
  const [showExample, setShowExample] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [usedLetters, setUsedLetters] = useState<string[]>([]);
  const [scorePopup, setScorePopup] = useState<{ points: number; x: number; y: number } | null>(null);
  const [showStreakMilestone, setShowStreakMilestone] = useState(false);

  const targetsRef = useRef<PhonicsTarget[]>(targets);
  const streakRef = useRef(streak);
  const roundRef = useRef(round);
  const levelRef = useRef(level);
  const correctCountRef = useRef(correctCount);
  const usedLettersRef = useRef<string[]>(usedLetters);

  const { playPop, playError, playSuccess, playCelebration, playClick, playLevelUp } = useAudio();
  const { speak, isEnabled: ttsEnabled } = useTTS();
  const { onGameComplete, triggerEasterEgg } = useGameDrops('phonics-sounds');
  const correctVowelsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    async function preloadAssets() {
      try {
        await assetLoader.loadSounds(Object.values(SOUND_ASSETS));
      } catch (error) {
        console.error('Failed to preload phonics sounds assets', error);
      }
    }

    void preloadAssets();
  }, []);

  useEffect(() => { targetsRef.current = targets; }, [targets]);
  useEffect(() => { streakRef.current = streak; }, [streak]);
  useEffect(() => { roundRef.current = round; }, [round]);
  useEffect(() => { levelRef.current = level; }, [level]);
  useEffect(() => { correctCountRef.current = correctCount; }, [correctCount]);
  useEffect(() => { usedLettersRef.current = usedLetters; }, [usedLetters]);

  // Speak the phoneme using TTS
  const speakPhoneme = useCallback((phoneme: Phoneme) => {
    if (ttsEnabled) {
      void speak(phoneme.ttsText);
    }
  }, [speak, ttsEnabled]);

  const startRound = useCallback(() => {
    if (isAdvancingRef.current) return;

    const lvlCfg = LEVELS.find((l) => l.level === levelRef.current) ?? LEVELS[0];
    const result = buildPhonicsRound(levelRef.current, usedLettersRef.current);
    setTargets(result.targets);
    setTargetPhoneme(result.targetPhoneme);
    setTimeLeft(lvlCfg.timePerRound);
    setShowExample(false);
    setFeedback(`🔊 "${result.targetPhoneme.sound}"`);
    setUsedLetters((prev) => [...prev, result.targetPhoneme.letter]);

    // Speak the phoneme after a short delay
    if (speakTimeoutRef.current) {
      clearTimeout(speakTimeoutRef.current);
    }
    speakTimeoutRef.current = setTimeout(() => {
      speakPhoneme(result.targetPhoneme);
      isAdvancingRef.current = false;
    }, 300);
  }, [speakPhoneme]);

  useEffect(() => {
    if (!isPlaying || gameCompleted) return;
    startRound();
  }, [isPlaying, level, gameCompleted, startRound]);

  // Round timer
  useEffect(() => {
    if (!isPlaying || gameCompleted) return;

    if (roundTimerRef.current) clearInterval(roundTimerRef.current);

    roundTimerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setStreak(0);
          nextRound();
          return 60;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (roundTimerRef.current) clearInterval(roundTimerRef.current);
    };
  }, [isPlaying, gameCompleted, round]);

  const nextRound = useCallback(() => {
    if (isAdvancingRef.current) return;
    isAdvancingRef.current = true;

    const lvlCfg = LEVELS.find((l) => l.level === levelRef.current) ?? LEVELS[0];

    if (roundRef.current >= lvlCfg.roundCount) {
      if (levelTimeoutRef.current) clearTimeout(levelTimeoutRef.current);

      // Check if passed level
      if (correctCountRef.current >= lvlCfg.passThreshold) {
        playLevelUp();
        void playCelebration();
        setShowCelebration(true);
        if (ttsEnabled) {
          if (levelRef.current >= MAX_LEVEL) {
            void speak('Congratulations! You are a phonics pro!');
          } else {
            void speak('Level complete! Great job!');
          }
        }

        if (levelTimeoutRef.current) clearTimeout(levelTimeoutRef.current);
        levelTimeoutRef.current = setTimeout(() => {
          setShowCelebration(false);
          if (levelRef.current >= MAX_LEVEL) {
            onGameComplete();
            setGameCompleted(true);
            setIsPlaying(false);
          } else {
            setLevel((prev) => prev + 1);
            setRound(1);
            setCorrectCount(0);
            setUsedLetters([]);
          }
          levelTimeoutRef.current = null;
          isAdvancingRef.current = false;
        }, 2000);
      } else {
        setFeedback(`Need ${lvlCfg.passThreshold} correct. Try again!`);
        setRound(1);
        setCorrectCount(0);
        setUsedLetters([]);
        isAdvancingRef.current = false;
        startRound();
      }
    } else {
      setRound((prev) => prev + 1);
      isAdvancingRef.current = false;
      startRound();
    }
  }, [playCelebration, startRound]);

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
      const hit = activeTargets.find((t) =>
        isPointInCircle(tip, { x: t.x, y: t.y }, HIT_RADIUS),
      );

      if (!hit) {
        setFeedback('Pinch directly on a letter.');
        playError();
        void playError();
        return;
      }

      if (hit.isCorrect) {
        const nextStreak = streakRef.current + 1;
        setStreak(nextStreak);
        setCorrectCount((prev) => prev + 1);
        const basePoints = 10;
        const streakBonus = Math.min(nextStreak * 2, 15);
        const totalPoints = basePoints + streakBonus;
        setScore((prev) => prev + totalPoints);
        setScorePopup({ points: totalPoints, x: 50, y: 30 });
        setTimeout(() => setScorePopup(null), 700);
        triggerHaptic('success');
        setFeedback(`Yes! ${hit.phoneme.letter} = ${hit.phoneme.exampleWord} ${hit.phoneme.exampleEmoji}`);
        setShowExample(true);
        if (ttsEnabled) {
          void speak(`Yes! ${hit.phoneme.letter} as in ${hit.phoneme.exampleWord}!`);
        }
        playSuccess();
        void playPop();

        const vowels = ['A', 'E', 'I', 'O', 'U'];
        if (vowels.includes(hit.phoneme.letter.toUpperCase())) {
          correctVowelsRef.current.add(hit.phoneme.letter.toUpperCase());
          if (correctVowelsRef.current.size >= 5) {
            triggerEasterEgg('egg-vowel-master');
          }
        }

        if (nextStreak > 0 && nextStreak % STREAK_MILESTONE_INTERVAL === 0) {
          setShowStreakMilestone(true);
          triggerHaptic('celebration');
          setShowCelebration(true);
          void playCelebration();
          if (ttsEnabled) {
            void speak('Amazing streak! Keep going!');
          }
          if (celebrationTimeoutRef.current) {
            clearTimeout(celebrationTimeoutRef.current);
          }
          celebrationTimeoutRef.current = setTimeout(() => {
            setShowCelebration(false);
            setShowStreakMilestone(false);
          }, 1800);
          setTimeout(() => setShowStreakMilestone(false), 1200);
        }

        if (nextRoundTimeoutRef.current) {
          clearTimeout(nextRoundTimeoutRef.current);
        }
        nextRoundTimeoutRef.current = setTimeout(() => nextRound(), 1200);
      } else {
        setStreak(0);
        triggerHaptic('error');
        setFeedback(`That's "${hit.phoneme.sound}". Listen again!`);
        if (ttsEnabled) {
          void speak(`That's ${hit.phoneme.sound}. Try again!`);
        }
        playError();
        void playError();
        // Re-speak the target phoneme
        if (targetPhoneme) {
          if (speakTimeoutRef.current) {
            clearTimeout(speakTimeoutRef.current);
          }
          speakTimeoutRef.current = setTimeout(() => speakPhoneme(targetPhoneme), 500);
        }
      }
    },
    [cursor, nextRound, playCelebration, playError, playPop, targetPhoneme, speakPhoneme, speak, ttsEnabled],
  );

  const { isLoading: isModelLoading, isReady: isHandTrackingReady, startTracking } =
    useGameHandTracking({
      gameName: 'PhonicsSounds',
      isRunning: isPlaying && !gameCompleted,
      webcamRef,
      targetFps: 24,
      onFrame: handleFrame,
      onNoVideoFrame: () => {
        if (cursor !== null) setCursor(null);
      },
    });

  useEffect(() => {
    if (isPlaying && !gameCompleted && !isHandTrackingReady && !isModelLoading) {
      void startTracking();
    }
  }, [gameCompleted, isHandTrackingReady, isModelLoading, isPlaying, startTracking]);

  useEffect(() => {
    return () => {
      if (roundTimerRef.current) {
        clearInterval(roundTimerRef.current);
        roundTimerRef.current = null;
      }
      if (levelTimeoutRef.current) {
        clearTimeout(levelTimeoutRef.current);
        levelTimeoutRef.current = null;
      }
      if (speakTimeoutRef.current) {
        clearTimeout(speakTimeoutRef.current);
        speakTimeoutRef.current = null;
      }
      if (nextRoundTimeoutRef.current) {
        clearTimeout(nextRoundTimeoutRef.current);
        nextRoundTimeoutRef.current = null;
      }
      if (celebrationTimeoutRef.current) {
        clearTimeout(celebrationTimeoutRef.current);
        celebrationTimeoutRef.current = null;
      }
      isAdvancingRef.current = false;
    };
  }, []);

  const startGame = async () => {
    setGameCompleted(false);
    setScore(0);
    setStreak(0);
    setLevel(1);
    setRound(1);
    setCorrectCount(0);
    setUsedLetters([]);
    setTimeLeft(60);
    setFeedback('Pinch the letter that makes this sound!');
    setCursor(null);
    setShowExample(false);
    setScorePopup(null);
    setShowStreakMilestone(false);
    setIsPlaying(true);
    isAdvancingRef.current = false;
    playPop();
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
    if (roundTimerRef.current) {
      clearInterval(roundTimerRef.current);
      roundTimerRef.current = null;
    }
    if (speakTimeoutRef.current) {
      clearTimeout(speakTimeoutRef.current);
      speakTimeoutRef.current = null;
    }
    if (nextRoundTimeoutRef.current) {
      clearTimeout(nextRoundTimeoutRef.current);
      nextRoundTimeoutRef.current = null;
    }
    if (celebrationTimeoutRef.current) {
      clearTimeout(celebrationTimeoutRef.current);
      celebrationTimeoutRef.current = null;
    }
    isAdvancingRef.current = false;
    // TTS cleanup handled by hook
    setIsPlaying(false);
    setGameCompleted(false);
    setTargets([]);
    setCursor(null);
    setTimeLeft(60);
    setFeedback('Pinch the letter that makes this sound!');
  };

  const goHome = () => {
    resetGame();
    navigate('/dashboard');
  };

  const repeatSound = () => {
    if (targetPhoneme) {
      playPop();
      speakPhoneme(targetPhoneme);
    }
  };

  const controls: GameControl[] = [
    {
      id: 'start',
      icon: (isPlaying ? 'rotate-ccw' : 'play') as any,
      label: isPlaying ? 'Restart' : 'Start',
      onClick: startGame,
      variant: isPlaying ? 'secondary' : 'success',
    },
    {
      id: 'repeat',
      icon: 'volume-2' as any,
      label: '🔊 Repeat',
      onClick: repeatSound,
      variant: 'primary',
      disabled: !isPlaying || !targetPhoneme,
    },
    {
      id: 'home',
      icon: 'home' as any,
      label: 'Home',
      onClick: goHome,
      variant: 'primary',
    },
  ];

  const lvlCfg = LEVELS.find((l) => l.level === level) ?? LEVELS[0];

  return (
    <GameContainer webcamRef={webcamRef}       title='Phonics Sounds'
      score={score}
      level={level}
      onHome={goHome}
      isHandDetected={isHandTrackingReady}
      isPlaying={isPlaying}
    >
      <div ref={gameAreaRef} className='absolute inset-0 bg-blue-50 overflow-hidden'>
        

        <div className='absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-purple-100/40 pointer-events-none' />

        {/* Feedback */}
        <div className='absolute top-6 left-1/2 -translate-x-1/2 px-8 py-3 rounded-full bg-white/95 backdrop-blur-sm border-3 border-[#F2CC8F] shadow-[0_4px_0_#E5B86E] text-advay-slate font-bold text-lg text-center min-w-[320px]'>
          {feedback}
        </div>

        {/* Relaxed Timer */}
        <div className='absolute top-6 right-6 px-6 py-3 rounded-full bg-white/95 backdrop-blur-sm border-3 border-[#F2CC8F] shadow-[0_4px_0_#E5B86E] text-slate-400 font-bold text-lg'>
          Take your time!
        </div>

        {/* Round info */}
        {targetPhoneme && (
          <div className='absolute top-6 left-6 px-6 py-3 rounded-full bg-white/95 backdrop-blur-sm border-3 border-[#F2CC8F] shadow-[0_4px_0_#E5B86E] text-text-secondary font-bold text-lg flex items-center gap-3'>
            <button onClick={repeatSound} className='text-xl mr-1 hover:scale-110 transition-transform active:scale-95'>🔊</button>
            <span className='font-black text-2xl text-[#3B82F6]'>"{targetPhoneme.sound}"</span>
            <span className='text-sm font-bold text-slate-400 uppercase tracking-widest ml-3 bg-slate-100 px-3 py-1 rounded-full'>
              R{round}/{lvlCfg.roundCount}
            </span>
          </div>
        )}

        {/* Streak HUD */}
        {streak > 0 && (
          <div className='absolute top-24 left-1/2 -translate-x-1/2 px-6 py-2 rounded-full border-3 border-orange-200 bg-orange-100/90 text-orange-600 font-black text-lg shadow-[0_4px_0_#E5B86E] drop-shadow-[0_4px_0_#E5B86E]'>
            🔥 {streak} streak!
          </div>
        )}

        {/* Score Popup */}
        {scorePopup && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.5 }}
            animate={{ opacity: 1, y: -20, scale: 1.2 }}
            exit={{ opacity: 0, y: -40 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className='absolute left-1/2 -translate-x-1/2 pointer-events-none z-20'
            style={{ top: `${scorePopup.y}%` }}
          >
            <div className='px-6 py-3 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500 text-white font-black text-2xl shadow-lg border-2 border-emerald-300'>
              +{scorePopup.points}
              {scorePopup.points > 10 && <span className='ml-2 text-lg'>✨</span>}
            </div>
          </motion.div>
        )}

        {/* Streak Milestone */}
        {showStreakMilestone && (
          <motion.div
            initial={{ opacity: 0, scale: 0.3, rotate: -10 }}
            animate={{ opacity: 1, scale: 1.2, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.8, rotate: 10 }}
            transition={{ duration: 0.4, type: 'spring', stiffness: 200 }}
            className='absolute inset-0 flex items-center justify-center pointer-events-none z-30'
          >
            <div className='px-10 py-6 rounded-[2.5rem] bg-gradient-to-br from-orange-400 via-red-400 to-pink-400 text-white font-black text-4xl shadow-2xl border-4 border-orange-200'>
              <span className='drop-shadow-lg'>🔥 {streak} STREAK! 🔥</span>
            </div>
          </motion.div>
        )}

        {/* Letter targets */}
        {targets.map((target, i) => (
          <div
            key={target.id}
            className='absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-transform hover:scale-105'
            style={{
              left: `${target.x * 100}%`,
              top: `${target.y * 100}%`,
              width: '130px',
              height: '130px',
            }}
            aria-hidden='true'
          >
            <div
              className='absolute inset-0 rounded-[2.5rem] border-[6px] shadow-[0_4px_0_#E5B86E] flex items-center justify-center bg-white'
              style={{
                borderColor: CARD_COLORS[i % CARD_COLORS.length],
              }}
            >
              <div
                className='absolute inset-0 rounded-[2.2rem] opacity-20'
                style={{ backgroundColor: CARD_COLORS[i % CARD_COLORS.length] }}
              />
              <span
                className='text-6xl font-black drop-shadow-[0_4px_0_#E5B86E]'
                style={{ color: CARD_COLORS[i % CARD_COLORS.length] }}
              >
                {target.phoneme.letter}
              </span>
            </div>
          </div>
        ))}

        {/* Example word popup */}
        {showExample && targetPhoneme && (
          <div className='absolute bottom-32 left-1/2 -translate-x-1/2 px-8 py-4 rounded-[2rem] bg-emerald-50 border-3 border-emerald-200 text-emerald-600 shadow-[0_4px_0_#E5B86E] text-2xl font-black text-center flex items-center gap-3'>
            <span className='text-4xl drop-shadow-[0_4px_0_#E5B86E]'>{targetPhoneme.letter}</span> = {targetPhoneme.exampleWord} {targetPhoneme.exampleEmoji}
          </div>
        )}

        {/* Cursor */}
        {cursor && (
          <GameCursor
            position={cursor}
            coordinateSpace='normalized'
            containerRef={gameAreaRef}
            isPinching={false}
            isHandDetected={isPlaying}
            size={84}
          />
        )}

        {/* Pre-game screen */}
        {!isPlaying && !gameCompleted && (
          <div className='absolute inset-0 bg-slate-900/40 backdrop-blur-sm z-30 flex items-center justify-center'>
            <div className='bg-white border-3 border-[#F2CC8F] rounded-[3rem] p-12 text-center max-w-md w-[90%] shadow-[0_4px_0_#E5B86E] relative'>
              <div className='text-[5rem] mb-4 drop-shadow-[0_4px_0_#E5B86E] hover:scale-110 transition-transform'>🔤🔊</div>
              <h2 className='text-3xl md:text-4xl font-black text-advay-slate tracking-tight mb-4'>Phonics Sounds</h2>
              <p className='text-text-secondary font-bold text-xl mb-10'>
                Listen to the sound, then pinch the right letter!
              </p>
              {ttsEnabled && (
                <VoiceInstructions
                  instructions={[
                    'Listen to the sound.',
                    'Find the matching letter.',
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
                Start Phonics!
              </button>
            </div>
          </div>
        )}

        {/* Game complete */}
        {gameCompleted && (
          <div className='absolute inset-0 bg-slate-900/40 backdrop-blur-sm z-30 flex items-center justify-center'>
            <div className='bg-white border-3 border-[#F2CC8F] rounded-[3rem] p-12 text-center max-w-md w-[80%] shadow-[0_4px_0_#E5B86E]'>
              <div className='text-5xl mb-4 text-amber-500 font-bold drop-shadow-[0_4px_0_#E5B86E] hover:scale-110 transition-transform'>★</div>
              <h2 className='text-4xl font-black text-[#10B981] tracking-tight mb-2'>Phonics Pro! 🔤</h2>
              <p className='text-xl font-bold text-text-secondary mb-8'>Incredible job mastering all levels!</p>
              <div className='inline-block bg-amber-50 border-3 border-amber-100 text-amber-500 text-2xl font-black rounded-full px-8 py-3'>
                Final Score: {score}
              </div>
            </div>
          </div>
        )}

        <GameControls controls={controls} position='bottom-right' />
      </div>

      {showCelebration && (
        <CelebrationOverlay
          show={showCelebration}
          letter={targetPhoneme?.exampleEmoji ?? ''}
          accuracy={100}
          message={level >= MAX_LEVEL ? 'All levels complete!' : `Level ${level} complete!`}
          onComplete={() => setShowCelebration(false)}
        />
      )}
    </GameContainer>
  );
});

export default PhonicsSounds;
