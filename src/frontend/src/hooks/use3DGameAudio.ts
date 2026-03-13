/**
 * use3DGameAudio Hook
 * 
 * Audio management for 3D games using Kenney audio assets.
 * Provides spatial audio, background music, and SFX.
 * 
 * @see docs/THREEJS_IMPLEMENTATION_GUIDE.md
 */

import { useCallback, useRef, useEffect } from 'react';

interface AudioMap {
  [key: string]: HTMLAudioElement;
}

interface Use3DGameAudioReturn {
  /** Play a sound effect */
  playSFX: (name: string, volume?: number) => void;
  /** Play background music (looped) */
  playBGM: (name: string, volume?: number) => void;
  /** Stop background music */
  stopBGM: () => void;
  /** Play spatial audio at position */
  playSpatial: (name: string, x: number, y: number, z: number, volume?: number) => void;
  /** Preload audio files */
  preload: (names: string[]) => Promise<void>;
  /** Set master volume */
  setMasterVolume: (volume: number) => void;
  /** Mute/unmute all audio */
  setMuted: (muted: boolean) => void;
}

const AUDIO_BASE_PATH = '/assets/kenney/audio/';

// Kenney audio asset mapping
export const AUDIO_ASSETS = {
  // UI Sounds
  click: 'interface/click.ogg',
  hover: 'interface/hover.ogg',
  success: 'interface/success.ogg',
  error: 'interface/error.ogg',
  
  // Game Sounds
  blockPlace: 'impact/footstep_wood_000.ogg',
  blockFall: 'impact/footstep_wood_004.ogg',
  pop: 'digital/pop_000.ogg',
  coin: 'digital/coin_000.ogg',
  jump: 'movement/jump_000.ogg',
  land: 'movement/land_000.ogg',
  
  // Food/Eating
  eat: 'movement/eat_000.ogg',
  crunch: 'impact/crunch_000.ogg',
  
  // Weather
  rain: 'weather/rain.ogg',
  wind: 'weather/wind.ogg',
  
  // Feedback
  win: 'jingles/win.ogg',
  lose: 'jingles/lose.ogg',
  levelUp: 'jingles/levelup.ogg',
} as const;

export function use3DGameAudio(): Use3DGameAudioReturn {
  const audioCache = useRef<AudioMap>({});
  const bgmRef = useRef<HTMLAudioElement | null>(null);
  const masterVolumeRef = useRef(1);
  const mutedRef = useRef(false);

  // Get or create audio element
  const getAudio = useCallback((name: string): HTMLAudioElement => {
    const path = AUDIO_ASSETS[name as keyof typeof AUDIO_ASSETS] || name;
    const fullPath = `${AUDIO_BASE_PATH}${path}`;
    
    if (!audioCache.current[fullPath]) {
      const audio = new Audio(fullPath);
      audio.preload = 'auto';
      audioCache.current[fullPath] = audio;
    }
    
    return audioCache.current[fullPath];
  }, []);

  // Play sound effect
  const playSFX = useCallback((name: string, volume = 1) => {
    if (mutedRef.current) return;
    
    try {
      const audio = getAudio(name);
      audio.volume = volume * masterVolumeRef.current;
      audio.currentTime = 0;
      audio.play().catch(() => {
        // Audio play failed (probably user interaction needed)
      });
    } catch (error) {
      console.warn(`[use3DGameAudio] Failed to play ${name}:`, error);
    }
  }, [getAudio]);

  // Play background music
  const playBGM = useCallback((name: string, volume = 0.5) => {
    if (mutedRef.current) return;
    
    try {
      // Stop current BGM
      if (bgmRef.current) {
        bgmRef.current.pause();
        bgmRef.current.currentTime = 0;
      }
      
      const audio = getAudio(name);
      audio.loop = true;
      audio.volume = volume * masterVolumeRef.current;
      audio.play().catch(() => {
        // Autoplay prevented
      });
      
      bgmRef.current = audio;
    } catch (error) {
      console.warn(`[use3DGameAudio] Failed to play BGM ${name}:`, error);
    }
  }, [getAudio]);

  // Stop background music
  const stopBGM = useCallback(() => {
    if (bgmRef.current) {
      bgmRef.current.pause();
      bgmRef.current.currentTime = 0;
      bgmRef.current = null;
    }
  }, []);

  // Play spatial audio (simplified - just adjusts volume based on distance)
  const playSpatial = useCallback((name: string, x: number, y: number, z: number, volume = 1) => {
    if (mutedRef.current) return;
    
    // Calculate distance-based volume (simplified)
    const distance = Math.sqrt(x * x + y * y + z * z);
    const maxDistance = 10;
    const spatialVolume = Math.max(0, 1 - distance / maxDistance) * volume;
    
    playSFX(name, spatialVolume);
  }, [playSFX]);

  // Preload audio files
  const preload = useCallback(async (names: string[]) => {
    const promises = names.map(name => {
      return new Promise<void>((resolve) => {
        try {
          const audio = getAudio(name);
          audio.addEventListener('canplaythrough', () => resolve(), { once: true });
          audio.addEventListener('error', () => resolve(), { once: true });
          
          // Timeout after 5 seconds
          setTimeout(resolve, 5000);
        } catch {
          resolve();
        }
      });
    });
    
    await Promise.all(promises);
  }, [getAudio]);

  // Set master volume
  const setMasterVolume = useCallback((volume: number) => {
    masterVolumeRef.current = Math.max(0, Math.min(1, volume));
    
    // Update all playing audio
    Object.values(audioCache.current).forEach(audio => {
      audio.volume = masterVolumeRef.current;
    });
  }, []);

  // Set muted
  const setMuted = useCallback((muted: boolean) => {
    mutedRef.current = muted;
    
    if (muted) {
      Object.values(audioCache.current).forEach(audio => {
        audio.pause();
      });
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopBGM();
      Object.values(audioCache.current).forEach(audio => {
        audio.pause();
        audio.currentTime = 0;
      });
    };
  }, [stopBGM]);

  return {
    playSFX,
    playBGM,
    stopBGM,
    playSpatial,
    preload,
    setMasterVolume,
    setMuted,
  };
}

export default use3DGameAudio;
