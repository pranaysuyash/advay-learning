# Vision Stack Architecture: Complete Guide

**Learning for Kids (Advay) - March 18, 2026**

---

## Quick Navigation

This folder contains comprehensive vision stack architecture for the Advay learning app.

### Main Documents (Read in This Order)

1. **[VISION_STACK_ARCHITECTURE_2026-03-18.md](./VISION_STACK_ARCHITECTURE_2026-03-18.md)** ← START HERE
   - **What:** Complete analysis of MediaPipe alternatives based on ChatGPT discussion
   - **Who:** Product managers, architects, decision-makers
   - **Length:** 26 KB, 12 sections
   - **What you'll learn:**
     - Which models to keep (MediaPipe, MoveNet)
     - Which to add when (RF-DETR, MobileSAM, Moondream 2)
     - Which to avoid (YOLO11, FastSAM, Moondream 3)
     - Deployment architecture (hot/warm/cold paths)
     - Licensing & commercial safety
     - 3-phase roadmap (v1, v2, v3)

2. **[IMPLEMENTATION_CHECKLIST_VISION_STACK.md](./IMPLEMENTATION_CHECKLIST_VISION_STACK.md)** ← FOR ENGINEERING
   - **What:** Actionable checklist for implementing vision stack
   - **Who:** Engineers, dev leads
   - **Length:** 12 KB, 5+ sections
   - **What you'll do:**
     - Phase 1 verification (current state)
     - Phase 2 prep (object detection)
     - Phase 3 prep (segmentation + semantic Q&A)
     - Testing framework
     - Deployment checklist

---

## Quick Summary

### What's Optimal Right Now (Phase 1)

**Keep as-is:**
- MediaPipe Hand Landmarker (hand interaction)
- MediaPipe Face Landmarker (face detection + expression)
- MoveNet Lightning (body pose)
- Rule-based gesture detection

**Latency:** ~50-150ms  
**Deployment:** Browser-only (CDN)  
**Licensing:** All Apache-2.0 ✓  
**Games:** Air Tap, Letter Trace, Pose Mimic, Freeze Dance, Smile Games

---

### When to Add (Phase 2 - Probably Q2 2026)

**Add when object detection is critical:**
- Model: RF-DETR Nano (not YOLO, Apache-2.0 licensing)
- Deployment: Local sidecar service
- Latency: 150-300ms (acceptable for "find" games)
- Games: Find Ball, Color Sorting, Count Objects

**Add when multi-person games are core:**
- Model: BlazePose (33-point, multi-person)
- Deployment: Browser (TF.js)
- Latency: 100-150ms
- Games: Parent+Child Mirror

---

### What's Phase 3 (Q3 2026, Deprioritized)

**Only if segmentation games validate:**
- Model: MobileSAM (async, non-blocking)
- Deployment: Local sidecar
- Latency: 300-1500ms (async is OK)
- Games: Cut Stickers, Background Removal

**Only if semantic reasoning validates:**
- Model: Moondream 2 (async)
- Deployment: Local or API
- Latency: 300-1200ms (async is OK)
- Games: "What are you holding?", Visual Q&A

---

### Never Build

❌ **YOLO11 as primary detector**
- AGPL-3.0 licensing = code release or commercial license required
- Alternative: RF-DETR (Apache-2.0, same performance)

❌ **FastSAM for segmentation**
- AGPL-3.0 licensing
- Alternative: MobileSAM (Apache-2.0, 7x faster)

❌ **SAM 2 in hot interaction loop**
- 5B model = 300-500ms+ latency = broken UX
- Use only: Async, non-blocking (sticker creation)

❌ **Moondream 3 Preview**
- BSL 1.1 license = vendor lock-in
- Alternative: Moondream 2 (permissive)

---

## Key Decisions Made

### Architecture Pattern: Layered by Latency

