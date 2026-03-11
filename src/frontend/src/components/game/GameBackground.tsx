/* eslint-disable react-refresh/only-export-components */
/**
 * Game Background Component
 * 
 * Displays and selects Kenney platformer backgrounds.
 * Supports solid colors, gradients, and scenic backgrounds.
 * 
 * @example
 * <GameBackground type="hills" variant="color" />
 * <BackgroundSelector selected={bg} onSelect={setBg} />
 */

import { memo, useState, useCallback } from 'react';

export type BackgroundType = 
  | 'clouds'
  | 'desert'
  | 'hills'
  | 'mushrooms'
  | 'trees'
  | 'solid_cloud'
  | 'solid_dirt'
  | 'solid_grass'
  | 'solid_sand'
  | 'solid_sky';

export type BackgroundVariant = 'color' | 'fade' | 'solid';

interface GameBackgroundProps {
  /** Background type */
  type: BackgroundType;
  /** Visual variant */
  variant?: BackgroundVariant;
  /** Additional CSS class */
  className?: string;
  /** Custom styles */
  style?: React.CSSProperties;
  /** Children to render on top */
  children?: React.ReactNode;
}

const BASE_PATH = '/assets/kenney/platformer/backgrounds';

// Background metadata
export const BACKGROUND_METADATA: Record<BackgroundType, {
  name: string;
  description: string;
  hasColor: boolean;
  hasFade: boolean;
  hasSolid: boolean;
  category: 'scenic' | 'solid';
}> = {
  clouds: {
    name: 'Clouds',
    description: 'Cloudy sky background',
    hasColor: false,
    hasFade: false,
    hasSolid: true,
    category: 'scenic',
  },
  desert: {
    name: 'Desert',
    description: 'Desert landscape with dunes',
    hasColor: true,
    hasFade: true,
    hasSolid: false,
    category: 'scenic',
  },
  hills: {
    name: 'Hills',
    description: 'Rolling green hills',
    hasColor: true,
    hasFade: true,
    hasSolid: false,
    category: 'scenic',
  },
  mushrooms: {
    name: 'Mushrooms',
    description: 'Fantasy mushroom forest',
    hasColor: true,
    hasFade: true,
    hasSolid: false,
    category: 'scenic',
  },
  trees: {
    name: 'Trees',
    description: 'Forest with trees',
    hasColor: true,
    hasFade: true,
    hasSolid: false,
    category: 'scenic',
  },
  solid_cloud: {
    name: 'Cloud (Solid)',
    description: 'Light blue sky color',
    hasColor: false,
    hasFade: false,
    hasSolid: true,
    category: 'solid',
  },
  solid_dirt: {
    name: 'Dirt (Solid)',
    description: 'Brown dirt color',
    hasColor: false,
    hasFade: false,
    hasSolid: true,
    category: 'solid',
  },
  solid_grass: {
    name: 'Grass (Solid)',
    description: 'Green grass color',
    hasColor: false,
    hasFade: false,
    hasSolid: true,
    category: 'solid',
  },
  solid_sand: {
    name: 'Sand (Solid)',
    description: 'Yellow sand color',
    hasColor: false,
    hasFade: false,
    hasSolid: true,
    category: 'solid',
  },
  solid_sky: {
    name: 'Sky (Solid)',
    description: 'Blue sky color',
    hasColor: false,
    hasFade: false,
    hasSolid: true,
    category: 'solid',
  },
};

export const GameBackground = memo(function GameBackground({
  type,
  variant = 'color',
  className = '',
  style = {},
  children,
}: GameBackgroundProps) {
  const getBackgroundPath = (): string => {
    if (variant === 'solid' || type.startsWith('solid_')) {
      return `${BASE_PATH}/background_${type}.png`;
    }
    return `${BASE_PATH}/background_${variant}_${type}.png`;
  };

  const backgroundStyle: React.CSSProperties = {
    backgroundImage: `url(${getBackgroundPath()})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    ...style,
  };

  return (
    <div
      className={`relative w-full h-full ${className}`}
      style={backgroundStyle}
    >
      {children}
    </div>
  );
});

/**
 * Background selector for game settings
 */
export const BackgroundSelector = memo(function BackgroundSelector({
  selected,
  onSelect,
  category = 'all',
  showVariants = false,
}: {
  selected: { type: BackgroundType; variant?: BackgroundVariant };
  onSelect: (type: BackgroundType, variant?: BackgroundVariant) => void;
  category?: 'all' | 'scenic' | 'solid';
  showVariants?: boolean;
}) {
  const [selectedVariant, setSelectedVariant] = useState<BackgroundVariant>(
    selected.variant || 'color'
  );

  const backgrounds = Object.entries(BACKGROUND_METADATA)
    .filter(([_, meta]) => category === 'all' || meta.category === category);

  const handleSelect = useCallback((type: BackgroundType) => {
    const meta = BACKGROUND_METADATA[type];
    let variant: BackgroundVariant = 'solid';
    
    if (meta.category === 'scenic') {
      if (selectedVariant === 'color' && meta.hasColor) {
        variant = 'color';
      } else if (selectedVariant === 'fade' && meta.hasFade) {
        variant = 'fade';
      } else {
        variant = meta.hasColor ? 'color' : 'fade';
      }
    }
    
    onSelect(type, variant);
  }, [onSelect, selectedVariant]);

  return (
    <div className="space-y-4">
      {/* Variant selector for scenic backgrounds */}
      {showVariants && category !== 'solid' && (
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setSelectedVariant('color')}
            className={`px-3 py-1 rounded text-sm ${
              selectedVariant === 'color'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200'
            }`}
          >
            Color
          </button>
          <button
            onClick={() => setSelectedVariant('fade')}
            className={`px-3 py-1 rounded text-sm ${
              selectedVariant === 'fade'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200'
            }`}
          >
            Fade
          </button>
        </div>
      )}

      {/* Background grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
        {backgrounds.map(([type, meta]) => (
          <button
            key={type}
            onClick={() => handleSelect(type as BackgroundType)}
            className={`relative aspect-video rounded-lg overflow-hidden border-2 transition-all ${
              selected.type === type
                ? 'border-blue-500 ring-2 ring-blue-200'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <GameBackground
              type={type as BackgroundType}
              variant={selectedVariant}
              className="absolute inset-0"
            />
            <span className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 truncate">
              {meta.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
});

/**
 * Get random background
 */
export const getRandomBackground = (category?: 'scenic' | 'solid'): {
  type: BackgroundType;
  variant: BackgroundVariant;
} => {
  const backgrounds = Object.entries(BACKGROUND_METADATA)
    .filter(([_, meta]) => !category || meta.category === category);
  
  const randomEntry = backgrounds[Math.floor(Math.random() * backgrounds.length)];
  const type = randomEntry[0] as BackgroundType;
  const meta = randomEntry[1];
  
  let variant: BackgroundVariant = 'solid';
  if (meta.category === 'scenic') {
    variant = meta.hasColor ? 'color' : 'fade';
  }
  
  return { type, variant };
};

/**
 * Background preview for settings
 */
export const BackgroundPreview = memo(function BackgroundPreview({
  type,
  variant = 'color',
  size = 120,
}: {
  type: BackgroundType;
  variant?: BackgroundVariant;
  size?: number;
}) {
  return (
    <div
      className="rounded-lg overflow-hidden border-2 border-gray-200"
      style={{ width: size, height: size * 0.6 }}
    >
      <GameBackground
        type={type}
        variant={variant}
        className="w-full h-full"
      />
    </div>
  );
});

export default GameBackground;
