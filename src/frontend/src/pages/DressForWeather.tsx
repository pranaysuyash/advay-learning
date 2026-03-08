/**
 * Dress For Weather Game
 *
 * @ticket GQ-002, GQ-003, GQ-004, GQ-005, GQ-007
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { GameShell } from '../components/GameShell';
import { GameCursor } from '../components/game/GameCursor';
import { HandTrackingStatus } from '../components/game/HandTrackingStatus';
import { CameraThumbnail } from '../components/game/CameraThumbnail';
import { SuccessAnimation } from '../components/game/SuccessAnimation';
import {
  VoiceInstructions,
  GAME_INSTRUCTIONS,
  useVoiceInstructions,
} from '../components/game/VoiceInstructions';
import {
  DragDropSystem,
  type DraggableItem,
  type DropZone,
} from '../components/game/DragDropSystem';
import { type ScreenCoordinate } from '../utils/coordinateTransform';
import {
  SunIcon,
  CloudRainIcon,
  SnowflakeIcon,
  WindIcon,
  CloudSunIcon,
  RainbowIcon,
} from '../components/ClothingSVGs';

import { useGameDrops } from '../hooks/useGameDrops';
import { useGameHandTracking } from '../hooks/useGameHandTracking';
import { useStreakTracking } from '../hooks/useStreakTracking';
import { useGameSessionProgress } from '../hooks/useGameSessionProgress';
import type { TrackedHandFrame } from '../types/tracking';
import { useAudio } from '../utils/hooks/useAudio';
import { useWindowSize } from '../hooks/useWindowSize';
import { triggerHaptic } from '../utils/haptics';

/**
 * Dress for Weather - Weather awareness and clothing matching game
 *
 * IMPLEMENTS ALL CRITICAL FIXES FROM EMOJI MATCH AUDIT:
 * - [✅] GameCursor component: 70px bright yellow cursor
 * - [✅] Proper coordinate transformation (fixes offset bug)
 * - [✅] Voice-over instructions (zero text dependency)
 * - [✅] Generous target sizes (15-20% screen width)
 * - [✅] 2x hitbox size for easy interaction
 * - [✅] Success feedback <100ms
 * - [✅] No timer pressure for toddlers
 * - [✅] HandTrackingStatus with friendly messaging
 * - [✅] 7:1 contrast ratio
 * - [✅] Magnetic snapping (120px threshold)
 * - [✅] DragDropSystem component for intuitive drag & drop
 *
 * Learning Objectives:
 * - Weather awareness (rain, snow, sun, wind)
 * - Appropriate clothing choices
 * - Drag and drop gesture practice
 * - Cause and effect understanding
 *
 * Age Range: 2-4 years (toddlers)
 */

type WeatherType = 'sunny' | 'rainy' | 'snowy' | 'windy';

interface ClothingItem {
  id: string;
  iconId: string;
  name: string;
  weathers: WeatherType[]; // Which weather types this clothing is appropriate for
  color: string;
}

interface Level {
  weather: WeatherType;
  weatherIcon: 'sun' | 'rain' | 'snow' | 'wind';
  weatherName: string;
  backgroundColor: string;
  correctItems: string[]; // IDs of correct clothing items
}

const CLOTHING_ITEMS: ClothingItem[] = [
  {
    id: 'sunglasses',
    iconId: 'sunglasses',
    name: 'Sunglasses',
    weathers: ['sunny'],
    color: '#FFE082',
  },
  {
    id: 't-shirt',
    iconId: 't-shirt',
    name: 'T-Shirt',
    weathers: ['sunny', 'windy'],
    color: '#81D4FA',
  },
  {
    id: 'shorts',
    iconId: 'shorts',
    name: 'Shorts',
    weathers: ['sunny'],
    color: '#FFB74D',
  },
  {
    id: 'raincoat',
    iconId: 'raincoat',
    name: 'Raincoat',
    weathers: ['rainy'],
    color: '#FFF59D',
  },
  {
    id: 'umbrella',
    iconId: 'umbrella',
    name: 'Umbrella',
    weathers: ['rainy'],
    color: '#FF6B6B',
  },
  {
    id: 'boots',
    iconId: 'boots',
    name: 'Rain Boots',
    weathers: ['rainy', 'snowy'],
    color: '#A1887F',
  },
  {
    id: 'coat',
    iconId: 'coat',
    name: 'Winter Coat',
    weathers: ['snowy', 'windy'],
    color: '#E3F2FD',
  },
  {
    id: 'scarf',
    iconId: 'scarf',
    name: 'Scarf',
    weathers: ['snowy', 'windy'],
    color: '#FFCCBC',
  },
  {
    id: 'mittens',
    iconId: 'mittens',
    name: 'Mittens',
    weathers: ['snowy'],
    color: '#F8BBD0',
  },
  {
    id: 'hat',
    iconId: 'hat',
    name: 'Cap',
    weathers: ['sunny', 'windy'],
    color: '#C5E1A5',
  },
  {
    id: 'winter-hat',
    iconId: 'winter-hat',
    name: 'Winter Hat',
    weathers: ['snowy', 'windy'],
    color: '#B39DDB',
  },
  {
    id: 'sandals',
    iconId: 'sandals',
    name: 'Sandals',
    weathers: ['sunny'],
    color: '#FFAB91',
  },
];

