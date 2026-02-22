import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Webcam from 'react-webcam';
import { motion, AnimatePresence } from 'framer-motion';
import { FilesetResolver, PoseLandmarker } from '@mediapipe/tasks-vision';

// Animal pose definitions with target landmarks
interface AnimalPose {
  name: string;
  emoji: string;
  description: string;
  instruction: string;
  // Target angles for key body parts
  targets: {
    // Relative positions for validation
    leftArmAngle?: number;
    rightArmAngle?: number;
    leftLegAngle?: number;
    rightLegAngle?: number;
    torsoAngle?: number;
  };
}

const ANIMAL_POSES: AnimalPose[] = [
  {
    name: 'Lion',
    emoji: '🦁',
    description: 'Be a fierce lion!',
    instruction: 'Put your hands up like claws and open your mouth wide!',
    targets: { leftArmAngle: 45, rightArmAngle: 45, torsoAngle: 0 },
  },
  {
    name: 'Cat',
    emoji: '🐱',
    description: 'Stretch like a cat!',
    instruction:
      'Get on all fours and arch your back up like a stretching cat!',
    targets: { torsoAngle: 30 },
  },
  {
    name: 'Tree',
    emoji: '🌳',
    description: 'Stand tall like a tree!',
    instruction: 'Stand on one leg, with arms stretched up like branches!',
    targets: { leftLegAngle: 90, rightLegAngle: 0, torsoAngle: 0 },
  },
  {
    name: 'Dog',
    emoji: '🐕',
    description: 'Be a happy dog!',
    instruction: 'Crouch down and stick your arms out like paws!',
    targets: { leftArmAngle: 90, rightArmAngle: 90, torsoAngle: -20 },
  },
  {
    name: 'Frog',
    emoji: '🐸',
    description: 'Jump like a frog!',
    instruction: 'Squat down with hands on the ground, then jump up!',
    targets: { leftLegAngle: 20, rightLegAngle: 20, torsoAngle: -45 },
  },
  {
    name: 'Bird',
    emoji: '🐦',
    description: 'Fly like a bird!',
    instruction: 'Stand with arms out wide like wings and flap!',
    targets: { leftArmAngle: 170, rightArmAngle: 170, torsoAngle: 0 },
  },
];

// Calculate angle between three points
function calculateAngle(
  a: { x: number; y: number },
  b: { x: number; y: number },
  c: { x: number; y: number },
): number {
  const radians =
    Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
  let angle = Math.abs((radians * 180.0) / Math.PI);
  if (angle > 180.0) angle = 360.0 - angle;
  return angle;
}

