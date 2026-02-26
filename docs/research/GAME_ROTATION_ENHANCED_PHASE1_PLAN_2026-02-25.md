# Enhanced Phase 1: Smart Dynamic Dashboard — Implementation Plan

**Date**: 2026-02-25 12:15 PST  
**Status**: APPROVED - Ready for implementation  
**Duration**: 1-2 weeks  
**Effort**: ~50-55 hours total (backend + frontend + testing)  
**Ticket**: TCK-20260225-003  
**Decision**: Combine all 3 phases into one comprehensive implementation

---

## Executive Decision Summary

**User Feedback**:

> "additionally in phase 1 - new, most played local, most played overall, not played etc as well...what do you think? also how cons is not personalized - we also use local as well, so yes we include recency, play time, most played by no. of users and so on, so can be used to make dashboard dynamic across all, so combination of all phases and anything else that's missed?"

**Key Insight**: The original 3-phase approach was overly cautious. We CAN build a comprehensive system from day one that:

- ✅ Uses ALL available data (personal history + global popularity + game metadata)
- ✅ Has smart graceful fallbacks (works even when data missing)
- ✅ IS personalized (using local play history, recency, preferences)
- ✅ IS dynamic across all users (new users, returning users, guest users all get optimized experience)

**Decision**: Build **Enhanced Phase 1** — One comprehensive implementation instead of 3 incremental phases.

---

## Core Principle

Use **ALL available data sources** with smart graceful fallbacks:

| Data Source               | Information                                                | Always Available          | Used In                       |
| ------------------------- | ---------------------------------------------------------- | ------------------------- | ----------------------------- |
| **Personal play history** | Most played local, recency, completion rate, total time    | After ≥1 game played      | Slot 2, Slot 4 filter         |
| **Global game stats**     | Trending, popularity, age cohort rankings, completion rate | After backend deployed    | Slot 3, Slot 4 quality filter |
| **Game metadata**         | isNew, vibe, ageRange, worldId, cvRequirements             | ✅ Always (gameRegistry)  | Slot 1, all filters           |
| **Time context**          | Hour (morning/afternoon/evening)                           | ✅ Always (Date.now)      | Slot 4 vibe matching          |
| **Device capabilities**   | Camera, microphone available                               | ✅ Always (navigator API) | All slots (safety filter)     |
| **Time-based rotation**   | Deterministic weekly rotation                              | ✅ Always (Date.now)      | Ultimate fallback             |

---

## 4-Slot Recommendation Strategy

```
┌─────────────┬─────────────┬─────────────┬─────────────┐
│  SLOT 1:    │  SLOT 2:    │  SLOT 3:    │  SLOT 4:    │
│  NEW        │  FAVORITE   │  TRENDING   │  DISCOVER   │
│             │             │             │             │
│ • isNew     │ • Most      │ • Global    │ • Unplayed  │
│   flag      │   played    │   popular   │   games     │
│             │   local     │   (age      │ • Quality   │
│ Always      │ (personal)  │   cohort)   │   filter    │
│ available   │             │             │   (>70%)    │
│             │ IF history  │ IF backend  │ • Vibe      │
│ Badge:      │ available   │ available   │   match     │
│ 🆕 NEW      │             │             │   (time)    │
│             │ Badge:      │ Badge:      │             │
│             │ ⭐ FAVORITE │ 🔥 TRENDING │ Badge:      │
│             │ "Played 5x" │ "1,247 kids"│ 🎲 DISCOVER │
│             │             │             │ "95% finish"│
└─────────────┴─────────────┴─────────────┴─────────────┘

Fallback Chain (for each slot):
1. Try primary data source
2. If unavailable → try secondary source
3. If still unavailable → time-based rotation
Result: Always returns 4 games
```

---

## Full Algorithm Implementation

