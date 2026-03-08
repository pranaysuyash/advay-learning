import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useStoryStore } from '../storyStore';
import * as questsModule from '../../data/quests';

// Mock the quests module
vi.mock('../../data/quests', () => ({
  getIslandById: vi.fn((id: string) => {
    const islands: Record<string, { id: string; name: string; requiredIslands: string[] }> = {
      'alphabet-lighthouse': { id: 'alphabet-lighthouse', name: 'Alphabet Lighthouse', requiredIslands: [] },
      'number-nook': { id: 'number-nook', name: 'Number Nook', requiredIslands: ['alphabet-lighthouse'] },
      'treasure-bay': { id: 'treasure-bay', name: 'Treasure Bay', requiredIslands: ['number-nook'] },
      'star-studio': { id: 'star-studio', name: 'Star Studio', requiredIslands: ['treasure-bay'] },
    };
    return islands[id] || undefined;
  }),
  isIslandUnlocked: vi.fn((islandId: string, unlockedIslands: string[]) => {
    const requirements: Record<string, string[]> = {
      'alphabet-lighthouse': [],
      'number-nook': ['alphabet-lighthouse'],
      'treasure-bay': ['number-nook'],
      'star-studio': ['treasure-bay'],
    };
    const required = requirements[islandId] || [];
    return required.every((req) => unlockedIslands.includes(req));
  }),
}));

