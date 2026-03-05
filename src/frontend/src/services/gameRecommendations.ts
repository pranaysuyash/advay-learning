import { getListedGames, VIBE_CONFIG } from '../data/gameRegistry';
import type { GameManifest, GameVibe } from '../data/gameRegistry';
import type { GlobalGameStat } from '../hooks/useGameStats';

export type RecommendationSlot = 
  | 'trending'
  | 'continue'
  | 'new'
  | 'popular'
  | 'recommended'
  | 'unplayed'
  | 'discover';

export interface GameRecommendation {
  slot: RecommendationSlot;
  title: string;
  subtitle?: string;
  games: RecommendedGame[];
}

export interface RecommendedGame {
  id: string;
  title: string;
  tagline: string;
  path: string;
  icon: string;
  ageRange: string;
  vibe: GameVibe;
  isNew?: boolean;
  matchReason?: string;
  badge?: {
    icon: string;
    label: string;
    subtitle?: string;
  };
}

export type GameStatsMap = Record<string, GlobalGameStat> | Map<string, GlobalGameStat>;

interface RecommendationConfig {
  profileAge?: number;
  playedGameIds: string[];
  gameStats?: GameStatsMap;
  limit?: number;
}

function getGameStat(gameStats: GameStatsMap | undefined, gameId: string): GlobalGameStat | undefined {
  if (!gameStats) return undefined;
  return gameStats instanceof Map ? gameStats.get(gameId) : gameStats[gameId];
}

const VIBE_BY_HOUR: Record<number, GameVibe> = {
  0: 'relaxed', 1: 'relaxed', 2: 'relaxed', 3: 'relaxed', 4: 'relaxed',
  5: 'relaxed', 6: 'chill', 7: 'chill', 8: 'brainy', 9: 'brainy',
  10: 'focus', 11: 'focus', 12: 'active', 13: 'active', 14: 'active',
  15: 'creative', 16: 'creative', 17: 'active', 18: 'active', 19: 'musical',
  20: 'chill', 21: 'relaxed', 22: 'relaxed', 23: 'relaxed',
};

export function getTimeBasedVibe(): GameVibe {
  const hour = new Date().getHours();
  return VIBE_BY_HOUR[hour] || 'chill';
}

export function getWeekNumber(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const diff = now.getTime() - start.getTime();
  const oneWeek = 1000 * 60 * 60 * 24 * 7;
  return Math.floor(diff / oneWeek);
}

function parseAgeRange(ageRange: string): { min: number; max: number } {
  const match = ageRange.match(/(\d+)-(\d+)/);
  if (!match) return { min: 2, max: 10 };
  return { min: parseInt(match[1]), max: parseInt(match[2]) };
}

function isAgeAppropriate(game: GameManifest, profileAge?: number): boolean {
  if (!profileAge) return true;
  const { min, max } = parseAgeRange(game.ageRange);
  return profileAge >= min - 1 && profileAge <= max + 1;
}

function filterByCapability(games: GameManifest[]): GameManifest[] {
  if (typeof window === 'undefined') return games;
  
  const hasCamera = typeof navigator !== 'undefined' && 
    navigator.mediaDevices && 
    navigator.mediaDevices.getUserMedia;
  
  return games.filter(game => {
    if (!game.cv || game.cv.length === 0) return true;
    if (!hasCamera && (game.cv.includes('hand') || game.cv.includes('pose') || game.cv.includes('face'))) {
      return false;
    }
    return true;
  });
}

function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function createRecommendedGame(
  game: GameManifest,
  stats?: GlobalGameStat,
  matchReason?: string,
): RecommendedGame {
  let badge: RecommendedGame['badge'];
  
  if (stats) {
    if (stats.age_cohort_rank <= 3) {
      badge = {
        icon: '🔥',
        label: 'TRENDING',
        subtitle: `${stats.total_plays.toLocaleString()} kids played this week!`,
      };
    } else if (stats.completion_rate >= 0.8) {
      badge = {
        icon: '⭐',
        label: 'TOP RATED',
        subtitle: `${Math.round(stats.completion_rate * 100)}% finish rate`,
      };
    }
  }
  
  return {
    id: game.id,
    title: game.name,
    tagline: game.tagline,
    path: game.path,
    icon: typeof game.icon === 'string' ? game.icon : 'gamepad',
    ageRange: game.ageRange,
    vibe: game.vibe,
    isNew: game.isNew,
    matchReason,
    badge,
  };
}

