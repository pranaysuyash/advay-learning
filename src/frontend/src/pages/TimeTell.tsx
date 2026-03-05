/**
 * Time Tell Game - REFACTORED with GameShell, TargetSystem, and TTS
 * 
 * @ticket GQ-002, GQ-003, GQ-004, GQ-005, GQ-007
 */

import { memo, useCallback, useState, useEffect, useRef } from 'react';


import { GameShell } from '../components/GameShell';
import { useAudio } from '../utils/hooks/useAudio';
import { useGameDrops } from '../hooks/useGameDrops';
import { useGameSessionProgress } from '../hooks/useGameSessionProgress';
import { triggerHaptic } from '../utils/haptics';
import { LEVELS, generateTime, formatTime, type TimeQuestion } from '../games/timeTellLogic';
import { TargetSystem, type Target } from '../components/game/TargetSystem';
import { GameCursor } from '../components/game/GameCursor';
import { HandTrackingStatus } from '../components/game/HandTrackingStatus';
import { CameraThumbnail } from '../components/game/CameraThumbnail';
import { SuccessAnimation } from '../components/game/SuccessAnimation';
import { VoiceInstructions, GAME_INSTRUCTIONS, useVoiceInstructions } from '../components/game/VoiceInstructions';
import { useGameHandTracking } from '../hooks/useGameHandTracking';
import type { TrackedHandFrame } from '../types/tracking';
import { STREAK_MILESTONE_INTERVAL } from '../games/constants';
import { useWindowSize } from '../hooks/useWindowSize';

function renderClock(hour: number, minute: number, size: number = 240) {
  const hourAngle = (hour % 12) * 30 + (minute / 60) * 30;
  const minuteAngle = minute * 6;

  return (
    <div
      className="relative rounded-full border-8 border-indigo-700 bg-white shadow-xl mx-auto flex items-center justify-center transition-all"
      style={{ width: size, height: size, boxShadow: 'inset 0 4px 12px rgba(0,0,0,0.1), 0 10px 25px rgba(0,0,0,0.15)' }}
    >
      {/* Clock numbers/ticks */}
      {[...Array(12)].map((_, i) => (
        <div key={i} className="absolute inset-0 flex items-start justify-center" style={{ transform: `rotate(${i * 30}deg)` }}>
          <div className={`mt-2 ${i % 3 === 0 ? 'w-2 h-6 bg-indigo-800 rounded-full' : 'w-1 h-3 bg-indigo-300 rounded-full'}`} />
        </div>
      ))}

      {/* Hour Hand */}
      <div
        className="absolute bottom-1/2 left-1/2 w-[8px] h-[30%] bg-indigo-800 rounded-full origin-bottom"
        style={{ transform: `translateX(-50%) rotate(${hourAngle}deg)` }}
      />

      {/* Minute Hand */}
      <div
        className="absolute bottom-1/2 left-1/2 w-[5px] h-[42%] bg-indigo-500 rounded-full origin-bottom"
        style={{ transform: `translateX(-50%) rotate(${minuteAngle}deg)` }}
      />

      {/* Center Pin */}
      <div className="absolute w-4 h-4 bg-indigo-900 rounded-full shadow-md z-10" />
    </div>
  );
}

