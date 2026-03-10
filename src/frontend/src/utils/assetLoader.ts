/**
 * Asset Loader Utilities
 * 
 * Lazy loading, caching, and batch loading for Kenney assets.
 * 
 * @see docs/audit/KENNEY_ASSET_AUDIT_COMPLETE.md
 */

// ============================================================================
// TYPES
// ============================================================================

export type AssetType = 'image' | 'audio' | 'json';

export interface AssetDefinition {
  id: string;
  type: AssetType;
  src: string;
  priority?: 'critical' | 'high' | 'normal' | 'low';
  gameId?: string;
}

export interface LoadedAsset {
  id: string;
  type: AssetType;
  data: HTMLImageElement | HTMLAudioElement | unknown;
  loadedAt: number;
  size?: number;
  gameId?: string;
}

// ============================================================================
// CACHE MANAGEMENT
// ============================================================================

class AssetCache {
  private cache = new Map<string, LoadedAsset>();
  private maxSize: number;
  private currentSize = 0;

  constructor(maxSizeMB = 50) {
    this.maxSize = maxSizeMB * 1024 * 1024;
  }

  get(id: string): LoadedAsset | undefined {
    const asset = this.cache.get(id);
    if (asset) {
      // Update access time (LRU)
      asset.loadedAt = Date.now();
    }
    return asset;
  }

  set(id: string, asset: LoadedAsset): void {
    // Check if we need to evict
    while (this.currentSize > this.maxSize && this.cache.size > 0) {
      this.evictLRU();
    }

    this.cache.set(id, asset);
    this.currentSize += asset.size || 0;
  }

  has(id: string): boolean {
    return this.cache.has(id);
  }

  clear(): void {
    this.cache.clear();
    this.currentSize = 0;
  }

  clearByGame(gameId: string): void {
    for (const [id, asset] of this.cache) {
      if (asset.gameId === gameId) {
        this.currentSize -= asset.size || 0;
        this.cache.delete(id);
      }
    }
  }

  private evictLRU(): void {
    let oldest: { id: string; time: number } | null = null;
    
    for (const [id, asset] of this.cache) {
      if (!oldest || asset.loadedAt < oldest.time) {
        oldest = { id, time: asset.loadedAt };
      }
    }

    if (oldest) {
      const asset = this.cache.get(oldest.id);
      if (asset) {
        this.currentSize -= asset.size || 0;
        this.cache.delete(oldest.id);
      }
    }
  }

  getStats(): { size: number; count: number; memoryMB: number } {
    return {
      size: this.cache.size,
      count: this.cache.size,
      memoryMB: Math.round(this.currentSize / 1024 / 1024 * 100) / 100,
    };
  }
}

// Global cache instance
export const assetCache = new AssetCache(50);

// ============================================================================
// LAZY LOADING
// ============================================================================

/**
 * Lazy load an image asset
 */
export async function lazyLoadImage(
  src: string,
  id?: string
): Promise<HTMLImageElement> {
  const cacheId = id || src;
  
  // Check cache
  const cached = assetCache.get(cacheId);
  if (cached && cached.type === 'image') {
    return cached.data as HTMLImageElement;
  }

  // Load fresh
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      // Cache the loaded image
      assetCache.set(cacheId, {
        id: cacheId,
        type: 'image',
        data: img,
        loadedAt: Date.now(),
        size: estimateImageSize(img),
      });
      resolve(img);
    };
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    img.src = src;
  });
}

/**
 * Lazy load an audio asset
 */
export async function lazyLoadAudio(
  src: string,
  id?: string
): Promise<HTMLAudioElement> {
  const cacheId = id || src;
  
  const cached = assetCache.get(cacheId);
  if (cached && cached.type === 'audio') {
    return cached.data as HTMLAudioElement;
  }

  return new Promise((resolve, reject) => {
    const audio = new Audio();
    audio.oncanplaythrough = () => {
      assetCache.set(cacheId, {
        id: cacheId,
        type: 'audio',
        data: audio,
        loadedAt: Date.now(),
        size: 0, // Audio size estimation is complex
      });
      resolve(audio);
    };
    audio.onerror = () => reject(new Error(`Failed to load audio: ${src}`));
    audio.src = src;
    audio.load();
  });
}

/**
 * Batch load multiple assets with progress callback
 */
export async function batchLoadAssets(
  assets: AssetDefinition[],
  options: {
    concurrency?: number;
    onProgress?: (loaded: number, total: number) => void;
    onError?: (error: Error, asset: AssetDefinition) => void;
  } = {}
): Promise<LoadedAsset[]> {
  const { concurrency = 4, onProgress, onError } = options;
  const loaded: LoadedAsset[] = [];
  let completed = 0;

  // Process in batches
  for (let i = 0; i < assets.length; i += concurrency) {
    const batch = assets.slice(i, i + concurrency);
    
    const batchResults = await Promise.allSettled(
      batch.map(async (asset) => {
        try {
          let data: HTMLImageElement | HTMLAudioElement | unknown;

          if (asset.type === 'image') {
            data = await lazyLoadImage(asset.src, asset.id);
          } else if (asset.type === 'audio') {
            data = await lazyLoadAudio(asset.src, asset.id);
          } else {
            // JSON
            const response = await fetch(asset.src);
            data = await response.json();
          }

          const loadedAsset: LoadedAsset = {
            id: asset.id,
            type: asset.type,
            data,
            loadedAt: Date.now(),
          };

          completed++;
          onProgress?.(completed, assets.length);
          
          return loadedAsset;
        } catch (error) {
          onError?.(error as Error, asset);
          throw error;
        }
      })
    );

    // Collect successful loads
    for (const result of batchResults) {
      if (result.status === 'fulfilled') {
        loaded.push(result.value);
      }
    }
  }

  return loaded;
}

