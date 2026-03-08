/**
 * Counting Collect-a-thon Game Logic
 *
 * Children collect a target number of specific items in a relaxed
 * platformer environment using Kenney platformer assets.
 *
 * Educational Focus:
 * - Counting 1-10
 * - Color recognition
 * - Hand-eye coordination
 * - Following instructions
 *
 * Controls:
 * - Hand position maps to character X
 * - Mouse/touch fallback for non-CV
 */

export type ItemType = 'star' | 'coin' | 'gem';

export interface FallingItem {
  id: number;
  type: ItemType;
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  active: boolean;
}

export interface GameRound {
  roundNumber: number;
  targetCount: number;
  targetType: ItemType;
  timeLimit: number;
  availableTypes: ItemType[];
}

export interface GameState {
  status: 'LOADING' | 'READY' | 'PLAYING' | 'ROUND_COMPLETE' | 'GAME_COMPLETE';
  currentRound: number;
  totalRounds: number;
  score: number;
  streak: number;
  timeRemaining: number;
  collected: number;
  targetCount: number;
  targetType: ItemType;
  items: FallingItem[];
  playerX: number;
  playerY: number;
  nextItemId: number;
  rounds: GameRound[];
}

export interface GameConfig {
  canvasWidth: number;
  canvasHeight: number;
  groundY: number;
  playerWidth: number;
  playerHeight: number;
  itemWidth: number;
  itemHeight: number;
  itemFallSpeed: number;
  spawnInterval: number;
  maxItemsOnScreen: number;
  ageBand: 'A' | 'B';
}

const ROUND_CONFIG_A: GameRound[] = [
  { roundNumber: 1, targetCount: 2, targetType: 'star', timeLimit: 45, availableTypes: ['star'] },
  { roundNumber: 2, targetCount: 3, targetType: 'star', timeLimit: 45, availableTypes: ['star'] },
  { roundNumber: 3, targetCount: 3, targetType: 'coin', timeLimit: 45, availableTypes: ['star', 'coin'] },
  { roundNumber: 4, targetCount: 4, targetType: 'star', timeLimit: 40, availableTypes: ['star', 'coin'] },
  { roundNumber: 5, targetCount: 4, targetType: 'gem', timeLimit: 40, availableTypes: ['star', 'coin', 'gem'] },
];

const ROUND_CONFIG_B: GameRound[] = [
  { roundNumber: 1, targetCount: 3, targetType: 'star', timeLimit: 45, availableTypes: ['star', 'coin'] },
  { roundNumber: 2, targetCount: 4, targetType: 'star', timeLimit: 45, availableTypes: ['star', 'coin'] },
  { roundNumber: 3, targetCount: 5, targetType: 'coin', timeLimit: 40, availableTypes: ['star', 'coin', 'gem'] },
  { roundNumber: 4, targetCount: 6, targetType: 'gem', timeLimit: 40, availableTypes: ['star', 'coin', 'gem'] },
  { roundNumber: 5, targetCount: 8, targetType: 'star', timeLimit: 35, availableTypes: ['star', 'coin', 'gem'] },
];

export const DEFAULT_CONFIG: GameConfig = {
  canvasWidth: 800,
  canvasHeight: 600,
  groundY: 520,
  playerWidth: 64,
  playerHeight: 64,
  itemWidth: 48,
  itemHeight: 48,
  itemFallSpeed: 120,
  spawnInterval: 1200,
  maxItemsOnScreen: 8,
  ageBand: 'B',
};

// DECISION-2026-03-08: Using game-scoped counter instead of UUID
// RATIONALE: Debuggability (sequential IDs), memory efficiency, no HTTPS requirement
// REVISIT: If multiplayer added, switch to UUID
// Note: nextItemId is now in GameState, reset per game instance

export function createInitialState(config: GameConfig = DEFAULT_CONFIG): GameState {
  const rounds = config.ageBand === 'A' ? ROUND_CONFIG_A : ROUND_CONFIG_B;
  const firstRound = rounds[0];

  return {
    status: 'READY',
    currentRound: 1,
    totalRounds: rounds.length,
    score: 0,
    streak: 0,
    timeRemaining: firstRound.timeLimit,
    collected: 0,
    targetCount: firstRound.targetCount,
    targetType: firstRound.targetType,
    items: [],
    playerX: config.canvasWidth / 2 - config.playerWidth / 2,
    playerY: config.groundY - config.playerHeight,
    nextItemId: 0,
    rounds,
  };
}

export function startGame(_state: GameState, config: GameConfig): GameState {
  const rounds = config.ageBand === 'A' ? ROUND_CONFIG_A : ROUND_CONFIG_B;
  const firstRound = rounds[0];

  return {
    ...createInitialState(config),
    status: 'PLAYING',
    rounds,
    targetCount: firstRound.targetCount,
    targetType: firstRound.targetType,
    timeRemaining: firstRound.timeLimit,
  };
}

export function updatePlayerPosition(
  state: GameState,
  handX: number,
  config: GameConfig
): GameState {
  if (state.status !== 'PLAYING') return state;

  // NaN/Infinity validation: silently reject invalid input but log for debugging
  // RATIONALE: CV pipeline can produce invalid values; we don't want to crash
  // DECISION-2026-03-08: Using console.warn (not telemetry) to avoid test complexity
  // REVISIT: Add structured telemetry when analytics system stabilizes
  if (!Number.isFinite(handX)) {
    // eslint-disable-next-line no-console
    console.warn('[CountingCollectathon] Invalid handX received:', handX);
    return state; // Preserve last valid position
  }

  const newX = Math.max(
    0,
    Math.min(config.canvasWidth - config.playerWidth, handX - config.playerWidth / 2)
  );

  return {
    ...state,
    playerX: newX,
  };
}

