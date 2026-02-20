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
          setTimeout(() => setShowCelebration(false), 3000); // Slower for kids
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
      <div className='absolute inset-0 bg-black'>
        <Webcam
          ref={webcamRef}
          audio={false}
          mirrored
          className='absolute inset-0 w-full h-full object-cover opacity-45'
          videoConstraints={{ facingMode: 'user' }}
        />

        <div className='absolute inset-0 bg-gradient-to-b from-black/55 via-black/15 to-black/65' />

        <div className='absolute top-16 left-1/2 -translate-x-1/2 px-4 py-2 rounded-xl bg-black/50 text-white text-sm text-center max-w-[90%]'>
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
            className='absolute inset-0 rounded-full border-4 border-emerald-300/90 shadow-[0_0_30px_rgba(52,211,153,0.5)]'
            style={{
              transform: `scale(${ringScale})`,
              transition: 'transform 100ms linear',
            }}
          />
          <div className='absolute inset-3 rounded-full border-2 border-emerald-200/50' />
          <div className='absolute inset-x-5 bottom-3 h-2 rounded-full bg-white/20 overflow-hidden'>
            <div
              className='h-full bg-emerald-300 transition-[width] duration-100'
              style={{ width: `${holdProgress * 100}%` }}
            />
          </div>
        </div>

        {cursor && (
          <div
            className='absolute rounded-full border-4 border-cyan-300 bg-cyan-300/20 -translate-x-1/2 -translate-y-1/2 shadow-[0_0_26px_rgba(34,211,238,0.7)] pointer-events-none'
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
          <div className='absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-center'>
            <button
              type='button'
              onClick={startGame}
              className='px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-2xl shadow-2xl text-lg'
            >
              Start Steady Hand
            </button>
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
