#!/usr/bin/env python3
"""
CV Integration Audit Script v2

Identifies games that declare CV support but don't implement it.

Usage:
    python tools/audit_cv_integration_v2.py
"""

import re
from pathlib import Path
from typing import Set, Dict

PROJECT_ROOT = Path("/Users/pranay/Projects/learning_for_kids")
FRONTEND_SRC = PROJECT_ROOT / "src/frontend/src"
REGISTRIES_DIR = FRONTEND_SRC / "data/gameRegistries"
PAGES_DIR = FRONTEND_SRC / "pages"


def get_all_game_files() -> Dict[str, Path]:
    """Get mapping of game ID to file path."""
    game_files = {}

    for page_file in PAGES_DIR.glob("*.tsx"):
        # Skip non-game files
        if page_file.name in [
            'Dashboard.tsx', 'Login.tsx', 'Register.tsx', 'ForgotPassword.tsx',
            'Home.tsx', 'Profile.tsx', 'Settings.tsx', 'OnboardingFlow.tsx',
            'BetaThreeDHoldback.tsx'
        ]:
            continue
        game_id = page_file.stem
        game_files[game_id.lower()] = page_file  # Store as lowercase for matching

    # Also check three/ subdirectory
    three_dir = PAGES_DIR / "three"
    if three_dir.exists():
        for page_file in three_dir.glob("*.tsx"):
            game_id = page_file.stem
            # Remove -3d suffix for matching
            base_id = game_id.replace('-3d', '').lower()
            game_files[base_id] = page_file

    return game_files


def extract_cv_declared_games() -> Set[str]:
    """Extract all game IDs that declare cv: ['hand'] in registries."""
    cv_games = set()

    for registry_file in REGISTRIES_DIR.glob("*.ts"):
        content = registry_file.read_text()
        # Find all game IDs that have cv: ['hand']
        matches = re.findall(r"id:\s*'([^']+)'[^}]*?cv:\s*\[\s*['\"]hand['\"]", content, re.DOTALL)
        cv_games.update(matches)

    return cv_games


def check_hook_usage(game_file: Path) -> bool:
    """Check if a game file actually uses CV hooks."""
    if not game_file.exists():
        return False

    content = game_file.read_text()

    # Check for various CV hook patterns
    cv_patterns = [
        "useGameHandTracking",
        "useGamePoseTracking",
        "useHandTracking",
        "MediaPipeHands",
        "@mediapipe/hands",
        "@mediapipe/pose",
        "@mediapipe/task-vision",
        "HandTrackingRuntime",
    ]

    return any(pattern in content for pattern in cv_patterns)


def main():
    print("=" * 60)
    print("CV Integration Audit v2")
    print("=" * 60)

    # Step 1: Get all game files
    print("\n[1/4] Mapping game files...")
    game_files = get_all_game_files()
    print(f"  Found {len(game_files)} game files")

    # Step 2: Get games that declare CV support
    print("\n[2/4] Extracting games with CV declarations...")
    cv_declared = extract_cv_declared_games()
    print(f"  Found {len(cv_declared)} games with cv: ['hand']")

    # Step 3: Check which games actually use CV
    print("\n[3/4] Checking CV hook usage...")
    hook_using = set()
    for game_id, file_path in game_files.items():
        if check_hook_usage(file_path):
            hook_using.add(game_id)

    print(f"  Found {len(hook_using)} games using CV hooks")

    # Step 4: Identify gaps
    print("\n[4/4] Identifying gaps...")
    cv_declared_lower = {g.lower() for g in cv_declared}
    hook_using_lower = {g.lower() for g in hook_using}

    # Games that declare CV but don't use hooks
    gaps = cv_declared_lower - hook_using_lower
    # Games that use hooks but aren't declared
    undeclared = hook_using_lower - cv_declared_lower

    print(f"  Games with CV declared: {len(cv_declared_lower)}")
    print(f"  Games using CV hooks: {len(hook_using_lower)}")
    print(f"  GAPS (declare but don't use): {len(gaps)}")
    print(f"  Undeclared (use but not declared): {len(undeclared)}")

    # Detailed gap analysis
    if gaps:
        print("\n" + "=" * 60)
        print(f"GAPS ({len(gaps)} games that declare CV but don't use it):")
        print("=" * 60)

        for game_id in sorted(gaps):
            file_path = game_files.get(game_id)
            if file_path:
                has_cv = check_hook_usage(file_path)
                print(f"\n{game_id}:")
                print(f"  File: {file_path}")
                print(f"  CV usage detected: {has_cv}")
            else:
                print(f"\n{game_id}:")
                print(f"  File: NOT FOUND")
                print(f"  Status: Game may not be implemented")

    if undeclared:
        print("\n" + "=" * 60)
        print(f"UNDECLARED ({len(undeclared)} games that use CV but aren't declared):")
        print("=" * 60)
        for game_id in sorted(undeclared)[:10]:
            print(f"  - {game_id}")
        if len(undeclared) > 10:
            print(f"  ... and {len(undeclared) - 10} more")

    # Summary
    print("\n" + "=" * 60)
    print("AUDIT SUMMARY")
    print("=" * 60)
    total_games = len(cv_declared_lower) + len(undeclared)
    implemented = len(hook_using_lower)
    coverage = (implemented / max(total_games, 1)) * 100
    print(f"Total games with CV: {total_games}")
    print(f"CV implementations: {implemented}")
    print(f"Gaps to fix: {len(gaps)}")
    print(f"Coverage: {coverage:.1f}%")

    # Save results
    import json
    results = {
        "total_cv_games": total_games,
        "cv_declared": sorted(list(cv_declared)),
        "hook_using": sorted(list(hook_using)),
        "gaps": sorted(list(gaps)),
        "undeclared": sorted(list(undeclared)),
        "coverage_percent": coverage,
    }

    results_file = PROJECT_ROOT / "cv_audit_results.json"
    with open(results_file, "w") as f:
        json.dump(results, f, indent=2)

    print(f"\nResults saved to: {results_file}")


if __name__ == "__main__":
    main()
