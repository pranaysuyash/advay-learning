#!/usr/bin/env python3
"""
CV Integration Audit v3 - Uses path property from registry

Usage:
    python tools/audit_cv_integration_v3.py
"""

import re
import json
from pathlib import Path
from typing import Set, Dict

PROJECT_ROOT = Path("/Users/pranay/Projects/learning_for_kids")
FRONTEND_SRC = PROJECT_ROOT / "src/frontend/src"
REGISTRIES_DIR = FRONTEND_SRC / "data/gameRegistries"
PAGES_DIR = FRONTEND_SRC / "pages"


def extract_games_from_registry() -> Dict[str, Dict]:
    """Extract all games with their paths from registries."""
    games = {}

    for registry_file in REGISTRIES_DIR.glob("*.ts"):
        content = registry_file.read_text()

        # Find all game manifests with cv: ['hand']
        # Pattern to match each game object
        game_pattern = r'\{\s*id:\s*[\'"]([^\'"]+)[\'"]\s*,\s*name:\s*[\'"]([^\'"]+)[\'"]\s*,\s*path:\s*[\'"]([^\'"]+)[\'"][^}]*?cv:\s*\[\s*['\"]hand['\"]'

        matches = re.finditer(game_pattern, content, re.DOTALL)

        for match in matches:
            game_id = match.group(1)
            game_name = match.group(2)
            game_path = match.group(3)

            games[game_id] = {
                'name': game_name,
                'path': game_path,
                'registry_file': registry_file.name
            }

    return games


def find_game_file(game_path: str) -> Path:
    """Find the actual game file from the path property."""
    # Path is like '/games/alphabet-tracing'
    # File should be like AlphabetGame.tsx or similar

    # Extract from path and try common patterns
    # Remove leading '/games/'
    path_part = game_path.replace('/games/', '')

    # Try exact match first
    exact_file = PAGES_DIR / f"{path_part.title().replace('-', '')}.tsx"
    if exact_file.exists():
        return exact_file

    # Try common variations
    # 1. Direct PascalCase
    pascal_file = PAGES_DIR / f"{path_part.title().replace('-', '').replace(' ', '')}.tsx"
    if pascal_file.exists():
        return pascal_file

    # 2. With 'Game' suffix
    with_suffix = PAGES_DIR / f"{path_part.title().replace('-', '')}Game.tsx"
    if with_suffix.exists():
        return with_suffix

    # 3. 3D games in three/ subdirectory
    if '-3d' in path_part.lower():
        three_file = (PAGES_DIR / "three" / f"{path_part.title().replace('-', '').replace('-3d', '3D')}Game.tsx")
        if three_file.exists():
            return three_file
        # Try without Game suffix
        three_file2 = (PAGES_DIR / "three" / f"{path_part.title().replace('-', '').replace('-3d', '3D')}.tsx")
        if three_file2.exists():
            return three_file2

    return None


def check_cv_usage(file_path: Path) -> bool:
    """Check if a game file uses CV hooks."""
    if not file_path or not file_path.exists():
        return False

    content = file_path.read_text()

    cv_patterns = [
        "useGameHandTracking",
        "useGamePoseTracking",
        "useHandTracking",
        "MediaPipeHands",
        "@mediapipe/hands",
        "@mediapipe/pose",
        "@mediapipe/task-vision",
        "HandTrackingRuntime",
        "useGameHandTrackingRuntime",
    ]

    return any(pattern in content for pattern in cv_patterns)


def main():
    print("=" * 70)
    print("CV Integration Audit v3 - Using Registry Path Mapping")
    print("=" * 70)

    # Step 1: Extract games from registry
    print("\n[1/5] Extracting games from registries...")
    registry_games = extract_games_from_registry()
    cv_games = {k: v for k, v in registry_games.items() if 'cv' in k or 'hand' in k.lower()}
    print(f"  Found {len(registry_games)} total games")
    print(f"  Found {len(cv_games)} games with cv: ['hand']")

    # Step 2: Find actual game files
    print("\n[2/5] Mapping registry games to files...")
    game_file_map = {}
    missing_files = []

    for game_id, game_info in cv_games.items():
        file_path = find_game_file(game_info['path'])
        if file_path:
            game_file_map[game_id] = {
                'file': file_path,
                'name': game_info['name'],
                'path': game_info['path']
            }
        else:
            missing_files.append(game_id)

    print(f"  Found {len(game_file_map)} game files")
    print(f"  Missing files: {len(missing_files)}")

    # Step 3: Check CV usage
    print("\n[3/5] Checking CV hook usage...")
    using_cv = {}
    not_using_cv = {}

    for game_id, game_info in game_file_map.items():
        has_cv = check_cv_usage(game_info['file'])
        if has_cv:
            using_cv[game_id] = game_info
        else:
            not_using_cv[game_id] = game_info

    print(f"  Using CV hooks: {len(using_cv)}")
    print(f"  NOT using CV hooks: {len(not_using_cv)}")

    # Step 4: Find games that use CV but aren't declared
    print("\n[4/5] Checking for undeclared CV games...")
    all_game_files = {}

    # Scan all TSX files for CV usage
    for page_file in PAGES_DIR.glob("*.tsx"):
        content = page_file.read_text()
        has_cv = any(p in content for p in [
            "useGameHandTracking", "useGamePoseTracking",
            "MediaPipeHands", "@mediapipe/hands"
        ])
        if has_cv:
            game_id = page_file.stem.lower()
            all_game_files[game_id] = page_file

    for page_file in (PAGES_DIR / "three").glob("*.tsx"):
        content = page_file.read_text()
        has_cv = any(p in content for p in [
            "useGameHandTracking", "useGamePoseTracking",
            "MediaPipeHands", "@mediapipe/hands"
        ])
        if has_cv:
            game_id = page_file.stem.lower().replace('-3d', '')
            all_game_files[game_id] = page_file

    undeclared = set(all_game_files.keys()) - set(cv_games.keys())
    print(f"  Undeclared CV games: {len(undeclared)}")

    # Summary
    print("\n" + "=" * 70)
    print("AUDIT SUMMARY")
    print("=" * 70)
    print(f"Games with CV declared: {len(cv_games)}")
    print(f"Game files found: {len(game_file_map)}")
    print(f"")
    print(f"** GAPS: {len(not_using_cv)} games declare CV but don't use it **")
    print(f"** UNDECLARED: {len(undeclared)} games use CV but aren't declared **")
    print(f"")

    coverage = (len(using_cv) / max(len(cv_games), 1)) * 100
    print(f"Coverage: {coverage:.1f}% ({len(using_cv)}/{len(cv_games)})")

    # Detailed gap report
    if not_using_cv:
        print("\n" + "=" * 70)
        print(f"GAP DETAILS ({len(not_using_cv)} games):")
        print("=" * 70)
        for game_id, game_info in sorted(not_using_cv.items()):
            print(f"\n{game_id}:")
            print(f"  Name: {game_info['name']}")
            print(f"  File: {game_info['file']}")
            print(f"  Registry path: {game_info['path']}")

    # Save results
    results = {
        "total_cv_declared": len(cv_games),
        "files_found": len(game_file_map),
        "using_cv": len(using_cv),
        "not_using_cv": {k: v['name'] for k, v in not_using_cv.items()},
        "undeclared_cv": sorted(list(undeclared)),
        "coverage_percent": coverage,
        "missing_files": missing_files,
    }

    results_file = PROJECT_ROOT / "cv_audit_results.json"
    with open(results_file, "w") as f:
        json.dump(results, f, indent=2)

    print(f"\nResults saved to: {results_file}")


if __name__ == "__main__":
    main()
