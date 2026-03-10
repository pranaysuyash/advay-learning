/**
 * GAME REGISTRY — Single source of truth for all games on the platform.
 *
 * ┌──────────────────────────────────────────────────────────────────┐
 * │  HOW TO ADD A NEW GAME:                                         │
 * │                                                                  │
 * │  1. Create your game component in src/pages/ or src/games/      │
 * │  2. Add a GameManifest entry to GAME_REGISTRY below             │
 * │  3. Add a lazy import + <Route> in App.tsx                      │
 * │  4. That's it! Gallery, drops, easter eggs — all automatic.     │
 * │                                                                  │
 * │  The manifest defines:                                           │
 * │  - How the game appears in the gallery (name, tagline, icon)    │
 * │  - What world it belongs to (replaces "category")               │
 * │  - What items can drop when the game is completed               │
 * │  - What easter eggs are hidden inside                           │
 * │  - What inventory items affect gameplay (cross-game hooks)      │
 * └──────────────────────────────────────────────────────────────────┘
 */

import type { IconName } from '../components/ui/Icon';
import type { DropEntry } from './collectibles';
import type { EasterEgg } from './easterEggs';

// ─── TYPES ──────────────────────────────────────────────────────────────

export type GameVibe =
  | 'chill'
  | 'active'
  | 'creative'
  | 'brainy'
  | 'educational'
  | 'musical'
  | 'puzzle'
  | 'focus'
  | 'relaxed';

export interface GameManifest {
  // Identity
  id: string;
  name: string;
  tagline: string; // fun one-liner — NOT "learn X", but "do Y!"
  path: string;
  icon: IconName | string;

  // World & feel
  worldId: string;
  vibe: GameVibe;
  ageRange: string;
  isNew?: boolean;

  // Visibility
  listed: boolean; // false = exists but hidden from gallery (easter egg game?)

  // CV requirements
  cv: ('hand' | 'pose' | 'face' | 'voice')[];

  // Item system
  drops: DropEntry[];
  easterEggs: Omit<EasterEgg, 'gameId'>[]; // gameId auto-set from manifest id

  // Cross-game: items from inventory that change this game's behavior
  usesItems?: {
    itemId: string;
    effect: string; // human-readable description for docs
  }[];
}

// ─── VIBE CONFIG ────────────────────────────────────────────────────────

export const VIBE_CONFIG: Record<
  GameVibe,
  { label: string; emoji: string; color: string }
> = {
  chill: { label: 'Chill', emoji: '😌', color: '#10B981' },
  active: { label: 'Active', emoji: '⚡', color: '#F59E0B' },
  creative: { label: 'Creative', emoji: '🎨', color: '#A855F7' },
  brainy: { label: 'Brainy', emoji: '🧠', color: '#3B82F6' },
  educational: { label: 'Educational', emoji: '📚', color: '#6366F1' },
  musical: { label: 'Musical', emoji: '🎵', color: '#EC4899' },
  puzzle: { label: 'Puzzle', emoji: '🧩', color: '#8B5CF6' },
  focus: { label: 'Focus', emoji: '🎯', color: '#14B8A6' },
  relaxed: { label: 'Relaxed', emoji: '😴', color: '#60A5FA' },
};

// ─── THE REGISTRY ───────────────────────────────────────────────────────

import { LETTER_LAND_GAMES } from './gameRegistries/letterLand';
import {
  NUMBER_JUNGLE_GAMES,
  NUMBER_JUNGLE_EXTRA_GAMES,
} from './gameRegistries/numberJungle';
import { WORD_WORKSHOP_GAMES } from './gameRegistries/wordWorkshop';
import { WORD_WORKSHOP_EXTRA_GAMES } from './gameRegistries/wordWorkshopExtra';
import {
  SHAPE_GARDEN_GAMES,
  SHAPE_GARDEN_EXTRA_GAMES,
} from './gameRegistries/shapeGarden';
import { COLOR_SPLASH_GAMES } from './gameRegistries/colorSplash';
import {
  DOODLE_DOCK_GAMES,
  ART_ATELIER_GAMES,
  CREATIVE_CORNER_GAMES,
} from './gameRegistries/creativeCorner';
import {
  STEADY_LABS_GAMES,
  FEELING_FOREST_GAMES,
  WELLNESS_GAMES,
} from './gameRegistries/wellness';
import { SOUND_STUDIO_GAMES } from './gameRegistries/soundStudio';
import { BODY_ZONE_GAMES } from './gameRegistries/bodyZone';
import {
  LAB_OF_WONDERS_GAMES,
  VOICE_INPUT_GAMES,
} from './gameRegistries/labOfWonders';
import {
  REAL_WORLD_GAMES,
  STORY_CORNER_GAMES,
} from './gameRegistries/storyCorner';
import { PLATFORM_WORLD_GAMES } from './gameRegistries/platformWorld';

