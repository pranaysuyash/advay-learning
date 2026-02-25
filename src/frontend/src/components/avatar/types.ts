/**
 * Avatar system types for child profile customization
 * Uses Kenney Platformer Pack assets
 */

export type AvatarType = 'platformer' | 'animal' | 'creature' | 'photo';

export type PlatformerColor = 'beige' | 'green' | 'pink' | 'purple' | 'yellow';

export type AnimalType = 'frog' | 'bee' | 'ladybug' | 'mouse' | 'snail' | 'fish_blue' | 'fish_purple' | 'fish_yellow';

export type CreatureType = 'slime_normal' | 'slime_fire' | 'slime_spike' | 'block' | 'barnacle';

export type AvatarAnimation = 'idle' | 'walk' | 'jump' | 'climb' | 'duck' | 'hit' | 'front';

export interface AvatarConfig {
  type: AvatarType;
  character: PlatformerColor | AnimalType | CreatureType | string;
  color?: PlatformerColor; // For platformer characters
  animation?: AvatarAnimation;
}

export interface AvatarOption {
  id: string;
  type: AvatarType;
  character: string;
  name: string;
  color?: string; // hex color for UI
  previewImage: string;
  sound?: string; // Sound effect name
}

// Avatar categories for the picker
export const AVATAR_CATEGORIES = [
  { id: 'platformer', label: 'Kids', icon: '👦' },
  { id: 'animal', label: 'Pets', icon: '🐸' },
  { id: 'creature', label: 'Magic', icon: '✨' },
  { id: 'photo', label: 'Photo', icon: '📷' },
] as const;

// Platformer character options
export const PLATFORMER_AVATARS: AvatarOption[] = [
  { id: 'beige', type: 'platformer', character: 'beige', name: 'Sandy', color: '#D4A574', previewImage: '/assets/kenney/platformer/characters/character_beige_idle.png' },
  { id: 'green', type: 'platformer', character: 'green', name: 'Lime', color: '#7CB342', previewImage: '/assets/kenney/platformer/characters/character_green_idle.png' },
  { id: 'pink', type: 'platformer', character: 'pink', name: 'Rosy', color: '#F06292', previewImage: '/assets/kenney/platformer/characters/character_pink_idle.png' },
  { id: 'purple', type: 'platformer', character: 'purple', name: 'Grape', color: '#BA68C8', previewImage: '/assets/kenney/platformer/characters/character_purple_idle.png' },
  { id: 'yellow', type: 'platformer', character: 'yellow', name: 'Sunny', color: '#FDD835', previewImage: '/assets/kenney/platformer/characters/character_yellow_idle.png' },
];

// Animal friend options
export const ANIMAL_AVATARS: AvatarOption[] = [
  { id: 'frog', type: 'animal', character: 'frog', name: 'Froggy', color: '#66BB6A', previewImage: '/assets/kenney/platformer/enemies/frog_idle.png', sound: 'jump' },
  { id: 'bee', type: 'animal', character: 'bee', name: 'Buzz', color: '#FFCA28', previewImage: '/assets/kenney/platformer/enemies/bee_rest.png', sound: 'select' },
  { id: 'ladybug', type: 'animal', character: 'ladybug', name: 'Dots', color: '#EF5350', previewImage: '/assets/kenney/platformer/enemies/ladybug_rest.png' },
  { id: 'mouse', type: 'animal', character: 'mouse', name: 'Squeak', color: '#78909C', previewImage: '/assets/kenney/platformer/enemies/mouse_rest.png' },
  { id: 'snail', type: 'animal', character: 'snail', name: 'Shelly', color: '#8D6E63', previewImage: '/assets/kenney/platformer/enemies/snail_rest.png' },
];

// Magical creature options
export const CREATURE_AVATARS: AvatarOption[] = [
  { id: 'slime_normal', type: 'creature', character: 'slime_normal', name: 'Gloop', color: '#81C784', previewImage: '/assets/kenney/platformer/enemies/slime_normal_rest.png' },
  { id: 'slime_fire', type: 'creature', character: 'slime_fire', name: 'Flame', color: '#FF7043', previewImage: '/assets/kenney/platformer/enemies/slime_fire_rest.png' },
  { id: 'slime_spike', type: 'creature', character: 'slime_spike', name: 'Spike', color: '#90A4AE', previewImage: '/assets/kenney/platformer/enemies/slime_spike_rest.png' },
  { id: 'block', type: 'creature', character: 'block', name: 'Blocky', color: '#FFB74D', previewImage: '/assets/kenney/platformer/enemies/block_idle.png' },
];

// Get all avatars as a flat list
export const ALL_AVATARS: AvatarOption[] = [
  ...PLATFORMER_AVATARS,
  ...ANIMAL_AVATARS,
  ...CREATURE_AVATARS,
];

// Helper to get avatar by ID
export function getAvatarById(id: string): AvatarOption | undefined {
  return ALL_AVATARS.find(a => a.id === id);
}

// Helper to get avatar image URL based on config
export function getAvatarImageUrl(config?: AvatarConfig | null, animation: AvatarAnimation = 'idle'): string {
  if (!config) {
    // Default fallback
    return '/assets/kenney/platformer/characters/character_beige_idle.png';
  }

  if (config.type === 'photo' && config.character) {
    // Photo URL is stored directly in character field
    return config.character;
  }

  if (config.type === 'platformer') {
    const color = (config.character as PlatformerColor) || 'beige';
    const anim = animation === 'walk' ? 'walk_a' : animation;
    return `/assets/kenney/platformer/characters/character_${color}_${anim}.png`;
  }

  if (config.type === 'animal') {
    const animal = config.character as AnimalType;
    switch (animal) {
      case 'frog':
        return animation === 'jump' 
          ? '/assets/kenney/platformer/enemies/frog_jump.png'
          : '/assets/kenney/platformer/enemies/frog_idle.png';
      case 'bee':
        return animation === 'walk'
          ? '/assets/kenney/platformer/enemies/bee_a.png'
          : '/assets/kenney/platformer/enemies/bee_rest.png';
      case 'ladybug':
        return animation === 'walk'
          ? '/assets/kenney/platformer/enemies/ladybug_walk_a.png'
          : '/assets/kenney/platformer/enemies/ladybug_rest.png';
      case 'mouse':
        return animation === 'walk'
          ? '/assets/kenney/platformer/enemies/mouse_walk_a.png'
          : '/assets/kenney/platformer/enemies/mouse_rest.png';
      case 'snail':
        return animation === 'walk'
          ? '/assets/kenney/platformer/enemies/snail_walk_a.png'
          : '/assets/kenney/platformer/enemies/snail_rest.png';
      default:
        return '/assets/kenney/platformer/enemies/frog_idle.png';
    }
  }

  if (config.type === 'creature') {
    const creature = config.character as CreatureType;
    if (creature.startsWith('slime_')) {
      const type = creature.replace('slime_', '');
      return animation === 'walk'
        ? `/assets/kenney/platformer/enemies/slime_${type}_walk_a.png`
        : `/assets/kenney/platformer/enemies/slime_${type}_rest.png`;
    }
    if (creature === 'block') {
      return '/assets/kenney/platformer/enemies/block_idle.png';
    }
  }

  return '/assets/kenney/platformer/characters/character_beige_idle.png';
}

// Age badge color based on age
export function getAgeBadgeColor(age: number): string {
  if (age < 3) return '#F48FB1'; // Soft pink (2-3)
  if (age < 6) return '#64B5F6'; // Sky blue (4-5)
  if (age < 8) return '#AED581'; // Lime green (6-7)
  return '#BA68C8'; // Purple (8+)
}
