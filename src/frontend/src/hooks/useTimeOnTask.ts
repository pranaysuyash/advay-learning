import { useRef, useCallback, useEffect, useState } from 'react';

export interface TimeOnTaskState {
  totalSeconds: number;
  activeSeconds: number;
  idleSeconds: number;
  lastActivityTime: number;
}

const IDLE_THRESHOLD_MS = 3000;
const ACTIVITY_UPDATE_MS = 1000;

export function useTimeOnTask(_itemId: string) {
  const [state, setState] = useState<TimeOnTaskState>({
    totalSeconds: 0,
    activeSeconds: 0,
    idleSeconds: 0,
    lastActivityTime: Date.now(),
  });

  const intervalRef = useRef<number | null>(null);
  const lastActivityRef = useRef<number>(Date.now());
  const stateRef = useRef(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    intervalRef.current = window.setInterval(() => {
      const now = Date.now();
      const timeSinceLastActivity = now - lastActivityRef.current;
      const isIdle = timeSinceLastActivity > IDLE_THRESHOLD_MS;

      setState((prev) => ({
        ...prev,
        totalSeconds: prev.totalSeconds + 1,
        activeSeconds: prev.activeSeconds + (isIdle ? 0 : 1),
        idleSeconds: prev.idleSeconds + (isIdle ? 1 : 0),
      }));
    }, ACTIVITY_UPDATE_MS);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const recordActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
  }, []);

  const getTimeOnTask = useCallback((): TimeOnTaskState => {
    return stateRef.current;
  }, []);

  return {
    recordActivity,
    getTimeOnTask,
    currentState: state,
  };
}

export function createTimeTracker(_itemId: string) {
  const startTime = Date.now();
  const activityTimes: number[] = [];
  let lastActivity = startTime;

  return {
    recordActivity() {
      const now = Date.now();
      activityTimes.push(now);
      lastActivity = now;
    },

    getDuration(): number {
      return Math.floor((Date.now() - startTime) / 1000);
    },

    getActiveTime(): number {
      if (activityTimes.length === 0) return 0;
      
      let activeMs = 0;
      for (let i = 1; i < activityTimes.length; i++) {
        const gap = activityTimes[i] - activityTimes[i - 1];
        if (gap < IDLE_THRESHOLD_MS) {
          activeMs += gap;
        }
      }
      activeMs += Date.now() - lastActivity;
      return Math.floor(activeMs / 1000);
    },

    getIdleTime(): number {
      return this.getDuration() - this.getActiveTime();
    },

    getSummary(): TimeOnTaskState {
      const duration = this.getDuration();
      const active = this.getActiveTime();
      return {
        totalSeconds: duration,
        activeSeconds: active,
        idleSeconds: duration - active,
        lastActivityTime: lastActivity,
      };
    },
  };
}
