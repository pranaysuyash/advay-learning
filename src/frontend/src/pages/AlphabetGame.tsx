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
} from 'react';
import { AnimatePresence, useReducedMotion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { getLettersForGame } from '../data/alphabets';
import {
  useSettingsStore,
  useAuthStore,
  useProgressStore,
  useProfileStore,
} from '../store';
import type { Profile } from '../store';
import { GameContainer } from '../components/GameContainer';
import { GameShell } from '../components/GameShell';
import { AccessDenied } from '../components/ui/AccessDenied';
import { useSubscription } from '../hooks/useSubscription';
import { GlobalErrorBoundary } from '../components/errors/GlobalErrorBoundary';
import type { GameControl } from '../components/GameControls';
import { GameTutorial } from '../components/GameTutorial';
import WellnessTimer from '../components/WellnessTimer';
import WellnessReminder from '../components/WellnessReminder';
import CameraRecoveryModal from '../components/CameraRecoveryModal';
import ExitConfirmationModal from '../components/ExitConfirmationModal';
import { CelebrationOverlay } from '../components/CelebrationOverlay';
import { HandTutorialOverlay } from '../components/game/AnimatedHand';
import { GamePauseModal } from '../components/game/GamePauseModal';
import useInactivityDetector from '../hooks/useInactivityDetector';
import { useGameCompletion } from '../hooks/useGameCompletion';
import { useTTS } from '../hooks/useTTS';
import { usePhonics } from '../hooks/usePhonics';
import { useCameraPermission } from '../hooks/useCameraPermission';
import { useInitialCameraPermission } from '../hooks/useInitialCameraPermission';
import { useAudio } from '../utils/hooks/useAudio';
import { WellnessMonitor } from '../components/game/WellnessMonitor';
import { useGameHandTracking } from '../hooks/useGameHandTracking';
import type { HandTrackingRuntimeMeta } from '../hooks/useHandTrackingRuntime';
import { GameCursor } from '../components/game/GameCursor';
import { createDefaultPinchState } from '../utils/pinchDetection';
import type { PinchState, Point } from '../types/tracking';
import { trackGameActivity } from '../games/analytics';
import type { TrackedHandFrame } from '../utils/handTrackingFrame';
import {
  ALPHABET_GAME_TUTORIAL_KEY,
  HAND_TRACKING_CONFIDENCE,
  HYDRATION_REMINDER_MINUTES,
  INACTIVITY_TIMEOUT_MS,
  WELLNESS_ACTIVE_THRESHOLD_MINUTES,
  WELLNESS_HYDRATION_THRESHOLD_MINUTES,
  WELLNESS_INTERVAL_MS,
  WELLNESS_SCREEN_TIME_THRESHOLD_MINUTES,
  WELLNESS_STRETCH_THRESHOLD_MINUTES,
} from './alphabet-game/constants';
import {
  loadAlphabetGameSession,
  saveAlphabetGameSession,
  warnAlphabetGame,
} from './alphabet-game/sessionPersistence';
import { getAlphabetGameOverlayVisibility } from './alphabet-game/overlayState';
import { useDrawingLoop } from './alphabet-game/useDrawingLoop';
import { usePointerHandlers } from './alphabet-game/usePointerHandlers';
import { useGameHandlers } from './alphabet-game/useGameHandlers';
import { ProfileLoadingView } from './alphabet-game/ProfileLoadingView';
import { GamePlayArea } from './alphabet-game/GamePlayArea';
import { PreGameMenu, LANGUAGES } from './alphabet-game/PreGameMenu';

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
  const isGuest = useAuthStore((state) => state.isGuest);
  const markLetterAttempt = useProgressStore(
    (state) => state.markLetterAttempt,
  );
  const fetchProfiles = useProfileStore((state) => state.fetchProfiles);

  const [error, setError] = useState<Error | null>(null);

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
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const [cursor, setCursor] = useState<{ x: number; y: number } | null>(null);
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
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);

  const { speak, isEnabled: ttsEnabled } = useTTS();
  const { completeGame } = useGameCompletion('alphabet-tracing');
  const { speakWordExample } = usePhonics();

  const [streak, setStreak] = useState<number>(0);
  const [scorePopup, setScorePopup] = useState<{ points: number } | null>(null);
  const [showStreakMilestone, setShowStreakMilestone] = useState(false);
  const [tutorialCompleted, setTutorialCompleted] = useState(false);
  const [showHandTutorial, setShowHandTutorial] = useState(false);
  const [highContrast, _setHighContrast] = useState(false);

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

  // Basic game controls and stubs - defined after state declarations below

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
  const handleAttentionAlert = useCallback(
    (alert: { level: string; message: string; timestamp: number }) => {
      if (alert.level === 'critical') {
        setWellnessReminderType('inactive');
        setShowWellnessReminder(true);
        setFeedback(alert.message);
      }
    },
    [],
  );

  const handlePostureAlert = useCallback(
    (alert: { level: string; message: string; timestamp: number }) => {
      setWellnessReminderType('break');
      setShowWellnessReminder(true);
      setFeedback(alert.message);
    },
    [],
  );

  const handleTrackingFrame = useCallback(
    (frame: TrackedHandFrame, _meta: HandTrackingRuntimeMeta) => {
      latestTrackingFrameRef.current = frame;
      // Update cursor position from index finger tip
      if (frame.indexTip) {
        setCursor({ x: frame.indexTip.x, y: frame.indexTip.y });
      } else {
        setCursor(null);
      }
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
  }, [isHandTrackingReady, isModelLoading, isPaused, isPlaying, useMouseMode]); // Remove startTracking from deps to prevent infinite loop

  // All game handler functions from useGameHandlers (injected after full state is available below)

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

    const loadProfiles = async () => {
      if (!isGuest) {
        try {
          await fetchProfiles();
        } catch {
          // ignore error; store handles it
        }
      }
    };
    loadProfiles();
  }, [isGuest, fetchProfiles]);

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
  const profilesError = useProfileStore((state) => state.error);

  // Single, stable initialization effect for profiles
  const hasFetchedRef = useRef(false);
  useEffect(() => {
    if (!isGuest && !hasFetchedRef.current && profiles.length === 0) {
      hasFetchedRef.current = true;
      fetchProfiles().catch(() => {
        // Error handled in store
      });
    }
  }, [isGuest, profiles.length]); // Remove fetchProfiles from deps to prevent infinite loop

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

  // Wrap completeGame to match useGameHandlers expected signature
  // Moved here after all state declarations to avoid "used before declaration" errors
  const handleGameComplete = useCallback(() => {
    // Track analytics
    trackGameActivity({
      activityType: 'letter_tracing',
      contentId: `letter-${currentLetter?.char || 'A'}`,
      score: Math.round(score),
      durationSeconds: 0, // gameTime tracking not implemented
      metadata: {
        language: selectedLanguage,
        accuracy: accuracy,
        streak,
      },
    });

    void completeGame({ score, level: 1 });
  }, [
    completeGame,
    score,
    currentLetter,
    selectedLanguage,
    accuracy,
    streak,
  ]);

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

  // Game handlers (all game action functions extracted to useGameHandlers)
  const {
    startGame,
    clearDrawing,
    checkProgress,
    nextLetter,
    goToHome,
    handleCameraError,
    handleRetryCamera,
    handleContinueWithMouse,
    handleSaveAndExit,
    handleConfirmExit,
    handleCancelExit,
    handleTutorialComplete,
    handleSkipTutorial,
    handleSkipCameraTutorial,
    handleHandTutorialComplete,
  } = useGameHandlers({
    onGameComplete: handleGameComplete,
    requestCameraPermission,
    cameraPermissionError,
    isHandTrackingReady,
    startTracking,
    navigate,
    ttsEnabled,
    speak,
    useMouseMode,
    resolvedProfileId,
    selectedLanguage,
    currentLetter,
    streak,
    currentLetterIndex,
    score,
    LETTERS,
    showExitModal,
    showCameraErrorModal,
    isPaused,
    canvasRef,
    drawnPointsRef,
    pinchStateRef,
    letterAttemptCountsRef,
    pointerDownRef,
    lastDrawPointRef,
    promptTimeoutRef,
    setIsPlaying,
    setIsDrawing,
    setIsPinching,
    setFeedback,
    setAccuracy,
    setCameraPermission,
    setShowPermissionWarning,
    setUseMouseMode,
    setIsHandTrackingLoading,
    setIsPaused,
    setShowCameraErrorModal,
    setShowExitModal,
    setCameraErrorMessage,
    setStreak,
    setScore,
    setScorePopup,
    setShowStreakMilestone,
    setCelebrationTitle,
    setShowCelebration,
    setCurrentLetterIndex,
    setShowLetterPrompt,
    setTutorialCompleted,
    setShowHandTutorial,
    setShowWellnessReminder,
    setWellnessReminderType,
    markLetterAttempt,
    playCelebration,
    playPop,
    playError,
    speakWordExample,
  });

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
    const update = () => {
      // Pending count tracking removed - progress saved directly via useGameProgress
      setPendingCount(0);
    };
    update();
  }, [resolvedProfileId]);

  // Drawing loop (RAF-based hand tracking + pinch)
  useDrawingLoop({
    isPlaying,
    isPaused,
    currentLetterChar: currentLetter.char,
    currentLetterColor: currentLetter.color,
    showHints,
    useMouseMode,
    canvasRef,
    webcamRef,
    latestTrackingFrameRef,
    drawnPointsRef,
    pinchStateRef,
    smoothedTipRef,
    isPinchingRef,
    isHandPresentRef,
    isDrawingRef,
    rafIdRef,
    lastDrawPointRef,
    setIsPinching,
    setIsHandPresent,
  });

  // Pointer (mouse/touch) handlers
  const {
    handleCanvasPointerDown,
    handleCanvasPointerMove,
    handleCanvasPointerUpOrCancel,
  } = usePointerHandlers({
    isPlaying,
    isDrawing,
    canvasRef,
    drawnPointsRef,
    lastDrawPointRef,
    pointerDownRef,
    resetInactivityTimer,
  });

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
        label: 'Done',
        ariaLabel: 'Done tracing - check my work',
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
          : useMouseMode || cameraPermission === 'denied'
            ? 'Play with Mouse/Touch'
            : 'Start Learning!',
        onClick: startGame,
        variant: 'success',
        disabled: isModelLoading,
      },
    ],
    [goToHome, isModelLoading, cameraPermission, useMouseMode, startGame],
  );

  // If no profile is available yet, show a loading state with option to continue as guest
  if (!resolvedProfileId) {
    return (
      <ProfileLoadingView
        isLoading={isProfilesLoading}
        error={profilesError}
        profiles={profiles}
        hasFetchedRef={hasFetchedRef}
        fetchProfiles={fetchProfiles}
        navigate={navigate}
      />
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

  if (subLoading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-red-500'></div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <AccessDenied gameName='Alphabet Tracing' gameId='alphabet-tracing' />
    );
  }

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

  return (
    <GlobalErrorBoundary>
      <WellnessMonitor
        videoRef={webcamRef as unknown as React.RefObject<HTMLVideoElement>}
        isActive={isPlaying && !isPaused && !useMouseMode}
        onAttentionAlert={handleAttentionAlert}
        onPostureAlert={handlePostureAlert}
      />
      <div ref={gameAreaRef} className='relative w-full h-full'>
        {!tutorialCompleted && (
          <GameTutorial
            onComplete={handleTutorialComplete}
            onSkip={handleSkipTutorial}
            onSkipCamera={handleSkipCameraTutorial}
          />
        )}

        <HandTutorialOverlay
          isOpen={showHandTutorial}
          onComplete={handleHandTutorialComplete}
        />

        {/* Game Area - Full Screen Mode */}
        {isPlaying ? (
          <GamePlayArea
            webcamRef={webcamRef}
            canvasRef={canvasRef}
            selectedLanguageName={selectedLanguageName}
            score={score}
            currentLetterIndex={currentLetterIndex}
            onShowExitModal={() => setShowExitModal(true)}
            onTogglePause={() => setIsPaused((prev) => !prev)}
            isHandTrackingReady={isHandTrackingReady}
            isPlaying={isPlaying}
            accuracy={accuracy}
            accuracyColorClass={accuracyColorClass}
            highContrast={highContrast}
            onCameraPermissionChange={handleCameraPermissionChange}
            onCameraError={handleCameraError}
            canvasEvents={{
              onPointerDown: handleCanvasPointerDown,
              onPointerMove: handleCanvasPointerMove,
              onPointerUp: handleCanvasPointerUpOrCancel,
              onPointerCancel: handleCanvasPointerUpOrCancel,
              onPointerLeave: handleCanvasPointerUpOrCancel,
            }}
            showHints={showHints}
            isDrawing={isDrawing}
            useMouseMode={useMouseMode}
            isHandPresent={isHandPresent}
            isPinching={isPinching}
            showLetterPrompt={showLetterPrompt}
            currentLetter={currentLetter}
            mascotState={mascotState}
            mascotMessage={mascotMessage}
            gameControls={gameControls}
            streak={streak}
            scorePopup={scorePopup}
            showStreakMilestone={showStreakMilestone}
          />
        ) : (
          <PreGameMenu
            score={score}
            streak={streak}
            currentLetterIndex={currentLetterIndex}
            letters={LETTERS}
            pendingCount={pendingCount}
            currentLetter={currentLetter}
            accuracy={accuracy}
            accuracyColorClass={accuracyColorClass}
            isHandTrackingLoading={isHandTrackingLoading}
            feedback={feedback}
            showPermissionWarning={showPermissionWarning}
            selectedLanguage={selectedLanguage}
            onLanguageSelect={(lang) => {
              setSelectedLanguage(lang);
              setCurrentLetterIndex(0);
            }}
            onIndexReset={() => setCurrentLetterIndex(0)}
            difficulty={difficulty}
            menuControls={menuControls}
            onPlayClick={startGame}
            playClick={playClick}
          />
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
          progressLabel={`${
            streak > 0 ? `${streak} streak! ` : ''
          }${score} points, Letter ${currentLetterIndex + 1}`}
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

        {/* Hand tracking cursor */}
        {cursor && (
          <GameCursor
            position={cursor}
            coordinateSpace='normalized'
            containerRef={gameAreaRef}
            isPinching={isPinching}
            isHandDetected={isHandTrackingReady}
            size={64}
            color='#22c55e'
          />
        )}
      </div>
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
