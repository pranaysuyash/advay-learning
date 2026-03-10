/**
 * Kenney Asset Registry
 * 
 * Central registry for all Kenney assets in the project.
 * Provides type-safe access to assets and utilities for discovery.
 * 
 * @version 1.0
 * @see docs/audit/KENNEY_ASSET_AUDIT_COMPLETE.md
 */

// ============================================================================
// TYPES
// ============================================================================

export type AssetCategory = 
  | 'character' 
  | 'enemy' 
  | 'collectible' 
  | 'hud' 
  | 'tile' 
  | 'background' 
  | 'sound' 
  | 'ui';

export type CharacterColor = 'beige' | 'green' | 'pink' | 'purple' | 'yellow';

export type CharacterAnimation = 
  | 'idle' 
  | 'walk' 
  | 'jump' 
  | 'duck' 
  | 'hit' 
  | 'climb' 
  | 'front';

export type EnemyType = 
  | 'barnacle' 
  | 'bee' 
  | 'block' 
  | 'fish_blue' 
  | 'fish_purple' 
  | 'fish_yellow'
  | 'fly'
  | 'frog'
  | 'ladybug'
  | 'mouse'
  | 'saw'
  | 'slime_block'
  | 'slime_fire'
  | 'slime_normal'
  | 'slime_spike'
  | 'snail'
  | 'worm_normal'
  | 'worm_ring';

export interface AssetInfo {
  id: string;
  path: string;
  category: AssetCategory;
  description: string;
  used: boolean;
  usageLocations: string[];
  tags: string[];
}

export interface CharacterAssetSet {
  color: CharacterColor;
  name: string;
  hexColor: string;
  animations: Record<CharacterAnimation, string[]>;
}

// ============================================================================
// CONSTANTS
// ============================================================================

export const BASE_PATH = '/assets/kenney/platformer';

export const CHARACTER_COLORS: Record<CharacterColor, { name: string; hex: string }> = {
  beige: { name: 'Sandy', hex: '#D4A574' },
  green: { name: 'Lime', hex: '#7CB342' },
  pink: { name: 'Rosy', hex: '#F06292' },
  purple: { name: 'Grape', hex: '#BA68C8' },
  yellow: { name: 'Sunny', hex: '#FDD835' },
};

// ============================================================================
// ASSET REGISTRY
// ============================================================================

/**
 * Complete registry of all Kenney runtime assets
 */
