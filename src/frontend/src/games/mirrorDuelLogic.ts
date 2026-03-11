/**
 * Mirror Duel Game Logic
 *
 * Match poses with the AI opponent to score points!
 *
 * Educational Focus:
 * - Pose recognition and body awareness
 * - Memory and pattern matching
 * - Motor control and coordination
 * - Social-emotional learning
 */

export interface Pose {
  id: string;
  name: string;
  emoji: string;
  arms: 'up' | 'down' | 'left' | 'right' | 'cross' | 'wings' | 'wave';
  legs: 'together' | 'apart' | 'kneel' | 'lunge' | 'kick' | 'stand';
  face: 'smile' | 'surprise' | 'serious' | 'wink' | 'tongue';
  description: string;
}

export interface Level {
  id: number;
  name: string;
  description: string;
  targetScore: number;
  speed: 'slow' | 'medium' | 'fast';
  poses: string[]; // Allowed pose IDs
}

export interface GameState {
  level: number;
  currentPose: Pose | null;
  targetPose: Pose | null;
  score: number;
  isPlaying: boolean;
  isComplete: boolean;
  startTime: number;
  moves: number;
  round: number;
}

export const POSES: Pose[] = [
  { id: 'arms_up', name: 'Arms Up', emoji: '🙌', arms: 'up', legs: 'together', face: 'smile', description: 'Raise both arms up!' },
  { id: 'arms_down', name: 'Arms Down', emoji: '👇', arms: 'down', legs: 'together', face: 'serious', description: 'Put arms down at your sides!' },
  { id: 'arms_left', name: 'Left Arm', emoji: '👈', arms: 'left', legs: 'together', face: 'smile', description: 'Point left with one arm!' },
  { id: 'arms_right', name: 'Right Arm', emoji: '👉', arms: 'right', legs: 'together', face: 'smile', description: 'Point right with one arm!' },
  { id: 'arms_cross', name: 'Cross Arms', emoji: '🦾', arms: 'cross', legs: 'together', face: 'serious', description: 'Cross your arms!' },
  { id: 'arms_wings', name: 'Arms Wings', emoji: '🕊️', arms: 'wings', legs: 'together', face: 'smile', description: 'Spread arms like wings!' },
  { id: 'arms_wave', name: 'Wave', emoji: '👋', arms: 'wave', legs: 'together', face: 'smile', description: 'Wave hello!' },
  { id: 'legs_apart', name: 'Legs Apart', emoji: '🧍', arms: 'down', legs: 'apart', face: 'serious', description: 'Stand with legs apart!' },
  { id: 'legs_kneel', name: 'Kneel', emoji: '🙏', arms: 'up', legs: 'kneel', face: 'serious', description: 'Kneel down!' },
  { id: 'legs_lunge', name: 'Lunge', emoji: '🏃', arms: 'down', legs: 'lunge', face: 'serious', description: 'Step forward into a lunge!' },
  { id: 'legs_kick', name: 'Kick', emoji: '🦵', arms: 'down', legs: 'kick', face: 'surprise', description: 'Kick one leg up!' },
  { id: 'pose_jump', name: 'Jump', emoji: '⭐', arms: 'up', legs: 'together', face: 'smile', description: 'Jump in the air!' },
];

export const LEVELS: Level[] = [
  {
    id: 1,
    name: 'Mirror Master',
    description: 'Match the pose exactly!',
    targetScore: 5,
    speed: 'slow',
    poses: ['arms_up', 'arms_down', 'arms_left', 'arms_right'],
  },
  {
    id: 2,
    name: 'Pose Power',
    description: 'More poses to master!',
    targetScore: 8,
    speed: 'medium',
    poses: ['arms_up', 'arms_down', 'arms_left', 'arms_right', 'arms_cross', 'arms_wings'],
  },
  {
    id: 3,
    name: 'Body Language',
    description: 'Add leg movements!',
    targetScore: 12,
    speed: 'medium',
    poses: ['arms_up', 'arms_down', 'arms_left', 'arms_right', 'legs_apart', 'legs_kneel'],
  },
  {
    id: 4,
    name: 'Full Body',
    description: 'Combine arms and legs!',
    targetScore: 15,
    speed: 'fast',
    poses: POSES.map(p => p.id),
  },
  {
    id: 5,
    name: 'Mirror Champion',
    description: 'Complete all poses!',
    targetScore: 20,
    speed: 'fast',
    poses: POSES.map(p => p.id),
  },
];

export function initializeGame(levelId: number): GameState {
  return {
    level: levelId,
    currentPose: null,
    targetPose: null,
    score: 0,
    isPlaying: false,
    isComplete: false,
    startTime: 0,
    moves: 0,
    round: 0,
  };
}

export function getCurrentLevel(levelId: number): Level {
  return LEVELS.find((l) => l.id === levelId) || LEVELS[0];
}

export function getRandomPose(level: Level): Pose {
  const poseId = level.poses[Math.floor(Math.random() * level.poses.length)];
  return POSES.find(p => p.id === poseId) || POSES[0];
}

export function updatePose(state: GameState): GameState {
  const level = getCurrentLevel(state.level);
  const newPose = getRandomPose(level);
  
  return {
    ...state,
    targetPose: newPose,
    round: state.round + 1,
  };
}

export function checkPoseMatch(current: Pose, target: Pose): boolean {
  return current.id === target.id;
}

export function scorePose(state: GameState, match: boolean): GameState {
  const level = getCurrentLevel(state.level);
  const isComplete = state.score >= level.targetScore;
  
  return {
    ...state,
    score: match ? state.score + 1 : Math.max(0, state.score - 1),
    moves: state.moves + 1,
    isComplete,
  };
}

export function startGame(state: GameState): GameState {
  return {
    ...state,
    isPlaying: true,
    startTime: Date.now(),
    round: 1,
    targetPose: getRandomPose(getCurrentLevel(state.level)),
  };
}

export function resetLevel(state: GameState): GameState {
  return initializeGame(state.level);
}

export function nextLevel(state: GameState): GameState {
  const currentLevel = getCurrentLevel(state.level);
  const nextLevelId = currentLevel.id + 1;

  if (nextLevelId > LEVELS.length) {
    return state;
  }

  return initializeGame(nextLevelId);
}

export function calculateScore(moves: number, timeMs: number, level: number): number {
  const baseScore = 1000;
  const movesPenalty = Math.max(0, moves - 20) * 5;
  const timePenalty = Math.floor(timeMs / 1000) * 2;
  const levelBonus = level * 100;

  return Math.max(0, baseScore - movesPenalty - timePenalty + levelBonus);
}

export function getPoseInfo(poseId: string): {
  name: string;
  emoji: string;
  description: string;
} {
  const pose = POSES.find(p => p.id === poseId);
  return pose
    ? { name: pose.name, emoji: pose.emoji, description: pose.description }
    : { name: 'Unknown', emoji: '❓', description: 'Pose not found' };
}
