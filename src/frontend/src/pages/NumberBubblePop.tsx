import { useCallback, useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GameContainer } from '../components/GameContainer';
import { GameShell } from '../components/GameShell';
import { CursorEmbodiment } from '../components/game/CursorEmbodiment';
import { useAudio } from '../utils/hooks/useAudio';
import { useGameCompletion } from '../hooks/useGameCompletion';
import { useGameHandTracking } from '../hooks/useGameHandTracking';
import { useGameSessionProgress } from '../hooks/useGameSessionProgress';
import { useStreakTracking } from '../hooks/useStreakTracking';
import {
  LEVELS,
  generateBubbles,
  calculateScore,
  type Bubble,
} from '../games/numberBubblePopLogic';
import { triggerHaptic } from '../utils/haptics';
import type { Point } from '../types/tracking';
import type { TrackedHandFrame } from '../utils/handTrackingFrame';
import type { HandTrackingRuntimeMeta } from '../hooks/useHandTrackingRuntime';

function NumberBubblePopContent() {
  const navigate = useNavigate();
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const bubbleArenaRef = useRef<HTMLDivElement>(null);
  const handleBubbleClickRef = useRef<(bubble: Bubble) => void>(() => {});
  const [currentLevel, setCurrentLevel] = useState(1);
  const [targetNumber, setTargetNumber] = useState(1);
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [score, setScore] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [round, setRound] = useState(0);
  const [cursor, setCursor] = useState<Point | null>(null);
  const [isHandTrackingActive, setIsHandTrackingActive] = useState(false);
  const {
    streak,
    maxStreak,
    showMilestone,
    scorePopup,
    incrementStreak,
    resetStreak,
    setScorePopup,
  } = useStreakTracking();
  const [gameState, setGameState] = useState<'start' | 'playing' | 'complete'>(
    'start',
  );

  const { playClick, playSuccess, playError } = useAudio();
  const { completeGame } = useGameCompletion('number-bubble-pop');

  useGameSessionProgress({
    gameName: 'Number Bubble Pop',
    score,
    level: currentLevel,
    isPlaying: true,
    metaData: { correct, round },
  });

  const startGame = () => {
    const config = LEVELS[currentLevel - 1];
    const target = Math.floor(Math.random() * config.numberRange) + 1;
    setTargetNumber(target);
    setBubbles(generateBubbles(5, target, config.numberRange));
    setScore(0);
    setCorrect(0);
    setRound(0);
    resetStreak();
    setGameState('playing');
  };

  const handleBubbleClick = (bubble: Bubble) => {
    if (gameState !== 'playing') return;
    playClick();
    if (bubble.number === targetNumber) {
      // Correct pop - build streak
      incrementStreak();

      // Calculate score with streak and level
      const points = calculateScore(streak + 1, currentLevel);
      setScore((s) => s + points);

      // Show score popup
      setScorePopup({ points });
      setTimeout(() => setScorePopup(null), 700);

      // Haptic feedback
      triggerHaptic('success');

      playSuccess();
      setCorrect((c) => c + 1);

      if (round >= 4) {
        setGameState('complete');
        triggerHaptic('celebration');
      } else {
        setTimeout(() => {
          setRound((r) => r + 1);
          const config = LEVELS[currentLevel - 1];
          const target = Math.floor(Math.random() * config.numberRange) + 1;
          setTargetNumber(target);
          setBubbles(generateBubbles(5, target, config.numberRange));
        }, 500);
      }
    } else {
      // Wrong pop - break streak
      resetStreak();
      triggerHaptic('error');
      playError();
      setScore((s) => Math.max(s - 10, 0));
    }
  };

  const handleStart = () => {
    playClick();
    startGame();
  };
  const handleFinish = useCallback(async () => {
    playClick();
    await completeGame({ score: correct, level: currentLevel });
    navigate('/games');
  }, [correct, completeGame, navigate, playClick, currentLevel]);

  // Update ref for hand tracking
  useEffect(() => {
    handleBubbleClickRef.current = handleBubbleClick;
  }, [handleBubbleClick]);

  // Hand tracking frame handler
  const handleHandTrackingFrame = useCallback(
    (frame: TrackedHandFrame, _meta: HandTrackingRuntimeMeta) => {
      const hand = frame;
      if (!hand || !hand.indexTip) {
        setCursor(null);
        setIsHandTrackingActive(false);
        return;
      }

      const newCursor: Point = { x: hand.indexTip.x, y: hand.indexTip.y };
      setCursor(newCursor);
      setIsHandTrackingActive(true);

      if (gameState !== 'playing') return;

      const gameArea = gameAreaRef.current;
      if (!gameArea) return;

      const gameAreaRect = gameArea.getBoundingClientRect();
      // Convert normalized 0-1 coords to viewport pixel space for DOM hit-testing
      const viewportX = newCursor.x * window.innerWidth;
      const viewportY = newCursor.y * window.innerHeight;
      const isOverGameArea =
        viewportX >= gameAreaRect.left &&
        viewportX <= gameAreaRect.right &&
        viewportY >= gameAreaRect.top &&
        viewportY <= gameAreaRect.bottom;

      if (!isOverGameArea) return;

      if (frame.pinch.transition !== 'start') return;

      // bubble.x/y are relative to the inner 320×320 bubble arena, not the
      // outer wrapper. Use bubbleArenaRef for accurate origin.
      const arena = bubbleArenaRef.current;
      const arenaRect = arena?.getBoundingClientRect() ?? gameAreaRect;
      const gameX = viewportX - arenaRect.left;
      const gameY = viewportY - arenaRect.top;
      const hitRadius = 35; // bubble is w-14 h-14 = 56px; center at +28px
      for (const bubble of bubbles) {
        const bubbleCenterX = bubble.x + 28;
        const bubbleCenterY = bubble.y + 28;
        const dx = Math.abs(gameX - bubbleCenterX);
        const dy = Math.abs(gameY - bubbleCenterY);
        if (Math.sqrt(dx * dx + dy * dy) < hitRadius) {
          handleBubbleClickRef.current(bubble);
          break;
        }
      }
    },
    [gameState, bubbles],
  );

  const { webcamRef: _webcamRef } = useGameHandTracking({
    gameName: 'NumberBubblePop',
    targetFps: 24,
    onFrame: handleHandTrackingFrame,
  });

  return (
    <GameContainer
      title='Number Bubble Pop'
      onHome={() => navigate('/games')}
      reportSession={false}
      webcamRef={_webcamRef}
      isHandDetected={isHandTrackingActive}
      isPlaying={gameState === 'playing'}
    >
      <div
        ref={gameAreaRef}
        className='flex flex-col items-center gap-4 p-4 relative'
      >
        {/* Hand cursor */}
        {cursor && isHandTrackingActive && (
          <CursorEmbodiment position={{ x: cursor.x * window.innerWidth, y: cursor.y * window.innerHeight }} isPinching={false} />
        )}
        <div className='flex gap-2'>
          {LEVELS.map((l) => (
            <button
              type='button'
              key={l.level}
              onClick={() => {
                playClick();
                setCurrentLevel(l.level);
              }}
              className={`px-4 py-2 rounded-full font-bold ${currentLevel === l.level ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              Level {l.level}
            </button>
          ))}
        </div>

        {gameState === 'start' && (
          <div className='text-center'>
            <p className='text-6xl mb-4'>🫧</p>
            <h2 className='text-2xl font-bold mb-2'>Number Bubble Pop!</h2>
            <p className='mb-2'>Pop bubbles with the number!</p>
            <div className='bg-blue-50 rounded-xl p-3 text-sm text-slate-600 mb-4'>
              <p className='font-bold mb-1'>🎯 Scoring:</p>
              <p>Base 15 pts + streak bonus</p>
              <p>× Level: L1 1× | L2 1.5× | L3 2×</p>
            </div>
            <button
              type='button'
              onClick={handleStart}
              className='px-8 py-4 bg-blue-500 text-white rounded-2xl font-bold text-xl shadow-lg hover:scale-105 transition-transform'
            >
              Start!
            </button>
          </div>
        )}

        {gameState === 'playing' && (
          <div ref={bubbleArenaRef} className='relative w-80 h-80 bg-sky-50 rounded-full overflow-hidden'>
            {/* Streak HUD */}
            <div className='absolute top-2 left-2 right-2 flex items-center justify-center gap-2 bg-white/90 rounded-xl border-2 border-orange-200 px-2 py-1 z-10'>
              <span className='font-black text-sm'>🔥</span>
              <div className='flex gap-0.5'>
                {[1, 2, 3, 4, 5].map((i) => (
                  <img
                    key={i}
                    src={
                      streak >= i * 2
                        ? '/assets/kenney/platformer/hud/hud_heart.png'
                        : '/assets/kenney/platformer/hud/hud_heart_empty.png'
                    }
                    alt={streak >= i * 2 ? 'filled' : 'empty'}
                    className='w-4 h-4'
                  />
                ))}
              </div>
              <span className='font-black text-sm text-orange-500'>
                {streak}
              </span>
            </div>

            {/* Score popup */}
            {scorePopup && (
              <div className='absolute top-16 left-1/2 -translate-x-1/2 font-black text-2xl text-green-500 animate-bounce z-10'>
                +{scorePopup.points}
              </div>
            )}

            {/* Streak milestone */}
            {showMilestone && (
              <div className='absolute top-16 left-1/2 -translate-x-1/2 bg-orange-100 border-2 border-orange-300 rounded-xl px-4 py-2 z-10'>
                <p className='text-lg font-black text-orange-600'>
                  🔥 {streak} Streak! 🔥
                </p>
              </div>
            )}

            <div className='absolute top-14 left-0 right-0 text-center bg-white/80 py-2'>
              <p className='text-lg font-bold'>
                Pop:{' '}
                <span className='text-blue-600 text-2xl'>{targetNumber}</span>
              </p>
            </div>
            {bubbles.map((bubble) => (
              <button
                key={bubble.id}
                type='button'
                onClick={() => handleBubbleClick(bubble)}
                className='absolute w-14 h-14 rounded-full bg-gradient-to-br from-blue-300 to-blue-500 text-white text-xl font-bold shadow-lg hover:scale-110 transition-transform flex items-center justify-center'
                style={{ left: bubble.x, top: bubble.y }}
              >
                {bubble.number}
              </button>
            ))}
          </div>
        )}

        {gameState === 'complete' && (
          <div className='text-center'>
            <p className='text-6xl mb-4'>🎉</p>
            <h2 className='text-2xl font-bold mb-2'>Popping Good!</h2>
            <p className='text-xl mb-4'>You popped {correct} bubbles!</p>
            {maxStreak >= 5 && (
              <div className='flex items-center justify-center gap-2 bg-orange-100 border-2 border-orange-300 px-4 py-2 rounded-full mb-4'>
                <img
                  src='/assets/kenney/platformer/collectibles/star.png'
                  alt='star'
                  className='w-6 h-6'
                />
                <span className='font-black text-orange-700'>
                  Best Streak: {maxStreak}!
                </span>
              </div>
            )}
            <div className='flex justify-center gap-4 mb-4'>
              <div className='bg-blue-50 border-2 border-blue-200 px-6 py-3 rounded-xl'>
                <p className='text-xs font-black uppercase text-blue-600'>
                  Score
                </p>
                <p className='text-3xl font-black text-blue-700'>{score}</p>
              </div>
              <div className='bg-orange-50 border-2 border-orange-200 px-6 py-3 rounded-xl'>
                <p className='text-xs font-black uppercase text-orange-600'>
                  Max Streak
                </p>
                <p className='text-3xl font-black text-orange-700'>
                  {maxStreak}
                </p>
              </div>
            </div>
            <button
              type='button'
              onClick={handleStart}
              className='px-6 py-3 bg-blue-500 text-white rounded-xl font-bold mr-4 hover:scale-105 transition-transform'
            >
              Play Again
            </button>
            <button
              type='button'
              onClick={handleFinish}
              className='px-6 py-3 bg-gray-200 rounded-xl font-bold hover:bg-gray-300 transition-colors'
            >
              Finish
            </button>
          </div>
        )}
      </div>
    </GameContainer>
  );
}

export const NumberBubblePop = () => (
  <GameShell
    gameId='number-bubble-pop'
    gameName='Number Bubble Pop'
    showWellnessTimer={true}
    enableErrorBoundary={true}
  >
    <NumberBubblePopContent />
  </GameShell>
);

export default NumberBubblePop;