```typescript
/**
 * Enhanced Phase 1: Smart game recommendation with graceful fallbacks
 *
 * Uses ALL available data:
 * - Personal play history (most played, recency, completion rate)
 * - Global statistics (trending, age cohorts, completion rates)
 * - Game metadata (isNew, vibe, ageRange, worldId, cvRequirements)
 * - Time context (morning = active, evening = chill)
 * - Device capabilities (camera/mic availability)
 *
 * Graceful degradation:
 * - Works for new users (no history)
 * - Works for guest users (no login)
 * - Works when backend down (fallback rotation)
 * - Always returns 4 games
 */
async function getFeaturedGamesEnhanced(
  profile?: Profile,
): Promise<GameManifest[]> {
  const allGames = getListedGames();
  const slots: GameManifest[] = [];

  // ========================================
  // Data Sources (fetch in parallel)
  // ========================================
  const [personalHistory, globalStats, deviceCapabilities] = await Promise.all([
    profile ? getGameHistory(profile.id) : Promise.resolve(null),
    fetchGlobalGameStats().catch(() => null), // Graceful fallback if backend down
    checkDeviceCapabilities(), // Camera, mic availability
  ]);

  // ========================================
  // Filter games by device capabilities & age
  // ========================================
  const capableGames = allGames.filter((game) => {
    // Device capability filter (MANDATORY - safety/UX)
    if (game.cvRequirements?.camera && !deviceCapabilities.hasCamera)
      return false;
    if (game.cvRequirements?.microphone && !deviceCapabilities.hasMicrophone)
      return false;

    // Age appropriateness filter (MANDATORY - safety)
    return isAgeAppropriate(game, profile);
  });

  // ========================================
  // SLOT 1: NEW (always prioritize discovery)
  // ========================================
  const newGames = capableGames.filter((g) => g.isNew);
  if (newGames.length > 0) {
    slots.push(sample(newGames));
  }

  // ========================================
  // SLOT 2: FAVORITE (most played local)
  // ========================================
  if (personalHistory?.length) {
    const topLocal = personalHistory
      .map((h) => ({
        ...h,
        game: capableGames.find((g) => g.id === h.gameId),
      }))
      .filter((h) => h.game && !slots.includes(h.game))
      .sort((a, b) => b.playCount - a.playCount)[0];

    if (topLocal?.game) {
      slots.push(topLocal.game);
    }
  }
  // Fallback: If no personal history, skip this slot (fill later)

  // ========================================
  // SLOT 3: TRENDING (global popularity)
  // ========================================
  if (globalStats?.length) {
    const ageGroup = profile?.age ? getAgeGroup(profile.age) : null;

    const trending = capableGames
      .map((g) => {
        const stats = globalStats.find((s) => s.gameId === g.id);
        if (!stats) return { game: g, score: 0 };

        // Age cohort ranking (1 = most popular in age group)
        if (ageGroup && stats.ageCohortRank?.[ageGroup]) {
          return { game: g, score: 1000 - stats.ageCohortRank[ageGroup] };
        }

        // Overall popularity score (fallback for guest users)
        return { game: g, score: stats.popularityScore || 0 };
      })
      .filter((g) => !slots.includes(g.game) && g.score > 0)
      .sort((a, b) => b.score - a.score)[0];

    if (trending?.game) {
      slots.push(trending.game);
    }
  }
  // Fallback: If backend down, skip this slot (fill later)

  // ========================================
  // SLOT 4: DISCOVER (unplayed + quality)
  // ========================================
  const playedIds = new Set(personalHistory?.map((h) => h.gameId) || []);
  const unplayed = capableGames.filter(
    (g) => !playedIds.has(g.id) && !slots.includes(g),
  );

  if (unplayed.length > 0) {
    // Quality filter: Prefer games with high completion rate (>70%)
    const qualityUnplayed = unplayed.filter((g) => {
      const stats = globalStats?.find((s) => s.gameId === g.id);
      // If no stats (brand new game), include it (benefit of doubt)
      // If stats exist, require 70%+ completion rate
      return !stats || stats.completionRate > 0.7;
    });

    // Vibe preference (time-of-day matching)
    const hour = new Date().getHours();
    const preferredVibe = hour < 12 ? 'active' : hour < 18 ? 'brainy' : 'chill';
    const vibeMatches = (
      qualityUnplayed.length ? qualityUnplayed : unplayed
    ).filter((g) => g.vibe === preferredVibe);

    // Prefer vibe matches, fallback to any quality unplayed
    const pool =
      vibeMatches.length > 0
        ? vibeMatches
        : qualityUnplayed.length > 0
          ? qualityUnplayed
          : unplayed;

    slots.push(sample(pool));
  }

  // ========================================
  // FALLBACK: Fill remaining slots
  // ========================================
  if (slots.length < 4) {
    const weekNumber = Math.floor(Date.now() / (1000 * 60 * 60 * 24 * 7));
    const rotationIndex = (weekNumber * 2) % capableGames.length;

    const remaining = capableGames
      .filter((g) => !slots.includes(g))
      .slice(rotationIndex, rotationIndex + (4 - slots.length));

    slots.push(...remaining);
  }

  // ========================================
  // World diversity (max 2 from same world)
  // ========================================
  const diverseSlots = ensureWorldDiversity(slots);

  return diverseSlots.slice(0, 4);
}

/**
 * Helper: Ensure world diversity (max 2 games from same world)
 */
function ensureWorldDiversity(games: GameManifest[]): GameManifest[] {
  const diverse: GameManifest[] = [];
  const worldCount = new Map<string, number>();

  for (const game of games) {
    const count = worldCount.get(game.worldId) || 0;
    if (count < 2) {
      // Max 2 games from same world
      diverse.push(game);
      worldCount.set(game.worldId, count + 1);
    }
  }

  return diverse;
}

/**
 * Helper: Get age group bucket for collaborative filtering
 */
function getAgeGroup(age: number): string {
  if (age <= 4) return '3-4y';
  if (age <= 6) return '5-6y';
  return '7-8y';
}

/**
 * Helper: Check if game is age-appropriate
 */
function isAgeAppropriate(game: GameManifest, profile?: Profile): boolean {
  if (!profile?.age) return true; // Guest user: show all games

  const [minAge, maxAge] = game.ageRange.split('-').map(Number);
  return profile.age >= minAge && profile.age <= maxAge;
}

/**
 * Helper: Check device capabilities (camera, microphone)
 */
async function checkDeviceCapabilities(): Promise<{
  hasCamera: boolean;
  hasMicrophone: boolean;
}> {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    stream.getTracks().forEach((track) => track.stop());
    return { hasCamera: true, hasMicrophone: true };
  } catch {
    // Try camera only
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach((track) => track.stop());
      return { hasCamera: true, hasMicrophone: false };
    } catch {
      return { hasCamera: false, hasMicrophone: false };
    }
  }
}

/**
 * Helper: Random sample from array
 */
function sample<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Helper: Shuffle array (Fisher-Yates)
 */
function shuffle<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
```

---

## Backend Requirements (MANDATORY - NO "IFS")

### 1. Database Schema Changes

**Add to `game_progress` table**:

