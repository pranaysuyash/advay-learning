#!/usr/bin/env bash
set -euo pipefail

# One-command pipeline for Z.AI-based Emoji Match analysis.
#
# Usage:
#   bash tools/qa_analysis/zai/run_all.sh \
#     evaluations/emoji_match_frames \
#     tools/emoji_match.mov \
#     evaluations
#
# Args:
#   1) frames dir       (default: evaluations/emoji_match_frames)
#   2) video path       (default: tools/emoji_match.mov)
#   3) output base dir  (default: evaluations)

FRAMES_DIR="${1:-evaluations/emoji_match_frames}"
VIDEO_PATH="${2:-tools/emoji_match.mov}"
OUT_DIR="${3:-evaluations}"

mkdir -p "$OUT_DIR"

echo "== Z.AI QA pipeline =="
echo "frames: $FRAMES_DIR"
echo "video : $VIDEO_PATH"
echo "out   : $OUT_DIR"

echo
echo "[1/5] analyze_key_frames"
npx tsx tools/qa_analysis/zai/analyze_key_frames.ts \
  "$FRAMES_DIR" \
  "$OUT_DIR/key_frame_analysis.json"

echo
echo "[2/5] analyze_sampled_frames"
npx tsx tools/qa_analysis/zai/analyze_sampled_frames.ts \
  "$FRAMES_DIR" \
  "$OUT_DIR/frame_analysis_results.json" \
  5 \
  10

echo
echo "[3/5] analyze_quick_frames"
npx tsx tools/qa_analysis/zai/analyze_quick_frames.ts \
  "$FRAMES_DIR" \
  "$OUT_DIR/frame_analysis_summary.json" \
  1000

echo
echo "[4/5] analyze_video_three_pass"
npx tsx tools/qa_analysis/zai/analyze_video_three_pass.ts \
  "$VIDEO_PATH" \
  "$OUT_DIR/video_analysis_raw.json" \
  1280 \
  908 \
  119.95 \
  60

echo
echo "[5/5] analyze_final_frame + docx"
npx tsx tools/qa_analysis/zai/analyze_final_frame.ts \
  "$FRAMES_DIR" \
  frame_0240.png \
  "$OUT_DIR/final_frame_analysis.txt"

node tools/qa_analysis/zai/generate_emoji_match_docx_report.js \
  "$OUT_DIR/video_analysis_raw.json" \
  "$OUT_DIR/Toddler_Game_QA_Report_EmojiMatch.docx"

echo
echo "✅ Pipeline complete"
echo "Outputs:"
echo "  - $OUT_DIR/key_frame_analysis.json"
echo "  - $OUT_DIR/frame_analysis_results.json"
echo "  - $OUT_DIR/frame_analysis_summary.json"
echo "  - $OUT_DIR/video_analysis_raw.json"
echo "  - $OUT_DIR/final_frame_analysis.txt"
echo "  - $OUT_DIR/Toddler_Game_QA_Report_EmojiMatch.docx"
