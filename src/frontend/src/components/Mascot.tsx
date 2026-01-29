import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface MascotProps {
    state?: 'idle' | 'happy' | 'thinking' | 'waiting' | 'celebrating';
    message?: string;
    className?: string;
    enableVideo?: boolean;
}

const MASCOT_IMAGE_SRC = '/assets/images/pip_mascot.png';
const MASCOT_VIDEO_SRC = '/assets/videos/pip_alpha_v2.webm';

// Random celebration triggers (in milliseconds)
const MIN_CELEBRATION_INTERVAL = 15000; // 15 seconds
const MAX_CELEBRATION_INTERVAL = 45000; // 45 seconds

export function Mascot({ 
    state = 'idle', 
    message, 
    className = '',
    enableVideo = true 
}: MascotProps) {
    const [bounce, setBounce] = useState(false);
    const [showVideo, setShowVideo] = useState(false);
    const [isVideoLoaded, setIsVideoLoaded] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const celebrationTimerRef = useRef<NodeJS.Timeout | null>(null);

    // Schedule next random celebration - defined first to avoid circular dependency
    const scheduleNextCelebration = useCallback(() => {
        if (celebrationTimerRef.current) {
            clearTimeout(celebrationTimerRef.current);
        }
        
        const delay = Math.random() * (MAX_CELEBRATION_INTERVAL - MIN_CELEBRATION_INTERVAL) 
                      + MIN_CELEBRATION_INTERVAL;
        
        celebrationTimerRef.current = setTimeout(() => {
            if (enableVideo && isVideoLoaded && state !== 'celebrating') {
                setShowVideo(true);
                videoRef.current?.play().catch(() => {
                    // Fallback to image if video play fails
                    setShowVideo(false);
                });
            }
        }, delay);
    }, [enableVideo, isVideoLoaded, state]);

    // Handle video ended
    const handleVideoEnded = useCallback(() => {
        setShowVideo(false);
        scheduleNextCelebration();
    }, [scheduleNextCelebration]);

    // Trigger celebration on state change to 'happy' or 'celebrating'
    useEffect(() => {
        if ((state === 'happy' || state === 'celebrating') && enableVideo && isVideoLoaded) {
            console.log('[Mascot] Triggering video for state:', state);
            setShowVideo(true);
            // Small delay to ensure DOM is ready
            setTimeout(() => {
                videoRef.current?.play().catch((err) => {
                    console.error('[Mascot] Video play failed:', err);
                    setShowVideo(false);
                });
            }, 100);
        }
    }, [state, enableVideo, isVideoLoaded]);

    // Start random celebration timer
    useEffect(() => {
        if (enableVideo && isVideoLoaded && !showVideo) {
            scheduleNextCelebration();
        }
        
        return () => {
            if (celebrationTimerRef.current) {
                clearTimeout(celebrationTimerRef.current);
            }
        };
    }, [enableVideo, isVideoLoaded, showVideo, scheduleNextCelebration]);

    // Preload video on mount
    useEffect(() => {
        if (enableVideo) {
            // Create a hidden video element to preload
            const preloadVideo = document.createElement('video');
            preloadVideo.src = MASCOT_VIDEO_SRC;
            preloadVideo.preload = 'auto';
            preloadVideo.load();
            console.log('[Mascot] Preloading video...');
        }
    }, [enableVideo]);

    // Bounce animation trigger
    useEffect(() => {
        if (state === 'happy' || state === 'celebrating') {
            setBounce(true);
            const timer = setTimeout(() => setBounce(false), 600);
            return () => clearTimeout(timer);
        }
    }, [state]);

    const containerVariants = {
        idle: { scale: 1, y: 0 },
        happy: { 
            scale: [1, 1.15, 1],
            y: [0, -20, 0],
            transition: { duration: 0.6, ease: "easeOut" as const }
        },
        thinking: { 
            rotate: [0, -5, 5, -5, 5, 0],
            transition: { duration: 0.8, ease: "easeInOut" as const }
        },
        waiting: { 
            y: [0, -5, 0],
            transition: { 
                duration: 1.5, 
                repeat: Infinity, 
                ease: "easeInOut" as const
            }
        },
        celebrating: {
            scale: [1, 1.2, 1],
            y: [0, -30, 0],
            rotate: [0, -10, 10, -10, 10, 0],
            transition: { duration: 0.8, ease: "easeOut" as const }
        }
    };

    return (
        <div className={`relative flex flex-col items-center ${className}`}>
            {/* Speech Bubble */}
            <AnimatePresence mode="wait">
                {message && (
                    <motion.div
                        key={message}
                        initial={{ opacity: 0, y: 10, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.8 }}
                        transition={{ duration: 0.3, ease: "backOut" }}
                        className="absolute -top-16 left-1/2 -translate-x-1/2 z-20"
                    >
                        <div className="relative bg-white rounded-2xl px-4 py-3 shadow-lg border-2 border-orange-200 whitespace-nowrap">
                            <p className="text-sm font-bold text-gray-800">{message}</p>
                            {/* Speech bubble tail */}
                            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-b-2 border-r-2 border-orange-200 rotate-45"></div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Mascot Container */}
            <motion.div
                variants={containerVariants}
                animate={state}
                className="relative cursor-pointer w-32 h-32"
                onClick={() => {
                    if (enableVideo && isVideoLoaded) {
                        setShowVideo(true);
                        videoRef.current?.play().catch(() => setShowVideo(false));
                    }
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
            >
                {/* Glow effect for celebrating state */}
                {(state === 'celebrating' || state === 'happy') && (
                    <motion.div
                        className="absolute inset-0 rounded-full bg-yellow-400 blur-xl opacity-50"
                        animate={{ 
                            scale: [1, 1.3, 1],
                            opacity: [0.3, 0.6, 0.3]
                        }}
                        transition={{ duration: 1, repeat: Infinity }}
                    />
                )}

                {/* Video (shown during celebrations) */}
                {showVideo && enableVideo && (
                    <video
                        ref={videoRef}
                        src={MASCOT_VIDEO_SRC}
                        autoPlay
                        onEnded={handleVideoEnded}
                        onLoadedData={() => {
                            console.log('[Mascot] Video loaded successfully');
                            setIsVideoLoaded(true);
                        }}
                        onError={(e) => {
                            console.error('[Mascot] Video failed to load:', e);
                            setIsVideoLoaded(false);
                        }}
                        className="absolute inset-0 w-full h-full object-contain"
                        playsInline
                        muted
                    />
                )}

                {/* Static Image (shown when video is not playing) */}
                {!showVideo && (
                    <motion.img
                        src={MASCOT_IMAGE_SRC}
                        alt="Pip the Red Panda"
                        className="w-full h-full object-contain drop-shadow-lg"
                        animate={bounce ? {
                            y: [0, -15, 0, -8, 0],
                            transition: { duration: 0.6 }
                        } : {}}
                    />
                )}

                {/* Thinking indicator */}
                {state === 'thinking' && (
                    <motion.div
                        className="absolute -top-2 -right-2 z-20"
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0 }}
                    >
                        <motion.div
                            className="bg-blue-400 text-white rounded-full w-8 h-8 flex items-center justify-center text-lg font-bold shadow-md"
                            animate={{ rotate: [0, 10, -10, 0] }}
                            transition={{ duration: 0.5, repeat: Infinity }}
                        >
                            ?
                        </motion.div>
                    </motion.div>
                )}

                {/* Waiting indicator */}
                {state === 'waiting' && (
                    <motion.div
                        className="absolute -bottom-1 left-1/2 -translate-x-1/2 z-20 flex gap-1"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        {[0, 1, 2].map((i) => (
                            <motion.div
                                key={i}
                                className="w-2 h-2 bg-orange-400 rounded-full"
                                animate={{ 
                                    y: [0, -6, 0],
                                    opacity: [0.4, 1, 0.4]
                                }}
                                transition={{ 
                                    duration: 0.6, 
                                    repeat: Infinity, 
                                    delay: i * 0.15 
                                }}
                            />
                        ))}
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
}
