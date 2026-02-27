/**
 * Types for progress tracking and metrics
 */

export interface ProgressItem {
  id: string;
  activity_type: string;
  content_id: string;
  score: number;
  completed?: boolean;
  completed_at: string;
  duration_seconds?: number;
  meta_data?: Record<string, unknown>;
  attempt_count?: number; // Number of attempts to complete (undefined = not tracked, assume 1)
}

export interface ProgressStats {
  total_activities: number;
  total_score: number;
  average_score: number;
  completed_content: string[];
  completion_count: number;
}

export interface UnifiedMetrics {
  practice: {
    score: number;
    level: string;
    description: string;
  };
  mastery: {
    score: number;
    level: string;
    description: string;
  };
  challenge: {
    score: number;
    level: string;
    description: string;
  };
  consistency: {
    score: number;
    level: string;
    description: string;
  };
}

export interface HolisticScorecard {
  overallScore: number;
  insights: string[];
  recommendations: string[];
  strengths: string[];
  areasForImprovement: string[];
}

export interface HonestStats {
  uniqueLettersPracticed: number;
  totalActivitiesCompleted: number;
  averageAccuracyPerActivity: number;
  recentActivity: Array<{
    date: string;
    activity: string;
    score: number;
  }>;
}

export interface PlantGrowth {
  stage: 'seed' | 'sprout' | 'young' | 'mature' | 'blooming';
  progress: number;
  nextMilestone: string;
  flowerCount: number;
}

/**
 * Daily time breakdown for parent monitoring
 */
export interface DailyTimeBreakdown {
  date: string; // ISO date string YYYY-MM-DD
  dayName: string; // 'Mon', 'Tue', etc.
  minutes: number; // Estimated minutes played
  activityCount: number; // Number of activities completed
  isToday: boolean;
  exceedsLimit: boolean;
}

export interface TimeBreakdownSummary {
  dailyBreakdown: DailyTimeBreakdown[];
  averageMinutesPerDay: number;
  totalMinutesWeek: number;
  daysExceededLimit: number;
  limitMinutes: number;
}

/**
 * Struggle tracking for parent intervention
 */
export interface StruggleAnalysis {
  item: ProgressItem;
  effectiveAttempts: number;
  attentionLevel: 'none' | 'low' | 'medium' | 'high';
  reason: string;
}

export interface StruggleSummary {
  strugglingItems: StruggleAnalysis[];
  totalTracked: number;
  needsAttentionCount: number;
  recommendations: string[];
}
