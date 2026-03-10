/**
 * Wash Hands Dance Game Logic
 *
 * Child follows Pip through proper handwashing steps:
 * 1. Wet hands (show open palms under water)
 * 2. Apply soap (rub hands together)
 * 3. Scrub (show circular motion)
 * 4. Rinse (show palms under water again)
 * 5. Dry (show shaking hands)
 */

export interface WashStep {
  id: number;
  name: string;
  emoji: string;
  instruction: string;
  hint: string;
}

export const WASH_STEPS: WashStep[] = [
  {
    id: 0,
    name: 'Wet Hands',
    emoji: '🚿',
    instruction: 'Put your hands under the water!',
    hint: 'Show open palms like you are washing',
  },
  {
    id: 1,
    name: 'Soap Time',
    emoji: '🧼',
    instruction: 'Rub soap all over!',
    hint: 'Rub your hands together',
  },
  {
    id: 2,
    name: 'Scrub Scrub',
    emoji: '🧽',
    instruction: 'Scrub between your fingers!',
    hint: 'Show scrubbing motion',
  },
  {
    id: 3,
    name: 'Rinse Clean',
    emoji: '💧',
    instruction: 'Rinse all the bubbles away!',
    hint: 'Show hands under water again',
  },
  {
    id: 4,
    name: 'Dry Off',
    emoji: '✋',
    instruction: 'Shake your hands dry!',
    hint: 'Shake your hands side to side',
  },
];

export interface GameState {
  currentStep: number;
  score: number;
  stars: number;
  isComplete: boolean;
  isPlaying: boolean;
}

export function createInitialState(): GameState {
  return {
    currentStep: 0,
    score: 0,
    stars: 0,
    isComplete: false,
    isPlaying: false,
  };
}

export function getStepById(id: number): WashStep | undefined {
  return WASH_STEPS.find((step) => step.id === id);
}

export function getTotalSteps(): number {
  return WASH_STEPS.length;
}

export function calculateStars(attempts: number[]): number {
  const totalAttempts = attempts.reduce((a, b) => a + b, 0);
  const avgAttempts = totalAttempts / attempts.length;
  
  if (avgAttempts <= 1) return 5;
  if (avgAttempts <= 2) return 4;
  if (avgAttempts <= 3) return 3;
  if (avgAttempts <= 5) return 2;
  return 1;
}

export function calculateScore(_step: number, attempts: number): number {
  const basePoints = 100;
  const attemptPenalty = Math.max(0, (attempts - 1) * 20);
  return Math.max(10, basePoints - attemptPenalty);
}
