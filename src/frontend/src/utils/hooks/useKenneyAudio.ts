/**
 * Kenney Audio Hook
 * 
 * Uses sound effects from Kenney's Platformer Pack
 * All sounds are CC0 (Public Domain)
 * 
 * Sounds available:
 * - sfx_coin.ogg - Correct answer, collect item
 * - sfx_jump.ogg - Jump action
 * - sfx_hurt.ogg - Wrong answer, mistake
 * - sfx_bump.ogg - Collision
 * - sfx_gem.ogg - Special achievement
 * - sfx_select.ogg - UI click
 * - sfx_magic.ogg - Power-up
 * - sfx_disappear.ogg - Vanish
 * - sfx_throw.ogg - Launch
 * - sfx_jump-high.ogg - Big jump
 */

import { useCallback, useEffect } from 'react';

// Sound cache to avoid reloading
const soundCache: Map<string, HTMLAudioElement> = new Map();

/**
 * Preload a sound effect
 */
const preloadSound = (path: string): HTMLAudioElement => {
  if (soundCache.has(path)) {
    return soundCache.get(path)!;
  }
  
  const audio = new Audio(path);
  audio.load();
  soundCache.set(path, audio);
  return audio;
};

/**
 * Play a sound effect
 */
const playSound = (path: string, volume: number = 0.5): void => {
  try {
    const audio = preloadSound(path);
    audio.currentTime = 0;
    audio.volume = volume;
    
    // Clone for overlapping sounds
    const clone = audio.cloneNode() as HTMLAudioElement;
    clone.volume = volume;
    clone.play().catch(() => {
      // Ignore autoplay errors
    });
  } catch (error) {
    console.warn('Failed to play sound:', path, error);
  }
};

export function useKenneyAudio() {
  // Game sounds
  const playCoin = useCallback(() => {
    playSound('/assets/kenney/platformer/sounds/sfx_coin.ogg', 0.4);
  }, []);

  const playJump = useCallback(() => {
    playSound('/assets/kenney/platformer/sounds/sfx_jump.ogg', 0.3);
  }, []);

  const playHurt = useCallback(() => {
    playSound('/assets/kenney/platformer/sounds/sfx_hurt.ogg', 0.4);
  }, []);

  const playBump = useCallback(() => {
    playSound('/assets/kenney/platformer/sounds/sfx_bump.ogg', 0.3);
  }, []);

  const playGem = useCallback(() => {
    playSound('/assets/kenney/platformer/sounds/sfx_gem.ogg', 0.5);
  }, []);

  // UI sounds
  const playSelect = useCallback(() => {
    playSound('/assets/kenney/platformer/sounds/sfx_select.ogg', 0.3);
  }, []);

  const playMagic = useCallback(() => {
    playSound('/assets/kenney/platformer/sounds/sfx_magic.ogg', 0.4);
  }, []);

  const playDisappear = useCallback(() => {
    playSound('/assets/kenney/platformer/sounds/sfx_disappear.ogg', 0.3);
  }, []);

  const playThrow = useCallback(() => {
    playSound('/assets/kenney/platformer/sounds/sfx_throw.ogg', 0.3);
  }, []);

  const playJumpHigh = useCallback(() => {
    playSound('/assets/kenney/platformer/sounds/sfx_jump-high.ogg', 0.4);
  }, []);

  // Preload all sounds on mount
  useEffect(() => {
    const sounds = [
      '/assets/kenney/platformer/sounds/sfx_coin.ogg',
      '/assets/kenney/platformer/sounds/sfx_jump.ogg',
      '/assets/kenney/platformer/sounds/sfx_hurt.ogg',
      '/assets/kenney/platformer/sounds/sfx_bump.ogg',
      '/assets/kenney/platformer/sounds/sfx_gem.ogg',
      '/assets/kenney/platformer/sounds/sfx_select.ogg',
      '/assets/kenney/platformer/sounds/sfx_magic.ogg',
      '/assets/kenney/platformer/sounds/sfx_disappear.ogg',
      '/assets/kenney/platformer/sounds/sfx_throw.ogg',
      '/assets/kenney/platformer/sounds/sfx_jump-high.ogg',
    ];
    
    sounds.forEach(preloadSound);
  }, []);

  return {
    // Game sounds
    playCoin,
    playJump,
    playHurt,
    playBump,
    playGem,
    // UI sounds
    playSelect,
    playMagic,
    playDisappear,
    playThrow,
    playJumpHigh,
  };
}

export default useKenneyAudio;
