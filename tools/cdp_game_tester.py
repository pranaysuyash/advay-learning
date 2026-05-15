#!/usr/bin/env python3
"""
CDP Game Tester

Automated testing tool using Chrome DevTools Protocol (CDP) to:
1. Launch each game
2. Take screenshots
3. Check UI/UX compliance for kids
4. Document issues

Usage:
    python tools/cdp_game_tester.py
    python tools/cdp_game_tester.py --game alphabet-tracing
    python tools/cdp_game_tester.py --screenshot-dir ./screenshots
"""

import argparse
import asyncio
import json
import os
import sys
from dataclasses import dataclass, field
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional
from urllib.parse import urljoin

try:
    from playwright.async_api import async_playwright, Page, Browser, BrowserContext
    import playwright
except ImportError:
    print("Installing playwright...")
    os.system("pip install playwright")
    from playwright.async_api import async_playwright, Page, Browser, BrowserContext


# Game registry with routes and metadata
GAMES = [
    {
        "id": "alphabet-tracing",
        "name": "Alphabet Tracing",
        "route": "/games/alphabet-tracing",
        "category": "literacy",
        "expected_elements": ["canvas", "webcam", "score display", "letter prompt"],
        "min_button_size": 80,  # px
        "uses_kenney_assets": True,
        "has_cv_controls": True,
    },
    {
        "id": "odd-one-out",
        "name": "Odd One Out",
        "route": "/games/odd-one-out",
        "category": "logic",
        "expected_elements": ["answer buttons", "score display", "feedback"],
        "min_button_size": 80,
        "uses_kenney_assets": True,
        "has_cv_controls": True,
    },
    {
        "id": "spelling-run",
        "name": "Spelling Run",
        "route": "/games/spelling-run",
        "category": "literacy",
        "expected_elements": ["word display", "letter tiles", "input"],
        "min_button_size": 80,
        "uses_kenney_assets": False,
        "has_cv_controls": False,
    },
    {
        "id": "math-jumpers",
        "name": "Math Jumpers",
        "route": "/games/math-jumpers",
        "category": "math",
        "expected_elements": ["game area", "score", "math problem"],
        "min_button_size": 80,
        "uses_kenney_assets": True,
        "has_cv_controls": True,
    },
    {
        "id": "shadow-match",
        "name": "Shadow Match",
        "route": "/games/shadow-match",
        "category": "visual",
        "expected_elements": ["shadow images", "answer options"],
        "min_button_size": 80,
        "uses_kenney_assets": True,
        "has_cv_controls": False,
    },
    {
        "id": "balloon-pop-fitness",
        "name": "Balloon Pop Fitness",
        "route": "/games/balloon-pop-fitness",
        "category": "fitness",
        "expected_elements": ["balloons", "score", "timer"],
        "min_button_size": 80,
        "uses_kenney_assets": True,
        "has_cv_controls": True,
    },
    {
        "id": "catch-sort",
        "name": "Catch Sort",
        "route": "/games/catch-sort",
        "category": "logic",
        "expected_elements": ["falling items", "baskets/bins"],
        "min_button_size": 80,
        "uses_kenney_assets": True,
        "has_cv_controls": True,
    },
    {
        "id": "maze-runner",
        "name": "Maze Runner",
        "route": "/games/maze-runner",
        "category": "logic",
        "expected_elements": ["maze", "player", "goal"],
        "min_button_size": 80,
        "uses_kenney_assets": True,
        "has_cv_controls": True,
    },
    {
        "id": "animal-sounds",
        "name": "Animal Sounds",
        "route": "/games/animal-sounds",
        "category": "literacy",
        "expected_elements": ["animal images", "sound buttons"],
        "min_button_size": 80,
        "uses_kenney_assets": True,
        "has_cv_controls": False,
    },
    {
        "id": "virtual-bubbles",
        "name": "Virtual Bubbles",
        "route": "/games/virtual-bubbles",
        "category": "fun",
        "expected_elements": ["bubbles", "pop interaction"],
        "min_button_size": 80,
        "uses_kenney_assets": False,
        "has_cv_controls": True,
    },
]


@dataclass
class GameTestResult:
    """Results from testing a single game."""
    game_id: str
    game_name: str
    passed: bool = False
    screenshot_path: Optional[str] = None
    issues: List[str] = field(default_factory=list)
    warnings: List[str] = field(default_factory=list)
    ui_checks: Dict[str, bool] = field(default_factory=dict)
    load_time_ms: Optional[int] = None
    timestamp: str = field(default_factory=lambda: datetime.now().isoformat())


