/**
 * Bridge Builder Game Logic
 *
 * Cooperative bridge construction for ages 5-9
 * @ticket BRIDGE-BUILDER
 */

export interface BridgeSegment {
  id: string;
  x: number;
  y: number;
  type: 'plank' | 'rope' | 'support';
  connected: boolean;
}

export interface Challenge {
  id: string;
  name: string;
  gapWidth: number;
  maxSegments: number;
  minStrength: number;
}

export interface GameState {
  status: 'menu' | 'playing' | 'success' | 'failure';
  currentChallengeId: string | null;
  segments: BridgeSegment[];
  score: number;
  attempts: number;
  timeElapsed: number;
}

export const CHALLENGES: Challenge[] = [
  { id: 'small-creek', name: 'Small Creek', gapWidth: 3, maxSegments: 5, minStrength: 3 },
  { id: 'river', name: 'River Crossing', gapWidth: 5, maxSegments: 8, minStrength: 5 },
  { id: 'canyon', name: 'Grand Canyon', gapWidth: 8, maxSegments: 12, minStrength: 8 },
  { id: 'expert', name: 'Expert Engineer', gapWidth: 10, maxSegments: 15, minStrength: 10 },
];

export const SEGMENT_TYPES = {
  plank: { strength: 2, cost: 1, emoji: '🪵', color: '#8B4513' },
  rope: { strength: 1, cost: 0.5, emoji: '🪢', color: '#D2691E' },
  support: { strength: 3, cost: 2, emoji: '⛓️', color: '#696969' },
};

export function createInitialState(): GameState {
  return {
    status: 'menu',
    currentChallengeId: null,
    segments: [],
    score: 0,
    attempts: 0,
    timeElapsed: 0,
  };
}

export function startChallenge(state: GameState, challengeId: string): GameState {
  return {
    ...state,
    status: 'playing',
    currentChallengeId: challengeId,
    segments: [],
    timeElapsed: 0,
    attempts: state.attempts + 1,
  };
}

export function addSegment(
  state: GameState,
  x: number,
  y: number,
  type: BridgeSegment['type'],
): GameState {
  const challenge = CHALLENGES.find((c) => c.id === state.currentChallengeId);
  if (challenge && state.segments.length >= challenge.maxSegments) {
    return state;
  }

  const segment: BridgeSegment = {
    id: `seg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    x,
    y,
    type,
    connected: false,
  };

  return {
    ...state,
    segments: [...state.segments, segment],
  };
}

export function removeSegment(state: GameState, segmentId: string): GameState {
  return {
    ...state,
    segments: state.segments.filter((s) => s.id !== segmentId),
  };
}

export function calculateBridgeStrength(state: GameState): number {
  return state.segments.reduce((total, seg) => {
    return total + SEGMENT_TYPES[seg.type].strength;
  }, 0);
}

export function checkBridge(state: GameState): { valid: boolean; strength: number; feedback: string } {
  const challenge = CHALLENGES.find((c) => c.id === state.currentChallengeId);
  if (!challenge) {
    return { valid: false, strength: 0, feedback: 'No challenge selected!' };
  }

  const strength = calculateBridgeStrength(state);

  if (state.segments.length === 0) {
    return { valid: false, strength, feedback: 'Add segments to build your bridge!' };
  }

  if (strength < challenge.minStrength) {
    return { valid: false, strength, feedback: `Bridge too weak! Need ${challenge.minStrength} strength.` };
  }

  return { valid: true, strength, feedback: 'Bridge looks strong enough!' };
}

export function submitChallenge(state: GameState): GameState {
  const check = checkBridge(state);
  
  if (check.valid) {
    const challenge = CHALLENGES.find((c) => c.id === state.currentChallengeId)!;
    const efficiencyBonus = Math.max(0, (challenge.maxSegments - state.segments.length) * 10);
    const strengthBonus = check.strength * 5;
    
    return {
      ...state,
      status: 'success',
      score: state.score + 100 + efficiencyBonus + strengthBonus,
    };
  }

  return { ...state, status: 'failure' };
}

export function clearBridge(state: GameState): GameState {
  return { ...state, segments: [] };
}
