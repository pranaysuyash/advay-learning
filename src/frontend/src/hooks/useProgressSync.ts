import { useEffect } from 'react';
import apiClient from '../services/api';
import { progressQueue } from '../services/progressQueue';
import { useAuthStore } from '../store/authStore';

const SYNC_INTERVAL_MS = 60_000;

export function useProgressSync() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    const isTestEnv = (import.meta as any).env?.MODE === 'test';
    if (isTestEnv || !isAuthenticated) return;

    let cancelled = false;

    const runSync = async () => {
      if (cancelled) return;
      try {
        await progressQueue.syncAll(apiClient);
      } catch {
        // Ignore sync errors here; queue remains pending and will retry later.
      }
    };

    void runSync();
    const interval = window.setInterval(() => {
      void runSync();
    }, SYNC_INTERVAL_MS);

    const onOnline = () => {
      void runSync();
    };
    window.addEventListener('online', onOnline);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
      window.removeEventListener('online', onOnline);
    };
  }, [isAuthenticated]);
}

export default useProgressSync;