export const KENNEY_ASSETS: AssetInfo[] = [
  // Collectibles
  {
    id: 'collectible_coin',
    path: `${BASE_PATH}/collectibles/coin_gold.png`,
    category: 'collectible',
    description: 'Gold coin for currency/rewards',
    used: true,
    usageLocations: ['ShapePop', 'CountingCollectathon', 'tests'],
    tags: ['currency', 'reward', 'gold', 'collectible'],
  },
  {
    id: 'collectible_gem',
    path: `${BASE_PATH}/collectibles/gem_blue.png`,
    category: 'collectible',
    description: 'Blue gem for premium rewards',
    used: true,
    usageLocations: ['ShapePop', 'ItemDropToast'],
    tags: ['currency', 'reward', 'premium', 'blue', 'collectible'],
  },
  {
    id: 'collectible_star',
    path: `${BASE_PATH}/collectibles/star.png`,
    category: 'collectible',
    description: 'Star for achievements and scoring',
    used: true,
    usageLocations: [
      'AirGuitarHero', 'AnimalSounds', 'BodyParts', 'ColorSortGame',
      'NumberBubblePop', 'OddOneOut', 'PopTheNumber', 'ShapePop',
      'WeatherMatch'
    ],
    tags: ['achievement', 'score', 'star', 'collectible'],
  },

  // HUD - Hearts (Most used assets)
  {
    id: 'hud_heart_full',
    path: `${BASE_PATH}/hud/hud_heart.png`,
    category: 'hud',
    description: 'Full heart for lives system',
    used: true,
    usageLocations: [
      'AirGuitarHero', 'AnimalSounds', 'AlphabetGame', 'BeginningSounds',
      'BodyParts', 'BubblePop', 'ColorByNumber', 'ColorMatchGarden',
      'ColorSortGame', 'ConnectTheDots', 'CountingObjects', 'EmojiMatch',
      'FractionPizza', 'LetterHunt', 'MathMonsters', 'MemoryMatch',
      'MoneyMatch', 'MoreOrLess', 'NumberBubblePop', 'NumberSequence',
      'OddOneOut', 'PatternPlay', 'PopTheNumber', 'RhymeTime',
      'ShapeSafari', 'SimonSays', 'SizeSorting', 'SyllableClap',
      'WeatherMatch', 'WordBuilder'
    ],
    tags: ['hud', 'lives', 'health', 'heart', 'ui'],
  },
  {
    id: 'hud_heart_half',
    path: `${BASE_PATH}/hud/hud_heart_half.png`,
    category: 'hud',
    description: 'Half heart for lives system',
    used: false,
    usageLocations: [],
    tags: ['hud', 'lives', 'health', 'heart', 'ui'],
  },
  {
    id: 'hud_heart_empty',
    path: `${BASE_PATH}/hud/hud_heart_empty.png`,
    category: 'hud',
    description: 'Empty heart for lives system',
    used: true,
    usageLocations: [
      'AirGuitarHero', 'AnimalSounds', 'AlphabetGame', 'BeginningSounds',
      'BodyParts', 'BubblePop', 'ColorByNumber', 'ColorMatchGarden',
      'ColorSortGame', 'ConnectTheDots', 'CountingObjects', 'EmojiMatch',
      'FractionPizza', 'LetterHunt', 'MathMonsters', 'MemoryMatch',
      'MoneyMatch', 'MoreOrLess', 'NumberBubblePop', 'NumberSequence',
      'OddOneOut', 'PatternPlay', 'PopTheNumber', 'RhymeTime',
      'ShapeSafari', 'SimonSays', 'SizeSorting', 'SyllableClap',
      'WeatherMatch', 'WordBuilder'
    ],
    tags: ['hud', 'lives', 'health', 'heart', 'ui'],
  },

  // HUD - Keys
  ...(['blue', 'green', 'red', 'yellow'] as const).flatMap((color): AssetInfo[] => [
    {
      id: `hud_key_${color}`,
      path: `${BASE_PATH}/hud/hud_key_${color}.png`,
      category: 'hud' as const,
      description: `${color} key icon`,
      used: false,
      usageLocations: [],
      tags: ['hud', 'key', color, 'ui', 'inventory'],
    },
    {
      id: `hud_lock_${color}`,
      path: `${BASE_PATH}/tiles/lock_${color}.png`,
      category: 'hud' as const,
      description: `${color} lock icon`,
      used: false,
      usageLocations: [],
      tags: ['hud', 'lock', color, 'ui', 'locked'],
    },
  ]),

  // HUD - Player Icons
  ...(['beige', 'green', 'pink', 'purple', 'yellow'] as const).flatMap((color): AssetInfo[] => [
    {
      id: `hud_player_${color}`,
      path: `${BASE_PATH}/tiles/hud_player_${color}.png`,
      category: 'hud' as const,
      description: `${CHARACTER_COLORS[color].name} player icon`,
      used: false,
      usageLocations: [],
      tags: ['hud', 'player', color, 'ui', 'avatar'],
    },
    {
      id: `hud_player_helmet_${color}`,
      path: `${BASE_PATH}/tiles/hud_player_helmet_${color}.png`,
      category: 'hud' as const,
      description: `${CHARACTER_COLORS[color].name} player with helmet`,
      used: false,
      usageLocations: [],
      tags: ['hud', 'player', color, 'helmet', 'ui'],
    },
  ]),

  // HUD - Numbers
  ...Array.from({ length: 10 }, (_, i): AssetInfo => ({
    id: `hud_number_${i}`,
    path: `${BASE_PATH}/tiles/hud_character_${i}.png`,
    category: 'hud' as const,
    description: `Number ${i} for HUD display`,
    used: false,
    usageLocations: [],
    tags: ['hud', 'number', 'digit', `${i}`, 'ui'],
  })),

  // HUD - Symbols
  {
    id: 'hud_multiply',
    path: `${BASE_PATH}/tiles/hud_character_multiply.png`,
    category: 'hud',
    description: 'Multiplication symbol',
    used: false,
    usageLocations: [],
    tags: ['hud', 'math', 'multiply', 'symbol'],
  },
  {
    id: 'hud_percent',
    path: `${BASE_PATH}/tiles/hud_character_percent.png`,
    category: 'hud',
    description: 'Percent symbol',
    used: false,
    usageLocations: [],
    tags: ['hud', 'math', 'percent', 'symbol'],
  },
  {
    id: 'hud_coin',
    path: `${BASE_PATH}/tiles/hud_coin.png`,
    category: 'hud',
    description: 'Coin icon for currency display',
    used: false,
    usageLocations: [],
    tags: ['hud', 'currency', 'coin', 'ui'],
  },
];

