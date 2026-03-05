import { getListedGames, VIBE_CONFIG } from '../data/gameRegistry';
import type { GameManifest, GameVibe } from '../data/gameRegistry';

export type RecommendationSlot = 
  | 'continue'
  | 'new'
  | 'popular'
  | 'recommended'
  | 'unplayed'
  | 'discover';

export interface GameRecommendation {
  slot: RecommendationSlot;
  title: string;
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
}

interface RecommendationConfig {
  profileAge?: number;
  playedGameIds: string[];
  limit?: number;
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

export function getRecommendedGames(config: RecommendationConfig): GameRecommendation[] {
  const { profileAge, playedGameIds = [], limit = 4 } = config;
  
  const allGames = getListedGames().filter((g: GameManifest) => g.listed);
  const availableGames = filterByCapability(allGames);
  const unplayedGames = availableGames.filter((g: GameManifest) => !playedGameIds.includes(g.id));
  const playedGames = availableGames.filter((g: GameManifest) => playedGameIds.includes(g.id));
  
  const timeVibe = getTimeBasedVibe();
  const recommendations: GameRecommendation[] = [];

  const toRecommended = (game: GameManifest, reason?: string): RecommendedGame => ({
    id: game.id,
    title: game.name,
    tagline: game.tagline,
    path: game.path,
    icon: typeof game.icon === 'string' ? game.icon : 'gamepad',
    ageRange: game.ageRange,
    vibe: game.vibe,
    isNew: game.isNew,
    matchReason: reason,
  });

  if (playedGames.length > 0) {
    const continueGames = playedGames
      .sort((a, b) => playedGameIds.indexOf(a.id) - playedGameIds.indexOf(b.id))
      .slice(0, limit);
    recommendations.push({
      slot: 'continue',
      title: 'Continue Playing',
      games: continueGames.map(g => toRecommended(g, 'Recently played')),
    });
  }

  const newGames = availableGames
    .filter(g => g.isNew)
    .slice(0, limit);
  if (newGames.length > 0) {
    recommendations.push({
      slot: 'new',
      title: 'New Games',
      games: newGames.map(g => toRecommended(g, 'Just added!')),
    });
  }

  const popularGames = availableGames
    .sort(() => Math.random() - 0.5)
    .slice(0, limit);
  recommendations.push({
    slot: 'popular',
    title: 'Popular with Kids',
    games: popularGames.map(g => toRecommended(g, 'Everyone loves this!')),
  });

  const vibeGames = availableGames
    .filter(g => g.vibe === timeVibe)
    .slice(0, limit);
  if (vibeGames.length > 0) {
    recommendations.push({
      slot: 'recommended',
      title: `Perfect for ${VIBE_CONFIG[timeVibe]?.label || 'now'}`,
      games: vibeGames.map(g => toRecommended(g, `Great for ${VIBE_CONFIG[timeVibe]?.label || 'this time'}!`)),
    });
  }

  if (unplayedGames.length > 0) {
    const discoverGames = unplayedGames
      .filter(g => isAgeAppropriate(g, profileAge))
      .slice(0, limit);
    if (discoverGames.length > 0) {
      recommendations.push({
        slot: 'unplayed',
        title: "Haven't Tried Yet",
        games: discoverGames.map(g => toRecommended(g, 'New to you!')),
      });
    }
  }

  return recommendations;
}

export function getGameRecommendationsForProfile(
  profileAge?: number,
  playedGameIds: string[] = []
): GameRecommendation[] {
  return getRecommendedGames({
    profileAge,
    playedGameIds,
    limit: 4,
  });
}
