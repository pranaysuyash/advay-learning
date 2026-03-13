/**
 * Dinosaur Dig Game
 *
 * Uncover dinosaur bones and assemble the skeleton!
 *
 * @ticket TCK-20260310-018
 */

import { memo, useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Webcam from 'react-webcam';
import { GameShell } from '../components/GameShell';
import { useAudio } from '../utils/hooks/useAudio';
import { useGameCompletion } from '../hooks/useGameCompletion';
import { useGameSessionProgress } from '../hooks/useGameSessionProgress';
import { useTTS } from '../hooks/useTTS';
import { useGameHandTracking } from '../hooks/useGameHandTracking';
import { triggerHaptic } from '../utils/haptics';
import { HandTrackingStatus } from '../components/game/HandTrackingStatus';
import { CameraThumbnail } from '../components/game/CameraThumbnail';
import type { TrackedHandFrame } from '../types/tracking';
import {
  DINOSAURS,
  type Dino,
  type DinoBone,
  getRandomDino,
  calculateScore,
  calculateStars,
} from '../games/dinosaurDigLogic';

const UNCOVER_TARGET = 80;
const CANVAS_W = 320;
const CANVAS_H = 320;
const BRUSH_RADIUS = 28;

function DinosaurDigGame() {
  const navigate = useNavigate();
  const [gameState, setGameState] = useState<'start' | 'digging' | 'assembling' | 'complete'>('start');
  const [currentDino, setCurrentDino] = useState<Dino | null>(null);
  const [uncoveredPercent, setUncoveredPercent] = useState(0);
  const [placedBones, setPlacedBones] = useState<DinoBone[]>([]);
  const [availableBones, setAvailableBones] = useState<DinoBone[]>([]);
  const [score, setScore] = useState(0);
  const [showDino, setShowDino] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const diggingRef = useRef<number>(0);

  // Hand tracking state
  const webcamRef = useRef<Webcam>(null);
  const [isHandDetected, setIsHandDetected] = useState(false);
  const lastHandStateRef = useRef(false);
  const handFrameCountRef = useRef(0);

  const { playSuccess, playCelebration, playClick } = useAudio();
  const { speak, isEnabled: ttsEnabled } = useTTS();
  const { completeGame } = useGameCompletion('dinosaur-dig');

  useGameSessionProgress({
    gameName: 'Dinosaur Dig',
    score,
    level: 1,
    isPlaying: gameState !== 'start' && gameState !== 'complete',
    metaData: { phase: gameState },
  });

  const speakText = useCallback((text: string) => {
    if (ttsEnabled) {
      speak(text);
    }
  }, [speak, ttsEnabled]);

  const startGame = () => {
    const dino = getRandomDino();
    setCurrentDino(dino);
    setUncoveredPercent(0);
    setPlacedBones([]);
    setAvailableBones([...dino.bones]);
    setScore(0);
    setShowDino(false);
    setGameState('digging');
    diggingRef.current = 0;
    playClick();
  };

  useEffect(() => {
    if (gameState === 'digging') {
      speakText('Swipe to brush away the dirt and uncover the fossils!');
    } else if (gameState === 'assembling') {
      speakText('Great! Now tap the bones to assemble the skeleton!');
    }
  }, [gameState, speakText]);

  // Initialize canvas with dirt layer when digging starts
  useEffect(() => {
    if (gameState !== 'digging') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = CANVAS_W;
    canvas.height = CANVAS_H;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Fill with dirt-colored layer
    const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_H);
    gradient.addColorStop(0, '#8B4513');
    gradient.addColorStop(0.5, '#A0522D');
    gradient.addColorStop(1, '#D2691E');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    // Add gritty texture dots
    ctx.fillStyle = 'rgba(0,0,0,0.1)';
    for (let i = 0; i < 200; i++) {
      const x = Math.random() * CANVAS_W;
      const y = Math.random() * CANVAS_H;
      ctx.beginPath();
      ctx.arc(x, y, Math.random() * 3 + 1, 0, Math.PI * 2);
      ctx.fill();
    }
  }, [gameState]);

  // Measure how much of the canvas has been cleared
  const measureUncover = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const data = ctx.getImageData(0, 0, CANVAS_W, CANVAS_H).data;
    let cleared = 0;
    // Check alpha channel every 4th pixel for speed
    for (let i = 3; i < data.length; i += 16) {
      if (data[i] === 0) cleared++;
    }
    const total = data.length / 16;
    const pct = Math.round((cleared / total) * 100);
    diggingRef.current = pct;
    setUncoveredPercent(pct);

    if (pct >= UNCOVER_TARGET) {
      playSuccess();
      triggerHaptic('success');
      setGameState('assembling');
      speakText('You found the fossils! Now tap them to assemble!');
    }
  }, [playSuccess, speakText]);

  // Brush away dirt at the given canvas-relative position
  const brushAt = useCallback((cx: number, cy: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(cx, cy, BRUSH_RADIUS, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
  }, []);

  const getCanvasPos = useCallback((clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((clientX - rect.left) / rect.width) * CANVAS_W,
      y: ((clientY - rect.top) / rect.height) * CANVAS_H,
    };
  }, []);

  const isDiggingActiveRef = useRef(false);

  const handleDigPointerDown = useCallback((e: React.PointerEvent) => {
    if (gameState !== 'digging') return;
    isDiggingActiveRef.current = true;
    const pos = getCanvasPos(e.clientX, e.clientY);
    if (pos) brushAt(pos.x, pos.y);
  }, [gameState, getCanvasPos, brushAt]);

  const handleDigPointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDiggingActiveRef.current) return;
    const pos = getCanvasPos(e.clientX, e.clientY);
    if (pos) brushAt(pos.x, pos.y);
  }, [getCanvasPos, brushAt]);

  const handleDigPointerUp = useCallback(() => {
    if (!isDiggingActiveRef.current) return;
    isDiggingActiveRef.current = false;
    measureUncover();
  }, [measureUncover]);

  // Hand tracking frame handler — brushes dirt during digging phase
  const handleHandFrame = useCallback((frame: TrackedHandFrame) => {
    if (gameState !== 'digging') return;
    const tip = frame.indexTip;

    if (tip) {
      const canvasX = tip.x * CANVAS_W;
      const canvasY = tip.y * CANVAS_H;
      brushAt(canvasX, canvasY);

      // Throttle measureUncover to every 10th frame
      handFrameCountRef.current += 1;
      if (handFrameCountRef.current % 10 === 0) {
        measureUncover();
      }

      if (!lastHandStateRef.current) {
        setIsHandDetected(true);
        lastHandStateRef.current = true;
      }
    } else {
      if (lastHandStateRef.current) {
        setIsHandDetected(false);
        lastHandStateRef.current = false;
      }
    }
  }, [gameState, brushAt, measureUncover]);

  const { isReady, isLoading, startTracking } = useGameHandTracking({
    gameName: 'DinosaurDig',
    webcamRef,
    onFrame: handleHandFrame,
    isRunning: gameState === 'digging' || gameState === 'assembling',
  });

  // Auto-start hand tracking when digging or assembling begins
  useEffect(() => {
    if ((gameState === 'digging' || gameState === 'assembling') && !isReady && !isLoading) {
      void startTracking();
    }
  }, [gameState, isReady, isLoading, startTracking]);

  const handleBoneClick = useCallback(async (bone: DinoBone) => {
    if (gameState !== 'assembling') return;

    playSuccess();
    triggerHaptic('success');

    const newPlaced = [...placedBones, bone];
    setPlacedBones(newPlaced);
    setAvailableBones(prev => prev.filter(b => b.id !== bone.id));

    const newScore = calculateScore(UNCOVER_TARGET, newPlaced.length);
    setScore(newScore);

    if (newPlaced.length >= (currentDino?.bones.length || 0)) {
      setShowDino(true);
      setGameState('complete');
      playCelebration();
      await completeGame({ score: newScore, completed: true, level: 1 });
      speakText(`You assembled a ${currentDino?.name}! Amazing!`);
    } else {
      speakText(`Found the ${bone.name}! Keep going!`);
    }
  }, [gameState, placedBones, currentDino, playSuccess, playCelebration, completeGame, speakText]);

  const handlePlayAgain = () => {
    startGame();
  };

  const handleFinish = () => {
    navigate('/games');
  };

  const stars = calculateStars(score);

  return (
    <div
      className="fixed inset-0 overflow-hidden"
      role="application"
      aria-label="Dinosaur Dig Game"
      style={{
        background: 'linear-gradient(180deg, #8B4513 0%, #D2691E 50%, #DEB887 100%)',
      }}
    >
      {/* Start Screen */}
      {gameState === 'start' && (
        <div className="flex flex-col items-center justify-center h-full p-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center"
          >
            <div className="text-8xl mb-4">🦕</div>
            <h1 className="text-4xl font-black text-amber-900 mb-4">
              Dinosaur Dig!
            </h1>
            <p className="text-xl text-amber-800 mb-8 max-w-md">
              Brush away the dirt to uncover fossils, then tap to assemble the dinosaur!
            </p>
          </motion.div>

          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {DINOSAURS.map((dino) => (
              <motion.div
                key={dino.id}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex items-center gap-2 bg-amber-100 rounded-2xl px-3 py-2 shadow-md"
              >
                <span className="text-2xl">{dino.emoji}</span>
                <span className="font-bold text-amber-800">{dino.name}</span>
              </motion.div>
            ))}
          </div>

          <button
            type="button"
            onClick={startGame}
            className="px-10 py-5 bg-amber-600 hover:bg-amber-700 text-white rounded-3xl font-black text-2xl shadow-lg transition-all transform hover:scale-105"
          >
            Start Digging! ⛏️
          </button>
        </div>
      )}

      {/* Digging Screen */}
      {gameState === 'digging' && (
        <div className="flex flex-col h-full">
          <CameraThumbnail webcamRef={webcamRef} isHandDetected={isHandDetected} visible={gameState === 'digging'} />
          <HandTrackingStatus
            isHandDetected={isHandDetected}
            pauseOnHandLost={true}
            voicePrompt={true}
            showMascot={true}
            compact={true}
          />
          {/* Header */}
          <div className="flex justify-between items-center p-4">
            <button
              type="button"
              onClick={() => navigate('/games')}
              className="px-4 py-2 bg-white/50 rounded-xl font-bold text-amber-800 shadow"
            >
              ← Exit
            </button>
            <div className="text-lg font-bold text-amber-100">
              Digging... {Math.min(100, Math.round(uncoveredPercent))}%
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-black/30 h-4 mx-4 rounded-full overflow-hidden mb-4" style={{ maxWidth: 'calc(100% - 2rem)' }}>
            <motion.div
              className="h-full bg-amber-500"
              animate={{ width: `${uncoveredPercent}%` }}
            />
          </div>

          {/* Dig area — canvas scratch-card over hidden fossil */}
          <div className="flex-1 flex flex-col items-center justify-center gap-4">
            <motion.div
              className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-amber-900/50"
              initial={{ scale: 0.8, opacity: 0.5 }}
              animate={{ scale: 1, opacity: 1 }}
              style={{ width: CANVAS_W, height: CANVAS_H }}
            >
              {/* Fossil underneath — revealed as canvas is scratched */}
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-[#DEB887] to-[#F5DEB3]">
                <div className="text-9xl select-none">{currentDino?.emoji}</div>
              </div>

              {/* Canvas dirt overlay — user scratches this away */}
              <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing touch-none"
                onPointerDown={handleDigPointerDown}
                onPointerMove={handleDigPointerMove}
                onPointerUp={handleDigPointerUp}
                onPointerLeave={handleDigPointerUp}
              />
            </motion.div>

            <p className="text-center text-amber-100 text-xl">
              {uncoveredPercent < 30 ? '⛏️ Swipe to brush away the dirt!' :
               uncoveredPercent < 60 ? '🦴 Almost there — keep digging!' :
               '✨ I see bones! A little more!'}
            </p>
          </div>
        </div>
      )}

      {/* Assembling Screen */}
      {gameState === 'assembling' && currentDino && (
        <div className="flex flex-col h-full">
          <CameraThumbnail webcamRef={webcamRef} isHandDetected={isHandDetected} visible={gameState === 'assembling'} />
          <HandTrackingStatus
            isHandDetected={isHandDetected}
            pauseOnHandLost={true}
            voicePrompt={true}
            showMascot={true}
            compact={true}
          />
          {/* Header */}
          <div className="flex justify-between items-center p-4">
            <button
              type="button"
              onClick={() => navigate('/games')}
              className="px-4 py-2 bg-white/50 rounded-xl font-bold text-amber-800 shadow"
            >
              ← Exit
            </button>
            <div className="text-lg font-bold text-amber-100">
              {placedBones.length} / {currentDino.bones.length} bones
            </div>
          </div>

          {/* Dino skeleton area */}
          <div className="flex-1 flex items-center justify-center">
            <div className="relative text-center">
              <div className="text-8xl mb-4">{currentDino.emoji}</div>
              
              {/* Placed bones */}
              <div className="flex flex-wrap justify-center gap-2">
                {placedBones.map((bone) => (
                  <motion.span
                    key={bone.id}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-2xl"
                  >
                    🦴
                  </motion.span>
                ))}
              </div>
            </div>
          </div>

          {/* Available bones */}
          <div className="p-4 bg-white/30">
            <p className="text-center text-amber-100 font-bold mb-2">Tap to place bones:</p>
            <div className="flex flex-wrap justify-center gap-3">
              {availableBones.map((bone) => (
                <motion.button
                  key={bone.id}
                  type="button"
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleBoneClick(bone)}
                  className="px-4 py-2 bg-amber-200 rounded-xl font-bold text-amber-800 shadow"
                >
                  🦴 {bone.name}
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Complete Screen */}
      {gameState === 'complete' && (
        <div className="flex flex-col items-center justify-center h-full p-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={showDino ? { scale: 1, rotate: [0, 10, -10, 0] } : { scale: 0.5 }}
              transition={{ repeat: showDino ? Infinity : 0, duration: 1 }}
              className="text-8xl mb-4"
            >
              {currentDino?.emoji}
            </motion.div>
            <h2 className="text-4xl font-black text-amber-900 mb-2">
              Dino Discovered!
            </h2>
            <p className="text-xl text-amber-800 mb-6">
              You found and assembled a {currentDino?.name}!
            </p>

            {/* Stars */}
            <div className="flex justify-center gap-2 mb-6 text-5xl">
              {[1, 2, 3, 4, 5].map((num) => (
                <motion.span
                  key={`star-d-${num}`}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: stars >= num ? 1 : 0.5, opacity: stars >= num ? 1 : 0.3 }}
                  transition={{ delay: num * 0.1 }}
                >
                  {stars >= num ? '⭐' : '☆'}
                </motion.span>
              ))}
            </div>

            {/* Score */}
            <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
              <p className="text-3xl font-black text-amber-600">Score: {score}</p>
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={handlePlayAgain}
                className="px-8 py-4 bg-amber-600 hover:bg-amber-700 text-white rounded-2xl font-bold text-xl shadow-lg transition-all"
              >
                Dig More!
              </button>
              <button
                type="button"
                onClick={handleFinish}
                className="px-8 py-4 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-2xl font-bold text-xl transition-all"
              >
                Finish
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

export const DinosaurDig = memo(function DinosaurDigComponent() {
  return (
    <GameShell
      gameId="dinosaur-dig"
      gameName="Dinosaur Dig"
      showWellnessTimer={true}
      enableErrorBoundary={true}
    >
      <DinosaurDigGame />
    </GameShell>
  );
});

export default DinosaurDig;
