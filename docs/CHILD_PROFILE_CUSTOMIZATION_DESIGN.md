# Child Profile Customization Design

## Research Summary

### Current System State

**Existing Components:**
- `AvatarCapture.tsx` - Camera-based photo capture (functional)
- `EditProfileModal.tsx` - Edit profile form (exists, not integrated)
- `ProfileSelector.tsx` - Profile dropdown with initial-letter avatar
- `AddChildModal.tsx` - Add new child

**Backend Support:**
- `avatar_url` field in Profile model
- `/api/v1/users/me/profiles/{id}/photo` - Photo upload endpoint
- `ProfileUpdate` schema supports: name, age, preferred_language, settings

**Kenney Assets Available:**
- 5 Platformer Characters (beige, green, pink, purple, yellow)
- 20+ Enemy/Animal Characters (bee, frog, ladybug, mouse, snail, slimes, fish, etc.)
- Multiple animations per character (idle, walk, jump, etc.)

---

## UX Research: Kids' Avatar Customization Best Practices

### Key Insights from Research

1. **Simplicity First**: Kids 3-5 can't read well - use visual icons, not text labels
2. **Immediate Feedback**: Every tap needs visual/audio feedback
3. **Big Touch Targets**: Minimum 44x44px for touch elements
4. **Limited Choices**: Too many options overwhelm young children
5. **Progressive Disclosure**: Show basic options first, advanced behind "more" button
6. **Fun & Delight**: Animated characters, sounds, colors make it engaging

### Competitor Analysis

| App | Avatar Approach | Kid-Friendly? | Notes |
|-----|----------------|---------------|-------|
| PBS Kids | Pre-made characters | ✅ Yes | Simple picker, no customization |
| Duolingo | Animated characters | ✅ Yes | Owl mascot, expressive animations |
| Khan Academy Kids | Cute animals | ✅ Yes | Colorful, simple shapes |
| Epic! | Reading avatars | ✅ Yes | Book-themed characters |
| Nintendo (Mii) | Builder with parts | ⚠️ Complex | Too many options for young kids |

---

## Proposed Design: "Kenney Avatar Picker"

### Core Concept
Replace the initial-letter avatar with a **customizable Kenney character avatar** that kids can:
1. **Pick** a character (Platformer kid or Animal friend)
2. **Choose** color/style (for platformer characters)
3. **Set** an expression/pose

### Avatar Categories

```typescript
// Avatar types based on Kenney assets
const AVATAR_CATEGORIES = {
  // Human-like characters (5 colors)
  platformer: {
    beige: { name: 'Sandy', color: '#D4A574' },
    green: { name: 'Lime', color: '#7CB342' },
    pink: { name: 'Rosy', color: '#F06292' },
    purple: { name: 'Grape', color: '#BA68C8' },
    yellow: { name: 'Sunny', color: '#FDD835' },
  },
  // Animal friends
  animals: {
    frog: { name: 'Froggy', sound: 'ribbit' },
    bee: { name: 'Buzz', sound: 'buzz' },
    ladybug: { name: 'Dots', sound: null },
    mouse: { name: 'Squeak', sound: 'squeak' },
    snail: { name: 'Shelly', sound: null },
  },
  // Fun creatures
  creatures: {
    slime_normal: { name: 'Gloop', wobble: true },
    slime_fire: { name: 'Flame', glow: true },
    block: { name: 'Blocky', bounce: true },
  }
};
```

### UI Design: Avatar Selector Modal

```
┌─────────────────────────────────────────┐
│  Choose Your Character    [X]           │
├─────────────────────────────────────────┤
│                                         │
│   ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐   │
│   │ 😊  │  │ 🐸  │  │ 🐝  │  │ ⭐  │   │ ← Category tabs
│   │ Kids│  │ Pets│  │Magic│  │Photo│   │
│   └─────┘  └─────┘  └─────┘  └─────┘   │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│        ┌─────────────────┐              │
│        │                 │              │
│        │   [AVATAR       │              │ ← Large preview
│        │    PREVIEW]     │              │   with animation
│        │                 │              │
│        └─────────────────┘              │
│                                         │
│   ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐       │
│   │👦🏻│ │👦🏼│ │👦🏽│ │👦🏾│ │👦🏿│       │ ← Color options
│   └───┘ └───┘ └───┘ └───┘ └───┘       │   (for platformer)
│                                         │
│   Name: [_______________]               │
│                                         │
│        [   Save Changes   ]             │
│                                         │
└─────────────────────────────────────────┘
```

### Integration Points

#### 1. Profile Selector (Mini Version)
```
┌────────────────────────────────────────────────┐
│ Advay Sinha [5] ▼    ⭐ 200  🔔  🎵  ⚙️       │
│ ═══════════════════════════════════════════════│
│                                                │
│  ┌───┐ ┌───┐ ┌───┐ ┌───┐                      │
│  │😊 │ │🐸 │ │➕ │                               │
│  │A  │ │Pip│ │Add│                               │
│  └───┘ └───┘ └───┘                               │
│  Selected                                      │
└────────────────────────────────────────────────┘
```

**Features:**
- **Avatar**: Shows Kenney character instead of initial letter
- **Age Badge**: Small number badge on avatar corner
- **Long-press/Right-click**: Opens edit menu
- **Click**: Select profile

#### 2. Dashboard Profile Selector Enhancement

**Current:**
- Text buttons with names only
- Initial letter in circle

