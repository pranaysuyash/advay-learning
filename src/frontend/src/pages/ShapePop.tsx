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
import { useGameDrops } from '../hooks/useGameDrops';
import { useSoundEffects } from '../hooks/useSoundEffects';
import { useTTS } from '../hooks/useTTS';
import { VoiceInstructions } from '../components/game/VoiceInstructions';
import { triggerHaptic } from '../utils/haptics';
import { isPointInCircle, pickRandomPoint } from '../games/targetPracticeLogic';
import type { Point } from '../types/tracking';
import { randomFloat01 } from '../utils/random';
import type { TrackedHandFrame } from '../utils/handTrackingFrame';

const SHAPES = ['◯', '△', '□', '◇', '☆'] as const;
const POP_RADIUS = 0.16; // Increased from 0.11 for kids' easier targeting

// Touch-friendly sizing constants for kids
const CURSOR_SIZE = 84; // Increased for easier visibility
const TARGET_SIZE = 144; // Increased from 144 (w-36 = 9rem = 144px) for kids' fingers

export const ShapePop = memo(function ShapePopComponent() {
  const navigate = useNavigate();
  const gameAreaRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [targetCenter, setTargetCenter] = useState<Point>(
    pickRandomPoint(0.4, 0.55, 0.18),
  );
  const [targetShape, setTargetShape] = useState<(typeof SHAPES)[number]>('◯');
  const [cursor, setCursor] = useState<Point | null>(null);
  const [feedback, setFeedback] = useState(
    'Pinch when your finger is inside the shape ring.',
  );
  const [showCelebration, setShowCelebration] = useState(false);

  const scoreRef = useRef(score);

  const { playPop, playError, playCelebration, playStart } = useSoundEffects();
  const { speak, isEnabled: ttsEnabled } = useTTS();
  const { onGameComplete } = useGameDrops('shape-pop');

  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  const spawnTarget = useCallback(() => {
    setTargetCenter(pickRandomPoint(randomFloat01(), randomFloat01(), 0.18));
    setTargetShape(SHAPES[Math.floor(randomFloat01() * SHAPES.length)] ?? '◯');
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

      const inside = isPointInCircle(tip, targetCenter, POP_RADIUS);
      if (inside) {
        const nextScore = scoreRef.current + 15;
        setScore(nextScore);
        setFeedback('Pop! Great hit.');
        if (ttsEnabled) {
          const praises = ['Great hit!', 'Awesome!', 'Nice one!', 'Keep going!'];
          void speak(praises[Math.floor(Math.random() * praises.length)]!);
        }
        void playPop();
        triggerHaptic('success');

        if (nextScore > 0 && nextScore % 120 === 0) {
          setShowCelebration(true);
          triggerHaptic('celebration');
          void playCelebration();
          if (ttsEnabled) {
            void speak('Amazing! You are doing great!');
          }
          setTimeout(() => setShowCelebration(false), 3000); // Slower pacing for kids
        }

        spawnTarget();
      } else {
        setFeedback('Close! Move into the ring, then pinch.');
        if (ttsEnabled) {
          void speak('Pinch when you are inside the shape!');
        }
        void playError();
        triggerHaptic('error');
      }
    },
    [cursor, playCelebration, playError, playPop, spawnTarget, targetCenter, speak, ttsEnabled],
  );

  const { isLoading: isModelLoading, isReady: isHandTrackingReady, startTracking, webcamRef } =
    useGameHandTracking({
      gameName: 'ShapePop',
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
    setFeedback('Pinch when your finger is inside the shape ring.');
    setCursor(null);
    spawnTarget();
    setIsPlaying(true);
    if (ttsEnabled) {
      void speak('Pop the shape by pinching it!');
    }
    await playStart();

    if (!isHandTrackingReady && !isModelLoading) {
      void startTracking();
    }
  };

  const resetGame = () => {
    onGameComplete();
    setIsPlaying(false);
    setCursor(null);
    setFeedback('Pinch when your finger is inside the shape ring.');
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

  return (
    <GameContainer
      title='Shape Pop'
      score={score}
      level={Math.max(1, Math.floor(score / 120) + 1)}
      onHome={goHome}
      isHandDetected={isHandTrackingReady}
      isPlaying={isPlaying}
    >
      <div ref={gameAreaRef} className='absolute inset-0 bg-blue-50 overflow-hidden'>
        <Webcam
          ref={webcamRef}
          audio={false}
          mirrored
          className='absolute inset-0 w-full h-full object-cover opacity-15 mix-blend-multiply'
          videoConstraints={{ facingMode: 'user' }}
        />

        <div className='absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-fuchsia-100/40 pointer-events-none' />

        <div className='absolute top-6 left-1/2 -translate-x-1/2 px-8 py-3 rounded-full bg-white/95 backdrop-blur-sm border-3 border-[#F2CC8F] shadow-[0_4px_0_#E5B86E] text-advay-slate font-bold text-lg text-center min-w-[320px]'>
          {feedback}
        </div>

        <div className='absolute top-6 right-6 px-6 py-3 rounded-full bg-white/95 backdrop-blur-sm border-3 border-[#F2CC8F] shadow-[0_4px_0_#E5B86E] text-slate-400 font-bold text-lg'>
          Take your time! <span className="inline-block animate-pulse">✨</span>
        </div>

        <div
          className='absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-transform hover:scale-105'
          style={{
            left: `${targetCenter.x * 100}%`,
            top: `${targetCenter.y * 100}%`,
            width: `${TARGET_SIZE}px`,
            height: `${TARGET_SIZE}px`,
          }}
          aria-hidden='true'
        >
          <div className='absolute inset-0 rounded-full border-[6px] border-[#D946EF] bg-fuchsia-100/30 shadow-[0_0_30px_rgba(217,70,239,0.3)] backdrop-blur-sm' />
          <div className='absolute inset-0 flex items-center justify-center text-7xl font-black text-[#D946EF] drop-shadow-[0_4px_0_#E5B86E]'>
            {targetShape}
          </div>
        </div>

        {cursor && (
          <GameCursor
            position={cursor}
            coordinateSpace='normalized'
            containerRef={gameAreaRef}
            isPinching={false}
            isHandDetected={isPlaying}
            size={CURSOR_SIZE}
            color='#3B82F6'
          />
        )}

        {!isPlaying && (
          <div className='absolute inset-0 bg-slate-900/40 backdrop-blur-sm z-30 flex items-center justify-center'>
            <div className='bg-white border-3 border-[#F2CC8F] rounded-[3rem] p-12 text-center max-w-md w-[90%] shadow-[0_4px_0_#E5B86E] relative'>
              <div className='mb-4 drop-shadow-[0_4px_0_#E5B86E] hover:scale-110 transition-transform text-[#3B82F6]'>
                <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>
              </div>
              <h2 className='text-3xl md:text-4xl font-black text-advay-slate tracking-tight mb-4'>Shape Pop</h2>
              <p className='text-text-secondary font-bold text-xl mb-10'>
                Pinch inside the shapes to pop them!
              </p>
              {ttsEnabled && (
                <VoiceInstructions
                  instructions={[
                    'Pop the shapes!',
                    'Point with your finger.',
                    'Pinch inside the shape!',
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
                Start Popping!
              </button>
            </div>
          </div>
        )}

        <GameControls controls={controls} position='bottom-right' />
      </div>

      {showCelebration && (
        <CelebrationOverlay
          show={showCelebration}
          letter='★'
          accuracy={100}
          message='Awesome popping!'
          onComplete={() => setShowCelebration(false)}
        />
      )}
    </GameContainer>
  );
});

export default ShapePop;
