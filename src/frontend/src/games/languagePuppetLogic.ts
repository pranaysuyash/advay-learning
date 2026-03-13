/**
 * Language Puppet Game Logic
 *
 * Control a puppet with your hand! Make it talk, wave, and dance.
 * Uses hand tracking to control puppet movements
 * Ages 4-7
 * @ticket LANGUAGE-PUPPET
 */

export type PuppetExpression = 'happy' | 'surprised' | 'sad' | 'silly' | 'neutral';
export type PuppetGesture = 'wave' | 'point' | 'grab' | 'open' | 'fist';

export interface PuppetState {
  expression: PuppetExpression;
  gesture: PuppetGesture;
  positionX: number; // 0-100 percentage
  positionY: number; // 0-100 percentage
  isWaving: boolean;
  isTalking: boolean;
}

export interface Challenge {
  id: string;
  name: string;
  description: string;
  targetExpressions: PuppetExpression[];
  targetGestures: PuppetGesture[];
  timeLimit: number;
  hint: string;
}

export interface GameState {
  status: 'menu' | 'playing' | 'success' | 'failure';
  currentChallengeId: string | null;
  score: number;
  timeLeft: number;
  streak: number;
  completedExpressions: PuppetExpression[];
  completedGestures: PuppetGesture[];
  currentExpression: PuppetExpression;
  currentGesture: PuppetGesture;
}

export const EXPRESSIONS: { id: PuppetExpression; emoji: string; name: string }[] = [
  { id: 'happy', emoji: '😊', name: 'Happy' },
  { id: 'surprised', emoji: '😲', name: 'Surprised' },
  { id: 'sad', emoji: '😢', name: 'Sad' },
  { id: 'silly', emoji: '🤪', name: 'Silly' },
  { id: 'neutral', emoji: '😐', name: 'Neutral' },
];

export const GESTURES: { id: PuppetGesture; emoji: string; name: string }[] = [
  { id: 'wave', emoji: '👋', name: 'Wave' },
  { id: 'point', emoji: '👉', name: 'Point' },
  { id: 'grab', emoji: '✊', name: 'Grab' },
  { id: 'open', emoji: '🖐️', name: 'Open' },
  { id: 'fist', emoji: '👊', name: 'Fist' },
];

export const CHALLENGES: Challenge[] = [
  {
    id: 'puppet-show',
    name: 'Puppet Show',
    description: 'Make your puppet happy and wave!',
    targetExpressions: ['happy'],
    targetGestures: ['wave'],
    timeLimit: 45,
    hint: 'Show an open hand to make puppet happy!',
  },
  {
    id: 'emotion-master',
    name: 'Emotion Master',
    description: 'Show different expressions to the puppet!',
    targetExpressions: ['happy', 'surprised', 'sad'],
    targetGestures: [],
    timeLimit: 60,
    hint: 'Make different hand shapes for each emotion!',
  },
  {
    id: 'gesture-dance',
    name: 'Gesture Dance',
    description: 'Learn all the puppet gestures!',
    targetExpressions: [],
    targetGestures: ['wave', 'point', 'open', 'fist'],
    timeLimit: 60,
    hint: 'Try all the different hand poses!',
  },
  {
    id: 'puppet-master',
    name: 'Puppet Master',
    description: 'Master all expressions and gestures!',
    targetExpressions: ['happy', 'surprised', 'sad', 'silly'],
    targetGestures: ['wave', 'point', 'grab'],
    timeLimit: 90,
    hint: 'Show your best puppet performance!',
  },
];

export function createInitialState(): GameState {
  return {
    status: 'menu',
    currentChallengeId: null,
    score: 0,
    timeLeft: 0,
    streak: 0,
    completedExpressions: [],
    completedGestures: [],
    currentExpression: 'neutral',
    currentGesture: 'open',
  };
}

