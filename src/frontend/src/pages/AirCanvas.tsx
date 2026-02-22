import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Webcam from 'react-webcam';
import { motion, AnimatePresence } from 'framer-motion';
import { useHandTracking } from '../hooks/useHandTracking';
import { useSoundEffects } from '../hooks/useSoundEffects';
import {
  assetLoader,
  PAINT_ASSETS,
  SOUND_ASSETS,
  WEATHER_BACKGROUNDS,
} from '../utils/assets';
import { mapNormalizedPointToCover } from '../utils/coordinateTransform';

interface Brush {
  id: string;
  name: string;
  icon: string;
  particleSize: number;
  fadeSpeed: number;
  colorShift: boolean;
  trail: boolean;
}

interface Particle {
  x: number;
  y: number;
  size: number;
  color: string;
  alpha: number;
  vx: number;
  vy: number;
  life: number;
}

const BRUSHES: Brush[] = [
  { id: 'sparkle', name: 'Sparkle', icon: '✨', particleSize: 4, fadeSpeed: 0.02, colorShift: false, trail: false },
  { id: 'neon', name: 'Neon', icon: '💡', particleSize: 6, fadeSpeed: 0.01, colorShift: false, trail: true },
  { id: 'rainbow', name: 'Rainbow', icon: '🌈', particleSize: 8, fadeSpeed: 0.015, colorShift: true, trail: true },
  { id: 'fire', name: 'Fire', icon: '🔥', particleSize: 10, fadeSpeed: 0.03, colorShift: false, trail: false },
  { id: 'smoke', name: 'Smoke', icon: '💨', particleSize: 15, fadeSpeed: 0.008, colorShift: false, trail: true },
  { id: 'glitter', name: 'Glitter', icon: '✨', particleSize: 3, fadeSpeed: 0.025, colorShift: true, trail: false },
  { id: 'laser', name: 'Laser', icon: '⚡', particleSize: 4, fadeSpeed: 0.005, colorShift: false, trail: true },
  { id: 'bubble', name: 'Bubble', icon: '🫧', particleSize: 12, fadeSpeed: 0.01, colorShift: false, trail: false },
];

const COLORS = [
  '#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#4B0082', '#9400D3',
  '#FF1493', '#00FFFF', '#FF00FF', '#FFFFFF', '#000000', '#FFD700', '#FF6347',
];

