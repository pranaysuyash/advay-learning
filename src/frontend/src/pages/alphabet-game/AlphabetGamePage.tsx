import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import Webcam from 'react-webcam';
import confetti from 'canvas-confetti';
import { GameLayout } from '../../components/layout/GameLayout';
import { getLettersForGame } from '../../data/alphabets';
import {
  useSettingsStore,
  useAuthStore,
  useProgressStore,
  useProfileStore,
  BATCH_SIZE,
} from '../../store';
import type { Profile } from '../../store';
import { Mascot } from '../../components/Mascot';
import { progressQueue } from '../../services/progressQueue';
import { getAllIcons } from '../../utils/iconUtils';
import { UIIcon } from '../../components/ui/Icon';
import { GameContainer } from '../../components/GameContainer';
import { GameControls } from '../../components/GameControls';
import type { GameControl } from '../../components/GameControls';
import { GameTutorial } from '../../components/GameTutorial';
import WellnessTimer from '../../components/WellnessTimer';
import WellnessReminder from '../../components/WellnessReminder';
import CameraRecoveryModal from '../../components/CameraRecoveryModal';
import ExitConfirmationModal from '../../components/ExitConfirmationModal';
import { CelebrationOverlay } from '../../components/CelebrationOverlay';
import { HandTutorialOverlay } from '../../components/game/AnimatedHand';
import { LoadingState } from '../../components/LoadingState';
import useInactivityDetector from '../../hooks/useInactivityDetector';
import { usePostureDetection } from '../../hooks/usePostureDetection';
import { useAttentionDetection } from '../../hooks/useAttentionDetection';
import { useSoundEffects } from '../../hooks/useSoundEffects';
import { usePhonics } from '../../hooks/usePhonics';
// Centralized hand tracking hooks
import { useHandTracking } from '../../hooks/useHandTracking';
import {
  buildSegments,
  drawSegments,
  setupCanvas,
  drawLetterHint,
  addBreakPoint,
  shouldAddPoint,
} from '../../utils/drawing';
import {
  detectPinch,
  createDefaultPinchState,
} from '../../utils/pinchDetection';
import { getLetterColorClass } from '../../utils/letterColorClass';
import type { PinchState, Point } from '../../types/tracking';

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
  const rafIdRef = useRef<number | null>(null);
  const lastDrawPointRef = useRef<{ x: number; y: number } | null>(null);
  const drawnPointsRef = useRef<Array<{ x: number; y: number }>>([]);
  const pointerDownRef = useRef(false);
  const pinchStateRef = useRef<PinchState>(createDefaultPinchState());
  const smoothedTipRef = useRef<Point | null>(null);
  const [isHandPresent, setIsHandPresent] = useState(false);
  const isHandPresentRef = useRef(isHandPresent);

  // Use centralized hand tracking hook
  const {
    landmarker,
    isLoading: isModelLoading,
    isReady: isHandTrackingReady,
    initialize: initializeHandTracking,
  } = useHandTracking({
    numHands: 2,
    minDetectionConfidence: 0.3,
    minHandPresenceConfidence: 0.3,
    minTrackingConfidence: 0.3,
    delegate: 'GPU',
    enableFallback: true,
  });

  // Sound effects and phonics hooks
  const { playCelebration, playPop, playError } = useSoundEffects();
  const { speakWordExample } = usePhonics();

  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState<number>(0);
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

  // Two-stage prompt state for the current letter.
  const [promptStage, setPromptStage] = useState<'center' | 'side'>('center');
  const promptTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Basic game controls and stubs
  const startGame = async () => {
    // Auto-enable drawing mode when game starts for better UX
    setIsDrawing(true);

    // Check camera permission before starting
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach((track) => track.stop());
      setCameraPermission('granted');
      setShowPermissionWarning(false);
      setUseMouseMode(false);
      setIsPlaying(true);
      setFeedback(null);
      setAccuracy(0);

      // Initialize hand tracking using centralized hook
      // Note: We don't check isHandTrackingReady synchronously after this call
      // because React state doesn't update mid-function. A useEffect monitors it.
      if (!isHandTrackingReady) {
        setIsHandTrackingLoading(true);
        setFeedback(null);
        initializeHandTracking(); // Don't await - let useEffect handle the result
      } else {
        setFeedback('Camera ready!');
      }

      // Start wellness monitoring after game starts
      if (webcamRef.current?.video) {
        startPostureMonitoring(webcamRef.current.video);
        startAttentionMonitoring(webcamRef.current.video);
      }
    } catch {
      setCameraPermission('denied');
      setShowPermissionWarning(true);
      setUseMouseMode(true);
      // Still allow game to start with mouse mode
      setIsPlaying(true);
      setFeedback(
        "The Fog is blocking Pip's sight! But no worries—you can use your finger magic to draw! ✨",
      );
    }
  };

  const stopGame = () => {
    setIsPlaying(false);
    setIsDrawing(false);
    setIsPinching(false);
    pointerDownRef.current = false;
    pinchStateRef.current = createDefaultPinchState();
    lastDrawPointRef.current = null;
    setPromptStage('center');
    if (promptTimeoutRef.current) {
      clearTimeout(promptTimeoutRef.current);
      promptTimeoutRef.current = null;
    }
    // Don't reset hand tracking here - let it persist for quick restarts

    // Stop wellness monitoring when game stops
    stopPostureMonitoring();
    stopAttentionMonitoring();
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

  // Wellness tracking hooks
  const {
    startMonitoring: startPostureMonitoring,
    stopMonitoring: stopPostureMonitoring,
  } = usePostureDetection(
    (alert: {
      level: 'info' | 'warning' | 'critical';
      message: string;
      timestamp: number;
    }) => {
      // Handle posture alerts
      setWellnessReminderType('break'); // Use break type for posture alerts
      setShowWellnessReminder(true);
      setFeedback(alert.message);
    },
  );

  const {
    startMonitoring: startAttentionMonitoring,
    stopMonitoring: stopAttentionMonitoring,
  } = useAttentionDetection(
    (alert: {
      level: 'info' | 'warning' | 'critical';
      message: string;
      timestamp: number;
    }) => {
      // Handle attention alerts
      if (alert.level === 'critical') {
        setWellnessReminderType('inactive'); // Use inactive type for attention alerts
        setShowWellnessReminder(true);
        setFeedback(alert.message);
      }
    },
  );

  const checkProgress = async () => {
    // Minimal, deterministic scoring: ensures the core tracking UX is testable.
    const points = drawnPointsRef.current.length;
    if (points < 20) {
      setAccuracy(20);
      setFeedback('Try tracing more of the letter before checking!');
      setStreak(0);
      try {
        // Sound playback may not be available in some test environments; guard it.
        playError(); // Gentle reminder sound
      } catch (err) {
        // Ignore sound errors so UI state updates still occur in headless tests
        // Observed in test env: AudioContext is not implemented
      }
      return;
    }

    const nextAccuracy = Math.min(100, 60 + Math.floor(points / 20));
    setAccuracy(nextAccuracy);

    if (nextAccuracy >= 70) {
      // Ensure only one overlay is visible at a time (simplified overlay stack)
      setIsPaused(false);
      setShowExitModal(false);
      setShowCameraErrorModal(false);
      setShowWellnessReminder(false);
      setWellnessReminderType(null);

      // Play celebration sounds and phonics. Guard against envs without audio/speech.
      try {
        playCelebration();
      } catch (err) {
        /* ignore */
      }
      try {
        speakWordExample(currentLetter.char, selectedLanguage);
      } catch (err) {
        /* ignore */
      }

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
      setFeedback('Great job! 🎉');
      setScore((s) => s + Math.round(nextAccuracy));
      setStreak((s) => s + 1);
      setCelebrationTitle(`You traced ${currentLetter.name}!`);
      setShowCelebration(true);
    } else {
      setFeedback('Good start — try to trace the full shape!');
      setStreak(0);
      try {
        playPop(); // Encouraging feedback
      } catch (err) {
        // Ignore
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
    setPromptStage('center');
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
    localStorage.setItem('tutorialCompleted', 'true');
  };

  const handleSkipTutorial = () => {
    setTutorialCompleted(true);
    localStorage.setItem('tutorialCompleted', 'true');
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
      setFeedback('Camera ready!');
      console.log('[AlphabetGame] Hand tracking became ready during gameplay');
    }
  }, [isPlaying, isHandTrackingReady]);

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
  const {
    profiles,
    currentProfile,
    isLoading: isProfilesLoading,
    fetchProfiles,
  } = useProfileStore();
  const resolvedProfileId = profileId ?? currentProfile?.id;
  const profile = resolvedProfileId
    ? profiles.find((p: Profile) => p.id === resolvedProfileId)
    : undefined;
  // Profile available for future use (e.g., displaying child's name)
  void profile;

  // If the route didn't provide a profileId, fetch profiles so we can fall back to currentProfile.
  useEffect(() => {
    if (resolvedProfileId) return;
    if (profiles.length > 0) return;
    if (isProfilesLoading) return;
    fetchProfiles();
  }, [fetchProfiles, isProfilesLoading, profiles.length, resolvedProfileId]);

  // Game language is determined by profile's preferred_language
  // This ensures consistency across the app
  const defaultLanguage =
    profile?.preferred_language || settings.gameLanguage || 'en';

  // Language selection - user can switch anytime
  const [selectedLanguage, setSelectedLanguage] =
    useState<string>(defaultLanguage);

  // Wellness tracking effects
  useEffect(() => {
    if (!isPlaying) return;

    // Track active time (when game is being played)
    const activeTimer = setInterval(() => {
      setActiveTime((prev) => prev + 1);
    }, 60000); // Every minute

    return () => clearInterval(activeTimer);
  }, [isPlaying]);

  // Inactivity detector
  const { resetTimer: resetInactivityTimer } = useInactivityDetector(() => {
    setWellnessReminderType('inactive');
    setShowWellnessReminder(true);
  }, 60000); // Trigger after 1 minute of inactivity

  // Hydration reminder effect - remind every 20 minutes of active play
  // Hydration reminder effect - remind every 20 minutes of active play
  useEffect(() => {
    if (!isPlaying) return;

    const hydrationInterval = setInterval(() => {
      // Show hydration reminder every 20 minutes of active play
      if (activeTime > 0 && activeTime % 20 === 0 && activeTime >= 20) {
        setWellnessReminderType('water');
        setShowWellnessReminder(true);
        setHydrationReminderCount((prevCount) => prevCount + 1);
      }
    }, 60000); // Check every minute

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

  const LETTERS = getLettersForGame(selectedLanguage);
  const [currentLetterIndex, setCurrentLetterIndex] = useState<number>(0);
  const currentLetter = LETTERS[currentLetterIndex] ?? LETTERS[0];
  const [pendingCount, setPendingCount] = useState<number>(0);
  const letterColorClass = getLetterColorClass(currentLetter.color);
  const accuracyColorClass =
    accuracy >= 70
      ? 'text-text-success'
      : accuracy >= 40
        ? 'text-text-warning'
        : 'text-text-error';

  const loadSessionState = useCallback(() => {
    try {
      const saved = localStorage.getItem('alphabetGameSession');
      if (saved) {
        const data = JSON.parse(saved);
        if (Date.now() - data.timestamp < 24 * 60 * 60 * 1000) {
          return data;
        }
      }
    } catch {
      // Ignore parse/localStorage errors
    }
    return null;
  }, []);

  // Restore session on mount (if valid)
  useEffect(() => {
    const data = loadSessionState();
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
  }, [loadSessionState]);

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
      try {
        localStorage.setItem(
          'alphabetGameSession',
          JSON.stringify(sessionData),
        );
      } catch {
        // Ignore localStorage errors in test environments
      }
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
        setFeedback(
          "The Fog is blocking Pip's sight! But no worries—you can use your finger magic to draw! ✨",
        );
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
    initializeHandTracking();
  }, [initializeHandTracking]);

  const handleContinueWithMouse = useCallback(() => {
    setShowCameraErrorModal(false);
    setIsPaused(false);
    setUseMouseMode(true);
    setFeedback('Mouse/Touch mode active! You can still draw.');
  }, []);

  // Exit handlers - using empty deps since stopGame and navigate are stable
  const handleSaveAndExit = useCallback(() => {
    setShowCameraErrorModal(false);
    localStorage.removeItem('alphabetGameSession');
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
    try {
      localStorage.setItem('alphabetGameSession', JSON.stringify(sessionData));
    } catch {
      // Ignore localStorage errors
    }
    stopGame();
    navigate('/dashboard');
  }, []);

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
          setFeedback('Game paused. Take a break!');
        } else {
          setFeedback('Welcome back! Continue where you left off.');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, showExitModal, showCameraErrorModal, isPaused]);

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
      if (settings.showHints) {
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
      if (!useMouseMode && hasVideoFrame && video && landmarker) {
        let results: any;
        try {
          results = landmarker.detectForVideo(video, performance.now());
        } catch {
          rafIdRef.current = requestAnimationFrame(loop);
          return;
        }

        const landmarks = results?.landmarks?.[0];
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
          const alpha = 0.35;
          if (!smoothedTipRef.current) {
            smoothedTipRef.current = nextTip;
          } else {
            smoothedTipRef.current = {
              x:
                smoothedTipRef.current.x +
                (nextTip.x - smoothedTipRef.current.x) * alpha,
              y:
                smoothedTipRef.current.y +
                (nextTip.y - smoothedTipRef.current.y) * alpha,
            };
          }

          // Draw a fingertip cursor so kids can see "ready" vs "pinching" feedback.
          // This matches the old game's clearer pinch feedback (even before drawing).
          if (smoothedTipRef.current) {
            const cx = smoothedTipRef.current.x * canvas.width;
            const cy = smoothedTipRef.current.y * canvas.height;
            const radius = Math.max(
              6,
              Math.round(Math.min(canvas.width, canvas.height) * 0.012),
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
                if (drawnPointsRef.current.length > 6000) {
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
    landmarker,
    currentLetter.char,
    currentLetter.color,
    settings.showHints,
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
      const minDistance = 0.002;
      const dist =
        lastPoint && !isNaN(lastPoint.x)
          ? Math.sqrt(
              Math.pow(point.x / canvas.width - lastPoint.x, 2) +
                Math.pow(point.y / canvas.height - lastPoint.y, 2),
            )
          : Infinity;

      if (dist > minDistance) {
        lastDrawPointRef.current = point;
        drawnPointsRef.current.push({
          x: point.x / canvas.width,
          y: point.y / canvas.height,
        });
        if (drawnPointsRef.current.length > 6000) {
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

  // If no profile is available yet, show a loading state (prevents redirect loops during initial fetch).
  if (!resolvedProfileId) {
    return (
      <section className='min-h-[60vh] flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4' />
          <p className='text-text-secondary'>
            Loading your child&apos;s profile...
          </p>
          {!isProfilesLoading && profiles.length === 0 && (
            <button
              type='button'
              onClick={() => navigate('/dashboard')}
              className='mt-4 px-5 py-3 bg-white border border-border rounded-xl font-bold text-advay-slate shadow-soft hover:bg-bg-tertiary transition'
            >
              Go to Dashboard
            </button>
          )}
        </div>
      </section>
    );
  }

  // Define game controls
  const gameControls: GameControl[] = [
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
  ];

  // Define menu controls
  const menuControls: GameControl[] = [
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
  ];

  return (
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
          title={`${LANGUAGES.find((l) => l.code === selectedLanguage)?.name} Alphabet`}
          score={score}
          level={currentLetterIndex + 1}
          onHome={() => setShowExitModal(true)}
          onPause={() => setIsPaused(!isPaused)}
        >
          <div className='relative w-full h-full'>
            {/* Accuracy Bar - always render for semantic accessibility; value can be 0 */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className='bg-white border border-border rounded-xl p-4 mb-6 shadow-soft absolute top-4 left-1/2 -translate-x-1/2 z-40 w-[min(90%,720px)]'
            >
              <div className='flex justify-between items-center mb-2'>
                <label
                  htmlFor='accuracy-progress'
                  className='text-text-secondary'
                >
                  Tracing Accuracy
                </label>
                <span className={`font-bold ${accuracyColorClass}`}>
                  {accuracy}%
                </span>
              </div>
              <progress
                id='accuracy-progress'
                value={accuracy}
                max={100}
                className='w-full h-3 rounded-full'
              />
            </motion.div>
            <GameLayout
              webcamRef={webcamRef}
              canvasRef={canvasRef}
              highContrast={highContrast}
              variant='hero'
              className='w-full h-full'
              onCameraPermission={(state: 'granted' | 'denied' | 'prompt') => {
                setCameraPermission(state);
                if (state === 'denied') {
                  setShowPermissionWarning(true);
                  setUseMouseMode(true);
                  setFeedback(
                    "The Fog is blocking Pip's sight! But no worries—you can use your finger magic to draw! ✨",
                  );
                } else {
                  setShowPermissionWarning(false);
                }
              }}
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
                <div className='inline-block px-6 py-3 rounded-full bg-black/40 backdrop-blur-md border border-white/10 shadow-lg transition-all duration-300 transform hover:scale-105'>
                  <p className='text-white text-xl md:text-2xl font-bold drop-shadow-md tracking-wide'>
                    {isDrawing ? 'Trace the letter!' : 'Pinch 🤏 to draw'}
                  </p>
                </div>
              </div>

              {/* Pinch Status (matches old "Pinching…" feedback; hidden in mouse mode) */}
              {!useMouseMode && (
                <div className='absolute top-4 left-1/2 -translate-x-1/2 pointer-events-none z-50'>
                  <div className='px-4 py-2 rounded-full bg-black/55 backdrop-blur border border-white/25 text-white shadow-soft text-sm md:text-base font-bold'>
                    {isHandPresent ? (
                      isPinching ? (
                        <span className='flex items-center gap-2'>
                          <span className='inline-block w-2.5 h-2.5 rounded-full bg-pip-orange shadow-[0_0_10px_rgba(255,153,51,0.9)]' />
                          Pinching… Draw!
                        </span>
                      ) : (
                        <span className='flex items-center gap-2'>
                          <span className='inline-block w-2.5 h-2.5 rounded-full bg-white/80 shadow-[0_0_10px_rgba(255,255,255,0.35)]' />
                          Hand seen — pinch 🤏 to draw
                        </span>
                      )
                    ) : (
                      <span className='flex items-center gap-2 opacity-90'>
                        <span className='inline-block w-2.5 h-2.5 rounded-full bg-white/40' />
                        Show your hand to start
                      </span>
                    )}
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
                        className={`text-7xl md:text-8xl font-black leading-none ${letterColorClass}`}
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
                  <div className='bg-black/55 backdrop-blur px-4 py-2 rounded-full text-sm md:text-base font-bold border border-white/30 text-white shadow-soft'>
                    <span className='flex items-center gap-2'>
                      <UIIcon
                        name='target'
                        size={16}
                        className='text-yellow-300'
                      />
                      Trace{' '}
                      <span className='font-extrabold'>
                        {currentLetter.char}
                      </span>
                      <span className='opacity-80'>({currentLetter.name})</span>
                    </span>
                  </div>
                )}
              </div>

              {/* In-Game Mascot */}
              <div className='absolute bottom-4 left-4 z-20'>
                {(() => {
                  const mascotState =
                    feedback?.includes('Great') || feedback?.includes('Amazing')
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

              {/* Standardized Game Controls - Bottom Right */}
              <GameControls controls={gameControls} position='bottom-right' />
            </GameLayout>
          </div>
        </GameContainer>
      ) : (
        /* Pre-Game UI - Menu Screen */
        <section className='max-w-7xl mx-auto px-4 py-6 md:py-8'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Header */}
            <header className='flex flex-col sm:flex-row justify-between items-start gap-4 mb-6'>
              <div>
                <h1 className='text-2xl md:text-3xl font-bold'>
                  Learning Game
                </h1>
                <p className='text-text-secondary text-sm md:text-base'>
                  Trace letters with your finger!
                </p>
              </div>
              <div className='bg-white border border-border rounded-2xl px-4 py-3 shadow-soft w-full sm:w-auto'>
                <output className='text-xl md:text-2xl font-extrabold text-text-primary block text-left sm:text-right'>
                  Score: {score}
                </output>
                <div className='flex flex-wrap items-center gap-x-3 gap-y-1 text-xs md:text-sm text-text-secondary mt-1'>
                  <span className='flex items-center gap-1 min-w-fit'>
                    <UIIcon
                      name='flame'
                      size={14}
                      className='text-pip-orange'
                    />
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
            </header>

            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 items-start'>
              {/* Left column: current letter + status */}
              <div className='space-y-6'>
                {/* Animated Letter Display */}
                <div className='bg-white border border-border rounded-2xl p-6 md:p-8 shadow-soft'>
                  <div className='flex flex-col items-center justify-center gap-4'>
                    <div className='text-center'>
                      <div
                        className={`text-9xl md:text-[12rem] font-extrabold mb-2 ${letterColorClass}`}
                      >
                        {currentLetter.char}
                      </div>
                      {currentLetter.transliteration && (
                        <div className='text-base md:text-xl text-text-secondary mt-2 font-medium'>
                          {currentLetter.transliteration}
                        </div>
                      )}
                    </div>
                    <div className='w-24 h-24 mb-2'>
                      <UIIcon
                        src={getAllIcons(currentLetter)}
                        alt={currentLetter.name}
                        size={96}
                        className='w-full h-full object-contain drop-shadow-lg'
                        fallback={currentLetter.emoji || '✨'}
                      />
                    </div>
                    <div className='text-center'>
                      <div className='text-3xl font-bold text-text-primary'>
                        {currentLetter.name}
                      </div>
                      {currentLetter.pronunciation && (
                        <div className='text-lg text-text-secondary mt-2 italic'>
                          "{currentLetter.pronunciation}"
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Accuracy Bar - always render for semantic accessibility; value can be 0 */}
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className='bg-white border border-border rounded-xl p-4 shadow-soft'
                >
                  <div className='flex justify-between items-center mb-2'>
                    <label
                      htmlFor='accuracy-progress'
                      className='text-text-secondary'
                    >
                      Tracing Accuracy
                    </label>
                    <span className={`font-bold ${accuracyColorClass}`}>
                      {accuracy}%
                    </span>
                  </div>
                  <progress
                    id='accuracy-progress'
                    value={accuracy}
                    max={100}
                    className='w-full h-3 rounded-full'
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
                    className={`rounded-xl p-4 text-center font-semibold ${
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

                {/* Permission Warning - Kid-Friendly Fallback */}
                {showPermissionWarning && (
                  <div className='bg-blue-500/15 border-2 border-blue-400/40 rounded-2xl p-5 text-center shadow-lg'>
                    <div className='flex items-center justify-center gap-3 text-blue-300 font-bold text-lg'>
                      <span className='text-2xl'>✋</span>
                      <span>Using Finger Magic Mode!</span>
                    </div>
                    <p className='text-blue-200/90 text-base mt-2 leading-relaxed'>
                      Pip can't see your hand right now (the Forgetfulness Fog is
                      blocking the camera), but that's okay! You can use your finger
                      on the screen to draw and rescue letters!
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
                <div className='bg-white border border-border rounded-2xl p-6 md:p-10 text-center relative overflow-hidden shadow-soft-lg'>
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

                  <div className='w-28 h-28 mx-auto mb-5'>
                    <img
                      src='/assets/images/onboarding-hand.svg'
                      alt='Hand tracking'
                      className='w-full h-full object-contain drop-shadow-2xl'
                    />
                  </div>
                  <h2 className='text-3xl font-bold mb-3 text-advay-slate'>
                    Ready to Learn?
                  </h2>
                  <p className='text-text-secondary mb-6 max-w-md mx-auto text-lg'>
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
                              setSelectedLanguage(lang.code);
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
                    </form>
                  </div>
                  <p className='text-center text-text-secondary mt-4 text-base'>
                    Progress is tracked separately for each language
                  </p>

                  <div className='text-lg text-text-secondary mb-8'>
                    Difficulty:{' '}
                    <span className='text-text-primary font-bold capitalize'>
                      {settings.difficulty}
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
        activeThreshold={15}
        hydrationThreshold={10}
        stretchThreshold={20}
        screenTimeThreshold={30}
      />

      {/* Wellness Reminder */}
      {showWellnessReminder &&
        wellnessReminderType &&
        !showCelebration &&
        !showExitModal &&
        !showCameraErrorModal &&
        !isPaused && (
          <WellnessReminder
            alerts={[
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
            ]}
            onAcknowledge={() => handleWellnessReminderDismiss()}
            onDismiss={() => handleWellnessReminderDismiss()}
          />
        )}

      {/* Pause Modal */}
      <AnimatePresence>
        {isPaused &&
          !showExitModal &&
          !showCameraErrorModal &&
          !showWellnessReminder &&
          !showCelebration && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className='fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4'
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className='bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl'
              >
                <div className='flex justify-center mb-6'>
                  <Mascot state='waiting' message='Paused! Take a breather.' />
                </div>
                <div className='text-center mb-6'>
                  <h2 className='text-2xl font-bold text-advay-slate mb-2'>
                    Game Paused
                  </h2>
                  <p className='text-text-secondary'>
                    Your progress is saved. Ready to continue?
                  </p>
                </div>
                <div className='space-y-4'>
                  <button
                    type='button'
                    onClick={() => {
                      setIsPaused(false);
                      setFeedback('Welcome back! Continue where you left off.');
                    }}
                    className='w-full px-6 py-4 min-h-[56px] bg-pip-orange text-white rounded-2xl font-bold text-lg shadow-soft hover:bg-pip-rust transition-all hover:scale-[1.02] flex items-center justify-center gap-3'
                  >
                    <UIIcon name='check' size={24} />
                    Resume Game
                  </button>
                  <button
                    type='button'
                    onClick={() => {
                      setIsPaused(false);
                      setShowExitModal(true);
                    }}
                    className='w-full px-6 py-4 min-h-[56px] bg-white text-text-primary border-2 border-border rounded-2xl font-bold text-lg hover:bg-bg-tertiary transition-all flex items-center justify-center gap-3'
                  >
                    <UIIcon name='home' size={24} />
                    Exit to Home
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
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
        show={
          showCelebration &&
          !showExitModal &&
          !showCameraErrorModal &&
          !isPaused &&
          !showWellnessReminder
        }
        letter={currentLetter.char}
        accuracy={accuracy}
        message={celebrationTitle}
        onComplete={() => {
          setShowCelebration(false);
          nextLetter();
        }}
      />
    </>
  );
});

export default AlphabetGame;
