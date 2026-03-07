import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getRecommendedGames,
  getGameRecommendationsForProfile,
  getTimeBasedVibe,
  getWeekNumber,
  getAgeGroupFromAge,
} from '../gameRecommendations';

vi.mock('../../data/gameRegistry', () => ({
  getListedGames: vi.fn(() => MOCK_GAMES),
  VIBE_CONFIG: {
    chill: { label: 'Chill', emoji: '😌', color: '#10B981' },
    active: { label: 'Active', emoji: '⚡', color: '#F59E0B' },
    creative: { label: 'Creative', emoji: '🎨', color: '#A855F7' },
    brainy: { label: 'Brainy', emoji: '🧠', color: '#3B82F6' },
    educational: { label: 'Educational', emoji: '📚', color: '#6366F1' },
    musical: { label: 'Musical', emoji: '🎵', color: '#EC4899' },
    puzzle: { label: 'Puzzle', emoji: '🧩', color: '#8B5CF6' },
    focus: { label: 'Focus', emoji: '🎯', color: '#14B8A6' },
    relaxed: { label: 'Relaxed', emoji: '😴', color: '#60A5FA' },
  },
}));

const MOCK_GAMES = [
  {
    id: 'game-1',
    name: 'Game One',
    tagline: 'Play game one!',
    path: '/games/game-1',
    icon: 'gamepad',
    ageRange: '3-5',
    vibe: 'chill' as const,
    listed: true,
    cv: [],
    drops: [],
    easterEggs: [],
  },
  {
    id: 'game-2',
    name: 'Game Two',
    tagline: 'Play game two!',
    path: '/games/game-2',
    icon: 'gamepad',
    ageRange: '4-6',
    vibe: 'active' as const,
    listed: true,
    cv: [],
    drops: [],
    easterEggs: [],
  },
  {
    id: 'game-3',
    name: 'Game Three',
    tagline: 'Play game three!',
    path: '/games/game-3',
    icon: 'gamepad',
    ageRange: '5-7',
    vibe: 'brainy' as const,
    listed: true,
    cv: [],
    drops: [],
    easterEggs: [],
    isNew: true,
  },
  {
    id: 'game-4',
    name: 'Game Four',
    tagline: 'Play game four!',
    path: '/games/game-4',
    icon: 'gamepad',
    ageRange: '6-8',
    vibe: 'creative' as const,
    listed: true,
    cv: [],
    drops: [],
    easterEggs: [],
  },
  {
    id: 'game-5',
    name: 'Game Five',
    tagline: 'Play game five!',
    path: '/games/game-5',
    icon: 'gamepad',
    ageRange: '3-6',
    vibe: 'musical' as const,
    listed: true,
    cv: [],
    drops: [],
    easterEggs: [],
  },
];

