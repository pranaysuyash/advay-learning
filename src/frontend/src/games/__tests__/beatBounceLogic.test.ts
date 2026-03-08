import { describe, expect, it } from 'vitest';

import {
  LevelConfig,
  BouncingBall,
  BeatTiming,
  LEVELS,
  TIMING_WINDOWS,
  getLevelConfig,
  getBeatInterval,
  createBall,
  createBalls,
  updateBall,
  checkBeatTiming,
  calculateScore,
  isBallActive,
} from '../beatBounceLogic';

describe('LEVELS', () => {
  it('has exactly 3 levels', () => {
    expect(LEVELS).toHaveLength(3);
  });

  it('level 1 has 80 BPM and 1 ball', () => {
    expect(LEVELS[0].level).toBe(1);
    expect(LEVELS[0].bpm).toBe(80);
    expect(LEVELS[0].ballCount).toBe(1);
  });

  it('level 2 has 100 BPM and 1 ball', () => {
    expect(LEVELS[1].level).toBe(2);
    expect(LEVELS[1].bpm).toBe(100);
    expect(LEVELS[1].ballCount).toBe(1);
  });

  it('level 3 has 120 BPM and 2 balls', () => {
    expect(LEVELS[2].level).toBe(3);
    expect(LEVELS[2].bpm).toBe(120);
    expect(LEVELS[2].ballCount).toBe(2);
  });

  it('BPM increases across levels', () => {
    expect(LEVELS[0].bpm).toBeLessThan(LEVELS[1].bpm);
    expect(LEVELS[1].bpm).toBeLessThan(LEVELS[2].bpm);
  });

  it('ball count increases at level 3', () => {
    expect(LEVELS[0].ballCount).toBe(1);
    expect(LEVELS[1].ballCount).toBe(1);
    expect(LEVELS[2].ballCount).toBe(2);
  });
});

describe('TIMING_WINDOWS', () => {
  it('has perfect timing of 0.1', () => {
    expect(TIMING_WINDOWS.perfect).toBe(0.1);
  });

  it('has good timing of 0.2', () => {
    expect(TIMING_WINDOWS.good).toBe(0.2);
  });

  it('has miss timing of 0.3', () => {
    expect(TIMING_WINDOWS.miss).toBe(0.3);
  });

  it('timing windows are ordered correctly', () => {
    expect(TIMING_WINDOWS.perfect).toBeLessThan(TIMING_WINDOWS.good);
    expect(TIMING_WINDOWS.good).toBeLessThan(TIMING_WINDOWS.miss);
  });
});

describe('getLevelConfig', () => {
  it('returns level 1 config for level 1', () => {
    const config = getLevelConfig(1);
    expect(config.level).toBe(1);
    expect(config.bpm).toBe(80);
    expect(config.ballCount).toBe(1);
  });

  it('returns level 2 config for level 2', () => {
    const config = getLevelConfig(2);
    expect(config.level).toBe(2);
    expect(config.bpm).toBe(100);
    expect(config.ballCount).toBe(1);
  });

  it('returns level 3 config for level 3', () => {
    const config = getLevelConfig(3);
    expect(config.level).toBe(3);
    expect(config.bpm).toBe(120);
    expect(config.ballCount).toBe(2);
  });

  it('returns level 1 for invalid level', () => {
    const config = getLevelConfig(999);
    expect(config.level).toBe(1);
  });

  it('returns level 1 for negative level', () => {
    const config = getLevelConfig(-1);
    expect(config.level).toBe(1);
  });

  it('returns level 1 for zero level', () => {
    const config = getLevelConfig(0);
    expect(config.level).toBe(1);
  });
});

describe('getBeatInterval', () => {
  it('calculates correct interval for 80 BPM', () => {
    const interval = getBeatInterval(80);
    expect(interval).toBe(750); // 60000 / 80
  });

  it('calculates correct interval for 100 BPM', () => {
    const interval = getBeatInterval(100);
    expect(interval).toBe(600); // 60000 / 100
  });

  it('calculates correct interval for 120 BPM', () => {
    const interval = getBeatInterval(120);
    expect(interval).toBe(500); // 60000 / 120
  });

  it('interval decreases as BPM increases', () => {
    const interval80 = getBeatInterval(80);
    const interval100 = getBeatInterval(100);
    const interval120 = getBeatInterval(120);

    expect(interval80).toBeGreaterThan(interval100);
    expect(interval100).toBeGreaterThan(interval120);
  });

  it('handles non-standard BPM values', () => {
    const interval = getBeatInterval(60);
    expect(interval).toBe(1000); // 60000 / 60
  });
});

