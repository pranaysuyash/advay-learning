/**
 * Set the Table Game
 *
 * Children learn to set a table by dragging utensils to correct positions.
 *
 * @ticket TCK-20260310-011
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
  type UtensilItem,
  getUtensilsForLevel,
  calculateScore,
  calculateStars,
} from '../games/setTableLogic';
import type { ScreenCoordinate } from '../utils/coordinateTransform';

const TABLE_ITEMS_NEEDED = 4;

function SetTheTableGame() {
  const navigate = useNavigate();
  const [gameState, setGameState] = useState<'start' | 'playing' | 'complete'>('start');
  const [currentLevel] = useState(1);
  const [items, setItems] = useState<DraggableItem[]>([]);
  const [dropZones, setDropZones] = useState<DropZone[]>([]);
  const [placedItems, setPlacedItems] = useState<UtensilItem[]>([]);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  
  const [cursorPosition, setCursorPosition] = useState<ScreenCoordinate>({ x: 0, y: 0 });
  const [isPinching, setIsPinching] = useState(false);

  const { playSuccess, playCelebration, playClick, playPop } = useAudio();
  const { speak, isEnabled: ttsEnabled } = useTTS();
  const { onGameComplete } = useGameDrops('set-the-table');
  const { saveProgress } = useGameProgress('set-the-table');

  useGameSessionProgress({
    gameName: 'Set the Table',
    score,
    level: currentLevel,
    isPlaying: gameState === 'playing',
    metaData: { itemsPlaced: placedItems.length },
  });

  const speakText = useCallback((text: string) => {
    if (ttsEnabled) {
      speak(text);
    }
  }, [speak, ttsEnabled]);

  const initializeLevel = useCallback(() => {
    const availableUtensils = getUtensilsForLevel(currentLevel);
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    
    const itemSize = Math.min(screenWidth * 0.12, 90);
    const itemMargin = 8;
    const itemsPerRow = 3;
    
    const newItems: DraggableItem[] = availableUtensils.map((utensil, idx) => ({
      id: utensil.id,
      x: screenWidth * 0.05 + ((idx % itemsPerRow) * (itemSize + itemMargin)),
      y: screenHeight * 0.08 + (Math.floor(idx / itemsPerRow) * (itemSize + itemMargin)),
      size: itemSize,
      content: utensil.emoji,
      color: utensil.color,
      data: utensil,
    }));

    const tableY = screenHeight * 0.55;
    const tableWidth = Math.min(screenWidth * 0.85, 400);
    const tableHeight = tableWidth * 0.4;
    const tableX = (screenWidth - tableWidth) / 2;
    
    const spotSize = itemSize * 1.2;
    
    const newDropZones: DropZone[] = [
      {
        id: 'plate-spot',
        x: tableX + tableWidth * 0.5 - spotSize / 2,
        y: tableY + tableHeight * 0.3,
        size: spotSize,
        label: 'Plate',
        color: '#F5F5F5',
      },
      {
        id: 'fork-spot',
        x: tableX + tableWidth * 0.15,
        y: tableY + tableHeight * 0.35,
        size: spotSize,
        label: 'Fork',
        color: '#E8E8E8',
      },
      {
        id: 'knife-spot',
        x: tableX + tableWidth * 0.7,
        y: tableY + tableHeight * 0.35,
        size: spotSize,
        label: 'Knife',
        color: '#E8E8E8',
      },
      {
        id: 'cup-spot',
        x: tableX + tableWidth * 0.75,
        y: tableY + tableHeight * 0.1,
        size: spotSize * 0.8,
        label: 'Cup',
        color: '#B0E0E6',
      },
    ];

    setItems(newItems);
    setDropZones(newDropZones);
    setPlacedItems([]);
    setScore(0);
    setAttempts(0);
  }, [currentLevel]);

  useEffect(() => {
    if (gameState === 'playing') {
      initializeLevel();
      speakText('Put the fork on the left, knife on the right, plate in the middle!');
    }
  }, [gameState, initializeLevel, speakText]);

  const handleItemPickup = useCallback((_item: DraggableItem) => {
    playPop();
  }, [playPop]);

  const handleItemDropped = useCallback((item: DraggableItem, _zone: DropZone) => {
    const utensil = item.data as UtensilItem;
    
    if (placedItems.length >= TABLE_ITEMS_NEEDED) {
      playClick();
      speakText('Table is all set! Great job!');
      return;
    }

    const newPlaced = [...placedItems, utensil];
    setPlacedItems(newPlaced);
    setItems(prev => prev.filter(i => i.id !== item.id));
    
    playSuccess();
    triggerHaptic('success');
    
    if (newPlaced.length >= TABLE_ITEMS_NEEDED) {
      setAttempts(a => a + 1);
      const finalScore = calculateScore(newPlaced, attempts + 1);
      setScore(finalScore);
      setGameState('complete');
      playCelebration();
      (async () => {
        await saveProgress({ score: finalScore, completed: true, level: 1 });
        onGameComplete(calculateStars(finalScore));
      })();
      speakText('Table is all set! Good job!');
    } else {
      speakText('Good! Keep going!');
    }
  }, [placedItems, playSuccess, playCelebration, playClick, speakText, onGameComplete, attempts]);

  const handleItemDroppedOutside = useCallback((_item: DraggableItem) => {
    playClick();
  }, [playClick]);

  const handleStart = () => {
    setGameState('playing');
    playClick();
  };

  const handlePlayAgain = () => {
    setPlacedItems([]);
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

  return (
    <div 
      className="fixed inset-0 overflow-hidden"
      role="application"
      aria-label="Set the Table Game"
      style={{
        background: 'linear-gradient(180deg, #FFF8E1 0%, #FFECB3 100%)',
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
            <div className="text-8xl mb-4">🍽️</div>
            <h1 className="text-4xl font-black text-amber-700 mb-4">
              Set the Table!
            </h1>
            <p className="text-xl text-amber-600 mb-8 max-w-md">
              Learn to set the table! Fork on the left, knife on the right!
            </p>
          </motion.div>

          <div className="flex flex-wrap justify-center gap-3 mb-8">
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex items-center gap-2 bg-white rounded-2xl px-4 py-2 shadow-md"
            >
              <span className="text-2xl">🍴</span>
              <span className="font-bold text-amber-700">Fork - Left</span>
            </motion.div>
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="flex items-center gap-2 bg-white rounded-2xl px-4 py-2 shadow-md"
            >
              <span className="text-2xl">🍽️</span>
              <span className="font-bold text-amber-700">Plate - Center</span>
            </motion.div>
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-2 bg-white rounded-2xl px-4 py-2 shadow-md"
            >
              <span className="text-2xl">🔪</span>
              <span className="font-bold text-amber-700">Knife - Right</span>
            </motion.div>
          </div>

          <button
            type="button"
            onClick={handleStart}
            className="px-10 py-5 bg-amber-500 hover:bg-amber-600 text-white rounded-3xl font-black text-2xl shadow-lg transition-all transform hover:scale-105"
          >
            Start Setting! 🪑
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
              className="px-4 py-2 bg-white rounded-xl font-bold text-amber-600 shadow"
            >
              ← Exit
            </button>
            <div className="flex gap-2">
              {placedItems.map((item, idx) => (
                <motion.span
                  key={`placed-${item.id}-${idx}`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-3xl"
                >
                  {item.emoji}
                </motion.span>
              ))}
              {[...Array(TABLE_ITEMS_NEEDED - placedItems.length)].map((_, idx) => (
                <span key={`empty-slot-${placedItems.length + idx}`} className="text-3xl opacity-30">
                  ⬜
                </span>
              ))}
            </div>
          </div>

          {/* Instructions */}
          <div className="text-center mb-2">
            <p className="text-lg font-bold text-amber-700">
              {placedItems.length >= TABLE_ITEMS_NEEDED 
                ? 'Table is set!' 
                : 'Drag utensils to the table!'}
            </p>
            <p className="text-sm text-amber-600">
              {placedItems.length} of {TABLE_ITEMS_NEEDED} items placed
            </p>
          </div>

          {/* Table Visual */}
          <div className="absolute left-1/2 transform -translate-x-1/2"
            style={{ 
              bottom: '8%',
              width: '85%',
              maxWidth: 400,
              height: '35%',
            }}
          >
            <div className="w-full h-full bg-amber-200 rounded-3xl border-4 border-amber-400 shadow-lg flex items-center justify-center">
              <span className="text-6xl opacity-20">🪑</span>
            </div>
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
            <div className="flex justify-center mb-4">
              <KenneyIcon type="star" size={64} />
            </div>
            <h2 className="text-4xl font-black text-amber-600 mb-2">
              Table All Set!
            </h2>
            <p className="text-xl text-amber-600 mb-6">
              Great job setting the table!
            </p>

            {/* Stars */}
            <div className="flex justify-center gap-2 mb-6">
              <motion.span
                key="star-r-0"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: stars >= 1 ? 1 : 0.5, opacity: stars >= 1 ? 1 : 0.3 }}
              >
                <KenneyIcon type={stars >= 1 ? 'star' : 'heart_empty'} size={48} />
              </motion.span>
              <motion.span
                key="star-r-1"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: stars >= 2 ? 1 : 0.5, opacity: stars >= 2 ? 1 : 0.3 }}
                transition={{ delay: 0.1 }}
              >
                <KenneyIcon type={stars >= 2 ? 'star' : 'heart_empty'} size={48} />
              </motion.span>
              <motion.span
                key="star-r-2"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: stars >= 3 ? 1 : 0.5, opacity: stars >= 3 ? 1 : 0.3 }}
                transition={{ delay: 0.2 }}
              >
                <KenneyIcon type={stars >= 3 ? 'star' : 'heart_empty'} size={48} />
              </motion.span>
              <motion.span
                key="star-r-3"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: stars >= 4 ? 1 : 0.5, opacity: stars >= 4 ? 1 : 0.3 }}
                transition={{ delay: 0.3 }}
              >
                <KenneyIcon type={stars >= 4 ? 'star' : 'heart_empty'} size={48} />
              </motion.span>
              <motion.span
                key="star-r-4"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: stars >= 5 ? 1 : 0.5, opacity: stars >= 5 ? 1 : 0.3 }}
                transition={{ delay: 0.4 }}
              >
                <KenneyIcon type={stars >= 5 ? 'star' : 'heart_empty'} size={48} />
              </motion.span>
            </div>

            {/* Score */}
            <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
              <p className="text-3xl font-black text-amber-600">Score: {score}</p>
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={handlePlayAgain}
                className="px-8 py-4 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl font-bold text-xl shadow-lg transition-all"
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

export const SetTheTable = memo(function SetTheTableComponent() {
  return (
    <GameShell
      gameId="set-the-table"
      gameName="Set the Table"
      showWellnessTimer={true}
      enableErrorBoundary={true}
    >
      <SetTheTableGame />
    </GameShell>
  );
});

export default SetTheTable;
