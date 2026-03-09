/**
 * Story Cache - localStorage-based caching for generated stories
 * 
 * Prevents redundant LLM calls and provides instant story retrieval
 * for previously generated prompts.
 */

const CACHE_KEY_PREFIX = 'advay_story_cache_';
const CACHE_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
const MAX_CACHE_ENTRIES = 100;

interface CacheEntry {
  text: string;
  timestamp: number;
  theme: string;
  age: number;
}

export class StoryCache {
  /**
   * Retrieve a cached story if available and not expired
   */
  get(key: string): string | null {
    try {
      const stored = localStorage.getItem(CACHE_KEY_PREFIX + key);
      if (!stored) return null;

      const entry: CacheEntry = JSON.parse(stored);
      
      // Check TTL
      if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
        localStorage.removeItem(CACHE_KEY_PREFIX + key);
        return null;
      }

      return entry.text;
    } catch (error) {
      console.warn('[StoryCache] Failed to retrieve from cache:', error);
      return null;
    }
  }

  /**
   * Store a generated story in cache
   */
  set(key: string, text: string, metadata: { theme: string; age: number }): void {
    try {
      // Enforce cache size limit before adding new entry
      this.enforceCacheLimit();

      const entry: CacheEntry = {
        text,
        timestamp: Date.now(),
        theme: metadata.theme,
        age: metadata.age,
      };

      localStorage.setItem(CACHE_KEY_PREFIX + key, JSON.stringify(entry));
    } catch (error) {
      // Handle quota exceeded or other localStorage errors
      console.warn('[StoryCache] Failed to cache story:', error);
      
      // If quota exceeded, clear half the cache and retry
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        this.clearOldestEntries(MAX_CACHE_ENTRIES / 2);
        try {
          const entry: CacheEntry = {
            text,
            timestamp: Date.now(),
            theme: metadata.theme,
            age: metadata.age,
          };
          localStorage.setItem(CACHE_KEY_PREFIX + key, JSON.stringify(entry));
        } catch (retryError) {
          console.error('[StoryCache] Failed to cache even after cleanup:', retryError);
        }
      }
    }
  }

  /**
   * Clear all story cache entries
   */
  clear(): void {
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(CACHE_KEY_PREFIX)) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.error('[StoryCache] Failed to clear cache:', error);
    }
  }

  /**
   * Get cache statistics for monitoring
   */
  getStats(): { totalEntries: number; oldestEntry: number | null; newestEntry: number | null } {
    const entries: { key: string; timestamp: number }[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(CACHE_KEY_PREFIX)) {
        try {
          const stored = localStorage.getItem(key);
          if (stored) {
            const entry: CacheEntry = JSON.parse(stored);
            entries.push({ key, timestamp: entry.timestamp });
          }
        } catch {
          // Skip invalid entries
        }
      }
    }

    if (entries.length === 0) {
      return { totalEntries: 0, oldestEntry: null, newestEntry: null };
    }

    const timestamps = entries.map(e => e.timestamp);
    return {
      totalEntries: entries.length,
      oldestEntry: Math.min(...timestamps),
      newestEntry: Math.max(...timestamps),
    };
  }

  /**
   * Enforce maximum cache size by removing oldest entries
   */
  private enforceCacheLimit(): void {
    const entries: { key: string; timestamp: number }[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(CACHE_KEY_PREFIX)) {
        try {
          const stored = localStorage.getItem(key);
          if (stored) {
            const entry: CacheEntry = JSON.parse(stored);
            entries.push({ key, timestamp: entry.timestamp });
          }
        } catch {
          // Skip invalid entries
        }
      }
    }

    // Sort by timestamp (oldest first)
    entries.sort((a, b) => a.timestamp - b.timestamp);

    // Remove oldest entries if over limit
    while (entries.length >= MAX_CACHE_ENTRIES) {
      const oldest = entries.shift();
      if (oldest) {
        localStorage.removeItem(oldest.key);
      }
    }
  }

  /**
   * Clear a specific number of oldest entries
   */
  private clearOldestEntries(count: number): void {
    const entries: { key: string; timestamp: number }[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(CACHE_KEY_PREFIX)) {
        try {
          const stored = localStorage.getItem(key);
          if (stored) {
            const entry: CacheEntry = JSON.parse(stored);
            entries.push({ key, timestamp: entry.timestamp });
          }
        } catch {
          // Skip invalid entries
        }
      }
    }

    // Sort by timestamp (oldest first) and remove specified count
    entries.sort((a, b) => a.timestamp - b.timestamp);
    entries.slice(0, Math.floor(count)).forEach(entry => {
      localStorage.removeItem(entry.key);
    });
  }
}
