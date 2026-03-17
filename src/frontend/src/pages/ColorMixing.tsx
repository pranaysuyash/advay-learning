import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { GameContainer } from '../components/GameContainer';
import { GameShell } from '../components/GameShell';
import { GameCursor } from '../components/game/GameCursor';
import { AssetPreloader } from '../components/AssetPreloader';
import { useGameCompletion } from '../hooks/useGameCompletion';
import { useGameSessionProgress } from '../hooks/useGameSessionProgress';
import { useStreakTracking } from '../hooks/useStreakTracking';
import { useAudio } from '../utils/hooks/useAudio';
import { useGameHandTracking } from '../hooks/useGameHandTracking';
import { triggerHaptic } from '../utils/haptics';
import { KenneyIcon } from '../components/ui/KenneyIcon';
import { CelebrationEffects } from '../components/game/CelebrationEffects';
import { SuccessAnimation } from '../components/game/SuccessAnimation';
import type { Point } from '../types/tracking';
import type { HandTrackingRuntimeMeta } from '../hooks/useHandTrackingRuntime';
import type { TrackedHandFrame } from '../utils/handTrackingFrame';
import {
  BASE_COLORS,
  createColorMixRound,
  isColorMixAnswerCorrect,
  type BaseColorId,
  type ColorMixRound,
} from '../games/colorMixingLogic';

const CRITICAL_ASSETS: import('../components/AssetPreloader').AssetToPreload[] =
  [
    {
      type: 'image',
      src: '/assets/kenney/platformer/hud/hud_heart.png',
      priority: 'critical',
    },
    {
      type: 'image',
      src: '/assets/kenney/platformer/hud/hud_heart_empty.png',
      priority: 'critical',
    },
  ];

