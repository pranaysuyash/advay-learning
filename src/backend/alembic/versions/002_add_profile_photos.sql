-- File: alembic/versions/002_add_profile_photos.sql
-- Description: Add avatar_url and profile_photo columns to profiles table
-- Version: 002
-- Author: AI Assistant
-- Created: 2026-01-31 23:30 UTC
-- Status: OPEN

-- Upgrade: Upgrade profile_photos_001 → profile_photos_002

BEGIN;

-- Add columns to profiles table
ALTER TABLE profiles
    ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(512) NULL;
    ADD COLUMN IF NOT EXISTS profile_photo TEXT NULL;
    ADD COLUMN IF NOT EXISTS photo_updated_at TIMESTAMP DEFAULT NOW();

-- Upgrade profile_photos_001 → profile_photos_002
-- Data migration for existing profiles (set default values)
UPDATE profiles
SET
    photo_updated_at = NOW()
WHERE
    avatar_url IS NULL AND
    profile_photo IS NULL;

COMMIT;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_avatar_url ON profiles(avatar_url);
CREATE INDEX IF NOT EXISTS idx_profiles_profile_photo ON profiles(profile_photo);

-- Note: S3 bucket integration will be in Phase 3
COMMIT;

END;