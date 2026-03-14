import { useCallback, useEffect, useRef, useState } from 'react';
import { audioManager, SoundType } from '../audioManager';

export function useAudio() {
  const [isInitialized, setIsInitialized] = useState(false);
  const initializationPromiseRef = useRef<Promise<void> | null>(null);
  const initializeResolverRef = useRef<(() => void) | null>(null);

  // Initialize on first user interaction
  useEffect(() => {
    const handleInteraction = async () => {
      if (!isInitialized) {
        try {
          audioManager.initialize();
          setIsInitialized(true);
          
          // Resolve any waiting promises
          if (initializeResolverRef.current) {
            initializeResolverRef.current();
            initializeResolverRef.current = null;
          }
        } catch (error) {
          console.warn('Failed to initialize audio context:', error);
        }
      }
    };
    
    const handleClick = () => handleInteraction();
    const handleTouchStart = () => handleInteraction();
    
    document.addEventListener('click', handleClick);
    document.addEventListener('touchstart', handleTouchStart);
    
    return () => {
      document.removeEventListener('click', handleClick);
      document.removeEventListener('touchstart', handleTouchStart);
    };
  }, [isInitialized]);

  // Wait for initialization if needed
  const waitForInitialization = useCallback(async (): Promise<void> => {
    if (isInitialized) {
      return;
    }
    
    if (!initializationPromiseRef.current) {
      initializationPromiseRef.current = new Promise<void>((resolve) => {
        initializeResolverRef.current = resolve;
      });
    }
    
    return initializationPromiseRef.current;
  }, [isInitialized]);

  const play = useCallback(async (sound: SoundType) => {
    try {
      await waitForInitialization();
      audioManager.play(sound);
    } catch (error) {
      console.warn('Failed to play sound:', error);
    }
  }, [waitForInitialization]);

  const playSuccess = useCallback(() => play('success'), [play]);
  const playError = useCallback(() => play('error'), [play]);
  const playClick = useCallback(() => play('click'), [play]);
  const playHover = useCallback(() => play('hover'), [play]);
  const playCelebration = useCallback(() => play('celebration'), [play]);
  const playLevelUp = useCallback(() => play('levelUp'), [play]);
  const playBounce = useCallback(() => play('bounce'), [play]);
  const playPop = useCallback(() => play('pop'), [play]);
  const playMunch = useCallback(() => play('munch'), [play]);
  const playChirp = useCallback(() => play('chirp'), [play]);
  const playFanfare = useCallback(() => play('fanfare'), [play]);
  const playFlip = useCallback(() => play('flip'), [play]);
  const playShake = useCallback(() => play('shake'), [play]);

  const setVolume = useCallback((volume: number) => {
    audioManager.setSFXVolume(volume);
  }, []);

  const toggleMute = useCallback(() => {
    audioManager.toggleMute();
  }, []);

  const isMuted = useCallback(() => audioManager.isMuted(), []);

  return {
    play,
    playSuccess,
    playError,
    playClick,
    playHover,
    playCelebration,
    playLevelUp,
    playBounce,
    playPop,
    playMunch,
    playChirp,
    playFanfare,
    playFlip,
    playShake,
    setVolume,
    toggleMute,
    isMuted,
  };
}
