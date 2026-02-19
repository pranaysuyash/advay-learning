# ADR 003: Storage Strategy

## Status

Accepted (Updated 2026-01-29: Migrated from SQLite to PostgreSQL)

## Context

We need to determine how to store application data including:

- Learning progress
- Game scores and achievements
- User settings
- Application state

## Decision

We will use **PostgreSQL** as the primary database for both development and production.

### Why PostgreSQL over SQLite

| Factor | SQLite | PostgreSQL |
|--------|--------|------------|
| Production parity | Dev differs from prod | Same in dev and prod ✅ |
| Concurrent users | Single user only | Multi-user capable ✅ |
| Advanced features | Limited | Full SQL, JSON, arrays ✅ |
| Cloud deployment | Complex | Standard ✅ |
| Data integrity | Good | Better (constraints) ✅ |

### Storage Layers

1. **PostgreSQL Database**: Structured data (users, progress, profiles, achievements)
2. **File System / S3**: Assets (sounds, images, videos)
3. **Environment Variables**: Configuration (secrets, URLs)

### Database Schema Approach

- Use Alembic for migrations
- Async SQLAlchemy for ORM
- Migration version tracking in `alembic_version` table

### Data Categories

| Category | Storage | Format | Backup |
|----------|---------|--------|--------|
| Users | PostgreSQL | Structured | Critical |
| Learning Progress | PostgreSQL | Structured | Critical |
| Game Scores | PostgreSQL | Structured | Important |
| Settings | PostgreSQL | Key-value | Nice to have |
| User Profiles | PostgreSQL | Structured | Important |
| Assets | S3 / Local FS | Binary | Regenerable |
| Logs | File System | Text | Temporary |

## Consequences

### Positive

- ✅ Production parity (same DB in dev and prod)
- ✅ ACID compliance for data integrity
- ✅ Easy to query and inspect
- ✅ Supports multiple concurrent users
- ✅ Standard deployment to cloud services
- ✅ Better tooling (pgAdmin, pg_dump, etc.)

### Negative

- ❌ Requires PostgreSQL installation for local dev
- ❌ Slightly more setup than SQLite
- ❌ Need to manage connection pooling

## Implementation Details

### Connection URL Format

```
postgresql+asyncpg://user:password@host:port/database
```

### Development Setup

```bash
# macOS
brew install postgresql@14
brew services start postgresql@14
createdb advay_learning

# Run migrations
cd src/backend
alembic upgrade head
```

### Key Tables

- `users` - Parent accounts with authentication
- `profiles` - Child profiles (multiple per user)
- `progress` - Learning progress per letter/language
- `achievements` - Badges and milestones
- `audit_logs` - Security and deletion audit trail

### Backup Strategy

- Production: Automated daily pg_dump backups
- Point-in-time recovery with WAL archiving
- Encrypted backups stored in separate region

### Connection Pooling

```python
# Using SQLAlchemy async with pool settings
engine = create_async_engine(
    DATABASE_URL,
    pool_size=10,
    max_overflow=20,
    pool_pre_ping=True,
)
```

## Migration History

| Version | Description | Date |
|---------|-------------|------|
| 001 | Initial schema (users, profiles, progress) | 2026-01-28 |
| 002 | Rename metadata columns | 2026-01-28 |
| 003 | Add audit_logs table | 2026-01-29 |
| 004 | Add achievements table | 2026-01-29 |

## Related Decisions

- ADR 001: Local-First Architecture
- ADR 002: Python Tech Stack
