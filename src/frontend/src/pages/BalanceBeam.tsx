import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Webcam from 'react-webcam';

import { GameShell } from '../components/GameShell';
import { GameContainer } from '../components/GameContainer';
import { useGamePoseTracking } from '../hooks/useGamePoseTracking';
import { useGameCompletion } from '../hooks/useGameCompletion';
import { useAudio } from '../utils/hooks/useAudio';
import { triggerHaptic } from '../utils/haptics';
import { useTTS } from '../hooks/useTTS';
import {
    createInitialState,
    updateBalance,
    checkFalling,
    GameState
} from '../games/balanceBeamLogic';

export const BalanceBeamContent = memo(function BalanceBeamContent() {
    const navigate = useNavigate();
    const webcamRef = useRef<Webcam>(null);
    const [gameState, setGameState] = useState<GameState>(() => createInitialState());
    const [alignment, setAlignment] = useState(0); // -1 to 1
    const [showCelebration, setShowCelebration] = useState(false);

    const { completeGame } = useGameCompletion('balance-beam');
    const { playSuccess, playError, playCelebration } = useAudio();
    const { speak, isEnabled: ttsEnabled } = useTTS();

    const gameStateRef = useRef(gameState);
    gameStateRef.current = gameState;

    // Handle Pose Frame
    const handlePoseFrame = useCallback((landmarks: any[]) => {
        if (gameStateRef.current.status !== 'playing') return;

        // Use nose + midpoint of shoulders to track horizontal alignment
        const nose = landmarks[0];
        const leftShoulder = landmarks[11];
        const rightShoulder = landmarks[12];

        // Blend nose and shoulder midpoint for more responsive tracking
        const shoulderMidX = (leftShoulder.x + rightShoulder.x) / 2;
        const midX = (nose.x + shoulderMidX) / 2;

        // Alignment relative to center (0.5)
        // Range roughly 0.3 to 0.7
        const rawAlignment = (midX - 0.5) * 5; // Scale to -1 to 1 range roughly
        const clampedAlignment = Math.max(-1, Math.min(1, rawAlignment));

        setAlignment(-clampedAlignment); // Invert because mirror image
    }, []);

    const { isLoading, poseDetected } = useGamePoseTracking({
        gameName: 'Balance Beam',
        webcamRef,
        onFrame: handlePoseFrame,
        enabled: gameState.status === 'playing',
    });

    // Game Loop
    useEffect(() => {
        if (gameState.status !== 'playing') return;

        const interval = setInterval(() => {
            setGameState(prev => {
                const { newBalance, wobble } = updateBalance(prev.balance, alignment, prev.level);

                if (checkFalling(newBalance)) {
                    playError();
                    triggerHaptic('error');
                    return { ...prev, balance: newBalance, status: 'fallen' };
                }

                const newTime = prev.timeLeft - 0.1;
                if (newTime <= 0) {
                    return { ...prev, status: 'complete', timeLeft: 0 };
                }

                return {
                    ...prev,
                    balance: newBalance,
                    wobble,
                    timeLeft: newTime,
                    score: prev.score + 1
                };
            });
        }, 100);

        return () => clearInterval(interval);
    }, [gameState.status, alignment, playError]);

    // Handle game complete
    useEffect(() => {
        if (gameState.status === 'complete' && !showCelebration) {
            setShowCelebration(true);
            playSuccess();
            playCelebration();
            completeGame({ score: gameState.score });
            if (ttsEnabled) speak('Amazing balance!');
        } else if (gameState.status === 'fallen') {
            if (ttsEnabled) speak('Whoops! Try to stay in the center.');
            setTimeout(() => {
                setGameState(createInitialState());
            }, 3000);
        }
    }, [gameState.status, gameState.score, showCelebration, playSuccess, playCelebration, completeGame, ttsEnabled, speak]);

    const startGame = () => {
        setGameState(prev => ({ ...prev, status: 'playing' }));
        if (ttsEnabled) speak('Step onto the beam and hold your balance!');
    };

    return (
        <GameContainer
            title="Balance Beam"
            score={gameState.score}
            isPlaying={gameState.status === 'playing'}
            isHandDetected={poseDetected}
            webcamRef={webcamRef}
        >
            <div className="relative w-full h-full bg-sky-300 overflow-hidden flex flex-col items-center justify-end">
                {/* Background Clouds */}
                <div className="absolute top-20 left-10 text-8xl opacity-50">☁️</div>
                <div className="absolute top-40 right-20 text-7xl opacity-40">☁️</div>

                {/* The Beam */}
                <div className="w-full h-1/4 bg-gradient-to-b from-amber-800 to-amber-950 relative">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-full bg-amber-700 shadow-inner" />
                    <div className="absolute -top-4 w-full h-8 bg-amber-600/50 blur-sm" />
                </div>

                {/* The Character (Visual representation of balance) */}
                <motion.div
                    animate={{
                        x: `${gameState.balance}%`,
                        rotate: gameState.balance / 4,
                    }}
                    transition={{ type: 'spring', damping: 20 }}
                    className="absolute bottom-1/4 mb-4 flex flex-col items-center"
                >
                    <div className="text-9xl relative">
                        {gameState.status === 'fallen' ? '😵' : '🧘'}
                        {/* Balancing bar */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-48 h-2 bg-slate-800 rounded-full" />
                    </div>
                </motion.div>

                {/* UI Overlays */}
                {gameState.status === 'idle' && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm z-20">
                        <motion.div
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            className="bg-white p-8 rounded-3xl text-center shadow-2xl max-w-sm"
                        >
                            <h2 className="text-3xl font-bold text-amber-800 mb-4">Balance Beam</h2>
                            <p className="text-gray-600 mb-8">Stand tall and keep the yogi in the center of the beam!</p>
                            <button
                                onClick={startGame}
                                disabled={isLoading}
                                className={`px-8 py-4 text-white rounded-2xl text-xl font-bold transition-all shadow-lg ${isLoading ? 'bg-gray-400 cursor-wait' : 'bg-amber-500 hover:bg-amber-600'}`}
                            >
                                {isLoading ? 'Loading Pose Detection…' : 'Start!'}
                            </button>
                        </motion.div>
                    </div>
                )}

                {/* Balance Meter */}
                {gameState.status === 'playing' && (
                    <div className="absolute top-10 left-1/2 -translate-x-1/2 w-64 h-4 bg-white/50 rounded-full overflow-hidden border-2 border-white">
                        <motion.div
                            animate={{ x: `${gameState.balance}%` }}
                            className={`w-4 h-full bg-amber-500 absolute left-1/2 -translate-x-1/2 rounded-full ${Math.abs(gameState.balance) > 70 ? 'bg-red-500' : 'bg-green-500'}`}
                        />
                    </div>
                )}

                {/* HUD */}
                {gameState.status === 'playing' && (
                    <div className="absolute top-4 right-4 bg-white/80 px-6 py-2 rounded-full font-bold">
                        Time: {Math.ceil(gameState.timeLeft)}s
                    </div>
                )}

                {/* Fallen State */}
                <AnimatePresence>
                    {gameState.status === 'fallen' && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-6xl font-black text-red-600 drop-shadow-lg z-30"
                        >
                            WHOOPS! 😱
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Victory Screen */}
                <AnimatePresence>
                    {showCelebration && (
                        <motion.div
                            className="absolute inset-0 bg-blue-900/40 backdrop-blur-md flex items-center justify-center z-50 p-4"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >
                            <motion.div
                                className="bg-white rounded-[3rem] p-12 text-center max-w-md w-full shadow-2xl"
                                initial={{ scale: 0.8 }}
                                animate={{ scale: 1 }}
                            >
                                <div className="text-8xl mb-6">🤸‍♂️</div>
                                <h2 className="text-4xl font-black text-green-600 mb-2">Well Balanced!</h2>
                                <div className="text-2xl font-bold text-gray-700 mb-8">Score: {gameState.score}</div>
                                <button
                                    onClick={() => navigate('/games')}
                                    className="px-10 py-4 bg-blue-500 text-white rounded-2xl text-xl font-bold"
                                >
                                    Great Job!
                                </button>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </GameContainer>
    );
});

export default function BalanceBeam() {
    return (
        <GameShell gameId="balance-beam" gameName="Balance Beam">
            <BalanceBeamContent />
        </GameShell>
    );
}
