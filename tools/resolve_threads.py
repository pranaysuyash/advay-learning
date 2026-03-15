#!/usr/bin/env python3
"""
Resolve GitHub PR Review Threads

Bulk resolve review threads by ID, author, or filter criteria.
Handles pagination and provides progress feedback.

Usage:
    # Resolve all threads from a specific bot
    python3 tools/resolve_threads.py --pr 50 --author cubic-dev-ai

    # Resolve specific thread IDs
    python3 tools/resolve_threads.py --ids PRRT_xxx PRRT_yyy

    # Resolve all non-bot threads
    python3 tools/resolve_threads.py --pr 50 --all

    # Dry run - show what would be resolved
    python3 tools/resolve_threads.py --pr 50 --author cubic-dev-ai --dry-run
"""

import argparse
import json
import subprocess
import sys
from typing import List, Dict, Optional


def run_graphql(query: str, variables: Optional[Dict] = None) -> Dict:
    """Execute a GitHub GraphQL query using gh CLI."""
    args = ["gh", "api", "graphql", "-f", f"query={query}"]
    if variables:
        for key, value in variables.items():
            args.extend(["-f", f"{key}={value}"])
    result = subprocess.run(args, capture_output=True, text=True)
    try:
        return json.loads(result.stdout)
    except json.JSONDecodeError:
        print(f"Failed to parse response: {result.stdout}", file=sys.stderr)
        return {}


def get_all_threads(pr_number: int) -> List[Dict]:
    """Fetch all review threads for a PR with pagination."""
    query = """
    query($cursor: String) {
      repository(owner: "pranaysuyash", name: "advay-learning") {
        pullRequest(number: %d) {
          reviewThreads(first: 100, after: $cursor) {
            pageInfo { hasNextPage endCursor }
            nodes {
              id
              isResolved
              path
              line
              comments(first: 1) {
                nodes {
                  author { login }
                }
              }
            }
          }
        }
      }
    }
    """ % pr_number

    all_threads = []
    cursor = None

    while True:
        args = ["gh", "api", "graphql", "-f", f"query={query}"]
        if cursor:
            args.extend(["-f", f"cursor={cursor}"])
        else:
            args.extend(["-f", "cursor="])

        result = subprocess.run(args, capture_output=True, text=True)
        data = json.loads(result.stdout)

        if "errors" in data:
            print(f"GraphQL errors: {data['errors']}", file=sys.stderr)
            break

        pr = data["data"]["repository"]["pullRequest"]["reviewThreads"]
        nodes = pr["nodes"]

        for t in nodes:
            comments = t.get("comments", {}).get("nodes", [])
            author = comments[0]["author"]["login"] if comments else "unknown"
            all_threads.append({
                "id": t["id"],
                "isResolved": t["isResolved"],
                "path": t.get("path", ""),
                "line": t.get("line"),
                "author": author,
            })

        if not pr["pageInfo"]["hasNextPage"]:
            break
        cursor = pr["pageInfo"]["endCursor"]

    return all_threads


def resolve_thread(thread_id: str) -> bool:
    """Resolve a single review thread. Returns True if successful."""
    query = """
    mutation {
      resolveReviewThread(input: {threadId: "%s"}) {
        thread {
          id
          isResolved
        }
      }
    }
    """ % thread_id

    data = run_graphql(query)
    if "errors" in data:
        error_msg = data["errors"][0].get("message", str(data["errors"]))
        if "not a conversation" in error_msg:
            print(f"  ⚠️  Skipped (not a conversation): {thread_id}")
            return False
        print(f"  ❌ Failed: {thread_id} - {error_msg}")
        return False
    return True


def is_bot_author(author: str) -> bool:
    """Check if author matches bot exclusion patterns."""
    bot_patterns = ["[bot]", "github-advanced-security"]
    return any(pattern in author for pattern in bot_patterns)


def main():
    parser = argparse.ArgumentParser(description="Resolve GitHub PR Review Threads")
    parser.add_argument("--pr", type=int, help="PR number")
    parser.add_argument("--author", help="Resolve all unresolved threads from this author")
    parser.add_argument("--ids", nargs="+", help="Specific thread IDs to resolve")
    parser.add_argument("--all", action="store_true", help="Resolve all non-bot unresolved threads")
    parser.add_argument("--dry-run", action="store_true", help="Show what would be resolved without doing it")
    args = parser.parse_args()

    threads_to_resolve = []

    if args.ids:
        threads_to_resolve = [{"id": tid, "author": "specified", "path": ""} for tid in args.ids]
    elif args.pr and args.author:
        print(f"Finding unresolved threads from @{args.author}...")
        all_threads = get_all_threads(args.pr)
        threads_to_resolve = [
            t for t in all_threads
            if not t["isResolved"] and args.author.lower() in t["author"].lower()
        ]
    elif args.pr and args.all:
        print(f"Finding all non-bot unresolved threads...")
        all_threads = get_all_threads(args.pr)
        threads_to_resolve = [
            t for t in all_threads
            if not t["isResolved"] and not is_bot_author(t["author"])
        ]
    else:
        parser.print_help()
        sys.exit(1)

    if not threads_to_resolve:
        print("No threads to resolve!")
        return

    print(f"Found {len(threads_to_resolve)} thread(s) to resolve")

    if args.dry_run:
        print("\nDry run - threads that would be resolved:")
        for t in threads_to_resolve:
            loc = f"{t['path']}:{t['line']}" if t.get("line") else t.get("path", "")
            print(f"  {t['id']} - @{t['author']} - {loc}")
        return

    resolved = 0
    failed = 0

    for t in threads_to_resolve:
        if resolve_thread(t["id"]):
            resolved += 1
            print(f"  ✅ Resolved: {t['id']}")
        else:
            failed += 1

    print(f"\n{'='*50}")
    print(f"Resolved: {resolved}, Failed: {failed}, Total: {len(threads_to_resolve)}")


if __name__ == "__main__":
    main()
