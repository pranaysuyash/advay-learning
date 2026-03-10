import { useCallback } from 'react';
import confetti from 'canvas-confetti';
import { triggerHaptic } from '../../utils/haptics';
import { createDefaultPinchState } from '../../utils/pinchDetection';
import type { PinchState } from '../../types/tracking';
import { recordProgressActivity } from '../../services/progressTracking';
import {
  ACCURACY_POINT_DIVISOR,
  ACCURACY_SUCCESS_THRESHOLD,
  ALPHABET_GAME_TUTORIAL_KEY,
  BASE_ACCURACY,
  CONFETTI_ORIGIN_Y,
  CONFETTI_PARTICLE_COUNT,
  CONFETTI_SPREAD,
  MAX_ACCURACY,
  MIN_DRAW_POINTS_FOR_CHECK,
  MIN_FEEDBACK_ACCURACY,
} from './constants';
import {
  STREAK_MILESTONE_INTERVAL,
  STREAK_MILESTONE_DURATION_MS,
} from '../../games/constants';
import {
  clearAlphabetGameSession,
  saveAlphabetGameSession,
  warnAlphabetGame,
} from './sessionPersistence';

interface UseGameHandlersProps {
  onGameComplete: () => void;
  requestCameraPermission: () => Promise<boolean>;
  cameraPermissionError: Error | string | null;
  isHandTrackingReady: boolean;
  startTracking: () => void;
  navigate: (path: string) => void;
  ttsEnabled: boolean;
  speak: (text: string) => Promise<void>;
  useMouseMode: boolean;
  resolvedProfileId: string | undefined;
  selectedLanguage: string;
  currentLetter: { char: string; name: string; color: string };
  streak: number;
  currentLetterIndex: number;
  score: number;
  LETTERS: Array<any>;
  showExitModal: boolean;
  showCameraErrorModal: boolean;
  isPaused: boolean;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  drawnPointsRef: React.MutableRefObject<Array<{ x: number; y: number }>>;
  pinchStateRef: React.MutableRefObject<PinchState>;
  letterAttemptCountsRef: React.MutableRefObject<Record<string, number>>;
  pointerDownRef: React.MutableRefObject<boolean>;
  lastDrawPointRef: React.MutableRefObject<{ x: number; y: number } | null>;
  promptTimeoutRef: React.MutableRefObject<ReturnType<typeof setTimeout> | null>;
  setIsPlaying: (v: boolean) => void;
  setIsDrawing: (v: boolean) => void;
  setIsPinching: (v: boolean) => void;
  setFeedback: (v: string | null) => void;
  setAccuracy: (v: number) => void;
  setCameraPermission: (v: 'granted' | 'denied' | 'prompt') => void;
  setShowPermissionWarning: (v: boolean) => void;
  setUseMouseMode: (v: boolean) => void;
  setIsHandTrackingLoading: (v: boolean) => void;
  setIsPaused: (v: boolean) => void;
  setShowCameraErrorModal: (v: boolean) => void;
  setShowExitModal: (v: boolean) => void;
  setCameraErrorMessage: (v: string) => void;
  setStreak: React.Dispatch<React.SetStateAction<number>>;
  setScore: React.Dispatch<React.SetStateAction<number>>;
  setScorePopup: (v: { points: number } | null) => void;
  setShowStreakMilestone: (v: boolean) => void;
  setCelebrationTitle: (v: string) => void;
  setShowCelebration: (v: boolean) => void;
  setCurrentLetterIndex: React.Dispatch<React.SetStateAction<number>>;
  setShowLetterPrompt: (v: boolean) => void;
  setTutorialCompleted: (v: boolean) => void;
  setShowHandTutorial: (v: boolean) => void;
  setShowWellnessReminder: (v: boolean) => void;
  setWellnessReminderType: (v: 'break' | 'water' | 'stretch' | 'inactive' | null) => void;
  markLetterAttempt: (lang: string, char: string, accuracy: number) => void;
  playCelebration: () => void;
  playPop: () => void;
  playError: () => void;
  speakWordExample: (char: string, lang: string) => void;
}