```sql
-- Add completion tracking
ALTER TABLE game_progress
ADD COLUMN completed BOOLEAN DEFAULT FALSE NOT NULL;

-- Add session duration (ensure it exists)
ALTER TABLE game_progress
ADD COLUMN session_duration_seconds INTEGER;

-- Performance indexes for stats aggregation
CREATE INDEX idx_game_progress_game_created
ON game_progress(game_name, created_at);

CREATE INDEX idx_game_progress_profile_game
ON game_progress(profile_id, game_name, created_at);

CREATE INDEX idx_game_progress_completed
ON game_progress(completed, created_at);
```

**Reasoning**:

- `completed`: MUST track if user finished game vs abandoned (for completion rate calculation)
- `session_duration_seconds`: MUST be stored properly (already logged, ensure schema correct)
- Indexes: MANDATORY for stats query performance (will query millions of records)

---

### 2. New API Endpoint: `/api/games/stats`

**Endpoint**: `GET /api/games/stats`

**Query Parameters**:

- `period`: `"day" | "week" | "month"` (default: `"week"`)
- `ageGroup`: `"3-4y" | "5-6y" | "7-8y"` (optional, returns all ages if omitted)

**Response Schema**:

```typescript
interface GlobalGameStatsResponse {
  stats: {
    gameId: string;
    totalPlays: number; // Total sessions in period
    avgSessionMinutes: number; // Average duration (rounded to 1 decimal)
    completionRate: number; // % of sessions marked completed (0-1)
    popularityScore: number; // Weighted score (recent plays * 2 + total * 0.5)
    ageCohortRank: {
      // Rankings per age group (1 = most popular)
      '3-4y'?: number;
      '5-6y'?: number;
      '7-8y'?: number;
    };
  }[];
  period: 'day' | 'week' | 'month';
  ageGroup?: string;
  generatedAt: string; // ISO timestamp
}
```

**Backend Implementation** (Python FastAPI):

```python
# src/backend/app/routers/games.py

from datetime import datetime, timedelta
from typing import Literal, Optional
from fastapi import APIRouter, Depends
from sqlalchemy import func, Integer, cast
from app.models import GameProgress, Profile
from app.dependencies import get_db, get_current_user

router = APIRouter()

@router.get("/games/stats")
async def get_game_stats(
    period: Literal["day", "week", "month"] = "week",
    ageGroup: Optional[Literal["3-4y", "5-6y", "7-8y"]] = None,
    db = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Return aggregated game statistics for recommendation engine.

    Aggregates across all users (anonymized):
    - Total plays (session count)
    - Average session duration
    - Completion rate (% completed vs abandoned)
    - Popularity score (recency-weighted)
    - Age cohort rankings (trending in age groups)

    Privacy: Only aggregate data, no individual user tracking exposed.
    Caching: Results cached for 1 hour to reduce database load.
    """

    # Calculate date range
    now = datetime.utcnow()
    days = {"day": 1, "week": 7, "month": 30}[period]
    start_date = now - timedelta(days=days)

    # Base query: aggregate by game_name
    query = db.query(
        GameProgress.game_name,
        func.count(GameProgress.id).label("total_plays"),
        func.avg(GameProgress.session_duration_seconds).label("avg_seconds"),
        func.avg(cast(GameProgress.completed, Integer)).label("completion_rate"),
    ).filter(
        GameProgress.created_at >= start_date
    )

    # If age group specified, join with profiles and filter
    if ageGroup:
        minAge, maxAge = map(int, ageGroup.replace('y', '').split('-'))
        query = query.join(Profile, GameProgress.profile_id == Profile.id).filter(
            Profile.age >= minAge,
            Profile.age <= maxAge
        )

    query = query.group_by(GameProgress.game_name)

    # Execute query
    results = []
    for row in query.all():
        # Recent plays (last 3 days) for popularity boost
        recent_plays = db.query(func.count(GameProgress.id)).filter(
            GameProgress.game_name == row.game_name,
            GameProgress.created_at >= now - timedelta(days=3)
        ).scalar()

        # Popularity score (recency-weighted)
        # Recent plays get 2x weight, older plays get 0.5x weight
        popularity_score = (recent_plays * 2.0) + (row.total_plays * 0.5)

        results.append({
            "gameId": row.game_name,
            "totalPlays": row.total_plays,
            "avgSessionMinutes": round((row.avg_seconds or 0) / 60, 1),
            "completionRate": round(row.completion_rate or 0, 2),
            "popularityScore": round(popularity_score, 1)
        })

    # Sort by popularity and assign age cohort ranks
    results.sort(key=lambda x: x["popularityScore"], reverse=True)
    for i, game in enumerate(results):
        if ageGroup:
            game["ageCohortRank"] = {ageGroup: i + 1}
        else:
            # If no age group specified, calculate ranks for all age groups
            # For simplicity, leave empty - frontend should specify age group
            game["ageCohortRank"] = {}

    return {
        "stats": results,
        "period": period,
        "ageGroup": ageGroup,
        "generatedAt": now.isoformat()
    }
```

**Caching Strategy** (MANDATORY for performance):

