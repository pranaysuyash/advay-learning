import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Webcam from 'react-webcam';

import { CelebrationOverlay } from '../components/CelebrationOverlay';
import { GameCursor } from '../components/game/GameCursor';
import { GameContainer } from '../components/GameContainer';
import { GameControls } from '../components/GameControls';
import type { GameControl } from '../components/GameControls';
import { useGameHandTracking } from '../hooks/useGameHandTracking';
import type { HandTrackingRuntimeMeta } from '../hooks/useHandTrackingRuntime';
import { useSoundEffects } from '../hooks/useSoundEffects';
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

interface GardenTarget {
  id: number;
  name: string;
  color: string;
  emoji: string;
  assetId: string;
  position: Point;
}

const FLOWERS: Array<{ name: string; color: string; emoji: string; assetId: string }> = [
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

export const ColorMatchGarden = memo(function ColorMatchGardenComponent() {
  const navigate = useNavigate();
  const gameAreaRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(75);
  const [targets, setTargets] = useState<GardenTarget[]>([]);
  const [promptId, setPromptId] = useState<number>(0);
  const [cursor, setCursor] = useState<Point | null>(null);
  const [feedback, setFeedback] = useState('Pinch the flower with the asked color.');
  const [showCelebration, setShowCelebration] = useState(false);
  const [gardenBgSrc, setGardenBgSrc] = useState<string | null>(null);

  const scoreRef = useRef(score);
  const streakRef = useRef(streak);
  const targetsRef = useRef(targets);
  const promptRef = useRef(promptId);

  const { playPop, playError, playCelebration, playStart } = useSoundEffects();

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

  useEffect(() => {
    promptRef.current = promptId;
  }, [promptId]);

  useEffect(() => {
    if (!isPlaying) return;

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
        const nextStreak = streakRef.current + 1;
        const nextScore = scoreRef.current + 12 + Math.min(18, nextStreak * 2);
        setStreak(nextStreak);
        setScore(nextScore);
        setFeedback(`Yes! ${expected.name} flower collected.`);
        assetLoader.playSound('pop', 0.5);
        void playPop();

        if (nextStreak > 0 && nextStreak % 6 === 0) {
          setShowCelebration(true);
          assetLoader.playSound('success', 0.75);
          void playCelebration();
          setTimeout(() => setShowCelebration(false), 1800);
        }

        startRound();
      } else {
        setStreak(0);
        setFeedback(`That was ${hitTarget.name}. Find ${expected.name}.`);
        assetLoader.playSound('wrong', 0.65);
        void playError();
      }
    },
    [cursor, playCelebration, playError, playPop, startRound],
  );

  const { isLoading: isModelLoading, isReady: isHandTrackingReady, startTracking, webcamRef } =
    useGameHandTracking({
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
    setStreak(0);
    setTimeLeft(75);
    setFeedback('Pinch the flower with the asked color.');
    setCursor(null);
    startRound();
    setIsPlaying(true);
    assetLoader.playSound('pop', 0.5);
    await playStart();

    if (!isHandTrackingReady && !isModelLoading) {
      void startTracking();
    }
  };

  const resetGame = () => {
    setIsPlaying(false);
    setCursor(null);
    setTimeLeft(75);
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
      title='Color Match Garden'
      score={score}
      level={Math.max(1, Math.floor(score / 100) + 1)}
      onHome={goHome}
    >
      <div
        ref={gameAreaRef}
        className='absolute inset-0 bg-gradient-to-br from-blue-50 to-blue-100'
        style={{
          backgroundImage: gardenBgSrc
            ? `linear-gradient(rgba(248,250,252,0.8), rgba(226,232,240,0.9)), url(${gardenBgSrc})`
            : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <Webcam
          ref={webcamRef}
          audio={false}
          mirrored
          className='absolute inset-0 w-full h-full object-cover opacity-15 mix-blend-multiply'
          videoConstraints={{ facingMode: 'user' }}
        />

        <div className='absolute inset-0 bg-gradient-to-b from-white/30 via-transparent to-white/40 pointer-events-none' />

        <div className='absolute top-6 left-1/2 -translate-x-1/2 px-8 py-3 rounded-full bg-white border-4 border-slate-200 text-slate-700 shadow-sm text-base md:text-lg font-bold min-w-max'>
          {feedback}
        </div>

        <div className='absolute top-6 right-6 px-6 py-3 rounded-full bg-white border-4 border-slate-200 text-slate-500 font-bold text-lg shadow-sm'>
          Time: <span className='font-black text-[#F59E0B]'>{timeLeft}s</span>
        </div>

        {promptTarget && (
          <div className='absolute top-6 left-6 px-6 py-3 rounded-full bg-white border-4 border-slate-200 text-slate-500 text-lg shadow-sm'>
            <span className='font-bold uppercase tracking-widest text-xs mr-2 opacity-60'>Find</span>
            <span className='font-black text-slate-800 tracking-tight text-xl'>{promptTarget.name}</span>
          </div>
        )}

        {targets.map((target) => (
          <div
            key={target.id}
            className='absolute w-28 h-28 -translate-x-1/2 -translate-y-1/2 pointer-events-none'
            style={{ left: `${target.position.x * 100}%`, top: `${target.position.y * 100}%` }}
            aria-hidden='true'
          >
            <div
              className='absolute inset-0 rounded-full border-4 shadow-sm transition-transform hover:scale-105'
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
                    background:
                      `radial-gradient(circle at 30% 30%, ${target.color}22, transparent)`,
                  }}
                />
              )}
            </div>
            <div className='absolute inset-0 flex items-center justify-center text-5xl drop-shadow-sm'>
              {target.emoji}
            </div>
            <div className='absolute -bottom-8 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-white border-2 border-slate-200 shadow-sm text-xs text-slate-700 font-bold uppercase tracking-wider whitespace-nowrap'>
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
            size={60}
            color='#22d3ee'
          />
        )}

        {!isPlaying && (
          <div className='absolute inset-0 flex flex-col items-center justify-center gap-8 bg-white/60 backdrop-blur-sm z-20'>
            <div className='flex flex-col items-center justify-center bg-white border-4 border-slate-100 rounded-[2.5rem] p-8 md:p-12 shadow-sm text-center max-w-2xl w-[90%]'>
              <div className='w-32 h-32 mb-6 bg-emerald-50 rounded-[2rem] p-6 border-4 border-slate-100 flex items-center justify-center text-[5rem] drop-shadow-md hover:scale-110 transition-transform cursor-pointer'>
                🌻
              </div>

              <h1 className='text-4xl md:text-5xl font-black text-slate-800 tracking-tight mb-4 drop-shadow-sm'>
                Color Match Garden
              </h1>

              <p className='text-slate-500 font-bold mb-8 max-w-sm mx-auto text-lg md:text-xl leading-relaxed'>
                Find and pinch the flowers with the matching colors!
              </p>

              <button
                onClick={startGame}
                className='px-12 py-5 bg-[#10B981] hover:bg-emerald-600 border-4 border-emerald-200 hover:border-emerald-300 text-white rounded-[1.5rem] font-black text-2xl shadow-sm transition-all hover:scale-105 active:scale-95'
              >
                Start Game! 🚀
              </button>
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

export default ColorMatchGarden;
