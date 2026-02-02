import { useState } from 'react';
import { motion } from 'framer-motion';
import { useStoryStore } from '../store/storyStore';
import {
  ISLANDS,
  getQuestsByIsland,
  isIslandUnlocked,
  getIslandById,
} from '../data/quests';

export function AdventureMap() {
  const { unlockedIslands, badges, completedQuests, totalXp, unlockIsland } =
    useStoryStore();
  const [selectedIsland, setSelectedIsland] = useState<string | null>(null);

  const handleIslandClick = (islandId: string) => {
    if (isIslandUnlocked(islandId, unlockedIslands)) {
      setSelectedIsland(islandId);
    }
  };

  const selectedIslandData = selectedIsland
    ? getIslandById(selectedIsland)
    : null;
  const selectedIslandQuests = selectedIsland
    ? getQuestsByIsland(selectedIsland)
    : [];

  return (
    <div className="bg-white/5 border border-border rounded-xl p-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-bold text-white">Pip's Adventure Map</h3>
        <div className="flex items-center gap-2 text-amber-400">
          <span>⭐</span>
          <span className="font-bold">{totalXp} XP</span>
        </div>
      </div>

      <p className="text-sm text-white/70 mb-3">
        Complete quests to unlock new islands!
      </p>

      {/* Map SVG */}
      <div className="relative bg-slate-900 rounded-lg p-4 mb-3 overflow-hidden">
        <svg
          width="100%"
          height="200"
          viewBox="0 0 400 200"
          className="w-full"
          role="img"
          aria-label="Adventure map showing four islands"
        >
          <title>Adventure Map</title>
          
          {/* Path connecting islands */}
          <path
            d="M 60 100 Q 120 80 180 70 Q 240 60 320 100 Q 360 130 240 150"
            fill="none"
            stroke="#475569"
            strokeWidth="3"
            strokeDasharray="8 4"
            className="opacity-50"
          />

          {/* Island markers */}
          {ISLANDS.map((island, index) => {
            const unlocked = isIslandUnlocked(island.id, unlockedIslands);
            const isSelected = selectedIsland === island.id;
            const islandQuests = getQuestsByIsland(island.id);
            const completedCount = islandQuests.filter((q) =>
              completedQuests.some((cq) => cq.questId === q.id)
            ).length;

            return (
              <g key={island.id}>
                {/* Glow effect for selected/unlocked */}
                {unlocked && (
                  <motion.circle
                    cx={island.position.x}
                    cy={island.position.y}
                    r={unlocked ? 35 : 25}
                    fill={island.color}
                    opacity={0.2}
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: unlocked ? [0.2, 0.4, 0.2] : 0.1,
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: index * 0.3,
                    }}
                  />
                )}

                {/* Island circle */}
                <motion.circle
                  cx={island.position.x}
                  cy={island.position.y}
                  r={isSelected ? 32 : unlocked ? 28 : 24}
                  fill={unlocked ? island.color : island.lockedColor}
                  stroke={isSelected ? '#fff' : 'none'}
                  strokeWidth={3}
                  className="cursor-pointer transition-all"
                  onClick={() => handleIslandClick(island.id)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                />

                {/* Island label */}
                <text
                  x={island.position.x}
                  y={island.position.y + 50}
                  textAnchor="middle"
                  fontSize="11"
                  fill="#fff"
                  className="font-medium"
                >
                  {island.name}
                </text>

                {/* Progress badge */}
                {unlocked && completedCount > 0 && (
                  <g>
                    <circle
                      cx={island.position.x + 20}
                      cy={island.position.y - 20}
                      r={12}
                      fill="#f59e0b"
                    />
                    <text
                      x={island.position.x + 20}
                      y={island.position.y - 16}
                      textAnchor="middle"
                      fontSize="10"
                      fill="#fff"
                      fontWeight="bold"
                    >
                      {completedCount}
                    </text>
                  </g>
                )}

                {/* Lock icon for locked islands */}
                {!unlocked && (
                  <g>
                    <circle
                      cx={island.position.x}
                      cy={island.position.y}
                      r={24}
                      fill="#1e293b"
                      opacity={0.8}
                    />
                    <text
                      x={island.position.x}
                      y={island.position.y + 5}
                      textAnchor="middle"
                      fontSize="16"
                    >
                      🔒
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Selected Island Details */}
      {selectedIslandData && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-800 rounded-lg p-3 mb-3"
        >
          <div className="flex items-center gap-2 mb-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: selectedIslandData.color }}
            />
            <h4 className="font-bold text-white">{selectedIslandData.name}</h4>
          </div>
          <p className="text-sm text-white/70 mb-2">
            {selectedIslandData.description}
          </p>

          {/* Quest list */}
          <div className="space-y-1">
            {selectedIslandQuests.map((quest) => {
              const isCompleted = completedQuests.some(
                (cq) => cq.questId === quest.id
              );
              return (
                <div
                  key={quest.id}
                  className={`flex items-center justify-between p-2 rounded ${
                    isCompleted
                      ? 'bg-green-500/20 border border-green-500/30'
                      : 'bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span>{isCompleted ? '✅' : '📍'}</span>
                    <span
                      className={`text-sm ${
                        isCompleted ? 'text-green-400' : 'text-white/80'
                      }`}
                    >
                      {quest.title}
                    </span>
                  </div>
                  <span className="text-xs text-white/50">
                    +{quest.rewards.xp} XP
                  </span>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Badges earned */}
      {badges.length > 0 && (
        <div className="mt-3">
          <p className="text-xs text-white/60 mb-2">Badges Earned:</p>
          <div className="flex flex-wrap gap-1">
            {badges.slice(0, 10).map((badge) => (
              <span
                key={badge}
                className="px-2 py-1 bg-amber-500/20 border border-amber-500/30 rounded-full text-xs text-amber-400"
              >
                {badge.replace('badge:', '')}
              </span>
            ))}
            {badges.length > 10 && (
              <span className="px-2 py-1 text-xs text-white/60">
                +{badges.length - 10} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Demo controls */}
      <div className="flex gap-2 mt-3">
        <button
          type="button"
          className="px-3 py-2 bg-gradient-to-r from-pip-orange to-pip-rust rounded-md text-white text-xs font-semibold"
          onClick={() => unlockIsland('number-nook')}
        >
          Unlock Number Nook (Demo)
        </button>
        <button
          type="button"
          className="px-3 py-2 bg-white/10 border border-border rounded-md text-white text-xs"
          onClick={() => setSelectedIsland(null)}
        >
          Close Details
        </button>
      </div>
    </div>
  );
}
