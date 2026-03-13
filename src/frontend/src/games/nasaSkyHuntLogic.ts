/**
 * NASA Sky Hunt Game Logic
 *
 * Space exploration and constellation finding game for ages 6-12
 * Uses NASA APOD (Astronomy Picture of the Day) API for real space imagery
 * @ticket NASA-SKY-HUNT
 */

export interface CelestialObject {
  id: string;
  name: string;
  type: 'star' | 'planet' | 'galaxy' | 'nebula' | 'constellation';
  emoji: string;
  description: string;
  fact: string;
  difficulty: 'easy' | 'medium' | 'hard';
  position: { x: number; y: number }; // Percentage 0-100
}

export interface Challenge {
  id: string;
  name: string;
  description: string;
  targetObjects: string[]; // IDs of objects to find
  timeLimit: number; // seconds
  hint: string;
}

export interface GameState {
  status: 'menu' | 'playing' | 'success' | 'failure';
  currentChallengeId: string | null;
  foundObjects: string[];
  score: number;
  timeLeft: number;
  attempts: number;
  discoveredFacts: string[];
}

export const CELESTIAL_OBJECTS: CelestialObject[] = [
  {
    id: 'polaris',
    name: 'Polaris',
    type: 'star',
    emoji: '⭐',
    description: 'The North Star - guides travelers for centuries',
    fact: 'Polaris is actually a triple star system, not a single star!',
    difficulty: 'easy',
    position: { x: 50, y: 15 },
  },
  {
    id: 'orion',
    name: 'Orion',
    type: 'constellation',
    emoji: '🏹',
    description: 'The Hunter - one of the most recognizable constellations',
    fact: 'Orion\'s belt consists of three bright stars: Alnitak, Alnilam, and Mintaka.',
    difficulty: 'easy',
    position: { x: 70, y: 40 },
  },
  {
    id: 'big-dipper',
    name: 'Big Dipper',
    type: 'constellation',
    emoji: '🥄',
    description: 'Part of Ursa Major - looks like a drinking gourd',
    fact: 'The Big Dipper is not a constellation itself, but an asterism within Ursa Major.',
    difficulty: 'easy',
    position: { x: 25, y: 25 },
  },
  {
    id: 'mars',
    name: 'Mars',
    type: 'planet',
    emoji: '🔴',
    description: 'The Red Planet - our planetary neighbor',
    fact: 'Mars has the largest volcano in the solar system: Olympus Mons!',
    difficulty: 'medium',
    position: { x: 80, y: 60 },
  },
  {
    id: 'jupiter',
    name: 'Jupiter',
    type: 'planet',
    emoji: '🟤',
    description: 'The Giant - largest planet in our solar system',
    fact: 'Jupiter has 95 known moons! The four largest are called the Galilean moons.',
    difficulty: 'easy',
    position: { x: 15, y: 70 },
  },
  {
    id: 'andromeda',
    name: 'Andromeda Galaxy',
    type: 'galaxy',
    emoji: '🌀',
    description: 'Our neighboring galaxy - 2.5 million light years away',
    fact: 'Andromeda is on a collision course with our Milky Way! (Don\'t worry, it won\'t happen for 4 billion years)',
    difficulty: 'hard',
    position: { x: 85, y: 20 },
  },
  {
    id: 'pleiades',
    name: 'Pleiades',
    type: 'star',
    emoji: '✨',
    description: 'The Seven Sisters - a beautiful star cluster',
    fact: 'The Pleiades are young stars, only about 100 million years old!',
    difficulty: 'medium',
    position: { x: 40, y: 35 },
  },
  {
    id: 'crab-nebula',
    name: 'Crab Nebula',
    type: 'nebula',
    emoji: '🦀',
    description: 'Supernova remnant - the explosive death of a star',
    fact: 'Chinese astronomers recorded this supernova in 1054 AD - it was visible during the day!',
    difficulty: 'hard',
    position: { x: 60, y: 75 },
  },
  {
    id: 'saturn',
    name: 'Saturn',
    type: 'planet',
    emoji: '🪐',
    description: 'The Ringed Planet - most beautiful planet in our solar system',
    fact: 'Saturn\'s rings are made mostly of ice particles, with some rocky debris!',
    difficulty: 'medium',
    position: { x: 30, y: 55 },
  },
  {
    id: 'cassiopeia',
    name: 'Cassiopeia',
    type: 'constellation',
    emoji: '👑',
    description: 'The Queen - looks like a W or M in the sky',
    fact: 'Cassiopeia is opposite the North Star from the Big Dipper - they never appear together!',
    difficulty: 'medium',
    position: { x: 45, y: 10 },
  },
];

