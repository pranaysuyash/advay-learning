import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import Webcam from 'react-webcam';

import { GameShell } from '../components/GameShell';
import { GameContainer } from '../components/GameContainer';
import { useGameHandTracking } from '../hooks/useGameHandTracking';
import { useGameDrops } from '../hooks/useGameDrops';
import { useGameProgress } from '../hooks/useGameProgress';
import { useAudio } from '../utils/hooks/useAudio';
import { triggerHaptic } from '../utils/haptics';
import { useTTS } from '../hooks/useTTS';
import { KenneyIcon } from '../components/ui/KenneyIcon';
import type { TrackedHandFrame } from '../types/tracking';
import {
    initializeGame,
    updatePhysics,
    checkCollisions,
    type GameState,
    PLAYER_SPEED,
    JUMP_FORCE
} from '../games/spellingRunLogic';

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;

const ASSET_BASE = '/assets/kenney/platformer';
const ASSETS = {
    player: {
        idle: `${ASSET_BASE}/characters/character_pink_idle.png`,
        jump: `${ASSET_BASE}/characters/character_pink_jump.png`,
    },
    platform: `${ASSET_BASE}/tiles/grass_half.png`,
};

export const SpellingRunContent = memo(function SpellingRunContent() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const webcamRef = useRef<Webcam>(null);
    const [gameState, setGameState] = useState<GameState>(() => initializeGame(1));
    const [difficulty, _setDifficulty] = useState<number>(1);
    const [isLoading, setIsLoading] = useState(true);
    const imagesRef = useRef<Record<string, HTMLImageElement>>({});

    const { onGameComplete } = useGameDrops('spelling-run');
    const { saveProgress } = useGameProgress('spelling-run');
    const { playError, playCelebration } = useAudio();
    const { speak, isEnabled: ttsEnabled } = useTTS();

    const gameStateRef = useRef(gameState);
    gameStateRef.current = gameState;

    // Load assets
    useEffect(() => {
        const loadImages = async () => {
            const sources = {
                playerIdle: ASSETS.player.idle,
                playerJump: ASSETS.player.jump,
                platform: ASSETS.platform,
            };
            const loaded: Record<string, HTMLImageElement> = {};
            await Promise.all(Object.entries(sources).map(([key, src]) => {
                return new Promise((resolve) => {
                    const img = new Image();
                    img.onload = () => {
                        loaded[key] = img;
                        resolve(null);
                    };
                    img.onerror = () => {
                        console.error('Failed to load asset:', src);
                        resolve(null);
                    }
                    img.src = src;
                });
            }));
            imagesRef.current = loaded;
            setIsLoading(false);
        };
        loadImages();
    }, []);

    const handleFrame = useCallback((frame: TrackedHandFrame) => {
        if (!frame.indexTip || gameStateRef.current.status !== 'playing') return;

        const tip = frame.indexTip;

        // Jump detection: Hands up threshold
        if (tip.y < 0.25 && !gameStateRef.current.player.isJumping) {
            setGameState(prev => ({
                ...prev,
                player: {
                    ...prev.player,
                    vy: JUMP_FORCE,
                    isJumping: true
                }
            }));
            triggerHaptic('success');
        }

        // Horizontal movement: Map finger X to player target position relative to scroll
        setGameState(prev => ({
            ...prev,
            player: {
                ...prev.player,
                x: tip.x * CANVAS_WIDTH + prev.scrollX
            }
        }));
    }, []);

    const { handVisible } = useGameHandTracking({
        gameName: 'SpellingRun',
        webcamRef,
        onFrame: handleFrame,
    });

    // Game Loop
    useEffect(() => {
        const loop = () => {
            if (gameStateRef.current.status === 'playing') {
                setGameState(prev => {
                    let next = updatePhysics(prev);
                    next = checkCollisions(next);

                    // Update scroll
                    next.scrollX += PLAYER_SPEED;

                    if (next.status === 'complete') {
                        playCelebration();
                        (async () => {
                          await saveProgress({ score: next.score, completed: true, level: 1 });
                          onGameComplete(next.score);
                        })();
                    } else if (next.status === 'failed') {
                        playError();
                        // Reset or show game over
                    }

                    return next;
                });
            }
            requestAnimationFrame(loop);
        };
        const handle = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(handle);
    }, [onGameComplete, playCelebration, playError]);

    // Draw
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        // Background
        ctx.fillStyle = '#87CEEB';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        const scrollX = gameState.scrollX;
        const imgs = imagesRef.current;

        // Platforms
        gameState.platforms.forEach(p => {
            if (imgs.platform) {
                ctx.drawImage(imgs.platform, p.x - scrollX, p.y, p.width, p.height);
            } else {
                ctx.fillStyle = '#4CAF50';
                ctx.fillRect(p.x - scrollX, p.y, p.width, p.height);
            }
        });

        // Letters
        gameState.letters.forEach(l => {
            if (l.isCollected) return;
            // Draw a glowing bubble for the letter
            ctx.shadowBlur = 15;
            ctx.shadowColor = l.isCorrect ? '#FFD700' : '#FFF';
            ctx.fillStyle = l.isCorrect ? '#FFD700' : '#E0E0E0';
            ctx.beginPath();
            ctx.arc(l.x - scrollX, l.y, 25, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;

            ctx.fillStyle = '#333';
            ctx.font = 'bold 28px "Kenney Future"';
            ctx.textAlign = 'center';
            ctx.fillText(l.char, l.x - scrollX, l.y + 10);
        });

        // Player
        const p = gameState.player;
        if (imgs.playerIdle) {
            const playerImg = p.isJumping ? imgs.playerJump : imgs.playerIdle;
            ctx.drawImage(playerImg, p.x - scrollX, p.y, p.width, p.height);
        } else {
            ctx.fillStyle = '#FF5722';
            ctx.fillRect(p.x - scrollX, p.y, p.width, p.height);
        }

    }, [gameState]);

    const handleStart = () => {
        setGameState(prev => ({ ...prev, status: 'playing' }));
        if (ttsEnabled) speak(`Spell ${gameState.targetWord}! Jump to catch the letters!`);
    };

    return (
        <GameContainer
            title="Spelling Run"
            score={gameState.score}
            showScore={gameState.status !== 'idle'}
            isPlaying={gameState.status === 'playing'}
            isHandDetected={handVisible}
            webcamRef={webcamRef}
        >
            <div className="relative w-full h-full flex flex-col items-center justify-center">
                {isLoading ? (
                    <div className="text-2xl text-white animate-pulse">Loading Magic Letters...</div>
                ) : gameState.status === 'idle' ? (
                    <div className="text-center">
                        <h2 className="text-4xl font-black text-white mb-8">Ready to Spell?</h2>
                        <button
                            onClick={handleStart}
                            className="px-12 py-6 bg-yellow-400 hover:bg-yellow-500 text-yellow-900 rounded-3xl font-black text-2xl shadow-xl transition-all"
                        >
                            Start Running! 🏃‍♂️
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-white/90 px-8 py-4 rounded-2xl shadow-xl z-10">
                            <span className="text-2xl font-bold text-gray-400">Target:</span>
                            <div className="flex gap-2">
                                {gameState.targetWord.split('').map((char, i) => (
                                    <div
                                        key={i}
                                        className={`w-10 h-12 border-b-4 flex items-center justify-center text-3xl font-black ${i < gameState.currentWord.length ? 'border-green-500 text-green-600' : 'border-gray-300 text-gray-300'
                                            }`}
                                    >
                                        {i < gameState.currentWord.length ? char : ''}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <canvas
                            ref={canvasRef}
                            width={CANVAS_WIDTH}
                            height={CANVAS_HEIGHT}
                            className="rounded-3xl shadow-2xl bg-white/10 backdrop-blur-sm"
                        />

                        {gameState.status === 'complete' && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-20 rounded-3xl">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="bg-white p-12 rounded-[3rem] text-center"
                                >
                                    <div className="flex justify-center mb-4"><KenneyIcon type='star' size={64} /></div>
                                    <h2 className="text-4xl font-black text-gray-800 mb-2">Word Spelled!</h2>
                                    <p className="text-2xl text-green-600 font-bold mb-8">{gameState.targetWord}</p>
                                    <button
                                        onClick={() => setGameState(initializeGame(difficulty))}
                                        className="px-8 py-4 bg-blue-500 hover:bg-blue-600 text-white rounded-2xl font-black text-xl shadow-lg transition-all"
                                    >
                                        Next Word
                                    </button>
                                </motion.div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </GameContainer>
    );
});

export const SpellingRun = () => (
    <GameShell gameId="spelling-run" gameName="Spelling Run">
        <SpellingRunContent />
    </GameShell>
);

export default SpellingRun;
