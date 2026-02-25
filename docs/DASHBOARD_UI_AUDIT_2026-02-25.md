# Dashboard UI Audit Report

**Date**: 2026-02-25  
**Auditor**: GitHub Copilot  
**Protocol**: Repo-Aware UI Auditor v1.0  
**Ticket**: TCK-20260225-002  
**Base Commit**: main@daecf6c18b31f964c879e7136d618ce710fa69dc

---

## Executive Summary

The Dashboard is the primary authenticated landing page but **does not align with Smart Recess positioning**. Critical missing element: **engagement proof** (time played, activity logs, weekly summaries) that parents/teachers need to trust the app as a learning tool rather than pure entertainment.

**Severity Breakdown**:

- **1 HIGH**: Missing engagement summary (blocks Smart Recess value proposition)
- **3 MEDIUM**: False affordance, missing i18n, unclear mobile actions
- **1 LOW**: Static featured games (personalization opportunity)

**Strategic Context**: Recent persona research (Priya - engagement-focused parent, Ms. Deepa - teacher) validates that **engagement proof > grades** for early childhood. Dashboard currently shows only star currency and game grid—no activity evidence.

---

## Technical Context

### Stack (Observed)

- React 19 + Vite 7
- React Router 6 (lazy-loaded routes)
- TailwindCSS 3 (responsive utilities)
- Zustand (auth, profiles, progress, settings stores)
- React Query (@tanstack/react-query)
- i18next (15 languages configured)
- Framer Motion (animations)

### File Locations

- **Target**: `src/frontend/src/pages/Dashboard.tsx`
- **Router**: `src/frontend/src/App.tsx` (Dashboard lazy-loaded line 35-36, routed /dashboard line 270-274)
- **Layout**: `src/frontend/src/components/ui/Layout.tsx` (wraps authenticated pages)

### Route Surface (Observed)

39 total routes identified:

- **7 main app routes**: /, /dashboard, /games, /progress, /settings, /inventory, /discovery-lab
- **32 game routes**: /games/\* (alphabet-tracing, finger-number-show, connect-the-dots, etc.)

All authenticated routes wrapped in `<ProtectedRoute>` + `<Layout>`, confirming split-shell UX pattern.

---

## Phase A: Cross-Cutting Findings

### Finding A1: Large Route Surface Area

**ID**: `ui-route-surface`  
**Severity**: MEDIUM  
**Evidence**: `Observed` - 39 routes in App.tsx, 32 under /games/\* namespace

**Analysis**: Many game screens are routed via ProtectedRoute. Dashboard serves as the primary entry point post-login, making it the critical hub for navigation and engagement evidence.

**Impact**: Dashboard design choices cascade to user perception of entire app purpose (learning tool vs. game collection).

---

### Finding A2: Layout Wrapping Pattern

**ID**: `layout-wrapping`  
**Severity**: LOW  
**Evidence**: `Observed` - Most non-auth screens wrapped in Layout; auth screens (login/signup) are not

**Analysis**: Consistent pattern indicates intentional split-shell UX. Layout likely provides global nav, settings access, and mobile menu.

**Impact**: Dashboard should not duplicate Layout actions unless intentionally providing quick access to frequently-used features.

---

## Phase B: Dashboard Deep Dive

### Target File: `src/frontend/src/pages/Dashboard.tsx`

#### Observed Structure

**Components Used**:

- `Mascot` - Character/guide element
- `UIIcon` - Icon system
- `GameCard` - Featured game display
- `DemoInterface` - Camera capability fallback
- `AdventureMap` - Progression visualization
- `AddChildModal` - Profile creation flow

**State Management**:

```typescript
// Local state
const [exporting, setExporting] = useState(false);
const [showAddModal, setShowAddModal] = useState(false);
const [childName, setChildName] = useState('');
const [childAge, setChildAge] = useState(5);
const [childLanguage, setChildLanguage] = useState('en');
const [isSubmitting, setIsSubmitting] = useState(false);

// Zustand stores
const { isGuest } = useAuthStore();
const {
  profiles,
  currentProfile,
  defaultProfile,
  fetchProfiles,
  setCurrentProfile,
} = useProfileStore();
const { totalStars } = useProgressStore();
const { demoMode, hasBasicCameraSupport } = useSettingsStore();
```

