import { create } from 'zustand';

interface HandData {
  landmarks: Array<{ x: number; y: number; z: number }>;
  pointer: { x: number; y: number };
  presence: boolean;
  confidence: number;
}

interface GameState {
  // Game state
  isPlaying: boolean;
  score: number;
  currentLevel: number;
  timeLeft: number;
  
  // Hand tracking
  handData: HandData | null;
  isTracking: boolean;
  
  // Drawing
  strokes: Array<Array<{ x: number; y: number }>>;
  currentStroke: Array<{ x: number; y: number }>;
  
  // Actions
  startGame: () => void;
  stopGame: () => void;
  updateScore: (points: number) => void;
  setHandData: (data: HandData | null) => void;
  addPointToStroke: (point: { x: number; y: number }) => void;
  endStroke: () => void;
  clearCanvas: () => void;
  tick: () => void;
}

export const useGameStore = create<GameState>()((set) => ({
  isPlaying: false,
  score: 0,
  currentLevel: 1,
  timeLeft: 30,
  handData: null,
  isTracking: false,
  strokes: [],
  currentStroke: [],

  startGame: () => set({
    isPlaying: true,
    score: 0,
    timeLeft: 30,
    strokes: [],
    currentStroke: [],
  }),

  stopGame: () => set({
    isPlaying: false,
    isTracking: false,
  }),

  updateScore: (points) => set((state) => ({
    score: state.score + points,
  })),

  setHandData: (data) => set({
    handData: data,
    isTracking: data?.presence || false,
  }),

  addPointToStroke: (point) => set((state) => ({
    currentStroke: [...state.currentStroke, point],
  })),

  endStroke: () => set((state) => ({
    strokes: [...state.strokes, state.currentStroke],
    currentStroke: [],
  })),

  clearCanvas: () => set({
    strokes: [],
    currentStroke: [],
  }),

  tick: () => set((state) => ({
    timeLeft: Math.max(0, state.timeLeft - 1),
  })),
}));
