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
    <div className='min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-4 md:p-8 font-sans'>
      <header className='flex justify-between items-center mb-8 max-w-5xl mx-auto'>
        <button
          onClick={() => navigate('/games')}
          className='px-6 py-3 bg-white border-4 border-slate-100 rounded-full font-black text-slate-500 hover:scale-105 hover:text-slate-800 transition-all shadow-sm'
        >
          ← Back
        </button>
        <h1 className='text-3xl font-black text-slate-800 tracking-tight'>Freeze Dance</h1>
        <div className='px-6 py-3 bg-white border-4 border-amber-100 rounded-full shadow-sm'>
          <span className='font-bold text-amber-500 tracking-wide'>SCORE: </span>
          <span className='font-black text-amber-500 text-xl'>{score}</span>
        </div>
      </header>

      <div className='max-w-4xl mx-auto'>
        {!isPlaying ? (
          <motion.div
            className='bg-white border-4 border-slate-100 rounded-[2.5rem] p-8 md:p-12 shadow-sm'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className='text-center mb-10'>
              <div className='text-[5rem] mb-6 drop-shadow-sm hover:scale-110 transition-transform'>💃🕺</div>
              <h2 className='text-4xl md:text-5xl font-black text-slate-800 tracking-tight mb-4'>
                Freeze Dance!
              </h2>
              <p className='text-slate-500 font-bold text-xl'>
                Dance when the music plays, <span className='text-blue-500 font-black'>FREEZE</span> when it stops!
              </p>
            </div>

            <div className='bg-slate-50 border-4 border-slate-100 rounded-[2rem] p-8 mb-10'>
              <h3 className='font-black text-slate-700 text-xl mb-6 tracking-tight'>How to Play:</h3>
              <ul className='space-y-4 text-slate-600 font-medium text-lg'>
                <li className='flex items-center gap-4'>
                  <span className='flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold'>1</span>
                  <span>Stand in front of your camera</span>
                </li>
                <li className='flex items-center gap-4'>
                  <span className='flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold'>2</span>
                  <span>Dance and move when you see "DANCE!" 💃</span>
                </li>
                <li className='flex items-center gap-4'>
                  <span className='flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold'>3</span>
                  <span>FREEZE when you see "FREEZE!" ❄️</span>
                </li>
                <li className='flex items-center gap-4'>
                  <span className='flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold'>4</span>
                  <span>Hold still to earn points!</span>
                </li>
                <li className='flex items-center gap-4 bg-purple-50 border-2 border-purple-100 rounded-2xl p-4 mt-6'>
                  <span className='text-purple-500 text-2xl drop-shadow-sm'>🌟</span>
                  <span className='font-bold text-purple-700'>
                    BONUS: After round 3, show the correct number of fingers while frozen!
                  </span>
                </li>
              </ul>
            </div>

            <button
              onClick={startGame}
              className='w-full py-5 bg-[#3B82F6] hover:bg-blue-600 border-4 border-blue-200 hover:border-blue-300 text-white rounded-[1.5rem] font-black text-2xl shadow-sm transition-all hover:scale-[1.02] active:scale-95'
            >
              Start Dancing! 🎵
            </button>
          </motion.div>
        ) : (
          <div className='space-y-6'>
            <motion.div
              className='bg-white border-4 border-slate-100 rounded-[2.5rem] p-8 shadow-sm relative overflow-hidden'
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className='text-center'>
                <div className='text-[5rem] mb-4 drop-shadow-sm'>
                  {gamePhase === 'dancing' ? '💃' : gamePhase === 'freezing' ? '❄️' : '✋'}
                </div>
                <h3
                  className={`text-4xl md:text-5xl font-black mb-3 tracking-tight ${gamePhase === 'dancing' ? 'text-[#3B82F6]' :
                      gamePhase === 'freezing' ? 'text-[#EF4444]' : 'text-purple-500'
                    }`}
                >
                  {gamePhase === 'dancing' ? 'DANCE!' :
                    gamePhase === 'freezing' ? 'FREEZE!' : `SHOW ${targetFingers}!`}
                </h3>
                <p className='text-slate-400 font-bold uppercase tracking-widest'>Round {round}</p>
              </div>

              {gamePhase === 'freezing' && (
                <div className='mt-8 bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] p-6'>
                  <div className='flex justify-between font-bold text-slate-600 mb-3'>
                    <span className='uppercase tracking-wide'>Hold still!</span>
                    <span className='text-slate-800'>{Math.round(stabilityScore)}%</span>
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
                <div className='mt-8 bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] p-6 space-y-5'>
                  <div className='flex justify-between font-bold text-slate-600 mb-2'>
                    <span className='uppercase tracking-wide'>Your fingers:</span>
                    <span className={`text-xl ${detectedFingers === targetFingers ? 'text-[#10B981]' : 'text-[#F59E0B]'}`}>
                      {detectedFingers} / {targetFingers}
                    </span>
                  </div>
                  <div className='h-6 bg-slate-200 rounded-full overflow-hidden shadow-inner'>
                    <motion.div
                      className={`h-full ${detectedFingers === targetFingers ? 'bg-[#10B981]' : 'bg-[#F59E0B]'}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min((detectedFingers / targetFingers) * 100, 100)}%` }}
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

            <div className='relative rounded-[2.5rem] overflow-hidden bg-slate-100 border-4 border-slate-200 shadow-sm'>
              <Webcam
                ref={webcamRef}
                onLoadedData={handleVideoLoad}
                className='w-full h-[400px] object-cover'
                mirrored
              />
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

              <div className='absolute top-6 left-6 px-4 py-2 bg-white/90 backdrop-blur-sm rounded-full border-2 border-slate-200 shadow-sm'>
                <span className='text-slate-600 font-bold whitespace-nowrap'>
                  {cameraReady ? '📹 Camera Ready' : '⏳ Loading...'}
                  {isHandReady && ' ✋'}
                </span>
              </div>

              <div className='absolute top-6 right-6 px-5 py-2 bg-white/90 backdrop-blur-sm rounded-full border-2 border-slate-200 shadow-sm'>
                <span
                  className={`font-black tracking-wide ${gamePhase === 'dancing' ? 'text-[#10B981]' :
                      gamePhase === 'freezing' ? 'text-[#EF4444]' : 'text-purple-500'
                    }`}
                >
                  {gamePhase === 'dancing' ? '💃 DANCE' :
                    gamePhase === 'freezing' ? '❄️ FROZEN' : '✋ FINGERS'}
                </span>
              </div>
            </div>

            <div className='flex justify-center pt-2'>
              <button
                onClick={stopGame}
                className='px-12 py-4 bg-white border-4 border-slate-200 rounded-[1.5rem] font-bold text-slate-500 hover:text-slate-800 hover:scale-105 transition-all shadow-sm'
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
                className='bg-white rounded-[3rem] p-12 text-center shadow-sm border-4 border-slate-100 max-w-md w-[90%]'
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
              >
                <div className='text-[6rem] mb-6 drop-shadow-sm hover:scale-110 transition-transform'>🎉</div>
                <h2 className='text-3xl md:text-4xl font-black text-slate-800 tracking-tight mb-4'>
                  {fingerChallengeComplete ? 'Perfect Freeze + Fingers!' : 'Amazing Freeze!'}
                </h2>
                <p className='text-slate-500 font-bold text-xl'>
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
