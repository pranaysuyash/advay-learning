import { createContext, useContext, useState, useCallback, useMemo, ReactNode } from 'react';
import { ScreenCoordinate } from '../utils/coordinateTransform';

/**
 * SpatialInputContext - Centralized state for non-pointer interactions
 * 
 * This context allows UI components to subscribe to CV-driven cursor movements
 * and gestures without being tightly coupled to specific MediaPipe hooks.
 */

interface SpatialCursorState {
  position: ScreenCoordinate;
  isActive: boolean;
  isPinching: boolean;
  lastActionAt: number;
}

interface SpatialInputContextType {
  cursor: SpatialCursorState;
  
  /** Update the global spatial cursor state (usually called by useGameHandTracking or similar) */
  setSpatialCursor: (pos: ScreenCoordinate, isActive: boolean, isPinching: boolean) => void;
  
  /** Reset the cursor state (e.g., when hand detection is lost) */
  resetSpatialCursor: () => void;
}

export const SpatialInputContext = createContext<SpatialInputContextType | undefined>(undefined);

export const DEFAULT_CURSOR_STATE = {
  position: { x: 0, y: 0 },
  isActive: false,
  isPinching: false,
  lastActionAt: 0,
} as const;

export function SpatialInputProvider({ children }: { children: ReactNode }) {
  const [cursor, setCursor] = useState<SpatialCursorState>({
    position: { x: 0, y: 0 },
    isActive: false,
    isPinching: false,
    lastActionAt: 0,
  });

  const setSpatialCursor = useCallback((pos: ScreenCoordinate, isActive: boolean, isPinching: boolean) => {
    setCursor({
      position: pos,
      isActive,
      isPinching,
      lastActionAt: Date.now(),
    });
  }, []);

  const resetSpatialCursor = useCallback(() => {
    setCursor(prev => ({
      ...prev,
      isActive: false,
      isPinching: false,
    }));
  }, []);

  // Memoize context value to prevent infinite loops in consumers
  const contextValue = useMemo(() => ({
    cursor,
    setSpatialCursor,
    resetSpatialCursor,
  }), [cursor, setSpatialCursor, resetSpatialCursor]);

  return (
    <SpatialInputContext.Provider value={contextValue}>
      {children}
    </SpatialInputContext.Provider>
  );
}

export function useSpatialInput() {
  const context = useContext(SpatialInputContext);
  if (context === undefined) {
    throw new Error('useSpatialInput must be used within a SpatialInputProvider');
  }
  return context;
}
