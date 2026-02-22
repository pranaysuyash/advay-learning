import { useState, useEffect, useRef, useCallback, type ReactNode } from 'react';
import Webcam from 'react-webcam';
import { GameCursor } from '../components/game/GameCursor';
import { HandTrackingStatus } from '../components/game/HandTrackingStatus';
import { SuccessAnimation } from '../components/game/SuccessAnimation';
import {
  VoiceInstructions,
  GAME_INSTRUCTIONS,
  useVoiceInstructions,
} from '../components/game/VoiceInstructions';
import {
  TargetSystem,
  generateTargets,
  getRecommendedTargetSize,
} from '../components/game/TargetSystem';
import { type ScreenCoordinate } from '../utils/coordinateTransform';
import {
  assetLoader,
  BUBBLE_ASSETS,
  SOUND_ASSETS,
  WEATHER_BACKGROUNDS,
} from '../utils/assets';
import { useGameHandTracking } from '../hooks/useGameHandTracking';
import type { TrackedHandFrame } from '../types/tracking';

interface Bubble {
  id: string;
  x: number;
  y: number;
  size: number;
  content: string | ReactNode;
  color?: string;
  note: string;
  pitch: number;
  velocity: { x: number; y: number };
  bubbleAssetId: string;
  isActive?: boolean;
}

const MUSICAL_NOTES = [
  { note: 'C4', pitch: 261.63, color: '#FF6B6B', emoji: '🎈' },
  { note: 'D4', pitch: 293.66, color: '#4ECDC4', emoji: '🫧' },
  { note: 'E4', pitch: 329.63, color: '#45B7D1', emoji: '⚽' },
  { note: 'F4', pitch: 349.23, color: '#FFA500', emoji: '🏀' },
  { note: 'G4', pitch: 392.0, color: '#FFD700', emoji: '🎾' },
  { note: 'A4', pitch: 440.0, color: '#95E1D3', emoji: '🎯' },
] as const;

