# ADR 003: Storage Strategy

## Status
Accepted

## Context
We need to determine how to store application data including:
- Learning progress
- Game scores and achievements
- User settings
- Application state

## Decision
We will use **SQLite** as the primary storage with the following strategy:

### Storage Layers
1. **SQLite Database**: Structured data (progress, settings, scores)
2. **File System**: Assets (sounds, images, fonts)
3. **JSON Files**: Configuration that might be hand-edited

### Database Schema Approach
- Use simple, flat schema initially
- Migration system for schema updates
- Version tracking in database

### Data Categories

| Category | Storage | Format | Backup |
|----------|---------|--------|--------|
| Learning Progress | SQLite | Structured | Critical |
| Game Scores | SQLite | Structured | Important |
| Settings | SQLite + JSON | Key-value | Nice to have |
| User Profile | SQLite | Structured | Important |
| Assets | File System | Binary | Regenerable |
| Logs | File System | Text | Temporary |

## Consequences

### Positive
- ✅ Simple, no external dependencies
- ✅ ACID compliance for data integrity
- ✅ Easy to query and inspect
- ✅ Single file for easy backup
- ✅ Works offline

### Negative
- ❌ Not ideal for binary data (use filesystem)
- ❌ Concurrent access limited (single user app, acceptable)
- ❌ Schema migrations required for updates

## Implementation Details

### Database Location
```
macOS: ~/Library/Application Support/AdvayLearning/app.db
Linux: ~/.local/share/advay-learning/app.db
Windows: %APPDATA%\AdvayLearning\app.db
```

### Key Tables
- `profiles` - User profiles
- `progress` - Learning progress per module
- `scores` - Game scores and achievements
- `settings` - Application settings
- `sessions` - Session history

### Backup Strategy
- Automatic daily backups (keep last 7 days)
- Manual export to JSON
- Optional cloud sync (encrypted)

## Related Decisions
- ADR 001: Local-First Architecture
- ADR 002: Python Tech Stack
