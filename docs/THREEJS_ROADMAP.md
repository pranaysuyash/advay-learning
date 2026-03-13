# Three.js + Kenney Assets Implementation Roadmap

**Status:** Ready to Start  
**Estimated Timeline:** 4-5 Weeks  
**Assets Available:** 50+ Kenney 3D kits, 1000+ models

---

## Executive Summary

**The Plan:** Rebuild 5 weak games using Three.js + Kenney 3D assets + physics engine

**Why This Works:**
- ✅ Kenney assets are CC0 (free, no attribution needed)
- ✅ Already own complete bundle (3.4.0)
- ✅ GLB format works natively with Three.js
- ✅ Consistent art style across all kits
- ✅ Proven track record (2D assets already integrated in 31 games)

---

## Week-by-Week Roadmap

### Week 1: Foundation & First Game
**Goal:** Get Three.js working with Kenney assets

#### Day 1-2: Setup
```bash
# 1. Install packages
npm install three @react-three/fiber @react-three/drei @react-three/cannon

# 2. Create asset sync script
tools/sync_kenney_3d_assets.sh

# 3. Copy critical assets
- Marble Kit → public/assets/kenney/3d/marble/
- Blocky Characters → public/assets/kenney/3d/characters/
```

**Deliverable:** `ThreeDGameCanvas` component working

#### Day 3-5: DigitalJenga 3D
**Using:** Marble Kit (`straight.glb`)

**Features:**
- 3D tower with real physics
- Block selection with highlight
- Click to remove block
- Tower falls realistically
- Orbit controls for viewing

**Success Criteria:**
- [ ] 48 blocks stack correctly
- [ ] Physics work (blocks fall)
- [ ] 60 FPS on iPad
- [ ] Hand cursor integration

---

### Week 2: Character Game & Polish

#### Day 1-3: DressForWeather 3D
**Using:** Blocky Characters (`character-b.glb`)

**Features:**
- 3D character model
- Clothing texture swapping
- Weather particle effects
- Character reactions to weather

**Technical:**
- Material swapping on character parts
- Texture loading for clothes
- Weather particle systems (rain, snow)

#### Day 4-5: Polish & Performance
- Asset compression (Draco)
- Loading states
- Error boundaries
- Mobile optimization

---

### Week 3: Platformer & Environment

#### Day 1-3: ObstacleCourse 3D
**Using:** Platformer Kit + Blocky Characters

**Features:**
- 3D platformer environment
- Player character with physics
- Jumping between platforms
- Collectibles (coins)
- Hazards (spikes)

**Technical:**
- Keyboard controls (WASD/Arrows)
- Camera following player
- Level generation

#### Day 4: Nature Environment
**Using:** Nature Kit

- Trees, rocks for backgrounds
- Weather-appropriate environments
- Decorative elements

#### Day 5: Integration Testing
- Test all 3 games
- Performance profiling
- Bug fixes

---

### Week 4: Additional Games & Audio

#### Day 1-2: FeedTheMonster 3D
**Using:** Food Kit + Blocky Characters

**Features:**
- 3D monster character
- Physics-based food items
- Feeding animation
- Chewing/satisfaction feedback

#### Day 2-3: VirtualBubbles 3D
**Using:** Custom shaders (no assets needed)

**Features:**
- Shader-based bubbles
- Iridescent effects
- Physics floating
- Particle pop effects

#### Day 4: Audio Integration
**Using:** Kenney Audio Kit

- Impact sounds
- UI sounds
- Success/fail sounds
- Ambient loops

#### Day 5: Final Polish
- Sound effects
- Particle effects
- Transitions
- Screenshots for store

---

### Week 5: Testing & Launch Prep

#### Day 1-2: Device Testing
- iPad testing
- Android tablet testing
- Desktop testing
- Performance profiling

#### Day 3: Bug Fixes
- Fix reported issues
- Optimize slow frames
- Memory leak checks

#### Day 4: Documentation
- Update game docs
- Create asset usage guide
- Performance notes

#### Day 5: Deploy
- Build production
- Deploy to staging
- Final QA

---

## Asset Requirements by Game

### DigitalJenga 3D
```
Marble Kit:
  - straight.glb (48 copies)
  
Audio:
  - block-place.wav
  - block-fall.wav
  - tower-collapse.wav
  
Total Size: ~150 KB
```

### DressForWeather 3D
```
Blocky Characters:
  - character-b.glb (1)
  
Textures (custom):
  - shirt-red.png
  - shirt-blue.png
  - shirt-jacket.png
  - pants-shorts.png
  - pants-pants.png
  
Audio:
  - cloth-rustle.wav
  - success.wav
  
Total Size: ~2 MB
```

### ObstacleCourse 3D
```
Platformer Kit:
  - block-grass-*.glb (10 variants)
  - spike-block.glb
  - coin.glb
  - flag.glb
  
Blocky Characters:
  - character-a.glb
  
Audio:
  - jump.wav
  - coin-collect.wav
  - spike-hit.wav
  
Total Size: ~5 MB
```