export function getRecommendedGames(config: RecommendationConfig): GameRecommendation[] {
  const { profileAge, playedGameIds = [], gameStats, limit = 4 } = config;
  
  const allGames = getListedGames().filter((g: GameManifest) => g.listed);
  const availableGames = filterByCapability(allGames);
  const unplayedGames = availableGames.filter((g: GameManifest) => !playedGameIds.includes(g.id));
  const playedGames = availableGames.filter((g: GameManifest) => playedGameIds.includes(g.id));
  
  const timeVibe = getTimeBasedVibe();
  const weekNumber = getWeekNumber();
  const recommendations: GameRecommendation[] = [];

  const toRecommended = (game: GameManifest, reason?: string): RecommendedGame => 
    createRecommendedGame(game, getGameStat(gameStats, game.id), reason);

  // Slot 1: TRENDING - Based on real global popularity data
  if (gameStats) {
    const trendingGames = availableGames
      .filter((g: GameManifest) => isAgeAppropriate(g, profileAge))
      .map((g: GameManifest) => ({
        game: g,
        stats: getGameStat(gameStats, g.id),
        score: getGameStat(gameStats, g.id)?.popularity_score || 0,
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(({ game, stats }) => createRecommendedGame(game, stats, 'Trending now!'));
    
    if (trendingGames.length > 0) {
      recommendations.push({
        slot: 'trending',
        title: '🔥 Trending This Week',
        subtitle: 'Popular with kids your age',
        games: trendingGames,
      });
    }
  }

  // Slot 2: CONTINUE PLAYING - Based on local play history
  if (playedGames.length > 0) {
    const continueGames = playedGames
      .sort((a: GameManifest, b: GameManifest) => 
        playedGameIds.indexOf(a.id) - playedGameIds.indexOf(b.id))
      .slice(0, limit)
      .map((g: GameManifest) => toRecommended(g, 'Continue playing'));
    recommendations.push({
      slot: 'continue',
      title: '▶️ Continue Playing',
      subtitle: 'Pick up where you left off',
      games: continueGames,
    });
  }

  // Slot 3: NEW GAMES - Based on isNew flag
  const newGames = availableGames
    .filter((g: GameManifest) => g.isNew)
    .slice(0, limit);
  if (newGames.length > 0) {
    recommendations.push({
      slot: 'new',
      title: '🆕 New Games',
      subtitle: 'Just added - be the first to play!',
      games: newGames.map((g: GameManifest) => toRecommended(g, 'Brand new!')),
    });
  }

  // Slot 4: POPULAR / WEEKLY ROTATION - Weekly rotating selection
  const weeklyIndex = (weekNumber * 2) % availableGames.length;
  const weeklyRotated = shuffle(availableGames)
    .slice(weeklyIndex, weeklyIndex + limit * 2)
    .filter((g: GameManifest) => isAgeAppropriate(g, profileAge))
    .slice(0, limit);
  recommendations.push({
    slot: 'popular',
    title: '⭐ Weekly Favorites',
    subtitle: 'This week\'s top picks',
    games: weeklyRotated.map((g: GameManifest) => toRecommended(g, 'Everyone loves this!')),
  });

  // Slot 5: VIBE-BASED - Time-of-day recommendation
  const vibeGames = availableGames
    .filter((g: GameManifest) => g.vibe === timeVibe && isAgeAppropriate(g, profileAge))
    .slice(0, limit);
  if (vibeGames.length > 0) {
    recommendations.push({
      slot: 'recommended',
      title: `✨ Perfect for ${VIBE_CONFIG[timeVibe]?.label || 'Now'}`,
      subtitle: 'Great vibes for this time of day',
      games: vibeGames.map((g: GameManifest) => 
        toRecommended(g, `Perfect ${VIBE_CONFIG[timeVibe]?.label} energy!`)
      ),
    });
  }

  // Slot 6: DISCOVER - Unplayed age-appropriate games
  if (unplayedGames.length > 0) {
    const discoverGames = unplayedGames
      .filter((g: GameManifest) => isAgeAppropriate(g, profileAge))
      .slice(0, limit);
    if (discoverGames.length > 0) {
      recommendations.push({
        slot: 'discover',
        title: '🎯 Haven\'t Tried Yet',
        subtitle: 'Discover something new!',
        games: discoverGames.map((g: GameManifest) => toRecommended(g, 'New to you!')),
      });
    }
  }

  return recommendations;
}

export function getGameRecommendationsForProfile(
  profileAge?: number,
  playedGameIds: string[] = [],
  gameStats?: GameStatsMap,
): GameRecommendation[] {
  return getRecommendedGames({
    profileAge,
    playedGameIds,
    gameStats,
    limit: 4,
  });
}

export function getAgeGroupFromAge(age: number): string {
  if (age <= 4) return '3-4';
  if (age <= 6) return '5-6';
  if (age <= 8) return '7-8';
  return '9-10';
}
