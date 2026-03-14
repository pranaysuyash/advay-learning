# Uptime Monitoring & Rollback Strategy
**Date**: 2026-03-14  
**Audience**: DevOps/Ops team

---

## PART A: FREE/OSS UPTIME MONITORING OPTIONS

### Comparison Matrix

| Option | Type | Cost | Setup Time | Monitoring | Alerting | Notes |
|--------|------|------|-----------|-----------|---------|-------|
| **Healthchecks.io** | Free SaaS | Free (up to 20 checks) | 5 min | ✅ HTTP ping | ✅ Email/Slack/SMS | **BEST OVERALL** |
| **UptimeRobot** | Free SaaS | Free (up to 50 monitors) | 5 min | ✅ HTTP/TCP/Keyword | ✅ Email/Slack/SMS | **EASIEST** |
| **Updown.io** | Free SaaS | Free (up to 10 checks) | 5 min | ✅ HTTP + SSL | ✅ Email/Slack | Good, limited |
| **Zabbix** | Self-Hosted OSS | Free | 2-4 hours | ✅ HTTP/TCP/DB | ✅ Email/Slack/SMS | Overkill; requires infra |
| **Prometheus + AlertManager** | Self-Hosted OSS | Free | 2-4 hours | ✅ Scrape-based | ✅ Email/Slack/SMS | Complex; powerful |
| **Grafana Cloud** | Managed + OSS | Free tier (3 users, limited checks) | 1 hour | ✅ HTTP/multi-step | ✅ Email/Slack/PagerDuty | Good balance |
| **Cabot** | Self-Hosted OSS | Free | 4-6 hours | ✅ HTTP/TCP/API | ✅ Email/Slack | Lightweight |
| **Statping** | Self-Hosted OSS | Free | 2-3 hours | ✅ HTTP/TCP/ICMP | ✅ Email/Slack | Status page included |

---

## RECOMMENDED: Healthchecks.io (FREE TIER)

### Why?

1. **Free**: Up to 20 HTTP checks on free tier (you need 2: frontend + backend health)
2. **Simple**: No infrastructure to maintain
3. **Fast setup**: 5 minutes
4. **Reliable**: Run by same team as Django security patches
5. **Flexible**: Ping-based (what you have) or pull-based (they request your health)
6. **Integrations**: Email, Slack, Webhook, SMS, PagerDuty
7. **No credit card needed**: Truly free

### Setup (5 minutes)

```bash
# 1. Go to https://healthchecks.io
# 2. Sign up (free, email-based)
# 3. Create two checks:

# Check 1: Frontend
# Name: "Advay Frontend"
# Request Method: GET
# URL: https://advay.example.com/
# Period: 5 minutes
# Grace: 30 seconds

# Check 2: Backend
# Name: "Advay Backend Health"
# Request Method: GET
# URL: https://api.advay.example.com/health
# Period: 5 minutes
# Grace: 30 seconds

# 4. Configure notifications:
# Add Slack webhook OR email notification channel
# Set to notify on: Down, Back up

# 5. Verify:
curl https://hc-ping.com/<UUID1>/  # Hit first check
curl https://hc-ping.com/<UUID2>/  # Hit second check
# Wait 30 seconds; should show "Up" on dashboard
```

### Cost Breakdown (Free Tier)

| Feature | Free | Paid |
|---------|------|------|
| HTTP checks | 20 | Unlimited |
| Check frequency | Every 1-5 min | Same |
| Notifications | ✅ Email, Slack, Webhook | ✅ + SMS, PagerDuty |
| Status page | ❌ | ✅ (public status page) |
| SLA reports | ❌ | ✅ |
| Price | $0/month | $15-50/month |

**For your needs**: Free tier is sufficient. You only need 2 checks.

---

## ALTERNATIVE: UptimeRobot (FREE TIER)

### Why Consider?

1. **More checks free**: 50 monitors on free tier (vs. 20 for Healthchecks)
2. **More integrations**: 40+ notification channels
3. **Public status page**: Free tier includes basic status page
4. **Keyword monitoring**: Can check for specific text in response

### Setup (5 minutes)

