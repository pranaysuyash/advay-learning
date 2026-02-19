# Advay Asset Inventory

Complete visual asset reference for the Advay learning platform.

## Brand Assets (`/assets/brand/`)

| File | Description | Usage |
|------|-------------|-------|
| `logo-full.svg` | Advay wordmark with paw icon | Headers, footers, print |
| `logo-mark.svg` | Paw icon only | Favicon, app icon, small spaces |
| `pip-avatar.svg` | Pip mascot illustration | Child UI, onboarding |
| `color-palette.css` | CSS color variables | Styling reference |
| `color-palette-preview.svg` | Visual palette reference | Documentation |

## Feature Illustrations (`/src/frontend/public/assets/images/`)

### Marketing & Landing

| File | Description | Dimensions | Usage |
|------|-------------|------------|-------|
| `hero-learning.svg` | Main hero illustration | 400x300 | Landing page hero |
| `feature-hand-tracking.svg` | Hand with tracking indicator | 120x120 | Home page feature card |
| `feature-multilang.svg` | Globe with letters | 120x120 | Home page feature card |
| `feature-gamified.svg` | Trophy with progress ring | 120x120 | Home page feature card |

### Onboarding

| File | Description | Dimensions | Usage |
|------|-------------|------------|-------|
| `onboarding-welcome.svg` | Pip waving welcome | 300x240 | Welcome screen |
| `onboarding-hand.svg` | Hand tracking demo | 300x240 | Hand tracking tutorial |

### Empty States

| File | Description | Dimensions | Usage |
|------|-------------|------------|-------|
| `empty-no-children.svg` | Pip with question mark | 200x160 | Dashboard - no profiles |
| `empty-no-progress.svg` | Pip with chart | 200x160 | Progress - no data yet |

### Achievements & UI

| File | Description | Dimensions | Usage |
|------|-------------|------------|-------|
| `achievement-celebration.svg` | Confetti celebration | 200x160 | Letter mastered modal |
| `loading-pip.svg` | Animated loading spinner | 120x120 | Loading states |
| `streak-flame.svg` | Streak fire icon | 80x100 | Streak counter |
| `badge-star.svg` | Achievement badge | 80x80 | Rewards, achievements |

## Alphabet Icons (`/src/frontend/public/assets/icons/`)

**Total: 110+ SVG icons**

### Icon Naming Convention

- Lowercase with hyphens: `apple.svg`, `ice-cream.svg`, `fountain-pen.svg`
- Default fallback: `default.svg`

### Coverage by Language

| Language | Count | Examples |
|----------|-------|----------|
| English | 26+ | apple, ball, cat, dog... |
| Hindi | 32+ | mango, tamarind, sugarcane, pomegranate... |
| Kannada | 28+ | conch, prayer, salt, banyan... |
| Telugu | 14+ | rice, mosquito, ring, lamp... |
| Tamil | 13+ | pancake, tortoise, needle, umbrella... |

### Icon Style

- Simple, flat design
- Single color fill
- Kid-friendly silhouettes
- Consistent 100x100 viewBox

## Mascot Assets (`/assets/images/`)

| File | Description | Usage |
|------|-------------|-------|
| `pip_mascot.png` | Full Pip illustration | Marketing materials |
| `red_panda_no_bg.png` | Photo-realistic red panda | Reference, inspiration |

## Video Assets (`/src/frontend/public/assets/videos/`)

| File | Description | Usage |
|------|-------------|-------|
| `hand_tracking_demo.mp4` | Demo of hand tracking | Tutorials, marketing |

## UI Icons (`/src/frontend/public/assets/icons/ui/`)

**Total: 19 SVG icons for interface elements**

| Icon | File | Usage |
|------|------|-------|
| Letters | `letters.svg` | Stats - letters learned |
| Target | `target.svg` | Stats - accuracy, game trace indicator |
| Timer | `timer.svg` | Stats - time spent |
| Flame | `flame.svg` | Stats - streak counter |
| Hand | `hand.svg` | Drawing controls, onboarding |
| Pencil | `pencil.svg` | Drawing controls |
| Home | `home.svg` | Navigation buttons |
| Check | `check.svg` | Success states, completed items |
| Lock | `lock.svg` | Locked content, parent gate |
| Unlock | `unlock.svg` | Unlock actions |
| Warning | `warning.svg` | Alerts, pending states |
| Download | `download.svg` | Export data action |
| Hourglass | `hourglass.svg` | Loading states |
| Circle | `circle.svg` | Status indicators |
| Sparkles | `sparkles.svg` | Achievement effects |
| Heart | `heart.svg` | Footer, favorites |
| Star | `star.svg` | Ratings, achievements |
| Camera | `camera.svg` | Camera permission settings |
| Trophy | `trophy.svg` | Achievements, rewards |

## Usage Guidelines

### SVG Icons (Alphabet)

```tsx
// Basic usage
<img src="/assets/icons/apple.svg" alt="Apple" width="32" height="32" />

// With Icon component
<Icon src="/assets/icons/apple.svg" alt="Apple" size={32} />

// With fallback
<Icon src={letter.icon} alt={letter.name} fallback={letter.emoji} />
```

### UI Icons

```tsx
// Using UIIcon component
import { UIIcon } from '../components/ui/Icon';

// Basic usage
<UIIcon name="home" size={24} />

// With custom color
<UIIcon name="flame" size={16} className="text-orange-400" />

// In buttons
<button className="flex items-center gap-2">
  <UIIcon name="download" size={18} />
  Export Data
</button>
```

### Feature Illustrations

```tsx
// In feature cards
<div className="w-20 h-20 mx-auto mb-4">
  <img 
    src="/assets/images/feature-hand-tracking.svg" 
    alt="Hand Tracking"
    className="w-full h-full object-contain"
  />
</div>
```

### Loading Animation

```tsx
// Loading spinner with Pip
<div className="w-16 h-16">
  <img 
    src="/assets/images/loading-pip.svg" 
    alt="Loading..."
    className="w-full h-full"
  />
</div>
```

## Asset Checklist

### Critical (Required for launch)

- [x] Logo system (full, mark, avatar)
- [x] Alphabet icons (100+)
- [x] UI icons (19)
- [x] Default icon fallback
- [x] Loading spinner
- [x] Feature illustrations
- [x] Empty state illustrations
- [x] Achievement graphics
- [x] Onboarding illustrations

### Nice to have (Post-launch)

- [ ] Animated mascot reactions
- [ ] Additional empty states
- [ ] Seasonal variations
- [ ] Sound effects for interactions

## Brand Colors Reference

| Token | Hex | Usage |
|-------|-----|-------|
| Pip Orange | `#E85D04` | Primary CTAs, accents |
| Advay Slate | `#2D3748` | Text, tech elements |
| Discovery Cream | `#FFF8F0` | Backgrounds |
| Vision Blue | `#3B82F6` | Secondary, AI features |
| Success Sage | `#81B29A` | Success states |
| Sunny Yellow | `#F2CC8F` | Rewards, highlights |

---

**Last Updated:** 2026-01-30  
**Version:** 1.1  
**Status:** Core assets + UI components complete
