import { memo, useCallback, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

import { GameShell } from '../components/GameShell';
import { GameContainer } from '../components/GameContainer';
import { CelebrationOverlay } from '../components/CelebrationOverlay';
import { useGameHandTracking } from '../hooks/useGameHandTracking';
import { useGameSessionProgress } from '../hooks/useGameSessionProgress';
import { useAudio } from '../utils/hooks/useAudio';
import { triggerHaptic } from '../utils/haptics';
import {
    createCirclePath,
    isPointOnCircle,
    calculateProgress,
    isSpeedValid,
    DEFAULT_TOLERANCE,
    MAX_SPEED
} from '../games/circleDrawingLogic';
import type { TrackedHandFrame } from '../utils/handTrackingFrame';

const CircleDrawingContent = memo(function CircleDrawingContent() {
    const navigate = useNavigate();
    const [isPlaying, setIsPlaying] = useState(false);
    const [level, setLevel] = useState(1);
    const [score, setScore] = useState(0);
    const [progress, setProgress] = useState(0);
    const [isTooFast, setIsTooFast] = useState(false);
    const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
    const [showCelebration, setShowCelebration] = useState(false);

    const circlePath = useRef(createCirclePath(level));
    const prevPointRef = useRef<{ x: number; y: number } | null>(null);
    const lastFrameTimeRef = useRef<number>(Date.now());
    const maxReachedProgressRef = useRef(0);

    const { playPop, playSuccess: _playSuccess, playError: _playError, playCelebration: playFanfare } = useAudio();

    useGameSessionProgress({
        gameName: 'Circle Drawing',
        score,
        level,
        isPlaying,
        metaData: { progress, isTooFast },
    });

    const handleFrame = useCallback(
        (frame: TrackedHandFrame) => {
            const tip = frame.indexTip;
            if (!tip) {
                prevPointRef.current = null;
                return;
            }

            const now = Date.now();
            const deltaTime = now - lastFrameTimeRef.current;
            lastFrameTimeRef.current = now;

            setCursorPos({ x: tip.x, y: tip.y });

            // 1. Validate Speed (deciduous motor control)
            if (prevPointRef.current) {
                const { isValid, speed: _speed } = isSpeedValid(prevPointRef.current, tip, deltaTime, MAX_SPEED);
                setIsTooFast(!isValid);

                if (!isValid) {
                    triggerHaptic('error');
                    return; // Pause progress if moving too fast
                }
            }
            prevPointRef.current = { x: tip.x, y: tip.y };

            // 2. Validate Path
            if (isPointOnCircle(tip, circlePath.current, DEFAULT_TOLERANCE)) {
                const currentProgress = calculateProgress(tip, circlePath.current);

                // Progress must be forward (approximate)
                if (currentProgress > maxReachedProgressRef.current || (maxReachedProgressRef.current > 90 && currentProgress < 10)) {
                    setProgress(currentProgress);
                    if (currentProgress > maxReachedProgressRef.current) {
                        maxReachedProgressRef.current = currentProgress;
                    }

                    if (currentProgress >= 98 && maxReachedProgressRef.current > 90) {
                        setIsPlaying(false);
                        setShowCelebration(true);
                        setScore(s => s + 100 * level);
                        playFanfare();
                        triggerHaptic('celebration');
                    }
                }
            } else {
                // Optional: play subtle sound if off path
            }
        },
        [isPlaying, level, playFanfare]
    );

    const {
        isReady: isHandTrackingReady,
        startTracking,
        webcamRef,
    } = useGameHandTracking({
        gameName: 'CircleDrawing',
        targetFps: 30,
        isRunning: isPlaying,
        onFrame: handleFrame,
    });

    const startGame = () => {
        setIsPlaying(true);
        setProgress(0);
        setScore(0);
        maxReachedProgressRef.current = 0;
        playPop();
        void startTracking();
    };

    const handleNextLevel = () => {
        setShowCelebration(false);
        setLevel(l => l + 1);
        circlePath.current = createCirclePath(level + 1);
        startGame();
    };

    return (
        <GameContainer
            webcamRef={webcamRef}
            title="Circle Drawing"
            score={score}
            level={level}
            onHome={() => navigate('/dashboard')}
            isHandDetected={isHandTrackingReady}
            isPlaying={isPlaying}
        >
            <div className="absolute inset-0 bg-slate-900 overflow-hidden">
                {/* Zen Garden Background */}
                <div className="absolute inset-0 opacity-20 pointer-events-none">
                    <div className="w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900 via-slate-900 to-black" />
                </div>

                {/* The Circle Track */}
                <div className="relative w-full h-full flex items-center justify-center">
                    <svg className="w-full h-full">
                        {/* Ghost Path */}
                        <circle
                            cx={`${circlePath.current.center.x * 100}%`}
                            cy={`${circlePath.current.center.y * 100}%`}
                            r={`${circlePath.current.radius * 100}%`}
                            fill="none"
                            stroke="white"
                            strokeWidth="4"
                            strokeDasharray="8 8"
                            className="opacity-20"
                        />

                        {/* Trace Path (Visual Progress) */}
                        <motion.circle
                            cx={`${circlePath.current.center.x * 100}%`}
                            cy={`${circlePath.current.center.y * 100}%`}
                            r={`${circlePath.current.radius * 100}%`}
                            fill="none"
                            stroke={isTooFast ? "#EF4444" : "#10B981"}
                            strokeWidth="8"
                            strokeDasharray="1000"
                            strokeDashoffset={1000 - (progress / 100) * 1000}
                            strokeLinecap="round"
                            className="drop-shadow-[0_0_10px_rgba(16,185,129,0.5)] transition-colors duration-200"
                        />
                    </svg>

                    {/* Warning Overlay */}
                    <AnimatePresence>
                        {isTooFast && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 bg-red-500/10 pointer-events-none flex items-center justify-center"
                            >
                                <div className="bg-red-500 text-white px-6 py-2 rounded-full font-black text-xl shadow-lg border-2 border-white animate-bounce">
                                    Slow Down! 🐢
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Cursor Point */}
                <div
                    className={`absolute w-8 h-8 rounded-full border-4 ${isTooFast ? 'border-red-500 bg-red-100' : 'border-emerald-400 bg-emerald-100'} shadow-lg transform -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-200`}
                    style={{ left: `${cursorPos.x * 100}%`, top: `${cursorPos.y * 100}%` }}
                />

                {/* Start Button */}
                {!isPlaying && !showCelebration && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-30">
                        <div className="bg-white rounded-[2.5rem] p-10 text-center max-w-sm border-4 border-emerald-400 shadow-2xl">
                            <div className="text-6xl mb-4">✨</div>
                            <h2 className="text-3xl font-black text-slate-800 mb-2">Circle Drawing</h2>
                            <p className="text-slate-600 font-bold mb-8">
                                Trace the glowing circle <span className="text-emerald-500">very slowly</span> and carefully.
                            </p>
                            <button
                                onClick={startGame}
                                className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-black text-xl shadow-[0_4px_0_#065F46] active:translate-y-1 transition-all"
                            >
                                Let's Breathe & Draw
                            </button>
                        </div>
                    </div>
                )}

                {/* Celebration */}
                {showCelebration && (
                    <CelebrationOverlay
                        show={showCelebration}
                        letter="○"
                        accuracy={100}
                        message="Beautiful focus!"
                        onComplete={handleNextLevel}
                    />
                )}
            </div>
        </GameContainer>
    );
});

export const CircleDrawing = () => (
    <GameShell gameId="circle-drawing" gameName="Circle Drawing">
        <CircleDrawingContent />
    </GameShell>
);

export default CircleDrawing;
