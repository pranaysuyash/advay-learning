# Kids Learning Games - Analysis Tools

This directory contains reusable tools for analyzing and improving kids learning games, particularly for UI/UX testing and quality assurance.

---

## 🧰 Kenney Asset Sync Tool

**Purpose:** Synchronize Kenney `New Platformer Pack` assets from the local purchased Kenney bundle into the frontend canonical asset path.

**File:** `tools/sync_kenney_platformer_assets.sh`

### Why this exists

- Avoid manual copy mistakes and partial imports.
- Keep one canonical runtime path: `src/frontend/public/assets/kenney/platformer`.
- Make future pack refreshes repeatable from the purchased local Kenney bundle.
- Ensure agents check the in-project runtime asset folder first before importing new files.

### Usage

```bash
# From repo root (uses default source + destination)
tools/sync_kenney_platformer_assets.sh

# Or pass explicit source and destination
tools/sync_kenney_platformer_assets.sh \
  "/Users/pranay/Projects/adhoc_resources/Kenney Game Assets All-in-1 3.4.0/2D assets/New Platformer Pack" \
  src/frontend/public/assets/kenney/platformer
```

### Source of truth

1. Check whether the required file already exists under `src/frontend/public/assets/kenney/`.
2. If it does not, source it from `/Users/pranay/Projects/adhoc_resources/Kenney Game Assets All-in-1 3.4.0`.
3. For platformer assets, use this sync tool instead of hand-copying individual files.

### What it syncs

- `characters/*.png`
- `enemies/*.png`
- `tiles/*.png`
- `backgrounds/*.png`
- `sounds/*.ogg`
- `spritesheet-backgrounds-default.png`
- curated `collectibles` + `hud` files needed by runtime code

---

## 🎯 Hand Tracking Latency Analyzer ⭐ PRIMARY TOOL

**Purpose:** Measure MediaPipe hand-tracking accuracy by comparing actual hand position to on-screen pointer/cursor position to detect coordinate system bugs.

**File:** `hand_tracking_latency_analyzer.py`

### Why This Tool is Critical

**The Real Issue:** Most tracking problems aren't missing MediaPipe data, but **coordinate mapping bugs** where hand coordinates don't properly map to screen coordinates.

**Example Discovery:** Found 2000+ pixel offset between hand position and pointer position in Emoji Match game - MediaPipe was working, but coordinate transformation was completely broken.

### Features

- **Hand Detection:** Skin-tone based hand region detection
- **Pointer Detection:** Red color detection for on-screen cursor/pointer
- **Distance Analysis:** Measures pixel distance between hand and pointer
- **Movement Tracking:** Analyzes natural movement patterns
- **Lag Measurement:** Calculates response time delays

### Usage

```bash
# Activate project venv first
source .venv/bin/activate

# Run comprehensive latency analysis
python3 tools/hand_tracking_latency_analyzer.py tools/emoji_match.mov tools/latency_report.json

# Results include:
# - Average hand-pointer distance in pixels
# - Lag events and timing
# - Coordinate system issues detection
# - JSON report for detailed analysis
```

### Requirements

- Python 3.x
- OpenCV: `pip install opencv-python numpy`
- Video showing both hand and screen pointer

### Output Format

**Console Report:**
```
🎯 Tracking Performance:
   Avg hand-pointer distance: 2,016.73 px ❌ CRITICAL
   Max hand-pointer distance: 2,786.76 px ❌ CRITICAL
   Lag events: 40/40 (100%)

⚡ Latency Measurements:
   Min latency: 16.9 ms
   Max latency: 84.7 ms
   Avg latency: 42.3 ms

Toddler-friendly rating: ❌ BROKEN - Completely unusable
```

**JSON Report:** Detailed metrics with frame-by-frame tracking data

---

## 📸 Video Frame Analyzer

**Purpose:** Extract frames for manual UI/UX analysis of game states, transitions, target sizing, and visual feedback issues.

**File:** `video_frame_analyzer.py`

### Features

