# Game UI Component Refactor — Design Specification

**Version:** 1.0
**Created:** 2026-03-14
**Status:** DESIGN — Pending Approval
**Target audience:** Kids ages 2–5, parents

---

## Problem Statement

The app has 60+ game pages with **massive UI inconsistency**:

| Issue | Scope | Impact |
|-------|-------|--------|
| 7 games build custom inline headers | SimonSays, YogaAnimals, VirtualChemistryLab, AirCanvas, FreezeDance, DiscoveryLab, LetterHunt | Navigation looks different per game |
| Duplicate score display | GameContainer header + GameHUD overlay showing score simultaneously | Cluttered, confusing |
| No shared completion screen | Each game builds its own game-over/results UI | Inconsistent celebration experience |
| No shared pre-game menu | Each game builds its own start/difficulty screen | Different patterns per game |
| Overlay stacking | Feedback bar + HUD + tutorial + menu + particles + floating text all visible at once | Visual overload for kids |
| Inconsistent feedback | Floating text, toasts, bars, particles, screen shake mixed per game | Noisy, not calming |
| Border radius chaos | `rounded-xl`, `rounded-2xl`, `rounded-[1.5rem]`, `rounded-[2rem]`, `rounded-[2.5rem]`, `rounded-[3rem]` | No visual system |

---

## Design Principles

### For Kids (2–5 years)

1. **One focal point at a time** — child sees one clear thing to do
2. **Minimal chrome during play** — game scene is the star, not UI elements
3. **Large touch targets** — 60px minimum everywhere interactive
4. **Calm, not chaotic** — subtle feedback, no screen shake, limited particles
5. **Consistent navigation** — exit always in same place, always goes to `/games`

### For Parents

6. **Clean, modern aesthetic** — feels like a premium product
7. **Predictable patterns** — every game works the same way
8. **Accessible** — WCAG AA, reduced-motion, keyboard-navigable

### Technical

9. **Composition over configuration** — slot-based, not giant prop objects
10. **Phase-based rendering** — intro → playing → paused → complete (no overlay collisions)
11. **Progressive migration** — old games keep working while new components roll out

---

## Architecture: 4-Layer Model

```
┌─────────────────────────────────────────────┐
│  GameShell (infra)                          │
│  subscription · error boundary · wellness   │
│  analytics · document title · reduced-motion│
│                                             │
│  ┌─────────────────────────────────────────┐│
│  │  GameScaffold (layout + phases)         ││
│  │                                         ││
│  │  ┌───────────────────────────────────┐  ││
│  │  │  GameTopBar (persistent chrome)   │  ││
│  │  │  Exit · Title · 1–2 stats · progress│ ││
│  │  └───────────────────────────────────┘  ││
│  │                                         ││
│  │  ┌───────────────────────────────────┐  ││
│  │  │  GameStage (play area)            │  ││
│  │  │  ┌───────────────────────────┐    │  ││
│  │  │  │  <GameScene /> (per-game) │    │  ││
│  │  │  └───────────────────────────┘    │  ││
│  │  │  GameFeedback (single channel)    │  ││
│  │  │  GameActionDock (2–3 buttons)     │  ││
│  │  └───────────────────────────────────┘  ││
│  │                                         ││
│  │  Phase overlays (only 1 visible):       ││
│  │  · PreGameMenu   (phase = 'intro')      ││
│  │  · PauseMenu     (phase = 'paused')     ││
│  │  · GameResultScreen (phase = 'complete') ││
│  └─────────────────────────────────────────┘│
└─────────────────────────────────────────────┘
```

---

## New Components

### 1. `GameScaffold` — The Unified Middle Layer

**Replaces:** `GameContainer` + custom inline headers + ad-hoc overlay stacking

**Key rule:** Only **one** phase overlay is visible at a time. The scaffold manages z-index and focus.

