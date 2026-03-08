import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { useAuthStore } from '../../store/authStore';
import { useSettingsStore } from '../../store/settingsStore';
import { useProfileStore } from '../../store/profileStore';
import { AlphabetGame } from '../AlphabetGame';

const requestPermissionMock = vi.fn<() => Promise<boolean>>();
const tutorialPropsLog: Array<Record<string, unknown>> = [];

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

vi.mock('../../hooks/useInitialCameraPermission', () => ({
  useInitialCameraPermission: () => {},
}));

vi.mock('../../hooks/useCameraPermission', () => ({
  useCameraPermission: () => ({
    requestPermission: requestPermissionMock,
    error: null,
  }),
}));

vi.mock('../../components/GameTutorial', () => ({
  GameTutorial: (props: Record<string, unknown>) => {
    tutorialPropsLog.push(props);
    return (
      <button type='button' onClick={props.onSkipCamera as () => void}>
        Mock Skip Camera
      </button>
    );
  },
}));

describe('AlphabetGame camera skip flow', () => {
  beforeEach(() => {
    tutorialPropsLog.length = 0;
    requestPermissionMock.mockReset();
    requestPermissionMock.mockResolvedValue(true);
    localStorage.clear();

    const profile = {
      id: '11111111-1111-4111-8111-111111111111',
      name: 'Camera Skip Kid',
      preferred_language: 'en',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      parent_id: 'u1',
      settings: {},
    };

    useAuthStore.setState({
      user: { id: 'u1', email: 'camera@test.com', role: 'parent', is_active: true },
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

  it('passes an onSkipCamera handler to GameTutorial', async () => {
    render(
      <MemoryRouter
        initialEntries={[
          {
            pathname: '/game',
            state: { profileId: '11111111-1111-4111-8111-111111111111' },
          },
        ]}
      >
        <AlphabetGame />
      </MemoryRouter>,
    );

    await screen.findByRole('button', { name: /mock skip camera/i });
    expect(tutorialPropsLog[0]?.onSkipCamera).toEqual(expect.any(Function));
  }, 15000);

  it('starts in mouse mode without requesting camera permission after tutorial skip-camera choice', async () => {
    render(
      <MemoryRouter
        initialEntries={[
          {
            pathname: '/game',
            state: { profileId: '11111111-1111-4111-8111-111111111111' },
          },
        ]}
      >
        <AlphabetGame />
      </MemoryRouter>,
    );

    fireEvent.click(await screen.findByRole('button', { name: /mock skip camera/i }));

    const startButton = await screen.findByRole('button', {
      name: /play with mouse\/touch/i,
    });
    fireEvent.click(startButton);

    await screen.findByText(/tracing accuracy/i);
    expect(requestPermissionMock).not.toHaveBeenCalled();
  }, 15000);
});
