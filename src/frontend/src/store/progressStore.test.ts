import { beforeEach, describe, expect, it } from 'vitest';
import { useProfileStore } from './profileStore';
import { useProgressStore } from './progressStore';

describe('progressStore', () => {
  beforeEach(() => {
    window.localStorage.clear();
    useProfileStore.setState({
      profiles: [],
      currentProfile: null,
      isLoading: false,
      error: null,
    });
    useProgressStore.setState({
      currentProfile: null,
      letterProgress: {},
      batchProgress: {},
      earnedBadges: [],
    });
  });

  it('mirrors the selected profile id from profileStore', () => {
    useProfileStore.setState({
      currentProfile: {
        id: 'profile-1',
        name: 'Kid',
        preferred_language: 'en',
        created_at: '2026-03-02T00:00:00Z',
        updated_at: '2026-03-02T00:00:00Z',
        parent_id: 'parent-1',
      },
    });

    expect(useProgressStore.getState().currentProfile).toEqual({
      id: 'profile-1',
    });
  });

  it('clears the mirrored profile when profileStore clears it', () => {
    useProfileStore.setState({
      currentProfile: {
        id: 'profile-1',
        name: 'Kid',
        preferred_language: 'en',
        created_at: '2026-03-02T00:00:00Z',
        updated_at: '2026-03-02T00:00:00Z',
        parent_id: 'parent-1',
      },
    });

    useProfileStore.setState({ currentProfile: null });

    expect(useProgressStore.getState().currentProfile).toBeNull();
  });
});
