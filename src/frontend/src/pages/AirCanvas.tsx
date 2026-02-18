import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Webcam from 'react-webcam';
import { motion, AnimatePresence } from 'framer-motion';
import { useHandTracking } from '../hooks/useHandTracking';
import { useSoundEffects } from '../hooks/useSoundEffects';

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
      requestAnimationFrame(detectHand);
      return;
    }

    const results = handLandmarker.detectForVideo(video, performance.now());
    const canvas = canvasRef.current;
    if (!canvas) {
      requestAnimationFrame(detectHand);
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      requestAnimationFrame(detectHand);
      return;
    }

    // Clear and redraw
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

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

      // Draw position (mirrored)
      const x = (1 - indexFinger.x) * canvas.width;
      const y = indexFinger.y * canvas.height;

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

    requestAnimationFrame(detectHand);
  }, [handLandmarker, selectedBrush, selectedColor, brushSize, addParticles, getRainbowColor]);

  useEffect(() => {
    if (isHandReady) {
      detectHand();
    }
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
    void playPop();
  };

  // Cycle brush size
  const cycleBrushSize = () => {
    setBrushSize((prev) => (prev >= 3 ? 0.5 : prev + 0.5));
    void playPop();
  };

  if (isHandLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <motion.div className="text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="text-6xl mb-4">✨</div>
          <h2 className="text-2xl font-bold text-white">Loading Air Canvas...</h2>
          <p className="text-gray-400">Preparing magic brushes...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-20 flex justify-between items-center p-4 bg-gradient-to-b from-black/80 to-transparent">
        <button
          onClick={() => navigate('/games')}
          className="px-4 py-2 bg-white/20 backdrop-blur rounded-full font-bold text-white hover:bg-white/30 transition"
        >
          ← Back
        </button>
        <h1 className="text-2xl font-bold text-white">Air Canvas ✨</h1>
        <button
          onClick={() => setShowUI(!showUI)}
          className="px-4 py-2 bg-white/20 backdrop-blur rounded-full font-bold text-white hover:bg-white/30 transition"
        >
          {showUI ? '👁️' : '🎨'}
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
            className="absolute bottom-4 left-4 right-4 z-20"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
          >
            {/* Brushes */}
            <div className="bg-black/60 backdrop-blur-xl rounded-2xl p-4 mb-2">
              <div className="flex gap-2 overflow-x-auto pb-2">
                {BRUSHES.map((brush) => (
                  <button
                    key={brush.id}
                    onClick={() => {
                      setSelectedBrush(brush);
                      void playPop();
                    }}
                    className={`flex-shrink-0 px-4 py-2 rounded-xl font-bold transition-all ${
                      selectedBrush.id === brush.id
                        ? 'bg-white text-black scale-110'
                        : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                  >
                    <span className="mr-1">{brush.icon}</span>
                    <span className="text-sm">{brush.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Colors */}
            <div className="bg-black/60 backdrop-blur-xl rounded-2xl p-4 mb-2">
              <div className="flex gap-2 flex-wrap justify-center">
                {COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => {
                      setSelectedColor(color);
                      void playPop();
                    }}
                    className={`w-8 h-8 rounded-full border-2 transition-transform ${
                      selectedColor === color ? 'border-white scale-125' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
                <button
                  onClick={randomColor}
                  className="w-8 h-8 rounded-full bg-gradient-to-r from-red-500 via-green-500 to-blue-500 border-2 border-white/50"
                  title="Random Color"
                >
                  🎲
                </button>
              </div>
            </div>

            {/* Controls */}
            <div className="bg-black/60 backdrop-blur-xl rounded-2xl p-4 flex gap-2 justify-center">
              <button
                onClick={cycleBrushSize}
                className="px-4 py-2 bg-white/10 text-white rounded-xl font-bold hover:bg-white/20 transition"
              >
                Size: {brushSize}x
              </button>
              <button
                onClick={clearCanvas}
                className="px-4 py-2 bg-red-500/50 text-white rounded-xl font-bold hover:bg-red-500/70 transition"
              >
                🗑️ Clear
              </button>
              <button
                onClick={takeSnapshot}
                className="px-4 py-2 bg-blue-500/50 text-white rounded-xl font-bold hover:bg-blue-500/70 transition"
              >
                📸 Snap
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Instructions */}
      <AnimatePresence>
        {!isHandOpen && (
          <motion.div
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 text-center">
              <div className="text-6xl mb-4">🖐️</div>
              <h2 className="text-2xl font-bold text-white mb-2">Open Your Hand to Draw!</h2>
              <p className="text-gray-300">Close fingers to pause</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Status */}
      <div className="absolute top-20 left-4 z-10">
        <div className="bg-black/50 backdrop-blur rounded-full px-4 py-2 text-white text-sm">
          {isHandReady ? '✋ Hand Ready' : '⏳ Loading...'}
          {' | '}
          {isHandOpen ? '🎨 Drawing' : '✋ Paused'}
          {' | '}
          ✨ {particleCount} particles
        </div>
      </div>

      {/* Snapshot Modal */}
      <AnimatePresence>
        {snapshot && (
          <motion.div
            className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="bg-white rounded-3xl p-6 max-w-2xl w-full">
              <h2 className="text-2xl font-bold mb-4 text-center">🎨 Your Masterpiece!</h2>
              <img
                src={snapshot}
                alt="Your drawing"
                className="w-full rounded-xl mb-4 bg-black"
              />
              <div className="flex gap-4">
                <button
                  onClick={downloadSnapshot}
                  className="flex-1 py-3 bg-blue-500 text-white rounded-xl font-bold hover:bg-blue-600 transition"
                >
                  💾 Download
                </button>
                <button
                  onClick={() => setSnapshot(null)}
                  className="flex-1 py-3 bg-gray-200 text-gray-800 rounded-xl font-bold hover:bg-gray-300 transition"
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
