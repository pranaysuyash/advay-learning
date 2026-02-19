# Advay — Unified Brand Kit

> Complete brand system: **Advay** (the platform) + **Pip** (the companion)

---

## Quick Reference

| Element | Details |
|---------|---------|
| **Product Name** | Advay |
| **Full Meaning** | Active Discovery Vision AI for Youth |
| **Sanskrit** | अद्वय — "Unique / One of a kind" |
| **Mascot** | Pip the Red Panda |
| **Pip Means** | Playful Interactive Partner |
| **Tagline** | "Learn with Your Hands" |

---

## Brand Architecture (Dual System)

### Advay — The Platform

- **Represents**: Technology, Education, Trust
- **Audience**: Parents, Investors, Schools
- **Tone**: Smart, Advanced, Caring
- **Color**: Advay Slate `#2D3748`

### Pip — The Companion  

- **Represents**: Fun, Friendship, Engagement
- **Audience**: Kids ages 3-8
- **Tone**: Playful, Encouraging, Concrete
- **Color**: Pip Orange `#E85D04`

---

## Color Palette

### Primary Brand Colors

| Token | Hex | RGB | Usage |
|-------|-----|-----|-------|
| **Pip Orange** | `#E85D04` | 232, 93, 4 | Primary CTAs, Pip branding |
| **Advay Slate** | `#2D3748` | 45, 55, 72 | Text, tech elements, wordmark |

### Supporting Colors

| Token | Hex | Usage |
|-------|-----|-------|
| **Discovery Cream** | `#FFF8F0` | Backgrounds, cards |
| **Vision Blue** | `#3B82F6` | AI features, links, secondary |
| **Success Sage** | `#81B29A` | Success states, progress |
| **Warm Sand** | `#F5F0E8` | Section backgrounds |

### Extended Palette (From Existing System)

| Token | Hex | Usage |
|-------|-----|-------|
| **Terracotta** | `#E07A5F` | Alternative primary, softer |
| **Sky Blue** | `#7EB5D6` | Secondary buttons, calm elements |
| **Sunny Yellow** | `#F2CC8F` | Highlights, rewards, achievements |
| **Mascot Orange** | `#F26C22` | Pip illustrations, lighter |
| **Mascot Rust** | `#D4561C` | Pip shadows, depth |
| **Mascot Cream** | `#FFF8F0` | Pip belly, highlights |

### Usage Patterns

```css
/* Primary Action */
background: #E85D04;
color: white;

/* Secondary Action */
background: transparent;
border: 2px solid #3B82F6;
color: #3B82F6;

/* Background */
background: #FFF8F0;
color: #2D3748;

/* Success */
background: #81B29A;
color: white;
```

---

## Typography

### Font Family: Nunito

```css
font-family: 'Nunito', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
```

### Type Scale

| Element | Size | Weight | Line Height |
|---------|------|--------|-------------|
| **Display** | 3rem (48px) | 800 | 1.1 |
| **H1** | 2.5rem (40px) | 800 | 1.2 |
| **H2** | 2rem (32px) | 700 | 1.2 |
| **H3** | 1.5rem (24px) | 700 | 1.3 |
| **Body** | 1.125rem (18px) | 600 | 1.6 |
| **Small** | 0.875rem (14px) | 600 | 1.5 |
| **Caption** | 0.75rem (12px) | 700 | 1.4 |

### Contextual Usage

- **Children's UI**: Weights 700-800, larger sizes (H2 minimum)
- **Parent UI**: Weights 400-600, comfortable reading sizes
- **Buttons**: 700 weight, 1rem size

---

## Logo System

### Primary Logo

**Advay wordmark** with optional Pip icon

```
[Paw icon] ADVAY
```

### Logo Variants

| Variant | Usage |
|---------|-------|
| **Full Lockup** | Homepage, pitch decks |
| **Wordmark Only** | Documents, parent content |
| **Pip Avatar** | Child UI, onboarding |
| **Paw Mark** | Favicon, app icon, loading |

### Clear Space

Minimum clear space = 1x paw diameter around logo mark.

### Minimum Sizes

- **Digital**: 24px height
- **Print**: 0.5 inch height

---

## Spacing System

### Base Unit: 4px