// ============================================================================
// CHARACTER ASSETS
// ============================================================================

/**
 * Generate character asset paths dynamically
 */
export function getCharacterAsset(
  color: CharacterColor,
  animation: CharacterAnimation,
  frame?: number
): string {
  const base = `${BASE_PATH}/characters/character_${color}`;
  
  switch (animation) {
    case 'idle':
      return `${base}_idle.png`;
    case 'walk':
      return frame === 1 ? `${base}_walk_a.png` : `${base}_walk_b.png`;
    case 'jump':
      return `${base}_jump.png`;
    case 'duck':
      return `${base}_duck.png`;
    case 'hit':
      return `${base}_hit.png`;
    case 'climb':
      return frame === 1 ? `${base}_climb_a.png` : `${base}_climb_b.png`;
    case 'front':
      return `${base}_front.png`;
    default:
      return `${base}_idle.png`;
  }
}

/**
 * Complete character asset sets
 */
export const CHARACTER_ASSETS: CharacterAssetSet[] = 
  (Object.keys(CHARACTER_COLORS) as CharacterColor[]).map(color => ({
    color,
    name: CHARACTER_COLORS[color].name,
    hexColor: CHARACTER_COLORS[color].hex,
    animations: {
      idle: [getCharacterAsset(color, 'idle')],
      walk: [getCharacterAsset(color, 'walk', 1), getCharacterAsset(color, 'walk', 2)],
      jump: [getCharacterAsset(color, 'jump')],
      duck: [getCharacterAsset(color, 'duck')],
      hit: [getCharacterAsset(color, 'hit')],
      climb: [getCharacterAsset(color, 'climb', 1), getCharacterAsset(color, 'climb', 2)],
      front: [getCharacterAsset(color, 'front')],
    },
  }));

// ============================================================================
// ENEMY ASSETS
// ============================================================================

export const ENEMY_ASSETS: Record<EnemyType, { name: string; frames: string[] }> = {
  barnacle: {
    name: 'Barnacle',
    frames: ['attack_a', 'attack_b', 'attack_rest'].map(f => 
      `${BASE_PATH}/enemies/barnacle_${f}.png`),
  },
  bee: {
    name: 'Bee',
    frames: ['a', 'b', 'rest'].map(f => `${BASE_PATH}/enemies/bee_${f}.png`),
  },
  block: {
    name: 'Block',
    frames: ['fall', 'idle', 'rest'].map(f => `${BASE_PATH}/enemies/block_${f}.png`),
  },
  fish_blue: {
    name: 'Blue Fish',
    frames: ['rest', 'swim_a', 'swim_b'].map(f => `${BASE_PATH}/enemies/fish_blue_${f}.png`),
  },
  fish_purple: {
    name: 'Purple Fish',
    frames: ['down', 'rest', 'up'].map(f => `${BASE_PATH}/enemies/fish_purple_${f}.png`),
  },
  fish_yellow: {
    name: 'Yellow Fish',
    frames: ['rest', 'swim_a', 'swim_b'].map(f => `${BASE_PATH}/enemies/fish_yellow_${f}.png`),
  },
  fly: {
    name: 'Fly',
    frames: ['a', 'b', 'rest'].map(f => `${BASE_PATH}/enemies/fly_${f}.png`),
  },
  frog: {
    name: 'Frog',
    frames: ['idle', 'jump', 'rest'].map(f => `${BASE_PATH}/enemies/frog_${f}.png`),
  },
  ladybug: {
    name: 'Ladybug',
    frames: ['fly', 'rest', 'walk_a', 'walk_b'].map(f => `${BASE_PATH}/enemies/ladybug_${f}.png`),
  },
  mouse: {
    name: 'Mouse',
    frames: ['rest', 'walk_a', 'walk_b'].map(f => `${BASE_PATH}/enemies/mouse_${f}.png`),
  },
  saw: {
    name: 'Saw',
    frames: ['a', 'b', 'rest'].map(f => `${BASE_PATH}/enemies/saw_${f}.png`),
  },
  slime_block: {
    name: 'Block Slime',
    frames: ['jump', 'rest', 'walk_a', 'walk_b'].map(f => 
      `${BASE_PATH}/enemies/slime_block_${f}.png`),
  },
  slime_fire: {
    name: 'Fire Slime',
    frames: ['flat', 'rest', 'walk_a', 'walk_b'].map(f => 
      `${BASE_PATH}/enemies/slime_fire_${f}.png`),
  },
  slime_normal: {
    name: 'Normal Slime',
    frames: ['flat', 'rest', 'walk_a', 'walk_b'].map(f => 
      `${BASE_PATH}/enemies/slime_normal_${f}.png`),
  },
  slime_spike: {
    name: 'Spike Slime',
    frames: ['flat', 'rest', 'walk_a', 'walk_b'].map(f => 
      `${BASE_PATH}/enemies/slime_spike_${f}.png`),
  },
  snail: {
    name: 'Snail',
    frames: ['rest', 'shell', 'walk_a', 'walk_b'].map(f => `${BASE_PATH}/enemies/snail_${f}.png`),
  },
  worm_normal: {
    name: 'Normal Worm',
    frames: ['move_a', 'move_b', 'rest'].map(f => `${BASE_PATH}/enemies/worm_normal_${f}.png`),
  },
  worm_ring: {
    name: 'Ring Worm',
    frames: ['move_a', 'move_b', 'rest'].map(f => `${BASE_PATH}/enemies/worm_ring_${f}.png`),
  },
};