export function spawnItem(state: GameState, config: GameConfig): GameState {
  if (state.status !== 'PLAYING') return state;
  if (state.items.length >= config.maxItemsOnScreen) return state;

  const round = state.rounds[state.currentRound - 1];
  const types = round.availableTypes;
  const type = types[Math.floor(Math.random() * types.length)];
  const x = Math.random() * (config.canvasWidth - config.itemWidth);

  const newItem: FallingItem = {
    id: state.nextItemId,
    type,
    x,
    y: -config.itemHeight,
    vx: (Math.random() - 0.5) * 20,
    vy: config.itemFallSpeed,
    width: config.itemWidth,
    height: config.itemHeight,
    active: true,
  };

  return {
    ...state,
    items: [...state.items, newItem],
    nextItemId: state.nextItemId + 1,
  };
}

export function updateItems(
  state: GameState,
  config: GameConfig,
  deltaTime: number
): GameState {
  if (state.status !== 'PLAYING') return state;

  const updatedItems = state.items
    .map((item) => {
      if (!item.active) return item;
      return {
        ...item,
        x: item.x + item.vx * deltaTime,
        y: item.y + item.vy * deltaTime,
      };
    })
    .filter((item) => {
      if (item.y > config.canvasHeight) return false;
      if (item.x < -50 || item.x > config.canvasWidth + 50) return false;
      return item.active;
    });

  return {
    ...state,
    items: updatedItems,
  };
}

export function checkCollisions(
  state: GameState,
  config: GameConfig
): { state: GameState; collected: boolean; correct: boolean } {
  if (state.status !== 'PLAYING') {
    return { state, collected: false, correct: false };
  }

  const playerRect = {
    x: state.playerX + 8,
    y: state.playerY + 8,
    w: config.playerWidth - 16,
    h: config.playerHeight - 16,
  };

  let newCollected = state.collected;
  let newScore = state.score;
  let newStreak = state.streak;
  let correct = false;
  let collected = false;

  const updatedItems = state.items.map((item) => {
    if (!item.active) return item;

    const itemRect = {
      x: item.x,
      y: item.y,
      w: item.width,
      h: item.height,
    };

    if (rectsIntersect(playerRect, itemRect)) {
      collected = true;
      const isCorrect = item.type === state.targetType;

      if (isCorrect) {
        correct = true;
        newCollected++;
        newStreak++;
        const basePoints = 10;
        const streakBonus = Math.min(newStreak * 2, 15);
        newScore += basePoints + streakBonus;

        if (newCollected >= state.targetCount) {
          return { ...item, active: false };
        }
      } else {
        newStreak = 0;
      }

      return { ...item, active: false };
    }

    return item;
  });

  let newStatus: GameState['status'] = state.status;
  if (correct && newCollected >= state.targetCount) {
    newStatus = 'ROUND_COMPLETE';
  }

  return {
    state: {
      ...state,
      items: updatedItems,
      collected: newCollected,
      score: newScore,
      streak: newStreak,
      status: newStatus,
      // Item spawn tracking now handled via nextItemId in state
    },
    collected,
    correct,
  };
}

function rectsIntersect(a: { x: number; y: number; w: number; h: number }, b: { x: number; y: number; w: number; h: number }): boolean {
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );
}

export function updateTimer(state: GameState, deltaTime: number): GameState {
  if (state.status !== 'PLAYING') return state;

  const newTime = Math.max(0, state.timeRemaining - deltaTime);

  if (newTime <= 0) {
    return {
      ...state,
      timeRemaining: 0,
      status: 'GAME_COMPLETE',
    };
  }

  return {
    ...state,
    timeRemaining: newTime,
  };
}

export function advanceRound(state: GameState, _config: GameConfig): GameState {
  const nextRoundNumber = state.currentRound + 1;

  if (nextRoundNumber > state.totalRounds) {
    return {
      ...state,
      status: 'GAME_COMPLETE',
    };
  }

  const nextRound = state.rounds[nextRoundNumber - 1];

  return {
    ...state,
    status: 'PLAYING',
    currentRound: nextRoundNumber,
    collected: 0,
    targetCount: nextRound.targetCount,
    targetType: nextRound.targetType,
    timeRemaining: nextRound.timeLimit,
    items: [],
  };
}

export function calculateFinalScore(state: GameState): number {
  const timeBonus = Math.floor(state.timeRemaining * 2);
  const roundBonus = state.currentRound * 50;
  return state.score + timeBonus + roundBonus;
}

export function getItemEmoji(type: ItemType): string {
  switch (type) {
    case 'star':
      return '⭐';
    case 'coin':
      return '🪙';
    case 'gem':
      return '💎';
    default:
      return '⭐';
  }
}

export function getCollectFeedback(
  correct: boolean,
  currentStreak: number
): { message: string; emoji: string } {
  if (!correct) {
    return { message: 'Oops!', emoji: '😕' };
  }

  if (currentStreak >= 5) {
    return { message: 'Amazing!', emoji: '🎉' };
  } else if (currentStreak >= 3) {
    return { message: 'Great!', emoji: '🌟' };
  } else {
    return { message: 'Good!', emoji: '✨' };
  }
}
