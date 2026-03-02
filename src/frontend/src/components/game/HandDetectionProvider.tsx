/**
 * HandDetectionProvider
 * 
 * React context provider for hand detection state.
 * Provides cursor position, pinch state, and webcam ref to child components.
 */
import React, { useEffect, type ReactNode } from 'react';
import { useGameHandTracking } from '../../hooks/useGameHandTracking';
import { HandDetectionContext, type HandDetectionContextValue } from './HandDetectionContext';

export interface HandDetectionProviderProps {
  /** unique name of the game for logging */
  gameName: string;
  /** whether the game is currently active/play mode */
  isPlaying: boolean;
  children: ReactNode;
}

export function HandDetectionProvider({
  gameName,
  isPlaying,
  children,
}: HandDetectionProviderProps) {
  const [lastMeta, setLastMeta] = React.useState<any>(null);

  const { cursor, pinch, startTracking, stopTracking, webcamRef } =
    useGameHandTracking({
      gameName,
      isRunning: isPlaying,
      onFrame: (_frame, meta) => {
        setLastMeta(meta);
      },
    });

  // treat any non-null cursor as "hand detected" for simplicity
  const isHandDetected = cursor !== null;

  useEffect(() => {
    if (isPlaying) {
      void startTracking();
    } else {
      stopTracking();
    }
  }, [isPlaying, startTracking, stopTracking]);

  const value: HandDetectionContextValue = {
    isHandDetected,
    cursor,
    pinch,
    webcamRef,
    meta: lastMeta,
  };

  return (
    <HandDetectionContext.Provider value={value}>
      {children}
    </HandDetectionContext.Provider>
  );
}