**Proposed:**
```
Profile Selector:
┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐
│ 😊  │ │ 🐸  │ │ ➕  │
│ A   │ │ Pip │ │Add  │
└─────┘ └─────┘ └─────┘
 [5]      [8]
 
Age badges shown as small notification-style dots
```

#### 3. Edit Profile Flow

**Entry Points:**
1. Long-press on profile in selector
2. "Edit" button in ProfileSelector dropdown
3. Settings → Manage Children

**Edit Modal Features:**
- Change avatar (Kenney picker)
- Edit name
- Edit age
- Change language
- Delete profile (with parental gate)

---

## Technical Implementation

### Data Model Extension

```typescript
// Add to Profile interface
interface Profile {
  id: string;
  name: string;
  age?: number;
  preferred_language: string;
  
  // NEW: Avatar customization
  avatar_config?: {
    type: 'platformer' | 'animal' | 'creature' | 'photo';
    character: string;      // e.g., 'beige', 'frog', 'slime_normal'
    color?: string;         // for platformer
    animation?: string;     // 'idle', 'walk', 'jump', 'happy'
  };
  avatar_url?: string;      // For photo avatars
}

// Store avatar config in Profile.settings as JSON
// No backend migration needed!
```

### Component Architecture

```
KenneyAvatarPicker/
├── AvatarPickerModal.tsx      # Main picker modal
├── AvatarCategoryTabs.tsx     # Kids/Pets/Magic/Photo tabs
├── AvatarGrid.tsx             # Grid of selectable avatars
├── AvatarPreview.tsx          # Large animated preview
├── ColorSelector.tsx          # Color options for platformer
└── hooks/
    └── useAvatarAnimation.ts  # Auto-cycle idle animations

ProfileSelector/
├── ProfileSelector.tsx        # Enhanced with avatars
├── ProfileBadge.tsx           # Avatar + age badge component
├── ProfileEditMenu.tsx        # Context menu for editing
└── hooks/
    └── useProfileActions.ts   # Edit/Delete handlers

EditProfileModal/
├── EditProfileModal.tsx       # Existing modal enhanced
├── AvatarSection.tsx          # Avatar picker integration
└── DeleteProfileGate.tsx      # Parental gate for deletion
```

### Avatar Display Component

```typescript
// KenneyAvatar.tsx
interface KenneyAvatarProps {
  config: Profile['avatar_config'];
  size?: 'sm' | 'md' | 'lg';
  showAnimation?: boolean;
  className?: string;
}

// Renders the appropriate Kenney sprite based on config
// Falls back to initial letter if no config
```

### Age Notification Badge

```typescript
// AgeBadge.tsx
interface AgeBadgeProps {
  age: number;
  size?: 'sm' | 'md';
}

// Small rounded badge with age number
// Position: absolute, top-right of avatar
// Style: Background color based on age group
//   - 2-3: Soft pink
//   - 4-5: Sky blue  
//   - 6-7: Lime green
//   - 8+: Purple
```

---

## Implementation Phases

### Phase 1: Core Infrastructure (1-2 days)
1. Create `KenneyAvatar` display component
2. Add avatar_config to Profile type
3. Create avatar utility functions (getAvatarUrl, etc.)
4. Add avatar support to ProfileStore

### Phase 2: Avatar Picker UI (2-3 days)
1. Build `AvatarPickerModal` with tabs
2. Create avatar grid with Kenney sprites
3. Add preview with animation cycling
4. Integrate with existing `AvatarCapture` for photo option

### Phase 3: Profile Selector Enhancement (1-2 days)
1. Update `ProfileSelector` to show avatars
2. Add `AgeBadge` component
3. Add edit/delete actions (long-press or menu)
4. Integrate `EditProfileModal`

### Phase 4: Dashboard Integration (1 day)
1. Update Dashboard profile selector
2. Add avatar to welcome message
3. Test all flows

---

## Accessibility Considerations

1. **Large Touch Targets**: 48x48px minimum for avatar selection
2. **High Contrast**: Ensure avatars visible against backgrounds
3. **Screen Reader Labels**: Descriptive labels for each avatar
4. **Animation Control**: Respect `prefers-reduced-motion`
5. **Parental Gate**: Math question or swipe gesture for deletion

---

## Delight Factors

1. **Sound Effects**: 
   - Pop sound when selecting avatar
   - Character-specific sound (ribbit for frog, buzz for bee)
   - Celebration on save

2. **Micro-animations**:
   - Avatar bounces when selected
   - Smooth transitions between categories
   - Badge pulses gently

3. **Personalization**:
   - Character "waves" on birthday
   - Seasonal accessories (optional future)

---

## Assets Needed

From existing Kenney Platformer Pack:
- All 5 character colors (idle, walk for animation)
- Frog (idle, jump)
- Bee (fly animation)
- Ladybug (walk)
- Mouse (walk)
- Slimes (idle, walk)

Total: ~30-40 sprites (already available!)

---

## Summary

This design creates a **fun, kid-friendly avatar system** using existing Kenney assets:

- ✅ No new asset downloads needed
- ✅ Backend already supports avatar_url
- ✅ EditProfileModal already exists (needs integration)
- ✅ Camera capture already exists (AvatarCapture.tsx)
- ✅ Age display as badge adds useful context
- ✅ Kids can customize their identity
- ✅ Simple enough for 3-5 year olds

**Next Step**: Implement Phase 1 (core infrastructure) to prototype the experience.