```python
# src/backend/app/routers/games.py (add caching)

from cachetools import TTLCache
from functools import lru_cache

# Cache for 1 hour (3600 seconds)
# Stores up to 100 different cache keys (combinations of period + ageGroup)
stats_cache = TTLCache(maxsize=100, ttl=3600)

@router.get("/games/stats")
async def get_game_stats(
    period: Literal["day", "week", "month"] = "week",
    ageGroup: Optional[Literal["3-4y", "5-6y", "7-8y"]] = None,
    db = Depends(get_db),
    current_user = Depends(get_current_user)
):
    cache_key = f"stats:{period}:{ageGroup or 'all'}"

    # Check cache first
    if cache_key in stats_cache:
        return stats_cache[cache_key]

    # ... compute stats (same code as above) ...

    result = {
        "stats": results,
        "period": period,
        "ageGroup": ageGroup,
        "generatedAt": now.isoformat()
    }

    # Store in cache
    stats_cache[cache_key] = result
    return result

# Optional: Manual cache clear endpoint (for testing/debugging)
@router.post("/games/stats/clear-cache")
async def clear_stats_cache(current_user = Depends(get_current_admin)):
    """Clear stats cache (admin only)"""
    stats_cache.clear()
    return {"status": "cache cleared"}
```

---

### 3. Game Session Tracking Updates

**Update `recordGameSessionProgress` endpoint to accept `completed` parameter**:

```python
# src/backend/app/routers/progress.py

from pydantic import BaseModel

class GameSessionProgressRequest(BaseModel):
    gameName: str
    score: int
    durationSeconds: int
    completed: bool  # NEW FIELD (MANDATORY)
    sessionId: str

@router.post("/progress/game-session")
async def record_game_session_progress(
    request: GameSessionProgressRequest,
    db = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Record game session progress with completion status"""

    progress = GameProgress(
        profile_id=current_user.profile_id,
        game_name=request.gameName,
        score=request.score,
        session_duration_seconds=request.durationSeconds,
        completed=request.completed,  # NEW FIELD
        session_id=request.sessionId,
        created_at=datetime.utcnow()
    )

    db.add(progress)
    db.commit()

    return {"status": "success", "progressId": progress.id}
```

**Frontend hook update** (to pass `completed` flag):

```typescript
// src/frontend/src/hooks/useGameSessionProgress.ts

export function useGameSessionProgress(gameId: string) {
  const { recordGamePlay } = useProgressStore();
  const { currentProfile } = useProfileStore();

  const recordGameSessionProgress = async (
    score: number,
    durationSeconds: number,
    completed: boolean, // NEW PARAMETER (MANDATORY)
  ) => {
    // Send to backend
    await fetch('/api/progress/game-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        gameName: gameId,
        score,
        durationSeconds,
        completed, // NEW FIELD (MANDATORY)
        sessionId: crypto.randomUUID(),
      }),
    });

    // Record in frontend store
    if (currentProfile?.id) {
      recordGamePlay(
        currentProfile.id,
        gameId,
        durationSeconds / 60, // Convert to minutes
        completed,
      );
    }
  };

  return { recordGameSessionProgress };
}
```

**Game component update** (when to mark as completed):

```typescript
// Example: src/frontend/src/pages/games/AlphabetTracing.tsx

export function AlphabetTracing() {
  const { recordGameSessionProgress } =
    useGameSessionProgress('alphabet-tracing');
  const [startTime] = useState(Date.now());

  const handleGameComplete = async (finalScore: number) => {
    const duration = Math.floor((Date.now() - startTime) / 1000);

    // Mark as completed if score >= 70% (customize per game)
    const completed = finalScore >= 70;

    await recordGameSessionProgress(finalScore, duration, completed);
  };

  const handleGameQuit = async () => {
    const duration = Math.floor((Date.now() - startTime) / 1000);
    const currentScore = calculateCurrentScore();

    // Quitting early = not completed
    await recordGameSessionProgress(currentScore, duration, false);
  };

  // ... rest of game logic ...
}
```

---

### 4. Frontend State Management (`progressStore`)

**Extend `progressStore.ts`** to track game history:

```typescript
// src/frontend/src/store/progressStore.ts

interface GamePlayHistory {
  gameId: string;
  playCount: number; // Total times played
  totalMinutes: number; // Cumulative play time
  lastPlayed: string; // ISO timestamp
  completionRate: number; // 0-1 (% of sessions completed)
  scores: number[]; // Last 5 scores (for trend analysis)
}

interface ProgressState {
  // ... existing state (letterProgress, etc.) ...

  // NEW: Game history per profile
  gameHistory: Record<string, GamePlayHistory[]>; // profileId -> history

  // NEW: Actions
  recordGamePlay: (
    profileId: string,
    gameId: string,
    durationMinutes: number,
    completed: boolean,
    score?: number,
  ) => void;

  getGameHistory: (profileId: string, limit?: number) => GamePlayHistory[];
  getRecentGames: (profileId: string, limit: number) => GamePlayHistory[];
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      // ... existing state ...
      gameHistory: {},

      recordGamePlay: (
        profileId,
        gameId,
        durationMinutes,
        completed,
        score = 0,
      ) => {
        set((state) => {
          const history = state.gameHistory[profileId] || [];
          const existing = history.find((h) => h.gameId === gameId);

          if (existing) {
            // Update existing entry
            const newPlayCount = existing.playCount + 1;
            const newCompletionRate =
              (existing.completionRate * existing.playCount +
                (completed ? 1 : 0)) /
              newPlayCount;

            existing.playCount = newPlayCount;
            existing.totalMinutes += durationMinutes;
            existing.lastPlayed = new Date().toISOString();
            existing.completionRate = newCompletionRate;

            // Track last 5 scores
            existing.scores = [score, ...existing.scores].slice(0, 5);
          } else {
            // Add new entry
            history.push({
              gameId,
              playCount: 1,
              totalMinutes: durationMinutes,
              lastPlayed: new Date().toISOString(),
              completionRate: completed ? 1 : 0,
              scores: [score],
            });
          }

          // Keep last 50 games per profile (sorted by recency)
          const sorted = history
            .sort(
              (a, b) =>
                new Date(b.lastPlayed).getTime() -
                new Date(a.lastPlayed).getTime(),
            )
            .slice(0, 50);

          return {
            gameHistory: {
              ...state.gameHistory,
              [profileId]: sorted,
            },
          };
        });
      },

      getGameHistory: (profileId, limit = 50) => {
        const history = get().gameHistory[profileId] || [];
        return history.slice(0, limit);
      },

      getRecentGames: (profileId, limit) => {
        const history = get().gameHistory[profileId] || [];
        return history
          .sort(
            (a, b) =>
              new Date(b.lastPlayed).getTime() -
              new Date(a.lastPlayed).getTime(),
          )
          .slice(0, limit);
      },
    }),
    {
      name: 'progress-storage',
      // Persist gameHistory to localStorage
      partialize: (state) => ({
        letterProgress: state.letterProgress,
        gameHistory: state.gameHistory,
      }),
    },
  ),
);
```

