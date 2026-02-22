import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Webcam from 'react-webcam';
import { motion, AnimatePresence } from 'framer-motion';
import { FilesetResolver, PoseLandmarker } from '@mediapipe/tasks-vision';

interface BodyAction {
  name: string;
  emoji: string;
  instruction: string;
  landmark: string;
}

const BODY_ACTIONS: BodyAction[] = [
  {
    name: 'Touch Head',
    emoji: '🙂',
    instruction: 'Touch your head with both hands!',
    landmark: 'head',
  },
  {
    name: 'Wave',
    emoji: '👋',
    instruction: 'Wave hello with one hand!',
    landmark: 'wave',
  },
  {
    name: 'Arms Up',
    emoji: '🙌',
    instruction: 'Put both arms up in the air!',
    landmark: 'armsUp',
  },
  {
    name: 'Hands On Hips',
    emoji: '💪',
    instruction: 'Put your hands on your hips!',
    landmark: 'handsOnHips',
  },
  {
    name: 'T-Rex Arms',
    emoji: '🦖',
    instruction: 'Bend both elbows like T-Rex!',
    landmark: 'tRex',
  },
  {
    name: 'Touch Shoulders',
    emoji: '💪',
    instruction: 'Touch both shoulders with your hands!',
    landmark: 'shoulders',
  },
];

