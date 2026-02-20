#!/usr/bin/env python3
"""Analyze cursor visibility/contrast against video background.

This helper detects cyan-ish cursor regions and reports luminance difference and
approximate WCAG-style contrast ratio against surrounding background.
"""

from __future__ import annotations

import argparse
from pathlib import Path
import cv2
import numpy as np


def calculate_luminance(color_bgr: np.ndarray) -> float:
    b, g, r = [float(c) for c in color_bgr]
    return 0.299 * r + 0.587 * g + 0.114 * b


def relative_luminance(color_bgr: np.ndarray) -> float:
    # sRGB to linear RGB approximation for WCAG-style contrast
    b, g, r = [float(c) / 255.0 for c in color_bgr]

    def f(c: float) -> float:
        return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4

    rl = 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)
    return rl


def contrast_ratio(c1_bgr: np.ndarray, c2_bgr: np.ndarray) -> float:
    l1 = relative_luminance(c1_bgr)
    l2 = relative_luminance(c2_bgr)
    hi, lo = (l1, l2) if l1 >= l2 else (l2, l1)
    return (hi + 0.05) / (lo + 0.05)


def check_cursor_contrast(frame_path: Path, lum_threshold: float = 50.0, ratio_threshold: float = 3.0) -> dict:
    frame = cv2.imread(str(frame_path))
    if frame is None:
        raise FileNotFoundError(f"Frame not found: {frame_path}")

    hsv = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)

    # Approx cyan range in HSV (tune as needed for your cursor style)
    lower_cyan = np.array([80, 50, 50])
    upper_cyan = np.array([100, 255, 255])

    mask = cv2.inRange(hsv, lower_cyan, upper_cyan)
    coords = cv2.findNonZero(mask)

    if coords is None:
        return {
            "status": "FAIL",
            "reason": "Cursor not detected (cyan mask empty)",
            "frame": str(frame_path),
        }

    x, y = coords[0][0]
    sample_size = 10
    y_min, y_max = max(0, y - sample_size), min(frame.shape[0], y + sample_size)
    x_min, x_max = max(0, x - sample_size), min(frame.shape[1], x + sample_size)

    roi = frame[y_min:y_max, x_min:x_max]
    avg_bg = np.mean(roi, axis=(0, 1)) if roi.size else np.array([0, 0, 0], dtype=np.float32)

    # Estimate cursor color from masked pixels near first match
    cursor_pixels = frame[mask > 0]
    avg_cursor = np.mean(cursor_pixels, axis=0) if cursor_pixels.size else np.array([255, 255, 0], dtype=np.float32)

    lum_cursor = calculate_luminance(avg_cursor)
    lum_bg = calculate_luminance(avg_bg)
    lum_delta = abs(lum_cursor - lum_bg)
    ratio = contrast_ratio(avg_cursor, avg_bg)

    passed = lum_delta >= lum_threshold and ratio >= ratio_threshold

    return {
        "status": "PASS" if passed else "FAIL",
        "frame": str(frame_path),
        "detected_cursor_point": {"x": int(x), "y": int(y)},
        "luminance_delta": round(float(lum_delta), 2),
        "contrast_ratio": round(float(ratio), 2),
        "thresholds": {
            "min_luminance_delta": lum_threshold,
            "min_contrast_ratio": ratio_threshold,
        },
    }


def main() -> None:
    parser = argparse.ArgumentParser(description="Check cursor contrast in a frame")
    parser.add_argument("frame_path", type=Path)
    parser.add_argument("--lum-threshold", type=float, default=50.0)
    parser.add_argument("--ratio-threshold", type=float, default=3.0)
    args = parser.parse_args()

    result = check_cursor_contrast(args.frame_path, args.lum_threshold, args.ratio_threshold)
    print(result)


if __name__ == "__main__":
    main()
