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
 * - Click pose buttons if camera unavailable
 */

import { memo, useCallback, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { GameShell } from '../components/GameShell';
import { GameContainer } from '../components/GameContainer';
import { GameControls } from '../components/GameControls';
import type { GameControl } from '../components/GameControls';
import { useAudio } from '../utils/hooks/useAudio';
import { useGameCompletion } from '../hooks/useGameCompletion';
import { useStreakTracking } from '../hooks/useStreakTracking';
import { triggerHaptic } from '../utils/haptics';
import { useTTS } from '../hooks/useTTS';
import { VoiceInstructions } from '../components/game/VoiceInstructions';
import {
  initializeGame,
  getCurrentLevel,
  updatePose,
  scorePose,
  startGame,
  resetLevel,
  nextLevel,
  calculateScore,
  getPoseInfo,
  type GameState,
  type Pose,
} from '../games/mirrorDuelLogic';

const MirrorDuelContent = memo(function MirrorDuelContent() {
  const [showMenu, setShowMenu] = useState(true);
  const [gameState, setGameState] = useState<GameState>(() => initializeGame(1));
  const [showCelebration, setShowCelebration] = useState(false);
  const [timeLeft, setTimeLeft] = useState(10);
  
  const { streak, incrementStreak, resetStreak } = useStreakTracking();
  const { playSuccess, playError } = useAudio();
  const { speak, isEnabled: ttsEnabled } = useTTS();
  const { completeGame } = useGameCompletion('mirror-duel');
  
  const level = getCurrentLevel(gameState.level);
  
  const handleRoundEnd = useCallback((matched: boolean) => {
    setGameState(prev => {
      const newState = scorePose(prev, matched);
      if (matched) {
        incrementStreak();
        playSuccess();
        triggerHaptic('success');
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
  
  const handlePoseSelected = useCallback((pose: Pose) => {
    const match = pose.id === gameState.targetPose?.id;
    handleRoundEnd(match);
  }, [gameState.targetPose, handleRoundEnd]);
  
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
  
  useEffect(() => {
    if (gameState.isComplete && !showCelebration) {
      playSuccess();
      triggerHaptic('celebration');
      incrementStreak();
      setShowCelebration(true);

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
        <div className="text-gray-600">{info.description}</div>
      </div>
    );
  };
  
  if (showMenu) {
    return (
      <GameContainer>
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
              <li>• Match the pose shown on screen</li>
              <li>• Click the matching pose button</li>
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
    <GameContainer>
      <VoiceInstructions
        instructions={`${level.description} Match the pose shown!`}
      />
      
      {/* Header */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
        <div className="bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2 shadow-lg">
          <div className="text-sm text-gray-600">Level {gameState.level}</div>
          <div className="text-lg font-bold text-purple-900">{level.name}</div>
        </div>
        
        <div className="bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2 shadow-lg">
          <div className="text-sm text-gray-600">Score</div>
          <div className="text-lg font-bold text-purple-900">{gameState.score} / {level.targetScore}</div>
        </div>
        
        <div className="bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2 shadow-lg">
          <div className="text-sm text-gray-600">Round</div>
          <div className="text-lg font-bold text-gray-800">{gameState.round}</div>
        </div>
        
        <div className={`bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2 shadow-lg ${timeLeft <= 3 ? 'text-red-600' : ''}`}>
          <div className="text-sm text-gray-600">Time</div>
          <div className="text-lg font-bold">{timeLeft}s</div>
        </div>
      </div>
      
      {/* Game Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 pt-20">
        {renderTargetPose()}
        
        <div className="w-full max-w-2xl bg-white/80 rounded-xl p-6 shadow-lg">
          <h3 className="text-center text-gray-600 mb-4">Select the matching pose:</h3>
          
          {gameState.targetPose && (
            <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
              {gameState.targetPose && (
                <button
                  type="button"
                  className="p-4 rounded-xl text-3xl bg-white shadow-md hover:scale-105 transition-all"
                  onClick={() => handlePoseSelected(gameState.targetPose!)}
                >
                  {gameState.targetPose.emoji}
                </button>
              )}
            </div>
          )}
          
          <div className="mt-4 text-center text-sm text-gray-600">
            Match count: {gameState.score}
          </div>
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
            <motion.div
              className="bg-white rounded-2xl p-8 text-center max-w-sm"
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
