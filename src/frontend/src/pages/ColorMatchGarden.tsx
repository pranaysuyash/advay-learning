/**
 * Color Match Garden Game
 * 
 * @ticket GQ-002, GQ-003, GQ-004, GQ-005, GQ-007
 */

import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { CelebrationOverlay } from '../components/CelebrationOverlay';
import { GameShell } from '../components/GameShell';
import { GameCursor } from '../components/game/GameCursor';
import { GameContainer } from '../components/GameContainer';
import { GameControls } from '../components/GameControls';
import type { GameControl } from '../components/GameControls';
import { useGameHandTracking } from '../hooks/useGameHandTracking';
import { useStreakTracking } from '../hooks/useStreakTracking';
import type { HandTrackingRuntimeMeta } from '../hooks/useHandTrackingRuntime';
import { useGameDrops } from '../hooks/useGameDrops';
import { useAudio } from '../utils/hooks/useAudio';
import { useTTS } from '../hooks/useTTS';
import { VoiceInstructions } from '../components/game/VoiceInstructions';
import { triggerHaptic } from '../utils/haptics';
import {
  isPointInCircle,
  pickSpacedPoints,
} from '../games/targetPracticeLogic';
import {
  assetLoader,
  PAINT_ASSETS,
  WEATHER_BACKGROUNDS,
  SOUND_ASSETS,
} from '../utils/assets';
import type { Point } from '../types/tracking';
import { randomFloat01 } from '../utils/random';
import type { TrackedHandFrame } from '../utils/handTrackingFrame';

// Kenney heart assets for streak HUD
const HEART_FULL = '/assets/kenney/platformer/hud/hud_heart.png';
const HEART_EMPTY = '/assets/kenney/platformer/hud/hud_heart_empty.png';

interface GardenTarget {
  id: number;
  name: string;
  color: string;
  emoji: string;
  assetId: string;
  position: Point;
}

const FLOWERS: Array<{
  name: string;
  color: string;
  emoji: string;
  assetId: string;
}> = [
  { name: 'Red', color: '#ef4444', emoji: '🌺', assetId: 'brush-red' },
  { name: 'Blue', color: '#3b82f6', emoji: '🪻', assetId: 'brush-blue' },
  { name: 'Green', color: '#22c55e', emoji: '🌿', assetId: 'brush-green' },
  { name: 'Yellow', color: '#eab308', emoji: '🌻', assetId: 'brush-yellow' },
  { name: 'Pink', color: '#ec4899', emoji: '🌸', assetId: 'brush-red' },
  { name: 'Purple', color: '#8b5cf6', emoji: '🌷', assetId: 'brush-blue' },
];

const TARGET_RADIUS = 0.1;

function buildRoundTargets(): { targets: GardenTarget[]; promptId: number } {
  const random = randomFloat01;
  const picked = [...FLOWERS]
    .sort(() => random() - 0.5)
    .slice(0, 3)
    .map((flower, index) => ({ ...flower, id: index }));

  const points = pickSpacedPoints(3, 0.25, 0.15, random);
  const targets: GardenTarget[] = picked.map((flower, index) => ({
    ...flower,
    position: points[index]?.position ?? { x: 0.5, y: 0.5 },
  }));

  const promptId = Math.floor(random() * targets.length);
  return { targets, promptId };
}