export default function BubblePopSymphony() {
  // Hand tracking with modern hooks
  const webcamRef = useRef<Webcam>(null);
  const [cursorPosition, setCursorPosition] = useState<ScreenCoordinate>({
    x: 0,
    y: 0,
  });
  const [isPinching, setIsPinching] = useState(false);
  const [isHandDetected, setIsHandDetected] = useState(false);
  const lastHandStateRef = useRef(false);

  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [score, setScore] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);

  const { speak } = useVoiceInstructions();

  const [screenDims, setScreenDims] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  const getAudioContext = useCallback(() => {
    if (typeof window === 'undefined') return null;

    const AudioContextImpl =
      window.AudioContext ||
      ((window as Window & { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext as typeof AudioContext | undefined);

    if (!AudioContextImpl) return null;

    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContextImpl();
    }

    if (audioContextRef.current.state === 'suspended') {
      void audioContextRef.current.resume();
    }

    return audioContextRef.current;
  }, []);

  const playNote = useCallback(
    (frequency: number) => {
      const ctx = getAudioContext();
      if (!ctx) return;

      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();

      oscillator.type = 'sine';
      oscillator.frequency.value = frequency;
      gain.gain.value = 0.0001;

      oscillator.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;
      gain.gain.exponentialRampToValueAtTime(0.25, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      oscillator.start(now);
      oscillator.stop(now + 0.36);
    },
    [getAudioContext],
  );

  useEffect(() => {
    function handleResize() {
      setScreenDims({ width: window.innerWidth, height: window.innerHeight });
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    async function preloadAssets() {
      try {
        await assetLoader.loadImages([
          ...BUBBLE_ASSETS,
          WEATHER_BACKGROUNDS.sunny,
        ]);
        await assetLoader.loadSounds(Object.values(SOUND_ASSETS));
      } catch (error) {
        console.error('Failed to preload bubble assets', error);
      }
    }

    void preloadAssets();
  }, []);

  const buildBubbleVisual = useCallback(
    (assetId: string, fallbackEmoji: string, size: number) => {
      const loaded = assetLoader.getImage(assetId);

      if (loaded?.src) {
        return (
          <div style={{ position: 'relative', width: size, height: size }}>
            <img
              src={loaded.src}
              alt='Bubble'
              style={{
                width: size,
                height: size,
                objectFit: 'contain',
                opacity: 0.92,
              }}
            />
            <span
              style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
                fontSize: size * 0.38,
                filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.25))',
              }}
            >
              {fallbackEmoji}
            </span>
          </div>
        );
      }

      return <span style={{ fontSize: size * 0.7 }}>{fallbackEmoji}</span>;
    },
    [],
  );

  // Hand tracking runtime - replaces manual detection loop
  const handleHandFrame = useCallback(
    (frame: TrackedHandFrame) => {
      if (frame.hands.length > 0) {
        if (frame.indexTip) {
          setCursorPosition({ x: frame.indexTip.x * screenDims.width, y: frame.indexTip.y * screenDims.height });
          setIsPinching(frame.pinch.state.isPinching);

          if (!lastHandStateRef.current) {
            setIsHandDetected(true);
            lastHandStateRef.current = true;
            speak(GAME_INSTRUCTIONS.HAND_DETECTED);
          }
        } else {
          if (lastHandStateRef.current) {
            speak(GAME_INSTRUCTIONS.HAND_LOST);
          }
        }
      }
    },
    [speak],
  );

  const { isReady: isHandTrackingReady, isLoading: isModelLoading, startTracking } =
    useGameHandTracking({
      gameName: 'BubblePopSymphony',
      isRunning: gameStarted,
      webcamRef,
      onFrame: handleHandFrame,
    });

  useEffect(() => {
    if (gameStarted && !isHandTrackingReady && !isModelLoading) {
      void startTracking();
    }
  }, [gameStarted, isHandTrackingReady, isModelLoading, startTracking]);

  const createBubbleSet = useCallback((): Bubble[] => {
    const targetSize = getRecommendedTargetSize(screenDims.width);
    const positions = generateTargets(
      6,
      screenDims.width,
      screenDims.height,
      targetSize,
      40,
      { pattern: 'random', margin: 100 },
    );

    return positions.map((pos, index) => {
      const noteData = MUSICAL_NOTES[index % MUSICAL_NOTES.length];
      const bubbleAssetId =
        BUBBLE_ASSETS[index % BUBBLE_ASSETS.length]?.id ?? 'bubble-pink';
      const bubbleSize = Math.max(56, Math.round(targetSize * 0.9));

      return {
        id: `bubble-${Date.now()}-${index}`,
        ...pos,
        content: buildBubbleVisual(bubbleAssetId, noteData.emoji, bubbleSize),
        color: noteData.color,
        note: noteData.note,
        pitch: noteData.pitch,
        bubbleAssetId,
        velocity: {
          x: (Math.random() - 0.5) * 0.55,
          y: (Math.random() - 0.5) * 0.55,
        },
        isActive: true,
      };
    });
  }, [screenDims, buildBubbleVisual]);

  useEffect(() => {
    if (!gameStarted) return;
    setBubbles(createBubbleSet());
  }, [gameStarted, createBubbleSet]);

  useEffect(() => {
    if (!gameStarted) return;

    const interval = window.setInterval(() => {
      setBubbles((prev) =>
        prev.map((bubble) => {
          let x = bubble.x + bubble.velocity.x;
          let y = bubble.y + bubble.velocity.y;
          let velocityX = bubble.velocity.x;
          let velocityY = bubble.velocity.y;

          if (x < 100 || x > screenDims.width - 100) {
            velocityX *= -1;
            x = Math.max(100, Math.min(x, screenDims.width - 100));
          }

          if (y < 100 || y > screenDims.height - 100) {
            velocityY *= -1;
            y = Math.max(100, Math.min(y, screenDims.height - 100));
          }

          return {
            ...bubble,
            x,
            y,
            velocity: { x: velocityX, y: velocityY },
          };
        }),
      );
    }, 50);

    return () => window.clearInterval(interval);
  }, [gameStarted, screenDims]);

  const handleBubblePop = useCallback(
    (target: { id: string }) => {
      setBubbles((prev) => {
        const hitBubble = prev.find((bubble) => bubble.id === target.id);
        if (!hitBubble) return prev;

        playNote(hitBubble.pitch);
        assetLoader.playSound('pop', 0.45);
        setShowSuccess(true);
        setScore((current) => current + 1);

        const remaining = prev.filter((bubble) => bubble.id !== target.id);

        if (remaining.length === 0) {
          window.setTimeout(() => {
            setBubbles(createBubbleSet());
            assetLoader.playSound('success', 0.55);
            speak('Amazing! New bubbles are ready!');
          }, 700);
        }

        return remaining;
      });
    },
    [playNote, createBubbleSet, speak],
  );

  const startGame = useCallback(() => {
    setGameStarted(true);
    setScore(0);
    assetLoader.playSound('pop', 0.35);
    assetLoader.playSound('correct', 0.25);
    speak('Pop the bubbles by pinching them! Each one makes a musical note!');
  }, [speak]);

  return (
    <div className='w-screen h-screen overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100 relative'>
      <Webcam
        ref={webcamRef}
        audio={false}
        mirrored={true}
        videoConstraints={{ width: 1280, height: 720, facingMode: 'user' }}
        style={{ display: 'none' }}
      />

      <HandTrackingStatus
        isHandDetected={isHandDetected}
        pauseOnHandLost={true}
        voicePrompt={true}
        showMascot={true}
      />

      {gameStarted && (
        <div className='absolute top-6 left-1/2 -translate-x-1/2 z-10 bg-white rounded-[1.5rem] px-8 py-4 border-4 border-slate-200 shadow-sm'>
          <h2 className='text-3xl md:text-4xl font-black text-slate-800 tracking-tight m-0 drop-shadow-sm'>
            🎵 Score: <span className="text-[#10B981]">{score}</span>
          </h2>
        </div>
      )}

      {!gameStarted && (
        <div className='absolute inset-0 flex flex-col items-center justify-center gap-8 bg-white/40 backdrop-blur-sm z-20'>
          <div className='flex flex-col items-center justify-center bg-white border-4 border-slate-100 rounded-[2.5rem] p-8 md:p-12 shadow-sm text-center max-w-2xl w-[90%]'>
            <div className='w-32 h-32 mb-6 bg-blue-50 rounded-[2rem] p-6 border-4 border-slate-100'>
              <div className='text-[5rem] leading-none drop-shadow-md hover:scale-110 transition-transform cursor-pointer'>
                🎈
              </div>
            </div>

            <h1 className='text-4xl md:text-5xl font-black text-slate-800 tracking-tight mb-4 drop-shadow-sm'>
              Bubble Pop Symphony 🎵
            </h1>

            <p className='text-slate-500 font-bold mb-8 max-w-sm mx-auto text-lg md:text-xl leading-relaxed'>
              Pop the bubbles by pinching them! Each one makes a musical note!
            </p>

            <button
              onClick={startGame}
              className='px-12 py-5 bg-[#3B82F6] hover:bg-blue-600 border-4 border-blue-200 hover:border-blue-300 text-white rounded-[1.5rem] font-black text-2xl shadow-sm transition-all hover:scale-105 active:scale-95'
            >
              Start Game! 🚀
            </button>
          </div>

          <VoiceInstructions
            instructions={GAME_INSTRUCTIONS.GAME_START}
            autoSpeak={true}
            showReplayButton={true}
            replayButtonPosition='bottom-right'
          />
        </div>
      )}

      {gameStarted && (
        <TargetSystem
          targets={bubbles}
          cursorPosition={cursorPosition}
          isPinching={isPinching}
          onTargetHit={handleBubblePop}
          enableMagneticSnap={true}
          magneticThreshold={100}
          hitboxMultiplier={2.0}
          minSpacing={40}
        />
      )}

      {gameStarted && isHandDetected && (
        <GameCursor
          position={cursorPosition}
          size={70}
          isPinching={isPinching}
          isHandDetected={isHandDetected}
          showTrail={true}
          pulseAnimation={true}
        />
      )}

      <SuccessAnimation
        show={showSuccess}
        type='confetti'
        message='Pop! 🎵'
        duration={1500}
        onComplete={() => setShowSuccess(false)}
      />
    </div>
  );
}