function TimeTellGameComponent() {
  const { onGameComplete } = useGameDrops('time-tell');
  const { playClick, playSuccess, playError, playPop } = useAudio();
  const webcamRef = useRef<Webcam>(null);

  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [isPinching, setIsPinching] = useState(false);
  const [isHandDetected, setIsHandDetected] = useState(false);
  const lastHandStateRef = useRef(false);

  const [currentLevel, setCurrentLevel] = useState(1);
  const [gameStarted, setGameStarted] = useState(false);

  const [question, setQuestion] = useState<TimeQuestion | null>(null);

  const [targets, setTargets] = useState<Target[]>([]);
  const [score, setScore] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [round, setRound] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [streak, setStreak] = useState(0);
  const [showStreakMilestone, setShowStreakMilestone] = useState(false);

  const { speak } = useVoiceInstructions();

  const screenDims = useWindowSize();

  useGameSessionProgress({
    gameName: 'Time Tell',
    score,
    level: currentLevel,
    isPlaying: gameStarted,
    metaData: { correct, round }
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
      gameName: 'TimeTell',
      isRunning: gameStarted,
      webcamRef,
      onFrame: handleHandFrame,
    });

  useEffect(() => {
    if (gameStarted && !isHandTrackingReady && !isModelLoading) {
      void startTracking();
    }
  }, [gameStarted, isHandTrackingReady, isModelLoading, startTracking]);

  const setupRound = useCallback((levelOverride?: number) => {
    const activeLevel = levelOverride || currentLevel;
    const newQuestion = generateTime(activeLevel);
    setQuestion(newQuestion);

    const correctAns = formatTime(newQuestion.hour, newQuestion.minute);

    // Generate distractors
    const newOptions = [
      correctAns,
      formatTime((newQuestion.hour % 12) + 1, newQuestion.minute),
      formatTime(newQuestion.hour === 1 ? 12 : newQuestion.hour - 1, newQuestion.minute),
      formatTime(newQuestion.hour, newQuestion.minute === 0 ? 30 : 0),
    ].sort(() => Math.random() - 0.5);

    // Position targets below the clock
    const targetY = screenDims.height - 150;
    const spacing = Math.min(screenDims.width / (newOptions.length + 1), 200);
    const startX = screenDims.width / 2 - (spacing * 1.5);

    const newTargets: Target[] = newOptions.map((opt, i) => ({
      id: opt,
      x: startX + (spacing * i),
      y: targetY,
      size: 140, // Nice large rounded boxes
      content: opt,
      active: true,
      color: '#E0E7FF' // indigo-100
    }));

    setTargets(newTargets);
    setFeedback('');
    setShowSuccess(false);

    speak('What time is shown on the clock?');
  }, [currentLevel, screenDims, speak]);

  const handleGameOver = useCallback(async () => {
    setGameStarted(false);
    playSuccess();
    speak(`Great job! You told the time ${correct} times perfectly!`);
    await onGameComplete(correct);
  }, [correct, playSuccess, speak, onGameComplete]);

  const handleTargetHit = useCallback(async (target: Target) => {
    if (showSuccess || !question) return;

    const selectedAnswer = target.id;
    const correctAnswer = formatTime(question.hour, question.minute);

    if (selectedAnswer === correctAnswer) {
      // Streak and scoring
      const newStreak = streak + 1;
      setStreak(newStreak);
      const basePoints = 25;
      const streakBonus = Math.min(newStreak * 3, 20);
      const totalPoints = basePoints + streakBonus;
      
      playSuccess();
      triggerHaptic('success');
      setCorrect(c => c + 1);
      setScore(s => s + totalPoints);
      setFeedback('Perfect time!');
      setShowSuccess(true);
      speak(`Yes! It is ${correctAnswer}`);

      // Milestone every 5
      if (newStreak > 0 && newStreak % STREAK_MILESTONE_INTERVAL === 0) {
        setShowStreakMilestone(true);
        triggerHaptic('celebration');
        setTimeout(() => setShowStreakMilestone(false), 1500);
      }

      setTimeout(() => {
        if (round >= 4) {
          void handleGameOver();
        } else {
          setRound(r => r + 1);
          setupRound();
        }
      }, 2000);

    } else {
      playError();
      setFeedback(`Oops! Try again.`);
      speak(`Hmm, that's not it. Look at the short hand for the hour.`);

      // Temporarily flash internal target red, or hide it
      setTargets(prev => prev.map(t =>
        t.id === target.id ? { ...t, active: false } : t
      ));

      // Bring target back after delay
      setTimeout(() => {
        setTargets(prev => prev.map(t =>
          t.id === target.id ? { ...t, active: true } : t
        ));
      }, 1500);
    }
  }, [question, showSuccess, round, playSuccess, playError, speak, setupRound, handleGameOver]);

  const startGame = useCallback(() => {
    setGameStarted(true);
    setScore(0);
    setCorrect(0);
    setStreak(0);
    setShowStreakMilestone(false);
    setRound(0);
    playPop();
    setupRound();
  }, [playPop, setupRound]);

  return (
    <div className='w-screen h-screen overflow-hidden relative font-sans bg-indigo-50'>
      <CameraThumbnail isHandDetected={isHandDetected} visible={gameStarted} />

      <HandTrackingStatus
        isHandDetected={isHandDetected}
        pauseOnHandLost={true}
        voicePrompt={true}
        showMascot={true}
      />

      {gameStarted && question && (
        <>
          {/* Top HUD */}
          <div className='absolute top-6 left-1/2 -translate-x-1/2 z-10 bg-white/95 backdrop-blur-sm rounded-[2rem] px-8 py-4 border-3 border-indigo-300 shadow-[0_4px_0_#A5B4FC] flex items-center gap-8'>
            <div className="flex flex-col items-center">
              <span className='text-xs font-bold uppercase tracking-widest text-slate-400'>Score</span>
              <span className='text-2xl font-black text-indigo-600'>{score}</span>
            </div>
            <div className="flex flex-col items-center border-l-2 border-slate-100 pl-8">
              <span className='text-xs font-bold uppercase tracking-widest text-slate-400'>Correct</span>
              <span className='text-2xl font-black text-green-600'>{correct}</span>
            </div>
            <div className="flex flex-col items-center border-l-2 border-slate-100 pl-8">
              <span className='text-xs font-bold uppercase tracking-widest text-slate-400'>Round</span>
              <span className='text-2xl font-black text-slate-700'>{round + 1}/5</span>
            </div>
            {streak > 0 && (
              <div className="flex flex-col items-center border-l-2 border-slate-100 pl-8">
                <span className='text-xs font-bold uppercase tracking-widest text-orange-400'>Streak</span>
                <span className='text-2xl font-black text-orange-600'>🔥 {streak}</span>
              </div>
            )}
          </div>

          {/* Main Game Area */}
          <div className='absolute top-32 left-0 right-0 bottom-0 pointer-events-none z-0'>
            <div className="text-center mb-8">
              <div className="mt-8 bg-white/90 px-8 py-4 rounded-3xl shadow-sm border-2 border-indigo-100 inline-block mb-8">
                <p className="text-3xl font-black text-indigo-800">
                  What time is shown?
                </p>
              </div>
              {renderClock(question.hour, question.minute, 280)}
            </div>

            {feedback && (
              <div className="text-center mt-4">
                <p className={`text-2xl font-bold ${feedback.includes('Perfect') ? 'text-green-500' : 'text-red-500'}`}>
                  {feedback}
                </p>
              </div>
            )}
          </div>
        </>
      )}

      {/* Title Screen */}
      {!gameStarted && (
        <div className='absolute inset-0 flex flex-col items-center justify-center gap-8 bg-indigo-900/60 backdrop-blur-md z-20'>
          <div className='flex flex-col items-center justify-center bg-white border-4 border-indigo-400 rounded-[3rem] p-10 md:p-14 shadow-[0_12px_40px_rgba(0,0,0,0.3)] text-center max-w-2xl w-[90%]'>
            <div className='text-[8rem] mb-6 drop-shadow-lg'>🕐</div>
            <h1 className='text-6xl font-black text-indigo-600 tracking-tight mb-4 drop-shadow-sm'>
              Time Tell
            </h1>
            <p className='text-slate-500 font-bold mb-8 text-xl leading-relaxed max-w-md'>
              Learn to read the clock! Hover and pinch the correct digital time!
            </p>

            <div className="flex gap-4 mb-8">
              {LEVELS.map((l) => (
                <button type="button" key={l.level} onClick={() => { playClick(); setCurrentLevel(l.level); }}
                  className={`px-6 py-3 rounded-2xl font-black transition-all ${currentLevel === l.level ? 'bg-indigo-500 text-white shadow-lg translate-y-[-2px]' : 'bg-slate-100 text-slate-500 border-2 border-slate-200'}`}>
                  Level {l.level}
                </button>
              ))}
            </div>

            <button
              onClick={() => { playClick(); startGame(); }}
              className='px-14 py-6 bg-indigo-500 hover:bg-indigo-600 border-b-[6px] border-indigo-700 text-white rounded-[2rem] font-black text-3xl shadow-xl transition-all hover:translate-y-1 hover:border-b-[4px] active:translate-y-2 active:border-b-0'
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

      {/* Interactive Targets */}
      {gameStarted && (
        <TargetSystem
          targets={targets}
          cursorPosition={cursorPosition}
          isPinching={isPinching}
          onTargetHit={handleTargetHit}
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
        />
      )}

      <SuccessAnimation
        show={showSuccess}
        type='stars'
        message='Perfect!'
        duration={1500}
        onComplete={() => { setShowSuccess(false); }}
      />
      
      {/* Streak Milestone Overlay */}
      {showStreakMilestone && (
        <div className='fixed inset-0 flex items-center justify-center pointer-events-none z-50'>
          <div className='bg-gradient-to-r from-orange-400 to-red-500 text-white px-8 py-4 rounded-full font-bold text-2xl shadow-lg animate-bounce'>
            🔥 {streak} Streak! 🔥
          </div>
        </div>
      )}
    </div>
  );
}

// Main export wrapped with GameShell
export const TimeTell = memo(function TimeTellWrapper() {
  return (
    <GameShell
      gameId="time-tell"
      gameName="Time Tell"
      showWellnessTimer={true}
      enableErrorBoundary={true}
    >
      <TimeTellGameComponent />
    </GameShell>
  );
});

export default TimeTell;
