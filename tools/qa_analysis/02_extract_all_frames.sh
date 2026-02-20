#!/usr/bin/env bash
# Extract all frames with timestamp overlays (high storage usage).
# Usage:
#   bash tools/qa_analysis/02_extract_all_frames.sh Desktop/emoji_match.mov out/emoji_match_allframes

set -euo pipefail

IN="${1:?input video path required}"
OUTDIR="${2:?output dir required}"
mkdir -p "$OUTDIR/frames"

ffmpeg -hide_banner -y -i "$IN" \
  -vf "drawtext=fontfile=/System/Library/Fonts/Supplemental/Arial.ttf:text='%{pts\\:hms}  f=%{n}':x=20:y=20:fontsize=24:box=1:boxcolor=black@0.6" \
  "$OUTDIR/frames/f_%08d.png"

echo "Done. Frames in: $OUTDIR/frames"
