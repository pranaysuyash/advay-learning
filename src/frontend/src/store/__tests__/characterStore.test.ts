import { describe, it, expect, beforeEach } from 'vitest';
import { useCharacterStore } from '../characterStore';

describe('characterStore', () => {
  beforeEach(() => {
    // Reset store to initial state
    useCharacterStore.setState({
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
    });
  });

  describe('initial state', () => {
    it('should have pip in idle state', () => {
      expect(useCharacterStore.getState().pip.state).toBe('idle');
    });

    it('should have pip at camera position', () => {
      expect(useCharacterStore.getState().pip.position).toBe('camera');
    });

    it('should have pip visible', () => {
      expect(useCharacterStore.getState().pip.visible).toBe(true);
    });

    it('should have lumi in idle state', () => {
      expect(useCharacterStore.getState().lumi.state).toBe('idle');
    });

    it('should have lumi at story position', () => {
      expect(useCharacterStore.getState().lumi.position).toBe('story');
    });

    it('should have lumi hidden', () => {
      expect(useCharacterStore.getState().lumi.visible).toBe(false);
    });

    it('should have home as current scene', () => {
      expect(useCharacterStore.getState().currentScene).toBe('home');
    });

    it('should have character enabled', () => {
      expect(useCharacterStore.getState().characterEnabled).toBe(true);
    });
  });

  describe('pip actions', () => {
    describe('setPipState', () => {
      it('should set pip state to thinking', () => {
        useCharacterStore.getState().setPipState('thinking');
        expect(useCharacterStore.getState().pip.state).toBe('thinking');
      });

      it('should set pip state to happy', () => {
        useCharacterStore.getState().setPipState('happy');
        expect(useCharacterStore.getState().pip.state).toBe('happy');
      });

      it('should set pip state to celebrating', () => {
        useCharacterStore.getState().setPipState('celebrating');
        expect(useCharacterStore.getState().pip.state).toBe('celebrating');
      });

      it('should set pip state to waiting', () => {
        useCharacterStore.getState().setPipState('waiting');
        expect(useCharacterStore.getState().pip.state).toBe('waiting');
      });

      it('should set pip state to dancing', () => {
        useCharacterStore.getState().setPipState('dancing');
        expect(useCharacterStore.getState().pip.state).toBe('dancing');
      });

      it('should preserve other pip properties when setting state', () => {
        useCharacterStore.getState().setPipState('thinking');
        expect(useCharacterStore.getState().pip.position).toBe('camera');
        expect(useCharacterStore.getState().pip.visible).toBe(true);
      });
    });

    describe('setPipPosition', () => {
      it('should set pip position to corner', () => {
        useCharacterStore.getState().setPipPosition('corner');
        expect(useCharacterStore.getState().pip.position).toBe('corner');
      });

      it('should preserve other pip properties when setting position', () => {
        useCharacterStore.getState().setPipPosition('corner');
        expect(useCharacterStore.getState().pip.state).toBe('idle');
        expect(useCharacterStore.getState().pip.visible).toBe(true);
      });
    });

    describe('setPipVisible', () => {
      it('should hide pip', () => {
        useCharacterStore.getState().setPipVisible(false);
        expect(useCharacterStore.getState().pip.visible).toBe(false);
      });

      it('should show pip', () => {
        useCharacterStore.getState().setPipVisible(false);
        useCharacterStore.getState().setPipVisible(true);
        expect(useCharacterStore.getState().pip.visible).toBe(true);
      });
    });
  });

  describe('lumi actions', () => {
    describe('setLumiState', () => {
      it('should set lumi state to thinking', () => {
        useCharacterStore.getState().setLumiState('thinking');
        expect(useCharacterStore.getState().lumi.state).toBe('thinking');
      });

      it('should set lumi state to happy', () => {
        useCharacterStore.getState().setLumiState('happy');
        expect(useCharacterStore.getState().lumi.state).toBe('happy');
      });

      it('should set lumi state to celebrating', () => {
        useCharacterStore.getState().setLumiState('celebrating');
        expect(useCharacterStore.getState().lumi.state).toBe('celebrating');
      });

      it('should set lumi state to waiting', () => {
        useCharacterStore.getState().setLumiState('waiting');
        expect(useCharacterStore.getState().lumi.state).toBe('waiting');
      });

      it('should set lumi state to dancing', () => {
        useCharacterStore.getState().setLumiState('dancing');
        expect(useCharacterStore.getState().lumi.state).toBe('dancing');
      });

      it('should preserve other lumi properties when setting state', () => {
        useCharacterStore.getState().setLumiState('thinking');
        expect(useCharacterStore.getState().lumi.position).toBe('story');
        expect(useCharacterStore.getState().lumi.visible).toBe(false);
      });
    });

    describe('setLumiPosition', () => {
      it('should set lumi position to corner', () => {
        useCharacterStore.getState().setLumiPosition('corner');
        expect(useCharacterStore.getState().lumi.position).toBe('corner');
      });

      it('should set lumi position to game', () => {
        useCharacterStore.getState().setLumiPosition('game');
        expect(useCharacterStore.getState().lumi.position).toBe('game');
      });

      it('should preserve other lumi properties when setting position', () => {
        useCharacterStore.getState().setLumiPosition('corner');
        expect(useCharacterStore.getState().lumi.state).toBe('idle');
        expect(useCharacterStore.getState().lumi.visible).toBe(false);
      });
    });

    describe('setLumiVisible', () => {
      it('should show lumi', () => {
        useCharacterStore.getState().setLumiVisible(true);
        expect(useCharacterStore.getState().lumi.visible).toBe(true);
      });

      it('should hide lumi', () => {
        useCharacterStore.getState().setLumiVisible(true);
        useCharacterStore.getState().setLumiVisible(false);
        expect(useCharacterStore.getState().lumi.visible).toBe(false);
      });
    });
  });

  describe('scene management', () => {
    describe('setCurrentScene', () => {
      it('should set scene to game', () => {
        useCharacterStore.getState().setCurrentScene('game');
        expect(useCharacterStore.getState().currentScene).toBe('game');
      });

      it('should set scene to story', () => {
        useCharacterStore.getState().setCurrentScene('story');
        expect(useCharacterStore.getState().currentScene).toBe('story');
      });

      it('should set scene to celebration', () => {
        useCharacterStore.getState().setCurrentScene('celebration');
        expect(useCharacterStore.getState().currentScene).toBe('celebration');
      });

      it('should set scene to home', () => {
        useCharacterStore.getState().setCurrentScene('game');
        useCharacterStore.getState().setCurrentScene('home');
        expect(useCharacterStore.getState().currentScene).toBe('home');
      });
    });

    describe('setCharacterEnabled', () => {
      it('should disable characters', () => {
        useCharacterStore.getState().setCharacterEnabled(false);
        expect(useCharacterStore.getState().characterEnabled).toBe(false);
      });

      it('should enable characters', () => {
        useCharacterStore.getState().setCharacterEnabled(false);
        useCharacterStore.getState().setCharacterEnabled(true);
        expect(useCharacterStore.getState().characterEnabled).toBe(true);
      });
    });
  });

  describe('convenience actions', () => {
    describe('showCelebration', () => {
      it('should set both characters to celebrating state', () => {
        useCharacterStore.getState().showCelebration();

        expect(useCharacterStore.getState().pip.state).toBe('celebrating');
        expect(useCharacterStore.getState().lumi.state).toBe('celebrating');
      });

      it('should preserve other character properties', () => {
        useCharacterStore.getState().showCelebration();

        expect(useCharacterStore.getState().pip.position).toBe('camera');
        expect(useCharacterStore.getState().lumi.position).toBe('story');
      });
    });

    describe('showThinking', () => {
      it('should set both characters to thinking state', () => {
        useCharacterStore.getState().showThinking();

        expect(useCharacterStore.getState().pip.state).toBe('thinking');
        expect(useCharacterStore.getState().lumi.state).toBe('thinking');
      });
    });

    describe('showHappy', () => {
      it('should set both characters to happy state', () => {
        useCharacterStore.getState().showHappy();

        expect(useCharacterStore.getState().pip.state).toBe('happy');
        expect(useCharacterStore.getState().lumi.state).toBe('happy');
      });
    });

    describe('showWaiting', () => {
      it('should set both characters to waiting state', () => {
        useCharacterStore.getState().showWaiting();

        expect(useCharacterStore.getState().pip.state).toBe('waiting');
        expect(useCharacterStore.getState().lumi.state).toBe('waiting');
      });
    });

    describe('showDancing', () => {
      it('should set both characters to dancing state', () => {
        useCharacterStore.getState().showDancing();

        expect(useCharacterStore.getState().pip.state).toBe('dancing');
        expect(useCharacterStore.getState().lumi.state).toBe('dancing');
      });
    });
  });

  describe('persistence', () => {
    it('should have persist config with correct name', () => {
      const state = useCharacterStore.getState();
      expect(state).toHaveProperty('pip');
      expect(state).toHaveProperty('lumi');
      expect(state).toHaveProperty('currentScene');
      expect(state).toHaveProperty('characterEnabled');
    });

    it('should persist pip state', () => {
      useCharacterStore.getState().setPipState('happy');
      expect(useCharacterStore.getState().pip.state).toBe('happy');
    });

    it('should persist lumi visibility', () => {
      useCharacterStore.getState().setLumiVisible(true);
      expect(useCharacterStore.getState().lumi.visible).toBe(true);
    });

    it('should persist current scene', () => {
      useCharacterStore.getState().setCurrentScene('game');
      expect(useCharacterStore.getState().currentScene).toBe('game');
    });
  });

  describe('complex scenarios', () => {
    it('should handle pip and lumi independently', () => {
      useCharacterStore.getState().setPipState('happy');
      useCharacterStore.getState().setLumiState('thinking');

      expect(useCharacterStore.getState().pip.state).toBe('happy');
      expect(useCharacterStore.getState().lumi.state).toBe('thinking');
    });

    it('should handle visibility independently', () => {
      useCharacterStore.getState().setPipVisible(false);
      useCharacterStore.getState().setLumiVisible(true);

      expect(useCharacterStore.getState().pip.visible).toBe(false);
      expect(useCharacterStore.getState().lumi.visible).toBe(true);
    });

    it('should transition through multiple states', () => {
      useCharacterStore.getState().showThinking();
      expect(useCharacterStore.getState().pip.state).toBe('thinking');

      useCharacterStore.getState().showHappy();
      expect(useCharacterStore.getState().pip.state).toBe('happy');

      useCharacterStore.getState().showCelebration();
      expect(useCharacterStore.getState().pip.state).toBe('celebrating');

      useCharacterStore.getState().setPipState('idle');
      expect(useCharacterStore.getState().pip.state).toBe('idle');
    });

    it('should handle scene transitions', () => {
      useCharacterStore.getState().setCurrentScene('home');
      expect(useCharacterStore.getState().currentScene).toBe('home');

      useCharacterStore.getState().setCurrentScene('game');
      expect(useCharacterStore.getState().currentScene).toBe('game');

      useCharacterStore.getState().setCurrentScene('story');
      expect(useCharacterStore.getState().currentScene).toBe('story');

      useCharacterStore.getState().setCurrentScene('celebration');
      expect(useCharacterStore.getState().currentScene).toBe('celebration');
    });
  });
});
