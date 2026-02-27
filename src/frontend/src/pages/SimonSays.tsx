import { memo, useState, useEffect, useRef, useCallback } from 'react';
import { Hand, Star, Camera, Ear, Gamepad2, Check, Hourglass, SkipForward, PartyPopper, Brain } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FilesetResolver, PoseLandmarker } from '@mediapipe/tasks-vision';
import { useGameHandTracking } from '../hooks/useGameHandTracking';
import { countExtendedFingersFromLandmarks } from '../games/fingerCounting';
import type { TrackedHandFrame } from '../utils/handTrackingFrame';
import { useGameDrops } from '../hooks/useGameDrops';
import { KenneyCharacter } from '../components/characters/KenneyCharacter';
import { useGameSessionProgress } from '../hooks/useGameSessionProgress';
import { useAudio } from '../utils/hooks/useAudio';

// Icon components for body actions
const HeadIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full">
    <circle cx="12" cy="10" r="5" />
    <path d="M12 15v3" />
    <path d="M9 18h6" />
  </svg>
);

const WaveIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full">
    <path d="M12 2v4M8 6l-2 2M16 6l2 2M7 10l-3 2M17 10l3 2M6 14l-2 3M18 14l2 3M8 18l-1 3M16 18l1 3" strokeLinecap="round" />
  </svg>
);

const ArmsUpIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full">
    <path d="M12 4v10M7 9l5-5 5 5M7 14l-2 6M17 14l2 6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const HipsIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full">
    <path d="M8 12v6M16 12v6M12 8v10" strokeLinecap="round" />
    <circle cx="8" cy="10" r="2" />
    <circle cx="16" cy="10" r="2" />
  </svg>
);

const TRexIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full">
    <path d="M6 12l3-3 3 3M12 12l3 3 3-3" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M9 9v6M15 9v6" strokeLinecap="round" />
  </svg>
);

const ShouldersIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full">
    <path d="M4 10h16M6 10v4M18 10v4" strokeLinecap="round" />
    <circle cx="6" cy="8" r="2" />
    <circle cx="18" cy="8" r="2" />
  </svg>
);

interface BodyAction {
  name: string;
  icon: React.ReactNode;
  instruction: string;
  landmark: string;
}

const BODY_ACTIONS: BodyAction[] = [
  {
    name: 'Touch Head',
    icon: <HeadIcon />,
    instruction: 'Touch your head with both hands!',
    landmark: 'head',
  },
  {
    name: 'Wave',
    icon: <WaveIcon />,
    instruction: 'Wave hello with one hand!',
    landmark: 'wave',
  },
  {
    name: 'Arms Up',
    icon: <ArmsUpIcon />,
    instruction: 'Put both arms up in the air!',
    landmark: 'armsUp',
  },
  {
    name: 'Hands On Hips',
    icon: <HipsIcon />,
    instruction: 'Put your hands on your hips!',
    landmark: 'handsOnHips',
  },
  {
    name: 'T-Rex Arms',
    icon: <TRexIcon />,
    instruction: 'Bend both elbows like T-Rex!',
    landmark: 'tRex',
  },
  {
    name: 'Touch Shoulders',
    icon: <ShouldersIcon />,
    instruction: 'Touch both shoulders with your hands!',
    landmark: 'shoulders',
  },
];

