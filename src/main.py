"""Main entry point for Advay's Learning App."""

import sys
from pathlib import Path

# Add src to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))


def main() -> int:
    """Main application entry point.

    Returns:
        Exit code (0 for success, non-zero for error)
    """
    print("🚀 Advay's Learning App")
    print("=" * 40)
    print("Welcome! This is a placeholder for the main application.")
    print("")
    print("To get started:")
    print("  1. Review the documentation in docs/")
    print("  2. Check the roadmap in docs/features/ROADMAP.md")
    print("  3. Start implementing features!")
    print("")
    print("Project structure:")
    print("  - src/hand_tracking/  : Hand detection and gesture recognition")
    print("  - src/face_tracking/  : Face detection and tracking")
    print("  - src/ui/             : User interface components")
    print("  - src/games/          : Gamification and activities")
    print("  - src/learning_modules/: Educational content")
    print("  - src/storage/        : Data persistence")
    return 0


if __name__ == "__main__":
    sys.exit(main())
