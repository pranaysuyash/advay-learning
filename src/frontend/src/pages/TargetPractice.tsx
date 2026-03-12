/**
 * Target Practice Game
 *
 * Hit the targets as fast as you can!
 * A high-energy targeting game for hand-eye coordination.
 *
 * @ticket GQ-002, GQ-003, GQ-004, GQ-005, GQ-007
 */

import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { GameContainer } from '../components/GameContainer';
import { GameShell } from '../components/GameShell';
import { useAudio } from '../utils/hooks/useAudio';
import { useGameDrops } from '../hooks/useGameDrops';
import { useGameProgress } from '../hooks/useGameProgress';
import { useStreakTracking } from '../hooks/useStreakTracking';
import { GameHUD } from '../components/game/GameHUD';
import { useGameSessionProgress } from '../hooks/useGameSessionProgress';
import { triggerHaptic } from '../utils/haptics';
import {
  pickSpacedPoints,
  type TargetPoint,
} from '../games/targetPracticeLogic';
import { isPointInCircle } from '../utils/geometry';
import { KenneyIcon } from '../components/ui/KenneyIcon';

// Difficulty configuration matching spec
interface DifficultyConfig {
  level: number;
  name: string;
  targetCount: number;
  targetRadius: number; // normalized 0-1
  minDistance: number; // normalized 0-1
  basePoints: number;
}

const DIFFICULTY_LEVELS: DifficultyConfig[] = [
  {
    level: 1,
    name: 'Easy',
    targetCount: 3,
    targetRadius: 0.08,
    minDistance: 0.25,
    basePoints: 10,
  },
  {
    level: 2,
    name: 'Medium',
    targetCount: 5,
    targetRadius: 0.06,
    minDistance: 0.2,
    basePoints: 15,
  },
  {
    level: 3,
    name: 'Hard',
    targetCount: 8,
    targetRadius: 0.04,
    minDistance: 0.15,
    basePoints: 20,
  },
];

const GAME_DURATION = 30; // seconds
const TARGET_MARGIN = 0.1; // margin from edges

interface HitEffect {
  id: number;
  x: number;
  y: number;
  points: number;
}