export const SimonSays = memo(function SimonSays() {
  const navigate = useNavigate();
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const poseLandmarkerRef = useRef<PoseLandmarker | null>(null);
  const animationRef = useRef<number>(0);
  const { onGameComplete, triggerEasterEgg } = useGameDrops('simon-says');

  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [currentActionIndex, setCurrentActionIndex] = useState(0);
  const [matchProgress, setMatchProgress] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [round, setRound] = useState(1);
  const [gameMode, setGameMode] = useState<'classic' | 'combo'>('combo');
  const [targetFingers, setTargetFingers] = useState<number | null>(null);
  const [detectedFingers, setDetectedFingers] = useState(0);

  const { playPop, playFanfare } = useAudio();

  const currentAction = BODY_ACTIONS[currentActionIndex];
  const HOLD_DURATION = 2000;

  useGameSessionProgress({
    gameName: 'Simon Says',
    score,
    level: round,
    isPlaying,
  });

  const holdTimeRef = useRef(0);
  const lastPoseRef = useRef<any[] | null>(null);

  const handleHandFrame = useCallback((frame: TrackedHandFrame) => {
    if (!frame.primaryHand || gameMode !== 'combo' || !isPlaying) {
      setDetectedFingers(0);
      return;
    }
    const count = countExtendedFingersFromLandmarks(frame.primaryHand);
    setDetectedFingers(count);
  }, [gameMode, isPlaying]);

  useGameHandTracking({
    gameName: 'SimonSays',
    isRunning: isPlaying && gameMode === 'combo',
    webcamRef,
    targetFps: 15,
    onFrame: handleHandFrame,
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
          console.warn('GPU delegate failed for PoseLandmarker, falling back to CPU:', e);
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
        setError('Could not load pose detection. This might be a network issue. Try refreshing or check your internet connection.');
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
      !isPlaying ||
      showResult
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
      const nose = landmarks[0];
      const leftShoulder = landmarks[11];
      const rightShoulder = landmarks[12];
      const leftWrist = landmarks[15];
      const rightWrist = landmarks[16];

      let matchScore = 0;

      switch (currentAction.landmark) {
        case 'head':
          matchScore =
            (leftWrist.y < 0.3 && Math.abs(leftWrist.x - nose.x) < 0.2) ||
              (rightWrist.y < 0.3 && Math.abs(rightWrist.x - nose.x) < 0.2)
              ? 100
              : 0;
          break;
        case 'armsUp':
          matchScore =
            leftWrist.y < leftShoulder.y - 0.1 &&
              rightWrist.y < rightShoulder.y - 0.1
              ? 100
              : 0;
          break;
        case 'handsOnHips':
          matchScore =
            leftWrist.y > 0.4 &&
              leftWrist.y < 0.6 &&
              rightWrist.y > 0.4 &&
              rightWrist.y < 0.6
              ? 100
              : 0;
          break;
        case 'shoulders':
          matchScore =
            Math.abs(leftWrist.x - leftShoulder.x) < 0.15 &&
              Math.abs(leftWrist.y - leftShoulder.y) < 0.15 &&
              Math.abs(rightWrist.x - rightShoulder.x) < 0.15 &&
              Math.abs(rightWrist.y - rightShoulder.y) < 0.15
              ? 100
              : 0;
          break;
        default:
          matchScore = 0;
      }

      setMatchProgress(matchScore);

      const poseMatches = matchScore > 70;
      const fingerMatches = gameMode !== 'combo' || (targetFingers !== null && detectedFingers === targetFingers);

      if (poseMatches && fingerMatches) {
        holdTimeRef.current += 50;
        if (holdTimeRef.current >= HOLD_DURATION) {
          playFanfare();
          setScore((s: number) => s + 100);
          setShowResult(true);
          setShowCelebration(true);
          setTimeout(() => {
            setShowCelebration(false);
            setCurrentActionIndex((i: number) => (i + 1) % BODY_ACTIONS.length);
            setShowResult(false);
            holdTimeRef.current = 0;
            setRound((r: number) => {
              if (r + 1 >= 10) triggerEasterEgg('egg-simon-master');
              return r + 1;
            });
            if (gameMode === 'combo') {
              setTargetFingers(Math.floor(Math.random() * 5) + 1);
            }
          }, 2000);
        }
      } else {
        holdTimeRef.current = 0;
      }

      lastPoseRef.current = landmarks;
    }

    animationRef.current = requestAnimationFrame(detectPose);
  }, [cameraReady, isPlaying, showResult, currentAction, gameMode, targetFingers, detectedFingers]);

  useEffect(() => {
    if (isPlaying && cameraReady) {
      detectPose();
    }
  }, [isPlaying, cameraReady, detectPose]);

  const startGame = () => {
    playPop();
    setIsPlaying(true);
    setScore(0);
    setCurrentActionIndex(0);
    setRound(1);
    holdTimeRef.current = 0;
    if (gameMode === 'combo') {
      setTargetFingers(Math.floor(Math.random() * 5) + 1);
    } else {
      setTargetFingers(null);
    }
  };

  const stopGame = () => {
    playPop();
    onGameComplete();
    setIsPlaying(false);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  };

  const _handleVideoLoad = () => {
    setCameraReady(true);
  };

  if (isLoading) {
    return (
      <div className='min-h-[100dvh] bg-[#FFF8F0] flex items-center justify-center p-4'>
        <motion.div
          className='bg-white rounded-[2.5rem] border-3 border-[#F2CC8F] p-12 text-center max-w-md w-full shadow-[0_4px_0_#E5B86E]'
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className='text-6xl mb-6 flex justify-center'>
            <div className='w-24 h-24 border-3 border-[#3B82F6] border-t-transparent rounded-full animate-spin' />
          </div>
          <h2 className='text-2xl font-black text-advay-slate tracking-tight mb-2'>
            Loading Simon Says
          </h2>
          <p className='text-text-secondary font-bold'>Warming up the camera...</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='min-h-[100dvh] bg-[#FFF8F0] flex items-center justify-center p-4'>
        <div className='bg-red-50 rounded-[2.5rem] border-3 border-red-100 p-12 text-center max-w-md w-full shadow-[0_4px_0_#E5B86E]'>
          <div className='w-16 h-16 mx-auto mb-6 text-red-400'><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full"><circle cx="12" cy="12" r="10" /><path d="M9 10h.01M15 10h.01" strokeLinecap="round" /><path d="M9 16c1.5-1 3-1 4.5 0" /></svg></div>
          <h2 className='text-2xl font-black text-red-600 tracking-tight mb-4'>Oops!</h2>
          <p className='text-red-500 font-bold mb-8'>{error}</p>
          <button
            onClick={() => navigate('/games')}
            className='px-8 py-4 bg-red-100 hover:bg-red-200 text-red-600 rounded-full font-black transition-colors'
          >
            Back to Games
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-[100dvh] bg-[#FFF8F0] p-4 md:p-8 flex flex-col font-sans'>
      {/* Header */}
      <header className='flex justify-between items-center mb-6 max-w-5xl mx-auto w-full relative z-20'>
        <button
          onClick={() => navigate('/dashboard')}
          className='flex items-center gap-2 px-6 py-3 bg-white hover:bg-slate-50 border-3 border-[#F2CC8F] rounded-[1.5rem] font-bold text-text-secondary transition-colors shadow-[0_4px_0_#E5B86E]'
        >
          <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={3} d='M10 19l-7-7m0 0l7-7m-7 7h18' /></svg>
          <span className='hidden sm:inline'>Back</span>
        </button>

        <h1 className='text-3xl md:text-4xl font-black text-advay-slate tracking-tight absolute left-1/2 -translate-x-1/2'>
          Simon Says
        </h1>

        <div className='bg-amber-50 border-3 border-amber-100 px-6 py-3 rounded-[1.5rem] font-black text-amber-500 text-xl shadow-[0_4px_0_#E5B86E] flex items-center gap-2'>
          <Star className="w-6 h-6 fill-amber-500" /> <span>{score}</span>
        </div>
      </header>

      <div className='max-w-5xl mx-auto w-full flex-1 flex flex-col'>
        {!isPlaying ? (
          <motion.div
            className='bg-white rounded-[2.5rem] border-3 border-[#F2CC8F] p-8 md:p-16 shadow-[0_4px_0_#E5B86E] flex-1 flex flex-col items-center justify-center text-center'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className='w-32 h-32 mb-8 text-[#10B981] drop-shadow-[0_4px_0_#E5B86E] hover:scale-110 transition-transform mx-auto'>
              <Brain className="w-full h-full" strokeWidth={1.5} />
            </div>
            <h2 className='text-4xl md:text-5xl font-black text-[#10B981] tracking-tight mb-4'>
              Simon Says!
            </h2>
            <p className='text-text-secondary text-xl md:text-2xl font-bold mb-12 max-w-lg'>
              Follow the instructions—but only if Simon says so!
            </p>

            <div className='bg-[#FFF8F0] border-3 border-[#F2CC8F] rounded-[2rem] p-8 mb-12 max-w-2xl w-full text-left'>
              <h3 className='font-black text-advay-slate text-2xl mb-6'>How to Play:</h3>
              <ul className='space-y-4 text-advay-slate font-bold text-lg'>
                <li className='flex items-center gap-3'><Camera className="w-8 h-8 text-blue-500" /> Stand directly in front of your camera</li>
                <li className='flex items-center gap-3'><Ear className="w-8 h-8 text-pink-500" /> Listen carefully to what Simon says</li>
                <li className='flex items-center gap-3'><div className="w-8 h-8 flex items-center justify-center"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-7 h-7 text-green-500"><path d="M4 16v-4M8 14v-2M12 12V8M16 10V6M20 8V4" strokeLinecap="round" /><circle cx="12" cy="18" r="2" /></svg></div> Do the action with your whole body!</li>
                <li className='flex items-center gap-3'><div className="w-8 h-8 flex items-center justify-center"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-7 h-7 text-amber-500"><rect x="6" y="4" width="12" height="16" rx="2" /><path d="M10 8v8M14 8v8" /></svg></div> Hold the pose steady to complete it</li>
                {gameMode === 'combo' && <li className='flex items-center gap-3'><Hand className="w-8 h-8 text-purple-500" /> Also show the correct number of fingers!</li>}
              </ul>
            </div>

            <div className='flex gap-4 w-full max-w-md mb-6'>
              <button
                onClick={() => { playPop(); setGameMode('classic'); }}
                className={`flex-1 py-4 px-6 rounded-[2rem] border-4 font-black text-xl transition-all ${gameMode === 'classic'
                  ? 'bg-blue-100 border-blue-500 text-blue-700 shadow-md transform scale-105'
                  : 'bg-white border-slate-200 text-slate-500 hover:border-blue-300 hover:bg-slate-50'
                  }`}
              >
                <span className='text-3xl block mb-2 flex justify-center'><div className="w-10 h-10"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full"><circle cx="12" cy="6" r="3" /><path d="M8 10v10M16 10v10M8 14h8" strokeLinecap="round" /></svg></div></span>
                Classic
              </button>
              <button
                onClick={() => { playPop(); setGameMode('combo'); }}
                className={`flex-1 py-4 px-6 rounded-[2rem] border-4 font-black text-xl transition-all ${gameMode === 'combo'
                  ? 'bg-purple-100 border-purple-500 text-purple-700 shadow-md transform scale-105'
                  : 'bg-white border-slate-200 text-slate-500 hover:border-purple-300 hover:bg-slate-50'
                  }`}
              >
                <span className='text-3xl block mb-2 flex justify-center'><Hand className="w-10 h-10" /></span>
                Combo
              </button>
            </div>

            <button
              onClick={startGame}
              className='w-full max-w-md py-6 bg-[#3B82F6] hover:bg-blue-600 border-3 border-blue-200 hover:border-blue-300 text-white text-2xl font-black rounded-[2rem] shadow-[0_4px_0_#E5B86E] transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-3'
            >
              Start Playing! <Gamepad2 className="w-8 h-8" />
            </button>
          </motion.div>
        ) : (
          <div className='flex flex-col lg:flex-row gap-6 lg:gap-8 flex-1 min-h-0'>
            {/* Left Column: Instructions */}
            <motion.div
              className='bg-white rounded-[2.5rem] border-3 border-[#F2CC8F] p-8 shadow-[0_4px_0_#E5B86E] flex flex-col justify-center flex-1 lg:max-w-md'
              key={currentActionIndex}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className='text-center mb-10'>
                <div className='inline-block bg-[#FFF8F0] border-3 border-[#F2CC8F] rounded-[2rem] p-6 w-28 h-28 mb-4 drop-shadow-[0_4px_0_#E5B86E] text-advay-slate'>
                  {currentAction.icon}
                </div>
                {/* Kenney Character Demonstration */}
                <div className='flex justify-center mb-4'>
                  <KenneyCharacter
                    type="beige"
                    animation={
                      currentAction.name === 'Arms Up' ? 'climb' :
                        currentAction.name === 'Touch Head' ? 'duck' :
                          currentAction.name === 'Wave' ? 'walk' :
                            currentAction.name === 'Hands On Hips' ? 'idle' :
                              currentAction.name === 'T-Rex Arms' ? 'hit' :
                                currentAction.name === 'Touch Shoulders' ? 'jump' : 'idle'
                    }
                    size="lg"
                  />
                </div>
                <h3 className='text-4xl font-black text-advay-slate tracking-tight mb-4'>
                  {currentAction.name}
                </h3>
                <p className='text-xl font-bold text-text-secondary mb-4'>
                  {currentAction.instruction}
                  {gameMode === 'combo' && targetFingers !== null && (
                    <span className="block mt-2 text-purple-600 text-2xl">
                      ...AND show me {targetFingers} fingers!
                    </span>
                  )}
                </p>
                <div className='inline-block bg-slate-100 text-advay-slate font-bold px-4 py-2 rounded-full text-sm uppercase tracking-wider'>
                  Round {round}
                </div>
              </div>

              {/* Progress Bars */}
              <div className='space-y-6 mt-auto'>
                <div>
                  <div className='flex justify-between font-bold text-text-secondary mb-2 uppercase tracking-wide text-sm'>
                    <span>Pose Accuracy</span>
                    <span className={matchProgress > 70 ? 'text-[#10B981]' : ''}>{Math.round(matchProgress)}%</span>
                  </div>
                  <div className='h-6 bg-slate-100 rounded-full overflow-hidden border-2 border-[#F2CC8F]/50 p-1'>
                    <motion.div
                      className={`h-full rounded-full ${matchProgress > 70 ? 'bg-[#10B981]' : 'bg-[#3B82F6]'}`}
                      animate={{ width: `${matchProgress}%` }}
                      transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
                    />
                  </div>
                </div>

                <div>
                  <div className='flex justify-between font-bold text-text-secondary mb-2 uppercase tracking-wide text-sm'>
                    <span>Hold Steady!</span>
                    <span className={(holdTimeRef.current / HOLD_DURATION) >= 1 ? 'text-amber-500' : ''}>
                      {Math.round((holdTimeRef.current / HOLD_DURATION) * 100)}%
                    </span>
                  </div>
                  <div className='h-6 bg-slate-100 rounded-full overflow-hidden border-2 border-[#F2CC8F]/50 p-1'>
                    <motion.div
                      className='h-full bg-[#F59E0B] rounded-full'
                      animate={{
                        width: `${(holdTimeRef.current / HOLD_DURATION) * 100}%`,
                      }}
                      transition={{ type: 'tween', duration: 0.1 }}
                    />
                  </div>
                </div>

                {gameMode === 'combo' && targetFingers !== null && (
                  <div>
                    <div className='flex justify-between font-bold text-purple-600 mb-2 uppercase tracking-wide text-sm'>
                      <span>Fingers Required</span>
                      <span>{detectedFingers} / {targetFingers}</span>
                    </div>
                    <div className='h-6 bg-purple-100 rounded-full overflow-hidden border-2 border-purple-300/50 p-1'>
                      <motion.div
                        className='h-full bg-purple-500 rounded-full'
                        animate={{ width: `${Math.min((detectedFingers / targetFingers) * 100, 100)}%` }}
                        transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Right Column: Camera & Controls */}
            <div className='flex flex-col gap-6 flex-1 lg:w-2/3'>
              <div className='relative rounded-[2.5rem] overflow-hidden border-3 border-[#F2CC8F] shadow-[0_4px_0_#E5B86E] bg-slate-100 flex-1 min-h-[400px]'>
                
                <canvas
                  ref={canvasRef}
                  className='absolute inset-0 w-full h-full'
                  width={640}
                  height={360}
                />
                <div className='absolute top-6 left-6 px-4 py-2 bg-black/40 backdrop-blur-md rounded-full border border-white/20'>
                  <span className='text-white font-bold text-sm tracking-wide flex items-center gap-2'>
                    {cameraReady ? <><Check className="w-4 h-4" /> Camera Active</> : <><Hourglass className="w-4 h-4" /> Warming up...</>}
                  </span>
                </div>
              </div>

              <div className='flex gap-4'>
                <button
                  onClick={stopGame}
                  className='flex-1 py-4 bg-white hover:bg-slate-50 border-3 border-[#F2CC8F] rounded-[1.5rem] font-black text-text-secondary shadow-[0_4px_0_#E5B86E] transition-all hover:scale-[1.02] active:scale-95 text-lg'
                >
                  Stop Playing
                </button>
                <button
                  onClick={() => {
                    playPop();
                    setCurrentActionIndex((i: number) => (i + 1) % BODY_ACTIONS.length);
                    if (gameMode === 'combo') {
                      setTargetFingers(Math.floor(Math.random() * 5) + 1);
                    }
                    holdTimeRef.current = 0;
                  }}
                  className='flex-1 py-4 bg-[#F59E0B] hover:bg-amber-500 border-3 border-amber-200 hover:border-amber-300 rounded-[1.5rem] font-black text-white shadow-[0_4px_0_#E5B86E] transition-all hover:scale-[1.02] active:scale-95 text-lg flex items-center justify-center gap-2'
                >
                  Skip Pose <SkipForward className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Celebration Overlay */}
        <AnimatePresence>
          {showCelebration && (
            <motion.div
              className='fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className='bg-white border-3 border-[#F2CC8F] rounded-[3rem] p-12 text-center max-w-md w-[90%] shadow-lg'
                initial={{ scale: 0.8, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.8, y: 20, opacity: 0 }}
              >
                <div className='w-24 h-24 mx-auto mb-6 text-[#10B981] drop-shadow-[0_4px_0_#E5B86E]'>
                  <PartyPopper className="w-full h-full" strokeWidth={1.5} />
                </div>
                <h2 className='text-4xl font-black text-[#10B981] tracking-tight mb-4'>
                  Great Pose!
                </h2>
                <div className='inline-block bg-amber-50 border-3 border-amber-100 text-amber-500 text-2xl font-black rounded-full px-8 py-3'>
                  +100 Points
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
});

export default SimonSays;