export function useGameHandlers(props: UseGameHandlersProps) {
  const {
    onGameComplete,
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
    isPaused: _isPaused,
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
  } = props;

  const clearDrawing = useCallback(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    drawnPointsRef.current = [];
    lastDrawPointRef.current = null;
  }, [canvasRef, drawnPointsRef, lastDrawPointRef]);

  const stopGame = useCallback(() => {
    onGameComplete();
    setIsPlaying(false);
    setIsDrawing(false);
    setIsPinching(false);
    setShowLetterPrompt(true);
    pointerDownRef.current = false;
    pinchStateRef.current = createDefaultPinchState();
    lastDrawPointRef.current = null;
    if (promptTimeoutRef.current) {
      clearTimeout(promptTimeoutRef.current);
      promptTimeoutRef.current = null;
    }
  }, [
    onGameComplete,
    setIsPlaying,
    setIsDrawing,
    setIsPinching,
    setShowLetterPrompt,
    pointerDownRef,
    pinchStateRef,
    lastDrawPointRef,
    promptTimeoutRef,
  ]);

  const startGame = useCallback(async () => {
    setIsDrawing(true);

    if (useMouseMode) {
      setIsPlaying(true);
      setFeedback('Use your finger to draw! 👆');
      return;
    }

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
      setIsPlaying(true);
      setFeedback("Let's use your finger to draw! 👆");
    }
  }, [
    useMouseMode,
    isHandTrackingReady,
    requestCameraPermission,
    cameraPermissionError,
    startTracking,
    setIsDrawing,
    setIsPlaying,
    setFeedback,
    setCameraPermission,
    setShowPermissionWarning,
    setUseMouseMode,
    setIsHandTrackingLoading,
    setAccuracy,
  ]);

  const checkProgress = useCallback(async () => {
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
        playError();
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
      setIsPaused(false);
      setShowExitModal(false);
      setShowCameraErrorModal(false);
      setShowWellnessReminder(false);
      setWellnessReminderType(null);

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

      const basePoints = Math.round(nextAccuracy);
      const streakBonus = Math.min(streak * 3, 15);
      const totalPoints = basePoints + streakBonus;
      setScore((s) => s + totalPoints);

      setScorePopup({ points: totalPoints });
      setTimeout(() => setScorePopup(null), 700);

      triggerHaptic('success');

      setStreak((s) => s + 1);

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
        playPop();
      } catch (error) {
        warnAlphabetGame('Unable to play pop sound', error);
      }
    }
  }, [
    selectedLanguage,
    currentLetter,
    resolvedProfileId,
    drawnPointsRef,
    letterAttemptCountsRef,
    streak,
    ttsEnabled,
    speak,
    markLetterAttempt,
    playCelebration,
    playPop,
    playError,
    speakWordExample,
    setAccuracy,
    setFeedback,
    setStreak,
    setScore,
    setScorePopup,
    setShowStreakMilestone,
    setCelebrationTitle,
    setShowCelebration,
    setIsPaused,
    setShowExitModal,
    setShowCameraErrorModal,
    setShowWellnessReminder,
    setWellnessReminderType,
  ]);

  const nextLetter = useCallback(() => {
    setCurrentLetterIndex((i) => Math.min(i + 1, LETTERS.length - 1));
    clearDrawing();
    setAccuracy(0);
    setFeedback(null);
    setIsPinching(false);
    pinchStateRef.current = createDefaultPinchState();
    lastDrawPointRef.current = null;
    setShowLetterPrompt(true);
  }, [
    LETTERS.length,
    clearDrawing,
    setCurrentLetterIndex,
    setAccuracy,
    setFeedback,
    setIsPinching,
    pinchStateRef,
    lastDrawPointRef,
    setShowLetterPrompt,
  ]);

  const goToHome = useCallback(() => {
    stopGame();
    navigate('/dashboard');
  }, [stopGame, navigate]);

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
    [
      setCameraPermission,
      setShowPermissionWarning,
      setUseMouseMode,
      setFeedback,
      setShowCameraErrorModal,
      setIsPaused,
      setCameraErrorMessage,
    ],
  );

  const handleRetryCamera = useCallback(() => {
    setShowCameraErrorModal(false);
    setIsPaused(false);
    setUseMouseMode(false);
    void startTracking();
  }, [startTracking, setShowCameraErrorModal, setIsPaused, setUseMouseMode]);

  const handleContinueWithMouse = useCallback(() => {
    setShowCameraErrorModal(false);
    setIsPaused(false);
    setUseMouseMode(true);
    setFeedback('Use your finger to draw! 👆');
  }, [setShowCameraErrorModal, setIsPaused, setUseMouseMode, setFeedback]);

  const handleSaveAndExit = useCallback(() => {
    setShowCameraErrorModal(false);
    clearAlphabetGameSession();
    stopGame();
    navigate('/dashboard');
  }, [stopGame, navigate, setShowCameraErrorModal]);

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
  }, [
    currentLetterIndex,
    score,
    streak,
    selectedLanguage,
    useMouseMode,
    stopGame,
    navigate,
    setShowExitModal,
  ]);

  const handleCancelExit = useCallback(() => {
    setShowExitModal(false);
  }, [setShowExitModal]);

  const handleTutorialComplete = useCallback(() => {
    setTutorialCompleted(true);
    setShowHandTutorial(true);
    try {
      localStorage.setItem(ALPHABET_GAME_TUTORIAL_KEY, 'true');
    } catch (error) {
      warnAlphabetGame('Unable to save tutorial completion state', error);
    }
  }, [setTutorialCompleted, setShowHandTutorial]);

  const handleSkipTutorial = useCallback(() => {
    setTutorialCompleted(true);
    try {
      localStorage.setItem(ALPHABET_GAME_TUTORIAL_KEY, 'true');
    } catch (error) {
      warnAlphabetGame('Unable to save tutorial skip state', error);
    }
  }, [setTutorialCompleted]);

  const handleSkipCameraTutorial = useCallback(() => {
    setUseMouseMode(true);
    setFeedback('Use your finger to draw! 👆');
    setTutorialCompleted(true);
    try {
      localStorage.setItem(ALPHABET_GAME_TUTORIAL_KEY, 'true');
    } catch (error) {
      warnAlphabetGame('Unable to save tutorial skip state', error);
    }
  }, [setUseMouseMode, setFeedback, setTutorialCompleted]);

  const handleHandTutorialComplete = useCallback(() => {
    setShowHandTutorial(false);
  }, [setShowHandTutorial]);

  // Expose showExitModal and showCameraErrorModal for keyboard handler
  void showExitModal;
  void showCameraErrorModal;

  return {
    startGame,
    stopGame,
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
  };
}
