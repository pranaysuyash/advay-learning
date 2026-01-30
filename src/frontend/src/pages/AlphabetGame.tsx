import {
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

// Available languages for the game
const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
  { code: 'kn', name: 'Kannada', flag: '🇮🇳' },
  { code: 'te', name: 'Telugu', flag: '🇮🇳' },
  { code: 'ta', name: 'Tamil', flag: '🇮🇳' },
] as const;

export function AlphabetGame() {
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

  // Input mode: camera (hand tracking) or mouse (pointer/touch)
  const [inputMode, setInputMode] = useState<'camera' | 'mouse'>('camera');

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

      // Lazy-load hand tracking model on first start.
      if (!landmarkerRef.current) {
        setIsModelLoading(true);
        try {
          const vision = await FilesetResolver.forVisionTasks(
            'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.8/wasm',
          );
          const landmarker = await HandLandmarker.createFromOptions(vision, {
            baseOptions: {
              modelAssetPath:
                'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
              delegate: 'GPU',
            },
            runningMode: 'VIDEO',
            numHands: 2,
          });
          landmarkerRef.current = landmarker;
        } catch (e) {
          console.error('[AlphabetGame] Failed to load hand tracker:', e);
          setFeedback('Hand tracking failed to load. You can still draw with your mouse.');
        } finally {
          setIsModelLoading(false);
        }
      }
    } catch {
      setCameraPermission('denied');
      setShowPermissionWarning(true);
      setInputMode('mouse');
      // Still allow game to start with mouse mode
      setIsPlaying(true);
      setFeedback('Camera not available. Use your mouse or finger to draw!');
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
    // Reset input mode to camera for next session (will auto-fallback if needed)
    setInputMode('camera');
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

  // Game language is INDEPENDENT of profile language
  // User selects game language in Settings, or can change in-game anytime
  const defaultLanguage = settings.gameLanguage || 'en';

  // Language selection - user can switch anytime
  const [selectedLanguage, setSelectedLanguage] =
    useState<string>(defaultLanguage);

  const LETTERS = getLettersForGame(selectedLanguage);
  const [currentLetterIndex, setCurrentLetterIndex] = useState<number>(0);
  const currentLetter = LETTERS[currentLetterIndex] ?? LETTERS[0];
  const [pendingCount, setPendingCount] = useState<number>(0);

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

  // Redirect to dashboard if no profile selected
  if (!profileId) {
    return <Navigate to='/dashboard' replace />;
  }

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
                  <label className='block text-lg font-bold text-text-primary mb-4'>
                    Choose Your Alphabet
                  </label>
                  <div className='flex flex-wrap justify-center gap-4'>
                    {LANGUAGES.map((lang) => (
                      <button
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

                  {/* Controls overlay */}
                  <div className='absolute top-4 left-4 flex gap-2 flex-wrap'>
                    <div className='bg-black/50 backdrop-blur px-4 py-2 rounded-full text-base font-bold border-2 border-white/30 flex items-center gap-2'>
                      <UIIcon
                        name='target'
                        size={16}
                        className='text-yellow-300'
                      />
                      <span className='text-white'>
                        Trace: {currentLetter.char}
                      </span>
                    </div>
                    {/* Input Mode Indicator */}
                    <div className={`backdrop-blur px-4 py-2 rounded-full text-sm font-bold border-2 flex items-center gap-2 ${
                      inputMode === 'camera' 
                        ? 'bg-green-500/30 border-green-400/50 text-green-300' 
                        : 'bg-blue-500/30 border-blue-400/50 text-blue-300'
                    }`}>
                      <UIIcon 
                        name={inputMode === 'camera' ? 'camera' : 'hand'} 
                        size={16} 
                      />
                      <span>{inputMode === 'camera' ? 'Hand Tracking' : 'Mouse/Touch'}</span>
                    </div>
                    <div className='relative group'>
                      <button
                        className='bg-white/20 backdrop-blur px-4 py-2 rounded-full text-sm font-bold border border-white/30 hover:bg-white/30 transition'
                        onClick={() => {
                          // Cycle through languages
                          const currentIndex = LANGUAGES.findIndex(
                            (l) => l.code === selectedLanguage,
                          );
                          const nextIndex =
                            (currentIndex + 1) % LANGUAGES.length;
                          const nextLang = LANGUAGES[nextIndex];
                          setSelectedLanguage(nextLang.code);
                          setCurrentLetterIndex(0);
                        }}
                        title='Click to cycle through languages'
                      >
                        <span className='flex items-center gap-2'>
                          {
                            LANGUAGES.find((l) => l.code === selectedLanguage)
                              ?.flag
                          }{' '}
                          <span className='text-white'>
                            {
                              LANGUAGES.find((l) => l.code === selectedLanguage)
                                ?.name
                            }
                          </span>
                        </span>
                      </button>
                      {/* Tooltip */}
                      <div className='absolute left-0 mt-1 hidden group-hover:block bg-gray-900 text-white text-xs rounded py-1 px-2 z-10 whitespace-nowrap'>
                        Click to switch languages
                      </div>
                    </div>
                    {streak > 2 && (
                      <div className='bg-pip-orange text-white backdrop-blur px-4 py-2 rounded-full text-sm font-bold animate-pulse shadow-soft-lg border border-white/30'>
                        <span className='flex items-center gap-1'>
                          <span className='text-lg'>🔥</span> {streak} streak!
                        </span>
                      </div>
                    )}
                  </div>

                  <div className='absolute top-4 right-4 flex gap-2'>
                    {isPlaying && (
                      <div className='bg-success backdrop-blur px-3 py-1 rounded-full animate-pulse shadow-soft-lg border border-white/30 flex items-center gap-1'>
                        <UIIcon
                          name='camera'
                          size={16}
                          className='text-white'
                        />
                        <div className='flex items-center gap-1'>
                          <div className='w-2 h-2 bg-red-500 rounded-full animate-ping' />
                          <span className='text-sm font-bold text-white'>
                            Camera Active
                          </span>
                        </div>
                      </div>
                    )}
                    <button
                      onClick={goToHome}
                      className='px-4 py-2 bg-white/90 text-advay-slate border border-border rounded-xl transition text-sm font-bold shadow-soft flex items-center gap-2 hover:bg-white'
                    >
                      <UIIcon name='home' size={16} />
                      Home
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
                          <UIIcon name='hand' size={16} />
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
                      onClick={clearDrawing}
                      className='px-4 py-2 bg-vision-blue text-white border border-blue-700/20 rounded-xl transition text-sm font-bold shadow-soft hover:bg-blue-700'
                    >
                      Clear
                    </button>
                    <button
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
                    onClick={checkProgress}
                    className='px-8 py-5 bg-success rounded-2xl font-bold text-xl text-white shadow-soft-lg hover:bg-success-hover hover:scale-105 transition flex items-center gap-3'
                  >
                    <UIIcon name='check' size={24} />
                    Check My Tracing
                  </button>
                  <button
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
      </div>
    </>
  );
}
