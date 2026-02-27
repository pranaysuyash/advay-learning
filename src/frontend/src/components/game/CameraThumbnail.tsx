/**
 * CameraThumbnail — Small camera preview for hand-tracking games.
 *
 * Shows a thumbnail-sized (160×120) webcam view in a corner so players
 * can see themselves and verify their hand is in frame. The border
 * changes color based on hand detection state (green = detected,
 * amber = not detected).
 */

import Webcam from 'react-webcam';

interface CameraThumbnailProps {
    /** Whether the player's hand is currently detected */
    isHandDetected: boolean;
    /** Position on screen (default: bottom-left) */
    position?: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right';
    /** Whether to mirror the feed (default: true for selfie cam) */
    mirrored?: boolean;
    /** Whether to show the thumbnail (default: true) */
    visible?: boolean;
    /** Webcam ref mandatory for hand tracking to access video feed */
    webcamRef?: any;
}

const POSITION_CLASSES: Record<string, string> = {
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
};

export function CameraThumbnail({
    isHandDetected,
    position = 'bottom-left',
    mirrored = true,
    visible = true,
    webcamRef
}: CameraThumbnailProps) {
    if (!visible) {
        // Must still render the webcam invisibly so MediaPipe can access the video feed
        return (
            <div className="absolute opacity-0 pointer-events-none w-[1px] h-[1px] overflow-hidden">
                <Webcam
                    ref={webcamRef}
                    audio={false}
                    mirrored={mirrored}
                    videoConstraints={{ facingMode: 'user', width: 320, height: 240 }}
                />
            </div>
        );
    }

    return (
        <div
            className={`absolute ${POSITION_CLASSES[position]} z-[60] rounded-xl overflow-hidden border-3 shadow-lg`}
            style={{
                width: '160px',
                height: '120px',
                borderColor: isHandDetected ? '#22c55e' : '#f59e0b',
                transition: 'border-color 0.3s ease',
            }}
        >
            <Webcam
                ref={webcamRef}
                audio={false}
                mirrored={mirrored}
                className='w-full h-full object-cover'
                videoConstraints={{ facingMode: 'user', width: 320, height: 240 }}
            />
            {/* Status indicator */}
            <div className='absolute top-1.5 right-1.5 flex items-center gap-1 bg-black/60 rounded-full px-2 py-0.5'>
                <div
                    className={`w-2 h-2 rounded-full ${isHandDetected ? 'bg-green-400' : 'bg-amber-400 animate-pulse'
                        }`}
                />
                <span className='text-[10px] font-bold text-white'>
                    {isHandDetected ? '✋' : '?'}
                </span>
            </div>
        </div>
    );
}
