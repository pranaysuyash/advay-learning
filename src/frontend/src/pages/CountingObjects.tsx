/**
 * Counting Objects Game
 * 
 * @ticket GQ-002, GQ-003, GQ-004, GQ-005, GQ-007
 */

import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GameHUD } from '../components/game/GameHUD';
import { GameContainer } from '../components/GameContainer';
import { GameShell } from '../components/GameShell';
import { GameCursor } from '../components/game/GameCursor';
import { AssetPreloader } from '../components/AssetPreloader';
import { useAudio } from '../utils/hooks/useAudio';
import { useGameCompletion } from '../hooks/useGameCompletion';
import { useGameSessionProgress } from '../hooks/useGameSessionProgress';
import { useStreakTracking } from '../hooks/useStreakTracking';
import { useGameHandTracking } from '../hooks/useGameHandTracking';
import { LEVELS, generateCountingScene, calculateScore, type CountingScene } from '../games/countingObjectsLogic';
import { triggerHaptic } from '../utils/haptics';
import type { Point } from '../types/tracking';
import type { HandTrackingRuntimeMeta } from '../hooks/useHandTrackingRuntime';
import type { TrackedHandFrame } from '../utils/handTrackingFrame';

const CRITICAL_ASSETS: import('../components/AssetPreloader').AssetToPreload[] = [
  { type: 'image', src: '/assets/kenney/platformer/hud/hud_heart.png', priority: 'critical' },
  { type: 'image', src: '/assets/kenney/platformer/hud/hud_heart_empty.png', priority: 'critical' },
];

