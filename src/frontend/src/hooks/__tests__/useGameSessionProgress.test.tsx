import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useGameSessionProgress } from '../useGameSessionProgress';
import { useProfileStore } from '../../store/profileStore';
import { recordGameSessionProgress } from '../../services/progressTracking';

vi.mock('../../services/progressTracking', () => ({
  recordGameSessionProgress: vi.fn().mockResolvedValue({ status: 'saved' }),
}));

const mockedRecordGameSessionProgress = vi.mocked(recordGameSessionProgress);
const TEST_PROFILE_ID = '11111111-1111-4111-8111-111111111111';

describe('useGameSessionProgress', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-02-23T16:00:00.000Z'));
    mockedRecordGameSessionProgress.mockClear();
    useProfileStore.setState({
      currentProfile: {
        id: TEST_PROFILE_ID,
        name: 'Test Child',
        preferred_language: 'en',
        created_at: '2026-02-23T00:00:00.000Z',
      },
      profiles: [],
      isLoading: false,
      error: null,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    useProfileStore.setState({
      currentProfile: null,
      profiles: [],
      isLoading: false,
      error: null,
    });
  });

  function makeWrapper() {
    return function Wrapper({ children }: { children: ReactNode }) {
      return (
        <MemoryRouter initialEntries={[{ pathname: '/test-game' }]}>
          {children}
        </MemoryRouter>
      );
    };
  }

  it('records a session on play-stop transition', async () => {
    const wrapper = makeWrapper();
    const { rerender } = renderHook(
      (props: { score: number; level: number; isPlaying: boolean }) =>
        useGameSessionProgress({
          gameName: 'Test Game',
          score: props.score,
          level: props.level,
          isPlaying: props.isPlaying,
        }),
      {
        wrapper,
        initialProps: { score: 3, level: 1, isPlaying: false },
      },
    );

    await act(async () => {
      rerender({ score: 3, level: 1, isPlaying: true });
    });
    await act(async () => {
      rerender({ score: 7, level: 2, isPlaying: true });
    });
    await act(async () => {
      vi.advanceTimersByTime(8000);
    });
    await act(async () => {
      rerender({ score: 7, level: 2, isPlaying: false });
    });

    expect(mockedRecordGameSessionProgress).toHaveBeenCalledTimes(1);
    expect(mockedRecordGameSessionProgress).toHaveBeenCalledWith(
      expect.objectContaining({
        profileId: TEST_PROFILE_ID,
        gameName: 'Test Game',
        score: 7,
        level: 2,
        durationSeconds: 8,
        routePath: '/test-game',
      }),
    );
  });

  it('skips very short zero-score sessions', async () => {
    const wrapper = makeWrapper();
    const { rerender } = renderHook(
      (props: { score: number; isPlaying: boolean }) =>
        useGameSessionProgress({
          gameName: 'Test Game',
          score: props.score,
          isPlaying: props.isPlaying,
        }),
      {
        wrapper,
        initialProps: { score: 0, isPlaying: false },
      },
    );

    await act(async () => {
      rerender({ score: 0, isPlaying: true });
    });
    await act(async () => {
      vi.advanceTimersByTime(3000);
    });
    await act(async () => {
      rerender({ score: 0, isPlaying: false });
    });

    expect(mockedRecordGameSessionProgress).not.toHaveBeenCalled();
  });

  it('records session on unmount with unmount reason', () => {
    const wrapper = makeWrapper();
    const { unmount } = renderHook(
      () =>
        useGameSessionProgress({
          gameName: 'Test Game',
          score: 4,
          isPlaying: true,
        }),
      { wrapper },
    );

    act(() => {
      vi.advanceTimersByTime(6000);
    });
    unmount();

    expect(mockedRecordGameSessionProgress).toHaveBeenCalledTimes(1);
    expect(mockedRecordGameSessionProgress).toHaveBeenCalledWith(
      expect.objectContaining({
        profileId: TEST_PROFILE_ID,
        gameName: 'Test Game',
        score: 4,
        durationSeconds: 6,
        routePath: '/test-game',
        metaData: expect.objectContaining({ end_reason: 'unmount' }),
      }),
    );
  });
});
