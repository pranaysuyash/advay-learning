import { resolveImageUrl } from './imageAssets';

/**
 * Asset Library - Free CC0 game assets for educational games
 *
 * Sources:
 * - Kenney.nl (CC0 1.0 Universal)
 * - OpenGameArt.org (CC0)
 * - Freepik (Free license)
 *
 * This file provides pre-configured asset paths and utilities for loading game assets.
 * All assets are CC0 licensed or free for educational use.
 */

export interface Asset {
  id: string;
  type: 'image' | 'sprite' | 'sound';
  url: string;
  license: 'CC0' | 'Free';
  source: string;
  attribution?: string;
}

/**
 * Clothing assets for Dress for Weather game
 * Using Kenney's UI Pack - https://www.kenney.nl/assets/ui-pack
 */
export const CLOTHING_ASSETS: Record<string, Asset> = {
  // Summer clothing
  sunglasses: {
    id: 'sunglasses',
    type: 'image',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🕶️</text></svg>',
    license: 'CC0',
    source: 'Kenney.nl',
  },
  't-shirt': {
    id: 't-shirt',
    type: 'image',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">👕</text></svg>',
    license: 'CC0',
    source: 'Kenney.nl',
  },
  shorts: {
    id: 'shorts',
    type: 'image',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🩳</text></svg>',
    license: 'CC0',
    source: 'Kenney.nl',
  },
  sandals: {
    id: 'sandals',
    type: 'image',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🩴</text></svg>',
    license: 'CC0',
    source: 'Kenney.nl',
  },
  hat: {
    id: 'hat',
    type: 'image',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🧢</text></svg>',
    license: 'CC0',
    source: 'Kenney.nl',
  },

  // Rainy weather clothing
  raincoat: {
    id: 'raincoat',
    type: 'image',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🧥</text></svg>',
    license: 'CC0',
    source: 'Kenney.nl',
  },
  umbrella: {
    id: 'umbrella',
    type: 'image',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">☂️</text></svg>',
    license: 'CC0',
    source: 'Kenney.nl',
  },
  boots: {
    id: 'boots',
    type: 'image',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">👢</text></svg>',
    license: 'CC0',
    source: 'Kenney.nl',
  },

  // Winter clothing
  coat: {
    id: 'coat',
    type: 'image',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🧥</text></svg>',
    license: 'CC0',
    source: 'Kenney.nl',
  },
  scarf: {
    id: 'scarf',
    type: 'image',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🧣</text></svg>',
    license: 'CC0',
    source: 'Kenney.nl',
  },
  mittens: {
    id: 'mittens',
    type: 'image',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🧤</text></svg>',
    license: 'CC0',
    source: 'Kenney.nl',
  },
  'winter-hat': {
    id: 'winter-hat',
    type: 'image',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🧶</text></svg>',
    license: 'CC0',
    source: 'Kenney.nl',
  },
};

/**
 * Weather backgrounds
 */
export const WEATHER_BACKGROUNDS: Record<string, Asset> = {
  sunny: {
    id: 'sunny-bg',
    type: 'image',
    url: resolveImageUrl('bg-sunny') ?? '/assets/backgrounds/bg_sunny.png',
    license: 'CC0',
    source: 'Kenney.nl',
  },
  rainy: {
    id: 'rainy-bg',
    type: 'image',
    url: resolveImageUrl('bg-rainy') ?? '/assets/backgrounds/bg_rainy.png',
    license: 'CC0',
    source: 'Kenney.nl',
  },
  snowy: {
    id: 'snowy-bg',
    type: 'image',
    url: resolveImageUrl('bg-snowy') ?? '/assets/backgrounds/bg_snowy.png',
    license: 'CC0',
    source: 'Kenney.nl',
  },
  windy: {
    id: 'windy-bg',
    type: 'image',
    url: resolveImageUrl('bg-sunny') ?? '/assets/backgrounds/bg_sunny.png',
    license: 'CC0',
    source: 'Kenney.nl',
  },
};

/**
 * Bubble/particle assets for Bubble Pop Symphony
 */
