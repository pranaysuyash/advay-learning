/**
 * Draw Letters Game
 * 
 * @ticket GQ-002, GQ-003, GQ-004, GQ-005, GQ-007
 */

import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { GameLayout } from '../components/layout/GameLayout';
import { getLettersForGame } from '../data/alphabets';
import {
  useSettingsStore,
  useAuthStore,
  useProgressStore,
  useProfileStore,
  BATCH_SIZE,
} from '../store';
import type { Profile } from '../store';
import { Mascot } from '../components/Mascot';
import { progressQueue } from '../services/progressQueue';
import { recordProgressActivity } from '../services/progressTracking';
import { getAllIcons } from '../utils/iconUtils';
import { UIIcon } from '../components/ui/Icon';
import { GameContainer } from '../components/GameContainer';
import { GameShell } from '../components/GameShell';
import { AccessDenied } from '../components/ui/AccessDenied';
import { useSubscription } from '../hooks/useSubscription';
import { GlobalErrorBoundary } from '../components/errors/GlobalErrorBoundary';
import { GameControls } from '../components/GameControls';
import type { GameControl } from '../components/GameControls';
import { GameTutorial } from '../components/GameTutorial';
import WellnessTimer from '../components/WellnessTimer';
import WellnessReminder from '../components/WellnessReminder';
import CameraRecoveryModal from '../components/CameraRecoveryModal';
import ExitConfirmationModal from '../components/ExitConfirmationModal';
import { CelebrationOverlay } from '../components/CelebrationOverlay';
import { HandTutorialOverlay } from '../components/game/AnimatedHand';
import { GamePauseModal } from '../components/game/GamePauseModal';
import { LoadingState } from '../components/LoadingState';
import useInactivityDetector from '../hooks/useInactivityDetector';
import { useGameDrops } from '../hooks/useGameDrops';
import { useTTS } from '../hooks/useTTS';
import { usePhonics } from '../hooks/usePhonics';
import { useCameraPermission } from '../hooks/useCameraPermission';
import { useInitialCameraPermission } from '../hooks/useInitialCameraPermission';
import { useAudio } from '../utils/hooks/useAudio';
import { triggerHaptic } from '../utils/haptics';
import { STREAK_MILESTONE_INTERVAL, STREAK_MILESTONE_DURATION_MS } from '../games/constants';
import { LanguageFlag } from '../components/ui/LanguageFlag';
import { WellnessMonitor } from '../components/game/WellnessMonitor';
// Centralized hand tracking hooks
import { useGameHandTracking } from '../hooks/useGameHandTracking';
import type { HandTrackingRuntimeMeta } from '../hooks/useHandTrackingRuntime';
import {
  buildSegments,
  drawSegments,
  setupCanvas,
  drawLetterHint,
  addBreakPoint,
  shouldAddPoint,
} from '../utils/drawing';
import { detectPinch, createDefaultPinchState } from '../utils/pinchDetection';
import type { PinchState, Point } from '../types/tracking';
import type { TrackedHandFrame } from '../utils/handTrackingFrame';
import {
  ACCURACY_POINT_DIVISOR,
  ACCURACY_SUCCESS_THRESHOLD,
  ALPHABET_GAME_TUTORIAL_KEY,
  BASE_ACCURACY,
  CONFETTI_ORIGIN_Y,
  CONFETTI_PARTICLE_COUNT,
  CONFETTI_SPREAD,
  HAND_TRACKING_CONFIDENCE,
  HYDRATION_REMINDER_MINUTES,
  INACTIVITY_TIMEOUT_MS,
  MAX_ACCURACY,
  MAX_DRAWN_POINTS,
  MIN_DRAW_POINTS_FOR_CHECK,
  MIN_FEEDBACK_ACCURACY,
  POINT_MIN_DISTANCE,
  TIP_SMOOTHING_ALPHA,
  WELLNESS_ACTIVE_THRESHOLD_MINUTES,
  WELLNESS_HYDRATION_THRESHOLD_MINUTES,
  WELLNESS_INTERVAL_MS,
  WELLNESS_SCREEN_TIME_THRESHOLD_MINUTES,
  WELLNESS_STRETCH_THRESHOLD_MINUTES,
} from './alphabet-game/constants';
import {
  clearAlphabetGameSession,
  loadAlphabetGameSession,
  saveAlphabetGameSession,
  warnAlphabetGame,
} from './alphabet-game/sessionPersistence';
import { getAlphabetGameOverlayVisibility } from './alphabet-game/overlayState';

// Available languages for the game
const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'Hindi' },
  { code: 'kn', name: 'Kannada' },
  { code: 'te', name: 'Telugu' },
  { code: 'ta', name: 'Tamil' },
] as const;