- **Frame Extraction:** Extract frames at regular intervals for manual analysis
- **Video Metadata:** Get fps, resolution, duration, and ms-per-frame calculations
- **Scene Detection:** Identify game state transitions for pacing analysis
- **UI Element Detection:** Analyze target sizes and spacing

### Usage

```bash
# Activate project venv first
source .venv/bin/activate

# Get video information
python3 tools/video_frame_analyzer.py tools/emoji_match.mov info

# Extract frames at 0.5s intervals (to tools/frames/)
python3 tools/video_frame_analyzer.py tools/emoji_match.mov extract

# Detect scene changes/transitions
python3 tools/video_frame_analyzer.py tools/emoji_match.mov scenes
```

### Requirements

- Python 3.x
- OpenCV: `pip install opencv-python numpy`
- Video file in project directory

### Output Format

- **JSON metadata:** fps, frame count, duration, resolution, ms_per_frame
- **Extracted frames:** Named as `frame_XXXXXX_tX.XXs.png` with timestamps
- **Scene changes:** Timestamped frames where significant visual changes occur

---

## 🗂️ Emoji Match Audit Artifacts

**Purpose:** Keep the derived Emoji Match review artifacts alongside the reusable video-analysis tooling instead of in the repo root.

**Directory:** `tools/video_analysis/emoji_match_artifacts/`

### Contents

- `emoji_final_frame_analysis.txt` - end-screen UX notes
- `emoji_frame_analysis_results.json` - raw frame-by-frame extraction data
- `latency_analysis.json` - hand/cursor latency correlation output

### Why this exists

- These are supporting datasets for the analysis tooling, not top-level project entrypoints.
- Keeping them under `tools/video_analysis/` makes the root layout cleaner and keeps doc references stable.

---

## 🖼️ Profile Customization Screenshot Capture

**Purpose:** Capture profile customization UI screenshots for manual review without leaving an ad-hoc script in the repo root.

**File:** `tools/qa_analysis/profile_customization_capture.js`

### Usage

```bash
SCREENSHOT_TEST_EMAIL="you@example.com" \
SCREENSHOT_TEST_PASSWORD="app-password" \
node tools/qa_analysis/profile_customization_capture.js
```

### Notes

- Screenshots are written to `tools/qa_analysis/screenshots/` (already ignored by git).
- Set `SCREENSHOT_TEST_BASE_URL` or `SCREENSHOT_TEST_PROFILE_NAME` if you need a non-default target.

---

## 📊 Frame Analysis Workflow

### 1. Extract Video Metadata
```bash
python3 tools/video_frame_analyzer.py <video_path> info
```

**Example Output:**
```json
{
  "fps": 59.07,
  "frame_count": 7112,
  "duration_seconds": 120.4,
  "resolution": "2798x1986",
  "ms_per_frame": 16.93
}
```

### 2. Extract Frames for Analysis
```bash
python3 tools/video_frame_analyzer.py <video_path> extract
```

**Results:**
- Frames saved to `tools/frames/` directory
- Named with frame numbers and timestamps
- Sample interval: 0.5s (adjustable in code)

### 3. Manual Frame Analysis
Use the extracted frames to identify:
- Hand-tracking cursor visibility (or lack thereof)
- Target sizes relative to screen dimensions
- Game state transitions and pacing
- Success/failure feedback timing
- Instruction clarity and duration

### 4. Generate QA Report
Create detailed audit reports following the UI/UX framework:
- Severity-ranked issues (S1/S2/S3)
- Timestamp-backed evidence
- Child-friendly design principles
- Quick wins vs. deep work recommendations

---

## 🧒 Kids Game UI/UX QA Framework

### Analysis Focus Areas

1. **Hand-tracking lag**
   - Measure delay between real movement and on-screen response
   - Estimate latency in milliseconds using frame rate
   - Provide timestamp ranges for measurements

2. **Dot/cursor design**
   - Size: Minimum 20-30px diameter for visibility
   - Contrast: ≥4.5:1 ratio against backgrounds
   - Clarity: What it represents and how it behaves

