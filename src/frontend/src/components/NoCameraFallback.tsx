import React from 'react';
import { Link } from 'react-router-dom';

interface NoCameraFallbackProps {
  /**
   * Title for the message
   */
  title?: string;
  /**
   * Subtitle/description
   */
  description?: string;
  /**
   * Optional action button label
   */
  actionLabel?: string;
  /**
   * Optional action button callback
   */
  onAction?: () => void;
  /**
   * Whether to show as a full-screen overlay or inline message
   */
  fullScreen?: boolean;
}

/**
 * Fallback UI component when camera is not available
 * Shows friendly message to users on devices without camera support
 */
export const NoCameraFallback: React.FC<NoCameraFallbackProps> = ({
  title = "Camera Not Available",
  description = "No camera? No problem! You can play these fun games with just your finger or mouse.",
  actionLabel = "Go Back",
  onAction,
  fullScreen = true,
}) => {
  const content = (
    <div className="flex flex-col items-center justify-center gap-4 p-6">
      {/* Camera off icon */}
      <svg
        className="w-16 h-16 text-gray-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M3 3l18 18"
        />
      </svg>

      {/* Message */}
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          {title}
        </h2>
        <p className="text-gray-600 text-sm">
          {description}
        </p>
      </div>

      {/* Camera-free games */}
      <div className="w-full max-w-xs">
        <p className="text-sm font-medium text-gray-700 mb-3 text-center">
          Try these games instead! 🎮
        </p>
        <div className="flex flex-col gap-2">
          <Link
            to="/games/connect-the-dots"
            className="flex items-center gap-3 px-4 py-3 bg-white border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors text-left"
          >
            <span className="text-xl">🎨</span>
            <div>
              <span className="text-sm font-medium text-gray-900">Connect Dots</span>
              <span className="text-xs text-gray-500 block">Draw with touch!</span>
            </div>
          </Link>
          <Link
            to="/games/letter-hunt"
            className="flex items-center gap-3 px-4 py-3 bg-white border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors text-left"
          >
            <span className="text-xl">⭐</span>
            <div>
              <span className="text-sm font-medium text-gray-900">Find Letters</span>
              <span className="text-xs text-gray-500 block">Tap to find!</span>
            </div>
          </Link>
          <Link
            to="/games/alphabet-tracing"
            className="flex items-center gap-3 px-4 py-3 bg-white border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors text-left"
          >
            <span className="text-xl">✏️</span>
            <div>
              <span className="text-sm font-medium text-gray-900">Draw Letters</span>
              <span className="text-xs text-gray-500 block">Trace with your finger!</span>
            </div>
          </Link>
        </div>
      </div>

      {/* Action button */}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        {content}
      </div>
    );
  }

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg">
      {content}
    </div>
  );
};

/**
 * Wrapper component that checks for camera and shows fallback if needed
 */
interface CameraRequiredProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onNoCameraDetected?: () => void;
}

export const CameraRequired: React.FC<CameraRequiredProps> = ({
  children,
  fallback,
  onNoCameraDetected,
}) => {
  const [hasCameraSupport, setHasCameraSupport] = React.useState(true);

  React.useEffect(() => {
    // Check synchronously first
    const hasSupport = typeof navigator !== 'undefined' && 
                       navigator.mediaDevices && 
                       navigator.mediaDevices.getUserMedia;
    
    if (!hasSupport) {
      setHasCameraSupport(false);
      onNoCameraDetected?.();
    }
  }, [onNoCameraDetected]);

  if (!hasCameraSupport) {
    return <>{fallback ?? <NoCameraFallback />}</>;
  }

  return <>{children}</>;
};
