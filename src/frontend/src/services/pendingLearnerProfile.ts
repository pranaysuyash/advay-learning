const STORAGE_KEY = 'pending-learner-profile';

export interface PendingLearnerProfile {
  name: string;
  age?: number;
  preferred_language?: string;
}

function canUseStorage(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

export function savePendingLearnerProfile(profile: PendingLearnerProfile): void {
  if (!canUseStorage()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
}

export function loadPendingLearnerProfile(): PendingLearnerProfile | null {
  if (!canUseStorage()) return null;

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as PendingLearnerProfile;
    if (!parsed?.name?.trim()) {
      clearPendingLearnerProfile();
      return null;
    }
    return parsed;
  } catch {
    clearPendingLearnerProfile();
    return null;
  }
}

export function clearPendingLearnerProfile(): void {
  if (!canUseStorage()) return;
  window.localStorage.removeItem(STORAGE_KEY);
}
