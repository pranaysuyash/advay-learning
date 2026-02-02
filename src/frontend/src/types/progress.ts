/**
 * Types for progress tracking and metrics
 */

export interface ProgressItem {
  id: string;
  activity_type: string;
  content_id: string;
  score: number;
  completed_at: string;
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
