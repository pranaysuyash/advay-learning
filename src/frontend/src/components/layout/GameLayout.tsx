import React, { forwardRef, type RefObject, type ReactNode } from 'react';
import Webcam from 'react-webcam';

interface GameLayoutProps {
    /** Ref to the webcam element for hand tracking */
    webcamRef: RefObject<Webcam | null>;
    /** Ref to the canvas element for drawing */
    canvasRef: RefObject<HTMLCanvasElement | null>;
    /** Called when camera permission changes */
    onCameraPermission?: (state: 'granted' | 'denied') => void;
    /** Callback for camera error */
    onCameraError?: (error: Error | string | DOMException) => void;
    /** Whether the webcam should be mirrored */
    mirrored?: boolean;
    /** Enable high contrast mode (dimmer video feed) */
    highContrast?: boolean;
    /** Canvas pointer event handlers */
    canvasEvents?: {
        onPointerDown?: React.PointerEventHandler<HTMLCanvasElement>;
        onPointerMove?: React.PointerEventHandler<HTMLCanvasElement>;
        onPointerUp?: React.PointerEventHandler<HTMLCanvasElement>;
        onPointerCancel?: React.PointerEventHandler<HTMLCanvasElement>;
        onPointerLeave?: React.PointerEventHandler<HTMLCanvasElement>;
    };
    /** Content to render on top of the camera (e.g., game UI, hints) */
    children?: ReactNode;
    /** Additional class name for the container */
    className?: string;
}

/**
 * GameLayout - Universal layout component for webcam-based games.
 * 
 * Features:
 * - Standardized Webcam + Canvas layering
 * - "Spotlight" vignette effect to focus attention on center
 * - "Hero" content layer for game elements (z-index above vignette)
 * - Responsive aspect-ratio container
 */
export const GameLayout = forwardRef<HTMLDivElement, GameLayoutProps>(
    (
        {
            webcamRef,
            canvasRef,
            onCameraPermission,
            onCameraError,
            mirrored = true,
            highContrast = false,
            canvasEvents = {},
            children,
            className = '',
        },
        ref
    ) => {
        return (
            <div
                ref={ref}
                className={`relative bg-black rounded-2xl overflow-hidden aspect-video shadow-soft-lg border border-border ${className}`}
            >
                {/* Decorative blurred elements for "magic" feel */}
                <div className="absolute inset-0 opacity-10 pointer-events-none z-0">
                    <div className="absolute top-10 left-10 w-16 h-16 rounded-full bg-pip-orange blur-xl" />
                    <div className="absolute bottom-20 right-16 w-24 h-24 rounded-full bg-vision-blue blur-xl" />
                </div>

                {/* Webcam Layer (base) */}
                <Webcam
                    ref={webcamRef}
                    className={`absolute inset-0 w-full h-full object-cover z-10 ${highContrast ? 'opacity-60' : ''}`}
                    mirrored={mirrored}
                    videoConstraints={{ width: 640, height: 480 }}
                    onUserMedia={() => onCameraPermission?.('granted')}
                    onUserMediaError={(err) => {
                        onCameraPermission?.('denied');
                        onCameraError?.(err);
                    }}
                />

                {/* Spotlight Vignette - Darkens edges, keeps center bright */}
                <div
                    className="absolute inset-0 pointer-events-none z-20"
                    style={{
                        background:
                            'radial-gradient(circle at center, transparent 25%, rgba(0,0,0,0.5) 70%, rgba(0,0,0,0.75) 100%)',
                    }}
                />

                {/* Gradient Scrim at bottom for text readability */}
                <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/70 to-transparent pointer-events-none z-20" />

                {/* Canvas Layer - For drawing (above vignette for visibility) */}
                <canvas
                    ref={canvasRef}
                    className="absolute inset-0 w-full h-full touch-none transform -scale-x-100 rounded-3xl cursor-crosshair z-30"
                    onPointerDown={canvasEvents.onPointerDown}
                    onPointerMove={canvasEvents.onPointerMove}
                    onPointerUp={canvasEvents.onPointerUp}
                    onPointerCancel={canvasEvents.onPointerCancel}
                    onPointerLeave={canvasEvents.onPointerLeave}
                />

                {/* Hero Content Layer - Game elements (highest z-index) */}
                <div className="absolute inset-0 z-40 pointer-events-none">
                    {children}
                </div>
            </div>
        );
    }
);

GameLayout.displayName = 'GameLayout';

export default GameLayout;