const CountingObjectsGame = memo(function CountingObjectsGameComponent() {
  const navigate = useNavigate();
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const [cursor, setCursor] = useState<Point | null>(null);
  const [assetsLoaded, setAssetsLoaded] = useState(false);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [scene, setScene] = useState<CountingScene | null>(null);
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [correct, setCorrect] = useState(0);
  const {
    streak,
    showMilestone,
    scorePopup,
    incrementStreak,
    resetStreak,
    setScorePopup,
  } = useStreakTracking();
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [feedback, setFeedback] = useState('How many do you see?');

  const { playClick, playSuccess, playError, playCelebration } = useAudio();
  const { completeGame } = useGameCompletion('counting-objects');

  useGameSessionProgress({
    gameName: 'Counting Objects',
    score,
    level: currentLevel,
    isPlaying: true,
    metaData: { correct, round },
  });

  const startNewRound = () => {
    const newScene = generateCountingScene(currentLevel);
    setScene(newScene);
    setRound((r) => r + 1);
    setSelectedAnswer(null);
    setShowResult(false);
    setFeedback('How many do you see?');
  };

  const handleAnswer = (num: number) => {
    if (showResult || !scene) return;
    playClick();
    setSelectedAnswer(num);
    setShowResult(true);
    if (num === scene.answer) {
      // Correct answer - build streak
      incrementStreak();

      // Calculate score with streak and level
      const points = calculateScore(streak + 1, currentLevel);
      setScore((s) => s + points);

      // Show score popup
      setScorePopup({ points, x: 50, y: 30 });
      setTimeout(() => setScorePopup(null), 700);

      // Haptic feedback
      triggerHaptic('success');
      if (streak + 1 > 0 && (streak + 1) % 5 === 0) {
        playCelebration();
      }

      playSuccess();
      setCorrect((c) => c + 1);
      setFeedback(`✅ Correct! There are ${scene.answer} ${scene.targetItem}!`);
    } else {
      // Wrong answer - break streak
      resetStreak();
      triggerHaptic('error');
      playError();
      setFeedback(`❌ There are ${scene.answer} ${scene.targetItem}.`);
    }
    setTimeout(startNewRound, 2000);
  };

  const handleStart = () => {
    playClick();
    startNewRound();
  };

  const handleFinish = useCallback(async () => {
    playClick();
    const finalScore = Math.round(score / 20);
    await completeGame({ score: finalScore, completed: true, level: currentLevel });
    navigate('/games');
  }, [score, navigate, playClick, completeGame, currentLevel]);

  // Hand tracking
  const handleFrame = useCallback(
    (frame: TrackedHandFrame, _meta: HandTrackingRuntimeMeta) => {
      const tip = frame.indexTip;
      if (!tip) {
        setCursor(null);
        return;
      }
      setCursor(tip);
    },
    [],
  );

  const {
    isLoading: isModelLoading,
    isReady: isHandTrackingReady,
    startTracking,
    webcamRef,
  } = useGameHandTracking({
    gameName: 'CountingObjects',
    targetFps: 30,
    isRunning: scene !== null,
    onFrame: handleFrame,
    onNoVideoFrame: () => setCursor(null),
  });

  useEffect(() => {
    if (scene && !isHandTrackingReady && !isModelLoading) {
      void startTracking();
    }
  }, [scene, isHandTrackingReady, isModelLoading, startTracking]);

  const answerOptions = scene
    ? [...new Set([scene.answer, scene.answer + 1, scene.answer - 1, scene.answer + 2])]
      .filter((n) => n > 0)
      .sort(() => Math.random() - 0.5)
      .slice(0, 4)
    : [];

  if (!assetsLoaded) {
    return (
      <AssetPreloader
        assets={CRITICAL_ASSETS}
        onComplete={() => setAssetsLoaded(true)}
        minDisplayTime={800}
      />
    );
  }

  return (
    <GameContainer
      title='Counting Objects'
      onHome={() => navigate('/games')}
      reportSession={false}
      webcamRef={webcamRef}
      isHandDetected={isHandTrackingReady}
      isPlaying={scene !== null}
    >
      <div ref={gameAreaRef} className='h-full flex flex-col items-center justify-center p-4'>

          {/* Level selector */}
          <div className='flex gap-2 justify-center'>
            {LEVELS.map((l) => (
              <button
                key={l.level}
                type='button'
                onClick={() => { playClick(); setCurrentLevel(l.level); setScene(null); }}
                className={`px-5 py-2 rounded-full font-black text-sm transition-all shadow-[0_3px_0_#C2410C] ${currentLevel === l.level
                    ? 'bg-[#F97316] text-white border-2 border-[#EA580C]'
                    : 'bg-white text-slate-700 border-2 border-[#F2CC8F] hover:border-orange-300'
                  }`}
              >
                Level {l.level}
              </button>
            ))}
          </div>

          {/* Menu */}
          {!scene ? (
            <div className='flex flex-col items-center gap-6 bg-white rounded-3xl border-3 border-[#F2CC8F] p-10 shadow-[0_6px_0_#E5B86E] text-center'>
              <div className='text-7xl'>🍎</div>
              <div>
                <h2 className='text-4xl font-black text-slate-900 tracking-tight'>Counting Objects!</h2>
                <p className='text-lg font-bold text-slate-600 mt-2'>Count the items and pick the right number!</p>
              </div>
              <div className='bg-orange-50 rounded-xl p-3 text-sm text-slate-600'>
                <p className='font-bold mb-1'>🎯 Scoring:</p>
                <p>Base 10 pts + streak bonus</p>
                <p>× Level: L1 1× | L2 1.5× | L3 2×</p>
              </div>
              <button
                type='button'
                onClick={handleStart}
                className='px-12 py-5 bg-[#F97316] hover:bg-orange-600 text-white rounded-2xl font-black text-2xl shadow-[0_4px_0_#C2410C] hover:scale-105 active:scale-95 transition-all'
              >
                Start Counting! 🔢
              </button>
            </div>
          ) : (
            <>
              {/* Game HUD */}
              <GameHUD
                score={score}
                streak={streak}
                level={currentLevel}
                round={round}
                showHearts={true}
              />

              {/* Streak milestone popup */}
              {showMilestone && (
                <div className='animate-bounce bg-orange-100 border-2 border-orange-300 rounded-xl px-6 py-3 text-center'>
                  <p className='text-xl font-black text-orange-600'>
                    🔥 {streak} Streak! 🔥
                  </p>
                </div>
              )}

              {/* Score popup */}
              {scorePopup && (
                <div className='font-black text-3xl text-green-500 animate-bounce text-center'>
                  +{scorePopup.points}
                </div>
              )}

              {/* Question */}
              <div className='bg-white rounded-2xl border-2 border-[#F2CC8F] p-5 shadow-[0_4px_0_#E5B86E]'>
                <p className='text-sm font-black uppercase tracking-widest text-orange-500 mb-2'>Round {round}</p>
                <p className='text-2xl font-black text-slate-900'>
                  How many <span className='text-[#F97316]'>{scene.targetItem}</span> do you see?
                </p>
              </div>

              {/* Items display */}
              <div className='bg-gradient-to-br from-orange-50 via-yellow-50 to-white rounded-2xl border-2 border-[#F2CC8F] p-6 shadow-[0_4px_0_#E5B86E] min-h-28 flex flex-wrap justify-center gap-2 items-center'>
                {scene.items.map((item, idx) =>
                  Array.from({ length: item.count }).map((_, jdx) => (
                    <span
                      key={`${item.emoji}-${idx}-${jdx}`}
                      className='text-4xl select-none hover:scale-110 transition-transform'
                    >
                      {item.emoji}
                    </span>
                  ))
                )}
              </div>

              {/* Answer choices */}
              <div className='grid grid-cols-2 gap-3'>
                {answerOptions.map((num) => {
                  const isCorrect = num === scene.answer;
                  const isSelected = num === selectedAnswer;
                  return (
                    <button
                      key={num}
                      type='button'
                      onClick={() => handleAnswer(num)}
                      disabled={showResult}
                      className={[
                        'p-5 rounded-2xl font-black text-3xl transition-all shadow-[0_4px_0_#E5B86E] border-2',
                        showResult
                          ? isCorrect
                            ? 'bg-emerald-100 border-emerald-400 text-emerald-700 scale-105'
                            : isSelected
                              ? 'bg-red-100 border-red-400 text-red-700'
                              : 'bg-slate-50 border-slate-200 text-slate-400'
                          : 'bg-white border-[#F2CC8F] text-slate-900 hover:border-orange-400 hover:scale-105 active:scale-95 cursor-pointer',
                      ].join(' ')}
                    >
                      {num}
                    </button>
                  );
                })}
              </div>

              {/* Feedback */}
              <div className={`rounded-2xl px-5 py-4 border-2 font-bold text-lg text-center transition-all ${showResult && selectedAnswer === scene.answer
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                  : showResult
                    ? 'bg-red-50 border-red-300 text-red-700'
                    : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}>
                {feedback}
              </div>
              <div className='flex gap-2 justify-center mt-4'>
                <button
                  type='button'
                  onClick={startNewRound}
                  className='px-5 py-3 rounded-xl border-2 border-slate-200 bg-white font-black text-slate-700 hover:border-slate-300 transition-all'
                >
                  Skip
                </button>
                <button
                  type='button'
                  onClick={handleFinish}
                  className='px-5 py-3 rounded-xl bg-[#F97316] text-white font-black shadow-[0_3px_0_#C2410C] hover:scale-105 active:scale-95 transition-all'
                >
                  Finish
                </button>
              </div>
            </>
          )}

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
});

// Main export wrapped with GameShell
export const CountingObjects = memo(function CountingObjectsComponent() {
  return (
    <GameShell
      gameId="counting-objects"
      gameName="Counting Objects"
      showWellnessTimer={true}
      enableErrorBoundary={true}
    >
      <CountingObjectsGame />
    </GameShell>
  );
});
