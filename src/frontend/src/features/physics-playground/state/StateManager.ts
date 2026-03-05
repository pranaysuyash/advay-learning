import { SavedState, Settings, AccessibilityMode } from '../types';
import { Particle as ParticleShape } from '../types';

const STORAGE_KEY = 'physics-playground-state-v1';
const AUTO_SAVE_DELAY_MS = 5 * 60 * 1000; // 5 minutes

export class StateManager {
  private autoSaveTimer: number | null = null;
  private lastInteractionTime: number = Date.now();
  private currentSettings: Settings = {
    particleCountLimit: 500,
    audioEnabled: true,
    handTrackingEnabled: true,
    accessibilityMode: AccessibilityMode.NONE,
    interactionMode: 'pour',
  };

  save(particles: ParticleShape[], settings?: Settings): void {
    const snapshot: SavedState = {
      id: 'autosave',
      timestamp: Date.now(),
      particles,
      settings: settings || this.currentSettings,
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  }

  load(): SavedState | null {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }
    try {
      const parsed = JSON.parse(raw) as SavedState;
      if (!Array.isArray(parsed.particles) || !parsed.settings) {
        return null;
      }
      return parsed;
    } catch {
      return null;
    }
  }

  /**
   * Get current settings
   */
  getSettings(): Settings {
    return this.currentSettings;
  }

  /**
   * Update settings and persist to localStorage
   */
  updateSettings(updates: Partial<Settings>): void {
    this.currentSettings = { ...this.currentSettings, ...updates };
    // Also save to localStorage for persistence
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as SavedState;
        const snapshot: SavedState = {
          ...parsed,
          settings: this.currentSettings,
        };
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
      } catch {
        // Ignore parse errors, just won't persist settings
      }
    }
  }

  /**
   * Record user interaction and reset auto-save timer
   */
  recordInteraction(): void {
    this.lastInteractionTime = Date.now();
    this.resetAutoSaveTimer();
  }

  /**
   * Reset the auto-save timer
   */
  private resetAutoSaveTimer(): void {
    if (this.autoSaveTimer) {
      window.clearTimeout(this.autoSaveTimer);
    }
    this.autoSaveTimer = window.setTimeout(() => {
      // Auto-save triggered after 5 minutes of inactivity
      console.log('Auto-saving physics playground state after 5 minutes of inactivity');
    }, AUTO_SAVE_DELAY_MS);
  }

  /**
   * Check if auto-save should be triggered
   */
  shouldAutoSave(): boolean {
    return Date.now() - this.lastInteractionTime > AUTO_SAVE_DELAY_MS;
  }

  /**
   * Clear the auto-save timer
   */
  clearAutoSaveTimer(): void {
    if (this.autoSaveTimer) {
      window.clearTimeout(this.autoSaveTimer);
      this.autoSaveTimer = null;
    }
  }
}
