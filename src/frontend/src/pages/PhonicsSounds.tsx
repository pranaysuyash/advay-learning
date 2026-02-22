import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Webcam from 'react-webcam';

import { CelebrationOverlay } from '../components/CelebrationOverlay';
import { GameContainer } from '../components/GameContainer';
import { GameControls } from '../components/GameControls';
import type { GameControl } from '../components/GameControls';
import { useHandTracking } from '../hooks/useHandTracking';
import {
  useHandTrackingRuntime,
  type HandTrackingRuntimeMeta,
} from '../hooks/useHandTrackingRuntime';
import { useSoundEffects } from '../hooks/useSoundEffects';
import { assetLoader, SOUND_ASSETS } from '../utils/assets';
import {
  LEVELS,
  buildPhonicsRound,
  type PhonicsTarget,
  type Phoneme,
} from '../games/phonicsSoundsLogic';
import { isPointInCircle } from '../games/targetPracticeLogic';
import type { Point } from '../types/tracking';
import type { TrackedHandFrame } from '../utils/handTrackingFrame';

const HIT_RADIUS = 0.12;
const MAX_LEVEL = 3;

// Letter card background colors for visual variety
const CARD_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
  '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F',
];

export const PhonicsSounds = memo(function PhonicsSoundsComponent() {
  const navigate = useNavigate();
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
  const [timeLeft, setTimeLeft] = useState(20);
  const [targets, setTargets] = useState<PhonicsTarget[]>([]);
  const [targetPhoneme, setTargetPhoneme] = useState<Phoneme | null>(null);
  const [cursor, setCursor] = useState<Point | null>(null);
  const [feedback, setFeedback] = useState('Pinch the letter that makes this sound!');
  const [showCelebration, setShowCelebration] = useState(false);
  const [showExample, setShowExample] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [usedLetters, setUsedLetters] = useState<string[]>([]);

  const targetsRef = useRef<PhonicsTarget[]>(targets);
  const streakRef = useRef(streak);
  const roundRef = useRef(round);
  const levelRef = useRef(level);
  const correctCountRef = useRef(correctCount);
  const usedLettersRef = useRef<string[]>(usedLetters);

  const {
    landmarker,
    isLoading: isModelLoading,
    isReady: isHandTrackingReady,
    initialize: initializeHandTracking,
  } = useHandTracking({
    numHands: 1,
    minDetectionConfidence: 0.3,
    minHandPresenceConfidence: 0.3,
    minTrackingConfidence: 0.3,
    delegate: 'GPU',
    enableFallback: true,
  });

  const { playPop, playError, playCelebration, playStart } = useSoundEffects();

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

  useEffect(() => {
    if (isPlaying && !isHandTrackingReady && !isModelLoading) {
      initializeHandTracking();
    }
  }, [initializeHandTracking, isHandTrackingReady, isModelLoading, isPlaying]);

  // Speak the phoneme using TTS
  const speakPhoneme = useCallback((phoneme: Phoneme) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(phoneme.ttsText);
      utterance.rate = 0.85;
      utterance.pitch = 1.2;
      utterance.volume = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  }, []);

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
          return 20;
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
        assetLoader.playSound('level-complete', 0.55);
        void playCelebration();
        setShowCelebration(true);

        if (levelTimeoutRef.current) clearTimeout(levelTimeoutRef.current);
        levelTimeoutRef.current = setTimeout(() => {
          setShowCelebration(false);
          if (levelRef.current >= MAX_LEVEL) {
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
        assetLoader.playSound('wrong', 0.35);
        void playError();
        return;
      }

      if (hit.isCorrect) {
        const nextStreak = streakRef.current + 1;
        setStreak(nextStreak);
        setCorrectCount((prev) => prev + 1);
        setScore((prev) => prev + 10 + Math.min(15, nextStreak * 3));
        setFeedback(`Yes! ${hit.phoneme.letter} = ${hit.phoneme.exampleWord} ${hit.phoneme.exampleEmoji}`);
        setShowExample(true);
        assetLoader.playSound('success', 0.45);
        void playPop();

        if (nextStreak > 0 && nextStreak % 5 === 0) {
          setShowCelebration(true);
          void playCelebration();
          if (celebrationTimeoutRef.current) {
            clearTimeout(celebrationTimeoutRef.current);
          }
          celebrationTimeoutRef.current = setTimeout(() => {
            setShowCelebration(false);
          }, 1800);
        }

        if (nextRoundTimeoutRef.current) {
          clearTimeout(nextRoundTimeoutRef.current);
        }
        nextRoundTimeoutRef.current = setTimeout(() => nextRound(), 1200);
      } else {
        setStreak(0);
        setFeedback(`That's "${hit.phoneme.sound}". Listen again!`);
        assetLoader.playSound('wrong', 0.35);
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
    [cursor, nextRound, playCelebration, playError, playPop, targetPhoneme, speakPhoneme],
  );

  useHandTrackingRuntime({
    isRunning: isPlaying && !gameCompleted && isHandTrackingReady,
    handLandmarker: landmarker,
    webcamRef,
    targetFps: 24,
    onFrame: handleFrame,
    onNoVideoFrame: () => {
      if (cursor !== null) setCursor(null);
    },
  });

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
    setTimeLeft(20);
    setFeedback('Pinch the letter that makes this sound!');
    setCursor(null);
    setShowExample(false);
    setIsPlaying(true);
    isAdvancingRef.current = false;
    assetLoader.playSound('pop', 0.25);
    await playStart();

    if (!isHandTrackingReady && !isModelLoading) {
      void initializeHandTracking();
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
    window.speechSynthesis?.cancel();
    setIsPlaying(false);
    setGameCompleted(false);
    setTargets([]);
    setCursor(null);
    setTimeLeft(20);
    setFeedback('Pinch the letter that makes this sound!');
  };

  const goHome = () => {
    resetGame();
    navigate('/dashboard');
  };

  const repeatSound = () => {
    if (targetPhoneme) {
      assetLoader.playSound('pop', 0.2);
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
    <GameContainer
      title='Phonics Sounds'
      score={score}
      level={level}
      onHome={goHome}
    >
      <div className='absolute inset-0 bg-blue-50 overflow-hidden'>
        <Webcam
          ref={webcamRef}
          audio={false}
          mirrored
          className='absolute inset-0 w-full h-full object-cover opacity-15 mix-blend-multiply'
          videoConstraints={{ facingMode: 'user' }}
        />

        <div className='absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-purple-100/40 pointer-events-none' />

        {/* Feedback */}
        <div className='absolute top-6 left-1/2 -translate-x-1/2 px-8 py-3 rounded-full bg-white/95 backdrop-blur-sm border-4 border-slate-200 shadow-sm text-slate-600 font-bold text-lg text-center min-w-[320px]'>
          {feedback}
        </div>

        {/* Timer */}
        <div className='absolute top-6 right-6 px-6 py-3 rounded-full bg-white/95 backdrop-blur-sm border-4 border-slate-200 shadow-sm text-slate-500 font-bold text-lg'>
          Time: <span className={`font-black text-2xl ml-2 ${timeLeft <= 5 ? 'text-[#EF4444]' : 'text-amber-500'}`}>{timeLeft}s</span>
        </div>

        {/* Round info */}
        {targetPhoneme && (
          <div className='absolute top-6 left-6 px-6 py-3 rounded-full bg-white/95 backdrop-blur-sm border-4 border-slate-200 shadow-sm text-slate-500 font-bold text-lg flex items-center gap-3'>
            <button onClick={repeatSound} className='text-xl mr-1 hover:scale-110 transition-transform active:scale-95'>🔊</button>
            <span className='font-black text-2xl text-[#3B82F6]'>"{targetPhoneme.sound}"</span>
            <span className='text-sm font-bold text-slate-400 uppercase tracking-widest ml-3 bg-slate-100 px-3 py-1 rounded-full'>
              R{round}/{lvlCfg.roundCount}
            </span>
          </div>
        )}

        {/* Streak */}
        {streak > 0 && (
          <div className='absolute top-24 left-1/2 -translate-x-1/2 px-6 py-2 rounded-full border-4 border-orange-200 bg-orange-100/90 text-orange-600 font-black text-lg shadow-sm drop-shadow-sm'>
            🔥 {streak} streak!
          </div>
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
              className='absolute inset-0 rounded-[2.5rem] border-[6px] shadow-sm flex items-center justify-center bg-white'
              style={{
                borderColor: CARD_COLORS[i % CARD_COLORS.length],
              }}
            >
              <div
                className='absolute inset-0 rounded-[2.2rem] opacity-20'
                style={{ backgroundColor: CARD_COLORS[i % CARD_COLORS.length] }}
              />
              <span
                className='text-6xl font-black drop-shadow-sm'
                style={{ color: CARD_COLORS[i % CARD_COLORS.length] }}
              >
                {target.phoneme.letter}
              </span>
            </div>
          </div>
        ))}

        {/* Example word popup */}
        {showExample && targetPhoneme && (
          <div className='absolute bottom-32 left-1/2 -translate-x-1/2 px-8 py-4 rounded-[2rem] bg-emerald-50 border-4 border-emerald-200 text-emerald-600 shadow-sm text-2xl font-black text-center flex items-center gap-3'>
            <span className='text-4xl drop-shadow-sm'>{targetPhoneme.letter}</span> = {targetPhoneme.exampleWord} {targetPhoneme.exampleEmoji}
          </div>
        )}

        {/* Cursor */}
        {cursor && (
          <div
            className='absolute w-12 h-12 rounded-full border-4 border-[#F59E0B] bg-amber-100/60 -translate-x-1/2 -translate-y-1/2 shadow-[0_0_20px_rgba(245,158,11,0.5)] pointer-events-none z-20'
            style={{ left: `${cursor.x * 100}%`, top: `${cursor.y * 100}%` }}
            aria-hidden='true'
          />
        )}

        {/* Pre-game screen */}
        {!isPlaying && !gameCompleted && (
          <div className='absolute inset-0 bg-slate-900/40 backdrop-blur-sm z-30 flex items-center justify-center'>
            <div className='bg-white border-4 border-slate-100 rounded-[3rem] p-12 text-center max-w-md w-[90%] shadow-sm'>
              <div className='text-[5rem] mb-4 drop-shadow-sm hover:scale-110 transition-transform'>🔤🔊</div>
              <h2 className='text-3xl md:text-4xl font-black text-slate-800 tracking-tight mb-4'>Phonics Sounds</h2>
              <p className='text-slate-500 font-bold text-xl mb-10'>
                Listen to the sound, then pinch the right letter!
              </p>
              <button
                type='button'
                onClick={startGame}
                className='w-full px-12 py-5 bg-[#3B82F6] hover:bg-blue-600 border-4 border-blue-200 hover:border-blue-300 text-white font-black rounded-full shadow-sm text-2xl transition-transform hover:scale-[1.02] active:scale-95'
              >
                Start Phonics!
              </button>
            </div>
          </div>
        )}

        {/* Game complete */}
        {gameCompleted && (
          <div className='absolute inset-0 bg-slate-900/40 backdrop-blur-sm z-30 flex items-center justify-center'>
            <div className='bg-white border-4 border-slate-100 rounded-[3rem] p-12 text-center max-w-md w-[80%] shadow-sm'>
              <div className='text-[5rem] mb-4 drop-shadow-sm hover:scale-110 transition-transform'>🏆</div>
              <h2 className='text-4xl font-black text-[#10B981] tracking-tight mb-2'>Phonics Pro! 🔤</h2>
              <p className='text-xl font-bold text-slate-500 mb-8'>Incredible job mastering all levels!</p>
              <div className='inline-block bg-amber-50 border-4 border-amber-100 text-amber-500 text-2xl font-black rounded-full px-8 py-3'>
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
          letter={targetPhoneme?.exampleEmoji ?? '🎉'}
          accuracy={100}
          message={level >= MAX_LEVEL ? 'All levels complete!' : `Level ${level} complete!`}
          onComplete={() => setShowCelebration(false)}
        />
      )}
    </GameContainer>
  );
});

export default PhonicsSounds;