export function startChallenge(state: GameState, challengeId: string): GameState {
  const challenge = CHALLENGES.find((c) => c.id === challengeId);
  if (!challenge) return state;

  return {
    ...state,
    status: 'playing',
    currentChallengeId: challengeId,
    score: 0,
    timeLeft: challenge.timeLimit,
    streak: 0,
    completedExpressions: [],
    completedGestures: [],
    currentExpression: 'neutral',
    currentGesture: 'open',
  };
}

export function updateHandState(
  state: GameState,
  expression: PuppetExpression,
  gesture: PuppetGesture
): GameState {
  if (state.status !== 'playing') return state;

  const challenge = CHALLENGES.find((c) => c.id === state.currentChallengeId);
  if (!challenge) return state;

  const newState: GameState = {
    ...state,
    currentExpression: expression,
    currentGesture: gesture,
  };

  // Check if gesture matches target
  let matched = false;
  
  if (challenge.targetGestures.includes(gesture) && !state.completedGestures.includes(gesture)) {
    newState.completedGestures = [...state.completedGestures, gesture];
    matched = true;
  }

  if (challenge.targetExpressions.includes(expression) && !state.completedExpressions.includes(expression)) {
    newState.completedExpressions = [...state.completedExpressions, expression];
    matched = true;
  }

  if (matched) {
    const points = 10 + (newState.streak * 5);
    newState.score = state.score + points;
    newState.streak = state.streak + 1;
  } else {
    newState.streak = 0;
  }

  // Check if challenge is complete (always check, not just on match)
  const expressionsDone = challenge.targetExpressions.length === 0 || 
    challenge.targetExpressions.every(e => newState.completedExpressions.includes(e));
  const gesturesDone = challenge.targetGestures.length === 0 ||
    challenge.targetGestures.every(g => newState.completedGestures.includes(g));

  if (expressionsDone && gesturesDone) {
    newState.status = 'success';
  }

  return newState;
}

export function tick(state: GameState): GameState {
  if (state.status !== 'playing') return state;

  const newTimeLeft = state.timeLeft - 1;

  if (newTimeLeft <= 0) {
    return {
      ...state,
      timeLeft: 0,
      status: 'failure',
    };
  }

  return {
    ...state,
    timeLeft: newTimeLeft,
  };
}

export function calculateStars(score: number): number {
  if (score >= 60) return 3;
  if (score >= 30) return 2;
  if (score >= 10) return 1;
  return 0;
}

export function getHandGesture(fingerStates: number[]): PuppetGesture {
  // fingerStates: [thumb, index, middle, ring, pinky] - 1 = extended, 0 = closed
  const [thumb, index, middle, ring, pinky] = fingerStates;
  
  // Point: only index extended
  if (index === 1 && middle === 0 && ring === 0 && pinky === 0) return 'point';
  
  // Open: all fingers extended
  if (index === 1 && middle === 1 && ring === 1 && pinky === 1) return 'open';
  
  // Grab: thumb extended, others closed (must check before fist)
  if (thumb === 1 && index === 0 && middle === 0 && ring === 0 && pinky === 0) return 'grab';
  
  // Fist: all fingers closed (including thumb)
  if (index === 0 && middle === 0 && ring === 0 && pinky === 0 && thumb === 0) return 'fist';
  
  // Wave: index and pinky extended (simplified)
  if (index === 1 && middle === 0 && ring === 0 && pinky === 1) return 'wave';
  
  // Default to open
  return 'open';
}

export function getExpressionFromHand(handX: number, handY: number): PuppetExpression {
  // Map hand position to expression
  // Higher hand position (y < 0.5) = happy
  // Lower hand position (y > 0.5) = sad
  // Left side = surprised
  // Right side = silly
  
  if (handY < 0.4) return 'happy';
  if (handY > 0.7) return 'sad';
  if (handX < 0.3) return 'surprised';
  if (handX > 0.7) return 'silly';
  return 'neutral';
}
