import { useCallback, useEffect } from 'react';
import { GAME_KEYS } from '../config/storageKeys';

// Session state interface
export interface GameSessionState {
  currentLetterIndex: number;
  score: number;
  streak: number;
  selectedLanguage: string;
  useMouseMode: boolean;
  timestamp: number;
}

interface UseGameSessionProps {
  isPlaying: boolean;
  sessionData: GameSessionState;
}

/**
 * Hook for persisting game session to LocalStorage
 *
 * Uses centralized storage key registry (CONSOL-003)
 * See: docs/audit/CODEBASE_CONSOLIDATION_AUDIT.md
 */
export function useGameSession({
  isPlaying,
  sessionData,
}: UseGameSessionProps) {
  // Save session to localStorage
  const saveSession = useCallback(() => {
    localStorage.setItem(GAME_KEYS.SESSION, JSON.stringify(sessionData));
  }, [sessionData]);

  // Load session from localStorage
  const loadSession = useCallback((): GameSessionState | null => {
    const saved = localStorage.getItem(GAME_KEYS.SESSION);
    if (saved) {
      try {
        const data = JSON.parse(saved) as GameSessionState;
        // Only restore if within last 24 hours
        if (Date.now() - data.timestamp < 24 * 60 * 60 * 1000) {
          return data;
        }
      } catch {
        // Ignore parse errors
      }
    }
    return null;
  }, []);

  // Clear session
  const clearSession = useCallback(() => {
    localStorage.removeItem(GAME_KEYS.SESSION);
  }, []);

  // Auto-save when playing
  useEffect(() => {
    if (isPlaying) {
      saveSession();
    }
  }, [isPlaying, saveSession]);

  return {
    saveSession,
    loadSession,
    clearSession,
  };
}
