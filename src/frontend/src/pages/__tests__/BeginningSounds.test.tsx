import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { BeginningSounds } from '../BeginningSounds';
import { useSettingsStore } from '../../store/settingsStore';

beforeEach(() => {
  useSettingsStore.setState({
    features: {},
    language: 'en',
    gameLanguage: 'en',
    difficulty: 'medium',
    cameraEnabled: false,
    soundEnabled: true,
    ttsEngine: 'auto',
    timeLimit: 0,
    showHints: true,
    handTrackingDelegate: 'GPU',
    cameraPermissionState: 'unknown',
    tutorialCompleted: false,
    onboardingCompleted: false,
    calmMode: false,
    hydrated: true,
    demoMode: false,
  });
});

describe('BeginningSounds voice fallback', () => {
  it('displays banner when voiceFallback flag is on', () => {
    useSettingsStore.setState({ features: { 'controls.voiceFallbackV1': true } } as any);
    render(
      <MemoryRouter>
        <BeginningSounds />
      </MemoryRouter>,
    );

    const banner = screen.getByText(/Voice fallback enabled/i);
    expect(banner).toBeTruthy();
  });
});
