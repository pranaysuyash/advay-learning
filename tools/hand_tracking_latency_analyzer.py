#!/usr/bin/env python3
"""
Hand Tracking Latency Analyzer
Measures delay between actual hand position and on-screen pointer response.
Uses OpenCV for motion analysis instead of MediaPipe hand detection.
"""

import cv2
import numpy as np
import json
from pathlib import Path
from typing import Dict, List, Tuple, Optional

class HandTrackingLatencyAnalyzer:
    def __init__(self, video_path: str):
        self.video_path = video_path
        self.cap = cv2.VideoCapture(video_path)
        self.fps = self.cap.get(cv2.CAP_PROP_FPS)
        self.ms_per_frame = 1000 / self.fps
        self.width = int(self.cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        self.height = int(self.cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

    def detect_pointer_position(self, frame: np.ndarray) -> Optional[Tuple[int, int]]:
        """Detect red pointer/cursor position on screen."""
        hsv = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)

        # Red color can be in two ranges in HSV
        lower1 = np.array([0, 100, 100])
        upper1 = np.array([10, 255, 255])
        lower2 = np.array([160, 100, 100])
        upper2 = np.array([180, 255, 255])

        mask1 = cv2.inRange(hsv, lower1, upper1)
        mask2 = cv2.inRange(hsv, lower2, upper2)
        mask = cv2.bitwise_or(mask1, mask2)

        contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

        if contours:
            # Find largest red contour
            largest_contour = max(contours, key=cv2.contourArea)
            if cv2.contourArea(largest_contour) > 20:  # Filter noise
                M = cv2.moments(largest_contour)
                if M["m00"] > 0:
                    cx = int(M["m10"] / M["m00"])
                    cy = int(M["m01"] / M["m00"])
                    return (cx, cy)
        return None

    def detect_hand_region_center(self, frame: np.ndarray) -> Optional[Tuple[int, int]]:
        """Detect hand region using skin tone detection."""
        hsv = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)

        # Skin tone range (adjust for different skin tones)
        lower_skin = np.array([0, 20, 70], dtype=np.uint8)
        upper_skin = np.array([20, 255, 255], dtype=np.uint8)

        mask = cv2.inRange(hsv, lower_skin, upper_skin)

        # Apply morphological operations to reduce noise
        kernel = np.ones((3, 3), np.uint8)
        mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, kernel, iterations=2)
        mask = cv2.morphologyEx(mask, cv2.MORPH_DILATE, kernel, iterations=2)

        contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

        if contours:
            # Find largest skin-colored region (likely hand)
            largest_contour = max(contours, key=cv2.contourArea)
            if cv2.contourArea(largest_contour) > 1000:  # Minimum hand size
                M = cv2.moments(largest_contour)
                if M["m00"] > 0:
                    cx = int(M["m10"] / M["m00"])
                    cy = int(M["m01"] / M["m00"])
                    return (cx, cy)
        return None

    def analyze_tracking_latency(self, max_frames: int = 100) -> List[Dict]:
        """
        Analyze tracking latency by comparing hand and pointer positions.
        """
        tracking_data = []
        frame_count = int(self.cap.get(cv2.CAP_PROP_FRAME_COUNT))
        analyze_count = min(frame_count, max_frames)

        print(f"📊 Analyzing {analyze_count} frames at {self.fps:.2f} fps...")
        print(f"⏱️  Each frame = {self.ms_per_frame:.2f}ms")

        # Look for significant movements to measure lag
        prev_pointer = None
        prev_hand = None
        movement_started = None

        for frame_idx in range(0, analyze_count, 5):  # Every 5th frame
            self.cap.set(cv2.CAP_PROP_POS_FRAMES, frame_idx)
            ret, frame = self.cap.read()
            if not ret:
                break

            timestamp = frame_idx / self.fps

            pointer_pos = self.detect_pointer_position(frame)
            hand_pos = self.detect_hand_region_center(frame)

            if pointer_pos and hand_pos:
                distance = np.sqrt((hand_pos[0] - pointer_pos[0])**2 +
                                 (hand_pos[1] - pointer_pos[1])**2)

                data_point = {
                    "frame": frame_idx,
                    "timestamp": round(timestamp, 3),
                    "pointer_position": pointer_pos,
                    "hand_position": hand_pos,
                    "distance_pixels": round(distance, 2),
                    "lag_detected": distance > 30  # Significant lag threshold
                }

                # Detect movement patterns
                if prev_pointer:
                    pointer_movement = np.sqrt((pointer_pos[0] - prev_pointer[0])**2 +
                                             (pointer_pos[1] - prev_pointer[1])**2)
                    data_point["pointer_movement"] = round(pointer_movement, 2)

                    if pointer_movement > 50:  # Significant pointer movement
                        if movement_started is None:
                            movement_started = timestamp
                        else:
                            # Calculate time since movement started
                            lag_time = (timestamp - movement_started) * 1000
                            data_point["movement_lag_ms"] = round(lag_time, 1)

                tracking_data.append(data_point)
                prev_pointer = pointer_pos
                prev_hand = hand_pos

        return tracking_data

    def generate_tracking_report(self, tracking_data: List[Dict]) -> Dict:
        """Generate comprehensive tracking analysis report."""
        if not tracking_data:
            return {"error": "No tracking data detected"}

        # Calculate statistics
        distances = [d["distance_pixels"] for d in tracking_data]
        lag_events = [d for d in tracking_data if d["lag_detected"]]

        # Movement analysis
        movements = [d["pointer_movement"] for d in tracking_data if "pointer_movement" in d]
        avg_movement = np.mean(movements) if movements else 0

        # Lag measurements
        lag_times = [d["movement_lag_ms"] for d in tracking_data if "movement_lag_ms" in d]

        report = {
            "video_metadata": {
                "fps": round(self.fps, 2),
                "ms_per_frame": round(self.ms_per_frame, 2),
                "resolution": f"{self.width}x{self.height}",
                "frames_analyzed": len(tracking_data)
            },
            "tracking_performance": {
                "avg_hand_pointer_distance": round(np.mean(distances), 2),
                "max_hand_pointer_distance": round(np.max(distances), 2),
                "std_hand_pointer_distance": round(np.std(distances), 2),
                "lag_events": len(lag_events),
                "lag_percentage": round(len(lag_events) / len(tracking_data) * 100, 1)
            },
            "movement_analysis": {
                "avg_pointer_movement": round(avg_movement, 2),
                "significant_movements": len([m for m in movements if m > 50])
            }
        }

        if lag_times:
            report["latency_measurements"] = {
                "min_latency_ms": round(min(lag_times), 1),
                "max_latency_ms": round(max(lag_times), 1),
                "avg_latency_ms": round(np.mean(lag_times), 1),
                "total_lag_events": len(lag_times)
            }

        # Worst lag events
        worst_events = sorted(tracking_data,
                           key=lambda x: x.get("distance_pixels", 0),
                           reverse=True)[:5]

        report["worst_tracking_events"] = [
            {
                "timestamp": d["timestamp"],
                "distance_pixels": d["distance_pixels"],
                "pointer_pos": d["pointer_position"],
                "hand_pos": d["hand_position"]
            }
            for d in worst_events if d["distance_pixels"] > 50
        ]

        return report

    def close(self):
        """Release resources."""
        self.cap.release()

