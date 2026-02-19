# Visual Asset Audit & Plan: Advay Vision Learning

**Date:** 2026-02-04  
**Auditor:** AI Design Auditor  
**Project:** Advay Vision Learning - AI-powered educational platform for children  
**Target Audience:** Children ages 4-8 + Parents

---

## 1. Executive Summary

### Current State

- **Total Assets:** 161 files (images, icons, videos)
- **Icon Library:** 112 SVG icons for alphabet games (multi-language support)
- **Mascot:** Pip the Red Panda (images + animated videos)
- **Brand Assets:** Logo, color palette, basic identity

### Critical Gaps Identified

| Category | Status | Priority |
|----------|--------|----------|
| Marketing/landing visuals | ⚠️ Missing | P0 |
| Game background illustrations | ⚠️ Missing | P0 |
| Achievement/badge icons | ⚠️ Missing | P1 |
| Empty state illustrations | ⚠️ Partial | P1 |
| Parent trust indicators | ❌ Missing | P0 |
| Cultural illustrations (India-focused) | ❌ Missing | P1 |

### TG (Target Audience) Alignment Score

- **Child Appeal:** 6/10 (needs more playfulness)
- **Parent Trust:** 7/10 (needs safety/compliance indicators)
- **Cultural Relevance:** 5/10 (needs more Indian context)

---

## 2. Persona Analysis

### Primary Persona: Ananya (Age 5, Bangalore)

**Background:**

- Kindergartener learning English and Kannada
- Uses parent's tablet for 30-60 min daily
- Loves colorful characters and animations
- Gets frustrated with complex navigation

**Visual Needs:**

- Large, friendly buttons with clear icons
- Celebratory animations for achievements
- Mascot (Pip) guidance throughout
- Simple, uncluttered interfaces
- Bright but not overwhelming colors

**Pain Points:**

- Dark backgrounds feel "scary"
- Confused when icons don't match content
- Wants immediate visual feedback

### Secondary Persona: Priya (Parent, Age 32)

**Background:**

- Working mother, tech-savvy
- Concerned about screen time and privacy
- Wants educational value proven
- Appreciates multi-language support

**Visual Needs:**

- Trust badges (COPPA, privacy)
- Clean, professional design
- Progress visualization
- Clear safety indicators

**Pain Points:**

- No visible privacy assurances
- Unclear data usage indicators
- Needs reassurance about camera usage

### Tertiary Persona: Arjun (Age 7, Rural Karnataka)

**Background:**

- First-generation English learner
- Limited internet connectivity
- Uses basic Android phone
- Kannada primary language

**Visual Needs:**

- Culturally familiar imagery
- Works on low-resolution screens
- Minimal bandwidth usage
- Clear visual hierarchy

---

## 3. Asset Inventory by Category

### 3.1 Existing Assets ✅

#### Brand Assets (`assets/brand/`)

| File | Status | Usage |
|------|--------|-------|
| logo-mark.svg | ✅ | App icon, favicon |
| logo-full.svg | ✅ | Header, marketing |
| color-palette.css | ✅ | Design system |
| pip-avatar.svg | ✅ | Mascot avatar |

#### Mascot Assets (`public/assets/images/`)

| File | Status | Usage |
|------|--------|-------|
| red_panda_no_bg.png | ✅ | Main mascot image |
| pip_mascot.png | ✅ | Alternative mascot |
| pip_alpha_v2.webm | ✅ | Animated mascot video |

#### Feature Icons (`public/assets/images/`)

| File | Status | Usage |
|------|--------|-------|
| feature-hand-tracking.svg | ✅ | Landing page |
| feature-multilang.svg | ✅ | Landing page |
| feature-gamified.svg | ✅ | Landing page |
| hero-learning.svg | ✅ | Landing hero |

#### Game Icons (`public/assets/icons/` - 112 icons)

