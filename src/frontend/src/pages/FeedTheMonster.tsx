/**
 * Feed The Monster Game - REFACTORED with GameShell and DragDropSystem
 *
 * @ticket GQ-002, GQ-003, GQ-004, GQ-005, GQ-007
 */

import { memo, useCallback, useState, useEffect, useRef } from 'react';

import { GameShell } from '../components/GameShell';
import { useAudio } from '../utils/hooks/useAudio';
import { useGameDrops } from '../hooks/useGameDrops';
import { useGameSessionProgress } from '../hooks/useGameSessionProgress';
import {
  getEmotionForLevel,
  generateOptions,
  checkAnswer,
  type FoodItem,
  type MonsterEmotion,
} from '../games/feedTheMonsterLogic';
import { GameCursor } from '../components/game/GameCursor';
import { HandTrackingStatus } from '../components/game/HandTrackingStatus';
import { CameraThumbnail } from '../components/game/CameraThumbnail';
import { SuccessAnimation } from '../components/game/SuccessAnimation';
import {
  VoiceInstructions,
  GAME_INSTRUCTIONS,
  useVoiceInstructions,
} from '../components/game/VoiceInstructions';
import { useGameHandTracking } from '../hooks/useGameHandTracking';
import type { TrackedHandFrame } from '../types/tracking';
import { STREAK_MILESTONE_INTERVAL, STREAK_MILESTONE_DURATION_MS } from '../games/constants';
import { DragDropSystem, type DraggableItem, type DropZone } from '../components/game/DragDropSystem';
import type { ScreenCoordinate } from '../utils/coordinateTransform';
import { triggerHaptic } from '../utils/haptics';
import { useWindowSize } from '../hooks/useWindowSize';

const GAME_COLORS = {
  background: '#FFF7ED',
  monsterHappy: '#FCD34D',
  monsterSad: '#93C5FD',
  monsterCalm: '#A7F3D0',
  monsterExcited: '#F472B6',
  monsterAngry: '#FCA5A5',
  card: '#FFFFFF',
  correct: '#22C55E',
  wrong: '#EF4444',
};

