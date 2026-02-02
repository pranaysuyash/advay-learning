import {
  ProgressItem,
  UnifiedMetrics,
  HolisticScorecard,
  PlantGrowth,
} from '../types/progress';

/**
 * Calculate unified metrics across all activities
 */
export function calculateUnifiedMetrics(
  progress: ProgressItem[],
): UnifiedMetrics {
  if (progress.length === 0) {
    return {
      practice: { score: 0, level: 'beginner', description: 'No practice yet' },
      mastery: { score: 0, level: 'emerging', description: 'No mastery data' },
      challenge: {
        score: 0,
        level: 'comfortable',
        description: 'No challenge data',
      },
      consistency: {
        score: 0,
        level: 'inconsistent',
        description: 'No consistency data',
      },
    };
  }

  // Practice metric: Based on total activities and frequency
  const totalActivities = progress.length;
  const uniqueDays = new Set(
    progress.map((p) => new Date(p.completed_at).toDateString()),
  ).size;
  const avgActivitiesPerDay = totalActivities / Math.max(uniqueDays, 1);

  const practiceScore = Math.min(
    100,
    avgActivitiesPerDay * 20 + totalActivities * 2,
  );
  const practiceLevel =
    practiceScore < 30
      ? 'beginner'
      : practiceScore < 70
        ? 'intermediate'
        : 'advanced';

  // Mastery metric: Based on average accuracy and completion rates
  const avgAccuracy =
    progress.reduce((sum, p) => sum + p.score, 0) / progress.length;
  const highAccuracyCount = progress.filter((p) => p.score >= 80).length;
  const masteryScore =
    avgAccuracy * 0.7 + (highAccuracyCount / progress.length) * 100 * 0.3;
  const masteryLevel =
    masteryScore < 40
      ? 'emerging'
      : masteryScore < 75
        ? 'developing'
        : 'proficient';

  // Challenge metric: Based on difficulty progression and score variance
  const scores = progress.map((p) => p.score);
  const scoreVariance =
    scores.length > 1
      ? scores.reduce(
          (sum, score) => sum + Math.pow(score - avgAccuracy, 2),
          0,
        ) / scores.length
      : 0;
  const challengeScore = Math.min(100, avgAccuracy + scoreVariance * 0.5);
  const challengeLevel =
    challengeScore < 50
      ? 'comfortable'
      : challengeScore < 80
        ? 'stretching'
        : 'challenging';

  // Consistency metric: Based on regular practice patterns
  const recentProgress = progress.slice(-30); // Last 30 activities
  const recentDays = new Set(
    recentProgress.map((p) => new Date(p.completed_at).toDateString()),
  ).size;
  const consistencyScore =
    recentDays >= 7 ? 100 : recentDays >= 5 ? 75 : recentDays >= 3 ? 50 : 25;
  const consistencyLevel =
    consistencyScore < 40
      ? 'inconsistent'
      : consistencyScore < 80
        ? 'regular'
        : 'consistent';

  return {
    practice: {
      score: Math.round(practiceScore),
      level: practiceLevel,
      description: getPracticeDescription(
        practiceLevel,
        totalActivities,
        avgActivitiesPerDay,
      ),
    },
    mastery: {
      score: Math.round(masteryScore),
      level: masteryLevel,
      description: getMasteryDescription(
        masteryLevel,
        avgAccuracy,
        highAccuracyCount,
      ),
    },
    challenge: {
      score: Math.round(challengeScore),
      level: challengeLevel,
      description: getChallengeDescription(challengeLevel),
    },
    consistency: {
      score: Math.round(consistencyScore),
      level: consistencyLevel,
      description: getConsistencyDescription(consistencyLevel, recentDays),
    },
  };
}

/**
 * Calculate holistic scorecard with insights and recommendations
 */
export function calculateHolisticScorecard(
  progress: ProgressItem[],
): HolisticScorecard {
  const metrics = calculateUnifiedMetrics(progress);
  const weights = {
    practice: 0.25,
    mastery: 0.35,
    challenge: 0.2,
    consistency: 0.2,
  };
  const overall = Math.round(
    metrics.practice.score * weights.practice +
      metrics.mastery.score * weights.mastery +
      metrics.challenge.score * weights.challenge +
      metrics.consistency.score * weights.consistency,
  );

  const insights: string[] = [];
  const recommendations: string[] = [];
  const strengths: string[] = [];
  const areasForImprovement: string[] = [];

  // Generate insights based on metrics
  if (metrics.practice.score >= 70) {
    strengths.push(
      'Great practice habits - regular engagement shows commitment',
    );
    insights.push(
      'Consistent practice is building strong learning foundations',
    );
  } else if (metrics.practice.score < 30) {
    areasForImprovement.push(
      'Practice frequency could be increased for better progress',
    );
    recommendations.push('Try setting a daily practice goal of 10-15 minutes');
  }

  if (metrics.mastery.score >= 75) {
    strengths.push(
      'Excellent mastery - high accuracy shows deep understanding',
    );
    insights.push(
      'Strong grasp of concepts indicates effective learning strategies',
    );
  } else if (metrics.mastery.score < 40) {
    areasForImprovement.push(
      'Accuracy could be improved with focused practice',
    );
    recommendations.push(
      'Focus on one letter at a time until mastery before moving on',
    );
  }

  if (metrics.challenge.score >= 80) {
    strengths.push(
      'Good challenge balance - appropriately difficult activities',
    );
    insights.push(
      'Well-matched difficulty keeps learning engaging and effective',
    );
  } else if (metrics.challenge.score < 50) {
    areasForImprovement.push(
      'Activities might be too easy - could benefit from more challenge',
    );
    recommendations.push('Try more complex letters or faster-paced practice');
  }

  if (metrics.consistency.score >= 80) {
    strengths.push('Excellent consistency - regular practice patterns');
    insights.push('Consistent routines lead to better long-term retention');
  } else if (metrics.consistency.score < 40) {
    areasForImprovement.push(
      'More consistent practice would accelerate progress',
    );
    recommendations.push(
      'Establish a regular practice schedule, even if shorter sessions',
    );
  }

  return {
    overallScore: overall,
    insights,
    recommendations,
    strengths,
    areasForImprovement,
  };
}

