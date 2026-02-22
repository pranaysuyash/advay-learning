/**
 * Social Learning Hook
 *
 * Provides utilities for managing social-emotional learning activities,
 * character interactions, and social metrics tracking.
 *
 * @see docs/LUMI_COMPANION_CHARACTER_PLAN.md
 */

import { useCallback, useEffect, useState } from 'react';
import { useSocialStore, SocialActivity, SocialMetric } from '../store/socialStore';
import { getSocialResponse, getTurnTakingResponse } from '../data/lumiResponses';
import { createActivityFromTemplate, getSocialActivityTemplate } from '../data/socialActivities';

export interface SocialLearningState {
  currentActivity: SocialActivity | null;
  isSessionActive: boolean;
  activeCharacters: ('pip' | 'lumi')[];
  socialMetrics: Record<SocialMetric, number>;
}

export function useSocialLearning() {
  const {
    currentSession,
    selectedActivity,
    activeCharacters,
    globalMetrics,
    startSession,
    endSession,
    startActivity,
    endActivity,
    recordSocialAction,
    setActiveCharacters,
  } = useSocialStore();

  const [lumiMessage, setLumiMessage] = useState<string>('');
  const [pipMessage, setPipMessage] = useState<string>('');

  // Current social learning state
  const socialState: SocialLearningState = {
    currentActivity: selectedActivity,
    isSessionActive: currentSession?.isActive || false,
    activeCharacters,
    socialMetrics: globalMetrics,
  };

  // Start a social learning session
  const beginSocialSession = useCallback((players: Array<{ id: string; name: string }>) => {
    startSession(players.map(p => ({
      id: p.id,
      name: p.name,
      isActive: true,
      metrics: {
        sharing: 0,
        caring: 0,
        cooperation: 0,
        patience: 0,
        friendship: 0,
        inclusion: 0,
      },
    })));

    // Activate both characters for social play
    setActiveCharacters(['pip', 'lumi']);

    // Welcome message from Lumi
    setLumiMessage("Hi friends! Let's learn together!");
    setPipMessage("Let's play together!");
  }, [startSession, setActiveCharacters]);

  // End the social session
  const finishSocialSession = useCallback(() => {
    endSession();
    setActiveCharacters(['pip']); // Return to PIP-only mode
    setLumiMessage("Great playing together! See you soon!");
    setPipMessage("Great playing with friends!");
  }, [endSession, setActiveCharacters]);

  // Start a specific social activity
  const launchActivity = useCallback((templateId: string) => {
    const template = getSocialActivityTemplate(templateId);
    if (!template || !currentSession) return;

    const activity = createActivityFromTemplate(template, currentSession.players);
    startActivity(activity);

    // Activity-specific messages
    switch (template.type) {
      case 'sharing_circle':
        setLumiMessage("Let's take turns and share! Who's first?");
        setPipMessage("I love sharing! Your turn!");
        break;
      case 'caring_quest':
        setLumiMessage("Let's help each other today!");
        setPipMessage("Friends help friends!");
        break;
      case 'cooperation_game':
        setLumiMessage("Teamwork makes everything better!");
        setPipMessage("Let's work together!");
        break;
      case 'friendship_builder':
        setLumiMessage("Let's build beautiful friendships!");
        setPipMessage("Friends are the best!");
        break;
      default:
        setLumiMessage("Let's learn together!");
        setPipMessage("Ready to play!");
    }
  }, [currentSession, startActivity]);

  // Handle turn transitions in activities
  const handleTurnChange = useCallback((isWaiting: boolean, playerName?: string) => {
    if (isWaiting) {
      setLumiMessage(getTurnTakingResponse(true));
      setPipMessage("Good waiting! You're so patient!");
      recordSocialAction('patience');
    } else {
      setLumiMessage(getTurnTakingResponse(false));
      setPipMessage(`Go ${playerName || 'friend'}! You can do it!`);
    }
  }, [recordSocialAction]);

  // Record social actions with appropriate feedback
  const recordSocialBehavior = useCallback((
    action: 'shared' | 'helped' | 'waited' | 'cooperated' | 'comforted',
    success = true,
    playerId?: string
  ) => {
    // Map action to metric
    const metricMap = {
      shared: 'sharing' as SocialMetric,
      helped: 'caring' as SocialMetric,
      waited: 'patience' as SocialMetric,
      cooperated: 'cooperation' as SocialMetric,
      comforted: 'caring' as SocialMetric,
    };

    const metric = metricMap[action];
    recordSocialAction(metric, playerId);

    // Generate appropriate character response
    const context = { action, success, groupSize: currentSession?.players.length };
    const response = getSocialResponse(context);

    if (activeCharacters.includes('lumi')) {
      setLumiMessage(response);
    } else {
      setPipMessage(response);
    }
  }, [recordSocialAction, currentSession, activeCharacters]);

  // Celebrate group success
  const celebrateGroupSuccess = useCallback((activityType: string) => {
    const groupSize = currentSession?.players.length || 2;

    if (activeCharacters.includes('lumi')) {
      const celebrations = [
        `Amazing teamwork! ${groupSize} friends succeeded together! 🌟`,
        `Wonderful cooperation! You all did ${activityType} perfectly! 🎉`,
        `Beautiful friendship! ${groupSize} friends completed the challenge! ✨`,
        `Team victory! Everyone worked together so well! 🏆`
      ];
      setLumiMessage(celebrations[Math.floor(Math.random() * celebrations.length)]);
    }

    setPipMessage("You all did amazing! Best team ever!");
    recordSocialAction('cooperation');
  }, [currentSession, activeCharacters, recordSocialAction]);

  // Handle activity completion
  const completeActivity = useCallback(() => {
    endActivity();
    celebrateGroupSuccess(selectedActivity?.type || 'activity');
  }, [endActivity, celebrateGroupSuccess, selectedActivity]);

  // Get current player in turn-based activities
  const getCurrentPlayer = useCallback(() => {
    if (!selectedActivity || !currentSession) return null;

    const currentPlayerIndex = selectedActivity.currentPlayerIndex;
    return currentSession.players[currentPlayerIndex] || null;
  }, [selectedActivity, currentSession]);

  // Advance to next player in turn-based activities
  const nextPlayer = useCallback(() => {
    if (!selectedActivity || !currentSession) return;

    const nextIndex = (selectedActivity.currentPlayerIndex + 1) % currentSession.players.length;

    // Trigger turn change messages
    const nextPlayer = currentSession.players[nextIndex];
    handleTurnChange(false, nextPlayer.name);
  }, [selectedActivity, currentSession, handleTurnChange]);

  // Auto-clear messages after a delay
  useEffect(() => {
    if (lumiMessage) {
      const timer = setTimeout(() => setLumiMessage(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [lumiMessage]);

  useEffect(() => {
    if (pipMessage) {
      const timer = setTimeout(() => setPipMessage(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [pipMessage]);

  return {
    // State
    socialState,
    lumiMessage,
    pipMessage,
    currentPlayer: getCurrentPlayer(),

    // Session management
    beginSocialSession,
    finishSocialSession,

    // Activity management
    launchActivity,
    completeActivity,
    nextPlayer,

    // Social interactions
    recordSocialBehavior,
    handleTurnChange,
    celebrateGroupSuccess,

    // Character control
    setActiveCharacters,
  };
}

export default useSocialLearning;