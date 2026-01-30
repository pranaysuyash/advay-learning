import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Webcam from 'react-webcam';
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';

interface Point {
  x: number;
  y: number;
}

interface DifficultyLevel {
  name: string;
  minNumber: number;
  maxNumber: number;
  rewardMultiplier: number;
}

interface Landmark extends Point {
  z?: number;
}

interface HandLandmarkerResult {
  landmarks: Landmark[][];
}

export function FingerNumberShow() {
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [handLandmarker, setHandLandmarker] = useState<HandLandmarker | null>(null);
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [currentCount, setCurrentCount] = useState<number>(0);
  const [targetNumber, setTargetNumber] = useState<number>(0);
  const [feedback, setFeedback] = useState<string>('');
  const [difficulty, setDifficulty] = useState<number>(0);
  const [showCelebration, setShowCelebration] = useState(false);

  const difficultyLevels: DifficultyLevel[] = [
    { name: 'Level 1', minNumber: 0, maxNumber: 2, rewardMultiplier: 1.2 },
    { name: 'Level 2', minNumber: 0, maxNumber: 5, rewardMultiplier: 1.0 },
    { name: 'Level 3', minNumber: 0, maxNumber: 10, rewardMultiplier: 0.8 },
  ];

  const lastVideoTimeRef = useRef<number>(-1);
  const frameSkipRef = useRef<number>(0);

  useEffect(() => {
    const initializeHandLandmarker = async () => {
      setIsModelLoading(true);
      try {
        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.8/wasm'
        );
        const landmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
            delegate: 'GPU',
          },
          runningMode: 'VIDEO',
          numHands: 2,
        });
        setHandLandmarker(landmarker);
      } catch (error) {
        console.error('Failed to load hand landmarker:', error);
        setFeedback('Camera tracking not available. Try again later!');
      }
      setIsModelLoading(false);
    };

    initializeHandLandmarker();
  }, []);

  useEffect(() => {
    if (!isPlaying) return;

    const pickTargetNumber = () => {
      const level = difficultyLevels[difficulty];
      const { minNumber, maxNumber } = level;
      const range = maxNumber - minNumber + 1;
      const newTarget = Math.floor(Math.random() * range) + minNumber;
      setTargetNumber(newTarget);
      const names = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten'];
      setFeedback(`Show me ${names[newTarget]} fingers! 🤚`);
    };

    pickTargetNumber();
  }, [isPlaying, difficulty]);

  const countExtendedFingers = useCallback((landmarks: Point[]): number => {
    const fingerPairs = [
      { tip: 8, pip: 6 },
      { tip: 12, pip: 10 },
      { tip: 16, pip: 14 },
      { tip: 20, pip: 18 },
    ];

    let count = 0;
    fingerPairs.forEach(pair => {
      const tip = landmarks[pair.tip];
      const pip = landmarks[pair.pip];
      if (tip.y < pip.y) {
        count++;
      }
    });

    return count;
  }, []);

  const detectAndDraw = useCallback(() => { // eslint-disable-line react-hooks/exhaustive-deps
    if (!webcamRef.current || !canvasRef.current || !handLandmarker || !isPlaying) return;

    const video = webcamRef.current.video;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!video || !ctx) return;

    if (video.readyState < 2 || video.videoWidth === 0 || video.videoHeight === 0) {
      requestAnimationFrame(detectAndDraw);
      return;
    }

    if (canvas.width !== video.videoWidth) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
    }

    if (video.currentTime === lastVideoTimeRef.current) {
      requestAnimationFrame(detectAndDraw);
      return;
    }
    lastVideoTimeRef.current = video.currentTime;

    frameSkipRef.current++;
    if (frameSkipRef.current % 2 !== 0) {
      requestAnimationFrame(detectAndDraw);
      return;
    }

    let results: HandLandmarkerResult | null = null;
    try {
      results = handLandmarker.detectForVideo(video, performance.now());
    } catch (e) {
      requestAnimationFrame(detectAndDraw);
      return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let totalFingers = 0;

    if (results && results.landmarks && results.landmarks.length > 0) {
      results.landmarks.forEach((landmarks: Landmark[], handIndex: number) => {
        const fingerCount = countExtendedFingers(landmarks);
        totalFingers += fingerCount;

        const wrist = landmarks[0];
        const wristX = (1 - wrist.x) * canvas.width;
        const wristY = wrist.y * canvas.height;

        ctx.beginPath();
        ctx.arc(wristX, wristY, 10, 0, 2 * Math.PI);
        ctx.fillStyle = handIndex === 0 ? '#4ade80' : '#60a5fa';
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 24px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(fingerCount.toString(), wristX, wristY);
      });
    }

    setCurrentCount(totalFingers);

    if (totalFingers === targetNumber && targetNumber > 0 && !showCelebration) {
      setShowCelebration(true);
      const level = difficultyLevels[difficulty];
      const points = Math.round(10 * level.rewardMultiplier);
      setScore(prev => prev + points);
      setStreak(prev => prev + 1);
      const names = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten'];
      setFeedback(`Great! ${names[totalFingers]} fingers! 🎉 +${points} points`);

      setTimeout(() => {
        setShowCelebration(false);
        const { minNumber, maxNumber } = level;
        const range = maxNumber - minNumber + 1;
        const newTarget = Math.floor(Math.random() * range) + minNumber;
        setTargetNumber(newTarget);
        setFeedback(`Show me ${names[newTarget]} fingers! 🤚`);
      }, 2000);
    }

    requestAnimationFrame(detectAndDraw);
  }, [handLandmarker, isPlaying, targetNumber, countExtendedFingers, showCelebration, difficulty]);

  useEffect(() => {
    if (isPlaying) {
      requestAnimationFrame(detectAndDraw);
    }
    return () => {
      // Cleanup
    };
  }, [isPlaying, detectAndDraw]);

  const startGame = () => {
    setIsPlaying(true);
    setScore(0);
    setStreak(0);
    setCurrentCount(0);
    setFeedback('');
  };

  const stopGame = () => {
    setIsPlaying(false);
    setFeedback('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Finger Number Show</h1>
            <p className="text-white/60">Show numbers with your fingers!</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">Score: {score}</div>
            <div className="flex items-center gap-4 text-sm text-white/60">
              <span>🔥 Streak: {streak}</span>
              <span>{difficultyLevels[difficulty].name}</span>
            </div>
          </div>
        </div>

        {/* Difficulty Selection */}
        {!isPlaying && (
          <div className="bg-white/10 border border-border rounded-xl p-6 mb-6 shadow-sm">
            <div className="text-sm font-medium text-white/80 mb-2">
              Choose Difficulty
            </div>
            <div className="flex gap-2">
              {difficultyLevels.map((level) => (
                <button
                  key={level.name}
                  type="button"
                  onClick={() => setDifficulty(difficultyLevels.indexOf(level))}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    difficulty === difficultyLevels.indexOf(level)
                      ? 'bg-red-500 text-white shadow-lg shadow-red-500/30'
                      : 'bg-white/10 text-white/80 hover:bg-white/20'
                  }`}
                >
                  {level.name} ({level.minNumber}-{level.maxNumber})
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Target Number Display */}
        {isPlaying && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl p-8 mb-6 text-center"
          >
            <div className="text-white/70 mb-2 text-lg">Show me</div>
            <div className="text-9xl font-bold text-white mb-2">
              {targetNumber}
            </div>
            <div className="text-3xl text-white/80">{['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten'][targetNumber]}</div>
            <div className="text-white/60 mt-4 text-lg">fingers! 🤚</div>
          </motion.div>
        )}

        {/* Current Count Display */}
        {isPlaying && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-white/10 border border-border rounded-xl p-6 mb-6 text-center shadow-sm ${
              currentCount === targetNumber && targetNumber > 0
                ? 'border-green-500/50 bg-green-500/10'
                : 'border-white/10'
            }`}
          >
            <div className="text-white/70 mb-2">You're showing</div>
            <div className={`text-8xl font-bold mb-2 ${
              currentCount === targetNumber && targetNumber > 0
                ? 'text-green-400'
                : 'text-white'
            }`}>
              {currentCount}
            </div>
            <div className="text-2xl text-white/80">{['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten'][currentCount]}</div>
            <div className="text-white/60 mt-2">fingers</div>
          </motion.div>
        )}

        {/* Feedback */}
        <AnimatePresence>
          {feedback && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={`rounded-xl p-4 mb-6 text-center font-semibold ${
                feedback.includes('Great') || feedback.includes('Amazing')
                  ? 'bg-green-500/20 border border-green-500/30 text-green-400'
                  : 'bg-white/10 border border-border text-white/80' 
              }`}
            >
              {feedback}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Game Area */}
        <div className="relative">
          {!isPlaying ? (
            <div className="bg-white/10 border border-border rounded-xl p-12 text-center shadow-sm">
              <div className="text-6xl mb-4">🤚</div>
              <h2 className="text-2xl font-semibold mb-4">Ready to Count?</h2>
              <p className="text-white/70 mb-8 max-w-md mx-auto">
                Hold up your fingers to show numbers! The camera will count how many fingers you're showing.
              </p>
              <div className="flex justify-center gap-4">
                <button
                  type="button"
                  onClick={() => window.history.back()}
                  className="px-6 py-3 bg-orange-500 hover:bg-orange-600 rounded-lg font-semibold transition shadow-lg"
                >
                  🏠 Back
                </button>
                {isModelLoading ? (
                  <div className="text-white/60 px-6 py-3">Loading hand tracking...</div>
                ) : (
                  <button
                    type="button"
                    onClick={startGame}
                    className="px-8 py-3 bg-gradient-to-r from-red-500 to-red-600 rounded-lg font-semibold hover:shadow-lg hover:shadow-red-500/30 transition shadow-red-900/20"
                  >
                    Start Game
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative bg-black rounded-xl overflow-hidden aspect-video shadow-2xl border-4 border-purple-400/30">
                <Webcam
                  ref={webcamRef}
                  className="absolute inset-0 w-full h-full object-cover"
                  mirrored
                  videoConstraints={{ width: 640, height: 480 }}
                />
                <canvas
                  ref={canvasRef}
                  className="absolute inset-0 w-full h-full"
                />

                {/* Controls overlay */}
                <div className="absolute top-4 left-4 flex gap-2">
                  <div className="bg-black/50 backdrop-blur px-3 py-1 rounded-full text-sm font-bold border border-border">
                    🎯 Show: {targetNumber}
                  </div>
                  <div className="bg-purple-500/50 backdrop-blur px-3 py-1 rounded-full text-sm font-bold border border-border">
                    {difficultyLevels[difficulty].name}
                  </div>
                  {streak > 2 && (
                    <div className="bg-orange-500/90 text-white backdrop-blur px-3 py-1 rounded-full text-sm font-bold animate-pulse shadow-lg shadow-orange-500/20">
                      🔥 {streak} streak!
                    </div>
                  )}
                </div>

                <div className="absolute top-4 right-4 flex gap-2">
                  <button
                    type="button"
                    onClick={() => window.history.back()}
                    className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white border-b-4 border-orange-700 active:border-b-0 active:translate-y-1 rounded-lg transition text-sm font-semibold shadow-lg"
                  >
                    🏠 Back
                  </button>
                  <button
                    type="button"
                    onClick={stopGame}
                    className="px-4 py-2 bg-red-500/20 border border-red-500/30 text-red-400 rounded-lg hover:bg-red-500/30 transition text-sm font-semibold backdrop-blur"
                  >
                    Stop
                  </button>
                </div>
              </div>

              <p className="text-center text-white/60 text-sm font-medium">
                Hold up your fingers to show numbers! Use both hands for numbers greater than 5.
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