/**
 * Calculate honest progress statistics (fixing the misleading ones)
 */
export function calculateHonestStats(progress: ProgressItem[]) {
  // Unique letters practiced (not total activities)
  const uniqueLetters = new Set(
    progress
      .filter((p) => p.activity_type === 'letter_tracing')
      .map((p) => p.content_id),
  ).size;

  // Per-activity accuracy (not mixed averages)
  const tracingProgress = progress.filter(
    (p) => p.activity_type === 'letter_tracing',
  );
  const avgTracingAccuracy =
    tracingProgress.length > 0
      ? tracingProgress.reduce((sum, p) => sum + p.score, 0) /
        tracingProgress.length
      : 0;

  // Recent activity sorted by date (not arbitrary slice)
  const recentActivity = progress
    .sort(
      (a, b) =>
        new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime(),
    )
    .slice(0, 10)
    .map((item) => ({
      action:
        item.activity_type === 'letter_tracing'
          ? `Practiced letter ${item.content_id}`
          : `Completed ${item.activity_type}`,
      time: new Date(item.completed_at).toLocaleDateString(),
      score: `${Math.round(item.score)}%`,
      timestamp: item.completed_at,
    }));

  return {
    uniqueLettersPracticed: uniqueLetters,
    avgTracingAccuracy: Math.round(avgTracingAccuracy),
    recentActivity,
    totalActivities: progress.length,
  };
}

/**
 * Calculate plant growth based on progress
 */
export function calculatePlantGrowth(progress: ProgressItem[]): PlantGrowth {
  const metrics = calculateUnifiedMetrics(progress);
  const overallScore = Math.round(
    metrics.practice.score * 0.25 +
      metrics.mastery.score * 0.35 +
      metrics.challenge.score * 0.2 +
      metrics.consistency.score * 0.2,
  );

  // Determine plant stage based on overall score
  let stage: 'seed' | 'sprout' | 'young' | 'mature' | 'blooming';
  let growthProgress: number;
  let nextMilestone: string;
  let flowerCount: number;

  if (overallScore < 20) {
    stage = 'seed';
    growthProgress = (overallScore / 20) * 100;
    nextMilestone = 'Start practicing to sprout!';
    flowerCount = 0;
  } else if (overallScore < 40) {
    stage = 'sprout';
    growthProgress = ((overallScore - 20) / 20) * 100;
    nextMilestone = 'Keep growing to become a young plant!';
    flowerCount = 0;
  } else if (overallScore < 60) {
    stage = 'young';
    growthProgress = ((overallScore - 40) / 20) * 100;
    nextMilestone = 'Grow stronger to mature!';
    flowerCount = 0;
  } else if (overallScore < 80) {
    stage = 'mature';
    growthProgress = ((overallScore - 60) / 20) * 100;
    nextMilestone = 'Almost ready to bloom!';
    flowerCount = 0;
  } else {
    stage = 'blooming';
    growthProgress = Math.min(((overallScore - 80) / 20) * 100, 100);
    nextMilestone = 'Keep practicing to grow more flowers!';
    flowerCount = Math.floor((overallScore - 80) / 5) + 1;
  }

  return {
    stage,
    progress: Math.round(growthProgress),
    nextMilestone,
    flowerCount,
  };
}

// Helper functions for descriptions
function getPracticeDescription(
  level: string,
  totalActivities: number,
  avgPerDay: number,
): string {
  switch (level) {
    case 'beginner':
      return `Started with ${totalActivities} activities (~${avgPerDay.toFixed(1)} per day)`;
    case 'intermediate':
      return `Building habits with ${totalActivities} activities (~${avgPerDay.toFixed(1)} per day)`;
    case 'advanced':
      return `Strong practice routine with ${totalActivities} activities (~${avgPerDay.toFixed(1)} per day)`;
    default:
      return 'Practice data being analyzed';
  }
}

function getMasteryDescription(
  level: string,
  avgAccuracy: number,
  highAccuracyCount: number,
): string {
  switch (level) {
    case 'emerging':
      return `${Math.round(avgAccuracy)}% average accuracy with ${highAccuracyCount} strong performances`;
    case 'developing':
      return `${Math.round(avgAccuracy)}% average accuracy with ${highAccuracyCount} strong performances`;
    case 'proficient':
      return `${Math.round(avgAccuracy)}% average accuracy with ${highAccuracyCount} strong performances`;
    default:
      return 'Mastery data being analyzed';
  }
}

function getChallengeDescription(level: string): string {
  switch (level) {
    case 'comfortable':
      return `Activities well-matched with low difficulty variance`;
    case 'stretching':
      return `Good balance of comfort and challenge`;
    case 'challenging':
      return `Appropriately challenging with good difficulty progression`;
    default:
      return 'Challenge data being analyzed';
  }
}

function getConsistencyDescription(level: string, recentDays: number): string {
  switch (level) {
    case 'inconsistent':
      return `Practiced on ${recentDays} of the last 7 days`;
    case 'regular':
      return `Practiced on ${recentDays} of the last 7 days`;
    case 'consistent':
      return `Practiced on ${recentDays} of the last 7 days`;
    default:
      return 'Consistency data being analyzed';
  }
}
