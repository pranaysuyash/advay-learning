import React from 'react';

export interface GamePageContextValue {
  score: number;
  setScore: React.Dispatch<React.SetStateAction<number>>;
  currentLevel: number;
  setCurrentLevel: React.Dispatch<React.SetStateAction<number>>;
  isSubmitting: boolean;
  handleFinish: (opts?: {
    finalScore?: number;
    level?: number;
  }) => Promise<void>;
}

export const GamePageContext = React.createContext<GamePageContextValue | null>(
  null,
);
