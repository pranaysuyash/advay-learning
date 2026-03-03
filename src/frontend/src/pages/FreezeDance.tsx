/**
 * Freeze Dance Game
 * 
 * @ticket GQ-002, GQ-003, GQ-004, GQ-005, GQ-007
 */

import { memo, useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FilesetResolver, PoseLandmarker } from '@mediapipe/tasks-vision';
import {
  Music,
  Sparkles,
  Frown,
  Video,
  Hand,
  Snowflake,
  Trophy,
  PartyPopper,
  Star,
  PersonStanding,
} from 'lucide-react';
import { useGameHandTracking } from '../hooks/useGameHandTracking';
import { CameraThumbnail } from '../components/game/CameraThumbnail';
import type { HandTrackingRuntimeMeta } from '../hooks/useHandTrackingRuntime';
import { countExtendedFingersFromLandmarks } from '../games/fingerCounting';
import { useGameDrops } from '../hooks/useGameDrops';
import { useAudio } from '../utils/hooks/useAudio';
import { useTTS } from '../hooks/useTTS';
import { useGameSessionProgress } from '../hooks/useGameSessionProgress';
import { VoiceInstructions } from '../components/game/VoiceInstructions';
import { GameShell } from '../components/GameShell';
import type { TrackedHandFrame } from '../utils/handTrackingFrame';