3. **Target sizes**
   - Toddler-appropriate: 15-20% of screen width
   - Hitboxes: 2-3x visible target size
   - Spacing: Minimum 30px between interactive elements

4. **Speed/pacing**
   - State transitions: ≥2-3 seconds for toddler processing
   - Instructions: 5-8 seconds minimum visibility
   - Child-controlled pacing when possible

5. **Clarity of instruction and feedback**
   - Zero text dependency for gameplay
   - Visual demonstrations over text explanations
   - Immediate feedback (<100ms) for all actions

6. **Tracking stability**
   - Jitter assessment (none/low/medium/high)
   - Occlusion handling (hand leaving frame)
   - Recovery from tracking loss

### Toddler Motor Control Guidelines

**Age 2-4 years:**
- **Fine motor skills:** Developing, not precise
- **Target sizes:** Minimum 15-20% of screen width
- **Hitboxes:** 2-3x visible target size
- **Processing time:** 3-5+ seconds for new information
- **Attention span:** Short, needs frequent reinforcement

**Design Principles:**
- One obvious next action at any time
- Forgiving interaction (big targets, generous hitboxes)
- Immediate, clear success feedback
- Gentle failure feedback with fast recovery
- Minimal reading required

---

## 📋 Report Template Structure

### 1. One-Paragraph Summary
- What the game is
- Top 3 experience failures

### 2. Metrics Snapshot
- Tracking latency measurements
- Jitter rating
- Target size analysis
- Pacing observations
- Recovery times

### 3. State Machine Table
- Game states, user goals, system signals
- Failure modes and fix ideas

### 4. Issues List (Prioritized)
- **S1 Blocker:** Game-breaking for toddlers
- **S2 Major:** Significantly impacts experience
- **S3 Minor:** Polish and optimization

### 5. Design Principles Violated
- Visibility of system status
- Feedback & recognition
- Error prevention
- Age-appropriate design
- Cognitive load management

### 6. Quick Wins vs Deep Work
- Quick wins: ≤2 hours each
- Deep work: Multi-day projects

### 7. Regression Test Checklist
- Pre-deployment testing requirements
- Acceptance criteria for "good" experience

---

## 🔄 Continuous Improvement

### Adding New Analysis Features

The frame analyzer is designed to be extensible. To add new analysis capabilities:

1. **Add new methods to `VideoFrameAnalyzer` class**
2. **Update the CLI interface** in `main()` function
3. **Document the new feature** in this README

### Example: Adding Color-Based Cursor Detection

```python
def analyze_cursor_tracking(self, cursor_color_lower, cursor_color_upper):
    """Detect and analyze cursor/hand-tracking dot movement."""
    # Implementation using OpenCV color detection
    pass
```

---

## 📁 Directory Structure

```
tools/
├── README.md                      # This file
├── video_frame_analyzer.py        # Main analysis tool
├── emoji_match.mov                # Sample game recording
├── frames/                        # Extracted frames directory
│   ├── frame_000000_t0.00s.png
│   ├── frame_000029_t0.49s.png
│   └── ...
└── reports/                       # Generated QA reports
    └── emoji_match_gameplay_audit_2026-02-20.md
```

---

## 🚀 Quick Start Guide

### First Time Setup

1. **Install dependencies:**
   ```bash
   pip install opencv-python numpy
   ```

2. **Prepare your video:**
   - Record full gameplay session
   - Save to `tools/<game_name>.mov`
   - Ensure good lighting and visible hand movements

3. **Run analysis:**
   ```bash
   # Get video info
   python3 tools/video_frame_analyzer.py tools/<game_name>.mov info
   
   # Extract frames
   python3 tools/video_frame_analyzer.py tools/<game_name>.mov extract
   ```

4. **Examine frames:**
   - Open frames in `tools/frames/`
   - Look for UI/UX issues using the QA framework
   - Document timestamps for evidence

5. **Generate report:**
   - Create audit report in `docs/audit/`
   - Follow the report template structure
   - Include timestamp-backed evidence

---

## 📊 Example Analysis Results

### Emoji Match Game Audit

