import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';

import { useAuthStore } from '../../store/authStore';
import { useSettingsStore } from '../../store/settingsStore';
import { progressQueue } from '../../services/progressQueue';
import { AlphabetGame as Game } from '../AlphabetGame';

// Minimal mocks for heavy external deps
vi.mock('react-webcam', () => ({
  default: () => <div data-testid='webcam-mock' />,
}));
vi.mock('@mediapipe/tasks-vision', () => ({
  FilesetResolver: { forVisionTasks: async () => ({}) },
  HandLandmarker: { createFromOptions: async () => ({ detectForVideo: () => [], close: () => {} }) },
  PoseLandmarker: { createFromOptions: async () => ({ detectForVideo: () => ({}), close: () => {} }) },
  FaceLandmarker: { createFromOptions: async () => ({ detectForVideo: () => ({}), close: () => {} }) },
}));

describe('Game pending indicator', () => {
  const profileId = '11111111-1111-4111-8111-111111111111';
  const queueItemId = '22222222-2222-4222-8222-222222222222';

  beforeEach(() => {
    // Clear queue
    localStorage.removeItem('advay:progressQueue:v1');

    // Set minimal authenticated user
    useAuthStore.setState({
      user: { id: 'u1', email: 'a@b.com', role: 'parent', is_active: true },
      isAuthenticated: true,
    });
    useSettingsStore.setState({ gameLanguage: 'en', difficulty: 'medium' });
  });

  it('shows pending chip when there are queued progress items for the profile', async () => {
    const pendingItem = {
      idempotency_key: queueItemId,
      profile_id: profileId,
      activity_type: 'letter_tracing',
      content_id: 'A',
      score: 80,
      timestamp: new Date().toISOString(),
    };

    progressQueue.enqueue(pendingItem);

    render(
      <MemoryRouter
        initialEntries={[{ pathname: '/game', state: { profileId } }]}
      >
        <Game />
      </MemoryRouter>,
    );

    // Expect the pending chip to be visible
    expect(await screen.findByText(/Pending \(1\)/i)).toBeTruthy();
  });
});
