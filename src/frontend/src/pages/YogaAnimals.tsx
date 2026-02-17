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
      <div className='min-h-screen bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center'>
        <motion.div
          className='text-center'
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className='text-6xl mb-4'>🦁</div>
          <h2 className='text-2xl font-bold text-purple-700 mb-2'>
            Loading Yoga Animals...
          </h2>
          <p className='text-purple-500'>Getting ready for some animal fun!</p>
        </motion.div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-red-100 to-orange-100 flex items-center justify-center'>
        <div className='text-center p-8'>
          <div className='text-6xl mb-4'>😢</div>
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
    <div className='min-h-screen bg-gradient-to-br from-purple-100 to-pink-100 p-4'>
      {/* Header */}
      <header className='flex justify-between items-center mb-4'>
        <button
          onClick={() => navigate('/games')}
          className='px-4 py-2 bg-white/80 backdrop-blur rounded-full font-bold text-purple-700 hover:bg-white transition'
        >
          ← Back
        </button>
        <h1 className='text-2xl font-bold text-purple-800'>Yoga Animals</h1>
        <div className='px-4 py-2 bg-yellow-400 rounded-full font-bold text-purple-800'>
          ⭐ {score}
        </div>
      </header>

      <div className='max-w-4xl mx-auto'>
        {!isPlaying ? (
          // Pre-game screen
          <motion.div
            className='bg-white rounded-3xl p-8 shadow-lg'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className='text-center mb-8'>
              <div className='text-8xl mb-4'>🦁🌳🐱</div>
              <h2 className='text-3xl font-bold text-purple-800 mb-2'>
                Yoga Animals!
              </h2>
              <p className='text-purple-600 text-lg'>
                Copy animal poses with your body!
              </p>
            </div>

            <div className='bg-purple-50 rounded-2xl p-6 mb-8'>
              <h3 className='font-bold text-purple-800 mb-4'>How to Play:</h3>
              <ul className='space-y-2 text-purple-700'>
                <li className='flex items-start gap-2'>
                  <span className='text-purple-500'>1.</span>
                  Stand in front of your camera
                </li>
                <li className='flex items-start gap-2'>
                  <span className='text-purple-500'>2.</span>
                  Pip will show you an animal pose
                </li>
                <li className='flex items-start gap-2'>
                  <span className='text-purple-500'>3.</span>
                  Copy the pose and hold it for 2 seconds!
                </li>
                <li className='flex items-start gap-2'>
                  <span className='text-purple-500'>4.</span>
                  Earn stars for each pose you master
                </li>
              </ul>
            </div>

            <button
              onClick={startGame}
              className='w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xl font-bold rounded-2xl hover:from-purple-600 hover:to-pink-600 transition transform hover:scale-105'
            >
              Start Yoga! 🧘
            </button>
          </motion.div>
        ) : (
          // Playing screen
          <div className='space-y-4'>
            {/* Current pose card */}
            <motion.div
              className='bg-white rounded-3xl p-6 shadow-lg'
              key={currentPoseIndex}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className='flex items-center gap-4 mb-4'>
                <div className='text-5xl'>{currentPose.emoji}</div>
                <div>
                  <h3 className='text-2xl font-bold text-purple-800'>
                    {currentPose.name}
                  </h3>
                  <p className='text-purple-600'>{currentPose.description}</p>
                </div>
              </div>

              <div className='bg-purple-50 rounded-xl p-4'>
                <p className='text-lg text-purple-700 font-medium'>
                  💡 {currentPose.instruction}
                </p>
              </div>

              {/* Progress bar */}
              <div className='mt-4'>
                <div className='flex justify-between text-sm text-purple-600 mb-1'>
                  <span>Pose Match</span>
                  <span>{Math.round(matchProgress)}%</span>
                </div>
                <div className='h-4 bg-purple-100 rounded-full overflow-hidden'>
                  <motion.div
                    className='h-full bg-gradient-to-r from-purple-500 to-pink-500'
                    initial={{ width: 0 }}
                    animate={{ width: `${matchProgress}%` }}
                  />
                </div>
              </div>

              {/* Hold progress */}
              <div className='mt-4'>
                <div className='flex justify-between text-sm text-green-600 mb-1'>
                  <span>Hold the pose!</span>
                  <span>{Math.round((holdTime / HOLD_DURATION) * 100)}%</span>
                </div>
                <div className='h-2 bg-green-100 rounded-full overflow-hidden'>
                  <motion.div
                    className='h-full bg-green-500'
                    animate={{ width: `${(holdTime / HOLD_DURATION) * 100}%` }}
                  />
                </div>
              </div>
            </motion.div>

            {/* Camera feed */}
            <div className='relative rounded-3xl overflow-hidden shadow-lg bg-black'>
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
              <div className='absolute top-4 left-4 px-3 py-1 bg-black/50 backdrop-blur rounded-full'>
                <span className='text-white text-sm'>
                  {cameraReady ? '📹 Camera Ready' : '⏳ Loading...'}
                </span>
              </div>

              {/* Match indicator */}
              <div className='absolute top-4 right-4 px-3 py-1 bg-black/50 backdrop-blur rounded-full'>
                <span
                  className={`text-sm font-bold ${matchProgress > 70 ? 'text-green-400' : 'text-white'}`}
                >
                  {matchProgress > 70
                    ? '✅ Match!'
                    : `${Math.round(matchProgress)}%`}
                </span>
              </div>
            </div>

            {/* Controls */}
            <div className='flex gap-4'>
              <button
                onClick={stopGame}
                className='flex-1 py-3 bg-white rounded-xl font-bold text-purple-700 hover:bg-purple-50 transition'
              >
                Stop Game
              </button>
              <button
                onClick={() =>
                  setCurrentPoseIndex((i) => (i + 1) % ANIMAL_POSES.length)
                }
                className='flex-1 py-3 bg-purple-500 text-white rounded-xl font-bold hover:bg-purple-600 transition'
              >
                Skip Pose ⏭
              </button>
            </div>
          </div>
        )}

        {/* Celebration overlay */}
        <AnimatePresence>
          {showCelebration && (
            <motion.div
              className='fixed inset-0 bg-black/50 backdrop-blur flex items-center justify-center z-50'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className='bg-white rounded-3xl p-8 text-center shadow-2xl'
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
              >
                <div className='text-8xl mb-4'>🎉</div>
                <h2 className='text-3xl font-bold text-purple-800 mb-2'>
                  Amazing!
                </h2>
                <p className='text-purple-600 text-lg mb-4'>
                  You did the {currentPose.name} pose!
                </p>
                <div className='text-4xl'>+100 ⭐</div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