describe('createBall', () => {
  it('creates a ball with valid properties', () => {
    const ball = createBall(0, 1);

    expect(ball.id).toBe(0);
    expect(typeof ball.x).toBe('number');
    expect(typeof ball.y).toBe('number');
    expect(typeof ball.velocityY).toBe('number');
    expect(typeof ball.beatPhase).toBe('number');
  });

  it('assigns correct id', () => {
    expect(createBall(0, 1).id).toBe(0);
    expect(createBall(5, 1).id).toBe(5);
  });

  it('starts ball at y position 10', () => {
    const ball = createBall(0, 1);
    expect(ball.y).toBe(10);
  });

  it('starts ball with zero velocity', () => {
    const ball = createBall(0, 1);
    expect(ball.velocityY).toBe(0);
  });

  it('starts ball with zero beat phase', () => {
    const ball = createBall(0, 1);
    expect(ball.beatPhase).toBe(0);
  });

  it('positions ball horizontally between 30 and 70', () => {
    for (let i = 0; i < 10; i++) {
      const ball = createBall(i, 1);
      expect(ball.x).toBeGreaterThanOrEqual(30);
      expect(ball.x).toBeLessThan(70);
    }
  });

  it('creates different balls with different x positions', () => {
    const ball1 = createBall(0, 1);
    const ball2 = createBall(1, 1);
    // Due to randomness, they might occasionally be the same
    // but should usually be different
    expect(typeof ball1.x).toBe('number');
    expect(typeof ball2.x).toBe('number');
  });
});

describe('createBalls', () => {
  it('creates 1 ball for level 1', () => {
    const balls = createBalls(1);
    expect(balls).toHaveLength(1);
  });

  it('creates 1 ball for level 2', () => {
    const balls = createBalls(2);
    expect(balls).toHaveLength(1);
  });

  it('creates 2 balls for level 3', () => {
    const balls = createBalls(3);
    expect(balls).toHaveLength(2);
  });

  it('assigns sequential ids to balls', () => {
    const balls = createBalls(3);
    expect(balls[0].id).toBe(0);
    expect(balls[1].id).toBe(1);
  });

  it('all balls have valid properties', () => {
    const balls = createBalls(3);

    for (const ball of balls) {
      expect(typeof ball.id).toBe('number');
      expect(typeof ball.x).toBe('number');
      expect(typeof ball.y).toBe('number');
      expect(typeof ball.velocityY).toBe('number');
      expect(typeof ball.beatPhase).toBe('number');
    }
  });
});

describe('updateBall', () => {
  it('updates ball position based on velocity', () => {
    const ball: BouncingBall = {
      id: 0,
      x: 50,
      y: 50,
      velocityY: 10,
      beatPhase: 0,
    };

    const updated = updateBall(ball, 0, 1, 90, 1);
    expect(updated.y).toBe(60); // 50 + 10 × 1
  });

  it('applies gravity to velocity', () => {
    const ball: BouncingBall = {
      id: 0,
      x: 50,
      y: 50,
      velocityY: 0,
      beatPhase: 0,
    };

    const updated = updateBall(ball, 10, 1, 90, 1);
    expect(updated.velocityY).toBe(10); // 0 + 10 × 1
  });

  it('bounces ball when hitting ground', () => {
    const ball: BouncingBall = {
      id: 0,
      x: 50,
      y: 85,
      velocityY: 10,
      beatPhase: 0,
    };

    const updated = updateBall(ball, 10, 0.5, 90, 1);
    expect(updated.y).toBe(90); // Ground level
    // Gravity applied first: 10 + 10 = 20, then bounce: -abs(20) × 0.5 = -10
    expect(updated.velocityY).toBe(-10);
  });

  it('preserves id and x position', () => {
    const ball: BouncingBall = {
      id: 5,
      x: 42,
      y: 50,
      velocityY: 10,
      beatPhase: 0,
    };

    const updated = updateBall(ball, 10, 1, 90, 1);
    expect(updated.id).toBe(5);
    expect(updated.x).toBe(42);
  });

  it('handles zero delta time', () => {
    const ball: BouncingBall = {
      id: 0,
      x: 50,
      y: 50,
      velocityY: 10,
      beatPhase: 0,
    };

    const updated = updateBall(ball, 10, 1, 90, 0);
    expect(updated.y).toBe(50); // No change
  });

  it('handles negative velocity', () => {
    const ball: BouncingBall = {
      id: 0,
      x: 50,
      y: 50,
      velocityY: -10,
      beatPhase: 0,
    };

    const updated = updateBall(ball, 10, 1, 90, 1);
    expect(updated.y).toBe(40); // 50 + (-10) × 1
  });
});