```
HOT PATH (Browser)           WARM PATH (Local Service)    COLD PATH (Async)
<150ms                       150-500ms                    300-1500ms+
├─ MediaPipe Hands           ├─ RF-DETR (objects)         ├─ MobileSAM (masks)
├─ MediaPipe Face            ├─ MobileSAM (segmentation)  ├─ Moondream 2 (semantic)
├─ MoveNet (pose)            └─ Future models             └─ SAM 2 (high-quality)
└─ BlazePose (optional)

DESIGN PRINCIPLE:
Kids' attention span = <300ms
Don't block interaction loop with slow models
Async for non-critical features
```

---

### Licensing Decision: Zero Commercial Risk

**Only use:**
- Apache-2.0 (MediaPipe, MoveNet, BlazePose, RF-DETR, MobileSAM, SAM 2)
- MIT (TensorFlow.js, ONNX Runtime)
- Permissive OSS (Moondream 2)

**Avoid:**
- AGPL-3.0 (Ultralytics YOLO, FastSAM) → requires code release
- BSL 1.1 (Moondream 3) → vendor lock-in

---

## Use Case → Model Mapping

| Feature | Primary Model | Why | Status | Timeline |
|---------|---------------|-----|--------|----------|
| Hand cursor, tapping | MediaPipe Hand | Optimal, browser-native | ✓ Ship | Now |
| Body pose games | MoveNet | Real-time, Apache-2.0 | ✓ Ship | Now |
| Face detection | MediaPipe Face | Expression-rich | ✓ Ship | Now |
| Gesture recognition | Rule-based | No separate model needed | ✓ Ship | Now |
| **Object finding** | **RF-DETR Nano** | **Apache-2.0, not AGPL** | ○ Add | Q2 2026 |
| **Multi-person pose** | **BlazePose** | **If parent+child games validate** | ○ Add | Q2 2026 |
| **Sticker creation** | **MobileSAM** | **Async, non-blocking** | ○ Add | Q3 2026 |
| **Visual Q&A** | **Moondream 2** | **Permissive, semantic reasoning** | ○ Add | Q3 2026 |

---

## What This Means for Your App

### Product Strategy
- **Focus:** Interaction speed + reliability, not model perfection
- **Philosophy:** Simple, fast, fallback-first
- **Kids' UX:** <300ms for anything they feel, >1s OK for async features

### Engineering Roadmap
1. **Phase 1 (Ship Now):** Keep MediaPipe + MoveNet, validate engagement
2. **Phase 2 (Q2):** Add object detection IF games show >70% engagement
3. **Phase 3 (Q3):** Add segmentation + semantic IF those games validate
4. **Never:** Add AGPL models, slow models on hot path, over-engineering

### Team Alignment
- **No licensing risk** if you follow this guidance
- **No licensing drama** from AGPL / BSL models
- **Clean commercial path** (no code release required)

---

## Performance Targets

### Phase 1 (Current)

| Feature | Target Latency | Current | Status |
|---------|-----------------|---------|--------|
| Hand detection | <100ms | ? | ⚠️ Verify |
| Pose detection | <100ms | ? | ⚠️ Verify |
| Face detection | <100ms | ? | ⚠️ Verify |
| Full frame latency | <150ms | ? | ⚠️ Verify |
| FPS | >20 | ? | ⚠️ Verify |

**Action:** Run performance benchmark on iPad + Android tablet.

---

## Testing Framework

### Phase 1 Validation Needed

**Device Testing:**
- [ ] iPad Pro (target device)
- [ ] iPhone 14+ (stretch goal)
- [ ] Android tablet (nice-to-have)
- [ ] Low-light scenario
- [ ] High-light scenario

**Metrics to measure:**
- Latency per frame (target: <150ms)
- FPS (target: >20)
- Memory usage
- CPU usage
- Crashes or hangs

**User testing:**
- 10+ hours with kids (age 3-8)
- Engagement scores per game
- Frustration moments
- Camera failure recovery

---

## Documentation Structure

