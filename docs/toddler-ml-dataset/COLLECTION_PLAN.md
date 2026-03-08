# ML Training Data Collection Plan
## Using Subject: [Your Toddler's Name] | Age: 2yr 9mo | Date Created: 2026-03-07

---

## Overview

This document outlines a plan to collect authentic ML training data using our own child as the primary subject. This is a practical approach to:

1. Improve hand/face/pose recognition for young children (ages 2-4)
2. Understand real toddler interaction patterns
3. Identify gaps between "designed for kids" vs "actually works for kids"
4. Build a labeled dataset for future ML improvements

**Why this works:** At 2 years 9 months, our child represents the exact target demographic (Age Band A: 2-3 years). Data from adults or older children doesn't capture the unique characteristics of toddler movement, hand size, attention span, and interaction patterns.

---

## Subject Profile

| Attribute | Value | Notes |
|-----------|-------|-------|
| Age | 2 years 9 months | Mid-range of Band A (2-3) |
| Hand size | Small | ~8cm palm width (typical for age) |
| Movement style | Jerky/unpredictable | Normal for toddler motor development |
| Attention span | 2-5 minutes | Game session length ceiling |
| Primary interaction | Touch + hand gestures | Camera tracking experience level: beginner |

---

## Data Types to Collect

### 1. Hand Tracking Data

**MediaPipe: Hand Landmarks (21 points)**
```
- Collection method: MediaPipe Hands via webcam
- Frame rate: 30fps
- Data per frame:
  - 21 3D landmarks (x, y, z normalized)
  - handedness (left/right)
  - confidence score
```

**Specific scenarios:**
- Open palm vs closed fist vs pointing
- Reaching for objects
- Grabbing/moving side to side
- Waving hello/goodbye
- Counting on fingers (1-5)
- Pinching small objects

**Why it matters:** Toddler hands are smaller, fingers less defined. MediaPipe may struggle with:
- Detecting small hands
- Distinguishing thumb from fingers
- Tracking fast jerky movements

### 2. Face Tracking Data

**MediaPipe: Face Mesh (468 landmarks)**
```
- Collection method: MediaPipe Face Mesh via webcam
- Data per frame:
  - 468 3D landmarks
  - facial expressions (if detectable)
  - face rotation/position
  - confidence score
```

**Specific scenarios:**
- Looking at screen vs looking away
- Happy/excited reactions
- Confused/frustrated reactions
- Looking at parent for help
- Yawning (fatigue detection)

**Why it matters:** Toddler faces have different proportions. Expression recognition may need calibration for:
- Exaggerated expressions
- Quick mood changes
- Partially visible faces (looking down)

### 3. Pose Tracking Data

**MediaPipe: Pose (33 landmarks)**
```
- Collection method: MediaPipe Pose via webcam (full body if camera distance allows)
- Data per frame:
  - 33 3D landmarks
  - pose visibility
  - confidence score
```

**Specific scenarios:**
- Sitting vs standing
- Leaning forward (engaged) vs back (disengaged)
- Jumping/clapping
- Pointing at screen
- Reaching toward camera

**Why it matters:** Toddler poses are less standardized:
- May not hold "stable pose" long
- Proportions different (larger head, shorter limbs)
- More movement/variation

---

## Games/Scenarios to Capture

### Priority 1: Core Interaction Games (Week 1-2)

| Game | What to Capture | Expected Sessions |
|------|-----------------|------------------|
| **Counting Collect-a-thon** | Hand tracking, reach gestures | 5-10 sessions |
| **Finger Counting** | Hand landmarks, finger poses | 5-10 sessions |
| **Bubble Pop** | Hand movement, reach patterns | 5-10 sessions |
| **Free Draw** | Drawing gestures, hand control | 5-10 sessions |

### Priority 2: Active Movement Games (Week 3-4)

| Game | What to Capture | Expected Sessions |
|------|-----------------|------------------|
| **Freeze Dance** | Full body pose, movement | 3-5 sessions |
| **Yoga Animals** | Pose matching, body position | 3-5 sessions |
| **Simon Says** | Pose copying, reaction time | 3-5 sessions |
| **Balloon Pop Fitness** | Hand tracking, rapid movement | 3-5 sessions |

### Priority 3: Edge Cases (Week 5+)

| Scenario | What to Capture | Notes |
|----------|-----------------|-------|
| Multiple faces in frame | Parent joins, face separation | |
| Partial visibility | Toddler looks away, moves | Tracking recovery |
| Poor lighting | Evening play, shadows | Robustness testing |
| Multiple hands | Both hands, sibling joins | |

---

## Collection Methodology

### Setup

