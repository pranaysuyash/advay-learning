import { memo, useCallback, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Webcam from 'react-webcam';

import { GameShell } from '../components/GameShell';
import { GameContainer } from '../components/GameContainer';
import { useGameHandTracking } from '../hooks/useGameHandTracking';
import { useGameCompletion } from '../hooks/useGameCompletion';
import { useAudio } from '../utils/hooks/useAudio';
import { triggerHaptic } from '../utils/haptics';
import { useTTS } from '../hooks/useTTS';
import type { TrackedHandFrame } from '../types/tracking';
import {
    createInitialState,
    getRandomWord,
    checkSelection,
    VowelType,
    GameState
} from '../games/vowelValleyLogic';

export const VowelValleyContent = memo(function VowelValleyContent() {
    const navigate = useNavigate();
    const webcamRef = useRef<Webcam>(null);

    const [gameState, setGameState] = useState<GameState>(() => createInitialState());
    const [cursorPos, setCursorPos] = useState<{ x: number; y: number } | null>(null);
    const [hoveredZone, setHoveredZone] = useState<VowelType | null>(null);
    const [feedback, setFeedback] = useState<{ message: string; emoji: string } | null>(null);
    const [showCelebration, setShowCelebration] = useState(false);

    const { completeGame } = useGameCompletion('vowel-valley');
    const { playSuccess, playError, playCelebration } = useAudio();
    const { speak, isEnabled: ttsEnabled } = useTTS();

    const gameStateRef = useRef(gameState);
    gameStateRef.current = gameState;

    // Start Level
    const startLevel = useCallback(() => {
        const word = getRandomWord();
        setGameState(prev => ({
            ...prev,
            status: 'playing',
            currentWord: word,
        }));
        if (ttsEnabled) {
            speak(`Is the word ${word.word} a short or long vowel sound?`);
        }
    }, [ttsEnabled, speak]);

    // Handle Hand Frame
    const handleHandFrame = useCallback((frame: TrackedHandFrame) => {
        if (!frame.indexTip || gameStateRef.current.status !== 'playing') return;

        const cursor = { x: frame.indexTip.x, y: frame.indexTip.y };
        setCursorPos(cursor);

        // Zone detection
        // Short Valley: Left side (x < 0.4)
        // Long Valley: Right side (x > 0.6)
        let hovered: VowelType | null = null;
        if (cursor.x < 0.4 && cursor.y > 0.3 && cursor.y < 0.7) {
            hovered = 'short';
        } else if (cursor.x > 0.6 && cursor.y > 0.3 && cursor.y < 0.7) {
            hovered = 'long';
        }
        setHoveredZone(hovered);

        // Pinch to select
        if (frame.pinch?.state.isPinching && hovered && gameStateRef.current.status === 'playing') {
            handleSelect(hovered);
        }
    }, []);

    const { handVisible } = useGameHandTracking({
        gameName: 'Vowel Valley',
        webcamRef,
        onFrame: handleHandFrame,
    });

    const handleSelect = useCallback((selection: VowelType) => {
        const state = gameStateRef.current;
        if (state.status !== 'playing' || !state.currentWord) return;

        const isCorrect = checkSelection(state.currentWord, selection);

        if (isCorrect) {
            playSuccess();
            triggerHaptic('success');
            setFeedback({ message: 'Correct!', emoji: '🌟' });

            const newScore = state.score + 10 * (state.streak + 1);
            const newItemsSorted = state.itemsSorted + 1;
            const newStreak = state.streak + 1;

            if (newItemsSorted >= state.totalItems) {
                setGameState(prev => ({
                    ...prev,
                    status: 'complete',
                    score: newScore,
                    itemsSorted: newItemsSorted,
                    streak: newStreak
                }));
                setShowCelebration(true);
                playCelebration();
                (async () => {
                  await completeGame({ score: newScore, level: 1 });
                })();
            } else {
                setGameState(prev => ({
                    ...prev,
                    score: newScore,
                    itemsSorted: newItemsSorted,
                    streak: newStreak
                }));
                setTimeout(() => {
                    setFeedback(null);
                    startLevel();
                }, 1500);
            }
        } else {
            playError();
            triggerHaptic('error');
            setFeedback({ message: 'Try again!', emoji: '❌' });
            setGameState(prev => ({
                ...prev,
                streak: 0,
                lives: prev.lives - 1
            }));

            if (state.lives <= 1) {
                setTimeout(() => {
                    setShowCelebration(true);
                    setGameState(prev => ({ ...prev, status: 'complete' }));
                }, 1500);
            } else {
                setTimeout(() => {
                    setFeedback(null);
                }, 1500);
            }
        }
    }, [playSuccess, playError, playCelebration, completeGame, startLevel]);

    return (
        <GameContainer
            title="Vowel Valley"
            score={gameState.score}
            isPlaying={gameState.status === 'playing'}
            isHandDetected={handVisible}
            webcamRef={webcamRef}
        >
            <div className="relative w-full h-full bg-gradient-to-b from-blue-300 to-green-200 overflow-hidden flex flex-col items-center justify-center">
                {gameState.status === 'idle' ? (
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-white/90 p-8 rounded-3xl shadow-2xl text-center max-w-md"
                    >
                        <h1 className="text-4xl font-bold text-green-800 mb-4">Vowel Valley</h1>
                        <p className="text-gray-700 mb-8">
                            Listen to the word and sort it into the Short or Long vowel pools!
                        </p>
                        <button
                            onClick={startLevel}
                            className="px-8 py-4 bg-green-500 hover:bg-green-600 text-white rounded-2xl text-xl font-bold shadow-lg transition-transform hover:scale-105"
                        >
                            Start Game! 🌲
                        </button>
                    </motion.div>
                ) : (
                    <>
                        {/* The Valley View */}
                        <div className="flex w-full h-full justify-between items-center px-12">
                            {/* Short Valley */}
                            <motion.div
                                animate={{
                                    scale: hoveredZone === 'short' ? 1.05 : 1,
                                    backgroundColor: hoveredZone === 'short' ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.1)'
                                }}
                                className="w-1/3 h-2/3 border-4 border-dashed border-blue-400 rounded-3xl flex flex-col items-center justify-center backdrop-blur-sm"
                            >
                                <div className="text-6xl mb-4">💧</div>
                                <h2 className="text-2xl font-black text-blue-700">SHORT</h2>
                                <div className="text-sm text-blue-600 mt-2">vowel sound</div>
                            </motion.div>

                            {/* Word Item */}
                            <AnimatePresence mode="wait">
                                {gameState.currentWord && !feedback && (
                                    <motion.div
                                        key={gameState.currentWord.id}
                                        initial={{ y: -200, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        exit={{ scale: 0, opacity: 0 }}
                                        className="bg-white p-6 rounded-2xl shadow-xl text-center z-10"
                                    >
                                        <div className="text-7xl mb-2">{gameState.currentWord.emoji}</div>
                                        <div className="text-3xl font-bold text-gray-800">{gameState.currentWord.word}</div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Long Valley */}
                            <motion.div
                                animate={{
                                    scale: hoveredZone === 'long' ? 1.05 : 1,
                                    backgroundColor: hoveredZone === 'long' ? 'rgba(234, 179, 8, 0.3)' : 'rgba(234, 179, 8, 0.1)'
                                }}
                                className="w-1/3 h-2/3 border-4 border-dashed border-yellow-500 rounded-3xl flex flex-col items-center justify-center backdrop-blur-sm"
                            >
                                <div className="text-6xl mb-4">✨</div>
                                <h2 className="text-2xl font-black text-yellow-700">LONG</h2>
                                <div className="text-sm text-yellow-600 mt-2">vowel sound</div>
                            </motion.div>
                        </div>

                        {/* Feedback Overlay */}
                        <AnimatePresence>
                            {feedback && (
                                <motion.div
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0, opacity: 0 }}
                                    className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-12 py-6 rounded-3xl text-3xl font-bold shadow-2xl z-50 text-white ${feedback.message === 'Correct!' ? 'bg-green-500' : 'bg-red-500'
                                        }`}
                                >
                                    {feedback.emoji} {feedback.message}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Score & HUD */}
                        <div className="absolute top-4 right-4 bg-white/80 px-6 py-2 rounded-full shadow-md">
                            <span className="font-bold text-gray-700">Score: {gameState.score}</span>
                        </div>
                        <div className="absolute top-4 left-4 bg-white/80 px-6 py-2 rounded-full shadow-md">
                            <span className="font-bold text-gray-700">Lives: {'❤️'.repeat(gameState.lives)}</span>
                        </div>
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/80 px-8 py-2 rounded-full shadow-md">
                            <span className="text-gray-600">Progress: {gameState.itemsSorted} / {gameState.totalItems}</span>
                        </div>

                        {/* Hand Cursor */}
                        {cursorPos && (
                            <motion.div
                                className="absolute w-8 h-8 rounded-full border-4 border-white shadow-lg pointer-events-none z-50"
                                style={{
                                    left: `${cursorPos.x * 100}%`,
                                    top: `${cursorPos.y * 100}%`,
                                    transform: 'translate(-50%, -50%)',
                                    backgroundColor: hoveredZone ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.4)'
                                }}
                            />
                        )}
                    </>
                )}

                {/* Victory Celebration */}
                <AnimatePresence>
                    {showCelebration && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/60 flex items-center justify-center z-[100]"
                        >
                            <motion.div
                                initial={{ scale: 0.5, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="bg-white p-12 rounded-3xl text-center shadow-2xl max-w-md"
                            >
                                <div className="text-8xl mb-6">🏆</div>
                                <h2 className="text-4xl font-bold text-gray-800 mb-2">Well Done!</h2>
                                <p className="text-xl text-gray-600 mb-8">You mastered the valley!</p>
                                <div className="text-3xl font-black text-green-600 mb-8">Score: {gameState.score}</div>
                                <button
                                    onClick={() => navigate('/games')}
                                    className="px-10 py-4 bg-blue-500 hover:bg-blue-600 text-white text-xl font-bold rounded-2xl shadow-lg transition-transform hover:scale-105"
                                >
                                    Continue
                                </button>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </GameContainer>
    );
});

export default function VowelValley() {
    return (
        <GameShell gameId="vowel-valley" gameName="Vowel Valley">
            <VowelValleyContent />
        </GameShell>
    );
}