**File:** `docs/audit/emoji_match_gameplay_audit_2026-02-20.md`

**Key Findings:**
- **CRITICAL:** No visible hand-tracking cursor (0:00-2:00)
- **CRITICAL:** Targets too small (~2-3% vs. required 15-20% of screen)
- **MAJOR:** No clear success/failure feedback
- **MAJOR:** Text-only instructions (toddlers can't read)
- **MAJOR:** Pacing too fast (<0.5s transitions vs. 2-3s needed)

**Recommendations:**
1. Add 20-30px high-contrast cursor dot (S1)
2. Increase target sizes to 15-20% screen width (S1)
3. Implement clear feedback animations (S2)
4. Add voice-over instructions (S2)

---

## 🛠️ Troubleshooting

### OpenCV Installation Issues

```bash
# Try alternative installation
pip install opencv-python-headless

# Or use conda
conda install -c conda-forge opencv
```

### Video File Too Large

The analysis tool extracts frames at intervals, so it works with large files. If you encounter memory issues:

1. Reduce extraction interval (modify `interval_seconds` parameter)
2. Extract specific time ranges only
3. Use video compression before analysis

### Frame Extraction Slow

For faster analysis:
1. Reduce video resolution before processing
2. Extract fewer frames (increase interval)
3. Use SSD for better I/O performance

---

## 📝 Contributing

When adding new analysis capabilities:

1. **Test with real game recordings**
2. **Document the new feature** in this README
3. **Include example usage** and expected output
4. **Follow the reusable tools principle** - save for future use

---

## 🎓 Best Practices

1. **Always save analysis tools** - don't create throwaway scripts
2. **Document thoroughly** - purpose, use cases, examples
3. **Use descriptive names** - `video_frame_analyzer.py` not `temp_tool.py`
4. **Think cross-project** - design tools useful for other codebases
5. **Prefer portable formats** - HTML/JS for UI tools, Python for CLI

---

## 📞 Support

For issues or questions about the analysis tools:
1. Check this README first
2. Review the example audit report
3. Examine the tool source code comments
4. Test with the provided sample video

---

## 🤖 Z.AI-Based Vision Analysis Scripts

Contributed multi-pass and frame-sampled scripts are preserved under:

- `tools/qa_analysis/zai/analyze_key_frames.ts`
- `tools/qa_analysis/zai/analyze_sampled_frames.ts`
- `tools/qa_analysis/zai/analyze_video_three_pass.ts`
- `tools/qa_analysis/zai/analyze_final_frame.ts`
- `tools/qa_analysis/zai/analyze_quick_frames.ts`
- `tools/qa_analysis/zai/generate_emoji_match_docx_report.js`
- `tools/qa_analysis/zai/README.md`

These scripts are reusable wrappers for toddler-focused visual QA prompts and JSON output generation.
They are parameterized for local paths (no hardcoded `/home/z/...`).

---

## 📁 UX Audit Reports

Completed UX audits are stored in `docs/ux_audit/<game_name>/` with:
- `README.md` - Audit summary and recommendations
- `UX_AUDIT_REPORT.md` - Comprehensive code-based analysis
- `VISUAL_CONFIRMATION_REPORT.md` - Frame-by-frame visual analysis
- `keyframe_*_small.jpg` - Extracted frames for evidence

### Example: Emoji Match UX Audit

**Location:** `docs/ux_audit/emoji_match/`

**Process:**
1. Code review of `src/frontend/src/pages/EmojiMatch.tsx`
2. Video recording of gameplay (2:00, 60fps)
3. Frame extraction at 1fps intervals
4. Visual analysis with AI image recognition
5. Correlation of code findings with visual evidence

**Key Findings:**
- HIT_RADIUS (0.12) too strict for toddlers → Increase to 0.18
- Cursor (40px) too small → Increase to 80px
- Timer creates anxiety → Hide for ages 2-4
- Text-only instructions → Add TTS voice

---

**Last Updated:** 2026-02-20
**Maintained by:** Learning for Kids Project
**Purpose:** Kids Game UI/UX Quality Assurance
