#!/usr/bin/env python3
"""
Add ticket references to audit files missing them.
This script updates audit files in docs/audit/ that are missing TCK- references.
"""

import os
import re
from pathlib import Path

# Ticket assignments for audit files
AUDIT_TICKETS = {
    "GAME_UPGRADE_COMPLETE_HONEST_AUDIT.md": "TCK-20260319-002",
    "GAME_UPGRADE_COMPLETE_STATUS.md": "TCK-20260319-003",
    "GAME_UPGRADE_COMPREHENSIVE_STATUS.md": "TCK-20260319-004",
    "GAME_UPGRADE_FINAL_COMPREHENSIVE.md": "TCK-20260319-005",
    "GAME_UPGRADE_FINAL_STATUS.md": "TCK-20260319-006",
    "GAME_UPGRADE_FINAL_SUMMARY.md": "TCK-20260319-007",
    "GAME_UPGRADE_HONEST_STATUS.md": "TCK-20260319-008",
    "GAME_UPGRADE_SESSION_COMPLETE.md": "TCK-20260319-009",
    "HAND_TRACKING_PIPELINE_AUDIT_2026-02-28.md": "TCK-20260319-010",
    "P0_COMPLETE.md": "TCK-20260319-011",
    "REAL_PROGRESS_TRACKER.md": "TCK-20260319-012",
    "STUB_REGISTER.md": "TCK-20260319-013",
    "VIDEO_AUDIT_ONBOARDING_ALPHABET_TRACING_2026-03-17.md": "TCK-20260319-014",
    "emoji_match_deep_audit.md": "TCK-20260319-015",
    "game_cv_audit-20260318.md": "TCK-20260319-016",
    "game_cv_coverage_20260318.md": "TCK-20260319-017",
}

def add_ticket_to_file(filepath: Path, ticket: str) -> bool:
    """Add ticket reference to the first # header in the file."""
    try:
        content = filepath.read_text()
        
        # Check if already has ticket
        if re.search(r'\*\*Ticket\*\*:\s*TCK-', content):
            print(f"✓ {filepath.name} already has ticket reference")
            return True
        
        # Find first header and add ticket after it
        # Look for pattern: # Header\n\n or # Header\n**
        pattern = r'^(# .+?\n)(\n|\*\*)'
        match = re.search(pattern, content, re.MULTILINE)
        
        if match:
            insert_pos = match.end(1)
            ticket_line = f"\n**Ticket**: {ticket}\n"
            new_content = content[:insert_pos] + ticket_line + content[insert_pos:]
            filepath.write_text(new_content)
            print(f"✓ Added {ticket} to {filepath.name}")
            return True
        else:
            print(f"✗ Could not find header in {filepath.name}")
            return False
            
    except Exception as e:
        print(f"✗ Error processing {filepath.name}: {e}")
        return False

def main():
    audit_dir = Path("docs/audit")
    if not audit_dir.exists():
        print("Error: docs/audit directory not found")
        return 1
    
    updated = 0
    failed = 0
    
    for filename, ticket in AUDIT_TICKETS.items():
        filepath = audit_dir / filename
        if filepath.exists():
            if add_ticket_to_file(filepath, ticket):
                updated += 1
            else:
                failed += 1
        else:
            print(f"⚠ {filename} not found in docs/audit/")
    
    print(f"\nDone: {updated} updated, {failed} failed")
    return 0 if failed == 0 else 1

if __name__ == "__main__":
    exit(main())
