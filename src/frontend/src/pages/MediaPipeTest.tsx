import { useState, useRef, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import Webcam from 'react-webcam';
import { useNavigate } from 'react-router-dom';
import { useHandTracking } from '../hooks/useHandTracking';
import { UIIcon } from '../components/ui/Icon';

/**
 * MediaPipe Test Page
 * Simple test page to verify hand tracking is working correctly
 */
export function MediaPipeTest() {
    const navigate = useNavigate();
    const webcamRef = useRef<Webcam>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationFrameRef = useRef<number | null>(null);

    const [testStatus, setTestStatus] = useState<'idle' | 'loading' | 'running' | 'error'>('idle');
    const [fps, setFps] = useState(0);
    const [handsDetected, setHandsDetected] = useState(0);
    const [fingerCount, setFingerCount] = useState(0);
    const [logs, setLogs] = useState<string[]>([]);

    const addLog = useCallback((message: string) => {
        const timestamp = new Date().toLocaleTimeString();
        setLogs(prev => [...prev.slice(-20), `[${timestamp}] ${message}`]);
    }, []);

    const {
        landmarker,
        isLoading,
        isReady,
        error,
        initialize,
        reset,
    } = useHandTracking({
        numHands: 2,
        minDetectionConfidence: 0.3,
        minHandPresenceConfidence: 0.3,
        minTrackingConfidence: 0.3,
        delegate: 'GPU',
        enableFallback: true,
    });

    // Count extended fingers (simple heuristic)
    const countFingers = useCallback((landmarks: any[]) => {
        let count = 0;
        // Thumb: compare tip to IP joint
        if (landmarks[4].x < landmarks[3].x) count++;
        // Other fingers: compare tip to PIP joint
        if (landmarks[8].y < landmarks[6].y) count++;  // Index
        if (landmarks[12].y < landmarks[10].y) count++; // Middle
        if (landmarks[16].y < landmarks[14].y) count++; // Ring
        if (landmarks[20].y < landmarks[18].y) count++; // Pinky
        return count;
    }, []);

    // Start detection loop
    const runDetection = useCallback(() => {
        if (!landmarker || !webcamRef.current?.video || !canvasRef.current) {
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

        try {
            const results = landmarker.detectForVideo(video, startTime);

            // Clear and draw mirrored video
            ctx.save();
            ctx.scale(-1, 1);
            ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
            ctx.restore();

            // Draw hand landmarks
            if (results?.landmarks && results.landmarks.length > 0) {
                setHandsDetected(results.landmarks.length);

                let totalFingers = 0;
                results.landmarks.forEach((landmarks: any[], handIndex: number) => {
                    const fingers = countFingers(landmarks);
                    totalFingers += fingers;

                    // Draw landmarks
                    landmarks.forEach((point: any, i: number) => {
                        const x = (1 - point.x) * canvas.width; // Mirror X
                        const y = point.y * canvas.height;

                        ctx.beginPath();
                        ctx.arc(x, y, i === 8 ? 8 : 4, 0, Math.PI * 2);
                        ctx.fillStyle = handIndex === 0 ? '#4ade80' : '#60a5fa';
                        ctx.fill();
                    });

                    // Draw connections
                    const connections = [
                        [0, 1], [1, 2], [2, 3], [3, 4], // Thumb
                        [0, 5], [5, 6], [6, 7], [7, 8], // Index
                        [5, 9], [9, 10], [10, 11], [11, 12], // Middle
                        [9, 13], [13, 14], [14, 15], [15, 16], // Ring
                        [13, 17], [17, 18], [18, 19], [19, 20], // Pinky
                        [0, 17] // Palm
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
            }

            // Calculate FPS
            const elapsed = performance.now() - startTime;
            setFps(Math.round(1000 / Math.max(elapsed, 1)));

        } catch (err) {
            console.error('Detection error:', err);
        }

        animationFrameRef.current = requestAnimationFrame(runDetection);
    }, [landmarker, countFingers]);

    // Handle test start
    const startTest = async () => {
        setTestStatus('loading');
        addLog('Starting MediaPipe test...');

        try {
            await initialize();
            addLog('MediaPipe initialized successfully');
            setTestStatus('running');
        } catch (err) {
            addLog(`Error: ${err}`);
            setTestStatus('error');
        }
    };

    // Start detection when ready
    useEffect(() => {
        if (isReady && testStatus === 'running') {
            addLog('Hand detection started');
            runDetection();
        }

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [isReady, testStatus, runDetection, addLog]);

    // Log state changes
    useEffect(() => {
        if (isLoading) addLog('Loading MediaPipe models...');
    }, [isLoading, addLog]);

    useEffect(() => {
        if (isReady) addLog('MediaPipe ready!');
    }, [isReady, addLog]);

    useEffect(() => {
        if (error) addLog(`Error: ${error.message}`);
    }, [error, addLog]);

    return (
        <section className="max-w-4xl mx-auto px-4 py-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                {/* Header */}
                <header className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold">MediaPipe Test</h1>
                        <p className="text-white/60">Verify hand tracking is working correctly</p>
                    </div>
                    <button
                        onClick={() => navigate('/games')}
                        className="px-4 py-2 bg-white/10 border border-border rounded-lg hover:bg-white/20 transition flex items-center gap-2"
                    >
                        <UIIcon name="home" size={16} />
                        Back to Games
                    </button>
                </header>

                {/* Status Cards */}
                <div className="grid grid-cols-4 gap-4 mb-6">
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
                        <div className={`text-3xl font-bold ${isReady ? 'text-green-400' : isLoading ? 'text-yellow-400' : 'text-red-400'}`}>
                            {isReady ? '✓' : isLoading ? '⏳' : error ? '✗' : '○'}
                        </div>
                        <div className="text-sm text-white/60">Status</div>
                    </div>
                </div>

                {/* Camera View */}
                <div className="bg-white/10 border border-border rounded-xl p-4 mb-6">
                    <div className="relative aspect-video rounded-xl overflow-hidden bg-black">
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
                                    Start Test
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
                                    <div className="text-xl font-semibold text-red-400">Error Loading MediaPipe</div>
                                    <button
                                        onClick={() => { reset(); setTestStatus('idle'); }}
                                        className="mt-4 px-6 py-2 bg-white/10 rounded-lg hover:bg-white/20"
                                    >
                                        Try Again
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Running indicator */}
                        {testStatus === 'running' && isReady && (
                            <div className="absolute top-4 right-4 bg-green-500/80 px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-2">
                                <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                                Tracking Active
                            </div>
                        )}
                    </div>
                </div>

                {/* Logs */}
                <div className="bg-white/10 border border-border rounded-xl p-4">
                    <h2 className="text-lg font-semibold mb-3">Console Logs</h2>
                    <div className="bg-black/50 rounded-lg p-3 font-mono text-sm h-48 overflow-y-auto">
                        {logs.length === 0 ? (
                            <div className="text-white/40">Click "Start Test" to begin...</div>
                        ) : (
                            logs.map((log, i) => (
                                <div key={i} className="text-green-400">{log}</div>
                            ))
                        )}
                    </div>
                </div>

                {/* Instructions */}
                <div className="mt-6 bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                    <h3 className="font-semibold text-blue-400 mb-2">How to Test</h3>
                    <ul className="text-white/70 text-sm space-y-1">
                        <li>1. Click "Start Test" to initialize MediaPipe</li>
                        <li>2. Allow camera access when prompted</li>
                        <li>3. Hold up your hands in front of the camera</li>
                        <li>4. You should see green/blue landmarks on your hands</li>
                        <li>5. FPS should be 20-30+ for smooth tracking</li>
                    </ul>
                </div>
            </motion.div>
        </section>
    );
}

export default MediaPipeTest;
