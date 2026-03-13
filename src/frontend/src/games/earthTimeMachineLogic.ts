/**
 * Earth Time Machine Game Logic
 *
 * Travel through Earth's history and discover amazing facts!
 * Ages 7-10
 * @ticket EARTH-TIME-MACHINE
 */

export interface Era {
  id: string;
  name: string;
  emoji: string;
  yearsAgo: number; // In millions
  description: string;
  color: string;
}

export interface TimeItem {
  id: string;
  name: string;
  emoji: string;
  eraId: string;
  fact: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface Challenge {
  id: string;
  name: string;
  description: string;
  targetEras: string[];
  itemsToFind: string[];
  timeLimit: number;
  hint: string;
}

export interface GameState {
  status: 'menu' | 'playing' | 'success' | 'failure';
  currentChallengeId: string | null;
  currentEraId: string;
  foundItems: string[];
  score: number;
  timeLeft: number;
  discoveredFacts: string[];
  streak: number;
}

export const ERAS: Era[] = [
  {
    id: 'present',
    name: 'Present Day',
    emoji: '🏙️',
    yearsAgo: 0,
    description: 'The world today with cities and technology!',
    color: '#4CAF50',
  },
  {
    id: 'ice-age',
    name: 'Ice Age',
    emoji: '🦣',
    yearsAgo: 0.02,
    description: 'When giant mammoths roamed the Earth!',
    color: '#03A9F4',
  },
  {
    id: 'dinosaur',
    name: 'Dinosaur Era',
    emoji: '🦕',
    yearsAgo: 65,
    description: 'The age of giant reptiles!',
    color: '#FF9800',
  },
  {
    id: 'first-life',
    name: 'First Life',
    emoji: '🫧',
    yearsAgo: 500,
    description: 'When life first appeared in the oceans!',
    color: '#9C27B0',
  },
];

export const TIME_ITEMS: TimeItem[] = [
  {
    id: 'human',
    name: 'Human',
    emoji: '🧑',
    eraId: 'present',
    fact: 'Humans have been on Earth for about 300,000 years!',
    difficulty: 'easy',
  },
  {
    id: 'car',
    name: 'Car',
    emoji: '🚗',
    eraId: 'present',
    fact: 'The first car was invented only 140 years ago!',
    difficulty: 'easy',
  },
  {
    id: 'mammoth',
    name: 'Woolly Mammoth',
    emoji: '🐘',
    eraId: 'ice-age',
    fact: 'Mammoths were covered in thick fur to survive the cold!',
    difficulty: 'easy',
  },
  {
    id: 'saber-tooth',
    name: 'Saber-tooth Tiger',
    emoji: '🐯',
    eraId: 'ice-age',
    fact: 'Their fangs could grow up to 12 inches long!',
    difficulty: 'medium',
  },
  {
    id: 't-rex',
    name: 'T-Rex',
    emoji: '🦖',
    eraId: 'dinosaur',
    fact: 'T-Rex had teeth as long as bananas!',
    difficulty: 'easy',
  },
  {
    id: 'triceratops',
    name: 'Triceratops',
    emoji: '🦏',
    eraId: 'dinosaur',
    fact: 'Their name means "three-horned face"!',
    difficulty: 'medium',
  },
  {
    id: 'pterodactyl',
    name: 'Pterodactyl',
    emoji: '🦅',
    eraId: 'dinosaur',
    fact: 'These were flying reptiles, not dinosaurs!',
    difficulty: 'hard',
  },
  {
    id: 'trilobite',
    name: 'Trilobite',
    emoji: '🦀',
    eraId: 'first-life',
    fact: 'Trilobites lived for over 300 million years!',
    difficulty: 'hard',
  },
  {
    id: 'jellyfish',
    name: 'Jellyfish',
    emoji: '🪼',
    eraId: 'first-life',
    fact: 'Jellyfish have been around for over 500 million years!',
    difficulty: 'medium',
  },
];

export const CHALLENGES: Challenge[] = [
  {
    id: 'era-explorer',
    name: 'Era Explorer',
    description: 'Visit different eras and find items!',
    targetEras: ['present', 'ice-age'],
    itemsToFind: ['human', 'mammoth'],
    timeLimit: 60,
    hint: 'Start in the present and work backward!',
  },
  {
    id: 'dinosaur-hunter',
    name: 'Dinosaur Hunter',
    description: 'Find all the dinosaurs from the past!',
    targetEras: ['dinosaur'],
    itemsToFind: ['t-rex', 'triceratops', 'pterodactyl'],
    timeLimit: 90,
    hint: 'Travel back 65 million years!',
  },
  {
    id: 'life-discoverer',
    name: 'Life Discoverer',
    description: 'Discover how life began on Earth!',
    targetEras: ['first-life'],
    itemsToFind: ['trilobite', 'jellyfish'],
    timeLimit: 60,
    hint: 'Go back 500 million years!',
  },
  {
    id: 'time-master',
    name: 'Time Master',
    description: 'Complete the ultimate time travel challenge!',
    targetEras: ['present', 'ice-age', 'dinosaur', 'first-life'],
    itemsToFind: ['human', 'mammoth', 't-rex', 'trilobite'],
    timeLimit: 120,
    hint: 'Visit every era in Earth history!',
  },
];

export function createInitialState(): GameState {
  return {
    status: 'menu',
    currentChallengeId: null,
    currentEraId: 'present',
    foundItems: [],
    score: 0,
    timeLeft: 0,
    discoveredFacts: [],
    streak: 0,
  };
}

export function startChallenge(state: GameState, challengeId: string): GameState {
  const challenge = CHALLENGES.find((c) => c.id === challengeId);
  if (!challenge) return state;

  return {
    ...state,
    status: 'playing',
    currentChallengeId: challengeId,
    currentEraId: 'present',
    foundItems: [],
    score: 0,
    timeLeft: challenge.timeLimit,
    discoveredFacts: [],
    streak: 0,
  };
}

export function moveToEra(state: GameState, eraId: string): GameState {
  if (state.status !== 'playing') return state;
  
  const era = ERAS.find((e) => e.id === eraId);
  if (!era) return state;

  return {
    ...state,
    currentEraId: eraId,
  };
}

export function findItem(state: GameState, itemId: string): GameState {
  if (state.status !== 'playing') return state;

  const item = TIME_ITEMS.find((i) => i.id === itemId);
  if (!item) return state;

  if (state.foundItems.includes(itemId)) return state;

  const isCorrectEra = item.eraId === state.currentEraId;
  if (!isCorrectEra) {
    return {
      ...state,
      streak: 0,
      status: 'failure',
    };
  }

  const newFoundItems = [...state.foundItems, itemId];
  const challenge = CHALLENGES.find((c) => c.id === state.currentChallengeId);
  
  const isComplete = challenge 
    ? newFoundItems.length >= challenge.itemsToFind.length
    : false;

  const pointsEarned = item.difficulty === 'easy' ? 10 : item.difficulty === 'medium' ? 20 : 30;

  return {
    ...state,
    foundItems: newFoundItems,
    score: state.score + pointsEarned + (state.streak * 5),
    streak: state.streak + 1,
    discoveredFacts: [...state.discoveredFacts, item.fact],
    status: isComplete ? 'success' : state.status,
  };
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

export function getEraById(eraId: string): Era | undefined {
  return ERAS.find((e) => e.id === eraId);
}

export function getItemsForEra(eraId: string): TimeItem[] {
  return TIME_ITEMS.filter((i) => i.eraId === eraId);
}

export function calculateStars(score: number): number {
  if (score >= 100) return 3;
  if (score >= 50) return 2;
  if (score >= 10) return 1;
  return 0;
}
