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
        setError('Failed to load pose detection. Please refresh the page.');
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
      <div className='min-h-screen bg-gradient-to-br from-orange-100 to-yellow-100 flex items-center justify-center'>
        <motion.div
          className='text-center'
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className='text-6xl mb-4'>🧠</div>
          <h2 className='text-2xl font-bold text-orange-700 mb-2'>
            Loading Simon Says...
          </h2>
          <p className='text-orange-500'>Get ready to move!</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-red-100 to-orange-100 flex items-center justify-center'>
        <div className='text-center p-8'>
          <div className='text-6xl mb-4'>😢</div>
          <h2 className='text-2xl font-bold text-red-700 mb-2'>Oops!</h2>
          <p className='text-red-500 mb-4'>{error}</p>
          <button
            onClick={() => navigate('/games')}
            className='px-6 py-3 bg-purple-500 text-white rounded-full font-bold'
          >
            Back to Games
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-orange-100 to-yellow-100 p-4'>
      <header className='flex justify-between items-center mb-4'>
        <button
          onClick={() => navigate('/games')}
          className='px-4 py-2 bg-white/80 backdrop-blur rounded-full font-bold text-orange-700'
        >
          ← Back
        </button>
        <h1 className='text-2xl font-bold text-orange-800'>Simon Says</h1>
        <div className='px-4 py-2 bg-yellow-400 rounded-full font-bold text-orange-800'>
          ⭐ {score}
        </div>
      </header>

      <div className='max-w-4xl mx-auto'>
        {!isPlaying ? (
          <motion.div
            className='bg-white rounded-3xl p-8 shadow-lg'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className='text-center mb-8'>
              <div className='text-8xl mb-4'>🧠👆</div>
              <h2 className='text-3xl font-bold text-orange-800 mb-2'>
                Simon Says!
              </h2>
              <p className='text-orange-600 text-lg'>
                Do what Simon says with your body!
              </p>
            </div>
            <div className='bg-orange-50 rounded-2xl p-6 mb-8'>
              <h3 className='font-bold text-orange-800 mb-4'>How to Play:</h3>
              <ul className='space-y-2 text-orange-700'>
                <li>1. Stand in front of your camera</li>
                <li>2. Listen to Simon's command</li>
                <li>3. Do the action with your body!</li>
                <li>4. Hold the pose to earn points</li>
              </ul>
            </div>
            <button
              onClick={startGame}
              className='w-full py-4 bg-gradient-to-r from-orange-500 to-yellow-500 text-white text-xl font-bold rounded-2xl'
            >
              Start Game! 🎮
            </button>
          </motion.div>
        ) : (
          <div className='space-y-4'>
            <motion.div
              className='bg-white rounded-3xl p-6 shadow-lg'
              key={currentActionIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className='text-center'>
                <div className='text-5xl mb-4'>{currentAction.emoji}</div>
                <h3 className='text-2xl font-bold text-orange-800 mb-2'>
                  {currentAction.name}
                </h3>
                <p className='text-orange-600 mb-2'>
                  {currentAction.instruction}
                </p>
                <p className='text-gray-500'>Round {round}</p>
              </div>
              <div className='mt-4'>
                <div className='flex justify-between text-sm mb-1'>
                  <span>Match</span>
                  <span>{Math.round(matchProgress)}%</span>
                </div>
                <div className='h-4 bg-gray-100 rounded-full'>
                  <motion.div
                    className='h-full bg-orange-400'
                    animate={{ width: `${matchProgress}%` }}
                  />
                </div>
              </div>
              <div className='mt-4'>
                <div className='flex justify-between text-sm mb-1'>
                  <span>Hold!</span>
                  <span>
                    {Math.round((holdTimeRef.current / HOLD_DURATION) * 100)}%
                  </span>
                </div>
                <div className='h-2 bg-green-100 rounded-full'>
                  <motion.div
                    className='h-full bg-green-500'
                    animate={{
                      width: `${(holdTimeRef.current / HOLD_DURATION) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </motion.div>

            <div className='relative rounded-3xl overflow-hidden shadow-lg bg-black'>
              <Webcam
                ref={webcamRef}
                onLoadedData={handleVideoLoad}
                className='w-full h-64 object-cover'
                mirrored
              />
              <canvas
                ref={canvasRef}
                className='absolute top-0 left-0 w-full h-64'
                width={640}
                height={360}
              />
              <div className='absolute top-4 left-4 px-3 py-1 bg-black/50 rounded-full'>
                <span className='text-white text-sm'>
                  {cameraReady ? '📹 Ready' : '⏳ Loading...'}
                </span>
              </div>
            </div>

            <div className='flex gap-4'>
              <button
                onClick={stopGame}
                className='flex-1 py-3 bg-white rounded-xl font-bold text-orange-700'
              >
                Stop
              </button>
              <button
                onClick={() => {
                  setCurrentActionIndex((i) => (i + 1) % BODY_ACTIONS.length);
                  holdTimeRef.current = 0;
                }}
                className='flex-1 py-3 bg-orange-500 text-white rounded-xl font-bold'
              >
                Skip ⏭
              </button>
            </div>
          </div>
        )}

        <AnimatePresence>
          {showCelebration && (
            <motion.div
              className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className='bg-white rounded-3xl p-8 text-center'
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
              >
                <div className='text-8xl mb-4'>🎉</div>
                <h2 className='text-3xl font-bold text-orange-800 mb-2'>
                  Great Job!
                </h2>
                <p className='text-orange-600'>+100 ⭐</p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default SimonSays;
