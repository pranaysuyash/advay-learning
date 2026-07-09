# Game Specifications & Audit Documentation

**Project:** Advay Vision Learning Platform  
**Total Games:** 148 across 12 worlds  
**Last Updated:** 2026-07-09

---

## 📋 Quick Links

| Document | Purpose | Status |
|----------|---------|--------|
| [GAME_INDEX.md](./GAME_INDEX.md) | Complete inventory of all 148 games | ⚠️ Needs Refresh |
| [SHARED_PATTERNS.md](./SHARED_PATTERNS.md) | Cross-game pattern analysis | ✅ Complete |
| [3D_WORLD_PATTERNS.md](./3D_WORLD_PATTERNS.md) | 3D games technical guide | ✅ Complete |
| [SPEC_TEMPLATE.md](./SPEC_TEMPLATE.md) | 23-section spec template | ✅ Complete |
| [PHASE2_PLAN.md](./PHASE2_PLAN.md) | Phase 2 execution plan | ✅ Complete |
| [CV_REGISTRY_AUDIT_2026-07-08.md](../audit/CV_REGISTRY_AUDIT_2026-07-08.md) | CV compliance audit | ✅ Current |

---

## 🎮 Current Registry State (2026-07-09)

139 games are listed and have functional CV integration; 9 games are unlisted (backlog, no CV wiring yet). See the [CV Registry Audit](../audit/CV_REGISTRY_AUDIT_2026-07-08.md) for the full breakdown.

| Metric | Value |
|--------|-------|
| Total games | 148 |
| Listed (visible to players) | 139 |
| Unlisted (backlog, no CV) | 9 |
| With explicit `cv` declaration | 136 |
| Relying on factory default `cv: ['hand']` | 3 |
| Missing `cv` mode | 0 |
| CV/implementation mismatches | 0 |
| Egg reward entries (nested, not standalone) | 52 |

### CV Mode Distribution

| CV Mode | Games |
|---------|-------|
| Hand tracking | 136 |
| Pose tracking | 10 |
| Face tracking | 2 |
| Voice control | 1 |

---

## 📁 File Structure

```
docs/games/
├── README.md                    # This file
├── GAME_INDEX.md               # 148-game inventory (needs refresh)
├── SHARED_PATTERNS.md          # Cross-game analysis
├── 3D_WORLD_PATTERNS.md        # 3D technical guide
├── SPEC_TEMPLATE.md            # 23-section template
├── PHASE2_PLAN.md              # Execution plan
└── specs/                      # Individual game specs (35 files)
    ├── alphabet-tracing.md
    ├── digital-jenga.md
    ├── emoji-match.md
    ...
```

---

## 🔗 Related Documentation

- [CV_CONTROLS_IMPLEMENTATION_GUIDE_2026-03-14.md](../CV_CONTROLS_IMPLEMENTATION_GUIDE_2026-03-14.md)
- [docs/audit/CV_REGISTRY_AUDIT_2026-07-08.md](../audit/CV_REGISTRY_AUDIT_2026-07-08.md)
- [docs/audit/CONTROL_MODE_AUDIT_2026-03-12.md](../audit/CONTROL_MODE_AUDIT_2026-03-12.md)
- [src/frontend/src/data/gameRegistry.ts](../../src/frontend/src/data/gameRegistry.ts)

---

**Maintainer:** Game Audit Team  
**Update Frequency:** Per-session  
**Next Review:** After Phase 3 completion