// ============================================================================
// GAME-SPECIFIC LOADING
// ============================================================================

/**
 * Load all assets needed for a specific game
 */
export async function loadGameAssets(
  gameId: string,
  assetManifest: AssetDefinition[]
): Promise<LoadedAsset[]> {
  // Filter assets for this game
  const gameAssets = assetManifest.filter(
    asset => !asset.gameId || asset.gameId === gameId
  );

  return batchLoadAssets(gameAssets, {
    concurrency: 6,
    onProgress: (loaded, total) => {
      if (process.env.NODE_ENV === 'development') {
        console.log(`[${gameId}] Loading assets: ${loaded}/${total}`);
      }
    },
  });
}

/**
 * Preload assets for a game that might be played next
 */
export function prefetchGameAssets(
  gameId: string,
  assetManifest: AssetDefinition[]
): Promise<LoadedAsset[]> {
  // Use requestIdleCallback if available for non-critical prefetching
  if ('requestIdleCallback' in window) {
    return new Promise((resolve) => {
      requestIdleCallback(() => {
        resolve(loadGameAssets(gameId, assetManifest));
      }, { timeout: 2000 });
    });
  }

  // Fallback: load with lower priority
  return loadGameAssets(gameId, assetManifest);
}

// ============================================================================
// INTERSECTION OBSERVER LAZY LOADING
// ============================================================================

/**
 * Create an IntersectionObserver for lazy loading images
 */
export function createLazyImageObserver(
  callback: (entries: IntersectionObserverEntry[]) => void
): IntersectionObserver {
  return new IntersectionObserver(callback, {
    root: null,
    rootMargin: '50px',
    threshold: 0.1,
  });
}

/**
 * Hook-like function for lazy loading images when visible
 */
export function observeImage(
  element: HTMLImageElement,
  src: string,
  observer: IntersectionObserver
): void {
  element.dataset.src = src;
  observer.observe(element);
}

// ============================================================================
// UTILITIES
// ============================================================================

function estimateImageSize(img: HTMLImageElement): number {
  // Rough estimate: width * height * 4 bytes (RGBA)
  return img.naturalWidth * img.naturalHeight * 4;
}

/**
 * Get cache statistics
 */
export function getCacheStats(): { size: number; count: number; memoryMB: number } {
  return assetCache.getStats();
}

/**
 * Clear the asset cache
 */
export function clearAssetCache(): void {
  assetCache.clear();
}

/**
 * Check if an asset is cached
 */
export function isAssetCached(id: string): boolean {
  return assetCache.has(id);
}

// ============================================================================
// ASSET MANIFESTS
// ============================================================================

/**
 * Predefined asset manifests for common game types
 */
export const ASSET_MANIFESTS: Record<string, AssetDefinition[]> = {
  platformer: [
    { id: 'char_idle', type: 'image', src: '/assets/kenney/platformer/characters/character_beige_idle.png', priority: 'critical' },
    { id: 'coin', type: 'image', src: '/assets/kenney/platformer/collectibles/coin_gold.png', priority: 'high' },
    { id: 'gem', type: 'image', src: '/assets/kenney/platformer/collectibles/gem_blue.png', priority: 'high' },
    { id: 'sfx_coin', type: 'audio', src: '/assets/kenney/platformer/sounds/sfx_coin.ogg', priority: 'high' },
    { id: 'sfx_jump', type: 'audio', src: '/assets/kenney/platformer/sounds/sfx_jump.ogg', priority: 'high' },
  ],
  
  puzzle: [
    { id: 'star', type: 'image', src: '/assets/kenney/platformer/collectibles/star.png', priority: 'critical' },
    { id: 'heart', type: 'image', src: '/assets/kenney/platformer/hud/hud_heart.png', priority: 'high' },
    { id: 'sfx_select', type: 'audio', src: '/assets/kenney/platformer/sounds/sfx_select.ogg', priority: 'high' },
    { id: 'sfx_gem', type: 'audio', src: '/assets/kenney/platformer/sounds/sfx_gem.ogg', priority: 'high' },
  ],
};

export default {
  lazyLoadImage,
  lazyLoadAudio,
  batchLoadAssets,
  loadGameAssets,
  prefetchGameAssets,
  createLazyImageObserver,
  getCacheStats,
  clearAssetCache,
  isAssetCached,
  ASSET_MANIFESTS,
};
