import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
vi.mock('../../components/ui/ParentGate', () => ({
  ParentGate: ({ onUnlock }: { onUnlock: () => void }) => (
    <button onClick={onUnlock}>Unlock Parent Gate</button>
  ),
}));
import { Settings } from '../Settings';
import { useSettingsStore } from '../../store/settingsStore';
import { FEATURE_FLAG_META } from '../../config/features';

beforeEach(() => {
  // start with a clean settings store
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

describe('Settings page feature flags', () => {
  it('renders toggles for each editable feature flag', () => {
    render(
      <MemoryRouter>
        <Settings />
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByText('Unlock Parent Gate'));

    Object.entries(FEATURE_FLAG_META).forEach(([_flag, meta]) => {
      if (meta.editable) {
        expect(screen.getByText(meta.description)).toBeTruthy();
      }
    });
  });

  it('toggle button updates the settings store override', () => {
    render(
      <MemoryRouter>
        <Settings />
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByText('Unlock Parent Gate'));

    // pick a known editable flag (first one) to interact with
    const [flagKey, _flagMeta] = Object.entries(FEATURE_FLAG_META).find(
      ([, m]) => m.editable,
    ) as [string, typeof FEATURE_FLAG_META[keyof typeof FEATURE_FLAG_META]];

    const flagLabel = screen.getByText(`Flag: ${flagKey}`);
    const container = flagLabel.parentElement?.parentElement;
    expect(container).toBeTruthy();
    const toggle = container?.querySelector('button');
    expect(toggle).toBeTruthy();

    if (toggle) {
      fireEvent.click(toggle);
      expect(useSettingsStore.getState().features?.[flagKey]).toBe(true);
    }
  });
});
