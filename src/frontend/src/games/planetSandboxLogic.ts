/**
 * Planet Sandbox Game Logic
 *
 * Build and explore planetary systems with physics simulation
 * @ticket PLANET-SANDBOX
 */

export interface Planet {
  id: string;
  name: string;
  type: 'rocky' | 'gas' | 'ice' | 'dwarf';
  color: string;
  size: number; // Relative size (1-10)
  distance: number; // Distance from sun (AU)
  speed: number; // Orbital speed
  moons: number;
  temperature: number; // Surface temp (Celsius)
  atmosphere: string;
  description: string;
  fact: string;
}

export interface Challenge {
  id: string;
  name: string;
  description: string;
  targetConfig: Partial<Planet>[];
  hint: string;
}

export interface GameState {
  status: 'menu' | 'playing' | 'success' | 'failure';
  currentChallengeId: string | null;
  planets: Planet[];
  selectedPlanetType: string | null;
  score: number;
  timeElapsed: number;
  attempts: number;
}

export const PLANET_TEMPLATES: Omit<Planet, 'id' | 'distance'>[] = [
  {
    name: 'Mercury-like',
    type: 'rocky',
    color: '#8C8C8C',
    size: 2,
    speed: 4,
    moons: 0,
    temperature: 167,
    atmosphere: 'Very thin',
    description: 'Small, fast, close to the sun',
    fact: 'Mercury is the fastest planet, orbiting the sun in just 88 Earth days!',
  },
  {
    name: 'Venus-like',
    type: 'rocky',
    color: '#E6E6B8',
    size: 4,
    speed: 3,
    moons: 0,
    temperature: 464,
    atmosphere: 'Thick CO2',
    description: 'Hot, cloudy, toxic atmosphere',
    fact: 'Venus spins backwards compared to most planets!',
  },
  {
    name: 'Earth-like',
    type: 'rocky',
    color: '#4A90D9',
    size: 4,
    speed: 2,
    moons: 1,
    temperature: 15,
    atmosphere: 'Nitrogen/Oxygen',
    description: 'Perfect for life, blue and green',
    fact: 'Earth is the only planet known to have life!',
  },
  {
    name: 'Mars-like',
    type: 'rocky',
    color: '#C1440E',
    size: 3,
    speed: 1.5,
    moons: 2,
    temperature: -65,
    atmosphere: 'Thin CO2',
    description: 'Red planet, dusty and cold',
    fact: 'Mars has the largest volcano in the solar system!',
  },
  {
    name: 'Jupiter-like',
    type: 'gas',
    color: '#D4A463',
    size: 8,
    speed: 0.8,
    moons: 79,
    temperature: -110,
    atmosphere: 'Hydrogen/Helium',
    description: 'Giant planet with stripes',
    fact: 'Jupiter has a storm called the Great Red Spot that is bigger than Earth!',
  },
  {
    name: 'Saturn-like',
    type: 'gas',
    color: '#F4D03F',
    size: 7,
    speed: 0.6,
    moons: 82,
    temperature: -140,
    atmosphere: 'Hydrogen/Helium',
    description: 'Beautiful rings made of ice',
    fact: 'Saturn is less dense than water - it would float!',
  },
  {
    name: 'Uranus-like',
    type: 'ice',
    color: '#AED6F1',
    size: 5,
    speed: 0.4,
    moons: 27,
    temperature: -195,
    atmosphere: 'Hydrogen/Helium/Methane',
    description: 'Blue ice giant, sideways spin',
    fact: 'Uranus spins on its side like a rolling ball!',
  },
  {
    name: 'Neptune-like',
    type: 'ice',
    color: '#5B7CFF',
    size: 5,
    speed: 0.3,
    moons: 14,
    temperature: -200,
    atmosphere: 'Hydrogen/Helium/Methane',
    description: 'Deep blue, farthest planet',
    fact: 'Neptune has the strongest winds in the solar system - up to 1,200 mph!',
  },
];

export const CHALLENGES: Challenge[] = [
  {
    id: 'inner-system',
    name: 'Inner Solar System',
    description: 'Create the rocky inner planets: Mercury, Venus, Earth, Mars',
    targetConfig: [
      { type: 'rocky', size: 2 },
      { type: 'rocky', size: 4 },
      { type: 'rocky', size: 4 },
      { type: 'rocky', size: 3 },
    ],
    hint: 'Place rocky planets close to the sun. Order: small, medium, medium, small-mars.',
  },
  {
    id: 'gas-giants',
    name: 'Gas Giants',
    description: 'Add the gas giants: Jupiter and Saturn',
    targetConfig: [
      { type: 'gas', size: 8 },
      { type: 'gas', size: 7 },
    ],
    hint: 'Gas giants are BIG and far from the sun!',
  },
  {
    id: 'ice-giants',
    name: 'Ice Giants',
    description: 'Complete with Uranus and Neptune',
    targetConfig: [
      { type: 'ice', size: 5 },
      { type: 'ice', size: 5 },
    ],
    hint: 'Ice giants are blue and very cold, placed farthest away.',
  },
  {
    id: 'full-system',
    name: 'Full Solar System',
    description: 'Build all 8 planets in order!',
    targetConfig: [
      { type: 'rocky', size: 2 },
      { type: 'rocky', size: 4 },
      { type: 'rocky', size: 4 },
      { type: 'rocky', size: 3 },
      { type: 'gas', size: 8 },
      { type: 'gas', size: 7 },
      { type: 'ice', size: 5 },
      { type: 'ice', size: 5 },
    ],
    hint: 'Remember: My Very Educated Mother Just Served Us Noodles!',
  },
  {
    id: 'habitable-zone',
    name: 'Goldilocks Zone',
    description: 'Find the perfect spot for an Earth-like planet!',
    targetConfig: [
      { type: 'rocky', size: 4, distance: 2 },
    ],
    hint: 'Not too hot, not too cold - just right for liquid water!',
  },
];

