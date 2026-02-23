import { useCallback, useEffect } from 'react';
import { audioManager, SoundType } from '../audioManager';

export function useAudio() {
  // Initialize on mount - resume context on first interaction
  useEffect(() => {
    const handleInteraction = () => {
      audioManager.initialize();
    };
    
    document.addEventListener('click', handleInteraction, { once: true });
    document.addEventListener('touchstart', handleInteraction, { once: true });
    
    return () => {
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('touchstart', handleInteraction);
    };
  }, []);

  const play = useCallback((sound: SoundType) => {
    audioManager.play(sound);
  }, []);

  const playSuccess = useCallback(() => audioManager.play('success'), []);
  const playError = useCallback(() => audioManager.play('error'), []);
  const playClick = useCallback(() => audioManager.play('click'), []);
  const playHover = useCallback(() => audioManager.play('hover'), []);
  const playCelebration = useCallback(() => audioManager.play('celebration'), []);
  const playLevelUp = useCallback(() => audioManager.play('levelUp'), []);
  const playBounce = useCallback(() => audioManager.play('bounce'), []);
  const playPop = useCallback(() => audioManager.play('pop'), []);
  const playMunch = useCallback(() => audioManager.play('munch'), []);
  const playChirp = useCallback(() => audioManager.play('chirp'), []);
  const playFanfare = useCallback(() => audioManager.play('fanfare'), []);
  const playFlip = useCallback(() => audioManager.play('flip'), []);
  const playShake = useCallback(() => audioManager.play('shake'), []);

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
