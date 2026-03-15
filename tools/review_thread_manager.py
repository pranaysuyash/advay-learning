#!/usr/bin/env python3
"""
GitHub PR Review Thread Manager

Helpful utilities for managing GitHub PR review threads.
Useful for resolving bot review threads (cubic-dev-ai, coderabbitai, etc.)
and checking which threads are blocking merge gates.

Usage:
    # Check unresolved threads
    python3 tools/review_thread_manager.py check --pr 50

    # Check with filter (who would fail workflow)
    python3 tools/review_thread_manager.py check --pr 50 --filter-workflow

    # Resolve all threads from specific bot
    python3 tools/review_thread_manager.py resolve --pr 50 --author cubic-dev-ai

    # Resolve specific thread by ID
    python3 tools/review_thread_manager.py resolve --id PRRT_kwDORGg-1850bRtg

    # Resolve all unresolved non-excluded threads
    python3 tools/review_thread_manager.py resolve-all --pr 50
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


def get_all_threads(pr_number: int, owner: str = "pranaysuyash", repo: str = "advay-learning") -> List[Dict]:
    """Fetch all review threads for a PR with pagination."""
    query = """
    query($owner: String!, $repo: String!, $prNumber: Int!, $cursor: String) {
      repository(owner: $owner, name: $repo) {
        pullRequest(number: $prNumber) {
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
                  url
                  body
                  author { login }
                }
              }
            }
          }
        }
      }
    }
    """
    
    all_threads = []
    cursor = None
    
    while True:
        data = run_graphql(query, {
            "owner": owner,
            "repo": repo,
            "prNumber": str(pr_number),
            "cursor": cursor or ""
        })
        
        if "errors" in data:
            print(f"GraphQL errors: {data['errors']}", file=sys.stderr)
            break
        
        pr = data.get("data", {}).get("repository", {}).get("pullRequest", {})
        threads_data = pr.get("reviewThreads", {})
        nodes = threads_data.get("nodes", [])
        
        for t in nodes:
            comments = t.get("comments", {}).get("nodes", [])
            author = comments[0]["author"]["login"] if comments and comments[0].get("author") else "unknown"
            all_threads.append({
                "id": t["id"],
                "isResolved": t["isResolved"],
                "path": t.get("path", ""),
                "line": t.get("line"),
                "author": author,
                "url": comments[0].get("url", "") if comments else "",
                "body": comments[0].get("body", "")[:100] if comments else ""
            })
        
        page_info = threads_data.get("pageInfo", {})
        if not page_info.get("hasNextPage"):
            break
        cursor = page_info.get("endCursor")
    
    return all_threads


def resolve_thread(thread_id: str) -> bool:
    """Resolve a single review thread."""
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
            print(f"  ⚠️  {thread_id}: Not a conversation (cannot resolve via API)")
            return False
        print(f"  ❌ {thread_id}: {error_msg}")
        return False
    return True


def is_bot_author(author: str, bot_patterns: Optional[List[str]] = None) -> bool:
    """Check if author matches bot patterns."""
    if bot_patterns is None:
        bot_patterns = ["[bot]", "github-advanced-security"]
    return any(pattern in author for pattern in bot_patterns)


def cmd_check(args):
    """Check unresolved threads."""
    threads = get_all_threads(args.pr)
    unresolved = [t for t in threads if not t["isResolved"]]
    
    print(f"Total threads: {len(threads)}")
    print(f"Unresolved: {len(unresolved)}")
    
    if args.filter_workflow:
        would_fail = [t for t in unresolved if not is_bot_author(t["author"])]
        excluded = [t for t in unresolved if is_bot_author(t["author"])]
        print(f"\nExcluded by workflow (bot): {len(excluded)}")
        print(f"Would fail workflow: {len(would_fail)}")
        
        if would_fail:
            print("\nThreads that would fail workflow:")
            for t in would_fail:
                loc = f"{t['path']}:{t['line']}" if t['line'] else t['path']
                print(f"  {t['id']} - @{t['author']} - {loc}")
    elif args.author:
        author_threads = [t for t in unresolved if args.author.lower() in t["author"].lower()]
        print(f"\nUnresolved from @{args.author}: {len(author_threads)}")
        for t in author_threads:
            loc = f"{t['path']}:{t['line']}" if t['line'] else t['path']
            print(f"  {t['id']} - {loc}")
    else:
        print("\nAll unresolved threads:")
        for t in unresolved:
            loc = f"{t['path']}:{t['line']}" if t['line'] else t['path']
            print(f"  {t['id']} - @{t['author']} - {loc}")


def cmd_resolve(args):
    """Resolve specific threads."""
    if args.id:
        print(f"Resolving thread {args.id}...")
        if resolve_thread(args.id):
            print("  ✅ Resolved")
    elif args.pr and args.author:
        print(f"Resolving threads from @{args.author} on PR #{args.pr}...")
        threads = get_all_threads(args.pr)
        unresolved = [t for t in threads if not t["isResolved"] and args.author.lower() in t["author"].lower()]
        
        resolved = 0
        for t in unresolved:
            if resolve_thread(t["id"]):
                resolved += 1
        
        print(f"\nResolved {resolved}/{len(unresolved)} threads")


def cmd_resolve_all(args):
    """Resolve all non-excluded unresolved threads."""
    print(f"Resolving all non-bot unresolved threads on PR #{args.pr}...")
    threads = get_all_threads(args.pr)
    unresolved = [t for t in threads if not t["isResolved"] and not is_bot_author(t["author"])]
    
    if not unresolved:
        print("No threads to resolve!")
        return
    
    print(f"Found {len(unresolved)} threads to resolve")
    resolved = 0
    failed = 0
    
    for t in unresolved:
        if resolve_thread(t["id"]):
            resolved += 1
        else:
            failed += 1
    
    print(f"\nResolved: {resolved}, Failed: {failed}")


def main():
    parser = argparse.ArgumentParser(description="GitHub PR Review Thread Manager")
    subparsers = parser.add_subparsers(dest="command", help="Available commands")
    
    # check command
    check_parser = subparsers.add_parser("check", help="Check unresolved threads")
    check_parser.add_argument("--pr", type=int, required=True, help="PR number")
    check_parser.add_argument("--filter-workflow", action="store_true", 
                             help="Show only threads that would fail workflow gate")
    check_parser.add_argument("--author", help="Filter by author")
    check_parser.set_defaults(func=cmd_check)
    
    # resolve command
    resolve_parser = subparsers.add_parser("resolve", help="Resolve specific threads")
    resolve_parser.add_argument("--id", help="Thread ID to resolve")
    resolve_parser.add_argument("--pr", type=int, help="PR number")
    resolve_parser.add_argument("--author", help="Resolve all threads from this author")
    resolve_parser.set_defaults(func=cmd_resolve)
    
    # resolve-all command
    resolve_all_parser = subparsers.add_parser("resolve-all", help="Resolve all non-bot threads")
    resolve_all_parser.add_argument("--pr", type=int, required=True, help="PR number")
    resolve_all_parser.set_defaults(func=cmd_resolve_all)
    
    args = parser.parse_args()
    if not args.command:
        parser.print_help()
        sys.exit(1)
    
    args.func(args)


if __name__ == "__main__":
    main()
