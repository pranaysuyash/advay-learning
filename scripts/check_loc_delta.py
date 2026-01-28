#!/usr/bin/env python3
"""
Check LOC delta against main branch.
Prevents giant PRs that are hard to review.
"""

import subprocess
import sys
import re

# Configuration
BASE_BRANCH = "main"
THRESHOLD = 500  # Maximum lines added per PR
WARNING = 300    # Warning threshold


def get_loc_delta():
    """Get lines added against base branch."""
    try:
        output = subprocess.check_output(
            ["git", "diff", "--numstat", f"{BASE_BRANCH}...HEAD"],
            text=True,
            stderr=subprocess.DEVNULL
        )
    except subprocess.CalledProcessError:
        # Try with origin prefix
        try:
            output = subprocess.check_output(
                ["git", "diff", "--numstat", f"origin/{BASE_BRANCH}...HEAD"],
                text=True,
                stderr=subprocess.DEVNULL
            )
        except subprocess.CalledProcessError:
            print(f"⚠️  Could not compare with {BASE_BRANCH}, skipping LOC check")
            return 0

    added = 0
    for line in output.strip().split('\n'):
        match = re.match(r'(\d+)\s+(\d+)\s+', line)
        if match:
            added += int(match.group(1))

    return added


def main():
    added = get_loc_delta()

    if added == 0:
        print("No changes detected or not on a feature branch")
        return 0

    print(f"📊 Lines added: {added}")
    print(f"   Threshold: {THRESHOLD}")
    print(f"   Warning: {WARNING}")
    print()

    if added > THRESHOLD:
        print(f"❌ FAIL: +{added} lines exceeds threshold {THRESHOLD}")
        print()
        print("This PR is too large. Please split it into smaller chunks:")
        print("  - Separate refactoring from features")
        print("  - Split by module or layer")
        print("  - Stack dependent PRs")
        return 1
    elif added > WARNING:
        print(f"⚠️  WARNING: +{added} lines exceeds warning level {WARNING}")
        print("Consider splitting if logically separable.")
        return 0
    else:
        print(f"✅ OK: +{added} lines within acceptable range")
        return 0


if __name__ == "__main__":
    sys.exit(main())
