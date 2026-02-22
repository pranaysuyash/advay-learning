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
import { pickTargetPoint, updateHoldProgress } from '../games/steadyHandLogic';
import type { Point } from '../types/tracking';
import type { TrackedHandFrame } from '../utils/handTrackingFrame';
import {
  assetLoader,
  SOUND_ASSETS,
  WEATHER_BACKGROUNDS,
} from '../utils/assets';

const TARGET_RADIUS = 0.18; // Increased from 0.12 for kids' easier targeting

// Touch-friendly sizing constants for kids
const CURSOR_SIZE = 64; // Increased from 40 for easier visibility
const TARGET_SIZE = 160; // Increased for kids' fingers

/**
 * Kid-friendly haptic feedback utility
 * Uses longer, softer vibrations appropriate for children
 */
function triggerHaptic(type: 'success' | 'error' | 'celebration'): void {
  if (typeof navigator === 'undefined' || !navigator.vibrate) return;

  const patterns = {
    success: [50, 30, 50], // Gentle double tap
    error: [100, 50, 100], // Softer error buzz
    celebration: [100, 50, 100, 50, 200], // Joyful burst
  };

  navigator.vibrate(patterns[type]);
}

function random01(): number {
  try {
    const arr = new Uint32Array(1);
    crypto.getRandomValues(arr);
    return arr[0] / 4294967295;
  } catch {
    return Math.random();
  }
}

