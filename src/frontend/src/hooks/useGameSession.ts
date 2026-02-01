import { useCallback, useEffect } from 'react';

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
  onResume?: (state: GameSessionState) => void;
}

export function useGameSession({
  isPlaying,
  sessionData,
  onResume: _onResume,
}: UseGameSessionProps) {
  const STORAGE_KEY = 'alphabetGameSession';

  // Save session to localStorage
  const saveSession = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessionData));
  }, [sessionData]);

  // Load session from localStorage
  const loadSession = useCallback((): GameSessionState | null => {
    const saved = localStorage.getItem(STORAGE_KEY);
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
    localStorage.removeItem(STORAGE_KEY);
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
