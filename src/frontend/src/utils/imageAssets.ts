export interface ImageAssetSource {
  id: string;
  fallbackSrc: string;
  webpSrc?: string;
  width?: number;
  height?: number;
  preload?: boolean;
  lazy?: boolean;
}

export interface BestImageSource {
  id: string;
  fallbackSrc: string;
  webpSrc?: string;
  useOptimization: boolean;
  loading: 'lazy' | 'eager';
  decoding: 'sync' | 'async';
}

const env = (import.meta as any).env ?? {};
const IMAGE_OPTIMIZATION_ENABLED =
  String(env.VITE_IMAGE_OPTIMIZATION_ENABLED ?? 'true').toLowerCase() !== 'false';

const IMAGE_ASSETS: Record<string, ImageAssetSource> = {
  'bg-sunny': {
    id: 'bg-sunny',
    fallbackSrc: '/assets/backgrounds/bg_sunny.png',
    webpSrc: '/assets/backgrounds/bg_sunny.webp',
  },
  'bg-rainy': {
    id: 'bg-rainy',
    fallbackSrc: '/assets/backgrounds/bg_rainy.png',
    webpSrc: '/assets/backgrounds/bg_rainy.webp',
  },
  'bg-snowy': {
    id: 'bg-snowy',
    fallbackSrc: '/assets/backgrounds/bg_snowy.png',
    webpSrc: '/assets/backgrounds/bg_snowy.webp',
  },
  'adventure-map': {
    id: 'adventure-map',
    fallbackSrc: '/assets/images/adventure-map.png',
    webpSrc: '/assets/images/adventure-map.webp',
    preload: true,
  },
  'pip-mascot': {
    id: 'pip-mascot',
    fallbackSrc: '/assets/images/red_panda_no_bg.png',
    webpSrc: '/assets/images/red_panda_no_bg.webp',
  },
  'pip-sprite-sheet': {
    id: 'pip-sprite-sheet',
    fallbackSrc: '/assets/images/pip_sprite_sheet.png',
    webpSrc: '/assets/images/pip_sprite_sheet.webp',
    lazy: true,
  },
};

export function getImageAsset(assetId: string): ImageAssetSource | null {
  return IMAGE_ASSETS[assetId] ?? null;
}

export function getBestImageSource(assetId: string): BestImageSource | null {
  const asset = getImageAsset(assetId);
  if (!asset) return null;

  return {
    id: asset.id,
    fallbackSrc: asset.fallbackSrc,
    webpSrc: asset.webpSrc,
    useOptimization: IMAGE_OPTIMIZATION_ENABLED,
    loading: asset.lazy ? 'lazy' : 'eager',
    decoding: asset.preload ? 'sync' : 'async',
  };
}

export function resolveImageUrl(assetId: string): string | null {
  const source = getBestImageSource(assetId);
  if (!source) return null;

  if (source.useOptimization && source.webpSrc) {
    return source.webpSrc;
  }

  return source.fallbackSrc;
}
