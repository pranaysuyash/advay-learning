# ADR 001: Local-First Architecture

## Status

Accepted

## Context

We need to decide on the data storage and processing architecture for Advay's learning app. Key considerations:

- Child's privacy and safety
- Offline functionality
- Simplicity of deployment and maintenance
- Future extensibility

## Decision

We will adopt a **local-first architecture** where:

1. All data is stored locally on the device by default
2. All processing (CV/AI) happens locally
3. No cloud connectivity required for core functionality
4. Optional encrypted cloud sync for backup (parent-controlled)

## Consequences

### Positive

- ✅ Maximum privacy - no data leaves device without explicit consent
- ✅ Works completely offline
- ✅ No server infrastructure to maintain
- ✅ Faster response times (no network latency)
- ✅ Lower cost (no cloud services)
- ✅ Simpler compliance (no COPPA/GDPR concerns for online data)

### Negative

- ❌ Data lost if device is lost/damaged (mitigated by optional backup)
- ❌ No cross-device progress sync without cloud (mitigated by optional sync)
- ❌ Limited by device compute power (mitigated by efficient models)
- ❌ Manual backup management required

## Implementation Details

### Storage

- SQLite database for structured data
- Local file system for assets
- Optional: Encrypted backup to parent-controlled cloud storage

### Processing

- MediaPipe for hand/face tracking (runs locally)
- OpenCV for image processing
- No external API calls for core functionality

### Sync (Optional Future Feature)

- Parent must explicitly enable
- End-to-end encryption
- Parent manages encryption keys
- Sync to parent's chosen storage (iCloud, Google Drive, etc.)

## Related Decisions

- ADR 002: Python and PyQt6 for UI
- ADR 003: Storage Strategy (PostgreSQL)

## Notes

This decision prioritizes child safety and privacy over convenience features. Cloud sync can be added later as an opt-in feature.
