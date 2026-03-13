/**
 * Catch & Sort Game Logic
 *
 * Falling objects sorting game for ages 4-8
 * @ticket CATCH-SORT
 */

export type ObjectType = 'fruit' | 'vegetable' | 'animal' | 'shape' | 'number';

export interface FallingObject {
  id: string;
  type: ObjectType;
  emoji: string;
  x: number;
  y: number;
  speed: number;
}

export interface Bin {
  id: string;
  type: ObjectType;
  emoji: string;
  label: string;
  x: number;
  items: number;
}

export interface Challenge {
  id: string;
  name: string;
  objectTypes: ObjectType[];
  spawnRate: number;
  duration: number;
  targetScore: number;
}

export interface GameState {
  status: 'menu' | 'playing' | 'success' | 'failure' | 'paused';
  currentChallengeId: string | null;
  objects: FallingObject[];
  bins: Bin[];
  score: number;
  caught: number;
  missed: number;
  timeLeft: number;
}

export const OBJECTS: Record<ObjectType, string[]> = {
  fruit: ['🍎', '🍌', '🍊', '🍇', '🍓', '🍑', '🍍'],
  vegetable: ['🥕', '🥦', '🌽', '🥔', '🍆', '🥒', '🧅'],
  animal: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻'],
  shape: ['🔴', '🟦', '🔺', '⭐', '⭕', '⬛', '🔶'],
  number: ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣'],
};

export const CHALLENGES: Challenge[] = [
  { id: 'fruits-only', name: 'Fruit Basket', objectTypes: ['fruit'], spawnRate: 2000, duration: 30, targetScore: 10 },
  { id: 'fruits-veggies', name: 'Healthy Foods', objectTypes: ['fruit', 'vegetable'], spawnRate: 1800, duration: 45, targetScore: 15 },
  { id: 'animals', name: 'Animal Sort', objectTypes: ['animal'], spawnRate: 1500, duration: 40, targetScore: 20 },
  { id: 'shapes', name: 'Shape Match', objectTypes: ['shape'], spawnRate: 1500, duration: 40, targetScore: 20 },
  { id: 'numbers', name: 'Number Catch', objectTypes: ['number'], spawnRate: 1200, duration: 50, targetScore: 25 },
  { id: 'mixed', name: 'Super Sorter', objectTypes: ['fruit', 'vegetable', 'animal'], spawnRate: 1000, duration: 60, targetScore: 30 },
];

export function createInitialState(): GameState {
  return {
    status: 'menu',
    currentChallengeId: null,
    objects: [],
    bins: [],
    score: 0,
    caught: 0,
    missed: 0,
    timeLeft: 0,
  };
}

export function startChallenge(state: GameState, challengeId: string): GameState {
  const challenge = CHALLENGES.find((c) => c.id === challengeId);
  if (!challenge) return state;

  const bins: Bin[] = challenge.objectTypes.map((type, idx) => ({
    id: `bin-${type}`,
    type,
    emoji: OBJECTS[type][0],
    label: type.charAt(0).toUpperCase() + type.slice(1) + 's',
    x: (idx + 1) * (100 / (challenge.objectTypes.length + 1)),
    items: 0,
  }));

  return {
    ...state,
    status: 'playing',
    currentChallengeId: challengeId,
    objects: [],
    bins,
    score: 0,
    caught: 0,
    missed: 0,
    timeLeft: challenge.duration,
  };
}

export function spawnObject(state: GameState): GameState {
  const challenge = CHALLENGES.find((c) => c.id === state.currentChallengeId);
  if (!challenge) return state;

  const type = challenge.objectTypes[Math.floor(Math.random() * challenge.objectTypes.length)];
  const emoji = OBJECTS[type][Math.floor(Math.random() * OBJECTS[type].length)];

  const newObject: FallingObject = {
    id: `obj-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type,
    emoji,
    x: 10 + Math.random() * 80,
    y: 0,
    speed: 1 + Math.random() * 2,
  };

  return { ...state, objects: [...state.objects, newObject] };
}

export function updateObjects(state: GameState): GameState {
  const updatedObjects = state.objects
    .map((obj) => ({ ...obj, y: obj.y + obj.speed }))
    .filter((obj) => obj.y < 100);

  const missed = state.objects.length - updatedObjects.length;

  return {
    ...state,
    objects: updatedObjects,
    missed: state.missed + missed,
  };
}

export function catchObject(state: GameState, objectId: string, binId: string): GameState {
  const obj = state.objects.find((o) => o.id === objectId);
  const bin = state.bins.find((b) => b.id === binId);
  if (!obj || !bin) return state;

  const isCorrect = obj.type === bin.type;
  const points = isCorrect ? 10 : -5;

  return {
    ...state,
    objects: state.objects.filter((o) => o.id !== objectId),
    bins: state.bins.map((b) =>
      b.id === binId ? { ...b, items: b.items + 1 } : b
    ),
    score: Math.max(0, state.score + points),
    caught: state.caught + 1,
  };
}

export function updateTimer(state: GameState): GameState {
  const newTimeLeft = state.timeLeft - 1;
  if (newTimeLeft <= 0) {
    return submitChallenge({ ...state, timeLeft: 0 });
  }
  return { ...state, timeLeft: newTimeLeft };
}

export function submitChallenge(state: GameState): GameState {
  const challenge = CHALLENGES.find((c) => c.id === state.currentChallengeId);
  if (!challenge) return state;

  const success = state.score >= challenge.targetScore;
  return {
    ...state,
    status: success ? 'success' : 'failure',
  };
}
