/**
 * Farm Friends Game
 *
 * Feed animals the correct food!
 *
 * @ticket TCK-20260310-016
 */

import { memo, useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
import {
  ANIMALS,
  type Animal,
  type FoodItem,
  getRandomAnimal,
  getAllFoods,
  isFoodCorrect,
  calculateScore,
  calculateStars,
} from '../games/farmFriendsLogic';
import type { ScreenCoordinate } from '../utils/coordinateTransform';

const FEEDS_NEEDED = 5;

function FarmFriendsGame() {
  const navigate = useNavigate();
  const [gameState, setGameState] = useState<'start' | 'playing' | 'complete'>('start');
  const [currentAnimal, setCurrentAnimal] = useState<Animal | null>(null);
  const [items, setItems] = useState<DraggableItem[]>([]);
  const [dropZones, setDropZones] = useState<DropZone[]>([]);
  const [fedCount, setFedCount] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [score, setScore] = useState(0);
  const [showFeedback, setShowFeedback] = useState<{ correct: boolean; message: string } | null>(null);
  
  const [cursorPosition, setCursorPosition] = useState<ScreenCoordinate>({ x: 0, y: 0 });
  const [isPinching, setIsPinching] = useState(false);

  const { playSuccess, playCelebration, playClick, playPop } = useAudio();
  const { speak, isEnabled: ttsEnabled } = useTTS();
  const { onGameComplete } = useGameDrops('farm-friends');
  const { saveProgress } = useGameProgress('farm-friends');

  useGameSessionProgress({
    gameName: 'Farm Friends',
    score,
    level: 1,
    isPlaying: gameState === 'playing',
    metaData: { fedCount },
  });

  const speakText = useCallback((text: string) => {
    if (ttsEnabled) {
      speak(text);
    }
  }, [speak, ttsEnabled]);

  const initializeLevel = useCallback(() => {
    const animal = getRandomAnimal();
    setCurrentAnimal(animal);
    
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    
    const foodItems = getAllFoods();
    const itemSize = Math.min(screenWidth * 0.1, 70);
    const itemMargin = 8;
    const itemsPerRow = 5;
    
    const newItems: DraggableItem[] = foodItems.map((food, idx) => ({
      id: food.id,
      x: screenWidth * 0.05 + ((idx % itemsPerRow) * (itemSize + itemMargin)),
      y: screenHeight * 0.65 + (Math.floor(idx / itemsPerRow) * (itemSize + itemMargin)),
      size: itemSize,
      content: food.emoji,
      data: food,
    }));

    const animalX = screenWidth * 0.5;
    const animalY = screenHeight * 0.35;
    const zoneSize = itemSize * 1.5;
    
    const newDropZones: DropZone[] = [
      {
        id: 'animal-zone',
        x: animalX - zoneSize / 2,
        y: animalY - zoneSize / 2,
        size: zoneSize,
        label: animal.name,
        color: animal.color,
      },
    ];

    setItems(newItems);
    setDropZones(newDropZones);
  }, []);

  useEffect(() => {
    if (gameState === 'playing') {
      initializeLevel();
      speakText('Feed the animal! What does it like to eat?');
    }
  }, [gameState, initializeLevel, speakText]);

  const handleItemPickup = useCallback((_item: DraggableItem) => {
    playPop();
  }, [playPop]);

  const handleItemDropped = useCallback((item: DraggableItem, _zone: DropZone) => {
    if (!currentAnimal) return;
    
    const food = item.data as FoodItem;
    const correct = isFoodCorrect(currentAnimal, food);
    
    if (correct) {
      playSuccess();
      triggerHaptic('success');
      
      const newFed = fedCount + 1;
      setFedCount(newFed);
      setScore(calculateScore(newFed, mistakes));
      setShowFeedback({ correct: true, message: `${currentAnimal.name} loves ${food.name}!` });
      speakText(`${currentAnimal.name} loves ${food.name}!`);
      
      if (newFed >= FEEDS_NEEDED) {
        setTimeout(async () => {
          setGameState('complete');
          playCelebration();
          await saveProgress({ score: score + 25, completed: true, level: 1, metadata: { fedCount: newFed } });
          onGameComplete(calculateStars(score + 25));
          speakText('Great job! You fed all the animals!');
        }, 1000);
      } else {
        setTimeout(() => {
          setCurrentAnimal(getRandomAnimal());
          initializeLevel();
          setShowFeedback(null);
        }, 1200);
      }
    } else {
      playClick();
      triggerHaptic('error');
      setMistakes(m => m + 1);
      setShowFeedback({ correct: false, message: `${currentAnimal.name} doesn't like ${food.name}` });
      speakText(`${currentAnimal.name} doesn't like that!`);
      setItems(prev => prev.filter(i => i.id !== item.id));
    }
    
    setTimeout(() => setShowFeedback(null), 1000);
  }, [currentAnimal, fedCount, mistakes, score, playSuccess, playClick, playCelebration, onGameComplete, speakText, initializeLevel]);

  const handleItemDroppedOutside = useCallback((_item: DraggableItem) => {
    playClick();
  }, [playClick]);

  const handleStart = () => {
    setFedCount(0);
    setMistakes(0);
    setScore(0);
    setGameState('playing');
    playClick();
  };

  const handlePlayAgain = () => {
    setFedCount(0);
    setMistakes(0);
    setScore(0);
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
      aria-label="Farm Friends Game"
      style={{
        background: 'linear-gradient(180deg, #87CEEB 0%, #90EE90 100%)',
      }}
      onMouseMove={handleMouseMove}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
    >
      {/* Feedback overlay */}
      <AnimatePresence>
        {showFeedback && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className={`fixed inset-0 flex items-center justify-center z-50 pointer-events-none ${
              showFeedback.correct ? 'bg-green-500/30' : 'bg-red-500/30'
            }`}
          >
            <div className="bg-white rounded-3xl p-6 shadow-2xl text-center">
              <span className="text-5xl mb-2 block">
                {showFeedback.correct ? '✅' : '❌'}
              </span>
              <p className={`text-xl font-bold ${
                showFeedback.correct ? 'text-green-600' : 'text-red-600'
              }`}>
                {showFeedback.message}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Start Screen */}
      {gameState === 'start' && (
        <div className="flex flex-col items-center justify-center h-full p-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center"
          >
            <div className="text-8xl mb-4">🚜</div>
            <h1 className="text-4xl font-black text-green-700 mb-4">
              Farm Friends!
            </h1>
            <p className="text-xl text-green-600 mb-8 max-w-md">
              Feed the animals their favorite food! Each animal likes different things.
            </p>
          </motion.div>

          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {ANIMALS.slice(0, 4).map((animal) => (
              <motion.div
                key={animal.id}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex items-center gap-2 bg-white rounded-2xl px-3 py-2 shadow-md"
              >
                <span className="text-2xl">{animal.emoji}</span>
                <span className="font-bold text-green-700">{animal.name}</span>
              </motion.div>
            ))}
          </div>

          <button
            type="button"
            onClick={handleStart}
            className="px-10 py-5 bg-green-500 hover:bg-green-600 text-white rounded-3xl font-black text-2xl shadow-lg transition-all transform hover:scale-105"
          >
            Start Feeding! 🐄
          </button>
        </div>
      )}

      {/* Playing Screen */}
      {gameState === 'playing' && currentAnimal && (
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
            <div className="text-lg font-bold text-green-700">
              {fedCount} / {FEEDS_NEEDED} fed
            </div>
          </div>

          {/* Animal */}
          <div className="flex flex-col items-center justify-center" style={{ height: '40%' }}>
            <motion.div
              key={currentAnimal.id}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              className="text-center"
            >
              <div className="text-9xl mb-2">{currentAnimal.emoji}</div>
              <h2 className="text-3xl font-black text-green-700">{currentAnimal.name}</h2>
              <p className="text-lg text-green-600">What does {currentAnimal.name} like to eat?</p>
            </motion.div>
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
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 1 }}
              className="text-8xl mb-4"
            >
              🚜🐄🐷🐔
            </motion.div>
            <h2 className="text-4xl font-black text-green-600 mb-2">
              Farm Helper!
            </h2>
            <p className="text-xl text-green-600 mb-6">
              You fed all the animals!
            </p>

            {/* Stars */}
            <div className="flex justify-center gap-2 mb-6 text-5xl">
              <motion.span
                key="star-f-0"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: stars >= 1 ? 1 : 0.5, opacity: stars >= 1 ? 1 : 0.3 }}
              >
                {stars >= 1 ? '⭐' : '☆'}
              </motion.span>
              <motion.span
                key="star-f-1"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: stars >= 2 ? 1 : 0.5, opacity: stars >= 2 ? 1 : 0.3 }}
                transition={{ delay: 0.1 }}
              >
                {stars >= 2 ? '⭐' : '☆'}
              </motion.span>
              <motion.span
                key="star-f-2"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: stars >= 3 ? 1 : 0.5, opacity: stars >= 3 ? 1 : 0.3 }}
                transition={{ delay: 0.2 }}
              >
                {stars >= 3 ? '⭐' : '☆'}
              </motion.span>
              <motion.span
                key="star-f-3"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: stars >= 4 ? 1 : 0.5, opacity: stars >= 4 ? 1 : 0.3 }}
                transition={{ delay: 0.3 }}
              >
                {stars >= 4 ? '⭐' : '☆'}
              </motion.span>
              <motion.span
                key="star-f-4"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: stars >= 5 ? 1 : 0.5, opacity: stars >= 5 ? 1 : 0.3 }}
                transition={{ delay: 0.4 }}
              >
                {stars >= 5 ? '⭐' : '☆'}
              </motion.span>
            </div>

            {/* Score */}
            <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
              <p className="text-3xl font-black text-green-600">Score: {score}</p>
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

export const FarmFriends = memo(function FarmFriendsComponent() {
  return (
    <GameShell
      gameId="farm-friends"
      gameName="Farm Friends"
      showWellnessTimer={true}
      enableErrorBoundary={true}
    >
      <FarmFriendsGame />
    </GameShell>
  );
});

export default FarmFriends;
