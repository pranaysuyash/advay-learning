/**
 * Math Smash Game
 *
 * @ticket GQ-002, GQ-003, GQ-004, GQ-005, GQ-007
 */

import { memo, useCallback, useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GameShell } from '../components/GameShell';
import { useAudio } from '../utils/hooks/useAudio';
import { useGameDrops } from '../hooks/useGameDrops';
import { useGameSessionProgress } from '../hooks/useGameSessionProgress';
import { LEVELS, generateQuestion, generateOptions, type Question } from '../games/mathSmashLogic';
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
import { useStreakTracking } from '../hooks/useStreakTracking';
import type { TrackedHandFrame } from '../types/tracking';
import { TargetSystem } from '../components/game/TargetSystem';
import type { Target } from '../components/game/TargetSystem';
import type { ScreenCoordinate } from '../utils/coordinateTransform';
import { triggerHaptic } from '../utils/haptics';
import { useWindowSize } from '../hooks/useWindowSize';

function MathSmashGameComponent() {
  const { onGameComplete } = useGameDrops('math-smash');
  const { playClick, playSuccess, playError, playPop } = useAudio();
  const webcamRef = useRef<Webcam>(null);

  const [cursorPosition, setCursorPosition] = useState<ScreenCoordinate>({ x: 0, y: 0 });
  const [isPinching, setIsPinching] = useState(false);
  const [isHandDetected, setIsHandDetected] = useState(false);
  const lastHandStateRef = useRef(false);

  const [currentLevel, setCurrentLevel] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [question, setQuestion] = useState<Question | null>(null);
  const [targets, setTargets] = useState<Target[]>([]);

  const [showSuccess, setShowSuccess] = useState(false);
  const [score, setScore] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [round, setRound] = useState(0);

  // Combo/Streak System
  const { streak, showMilestone, scorePopup, incrementStreak, resetStreak, setScorePopup } = useStreakTracking();

  const { speak } = useVoiceInstructions();

  const screenDims = useWindowSize();

  useGameSessionProgress({
    gameName: 'Math Smash',
    score,
    level: currentLevel + 1,
    isPlaying: gameStarted,
    metaData: { correct, round, streak },
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
      gameName: 'MathSmash',
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

    const levelObj = LEVELS[currentLevel];
    const newQuestion = generateQuestion(levelObj.level);
    const answers = generateOptions(newQuestion.answer, 4);

    setQuestion(newQuestion);

    // Create stone blocks for answers
    const newTargets: Target[] = answers.map((ans, i) => {
      const isAnsCorrect = ans === newQuestion.answer;
      return {
        id: `ans-${ans}-${i}`,
        x: screenDims.width / 4 + (i % 2) * (screenDims.width / 2),
        y: screenDims.height / 2 + Math.floor(i / 2) * 160 + 40,
        size: 140,
        content: (
          <div className="w-full h-full bg-slate-700 border-b-[8px] border-slate-900 rounded-[2rem] flex items-center justify-center text-5xl font-black text-white shadow-xl transform transition-transform hover:scale-105">
            {ans}
          </div>
        ),
        color: '#475569',
        data: { value: ans, isCorrect: isAnsCorrect },
        isActive: true,
      };
    });

    setTargets(newTargets);
  }, [gameStarted, round, currentLevel, screenDims]);

  const handleSmash = useCallback((target: Target) => {
    if (target.data.isCorrect) {
      // Calculate streak and score
      const newStreak = incrementStreak();

      const basePoints = 10;
      const streakBonus = Math.min(newStreak * 2, 15);
      const totalPoints = basePoints + streakBonus;

      // Show score popup at center of screen
      setScorePopup({ points: totalPoints, x: 50, y: 30 });

      // Trigger haptic feedback for correct answer
      triggerHaptic('success');

      playSuccess();
      setCorrect(c => c + 1);
      setScore(s => s + totalPoints);
      setShowSuccess(true);
      speak('Smashing! You got it!');

      setTargets(prev => prev.filter(t => t.id !== target.id));

      setTimeout(() => {
        if (round >= 4) {
          if (currentLevel < LEVELS.length - 1) {
            setCurrentLevel(l => l + 1);
            setRound(0);
            speak("Awesome! Let's try harder math!");
          } else {
            onGameComplete(correct + 1);
            speak("You're a Math Master!");
          }
        } else {
          setRound(r => r + 1);
        }
      }, 2000);
    } else {
      // Wrong answer: reset streak and trigger error haptic
      resetStreak();
      triggerHaptic('error');
      playError();
      speak(`Oops! The answer is not ${target.data.value}. Try again!`);
      // Shake animation could go here
    }
  }, [round, currentLevel, correct, speak, onGameComplete, playSuccess, playError, incrementStreak, resetStreak, setScorePopup]);

  const startGame = useCallback(() => {
    setGameStarted(true);
    setCurrentLevel(0);
    setScore(0);
    setCorrect(0);
    setRound(0);
    // Reset streak state
    resetStreak();
    playPop();
    speak('Pinch to smash the correct answer!');
  }, [speak, playPop, resetStreak]);

  return (
    <div className='w-screen h-screen overflow-hidden relative bg-slate-100 font-sans'>
      <CameraThumbnail webcamRef={webcamRef} isHandDetected={isHandDetected} visible={gameStarted} />

      {gameStarted && (
        <HandTrackingStatus
          isHandDetected={isHandDetected}
          pauseOnHandLost={true}
          voicePrompt={true}
          showMascot={true}
        />
      )}

      {gameStarted && question && (
        <>
          {/* Updated HUD with streak counter */}
          <div className='absolute top-6 left-1/2 -translate-x-1/2 z-10 bg-white/95 backdrop-blur-sm rounded-[2rem] px-8 py-4 border-3 border-red-300 shadow-[0_4px_0_#FCA5A5] flex items-center gap-6'>
            <span className='text-5xl drop-shadow-md text-red-500'>🔨</span>
            <div>
              <h2 className='text-2xl font-black text-slate-700 tracking-tight m-0'>Level {LEVELS[currentLevel].level}</h2>
              <p className='text-lg font-bold text-red-600 m-0'>Score: {score}</p>
            </div>
            {/* Streak counter */}
            {streak > 0 && (
              <div className='flex items-center gap-2 bg-orange-100 px-4 py-2 rounded-full border-2 border-orange-300'>
                <span className='text-2xl'>🔥</span>
                <span className='text-xl font-black text-orange-600'>{streak}</span>
              </div>
            )}
          </div>

          <div className='absolute top-36 left-1/2 -translate-x-1/2 px-12 py-6 rounded-[2.5rem] bg-white border-4 border-red-400 text-center shadow-[0_6px_0_#F87171] z-20'>
            <p className='text-xs font-bold uppercase tracking-widest text-slate-400 mb-1'>Solve this</p>
            <p className="text-6xl md:text-7xl font-black text-slate-800 tracking-tighter">
              {question.num1} <span className="text-red-500">{question.operator}</span> {question.num2} = ?
            </p>
          </div>
        </>
      )}

      {!gameStarted && (
        <div className='absolute inset-0 flex flex-col items-center justify-center gap-8 bg-slate-200/80 backdrop-blur-sm z-20'>
          <div className='flex flex-col items-center justify-center bg-white border-4 border-red-400 rounded-[2.5rem] p-8 md:p-12 shadow-[0_8px_0_#F87171] text-center max-w-2xl w-[90%]'>
            <div className='text-[6rem] mb-4 drop-shadow-lg hover:scale-110 transition-transform'>🔨</div>
            <h1 className='text-5xl font-black text-red-600 tracking-tight mb-4 drop-shadow-sm'>
              Math Smash
            </h1>
            <p className='text-slate-500 font-bold mb-8 text-xl leading-relaxed'>
              Pinch the correct answer block to smash it!
            </p>
            <button
              onClick={() => { playClick(); startGame(); }}
              className='px-12 py-5 bg-red-500 hover:bg-red-600 border-4 border-red-600 text-white rounded-[1.5rem] font-black text-2xl shadow-[0_6px_0_#991B1B] transition-all hover:translate-y-1 hover:shadow-[0_2px_0_#991B1B] active:translate-y-2 active:shadow-none'
            >
              Start Smashing!
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
        <TargetSystem
          targets={targets}
          cursorPosition={cursorPosition}
          isPinching={isPinching}
          onTargetHit={handleSmash}
          enableMagneticSnap={true}
          magneticThreshold={100}
          hitboxMultiplier={1.5}
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
          icon="hammer"
        />
      )}

      <SuccessAnimation
        show={showSuccess}
        type='confetti'
        message='Smashing!'
        duration={1500}
        onComplete={() => { setShowSuccess(false); }}
      />

      {/* Score Popup Animation */}
      <AnimatePresence>
        {scorePopup && (
          <motion.div
            initial={{ opacity: 0, y: 0, scale: 0.5 }}
            animate={{ opacity: 1, y: -50, scale: 1.2 }}
            exit={{ opacity: 0, y: -80, scale: 0.8 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className='absolute z-50 pointer-events-none'
            style={{
              left: `${scorePopup.x}%`,
              top: `${scorePopup.y}%`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            <div className='text-4xl font-black text-green-500 drop-shadow-lg'>
              +{scorePopup.points}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Streak Milestone Animation */}
      <AnimatePresence>
        {showMilestone && (
          <motion.div
            initial={{ opacity: 0, scale: 0.3, rotate: -20 }}
            animate={{ opacity: 1, scale: 1.2, rotate: 0 }}
            exit={{ opacity: 0, scale: 1.5, rotate: 20 }}
            transition={{ duration: 0.4, ease: 'backOut' }}
            className='absolute inset-0 flex items-center justify-center z-50 pointer-events-none'
          >
            <div className='bg-gradient-to-r from-orange-400 to-red-500 text-white px-8 py-4 rounded-[2rem] shadow-2xl border-4 border-white'>
              <div className='text-5xl font-black text-center'>
                🔥 {streak} STREAK! 🔥
              </div>
              <div className='text-xl font-bold text-center mt-2'>
                Keep it up!
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Main export wrapped with GameShell
export const MathSmash = memo(function MathSmashWrapper() {
  return (
    <GameShell
      gameId="math-smash"
      gameName="Math Smash"
      showWellnessTimer={true}
      enableErrorBoundary={true}
    >
      <MathSmashGameComponent />
    </GameShell>
  );
});

export default MathSmash;
