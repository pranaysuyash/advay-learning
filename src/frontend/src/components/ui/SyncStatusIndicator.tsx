/**
 * SyncStatusIndicator Component
 *
 * Displays real-time sync status for parents:
 * - Online/offline connectivity
 * - Number of pending items to sync
 * - Sync progress/state
 * - Last successful sync time
 *
 * @ticket ISSUE-006 - Offline UI / Sync Status Visibility
 */

import { memo, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOnlineStatus, useSyncStatus } from '../../hooks/useOnlineStatus';
import { progressQueue } from '../../services/progressQueue';
import { UIIcon } from './Icon';

interface SyncStatusIndicatorProps {
  /** Whether to show detailed stats (expanded view) */
  detailed?: boolean;
  /** Profile ID to filter pending items */
  profileId?: string;
  /** Callback when user clicks to trigger manual sync */
  onManualSync?: () => void;
}

interface SyncState {
  isSyncing: boolean;
  lastSyncAttempt: Date | null;
  lastSyncSuccess: Date | null;
  syncError: string | null;
}

export const SyncStatusIndicator = memo(function SyncStatusIndicator({
  detailed = false,
  profileId,
  onManualSync,
}: SyncStatusIndicatorProps) {
  const { isOnline, wasOffline, lastOnline } = useOnlineStatus();
  const { pendingCount: globalPendingCount } = useSyncStatus();
  const [syncState, setSyncState] = useState<SyncState>({
    isSyncing: false,
    lastSyncAttempt: null,
    lastSyncSuccess: null,
    syncError: null,
  });
  const [showDetails, setShowDetails] = useState(false);

  // Get pending count for specific profile or global
  const pendingCount = profileId
    ? progressQueue.getPendingCount(profileId)
    : globalPendingCount;

  // Subscribe to queue changes for real-time updates
  useEffect(() => {
    const unsubscribe = progressQueue.subscribe(() => {
      // Force re-render when queue changes
      setSyncState((prev) => ({ ...prev }));
    });
    return unsubscribe;
  }, []);

  const handleManualSync = useCallback(async () => {
    if (!isOnline || syncState.isSyncing) return;

    setSyncState((prev) => ({
      ...prev,
      isSyncing: true,
      lastSyncAttempt: new Date(),
      syncError: null,
    }));

    try {
      const { syncAll } = progressQueue;
      const apiClient = (await import('../../services/api')).default;
      const result = await syncAll(apiClient);

      setSyncState((prev) => ({
        ...prev,
        isSyncing: false,
        lastSyncSuccess: new Date(),
        syncError: result.errors.length > 0 ? `${result.errors.length} items failed` : null,
      }));

      if (onManualSync) {
        onManualSync();
      }
    } catch (error) {
      setSyncState((prev) => ({
        ...prev,
        isSyncing: false,
        syncError: error instanceof Error ? error.message : 'Sync failed',
      }));
    }
  }, [isOnline, syncState.isSyncing, onManualSync]);

  const formatTime = (date: Date | null) => {
    if (!date) return 'Never';
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = () => {
    if (!isOnline) return 'text-amber-500';
    if (syncState.syncError) return 'text-red-500';
    if (pendingCount > 0) return 'text-blue-500';
    return 'text-emerald-500';
  };

  const getStatusIcon = () => {
    if (!isOnline) return 'wifi-off';
    if (syncState.isSyncing) return 'loader';
    if (syncState.syncError) return 'alert-circle';
    if (pendingCount > 0) return 'cloud-upload';
    return 'check-circle';
  };

  const getStatusText = () => {
    if (!isOnline) return 'Offline';
    if (syncState.isSyncing) return 'Syncing...';
    if (syncState.syncError) return 'Sync Error';
    if (pendingCount > 0) return `${pendingCount} pending`;
    return 'Synced';
  };

  return (
    <div className="relative">
      {/* Main Status Badge */}
      <motion.button
        onClick={() => detailed && setShowDetails(!showDetails)}
        disabled={!detailed}
        className={`
          flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium
          transition-colors duration-200
          ${detailed ? 'cursor-pointer hover:bg-slate-100' : 'cursor-default'}
          ${getStatusColor()}
          bg-slate-50 border border-slate-200
        `}
        whileHover={detailed ? { scale: 1.02 } : {}}
        whileTap={detailed ? { scale: 0.98 } : {}}
      >
        <UIIcon
          name={getStatusIcon() as any}
          size={16}
          className={syncState.isSyncing ? 'animate-spin' : ''}
        />
        <span>{getStatusText()}</span>
        {wasOffline && isOnline && (
          <span className="ml-1 text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">
            Reconnected
          </span>
        )}
      </motion.button>

      {/* Detailed Dropdown */}
      <AnimatePresence>
        {detailed && showDetails && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 mt-2 w-72 bg-white rounded-xl shadow-lg border border-slate-200 p-4 z-50"
          >
            {/* Status Header */}
            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-100">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  isOnline ? 'bg-emerald-100' : 'bg-amber-100'
                }`}
              >
                <UIIcon
                  name={isOnline ? ('wifi' as any) : ('wifi-off' as any)}
                  size={20}
                  className={isOnline ? 'text-emerald-600' : 'text-amber-600'}
                />
              </div>
              <div>
                <div className="font-semibold text-slate-800">
                  {isOnline ? 'Online' : 'Offline'}
                </div>
                <div className="text-xs text-slate-500">
                  {isOnline
                    ? `Last online: ${formatTime(lastOnline)}`
                    : lastOnline
                      ? `Went offline at ${formatTime(lastOnline)}`
                      : 'Offline'}
                </div>
              </div>
            </div>

            {/* Sync Stats */}
            <div className="space-y-3 mb-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Pending items</span>
                <span className="font-medium text-slate-800">{pendingCount}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Last sync attempt</span>
                <span className="text-sm text-slate-800">
                  {formatTime(syncState.lastSyncAttempt)}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Last successful sync</span>
                <span className="text-sm text-slate-800">
                  {formatTime(syncState.lastSyncSuccess)}
                </span>
              </div>

              {syncState.syncError && (
                <div className="p-2 bg-red-50 rounded-lg text-xs text-red-600">
                  Error: {syncState.syncError}
                </div>
              )}
            </div>

            {/* Actions */}
            {isOnline && pendingCount > 0 && (
              <button
                onClick={handleManualSync}
                disabled={syncState.isSyncing}
                className="
                  w-full py-2 px-4 rounded-lg text-sm font-medium
                  bg-blue-500 hover:bg-blue-600 disabled:bg-slate-300
                  text-white transition-colors
                  flex items-center justify-center gap-2
                "
              >
                <UIIcon
                  name={syncState.isSyncing ? ('loader' as any) : ('refresh-cw' as any)}
                  size={16}
                  className={syncState.isSyncing ? 'animate-spin' : ''}
                />
                {syncState.isSyncing ? 'Syncing...' : 'Sync Now'}
              </button>
            )}

            {!isOnline && (
              <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded-lg">
                Connect to the internet to sync your progress.
              </div>
            )}

            {isOnline && pendingCount === 0 && (
              <div className="text-xs text-emerald-600 bg-emerald-50 p-2 rounded-lg">
                All progress is synced!
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

export default SyncStatusIndicator;