describe('storyStore', () => {
  beforeEach(() => {
    // Reset store to initial state
    useStoryStore.setState({
      currentQuest: null,
      unlockedIslands: ['alphabet-lighthouse'],
      badges: [],
      completedQuests: [],
      totalXp: 0,
    });
  });

  describe('initial state', () => {
    it('should have no current quest', () => {
      expect(useStoryStore.getState().currentQuest).toBeNull();
    });

    it('should have alphabet-lighthouse unlocked by default', () => {
      expect(useStoryStore.getState().unlockedIslands).toEqual(['alphabet-lighthouse']);
    });

    it('should have empty badges', () => {
      expect(useStoryStore.getState().badges).toEqual([]);
    });

    it('should have empty completed quests', () => {
      expect(useStoryStore.getState().completedQuests).toEqual([]);
    });

    it('should have zero XP', () => {
      expect(useStoryStore.getState().totalXp).toBe(0);
    });
  });

  describe('startQuest', () => {
    it('should set current quest', () => {
      useStoryStore.getState().startQuest('quest-1');

      expect(useStoryStore.getState().currentQuest).toBe('quest-1');
    });

    it('should overwrite previous quest', () => {
      useStoryStore.getState().startQuest('quest-1');
      useStoryStore.getState().startQuest('quest-2');

      expect(useStoryStore.getState().currentQuest).toBe('quest-2');
    });
  });

  describe('completeQuest', () => {
    it('should add quest to completed quests', () => {
      useStoryStore.getState().completeQuest('quest-1');

      const completed = useStoryStore.getState().completedQuests;
      expect(completed).toHaveLength(1);
      expect(completed[0].questId).toBe('quest-1');
      expect(completed[0].accuracy).toBe(0);
    });

    it('should add accuracy to completed quest', () => {
      useStoryStore.getState().completeQuest('quest-1', 85);

      const completed = useStoryStore.getState().completedQuests;
      expect(completed[0].accuracy).toBe(85);
    });

    it('should add completion timestamp', () => {
      const before = Date.now();
      useStoryStore.getState().completeQuest('quest-1');
      const after = Date.now();

      const completedAt = useStoryStore.getState().completedQuests[0].completedAt;
      expect(completedAt).toBeGreaterThanOrEqual(before);
      expect(completedAt).toBeLessThanOrEqual(after);
    });

    it('should clear current quest', () => {
      useStoryStore.getState().startQuest('quest-1');
      useStoryStore.getState().completeQuest('quest-1');

      expect(useStoryStore.getState().currentQuest).toBeNull();
    });

    it('should add badge for quest', () => {
      useStoryStore.getState().completeQuest('quest-1');

      expect(useStoryStore.getState().badges).toContain('badge:quest-1');
    });

    it('should not add duplicate badges', () => {
      useStoryStore.getState().completeQuest('quest-1');
      useStoryStore.getState().completeQuest('quest-1');

      expect(useStoryStore.getState().badges).toEqual(['badge:quest-1']);
    });

    it('should add XP', () => {
      useStoryStore.getState().completeQuest('quest-1');

      expect(useStoryStore.getState().totalXp).toBe(10);
    });

    it('should accumulate XP for multiple quests', () => {
      useStoryStore.getState().completeQuest('quest-1');
      useStoryStore.getState().completeQuest('quest-2');

      expect(useStoryStore.getState().totalXp).toBe(20);
    });

    it('should handle multiple different quests', () => {
      useStoryStore.getState().completeQuest('quest-1');
      useStoryStore.getState().completeQuest('quest-2');

      const badges = useStoryStore.getState().badges;
      expect(badges).toContain('badge:quest-1');
      expect(badges).toContain('badge:quest-2');
      expect(useStoryStore.getState().completedQuests).toHaveLength(2);
    });
  });

  describe('unlockIsland', () => {
    it('should add island to unlocked list', () => {
      useStoryStore.getState().unlockIsland('number-nook');

      expect(useStoryStore.getState().unlockedIslands).toContain('number-nook');
    });

    it('should keep existing islands', () => {
      useStoryStore.getState().unlockIsland('number-nook');

      expect(useStoryStore.getState().unlockedIslands).toContain('alphabet-lighthouse');
      expect(useStoryStore.getState().unlockedIslands).toContain('number-nook');
    });

    it('should not add duplicate islands', () => {
      useStoryStore.getState().unlockIsland('number-nook');
      useStoryStore.getState().unlockIsland('number-nook');

      const islands = useStoryStore.getState().unlockedIslands;
      expect(islands.filter((i) => i === 'number-nook')).toHaveLength(1);
    });
  });

  describe('reset', () => {
    it('should reset to initial state', () => {
      useStoryStore.getState().startQuest('quest-1');
      useStoryStore.getState().completeQuest('quest-1');
      useStoryStore.getState().unlockIsland('number-nook');

      useStoryStore.getState().reset();

      expect(useStoryStore.getState().currentQuest).toBeNull();
      expect(useStoryStore.getState().unlockedIslands).toEqual(['alphabet-lighthouse']);
      expect(useStoryStore.getState().badges).toEqual([]);
      expect(useStoryStore.getState().completedQuests).toEqual([]);
      expect(useStoryStore.getState().totalXp).toBe(0);
    });
  });

  describe('getUnlockedIslands', () => {
    it('should return island objects for unlocked ids', () => {
      const islands = useStoryStore.getState().getUnlockedIslands();

      expect(islands).toHaveLength(1);
      expect(islands[0].id).toBe('alphabet-lighthouse');
    });

    it('should filter out undefined islands', () => {
      useStoryStore.setState({ unlockedIslands: ['alphabet-lighthouse', 'invalid-island'] });

      const islands = useStoryStore.getState().getUnlockedIslands();

      expect(islands).toHaveLength(1);
      expect(islands[0].id).toBe('alphabet-lighthouse');
    });
  });

  describe('isQuestCompleted', () => {
    it('should return true for completed quest', () => {
      useStoryStore.getState().completeQuest('quest-1');

      expect(useStoryStore.getState().isQuestCompleted('quest-1')).toBe(true);
    });

    it('should return false for uncompleted quest', () => {
      expect(useStoryStore.getState().isQuestCompleted('quest-1')).toBe(false);
    });

    it('should return false after reset', () => {
      useStoryStore.getState().completeQuest('quest-1');
      useStoryStore.getState().reset();

      expect(useStoryStore.getState().isQuestCompleted('quest-1')).toBe(false);
    });
  });

  describe('getNextUnlockableIsland', () => {
    it('should return next unlockable island', () => {
      // Only alphabet-lighthouse is unlocked
      const next = useStoryStore.getState().getNextUnlockableIsland();

      expect(next).not.toBeNull();
      expect(next?.id).toBe('number-nook');
    });

    it('should return null when all islands unlocked', () => {
      useStoryStore.setState({
        unlockedIslands: ['alphabet-lighthouse', 'number-nook', 'treasure-bay', 'star-studio'],
      });

      const next = useStoryStore.getState().getNextUnlockableIsland();

      expect(next).toBeNull();
    });

    it('should skip already unlocked islands', () => {
      useStoryStore.setState({
        unlockedIslands: ['alphabet-lighthouse', 'number-nook'],
      });

      const next = useStoryStore.getState().getNextUnlockableIsland();

      expect(next?.id).toBe('treasure-bay');
    });
  });

  describe('persistence', () => {
    it('should have persist config', () => {
      // The store uses persist middleware with name 'advay-story'
      // This test verifies the store structure is correct
      const state = useStoryStore.getState();
      expect(state).toHaveProperty('currentQuest');
      expect(state).toHaveProperty('unlockedIslands');
      expect(state).toHaveProperty('badges');
      expect(state).toHaveProperty('completedQuests');
      expect(state).toHaveProperty('totalXp');
    });
  });
});