export const GAME_REGISTRY: GameManifest[] = [
  ...LETTER_LAND_GAMES,
  ...NUMBER_JUNGLE_GAMES,
  ...WORD_WORKSHOP_GAMES,
  ...SHAPE_GARDEN_GAMES,
  ...COLOR_SPLASH_GAMES,
  ...DOODLE_DOCK_GAMES,
  ...STEADY_LABS_GAMES,
  ...WELLNESS_GAMES,
  ...SOUND_STUDIO_GAMES,
  ...BODY_ZONE_GAMES,
  ...LAB_OF_WONDERS_GAMES,
  ...FEELING_FOREST_GAMES,
  ...ART_ATELIER_GAMES,
  ...REAL_WORLD_GAMES,
  ...STORY_CORNER_GAMES,
  ...SHAPE_GARDEN_EXTRA_GAMES,
  ...WORD_WORKSHOP_EXTRA_GAMES,
  ...CREATIVE_CORNER_GAMES,
  ...NUMBER_JUNGLE_EXTRA_GAMES,
  ...PLATFORM_WORLD_GAMES,
  ...VOICE_INPUT_GAMES,
];

// ─── LOOKUP HELPERS ─────────────────────────────────────────────────────

// Dev-time uniqueness guard — throws immediately if any game ID is duplicated.
if (import.meta.env.DEV) {
  const seen = new Set<string>();
  for (const g of GAME_REGISTRY) {
    if (seen.has(g.id)) {
      throw new Error(`[gameRegistry] Duplicate game ID detected: '${g.id}'. Each game must have a unique id.`);
    }
    seen.add(g.id);
  }
}

const _byId = new Map(GAME_REGISTRY.map((g) => [g.id, g]));
const PHYSICS_ALIAS_ID = 'physics-demo';
const PHYSICS_CANONICAL_ID = 'physics-playground';

function resolveManifestId(id: string): string {
  return id === PHYSICS_ALIAS_ID ? PHYSICS_CANONICAL_ID : id;
}

export function getGameManifest(id: string): GameManifest | undefined {
  return _byId.get(resolveManifestId(id));
}

export function getListedGames(): GameManifest[] {
  return GAME_REGISTRY.filter((g) => g.listed);
}

export function getGamesByWorld(worldId: string): GameManifest[] {
  return GAME_REGISTRY.filter((g) => g.worldId === worldId && g.listed);
}

export function getGamesByVibe(vibe: GameVibe): GameManifest[] {
  return GAME_REGISTRY.filter((g) => g.vibe === vibe && g.listed);
}

export function getAllWorlds(): string[] {
  return [
    ...new Set(GAME_REGISTRY.filter((g) => g.listed).map((g) => g.worldId)),
  ];
}

/**
 * Get drop table for a game from the registry.
 * This replaces the hardcoded GAME_DROP_TABLES in collectibles.ts.
 */
export function getDropTable(gameId: string): DropEntry[] {
  return _byId.get(resolveManifestId(gameId))?.drops ?? [];
}

/**
 * Get easter eggs for a game from the registry.
 * Auto-injects gameId from the manifest.
 */
export function getRegistryEasterEggs(gameId: string): EasterEgg[] {
  const manifest = _byId.get(resolveManifestId(gameId));
  if (!manifest) return [];
  return manifest.easterEggs.map((egg) => ({ ...egg, gameId }));
}

/** Look up a single easter egg by id across all games. */
export function getRegistryEasterEggById(eggId: string): EasterEgg | undefined {
  for (const manifest of GAME_REGISTRY) {
    const egg = manifest.easterEggs.find((e) => e.id === eggId);
    if (egg) return { ...egg, gameId: manifest.id };
  }
  return undefined;
}
