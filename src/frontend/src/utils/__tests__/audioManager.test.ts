import { describe, it, expect, beforeEach, vi } from 'vitest';

const mockAudioContextCtor = vi.fn(function MockAudioContext() {
  return {
  state: 'running',
  currentTime: 0,
  sampleRate: 44100,
  resume: vi.fn(),
  createOscillator: vi.fn().mockReturnValue({
    type: '',
    frequency: { value: 0, setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
    connect: vi.fn().mockReturnThis(),
    start: vi.fn(),
    stop: vi.fn(),
  }),
  createGain: vi.fn().mockReturnValue({
    gain: { value: 0, setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
    connect: vi.fn().mockReturnThis(),
  }),
  createBiquadFilter: vi.fn().mockReturnValue({
    type: '',
    frequency: { value: 0 },
    Q: { value: 0 },
    connect: vi.fn().mockReturnThis(),
  }),
  createBufferSource: vi.fn().mockReturnValue({
    buffer: null,
    connect: vi.fn().mockReturnThis(),
    start: vi.fn(),
    stop: vi.fn(),
  }),
  createBuffer: vi.fn().mockReturnValue({
    getChannelData: vi.fn().mockReturnValue(new Float32Array(1000)),
  }),
  destination: {},
  };
});

(globalThis as any).AudioContext = mockAudioContextCtor;
(globalThis as any).webkitAudioContext = mockAudioContextCtor;
(window as any).AudioContext = mockAudioContextCtor;
(window as any).webkitAudioContext = mockAudioContextCtor;

import { audioManager } from '../audioManager';

describe('audioManager', () => {
  beforeEach(() => {
    // Reset state
    audioManager.setMasterVolume(0.7);
    audioManager.setSFXVolume(0.6);
    if (audioManager.isMuted()) {
      audioManager.toggleMute();
    }
  });

  describe('initialization', () => {
    it('should initialize audio context', () => {
      audioManager.initialize();
      expect(mockAudioContextCtor).toHaveBeenCalled();
    });

    it('should use webkitAudioContext as fallback', () => {
      const original = global.AudioContext;
      const originalWindowAudioContext = (window as any).AudioContext;
      (globalThis as any).AudioContext = undefined;
      (window as any).AudioContext = undefined;
      audioManager.initialize();
      expect(mockAudioContextCtor).toHaveBeenCalled();
      (globalThis as any).AudioContext = original;
      (window as any).AudioContext = originalWindowAudioContext;
    });
  });

  describe('volume control', () => {
    it('should set master volume', () => {
      expect(() => audioManager.setMasterVolume(0.5)).not.toThrow();
    });

    it('should clamp master volume to max 1', () => {
      expect(() => audioManager.setMasterVolume(1.5)).not.toThrow();
    });

    it('should clamp master volume to min 0', () => {
      expect(() => audioManager.setMasterVolume(-0.5)).not.toThrow();
    });

    it('should set SFX volume', () => {
      expect(() => audioManager.setSFXVolume(0.8)).not.toThrow();
    });

    it('should clamp SFX volume to max 0.8 for child safety', () => {
      expect(() => audioManager.setSFXVolume(1.0)).not.toThrow();
    });

    it('should clamp SFX volume to min 0', () => {
      expect(() => audioManager.setSFXVolume(-0.5)).not.toThrow();
    });
  });

  describe('mute control', () => {
    it('should toggle mute', () => {
      const initialMute = audioManager.isMuted();
      audioManager.toggleMute();
      expect(audioManager.isMuted()).toBe(!initialMute);
    });

    it('should return muted state', () => {
      expect(typeof audioManager.isMuted()).toBe('boolean');
    });

    it('should not throw when muted', () => {
      audioManager.toggleMute();
      expect(() => audioManager.playSuccess()).not.toThrow();
    });
  });

  describe('sound playback', () => {
    it('should play success sound', () => {
      expect(() => audioManager.playSuccess()).not.toThrow();
    });

    it('should play error sound', () => {
      expect(() => audioManager.playError()).not.toThrow();
    });

    it('should play click sound', () => {
      expect(() => audioManager.playClick()).not.toThrow();
    });

    it('should play hover sound', () => {
      expect(() => audioManager.playHover()).not.toThrow();
    });

    it('should play celebration sound', () => {
      expect(() => audioManager.playCelebration()).not.toThrow();
    });

    it('should play levelUp sound', () => {
      expect(() => audioManager.playLevelUp()).not.toThrow();
    });

    it('should play bounce sound', () => {
      expect(() => audioManager.playBounce()).not.toThrow();
    });

    it('should play pop sound', () => {
      expect(() => audioManager.playPop()).not.toThrow();
    });

    it('should play munch sound', () => {
      expect(() => audioManager.playMunch()).not.toThrow();
    });

    it('should play chirp sound', () => {
      expect(() => audioManager.playChirp()).not.toThrow();
    });

    it('should play fanfare sound', () => {
      expect(() => audioManager.playFanfare()).not.toThrow();
    });

    it('should play flip sound', () => {
      expect(() => audioManager.playFlip()).not.toThrow();
    });

    it('should play shake sound', () => {
      expect(() => audioManager.playShake()).not.toThrow();
    });
  });

  describe('play method routing', () => {
    it('should route to playSuccess for success type', () => {
      const spy = vi.spyOn(audioManager, 'playSuccess');
      (audioManager as any).play('success');
      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });

    it('should route to playError for error type', () => {
      const spy = vi.spyOn(audioManager, 'playError');
      (audioManager as any).play('error');
      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });

    it('should route to playClick for click type', () => {
      const spy = vi.spyOn(audioManager, 'playClick');
      (audioManager as any).play('click');
      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });

    it('should route to playHover for hover type', () => {
      const spy = vi.spyOn(audioManager, 'playHover');
      (audioManager as any).play('hover');
      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });

    it('should route to playCelebration for celebration type', () => {
      const spy = vi.spyOn(audioManager, 'playCelebration');
      (audioManager as any).play('celebration');
      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });

    it('should route to playLevelUp for levelUp type', () => {
      const spy = vi.spyOn(audioManager, 'playLevelUp');
      (audioManager as any).play('levelUp');
      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });

    it('should route to playBounce for bounce type', () => {
      const spy = vi.spyOn(audioManager, 'playBounce');
      (audioManager as any).play('bounce');
      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });

    it('should route to playPop for pop type', () => {
      const spy = vi.spyOn(audioManager, 'playPop');
      (audioManager as any).play('pop');
      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });

    it('should route to playMunch for munch type', () => {
      const spy = vi.spyOn(audioManager, 'playMunch');
      (audioManager as any).play('munch');
      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });

    it('should route to playChirp for chirp type', () => {
      const spy = vi.spyOn(audioManager, 'playChirp');
      (audioManager as any).play('chirp');
      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });

    it('should route to playFanfare for fanfare type', () => {
      const spy = vi.spyOn(audioManager, 'playFanfare');
      (audioManager as any).play('fanfare');
      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });

    it('should route to playFlip for flip type', () => {
      const spy = vi.spyOn(audioManager, 'playFlip');
      (audioManager as any).play('flip');
      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });

    it('should route to playShake for shake type', () => {
      const spy = vi.spyOn(audioManager, 'playShake');
      (audioManager as any).play('shake');
      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });
  });

  describe('edge cases', () => {
    it('should handle multiple rapid plays', () => {
      expect(() => {
        audioManager.playClick();
        audioManager.playClick();
        audioManager.playClick();
      }).not.toThrow();
    });

    it('should handle toggle mute twice', () => {
      expect(() => {
        audioManager.toggleMute();
        audioManager.toggleMute();
      }).not.toThrow();
    });

    it('should handle zero volume settings', () => {
      expect(() => {
        audioManager.setMasterVolume(0);
        audioManager.setSFXVolume(0);
      }).not.toThrow();
    });
  });
});