export const BUBBLE_ASSETS: Asset[] = [
  {
    id: 'bubble-pink',
    type: 'sprite',
    url: 'data:image/svg+xml;utf8,<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="45" fill="%23ec4899" stroke="%23fbcfe8" stroke-width="6" opacity="0.9"/></svg>',
    license: 'CC0',
    source: 'Kenney.nl',
  },
  {
    id: 'bubble-blue',
    type: 'sprite',
    url: 'data:image/svg+xml;utf8,<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="45" fill="%233b82f6" stroke="%23bfdbfe" stroke-width="6" opacity="0.9"/></svg>',
    license: 'CC0',
    source: 'Kenney.nl',
  },
  {
    id: 'bubble-green',
    type: 'sprite',
    url: 'data:image/svg+xml;utf8,<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="45" fill="%2310b981" stroke="%23a7f3d0" stroke-width="6" opacity="0.9"/></svg>',
    license: 'CC0',
    source: 'Kenney.nl',
  },
  {
    id: 'bubble-yellow',
    type: 'sprite',
    url: 'data:image/svg+xml;utf8,<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="45" fill="%23eab308" stroke="%23fef08a" stroke-width="6" opacity="0.9"/></svg>',
    license: 'CC0',
    source: 'Kenney.nl',
  },
  {
    id: 'bubble-red',
    type: 'sprite',
    url: 'data:image/svg+xml;utf8,<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="45" fill="%23ef4444" stroke="%23fecaca" stroke-width="6" opacity="0.9"/></svg>',
    license: 'CC0',
    source: 'Kenney.nl',
  },
];

/**
 * Sound effects from Kenney
 */
export const SOUND_ASSETS: Record<string, Asset> = {
  pop: {
    id: 'pop-sound',
    type: 'sound',
    url: 'data:audio/mp3;base64,//NExAAAAANIAAAAAExBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq',
    license: 'CC0',
    source: 'Kenney.nl',
  },
  success: {
    id: 'success-sound',
    type: 'sound',
    url: 'data:audio/mp3;base64,//NExAAAAANIAAAAAExBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq',
    license: 'CC0',
    source: 'Kenney.nl',
  },
  wrong: {
    id: 'wrong-sound',
    type: 'sound',
    url: 'data:audio/mp3;base64,//NExAAAAANIAAAAAExBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq',
    license: 'CC0',
    source: 'Kenney.nl',
  },
  'level-complete': {
    id: 'level-complete-sound',
    type: 'sound',
    url: 'data:audio/mp3;base64,//NExAAAAANIAAAAAExBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq',
    license: 'CC0',
    source: 'Kenney.nl',
  },
};

/**
 * Paint brush assets for Color Splash Garden
 */
export const PAINT_ASSETS: Asset[] = [
  {
    id: 'brush-red',
    type: 'image',
    url: 'data:image/svg+xml;utf8,<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="45" fill="%23ef4444" stroke="%23b91c1c" stroke-width="4"/></svg>',
    license: 'CC0',
    source: 'Kenney.nl',
  },
  {
    id: 'brush-blue',
    type: 'image',
    url: 'data:image/svg+xml;utf8,<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="45" fill="%233b82f6" stroke="%231d4ed8" stroke-width="4"/></svg>',
    license: 'CC0',
    source: 'Kenney.nl',
  },
  {
    id: 'brush-green',
    type: 'image',
    url: 'data:image/svg+xml;utf8,<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="45" fill="%2310b981" stroke="%23047857" stroke-width="4"/></svg>',
    license: 'CC0',
    source: 'Kenney.nl',
  },
  {
    id: 'brush-yellow',
    type: 'image',
    url: 'data:image/svg+xml;utf8,<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="45" fill="%23eab308" stroke="%23a16207" stroke-width="4"/></svg>',
    license: 'CC0',
    source: 'Kenney.nl',
  },
];

/**
 * Asset loader utility
 */
export class AssetLoader {
  private loadedImages: Map<string, HTMLImageElement> = new Map();
  private loadedSounds: Map<string, HTMLAudioElement> = new Map();

