 import { useState, useRef, useEffect, useCallback } from 'react';
 import { motion, AnimatePresence } from 'framer-motion';
 import Webcam from 'react-webcam';
 import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';
 import { useTTS } from '../hooks/useTTS';
import { getLettersForGame, Letter } from '../data/alphabets';
 
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
 
 const NUMBER_NAMES = [
 'Zero',
 'One',
 'Two',
 'Three',
 'Four',
 'Five',
 'Six',
 'Seven',
 'Eight',
 'Nine',
 'Ten',
 'Eleven',
 'Twelve',
 'Thirteen',
 'Fourteen',
 'Fifteen',
 'Sixteen',
 'Seventeen',
 'Eighteen',
 'Nineteen',
 'Twenty',
 ] as const;
 
 const DIFFICULTY_LEVELS: DifficultyLevel[] = [
 { name: 'Level 1', minNumber: 0, maxNumber: 2, rewardMultiplier: 1.2 },
 { name: 'Level 2', minNumber: 0, maxNumber: 5, rewardMultiplier: 1.0 },
 { name: 'Level 3', minNumber: 0, maxNumber: 10, rewardMultiplier: 0.8 },
 { name: 'Duo Mode', minNumber: 0, maxNumber: 20, rewardMultiplier: 0.6 },
 ];
 
 export function countExtendedFingersFromLandmarks(landmarks: Point[]): number {
 const dist = (a: Point, b: Point) => {
 const dx = a.x - b.x;
 const dy = a.y - b.y;
 return Math.sqrt(dx * dx + dy * dy);
 };
 
 const wrist = landmarks[0];
 const indexMcp = landmarks[5];
 const middleMcp = landmarks[9];
 const ringMcp = landmarks[13];
 const pinkyMcp = landmarks[17];
 
 if (!wrist) return 0;
 
 // Palm center is a stable reference even when the hand rotates (helps thumb).
 const palmPoints = [wrist, indexMcp, middleMcp, ringMcp, pinkyMcp].filter(Boolean) as Point[];
 const palmCenter =
 palmPoints.length > 0
 ? palmPoints.reduce(
 (acc, p) => ({ x: acc.x + p.x / palmPoints.length, y: acc.y + p.y / palmPoints.length }),
 { x: 0, y: 0 },
 )
 : wrist;
 
 // Fingers (index/middle/ring/pinky):
 // Primary heuristic: tip is "up" relative to PIP (works for upright hands).
 // Fallback heuristic: tip is further from wrist than PIP (works for rotated/sideways hands).
 const fingerPairs = [
 { tip: 8, pip: 6 },
 { tip: 12, pip: 10 },
 { tip: 16, pip: 14 },
 { tip: 20, pip: 18 },
 ];
 
 let count = 0;
 for (const pair of fingerPairs) {
 const tip = landmarks[pair.tip];
 const pip = landmarks[pair.pip];
 if (!tip || !pip) continue;
 const up = tip.y < pip.y;
 const further = dist(tip, wrist) > dist(pip, wrist) + 0.02;
 if (up || further) count++;
 }
 
 // Thumb:
 // Improved detection for kids' hands - uses multiple heuristics for reliability.
 // Thumb is extended when:
 // 1. Thumb tip is further from palm center than thumb MCP (base)
 // 2. OR thumb tip is far from index finger base (spread position)
 // 3. OR thumb forms an angle with other fingers (not tucked in)
 const thumbTip = landmarks[4];
 const thumbIp = landmarks[3];
 const thumbMcp = landmarks[2];
 if (thumbTip && thumbIp && thumbMcp) {
 // Distance-based: tip should be further from palm center than MCP
 const tipToPalm = dist(thumbTip, palmCenter);
 const mcpToPalm = dist(thumbMcp, palmCenter);
 const thumbExtendedFromPalm = tipToPalm > mcpToPalm * 0.8; // More lenient threshold
 
 // Spread-based: thumb tip should be away from index finger
 const thumbSpread = indexMcp ? dist(thumbTip, indexMcp) > 0.15 : true;
 
 // Angle-based: thumb tip should not be too close to other fingers when closed
 const thumbTipToIndexTip = landmarks[8] ? dist(thumbTip, landmarks[8]) : 1;
 const thumbNotTucked = thumbTipToIndexTip > 0.08;
 
 // Count thumb if majority of conditions pass (2 out of 3)
 let thumbConditions = 0;
 if (thumbExtendedFromPalm) thumbConditions++;
 if (thumbSpread) thumbConditions++;
 if (thumbNotTucked) thumbConditions++;
 
 if (thumbConditions >= 2) count++;
 }
 
 return count;
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
 const [handsDetected, setHandsDetected] = useState<number>(0);
 const [handsBreakdown, setHandsBreakdown] = useState<string>('');
  const [targetNumber, setTargetNumber] = useState<number>(0);
  const [feedback, setFeedback] = useState<string>('');
  const [difficulty, setDifficulty] = useState<number>(0);
  // @ts-expect-error - showCelebration is used by code below (removed for lint)
  const [showCelebration, setShowCelebration] = useState(false);
  const { speak, isEnabled: ttsEnabled, isAvailable: ttsAvailable } = useTTS();

  // Language and mode selection
  const LANGUAGES = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
    { code: 'kn', name: 'Kannada', flag: '🇮🇳' },
    { code: 'te', name: 'Telugu', flag: '🇮🇳' },
    { code: 'ta', name: 'Tamil', flag: '🇮🇳' },
  ] as const;

  type GameMode = 'numbers' | 'letters';
  const [gameMode, setGameMode] = useState<GameMode>('numbers');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('en');
  const [targetLetter, setTargetLetter] = useState<Letter | null>(null);

 const lastSpokenTargetRef = useRef<number | null>(null);
 const lastSpokenAtRef = useRef<number>(0);
 const promptTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
 const [promptStage, setPromptStage] = useState<'center' | 'side'>('center');
 const successLockRef = useRef<boolean>(false);
 const stableMatchRef = useRef<{ startAt: number | null; target: number | null; count: number | null }>({
 startAt: null,
 target: null,
 count: null,
 });
 
 const lastVideoTimeRef = useRef<number>(-1);
 const frameSkipRef = useRef<number>(0);
 const lastHandsSeenAtRef = useRef<number>(0);
 const targetBagRef = useRef<number[]>([]);
 const lastTargetRef = useRef<number | null>(null);
 const bagKeyRef = useRef<string>('');
 
 const randomInt = useCallback((maxExclusive: number) => {
 if (maxExclusive <= 1) return 0;
 try {
 const arr = new Uint32Array(1);
 crypto.getRandomValues(arr);
 return arr[0] % maxExclusive;
 } catch {
 return Math.floor(Math.random() * maxExclusive);
 }
 }, []);
 
 const shuffleInPlace = useCallback((arr: number[]) => {
 for (let i = arr.length - 1; i > 0; i--) {
 const j = randomInt(i + 1);
 [arr[i], arr[j]] = [arr[j], arr[i]];
 }
 }, [randomInt]);
 
 const refillTargetBag = useCallback((minNumber: number, maxNumber: number) => {
 const nextBag: number[] = [];
 for (let n = minNumber; n <= maxNumber; n++) nextBag.push(n);
 shuffleInPlace(nextBag);
 
 // Avoid immediate repeats across refills when possible.
 if (nextBag.length > 1 && lastTargetRef.current != null && nextBag[0] === lastTargetRef.current) {
 const swapIndex = nextBag.length - 1;
 [nextBag[0], nextBag[swapIndex]] = [nextBag[swapIndex], nextBag[0]];
 }
 
 targetBagRef.current = nextBag;
 }, [shuffleInPlace]);
 
 // Letter bag ref for letter mode
 const letterBagRef = useRef<Letter[]>([]);
 const lastLetterRef = useRef<Letter | null>(null);

 const letters = getLettersForGame(selectedLanguage);

 const refillLetterBag = useCallback(() => {
   const nextBag = [...letters];
   // Shuffle
   for (let i = nextBag.length - 1; i > 0; i--) {
     const j = randomInt(i + 1);
     [nextBag[i], nextBag[j]] = [nextBag[j], nextBag[i]];
   }
   // Avoid immediate repeats
   if (nextBag.length > 1 && lastLetterRef.current && nextBag[0].char === lastLetterRef.current.char) {
     const swapIndex = nextBag.length - 1;
     [nextBag[0], nextBag[swapIndex]] = [nextBag[swapIndex], nextBag[0]];
   }
   letterBagRef.current = nextBag;
 }, [letters, randomInt]);

 const setNextTarget = useCallback((levelIndex: number) => {
   if (gameMode === 'letters') {
     // Letter mode
     if (letterBagRef.current.length === 0) {
       refillLetterBag();
     }
     const nextLetter = letterBagRef.current.shift();
     if (!nextLetter) return;

     lastLetterRef.current = nextLetter;
     setTargetLetter(nextLetter);
     setTargetNumber(0); // Reset number target
     const prompt = `Show me the letter ${nextLetter.name}!`;
     setFeedback(prompt);
     setPromptStage('center');
     if (promptTimeoutRef.current) clearTimeout(promptTimeoutRef.current);
     promptTimeoutRef.current = setTimeout(() => setPromptStage('side'), 1800);
     successLockRef.current = false;
     stableMatchRef.current = { startAt: null, target: null, count: null };

     if (ttsEnabled) {
       const now = Date.now();
       const shouldSpeak =
         lastSpokenTargetRef.current !== nextLetter.char.charCodeAt(0) || now - lastSpokenAtRef.current > 2000;
       if (shouldSpeak) {
         lastSpokenTargetRef.current = nextLetter.char.charCodeAt(0);
         lastSpokenAtRef.current = now;
         void speak(prompt);
       }
     }
   } else {
     // Number mode
     const level = DIFFICULTY_LEVELS[levelIndex];
     if (!level) return;
     const { minNumber, maxNumber } = level;
     const nextKey = `${levelIndex}:${minNumber}-${maxNumber}`;

     if (bagKeyRef.current !== nextKey || targetBagRef.current.length === 0) {
       bagKeyRef.current = nextKey;
       refillTargetBag(minNumber, maxNumber);
     }

     const nextTarget = targetBagRef.current.shift();
     if (typeof nextTarget !== 'number') return;

     lastTargetRef.current = nextTarget;
     setTargetNumber(nextTarget);
     setTargetLetter(null); // Reset letter target
     const prompt =
       nextTarget === 0
         ? 'Make a fist for zero.'
         : `Show me ${NUMBER_NAMES[nextTarget]} fingers.`;
     setFeedback(prompt);
     setPromptStage('center');
     if (promptTimeoutRef.current) clearTimeout(promptTimeoutRef.current);
     promptTimeoutRef.current = setTimeout(() => setPromptStage('side'), 1800);
     successLockRef.current = false;
     stableMatchRef.current = { startAt: null, target: null, count: null };

     if (ttsEnabled) {
       const now = Date.now();
       const shouldSpeak =
         lastSpokenTargetRef.current !== nextTarget || now - lastSpokenAtRef.current > 2000;
       if (shouldSpeak) {
         lastSpokenTargetRef.current = nextTarget;
         lastSpokenAtRef.current = now;
         void speak(prompt);
       }
     }
   }
 }, [
   gameMode,
   refillTargetBag,
   refillLetterBag,
   speak,
   ttsEnabled,
   letters,
   NUMBER_NAMES,
   DIFFICULTY_LEVELS
 ]);
 
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
 numHands: 4,
 // Be more permissive so multiple hands register more reliably in real-world lighting/angles.
 minHandDetectionConfidence: 0.3,
 minHandPresenceConfidence: 0.3,
 minTrackingConfidence: 0.3,
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

 setNextTarget(difficulty);
 }, [isPlaying, difficulty]);
 
 const countExtendedFingers = useCallback((landmarks: Point[]): number => {
 return countExtendedFingersFromLandmarks(landmarks);
 }, []);
 
 const lastHandsUiRef = useRef<{ hands: number; breakdown: string }>({
 hands: 0,
 breakdown: '',
 });
 
 const detectAndDraw = useCallback(() => {
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
 const perHand: number[] = [];
 let detectedHands = 0;
 
 if (results && results.landmarks && results.landmarks.length > 0) {
 lastHandsSeenAtRef.current = Date.now();
 detectedHands = results.landmarks.length;
 results.landmarks.forEach((landmarks: Landmark[], handIndex: number) => {
 const fingerCount = countExtendedFingers(landmarks);
 perHand.push(fingerCount);
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
 
 const breakdown = perHand.length > 0 ? perHand.join(' + ') : '';
 const lastUi = lastHandsUiRef.current;
 if (lastUi.hands !== detectedHands) {
 lastUi.hands = detectedHands;
 setHandsDetected(detectedHands);
 }
 if (lastUi.breakdown !== breakdown) {
 lastUi.breakdown = breakdown;
 setHandsBreakdown(breakdown);
 }
 
 // For target 0: require a detected hand (closed fist) to avoid "no hands = success".
 // Handle both number mode and letter mode
 const currentTargetNumber = gameMode === 'letters' && targetLetter
   ? targetLetter.char.toUpperCase().charCodeAt(0) - 64
   : targetNumber;
 const canSucceedOnZero = currentTargetNumber === 0 ? detectedHands > 0 : true;

 const eligibleMatch = totalFingers === currentTargetNumber && canSucceedOnZero;

 // DEBUG logging for both modes
 if (gameMode === 'letters' && targetLetter) {
   console.log('DEBUG Letter mode:', { 
     letter: targetLetter?.char, 
     letterValue: targetLetter ? targetLetter.char.toUpperCase().charCodeAt(0) - 64 : null,
     currentTargetNumber, 
     totalFingers, 
     detectedHands,
     perHand,
     eligibleMatch,
     canSucceedOnZero,
     stableTarget: stableMatchRef.current.target,
     stableCount: stableMatchRef.current.count,
     stableStartAt: stableMatchRef.current.startAt
   });
 } else if (gameMode === 'numbers') {
   console.log('DEBUG Number mode:', { 
     targetNumber,
     currentTargetNumber, 
     totalFingers, 
     detectedHands,
     perHand,
     eligibleMatch,
     canSucceedOnZero,
     stableTarget: stableMatchRef.current.target,
     stableCount: stableMatchRef.current.count,
     stableStartAt: stableMatchRef.current.startAt
   });
 }
 
 const nowMs = Date.now();
 if (!eligibleMatch) {
 stableMatchRef.current = { startAt: null, target: null, count: null };
 } else {
 const stable = stableMatchRef.current;
 const same =
 stable.target === currentTargetNumber &&
 stable.count === totalFingers &&
 stable.startAt != null;
 if (!same) {
 stableMatchRef.current = { startAt: nowMs, target: currentTargetNumber, count: totalFingers };
 } else if (!successLockRef.current && nowMs - (stable.startAt ?? nowMs) >= 450) {
 // Lock immediately to avoid multi-frame double scoring.
 console.log('SUCCESS TRIGGERED!', { targetNumber, totalFingers, currentTargetNumber, gameMode });
 successLockRef.current = true;
 setShowCelebration(true);
 const level = DIFFICULTY_LEVELS[difficulty] ?? DIFFICULTY_LEVELS[0];
 const points = Math.round(10 * level.rewardMultiplier);
 setScore((prev) => prev + points);
 setStreak((prev) => prev + 1);
 setFeedback(`Great! ${NUMBER_NAMES[totalFingers]}! +${points} points`);

 setTimeout(() => {
 setShowCelebration(false);
 // Reset the success lock and stable match so the next success can be detected
 successLockRef.current = false;
 stableMatchRef.current = { startAt: null, target: null, count: null };
 setNextTarget(difficulty);
 }, 1800);
 }
 }
 
  requestAnimationFrame(detectAndDraw);
  }, [handLandmarker, isPlaying, targetNumber, countExtendedFingers, difficulty, setNextTarget, gameMode, handsDetected, targetLetter]);
 
 useEffect(() => {
 if (isPlaying) {
 requestAnimationFrame(detectAndDraw);
 }
 return () => {
 if (promptTimeoutRef.current) {
 clearTimeout(promptTimeoutRef.current);
 promptTimeoutRef.current = null;
 }
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
 if (promptTimeoutRef.current) {
 clearTimeout(promptTimeoutRef.current);
 promptTimeoutRef.current = null;
 }
 };
 
 const getLetterNumberValue = (letter: Letter | null): number => {
   if (!letter) return 0;
   const code = letter.char.toUpperCase().charCodeAt(0);
   // A=1, B=2, etc. Support A-Z only for this game
   if (code >= 65 && code <= 90) return code - 64;
   return 0;
 };

 const isDetectedMatch =
   gameMode === 'letters'
     ? targetLetter && currentCount === getLetterNumberValue(targetLetter) && handsDetected > 0
     : targetNumber === 0
       ? currentCount === 0 && handsDetected > 0
       : currentCount === targetNumber;
 const isPromptFeedback =
 feedback.startsWith('Show me ') || feedback.startsWith('Make a fist ');
 
 return (
 <div className="max-w-7xl mx-auto px-4 py-8">
 <motion.div
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 >
 {/* Header */}
 <div className="flex justify-between items-center mb-6">
 <div>
 <h1 className="text-3xl font-bold">
 {gameMode === 'letters' ? 'Letter Finger Show' : 'Finger Number Show'}
 </h1>
 <p className="text-text-secondary">
 {gameMode === 'letters' 
 ? 'Show letters by counting with your fingers!' 
 : 'Show numbers with your fingers!'}
 </p>
 </div>
 <div className="text-right">
 <div className="text-2xl font-bold text-text-primary">Score: {score}</div>
 <div className="flex items-center justify-end gap-4 text-sm text-text-secondary">
 <span>🔥 Streak: {streak}</span>
 <span>{(DIFFICULTY_LEVELS[difficulty] ?? DIFFICULTY_LEVELS[0]).name}</span>
 </div>
 </div>
 </div>
 
 {/* Mode Selection */}
 {!isPlaying && (
 <div className="bg-white border border-border rounded-xl p-6 mb-6 shadow-soft">
 <div className="text-sm font-medium text-text-secondary mb-3">
 Choose Game Mode
 </div>
 <div className="flex gap-2 mb-4">
 <button
 type="button"
 onClick={() => setGameMode('numbers')}
 className={`px-4 py-2 rounded-lg font-medium transition ${
 gameMode === 'numbers'
 ? 'bg-pip-orange text-white shadow-soft'
 : 'bg-bg-tertiary text-text-primary border border-border hover:bg-white'
 }`}
 >
 🔢 Numbers
 </button>
 <button
 type="button"
 onClick={() => setGameMode('letters')}
 className={`px-4 py-2 rounded-lg font-medium transition ${
 gameMode === 'letters'
 ? 'bg-pip-orange text-white shadow-soft'
 : 'bg-bg-tertiary text-text-primary border border-border hover:bg-white'
 }`}
 >
 🔤 Letters
 </button>
 </div>

 {gameMode === 'letters' && (
 <>
 <div className="text-sm font-medium text-text-secondary mb-2">
 Choose Language
 </div>
 <div className="flex flex-wrap gap-2">
 {LANGUAGES.map((lang) => (
 <button
 key={lang.code}
 type="button"
 onClick={() => setSelectedLanguage(lang.code)}
 className={`px-3 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
 selectedLanguage === lang.code
 ? 'bg-success/20 border border-success/30 text-text-success'
 : 'bg-bg-tertiary text-text-primary border border-border hover:bg-white'
 }`}
 >
 <span>{lang.flag}</span>
 <span>{lang.name}</span>
 </button>
 ))}
 </div>
 </>
 )}
 </div>
 )}

 {/* Difficulty Selection */}
 {!isPlaying && gameMode === 'numbers' && (
 <div className="bg-white border border-border rounded-xl p-6 mb-6 shadow-soft">
 <div className="text-sm font-medium text-text-secondary mb-2">
 Choose Difficulty
 </div>
 <div className="flex gap-2">
 {DIFFICULTY_LEVELS.map((level, levelIndex) => (
 <button
 key={level.name}
 type="button"
 onClick={() => setDifficulty(levelIndex)}
 className={`px-4 py-2 rounded-lg font-medium transition ${
 difficulty === levelIndex
 ? 'bg-pip-orange text-white shadow-soft'
 : 'bg-bg-tertiary text-text-primary border border-border hover:bg-white'
 }`}
 >
 {level.name} ({level.minNumber}-{level.maxNumber})
 </button>
 ))}
 </div>
 </div>
 )}
 
 {/* Feedback */}
 <AnimatePresence>
 {feedback && (!isPlaying || !isPromptFeedback) && (
 <motion.div
 initial={{ opacity: 0, scale: 0.9 }}
 animate={{ opacity: 1, scale: 1 }}
 exit={{ opacity: 0, scale: 0.9 }}
 className={`rounded-xl p-4 mb-6 text-center font-semibold ${
 feedback.includes('Great') || feedback.includes('Amazing')
 ? 'bg-success/20 border border-success/30 text-text-success'
 : 'bg-white border border-border text-text-secondary'
 }`}
 >
 {feedback}
 </motion.div>
 )}
 </AnimatePresence>
 
 {/* Game Area */}
 <div className="relative">
 {!isPlaying ? (
 <div className="bg-white border border-border rounded-xl p-12 text-center shadow-soft">
 <div className="text-6xl mb-4">{gameMode === 'letters' ? '🔤' : '🤚'}</div>
 <h2 className="text-2xl font-semibold mb-4">
 {gameMode === 'letters' ? 'Ready to Learn Letters?' : 'Ready to Count?'}
 </h2>
 <p className="text-text-secondary mb-8 max-w-md mx-auto">
 {gameMode === 'letters'
 ? 'Show me letters by holding up the right number of fingers! A=1 finger, B=2 fingers, and so on.'
 : 'Hold up your fingers to show numbers! The camera will count how many fingers you\'re showing.'}
 </p>
 <div className="flex justify-center gap-4">
 <button
 type="button"
 onClick={() => window.history.back()}
 className="px-6 py-3 bg-white border border-border rounded-lg font-semibold text-text-secondary hover:text-text-primary hover:bg-bg-tertiary transition shadow-soft"
 >
 Back
 </button>
 {isModelLoading ? (
 <div className="text-text-secondary px-6 py-3">Loading hand tracking...</div>
 ) : (
 <button
 type="button"
 onClick={startGame}
 className="px-8 py-3 bg-pip-orange text-white rounded-lg font-semibold hover:bg-pip-rust transition shadow-soft hover:shadow-soft-lg"
 >
 Start Game
 </button>
 )}
 </div>
 </div>
 ) : (
 <div className="space-y-4">
 <div className="relative bg-black rounded-xl overflow-hidden aspect-video shadow-soft-lg border border-border">
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
 
 {/* One-time big prompt (center) then moves to the side */}
 {promptStage === 'center' && (
 <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
 <div className="bg-black/65 backdrop-blur px-8 py-6 rounded-3xl border border-white/25 text-white shadow-soft-lg">
 <div className="text-center">
 {gameMode === 'letters' && targetLetter ? (
 <>
 <div className="text-sm md:text-base opacity-85 font-semibold mb-2">
 Show me
 </div>
 <div className="text-7xl md:text-8xl font-black leading-none">
 {targetLetter.char}
 </div>
 <div className="text-base md:text-lg opacity-90 font-semibold mt-2">
 {targetLetter.name}
 </div>
 <div className="text-sm opacity-70 mt-1">
 ({targetLetter.pronunciation})
 </div>
 </>
 ) : (
 <>
 <div className="text-sm md:text-base opacity-85 font-semibold mb-2">
 {targetNumber === 0 ? 'Make a fist' : 'Show'}
 </div>
 <div className="text-7xl md:text-8xl font-black leading-none">
 {targetNumber}
 </div>
 <div className="text-base md:text-lg opacity-90 font-semibold mt-2">
 {NUMBER_NAMES[targetNumber]}
 </div>
 </>
 )}
 </div>
 </div>
 </div>
 )}
 
 {/* Controls overlay */}
 <div className="absolute top-4 left-4 flex gap-2">
 <div className="bg-black/55 backdrop-blur px-3 py-1 rounded-full text-sm font-bold border border-white/20 text-white">
 {promptStage === 'side' ? (
 gameMode === 'letters' && targetLetter ? (
 <span>
 Show <span className="font-extrabold">{targetLetter.name}</span>{' '}
 <span className="opacity-80">({targetLetter.char})</span>
 </span>
 ) : (
 <span>
 Show <span className="font-extrabold">{targetNumber}</span>{' '}
 <span className="opacity-80">({NUMBER_NAMES[targetNumber]})</span>
 </span>
 )
 ) : (
 gameMode === 'letters' && targetLetter ? (
 <span>
 Target: <span className="font-extrabold">{targetLetter.char}</span>
 </span>
 ) : (
 <span>
 Target: <span className="font-extrabold">{targetNumber}</span>
 </span>
 )
 )}
 </div>
 <div
 className={`bg-black/50 backdrop-blur px-3 py-1 rounded-full text-sm font-bold border border-white/20 text-white ${
 isDetectedMatch ? 'ring-2 ring-green-400/70' : ''
 }`}
 >
 Detected: {currentCount}
 {handsBreakdown ? <span className="opacity-80"> ({handsBreakdown})</span> : null}
 </div>
 <div className="bg-black/50 backdrop-blur px-3 py-1 rounded-full text-sm font-bold border border-white/20 text-white">
 Hands: {handsDetected}
 </div>
 {ttsAvailable && (
 <button
 type="button"
 onClick={() => {
 const prompt =
 gameMode === 'letters' && targetLetter
 ? `Show me the letter ${targetLetter.name}!`
 : targetNumber === 0
 ? 'Make a fist for zero.'
 : `Show me ${NUMBER_NAMES[targetNumber]} fingers.`;
 void speak(prompt);
 }}
 className={`bg-black/50 backdrop-blur px-3 py-1 rounded-full text-sm font-bold border border-white/20 text-white hover:bg-black/60 transition ${
 ttsEnabled ? '' : 'opacity-60'
 }`}
 title={ttsEnabled ? 'Replay prompt' : 'Enable sound in Settings to hear prompts'}
 >
 🔊
 </button>
 )}
 {gameMode === 'numbers' && (
 <div className="bg-bg-tertiary/90 backdrop-blur px-3 py-1 rounded-full text-sm font-bold border border-border text-text-primary">
 {(DIFFICULTY_LEVELS[difficulty] ?? DIFFICULTY_LEVELS[0]).name}
 </div>
 )}
 {streak > 2 && (
 <div className="bg-pip-orange/90 text-white backdrop-blur px-3 py-1 rounded-full text-sm font-bold animate-pulse shadow-soft">
 🔥 {streak} streak!
 </div>
 )}
 </div>
 
 <div className="absolute top-4 right-4 flex gap-2">
 <button
 type="button"
 onClick={() => window.history.back()}
 className="px-4 py-2 bg-white/90 hover:bg-white text-text-primary border border-border rounded-lg transition text-sm font-semibold shadow-soft"
 >
 Back
 </button>
 <button
 type="button"
 onClick={stopGame}
 className="px-4 py-2 bg-error/90 border border-text-error/30 text-white rounded-lg hover:bg-text-error transition text-sm font-semibold shadow-soft"
 >
 Stop
 </button>
 </div>
 </div>
 
 <p className="text-center text-text-secondary text-sm font-medium">
 {gameMode === 'letters'
 ? 'Hold up fingers for the letter position! A=1, B=2, C=3, and so on.'
 : difficulty === 3
   ? 'Duo Mode: Up to 4 people can play together! Show up to 20 fingers.'
   : 'Hold up your fingers to show numbers! Use both hands for numbers greater than 5.'}
 </p>
 </div>
 )}
 </div>
 </motion.div>
 </div>
 );
 }
