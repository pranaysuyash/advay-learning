import React, { useEffect } from 'react';
import { useAttentionDetection } from '../../hooks/useAttentionDetection';
import { usePostureDetection } from '../../hooks/usePostureDetection';

interface AttentionAlert {
    level: 'info' | 'warning' | 'critical';
    message: string;
    timestamp: number;
}

interface PostureAlert {
    level: 'info' | 'warning' | 'critical';
    message: string;
    timestamp: number;
}

interface WellnessMonitorProps {
    /** Reference to the video element to monitor from. */
    videoRef: React.RefObject<HTMLVideoElement>;
    /** Whether the monitor should actively process frames. Typically set to true when the game loop is active. */
    isActive: boolean;
    /** Callback fired when attention drops below healthy thresholds. */
    onAttentionAlert?: (alert: AttentionAlert) => void;
    /** Callback fired when posture alignment drops below healthy thresholds. */
    onPostureAlert?: (alert: PostureAlert) => void;
}

/**
 * A reusable logical component that wraps attention and posture detection hooks.
 * Include this inside any game screen to enforce safety and attention monitoring
 * securely from the parent video stream.
 * It renders null to the DOM.
 */
export function WellnessMonitor({
    videoRef,
    isActive,
    onAttentionAlert,
    onPostureAlert
}: WellnessMonitorProps) {
    const {
        startMonitoring: startAttentionMonitoring,
        stopMonitoring: stopAttentionMonitoring,
    } = useAttentionDetection(onAttentionAlert);

    const {
        startMonitoring: startPostureMonitoring,
        stopMonitoring: stopPostureMonitoring,
    } = usePostureDetection(onPostureAlert);

    useEffect(() => {
        if (!isActive) {
            stopAttentionMonitoring();
            stopPostureMonitoring();
            return () => {
                stopAttentionMonitoring();
                stopPostureMonitoring();
            };
        }

        let rafId = 0;
        let monitoringStarted = false;

        const tryStartMonitoring = () => {
            const video = videoRef.current;
            if (video && !monitoringStarted) {
                startAttentionMonitoring(video);
                startPostureMonitoring(video);
                monitoringStarted = true;
                return;
            }
            if (!monitoringStarted) {
                rafId = requestAnimationFrame(tryStartMonitoring);
            }
        };

        tryStartMonitoring();

        return () => {
            if (rafId) {
                cancelAnimationFrame(rafId);
            }
            stopAttentionMonitoring();
            stopPostureMonitoring();
        };
    }, [isActive, videoRef, startAttentionMonitoring, stopAttentionMonitoring, startPostureMonitoring, stopPostureMonitoring]);

    return null;
}
