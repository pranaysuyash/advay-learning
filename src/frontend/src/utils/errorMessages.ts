/**
 * errorMessages.ts
 * Human-centered error messages for the learning app.
 *
 * Maps technical errors to friendly, actionable messages that children and parents can understand.
 * Includes recovery suggestions and next steps.
 */

export interface ErrorMessageInfo {
  title: string; // Main message for the user
  description: string; // Explanation of what happened
  action: string; // What the user should do next
  emoji?: string; // Optional emoji for visual clarity
}

// Camera-related errors
export const CAMERA_ERRORS = {
  NOT_ALLOWED: {
    title: 'Camera Permission Needed 📷',
    description:
      "We need permission to use your camera so you can use hand gestures in the game. You can change this in your device settings.",
    action: 'Grant camera permission in Settings > Apps > [App Name] > Permissions',
    emoji: '📷',
  },
  NOT_FOUND: {
    title: 'No Camera Detected 🔍',
    description:
      "Your device doesn't seem to have a camera, or it's not connected properly.",
    action: 'Use touch mode - you can still play with your finger or mouse! Just tap the game to start.',
    emoji: '🖱️',
  },
  NOT_READABLE: {
    title: 'Camera is Busy 🚫',
    description: 'Your camera is being used by another app right now.',
    action: 'Close other camera apps and try again, or play with touch!',
    emoji: '🔄',
  },
  SECURITY_ERROR: {
    title: 'Security: Camera Access Blocked 🔒',
    description:
      'Your device blocked camera access because of security settings. This happens on some devices or networks.',
    action: 'Try playing with touch mode instead, or check your security settings.',
    emoji: '🛡️',
  },
  GENERIC_ERROR: {
    title: 'Camera Problem 🤔',
    description:
      'Something went wrong with the camera. This sometimes happens if too much is happening at once.',
    action: 'Try refreshing the page and starting again. You can always play with touch!',
    emoji: '🔄',
  },
} as const;

// MediaPipe/Hand tracking errors
export const HAND_TRACKING_ERRORS = {
  MODEL_LOAD_FAILED: {
    title: "Hand Detection Model Didn't Load 📚",
    description:
      'The smart system that recognizes your hand movements failed to load. This might be a network issue.',
    action: 'Check your internet connection and refresh the page to try again.',
    emoji: '📶',
  },
  INITIALIZATION_FAILED: {
    title: 'Hand Tracking Setup Failed ⚙️',
    description:
      'We had trouble setting up hand tracking. Your device or browser might not support it.',
    action: 'Try using a different browser, or play with touch mode instead.',
    emoji: '🌐',
  },
  RUNTIME_ERROR: {
    title: 'Hand Tracking Stopped Working 😅',
    description:
      'The hand tracking system hit a snag while you were playing. This sometimes happens if things get too busy.',
    action: 'Try pausing and resuming the game, or refresh to start over.',
    emoji: '⏸️',
  },
} as const;

// Game-related errors
export const GAME_ERRORS = {
  LEVEL_LOAD_FAILED: {
    title: 'Level Took Too Long to Load ⏱️',
    description: 'The level is taking longer than expected to load.',
    action: 'Check your internet and try again. If it keeps happening, try a different level.',
    emoji: '⚡',
  },
  SAVE_FAILED: {
    title: 'Progress Save Didn\'t Work 💾',
    description:
      'Your progress might not have been saved because of a connection issue.',
    action: 'Check your internet connection and try again. Your progress should resume from the last checkpoint.',
    emoji: '📡',
  },
  AUDIO_FAILED: {
    title: 'Sound Not Working 🔇',
    description:
      "We couldn't play the sound or voice. It might be a device volume setting or browser issue.",
    action: 'Check your device volume, or try with sound off. The game still works without audio!',
    emoji: '📴',
  },
  ASSET_LOAD_FAILED: {
    title: 'Image or Video Took Too Long ⏳',
    description: 'An image or video in the game is taking a long time to load.',
    action: 'Check your internet connection. If it keeps happening, try refreshing the page.',
    emoji: '🖼️',
  },
} as const;

// Network errors
export const NETWORK_ERRORS = {
  NO_CONNECTION: {
    title: 'No Internet Connection 📡',
    description: 'Check if your device is connected to WiFi or mobile internet.',
    action: 'Connect to WiFi or check your internet and try again.',
    emoji: '📱',
  },
  SLOW_CONNECTION: {
    title: 'Slow Internet Connection 🐢',
    description:
      'Your internet is slower than usual. The game might be slow or games might take longer to load.',
    action: 'Try moving closer to your WiFi router, or wait for a faster connection.',
    emoji: '⚡',
  },
  SERVER_ERROR: {
    title: 'Server Having Trouble 🔧',
    description: 'Something is wrong with our servers. This is temporary and we\'re working on it!',
    action: 'Try again in a few minutes. Your progress is safe!',
    emoji: '🛠️',
  },
} as const;

