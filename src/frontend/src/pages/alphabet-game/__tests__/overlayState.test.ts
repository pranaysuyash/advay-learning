import { describe, expect, it } from 'vitest';
import { getAlphabetGameOverlayVisibility } from '../overlayState';

describe('alphabet game overlay visibility', () => {
  it('shows wellness reminder only when no blocking overlays are active', () => {
    const result = getAlphabetGameOverlayVisibility({
      showWellnessReminder: true,
      hasWellnessReminderType: true,
      showCelebration: false,
      showExitModal: false,
      showCameraErrorModal: false,
      isPaused: false,
    });

    expect(result.wellnessReminder).toBe(true);
    expect(result.pauseModal).toBe(false);
    expect(result.celebrationOverlay).toBe(false);
  });

  it('suppresses pause modal when exit modal is shown', () => {
    const result = getAlphabetGameOverlayVisibility({
      showWellnessReminder: false,
      hasWellnessReminderType: false,
      showCelebration: false,
      showExitModal: true,
      showCameraErrorModal: false,
      isPaused: true,
    });

    expect(result.pauseModal).toBe(false);
  });

  it('suppresses celebration when blocked by camera error modal', () => {
    const result = getAlphabetGameOverlayVisibility({
      showWellnessReminder: false,
      hasWellnessReminderType: false,
      showCelebration: true,
      showExitModal: false,
      showCameraErrorModal: true,
      isPaused: false,
    });

    expect(result.celebrationOverlay).toBe(false);
  });

  it('shows celebration when no blockers are active', () => {
    const result = getAlphabetGameOverlayVisibility({
      showWellnessReminder: false,
      hasWellnessReminderType: false,
      showCelebration: true,
      showExitModal: false,
      showCameraErrorModal: false,
      isPaused: false,
    });

    expect(result.celebrationOverlay).toBe(true);
  });
});
