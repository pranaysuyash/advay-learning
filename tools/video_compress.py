#!/usr/bin/env python3
"""
Video Compression Tool for UX Analysis

Compresses large video recordings to under 100MB for AI analysis.
Uses ffmpeg to scale and compress while maintaining visual quality.

Usage:
    python tools/video_compress.py <input_video> [output_video]
    
Examples:
    # Compress to default output name (input_compressed.mp4)
    python tools/video_compress.py ~/Desktop/emoji_match.mov
    
    # Specify output name
    python tools/video_compress.py ~/Desktop/emoji_match.mov ~/Desktop/emoji_small.mp4
    
Requirements:
    - ffmpeg must be installed and available in PATH
"""

import argparse
import os
import subprocess
import sys
from pathlib import Path


def compress_video(input_path: str, output_path: str | None = None, target_width: int = 960) -> str:
    """
    Compress a video file using ffmpeg.
    
    Args:
        input_path: Path to input video file
        output_path: Path for output video (optional, defaults to input_compressed.mp4)
        target_width: Target width in pixels (default 960)
        
    Returns:
        Path to compressed video file
        
    Raises:
        FileNotFoundError: If input file doesn't exist
        RuntimeError: If ffmpeg fails
    """
    input_file = Path(input_path)
    
    if not input_file.exists():
        raise FileNotFoundError(f"Input file not found: {input_path}")
    
    # Generate output path if not provided
    if output_path is None:
        output_file = input_file.parent / f"{input_file.stem}_compressed.mp4"
    else:
        output_file = Path(output_path)
    
    # Build ffmpeg command
    # - scale to target width maintaining aspect ratio
    # - force height to be even (required by libx264)
    # - use libx264 codec with fast preset
    # - CRF 28 for good compression/quality balance
    # - remove audio (not needed for UI analysis)
    cmd = [
        "ffmpeg",
        "-i", str(input_file),
        "-vf", f"scale={target_width}:-2",
        "-c:v", "libx264",
        "-preset", "fast",
        "-crf", "28",
        "-an",  # no audio
        "-y",  # overwrite output
        str(output_file)
    ]
    
    print(f"Compressing: {input_file.name}")
    print(f"Output: {output_file}")
    print(f"Command: {' '.join(cmd)}")
    print("-" * 50)
    
    try:
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            check=True
        )
        
        # Get file sizes for comparison
        original_size = input_file.stat().st_size
        compressed_size = output_file.stat().st_size
        reduction = (1 - compressed_size / original_size) * 100
        
        print(f"✓ Compression complete!")
        print(f"  Original: {original_size / (1024*1024):.1f} MB")
        print(f"  Compressed: {compressed_size / (1024*1024):.1f} MB")
        print(f"  Reduction: {reduction:.1f}%")
        
        if compressed_size > 100 * 1024 * 1024:
            print(f"⚠ Warning: Compressed file is still >100MB ({compressed_size / (1024*1024):.1f} MB)")
            print("  Consider reducing target_width (e.g., --width 720)")
        
        return str(output_file)
        
    except subprocess.CalledProcessError as e:
        raise RuntimeError(f"ffmpeg failed: {e.stderr}")
    except FileNotFoundError:
        raise RuntimeError("ffmpeg not found. Please install ffmpeg first.")


def main():
    parser = argparse.ArgumentParser(
        description="Compress video files for AI analysis (target <100MB)",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  %(prog)s ~/Desktop/game_recording.mov
  %(prog)s ~/Desktop/game_recording.mov ~/Desktop/game_small.mp4 --width 720
        """
    )
    
    parser.add_argument("input", help="Input video file path")
    parser.add_argument("output", nargs="?", help="Output video file path (optional)")
    parser.add_argument(
        "--width", 
        type=int, 
        default=960,
        help="Target width in pixels (default: 960, lower = smaller file)"
    )
    
    args = parser.parse_args()
    
    try:
        output = compress_video(args.input, args.output, args.width)
        print(f"\nOutput saved to: {output}")
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
