/**
 * Pattern Pop 3D Game Logic Tests
 *
 * Tests for pattern matching in 3D space.
 *
 * @ticket TCK-20250411-001
 */

import { describe, expect, it, beforeEach } from 'vitest';
import {
  PATTERN_POP_3D_CONFIG,
  PATTERN_COLORS,
  createBubbleGrid,
  generatePattern,
  initializeGame,
  startGame,
  startLevel,
  checkBubbleClick,
  highlightBubble,
  clearHighlights,
  finishShowingPattern,
  getCurrentPatternPosition,
  type GameState,
} from '../patternPop3DLogic';

describe('PATTERN_POP_3D_CONFIG', () => {
  it('has correct pattern settings', () => {
    expect(PATTERN_POP_3D_CONFIG.INITIAL_PATTERN_LENGTH).toBe(3);
    expect(PATTERN_POP_3D_CONFIG.MAX_PATTERN_LENGTH).toBe(7);
  });

  it('has correct bubble count', () => {
    expect(PATTERN_POP_3D_CONFIG.BUBBLE_COUNT).toBe(9);
  });

  it('has correct scoring', () => {
    expect(PATTERN_POP_3D_CONFIG.POINTS_PER_CORRECT).toBe(25);
    expect(PATTERN_POP_3D_CONFIG.STREAK_BONUS).toBe(10);
  });
});

describe('PATTERN_COLORS', () => {
  it('has 9 colors', () => {
    expect(PATTERN_COLORS).toHaveLength(9);
  });

  it('all colors are valid hex', () => {
    PATTERN_COLORS.forEach(color => {
      expect(color).toMatch(/^#[0-9A-F]{6}$/i);
    });
  });
});

describe('createBubbleGrid', () => {
  it('creates 9 bubbles in grid', () => {
    const bubbles = createBubbleGrid();
    expect(bubbles).toHaveLength(9);
  });

  it('bubbles have positions', () => {
    const bubbles = createBubbleGrid();
    bubbles.forEach(bubble => {
      expect(bubble.position.x).toBeDefined();
      expect(bubble.position.y).toBeDefined();
      expect(bubble.position.z).toBe(0);
    });
  });
});

describe('generatePattern', () => {
  it('generates pattern of correct length for level 1', () => {
    const pattern = generatePattern(1);
    expect(pattern.sequence.length).toBe(3);
    expect(pattern.level).toBe(1);
  });

  it('generates longer patterns for higher levels', () => {
    const pattern1 = generatePattern(1);
    const pattern5 = generatePattern(5);
    expect(pattern5.sequence.length).toBeGreaterThanOrEqual(pattern1.sequence.length);
  });

  it('sequence values are valid bubble IDs', () => {
    const pattern = generatePattern(1);
    pattern.sequence.forEach(id => {
      expect(id).toBeGreaterThanOrEqual(0);
      expect(id).toBeLessThan(9);
    });
  });
});

describe('initializeGame', () => {
  it('creates correct initial state', () => {
    const state = initializeGame();
    expect(state.bubbles).toHaveLength(9);
    expect(state.pattern.sequence).toEqual([]);
    expect(state.playerSequence).toEqual([]);
    expect(state.score).toBe(0);
    expect(state.level).toBe(1);
    expect(state.streak).toBe(0);
    expect(state.isPlaying).toBe(false);
  });
});

describe('startGame', () => {
  it('starts game with pattern', () => {
    const state = startGame(initializeGame());
    expect(state.isPlaying).toBe(true);
    expect(state.pattern.sequence.length).toBeGreaterThan(0);
    expect(state.isShowingPattern).toBe(true);
  });
});

describe('checkBubbleClick', () => {
  it('accepts correct bubble in sequence', () => {
    const state = startGame(initializeGame());
    const pattern = state.pattern.sequence;
    state.isShowingPattern = false;

    const { result, newState } = checkBubbleClick(state, pattern[0]);

    expect(result.success).toBe(true);
    expect(result.isPatternComplete).toBe(false);
    expect(newState.playerSequence).toHaveLength(1);
  });

  it('rejects wrong bubble', () => {
    const state = startGame(initializeGame());
    state.isShowingPattern = false;
    const pattern = state.pattern.sequence;
    const wrongId = (pattern[0] + 1) % 9;

    const { result, newState } = checkBubbleClick(state, wrongId);

    expect(result.success).toBe(false);
    expect(result.isPatternComplete).toBe(false);
    expect(newState.playerSequence).toHaveLength(0);
    expect(newState.streak).toBe(0);
  });

  it('completes level when pattern finished', () => {
    const state = startGame(initializeGame());
    state.isShowingPattern = false;
    const pattern = state.pattern.sequence;

    // Complete the pattern
    let currentState = state;
    for (const id of pattern) {
      const { result, newState } = checkBubbleClick(currentState, id);
      currentState = newState;
      if (result.isPatternComplete) break;
    }

    expect(currentState.playerSequence).toHaveLength(pattern.length);
    expect(currentState.score).toBeGreaterThan(0);
  });
});

describe('highlightBubble', () => {
  it('highlights correct bubble', () => {
    const state = initializeGame();
    const highlighted = highlightBubble(state, 0);
    expect(highlighted.bubbles[0].isHighlighted).toBe(true);
    expect(highlighted.bubbles[1].isHighlighted).toBe(false);
  });
});

describe('clearHighlights', () => {
  it('clears all highlights', () => {
    const state = initializeGame();
    const highlighted = highlightBubble(state, 0);
    const cleared = clearHighlights(highlighted);
    cleared.bubbles.forEach(b => expect(b.isHighlighted).toBe(false));
  });
});

describe('finishShowingPattern', () => {
  it('ends pattern display', () => {
    const state = startGame(initializeGame());
    const finished = finishShowingPattern(state);
    expect(finished.isShowingPattern).toBe(false);
    expect(finished.playerSequence).toHaveLength(0);
  });
});

describe('getCurrentPatternPosition', () => {
  it('returns correct position', () => {
    const state = startGame(initializeGame());
    state.isShowingPattern = false;
    state.playerSequence = [state.pattern.sequence[0]];
    expect(getCurrentPatternPosition(state)).toBe(1);
  });
});
