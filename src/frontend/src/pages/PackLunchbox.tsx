/**
 * Pack Lunchbox Game
 *
 * Children pack a healthy lunchbox by dragging foods into the lunchbox.
 * Goal: Include fruit, vegetable, and protein - treats are optional!
 *
 * @ticket TCK-20260310-010
 */

import { memo, useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

import { useGameHandTracking } from '../hooks/useGameHandTracking';
import { GameCursor } from '../components/game/GameCursor';
import type { Point } from '../types/tracking';
import type { HandTrackingRuntimeMeta } from '../hooks/useHandTrackingRuntime';
import type { TrackedHandFrame } from '../utils/handTrackingFrame';

import {
  DragDropSystem,
  type DraggableItem,
  type DropZone,
} from '../components/game/DragDropSystem';
import { GameShell } from '../components/GameShell';
import { useAudio } from '../utils/hooks/useAudio';
import { useGameCompletion } from '../hooks/useGameCompletion';
import { useGameSessionProgress } from '../hooks/useGameSessionProgress';
import { useTTS } from '../hooks/useTTS';
import { triggerHaptic } from '../utils/haptics';
import {
  CATEGORY_INFO,
  type FoodItem,
  getFoodsForLevel,
  evaluateLunchbox,
  calculateScore,
  calculateStars,
} from '../games/packLunchboxLogic';
import type { ScreenCoordinate } from '../utils/coordinateTransform';

const LUNCHBOX_SLOTS = 4;

function PackLunchboxGame() {
  const navigate = useNavigate();
  const [gameState, setGameState] = useState<'start' | 'playing' | 'complete'>('start');
  const [currentLevel] = useState(1);
  const [items, setItems] = useState<DraggableItem[]>([]);
  const [dropZones, setDropZones] = useState<DropZone[]>([]);
  const [lunchboxItems, setLunchboxItems] = useState<FoodItem[]>([]);
  const [score, setScore] = useState(0);
  
  const [cursorPosition, setCursorPosition] = useState<ScreenCoordinate>({ x: 0, y: 0 });
  const [isPinching, setIsPinching] = useState(false);

  // Hand tracking state
  const [cursor, setCursor] = useState<Point | null>(null);
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const isPlaying = gameState === 'playing';

  const handleFrame = useCallback((frame: TrackedHandFrame, _meta: HandTrackingRuntimeMeta) => {
    const tip = frame.indexTip;
    if (!tip) { setCursor(null); return; }
    setCursor(tip);
    // Convert normalized coordinates to screen coordinates
    setCursorPosition({
      x: tip.x * window.innerWidth,
      y: tip.y * window.innerHeight,
    });
  }, []);

  const { isLoading: isModelLoading, isReady: isHandTrackingReady, startTracking } = useGameHandTracking({
    gameName: 'PackLunchbox',
    targetFps: 30,
    isRunning: isPlaying,
    onFrame: handleFrame,
    onNoVideoFrame: () => setCursor(null),
  });

  useEffect(() => {
    if (isPlaying && !isHandTrackingReady && !isModelLoading) {
      void startTracking();
    }
  }, [isPlaying, isHandTrackingReady, isModelLoading, startTracking]);

  const { playSuccess, playCelebration, playClick, playPop } = useAudio();
  const { speak, isEnabled: ttsEnabled } = useTTS();
  const { completeGame } = useGameCompletion('pack-lunchbox');

  useGameSessionProgress({
    gameName: 'Pack Lunchbox',
    score,
    level: currentLevel,
    isPlaying: gameState === 'playing',
    metaData: { itemsInLunchbox: lunchboxItems.length },
  });

  const speakText = useCallback((text: string) => {
    if (ttsEnabled) {
      speak(text);
    }
  }, [speak, ttsEnabled]);

  const initializeLevel = useCallback(() => {
    const availableFoods = getFoodsForLevel(currentLevel);
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    
    const itemSize = Math.min(screenWidth * 0.15, 100);
    const itemMargin = 10;
    const itemsPerRow = 4;
    
    const newItems: DraggableItem[] = availableFoods.map((food, idx) => ({
      id: food.id,
      x: (screenWidth * 0.1) + ((idx % itemsPerRow) * (itemSize + itemMargin)),
      y: screenHeight * 0.15 + (Math.floor(idx / itemsPerRow) * (itemSize + itemMargin)),
      size: itemSize,
      content: food.emoji,
      color: food.color,
      data: food,
    }));

    const lunchboxY = screenHeight * 0.6;
    const lunchboxSize = Math.min(screenWidth * 0.6, 300);
    const lunchboxX = (screenWidth - lunchboxSize) / 2;
    
    const newDropZones: DropZone[] = [
      {
        id: 'lunchbox',
        x: lunchboxX,
        y: lunchboxY,
        size: lunchboxSize,
        label: 'Lunchbox',
        color: '#FFB74D',
        isFilled: false,
      },
    ];

    setItems(newItems);
    setDropZones(newDropZones);
    setLunchboxItems([]);
    setScore(0);
  }, [currentLevel]);

  useEffect(() => {
    if (gameState === 'playing') {
      initializeLevel();
      speakText('Put the food in the lunchbox! One fruit, one vegetable, and one protein!');
    }
  }, [gameState, initializeLevel, speakText]);

  const handleItemPickup = useCallback((_item: DraggableItem) => {
    playPop();
  }, [playPop]);

  const handleItemDropped = useCallback((item: DraggableItem, _zone: DropZone) => {
    const food = item.data as FoodItem;
    
    if (lunchboxItems.length >= LUNCHBOX_SLOTS) {
      playClick();
      speakText('The lunchbox is full! Finish packing it!');
      return;
    }

    setLunchboxItems(prev => [...prev, food]);
    setItems(prev => prev.filter(i => i.id !== item.id));
    
    playSuccess();
    triggerHaptic('success');
    
    const newLunchboxItems = [...lunchboxItems, food];
    const result = evaluateLunchbox(newLunchboxItems);
    
    if (newLunchboxItems.length >= LUNCHBOX_SLOTS) {
      const finalScore = calculateScore(newLunchboxItems);
      setScore(finalScore);
      setGameState('complete');
      playCelebration();
      completeGame({ score: finalScore });
      if (result.isBalanced) {
        speakText('Perfect lunchbox! Perfectly balanced and complete!');
      } else {
        speakText('Lunchbox complete! Great job!');
      }
    } else if (result.isBalanced) {
      speakText('Great job! Your lunchbox is balanced!');
    } else {
      if (result.treats > 0 && result.treats >= newLunchboxItems.filter(f => f.category === 'treat').length) {
        speakText('Almost! Maybe add some fruit or vegetables?');
      } else if (result.fruits === 0 && result.vegetables === 0) {
        speakText('Add some fruit or vegetables!');
      } else if (result.proteins === 0) {
        speakText('Add some protein like chicken or egg!');
      } else {
        speakText('Looking good! Keep going!');
      }
    }
  }, [lunchboxItems, playSuccess, playCelebration, playClick, speakText, completeGame]);

  const handleItemDroppedOutside = useCallback((_item: DraggableItem) => {
    playClick();
  }, [playClick]);

  const handleStart = () => {
    setGameState('playing');
    playClick();
  };

  const handlePlayAgain = () => {
    setLunchboxItems([]);
    setGameState('playing');
    playClick();
  };

  const handleFinish = () => {
    navigate('/games');
  };

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    setCursorPosition({ x: e.clientX, y: e.clientY });
  }, []);

  const handleMouseDown = useCallback(() => {
    setIsPinching(true);
  }, []);

  const handleMouseUp = useCallback(() => {
    setIsPinching(false);
  }, []);

  const stars = calculateStars(score);
  const lunchboxResult = evaluateLunchbox(lunchboxItems);

  return (
    <div
      ref={gameAreaRef}
      className="fixed inset-0 overflow-hidden"
      role="application"
      aria-label="Pack Lunchbox Game"
      style={{
        background: 'linear-gradient(180deg, #E8F5E9 0%, #C8E6C9 100%)',
      }}
      onMouseMove={handleMouseMove}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
    >
      {/* Start Screen */}
      {gameState === 'start' && (
        <div className="flex flex-col items-center justify-center h-full p-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center"
          >
            <div className="text-8xl mb-4">🍱</div>
            <h1 className="text-4xl font-black text-green-700 mb-4">
              Pack Lunchbox!
            </h1>
            <p className="text-xl text-green-600 mb-8 max-w-md">
              Put healthy foods in your lunchbox! Try to include fruit, vegetables, and protein!
            </p>
          </motion.div>

          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {Object.entries(CATEGORY_INFO).map(([category, info]) => (
              <motion.div
                key={category}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex items-center gap-2 bg-white rounded-2xl px-4 py-2 shadow-md"
              >
                <span className="text-2xl">{info.emoji}</span>
                <span className="font-bold text-green-700">{info.name}</span>
              </motion.div>
            ))}
          </div>

          <button
            type="button"
            onClick={handleStart}
            className="px-10 py-5 bg-green-500 hover:bg-green-600 text-white rounded-3xl font-black text-2xl shadow-lg transition-all transform hover:scale-105"
          >
            Start Packing! 📦
          </button>
        </div>
      )}

      {/* Playing Screen */}
      {gameState === 'playing' && (
        <div className="relative h-full">
          {/* Header */}
          <div className="flex justify-between items-center p-4">
            <button
              type="button"
              onClick={() => navigate('/games')}
              className="px-4 py-2 bg-white rounded-xl font-bold text-green-600 shadow"
            >
              ← Exit
            </button>
            <div className="flex gap-2">
              {lunchboxItems.map((item, idx) => (
                <motion.span
                  key={`${item.id}-${idx}`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-3xl"
                >
                  {item.emoji}
                </motion.span>
              ))}
              {[...Array(LUNCHBOX_SLOTS - lunchboxItems.length)].map((_, idx) => (
                <span key={`empty-slot-${lunchboxItems.length + idx}`} className="text-3xl opacity-30">
                  ⬜
                </span>
              ))}
            </div>
          </div>

          {/* Instructions */}
          <div className="text-center mb-2">
            <p className="text-lg font-bold text-green-700">
              {lunchboxItems.length >= LUNCHBOX_SLOTS 
                ? 'Lunchbox is full!' 
                : 'Drag food into the lunchbox!'}
            </p>
            <p className="text-sm text-green-600">
              {lunchboxResult.fruits > 0 && '✓ Fruit'} {' '}
              {lunchboxResult.vegetables > 0 && '✓ Vegetables'} {' '}
              {lunchboxResult.proteins > 0 && '✓ Protein'}
            </p>
          </div>

          {/* Drag and Drop */}
          <DragDropSystem
            items={items}
            dropZones={dropZones}
            cursorPosition={cursorPosition}
            isPinching={isPinching}
            onItemPickup={handleItemPickup}
            onItemDropped={handleItemDropped}
            onItemDroppedOutside={handleItemDroppedOutside}
            enableMagneticSnap={true}
            magneticThreshold={100}
          />

          {/* Lunchbox visual */}
          <motion.div
            className="absolute left-1/2 transform -translate-x-1/2"
            style={{ bottom: '5%' }}
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            <div className="text-6xl">🍱</div>
          </motion.div>

          {/* Cursor indicator */}
          <div
            className="fixed pointer-events-none"
            style={{
              left: cursorPosition.x,
              top: cursorPosition.y,
              transform: 'translate(-50%, -50%)',
            }}
          >
            <motion.div
              animate={{ scale: isPinching ? 0.8 : 1 }}
              className="w-16 h-16 bg-yellow-400 rounded-full opacity-50"
            />
          </div>

          {/* GameCursor for hand tracking */}
          {cursor && (
            <GameCursor
              position={cursor}
              coordinateSpace='normalized'
              containerRef={gameAreaRef}
              isPinching={isPinching}
              isHandDetected={true}
              size={64}
              color='#4CAF50'
            />
          )}
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
            <div className="text-8xl mb-4">🎉</div>
            <h2 className="text-4xl font-black text-green-600 mb-2">
              Lunchbox Packed!
            </h2>
            <p className="text-xl text-green-600 mb-6">
              Great job making a healthy lunch!
            </p>

            {/* Stars */}
            <div className="flex justify-center gap-2 mb-6 text-5xl">
              {[...Array(5)].map((_, i) => (
                <motion.span
                  key={`star-${i}`}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ 
                    scale: i < stars ? 1 : 0.5, 
                    opacity: i < stars ? 1 : 0.3 
                  }}
                  transition={{ delay: i * 0.1 }}
                >
                  {i < stars ? '⭐' : '☆'}
                </motion.span>
              ))}
            </div>

            {/* Score */}
            <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
              <p className="text-3xl font-black text-green-600">Score: {score}</p>
              <div className="flex justify-center gap-4 mt-4 text-lg">
                <span className={lunchboxResult.fruits > 0 ? 'text-green-600' : 'text-gray-400'}>
                  🍎 {lunchboxResult.fruits} Fruit
                </span>
                <span className={lunchboxResult.vegetables > 0 ? 'text-green-600' : 'text-gray-400'}>
                  🥦 {lunchboxResult.vegetables} Veggie
                </span>
                <span className={lunchboxResult.proteins > 0 ? 'text-green-600' : 'text-gray-400'}>
                  🍗 {lunchboxResult.proteins} Protein
                </span>
                <span className={lunchboxResult.treats > 0 ? 'text-yellow-600' : 'text-gray-400'}>
                  🍪 {lunchboxResult.treats} Treat
                </span>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={handlePlayAgain}
                className="px-8 py-4 bg-green-500 hover:bg-green-600 text-white rounded-2xl font-bold text-xl shadow-lg transition-all"
              >
                Play Again
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

export const PackLunchbox = memo(function PackLunchboxComponent() {
  return (
    <GameShell
      gameId="pack-lunchbox"
      gameName="Pack Lunchbox"
      showWellnessTimer={true}
      enableErrorBoundary={true}
    >
      <PackLunchboxGame />
    </GameShell>
  );
});

export default PackLunchbox;