const ColorMatchGardenGame = memo(function ColorMatchGardenComponent() {
  const navigate = useNavigate();
  const gameAreaRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [targets, setTargets] = useState<GardenTarget[]>([]);
  const [promptId, setPromptId] = useState<number>(0);
  const [cursor, setCursor] = useState<Point | null>(null);
  const [feedback, setFeedback] = useState(
    'Pinch the flower with the asked color.',
  );
  const [showCelebration, setShowCelebration] = useState(false);
  const [gardenBgSrc, setGardenBgSrc] = useState<string | null>(null);

  // Timer display ref for color changes
  const timeLeftRef = useRef(60);

  // Streak tracking - note: we need refs for closure access in handleFrame
  const { streak, incrementStreak, resetStreak } = useStreakTracking();

  const scoreRef = useRef(score);
  const streakRef = useRef(streak);
  const targetsRef = useRef(targets);
  const promptRef = useRef(promptId);

  const { playPop, playError, playFanfare: playCelebration } = useAudio();
  const { speak, isEnabled: ttsEnabled } = useTTS();
  const { onGameComplete } = useGameDrops('color-match-garden');

  useEffect(() => {
    let mounted = true;

    async function preloadAssets() {
      try {
        await assetLoader.loadImages([
          ...PAINT_ASSETS,
          WEATHER_BACKGROUNDS.sunny,
        ]);
        await assetLoader.loadSounds(Object.values(SOUND_ASSETS));
      } catch (error) {
        console.error('Failed to preload color-match assets', error);
      }

      if (!mounted) return;
      const bg = assetLoader.getImage(WEATHER_BACKGROUNDS.sunny.id);
      setGardenBgSrc(bg?.src || null);
    }

    void preloadAssets();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  useEffect(() => {
    streakRef.current = streak;
  }, [streak]);

  useEffect(() => {
    targetsRef.current = targets;
  }, [targets]);

  // Keep streak ref in sync for handleFrame closure
  useEffect(() => {
    streakRef.current = streak;
  }, [streak]);

  useEffect(() => {
    promptRef.current = promptId;
  }, [promptId]);
  
  useEffect(() => {
    timeLeftRef.current = timeLeft;
  }, [timeLeft]);

  useEffect(() => {
    if (!isPlaying) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          onGameComplete();
          setIsPlaying(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPlaying]);

  const startRound = useCallback(() => {
    const round = buildRoundTargets();
    setTargets(round.targets);
    setPromptId(round.promptId);
  }, []);

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
      const hitTarget = activeTargets.find((target) =>
        isPointInCircle(tip, target.position, TARGET_RADIUS),
      );

      if (!hitTarget) {
        setFeedback('Try pinching directly on a flower.');
        void playError();
        return;
      }

      const expected = activeTargets[promptRef.current];
      if (!expected) return;

      if (hitTarget.id === expected.id) {
        const nextStreak = incrementStreak();
        const nextScore = scoreRef.current + 12 + Math.min(18, nextStreak * 2);
        setScore(nextScore);
        setFeedback(`Yes! ${expected.name} flower collected.`);
        if (ttsEnabled) {
          void speak(`Yes! ${expected.name}! Great job!`);
        }
        assetLoader.playSound('pop', 0.5);
        void playPop();
        triggerHaptic('success');

        if (nextStreak > 0 && nextStreak % 6 === 0) {
          setShowCelebration(true);
          assetLoader.playSound('success', 0.75);
          void playCelebration();
          if (ttsEnabled) {
            void speak('Amazing streak! Six in a row!');
          }
          setTimeout(() => setShowCelebration(false), 1800);
        }

        startRound();
      } else {
        resetStreak();
        setFeedback(`That was ${hitTarget.name}. Find ${expected.name}.`);
        if (ttsEnabled) {
          void speak(`Try again! Find the ${expected.name} flower!`);
        }
        assetLoader.playSound('wrong', 0.65);
        void playError();
        triggerHaptic('error');
      }
    },
    [
      cursor,
      playCelebration,
      playError,
      playPop,
      speak,
      startRound,
      ttsEnabled,
      incrementStreak,
      resetStreak,
    ],
  );

  const {
    isLoading: isModelLoading,
    isReady: isHandTrackingReady,
    startTracking,
    webcamRef: _webcamRef,
  } = useGameHandTracking({
    gameName: 'ColorMatchGarden',
    targetFps: 30,
    isRunning: isPlaying,
    onFrame: handleFrame,
    onNoVideoFrame: () => {
      if (cursor !== null) setCursor(null);
    },
  });

  useEffect(() => {
    if (isPlaying && !isHandTrackingReady && !isModelLoading) {
      void startTracking();
    }
  }, [isHandTrackingReady, isModelLoading, isPlaying, startTracking]);

  const startGame = async () => {
    setScore(0);
    resetStreak();
    setTimeLeft(60);
    setFeedback('Pinch the flower with the asked color.');
    setCursor(null);
    startRound();
    setIsPlaying(true);
    if (ttsEnabled) {
      const prompt = promptRef.current;
      const targetName = targetsRef.current[prompt]?.name ?? 'the color';
      void speak(`Find the ${targetName} flower!`);
    }
    assetLoader.playSound('pop', 0.5);
    playPop();

    if (!isHandTrackingReady && !isModelLoading) {
      void startTracking();
    }
  };

  const resetGame = () => {
    setIsPlaying(false);
    setCursor(null);
    setTimeLeft(60);
    setFeedback('Pinch the flower with the asked color.');
  };

  const goHome = () => {
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

  const promptTarget = targets[promptId];

  return (
    <GameContainer
      webcamRef={_webcamRef}
      title='Color Match Garden'
      score={score}
      level={Math.max(1, Math.floor(score / 100) + 1)}
      onHome={goHome}
      isHandDetected={isHandTrackingReady}
      isPlaying={isPlaying}
    >
      <div
        ref={gameAreaRef}
        className='absolute inset-0 bg-discovery-cream'
        style={{
          backgroundImage: gardenBgSrc
            ? `linear-gradient(rgba(248,250,252,0.8), rgba(226,232,240,0.9)), url(${gardenBgSrc})`
            : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className='absolute inset-0 bg-gradient-to-b from-white/30 via-transparent to-white/40 backdrop-blur-sm pointer-events-none' />

        <div className='absolute top-6 left-1/2 -translate-x-1/2 px-8 py-3 rounded-full bg-white border-3 border-[#F2CC8F] text-advay-slate shadow-[0_4px_0_#E5B86E] text-base md:text-lg font-bold min-w-max'>
          {feedback}
        </div>

        {/* Timer display */}
        {isPlaying && (
          <div className={`absolute top-6 right-6 px-6 py-3 rounded-full border-3 font-black text-lg shadow-[0_4px_0_#E5B86E] transition-all ${
            timeLeft <= 10 ? 'bg-red-50 border-red-300 text-red-700 animate-pulse' : 
            timeLeft <= 20 ? 'bg-orange-50 border-orange-300 text-orange-700' :
            'bg-white border-[#F2CC8F] text-advay-slate'
          }`}>
            ⏱️ {timeLeft}s
          </div>
        )}
        
        {/* Streak heart HUD */}
        {isPlaying && (
          <div className='absolute top-20 right-6 flex items-center gap-2 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-2xl border-3 border-[#F2CC8F] shadow-[0_4px_0_#E5B86E]'>
            <span className='font-bold text-advay-slate mr-2'>Streak:</span>
            {[1, 2, 3, 4, 5].map((i) => (
              <img
                key={i}
                src={streak >= i ? HEART_FULL : HEART_EMPTY}
                alt={streak >= i ? 'Full heart' : 'Empty heart'}
                className='w-6 h-6'
              />
            ))}
          </div>
        )}

        {promptTarget && (
          <div className='absolute top-6 left-6 px-6 py-3 rounded-full bg-white border-3 border-[#F2CC8F] text-text-secondary text-lg shadow-[0_4px_0_#E5B86E]'>
            <span className='font-bold uppercase tracking-widest text-xs mr-2 opacity-60'>
              Find
            </span>
            <span className='font-black text-advay-slate tracking-tight text-xl'>
              {promptTarget.name}
            </span>
          </div>
        )}

        {targets.map((target) => (
          <div
            key={target.id}
            className='absolute w-28 h-28 -translate-x-1/2 -translate-y-1/2 pointer-events-none'
            style={{
              left: `${target.position.x * 100}%`,
              top: `${target.position.y * 100}%`,
            }}
            aria-hidden='true'
          >
            <div
              className='absolute inset-0 rounded-full border-3 shadow-[0_4px_0_#E5B86E] transition-transform hover:scale-105'
              style={{ borderColor: target.color, backgroundColor: 'white' }}
            />
            <div className='absolute inset-2 overflow-hidden rounded-full'>
              {assetLoader.getImage(target.assetId)?.src ? (
                <img
                  src={assetLoader.getImage(target.assetId)?.src || ''}
                  alt={target.name}
                  className='w-full h-full object-cover opacity-90'
                />
              ) : (
                <div
                  className='w-full h-full'
                  style={{
                    background: `radial-gradient(circle at 30% 30%, ${target.color}22, transparent)`,
                  }}
                />
              )}
            </div>
            <div className='absolute inset-0 flex items-center justify-center text-5xl drop-shadow-[0_4px_0_#E5B86E]'>
              {target.emoji}
            </div>
            <div className='absolute -bottom-8 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-white border-2 border-[#F2CC8F] shadow-[0_4px_0_#E5B86E] text-xs text-advay-slate font-bold uppercase tracking-wider whitespace-nowrap'>
              {target.name}
            </div>
          </div>
        ))}

        {cursor && (
          <GameCursor
            position={cursor}
            coordinateSpace='normalized'
            containerRef={gameAreaRef}
            isPinching={false}
            isHandDetected={isPlaying}
            size={84}
            color='#22d3ee'
          />
        )}

        {!isPlaying && (
          <div className='absolute inset-0 flex flex-col items-center justify-center gap-8 bg-white/60 backdrop-blur-sm z-20'>
            <div className='flex flex-col items-center justify-center bg-white border-3 border-[#F2CC8F] rounded-[2.5rem] p-8 md:p-12 shadow-[0_4px_0_#E5B86E] text-center max-w-2xl w-[90%]'>
              <div className='w-32 h-32 mb-6 bg-emerald-50 rounded-[2rem] p-6 border-3 border-[#F2CC8F] flex items-center justify-center drop-shadow-md hover:scale-110 transition-transform cursor-pointer text-emerald-500'>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  width='64'
                  height='64'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                >
                  <path d='M12 7.5a4.5 4.5 0 1 1 4.5 4.5M12 7.5A4.5 4.5 0 1 0 7.5 12M12 7.5V9m-4.5 3a4.5 4.5 0 1 0 4.5 4.5M7.5 12H9' />
                  <path d='M12 16.5a4.5 4.5 0 1 0 4.5-4.5M12 16.5V15m4.5-3a4.5 4.5 0 1 1-4.5-4.5M16.5 12H15' />
                  <path d='M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z' />
                </svg>
              </div>

              <h1 className='text-4xl md:text-5xl font-black text-advay-slate tracking-tight mb-4 drop-shadow-[0_4px_0_#E5B86E]'>
                Color Match Garden
              </h1>

              <p className='text-text-secondary font-bold mb-8 max-w-sm mx-auto text-lg md:text-xl leading-relaxed'>
                Find and pinch the flowers with the matching colors!
              </p>

              <button
                onClick={startGame}
                className='px-12 py-5 bg-[#10B981] hover:bg-emerald-600 border-3 border-emerald-200 hover:border-emerald-300 text-white rounded-[1.5rem] font-black text-2xl shadow-[0_4px_0_#E5B86E] transition-all hover:scale-105 active:scale-95'
              >
                Start Game!
              </button>

              {ttsEnabled && (
                <VoiceInstructions
                  instructions={[
                    'Find the flower with the matching color.',
                    'Pinch the flower to collect it!',
                    'Match as many as you can!',
                  ]}
                  autoSpeak={true}
                  showReplayButton={true}
                  replayButtonPosition='bottom-right'
                />
              )}
            </div>
          </div>
        )}

        <GameControls controls={controls} position='bottom-right' />
      </div>

      {showCelebration && (
        <CelebrationOverlay
          show={showCelebration}
          letter='✿'
          accuracy={100}
          message='Blooming brilliance!'
          onComplete={() => setShowCelebration(false)}
        />
      )}
    </GameContainer>
  );
});

export const ColorMatchGarden = memo(function ColorMatchGardenShell() {
  return (
    <GameShell
      gameId='color-match-garden'
      gameName='Color Match Garden'
      showWellnessTimer={true}
      enableErrorBoundary={true}
    >
      <ColorMatchGardenGame />
    </GameShell>
  );
});

export default ColorMatchGarden;