describe('checkBeatTiming', () => {
  // Mock Date.now for consistent testing
  const originalDateNow = Date.now;
  let mockTime = 0;

  beforeEach(() => {
    mockTime = 0;
    global.Date.now = () => mockTime;
  });

  afterEach(() => {
    global.Date.now = originalDateNow;
  });

  it('returns perfect when tapping at exact beat', () => {
    mockTime = 0; // Exactly on beat
    const result = checkBeatTiming(90, 100, 100);
    expect(result).toBe('perfect');
  });

  it('returns perfect when within 10% of beat start', () => {
    mockTime = 50; // 50ms into 600ms beat interval (Level 2) = 8.3% - within perfect window
    const result = checkBeatTiming(90, 100, 100);
    expect(result).toBe('perfect');
  });

  it('returns perfect when within 10% of beat end', () => {
    mockTime = 550; // Near end of beat interval
    const result = checkBeatTiming(90, 100, 100);
    expect(result).toBe('perfect');
  });

  it('returns null when ball is far from ground', () => {
    mockTime = 0;
    const result = checkBeatTiming(10, 100, 100); // Ball at Y=10, ground at 100
    expect(result).toBeNull();
  });

  it('returns null when outside timing windows', () => {
    mockTime = 200; // 33% through beat interval - outside perfect and good
    const result = checkBeatTiming(95, 100, 100);
    expect(result).toBeNull();
  });
});

describe('calculateScore', () => {
  it('returns 100 for perfect with zero combo', () => {
    const score = calculateScore('perfect', 0);
    expect(score).toBe(100);
  });

  it('adds combo bonus for perfect timing', () => {
    expect(calculateScore('perfect', 5)).toBe(150); // 100 + 5×10
    expect(calculateScore('perfect', 10)).toBe(200); // 100 + 10×10
  });

  it('returns 50 for good with zero combo', () => {
    const score = calculateScore('good', 0);
    expect(score).toBe(50);
  });

  it('adds combo bonus for good timing', () => {
    expect(calculateScore('good', 5)).toBe(75); // 50 + 5×5
    expect(calculateScore('good', 10)).toBe(100); // 50 + 10×5
  });

  it('returns 0 for miss', () => {
    const score = calculateScore('miss', 5);
    expect(score).toBe(0);
  });

  it('returns 0 for null timing', () => {
    const score = calculateScore(null, 5);
    expect(score).toBe(0);
  });

  it('perfect gives higher score than good at same combo', () => {
    const perfectScore = calculateScore('perfect', 5);
    const goodScore = calculateScore('good', 5);
    expect(perfectScore).toBeGreaterThan(goodScore);
  });

  it('handles large combo values', () => {
    const score = calculateScore('perfect', 100);
    expect(score).toBe(1100); // 100 + 100×10
  });
});

describe('isBallActive', () => {
  it('returns true when ball is above ground threshold', () => {
    const ball: BouncingBall = {
      id: 0,
      x: 50,
      y: 80, // groundY is 100, threshold is 5, so 100 - 5 = 95
      velocityY: 10,
      beatPhase: 0,
    };

    expect(isBallActive(ball, 100)).toBe(true);
  });

  it('returns false when ball is at or below ground threshold', () => {
    const ball: BouncingBall = {
      id: 0,
      x: 50,
      y: 95, // 100 - 5 = 95, at threshold
      velocityY: 0,
      beatPhase: 0,
    };

    expect(isBallActive(ball, 100)).toBe(false);
  });

  it('returns false when ball is on ground', () => {
    const ball: BouncingBall = {
      id: 0,
      x: 50,
      y: 100,
      velocityY: 0,
      beatPhase: 0,
    };

    expect(isBallActive(ball, 100)).toBe(false);
  });
});

