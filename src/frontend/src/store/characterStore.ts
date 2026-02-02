import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CharacterState {
  pip: {
    state: 'idle' | 'thinking' | 'happy' | 'waiting' | 'celebrating' | 'dancing';
    position: 'camera' | 'corner';
    visible: boolean;
  };
  lumi: {
    state: 'idle' | 'thinking' | 'happy' | 'waiting' | 'celebrating' | 'dancing';
    position: 'story' | 'corner' | 'game';
    visible: boolean;
  };
  currentScene: 'home' | 'game' | 'story' | 'celebration';
  characterEnabled: boolean;
}

interface CharacterActions {
  // Pip actions
  setPipState: (state: CharacterState['pip']['state']) => void;
  setPipPosition: (position: CharacterState['pip']['position']) => void;
  setPipVisible: (visible: boolean) => void;
  
  // Lumi actions
  setLumiState: (state: CharacterState['lumi']['state']) => void;
  setLumiPosition: (position: CharacterState['lumi']['position']) => void;
  setLumiVisible: (visible: boolean) => void;
  
  // Scene management
  setCurrentScene: (scene: CharacterState['currentScene']) => void;
  setCharacterEnabled: (enabled: boolean) => void;
  
  // Convenience actions
  showCelebration: () => void;
  showThinking: () => void;
  showHappy: () => void;
  showWaiting: () => void;
  showDancing: () => void;
}

type CharacterStore = CharacterState & CharacterActions;

export const useCharacterStore = create<CharacterStore>()(
  persist(
    (set, get) => ({
      // Initial state
      pip: {
        state: 'idle',
        position: 'camera',
        visible: true,
      },
      lumi: {
        state: 'idle',
        position: 'story',
        visible: false,
      },
      currentScene: 'home',
      characterEnabled: true,

      // Pip actions
      setPipState: (nextState) =>
        set((state) => ({
          pip: { ...state.pip, state: nextState },
        })),

      setPipPosition: (position) =>
        set((state) => ({
          pip: { ...state.pip, position },
        })),

      setPipVisible: (visible) =>
        set((state) => ({
          pip: { ...state.pip, visible },
        })),

      // Lumi actions
      setLumiState: (nextState) =>
        set((state) => ({
          lumi: { ...state.lumi, state: nextState },
        })),

      setLumiPosition: (position) =>
        set((state) => ({
          lumi: { ...state.lumi, position },
        })),

      setLumiVisible: (visible) =>
        set((state) => ({
          lumi: { ...state.lumi, visible },
        })),

      // Scene management
      setCurrentScene: (scene) =>
        set({ currentScene: scene }),

      setCharacterEnabled: (enabled) =>
        set({ characterEnabled: enabled }),

      // Convenience actions
      showCelebration: () => {
        get().setPipState('celebrating');
        get().setLumiState('celebrating');
      },

      showThinking: () => {
        get().setPipState('thinking');
        get().setLumiState('thinking');
      },

      showHappy: () => {
        get().setPipState('happy');
        get().setLumiState('happy');
      },

      showWaiting: () => {
        get().setPipState('waiting');
        get().setLumiState('waiting');
      },

      showDancing: () => {
        get().setPipState('dancing');
        get().setLumiState('dancing');
      },
    }),
    {
      name: 'character-storage',
      partialize: (state) => ({
        pip: state.pip,
        lumi: state.lumi,
        currentScene: state.currentScene,
        characterEnabled: state.characterEnabled,
      }),
    },
  ),
);