```
Hardware:
- Webcam: Logitech C920 (or similar 720p+)
- Position: Laptop on table, ~60cm from subject
- Lighting: Natural daylight preferred, supplement with soft lamp

Software:
- Custom recording app (see below)
- MediaPipe for real-time visualization
- Local storage (no cloud upload)
```

### Recording App Requirements

Create a simple React component that:
1. Shows webcam feed with MediaPipe overlays
2. Records video + landmark JSON simultaneously
3. Allows tagging events ("success", "frustrated", "help wanted")
4. Stores locally in `~/ml_data/[date]/[session]/`

```
Data directory structure:
~/ml_data/
  └── 2026-03-07/
      └── session-01/
          ├── video.mp4
          ├── hand_landmarks.jsonl   # One JSON per frame
          ├── face_landmarks.jsonl
          ├── pose_landmarks.jsonl
          └── events.json           # Tagged moments
```

### Session Protocol

1. **Pre-session** (2 min)
   - Calibrate camera position
   - Ensure good lighting
   - Explain task to toddler (keep it fun!)

2. **During session** (5-15 min)
   - Let toddler play naturally
   - Parent tags notable moments (voice or button)
   - Take breaks every 3-5 minutes

3. **Post-session** (2 min)
   - Note any issues observed
   - Label overall session mood (happy/frustrated/neutral)
   - Backup to secure location

---

## Labeling Schema

### Event Tags

```typescript
interface MLTrainingEvent {
  timestamp: number;        // milliseconds since start
  event_type: 
    | 'success'           // Completed task correctly
    | 'error'             // Wrong action
    | 'help_needed'       // Looked at parent
    | 'frustrated'        // Showed frustration
    | 'engaged'           // Leaning in, focused
    | 'disengaged'        // Looking away, restless
    | 'tracking_lost'     // MediaPipe failed to track
    | 'fallback_used';    // Switched to touch/mouse
  game_id: string;
  round_number?: number;
  notes?: string;
}
```

### Quality Annotations

For each recorded frame, annotate:
- `tracking_quality`: good | acceptable | poor
- ` occlusion`: none | partial | full
- ` lighting`: good | dim | harsh
- ` motion_blur`: none | slight | significant

---

## Privacy & Consent

### Consent Documentation

Since this is our own child, we document consent:

```markdown
**Data Collection Consent**

I, [Parent Name], consent to collecting ML training data from my child [Child Name], age 2 years 9 months, for the purpose of improving hand/face/pose recognition for young children in the Advay Vision Learning app.

- Data will be stored locally only
- Data will be used for ML model training
- I can withdraw consent at any time
- All data will be deleted upon request

Date: [Date]
Signature: [Parent]
```

### Data Handling Rules

1. **Local only**: Never upload raw video to cloud
2. **Encrypted storage**: Use BitLocker/FileVault
3. **No sharing**: Don't share raw data publicly
4. **Delete on request**: Remove all data if uncomfortable
5. **Purpose limitation**: Use only for stated ML training

---

## ML Model Improvements Expected

### Short-term (Collection + Training)

| Issue | Current Behavior | Desired Behavior | Priority |
|-------|------------------|-------------------|----------|
| Small hand detection | May miss | Detect toddler hands reliably | High |
| Fast movement | Jittery tracking | Smooth interpolation | High |
| Face angle | Loses tracking at >45° | Track at wider angles | Medium |
| Expression recognition | Adult-trained | Calibrated for toddler | Low |

### Medium-term (Model Retraining)

1. **Fine-tune MediaPipe models** on toddler data
2. **Add age-specific thresholds** for:
   - Minimum hand size
   - Maximum velocity for "stable" detection
   - Attention detection (looking at screen)
3. **Create toddler pose classifier** for:
   - "Engaged" vs "disengaged"
   - "Help needed" signals

---

## Next Steps

### Immediate Actions

1. [ ] Set up recording app (create in `tools/`)
2. [ ] Run first recording session with Counting Collect-a-thon
3. [ ] Review initial data quality
4. [ ] Adjust camera/lighting as needed

### Files to Create

| File | Purpose |
|------|---------|
| `tools/toddler-data-collector/index.html` | Simple recording UI |
| `tools/toddler-data-collector/README.md` | Usage instructions |
| `docs/toddler-ml-dataset/README.md` | Dataset documentation |

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Toddler won't cooperate | Keep sessions short (3-5 min), make it fun |
| Poor data quality | Iterate on setup before full sessions |
| Overfitting to one child | Plan to expand to other toddlers later |
| Privacy concerns | Strict local-only storage, documented consent |

---

**Last Updated**: 2026-03-07
**Status**: In Progress
**Owner**: [Pranay - Parent/Developer]