const FreezeDanceGame = memo(function FreezeDanceGameComponent() {
  const navigate = useNavigate();
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const poseLandmarkerRef = useRef<PoseLandmarker | null>(null);
  const animationRef = useRef<number>(0);

  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cameraReady] = useState(false);
  const [isFrozen, setIsFrozen] = useState(false);
  const [gamePhase, setGamePhase] = useState<
    'dancing' | 'freezing' | 'fingerChallenge'
  >('dancing');
  const [round, setRound] = useState(1);
  const [stabilityScore, setStabilityScore] = useState(0);

  // Game Mode: 'classic' = pose only, 'combo' = pose + fingers
  const [gameMode, setGameMode] = useState<'classic' | 'combo'>('combo');

  // Combined CV: Hand tracking state
  const [targetFingers, setTargetFingers] = useState(0);
  const [detectedFingers, setDetectedFingers] = useState(0);
  const [fingerChallengeComplete, setFingerChallengeComplete] = useState(false);
  const [showHandOverlay, setShowHandOverlay] = useState(false);

  const lastPoseRef = useRef<any>(null);
  const stabilityRef = useRef(0);
  const handCanvasRef = useRef<HTMLCanvasElement>(null);

  const {
    playPop: playSuccess,
    playFanfare: playCelebration,
    playPop,
  } = useAudio();
  const { speak, isEnabled: ttsEnabled } = useTTS();
  const { onGameComplete, triggerEasterEgg } = useGameDrops('freeze-dance');
  const perfectFreezeStreakRef = useRef(0);

  useGameSessionProgress({
    gameName: 'Freeze Dance',
    score,
    level: round,
    isPlaying,
    metaData: { game_phase: gamePhase },
  });

  useEffect(() => {
    async function initPose() {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm',
        );
        let landmarker: PoseLandmarker;
        try {
          landmarker = await PoseLandmarker.createFromOptions(vision, {
            baseOptions: {
              modelAssetPath:
                'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',
              delegate: 'GPU',
            },
            runningMode: 'VIDEO',
            numPoses: 1,
          });
        } catch (e) {
          console.warn(
            'GPU delegate failed for PoseLandmarker, falling back to CPU:',
            e,
          );
          landmarker = await PoseLandmarker.createFromOptions(vision, {
            baseOptions: {
              modelAssetPath:
                'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',
              delegate: 'CPU',
            },
            runningMode: 'VIDEO',
            numPoses: 1,
          });
        }
        poseLandmarkerRef.current = landmarker;
        setIsLoading(false);
      } catch (err) {
        console.error('Failed to initialize pose landmarker:', err);
        setError(
          'Could not load pose detection. This might be a network issue. Try refreshing or check your internet connection.',
        );
        setIsLoading(false);
      }
    }
    initPose();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  const detectPose = useCallback(() => {
    if (
      !webcamRef.current ||
      !canvasRef.current ||
      !poseLandmarkerRef.current ||
      !cameraReady ||
      !isPlaying
    )
      return;

    const video = webcamRef.current.video;
    if (!video || video.readyState !== 4) {
      animationRef.current = requestAnimationFrame(detectPose);
      return;
    }

    const results = poseLandmarkerRef.current.detectForVideo(
      video,
      performance.now(),
    );

    if (results.landmarks && results.landmarks.length > 0) {
      const landmarks = results.landmarks[0];

      if (lastPoseRef.current && gamePhase === 'freezing') {
        let totalMovement = 0;
        const keyPoints = [11, 12, 13, 14, 15, 16, 23, 24, 25, 26, 27, 28];
        keyPoints.forEach((i) => {
          const dx = landmarks[i].x - lastPoseRef.current[i].x;
          const dy = landmarks[i].y - lastPoseRef.current[i].y;
          totalMovement += Math.sqrt(dx * dx + dy * dy);
        });
        stabilityRef.current = Math.max(0, 100 - totalMovement * 500);
        setStabilityScore(stabilityRef.current);
      }

      lastPoseRef.current = landmarks;
      drawSkeleton(landmarks);
    }

    animationRef.current = requestAnimationFrame(detectPose);
  }, [cameraReady, isPlaying, gamePhase]);

  function drawSkeleton(landmarks: any[]) {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    const connections = [
      [11, 12],
      [11, 13],
      [13, 15],
      [12, 14],
      [14, 16],
      [11, 23],
      [12, 24],
      [23, 24],
      [23, 25],
      [25, 27],
      [24, 26],
      [26, 28],
    ];

    ctx.strokeStyle = isFrozen ? '#EF4444' : '#10B981';
    ctx.lineWidth = 3;

    connections.forEach(([i, j]) => {
      const p1 = landmarks[i];
      const p2 = landmarks[j];
      ctx.beginPath();
      ctx.moveTo(p1.x * width, p1.y * height);
      ctx.lineTo(p2.x * width, p2.y * height);
      ctx.stroke();
    });

    const keyPoints = [11, 12, 13, 14, 15, 16, 23, 24, 25, 26, 27, 28];
    keyPoints.forEach((i) => {
      const p = landmarks[i];
      ctx.beginPath();
      ctx.arc(p.x * width, p.y * height, 6, 0, 2 * Math.PI);
      ctx.fillStyle = isFrozen ? '#EF4444' : '#10B981';
      ctx.fill();
    });
  }

  useEffect(() => {
    if (!isPlaying) return;

    // Slower phases for toddler-friendly gameplay
    const danceDuration = 10000 + Math.random() * 3000; // 10-13s (was 8-12s)
    const freezeDuration = 3500; // 3.5s (was 3s)
    const fingerChallengeDuration = 6000; // 6s (was 5s)

    setGamePhase('dancing');
    setIsFrozen(false);
    setShowHandOverlay(false);
    setFingerChallengeComplete(false);

    // Voice cue for dancing phase
    if (ttsEnabled) {
      void speak('Dance dance dance!');
    }

    const danceTimer = setTimeout(() => {
      // FREEZE phase - pose only
      setGamePhase('freezing');
      setIsFrozen(true);
      stabilityRef.current = 100;
      setStabilityScore(100);

      const freezeTimer = setTimeout(() => {
        const roundScore = Math.round(stabilityRef.current);

        // If stability is good (>60%), add finger challenge (only in combo mode)
        if (roundScore > 60 && round > 2 && gameMode === 'combo') {
          // FINGER CHALLENGE phase - combined CV!
          const target = Math.floor(Math.random() * 6); // 0-5 fingers
          setTargetFingers(target);
          setDetectedFingers(0);
          setGamePhase('fingerChallenge');
          setShowHandOverlay(true);

          if (ttsEnabled) {
            const targetText =
              target === 0
                ? 'a fist'
                : `${target} finger${target !== 1 ? 's' : ''}`;
            void speak(`Freeze! Show me ${targetText}!`);
          }

          const fingerTimer = setTimeout(() => {
            setShowHandOverlay(false);
            completeRound(roundScore, fingerChallengeComplete);
          }, fingerChallengeDuration);

          return () => clearTimeout(fingerTimer);
        } else {
          // No finger challenge yet - just complete the round
          completeRound(roundScore, true);
        }
      }, freezeDuration);

      return () => clearTimeout(freezeTimer);
    }, danceDuration);

    return () => clearTimeout(danceTimer);
  }, [isPlaying, round, ttsEnabled, speak, fingerChallengeComplete]);

  const completeRound = (roundScore: number, success: boolean) => {
    setIsFrozen(false);

    if (success && roundScore > 80) {
      perfectFreezeStreakRef.current += 1;
      if (perfectFreezeStreakRef.current >= 5) {
        triggerEasterEgg('egg-ice-sculpture');
      }
    } else {
      perfectFreezeStreakRef.current = 0;
    }

    if (success) {
      setScore((s) => s + roundScore);
      if (roundScore > 50) {
        void playCelebration();
        setShowCelebration(true);
        if (ttsEnabled) {
          if (fingerChallengeComplete) {
            void speak(
              'Amazing! You froze perfectly and showed the right fingers!',
            );
          } else {
            void speak('Great freeze! You held so still!');
          }
        }
        setTimeout(() => setShowCelebration(false), 1500);
      } else if (ttsEnabled && roundScore > 0) {
        void speak('Good try! Hold even stiller next time!');
      }
    } else if (ttsEnabled) {
      void speak('You moved! Try to hold super still next time!');
    }

    setRound((r) => r + 1);
  };

  useEffect(() => {
    if (isPlaying && cameraReady) {
      detectPose();
    }
  }, [isPlaying, cameraReady, detectPose]);

  const handleFingerChallengeFrame = useCallback(
    (frame: TrackedHandFrame, _meta: HandTrackingRuntimeMeta) => {
      if (!handCanvasRef.current || gamePhase !== 'fingerChallenge') return;

      const canvas = handCanvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (frame.hands.length > 0) {
        const landmarks = frame.hands[0];
        const fingerCount = countExtendedFingersFromLandmarks(
          landmarks.map((l) => ({ x: l.x, y: l.y, z: l.z })),
        );
        setDetectedFingers(fingerCount);

        if (fingerCount === targetFingers && !fingerChallengeComplete) {
          setFingerChallengeComplete(true);
          void playSuccess();
        }

        landmarks.forEach((lm) => {
          ctx.beginPath();
          ctx.arc(lm.x * canvas.width, lm.y * canvas.height, 4, 0, 2 * Math.PI);
          ctx.fillStyle = fingerCount === targetFingers ? '#10B981' : '#F59E0B';
          ctx.fill();
        });
      } else {
        setDetectedFingers(0);
      }
    },
    [fingerChallengeComplete, gamePhase, playSuccess, targetFingers],
  );

  const {
    isLoading: isHandLoading,
    isReady: isHandReady,
    startTracking: startHandTracking,
  } = useGameHandTracking({
    gameName: 'FreezeDance',
    webcamRef,
    handTracking: {
      numHands: 1,
      minDetectionConfidence: 0.3,
      minHandPresenceConfidence: 0.3,
      minTrackingConfidence: 0.3,
      delegate: 'GPU',
      enableFallback: true,
    },
    isRunning: cameraReady && isPlaying && gamePhase === 'fingerChallenge',
    onFrame: handleFingerChallengeFrame,
    onNoVideoFrame: () => {
      if (gamePhase === 'fingerChallenge') {
        setDetectedFingers(0);
      }
    },
  });

  useEffect(() => {
    if (
      cameraReady &&
      isPlaying &&
      gamePhase === 'fingerChallenge' &&
      !isHandReady &&
      !isHandLoading
    ) {
      void startHandTracking();
    }
  }, [
    cameraReady,
    gamePhase,
    isHandLoading,
    isHandReady,
    isPlaying,
    startHandTracking,
  ]);

  const startGame = () => {
    playPop();
    setIsPlaying(true);
    setScore(0);
    setRound(1);
    if (ttsEnabled) {
      void speak(
        "Let's play Freeze Dance! Dance when I say dance, and freeze when I say freeze!",
      );
    }
  };

  const stopGame = () => {
    playPop();
    onGameComplete();
    setIsPlaying(false);
    setGamePhase('dancing');
    setIsFrozen(false);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  };

  if (isLoading || isHandLoading) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center'>
        <motion.div
          className='text-center'
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className='text-6xl mb-4 flex justify-center'>
            <Music className='w-16 h-16 text-purple-500' />
          </div>
          <h2 className='text-2xl font-bold text-blue-700 mb-2'>
            Loading Freeze Dance...
          </h2>
          <p className='text-blue-500'>
            {isLoading
              ? 'Loading pose tracking...'
              : 'Loading hand tracking...'}
          </p>
          <p className='text-purple-500 text-sm mt-2 flex items-center justify-center gap-1'>
            <Sparkles className='w-4 h-4' /> Now with finger challenges!
          </p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-red-100 to-orange-100 flex items-center justify-center'>
        <div className='text-center p-8'>
          <div className='text-6xl mb-4 flex justify-center'>
            <Frown className='w-16 h-16 text-red-500' />
          </div>
          <h2 className='text-2xl font-bold text-red-700 mb-2'>Oops!</h2>
          <p className='text-red-500 mb-4'>{error}</p>
          <button
            onClick={() => navigate('/games')}
            className='px-6 py-3 bg-purple-500 text-white rounded-full font-bold hover:bg-purple-600 transition'
          >
            Back to Games
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-discovery-cream p-4 md:p-8 font-sans relative'>
      {/* Background blur overlay for clean look */}
      <div className='absolute inset-0 bg-gradient-to-b from-white/30 via-transparent to-white/40 backdrop-blur-sm pointer-events-none' />

      <CameraThumbnail isHandDetected={isHandReady} visible={isPlaying} />
      <header className='flex justify-between items-center mb-8 max-w-5xl mx-auto'>
        <button
          onClick={() => navigate('/games')}
          className='px-6 py-3 bg-white border-3 border-[#F2CC8F] rounded-full font-black text-text-secondary hover:scale-105 hover:text-advay-slate transition-all shadow-[0_4px_0_#E5B86E]'
        >
          ← Back
        </button>
        <h1 className='text-3xl font-black text-advay-slate tracking-tight'>
          Freeze Dance
        </h1>
        <div className='flex items-center gap-4'>
          <div className='px-6 py-3 bg-white border-3 border-amber-100 rounded-full shadow-[0_4px_0_#E5B86E]'>
            <span className='font-bold text-amber-500 tracking-wide'>
              SCORE:{' '}
            </span>
            <span className='font-black text-amber-500 text-xl'>{score}</span>
          </div>
          <div className='px-4 py-2 bg-white/90 backdrop-blur-sm rounded-full border-2 border-[#F2CC8F] shadow-[0_4px_0_#E5B86E]'>
            <span className='text-text-secondary font-bold text-sm flex items-center gap-1'>
              Take your time!
            </span>
          </div>
        </div>
      </header>

      <div className='max-w-4xl mx-auto'>
        {!isPlaying ? (
          <motion.div
            className='bg-white border-3 border-[#F2CC8F] rounded-[2.5rem] p-8 md:p-12 shadow-[0_4px_0_#E5B86E]'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className='text-center mb-10'>
              <div className='mb-6 drop-shadow-[0_4px_0_#E5B86E] hover:scale-110 transition-transform flex justify-center gap-2'>
                <Music className='w-20 h-20 text-purple-500' />
                <PersonStanding className='w-20 h-20 text-blue-500' />
              </div>
              <h2 className='text-4xl md:text-5xl font-black text-advay-slate tracking-tight mb-4'>
                Freeze Dance!
              </h2>
              <p className='text-text-secondary font-bold text-xl'>
                Dance when the music plays,{' '}
                <span className='text-blue-500 font-black'>FREEZE</span> when it
                stops!
              </p>
            </div>

            <div className='bg-slate-50 border-3 border-[#F2CC8F] rounded-[2rem] p-8 mb-10'>
              <h3 className='font-black text-advay-slate text-xl mb-6 tracking-tight'>
                How to Play:
              </h3>
              <ul className='space-y-4 text-advay-slate font-medium text-lg'>
                <li className='flex items-center gap-4'>
                  <span className='flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold'>
                    1
                  </span>
                  <span>Stand in front of your camera</span>
                </li>
                <li className='flex items-center gap-4'>
                  <span className='flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold'>
                    2
                  </span>
                  <span>Dance and move when you see "DANCE!"</span>
                </li>
                <li className='flex items-center gap-4'>
                  <span className='flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold'>
                    3
                  </span>
                  <span>FREEZE when you see "FREEZE!"</span>
                </li>
                <li className='flex items-center gap-4'>
                  <span className='flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold'>
                    4
                  </span>
                  <span>Hold still to earn points!</span>
                </li>
              </ul>
            </div>

            <div className='bg-white border-3 border-blue-200 rounded-[2rem] p-6 mb-10 shadow-sm'>
              <h3 className='font-black text-advay-slate text-xl mb-4 text-center tracking-tight'>
                Choose Your Mode:
              </h3>
              <div className='flex flex-col sm:flex-row gap-4 justify-center'>
                <button
                  onClick={() => {
                    playPop();
                    setGameMode('classic');
                  }}
                  className={`flex-1 py-4 px-6 rounded-2xl border-4 font-bold text-lg transition-all ${
                    gameMode === 'classic'
                      ? 'bg-blue-100 border-blue-500 text-blue-700 shadow-md transform scale-105'
                      : 'bg-white border-slate-200 text-slate-500 hover:border-blue-300 hover:bg-slate-50'
                  }`}
                >
                  <span className='block mb-2 flex justify-center'>
                    <Trophy className='w-10 h-10 text-blue-600' />
                  </span>
                  Classic Mode
                  <span className='block text-sm font-normal mt-1 opacity-80'>
                    Just Dance & Freeze
                  </span>
                </button>
                <button
                  onClick={() => {
                    playPop();
                    setGameMode('combo');
                  }}
                  className={`flex-1 py-4 px-6 rounded-2xl border-4 font-bold text-lg transition-all ${
                    gameMode === 'combo'
                      ? 'bg-purple-100 border-purple-500 text-purple-700 shadow-md transform scale-105'
                      : 'bg-white border-slate-200 text-slate-500 hover:border-purple-300 hover:bg-slate-50'
                  }`}
                >
                  <span className='block mb-2 flex justify-center'>
                    <Hand className='w-10 h-10 text-purple-600' />
                  </span>
                  Combo Mode
                  <span className='block text-sm font-normal mt-1 opacity-80'>
                    Freeze + Finger Challenges!
                  </span>
                </button>
              </div>
            </div>

            <button
              onClick={startGame}
              className='w-full py-5 bg-[#3B82F6] hover:bg-blue-600 border-3 border-blue-200 hover:border-blue-300 text-white rounded-[1.5rem] font-black text-2xl shadow-[0_4px_0_#E5B86E] transition-all hover:scale-[1.02] active:scale-95'
            >
              Start Dancing!
            </button>

            {ttsEnabled && (
              <VoiceInstructions
                instructions={[
                  'Stand in front of your camera.',
                  'Dance when I say dance!',
                  'Freeze when I say freeze!',
                  'Hold super still to win!',
                ]}
                autoSpeak={true}
                showReplayButton={true}
                replayButtonPosition='bottom-right'
              />
            )}
          </motion.div>
        ) : (
          <div className='space-y-6'>
            <motion.div
              className='bg-white border-3 border-[#F2CC8F] rounded-[2.5rem] p-8 shadow-[0_4px_0_#E5B86E] relative overflow-hidden'
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className='text-center'>
                <div className='mb-4 drop-shadow-[0_4px_0_#E5B86E] flex justify-center'>
                  {gamePhase === 'dancing' ? (
                    <Music className='w-20 h-20 text-blue-500' />
                  ) : gamePhase === 'freezing' ? (
                    <Snowflake className='w-20 h-20 text-red-500' />
                  ) : (
                    <Hand className='w-20 h-20 text-purple-500' />
                  )}
                </div>
                <h3
                  className={`text-4xl md:text-5xl font-black mb-3 tracking-tight ${
                    gamePhase === 'dancing'
                      ? 'text-[#3B82F6]'
                      : gamePhase === 'freezing'
                        ? 'text-[#EF4444]'
                        : 'text-purple-500'
                  }`}
                >
                  {gamePhase === 'dancing'
                    ? 'DANCE!'
                    : gamePhase === 'freezing'
                      ? 'FREEZE!'
                      : `SHOW ${targetFingers}!`}
                </h3>
                <p className='text-slate-400 font-bold uppercase tracking-widest'>
                  Round {round}
                </p>
              </div>

              {gamePhase === 'freezing' && (
                <div className='mt-8 bg-slate-50 border-2 border-[#F2CC8F] rounded-[1.5rem] p-6'>
                  <div className='flex justify-between font-bold text-advay-slate mb-3'>
                    <span className='uppercase tracking-wide'>Hold still!</span>
                    <span className='text-advay-slate'>
                      {Math.round(stabilityScore)}%
                    </span>
                  </div>
                  <div className='h-6 bg-slate-200 rounded-full overflow-hidden shadow-inner'>
                    <motion.div
                      className='h-full bg-gradient-to-r from-[#10B981] to-[#EF4444]'
                      initial={{ width: 0 }}
                      animate={{ width: `${stabilityScore}%` }}
                    />
                  </div>
                </div>
              )}

              {gamePhase === 'fingerChallenge' && (
                <div className='mt-8 bg-slate-50 border-2 border-[#F2CC8F] rounded-[1.5rem] p-6 space-y-5'>
                  <div className='flex justify-between font-bold text-advay-slate mb-2'>
                    <span className='uppercase tracking-wide'>
                      Your fingers:
                    </span>
                    <span
                      className={`text-xl ${detectedFingers === targetFingers ? 'text-[#10B981]' : 'text-[#F59E0B]'}`}
                    >
                      {detectedFingers} / {targetFingers}
                    </span>
                  </div>
                  <div className='h-6 bg-slate-200 rounded-full overflow-hidden shadow-inner'>
                    <motion.div
                      className={`h-full ${detectedFingers === targetFingers ? 'bg-[#10B981]' : 'bg-[#F59E0B]'}`}
                      initial={{ width: 0 }}
                      animate={{
                        width: `${Math.min((detectedFingers / targetFingers) * 100, 100)}%`,
                      }}
                    />
                  </div>
                  {detectedFingers === targetFingers && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className='text-center text-[#10B981] font-black text-xl tracking-wide'
                    >
                      ✓ Perfect! Hold it!
                    </motion.div>
                  )}
                </div>
              )}
            </motion.div>

            <div className='relative rounded-[2.5rem] overflow-hidden bg-slate-100 border-3 border-[#F2CC8F] shadow-[0_4px_0_#E5B86E]'>
              <canvas
                ref={canvasRef}
                className='absolute top-0 left-0 w-full h-[400px] pointer-events-none'
                width={640}
                height={360}
              />
              {/* Hand tracking overlay for finger challenge */}
              <canvas
                ref={handCanvasRef}
                className={`absolute top-0 left-0 w-full h-[400px] pointer-events-none transition-opacity duration-300 ${showHandOverlay ? 'opacity-100' : 'opacity-0'}`}
                width={640}
                height={360}
              />

              <div className='absolute top-6 left-6 px-4 py-2 bg-white/90 backdrop-blur-sm rounded-full border-2 border-[#F2CC8F] shadow-[0_4px_0_#E5B86E]'>
                <span className='text-advay-slate font-bold whitespace-nowrap'>
                  {cameraReady ? (
                    <span className='flex items-center gap-1'>
                      <Video className='w-4 h-4' /> Camera Ready
                    </span>
                  ) : (
                    'Loading...'
                  )}
                  {isHandReady && <Hand className='w-4 h-4 inline' />}
                </span>
              </div>

              <div className='absolute top-6 right-6 px-5 py-2 bg-white/90 backdrop-blur-sm rounded-full border-2 border-[#F2CC8F] shadow-[0_4px_0_#E5B86E]'>
                <span
                  className={`font-black tracking-wide ${
                    gamePhase === 'dancing'
                      ? 'text-[#10B981]'
                      : gamePhase === 'freezing'
                        ? 'text-[#EF4444]'
                        : 'text-purple-500'
                  }`}
                >
                  {gamePhase === 'dancing' ? (
                    <span className='flex items-center gap-1'>
                      <Music className='w-4 h-4' /> DANCE
                    </span>
                  ) : gamePhase === 'freezing' ? (
                    <span className='flex items-center gap-1'>
                      <Snowflake className='w-4 h-4' /> FROZEN
                    </span>
                  ) : (
                    <span className='flex items-center gap-1'>
                      <Hand className='w-4 h-4' /> FINGERS
                    </span>
                  )}
                </span>
              </div>
            </div>

            <div className='flex justify-center pt-2'>
              <button
                onClick={stopGame}
                className='px-12 py-4 bg-white border-3 border-[#F2CC8F] rounded-[1.5rem] font-bold text-text-secondary hover:text-advay-slate hover:scale-105 transition-all shadow-[0_4px_0_#E5B86E]'
              >
                End Game
              </button>
            </div>
          </div>
        )}

        <AnimatePresence>
          {showCelebration && (
            <motion.div
              className='fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className='bg-white rounded-[3rem] p-12 text-center shadow-[0_4px_0_#E5B86E] border-3 border-[#F2CC8F] max-w-md w-[90%]'
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
              >
                <div className='mb-6 drop-shadow-[0_4px_0_#E5B86E] hover:scale-110 transition-transform flex justify-center'>
                  <PartyPopper className='w-24 h-24 text-yellow-500' />
                </div>
                <h2 className='text-3xl md:text-4xl font-black text-advay-slate tracking-tight mb-4'>
                  {fingerChallengeComplete
                    ? 'Perfect Freeze + Fingers!'
                    : 'Amazing Freeze!'}
                </h2>
                <p className='text-text-secondary font-bold text-xl'>
                  {fingerChallengeComplete ? (
                    <span className='flex items-center justify-center gap-1'>
                      You froze AND showed the right fingers!{' '}
                      <Star className='w-5 h-5 text-yellow-500 inline' />
                    </span>
                  ) : (
                    'Perfect stillness!'
                  )}
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
});

// Main export wrapped with GameShell
export const FreezeDance = memo(function FreezeDanceComponent() {
  return (
    <GameShell
      gameId="freeze-dance"
      gameName="Freeze Dance"
      showWellnessTimer={true}
      enableErrorBoundary={true}
    >
      <FreezeDanceGame />
    </GameShell>
  );
});

export default FreezeDance;