**Effects**:

1. Fetch profiles on mount if not guest
2. Set current profile when defaultProfile available

**Render Paths**:

1. **Guest vs Logged-in**: Profile selector hidden for guest users
2. **Demo Mode**: Shows `DemoInterface` when `demoMode + !hasBasicCameraSupport`
3. **Featured Games Grid**: Displays 4 hard-coded recommended games
4. **Adventure Map**: Progression visualization section

**Featured Games Constant** (Hard-coded):

```typescript
const RECOMMENDED_GAMES = [
  {
    id: 'alphabet-tracing',
    title: 'Alphabet Tracing',
    description: 'Trace letters with your finger',
    icon: 'alphabet',
    category: 'literacy',
  },
  // ... 3 more games
];
```

---

## Critical Issues

### Issue #1: Missing Engagement Summary (HIGH) 🚨

**ID**: `dashboard-missing-engagement-summary`  
**Severity**: HIGH  
**Confidence**: MEDIUM  
**Evidence**: `Observed` - No activity log, summary section, or time-played metrics rendered in Dashboard.tsx

**Problem Analysis**:
Dashboard currently shows:

- ✅ Star currency badge (top right)
- ✅ Profile selector (for multi-child accounts)
- ✅ Featured games grid (4 games)
- ✅ Adventure map
- ❌ **Activity summary** (time played, games explored, sessions)
- ❌ **Weekly engagement proof** (what Smart Recess requires)
- ❌ **Last session recap** (entry point for parent check-ins)

**Strategic Impact**:
Persona research shows:

- **Priya** (engagement-focused parent): "I want to see WHAT my child did, not just a score"
- **Ms. Deepa** (teacher): "Weekly activity logs are more useful than grades for preschool"

Dashboard **fails to provide engagement proof** that positions app as learning tool vs. pure entertainment.

**User Journey Breakdown**:

```
Parent opens app after child plays
  ↓
Sees: Star count (gamified currency) + Featured games
  ↓
Missing: Time played today, games explored, activity streak
  ↓
Result: No evidence to share with teacher or justify screen time
```

**Fix Options**:

**Option 1** (Recommended): Add "This Week" Activity Summary Card

```typescript
// Above Featured Games section
<ActivitySummaryCard>
  <h2>This Week's Learning</h2>
  <StatRow icon="clock" label="Time Played" value="2h 34m" />
  <StatRow icon="games" label="Games Explored" value="8 activities" />
  <StatRow icon="calendar" label="Active Days" value="4 of 7" />
  <Button variant="secondary">View Full Activity Log</Button>
</ActivitySummaryCard>
```

- **Tradeoff**: Requires new data aggregation from `progressStore` or backend `/api/progress/summary` endpoint
- **Dev Effort**: Medium (backend aggregation + frontend component)
- **Alignment**: HIGH - Directly supports Smart Recess engagement-first messaging

**Option 2** (Lightweight): Add "Last Session" Capsule

```typescript
<LastSessionBadge>
  <Icon name="check-circle" />
  <span>Last played: Alphabet Tracing (12 min)</span>
</LastSessionBadge>
```

- **Tradeoff**: Lower fidelity than weekly summary but faster to implement
- **Dev Effort**: Low (use existing progress data, simple UI)
- **Alignment**: MEDIUM - Shows activity but not comprehensive enough for parent reporting

**Recommended Path**: Implement **Option 1** to directly address Smart Recess positioning. Backend team should add `/api/progress/summary?period=week` endpoint returning:

```json
{
  "totalMinutes": 154,
  "gamesPlayed": ["alphabet-tracing", "finger-number-show", ...],
  "activeDays": 4,
  "sessions": 12,
  "mostPlayedGame": "alphabet-tracing"
}
```

**Test Cases**:

- [ ] New user (no activity): Shows empty state with encouraging message
- [ ] Guest user: Activity summary hidden (guest progress not tracked)
- [ ] Active user: Summary shows accurate time/games/days
- [ ] Mobile: Summary card responsive and readable on small screens
- [ ] i18n: Summary labels translated correctly

