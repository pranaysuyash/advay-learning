/**
 * Reward Animation Component
 * 
 * Displays animated rewards using Kenney assets.
 * Shows coins, gems, stars with bounce/scale animations.
 * 
 * @see docs/audit/KENNEY_ASSET_AUDIT_COMPLETE.md
 */

import { useState, useEffect, useCallback } from 'react';
import { KenneyIcon, type KenneyIconType } from '../ui/KenneyIcon';

export type RewardType = 'coin' | 'gem' | 'star' | 'heart' | 'key';

interface Reward {
  id: string;
  type: RewardType;
  amount: number;
  position: { x: number; y: number };
}

interface RewardAnimationProps {
  rewards: Reward[];
  onComplete?: () => void;
  duration?: number;
}

const REWARD_ICONS: Record<RewardType, KenneyIconType> = {
  coin: 'coin',
  gem: 'gem',
  star: 'star',
  heart: 'heart',
  key: 'key_yellow',
};

const REWARD_COLORS: Record<RewardType, string> = {
  coin: '#FFD700',
  gem: '#00BFFF',
  star: '#FFA500',
  heart: '#FF4444',
  key: '#FFD700',
};

/**
 * Individual reward item with animation
 */
function AnimatedReward({ 
  reward, 
  index, 
  onAnimationEnd 
}: { 
  reward: Reward; 
  index: number;
  onAnimationEnd: (id: string) => void;
}) {
  const [phase, setPhase] = useState<'spawn' | 'bounce' | 'settle'>('spawn');
  const [position, setPosition] = useState(reward.position);

  useEffect(() => {
    // Spawn phase
    const spawnTimer = setTimeout(() => {
      setPhase('bounce');
    }, index * 100);

    // Bounce phase
    const bounceTimer = setTimeout(() => {
      setPhase('settle');
      // Float up animation
      setPosition(prev => ({ ...prev, y: prev.y - 50 }));
    }, index * 100 + 300);

    // End animation
    const endTimer = setTimeout(() => {
      onAnimationEnd(reward.id);
    }, index * 100 + 1500);

    return () => {
      clearTimeout(spawnTimer);
      clearTimeout(bounceTimer);
      clearTimeout(endTimer);
    };
  }, [index, reward.id, onAnimationEnd]);

  const getAnimationStyles = () => {
    switch (phase) {
      case 'spawn':
        return {
          transform: 'scale(0)',
          opacity: 0,
        };
      case 'bounce':
        return {
          transform: 'scale(1.5)',
          opacity: 1,
        };
      case 'settle':
        return {
          transform: 'scale(1)',
          opacity: 0.8,
          transition: 'all 0.5s ease-out',
        };
    }
  };

  return (
    <div
      className="absolute pointer-events-none flex flex-col items-center"
      style={{
        left: position.x,
        top: position.y,
        ...getAnimationStyles(),
      }}
    >
      <KenneyIcon 
        type={REWARD_ICONS[reward.type]} 
        size={48}
        className="drop-shadow-lg"
      />
      {reward.amount > 1 && (
        <span 
          className="font-bold text-lg mt-1"
          style={{ 
            color: REWARD_COLORS[reward.type],
            textShadow: '0 2px 4px rgba(0,0,0,0.5)'
          }}
        >
          +{reward.amount}
        </span>
      )}
    </div>
  );
}

/**
 * RewardAnimation - Displays animated rewards
 * 
 * Usage:
 * ```tsx
 * <RewardAnimation 
 *   rewards={[
 *     { id: '1', type: 'coin', amount: 10, position: { x: 100, y: 200 } },
 *     { id: '2', type: 'star', amount: 1, position: { x: 150, y: 200 } }
 *   ]}
 *   onComplete={() => console.log('Animation done')}
 * />
 * ```
 */
export function RewardAnimation({ 
  rewards, 
  onComplete,
  duration = 2000 
}: RewardAnimationProps) {
  const [activeRewards, setActiveRewards] = useState<Set<string>>(
    new Set(rewards.map(r => r.id))
  );

  const handleAnimationEnd = useCallback((id: string) => {
    setActiveRewards(prev => {
      const next = new Set(prev);
      next.delete(id);
      if (next.size === 0) {
        onComplete?.();
      }
      return next;
    });
  }, [onComplete]);

  // Reset when rewards change
  useEffect(() => {
    setActiveRewards(new Set(rewards.map(r => r.id)));
  }, [rewards]);

  // Auto-complete after duration
  useEffect(() => {
    if (rewards.length === 0) return;
    
    const timer = setTimeout(() => {
      onComplete?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [rewards, duration, onComplete]);

  if (rewards.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {rewards.map((reward, index) => (
        activeRewards.has(reward.id) && (
          <AnimatedReward
            key={reward.id}
            reward={reward}
            index={index}
            onAnimationEnd={handleAnimationEnd}
          />
        )
      ))}
    </div>
  );
}

/**
 * SimpleReward - Single reward display (non-animated)
 * 
 * Usage:
 * ```tsx
 * <SimpleReward type="coin" amount={5} size={32} />
 * ```
 */
interface SimpleRewardProps {
  type: RewardType;
  amount?: number;
  size?: number;
  className?: string;
}

export function SimpleReward({ 
  type, 
  amount = 1, 
  size = 32,
  className = '' 
}: SimpleRewardProps) {
  return (
    <div className={`flex items-center gap-1 ${className}`.trim()}>
      <KenneyIcon 
        type={REWARD_ICONS[type]} 
        size={size}
      />
      {amount > 1 && (
        <span 
          className="font-bold"
          style={{ fontSize: size * 0.6, color: REWARD_COLORS[type] }}
        >
          ×{amount}
        </span>
      )}
    </div>
  );
}

/**
 * RewardBadge - Compact reward badge for UI elements
 */
interface RewardBadgeProps {
  type: RewardType;
  amount: number;
  className?: string;
}

export function RewardBadge({ type, amount, className = '' }: RewardBadgeProps) {
  return (
    <div 
      className={`
        inline-flex items-center gap-1 px-2 py-1 rounded-full
        bg-black/50 backdrop-blur-sm
        ${className}
      `.trim()}
    >
      <KenneyIcon type={REWARD_ICONS[type]} size={16} />
      <span className="text-white text-sm font-bold">{amount}</span>
    </div>
  );
}

/**
 * RewardSummary - Shows total rewards earned
 */
interface RewardSummaryProps {
  coins?: number;
  gems?: number;
  stars?: number;
  className?: string;
}

export function RewardSummary({ 
  coins = 0, 
  gems = 0, 
  stars = 0,
  className = '' 
}: RewardSummaryProps) {
  return (
    <div className={`flex items-center gap-4 ${className}`.trim()}>
      {coins > 0 && <SimpleReward type="coin" amount={coins} />}
      {gems > 0 && <SimpleReward type="gem" amount={gems} />}
      {stars > 0 && <SimpleReward type="star" amount={stars} />}
    </div>
  );
}

export default RewardAnimation;
