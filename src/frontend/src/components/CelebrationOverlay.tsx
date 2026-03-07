import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CelebrationOverlayProps {
    show: boolean;
    letter: React.ReactNode;
    accuracy: number;
    onComplete: () => void;
    /** Optional: custom message from Pip */
    message?: string;
}

// Confetti particle component
function ConfettiParticle({ delay, color }: { delay: number; color: string }) {
    const randomRotation = Math.random() * 360;
    const size = 8 + Math.random() * 8;

    return (
        <motion.div
            className="absolute rounded-sm"
            style={{
                left: `50%`,
                top: `50%`,
                width: size,
                height: size * 0.6,
                backgroundColor: color,
            }}
            initial={{ y: 0, x: 0, opacity: 1, scale: 0 }}
            animate={{
                y: [(Math.random() - 0.5) * 800 - 200, (Math.random() - 0.2) * 1200],
                x: [(Math.random() - 0.5) * 800, (Math.random() - 0.5) * 1200],
                opacity: [0, 1, 1, 0],
                rotate: [0, randomRotation, randomRotation + 720],
                scale: [0, 1.5, 1],
            }}
            transition={{
                duration: 2.5 + Math.random() * 1.5,
                delay: delay,
                ease: [0.23, 1, 0.32, 1], // easeOutQuint for explosive start
            }}
        />
    );
}

// Dancing Pip mascot
import { Mascot } from './Mascot';

// Star burst component
function StarBurst({ letter }: { letter: React.ReactNode }) {
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
                <motion.span
                    className="text-8xl font-bold bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 bg-clip-text text-transparent"
                    style={{ textShadow: '0 8px 0 rgba(147,51,234,0.3)' }}
                    animate={{ y: [0, -15, 0] }}
                    transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
                >
                    {letter}
                </motion.span>
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
                    className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-[#FFF8F0] via-[#FFF8F0]/95 to-[#3B82F6]/10 backdrop-blur-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={handleDismiss}
                >
                    {/* Confetti particles */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        {[...Array(100)].map((_, i) => (
                            <ConfettiParticle
                                key={i}
                                delay={i * 0.02}
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

                        {/* Message with massive 3D bouncy typography */}
                        <motion.div
                            className="text-center"
                            initial={{ opacity: 0, y: 50, scale: 0.5 }}
                            animate={{ opacity: 1, y: [0, -20, 0], scale: 1 }}
                            transition={{
                                opacity: { duration: 0.5 },
                                scale: { type: 'spring', stiffness: 200, damping: 15 },
                                y: { delay: 0.8, duration: 1.5, repeat: Infinity, ease: 'easeInOut' }
                            }}
                        >
                            <h2
                                className="text-5xl md:text-7xl font-black text-[#F2CC8F] tracking-tight mb-4"
                                style={{
                                    WebkitTextStroke: '2px #78350F',
                                    textShadow: '0 8px 0 #D97706, 0 16px 20px rgba(0,0,0,0.2)'
                                }}
                            >
                                {message || `Great job! 🎉`}
                            </h2>
                            <p className="text-blue-600 font-bold text-2xl md:text-3xl bg-white/80 px-6 py-2 rounded-full shadow-[0_4px_0_rgba(59,130,246,0.3)] inline-block">
                                You traced {letter} beautifully!
                            </p>
                        </motion.div>

                        {/* Accuracy stars */}
                        <AccuracyBadge accuracy={accuracy} />

                        {/* Mascot Integration with Glowing Backdrop */}
                        <motion.div
                            className="relative mt-8"
                            initial={{ opacity: 0, scale: 0, y: 100 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            transition={{ delay: 0.4, type: 'spring', stiffness: 150, damping: 12 }}
                        >
                            <motion.div
                                className="absolute inset-0 bg-yellow-400 rounded-full blur-2xl -z-10 mix-blend-screen"
                                animate={{
                                    scale: [1, 1.4, 1],
                                    opacity: [0.4, 0.8, 0.4],
                                }}
                                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                            />
                            <Mascot state="celebrating" responsiveSize="lg" hideOnMobile={false} decorative={true} />
                        </motion.div>

                        {/* Tap to continue hint */}
                        <motion.p
                            className="text-slate-400 text-sm"
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
