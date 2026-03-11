import { useState, useEffect, useRef, useCallback } from 'react';
import {
    FilesetResolver,
    FaceLandmarker,
    FaceLandmarkerOptions,
} from '@mediapipe/tasks-vision';
import { calculateHeadPose, HeadPose } from '../utils/headPose';

interface UseGameFaceTrackingProps {
    gameName: string;
    webcamRef: React.RefObject<any>;
    onFrame?: (pose: HeadPose) => void;
    enabled?: boolean;
}

export function useGameFaceTracking({
    gameName,
    webcamRef,
    onFrame,
    enabled = true,
}: UseGameFaceTrackingProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [faceDetected, setFaceDetected] = useState(false);
    const landmarkerRef = useRef<FaceLandmarker | null>(null);
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

                const options: FaceLandmarkerOptions = {
                    baseOptions: {
                        modelAssetPath:
                            'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
                        delegate: 'GPU',
                    },
                    runningMode: 'VIDEO',
                    numFaces: 1,
                };

                const landmarker = await FaceLandmarker.createFromOptions(vision, options);
                if (!cancelled) {
                    landmarkerRef.current = landmarker;
                    setError(null);
                }
            } catch (err) {
                console.error(`[${gameName}] Failed to initialize FaceLandmarker:`, err);
                if (!cancelled) {
                    setError('Face tracking not available');
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
        if (!enabled || !landmarkerRef.current || !webcamRef.current?.video) {
            animationFrameRef.current = requestAnimationFrame(processFrame);
            return;
        }

        const video = webcamRef.current.video;
        if (video.readyState !== 4) {
            animationFrameRef.current = requestAnimationFrame(processFrame);
            return;
        }

        // Throttle to ~30fps
        const now = performance.now();
        if (now - lastProcessedTimeRef.current < 33) {
            animationFrameRef.current = requestAnimationFrame(processFrame);
            return;
        }
        lastProcessedTimeRef.current = now;

        try {
            const results = landmarkerRef.current.detectForVideo(video, now);

            if (results.faceLandmarks && results.faceLandmarks.length > 0) {
                setFaceDetected(true);
                const pose = calculateHeadPose(results.faceLandmarks[0]);
                if (onFrame) {
                    onFrame(pose);
                }
            } else {
                setFaceDetected(false);
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

    return { isLoading, error, faceDetected };
}
