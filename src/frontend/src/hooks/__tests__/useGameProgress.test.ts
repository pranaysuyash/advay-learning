import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGameProgress } from '../useGameProgress';
import { useProgressStore } from '../../store/progressStore';
import { progressQueue } from '../../services/progressQueue';

vi.mock('../../analytics/launch', () => ({
  trackLaunchEvent: vi.fn(),
}));

describe('useGameProgress', () => {
  beforeEach(() => {
    useProgressStore.setState({
      currentProfile: { id: 'test-profile-id' },
    });
    vi.clearAllMocks();
  });

  describe('canSave', () => {
    it('returns true when profile exists', () => {
      const { result } = renderHook(() => useGameProgress('test-game'));
      expect(result.current.canSave).toBe(true);
    });

    it('returns false when no profile', () => {
      useProgressStore.setState({ currentProfile: null });
      const { result } = renderHook(() => useGameProgress('test-game'));
      expect(result.current.canSave).toBe(false);
    });
  });

  describe('profileId', () => {
    it('returns profile id when exists', () => {
      const { result } = renderHook(() => useGameProgress('test-game'));
      expect(result.current.profileId).toBe('test-profile-id');
    });

    it('returns null when no profile', () => {
      useProgressStore.setState({ currentProfile: null });
      const { result } = renderHook(() => useGameProgress('test-game'));
      expect(result.current.profileId).toBeNull();
    });
  });

  describe('gameId', () => {
    it('returns the gameId passed to hook', () => {
      const { result } = renderHook(() => useGameProgress('my-game'));
      expect(result.current.gameId).toBe('my-game');
    });
  });

  describe('saveProgress', () => {
    it('enqueues progress with correct fields', async () => {
      const spyEnqueue = vi.spyOn(progressQueue, 'enqueue').mockReturnValue({
        success: true,
        item: {} as any,
      });

      const { result } = renderHook(() => useGameProgress('test-game'));

      await act(async () => {
        await result.current.saveProgress({
          score: 85,
          completed: true,
          level: 3,
        });
      });

      expect(spyEnqueue).toHaveBeenCalledWith(
        expect.objectContaining({
          profile_id: 'test-profile-id',
          content_id: 'test-game',
          score: 85,
          completed: true,
          activity_type: 'game_completion',
        }),
      );

      // Verify level is in metadata
      const callArg = spyEnqueue.mock.calls[0][0] as any;
      expect(callArg.meta_data.level).toBe(3);
    });

    it('tracks progress_queued event on success', async () => {
      const { trackLaunchEvent } = await import('../../analytics/launch');
      vi.spyOn(progressQueue, 'enqueue').mockReturnValue({
        success: true,
        item: {} as any,
      });

      const { result } = renderHook(() => useGameProgress('test-game'));

      await act(async () => {
        await result.current.saveProgress({ score: 50, completed: true });
      });

      expect(trackLaunchEvent).toHaveBeenCalledWith('progress_queued', {
        gameId: 'test-game',
        profileId: 'test-profile-id',
        score: 50,
        completed: true,
      });
    });

    it('throws when no profile selected', async () => {
      useProgressStore.setState({ currentProfile: null });
      const { result } = renderHook(() => useGameProgress('test-game'));

      await expect(
        result.current.saveProgress({ score: 10, completed: true }),
      ).rejects.toThrow('No profile selected');
    });

    it('throws when queue returns failure', async () => {
      vi.spyOn(progressQueue, 'enqueue').mockReturnValue({
        success: false,
        item: {} as any,
        error: 'rate-limited: too many enqueue calls',
      });

      const { result } = renderHook(() => useGameProgress('test-game'));

      await expect(
        act(async () => {
          await result.current.saveProgress({ score: 10, completed: true });
        }),
      ).rejects.toThrow('rate-limited');
    });

    it('tracks progress_queue_failed event on failure', async () => {
      const { trackLaunchEvent } = await import('../../analytics/launch');
      vi.spyOn(progressQueue, 'enqueue').mockReturnValue({
        success: false,
        item: {} as any,
        error: 'Queue full',
      });

      const { result } = renderHook(() => useGameProgress('test-game'));

      try {
        await act(async () => {
          await result.current.saveProgress({ score: 10, completed: true });
        });
      } catch {
        // expected
      }

      expect(trackLaunchEvent).toHaveBeenCalledWith('progress_queue_failed', {
        gameId: 'test-game',
        profileId: 'test-profile-id',
        reason: 'Queue full',
      });
    });
  });

  describe('saveCompletion', () => {
    it('calls saveProgress with completed=true', async () => {
      const spyEnqueue = vi.spyOn(progressQueue, 'enqueue').mockReturnValue({
        success: true,
        item: {} as any,
      });

      const { result } = renderHook(() => useGameProgress('test-game'));

      await act(async () => {
        await result.current.saveCompletion(75);
      });

      expect(spyEnqueue).toHaveBeenCalledWith(
        expect.objectContaining({
          score: 75,
          completed: true,
        }),
      );
    });

    it('passes level when provided', async () => {
      const spyEnqueue = vi.spyOn(progressQueue, 'enqueue').mockReturnValue({
        success: true,
        item: {} as any,
      });

      const { result } = renderHook(() => useGameProgress('test-game'));

      await act(async () => {
        await result.current.saveCompletion(90, 5);
      });

      const callArg = spyEnqueue.mock.calls[0][0] as any;
      expect(callArg.meta_data.level).toBe(5);
    });

    it('omits level from metadata when not provided', async () => {
      const spyEnqueue = vi.spyOn(progressQueue, 'enqueue').mockReturnValue({
        success: true,
        item: {} as any,
      });

      const { result } = renderHook(() => useGameProgress('test-game'));

      await act(async () => {
        await result.current.saveCompletion(90);
      });

      const callArg = spyEnqueue.mock.calls[0][0] as any;
      expect(callArg.meta_data.level).toBeUndefined();
    });
  });
});