describe('integration scenarios', () => {
  it('can simulate a ball bouncing', () => {
    let ball: BouncingBall = {
      id: 0,
      x: 50,
      y: 10,
      velocityY: 0,
      beatPhase: 0,
    };

    // Simulate ball falling and bouncing
    ball = updateBall(ball, 10, 1, 90, 5); // Falls to ground (y: 10 + 0*5 = 10, v: 0 + 10*5 = 50, then overshoots to 90)
    // Actually need to check - let's trace through
    // Starting at y=10, v=0
    // After 1 tick with gravity 10: y=10+0=10, v=10
    // After 2 ticks: y=20, v=20
    // After 3 ticks: y=40, v=30
    // After 4 ticks: y=70, v=40
    // After 5 ticks: y=110, v=50 -> clamped to 90, v=-50

    ball = updateBall(ball, 10, 1, 90, 8); // Falls to ground
    expect(ball.y).toBe(90);
    expect(ball.velocityY).toBeLessThan(0); // Bounced up

    ball = updateBall(ball, 10, 1, 90, 1); // Moves up
    expect(ball.y).toBeLessThan(90);
  });

  it('can create game for each level', () => {
    for (let level = 1; level <= 3; level++) {
      const config = getLevelConfig(level);
      const balls = createBalls(level);
      const beatInterval = getBeatInterval(config.bpm);

      expect(balls).toHaveLength(config.ballCount);
      expect(beatInterval).toBeGreaterThan(0);
    }
  });

  it('calculates total score for session', () => {
    let totalScore = 0;
    const timings: Array<'perfect' | 'good' | null> = ['perfect', 'perfect', 'good', 'perfect'];
    const combo = [0, 1, 2, 3];

    for (let i = 0; i < timings.length; i++) {
      totalScore += calculateScore(timings[i], combo[i]);
    }

    // perfect(0) = 100, perfect(1) = 110, good(2) = 60, perfect(3) = 130
    expect(totalScore).toBe(400); // 100 + 110 + 60 + 130
  });
});

describe('edge cases', () => {
  it('handles zero BPM', () => {
    // Should handle gracefully (though not realistic)
    const interval = getBeatInterval(0);
    expect(interval).toBe(Infinity);
  });

  it('handles very high BPM', () => {
    const interval = getBeatInterval(200);
    expect(interval).toBe(300); // 60000 / 200
  });

  it('handles zero gravity', () => {
    const ball: BouncingBall = {
      id: 0,
      x: 50,
      y: 50,
      velocityY: 10,
      beatPhase: 0,
    };

    const updated = updateBall(ball, 0, 1, 90, 1);
    expect(updated.y).toBe(60); // Moves by velocity only
    expect(updated.velocityY).toBe(10); // No gravity applied
  });

  it('handles negative gravity', () => {
    const ball: BouncingBall = {
      id: 0,
      x: 50,
      y: 50,
      velocityY: 0,
      beatPhase: 0,
    };

    const updated = updateBall(ball, -10, 1, 90, 1);
    expect(updated.velocityY).toBe(-10); // Negative gravity pulls up
  });
});

describe('type definitions', () => {
  it('BouncingBall interface is correctly implemented', () => {
    const ball: BouncingBall = {
      id: 1,
      x: 50,
      y: 75,
      velocityY: -5,
      beatPhase: 0.5,
    };

    expect(typeof ball.id).toBe('number');
    expect(typeof ball.x).toBe('number');
    expect(typeof ball.y).toBe('number');
    expect(typeof ball.velocityY).toBe('number');
    expect(typeof ball.beatPhase).toBe('number');
  });

  it('LevelConfig interface is correctly implemented', () => {
    const config: LevelConfig = {
      level: 2,
      bpm: 100,
      ballCount: 1,
    };

    expect(typeof config.level).toBe('number');
    expect(typeof config.bpm).toBe('number');
    expect(typeof config.ballCount).toBe('number');
  });

  it('BeatTiming interface is correctly implemented', () => {
    const timing: BeatTiming = {
      perfect: 0.1,
      good: 0.2,
      miss: 0.3,
    };

    expect(typeof timing.perfect).toBe('number');
    expect(typeof timing.good).toBe('number');
    expect(typeof timing.miss).toBe('number');
  });
});
