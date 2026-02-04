import React from 'react';

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
  description = "This game requires a camera to play. Please use a device with camera support or try a different game.",
  actionLabel = "Go Back",
  onAction,
  fullScreen = true,
}) => {
  const content = (
    <div className="flex flex-col items-center justify-center gap-4 p-6">
      {/* Camera icon */}
      <svg
        className="w-16 h-16 text-gray-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"
        />
        <circle cx="12" cy="13" r="3" />
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
