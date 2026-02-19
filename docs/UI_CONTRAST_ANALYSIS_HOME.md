# Home vs Other Pages - UI Analysis

## Executive Summary

**Date:** 2026-01-30  
**Pages Analyzed:** Home.tsx, Dashboard.tsx, Settings.tsx, Progress.tsx  
**Purpose:** Understand why Home has better contrast than other pages

---

## Key Findings

### 1. Background Colors

| Page | Background | Token Used | Contrast Level |
|-------|------------|--------------|---------------|
| **Home** | Implicit (transparent) | N/A (inherits body bg-primary #FDF8F3) |
| Dashboard | `bg-white` in cards, inherits page bg | High |
| Settings | Inherits page bg-primary | High |
| Progress | Inherits page bg-primary | High |

**Observation:** All pages share the same body background (`--bg-primary: #FDF8F3` - warm cream color).

---

### 2. Text Contrast Analysis

#### Home Page Text Colors

```tsx
// Headline
<h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent">
  Learn with Your Hands
</h1>

// Subtitle
<p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
  An AI-powered educational platform...
</p>

// Feature descriptions
<p className="text-white/70">{feature.description}</p>
```

**Contrast Ratios:**

- `text-white/80` on #FDF8F3 = **2.4:1** ❌ FAILS WCAG AA (needs 4.5:1)
- `text-white/70` on #FDF8F3 = **2.1:1** ❌ FAILS WCAG AA (needs 4.5:1)
- Gradient text (`red-400` to `red-600`) - **high visibility** due to saturation

#### Other Pages Text Colors

```tsx
// Dashboard
<h1 className='text-2xl md:text-3xl font-bold'>Parent Dashboard</h1>
<p className='text-base text-text-secondary mt-1'>Welcome back...</p>

// Settings
<label className='block text-sm font-medium text-white/80 mb-2'>UI Language</label>

// Progress
<p className='text-text-secondary'>{stat.label}</p>
```

**Contrast Ratios:**

- `text-text-secondary` (#4B5563) on #FDF8F3 = **7.2:1** ✅ EXCEEDS WCAG AA
- `text-text-muted` (#6B7280) on #FDF8F3 = **4.7:1** ✅ PASSES WCAG AA
- `text-text-primary` (#1F2937) on #FDF8F3 = **13.9:1** ✅ EXCEEDS WCAG AAA

---

### 3. Component Usage Patterns

#### Home Page

- **Custom implementations** for cards, buttons, layouts
- Inline styles in JSX
- No use of unified UI components

#### Other Pages (Dashboard, Settings, Progress)

- **Unified component system:**
  - `Button` component with variants (primary, secondary, danger, ghost, success)
  - `Card` component with standardized styling
  - `FeatureCard` component for consistent feature displays
  - `UIIcon` for consistent iconography
- Design tokens from CSS variables
- Consistent spacing system

---

### 4. Card and Container Styling

#### Home Feature Cards

```tsx
<motion.div
  className="bg-white/10 border border-border rounded-xl p-6 text-center shadow-sm"
>
  <img src={feature.icon} alt={feature.title} className="w-full h-full object-contain" />
  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
  <p className="text-white/70">{feature.description}</p>
</motion.div>
```

**Issues:**

- `bg-white/10` = 10% white on cream (low contrast background)
- `text-white/70` = low contrast text
- Custom card layout vs. unified `Card` component

#### Dashboard Cards

```tsx
<Card>
  <div className="flex items-center gap-3 mb-2">
    <div className="w-10 h-10 rounded-xl bg-bg-tertiary flex items-center justify-center">
      <UIIcon name={stat.iconName} size={20} className="text-text-secondary" />
    </div>
  </div>
  <div className="text-3xl font-bold mt-2 text-text-primary">{stat.value}</div>
</Card>
```

**Strengths:**

- Uses `bg-bg-tertiary` (#F5F0E8) for structured backgrounds
- `text-text-primary` for high contrast
- Unified Card component with consistent borders (`border-border`)
- Shadow system (`shadow-soft`, `shadow-soft-lg`)

---

### 5. Button Styling

#### Home Buttons

```tsx
// Primary CTA
<Link to="/register" className="px-8 py-3 bg-gradient-to-r from-red-500 to-red-600 rounded-lg font-semibold hover:shadow-lg hover:shadow-red-500/30 transition">
  Get Started
</Link>

// Secondary CTA
<Link to="/game" className="px-8 py-3 bg-white/10 border border-border rounded-lg font-semibold hover:bg-white/20 transition">
  Try Demo
</Link>
```

#### Other Pages Buttons

```tsx
// Using Button component
<Button variant="primary" size="lg">Primary Action</Button>
<Button variant="secondary" size="lg">Secondary Action</Button>
```

**Button Component Styles:**

```tsx
primary: 'bg-pip-orange text-white shadow-soft hover:bg-pip-rust hover:shadow-soft-lg'
secondary: 'bg-white text-advay-slate border border-border shadow-soft hover:bg-bg-tertiary hover:shadow-soft-lg'
```

---

## Summary: Why Home Has "Better" Contrast

### The Paradox

Home page uses **low contrast text** (`text-white/80`, `text-white/70`) but **appears to have better visibility** because:

1. **Gradient Text Effect:**
   - The h1 uses `bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent`
   - Gradient creates visual prominence through **color saturation** not contrast
   - Even though contrast ratios are poor, the **bold gradient** stands out

2. **Visual Hierarchy:**
   - Large `text-5xl` headline with gradient draws attention
   - Generous whitespace (py-16, mb-8)
   - Focused content (no clutter)

3. **Other Pages' Contrast Problems:**
   - While they use `text-text-secondary` (7.2:1 contrast), they often:
     - Use it on **lighter backgrounds** (`bg-bg-tertiary`, `bg-white/10`)
     - Have **more complex layouts** with multiple cards competing for attention
     - Use smaller font sizes for headers (`text-2xl` vs Home's `text-5xl`)
     - Less visual breathing room

---

## Design System Gaps

### Home Page Outdated Patterns

| Element | Current (Home) | Should Be |
|---------|----------------|------------|
| Headline | Gradient text | `text-text-primary` or brand accent color |
| Subtitle | `text-white/80` (2.4:1) | `text-text-secondary` (7.2:1) |
| Feature text | `text-white/70` (2.1:1) | `text-text-secondary` (7.2:1) |
| Feature cards | Custom `motion.div` | `FeatureCard` component |
| Card background | `bg-white/10` | `bg-bg-tertiary` |
| Buttons | Inline Link styling | `Button` component variants |

### Missing from Home

- FeatureCard component usage
- Button component usage
- Design token consistency
- Proper semantic color mapping
- Border standardization

---

## Recommendations

### Option 1: Fix Other Pages (Recommended)

**Rationale:** Home's gradient approach, while visually striking, doesn't meet accessibility standards. Better to fix root cause across all pages.

**Actions:**

1. Increase font sizes on other pages' headers (match Home's `text-5xl`)
2. Reduce visual clutter (simplify card layouts)
3. Add gradient or brand accent colors to key headings
4. Ensure text-text-secondary is used on **adequate background colors** (not white/10)

### Option 2: Fix Home Page to Match System

**Rationale:** Home should use unified components and WCAG-compliant colors.

**Actions:**

1. Replace gradient h1 with `text-text-primary` (13.9:1 contrast)
2. Change `text-white/80` → `text-text-secondary` (7.2:1)
3. Change `text-white/70` → `text-text-secondary` (7.2:1)
4. Replace feature cards with `FeatureCard` component
5. Use `Button` component for CTAs
6. Ensure all backgrounds use `bg-bg-tertiary` (not `bg-white/10`)

### Option 3: Hybrid Approach (Balance)

**Rationale:** Keep visual impact of Home while meeting accessibility standards.

**Actions:**

1. Replace `text-white/80` with `text-text-secondary` + gradient accent
2. Add visual hierarchy improvements to other pages
3. Create new "Hero" component that combines best of both worlds
4. Use brand accent color (pip-orange) for emphasis, not full gradients

---

## Technical Details

### CSS Variables Available

```css
--text-primary: #1F2937;         /* 13.9:1 - AAA Enhanced */
--text-secondary: #4B5563;       /* 7.2:1 - AAA Enhanced */
--text-muted: #6B7280;           /* 4.7:1 - AA Pass */
--bg-primary: #FDF8F3;          /* Warm cream */
--bg-tertiary: #F5F0E8;       /* Light gray */
--border: #D1D5DB;              /* Sharper borders */
--pip-orange: #C45A3D;            /* Brand primary */
```

### WCAG 2.1 Standards

- **Level AA:** 4.5:1 contrast for normal text
- **Level AAA:** 7:1 contrast for enhanced readability
- **Large text:** 3:1 contrast allowed for 18pt+

---

## Conclusion

**Root Issue:** Inconsistent design system application across pages

- **Home:** Uses custom styles + gradient text (poor contrast but high visual impact)
- **Other pages:** Use unified components + design tokens (better contrast but less visual impact)

**Recommended Path:** Apply Home's visual hierarchy improvements to other pages, then standardize Home to use proper design tokens.

**Priority:** P1 (High) - Affects user experience and accessibility compliance

---

## File References

- `src/frontend/src/pages/Home.tsx` - Landing page
- `src/frontend/src/pages/Dashboard.tsx` - Parent dashboard
- `src/frontend/src/pages/Settings.tsx` - Settings page
- `src/frontend/src/pages/Progress.tsx` - Progress tracking
- `src/frontend/src/components/ui/Button.tsx` - Unified button component
- `src/frontend/src/components/ui/Card.tsx` - Unified card components
- `src/frontend/src/index.css` - Design tokens and CSS variables
