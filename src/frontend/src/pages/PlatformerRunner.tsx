import { useRef, useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { GameContainer } from '../components/GameContainer';
import { useGameHandTracking } from '../hooks/useGameHandTracking';
import { LoadingState } from '../components/LoadingState';
import { useGameSessionProgress } from '../hooks/useGameSessionProgress';
import { useGameDrops } from '../hooks/useGameDrops';
import type { TrackedHandFrame } from '../types/tracking';

// --- Assets ---
const ASSET_BASE = '/assets/kenney/platformer';
const ASSETS = {
    player: {
        idle: `${ASSET_BASE}/characters/character_green_idle.png`,
        jump: `${ASSET_BASE}/characters/character_green_jump.png`,
        hit: `${ASSET_BASE}/characters/character_green_hit.png`,
        walkA: `${ASSET_BASE}/characters/character_green_walk_a.png`,
        walkB: `${ASSET_BASE}/characters/character_green_walk_b.png`,
    },
    enemies: {
        slimeA: `${ASSET_BASE}/enemies/slime_normal_walk_a.png`,
        slimeB: `${ASSET_BASE}/enemies/slime_normal_walk_b.png`,
        beeA: `${ASSET_BASE}/enemies/bee_a.png`,
        beeB: `${ASSET_BASE}/enemies/bee_b.png`,
    },
    tiles: {
        grass: `${ASSET_BASE}/tiles/terrain_grass_horizontal_middle.png`,
    },
    collectibles: {
        coin: `${ASSET_BASE}/collectibles/coin_gold.png`,
        gem: `${ASSET_BASE}/collectibles/gem_blue.png`,
        star: `${ASSET_BASE}/collectibles/star.png`,
    },
    hud: {
        heart: `${ASSET_BASE}/hud/hud_heart.png`,
        heartEmpty: `${ASSET_BASE}/hud/hud_heart_empty.png`,
    },
    bg: `${ASSET_BASE}/spritesheet-backgrounds-default.png`,
    sounds: {
        jump: `${ASSET_BASE}/sounds/sfx_jump.ogg`,
        coin: `${ASSET_BASE}/sounds/sfx_coin.ogg`,
        hurt: `${ASSET_BASE}/sounds/sfx_hurt.ogg`,
        bump: `${ASSET_BASE}/sounds/sfx_bump.ogg`,
        gem: `${ASSET_BASE}/sounds/sfx_gem.ogg`,
    },
};

// --- Types & Constants ---
type GameState = 'LOADING' | 'READY' | 'PLAYING' | 'GAMEOVER';

interface Rect {
    x: number;
    y: number;
    w: number;
    h: number;
}

interface GameObject extends Rect {
    id: number;
    type: string;
    vx: number;
    vy: number;
    active: boolean;
    frameTimer: number;
    frameIndex: number;
    startY?: number; // for bobbing enemies
}

const CANVAS_WIDTH = 800; // logical sizes
const CANVAS_HEIGHT = 600;
const GROUND_Y = CANVAS_HEIGHT - 64; // height of the terrain tile

// Simple AABB Collision
function checkCollision(r1: Rect, r2: Rect, margin = 0.8): boolean {
    // apply a margin to make collisions feel fairer (smaller hitbox)
    const mw = r1.w * (1 - margin);
    const mh = r1.h * (1 - margin);
    const r1Shrunken = {
        x: r1.x + mw / 2,
        y: r1.y + mh / 2,
        w: r1.w * margin,
        h: r1.h * margin,
    };
    const r2mw = r2.w * (1 - margin);
    const r2mh = r2.h * (1 - margin);
    const r2Shrunken = {
        x: r2.x + r2mw / 2,
        y: r2.y + r2mh / 2,
        w: r2.w * margin,
        h: r2.h * margin,
    };

    return (
        r1Shrunken.x < r2Shrunken.x + r2Shrunken.w &&
        r1Shrunken.x + r1Shrunken.w > r2Shrunken.x &&
        r1Shrunken.y < r2Shrunken.y + r2Shrunken.h &&
        r1Shrunken.y + r1Shrunken.h > r2Shrunken.y
    );
}

// Custom hook to preload images
function useImageCache() {
    const urls = ASSETS;
    const [loaded, setLoaded] = useState(false);
    const cacheRef = useRef<Record<string, HTMLImageElement>>({});

    useEffect(() => {
        const imagesToLoad: string[] = [];
        const _extractUrls = (obj: any) => {
            Object.entries(obj).forEach(([, value]) => {
                if (typeof value === 'string') {
                    // ignore sounds
                    if (!value.endsWith('.ogg')) imagesToLoad.push(value);
                } else {
                    _extractUrls(value);
                }
            });
        };
        _extractUrls(urls);

        let loadedCount = 0;
        const cache = cacheRef.current;

        if (imagesToLoad.length === 0) {
            setLoaded(true);
            return;
        }

        imagesToLoad.forEach((url) => {
            if (cache[url]) {
                loadedCount++;
                if (loadedCount === imagesToLoad.length) setLoaded(true);
                return;
            }
            const img = new Image();
            img.src = url;
            img.onload = () => {
                cache[url] = img;
                loadedCount++;
                if (loadedCount === imagesToLoad.length) {
                    setLoaded(true);
                }
            };
            img.onerror = () => {
                console.error(`Failed to load image: ${url}`);
                loadedCount++; // don't block forever
                if (loadedCount === imagesToLoad.length) setLoaded(true);
            };
        });
    }, [urls]);

    return { loaded, cache: cacheRef.current };
}

// Custom hook for simple audio
function useAudioCache(sounds: Record<string, string>) {
    const cacheRef = useRef<Record<string, HTMLAudioElement>>({});

    useEffect(() => {
        Object.entries(sounds).forEach(([key, url]) => {
            const audio = new Audio(url);
            cacheRef.current[key] = audio;
        });
    }, [sounds]);

    const play = useCallback((key: string) => {
        const audio = cacheRef.current[key];
        if (audio) {
            audio.currentTime = 0;
            audio.play().catch((e) => console.log('Audio play prevented:', e));
        }
    }, []);

    return play;
}

export function PlatformerRunner() {
    const navigate = useNavigate();
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // States
    const [gameState, setGameState] = useState<GameState>('LOADING');
    const [score, setScore] = useState(0);
    const [lives, setLives] = useState(3);
    const [isPaused, setIsPaused] = useState(false);

    const { loaded: imagesLoaded, cache: images } = useImageCache();
    const playSound = useAudioCache(ASSETS.sounds);

    // Hand tracking
    const [handY, setHandY] = useState(0.5); // 0 (top) to 1 (bottom)
    const { isReady: isCameraReady } = useGameHandTracking({
        gameName: 'platformer-runner',
        targetFps: 30,
        onFrame: (frame: TrackedHandFrame) => {
            const hand = frame.primaryHand;
            if (hand && hand.length > 0) {
                // use wrist (0) or middle finger mcp (9) for vertical proxy
                // simple average of a few points
                const y = (hand[0]?.y + (hand[9]?.y || hand[0]?.y)) / 2;
                if (!isNaN(y)) {
                    // clamp and maybe smooth
                    setHandY(Math.max(0, Math.min(1, y)));
                }
            }
        },
    });

    const { onGameComplete, triggerEasterEgg } = useGameDrops('platformer-runner');

    // Analytics/Progress
    useGameSessionProgress({
        gameName: 'platformer-runner',
        score: score,
        isPlaying: gameState === 'PLAYING' && !isPaused,
    });

    // Refs for requestAnimationFrame logic
    const requestRef = useRef<number | null>(null);
    const lastTimeRef = useRef<number>(0);

    // Mutable Game State (avoids React render cycle for physics)
    const gameRef = useRef({
        speed: 300, // pixels per second
        bgOffsetX: 0,
        terrainOffsetX: 0,
        distance: 0,
        spawnTimer: 0,
        invulnerableTimer: 0,
        nextId: 0,
        player: {
            x: 100,
            y: GROUND_Y - 96,
            w: 96,
            h: 96,
            vy: 0,
            isJumping: false,
            frameTimer: 0,
            frameIndex: 0,
        },
        objects: [] as GameObject[],
    });

    // Init
    useEffect(() => {
        const skipCamera = (window as any).__DEV_DISABLE_CAMERA;
        if (imagesLoaded && (isCameraReady || skipCamera) && gameState === 'LOADING') {
            setGameState('READY');
        }
    }, [imagesLoaded, isCameraReady, gameState]);

    // Restart
    const handleRestart = () => {
        setScore(0);
        setLives(3);
        setGameState('PLAYING');
        setIsPaused(false);
        gameRef.current = {
            ...gameRef.current,
            speed: 300,
            bgOffsetX: 0,
            terrainOffsetX: 0,
            distance: 0,
            spawnTimer: 0,
            invulnerableTimer: 0,
            nextId: 0,
            objects: [],
            player: {
                x: 100,
                y: GROUND_Y - 96,
                w: 96,
                h: 96,
                vy: 0,
                isJumping: false,
                frameTimer: 0,
                frameIndex: 0,
            },
        };
        playSound('jump'); // test
    };

    const handlePause = () => setIsPaused(true);
    const handleExit = () => {
        navigate('/games');
    };

    // Main Loop
    const update = useCallback(
        (time: number) => {
            if (!lastTimeRef.current) lastTimeRef.current = time;
            const deltaTimeInMs = time - lastTimeRef.current;
            const dt = Math.min(deltaTimeInMs / 1000, 0.1); // caps dt at 100ms
            lastTimeRef.current = time;

            const state = gameRef.current;
            const p = state.player;

            if (gameState === 'PLAYING' && !isPaused) {
                // 1. Move Environment based on speed
                state.bgOffsetX += (state.speed * 0.2) * dt; // background parallax
                state.terrainOffsetX += state.speed * dt;
                state.distance += state.speed * dt;

                // increase speed very slowly
                state.speed += 2 * dt;

                // 2. Map Player Y based on hand tracking.
                // We map handY (0 to 1) to (0 to GROUND_Y - p.h)
                // Add a little smoothing
                const targetY = handY * (CANVAS_HEIGHT - p.h);
                // keep player above ground
                const clampedTargetY = Math.min(targetY, GROUND_Y - p.h);

                const dy = clampedTargetY - p.y;
                p.y += dy * 10 * dt; // lerp

                if (p.y < GROUND_Y - p.h - 10) {
                    p.isJumping = true;
                } else {
                    p.isJumping = false;
                }

                // Animation Frames
                p.frameTimer += dt * 10;
                if (p.frameTimer >= 1) {
                    p.frameTimer -= 1;
                    p.frameIndex = (p.frameIndex + 1) % 2; // general walk cycle length
                }

                // Invulnerability
                if (state.invulnerableTimer > 0) {
                    state.invulnerableTimer -= dt;
                }

                // 3. Spawner
                state.spawnTimer -= dt;
                if (state.spawnTimer <= 0) {
                    // spawn!
                    state.spawnTimer = 1.0 + Math.random() * 1.5; // Random delay between spawns
                    const r = Math.random();

                    const newObj: GameObject = {
                        id: state.nextId++,
                        type: '',
                        x: CANVAS_WIDTH + 50,
                        y: 0,
                        w: 64,
                        h: 64,
                        vx: -state.speed, // move left at world speed
                        vy: 0,
                        active: true,
                        frameTimer: 0,
                        frameIndex: 0,
                    };

                    if (r < 0.4) {
                        // Slime (Ground Enemy)
                        newObj.type = 'slime';
                        newObj.w = 64; // slimes are wider than tall initially, keep simple
                        newObj.h = 64;
                        newObj.y = GROUND_Y - 64;
                        newObj.vx = -state.speed - 50; // slimes move slightly faster than ground
                    } else if (r < 0.6) {
                        // Bee (Air Enemy)
                        newObj.type = 'bee';
                        newObj.y = 100 + Math.random() * 200; // high up
                        newObj.startY = newObj.y;
                        newObj.vx = -state.speed - 30;
                    } else if (r < 0.9) {
                        // Coin
                        newObj.type = 'coin';
                        newObj.w = 48;
                        newObj.h = 48;
                        newObj.y = 50 + Math.random() * (GROUND_Y - 150);
                    } else {
                        // Gem (rare)
                        newObj.type = 'gem';
                        newObj.w = 48;
                        newObj.h = 48;
                        newObj.y = 50 + Math.random() * (GROUND_Y - 150);
                    }
                    state.objects.push(newObj);
                }

                // 4. Update Objects & Collisions
                for (const obj of state.objects) {
                    if (!obj.active) continue;

                    obj.x += obj.vx * dt;
                    obj.y += obj.vy * dt;

                    if (obj.type === 'bee' && obj.startY !== undefined) {
                        obj.y = obj.startY + Math.sin(time / 200) * 30; // bobbing motion
                    }

                    // Animation
                    obj.frameTimer += dt * 8;
                    if (obj.frameTimer > 1) {
                        obj.frameTimer -= 1;
                        obj.frameIndex = (obj.frameIndex + 1) % 2;
                    }

                    // Offscreen
                    if (obj.x + obj.w < -100) {
                        obj.active = false;
                    }

                    // Collision checking (only if vulnerable or item)
                    if (checkCollision({ ...p }, obj)) {
                        if (obj.type === 'coin' || obj.type === 'gem') {
                            // Collect
                            obj.active = false;
                            setScore(s => s + (obj.type === 'gem' ? 5 : 1));
                            playSound(obj.type === 'gem' ? 'gem' : 'coin');
                        } else if (obj.type === 'slime' || obj.type === 'bee') {
                            // Hit by enemy
                            if (state.invulnerableTimer <= 0) {
                                obj.active = false; // destroy enemy for fairness
                                playSound('hurt');
                                state.invulnerableTimer = 2.0; // 2s invulnerable
                                setLives(l => {
                                    const newLives = l - 1;
                                    if (newLives <= 0) {
                                        setGameState('GAMEOVER');
                                    }
                                    return newLives;
                                });
                            }
                        }
                    }
                }

                // Cleanup inactive
                state.objects = state.objects.filter((o) => o.active);
            }

            // Draw
            const ctx = canvasRef.current?.getContext('2d');
            if (ctx) {
                ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

                // Draw Background Layer
                const bgImg = images[ASSETS.bg];
                if (bgImg) {
                    // Kenney backgrounds are 1024x1024 tiles. We'll take the top-left one (sky + clouds).
                    const sx = 0, sy = 0, sw = 1024, sh = 1024;
                    // Draw it scaled to fit canvas height, and tile it horizontally
                    const drawH = CANVAS_HEIGHT;
                    const drawW = (sw / sh) * drawH; // maintain aspect ratio

                    for (let i = 0; i < Math.ceil(CANVAS_WIDTH / drawW) + 1; i++) {
                        ctx.drawImage(bgImg, sx, sy, sw, sh, (i * drawW) - (state.bgOffsetX % drawW), 0, drawW, drawH);
                    }
                } else {
                    // Fallback sky
                    ctx.fillStyle = '#87CEEB';
                    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
                }

                // Draw Player
                if (state.invulnerableTimer <= 0 || Math.floor(time / 100) % 2 === 0) {
                    let playerImgUrl = ASSETS.player.idle;
                    if (state.invulnerableTimer > 0) playerImgUrl = ASSETS.player.hit;
                    else if (p.isJumping) playerImgUrl = ASSETS.player.jump;
                    else if (p.frameIndex === 0) playerImgUrl = ASSETS.player.walkA;
                    else playerImgUrl = ASSETS.player.walkB;

                    const pImg = images[playerImgUrl];
                    if (pImg) {
                        ctx.drawImage(pImg, p.x, p.y, p.w, p.h);
                    }
                }

                // Draw Objects
                for (const obj of state.objects) {
                    if (!obj.active) continue;
                    let imgUrl = '';
                    if (obj.type === 'slime') imgUrl = obj.frameIndex === 0 ? ASSETS.enemies.slimeA : ASSETS.enemies.slimeB;
                    else if (obj.type === 'bee') imgUrl = obj.frameIndex === 0 ? ASSETS.enemies.beeA : ASSETS.enemies.beeB;
                    else if (obj.type === 'coin') imgUrl = ASSETS.collectibles.coin;
                    else if (obj.type === 'gem') imgUrl = ASSETS.collectibles.gem;

                    const img = images[imgUrl];
                    if (img) {
                        ctx.drawImage(img, obj.x, obj.y, obj.w, obj.h);
                    }
                }

                // Draw Terrain (Grass line)
                const tImg = images[ASSETS.tiles.grass];
                if (tImg) {
                    const tileW = 128; // logical width
                    const tileH = 128;
                    // draw enough tiles to cover width + 2
                    for (let i = -1; i < Math.ceil(CANVAS_WIDTH / tileW) + 1; i++) {
                        ctx.drawImage(tImg, (i * tileW) - (state.terrainOffsetX % tileW), GROUND_Y, tileW, tileH);
                    }
                } else {
                    // Fallback terrain
                    ctx.fillStyle = '#228B22';
                    ctx.fillRect(0, GROUND_Y, CANVAS_WIDTH, CANVAS_HEIGHT - GROUND_Y);
                }
            }

            requestRef.current = requestAnimationFrame(update);
        },
        [gameState, isPaused, images, playSound, handY]
    );

    // Restart loop when deps change
    useEffect(() => {
        requestRef.current = requestAnimationFrame(update);
        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, [update]);

    // Handle game over — trigger drops
    useEffect(() => {
        if (gameState === 'GAMEOVER') {
            onGameComplete(score);
            if (score >= 20) {
                triggerEasterEgg('egg-coin-king');
            }
        }
    }, [gameState, onGameComplete, score, triggerEasterEgg]);

    return (
        <GameContainer
            title='Platform Runner'
            score={score}
            onPause={handlePause}
            onHome={handleExit}
            isHandDetected={isCameraReady}
            isPlaying={gameState === 'PLAYING'}
            reportSession={false}
        >
            <div className="relative w-full h-full flex flex-col items-center justify-center bg-gray-900 rounded-3xl overflow-hidden shrink-0 mt-4 max-h-[70vh]">

                {(!imagesLoaded || (!isCameraReady && !(window as any).__DEV_DISABLE_CAMERA)) ? (
                    <LoadingState message={!imagesLoaded ? 'Loading Assets...' : 'Starting Camera...'} />
                ) : null}

                {gameState === 'READY' && (
                    <div className="absolute inset-0 bg-black/50 z-10 flex flex-col items-center justify-center backdrop-blur-sm p-4 text-center">
                        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-3xl p-8 max-w-md w-full border-4 border-advay-slate shadow-xl">
                            <h2 className="text-4xl font-black text-advay-slate tracking-tight mb-4">Ready to Run?</h2>
                            <p className="text-xl font-bold text-gray-500 mb-6">
                                Use your hand to control Pip. Raise it high to jump and dodge the slimes! Collect coins and gems!
                            </p>
                            <button
                                className="w-full py-4 bg-[#E85D04] font-black text-white text-2xl uppercase tracking-widest rounded-2xl hover:bg-[#D04D02] hover:scale-105 active:scale-95 transition-all shadow-[0_4px_0_#9A3800]"
                                onClick={handleRestart}
                            >
                                Start Running
                            </button>
                        </motion.div>
                    </div>
                )}

                {gameState === 'GAMEOVER' && (
                    <div className="absolute inset-0 bg-black/60 z-10 flex flex-col items-center justify-center backdrop-blur-md p-4 text-center">
                        <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-white rounded-3xl p-8 max-w-sm w-full border-4 border-[#E85D04] shadow-2xl">
                            <h2 className="text-5xl font-black text-[#E85D04] tracking-tight mb-2 uppercase">Game Over</h2>
                            <p className="text-2xl font-bold text-gray-500 mb-6 uppercase tracking-widest">
                                Score: <span className="text-[#3B82F6]">{score}</span>
                            </p>
                            <button
                                className="w-full py-4 bg-advay-slate font-black text-white text-xl uppercase tracking-widest rounded-2xl hover:bg-slate-800 hover:scale-105 active:scale-95 transition-all shadow-lg"
                                onClick={handleRestart}
                            >
                                Play Again
                            </button>
                        </motion.div>
                    </div>
                )}

                {/* HUD Overlay inside the canvas view */}
                <div className="absolute top-4 left-4 z-10 pointer-events-none flex gap-1">
                    {[...Array(3)].map((_, i) => (
                        <img
                            key={i}
                            src={i < lives ? ASSETS.hud.heart : ASSETS.hud.heartEmpty}
                            alt="Heart"
                            className="w-8 h-8 md:w-12 md:h-12 drop-shadow-md"
                        />
                    ))}
                </div>

                <canvas
                    ref={canvasRef}
                    width={CANVAS_WIDTH}
                    height={CANVAS_HEIGHT}
                    className="bg-transparent w-full h-full object-contain"
                />
            </div>
        </GameContainer>
    );
}
