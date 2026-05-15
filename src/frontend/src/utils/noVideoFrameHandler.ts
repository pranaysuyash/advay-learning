/**
 * Shared no-video-frame handler for games that need cursor management
 * 
 * This is a stub to fix pre-existing TypeScript errors.
 * Games that use this should implement their own proper handler.
 */

import type { Dispatch, SetStateAction } from 'react';

/**
 * Stub handler for when no video frame is detected
 * 
 * @deprecated Each game should implement its own handler
 * This is a temporary fix for pre-existing TS errors
 */
export function createNoVideoFrameHandler<T>(
  setCursor?: Dispatch<SetStateAction<T | null>>
) {
  return () => {
    if (setCursor) {
      setCursor(null);
    }
    // No-op if setCursor not provided
  };
}

/**
 * Simple no-op handler for games that don't need cursor management
 */
export function noopNoVideoFrameHandler() {
  // Intentionally empty
}
