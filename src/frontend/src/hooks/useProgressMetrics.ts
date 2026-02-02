import { useMemo } from 'react';
import { useProgressStore } from '../store';
import { calculateUnifiedMetrics, calculateHolisticScorecard, calculateHonestStats, calculatePlantGrowth } from '../utils/progressCalculations';
import { ProgressItem } from '../types/progress';

export function useProgressMetrics(progress: ProgressItem[]) {
  const { letterProgress } = useProgressStore();

  const metrics = useMemo(() => {
    return calculateUnifiedMetrics(progress);
  }, [progress]);

  const scorecard = useMemo(() => {
    return calculateHolisticScorecard(progress);
  }, [progress]);

  const honestStats = useMemo(() => {
    return calculateHonestStats(progress);
  }, [progress]);

  // Calculate plant growth stage based on overall progress
  const plantGrowth = useMemo(() => {
    return calculatePlantGrowth(progress);
  }, [progress]);

  return {
    metrics,
    scorecard,
    honestStats,
    plantGrowth,
    letterProgress
  };
}