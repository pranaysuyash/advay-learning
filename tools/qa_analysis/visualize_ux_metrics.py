#!/usr/bin/env python3
"""Visualization helpers for UX metric charts."""

from __future__ import annotations

from pathlib import Path
from typing import List

import matplotlib.pyplot as plt
import numpy as np


def plot_latency_analysis(latency_data: List[dict], output_path: str) -> None:
    if not latency_data:
        raise ValueError("latency_data is empty")

    latencies = [float(d.get("latency_ms", 0)) for d in latency_data]
    frames = list(range(len(latencies)))

    fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(10, 8))

    colors = ["red" if l > 50 else "orange" if l > 33 else "green" for l in latencies]
    ax1.bar(frames, latencies, color=colors)
    ax1.axhline(y=50, color="r", linestyle="--", label="Toddler threshold (50ms)")
    ax1.axhline(y=33, color="orange", linestyle="--", label="33ms reference")
    ax1.set_xlabel("Interaction Event")
    ax1.set_ylabel("Latency (ms)")
    ax1.set_title("Hand Tracking Latency Analysis")
    ax1.legend()

    sorted_lat = sorted(latencies)
    percentile = np.arange(1, len(sorted_lat) + 1) / len(sorted_lat) * 100
    ax2.plot(sorted_lat, percentile, "b-", linewidth=2)
    ax2.axvline(x=50, color="r", linestyle="--", label="50ms target")
    ax2.set_xlabel("Latency (ms)")
    ax2.set_ylabel("Percentile")
    ax2.set_title("Latency Distribution")
    ax2.grid(True, alpha=0.3)
    ax2.legend()

    plt.tight_layout()
    out = Path(output_path)
    out.parent.mkdir(parents=True, exist_ok=True)
    plt.savefig(out, dpi=150, bbox_inches="tight")
    plt.close(fig)


def plot_target_size_accessibility(targets: List[dict], output_path: str) -> None:
    if not targets:
        raise ValueError("targets is empty")

    diameters_mm = [float(t.get("diameter_mm", 0)) for t in targets]
    labels = [f"Target {i + 1}" for i in range(len(targets))]
    colors = ["red" if d < 9 else "orange" if d < 12 else "green" for d in diameters_mm]

    fig, ax = plt.subplots(figsize=(10, 6))
    y_pos = np.arange(len(targets))
    bars = ax.barh(y_pos, diameters_mm, color=colors, alpha=0.8, edgecolor="black")

    ax.axvline(x=9, color="red", linestyle="--", alpha=0.6, label="Min 9mm")
    ax.axvline(x=12, color="orange", linestyle="--", alpha=0.6, label="Recommended 12mm")
    ax.axvline(x=17, color="green", linestyle="--", alpha=0.6, label="Ideal 17mm")

    ax.set_yticks(y_pos)
    ax.set_yticklabels(labels)
    ax.set_xlabel("Diameter (mm)")
    ax.set_title("Target Size Accessibility (Toddler Standards)")
    ax.legend(loc="lower right")

    for bar, d in zip(bars, diameters_mm):
        label = "TOO SMALL" if d < 9 else "SMALL" if d < 12 else "OK"
        ax.text(bar.get_width() + 0.3, bar.get_y() + bar.get_height() / 2, f"{d:.1f}mm ({label})", va="center", fontsize=9)

    plt.tight_layout()
    out = Path(output_path)
    out.parent.mkdir(parents=True, exist_ok=True)
    plt.savefig(out, dpi=150, bbox_inches="tight")
    plt.close(fig)