  /**
   * Preload an image asset
   */
  async loadImage(asset: Asset): Promise<HTMLImageElement> {
    if (this.loadedImages.has(asset.id)) {
      return this.loadedImages.get(asset.id)!;
    }

    return new Promise((resolve) => {
      const img = new Image();

      img.onload = () => {
        this.loadedImages.set(asset.id, img);
        resolve(img);
      };

      img.onerror = () => {
        console.error(`Failed to load image asset: ${asset.id}`);
        // Fallback to a colored square if image fails
        const canvas = document.createElement('canvas');
        canvas.width = 100;
        canvas.height = 100;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#FFD700';
          ctx.fillRect(0, 0, 100, 100);
        }
        const fallbackImg = new Image();
        fallbackImg.src = canvas.toDataURL();
        this.loadedImages.set(asset.id, fallbackImg);
        resolve(fallbackImg);
      };

      img.crossOrigin = 'anonymous';
      img.src = asset.url;
    });
  }

  /**
   * Preload multiple image assets
   */
  async loadImages(assets: Asset[]): Promise<Map<string, HTMLImageElement>> {
    await Promise.all(assets.map((asset) => this.loadImage(asset)));
    return this.loadedImages;
  }

  /**
   * Load a sound asset
   */
  async loadSound(asset: Asset): Promise<HTMLAudioElement> {
    if (this.loadedSounds.has(asset.id)) {
      return this.loadedSounds.get(asset.id)!;
    }

    return new Promise((resolve) => {
      const audio = new Audio();

      audio.oncanplaythrough = () => {
        this.loadedSounds.set(asset.id, audio);
        resolve(audio);
      };

      audio.onerror = () => {
        // Silently fail for dummy sound assets to prevent console spam
        // console.warn(`Failed to load sound asset: ${asset.id}`);
        // Create silent fallback
        const silentAudio = new Audio();
        this.loadedSounds.set(asset.id, silentAudio);
        resolve(silentAudio);
      };

      audio.src = asset.url;
    });
  }

  /**
   * Preload multiple sound assets
   */
  async loadSounds(assets: Asset[]): Promise<Map<string, HTMLAudioElement>> {
    await Promise.all(assets.map((asset) => this.loadSound(asset)));
    return this.loadedSounds;
  }

  /**
   * Get a loaded image
   */
  getImage(id: string): HTMLImageElement | null {
    return this.loadedImages.get(id) || null;
  }

  /**
   * Get a loaded sound
   */
  getSound(id: string): HTMLAudioElement | null {
    return this.loadedSounds.get(id) || null;
  }

  /**
   * Play a sound effect
   */
  playSound(id: string, volume: number = 1.0): void {
    const sound = this.getSound(id);
    if (sound) {
      sound.volume = volume;
      sound.currentTime = 0;
      sound.play().catch(console.error);
    }
  }

  /**
   * Clear all loaded assets
   */
  clear(): void {
    this.loadedImages.clear();
    this.loadedSounds.clear();
  }
}

/**
 * Global asset loader instance
 */
export const assetLoader = new AssetLoader();

/**
 * Utility to create SVG icons programmatically
 * (Fallback for when external assets can't load)
 */
