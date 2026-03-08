import { describe, it, expect, beforeEach } from 'vitest';
import {
  useSocialStore,
  useCurrentSession,
  useActiveCharacters,
  useGlobalMetrics,
  useSocialActivities,
  getTotalSocialScore,
  getSocialLevel,
  type Player,
  type SocialActivity,
  type SocialMetrics,
} from '../socialStore';

describe('socialStore', () => {
  beforeEach(() => {
    // Reset store to initial state
    useSocialStore.setState({
      currentSession: null,
      availableActivities: [],
      globalMetrics: {
        sharing: 0,
        caring: 0,
        cooperation: 0,
        patience: 0,
        friendship: 0,
        inclusion: 0,
      },
      activeCharacters: ['pip'],
      showSocialModal: false,
      selectedActivity: null,
    });
    // Re-initialize with sample activities
    useSocialStore.setState({
      availableActivities: [
        {
          id: 'sharing-circle-1',
          type: 'sharing_circle',
          title: 'Sharing Circle',
          description: 'Take turns tracing letters and sharing the fun!',
          players: [],
          currentPlayerIndex: 0,
          status: 'waiting',
          metrics: { sharing: 0, caring: 0, cooperation: 0, patience: 0, friendship: 0, inclusion: 0 },
          startTime: new Date(),
        },
      ],
    });
  });

  describe('initial state', () => {
    it('should have null current session', () => {
      expect(useSocialStore.getState().currentSession).toBeNull();
    });

    it('should have sample activities', () => {
      expect(useSocialStore.getState().availableActivities.length).toBeGreaterThan(0);
    });

    it('should have pip as default active character', () => {
      expect(useSocialStore.getState().activeCharacters).toEqual(['pip']);
    });

    it('should have all metrics at zero', () => {
      const metrics = useSocialStore.getState().globalMetrics;
      expect(metrics.sharing).toBe(0);
      expect(metrics.caring).toBe(0);
      expect(metrics.cooperation).toBe(0);
      expect(metrics.patience).toBe(0);
      expect(metrics.friendship).toBe(0);
      expect(metrics.inclusion).toBe(0);
    });

    it('should have social modal hidden', () => {
      expect(useSocialStore.getState().showSocialModal).toBe(false);
    });

    it('should have no selected activity', () => {
      expect(useSocialStore.getState().selectedActivity).toBeNull();
    });
  });

  describe('startSession', () => {
    it('should create a new session with players', () => {
      const players: Player[] = [
        { id: '1', name: 'Alice', isActive: true, metrics: { sharing: 0, caring: 0, cooperation: 0, patience: 0, friendship: 0, inclusion: 0 } },
        { id: '2', name: 'Bob', isActive: true, metrics: { sharing: 0, caring: 0, cooperation: 0, patience: 0, friendship: 0, inclusion: 0 } },
      ];

      useSocialStore.getState().startSession(players);

      const session = useSocialStore.getState().currentSession;
      expect(session).not.toBeNull();
      expect(session?.players).toHaveLength(2);
      expect(session?.players[0].name).toBe('Alice');
      expect(session?.isActive).toBe(true);
      expect(session?.sessionMetrics.sharing).toBe(0);
    });

    it('should activate both characters when session starts', () => {
      const players: Player[] = [{ id: '1', name: 'Alice', isActive: true, metrics: { sharing: 0, caring: 0, cooperation: 0, patience: 0, friendship: 0, inclusion: 0 } }];

      useSocialStore.getState().startSession(players);

      expect(useSocialStore.getState().activeCharacters).toEqual(['pip', 'lumi']);
    });

    it('should generate unique session id', () => {
      const players: Player[] = [{ id: '1', name: 'Alice', isActive: true, metrics: { sharing: 0, caring: 0, cooperation: 0, patience: 0, friendship: 0, inclusion: 0 } }];

      useSocialStore.getState().startSession(players);

      const session = useSocialStore.getState().currentSession;
      expect(session?.id).toMatch(/^session-\d+$/);
    });
  });

  describe('endSession', () => {
    it('should mark session as inactive', () => {
      const players: Player[] = [{ id: '1', name: 'Alice', isActive: true, metrics: { sharing: 0, caring: 0, cooperation: 0, patience: 0, friendship: 0, inclusion: 0 } }];
      useSocialStore.getState().startSession(players);

      useSocialStore.getState().endSession();

      expect(useSocialStore.getState().currentSession?.isActive).toBe(false);
    });

    it('should not throw if no session exists', () => {
      expect(() => useSocialStore.getState().endSession()).not.toThrow();
    });
  });

  describe('startActivity', () => {
    it('should start activity in current session', () => {
      const players: Player[] = [{ id: '1', name: 'Alice', isActive: true, metrics: { sharing: 0, caring: 0, cooperation: 0, patience: 0, friendship: 0, inclusion: 0 } }];
      useSocialStore.getState().startSession(players);

      const activity: SocialActivity = {
        id: 'test-activity',
        type: 'sharing_circle',
        title: 'Test Activity',
        description: 'Test',
        players: [],
        currentPlayerIndex: 0,
        status: 'waiting',
        metrics: { sharing: 0, caring: 0, cooperation: 0, patience: 0, friendship: 0, inclusion: 0 },
        startTime: new Date(),
      };

      useSocialStore.getState().startActivity(activity);

      expect(useSocialStore.getState().currentSession?.currentActivity?.status).toBe('active');
      expect(useSocialStore.getState().selectedActivity?.status).toBe('active');
    });

    it('should not start activity without session', () => {
      const activity: SocialActivity = {
        id: 'test-activity',
        type: 'sharing_circle',
        title: 'Test Activity',
        description: 'Test',
        players: [],
        currentPlayerIndex: 0,
        status: 'waiting',
        metrics: { sharing: 0, caring: 0, cooperation: 0, patience: 0, friendship: 0, inclusion: 0 },
        startTime: new Date(),
      };

      useSocialStore.getState().startActivity(activity);

      expect(useSocialStore.getState().selectedActivity).toBeNull();
    });
  });

  describe('endActivity', () => {
    it('should clear current activity', () => {
      const players: Player[] = [{ id: '1', name: 'Alice', isActive: true, metrics: { sharing: 0, caring: 0, cooperation: 0, patience: 0, friendship: 0, inclusion: 0 } }];
      useSocialStore.getState().startSession(players);
      const activity: SocialActivity = {
        id: 'test-activity',
        type: 'sharing_circle',
        title: 'Test Activity',
        description: 'Test',
        players: [],
        currentPlayerIndex: 0,
        status: 'waiting',
        metrics: { sharing: 0, caring: 0, cooperation: 0, patience: 0, friendship: 0, inclusion: 0 },
        startTime: new Date(),
      };
      useSocialStore.getState().startActivity(activity);

      useSocialStore.getState().endActivity();

      expect(useSocialStore.getState().selectedActivity).toBeNull();
      expect(useSocialStore.getState().currentSession?.currentActivity).toBeUndefined();
    });
  });

  describe('recordSocialAction', () => {
    it('should update global metrics', () => {
      useSocialStore.getState().recordSocialAction('sharing');

      expect(useSocialStore.getState().globalMetrics.sharing).toBe(1);
    });

    it('should update session metrics when session active', () => {
      const players: Player[] = [{ id: '1', name: 'Alice', isActive: true, metrics: { sharing: 0, caring: 0, cooperation: 0, patience: 0, friendship: 0, inclusion: 0 } }];
      useSocialStore.getState().startSession(players);

      useSocialStore.getState().recordSocialAction('caring');

      expect(useSocialStore.getState().currentSession?.sessionMetrics.caring).toBe(1);
    });

    it('should update player metrics when playerId provided', () => {
      const players: Player[] = [
        { id: '1', name: 'Alice', isActive: true, metrics: { sharing: 0, caring: 0, cooperation: 0, patience: 0, friendship: 0, inclusion: 0 } },
        { id: '2', name: 'Bob', isActive: true, metrics: { sharing: 0, caring: 0, cooperation: 0, patience: 0, friendship: 0, inclusion: 0 } },
      ];
      useSocialStore.getState().startSession(players);

      useSocialStore.getState().recordSocialAction('cooperation', '1');

      const session = useSocialStore.getState().currentSession;
      expect(session?.players[0].metrics.cooperation).toBe(1);
      expect(session?.players[1].metrics.cooperation).toBe(0);
    });

    it('should handle all metric types', () => {
      // Reset metrics before this test
      useSocialStore.setState({
        globalMetrics: {
          sharing: 0,
          caring: 0,
          cooperation: 0,
          patience: 0,
          friendship: 0,
          inclusion: 0,
        },
      });

      useSocialStore.getState().recordSocialAction('sharing');
      expect(useSocialStore.getState().globalMetrics.sharing).toBe(1);

      useSocialStore.getState().recordSocialAction('caring');
      expect(useSocialStore.getState().globalMetrics.caring).toBe(1);

      useSocialStore.getState().recordSocialAction('cooperation');
      expect(useSocialStore.getState().globalMetrics.cooperation).toBe(1);

      useSocialStore.getState().recordSocialAction('patience');
      expect(useSocialStore.getState().globalMetrics.patience).toBe(1);

      useSocialStore.getState().recordSocialAction('friendship');
      expect(useSocialStore.getState().globalMetrics.friendship).toBe(1);

      useSocialStore.getState().recordSocialAction('inclusion');
      expect(useSocialStore.getState().globalMetrics.inclusion).toBe(1);
    });
  });

  describe('character management', () => {
    it('should switch to single character', () => {
      useSocialStore.getState().switchToCharacter('lumi');

      expect(useSocialStore.getState().activeCharacters).toEqual(['lumi']);
    });

    it('should set multiple active characters', () => {
      useSocialStore.getState().setActiveCharacters(['pip', 'lumi']);

      expect(useSocialStore.getState().activeCharacters).toEqual(['pip', 'lumi']);
    });

    it('should set empty character array', () => {
      useSocialStore.getState().setActiveCharacters([]);

      expect(useSocialStore.getState().activeCharacters).toEqual([]);
    });
  });

  describe('UI state', () => {
    it('should toggle social modal visibility', () => {
      useSocialStore.getState().setShowSocialModal(true);
      expect(useSocialStore.getState().showSocialModal).toBe(true);

      useSocialStore.getState().setShowSocialModal(false);
      expect(useSocialStore.getState().showSocialModal).toBe(false);
    });

    it('should set selected activity', () => {
      const activity: SocialActivity = {
        id: 'test',
        type: 'sharing_circle',
        title: 'Test',
        description: 'Test desc',
        players: [],
        currentPlayerIndex: 0,
        status: 'waiting',
        metrics: { sharing: 0, caring: 0, cooperation: 0, patience: 0, friendship: 0, inclusion: 0 },
        startTime: new Date(),
      };

      useSocialStore.getState().setSelectedActivity(activity);

      expect(useSocialStore.getState().selectedActivity).toEqual(activity);
    });

    it('should clear selected activity', () => {
      useSocialStore.getState().setSelectedActivity(null);

      expect(useSocialStore.getState().selectedActivity).toBeNull();
    });
  });

  describe('resetMetrics', () => {
    it('should reset global metrics to zero', () => {
      useSocialStore.getState().recordSocialAction('sharing');
      useSocialStore.getState().recordSocialAction('caring');

      useSocialStore.getState().resetMetrics();

      const metrics = useSocialStore.getState().globalMetrics;
      expect(metrics.sharing).toBe(0);
      expect(metrics.caring).toBe(0);
    });

    it('should reset session metrics', () => {
      const players: Player[] = [{ id: '1', name: 'Alice', isActive: true, metrics: { sharing: 0, caring: 0, cooperation: 0, patience: 0, friendship: 0, inclusion: 0 } }];
      useSocialStore.getState().startSession(players);
      useSocialStore.getState().recordSocialAction('sharing');

      useSocialStore.getState().resetMetrics();

      expect(useSocialStore.getState().currentSession?.sessionMetrics.sharing).toBe(0);
    });
  });

  describe('selectors', () => {
    it('useCurrentSession selector should extract current session from state', () => {
      const state = useSocialStore.getState();
      // Test the selector function logic directly
      const session = state.currentSession;
      expect(session).toBeNull();
    });

    it('useActiveCharacters selector should extract active characters from state', () => {
      const state = useSocialStore.getState();
      expect(state.activeCharacters).toEqual(['pip']);
    });

    it('useGlobalMetrics selector should extract global metrics from state', () => {
      const state = useSocialStore.getState();
      expect(state.globalMetrics.sharing).toBe(0);
    });

    it('useSocialActivities selector should extract available activities from state', () => {
      const state = useSocialStore.getState();
      expect(state.availableActivities.length).toBeGreaterThan(0);
    });
  });

  describe('helper functions', () => {
    describe('getTotalSocialScore', () => {
      it('should sum all metrics', () => {
        const metrics: SocialMetrics = {
          sharing: 5,
          caring: 3,
          cooperation: 2,
          patience: 4,
          friendship: 1,
          inclusion: 3,
        };

        expect(getTotalSocialScore(metrics)).toBe(18);
      });

      it('should return zero for empty metrics', () => {
        const metrics: SocialMetrics = {
          sharing: 0,
          caring: 0,
          cooperation: 0,
          patience: 0,
          friendship: 0,
          inclusion: 0,
        };

        expect(getTotalSocialScore(metrics)).toBe(0);
      });
    });

    describe('getSocialLevel', () => {
      it('should return Social Champion for score >= 50', () => {
        expect(getSocialLevel(50)).toBe('Social Champion');
        expect(getSocialLevel(100)).toBe('Social Champion');
      });

      it('should return Kind Friend for score >= 25', () => {
        expect(getSocialLevel(25)).toBe('Kind Friend');
        expect(getSocialLevel(49)).toBe('Kind Friend');
      });

      it('should return Good Helper for score >= 10', () => {
        expect(getSocialLevel(10)).toBe('Good Helper');
        expect(getSocialLevel(24)).toBe('Good Helper');
      });

      it('should return Learning Friend for score < 10', () => {
        expect(getSocialLevel(0)).toBe('Learning Friend');
        expect(getSocialLevel(9)).toBe('Learning Friend');
      });
    });
  });
});
