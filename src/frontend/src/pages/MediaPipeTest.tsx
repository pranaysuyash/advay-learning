import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import Webcam from 'react-webcam';
import { useNavigate } from 'react-router-dom';
import { FilesetResolver, FaceLandmarker, PoseLandmarker, HandLandmarker } from '@mediapipe/tasks-vision';
import { UIIcon } from '../components/ui/Icon';
import { GestureRecognizer, GestureType } from '../utils/gestureRecognizer';
import { getHandLandmarkLists } from '../utils/landmarkUtils';

type FeatureTab = 'hands' | 'face' | 'posture' | 'gestures';

/**
 * MediaPipe Test Page
 * Comprehensive test page showing ALL MediaPipe features with visual overlays:
 * - Hand Tracking (21 landmarks per hand)
 * - Face Detection (468 face landmarks, eye tracking, blink detection)
 * - Posture Detection (33 body landmarks)
 * - Gesture Recognition (open palm, fist, thumbs up, etc.)
 */
export function MediaPipeTest() {
    const navigate = useNavigate();
    const webcamRef = useRef<Webcam>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationFrameRef = useRef<number | null>(null);

    const [activeTab, setActiveTab] = useState<FeatureTab>('hands');
    const [testStatus, setTestStatus] = useState<'idle' | 'loading' | 'running' | 'error'>('idle');
    const [fps, setFps] = useState(0);
    const [logs, setLogs] = useState<string[]>([]);

    // Landmarker refs
    const handLandmarkerRef = useRef<HandLandmarker | null>(null);
    const faceLandmarkerRef = useRef<FaceLandmarker | null>(null);
    const poseLandmarkerRef = useRef<PoseLandmarker | null>(null);

    // Hand tracking state
    const [handsDetected, setHandsDetected] = useState(0);
    const [fingerCount, setFingerCount] = useState(0);

    // Gesture state
    const [currentGesture, setCurrentGesture] = useState<GestureType | null>(null);
    const [gestureConfidence, setGestureConfidence] = useState(0);
    const gestureRecognizerRef = useRef<GestureRecognizer | null>(null);

    // Face state
    const [faceDetected, setFaceDetected] = useState(false);
    const [leftEyeOpen, setLeftEyeOpen] = useState(true);
    const [rightEyeOpen, setRightEyeOpen] = useState(true);
    const [blinkCount, setBlinkCount] = useState(0);
    const lastBlinkRef = useRef(0);
    const wasBlinkingRef = useRef(false);

    // Posture state
    const [poseDetected, setPoseDetected] = useState(false);
    const [shoulderAlignment, setShoulderAlignment] = useState(0);
    const [headTilt, setHeadTilt] = useState(0);

    const addLog = useCallback((message: string) => {
        const timestamp = new Date().toLocaleTimeString();
        setLogs(prev => [...prev.slice(-30), `[${timestamp}] ${message}`]);
    }, []);

    // Initialize gesture recognizer
    useEffect(() => {
        gestureRecognizerRef.current = new GestureRecognizer({ minConfidence: 0.7 });
        return () => {
            gestureRecognizerRef.current = null;
        };
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
            handLandmarkerRef.current?.close();
            faceLandmarkerRef.current?.close();
            poseLandmarkerRef.current?.close();
        };
    }, []);

    // Count extended fingers
    const countFingers = useCallback((landmarks: any[]) => {
        let count = 0;
        if (landmarks[4].x < landmarks[3].x) count++;
        if (landmarks[8].y < landmarks[6].y) count++;
        if (landmarks[12].y < landmarks[10].y) count++;
        if (landmarks[16].y < landmarks[14].y) count++;
        if (landmarks[20].y < landmarks[18].y) count++;
        return count;
    }, []);

    // Calculate Eye Aspect Ratio for blink detection
    const calculateEAR = useCallback((eyeLandmarks: any[]) => {
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
        if (horizontalDist < 1e-6) return 1;
        return (verticalDist1 + verticalDist2) / (2 * horizontalDist);
    }, []);

    // Draw face landmarks
    const drawFaceLandmarks = useCallback((ctx: CanvasRenderingContext2D, landmarks: any[], width: number, height: number) => {
        // Face mesh connections (simplified - key contours)
        const faceOval = [10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109];
        const leftEye = [33, 160, 158, 133, 153, 144];
        const rightEye = [362, 385, 387, 263, 373, 380];
        const lips = [61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291, 308, 324, 318, 402, 317, 14, 87, 178, 88, 95];
        const leftEyebrow = [70, 63, 105, 66, 107];
        const rightEyebrow = [336, 296, 334, 293, 300];

        // Draw face oval
        ctx.strokeStyle = '#22c55e';
        ctx.lineWidth = 2;
        ctx.beginPath();
        faceOval.forEach((idx, i) => {
            const point = landmarks[idx];
            const x = (1 - point.x) * width;
            const y = point.y * height;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });
        ctx.closePath();
        ctx.stroke();

        // Draw eyes
        ctx.strokeStyle = '#60a5fa';
        ctx.lineWidth = 2;
        [leftEye, rightEye].forEach(eye => {
            ctx.beginPath();
            eye.forEach((idx, i) => {
                const point = landmarks[idx];
                const x = (1 - point.x) * width;
                const y = point.y * height;
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            });
            ctx.closePath();
            ctx.stroke();
        });

        // Draw eyebrows
        ctx.strokeStyle = '#a855f7';
        ctx.lineWidth = 2;
        [leftEyebrow, rightEyebrow].forEach(brow => {
            ctx.beginPath();
            brow.forEach((idx, i) => {
                const point = landmarks[idx];
                const x = (1 - point.x) * width;
                const y = point.y * height;
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            });
            ctx.stroke();
        });

        // Draw lips
        ctx.strokeStyle = '#f43f5e';
        ctx.lineWidth = 2;
        ctx.beginPath();
        lips.forEach((idx, i) => {
            const point = landmarks[idx];
            const x = (1 - point.x) * width;
            const y = point.y * height;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });
        ctx.closePath();
        ctx.stroke();

        // Draw key landmarks as dots
        const keyPoints = [1, 4, 5, 6, 10, 152, 234, 454]; // Nose, chin, forehead, temples
        ctx.fillStyle = '#fbbf24';
        keyPoints.forEach(idx => {
            const point = landmarks[idx];
            const x = (1 - point.x) * width;
            const y = point.y * height;
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, Math.PI * 2);
            ctx.fill();
        });
    }, []);

    // Draw pose landmarks
    const drawPoseLandmarks = useCallback((ctx: CanvasRenderingContext2D, landmarks: any[], width: number, height: number) => {
        // Pose connections
        const connections = [
            // Face
            [0, 1], [1, 2], [2, 3], [3, 7], [0, 4], [4, 5], [5, 6], [6, 8],
            // Torso
            [11, 12], [11, 23], [12, 24], [23, 24],
            // Left arm
            [11, 13], [13, 15], [15, 17], [15, 19], [15, 21], [17, 19],
            // Right arm
            [12, 14], [14, 16], [16, 18], [16, 20], [16, 22], [18, 20],
            // Left leg
            [23, 25], [25, 27], [27, 29], [27, 31], [29, 31],
            // Right leg
            [24, 26], [26, 28], [28, 30], [28, 32], [30, 32],
        ];

        // Draw connections
        ctx.strokeStyle = '#22c55e';
        ctx.lineWidth = 3;
        connections.forEach(([from, to]) => {
            const p1 = landmarks[from];
            const p2 = landmarks[to];
            if (p1 && p2 && p1.visibility > 0.3 && p2.visibility > 0.3) {
                ctx.beginPath();
                ctx.moveTo((1 - p1.x) * width, p1.y * height);
                ctx.lineTo((1 - p2.x) * width, p2.y * height);
                ctx.stroke();
            }
        });

        // Draw landmarks
        landmarks.forEach((point, i) => {
            if (point.visibility > 0.3) {
                const x = (1 - point.x) * width;
                const y = point.y * height;
                ctx.beginPath();
                ctx.arc(x, y, i < 11 ? 4 : 6, 0, Math.PI * 2);
                ctx.fillStyle = i < 11 ? '#60a5fa' : '#4ade80';
                ctx.fill();
            }
        });
    }, []);

    // Main detection loop
    const runDetection = useCallback(() => {
        if (!webcamRef.current?.video || !canvasRef.current) {
            animationFrameRef.current = requestAnimationFrame(runDetection);
            return;
        }

        const video = webcamRef.current.video;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        if (!ctx || video.readyState < 2) {
            animationFrameRef.current = requestAnimationFrame(runDetection);
            return;
        }

        const startTime = performance.now();

        // Clear and draw mirrored video
        ctx.save();
        ctx.scale(-1, 1);
        ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
        ctx.restore();

        try {
            // HAND DETECTION
            if ((activeTab === 'hands' || activeTab === 'gestures') && handLandmarkerRef.current) {
                const results = handLandmarkerRef.current.detectForVideo(video, startTime);

                const handLandmarks = getHandLandmarkLists(results);
                if (handLandmarks.length > 0) {
                    setHandsDetected(handLandmarks.length);

                    let totalFingers = 0;
                    handLandmarks.forEach((landmarks: any[], handIndex: number) => {
                        const fingers = countFingers(landmarks);
                        totalFingers += fingers;

                        if (activeTab === 'gestures' && gestureRecognizerRef.current) {
                            const gestureResult = gestureRecognizerRef.current.detect(landmarks, startTime);
                            if (gestureResult) {
                                setCurrentGesture(gestureResult.gesture);
                                setGestureConfidence(gestureResult.confidence);
                            } else {
                                setCurrentGesture(null);
                                setGestureConfidence(0);
                            }
                        }

                        // Draw landmarks
                        landmarks.forEach((point: any, i: number) => {
                            const x = (1 - point.x) * canvas.width;
                            const y = point.y * canvas.height;
                            ctx.beginPath();
                            ctx.arc(x, y, i === 8 ? 8 : 4, 0, Math.PI * 2);
                            ctx.fillStyle = handIndex === 0 ? '#4ade80' : '#60a5fa';
                            ctx.fill();
                        });

                        // Draw connections
                        const connections = [
                            [0, 1], [1, 2], [2, 3], [3, 4],
                            [0, 5], [5, 6], [6, 7], [7, 8],
                            [5, 9], [9, 10], [10, 11], [11, 12],
                            [9, 13], [13, 14], [14, 15], [15, 16],
                            [13, 17], [17, 18], [18, 19], [19, 20],
                            [0, 17]
                        ];

                        ctx.strokeStyle = handIndex === 0 ? '#22c55e' : '#3b82f6';
                        ctx.lineWidth = 2;
                        connections.forEach(([from, to]) => {
                            const p1 = landmarks[from];
                            const p2 = landmarks[to];
                            ctx.beginPath();
                            ctx.moveTo((1 - p1.x) * canvas.width, p1.y * canvas.height);
                            ctx.lineTo((1 - p2.x) * canvas.width, p2.y * canvas.height);
                            ctx.stroke();
                        });
                    });

                    setFingerCount(totalFingers);
                } else {
                    setHandsDetected(0);
                    setFingerCount(0);
                    setCurrentGesture(null);
                    setGestureConfidence(0);
                }
            }

            // FACE DETECTION
            if (activeTab === 'face' && faceLandmarkerRef.current) {
                const results = faceLandmarkerRef.current.detectForVideo(video, startTime);

                if (results?.faceLandmarks && results.faceLandmarks.length > 0) {
                    setFaceDetected(true);
                    const landmarks = results.faceLandmarks[0];

                    // Draw face mesh
                    drawFaceLandmarks(ctx, landmarks, canvas.width, canvas.height);

                    // Eye tracking
                    const leftEyePoints = [landmarks[33], landmarks[160], landmarks[158], landmarks[133], landmarks[153], landmarks[144]];
                    const rightEyePoints = [landmarks[362], landmarks[385], landmarks[387], landmarks[263], landmarks[373], landmarks[380]];

                    const leftEAR = calculateEAR(leftEyePoints);
                    const rightEAR = calculateEAR(rightEyePoints);

                    const BLINK_THRESHOLD = 0.25;
                    const leftOpen = leftEAR >= BLINK_THRESHOLD;
                    const rightOpen = rightEAR >= BLINK_THRESHOLD;

                    setLeftEyeOpen(leftOpen);
                    setRightEyeOpen(rightOpen);

                    // Blink detection
                    const isBlinking = !leftOpen && !rightOpen;
                    if (isBlinking && !wasBlinkingRef.current && (startTime - lastBlinkRef.current > 200)) {
                        setBlinkCount(prev => prev + 1);
                        lastBlinkRef.current = startTime;
                    }
                    wasBlinkingRef.current = isBlinking;

                    // Draw eye status overlay
                    ctx.fillStyle = leftOpen ? '#22c55e' : '#ef4444';
                    ctx.font = 'bold 14px sans-serif';
                    ctx.fillText(`Left Eye: ${leftOpen ? 'OPEN' : 'CLOSED'}`, 20, 30);
                    ctx.fillStyle = rightOpen ? '#22c55e' : '#ef4444';
                    ctx.fillText(`Right Eye: ${rightOpen ? 'OPEN' : 'CLOSED'}`, 20, 50);
                } else {
                    setFaceDetected(false);
                }
            }

            // POSTURE DETECTION
            if (activeTab === 'posture' && poseLandmarkerRef.current) {
                const results = poseLandmarkerRef.current.detectForVideo(video, startTime);

                if (results?.landmarks && results.landmarks.length > 0) {
                    setPoseDetected(true);
                    const landmarks = results.landmarks[0];

                    // Draw pose skeleton
                    drawPoseLandmarks(ctx, landmarks, canvas.width, canvas.height);

                    // Calculate shoulder alignment
                    const leftShoulder = landmarks[11];
                    const rightShoulder = landmarks[12];
                    if (leftShoulder && rightShoulder) {
                        const shoulderDiff = Math.abs(leftShoulder.y - rightShoulder.y);
                        const alignment = Math.max(0, 1 - (shoulderDiff * 5));
                        setShoulderAlignment(alignment);
                    }

                    // Calculate head tilt
                    const nose = landmarks[0];
                    const leftEar = landmarks[7];
                    const rightEar = landmarks[8];
                    if (nose && leftEar && rightEar) {
                        const earMidY = (leftEar.y + rightEar.y) / 2;
                        const tilt = (nose.y - earMidY) * 100;
                        setHeadTilt(tilt);
                    }
                } else {
                    setPoseDetected(false);
                }
            }

            // Calculate FPS
            const elapsed = performance.now() - startTime;
            setFps(Math.round(1000 / Math.max(elapsed, 1)));

        } catch (err) {
            console.error('Detection error:', err);
        }

        animationFrameRef.current = requestAnimationFrame(runDetection);
    }, [activeTab, countFingers, calculateEAR, drawFaceLandmarks, drawPoseLandmarks]);

    // Initialize landmarkers
    const initializeLandmarker = async (type: FeatureTab) => {
        const vision = await FilesetResolver.forVisionTasks(
            'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.8/wasm'
        );

        if (type === 'hands' || type === 'gestures') {
            if (!handLandmarkerRef.current) {
                addLog('Loading hand model...');
                handLandmarkerRef.current = await HandLandmarker.createFromOptions(vision, {
                    baseOptions: {
                        modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
                        delegate: 'GPU',
                    },
                    runningMode: 'VIDEO',
                    numHands: 2,
                    minHandDetectionConfidence: 0.3,
                    minHandPresenceConfidence: 0.3,
                    minTrackingConfidence: 0.3,
                });
                addLog('Hand model loaded!');
            }
        }

        if (type === 'face') {
            if (!faceLandmarkerRef.current) {
                addLog('Loading face model...');
                faceLandmarkerRef.current = await FaceLandmarker.createFromOptions(vision, {
                    baseOptions: {
                        modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
                        delegate: 'GPU',
                    },
                    runningMode: 'VIDEO',
                    numFaces: 1,
                    outputFaceBlendshapes: true,
                });
                addLog('Face model loaded!');
            }
        }

        if (type === 'posture') {
            if (!poseLandmarkerRef.current) {
                addLog('Loading pose model...');
                poseLandmarkerRef.current = await PoseLandmarker.createFromOptions(vision, {
                    baseOptions: {
                        modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',
                        delegate: 'GPU',
                    },
                    runningMode: 'VIDEO',
                    numPoses: 1,
                });
                addLog('Pose model loaded!');
            }
        }
    };

    // Start test for specific feature
    const startTest = async () => {
        setTestStatus('loading');
        addLog(`Starting ${activeTab} test...`);

        try {
            await initializeLandmarker(activeTab);
            setTestStatus('running');
            runDetection();
        } catch (err) {
            addLog(`Error: ${err}`);
            setTestStatus('error');
        }
    };

    // Stop test
    const stopTest = () => {
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
        }
        setTestStatus('idle');
        addLog('Test stopped');
    };

    // Get gesture emoji
    const gestureEmoji = useMemo(() => {
        if (!currentGesture) return '❓';
        return GestureRecognizer.getGestureEmoji(currentGesture);
    }, [currentGesture]);

    // Render stats based on active tab
    const renderStats = () => {
        switch (activeTab) {
            case 'hands':
                return (
                    <>
                        <div className="bg-white/10 border border-border rounded-xl p-4 text-center">
                            <div className="text-3xl font-bold text-green-400">{fps}</div>
                            <div className="text-sm text-white/60">FPS</div>
                        </div>
                        <div className="bg-white/10 border border-border rounded-xl p-4 text-center">
                            <div className="text-3xl font-bold text-blue-400">{handsDetected}</div>
                            <div className="text-sm text-white/60">Hands</div>
                        </div>
                        <div className="bg-white/10 border border-border rounded-xl p-4 text-center">
                            <div className="text-3xl font-bold text-purple-400">{fingerCount}</div>
                            <div className="text-sm text-white/60">Fingers</div>
                        </div>
                        <div className="bg-white/10 border border-border rounded-xl p-4 text-center">
                            <div className="text-3xl font-bold text-green-400">
                                {testStatus === 'running' ? '✓' : testStatus === 'loading' ? '⏳' : '○'}
                            </div>
                            <div className="text-sm text-white/60">Status</div>
                        </div>
                    </>
                );

            case 'gestures':
                return (
                    <>
                        <div className="bg-white/10 border border-border rounded-xl p-4 text-center">
                            <div className="text-4xl">{gestureEmoji}</div>
                            <div className="text-sm text-white/60">Gesture</div>
                        </div>
                        <div className="bg-white/10 border border-border rounded-xl p-4 text-center">
                            <div className="text-xl font-bold text-blue-400">
                                {currentGesture ? GestureRecognizer.getGestureDescription(currentGesture) : 'None'}
                            </div>
                            <div className="text-sm text-white/60">Type</div>
                        </div>
                        <div className="bg-white/10 border border-border rounded-xl p-4 text-center">
                            <div className="text-3xl font-bold text-purple-400">{Math.round(gestureConfidence * 100)}%</div>
                            <div className="text-sm text-white/60">Confidence</div>
                        </div>
                        <div className="bg-white/10 border border-border rounded-xl p-4 text-center">
                            <div className="text-3xl font-bold text-green-400">{handsDetected}</div>
                            <div className="text-sm text-white/60">Hands</div>
                        </div>
                    </>
                );

            case 'face':
                return (
                    <>
                        <div className="bg-white/10 border border-border rounded-xl p-4 text-center">
                            <div className={`text-3xl font-bold ${faceDetected ? 'text-green-400' : 'text-red-400'}`}>
                                {faceDetected ? '👤' : '❌'}
                            </div>
                            <div className="text-sm text-white/60">Face</div>
                        </div>
                        <div className="bg-white/10 border border-border rounded-xl p-4 text-center">
                            <div className="flex justify-center gap-2">
                                <span className={`text-2xl ${leftEyeOpen ? '' : 'opacity-30'}`}>👁️</span>
                                <span className={`text-2xl ${rightEyeOpen ? '' : 'opacity-30'}`}>👁️</span>
                            </div>
                            <div className="text-sm text-white/60">Eyes</div>
                        </div>
                        <div className="bg-white/10 border border-border rounded-xl p-4 text-center">
                            <div className="text-3xl font-bold text-purple-400">{blinkCount}</div>
                            <div className="text-sm text-white/60">Blinks</div>
                        </div>
                        <div className="bg-white/10 border border-border rounded-xl p-4 text-center">
                            <div className="text-3xl font-bold text-green-400">{fps}</div>
                            <div className="text-sm text-white/60">FPS</div>
                        </div>
                    </>
                );

            case 'posture':
                return (
                    <>
                        <div className="bg-white/10 border border-border rounded-xl p-4 text-center">
                            <div className={`text-3xl font-bold ${poseDetected ? 'text-green-400' : 'text-red-400'}`}>
                                {poseDetected ? '🧍' : '❌'}
                            </div>
                            <div className="text-sm text-white/60">Pose</div>
                        </div>
                        <div className="bg-white/10 border border-border rounded-xl p-4 text-center">
                            <div className="text-3xl font-bold text-blue-400">{Math.round(shoulderAlignment * 100)}%</div>
                            <div className="text-sm text-white/60">Shoulders</div>
                        </div>
                        <div className="bg-white/10 border border-border rounded-xl p-4 text-center">
                            <div className="text-3xl font-bold text-purple-400">{headTilt.toFixed(1)}°</div>
                            <div className="text-sm text-white/60">Head Tilt</div>
                        </div>
                        <div className="bg-white/10 border border-border rounded-xl p-4 text-center">
                            <div className="text-3xl font-bold text-green-400">{fps}</div>
                            <div className="text-sm text-white/60">FPS</div>
                        </div>
                    </>
                );
        }
    };

    const tabConfig: { id: FeatureTab; label: string; icon: string; description: string }[] = [
        { id: 'hands', label: 'Hand Tracking', icon: '✋', description: '21 landmarks per hand' },
        { id: 'gestures', label: 'Gestures', icon: '👆', description: 'Fist, thumbs up, peace...' },
        { id: 'face', label: 'Face Mesh', icon: '👤', description: '468 landmarks, eye tracking' },
        { id: 'posture', label: 'Body Pose', icon: '🧍', description: '33 body landmarks' },
    ];

    return (
        <section className="max-w-5xl mx-auto px-4 py-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                {/* Header */}
                <header className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold">MediaPipe Feature Test</h1>
                        <p className="text-white/60">Visual test for all MediaPipe capabilities</p>
                    </div>
                    <button
                        onClick={() => navigate('/games')}
                        className="px-4 py-2 bg-white/10 border border-border rounded-lg hover:bg-white/20 transition flex items-center gap-2"
                    >
                        <UIIcon name="home" size={16} />
                        Back
                    </button>
                </header>

                {/* Feature Tabs */}
                <div className="grid grid-cols-4 gap-2 mb-6">
                    {tabConfig.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => {
                                if (testStatus === 'running') stopTest();
                                setActiveTab(tab.id);
                            }}
                            className={`p-3 rounded-xl border transition text-left ${activeTab === tab.id
                                    ? 'bg-blue-500/20 border-blue-500 text-blue-400'
                                    : 'bg-white/5 border-border hover:bg-white/10'
                                }`}
                        >
                            <div className="text-2xl mb-1">{tab.icon}</div>
                            <div className="font-semibold text-sm">{tab.label}</div>
                            <div className="text-xs text-white/50">{tab.description}</div>
                        </button>
                    ))}
                </div>

                {/* Status Cards */}
                <div className="grid grid-cols-4 gap-4 mb-6">
                    {renderStats()}
                </div>

                {/* Camera View */}
                <div className="bg-white/10 border border-border rounded-xl p-4 mb-6">
                    <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-100">
                        <Webcam
                            ref={webcamRef}
                            audio={false}
                            mirrored
                            className="absolute inset-0 w-full h-full object-cover"
                            videoConstraints={{ facingMode: 'user', width: 640, height: 480 }}
                        />
                        <canvas
                            ref={canvasRef}
                            width={640}
                            height={480}
                            className="absolute inset-0 w-full h-full"
                        />

                        {/* Overlay */}
                        {testStatus === 'idle' && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/70">
                                <button
                                    onClick={startTest}
                                    className="px-8 py-4 bg-gradient-to-r from-green-500 to-green-600 rounded-xl font-bold text-xl hover:shadow-lg hover:shadow-green-500/30 transition"
                                >
                                    Start {tabConfig.find(t => t.id === activeTab)?.label}
                                </button>
                            </div>
                        )}

                        {testStatus === 'loading' && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/70">
                                <div className="text-center">
                                    <div className="animate-spin w-12 h-12 border-4 border-white/20 border-t-white rounded-full mx-auto mb-4" />
                                    <div className="text-xl font-semibold">Loading MediaPipe...</div>
                                </div>
                            </div>
                        )}

                        {testStatus === 'error' && (
                            <div className="absolute inset-0 flex items-center justify-center bg-red-500/20">
                                <div className="text-center">
                                    <div className="text-4xl mb-4">❌</div>
                                    <div className="text-xl font-semibold text-red-400">Error</div>
                                    <button
                                        onClick={stopTest}
                                        className="mt-4 px-6 py-2 bg-white/10 rounded-lg hover:bg-white/20"
                                    >
                                        Try Again
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Running indicator */}
                        {testStatus === 'running' && (
                            <div className="absolute top-4 left-4 right-4 flex justify-between">
                                <div className="bg-green-500/80 px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-2">
                                    <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                                    {tabConfig.find(t => t.id === activeTab)?.label} Active
                                </div>
                                <button
                                    onClick={stopTest}
                                    className="bg-red-500/80 px-3 py-1 rounded-full text-sm font-semibold hover:bg-red-500"
                                >
                                    Stop
                                </button>
                            </div>
                        )}

                        {/* Gesture overlay */}
                        {testStatus === 'running' && activeTab === 'gestures' && currentGesture && (
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/80 px-6 py-3 rounded-xl text-center">
                                <div className="text-4xl mb-1">{gestureEmoji}</div>
                                <div className="font-semibold">{GestureRecognizer.getGestureDescription(currentGesture)}</div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Logs */}
                <div className="bg-white/10 border border-border rounded-xl p-4">
                    <h2 className="text-lg font-semibold mb-3">Console Logs</h2>
                    <div className="bg-black/50 rounded-lg p-3 font-mono text-sm h-32 overflow-y-auto">
                        {logs.length === 0 ? (
                            <div className="text-white/40">Select a tab and click Start...</div>
                        ) : (
                            logs.map((log, i) => (
                                <div key={i} className="text-green-400">{log}</div>
                            ))
                        )}
                    </div>
                </div>

                {/* Feature Legend */}
                <div className="mt-6 grid grid-cols-4 gap-4 text-sm">
                    <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3">
                        <div className="font-semibold text-green-400 mb-1">✋ Hands</div>
                        <div className="text-white/60">21 landmarks, connections, finger counting</div>
                    </div>
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3">
                        <div className="font-semibold text-blue-400 mb-1">👆 Gestures</div>
                        <div className="text-white/60">8 gesture types with confidence scores</div>
                    </div>
                    <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-3">
                        <div className="font-semibold text-purple-400 mb-1">👤 Face</div>
                        <div className="text-white/60">468 landmarks, eyes, lips, blink detection</div>
                    </div>
                    <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3">
                        <div className="font-semibold text-yellow-400 mb-1">🧍 Pose</div>
                        <div className="text-white/60">33 body points, posture analysis</div>
                    </div>
                </div>
            </motion.div>
        </section>
    );
}

export default MediaPipeTest;
