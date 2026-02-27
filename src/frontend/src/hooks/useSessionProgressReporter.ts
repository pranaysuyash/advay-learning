import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useProfileStore } from '../store/profileStore';
import { recordGameSessionProgress } from '../services/progressTracking';

interface UseSessionProgressReporterOptions {
  gameName: string;
  score?: number;
  level?: number;
  isPlaying?: boolean;
  enabled?: boolean;
  metaData?: Record<string, unknown>;
}

/**
 * Shared game-session reporter used by both GameContainer and page-level hooks.
 *
 * This keeps session duration/idempotency/short-session guards consistent across
 * all games and avoids drift between multiple implementations.
 */
export function useSessionProgressReporter(
  options: UseSessionProgressReporterOptions,
) {
  const {
    gameName,
    score,
    level,
    isPlaying,
    enabled = true,
    metaData,
  } = options;

  const location = useLocation();
  const currentProfileId = useProfileStore((state) => state.currentProfile?.id);
  const resolvedProfileId = useMemo(() => {
    const stateProfileId = (location.state as { profileId?: string } | null)
      ?.profileId;
    return stateProfileId || currentProfileId || null;
  }, [currentProfileId, location.state]);

  const mountedAtRef = useRef<number>(Date.now());
  const sessionStartRef = useRef<number | null>(
    isPlaying === true ? Date.now() : null,
  );
  const prevIsPlayingRef = useRef<boolean | undefined>(isPlaying);
  const latestScoreRef = useRef<number | undefined>(score);
  const latestLevelRef = useRef<number | undefined>(level);
  const latestGameNameRef = useRef<string>(gameName);
  const latestMetaDataRef = useRef<Record<string, unknown> | undefined>(
    metaData,
  );
  const lastReportedSessionRef = useRef<string | null>(null);

  useEffect(() => {
    latestScoreRef.current = score;
  }, [score]);

  useEffect(() => {
    latestLevelRef.current = level;
  }, [level]);

  useEffect(() => {
    latestGameNameRef.current = gameName;
  }, [gameName]);

  useEffect(() => {
    latestMetaDataRef.current = metaData;
  }, [metaData]);

  const reportSession = useCallback(
    (reason: 'pause-stop' | 'unmount') => {
      if (!enabled) return;

      const startMs =
        sessionStartRef.current ??
        (isPlaying === undefined ? mountedAtRef.current : null);
      if (!startMs) return;

      const durationSeconds = Math.max(
        0,
        Math.round((Date.now() - startMs) / 1000),
      );
      const finalScore = Number(latestScoreRef.current ?? 0);
      const sessionId = `${startMs}`;
      if (lastReportedSessionRef.current === sessionId) return;

      // Ignore extremely short, zero-score "open and close" sessions.
      if (durationSeconds < 5 && finalScore <= 0) return;

      lastReportedSessionRef.current = sessionId;

      void recordGameSessionProgress({
        profileId: resolvedProfileId,
        gameName: latestGameNameRef.current,
        score: finalScore,
        durationSeconds,
        level: latestLevelRef.current,
        routePath: location.pathname,
        sessionId,
        metaData: {
          end_reason: reason,
          ...latestMetaDataRef.current,
        },
      });
    },
    [enabled, isPlaying, location.pathname, resolvedProfileId],
  );

  useEffect(() => {
    if (!enabled) return;

    const wasPlaying = prevIsPlayingRef.current;
    const nowPlaying = isPlaying;

    if (nowPlaying === true && wasPlaying !== true) {
      sessionStartRef.current = Date.now();
      lastReportedSessionRef.current = null;
    }

    if (wasPlaying === true && nowPlaying === false) {
      reportSession('pause-stop');
      sessionStartRef.current = null;
    }

    prevIsPlayingRef.current = nowPlaying;
  }, [enabled, isPlaying, reportSession]);

  useEffect(
    () => () => {
      if (enabled) {
        reportSession('unmount');
      }
    },
    [enabled, reportSession],
  );
}

export default useSessionProgressReporter;
