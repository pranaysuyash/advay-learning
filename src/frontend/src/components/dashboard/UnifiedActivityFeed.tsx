/**
 * Unified Activity Feed Component
 * Shows all child activities (alphabet + games) in one place
 * 
 * Replaces separate tracking in Settings
 * @ticket TCK-20260307-ARCH-001
 */

import { memo, useMemo } from 'react';
import { motion } from 'framer-motion';
import { UIIcon } from '../ui/Icon';
import type { LetterProgress, GamePlayHistoryEntry } from '../../store/progressStore';

export type ActivityType = 'alphabet' | 'game' | 'creative';

export interface UnifiedActivity {
  id: string;
  type: ActivityType;
  name: string;
  icon: string;
  lastPlayed: string;
  playCount: number;
  totalTimeMinutes: number;
  color: string;
}

interface UnifiedActivityFeedProps {
  letterProgress: Record<string, LetterProgress[]>;
  gameHistory: Record<string, GamePlayHistoryEntry[]>;
  currentProfileId: string;
  currentLanguage: string;
}

export const UnifiedActivityFeed = memo(function UnifiedActivityFeed({
  letterProgress,
  gameHistory,
  currentProfileId,
  currentLanguage,
}: UnifiedActivityFeedProps) {
  const activities = useMemo(() => {
    const unified: UnifiedActivity[] = [];

    // Add alphabet activities
    const langProgress = letterProgress[currentLanguage] || [];
    langProgress.forEach((letter) => {
      if (letter.attempts > 0) {
        unified.push({
          id: `letter-${letter.letter}`,
          type: 'alphabet',
          name: `Letter ${letter.letter}`,
          icon: 'letters',
          lastPlayed: letter.lastAttemptDate,
          playCount: letter.attempts,
          totalTimeMinutes: Math.round(letter.attempts * 2), // Estimate 2 min per attempt
          color: 'bg-blue-100 text-blue-600',
        });
      }
    });

    // Add game activities
    const profileGames = gameHistory[currentProfileId] || [];
    profileGames.forEach((game) => {
      unified.push({
        id: `game-${game.gameId}`,
        type: 'game',
        name: formatGameName(game.gameId),
        icon: getGameIcon(game.gameId),
        lastPlayed: game.lastPlayed,
        playCount: game.playCount,
        totalTimeMinutes: Math.round(game.totalSeconds / 60),
        color: getGameColor(game.gameId),
      });
    });

    // Sort by last played (most recent first)
    return unified.sort((a, b) => 
      new Date(b.lastPlayed).getTime() - new Date(a.lastPlayed).getTime()
    );
  }, [letterProgress, gameHistory, currentProfileId, currentLanguage]);

  const totalPlayTime = useMemo(() => 
    activities.reduce((sum, a) => sum + a.totalTimeMinutes, 0),
    [activities]
  );

  const uniqueActivities = activities.length;

  if (activities.length === 0) {
    return (
      <div className="bg-white rounded-3xl border-4 border-[#F2CC8F] p-6 shadow-[0_6px_0_#E5B86E]">
        <h3 className="text-xl font-black text-advay-slate mb-4 flex items-center gap-2">
          <span className="text-2xl">🎮</span>
          Play Activity
        </h3>
        <p className="text-text-secondary text-center py-8">
          No activities yet! Start playing to see your adventures here.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border-4 border-[#F2CC8F] p-6 shadow-[0_6px_0_#E5B86E]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-black text-advay-slate flex items-center gap-2">
          <span className="text-2xl">🎮</span>
          Recent Play Activity
        </h3>
        <div className="text-sm text-text-secondary">
          <span className="font-black text-advay-slate">{uniqueActivities}</span> games/activities played
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-amber-50 rounded-2xl p-4 border-2 border-amber-200">
          <div className="text-2xl font-black text-advay-slate">{totalPlayTime}</div>
          <div className="text-xs text-text-secondary font-bold uppercase tracking-wide">Minutes of Play</div>
        </div>
        <div className="bg-blue-50 rounded-2xl p-4 border-2 border-blue-200">
          <div className="text-2xl font-black text-advay-slate">{uniqueActivities}</div>
          <div className="text-xs text-text-secondary font-bold uppercase tracking-wide">Activities Explored</div>
        </div>
      </div>

      {/* Activity List */}
      <div className="space-y-3 max-h-80 overflow-y-auto">
        {activities.slice(0, 10).map((activity, index) => (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl hover:bg-slate-100 transition"
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${activity.color}`}>
              <UIIcon name={activity.icon as any} size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-advay-slate truncate">{activity.name}</div>
              <div className="text-xs text-text-secondary">
                Played {activity.playCount} {activity.playCount === 1 ? 'time' : 'times'} • {activity.totalTimeMinutes} min
              </div>
            </div>
            <div className="text-xs text-text-secondary">
              {formatRelativeTime(activity.lastPlayed)}
            </div>
          </motion.div>
        ))}
      </div>

      {activities.length > 10 && (
        <div className="text-center mt-4 text-sm text-text-secondary">
          + {activities.length - 10} more activities
        </div>
      )}
    </div>
  );
});

// Helper functions
function formatGameName(gameId: string): string {
  const nameMap: Record<string, string> = {
    'alphabet-tracing': 'Alphabet Tracing',
    'finger-number-show': 'Finger Counting',
    'music-pinch-beat': 'Music Pinch Beat',
    'connect-the-dots': 'Connect the Dots',
    'physics-playground': 'Physics Playground',
    'word-builder': 'Word Builder',
    'letter-hunt': 'Letter Hunt',
    'color-match-garden': 'Color Match Garden',
    'shape-pop': 'Shape Pop',
    'memory-match': 'Memory Match',
    'free-draw': 'Free Draw',
    'yoga-animals': 'Yoga Animals',
    'air-guitar-hero': 'Air Guitar Hero',
  };
  return nameMap[gameId] || gameId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

function getGameIcon(gameId: string): string {
  const iconMap: Record<string, string> = {
    'alphabet-tracing': 'letters',
    'finger-number-show': 'hand',
    'music-pinch-beat': 'sparkles',
    'connect-the-dots': 'target',
    'physics-playground': 'sparkles',
    'word-builder': 'letters',
    'letter-hunt': 'search',
    'color-match-garden': 'heart',
    'shape-pop': 'circle',
    'memory-match': 'target',
    'free-draw': 'pencil',
    'yoga-animals': 'body',
    'air-guitar-hero': 'music',
  };
  return iconMap[gameId] || 'play';
}

function getGameColor(gameId: string): string {
  const colorMap: Record<string, string> = {
    'alphabet-tracing': 'bg-blue-100 text-blue-600',
    'finger-number-show': 'bg-green-100 text-green-600',
    'music-pinch-beat': 'bg-purple-100 text-purple-600',
    'connect-the-dots': 'bg-orange-100 text-orange-600',
    'physics-playground': 'bg-red-100 text-red-600',
    'word-builder': 'bg-indigo-100 text-indigo-600',
    'letter-hunt': 'bg-teal-100 text-teal-600',
    'color-match-garden': 'bg-pink-100 text-pink-600',
    'shape-pop': 'bg-yellow-100 text-yellow-600',
    'memory-match': 'bg-cyan-100 text-cyan-600',
    'free-draw': 'bg-amber-100 text-amber-600',
    'yoga-animals': 'bg-lime-100 text-lime-600',
    'air-guitar-hero': 'bg-rose-100 text-rose-600',
  };
  return colorMap[gameId] || 'bg-slate-100 text-slate-600';
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

export default UnifiedActivityFeed;
