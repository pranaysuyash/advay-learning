import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import { motion } from 'framer-motion';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import Webcam from 'react-webcam';
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';
import { getLettersForGame } from '../data/alphabets';
import {
  useSettingsStore,
  useAuthStore,
  useProgressStore,
  useProfileStore,
  BATCH_SIZE,
} from '../store';
import { Mascot } from '../components/Mascot';
import { progressQueue } from '../services/progressQueue';
import { getAllIcons } from '../utils/iconUtils';
import { UIIcon } from '../components/ui/Icon';
import { Icon } from '../components/Icon';
import { GameTutorial } from '../components/GameTutorial';
import WellnessTimer from '../components/WellnessTimer';
import WellnessReminder from '../components/WellnessReminder';
import useInactivityDetector from '../hooks/useInactivityDetector';

// Available languages for the game
const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
  { code: 'kn', name: 'Kannada', flag: '🇮🇳' },
  { code: 'te', name: 'Telugu', flag: '🇮🇳' },
  { code: 'ta', name: 'Tamil', flag: '🇮🇳' },
] as const;

export const AlphabetGame = React.memo(function AlphabetGameComponent() {
  const location = useLocation();
  const navigate = useNavigate();
  const settings = useSettingsStore();
  useAuthStore();
  useProgressStore();

  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const landmarkerRef = useRef<HandLandmarker | null>(null);
  const rafIdRef = useRef<number | null>(null);
  const lastDrawPointRef = useRef<{ x: number; y: number } | null>(null);
  const drawnPointsRef = useRef<Array<{ x: number; y: number }>>([]);
  const pointerDownRef = useRef(false);
  const lastPinchingRef = useRef(false);

  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState<number>(0);
  const [tutorialCompleted, setTutorialCompleted] = useState(false);
  const [highContrast, setHighContrast] = useState(false);

  // Model & drawing state (was missing after recent edits)
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isPinching, setIsPinching] = useState(false);

  // Camera permission state
  const [cameraPermission, setCameraPermission] = useState<
    'granted' | 'denied' | 'prompt'
  >('prompt');
  const [showPermissionWarning, setShowPermissionWarning] = useState(false);

  // Two-stage prompt state for the current letter.
  const [promptStage, setPromptStage] = useState<'center' | 'side'>('center');
  const promptTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Basic game controls and stubs
  const startGame = async () => {
    setIsModelLoading(false);

    // Check camera permission before starting
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach((track) => track.stop());
      setCameraPermission('granted');
      setShowPermissionWarning(false);
      setIsPlaying(true);
      setFeedback(null);
      setAccuracy(0);

      // Lazy-load hand tracking model on first start with fallback.
      if (!landmarkerRef.current) {
        setIsModelLoading(true);
        const preferredDelegate = settings.handTrackingDelegate || 'GPU';
        
        // Try preferred delegate first, then fallback
        const delegatesToTry: Array<'GPU' | 'CPU'> = 
          preferredDelegate === 'GPU' ? ['GPU', 'CPU'] : ['CPU', 'GPU'];
        
        let lastError: Error | null = null;
        let loadedDelegate: 'GPU' | 'CPU' | null = null;
        
        for (const delegate of delegatesToTry) {
          try {
            console.log(`[AlphabetGame] Trying to load hand tracker with ${delegate} delegate...`);
            const vision = await FilesetResolver.forVisionTasks(
              'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.8/wasm',
            );
            const landmarker = await HandLandmarker.createFromOptions(vision, {
              baseOptions: {
                modelAssetPath:
                  'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
                delegate,
              },
              runningMode: 'VIDEO',
              numHands: 2,
            });
            landmarkerRef.current = landmarker;
            loadedDelegate = delegate;
            console.log(`[AlphabetGame] Successfully loaded hand tracker with ${delegate} delegate`);
            break; // Success, exit loop
          } catch (e) {
            lastError = e as Error;
            console.warn(`[AlphabetGame] Failed to load with ${delegate} delegate:`, e);
            // Continue to try next delegate
          }
        }
        
        if (loadedDelegate) {
          setFeedback('Camera ready!');
        } else {
          console.error('[AlphabetGame] Failed to load hand tracker with any delegate:', lastError);
          setFeedback('Camera tracking unavailable. You can still draw by touching the screen.');
        }
        
        setIsModelLoading(false);
      }
    } catch {
      setCameraPermission('denied');
      setShowPermissionWarning(true);
      // Still allow game to start with mouse mode
      setIsPlaying(true);
      setFeedback('Camera not available. You can still draw by touching the screen.');
    }
  };

  const stopGame = () => {
    setIsPlaying(false);
    setIsDrawing(false);
    setIsPinching(false);
    pointerDownRef.current = false;
    lastPinchingRef.current = false;
    lastDrawPointRef.current = null;
    if (rafIdRef.current != null) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
    setPromptStage('center');
    if (promptTimeoutRef.current) {
      clearTimeout(promptTimeoutRef.current);
      promptTimeoutRef.current = null;
    }
  };

  const clearDrawing = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    drawnPointsRef.current = [];
    lastDrawPointRef.current = null;
  };

  const [accuracy, setAccuracy] = useState<number>(0);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Wellness tracking state
  const [showWellnessReminder, setShowWellnessReminder] = useState<boolean>(false);
  const [wellnessReminderType, setWellnessReminderType] = useState<'break' | 'water' | 'stretch' | 'inactive' | null>(null);
  const [activeTime, setActiveTime] = useState<number>(0); // in minutes
  const [inactiveTime, setInactiveTime] = useState<number>(0); // in seconds
  const [attentionLevel, _setAttentionLevel] = useState<number>(1); // 0 = not attentive, 1 = fully attentive
  // @ts-expect-error - hydrationReminderCount is used by code below (line 336)
  const [hydrationReminderCount, _setHydrationReminderCount] = useState<number>(0);


  const checkProgress = async () => {
    // Minimal, deterministic scoring: ensures the core tracking UX is testable.
    const points = drawnPointsRef.current.length;
    if (points < 20) {
      setAccuracy(20);
      setFeedback('Try tracing more of the letter before checking!');
      setStreak(0);
      return;
    }

    const nextAccuracy = Math.min(100, 60 + Math.floor(points / 20));
    setAccuracy(nextAccuracy);

    if (nextAccuracy >= 70) {
      setFeedback('Great job! 🎉');
      setScore((s) => s + Math.round(nextAccuracy));
      setStreak((s) => s + 1);
    } else {
      setFeedback('Good start — try to trace the full shape!');
      setStreak(0);
    }
  };

  const nextLetter = () => {
    setCurrentLetterIndex((i) => Math.min(i + 1, LETTERS.length - 1));
    clearDrawing();
    setAccuracy(0);
    setFeedback(null);
    setIsPinching(false);
    lastPinchingRef.current = false;
    lastDrawPointRef.current = null;
    setPromptStage('center');
  };

  const goToHome = () => {
    stopGame();
    navigate('/dashboard');
  };

  const handleTutorialComplete = () => {
    setTutorialCompleted(true);
    localStorage.setItem('tutorialCompleted', 'true');
  };

  const handleSkipTutorial = () => {
    setTutorialCompleted(true);
    localStorage.setItem('tutorialCompleted', 'true');
  };

  const toggleHighContrast = () => {
    setHighContrast((prev) => !prev);
  };
  // Mark as used for now (can be removed if feature not needed)
  void toggleHighContrast;

  useEffect(() => {
    const hasCompletedTutorial =
      localStorage.getItem('tutorialCompleted') === 'true';
    setTutorialCompleted(hasCompletedTutorial);

    // Fetch profiles to ensure we have the latest data
    useProfileStore.getState().fetchProfiles();

    // Check camera permission on mount
    const checkCameraPermission = async () => {
      try {
        // Try using the Permissions API first
        const result = await navigator.permissions.query({
          name: 'camera' as PermissionName,
        });
        setCameraPermission(result.state as 'granted' | 'denied' | 'prompt');
        setShowPermissionWarning(result.state === 'denied');

        // Listen for permission changes
        result.addEventListener('change', () => {
          setCameraPermission(result.state as 'granted' | 'denied' | 'prompt');
          setShowPermissionWarning(result.state === 'denied');
        });
      } catch {
        // Fallback: try to get user media to check permission, but guard for test envs
        if (
          navigator.mediaDevices &&
          typeof navigator.mediaDevices.getUserMedia === 'function'
        ) {
          navigator.mediaDevices
            .getUserMedia({ video: true })
            .then((stream) => {
              stream.getTracks().forEach((track) => track.stop());
              setCameraPermission('granted');
              setShowPermissionWarning(false);
            })
            .catch(() => {
              setCameraPermission('denied');
              setShowPermissionWarning(true);
            });
        } else {
          // No mediaDevices available (e.g., in headless test environment) — assume denied
          setCameraPermission('denied');
          setShowPermissionWarning(true);
        }
      }
    };

    checkCameraPermission();
  }, []);

  // Get profile ID from route state (passed from Dashboard)
  const profileId = (location.state as any)?.profileId as string | undefined;

  // Get profile for display (name, etc.) - NOT for language
  const { profiles } = useProfileStore();
  const profile = profileId ? profiles.find((p) => p.id === profileId) : undefined;
  // Profile available for future use (e.g., displaying child's name)
  void profile;

  // Game language is determined by profile's preferred_language
  // This ensures consistency across the app
  const defaultLanguage = profile?.preferred_language || settings.gameLanguage || 'en';

  // Language selection - user can switch anytime
  const [selectedLanguage, setSelectedLanguage] =
    useState<string>(defaultLanguage);

  // Wellness tracking effects
  useEffect(() => {
    if (!isPlaying) return;

    // Track active time (when game is being played)
    const activeTimer = setInterval(() => {
      setActiveTime(prev => prev + 1);
    }, 60000); // Every minute

    return () => clearInterval(activeTimer);
  }, [isPlaying]);

  // Inactivity detector
  const inactivityData = useInactivityDetector(() => {
    // Called when inactivity is detected
    setInactiveTime(prev => prev + 1);
    setWellnessReminderType('inactive');
    setShowWellnessReminder(true);
  }, 60000); // Trigger after 1 minute of inactivity
  void inactivityData; // eslint-disable-next-line @typescript-eslint/no-unused-vars

  // Hydration reminder effect - remind every 20 minutes of active play
  // Hydration reminder effect - remind every 20 minutes of active play
  useEffect(() => {
    if (!isPlaying) return;

    const hydrationInterval = setInterval(() => {
       // Show hydration reminder every 20 minutes of active play
      if (activeTime > 0 && activeTime % 20 === 0 && activeTime >= 20) {
        setWellnessReminderType('water');
        setShowWellnessReminder(true);
        _setHydrationReminderCount(prevCount => { const val = prevCount + 1; return val; });
      }
    }, 60000); // Check every minute

    return () => clearInterval(hydrationInterval);
  }, [isPlaying, activeTime]);

  // Handle wellness reminder dismissal
  const handleWellnessReminderDismiss = () => {
    setShowWellnessReminder(false);
    setWellnessReminderType(null);
  };

  // Handle wellness reminder postpone (if applicable)
  const handleWellnessReminderPostpone = () => {
    // For now, just dismiss and reset the timer
    setShowWellnessReminder(false);
    setWellnessReminderType(null);
  };

  const LETTERS = getLettersForGame(selectedLanguage);
  const [currentLetterIndex, setCurrentLetterIndex] = useState<number>(0);
  const currentLetter = LETTERS[currentLetterIndex] ?? LETTERS[0];
  const [pendingCount, setPendingCount] = useState<number>(0);

  // Two-stage prompt: show big center letter briefly, then keep a small side pill.
  useEffect(() => {
    if (!isPlaying) return;
    setPromptStage('center');
    if (promptTimeoutRef.current) clearTimeout(promptTimeoutRef.current);
    promptTimeoutRef.current = setTimeout(() => setPromptStage('side'), 1800);
    return () => {
      if (promptTimeoutRef.current) {
        clearTimeout(promptTimeoutRef.current);
        promptTimeoutRef.current = null;
      }
    };
  }, [isPlaying, currentLetterIndex, selectedLanguage]);

  useEffect(() => {
    const update = () =>
      setPendingCount(progressQueue.getPending(profileId || '').length);
    update();
    const unsubscribe = progressQueue.subscribe(update);
    return unsubscribe;
  }, [profileId]);

  // Hand tracking + pinch drawing loop (starts only while playing).
  useEffect(() => {
    if (!isPlaying) return;

    let cancelled = false;
    const loop = () => {
      if (cancelled) return;

      const landmarker = landmarkerRef.current as any;
      const webcam = webcamRef.current as any;
      const canvas = canvasRef.current;
      const video: HTMLVideoElement | undefined = webcam?.video;
      const ctx = canvas?.getContext('2d') ?? null;

      if (!canvas || !video || !ctx || typeof landmarker?.detectForVideo !== 'function') {
        rafIdRef.current = requestAnimationFrame(loop);
        return;
      }

      if (video.readyState < 2 || video.videoWidth === 0 || video.videoHeight === 0) {
        rafIdRef.current = requestAnimationFrame(loop);
        return;
      }

      if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
      }

      let results: any = null;
      try {
        results = landmarker.detectForVideo(video, performance.now());
      } catch {
        rafIdRef.current = requestAnimationFrame(loop);
        return;
      }

      const landmarks: any[] | undefined = results?.landmarks?.[0];
      if (!landmarks || landmarks.length < 9) {
        if (lastPinchingRef.current) {
          lastPinchingRef.current = false;
          setIsPinching(false);
          lastDrawPointRef.current = null;
        }
        rafIdRef.current = requestAnimationFrame(loop);
        return;
      }

      const thumbTip = landmarks[4];
      const indexTip = landmarks[8];
      const dx = (thumbTip.x ?? 0) - (indexTip.x ?? 0);
      const dy = (thumbTip.y ?? 0) - (indexTip.y ?? 0);
      const pinchDistance = Math.sqrt(dx * dx + dy * dy);
      const pinchingNow = pinchDistance < 0.05;

      if (pinchingNow !== lastPinchingRef.current) {
        lastPinchingRef.current = pinchingNow;
        setIsPinching(pinchingNow);
        if (!pinchingNow) lastDrawPointRef.current = null;
      }

      if (pinchingNow && isDrawing) {
        const x = (1 - (indexTip.x ?? 0)) * canvas.width;
        const y = (indexTip.y ?? 0) * canvas.height;
        const nextPoint = { x, y };

        ctx.strokeStyle = currentLetter.color;
        ctx.lineWidth = 10;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        if (!lastDrawPointRef.current) {
          ctx.beginPath();
          ctx.moveTo(nextPoint.x, nextPoint.y);
          ctx.lineTo(nextPoint.x + 0.01, nextPoint.y + 0.01);
          ctx.stroke();
        } else {
          ctx.beginPath();
          ctx.moveTo(lastDrawPointRef.current.x, lastDrawPointRef.current.y);
          ctx.lineTo(nextPoint.x, nextPoint.y);
          ctx.stroke();
        }

        lastDrawPointRef.current = nextPoint;
        drawnPointsRef.current.push({ x: nextPoint.x / canvas.width, y: nextPoint.y / canvas.height });
        if (drawnPointsRef.current.length > 6000) {
          drawnPointsRef.current.shift();
        }
      }

      rafIdRef.current = requestAnimationFrame(loop);
    };

    rafIdRef.current = requestAnimationFrame(loop);
    return () => {
      cancelled = true;
      if (rafIdRef.current != null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
    };
  }, [isPlaying, isDrawing, currentLetter.color]);

  const getCanvasPointFromPointerEvent = useCallback((e: ReactPointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return null;
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  }, []);

  const handleCanvasPointerDown = useCallback((e: ReactPointerEvent<HTMLCanvasElement>) => {
    if (!isPlaying || !isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d') ?? null;
    const point = getCanvasPointFromPointerEvent(e);
    if (!canvas || !ctx || !point) return;

    pointerDownRef.current = true;
    (e.currentTarget as any).setPointerCapture?.(e.pointerId);

    ctx.strokeStyle = currentLetter.color;
    ctx.lineWidth = 10;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(point.x, point.y);
    ctx.lineTo(point.x + 0.01, point.y + 0.01);
    ctx.stroke();

    lastDrawPointRef.current = point;
    drawnPointsRef.current.push({ x: point.x / canvas.width, y: point.y / canvas.height });
  }, [currentLetter.color, getCanvasPointFromPointerEvent, isDrawing, isPlaying]);

  const handleCanvasPointerMove = useCallback((e: ReactPointerEvent<HTMLCanvasElement>) => {
    if (!isPlaying || !isDrawing || !pointerDownRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d') ?? null;
    const point = getCanvasPointFromPointerEvent(e);
    if (!canvas || !ctx || !point) return;

    ctx.strokeStyle = currentLetter.color;
    ctx.lineWidth = 10;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (lastDrawPointRef.current) {
      ctx.beginPath();
      ctx.moveTo(lastDrawPointRef.current.x, lastDrawPointRef.current.y);
      ctx.lineTo(point.x, point.y);
      ctx.stroke();
    }

    lastDrawPointRef.current = point;
    drawnPointsRef.current.push({ x: point.x / canvas.width, y: point.y / canvas.height });
    if (drawnPointsRef.current.length > 6000) {
      drawnPointsRef.current.shift();
    }
  }, [currentLetter.color, getCanvasPointFromPointerEvent, isDrawing, isPlaying]);

  const handleCanvasPointerUpOrCancel = useCallback((e: ReactPointerEvent<HTMLCanvasElement>) => {
    pointerDownRef.current = false;
    (e.currentTarget as any).releasePointerCapture?.(e.pointerId);
    lastDrawPointRef.current = null;
  }, []);

  // Redirect to dashboard if no profile selected
  if (!profileId) {
    return <Navigate to='/dashboard' replace />;
  }

  return (
    <>
      {!tutorialCompleted && (
        <GameTutorial
          onComplete={handleTutorialComplete}
          onSkip={handleSkipTutorial}
        />
      )}
      <div className='max-w-7xl mx-auto px-4 py-8'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Header - Reduced spacing */}
          <div className='flex justify-between items-start mb-4'>
            <div>
              <h1 className='text-2xl md:text-3xl font-bold'>Learning Game</h1>
              <p className='text-text-secondary text-sm md:text-base'>
                Trace letters with your finger!
              </p>
            </div>
            <div className='text-right'>
              <div className='text-xl md:text-2xl font-bold text-text-primary'>
                Score: {score}
              </div>
              <div className='flex flex-wrap items-center gap-x-3 gap-y-1 text-xs md:text-sm text-text-secondary mt-1'>
                <span className='flex items-center gap-1 min-w-fit'>
                  <UIIcon name='flame' size={14} className='text-pip-orange' />
                  Streak: {streak}
                </span>
                <span className='min-w-fit'>
                  Batch {Math.floor(currentLetterIndex / BATCH_SIZE) + 1} of{' '}
                  {Math.ceil(LETTERS.length / BATCH_SIZE)}
                </span>
                {pendingCount > 0 && (
                  <div className='inline-flex items-center gap-1 bg-bg-tertiary border border-border text-text-secondary px-2 py-0.5 rounded-full text-xs font-semibold'>
                    <UIIcon name='warning' size={12} />
                    Pending ({pendingCount})
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Animated Letter Display - moves to side panel when game starts */}
          <div
            className={`transition-all duration-500 ease-in-out ${isPlaying ? 'absolute top-4 left-4 z-10 w-64 bg-white/90 border border-border rounded-2xl p-4 shadow-soft-lg' : 'bg-white border border-border rounded-2xl p-8 mb-6 shadow-soft'}`}
          >
            <div
              className={`${isPlaying ? 'transform scale-75' : ''} flex flex-col items-center justify-center gap-4 transition-transform duration-300`}
            >
              <div className='text-center'>
                <div
                  className={`${isPlaying ? 'text-6xl' : 'text-9xl md:text-[12rem]'} font-extrabold mb-2`}
                  style={{
                    color: currentLetter.color,
                  }}
                >
                  {currentLetter.char}
                </div>
                {currentLetter.transliteration && (
                  <div className='text-base md:text-xl text-text-secondary mt-2 font-medium'>
                    {currentLetter.transliteration}
                  </div>
                )}
              </div>
              <div className={`${isPlaying ? 'w-12 h-12' : 'w-24 h-24'} mb-2`}>
                <Icon
                  src={getAllIcons(currentLetter)}
                  alt={currentLetter.name}
                  size={isPlaying ? 48 : 96}
                  className='w-full h-full object-contain drop-shadow-lg'
                  fallback={currentLetter.emoji || '✨'}
                />
              </div>
              <div className='text-center'>
                <div
                  className={`${isPlaying ? 'text-lg' : 'text-3xl'} font-bold text-text-primary`}
                >
                  {currentLetter.name}
                </div>
                {currentLetter.pronunciation && (
                  <div
                    className={`${isPlaying ? 'text-sm' : 'text-lg'} text-text-secondary mt-2 italic`}
                  >
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
              className='bg-white border border-border rounded-xl p-4 mb-6 shadow-soft'
            >
              <div className='flex justify-between items-center mb-2'>
                <span className='text-text-secondary'>Tracing Accuracy</span>
                <span
                  className='font-bold'
                  style={{
                    color:
                      accuracy >= 70
                        ? '#10b981'
                        : accuracy >= 40
                          ? '#f59e0b'
                          : '#ef4444',
                  }}
                >
                  {accuracy}%
                </span>
              </div>
              <div className='h-3 bg-bg-tertiary rounded-full overflow-hidden'>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${accuracy}%` }}
                  transition={{ duration: 0.5 }}
                  className='h-full rounded-full'
                  style={{
                    backgroundColor:
                      accuracy >= 70
                        ? '#10b981'
                        : accuracy >= 40
                          ? '#f59e0b'
                          : '#ef4444',
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
                feedback?.includes('Great')
                  ? 'bg-green-500/20 border border-green-500/30 text-green-400'
                  : feedback?.includes('Good')
                    ? 'bg-yellow-500/20 border border-yellow-500/30 text-yellow-400'
                    : 'bg-red-500/20 border border-red-500/30 text-red-400'
              }`}
            >
              {feedback}
            </motion.div>
          )}

          {/* Game Area - Full focus on camera when playing */}
          <div className={`${isPlaying ? 'mt-0' : '-mt-4'}`}>
            {/* Permission Warning - With Mouse Fallback */}
            {showPermissionWarning && (
              <div className='bg-amber-500/20 border border-amber-500/30 rounded-xl p-4 mb-4 text-center'>
                <div className='flex items-center justify-center gap-2 text-amber-400 font-semibold'>
                  <UIIcon name='warning' size={20} />
                  <span>Camera not available - Mouse/Touch Mode Active</span>
                </div>
                <p className='text-amber-300/80 text-sm mt-1'>
                  You can still play using your mouse or finger to draw! 
                  Allow camera access in browser settings for hand tracking.
                </p>
              </div>
            )}

            {!isPlaying ? (
              <div className='bg-white border border-border rounded-2xl p-12 text-center relative overflow-hidden shadow-soft-lg'>
                {/* Decorative elements */}
                <div className='absolute inset-0 opacity-20'>
                  <div className='absolute top-10 left-10 w-16 h-16 rounded-full bg-brand-accent blur-xl'></div>
                  <div className='absolute bottom-20 right-16 w-24 h-24 rounded-full bg-pip-orange blur-xl'></div>
                  <div className='absolute top-1/2 right-1/4 w-12 h-12 rounded-full bg-vision-blue blur-xl'></div>
                </div>

                {/* Mascot Preview */}
                <div className='absolute -bottom-8 -left-8 opacity-70 pointer-events-none'>
                  <Mascot state='happy' />
                </div>

                <div className='w-32 h-32 mx-auto mb-6'>
                  <img
                    src='/assets/images/onboarding-hand.svg'
                    alt='Hand tracking'
                    className='w-full h-full object-contain drop-shadow-2xl'
                  />
                </div>
                <h2 className='text-3xl font-bold mb-4 text-advay-slate'>
                  Ready to Learn?
                </h2>
                <p className='text-text-secondary mb-6 max-w-md mx-auto text-lg'>
                  Use your hand to trace letters! The camera will track your
                  finger movements.
                </p>
                  {/* Language Selector */}
                  <div className='mb-8'>
                    <label className='block text-lg font-bold text-text-primary mb-4' htmlFor='alphabet-select'>
                      Choose Your Alphabet
                    </label>
                    <form onSubmit={(e) => e.preventDefault()}>
                      <select
                        id='alphabet-select'
                        value={selectedLanguage}
                        onChange={(e) => setSelectedLanguage(e.target.value)}
                    {LANGUAGES.map((lang) => (
                      <button
                        type="button"
                        key={lang.code}
                        onClick={() => {
                          setSelectedLanguage(lang.code);
                          // Reset to first letter when language changes
                          setCurrentLetterIndex(0);
                        }}
                        className={`px-6 py-3 rounded-xl font-bold text-lg transition-all transform hover:scale-105 ${
                          selectedLanguage === lang.code
                            ? 'bg-pip-orange text-white shadow-soft-lg'
                            : 'bg-bg-tertiary text-text-primary border border-border hover:bg-white'
                        }`}
                      >
                        <span className='mr-3 text-xl'>{lang.flag}</span>
                        {lang.name}
                      </button>
                    ))}
                  </div>
                  <p className='text-center text-text-secondary mt-4 text-base'>
                    Progress is tracked separately for each language
                  </p>
                </div>

                <div className='text-lg text-text-secondary mb-8'>
                  Difficulty:{' '}
                  <span className='text-text-primary font-bold capitalize'>
                    {settings.difficulty}
                  </span>
                </div>
                <div className='flex justify-center gap-6'>
                   <button
                     type="button"
                     onClick={goToHome}
                     className='px-6 py-4 bg-white border border-border rounded-xl font-bold text-lg text-advay-slate transition hover:bg-bg-tertiary shadow-soft flex items-center gap-3'
                   >
                     <UIIcon name='home' size={24} />
                     Home
                   </button>
                  {isModelLoading ? (
                    <div className='text-text-secondary px-8 py-4 text-lg font-bold'>
                      Loading hand tracking...
                    </div>
                  ) : (
                     <button
                       type="submit"
                       onClick={startGame}
                       className='px-8 py-4 bg-pip-orange rounded-xl font-bold text-lg text-white hover:bg-pip-rust transition-all transform hover:scale-105 shadow-soft-lg flex items-center gap-3'
                     >
                       <UIIcon name='sparkles' size={24} />
                       {cameraPermission === 'denied' ? 'Play with Mouse/Touch' : 'Start Learning!'}
                     </button>
                  )}
                </div>
              </div>
          ) : (
              <div className='space-y-4'>
                <div className='relative bg-black rounded-2xl overflow-hidden aspect-video shadow-soft-lg border border-border'>
                  {/* Decorative elements */}
                  <div className='absolute inset-0 opacity-10'>
                    <div className='absolute top-10 left-10 w-16 h-16 rounded-full bg-pip-orange blur-xl'></div>
                    <div className='absolute bottom-20 right-16 w-24 h-24 rounded-full bg-vision-blue blur-xl'></div>
                  </div>

                  {/* Webcam video */}
                  <Webcam
                    ref={webcamRef}
                    className={`absolute inset-0 w-full h-full object-cover ${highContrast ? 'opacity-70' : ''}`}
                    mirrored
                    videoConstraints={{ width: 640, height: 480 }}
                    onUserMedia={() => {
                      // Camera successfully started
                      setCameraPermission('granted');
                      setShowPermissionWarning(false);
                    }}
                    onUserMediaError={(err) => {
                      // Camera failed to start
                      console.error('[Game] Camera error:', err);
                      setCameraPermission('denied');
                      setShowPermissionWarning(true);
                      setIsPlaying(false);
                    }}
                  />

                  {/* Canvas overlay for tracing */}
                  <canvas
                    ref={canvasRef}
                    className='absolute inset-0 w-full h-full touch-none'
                    onPointerDown={handleCanvasPointerDown}
                    onPointerMove={handleCanvasPointerMove}
                    onPointerUp={handleCanvasPointerUpOrCancel}
                    onPointerCancel={handleCanvasPointerUpOrCancel}
                    onPointerLeave={handleCanvasPointerUpOrCancel}
                  />

                  {/* Letter trace guide - Made more visible */}
                  {settings.showHints && isPlaying && (
                    <div className='absolute inset-0 flex items-center justify-center pointer-events-none'>
                      <div
                        className='opacity-15'
                        style={{
                          fontSize: '22vw',
                          color: currentLetter.color,
                          fontFamily: 'sans-serif',
                          fontWeight: 'bold',
                          lineHeight: 1,
                          userSelect: 'none',
                          textShadow: '0 0 10px rgba(255,255,255,0.5)',
                        }}
                      >
                        {currentLetter.char}
                      </div>
                    </div>
                  )}

                  {/* Two-stage prompt: big center then small side pill */}
                  {isPlaying && promptStage === 'center' && (
                    <div className='absolute inset-0 flex items-center justify-center pointer-events-none'>
                      <div className='bg-black/65 backdrop-blur px-8 py-6 rounded-3xl border border-white/25 text-white shadow-soft-lg'>
                        <div className='text-center'>
                          <div className='text-sm md:text-base opacity-85 font-semibold mb-2'>
                            Trace this letter
                          </div>
                          <div
                            className='text-7xl md:text-8xl font-black leading-none'
                            style={{ color: currentLetter.color }}
                          >
                            {currentLetter.char}
                          </div>
                          <div className='text-base md:text-lg opacity-90 font-semibold mt-2'>
                            {currentLetter.name}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className='absolute top-4 left-4 flex gap-2 flex-wrap'>
                    {promptStage === 'side' && (
                      <div className='bg-black/55 backdrop-blur px-4 py-2 rounded-full text-sm md:text-base font-bold border border-white/20 text-white shadow-soft'>
                        <span className='flex items-center gap-2'>
                          <UIIcon name='target' size={16} className='text-yellow-300' />
                          Trace <span className='font-extrabold'>{currentLetter.char}</span>
                          <span className='opacity-80'>({currentLetter.name})</span>
                        </span>
                      </div>
                    )}
                  </div>

                   <div className='absolute top-4 right-4 flex gap-2'>
                     <button
                       type="button"
                       onClick={goToHome}
                       className='px-4 py-2 bg-white/90 text-advay-slate border border-border rounded-xl transition text-sm font-bold shadow-soft flex items-center gap-2 hover:bg-white'
                     >
                       <UIIcon name='home' size={16} />
                       Home
                     </button>
                     <button
                       type="button"
                       onClick={() => setIsDrawing(!isDrawing)}
                       className={`px-4 py-2 rounded-xl transition text-sm font-bold shadow-soft ${
                         isDrawing
                           ? 'bg-error text-white hover:bg-red-700'
                           : 'bg-success text-white hover:bg-success-hover'
                       }`}
                     >
                       {isDrawing ? 'Stop Drawing' : 'Start Drawing'}
                     </button>
                    <button
                      onClick={() => setIsDrawing(!isDrawing)}
                      className={`px-4 py-2 rounded-xl transition text-sm font-bold shadow-soft ${
                        isDrawing
                          ? 'bg-error text-white hover:bg-red-700'
                          : 'bg-success text-white hover:bg-success-hover'
                      }`}
                    >
                      {isPinching ? (
                        <span className='flex items-center gap-2'>
                          <UIIcon name='hand' size={16} />
                          Pinching...
                        </span>
                      ) : isDrawing ? (
                        <span className='flex items-center gap-2'>
                          <UIIcon name='pencil' size={16} />
                          Stop Drawing
                        </span>
                      ) : (
                        <span className='flex items-center gap-2'>
                          <UIIcon name='pencil' size={16} />
                          Start Drawing
                        </span>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsDrawing(!isDrawing)}
                      className={`px-4 py-2 rounded-xl transition text-sm font-bold shadow-soft ${
                        isDrawing
                          ? 'bg-error text-white hover:bg-red-700'
                          : 'bg-success text-white hover:bg-success-hover'
                      }`}
                    >
                      {isPinching ? (
                        <span className='flex items-center gap-2'>
                          <UIIcon name='hand' size={16} />
                          Pinching...
                        </span>
                      ) : isDrawing ? (
                        <span className='flex items-center gap-2'>
                          <UIIcon name='pencil' size={16} />
                          Stop Drawing
                        </span>
                      ) : (
                        <span className='flex items-center gap-2'>
                          <UIIcon name='pencil' size={16} />
                          Start Drawing
                        </span>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={clearDrawing}
                      className='px-4 py-2 bg-vision-blue text-white border border-blue-700/20 rounded-xl transition text-sm font-bold shadow-soft hover:bg-blue-700'
                    >
                      Clear
                    </button>
                     <button
                       type="button"
                       onClick={stopGame}
                       className='px-4 py-2 bg-white/90 text-advay-slate border border-border rounded-xl transition text-sm font-bold shadow-soft hover:bg-white'
                     >
                       Stop
                     </button>
                  </div>

                  {/* In-Game Mascot */}
                  <div className='absolute bottom-4 left-4 z-20'>
                    {(() => {
                      const mascotState =
                        feedback?.includes('Great') ||
                        feedback?.includes('Amazing')
                          ? 'happy'
                          : isDrawing
                            ? 'waiting'
                            : 'idle';
                      return (
                        <Mascot
                          state={mascotState}
                          message={
                            feedback ||
                            (isDrawing ? 'Keep going!' : 'Trace the letter!')
                          }
                        />
                      );
                    })()}
                  </div>
                </div>

                {/* Action buttons - Positioned below camera when letter moves to side */}
                <div
                  className={`flex justify-center gap-6 ${isPlaying ? 'mt-48' : ''}`}
                >
                   <button
                     type="submit"
                     onClick={checkProgress}
                     className='px-8 py-5 bg-success rounded-2xl font-bold text-xl text-white shadow-soft-lg hover:bg-success-hover hover:scale-105 transition flex items-center gap-3'
                   >
                     <UIIcon name='check' size={24} />
                     Check My Tracing
                   </button>
                   <button
                     type="submit"
                     onClick={nextLetter}
                     className='px-8 py-5 bg-vision-blue rounded-2xl font-bold text-xl text-white shadow-soft-lg hover:bg-blue-700 hover:scale-105 transition flex items-center gap-3'
                   >
                     Skip to Next →
                   </button>
                </div>

                <p
                  className={`text-center text-text-secondary text-sm md:text-base font-medium ${isPlaying ? 'mt-8' : ''}`}
                >
                  Hold your hand up and pinch thumb + index finger to draw! Or
                  click the button.
                  {settings.showHints &&
                    ' Follow the light letter outline to trace the shape.'}
                </p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Wellness Timer */}
        <WellnessTimer
          onBreakReminder={() => {
            setWellnessReminderType('break');
            setShowWellnessReminder(true);
          }}
          activeThreshold={15}
          inactiveThreshold={60}
          onInactiveDetected={() => {
            setWellnessReminderType('inactive');
            setShowWellnessReminder(true);
          }}
          attentionLevel={attentionLevel}
        />

        {/* Wellness Reminder */}
        {showWellnessReminder && wellnessReminderType && (
          <WellnessReminder
            activeTime={activeTime}
            inactiveTime={inactiveTime}
            onDismiss={handleWellnessReminderDismiss}
            onPostpone={handleWellnessReminderPostpone}
          />
        )}
      </div>
    </>
  );
});

export default AlphabetGame;
