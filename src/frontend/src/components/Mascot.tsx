import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

// Use the asset we generated/processed
const MASCOT_IMAGE_SRC = '/assets/images/pip_mascot.png';

interface MascotProps {
    state: 'idle' | 'happy' | 'thinking' | 'waiting';
    message?: string;
    className?: string;
}

export function Mascot({ state, message, className = '' }: MascotProps) {
    const [bounce, setBounce] = useState(false);

    // Trigger bounce animation on "happy" state change
    useEffect(() => {
        if (state === 'happy') {
            setBounce(true);
            const timer = setTimeout(() => setBounce(false), 1000);
            return () => clearTimeout(timer);
        }
    }, [state]);

    const variants = {
        idle: { y: 0, rotate: 0 },
        happy: {
            y: [0, -20, 0, -10, 0],
            rotate: [0, -5, 5, -5, 0],
            transition: { duration: 0.8 }
        },
        waiting: {
            scale: [1, 1.05, 1],
            transition: { repeat: Infinity, duration: 2 }
        }
    };

    return (
        <div className={`relative flex items-end ${className}`}>
            {/* Speech Bubble */}
            {message && (
                <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className="absolute bottom-full mb-4 left-1/2 -translate-x-1/2 w-48 bg-white text-gray-800 p-3 rounded-2xl rounded-bl-none shadow-lg text-center font-bold border-2 border-orange-400 z-10"
                >
                    {message}
                </motion.div>
            )}

            {/* Mascot Image */}
            <motion.img
                src={MASCOT_IMAGE_SRC}
                alt="Pip the Red Panda"
                className="w-32 h-32 object-contain drop-shadow-xl"
                variants={variants}
                animate={bounce ? 'happy' : state}
            />
        </div>
    );
}
