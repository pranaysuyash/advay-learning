#!/usr/bin/env python3
"""Reusable video UX analysis toolkit for gesture-based toddler games.

Provides helpers for:
- frame extraction
- rough cursor latency estimation
- cursor visibility analysis
- target sizing checks
- pacing interval checks
- JSON report generation
"""

from __future__ import annotations

from dataclasses import dataclass, asdict
from pathlib import Path
from typing import List, Tuple
import json

import cv2
import numpy as np


@dataclass
class TargetAnalysis:
    diameter_px: int
    screen_percentage: float
    hitbox_forgiveness: float
    spacing_px: int


class ToddlerGameAnalyzer:
    def __init__(
        self,
        video_path: str,
        screen_dpi: float = 264.0,
    ) -> None:
        self.video_path = video_path
        self.video = cv2.VideoCapture(video_path)
        if not self.video.isOpened():
            raise RuntimeError(f"Unable to open video: {video_path}")

        self.fps = float(self.video.get(cv2.CAP_PROP_FPS) or 0)
        if self.fps <= 0:
            raise RuntimeError("Could not detect FPS")
        self.frame_time_ms = 1000.0 / self.fps
        self.total_frames = int(self.video.get(cv2.CAP_PROP_FRAME_COUNT) or 0)
        self.width_px = int(self.video.get(cv2.CAP_PROP_FRAME_WIDTH) or 0)
        self.height_px = int(self.video.get(cv2.CAP_PROP_FRAME_HEIGHT) or 0)
        self.screen_dpi = screen_dpi

        self.latency_measurements: List[dict] = []
        self.jitter_samples: List[float] = []
        self.target_sizes: List[dict] = []

    def extract_frame(self, timestamp_sec: float) -> np.ndarray:
        frame_num = int(timestamp_sec * self.fps)
        self.video.set(cv2.CAP_PROP_POS_FRAMES, frame_num)
        ok, frame = self.video.read()
        if not ok:
            raise ValueError(f"Could not extract frame at {timestamp_sec}s")
        return frame

    def measure_cursor_latency(
        self,
        start_sec: float,
        end_sec: float,
        hand_roi: Tuple[int, int, int, int],
    ) -> float:
        """Approximate latency via motion-onset deltas.

        Returns latency in ms, or -1 if not detectable with current heuristics.
        """
        frames: List[np.ndarray] = []
        start_frame = int(start_sec * self.fps)
        end_frame = int(end_sec * self.fps)

        self.video.set(cv2.CAP_PROP_POS_FRAMES, start_frame)
        for _ in range(start_frame, end_frame):
            ok, frame = self.video.read()
            if not ok:
                break
            frames.append(frame)

        if len(frames) < 3:
            return -1

        gray_frames = [cv2.cvtColor(f, cv2.COLOR_BGR2GRAY) for f in frames]
        x, y, w, h = hand_roi

        motion_scores: List[float] = []
        for i in range(1, len(gray_frames)):
            roi_prev = gray_frames[i - 1][y:y + h, x:x + w]
            roi_curr = gray_frames[i][y:y + h, x:x + w]
            diff = cv2.absdiff(roi_prev, roi_curr)
            motion_scores.append(float(np.mean(diff)))

        hand_motion_frames = np.where(np.array(motion_scores) > 5.0)[0]
        if len(hand_motion_frames) == 0:
            return -1
        hand_start_idx = int(hand_motion_frames[0])

        cursor_motion_scores: List[int] = []
        for i in range(1, len(frames)):
            b, g, r = cv2.split(frames[i])
            cyan_mask = (b > 150) & (g > 150) & (r < 120)
            cursor_motion_scores.append(int(np.sum(cyan_mask)))

        if len(cursor_motion_scores) < 2:
            return -1

        cursor_diff = np.diff(cursor_motion_scores)
        cursor_motion_idx = np.where(np.abs(cursor_diff) > 50)[0]
        if len(cursor_motion_idx) == 0:
            return -1

        cursor_start_idx = int(cursor_motion_idx[0])
        latency_frames = cursor_start_idx - hand_start_idx
        latency_ms = latency_frames * self.frame_time_ms

        self.latency_measurements.append(
            {
                "timestamp": start_sec,
                "latency_frames": latency_frames,
                "latency_ms": latency_ms,
                "hand_roi": hand_roi,
            }
        )
        return float(latency_ms)

    def analyze_cursor_visibility(self, frame: np.ndarray, cursor_pos: Tuple[int, int]) -> dict:
        x, y = cursor_pos
        r = 6
        cursor_region = frame[max(0, y - r):min(self.height_px, y + r), max(0, x - r):min(self.width_px, x + r)]
        bg_r = 24
        bg_region = frame[max(0, y - bg_r):min(self.height_px, y + bg_r), max(0, x - bg_r):min(self.width_px, x + bg_r)]

        cursor_color = np.mean(cursor_region, axis=(0, 1)) if cursor_region.size else np.array([0, 0, 0])
        bg_color = np.mean(bg_region, axis=(0, 1)) if bg_region.size else np.array([0, 0, 0])

        def rel_lum(bgr: np.ndarray) -> float:
            b, g, rch = [float(v) / 255.0 for v in bgr]

            def c(v: float) -> float:
                return v / 12.92 if v <= 0.04045 else ((v + 0.055) / 1.055) ** 2.4

            return 0.2126 * c(rch) + 0.7152 * c(g) + 0.0722 * c(b)

        l1, l2 = rel_lum(cursor_color), rel_lum(bg_color)
        hi, lo = (l1, l2) if l1 >= l2 else (l2, l1)
        ratio = (hi + 0.05) / (lo + 0.05)

        return {
            "cursor_color_bgr": cursor_color.tolist(),
            "background_color_bgr": bg_color.tolist(),
            "contrast_ratio": float(ratio),
            "passes_wcag_aa_ui": bool(ratio >= 3.0),
        }

    def measure_target_sizes(self, target_positions: List[Tuple[int, int, int]]) -> List[TargetAnalysis]:
        analyses: List[TargetAnalysis] = []

        for i, (x, y, r) in enumerate(target_positions):
            diameter_px = int(r * 2)
            screen_pct = (diameter_px / max(self.width_px, 1)) * 100

            min_dist = float("inf")
            for j, (x2, y2, r2) in enumerate(target_positions):
                if i == j:
                    continue
                edge_dist = np.sqrt((x - x2) ** 2 + (y - y2) ** 2) - r - r2
                min_dist = min(min_dist, edge_dist)

            analysis = TargetAnalysis(
                diameter_px=diameter_px,
                screen_percentage=float(screen_pct),
                hitbox_forgiveness=1.0,
                spacing_px=int(min_dist if min_dist != float("inf") else 0),
            )
            analyses.append(analysis)

            diameter_mm = (diameter_px / self.screen_dpi) * 25.4
            self.target_sizes.append(
                {
                    "target_id": i,
                    "diameter_px": diameter_px,
                    "diameter_mm": float(diameter_mm),
                    "accessible_for_toddlers": bool(diameter_mm >= 12.0),
                    "spacing_px": analysis.spacing_px,
                }
            )

        return analyses

    def calculate_motion_jitter(self, cursor_positions: List[Tuple[int, int]]) -> float:
        if len(cursor_positions) < 3:
            return 0.0
        pts = np.array(cursor_positions, dtype=np.float32)
        vel = np.diff(pts, axis=0)
        if len(vel) < 2:
            return 0.0
        acc = np.diff(vel, axis=0)
        jerk = np.linalg.norm(acc, axis=1)
        jitter = float(np.std(jerk))
        self.jitter_samples.append(jitter)
        return jitter

    def analyze_pacing(self, event_timestamps: List[float]) -> dict:
        if len(event_timestamps) < 2:
            return {
                "mean_interval": 0,
                "min_interval": 0,
                "violations": 0,
                "intervals": [],
                "recommendation": "Need at least 2 events",
            }
        intervals = np.diff(np.array(event_timestamps, dtype=np.float32))
        return {
            "mean_interval": float(np.mean(intervals)),
            "min_interval": float(np.min(intervals)),
            "violations": int(np.sum(intervals < 2.0)),
            "intervals": intervals.tolist(),
            "recommendation": "Add 3-5s pauses" if np.min(intervals) < 2.0 else "Pacing acceptable",
        }

    def generate_report(self, output_path: str) -> dict:
        latencies = [m["latency_ms"] for m in self.latency_measurements]
        jitter_avg = float(np.mean(self.jitter_samples)) if self.jitter_samples else 0.0
        latency_avg = float(np.mean(latencies)) if latencies else 0.0

        report = {
            "video_metadata": {
                "path": self.video_path,
                "fps": self.fps,
                "frame_time_ms": self.frame_time_ms,
                "resolution": [self.width_px, self.height_px],
                "total_frames": self.total_frames,
            },
            "latency_analysis": {
                "measurements": self.latency_measurements,
                "average_ms": latency_avg,
                "max_acceptable_ms": 50,
                "status": "FAIL" if latencies and latency_avg > 50 else "PASS",
            },
            "target_analysis": self.target_sizes,
            "jitter_analysis": {
                "samples": self.jitter_samples,
                "average": jitter_avg,
                "threshold": 3.0,
                "status": "FAIL" if self.jitter_samples and jitter_avg > 3.0 else "PASS",
            },
        }

        out = Path(output_path)
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_text(json.dumps(report, indent=2), encoding="utf-8")
        return report


def _demo() -> None:
    print("ToddlerGameAnalyzer toolkit loaded.")
    print("Example:")
    print("  analyzer = ToddlerGameAnalyzer('emoji_match.mov')")


if __name__ == "__main__":
    _demo()