// Browser compatibility errors
export const BROWSER_ERRORS = {
  UNSUPPORTED_BROWSER: {
    title: 'Browser Not Supported 🌐',
    description:
      'This browser is too old or doesn\'t support the features we need. Try using a newer browser.',
    action: 'Use Chrome, Safari, Edge, or Firefox (latest versions).',
    emoji: '🌐',
  },
  WEBGL_NOT_SUPPORTED: {
    title: 'Graphics Features Not Supported 🎨',
    description:
      'Your browser can\'t support the graphics we use. This is rare on modern devices.',
    action: 'Try a different browser or update your current one.',
    emoji: '🎮',
  },
  STORAGE_FULL: {
    title: 'Storage Space Running Low 💾',
    description: 'Your device is running low on storage space.',
    action: 'Close other apps or delete old files to free up space, then try again.',
    emoji: '🗑️',
  },
} as const;

// Utility function to get human-friendly error message
export function getErrorMessage(
  errorCode: string,
  fallbackError?: Error | null,
): ErrorMessageInfo {
  const errorStr = (fallbackError?.message || errorCode || '').toLowerCase();

  // Direct DOMException error name matching
  if (errorCode === 'NotAllowedError' || errorStr.includes('notallowed')) {
    return CAMERA_ERRORS.NOT_ALLOWED;
  }
  if (errorCode === 'NotFoundError' || errorStr.includes('notfound')) {
    return CAMERA_ERRORS.NOT_FOUND;
  }
  if (errorCode === 'NotReadableError' || errorStr.includes('notreadable')) {
    return CAMERA_ERRORS.NOT_READABLE;
  }
  if (errorCode === 'SecurityError' || errorStr.includes('security')) {
    return CAMERA_ERRORS.SECURITY_ERROR;
  }

  // Smart matching based on error message content
  if (errorStr.includes('camera') || errorStr.includes('permission')) {
    return CAMERA_ERRORS.GENERIC_ERROR;
  }

  if (errorStr.includes('hand') || errorStr.includes('mediapipe')) {
    if (errorStr.includes('load')) return HAND_TRACKING_ERRORS.MODEL_LOAD_FAILED;
    if (errorStr.includes('init')) return HAND_TRACKING_ERRORS.INITIALIZATION_FAILED;
    return HAND_TRACKING_ERRORS.RUNTIME_ERROR;
  }

  if (errorStr.includes('level') || errorStr.includes('load')) {
    return GAME_ERRORS.LEVEL_LOAD_FAILED;
  }

  if (errorStr.includes('save') || errorStr.includes('sync')) {
    return GAME_ERRORS.SAVE_FAILED;
  }

  if (errorStr.includes('audio') || errorStr.includes('sound')) {
    return GAME_ERRORS.AUDIO_FAILED;
  }

  if (errorStr.includes('network') || errorStr.includes('connection')) {
    if (errorStr.includes('offline')) return NETWORK_ERRORS.NO_CONNECTION;
    if (errorStr.includes('slow')) return NETWORK_ERRORS.SLOW_CONNECTION;
    return NETWORK_ERRORS.SERVER_ERROR;
  }

  if (errorStr.includes('browser') || errorStr.includes('webgl')) {
    if (errorStr.includes('webgl')) return BROWSER_ERRORS.WEBGL_NOT_SUPPORTED;
    return BROWSER_ERRORS.UNSUPPORTED_BROWSER;
  }

  if (errorStr.includes('storage')) {
    return BROWSER_ERRORS.STORAGE_FULL;
  }

  // Fallback generic error
  return {
    title: 'Something Went Wrong 🤔',
    description: 'We ran into an unexpected problem.',
    action: 'Try refreshing the page or restarting the app.',
    emoji: '🔄',
  };
}

/**
 * Format error message for display
 * Returns a user-friendly error message with title, description, and action
 */
export function formatErrorMessage(errorCode: string, error?: Error | null): string {
  const msg = getErrorMessage(errorCode, error);
  return `${msg.emoji ? msg.emoji + ' ' : ''}${msg.title}\n\n${msg.description}\n\n👉 ${msg.action}`;
}

/**
 * Get just the title for quick display (like in toast notifications)
 */
export function getErrorTitle(errorCode: string, error?: Error | null): string {
  const msg = getErrorMessage(errorCode, error);
  return `${msg.emoji ? msg.emoji + ' ' : ''}${msg.title}`;
}

/**
 * Map DOM Exception errors to friendly messages
 */
export function handleDOMException(err: DOMException): ErrorMessageInfo {
  switch (err.name) {
    case 'NotAllowedError':
      return CAMERA_ERRORS.NOT_ALLOWED;
    case 'NotFoundError':
      return CAMERA_ERRORS.NOT_FOUND;
    case 'NotReadableError':
      return CAMERA_ERRORS.NOT_READABLE;
    case 'SecurityError':
      return CAMERA_ERRORS.SECURITY_ERROR;
    default:
      return getErrorMessage(err.name, err);
  }
}
