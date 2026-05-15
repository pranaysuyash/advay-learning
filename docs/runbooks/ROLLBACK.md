# Production Rollback Runbook

**Version:** 1.0  
**Date:** 2026-04-01  
**Owner:** Pranay  
**On-Call:** [TBD - assign before launch]

---

## Quick Reference

| Scenario | Action | Time |
|----------|--------|------|
| Bad deploy | Rollback to previous Docker image | 2-5 min |
| Database issue | Restore from backup | 10-30 min |
| Critical incident | Full service restart | 1-2 min |

**Emergency Contacts:**
- Primary: [TBD]
- Secondary: [TBD]
- Infrastructure: [TBD]

---

## 1. Prerequisites

Before attempting any rollback, ensure you have:

- [ ] SSH access to production server
- [ ] Docker Compose installed locally and on server
- [ ] Access to Docker registry (for image history)
- [ ] Database backup location known
- [ ] This runbook open and ready

---

## 2. Rollback Scenarios

### Scenario A: Bad Deploy (Most Common)

**Symptoms:**
- New deploy breaks functionality
- Errors in logs
- Health check failing

**Rollback Steps:**

1. **Stop the bleeding** (prevent further damage):
   ```bash
   # SSH to production server
   ssh -i ~/.ssh/deploy_key user@prod-server
   
   # Navigate to deploy directory
   cd /opt/advay-learning
   
   # Check current status
   docker compose ps
   ```

2. **Identify previous working version**:
   ```bash
   # List available images
   docker images | grep advay
   
   # Check docker compose logs for last working version
   docker compose logs --tail 100
   ```

3. **Rollback to previous image**:
   ```bash
   # Edit docker-compose.yml to use previous image tag
   # OR pull specific previous version
   docker compose pull your-registry/advay-backend:previous-tag
   docker compose pull your-registry/advay-frontend:previous-tag
   
   # Update docker-compose.yml to reference previous tags
   vim docker-compose.yml
   
   # Restart with previous version
   docker compose up -d --remove-orphans
   ```

4. **Verify rollback**:
   ```bash
   # Check health endpoint
   curl https://your-domain.com/health
   
   # Check logs for errors
   docker compose logs --tail 50
   
   # Verify key functionality
   curl https://your-domain.com/api/v1/games
   ```

5. **Monitor** (watch for 15 minutes):
   ```bash
   # Watch logs in real-time
   docker compose logs -f
   ```

---

### Scenario B: Database Issue

**Symptoms:**
- Data corruption
- Wrong data appearing
- Database errors in logs

**Rollback Steps:**

1. **Stop application** (prevent further writes):
   ```bash
   cd /opt/advay-learning
   docker compose stop backend
   ```

2. **Locate backup**:
   ```bash
   # List available backups
   ls -la ./backups/
   # OR
   ls -la /backups/postgres/
   ```

3. **Restore database**:
   ```bash
   # Run restore script (if exists)
   ./scripts/restore-db.sh ./backups/advay-db-YYYY-MM-DD-HHMM.sql
   
   # OR manual restore
   docker compose exec -T postgres psql -U postgres -d advay < ./backups/advay-db-YYYY-MM-DD-HHMM.sql
   ```

4. **Restart application**:
   ```bash
   docker compose up -d backend
   ```

5. **Verify**:
   ```bash
   # Check database connectivity
   docker compose exec backend python -c "from app.db import check_db; check_db()"
   
   # Check health endpoint
   curl https://your-domain.com/health
   ```

---

### Scenario C: Critical Incident (Emergency)

**When to use:** Complete service outage, security breach, data loss risk

**Emergency Steps:**

1. **Immediate stop**:
   ```bash
   cd /opt/advay-learning
   docker compose down
   ```

2. **Notify stakeholders**:
   - Post in #incidents channel
   - Page on-call if defined
   - Update status page if available

3. **Assess damage**:
   ```bash
   # Check logs for cause
   docker compose logs > /tmp/incident-logs-$(date +%Y%m%d-%H%M).txt
   
   # Check system resources
   df -h
   free -m
   docker system df
   ```

4. **Decision point:**
   - Can fix quickly? → Fix forward
   - Need rollback? → Follow Scenario A
   - Data corrupted? → Follow Scenario B