```tsx
type GamePhase = 'intro' | 'playing' | 'paused' | 'complete' | 'gameOver';

interface GameScaffoldProps {
  /** Current game phase — controls which overlay is visible */
  phase: GamePhase;

  /** Persistent top bar config (always visible) */
  topBar: GameTopBarProps;

  /** Decorative background layer */
  background?: React.ReactNode;

  /** Auxiliary overlay (camera thumbnail, etc.) */
  auxiliary?: React.ReactNode;

  /** Action buttons during play (max 3) */
  controls?: GameAction[];

  /** Single feedback message (replaces floating text, toasts, etc.) */
  feedback?: string | null;
  feedbackVariant?: 'neutral' | 'success' | 'error' | 'encouragement';

  /** Phase-specific screens (rendered as overlays) */
  intro?: React.ReactNode;    // Shown when phase = 'intro'
  paused?: React.ReactNode;   // Shown when phase = 'paused'
  result?: React.ReactNode;   // Shown when phase = 'complete' | 'gameOver'

  /** The actual game scene */
  children: React.ReactNode;

  /** Optional class for the stage area */
  className?: string;
}
```

**Layout structure:**
```
┌──────────────────────────────────────┐
│  GameTopBar (h-16, sticky, z-40)     │
├──────────────────────────────────────┤
│                                      │
│  GameStage (flex-1, relative)        │
│  ┌──────────────────────────────┐    │
│  │  background (absolute, z-0)  │    │
│  │  children (relative, z-10)   │    │
│  │  auxiliary (absolute, z-20)  │    │
│  │  feedback (absolute, z-30)   │    │
│  │  actionDock (absolute, z-30) │    │
│  └──────────────────────────────┘    │
│                                      │
│  Phase overlay (absolute, z-50)      │
│  (intro | paused | result)           │
└──────────────────────────────────────┘
```

**Rules enforced:**
- During `playing`: no overlay visible, game scene gets full attention
- During `intro`/`paused`/`complete`/`gameOver`: overlay blocks game scene
- Only one feedback element visible at a time (the `feedback` prop)
- No duplicate score — `GameTopBar` is the single source
- `prefers-reduced-motion` disables all overlay animations

---

### 2. `GameTopBar` — The Only Persistent Header

**Replaces:** `GameContainer` header + `GameHeader` + all custom inline `<header>` elements + `GameHUD` score/level display

```tsx
interface GameTopBarProps {
  /** Game title */
  title: string;

  /** Exit handler (always navigates to /games) */
  onExit: () => void;

  /** Primary stat (score, timer, etc.) — max 1 */
  primaryStat?: {
    icon: IconName;
    value: React.ReactNode;
    label?: string;         // sr-only accessible label
  };

  /** Secondary stat (level, round, etc.) — max 1 */
  secondaryStat?: {
    icon: IconName;
    value: React.ReactNode;
    label?: string;
  };

  /** Progress bar (0–100) — shown below the bar */
  progress?: {
    value: number;          // 0–100
    label?: string;         // sr-only "Round 3 of 10"
  };

  /** Pause button */
  onPause?: () => void;
}
```

**Visual design:**
```
┌──────────────────────────────────────────────────────┐
│  [← Exit Game]     Game Title          ⭐ 42   Lv 3  │
│  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░░░░░░░░░ (optional bar) │
└──────────────────────────────────────────────────────┘
```

**Design rules:**
- Height: `h-16` (64px) — consistent, touch-friendly
- Exit button: left side, always visible, `aria-label="Exit game"`
- Title: center, `text-h2 font-black text-advay-slate`
- Stats: right side, max 2, using `GameStatChip` subcomponent
- Progress: below the bar, `h-2` thin bar, subtle
- Background: `bg-white border-b-3 border-brand-accent shadow-soft`
- No hearts, no streak counters, no per-game custom icons in the bar
- Standardized border-radius: `rounded-2xl` for chips (matching token `radii.xl = 1.5rem`)

---

### 3. `PreGameMenu` — Shared Start Screen

