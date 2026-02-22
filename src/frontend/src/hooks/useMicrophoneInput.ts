/**
 * useMicrophoneInput Hook
 * 
 * Experimental hook for microphone-based game input.
 * Supports blow detection, volume tracking, and basic pitch detection.
 * 
 * Usage:
 * ```tsx
 * const { isActive, volume, isBlowing, start, stop } = useMicrophoneInput({
 *   onBlow: () => console.log('User blew!'),
 *   blowThreshold: 0.3,
 * });
 * ```
 * 
 * Research: docs/research/INPUT_METHODS_RESEARCH.md
 */

import { useCallback, useEffect, useRef, useState } from 'react';

export interface MicrophoneInputOptions {
  /** Called when blow is detected */
  onBlow?: () => void;
  /** Called with volume level (0-1) on each frame */
  onVolume?: (volume: number) => void;
  /** Blow detection threshold (0-1) */
  blowThreshold?: number;
  /** Minimum duration (ms) to trigger blow */
  minBlowDuration?: number;
  /** Cooldown between blows (ms) */
  cooldown?: number;
}

export interface MicrophoneInputState {
  isActive: boolean;
  volume: number;
  isBlowing: boolean;
  error: string | null;
}

export function useMicrophoneInput(options: MicrophoneInputOptions = {}) {
  const {
    onBlow,
    onVolume,
    blowThreshold = 0.3,
    minBlowDuration = 200,
    cooldown = 500,
  } = options;

  const [state, setState] = useState<MicrophoneInputState>({
    isActive: false,
    volume: 0,
    isBlowing: false,
    error: null,
  });

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const blowStartTimeRef = useRef<number | null>(null);
  const lastBlowTimeRef = useRef<number>(0);

  const analyze = useCallback(() => {
    if (!analyserRef.current) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);

    // Calculate average volume
    const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
    const normalizedVolume = Math.min(1, average / 128);

    setState(prev => ({ ...prev, volume: normalizedVolume }));
    onVolume?.(normalizedVolume);

    // Detect blow (high volume in low frequencies)
    const isCurrentlyBlowing = normalizedVolume > blowThreshold;
    const now = Date.now();

    if (isCurrentlyBlowing && !state.isBlowing) {
      // Blow started
      blowStartTimeRef.current = now;
      setState(prev => ({ ...prev, isBlowing: true }));
    } else if (!isCurrentlyBlowing && state.isBlowing) {
      // Blow ended
      const blowDuration = blowStartTimeRef.current 
        ? now - blowStartTimeRef.current 
        : 0;
      
      if (blowDuration >= minBlowDuration && 
          now - lastBlowTimeRef.current > cooldown) {
        onBlow?.();
        lastBlowTimeRef.current = now;
      }
      
      blowStartTimeRef.current = null;
      setState(prev => ({ ...prev, isBlowing: false }));
    }

    animationFrameRef.current = requestAnimationFrame(analyze);
  }, [blowThreshold, cooldown, minBlowDuration, onBlow, onVolume, state.isBlowing]);

  const start = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        }
      });
      streamRef.current = stream;

      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      analyserRef.current.smoothingTimeConstant = 0.8;
      
      source.connect(analyserRef.current);

      setState({ isActive: true, volume: 0, isBlowing: false, error: null });
      analyze();
    } catch (err) {
      setState(prev => ({ 
        ...prev, 
        error: err instanceof Error ? err.message : 'Failed to access microphone'
      }));
    }
  }, [analyze]);

  const stop = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    analyserRef.current = null;
    setState({ isActive: false, volume: 0, isBlowing: false, error: null });
  }, []);

  useEffect(() => {
    return () => stop();
  }, [stop]);

  return {
    ...state,
    start,
    stop,
  };
}

export default useMicrophoneInput;
