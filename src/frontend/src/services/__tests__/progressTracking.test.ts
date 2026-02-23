import { describe, it, expect, vi, beforeEach } from 'vitest';
import { progressApi } from '../api';
import { progressQueue } from '../progressQueue';
import {
  isValidProfileId,
  toContentId,
  recordGameSessionProgress,
} from '../progressTracking';

describe('progressTracking', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('validates profile ids and normalizes content ids', () => {
    expect(isValidProfileId('a50b69c0-8e0e-4b29-a51f-8e44eb4b3a2e')).toBe(true);
    expect(isValidProfileId('guest-local')).toBe(false);
    expect(toContentId('Emoji Match')).toBe('emoji-match');
  });

  it('skips when profile id is invalid', async () => {
    const enqueueSpy = vi
      .spyOn(progressQueue, 'enqueue')
      .mockImplementation(() => undefined);
    const saveSpy = vi
      .spyOn(progressApi, 'saveProgress')
      .mockResolvedValue({} as any);

    const result = await recordGameSessionProgress({
      profileId: 'guest-local',
      gameName: 'Emoji Match',
      score: 44,
      durationSeconds: 23,
    });

    expect(result.status).toBe('skipped');
    expect(enqueueSpy).not.toHaveBeenCalled();
    expect(saveSpy).not.toHaveBeenCalled();
  });

  it('queues then marks synced when immediate save succeeds', async () => {
    const enqueueSpy = vi
      .spyOn(progressQueue, 'enqueue')
      .mockImplementation(() => undefined);
    const markSyncedSpy = vi
      .spyOn(progressQueue, 'markSynced')
      .mockImplementation(() => undefined);
    vi.spyOn(progressApi, 'saveProgress').mockResolvedValue({} as any);

    const result = await recordGameSessionProgress({
      profileId: 'a50b69c0-8e0e-4b29-a51f-8e44eb4b3a2e',
      gameName: 'Number Tap Trail',
      score: 88.4,
      durationSeconds: 41,
      level: 3,
    });

    expect(result.status).toBe('saved');
    expect(enqueueSpy).toHaveBeenCalledTimes(1);
    expect(markSyncedSpy).toHaveBeenCalledTimes(1);
  });

  it('keeps queued status when immediate save fails', async () => {
    const enqueueSpy = vi
      .spyOn(progressQueue, 'enqueue')
      .mockImplementation(() => undefined);
    const markSyncedSpy = vi
      .spyOn(progressQueue, 'markSynced')
      .mockImplementation(() => undefined);
    vi.spyOn(progressApi, 'saveProgress').mockRejectedValue(
      new Error('network'),
    );

    const result = await recordGameSessionProgress({
      profileId: 'a50b69c0-8e0e-4b29-a51f-8e44eb4b3a2e',
      gameName: 'Shape Sequence',
      score: 12,
      durationSeconds: 8,
    });

    expect(result.status).toBe('queued');
    expect(enqueueSpy).toHaveBeenCalledTimes(1);
    expect(markSyncedSpy).not.toHaveBeenCalled();
  });
});