**Replaces:** All per-game custom menu screens (ShapePop's 90-line menu, SimonSays pre-game, etc.)

```tsx
interface PreGameMenuProps {
  /** Game title */
  title: string;

  /** One-line description */
  description: string;

  /** Game illustration/icon (centered, max 96px) */
  illustration?: React.ReactNode;

  /** Difficulty/mode options (max 3) */
  options?: Array<{
    id: string;
    label: string;
    description?: string;
    icon?: React.ReactNode;
  }>;

  /** Called with selected option id (or undefined if no options) */
  onStart: (optionId?: string) => void;

  /** Optional "How to Play" content (collapsed by default) */
  howToPlay?: React.ReactNode;

  /** Optional: show tutorial replay button */
  onReplayTutorial?: () => void;
}
```

**Visual design:**
```
┌──────────────────────────────────────┐
│                                      │
│            [illustration]            │
│                                      │
│          Game Title                   │
│     One-line description             │
│                                      │
│   ┌──────┐ ┌──────┐ ┌──────┐        │
│   │ Easy │ │Medium│ │ Hard │        │
│   └──────┘ └──────┘ └──────┘        │
│                                      │
│        [ ▶ Start Playing ]           │
│                                      │
│        (?) How to Play               │
│                                      │
└──────────────────────────────────────┘
```

**Rules:**
- Max 500px wide, centered
- `GamePanel` card: `bg-white rounded-2xl border-3 border-brand-accent shadow-soft`
- Start button: `Button` variant="primary" size="lg" fullWidth
- Options: `GameOptionCard` with selected state highlight
- If no options, just show Start button directly
- Consistent spacing using design tokens

---

### 4. `GameResultScreen` — Shared Completion Screen

**Replaces:** All per-game custom completion UIs (SimpleAddition's score breakdown, MazeRunner's results, etc.)

```tsx
type ResultVariant = 'complete' | 'gameOver' | 'timeUp';

interface GameResultScreenProps {
  /** Which type of ending */
  variant: ResultVariant;

  /** Headline ("Great Job!" / "Time's Up!" / "Game Over") */
  title?: string;

  /** Supporting message */
  message?: string;

  /** Stats to show (max 3) */
  stats?: Array<{
    label: string;
    value: string | number;
    icon?: IconName;
  }>;

  /** Star rating (0–3) — optional */
  stars?: number;

  /** Primary action */
  primaryAction: {
    label: string;            // "Play Again" / "Next Level"
    onClick: () => void;
  };

  /** Secondary action */
  secondaryAction?: {
    label: string;            // "Exit Game"
    onClick: () => void;
  };
}
```

**Visual design:**
```
┌──────────────────────────────────────┐
│                                      │
│             🎉 / 🏆 / ⏰             │
│                                      │
│          Great Job!                  │
│    You're a superstar!               │
│                                      │
│         ⭐ ⭐ ⭐                      │
│                                      │
│    Score: 42    Level: 3             │
│                                      │
│      [ ▶ Play Again ]               │
│        Exit Game                     │
│                                      │
└──────────────────────────────────────┘
```

**Rules:**
- Centered modal card (max 420px)
- One celebration effect max (confetti or emoji, not both)
- Stats shown as `GameStatChip` row — max 3, no complex breakdowns
- Primary action: `Button` variant="primary" size="lg" fullWidth
- Secondary action: `Button` variant="ghost" size="md"
- `prefers-reduced-motion`: no confetti, just the card
- No background game UI visible behind (backdrop blur)

---

### 5. `PauseMenu` — Shared Pause Overlay

**Replaces:** Per-game pause screens

```tsx
interface PauseMenuProps {
  onResume: () => void;
  onRestart: () => void;
  onExit: () => void;
  /** Optional settings content */
  settings?: React.ReactNode;
}
```

**Visual design:**
```
┌──────────────────────────────────────┐
│              Paused                  │
│                                      │
│       [ ▶ Resume ]                   │
│       [ ↻ Restart ]                  │
│       [ ✕ Exit Game ]               │
│                                      │
│       [settings slot]                │
└──────────────────────────────────────┘
```

**Rules:**
- Uses existing `Modal` component for focus trap + backdrop
- `role="dialog"` + `aria-modal="true"` + `aria-label="Game Paused"`
- Initial focus on Resume button
- Escape key resumes game
- `overscroll-behavior: contain`

---

### 6. `GameFeedback` — Single Feedback Channel

**Replaces:** Floating text, score popups, particles, screen shake, inline feedback bars, toast-like elements

```tsx
interface GameFeedbackProps {
  /** The message to show */
  message: string | null;

  /** Visual variant */
  variant?: 'neutral' | 'success' | 'error' | 'encouragement';

  /** Auto-dismiss after ms (default: 2000) */
  duration?: number;

  /** Optional icon override */
  icon?: React.ReactNode;
}
```

**Visual design:**
- Positioned: `absolute top-20 left-1/2 -translate-x-1/2 z-30`
- Style: `bg-white/95 backdrop-blur-sm rounded-2xl border-3 border-brand-accent shadow-soft`
- Width: `min-w-[200px] max-w-[400px]`
- Typography: `text-h3 font-black text-advay-slate text-center`
- Variant colors for the border/icon only (keep message text dark)
- Enter: `opacity 0→1, translateY -8→0` over 200ms
- Exit: `opacity 1→0` over 150ms
- `prefers-reduced-motion`: instant show/hide, no translate

**Replaces these anti-patterns:**
- ❌ `floatingTexts.map(...)` with random positioned "+10" divs
- ❌ `screenShake > 0 ? translate(random, random)` on game container
- ❌ Multiple simultaneous particle effect systems
- ❌ Separate feedback bars per game with different styles

---

### 7. `GameActionDock` — Utility Controls

**Replaces:** `GameControls` (which is largely fine but needs constraint)

```tsx
interface GameAction {
  id: string;
  icon: IconName;
  label: string;              // sr-only and visible on sm+ screens
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
}

interface GameActionDockProps {
  /** Max 3 actions */
  actions: GameAction[];
  position?: 'bottom-right' | 'bottom-center';
}
```

**Rules:**
- Max 3 buttons
- Uses existing `Button` component (not custom button styles)
- 60px min touch target (bump from current 56px)
- No gameplay info here (no score, no streak, no timer)
- Only utility actions: pause, restart, audio toggle, hint

---

### 8. Small Primitives

#### `GameStatChip`

Replaces: inline score/level/streak/timer badges scattered across 20+ game pages.

```tsx
interface GameStatChipProps {
  icon: IconName;
  value: React.ReactNode;
  label?: string;             // accessible label
  variant?: 'default' | 'warning' | 'danger';  // for timer urgency
}
```

**Visual:** `bg-white border-2 border-brand-accent rounded-2xl px-4 py-2 shadow-soft`

#### `GamePanel`

Replaces: inconsistent card containers across menus/settings.

```tsx
interface GamePanelProps {
  children: React.ReactNode;
  className?: string;
}
```

**Visual:** `bg-white rounded-2xl border-3 border-brand-accent shadow-soft p-6 sm:p-8`

#### `GameProgressBar`

Replaces: various inline progress bar implementations.

```tsx
interface GameProgressBarProps {
  value: number;              // 0–100
  label?: string;             // sr-only
  variant?: 'default' | 'success';
}
```

---

## Deprecation Map

| Current Component | Status | Replacement |
|---|---|---|
| `GameContainer` | **Deprecate** → thin wrapper over `GameScaffold` | `GameScaffold` |
| `GameHeader` | **Remove** | `GameTopBar` |
| `GameHUD` | **Remove** | `GameStatChip` + `GameProgressBar` in `GameTopBar` |
| `GameControls` | **Replace** | `GameActionDock` (built on `Button`) |
| `CelebrationOverlay` | **Simplify** | fold into `GameResultScreen` |
| `ExitConfirmationModal` | **Keep** | Already well-designed |
| `GamePage` | **Keep (adapter)** | Wraps `GameScaffold` for backward compat |
| `GameShell` | **Keep** | No changes needed |
| `GameBackground` | **Keep** | Passes into `GameScaffold` background slot |
| `CameraThumbnail` | **Keep** | Passes into `GameScaffold` auxiliary slot |

---

## Visual Consistency Rules

### Border Radius Standard

| Use | Token | Class |
|---|---|---|
| Buttons, chips, inputs | `radii.xl` | `rounded-2xl` (1.5rem) |
| Cards, panels, modals | `radii.xl` | `rounded-2xl` (1.5rem) |
| Progress bars | `radii.full` | `rounded-full` |

**Eliminate:** `rounded-[2rem]`, `rounded-[2.5rem]`, `rounded-[3rem]` — all become `rounded-2xl`.

### Border Standard

- Cards/panels: `border-3 border-brand-accent`
- Chips/badges: `border-2 border-brand-accent`
- Buttons: use `Button` component (has its own `border-3 border-black`)

### Shadow Standard

- Cards/panels: `shadow-soft` (from tailwind config: `0 2px 8px rgba(61, 64, 91, 0.08)`)
- Elevated: `shadow-soft-lg`
- **Eliminate:** `shadow-[0_4px_0_#E5B86E]` from non-button elements (that's the button "3D press" effect)

### Typography Standard

| Element | Class |
|---|---|
| Game title in TopBar | `text-h2 font-black text-advay-slate tracking-tight` |
| Menu/result headings | `text-h1 font-black text-advay-slate` |
| Body text | `text-body font-bold text-text-secondary` |
| Stat values | `text-h3 font-black` |
| Stat labels | `text-small font-bold text-text-muted uppercase tracking-wider` |

### Animation Budget (Per Screen)

| Phase | Max Simultaneous Animations |
|---|---|
| Intro | 1 (entrance of menu card) |
| Playing | 1 (feedback message in/out) |
| Complete | 2 (result card entrance + optional confetti) |

**Never:** screen shake, persistent bouncing, multiple particle systems, floating score text

### Color Usage

| Semantic | Color | Use |
|---|---|---|
| Primary action | `pip-orange` (#E85D04) | Start, Play Again buttons |
| Navigation | `advay-slate` (#2D3748) | Exit, Back buttons |
| Success feedback | `success` (#81B29A) | Correct answer indicator |
| Error feedback | `error` (#E07A5F) | Wrong answer indicator |
| Score/reward | `amber-500` (#F59E0B) | Star icons, score values |
| Info/links | `vision-blue` (#3B82F6) | Help, tutorial links |

---

## Accessibility Checklist (Per Component)

- [ ] 60px min touch targets on all interactive elements
- [ ] `aria-label` on all icon-only buttons
- [ ] `aria-live="polite"` on `GameFeedback` and score updates
- [ ] Focus trap in `PauseMenu` and `GameResultScreen` overlays
- [ ] `role="dialog"` + `aria-modal="true"` on all overlays
- [ ] `prefers-reduced-motion`: no bounce, no particles, fade only
- [ ] Visible `focus-visible` ring on all interactive elements
- [ ] No `outline-none` without a visible focus replacement
- [ ] `touch-action: manipulation` on game play area
- [ ] Color is never the only indicator of state

---

## Migration Strategy

### Phase 1: Build Foundation (~1–2 days)

Create all new components in `src/frontend/src/components/game/`:

```
components/game/
├── GameScaffold.tsx          # New: phase-based layout
├── GameTopBar.tsx            # New: unified header
├── GameStage.tsx             # New: play area wrapper
├── GameFeedback.tsx          # New: single feedback channel
├── GameActionDock.tsx        # New: constrained controls
├── PreGameMenu.tsx           # New: shared start screen
├── PauseMenu.tsx             # New: shared pause overlay
├── GameResultScreen.tsx      # New: shared completion screen
├── GameStatChip.tsx          # New: stat badge primitive
├── GamePanel.tsx             # New: card primitive
├── GameProgressBar.tsx       # New: progress bar primitive
├── GameBackground.tsx        # Keep: existing
├── GameCursor.tsx            # Keep: existing
├── GameHUD.tsx               # Deprecate: mark as legacy
└── CameraThumbnail.tsx       # Keep: existing
```

Build a **visual test page** at `/style-test` or `/component-showcase` showing all phases.

### Phase 2: Compatibility Wrappers (~0.5 day)

- Make `GameContainer` a thin wrapper delegating to `GameScaffold` (phase="playing")
- Mark `GameHUD` and `GameHeader` as deprecated with console warnings
- `GamePage` keeps working unchanged

### Phase 3: Migrate Custom-Header Games First (~1 day)

Priority targets (games with custom inline headers):
1. SimonSays
2. YogaAnimals
3. VirtualChemistryLab
4. AirCanvas
5. FreezeDance
6. DiscoveryLab
7. LetterHunt

Also: remove duplicate GameHUD from games already using GameContainer.

### Phase 4: Standardize Start/End Flows (~1–2 days)

- Convert all custom pre-game menus to `PreGameMenu`
- Convert all custom completion screens to `GameResultScreen`
- This is the biggest visible consistency win

### Phase 5: Simplify In-Play Chrome (Incremental)

Per game:
- Remove persistent streak hearts (use transient `GameFeedback` instead)
- Replace particles/floating text with `GameFeedback`
- Reduce `GameActionDock` to ≤3 buttons
- Use `GameTopBar` progress instead of separate progress bars

### Phase 6: Cleanup (~0.5 day)

- Remove `GameHeader` component entirely
- Remove `GameHUD` component entirely
- Alias `GameContainer` → `GameScaffold` or remove
- Document the "New Game Contract" for future games

---

## New Game Contract (Post-Migration)

Every new game **must**:

```tsx
<GameShell gameId="my-game" gameName="My Game">
  <GameScaffold
    phase={phase}
    topBar={{
      title: 'My Game',
      onExit: () => navigate('/games'),
      primaryStat: { icon: 'star', value: score },
    }}
    intro={<PreGameMenu title="My Game" description="..." onStart={start} />}
    result={<GameResultScreen variant="complete" primaryAction={{...}} />}
    feedback={feedbackMsg}
  >
    <MyGameScene />
  </GameScaffold>
</GameShell>
```

Every new game **must not**:
- Build a custom `<header>` element
- Show score in more than one place
- Use floating text, screen shake, or multiple particle systems
- Create custom completion/start screen UI
- Use non-token border-radius or shadow values

---

## File Locations

All new components go in: `src/frontend/src/components/game/`

```
src/frontend/src/components/game/
├── GameScaffold.tsx
├── GameTopBar.tsx
├── GameStage.tsx
├── GameFeedback.tsx
├── GameActionDock.tsx
├── PreGameMenu.tsx
├── PauseMenu.tsx
├── GameResultScreen.tsx
├── GameStatChip.tsx
├── GamePanel.tsx
├── GameProgressBar.tsx
├── index.ts                  # Barrel export
├── GameBackground.tsx        # Existing
├── GameCursor.tsx            # Existing
├── GameHUD.tsx               # Existing (deprecated)
├── CameraThumbnail.tsx       # Existing
└── VoiceInstructions.tsx     # Existing
```

---

## Success Metrics

| Metric | Before | Target |
|---|---|---|
| Custom header implementations | 7 | 0 |
| Unique completion screen styles | 15+ | 1 (`GameResultScreen`) |
| Unique pre-game menu styles | 20+ | 1 (`PreGameMenu`) |
| Duplicate score displays | ~15 games | 0 |
| Max simultaneous visual layers during play | 4–6 | 2 (game + feedback) |
| Border radius values in use | 6+ | 2 (`rounded-2xl`, `rounded-full`) |
| Min touch target size | 56px | 60px |
