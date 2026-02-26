import { progressApi } from './api';
import { progressQueue } from './progressQueue';

const UUID_V4_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export interface GameProgressPayload {
  profileId?: string | null;
  gameName: string;
  score: number;
  durationSeconds: number;
  level?: number;
  accuracy?: number;
  routePath?: string;
  sessionId?: string;
  metaData?: Record<string, unknown>;
  completed?: boolean;
}

export interface ProgressActivityPayload {
  profileId?: string | null;
  activityType: string;
  contentId: string;
  score: number;
  durationSeconds?: number;
  routePath?: string;
  sessionId?: string;
  idempotencyKey?: string;
  metaData?: Record<string, unknown>;
  completed?: boolean;
}

function normalizeScore(score: number): number {
  if (!Number.isFinite(score)) return 0;
  return Math.max(0, Math.round(score));
}

export function isValidProfileId(profileId?: string | null): profileId is string {
  if (!profileId) return false;
  return UUID_V4_REGEX.test(profileId);
}

export function toContentId(gameName: string): string {
  return gameName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function buildSessionIdempotencyKey(
  profileId: string,
  contentId: string,
  sessionId: string,
): string {
  return `gs:${profileId}:${contentId}:${sessionId}`.slice(0, 255);
}

export async function recordProgressActivity(payload: ProgressActivityPayload): Promise<{
  status: 'saved' | 'queued' | 'skipped';
  reason?: string;
}> {
  const {
    profileId,
    activityType,
    contentId,
    score,
    durationSeconds,
    routePath,
    sessionId,
    idempotencyKey,
    metaData,
    completed,
  } = payload;

  if (!isValidProfileId(profileId)) {
    return { status: 'skipped', reason: 'invalid-profile-id' };
  }

  const safeContentId = toContentId(contentId || activityType || 'activity');
  const safeScore = normalizeScore(score);
  const safeDurationSeconds = Math.max(0, Math.round(durationSeconds || 0));
  const stamp = new Date().toISOString();
  const resolvedSessionId = sessionId || `${Date.now()}`;
  const key =
    idempotencyKey ||
    `ev:${profileId}:${activityType}:${safeContentId}:${resolvedSessionId}`.slice(
      0,
      255,
    );

  const queueItem = {
    idempotency_key: key,
    profile_id: profileId,
    activity_type: activityType,
    content_id: safeContentId,
    score: safeScore,
    duration_seconds: safeDurationSeconds,
    completed: Boolean(completed),
    meta_data: {
      route_path: routePath,
      ...metaData,
    },
    timestamp: stamp,
  };

  // Queue first to preserve data even if immediate network save fails.
  progressQueue.enqueue(queueItem);

  try {
    await progressApi.saveProgress(profileId, {
      activity_type: queueItem.activity_type,
      content_id: queueItem.content_id,
      score: queueItem.score,
      duration_seconds: queueItem.duration_seconds,
      completed: queueItem.completed,
      meta_data: queueItem.meta_data,
      idempotency_key: queueItem.idempotency_key,
      timestamp: queueItem.timestamp,
    });
    progressQueue.markSynced(key);
    return { status: 'saved' };
  } catch {
    return { status: 'queued' };
  }
}

export async function recordGameSessionProgress(payload: GameProgressPayload): Promise<{
  status: 'saved' | 'queued' | 'skipped';
  reason?: string;
}> {
  const {
    profileId,
    gameName,
    score,
    durationSeconds,
    level,
    accuracy,
    routePath,
    sessionId,
    metaData,
    completed,
  } = payload;

  const contentId = toContentId(gameName || 'unknown-game');
  const idempotencyKey = isValidProfileId(profileId)
    ? buildSessionIdempotencyKey(profileId, contentId, sessionId || `${Date.now()}`)
    : undefined;

  const durationOk = Number.isFinite(durationSeconds) && durationSeconds > 60;
  const scoreOk = Number.isFinite(score) && score > 0;
  const inferredCompleted = completed ?? (durationOk && scoreOk);

  return recordProgressActivity({
    profileId,
    activityType: 'game',
    contentId,
    score,
    durationSeconds,
    routePath,
    sessionId,
    idempotencyKey,
    completed: inferredCompleted,
    metaData: {
      game_name: gameName,
      level,
      accuracy,
      ...metaData,
    },
  });
}
