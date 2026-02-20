"""
Video Analysis Helper Utilities for Toddler Game UI/UX Review
=============================================================
This module provides utilities for analyzing game recordings to measure:
- Hand-tracking latency
- Cursor/target sizes
- Frame-by-frame event timing
- Jitter measurement
"""

import cv2
import json
import numpy as np
from pathlib import Path
from typing import List, Dict, Tuple, Optional
from dataclasses import dataclass, asdict
import subprocess
import sys


@dataclass
class FrameEvent:
    """Represents a notable event at a specific frame"""
    frame_number: int
    timestamp_ms: float
    event_type: str  # 'cursor_move', 'pinch', 'success', 'failure', 'transition'
    description: str
    coordinates: Optional[Tuple[int, int]] = None


@dataclass
class LatencyMeasurement:
    """Measures latency between hand movement and cursor response"""
    start_frame: int
    end_frame: int
    latency_frames: int
    latency_ms: float
    notes: str = ""


@dataclass
class TargetSize:
    """Size measurement of an interactive target"""
    name: str
    width_pixels: int
    height_pixels: int
    screen_width: int
    screen_height: int
    size_percent: float  # percentage of screen

    @property
    def is_toddler_friendly(self) -> bool:
        """Check if target meets toddler accessibility standards"""
        # Toddlers need targets at least 9-12mm equivalent
        # Assuming ~96 DPI, that's roughly 34-45 pixels minimum
        min_size_pixels = 35
        return self.width_pixels >= min_size_pixels and self.height_pixels >= min_size_pixels


