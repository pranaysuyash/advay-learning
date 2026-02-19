# Deployment Roadmap v1.0

**Goal**: Launch MVP for public use (free tier initially)
**Target Timeline**: 1 week to deployment-ready
**Constraints**: Minimize costs (no paid services like Sentry initially)

---

## Phase 1: Foundation (Days 1-2) - CRITICAL

### 1.1 Environment & Configuration

**Ticket**: TCK-20260129-082
**Prompt**: `prompts/remediation/implementation-v1.6.1.md`

Tasks:

- [ ] Move all secrets to environment variables
- [ ] Create .env.example for documentation
- [ ] Add validation for required env vars at startup
- [ ] Fail fast if SECRET_KEY is default/missing

Files:

- `src/backend/app/core/config.py`
- `.env` (gitignored)
- `.env.example` (committed)

### 1.2 Local PostgreSQL Setup

**Ticket**: TCK-20260129-083
**Prompt**: `prompts/remediation/implementation-v1.6.1.md`

Tasks:

- [ ] Configure PostgreSQL connection (use your local install)
- [ ] Set up connection pooling (asyncpg)
- [ ] Test database migrations on PostgreSQL
- [ ] Create database initialization script

Config:

```
DATABASE_URL=postgresql+asyncpg://user:pass@localhost:5432/advay_learning
```

### 1.3 CORS & Security

**Ticket**: TCK-20260129-084
**Prompt**: `prompts/remediation/implementation-v1.6.1.md`

Tasks:

- [ ] Configure CORS for production domain
- [ ] Add security headers
- [ ] Review cookie settings for production

---

## Phase 2: Production Hardening (Days 3-4) - HIGH

### 2.1 Dependency Lock

**Ticket**: TCK-20260129-085
**Prompt**: `prompts/remediation/implementation-v1.6.1.md`

Tasks:

- [ ] Generate requirements.txt from pyproject.toml
- [ ] Document installation steps
- [ ] Test clean install in fresh venv

### 2.2 Health Checks & Monitoring (Basic)

**Ticket**: TCK-20260129-086
**Prompt**: `prompts/remediation/implementation-v1.6.1.md`

Tasks:

- [ ] Extend /health to check all critical dependencies
- [ ] Add basic logging configuration
- [ ] Create simple status dashboard (optional)

Skip for now (costs):

- Sentry (use logs initially)
- Prometheus/Grafana
- Paid monitoring services

### 2.3 Build & Deploy Scripts

**Ticket**: TCK-20260129-087
**Prompt**: `prompts/remediation/implementation-v1.6.1.md`

Tasks:

- [ ] Create production build script
- [ ] Frontend build optimization
- [ ] Static asset collection
- [ ] Database migration script

---

## Phase 3: Documentation (Days 5-6) - MEDIUM

### 3.1 Deployment Guide

**Ticket**: TCK-20260129-088
**Prompt**: `prompts/workflow/documentation-v1.0.md`

Create:

- `docs/DEPLOYMENT.md` - Step-by-step deployment
- `docs/ENVIRONMENT.md` - All env vars documented
- `docs/TROUBLESHOOTING.md` - Common issues

### 3.2 Runbook

**Ticket**: TCK-20260129-089
**Prompt**: `prompts/workflow/documentation-v1.0.md`

Create:

- Start/stop/restart procedures
- Database backup commands
- Log locations
- Quick fixes for common issues

---

## Phase 4: Testing & Launch (Day 7) - CRITICAL

### 4.1 Pre-Launch Checklist

**Ticket**: TCK-20260129-090
**Prompt**: `prompts/verification/verification-v1.2.md`

- [ ] All env vars set in production
- [ ] Database migrations run
- [ ] Health endpoint responding
- [ ] Frontend builds without errors
- [ ] Authentication working
- [ ] Game functionality tested
- [ ] Progress saving working

### 4.2 Launch

**Ticket**: TCK-20260129-091

- [ ] Deploy to server
- [ ] Smoke tests
- [ ] Monitor logs for errors
- [ ] Announce to users

---

## Post-Launch (Backlog)

### Cost-Incurring Services (Add when revenue justifies)

- Sentry error tracking ($26/month)
- Cloud database (RDS/Cloud SQL) ($15-50/month)
- CDN for assets ($5-20/month)
- Load balancer ($10-20/month)

### Nice-to-Have Features

- E2E tests with Playwright
- Load testing with k6
- Automated backups
- Multi-region deployment

---

## Files to Create/Modify

### New Files

```
docs/
  DEPLOYMENT.md
  ENVIRONMENT.md
  TROUBLESHOOTING.md
  RUNBOOK.md
scripts/
  deploy.sh
  backup-db.sh
  migrate.sh
.env.example
requirements.txt
```

### Modified Files

```
src/backend/app/core/config.py
src/backend/app/api/v1/endpoints/health.py
src/backend/pyproject.toml (already done)
```

---

## Success Criteria

- [ ] Application runs on production domain
- [ ] Users can register/login
- [ ] Game works with hand tracking
- [ ] Progress saves to PostgreSQL
- [ ] No hardcoded secrets
- [ ] Basic monitoring via logs
- [ ] Documentation complete

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Database issues | Local PostgreSQL first, migrate to cloud later |
| No error tracking | Verbose logging + log file monitoring |
| Single server | Acceptable for MVP, scale later |
| No CDN | Acceptable for initial user base |
