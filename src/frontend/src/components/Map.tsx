import { useStoryStore } from '../store/storyStore';

export function AdventureMap() {
  const { unlockedIslands, unlockIsland } = useStoryStore();

  return (
    <div className="bg-white/5 border border-border rounded-xl p-4">
      <h3 className="text-lg font-semibold mb-2">Pip's Adventure Map</h3>
      <p className="text-sm text-white/70 mb-3">Unlock islands by completing short missions.</p>

      <svg width="100%" height="150" viewBox="0 0 400 150" className="mb-3" role="img" aria-label="Adventure map showing three islands">
        <title>Adventure Map</title>
        <rect x="0" y="0" width="400" height="150" fill="#0f172a" rx="8" />
        <g>
          <circle cx="60" cy="80" r="18" fill={unlockedIslands.includes('island-1') ? '#ef4444' : '#334155'} />
          <text x="60" y="85" textAnchor="middle" fontSize="10" fill="#fff">Island 1</text>

          <circle cx="180" cy="50" r="18" fill={unlockedIslands.includes('island-2') ? '#ef4444' : '#334155'} />
          <text x="180" y="55" textAnchor="middle" fontSize="10" fill="#fff">Island 2</text>

          <circle cx="320" cy="80" r="18" fill={unlockedIslands.includes('island-3') ? '#ef4444' : '#334155'} />
          <text x="320" y="85" textAnchor="middle" fontSize="10" fill="#fff">Island 3</text>
        </g>
      </svg>

      <div className="flex gap-2">
        <button
          type="button"
          className="px-3 py-2 bg-gradient-to-r from-red-500 to-red-600 rounded-md text-white font-semibold"
          onClick={() => unlockIsland('island-1')}
        >
          Unlock Island 1 (Demo)
        </button>
        <button
          type="button"
          className="px-3 py-2 bg-white/10 border border-border rounded-md text-white"
          onClick={() => unlockIsland('island-2')}
        >
          Unlock Island 2 (Demo)
        </button>
      </div>
    </div>
  );
}
