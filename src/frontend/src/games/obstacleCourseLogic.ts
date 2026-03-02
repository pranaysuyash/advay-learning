import type { MovementSignal, PoseMovementType } from './poseMovementAnalysis';

export type ObstacleAction = PoseMovementType;

export interface ObstacleDefinition {
  id: string;
  action: ObstacleAction;
  label: string;
  instruction: string;
  icon: string;
  lane: number;
  color: string;
  timeLimitMs: number;
}

export interface ObstacleCourseRoundState {
  level: number;
  score: number;
  streak: number;
  bestStreak: number;
  currentIndex: number;
  completedObstacles: number;
  missedObstacles: number;
  startedAt: number;
  obstacleStartedAt: number;
  timeRemainingMs: number;
  status: 'playing' | 'complete';
  sequence: ObstacleDefinition[];
}

export const OBSTACLE_COURSE_CONFIG = {
  BASE_SEQUENCE_LENGTH: 3,
  MAX_SEQUENCE_LENGTH: 6,
  ROUND_DURATION_MS: 45000,
  BASE_OBSTACLE_WINDOW_MS: 5200,
  MIN_OBSTACLE_WINDOW_MS: 2800,
  POINTS_PER_SUCCESS: 25,
  CONFIDENCE_BONUS_SCALE: 15,
  STREAK_BONUS: 10,
  PERFECT_ROUND_BONUS: 60,
} as const;

const ACTION_TEMPLATES: Omit<ObstacleDefinition, 'id' | 'timeLimitMs'>[] = [
  {
    action: 'duck',
    label: 'Duck',
    instruction: 'Duck under the glowing bar.',
    icon: 'duck',
    lane: 1,
    color: '#F59E0B',
  },
  {
    action: 'jump',
    label: 'Jump',
    instruction: 'Jump over the rolling log.',
    icon: 'jump',
    lane: 1,
    color: '#10B981',
  },
  {
    action: 'sidestep-left',
    label: 'Step Left',
    instruction: 'Sidestep left around the rocks.',
    icon: 'left',
    lane: 0,
    color: '#3B82F6',
  },
  {
    action: 'sidestep-right',
    label: 'Step Right',
    instruction: 'Sidestep right around the rocks.',
    icon: 'right',
    lane: 2,
    color: '#8B5CF6',
  },
];

function getSequenceLength(level: number) {
  return Math.min(
    OBSTACLE_COURSE_CONFIG.BASE_SEQUENCE_LENGTH + (level - 1),
    OBSTACLE_COURSE_CONFIG.MAX_SEQUENCE_LENGTH,
  );
}

function getObstacleWindow(level: number) {
  return Math.max(
    OBSTACLE_COURSE_CONFIG.BASE_OBSTACLE_WINDOW_MS - ((level - 1) * 500),
    OBSTACLE_COURSE_CONFIG.MIN_OBSTACLE_WINDOW_MS,
  );
}

export function createObstacleSequence(
  level: number,
  count = getSequenceLength(level),
): ObstacleDefinition[] {
  const windowMs = getObstacleWindow(level);
  const startIndex = (level - 1) % ACTION_TEMPLATES.length;

  return Array.from({ length: count }, (_, index) => {
    const template = ACTION_TEMPLATES[(startIndex + index) % ACTION_TEMPLATES.length];

    return {
      ...template,
      id: `obstacle-${level}-${index}-${template.action}`,
      timeLimitMs: windowMs,
    };
  });
}

export function createObstacleCourseRoundState(
  level: number,
  now = Date.now(),
  carriedScore = 0,
  bestStreak = 0,
): ObstacleCourseRoundState {
  return {
    level,
    score: carriedScore,
    streak: 0,
    bestStreak,
    currentIndex: 0,
    completedObstacles: 0,
    missedObstacles: 0,
    startedAt: now,
    obstacleStartedAt: now,
    timeRemainingMs: OBSTACLE_COURSE_CONFIG.ROUND_DURATION_MS,
    status: 'playing',
    sequence: createObstacleSequence(level),
  };
}

export function getCurrentObstacle(
  state: ObstacleCourseRoundState,
): ObstacleDefinition | null {
  return state.sequence[state.currentIndex] ?? null;
}

export function matchesObstacleAction(
  obstacle: ObstacleDefinition,
  movement: MovementSignal | null,
): boolean {
  if (!movement) {
    return false;
  }

  return obstacle.action === movement.type;
}

export function advanceObstacleCourseState(
  state: ObstacleCourseRoundState,
  now = Date.now(),
): ObstacleCourseRoundState {
  if (state.status !== 'playing') {
    return state;
  }

  const elapsed = now - state.startedAt;
  const timeRemainingMs = Math.max(
    0,
    OBSTACLE_COURSE_CONFIG.ROUND_DURATION_MS - elapsed,
  );

  if (state.currentIndex >= state.sequence.length || timeRemainingMs === 0) {
    return {
      ...state,
      timeRemainingMs,
      status: 'complete',
    };
  }

  const currentObstacle = state.sequence[state.currentIndex];
  const obstacleAge = now - state.obstacleStartedAt;

  if (obstacleAge < currentObstacle.timeLimitMs) {
    return {
      ...state,
      timeRemainingMs,
    };
  }

  const nextIndex = state.currentIndex + 1;

  return {
    ...state,
    currentIndex: nextIndex,
    missedObstacles: state.missedObstacles + 1,
    streak: 0,
    obstacleStartedAt: now,
    timeRemainingMs,
    status: nextIndex >= state.sequence.length ? 'complete' : 'playing',
  };
}

export function completeCurrentObstacle(
  state: ObstacleCourseRoundState,
  movement: MovementSignal,
  now = Date.now(),
): ObstacleCourseRoundState {
  if (state.status !== 'playing') {
    return state;
  }

  const currentObstacle = getCurrentObstacle(state);
  if (!currentObstacle || !matchesObstacleAction(currentObstacle, movement)) {
    return state;
  }

  const nextStreak = state.streak + 1;
  const points =
    OBSTACLE_COURSE_CONFIG.POINTS_PER_SUCCESS +
    Math.round(movement.confidence * OBSTACLE_COURSE_CONFIG.CONFIDENCE_BONUS_SCALE) +
    ((nextStreak > 1) ? OBSTACLE_COURSE_CONFIG.STREAK_BONUS : 0);
  const nextIndex = state.currentIndex + 1;
  const isRoundComplete = nextIndex >= state.sequence.length;
  const perfectRoundBonus =
    isRoundComplete && state.missedObstacles === 0
      ? OBSTACLE_COURSE_CONFIG.PERFECT_ROUND_BONUS
      : 0;

  return {
    ...state,
    score: state.score + points + perfectRoundBonus,
    streak: nextStreak,
    bestStreak: Math.max(state.bestStreak, nextStreak),
    currentIndex: nextIndex,
    completedObstacles: state.completedObstacles + 1,
    obstacleStartedAt: now,
    timeRemainingMs: Math.max(
      0,
      OBSTACLE_COURSE_CONFIG.ROUND_DURATION_MS - (now - state.startedAt),
    ),
    status: isRoundComplete ? 'complete' : 'playing',
  };
}
