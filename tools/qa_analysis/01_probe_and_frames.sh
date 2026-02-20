#!/usr/bin/env bash
# Probe video and extract 10fps scrub frames with timestamp overlays.
# Usage:
#   bash tools/qa_analysis/01_probe_and_frames.sh Desktop/emoji_match.mov out/emoji_match

set -euo pipefail

IN="${1:?input video path required}"
OUTDIR="${2:?output dir required}"
mkdir -p "$OUTDIR"/{frames,clips}

echo "== ffprobe =="
ffprobe -hide_banner -v error \
  -select_streams v:0 \
  -show_entries stream=width,height,r_frame_rate,avg_frame_rate,codec_name,pix_fmt \
  -show_entries format=duration,bit_rate \
  -of json "$IN" | tee "$OUTDIR/probe.json"

echo
echo "== Extract 10fps frames with timestamp burn-in =="
ffmpeg -hide_banner -y -i "$IN" \
  -vf "fps=10,drawtext=fontfile=/System/Library/Fonts/Supplemental/Arial.ttf:text='%{pts\\:hms}  f=%{n}':x=20:y=20:fontsize=24:box=1:boxcolor=black@0.6" \
  "$OUTDIR/frames/f_%06d.png"

echo
echo "Done. Frames in: $OUTDIR/frames"
