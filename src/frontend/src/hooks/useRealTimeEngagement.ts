import { useRef, useEffect, useCallback, useState } from 'react';

export type EngagementLevel = 'high' | 'medium' | 'low' | 'idle';

export interface EngagementSignal {
  timestamp: string;
  gameId: string;
  profileId: string;
  engagementLevel: EngagementLevel;
  metrics: EngagementMetrics;
}

export interface EngagementMetrics {
  handTrackingActive: boolean;
  movementIntensity: number;
  interactionFrequency: number;
  errorRate: number;
  timeSinceLastInteraction: number;
  sessionDuration: number;
}

export interface EngagementThresholds {
  highEngagement: {
    minInteractionFrequency: number;
    maxErrorRate: number;
    maxIdleTime: number;
  };
  lowEngagement: {
    maxInteractionFrequency: number;
    minErrorRate: number;
  };
}

const DEFAULT_THRESHOLDS: EngagementThresholds = {
  highEngagement: {
    minInteractionFrequency: 0.5,
    maxErrorRate: 0.3,
    maxIdleTime: 2000,
  },
  lowEngagement: {
    maxInteractionFrequency: 0.1,
    minErrorRate: 0.5,
  },
};

export function useRealTimeEngagement(
  gameId: string,
  profileId: string | undefined,
  thresholds: EngagementThresholds = DEFAULT_THRESHOLDS,
) {
  const [engagementLevel, setEngagementLevel] = useState<EngagementLevel>('medium');
  const [isConnected, _setIsConnected] = useState(false);
  
  const metricsRef = useRef<EngagementMetrics>({
    handTrackingActive: false,
    movementIntensity: 0,
    interactionFrequency: 0,
    errorRate: 0,
    timeSinceLastInteraction: 0,
    sessionDuration: 0,
  });

  const sessionStartRef = useRef<number>(Date.now());
  const interactionTimestampsRef = useRef<number[]>([]);
  const errorCountRef = useRef<number>(0);
  const successCountRef = useRef<number>(0);

  const calculateEngagement = useCallback((): EngagementLevel => {
    const metrics = metricsRef.current;
    const { highEngagement, lowEngagement } = thresholds;

    if (metrics.timeSinceLastInteraction > highEngagement.maxIdleTime) {
      return 'idle';
    }

    if (
      metrics.interactionFrequency >= highEngagement.minInteractionFrequency &&
      metrics.errorRate <= highEngagement.maxErrorRate
    ) {
      return 'high';
    }

    if (
      metrics.interactionFrequency <= lowEngagement.maxInteractionFrequency ||
      metrics.errorRate >= lowEngagement.minErrorRate
    ) {
      return 'low';
    }

    return 'medium';
  }, [thresholds]);

  const recordInteraction = useCallback(() => {
    const now = Date.now();
    interactionTimestampsRef.current.push(now);
    
    const recentInteractions = interactionTimestampsRef.current.filter(
      t => now - t < 10000
    );
    interactionTimestampsRef.current = recentInteractions;
    
    metricsRef.current.interactionFrequency = recentInteractions.length / 10;
    metricsRef.current.timeSinceLastInteraction = 0;
  }, []);

  const recordSuccess = useCallback(() => {
    successCountRef.current++;
    const total = successCountRef.current + errorCountRef.current;
    metricsRef.current.errorRate = total > 0 ? errorCountRef.current / total : 0;
  }, []);

  const recordError = useCallback(() => {
    errorCountRef.current++;
    const total = successCountRef.current + errorCountRef.current;
    metricsRef.current.errorRate = total > 0 ? errorCountRef.current / total : 0;
  }, []);

  const setHandTrackingActive = useCallback((active: boolean) => {
    metricsRef.current.handTrackingActive = active;
  }, []);

  const setMovementIntensity = useCallback((intensity: number) => {
    metricsRef.current.movementIntensity = intensity;
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const sessionDuration = Math.floor((now - sessionStartRef.current) / 1000);
      const timeSinceLastInteraction = interactionTimestampsRef.current.length > 0
        ? now - interactionTimestampsRef.current[interactionTimestampsRef.current.length - 1]
        : sessionDuration * 1000;

      metricsRef.current.sessionDuration = sessionDuration;
      metricsRef.current.timeSinceLastInteraction = timeSinceLastInteraction;

      const newLevel = calculateEngagement();
      if (newLevel !== engagementLevel) {
        setEngagementLevel(newLevel);
      }
    }, 500);

    return () => clearInterval(interval);
  }, [calculateEngagement, engagementLevel]);

  const getEngagementSignal = useCallback((): EngagementSignal => {
    return {
      timestamp: new Date().toISOString(),
      gameId,
      profileId: profileId || 'anonymous',
      engagementLevel,
      metrics: { ...metricsRef.current },
    };
  }, [gameId, profileId, engagementLevel]);

  return {
    engagementLevel,
    isConnected,
    recordInteraction,
    recordSuccess,
    recordError,
    setHandTrackingActive,
    setMovementIntensity,
    getEngagementSignal,
  };
}

export function calculateEngagementFromHistory(
  interactions: number[],
  errors: number[],
  sessionDuration: number,
): EngagementLevel {
  if (interactions.length === 0 || sessionDuration === 0) {
    return 'idle';
  }

  const interactionRate = interactions.length / (sessionDuration / 60);
  const errorRate = errors.length / (interactions.length + errors.length);

  if (interactionRate >= 0.5 && errorRate <= 0.3) return 'high';
  if (interactionRate <= 0.1 || errorRate >= 0.5) return 'low';
  return 'medium';
}
