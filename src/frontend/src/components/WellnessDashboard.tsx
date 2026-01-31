import React, { useState, useEffect } from 'react';
import { UIIcon } from '../components/ui/Icon';
import { usePostureDetection } from '../hooks/usePostureDetection';
import { useAttentionDetection } from '../hooks/useAttentionDetection';

interface WellnessMetrics {
  postureScore: number; // 0-100
  attentionScore: number; // 0-100
  sessionTime: number; // in minutes
  breakCount: number;
  hydrationReminders: number;
  stretchReminders: number;
}

interface WellnessDashboardProps {
  childId: string;
  onWellnessAlert?: (alert: {
    type: 'posture' | 'attention' | 'break' | 'hydration' | 'stretch';
    message: string;
    timestamp: number;
  }) => void;
}

const WellnessDashboard: React.FC<WellnessDashboardProps> = ({
  childId,
  onWellnessAlert
}) => {
  // Use the props to avoid unused warnings
  void childId;
  void onWellnessAlert;
  const [metrics, setMetrics] = useState<WellnessMetrics>({
    postureScore: 85,
    attentionScore: 78,
    sessionTime: 24,
    breakCount: 2,
    hydrationReminders: 1,
    stretchReminders: 1
  });

  const [showDetails, setShowDetails] = useState(false);
  const { lastPosture, isLoading: _postureLoading } = usePostureDetection();
  const { lastAttention, isLoading: _attentionLoading } = useAttentionDetection();

  // Use variables to avoid unused warnings
  void _postureLoading;
  void _attentionLoading;

  // Update metrics when posture or attention data changes
  useEffect(() => {
    if (lastPosture) {
      // Calculate posture score based on shoulder alignment and spine curvature
      const postureScore = Math.round(
        (lastPosture.shoulderAlignment * 50 + lastPosture.spineCurvature * 50)
      );
      
      setMetrics(prev => ({
        ...prev,
        postureScore
      }));
    }
  }, [lastPosture]);

  useEffect(() => {
    if (lastAttention) {
      // Convert attention level (0-1) to score (0-100)
      const attentionScore = Math.round(lastAttention.focusLevel * 100);
      
      setMetrics(prev => ({
        ...prev,
        attentionScore
      }));
    }
  }, [lastAttention]);

  // Get wellness status based on scores
  const getWellnessStatus = (score: number) => {
    if (score >= 80) return { status: 'excellent', color: 'text-green-400', bgColor: 'bg-green-500/10', borderColor: 'border-green-500/20' };
    if (score >= 60) return { status: 'good', color: 'text-yellow-400', bgColor: 'bg-yellow-500/10', borderColor: 'border-yellow-500/20' };
    if (score >= 40) return { status: 'fair', color: 'text-orange-400', bgColor: 'bg-orange-500/10', borderColor: 'border-orange-500/20' };
    return { status: 'needs_attention', color: 'text-red-400', bgColor: 'bg-red-500/10', borderColor: 'border-red-500/20' };
  };

  const postureStatus = getWellnessStatus(metrics.postureScore);
  const attentionStatus = getWellnessStatus(metrics.attentionScore);

  return (
    <div className="bg-white/10 border border-border rounded-xl p-6 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white">Child Wellness Dashboard</h2>
        <button 
          onClick={() => setShowDetails(!showDetails)}
          className="text-white/70 hover:text-white text-sm font-medium"
        >
          {showDetails ? 'Hide Details' : 'Show Details'}
        </button>
      </div>

      {/* Wellness Scores */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className={`border ${postureStatus.borderColor} rounded-xl p-5 ${postureStatus.bgColor}`}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
              <UIIcon name="body" size={20} className="text-purple-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Posture Health</h3>
              <p className={`text-sm ${postureStatus.color} capitalize`}>
                {postureStatus.status.replace('_', ' ')}
              </p>
            </div>
          </div>
          <div className="text-3xl font-bold text-white mb-2">{metrics.postureScore}%</div>
          <progress
            value={metrics.postureScore}
            max={100}
            className="w-full h-2.5 rounded-full progress-accent-purple"
          />
          {_postureLoading && (
            <div className="text-xs text-white/60 mt-2">Analyzing posture...</div>
          )}
        </div>

        <div className={`border ${attentionStatus.borderColor} rounded-xl p-5 ${attentionStatus.bgColor}`}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
              <UIIcon name="eye" size={20} className="text-blue-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Attention Level</h3>
              <p className={`text-sm ${attentionStatus.color} capitalize`}>
                {attentionStatus.status.replace('_', ' ')}
              </p>
            </div>
          </div>
          <div className="text-3xl font-bold text-white mb-2">{metrics.attentionScore}%</div>
          <progress
            value={metrics.attentionScore}
            max={100}
            className="w-full h-2.5 rounded-full progress-accent-blue"
          />
          {_attentionLoading && (
            <div className="text-xs text-white/60 mt-2">Measuring attention...</div>
          )}
        </div>
      </div>

      {/* Session Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white/5 border border-border rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-white">{metrics.sessionTime}</div>
          <div className="text-xs text-white/70">Minutes Today</div>
        </div>
        <div className="bg-white/5 border border-border rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-white">{metrics.breakCount}</div>
          <div className="text-xs text-white/70">Breaks Taken</div>
        </div>
        <div className="bg-white/5 border border-border rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-white">{metrics.hydrationReminders}</div>
          <div className="text-xs text-white/70">Water Reminders</div>
        </div>
        <div className="bg-white/5 border border-border rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-white">{metrics.stretchReminders}</div>
          <div className="text-xs text-white/70">Stretch Reminders</div>
        </div>
      </div>

      {/* Wellness Recommendations */}
      <div className="bg-white/5 border border-border rounded-xl p-5">
        <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
          <UIIcon name="star" size={18} className="text-yellow-400" />
          Wellness Recommendations
        </h3>
        <ul className="space-y-2 text-sm text-white/80">
          {metrics.postureScore < 70 && (
            <li className="flex items-start gap-2">
              <span className="text-red-400 mt-1">•</span>
              <span>Encourage your child to sit up straight with back against chair</span>
            </li>
          )}
          {metrics.attentionScore < 70 && (
            <li className="flex items-start gap-2">
              <span className="text-yellow-400 mt-1">•</span>
              <span>Your child might benefit from a short break to refresh focus</span>
            </li>
          )}
          {metrics.sessionTime > 30 && metrics.breakCount < 1 && (
            <li className="flex items-start gap-2">
              <span className="text-blue-400 mt-1">•</span>
              <span>Consider a 5-minute break to prevent fatigue</span>
            </li>
          )}
          <li className="flex items-start gap-2">
            <span className="text-green-400 mt-1">•</span>
            <span>Maintain proper distance from screen (arm's length)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-400 mt-1">•</span>
            <span>Ensure good lighting to reduce eye strain</span>
          </li>
        </ul>
      </div>

      {/* Detailed View */}
      {showDetails && (
        <div className="mt-6 pt-6 border-t border-border">
          <h3 className="font-semibold text-white mb-4">Detailed Wellness Report</h3>
          <div className="space-y-4">
            <div className="bg-white/5 border border-border rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-white/80">Posture Analysis</span>
                <span className={`px-2 py-1 rounded-full text-xs ${postureStatus.color} ${postureStatus.bgColor}`}>
                  {postureStatus.status.replace('_', ' ')}
                </span>
              </div>
              <p className="text-sm text-white/60">
                Shoulder alignment: {lastPosture ? Math.round(lastPosture.shoulderAlignment * 100) : '--'}% | 
                Spine curvature: {lastPosture ? Math.round(lastPosture.spineCurvature * 100) : '--'}%
              </p>
            </div>
            
            <div className="bg-white/5 border border-border rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-white/80">Attention Tracking</span>
                <span className={`px-2 py-1 rounded-full text-xs ${attentionStatus.color} ${attentionStatus.bgColor}`}>
                  {attentionStatus.status.replace('_', ' ')}
                </span>
              </div>
              <p className="text-sm text-white/60">
                Focus level: {lastAttention ? Math.round(lastAttention.focusLevel * 100) : '--'}% | 
                Blink rate: {lastAttention ? lastAttention.blinkRate : '--'} per min
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WellnessDashboard;