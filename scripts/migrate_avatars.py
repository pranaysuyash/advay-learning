#!/usr/bin/env python3
"""
Migration script: Add default avatars to existing profiles.

This script assigns a default Kenney avatar to profiles that don't have one.
Run once after deploying the avatar feature.
"""

import asyncio
import os
import sys

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'src/backend'))

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

# Import after setting path
from app.db.session import async_session  # noqa: E402
from app.db.models.profile import Profile  # noqa: E402

# Default avatar assignments (cycling through options)
DEFAULT_AVATARS = [
    {"type": "platformer", "character": "beige", "animation": "idle"},
    {"type": "platformer", "character": "green", "animation": "idle"},
    {"type": "platformer", "character": "pink", "animation": "idle"},
    {"type": "platformer", "character": "purple", "animation": "idle"},
    {"type": "platformer", "character": "yellow", "animation": "idle"},
    {"type": "animal", "character": "frog", "animation": "idle"},
    {"type": "animal", "character": "bee", "animation": "idle"},
    {"type": "animal", "character": "ladybug", "animation": "idle"},
]


async def migrate_avatars():
    """Add default avatars to profiles without avatar_config."""
    print("🎨 Starting avatar migration...\n")
    
    async with async_session() as db:
        # Get all profiles
        result = await db.execute(select(Profile))
        profiles = result.scalars().all()
        
        print(f"Found {len(profiles)} profiles")
        
        updated_count = 0
        skipped_count = 0
        
        for idx, profile in enumerate(profiles):
            # Check if profile already has avatar config
            settings = profile.settings or {}
            
            if settings.get("avatar_config"):
                print(f"  ⏭️  Skipping {profile.name} (already has avatar)")
                skipped_count += 1
                continue
            
            # Assign default avatar based on index
            avatar_config = DEFAULT_AVATARS[idx % len(DEFAULT_AVATARS)]
            
            # Update settings
            settings["avatar_config"] = avatar_config
            profile.settings = settings
            
            print(f"  ✅ Added {avatar_config['type']} ({avatar_config['character']}) to {profile.name}")
            updated_count += 1
        
        # Commit changes
        await db.commit()
        
        print(f"\n📊 Migration complete!")
        print(f"   Updated: {updated_count} profiles")
        print(f"   Skipped: {skipped_count} profiles (already had avatars)")
        print(f"   Total: {len(profiles)} profiles")


if __name__ == "__main__":
    asyncio.run(migrate_avatars())
