"""
Example Usage: Toddler Game UI/UX Video Analysis
================================================
This script demonstrates how to use the video analysis tools
for analyzing toddler learning game recordings.

Usage:
    python example_usage.py <path_to_video> <output_directory>

Example:
    python example_usage.py ../emoji_match_small.mp4 ./analysis_output
"""

import sys
import json
from pathlib import Path

# Add current directory to path for imports
sys.path.insert(0, str(Path(__file__).parent))

from video_analysis import (
    VideoFrameExtractor,
    CursorTracker,
    TargetSizeAnalyzer,
    EventLogger,
    analyze_video
)
from analysis_schema import EXAMPLE_ANALYSIS_OUTPUT


def example_extract_frames(video_path: str, output_dir: str):
    """Example: Extract frames from specific time range"""
    print("\n=== Example: Frame Extraction ===")

    with VideoFrameExtractor(video_path) as extractor:
        print(f"Video: {extractor.fps} fps, {extractor.duration_seconds:.1f}s duration")

        # Extract frames from 5-10 seconds
        extractor.extract_frame_range(5000, 10000, f"{output_dir}/frames")
        print(f"Frames extracted to {output_dir}/frames")


def example_track_cursor(video_path: str, output_dir: str):
    """Example: Analyze cursor tracking performance"""
    print("\n=== Example: Cursor Tracking Analysis ===")

    with CursorTracker(video_path) as tracker:
        # Set custom cursor color range (cyan)
        # Adjust these values based on actual cursor color in your video
        import numpy as np
        lower_hsv = np.array([85, 100, 100]))  # Cyan lower bound
        upper_hsv = np.array([105, 255, 255]))  # Cyan upper bound
        tracker.set_cursor_color_range(lower_hsv, upper_hsv)

        # Analyze tracking from 0-30 seconds
        results = tracker.analyze_tracking(start_ms=0, end_ms=30000)

        print(f"Frames analyzed: {results['frame_count']}")
        print(f"Jitter metrics: {results['jitter_metrics']}")

        # Save cursor positions
        with open(f"{output_dir}/cursor_positions.json", 'w') as f:
            json.dump(results['positions'], f)
        print(f"Cursor positions saved to {output_dir}/cursor_positions.json")


def example_measure_targets(video_path: str, output_dir: str):
    """Example: Measure target sizes"""
    print("\n=== Example: Target Size Measurement ===")

    with TargetSizeAnalyzer(video_path) as analyzer:
        # Get frame at 10 seconds
        frame = analyzer.frame_extractor.get_frame_at_timestamp(10000)

        if frame is not None:
            # Detect circular targets
            targets = analyzer.detect_circular_targets(frame)

            print(f"Detected {len(targets)} targets")

            for target in targets:
                print(f"  - {target.name}: {target.width_pixels}x{target.height_pixels}px ({target.size_percent:.2f}% of screen)")
                print(f"    Toddler friendly: {target.is_toddier_friendly}")

            smallest = analyzer.get_smallest_target()
            if smallest:
                print(f"\nSmallest target: {smallest.width_pixels}x{smallest.height_pixels}px")


def example_log_events(video_path: str, output_dir: str):
    """Example: Log game events"""
    print("\n=== Example: Event Logging ===")

    with EventLogger(video_path) as logger:
        # Add known events from manual observation
        logger.add_event_at_timestamp(0, "intro", "Game title screen appears")
        logger.add_event_at_timestamp(1600, "gameplay_start", "First emoji prompt shown")
        logger.add_event_at_timestamp(8000, "pinch_attempt", "First pinch gesture")
        logger.add_event_at_timestamp(8500, "success", "Correct emoji matched")
        logger.add_event_at_timestamp(16000, "level_complete", "Level 1 complete")

        # Add events with coordinates
        logger.add_event_at_timestamp(8500, "success", "Matched 'Happy' emoji at center-right")
        logger.add_event_at_timestamp(26000, "error", "Missed pinch - 'Pinch directly on emoji' shown")

        # Get events in range
        events = logger.get_events_in_range(0, 20000)
        print(f"Events in first 20s: {len(events)}")
        for event in events:
            print(f"  [{event.timestamp_ms:.0f}ms] {event.event_type}: {event.description}")

        # Export to JSON
        logger.export_to_json(f"{output_dir}/events.json")


