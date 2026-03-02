/**
 * Voice Stories game logic — listen and follow along.
 */

export interface StoryLine {
  text: string;
  emoji: string;
}

export interface Story {
  title: string;
  lines: StoryLine[];
}

const STORIES: Story[] = [
  {
    title: 'The Little Star',
    lines: [
      { text: 'Once upon a time, there was a little star.', emoji: '⭐' },
      { text: 'The star lived in the night sky.', emoji: '🌙' },
      { text: 'Every night, the star shone very bright.', emoji: '✨' },
      { text: 'One day, a little girl wished upon the star.', emoji: '👧' },
      { text: 'The star granted her wish!', emoji: '💫' },
    ],
  },
  {
    title: 'The Friendly Dragon',
    lines: [
      { text: 'There was a dragon named Draco.', emoji: '🐉' },
      { text: 'Draco was not like other dragons.', emoji: '🤔' },
      { text: 'He did not breathe fire.', emoji: '🚫🔥' },
      { text: 'He made friends with the villagers.', emoji: '🏘️' },
      { text: 'They all lived happily ever after.', emoji: '❤️' },
    ],
  },
  {
    title: 'The Magic Garden',
    lines: [
      { text: 'Lily found a magic garden.', emoji: '🌸' },
      { text: 'The flowers could talk!', emoji: '🌺' },
      { text: 'A butterfly showed her around.', emoji: '🦋' },
      { text: 'She learned the secret of the garden.', emoji: '🔮' },
      { text: 'Now she visits every day.', emoji: '🌻' },
    ],
  },
];

export const LEVELS = [
  { level: 1, storyLength: 3 },
  { level: 2, storyLength: 4 },
  { level: 3, storyLength: 5 },
];

export function getStoriesForLevel(level: number) {
  const config = LEVELS.find(l => l.level === level) ?? LEVELS[0];
  const shuffled = [...STORIES].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 1).map(s => ({
    ...s,
    lines: s.lines.slice(0, config.storyLength),
  }));
}
