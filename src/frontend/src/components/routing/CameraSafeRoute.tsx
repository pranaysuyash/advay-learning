import { useState, type ReactNode } from 'react';
import { CameraErrorBoundary } from '../errors/CameraErrorBoundary';
import { CameraCrashFallback } from '../errors/CameraCrashFallback';

export interface CameraSafeRouteProps {
    gameName: string;
    children: ReactNode;
    /** Override the default fallback action label */
    fallbackActionLabel?: string;
    /** Override the default fallback message */
    cameraRequiredMessage?: string;
}

export function CameraSafeRoute({ gameName, children, cameraRequiredMessage, fallbackActionLabel }: CameraSafeRouteProps) {
    const [renderKey, setRenderKey] = useState(0);
    const [fallbackMode, setFallbackMode] = useState(false);

    if (fallbackMode) {
        return (
            <CameraCrashFallback
                gameName={gameName}
                errorKind='runtime'
                message={cameraRequiredMessage ?? 'This game can continue with touch or mouse controls while camera tracking is unavailable.'}
                fallbackActionLabel={fallbackActionLabel}
                onRetry={() => {
                    setFallbackMode(false);
                    setRenderKey((prev) => prev + 1);
                }}
                showHomeAction
            />
        );
    }

    return (
        <CameraErrorBoundary
            gameName={gameName}
            onRetry={() => setRenderKey((prev) => prev + 1)}
            onFallbackMode={() => setFallbackMode(true)}
            onErrorClassified={(kind, error) => {
                console.error(`[CameraBoundary:${gameName}] ${kind}`, error);
            }}
            showHomeAction
        >
            <div key={renderKey}>{children}</div>
        </CameraErrorBoundary>
    );
}