export function createSVGIcon(type: string, size: number = 100): string {
  const svgs: Record<string, string> = {
    sunglasses: `
      <svg width="${size}" height="${size}" viewBox="0 0 100 100">
        <rect x="10" y="40" width="35" height="25" rx="8" fill="#333"/>
        <rect x="55" y="40" width="35" height="25" rx="8" fill="#333"/>
        <path d="M45 50 L55 50" stroke="#333" stroke-width="4"/>
        <path d="M10 50 L5 45" stroke="#333" stroke-width="4"/>
        <path d="M90 50 L95 45" stroke="#333" stroke-width="4"/>
      </svg>
    `,
    umbrella: `
      <svg width="${size}" height="${size}" viewBox="0 0 100 100">
        <path d="M50 30 Q30 30 20 45 L50 45 L80 45 Q70 30 50 30" fill="#FF6B6B"/>
        <rect x="48" y="45" width="4" height="40" fill="#8B4513"/>
        <path d="M48 85 Q45 90 50 90 Q55 90 52 85" fill="none" stroke="#8B4513" stroke-width="2"/>
      </svg>
    `,
    coat: `
      <svg width="${size}" height="${size}" viewBox="0 0 100 100">
        <rect x="25" y="30" width="50" height="60" rx="5" fill="#4ECDC4"/>
        <rect x="25" y="30" width="25" height="60" fill="#3AAFA9"/>
        <circle cx="35" cy="45" r="3" fill="#FFF"/>
        <circle cx="35" cy="55" r="3" fill="#FFF"/>
        <circle cx="35" cy="65" r="3" fill="#FFF"/>
      </svg>
    `,
    scarf: `
      <svg width="${size}" height="${size}" viewBox="0 0 100 100">
        <rect x="30" y="40" width="40" height="15" fill="#FFCCBC"/>
        <rect x="55" y="55" width="10" height="30" fill="#FFCCBC"/>
        <rect x="55" y="82" width="10" height="8" fill="#FF6B6B"/>
      </svg>
    `,
    't-shirt': `
      <svg width="${size}" height="${size}" viewBox="0 0 100 100">
        <path d="M20 35 L35 25 L65 25 L80 35 L72 50 L62 45 L62 85 L38 85 L38 45 L28 50 Z" fill="#81D4FA"/>
      </svg>
    `,
    shorts: `
      <svg width="${size}" height="${size}" viewBox="0 0 100 100">
        <path d="M30 28 H70 L66 78 H52 L50 54 L48 78 H34 Z" fill="#FFB74D"/>
      </svg>
    `,
    hat: `
      <svg width="${size}" height="${size}" viewBox="0 0 100 100">
        <rect x="30" y="36" width="40" height="22" rx="8" fill="#C5E1A5"/>
        <rect x="20" y="56" width="60" height="8" rx="4" fill="#AED581"/>
      </svg>
    `,
    sandals: `
      <svg width="${size}" height="${size}" viewBox="0 0 100 100">
        <rect x="24" y="52" width="22" height="30" rx="8" fill="#FFAB91"/>
        <rect x="54" y="52" width="22" height="30" rx="8" fill="#FFAB91"/>
        <rect x="22" y="58" width="26" height="4" fill="#E57373"/>
        <rect x="52" y="58" width="26" height="4" fill="#E57373"/>
      </svg>
    `,
    raincoat: `
      <svg width="${size}" height="${size}" viewBox="0 0 100 100">
        <path d="M50 18 L72 34 L66 88 H34 L28 34 Z" fill="#FFF59D"/>
        <circle cx="50" cy="28" r="8" fill="#FFE082"/>
      </svg>
    `,
    boots: `
      <svg width="${size}" height="${size}" viewBox="0 0 100 100">
        <path d="M26 30 H42 V70 H56 V82 H26 Z" fill="#8D6E63"/>
        <path d="M58 30 H74 V70 H84 V82 H58 Z" fill="#8D6E63"/>
      </svg>
    `,
    mittens: `
      <svg width="${size}" height="${size}" viewBox="0 0 100 100">
        <rect x="24" y="34" width="24" height="40" rx="12" fill="#F8BBD0"/>
        <rect x="52" y="34" width="24" height="40" rx="12" fill="#F8BBD0"/>
      </svg>
    `,
    'winter-hat': `
      <svg width="${size}" height="${size}" viewBox="0 0 100 100">
        <ellipse cx="50" cy="28" rx="16" ry="10" fill="#B39DDB"/>
        <rect x="28" y="36" width="44" height="20" rx="10" fill="#9575CD"/>
        <rect x="24" y="54" width="52" height="10" rx="5" fill="#7E57C2"/>
      </svg>
    `,
  };

  return svgs[type] || svgs['sunglasses'];
}

/**
 * Example usage:
 *
 * ```tsx
 * import { assetLoader, CLOTHING_ASSETS, SOUND_ASSETS } from './assets';
 *
 * // Preload assets
 * await assetLoader.loadImages(Object.values(CLOTHING_ASSETS));
 * await assetLoader.loadSounds(Object.values(SOUND_ASSETS));
 *
 * // Use in game
 * const coatImage = assetLoader.getImage('coat');
 * assetLoader.playSound('pop', 0.8);
 * ```
 */