describe('gameRecommendations', () => {
  describe('getRecommendedGames', () => {
    it('should return recommendations array', () => {
      const result = getRecommendedGames({});
      expect(Array.isArray(result)).toBe(true);
    });

    it('should include new games when available', () => {
      const result = getRecommendedGames({});
      const newSection = result.find(r => r.slot === 'new');
      expect(newSection).toBeDefined();
      expect(newSection?.games.length).toBeGreaterThan(0);
    });

    it('should filter by age when profileAge provided', () => {
      const result = getRecommendedGames({ profileAge: 3 });
      expect(result.length).toBeGreaterThan(0);
    });

    it('should use game stats for trending when provided', () => {
      const stats = {
        'game-1': {
          game_key: 'game-1',
          game_name: 'Game One',
          total_plays: 1000,
          avg_session_minutes: 5,
          completion_rate: 0.8,
          popularity_score: 500,
          age_cohort_rank: 1,
        },
      };
      
      const result = getRecommendedGames({ gameStats: stats });
      const trendingSection = result.find(r => r.slot === 'trending');
      expect(trendingSection).toBeDefined();
    });

    it('should exclude played games from unplayed section', () => {
      const result = getRecommendedGames({ playedGameIds: ['game-1', 'game-2'] });
      const unplayedSection = result.find(r => r.slot === 'discover');
      
      if (unplayedSection) {
        const playedIds = unplayedSection.games.map(g => g.id);
        expect(playedIds).not.toContain('game-1');
        expect(playedIds).not.toContain('game-2');
      }
    });

    it('should limit games per section', () => {
      const result = getRecommendedGames({ limit: 2 });
      
      for (const section of result) {
        expect(section.games.length).toBeLessThanOrEqual(2);
      }
    });

    it('should apply custom limit', () => {
      const result = getRecommendedGames({ limit: 3 });
      
      for (const section of result) {
        expect(section.games.length).toBeLessThanOrEqual(3);
      }
    });
  });

  describe('getGameRecommendationsForProfile', () => {
    it('should return recommendations for profile', () => {
      const result = getGameRecommendationsForProfile(5, ['game-1']);
      expect(Array.isArray(result)).toBe(true);
    });

    it('should handle empty playedGameIds', () => {
      const result = getGameRecommendationsForProfile(5, []);
      expect(Array.isArray(result)).toBe(true);
    });

    it('should handle undefined profileAge', () => {
      const result = getGameRecommendationsForProfile(undefined, []);
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('getTimeBasedVibe', () => {
    it('should return a valid vibe', () => {
      const vibes = ['chill', 'active', 'creative', 'brainy', 'educational', 'musical', 'puzzle', 'focus', 'relaxed'];
      const vibe = getTimeBasedVibe();
      expect(vibes).toContain(vibe);
    });
  });

  describe('getWeekNumber', () => {
    it('should return a positive number', () => {
      const week = getWeekNumber();
      expect(week).toBeGreaterThan(0);
    });

    it('should be consistent across calls', () => {
      const week1 = getWeekNumber();
      const week2 = getWeekNumber();
      expect(week1).toBe(week2);
    });
  });

  describe('getAgeGroupFromAge', () => {
    it('should return 3-4 for age 3', () => {
      expect(getAgeGroupFromAge(3)).toBe('3-4');
    });

    it('should return 3-4 for age 4', () => {
      expect(getAgeGroupFromAge(4)).toBe('3-4');
    });

    it('should return 5-6 for age 5', () => {
      expect(getAgeGroupFromAge(5)).toBe('5-6');
    });

    it('should return 5-6 for age 6', () => {
      expect(getAgeGroupFromAge(6)).toBe('5-6');
    });

    it('should return 7-8 for age 7', () => {
      expect(getAgeGroupFromAge(7)).toBe('7-8');
    });

    it('should return 7-8 for age 8', () => {
      expect(getAgeGroupFromAge(8)).toBe('7-8');
    });

    it('should return 9-10 for age 9+', () => {
      expect(getAgeGroupFromAge(9)).toBe('9-10');
      expect(getAgeGroupFromAge(10)).toBe('9-10');
    });
  });

  describe('recommendation slots', () => {
    it('should have trending slot when stats provided', () => {
      const stats = {
        'game-1': {
          game_key: 'game-1',
          game_name: 'Game One',
          total_plays: 100,
          avg_session_minutes: 5,
          completion_rate: 0.7,
          popularity_score: 100,
          age_cohort_rank: 1,
        },
      };
      
      const result = getRecommendedGames({ gameStats: stats, profileAge: 5 });
      expect(result.some(r => r.slot === 'trending')).toBe(true);
    });

    it('should have continue slot when played games provided', () => {
      const result = getRecommendedGames({ playedGameIds: ['game-1'] });
      expect(result.some(r => r.slot === 'continue')).toBe(true);
    });

    it('should have new slot', () => {
      const result = getRecommendedGames({});
      expect(result.some(r => r.slot === 'new')).toBe(true);
    });

    it('should have popular slot', () => {
      const result = getRecommendedGames({});
      expect(result.some(r => r.slot === 'popular')).toBe(true);
    });

    it('should have recommended slot for vibe matching', () => {
      // Use fake timers to set a consistent time (6 AM = 'chill' vibe)
      // Hour 6 maps to 'chill' which matches game-1 in MOCK_GAMES
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2024-01-01T06:00:00'));
      
      const result = getRecommendedGames({});
      expect(result.some(r => r.slot === 'recommended')).toBe(true);
      
      vi.useRealTimers();
    });

    it('should have discover slot for unplayed games', () => {
      const result = getRecommendedGames({ playedGameIds: [] });
      expect(result.some(r => r.slot === 'discover')).toBe(true);
    });
  });

  describe('badges', () => {
    it('should add trending badge for top ranked games', () => {
      const stats = {
        'game-1': {
          game_key: 'game-1',
          game_name: 'Game One',
          total_plays: 1000,
          avg_session_minutes: 5,
          completion_rate: 0.9,
          popularity_score: 1000,
          age_cohort_rank: 1,
        },
      };
      
      const result = getRecommendedGames({ gameStats: stats });
      const trendingGames = result
        .find(r => r.slot === 'trending')?.games || [];
      
      expect(trendingGames.some(g => g.badge?.label === 'TRENDING')).toBe(true);
    });
  });
});
