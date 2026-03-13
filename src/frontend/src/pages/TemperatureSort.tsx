/**
 * Temperature Sort Game
 *
 * Children sort items by temperature: hot, warm, or cold.
 *
 * @ticket TCK-20260310-012
 */

import { memo, useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  DragDropSystem,
  type DraggableItem,
  type DropZone,
} from '../components/game/DragDropSystem';
import { GameShell } from '../components/GameShell';
import { useAudio } from '../utils/hooks/useAudio';
import { useGameDrops } from '../hooks/useGameDrops';
import { useGameProgress } from '../hooks/useGameProgress';
import { useGameSessionProgress } from '../hooks/useGameSessionProgress';
import { useTTS } from '../hooks/useTTS';
import { triggerHaptic } from '../utils/haptics';
import { KenneyIcon } from '../components/ui/KenneyIcon';
import {
  TEMPERATURE_ZONES,
  type TemperatureItem,
  type TemperatureCategory,
  getItemsForLevel,
  calculateScore,
  calculateStars,
} from '../games/temperatureSortLogic';
import type { ScreenCoordinate } from '../utils/coordinateTransform';

const ITEMS_TO_SORT = 6;

function TemperatureSortGame() {
  const navigate = useNavigate();
  const [gameState, setGameState] = useState<'start' | 'playing' | 'complete'>('start');
  const [currentLevel] = useState(1);
  const [items, setItems] = useState<DraggableItem[]>([]);
  const [dropZones, setDropZones] = useState<DropZone[]>([]);
  const [sortedItems, setSortedItems] = useState<Record<TemperatureCategory, TemperatureItem[]>>({
    hot: [],
    warm: [],
    cold: [],
  });
  const [score, setScore] = useState(0);
  
  const [cursorPosition, setCursorPosition] = useState<ScreenCoordinate>({ x: 0, y: 0 });
  const [isPinching, setIsPinching] = useState(false);

  const { playSuccess, playCelebration, playClick, playPop } = useAudio();
  const { speak, isEnabled: ttsEnabled } = useTTS();
  const { onGameComplete } = useGameDrops('temperature-sort');
  const { saveProgress } = useGameProgress('temperature-sort');

  useGameSessionProgress({
    gameName: 'Temperature Sort',
    score,
    level: currentLevel,
    isPlaying: gameState === 'playing',
    metaData: { itemsSorted: Object.values(sortedItems).flat().length },
  });

  const speakText = useCallback((text: string) => {
    if (ttsEnabled) {
      speak(text);
    }
  }, [speak, ttsEnabled]);

  const initializeLevel = useCallback(() => {
    const availableItems = getItemsForLevel(currentLevel);
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    
    const itemSize = Math.min(screenWidth * 0.12, 80);
    const itemMargin = 8;
    const itemsPerRow = 3;
    
    const newItems: DraggableItem[] = availableItems.map((item, idx) => ({
      id: item.id,
      x: screenWidth * 0.02 + ((idx % itemsPerRow) * (itemSize + itemMargin)),
      y: screenHeight * 0.02 + (Math.floor(idx / itemsPerRow) * (itemSize + itemMargin)),
      size: itemSize,
      content: item.emoji,
      color: item.color,
      data: item,
    }));

    const zoneWidth = screenWidth * 0.28;
    const zoneY = screenHeight * 0.5;
    const zoneGap = screenWidth * 0.03;
    
    const newDropZones: DropZone[] = [
      {
        id: 'hot-zone',
        x: screenWidth * 0.05,
        y: zoneY,
        size: zoneWidth,
        label: 'Hot',
        color: TEMPERATURE_ZONES.hot.color,
      },
      {
        id: 'warm-zone',
        x: screenWidth * 0.05 + zoneWidth + zoneGap,
        y: zoneY,
        size: zoneWidth,
        label: 'Warm',
        color: TEMPERATURE_ZONES.warm.color,
      },
      {
        id: 'cold-zone',
        x: screenWidth * 0.05 + (zoneWidth + zoneGap) * 2,
        y: zoneY,
        size: zoneWidth,
        label: 'Cold',
        color: TEMPERATURE_ZONES.cold.color,
      },
    ];

    setItems(newItems);
    setDropZones(newDropZones);
    setSortedItems({ hot: [], warm: [], cold: [] });
    setScore(0);
  }, [currentLevel]);

  useEffect(() => {
    if (gameState === 'playing') {
      initializeLevel();
      speakText('Sort the items! Drag hot things to hot, warm to warm, cold to cold!');
    }
  }, [gameState, initializeLevel, speakText]);

  const handleItemPickup = useCallback((_item: DraggableItem) => {
    playPop();
  }, [playPop]);

  const handleItemDropped = useCallback((item: DraggableItem, zone: DropZone) => {
    const tempItem = item.data as TemperatureItem;
    let category: TemperatureCategory;
    
    if (zone.id === 'hot-zone') category = 'hot';
    else if (zone.id === 'warm-zone') category = 'warm';
    else category = 'cold';
    
    setSortedItems(prev => ({
      ...prev,
      [category]: [...prev[category], tempItem],
    }));
    setItems(prev => prev.filter(i => i.id !== item.id));
    
    playSuccess();
    triggerHaptic('success');
    
    const totalSorted = Object.values(sortedItems).flat().length + 1;
    
    if (totalSorted >= ITEMS_TO_SORT) {
      const finalScore = calculateScore(ITEMS_TO_SORT, ITEMS_TO_SORT);
      setScore(finalScore);
      setGameState('complete');
      playCelebration();
      (async () => {
        await saveProgress({ score: finalScore, completed: true, level: 1 });
        onGameComplete(calculateStars(finalScore, ITEMS_TO_SORT));
      })();
      speakText('Great job sorting all the temperatures!');
    } else {
      speakText('Good! Keep going!');
    }
  }, [sortedItems, playSuccess, playCelebration, speakText, onGameComplete]);

  const handleItemDroppedOutside = useCallback((_item: DraggableItem) => {
    playClick();
  }, [playClick]);

  const handleStart = () => {
    setGameState('playing');
    playClick();
  };

  const handlePlayAgain = () => {
    setSortedItems({ hot: [], warm: [], cold: [] });
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

  const totalSorted = Object.values(sortedItems).flat().length;
  const stars = calculateStars(score, ITEMS_TO_SORT);

  return (
    <div 
      className="fixed inset-0 overflow-hidden"
      role="application"
      aria-label="Temperature Sort Game"
      style={{
        background: 'linear-gradient(180deg, #E3F2FD 0%, #BBDEFB 100%)',
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
            <div className="text-8xl mb-4">🌡️</div>
            <h1 className="text-4xl font-black text-blue-700 mb-4">
              Temperature Sort!
            </h1>
            <p className="text-xl text-blue-600 mb-8 max-w-md">
              Sort items into hot, warm, and cold groups!
            </p>
          </motion.div>

          <div className="flex flex-wrap justify-center gap-3 mb-8">
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex items-center gap-2 bg-white rounded-2xl px-4 py-2 shadow-md"
            >
              <span className="text-2xl">☀️</span>
              <span className="font-bold text-red-500">Hot</span>
            </motion.div>
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="flex items-center gap-2 bg-white rounded-2xl px-4 py-2 shadow-md"
            >
              <span className="text-2xl">🌤️</span>
              <span className="font-bold text-yellow-600">Warm</span>
            </motion.div>
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-2 bg-white rounded-2xl px-4 py-2 shadow-md"
            >
              <span className="text-2xl">❄️</span>
              <span className="font-bold text-blue-500">Cold</span>
            </motion.div>
          </div>

          <button
            type="button"
            onClick={handleStart}
            className="px-10 py-5 bg-blue-500 hover:bg-blue-600 text-white rounded-3xl font-black text-2xl shadow-lg transition-all transform hover:scale-105"
          >
            Start Sorting!
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
              className="px-4 py-2 bg-white rounded-xl font-bold text-blue-600 shadow"
            >
              ← Exit
            </button>
            <div className="text-lg font-bold text-blue-700">
              {totalSorted} / {ITEMS_TO_SORT} sorted
            </div>
          </div>

          {/* Temperature Zones */}
          <div className="flex justify-around items-end px-2 py-4"
            style={{ height: '40%' }}
          >
            {(['hot', 'warm', 'cold'] as TemperatureCategory[]).map(cat => (
              <div
                key={cat}
                className="rounded-2xl p-3 flex flex-col items-center"
                style={{ 
                  backgroundColor: TEMPERATURE_ZONES[cat].color + '40',
                  width: '30%',
                  height: '100%',
                }}
              >
                <span className="text-4xl mb-2">{TEMPERATURE_ZONES[cat].emoji}</span>
                <span className="font-bold text-lg text-gray-700">{TEMPERATURE_ZONES[cat].name}</span>
                <div className="flex flex-wrap justify-center gap-1 mt-2">
                  {sortedItems[cat].map((item, idx) => (
                    <span key={`${item.id}-${idx}`} className="text-2xl">{item.emoji}</span>
                  ))}
                </div>
              </div>
            ))}
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
            magneticThreshold={80}
          />

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
            <div className="flex justify-center mb-4"><KenneyIcon type='star' size={80} /></div>
            <h2 className="text-4xl font-black text-blue-600 mb-2">
              All Sorted!
            </h2>
            <p className="text-xl text-blue-600 mb-6">
              Great job with temperatures!
            </p>

            {/* Stars */}
            <div className="flex justify-center gap-2 mb-6 text-5xl">
              <motion.span
                key="star-t-0"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: stars >= 1 ? 1 : 0.5, opacity: stars >= 1 ? 1 : 0.3 }}
              >
                {stars >= 1 ? <KenneyIcon type='star' size={32} /> : <KenneyIcon type='heart_empty' size={32} />}
              </motion.span>
              <motion.span
                key="star-t-1"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: stars >= 2 ? 1 : 0.5, opacity: stars >= 2 ? 1 : 0.3 }}
                transition={{ delay: 0.1 }}
              >
                {stars >= 2 ? <KenneyIcon type='star' size={32} /> : <KenneyIcon type='heart_empty' size={32} />}
              </motion.span>
              <motion.span
                key="star-t-2"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: stars >= 3 ? 1 : 0.5, opacity: stars >= 3 ? 1 : 0.3 }}
                transition={{ delay: 0.2 }}
              >
                {stars >= 3 ? <KenneyIcon type='star' size={32} /> : <KenneyIcon type='heart_empty' size={32} />}
              </motion.span>
              <motion.span
                key="star-t-3"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: stars >= 4 ? 1 : 0.5, opacity: stars >= 4 ? 1 : 0.3 }}
                transition={{ delay: 0.3 }}
              >
                {stars >= 4 ? <KenneyIcon type='star' size={32} /> : <KenneyIcon type='heart_empty' size={32} />}
              </motion.span>
              <motion.span
                key="star-t-4"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: stars >= 5 ? 1 : 0.5, opacity: stars >= 5 ? 1 : 0.3 }}
                transition={{ delay: 0.4 }}
              >
                {stars >= 5 ? <KenneyIcon type='star' size={32} /> : <KenneyIcon type='heart_empty' size={32} />}
              </motion.span>
            </div>

            {/* Score */}
            <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
              <p className="text-3xl font-black text-blue-600">Score: {score}</p>
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={handlePlayAgain}
                className="px-8 py-4 bg-blue-500 hover:bg-blue-600 text-white rounded-2xl font-bold text-xl shadow-lg transition-all"
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

export const TemperatureSort = memo(function TemperatureSortComponent() {
  return (
    <GameShell
      gameId="temperature-sort"
      gameName="Temperature Sort"
      showWellnessTimer={true}
      enableErrorBoundary={true}
    >
      <TemperatureSortGame />
    </GameShell>
  );
});

export default TemperatureSort;
