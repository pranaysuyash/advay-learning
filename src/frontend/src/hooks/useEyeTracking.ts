import { useState, useEffect, useRef, useCallback } from 'react';
import { FilesetResolver, FaceLandmarker } from '@mediapipe/tasks-vision';

interface EyeTrackingResults {
  isBlinking: boolean;
  leftEyeClosed: boolean;
  rightEyeClosed: boolean;
  blinkCount: number;
  lastBlinkTime: number | null;
}

const useEyeTracking = (
  onBlinkDetected: () => void,
  options: {
    modelAssetPath?: string;
    delegate?: 'CPU' | 'GPU';
    minFaceDetectionConfidence?: number;
    minFaceTrackingConfidence?: number;
    minFacePresenceConfidence?: number;
    runningMode?: 'IMAGE' | 'VIDEO';
    numFaces?: number;
  } = {},
) => {
  const {
    modelAssetPath = 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
    delegate = 'GPU',
    minFaceDetectionConfidence = 0.5,
    minFacePresenceConfidence = 0.5,
    runningMode = 'VIDEO',
    numFaces = 1,
  } = options;

  const [faceLandmarker, setFaceLandmarker] = useState<FaceLandmarker | null>(
    null,
  );
  const faceLandmarkerRef = useRef<FaceLandmarker | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<EyeTrackingResults>({
    isBlinking: false,
    leftEyeClosed: false,
    rightEyeClosed: false,
    blinkCount: 0,
    lastBlinkTime: null,
  });

  const videoRef = useRef<HTMLVideoElement>(null);
  const animationFrameRef = useRef<number>(0);
  const lastBlinkTimeRef = useRef<number>(0);
  const blinkCountRef = useRef<number>(0);
  const previousEyeStates = useRef<{ left: boolean; right: boolean }>({
    left: false,
    right: false,
  });

  // Initialize FaceLandmarker
  useEffect(() => {
    const initializeFaceLandmarker = async () => {
      try {
        setIsLoading(true);
        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.8/wasm',
        );

        const landmarker = await FaceLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath,
            delegate,
          },
          runningMode,
          numFaces,
          minFaceDetectionConfidence,
          minFacePresenceConfidence,
        });

        setFaceLandmarker(landmarker);
        faceLandmarkerRef.current = landmarker;
        setError(null);
      } catch (err) {
        console.error('Failed to initialize face landmarker:', err);
        setError('Failed to initialize eye tracking. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    initializeFaceLandmarker();

    return () => {
      if (faceLandmarkerRef.current) {
        faceLandmarkerRef.current.close();
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [
    modelAssetPath,
    delegate,
    minFaceDetectionConfidence,
    minFacePresenceConfidence,
    runningMode,
    numFaces,
  ]);

  // Process video frames for eye tracking
  const processVideoFrame = useCallback(() => {
    if (!faceLandmarkerRef.current) return;

    if (
      !faceLandmarkerRef.current ||
      !videoRef.current ||
      !videoRef.current.videoWidth ||
      !videoRef.current.videoHeight
    ) {
      animationFrameRef.current = requestAnimationFrame(processVideoFrame);
      return;
    }

    try {
      const startTime = performance.now();
      const faceLandmarkerResult = faceLandmarkerRef.current.detectForVideo(
        videoRef.current,
        startTime,
      );
      const face = faceLandmarkerResult.faceLandmarks?.[0]; // Get first detected face

      if (face) {
        // Get eye landmark indices (based on MediaPipe face landmark definitions)
        // Left eye indices: [33, 160, 158, 133, 153, 144]
        // Right eye indices: [362, 385, 387, 263, 373, 380]

        const leftEyePoints = [
          face[33],
          face[160],
          face[158],
          face[133],
          face[153],
          face[144],
        ];
        const rightEyePoints = [
          face[362],
          face[385],
          face[387],
          face[263],
          face[373],
          face[380],
        ];

        // Calculate eye aspect ratio (EAR) to detect blinking
        const calculateEAR = (eyePoints: any[]) => {
          if (eyePoints.length < 6) return 1; // Return open if not enough points

          // Vertical distances
          const A = Math.sqrt(
            Math.pow(eyePoints[1].x - eyePoints[5].x, 2) +
              Math.pow(eyePoints[1].y - eyePoints[5].y, 2),
          );
          const B = Math.sqrt(
            Math.pow(eyePoints[2].x - eyePoints[4].x, 2) +
              Math.pow(eyePoints[2].y - eyePoints[4].y, 2),
          );

          // Horizontal distance
          const C = Math.sqrt(
            Math.pow(eyePoints[0].x - eyePoints[3].x, 2) +
              Math.pow(eyePoints[0].y - eyePoints[3].y, 2),
          );

          // Guard against division by zero
          if (C < 1e-6) return 1; // Treat as open if horizontal distance is too small

          return (A + B) / (2.0 * C);
        };

        const leftEAR = calculateEAR(leftEyePoints);
        const rightEAR = calculateEAR(rightEyePoints);

        // Threshold for blink detection (typically around 0.2-0.3)
        const BLINK_THRESHOLD = 0.25;
        const leftEyeClosed = leftEAR < BLINK_THRESHOLD;
        const rightEyeClosed = rightEAR < BLINK_THRESHOLD;
        const isBlinking = leftEyeClosed && rightEyeClosed;
        const wasOpen =
          !previousEyeStates.current.left && !previousEyeStates.current.right;

        // Detect blink transition (both eyes were open, now both are closed)
        const isTransitionToBlink = wasOpen && isBlinking;

        // Update state
        if (isTransitionToBlink) {
          const now = Date.now();
          // Debounce blinks (minimum 200ms between blinks)
          if (now - lastBlinkTimeRef.current > 200) {
            blinkCountRef.current += 1;
            lastBlinkTimeRef.current = now;
            onBlinkDetected();
          }
        }

        previousEyeStates.current = {
          left: leftEyeClosed,
          right: rightEyeClosed,
        };

        setResults({
          isBlinking,
          leftEyeClosed,
          rightEyeClosed,
          blinkCount: blinkCountRef.current,
          lastBlinkTime: lastBlinkTimeRef.current,
        });
      }
    } catch (err) {
      console.error('Error processing video frame:', err);
    }

    animationFrameRef.current = requestAnimationFrame(processVideoFrame);
  }, [onBlinkDetected]);

  // Start video processing when face landmarker is ready
  useEffect(() => {
    if (faceLandmarker) {
      animationFrameRef.current = requestAnimationFrame(processVideoFrame);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [faceLandmarker, processVideoFrame]);

  return {
    results,
    isLoading,
    error,
    videoRef,
    resetBlinkCount: () => {
      blinkCountRef.current = 0;
      lastBlinkTimeRef.current = 0;
      setResults((prev) => ({
        ...prev,
        blinkCount: 0,
        lastBlinkTime: null,
      }));
    },
  };
};

export default useEyeTracking;