const AlphabetGameGame = React.memo(function AlphabetGameComponent() {
  const location = useLocation();
  const navigate = useNavigate();
  const reducedMotion = useReducedMotion();
  void reducedMotion;
  const { canAccessGame, isLoading: subLoading } = useSubscription();
  const hasAccess = canAccessGame('alphabet-tracing');
  const showHints = useSettingsStore((state) => state.showHints);
  const difficulty = useSettingsStore((state) => state.difficulty);
  const gameLanguageSetting = useSettingsStore((state) => state.gameLanguage);
  useAuthStore();
  const markLetterAttempt = useProgressStore(
    (state) => state.markLetterAttempt,
  );

  const [error, setError] = useState<Error | null>(null);

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
    return (
      <AccessDenied gameName='Alphabet Tracing' gameId='alphabet-tracing' />
    );
  }

  // Error state
  if (error) {
    return (
      <GameContainer title='Alphabet Tracing' onHome={() => navigate('/games')}>
        <div className='flex items-center justify-center min-h-screen'>
          <div className='text-center'>
            <h2 className='text-2xl font-bold text-red-600 mb-4'>
              Oops! Something went wrong
            </h2>
            <p className='text-slate-600 mb-4'>{error.message}</p>
            <button
              onClick={() => {
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

  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafIdRef = useRef<number | null>(null);
  const lastDrawPointRef = useRef<{ x: number; y: number } | null>(null);
  const drawnPointsRef = useRef<Array<{ x: number; y: number }>>([]);
  const letterAttemptCountsRef = useRef<Record<string, number>>({});
  const pointerDownRef = useRef(false);
  const pinchStateRef = useRef<PinchState>(createDefaultPinchState());
  const smoothedTipRef = useRef<Point | null>(null);
  const promptTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isHandPresent, setIsHandPresent] = useState(false);
  const isHandPresentRef = useRef(isHandPresent);
  const latestTrackingFrameRef = useRef<TrackedHandFrame | null>(null);

  // Sound effects and phonics hooks
  const {
    playFanfare: playCelebration,
    playPop,
    playError,
    playClick,
  } = useAudio();
  const { speak, isEnabled: ttsEnabled } = useTTS();
  const { onGameComplete } = useGameDrops('alphabet-tracing');
  const { speakWordExample } = usePhonics();

  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState<number>(0);
  const [scorePopup, setScorePopup] = useState<{ points: number } | null>(null);
  const [showStreakMilestone, setShowStreakMilestone] = useState(false);
  const [tutorialCompleted, setTutorialCompleted] = useState(false);
  const [showHandTutorial, setShowHandTutorial] = useState(false);
  const [highContrast, setHighContrast] = useState(false);

  // Drawing state
  const [isDrawing, setIsDrawing] = useState(false);
  const [isPinching, setIsPinching] = useState(false);
  const isDrawingRef = useRef(isDrawing);
  const isPinchingRef = useRef(isPinching);
  useEffect(() => {
    isDrawingRef.current = isDrawing;
  }, [isDrawing]);
  useEffect(() => {
    isPinchingRef.current = isPinching;
  }, [isPinching]);
  useEffect(() => {
    isHandPresentRef.current = isHandPresent;
  }, [isHandPresent]);

  // Camera permission state
  const [cameraPermission, setCameraPermission] = useState<
    'granted' | 'denied' | 'prompt'
  >('prompt');
  const [showPermissionWarning, setShowPermissionWarning] = useState(false);
  const {
    requestPermission: requestCameraPermission,
    error: cameraPermissionError,
  } = useCameraPermission();

  // Pause/Recovery state
  const [isPaused, setIsPaused] = useState(false);
  const [showCameraErrorModal, setShowCameraErrorModal] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [cameraErrorMessage, setCameraErrorMessage] = useState<string>(
    'Camera connection lost',
  );
  const [useMouseMode, setUseMouseMode] = useState(false);

  // Story celebration modal state
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationTitle, setCelebrationTitle] = useState('Hooray!');

  // Session persistence state moved below after core state declarations
  // (moved to avoid referencing variables before they are declared)

  // Single consistent prompt - no more two-stage (was confusing for children)
  const [showLetterPrompt, setShowLetterPrompt] = useState(true);

  // Basic game controls and stubs
  const startGame = async () => {
    // Auto-enable drawing mode when game starts for better UX
    setIsDrawing(true);

    // Check camera permission before starting
    try {
      const hasPermission = await requestCameraPermission();
      if (!hasPermission) {
        setCameraPermission('denied');
        setShowPermissionWarning(true);
        setUseMouseMode(true);
        setIsPlaying(true);
        if (cameraPermissionError) {
          warnAlphabetGame(
            'Camera permission denied in start flow',
            cameraPermissionError,
          );
        }
        setFeedback("Let's use your finger to draw! 👆");
        return;
      }

      setCameraPermission('granted');
      setShowPermissionWarning(false);
      setUseMouseMode(false);
      setIsPlaying(true);
      setFeedback(null);
      setAccuracy(0);

      if (!isHandTrackingReady) {
        setIsHandTrackingLoading(true);
        setFeedback(null);
        void startTracking();
      } else {
        setFeedback('Pip can see you! 📷');
      }
    } catch (error) {
      warnAlphabetGame('Camera permission check failed at game start', error);
      setCameraPermission('denied');
      setShowPermissionWarning(true);
      setUseMouseMode(true);
      // Still allow game to start with mouse mode
      setIsPlaying(true);
      setFeedback("Let's use your finger to draw! 👆");
    }
  };

  const stopGame = () => {
    onGameComplete();
    setIsPlaying(false);
    setIsDrawing(false);
    setIsPinching(false);
    setShowLetterPrompt(true);
    pointerDownRef.current = false;
    pinchStateRef.current = createDefaultPinchState();
    lastDrawPointRef.current = null;
    setShowLetterPrompt(true);
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
  const [isHandTrackingLoading, setIsHandTrackingLoading] = useState(false);

  // Wellness tracking state
  const [showWellnessReminder, setShowWellnessReminder] =
    useState<boolean>(false);
  const [wellnessReminderType, setWellnessReminderType] = useState<
    'break' | 'water' | 'stretch' | 'inactive' | null
  >(null);
  const [activeTime, setActiveTime] = useState<number>(0); // in minutes
  const [hydrationReminderCount, setHydrationReminderCount] =
    useState<number>(0); // Track hydration reminders

  // Wellness tracking hooks handled by <WellnessMonitor />
  const handleAttentionAlert = useCallback((alert: { level: string; message: string; timestamp: number }) => {
    if (alert.level === 'critical') {
      setWellnessReminderType('inactive');
      setShowWellnessReminder(true);
      setFeedback(alert.message);
    }
  }, []);

  const handlePostureAlert = useCallback((alert: { level: string; message: string; timestamp: number }) => {
    setWellnessReminderType('break');
    setShowWellnessReminder(true);
    setFeedback(alert.message);
  }, []);

  const handleTrackingFrame = useCallback(
    (frame: TrackedHandFrame, _meta: HandTrackingRuntimeMeta) => {
      latestTrackingFrameRef.current = frame;
    },
    [],
  );

  const {
    isLoading: isModelLoading,
    isReady: isHandTrackingReady,
    startTracking,
  } = useGameHandTracking({
    gameName: 'AlphabetGame',
    webcamRef,
    handTracking: {
      numHands: 2,
      minDetectionConfidence: HAND_TRACKING_CONFIDENCE,
      minHandPresenceConfidence: HAND_TRACKING_CONFIDENCE,
      minTrackingConfidence: HAND_TRACKING_CONFIDENCE,
      delegate: 'GPU',
      enableFallback: true,
    },
    isRunning: isPlaying && !isPaused && !useMouseMode,
    onFrame: handleTrackingFrame,
    onNoVideoFrame: () => {
      latestTrackingFrameRef.current = null;
    },
  });

  useEffect(() => {
    if (
      isPlaying &&
      !isPaused &&
      !useMouseMode &&
      !isHandTrackingReady &&
      !isModelLoading
    ) {
      void startTracking();
    }
  }, [
    isHandTrackingReady,
    isModelLoading,
    isPaused,
    isPlaying,
    startTracking,
    useMouseMode,
  ]);

  const checkProgress = async () => {
    const buildLetterTracingContentId = (
      languageCode: string,
      letterChar: string,
    ) => {
      const codepoints = Array.from(letterChar)
        .map((char) => char.codePointAt(0)?.toString(16))
        .filter(Boolean)
        .join('-');
      return `letter-${languageCode}-${codepoints || 'unknown'}`;
    };

    const featureFlag = import.meta.env.VITE_FEATURE_LETTER_TRACING_EVENTS;
    const isLetterTracingSyncEnabled =
      featureFlag === undefined || featureFlag !== 'false';
    const attemptKey = `${selectedLanguage}:${currentLetter.char}`;
    const attemptCount = (letterAttemptCountsRef.current[attemptKey] ?? 0) + 1;
    letterAttemptCountsRef.current[attemptKey] = attemptCount;
    const eventContentId = buildLetterTracingContentId(
      selectedLanguage,
      currentLetter.char,
    );

    // Minimal, deterministic scoring: ensures the core tracking UX is testable.
    const points = drawnPointsRef.current.length;
    if (points < MIN_DRAW_POINTS_FOR_CHECK) {
      setAccuracy(MIN_FEEDBACK_ACCURACY);
      markLetterAttempt(
        selectedLanguage,
        currentLetter.char,
        MIN_FEEDBACK_ACCURACY,
      );
      if (isLetterTracingSyncEnabled && resolvedProfileId) {
        void recordProgressActivity({
          profileId: resolvedProfileId,
          activityType: 'letter_tracing',
          contentId: eventContentId,
          score: MIN_FEEDBACK_ACCURACY,
          metaData: {
            language: selectedLanguage,
            letter: currentLetter.char,
            letter_name: currentLetter.name,
            attempt_count: attemptCount,
            points_drawn: points,
            check_outcome: 'too_few_points',
          },
          completed: false,
        });
      }
      setFeedback('Draw more of the letter first! ✏️');
      setStreak(0);
      try {
        // Sound playback may not be available in some test environments; guard it.
        playError(); // Gentle reminder sound
      } catch (error) {
        warnAlphabetGame('Unable to play error sound', error);
      }
      return;
    }

    const nextAccuracy = Math.min(
      MAX_ACCURACY,
      BASE_ACCURACY + Math.floor(points / ACCURACY_POINT_DIVISOR),
    );
    setAccuracy(nextAccuracy);
    markLetterAttempt(selectedLanguage, currentLetter.char, nextAccuracy);

    // Sync to server for parent dashboard visibility (behind feature flag)
    if (isLetterTracingSyncEnabled && resolvedProfileId) {
      void recordProgressActivity({
        profileId: resolvedProfileId,
        activityType: 'letter_tracing',
        contentId: eventContentId,
        score: nextAccuracy,
        metaData: {
          language: selectedLanguage,
          letter: currentLetter.char,
          letter_name: currentLetter.name,
          attempt_count: attemptCount,
          points_drawn: points,
        },
        completed: nextAccuracy >= ACCURACY_SUCCESS_THRESHOLD,
      });
    }

    if (nextAccuracy >= ACCURACY_SUCCESS_THRESHOLD) {
      // Ensure only one overlay is visible at a time (simplified overlay stack)
      setIsPaused(false);
      setShowExitModal(false);
      setShowCameraErrorModal(false);
      setShowWellnessReminder(false);
      setWellnessReminderType(null);

      // Play celebration sounds and phonics. Guard against envs without audio/speech.
      try {
        playCelebration();
      } catch (error) {
        warnAlphabetGame('Unable to play celebration sound', error);
      }
      try {
        speakWordExample(currentLetter.char, selectedLanguage);
      } catch (error) {
        warnAlphabetGame('Unable to play phonics word example', error);
      }

      confetti({
        particleCount: CONFETTI_PARTICLE_COUNT,
        spread: CONFETTI_SPREAD,
        origin: { y: CONFETTI_ORIGIN_Y },
      });
      setFeedback('Amazing! Pip is so proud!');
      if (ttsEnabled) {
        void speak(`Amazing! You traced ${currentLetter.name}!`);
      }
      
      // Calculate score with streak bonus
      const basePoints = Math.round(nextAccuracy);
      const streakBonus = Math.min(streak * 3, 15);
      const totalPoints = basePoints + streakBonus;
      setScore((s) => s + totalPoints);
      
      // Show score popup
      setScorePopup({ points: totalPoints });
      setTimeout(() => setScorePopup(null), 700);
      
      // Haptics
      triggerHaptic('success');

      setStreak((s) => s + 1);

      // Milestone every 5
      if ((streak + 1) > 0 && (streak + 1) % STREAK_MILESTONE_INTERVAL === 0) {
        setShowStreakMilestone(true);
        triggerHaptic('celebration');
        setTimeout(() => setShowStreakMilestone(false), STREAK_MILESTONE_DURATION_MS);
      }
      
      setCelebrationTitle(`You traced ${currentLetter.name}!`);
      setShowCelebration(true);
    } else {
      setFeedback('Good try! Draw the whole letter!');
      if (ttsEnabled) {
        void speak('Keep going! Trace the whole letter!');
      }
      setStreak(0);
      setShowStreakMilestone(false);
      triggerHaptic('error');
      try {
        playPop(); // Encouraging feedback
      } catch (error) {
        warnAlphabetGame('Unable to play pop sound', error);
      }
    }
  };

  const nextLetter = () => {
    setCurrentLetterIndex((i) => Math.min(i + 1, LETTERS.length - 1));
    clearDrawing();
    setAccuracy(0);
    setFeedback(null);
    setIsPinching(false);
    pinchStateRef.current = createDefaultPinchState();
    lastDrawPointRef.current = null;
    setShowLetterPrompt(true);
  };

  const goToHome = () => {
    stopGame();
    navigate('/dashboard');
  };

  // Camera error handler
  // Recovery & exit handlers moved below where session helpers are defined (avoids TDZ issues)

  // Keyboard handler for pause and escape moved below where exit handlers are initialized

  const handleTutorialComplete = () => {
    setTutorialCompleted(true);
    setShowHandTutorial(true);
    try {
      localStorage.setItem(ALPHABET_GAME_TUTORIAL_KEY, 'true');
    } catch (error) {
      warnAlphabetGame('Unable to save tutorial completion state', error);
    }
  };

  const handleSkipTutorial = () => {
    setTutorialCompleted(true);
    try {
      localStorage.setItem(ALPHABET_GAME_TUTORIAL_KEY, 'true');
    } catch (error) {
      warnAlphabetGame('Unable to save tutorial skip state', error);
    }
  };

  const handleHandTutorialComplete = () => {
    setShowHandTutorial(false);
  };

  const toggleHighContrast = () => {
    setHighContrast((prev) => !prev);
  };
  // Mark as used for now (can be removed if feature not needed)
  void toggleHighContrast;

  // Effect to update feedback when hand tracking becomes ready during gameplay
  useEffect(() => {
    if (isPlaying && isHandTrackingReady) {
      setIsHandTrackingLoading(false);
      setFeedback('Pip can see you! 📷');
      // DEBUG: console.log('[AlphabetGame] Hand tracking became ready during gameplay');
    }
  }, [isPlaying, isHandTrackingReady]);

  useEffect(() => {
    const hasCompletedTutorial =
      localStorage.getItem(ALPHABET_GAME_TUTORIAL_KEY) === 'true';
    setTutorialCompleted(hasCompletedTutorial);

    // Fetch profiles to ensure we have the latest data
    useProfileStore.getState().fetchProfiles();
  }, []);

  // Bootstrap camera permission on mount (Permissions API + getUserMedia fallback)
  useInitialCameraPermission(
    setCameraPermission,
    setShowPermissionWarning,
    'AlphabetGame permission bootstrap',
    warnAlphabetGame,
  );

  // Get profile ID from route state (passed from Dashboard)
  const profileId = (location.state as any)?.profileId as string | undefined;

  // Get profile for display (name, etc.) - NOT for language
  const profiles = useProfileStore((state) => state.profiles);
  const currentProfile = useProfileStore((state) => state.currentProfile);
  const isProfilesLoading = useProfileStore((state) => state.isLoading);
  const fetchProfiles = useProfileStore((state) => state.fetchProfiles);
  const profilesError = useProfileStore((state) => state.error);

  // Single, stable initialization effect for profiles
  const hasFetchedRef = useRef(false);
  useEffect(() => {
    if (!hasFetchedRef.current && profiles.length === 0) {
      hasFetchedRef.current = true;
      fetchProfiles().catch(() => {
        // Error handled in store
      });
    }
  }, [fetchProfiles, profiles.length]);

  // Auto-select first available profile if none provided
  const resolvedProfileId = profileId ?? currentProfile?.id ?? profiles[0]?.id;
  const profile = resolvedProfileId
    ? profiles.find((p: Profile) => p.id === resolvedProfileId)
    : undefined;

  // Game language is determined by profile's preferred_language
  // This ensures consistency across the app
  const defaultLanguage =
    profile?.preferred_language || gameLanguageSetting || 'en';

  // Language selection - user can switch anytime
  const [selectedLanguage, setSelectedLanguage] =
    useState<string>(defaultLanguage);

  // Wellness tracking effects
  useEffect(() => {
    if (!isPlaying) return;

    // Track active time (when game is being played)
    const activeTimer = setInterval(() => {
      setActiveTime((prev) => prev + 1);
    }, WELLNESS_INTERVAL_MS); // Every minute

    return () => clearInterval(activeTimer);
  }, [isPlaying]);

  // Inactivity detector
  const { resetTimer: resetInactivityTimer } = useInactivityDetector(() => {
    setWellnessReminderType('inactive');
    setShowWellnessReminder(true);
  }, INACTIVITY_TIMEOUT_MS); // Trigger after 1 minute of inactivity

  // Hydration reminder effect - remind every 20 minutes of active play
  // Hydration reminder effect - remind every 20 minutes of active play
  useEffect(() => {
    if (!isPlaying) return;

    const hydrationInterval = setInterval(() => {
      // Show hydration reminder every 20 minutes of active play
      if (
        activeTime > 0 &&
        activeTime % HYDRATION_REMINDER_MINUTES === 0 &&
        activeTime >= HYDRATION_REMINDER_MINUTES
      ) {
        setWellnessReminderType('water');
        setShowWellnessReminder(true);
        setHydrationReminderCount((prevCount) => prevCount + 1);
      }
    }, WELLNESS_INTERVAL_MS); // Check every minute

    return () => clearInterval(hydrationInterval);
  }, [isPlaying, activeTime]);

  // Handle wellness reminder postpone (if applicable)
  const handleWellnessReminderPostpone = () => {
    // For now, just dismiss and reset the timer
    setShowWellnessReminder(false);
    setWellnessReminderType(null);
  };

  // Handle wellness reminder dismissal
  const handleWellnessReminderDismiss = () => {
    handleWellnessReminderPostpone();
  };

  const LETTERS = useMemo(
    () => getLettersForGame(selectedLanguage),
    [selectedLanguage],
  );
  const [currentLetterIndex, setCurrentLetterIndex] = useState<number>(0);
  const currentLetter = useMemo(
    () => LETTERS[currentLetterIndex] ?? LETTERS[0],
    [LETTERS, currentLetterIndex],
  );
  const selectedLanguageName = useMemo(
    () =>
      LANGUAGES.find((language) => language.code === selectedLanguage)?.name ??
      'English',
    [selectedLanguage],
  );
  const [pendingCount, setPendingCount] = useState<number>(0);
  const accuracyColorClass = useMemo(
    () =>
      accuracy >= 70
        ? 'text-text-success'
        : accuracy >= 40
          ? 'text-text-warning'
          : 'text-text-error',
    [accuracy],
  );

  // Restore session on mount (if valid)
  useEffect(() => {
    const data = loadAlphabetGameSession();
    if (data) {
      if (typeof data.currentLetterIndex === 'number') {
        setCurrentLetterIndex(data.currentLetterIndex);
      }
      if (typeof data.score === 'number') setScore(data.score);
      if (typeof data.streak === 'number') setStreak(data.streak);
      if (typeof data.selectedLanguage === 'string')
        setSelectedLanguage(data.selectedLanguage);
      if (typeof data.useMouseMode === 'boolean')
        setUseMouseMode(data.useMouseMode);
    }
  }, []);

  // Save session periodically while playing
  useEffect(() => {
    if (isPlaying) {
      const sessionData = {
        currentLetterIndex,
        score,
        streak,
        selectedLanguage,
        useMouseMode,
        timestamp: Date.now(),
      };
      saveAlphabetGameSession(sessionData);
    }
  }, [
    isPlaying,
    currentLetterIndex,
    score,
    streak,
    selectedLanguage,
    useMouseMode,
  ]);

  // Recovery handlers (moved here so session functions are available)
  const handleCameraError = useCallback(
    (error: Error | string | DOMException) => {
      const errorName =
        typeof error === 'object' && error != null && 'name' in error
          ? String((error as any).name)
          : '';
      const message = error instanceof Error ? error.message : String(error);

      const isPermissionOrNoDevice =
        errorName === 'NotAllowedError' ||
        errorName === 'NotFoundError' ||
        /permission|denied|notallowed|notfound/i.test(message);

      if (isPermissionOrNoDevice) {
        setCameraPermission('denied');
        setShowPermissionWarning(true);
        setUseMouseMode(true);
        setFeedback("Let's use your finger to draw! 👆");
        setShowCameraErrorModal(false);
        setIsPaused(false);
        return;
      }

      setCameraErrorMessage(message);
      setShowCameraErrorModal(true);
      setIsPaused(true);
    },
    [],
  );

  // Recovery handlers
  const handleRetryCamera = useCallback(() => {
    setShowCameraErrorModal(false);
    setIsPaused(false);
    setUseMouseMode(false);
    void startTracking();
  }, [startTracking]);

  const handleContinueWithMouse = useCallback(() => {
    setShowCameraErrorModal(false);
    setIsPaused(false);
    setUseMouseMode(true);
    setFeedback('Use your finger to draw! 👆');
  }, []);

  // Exit handlers
  const handleSaveAndExit = useCallback(() => {
    setShowCameraErrorModal(false);
    clearAlphabetGameSession();
    stopGame();
    navigate('/dashboard');
  }, []);

  // Exit confirmation handlers
  const handleConfirmExit = useCallback(() => {
    setShowExitModal(false);
    const sessionData = {
      currentLetterIndex,
      score,
      streak,
      selectedLanguage,
      useMouseMode,
      timestamp: Date.now(),
    };
    saveAlphabetGameSession(sessionData);
    stopGame();
    navigate('/dashboard');
  }, [currentLetterIndex, score, streak, selectedLanguage, useMouseMode]);

  const handleCancelExit = useCallback(() => {
    setShowExitModal(false);
  }, []);

  // Keyboard handler for pause and escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isPlaying) return;

      if (e.key === 'Escape') {
        if (showExitModal) {
          setShowExitModal(false);
        } else if (!showCameraErrorModal) {
          setShowExitModal(true);
        }
      } else if (
        (e.key === 'p' || e.key === 'P') &&
        !showExitModal &&
        !showCameraErrorModal
      ) {
        setIsPaused((prev) => !prev);
        if (!isPaused) {
          setFeedback('Time for a break! Pip is waiting for you!');
        } else {
          setFeedback("Welcome back! Let's draw more letters!");
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, showExitModal, showCameraErrorModal, isPaused]);

  // Two-stage prompt: show big center letter briefly, then keep a small side pill.
  useEffect(() => {
    if (!isPlaying) return;
    setShowLetterPrompt(true);
    if (promptTimeoutRef.current) clearTimeout(promptTimeoutRef.current);

    return () => {
      if (promptTimeoutRef.current) {
        clearTimeout(promptTimeoutRef.current);
        promptTimeoutRef.current = null;
      }
    };
  }, [isPlaying]);

  useEffect(() => {
    const update = () =>
      setPendingCount(progressQueue.getPending(resolvedProfileId || '').length);
    update();
    const unsubscribe = progressQueue.subscribe(update);
    return unsubscribe;
  }, [resolvedProfileId]);

  // Hand tracking + pinch drawing loop (requestAnimationFrame; restores prior smooth tracing behavior)
  useEffect(() => {
    if (!isPlaying || isPaused) return;

    let cancelled = false;

    const loop = () => {
      if (cancelled) return;

      const webcam = webcamRef.current;
      const canvas = canvasRef.current;
      const video = webcam?.video;

      if (!canvas) {
        rafIdRef.current = requestAnimationFrame(loop);
        return;
      }

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        rafIdRef.current = requestAnimationFrame(loop);
        return;
      }

      const hasVideoFrame =
        !!video &&
        video.readyState >= 2 &&
        video.videoWidth > 0 &&
        video.videoHeight > 0;

      // Setup canvas dimensions
      if (hasVideoFrame && video) {
        setupCanvas(canvas, video);
      } else {
        const rect = canvas.getBoundingClientRect();
        const dpr =
          typeof window !== 'undefined' ? (window.devicePixelRatio ?? 1) : 1;
        const nextWidth = Math.max(1, Math.round(rect.width * dpr));
        const nextHeight = Math.max(1, Math.round(rect.height * dpr));
        if (nextWidth !== canvas.width || nextHeight !== canvas.height) {
          canvas.width = nextWidth;
          canvas.height = nextHeight;
        }
      }

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw hint with better visibility
      if (showHints) {
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 4;
        drawLetterHint(ctx, currentLetter.char, canvas.width, canvas.height);
        ctx.shadowBlur = 0;
      }

      // Draw all segments (now smoothed in drawSegments)
      if (drawnPointsRef.current.length > 0) {
        const segments = buildSegments(drawnPointsRef.current);
        drawSegments(ctx, segments, canvas.width, canvas.height, {
          color: currentLetter.color,
          lineWidth: 12,
          enableGlow: true,
          glowBlur: 10,
        });
      }

      // Process pinch detection (skip when in mouse/touch fallback or when video/model isn't ready)
      if (!useMouseMode && hasVideoFrame && video) {
        const landmarks = latestTrackingFrameRef.current?.hands?.[0];
        if (landmarks && landmarks.length >= 9) {
          if (!isHandPresentRef.current) {
            isHandPresentRef.current = true;
            setIsHandPresent(true);
          }

          const pinchResult = detectPinch(landmarks, pinchStateRef.current);
          pinchStateRef.current = pinchResult.state;

          if (pinchResult.state.isPinching !== isPinchingRef.current) {
            isPinchingRef.current = pinchResult.state.isPinching;
            setIsPinching(pinchResult.state.isPinching);
          }

          // Compute fingertip point in normalized space (mirrored video, so invert X)
          const rawX = Math.min(1, Math.max(0, 1 - (landmarks[8]?.x ?? 0)));
          const rawY = Math.min(1, Math.max(0, landmarks[8]?.y ?? 0));
          const nextTip: Point = { x: rawX, y: rawY };

          // Exponential smoothing for cursor + drawing input to reduce jitter
          // alpha closer to 1 = more responsive; closer to 0 = smoother.
          if (!smoothedTipRef.current) {
            smoothedTipRef.current = nextTip;
          } else {
            smoothedTipRef.current = {
              x:
                smoothedTipRef.current.x +
                (nextTip.x - smoothedTipRef.current.x) * TIP_SMOOTHING_ALPHA,
              y:
                smoothedTipRef.current.y +
                (nextTip.y - smoothedTipRef.current.y) * TIP_SMOOTHING_ALPHA,
            };
          }

          // Draw a fingertip cursor so kids can see "ready" vs "pinching" feedback.
          // This matches the old game's clearer pinch feedback (even before drawing).
          if (smoothedTipRef.current) {
            const cx = smoothedTipRef.current.x * canvas.width;
            const cy = smoothedTipRef.current.y * canvas.height;
            const radius = Math.max(
              10,
              Math.round(Math.min(canvas.width, canvas.height) * 0.018),
            );

            ctx.save();
            ctx.beginPath();
            ctx.arc(cx, cy, radius, 0, Math.PI * 2);
            if (pinchResult.state.isPinching) {
              ctx.fillStyle = currentLetter.color;
              ctx.shadowColor = currentLetter.color;
              ctx.shadowBlur = 10;
              ctx.fill();
            } else {
              ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
              ctx.lineWidth = 3;
              ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
              ctx.shadowBlur = 6;
              ctx.stroke();
            }
            ctx.restore();
          }

          if (pinchResult.transition === 'release') {
            lastDrawPointRef.current = null;
            addBreakPoint(drawnPointsRef.current);
          } else if (
            pinchResult.transition === 'start' ||
            pinchResult.transition === 'continue'
          ) {
            if (isDrawingRef.current) {
              const nextPoint: Point = smoothedTipRef.current ?? nextTip;

              if (
                shouldAddPoint(
                  drawnPointsRef.current[drawnPointsRef.current.length - 1],
                  nextPoint,
                )
              ) {
                drawnPointsRef.current.push(nextPoint);
                if (drawnPointsRef.current.length > MAX_DRAWN_POINTS) {
                  drawnPointsRef.current.shift();
                }
              }
            }
          }
        } else {
          // No hand detected
          if (isPinchingRef.current) {
            isPinchingRef.current = false;
            setIsPinching(false);
            pinchStateRef.current = createDefaultPinchState();
            lastDrawPointRef.current = null;
          }
          if (isHandPresentRef.current) {
            isHandPresentRef.current = false;
            setIsHandPresent(false);
          }
          smoothedTipRef.current = null;
        }
      } else if (isPinchingRef.current) {
        // Ensure pinch UI resets when falling back to mouse mode
        isPinchingRef.current = false;
        setIsPinching(false);
        pinchStateRef.current = createDefaultPinchState();
        lastDrawPointRef.current = null;
        if (isHandPresentRef.current) {
          isHandPresentRef.current = false;
          setIsHandPresent(false);
        }
        smoothedTipRef.current = null;
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
  }, [
    isPlaying,
    isPaused,
    currentLetter.char,
    currentLetter.color,
    showHints,
    useMouseMode,
  ]);

  const getCanvasPointFromPointerEvent = useCallback(
    (e: ReactPointerEvent<HTMLCanvasElement>) => {
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
    },
    [],
  );

  const handleCanvasPointerDown = useCallback(
    (e: ReactPointerEvent<HTMLCanvasElement>) => {
      if (!isPlaying || !isDrawing) return;
      resetInactivityTimer();
      const canvas = canvasRef.current;
      const point = getCanvasPointFromPointerEvent(e);
      if (!canvas || !point) return;

      pointerDownRef.current = true;
      (e.currentTarget as any).setPointerCapture?.(e.pointerId);

      // Add first point - will be rendered by the main loop
      lastDrawPointRef.current = point;
      drawnPointsRef.current.push({
        x: point.x / canvas.width,
        y: point.y / canvas.height,
      });
    },
    [
      getCanvasPointFromPointerEvent,
      isDrawing,
      isPlaying,
      resetInactivityTimer,
    ],
  );

  const handleCanvasPointerMove = useCallback(
    (e: ReactPointerEvent<HTMLCanvasElement>) => {
      if (!isPlaying || !isDrawing || !pointerDownRef.current) return;
      resetInactivityTimer();
      const canvas = canvasRef.current;
      const point = getCanvasPointFromPointerEvent(e);
      if (!canvas || !point) return;

      // Only add point if moved enough
      const lastPoint =
        drawnPointsRef.current[drawnPointsRef.current.length - 1];
      const dist =
        lastPoint && !isNaN(lastPoint.x)
          ? Math.sqrt(
            Math.pow(point.x / canvas.width - lastPoint.x, 2) +
            Math.pow(point.y / canvas.height - lastPoint.y, 2),
          )
          : Infinity;

      if (dist > POINT_MIN_DISTANCE) {
        lastDrawPointRef.current = point;
        drawnPointsRef.current.push({
          x: point.x / canvas.width,
          y: point.y / canvas.height,
        });
        if (drawnPointsRef.current.length > MAX_DRAWN_POINTS) {
          drawnPointsRef.current.shift();
        }
      }
    },
    [
      getCanvasPointFromPointerEvent,
      isDrawing,
      isPlaying,
      resetInactivityTimer,
    ],
  );

  const handleCanvasPointerUpOrCancel = useCallback(
    (e: ReactPointerEvent<HTMLCanvasElement>) => {
      pointerDownRef.current = false;
      (e.currentTarget as any).releasePointerCapture?.(e.pointerId);
      lastDrawPointRef.current = null;
      // Add break point to separate line segments
      drawnPointsRef.current.push({ x: NaN, y: NaN });
    },
    [],
  );

  // Define game controls
  const gameControls = useMemo<GameControl[]>(
    () => [
      {
        id: 'clear',
        icon: 'x',
        label: 'Clear',
        onClick: clearDrawing,
        variant: 'danger',
      },
      {
        id: 'check',
        icon: 'check',
        label: 'Check',
        ariaLabel: 'Check my tracing',
        onClick: checkProgress,
        variant: 'success',
      },
      {
        id: 'skip',
        icon: 'play',
        label: 'Skip',
        onClick: nextLetter,
        variant: 'primary',
      },
    ],
    [clearDrawing, checkProgress, nextLetter],
  );

  // Define menu controls
  const menuControls = useMemo<GameControl[]>(
    () => [
      {
        id: 'home',
        icon: 'home',
        label: 'Home',
        onClick: goToHome,
        variant: 'secondary',
      },
      {
        id: 'start',
        icon: isModelLoading ? 'timer' : 'sparkles',
        label: isModelLoading
          ? 'Loading hand tracking...'
          : cameraPermission === 'denied'
            ? 'Play with Mouse/Touch'
            : 'Start Learning!',
        onClick: startGame,
        variant: 'success',
        disabled: isModelLoading,
      },
    ],
    [goToHome, isModelLoading, cameraPermission, startGame],
  );

  // If no profile is available yet, show a loading state with option to continue as guest
  if (!resolvedProfileId) {
    // Allow continuing without profile after a brief loading period
    if (isProfilesLoading) {
      return (
        <section className='min-h-[60vh] flex items-center justify-center'>
          <div className='text-center'>
            <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4' />
            <p className='text-text-secondary'>
              Loading your child&apos;s profile...
            </p>
          </div>
        </section>
      );
    }

    // Show error message if fetch failed
    if (profilesError) {
      return (
        <section className='min-h-[60vh] flex items-center justify-center px-4'>
          <div className='text-center max-w-md'>
            <div className='text-6xl mb-4'>⚠️</div>
            <h2 className='text-2xl font-bold mb-2'>Unable to Load Profile</h2>
            <p className='text-text-secondary mb-6'>{profilesError}</p>
            <div className='space-y-3'>
              <button
                type='button'
                onClick={() => {
                  hasFetchedRef.current = false;
                  fetchProfiles();
                }}
                className='w-full px-5 py-3 bg-gradient-to-r from-pip-orange to-pip-rust text-white rounded-xl font-bold shadow-soft hover:scale-105 transition-transform'
              >
                Try Again
              </button>
              <button
                type='button'
                onClick={() => {
                  // Set a guest profile ID to bypass the check
                  useProfileStore.setState({
                    currentProfile: {
                      id: 'guest',
                      name: 'Guest',
                      preferred_language: 'en',
                      created_at: new Date().toISOString(),
                      updated_at: new Date().toISOString(),
                      parent_id: 'guest',
                      settings: {},
                    },
                  });
                }}
                className='w-full px-5 py-3 bg-white border border-border rounded-xl font-bold text-advay-slate shadow-soft hover:bg-bg-tertiary transition'
              >
                Play as Guest
              </button>
              <button
                type='button'
                onClick={() => navigate('/login')}
                className='w-full px-5 py-3 text-text-secondary hover:text-text-primary transition'
              >
                Go to Login
              </button>
            </div>
          </div>
        </section>
      );
    }

    // No profiles available - offer to create one or continue as guest
    if (profiles.length === 0) {
      return (
        <section className='min-h-[60vh] flex items-center justify-center px-4'>
          <div className='text-center max-w-md'>
            <div className='text-5xl mb-4 font-bold text-blue-500'>Aa</div>
            <h2 className='text-2xl font-bold mb-2'>Ready to Learn!</h2>
            <p className='text-text-secondary mb-6'>
              Create a profile to save your progress, or start playing right
              away!
            </p>
            <div className='space-y-3'>
              <button
                type='button'
                onClick={async () => {
                  // Create a default profile and continue
                  await useProfileStore.getState().createProfile({
                    name: 'Learner',
                    age: 5,
                    preferred_language: 'en',
                  });
                }}
                className='w-full px-5 py-3 bg-gradient-to-r from-pip-orange to-pip-rust text-white rounded-xl font-bold shadow-soft hover:scale-105 transition-transform'
              >
                Create Profile & Play
              </button>
              <button
                type='button'
                onClick={() => {
                  // Set a guest profile ID to bypass the check
                  useProfileStore.setState({
                    currentProfile: {
                      id: 'guest',
                      name: 'Guest',
                      preferred_language: 'en',
                      created_at: new Date().toISOString(),
                      updated_at: new Date().toISOString(),
                      parent_id: 'guest',
                      settings: {},
                    },
                  });
                }}
                className='w-full px-5 py-3 bg-white border border-border rounded-xl font-bold text-advay-slate shadow-soft hover:bg-bg-tertiary transition'
              >
                Play as Guest
              </button>
              <button
                type='button'
                onClick={() => navigate('/dashboard')}
                className='w-full px-5 py-3 text-text-secondary hover:text-text-primary transition'
              >
                ← Back to Dashboard
              </button>
            </div>
          </div>
        </section>
      );
    }

    // Profiles exist but none selected - show brief loading
    return (
      <section className='min-h-[60vh] flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4' />
          <p className='text-text-secondary'>
            Loading your child&apos;s profile...
          </p>
        </div>
      </section>
    );
  }

  const overlayVisibility = getAlphabetGameOverlayVisibility({
    showWellnessReminder,
    hasWellnessReminderType: !!wellnessReminderType,
    showCelebration,
    showExitModal,
    showCameraErrorModal,
    isPaused,
  });
  const handleCameraPermissionChange = useCallback(
    (state: 'granted' | 'denied' | 'prompt') => {
      setCameraPermission(state);
      if (state === 'denied') {
        setShowPermissionWarning(true);
        setUseMouseMode(true);
        setFeedback("Let's use your finger to draw! 👆");
      } else {
        setShowPermissionWarning(false);
      }
    },
    [],
  );
  const mascotState = useMemo(() => {
    if (feedback?.includes('Great') || feedback?.includes('Amazing')) {
      return 'happy' as const;
    }
    if (isDrawing) {
      return 'waiting' as const;
    }
    return 'idle' as const;
  }, [feedback, isDrawing]);
  const mascotMessage = useMemo(
    () => feedback || (isDrawing ? 'Keep going!' : 'Trace the letter!'),
    [feedback, isDrawing],
  );
  const wellnessAlerts = useMemo(() => {
    if (!wellnessReminderType) {
      return [];
    }
    return [
      {
        id: '1',
        type: wellnessReminderType as any,
        message:
          wellnessReminderType === 'break'
            ? 'Time for a break! Rest your eyes and stretch.'
            : wellnessReminderType === 'water'
              ? hydrationReminderCount > 1
                ? `Time for a drink of water! (You've had ${hydrationReminderCount} water reminders.)`
                : 'Time for a drink of water!'
              : wellnessReminderType === 'stretch'
                ? 'Time to stretch your body!'
                : 'Are you still there?',
        timestamp: Date.now(),
        acknowledged: false,
      },
    ];
  }, [hydrationReminderCount, wellnessReminderType]);

  return (
    <GlobalErrorBoundary>
      <WellnessMonitor
        videoRef={webcamRef as unknown as React.RefObject<HTMLVideoElement>}
        isActive={isPlaying && !isPaused && !useMouseMode}
        onAttentionAlert={handleAttentionAlert}
        onPostureAlert={handlePostureAlert}
      />
      <>
        {!tutorialCompleted && (
          <GameTutorial
            onComplete={handleTutorialComplete}
            onSkip={handleSkipTutorial}
          />
        )}

        <HandTutorialOverlay
          isOpen={showHandTutorial}
          onComplete={handleHandTutorialComplete}
        />

        {/* Game Area - Full Screen Mode */}
        {isPlaying ? (
          <GameContainer
            webcamRef={webcamRef}
            title={`${selectedLanguageName} Alphabet`}
            score={score}
            level={currentLetterIndex + 1}
            onHome={() => setShowExitModal(true)}
            onPause={() => setIsPaused(!isPaused)}
            isHandDetected={isHandTrackingReady}
            isPlaying={isPlaying}
          >
            <div className='relative w-full h-full'>
              {/* Accuracy Bar - always render for semantic accessibility; value can be 0 */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className='bg-white border-3 border-[#F2CC8F] rounded-3xl p-5 mb-6 shadow-[0_4px_0_#E5B86E] absolute top-4 left-1/2 -translate-x-1/2 z-40 w-[min(90%,720px)]'
              >
                <div className='flex justify-between items-center mb-3'>
                  <label
                    htmlFor='accuracy-progress'
                    className='text-text-secondary font-bold uppercase tracking-widest text-sm'
                  >
                    Tracing Accuracy
                  </label>
                  <span className={`font-black text-lg ${accuracyColorClass}`}>
                    {accuracy}%
                  </span>
                </div>
                <progress
                  id='accuracy-progress'
                  value={accuracy}
                  max={100}
                  className='w-full h-4 rounded-full'
                />
              </motion.div>
              <GameLayout
                webcamRef={webcamRef}
                canvasRef={canvasRef}
                highContrast={highContrast}
                variant='hero'
                className='w-full h-full'
                onCameraPermission={handleCameraPermissionChange}
                onCameraError={handleCameraError}
                canvasEvents={{
                  onPointerDown: handleCanvasPointerDown,
                  onPointerMove: handleCanvasPointerMove,
                  onPointerUp: handleCanvasPointerUpOrCancel,
                  onPointerCancel: handleCanvasPointerUpOrCancel,
                  onPointerLeave: handleCanvasPointerUpOrCancel,
                }}
              >
                {/* Instruction Overlay with High Contrast */}
                <div className='absolute bottom-8 left-0 right-0 text-center pointer-events-none'>
                  <div className='inline-block px-8 py-4 rounded-[2rem] bg-[#F2CC8F] text-advay-slate shadow-[0_6px_0_#E5B86E] transition-all duration-300 transform hover:scale-105'>
                    <p className='text-xl md:text-2xl font-extrabold tracking-wide'>
                      {isDrawing ? 'Trace the letter!' : 'Pinch to draw'}
                    </p>
                  </div>
                </div>

                {/* Pinch Status (hidden in mouse mode) */}
                {!useMouseMode && (
                  <div className='absolute top-28 left-1/2 -translate-x-1/2 pointer-events-none z-50'>
                    <div className='px-5 py-3 rounded-full bg-white border-3 border-[#F2CC8F] text-advay-slate shadow-[0_4px_0_#E5B86E] text-sm md:text-base font-bold'>
                      {isHandPresent ? (
                        isPinching ? (
                          <span className='flex items-center gap-2'>
                            <span className='inline-block w-3 h-3 rounded-full bg-pip-orange shadow-[0_4px_0_#E5B86E]' />
                            Pinching… Draw!
                          </span>
                        ) : (
                          <span className='flex items-center gap-2'>
                            <span className='inline-block w-3 h-3 rounded-full bg-slate-200 shadow-inner' />
                            Hand seen — pinch to draw
                          </span>
                        )
                      ) : (
                        <span className='flex items-center gap-2 text-slate-400'>
                          <span className='inline-block w-3 h-3 rounded-full bg-slate-100' />
                          Show your hand to start
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Consistent letter prompt - stays in one place */}
                {isPlaying && showLetterPrompt && (
                  <div className='absolute top-4 left-4 z-10'>
                    <div className='bg-white px-6 py-5 rounded-[2rem] border-3 border-[#F2CC8F] text-advay-slate shadow-[0_4px_0_#E5B86E] relative top-[-2px]'>
                      <div className='flex items-center gap-4'>
                        {/* Big letter */}
                        <div
                          className={`text-5xl md:text-6xl font-black leading-none text-advay-slate`}
                        >
                          {currentLetter.char}
                        </div>
                        {/* Letter name and instruction */}
                        <div className='flex flex-col'>
                          <span className='text-xs md:text-sm font-bold uppercase tracking-widest text-text-secondary'>
                            Draw this letter
                          </span>
                          <span className='text-base md:text-xl font-extrabold text-advay-slate tracking-tight mt-1'>
                            {currentLetter.name}
                          </span>
                          {currentLetter.icon && (
                            <span className='inline-block w-12 h-12 mt-1'>
                              <img
                                src={
                                  Array.isArray(currentLetter.icon)
                                    ? currentLetter.icon[0]
                                    : currentLetter.icon
                                }
                                alt={currentLetter.name}
                                className='w-full h-full object-contain drop-shadow-[0_4px_0_#E5B86E]'
                                onError={(e) => {
                                  // Hide broken images gracefully
                                  (e.target as HTMLImageElement).style.display =
                                    'none';
                                }}
                              />
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* In-Game Mascot */}
                <div className='absolute bottom-4 left-4 z-20'>
                  <Mascot state={mascotState} message={mascotMessage} />
                </div>

                {/* Standardized Game Controls - Bottom Right */}
                <GameControls controls={gameControls} position='bottom-right' />

                {/* Kenney Heart HUD */}
                <div className="absolute bottom-20 right-4 flex items-center gap-1 bg-white rounded-2xl px-4 py-2 border-3 border-pink-200 shadow-[0_4px_0_#F9A8D4] z-20">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <img
                      key={i}
                      src={streak >= (i + 1) * 2
                        ? '/assets/kenney/platformer/hud/hud_heart.png'
                        : '/assets/kenney/platformer/hud/hud_heart_empty.png'}
                      alt=""
                      className="w-7 h-7"
                    />
                  ))}
                  <span className="ml-2 text-base font-bold text-pink-500">x{streak}</span>
                </div>

                {/* Score Popup Animation */}
                {scorePopup && (
                  <motion.div
                    initial={{ opacity: 0, y: 0, scale: 0.5 }}
                    animate={{ opacity: 1, y: -40, scale: 1.2 }}
                    exit={{ opacity: 0 }}
                    className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-50"
                  >
                    <div className="text-5xl font-black text-green-500 drop-shadow-lg">
                      +{scorePopup.points}
                    </div>
                  </motion.div>
                )}

                {/* Streak Milestone */}
                {showStreakMilestone && (
                  <motion.div
                    initial={{ scale: 0, rotate: -20 }}
                    animate={{ scale: 1.2, rotate: 0 }}
                    exit={{ scale: 0 }}
                    className="fixed top-1/3 left-1/2 -translate-x-1/2 pointer-events-none z-50"
                  >
                    <div className="bg-gradient-to-r from-yellow-300 via-orange-400 to-pink-500 px-6 py-3 rounded-2xl shadow-xl text-white font-black text-2xl">
                      🔥 {streak} Streak! 🔥
                    </div>
                  </motion.div>
                )}
              </GameLayout>
            </div>
          </GameContainer>
        ) : (
          /* Pre-Game UI - Menu Screen */
          <section className='bg-discovery-cream min-h-screen max-w-7xl mx-auto px-4 py-8 md:py-12'>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {/* Header */}
              <header className='flex flex-col sm:flex-row justify-between items-start gap-4 mb-8'>
                <div>
                  <h1 className='text-h1 md:text-[2.5rem] font-extrabold text-advay-slate tracking-tight'>
                    Learning Game
                  </h1>
                  <p className='text-text-secondary text-base md:text-lg font-bold mt-2'>
                    Trace letters with your finger!
                  </p>
                </div>
                <div className='bg-white border-3 border-[#F2CC8F] rounded-3xl px-6 py-5 shadow-[0_8px_0_#E5B86E] w-full sm:w-auto relative top-[-4px]'>
                  <output className='text-3xl md:text-4xl font-black text-pip-orange block text-left sm:text-right mb-1'>
                    Score: {score}
                  </output>
                  <div className='flex flex-wrap items-center gap-x-4 gap-y-2 text-xs md:text-sm font-bold text-slate-400 uppercase tracking-widest mt-1'>
                    <span className='flex items-center gap-1 min-w-fit'>
                      <UIIcon
                        name='flame'
                        size={16}
                        className='text-pip-orange pb-0.5'
                      />
                      Streak {streak}
                    </span>
                    <span className='min-w-fit text-slate-400'>
                      Batch {Math.floor(currentLetterIndex / BATCH_SIZE) + 1}/
                      {Math.ceil(LETTERS.length / BATCH_SIZE)}
                    </span>
                    {pendingCount > 0 && (
                      <div className='inline-flex items-center gap-1 bg-amber-50 border-2 border-amber-200 text-amber-600 px-3 py-1 rounded-full text-xs font-black'>
                        <UIIcon name='warning' size={14} className='pb-0.5' />
                        Pending ({pendingCount})
                      </div>
                    )}
                  </div>
                </div>
              </header>

              <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 items-start'>
                {/* Left column: current letter + status */}
                <div className='space-y-6'>
                  {/* Animated Letter Display */}
                  <div className='bg-discovery-cream border-3 border-[#F2CC8F] rounded-3xl p-8 md:p-12 shadow-[0_8px_0_#E5B86E] relative top-[-4px]'>
                    <div className='flex flex-col items-center justify-center gap-6'>
                      <div className='text-center'>
                        <div
                          className={`text-9xl md:text-[12rem] font-black mb-4 text-advay-slate drop-shadow-[0_4px_0_#E5B86E]`}
                        >
                          {currentLetter.char}
                        </div>
                        {currentLetter.transliteration && (
                          <div className='text-base md:text-lg text-text-secondary mt-2 font-black uppercase tracking-widest'>
                            {currentLetter.transliteration}
                          </div>
                        )}
                      </div>
                      <div className='w-32 h-32 mb-4 bg-pip-cream rounded-3xl p-6 border-3 border-[#F2CC8F] shadow-[0_4px_0_#E5B86E] relative top-[-2px]'>
                        <UIIcon
                          src={getAllIcons(currentLetter)}
                          alt={currentLetter.name}
                          size={128}
                          className='w-full h-full object-contain drop-shadow-md hover:scale-110 transition-transform cursor-pointer'
                          fallback={currentLetter.emoji || ''}
                        />
                      </div>
                      <div className='text-center'>
                        <div className='text-4xl font-black text-advay-slate tracking-tight'>
                          {currentLetter.name}
                        </div>
                        {currentLetter.pronunciation && (
                          <div className='text-xl text-text-secondary mt-3 font-bold'>
                            "{currentLetter.pronunciation}"
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Accuracy Bar */}
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className='bg-white border-3 border-[#F2CC8F] rounded-2xl p-5 shadow-[0_4px_0_#E5B86E] relative top-[-2px]'
                  >
                    <div className='flex justify-between items-center mb-3'>
                      <label
                        htmlFor='accuracy-progress'
                        className='text-text-secondary font-bold uppercase tracking-widest text-sm'
                      >
                        Tracing Accuracy
                      </label>
                      <span
                        className={`font-black text-lg ${accuracyColorClass}`}
                      >
                        {accuracy}%
                      </span>
                    </div>
                    <progress
                      id='accuracy-progress'
                      value={accuracy}
                      max={100}
                      className='w-full h-4 rounded-full'
                    />
                  </motion.div>

                  {/* Loading State with Pip */}
                  {isHandTrackingLoading && (
                    <div className='bg-white border border-border rounded-xl p-4 shadow-soft'>
                      <LoadingState message='Getting hand tracking ready...' />
                    </div>
                  )}

                  {/* Feedback */}
                  {feedback && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={`rounded-xl p-4 text-center font-semibold ${feedback?.includes('Great')
                        ? 'bg-green-500/20 border border-green-500/30 text-green-400'
                        : feedback?.includes('Good')
                          ? 'bg-yellow-500/20 border border-yellow-500/30 text-yellow-400'
                          : 'bg-red-500/20 border border-red-500/30 text-red-400'
                        }`}
                    >
                      {feedback}
                    </motion.div>
                  )}

                  {/* Permission Warning - Kid-Friendly Fallback */}
                  {showPermissionWarning && (
                    <div className='bg-blue-500/15 border-2 border-blue-400/40 rounded-2xl p-5 text-center shadow-lg'>
                      <div className='flex items-center justify-center gap-3 text-blue-300 font-bold text-lg'>
                        <span className='text-2xl'>✋</span>
                        <span>Using Finger Magic Mode!</span>
                      </div>
                      <p className='text-blue-200/90 text-base mt-2 leading-relaxed'>
                        Pip can't see your hand right now (the Forgetfulness Fog
                        is blocking the camera), but that's okay! You can use
                        your finger on the screen to draw and rescue letters!
                      </p>
                      <button
                        onClick={() => window.location.reload()}
                        className='mt-3 px-4 py-2 bg-blue-500/30 hover:bg-blue-500/50 text-blue-200 rounded-lg text-sm font-semibold transition'
                        type='button'
                      >
                        Try Hand Magic Again 🔄
                      </button>
                    </div>
                  )}
                </div>

                {/* Right column: setup + start */}
                <div className='space-y-6'>
                  {/* Menu Screen */}
                  <div className='bg-white border-3 border-[#F2CC8F] rounded-3xl p-8 md:p-12 text-center relative overflow-hidden shadow-[0_8px_0_#E5B86E] top-[-4px]'>
                    {/* Decorative elements */}
                    <div className='absolute inset-0 opacity-10 pointer-events-none'>
                      <div className='absolute top-10 left-10 w-32 h-32 rounded-full bg-vision-blue blur-3xl'></div>
                      <div className='absolute bottom-20 right-16 w-40 h-40 rounded-full bg-pip-orange blur-3xl'></div>
                      <div className='absolute top-1/2 right-1/4 w-24 h-24 rounded-full bg-success blur-3xl'></div>
                    </div>

                    {/* Mascot Preview */}
                    <div className='absolute -bottom-4 -left-4 opacity-90 pointer-events-none drop-shadow-xl'>
                      <Mascot state='happy' />
                    </div>

                    <div className='w-32 h-32 mx-auto mb-8 bg-pip-cream rounded-full flex items-center justify-center border-3 border-pip-orange/20 relative z-10'>
                      <img
                        src='/assets/images/onboarding-hand.svg'
                        alt='Hand tracking'
                        className='w-20 h-20 object-contain drop-shadow-[0_4px_0_#E5B86E]'
                      />
                    </div>
                    <h2 className='text-h2 md:text-4xl font-black mb-4 text-advay-slate tracking-tight relative z-10'>
                      Ready to Learn?
                    </h2>
                    <p className='text-text-secondary font-bold mb-10 max-w-sm mx-auto text-lg leading-relaxed relative z-10'>
                      Use your hand to trace letters! The camera will track your
                      finger movements.
                    </p>

                    {/* Language Selector */}
                    <div className='mb-8'>
                      <label
                        className='block text-lg font-bold text-text-primary mb-4'
                        htmlFor='alphabet-select'
                      >
                        Choose Your Alphabet
                      </label>
                      <form onSubmit={(e) => e.preventDefault()}>
                        <div className='flex flex-wrap gap-3 justify-center'>
                          {LANGUAGES.map((lang) => (
                            <button
                              type='button'
                              key={lang.code}
                              onClick={() => {
                                playClick();
                                setSelectedLanguage(lang.code);
                                setCurrentLetterIndex(0);
                              }}
                              className={`px-6 py-3 rounded-2xl font-extrabold text-lg transition-all transform hover:scale-105 ${selectedLanguage === lang.code
                                ? 'bg-pip-orange text-white shadow-[0_6px_0_#D4561C] relative top-[-6px]'
                                : 'bg-discovery-cream text-advay-slate border-2 border-[#F2CC8F] shadow-[0_4px_0_#E5B86E] relative top-[-4px] hover:bg-white'
                                }`}
                            >
                              <span className='mr-3 text-xl'>
                                <LanguageFlag code={lang.code} />
                              </span>
                              {lang.name}
                            </button>
                          ))}
                        </div>
                      </form>
                    </div>
                    <p className='text-center text-text-secondary mt-4 text-base'>
                      Progress is tracked separately for each language
                    </p>

                    <div className='text-lg text-text-secondary mb-8'>
                      Difficulty:{' '}
                      <span className='text-text-primary font-bold capitalize'>
                        {difficulty}
                      </span>
                    </div>

                    {/* Standardized Menu Controls */}
                    <div className='pb-10'>
                      {/* Spacer to ensure content doesn't overlap absolute controls */}
                      <GameControls
                        controls={menuControls}
                        position='bottom-center'
                      />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </section>
        )}

        {/* Wellness Timer */}
        <WellnessTimer
          onBreakReminder={() => {
            setWellnessReminderType('break');
            setShowWellnessReminder(true);
          }}
          onHydrationReminder={() => {
            setWellnessReminderType('water');
            setShowWellnessReminder(true);
          }}
          onStretchReminder={() => {
            setWellnessReminderType('stretch');
            setShowWellnessReminder(true);
          }}
          activeThreshold={WELLNESS_ACTIVE_THRESHOLD_MINUTES}
          hydrationThreshold={WELLNESS_HYDRATION_THRESHOLD_MINUTES}
          stretchThreshold={WELLNESS_STRETCH_THRESHOLD_MINUTES}
          screenTimeThreshold={WELLNESS_SCREEN_TIME_THRESHOLD_MINUTES}
        />

        {/* Wellness Reminder */}
        {overlayVisibility.wellnessReminder && wellnessReminderType && (
          <WellnessReminder
            alerts={wellnessAlerts}
            onAcknowledge={() => handleWellnessReminderDismiss()}
            onDismiss={() => handleWellnessReminderDismiss()}
          />
        )}

        {/* Pause Modal */}
        <AnimatePresence>
          <GamePauseModal
            isVisible={overlayVisibility.pauseModal}
            onResume={() => {
              setIsPaused(false);
              setFeedback("Welcome back! Let's draw more letters!");
            }}
            onExit={() => {
              setIsPaused(false);
              setShowExitModal(true);
            }}
          />
        </AnimatePresence>

        {/* Camera Error Modal */}
        <CameraRecoveryModal
          isOpen={showCameraErrorModal}
          errorMessage={cameraErrorMessage}
          onRetryCamera={handleRetryCamera}
          onContinueWithMouse={handleContinueWithMouse}
          onSaveAndExit={handleSaveAndExit}
        />

        {/* Exit Confirmation Modal */}
        <ExitConfirmationModal
          isOpen={showExitModal}
          onConfirmExit={handleConfirmExit}
          onCancelExit={handleCancelExit}
          progressLabel={`${streak > 0 ? `${streak} streak! ` : ''}${score} points, Letter ${currentLetterIndex + 1}`}
        />

        {/* Celebration Overlay */}
        <CelebrationOverlay
          show={overlayVisibility.celebrationOverlay}
          letter={currentLetter.char}
          accuracy={accuracy}
          message={celebrationTitle}
          onComplete={() => {
            setShowCelebration(false);
            nextLetter();
          }}
        />
      </>
    </GlobalErrorBoundary>
  );
});

export const AlphabetGame = React.memo(function AlphabetGameShell() {
  return (
    <GameShell
      gameId='alphabet-tracing'
      gameName='Alphabet Tracing'
      showWellnessTimer={true}
      enableErrorBoundary={true}
    >
      <AlphabetGameGame />
    </GameShell>
  );
});

export default AlphabetGame;
