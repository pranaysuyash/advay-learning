import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GameContainer } from '../components/GameContainer';
import { useAudio } from '../utils/hooks/useAudio';
import { useGameDrops } from '../hooks/useGameDrops';
import { useGameSessionProgress } from '../hooks/useGameSessionProgress';
import {
  LEVELS,
  getLevelConfig,
  getColorForPoint,
} from '../games/kaleidoscopeHandsLogic';

const CANVAS_SIZE = 400;

interface Point {
  x: number;
  y: number;
}

// Inner game component
interface KaleidoscopeHandsGameProps {
  saveProgress: (data: { score: number; completed: boolean; level?: number; metadata?: Record<string, unknown> }) => Promise<void>;
}

const KaleidoscopeHandsGame = memo(function KaleidoscopeHandsGameComponent({ saveProgress: _saveProgress }: KaleidoscopeHandsGameProps) {
  const navigate = useNavigate();
  const _reducedMotion = useReducedMotion();
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [points, setPoints] = useState<Point[]>([]);
  const [handPosition, setHandPosition] = useState<Point>({ x: 0.5, y: 0.5 });
  const [score, setScore] = useState(0);
  const colorProgressRef = useRef(0);

  const { playClick, playPop } = useAudio();
  const { onGameComplete } = useGameDrops('kaleidoscope-hands');
  const levelConfig = getLevelConfig(currentLevel);

  useGameSessionProgress({
    gameName: 'Kaleidoscope Hands',
    score,
    level: currentLevel,
    isPlaying: true,
    metaData: { pointsDrawn: points.length },
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx || typeof ctx.translate !== 'function') return; // guard for jsdom stub

    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    const centerX = CANVAS_SIZE / 2;
    const centerY = CANVAS_SIZE / 2;
    const segmentAngle = (Math.PI * 2) / levelConfig.segmentCount;

    // Draw kaleidoscope pattern
    for (let i = 0; i < levelConfig.segmentCount; i++) {
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(i * segmentAngle);
      ctx.scale(1, 1); // Mirror effect

      if (points.length > 1) {
        ctx.beginPath();
        ctx.lineWidth = 8;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        for (let j = 0; j < points.length - 1; j++) {
          const p1 = points[j];
          const p2 = points[j + 1];

          ctx.strokeStyle = getColorForPoint(
            levelConfig.colorMode,
            (j / points.length + colorProgressRef.current) % 1,
          );
          ctx.beginPath();
          ctx.moveTo(
            p1.x * CANVAS_SIZE - centerX,
            p1.y * CANVAS_SIZE - centerY,
          );
          ctx.lineTo(
            p2.x * CANVAS_SIZE - centerX,
            p2.y * CANVAS_SIZE - centerY,
          );
          ctx.stroke();
        }

        // Mirror
        ctx.scale(-1, 1);
        for (let j = 0; j < points.length - 1; j++) {
          const p1 = points[j];
          const p2 = points[j + 1];

          ctx.strokeStyle = getColorForPoint(
            levelConfig.colorMode,
            (j / points.length + colorProgressRef.current) % 1,
          );
          ctx.beginPath();
          ctx.moveTo(
            p1.x * CANVAS_SIZE - centerX,
            p1.y * CANVAS_SIZE - centerY,
          );
          ctx.lineTo(
            p2.x * CANVAS_SIZE - centerX,
            p2.y * CANVAS_SIZE - centerY,
          );
          ctx.stroke();
        }
      }

      ctx.restore();
    }

    // Draw hand cursor
    ctx.beginPath();
    ctx.arc(
      handPosition.x * CANVAS_SIZE,
      handPosition.y * CANVAS_SIZE,
      12,
      0,
      Math.PI * 2,
    );
    ctx.fillStyle = 'white';
    ctx.fill();
    ctx.strokeStyle = '#FF6B6B';
    ctx.lineWidth = 3;
    ctx.stroke();
  }, [points, handPosition, levelConfig]);

  // Animate colors
  useEffect(() => {
    const interval = setInterval(() => {
      colorProgressRef.current = (colorProgressRef.current + 0.01) % 1;
      setScore(points.length * 10);
    }, 50);
    return () => clearInterval(interval);
  }, [points.length]);

  const handlePointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    setHandPosition({ x, y });

    setPoints((prev) => [...prev, { x, y }]);
    playPop();
  };

  const handleLevelChange = (level: number) => {
    playClick();
    setCurrentLevel(level);
    setPoints([]);
    setScore(0);
    colorProgressRef.current = 0;
  };

  const handleClear = () => {
    playClick();
    setPoints([]);
    setScore(0);
  };

  const handleFinish = useCallback(async () => {
    playClick();
    const finalScore = Math.round(score / 10);
    await onGameComplete(finalScore);
    navigate('/games');
  }, [score, onGameComplete, navigate, playClick]);

  return (
    <GameContainer
      title='Kaleidoscope Hands'
      onHome={() => navigate('/games')}
      reportSession={false}
    >
      <div className='flex flex-col items-center gap-4 p-4 max-w-2xl mx-auto'>
        <div className='flex gap-2'>
          {LEVELS.map((level) => (
            <button
              type='button'
              key={level.level}
              onClick={() => handleLevelChange(level.level)}
              className={`px-4 py-2 rounded-full font-bold transition-all ${
                currentLevel === level.level
                  ? 'bg-pink-500 text-white shadow-lg'
                  : 'bg-slate-50 border-2 border-slate-200 text-slate-700 hover:border-slate-400'
              }`}
            >
              Level {level.level}
            </button>
          ))}
        </div>

        <p className='text-gray-600'>
          Move your finger to draw beautiful patterns!
        </p>

        <canvas
          ref={canvasRef}
          width={CANVAS_SIZE}
          height={CANVAS_SIZE}
          onPointerMove={handlePointerMove}
          className='touch-none cursor-crosshair rounded-2xl shadow-xl border-4 border-pink-200'
          style={{ maxWidth: '100%', height: 'auto' }}
        />

        <div className='flex gap-4 text-center'>
          <div className='bg-purple-100 px-4 py-2 rounded-xl'>
            <p className='text-sm text-purple-600 font-medium'>Points</p>
            <p className='text-2xl font-bold text-purple-700'>
              {points.length}
            </p>
          </div>
          <div className='bg-pink-100 px-4 py-2 rounded-xl'>
            <p className='text-sm text-pink-600 font-medium'>Score</p>
            <p className='text-2xl font-bold text-pink-700'>{score}</p>
          </div>
        </div>

        <div className='flex gap-3'>
          <button
            type='button'
            onClick={handleClear}
            className='px-6 py-3 bg-slate-100 border-2 border-slate-200 hover:bg-slate-200 text-slate-700 rounded-xl font-black transition-all'
          >
            Clear
          </button>
          <button
            type='button'
            onClick={handleFinish}
            className='px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white rounded-xl font-bold shadow-lg transition-all'
          >
            Finish
          </button>
        </div>
      </div>
    </GameContainer>
  );
});

// Main export wrapped with GameShell
export const KaleidoscopeHands = memo(function KaleidoscopeHandsComponent() {
  const { saveProgress } = useGameProgress('kaleidoscope-hands');

  return (
    <GameShell
      gameId="kaleidoscope-hands"
      gameName="Kaleidoscope Hands"
      showWellnessTimer={true}
      enableErrorBoundary={true}
    >
      <KaleidoscopeHandsGame saveProgress={saveProgress} />
    </GameShell>
  );
});