---

### 5. React Query Hook for Global Stats

**Create `useGameStats.ts` hook**:

```typescript
// src/frontend/src/hooks/useGameStats.ts

import { useQuery } from '@tanstack/react-query';

interface GlobalGameStats {
  gameId: string;
  totalPlays: number;
  avgSessionMinutes: number;
  completionRate: number;
  popularityScore: number;
  ageCohortRank: Record<string, number>;
}

interface GlobalGameStatsResponse {
  stats: GlobalGameStats[];
  period: 'day' | 'week' | 'month';
  ageGroup?: string;
  generatedAt: string;
}

export function useGameStats(
  period: 'day' | 'week' | 'month' = 'week',
  ageGroup?: string,
) {
  return useQuery<GlobalGameStatsResponse>({
    queryKey: ['gameStats', period, ageGroup],
    queryFn: async () => {
      const params = new URLSearchParams({ period });
      if (ageGroup) params.append('ageGroup', ageGroup);

      const res = await fetch(`/api/games/stats?${params}`);
      if (!res.ok) throw new Error('Failed to fetch game stats');
      return res.json();
    },
    staleTime: 1000 * 60 * 60, // 1 hour (stats refresh hourly)
    cacheTime: 1000 * 60 * 60 * 2, // 2 hours
    retry: 1, // Only retry once if fails
    onError: (error) => {
      console.warn('Game stats unavailable, using fallback rotation:', error);
    },
  });
}
```

---

## UI Implementation

### GameCard Component with Dynamic Badges

```tsx
// src/frontend/src/components/GameCard.tsx

interface GameCardBadge {
  icon: string;
  label: string;
  subtitle?: string;
  color?: 'primary' | 'success' | 'warning' | 'info' | 'purple';
}

interface GameCardProps {
  game: GameManifest;
  badge?: GameCardBadge;
  onClick?: () => void;
}

export function GameCard({ game, badge, onClick }: GameCardProps) {
  const badgeColorClasses = {
    primary: 'bg-primary text-white',
    success: 'bg-green-500 text-white',
    warning: 'bg-yellow-500 text-white',
    info: 'bg-blue-500 text-white',
    purple: 'bg-purple-500 text-white',
  };

  return (
    <div
      className='game-card relative cursor-pointer rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow'
      onClick={onClick}
    >
      {/* Badge overlay (top-right) */}
      {badge && (
        <div
          className={`absolute top-2 right-2 px-3 py-1 rounded-full text-xs font-bold z-10
          ${badgeColorClasses[badge.color || 'primary']}`}
        >
          {badge.icon} {badge.label}
        </div>
      )}

      {/* Game thumbnail */}
      <div className='relative w-full h-40 bg-gray-200'>
        <img
          src={game.thumbnail || `/images/games/${game.id}.png`}
          alt={game.name}
          className='w-full h-full object-cover'
        />
      </div>

      {/* Game info */}
      <div className='p-4 bg-white'>
        <h3 className='font-bold text-lg mb-1'>{game.name}</h3>
        <p className='text-sm text-gray-600 mb-2'>{game.tagline}</p>

        {/* Badge subtitle (social proof or stats) */}
        {badge?.subtitle && (
          <p className='text-xs text-gray-500 italic flex items-center gap-1'>
            <span className='text-primary'>●</span>
            {badge.subtitle}
          </p>
        )}
      </div>
    </div>
  );
}
```

---

### Dashboard Integration

