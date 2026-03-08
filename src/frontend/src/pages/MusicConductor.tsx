import { useCallback, useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { GameContainer } from '../components/GameContainer';
import { useAudio } from '../utils/hooks/useAudio';
import { useGameDrops } from '../hooks/useGameDrops';
import { useGameSessionProgress } from '../hooks/useGameSessionProgress';
import { triggerHaptic } from '../utils/haptics';
import {
  LEVELS,
  updateNotes,
  checkNoteHit,
  generatePattern,
  calculateComboScore,
  type ConductorNote,
} from '../games/musicConductorLogic';
import { CelebrationOverlay } from '../components/CelebrationOverlay';
import { HandTrackingStatus } from '../components/game/HandTrackingStatus';
import { CameraThumbnail } from '../components/game/CameraThumbnail';
import { GameCursor } from '../components/game/GameCursor';
import { useGameHandTracking } from '../hooks/useGameHandTracking';
import type { TrackedHandFrame } from '../types/tracking';
import { useWindowSize } from '../hooks/useWindowSize';
import {
  VoiceInstructions,
  useVoiceInstructions,
} from '../components/game/VoiceInstructions';

const LANE_COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'];
const HIT_Y = 0.85;

export function MusicConductor() {
  const navigate = useNavigate();
  const screenDims = useWindowSize();
  const [notes, setNotes] = useState<ConductorNote[]>([]);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [gameState, setGameState] = useState<'start' | 'playing' | 'complete'>(
    'start',
  );
  const [showCelebration, setShowCelebration] = useState(false);
  const [laneActive, setLaneActive] = useState<boolean[]>([
    false,
    false,
    false,
    false,
  ]);
  const [streak, setStreak] = useState(0);
  const [showStreakMilestone, setShowStreakMilestone] = useState(false);

  const startTimeRef = useRef<number>(0);
  const lastNoteTimeRef = useRef<number>(0);
  const animationRef = useRef<number>(0);
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);

  const webcamRef = useRef<Webcam>(null);
  const [cursorPosition, setCursorPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isHandDetected, setIsHandDetected] = useState(false);
  const lastHandStateRef = useRef(false);
  const { speak } = useVoiceInstructions();
  const [isHandInHitZone, setIsHandInHitZone] = useState(false);

  const { playClick, playSuccess, playPop } = useAudio();
  const { onGameComplete } = useGameDrops('music-conductor');
  const level = LEVELS[currentLevelIndex];

  useGameSessionProgress({
    gameName: 'Music Conductor',
    score,
    level: level.level,
    isPlaying: gameState === 'playing',
    metaData: { streak, combo }
  });

  const handleLaneTap = useCallback(
    (lane: number) => {
      if (gameState !== 'playing') return;
      if (lane >= level.lanes) return;

      setLaneActive((prev) => {
        const newPoses = [...prev];
        newPoses[lane] = true;
        return newPoses;
      });

      setNotes((prev) => {
        const { hit, score: noteScore } = checkNoteHit(prev, lane, HIT_Y, level.hitTolerance);
        if (hit) {
          const comboScore = calculateComboScore(noteScore, combo);
          setScore((s) => s + comboScore);
          setCombo((c) => c + 1);

          // Streak tracking
          const newStreak = streak + 1;
          setStreak(newStreak);
          playClick();
          triggerHaptic('success');

          // Milestone every 10
          if (newStreak > 0 && newStreak % 10 === 0) {
            setShowStreakMilestone(true);
            triggerHaptic('celebration');
            setTimeout(() => setShowStreakMilestone(false), 1200);
          }

          return prev.map((n) => (n.id === hit.id ? { ...n, hit: true } : n));
        } else {
          // It's a "miss" tap, don't instantly kill combo unless there was actually a note there they missed.
          // But for strict rhythm games, mistapping is a combo break. For kids, let's keep it forgiving and only play pop.
          playPop();
          return prev;
        }
      });

      setTimeout(() => {
        setLaneActive((prev) => {
          const newPoses = [...prev];
          newPoses[lane] = false;
          return newPoses;
        });
      }, 150);
    },
    [combo, playClick, playPop, streak, level, gameState],
  );

  const handleHandFrame = useCallback((frame: TrackedHandFrame) => {
    if (gameState !== 'playing') return;
    const tip = frame.indexTip;

    if (tip) {
      const screenX = tip.x * screenDims.width;
      const screenY = tip.y * screenDims.height;
      setCursorPosition({ x: screenX, y: screenY });

      // Hit zone logic
      const inHitZone = tip.y > 0.70; // Bottom 30% of screen

      if (inHitZone && !isHandInHitZone) {
        // Entered hit zone, trigger the corresponding lane
        const laneWidth = screenDims.width / level.lanes;
        const laneIndex = Math.floor(screenX / laneWidth);
        if (laneIndex >= 0 && laneIndex < level.lanes) {
          handleLaneTap(laneIndex);
        }
        setIsHandInHitZone(true);
      } else if (!inHitZone && isHandInHitZone) {
        // Left hit zone
        setIsHandInHitZone(false);
      }

      if (!lastHandStateRef.current) {
        setIsHandDetected(true);
        lastHandStateRef.current = true;
        speak("I see your hand! Keep conducting!");
      }
    } else {
      if (lastHandStateRef.current) {
        setIsHandDetected(false);
        lastHandStateRef.current = false;
        speak("I can't see your hand! Show it to the camera!");
      }
    }
  }, [gameState, screenDims, isHandInHitZone, speak, handleLaneTap, level.lanes]);

  const { isReady, isLoading, startTracking } = useGameHandTracking({
    gameName: 'MusicConductor',
    isRunning: gameState === 'playing',
    webcamRef,
    onFrame: handleHandFrame,
  });

  useEffect(() => {
    if (gameState === 'playing' && !isReady && !isLoading) {
      void startTracking();
    }
  }, [gameState, isReady, isLoading, startTracking]);

  useEffect(() => {
    if (gameState === 'playing') {
      startTimeRef.current = Date.now();
      lastNoteTimeRef.current = Date.now();
    }
    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [gameState]);

  useEffect(() => {
    if (gameState !== 'playing') return;

    let lastTime = performance.now();

    const gameLoop = () => {
      const now = performance.now();
      const deltaMs = now - lastTime;
      lastTime = now;
      const elapsedMs = Date.now() - startTimeRef.current;

      if (elapsedMs >= level.duration * 1000) {
        handleComplete();
        return;
      }

      const newNotes = generatePattern(
        level,
        elapsedMs,
        lastNoteTimeRef.current,
        level.bpm,
      );
      if (newNotes.length > 0) {
        lastNoteTimeRef.current = elapsedMs;
        setNotes((prev) => [...prev, ...newNotes]);
      }

      // Check for strictly missed notes (fell off screen without being hit)
      setNotes((prev) => {
        const missed = prev.find(n => n.y > 1.0 && !n.hit);
        if (missed) {
          setCombo(0);
          setStreak(0);
        }
        return updateNotes(prev, deltaMs, 1.2);
      });

      animationRef.current = requestAnimationFrame(gameLoop);
    };

    animationRef.current = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animationRef.current);
  }, [gameState, level]);

  const handleStart = useCallback(() => {
    setNotes([]);
    setScore(0);
    setCombo(0);
    setStreak(0);
    setShowStreakMilestone(false);
    setGameState('playing');
    playClick();
    speak("Let's make some music! Move your hands to the bottom when the notes fall!");
  }, [playClick, speak]);

  const handleComplete = useCallback(() => {
    setGameState('complete');
    onGameComplete(score);
    playSuccess();
    setShowCelebration(true);
    speak("Incredible! You are a master conductor!");
  }, [score, onGameComplete, playSuccess, speak]);

  const handleBack = useCallback(() => {
    navigate('/games');
  }, [navigate]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== 'playing') return;
      const keyMap: Record<string, number> = { a: 0, s: 1, d: 2, f: 3 };
      if (e.key in keyMap) {
        handleLaneTap(keyMap[e.key]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, handleLaneTap]);

  return (
    <GameContainer
      title='Music Conductor'
      onHome={handleBack}
      reportSession={false}
    >
      <div className='relative w-full h-full bg-slate-900 rounded-lg overflow-hidden touch-none select-none'>

        <CameraThumbnail webcamRef={webcamRef} isHandDetected={isHandDetected} visible={gameState === 'playing'} />

        {gameState === 'playing' && (
          <HandTrackingStatus
            isHandDetected={isHandDetected}
            pauseOnHandLost={true}
            voicePrompt={true}
            showMascot={true}
          />
        )}

        {gameState === 'start' && (
          <div className='absolute inset-0 flex flex-col items-center justify-center z-10 bg-slate-800/80 backdrop-blur-sm'>
            <div className='bg-white p-8 rounded-[2rem] text-center border-4 border-indigo-400 shadow-[0_8px_0_#818CF8] max-w-xl w-[90%]'>
              <div className='text-[5rem] mb-4'>🎵</div>
              <h2 className='text-4xl font-black text-indigo-600 tracking-tight mb-4'>
                Music Conductor
              </h2>
              <p className='text-xl text-slate-600 font-bold mb-8'>
                Move your hands down into the glowing lanes exactly when the falling notes reach the hit bar!
              </p>

              <div className='flex gap-4 justify-center mb-8'>
                {LEVELS.map((l, i) => (
                  <button
                    key={l.id}
                    onClick={() => { playClick(); setCurrentLevelIndex(i); }}
                    className={`px-6 py-3 rounded-2xl font-black text-lg transition-all ${currentLevelIndex === i ? 'bg-indigo-500 text-white shadow-[0_4px_0_#4338CA] translate-y-1' : 'bg-slate-100 text-slate-500 border-2 border-slate-200'}`}
                  >
                    Level {l.level}
                  </button>
                ))}
              </div>

              <button
                type='button'
                onClick={handleStart}
                className='px-12 py-5 bg-indigo-500 hover:bg-indigo-600 text-white text-2xl font-black rounded-[1.5rem] shadow-[0_6px_0_#3730A3] active:translate-y-2 active:shadow-[0_0px_0_#3730A3] transition-all'
              >
                Start Conducting!
              </button>
            </div>
            <VoiceInstructions
              instructions="Welcome to Music Conductor! Pick a level and press start conducting!"
              autoSpeak={true}
              showReplayButton={true}
            />
          </div>
        )}

        {gameState === 'complete' && (
          <div className='absolute inset-0 flex flex-col items-center justify-center z-10 bg-slate-800/80 backdrop-blur-sm'>
            <div className='bg-white p-10 rounded-[2.5rem] text-center border-4 border-green-400 shadow-[0_8px_0_#4ADE80]'>
              <div className='text-[5rem] mb-4'>🏆</div>
              <h2 className='text-4xl font-black text-green-600 mb-4'>
                Amazing Performance!
              </h2>
              <div className='bg-slate-100 rounded-2xl p-6 mb-8 inline-block'>
                <p className='text-xl text-slate-500 font-bold mb-2'>
                  Final Score
                </p>
                <p className='text-6xl text-slate-800 font-black'>{score}</p>
                <p className='text-lg text-indigo-500 font-bold mt-2'>Max Combo: {combo}</p>
              </div>
              <div className='flex gap-4 justify-center'>
                <button
                  type='button'
                  onClick={handleBack}
                  className='px-8 py-4 bg-slate-200 text-slate-700 text-xl font-black rounded-2xl hover:bg-slate-300'
                >
                  Exit
                </button>
                <button
                  type='button'
                  onClick={handleStart}
                  className='px-8 py-4 bg-green-500 text-white text-xl font-black rounded-2xl shadow-[0_4px_0_#16A34A] active:translate-y-1 active:shadow-none'
                >
                  Play Again
                </button>
              </div>
            </div>
          </div>
        )}

        {gameState === 'playing' && (
          <>
            {/* Top HUD */}
            <div className='absolute top-6 left-1/2 -translate-x-1/2 z-10 bg-white/10 backdrop-blur-md rounded-[2rem] px-8 py-3 border-2 border-white/20 flex gap-8 items-center'>
              <div>
                <span className='block text-xs uppercase tracking-widest text-indigo-200 font-bold'>Score</span>
                <span className='text-3xl font-black text-white'>{score}</span>
              </div>
              <div className='w-px h-8 bg-white/20' />
              <div>
                <span className='block text-xs uppercase tracking-widest text-pink-200 font-bold'>Combo</span>
                <span className='text-3xl font-black text-white'>{combo}X</span>
              </div>
            </div>

            {/* Streak Counter */}
            {streak > 5 && (
              <div className='absolute top-8 left-8 z-10'>
                <div className='bg-orange-500/80 backdrop-blur-md px-6 py-2 rounded-full border-2 border-orange-300 shadow-xl flex items-center gap-3'>
                  <span className='text-3xl'>🔥</span>
                  <span className='text-2xl font-black text-white'>{streak} STREAK</span>
                </div>
              </div>
            )}

            {/* Streak Milestone Overlay */}
            <AnimatePresence>
              {showStreakMilestone && (
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0, rotate: 180 }}
                  className='absolute inset-0 flex items-center justify-center pointer-events-none z-20'
                >
                  <div className='bg-gradient-to-r from-orange-400 to-red-500 text-white px-8 py-4 rounded-[2rem] font-black text-4xl shadow-2xl border-4 border-white'>
                    🔥 {streak} Streak! 🔥
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Timer */}
            <div className='absolute top-8 right-8 z-10'>
              <div className='bg-white/10 backdrop-blur-md px-6 py-2 rounded-full border-2 border-white/20 shadow-xl'>
                <span className='text-2xl font-black text-white'>
                  ⏳ {Math.max(0, Math.floor((level.duration * 1000 - (Date.now() - startTimeRef.current)) / 1000))}s
                </span>
              </div>
            </div>

            {/* Lanes */}
            <div className='absolute inset-0 flex'>
              {Array.from({ length: level.lanes }).map((_, i) => (
                <div
                  key={i}
                  onPointerDown={() => handleLaneTap(i)}
                  className='flex-1 border-r border-white/10 relative transition-all touch-none'
                  style={{
                    backgroundColor: laneActive[i]
                      ? LANE_COLORS[i % LANE_COLORS.length] + '40'
                      : 'transparent',
                  }}
                >
                  {/* Touch hint overlay at bottom */}
                  <div className='absolute bottom-0 left-0 right-0 h-[30%] bg-gradient-to-t from-white/5 to-transparent' />
                </div>
              ))}
            </div>

            {/* The Hit Bar */}
            <div
              className='absolute left-0 right-0 h-4 shadow-[0_0_20px_rgba(255,255,255,0.5)] z-0'
              style={{
                top: `${HIT_Y * 100}%`,
                backgroundColor: 'rgba(255,255,255,0.8)',
              }}
            />

            {/* Notes */}
            {notes.map((note) => (
              <div
                key={note.id}
                className={`absolute w-20 h-20 rounded-full transition-opacity z-0 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] flex items-center justify-center ${note.hit ? 'opacity-0 scale-150 duration-300' : 'opacity-100'
                  }`}
                style={{
                  left: `${(note.lane / level.lanes) * 100 + (100 / level.lanes / 2)}%`,
                  top: `${note.y * 100}%`,
                  backgroundColor: LANE_COLORS[note.lane % LANE_COLORS.length],
                  transform: 'translate(-50%, -50%)',
                }}
              >
                <span className='text-3xl filter brightness-0 invert opacity-80'>🎵</span>
              </div>
            ))}

            {/* CV Hand Cursor */}
            {isHandDetected && (
              <GameCursor
                position={cursorPosition}
                size={90}
                isPinching={isHandInHitZone}
                isHandDetected={isHandDetected}
                showTrail={true}
                pulseAnimation={isHandInHitZone}
                highContrast={true}
                icon="pointer"
              />
            )}
          </>
        )}

        {showCelebration && (
          <CelebrationOverlay
            show={showCelebration}
            letter='🎵'
            accuracy={100}
            onComplete={() => setShowCelebration(false)}
          />
        )}
      </div>
    </GameContainer>
  );
}
