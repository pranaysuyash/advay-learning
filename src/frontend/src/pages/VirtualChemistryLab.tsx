import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Webcam from 'react-webcam';
import { motion, AnimatePresence } from 'framer-motion';
import { useHandTracking } from '../hooks/useHandTracking';
import { useSoundEffects } from '../hooks/useSoundEffects';
import { useTTS } from '../hooks/useTTS';


interface Chemical {
  id: string;
  name: string;
  color: string;
  symbol: string;
  description: string;
  density: number; // affects layering
}

interface BeakerContent {
  chemicalId: string;
  amount: number; // 0-100
  color: string;
}

interface Reaction {
  id: string;
  name: string;
  input1: string;
  input2: string;
  resultColor: string;
  resultName: string;
  description: string;
  effect: 'bubble' | 'steam' | 'color-change' | 'none';
}

const CHEMICALS: Chemical[] = [
  { id: 'water', name: 'Water', color: '#4FC3F7', symbol: 'H₂O', description: 'Clear liquid', density: 1 },
  { id: 'vinegar', name: 'Vinegar', color: '#FFF9C4', symbol: 'CH₃COOH', description: 'Weak acid', density: 1.01 },
  { id: 'baking-soda', name: 'Baking Soda', color: '#FFFFFF', symbol: 'NaHCO₃', description: 'White powder', density: 2.2 },
  { id: 'red-dye', name: 'Red Dye', color: '#FF5252', symbol: 'Red', description: 'Food coloring', density: 1.05 },
  { id: 'blue-dye', name: 'Blue Dye', color: '#448AFF', symbol: 'Blue', description: 'Food coloring', density: 1.05 },
  { id: 'yellow-dye', name: 'Yellow Dye', color: '#FFD740', symbol: 'Yellow', description: 'Food coloring', density: 1.05 },
  { id: 'oil', name: 'Oil', color: '#FFF59D', symbol: 'Oil', description: 'Does not mix with water', density: 0.9 },
  { id: 'soap', name: 'Soap', color: '#E1BEE7', symbol: 'Soap', description: 'Makes bubbles!', density: 1.02 },
];

const REACTIONS: Reaction[] = [
  {
    id: 'volcano',
    name: 'Fizzy Eruption',
    input1: 'vinegar',
    input2: 'baking-soda',
    resultColor: '#FFF9C4',
    resultName: 'Carbon Dioxide + Water',
    description: 'Bubbles everywhere! That\'s a chemical reaction!',
    effect: 'bubble',
  },
  {
    id: 'purple',
    name: 'Purple Mix',
    input1: 'red-dye',
    input2: 'blue-dye',
    resultColor: '#9C27B0',
    resultName: 'Purple',
    description: 'Red + Blue = Purple! Color mixing!',
    effect: 'color-change',
  },
  {
    id: 'orange',
    name: 'Orange Mix',
    input1: 'red-dye',
    input2: 'yellow-dye',
    resultColor: '#FF9800',
    resultName: 'Orange',
    description: 'Red + Yellow = Orange!',
    effect: 'color-change',
  },
  {
    id: 'green',
    name: 'Green Mix',
    input1: 'blue-dye',
    input2: 'yellow-dye',
    resultColor: '#4CAF50',
    resultName: 'Green',
    description: 'Blue + Yellow = Green!',
    effect: 'color-change',
  },
  {
    id: 'bubbles',
    name: 'Bubble Mix',
    input1: 'water',
    input2: 'soap',
    resultColor: '#E1BEE7',
    resultName: 'Soapy Water',
    description: 'Now you can blow bubbles!',
    effect: 'bubble',
  },
];