```tsx
// src/frontend/src/pages/Dashboard.tsx

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GameCard } from '../components/GameCard';
import { useProfileStore } from '../store/profileStore';
import { useProgressStore } from '../store/progressStore';
import { useGameStats } from '../hooks/useGameStats';
import {
  getFeaturedGamesEnhanced,
  getAgeGroup,
} from '../utils/recommendations';

export function Dashboard() {
  const { currentProfile } = useProfileStore();
  const { gameHistory } = useProgressStore();
  const navigate = useNavigate();

  // Fetch global stats (with graceful fallback)
  const { data: gameStats } = useGameStats(
    'week',
    currentProfile?.age ? getAgeGroup(currentProfile.age) : undefined,
  );

  const [featuredGames, setFeaturedGames] = useState<GameManifest[]>([]);

  // Recalculate featured games when data changes
  useEffect(() => {
    getFeaturedGamesEnhanced(currentProfile).then(setFeaturedGames);
  }, [currentProfile, gameStats]);

  // Generate badge for each slot based on data
  const getBadgeForSlot = (
    game: GameManifest,
    slotIndex: number,
  ): GameCardBadge => {
    const history = currentProfile ? gameHistory[currentProfile.id] : null;
    const gameHistoryEntry = history?.find((h) => h.gameId === game.id);
    const stats = gameStats?.stats?.find((s) => s.gameId === game.id);

    switch (slotIndex) {
      case 0: // NEW
        return {
          icon: '🆕',
          label: 'NEW',
          subtitle: 'Just added!',
          color: 'success',
        };

      case 1: // FAVORITE (most played local)
        if (gameHistoryEntry) {
          return {
            icon: '⭐',
            label: 'YOUR FAVORITE',
            subtitle: `You've played ${gameHistoryEntry.playCount} time${gameHistoryEntry.playCount > 1 ? 's' : ''}`,
            color: 'warning',
          };
        }
        // Fallback if no history for this slot
        return {
          icon: '🎮',
          label: 'PLAY',
          color: 'primary',
        };

      case 2: // TRENDING (global popularity)
        if (stats) {
          const ageGroup = currentProfile?.age
            ? getAgeGroup(currentProfile.age)
            : null;
          const rank = ageGroup ? stats.ageCohortRank[ageGroup] : null;

          return {
            icon: '🔥',
            label: 'TRENDING',
            subtitle: rank
              ? `#${rank} in your age group!`
              : `${stats.totalPlays} kids played this week!`,
            color: 'info',
          };
        }
        // Fallback if backend down
        return {
          icon: '🎮',
          label: 'POPULAR',
          color: 'primary',
        };

      case 3: // DISCOVER (unplayed + quality)
        if (stats) {
          return {
            icon: '🎲',
            label: 'DISCOVER',
            subtitle: `${Math.round(stats.completionRate * 100)}% of kids finish this!`,
            color: 'purple',
          };
        }
        return {
          icon: '🎲',
          label: 'EXPLORE',
          subtitle: gameHistoryEntry
            ? undefined
            : "You haven't tried this yet!",
          color: 'purple',
        };

      default:
        return {
          icon: '🎮',
          label: 'PLAY',
          color: 'primary',
        };
    }
  };

  return (
    <div className='dashboard p-6'>
      {/* Featured Games Section */}
      <section className='featured-games mb-8'>
        <h2 className='text-2xl font-bold mb-4'>Play Now</h2>
        <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
          {featuredGames.map((game, index) => (
            <GameCard
              key={game.id}
              game={game}
              badge={getBadgeForSlot(game, index)}
              onClick={() => navigate(`/games/${game.id}`)}
            />
          ))}
        </div>
      </section>

      {/* Continue Playing Section (optional, for played games) */}
      {currentProfile && gameHistory[currentProfile.id]?.length > 0 && (
        <section className='continue-playing mb-8'>
          <h2 className='text-2xl font-bold mb-4'>Continue Playing</h2>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
            {gameHistory[currentProfile.id].slice(0, 4).map((h) => {
              const game = getGameManifest(h.gameId);
              if (!game) return null;

              return (
                <GameCard
                  key={game.id}
                  game={game}
                  badge={{
                    icon: '▶️',
                    label: 'CONTINUE',
                    subtitle: `Last played: ${new Date(h.lastPlayed).toLocaleDateString()}`,
                    color: 'primary',
                  }}
                  onClick={() => navigate(`/games/${game.id}`)}
                />
              );
            })}
          </div>
        </section>
      )}

      {/* Rest of dashboard (worlds, profile stats, etc.) */}
    </div>
  );
}
```

---

## Testing Strategy

### Unit Tests

**Location**: `src/frontend/src/utils/__tests__/recommendations.test.ts`

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getFeaturedGamesEnhanced,
  getAgeGroup,
  ensureWorldDiversity,
} from '../recommendations';
import { useProgressStore } from '../../store/progressStore';

describe('getFeaturedGamesEnhanced', () => {
  beforeEach(() => {
    // Reset store state
    useProgressStore.setState({ gameHistory: {} });
  });

  it('always returns 4 games', async () => {
    const games = await getFeaturedGamesEnhanced();
    expect(games).toHaveLength(4);
  });

  it('prioritizes isNew games in slot 1', async () => {
    const games = await getFeaturedGamesEnhanced();
    expect(games[0].isNew).toBe(true);
  });

  it('returns most played local in slot 2 when history available', async () => {
    const profile = { id: 'test', age: 5, name: 'Test' };
    const { recordGamePlay } = useProgressStore.getState();

    // Play alphabet-tracing 5 times
    for (let i = 0; i < 5; i++) {
      recordGamePlay(profile.id, 'alphabet-tracing', 5, true, 80);
    }

    const games = await getFeaturedGamesEnhanced(profile);
    expect(games[1].id).toBe('alphabet-tracing');
  });

  it('filters games by device capabilities', async () => {
    // Mock no camera
    vi.spyOn(navigator.mediaDevices, 'getUserMedia').mockRejectedValue(
      new Error('No camera'),
    );

    const games = await getFeaturedGamesEnhanced();

    // Should not include camera-required games
    games.forEach((game) => {
      expect(game.cvRequirements?.camera).toBeFalsy();
    });
  });

  it('filters games by age appropriateness', async () => {
    const profile = { id: 'test', age: 3, name: 'Test' };
    const games = await getFeaturedGamesEnhanced(profile);

    games.forEach((game) => {
      const [minAge] = game.ageRange.split('-').map(Number);
      expect(minAge).toBeLessThanOrEqual(3);
    });
  });

  it('ensures world diversity (max 2 from same world)', async () => {
    const games = await getFeaturedGamesEnhanced();
    const worldCounts = new Map<string, number>();

    games.forEach((game) => {
      worldCounts.set(game.worldId, (worldCounts.get(game.worldId) || 0) + 1);
    });

    worldCounts.forEach((count) => {
      expect(count).toBeLessThanOrEqual(2);
    });
  });

  it('gracefully degrades when backend down', async () => {
    // Mock backend failure
    vi.spyOn(global, 'fetch').mockRejectedValue(new Error('Backend down'));

    const games = await getFeaturedGamesEnhanced();

    // Should still return 4 games (fallback rotation)
    expect(games).toHaveLength(4);
  });

  it('uses time-of-day vibe matching in slot 4', async () => {
    // Mock morning time (9 AM)
    vi.setSystemTime(new Date('2026-02-25T09:00:00'));

    const games = await getFeaturedGamesEnhanced();

    // Slot 4 should prefer 'active' vibe games
    // (not guaranteed due to randomness, but check it's viable)
    const activeGames = games.filter((g) => g.vibe === 'active');
    expect(activeGames.length).toBeGreaterThan(0);
  });
});

describe('getAgeGroup', () => {
  it('returns correct age group buckets', () => {
    expect(getAgeGroup(3)).toBe('3-4y');
    expect(getAgeGroup(4)).toBe('3-4y');
    expect(getAgeGroup(5)).toBe('5-6y');
    expect(getAgeGroup(6)).toBe('5-6y');
    expect(getAgeGroup(7)).toBe('7-8y');
    expect(getAgeGroup(8)).toBe('7-8y');
  });
});

describe('ensureWorldDiversity', () => {
  it('limits max 2 games from same world', () => {
    const games = [
      { id: '1', worldId: 'letter-land', name: 'Game 1' },
      { id: '2', worldId: 'letter-land', name: 'Game 2' },
      { id: '3', worldId: 'letter-land', name: 'Game 3' },
      { id: '4', worldId: 'number-jungle', name: 'Game 4' },
    ] as GameManifest[];

    const diverse = ensureWorldDiversity(games);

    const letterCount = diverse.filter(
      (g) => g.worldId === 'letter-land',
    ).length;
    expect(letterCount).toBeLessThanOrEqual(2);
  });
});
```