| Token | Value | Usage |
|-------|-------|-------|
| **xs** | 4px | Tight spacing, icon gaps |
| **sm** | 8px | Component internal |
| **md** | 16px | Default padding |
| **lg** | 24px | Card padding |
| **xl** | 32px | Section gaps |
| **2xl** | 48px | Hero padding |

### Component Spacing

- **Buttons**: 12px 24px padding
- **Cards**: 24px padding
- **Section**: 48px vertical, 24px horizontal

---

## Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| **sm** | 8px | Buttons, badges |
| **md** | 12px | Inputs, small cards |
| **lg** | 16px | Cards |
| **xl** | 24px | Feature cards |
| **full** | 9999px | Pills, avatars |

### Contextual Patterns

- **Child UI**: lg to xl (friendly, approachable)
- **Parent UI**: md to lg (professional, warm)
- **Game Elements**: full (buttons, rewards)

---

## Shadows

| Token | Value | Usage |
|-------|-------|-------|
| **sm** | `0 1px 2px rgba(45,55,72,0.08)` | Subtle elevation |
| **md** | `0 4px 6px rgba(45,55,72,0.08)` | Cards, buttons |
| **lg** | `0 10px 20px rgba(45,55,72,0.12)` | Modals |
| **glow** | `0 0 20px rgba(232,93,4,0.3)` | Primary hover |

---

## Button Styles

### Primary (Pip Orange)

```css
background: #E85D04;
color: white;
padding: 12px 24px;
border-radius: 16px;
font-weight: 700;
box-shadow: 0 4px 6px rgba(232,93,4,0.3);

/* Hover */
background: #D4561C;
transform: translateY(-2px);
box-shadow: 0 6px 12px rgba(232,93,4,0.4);
```

### Secondary (Vision Blue)

```css
background: transparent;
border: 2px solid #3B82F6;
color: #3B82F6;
padding: 12px 24px;
border-radius: 16px;
font-weight: 700;

/* Hover */
background: rgba(59,130,246,0.1);
```

### Game Button (Yellow Pill)

```css
background: #F2CC8F;
color: #2D3748;
padding: 16px 32px;
border-radius: 9999px;
font-weight: 800;
font-size: 18px;
box-shadow: 0 6px 0 #E5B86E;

/* Press */
transform: translateY(6px);
box-shadow: 0 0 0 #E5B86E;
```

---

## Card Styles

### Standard Card

```css
background: white;
border-radius: 24px;
padding: 24px;
box-shadow: 0 4px 6px rgba(45,55,72,0.08);
```

### Game Card

```css
background: #FFF8F0;
border-radius: 24px;
padding: 32px;
border: 3px solid #F2CC8F;
box-shadow: 0 8px 0 #E5B86E;
```

---

## Voice & Tone

### For Children (Pip's Voice)

**DO:**

- Short, concrete instructions: "Show me your hand"
- Action-first: "Wave like me!"
- Concrete praise: "You traced the A!"
- One instruction at a time

**DON'T:**

- Baby talk
- Long sentences
- Generic praise ("Amazing!")
- Too many exclamation points

**Example:**

- Good: "Draw a circle. Great! Now try the letter B."
- Bad: "Let's have so much fun learning together!!!"

### For Parents (Advay's Voice)

- Clear benefits: "Track progress in real-time"
- Trust signals: "COPPA compliant, no video storage"
- Educational value: "Research-based curriculum"
- Supportive: "At their own pace"

---

## Implementation Files

| File | Purpose |
|------|---------|
| `docs/BRAND_NAMING_EXPLORATION.md` | Naming journey & options |
| `docs/BRAND_ARCHITECTURE_COMPLETE.md` | Dual-brand system details |
| `docs/BRAND_KIT_UNIFIED.md` | This file — visual system |
| `assets/brand/` | SVG logos, color CSS |
| `src/index.css` | CSS variables |
| `tailwind.config.js` | Tailwind tokens |

---

## Related Documents

- **Naming**: See `BRAND_NAMING_EXPLORATION.md`
- **Architecture**: See `BRAND_ARCHITECTURE_COMPLETE.md`
- **Mascot Assets**: `/assets/images/pip_mascot.png`
- **Icon System**: `/assets/icons/*.svg`

---

**Version**: 1.1 Unified  
**Last Updated**: 2026-01-30  
**Status**: Brand system complete