export function VirtualChemistryLab() {
  const navigate = useNavigate();
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedChemical, setSelectedChemical] = useState<Chemical | null>(null);
  const [beakerContents, setBeakerContents] = useState<BeakerContent[]>([]);
  const [lastReaction, setLastReaction] = useState<Reaction | null>(null);
  const [showReactionEffect, setShowReactionEffect] = useState(false);
  const [score, setScore] = useState(0);
  const [discoveredReactions, setDiscoveredReactions] = useState<Set<string>>(new Set());
  const [isPouring, setIsPouring] = useState(false);
  const [bubbles, setBubbles] = useState<Array<{ x: number; y: number; size: number; speed: number }>>([]);

  const { speak, isEnabled: ttsEnabled } = useTTS();
  const { playSuccess, playPop } = useSoundEffects();

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

  // Check for reactions when beaker contents change
  useEffect(() => {
    if (beakerContents.length < 2) return;

    const chemicalIds = beakerContents.map((c) => c.chemicalId);
    
    for (const reaction of REACTIONS) {
      if (
        chemicalIds.includes(reaction.input1) &&
        chemicalIds.includes(reaction.input2)
      ) {
        // Found a reaction!
        if (!discoveredReactions.has(reaction.id)) {
          setDiscoveredReactions((prev) => new Set([...prev, reaction.id]));
          setLastReaction(reaction);
          setShowReactionEffect(true);
          setScore((s) => s + 50);
          void playSuccess();
          
          if (ttsEnabled) {
            void speak(`${reaction.name}! ${reaction.description}`);
          }

          // Create bubbles for bubble effect
          if (reaction.effect === 'bubble') {
            const newBubbles = Array.from({ length: 10 }, () => ({
              x: 320 + (Math.random() - 0.5) * 100,
              y: 400 + Math.random() * 50,
              size: 5 + Math.random() * 15,
              speed: 1 + Math.random() * 3,
            }));
            setBubbles(newBubbles);
          }

          setTimeout(() => {
            setShowReactionEffect(false);
          }, 3000);
        }
        break;
      }
    }
  }, [beakerContents, discoveredReactions, playSuccess, speak, ttsEnabled]);

  // Animate bubbles
  useEffect(() => {
    if (bubbles.length === 0) return;

    const interval = setInterval(() => {
      setBubbles((prev) =>
        prev
          .map((b) => ({ ...b, y: b.y - b.speed }))
          .filter((b) => b.y > 200)
      );
    }, 50);

    return () => clearInterval(interval);
  }, [bubbles.length]);

  // Hand tracking for pouring
  const detectHand = useCallback(() => {
    if (!webcamRef.current || !handLandmarker || !isPlaying) return;

    const video = webcamRef.current.video;
    if (!video || video.readyState !== 4) return;

    const results = handLandmarker.detectForVideo(video, performance.now());

    if (results.landmarks && results.landmarks.length > 0) {
      const landmarks = results.landmarks[0];
      const indexFinger = landmarks[8]; // Index finger tip
      const thumb = landmarks[4]; // Thumb tip

      // Check if hand is over beaker area (bottom center of screen)
      const isOverBeaker =
        indexFinger.y > 0.5 && indexFinger.x > 0.3 && indexFinger.x < 0.7;

      // Check if pinching (thumb and index close together)
      const pinchDistance = Math.sqrt(
        Math.pow(indexFinger.x - thumb.x, 2) +
        Math.pow(indexFinger.y - thumb.y, 2)
      );
      const isPinching = pinchDistance < 0.1;

      // Draw hand position on canvas
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          // Draw beaker
          drawBeaker(ctx, canvas.width, canvas.height);

          // Draw hand cursor
          const handX = (1 - indexFinger.x) * canvas.width;
          const handY = indexFinger.y * canvas.height;

          ctx.beginPath();
          ctx.arc(handX, handY, 15, 0, 2 * Math.PI);
          ctx.fillStyle = isPinching ? '#4CAF50' : '#FF9800';
          ctx.fill();
          ctx.strokeStyle = '#FFFFFF';
          ctx.lineWidth = 3;
          ctx.stroke();

          // Draw bubbles
          bubbles.forEach((b) => {
            ctx.beginPath();
            ctx.arc(b.x, b.y, b.size, 0, 2 * Math.PI);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.fill();
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.lineWidth = 2;
            ctx.stroke();
          });

          // Handle pouring
          if (isPinching && selectedChemical && isOverBeaker && !isPouring) {
            handlePour();
          }
        }
      }
    }

    requestAnimationFrame(detectHand);
  }, [handLandmarker, isPlaying, selectedChemical, isPouring, bubbles, beakerContents]);

  useEffect(() => {
    if (isPlaying && isHandReady) {
      detectHand();
    }
  }, [isPlaying, isHandReady, detectHand]);

  const drawBeaker = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number
  ) => {
    const beakerX = width / 2;
    const beakerY = height * 0.7;
    const beakerWidth = 120;
    const beakerHeight = 150;

    // Draw beaker outline
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(beakerX - beakerWidth / 2, beakerY - beakerHeight);
    ctx.lineTo(beakerX - beakerWidth / 2, beakerY);
    ctx.lineTo(beakerX + beakerWidth / 2, beakerY);
    ctx.lineTo(beakerX + beakerWidth / 2, beakerY - beakerHeight);
    ctx.stroke();

    // Draw beaker contents (layered by density)
    if (beakerContents.length > 0) {
      let currentY = beakerY - 10;
      const totalHeight = beakerHeight - 20;
      // Calculate total amount for proportional display
      // const totalAmount = beakerContents.reduce((sum, c) => sum + c.amount, 0);

      beakerContents.forEach((content) => {
        const height = (content.amount / 100) * totalHeight;
        
        ctx.fillStyle = content.color;
        ctx.fillRect(
          beakerX - beakerWidth / 2 + 4,
          currentY - height,
          beakerWidth - 8,
          height
        );

        currentY -= height;
      });
    }

    // Draw measurement lines
    ctx.strokeStyle = '#999';
    ctx.lineWidth = 2;
    for (let i = 1; i <= 4; i++) {
      const y = beakerY - (beakerHeight / 5) * i;
      ctx.beginPath();
      ctx.moveTo(beakerX + beakerWidth / 2 - 20, y);
      ctx.lineTo(beakerX + beakerWidth / 2, y);
      ctx.stroke();
    }
  };

  const handlePour = () => {
    if (!selectedChemical || isPouring) return;

    setIsPouring(true);
    void playPop();

    setTimeout(() => {
      setBeakerContents((prev) => {
        const existing = prev.find((c) => c.chemicalId === selectedChemical.id);
        if (existing) {
          return prev.map((c) =>
            c.chemicalId === selectedChemical.id
              ? { ...c, amount: Math.min(c.amount + 20, 100) }
              : c
          );
        }
        return [
          ...prev,
          {
            chemicalId: selectedChemical.id,
            amount: 20,
            color: selectedChemical.color,
          },
        ];
      });

      setIsPouring(false);
    }, 500);
  };

  const clearBeaker = () => {
    setBeakerContents([]);
    setBubbles([]);
    setLastReaction(null);
    setShowReactionEffect(false);
  };

  if (isHandLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center">
        <motion.div className="text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="text-6xl mb-4">🧪</div>
          <h2 className="text-2xl font-bold text-purple-700">Loading Chemistry Lab...</h2>
          <p className="text-purple-500">Getting safety goggles ready!</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-blue-100 p-4">
      {/* Header */}
      <header className="flex justify-between items-center mb-4">
        <button
          onClick={() => navigate('/games')}
          className="px-4 py-2 bg-white/80 backdrop-blur rounded-full font-bold text-purple-700 hover:bg-white transition"
        >
          ← Back
        </button>
        <h1 className="text-2xl font-bold text-purple-800">Virtual Chemistry Lab 🧪</h1>
        <div className="px-4 py-2 bg-yellow-400 rounded-full font-bold text-purple-800">
          ⭐ {score}
        </div>
      </header>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chemical Shelf */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-3xl p-6 shadow-lg">
            <h2 className="text-xl font-bold text-purple-800 mb-4">Chemical Shelf</h2>
            <p className="text-sm text-gray-600 mb-4">
              Select a chemical, then pinch your fingers over the beaker to pour!
            </p>
            
            <div className="grid grid-cols-2 gap-3">
              {CHEMICALS.map((chemical) => (
                <motion.button
                  key={chemical.id}
                  onClick={() => setSelectedChemical(chemical)}
                  className={`p-3 rounded-xl border-2 transition-all ${
                    selectedChemical?.id === chemical.id
                      ? 'border-purple-500 bg-purple-100'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div
                    className="w-8 h-8 rounded-full mx-auto mb-2"
                    style={{ backgroundColor: chemical.color }}
                  />
                  <div className="text-xs font-bold text-gray-800">{chemical.symbol}</div>
                  <div className="text-xs text-gray-600">{chemical.name}</div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Discovery Book */}
          <div className="bg-white rounded-3xl p-6 shadow-lg">
            <h2 className="text-xl font-bold text-purple-800 mb-4">
              Discovery Book 📖
            </h2>
            <div className="text-sm text-gray-600 mb-2">
              {discoveredReactions.size} / {REACTIONS.length} reactions discovered
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {REACTIONS.map((reaction) => {
                const isDiscovered = discoveredReactions.has(reaction.id);
                return (
                  <div
                    key={reaction.id}
                    className={`p-3 rounded-xl text-sm ${
                      isDiscovered
                        ? 'bg-green-100 border border-green-300'
                        : 'bg-gray-100 opacity-50'
                    }`}
                  >
                    <div className="font-bold">
                      {isDiscovered ? reaction.name : '???'}
                    </div>
                    {isDiscovered && (
                      <div className="text-xs text-gray-600 mt-1">
                        {reaction.description}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Lab Area */}
        <div className="lg:col-span-2">
          {!isPlaying ? (
            <motion.div
              className="bg-white rounded-3xl p-8 shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="text-center mb-8">
                <div className="text-8xl mb-4">🧪⚗️</div>
                <h2 className="text-3xl font-bold text-purple-800 mb-2">
                  Virtual Chemistry Lab
                </h2>
                <p className="text-purple-600 text-lg">
                  Mix chemicals and discover amazing reactions!
                </p>
              </div>

              <div className="bg-purple-50 rounded-2xl p-6 mb-8">
                <h3 className="font-bold text-purple-800 mb-4">How to Experiment:</h3>
                <ol className="space-y-2 text-purple-700">
                  <li>1. Select a chemical from the shelf</li>
                  <li>2. Pinch your thumb and index finger together</li>
                  <li>3. Move your hand over the beaker</li>
                  <li>4. Watch for reactions!</li>
                  <li>5. Try mixing different chemicals</li>
                </ol>
              </div>

              <button
                onClick={() => setIsPlaying(true)}
                className="w-full py-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xl font-bold rounded-2xl hover:from-purple-600 hover:to-blue-600 transition transform hover:scale-105"
              >
                Start Experimenting! 🔬
              </button>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {/* Camera + Canvas */}
              <div className="relative rounded-3xl overflow-hidden shadow-lg bg-black aspect-video">
                <Webcam
                  ref={webcamRef}
                  className="w-full h-full object-cover"
                  mirrored
                  videoConstraints={{ width: 640, height: 480 }}
                />
                <canvas
                  ref={canvasRef}
                  className="absolute top-0 left-0 w-full h-full pointer-events-none"
                  width={640}
                  height={480}
                />

                {/* UI Overlay */}
                <div className="absolute top-4 left-4 px-3 py-1 bg-black/50 backdrop-blur rounded-full">
                  <span className="text-white text-sm">
                    {isHandReady ? '✋ Hand Tracking Ready' : '⏳ Loading...'}
                  </span>
                </div>

                {selectedChemical && (
                  <div className="absolute top-4 right-4 px-3 py-2 bg-purple-500/80 backdrop-blur rounded-full">
                    <span className="text-white text-sm font-bold">
                      Selected: {selectedChemical.name}
                    </span>
                  </div>
                )}

                {/* Pouring indicator */}
                {isPouring && (
                  <motion.div
                    className="absolute bottom-1/2 left-1/2 transform -translate-x-1/2 text-4xl"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    💧
                  </motion.div>
                )}
              </div>

              {/* Controls */}
              <div className="flex gap-4">
                <button
                  onClick={clearBeaker}
                  className="flex-1 py-3 bg-red-100 text-red-700 rounded-xl font-bold hover:bg-red-200 transition"
                >
                  🗑️ Empty Beaker
                </button>
                <button
                  onClick={() => setIsPlaying(false)}
                  className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition"
                >
                  ⏹️ Stop
                </button>
              </div>

              {/* Beaker Contents Display */}
              {beakerContents.length > 0 && (
                <div className="bg-white rounded-2xl p-4 shadow">
                  <h3 className="font-bold text-purple-800 mb-2">Beaker Contents:</h3>
                  <div className="flex flex-wrap gap-2">
                    {beakerContents.map((content) => {
                      const chemical = CHEMICALS.find((c) => c.id === content.chemicalId);
                      return (
                        <span
                          key={content.chemicalId}
                          className="px-3 py-1 rounded-full text-sm font-medium"
                          style={{
                            backgroundColor: content.color,
                            color: content.chemicalId === 'baking-soda' ? '#333' : '#FFF',
                          }}
                        >
                          {chemical?.name}: {content.amount}ml
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Reaction Celebration */}
      <AnimatePresence>
        {showReactionEffect && lastReaction && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowReactionEffect(false)}
          >
            <motion.div
              className="bg-white rounded-3xl p-8 text-center shadow-2xl max-w-md mx-4"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
            >
              <div className="text-8xl mb-4">
                {lastReaction.effect === 'bubble' ? '🫧' : '🎉'}
              </div>
              <h2 className="text-3xl font-bold text-purple-800 mb-2">
                {lastReaction.name}!
              </h2>
              <p className="text-purple-600 text-lg mb-4">
                {lastReaction.description}
              </p>
              <div
                className="w-24 h-24 rounded-full mx-auto"
                style={{ backgroundColor: lastReaction.resultColor }}
              />
              <p className="text-sm text-gray-500 mt-4">Tap to continue</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default VirtualChemistryLab;
