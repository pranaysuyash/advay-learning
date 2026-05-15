# Database Backup & Restore Procedures

Complete operational guide for Advay database backups, restoration, and disaster recovery.

---

## Overview

| Item | Details |
|------|---------|
| **Database** | PostgreSQL 17 |
| **Backup Location** | `backups/` directory (local) + S3 (production) |
| **Retention** | 30 days locally, 90 days in S3 |
| **Schedule** | Daily at 2:00 AM UTC |
| **Estimated Size** | Varies based on data |

---

## Quick Reference

### Backup Commands

```bash
# Create manual backup
./scripts/backup-database.sh

# Create backup to specific directory
./scripts/backup-database.sh /path/to/backup/dir

# Check available backups
ls -lh backups/
```

### Restore Commands

```bash
# List available backups
./scripts/restore-database.sh

# Restore from specific backup
./scripts/restore-database.sh backups/advay-db-20260401-102000.sql.gz
```

---

## Automated Daily Backups

### Docker Compose (Local Development)

Add to `docker-compose.override.yml`:

```yaml
services:
  backup:
    image: postgres:17-alpine
    volumes:
      - ./backups:/backups
      - ./scripts:/scripts
    command: >
      sh -c "echo '0 2 * * * /scripts/backup-database.sh /backups' | crontab - && crond -f"
    environment:
      - PGHOST=postgres
      - PGUSER=postgres
      - PGDATABASE=advay
    depends_on:
      - postgres
```

### Production (Cron Job)

```bash
# Add to crontab (run as deployment user)
0 2 * * * cd /opt/advay && ./scripts/backup-database.sh /opt/advay/backups >> /var/log/advay-backup.log 2>&1
```

### S3 Upload (Production)

```bash
# Add to backup script or cron
aws s3 cp backups/advay-db-$(date +%Y%m%d-%H%M%S).sql.gz s3://advay-backups/database/
```

---

## Backup Scripts

### backup-database.sh

**Purpose**: Creates a timestamped PostgreSQL dump

**Features**:
- Works with Docker Compose or direct connection
- Automatic compression (gzip)
- 30-day automatic cleanup
- Consistent timestamp format

**Output**:
```
backups/
├── advay-db-20260401-100000.sql.gz
├── advay-db-20260401-020000.sql.gz
└── advay-db-20260331-020000.sql.gz
```

### restore-database.sh

**Purpose**: Restores database from backup file

**Safety Features**:
- Requires 'RESTORE' confirmation
- Creates pre-restore backup automatically
- Decompresses .gz files automatically
- Works with Docker Compose or direct connection

---

## Restore Scenarios

### Scenario A: Partial Data Loss (Specific Tables)

```bash
# 1. Extract backup to temporary file
gunzip -c backups/advay-db-20260401-100000.sql.gz > /tmp/restore.sql

# 2. Extract only specific table data
sed -n '/COPY public.users/,/\\./p' /tmp/restore.sql > /tmp/users.sql

# 3. Restore specific table
psql -d advay < /tmp/users.sql
```

### Scenario B: Complete Database Restore

```bash
# 1. Stop application (optional but recommended)
docker compose stop backend

# 2. Run restore script
./scripts/restore-database.sh backups/advay-db-20260401-100000.sql.gz

# 3. Restart application
docker compose start backend

# 4. Verify
./scripts/smoke-test.sh
```

### Scenario C: Point-in-Time Recovery

Requires WAL archiving enabled (production):

```bash
# 1. Stop database
docker compose stop postgres

# 2. Restore base backup
# ... restore from backup-database.sh

# 3. Apply WAL files up to specific timestamp
pg_waldump ... --timeline=1 --stop-at="2026-04-01 10:00:00"

# 4. Start database
docker compose start postgres
```

**Note**: PITR requires configuration in `postgresql.conf`:
```ini
archive_mode = on
archive_command = 'cp %p /var/lib/postgresql/archive/%f'
wal_level = replica
```

---

## Backup Verification

### Automated Verification Script

Create `scripts/verify-backup.sh`:

```bash
#!/usr/bin/env bash
BACKUP_FILE="$1"

# Check file exists and is valid gzip
if ! gunzip -t "$BACKUP_FILE" 2>/dev/null; then
  echo "ERROR: Backup file is corrupted"
  exit 1
fi

# Extract and validate SQL structure
gunzip -c "$BACKUP_FILE" | head -50 | grep -q "PostgreSQL database dump"
if [ $? -ne 0 ]; then
  echo "ERROR: Backup doesn't appear to be a valid PostgreSQL dump"
  exit 1
fi

echo "Backup verification passed: $BACKUP_FILE"
```

