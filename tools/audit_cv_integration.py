#!/usr/bin/env python3
"""
CV Integration Audit Script

Identifies games that declare CV support but don't implement it.

Usage:
    python tools/audit_cv_integration.py
"""

import re
import subprocess
from pathlib import Path
from collections import defaultdict
from typing import Set, Dict, List

PROJECT_ROOT = Path("/Users/pranay/Projects/learning_for_kids")
FRONTEND_SRC = PROJECT_ROOT / "src/frontend/src"
REGISTRIES_DIR = FRONTEND_SRC / "data/gameRegistries"
PAGES_DIR = FRONTEND_SRC / "pages"


def extract_cv_declared_games() -> Set[str]:
    """Extract all game IDs that declare cv: ['hand'] in registries."""
    cv_games = set()

    for registry_file in REGISTRIES_DIR.glob("*.ts"):
        content = registry_file.read_text()
        # Find all game IDs that have cv: ['hand']
        # Pattern: id: 'game-id',\n...\n    cv: ['hand'],
        matches = re.findall(r"id:\s*'([^']+)'[^}]*?cv:\s*\[\s*['\"]hand['\"]", content, re.DOTALL)
        cv_games.update(matches)

    return cv_games


def extract_hook_using_games() -> Set[str]:
    """Extract all game IDs that actually use useGameHandTracking."""
    hook_games = set()

    # Search in pages directory
    for page_file in PAGES_DIR.glob("*.tsx"):
        content = page_file.read_text()

        # Check if file uses useGameHandTracking
        if "useGameHandTracking" in content:
            # Extract game ID from file name or from path
            game_id = page_file.stem
            hook_games.add(game_id)

        # Also check for direct MediaPipe usage
        if "MediaPipeHands" in content or "@mediapipe/hands" in content:
            game_id = page_file.stem
            hook_games.add(game_id)

    # Also check in three/ subdirectory
    for page_file in (PAGES_DIR / "three").glob("*.tsx"):
        content = page_file.read_text()
        if "useGameHandTracking" in content:
            game_id = page_file.stem
            hook_games.add(game_id)

    return hook_games


def get_all_game_files() -> Dict[str, Path]:
    """Get mapping of game ID to file path."""
    game_files = {}

    for page_file in PAGES_DIR.glob("*.tsx"):
        game_id = page_file.stem
        game_files[game_id] = page_file

    for page_file in (PAGES_DIR / "three").glob("*.tsx"):
        game_id = page_file.stem
        game_files[game_id] = page_file

    return game_files


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
        "HandTracking",
        "@mediapipe/task-vision",
    ]

    return any(pattern in content for pattern in cv_patterns)


def main():
    print("=" * 60)
    print("CV Integration Audit")
    print("=" * 60)

    # Step 1: Get games that declare CV support
    print("\n[1/4] Extracting games with CV declarations...")
    cv_declared = extract_cv_declared_games()
    print(f"  Found {len(cv_declared)} games with cv: ['hand']")

    # Step 2: Get games that use CV hooks
    print("\n[2/4] Finding games that use CV hooks...")
    hook_using = extract_hook_using_games()
    print(f"  Found {len(hook_using)} games using CV hooks")

    # Step 3: Identify gaps
    print("\n[3/4] Identifying gaps...")
    cv_declared_set = set(cv_declared)
    hook_using_set = set(hook_using)

    # Games that declare CV but don't use hooks
    gaps = cv_declared_set - hook_using_set
    # Games that use hooks but aren't declared (less critical)
    undeclared = hook_using_set - cv_declared_set

    print(f"  Games with CV declared: {len(cv_declared_set)}")
    print(f"  Games using CV hooks: {len(hook_using_set)}")
    print(f"  GAPS (declare but don't use): {len(gaps)}")
    print(f"  Undeclared (use but not declared): {len(undeclared)}")

    # Step 4: Detailed gap analysis
    if gaps:
        print("\n[4/4] Detailed Gap Analysis:")
        print("\n" + "=" * 60)
        print("GAMES THAT DECLARE CV BUT DON'T IMPLEMENT IT")
        print("=" * 60)

        game_files = get_all_game_files()

        for game_id in sorted(gaps):
            file_path = game_files.get(game_id)
            if file_path and file_path.exists():
                print(f"\n{game_id}:")
                print(f"  File: {file_path}")
                print(f"  Status: Declares cv: ['hand'] but no CV hook found")
            else:
                print(f"\n{game_id}:")
                print(f"  File: NOT FOUND (game may not be implemented yet)")
                print(f"  Status: Declared in registry but no page file exists")

    if undeclared:
        print("\n" + "=" * 60)
        print("GAMES THAT USE CV BUT AREN'T DECLARED (lower priority)")
        print("=" * 60)
        for game_id in sorted(undeclared):
            print(f"  - {game_id}")

    # Summary
    print("\n" + "=" * 60)
    print("AUDIT SUMMARY")
    print("=" * 60)
    print(f"Total CV declarations: {len(cv_declared_set)}")
    print(f"Total CV implementations: {len(hook_using_set)}")
    print(f"Gaps to fix: {len(gaps)}")
    print(f"Coverage: {len(hook_using_set) / max(len(cv_declared_set), 1) * 100:.1f}%")

    # Save results
    results = {
        "cv_declared": sorted(list(cv_declared_set)),
        "hook_using": sorted(list(hook_using_set)),
        "gaps": sorted(list(gaps)),
        "undeclared": sorted(list(undeclared)),
    }

    import json
    results_file = PROJECT_ROOT / "cv_audit_results.json"
    with open(results_file, "w") as f:
        json.dump(results, f, indent=2)

    print(f"\nResults saved to: {results_file}")


if __name__ == "__main__":
    main()