const TargetPracticeGame = memo(function TargetPracticeGameComponent() {
  const navigate = useNavigate();
  const [difficulty, setDifficulty] = useState<DifficultyConfig>(
    DIFFICULTY_LEVELS[0],
  );
  const [targets, setTargets] = useState<TargetPoint[]>([]);
  const [score, setScore] = useState(0);
  const [hits, setHits] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [gameState, setGameState] = useState<'start' | 'playing' | 'complete'>(
    'start',
  );
  const [hitEffects, setHitEffects] = useState<HitEffect[]>([]);
  const [bestCombo, setBestCombo] = useState(0);

  // Streak tracking from hook
  const {
    streak,
    maxStreak,
    showMilestone,
    incrementStreak,
    resetStreak,
  } = useStreakTracking();

  const gameAreaRef = useRef<HTMLDivElement>(null);
  const hitEffectIdRef = useRef(0);
  const timerRef = useRef<number | null>(null);

  const { playClick, playSuccess, playError, playCelebration } = useAudio();
  const { onGameComplete } = useGameDrops('target-practice');
  const { saveProgress } = useGameProgress('target-practice');

  // Progress tracking
  useGameSessionProgress({
    gameName: 'Target Practice',
    score,
    level: difficulty.level,
    isPlaying: gameState === 'playing',
    metaData: { hits, bestCombo, timeLeft },
  });

  // Generate new targets
  const generateTargets = useCallback(() => {
    const newTargets = pickSpacedPoints(
      difficulty.targetCount,
      difficulty.minDistance,
      TARGET_MARGIN,
    );
    setTargets(newTargets);
  }, [difficulty]);

  // Start game
  const startGame = useCallback(() => {
    setScore(0);
    setHits(0);
    setTimeLeft(GAME_DURATION);
    setBestCombo(0);
    resetStreak();
    setHitEffects([]);
    setGameState('playing');
    generateTargets();
  }, [generateTargets, resetStreak]);

  // Timer countdown
  useEffect(() => {
    if (gameState !== 'playing') {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    timerRef.current = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setGameState('complete');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
      }
    };
  }, [gameState]);

  // Update best combo
  useEffect(() => {
    if (streak > bestCombo) {
      setBestCombo(streak);
    }
  }, [streak, bestCombo]);

  // Play celebration on game complete
  useEffect(() => {
    if (gameState === 'complete') {
      playCelebration();
      triggerHaptic('celebration');
    }
  }, [gameState, playCelebration]);

  // Calculate combo bonus
  const calculateComboBonus = useCallback((currentStreak: number): number => {
    if (currentStreak >= 10) return 25;
    if (currentStreak >= 5) return 10;
    if (currentStreak >= 3) return 5;
    return 0;
  }, []);

  // Handle target hit
  const handleTargetHit = useCallback(
    (targetId: number, clickX: number, clickY: number) => {
      if (gameState !== 'playing') return;

      const target = targets.find((t) => t.id === targetId);
      if (!target) return;

      // Normalize click coordinates
      const rect = gameAreaRef.current?.getBoundingClientRect();
      if (!rect) return;

      const clickPoint = {
        x: clickX / rect.width,
        y: clickY / rect.height,
      };

      // Check if click is within target radius
      const isHit = isPointInCircle(
        clickPoint,
        target.position,
        difficulty.targetRadius,
      );

      if (isHit) {
        // Increment streak
        const newStreak = incrementStreak();

        // Calculate points
        const comboBonus = calculateComboBonus(newStreak);
        const totalPoints = difficulty.basePoints + comboBonus;

        // Update score and hits
        setScore((s) => s + totalPoints);
        setHits((h) => h + 1);

        // Add hit effect
        const effectId = hitEffectIdRef.current++;
        setHitEffects((effects) => [
          ...effects,
          {
            id: effectId,
            x: target.position.x * rect.width,
            y: target.position.y * rect.height,
            points: totalPoints,
          },
        ]);

        // Remove hit effect after animation
        setTimeout(() => {
          setHitEffects((effects) =>
            effects.filter((e) => e.id !== effectId),
          );
        }, 700);

        // Play feedback
        playSuccess();
        triggerHaptic('success');

        // Remove hit target and generate new one
        setTargets((prev) => {
          const remaining = prev.filter((t) => t.id !== targetId);
          // Generate one new target to maintain count
          const newTarget = pickSpacedPoints(
            1,
            difficulty.minDistance,
            TARGET_MARGIN,
          )[0];
          if (newTarget) {
            // Assign new ID to avoid conflicts
            const maxId = prev.length > 0 ? Math.max(...prev.map((t) => t.id)) : 0;
            newTarget.id = maxId + 1;
            return [...remaining, newTarget];
          }
          return remaining;
        });
      } else {
        // Miss - reset streak
        resetStreak();
        playError();
        triggerHaptic('error');
      }
    },
    [
      gameState,
      targets,
      difficulty,
      incrementStreak,
      resetStreak,
      calculateComboBonus,
      playSuccess,
      playError,
    ],
  );

  // Handle game area click (for misses)
  const handleGameAreaClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (gameState !== 'playing') return;

      const rect = gameAreaRef.current?.getBoundingClientRect();
      if (!rect) return;

      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      // Check if click hit any target
      const clickPoint = {
        x: clickX / rect.width,
        y: clickY / rect.height,
      };

      let hitAny = false;
      for (const target of targets) {
        if (
          isPointInCircle(
            clickPoint,
            target.position,
            difficulty.targetRadius,
          )
        ) {
          hitAny = true;
          handleTargetHit(target.id, clickX, clickY);
          break;
        }
      }

      // If no target was hit, it's a miss
      if (!hitAny) {
        resetStreak();
        playError();
        triggerHaptic('error');
      }
    },
    [gameState, targets, difficulty, handleTargetHit, resetStreak, playError],
  );

  // Handle start
  const handleStart = useCallback(() => {
    playClick();
    startGame();
  }, [playClick, startGame]);

  // Handle finish
  const handleFinish = useCallback(async () => {
    playClick();
    await saveProgress({ score, completed: true, level: difficulty.level });
    await onGameComplete(score);
    navigate('/games');
  }, [playClick, onGameComplete, score, navigate, saveProgress, difficulty.level]);

  // Handle play again
  const handlePlayAgain = useCallback(() => {
    playClick();
    setGameState('start');
  }, [playClick]);

  return (
    <GameContainer
      title="Target Practice"
      score={score}
      level={difficulty.level}
      showScore
      onHome={() => navigate('/games')}
      reportSession={false}
    >
      <div className="flex flex-col items-center gap-4 p-4 h-full overflow-auto">
        {/* Level Selection */}
        {gameState === 'start' && (
          <div className="flex flex-col items-center gap-6 max-w-2xl w-full">
            <div className="text-center">
              <div className="text-6xl mb-4">🎯</div>
              <h2 className="text-3xl font-black text-slate-900 mb-2">
                Target Practice!
              </h2>
              <p className="text-lg text-slate-600 mb-6">
                Hit the targets as fast as you can!
              </p>
            </div>

            {/* Difficulty buttons */}
            <div className="flex gap-3 flex-wrap justify-center">
              {DIFFICULTY_LEVELS.map((level) => (
                <button
                  key={level.level}
                  type="button"
                  onClick={() => {
                    playClick();
                    setDifficulty(level);
                  }}
                  className={`px-6 py-3 rounded-2xl font-black text-lg transition-all shadow-[0_4px_0_#E5B86E] ${difficulty.level === level.level
                      ? 'bg-amber-500 text-white border-2 border-amber-600'
                      : 'bg-white text-slate-700 border-2 border-[#F2CC8F] hover:border-amber-300'
                    }`}
                >
                  {level.name}
                </button>
              ))}
            </div>

            {/* Difficulty details */}
            <div className="bg-white rounded-2xl border-2 border-[#F2CC8F] p-4 text-center shadow-[0_4px_0_#E5B86E]">
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-2">
                {difficulty.name} Mode
              </p>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="block text-2xl font-black text-amber-600">
                    {difficulty.targetCount}
                  </span>
                  <span className="text-slate-500">Targets</span>
                </div>
                <div>
                  <span className="block text-2xl font-black text-amber-600">
                    {difficulty.basePoints}
                  </span>
                  <span className="text-slate-500">Points</span>
                </div>
                <div>
                  <span className="block text-2xl font-black text-amber-600">
                    {GAME_DURATION}s
                  </span>
                  <span className="text-slate-500">Time</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleStart}
              className="px-12 py-5 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl font-black text-2xl shadow-[0_6px_0_#D97706] active:translate-y-1 active:shadow-[0_0_0_#D97706] transition-all"
            >
              Start! 🎯
            </button>
          </div>
        )}

        {/* Playing State */}
        {gameState === 'playing' && (
          <div className="flex flex-col items-center gap-4 w-full max-w-4xl">
            <GameHUD
              score={score}
              streak={streak}
              level={difficulty.level}
              rightHeaderContent={
                <div className={`bg-white/90 backdrop-blur-sm px-4 py-1.5 rounded-xl font-black border-2 border-slate-200 shadow-sm ${timeLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-slate-600'}`}>
                  ⏱️ {timeLeft}s
                </div>
              }
            />

            {/* Streak Milestone Overlay */}
            <AnimatePresence>
              {showMilestone && (
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0, rotate: 180 }}
                  className="fixed inset-0 flex items-center justify-center pointer-events-none z-50"
                >
                  <div className="bg-gradient-to-r from-orange-400 to-red-500 text-white px-8 py-4 rounded-full font-black text-3xl shadow-2xl border-4 border-white">
                    <div className='flex items-center justify-center gap-2'><KenneyIcon type='heart' size={20} /> {streak} Streak! <KenneyIcon type='heart' size={20} /></div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Game Area */}
            <div
              ref={gameAreaRef}
              onClick={handleGameAreaClick}
              className="relative w-full aspect-[4/3] bg-slate-100 rounded-2xl overflow-hidden cursor-crosshair border-4 border-[#F2CC8F] shadow-[0_8px_0_#E5B86E]"
            >
              {/* Targets */}
              {targets.map((target) => {
                const radiusPercent = difficulty.targetRadius * 100;
                return (
                  <motion.div
                    key={target.id}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute cursor-pointer"
                    style={{
                      left: `${target.position.x * 100}%`,
                      top: `${target.position.y * 100}%`,
                      width: `${radiusPercent * 2}%`,
                      height: `${radiusPercent * 2}%`,
                      transform: 'translate(-50%, -50%)',
                    }}
                  >
                    {/* Target visual - concentric circles */}
                    <div className="w-full h-full rounded-full bg-red-500 border-4 border-white shadow-lg flex items-center justify-center">
                      <div className="w-2/3 h-2/3 rounded-full bg-white flex items-center justify-center">
                        <div className="w-1/3 h-1/3 rounded-full bg-red-500" />
                      </div>
                    </div>
                  </motion.div>
                );
              })}

              {/* Hit Effects */}
              <AnimatePresence>
                {hitEffects.map((effect) => (
                  <motion.div
                    key={effect.id}
                    initial={{ opacity: 1, scale: 0.5, y: effect.y }}
                    animate={{ opacity: 0, scale: 1.5, y: effect.y - 50 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.7, ease: 'easeOut' }}
                    className="absolute pointer-events-none font-black text-2xl text-green-600"
                    style={{
                      left: effect.x,
                      top: effect.y,
                      transform: 'translate(-50%, -50%)',
                    }}
                  >
                    +{effect.points}
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Combo indicator */}
              {streak >= 3 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-orange-400 to-red-500 text-white px-6 py-2 rounded-full font-black shadow-lg">
                  {streak >= 10
                    ? 'EPIC COMBO!'
                    : streak >= 5
                      ? 'SUPER COMBO!'
                      : 'COMBO!'}
                </div>
              )}
            </div>

            {/* Instructions */}
            <p className="text-slate-500 font-bold text-center">
              Click the 🎯 targets to score points!
            </p>
          </div>
        )}

        {/* Complete State */}
        {gameState === 'complete' && (
          <div className="flex flex-col items-center gap-6 max-w-md w-full">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-center"
            >
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-3xl font-black text-slate-900 mb-2">
                Time's Up!
              </h2>
              <p className="text-lg text-slate-600">Great targeting!</p>
            </motion.div>

            {/* Results */}
            <div className="grid grid-cols-2 gap-4 w-full">
              <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-4 text-center">
                <p className="text-sm font-bold text-amber-600 uppercase tracking-wide">
                  Final Score
                </p>
                <p className="text-4xl font-black text-amber-700">{score}</p>
              </div>
              <div className="bg-orange-50 border-2 border-orange-200 rounded-2xl p-4 text-center">
                <p className="text-sm font-bold text-orange-600 uppercase tracking-wide">
                  Best Streak
                </p>
                <p className="text-4xl font-black text-orange-700">
                  {maxStreak}
                </p>
              </div>
            </div>

            <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-4 w-full text-center">
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-1">
                Targets Hit
              </p>
              <p className="text-2xl font-black text-slate-700">{hits}</p>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handlePlayAgain}
                className="px-8 py-4 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl font-black text-xl shadow-[0_4px_0_#D97706] active:translate-y-1 active:shadow-none transition-all"
              >
                Play Again
              </button>
              <button
                type="button"
                onClick={handleFinish}
                className="px-8 py-4 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-2xl font-black text-xl transition-all"
              >
                Finish
              </button>
            </div>

          </div>
        )}
      </div>
    </GameContainer>
  );
});

// Main export wrapped with GameShell
export const TargetPractice = memo(function TargetPracticeComponent() {
  return (
    <GameShell
      gameId="target-practice"
      gameName="Target Practice"
      showWellnessTimer={true}
      enableErrorBoundary={true}
    >
      <TargetPracticeGame />
    </GameShell>
  );
});

export default TargetPractice;
