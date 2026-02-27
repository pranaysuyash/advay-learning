import type { Rarity } from '../data/collectibles';

export type ItemIconManifest = Record<string, string>;
export type VisualTier = 'normal' | 'special' | 'magical';

const FALLBACK_ITEM_ICON_MANIFEST: ItemIconManifest = {
  'shape-star': '/assets/items/icons/star.png',
  'shape-circle': '/assets/items/icons/coin_silver.png',
  'shape-triangle': '/assets/items/icons/block_yellow.png',
  'shape-square': '/assets/items/icons/block_blue.png',
  'shape-heart': '/assets/items/icons/heart.png',
  'shape-diamond': '/assets/items/icons/gem_blue.png',
  'color-red': '/assets/items/icons/gem_red.png',
  'color-blue': '/assets/items/icons/gem_blue.png',
  'color-yellow': '/assets/items/icons/gem_yellow.png',
  'color-green': '/assets/items/icons/gem_green.png',
  'color-rainbow': '/assets/items/icons/star.png',
  'material-water': '/assets/items/icons/water.png',
  'material-lava': '/assets/items/icons/lava.png',
  'material-ice': '/assets/items/icons/gem_blue.png',
  'material-crystal': '/assets/items/icons/gem_yellow.png',
  'material-mud': '/assets/items/icons/block_green.png',
  'tool-paintbrush': '/assets/items/icons/key_blue.png',
  'tool-magnifier': '/assets/items/icons/key_green.png',
  'tool-wand': '/assets/items/icons/key_yellow.png',
  'artifact-first-word': '/assets/items/icons/coin_bronze.png',
  'artifact-periodic-key': '/assets/items/icons/key_blue.png',
  'artifact-melody': '/assets/items/icons/coin_silver.png',
  'artifact-constellation': '/assets/items/icons/star.png',
  'food-cookie': '/assets/items/icons/coin_bronze.png',
  'food-apple': '/assets/items/icons/mushroom_red.png',
  'food-pizza': '/assets/items/icons/block_yellow.png',
  'food-icecream': '/assets/items/icons/gem_blue.png',
  'food-cake': '/assets/items/icons/gem_yellow.png',
  'note-do': '/assets/items/icons/coin_gold.png',
  'note-re': '/assets/items/icons/coin_silver.png',
  'note-mi': '/assets/items/icons/coin_bronze.png',
  'note-fa': '/assets/items/icons/star.png',
};

let runtimeManifest: ItemIconManifest = { ...FALLBACK_ITEM_ICON_MANIFEST };
let preloadPromise: Promise<void> | null = null;

export async function preloadItemsManifest(): Promise<void> {
  if (preloadPromise) return preloadPromise;

  preloadPromise = fetch('/assets/items/manifest.json')
    .then(async (response) => {
      if (!response.ok) return;
      const manifest = (await response.json()) as ItemIconManifest;
      runtimeManifest = { ...runtimeManifest, ...manifest };
    })
    .catch(() => {
      // Keep fallback mapping if manifest fetch fails.
    });

  return preloadPromise;
}

export function getItemIconPath(itemId: string, fallback?: string): string | undefined {
  return runtimeManifest[itemId] ?? fallback;
}

export function getVisualTierFromRarity(rarity: Rarity): VisualTier {
  switch (rarity) {
    case 'common':
    case 'uncommon':
      return 'normal';
    case 'rare':
      return 'special';
    case 'epic':
    case 'legendary':
      return 'magical';
    default:
      return 'normal';
  }
}
