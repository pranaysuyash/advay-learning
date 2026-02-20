import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Webcam from 'react-webcam';
import { motion, AnimatePresence } from 'framer-motion';
import { FilesetResolver, PoseLandmarker } from '@mediapipe/tasks-vision';
import { useHandTracking } from '../hooks/useHandTracking';
import { countExtendedFingersFromLandmarks } from '../games/fingerCounting';
import { useSoundEffects } from '../hooks/useSoundEffects';
import { useTTS } from '../hooks/useTTS';

export function FreezeDance() {
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
  const [isFrozen, setIsFrozen] = useState(false);
  const [gamePhase, setGamePhase] = useState<'dancing' | 'freezing' | 'fingerChallenge'>('dancing');
  const [round, setRound] = useState(1);
  const [stabilityScore, setStabilityScore] = useState(0);
  
  // Combined CV: Hand tracking state
  const [targetFingers, setTargetFingers] = useState(0);
  const [detectedFingers, setDetectedFingers] = useState(0);
  const [fingerChallengeComplete, setFingerChallengeComplete] = useState(false);
  const [showHandOverlay, setShowHandOverlay] = useState(false);

  const lastPoseRef = useRef<any>(null);
  const stabilityRef = useRef(0);
  const handCanvasRef = useRef<HTMLCanvasElement>(null);
  
  // Hand tracking hook
  const {
    landmarker: handLandmarker,
    isLoading: isHandLoading,
    isReady: isHandReady,
  } = useHandTracking({
    numHands: 1,
    minDetectionConfidence: 0.3,
    minHandPresenceConfidence: 0.3,
    minTrackingConfidence: 0.3,
    delegate: 'GPU',
    enableFallback: true,
  });
  
  const { playSuccess, playCelebration } = useSoundEffects();
  const { speak, isEnabled: ttsEnabled } = useTTS();

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

    const danceDuration = 8000 + Math.random() * 4000;
    const freezeDuration = 3000;
    const fingerChallengeDuration = 5000;

    setGamePhase('dancing');
    setIsFrozen(false);
    setShowHandOverlay(false);
    setFingerChallengeComplete(false);

    const danceTimer = setTimeout(() => {
      // FREEZE phase - pose only
      setGamePhase('freezing');
      setIsFrozen(true);
      stabilityRef.current = 100;
      setStabilityScore(100);

      const freezeTimer = setTimeout(() => {
        const roundScore = Math.round(stabilityRef.current);
        
        // If stability is good (>60%), add finger challenge
        if (roundScore > 60 && round > 2) {
          // FINGER CHALLENGE phase - combined CV!
          const target = Math.floor(Math.random() * 6); // 0-5 fingers
          setTargetFingers(target);
          setDetectedFingers(0);
          setGamePhase('fingerChallenge');
          setShowHandOverlay(true);
          
          if (ttsEnabled) {
            const targetText = target === 0 ? 'fist' : `${target} finger${target !== 1 ? 's' : ''}`;
            void speak(`Freeze! Show ${targetText}!`);
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
    
    if (success) {
      setScore((s) => s + roundScore);
      if (roundScore > 50) {
        void playCelebration();
        setShowCelebration(true);
        setTimeout(() => setShowCelebration(false), 1500);
      }
    }
    
    setRound((r) => r + 1);
  };

  useEffect(() => {
    if (isPlaying && cameraReady) {
      detectPose();
    }
  }, [isPlaying, cameraReady, detectPose]);
  
  // Hand detection during finger challenge
  const detectHands = useCallback(() => {
    if (
      !webcamRef.current ||
      !handCanvasRef.current ||
      !handLandmarker ||
      !cameraReady ||
      gamePhase !== 'fingerChallenge'
    )
      return;

    const video = webcamRef.current.video;
    if (!video || video.readyState !== 4) {
      requestAnimationFrame(detectHands);
      return;
    }

    const results = handLandmarker.detectForVideo(video, performance.now());
    const canvas = handCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (results.landmarks && results.landmarks.length > 0) {
      const landmarks = results.landmarks[0];
      const fingerCount = countExtendedFingersFromLandmarks(
        landmarks.map((l: { x: number; y: number; z?: number }) => ({ x: l.x, y: l.y, z: l.z }))
      );
      setDetectedFingers(fingerCount);
      
      // Check if challenge is complete
      if (fingerCount === targetFingers && !fingerChallengeComplete) {
        setFingerChallengeComplete(true);
        void playSuccess();
      }

      // Draw hand landmarks
      landmarks.forEach((lm: { x: number; y: number }) => {
        ctx.beginPath();
        ctx.arc(lm.x * canvas.width, lm.y * canvas.height, 4, 0, 2 * Math.PI);
        ctx.fillStyle = fingerCount === targetFingers ? '#10B981' : '#F59E0B';
        ctx.fill();
      });
    }

    requestAnimationFrame(detectHands);
  }, [cameraReady, gamePhase, handLandmarker, targetFingers, fingerChallengeComplete, playSuccess]);

  useEffect(() => {
    if (gamePhase === 'fingerChallenge' && cameraReady && isHandReady) {
      detectHands();
    }
  }, [gamePhase, cameraReady, isHandReady, detectHands]);

  const startGame = () => {
    setIsPlaying(true);
    setScore(0);
    setRound(1);
  };

  const stopGame = () => {
    setIsPlaying(false);
    setGamePhase('dancing');
    setIsFrozen(false);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  };

  const handleVideoLoad = () => {
    setCameraReady(true);
  };

  if (isLoading || isHandLoading) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center'>
        <motion.div
          className='text-center'
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className='text-6xl mb-4'>💃</div>
          <h2 className='text-2xl font-bold text-blue-700 mb-2'>
            Loading Freeze Dance...
          </h2>
          <p className='text-blue-500'>
            {isLoading ? 'Loading pose tracking...' : 'Loading hand tracking...'}
          </p>
          <p className='text-purple-500 text-sm mt-2'>✨ Now with finger challenges!</p>
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
            className='px-6 py-3 bg-purple-500 text-white rounded-full font-bold hover:bg-purple-600 transition'
          >
            Back to Games
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 p-4'>
      <header className='flex justify-between items-center mb-4'>
        <button
          onClick={() => navigate('/games')}
          className='px-4 py-2 bg-white/80 backdrop-blur rounded-full font-bold text-blue-700 hover:bg-white transition'
        >
          ← Back
        </button>
        <h1 className='text-2xl font-bold text-blue-800'>Freeze Dance</h1>
        <div className='px-4 py-2 bg-yellow-400 rounded-full font-bold text-blue-800'>
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
              <div className='text-8xl mb-4'>💃🕺</div>
              <h2 className='text-3xl font-bold text-blue-800 mb-2'>
                Freeze Dance!
              </h2>
              <p className='text-blue-600 text-lg'>
                Dance when the music plays, FREEZE when it stops!
              </p>
            </div>

            <div className='bg-blue-50 rounded-2xl p-6 mb-8'>
              <h3 className='font-bold text-blue-800 mb-4'>How to Play:</h3>
              <ul className='space-y-2 text-blue-700'>
                <li className='flex items-start gap-2'>
                  <span className='text-blue-500'>1.</span>
                  Stand in front of your camera
                </li>
                <li className='flex items-start gap-2'>
                  <span className='text-blue-500'>2.</span>
                  Dance and move when you see "DANCE!" 💃
                </li>
                <li className='flex items-start gap-2'>
                  <span className='text-blue-500'>3.</span>
                  FREEZE when you see "FREEZE!" ❄️
                </li>
                <li className='flex items-start gap-2'>
                  <span className='text-blue-500'>4.</span>
                  Hold still to earn points!
                </li>
                <li className='flex items-start gap-2 bg-purple-100 rounded-lg p-2 -mx-2'>
                  <span className='text-purple-500'>🌟</span>
                  <span className='font-semibold text-purple-700'>
                    BONUS: After round 3, show the correct number of fingers while frozen!
                  </span>
                </li>
              </ul>
            </div>

            <button
              onClick={startGame}
              className='w-full py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xl font-bold rounded-2xl hover:from-blue-600 hover:to-purple-600 transition transform hover:scale-105'
            >
              Start Dancing! 🎵
            </button>
          </motion.div>
        ) : (
          <div className='space-y-4'>
            <motion.div
              className='bg-white rounded-3xl p-6 shadow-lg'
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className='text-center'>
                <div className='text-5xl mb-4'>
                  {gamePhase === 'dancing' ? '💃' : gamePhase === 'freezing' ? '❄️' : '✋'}
                </div>
                <h3
                  className={`text-3xl font-bold mb-2 ${
                    gamePhase === 'dancing' ? 'text-blue-600' : 
                    gamePhase === 'freezing' ? 'text-red-500' : 'text-purple-600'
                  }`}
                >
                  {gamePhase === 'dancing' ? 'DANCE!' : 
                   gamePhase === 'freezing' ? 'FREEZE!' : `SHOW ${targetFingers}!`}
                </h3>
                <p className='text-gray-600'>Round {round}</p>
              </div>

              {gamePhase === 'freezing' && (
                <div className='mt-6'>
                  <div className='flex justify-between text-sm text-gray-600 mb-1'>
                    <span>Hold still!</span>
                    <span>{Math.round(stabilityScore)}%</span>
                  </div>
                  <div className='h-4 bg-gray-100 rounded-full overflow-hidden'>
                    <motion.div
                      className='h-full bg-gradient-to-r from-green-400 to-red-400'
                      initial={{ width: 0 }}
                      animate={{ width: `${stabilityScore}%` }}
                    />
                  </div>
                </div>
              )}
              
              {gamePhase === 'fingerChallenge' && (
                <div className='mt-6 space-y-4'>
                  <div className='flex justify-between text-sm text-gray-600 mb-1'>
                    <span>Your fingers:</span>
                    <span className={`font-bold ${detectedFingers === targetFingers ? 'text-green-500' : 'text-orange-500'}`}>
                      {detectedFingers} / {targetFingers}
                    </span>
                  </div>
                  <div className='h-4 bg-gray-100 rounded-full overflow-hidden'>
                    <motion.div
                      className={`h-full ${detectedFingers === targetFingers ? 'bg-green-400' : 'bg-orange-400'}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min((detectedFingers / targetFingers) * 100, 100)}%` }}
                    />
                  </div>
                  {detectedFingers === targetFingers && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className='text-center text-green-500 font-bold'
                    >
                      ✓ Perfect! Hold it!
                    </motion.div>
                  )}
                </div>
              )}
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
                className='absolute top-0 left-0 w-full h-64 pointer-events-none'
                width={640}
                height={360}
              />
              {/* Hand tracking overlay for finger challenge */}
              <canvas
                ref={handCanvasRef}
                className={`absolute top-0 left-0 w-full h-64 pointer-events-none transition-opacity duration-300 ${showHandOverlay ? 'opacity-100' : 'opacity-0'}`}
                width={640}
                height={360}
              />

              <div className='absolute top-4 left-4 px-3 py-1 bg-black/50 backdrop-blur rounded-full'>
                <span className='text-white text-sm'>
                  {cameraReady ? '📹 Camera Ready' : '⏳ Loading...'}
                  {isHandReady && ' ✋'}
                </span>
              </div>

              <div className='absolute top-4 right-4 px-3 py-1 bg-black/50 backdrop-blur rounded-full'>
                <span
                  className={`text-sm font-bold ${
                    gamePhase === 'dancing' ? 'text-green-400' : 
                    gamePhase === 'freezing' ? 'text-red-400' : 'text-purple-400'
                  }`}
                >
                  {gamePhase === 'dancing' ? '💃 DANCE' : 
                   gamePhase === 'freezing' ? '❄️ FROZEN' : '✋ FINGERS'}
                </span>
              </div>
            </div>

            <div className='flex gap-4'>
              <button
                onClick={stopGame}
                className='flex-1 py-3 bg-white rounded-xl font-bold text-blue-700 hover:bg-blue-50 transition'
              >
                Stop Game
              </button>
            </div>
          </div>
        )}

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
                <h2 className='text-3xl font-bold text-blue-800 mb-2'>
                  {fingerChallengeComplete ? 'Perfect Freeze + Fingers!' : 'Amazing Freeze!'}
                </h2>
                <p className='text-blue-600 text-lg mb-4'>
                  {fingerChallengeComplete 
                    ? 'You froze AND showed the right fingers! 🌟' 
                    : 'Perfect stillness!'}
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default FreezeDance;
