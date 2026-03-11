/**
 * Game Components Index
 * 
 * Reusable game UI components using Kenney assets.
 */

// Reward System
export {
  RewardAnimation,
  SimpleReward,
  RewardBadge,
  RewardSummary,
} from './RewardAnimation';
export type { RewardType } from './RewardAnimation';

// Character Feedback
export {
  CharacterReaction,
  CharacterMascot,
  CharacterSelector,
  ReactionOverlay,
} from './CharacterReaction';
export type { ReactionType } from './CharacterReaction';

// Celebration Effects
export {
  CelebrationEffects,
  ScreenFlash,
  ComboCounter,
  LevelUpAnimation,
  StreakFlame,
} from './CelebrationEffects';
export type { EffectType } from './CelebrationEffects';

// Game UI
export { GameHUD } from './GameHUD';
export { GameCanvas } from './GameCanvas';
export { GameCursor } from './GameCursor';
export { GamePauseModal } from './GamePauseModal';
export { GameStartButton } from './GameStartButton';

// Hand/Cursor
export { AnimatedHand } from './AnimatedHand';
export { HandAvatarCursor } from './HandAvatarCursor';
export { FallbackCursor } from './FallbackCursor';

// Game State
export { AttentionMeter } from './AttentionMeter';
export { DragDropSystem } from './DragDropSystem';
export { DwellTarget } from './DwellTarget';

// Camera
export { CameraThumbnail } from './CameraThumbnail';
export { HandDetectionProvider } from './HandDetectionProvider';

// Backgrounds
export {
  GameBackground,
  BackgroundSelector,
  BackgroundPreview,
  getRandomBackground,
  BACKGROUND_METADATA,
} from './GameBackground';
export type { BackgroundType, BackgroundVariant } from './GameBackground';

// Character & Enemy Sprites (Kenney Assets)
export {
  KenneyCharacterAnimated,
  KenneyCharacter,
  CharacterColorSelector,
} from './KenneyCharacterAnimated';
export type { CharacterColor, CharacterAnimation } from './KenneyCharacterAnimated';

export {
  EnemySprite,
  EnemyGallery,
  getAllEnemyTypes,
  getEnemiesByCategory,
} from './EnemySprite';
export type { EnemyType } from './EnemySprite';
