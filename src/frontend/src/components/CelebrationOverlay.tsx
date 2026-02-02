import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CelebrationOverlayProps {
    show: boolean;
    letter: string;
    accuracy: number;
    onComplete: () => void;
    /** Optional: custom message from Pip */
    message?: string;
}

// Confetti particle component
function ConfettiParticle({ delay, color }: { delay: number; color: string }) {
    const randomX = Math.random() * 100;
    const randomRotation = Math.random() * 360;
    const size = 8 + Math.random() * 8;

    return (
        <motion.div
            className="absolute rounded-sm"
            style={{
                left: `${randomX}%`,
                top: '-20px',
                width: size,
                height: size * 0.6,
                backgroundColor: color,
            }}
            initial={{ y: 0, opacity: 1, rotate: 0 }}
            animate={{
                y: [0, 400, 500],
                opacity: [1, 1, 0],
                rotate: [0, randomRotation, randomRotation + 180],
                x: [0, (Math.random() - 0.5) * 100, (Math.random() - 0.5) * 150],
            }}
            transition={{
                duration: 2.5,
                delay: delay,
                ease: 'easeOut',
            }}
        />
    );
}

// Star burst component
function StarBurst({ letter }: { letter: string }) {
    return (
        <motion.div
            className="relative"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        >
            {/* Glowing background */}
            <motion.div
                className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 rounded-full blur-xl"
                style={{ width: 180, height: 180, marginLeft: -90, marginTop: -90 }}
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 0.8, 0.5],
                }}
                transition={{
                    duration: 1,
                    repeat: Infinity,
                    ease: 'easeInOut',
                }}
            />

            {/* Letter display */}
            <motion.div
                className="relative z-10 w-32 h-32 flex items-center justify-center bg-white rounded-full shadow-2xl"
                animate={{
                    boxShadow: [
                        '0 0 20px rgba(251, 191, 36, 0.5)',
                        '0 0 40px rgba(251, 191, 36, 0.8)',
                        '0 0 20px rgba(251, 191, 36, 0.5)',
                    ],
                }}
                transition={{
                    duration: 1,
                    repeat: Infinity,
                    ease: 'easeInOut',
                }}
            >
                <span className="text-6xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    {letter}
                </span>
            </motion.div>

            {/* Rotating stars */}
            {[0, 60, 120, 180, 240, 300].map((angle, i) => (
                <motion.div
                    key={i}
                    className="absolute text-2xl"
                    style={{
                        left: '50%',
                        top: '50%',
                        transformOrigin: 'center',
                    }}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{
                        opacity: 1,
                        scale: 1,
                        x: Math.cos((angle * Math.PI) / 180) * 80 - 12,
                        y: Math.sin((angle * Math.PI) / 180) * 80 - 12,
                    }}
                    transition={{ delay: 0.2 + i * 0.05, type: 'spring' }}
                >
                    ⭐
                </motion.div>
            ))}
        </motion.div>
    );
}

// Dancing Pip mascot
function DancingPip() {
    return (
        <motion.div
            className="relative"
            animate={{
                y: [0, -10, 0, -5, 0],
                rotate: [-5, 5, -5, 5, 0],
            }}
            transition={{
                duration: 0.8,
                repeat: 3,
                ease: 'easeInOut',
            }}
        >
            <div className="text-6xl">🦊</div>
            {/* Celebration sparkles around Pip */}
            {[...Array(5)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute text-xl"
                    style={{
                        left: `${50 + (Math.random() - 0.5) * 60}%`,
                        top: `${50 + (Math.random() - 0.5) * 60}%`,
                    }}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{
                        opacity: [0, 1, 0],
                        scale: [0, 1, 0],
                    }}
                    transition={{
                        duration: 0.6,
                        delay: i * 0.15,
                        repeat: 2,
                    }}
                >
                    ✨
                </motion.div>
            ))}
        </motion.div>
    );
}

// Accuracy badge
function AccuracyBadge({ accuracy }: { accuracy: number }) {
    const stars = accuracy >= 90 ? 3 : accuracy >= 75 ? 2 : 1;
    const color = accuracy >= 90 ? 'text-yellow-500' : accuracy >= 75 ? 'text-gray-400' : 'text-orange-400';

    return (
        <motion.div
            className="flex items-center gap-1"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
        >
            {[...Array(3)].map((_, i) => (
                <motion.span
                    key={i}
                    className={`text-3xl ${i < stars ? color : 'text-gray-300'}`}
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.6 + i * 0.1, type: 'spring' }}
                >
                    ★
                </motion.span>
            ))}
        </motion.div>
    );
}

export function CelebrationOverlay({
    show,
    letter,
    accuracy,
    onComplete,
    message,
}: CelebrationOverlayProps) {
    const [confettiColors] = useState([
        '#ff6b6b', '#4ecdc4', '#ffe66d', '#a855f7', '#22c55e', '#3b82f6',
    ]);

    // Auto-dismiss after animation completes
    useEffect(() => {
        if (show) {
            const timer = setTimeout(() => {
                onComplete();
            }, 2500);
            return () => clearTimeout(timer);
        }
    }, [show, onComplete]);

    // Handle tap to dismiss early
    const handleDismiss = useCallback(() => {
        onComplete();
    }, [onComplete]);

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={handleDismiss}
                >
                    {/* Confetti particles */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        {[...Array(30)].map((_, i) => (
                            <ConfettiParticle
                                key={i}
                                delay={i * 0.05}
                                color={confettiColors[i % confettiColors.length]}
                            />
                        ))}
                    </div>

                    {/* Center content */}
                    <motion.div
                        className="flex flex-col items-center gap-6"
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                    >
                        {/* Star burst with letter */}
                        <StarBurst letter={letter} />

                        {/* Message */}
                        <motion.div
                            className="text-center"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <h2 className="text-3xl font-bold text-white mb-2">
                                {message || `Great job! 🎉`}
                            </h2>
                            <p className="text-white/80 text-lg">
                                You traced {letter} beautifully!
                            </p>
                        </motion.div>

                        {/* Accuracy stars */}
                        <AccuracyBadge accuracy={accuracy} />

                        {/* Dancing Pip */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.4, type: 'spring' }}
                        >
                            <DancingPip />
                        </motion.div>

                        {/* Tap to continue hint */}
                        <motion.p
                            className="text-white/60 text-sm"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1.5 }}
                        >
                            Tap anywhere to continue
                        </motion.p>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

export default CelebrationOverlay;