```bash
# 1. Go to https://uptimerobot.com
# 2. Sign up (free email)
# 3. Add two monitors:

# Monitor 1: Frontend (HTTP)
# Friendly Name: "Advay Frontend"
# Monitor Type: HTTP(s)
# URL: https://advay.example.com/
# Check Frequency: 5 minutes

# Monitor 2: Backend (HTTP)
# Friendly Name: "Advay Backend"
# Monitor Type: HTTP(s)
# URL: https://api.advay.example.com/health
# Check Frequency: 5 minutes

# 4. Notifications:
# Add Slack channel OR email
# Alert every: immediately

# 5. Status page:
# Included in free tier; auto-generated URL
```

### Cost Breakdown (Free Tier)

| Feature | Free | Paid |
|---------|------|------|
| Monitors | 50 | Unlimited |
| Status page | ✅ Basic | ✅ Custom branding |
| Notifications | ✅ Email, Slack, Discord | ✅ + SMS, PagerDuty |
| Check frequency | 5 min | 1 min |
| Price | $0/month | $9.99-99.99/month |

---

## MY RECOMMENDATION

**Go with Healthchecks.io**:
- Zero credit card required
- Dead simple
- Reliable reputation
- Best for MVP phase

If you want more checks later, upgrade to UptimeRobot ($0 cost to switch).

---

## IMPLEMENTATION (TODAY)

### Step 1: Set Up Healthchecks.io Account

```bash
# 1. Visit https://healthchecks.io
# 2. Sign up with email
# 3. Create two checks:

Check 1:
- Name: Frontend
- URL: https://advay.example.com/
- Period: 5 minutes

Check 2:
- Name: Backend
- URL: https://api.advay.example.com/health
- Period: 5 minutes

# 4. Note the check UUIDs (you'll see them in the UI)
```

### Step 2: Add to Runbook

Create `docs/RUNBOOKS.md`:

```markdown
## Uptime Monitoring

**Healthchecks.io Dashboard**: https://healthchecks.io/

**Checks**:
- Frontend: https://hc-ping.com/{UUID1}/
- Backend: https://hc-ping.com/{UUID2}/

**How it works**:
- Healthchecks.io pings these URLs every 5 minutes
- If any ping fails, alerts sent to Slack (see Slack config below)
- If 3 consecutive pings fail, check marked as "DOWN"

**Slack Integration**:
1. Go to https://healthchecks.io/integrations/add_slack/
2. Click "Connect Slack"
3. Select channel: #devops-alerts
4. Grant permissions
5. Return to Healthchecks; select Slack in notification settings

**Alerts Received**:
- "Your check 'Advay Backend' is down" → check your deploy/restart service
- "Your check 'Advay Backend' is up" → service recovered
```

### Step 3: Test It

```bash
# Test frontend is reachable
curl -I https://advay.example.com/

# Test backend health endpoint
curl https://api.advay.example.com/health

# Manually trigger health check (optional):
curl https://hc-ping.com/{UUID1}/  # ping frontend check
curl https://hc-ping.com/{UUID2}/  # ping backend check

# Wait 5 minutes; refresh Healthchecks.io dashboard
# Both should show "✅ UP"
```

---

## PART B: ROLLBACK STRATEGY

### Current Deploy Flow

```
GitHub main branch → GitHub Actions CI
                   → Docker build + push
                   → SSH to deploy server
                   → docker compose pull && docker compose up -d
                   → Run migrations (alembic upgrade head)
                   → Smoke tests (curl health endpoint)
```

### Rollback Problem

If new deploy breaks the app:
1. **Issue**: No easy way to revert Docker images
2. **Downtime**: ~5-10 minutes while figuring out previous version
3. **Data Risk**: If migrations ran, can't simply revert

### Solution: Image Tagging + Versioning

#### A. Tag Docker Images by Version

**Current**: `your-registry/advay-backend:latest`  
**Better**: `your-registry/advay-backend:v1.0.0` + `latest`

**Implementation**:

Update `.github/workflows/deploy.yml`:

```yaml
# Existing code (around line 120):
- name: Build and push backend
  uses: docker/build-push-action@v5
  with:
    context: ./src/backend
    push: true
    tags: |
      your-registry/advay-backend:latest
      your-registry/advay-backend:${{ github.ref_name }}-${{ github.sha }}  # Add this
      your-registry/advay-backend:v1.0.0  # And this (tag manually)
```

