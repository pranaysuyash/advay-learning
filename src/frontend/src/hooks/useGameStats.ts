import { QueryClient, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';

export interface GlobalGameStat {
  game_key: string;
  game_name: string;
  total_plays: number;
  avg_session_minutes: number;
  completion_rate: number;
  popularity_score: number;
  age_cohort_rank: number;
}

export interface GlobalGameStatsResponse {
  period: string;
  age_group: string | null;
  generated_at: string;
  games: GlobalGameStat[];
}

type Period = 'day' | 'week' | 'month' | 'all';

interface UseGameStatsOptions {
  period?: Period;
  ageGroup?: string;
  enabled?: boolean;
}

const fallbackQueryClient = new QueryClient();

export function useGameStats(options: UseGameStatsOptions = {}) {
  const { period = 'week', ageGroup, enabled = true } = options;
  let queryClient: QueryClient | undefined;
  try {
    queryClient = useQueryClient();
  } catch {
    queryClient = undefined;
  }

  const queryKey = useMemo(
    () => ['gameStats', period, ageGroup] as const,
    [period, ageGroup],
  );

  const query = useQuery({
    queryKey,
    queryFn: async (): Promise<GlobalGameStatsResponse> => {
      const params = new URLSearchParams({ period });
      if (ageGroup) {
        params.append('ageGroup', ageGroup);
      }

      const response = await fetch(`/api/v1/games/stats?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch game stats');
      }
      return response.json();
    },
    staleTime: 1000 * 60 * 30,
    gcTime: 1000 * 60 * 60,
    refetchOnWindowFocus: false,
    enabled,
  }, queryClient ?? fallbackQueryClient);

  return query;
}

export function useGameStatsMap(options: UseGameStatsOptions = {}) {
  const { data, ...rest } = useGameStats(options);

  const statsMap = useMemo(() => {
    if (!data?.games) return new Map<string, GlobalGameStat>();
    return new Map(data.games.map((game) => [game.game_key, game]));
  }, [data]);

  return {
    ...rest,
    data,
    statsMap,
  };
}

export function getAgeGroup(age: number): string {
  if (age <= 4) return '3-4';
  if (age <= 6) return '5-6';
  if (age <= 8) return '7-8';
  return '9-10';
}

export function useGameStatsForProfile(profileAge?: number) {
  const ageGroup = profileAge ? getAgeGroup(profileAge) : undefined;
  return useGameStats({ ageGroup });
}

export function useGameStatsMapForProfile(profileAge?: number) {
  const ageGroup = profileAge ? getAgeGroup(profileAge) : undefined;
  return useGameStatsMap({ ageGroup });
}
