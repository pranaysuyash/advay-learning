# Game Architecture Principles

**Document ID:** ARCH-GAME-001  
**Status:** Active  
**Last Updated:** 2026-02-05

---

## Core Philosophy: No "Main Game"

### Principle: All Games Are Equal

**Decision:** There is no "main game" or "primary game" in the Advay Vision Learning platform.

**Rationale:**

- Children have diverse learning styles and interests
- Different games target different skills (motor, cognitive, recognition)
- No single activity should dominate the experience
- Prevents over-investment in one feature at expense of others

**Implementation:**

```typescript
// All games are peers in the games array
const availableGames: Game[] = [
  {
    id: 'alphabet-tracing',
    title: 'Draw Letters',
    // ... equals peer status
  },
  {
    id: 'finger-number-show',
    title: 'Finger Counting',
    // ... equals peer status
  },
  {
    id: 'connect-the-dots',
    title: 'Connect Dots',
    // ... equals peer status
  },
  // Future games added as peers
];
```

**What This Means:**

- ✅ No game gets preferential UI treatment
- ✅ All games use shared infrastructure (camera, hand tracking, progress)
- ✅ Dashboard shows all games equally
- ✅ Progress tracked per-game, not "main game + others"
- ✅ Marketing describes "a library of games" not "a game with extras"

**What This Prevents:**

- ❌ "Alphabet Game" being treated as the product
- ❌ Other games feeling like "side features"
- ❌ Technical debt from game-specific hacks
- ❌ User confusion about what the app "is"

---

## Core Philosophy: Shared Infrastructure

### Principle: Centralize Common Capabilities

**Decision:** All games share centralized infrastructure components rather than implementing their own.

**Rationale:**

- Consistent user experience across games
- Reduced code duplication
- Easier maintenance and updates
- Unified progress tracking
- Simpler onboarding (learn once, use everywhere)

---

## Centralized Components

### 1. Hand Tracking Service

**File:** `src/frontend/src/hooks/useHandTracking.ts` (proposed)  
**Current State:** Each game implements hand tracking independently (being unified)

**Responsibilities:**

- Initialize MediaPipe Hands
- Process video stream
- Normalize landmark data
- Emit standardized hand events
- Handle camera permissions
- Provide fallback states

**Interface:**

```typescript
interface HandTrackingService {
  // Initialization
  initialize(): Promise<void>;
  start(): void;
  stop(): void;
  
  // Data
  getCurrentHand(): HandData | null;
  onHandMove(callback: (hand: HandData) => void): void;
  onPinch(callback: (pinch: PinchData) => void): void;
  
  // State
  isInitialized: boolean;
  isTracking: boolean;
  hasPermission: boolean;
  error: Error | null;
}
```

**Games Consume, Don't Implement:**

```typescript
// CORRECT: Game uses centralized service
function AlphabetGame() {
  const { hand, isTracking } = useHandTracking();
  // Use hand data, don't implement tracking
}

// INCORRECT: Game implements its own tracking
function AlphabetGame() {
  const [hands, setHands] = useState([]); // Don't do this
  useEffect(() => {
    // Don't implement MediaPipe here
  }, []);
}
```

**Migration Status:**

- See ticket `TCK-20260203-050` - Adopt centralized `getHandLandmarkLists()` utility
- Games being updated: LetterHunt, ConnectTheDots, AlphabetGamePage, MediaPipeTest

---

### 2. Progress Tracking Service

**File:** `src/frontend/src/services/progressService.ts`  
**Current State:** Partially centralized, needs hardening

**Responsibilities:**

- Track session progress
- Sync with backend API
- Cache for offline usage
- Aggregate stats for Dashboard

**Interface:**

```typescript
interface ProgressService {
  // Session
  startSession(gameId: string): Session;
  endSession(session: Session): Promise<void>;
  
  // Events
  recordEvent(event: GameEvent): void;
  
  // Stats
  getStats(gameId?: string): ProgressStats;
  getOverallStats(): OverallStats;
}
```

**Open Issues:**

- See ticket `TCK-20260203-049` - Progress not updating immediately after game

---

### 3. Camera Management

**File:** `src/frontend/src/components/CameraProvider.tsx` (proposed)  
**Current State:** Each game handles camera independently

**Responsibilities:**

- Single camera permission request
- Shared video stream
- Permission state management
- Fallback to non-camera mode

---

### 4. Tutorial System

**File:** `src/frontend/src/components/GameTutorial.tsx`  
**Current State:** Centralized but needs polish

**Responsibilities:**

- Camera permission flow
- Hand tracking tutorial
- Touch/mouse fallback explanation
- Skip options

---

### 5. Game Shell/Container

**File:** `src/frontend/src/components/GameContainer.tsx` (proposed)  
**Current State:** Games implement their own layout

**Responsibilities:**

- Consistent game layout
- Header with back button
- Pip (mascot) integration
- Progress indicator
- Settings access
- Pause/resume

---

## Game Development Guidelines

### When Adding a New Game

1. **Use Centralized Services**

   ```typescript
   import { useHandTracking } from '../hooks/useHandTracking';
   import { useProgress } from '../hooks/useProgress';
   import { GameContainer } from '../components/GameContainer';
   ```

2. **Implement Game Interface**

   ```typescript
   interface Game {
     id: string;
     setup(): void;
     start(): void;
     pause(): void;
     resume(): void;
     end(): ProgressData;
   }
   ```

3. **Don't Implement:**
   - ❌ Own hand tracking
   - ❌ Own camera handling
   - ❌ Own progress persistence
   - ❌ Own tutorial flow

4. **Do Implement:**
   - ✅ Game logic
   - ✅ Visual rendering
   - ✅ Interaction handling (using centralized input)
   - ✅ Game-specific state

---

## Architecture Decision Records

### ADR-001: No Main Game

- **Date:** 2026-02-05
- **Decision:** All games are equal peers, no hierarchy
- **Context:** Product owner clarified vision is "library of games" not "one game"
- **Consequences:** Equal UI treatment, shared infrastructure, distributed investment

### ADR-002: Centralized Hand Tracking

- **Date:** 2026-02-05
- **Decision:** Single hand tracking service used by all games
- **Context:** Multiple implementations causing inconsistency and bugs
- **Consequences:** Consistent experience, easier updates, single point of optimization

---

## Related Documents

- `docs/ui/CONCEPT_spatial_gesture_ui.md` - Future UI vision (not current architecture)
- `docs/COMPLETE_GAME_ACTIVITIES_CATALOG.md` - Game ideas (future)
- `docs/INPUT_METHODS_SPECIFICATION.md` - Input handling
- `docs/architecture/CAMERA_INTEGRATION_GUIDE.md` - Camera details

---

## Tickets

- `TCK-20260203-050` - Centralize hand tracking utility
- `TCK-20260203-049` - Fix progress update reliability
