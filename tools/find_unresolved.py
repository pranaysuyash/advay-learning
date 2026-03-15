#!/usr/bin/env python3
"""
Find Unresolved PR Review Threads

Quick script to list all unresolved review threads and show which ones
would fail workflow gates based on bot exclusion patterns.

Usage:
    python3 tools/find_unresolved.py
    python3 tools/find_unresolved.py --pr 50
    python3 tools/find_unresolved.py --json  # Output as JSON for scripting
"""

import argparse
import json
import subprocess
import sys
from typing import List, Dict


def get_threads(pr_number: int, cursor: str = None) -> Dict:
    """Fetch review threads with pagination support."""
    query = """
    query($cursor: String) {
      repository(owner: "pranaysuyash", name: "advay-learning") {
        pullRequest(number: %d) {
          reviewThreads(first: 100, after: $cursor) {
            pageInfo { hasNextPage endCursor }
            totalCount
            nodes {
              id
              isResolved
              path
              line
              comments(first: 1) {
                nodes {
                  author { login }
                  body
                  url
                }
              }
            }
          }
        }
      }
    }
    """ % pr_number

    args = ["gh", "api", "graphql", "-f", f"query={query}"]
    if cursor:
        args.extend(["-f", f"cursor={cursor}"])
    else:
        args.extend(["-f", "cursor="])

    result = subprocess.run(args, capture_output=True, text=True)
    return json.loads(result.stdout)


def main():
    parser = argparse.ArgumentParser(description="Find unresolved PR review threads")
    parser.add_argument("--pr", type=int, default=50, help="PR number (default: 50)")
    parser.add_argument("--json", action="store_true", help="Output as JSON")
    args = parser.parse_args()

    all_unresolved = []
    cursor = None

    while True:
        try:
            data = get_threads(args.pr, cursor)
        except Exception as e:
            print(f"Error fetching threads: {e}", file=sys.stderr)
            sys.exit(1)

        if "errors" in data:
            print(f"GraphQL errors: {data['errors']}", file=sys.stderr)
            break

        pr = data["data"]["repository"]["pullRequest"]["reviewThreads"]
        nodes = pr["nodes"]

        for t in nodes:
            if not t["isResolved"]:
                author = t["comments"]["nodes"][0]["author"]["login"] if t["comments"]["nodes"] else "unknown"
                bot_patterns = ["[bot]", "github-advanced-security"]
                is_bot = any(p in author for p in bot_patterns)
                all_unresolved.append({
                    "id": t["id"],
                    "author": author,
                    "is_bot": is_bot,
                    "path": t.get("path", ""),
                    "line": t.get("line"),
                })

        if not pr["pageInfo"]["hasNextPage"]:
            break
        cursor = pr["pageInfo"]["endCursor"]

    if args.json:
        print(json.dumps(all_unresolved, indent=2))
        return

    bot_excluded = [t for t in all_unresolved if t["is_bot"]]
    would_fail = [t for t in all_unresolved if not t["is_bot"]]

    print(f"Total unresolved: {len(all_unresolved)}")
    print(f"Excluded by workflow (bot): {len(bot_excluded)}")
    print(f"Would fail workflow: {len(would_fail)}")

    if would_fail:
        print("\nUnresolved that would fail workflow:")
        for t in would_fail:
            loc = f"{t['path']}:{t['line']}" if t["line"] else t["path"]
            print(f"  {t['id']} - @{t['author']} - {loc}")

    sys.exit(0 if not would_fail else 1)


if __name__ == "__main__":
    main()