/**
 * Create initial game state
 */
export function createInitialState(): GameState {
  return {
    status: 'menu',
    currentChallengeId: null,
    planets: [],
    selectedPlanetType: null,
    score: 0,
    timeElapsed: 0,
    attempts: 0,
  };
}

/**
 * Start a challenge
 */
export function startChallenge(state: GameState, challengeId: string): GameState {
  return {
    ...state,
    status: 'playing',
    currentChallengeId: challengeId,
    planets: [],
    selectedPlanetType: null,
    timeElapsed: 0,
    attempts: 0,
  };
}

/**
 * Add a planet at a distance
 */
export function addPlanet(
  state: GameState,
  templateIndex: number,
  distance: number,
): GameState {
  const template = PLANET_TEMPLATES[templateIndex];
  if (!template) return state;

  const planet: Planet = {
    ...template,
    id: `planet-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    distance: Math.max(0.5, Math.min(10, distance)),
  };

  return {
    ...state,
    planets: [...state.planets, planet],
  };
}

/**
 * Remove a planet
 */
export function removePlanet(state: GameState, planetId: string): GameState {
  return {
    ...state,
    planets: state.planets.filter((p) => p.id !== planetId),
  };
}

/**
 * Clear all planets
 */
export function clearPlanets(state: GameState): GameState {
  return {
    ...state,
    planets: [],
  };
}

/**
 * Check if challenge is complete
 */
export function checkChallenge(state: GameState): { success: boolean; feedback: string } {
  const challenge = CHALLENGES.find((c) => c.id === state.currentChallengeId);
  if (!challenge) {
    return { success: false, feedback: 'No challenge selected!' };
  }

  const targets = challenge.targetConfig;
  const current = state.planets;

  if (current.length < targets.length) {
    return {
      success: false,
      feedback: `Need ${targets.length} planets, you have ${current.length}`,
    };
  }

  // Check each target is matched
  let matches = 0;
  for (let i = 0; i < targets.length; i++) {
    const target = targets[i];
    const planet = current[i];
    
    let match = true;
    if (target.type && planet.type !== target.type) match = false;
    if (target.size && Math.abs(planet.size - target.size) > 1) match = false;
    if (target.distance && Math.abs(planet.distance - target.distance) > 0.5) match = false;
    
    if (match) matches++;
  }

  if (matches === targets.length) {
    return { success: true, feedback: 'Perfect solar system! Great job!' };
  }

  return {
    success: false,
    feedback: `Check your planet order and types. ${matches}/${targets.length} correct.`,
  };
}

/**
 * Submit challenge
 */
export function submitChallenge(state: GameState): GameState {
  const result = checkChallenge(state);
  const newAttempts = state.attempts + 1;

  if (result.success) {
    const baseScore = 100;
    const planetBonus = state.planets.length * 10;
    const finalScore = baseScore + planetBonus;

    return {
      ...state,
      status: 'success',
      score: state.score + finalScore,
      attempts: newAttempts,
    };
  }

  return {
    ...state,
    status: 'failure',
    attempts: newAttempts,
  };
}

/**
 * Update timer
 */
export function updateTimer(state: GameState): GameState {
  return {
    ...state,
    timeElapsed: state.timeElapsed + 1,
  };
}

/**
 * Get planet emoji by type
 */
export function getPlanetEmoji(type: Planet['type']): string {
  const emojis: Record<Planet['type'], string> = {
    rocky: '🪨',
    gas: '🟠',
    ice: '❄️',
    dwarf: '⚪',
  };
  return emojis[type];
}

/**
 * Get planet type color
 */
export function getPlanetTypeColor(type: Planet['type']): string {
  const colors: Record<Planet['type'], string> = {
    rocky: '#8B4513',
    gas: '#DAA520',
    ice: '#87CEEB',
    dwarf: '#C0C0C0',
  };
  return colors[type];
}

/**
 * Calculate orbital period (Kepler's 3rd law approximation)
 */
export function calculateOrbitalPeriod(distance: number): number {
  // T² ∝ r³, so T ∝ r^(3/2)
  return Math.round(Math.pow(distance, 1.5) * 10) / 10;
}

/**
 * Calculate final score
 */
export function calculateFinalScore(state: GameState): {
  totalScore: number;
  planetsCreated: number;
  challengesCompleted: number;
} {
  return {
    totalScore: state.score,
    planetsCreated: state.planets.length,
    challengesCompleted: Math.floor(state.score / 100),
  };
}