This creates three tags for every build:
- `latest` (always points to most recent)
- `main-{short-sha}` (unique per commit)
- `v1.0.0` (version tag)

#### B. Keep Backup of Previous Version

In `docker-compose.yml`, use explicit image versions:

```yaml
# Instead of:
# image: your-registry/advay-backend:latest

# Use:
image: your-registry/advay-backend:${BACKEND_TAG:-latest}
```

Then on deploy, set `BACKEND_TAG` env var:

```bash
# deploy-remote.sh
export BACKEND_TAG="v1.0.0"  # Version you're deploying
docker compose pull
docker compose up -d
```

#### C. Create Rollback Script

Create `scripts/rollback.sh`:

```bash
#!/usr/bin/env bash
set -euo pipefail

: "${DEPLOY_HOST:?DEPLOY_HOST required}"
: "${DEPLOY_USER:?DEPLOY_USER required}"
: "${DEPLOY_PATH:?DEPLOY_PATH required}"
: "${SSH_KEY_PATH:?SSH_KEY_PATH required}"
: "${PREVIOUS_VERSION:?PREVIOUS_VERSION required (e.g., v0.9.0)}"

DEPLOY_PORT="${DEPLOY_PORT:-22}"
SSH_OPTS=(-i "$SSH_KEY_PATH" -p "$DEPLOY_PORT")

echo "🔄 Rolling back to version: $PREVIOUS_VERSION"

# 1. Stop current services
ssh "${SSH_OPTS[@]}" "$DEPLOY_USER@$DEPLOY_HOST" "cd '$DEPLOY_PATH' && docker compose down"

# 2. Restore database backup
echo "📦 Restoring database from backup..."
BACKUP_FILE=$(ssh "${SSH_OPTS[@]}" "$DEPLOY_USER@$DEPLOY_HOST" "ls -t $DEPLOY_PATH/backups/*.dump 2>/dev/null | head -1")
if [[ -z "$BACKUP_FILE" ]]; then
  echo "❌ No backup found! Cannot rollback database."
  exit 1
fi
echo "Using backup: $BACKUP_FILE"

# 3. Restore DB (careful: this drops existing data)
ssh "${SSH_OPTS[@]}" "$DEPLOY_USER@$DEPLOY_HOST" \
  "cd '$DEPLOY_PATH' && PREVIOUS_VERSION='$PREVIOUS_VERSION' ./scripts/restore-db.sh '$BACKUP_FILE'"

# 4. Update to previous Docker image
ssh "${SSH_OPTS[@]}" "$DEPLOY_USER@$DEPLOY_HOST" \
  "cd '$DEPLOY_PATH' && BACKEND_TAG='$PREVIOUS_VERSION' FRONTEND_TAG='$PREVIOUS_VERSION' docker compose pull"

# 5. Start with previous version
ssh "${SSH_OPTS[@]}" "$DEPLOY_USER@$DEPLOY_HOST" \
  "cd '$DEPLOY_PATH' && BACKEND_TAG='$PREVIOUS_VERSION' FRONTEND_TAG='$PREVIOUS_VERSION' docker compose up -d"

# 6. Run smoke tests
echo "✅ Smoke testing rollback..."
BACKEND_URL="https://api.advay.example.com/health" FRONTEND_URL="https://advay.example.com/" ./scripts/post-deploy-smoke.sh

echo "✅ Rollback to $PREVIOUS_VERSION complete!"
```

#### D. Usage

```bash
# When you need to rollback:
./scripts/rollback.sh \
  -h your-server.com \
  -u deploy-user \
  -d /var/www/advay \
  -k ~/.ssh/deploy_key \
  -p 0.9.0  # Previous working version
```

---

### Rollback Procedure (Full Runbook)

Create `docs/INCIDENT_RESPONSE.md`:

