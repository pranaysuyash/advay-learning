import { memo, useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FilesetResolver, PoseLandmarker } from '@mediapipe/tasks-vision';
import { useGameDrops } from '../hooks/useGameDrops';
import { useGameSessionProgress } from '../hooks/useGameSessionProgress';
import { triggerHaptic } from '../utils/haptics';
import {
  Dog,
  Cat,
  TreeDeciduous,
  Bird,
  Bug,
  Sparkles,
  Camera,
  Eye,
  Activity,
  Lightbulb,
  CheckCircle2,
  Loader2,
  Target,
  SkipForward,
} from 'lucide-react';
import { KenneyEnemy } from '../components/characters/KenneyCharacter';
import { useAudio } from '../utils/hooks/useAudio';
import { GameContainer } from '../components/GameContainer';
import { AccessDenied } from '../components/ui/AccessDenied';
import { useSubscription } from '../hooks/useSubscription';
import { progressQueue } from '../services/progressQueue';
import { useProgressStore } from '../store';
import WellnessTimer from '../components/WellnessTimer';
import { GlobalErrorBoundary } from '../components/errors/GlobalErrorBoundary';
import { STREAK_MILESTONE_INTERVAL } from '../games/constants';

// Animal pose definitions with target landmarks
interface AnimalPose {
  name: string;
  icon: React.ReactNode;
  description: string;
  instruction: string;
  targets: {
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
    icon: <Bug className='w-16 h-16' />,
    description: 'Be a fierce lion!',
    instruction: 'Put your hands up like claws and open your mouth wide!',
    targets: { leftArmAngle: 45, rightArmAngle: 45, torsoAngle: 0 },
  },
  {
    name: 'Cat',
    icon: <Cat className='w-16 h-16' />,
    description: 'Stretch like a cat!',
    instruction:
      'Get on all fours and arch your back up like a stretching cat!',
    targets: { torsoAngle: 30 },
  },
  {
    name: 'Tree',
    icon: <TreeDeciduous className='w-16 h-16' />,
    description: 'Stand tall like a tree!',
    instruction: 'Stand on one leg, with arms stretched up like branches!',
    targets: { leftLegAngle: 90, rightLegAngle: 0, torsoAngle: 0 },
  },
  {
    name: 'Dog',
    icon: <Dog className='w-16 h-16' />,
    description: 'Be a happy dog!',
    instruction: 'Crouch down and stick your arms out like paws!',
    targets: { leftArmAngle: 90, rightArmAngle: 90, torsoAngle: -20 },
  },
  {
    name: 'Frog',
    icon: <KenneyEnemy type='frog' animation='walk' size='lg' />,
    description: 'Jump like a frog!',
    instruction: 'Squat down with hands on the ground, then jump up!',
    targets: { leftLegAngle: 20, rightLegAngle: 20, torsoAngle: -45 },
  },
  {
    name: 'Bird',
    icon: <Bird className='w-16 h-16' />,
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

export const YogaAnimals = memo(function YogaAnimalsComponent() {
  const navigate = useNavigate();
  const reducedMotion = useReducedMotion();
  const { canAccessGame, isLoading: subLoading } = useSubscription();
  const hasAccess = canAccessGame('yoga-animals');
  const { currentProfile } = useProgressStore();
  const { onGameComplete, triggerEasterEgg } = useGameDrops('yoga-animals');

  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const poseLandmarkerRef = useRef<PoseLandmarker | null>(null);
  const animationRef = useRef<number>(0);
  const continuousHoldRef = useRef(0);

  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPoseIndex, setCurrentPoseIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [matchProgress, setMatchProgress] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [holdTime, setHoldTime] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [subError, setSubError] = useState<Error | null>(null);
  const [streak, setStreak] = useState(0);
  const [showStreakMilestone, setShowStreakMilestone] = useState(false);

  const { playPop, playFanfare } = useAudio();

  const currentPose = ANIMAL_POSES[currentPoseIndex];
  const HOLD_DURATION = 2000;

  // Show loading while checking subscription
  if (subLoading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-red-500'></div>
      </div>
    );
  }

  // Check subscription access
  if (!hasAccess) {
    return <AccessDenied gameName='Yoga Animals' gameId='yoga-animals' />;
  }

  // Error state
  if (subError || error) {
    return (
      <GameContainer title='Yoga Animals' onHome={() => navigate('/games')}>
        <div className='flex items-center justify-center min-h-screen'>
          <div className='text-center'>
            <h2 className='text-2xl font-bold text-red-600 mb-4'>
              Oops! Something went wrong
            </h2>
            <p className='text-slate-600 mb-4'>{subError?.message || error}</p>
            <button
              onClick={() => {
                setSubError(null);
                setError(null);
                window.location.reload();
              }}
              className='px-6 py-3 bg-[#3B82F6] text-white rounded-xl font-bold'
            >
              Try Again
            </button>
          </div>
        </div>
      </GameContainer>
    );
  }

  // Save progress on game complete
  const handleGameComplete = useCallback(
    async (finalScore: number) => {
      if (!currentProfile) return;

      try {
        await progressQueue.add({
          profileId: currentProfile.id,
          gameId: 'yoga-animals',
          score: finalScore,
          completed: true,
          metadata: {
            posesCompleted: currentPoseIndex,
            holdTime,
          },
        });
        onGameComplete(finalScore);
      } catch (err) {
        console.error('Failed to save progress:', err);
        setSubError(err as Error);
      }
    },
    [currentProfile, currentPoseIndex, holdTime, onGameComplete],
  );

  useGameSessionProgress({
    gameName: 'Yoga Animals',
    score,
    level: currentPoseIndex + 1,
    isPlaying,
  });

  // Initialize Pose Landmarker
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

  // Game loop for pose detection
  const detectPose = useCallback(() => {
    try {
      if (
        !webcamRef.current ||
        !canvasRef.current ||
        !poseLandmarkerRef.current
      )
        return;

      const video = webcamRef.current.video;
      if (!video || video.readyState !== 4) {
        animationRef.current = requestAnimationFrame(detectPose);
        return;
      }
      if (!cameraReady) {
        setCameraReady(true);
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

        // Calculate torso angle
        const torsoAngle =
          calculateAngle(
            leftShoulder,
            {
              x: (leftShoulder.x + rightShoulder.x) / 2,
              y: (leftShoulder.y + rightShoulder.y) / 2,
            },
            leftHip,
          ) - 90;

        // Calculate match score
        let totalScore = 0;
        let targetCount = 0;

        if (currentPose.targets.leftArmAngle !== undefined) {
          const diff = Math.abs(
            leftArmAngle - currentPose.targets.leftArmAngle,
          );
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
          const diff = Math.abs(
            leftLegAngle - currentPose.targets.leftLegAngle,
          );
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

        // Check if pose is matched
        if (matchScore > 70) {
          continuousHoldRef.current += 50;
          if (continuousHoldRef.current >= 10000) {
            triggerEasterEgg('egg-spirit-animal');
            continuousHoldRef.current = 0;
          }
          setHoldTime((prev) => {
            const newTime = prev + 50;
            if (newTime >= HOLD_DURATION && !showCelebration) {
              // Streak and scoring
              const newStreak = streak + 1;
              setStreak(newStreak);
              const basePoints = 100;
              const streakBonus = Math.min(newStreak * 10, 50);
              
              playFanfare();
              triggerHaptic('success');
              setScore((s) => s + basePoints + streakBonus);
              setShowCelebration(true);
              
              // Milestone every 5
              if (newStreak > 0 && newStreak % STREAK_MILESTONE_INTERVAL === 0) {
                setShowStreakMilestone(true);
                triggerHaptic('celebration');
                setTimeout(() => setShowStreakMilestone(false), 1500);
              }
              
              setTimeout(() => {
                setShowCelebration(false);
                setCurrentPoseIndex((i) => (i + 1) % ANIMAL_POSES.length);
                setHoldTime(0);
              }, 2000);
            }
            return newTime;
          });
        } else {
          continuousHoldRef.current = 0;
          setHoldTime(0);
        }

        // Draw skeleton
        drawSkeleton(landmarks);
      }

      animationRef.current = requestAnimationFrame(detectPose);
    } catch (err) {
      console.error('Pose detection failed:', err);
      setError('Pose detection error. Please try again.');
    }
  }, [
    cameraReady,
    currentPose,
    showCelebration,
    triggerEasterEgg,
    playFanfare,
  ]);

  // Draw skeleton overlay
  function drawSkeleton(landmarks: any[]) {
    try {
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

      const keyPoints = [11, 12, 13, 14, 15, 16, 23, 24, 25, 26, 27, 28];
      keyPoints.forEach((i) => {
        const p = landmarks[i];
        ctx.beginPath();
        ctx.arc(p.x * width, p.y * height, 6, 0, 2 * Math.PI);
        ctx.fillStyle = '#10B981';
        ctx.fill();
      });
    } catch (err) {
      console.error('Drawing failed:', err);
    }
  }

  // Start/stop game
  const startGame = useCallback(() => {
    playPop();
    setIsPlaying(true);
    setScore(0);
    setCurrentPoseIndex(0);
    setHoldTime(0);
    setMatchProgress(0);
    setStreak(0);
    setShowStreakMilestone(false);
  }, [playPop]);

  const stopGame = useCallback(async () => {
    playPop();
    await handleGameComplete(score);
    setIsPlaying(false);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  }, [playPop, handleGameComplete, score]);

  // Start detection when playing
  useEffect(() => {
    if (isPlaying) {
      detectPose();
    }
  }, [isPlaying, detectPose]);

  // Render loading state
  if (isLoading) {
    return (
      <div className='min-h-[100dvh] bg-[#FFF8F0] flex items-center justify-center p-4'>
        <motion.div
          className='bg-white rounded-[2.5rem] border-3 border-[#F2CC8F] p-12 text-center max-w-md w-full shadow-[0_4px_0_#E5B86E]'
          initial={reducedMotion ? { opacity: 1 } : { opacity: 0, scale: 0.95 }}
          animate={reducedMotion ? { opacity: 1 } : { opacity: 1, scale: 1 }}
          transition={reducedMotion ? { duration: 0.01 } : { duration: 0.3 }}
        >
          <div className='text-6xl mb-6 flex justify-center'>
            <div className='w-24 h-24 border-3 border-[#3B82F6] border-t-transparent rounded-full animate-spin' />
          </div>
          <h2 className='text-2xl font-black text-advay-slate tracking-tight mb-2'>
            Loading Yoga Animals
          </h2>
          <p className='text-text-secondary font-bold'>
            Getting ready for some animal fun...
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <GlobalErrorBoundary>
      <div className='min-h-[100dvh] bg-[#FFF8F0] p-4 md:p-8 flex flex-col font-sans'>
        {/* Header */}
        <header className='flex justify-between items-center mb-6 max-w-5xl mx-auto w-full relative z-20'>
          <motion.button
            onClick={() => navigate('/dashboard')}
            whileHover={reducedMotion ? {} : { scale: 1.05 }}
            whileTap={reducedMotion ? {} : { scale: 0.95 }}
            className='flex items-center gap-2 px-6 py-3 bg-white hover:bg-slate-50 border-3 border-[#F2CC8F] rounded-[1.5rem] font-bold text-text-secondary transition-colors shadow-[0_4px_0_#E5B86E]'
          >
            <svg
              className='w-5 h-5'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={3}
                d='M10 19l-7-7m0 0l7-7m-7 7h18'
              />
            </svg>
            <span className='hidden sm:inline'>Back</span>
          </motion.button>

          <h1 className='text-3xl md:text-4xl font-black text-advay-slate tracking-tight absolute left-1/2 -translate-x-1/2'>
            Yoga Animals
          </h1>

          <div className='flex items-center gap-3'>
            {streak > 0 && (
              <div className='bg-orange-50 border-3 border-orange-100 px-4 py-2 rounded-[1.5rem] font-bold text-orange-500 text-lg shadow-[0_4px_0_#E5B86E] flex items-center gap-1'>
                <span>🔥</span> <span>{streak}</span>
              </div>
            )}
            <div className='bg-amber-50 border-3 border-amber-100 px-6 py-3 rounded-[1.5rem] font-black text-amber-500 text-xl shadow-[0_4px_0_#E5B86E] flex items-center gap-2'>
              <Sparkles className='w-6 h-6' /> <span>{score}</span>
            </div>
          </div>
        </header>

        <div className='max-w-5xl mx-auto w-full flex-1 flex flex-col'>
          {!isPlaying ? (
            <motion.div
              className='bg-white rounded-[2.5rem] border-3 border-[#F2CC8F] p-8 md:p-16 shadow-[0_4px_0_#E5B86E] flex-1 flex flex-col items-center justify-center text-center'
              initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
              animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
              transition={
                reducedMotion ? { duration: 0.01 } : { duration: 0.3 }
              }
            >
              <div className='flex items-center justify-center gap-4 mb-6'>
                <motion.div
                  animate={reducedMotion ? {} : { scale: [1, 1.1, 1] }}
                  transition={
                    reducedMotion
                      ? { duration: 0.01 }
                      : { duration: 2, repeat: Infinity }
                  }
                >
                  <Bug className='w-20 h-20 text-emerald-500 drop-shadow-[0_4px_0_#E5B86E]' />
                </motion.div>
                <TreeDeciduous className='w-20 h-20 text-emerald-600 drop-shadow-[0_4px_0_#E5B86E]' />
                <Cat className='w-20 h-20 text-amber-500 drop-shadow-[0_4px_0_#E5B86E]' />
              </div>
              <h2 className='text-4xl md:text-5xl font-black text-[#10B981] tracking-tight mb-4'>
                Yoga Animals!
              </h2>
              <p className='text-text-secondary text-xl md:text-2xl font-bold mb-12 max-w-lg'>
                Copy animal poses with your body!
              </p>

              <div className='bg-[#FFF8F0] border-3 border-[#F2CC8F] rounded-[2rem] p-8 mb-12 max-w-2xl w-full text-left'>
                <h3 className='font-black text-advay-slate text-2xl mb-6'>
                  How to Play:
                </h3>
                <ul className='space-y-4 text-advay-slate font-bold text-lg'>
                  <li className='flex items-center gap-3'>
                    <Camera className='w-8 h-8 text-blue-500' /> Stand in front
                    of your camera
                  </li>
                  <li className='flex items-center gap-3'>
                    <Eye className='w-8 h-8 text-purple-500' /> Pip will show
                    you an animal pose
                  </li>
                  <li className='flex items-center gap-3'>
                    <Activity className='w-8 h-8 text-emerald-500' /> Copy the
                    pose and hold it for 2 seconds!
                  </li>
                  <li className='flex items-center gap-3'>
                    <Sparkles className='w-8 h-8 text-amber-500' /> Earn stars
                    for each pose you master
                  </li>
                </ul>
              </div>

              <motion.button
                onClick={startGame}
                whileHover={reducedMotion ? {} : { scale: 1.05 }}
                whileTap={reducedMotion ? {} : { scale: 0.95 }}
                className='w-full max-w-md py-6 bg-[#3B82F6] hover:bg-blue-600 border-3 border-blue-200 hover:border-blue-300 text-white text-2xl font-black rounded-[2rem] shadow-[0_4px_0_#E5B86E] transition-all'
              >
                Start Yoga! <Activity className='w-6 h-6 inline-block ml-1' />
              </motion.button>
            </motion.div>
          ) : (
            <div className='flex flex-col lg:flex-row gap-6 lg:gap-8 flex-1 min-h-0'>
              <motion.div
                className='bg-white rounded-[2.5rem] border-3 border-[#F2CC8F] p-8 shadow-[0_4px_0_#E5B86E] flex flex-col justify-center flex-1 lg:max-w-md'
                key={currentPoseIndex}
                initial={
                  reducedMotion ? { opacity: 1 } : { opacity: 0, x: -20 }
                }
                animate={reducedMotion ? { opacity: 1 } : { opacity: 1, x: 0 }}
                transition={
                  reducedMotion ? { duration: 0.01 } : { duration: 0.3 }
                }
              >
                <div className='text-center mb-10'>
                  <div className='inline-flex items-center justify-center bg-[#FFF8F0] border-3 border-[#F2CC8F] rounded-[2rem] p-6 text-[5rem] mb-6 drop-shadow-[0_4px_0_#E5B86E]'>
                    {currentPose.icon}
                  </div>
                  <h3 className='text-4xl font-black text-advay-slate tracking-tight mb-4'>
                    {currentPose.name}
                  </h3>
                  <p className='text-xl font-bold text-text-secondary mb-8'>
                    {currentPose.description}
                  </p>

                  <div className='bg-blue-50 border-3 border-blue-100 rounded-2xl p-4 inline-block text-left'>
                    <p className='text-lg text-blue-800 font-bold flex items-center gap-2'>
                      <Lightbulb className='w-5 h-5' />{' '}
                      {currentPose.instruction}
                    </p>
                  </div>
                </div>

                <div className='space-y-6 mt-auto'>
                  <div>
                    <div className='flex justify-between font-bold text-text-secondary mb-2 uppercase tracking-wide text-sm'>
                      <span>Pose Match</span>
                      <span
                        className={matchProgress > 70 ? 'text-[#10B981]' : ''}
                      >
                        {Math.round(matchProgress)}%
                      </span>
                    </div>
                    <div className='h-6 bg-slate-100 rounded-full overflow-hidden border-2 border-[#F2CC8F]/50 p-1'>
                      <motion.div
                        className={`h-full rounded-full ${matchProgress > 70 ? 'bg-[#10B981]' : 'bg-[#3B82F6]'}`}
                        initial={
                          reducedMotion
                            ? { width: `${matchProgress}%` }
                            : { width: 0 }
                        }
                        animate={{ width: `${matchProgress}%` }}
                        transition={
                          reducedMotion
                            ? { duration: 0.01 }
                            : { type: 'spring', bounce: 0, duration: 0.3 }
                        }
                      />
                    </div>
                  </div>

                  <div>
                    <div className='flex justify-between font-bold text-text-secondary mb-2 uppercase tracking-wide text-sm'>
                      <span>Hold the pose!</span>
                      <span
                        className={
                          holdTime / HOLD_DURATION >= 1 ? 'text-amber-500' : ''
                        }
                      >
                        {Math.round((holdTime / HOLD_DURATION) * 100)}%
                      </span>
                    </div>
                    <div className='h-6 bg-slate-100 rounded-full overflow-hidden border-2 border-[#F2CC8F]/50 p-1'>
                      <motion.div
                        className='h-full bg-[#F59E0B] rounded-full'
                        animate={{
                          width: `${(holdTime / HOLD_DURATION) * 100}%`,
                        }}
                        transition={
                          reducedMotion
                            ? { duration: 0.01 }
                            : { type: 'tween', duration: 0.1 }
                        }
                      />
                    </div>
                  </div>
                </div>
              </motion.div>

              <div className='flex flex-col gap-6 flex-1 lg:w-2/3'>
                <div className='relative rounded-[2.5rem] overflow-hidden border-3 border-[#F2CC8F] shadow-[0_4px_0_#E5B86E] bg-slate-100 flex-1 min-h-[400px]'>
                  <canvas
                    ref={canvasRef}
                    className='absolute top-0 left-0 w-full h-64 pointer-events-none'
                    width={640}
                    height={360}
                  />

                  <div className='absolute top-6 left-6 px-4 py-2 bg-black/40 backdrop-blur-md rounded-full border border-white/20'>
                    <span className='text-white font-bold text-sm tracking-wide flex items-center gap-1'>
                      {cameraReady ? (
                        <>
                          <CheckCircle2 className='w-4 h-4' /> Camera Ready
                        </>
                      ) : (
                        <>
                          <Loader2 className='w-4 h-4 animate-spin' />{' '}
                          Loading...
                        </>
                      )}
                    </span>
                  </div>

                  <div
                    className={`absolute top-6 right-6 px-6 py-2 backdrop-blur-md rounded-full border-3 shadow-[0_4px_0_#E5B86E] transition-colors ${matchProgress > 70 ? 'bg-[#10B981]/90 border-emerald-400' : 'bg-black/40 border-white/20'}`}
                  >
                    <span
                      className={`text-sm font-black tracking-wide flex items-center gap-1 ${matchProgress > 70 ? 'text-white' : 'text-white'}`}
                    >
                      {matchProgress > 70 ? (
                        <>
                          <Target className='w-4 h-4' /> Perfect Match!
                        </>
                      ) : (
                        `${Math.round(matchProgress)}% Matched`
                      )}
                    </span>
                  </div>
                </div>

                <div className='flex gap-4'>
                  <motion.button
                    onClick={stopGame}
                    whileHover={reducedMotion ? {} : { scale: 1.02 }}
                    whileTap={reducedMotion ? {} : { scale: 0.98 }}
                    className='flex-1 py-4 bg-white hover:bg-slate-50 border-3 border-[#F2CC8F] rounded-[1.5rem] font-black text-text-secondary shadow-[0_4px_0_#E5B86E] transition-all'
                  >
                    Stop Playing
                  </motion.button>
                  <motion.button
                    onClick={() => {
                      playPop();
                      setCurrentPoseIndex((i) => (i + 1) % ANIMAL_POSES.length);
                    }}
                    whileHover={reducedMotion ? {} : { scale: 1.02 }}
                    whileTap={reducedMotion ? {} : { scale: 0.98 }}
                    className='flex-1 py-4 bg-[#F59E0B] hover:bg-amber-500 border-3 border-amber-200 hover:border-amber-300 rounded-[1.5rem] font-black text-white shadow-[0_4px_0_#E5B86E] transition-all'
                  >
                    Skip Pose{' '}
                    <SkipForward className='w-5 h-5 inline-block ml-1' />
                  </motion.button>
                </div>
              </div>
            </div>
          )}

          <AnimatePresence>
            {showCelebration && (
              <motion.div
                className='fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4'
                initial={reducedMotion ? { opacity: 1 } : { opacity: 0 }}
                animate={reducedMotion ? { opacity: 1 } : { opacity: 1 }}
                exit={reducedMotion ? { opacity: 0 } : { opacity: 0 }}
              >
                <motion.div
                  className='bg-white border-3 border-[#F2CC8F] rounded-[3rem] p-12 text-center max-w-md w-full shadow-lg'
                  initial={
                    reducedMotion ? { scale: 1, y: 0 } : { scale: 0.8, y: 20 }
                  }
                  animate={
                    reducedMotion ? { scale: 1, y: 0 } : { scale: 1, y: 0 }
                  }
                  exit={
                    reducedMotion
                      ? { scale: 1, opacity: 0 }
                      : { scale: 0.8, y: 20, opacity: 0 }
                  }
                >
                  <div className='flex justify-center mb-6'>
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      width='96'
                      height='96'
                      viewBox='0 0 24 24'
                      fill='none'
                      stroke='currentColor'
                      strokeWidth='2'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      className='text-amber-500 drop-shadow-[0_4px_0_#E5B86E]'
                    >
                      <path d='M6 9H4.5a2.5 2.5 0 0 1 0-5H6' />
                      <path d='M18 9h1.5a2.5 2.5 0 0 0 0-5H18' />
                      <path d='M4 22h16' />
                      <path d='M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22' />
                      <path d='M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22' />
                      <path d='M18 2H6v7a6 6 0 0 0 12 0V2Z' />
                    </svg>
                  </div>
                  <h2 className='text-4xl font-black text-[#10B981] tracking-tight mb-2'>
                    Amazing!
                  </h2>
                  <p className='text-text-secondary font-bold text-xl mb-6'>
                    You did the {currentPose.name} pose!
                  </p>
                  <div className='inline-block bg-amber-50 border-3 border-amber-100 text-amber-500 text-2xl font-black rounded-full px-8 py-3'>
                    +100 Points
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Wellness timer */}
        <WellnessTimer />
        
        {/* Streak Milestone Overlay */}
        {showStreakMilestone && (
          <div className='fixed inset-0 flex items-center justify-center pointer-events-none z-50'>
            <div className='bg-gradient-to-r from-orange-400 to-red-500 text-white px-8 py-4 rounded-full font-bold text-2xl shadow-lg animate-bounce'>
              🔥 {streak} Streak! 🔥
            </div>
          </div>
        )}
      </div>
    </GlobalErrorBoundary>
  );
});
