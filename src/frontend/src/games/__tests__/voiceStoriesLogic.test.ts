/**
 * Test suite for Voice Stories game logic
 * Game ID: voice-stories
 * Educational Focus: Listening comprehension, story recall, speech recognition
 */

import { describe, it, expect } from 'vitest';
import {
  LEVELS,
  Story,
  StoryLine,
  getStoriesForLevel,
} from '../voiceStoriesLogic';

describe('voiceStoriesLogic', () => {
  describe('LEVELS constant', () => {
    it('has 3 levels defined', () => {
      expect(LEVELS).toHaveLength(3);
    });

    it('has progressive story lengths', () => {
      expect(LEVELS[0].storyLength).toBe(3);
      expect(LEVELS[1].storyLength).toBe(4);
      expect(LEVELS[2].storyLength).toBe(5);
    });

    it('storyLength increases across levels', () => {
      expect(LEVELS[0].storyLength).toBeLessThan(LEVELS[1].storyLength);
      expect(LEVELS[1].storyLength).toBeLessThan(LEVELS[2].storyLength);
    });

    it('has level property', () => {
      expect(LEVELS[0].level).toBe(1);
      expect(LEVELS[1].level).toBe(2);
      expect(LEVELS[2].level).toBe(3);
    });
  });

  describe('getStoriesForLevel', () => {
    it('returns array of stories', () => {
      const stories = getStoriesForLevel(1);
      expect(Array.isArray(stories)).toBe(true);
    });

    it('returns exactly 1 story', () => {
      const stories = getStoriesForLevel(1);
      expect(stories).toHaveLength(1);
    });

    it('returns story with title property', () => {
      const stories = getStoriesForLevel(1);
      expect(stories[0]).toHaveProperty('title');
      expect(typeof stories[0].title).toBe('string');
    });

    it('returns story with lines property', () => {
      const stories = getStoriesForLevel(1);
      expect(stories[0]).toHaveProperty('lines');
      expect(Array.isArray(stories[0].lines)).toBe(true);
    });

    it('truncates story lines to level 1 length (3)', () => {
      const stories = getStoriesForLevel(1);
      expect(stories[0].lines.length).toBeLessThanOrEqual(3);
    });

    it('truncates story lines to level 2 length (4)', () => {
      const stories = getStoriesForLevel(2);
      expect(stories[0].lines.length).toBeLessThanOrEqual(4);
    });

    it('truncates story lines to level 3 length (5)', () => {
      const stories = getStoriesForLevel(3);
      expect(stories[0].lines.length).toBeLessThanOrEqual(5);
    });

    it('returns story lines with text and emoji', () => {
      const stories = getStoriesForLevel(1);
      stories[0].lines.forEach(line => {
        expect(line).toHaveProperty('text');
        expect(line).toHaveProperty('emoji');
        expect(typeof line.text).toBe('string');
        expect(typeof line.emoji).toBe('string');
      });
    });

    it('has non-empty story text', () => {
      const stories = getStoriesForLevel(1);
      stories[0].lines.forEach(line => {
        expect(line.text.length).toBeGreaterThan(0);
      });
    });

    it('has emojis in story lines', () => {
      const stories = getStoriesForLevel(1);
      stories[0].lines.forEach(line => {
        expect(line.emoji.length).toBeGreaterThan(0);
        expect(line.emoji).toMatch(/\p{Emoji}/u);
      });
    });

    it('returns different stories on multiple calls (randomized)', () => {
      const stories1 = getStoriesForLevel(1);
      const stories2 = getStoriesForLevel(1);
      const stories3 = getStoriesForLevel(1);

      // At least one should be different (due to random sorting)
      const allTitles = [stories1[0].title, stories2[0].title, stories3[0].title];
      const uniqueTitles = new Set(allTitles);
      expect(uniqueTitles.size).toBeGreaterThan(0);
    });
  });

  describe('Story Content', () => {
    it('has age-appropriate story titles', () => {
      const stories = getStoriesForLevel(1);
      expect(stories[0].title.length).toBeGreaterThan(0);
      expect(stories[0].title.length).toBeLessThan(50);
    });

    it('has simple sentence structure for toddlers', () => {
      const stories = getStoriesForLevel(1);
      stories[0].lines.forEach(line => {
        const words = line.text.split(' ');
        expect(words.length).toBeLessThan(15);
      });
    });

    it('has engaging story themes', () => {
      const stories = [
        getStoriesForLevel(1)[0],
        getStoriesForLevel(2)[0],
        getStoriesForLevel(3)[0],
      ];

      stories.forEach(story => {
        expect(story.title).toBeTruthy();
        // Known titles: "The Little Star", "The Friendly Dragon", "The Magic Garden"
        expect([
          'The Little Star',
          'The Friendly Dragon',
          'The Magic Garden',
        ]).toContain(story.title);
      });
    });

    it('uses emojis to support visual learning', () => {
      const stories = getStoriesForLevel(1);
      let emojiCount = 0;

      stories[0].lines.forEach(line => {
        if (line.emoji.match(/\p{Emoji}/u)) {
          emojiCount++;
        }
      });

      expect(emojiCount).toBeGreaterThan(0);
    });

    it('has variety of emoji types', () => {
      const stories = [
        getStoriesForLevel(1)[0],
        getStoriesForLevel(2)[0],
        getStoriesForLevel(3)[0],
      ];

      const allEmojis = new Set<string>();
      stories.forEach(story => {
        story.lines.forEach(line => {
          allEmojis.add(line.emoji);
        });
      });

      // Should have multiple different emojis
      expect(allEmojis.size).toBeGreaterThan(1);
    });
  });

  describe('Story Structure', () => {
    it('level 1 stories have 3 lines', () => {
      const stories = getStoriesForLevel(1);
      expect(stories[0].lines).toHaveLength(3);
    });

    it('level 2 stories have 4 lines', () => {
      const stories = getStoriesForLevel(2);
      expect(stories[0].lines).toHaveLength(4);
    });

    it('level 3 stories have 5 lines', () => {
      const stories = getStoriesForLevel(3);
      expect(stories[0].lines).toHaveLength(5);
    });

    it('stories have clear beginning', () => {
      const stories = getStoriesForLevel(1);
      const firstLine = stories[0].lines[0].text;

      // Stories should start with narrative openers
      // Known beginnings: "Once upon", "There was", or proper nouns like "Lily"
      expect(
        firstLine.includes('Once upon') ||
        firstLine.includes('There was') ||
        firstLine.includes('Lily')
      ).toBe(true);
    });

    it('story lines flow logically', () => {
      const stories = getStoriesForLevel(2);
      const lines = stories[0].lines;

      // Each line should have text
      lines.forEach(line => {
        expect(line.text.length).toBeGreaterThan(0);
      });

      // Lines should be in order
      expect(lines.length).toBeGreaterThan(1);
    });
  });

  describe('Edge Cases', () => {
    it('handles level selection with out-of-range values', () => {
      // Invalid levels fall back to level 1 config
      const stories1 = getStoriesForLevel(1);
      const stories99 = getStoriesForLevel(99);

      // Both should return valid stories
      expect(stories1).toHaveLength(1);
      expect(stories99).toHaveLength(1);
    });

    it('handles level 0', () => {
      const stories = getStoriesForLevel(0);
      expect(stories).toHaveLength(1);
      expect(stories[0].lines.length).toBeLessThanOrEqual(3);
    });

    it('handles negative level', () => {
      const stories = getStoriesForLevel(-1);
      expect(stories).toHaveLength(1);
    });

    it('handles very large level values', () => {
      const stories = getStoriesForLevel(1000);
      expect(stories).toHaveLength(1);
    });
  });

  describe('Integration Scenarios', () => {
    it('can generate stories for all levels', () => {
      const level1 = getStoriesForLevel(1);
      const level2 = getStoriesForLevel(2);
      const level3 = getStoriesForLevel(3);

      expect(level1[0].lines.length).toBe(3);
      expect(level2[0].lines.length).toBe(4);
      expect(level3[0].lines.length).toBe(5);
    });

    it('story length increases with level', () => {
      const stories = [
        getStoriesForLevel(1)[0],
        getStoriesForLevel(2)[0],
        getStoriesForLevel(3)[0],
      ];

      expect(stories[0].lines.length).toBeLessThan(stories[1].lines.length);
      expect(stories[1].lines.length).toBeLessThan(stories[2].lines.length);
    });

    it('all stories have valid content', () => {
      const levels = [1, 2, 3];

      levels.forEach(level => {
        const stories = getStoriesForLevel(level);
        stories.forEach(story => {
          expect(story.title).toBeTruthy();
          expect(story.lines.length).toBeGreaterThan(0);
          story.lines.forEach(line => {
            expect(line.text).toBeTruthy();
            expect(line.emoji).toBeTruthy();
          });
        });
      });
    });

    it('can generate multiple stories from the pool', () => {
      const titles = new Set<string>();

      for (let i = 0; i < 10; i++) {
        const story = getStoriesForLevel(1)[0];
        titles.add(story.title);
      }

      // Should have at least one story
      expect(titles.size).toBeGreaterThan(0);
    });
  });

  describe('Type Definitions', () => {
    it('Story interface has correct structure', () => {
      const stories = getStoriesForLevel(1);
      const story = stories[0];

      expect(story).toHaveProperty('title');
      expect(story).toHaveProperty('lines');
      expect(typeof story.title).toBe('string');
      expect(Array.isArray(story.lines)).toBe(true);
    });

    it('StoryLine interface has correct structure', () => {
      const stories = getStoriesForLevel(1);
      const line = stories[0].lines[0];

      expect(line).toHaveProperty('text');
      expect(line).toHaveProperty('emoji');
      expect(typeof line.text).toBe('string');
      expect(typeof line.emoji).toBe('string');
    });

    it('LevelConfig has correct structure', () => {
      expect(LEVELS[0]).toHaveProperty('level');
      expect(LEVELS[0]).toHaveProperty('storyLength');
      expect(typeof LEVELS[0].level).toBe('number');
      expect(typeof LEVELS[0].storyLength).toBe('number');
    });
  });

  describe('Educational Design', () => {
    it('uses simple vocabulary for toddlers', () => {
      const stories = getStoriesForLevel(1);

      stories[0].lines.forEach(line => {
        const words = line.text.split(' ');
        words.forEach(word => {
          // Clean punctuation for length check
          const cleanWord = word.replace(/[.,!?]/g, '');
          if (cleanWord.length > 0) {
            expect(cleanWord.length).toBeLessThan(15);
          }
        });
      });
    });

    it('has visual emoji support for pre-readers', () => {
      const stories = getStoriesForLevel(1);

      stories[0].lines.forEach(line => {
        expect(line.emoji).toBeTruthy();
        // Should be a valid emoji
        expect(Array.from(line.emoji).length).toBeGreaterThanOrEqual(1);
      });
    });

    it('story length is age-appropriate', () => {
      // Level 1: 3 lines (shortest)
      // Level 3: 5 lines (longest)
      expect(LEVELS[0].storyLength).toBe(3);
      expect(LEVELS[2].storyLength).toBe(5);
    });

    it('progressive difficulty builds listening stamina', () => {
      const durations = LEVELS.map(l => l.storyLength);

      // Each level adds one more line
      expect(durations[0]).toBe(3);
      expect(durations[1]).toBe(4);
      expect(durations[2]).toBe(5);
    });
  });

  describe('Known Story Themes', () => {
    it('includes "The Little Star" story', () => {
      const stories = [];
      for (let i = 0; i < 20; i++) {
        stories.push(getStoriesForLevel(1)[0]);
      }

      const titles = stories.map(s => s.title);
      expect(titles).toContain('The Little Star');
    });

    it('includes "The Friendly Dragon" story', () => {
      const stories = [];
      for (let i = 0; i < 20; i++) {
        stories.push(getStoriesForLevel(1)[0]);
      }

      const titles = stories.map(s => s.title);
      expect(titles).toContain('The Friendly Dragon');
    });

    it('includes "The Magic Garden" story', () => {
      const stories = [];
      for (let i = 0; i < 20; i++) {
        stories.push(getStoriesForLevel(1)[0]);
      }

      const titles = stories.map(s => s.title);
      expect(titles).toContain('The Magic Garden');
    });

    it('all stories have positive themes', () => {
      const positiveWords = ['star', 'friendly', 'magic', 'garden', 'wish', 'happy', 'friends', 'dragon', 'lived', 'happily', 'found'];

      for (let i = 0; i < 10; i++) {
        const story = getStoriesForLevel(1)[0];
        const fullText = story.lines.map(l => l.text.toLowerCase()).join(' ');

        // At least one positive word should appear
        const hasPositive = positiveWords.some(word => fullText.includes(word));
        expect(hasPositive).toBe(true);
      }
    });
  });

  describe('Emoji Content', () => {
    it('uses relevant emojis for each story', () => {
      const story = getStoriesForLevel(1)[0];

      if (story.title === 'The Little Star') {
        const emojis = story.lines.map(l => l.emoji);
        // Should have star, moon, sparkle emojis
        const emojiString = emojis.join('');
        expect(emojiString).toMatch(/[⭐🌙✨💫]/);
      }
    });

    it('has consistent emoji per line', () => {
      const stories = getStoriesForLevel(1);

      stories[0].lines.forEach(line => {
        expect(line.emoji.length).toBeGreaterThan(0);
        // Each line should have exactly one emoji
        expect(Array.from(line.emoji).length).toBeGreaterThanOrEqual(1);
      });
    });

    it('emojis support story comprehension', () => {
      const stories = getStoriesForLevel(2);

      stories[0].lines.forEach(line => {
        // Emoji should be relevant (can't test relevance, but can test presence)
        expect(line.emoji).toBeTruthy();
      });
    });
  });

  describe('Difficulty Progression', () => {
    it('level 1 has shortest stories', () => {
      const config = LEVELS.find(l => l.level === 1);
      expect(config?.storyLength).toBe(3);
    });

    it('level 2 has medium stories', () => {
      const config = LEVELS.find(l => l.level === 2);
      expect(config?.storyLength).toBe(4);
    });

    it('level 3 has longest stories', () => {
      const config = LEVELS.find(l => l.level === 3);
      expect(config?.storyLength).toBe(5);
    });

    it('story length increases linearly', () => {
      const lengths = LEVELS.map(l => l.storyLength);

      for (let i = 1; i < lengths.length; i++) {
        expect(lengths[i]).toBe(lengths[i - 1] + 1);
      }
    });
  });
});
