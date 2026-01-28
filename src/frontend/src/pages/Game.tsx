import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import Webcam from 'react-webcam';
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';
import { getLettersForGame, Letter } from '../data/alphabets';
import { useSettingsStore, useAuthStore, useProgressStore, BATCH_SIZE } from '../store';
// import { progressApi } from '../services/api'; // TODO: Enable when profile ID available

interface Point {
  x: number;
  y: number;
}

interface GameStats {
  accuracy: number;
  timeSpent: number;
  streak: number;
}

export function Game() {
  const settings = useSettingsStore();
  const { user } = useAuthStore();
  const { markLetterAttempt, getUnlockedBatches, addBadge } = useProgressStore();
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [currentLetterIndex, setCurrentLetterIndex] = useState(0);
  const [handLandmarker, setHandLandmarker] = useState<HandLandmarker | null>(null);
  const [isModelLoading, setIsModelLoading] = useState(false);
  const drawnPointsRef = useRef<Point[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isPinching, setIsPinching] = useState(false);
  const [feedback, setFeedback] = useState<string>('');
  const [accuracy, setAccuracy] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [startTime, setStartTime] = useState<number>(0);
  const [, setSessionStats] = useState<GameStats>({ accuracy: 0, timeSpent: 0, streak: 0 });
  const animationRef = useRef<number>();
  const lastVideoTimeRef = useRef<number>(-1);
  const frameSkipRef = useRef<number>(0);
  
  // Get letters based on selected language and difficulty
  const LETTERS: Letter[] = getLettersForGame(settings.language, settings.difficulty);
  const currentLetter = LETTERS[currentLetterIndex];

  // Initialize hand landmarker
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
          numHands: 1,
        });
        setHandLandmarker(landmarker);
      } catch (error) {
        console.error('Failed to load hand landmarker:', error);
        setFeedback('Camera tracking not available. Try drawing with mouse!');
      }
      setIsModelLoading(false);
    };

    initializeHandLandmarker();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // Smooth points using moving average
  const smoothPoints = useCallback((points: Point[]): Point[] => {
    if (points.length < 3) return points;
    
    const smoothed: Point[] = [];
    const windowSize = 3; // Average over 3 points
    
    for (let i = 0; i < points.length; i++) {
      let sumX = 0, sumY = 0, count = 0;
      
      // Average over window centered at current point
      for (let j = -Math.floor(windowSize / 2); j <= Math.floor(windowSize / 2); j++) {
        const idx = i + j;
        if (idx >= 0 && idx < points.length) {
          sumX += points[idx].x;
          sumY += points[idx].y;
          count++;
        }
      }
      
      smoothed.push({
        x: sumX / count,
        y: sumY / count
      });
    }
    
    return smoothed;
  }, []);

  // Calculate tracing accuracy
  const calculateAccuracy = useCallback((points: Point[]): number => {
    if (points.length < 10) return 0;
    
    const canvas = canvasRef.current;
    if (!canvas) return 0;
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const letterRadius = Math.min(canvas.width, canvas.height) * 0.25;
    
    // Check how many points are within the letter area
    const pointsInArea = points.filter(point => {
      const px = point.x * canvas.width;
      const py = point.y * canvas.height;
      const distance = Math.sqrt(Math.pow(px - centerX, 2) + Math.pow(py - centerY, 2));
      return distance < letterRadius;
    });
    
    // Calculate coverage (how much of the letter area was traced)
    const coverage = pointsInArea.length / points.length;
    
    // Calculate density (points per area)
    const density = Math.min(points.length / 100, 1);
    
    // Combined score (0-100)
    const accuracy = Math.round((coverage * 0.6 + density * 0.4) * 100);
    
    return Math.min(accuracy, 100);
  }, []);

  // Save progress to backend
  const saveProgress = useCallback(async (letterAccuracy: number) => {
    if (!user) return;
    
    const timeSpent = Math.round((Date.now() - startTime) / 1000);
    
    try {
      // Note: This would need a profile ID in production
      // For now, we'll just log it
      console.log('Saving progress:', {
        letter: currentLetter.char,
        language: settings.language,
        accuracy: letterAccuracy,
        timeSpent,
        score: score + (letterAccuracy > 70 ? 10 : 5),
      });
      
      // Update session stats
      setSessionStats(prev => ({
        accuracy: Math.round((prev.accuracy * prev.streak + letterAccuracy) / (prev.streak + 1)),
        timeSpent: prev.timeSpent + timeSpent,
        streak: prev.streak + 1,
      }));
    } catch (error) {
      console.error('Failed to save progress:', error);
    }
  }, [user, currentLetter, settings.language, score, startTime]);

  // Drawing loop
  const detectAndDraw = useCallback(() => {
    if (!webcamRef.current || !canvasRef.current || !handLandmarker || !isPlaying) return;

    const video = webcamRef.current.video;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!video || !ctx) return;

    // Wait for video to be ready with valid dimensions
    if (video.readyState < 2 || video.videoWidth === 0 || video.videoHeight === 0) {
      animationRef.current = requestAnimationFrame(detectAndDraw);
      return;
    }

    // Match canvas size to video
    if (canvas.width !== video.videoWidth) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
    }

    // Only process if video frame has changed
    if (video.currentTime === lastVideoTimeRef.current) {
      animationRef.current = requestAnimationFrame(detectAndDraw);
      return;
    }
    lastVideoTimeRef.current = video.currentTime;
    
    // Skip frames to reduce lag (process every 2nd frame = 30fps instead of 60fps)
    frameSkipRef.current++;
    if (frameSkipRef.current % 2 !== 0) {
      animationRef.current = requestAnimationFrame(detectAndDraw);
      return;
    }

    // Detect hand
    let results;
    try {
      results = handLandmarker.detectForVideo(video, performance.now());
    } catch (e) {
      // MediaPipe error, skip this frame
      animationRef.current = requestAnimationFrame(detectAndDraw);
      return;
    }

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw hint outline if enabled (drawn normally - not mirrored)
    if (settings.showHints) {
      ctx.font = `bold ${Math.min(canvas.width, canvas.height) * 0.6}px sans-serif`;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(currentLetter.char, canvas.width / 2, canvas.height / 2);
      
      // Draw tracing guide circle
      ctx.beginPath();
      ctx.arc(canvas.width / 2, canvas.height / 2, Math.min(canvas.width, canvas.height) * 0.25, 0, 2 * Math.PI);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Draw drawn points (with smoothing)
    if (drawnPointsRef.current.length > 0) {
      // Apply smoothing for better visual quality
      const pointsToDraw = drawnPointsRef.current.length > 3 
        ? smoothPoints(drawnPointsRef.current)
        : drawnPointsRef.current;
      
      ctx.beginPath();
      ctx.strokeStyle = currentLetter.color;
      ctx.lineWidth = 12;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.shadowColor = currentLetter.color;
      ctx.shadowBlur = 10;
      
      pointsToDraw.forEach((point, index) => {
        if (index === 0) {
          ctx.moveTo(point.x * canvas.width, point.y * canvas.height);
        } else {
          ctx.lineTo(point.x * canvas.width, point.y * canvas.height);
        }
      });
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    // Draw hand tracking point (index finger tip = landmark 8)
    if (results.landmarks && results.landmarks.length > 0) {
      const landmarks = results.landmarks[0];
      const indexTip = landmarks[8];
      const thumbTip = landmarks[4];
      
      // Pinch detection: thumb (4) and index (8) distance
      const pinchDistance = Math.sqrt(
        Math.pow(thumbTip.x - indexTip.x, 2) +
        Math.pow(thumbTip.y - indexTip.y, 2)
      );
      
      // Hysteresis: start pinch < 0.05, release pinch > 0.08
      const PINCH_START_THRESHOLD = 0.05;
      const PINCH_RELEASE_THRESHOLD = 0.08;
      
      if (!isPinching && pinchDistance < PINCH_START_THRESHOLD) {
        setIsPinching(true);
        setIsDrawing(true);
      } else if (isPinching && pinchDistance > PINCH_RELEASE_THRESHOLD) {
        setIsPinching(false);
        setIsDrawing(false);
      }
      
      // IMPORTANT: MediaPipe x coordinates are normalized [0,1] where 0 is left, 1 is right
      // Since the webcam is mirrored with CSS, we need to mirror the x coordinate
      // so the cursor appears where the user expects it
      const displayX = 1 - indexTip.x;
      const displayY = indexTip.y;
      
      // Draw cursor with glow (larger and brighter when pinching)
      ctx.beginPath();
      const cursorRadius = isPinching ? 15 : 12;
      const cursorGlow = isPinching ? 25 : 15;
      ctx.arc(displayX * canvas.width, displayY * canvas.height, cursorRadius, 0, 2 * Math.PI);
      ctx.fillStyle = isPinching ? '#ffff00' : currentLetter.color;
      ctx.shadowColor = isPinching ? '#ffff00' : currentLetter.color;
      ctx.shadowBlur = cursorGlow;
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Add point to drawing only when in drawing mode
      // This allows cursor to be visible without recording
      if (isDrawing) {
        const nextPoints = drawnPointsRef.current;
        nextPoints.push({ x: displayX, y: displayY });
        // Prevent unbounded growth if a session runs for a long time
        if (nextPoints.length > 5000) nextPoints.shift();
      }
    }

    animationRef.current = requestAnimationFrame(detectAndDraw);
  }, [handLandmarker, isPlaying, isDrawing, isPinching, currentLetter, settings.showHints, smoothPoints]);

  // Start detection loop when playing
  useEffect(() => {
    if (isPlaying) {
      animationRef.current = requestAnimationFrame(detectAndDraw);
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, detectAndDraw]);

  const startGame = () => {
    setIsPlaying(true);
    setIsDrawing(false);  // Reset drawing state - user must explicitly start
    drawnPointsRef.current = [];
    setFeedback('');
    setAccuracy(0);
    setStartTime(Date.now());
  };

  const stopGame = () => {
    setIsPlaying(false);
    setIsDrawing(false);  // Reset drawing state
    drawnPointsRef.current = [];
    setAccuracy(0);
  };

  const clearDrawing = () => {
    drawnPointsRef.current = [];
    setAccuracy(0);
  };

  const nextLetter = () => {
    setCurrentLetterIndex((prev) => (prev + 1) % LETTERS.length);
    drawnPointsRef.current = [];
    setAccuracy(0);
  };

  const checkProgress = () => {
    const letterAccuracy = calculateAccuracy(drawnPointsRef.current);
    setAccuracy(letterAccuracy);
    
    // Difficulty affects accuracy thresholds
    const goodThreshold = settings.difficulty === 'easy' ? 60 : settings.difficulty === 'medium' ? 70 : 80;
    const okThreshold = settings.difficulty === 'easy' ? 30 : settings.difficulty === 'medium' ? 40 : 50;
    
    // Track progress for adaptive unlock system
    const previousBatches = getUnlockedBatches(settings.language);
    markLetterAttempt(settings.language, currentLetter.char, letterAccuracy);
    const currentBatches = getUnlockedBatches(settings.language);
    
    // Check if new batch was unlocked
    const newBatchUnlocked = currentBatches > previousBatches;
    
    if (letterAccuracy >= goodThreshold) {
      // Good tracing
      const points = letterAccuracy > 90 ? 20 : letterAccuracy > 80 ? 15 : 10;
      setScore((prev) => prev + points);
      setStreak((prev) => prev + 1);
      
      if (newBatchUnlocked) {
        setFeedback(`🎉 Amazing! New letters unlocked! +${points} points`);
        addBadge(`batch-${currentBatches}`);
      } else {
        setFeedback(`Great job! ${letterAccuracy}% accuracy! 🎉 +${points} points`);
      }
      
      saveProgress(letterAccuracy);
      
      // Auto advance after delay
      setTimeout(() => {
        nextLetter();
        setFeedback('');
      }, 2000);
    } else if (letterAccuracy >= okThreshold) {
      // Okay tracing
      setScore((prev) => prev + 5);
      setStreak(0);
      setFeedback(`Good try! ${letterAccuracy}% - Keep practicing! 💪 +5 points`);
      saveProgress(letterAccuracy);
    } else {
      // Poor tracing
      setStreak(0);
      setFeedback(`Try again! ${letterAccuracy}% - Trace the letter more carefully ✏️`);
    }
    
    setTimeout(() => {
      if (letterAccuracy < 70) {
        setFeedback('');
      }
    }, 3000);
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
            <h1 className="text-3xl font-bold">Learning Game</h1>
            <p className="text-white/60">Trace letters with your finger!</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">Score: {score}</div>
            <div className="flex items-center gap-4 text-sm text-white/60">
              <span>🔥 Streak: {streak}</span>
              <span>Batch {Math.floor(currentLetterIndex / BATCH_SIZE) + 1} of {Math.ceil(LETTERS.length / BATCH_SIZE)}</span>
            </div>
          </div>
        </div>

        {/* Letter Display */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-6">
          <div className="flex items-center justify-center gap-8">
            <div className="text-center">
              <div className="text-8xl font-bold" style={{ color: currentLetter.color }}>
                {currentLetter.char}
              </div>
              {currentLetter.transliteration && (
                <div className="text-lg text-white/60 mt-2">
                  {currentLetter.transliteration}
                </div>
              )}
            </div>
            <div className="text-6xl">{currentLetter.emoji}</div>
            <div className="text-center">
              <div className="text-2xl">{currentLetter.name}</div>
              {currentLetter.pronunciation && (
                <div className="text-sm text-white/60 mt-1">
                  "{currentLetter.pronunciation}"
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Accuracy Bar */}
        {accuracy > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 border border-white/10 rounded-xl p-4 mb-6"
          >
            <div className="flex justify-between items-center mb-2">
              <span className="text-white/80">Tracing Accuracy</span>
              <span className="font-bold" style={{ color: accuracy >= 70 ? '#10b981' : accuracy >= 40 ? '#f59e0b' : '#ef4444' }}>
                {accuracy}%
              </span>
            </div>
            <div className="h-3 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${accuracy}%` }}
                transition={{ duration: 0.5 }}
                className="h-full rounded-full"
                style={{ 
                  backgroundColor: accuracy >= 70 ? '#10b981' : accuracy >= 40 ? '#f59e0b' : '#ef4444'
                }}
              />
            </div>
          </motion.div>
        )}

        {/* Feedback */}
        {feedback && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`rounded-xl p-4 mb-6 text-center font-semibold ${
              feedback.includes('Great') 
                ? 'bg-green-500/20 border border-green-500/30 text-green-400'
                : feedback.includes('Good')
                ? 'bg-yellow-500/20 border border-yellow-500/30 text-yellow-400'
                : 'bg-red-500/20 border border-red-500/30 text-red-400'
            }`}
          >
            {feedback}
          </motion.div>
        )}

        {!isPlaying ? (
          <div className="bg-white/5 border border-white/10 rounded-xl p-12 text-center">
            <div className="text-6xl mb-4">✋</div>
            <h2 className="text-2xl font-semibold mb-4">Ready to Learn?</h2>
            <p className="text-white/70 mb-4 max-w-md mx-auto">
              Use your hand to trace letters! The camera will track your finger movements.
            </p>
            <div className="text-sm text-white/50 mb-8">
              Language: <span className="text-white/80 capitalize">{settings.language}</span> | 
              Difficulty: <span className="text-white/80 capitalize">{settings.difficulty}</span>
            </div>
            {isModelLoading ? (
              <div className="text-white/60">Loading hand tracking...</div>
            ) : (
              <button
                onClick={startGame}
                className="px-8 py-3 bg-gradient-to-r from-red-500 to-red-600 rounded-lg font-semibold hover:shadow-lg hover:shadow-red-500/30 transition"
              >
                Start Game
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative bg-black rounded-xl overflow-hidden aspect-video shadow-2xl">
              {/* Webcam video */}
              <Webcam
                ref={webcamRef}
                className="absolute inset-0 w-full h-full object-cover"
                mirrored
                videoConstraints={{ width: 640, height: 480 }}
              />
              {/* Canvas overlay for tracing */}
              <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full"
              />
              
              {/* Controls overlay */}
              <div className="absolute top-4 left-4 flex gap-2">
                <div className="bg-black/50 backdrop-blur px-3 py-1 rounded-full text-sm">
                  🎯 Trace: {currentLetter.char}
                </div>
                {streak > 2 && (
                  <div className="bg-orange-500/50 backdrop-blur px-3 py-1 rounded-full text-sm">
                    🔥 {streak} streak!
                  </div>
                )}
              </div>
              
              <div className="absolute top-4 right-4 flex gap-2">
                <button
                  onClick={() => setIsDrawing(!isDrawing)}
                  className={`px-4 py-2 rounded-lg transition text-sm font-semibold ${
                    isDrawing 
                      ? 'bg-red-500/70 hover:bg-red-500/90 border border-red-400/50' 
                      : 'bg-green-500/70 hover:bg-green-500/90 border border-green-400/50'
                  }`}
                >
                  {isPinching ? '👌 Pinching...' : isDrawing ? '✋ Stop Drawing' : '✏️ Start Drawing'}
                </button>
                <button
                  onClick={clearDrawing}
                  className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg hover:bg-white/20 transition text-sm"
                >
                  Clear
                </button>
                <button
                  onClick={stopGame}
                  className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg hover:bg-white/20 transition text-sm"
                >
                  Stop
                </button>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex justify-center gap-4">
              <button
                onClick={checkProgress}
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 rounded-lg font-semibold hover:shadow-lg hover:shadow-green-500/30 transition"
              >
                ✅ Check My Tracing
              </button>
              <button
                onClick={nextLetter}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg font-semibold hover:shadow-lg hover:shadow-blue-500/30 transition"
              >
                Skip →
              </button>
            </div>

            <p className="text-center text-white/60 text-sm">
              Hold your hand up and pinch thumb + index finger to draw! Or click the button.
              {settings.showHints && ' The faint letter shows where to trace.'}
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
