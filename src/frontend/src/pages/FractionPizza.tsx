/**
 * Fraction Pizza Game - REFACTORED with DragDropSystem and GameShell
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
import { useGameDrops } from '../hooks/useGameDrops';
import { useGameHandTracking } from '../hooks/useGameHandTracking';
import { useGameSessionProgress } from '../hooks/useGameSessionProgress';
import type { TrackedHandFrame } from '../types/tracking';
import { useAudio } from '../utils/hooks/useAudio';
import {
  LEVELS,
  generateFraction,
  generateOptions,
  type Fraction,
} from '../games/fractionPizzaLogic';
import { memo } from 'react';

function PizzaVisual({ fraction, size }: { fraction: Fraction, size: number }) {
  const slices = [];
  const angle = 360 / fraction.denominator;
  for (let i = 0; i < fraction.denominator; i++) {
    const isFilled = i < fraction.numerator;
    const rotate = i * angle;

    // Draw slice as a conic gradient segment or SVG pie slice
    // To make it easy and visually appealing, we'll construct an SVG pizza
    const strokeWidth = 2;
    slices.push(
      <g key={i} transform={`rotate(${rotate - 90} 50 50)`}>
        <path
          d={`M 50 50 L 100 50 A 50 50 0 0 1 ${50 + 50 * Math.cos((angle * Math.PI) / 180)} ${50 + 50 * Math.sin((angle * Math.PI) / 180)} Z`}
          fill={isFilled ? '#FBBF24' : '#FEF3C7'}
          stroke="#D97706"
          strokeWidth={strokeWidth}
          strokeLinejoin="round"
        />
        {/* Draw pepperonis if filled */}
        {isFilled && (
          <>
            <circle cx={50 + 30 * Math.cos((angle / 2 * Math.PI) / 180)} cy={50 + 30 * Math.sin((angle / 2 * Math.PI) / 180)} r="4" fill="#DC2626" />
            {angle > 60 && <circle cx={50 + 40 * Math.cos((angle / 3 * Math.PI) / 180)} cy={50 + 40 * Math.sin((angle / 3 * Math.PI) / 180)} r="3" fill="#DC2626" />}
          </>
        )}
      </g>
    );
  }

  return (
    <div
      style={{
        width: size,
        height: size,
        filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.15))',
      }}
    >
      <svg viewBox="0 0 100 100" width="100%" height="100%" className="overflow-visible">
        {slices}
        {/* Crust ring */}
        <circle cx="50" cy="50" r="50" fill="none" stroke="#B45309" strokeWidth="3" />
      </svg>
    </div>
  );
}

