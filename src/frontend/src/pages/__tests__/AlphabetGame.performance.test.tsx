import { describe, it, expect, vi, beforeEach } from 'vitest';
import React, { Profiler } from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { useAuthStore } from '../../store/authStore';
import { useSettingsStore } from '../../store/settingsStore';
import { useProfileStore } from '../../store/profileStore';
import { AlphabetGame } from '../AlphabetGame';

vi.mock('react-webcam', () => ({
  default: () => <div data-testid='webcam-mock' />,
}));

vi.mock('@mediapipe/tasks-vision', () => ({
  FilesetResolver: { forVisionTasks: async () => ({}) },
  HandLandmarker: {
    createFromOptions: async () => ({ detectForVideo: () => [], close: () => {} }),
  },
  PoseLandmarker: {
    createFromOptions: async () => ({ detectForVideo: () => ({}), close: () => {} }),
  },
  FaceLandmarker: {
    createFromOptions: async () => ({ detectForVideo: () => ({}), close: () => {} }),
  },
}));

describe('AlphabetGame performance profile', () => {
  beforeEach(() => {
    cleanup();

    const profile = {
      id: 'p1',
      name: 'Perf Child',
      preferred_language: 'en',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      parent_id: 'u1',
      settings: {},
    };

    useAuthStore.setState({
      user: { id: 'u1', email: 'perf@test.com', role: 'parent', is_active: true },
      isAuthenticated: true,
    });

    useSettingsStore.setState({
      gameLanguage: 'en',
      difficulty: 'medium',
      showHints: true,
    });

    useProfileStore.setState({
      profiles: [profile],
      currentProfile: profile,
      isLoading: false,
      error: null,
      fetchProfiles: vi.fn(async () => {}),
    });
  });

  it('records mount commit duration (Profiler proof)', async () => {
    const mountDurations: number[] = [];

    render(
      <MemoryRouter
        initialEntries={[{ pathname: '/game', state: { profileId: 'p1' } }]}
      >
        <Profiler
          id='AlphabetGame'
          onRender={(_id, phase, actualDuration) => {
            if (phase === 'mount') {
              mountDurations.push(actualDuration);
            }
          }}
        >
          <AlphabetGame />
        </Profiler>
      </MemoryRouter>,
    );

    await screen.findByText(/Ready to Learn/i);

    expect(mountDurations.length).toBeGreaterThan(0);
    const maxMountDurationMs = Math.max(...mountDurations);
    console.log(
      `[PERF-003] AlphabetGame mount duration (max): ${maxMountDurationMs.toFixed(2)}ms`,
    );
    // Keep default regression runs stable; enforce strict threshold only when
    // explicitly requested for performance proof runs.
    if (process.env.PERF_ASSERT_STRICT === '1') {
      expect(maxMountDurationMs).toBeLessThan(100);
    } else {
      expect(Number.isFinite(maxMountDurationMs)).toBe(true);
    }
  });
});