export const SteadyHandLab = memo(function SteadyHandLabComponent() {
  const navigate = useNavigate();
  const webcamRef = useRef<Webcam>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [target, setTarget] = useState<Point>(pickTargetPoint(0.4, 0.4, 0.22));
  const [cursor, setCursor] = useState<Point | null>(null);
  const [holdProgress, setHoldProgress] = useState(0);
  const [feedback, setFeedback] = useState(
    'Hold your fingertip inside the target ring.',
  );
  const [showCelebration, setShowCelebration] = useState(false);

  const holdProgressRef = useRef(holdProgress);
  const celebrationTimeoutRef = useRef<number | undefined>(undefined);

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

  const { playSuccess, playError, playCelebration, playStart } =
    useSoundEffects();

  useEffect(() => {
    holdProgressRef.current = holdProgress;
  }, [holdProgress]);

  useEffect(() => {
    if (isPlaying && !isHandTrackingReady && !isModelLoading) {
      initializeHandTracking();
    }
  }, [initializeHandTracking, isHandTrackingReady, isModelLoading, isPlaying]);

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

  // Cleanup celebration timeout on unmount (lifecycle hardening)
  useEffect(() => {
    return () => {
      if (celebrationTimeoutRef.current !== undefined) {
        window.clearTimeout(celebrationTimeoutRef.current);
      }
    };
  }, []);

  const pickNextTarget = useCallback(() => {
    setTarget(pickTargetPoint(random01(), random01(), 0.22));
  }, []);

  const handleFrame = useCallback(
    (frame: TrackedHandFrame, meta: HandTrackingRuntimeMeta) => {
      const tip = frame.indexTip;
      const currentProgress = holdProgressRef.current;

      if (!tip) {
        if (cursor !== null) setCursor(null);
        const decayed = updateHoldProgress({
          current: currentProgress,
          isInside: false,
          deltaTimeMs: meta.deltaTimeMs,
        });

        if (decayed !== currentProgress) {
          holdProgressRef.current = decayed;
          setHoldProgress(decayed);
        }
        return;
      }

      if (!cursor || cursor.x !== tip.x || cursor.y !== tip.y) {
        setCursor(tip);
      }

      const dx = tip.x - target.x;
      const dy = tip.y - target.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const isInside = distance <= TARGET_RADIUS;

      const nextProgress = updateHoldProgress({
        current: currentProgress,
        isInside,
        deltaTimeMs: meta.deltaTimeMs,
      });

      if (nextProgress !== currentProgress) {
        holdProgressRef.current = nextProgress;
        setHoldProgress(nextProgress);
      }

      if (nextProgress >= 1 && currentProgress < 1) {
        setScore((prev) => prev + 20);
        setRound((prev) => prev + 1);
        holdProgressRef.current = 0;
        setHoldProgress(0);
        setFeedback('Excellent control! New target unlocked.');
        void playSuccess();
        triggerHaptic('success');

        if ((round + 1) % 5 === 0) {
          setShowCelebration(true);
          triggerHaptic('celebration');
          void playCelebration();
          celebrationTimeoutRef.current = window.setTimeout(
            () => setShowCelebration(false),
            3000,
          ); // Slower for kids
        }

        pickNextTarget();
      } else if (
        !isInside &&
        currentProgress > 0.05 &&
        nextProgress < currentProgress
      ) {
        setFeedback('Almost there. Move back into the ring and hold steady.');
        if (currentProgress > 0.6 && nextProgress < 0.35) {
          void playError();
          triggerHaptic('error');
        }
      }
    },
    [
      cursor,
      pickNextTarget,
      playCelebration,
      playError,
      playSuccess,
      round,
      target,
    ],
  );

  useHandTrackingRuntime({
    isRunning: isPlaying && isHandTrackingReady,
    handLandmarker: landmarker,
    webcamRef,
    targetFps: 30,
    onFrame: handleFrame,
    onNoVideoFrame: () => {
      if (cursor !== null) setCursor(null);
    },
  });

  const startGame = async () => {
    setIsPlaying(true);
    setScore(0);
    setRound(1);
    setFeedback('Hold your fingertip inside the target ring.');
    setCursor(null);
    holdProgressRef.current = 0;
    setHoldProgress(0);
    pickNextTarget();
    await playStart();

    if (!isHandTrackingReady && !isModelLoading) {
      void initializeHandTracking();
    }
  };

  const resetGame = () => {
    setIsPlaying(false);
    setCursor(null);
    holdProgressRef.current = 0;
    setHoldProgress(0);
    setFeedback('Hold your fingertip inside the target ring.');
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

  const ringScale = 1 + holdProgress * 0.15;

  return (
    <GameContainer
      title='Steady Hand Lab'
      score={score}
      level={round}
      onHome={goHome}
    >
      <div
        className='absolute inset-0 bg-[#FFF8F0]'
        role='main'
        aria-label='Steady Hand Lab game area with webcam-based hand tracking'
      >
        {/* Background layer for visual variety */}
        <div
          className='absolute inset-0 bg-cover bg-center opacity-30 mix-blend-multiply'
          style={{
            backgroundImage: `url(${WEATHER_BACKGROUNDS.sunny.url})`,
          }}
          aria-hidden='true'
        />

        <Webcam
          ref={webcamRef}
          audio={false}
          mirrored
          className='absolute inset-0 w-full h-full object-cover opacity-15 mix-blend-multiply'
          videoConstraints={{ facingMode: 'user' }}
        />

        <div className='absolute top-6 left-1/2 -translate-x-1/2 px-8 py-3 rounded-full bg-white/95 backdrop-blur-sm border-4 border-slate-200 shadow-sm text-slate-600 font-bold text-lg text-center min-w-[320px]'>
          {feedback}
        </div>

        <div
          className='absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none'
          style={{
            left: `${target.x * 100}%`,
            top: `${target.y * 100}%`,
            width: `${TARGET_SIZE}px`,
            height: `${TARGET_SIZE}px`,
          }}
          aria-hidden='true'
        >
          <div
            className='absolute inset-0 rounded-full border-[8px] border-[#10B981] shadow-sm'
            style={{
              transform: `scale(${ringScale})`,
              transition: 'transform 100ms linear',
            }}
          />
          <div className='absolute inset-4 rounded-full border-4 border-emerald-200/60' />
          <div className='absolute inset-x-6 bottom-4 h-3 rounded-full bg-white/50 overflow-hidden border-2 border-slate-200/50'>
            <div
              className='h-full bg-[#10B981] transition-[width] duration-100 rounded-full'
              style={{ width: `${holdProgress * 100}%` }}
            />
          </div>
        </div>

        {cursor && (
          <div
            className='absolute rounded-full border-4 border-[#3B82F6] bg-blue-100/60 -translate-x-1/2 -translate-y-1/2 shadow-[0_0_20px_rgba(59,130,246,0.5)] pointer-events-none z-20'
            style={{
              left: `${cursor.x * 100}%`,
              top: `${cursor.y * 100}%`,
              width: `${CURSOR_SIZE}px`,
              height: `${CURSOR_SIZE}px`,
            }}
            aria-hidden='true'
          />
        )}

        {!isPlaying && (
          <div className='absolute inset-0 bg-slate-900/40 backdrop-blur-sm z-30 flex items-center justify-center'>
            <div className='bg-white border-4 border-slate-100 rounded-[3rem] p-12 text-center max-w-md w-[90%] shadow-sm'>
              <div className='text-[5rem] mb-4 drop-shadow-sm hover:scale-110 transition-transform'>🖐️</div>
              <h2 className='text-3xl md:text-4xl font-black text-slate-800 tracking-tight mb-4'>Steady Hand</h2>
              <p className='text-slate-500 font-bold text-xl mb-10'>
                Hold your finger steady inside the rings!
              </p>
              <button
                type='button'
                onClick={startGame}
                className='w-full px-12 py-5 bg-[#3B82F6] hover:bg-blue-600 border-4 border-blue-200 hover:border-blue-300 text-white font-black rounded-full shadow-sm text-2xl transition-transform hover:scale-[1.02] active:scale-95'
              >
                Start Steady Hand
              </button>
            </div>
          </div>
        )}

        <GameControls controls={controls} position='bottom-right' />
      </div>

      {showCelebration && (
        <CelebrationOverlay
          show={showCelebration}
          letter='◎'
          accuracy={100}
          message='Steady Champion! You held the target perfectly.'
          onComplete={() => setShowCelebration(false)}
        />
      )}
    </GameContainer>
  );
});

export default SteadyHandLab;
