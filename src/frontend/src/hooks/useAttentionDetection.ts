import { useState, useEffect, useRef, useCallback } from 'react';
import {
  FilesetResolver,
  FaceLandmarker,
  FaceLandmarkerOptions,
} from '@mediapipe/tasks-vision';

interface AttentionData {
  focusLevel: number; // 0-1 (1 = fully focused)
  blinkRate: number; // blinks per minute
  gazeDirection: { x: number; y: number }; // normalized coordinates (-1 to 1)
  headPose: { pitch: number; yaw: number; roll: number }; // in degrees
  timestamp: number;
}

/* interface AttentionFeedback {
  level: 'high' | 'medium' | 'low';
  message: string;
  suggestions: string[];
} */

interface AttentionAlert {
  level: 'info' | 'warning' | 'critical';
  message: string;
  timestamp: number;
}

export function useAttentionDetection(
  onAlert?: (alert: AttentionAlert) => void,
) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [lastAttention, setLastAttention] = useState<AttentionData | null>(
    null,
  );

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastProcessedTimeRef = useRef<number>(0);
  const blinkHistoryRef = useRef<number[]>([]);
  const lastBlinkTimeRef = useRef<number>(0);
  const landmarkerRef = useRef<FaceLandmarker | null>(null);
  const isMonitoringRef = useRef(false);
  const lastAlertAtRef = useRef(0);
  const lastAlertLevelRef = useRef<'info' | 'warning' | 'critical' | null>(
    null,
  );
  const lastUIUpdateAtRef = useRef(0);
  const lastAttentionRef = useRef<AttentionData | null>(null);
  const monitoringStartTimeRef = useRef<number>(0);

  // Initialize face landmarker
  useEffect(() => {
    let cancelled = false;
    const initializeFaceLandmarker = async () => {
      try {
        setIsLoading(true);
        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.8/wasm',
        );

        const options: FaceLandmarkerOptions = {
          baseOptions: {
            modelAssetPath:
              'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
            delegate: 'GPU',
          },
          runningMode: 'VIDEO',
          numFaces: 1,
          outputFaceBlendshapes: true,
          outputFacialTransformationMatrixes: true,
        };

        let landmarker: FaceLandmarker;
        try {
          landmarker = await FaceLandmarker.createFromOptions(vision, options);
        } catch (gpuError) {
          console.warn('GPU delegate failed, falling back to CPU:', gpuError);
          if (options.baseOptions) {
            options.baseOptions.delegate = 'CPU';
          }
          landmarker = await FaceLandmarker.createFromOptions(vision, options);
        }

        if (!cancelled) {
          landmarkerRef.current = landmarker;
          setError(null);
        }
      } catch (err) {
        console.error('Failed to initialize face landmarker:', err);
        if (!cancelled) {
          setError('Attention detection not available');
          onAlert?.({
            level: 'warning',
            message: 'Attention detection failed to initialize',
            timestamp: Date.now(),
          });
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    initializeFaceLandmarker();

    return () => {
      cancelled = true;
      if (landmarkerRef.current) {
        landmarkerRef.current.close();
        landmarkerRef.current = null;
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Process video frame for attention analysis
  const processFrame = useCallback(() => {
    if (!landmarkerRef.current || !videoRef.current || !isMonitoringRef.current)
      return;

    const video = videoRef.current;
    if (video.readyState !== 4) {
      animationFrameRef.current = requestAnimationFrame(processFrame);
      return;
    }

    // Throttle processing to ~10fps for performance
    const now = performance.now();
    if (now - lastProcessedTimeRef.current < 100) {
      animationFrameRef.current = requestAnimationFrame(processFrame);
      return;
    }
    lastProcessedTimeRef.current = now;

    try {
      const results = landmarkerRef.current.detectForVideo(
        video,
        performance.now(),
      );
      if (results.faceLandmarks && results.faceLandmarks.length > 0) {
        const landmarks = results.faceLandmarks[0]; // Get first face
        const attention = analyzeAttention(landmarks, now);

        lastAttentionRef.current = attention;

        // Throttle UI updates to ~2fps
        if (now - lastUIUpdateAtRef.current > 500) {
          setLastAttention(attention);
          lastUIUpdateAtRef.current = now;
        }

        // Check if attention level needs alerting with cooldown and hysteresis
        maybeAlert(attention.focusLevel, now);
      }
    } catch (err) {
      console.error('Error processing attention frame:', err);
    }

    animationFrameRef.current = requestAnimationFrame(processFrame);
  }, [onAlert]);

  // Start monitoring
  const startMonitoring = useCallback(
    (videoElement: HTMLVideoElement) => {
      videoRef.current = videoElement;
      isMonitoringRef.current = true;
      setIsMonitoring(true);
      monitoringStartTimeRef.current = performance.now();
      if (animationFrameRef.current == null) {
        animationFrameRef.current = requestAnimationFrame(processFrame);
      }
    },
    [processFrame],
  );

  // Stop monitoring
  const stopMonitoring = useCallback(() => {
    isMonitoringRef.current = false;
    setIsMonitoring(false);
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  }, []);

  // Alert with cooldown and hysteresis
  const ALERT_COOLDOWN_MS = 8000;
  const maybeAlert = useCallback(
    (focusLevel: number, now: number) => {
      if (now - lastAlertAtRef.current < ALERT_COOLDOWN_MS) return;

      const level =
        focusLevel < 0.1 ? 'critical' : focusLevel < 0.3 ? 'warning' : null;

      // Only alert when entering a worse state
      if (!level) {
        lastAlertLevelRef.current = null;
        return;
      }
      if (lastAlertLevelRef.current === level) return;

      lastAlertAtRef.current = now;
      lastAlertLevelRef.current = level;

      const messages = {
        warning:
          'It looks like you might be getting distracted. Try to focus on the activity!',
        critical: 'Please pay attention to your learning activity!',
      };

      onAlert?.({
        level,
        message: messages[level],
        timestamp: now,
      });
    },
    [onAlert],
  );

  // Analyze attention from face landmarks
  const analyzeAttention = (
    landmarks: any[],
    currentTime: number,
  ): AttentionData => {
    // Get eye landmarks for blink detection
    const leftEye = [
      landmarks[33],
      landmarks[160],
      landmarks[158],
      landmarks[133],
      landmarks[153],
      landmarks[144],
    ]; // Left eye landmarks
    const rightEye = [
      landmarks[362],
      landmarks[385],
      landmarks[387],
      landmarks[263],
      landmarks[373],
      landmarks[380],
    ]; // Right eye landmarks

    // Calculate eye aspect ratios to detect blinks
    const calculateEAR = (eyeLandmarks: any[]) => {
      const verticalDist1 = Math.sqrt(
        Math.pow(eyeLandmarks[1].x - eyeLandmarks[5].x, 2) +
          Math.pow(eyeLandmarks[1].y - eyeLandmarks[5].y, 2),
      );
      const verticalDist2 = Math.sqrt(
        Math.pow(eyeLandmarks[2].x - eyeLandmarks[4].x, 2) +
          Math.pow(eyeLandmarks[2].y - eyeLandmarks[4].y, 2),
      );
      const horizontalDist = Math.sqrt(
        Math.pow(eyeLandmarks[0].x - eyeLandmarks[3].x, 2) +
          Math.pow(eyeLandmarks[0].y - eyeLandmarks[3].y, 2),
      );

      if (horizontalDist < 1e-6) return 1; // Avoid division by zero, treat as open
      return (verticalDist1 + verticalDist2) / (2 * horizontalDist);
    };

    const leftEAR = calculateEAR(leftEye);
    const rightEAR = calculateEAR(rightEye);

    // Typical EAR threshold for blink detection is ~0.2-0.3
    const BLINK_THRESHOLD = 0.25;
    const isBlinking = leftEAR < BLINK_THRESHOLD && rightEAR < BLINK_THRESHOLD;

    // Update blink history
    if (isBlinking && currentTime - lastBlinkTimeRef.current > 200) {
      // Debounce blinks
      blinkHistoryRef.current.push(currentTime);
      lastBlinkTimeRef.current = currentTime;

      // Keep only blinks from the last minute
      const oneMinuteAgo = currentTime - 60000;
      blinkHistoryRef.current = blinkHistoryRef.current.filter(
        (time) => time > oneMinuteAgo,
      );
    }

    // Calculate blink rate per minute, accounting for window length
    const windowMs = Math.min(
      60000,
      currentTime - monitoringStartTimeRef.current,
    );
    const blinkRate =
      windowMs > 0 ? blinkHistoryRef.current.length * (60000 / windowMs) : 0;

    // Calculate gaze direction based on eye position relative to face
    const nose = landmarks[4];
    const leftEyeCenter = {
      x: (leftEye[0].x + leftEye[3].x) / 2,
      y: (leftEye[0].y + leftEye[3].y) / 2,
    };
    const rightEyeCenter = {
      x: (rightEye[0].x + rightEye[3].x) / 2,
      y: (rightEye[0].y + rightEye[3].y) / 2,
    };

    // Average eye position
    const eyeCenter = {
      x: (leftEyeCenter.x + rightEyeCenter.x) / 2,
      y: (leftEyeCenter.y + rightEyeCenter.y) / 2,
    };

    // Calculate gaze direction normalized by eye distance
    const eyeDist = Math.hypot(
      leftEyeCenter.x - rightEyeCenter.x,
      leftEyeCenter.y - rightEyeCenter.y,
    );
    const gazeDirection = {
      x: eyeDist > 1e-6 ? (eyeCenter.x - nose.x) / eyeDist : 0,
      y: eyeDist > 1e-6 ? (eyeCenter.y - nose.y) / eyeDist : 0,
    };

    // Clamp to reasonable range
    gazeDirection.x = Math.max(-1, Math.min(1, gazeDirection.x));
    gazeDirection.y = Math.max(-1, Math.min(1, gazeDirection.y));

    // Estimate attention level based on multiple factors
    const gazeFocus =
      1 -
      Math.min(
        1,
        Math.sqrt(
          gazeDirection.x * gazeDirection.x + gazeDirection.y * gazeDirection.y,
        ),
      );
    const blinkNormal = Math.min(
      1,
      Math.max(0, 1 - Math.abs(blinkRate - 15) / 15),
    ); // Normal blink rate is ~15/min
    const attentionLevel = (gazeFocus + blinkNormal) / 2; // Average of both factors

    return {
      focusLevel: attentionLevel,
      blinkRate,
      gazeDirection,
      headPose: { pitch: 0, yaw: 0, roll: 0 }, // TODO: Implement head pose estimation
      timestamp: currentTime,
    };
  };

  // Generate feedback based on attention data

  return {
    startMonitoring,
    stopMonitoring,
    isLoading,
    error,
    lastAttention,
    isMonitoring,
  };
}

export default useAttentionDetection;
