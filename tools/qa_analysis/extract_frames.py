#!/usr/bin/env python3
"""Extract frames from a time window for manual latency/UX inspection.

Usage:
  python tools/qa_analysis/extract_frames.py <video_path> <output_folder> <start_sec> <end_sec>
"""

from __future__ import annotations

import argparse
from pathlib import Path
import cv2


def extract_frames(video_path: Path, output_folder: Path, start_sec: float, end_sec: float) -> int:
    output_folder.mkdir(parents=True, exist_ok=True)

    cap = cv2.VideoCapture(str(video_path))
    if not cap.isOpened():
        raise RuntimeError(f"Unable to open video: {video_path}")

    fps = cap.get(cv2.CAP_PROP_FPS)
    if fps <= 0:
        raise RuntimeError("Could not detect FPS from input video")

    start_frame = int(start_sec * fps)
    end_frame = int(end_sec * fps)
    if end_frame < start_frame:
        raise ValueError("end_sec must be >= start_sec")

    cap.set(cv2.CAP_PROP_POS_FRAMES, start_frame)

    saved = 0
    current = start_frame
    print(f"Extracting frames {start_frame}..{end_frame} (fps={fps:.3f})")
    while cap.isOpened() and current <= end_frame:
        ok, frame = cap.read()
        if not ok:
            break
        frame_name = output_folder / f"frame_{current:06d}.png"
        cv2.imwrite(str(frame_name), frame)
        saved += 1
        current += 1

    cap.release()
    return saved


def main() -> None:
    parser = argparse.ArgumentParser(description="Extract frames from a specific time range")
    parser.add_argument("video_path", type=Path)
    parser.add_argument("output_folder", type=Path)
    parser.add_argument("start_sec", type=float)
    parser.add_argument("end_sec", type=float)
    args = parser.parse_args()

    count = extract_frames(args.video_path, args.output_folder, args.start_sec, args.end_sec)
    print(f"Saved {count} frames to {args.output_folder}")


if __name__ == "__main__":
    main()