### Manual Verification Steps

1. **Check file integrity**:
   ```bash
   gunzip -t backups/advay-db-20260401-100000.sql.gz
   ```

2. **Preview backup contents**:
   ```bash
   gunzip -c backups/advay-db-20260401-100000.sql.gz | head -100
   ```

3. **Test restore to temporary database**:
   ```bash
   createdb test_restore
   gunzip -c backups/advay-db-20260401-100000.sql.gz | psql -d test_restore
   psql -d test_restore -c "SELECT COUNT(*) FROM users;"
   dropdb test_restore
   ```

---

## Monitoring & Alerting

### Backup Success Check

```bash
# Check if backup was created today
if [ ! -f "backups/advay-db-$(date +%Y%m%d)*.sql.gz" ]; then
  echo "ALERT: No backup found for today"
  # Send alert via email/Slack/PagerDuty
fi
```

### Disk Space Monitoring

```bash
# Check backup directory size
BACKUP_SIZE=$(du -sm backups/ | cut -f1)
if [ $BACKUP_SIZE -gt 10000 ]; then  # 10GB threshold
  echo "WARNING: Backup directory is ${BACKUP_SIZE}MB"
fi
```

### Healthcheck.io Integration

Add to backup script:

```bash
# Ping Healthcheck.io on success
curl -fsS -m 10 --retry 5 -o /dev/null https://hc-ping.com/YOUR_BACKUP_CHECK_UUID
```

---

## S3 Production Setup

### Bucket Configuration

```bash
# Create S3 bucket
aws s3 mb s3://advay-backups

# Enable versioning
aws s3api put-bucket-versioning \
  --bucket advay-backups \
  --versioning-configuration Status=Enabled

# Set lifecycle policy (delete after 90 days)
cat > /tmp/lifecycle.json << 'EOF'
{
  "Rules": [{
    "ID": "DeleteOldBackups",
    "Status": "Enabled",
    "Filter": {"Prefix": "database/"},
    "Expiration": {"Days": 90}
  }]
}
EOF
aws s3api put-bucket-lifecycle-configuration \
  --bucket advay-backups \
  --lifecycle-configuration file:///tmp/lifecycle.json
```

### IAM Policy for Backups

```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Action": [
      "s3:PutObject",
      "s3:GetObject",
      "s3:ListBucket"
    ],
    "Resource": [
      "arn:aws:s3:::advay-backups",
      "arn:aws:s3:::advay-backups/database/*"
    ]
  }]
}
```

---

## Troubleshooting

### "pg_dump not found"

**Solution**: Install PostgreSQL client tools
```bash
# macOS
brew install libpq

# Ubuntu/Debian
apt-get install postgresql-client

# Or use Docker
docker run --rm postgres:17 pg_dump --help
```

### "Permission denied" on restore

**Solution**: Ensure proper database permissions
```sql
-- Connect as superuser
ALTER USER your_user CREATEDB;
GRANT ALL PRIVILEGES ON DATABASE advay TO your_user;
```

### Backup file is corrupted

**Recovery**:
1. Check earlier backup: `ls -lt backups/`
2. Download from S3 if available
3. If all backups corrupted: Use database replication standby

### Low disk space

**Immediate fix**:
```bash
# Remove backups older than 7 days (emergency)
find backups/ -name "advay-db-*.sql.gz" -mtime +7 -delete
```

**Long-term**: Increase disk size or reduce retention period

---

## Disaster Recovery Playbook

### RTO/RPO Targets

| Metric | Target | Implementation |
|--------|--------|----------------|
| **RTO** (Recovery Time Objective) | < 30 minutes | Automated scripts, documented procedures |
| **RPO** (Recovery Point Objective) | < 24 hours | Daily backups + continuous WAL (production) |

### Recovery Steps

1. **Assess the situation**
   - What data is affected?
   - What is the last known good state?

2. **Choose restore point**
   - List available backups: `ls -lt backups/`
   - Select appropriate timestamp

3. **Execute restore**
   - Follow Scenario B (Complete Restore) above

4. **Verify recovery**
   - Run smoke tests
   - Check critical data
   - Monitor for errors

5. **Post-incident**
   - Document root cause
   - Update procedures if needed
   - Test backup integrity

---

## Related Runbooks

- [Rollback Procedure](./ROLLBACK.md) - Application rollback
- [Health Monitoring](./MONITORING.md) - System health checks
- [Incident Response](./INCIDENT_RESPONSE.md) - General incident handling

---

## Changelog

| Date | Change | Author |
|------|--------|--------|
| 2026-04-01 | Initial version | Pranay |