export function SimonSays() {
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
  const [cameraReady, setCameraReady] = useState(false);
  const [currentActionIndex, setCurrentActionIndex] = useState(0);
  const [matchProgress, setMatchProgress] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [round, setRound] = useState(1);

  const currentAction = BODY_ACTIONS[currentActionIndex];
  const HOLD_DURATION = 2000;

  const holdTimeRef = useRef(0);
  const lastPoseRef = useRef<any[] | null>(null);

  useEffect(() => {
    async function initPose() {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm',
        );
        const landmarker = await PoseLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              'https://storage.googleapis.com/mediapipe-models/pose/landmarker/pose_landmarker/float16/1/pose_landmarker.task',
            delegate: 'GPU',
          },
          runningMode: 'VIDEO',
          numPoses: 1,
        });
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

      if (matchScore > 70) {
        holdTimeRef.current += 50;
        if (holdTimeRef.current >= HOLD_DURATION) {
          setScore((s) => s + 100);
          setShowResult(true);
          setShowCelebration(true);
          setTimeout(() => {
            setShowCelebration(false);
            setCurrentActionIndex((i) => (i + 1) % BODY_ACTIONS.length);
            setShowResult(false);
            holdTimeRef.current = 0;
            setRound((r) => r + 1);
          }, 2000);
        }
      } else {
        holdTimeRef.current = 0;
      }

      lastPoseRef.current = landmarks;
    }

    animationRef.current = requestAnimationFrame(detectPose);
  }, [cameraReady, isPlaying, showResult, currentAction]);

  useEffect(() => {
    if (isPlaying && cameraReady) {
      detectPose();
    }
  }, [isPlaying, cameraReady, detectPose]);

  const startGame = () => {
    setIsPlaying(true);
    setScore(0);
    setCurrentActionIndex(0);
    setRound(1);
    holdTimeRef.current = 0;
  };

  const stopGame = () => {
    setIsPlaying(false);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  };

  const handleVideoLoad = () => {
    setCameraReady(true);
  };

  if (isLoading) {
    return (
      <div className='min-h-[100dvh] bg-[#FFF8F0] flex items-center justify-center p-4'>
        <motion.div
          className='bg-white rounded-[2.5rem] border-4 border-slate-100 p-12 text-center max-w-md w-full shadow-sm'
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className='text-6xl mb-6 flex justify-center'>
            <div className='w-24 h-24 border-4 border-[#3B82F6] border-t-transparent rounded-full animate-spin' />
          </div>
          <h2 className='text-2xl font-black text-slate-800 tracking-tight mb-2'>
            Loading Simon Says
          </h2>
          <p className='text-slate-500 font-bold'>Warming up the camera...</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='min-h-[100dvh] bg-[#FFF8F0] flex items-center justify-center p-4'>
        <div className='bg-red-50 rounded-[2.5rem] border-4 border-red-100 p-12 text-center max-w-md w-full shadow-sm'>
          <div className='text-6xl mb-6'>😢</div>
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
          className='flex items-center gap-2 px-6 py-3 bg-white hover:bg-slate-50 border-4 border-slate-100 rounded-[1.5rem] font-bold text-slate-500 transition-colors shadow-sm'
        >
          <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={3} d='M10 19l-7-7m0 0l7-7m-7 7h18' /></svg>
          <span className='hidden sm:inline'>Back</span>
        </button>

        <h1 className='text-3xl md:text-4xl font-black text-slate-800 tracking-tight absolute left-1/2 -translate-x-1/2'>
          Simon Says
        </h1>

        <div className='bg-amber-50 border-4 border-amber-100 px-6 py-3 rounded-[1.5rem] font-black text-amber-500 text-xl shadow-sm flex items-center gap-2'>
          ⭐ <span>{score}</span>
        </div>
      </header>

      <div className='max-w-5xl mx-auto w-full flex-1 flex flex-col'>
        {!isPlaying ? (
          <motion.div
            className='bg-white rounded-[2.5rem] border-4 border-slate-100 p-8 md:p-16 shadow-sm flex-1 flex flex-col items-center justify-center text-center'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className='text-[8rem] mb-8 drop-shadow-sm hover:scale-110 transition-transform'>🧠</div>
            <h2 className='text-4xl md:text-5xl font-black text-[#10B981] tracking-tight mb-4'>
              Simon Says!
            </h2>
            <p className='text-slate-500 text-xl md:text-2xl font-bold mb-12 max-w-lg'>
              Follow the instructions—but only if Simon says so!
            </p>

            <div className='bg-[#FFF8F0] border-4 border-slate-100 rounded-[2rem] p-8 mb-12 max-w-2xl w-full text-left'>
              <h3 className='font-black text-slate-700 text-2xl mb-6'>How to Play:</h3>
              <ul className='space-y-4 text-slate-600 font-bold text-lg'>
                <li className='flex items-center gap-3'><span className='text-3xl'>📸</span> Stand directly in front of your camera</li>
                <li className='flex items-center gap-3'><span className='text-3xl'>👂</span> Listen carefully to what Simon says</li>
                <li className='flex items-center gap-3'><span className='text-3xl'>🏃</span> Do the action with your whole body!</li>
                <li className='flex items-center gap-3'><span className='text-3xl'>⏸️</span> Hold the pose steady to complete it</li>
              </ul>
            </div>

            <button
              onClick={startGame}
              className='w-full max-w-md py-6 bg-[#3B82F6] hover:bg-blue-600 border-4 border-blue-200 hover:border-blue-300 text-white text-2xl font-black rounded-[2rem] shadow-sm transition-all hover:scale-105 active:scale-95'
            >
              Start Playing! 🎮
            </button>
          </motion.div>
        ) : (
          <div className='flex flex-col lg:flex-row gap-6 lg:gap-8 flex-1 min-h-0'>
            {/* Left Column: Instructions */}
            <motion.div
              className='bg-white rounded-[2.5rem] border-4 border-slate-100 p-8 shadow-sm flex flex-col justify-center flex-1 lg:max-w-md'
              key={currentActionIndex}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className='text-center mb-10'>
                <div className='inline-block bg-[#FFF8F0] border-4 border-slate-100 rounded-[2rem] p-6 text-[5rem] mb-6 drop-shadow-sm'>
                  {currentAction.emoji}
                </div>
                <h3 className='text-4xl font-black text-slate-800 tracking-tight mb-4'>
                  {currentAction.name}
                </h3>
                <p className='text-xl font-bold text-slate-500 mb-4'>
                  {currentAction.instruction}
                </p>
                <div className='inline-block bg-slate-100 text-slate-600 font-bold px-4 py-2 rounded-full text-sm uppercase tracking-wider'>
                  Round {round}
                </div>
              </div>

              {/* Progress Bars */}
              <div className='space-y-6 mt-auto'>
                <div>
                  <div className='flex justify-between font-bold text-slate-500 mb-2 uppercase tracking-wide text-sm'>
                    <span>Pose Accuracy</span>
                    <span className={matchProgress > 70 ? 'text-[#10B981]' : ''}>{Math.round(matchProgress)}%</span>
                  </div>
                  <div className='h-6 bg-slate-100 rounded-full overflow-hidden border-2 border-slate-200/50 p-1'>
                    <motion.div
                      className={`h-full rounded-full ${matchProgress > 70 ? 'bg-[#10B981]' : 'bg-[#3B82F6]'}`}
                      animate={{ width: `${matchProgress}%` }}
                      transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
                    />
                  </div>
                </div>

                <div>
                  <div className='flex justify-between font-bold text-slate-500 mb-2 uppercase tracking-wide text-sm'>
                    <span>Hold Steady!</span>
                    <span className={(holdTimeRef.current / HOLD_DURATION) >= 1 ? 'text-amber-500' : ''}>
                      {Math.round((holdTimeRef.current / HOLD_DURATION) * 100)}%
                    </span>
                  </div>
                  <div className='h-6 bg-slate-100 rounded-full overflow-hidden border-2 border-slate-200/50 p-1'>
                    <motion.div
                      className='h-full bg-[#F59E0B] rounded-full'
                      animate={{
                        width: `${(holdTimeRef.current / HOLD_DURATION) * 100}%`,
                      }}
                      transition={{ type: 'tween', duration: 0.1 }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right Column: Camera & Controls */}
            <div className='flex flex-col gap-6 flex-1 lg:w-2/3'>
              <div className='relative rounded-[2.5rem] overflow-hidden border-4 border-slate-100 shadow-sm bg-slate-100 flex-1 min-h-[400px]'>
                <Webcam
                  ref={webcamRef}
                  onLoadedData={handleVideoLoad}
                  className='absolute inset-0 w-full h-full object-cover'
                  mirrored
                />
                <canvas
                  ref={canvasRef}
                  className='absolute inset-0 w-full h-full'
                  width={640}
                  height={360}
                />
                <div className='absolute top-6 left-6 px-4 py-2 bg-black/40 backdrop-blur-md rounded-full border border-white/20'>
                  <span className='text-white font-bold text-sm tracking-wide'>
                    {cameraReady ? '✅ Camera Active' : '⌛ Warming up...'}
                  </span>
                </div>
              </div>

              <div className='flex gap-4'>
                <button
                  onClick={stopGame}
                  className='flex-1 py-4 bg-white hover:bg-slate-50 border-4 border-slate-100 rounded-[1.5rem] font-black text-slate-500 shadow-sm transition-all hover:scale-[1.02] active:scale-95 text-lg'
                >
                  Stop Playing
                </button>
                <button
                  onClick={() => {
                    setCurrentActionIndex((i) => (i + 1) % BODY_ACTIONS.length);
                    holdTimeRef.current = 0;
                  }}
                  className='flex-1 py-4 bg-[#F59E0B] hover:bg-amber-500 border-4 border-amber-200 hover:border-amber-300 rounded-[1.5rem] font-black text-white shadow-sm transition-all hover:scale-[1.02] active:scale-95 text-lg'
                >
                  Skip Pose ⏭
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
                className='bg-white border-4 border-slate-100 rounded-[3rem] p-12 text-center max-w-md w-[90%] shadow-lg'
                initial={{ scale: 0.8, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.8, y: 20, opacity: 0 }}
              >
                <div className='text-[6rem] mb-6 drop-shadow-sm'>🎉</div>
                <h2 className='text-4xl font-black text-[#10B981] tracking-tight mb-4'>
                  Great Pose!
                </h2>
                <div className='inline-block bg-amber-50 border-4 border-amber-100 text-amber-500 text-2xl font-black rounded-full px-8 py-3'>
                  +100 Points
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default SimonSays;
