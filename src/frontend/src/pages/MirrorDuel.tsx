/**
 * Mirror Duel Game
 *
 * Match poses with the AI opponent to score points!
 *
 * Educational Focus:
 * - Pose recognition and body awareness
 * - Memory and pattern matching
 * - Motor control and coordination
 * - Social-emotional learning
 *
 * Controls:
 * - Use computer camera to track poses
 * - Actual pose detection using MediaPipe Pose Landmarker
 */

import { memo, useCallback, useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { GameShell } from '../components/GameShell';
import { GameContainer } from '../components/GameContainer';
import { GameControls } from '../components/GameControls';
import type { GameControl } from '../components/GameControls';
import { GameHUD } from '../components/game/GameHUD';
import { useAudio } from '../utils/hooks/useAudio';
import { useGameCompletion } from '../hooks/useGameCompletion';
import { useStreakTracking } from '../hooks/useStreakTracking';
import { triggerHaptic } from '../utils/haptics';
import { useTTS } from '../hooks/useTTS';
import { VoiceInstructions } from '../components/game/VoiceInstructions';
import { useGameHandTracking } from '../hooks/useGameHandTracking';
import { useGamePoseTracking } from '../hooks/useGamePoseTracking';
import { GameCursor } from '../components/game/GameCursor';
import { CelebrationEffects } from '../components/game/CelebrationEffects';
import { SuccessAnimation } from '../components/game/SuccessAnimation';
import { calculateAngle } from '../utils/geometry';
import type { Point } from '../types/tracking';
import type { HandTrackingRuntimeMeta } from '../hooks/useHandTrackingRuntime';
import type { TrackedHandFrame } from '../utils/handTrackingFrame';
import {
  initializeGame,
  getCurrentLevel,
  updatePose,
  scorePose,
  startGame,
  resetLevel,
  nextLevel,
  calculateScore,
  type GameState,
} from '../games/mirrorDuelLogic';

// Pose definitions with target angles for CV detection
interface PoseTarget {
  id: string;
  name: string;
  emoji: string;
  description: string;
  instruction: string;
  targets: {
    leftArmAngle?: number;
    rightArmAngle?: number;
    leftLegAngle?: number;
    rightLegAngle?: number;
    torsoAngle?: number;
    armsAboveHead?: boolean;
    armsCrossed?: boolean;
    armsWide?: boolean;
  };
}

const POSE_TARGETS: PoseTarget[] = [
  {
    id: 'arms_up',
    name: 'Arms Up',
    emoji: '🙌',
    description: 'Raise both arms up!',
    instruction: 'Reach your hands high toward the sky!',
    targets: { leftArmAngle: 45, rightArmAngle: 45, armsAboveHead: true },
  },
  {
    id: 'arms_down',
    name: 'Arms Down',
    emoji: '👇',
    description: 'Put arms down at your sides!',
    instruction: 'Let your arms hang down by your sides!',
    targets: { leftArmAngle: 170, rightArmAngle: 170 },
  },
  {
    id: 'arms_left',
    name: 'Left Arm',
    emoji: '👈',
    description: 'Point left with one arm!',
    instruction: 'Point your arm to the left!',
    targets: { leftArmAngle: 150, rightArmAngle: 90 },
  },
  {
    id: 'arms_right',
    name: 'Right Arm',
    emoji: '👉',
    description: 'Point right with one arm!',
    instruction: 'Point your arm to the right!',
    targets: { leftArmAngle: 90, rightArmAngle: 150 },
  },
  {
    id: 'arms_cross',
    name: 'Cross Arms',
    emoji: '🦾',
    description: 'Cross your arms!',
    instruction: 'Cross your arms in front of your chest!',
    targets: { armsCrossed: true },
  },
  {
    id: 'arms_wings',
    name: 'Arms Wings',
    emoji: '🕊️',
    description: 'Spread arms like wings!',
    instruction: 'Spread your arms wide like wings!',
    targets: { leftArmAngle: 170, rightArmAngle: 170, armsWide: true },
  },
  {
    id: 'arms_wave',
    name: 'Wave',
    emoji: '👋',
    description: 'Wave hello!',
    instruction: 'Wave your hand high!',
    targets: { leftArmAngle: 45, rightArmAngle: 170, armsAboveHead: true },
  },
];

// Helper to get pose info
const getPoseInfo = (poseId: string) => {
  const pose = POSE_TARGETS.find((p) => p.id === poseId);
  return pose || POSE_TARGETS[0];
};

// Match threshold for pose detection (0-100)
const POSE_MATCH_THRESHOLD = 60;
// Time to hold pose for it to count (ms)
const POSE_HOLD_DURATION = 1000;

const MirrorDuelContent = memo(function MirrorDuelContent() {
  const [showMenu, setShowMenu] = useState(true);
  const [gameState, setGameState] = useState<GameState>(() => initializeGame(1));
  const [showCelebration, setShowCelebration] = useState(false);
  const [triggerConfetti, setTriggerConfetti] = useState(false);
  const [timeLeft, setTimeLeft] = useState(10);
  const [cursor, setCursor] = useState<Point | null>(null);
  const [matchProgress, setMatchProgress] = useState(0);
  const [holdTime, setHoldTime] = useState(0);
  const [cameraReady, setCameraReady] = useState(false);
  const [voicePrompt, setVoicePrompt] = useState('');
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { streak, incrementStreak, resetStreak } = useStreakTracking();
  const { playSuccess, playError } = useAudio();
  const { speak, isEnabled: ttsEnabled } = useTTS();
  const { completeGame } = useGameCompletion('mirror-duel');

  // Hand tracking
  const isPlaying = !showMenu && gameState.isPlaying && !showCelebration;

  const handleFrame = useCallback((frame: TrackedHandFrame, _meta: HandTrackingRuntimeMeta) => {
    const tip = frame.indexTip;
    if (!tip) { setCursor(null); return; }
    setCursor(tip);
  }, []);

  const handleNoVideoFrame = useCallback(() => { setCursor(null); }, []);
  const { isLoading: isModelLoading, isReady: isHandTrackingReady, startTracking, webcamRef } = useGameHandTracking({
    gameName: 'MirrorDuel',
    targetFps: 30,
    isRunning: isPlaying,
    onFrame: handleFrame,
    onNoVideoFrame: handleNoVideoFrame,
  });

  useEffect(() => {
    if (isPlaying && !isHandTrackingReady && !isModelLoading) {
      void startTracking();
    }
  }, [isPlaying, isHandTrackingReady, isModelLoading, startTracking]);
  
  const level = getCurrentLevel(gameState.level);
  
  const handleRoundEnd = useCallback((matched: boolean) => {
    setGameState(prev => {
      const newState = scorePose(prev, matched);
      if (matched) {
        incrementStreak();
        playSuccess();
        triggerHaptic('success');
        // Trigger celebration effects on correct match
        setTriggerConfetti(true);
        setTimeout(() => setTriggerConfetti(false), 500);
      } else {
        resetStreak();
        playError();
        triggerHaptic('error');
      }

      // Start new round
      const updated = updatePose(newState);
      setTimeLeft(10);
      return updated;
    });
  }, [incrementStreak, resetStreak, playSuccess, playError]);
  
  // Timer countdown
  useEffect(() => {
    if (!gameState.isPlaying || showCelebration) return;
    
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleRoundEnd(false);
          return 10;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, [gameState.isPlaying, showCelebration, handleRoundEnd]);
  
  const handleStart = useCallback(() => {
    setShowMenu(false);
    setGameState(startGame(gameState));
    setTimeLeft(10);
    if (ttsEnabled) {
      speak(level.description);
    }
  }, [gameState, level, ttsEnabled, speak]);

  const handleReset = useCallback(() => {
    setGameState(resetLevel(gameState));
    setTimeLeft(10);
  }, [gameState]);
  
  const handleNextLevel = useCallback(() => {
    const newState = nextLevel(gameState);
    setGameState(newState);
    setShowCelebration(false);
    setTimeLeft(10);
    const newLevel = getCurrentLevel(newState.level);
    if (ttsEnabled) {
      speak(newLevel.description);
    }
  }, [gameState, ttsEnabled, speak]);
  
  const handleMenu = useCallback(() => {
    setShowMenu(true);
  }, []);

  // Draw skeleton overlay
  const drawSkeleton = useCallback((landmarks: any[]) => {
    try {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      const connections = [
        [11, 12], // Shoulders
        [11, 13], [13, 15], // Left arm
        [12, 14], [14, 16], // Right arm
        [11, 23], [12, 24], // Torso
        [23, 24], // Hips
      ];

      ctx.strokeStyle = '#9333ea';
      ctx.lineWidth = 3;

      connections.forEach(([i, j]) => {
        const p1 = landmarks[i];
        const p2 = landmarks[j];
        ctx.beginPath();
        ctx.moveTo(p1.x * width, p1.y * height);
        ctx.lineTo(p2.x * width, p2.y * height);
        ctx.stroke();
      });

      const keyPoints = [11, 12, 13, 14, 15, 16, 23, 24];
      keyPoints.forEach((i) => {
        const p = landmarks[i];
        ctx.beginPath();
        ctx.arc(p.x * width, p.y * height, 6, 0, 2 * Math.PI);
        ctx.fillStyle = '#9333ea';
        ctx.fill();
      });
    } catch (err) {
      console.error('Drawing failed:', err);
    }
  }, []);

  // Pose processing callback for the hook
  const handlePoseFrame = useCallback((landmarks: any[]) => {
    if (!canvasRef.current) return;

    // Set camera as ready once we receive landmarks
    if (!cameraReady) {
      setCameraReady(true);
    }

    // Get key body points
    const leftShoulder = landmarks[11];
    const rightShoulder = landmarks[12];
    const leftElbow = landmarks[13];
    const rightElbow = landmarks[14];
    const leftWrist = landmarks[15];
    const rightWrist = landmarks[16];

    // Calculate arm angles
    const leftArmAngle = calculateAngle(leftShoulder, leftElbow, leftWrist);
    const rightArmAngle = calculateAngle(rightShoulder, rightElbow, rightWrist);

    // Check target pose
    if (gameState.targetPose) {
      const targetPose = getPoseInfo(gameState.targetPose.id);
      let matchScore = 0;
      let targetCount = 0;

      if (targetPose.targets.leftArmAngle !== undefined) {
        const diff = Math.abs(leftArmAngle - targetPose.targets.leftArmAngle);
        matchScore += Math.max(0, 100 - diff * 2);
        targetCount++;
      }
      if (targetPose.targets.rightArmAngle !== undefined) {
        const diff = Math.abs(rightArmAngle - targetPose.targets.rightArmAngle);
        matchScore += Math.max(0, 100 - diff * 2);
        targetCount++;
      }
      if (targetPose.targets.armsAboveHead) {
        const armsUp = leftWrist.y < leftShoulder.y && rightWrist.y < rightShoulder.y;
        if (armsUp) matchScore += 100;
        targetCount++;
      }
      if (targetPose.targets.armsWide) {
        const shoulderWidth = Math.abs(rightShoulder.x - leftShoulder.x);
        const span = Math.abs(rightWrist.x - leftWrist.x);
        if (span > shoulderWidth * 1.5) matchScore += 100;
        targetCount++;
      }

      const finalScore = targetCount > 0 ? matchScore / targetCount : 0;
      setMatchProgress(finalScore);

      // Check if pose is matched
      if (finalScore > POSE_MATCH_THRESHOLD) {
        setHoldTime((prev) => {
          const newTime = prev + 50;
          if (newTime >= POSE_HOLD_DURATION) {
            handleRoundEnd(true);
            return 0;
          }
          return newTime;
        });
      } else {
        setHoldTime(0);
      }
    }

    // Draw skeleton
    drawSkeleton(landmarks);
  }, [cameraReady, gameState.targetPose, handleRoundEnd, drawSkeleton]);

  // Use the pose tracking hook
  const { isLoading: _isPoseLoading, error: _poseError, poseDetected: _poseDetected } = useGamePoseTracking({
    gameName: 'MirrorDuel',
    webcamRef,
    onFrame: handlePoseFrame,
    enabled: isPlaying,
  });

  // Dynamic voice prompts based on progress
  useEffect(() => {
    if (!isPlaying || !gameState.targetPose) return;

    const targetPose = getPoseInfo(gameState.targetPose.id);

    if (matchProgress < 30) {
      setVoicePrompt(targetPose.instruction);
    } else if (matchProgress < POSE_MATCH_THRESHOLD) {
      setVoicePrompt(`Almost there! Adjust your ${targetPose.name} pose.`);
    } else if (holdTime < POSE_HOLD_DURATION / 2) {
      setVoicePrompt(`Great! Hold the ${targetPose.name} pose!`);
    } else {
      setVoicePrompt('Keep holding! Almost there!');
    }
  }, [matchProgress, holdTime, isPlaying, gameState.targetPose]);
  
  useEffect(() => {
    if (gameState.isComplete && !showCelebration) {
      playSuccess();
      triggerHaptic('celebration');
      incrementStreak();
      setShowCelebration(true);
      setTriggerConfetti(true);
      setTimeout(() => setTriggerConfetti(false), 2000);

      const timeMs = Date.now() - gameState.startTime;
      const score = calculateScore(gameState.moves, timeMs, gameState.level);
      (async () => {
        await completeGame({ score, level: gameState.level });
      })();

      if (ttsEnabled) {
        speak('Amazing mirror master!');
      }
    }
  }, [gameState.isComplete, showCelebration, playSuccess, incrementStreak, completeGame, gameState, ttsEnabled, speak]);
  
  const gameControls: GameControl[] = [
    { id: 'reset', label: 'Reset', icon: 'rotate-ccw', onClick: handleReset },
    { id: 'menu', label: 'Menu', icon: 'home', onClick: handleMenu },
  ];
  
  const renderTargetPose = () => {
    if (!gameState.targetPose) return null;
    const info = getPoseInfo(gameState.targetPose.id);
    const holdProgress = (holdTime / POSE_HOLD_DURATION) * 100;

    return (
      <div className="text-center mb-6">
        <motion.div
          className="text-7xl mb-3"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 0.5, repeat: Infinity }}
        >
          {info.emoji}
        </motion.div>
        <div className="text-2xl font-bold text-gray-800">{info.name}</div>
        <div className="text-gray-600">{info.instruction}</div>

        {/* Match progress bar */}
        <div className="mt-4 max-w-xs mx-auto">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600">Match</span>
            <span className="font-bold text-purple-600">{Math.round(matchProgress)}%</span>
          </div>
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-400 to-purple-600 transition-all duration-200"
              style={{ width: `${Math.min(100, matchProgress)}%` }}
            />
          </div>
        </div>

        {/* Hold progress bar */}
        {matchProgress > POSE_MATCH_THRESHOLD && (
          <div className="mt-3 max-w-xs mx-auto">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Hold the pose!</span>
              <span className="font-bold text-green-600">{Math.round(holdProgress)}%</span>
            </div>
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-400 to-green-600 transition-all duration-100"
                style={{ width: `${holdProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>
    );
  };
  
  if (showMenu) {
    return (
      <GameContainer webcamRef={webcamRef} isHandDetected={isHandTrackingReady} isPlaying={isPlaying}>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8 p-8">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl font-bold text-purple-900 mb-2">👯 Mirror Duel</h1>
            <p className="text-xl text-purple-800">{level.name}</p>
            <p className="text-gray-600 mt-2">{level.description}</p>
          </motion.div>
          
          <motion.div
            className="bg-white/80 rounded-xl p-6 max-w-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-3">🎯 How to Play</h3>
            <ul className="text-gray-700 text-sm space-y-2">
              <li>• Match the pose shown on screen with your body!</li>
              <li>• Hold the pose until the progress bar fills</li>
              <li>• Score points for correct matches!</li>
              <li>• Hurry - you have 10 seconds each round!</li>
            </ul>
          </motion.div>
          
          <motion.button
            type="button"
            className="px-8 py-4 bg-purple-500 hover:bg-purple-400 text-white font-bold rounded-xl text-xl shadow-lg"
            onClick={handleStart}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Start Matching! 👯
          </motion.button>
          
          <VoiceInstructions
            instructions={`Welcome to Mirror Duel! ${level.description} Match the pose shown on screen!`}
          />
        </div>
      </GameContainer>
    );
  }
  
  return (
    <GameContainer webcamRef={webcamRef} isHandDetected={isHandTrackingReady} isPlaying={isPlaying}>
      <div ref={gameAreaRef} className="absolute inset-0">
      <VoiceInstructions
        instructions={voicePrompt || `${level.description} Match the pose shown!`}
        autoSpeak={true}
      />

      {/* Standardized HUD */}
      <div className="absolute top-0 left-0 right-0 z-10">
        <GameHUD
          score={gameState.score}
          streak={streak > 0 ? streak : undefined}
          levelInfo={`Level ${gameState.level} - ${level.name}`}
          round={gameState.round}
          totalRounds={level.targetScore}
          timeLeft={timeLeft}
          rightHeaderContent={
            <div className="bg-purple-100 px-3 py-1 rounded-lg font-bold text-purple-700 text-sm">
              {Math.round(matchProgress)}% Match
            </div>
          }
        />
      </div>

      {/* Game Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 pt-20">
        {renderTargetPose()}

        {/* Skeleton canvas overlay */}
        <div className="relative w-full max-w-2xl aspect-video">
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full pointer-events-none"
            width={640}
            height={360}
          />
        </div>

        {/* Streak indicator */}
        {streak > 1 && (
          <motion.div
            className="mt-4 text-lg font-bold text-orange-600"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
          >
            🔥 {streak} Streak!
          </motion.div>
        )}
      </div>
      
      <div className="absolute bottom-4 left-4">
        <GameControls controls={gameControls} position="bottom-left" />
      </div>
      
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <SuccessAnimation
              show={showCelebration}
              type="confetti"
              message="Mirror Master!"
              characterEmoji="👯"
              particleCount={50}
              duration={3000}
            />
            <motion.div
              className="absolute bg-white rounded-2xl p-8 text-center max-w-sm"
              initial={{ scale: 0.5, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ type: 'spring', damping: 15 }}
            >
              <div className="text-6xl mb-4">👯</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Mirror Master!
              </h2>
              <p className="text-gray-600 mb-4">
                Score: {gameState.score}
              </p>

              {gameState.level < 5 ? (
                <button
                  type="button"
                  className="w-full bg-purple-500 text-white py-3 rounded-xl font-bold"
                  onClick={handleNextLevel}
                >
                  Next Level
                </button>
              ) : (
                <button
                  type="button"
                  className="w-full bg-green-500 text-white py-3 rounded-xl font-bold"
                  onClick={handleMenu}
                >
                  Back to Menu
                </button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {cursor && <GameCursor position={cursor} coordinateSpace='normalized' containerRef={gameAreaRef} isPinching={false} isHandDetected={true} size={64} color='#9333ea' />}

      {/* Celebration effects */}
      <CelebrationEffects
        trigger={triggerConfetti}
        type={showCelebration ? 'confetti' : 'stars'}
        particleCount={showCelebration ? 50 : 15}
        duration={showCelebration ? 2500 : 1500}
      />
      </div>
    </GameContainer>
  );
});

// Export POSES for component use
const POSES = [
  { id: 'arms_up', name: 'Arms Up', emoji: '🙌', description: 'Raise both arms up!' },
  { id: 'arms_down', name: 'Arms Down', emoji: '👇', description: 'Put arms down at your sides!' },
  { id: 'arms_left', name: 'Left Arm', emoji: '👈', description: 'Point left with one arm!' },
  { id: 'arms_right', name: 'Right Arm', emoji: '👉', description: 'Point right with one arm!' },
  { id: 'arms_cross', name: 'Cross Arms', emoji: '🦾', description: 'Cross your arms!' },
  { id: 'arms_wings', name: 'Arms Wings', emoji: '🕊️', description: 'Spread arms like wings!' },
  { id: 'arms_wave', name: 'Wave', emoji: '👋', description: 'Wave hello!' },
  { id: 'legs_apart', name: 'Legs Apart', emoji: '🧍', description: 'Stand with legs apart!' },
  { id: 'legs_kneel', name: 'Kneel', emoji: '🙏', description: 'Kneel down!' },
  { id: 'legs_lunge', name: 'Lunge', emoji: '🏃', description: 'Step forward into a lunge!' },
  { id: 'legs_kick', name: 'Kick', emoji: '🦵', description: 'Kick one leg up!' },
  { id: 'pose_jump', name: 'Jump', emoji: '⭐', description: 'Jump in the air!' },
];

(window as any).POSES = POSES;

export const MirrorDuel = memo(function MirrorDuelShell() {
  return (
    <GameShell gameId='mirror-duel' gameName='Mirror Duel'>
      <MirrorDuelContent />
    </GameShell>
  );
});

export default MirrorDuel;