// ============================================================================
// SOUND ASSETS
// ============================================================================

export const SOUND_ASSETS = {
  coin: { path: `${BASE_PATH}/sounds/sfx_coin.ogg`, description: 'Correct answer, collect item' },
  jump: { path: `${BASE_PATH}/sounds/sfx_jump.ogg`, description: 'Jump action' },
  hurt: { path: `${BASE_PATH}/sounds/sfx_hurt.ogg`, description: 'Wrong answer, mistake' },
  bump: { path: `${BASE_PATH}/sounds/sfx_bump.ogg`, description: 'Collision' },
  gem: { path: `${BASE_PATH}/sounds/sfx_gem.ogg`, description: 'Special achievement' },
  select: { path: `${BASE_PATH}/sounds/sfx_select.ogg`, description: 'UI click' },
  magic: { path: `${BASE_PATH}/sounds/sfx_magic.ogg`, description: 'Power-up' },
  disappear: { path: `${BASE_PATH}/sounds/sfx_disappear.ogg`, description: 'Vanish effect' },
  throw: { path: `${BASE_PATH}/sounds/sfx_throw.ogg`, description: 'Launch action' },
  jumpHigh: { path: `${BASE_PATH}/sounds/sfx_jump-high.ogg`, description: 'Big jump' },
} as const;

export type SoundAssetId = keyof typeof SOUND_ASSETS;

// ============================================================================
// BACKGROUND ASSETS
// ============================================================================

export const BACKGROUND_ASSETS = {
  // Color backgrounds
  colorDesert: `${BASE_PATH}/backgrounds/background_color_desert.png`,
  colorHills: `${BASE_PATH}/backgrounds/background_color_hills.png`,
  colorMushrooms: `${BASE_PATH}/backgrounds/background_color_mushrooms.png`,
  colorTrees: `${BASE_PATH}/backgrounds/background_color_trees.png`,
  
  // Fade backgrounds
  fadeDesert: `${BASE_PATH}/backgrounds/background_fade_desert.png`,
  fadeHills: `${BASE_PATH}/backgrounds/background_fade_hills.png`,
  fadeMushrooms: `${BASE_PATH}/backgrounds/background_fade_mushrooms.png`,
  fadeTrees: `${BASE_PATH}/backgrounds/background_fade_trees.png`,
  
  // Solid backgrounds
  solidCloud: `${BASE_PATH}/backgrounds/background_solid_cloud.png`,
  solidDirt: `${BASE_PATH}/backgrounds/background_solid_dirt.png`,
  solidGrass: `${BASE_PATH}/backgrounds/background_solid_grass.png`,
  solidSand: `${BASE_PATH}/backgrounds/background_solid_sand.png`,
  solidSky: `${BASE_PATH}/backgrounds/background_solid_sky.png`,
  
  // Cloud overlay
  clouds: `${BASE_PATH}/backgrounds/background_clouds.png`,
} as const;

export type BackgroundAssetId = keyof typeof BACKGROUND_ASSETS;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get all assets in a category
 */
export function getAssetsByCategory(category: AssetCategory): AssetInfo[] {
  return KENNEY_ASSETS.filter(asset => asset.category === category);
}

/**
 * Get unused assets
 */
export function getUnusedAssets(): AssetInfo[] {
  return KENNEY_ASSETS.filter(asset => !asset.used);
}

/**
 * Get used assets
 */
export function getUsedAssets(): AssetInfo[] {
  return KENNEY_ASSETS.filter(asset => asset.used);
}

/**
 * Get assets by tag
 */
