import { useCallback, useRef } from 'react';
import { useInventoryStore } from '../store';
import { getGameManifest, getRegistryEasterEggs } from '../data/gameRegistry';
import { rollDrops } from '../data/collectibles';
import type { ItemDrop } from '../store';

/**
 * Hook for integrating the item drop system into any game.
 *
 * Usage in a game component:
 * ```tsx
 * const { onGameComplete, triggerEasterEgg } = useGameDrops('chemistry-lab');
 *
 * // Call when the player finishes a round/level:
 * const drops = onGameComplete(score);  // score is 0-100
 *
 * // Call when an easter egg condition is met:
 * triggerEasterEgg('egg-gold-reaction');
 * ```
 *
 * That's it. Drops are rolled automatically from the game's manifest,
 * items are added to inventory, and the toast notification appears.
 */
export function useGameDrops(gameId: string) {
  const processGameCompletion = useInventoryStore((s) => s.processGameCompletion);
  const findEasterEgg = useInventoryStore((s) => s.findEasterEgg);
  const hasFoundEasterEgg = useInventoryStore((s) => s.hasFoundEasterEgg);

  // Prevent double-processing in React StrictMode
  const lastProcessedRef = useRef<number>(0);

  const onGameComplete = useCallback(
    (score?: number): ItemDrop[] => {
      const now = Date.now();
      if (now - lastProcessedRef.current < 1000) return [];
      lastProcessedRef.current = now;

      return processGameCompletion(gameId, score);
    },
    [gameId, processGameCompletion]
  );

  const triggerEasterEgg = useCallback(
    (eggId: string): ItemDrop | null => {
      if (hasFoundEasterEgg(eggId)) return null;

      // Verify this egg belongs to this game
      const gameEggs = getRegistryEasterEggs(gameId);
      if (!gameEggs.some((e) => e.id === eggId)) {
        console.warn(`Easter egg "${eggId}" not registered for game "${gameId}"`);
        return null;
      }

      return findEasterEgg(eggId);
    },
    [gameId, findEasterEgg, hasFoundEasterEgg]
  );

  const isEggFound = useCallback(
    (eggId: string): boolean => hasFoundEasterEgg(eggId),
    [hasFoundEasterEgg]
  );

  return {
    onGameComplete,
    triggerEasterEgg,
    isEggFound,
  };
}