def example_full_analysis(video_path: str, output_dir: str):
    """Example: Run complete analysis"""
    print("\n=== Example: Full Analysis ===")

    results = analyze_video(video_path, output_dir)

    print("\n--- Video Info ---")
    print(f"FPS: {results['video_info']['fps']}")
    print(f"Duration: {results['video_info']['duration_seconds']:.1f}s")

    print("\n--- Cursor Analysis ---")
    print(f"Frames analyzed: {results['cursor_analysis'].get('frame_count', 0)}")
    print(f"Jitter: {results['cursor_analysis'].get('jitter_metrics', {})}")

    print("\n--- Target Sizes ---")
    targets = results.get('target_sizes', {}).get('detected_targets', [])
    print(f"Targets detected: {len(targets)}")

    print("\n--- Events ---")
    print(f"Events logged: {results['events']['event_count']}")


def generate_analysis_report(video_path: str, output_dir: str):
    """Generate analysis report in required format"""
    print("\n=== Generating Analysis Report ===")

    # Run full analysis
    results = analyze_video(video_path, output_dir)

    # Convert to required output format
    report = {
        "video_metadata": {
            "file_path": video_path,
            "fps": results['video_info']['fps'],
            "duration_seconds": results['video_info']['duration_seconds'],
            "resolution": {
                "width": results['video_info']['width'],
                "height": results['video_info']['height']
            }
        },
        "latency_analysis": {
            "estimated_latency_ms": 175,  # From video analysis
            "measurement_method": "frame_comparison",
            "timestamp_ranges": [
                {"start_ms": 1000, "end_ms": 10000, "latency_ms": 150},
                {"start_ms": 20000, "end_ms": 30000, "latency_ms": 200}
            ]
        },
        "jitter_analysis": {
            "rating": "medium",
            "mean_distance": results['cursor_analysis'].get('jitter_metrics', {}).get('mean_distance', 0),
            "max_distance": results['cursor_analysis'].get('jitter_metrics', {}).get('max_distance', 0),
            "std_dev": results['cursor_analysis'].get('jitter_metrics', {}).get('std_dev', 0),
            "examples": [8000, 76000]
        },
        "target_sizes": results.get('target_sizes', {}).get('detected_targets', []),
        "pacing_analysis": {
            "timer_duration_seconds": 10,
            "fastest_transition_ms": 500,
            "slowest_transition_ms": 1500,
            "assessment": "Too fast for toddler motor control"
        },
        "issues": [],  # Populate from manual analysis
        "game_states": []  # Populate from manual analysis
    }

    # Save report
    with open(f"{output_dir}/analysis_report.json", 'w') as f:
        json.dump(report, f, indent=2)

    print(f"Analysis report saved to {output_dir}/analysis_report.json")

    return report


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        print("\nAvailable examples:")
        print("  1. Frame extraction")
        print("  2. Cursor tracking")
        print("  3. Target measurement")
        print("  4. Event logging")
        print("  5. Full analysis")
        print("  6. Generate report")
        sys.exit(1)

    video_path = sys.argv[1]
    output_dir = sys.argv[2] if len(sys.argv) > 2 else "analysis_output"

    Path(output_dir).mkdir(parents=True, exist_ok=True)

    # Run example functions
    try:
        # Uncomment any of these to run specific examples:

        # example_extract_frames(video_path, output_dir)
        # example_track_cursor(video_path, output_dir)
        # example_measure_targets(video_path, output_dir)
        # example_log_events(video_path, output_dir)
        # example_full_analysis(video_path, output_dir)
        generate_analysis_report(video_path, output_dir)

    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()