function FeedTheMonsterGameComponent() {
  const { onGameComplete } = useGameDrops('feed-the-monster');
  const { playClick, playSuccess, playError, playPop } = useAudio();
  const webcamRef = useRef<Webcam>(null);

  const [cursorPosition, setCursorPosition] = useState<ScreenCoordinate>({ x: 0, y: 0 });
  const [isPinching, setIsPinching] = useState(false);
  const [isHandDetected, setIsHandDetected] = useState(false);
  const lastHandStateRef = useRef(false);

  const [currentLevel] = useState(1);
  const [gameStarted, setGameStarted] = useState(false);

  const [monster, setMonster] = useState<MonsterEmotion | null>(null);
  const [draggables, setDraggables] = useState<DraggableItem[]>([]);
  const [dropZones, setDropZones] = useState<DropZone[]>([]);

  const [showSuccess, setShowSuccess] = useState(false);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [round, setRound] = useState(1);
  const [timeLeft, setTimeLeft] = useState(45);
  const timerRef = useRef<number | null>(null);

  const [isEating, setIsEating] = useState(false);

  // Streak/Combo system state
  const [streak, setStreak] = useState(0);
  const [scorePopup, setScorePopup] = useState<{ points: number; x: number; y: number } | null>(null);
  const [showStreakMilestone, setShowStreakMilestone] = useState(false);

  const TOTAL_ROUNDS = 5;

  const { speak } = useVoiceInstructions();

  const screenDims = useWindowSize();

  useGameSessionProgress({
    gameName: 'Feed the Monster',
    score,
    level: currentLevel,
    isPlaying: gameStarted,
  });

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
      gameName: 'FeedTheMonster',
      isRunning: gameStarted,
      webcamRef,
      onFrame: handleHandFrame,
    });

  useEffect(() => {
    if (gameStarted && !isHandTrackingReady && !isModelLoading) {
      void startTracking();
    }
  }, [gameStarted, isHandTrackingReady, isModelLoading, startTracking]);

  useEffect(() => {
    if (!gameStarted) return;

    // Clear timer when it's not active
    if (showSuccess) return;

    timerRef.current = window.setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleGameOver();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameStarted, showSuccess]);

  const handleGameOver = useCallback(() => {
    setGameStarted(false);
    onGameComplete(score);
    playSuccess();
    speak(`Game over! You scored ${score} points!`);
  }, [onGameComplete, score, playSuccess, speak]);

  const setupRound = useCallback(() => {
    const newMonster = getEmotionForLevel(currentLevel);
    setMonster(newMonster);
    const newOptions = generateOptions(newMonster.emotion, currentLevel);

    // Create drop zone (monster's mouth)
    const mouthZone: DropZone = {
      id: 'monster-mouth',
      x: screenDims.width / 2,
      y: screenDims.height / 2 - 40,
      size: 250,
      accepts: newOptions.map(o => String(o.id)), // Accepts any food, we check correctness on drop
    };
    setDropZones([mouthZone]);

    // Create food draggables arrayed across the bottom
    const yPos = screenDims.height - 180;
    const items: DraggableItem[] = newOptions.map((food, i) => {
      const offsetX = screenDims.width / (newOptions.length + 1) * (i + 1);
      return {
        id: String(food.id),
        x: offsetX,
        y: yPos,
        size: 110,
        content: (
          <div className="w-full h-full bg-white border-4 border-slate-200 rounded-[2rem] flex flex-col items-center justify-center shadow-md">
            <span className="text-5xl">{food.emoji}</span>
          </div>
        ),
        data: food,
      };
    });
    setDraggables(items);
    setTimeLeft(45);
    speak(`${newMonster.prompt} Feed me!`);
  }, [currentLevel, screenDims, speak]);

  useEffect(() => {
    if (gameStarted && round <= TOTAL_ROUNDS) {
      setupRound();
    }
  }, [gameStarted, round, setupRound]);

  const handleItemDropped = useCallback((item: DraggableItem) => {
    if (!monster || showSuccess) return;

    const foodItem = item.data as FoodItem;
    const isCorrect = checkAnswer(foodItem, monster.emotion);

    setIsEating(true);

    if (isCorrect) {
      const newStreak = streak + 1;
      setStreak(newStreak);

      // Calculate points with streak bonus
      const basePoints = 10;
      const streakBonus = Math.min(newStreak * 2, 15);
      const totalPoints = basePoints + streakBonus;

      setScore(s => s + totalPoints);
      setCombo(c => c + 1);
      playSuccess();
      triggerHaptic('success');

      // Show score popup
      setScorePopup({ points: totalPoints, x: 50, y: 30 });
      setTimeout(() => setScorePopup(null), 700);

      // Check for streak milestone (every 5)
      if (newStreak > 0 && newStreak % STREAK_MILESTONE_INTERVAL === 0) {
        setShowStreakMilestone(true);
        triggerHaptic('celebration');
        setTimeout(() => setShowStreakMilestone(false), STREAK_MILESTONE_DURATION_MS);
      }

      setShowSuccess(true);
      speak('Yummy! That was delicious!');

      // Hide food
      setDraggables(prev => prev.filter(d => d.id !== item.id));

      setTimeout(() => {
        setIsEating(false);
        if (round < TOTAL_ROUNDS) {
          setRound(r => r + 1);
          setShowSuccess(false);
        } else {
          handleGameOver();
        }
      }, 2000);
    } else {
      setStreak(0);
      setCombo(0);
      playError();
      triggerHaptic('error');
      speak('Yuck! I do not want that!');

      // Spits it out (item snaps back)
      setTimeout(() => {
        setIsEating(false);
        setDraggables(prev => [...prev]); // Trigger re-render to snap back
      }, 800);
    }
  }, [monster, showSuccess, timeLeft, combo, round, TOTAL_ROUNDS, playSuccess, playError, speak, handleGameOver]);

  const handleItemDroppedOutside = useCallback(() => {
    playPop();
  }, [playPop]);

  const startGame = useCallback(() => {
    setGameStarted(true);
    setScore(0);
    setCombo(0);
    setStreak(0);
    setScorePopup(null);
    setShowStreakMilestone(false);
    setRound(1);
    playPop();
    speak('Pinch the food and drag it to the monster to feed it!');
  }, [speak, playPop]);

  const getMonsterStyle = () => {
    if (!monster) return {};
    switch (monster.emotion) {
      case 'happy': return { backgroundColor: GAME_COLORS.monsterHappy };
      case 'sad': return { backgroundColor: GAME_COLORS.monsterSad };
      case 'calm': return { backgroundColor: GAME_COLORS.monsterCalm };
      case 'excited': return { backgroundColor: GAME_COLORS.monsterExcited };
      case 'angry': return { backgroundColor: GAME_COLORS.monsterAngry };
      default: return {};
    }
  };

  return (
    <div className='w-screen h-screen overflow-hidden relative font-sans' style={{ backgroundColor: GAME_COLORS.background }}>
      <CameraThumbnail isHandDetected={isHandDetected} visible={gameStarted} />

      <HandTrackingStatus
        isHandDetected={isHandDetected}
        pauseOnHandLost={true}
        voicePrompt={true}
        showMascot={true}
      />

      {gameStarted && monster && (
        <>
          <div className='absolute top-6 left-1/2 -translate-x-1/2 z-10 bg-white/95 backdrop-blur-sm rounded-[2rem] px-8 py-4 border-3 border-purple-300 shadow-[0_4px_0_#C084FC] flex items-center gap-8'>
            <div className="flex flex-col items-center">
              <span className='text-xs font-bold uppercase tracking-widest text-slate-400'>Score</span>
              <span className='text-2xl font-black text-purple-600'>{score}</span>
            </div>
            <div className="flex flex-col items-center border-l-2 border-slate-100 pl-8">
              <span className='text-xs font-bold uppercase tracking-widest text-slate-400'>Time</span>
              <span className={`text-2xl font-black ${timeLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-slate-700'}`}>{timeLeft}s</span>
            </div>
            <div className="flex flex-col items-center border-l-2 border-slate-100 pl-8">
              <span className='text-xs font-bold uppercase tracking-widest text-slate-400'>Round</span>
              <span className='text-2xl font-black text-slate-700'>{round}/{TOTAL_ROUNDS}</span>
            </div>
            <div className="flex flex-col items-center border-l-2 border-slate-100 pl-8">
              <span className='text-xs font-bold uppercase tracking-widest text-slate-400'>Streak</span>
              <div className={`text-2xl font-black flex items-center gap-1 ${streak >= 5 ? 'text-orange-500' : 'text-slate-700'}`}>
                <span>{streak >= 3 ? '🔥' : '⚡'}</span>
                <span>{streak}</span>
              </div>
            </div>
          </div>

          <div className='absolute top-36 left-1/2 -translate-x-1/2 text-center pointer-events-none z-0'>
            <div
              className={`w-64 h-64 mx-auto rounded-full flex items-center justify-center text-9xl shadow-[0_12px_40px_rgba(0,0,0,0.15)] border-8 border-white transition-all duration-300 ${isEating ? 'scale-110 drop-shadow-2xl' : ''}`}
              style={getMonsterStyle()}
            >
              {monster.emoji}
            </div>
            <div className="mt-8 bg-white/90 px-8 py-4 rounded-3xl shadow-sm border-2 border-slate-100 inline-block">
              <p className="text-2xl font-black text-slate-800">
                {monster.prompt}
              </p>
              <p className="text-lg font-bold text-slate-500 mt-1">
                What food matches this feeling?
              </p>
            </div>
          </div>
        </>
      )}

      {!gameStarted && (
        <div className='absolute inset-0 flex flex-col items-center justify-center gap-8 bg-slate-900/60 backdrop-blur-md z-20'>
          <div className='flex flex-col items-center justify-center bg-white border-4 border-purple-400 rounded-[3rem] p-10 md:p-14 shadow-[0_12px_40px_rgba(0,0,0,0.3)] text-center max-w-2xl w-[90%]'>
            <div className='text-[8rem] mb-6 drop-shadow-lg hover:animate-bounce transition-transform'>👾</div>
            <h1 className='text-6xl font-black text-purple-600 tracking-tight mb-4 drop-shadow-sm'>
              Feed The Monster
            </h1>
            <p className='text-slate-500 font-bold mb-10 text-xl leading-relaxed max-w-md'>
              The monster is feeling an emotion! Pinch and drag the right food to feed it!
            </p>
            <button
              onClick={() => { playClick(); startGame(); }}
              className='px-14 py-6 bg-purple-500 hover:bg-purple-600 border-b-[6px] border-purple-700 text-white rounded-[2rem] font-black text-3xl shadow-xl transition-all hover:translate-y-1 hover:border-b-[4px] active:translate-y-2 active:border-b-0'
            >
              Start Game
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
        <DragDropSystem
          items={draggables}
          dropZones={dropZones}
          cursorPosition={cursorPosition}
          isPinching={isPinching}
          onItemDropped={handleItemDropped}
          onItemDroppedOutside={handleItemDroppedOutside}
          enableMagneticSnap={true}
          magneticThreshold={180}
          hitboxMultiplier={1.8}
        />
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
        message='Yummy!'
        duration={1500}
        onComplete={() => { setShowSuccess(false); }}
      />

      {/* Score Popup */}
      {scorePopup && (
        <div
          className="absolute z-50 pointer-events-none animate-bounce"
          style={{
            left: `${scorePopup.x}%`,
            top: `${scorePopup.y}%`,
            transform: 'translate(-50%, -50%)',
          }}
        >
          <div className="text-4xl font-black text-green-500 drop-shadow-lg animate-pulse">
            +{scorePopup.points}
          </div>
        </div>
      )}

      {/* Streak Milestone Celebration */}
      {showStreakMilestone && (
        <div className="absolute inset-0 flex items-center justify-center z-40 pointer-events-none">
          <div className="bg-orange-500 text-white px-8 py-4 rounded-3xl shadow-2xl animate-bounce border-4 border-yellow-400">
            <div className="text-4xl font-black flex items-center gap-3">
              <span>🔥</span>
              <span>{streak} Streak!</span>
              <span>🔥</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Main export wrapped with GameShell
export const FeedTheMonster = memo(function FeedTheMonsterWrapper() {
  return (
    <GameShell
      gameId="feed-the-monster"
      gameName="Feed The Monster"
      showWellnessTimer={true}
      enableErrorBoundary={true}
    >
      <FeedTheMonsterGameComponent />
    </GameShell>
  );
});

export default FeedTheMonster;
