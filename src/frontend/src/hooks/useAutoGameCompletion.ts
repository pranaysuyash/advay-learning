import { useCallback, useEffect, useRef } from 'react';
import { useGameCompletion, type GameCompletionOptions } from './useGameCompletion';

interface UseAutoGameCompletionOptions extends GameCompletionOptions {
  when: boolean;
}

export function useAutoGameCompletion(
  gameId: string,
  { when, ...options }: UseAutoGameCompletionOptions,
) {
  const { completeGame } = useGameCompletion(gameId);
  const completedRef = useRef(false);

  useEffect(() => {
    if (!when || completedRef.current) {
      return;
    }

    completedRef.current = true;
    void completeGame(options);
  }, [when, completeGame, options]);

  const resetAutoCompletion = useCallback(() => {
    completedRef.current = false;
  }, []);

  return {
    resetAutoCompletion,
  };
}

export default useAutoGameCompletion;