class GameTester:
    """Automated game tester using Playwright."""

    def __init__(
        self,
        base_url: str = "http://localhost:5173",
        screenshot_dir: str = "./screenshots/game-test",
        headless: bool = True,
        viewport: tuple = (1920, 1080),
    ):
        self.base_url = base_url
        self.screenshot_dir = Path(screenshot_dir)
        self.headless = headless
        self.viewport = viewport
        self.results: List[GameTestResult] = []

        # Create screenshot directory
        self.screenshot_dir.mkdir(parents=True, exist_ok=True)

    async def setup(self) -> tuple[Browser, BrowserContext, Page]:
        """Set up browser, context, and page."""
        playwright_instance = await async_playwright().start()
        browser = await playwright_instance.chromium.launch(
            headless=self.headless,
            args=['--disable-web-security', '--allow-file-access-from-files']
        )
        context = await browser.new_context(
            viewport={"width": self.viewport[0], "height": self.viewport[1]},
            device_scale_factor=1,  # Use 1 for consistent screenshots
        )
        page = await context.new_page()

        # Set up console logging
        page.on("console", lambda msg: print(f"  [Console {msg.type}] {msg.text}" if msg.type in ["error", "warning"] else None))

        return browser, context, page

    async def test_game(self, page: Page, game: Dict[str, Any]) -> GameTestResult:
        """Test a single game."""
        print(f"\n{'='*60}")
        print(f"Testing: {game['name']} ({game['id']})")
        print(f"{'='*60}")

        result = GameTestResult(
            game_id=game["id"],
            game_name=game["name"],
            passed=False,
        )

        url = urljoin(self.base_url, game["route"])
        print(f"  Navigating to: {url}")

        start_time = datetime.now()
        try:
            response = await page.goto(url, wait_until="domcontentloaded", timeout=30000)
            load_time = (datetime.now() - start_time).total_seconds() * 1000
            result.load_time_ms = int(load_time)
            print(f"  Page loaded in {load_time:.0f}ms")

            if response.status >= 400:
                result.issues.append(f"HTTP {response.status} error")
                return result

            # Wait for game to initialize
            await asyncio.sleep(2)

            # Take screenshot
            screenshot_path = self.screenshot_dir / f"{game['id']}.png"
            await page.screenshot(path=str(screenshot_path), full_page=False)
            result.screenshot_path = str(screenshot_path)
            print(f"  Screenshot saved: {screenshot_path}")

            # Run UI/UX checks
            await self.run_ui_checks(page, game, result)

            # Check for console errors
            errors = await page.evaluate("""() => {
                return window.__testErrors || [];
            }""")

            if errors:
                result.issues.extend(errors)

        except Exception as e:
            result.issues.append(f"Test failed: {str(e)}")
            print(f"  ERROR: {e}")

        result.passed = len(result.issues) == 0
        return result

    async def run_ui_checks(self, page: Page, game: Dict[str, Any], result: GameTestResult):
        """Run UI/UX compliance checks."""

        # Check 1: Button sizes (minimum 80px for kids)
        print("  Checking button sizes...")
        button_sizes = await page.evaluate("""() => {
            const buttons = document.querySelectorAll('button, [role="button"], .clickable');
            return Array.from(buttons).map(btn => {
                const rect = btn.getBoundingClientRect();
                return {
                    width: rect.width,
                    height: rect.height,
                    text: btn.textContent?.slice(0, 50) || '',
                };
            });
        }""")

        min_size = game.get("min_button_size", 80)
        small_buttons = [b for b in button_sizes if min(b["width"], b["height"]) < min_size]

        if small_buttons:
            result.ui_checks["all_buttons_large_enough"] = False
            result.issues.append(f"Found {len(small_buttons)} buttons smaller than {min_size}px")
            for btn in small_buttons[:3]:
                result.warnings.append(f"  Small button: {min(btn['width'], btn['height']):.0f}px - '{btn['text']}'")
        else:
            result.ui_checks["all_buttons_large_enough"] = True
            print(f"    ✓ All {len(button_sizes)} buttons meet minimum size")

        # Check 2: Color contrast (WCAG AA for text)
        print("  Checking color contrast...")
        low_contrast = await page.evaluate("""() => {
            const textElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, a, button');
            const issues = [];

            textElements.forEach(el => {
                const styles = window.getComputedStyle(el);
                const color = styles.color;
                const bg = styles.backgroundColor;

                // Simple check for very low contrast (light gray on white, etc.)
                if (color === 'rgb(128, 128, 128)' && bg === 'rgb(255, 255, 255)') {
                    issues.push(el.tagName + ': ' + el.textContent?.slice(0, 30));
                }
            });

            return issues;
        }""")

        if low_contrast:
            result.ui_checks["color_contrast_ok"] = False
            result.warnings.append(f"Found {len(low_contrast)} potential contrast issues")
        else:
            result.ui_checks["color_contrast_ok"] = True
            print("    ✓ Color contrast looks good")

        # Check 3: Emoji usage (should prefer Kenney assets)
        print("  Checking for emoji usage...")
        emoji_count = await page.evaluate("""() => {
            const body = document.body.textContent || '';
            // Simple emoji check - look for common emoji patterns
            const emojiRanges = /[\u00A9\u00AE\u203C\u2049\u2122\u2139\u2194-\u2199\u21A9\u21AA\u231A\u231B\u2328\u23CF\u23E9-\u23F3\u23F8-\u23FA\u24C2\u25AA\u25AB\u25B6\u25C0\u25FB-\u25FE\u2600-\u2604\u260E\u2611\u2614\u2615\u2618\u261D\u2620\u2622\u2623\u2626\u262A\u262E\u262F\u2638-\u263A\u2640\u2642\u2648-\u2653\u265F\u2660\u2663\u2665\u2666\u2668\u267B\u267E\u267F\u2692-\u2697\u2699\u269B\u269C\u26A0\u26A1\u26AA\u26AB\u26B0\u26B1\u26BD\u26BE\u26C4\u26C5\u26C8\u26CE\u26CF\u26D1\u26D3\u26D4\u26E9\u26EA\u26F0-\u26F5\u26F7-\u26FA\u26FD\u2702\u2705\u2708-\u270D\u270F\u2712\u2714\u2716\u271D\u2721\u2728\u2733\u2734\u2744\u2747\u274C\u274E\u2753-\u2755\u2757\u2763\u2764\u2795-\u2797\u27A1\u27B0\u27BF\u2934\u2935\u2B05-\u2B07\u2B1B\u2B1C\u2B50\u2B55\u3030\u303D\u3297\u3297]/g;
            const matches = body.match(emojiRanges);
            return matches ? matches.length : 0;
        }""")

        if game.get("uses_kenney_assets") and emoji_count > 10:
            result.ui_checks["prefers_assets_over_emoji"] = False
            result.warnings.append(f"Found {emoji_count} emoji characters (consider Kenney assets)")
        else:
            result.ui_checks["prefers_assets_over_emoji"] = True
            print(f"    ✓ Emoji usage acceptable ({emoji_count} found)")

        # Check 4: CV/MediaPipe integration
        if game.get("has_cv_controls"):
            print("  Checking CV/MediaPipe integration...")
            has_video = await page.evaluate("""() => {
                return !!document.querySelector('video, canvas');
            }""")
            result.ui_checks["has_cv_elements"] = has_video
            if not has_video:
                result.issues.append("Game should have CV/MediaPipe elements but none found")
            else:
                print("    ✓ CV elements present")

        # Check 5: Feedback animations
        print("  Checking for feedback animations...")
        has_animations = await page.evaluate("""() => {
            const styles = document.querySelectorAll('style, link[rel="stylesheet"]');
            let hasAnimation = false;

            // Check for animation classes or styles
            const animatedElements = document.querySelectorAll('[class*="animate"], [class*="transition"]');
            if (animatedElements.length > 0) hasAnimation = true;

            return hasAnimation;
        }""")

        result.ui_checks["has_feedback_animations"] = has_animations
        if not has_animations:
            result.warnings.append("No obvious feedback animations found")

        # Check 6: Touch target spacing
        print("  Checking touch target spacing...")
        tightly_spaced = await page.evaluate("""() => {
            const buttons = Array.from(document.querySelectorAll('button, [role="button"]'));
            let issues = 0;

            for (let i = 0; i < buttons.length - 1; i++) {
                const rect1 = buttons[i].getBoundingClientRect();
                const rect2 = buttons[i + 1].getBoundingClientRect();

                // Check horizontal spacing
                const horizontalGap = rect2.left - (rect1.right);
                if (rect1.top === rect2.top && horizontalGap < 8) {
                    issues++;
                }
            }

            return issues;
        }""")

        result.ui_checks["touch_target_spacing"] = tightly_spaced == 0
        if tightly_spaced > 0:
            result.warnings.append(f"Found {tightly_spaced} tightly spaced touch targets")

        print(f"  UI Checks: {sum(result.ui_checks.values())}/{len(result.ui_checks)} passed")

    async def run_all_tests(self, games: Optional[List[Dict]] = None):
        """Run tests for all or specified games."""
        games = games or GAMES
        browser, context, page = await self.setup()

        try:
            for game in games:
                result = await self.test_game(page, game)
                self.results.append(result)

                # Print summary
                status = "✓ PASS" if result.passed else "✗ FAIL"
                print(f"  {status} - {len(result.issues)} issues, {len(result.warnings)} warnings")

                # Small delay between tests
                await asyncio.sleep(1)

        finally:
            await context.close()
            await browser.close()

    def print_summary(self):
        """Print test summary."""
        print(f"\n{'='*60}")
        print("TEST SUMMARY")
        print(f"{'='*60}")

        passed = sum(1 for r in self.results if r.passed)
        total = len(self.results)

        print(f"\nTotal: {passed}/{total} games passed")

        # Group by status
        failed = [r for r in self.results if not r.passed]
        if failed:
            print(f"\n❌ Failed Games ({len(failed)}):")
            for r in failed:
                print(f"  - {r.game_name}: {', '.join(r.issues[:3])}")

        # Warnings
        with_warnings = [r for r in self.results if r.warnings]
        if with_warnings:
            print(f"\n⚠️  Games with Warnings ({len(with_warnings)}):")
            for r in with_warnings:
                print(f"  - {r.game_name}: {len(r.warnings)} warnings")

        # Slowest loading
        sorted_by_load = sorted(
            [r for r in self.results if r.load_time_ms],
            key=lambda x: x.load_time_ms or 0,
            reverse=True
        )[:5]
        if sorted_by_load:
            print(f"\n🐢 Slowest Loading Times:")
            for r in sorted_by_load:
                print(f"  - {r.game_name}: {r.load_time_ms}ms")

    def save_results(self, output_path: str = "./game-test-results.json"):
        """Save results to JSON file."""
        data = {
            "timestamp": datetime.now().isoformat(),
            "total_games": len(self.results),
            "passed": sum(1 for r in self.results if r.passed),
            "results": [
                {
                    "game_id": r.game_id,
                    "game_name": r.game_name,
                    "passed": r.passed,
                    "screenshot": r.screenshot_path,
                    "issues": r.issues,
                    "warnings": r.warnings,
                    "ui_checks": r.ui_checks,
                    "load_time_ms": r.load_time_ms,
                }
                for r in self.results
            ],
        }

        with open(output_path, "w") as f:
            json.dump(data, f, indent=2)

        print(f"\n✓ Results saved to: {output_path}")


