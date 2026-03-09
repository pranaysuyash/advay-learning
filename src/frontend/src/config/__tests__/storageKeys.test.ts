/**
 * Storage Keys Registry Tests
 */

import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import {
  GAME_KEYS,
  USER_KEYS,
  PROGRESS_KEYS,
  SYSTEM_KEYS,
  STORAGE_KEYS,
  clearStorageCategory,
  clearAllAppStorage,
  STORAGE_KEY_METADATA,
} from '../storageKeys';

describe('Storage Key Constants', () => {
  it('GAME_KEYS has expected keys', () => {
    expect(GAME_KEYS.SESSION).toBe('alphabetGameSession');
    expect(GAME_KEYS.STATE).toBe('gameState');
    expect(GAME_KEYS.PROGRESS).toBe('gameProgress');
    expect(GAME_KEYS.HIGH_SCORES).toBe('highScores');
    expect(GAME_KEYS.RECENT_GAMES).toBe('recentGames');
  });

  it('USER_KEYS has expected keys', () => {
    expect(USER_KEYS.PROFILE).toBe('userProfile');
    expect(USER_KEYS.PREFERENCES).toBe('userPreferences');
    expect(USER_KEYS.LANGUAGE).toBe('selectedLanguage');
    expect(USER_KEYS.TUTORIAL_COMPLETED).toBe('tutorialCompleted');
  });

  it('PROGRESS_KEYS has expected keys', () => {
    expect(PROGRESS_KEYS.LETTER_PROGRESS).toBe('letterProgress');
    expect(PROGRESS_KEYS.BATCH_PROGRESS).toBe('batchProgress');
    expect(PROGRESS_KEYS.BADGES).toBe('earnedBadges');
    expect(PROGRESS_KEYS.GAME_HISTORY).toBe('gameHistory');
    expect(PROGRESS_KEYS.STREAK).toBe('progressStreak');
  });

  it('SYSTEM_KEYS has expected keys', () => {
    expect(SYSTEM_KEYS.THEME).toBe('theme');
    expect(SYSTEM_KEYS.SIDEBAR_COLLAPSED).toBe('sidebarCollapsed');
    expect(SYSTEM_KEYS.FEATURE_FLAGS).toBe('featureFlags');
    expect(SYSTEM_KEYS.LAST_VISIT).toBe('lastVisit');
  });

  it('STORAGE_KEYS aggregates all categories', () => {
    expect(STORAGE_KEYS.GAME).toBe(GAME_KEYS);
    expect(STORAGE_KEYS.USER).toBe(USER_KEYS);
    expect(STORAGE_KEYS.PROGRESS).toBe(PROGRESS_KEYS);
    expect(STORAGE_KEYS.SYSTEM).toBe(SYSTEM_KEYS);
  });
});

describe('Storage Key Metadata', () => {
  it('has metadata for all GAME keys', () => {
    Object.values(GAME_KEYS).forEach((key) => {
      expect(STORAGE_KEY_METADATA[key]).toBeDefined();
      expect(STORAGE_KEY_METADATA[key].description).toBeDefined();
    });
  });

  it('has metadata for all USER keys', () => {
    Object.values(USER_KEYS).forEach((key) => {
      expect(STORAGE_KEY_METADATA[key]).toBeDefined();
      expect(STORAGE_KEY_METADATA[key].description).toBeDefined();
    });
  });

  it('has metadata for all PROGRESS keys', () => {
    Object.values(PROGRESS_KEYS).forEach((key) => {
      expect(STORAGE_KEY_METADATA[key]).toBeDefined();
      expect(STORAGE_KEY_METADATA[key].description).toBeDefined();
    });
  });

  it('has metadata for all SYSTEM keys', () => {
    Object.values(SYSTEM_KEYS).forEach((key) => {
      expect(STORAGE_KEY_METADATA[key]).toBeDefined();
      expect(STORAGE_KEY_METADATA[key].description).toBeDefined();
    });
  });

  it('SESSION key has TTL defined', () => {
    expect(STORAGE_KEY_METADATA[GAME_KEYS.SESSION].ttl).toBe(24 * 60 * 60 * 1000);
  });

  it('PROFILE key is marked as sensitive', () => {
    expect(STORAGE_KEY_METADATA[USER_KEYS.PROFILE].sensitive).toBe(true);
  });
});

describe('clearStorageCategory', () => {
  beforeEach(() => {
    // Set up test data
    localStorage.setItem(GAME_KEYS.SESSION, 'test-session');
    localStorage.setItem(GAME_KEYS.STATE, 'test-state');
    localStorage.setItem(USER_KEYS.PROFILE, 'test-profile');
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('clears all keys in GAME category', () => {
    clearStorageCategory('GAME');
    
    expect(localStorage.getItem(GAME_KEYS.SESSION)).toBeNull();
    expect(localStorage.getItem(GAME_KEYS.STATE)).toBeNull();
    // Other categories should remain
    expect(localStorage.getItem(USER_KEYS.PROFILE)).toBe('test-profile');
  });

  it('clears all keys in USER category', () => {
    clearStorageCategory('USER');
    
    expect(localStorage.getItem(USER_KEYS.PROFILE)).toBeNull();
    // Other categories should remain
    expect(localStorage.getItem(GAME_KEYS.SESSION)).toBe('test-session');
  });
});

describe('clearAllAppStorage', () => {
  beforeEach(() => {
    // Set up test data across categories
    localStorage.setItem(GAME_KEYS.SESSION, 'test-session');
    localStorage.setItem(USER_KEYS.PROFILE, 'test-profile');
    localStorage.setItem(PROGRESS_KEYS.BADGES, 'test-badges');
    localStorage.setItem(SYSTEM_KEYS.THEME, 'test-theme');
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('clears all app storage keys', () => {
    clearAllAppStorage();
    
    expect(localStorage.getItem(GAME_KEYS.SESSION)).toBeNull();
    expect(localStorage.getItem(USER_KEYS.PROFILE)).toBeNull();
    expect(localStorage.getItem(PROGRESS_KEYS.BADGES)).toBeNull();
    expect(localStorage.getItem(SYSTEM_KEYS.THEME)).toBeNull();
  });

  it('clears only known app keys', () => {
    // Set a non-app key
    localStorage.setItem('someOtherKey', 'other-value');
    
    clearAllAppStorage();
    
    // Non-app keys should remain (since we only clear known keys)
    expect(localStorage.getItem('someOtherKey')).toBe('other-value');
  });
});
