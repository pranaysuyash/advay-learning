export interface ColorPaletteEntry {
  number: number;
  label: string;
  color: string;
}

export interface ColorRegion {
  id: string;
  label: string;
  number: number;
  painted: boolean;
}

export interface ColorByNumberTemplate {
  id: string;
  name: string;
  regions: ColorRegion[];
}

export type PaintResult =
  | 'correct'
  | 'wrong-number'
  | 'no-color-selected'
  | 'already-painted'
  | 'missing-region';

export interface ColorByNumberState {
  selectedNumber: number | null;
  regions: ColorRegion[];
  score: number;
  mistakes: number;
  moves: number;
  streak: number;
  maxStreak: number;
  completed: boolean;
}

export interface LevelSummary {
  score: number;
  mistakes: number;
  completionPercent: number;
  stars: number;
}

export const COLOR_PALETTE: ColorPaletteEntry[] = [
  { number: 1, label: 'Sky Blue', color: '#60A5FA' },
  { number: 2, label: 'Sun Yellow', color: '#FACC15' },
  { number: 3, label: 'Leaf Green', color: '#4ADE80' },
  { number: 4, label: 'Berry Pink', color: '#F472B6' },
];

export const COLOR_BY_NUMBER_TEMPLATES: ColorByNumberTemplate[] = [
  {
    id: 'butterfly-garden',
    name: 'Butterfly Garden',
    regions: [
      { id: 'wing-top-left', label: 'Top Left Wing', number: 1, painted: false },
      { id: 'wing-top-right', label: 'Top Right Wing', number: 1, painted: false },
      { id: 'wing-bottom-left', label: 'Bottom Left Wing', number: 4, painted: false },
      { id: 'wing-bottom-right', label: 'Bottom Right Wing', number: 4, painted: false },
      { id: 'body', label: 'Butterfly Body', number: 3, painted: false },
      { id: 'flower-left', label: 'Left Flower', number: 2, painted: false },
      { id: 'flower-right', label: 'Right Flower', number: 2, painted: false },
      { id: 'leaf', label: 'Leaf', number: 3, painted: false },
    ],
  },
  {
    id: 'happy-fish',
    name: 'Happy Fish',
    regions: [
      { id: 'body', label: 'Fish Body', number: 1, painted: false },
      { id: 'tail', label: 'Fish Tail', number: 4, painted: false },
      { id: 'fin-top', label: 'Top Fin', number: 2, painted: false },
      { id: 'fin-bottom', label: 'Bottom Fin', number: 2, painted: false },
      { id: 'eye', label: 'Fish Eye', number: 3, painted: false },
      { id: 'bubble-1', label: 'Bubble One', number: 1, painted: false },
      { id: 'bubble-2', label: 'Bubble Two', number: 1, painted: false },
      { id: 'seaweed', label: 'Seaweed', number: 3, painted: false },
    ],
  },
  {
    id: 'rocket-trip',
    name: 'Rocket Trip',
    regions: [
      { id: 'rocket-body', label: 'Rocket Body', number: 1, painted: false },
      { id: 'window', label: 'Window', number: 2, painted: false },
      { id: 'nose', label: 'Rocket Nose', number: 4, painted: false },
      { id: 'left-fin', label: 'Left Fin', number: 3, painted: false },
      { id: 'right-fin', label: 'Right Fin', number: 3, painted: false },
      { id: 'flame-top', label: 'Flame Top', number: 2, painted: false },
      { id: 'flame-bottom', label: 'Flame Bottom', number: 4, painted: false },
      { id: 'star', label: 'Star', number: 2, painted: false },
    ],
  },
];

export function createInitialState(
  template: ColorByNumberTemplate,
): ColorByNumberState {
  return {
    selectedNumber: null,
    regions: template.regions.map((region) => ({ ...region, painted: false })),
    score: 0,
    mistakes: 0,
    moves: 0,
    streak: 0,
    maxStreak: 0,
    completed: false,
  };
}

export function selectColorNumber(
  state: ColorByNumberState,
  number: number,
): ColorByNumberState {
  return {
    ...state,
    selectedNumber: number,
  };
}

export function paintRegion(
  state: ColorByNumberState,
  regionId: string,
): { state: ColorByNumberState; result: PaintResult } {
  const targetRegion = state.regions.find((region) => region.id === regionId);
  if (!targetRegion) {
    return { state, result: 'missing-region' };
  }

  if (targetRegion.painted) {
    return { state, result: 'already-painted' };
  }

  if (state.selectedNumber === null) {
    return { state, result: 'no-color-selected' };
  }

  if (state.selectedNumber !== targetRegion.number) {
    return {
      state: {
        ...state,
        mistakes: state.mistakes + 1,
        moves: state.moves + 1,
        streak: 0,
        score: Math.max(0, state.score - 2),
      },
      result: 'wrong-number',
    };
  }

  const nextStreak = state.streak + 1;
  const streakBonus = Math.min(5, nextStreak);
  const nextRegions = state.regions.map((region) =>
    region.id === regionId ? { ...region, painted: true } : region,
  );
  const completed = nextRegions.every((region) => region.painted);
  return {
    state: {
      ...state,
      regions: nextRegions,
      moves: state.moves + 1,
      streak: nextStreak,
      maxStreak: Math.max(state.maxStreak, nextStreak),
      score: state.score + 10 + streakBonus + (completed ? 20 : 0),
      completed,
    },
    result: 'correct',
  };
}

export function getCompletionPercent(state: ColorByNumberState): number {
  if (state.regions.length === 0) return 0;
  const paintedCount = state.regions.filter((region) => region.painted).length;
  return Math.round((paintedCount / state.regions.length) * 100);
}

export function getRemainingCountByNumber(
  state: ColorByNumberState,
  number: number,
): number {
  return state.regions.filter(
    (region) => !region.painted && region.number === number,
  ).length;
}

export function getSuggestedNumber(state: ColorByNumberState): number | null {
  const buckets = new Map<number, number>();
  state.regions
    .filter((region) => !region.painted)
    .forEach((region) => {
      buckets.set(region.number, (buckets.get(region.number) ?? 0) + 1);
    });

  let bestNumber: number | null = null;
  let bestCount = -1;
  buckets.forEach((count, number) => {
    if (count > bestCount) {
      bestCount = count;
      bestNumber = number;
    }
  });
  return bestNumber;
}

export function getLevelSummary(state: ColorByNumberState): LevelSummary {
  const completionPercent = getCompletionPercent(state);
  let stars = 1;
  if (state.mistakes <= 1) stars = 3;
  else if (state.mistakes <= 3) stars = 2;

  if (completionPercent < 100) {
    stars = 0;
  }

  return {
    score: state.score,
    mistakes: state.mistakes,
    completionPercent,
    stars,
  };
}
