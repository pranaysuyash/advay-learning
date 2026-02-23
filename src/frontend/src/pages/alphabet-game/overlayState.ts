export interface OverlayStateInput {
  showWellnessReminder: boolean;
  hasWellnessReminderType: boolean;
  showCelebration: boolean;
  showExitModal: boolean;
  showCameraErrorModal: boolean;
  isPaused: boolean;
}

export interface OverlayVisibility {
  wellnessReminder: boolean;
  pauseModal: boolean;
  celebrationOverlay: boolean;
}

export const getAlphabetGameOverlayVisibility = (
  input: OverlayStateInput,
): OverlayVisibility => {
  const blockedByModal = input.showExitModal || input.showCameraErrorModal;

  const wellnessReminder =
    input.showWellnessReminder &&
    input.hasWellnessReminderType &&
    !input.showCelebration &&
    !input.showExitModal &&
    !input.showCameraErrorModal &&
    !input.isPaused;

  const pauseModal =
    input.isPaused &&
    !input.showExitModal &&
    !input.showCameraErrorModal &&
    !input.showWellnessReminder &&
    !input.showCelebration;

  const celebrationOverlay = input.showCelebration && !blockedByModal && !input.isPaused;

  return {
    wellnessReminder,
    pauseModal,
    celebrationOverlay,
  };
};
