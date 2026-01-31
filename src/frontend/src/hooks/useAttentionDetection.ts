import { useState, useEffect, useRef, useCallback } from 'react';
import { FilesetResolver, FaceLandmarker, FaceLandmarkerOptions, FaceLandmarkerResult } from '@mediapipe/tasks-vision';

interface AttentionData {
  focusLevel: number; // 0-1 (1 = fully focused)
  blinkRate: number; // blinks per minute
  gazeDirection: { x: number; y: number }; // normalized coordinates (-1 to 1)
  headPose: { pitch: number; yaw: number; roll: number }; // in degrees
  timestamp: number;
}

interface AttentionFeedback {
  level: 'high' | 'medium' | 'low';
  message: string;
  suggestions: string[];
}

interface AttentionAlert {
  level: 'info' | 'warning' | 'critical';
  message: string;
  timestamp: number;
}

export function useAttentionDetection(onAlert?: (alert: AttentionAlert) => void) {
  const [faceLandmarker, setFaceLandmarker] = useState<FaceLandmarker | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [lastAttention, setLastAttention] = useState<AttentionData | null>(null);
  
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastProcessedTimeRef = useRef<number>(0);
  const blinkHistoryRef = useRef<number[]>([]);
  const lastBlinkTimeRef = useRef<number>(0);

  // Initialize face landmarker
  useEffect(() => {
    const initializeFaceLandmarker = async () => {
      try {
        setIsLoading(true);
        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.8/wasm'
        );
        
        const options: FaceLandmarkerOptions = {
          baseOptions: {
            modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
            delegate: 'GPU',
          },
          runningMode: 'VIDEO',
          numFaces: 1,
          outputFaceBlendshapes: true,
          outputFacialTransformationMatrixes: true,
        };
        
        const landmarker = await FaceLandmarker.createFromOptions(vision, options);
        setFaceLandmarker(landmarker);
        setError(null);
      } catch (err) {
        console.error('Failed to initialize face landmarker:', err);
        setError('Attention detection not available');
        onAlert?.({
          level: 'warning',
          message: 'Attention detection failed to initialize',
          timestamp: Date.now()
        });
      } finally {
        setIsLoading(false);
      }
    };

    initializeFaceLandmarker();

    return () => {
      if (faceLandmarker) {
        faceLandmarker.close();
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Process video frame for attention analysis
  const processFrame = useCallback(() => {
    if (!faceLandmarker || !videoRef.current || !isMonitoring) return;

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
      const results = faceLandmarker.detectForVideo(video, performance.now());
      if (results.faceLandmarks && results.faceLandmarks.length > 0) {
        const landmarks = results.faceLandmarks[0]; // Get first face
        const attention = analyzeAttention(landmarks, now);
        
        setLastAttention(attention);
        
        // Check if attention level needs alerting
        if (attention.focusLevel < 0.3) {
          onAlert?.({
            level: 'warning',
            message: 'It looks like you might be getting distracted. Try to focus on the activity!',
            timestamp: Date.now()
          });
        } else if (attention.focusLevel < 0.1) {
          onAlert?.({
            level: 'critical',
            message: 'Please pay attention to your learning activity!',
            timestamp: Date.now()
          });
        }
      }
    } catch (err) {
      console.error('Error processing attention frame:', err);
    }

    animationFrameRef.current = requestAnimationFrame(processFrame);
  }, [faceLandmarker, isMonitoring, onAlert]);

  // Start monitoring
  const startMonitoring = useCallback((videoElement: HTMLVideoElement) => {
    videoRef.current = videoElement;
    setIsMonitoring(true);
    if (isMonitoring) {
      animationFrameRef.current = requestAnimationFrame(processFrame);
    }
  }, [processFrame, isMonitoring]);

  // Stop monitoring
  const stopMonitoring = useCallback(() => {
    setIsMonitoring(false);
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  }, []);

  // Analyze attention from face landmarks
  const analyzeAttention = (landmarks: any[], currentTime: number): AttentionData => {
    // Get eye landmarks for blink detection
    const leftEye = [landmarks[33], landmarks[160], landmarks[158], landmarks[133], landmarks[153], landmarks[144]]; // Left eye landmarks
    const rightEye = [landmarks[362], landmarks[385], landmarks[387], landmarks[263], landmarks[373], landmarks[380]]; // Right eye landmarks
    
    // Calculate eye aspect ratios to detect blinks
    const calculateEAR = (eyeLandmarks: any[]) => {
      const verticalDist1 = Math.sqrt(
        Math.pow(eyeLandmarks[1].x - eyeLandmarks[5].x, 2) + 
        Math.pow(eyeLandmarks[1].y - eyeLandmarks[5].y, 2)
      );
      const verticalDist2 = Math.sqrt(
        Math.pow(eyeLandmarks[2].x - eyeLandmarks[4].x, 2) + 
        Math.pow(eyeLandmarks[2].y - eyeLandmarks[4].y, 2)
      );
      const horizontalDist = Math.sqrt(
        Math.pow(eyeLandmarks[0].x - eyeLandmarks[3].x, 2) + 
        Math.pow(eyeLandmarks[0].y - eyeLandmarks[3].y, 2)
      );
      
      return (verticalDist1 + verticalDist2) / (2 * horizontalDist);
    };
    
    const leftEAR = calculateEAR(leftEye);
    const rightEAR = calculateEAR(rightEye);
    
    // Typical EAR threshold for blink detection is ~0.2-0.3
    const BLINK_THRESHOLD = 0.25;
    const isBlinking = leftEAR < BLINK_THRESHOLD && rightEAR < BLINK_THRESHOLD;
    
    // Update blink history
    if (isBlinking && currentTime - lastBlinkTimeRef.current > 200) { // Debounce blinks
      blinkHistoryRef.current.push(currentTime);
      lastBlinkTimeRef.current = currentTime;
      
      // Keep only blinks from the last minute
      const oneMinuteAgo = currentTime - 60000;
      blinkHistoryRef.current = blinkHistoryRef.current.filter(time => time > oneMinuteAgo);
    }
    
    const blinkRate = blinkHistoryRef.current.length; // Blinks per minute
    
    // Calculate gaze direction based on eye position relative to face
    const nose = landmarks[4];
    const leftEyeCenter = {
      x: (leftEye[0].x + leftEye[3].x) / 2,
      y: (leftEye[0].y + leftEye[3].y) / 2
    };
    const rightEyeCenter = {
      x: (rightEye[0].x + rightEye[3].x) / 2,
      y: (rightEye[0].y + rightEye[3].y) / 2
    };
    
    // Average eye position
    const eyeCenter = {
      x: (leftEyeCenter.x + rightEyeCenter.x) / 2,
      y: (leftEyeCenter.y + rightEyeCenter.y) / 2
    };
    
    // Calculate gaze direction relative to nose (center of face)
    const gazeDirection = {
      x: (eyeCenter.x - nose.x) * 2, // Normalize to -1 to 1
      y: (eyeCenter.y - nose.y) * 2
    };
    
    // Estimate attention level based on multiple factors
    const gazeFocus = 1 - Math.min(1, Math.sqrt(gazeDirection.x * gazeDirection.x + gazeDirection.y * gazeDirection.y));
    const blinkNormal = Math.min(1, Math.max(0, 1 - Math.abs(blinkRate - 15) / 15)); // Normal blink rate is ~15/min
    const attentionLevel = (gazeFocus + blinkNormal) / 2; // Average of both factors
    
    return {
      focusLevel: attentionLevel,
      blinkRate,
      gazeDirection,
      headPose: { pitch: 0, yaw: 0, roll: 0 }, // TODO: Implement head pose estimation
      timestamp: currentTime
    };
  };

  // Generate feedback based on attention data
  const generateAttentionFeedback = (attention: AttentionData): AttentionFeedback => {
    const { focusLevel } = attention;
    
    if (focusLevel > 0.7) {
      return {
        level: 'high',
        message: 'Great focus! Keep up the excellent concentration!',
        suggestions: [
          'You\'re doing wonderfully!',
          'Stay focused on the activity'
        ]
      };
    } else if (focusLevel > 0.4) {
      return {
        level: 'medium',
        message: 'Good job! Try to keep your focus a bit more',
        suggestions: [
          'Look at the screen',
          'Pay attention to the activity'
        ]
      };
    } else {
      return {
        level: 'low',
        message: 'It looks like you need to focus more on the activity',
        suggestions: [
          'Look at the screen',
          'Pay attention to what you\'re doing',
          'Take a deep breath and refocus'
        ]
      };
    }
  };

  return {
    startMonitoring,
    stopMonitoring,
    isLoading,
    error,
    lastAttention,
    isMonitoring
  };
}

export default useAttentionDetection;