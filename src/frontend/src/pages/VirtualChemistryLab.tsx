import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Webcam from 'react-webcam';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameHandTracking } from '../hooks/useGameHandTracking';
import type { HandTrackingRuntimeMeta } from '../hooks/useHandTrackingRuntime';
import { useSoundEffects } from '../hooks/useSoundEffects';
import { useTTS } from '../hooks/useTTS';
import type { TrackedHandFrame } from '../utils/handTrackingFrame';


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

  const detectHand = useCallback(
    (frame: TrackedHandFrame, _meta: HandTrackingRuntimeMeta) => {
      if (!isPlaying) return;

      if (frame.hands.length > 0) {
        const landmarks = frame.hands[0];
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
    },
    [isPlaying, selectedChemical, isPouring, bubbles],
  );

  const {
    isLoading: isHandLoading,
    isReady: isHandReady,
    startTracking,
  } = useGameHandTracking({
    gameName: 'VirtualChemistryLab',
    webcamRef,
    handTracking: {
      numHands: 1,
      minDetectionConfidence: 0.3,
      minHandPresenceConfidence: 0.3,
      minTrackingConfidence: 0.3,
      delegate: 'GPU',
      enableFallback: true,
    },
    isRunning: isPlaying,
    onFrame: detectHand,
  });

  useEffect(() => {
    if (isPlaying && !isHandReady && !isHandLoading) {
      void startTracking();
    }
  }, [isHandLoading, isHandReady, isPlaying, startTracking]);

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
      <div className='min-h-[100dvh] bg-[#FFF8F0] flex items-center justify-center p-4'>
        <motion.div
          className='bg-white rounded-[2.5rem] border-4 border-slate-100 p-12 text-center max-w-md w-full shadow-sm'
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className='text-6xl mb-6'>🧪</div>
          <h2 className='text-3xl font-black text-slate-800 tracking-tight mb-2'>
            Loading Chemistry Lab
          </h2>
          <p className='text-slate-500 font-bold'>Getting safety goggles ready...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className='min-h-[100dvh] bg-[#FFF8F0] p-4 md:p-8 font-sans'>
      {/* Header */}
      <header className='flex justify-between items-center mb-6 max-w-7xl mx-auto'>
        <button
          onClick={() => navigate('/dashboard')}
          className='flex items-center gap-2 px-6 py-3 bg-white hover:bg-slate-50 border-4 border-slate-100 rounded-[1.5rem] font-bold text-slate-500 transition-colors shadow-sm'
        >
          <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={3} d='M10 19l-7-7m0 0l7-7m-7 7h18' /></svg>
          <span className='hidden sm:inline'>Back</span>
        </button>
        <h1 className='text-3xl md:text-4xl font-black text-slate-800 tracking-tight text-center flex-1'>
          Virtual Chemistry Lab
        </h1>
        <div className='bg-amber-50 border-4 border-amber-100 px-6 py-3 rounded-[1.5rem] font-black text-amber-500 text-xl shadow-sm flex items-center gap-2'>
          ⭐ {score}
        </div>
      </header>

      <div className='max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Chemical Shelf */}
        <div className='lg:col-span-1 space-y-6'>
          <div className='bg-white rounded-[2.5rem] border-4 border-slate-100 p-6 shadow-sm'>
            <h2 className='text-2xl font-black text-slate-800 tracking-tight mb-2'>Chemical Shelf</h2>
            <p className='text-slate-500 font-bold mb-6'>
              Select a chemical, then pinch your fingers over the beaker to pour!
            </p>

            <div className='grid grid-cols-2 gap-3'>
              {CHEMICALS.map((chemical) => (
                <motion.button
                  key={chemical.id}
                  onClick={() => setSelectedChemical(chemical)}
                  className={`p-4 rounded-[1.5rem] border-4 transition-all text-left ${selectedChemical?.id === chemical.id
                    ? 'border-[#3B82F6] bg-blue-50'
                    : 'border-slate-100 hover:border-slate-300 bg-white'
                    }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div
                    className='w-12 h-12 rounded-full mb-3 shadow-inner'
                    style={{ backgroundColor: chemical.color }}
                  />
                  <div className='text-sm font-black text-slate-700 tracking-wide'>{chemical.symbol}</div>
                  <div className='text-xs font-bold text-slate-500 truncate'>{chemical.name}</div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Discovery Book */}
          <div className='bg-white rounded-[2.5rem] border-4 border-slate-100 p-6 shadow-sm'>
            <div className='flex justify-between items-center mb-4'>
              <h2 className='text-2xl font-black text-slate-800 tracking-tight'>
                Discovery Book 📖
              </h2>
              <span className='bg-[#10B981]/10 text-[#10B981] px-3 py-1 rounded-full text-sm font-black'>
                {discoveredReactions.size}/{REACTIONS.length}
              </span>
            </div>
            <div className='space-y-3 max-h-64 overflow-y-auto pr-2'>
              {REACTIONS.map((reaction) => {
                const isDiscovered = discoveredReactions.has(reaction.id);
                return (
                  <div
                    key={reaction.id}
                    className={`p-4 rounded-[1.5rem] border-4 transition-colors ${isDiscovered
                      ? 'bg-emerald-50 border-emerald-100'
                      : 'bg-slate-50 border-slate-100 opacity-60'
                      }`}
                  >
                    <div className={`font-black text-lg ${isDiscovered ? 'text-[#10B981]' : 'text-slate-400'}`}>
                      {isDiscovered ? reaction.name : 'Unknown Reaction'}
                    </div>
                    {isDiscovered && (
                      <div className='text-sm font-bold text-emerald-600/80 mt-1'>
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
        <div className='lg:col-span-2 flex flex-col'>
          {!isPlaying ? (
            <motion.div
              className='bg-white rounded-[2.5rem] border-4 border-slate-100 p-8 md:p-12 shadow-sm flex flex-col items-center justify-center flex-1 text-center'
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className='text-[7rem] mb-6 drop-shadow-sm hover:scale-110 transition-transform'>🧪⚗️</div>
              <h2 className='text-4xl md:text-5xl font-black text-[#10B981] tracking-tight mb-4'>
                Virtual Chemistry Lab
              </h2>
              <p className='text-slate-500 text-xl font-bold mb-10 max-w-lg'>
                Mix chemicals and discover amazing reactions!
              </p>

              <div className='bg-[#FFF8F0] border-4 border-slate-100 rounded-[2rem] p-8 mb-10 w-full text-left'>
                <h3 className='font-black text-slate-700 text-2xl mb-4'>How to Experiment:</h3>
                <ul className='space-y-3 text-slate-600 font-bold text-lg'>
                  <li className='flex items-center gap-3'><span className='text-2xl'>1️⃣</span> Select a chemical from the shelf</li>
                  <li className='flex items-center gap-3'><span className='text-2xl'>2️⃣</span> Pinch your thumb and index finger together</li>
                  <li className='flex items-center gap-3'><span className='text-2xl'>3️⃣</span> Move your hand over the beaker to pour</li>
                  <li className='flex items-center gap-3'><span className='text-2xl'>4️⃣</span> Discover amazing reactions!</li>
                </ul>
              </div>

              <button
                onClick={() => setIsPlaying(true)}
                className='w-full max-w-md py-5 bg-[#3B82F6] hover:bg-blue-600 border-4 border-blue-200 hover:border-blue-300 text-white text-2xl font-black rounded-full shadow-sm transition-transform hover:scale-[1.02] active:scale-95'
              >
                Start Experimenting! 🔬
              </button>
            </motion.div>
          ) : (
            <div className='flex flex-col h-full space-y-6'>
              {/* Camera + Canvas */}
              <div className='relative rounded-[2.5rem] overflow-hidden border-4 border-slate-100 shadow-sm bg-slate-100 flex-1 min-h-[400px]'>
                <Webcam
                  ref={webcamRef}
                  className='absolute inset-0 w-full h-full object-cover'
                  mirrored
                  videoConstraints={{ facingMode: 'user' }}
                />
                <canvas
                  ref={canvasRef}
                  className='absolute inset-0 w-full h-full pointer-events-none'
                  width={640}
                  height={480}
                />

                {/* UI Overlay */}
                <div className='absolute top-6 left-6 px-4 py-2 bg-black/40 backdrop-blur-md rounded-full border border-white/20'>
                  <span className='text-white font-bold text-sm tracking-wide'>
                    {isHandReady ? '✅ Hand Tracking Ready' : '⏳ Loading...'}
                  </span>
                </div>

                {selectedChemical && (
                  <div className='absolute top-6 right-6 px-6 py-3 bg-[#3B82F6] backdrop-blur-md rounded-full border-4 border-blue-400 shadow-sm'>
                    <span className='text-white font-black tracking-wide'>
                      Selected: {selectedChemical.name}
                    </span>
                  </div>
                )}

                {/* Pouring indicator */}
                {isPouring && (
                  <motion.div
                    className='absolute bottom-1/2 left-1/2 transform -translate-x-1/2 text-6xl drop-shadow-md'
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    💧
                  </motion.div>
                )}
              </div>

              {/* Controls */}
              <div className='flex gap-4'>
                <button
                  onClick={clearBeaker}
                  className='flex-1 py-4 bg-red-50 hover:bg-red-100 border-4 border-red-200 text-red-600 rounded-[1.5rem] font-black text-lg transition-colors'
                >
                  🗑️ Empty Beaker
                </button>
                <button
                  onClick={() => setIsPlaying(false)}
                  className='flex-1 py-4 bg-white hover:bg-slate-50 border-4 border-slate-100 text-slate-500 rounded-[1.5rem] font-black text-lg transition-colors'
                >
                  ⏹️ Stop Experiment
                </button>
              </div>

              {/* Beaker Contents Display */}
              {beakerContents.length > 0 && (
                <div className='bg-white rounded-[2rem] border-4 border-slate-100 p-6 shadow-sm'>
                  <h3 className='font-black text-slate-800 mb-4 text-xl'>Beaker Contents:</h3>
                  <div className='flex flex-wrap gap-3'>
                    {beakerContents.map((content) => {
                      const chemical = CHEMICALS.find((c) => c.id === content.chemicalId);
                      return (
                        <span
                          key={content.chemicalId}
                          className='px-4 py-2 rounded-full text-base font-bold shadow-sm border border-black/5'
                          style={{
                            backgroundColor: content.color,
                            color: content.chemicalId === 'baking-soda' || content.chemicalId === 'vinegar' ? '#333' : '#FFF',
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
            className='fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowReactionEffect(false)}
          >
            <motion.div
              className='bg-white rounded-[3rem] border-4 border-slate-100 p-12 text-center shadow-2xl max-w-md w-full'
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
            >
              <div className='text-[7rem] mb-6 drop-shadow-sm'>
                {lastReaction.effect === 'bubble' ? '🫧' : '🎉'}
              </div>
              <h2 className='text-4xl font-black text-[#10B981] mb-4 tracking-tight'>
                {lastReaction.name}!
              </h2>
              <p className='text-slate-500 font-bold text-xl mb-8'>
                {lastReaction.description}
              </p>
              <div
                className='w-32 h-32 rounded-full mx-auto border-4 border-slate-100 shadow-inner'
                style={{ backgroundColor: lastReaction.resultColor }}
              />
              <p className='text-sm font-bold text-slate-400 mt-8 uppercase tracking-widest'>Tap to see more</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default VirtualChemistryLab;