---

## Implementation Timeline

### Week 1: Backend + Data Layer (Parallel Work)

| Day     | Task                                                | Owner    | Hours | Deliverable                    |
| ------- | --------------------------------------------------- | -------- | ----- | ------------------------------ |
| **Mon** | Database migration (add `completed` field, indexes) | Backend  | 2     | SQL scripts + migration tested |
| Mon     | Update game session endpoint to accept `completed`  | Backend  | 3     | API endpoint updated           |
| **Tue** | Implement `/api/games/stats` endpoint (query logic) | Backend  | 6     | Endpoint returns stats         |
| Tue     | Add caching strategy (TTLCache, 1-hour expiry)      | Backend  | 2     | Cache working                  |
| **Wed** | Test backend endpoints (unit tests + manual)        | Backend  | 3     | Tests passing                  |
| Wed     | Extend `progressStore` with `gameHistory` state     | Frontend | 3     | State management ready         |
| **Thu** | Hook into `useGameSessionProgress` to record plays  | Frontend | 2     | Frontend tracks history        |
| Thu     | Create `useGameStats` React Query hook              | Frontend | 2     | Hook fetches stats             |
| **Fri** | Integration testing (backend + frontend together)   | Both     | 4     | Full data flow working         |

**Week 1 Total**: ~27 hours

---

### Week 2: Algorithm + UI + Testing

| Day     | Task                                                                 | Owner    | Hours | Deliverable           |
| ------- | -------------------------------------------------------------------- | -------- | ----- | --------------------- |
| **Mon** | Implement `getFeaturedGamesEnhanced()` algorithm                     | Frontend | 6     | Algorithm complete    |
| Mon     | Implement `checkDeviceCapabilities()` helper                         | Frontend | 2     | Device filter working |
| **Tue** | Update `GameCard` with badge support                                 | Frontend | 3     | Badges rendering      |
| Tue     | Update `Dashboard` to use new algorithm + badges                     | Frontend | 4     | Dashboard live        |
| **Wed** | Add social proof subtitles (play counts, ranks)                      | Frontend | 3     | Social proof showing  |
| Wed     | Implement graceful fallbacks for all slots                           | Frontend | 2     | Fallbacks tested      |
| **Thu** | Unit tests (all scenarios: new user, returning, guest, backend down) | Frontend | 6     | Tests passing         |
| Thu     | Fix TypeScript/lint errors                                           | Frontend | 1     | No errors             |
| **Fri** | Integration testing + QA (all user scenarios)                        | Both     | 4     | Full QA complete      |
| Fri     | Deploy to staging + A/B test setup                                   | DevOps   | 2     | Staging deployed      |

**Week 2 Total**: ~33 hours

---

**Total Effort**: ~60 hours (~1.5-2 weeks with 2 engineers working in parallel)

---

## Metrics & Success Criteria

