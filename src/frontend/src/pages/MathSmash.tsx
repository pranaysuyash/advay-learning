/**
 * Math Smash Game
 * 
 * @ticket GQ-002, GQ-003, GQ-004, GQ-005, GQ-007
 */

import { memo, useCallback, useState, useEffect, useRef } from 'react';
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
import type { TrackedHandFrame } from '../types/tracking';
import { TargetSystem } from '../components/game/TargetSystem';
import type { Target } from '../components/game/TargetSystem';
import type { ScreenCoordinate } from '../utils/coordinateTransform';

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

  const { speak } = useVoiceInstructions();

  const [screenDims, setScreenDims] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useGameSessionProgress({
    gameName: 'Math Smash',
    score,
    level: currentLevel + 1,
    isPlaying: gameStarted,
    metaData: { correct, round },
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
      playSuccess();
      setCorrect(c => c + 1);
      setScore(s => s + 25);
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
      playError();
      speak(`Oops! The answer is not ${target.data.value}. Try again!`);
      // Shake animation could go here
    }
  }, [round, currentLevel, correct, speak, onGameComplete, playSuccess, playError]);

  const startGame = useCallback(() => {
    setGameStarted(true);
    setCurrentLevel(0);
    setScore(0);
    setCorrect(0);
    setRound(0);
    playPop();
    speak('Pinch to smash the correct answer!');
  }, [speak, playPop]);

  return (
    <div className='w-screen h-screen overflow-hidden relative bg-slate-100 font-sans'>
      <CameraThumbnail isHandDetected={isHandDetected} visible={gameStarted} />

      <HandTrackingStatus
        isHandDetected={isHandDetected}
        pauseOnHandLost={true}
        voicePrompt={true}
        showMascot={true}
      />

      {gameStarted && question && (
        <>
          <div className='absolute top-6 left-1/2 -translate-x-1/2 z-10 bg-white/95 backdrop-blur-sm rounded-[2rem] px-8 py-4 border-3 border-red-300 shadow-[0_4px_0_#FCA5A5] flex items-center gap-6'>
            <span className='text-5xl drop-shadow-md text-red-500'>🔨</span>
            <div>
              <h2 className='text-2xl font-black text-slate-700 tracking-tight m-0'>Level {LEVELS[currentLevel].level}</h2>
              <p className='text-lg font-bold text-red-600 m-0'>Score: {score}</p>
            </div>
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