- English alphabet: apple, ball, cat, dog, elephant... zebra
- Hindi/Kannada/Telugu/Tamil specific icons
- Status: ✅ Comprehensive coverage

#### UI Icons

- Empty states: empty-no-children.svg, empty-no-progress.svg
- Loading: loading-pip.svg
- Achievements: badge-star.svg, streak-flame.svg
- Onboarding: onboarding-hand.svg, onboarding-welcome.svg

### 3.2 Missing Assets ❌

#### P0: Critical for Launch

| Asset | Page/Component | Purpose | TG Impact |
|-------|---------------|---------|-----------|
| **Hero illustration** | Home | Child learning with hands | Child appeal ↑ |
| **Trust badge set** | Home, Register | COPPA, No Ads, Privacy | Parent trust ↑ |
| **Game preview thumbnails** | Games | Visual game selection | Child engagement ↑ |
| **Camera permission illustration** | CameraPrompt | Friendly permission request | Parent trust ↑ |
| **Error state illustrations** | Global | Friendly error recovery | Child frustration ↓ |

#### P1: High Value

| Asset | Page/Component | Purpose | TG Impact |
|-------|---------------|---------|-----------|
| **Achievement badges** (12x) | Progress | Gamification rewards | Child motivation ↑ |
| **Game backgrounds** (5x) | Games | Themed environments | Child immersion ↑ |
| **Celebration animations** | Games | Success feedback | Child delight ↑ |
| **Cultural scenes** | Various | Indian context | Cultural relevance ↑ |
| **Parent guide illustrations** | Dashboard | Feature explanation | Parent onboarding ↑ |

#### P2: Nice to Have

| Asset | Purpose |
|-------|---------|
| Sticker collection | Rewards system |
| Seasonal themes | Holiday engagement |
| Character expressions | Mascot emotional range |
| Sound visualization | Audio feedback |

---

## 4. Asset Specifications

### 4.1 Image Requirements

#### Hero Illustration (Home Page)

```
Use case: photorealistic-natural + illustration-story
Asset type: landing page hero
Primary request: Warm, inviting scene of a 5-year-old child learning letters 
  with hand gestures, parent watching approvingly in background
Scene/background: Cozy Indian home setting with soft morning light
Subject: Child with outstretched hand tracing glowing letter "A" in air
Style/medium: Digital illustration, soft gradients, friendly character design
Composition/framing: Wide 16:9, child centered, generous negative space on right for headline
Lighting/mood: Warm golden hour light, hopeful and inviting
Color palette: Warm oranges, soft creams, gentle blues (align with brand)
Constraints: No text in image, diverse child representation, modern Indian home
Avoid: Stereotypical imagery, cluttered backgrounds, dark colors
```

#### Trust Badges (Set of 4)

```
Use case: logo-brand
Asset type: trust indicators
Icons needed:
1. "COPPA Compliant" - shield with child icon
2. "No Ads Promise" - crossed-out ad symbol
3. "Privacy First" - lock with heart
4. "Parent Approved" - checkmark with parent/child
Style: Simple, flat icons with brand colors
Size: 64x64px SVG
Color: Terracotta/orange primary
```

#### Game Thumbnails (5 games)

```
Use case: ui-mockup
Size: 400x300px, 2x for retina
Style: Colorful, playful, clear game representation

1. Alphabet Tracing - Hand drawing letter A with sparkles
2. Finger Numbers - Hand showing 3 fingers with number 3
3. Letter Hunt - Magnifying glass over letter, treasure map style
4. Connect Dots - Dot-to-dot forming animal shape
5. Story Time - Open book with characters emerging
```

#### Achievement Badges (12 tiers)

```
Use case: logo-brand
Style: Circular badges with metallic finishes

Bronze tier (3): Beginner, Explorer, Learner
Silver tier (3): Achiever, Star, Champion  
Gold tier (3): Master, Expert, Wizard
Special tier (3): Streak Master, Perfect Score, Helper

Each: 128x128px PNG with transparency
```