```markdown
# Incident Response Runbook

## Scenario: Deploy Breaks Production

### Immediate (0-5 min)

1. **Detect**: Healthchecks.io alerts you "Backend is down"
2. **Confirm**: Visit https://api.advay.example.com/health
   - Should see JSON: `{"status": "ok"}`
   - If 404 or timeout → app is down

### Assess (5-10 min)

3. **Check recent deploy**:
   ```bash
   git log --oneline -5
   # See what was deployed
   ```

4. **Check server logs**:
   ```bash
   ssh deploy-user@server.com
   cd /var/www/advay
   docker compose logs backend --tail=50
   # Look for error messages
   ```

5. **Decide**:
   - **If fixable quickly** (< 5 min): Fix code → deploy again
   - **If unsure/critical**: Rollback immediately

### Rollback (5-10 min)

6. **Identify previous working version**:
   ```bash
   # Check what was deployed before
   git tag | sort -V | tail -5
   # e.g., v1.0.0, v0.9.1, v0.9.0
   
   # Assume v0.9.1 was last working version
   PREVIOUS_VERSION="v0.9.1"
   ```

7. **Execute rollback**:
   ```bash
   ./scripts/rollback.sh \
     -h server.com \
     -u deploy-user \
     -d /var/www/advay \
     -k ~/.ssh/deploy_key \
     -p v0.9.1
   ```

8. **Verify**:
   ```bash
   curl https://api.advay.example.com/health
   # Should return 200 OK with status=ok
   ```

9. **Check Healthchecks.io**:
   - Refresh dashboard
   - Should show both checks as "✅ UP"

### Post-Incident (next day)

10. **Root cause analysis**:
    - What broke?
    - Why didn't tests catch it?
    - How do we prevent it?

11. **Document finding**:
    - Add note to INCIDENT_LOG.md
    - Create ticket to address root cause

## Rollback Dry Run (Weekly)

**Every Friday**:
1. SSH to staging server
2. Simulate rollback: run `./scripts/rollback.sh` with previous tag
3. Verify smoke tests pass
4. Restore current version

This ensures:
- Rollback script actually works
- Team knows the procedure
- No surprises during real incident
```

---

### Database Migration Safety

**Issue**: Migrations are forward-only. If you rollback code but database stayed migrated, schema mismatch.

**Solution**: Use migrations that are backward-compatible.

**Example**:
```python
# GOOD: Add column as optional with default
def upgrade():
    op.add_column('users', sa.Column('email_verified', sa.Boolean(), default=False))

def downgrade():
    op.drop_column('users', 'email_verified')

# BAD: Drop a column (can't be undone)
def upgrade():
    op.drop_column('users', 'legacy_field')
    # If you rollback, data is lost!
```

**Policy**:
- Every forward migration must have a corresponding downgrade
- Test downgrade in staging before merging
- Document any irreversible migrations (mark as "no downgrade possible")

---

## QUICK START (TODAY)

### 1. Set Up Uptime Monitoring (5 min)

```bash
# Sign up: https://healthchecks.io
# Create 2 checks (Frontend + Backend health endpoint)
# Configure Slack notification
# Test: https://hc-ping.com/{UUID}/ returns 200
```

### 2. Document Rollback Procedure (20 min)

```bash
# Create docs/INCIDENT_RESPONSE.md (copy template from Part B above)
# Create scripts/rollback.sh (copy from Part B above)
# chmod +x scripts/rollback.sh
```

### 3. Test Rollback on Staging (30 min)

```bash
# Tag current version:
git tag v1.0.0
docker build -t your-registry/advay-backend:v1.0.0 src/backend/

# Make breaking change to code
# Deploy to staging

# Run rollback script:
./scripts/rollback.sh -p v1.0.0

# Verify it works
```

### 4. Git Commit (5 min)

```bash
git add -A
git commit -m "Add: uptime monitoring (Healthchecks.io) + rollback runbook"
git push
```

---

## SUMMARY TABLE

| Piece | Status | Time to Fix | Effort |
|-------|--------|-------------|--------|
| Uptime monitoring | ❌ Missing | 1 day | 2 hours |
| Rollback script | ❌ Missing | 1 day | 3 hours |
| Database backups | ✅ Script exists | — | Already done |
| Smoke tests | ✅ Script exists | — | Already done |
| Migration strategy | ⚠️ Needs policy | 1 day | 1 hour |

---

**Next Step**: Start with Healthchecks.io (simplest, 5 minutes). Then add rollback script (1 hour). Then test on staging.
