/**
 * Centralized LocalStorage Key Registry
 * 
 * This file defines all LocalStorage keys used throughout the application.
 * Use this registry instead of hardcoded strings to:
 * 1. Prevent naming collisions
 * 2. Enable easier refactoring
 * 3. Document key purposes and lifecycles
 * 
 * See: docs/audit/CODEBASE_CONSOLIDATION_AUDIT.md CONSOL-003
 * 
 * @example
 * ```ts
 * // Good
 * import { STORAGE_KEYS } from '../config/storageKeys';
 * localStorage.setItem(STORAGE_KEYS.GAME.SESSION, JSON.stringify(data));
 * 
 * // Avoid
 * localStorage.setItem('alphabetGameSession', JSON.stringify(data));
 * ```
 */

/**
 * Game-related storage keys
 */
export const GAME_KEYS = {
  /** Alphabet game session persistence (24h TTL) */
  SESSION: 'alphabetGameSession',
  /** Current game state for recovery */
  STATE: 'gameState',
  /** User progress across games */
  PROGRESS: 'gameProgress',
  /** High scores per game */
  HIGH_SCORES: 'highScores',
  /** Recently played games list */
  RECENT_GAMES: 'recentGames',
} as const;

/**
 * User-related storage keys
 */
export const USER_KEYS = {
  /** Cached user profile data */
  PROFILE: 'userProfile',
  /** User preferences (sound, language, etc.) */
  PREFERENCES: 'userPreferences',
  /** Last selected language */
  LANGUAGE: 'selectedLanguage',
  /** Tutorial completion status */
  TUTORIAL_COMPLETED: 'tutorialCompleted',
} as const;

/**
 * Progress-related storage keys
 */
export const PROGRESS_KEYS = {
  /** Letter progress per language */
  LETTER_PROGRESS: 'letterProgress',
  /** Batch unlock status */
  BATCH_PROGRESS: 'batchProgress',
  /** Earned badges */
  BADGES: 'earnedBadges',
  /** Game play history */
  GAME_HISTORY: 'gameHistory',
  /** Current streak data */
  STREAK: 'progressStreak',
} as const;

/**
 * System/UI storage keys
 */
export const SYSTEM_KEYS = {
  /** UI theme preference */
  THEME: 'theme',
  /** Sidebar/ navigation collapsed state */
  SIDEBAR_COLLAPSED: 'sidebarCollapsed',
  /** Feature flag overrides */
  FEATURE_FLAGS: 'featureFlags',
  /** Last visit timestamp */
  LAST_VISIT: 'lastVisit',
} as const;

/**
 * All storage keys combined
 * Use this for enumeration or validation
 */
export const STORAGE_KEYS = {
  GAME: GAME_KEYS,
  USER: USER_KEYS,
  PROGRESS: PROGRESS_KEYS,
  SYSTEM: SYSTEM_KEYS,
} as const;

/**
 * Type for all storage key values
 * Useful for function parameters that accept any storage key
 */
export type StorageKey = 
  | typeof GAME_KEYS[keyof typeof GAME_KEYS]
  | typeof USER_KEYS[keyof typeof USER_KEYS]
  | typeof PROGRESS_KEYS[keyof typeof PROGRESS_KEYS]
  | typeof SYSTEM_KEYS[keyof typeof SYSTEM_KEYS];

/**
 * Storage key metadata for documentation
 */
export interface StorageKeyMetadata {
  description: string;
  ttl?: number; // Time to live in milliseconds
  sensitive?: boolean; // Contains PII or sensitive data
}

/**
 * Metadata for storage keys
 */
export const STORAGE_KEY_METADATA: Record<StorageKey, StorageKeyMetadata> = {
  [GAME_KEYS.SESSION]: {
    description: 'Temporary game session for recovery (24h TTL)',
    ttl: 24 * 60 * 60 * 1000,
  },
  [GAME_KEYS.STATE]: {
    description: 'Current game state',
  },
  [GAME_KEYS.PROGRESS]: {
    description: 'User progress across games',
  },
  [GAME_KEYS.HIGH_SCORES]: {
    description: 'High scores per game',
  },
  [GAME_KEYS.RECENT_GAMES]: {
    description: 'Recently played games list',
  },
  [USER_KEYS.PROFILE]: {
    description: 'Cached user profile data',
    sensitive: true,
  },
  [USER_KEYS.PREFERENCES]: {
    description: 'User preferences (sound, language, etc.)',
  },
  [USER_KEYS.LANGUAGE]: {
    description: 'Last selected language',
  },
  [USER_KEYS.TUTORIAL_COMPLETED]: {
    description: 'Tutorial completion status',
  },
  [PROGRESS_KEYS.LETTER_PROGRESS]: {
    description: 'Letter progress per language',
  },
  [PROGRESS_KEYS.BATCH_PROGRESS]: {
    description: 'Batch unlock status',
  },
  [PROGRESS_KEYS.BADGES]: {
    description: 'Earned badges',
  },
  [PROGRESS_KEYS.GAME_HISTORY]: {
    description: 'Game play history',
  },
  [PROGRESS_KEYS.STREAK]: {
    description: 'Current streak data',
  },
  [SYSTEM_KEYS.THEME]: {
    description: 'UI theme preference',
  },
  [SYSTEM_KEYS.SIDEBAR_COLLAPSED]: {
    description: 'Sidebar/navigation collapsed state',
  },
  [SYSTEM_KEYS.FEATURE_FLAGS]: {
    description: 'Feature flag overrides',
  },
  [SYSTEM_KEYS.LAST_VISIT]: {
    description: 'Last visit timestamp',
  },
};

/**
 * Clear all storage keys related to a category
 * @param category - The category to clear
 * 
 * @example
 * ```ts
 * clearStorageCategory('GAME'); // Clears all game-related keys
 * ```
 */
export function clearStorageCategory(
  category: keyof typeof STORAGE_KEYS
): void {
  const keys = STORAGE_KEYS[category];
  Object.values(keys).forEach((key) => {
    localStorage.removeItem(key);
  });
}

/**
 * Clear all application storage
 * Use with caution - primarily for logout/reset
 */
export function clearAllAppStorage(): void {
  Object.values(STORAGE_KEYS).forEach((category) => {
    Object.values(category).forEach((key) => {
      localStorage.removeItem(key);
    });
  });
}