---

### Issue #2: Currency Badge False Affordance (MEDIUM)

**ID**: `currency-badge-false-affordance`  
**Severity**: MEDIUM  
**Confidence**: HIGH  
**Evidence**: `Observed` - Star currency rendered as clickable `<div>` with `cursor-pointer` but no `onClick` handler

**Code Location** (Dashboard.tsx, approx line 80-90):

```tsx
<div className='flex items-center gap-2 text-yellow-400 cursor-pointer'>
  <UIIcon name='star' className='w-6 h-6' />
  <span className='font-bold text-xl'>{totalStars}</span>
</div>
```

**Problem**: Visual affordance (cursor changes to pointer) signals interactivity, but clicking does nothing. Creates confusion and breaks user trust.

**Fix Options**:

**Option 1**: Convert to button linking to Inventory/Rewards

```tsx
<button
  onClick={() => navigate('/inventory')}
  className='flex items-center gap-2 text-yellow-400 hover:text-yellow-300 transition-colors'
  aria-label='View your star rewards'
>
  <UIIcon name='star' className='w-6 h-6' />
  <span className='font-bold text-xl'>{totalStars}</span>
</button>
```

- **Tradeoff**: Only valid if `/inventory` or rewards system exists

**Option 2**: Remove pointer cursor if no destination exists yet

```tsx
<div className='flex items-center gap-2 text-yellow-400'>
  {/* cursor-pointer removed */}
  <UIIcon name='star' className='w-6 h-6' />
  <span className='font-bold text-xl'>{totalStars}</span>
</div>
```

- **Tradeoff**: Reduces perceived interactivity but honest about current state

**Recommendation**: Check if `/inventory` route is implemented. If yes, use Option 1. If no, use Option 2 until rewards system ready.

**Test Cases**:

- [ ] Keyboard users can focus and activate button (if Option 1)
- [ ] Screen readers announce "View your star rewards" (if Option 1)
- [ ] No cursor change on hover (if Option 2)

---

### Issue #3: Featured Games Not Localized (MEDIUM)

**ID**: `featured-games-not-localized`  
**Severity**: MEDIUM  
**Confidence**: HIGH  
**Evidence**: `Observed` - `RECOMMENDED_GAMES` titles/descriptions are hard-coded English strings

**Code Location** (Dashboard.tsx, approx line 30-50):

```typescript
const RECOMMENDED_GAMES = [
  {
    id: 'alphabet-tracing',
    title: 'Alphabet Tracing', // ❌ Hard-coded English
    description: 'Trace letters with your finger', // ❌ Hard-coded English
    icon: 'alphabet',
    category: 'literacy',
  },
  // ... more games
];
```

**Problem**: Dashboard ignores i18n system. When user switches language (15 supported), featured game copy stays in English while rest of UI translates.

**Strategic Impact**: Inconsistent UX undermines trust in non-English locales. App claims Hindi/Tamil/Spanish support but Dashboard shows English game titles.

**Fix Options**:

**Option 1**: Move featured game copy to i18n keys

```typescript
// Dashboard.tsx
const { t } = useTranslation('dashboard');

const RECOMMENDED_GAMES = [
  {
    id: 'alphabet-tracing',
    title: t('featured.alphabetTracing.title'),
    description: t('featured.alphabetTracing.description'),
    icon: 'alphabet',
    category: 'literacy',
  },
  // ...
];
```

```json
// locales/en/dashboard.json
{
  "featured": {
    "alphabetTracing": {
      "title": "Alphabet Tracing",
      "description": "Trace letters with your finger"
    }
  }
}
```

- **Tradeoff**: Requires translation entries for each language (15 languages × 4 games = 60 strings)
- **Dev Effort**: Medium (add keys, coordinate translations)

**Option 2**: Derive featured games from gameRegistry with localized labels

```typescript
import { gameRegistry } from '@/routes/gameRegistry';

const RECOMMENDED_GAME_IDS = ['alphabet-tracing', 'finger-number-show', ...];
const recommendedGames = RECOMMENDED_GAME_IDS.map(id => gameRegistry[id]);
// gameRegistry already has localized titles
```