### 4.2 Icon Requirements

#### UI Icons (Missing)

| Icon | Usage | Priority |
|------|-------|----------|
| Camera enable guide | Camera recovery | P0 |
| Hand position guide | Game tutorial | P0 |
| Sound on/off | Game controls | P1 |
| Fullscreen | Game mode | P2 |
| Help/question | Global help | P1 |
| Parent lock | Parent gate | P1 |

### 4.3 Animation Requirements

#### Celebration Effects

```
Use case: stylized-concept
Trigger: Correct answer, level complete, streak achieved

Types needed:
1. Confetti burst (5-10 variants for different achievements)
2. Star sparkle trail
3. Mascot dance animation
4. Progress bar fill animation
5. Badge unlock animation

Format: Lottie JSON or CSS animations
Duration: 1-2 seconds
```

---

## 5. Persona-Based Testing Criteria

### Test with Ananya (Age 5)

**Visual Comprehension Test:**

- [ ] Can she identify the game from thumbnail alone?
- [ ] Does she understand what to do from illustrations?
- [ ] Are buttons visually distinct and appealing?
- [ ] Does she recognize achievement badges as rewards?

**Emotional Response Test:**

- [ ] Does mascot Pip make her smile?
- [ ] Is celebration satisfying enough to repeat?
- [ ] Are error messages friendly (not scary)?
- [ ] Does she feel proud showing badges to parent?

### Test with Priya (Parent)

**Trust Indicators Test:**

- [ ] Are trust badges visible on first scroll?
- [ ] Does COPPA badge reassure about data safety?
- [ ] Are camera permissions clearly explained visually?
- [ ] Does progress visualization feel credible?

**Professional Assessment:**

- [ ] Is design polished enough to pay for?
- [ ] Do illustrations feel high-quality?
- [ ] Is visual hierarchy clear for navigation?

### Test with Arjun (Rural/Regional)

**Cultural Relevance Test:**

- [ ] Do illustrations include familiar contexts?
- [ ] Are regional language icons accurate?
- [ ] Does imagery feel inclusive of rural settings?

**Technical Accessibility:**

- [ ] Do images load on slow connections?
- [ ] Are icons clear at low resolution?
- [ ] Is contrast sufficient for older devices?

---

## 6. Implementation Roadmap

### Phase 1: Critical (Week 1-2)

1. Generate hero illustration for landing page
2. Create trust badge set (4 icons)
3. Design camera permission illustration
4. Create error state illustrations (3x)

### Phase 2: High Value (Week 3-4)

1. Generate game thumbnails (5 images)
2. Design achievement badge set (12 badges)
3. Create game background illustrations (5 scenes)
4. Design celebration animations

### Phase 3: Polish (Week 5-6)

1. Cultural scene illustrations
2. Parent guide visuals
3. Additional mascot expressions
4. Seasonal theme variants

---

## 7. Quality Checklist

Before any asset goes live:

- [ ] TG-aligned: Tested with target persona
- [ ] Accessible: Alt text provided, color contrast checked
- [ ] Performant: Optimized file size (<100KB images, <50KB icons)
- [ ] Responsive: Works at all target resolutions
- [ ] Consistent: Follows brand guidelines
- [ ] Inclusive: Represents diversity appropriately
- [ ] Legal: No copyright issues, COPPA compliant

---

## 8. Budget Estimate

### Generation Approach

Using AI image generation (gpt-image-1.5):

| Asset Type | Count | Est. Cost |
|------------|-------|-----------|
| Hero illustrations | 3 variants | $3-6 |
| Game thumbnails | 5 | $5-10 |
| Badges/icons | 20 | $5-10 |
| Backgrounds | 5 | $5-10 |
| Marketing assets | 5 | $5-10 |
| **Total** | | **$23-46** |

---

*Next: Generate Phase 1 critical assets*