export function YogaAnimals() {
  const navigate = useNavigate();
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const poseLandmarkerRef = useRef<PoseLandmarker | null>(null);
  const animationRef = useRef<number>(0);

  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPoseIndex, setCurrentPoseIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [matchProgress, setMatchProgress] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [holdTime, setHoldTime] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [cameraReady, setCameraReady] = useState(false);

  const currentPose = ANIMAL_POSES[currentPoseIndex];
  const HOLD_DURATION = 2000; // 2 seconds to hold pose

  // Initialize Pose Landmarker
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

  // Game loop for pose detection
  const detectPose = useCallback(() => {
    if (
      !webcamRef.current ||
      !canvasRef.current ||
      !poseLandmarkerRef.current ||
      !cameraReady
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

      // Get key body points
      const leftShoulder = landmarks[11];
      const rightShoulder = landmarks[12];
      const leftElbow = landmarks[13];
      const rightElbow = landmarks[14];
      const leftWrist = landmarks[15];
      const rightWrist = landmarks[16];
      const leftHip = landmarks[23];
      const rightHip = landmarks[24];
      const leftKnee = landmarks[25];
      const rightKnee = landmarks[26];
      const leftAnkle = landmarks[27];
      const rightAnkle = landmarks[28];

      // Calculate arm angles
      const leftArmAngle = calculateAngle(leftShoulder, leftElbow, leftWrist);
      const rightArmAngle = calculateAngle(
        rightShoulder,
        rightElbow,
        rightWrist,
      );

      // Calculate leg angles
      const leftLegAngle = calculateAngle(leftHip, leftKnee, leftAnkle);
      const rightLegAngle = calculateAngle(rightHip, rightKnee, rightAnkle);

      // Calculate torso angle (shoulders relative to hips)
      const torsoAngle =
        calculateAngle(
          leftShoulder,
          {
            x: (leftShoulder.x + rightShoulder.x) / 2,
            y: (leftShoulder.y + rightShoulder.y) / 2,
          },
          leftHip,
        ) - 90;

      // Calculate match score based on pose targets
      let totalScore = 0;
      let targetCount = 0;

      if (currentPose.targets.leftArmAngle !== undefined) {
        const diff = Math.abs(leftArmAngle - currentPose.targets.leftArmAngle);
        totalScore += Math.max(0, 100 - diff);
        targetCount++;
      }
      if (currentPose.targets.rightArmAngle !== undefined) {
        const diff = Math.abs(
          rightArmAngle - currentPose.targets.rightArmAngle,
        );
        totalScore += Math.max(0, 100 - diff);
        targetCount++;
      }
      if (currentPose.targets.leftLegAngle !== undefined) {
        const diff = Math.abs(leftLegAngle - currentPose.targets.leftLegAngle);
        totalScore += Math.max(0, 100 - diff);
        targetCount++;
      }
      if (currentPose.targets.rightLegAngle !== undefined) {
        const diff = Math.abs(
          rightLegAngle - currentPose.targets.rightLegAngle,
        );
        totalScore += Math.max(0, 100 - diff);
        targetCount++;
      }
      if (currentPose.targets.torsoAngle !== undefined) {
        const diff = Math.abs(torsoAngle - currentPose.targets.torsoAngle);
        totalScore += Math.max(0, 100 - diff);
        targetCount++;
      }

      const matchScore = targetCount > 0 ? totalScore / targetCount : 0;
      setMatchProgress(matchScore);

      // Check if pose is matched (above 70% threshold)
      if (matchScore > 70) {
        setHoldTime((prev) => {
          const newTime = prev + 50;
          if (newTime >= HOLD_DURATION && !showCelebration) {
            // Pose held long enough - success!
            setScore((s) => s + 100);
            setShowCelebration(true);
            setTimeout(() => {
              setShowCelebration(false);
              // Move to next pose
              setCurrentPoseIndex((i) => (i + 1) % ANIMAL_POSES.length);
              setHoldTime(0);
            }, 2000);
          }
          return newTime;
        });
      } else {
        setHoldTime(0);
      }

      // Draw skeleton on canvas
      drawSkeleton(landmarks);
    }

    animationRef.current = requestAnimationFrame(detectPose);
  }, [cameraReady, currentPose, showCelebration]);

  // Draw skeleton overlay
  function drawSkeleton(landmarks: any[]) {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw body connections
    const connections = [
      [11, 12],
      [11, 13],
      [13, 15],
      [12, 14],
      [14, 16], // Arms
      [11, 23],
      [12, 24],
      [23, 24], // Torso
      [23, 25],
      [25, 27],
      [24, 26],
      [26, 28], // Legs
    ];

    ctx.strokeStyle = '#10B981';
    ctx.lineWidth = 3;

    connections.forEach(([i, j]) => {
      const p1 = landmarks[i];
      const p2 = landmarks[j];
      ctx.beginPath();
      ctx.moveTo(p1.x * width, p1.y * height);
      ctx.lineTo(p2.x * width, p2.y * height);
      ctx.stroke();
    });

    // Draw key points
    const keyPoints = [11, 12, 13, 14, 15, 16, 23, 24, 25, 26, 27, 28];
    keyPoints.forEach((i) => {
      const p = landmarks[i];
      ctx.beginPath();
      ctx.arc(p.x * width, p.y * height, 6, 0, 2 * Math.PI);
      ctx.fillStyle = '#10B981';
      ctx.fill();
    });
  }

  // Start/stop game
  const startGame = () => {
    setIsPlaying(true);
    setScore(0);
    setCurrentPoseIndex(0);
    setHoldTime(0);
    setMatchProgress(0);
  };

  const stopGame = () => {
    setIsPlaying(false);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  };

  // Handle video loaded
  const handleVideoLoad = () => {
    setCameraReady(true);
  };

  // Start detection when playing
  useEffect(() => {
    if (isPlaying && cameraReady) {
      detectPose();
    }
  }, [isPlaying, cameraReady, detectPose]);

  // Render loading state
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
            Loading Yoga Animals
          </h2>
          <p className='text-slate-500 font-bold'>Getting ready for some animal fun...</p>
        </motion.div>
      </div>
    );
  }

  // Render error state
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
          Yoga Animals
        </h1>

        <div className='bg-amber-50 border-4 border-amber-100 px-6 py-3 rounded-[1.5rem] font-black text-amber-500 text-xl shadow-sm flex items-center gap-2'>
          ⭐ <span>{score}</span>
        </div>
      </header>

      <div className='max-w-5xl mx-auto w-full flex-1 flex flex-col'>
        {!isPlaying ? (
          // Pre-game screen
          <motion.div
            className='bg-white rounded-[2.5rem] border-4 border-slate-100 p-8 md:p-16 shadow-sm flex-1 flex flex-col items-center justify-center text-center'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className='text-[7rem] mb-6 drop-shadow-sm hover:scale-110 transition-transform'>🦁🌳🐱</div>
            <h2 className='text-4xl md:text-5xl font-black text-[#10B981] tracking-tight mb-4'>
              Yoga Animals!
            </h2>
            <p className='text-slate-500 text-xl md:text-2xl font-bold mb-12 max-w-lg'>
              Copy animal poses with your body!
            </p>

            <div className='bg-[#FFF8F0] border-4 border-slate-100 rounded-[2rem] p-8 mb-12 max-w-2xl w-full text-left'>
              <h3 className='font-black text-slate-700 text-2xl mb-6'>How to Play:</h3>
              <ul className='space-y-4 text-slate-600 font-bold text-lg'>
                <li className='flex items-center gap-3'><span className='text-3xl'>📸</span> Stand in front of your camera</li>
                <li className='flex items-center gap-3'><span className='text-3xl'>👀</span> Pip will show you an animal pose</li>
                <li className='flex items-center gap-3'><span className='text-3xl'>🧘</span> Copy the pose and hold it for 2 seconds!</li>
                <li className='flex items-center gap-3'><span className='text-3xl'>⭐</span> Earn stars for each pose you master</li>
              </ul>
            </div>

            <button
              onClick={startGame}
              className='w-full max-w-md py-6 bg-[#3B82F6] hover:bg-blue-600 border-4 border-blue-200 hover:border-blue-300 text-white text-2xl font-black rounded-[2rem] shadow-sm transition-all hover:scale-105 active:scale-95'
            >
              Start Yoga! 🧘
            </button>
          </motion.div>
        ) : (
          // Playing screen
          <div className='flex flex-col lg:flex-row gap-6 lg:gap-8 flex-1 min-h-0'>
            {/* Left Column: Current pose card */}
            <motion.div
              className='bg-white rounded-[2.5rem] border-4 border-slate-100 p-8 shadow-sm flex flex-col justify-center flex-1 lg:max-w-md'
              key={currentPoseIndex}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className='text-center mb-10'>
                <div className='inline-block bg-[#FFF8F0] border-4 border-slate-100 rounded-[2rem] p-6 text-[5rem] mb-6 drop-shadow-sm'>
                  {currentPose.emoji}
                </div>
                <h3 className='text-4xl font-black text-slate-800 tracking-tight mb-4'>
                  {currentPose.name}
                </h3>
                <p className='text-xl font-bold text-slate-500 mb-8'>
                  {currentPose.description}
                </p>

                <div className='bg-blue-50 border-4 border-blue-100 rounded-2xl p-4 inline-block text-left'>
                  <p className='text-lg text-blue-800 font-bold'>
                    💡 {currentPose.instruction}
                  </p>
                </div>
              </div>

              {/* Progress bars */}
              <div className='space-y-6 mt-auto'>
                <div>
                  <div className='flex justify-between font-bold text-slate-500 mb-2 uppercase tracking-wide text-sm'>
                    <span>Pose Match</span>
                    <span className={matchProgress > 70 ? 'text-[#10B981]' : ''}>{Math.round(matchProgress)}%</span>
                  </div>
                  <div className='h-6 bg-slate-100 rounded-full overflow-hidden border-2 border-slate-200/50 p-1'>
                    <motion.div
                      className={`h-full rounded-full ${matchProgress > 70 ? 'bg-[#10B981]' : 'bg-[#3B82F6]'}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${matchProgress}%` }}
                      transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
                    />
                  </div>
                </div>

                <div>
                  <div className='flex justify-between font-bold text-slate-500 mb-2 uppercase tracking-wide text-sm'>
                    <span>Hold the pose!</span>
                    <span className={(holdTime / HOLD_DURATION) >= 1 ? 'text-amber-500' : ''}>
                      {Math.round((holdTime / HOLD_DURATION) * 100)}%
                    </span>
                  </div>
                  <div className='h-6 bg-slate-100 rounded-full overflow-hidden border-2 border-slate-200/50 p-1'>
                    <motion.div
                      className='h-full bg-[#F59E0B] rounded-full'
                      animate={{ width: `${(holdTime / HOLD_DURATION) * 100}%` }}
                      transition={{ type: 'tween', duration: 0.1 }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right Column: Camera & Controls */}
            <div className='flex flex-col gap-6 flex-1 lg:w-2/3'>
              {/* Camera feed */}
              <div className='relative rounded-[2.5rem] overflow-hidden border-4 border-slate-100 shadow-sm bg-slate-100 flex-1 min-h-[400px]'>
                <Webcam
                  ref={webcamRef}
                  onLoadedData={handleVideoLoad}
                  className='w-full h-64 object-cover'
                  mirrored
                />
                <canvas
                  ref={canvasRef}
                  className='absolute top-0 left-0 w-full h-64 pointer-events-none'
                  width={640}
                  height={360}
                />

                {/* Pose indicator */}
                <div className='absolute top-6 left-6 px-4 py-2 bg-black/40 backdrop-blur-md rounded-full border border-white/20'>
                  <span className='text-white font-bold text-sm tracking-wide'>
                    {cameraReady ? '✅ Camera Ready' : '⏳ Loading...'}
                  </span>
                </div>

                {/* Match indicator */}
                <div className={`absolute top-6 right-6 px-6 py-2 backdrop-blur-md rounded-full border-4 shadow-sm transition-colors ${matchProgress > 70 ? 'bg-[#10B981]/90 border-emerald-400' : 'bg-black/40 border-white/20'}`}>
                  <span
                    className={`text-sm font-black tracking-wide ${matchProgress > 70 ? 'text-white' : 'text-white'}`}
                  >
                    {matchProgress > 70
                      ? '🎯 Perfect Match!'
                      : `${Math.round(matchProgress)}% Matched`}
                  </span>
                </div>
              </div>

              {/* Controls */}
              <div className='flex gap-4'>
                <button
                  onClick={stopGame}
                  className='flex-1 py-4 bg-white hover:bg-slate-50 border-4 border-slate-100 rounded-[1.5rem] font-black text-slate-500 shadow-sm transition-all hover:scale-[1.02] active:scale-95 text-lg'
                >
                  Stop Playing
                </button>
                <button
                  onClick={() =>
                    setCurrentPoseIndex((i) => (i + 1) % ANIMAL_POSES.length)
                  }
                  className='flex-1 py-4 bg-[#F59E0B] hover:bg-amber-500 border-4 border-amber-200 hover:border-amber-300 rounded-[1.5rem] font-black text-white shadow-sm transition-all hover:scale-[1.02] active:scale-95 text-lg'
                >
                  Skip Pose ⏭
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Celebration overlay */}
        <AnimatePresence>
          {showCelebration && (
            <motion.div
              className='fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className='bg-white border-4 border-slate-100 rounded-[3rem] p-12 text-center max-w-md w-full shadow-lg'
                initial={{ scale: 0.8, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.8, y: 20, opacity: 0 }}
              >
                <div className='text-[6rem] mb-6 drop-shadow-sm'>��</div>
                <h2 className='text-4xl font-black text-[#10B981] tracking-tight mb-2'>
                  Amazing!
                </h2>
                <p className='text-slate-500 font-bold text-xl mb-6'>
                  You did the {currentPose.name} pose!
                </p>
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
