/**
 * Asset Preloader Component
 * 
 * Preloads critical Kenney assets before game starts.
 * Shows loading progress to improve perceived performance.
 * 
 * @see docs/audit/KENNEY_ASSET_AUDIT_COMPLETE.md
 */

import { useState, useEffect, useCallback } from 'react';

export interface AssetToPreload {
  type: 'image' | 'audio';
  src: string;
  priority: 'critical' | 'high' | 'normal';
}

interface AssetPreloaderProps {
  assets: AssetToPreload[];
  onComplete: () => void;
  onProgress?: (progress: number) => void;
  children?: React.ReactNode;
  minDisplayTime?: number;
}

interface LoadingState {
  loaded: number;
  total: number;
  errors: string[];
  isComplete: boolean;
}

/**
 * Critical assets that should be preloaded for all games
 */
// eslint-disable-next-line react-refresh/only-export-components
export const CRITICAL_ASSETS: AssetToPreload[] = [
  // HUD Elements
  { type: 'image', src: '/assets/kenney/platformer/hud/hud_heart.png', priority: 'critical' },
  { type: 'image', src: '/assets/kenney/platformer/hud/hud_heart_empty.png', priority: 'critical' },
  // Collectibles
  { type: 'image', src: '/assets/kenney/platformer/collectibles/coin_gold.png', priority: 'critical' },
  { type: 'image', src: '/assets/kenney/platformer/collectibles/gem_blue.png', priority: 'critical' },
  { type: 'image', src: '/assets/kenney/platformer/collectibles/star.png', priority: 'critical' },
  // UI Buttons
  { type: 'image', src: '/assets/kenney/ui/buttons/button_blue.png', priority: 'high' },
  { type: 'image', src: '/assets/kenney/ui/buttons/button_green.png', priority: 'high' },
  // Sound Effects
  { type: 'audio', src: '/assets/kenney/platformer/sounds/sfx_coin.ogg', priority: 'high' },
  { type: 'audio', src: '/assets/kenney/platformer/sounds/sfx_select.ogg', priority: 'high' },
];

/**
 * Preload a single image asset
 */
function preloadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    img.src = src;
  });
}

/**
 * Preload a single audio asset
 */
function preloadAudio(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const audio = new Audio();
    audio.oncanplaythrough = () => resolve();
    audio.onerror = () => reject(new Error(`Failed to load audio: ${src}`));
    audio.src = src;
    audio.load();
  });
}

/**
 * AssetPreloader - Shows loading screen while preloading assets
 * 
 * Usage:
 * ```tsx
 * <AssetPreloader 
 *   assets={CRITICAL_ASSETS}
 *   onComplete={() => setReady(true)}
 *   minDisplayTime={2000}
 * >
 *   <LoadingScreen />
 * </AssetPreloader>
 * ```
 */
export function AssetPreloader({
  assets,
  onComplete,
  onProgress,
  children,
  minDisplayTime = 1500,
}: AssetPreloaderProps) {
  const [state, setState] = useState<LoadingState>({
    loaded: 0,
    total: assets.length,
    errors: [],
    isComplete: false,
  });
  const [showContent, setShowContent] = useState(false);

  const loadAsset = useCallback(async (asset: AssetToPreload): Promise<void> => {
    try {
      if (asset.type === 'image') {
        await preloadImage(asset.src);
      } else {
        await preloadAudio(asset.src);
      }
    } catch (error) {
      console.warn(`Failed to preload ${asset.src}:`, error);
      throw error;
    }
  }, []);

  useEffect(() => {
    const startTime = Date.now();
    let cancelled = false;

    const loadAllAssets = async () => {
      const priorityOrder: Record<string, number> = {
        critical: 0,
        high: 1,
        normal: 2,
      };

      // Sort by priority
      const sortedAssets = [...assets].sort(
        (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
      );

      // Load assets with concurrency limit
      const CONCURRENCY = 4;
      const errors: string[] = [];
      let loaded = 0;

      for (let i = 0; i < sortedAssets.length; i += CONCURRENCY) {
        const batch = sortedAssets.slice(i, i + CONCURRENCY);
        
        await Promise.all(
          batch.map(async (asset) => {
            try {
              await loadAsset(asset);
              if (!cancelled) {
                loaded++;
                setState(prev => ({ ...prev, loaded }));
                onProgress?.(loaded / assets.length);
              }
            } catch {
              errors.push(asset.src);
            }
          })
        );
      }

      // Ensure minimum display time
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, minDisplayTime - elapsed);
      
      await new Promise(resolve => setTimeout(resolve, remaining));

      if (!cancelled) {
        setState({
          loaded,
          total: assets.length,
          errors,
          isComplete: true,
        });
        setShowContent(true);
        onComplete();
      }
    };

    loadAllAssets();

    return () => {
      cancelled = true;
    };
  }, [assets, loadAsset, onComplete, onProgress, minDisplayTime]);

  if (showContent) {
    return <>{children}</>;
  }

  // Default loading UI if no children provided
  const progress = state.total > 0 ? (state.loaded / state.total) * 100 : 0;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-8">
      <div className="w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
          Loading Game Assets...
        </h2>
        
        {/* Progress bar */}
        <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden mb-4">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        
        {/* Progress text */}
        <p className="text-center text-gray-600 mb-2">
          {state.loaded} of {state.total} assets loaded
        </p>
        
        {/* Priority indicator */}
        <div className="flex justify-center gap-4 text-sm">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            Critical
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-yellow-500" />
            High
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            Normal
          </span>
        </div>

        {/* Errors (if any) */}
        {state.errors.length > 0 && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-700">
              {state.errors.length} asset(s) failed to load (will use fallbacks)
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * useAssetPreloader - Hook for preloading assets outside of component tree
 */
// eslint-disable-next-line react-refresh/only-export-components
export function useAssetPreloader() {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const preload = useCallback(async (assets: AssetToPreload[]) => {
    setIsLoading(true);
    setProgress(0);
    setIsComplete(false);

    let loaded = 0;
    const errors: string[] = [];

    await Promise.all(
      assets.map(async (asset) => {
        try {
          if (asset.type === 'image') {
            await preloadImage(asset.src);
          } else {
            await preloadAudio(asset.src);
          }
          loaded++;
          setProgress(loaded / assets.length);
        } catch {
          errors.push(asset.src);
        }
      })
    );

    setIsLoading(false);
    setIsComplete(true);
    return { loaded, errors };
  }, []);

  return { preload, isLoading, progress, isComplete };
}

export default AssetPreloader;