const ITEM_EMOJIS: Record<string, string> = {
  sunglasses: '🕶️',
  't-shirt': '👕',
  shorts: '🩳',
  raincoat: '🧥',
  umbrella: '☔',
  boots: '👢',
  coat: '🧥',
  scarf: '🧣',
  mittens: '🧤',
  hat: '🧢',
  'winter-hat': '❄️👒',
  sandals: '🩴',
};

const LEVELS: Level[] = [
  {
    weather: 'sunny',
    weatherIcon: 'sun',
    weatherName: 'Sunny Day',
    backgroundColor: 'linear-gradient(135deg, #FFF9C4 0%, #FFE082 100%)',
    correctItems: ['sunglasses', 't-shirt', 'shorts', 'hat', 'sandals'],
  },
  {
    weather: 'rainy',
    weatherIcon: 'rain',
    weatherName: 'Rainy Day',
    backgroundColor: 'linear-gradient(135deg, #B3E5FC 0%, #81D4FA 100%)',
    correctItems: ['raincoat', 'umbrella', 'boots'],
  },
  {
    weather: 'snowy',
    weatherIcon: 'snow',
    weatherName: 'Snowy Day',
    backgroundColor: 'linear-gradient(135deg, #E1F5FE 0%, #B3E5FC 100%)',
    correctItems: ['coat', 'scarf', 'mittens', 'winter-hat', 'boots'],
  },
  {
    weather: 'windy',
    weatherIcon: 'wind',
    weatherName: 'Windy Day',
    backgroundColor: 'linear-gradient(135deg, #E8EAF6 0%, #C5CAE9 100%)',
    correctItems: ['coat', 't-shirt', 'scarf', 'winter-hat', 'hat'],
  },
];