def main():
    """CLI interface for tracking analysis."""
    import sys

    if len(sys.argv) < 2:
        print("Usage: python hand_tracking_latency_analyzer.py <video_path> [output_json]")
        sys.exit(1)

    video_path = sys.argv[1]
    output_file = sys.argv[2] if len(sys.argv) > 2 else None

    analyzer = HandTrackingLatencyAnalyzer(video_path)

    try:
        print("🎯 Hand Tracking Latency Analysis")
        print("=" * 60)

        tracking_data = analyzer.analyze_tracking_latency(max_frames=200)

        if tracking_data:
            report = analyzer.generate_tracking_report(tracking_data)

            print("\n📊 TRACKING PERFORMANCE REPORT")
            print("=" * 60)

            meta = report["video_metadata"]
            perf = report["tracking_performance"]

            print(f"\n📹 Video Analysis:")
            print(f"   Resolution: {meta['resolution']}")
            print(f"   Frame rate: {meta['fps']} fps")
            print(f"   Frame duration: {meta['ms_per_frame']} ms")
            print(f"   Frames analyzed: {meta['frames_analyzed']}")

            print(f"\n🎯 Tracking Performance:")
            print(f"   Avg hand-pointer distance: {perf['avg_hand_pointer_distance']} px")
            print(f"   Max hand-pointer distance: {perf['max_hand_pointer_distance']} px")
            print(f"   Std deviation: {perf['std_hand_pointer_distance']} px")
            print(f"   Lag events (>30px): {perf['lag_events']}")
            print(f"   Lag percentage: {perf['lag_percentage']}%")

            if "latency_measurements" in report:
                lat = report["latency_measurements"]
                print(f"\n⚡ Latency Measurements:")
                print(f"   Min latency: {lat['min_latency_ms']} ms")
                print(f"   Max latency: {lat['max_latency_ms']} ms")
                print(f"   Avg latency: {lat['avg_latency_ms']} ms")

                # Toddler-friendly assessment
                avg_lat = lat['avg_latency_ms']
                if avg_lat < 100:
                    rating = "✅ EXCELLENT - Suitable for toddlers"
                elif avg_lat < 200:
                    rating = "⚠️ ACCEPTABLE - May cause minor confusion"
                else:
                    rating = "❌ POOR - Will frustrate toddlers"
                print(f"   Toddler-friendly rating: {rating}")

            mov = report["movement_analysis"]
            print(f"\n🔄 Movement Analysis:")
            print(f"   Avg pointer movement: {mov['avg_pointer_movement']} px")
            print(f"   Significant movements: {mov['significant_movements']}")

            if report.get("worst_tracking_events"):
                print(f"\n🚨 Worst Tracking Events:")
                for event in report["worst_tracking_events"]:
                    print(f"   t={event['timestamp']}s:")
                    print(f"      Distance: {event['distance_pixels']}px")
                    print(f"      Pointer: {event['pointer_pos']}")
                    print(f"      Hand: {event['hand_pos']}")

            if output_file:
                with open(output_file, 'w') as f:
                    json.dump(report, f, indent=2)
                print(f"\n📁 Report saved to: {output_file}")

        else:
            print("❌ No tracking data detected.")
            print("   Check if red pointer and hand are visible in video.")

    finally:
        analyzer.close()

if __name__ == "__main__":
    main()