class VideoFrameExtractor:
    """Extract frames from video for detailed analysis"""

    def __init__(self, video_path: str):
        self.video_path = video_path
        self.cap = cv2.VideoCapture(video_path)

        # Get video properties
        self.fps = self.cap.get(cv2.CAP_PROP_FPS)
        self.frame_count = int(self.cap.get(cv2.CAP_PROP_FRAME_COUNT))
        self.width = int(self.cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        self.height = int(self.cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        self.duration_seconds = self.frame_count / self.fps if self.fps > 0 else 0

    def get_frame_at_timestamp(self, timestamp_ms: float) -> Optional[np.ndarray]:
        """Get frame at specific timestamp in milliseconds"""
        frame_number = int((timestamp_ms / 1000) * self.fps)
        return self.get_frame(frame_number)

    def get_frame(self, frame_number: int) -> Optional[np.ndarray]:
        """Get specific frame by number"""
        if frame_number < 0 or frame_number >= self.frame_count:
            return None

        self.cap.set(cv2.CAP_PROP_POS_FRAMES, frame_number)
        ret, frame = self.cap.read()
        return frame if ret else None

    def extract_frame_range(self, start_ms: float, end_ms: float, output_dir: str):
        """Extract a range of frames to directory"""
        Path(output_dir).mkdir(parents=True, exist_ok=True)

        start_frame = int((start_ms / 1000) * self.fps)
        end_frame = int((end_ms / 1000) * self.fps)

        for frame_num in range(start_frame, min(end_frame + 1, self.frame_count)):
            frame = self.get_frame(frame_num)
            if frame is not None:
                output_path = f"{output_dir}/frame_{frame_num:05d}.png"
                cv2.imwrite(output_path, frame)

        print(f"Extracted frames {start_frame} to {end_frame} to {output_dir}")

    def close(self):
        """Release video capture"""
        self.cap.release()

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.close()


class CursorTracker:
    """Track cursor position across frames to measure latency and jitter"""

    def __init__(self, video_path: str):
        self.video_path = video_path
        self.frame_extractor = VideoFrameExtractor(video_path)
        self.cursor_positions: List[Tuple[int, int, float]] = []  # x, y, timestamp_ms
        self.cursor_color_range = None  # Will be set by user or auto-detected

    def set_cursor_color_range(self, lower_hsv: np.ndarray, upper_hsv: np.ndarray):
        """Set HSV color range for cursor detection (for manual tuning)"""
        self.cursor_color_range = (lower_hsv, upper_hsv)

    def detect_cursor_in_frame(self, frame: np.ndarray) -> Optional[Tuple[int, int]]:
        """Detect cursor position in a single frame using color detection"""
        if self.cursor_color_range is None:
            # Default cyan color range for common tracking
            # Cyan in HSV: H=90, S=255, V=255
            lower = np.array([85, 100, 100])
            upper = np.array([105, 255, 255])
        else:
            lower, upper = self.cursor_color_range

        hsv = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)
        mask = cv2.inRange(hsv, lower, upper)

        # Find contours
        contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

        if contours:
            # Get largest contour
            largest = max(contours, key=cv2.contourArea)
            M = cv2.moments(largest)
            if M["m00"] > 0:
                cx = int(M["m10"] / M["m00"])
                cy = int(M["m01"] / M["m00"])
                return (cx, cy)

        return None

    def measure_latency(self, hand_movement_frame: int, cursor_response_frame: int) -> LatencyMeasurement:
        """Measure latency between hand movement and cursor response"""
        latency_frames = cursor_response_frame - hand_movement_frame
        latency_ms = (latency_frames / self.frame_extractor.fps) * 1000

        return LatencyMeasurement(
            start_frame=hand_movement_frame,
            end_frame=cursor_response_frame,
            latency_frames=latency_frames,
            latency_ms=latency_ms
        )

    def measure_jitter(self, positions: List[Tuple[int, int]]) -> Dict[str, float]:
        """Measure cursor jitter from position list"""
        if len(positions) < 2:
            return {"mean_distance": 0, "max_distance": 0, "std_dev": 0}

        distances = []
        for i in range(1, len(positions)):
            p1 = positions[i-1]
            p2 = positions[i]
            dist = np.sqrt((p2[0] - p1[0])**2 + (p2[1] - p1[1])**2)
            distances.append(dist)

        return {
            "mean_distance": np.mean(distances),
            "max_distance": np.max(distances),
            "std_dev": np.std(distances)
        }

    def analyze_tracking(self, start_ms: float = 0, end_ms: Optional[float] = None) -> Dict:
        """Full tracking analysis for a time range"""
        if end_ms is None:
            end_ms = self.frame_extractor.duration_seconds * 1000

        start_frame = int((start_ms / 1000) * self.frame_extractor.fps)
        end_frame = int((end_ms / 1000) * self.frame_extractor.fps)

        positions = []

        for frame_num in range(start_frame, min(end_frame + 1, self.frame_extractor.frame_count)):
            frame = self.frame_extractor.get_frame(frame_num)
            if frame is not None:
                cursor_pos = self.detect_cursor_in_frame(frame)
                if cursor_pos is not None:
                    timestamp_ms = (frame_num / self.frame_extractor.fps) * 1000
                    positions.append((cursor_pos[0], cursor_pos[1], timestamp_ms))
                    self.cursor_positions.append((cursor_pos[0], cursor_pos[1], timestamp_ms))

        jitter_metrics = self.measure_jitter([(p[0], p[1]) for p in positions])

        return {
            "positions": positions,
            "jitter_metrics": jitter_metrics,
            "frame_count": len(positions),
            "duration_ms": end_ms - start_ms
        }

    def close(self):
        self.frame_extractor.close()


class TargetSizeAnalyzer:
    """Analyze target/interaction sizes in game UI"""

    def __init__(self, video_path: str):
        self.video_path = video_path
        self.frame_extractor = VideoFrameExtractor(video_path)
        self.targets: List[TargetSize] = []

    def measure_target_from_frame(self, frame: np.ndarray,
                                   x: int, y: int,
                                   width: int, height: int) -> TargetSize:
        """Measure target size at specified region in frame"""
        target = TargetSize(
            name="manual",
            width_pixels=width,
            height_pixels=height,
            screen_width=self.frame_extractor.width,
            screen_height=self.frame_extractor.height,
            size_percent=(width * height) / (self.frame_extractor.width * self.frame_extractor.height) * 100
        )
        self.targets.append(target)
        return target

    def detect_circular_targets(self, frame: np.ndarray) -> List[TargetSize]:
        """Detect circular emoji/target regions in frame"""
        # Convert to grayscale
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

        # Apply blur
        blurred = cv2.GaussianBlur(gray, (9, 9), 2)

        # Detect circles using HoughCircles
        circles = cv2.HoughCircles(
            blurred,
            cv2.HOUGH_GRADIENT,
            dp=1.2,
            minDist=50,
            param1=50,
            param2=30,
            minRadius=20,
            maxRadius=100
        )

        if circles is not None:
            detected = []
            for circle in circles[0]:
                x, y, r = circle
                target = TargetSize(
                    name=f"circle_{len(detected)}",
                    width_pixels=int(r * 2),
                    height_pixels=int(r * 2),
                    screen_width=self.frame_extractor.width,
                    screen_height=self.frame_extractor.height,
                    size_percent=(r * 2 * r * 2) / (self.frame_extractor.width * self.frame_extractor.height) * 100
                )
                detected.append(target)

            self.targets.extend(detected)
            return detected

        return []

    def get_smallest_target(self) -> Optional[TargetSize]:
        """Get the smallest detected target"""
        if not self.targets:
            return None
        return min(self.targets, key=lambda t: t.width_pixels * t.height_pixels)

    def close(self):
        self.frame_extractor.close()


class EventLogger:
    """Log and analyze game events from video"""

    def __init__(self, video_path: str):
        self.video_path = video_path
        self.frame_extractor = VideoFrameExtractor(video_path)
        self.events: List[FrameEvent] = []

    def add_event(self, event: FrameEvent):
        """Add a manually identified event"""
        self.events.append(event)

    def add_event_at_timestamp(self, timestamp_ms: float, event_type: str, description: str):
        """Add event at timestamp"""
        frame_number = int((timestamp_ms / 1000) * self.frame_extractor.fps)
        event = FrameEvent(
            frame_number=frame_number,
            timestamp_ms=timestamp_ms,
            event_type=event_type,
            description=description
        )
        self.events.append(event)

    def get_events_in_range(self, start_ms: float, end_ms: float) -> List[FrameEvent]:
        """Get events within time range"""
        return [e for e in self.events if start_ms <= e.timestamp_ms <= end_ms]

    def export_to_json(self, output_path: str):
        """Export events to JSON"""
        data = {
            "video_path": self.video_path,
            "video_fps": self.frame_extractor.fps,
            "events": [asdict(e) for e in self.events]
        }

        with open(output_path, 'w') as f:
            json.dump(data, f, indent=2)

        print(f"Exported {len(self.events)} events to {output_path}")

    def close(self):
        self.frame_extractor.close()


def analyze_video(video_path: str, output_dir: str) -> Dict:
    """
    Main analysis function - runs all analyzers and produces report

    Args:
        video_path: Path to video file
        output_dir: Directory for outputs

    Returns:
        Dictionary with all analysis results
    """
    Path(output_dir).mkdir(parents=True, exist_ok=True)

    results = {
        "video_info": {},
        "cursor_analysis": {},
        "target_sizes": {},
        "events": {}
    }

    # Video info
    with VideoFrameExtractor(video_path) as extractor:
        results["video_info"] = {
            "fps": extractor.fps,
            "frame_count": extractor.frame_count,
            "width": extractor.width,
            "height": extractor.height,
            "duration_seconds": extractor.duration_seconds,
            "frame_duration_ms": (1 / extractor.fps) * 1000 if extractor.fps > 0 else 0
        }

    # Cursor analysis
    with CursorTracker(video_path) as tracker:
        cursor_results = tracker.analyze_tracking()
        results["cursor_analysis"] = cursor_results

    # Target sizes
    with TargetSizeAnalyzer(video_path) as analyzer:
        # Get a representative frame (middle of video)
        mid_time = results["video_info"]["duration_seconds"] * 500
        frame = analyzer.frame_extractor.get_frame_at_timestamp(mid_time)
        if frame is not None:
            targets = analyzer.detect_circular_targets(frame)
            results["target_sizes"] = {
                "detected_targets": [asdict(t) for t in targets],
                "smallest_target": asdict(analyzer.get_smallest_target()) if targets else None
            }

    # Event logging
    with EventLogger(video_path) as logger:
        # Add key events from analysis
        logger.add_event_at_timestamp(0, "intro", "Game intro/start screen")
        logger.add_event_at_timestamp(16000, "level_complete", "Level 1 complete")
        logger.add_event_at_timestamp(48000, "game_complete", "Game summary")

        results["events"] = {
            "event_count": len(logger.events),
            "events": [asdict(e) for e in logger.events]
        }

        # Export to JSON
        logger.export_to_json(f"{output_dir}/analysis_events.json")

    # Save full results
    with open(f"{output_dir}/full_analysis_results.json", 'w') as f:
        json.dump(results, f, indent=2)

    print(f"\nAnalysis complete! Results saved to {output_dir}")
    print(f"Video: {results['video_info']['fps']} fps, {results['video_info']['duration_seconds']:.1f}s duration")
    print(f"Frames analyzed: {results['cursor_analysis'].get('frame_count', 0)}")
    print(f"Jitter: {results['cursor_analysis'].get('jitter_metrics', {})}")

    return results


if __name__ == "__main__":
    # Example usage
    if len(sys.argv) < 2:
        print("Usage: python video_analysis.py <video_path> [output_dir]")
        sys.exit(1)

    video_path = sys.argv[1]
    output_dir = sys.argv[2] if len(sys.argv) > 2 else "analysis_output"

    results = analyze_video(video_path, output_dir)