export const CHALLENGES: Challenge[] = [
  {
    id: 'easy-hunt',
    name: 'Beginner Astronomer',
    description: 'Find 3 easy objects: Polaris, Orion, and Jupiter',
    targetObjects: ['polaris', 'orion', 'jupiter'],
    timeLimit: 60,
    hint: 'Look for the bright star in the north, the hunter constellation, and the biggest planet!',
  },
  {
    id: 'planet-hunt',
    name: 'Planet Explorer',
    description: 'Find all 3 planets: Mars, Jupiter, and Saturn',
    targetObjects: ['mars', 'jupiter', 'saturn'],
    timeLimit: 45,
    hint: 'Planets don\'t twinkle like stars - look for steady lights!',
  },
  {
    id: 'constellation-hunt',
    name: 'Constellation Master',
    description: 'Find all constellations: Orion, Big Dipper, and Cassiopeia',
    targetObjects: ['orion', 'big-dipper', 'cassiopeia'],
    timeLimit: 90,
    hint: 'Connect the dots in the sky to see the patterns!',
  },
  {
    id: 'deep-space',
    name: 'Deep Space Explorer',
    description: 'Find the hardest objects: Andromeda and Crab Nebula',
    targetObjects: ['andromeda', 'crab-nebula', 'pleiades'],
    timeLimit: 120,
    hint: 'These are faint - look carefully and use your telescope!',
  },
  {
    id: 'full-sky',
    name: 'Full Sky Survey',
    description: 'Find all 10 celestial objects!',
    targetObjects: ['polaris', 'orion', 'big-dipper', 'mars', 'jupiter', 'andromeda', 'pleiades', 'crab-nebula', 'saturn', 'cassiopeia'],
    timeLimit: 180,
    hint: 'This is the ultimate challenge - find everything in the night sky!',
  },
];

/**
 * Create initial game state
 */
export function createInitialState(): GameState {
  return {
    status: 'menu',
    currentChallengeId: null,
    foundObjects: [],
    score: 0,
    timeLeft: 0,
    attempts: 0,
    discoveredFacts: [],
  };
}

/**
 * Start a challenge
 */
export function startChallenge(state: GameState, challengeId: string): GameState {
  const challenge = CHALLENGES.find((c) => c.id === challengeId);
  return {
    ...state,
    status: 'playing',
    currentChallengeId: challengeId,
    foundObjects: [],
    timeLeft: challenge?.timeLimit || 60,
    attempts: 0,
  };
}

/**
 * Try to find an object at a position
 */
export function findObjectAtPosition(
  state: GameState,
  x: number,
  y: number,
): { success: boolean; object?: CelestialObject; feedback: string } {
  const challenge = CHALLENGES.find((c) => c.id === state.currentChallengeId);
  if (!challenge) {
    return { success: false, feedback: 'No challenge active!' };
  }

  // Find object near click position (within 10% tolerance)
  const clickedObject = CELESTIAL_OBJECTS.find((obj) => {
    const dx = Math.abs(obj.position.x - x);
    const dy = Math.abs(obj.position.y - y);
    return dx < 10 && dy < 10 && challenge.targetObjects.includes(obj.id);
  });

  if (!clickedObject) {
    return { success: false, feedback: 'Nothing interesting there. Keep looking!' };
  }

  if (state.foundObjects.includes(clickedObject.id)) {
    return {
      success: false,
      object: clickedObject,
      feedback: `You already found ${clickedObject.name}!`,
    };
  }

  return {
    success: true,
    object: clickedObject,
    feedback: `Amazing! You found ${clickedObject.name}! ${clickedObject.fact}`,
  };
}

