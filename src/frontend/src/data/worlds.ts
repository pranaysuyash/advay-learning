// Worlds replace "categories" — they're places to explore, not curriculum labels.
// The learning is invisible. The fun is front and center.

export interface World {
  id: string;
  name: string;
  emoji: string;
  color: string;
  bgGradient: string;
  description: string;
}

export const WORLDS: World[] = [
  {
    id: 'letter-land',
    name: 'Letter Land',
    emoji: '🔤',
    color: '#3B82F6',
    bgGradient: 'from-blue-50 to-indigo-50',
    description: 'Where letters come alive!',
  },
  {
    id: 'number-jungle',
    name: 'Number Jungle',
    emoji: '🔢',
    color: '#10B981',
    bgGradient: 'from-emerald-50 to-teal-50',
    description: 'Count, tap, and explore!',
  },
  {
    id: 'word-workshop',
    name: 'Word Workshop',
    emoji: '📝',
    color: '#6366F1',
    bgGradient: 'from-indigo-50 to-violet-50',
    description: 'Build words, hear sounds!',
  },
  {
    id: 'shape-garden',
    name: 'Shape Garden',
    emoji: '🔷',
    color: '#F59E0B',
    bgGradient: 'from-amber-50 to-yellow-50',
    description: 'Shapes are everywhere!',
  },
  {
    id: 'color-splash',
    name: 'Color Splash',
    emoji: '🎨',
    color: '#EC4899',
    bgGradient: 'from-pink-50 to-rose-50',
    description: 'A world full of color!',
  },
  {
    id: 'doodle-dock',
    name: 'Doodle Dock',
    emoji: '✏️',
    color: '#8B5CF6',
    bgGradient: 'from-violet-50 to-purple-50',
    description: 'Draw anything, anywhere!',
  },
  {
    id: 'steady-labs',
    name: 'Steady Labs',
    emoji: '🎯',
    color: '#EF4444',
    bgGradient: 'from-red-50 to-orange-50',
    description: 'Test your control!',
  },
  {
    id: 'sound-studio',
    name: 'Sound Studio',
    emoji: '🎵',
    color: '#06B6D4',
    bgGradient: 'from-cyan-50 to-sky-50',
    description: 'Make music with your hands!',
  },
  {
    id: 'mind-maze',
    name: 'Mind Maze',
    emoji: '🧩',
    color: '#14B8A6',
    bgGradient: 'from-teal-50 to-emerald-50',
    description: 'Puzzles and patterns!',
  },
  {
    id: 'body-zone',
    name: 'Body Zone',
    emoji: '🤸',
    color: '#F97316',
    bgGradient: 'from-orange-50 to-amber-50',
    description: 'Move, dance, freeze!',
  },
  {
    id: 'lab-of-wonders',
    name: 'Lab of Wonders',
    emoji: '🧪',
    color: '#A855F7',
    bgGradient: 'from-purple-50 to-fuchsia-50',
    description: 'Mix, discover, experiment!',
  },
  {
    id: 'feeling-forest',
    name: 'Feeling Forest',
    emoji: '💖',
    color: '#F43F5E',
    bgGradient: 'from-rose-50 to-pink-50',
    description: 'Explore every emotion!',
  },
  {
    id: 'art-atelier',
    name: 'Art Atelier',
    emoji: '🖌️',
    color: '#D946EF',
    bgGradient: 'from-fuchsia-50 to-purple-50',
    description: 'Create and imagine!',
  },
  {
    id: 'real-world',
    name: 'Real World',
    emoji: '🌍',
    color: '#059669',
    bgGradient: 'from-green-50 to-emerald-50',
    description: 'Skills for everyday!',
  },
  {
    id: 'story-corner',
    name: 'Story Corner',
    emoji: '📚',
    color: '#7C3AED',
    bgGradient: 'from-violet-50 to-indigo-50',
    description: 'Stories come to life!',
  },
];

export const WORLDS_BY_ID: Record<string, World> = Object.fromEntries(
  WORLDS.map((w) => [w.id, w])
);

export function getWorld(id: string): World | undefined {
  return WORLDS_BY_ID[id];
}

// Map old category names → new world IDs for migration
export const CATEGORY_TO_WORLD: Record<string, string> = {
  'Alphabets': 'letter-land',
  'Numbers': 'number-jungle',
  'Literacy': 'word-workshop',
  'Shapes': 'shape-garden',
  'Colors': 'color-splash',
  'Drawing': 'doodle-dock',
  'Motor Skills': 'steady-labs',
  'Music': 'sound-studio',
  'Memory': 'mind-maze',
  'Movement': 'body-zone',
  'Science': 'lab-of-wonders',
  'Emotions': 'feeling-forest',
  'Creativity': 'art-atelier',
  'Life Skills': 'real-world',
  'Logic': 'mind-maze',
  'Sports': 'body-zone',
};