export function getAssetsByTag(tag: string): AssetInfo[] {
  return KENNEY_ASSETS.filter(asset => asset.tags.includes(tag));
}

/**
 * Get asset usage statistics
 */
export function getAssetUsageStats(): {
  total: number;
  used: number;
  unused: number;
  byCategory: Record<AssetCategory, { total: number; used: number }>;
} {
  const byCategory = {} as Record<AssetCategory, { total: number; used: number }>;
  
  const categories: AssetCategory[] = ['character', 'enemy', 'collectible', 'hud', 'tile', 'background', 'sound', 'ui'];
  categories.forEach(cat => {
    const assets = getAssetsByCategory(cat);
    byCategory[cat] = {
      total: assets.length,
      used: assets.filter(a => a.used).length,
    };
  });
  
  return {
    total: KENNEY_ASSETS.length,
    used: KENNEY_ASSETS.filter(a => a.used).length,
    unused: KENNEY_ASSETS.filter(a => !a.used).length,
    byCategory,
  };
}

/**
 * Search assets by query string
 */
export function searchAssets(query: string): AssetInfo[] {
  const lowerQuery = query.toLowerCase();
  return KENNEY_ASSETS.filter(asset =>
    asset.id.toLowerCase().includes(lowerQuery) ||
    asset.description.toLowerCase().includes(lowerQuery) ||
    asset.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
}

/**
 * Get emoji replacement suggestions
 * Maps common emojis to Kenney asset alternatives
 */
export const EMOJI_REPLACEMENTS: Record<string, { asset: string; description: string }> = {
  '❤️': { asset: KENNEY_ASSETS.find(a => a.id === 'hud_heart_full')?.path || '', description: 'Full heart' },
  '💛': { asset: KENNEY_ASSETS.find(a => a.id === 'hud_heart_full')?.path || '', description: 'Full heart (yellow)' },
  '💚': { asset: KENNEY_ASSETS.find(a => a.id === 'hud_heart_full')?.path || '', description: 'Full heart (green)' },
  '💙': { asset: KENNEY_ASSETS.find(a => a.id === 'hud_heart_full')?.path || '', description: 'Full heart (blue)' },
  '⭐': { asset: KENNEY_ASSETS.find(a => a.id === 'collectible_star')?.path || '', description: 'Star' },
  '🌟': { asset: KENNEY_ASSETS.find(a => a.id === 'collectible_star')?.path || '', description: 'Star (glowing)' },
  '💰': { asset: KENNEY_ASSETS.find(a => a.id === 'collectible_coin')?.path || '', description: 'Coin bag' },
  '🪙': { asset: KENNEY_ASSETS.find(a => a.id === 'collectible_coin')?.path || '', description: 'Coin' },
  '💎': { asset: KENNEY_ASSETS.find(a => a.id === 'collectible_gem')?.path || '', description: 'Gem' },
};

/**
 * Generate a report of unused assets with suggestions
 */
export function generateUnusedAssetReport(): string {
  const unused = getUnusedAssets();
  const stats = getAssetUsageStats();
  
  let report = `# Kenney Asset Usage Report\n\n`;
  report += `Generated: ${new Date().toISOString()}\n\n`;
  report += `## Summary\n\n`;
  report += `- Total Assets: ${stats.total}\n`;
  report += `- Used: ${stats.used} (${((stats.used / stats.total) * 100).toFixed(1)}%)\n`;
  report += `- Unused: ${stats.unused} (${((stats.unused / stats.total) * 100).toFixed(1)}%)\n\n`;
  
  report += `## By Category\n\n`;
  Object.entries(stats.byCategory).forEach(([cat, data]) => {
    report += `- ${cat}: ${data.used}/${data.total} used\n`;
  });
  
  report += `\n## Unused Assets\n\n`;
  unused.forEach(asset => {
    report += `- **${asset.id}**: ${asset.description}\n`;
    report += `  - Path: ${asset.path}\n`;
    report += `  - Tags: ${asset.tags.join(', ')}\n\n`;
  });
  
  return report;
}

// ============================================================================
// EXPORT DEFAULT
// ============================================================================

export default {
  assets: KENNEY_ASSETS,
  characters: CHARACTER_ASSETS,
  enemies: ENEMY_ASSETS,
  sounds: SOUND_ASSETS,
  backgrounds: BACKGROUND_ASSETS,
  getAssetsByCategory,
  getUnusedAssets,
  getUsedAssets,
  getAssetUsageStats,
  searchAssets,
  getCharacterAsset,
  generateUnusedAssetReport,
};