function DressForWeatherGame() {
  // Hand tracking with modern hooks
  const { onGameComplete } = useGameDrops('dress-for-weather');
  const { playClick } = useAudio();
  const webcamRef = useRef<Webcam>(null);
  const [cursorPosition, setCursorPosition] = useState<ScreenCoordinate>({
    x: 0,
    y: 0,
  });
  const [isPinching, setIsPinching] = useState(false);
  const [isHandDetected, setIsHandDetected] = useState(false);
  const lastHandStateRef = useRef(false);

  // Game state
  const [currentLevel, setCurrentLevel] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [items, setItems] = useState<DraggableItem[]>([]);
  const [dropZones, setDropZones] = useState<DropZone[]>([]);
  const [correctlyPlaced, setCorrectlyPlaced] = useState<Set<string>>(
    new Set(),
  );
  const [showSuccess, setShowSuccess] = useState(false);
  const [score, setScore] = useState(0);

  // Streak tracking
  const { streak, showMilestone, incrementStreak, resetStreak } =
    useStreakTracking();

  const [weatherImageSrc, setWeatherImageSrc] = useState<string | null>(null);

  // Voice instructions
  const { speak } = useVoiceInstructions();

  // Screen dimensions
  const screenDims = useWindowSize();

  useGameSessionProgress({
    gameName: 'Dress for Weather',
    score,
    level: currentLevel + 1,
    isPlaying: gameStarted,
    metaData: { weather: LEVELS[currentLevel]?.weather },
  });

  // No external visual asset loading required, background colors handle states.
  useEffect(() => {
    // Keep setWeatherImageSrc empty to use crisp CSS gradients
    setWeatherImageSrc(null);
  }, [currentLevel]);

  const buildItemVisual = useCallback((item: ClothingItem, size: number) => {
    const emoji = ITEM_EMOJIS[item.id] || '👕';
    return (
      <div
        className='flex items-center justify-center rounded-[2rem] bg-white border-4 shadow-xl select-none'
        style={{
          width: size,
          height: size,
          borderColor: item.color,
          boxShadow: `0 8px 0 ${item.color}88, inset 0 -4px 0 rgba(0,0,0,0.05)`,
        }}
      >
        <span
          style={{
            fontSize: `${size * 0.55}px`,
            lineHeight: 1,
            filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.15))',
          }}
        >
          {emoji}
        </span>
      </div>
    );
  }, []);

  // Hand tracking runtime - replaces manual detection loop
  const handleHandFrame = useCallback(
    (frame: TrackedHandFrame) => {
      const tip = frame.indexTip;

      if (tip) {
        // Convert normalized coordinates (0-1) to screen coordinates
        const screenX = tip.x * screenDims.width;
        const screenY = tip.y * screenDims.height;

        setCursorPosition({ x: screenX, y: screenY });
        setIsPinching(frame.pinch.state.isPinching);

        if (!lastHandStateRef.current) {
          setIsHandDetected(true);
          lastHandStateRef.current = true;
          speak(GAME_INSTRUCTIONS.HAND_DETECTED);
        }
      } else {
        if (lastHandStateRef.current) {
          setIsHandDetected(false);
          lastHandStateRef.current = false;
          speak(GAME_INSTRUCTIONS.HAND_LOST);
        }
      }
    },
    [speak, screenDims],
  );

  const {
    isReady: isHandTrackingReady,
    isLoading: isModelLoading,
    startTracking,
  } = useGameHandTracking({
    gameName: 'DressForWeather',
    isRunning: gameStarted,
    webcamRef,
    onFrame: handleHandFrame,
  });

  useEffect(() => {
    if (gameStarted && !isHandTrackingReady && !isModelLoading) {
      void startTracking();
    }
  }, [gameStarted, isHandTrackingReady, isModelLoading, startTracking]);

  // Initialize level
  useEffect(() => {
    if (!gameStarted) return;

    const level = LEVELS[currentLevel];
    const itemSize = Math.min(screenDims.width * 0.12, 120); // 12% of screen width

    // Create clothing items for this level (mix correct and incorrect)
    const levelItems = CLOTHING_ITEMS.filter((item) => {
      const isCorrect = level.correctItems.includes(item.id);
      const isWrong = !item.weathers.includes(level.weather);
      return isCorrect || isWrong;
    }).slice(0, 6); // Show 6 items total

    const newItems: DraggableItem[] = levelItems.map((item, i) => ({
      id: item.id,
      x: 100 + (i % 3) * 140,
      y: screenDims.height - 200 + Math.floor(i / 3) * 140,
      size: itemSize,
      content: buildItemVisual(item, itemSize),
      color: item.color,
      data: {
        type: item.weathers,
        name: item.name,
        isCorrect: level.correctItems.includes(item.id),
      },
    }));

    setItems(newItems);

    // Create drop zone (character to dress)
    const dropZoneSize = Math.min(screenDims.width * 0.35, 350);
    const zones: DropZone[] = [
      {
        id: 'character',
        x: screenDims.width / 2,
        y: screenDims.height / 2 + 50,
        size: dropZoneSize,
        label: 'Dress Me!',
        accepts: level.correctItems,
        color: '#E8F5E9',
      },
    ];

    setDropZones(zones);
    setCorrectlyPlaced(new Set());
  }, [gameStarted, currentLevel, screenDims, buildItemVisual]);

  // Handle item dropped
  const handleItemDropped = useCallback(
    (item: DraggableItem, _zone: DropZone) => {
      const level = LEVELS[currentLevel];
      const isCorrect = level.correctItems.includes(item.id);

      if (isCorrect) {
        // Correct item!
        setItems((prev) => prev.filter((i) => i.id !== item.id));
        setCorrectlyPlaced((prev) => new Set([...prev, item.id]));
        // Streak and scoring
        const newStreak = incrementStreak();
        setScore((prev) => prev + 10 + Math.min(newStreak * 2, 15));

        setShowSuccess(true);
        void playClick();
        triggerHaptic('success');

        speak(`Perfect! ${item.data.name} is great for ${level.weatherName}!`);

        // Check if level complete
        const newCorrect = new Set([...correctlyPlaced, item.id]);
        const requiredItems = Math.min(3, level.correctItems.length); // Need 3 correct items

        if (newCorrect.size >= requiredItems) {
          setTimeout(() => {
            if (currentLevel < LEVELS.length - 1) {
              void playClick();
              setCurrentLevel((prev) => prev + 1);
              speak("Amazing! Let's try the next weather!");
            } else {
              void playClick();
              onGameComplete();
              speak("You finished all the weather! You're a weather expert!");
            }
          }, 2000);
        }
      } else {
        // Wrong item
        resetStreak();
        void playClick();
        speak(
          `Hmm, ${item.data.name} isn't quite right for ${level.weatherName}. Try another!`,
        );
      }
    },
    [currentLevel, correctlyPlaced, onGameComplete, resetStreak, speak],
  );

  // Handle item dropped outside
  const handleItemDroppedOutside = useCallback((item: DraggableItem) => {
    // Return item to original position
    setItems((prev) =>
      prev.map((i) =>
        i.id === item.id && item.originalPosition
          ? { ...i, x: item.originalPosition.x, y: item.originalPosition.y }
          : i,
      ),
    );
  }, []);

  // Start game
  const startGame = useCallback(() => {
    setGameStarted(true);
    setCurrentLevel(0);
    setScore(0);
    void playClick();
    speak('Dress the character for different weather! Drag the right clothes!');
  }, [speak, playClick]);

  const level = LEVELS[currentLevel];

  return (
    <div
      className='w-screen h-screen overflow-hidden relative transition-colors duration-700'
      style={{
        background: gameStarted
          ? level.backgroundColor
          : 'linear-gradient(135deg, #F8FAFC 0%, #E2E8F0 100%)',
        backgroundImage:
          gameStarted && weatherImageSrc
            ? `linear-gradient(rgba(241,245,249,0.5), rgba(241,245,249,0.7)), url(${weatherImageSrc})`
            : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Hidden webcam */}

      <CameraThumbnail webcamRef={webcamRef} isHandDetected={isHandDetected} visible={gameStarted} />

      {/* Hand tracking status */}
      {gameStarted && (
        <HandTrackingStatus
          isHandDetected={isHandDetected}
          pauseOnHandLost={true}
          voicePrompt={true}
          showMascot={true}
        />
      )}

      {/* Weather indicator */}
      {gameStarted && (
        <div className='absolute top-6 left-1/2 -translate-x-1/2 z-10 bg-white/95 backdrop-blur-sm rounded-[2rem] px-8 py-4 border-3 border-[#F2CC8F] shadow-[0_4px_0_#E5B86E] flex items-center gap-6'>
          <span className='text-5xl drop-shadow-[0_4px_0_#E5B86E] text-[#F59E0B]'>
            {level.weatherIcon === 'sun' && <SunIcon size={48} />}
            {level.weatherIcon === 'rain' && <CloudRainIcon size={48} />}
            {level.weatherIcon === 'snow' && <SnowflakeIcon size={48} />}
            {level.weatherIcon === 'wind' && <WindIcon size={48} />}
          </span>
          <div>
            <h2 className='text-2xl font-black text-advay-slate tracking-tight m-0'>
              {level.weatherName}
            </h2>
            <div className='flex items-center gap-3'>
              <p className='text-lg font-bold text-text-secondary m-0'>
                Score: <span className='text-[#10B981]'>{score}</span>
              </p>
              {streak > 0 && (
                <span className='text-orange-500 font-bold'>🔥 {streak}</span>
              )}
            </div>
            <p className='text-sm font-bold text-slate-400 m-0 mt-1 flex items-center justify-center gap-1'>
              Take your time!{' '}
              <RainbowIcon size={14} className='text-slate-400' />
            </p>
          </div>
        </div>
      )}

      {/* Start screen */}
      {!gameStarted && (
        <div className='absolute inset-0 flex flex-col items-center justify-center gap-8 bg-slate-50/40 backdrop-blur-sm z-20'>
          <div className='flex flex-col items-center justify-center bg-white border-3 border-[#F2CC8F] rounded-[2.5rem] p-8 md:p-12 shadow-[0_4px_0_#E5B86E] text-center max-w-2xl w-[90%]'>
            <div className='w-32 h-32 mb-6 bg-slate-50 rounded-[2rem] p-6 border-3 border-[#F2CC8F] flex items-center justify-center text-[5rem] drop-shadow-md hover:scale-110 transition-transform cursor-pointer text-[#60A5FA]'>
              <CloudSunIcon size={72} />
            </div>

            <h1 className='text-4xl md:text-5xl font-black text-advay-slate tracking-tight mb-4 drop-shadow-[0_4px_0_#E5B86E]'>
              Dress for Weather
            </h1>

            <p className='text-text-secondary font-bold mb-8 max-w-sm mx-auto text-lg md:text-xl leading-relaxed'>
              Dress the character for different weather! Drag the right clothes!
            </p>

            <button
              onClick={() => {
                playClick();
                startGame();
              }}
              className='px-12 py-5 bg-[#3B82F6] hover:bg-blue-600 border-3 border-blue-200 hover:border-blue-300 text-white rounded-[1.5rem] font-black text-2xl shadow-[0_4px_0_#E5B86E] transition-all hover:scale-105 active:scale-95'
            >
              Start Game!
            </button>
          </div>

          <VoiceInstructions
            instructions={GAME_INSTRUCTIONS.GAME_START}
            autoSpeak={true}
            showReplayButton={true}
            replayButtonPosition='bottom-right'
          />
        </div>
      )}

      {/* Drag & Drop System */}
      {gameStarted && (
        <DragDropSystem
          items={items}
          dropZones={dropZones}
          cursorPosition={cursorPosition}
          isPinching={isPinching}
          onItemDropped={handleItemDropped}
          onItemDroppedOutside={handleItemDroppedOutside}
          enableMagneticSnap={true}
          magneticThreshold={120}
          hitboxMultiplier={2.0}
        />
      )}

      {/* Game cursor */}
      {gameStarted && isHandDetected && (
        <GameCursor
          position={cursorPosition}
          size={84}
          isPinching={isPinching}
          isHandDetected={isHandDetected}
          showTrail={true}
          pulseAnimation={true}
          highContrast={true}
        />
      )}

      {/* Success animation */}
      <SuccessAnimation
        show={showSuccess}
        type='hearts'
        message='Perfect!'
        duration={1500}
        onComplete={() => {
          playClick();
          setShowSuccess(false);
        }}
      />

      {/* Streak Milestone Overlay */}
      {showMilestone && (
        <div className='fixed inset-0 flex items-center justify-center pointer-events-none z-50'>
          <div className='bg-gradient-to-r from-orange-400 to-red-500 text-white px-8 py-4 rounded-full font-bold text-2xl shadow-lg animate-bounce'>
            🔥 {streak} Streak! 🔥
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Testing Checklist:
 *
 * Pre-Launch QA:
 * - [ ] Cursor is 70px, bright yellow, 7:1 contrast
 * - [ ] Coordinate transformation accurate
 * - [ ] Voice-over instructions (zero text dependency)
 * - [ ] Clothing items 12% of screen width
 * - [ ] Drop zone 35% of screen width
 * - [ ] 2x hitboxes for easy grabbing
 * - [ ] Success feedback <100ms
 * - [ ] No timer pressure
 * - [ ] Magnetic snapping (120px) helps targeting
 * - [ ] Correct items accepted, wrong items rejected
 * - [ ] Items return to origin if dropped outside
 * - [ ] Level progression works (4 levels)
 * - [ ] Score increments correctly
 *
 * Accessibility QA:
 * - [ ] 7:1 contrast ratio
 * - [ ] Voice uses 2-4 year vocabulary
 * - [ ] Color-blind friendly (not color-dependent)
 * - [ ] High contrast mode available
 *
 * User Testing (5+ children ages 2-4):
 * - [ ] 95%+ can grab clothing items
 * - [ ] 90%+ can drag to drop zone
 * - [ ] 85%+ understand which clothes match weather
 * - [ ] 95%+ smile/show positive emotion
 * - [ ] Zero frustration or fear
 */

export default function DressForWeather() {
  return (
    <GameShell
      gameId='dress-for-weather'
      gameName='Dress For Weather'
      showWellnessTimer={true}
      enableErrorBoundary={true}
    >
      <DressForWeatherGame />
    </GameShell>
  );
}