### FeedTheMonster 3D
```
Food Kit:
  - apple.glb
  - banana.glb
  - burger.glb
  - pizza.glb
  - (10 food items)
  
Blocky Characters:
  - character-b.glb
  
Audio:
  - eat.wav
  - yum.wav
  
Total Size: ~3 MB
```

### VirtualBubbles 3D
```
No assets needed!
- Custom shaders
- Procedural geometry

Audio:
  - pop.wav
  
Total Size: ~10 KB
```

---

## Technical Architecture

### Project Structure
```
src/frontend/src/
├── components/game/three/
│   ├── ThreeDGameCanvas.tsx      # Base canvas wrapper
│   ├── PhysicsProvider.tsx       # Physics wrapper
│   ├── KenneyAssetLoader.tsx     # Asset loading helper
│   └── KenneyCharacter.tsx       # Character component
├── pages/three/
│   ├── DigitalJenga3D.tsx
│   ├── DressForWeather3D.tsx
│   ├── ObstacleCourse3D.tsx
│   └── FeedTheMonster3D.tsx
├── hooks/
│   ├── useKenneyAsset.ts
│   └── usePhysicsBody.ts
└── utils/
    └── assetSync.ts
```

### Public Assets
```
public/assets/kenney/3d/
├── marble/              # Marble Kit (~150 files)
├── platformer/          # Platformer Kit (~100 files)
├── characters/          # Blocky Characters (18 files)
├── food/                # Food Kit (~80 files)
├── nature/              # Nature Kit (~60 files)
└── audio/               # Kenney Audio
```

---

## Performance Targets

| Metric | Target | Notes |
|--------|--------|-------|
| **FPS** | 60 | On iPad Air (2019+) |
| **Load Time** | <3s | For first 3D game |
| **Bundle Size** | +150KB | Three.js gzipped |
| **Asset Size** | <20MB | All 3D assets total |
| **Memory** | <200MB | Peak usage |

### Optimization Strategies
1. **Draco compression** for all GLBs
2. **Lazy loading** for non-critical assets
3. **InstancedMesh** for repeated objects
4. **Texture atlasing** where possible
5. **Level-of-detail (LOD)** for complex scenes

---

## Risk Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Old iPad performance | High | Auto-fallback to 2D version |
| Asset loading slow | Medium | Preload critical assets, lazy load rest |
| Physics bugs | Medium | Use stable Cannon.js, test extensively |
| Bundle too large | Low | Tree-shaking, code splitting |
| Learning curve | Low | Start with simple games |

### Fallback Strategy
```typescript
// Feature detection
const supportsWebGL = !!window.WebGLRenderingContext;
const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

// Auto-fallback
{supportsWebGL && !isOldDevice ? <DigitalJenga3D /> : <DigitalJenga2D />}
```

---

## Success Metrics

### Quantitative
- [ ] All 5 games run at 60 FPS on target devices
- [ ] Load time <3 seconds
- [ ] Zero critical bugs
- [ ] Lighthouse performance score >90

### Qualitative
- [ ] Games "feel" 3D and physics-based
- [ ] Kids can play without instructions
- [ ] Visuals are clearly improved over 2D
- [ ] Parents notice the upgrade

---

## Additional CC0 Resources

### If Kenney Assets Need Supplementing

| Source | Best For | URL |
|--------|----------|-----|
| **Poly Haven** | HDRIs, textures | polyhaven.com |
| **Quaternius** | Animated characters | quaternius.com |
| **KayKit** | Complete game kits | kaylousberg.itch.io |

### Example: Poly Haven HDRI
```tsx
// Free HDRIs for realistic lighting
<Environment
  files="https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/studio_small_09_1k.hdr"
/>
```

---

## Cost-Benefit Analysis

### Investment
| Item | Cost |
|------|------|
| Development (4 weeks) | $X |
| Testing (1 week) | $X |
| **Total** | **$X** |

### Return
| Benefit | Value |
|---------|-------|
| User engagement ↑ | High |
| App store rating ↑ | Medium |
| Competitive advantage | High |
| Foundation for future 3D games | High |

**ROI:** 6-12 months to recover investment through increased engagement

---

## Next Steps

### To Start Immediately:
1. Run asset sync script
2. Install Three.js packages
3. Create `ThreeDGameCanvas` component
4. Build DigitalJenga 3D proof-of-concept

### Decision Needed:
- [ ] **APPROVED** - Start full 4-week implementation
- [ ] **PILOT** - Build only DigitalJenga 3D first (1 week)
- [ ] **DEFERRED** - Park for later, focus on other priorities

---

## Appendices

### A. Complete Kenney 3D Kit List
See `KENNEY_ASSET_CATALOG.md` for full listing

### B. Three.js Implementation Code
See `THREEJS_IMPLEMENTATION_GUIDE.md` for code examples

### C. Asset Sync Script
See `tools/sync_kenney_3d_assets.sh`

### D. Performance Monitoring
```typescript
// Add to each 3D game
useEffect(() => {
  const monitor = new Stats();
  monitor.showPanel(0);
  document.body.appendChild(monitor.dom);
  
  return () => document.body.removeChild(monitor.dom);
}, []);
```

---

**Ready to build something amazing! 🚀**

*Roadmap created: 2026-03-10*  
*Author: Development Team*
