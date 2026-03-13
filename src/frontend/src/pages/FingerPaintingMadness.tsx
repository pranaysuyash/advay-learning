import { useCallback, useEffect, useRef, useState } from 'react';
import { GameContainer } from '../components/GameContainer';
import { GameShell } from '../components/GameShell';
import { GameBackground } from '../components/game/GameBackground';
import { useGameHandTracking } from '../hooks/useGameHandTracking';
import { useAudio } from '../utils/hooks/useAudio';
import {
  FingerPaintingState,
  INITIAL_FINGER_PAINTING_STATE,
  PAINT_COLORS,
  PAINTING_TOOLS,
  PaintingTool,
  getRandomColor,
} from '../games/fingerPaintingLogic';

function FingerPaintingMadnessContent() {
  const [gameState, setGameState] = useState<FingerPaintingState>(INITIAL_FINGER_PAINTING_STATE);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { playClick, playPop } = useAudio();

  const prevPosRef = useRef<{ x: number; y: number } | null>(null);

  const { cursor, isPinching } = useGameHandTracking({
    gameName: 'Finger Painting Madness',
  });

  // Draw loop
  const drawOnCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Helper to draw a brush stroke or effect
    const applyTool = (
      pos: { x: number; y: number },
      prevPos: { x: number; y: number } | null,
      isPinching: boolean,
      handSpeed: number
    ) => {
      // Finger Painting Madness: We paint when hands are present, but maybe only when pinching for control?
      // Spec says messy, let's paint ONLY when pinching so kids can move hands without drawing if they want.
      // Wait, let's just use the pinch mechanic as the "paint down" trigger.
      if (!isPinching) return null;

      const px = pos.x * width;
      const py = pos.y * height;

      ctx.fillStyle = gameState.selectedColor;
      ctx.strokeStyle = gameState.selectedColor;
      
      // If color is rainbow, we randomize it continuously
      if (gameState.selectedColor === 'rainbow') {
        ctx.fillStyle = getRandomColor();
        ctx.strokeStyle = ctx.fillStyle;
      }

      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (gameState.selectedTool === 'brush') {
        ctx.lineWidth = gameState.brushSize;
        ctx.beginPath();
        if (prevPos) {
          ctx.moveTo(prevPos.x, prevPos.y);
        } else {
          ctx.moveTo(px, py);
        }
        ctx.lineTo(px, py);
        ctx.stroke();
      } else if (gameState.selectedTool === 'splatter') {
        // Splatter effect: randomly draw small dots in a radius proportional to hand speed
        const radius = Math.max(gameState.brushSize, handSpeed * 300);
        const drops = Math.floor(Math.random() * 5) + 1; // 1 to 5 drops per frame
        for (let i = 0; i < drops; i++) {
          const angle = Math.random() * Math.PI * 2;
          const r = Math.random() * radius;
          const dropX = px + Math.cos(angle) * r;
          const dropY = py + Math.sin(angle) * r;
          const dropSize = Math.random() * (gameState.brushSize / 2);

          ctx.beginPath();
          ctx.arc(dropX, dropY, dropSize, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (gameState.selectedTool === 'stamp') {
        // Stamps are drawn infrequently, we'll draw one star randomly
        if (Math.random() > 0.8) {
          ctx.font = `${gameState.brushSize * 2}px Arial`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          const stamps = ['⭐', '❤️', '🦋', '🎈', '☀️'];
          const stamp = stamps[Math.floor(Math.random() * stamps.length)];
          ctx.fillText(stamp, px, py);
        }
      } else if (gameState.selectedTool === 'smear') {
        // Smear effect: blur existing pixels or draw highly transparent overlay
        if (prevPos) {
           ctx.lineWidth = gameState.brushSize * 1.5;
           ctx.beginPath();
           ctx.moveTo(prevPos.x, prevPos.y);
           ctx.lineTo(px, py);
           // Smear using destination-out to erase slightly, followed by drawing faded color
           ctx.globalAlpha = 0.1;
           ctx.stroke();
           ctx.globalAlpha = 1.0;
        }
      }

      return { x: px, y: py };
    };

    if (cursor) {
       prevPosRef.current = applyTool(cursor, prevPosRef.current, isPinching, 1);
    } else {
       prevPosRef.current = null;
    }

  }, [gameState, isPinching, cursor]);

  useEffect(() => {
    let animationFrameId: number;
    const render = () => {
      drawOnCanvas();
      animationFrameId = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [drawOnCanvas]);

  // Handle Resize
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current && canvasRef.current.parentElement) {
        // We do NOT want to clear the canvas on resize if possible, but resizing clears WebGL/2D contexts.
        // For a simple kid's toy, we'll just clear it, or we could copy it.
        // Let's copy it.
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        
        canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
        canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;
        
        ctx.putImageData(imageData, 0, 0);
      }
    };
    
    // Initial size
    if (canvasRef.current && canvasRef.current.parentElement) {
      canvasRef.current.width = canvasRef.current.parentElement?.clientWidth || window.innerWidth;
      canvasRef.current.height = canvasRef.current.parentElement?.clientHeight || window.innerHeight;
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleClear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx && canvas) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      playPop();
    }
  };

  const setColor = (color: string) => {
    setGameState((prev: FingerPaintingState) => ({ ...prev, selectedColor: color }));
    playClick();
  };

  const setTool = (tool: PaintingTool) => {
    setGameState((prev: FingerPaintingState) => ({ ...prev, selectedTool: tool }));
    playClick();
  };

  return (
    <div className='relative flex h-full w-full flex-col'>
      {/* Tools UI */}
      <div className='absolute z-10 top-4 left-4 flex flex-col gap-4'>
        <div className='rounded-2xl bg-white/80 p-3 shadow-lg backdrop-blur-sm'>
          <h3 className='mb-2 text-center text-sm font-bold text-slate-700'>Tools</h3>
          <div className='flex flex-col gap-2'>
            {PAINTING_TOOLS.map((tool: { id: PaintingTool; label: string; icon: string }) => (
              <button
                key={tool.id}
                onClick={() => setTool(tool.id)}
                className={`flex h-12 w-12 items-center justify-center rounded-xl text-2xl transition-all ${
                  gameState.selectedTool === tool.id
                    ? 'scale-110 bg-indigo-500 text-white shadow-md'
                    : 'bg-white hover:bg-slate-100'
                }`}
                title={tool.label}
              >
                {tool.icon}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleClear}
          className='rounded-xl bg-red-500 p-3 font-bold text-white shadow-md transition-all hover:bg-red-600 active:scale-95'
        >
          🗑️ Clear
        </button>
      </div>

      {/* Colors UI */}
      <div className='absolute z-10 right-4 top-4 flex flex-col gap-2 rounded-2xl bg-white/80 p-3 shadow-lg backdrop-blur-sm'>
        <h3 className='mb-1 text-center text-sm font-bold text-slate-700'>Colors</h3>
        {PAINT_COLORS.map((color: { name: string; hex: string }) => (
          <button
            key={color.name}
            onClick={() => setColor(color.hex)}
            className={`h-10 w-10 cursor-pointer rounded-full border-4 transition-all hover:scale-110 ${
              gameState.selectedColor === color.hex ? 'scale-110 border-indigo-500 shadow-md' : 'border-transparent'
            }`}
            style={{ backgroundColor: color.hex }}
            title={color.name}
          />
        ))}
        {/* Rainbow button */}
        <button
          onClick={() => setColor('rainbow')}
          className={`h-10 w-10 cursor-pointer rounded-full border-4 bg-gradient-to-br from-red-500 via-green-500 to-blue-500 transition-all hover:scale-110 ${
            gameState.selectedColor === 'rainbow' ? 'scale-110 border-indigo-500 shadow-md' : 'border-transparent'
          }`}
          title='Rainbow'
        />
      </div>

      {/* Main Canvas */}
      <div className='relative flex-1 bg-white overflow-hidden rounded-3xl m-2 border-4 border-slate-200 shadow-inner'>
         <canvas
          ref={canvasRef}
          className='block w-full h-full cursor-crosshair'
        />
        {/* Invisible overlay for hand tracking cursors could be added here if needed, but kids can just look at their hands */}
      </div>
      
      {/* Hint */}
      <div className='absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-none'>
         <div className='rounded-full bg-black/50 px-6 py-2 text-white shadow-lg backdrop-blur-md text-lg font-bold animate-pulse'>
           Pinch your fingers to paint!
         </div>
      </div>
    </div>
  );
}

export default function FingerPaintingMadness() {
  return (
    <GameBackground type='solid_cloud'>
      <GameShell gameId='finger-painting-madness' gameName='Finger Painting Madness'>
        <GameContainer
          title='Finger Painting Madness 🎨'
          onHome={() => window.history.back()}
        >
          <FingerPaintingMadnessContent />
        </GameContainer>
      </GameShell>
    </GameBackground>
  );
}
