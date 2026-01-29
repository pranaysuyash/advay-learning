import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useSettingsStore } from './settingsStore';
import { create } from 'zustand';

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

  const mockPersist = vi.fn();
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
      const mockSettings = { ...mockSettings };

      getItemSpy.mockReturnValueOnce(JSON.stringify(mockSettings));
      
      const store = create();
      
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
      
      expect(mockPersist).toHaveBeenCalledWith('advay-settings', JSON.stringify(state));
    });

    it('should update difficulty setting', () => {
      const store = useSettingsStore.getState();
      
      store.updateSettings({ difficulty: 'easy' });
      
      const state = useSettingsStore.getState();
      expect(state.difficulty).toBe('easy');
      
      expect(mockPersist).toHaveBeenCalledWith('advay-settings', JSON.stringify(state));
    });

    it('should update cameraEnabled setting', () => {
      const store = useSettingsStore.getState();
      
      store.updateSettings({ cameraEnabled: true });
      
      const state = useSettingsStore.getState();
      expect(state.cameraEnabled).toBe(true);
      
      expect(mockPersist).toHaveBeenCalledWith('advay-settings', JSON.stringify(state));
    });

    it('should update soundEnabled setting', () => {
      const store = useSettingsStore.getState();
      
      store.updateSettings({ soundEnabled: false });
      
      const state = useSettingsStore.getState();
      expect(state.soundEnabled).toBe(false);
      
      expect(mockPersist).toHaveBeenCalledWith('advay-settings', JSON.stringify(state));
    });

    it('should update timeLimit setting', () => {
      const store = useSettingsStore.getState();
      
      store.updateSettings({ timeLimit: 30 });
      
      const state = useSettingsStore.getState();
      expect(state.timeLimit).toBe(30);
      
      expect(mockPersist).toHaveBeenCalledWith('advay-settings', JSON.stringify(state));
    });

    it('should update showHints setting', () => {
      const store = useSettingsStore.getState();
      
      store.updateSettings({ showHints: false });
      
      const state = useSettingsStore.state;
      expect(state.showHints).toBe(false);
      
      expect(mockPersist).toHaveBeenCalledWith('advay-settings', JSON.stringify(state));
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
      
      expect(mockPersist).toHaveBeenCalledWith('advay-settings', JSON.stringify(state));
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
      
      expect(mockPersist).toHaveBeenCalledWith('advay-settings', JSON.stringify(state));
    });

    it('should persist changes across store updates', () => {
      const store = useSettingsStore.getState();
      
      store.updateSettings({ cameraEnabled: true });
      const state1 = useSettingsStore.getState();
      
      store.updateSettings({ soundEnabled: false });
      const state2 = useSettingsStore.getState();
      
      expect(state1.cameraEnabled).toBe(true);
      expect(state2.soundEnabled).toBe(false);
      
      expect(mockPersist).toHaveBeenCalledTimes(2);
    });
  });
});
