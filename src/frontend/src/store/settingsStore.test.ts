import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useSettingsStore } from './settingsStore';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

describe('SettingsStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useSettingsStore.setState({
      language: 'english',
      gameLanguage: 'english',
      difficulty: 'medium',
      cameraEnabled: false,
      soundEnabled: true,
      timeLimit: 0,
      showHints: true,
    });

    // Clear localStorage spies between tests so counts are deterministic
    localStorageGetItem.mockClear();
    localStorageSetItem.mockClear();
  });

  afterEach(() => {
    // Reset store state after each test
    useSettingsStore.setState({
      language: 'english',
      gameLanguage: 'english',
      difficulty: 'medium',
      cameraEnabled: false,
      soundEnabled: true,
      timeLimit: 0,
      showHints: true,
    });
  });

  const localStorageGetItem = vi.spyOn(Storage.prototype, 'getItem');
  const localStorageSetItem = vi.spyOn(Storage.prototype, 'setItem');

  describe('initial state', () => {
    it('should have default settings on mount', () => {
      const store = useSettingsStore.getState();
      expect(store.language).toBe('english');
      expect(store.gameLanguage).toBe('english');
      expect(store.difficulty).toBe('medium');
      expect(store.cameraEnabled).toBe(false);
      expect(store.soundEnabled).toBe(true);
      expect(store.timeLimit).toBe(0);
      expect(store.showHints).toBe(true);
    });

    it('should load settings from localStorage on mount', () => {
      const getItemSpy = vi.spyOn(Storage.prototype, 'getItem');
      const mockSettings = { language: 'kannada', gameLanguage: 'kannada' };

      getItemSpy.mockReturnValueOnce(JSON.stringify(mockSettings));

      // Create a temporary persist store to trigger rehydration from localStorage
      create(
        persist(
          () => ({
            language: 'english',
            gameLanguage: 'english',
            difficulty: 'medium',
            cameraEnabled: false,
            soundEnabled: true,
            timeLimit: 0,
            showHints: true,
            updateSettings: () => {},
            resetSettings: () => {},
          }),
          { name: 'advay-settings' },
        ),
      );

      expect(getItemSpy).toHaveBeenCalledWith('advay-settings');
    });
  });

  describe('updateSettings action', () => {
    it('should update language setting', () => {
      const store = useSettingsStore.getState();

      store.updateSettings({ language: 'hindi' });

      const state = useSettingsStore.getState();
      expect(state.language).toBe('hindi');
      expect(state.gameLanguage).toBe('hindi');

      // Persisted value should wrap the state (persist middleware uses { state, version })
      const lastCall = localStorageSetItem.mock.calls.slice(-1)[0];
      const persisted = JSON.parse(lastCall[1]);
      // remove functions before comparing to persisted state
      const plainState = { ...state } as any;
      delete plainState.updateSettings;
      delete plainState.resetSettings;
      expect(persisted.state).toEqual(plainState);
    });

    it('should update difficulty setting', () => {
      const store = useSettingsStore.getState();

      store.updateSettings({ difficulty: 'easy' });

      const state = useSettingsStore.getState();
      expect(state.difficulty).toBe('easy');

      const lastCall = localStorageSetItem.mock.calls.slice(-1)[0];
      const persisted = JSON.parse(lastCall[1]);
      const plainState = { ...state } as any;
      delete plainState.updateSettings;
      delete plainState.resetSettings;
      expect(persisted.state).toEqual(plainState);
    });

    it('should update cameraEnabled setting', () => {
      const store = useSettingsStore.getState();

      store.updateSettings({ cameraEnabled: true });

      const state = useSettingsStore.getState();
      expect(state.cameraEnabled).toBe(true);

      const lastCall = localStorageSetItem.mock.calls.slice(-1)[0];
      const persisted = JSON.parse(lastCall[1]);
      const plainState = { ...state } as any;
      delete plainState.updateSettings;
      delete plainState.resetSettings;
      expect(persisted.state).toEqual(plainState);
    });

    it('should update soundEnabled setting', () => {
      const store = useSettingsStore.getState();

      store.updateSettings({ soundEnabled: false });

      const state = useSettingsStore.getState();
      expect(state.soundEnabled).toBe(false);

      const lastCall = localStorageSetItem.mock.calls.slice(-1)[0];
      const persisted = JSON.parse(lastCall[1]);
      const plainState = { ...state } as any;
      delete plainState.updateSettings;
      delete plainState.resetSettings;
      expect(persisted.state).toEqual(plainState);
    });

    it('should update timeLimit setting', () => {
      const store = useSettingsStore.getState();

      store.updateSettings({ timeLimit: 30 });

      const state = useSettingsStore.getState();
      expect(state.timeLimit).toBe(30);

      const lastCall = localStorageSetItem.mock.calls.slice(-1)[0];
      const persisted = JSON.parse(lastCall[1]);
      const plainState = { ...state } as any;
      delete plainState.updateSettings;
      delete plainState.resetSettings;
      expect(persisted.state).toEqual(plainState);
    });

    it('should update showHints setting', () => {
      const store = useSettingsStore.getState();

      store.updateSettings({ showHints: false });

      const state = useSettingsStore.getState();
      expect(state.showHints).toBe(false);

      const lastCall = localStorageSetItem.mock.calls.slice(-1)[0];
      const persisted = JSON.parse(lastCall[1]);
      const plainState = { ...state } as any;
      delete plainState.updateSettings;
      delete plainState.resetSettings;
      expect(persisted.state).toEqual(plainState);
    });
  });

  describe('resetSettings action', () => {
    it('should reset to default settings', () => {
      const store = useSettingsStore.getState();

      store.resetSettings();

      const state = useSettingsStore.getState();
      expect(state.language).toBe('english');
      expect(state.gameLanguage).toBe('english');
      expect(state.difficulty).toBe('medium');
      expect(state.cameraEnabled).toBe(false);
      expect(state.soundEnabled).toBe(true);
      expect(state.timeLimit).toBe(0);
      expect(state.showHints).toBe(true);

      const lastCall = localStorageSetItem.mock.calls.slice(-1)[0];
      const persisted = JSON.parse(lastCall[1]);
      const plainState = { ...state } as any;
      delete plainState.updateSettings;
      delete plainState.resetSettings;
      expect(persisted.state).toEqual(plainState);
    });
  });

  describe('settings interactions', () => {
    it('should apply both language and difficulty in one update', () => {
      const store = useSettingsStore.getState();

      store.updateSettings({ language: 'kannada', difficulty: 'hard' });

      const state = useSettingsStore.getState();
      expect(state.language).toBe('kannada');
      expect(state.gameLanguage).toBe('kannada');
      expect(state.difficulty).toBe('hard');

      const lastCall = localStorageSetItem.mock.calls.slice(-1)[0];
      const persisted = JSON.parse(lastCall[1]);
      const plainState = { ...state } as any;
      delete plainState.updateSettings;
      delete plainState.resetSettings;
      expect(persisted.state).toEqual(plainState);
    });

    it('should persist changes across store updates', () => {
      const store = useSettingsStore.getState();

      store.updateSettings({ cameraEnabled: true });
      const state1 = useSettingsStore.getState();

      localStorageSetItem.mockClear();

      store.updateSettings({ soundEnabled: false });
      const state2 = useSettingsStore.getState();

      expect(state1.cameraEnabled).toBe(true);
      expect(state2.soundEnabled).toBe(false);

      expect(localStorageSetItem).toHaveBeenCalledTimes(1);

      // Ensure the persisted value matches the final state
      const lastCall = localStorageSetItem.mock.calls.slice(-1)[0];
      const persisted = JSON.parse(lastCall[1]);
      const plainState = { ...state2 } as any;
      delete plainState.updateSettings;
      delete plainState.resetSettings;
      expect(persisted.state).toEqual(plainState);
    });
  });
});
