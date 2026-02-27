import { useSessionProgressReporter } from './useSessionProgressReporter';

interface UseGameSessionProgressOptions {
  gameName: string;
  score?: number;
  level?: number;
  isPlaying?: boolean;
  metaData?: Record<string, unknown>;
}

export function useGameSessionProgress(options: UseGameSessionProgressOptions) {
  const { gameName, score, level, isPlaying, metaData } = options;
  useSessionProgressReporter({
    gameName,
    score,
    level,
    isPlaying,
    metaData,
  });
}

export default useGameSessionProgress;
