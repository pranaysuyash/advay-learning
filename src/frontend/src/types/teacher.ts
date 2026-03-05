export type RubricLevel = 'emerging' | 'developing' | 'proficient' | 'advanced';

export interface StudentProgress {
  profileId: string;
  studentName: string;
  overallScore: number;
  rubricLevel: RubricLevel;
  activitiesCompleted: number;
  strongAreas: string[];
  strugglingAreas: string[];
  lastActive: string;
}

export interface ClassAnalytics {
  classId: string;
  className: string;
  teacherId: string;
  totalStudents: number;
  averageScore: number;
  rubricDistribution: Record<RubricLevel, number>;
  strugglingStudents: StudentProgress[];
  strongStudents: StudentProgress[];
  activityCompletionRate: number;
  engagementTrend: 'up' | 'down' | 'stable';
  recentActivity: ClassActivitySummary[];
}

export interface ClassActivitySummary {
  activity: string;
  completionCount: number;
  averageScore: number;
  strugglingCount: number;
}

export interface RubricAssessment {
  profileId: string;
  contentId: string;
  rubricLevel: RubricLevel;
  evidence: string;
  assessedAt: string;
  assessedBy?: string;
}

export interface GroupProgress {
  groupId: string;
  groupName: string;
  students: string[];
  averageScore: number;
  completionRate: number;
  commonStruggles: string[];
  recommendations: string[];
}