5. **Full restart** (if needed):
   ```bash
   # Clear any stuck state
   docker compose down -v  # WARNING: This removes volumes!
   
   # Start fresh
   docker compose up -d
   ```

---

## 3. Docker Image Rollback (Detailed)

### Method 1: Using Image Tags (Recommended)

```bash
# List all available image tags
export DOCKER_REGISTRY=your-registry.com
export BACKEND_IMAGE=$DOCKER_REGISTRY/advay-backend
export FRONTEND_IMAGE=$DOCKER_REGISTRY/advay-frontend

docker pull $BACKEND_IMAGE --all-tags | sort -V
docker pull $FRONTEND_IMAGE --all-tags | sort -V

# Update docker-compose.yml with previous version
# Example: change 'latest' to 'v1.2.3'

vim docker-compose.yml
# Edit:
#   backend:
#     image: your-registry/advay-backend:v1.2.3
#   frontend:
#     image: your-registry/advay-frontend:v1.2.3

# Apply changes
docker compose up -d
```

### Method 2: Using Docker Compose Config

```bash
# If using docker-compose with explicit version pins
# Simply checkout previous version of docker-compose.yml from git
git log --oneline docker-compose.yml
git show HEAD~1:docker-compose.yml > docker-compose-prev.yml
mv docker-compose-prev.yml docker-compose.yml

# Deploy previous version
docker compose up -d
```

---

## 4. Verification Checklist

After any rollback, verify:

- [ ] Health endpoint returns 200: `curl /health`
- [ ] Key API routes work: `curl /api/v1/games`
- [ ] Frontend loads: Open in browser
- [ ] No critical errors in logs: `docker compose logs --tail 50`
- [ ] Database connectivity: Backend starts without DB errors
- [ ] User can log in (test with test account)
- [ ] Game can be played (test one game flow)

---

## 5. Post-Rollback Actions

1. **Document incident**:
   - What happened
   - What was rolled back
   - Time to recovery
   - Root cause (if known)

2. **Communicate**:
   - Update stakeholders
   - Post-mortem if significant

3. **Prevent recurrence**:
   - Add test for failure case
   - Improve deployment checks
   - Update runbook if needed

---

## 6. Rollback Testing (Do This Now!)

**Before launch, test rollback on staging:**

```bash
# On staging environment

# 1. Deploy current version
docker compose up -d

# 2. Verify working
curl https://staging.your-domain.com/health

# 3. Deploy "broken" version (simulate)
# Edit docker-compose.yml to use a bad tag

# 4. Verify broken
curl https://staging.your-domain.com/health  # Should fail

# 5. Rollback
# Follow Scenario A steps above

# 6. Verify rollback worked
curl https://staging.your-domain.com/health  # Should succeed
```

**Document result:**
- [ ] Staging rollback tested
- [ ] Time to rollback: ___ minutes
- [ ] Issues encountered: ___

---

## 7. Database Backup Locations

| Environment | Backup Location | Retention |
|-------------|-----------------|-----------|
| Production | /opt/advay-learning/backups/ | 30 days |
| Staging | /opt/advay-staging/backups/ | 7 days |
| Offsite | S3: s3://advay-backups/postgres/ | 90 days |

**Backup schedule:** Daily at 2 AM UTC

**Last backup verification:** [TBD - verify before launch]

---

## 8. Troubleshooting

### Issue: Can't SSH to server
- Check VPN connection
- Verify SSH key permissions: `chmod 600 ~/.ssh/deploy_key`
- Check security group/firewall rules

### Issue: Docker image not found
- Verify registry credentials: `docker login`
- Check image tag exists: `docker pull your-registry/image:tag`
- Verify no typo in image name

### Issue: Database restore fails
- Check backup file integrity: `head -5 backup.sql`
- Verify PostgreSQL version compatibility
- Check disk space: `df -h`

### Issue: Rollback doesn't fix problem
- Verify it's a deploy issue (check git log)
- May be infrastructure issue (server, network)
- Escalate to infrastructure team

---

## 9. References

- Deployment script: `scripts/deploy-remote.sh`
- Backup script: `scripts/backup-db.sh`
- Docker Compose config: `docker-compose.yml`
- Health endpoint: `GET /health`

---

**Last updated:** 2026-04-01  
**Next review:** After first production deploy  
**Tested on staging:** [ ] Pending