/**
 * Mark object as found
 */
export function markObjectFound(state: GameState, objectId: string): GameState {
  const object = CELESTIAL_OBJECTS.find((o) => o.id === objectId);
  if (!object) return state;

  const challenge = CHALLENGES.find((c) => c.id === state.currentChallengeId);
  const isTarget = challenge?.targetObjects.includes(objectId) || false;

  // Calculate points based on difficulty
  const difficultyPoints = { easy: 10, medium: 20, hard: 30 };
  const points = isTarget ? difficultyPoints[object.difficulty] : 5;

  return {
    ...state,
    foundObjects: [...state.foundObjects, objectId],
    score: state.score + points,
    discoveredFacts: state.discoveredFacts.includes(object.fact)
      ? state.discoveredFacts
      : [...state.discoveredFacts, object.fact],
  };
}

/**
 * Check if challenge is complete
 */
export function checkChallengeComplete(state: GameState): boolean {
  const challenge = CHALLENGES.find((c) => c.id === state.currentChallengeId);
  if (!challenge) return false;

  return challenge.targetObjects.every((id) => state.foundObjects.includes(id));
}

/**
 * Update timer
 */
export function updateTimer(state: GameState): GameState {
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

/**
 * Submit challenge result
 */
export function submitChallenge(state: GameState): GameState {
  const isComplete = checkChallengeComplete(state);
  
  if (isComplete) {
    // Time bonus
    const timeBonus = Math.floor(state.timeLeft / 5);
    const finalScore = state.score + timeBonus;

    return {
      ...state,
      status: 'success',
      score: finalScore,
    };
  }

  return {
    ...state,
    status: 'failure',
    attempts: state.attempts + 1,
  };
}

/**
 * Get hint for current challenge
 */
export function getHint(state: GameState): string {
  const challenge = CHALLENGES.find((c) => c.id === state.currentChallengeId);
  if (!challenge) return 'Select a challenge first!';

  const remaining = challenge.targetObjects.filter(
    (id) => !state.foundObjects.includes(id),
  );

  if (remaining.length === 0) {
    return 'You found everything! Submit your discovery!';
  }

  // Get a random remaining object as hint
  const nextObject = CELESTIAL_OBJECTS.find((o) => o.id === remaining[0]);
  if (nextObject) {
    const directions = [];
    if (nextObject.position.x < 33) directions.push('left');
    else if (nextObject.position.x > 66) directions.push('right');
    else directions.push('center');

    if (nextObject.position.y < 33) directions.push('top');
    else if (nextObject.position.y > 66) directions.push('bottom');
    else directions.push('middle');

    return `Look for ${nextObject.name} in the ${directions.join('-')} area! ${nextObject.description}`;
  }

  return challenge.hint;
}

/**
 * Get object by ID
 */
export function getObjectById(id: string): CelestialObject | undefined {
  return CELESTIAL_OBJECTS.find((o) => o.id === id);
}

/**
 * Get challenge progress
 */
export function getChallengeProgress(state: GameState): {
  found: number;
  total: number;
  percentage: number;
} {
  const challenge = CHALLENGES.find((c) => c.id === state.currentChallengeId);
  if (!challenge) return { found: 0, total: 0, percentage: 0 };

  const found = state.foundObjects.filter((id) =>
    challenge.targetObjects.includes(id),
  ).length;
  const total = challenge.targetObjects.length;

  return {
    found,
    total,
    percentage: Math.floor((found / total) * 100),
  };
}

/**
 * Calculate final score
 */
export function calculateFinalScore(state: GameState): {
  totalScore: number;
  objectsFound: number;
  factsLearned: number;
  challengesCompleted: number;
} {
  return {
    totalScore: state.score,
    objectsFound: state.foundObjects.length,
    factsLearned: state.discoveredFacts.length,
    challengesCompleted: Math.floor(state.score / 100),
  };
}
