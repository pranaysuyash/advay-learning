import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GameContainer } from '../components/GameContainer';
import { useAudio } from '../utils/hooks/useAudio';
import { useGameDrops } from '../hooks/useGameDrops';
import { useGameSessionProgress } from '../hooks/useGameSessionProgress';
import {
  LEVELS,
  createBubble,
  updateBubbles,
  checkBubblePop,
  type Bubble,
} from '../games/virtualBubblesLogic';

const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 400;

export function VirtualBubbles() {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [poppedCount, setPoppedCount] = useState(0);
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState<'start' | 'playing' | 'complete'>('start');
  const [handPosition, setHandPosition] = useState({ x: 0.5, y: 0.5 });
  const [blowDetected, setBlowDetected] = useState(false);
  const bubbleIdRef = useRef(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  const { playClick, playPop, playCelebration } = useAudio();
  const { onGameComplete } = useGameDrops('virtual-bubbles');
  const levelConfig = LEVELS[currentLevel - 1];

  useGameSessionProgress({
    gameName: 'Virtual Bubbles',
    score,
    level: currentLevel,
    isPlaying: gameState === 'playing',
    metaData: {
      popped: poppedCount,
      target: levelConfig.bubblesToPop,
    },
  });

  // Initialize audio for blow detection
  useEffect(() => {
    if (gameState === 'playing') {
      const initAudio = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          audioContextRef.current = new AudioContext();
          analyserRef.current = audioContextRef.current.createAnalyser();
          const source = audioContextRef.current.createMediaStreamSource(stream);
          source.connect(analyserRef.current);
          analyserRef.current.fftSize = 256;
        } catch (e) {
          console.log('Mic not available for blow detection');
        }
      };
      initAudio();
    }
    return () => {
      audioContextRef.current?.close();
    };
  }, [gameState]);

  // Check for blow detection
  useEffect(() => {
    if (gameState !== 'playing' || !analyserRef.current) return;

    const checkBlow = () => {
      if (!analyserRef.current) return;
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      analyserRef.current.getByteFrequencyData(dataArray);

      const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
      if (average > 50) {
        setBlowDetected(true);
        // Create new bubble
        if (bubbles.length < levelConfig.maxBubbles) {
          const newBubble = createBubble(bubbleIdRef.current++, CANVAS_WIDTH);
          setBubbles((prev) => [...prev, newBubble]);
        }
      } else {
        setBlowDetected(false);
      }
    };

    const interval = setInterval(checkBlow, 100);
    return () => clearInterval(interval);
  }, [gameState, bubbles.length, levelConfig.maxBubbles]);

  // Game loop
  useEffect(() => {
    if (gameState !== 'playing') return;

    const gameLoop = setInterval(() => {
      setBubbles((prev) => updateBubbles(prev, CANVAS_WIDTH, CANVAS_HEIGHT));
    }, 16);

    return () => clearInterval(gameLoop);
  }, [gameState]);

  // Render bubbles
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(1, '#E0F7FA');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw bubbles
    bubbles.forEach((bubble) => {
      ctx.beginPath();
      ctx.arc(bubble.x, bubble.y, bubble.size, 0, Math.PI * 2);
      ctx.fillStyle = bubble.color + '60';
      ctx.fill();
      ctx.strokeStyle = bubble.color;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Shine effect
      ctx.beginPath();
      ctx.arc(bubble.x - bubble.size * 0.3, bubble.y - bubble.size * 0.3, bubble.size * 0.2, 0, Math.PI * 2);
      ctx.fillStyle = 'white';
      ctx.fill();
    });

    // Draw hand cursor
    ctx.beginPath();
    ctx.arc(handPosition.x * CANVAS_WIDTH, handPosition.y * CANVAS_HEIGHT, 15, 0, Math.PI * 2);
    ctx.fillStyle = '#FF6B6B';
    ctx.fill();
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 3;
    ctx.stroke();

  }, [bubbles, handPosition]);

  const handlePointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setHandPosition({
      x: (event.clientX - rect.left) / rect.width,
      y: (event.clientY - rect.top) / rect.height,
    });
  };

  const handlePointerDown = () => {
    if (gameState !== 'playing') return;

    const { popped, remaining } = checkBubblePop(bubbles, handPosition.x, handPosition.y, CANVAS_WIDTH, CANVAS_HEIGHT);

    if (popped) {
      playPop();
      setBubbles(remaining);
      setPoppedCount((prev) => prev + 1);
      setScore((prev) => prev + 10);

      if (poppedCount + 1 >= levelConfig.bubblesToPop) {
        setGameState('complete');
        playCelebration();
      }
    }
  };

  const handleStart = () => {
    playClick();
    setGameState('playing');
    setBubbles([]);
    setPoppedCount(0);
    setScore(0);
    bubbleIdRef.current = 0;
  };

  const handleLevelChange = (level: number) => {
    playClick();
    setCurrentLevel(level);
  };

  const handleFinish = useCallback(async () => {
    playClick();
    const finalScore = Math.round(score / 10);
    await onGameComplete(finalScore);
    navigate('/games');
  }, [score, onGameComplete, navigate, playClick]);

  return (
    <GameContainer
      title="Virtual Bubbles"
      onHome={() => navigate('/games')}
      reportSession={false}
    >
      <div className="flex flex-col items-center gap-4 p-4 max-w-2xl mx-auto">
        <div className="flex gap-2">
          {LEVELS.map((level) => (
            <button
              type="button"
              key={level.level}
              onClick={() => handleLevelChange(level.level)}
              className={`px-4 py-2 rounded-full font-bold transition-all ${currentLevel === level.level
                  ? 'bg-cyan-500 text-white shadow-lg'
                  : 'bg-slate-50 border-2 border-slate-200 text-slate-700 hover:border-slate-400'
                }`}
            >
              Level {level.level}
            </button>
          ))}
        </div>

        {gameState === 'start' && (
          <div className="text-center">
            <p className="text-6xl mb-4">🫧</p>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Virtual Bubbles!</h2>
            <p className="text-gray-600 mb-4">
              Blow into the mic to make bubbles, then pop them with your finger!
            </p>
            <button
              type="button"
              onClick={handleStart}
              className="px-8 py-4 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-white rounded-2xl font-bold text-xl shadow-lg transition-all"
            >
              Start Blowing! 🎈
            </button>
          </div>
        )}

        {gameState === 'playing' && (
          <>
            <div className="relative">
              <canvas
                ref={canvasRef}
                width={CANVAS_WIDTH}
                height={CANVAS_HEIGHT}
                onPointerMove={handlePointerMove}
                onPointerDown={handlePointerDown}
                className="touch-none cursor-crosshair rounded-2xl shadow-xl border-4 border-cyan-200"
                style={{ maxWidth: '100%', height: 'auto' }}
              />
              {blowDetected && (
                <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-green-100 px-4 py-2 rounded-full text-green-700 font-bold animate-pulse">
                  💨 Blowing...
                </div>
              )}
            </div>

            <div className="flex gap-4 text-center">
              <div className="bg-green-100 px-4 py-2 rounded-xl">
                <p className="text-sm text-green-600 font-medium">Popped</p>
                <p className="text-2xl font-bold text-green-700">{poppedCount}/{levelConfig.bubblesToPop}</p>
              </div>
              <div className="bg-blue-100 px-4 py-2 rounded-xl">
                <p className="text-sm text-blue-600 font-medium">Score</p>
                <p className="text-2xl font-bold text-blue-700">{score}</p>
              </div>
            </div>

            <p className="text-sm text-gray-500">
              Tip: Blow into your microphone to create bubbles! 🎤
            </p>
          </>
        )}

        {gameState === 'complete' && (
          <div className="text-center">
            <p className="text-4xl mb-4">🎉</p>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Bubble Master!</h2>
            <p className="text-xl text-gray-600 mb-4">
              You popped {poppedCount} bubbles!
            </p>
            <p className="text-2xl font-bold text-cyan-600 mb-6">Score: {score}</p>
          </div>
        )}

        <div className="flex gap-3">
          {gameState !== 'start' && (
            <>
              <button
                type="button"
                onClick={handleStart}
                className="px-6 py-3 bg-slate-100 border-2 border-slate-200 hover:bg-slate-200 text-slate-700 rounded-xl font-black transition-all"
              >
                Play Again
              </button>
              <button
                type="button"
                onClick={handleFinish}
                className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-xl font-bold shadow-lg transition-all"
              >
                Finish
              </button>
            </>
          )}
        </div>
      </div>
    </GameContainer>
  );
}
