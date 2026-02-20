#!/usr/bin/env python3
"""Create/append a CSV template for manual latency measurements.

Useful when QA compares hand-move and cursor-move onset frames manually.
"""

from __future__ import annotations

import argparse
import csv
from pathlib import Path

HEADER = [
    "Timestamp_Video",
    "Frame_Index",
    "Hand_Move_Start_Frame",
    "Cursor_Move_Start_Frame",
    "Delta_Frames",
    "FPS",
    "Delta_MS",
    "Notes",
]


def ensure_log(csv_path: Path) -> None:
    if not csv_path.exists():
        csv_path.parent.mkdir(parents=True, exist_ok=True)
        with csv_path.open("w", newline="", encoding="utf-8") as f:
            writer = csv.writer(f)
            writer.writerow(HEADER)
        print(f"Created new log file: {csv_path}")
    else:
        print(f"Log file already exists: {csv_path}")


def append_entry(
    csv_path: Path,
    timestamp_video: str,
    frame_index: int,
    hand_start: int,
    cursor_start: int,
    fps: float,
    notes: str,
) -> None:
    delta_frames = cursor_start - hand_start
    delta_ms = delta_frames * (1000.0 / fps)

    with csv_path.open("a", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow([
            timestamp_video,
            frame_index,
            hand_start,
            cursor_start,
            delta_frames,
            fps,
            round(delta_ms, 2),
            notes,
        ])

    print(f"Appended entry: Δframes={delta_frames}, Δms={delta_ms:.2f}")


def main() -> None:
    parser = argparse.ArgumentParser(description="Create/append latency measurement log")
    parser.add_argument("csv_path", type=Path, nargs="?", default=Path("latency_log.csv"))
    parser.add_argument("--append", action="store_true", help="Append a data row")
    parser.add_argument("--timestamp", type=str, default="")
    parser.add_argument("--frame-index", type=int, default=0)
    parser.add_argument("--hand-start", type=int, default=0)
    parser.add_argument("--cursor-start", type=int, default=0)
    parser.add_argument("--fps", type=float, default=30.0)
    parser.add_argument("--notes", type=str, default="")
    args = parser.parse_args()

    ensure_log(args.csv_path)

    if args.append:
        append_entry(
            csv_path=args.csv_path,
            timestamp_video=args.timestamp,
            frame_index=args.frame_index,
            hand_start=args.hand_start,
            cursor_start=args.cursor_start,
            fps=args.fps,
            notes=args.notes,
        )
    else:
        print("Template ready. Use --append to add rows.")
        print("Formula: Delta_MS = Delta_Frames * (1000 / FPS)")


if __name__ == "__main__":
    main()
