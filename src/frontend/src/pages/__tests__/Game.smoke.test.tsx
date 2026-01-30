import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { useAuthStore } from '../../store/authStore';
import { useSettingsStore } from '../../store/settingsStore';
import { AlphabetGame as Game } from '../AlphabetGame';

// Minimal mocks for heavy external deps
vi.mock('react-webcam', () => ({
  default: () => <div data-testid='webcam-mock' />,
}));
vi.mock('@mediapipe/tasks-vision', () => ({
  FilesetResolver: { forVisionTasks: async () => ({}) },
  HandLandmarker: { createFromOptions: async () => ({}) },
}));

describe('Game smoke test', () => {
  beforeEach(() => {
    // Set minimal authenticated user
    useAuthStore.setState({
      user: { id: 'u1', email: 'a@b.com', role: 'parent', is_active: true },
      isAuthenticated: true,
    });
    useSettingsStore.setState({ gameLanguage: 'en', difficulty: 'medium' });
  });

  it('renders without ReferenceError (useProfileStore import check)', () => {
    // This test verifies that Game.tsx (via AlphabetGame) properly imports useProfileStore
    // and doesn't throw a ReferenceError on mount
    expect(() => {
      render(
        <MemoryRouter
          initialEntries={[{ pathname: '/game', state: { profileId: 'p1' } }]}
        >
          <Game />
        </MemoryRouter>,
      );
    }).not.toThrow();

    // Should render the game container
    expect(screen.getByText(/Ready to Learn/i)).toBeTruthy();
  });

  it('redirects when no profileId is provided', () => {
    render(
      <MemoryRouter initialEntries={[{ pathname: '/game', state: {} }]}>
        <Game />
      </MemoryRouter>,
    );

    // Should redirect to dashboard (Navigate component triggers redirect)
    // The component renders null during redirect, so we check no game content is shown
    expect(screen.queryByText(/Ready to Learn/i)).toBeNull();
  });
});
