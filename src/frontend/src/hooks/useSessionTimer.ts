/**
 * useSessionTimer Hook
 * Tracks daily session time and enforces time limits across app restarts
 */
import { useState, useEffect, useCallback } from 'react';

interface SessionData {
  date: string; // YYYY-MM-DD
  minutesUsed: number;
  lastActive: number; // timestamp
}

const STORAGE_KEY = 'advay-session-tracker';

export function useSessionTimer(timeLimitMinutes: number = 0) {
  const [sessionData, setSessionData] = useState<SessionData>(() => loadSessionData());
  const [isActive, setIsActive] = useState(false);

  // Load session data from localStorage
  function loadSessionData(): SessionData {
    const today = new Date().toISOString().split('T')[0];
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data: SessionData = JSON.parse(stored);
        // Reset if it's a new day
        if (data.date !== today) {
          return { date: today, minutesUsed: 0, lastActive: Date.now() };
        }
        return data;
      }
    } catch {
      // localStorage not available
    }
    return { date: today, minutesUsed: 0, lastActive: Date.now() };
  }

  // Save session data
  const saveSessionData = useCallback((data: SessionData) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // localStorage not available
    }
  }, []);

  // Check if time limit is reached
  const isTimeLimitReached = useCallback((): boolean => {
    if (timeLimitMinutes <= 0) return false;
    return sessionData.minutesUsed >= timeLimitMinutes;
  }, [sessionData.minutesUsed, timeLimitMinutes]);

  // Get remaining time
  const getRemainingMinutes = useCallback((): number => {
    if (timeLimitMinutes <= 0) return Infinity;
    return Math.max(0, timeLimitMinutes - sessionData.minutesUsed);
  }, [sessionData.minutesUsed, timeLimitMinutes]);

  // Add time to session (call when game ends)
  const addSessionTime = useCallback((minutes: number) => {
    setSessionData((prev) => {
      const updated = {
        ...prev,
        minutesUsed: prev.minutesUsed + minutes,
        lastActive: Date.now(),
      };
      saveSessionData(updated);
      return updated;
    });
  }, [saveSessionData]);

  // Start tracking time
  const startSession = useCallback(() => {
    setIsActive(true);
  }, []);

  // Stop tracking time
  const stopSession = useCallback(() => {
    setIsActive(false);
  }, []);

  // Reset session (for testing or admin)
  const resetSession = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    const fresh = { date: today, minutesUsed: 0, lastActive: Date.now() };
    setSessionData(fresh);
    saveSessionData(fresh);
  }, [saveSessionData]);

  // Track active time
  useEffect(() => {
    if (!isActive || timeLimitMinutes <= 0) return;

    const interval = setInterval(() => {
      setSessionData((prev) => {
        const updated = {
          ...prev,
          minutesUsed: prev.minutesUsed + 1, // Add 1 minute
          lastActive: Date.now(),
        };
        saveSessionData(updated);
        return updated;
      });
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [isActive, timeLimitMinutes, saveSessionData]);

  return {
    minutesUsed: sessionData.minutesUsed,
    isTimeLimitReached,
    getRemainingMinutes,
    addSessionTime,
    startSession,
    stopSession,
    resetSession,
  };
}