```
learning_for_kids/docs/
├── VISION_STACK_ARCHITECTURE_2026-03-18.md      ← Main doc
├── IMPLEMENTATION_CHECKLIST_VISION_STACK.md    ← Engineering checklist
├── README_VISION_STACK.md                       ← This file (navigation)
├──
├── [Existing docs]
├── VISION_AI_NATIVE_LEARNING.md
├── VISION_ALIGNED_OPPORTUNITIES.md
├── VISION_COMPLETE_LIFE_LEARNING_MAP.md
└── ... [other project docs]
```

---

## Frequently Asked Questions

### Q: Why not use YOLO?
**A:** AGPL-3.0 license requires you to either:
1. Release your source code publicly, OR
2. Buy commercial license from Ultralytics

For a commercial kids app, that's friction. RF-DETR is Apache-2.0, same performance, no strings attached.

---

### Q: Should I upgrade MediaPipe → Moondream?
**A:** No. These solve different problems:
- **MediaPipe** = real-time landmarks (hands, face, pose)
- **Moondream** = semantic visual reasoning ("what are you holding?")

They're not alternatives, they're complementary.

---

### Q: Can I run everything in the browser?
**A:** Yes for Phase 1 (MediaPipe + MoveNet).  
For Phase 2+ (object detection, segmentation), you'll want a local sidecar service for latency reasons.

---

### Q: What if the camera fails?
**A:** Every feature must have a fallback:
- Hand interaction → touch buttons
- Pose games → quiz mode
- Object finding → picture cards
- Segmentation → pre-made stickers

Document all fallbacks before shipping.

---

### Q: What's the licensing bottom line?
**A:** Use only Apache-2.0 or MIT models. Avoid AGPL and BSL. You're safe.

---

## Next Actions

### For Product Team
1. [ ] Review VISION_STACK_ARCHITECTURE_2026-03-18.md (30 min read)
2. [ ] Confirm Phase 2 priorities (Q2 2026) based on user testing
3. [ ] Plan Phase 3 (Q3 2026) after Phase 2 validation

### For Engineering Team
1. [ ] Read both documents
2. [ ] Run Phase 1 performance benchmark on devices
3. [ ] Create test plan for Phase 2 when ready
4. [ ] Plan sidecar service architecture (Node.js vs Python)

### For Everyone
1. [ ] Confirm no AGPL/BSL models in any experimental code
2. [ ] Document camera failure fallbacks
3. [ ] Measure and log latency per feature in production

---

## Related Documents

**In this folder:**
- VISION_COMPLETE_LIFE_LEARNING_MAP.md (broader strategy)
- GAME_IDEAS_CATALOG.md (game list)
- RESEARCH_COMPLETION_SUMMARY_2026-03-05.md (what's been done)

**In parent project:**
- /Users/pranay/Projects/adhoc_projects/research/edge-models-survey-202603/
  - COMPREHENSIVE_ALL_TIERS_AUDIT_2026-03-18.md (80+ models audit)
  - DEPLOYMENT_GUIDE_ALL_HARDWARE.md (detailed deployment paths)

---

## Document History

| Date | Author | Change |
|------|--------|--------|
| 2026-03-18 | Hermes Agent | Created VISION_STACK_ARCHITECTURE + IMPLEMENTATION_CHECKLIST |
| 2026-03-18 | Hermes Agent | Created this README_VISION_STACK.md navigation doc |

---

## Questions or Feedback?

- **Architecture concerns:** Reference VISION_STACK_ARCHITECTURE_2026-03-18.md Section 10-12
- **Implementation details:** Reference IMPLEMENTATION_CHECKLIST_VISION_STACK.md
- **Model comparisons:** Reference edge-models-survey (parent project) for full 80+ model audit

---

**Last updated:** March 18, 2026  
**Status:** Comprehensive, actionable, ready for engineering  
**Next review:** After Phase 1 performance validation (target: April 2026)
