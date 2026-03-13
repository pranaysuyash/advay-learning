export type BowState = 'idle' | 'drawing' | 'released';

export type TargetType = 'bullseye' | 'balloon';

export interface Target {
  id: string;
  x: number;
  y: number;
  radius: number;
  points: number;
  type: TargetType;
  active: boolean;
  vx: number; // For moving targets
  vy: number;
}

export interface Arrow {
  active: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
}

export interface VirtualArcheryState {
  score: number;
  timeRemaining: number;
  bowState: BowState;
  drawPower: number; // 0 to 1
  drawAngle: number; // radians
  wind: number; // -val (left) to +val (right)
  targets: Target[];
  arrow: Arrow;
}

const GRAVITY = 800; // pixels per second squared
const MAX_POWER = 1500; // max initial velocity pixels per second
const BOW_X = 0; // Relative to center bottom
const BOW_Y = 0; // Relative to center bottom

export function createInitialState(): VirtualArcheryState {
  return {
    score: 0,
    timeRemaining: 60,
    bowState: 'idle',
    drawPower: 0,
    drawAngle: -Math.PI / 2, // Pointing straight up
    wind: (Math.random() - 0.5) * 400,
    targets: spawnInitialTargets(),
    arrow: { active: false, x: 0, y: 0, vx: 0, vy: 0, rotation: 0 },
  };
}

function spawnInitialTargets(): Target[] {
  return [
    {
      id: 't1',
      x: -200,
      y: -400,
      radius: 40,
      points: 10,
      type: 'bullseye',
      active: true,
      vx: 0,
      vy: 0,
    },
    {
      id: 't2',
      x: 200,
      y: -300,
      radius: 30,
      points: 20,
      type: 'bullseye',
      active: true,
      vx: 50, // Moving right
      vy: 0,
    },
    {
      id: 't3',
      x: 0,
      y: -500,
      radius: 20,
      points: 50,
      type: 'balloon',
      active: true,
      vx: 0,
      vy: -20, // Floating up
    },
  ];
}

export function updateGameState(
  state: VirtualArcheryState,
  deltaTime: number,
  canvasWidth: number,
  canvasHeight: number,
  onHit: (target: Target) => void
): VirtualArcheryState {
  const nextState = { ...state };

  // Update time
  if (nextState.timeRemaining > 0) {
    nextState.timeRemaining = Math.max(0, nextState.timeRemaining - deltaTime);
  }

  // Update wind randomly occasionally
  if (Math.random() < 0.01) {
    nextState.wind += (Math.random() - 0.5) * 100;
    nextState.wind = Math.max(-500, Math.min(500, nextState.wind));
  }

  // Update targets
  nextState.targets = nextState.targets.map((t) => {
    if (!t.active) return t;
    const newTarget = { ...t };
    newTarget.x += newTarget.vx * deltaTime;
    newTarget.y += newTarget.vy * deltaTime;

    // Bounce off invisible walls
    if (newTarget.type === 'bullseye' && newTarget.vx !== 0) {
      if (newTarget.x < -canvasWidth / 2 + 50 || newTarget.x > canvasWidth / 2 - 50) {
        newTarget.vx *= -1;
      }
    }
    // Float up and respawn balloons
    if (newTarget.type === 'balloon') {
      if (newTarget.y < -canvasHeight) {
        newTarget.active = false;
      }
    }
    return newTarget;
  });

  // Spawn new targets if needed
  if (nextState.targets.filter(t => t.active).length < 3) {
    nextState.targets.push({
      id: Math.random().toString(36).substr(2, 9),
      x: (Math.random() - 0.5) * (canvasWidth - 100),
      y: -Math.random() * (canvasHeight / 2) - 200,
      radius: Math.random() > 0.5 ? 40 : 25,
      points: Math.random() > 0.5 ? 10 : 30,
      type: Math.random() > 0.7 ? 'balloon' : 'bullseye',
      active: true,
      vx: Math.random() > 0.5 ? (Math.random() - 0.5) * 100 : 0,
      vy: Math.random() > 0.7 ? -30 : 0,
    });
  }

  // Update arrow physics
  if (nextState.arrow.active) {
    const arrow = nextState.arrow;
    arrow.vy += GRAVITY * deltaTime;
    arrow.vx += nextState.wind * deltaTime;
    arrow.x += arrow.vx * deltaTime;
    arrow.y += arrow.vy * deltaTime;
    arrow.rotation = Math.atan2(arrow.vy, arrow.vx);

    // Collision detection
    for (const target of nextState.targets) {
      if (!target.active) continue;
      const dx = arrow.x - target.x;
      const dy = arrow.y - target.y;
      const distSq = dx * dx + dy * dy;
      if (distSq < target.radius * target.radius) {
        // Hit!
        target.active = false;
        nextState.score += target.points;
        nextState.arrow.active = false; // Arrow disappears
        nextState.bowState = 'idle'; // Reset bow ready for next
        onHit(target);
        break; // Only hit one
      }
    }

    // Off screen detection
    if (
      arrow.y > 100 || // Fell below screen
      arrow.x < -canvasWidth || // Way off left
      arrow.x > canvasWidth // Way off right
    ) {
      nextState.arrow.active = false;
      nextState.bowState = 'idle';
    }
  }

  return nextState;
}

export function drawBow(state: VirtualArcheryState, dragX: number, dragY: number): VirtualArcheryState {
  if (state.bowState === 'released' && state.arrow.active) return state; // Already shot

  // dragX and dragY are relative to bow center. Usually positive Y means pulling down.
  const distance = Math.sqrt(dragX * dragX + dragY * dragY);
  const maxDrag = 200; // pixels
  const power = Math.min(1, distance / maxDrag);
  
  // Angle of the pull. If pulling straight down (x=0, y>0), arrow points straight up.
  // drag is vector from bow to hand. Arrow points opposite.
  const angle = Math.atan2(-dragY, -dragX);

  return {
    ...state,
    bowState: 'drawing',
    drawPower: power,
    drawAngle: angle,
  };
}

export function releaseBow(state: VirtualArcheryState): VirtualArcheryState {
  if (state.bowState !== 'drawing' || state.drawPower < 0.1) {
    return { ...state, bowState: 'idle', drawPower: 0 };
  }

  const velocity = state.drawPower * MAX_POWER;
  
  return {
    ...state,
    bowState: 'released',
    arrow: {
      active: true,
      x: BOW_X,
      y: BOW_Y,
      vx: Math.cos(state.drawAngle) * velocity,
      vy: Math.sin(state.drawAngle) * velocity,
      rotation: state.drawAngle,
    },
    drawPower: 0,
  };
}
