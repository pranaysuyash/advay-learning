import { useState, useRef, useEffect, useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import Webcam from 'react-webcam';
import { useTTS } from '../hooks/useTTS';
import { useSoundEffects } from '../hooks/useSoundEffects';
import { GameContainer } from '../components/GameContainer';
import { GameControls } from '../components/GameControls';
import type { GameControl } from '../components/GameControls';
import { CelebrationOverlay } from '../components/CelebrationOverlay';
import { getLettersForGame, Letter } from '../data/alphabets';
import { LANGUAGES } from '../data/languages';
import { countExtendedFingersFromLandmarks } from './fingerCounting';
// Centralized hand tracking
import { useHandTracking } from '../hooks/useHandTracking';
import { useGameLoop } from '../hooks/useGameLoop';
import { getHandLandmarkLists } from '../utils/landmarkUtils';
import { getMaxHandsForDifficultyIndex } from './finger-number-show/handTrackingConfig';
import { FingerNumberShowMenu } from './finger-number-show/FingerNumberShowMenu';
import { FingerNumberShowHud } from './finger-number-show/FingerNumberShowHud';
import type { Point, Landmark } from '../types/tracking';

interface DifficultyLevel {
  name: string;
  minNumber: number;
  maxNumber: number;
  rewardMultiplier: number;
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

export const FingerNumberShow = memo(function FingerNumberShowComponent() {
  const navigate = useNavigate();
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [difficulty, setDifficulty] = useState<number>(0);

  const desiredMaxHands = getMaxHandsForDifficultyIndex(difficulty);
  const activeMaxHandsRef = useRef<number>(desiredMaxHands);
  const reinitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Use centralized hand tracking hook
  const {
    landmarker: handLandmarker,
    isLoading: isModelLoading,
    isReady: isHandTrackingReady,
    initialize: initializeHandTracking,
    reset: resetHandTracking,
  } = useHandTracking({
    // Default to 2 hands for stability; allow up to 4 in Duo Mode.
    numHands: desiredMaxHands,
    minDetectionConfidence: 0.3,
    minHandPresenceConfidence: 0.3,
    minTrackingConfidence: 0.3,
    delegate: 'GPU',
    enableFallback: true,
  });
  const [currentCount, setCurrentCount] = useState<number>(0);
  const [handsDetected, setHandsDetected] = useState<number>(0);
  const [targetNumber, setTargetNumber] = useState<number>(0);
  const [feedback, setFeedback] = useState<string>('');
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationValue, setCelebrationValue] = useState<string>('');
  const { speak, isEnabled: ttsEnabled, isAvailable: ttsAvailable } = useTTS();
  const { playCelebration } = useSoundEffects();

  // Language and mode selection
  type GameMode = 'numbers' | 'letters';
  const [gameMode, setGameMode] = useState<GameMode>('numbers');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('en');
  const [targetLetter, setTargetLetter] = useState<Letter | null>(null);

  const lastSpokenTargetRef = useRef<number | null>(null);
  const lastSpokenAtRef = useRef<number>(0);
  const promptTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [promptStage, setPromptStage] = useState<'center' | 'side'>('center');
  const successLockRef = useRef<boolean>(false);
  const stableMatchRef = useRef<{
    startAt: number | null;
    target: number | null;
    count: number | null;
  }>({
    startAt: null,
    target: null,
    count: null,
  });

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

  const shuffleInPlace = useCallback(
    (arr: number[]) => {
      for (let i = arr.length - 1; i > 0; i--) {
        const j = randomInt(i + 1);
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
    },
    [randomInt],
  );

  const refillTargetBag = useCallback(
    (minNumber: number, maxNumber: number) => {
      const nextBag: number[] = [];
      for (let n = minNumber; n <= maxNumber; n++) nextBag.push(n);
      shuffleInPlace(nextBag);

      // Avoid immediate repeats across refills when possible.
      if (
        nextBag.length > 1 &&
        lastTargetRef.current != null &&
        nextBag[0] === lastTargetRef.current
      ) {
        const swapIndex = nextBag.length - 1;
        [nextBag[0], nextBag[swapIndex]] = [nextBag[swapIndex], nextBag[0]];
      }

      targetBagRef.current = nextBag;
    },
    [shuffleInPlace],
  );

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
    if (
      nextBag.length > 1 &&
      lastLetterRef.current &&
      nextBag[0].char === lastLetterRef.current.char
    ) {
      const swapIndex = nextBag.length - 1;
      [nextBag[0], nextBag[swapIndex]] = [nextBag[swapIndex], nextBag[0]];
    }
    letterBagRef.current = nextBag;
  }, [letters, randomInt]);

  const setNextTarget = useCallback(
    (levelIndex: number) => {
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
        promptTimeoutRef.current = setTimeout(
          () => setPromptStage('side'),
          1800,
        );
        successLockRef.current = false;
        stableMatchRef.current = { startAt: null, target: null, count: null };

        if (ttsEnabled) {
          const now = Date.now();
          const shouldSpeak =
            lastSpokenTargetRef.current !== nextLetter.char.charCodeAt(0) ||
            now - lastSpokenAtRef.current > 2000;
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

        if (
          bagKeyRef.current !== nextKey ||
          targetBagRef.current.length === 0
        ) {
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
        promptTimeoutRef.current = setTimeout(
          () => setPromptStage('side'),
          1800,
        );
        successLockRef.current = false;
        stableMatchRef.current = { startAt: null, target: null, count: null };

        if (ttsEnabled) {
          const now = Date.now();
          const shouldSpeak =
            lastSpokenTargetRef.current !== nextTarget ||
            now - lastSpokenAtRef.current > 2000;
          if (shouldSpeak) {
            lastSpokenTargetRef.current = nextTarget;
            lastSpokenAtRef.current = now;
            void speak(prompt);
          }
        }
      }
    },
    [
      gameMode,
      refillTargetBag,
      refillLetterBag,
      speak,
      ttsEnabled,
      letters,
      NUMBER_NAMES,
      DIFFICULTY_LEVELS,
    ],
  );

  useEffect(() => {
    if (!isPlaying) return;
    if (isHandTrackingReady || isModelLoading) return;
    activeMaxHandsRef.current = desiredMaxHands;
    initializeHandTracking();
  }, [
    desiredMaxHands,
    initializeHandTracking,
    isHandTrackingReady,
    isModelLoading,
    isPlaying,
  ]);

  useEffect(() => {
    if (!isPlaying) {
      if (reinitTimerRef.current) {
        clearTimeout(reinitTimerRef.current);
        reinitTimerRef.current = null;
      }
      return;
    }

    if (activeMaxHandsRef.current === desiredMaxHands) return;

    // Reinitialize the model to apply the new max-hands value. The hook's
    // initialize() short-circuits when an instance exists, so we must reset.
    resetHandTracking();
    if (reinitTimerRef.current) clearTimeout(reinitTimerRef.current);
    reinitTimerRef.current = setTimeout(() => {
      activeMaxHandsRef.current = desiredMaxHands;
      initializeHandTracking();
    }, 0);

    return () => {
      if (reinitTimerRef.current) {
        clearTimeout(reinitTimerRef.current);
        reinitTimerRef.current = null;
      }
    };
  }, [desiredMaxHands, initializeHandTracking, isPlaying, resetHandTracking]);

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

  const detectAndDrawRef = useRef<(() => void) | null>(null);

  // Game loop using centralized hook
  useGameLoop({
    isRunning: isPlaying && isHandTrackingReady,
    targetFps: 30,
    onFrame: useCallback(() => {
      detectAndDrawRef.current?.();
    }, []),
  });

  const detectAndDraw = useCallback(() => {
    if (
      !webcamRef.current ||
      !canvasRef.current ||
      !handLandmarker ||
      !isPlaying
    )
      return;

    const video = webcamRef.current.video;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!video || !ctx) return;

    if (
      video.readyState < 2 ||
      video.videoWidth === 0 ||
      video.videoHeight === 0
    ) {
      return;
    }

    if (canvas.width !== video.videoWidth) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
    }

    let results: HandLandmarkerResult | null = null;
    try {
      results = handLandmarker.detectForVideo(video, performance.now());
    } catch (e) {
      return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let totalFingers = 0;
    const perHand: number[] = [];
    let detectedHands = 0;

    const landmarksList = getHandLandmarkLists(results);

    if (landmarksList.length > 0) {
      lastHandsSeenAtRef.current = Date.now();
      detectedHands = landmarksList.length;
      landmarksList.forEach((landmarks: Landmark[], handIndex: number) => {
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

    const lastUi = lastHandsUiRef.current;
    if (lastUi.hands !== detectedHands) {
      lastUi.hands = detectedHands;
      setHandsDetected(detectedHands);
    }

    // For target 0: require a detected hand (closed fist) to avoid "no hands = success".
    // Handle both number mode and letter mode
    const currentTargetNumber =
      gameMode === 'letters' && targetLetter
        ? targetLetter.char.toUpperCase().charCodeAt(0) - 64
        : targetNumber;
    const canSucceedOnZero =
      currentTargetNumber === 0 ? detectedHands > 0 : true;

    const eligibleMatch =
      totalFingers === currentTargetNumber && canSucceedOnZero;

    const nowMs = Date.now();

    // Only reset stable match if we had a match but now don't AND enough time has passed
    // This prevents resetting the stable timer for minor fluctuations during a successful pose
    const stable = stableMatchRef.current;
    if (!eligibleMatch) {
      if (stable.startAt !== null) {
        // If we previously had a match but lost it, allow some tolerance time before resetting
        const timeSinceMatch = nowMs - stable.startAt;
        if (timeSinceMatch > 1000) {
          // Reset after 1 second of not matching
          stableMatchRef.current = { startAt: null, target: null, count: null };
        }
      }
    } else {
      // We have a match
      const same =
        stable.target === currentTargetNumber &&
        stable.count === totalFingers &&
        stable.startAt != null;
      if (!same) {
        // New match - start the timer
        stableMatchRef.current = {
          startAt: nowMs,
          target: currentTargetNumber,
          count: totalFingers,
        };
      } else if (
        !successLockRef.current &&
        nowMs - (stable.startAt ?? nowMs) >= 450
      ) {
        // Success! Match has been stable for required time
        successLockRef.current = true;
        playCelebration(); // Play celebration sound
        setShowCelebration(true);
        setCelebrationValue(
          gameMode === 'letters' && targetLetter
            ? targetLetter.char
            : String(totalFingers),
        );
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
        }, 2500); // Match CelebrationOverlay timing
      }
    }

  }, [
    handLandmarker,
    isPlaying,
    targetNumber,
    countExtendedFingers,
    difficulty,
    setNextTarget,
    gameMode,
    handsDetected,
    targetLetter,
  ]);

  useEffect(() => {
    detectAndDrawRef.current = detectAndDraw;
  }, [detectAndDraw]);

  useEffect(() => {
    return () => {
      if (promptTimeoutRef.current) {
        clearTimeout(promptTimeoutRef.current);
        promptTimeoutRef.current = null;
      }
    };
  }, []);

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

  const goToHome = () => {
    stopGame();
    navigate('/dashboard');
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
      ? targetLetter &&
        currentCount === getLetterNumberValue(targetLetter) &&
        handsDetected > 0
      : targetNumber === 0
        ? currentCount === 0 && handsDetected > 0
        : currentCount === targetNumber;
  const isPromptFeedback =
    feedback.startsWith('Show me ') || feedback.startsWith('Make a fist ');

  // Define game controls for bottom-right positioning
  const gameControls: GameControl[] = [
    {
      id: 'repeat',
      icon: 'play',
      label: 'Repeat',
      onClick: () => {
        if (!ttsEnabled || !ttsAvailable) {
          setFeedback('Voice is not available on this device.');
          return;
        }
        const prompt =
          gameMode === 'letters' && targetLetter
            ? `Show me the letter ${targetLetter.name}!`
            : targetNumber === 0
              ? 'Make a fist for zero.'
              : `Show me ${NUMBER_NAMES[targetNumber]} fingers.`;
        void speak(prompt);
      },
      variant: 'primary',
    },
    {
      id: 'stop',
      icon: 'x',
      label: 'Stop',
      onClick: stopGame,
      variant: 'danger',
    },
  ];

  // Menu screen controls
  const menuControls: GameControl[] = [
    {
      id: 'home',
      icon: 'home',
      label: 'Home',
      onClick: goToHome,
      variant: 'secondary',
    },
  ];

  // Start button is separate since it has loading state
  const startButtonControl: GameControl = {
    id: 'start',
    icon: 'play',
    label: 'Start Game',
    onClick: startGame,
    variant: 'success',
    disabled: isModelLoading,
  };

  return (
    <>
      {!isPlaying ? (
        <FingerNumberShowMenu
          gameMode={gameMode}
          onGameModeChange={setGameMode}
          selectedLanguage={selectedLanguage}
          onLanguageChange={setSelectedLanguage}
          difficulty={difficulty}
          onDifficultyChange={setDifficulty}
          score={score}
          streak={streak}
          isModelLoading={isModelLoading}
          feedback={feedback}
          isPromptFeedback={isPromptFeedback}
          menuControls={menuControls}
          startGame={startButtonControl.onClick}
          languages={LANGUAGES}
          difficultyLevels={DIFFICULTY_LEVELS}
        />
      ) : (
        /* Active Game - Full Screen with GameContainer */
        <GameContainer
          title={
            gameMode === 'letters' ? 'Letter Finger Show' : 'Finger Number Show'
          }
          score={score}
          level={difficulty + 1}
          onHome={goToHome}
        >
          <div className='relative w-full h-full'>
            <Webcam
              ref={webcamRef}
              className='absolute inset-0 w-full h-full object-cover'
              mirrored
              videoConstraints={{ width: 640, height: 480 }}
            />
            <canvas
              ref={canvasRef}
              className='absolute inset-0 w-full h-full'
            />

            <FingerNumberShowHud
              promptStage={promptStage}
              gameMode={gameMode}
              targetNumber={targetNumber}
              targetLetter={targetLetter}
              currentCount={currentCount}
              handsDetected={handsDetected}
              isDetectedMatch={!!isDetectedMatch}
              numberNames={NUMBER_NAMES}
            />

            {/* Standardized Game Controls - Bottom Right */}
            <GameControls controls={gameControls} position='bottom-right' />
          </div>
        </GameContainer>
      )}

      {/* Celebration Overlay */}
      <CelebrationOverlay
        show={showCelebration}
        letter={celebrationValue}
        accuracy={100}
        message={
          gameMode === 'letters'
            ? `You showed ${celebrationValue}!`
            : `Great! ${NUMBER_NAMES[parseInt(celebrationValue) || 0]}!`
        }
        onComplete={() => {
          setShowCelebration(false);
        }}
      />
    </>
  );
});
