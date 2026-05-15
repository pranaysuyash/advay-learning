# Monitoring & Alerting Setup

Complete guide for external uptime monitoring using Healthchecks.io for the Advay Learning Platform.

---

## Overview

| Component | Service | Purpose |
|-----------|---------|---------|
| **Uptime Monitoring** | Healthchecks.io | External health check pings |
| **Database Backup** | Healthchecks.io | Backup success monitoring |
| **Notification Channel** | Email/Slack | Alert delivery |

---

## Quick Start

### 1. Create Healthchecks.io Account

1. Visit [healthchecks.io](https://healthchecks.io)
2. Sign up with email or GitHub account
3. Create a new project called "Advay Production"

### 2. Add Health Checks

#### API Health Check

```bash
# In Healthchecks.io dashboard:
# 1. Click "Add Check"
# 2. Name: "Advay API Health"
# 3. Schedule: Simple - 5 minutes
# 4. Grace Time: 5 minutes
# 5. Get the ping URL (e.g., https://hc-ping.com/abc123-def456)
```

#### Database Backup Check

```bash
# In Healthchecks.io dashboard:
# 1. Click "Add Check"
# 2. Name: "Daily Database Backup"
# 3. Schedule: Cron - "0 3 * * *" (3 AM daily)
# 4. Grace Time: 1 hour
# 5. Get the ping URL
```

### 3. Configure Application

Add to your deployment environment:

```bash
# .env.production
HEALTHCHECKS_API_UUID=your-api-check-uuid
HEALTHCHECKS_BACKUP_UUID=your-backup-check-uuid
```

### 4. Integration Scripts

#### API Health Ping

Add to your health endpoint or create a separate ping script:

```bash
#!/usr/bin/env bash
# scripts/health-ping.sh

set -e

HEALTHCHECKS_URL="${HEALTHCHECKS_URL:-https://hc-ping.com}"
API_UUID="${HEALTHCHECKS_API_UUID:-}"

if [ -z "$API_UUID" ]; then
  echo "ERROR: HEALTHCHECKS_API_UUID not set"
  exit 1
fi

# Ping success
curl -fsS -m 10 --retry 5 "${HEALTHCHECKS_URL}/${API_UUID}"
echo "Health ping sent successfully"
```

#### Backup Success Ping

Add to `scripts/backup-database.sh` (before exit):

```bash
# Ping Healthchecks.io on successful backup
if [ -n "${HEALTHCHECKS_BACKUP_UUID:-}" ]; then
  curl -fsS -m 10 --retry 5 -o /dev/null \
    "https://hc-ping.com/${HEALTHCHECKS_BACKUP_UUID}"
  echo "Backup ping sent to Healthchecks.io"
fi
```

---

## Healthchecks.io Configuration

### Check Settings

| Setting | API Health | Database Backup |
|---------|------------|-----------------|
| **Schedule** | Every 5 min | Daily at 3 AM |
| **Grace Time** | 5 min | 60 min |
| **Method** | HTTP GET (ping URL) | HTTP GET (ping URL) |

### Notification Channels

#### Email

1. Go to Integrations → Email
2. Add your email address
3. Set notification preferences:
   - ✅ Down (check fails)
   - ✅ Up (check recovers)
   - ❌ Repeat (avoid spam)

#### Slack (Optional)

1. Create a Slack webhook:
   - Go to [Slack API Apps](https://api.slack.com/apps)
   - Create New App → From scratch
   - Add Incoming Webhooks
   - Copy webhook URL

2. In Healthchecks.io:
   - Go to Integrations → Slack
   - Paste webhook URL
   - Select channels

#### SMS/PagerDuty (Paid Plans)

For P0 incident escalation, consider upgrading to paid tier for:
- SMS notifications
- PagerDuty integration
- Phone call alerts

---

## Deployment Integration

### Docker Compose Health Check

```yaml
services:
  backend:
    # ... existing config
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

### Automated Ping via Cron

```bash
# Add to crontab on server
*/5 * * * * cd /opt/advay && ./scripts/health-ping.sh >> /var/log/advay-health.log 2>&1
```

### GitHub Actions Integration

```yaml
# .github/workflows/health-check.yml
name: Health Check

on:
  schedule:
    - cron: '*/5 * * * *'  # Every 5 minutes

jobs:
  health-check:
    runs-on: ubuntu-latest
    steps:
      - name: Check API Health
        run: |
          curl -f https://api.yourdomain.com/health || exit 1
      
      - name: Ping Healthchecks.io
        run: |
          curl -fsS -m 10 --retry 5 \
            "https://hc-ping.com/${{ secrets.HEALTHCHECKS_API_UUID }}"
```

---

## What Gets Monitored

### API Health Endpoint

The `/health` endpoint should return:

```json
{
  "status": "healthy",
  "timestamp": "2026-04-01T10:30:00Z",
  "checks": {
    "database": "ok",
    "redis": "ok",
    "storage": "ok"
  }
}
```

Create or verify in `src/backend/app/main.py`:

```python
@app.get("/health")
async def health_check():
    """Health check endpoint for monitoring."""
    # Check database connection
    try:
        # Simple DB query
        await db.execute("SELECT 1")
        db_status = "ok"
    except Exception:
        db_status = "error"
    
    # Check Redis if used
    try:
        await redis.ping()
        redis_status = "ok"
    except Exception:
        redis_status = "error"
    
    overall = "healthy" if all(s == "ok" for s in [db_status, redis_status]) else "unhealthy"
    
    return {
        "status": overall,
        "timestamp": datetime.utcnow().isoformat(),
        "checks": {
            "database": db_status,
            "redis": redis_status
        }
    }
```

### What Triggers Alerts

| Scenario | Alert? | Notes |
|----------|--------|-------|
| API down > 5 min | ✅ YES | Immediate notification |
| Database backup missing > 24h | ✅ YES | Daily expectation |
| Health check slow (> 5s) | ✅ YES | Grace time applies |
| Brief restart (< 5 min) | ❌ NO | Within grace period |

---

## Alert Response Playbook

### Receiving an Alert

1. **Acknowledge** the alert (if using PagerDuty)
2. **Check current status**:
   ```bash
   curl https://api.yourdomain.com/health
   ```
3. **Review logs**:
   ```bash
   ssh server "docker compose logs --tail 100 backend"
   ```

### Common Issues

#### "API Health Check Down"

**Possible causes**:
- Server restart/maintenance
- Database connection issue
- Memory exhaustion (OOM)
- Deployment failure

**Response**:
1. Check if intentional (maintenance window?)
2. Check server status: `ssh server "uptime"`
3. Check Docker status: `docker compose ps`
4. Check logs: `docker compose logs backend`
5. Restart if needed: `docker compose restart backend`

#### "Database Backup Missing"

**Possible causes**:
- Backup script failed
- Disk space full
- Database unavailable during backup window
- Cron job misconfigured

**Response**:
1. Check backup logs: `/var/log/advay-backup.log`
2. Check disk space: `df -h`
3. Run manual backup: `./scripts/backup-database.sh`
4. Verify backup created: `ls -lh backups/`

---

## Runbook Maintenance

### Monthly Checklist

- [ ] Verify Healthchecks.io checks are active
- [ ] Review alert history for patterns
- [ ] Test notification channels (send test ping)
- [ ] Update on-call contact information if needed
- [ ] Review and adjust alert thresholds

### Quarterly Checklist

- [ ] Review incident response times
- [ ] Update escalation procedures
- [ ] Test full incident response scenario
- [ ] Review cost (upgrade to paid if needed)

---

## Cost Estimation

| Plan | Cost | Checks | Notifications | Suitable For |
|------|------|--------|---------------|--------------|
| **Hobbyist** | Free | 20 | Email, Webhooks, Slack | ✅ MVP/Launch |
| **Starter** | $5/mo | 100 | + SMS | Growing product |
| **Business** | $20/mo | 1000 | + Phone calls | Scale |

**Recommendation**: Start with free tier, upgrade to Starter when:
- Need SMS notifications
- More than 20 checks
- Team grows beyond 1 person

---

## Related Runbooks

- [Backup Procedure](./BACKUP_PROCEDURE.md) - Database backup and restore
- [Rollback Procedure](./ROLLBACK.md) - Application rollback
- [Incident Response](./INCIDENT_RESPONSE.md) - General incident handling

---

## Changelog

| Date | Change | Author |
|------|--------|--------|
| 2026-04-01 | Initial version | Pranay |
