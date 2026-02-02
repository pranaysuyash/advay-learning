import { useCallback, useRef, useEffect } from 'react';
import { useSettingsStore } from '../store';

/**
 * Sound effects hook using Web Audio API
 * Generates sounds programmatically - no audio files needed
 */
export function useSoundEffects() {
  const audioContextRef = useRef<AudioContext | null>(null);
  const soundEnabled = useSettingsStore((state) => state.soundEnabled);
  
  // Initialize AudioContext on first interaction
  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      const AC = (window as any).AudioContext || (window as any).webkitAudioContext;
      if (typeof AC !== 'function') {
        // Not supported in this environment (e.g., JSDOM)
        return null as unknown as AudioContext;
      }
      try {
        audioContextRef.current = new AC();
      } catch (e) {
        console.warn('AudioContext initialization failed:', e);
        return null as unknown as AudioContext;
      }
    }
    return audioContextRef.current;
  }, []);
  
  // Resume context if suspended (browser autoplay policy)
  const ensureContextResumed = useCallback(async () => {
    const ctx = getAudioContext();
    if (!ctx) return null;
    if (ctx.state === 'suspended') {
      try {
        await ctx.resume();
      } catch (e) {
        console.warn('Failed to resume audio context:', e);
        return null;
      }
    }
    return ctx;
  }, [getAudioContext]);
  
  // Play a tone with envelope
  const playTone = useCallback(async (
    frequency: number,
    duration: number,
    type: OscillatorType = 'sine',
    volume: number = 0.3
  ) => {
    if (!soundEnabled) return;
    
    try {
      const ctx = await ensureContextResumed();
      if (!ctx) return;
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
      
      // Envelope: quick attack, decay to sustain, release
      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
      
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + duration);
    } catch (e) {
      console.warn('Sound playback failed:', e);
    }
  }, [soundEnabled, ensureContextResumed]);
  
  // Success chime - happy ascending tones
  const playSuccess = useCallback(async () => {
    if (!soundEnabled) return;
    
    try {
      const ctx = await ensureContextResumed();
      if (!ctx) return;
      const notes = [523.25, 659.25, 783.99]; // C5, E5, G5 (major chord)
      
      notes.forEach((freq, i) => {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(freq, ctx.currentTime);
        
        const startTime = ctx.currentTime + i * 0.1;
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(0.2, startTime + 0.02);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);
        
        oscillator.start(startTime);
        oscillator.stop(startTime + 0.3);
      });
    } catch (e) {
      console.warn('Success sound failed:', e);
    }
  }, [soundEnabled, ensureContextResumed]);
  
  // Pop sound - soft bubble pop
  const playPop = useCallback(async () => {
    await playTone(400, 0.1, 'sine', 0.15);
  }, [playTone]);
  
  // Error sound - low buzz
  const playError = useCallback(async () => {
    await playTone(200, 0.2, 'sawtooth', 0.15);
  }, [playTone]);
  
  // Click sound - subtle tap
  const playClick = useCallback(async () => {
    await playTone(800, 0.05, 'sine', 0.1);
  }, [playTone]);
  
  // Celebration fanfare - triumphant sequence
  const playCelebration = useCallback(async () => {
    if (!soundEnabled) return;
    
    try {
      const ctx = await ensureContextResumed();
      if (!ctx) return;
      // Fanfare: G4, C5, E5, G5 (up), then G5, E5, C5, G4 (down)
      const notes = [
        { freq: 392.00, time: 0, dur: 0.15 },     // G4
        { freq: 523.25, time: 0.12, dur: 0.15 },  // C5
        { freq: 659.25, time: 0.24, dur: 0.15 },  // E5
        { freq: 783.99, time: 0.36, dur: 0.4 },   // G5 (hold)
      ];
      
      notes.forEach(({ freq, time, dur }) => {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(freq, ctx.currentTime);
        
        const startTime = ctx.currentTime + time;
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(0.25, startTime + 0.02);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + dur);
        
        oscillator.start(startTime);
        oscillator.stop(startTime + dur);
      });
    } catch (e) {
      console.warn('Celebration sound failed:', e);
    }
  }, [soundEnabled, ensureContextResumed]);
  
  // Start sound - gentle "ready" tone
  const playStart = useCallback(async () => {
    await playTone(440, 0.15, 'sine', 0.2);
  }, [playTone]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);
  
  return {
    playSuccess,
    playPop,
    playError,
    playClick,
    playCelebration,
    playStart,
    isMuted: !soundEnabled,
  };
}

export default useSoundEffects;
