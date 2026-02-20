#!/usr/bin/env python3
"""
Video Frame Analyzer for Kids Game UX Testing
Analyzes game recordings for tracking latency, UI sizing, pacing, and child-friendly design issues.
"""

import cv2
import numpy as np
import json
import os
from pathlib import Path
from typing import Dict, List, Tuple, Optional
import subprocess

class VideoFrameAnalyzer:
    def __init__(self, video_path: str):
        self.video_path = video_path
        self.cap = cv2.VideoCapture(video_path)
        self.fps = self.cap.get(cv2.CAP_PROP_FPS)
        self.frame_count = int(self.cap.get(cv2.CAP_PROP_FRAME_COUNT))
        self.duration = self.frame_count / self.fps
        self.width = int(self.cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        self.height = int(self.cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

    def get_video_info(self) -> Dict:
        """Return video metadata for analysis context."""
        return {
            "fps": round(self.fps, 2),
            "frame_count": self.frame_count,
            "duration_seconds": round(self.duration, 2),
            "resolution": f"{self.width}x{self.height}",
            "ms_per_frame": round(1000 / self.fps, 2)
        }

    def extract_frames_at_intervals(self, output_dir: str, interval_seconds: float = 1.0) -> List[str]:
        """Extract frames at regular intervals for manual analysis."""
        os.makedirs(output_dir, exist_ok=True)
        frame_paths = []

        interval_frames = int(self.fps * interval_seconds)

        for frame_idx in range(0, self.frame_count, interval_frames):
            self.cap.set(cv2.CAP_PROP_POS_FRAMES, frame_idx)
            ret, frame = self.cap.read()
            if ret:
                timestamp = frame_idx / self.fps
                filename = f"frame_{frame_idx:06d}_t{timestamp:.2f}s.png"
                output_path = os.path.join(output_dir, filename)
                cv2.imwrite(output_path, frame)
                frame_paths.append(output_path)

        return frame_paths

    def extract_scene_changes(self, output_dir: str, threshold: float = 0.3) -> List[Tuple[float, str]]:
        """Detect scene changes/transitions for pacing analysis."""
        os.makedirs(output_dir, exist_ok=True)
        scenes = []

        prev_frame = None
        frame_idx = 0

        while True:
            ret, frame = self.cap.read()
            if not ret:
                break

            if prev_frame is not None:
                # Calculate frame difference
                diff = cv2.absdiff(cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY),
                                  cv2.cvtColor(prev_frame, cv2.COLOR_BGR2GRAY))
                diff_ratio = np.sum(diff > 50) / diff.size

                if diff_ratio > threshold:
                    timestamp = frame_idx / self.fps
                    filename = f"scene_change_{frame_idx:06d}_t{timestamp:.2f}s.png"
                    output_path = os.path.join(output_dir, filename)
                    cv2.imwrite(output_path, frame)
                    scenes.append((timestamp, output_path))

            prev_frame = frame
            frame_idx += 1

        return scenes

    def detect_ui_elements(self, frame_timestamp: float) -> Optional[Dict]:
        """Analyze UI elements at a specific timestamp."""
        frame_idx = int(frame_timestamp * self.fps)
        self.cap.set(cv2.CAP_PROP_POS_FRAMES, frame_idx)
        ret, frame = self.cap.read()

        if not ret:
            return None

        # Convert for analysis
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

        # Basic UI element detection using contours
        blur = cv2.GaussianBlur(gray, (5, 5), 0)
        thresh = cv2.threshold(blur, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)[1]
        contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

        ui_elements = []
        for contour in contours:
            area = cv2.contourArea(contour)
            if area > 1000:  # Filter small elements
                x, y, w, h = cv2.boundingRect(contour)
                ui_elements.append({
                    "position": (x, y),
                    "size": (w, h),
                    "area": area,
                    "aspect_ratio": w / h if h > 0 else 0
                })

        # Sort by area (largest first)
        ui_elements.sort(key=lambda x: x["area"], reverse=True)

        return {
            "timestamp": frame_timestamp,
            "frame_size": (self.width, self.height),
            "ui_elements": ui_elements[:20]  # Top 20 largest elements
        }

    def generate_analysis_report(self) -> Dict:
        """Generate comprehensive analysis report."""
        info = self.get_video_info()

        return {
            "video_info": info,
            "analysis_recommendations": {
                "latency_check": f"Extract frames every {info['ms_per_frame']*2:.1f}ms and compare hand positions",
                "size_analysis": f"Measure cursor/target sizes relative to {self.height}px screen height",
                "pacing_analysis": "Look for transitions faster than 1-2 seconds",
                "child_friendly": "Check if targets are at least 5% of screen width"
            }
        }

    def close(self):
        """Release video resources."""
        self.cap.release()

def main():
    """CLI interface for video analysis."""
    import sys

    if len(sys.argv) < 2:
        print("Usage: python video_frame_analyzer.py <video_path> [command]")
        print("Commands:")
        print("  info          - Show video metadata")
        print("  extract       - Extract frames at 1-second intervals")
        print("  scenes        - Detect scene changes")
        sys.exit(1)

    video_path = sys.argv[1]
    command = sys.argv[2] if len(sys.argv) > 2 else "info"

    analyzer = VideoFrameAnalyzer(video_path)

    if command == "info":
        info = analyzer.get_video_info()
        print(json.dumps(info, indent=2))

    elif command == "extract":
        output_dir = os.path.join(os.path.dirname(video_path), "frames")
        frames = analyzer.extract_frames_at_intervals(output_dir, interval_seconds=0.5)
        print(f"Extracted {len(frames)} frames to {output_dir}")

    elif command == "scenes":
        output_dir = os.path.join(os.path.dirname(video_path), "scenes")
        scenes = analyzer.extract_scene_changes(output_dir)
        print(f"Found {len(scenes)} scene changes in {output_dir}")

    analyzer.close()

if __name__ == "__main__":
    main()