async def main():
    parser = argparse.ArgumentParser(description="Test games using CDP/Playwright")
    parser.add_argument("--game", help="Test specific game by ID")
    parser.add_argument("--base-url", default="http://localhost:5173", help="Base URL for testing")
    parser.add_argument("--screenshot-dir", default="./screenshots/game-test", help="Screenshot directory")
    parser.add_argument("--headless", action="store_true", default=True, help="Run headless")
    parser.add_argument("--no-headless", action="store_false", dest="headless", help="Show browser")
    parser.add_argument("--output", default="./game-test-results.json", help="Results JSON output")

    args = parser.parse_args()

    tester = GameTester(
        base_url=args.base_url,
        screenshot_dir=args.screenshot_dir,
        headless=args.headless,
    )

    games_to_test = GAMES
    if args.game:
        games_to_test = [g for g in GAMES if g["id"] == args.game]
        if not games_to_test:
            print(f"Game '{args.game}' not found")
            print(f"Available games: {', '.join(g['id'] for g in GAMES)}")
            sys.exit(1)

    print(f"Testing {len(games_to_test)} game(s)...")
    print(f"Base URL: {args.base_url}")
    print(f"Screenshot dir: {args.screenshot_dir}")

    await tester.run_all_tests(games_to_test)
    tester.print_summary()
    tester.save_results(args.output)


if __name__ == "__main__":
    asyncio.run(main())