function FractionPizzaGame() {
  const { onGameComplete } = useGameDrops('fraction-pizza');
  const { playClick, playSuccess, playError, playPop } = useAudio();
  const webcamRef = useRef<Webcam>(null);
  const [cursorPosition, setCursorPosition] = useState<ScreenCoordinate>({ x: 0, y: 0 });
  const [isPinching, setIsPinching] = useState(false);
  const [isHandDetected, setIsHandDetected] = useState(false);
  const lastHandStateRef = useRef(false);

  const [currentLevel, setCurrentLevel] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [fraction, setFraction] = useState<Fraction>({ numerator: 1, denominator: 2 });

  const [items, setItems] = useState<DraggableItem[]>([]);
  const [dropZones, setDropZones] = useState<DropZone[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);

  const { speak } = useVoiceInstructions();

  const [screenDims, setScreenDims] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useGameSessionProgress({
    gameName: 'Fraction Pizza',
    score,
    level: currentLevel + 1,
    isPlaying: gameStarted,
    metaData: { round },
  });

  useEffect(() => {
    function handleResize() {
      setScreenDims({ width: window.innerWidth, height: window.innerHeight });
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleHandFrame = useCallback((frame: TrackedHandFrame) => {
    const tip = frame.indexTip;
    if (tip) {
      setCursorPosition({
        x: tip.x * screenDims.width,
        y: tip.y * screenDims.height,
      });
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
  }, [speak, screenDims]);

  const { isReady: isHandTrackingReady, isLoading: isModelLoading, startTracking } =
    useGameHandTracking({
      gameName: 'FractionPizza',
      isRunning: gameStarted,
      webcamRef,
      onFrame: handleHandFrame,
    });

  useEffect(() => {
    if (gameStarted && !isHandTrackingReady && !isModelLoading) {
      void startTracking();
    }
  }, [gameStarted, isHandTrackingReady, isModelLoading, startTracking]);

  // Setup round
  useEffect(() => {
    if (!gameStarted) return;

    const levelObject = LEVELS[currentLevel];
    const newFraction = generateFraction(levelObject.level);
    setFraction(newFraction);
    const options = generateOptions(newFraction);

    const correctString = `${newFraction.numerator}/${newFraction.denominator}`;

    const newItems: DraggableItem[] = options.map((opt, i) => {
      const isCorrect = opt === correctString;
      return {
        id: `opt-${i}-${opt}`,
        x: screenDims.width / 4 + (i % 2) * (screenDims.width / 2),
        y: screenDims.height - 200 + Math.floor(i / 2) * 120,
        size: 100,
        content: (
          <div className="w-full h-full bg-white border-4 border-orange-300 rounded-2xl flex items-center justify-center text-3xl font-black text-orange-600 shadow-lg">
            {opt}
          </div>
        ),
        color: '#FDBA74',
        data: { label: opt, isCorrect },
      };
    });

    setItems(newItems);

    const pizzaSize = Math.min(screenDims.width * 0.4, 350);
    setDropZones([{
      id: 'pizza-tray',
      x: screenDims.width / 2,
      y: screenDims.height / 2 - 40,
      size: pizzaSize + 40,
      label: 'Drop Here!',
      accepts: newItems.filter(i => i.data.isCorrect).map(i => i.id),
      color: '#FFF8F0',
    }]);

  }, [gameStarted, round, currentLevel, screenDims]);

  const handleItemDropped = useCallback(
    (item: DraggableItem, _zone: DropZone) => {
      if (item.data.isCorrect) {
        playSuccess();
        setScore((prev) => prev + 25);
        setShowSuccess(true);
        speak(`Yummy! That's exactly ${item.data.label} of the pizza!`);

        setTimeout(() => {
          if (round >= 4) {
            if (currentLevel < LEVELS.length - 1) {
              setCurrentLevel((prev) => prev + 1);
              setRound(0);
              speak("Amazing! Let's try harder pizzas!");
            } else {
              onGameComplete();
              speak("You're a Fraction Pizza Master!");
            }
          } else {
            setRound(r => r + 1);
            speak("Let's make another pizza!");
          }
        }, 2000);
      } else {
        playError();
        speak(`Oops! That slice says ${item.data.label}. Try another one!`);
      }
    },
    [round, currentLevel, speak, onGameComplete, playSuccess, playError]
  );

  const handleItemDroppedOutside = useCallback((item: DraggableItem) => {
    setItems((prev) =>
      prev.map((i) =>
        i.id === item.id && item.originalPosition
          ? { ...i, x: item.originalPosition.x, y: item.originalPosition.y }
          : i,
      ),
    );
  }, []);

  const startGame = useCallback(() => {
    setGameStarted(true);
    setCurrentLevel(0);
    setScore(0);
    setRound(0);
    playPop();
    speak('Look at the pizza! Drag the right fraction label to the tray!');
  }, [speak, playPop]);

  return (
    <div className='w-screen h-screen overflow-hidden relative bg-orange-50 font-sans'>
      <CameraThumbnail isHandDetected={isHandDetected} visible={gameStarted} />

      <HandTrackingStatus
        isHandDetected={isHandDetected}
        pauseOnHandLost={true}
        voicePrompt={true}
        showMascot={true}
      />

      {gameStarted && (
        <div className='absolute top-6 left-1/2 -translate-x-1/2 z-10 bg-white/95 backdrop-blur-sm rounded-[2rem] px-8 py-4 border-3 border-orange-300 shadow-[0_4px_0_#FDBA74] flex items-center gap-6'>
          <span className='text-5xl drop-shadow-md'>🍕</span>
          <div>
            <h2 className='text-2xl font-black text-slate-700 tracking-tight m-0'>Level {LEVELS[currentLevel].level}</h2>
            <p className='text-lg font-bold text-orange-600 m-0'>Score: {score}</p>
          </div>
        </div>
      )}

      {!gameStarted && (
        <div className='absolute inset-0 flex flex-col items-center justify-center gap-8 bg-orange-100/80 backdrop-blur-sm z-20'>
          <div className='flex flex-col items-center justify-center bg-white border-4 border-orange-300 rounded-[2.5rem] p-8 md:p-12 shadow-[0_8px_0_#FDBA74] text-center max-w-2xl w-[90%]'>
            <div className='text-[6rem] mb-4 drop-shadow-lg hover:scale-110 transition-transform'>🍕</div>
            <h1 className='text-5xl font-black text-orange-600 tracking-tight mb-4 drop-shadow-sm'>
              Fraction Pizza
            </h1>
            <p className='text-slate-500 font-bold mb-8 text-xl leading-relaxed'>
              Pinch the fractions and drag the correct one to match the pizza!
            </p>
            <button
              onClick={() => { playClick(); startGame(); }}
              className='px-12 py-5 bg-orange-500 hover:bg-orange-600 border-4 border-orange-400 text-white rounded-[1.5rem] font-black text-2xl shadow-[0_6px_0_#C2410C] transition-all hover:translate-y-1 hover:shadow-[0_2px_0_#C2410C] active:translate-y-2 active:shadow-none'
            >
              Start Cooking!
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

      {gameStarted && (
        <>
          {/* Pizza rendering behind the drop zone */}
          <div
            className="absolute z-0 pointer-events-none transition-all duration-500 ease-in-out"
            style={{
              left: screenDims.width / 2,
              top: screenDims.height / 2 - 40,
              transform: 'translate(-50%, -50%)',
            }}
          >
            <PizzaVisual fraction={fraction} size={Math.min(screenDims.width * 0.4, 350)} />
          </div>

          <DragDropSystem
            items={items}
            dropZones={dropZones}
            cursorPosition={cursorPosition}
            isPinching={isPinching}
            onItemDropped={handleItemDropped}
            onItemDroppedOutside={handleItemDroppedOutside}
            enableMagneticSnap={true}
            magneticThreshold={120}
            hitboxMultiplier={1.5}
          />
        </>
      )}

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

      <SuccessAnimation
        show={showSuccess}
        type='stars'
        message='Delicious!'
        duration={1500}
        onComplete={() => { setShowSuccess(false); }}
      />
    </div>
  );
}

export const FractionPizza = memo(function FractionPizzaComponent() {
  return (
    <GameShell
      gameId='fraction-pizza'
      gameName='Fraction Pizza'
      showWellnessTimer={true}
      enableErrorBoundary={true}
    >
      <FractionPizzaGame />
    </GameShell>
  );
});

export default FractionPizza;
