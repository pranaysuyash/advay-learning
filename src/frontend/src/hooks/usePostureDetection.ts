import { useState, useEffect, useRef, useCallback } from 'react';
import { FilesetResolver, PoseLandmarker, PoseLandmarkerOptions } from '@mediapipe/tasks-vision';

interface PostureData {
  shoulderAlignment: number; // 0-1 score (1 = perfectly aligned)
  headPosition: { x: number; y: number; z: number }; // Normalized coordinates
  spineCurvature: number; // 0-1 score (1 = straight)
  timestamp: number;
}

interface PostureFeedback {
  type: 'good' | 'needsAdjustment' | 'poor' | 'warning' | 'critical';
  message: string;
  suggestions: string[];
}

interface PostureAlert {
  level: 'info' | 'warning' | 'critical';
  message: string;
  timestamp: number;
}

export function usePostureDetection(onAlert?: (alert: PostureAlert) => void) {
  const [poseLandmarker, setPoseLandmarker] = useState<PoseLandmarker | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [lastPosture, setLastPosture] = useState<PostureData | null>(null);
  
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastProcessedTimeRef = useRef<number>(0);

  // Initialize pose landmarker
  useEffect(() => {
    const initializePoseLandmarker = async () => {
      try {
        setIsLoading(true);
        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.8/wasm'
        );
        
        const options: PoseLandmarkerOptions = {
          baseOptions: {
            modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',
            delegate: 'GPU',
          },
          runningMode: 'VIDEO',
          numPoses: 1,
        };
        
        const landmarker = await PoseLandmarker.createFromOptions(vision, options);
        setPoseLandmarker(landmarker);
        setError(null);
      } catch (err) {
        console.error('Failed to initialize pose landmarker:', err);
        setError('Posture detection not available');
        onAlert?.({
          level: 'warning',
          message: 'Posture detection failed to initialize',
          timestamp: Date.now()
        });
      } finally {
        setIsLoading(false);
      }
    };

    initializePoseLandmarker();

    return () => {
      if (poseLandmarker) {
        poseLandmarker.close();
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Process video frame for posture analysis
  const processFrame = useCallback(() => {
    if (!poseLandmarker || !videoRef.current || !isMonitoring) return;

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
      const results = poseLandmarker.detectForVideo(video, performance.now());
      if (results.landmarks && results.landmarks.length > 0) {
        const landmarks = results.landmarks[0]; // Get first person's pose
        const posture = analyzePosture(landmarks);
        
        setLastPosture(posture);
        
        // Check if posture needs alerting
        const feedback = generatePostureFeedback(posture);
        if (feedback.type === 'warning' || feedback.type === 'critical') {
          onAlert?.({
            level: feedback.type === 'critical' ? 'critical' : 'warning',
            message: feedback.message,
            timestamp: Date.now()
          });
        }
      }
    } catch (err) {
      console.error('Error processing posture frame:', err);
    }

    animationFrameRef.current = requestAnimationFrame(processFrame);
  }, [poseLandmarker, isMonitoring, onAlert]);

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

  // Analyze posture from landmarks
  const analyzePosture = (landmarks: any[]): PostureData => {
    // Get key landmarks for posture analysis
    const nose = landmarks[0];
    const leftShoulder = landmarks[11];
    const rightShoulder = landmarks[12];
    const leftHip = landmarks[23];
    const rightHip = landmarks[24];
    
    // Calculate shoulder alignment (should be level)
    const shoulderDiff = Math.abs(leftShoulder.y - rightShoulder.y);
    const shoulderAlignment = Math.max(0, 1 - (shoulderDiff * 5)); // Normalize to 0-1
    
    // Calculate head position relative to shoulders
    // Calculate spine straightness
    const shoulderMidpoint = { x: (leftShoulder.x + rightShoulder.x) / 2, y: (leftShoulder.y + rightShoulder.y) / 2 };
    const hipMidpoint = { x: (leftHip.x + rightHip.x) / 2, y: (leftHip.y + rightHip.y) / 2 };
    const spineDeviation = Math.abs(shoulderMidpoint.x - hipMidpoint.x); // How much spine deviates horizontally
    const spineStraightness = Math.max(0, 1 - (spineDeviation * 3)); // Normalize to 0-1
    
    return {
      shoulderAlignment,
      headPosition: { x: nose.x, y: nose.y, z: nose.z || 0 },
      spineCurvature: spineStraightness,
      timestamp: Date.now()
    };
  };

  // Generate feedback based on posture data
  const generatePostureFeedback = (posture: PostureData): PostureFeedback => {
    const { shoulderAlignment, spineCurvature } = posture;

    if (shoulderAlignment < 0.6 || spineCurvature < 0.6) {
      return {
        type: 'critical',
        message: 'Please adjust your sitting position',
        suggestions: [
          'Sit up straight with your back against the chair',
          'Keep your shoulders level',
          'Position yourself centered in front of the camera'
        ]
      };
    } else if (shoulderAlignment < 0.8 || spineCurvature < 0.8) {
      return {
        type: 'warning',
        message: 'Good posture! Keep it up',
        suggestions: [
          'Remember to sit up straight',
          'Keep your shoulders relaxed and level'
        ]
      };
    } else {
      return {
        type: 'good',
        message: 'Great posture!',
        suggestions: [
          'Keep maintaining this excellent position',
          'You\'re learning in a healthy way!'
        ]
      };
    }
  };

  return {
    startMonitoring,
    stopMonitoring,
    isLoading,
    error,
    lastPosture,
    isMonitoring
  };
}

export default usePostureDetection;