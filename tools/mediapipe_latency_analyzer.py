#!/usr/bin/env python3
"""
MediaPipe Hand Tracking Latency Analyzer
Measures delay between actual hand movement and on-screen pointer response.
"""

import cv2
import numpy as np
import json
from pathlib import Path
from typing import Dict, List, Tuple, Optional
import mediapipe as mp

class MediaPipeLatencyAnalyzer:
    def __init__(self, video_path: str):
        self.video_path = video_path
        self.cap = cv2.VideoCapture(video_path)
        self.fps = self.cap.get(cv2.CAP_PROP_FPS)
        self.ms_per_frame = 1000 / self.fps

        # Initialize MediaPipe Hands
        self.mp_hands = mp.solutions.hands
        self.hands = self.mp_hands.Hands(
            static_image_mode=True,
            max_num_hands=1,
            min_detection_confidence=0.5
        )

        # Pointer detection parameters (adjust based on actual pointer color)
        self.pointer_lower = np.array([0, 100, 100])  # Red lower bound (HSV)
        self.pointer_upper = np.array([10, 255, 255])  # Red upper bound (HSV)

    def detect_hand_position(self, frame: np.ndarray) -> Optional[Tuple[int, int]]:
        """Detect index finger tip position using MediaPipe."""
        results = self.hands.process(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))

        if results.multi_hand_landmarks:
            hand_landmarks = results.multi_hand_landmarks[0]
            # Get index finger tip (landmark 8)
            index_tip = hand_landmarks.landmark[8]
            h, w = frame.shape[:2]
            return (int(index_tip.x * w), int(index_tip.y * h))
        return None

    def detect_pointer_position(self, frame: np.ndarray) -> Optional[Tuple[int, int]]:
        """Detect red pointer/cursor position on screen."""
        hsv = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)
        mask = cv2.inRange(hsv, self.pointer_lower, self.pointer_upper)

        contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

        if contours:
            # Find largest red contour (likely the pointer)
            largest_contour = max(contours, key=cv2.contourArea)
            if cv2.contourArea(largest_contour) > 10:  # Filter noise
                M = cv2.moments(largest_contour)
                if M["m00"] > 0:
                    cx = int(M["m10"] / M["m00"])
                    cy = int(M["m01"] / M["m00"])
                    return (cx, cy)
        return None

    def analyze_latency(self, max_frames: int = None) -> List[Dict]:
        """
        Analyze latency by comparing hand and pointer positions across frames.
        Returns list of latency measurements with timestamps.
        """
        latency_data = []
        frame_count = int(self.cap.get(cv2.CAP_PROP_FRAME_COUNT))

        if max_frames:
            frame_count = min(frame_count, max_frames)

        # Store consecutive frames for movement analysis
        prev_hand_pos = None
        prev_pointer_pos = None
        frame_idx = 0

        print(f"Analyzing {frame_count} frames at {self.fps:.2f} fps...")
        print(f"Each frame = {self.ms_per_frame:.2f}ms")

        while frame_idx < frame_count:
            self.cap.set(cv2.CAP_PROP_POS_FRAMES, frame_idx)
            ret, frame = self.cap.read()
            if not ret:
                break

            timestamp = frame_idx / self.fps

            # Detect positions
            hand_pos = self.detect_hand_position(frame)
            pointer_pos = self.detect_pointer_position(frame)

            if hand_pos and pointer_pos:
                # Calculate distance between hand and pointer
                distance = np.sqrt((hand_pos[0] - pointer_pos[0])**2 +
                                 (hand_pos[1] - pointer_pos[1])**2)

                data_point = {
                    "frame": frame_idx,
                    "timestamp": round(timestamp, 3),
                    "hand_position": hand_pos,
                    "pointer_position": pointer_pos,
                    "distance_pixels": distance,
                    "lag_detected": distance > 50  # Significant lag threshold
                }

                # Calculate movement rates for latency estimation
                if prev_hand_pos and prev_pointer_pos:
                    hand_movement = np.sqrt((hand_pos[0] - prev_hand_pos[0])**2 +
                                          (hand_pos[1] - prev_hand_pos[1])**2)
                    pointer_movement = np.sqrt((pointer_pos[0] - prev_pointer_pos[0])**2 +
                                             (pointer_pos[1] - prev_pointer_pos[1])**2)

                    # Estimate latency: if hand moved but pointer didn't follow yet
                    if hand_movement > 30 and pointer_movement < 10:
                        estimated_latency_frames = 0
                        # Look ahead to see when pointer catches up
                        for look_ahead in range(1, 10):
                            if frame_idx + look_ahead < frame_count:
                                self.cap.set(cv2.CAP_PROP_POS_FRAMES, frame_idx + look_ahead)
                                ret_ahead, frame_ahead = self.cap.read()
                                if ret_ahead:
                                    pointer_ahead = self.detect_pointer_position(frame_ahead)
                                    if pointer_ahead:
                                        pointer_movement_ahead = np.sqrt(
                                            (pointer_ahead[0] - prev_pointer_pos[0])**2 +
                                            (pointer_ahead[1] - prev_pointer_pos[1])**2
                                        )
                                        if pointer_movement_ahead > 20:
                                            estimated_latency_frames = look_ahead
                                            break

                        data_point["estimated_latency_ms"] = estimated_latency_frames * self.ms_per_frame
                        data_point["hand_movement"] = hand_movement
                        data_point["pointer_movement"] = pointer_movement

                latency_data.append(data_point)
                prev_hand_pos = hand_pos
                prev_pointer_pos = pointer_pos

            frame_idx += 30  # Analyze every 30 frames (0.5s at 60fps)

        return latency_data

    def generate_latency_report(self, latency_data: List[Dict]) -> Dict:
        """Generate comprehensive latency analysis report."""
        if not latency_data:
            return {"error": "No tracking data detected"}

        # Filter data points with detected lag
        lag_events = [d for d in latency_data if d.get("lag_detected", False)]
        latency_measurements = [d for d in latency_data if "estimated_latency_ms" in d]

        # Calculate statistics
        distances = [d["distance_pixels"] for d in latency_data]
        avg_distance = np.mean(distances)
        max_distance = np.max(distances)

        report = {
            "video_analysis": {
                "total_frames_analyzed": len(latency_data),
                "fps": round(self.fps, 2),
                "ms_per_frame": round(self.ms_per_frame, 2),
                "analysis_interval": "every 30 frames (0.5s)"
            },
            "tracking_performance": {
                "avg_hand_pointer_distance": round(avg_distance, 2),
                "max_hand_pointer_distance": round(max_distance, 2),
                "lag_events_detected": len(lag_events),
                "lag_percentage": round(len(lag_events) / len(latency_data) * 100, 1)
            },
            "latency_measurements": {
                "total_measurements": len(latency_measurements),
                "latencies_ms": [round(d["estimated_latency_ms"], 1) for d in latency_measurements if d.get("estimated_latency_ms", 0) > 0]
            }
        }

        if latency_measurements:
            latencies = [d["estimated_latency_ms"] for d in latency_measurements if d.get("estimated_latency_ms", 0) > 0]
            if latencies:
                report["latency_measurements"]["min_latency_ms"] = round(min(latencies), 1)
                report["latency_measurements"]["max_latency_ms"] = round(max(latencies), 1)
                report["latency_measurements"]["avg_latency_ms"] = round(np.mean(latencies), 1)

        # Detailed lag events
        report["significant_lag_events"] = [
            {
                "timestamp": d["timestamp"],
                "estimated_latency_ms": d.get("estimated_latency_ms", 0),
                "hand_position": d["hand_position"],
                "pointer_position": d["pointer_position"],
                "distance_pixels": round(d["distance_pixels"], 1)
            }
            for d in latency_measurements if d.get("estimated_latency_ms", 0) > 100  # >100ms lag
        ]

        return report

    def close(self):
        """Release resources."""
        self.cap.release()
        self.hands.close()