export function AirCanvas() {
  const navigate = useNavigate();
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [, setIsDrawing] = useState(false);
  const [selectedBrush, setSelectedBrush] = useState<Brush>(BRUSHES[0]);
  const [selectedColor, setSelectedColor] = useState<string>(COLORS[0]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const particleCount = particles.length;
  const [isHandOpen, setIsHandOpen] = useState(true);
  const [brushSize, setBrushSize] = useState(1);
  const [showUI, setShowUI] = useState(true);
  const [snapshot, setSnapshot] = useState<string | null>(null);
  const colorIndexRef = useRef(0);
  const lastPositionRef = useRef<{ x: number; y: number } | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const backgroundImageRef = useRef<HTMLImageElement | null>(null);

  const { playPop, playSuccess } = useSoundEffects();

  const {
    landmarker: handLandmarker,
    isLoading: isHandLoading,
    isReady: isHandReady,
  } = useHandTracking({
    numHands: 1,
    minDetectionConfidence: 0.3,
    minHandPresenceConfidence: 0.3,
    minTrackingConfidence: 0.3,
    delegate: 'GPU',
    enableFallback: true,
  });

  useEffect(() => {
    let mounted = true;

    async function preloadAssets() {
      try {
        await assetLoader.loadImages([
          ...PAINT_ASSETS,
          WEATHER_BACKGROUNDS.sunny,
        ]);
        await assetLoader.loadSounds(Object.values(SOUND_ASSETS));

        if (!mounted) return;
        backgroundImageRef.current = assetLoader.getImage(
          WEATHER_BACKGROUNDS.sunny.id,
        );
      } catch (error) {
        console.error('Failed to preload Air Canvas assets', error);
      }
    }

    void preloadAssets();

    return () => {
      mounted = false;
    };
  }, []);

  // Generate rainbow color
  const getRainbowColor = useCallback(() => {
    const hue = (colorIndexRef.current * 2) % 360;
    colorIndexRef.current += 1;
    return `hsl(${hue}, 100%, 50%)`;
  }, []);

  // Add particles at position
  const addParticles = useCallback((x: number, y: number, velocityX: number, velocityY: number) => {
    const newParticles: Particle[] = [];
    const count = selectedBrush.id === 'glitter' ? 3 : 1;

    for (let i = 0; i < count; i++) {
      const color = selectedBrush.colorShift ? getRainbowColor() : selectedColor;
      const size = selectedBrush.particleSize * brushSize * (0.8 + Math.random() * 0.4);

      newParticles.push({
        x: x + (Math.random() - 0.5) * 10,
        y: y + (Math.random() - 0.5) * 10,
        size,
        color,
        alpha: 1,
        vx: velocityX * 0.1 + (Math.random() - 0.5) * 2,
        vy: velocityY * 0.1 + (Math.random() - 0.5) * 2,
        life: 1,
      });
    }

    setParticles((prev) => [...prev, ...newParticles]);
  }, [selectedBrush, selectedColor, brushSize, getRainbowColor]);

  // Hand tracking loop
  const detectHand = useCallback(() => {
    if (!webcamRef.current || !handLandmarker) return;

    const video = webcamRef.current.video;
    if (!video || video.readyState !== 4) {
      animationFrameRef.current = requestAnimationFrame(detectHand);
      return;
    }

    const results = handLandmarker.detectForVideo(video, performance.now());
    const canvas = canvasRef.current;
    if (!canvas) {
      animationFrameRef.current = requestAnimationFrame(detectHand);
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      animationFrameRef.current = requestAnimationFrame(detectHand);
      return;
    }

    // Clear and redraw
    ctx.fillStyle = 'rgba(10, 16, 28, 0.08)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const backgroundImage = backgroundImageRef.current;
    if (backgroundImage?.src) {
      ctx.globalAlpha = 0.08;
      ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
      ctx.globalAlpha = 1;
    }

    if (results.landmarks && results.landmarks.length > 0) {
      const landmarks = results.landmarks[0];
      const indexFinger = landmarks[8];
      const middleFinger = landmarks[12];
      const ringFinger = landmarks[16];
      const pinky = landmarks[20];
      const wrist = landmarks[0];

      // Calculate hand openness
      const fingerTips = [indexFinger, middleFinger, ringFinger, pinky];
      const avgTipY = fingerTips.reduce((sum, f) => sum + f.y, 0) / 4;
      const handOpen = avgTipY < wrist.y - 0.1;
      setIsHandOpen(handOpen);

      // Draw position using robust cover-mapping transformation
      const mappedPoint = mapNormalizedPointToCover(
        { x: indexFinger.x, y: indexFinger.y },
        {
          width: video.videoWidth || 640,
          height: video.videoHeight || 480,
        },
        { width: canvas.width, height: canvas.height },
        { mirrored: true, clamp: true },
      );

      const x = mappedPoint.x * canvas.width;
      const y = mappedPoint.y * canvas.height;

      // Calculate velocity for particle spread
      let velocityX = 0;
      let velocityY = 0;
      if (lastPositionRef.current) {
        velocityX = x - lastPositionRef.current.x;
        velocityY = y - lastPositionRef.current.y;
      }
      lastPositionRef.current = { x, y };

      // Draw if hand is open
      if (handOpen) {
        setIsDrawing(true);
        addParticles(x, y, velocityX, velocityY);
      } else {
        setIsDrawing(false);
      }

      // Draw hand cursor
      ctx.beginPath();
      ctx.arc(x, y, 10 * brushSize, 0, 2 * Math.PI);
      ctx.fillStyle = handOpen
        ? selectedBrush.colorShift
          ? getRainbowColor()
          : selectedColor
        : 'rgba(255, 255, 255, 0.5)';
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Glow effect
      if (handOpen) {
        ctx.beginPath();
        ctx.arc(x, y, 20 * brushSize, 0, 2 * Math.PI);
        ctx.fillStyle = selectedBrush.colorShift
          ? `${getRainbowColor()}33`
          : `${selectedColor}33`;
        ctx.fill();
      }
    }

    // Update and draw particles
    setParticles((prev) => {
      const updated = prev
        .map((p) => ({
          ...p,
          x: p.x + p.vx,
          y: p.y + p.vy,
          alpha: p.alpha - selectedBrush.fadeSpeed,
          life: p.life - 0.01,
          vx: p.vx * 0.98,
          vy: p.vy * 0.98,
        }))
        .filter((p) => p.alpha > 0);

      // Draw particles
      updated.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, 2 * Math.PI);

        if (selectedBrush.id === 'bubble') {
          ctx.strokeStyle = p.color;
          ctx.lineWidth = 2;
          ctx.globalAlpha = p.alpha;
          ctx.stroke();
          ctx.fillStyle = `${p.color}22`;
          ctx.fill();
        } else if (selectedBrush.id === 'fire') {
          const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
          gradient.addColorStop(0, `rgba(255, 255, 0, ${p.alpha})`);
          gradient.addColorStop(0.5, `rgba(255, 100, 0, ${p.alpha * 0.8})`);
          gradient.addColorStop(1, `rgba(255, 0, 0, 0)`);
          ctx.fillStyle = gradient;
          ctx.fill();
        } else if (selectedBrush.id === 'smoke') {
          ctx.fillStyle = `rgba(200, 200, 200, ${p.alpha * 0.3})`;
          ctx.fill();
        } else {
          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.alpha;
          ctx.fill();
        }

        ctx.globalAlpha = 1;
      });

      return updated;
    });

    animationFrameRef.current = requestAnimationFrame(detectHand);
  }, [handLandmarker, selectedBrush, selectedColor, brushSize, addParticles, getRainbowColor]);

  useEffect(() => {
    if (isHandReady) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      detectHand();
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [isHandReady, detectHand]);

  // Clear canvas
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
    setParticles([]);
    lastPositionRef.current = null;
    void playPop();
  };

  // Take snapshot
  const takeSnapshot = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const dataUrl = canvas.toDataURL('image/png');
      setSnapshot(dataUrl);
      void playSuccess();
    }
  };

  // Download snapshot
  const downloadSnapshot = () => {
    if (snapshot) {
      const link = document.createElement('a');
      link.download = `air-canvas-${Date.now()}.png`;
      link.href = snapshot;
      link.click();
      setSnapshot(null);
    }
  };

  // Random color
  const randomColor = () => {
    setSelectedColor(COLORS[Math.floor(Math.random() * COLORS.length)]);
    assetLoader.playSound('pop', 0.2);
    void playPop();
  };

  // Cycle brush size
  const cycleBrushSize = () => {
    setBrushSize((prev) => (prev >= 3 ? 0.5 : prev + 0.5));
    assetLoader.playSound('pop', 0.18);
    void playPop();
  };

  if (isHandLoading) {
    return (
      <div className="min-h-[100dvh] bg-[#FFF8F0] flex flex-col items-center justify-center p-4">
        <motion.div
          className="text-center bg-white border-4 border-slate-100 rounded-[2.5rem] p-12 shadow-sm max-w-md w-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="inline-block bg-blue-50 text-[5rem] mb-6 p-6 rounded-[2rem] border-4 border-blue-100 drop-shadow-sm">✨</div>
          <h2 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight mb-4">Loading Air Canvas...</h2>
          <div className="w-16 h-16 border-8 border-slate-100 border-t-[#3B82F6] rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-xl font-bold text-slate-500">Preparing magic brushes...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-[#FFF8F0] relative overflow-hidden font-sans">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-20 flex justify-between items-center p-6 bg-gradient-to-b from-black/60 to-transparent pointer-events-none">
        <button
          onClick={() => navigate('/games')}
          className="pointer-events-auto px-6 py-3 bg-white hover:bg-slate-50 border-4 border-slate-200/50 rounded-[1.5rem] font-bold text-slate-700 shadow-sm transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
        >
          <span className="text-xl">←</span> Back
        </button>
        <div className="bg-white/10 backdrop-blur-md border border-white/20 px-8 py-3 rounded-[2rem]">
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-wide drop-shadow-md">Air Canvas ✨</h1>
        </div>
        <button
          onClick={() => setShowUI(!showUI)}
          className="pointer-events-auto px-6 py-3 bg-[#F59E0B] hover:bg-amber-500 border-4 border-amber-300 rounded-[1.5rem] font-black text-white shadow-sm transition-all hover:scale-105 active:scale-95 text-lg"
        >
          {showUI ? 'Hide Tools 👁️' : 'Show Tools 🎨'}
        </button>
      </header>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        width={1280}
        height={720}
      />

      {/* Webcam (hidden but functional) */}
      <Webcam
        ref={webcamRef}
        className="absolute bottom-4 right-4 w-48 h-36 rounded-xl opacity-50"
        mirrored
        videoConstraints={{ width: 640, height: 480 }}
      />

      {/* UI Panel */}
      <AnimatePresence>
        {showUI && (
          <motion.div
            className="absolute bottom-6 left-6 right-6 z-20 pointer-events-auto max-w-4xl mx-auto"
            initial={{ y: 150, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 150, opacity: 0 }}
            transition={{ type: 'spring', bounce: 0.3 }}
          >
            {/* Brushes */}
            <div className="bg-white/95 backdrop-blur-xl border-4 border-slate-100 rounded-[2rem] p-4 mb-3 shadow-[0_8px_0_0_rgba(241,245,249,1)]">
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {BRUSHES.map((brush) => (
                  <button
                    key={brush.id}
                    onClick={() => {
                      setSelectedBrush(brush);
                      assetLoader.playSound('pop', 0.28);
                      void playPop();
                    }}
                    className={`flex-shrink-0 px-6 py-3 rounded-[1.5rem] font-bold transition-all border-4 flex items-center gap-2 ${selectedBrush.id === brush.id
                      ? 'bg-[#E85D04] border-[#D00000] text-white shadow-sm -translate-y-1'
                      : 'bg-white border-slate-100 text-slate-600 hover:bg-slate-50 hover:border-slate-200'
                      }`}
                  >
                    <span className="text-2xl">{brush.icon}</span>
                    <span className="text-sm tracking-wide uppercase">{brush.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-3">
              {/* Colors */}
              <div className="bg-white/95 backdrop-blur-xl border-4 border-slate-100 rounded-[2rem] p-4 flex-1 shadow-[0_8px_0_0_rgba(241,245,249,1)]">
                <div className="flex gap-2 flex-wrap justify-center items-center h-full">
                  {COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => {
                        setSelectedColor(color);
                        assetLoader.playSound('pop', 0.2);
                        void playPop();
                      }}
                      title={`Select color ${color}`}
                      aria-label={`Select color ${color}`}
                      className={`w-10 h-10 md:w-12 md:h-12 rounded-full border-4 transition-transform ${selectedColor === color ? 'border-slate-800 scale-110 shadow-md' : 'border-white/50 shadow-sm hover:scale-105'
                        }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                  <button
                    onClick={randomColor}
                    className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-r from-red-500 via-green-500 to-blue-500 border-4 border-white shadow-sm hover:scale-105 transition-transform flex items-center justify-center text-xl"
                    title="Random Color"
                  >
                    🎲
                  </button>
                </div>
              </div>

              {/* Controls */}
              <div className="bg-white/95 backdrop-blur-xl border-4 border-slate-100 rounded-[2rem] p-4 flex gap-3 justify-center shadow-[0_8px_0_0_rgba(241,245,249,1)]">
                <button
                  onClick={cycleBrushSize}
                  className="px-6 py-3 bg-[#3B82F6] hover:bg-blue-600 border-4 border-blue-400 rounded-[1.5rem] font-black text-white shadow-sm transition-all hover:scale-105 active:scale-95"
                >
                  Size: {brushSize}x
                </button>
                <button
                  onClick={clearCanvas}
                  className="px-6 py-3 bg-red-100 hover:bg-red-200 border-4 border-red-200 rounded-[1.5rem] font-black text-red-600 shadow-sm transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
                >
                  <span>🗑️</span> Clear
                </button>
                <button
                  onClick={takeSnapshot}
                  className="px-6 py-3 bg-[#10B981] hover:bg-emerald-500 border-4 border-emerald-400 rounded-[1.5rem] font-black text-white shadow-sm transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
                >
                  <span>📸</span> Snap
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Instructions */}
      <AnimatePresence>
        {!isHandOpen && (
          <motion.div
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            <div className="bg-white/95 backdrop-blur-md border-4 border-amber-200 rounded-[2.5rem] p-10 text-center shadow-lg">
              <div className="text-[6rem] mb-4 drop-shadow-md">🖐️</div>
              <h2 className="text-3xl font-black text-slate-800 tracking-tight mb-2">Open Hand to Draw!</h2>
              <div className="inline-block bg-slate-100 rounded-full px-6 py-2 mt-2">
                <p className="text-lg font-bold text-slate-500">Close fingers to pause</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Status */}
      <div className="absolute top-24 left-6 z-10 pointer-events-none">
        <div className="bg-black/40 backdrop-blur-md border border-white/20 rounded-full px-6 py-3 flex gap-4 items-center shadow-sm">
          <span className="text-white font-bold tracking-wide">
            {isHandReady ? '🟢 Hand Ready' : '⏳ Loading...'}
          </span>
          <div className="w-px h-4 bg-white/30" />
          <span className="text-white font-bold tracking-wide">
            {isHandOpen ? '🎨 Drawing' : '✋ Paused'}
          </span>
          <div className="w-px h-4 bg-white/30" />
          <span className="text-white/80 text-sm font-medium">
            ✨ {particleCount}
          </span>
        </div>
      </div>

      {/* Snapshot Modal */}
      <AnimatePresence>
        {snapshot && (
          <motion.div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="bg-white border-4 border-slate-100 rounded-[3rem] p-10 max-w-2xl w-full shadow-2xl">
              <div className="text-center mb-6">
                <span className="text-[4rem] inline-block mb-2">🎨</span>
                <h2 className="text-4xl font-black text-slate-800 tracking-tight">Your Masterpiece!</h2>
              </div>
              <div className="border-4 border-slate-200 rounded-[2rem] overflow-hidden mb-8 shadow-inner">
                <img
                  src={snapshot}
                  alt="Your drawing"
                  className="w-full bg-slate-100"
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={downloadSnapshot}
                  className="flex-1 py-4 bg-[#3B82F6] hover:bg-blue-600 border-4 border-blue-400 rounded-[1.5rem] font-black text-white text-xl shadow-[0_6px_0_0_rgba(59,130,246,0.6)] hover:shadow-none hover:translate-y-[6px] transition-all flex items-center justify-center gap-2"
                >
                  <span>💾</span> Download
                </button>
                <button
                  onClick={() => setSnapshot(null)}
                  className="flex-1 py-4 bg-white hover:bg-slate-50 border-4 border-slate-200 rounded-[1.5rem] font-black text-slate-600 text-xl shadow-[0_6px_0_0_rgba(226,232,240,1)] hover:shadow-none hover:translate-y-[6px] transition-all"
                >
                  Keep Drawing
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default AirCanvas;