- **Tradeoff**: Requires gameRegistry to expose localized strings (may already exist)
- **Dev Effort**: Low if gameRegistry structured correctly

**Recommendation**: **Option 2** if gameRegistry exists with i18n support. Otherwise, **Option 1** with phased translation (start with high-traffic languages: en, es, hi, ta).

**Test Cases**:

- [ ] Switch to Spanish: Featured game titles appear in Spanish
- [ ] Switch to Hindi: Featured game titles appear in Devanagari script
- [ ] Fallback: If translation missing, shows English (graceful degradation)

---

### Issue #4: Mobile Actions Unclear (MEDIUM)

**ID**: `mobile-actions-hidden`  
**Severity**: MEDIUM  
**Confidence**: LOW  
**Evidence**: `Observed` - Action buttons (Export, Settings) hidden on mobile via `hidden md:flex` class

**Code Location** (Dashboard.tsx, approx line 70-75):

```tsx
<div className='hidden md:flex gap-4'>
  <button onClick={() => setExporting(true)}>Export Data</button>
  <button onClick={() => navigate('/settings')}>Settings</button>
</div>
```

**Problem**: On mobile (< 768px), these buttons disappear. **Unknown** if Layout provides alternative access (hamburger menu, bottom nav, etc.).

**Needs More Evidence**: Must check `src/frontend/src/components/ui/Layout.tsx` to verify:

- Does Layout have mobile navigation?
- Are Settings/Export accessible from mobile nav?
- Or are mobile users locked out of these actions?

**Fix Options**:

**Option 1**: Ensure mobile navigation in Layout exposes Settings + Export

- Check Layout for `<MobileNav>` component
- If exists and includes these actions, **no Dashboard change needed**

**Option 2**: Add mobile overflow menu in Dashboard header

```tsx
{
  /* Mobile only */
}
<div className='md:hidden'>
  <DropdownMenu>
    <DropdownMenuItem onClick={() => navigate('/settings')}>
      Settings
    </DropdownMenuItem>
    <DropdownMenuItem onClick={() => setExporting(true)}>
      Export Data
    </DropdownMenuItem>
  </DropdownMenu>
</div>;
```

- **Tradeoff**: May duplicate actions if Layout already provides mobile nav

**Recommendation**: **Investigate Layout.tsx first** before implementing fix. If Layout has no mobile nav, implement Option 2.

**Test Cases**:

- [ ] Mobile viewport (375px): Settings accessible via mobile menu
- [ ] Mobile viewport: Export Data accessible
- [ ] Desktop viewport (1024px): Action buttons visible in Dashboard header
- [ ] Touch interaction: Mobile menu items have adequate tap targets (min 44px)

---

### Issue #5: Static Featured Games (LOW)

**ID**: `static-featured-games`  
**Severity**: LOW  
**Confidence**: MEDIUM  
**Evidence**: `Observed` - `RECOMMENDED_GAMES` constant is static, not derived from play history

**Problem**: Featured area shows same 4 games for all users regardless of:

- Recent activity (what child played yesterday)
- Skill level (beginner vs advanced)
- Age appropriateness (3y vs 6y)
- Language preference (phonics games in user's language)

**Personalization Opportunity**: Progress store likely has play history. Could surface recently played games or games matched to child's age/skill.

**Fix Options**:

**Option 1**: Use recent activity to pick featured games

```typescript
const { recentGames } = useProgressStore();
const featuredGames =
  recentGames.length >= 2
    ? recentGames.slice(0, 4)
    : [...recentGames, ...RECOMMENDED_GAMES].slice(0, 4);
```

- **Tradeoff**: Requires progress store to track recent games
- **Benefit**: Dashboard feels personalized, encourages repeat engagement

**Option 2**: Feature games based on child's age

```typescript
const { currentProfile } = useProfileStore();
const ageAppropriateGames = GAME_LIBRARY.filter(
  (game) =>
    game.minAge <= currentProfile.age && game.maxAge >= currentProfile.age,
);
```

- **Tradeoff**: Requires age metadata in game registry
- **Benefit**: Aligns with Smart Recess age-appropriate content positioning

**Recommendation**: **Low priority** compared to Issues #1-#4. Implement after engagement summary and i18n fixes. Start with Option 1 (recent activity) as quick win.

**Test Cases**:

- [ ] New user (no history): Shows default featured games
- [ ] Active user: Shows mix of recent + recommended
- [ ] Age filter: Featured games appropriate for profile age

---

## Recommended Tests

### Functional Tests

1. **Guest Flow**: Dashboard renders with guest session data, no profile switcher appears
2. **Add Child Flow**: Click "Add Child" → modal opens → createProfile → profile list refreshes
3. **Profile Switching**: Select different profile → Dashboard updates with correct stars/progress
4. **Export Flow**: Click Export → data export modal appears → generates CSV/JSON

### Localization Tests

5. **Language Switching**: Change language → Featured games copy updates (after Issue #3 fix)
6. **RTL Languages**: Arabic/Hebrew language → Layout flips correctly
7. **Fallback**: Missing translation key → Shows English with graceful degradation

### Responsive Tests

8. **Mobile Settings Access**: Verify Settings reachable on mobile (Layout investigation required)
9. **Mobile Export Access**: Verify Export reachable on mobile
10. **Touch Targets**: All interactive elements ≥ 44px tap target on mobile
11. **Tablet Layout**: Dashboard adapts gracefully at 768px-1024px breakpoints

### Accessibility Tests

12. **Keyboard Navigation**: Tab through dashboard → all actions reachable
13. **Screen Reader**: NVDA/VoiceOver announces profile selector, game cards, action buttons
14. **Focus Management**: Opening/closing AddChildModal traps focus correctly

---

## Safe Refactors

### 1. Extract Featured Games Config

**Current**: Hard-coded `RECOMMENDED_GAMES` constant in Dashboard.tsx  
**Proposed**: Move to `src/config/featuredGames.ts` or derive from gameRegistry

**Benefits**:

- Single source of truth for featured content
- Easier to A/B test different featured game sets
- Centralized i18n key management

### 2. Extract Profile Selector Component

**Current**: Profile selector logic inline in Dashboard  
**Proposed**: Create `<ProfileSelector>` component with explicit empty/loading states

**Benefits**:

- Reusable across Progress/Settings pages
- Easier to test in isolation
- Clearer loading/error state handling

**Component API**:

```tsx
<ProfileSelector
  profiles={profiles}
  currentProfile={currentProfile}
  onProfileChange={setCurrentProfile}
  showForGuest={false}
  loading={isLoadingProfiles}
/>
```

---

## Implementation Priority

### Phase 1: Critical (Smart Recess Alignment) 🎯

**Ticket**: TCK-20260225-003  
**Effort**: 2-3 days  
**Dependencies**: Backend `/api/progress/summary` endpoint

1. **Issue #1**: Add "This Week" activity summary card
   - Backend: Implement summary endpoint
   - Frontend: Create `<ActivitySummaryCard>` component
   - Tests: Verify empty state, guest hiding, i18n
2. **Issue #2**: Fix currency badge affordance
   - Check if `/inventory` exists
   - Either add button or remove pointer cursor
   - Tests: Keyboard/screen reader accessibility

### Phase 2: Quality (Consistency & i18n) 📋

**Ticket**: TCK-20260225-004  
**Effort**: 1-2 days  
**Dependencies**: Translation pipeline

3. **Issue #3**: Localize featured games
   - Investigate gameRegistry structure
   - Add i18n keys or use registry labels
   - Coordinate translations for top 5 languages
4. **Issue #4**: Clarify mobile actions
   - Investigate Layout.tsx mobile nav
   - Add mobile menu if needed
   - Tests: Mobile accessibility, touch targets

### Phase 3: Enhancement (Personalization) ✨

**Ticket**: TCK-20260225-005  
**Effort**: 1 day  
**Dependencies**: Progress tracking enhancement

5. **Issue #5**: Dynamic featured games
   - Use recent activity from progressStore
   - Fallback to static list for new users
   - Tests: Verify personalization logic

---

## Strategic Recommendations

### 1. Dashboard = Engagement Proof Hub

Transform Dashboard from "game launcher" to "learning evidence center":

- **Add**: Weekly activity summary (Issue #1)
- **Add**: Skill progression indicators (from progress store)
- **Add**: Parent-friendly language ("This week, Alex explored 8 activities and practiced letters for 45 minutes")
- **Remove**: Gamification elements that obscure learning (or reframe stars as "practice minutes")

### 2. Mobile-First Dashboard Redesign

Current Dashboard optimized for desktop (action buttons, wide grid). Mobile should be first-class:

- Single-column layout for < 768px
- Bottom sheet for quick actions
- Swipeable game cards (horizontal scroll)
- Fixed header with profile switcher

### 3. Progressive Enhancement

Support camera-based games gracefully:

- `DemoInterface` already handles `!hasBasicCameraSupport`
- Extend to feature non-camera games prominently for unsupported devices
- Show "Enable camera to unlock XYZ games" upsell when appropriate

### 4. Analytics Integration

Track Dashboard engagement to validate fixes:

- Time to first game click
- Profile switch frequency
- Export data usage
- Activity summary card interactions

---

## Evidence Appendix

### Discovery Commands Run

```bash
# Package inspection
cat package.json
find . -maxdepth 3 -type f -name "vite.config.*"

# Framework detection
rg -n "createRoot|ReactDOM.render" .
rg -n "Router|Routes|createBrowserRouter" .

# Route mapping
rg -n "Route|path=|createBrowserRouter" src/
rg -n "pages/|app/|routes/|screens/" .

# Styling system
rg -n "tailwind|styled-components|emotion" .
rg -n "tokens|theme|design system" .

# State management
rg -n "useQuery|useMutation|axios|fetch" src/
rg -n "loading|isLoading|error|empty" src/

# Accessibility
rg -n "aria-|role=|tabIndex|onKeyDown" src/
rg -n "Dialog|Modal|Drawer|Popover" src/

# Responsive design
rg -n "@media|sm:|md:|lg:|breakpoint" src/

# Performance patterns
rg -n "map\\(|filter\\(|sort\\(" src/
rg -n "useMemo|useCallback|memo\\(" src/

# Dashboard routing
rg -n "path='/dashboard'|Dashboard" src/frontend/src/App.tsx
```

**Output Size**: 543KB (discovery output written to temp file due to size)

### Files Opened

1. `src/frontend/src/App.tsx` (lines 1-2000) - Router configuration
2. `src/frontend/src/pages/Dashboard.tsx` (lines 1-2000) - Target component
3. `src/frontend/package.json` - Dependency verification
4. `package.json` - Root project config

### Route Evidence (App.tsx)

```typescript
// Line 35-36: Lazy load
const Dashboard = lazy(() => import('./pages/Dashboard'));

// Line 270-274: Route config
<Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <Layout>
        <Dashboard />
      </Layout>
    </ProtectedRoute>
  }
/>
```

---

## Definitions

**Observed**: Directly verified from file content or command output  
**Inferred**: Logically implied from observed facts  
**Unknown**: Cannot be determined from available evidence

**Smart Recess**: Target positioning as learning tool with engagement proof (activity logs, time played) rather than grade-based metrics.

**Persona References**:

- **Priya** (Tech-Savvy Parent, 32): Needs weekly activity summaries to share with teacher, wants engagement proof not grades
- **Mira** (Curious Explorer, 4): Responds to visual feedback, needs variety to stay engaged
- **Ms. Deepa** (Preschool Teacher): Values activity logs over mastery metrics for early childhood reporting

---

## Next Actions

1. **Clarify mobile navigation**: Investigate `Layout.tsx` for mobile action access (Issue #4 depends on this)
2. **Validate inventory route**: Check if `/inventory` exists before fixing currency badge (Issue #2)
3. **Review gameRegistry**: Determine if localized game metadata already exists (Issue #3 approach depends on this)
4. **Backend coordination**: Discuss `/api/progress/summary` endpoint design with backend team (Issue #1 blocker)
5. **Prioritization meeting**: Present this audit to stakeholders for Phase 1/2/3 prioritization

---

**Audit Version**: 1.0  
**Protocol**: Repo-Aware UI Auditor  
**Completion Time**: 2026-02-25  
**Stamp**: STAMP-20260225T090040Z-copilot-wqwt