function ColorMixingGame() {
  const [assetsLoaded, setAssetsLoaded] = useState(false);
  const navigate = useNavigate();
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const [cursor, setCursor] = useState<Point | null>(null);
  const [hoveredButtonId, setHoveredButtonId] = useState<string | null>(null);
  const [triggerCelebration, setTriggerCelebration] = useState(false);
  const [showCompleteCelebration, setShowCompleteCelebration] = useState(false);

  const { playClick, playSuccess, playError, playCelebration } = useAudio();
  const { completeGame } = useGameCompletion('color-mixing');

  const [roundIndex, setRoundIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [activeRound, setActiveRound] = useState<ColorMixRound | null>(null);
  const [leftColor, setLeftColor] = useState<BaseColorId | null>(null);
  const [rightColor, setRightColor] = useState<BaseColorId | null>(null);
  const [feedback, setFeedback] = useState('Pick two colors to mix.');
  const [showResult, setShowResult] = useState(false);

  // Streak tracking
  const {
    streak,
    showMilestone,
    scorePopup,
    incrementStreak,
    resetStreak,
    setScorePopup,
  } = useStreakTracking();

  const roundsPerSession = 8;

  useGameSessionProgress({
    gameName: 'Color Mixing',
    score,
    level: 1,
    isPlaying: Boolean(activeRound),
    metaData: {
      round: roundIndex,
      correct,
      roundsPerSession,
    },
  });

  const availableSecondaryOptions = useMemo(
    () => BASE_COLORS.filter((entry) => entry.id !== leftColor),
    [leftColor],
  );

  const startRound = useCallback(() => {
    const round = createColorMixRound();
    setActiveRound(round);
    setLeftColor(round.recipe.left);
    setRightColor(round.recipe.right);
    setShowResult(false);
    setFeedback('What new color do these make?');
    setRoundIndex((prev) => prev + 1);
  }, []);

  const handleStart = () => {
    playClick();
    resetStreak();
    startRound();
  };

  const handleSelectAnswer = async (answer: string) => {
    if (!activeRound || showResult) return;

    playClick();
    setShowResult(true);
    const ok = isColorMixAnswerCorrect(activeRound, answer);

    if (ok) {
      playSuccess();
      const newStreak = incrementStreak();
      const basePoints = 10;
      const streakBonus = Math.min(newStreak * 2, 15);
      const totalPoints = basePoints + streakBonus;
      setCorrect((prev) => prev + 1);
      setScore((prev) => prev + totalPoints);
      setScorePopup({ points: totalPoints, x: 50, y: 30 });
      setFeedback(`Great mix! ${activeRound.recipe.resultName} is correct.`);
      triggerHaptic('success');
      setTriggerCelebration(true);
      setTimeout(() => setTriggerCelebration(false), 800);
    } else {
      playError();
      resetStreak();
      setFeedback(`Nice try! It becomes ${activeRound.recipe.resultName}.`);
      triggerHaptic('error');
    }

    const isFinalRound = roundIndex >= roundsPerSession;
    if (isFinalRound) {
      playCelebration();
      await completeGame({
        score: score + (ok ? 20 : 0),
        completed: true,
        level: 1,
      });
      setShowCompleteCelebration(true);
      setTimeout(() => {
        setActiveRound(null);
        setShowCompleteCelebration(false);
      }, 1400);
      return;
    }

    setTimeout(() => {
      startRound();
    }, 1200);
  };

  const handleFinish = async () => {
    playClick();
    await completeGame({ score, completed: true, level: 1 });
    navigate('/games');
  };

  // Keep hoveredButtonId ref in sync for use in handleFrame
  const hoveredButtonIdRef = useRef<string | null>(null);
  useEffect(() => {
    hoveredButtonIdRef.current = hoveredButtonId;
  }, [hoveredButtonId]);

  // Hand tracking frame handler
  const handleFrame = useCallback(
    (frame: TrackedHandFrame, _meta: HandTrackingRuntimeMeta) => {
      const tip = frame.indexTip;
      if (!tip) {
        setCursor(null);
        setHoveredButtonId(null);
        return;
      }
      setCursor(tip);

      // Check for pinch to select answer
      if (frame.pinch.transition !== 'start') return;

      // If we have a hovered button, trigger its click
      const currentHoveredId = hoveredButtonIdRef.current;
      if (currentHoveredId) {
        if (currentHoveredId === 'start') {
          handleStart();
        } else if (currentHoveredId === 'finish') {
          void handleFinish();
        } else {
          handleSelectAnswer(currentHoveredId);
        }
      }
    },
    [handleStart, handleFinish, handleSelectAnswer],
  );

  // Initialize hand tracking
  const {
    isLoading: isModelLoading,
    isReady: isHandTrackingReady,
    startTracking,
    webcamRef,
  } = useGameHandTracking({
    gameName: 'ColorMixing',
    targetFps: 30,
    isRunning: Boolean(activeRound) || !assetsLoaded,
    onFrame: handleFrame,
    onNoVideoFrame: () => {
      setCursor(null);
      setHoveredButtonId(null);
    },
  });

  // Start tracking when round starts
  useEffect(() => {
    if (activeRound && !isHandTrackingReady && !isModelLoading) {
      void startTracking();
    }
  }, [activeRound, isHandTrackingReady, isModelLoading, startTracking]);

  // Detect button hover based on cursor position
  useEffect(() => {
    if (!cursor || !gameAreaRef.current) {
      setHoveredButtonId(null);
      return;
    }
    const container = gameAreaRef.current;
    const rect = container.getBoundingClientRect();
    const x = cursor.x * rect.width + rect.left;
    const y = cursor.y * rect.height + rect.top;
    const el = document.elementFromPoint(x, y);
    const btn = el?.closest('button[data-hover-id]');
    setHoveredButtonId(btn ? btn.getAttribute('data-hover-id') : null);
  }, [cursor]);

  if (!assetsLoaded) {
    return (
      <AssetPreloader
        assets={CRITICAL_ASSETS}
        onComplete={() => setAssetsLoaded(true)}
        minDisplayTime={800}
      />
    );
  }

  if (!activeRound) {
    return (
      <GameContainer
        title='Color Mixing'
        score={score}
        level={1}
        showScore
        reportSession={false}
        onHome={() => navigate('/games')}
        webcamRef={webcamRef}
        isHandDetected={isHandTrackingReady}
        isPlaying={true}
      >
        <div ref={gameAreaRef} className='h-full overflow-auto p-4 md:p-6'>
          <div className='max-w-3xl mx-auto rounded-3xl border-3 border-[#F2CC8F] bg-white p-8 text-center shadow-[0_6px_0_#E5B86E] space-y-5'>
            <p className='text-sm font-black uppercase tracking-widest text-[#D97706]'>
              Creative Science
            </p>
            <h2 className='text-4xl font-black text-slate-900'>
              Color Mixing Lab
            </h2>
            <p
              className='text-lg font-bold text-slate-600'
              data-ux-goal='Mix two colors and choose the new color.'
            >
              Mix two colors and choose the color they make together.
            </p>
            <p
              className='text-base font-bold text-slate-500'
              data-ux-instruction='Tap Start, then choose the mixed color.'
            >
              Tap Start, then pick the right color answer.
            </p>
            <button
              type='button'
              data-hover-id='start'
              onClick={handleStart}
              className='px-12 py-4 rounded-2xl bg-[#F97316] text-white font-black text-2xl shadow-[0_4px_0_#C2410C] hover:scale-105 active:scale-95 transition-all'
            >
              Start Mixing 🎨
            </button>
          </div>
        </div>
      </GameContainer>
    );
  }

  const left =
    BASE_COLORS.find((entry) => entry.id === leftColor) ?? BASE_COLORS[0];
  const right =
    BASE_COLORS.find((entry) => entry.id === rightColor) ?? BASE_COLORS[1];

  return (
    <GameContainer
      title='Color Mixing'
      score={score}
      level={1}
      showScore
      reportSession={false}
      onHome={() => navigate('/games')}
      webcamRef={webcamRef}
      isHandDetected={isHandTrackingReady}
      isPlaying={true}
    >
      {/* Celebration effects */}
      <CelebrationEffects
        trigger={triggerCelebration}
        type="stars"
        particleCount={20}
        duration={1500}
      />

      {/* Session complete celebration */}
      <SuccessAnimation
        show={showCompleteCelebration}
        type="hearts"
        message="Great Mixing!"
        characterEmoji="🎨"
        particleCount={50}
        duration={2000}
      />

      <div ref={gameAreaRef} className='h-full overflow-auto p-4 md:p-6'>
        <div className='max-w-4xl mx-auto space-y-4'>
          <div className='rounded-2xl border-2 border-[#F2CC8F] bg-white p-4 shadow-[0_4px_0_#E5B86E]'>
            <div className='flex items-center justify-between'>
              <p className='text-sm font-black uppercase tracking-wide text-slate-500'>
                Round {roundIndex} / {roundsPerSession}
              </p>
              {streak > 0 && (
                <p className='text-sm font-black text-orange-600 flex items-center gap-1'>
                  <KenneyIcon type='heart' size={16} />
                  <span>{streak}</span>
                </p>
              )}
            </div>
            <p className='text-xl font-black text-slate-900 mt-1'>
              What color do these make?
            </p>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div className='rounded-2xl border-2 border-[#F2CC8F] bg-white p-4'>
              <p className='text-sm font-bold text-slate-500 mb-2'>Color 1</p>
              <div className='grid grid-cols-3 gap-2'>
                {BASE_COLORS.map((entry) => (
                  <button
                    key={entry.id}
                    type='button'
                    data-hover-id={entry.id}
                    onClick={() => setLeftColor(entry.id)}
                    className={`rounded-xl border-2 p-3 font-black ${leftColor === entry.id ? 'border-slate-800' : 'border-[#F2CC8F]'}`}
                    style={{ backgroundColor: `${entry.hex}33` }}
                  >
                    <span className='text-2xl'>{entry.emoji}</span>
                    <p className='text-xs mt-1'>{entry.name}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className='rounded-2xl border-2 border-[#F2CC8F] bg-white p-4'>
              <p className='text-sm font-bold text-slate-500 mb-2'>Color 2</p>
              <div className='grid grid-cols-3 gap-2'>
                {availableSecondaryOptions.map((entry) => (
                  <button
                    key={entry.id}
                    type='button'
                    data-hover-id={entry.id}
                    onClick={() => setRightColor(entry.id)}
                    className={`rounded-xl border-2 p-3 font-black ${rightColor === entry.id ? 'border-slate-800' : 'border-[#F2CC8F]'}`}
                    style={{ backgroundColor: `${entry.hex}33` }}
                  >
                    <span className='text-2xl'>{entry.emoji}</span>
                    <p className='text-xs mt-1'>{entry.name}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className='rounded-2xl border-2 border-[#F2CC8F] bg-white p-4 text-center relative'>
            {scorePopup && (
              <div
                className='absolute pointer-events-none animate-bounce font-black text-green-600 text-2xl z-10'
                style={{
                  left: `${scorePopup.x}%`,
                  top: `${scorePopup.y}%`,
                  transform: 'translate(-50%, -50%)',
                }}
              >
                +{scorePopup.points}
              </div>
            )}
            {showMilestone && (
              <div className='absolute inset-0 flex items-center justify-center z-20 pointer-events-none'>
                <div className='bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-2xl font-black text-2xl shadow-lg animate-pulse flex items-center gap-2'>
                  <KenneyIcon type='heart' size={20} />
                  <span>{streak} Streak!</span>
                  <KenneyIcon type='heart' size={20} />
                </div>
              </div>
            )}
            <p className='text-lg font-black text-slate-700'>
              {left.emoji} + {right.emoji} = ?
            </p>
            <div className='mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2'>
              {activeRound.options.map((option) => (
                <button
                  key={option}
                  type='button'
                  data-hover-id={option}
                  disabled={showResult}
                  onClick={() => {
                    void handleSelectAnswer(option);
                  }}
                  className='rounded-xl border-2 border-[#F2CC8F] bg-[#FFF8E8] px-4 py-3 font-black text-slate-800 hover:border-[#F97316] transition-all disabled:opacity-70'
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div className='rounded-2xl border-2 border-[#F2CC8F] bg-white p-4 flex items-center justify-between'>
            <p className='font-bold text-slate-700'>{feedback}</p>
            <button
              type='button'
              data-hover-id='finish'
              onClick={() => {
                void handleFinish();
              }}
              className='px-5 py-2 rounded-xl bg-[#F97316] text-white font-black shadow-[0_3px_0_#C2410C]'
            >
              Finish
            </button>
          </div>
        </div>

        {/* Hand tracking cursor */}
        {cursor && (
          <GameCursor
            position={cursor}
            coordinateSpace='normalized'
            containerRef={gameAreaRef}
            isPinching={false}
            isHandDetected={true}
            size={64}
            color='#f97316'
          />
        )}
      </div>
    </GameContainer>
  );
}

export const ColorMixing = memo(function ColorMixingPage() {
  return (
    <GameShell
      gameId='color-mixing'
      gameName='Color Mixing'
      showWellnessTimer
      enableErrorBoundary
    >
      <ColorMixingGame />
    </GameShell>
  );
});
