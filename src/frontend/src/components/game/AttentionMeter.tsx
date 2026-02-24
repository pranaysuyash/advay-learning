import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Webcam from 'react-webcam';
import useAttentionDetection from '../../hooks/useAttentionDetection';

interface AttentionMeterProps {
    webcamRef: React.RefObject<Webcam | null>;
    className?: string; // Allow custom positioning, e.g., 'bottom-4 right-4'
}

export function AttentionMeter({ webcamRef, className = 'bottom-6 right-6' }: AttentionMeterProps) {
    const { startMonitoring, stopMonitoring, lastAttention, isMonitoring } = useAttentionDetection();
    const [showTooltip, setShowTooltip] = useState(false);

    useEffect(() => {
        let videoCheckTimer: ReturnType<typeof setTimeout>;

        const checkVideo = () => {
            if (webcamRef.current?.video?.readyState === 4) {
                if (!isMonitoring) {
                    startMonitoring(webcamRef.current.video);
                }
            } else {
                videoCheckTimer = setTimeout(checkVideo, 500);
            }
        };

        checkVideo();

        return () => {
            clearTimeout(videoCheckTimer);
            stopMonitoring();
        };
    }, [webcamRef, startMonitoring, stopMonitoring, isMonitoring]);

    if (!lastAttention) return null;

    const focusLevel = lastAttention.focusLevel; // 0 to 1
    const isHighFocus = focusLevel > 0.8;
    const isLowFocus = focusLevel < 0.4;

    // Calculate percentage for CSS max 100
    const widthPercentage = Math.round(Math.max(0, Math.min(100, focusLevel * 100)));

    // Determine color based on focus
    let barColor = 'bg-blue-400';
    let glowColor = '';
    let emoji = '👀';

    if (isHighFocus) {
        barColor = 'bg-yellow-400';
        glowColor = 'shadow-[0_0_15px_rgba(250,204,21,0.6)]';
        emoji = '🌟';
    } else if (isLowFocus) {
        barColor = 'bg-gray-400';
        emoji = '💤';
    }

    return (
        <div
            className={`absolute z-50 flex items-center gap-3 bg-white/90 backdrop-blur-md p-3 rounded-full border-3 border-[#F2CC8F] shadow-[0_4px_0_#E5B86E] transition-all duration-300 ${className} ${glowColor}`}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
        >
            <div className="text-2xl drop-shadow-sm select-none">{emoji}</div>
            <div className="flex flex-col gap-1 w-24">
                <div className="flex justify-between items-center px-1">
                    <span className="text-[10px] uppercase font-bold text-advay-slate tracking-widest text-opacity-80">Focus Power</span>
                </div>
                <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden shadow-inner flex relative">
                    <motion.div
                        className={`h-full rounded-full ${barColor}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${widthPercentage}%` }}
                        transition={{ type: "spring", stiffness: 100, damping: 15 }}
                    />
                    {/* Sparkle effect when high focus */}
                    {isHighFocus && (
                        <motion.div
                            className="absolute top-0 bottom-0 left-0 right-0 bg-white opacity-30"
                            animate={{ x: ['-100%', '100%'] }}
                            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                        />
                    )}
                </div>
            </div>

            <AnimatePresence>
                {showTooltip && (
                    <motion.div
                        className="absolute -top-12 right-0 bg-slate-800 text-white text-xs font-bold px-3 py-2 rounded-xl whitespace-nowrap"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                    >
                        Stay focused on the screen to charge your Focus Power!
                        <div className="absolute -bottom-1 right-8 w-2 h-2 bg-slate-800 rotate-45"></div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
