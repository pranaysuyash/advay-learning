# Z.AI Vision QA Scripts (Reusable)

These scripts preserve contributed analysis workflows from other agents and make them reusable in this repository.

## Prerequisites

- Node.js 18+
- `z-ai-web-dev-sdk` installed in your environment
- A TS runner such as `tsx` (recommended)
- Auth environment for Z.AI SDK configured in your shell

## Scripts

### 1) `analyze_key_frames.ts`

Analyzes a strategic set of specific frame indices (intro/mid/end) using a toddler-focused prompt.

**Arguments**
1. `framesDir` (default: `evaluations/emoji_match_frames`)
2. `outputFile` (default: `evaluations/key_frame_analysis.json`)

**Example**

- `npx tsx tools/qa_analysis/zai/analyze_key_frames.ts evaluations/emoji_match_frames evaluations/key_frame_analysis.json`

---

### 2) `analyze_sampled_frames.ts`

Samples frame set in batches and runs per-frame toddler UX analysis prompt.

**Arguments**
1. `framesDir` (default: `evaluations/emoji_match_frames`)
2. `outputFile` (default: `evaluations/frame_analysis_results.json`)
3. `batchSize` (default: `5`)
4. `sampleEvery` (default: `10`)

**Example**

- `npx tsx tools/qa_analysis/zai/analyze_sampled_frames.ts evaluations/emoji_match_frames evaluations/frame_analysis_results.json 5 10`

---

### 3) `analyze_video_three_pass.ts`

Runs a full 3-pass analysis directly on the video:
- Pass 1: state mapping
- Pass 2: frame-level audit
- Pass 3: trust-breaking moments

**Arguments**
1. `videoPath` (default: `tools/emoji_match.mov`)
2. `outputFile` (default: `evaluations/video_analysis_raw.json`)
3. `width` (default: `1280`)
4. `height` (default: `908`)
5. `duration` (default: `119.95`)
6. `frameRate` (default: `60`)

**Example**

- `npx tsx tools/qa_analysis/zai/analyze_video_three_pass.ts tools/emoji_match.mov evaluations/video_analysis_raw.json 1280 908 119.95 60`

---

### 4) `analyze_final_frame.ts`

Runs focused analysis on one final/end frame.

**Arguments**
1. `framesDir` (default: `evaluations/emoji_match_frames`)
2. `finalFrameFile` (default: `frame_0240.png`)
3. `outputFile` (default: `evaluations/final_frame_analysis.txt`)

**Example**

- `npx tsx tools/qa_analysis/zai/analyze_final_frame.ts evaluations/emoji_match_frames frame_0240.png evaluations/final_frame_analysis.txt`

---

### 5) `analyze_quick_frames.ts`

Runs a quick JSON-oriented analysis over a curated set of key frames.

**Arguments**
1. `framesDir` (default: `evaluations/emoji_match_frames`)
2. `outputFile` (default: `evaluations/frame_analysis_summary.json`)
3. `delayMs` (default: `1000`)

**Example**

- `npx tsx tools/qa_analysis/zai/analyze_quick_frames.ts evaluations/emoji_match_frames evaluations/frame_analysis_summary.json 1000`

---

### 6) `generate_emoji_match_docx_report.js`

Generates a DOCX report from JSON output (primarily `video_analysis_raw.json`).

**Arguments**
1. `inputJson` (default: `evaluations/video_analysis_raw.json`)
2. `outputDocx` (default: `evaluations/Toddler_Game_QA_Report_EmojiMatch.docx`)

**Example**

- `node tools/qa_analysis/zai/generate_emoji_match_docx_report.js evaluations/video_analysis_raw.json evaluations/Toddler_Game_QA_Report_EmojiMatch.docx`

---

### 7) `run_all.sh`

Runs the whole chain in one command:

- key-frame analysis
- sampled frame analysis
- quick frame JSON analysis
- 3-pass video analysis
- final-frame analysis
- DOCX report generation

**Arguments**
1. `framesDir` (default: `evaluations/emoji_match_frames`)
2. `videoPath` (default: `tools/emoji_match.mov`)
3. `outputDir` (default: `evaluations`)

**Example**

- `bash tools/qa_analysis/zai/run_all.sh evaluations/emoji_match_frames tools/emoji_match.mov evaluations`

---

## Notes

- Outputs are JSON artifacts and should be reviewed/curated into docs as needed.
- Keep generated images/frames as local artifacts unless explicitly needed in docs.
- These scripts preserve external agent workflows but are now path-agnostic and reusable in this project.
- For DOCX generation, install `docx` in your Node environment.
- For TypeScript scripts, use `tsx` (e.g., `npx tsx ...`).
