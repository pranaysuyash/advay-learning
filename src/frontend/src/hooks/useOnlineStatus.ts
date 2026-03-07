/**
 * useOnlineStatus Hook
 *
 * Detects online/offline connectivity status.
 * Used for showing sync status to parents.
 *
 * @see docs/research/OFFLINE_FIRST_SYNC_STRATEGY.md
 */

import { useState, useEffect, useCallback } from 'react';

export interface OnlineStatus {
  isOnline: boolean;
  wasOffline: boolean;
  lastOnline: Date | null;
}

export function useOnlineStatus(): OnlineStatus {
  const [status, setStatus] = useState<OnlineStatus>({
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    wasOffline: false,
    lastOnline: typeof navigator !== 'undefined' && navigator.onLine ? new Date() : null,
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOnline = () => {
      setStatus((prev) => ({
        isOnline: true,
        wasOffline: prev.wasOffline || !prev.isOnline,
        lastOnline: new Date(),
      }));
    };

    const handleOffline = () => {
      setStatus((prev) => ({
        isOnline: false,
        wasOffline: true,
        lastOnline: prev.lastOnline,
      }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return status;
}

export function useSyncStatus() {
  const [pendingCount, setPendingCount] = useState(0);
  const onlineStatus = useOnlineStatus();

  const refreshPendingCount = useCallback(async () => {
    try {
      const { db } = await import('../services/storage/indexedDB');
      const unsynced = await db.getUnsyncedProgress();
      setPendingCount(unsynced.length);
    } catch {
      setPendingCount(0);
    }
  }, []);

  useEffect(() => {
    refreshPendingCount();
    const interval = setInterval(refreshPendingCount, 30000);
    return () => clearInterval(interval);
  }, [refreshPendingCount]);

  return {
    isOnline: onlineStatus.isOnline,
    wasOffline: onlineStatus.wasOffline,
    lastOnline: onlineStatus.lastOnline,
    pendingCount,
    canSync: onlineStatus.isOnline && pendingCount > 0,
  };
}