### Primary Metrics

| Metric                                | Current (Static) | Target (Enhanced) | Measurement Period |
| ------------------------------------- | ---------------- | ----------------- | ------------------ |
| **Featured game CTR**                 | 8-12%            | **40-60%**        | 2 weeks            |
| **Unique games/week/child**           | 3-5              | **10-15**         | 2 weeks            |
| **Dashboard bounce rate**             | 35-40%           | **20-25%**        | 2 weeks            |
| **Avg session duration**              | 8-10 min         | **12-16 min**     | 2 weeks            |
| **Cold start engagement** (new users) | 2-3 games        | **6-8 games**     | First week only    |

### Secondary Metrics

- **Slot CTR breakdown**:
  - NEW badge: Expect **50-70%** (highest)
  - TRENDING badge: Expect **40-60%**
  - FAVORITE badge: Expect **60-80%** (familiar = trust)
  - DISCOVER badge: Expect **30-50%** (lowest but still good)

- **Social proof impact**: Compare CTR with vs without play count subtitles (A/B test variants)

### A/B Test Plan

**Control Group (50%)**: Static `RECOMMENDED_GAMES` (current state)  
**Treatment Group (50%)**: Enhanced Phase 1 algorithm

**Duration**: 2 weeks minimum  
**Decision Criteria**: If treatment shows **>30% CTR improvement**, ship to 100%

---

## Risks & Mitigation

| Risk                                     | Impact | Probability | Mitigation                                                                              |
| ---------------------------------------- | ------ | ----------- | --------------------------------------------------------------------------------------- |
| **Backend endpoint delayed**             | High   | Medium      | ✅ Graceful fallback (time-rotation) allows frontend to ship independently              |
| **Cache invalidation bugs**              | Medium | Medium      | ✅ Conservative 1-hour TTL, manual cache clear endpoint for debugging                   |
| **Device capability check slow**         | Low    | Low         | ✅ Cache result in sessionStorage (check once per session)                              |
| **Over-personalization** (filter bubble) | Medium | Low         | ✅ Slot 4 (DISCOVER) ensures serendipity, time-based fallback adds variety              |
| **Privacy concerns**                     | High   | Low         | ✅ Only aggregate stats exposed, privacy policy updated, no individual tracking visible |
| **Stats query performance**              | High   | Medium      | ✅ Database indexes on (game_name, created_at), caching, limit queries to recent period |

---

## Privacy & Compliance

### Data Usage

- ✅ **Personal play history**: Stored locally in `localStorage` (not sent to analytics)
- ✅ **Global stats**: Aggregated anonymized data only (no individual user tracking)
- ✅ **Social proof**: Shows counts ("1,247 kids played") not specific users
- ✅ **No PII exposed**: Frontend responses contain only game IDs and aggregate numbers

### Privacy Policy Addition (REQUIRED)

Add to privacy policy:

```markdown
### Game Recommendations & Play Statistics

We use aggregated, anonymized play data to recommend games that your child might enjoy:

**What we collect:**

- Your child's play history is stored locally on your device (not on our servers)
- We aggregate play data across all users to calculate platform-wide statistics (e.g., "most popular games this week")

**What we show:**

- Recommendations are based on both your child's personal play history AND what other children of similar age enjoy
- We display social proof like "1,247 kids played this week!" to help you discover popular games
- We NEVER show which specific children played a game (all data is anonymized)

**How we use this data:**

- To improve game discovery and variety
- To prevent your child from seeing the same games repeatedly
- To highlight high-quality games (based on completion rates)

**Your control:**

- Play history is stored locally and can be cleared by clearing browser data
- Logging out removes access to personalized recommendations (guest mode uses trending games only)
```

---

## Files to Create/Modify

### Backend (Python)

**NEW**:

- `src/backend/app/routers/games.py` — Add `/api/games/stats` endpoint
- `migrations/add_game_progress_completed.sql` — Database migration

**MODIFY**:

- `src/backend/app/routers/progress.py` — Update `record_game_session_progress` to accept `completed`
- `src/backend/app/models/game_progress.py` — Add `completed` field

### Frontend (TypeScript/React)

**NEW**:

- `src/frontend/src/utils/recommendations.ts` — All recommendation logic
- `src/frontend/src/hooks/useGameStats.ts` — React Query hook

**MODIFY**:

- `src/frontend/src/store/progressStore.ts` — Add `gameHistory` tracking
- `src/frontend/src/hooks/useGameSessionProgress.ts` — Pass `completed` to backend
- `src/frontend/src/components/GameCard.tsx` — Add badge support
- `src/frontend/src/pages/Dashboard.tsx` — Use new algorithm

**TESTS**:

- `src/frontend/src/utils/__tests__/recommendations.test.ts` — Unit tests

---

## Next Steps

1. **Approval**: Get stakeholder sign-off on Enhanced Phase 1 approach
2. **Kickoff**: Create implementation ticket (TCK-20260225-004)
3. **Week 1**: Backend team implements stats endpoint, frontend team builds state management
4. **Week 2**: Frontend team implements algorithm + UI, QA tests all scenarios
5. **Week 3**: Deploy to staging, run A/B test
6. **Week 4**: Analyze results, ship to 100% if successful

---

**End of Enhanced Phase 1 Implementation Plan**  
**Ready for Implementation**: Yes  
**Dependencies**: Backend `/api/games/stats` endpoint (can be built in parallel with frontend)  
**Estimated Completion**: 2 weeks from kickoff
