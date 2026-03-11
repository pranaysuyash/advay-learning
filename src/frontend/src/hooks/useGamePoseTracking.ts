import { useState, useEffect, useRef, useCallback } from 'react';
import {
    FilesetResolver,
    PoseLandmarker,
    PoseLandmarkerOptions,
} from '@mediapipe/tasks-vision';

interface UseGamePoseTrackingProps {
    gameName: string;
    webcamRef: React.RefObject<any>;
    onFrame?: (landmarks: any[]) => void;
    enabled?: boolean;
}

export function useGamePoseTracking({
    gameName,
    webcamRef,
    onFrame,
    enabled = true,
}: UseGamePoseTrackingProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [poseDetected, setPoseDetected] = useState(false);
    const landmarkerRef = useRef<PoseLandmarker | null>(null);
    const animationFrameRef = useRef<number | null>(null);
    const lastProcessedTimeRef = useRef<number>(0);

    // Initialize landmarker
    useEffect(() => {
        if (!enabled) return;

        let cancelled = false;
        const initialize = async () => {
            try {
                setIsLoading(true);
                const vision = await FilesetResolver.forVisionTasks(
                    'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.8/wasm'
                );

                const options: PoseLandmarkerOptions = {
                    baseOptions: {
                        modelAssetPath:
                            'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',
                        delegate: 'GPU',
                    },
                    runningMode: 'VIDEO',
                    numPoses: 1,
                };

                const landmarker = await PoseLandmarker.createFromOptions(vision, options);
                if (!cancelled) {
                    landmarkerRef.current = landmarker;
                    setError(null);
                }
            } catch (err) {
                console.error(`[${gameName}] Failed to initialize PoseLandmarker:`, err);
                if (!cancelled) {
                    setError('Pose tracking not available');
                }
            } finally {
                if (!cancelled) {
                    setIsLoading(false);
                }
            }
        };

        initialize();

        return () => {
            cancelled = true;
            if (landmarkerRef.current) {
                landmarkerRef.current.close();
                landmarkerRef.current = null;
            }
        };
    }, [gameName, enabled]);

    // Processing loop
    const processFrame = useCallback(() => {
        if (!enabled) {
            return;
        }

        if (!landmarkerRef.current || !webcamRef.current?.video) {
            animationFrameRef.current = requestAnimationFrame(processFrame);
            return;
        }

        const video = webcamRef.current.video;
        if (video.readyState !== 4) {
            animationFrameRef.current = requestAnimationFrame(processFrame);
            return;
        }

        // Throttle to ~20fps for pose (heavier than face)
        const now = performance.now();
        if (now - lastProcessedTimeRef.current < 50) {
            animationFrameRef.current = requestAnimationFrame(processFrame);
            return;
        }
        lastProcessedTimeRef.current = now;

        try {
            const results = landmarkerRef.current.detectForVideo(video, now);

            if (results.landmarks && results.landmarks.length > 0) {
                setPoseDetected(true);
                if (onFrame) {
                    onFrame(results.landmarks[0]);
                }
            } else {
                setPoseDetected(false);
            }
        } catch (err) {
            console.error(`[${gameName}] Error processing frame:`, err);
        }

        animationFrameRef.current = requestAnimationFrame(processFrame);
    }, [enabled, gameName, onFrame, webcamRef]);

    useEffect(() => {
        if (enabled && !isLoading && !error) {
            animationFrameRef.current = requestAnimationFrame(processFrame);
        }
        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [enabled, isLoading, error, processFrame]);

    return { isLoading, error, poseDetected };
}
