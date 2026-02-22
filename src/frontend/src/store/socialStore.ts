/**
 * Social Learning Store
 *
 * Manages state for social-emotional learning activities, multiplayer sessions,
 * and social metrics tracking. Works alongside the existing PIP mascot system.
 *
 * @see docs/LUMI_COMPANION_CHARACTER_PLAN.md
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export type SocialActivityType =
  | 'sharing_circle'      // Turn-taking activities
  | 'caring_quest'        // Helping others
  | 'cooperation_game'    // Working together
  | 'friendship_builder'  // Building relationships
  | 'patience_practice'   // Waiting and turn-taking
  | 'inclusion_play'      // Including everyone;

export type SocialMetric =
  | 'sharing'        // Instances of sharing behavior
  | 'caring'         // Acts of kindness/help
  | 'cooperation'    // Teamwork participation
  | 'patience'       // Waiting for turns
  | 'friendship'     // Positive social interactions
  | 'inclusion';     // Including others fairly

export interface SocialMetrics {
  sharing: number;
  caring: number;
  cooperation: number;
  patience: number;
  friendship: number;
  inclusion: number;
}

export interface SocialActivity {
  id: string;
  type: SocialActivityType;
  title: string;
  description: string;
  players: Player[];
  currentPlayerIndex: number;
  status: 'waiting' | 'active' | 'completed';
  metrics: SocialMetrics;
  startTime: Date;
  endTime?: Date;
}

export interface Player {
  id: string;
  name: string;
  avatar?: string;
  isActive: boolean;
  metrics: SocialMetrics;
}

export interface MultiplayerSession {
  id: string;
  players: Player[];
  currentActivity?: SocialActivity;
  sessionMetrics: SocialMetrics;
  startTime: Date;
  isActive: boolean;
}

interface SocialState {
  // Active session
  currentSession: MultiplayerSession | null;

  // Available activities
  availableActivities: SocialActivity[];

  // Social metrics (global)
  globalMetrics: SocialMetrics;

  // Active characters (PIP, Lumi, or both)
  activeCharacters: ('pip' | 'lumi')[];

  // UI state
  showSocialModal: boolean;
  selectedActivity: SocialActivity | null;

  // Actions
  startSession: (players: Player[]) => void;
  endSession: () => void;
  startActivity: (activity: SocialActivity) => void;
  endActivity: () => void;
  recordSocialAction: (metric: SocialMetric, playerId?: string) => void;
  switchToCharacter: (character: 'pip' | 'lumi') => void;
  setActiveCharacters: (characters: ('pip' | 'lumi')[]) => void;
  setShowSocialModal: (show: boolean) => void;
  setSelectedActivity: (activity: SocialActivity | null) => void;
  resetMetrics: () => void;
}

const initialMetrics: SocialMetrics = {
  sharing: 0,
  caring: 0,
  cooperation: 0,
  patience: 0,
  friendship: 0,
  inclusion: 0,
};

// Sample social activities
const sampleActivities: SocialActivity[] = [
  {
    id: 'sharing-circle-1',
    type: 'sharing_circle',
    title: 'Sharing Circle',
    description: 'Take turns tracing letters and sharing the fun!',
    players: [],
    currentPlayerIndex: 0,
    status: 'waiting',
    metrics: { ...initialMetrics },
    startTime: new Date(),
  },
  {
    id: 'caring-quest-1',
    type: 'caring_quest',
    title: 'Caring Quest',
    description: 'Help your friend when they need assistance!',
    players: [],
    currentPlayerIndex: 0,
    status: 'waiting',
    metrics: { ...initialMetrics },
    startTime: new Date(),
  },
  {
    id: 'cooperation-game-1',
    type: 'cooperation_game',
    title: 'Teamwork Adventure',
    description: 'Work together to complete the challenge!',
    players: [],
    currentPlayerIndex: 0,
    status: 'waiting',
    metrics: { ...initialMetrics },
    startTime: new Date(),
  },
];

export const useSocialStore = create<SocialState>()(
  devtools(
    (set, get) => ({
      // Initial state
      currentSession: null,
      availableActivities: sampleActivities,
      globalMetrics: { ...initialMetrics },
      activeCharacters: ['pip'], // Start with PIP by default
      showSocialModal: false,
      selectedActivity: null,

      // Start a multiplayer session
      startSession: (players: Player[]) => {
        const session: MultiplayerSession = {
          id: `session-${Date.now()}`,
          players,
          sessionMetrics: { ...initialMetrics },
          startTime: new Date(),
          isActive: true,
        };

        set({
          currentSession: session,
          activeCharacters: ['pip', 'lumi'], // Activate both characters for social play
        });
      },

      // End the current session
      endSession: () => {
        const { currentSession } = get();
        if (currentSession) {
          set({
            currentSession: {
              ...currentSession,
              isActive: false,
            },
          });
        }
      },

      // Start a social activity
      startActivity: (activity: SocialActivity) => {
        const { currentSession } = get();
        if (currentSession) {
          const updatedActivity = {
            ...activity,
            status: 'active' as const,
            startTime: new Date(),
          };

          set({
            selectedActivity: updatedActivity,
            currentSession: {
              ...currentSession,
              currentActivity: updatedActivity,
            },
          });
        }
      },

      // End the current activity
      endActivity: () => {
        const { currentSession, selectedActivity } = get();
        if (currentSession && selectedActivity) {
          set({
            selectedActivity: null,
            currentSession: {
              ...currentSession,
              currentActivity: undefined,
            },
          });
        }
      },

      // Record a social action and update metrics
      recordSocialAction: (metric: SocialMetric, playerId?: string) => {
        const { currentSession, globalMetrics } = get();

        // Update global metrics
        const updatedGlobalMetrics = {
          ...globalMetrics,
          [metric]: globalMetrics[metric] + 1,
        };

        // Update session metrics if active
        let updatedSession = currentSession;
        if (currentSession) {
          const sessionMetrics = {
            ...currentSession.sessionMetrics,
            [metric]: currentSession.sessionMetrics[metric] + 1,
          };

          updatedSession = {
            ...currentSession,
            sessionMetrics,
          };
        }

        // Update player metrics if playerId provided
        if (playerId && currentSession) {
          const updatedPlayers = currentSession.players.map(player =>
            player.id === playerId
              ? {
                  ...player,
                  metrics: {
                    ...player.metrics,
                    [metric]: player.metrics[metric] + 1,
                  },
                }
              : player
          );

          updatedSession = {
            ...currentSession,
            players: updatedPlayers,
          };
        }

        set({
          globalMetrics: updatedGlobalMetrics,
          currentSession: updatedSession || null,
        });
      },

      // Switch to a specific character
      switchToCharacter: (character: 'pip' | 'lumi') => {
        set({ activeCharacters: [character] });
      },

      // Set active characters (can be both)
      setActiveCharacters: (characters: ('pip' | 'lumi')[]) => {
        set({ activeCharacters: characters });
      },

      // UI state setters
      setShowSocialModal: (show: boolean) => {
        set({ showSocialModal: show });
      },

      setSelectedActivity: (activity: SocialActivity | null) => {
        set({ selectedActivity: activity });
      },

      // Reset all metrics
      resetMetrics: () => {
        set({
          globalMetrics: { ...initialMetrics },
          currentSession: get().currentSession ? {
            ...get().currentSession!,
            sessionMetrics: { ...initialMetrics },
          } : null,
        });
      },
    }),
    {
      name: 'social-store',
    }
  )
);

// Selectors for common state access
export const useCurrentSession = () => useSocialStore(state => state.currentSession);
export const useActiveCharacters = () => useSocialStore(state => state.activeCharacters);
export const useGlobalMetrics = () => useSocialStore(state => state.globalMetrics);
export const useSocialActivities = () => useSocialStore(state => state.availableActivities);

// Helper functions
export const getTotalSocialScore = (metrics: SocialMetrics): number => {
  return Object.values(metrics).reduce((sum, value) => sum + value, 0);
};

export const getSocialLevel = (score: number): string => {
  if (score >= 50) return 'Social Champion';
  if (score >= 25) return 'Kind Friend';
  if (score >= 10) return 'Good Helper';
  return 'Learning Friend';
};

export default useSocialStore;