def main():
    """CLI interface for latency analysis."""
    import sys

    if len(sys.argv) < 2:
        print("Usage: python mediapipe_latency_analyzer.py <video_path> [output_json]")
        sys.exit(1)

    video_path = sys.argv[1]
    output_file = sys.argv[2] if len(sys.argv) > 2 else None

    analyzer = MediaPipeLatencyAnalyzer(video_path)

    try:
        print("Starting MediaPipe latency analysis...")
        latency_data = analyzer.analyze_latency()

        if latency_data:
            report = analyzer.generate_latency_report(latency_data)

            print("\n" + "="*60)
            print("MEDIAPIPE TRACKING LATENCY ANALYSIS REPORT")
            print("="*60)

            print(f"\n📊 Video Analysis:")
            print(f"   Frames analyzed: {report['video_analysis']['total_frames_analyzed']}")
            print(f"   Frame rate: {report['video_analysis']['fps']} fps")
            print(f"   Frame duration: {report['video_analysis']['ms_per_frame']} ms")

            print(f"\n🎯 Tracking Performance:")
            print(f"   Avg hand-pointer distance: {report['tracking_performance']['avg_hand_pointer_distance']} px")
            print(f"   Max hand-pointer distance: {report['tracking_performance']['max_hand_pointer_distance']} px")
            print(f"   Lag events detected: {report['tracking_performance']['lag_events_detected']}")
            print(f"   Lag percentage: {report['tracking_performance']['lag_percentage']}%")

            if report['latency_measurements'].get('latencies_ms'):
                print(f"\n⚡ Latency Measurements:")
                print(f"   Min latency: {report['latency_measurements'].get('min_latency_ms', 'N/A')} ms")
                print(f"   Max latency: {report['latency_measurements'].get('max_latency_ms', 'N/A')} ms")
                print(f"   Avg latency: {report['latency_measurements'].get('avg_latency_ms', 'N/A')} ms")

                # Toddler-friendly assessment
                avg_lat = report['latency_measurements'].get('avg_latency_ms', 0)
                if avg_lat > 0:
                    if avg_lat < 100:
                        rating = "✅ EXCELLENT - Suitable for toddlers"
                    elif avg_lat < 200:
                        rating = "⚠️ ACCEPTABLE - May cause minor confusion"
                    else:
                        rating = "❌ POOR - Will frustrate toddlers"
                    print(f"   Toddler-friendly rating: {rating}")

            if report.get('significant_lag_events'):
                print(f"\n🚨 Significant Lag Events (>100ms):")
                for event in report['significant_lag_events'][:5]:  # Show first 5
                    print(f"   t={event['timestamp']}s: {event['estimated_latency_ms']}ms lag")
                    print(f"      Hand: {event['hand_position']} → Pointer: {event['pointer_position']}")
                    print(f"      Distance: {event['distance_pixels']}px")

            if output_file:
                with open(output_file, 'w') as f:
                    json.dump(report, f, indent=2)
                print(f"\n📁 Report saved to: {output_file}")

        else:
            print("❌ No tracking data detected. Check:")
            print("   - Is your hand visible in the video?")
            print("   - Is there a red pointer/cursor on screen?")
            print("   - Adjust pointer color detection parameters if needed")

    finally:
        analyzer.close()

if __name__ == "__main__":
    main()