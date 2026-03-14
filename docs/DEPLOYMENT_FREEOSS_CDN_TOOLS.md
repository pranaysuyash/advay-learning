# Free / Open-Source / CDN-Based Deployment Tools
**Date**: 2026-03-14  
**Status**: Research + Recommendations  
**Audience**: Budget-conscious teams, self-hosted preference

---

## EXECUTIVE SUMMARY

**You can run Advay with $0/month infrastructure + CDN by combining**:

| Category | Tool | Cost | Notes |
|----------|------|------|-------|
| **Uptime Monitoring** | Uptime Kuma (self-hosted) | $0 | Unlimited monitors, beautiful UI |
| **Logging & Tracing** | OpenSearch (OSS) + Jaeger | $0 | Full observability, your infra |
| **Analytics** | PostHog (OSS) | $0 | Product analytics, self-hosted |
| **Frontend Hosting** | Netlify free / Cloudflare Pages free | $0 | 100GB/month bandwidth, auto-deploy |
| **Backend Hosting** | Railway / Heroku free tier / Fly.io | Free (limited) | Pay only if you scale |
| **CDN** | Cloudflare free | $0 | Edge caching, DDoS protection, WAF |
| **Backups** | Cron + S3 (Wasabi/Backblaze B2) | ~$5/mo | Object storage, redundancy |
| **Email** | Resend (free tier) / Mailgun free | Free/$5/mo | 100-1000 emails/month free |
| **Total** | **All-in** | **$0-10/mo** | No vendor lock-in |

---

## PART A: UPTIME MONITORING (100% FREE/OSS)

### Option 1: Uptime Kuma (BEST FOR SELF-HOSTED)

**Why it wins**:
- ✅ MIT licensed (open-source forever)
- ✅ Unlimited monitors (no seat limits)
- ✅ 90+ notification integrations
- ✅ Built-in status page (no extra tool needed)
- ✅ Beautiful UI/UX
- ✅ Runs on $5-10/month VPS

**Setup** (Docker):

```bash
# 1. On your $5 VPS (Vultr, Linode, DigitalOcean)
docker run -d \
  --name uptime-kuma \
  -p 3001:3001 \
  -v kuma-data:/app/data \
  louislam/uptime-kuma:latest

# 2. Open: http://your-vps-ip:3001
# 3. Create username/password
# 4. Add monitors (HTTP checks)
# 5. Enable Slack integration
# 6. Public status page: http://your-vps-ip:3001/status/endpoint
```

**Cost**: $5-10/month (cheapest VPS) + zero software  
**GitHub**: https://github.com/louislam/uptime-kuma (5.5k+ stars)

---

### Option 2: Statping-ng (STATUS PAGES FIRST)

**Why it's different**:
- ✅ OSS, lightweight
- ✅ Built-in status page (prettier than Kuma)
- ✅ Multi-service monitoring + incident tracking
- ✅ Runs on minimal resources

**Docker setup**:

```bash
docker run -d \
  --name statping-ng \
  -p 8080:8080 \
  -e DB_CONN="postgres" \
  -e DB_HOST="postgres" \
  statpingng/statpingng:latest
```

**Public status page**: Automatically generated, shareable with testers  
**Cost**: $5/month (VPS only)  
**GitHub**: https://github.com/statping-ng/statping-ng

---

### Option 3: OneUptime (ALL-IN-ONE MONITORING + INCIDENTS)

**Why it's powerful**:
- ✅ Uptime monitoring + incident management + on-call + status pages in ONE tool
- ✅ MIT licensed (self-hostable)
- ✅ Beautiful, modern UI
- ✅ 25k+ GitHub stars (active community)

**What it includes**:
- HTTP/TCP/DNS monitoring
- Incident management
- On-call scheduling
- Status pages
- Logs + metrics + traces (with OpenTelemetry)

**Docker Compose setup**:

```yaml
version: '3.8'
services:
  oneuptime:
    image: oneuptime/oneuptime:latest
    ports:
      - "3000:3000"
    environment:
      - DOMAIN=monitoring.advay.local
      - DATABASE_HOST=postgres
      - REDIS_HOST=redis
    depends_on:
      - postgres
      - redis
```

**Cost**: Free (self-hosted) + $10-15/month (infra)  
**GitHub**: https://github.com/OneUptime/oneuptime  
**Hosted SaaS**: $99+/month (if you don't want to self-host)

---

## PART B: LOGGING & TRACING (100% FREE/OSS)

### Option 1: OpenSearch (ELASTICSEARCH FORK, 100% OPEN)

**Why fork Elasticsearch?**
- Amazon's open-source fork (Elasticsearch went proprietary)
- ✅ Full-text search, no limitations
- ✅ 3k+ GitHub stars, active development
- ✅ Drop-in replacement for ELK stack

**Stack**:
- **OpenSearch** — Log storage + search
- **Logstash** — Log shipping + parsing
- **OpenSearch Dashboards** — Visualization

**Docker Compose**:

```yaml
version: '3.8'
services:
  opensearch:
    image: opensearchproject/opensearch:latest
    environment:
      - discovery.type=single-node
      - OPENSEARCH_INITIAL_ADMIN_PASSWORD=MyPassword123!
    ports:
      - "9200:9200"
    volumes:
      - opensearch-data:/usr/share/opensearch/data

  opensearch-dashboards:
    image: opensearchproject/opensearch-dashboards:latest
    ports:
      - "5601:5601"
    depends_on:
      - opensearch
```

**Ship logs from FastAPI**:

```python
from pythonjsonlogger import jsonlogger
import logging

handler = logging.FileHandler('app.log')
formatter = jsonlogger.JsonFormatter()
handler.setFormatter(formatter)
logger = logging.getLogger()
logger.addHandler(handler)
```

**Cost**: Free (your infra: ~$15-20/month for adequate resources)

---

### Option 2: Loki (GRAFANA'S LOG AGGREGATION)

**Why it's lean**:
- ✅ Designed for low storage cost (indexes labels, not content)
- ✅ Works with existing Prometheus/Grafana setup
- ✅ AGPL licensed (free)
- ✅ Lightweight (~100MB RAM)

**Architecture**:
```
FastAPI logs (JSON)
  ↓
Promtail (log shipper)
  ↓
Loki (storage)
  ↓
Grafana (dashboard)
```

**Setup**:

```bash
# 1. Add Loki to docker-compose
services:
  loki:
    image: grafana/loki:latest
    ports:
      - "3100:3100"
    command: -config.file=/etc/loki/local-config.yaml
    volumes:
      - ./loki-config.yaml:/etc/loki/local-config.yaml
      - loki-storage:/loki

# 2. Configure Promtail (runs on each server)
docker run -v /var/log:/var/log \
  -v ./promtail-config.yaml:/etc/promtail/config.yaml \
  grafana/promtail:latest

# 3. Add Loki datasource to Grafana
```

**Cost**: Free ($5-10/month for minimal VPS)

---

### Option 3: Jaeger (DISTRIBUTED TRACING, 100% OSS)

**Why it matters**:
- ✅ Created by Uber, battle-tested at scale
- ✅ CNCF graduated project (stable)
- ✅ OpenTelemetry native
- ✅ Beautiful trace visualization

**Docker setup**:

```bash
docker run -d \
  --name jaeger \
  -p 6831:6831/udp \
  -p 16686:16686 \
  jaegertracing/all-in-one:latest

# Access UI: http://localhost:16686
```

**Cost**: Free (your infra, minimal resources)

---

### COMBINED STACK (ALL FREE)

**"ELK on a Budget"**:

```docker-compose
version: '3.8'
services:
  # Logs
  opensearch:
    image: opensearchproject/opensearch:latest
    # ... (see above)

  # Metrics
  prometheus:
    image: prom/prometheus:latest
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus-data:/prometheus

  # Traces
  jaeger:
    image: jaegertracing/all-in-one:latest
    ports:
      - "6831:6831/udp"
      - "16686:16686"

  # Visualization
  grafana:
    image: grafana/grafana:latest
    ports:
      - "3000:3000"
    depends_on:
      - opensearch
      - prometheus

volumes:
  opensearch-data:
  prometheus-data:
  jaeger-data:
```

**Total cost**: $10-20/month (single $15 VPS runs all 4 services)  
**Data ownership**: 100%  
**Scalability**: Fork data to larger VM as needed

---

## PART C: ANALYTICS (100% FREE/OSS)

### Option 1: PostHog (FULL STACK, OPEN-SOURCE)

**What it does**:
- ✅ Product analytics (event tracking)
- ✅ Session replay (watch users)
- ✅ Feature flags (A/B testing)
- ✅ Cohort analysis
- ✅ Trend analysis

**Docker setup** (single container):

```bash
docker run -d \
  --name posthog \
  -p 8000:8000 \
  -e DEBUG=false \
  -e DISABLE_SECURE_SSL_REDIRECT=false \
  posthog/posthog:latest
```

**Initialize in React**:

```typescript
import posthog from 'posthog-js'

posthog.init('phc_YOUR_KEY', {
  api_host: 'http://localhost:8000',
})
```

**Cost**: Free (requires modest VPS, ~512MB RAM)  
**GitHub**: https://github.com/PostHog/posthog (18k+ stars)

---

### Option 2: Plausible (LIGHTWEIGHT, GDPR-READY)

⚠️ **Note**: Plausible is NOT open-source, but **$4.99/month is as cheap as it gets for SaaS**

- ✅ GDPR/CCPA compliant (no cookies)
- ✅ COPPA-friendly (no tracking pixels)
- ✅ Minimal JS (2KB)
- ✅ Privacy-first analytics

```html
<!-- Drop in your <head> -->
<script defer data-domain="advay.com" src="https://plausible.io/js/script.js"></script>
```

**Cost**: $4.99/month (10k page views) or free tier (100 page views/day)

---

### Option 3: Matomo (OPEN-SOURCE GOOGLE ANALYTICS REPLACEMENT)

**Why Matomo**:
- ✅ 100% open-source
- ✅ Self-hosted or SaaS
- ✅ Feature-rich (like Google Analytics)
- ✅ Heatmaps, session recording, goals

**Docker setup**:

```bash
docker run -d \
  --name matomo \
  -p 8080:80 \
  matomo:latest
```

**Cost**: Free (self-hosted, ~$10/month infra)

---

## PART D: FRONTEND HOSTING (100% FREE)

### Option 1: Netlify Free Tier

**Limits**:
- ✅ 100GB/month bandwidth
- ✅ Auto-deploy from GitHub
- ✅ Free SSL certificate
- ✅ Serverless functions (pay-as-you-go)
- ✅ 1 site free

**Setup**:

```bash
# 1. npm install -g netlify-cli
# 2. netlify deploy --prod --dir=build

# Or: Connect GitHub repo → auto-deploy on every push
```

**Cost**: $0 (until >100GB bandwidth/month)

---

### Option 2: Cloudflare Pages Free Tier

**Limits**:
- ✅ Unlimited deployments
- ✅ Auto-scaling serverless functions
- ✅ Free SSL + edge caching
- ✅ Analytics dashboard
- ✅ Supports Next.js, React, etc.

**Setup**:

```bash
# 1. Install Cloudflare Wrangler (CLI)
npm install -g @cloudflare/wrangler
# 2. Authenticate
wrangler login
# 3. Publish the build directory to Cloudflare Pages
wrangler pages publish ./dist --project-name=<YOUR_PROJECT_NAME> --branch=main
```

**Cost**: $0 (until $100/month usage)

---

### Option 3: Cloudflare Pages (FASTEST, FREE)

**Limits**:
- ✅ Unlimited bandwidth
- ✅ Unlimited deployments
- ✅ Edge workers (serverless)
- ✅ Free SSL
- ✅ DDoS protection
- ✅ Workers KV (edge key-value store)

**Setup**:

```bash
# 1. npm install wrangler
# 2. wrangler pages publish ./dist

# Or: Connect GitHub → auto-deploy
```

**Cost**: $0 (forever, no surprise limits)

---

## PART E: BACKEND HOSTING (MINIMAL COST)

### Option 1: Fly.io (CHEAPEST RELIABLE OPTION)

**Why Fly**:
- ✅ $5/month base + pay-as-you-use (compute + storage)
- ✅ Global deployment (anycast)
- ✅ Free tier: 3 shared-cpu-1x VMs
- ✅ PostgreSQL + Redis included

**Deploy FastAPI**:

```bash
# 1. npm install -g flyctl
# 2. fly launch
# 3. fly deploy

# Cost: ~$15-30/month for production app
```

---

### Option 2: Railway (SIMPLE, GENEROUS FREE TIER)

**Free tier**:
- $5/month credit (runs small app free)
- PostgreSQL + Redis included
- Auto-deploy from GitHub

**Cost**: $0-10/month for small app

---

### Option 3: Render (SIMPLE DEPLOYMENT)

**Free tier**:
- Auto-sleep when inactive
- PostgreSQL + Redis free
- 0.5 GB RAM

**Cost**: $0 (with auto-sleep) or $7/month (always-on)

---

## PART F: CDN & EDGE SERVICES (100% FREE)

### Option 1: Cloudflare (BEST FREE CDN)

**What you get free**:
- ✅ Global CDN (250+ edge locations)
- ✅ SSL/TLS certificate
- ✅ DDoS protection (unlimited)
- ✅ WAF (Web Application Firewall)
- ✅ Page caching rules
- ✅ Email forwarding
- ✅ Workers (serverless, 100k requests/day free)

**Setup** (DNS only):

```bash
# 1. Point your domain to Cloudflare nameservers
# 2. Enable caching rules
# 3. Done (instant 3x speed improvement)
```

**Cost**: $0/month (forever, no bandwidth limits)

**Use for**:
- Static assets (game art, sound)
- API rate limiting
- Bot protection
- Redirect from COPPA consent pages

---

### Option 2: BunnyCDN (CHEAP PAID ALTERNATIVE)

If Cloudflare free tier isn't enough:

- ✅ $0.01/GB (vs Cloudflare's free)
- ✅ Superior image optimization
- ✅ HLS streaming built-in
- ✅ Better video delivery

**Cost**: ~$5-20/month (depending on traffic)

---

### Option 3: jsDelivr (FREE CDN FOR NPM PACKAGES)

**For shipping JavaScript**:

```html
<!-- All your dependencies via CDN -->
<script src="https://cdn.jsdelivr.net/npm/react@18/dist/react.production.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/posthog-js@latest/dist/posthog.js"></script>
```

**Cost**: $0 (community-run, no limits)

---

## PART G: DATABASE & STORAGE (CHEAP/FREE)

### Option 1: PostgreSQL (INCLUDED IN HOSTING)

- Fly.io: PostgreSQL included
- Railway: PostgreSQL included (3GB free)
- Render: PostgreSQL included

**Cost**: Free (included in $5-15/month hosting)

---

### Option 2: Database Backups (ULTRA-CHEAP)

**Wasabi Object Storage**:
- $5.99/month for 1TB
- S3-compatible API
- Good for database backups

```bash
# Cron job to backup daily
0 2 * * * pg_dump $DATABASE_URL | \
  aws s3 cp - \
  s3://advay-backups/db-$(date +%Y%m%d).dump \
  --region us-east-1
```

**Cost**: $6/month (unlimited backups)

---

### Option 3: Backblaze B2 (CHEAPEST OBJECT STORAGE)

- $0.006/GB/month (vs AWS S3: $0.023)
- First 10GB free
- Identical API to S3

**Cost**: ~$1-3/month for daily backups

---

## PART H: EMAIL (MINIMAL COST)

### Option 1: Resend (BEST FOR TRANSACTIONAL)

- Free tier: 100 emails/day
- $20/month: 50k emails/month

**Perfect for**:
- Parental consent verification
- Game completion notifications
- Parent weekly summaries

```python
from resend import Resend

client = Resend(api_key="...")
response = client.emails.send(
    from_="noreply@advay.com",
    to="parent@example.com",
    subject="Consent verification",
    html="<p>Click to verify...</p>",
)
```

**Cost**: Free (100/day) → $20/month (scale)

---

### Option 2: Mailgun (DEVELOPER-FRIENDLY)

- Free tier: 100 emails/day
- Pay-as-you-go: $0.50 per 1000 emails

```python
import mailgun.client

mg = mailgun.client(domain="sandboxXXX.mailgun.org", api_key="...")
mg.messages.create(
    to=["parent@example.com"],
    from_="noreply@advay.com",
    subject="Consent",
    text="...",
)
```

**Cost**: Free (100/day) → $2-5/month (scale)

---

## PART I: COMPLETE FREE/OSS STACK

### Architecture

```
┌─────────────────────────────────────────────────────┐
│                 FRONTEND (Cloudflare Pages)          │
│                    React app + static               │
│              (100GB bandwidth, $0/month)             │
└────────────────┬────────────────────────────────────┘
                 │ (CDN via Cloudflare)
                 ↓
┌────────────────────────────────────────┐
│       CLOUDFLARE WORKERS ($0)          │
│  Auth, rate limiting, bot protection   │
└────────┬─────────────────────┬─────────┘
         │                     │
         ↓                     ↓
    ┌─────────┐           ┌─────────┐
    │  Fly.io │           │ Mailgun │
    │ Backend │           │  Email  │
    │ ($15/mo)│           │  ($0)   │
    └────┬────┘           └─────────┘
         │
    ┌────┴─────────┐
    ├─ FastAPI app │
    ├─ PostgreSQL  │
    └─ Redis cache │
         │
         ↓
    ┌────────────────────────────────────────────────┐
    │  OBSERVABILITY (Monitoring + Analytics)        │
    ├────────────────────────────────────────────────┤
    │  ✅ Uptime Kuma (monitoring)           $0      │
    │  ✅ Jaeger (tracing)                  $0      │
    │  ✅ OpenSearch (logs)                 $0      │
    │  ✅ Prometheus (metrics)              $0      │
    │  ✅ PostHog (analytics)               $0      │
    │  → Run on $10-15/mo VPS               $15/mo  │
    └────────────────────────────────────────────────┘
```

### Total Monthly Cost

| Component | Cost | Notes |
|-----------|------|-------|
| Fly.io (backend) | $15 | Includes PostgreSQL + Redis |
| VPS (observability) | $10 | Uptime Kuma + OpenSearch + Jaeger + PostHog |
| Wasabi/B2 (backups) | $5 | Unlimited daily backups |
| Resend (email) | $0 | 100/day free |
| Cloudflare (CDN) | $0 | Unlimited bandwidth |
| Netlify/Cloudflare Pages (frontend) | $0 | Auto-deploy |
| Domain | $10 | (not included, annual) |
| **TOTAL** | **~$40/month** | Production-ready, $0 SaaS |

---

## PART J: SETUP CHECKLIST (100% FREE/OSS)

### Week 1: Core Infrastructure

- [ ] Register domain (Namecheap: $7-10/year)
- [ ] Create Fly.io account, deploy FastAPI
- [ ] Set up PostgreSQL on Fly
- [ ] Point domain DNS to Fly
- [ ] Deploy frontend to Netlify or Cloudflare Pages
- [ ] Add Cloudflare as reverse proxy (free DDoS protection)

**Cost**: $15/month  
**Time**: 3-4 hours

### Week 2: Monitoring

- [ ] Rent $10 VPS (Linode, DigitalOcean, Vultr)
- [ ] Install Uptime Kuma (Docker)
- [ ] Add 2-3 health checks (frontend, backend, health endpoint)
- [ ] Configure Slack alerts
- [ ] Create public status page

**Cost**: +$10/month  
**Time**: 2 hours

### Week 3: Observability

- [ ] Install OpenSearch (Loki alternative) on VPS
- [ ] Ship FastAPI logs to OpenSearch
- [ ] Install Jaeger on VPS
- [ ] Add OpenTelemetry to FastAPI
- [ ] Set up Grafana dashboards

**Cost**: Same VPS ($10/month total)  
**Time**: 4-6 hours

### Week 4: Analytics

- [ ] Install PostHog (Docker on VPS)
- [ ] Add event tracking to React
- [ ] Create learning dashboard
- [ ] Set up alerts for error rate

**Cost**: Same VPS ($10/month total)  
**Time**: 3-4 hours

### Week 5: Backups

- [ ] Set up Wasabi/B2 account
- [ ] Create daily backup cron job
- [ ] Test restore process
- [ ] Monitor backup integrity

**Cost**: +$5/month  
**Time**: 1-2 hours

---

## PART K: COMPARISON: FREE/OSS vs. AUDIT RECOMMENDATIONS

| Feature | Free/OSS | Audit Recommendation | Status |
|---------|----------|---|---|
| **Uptime Monitoring** | Uptime Kuma | Healthchecks.io + Kuma | ✅ Match |
| **Logging** | OpenSearch | Loki (lighter weight) | ✅ Match |
| **Tracing** | Jaeger | OpenTelemetry + Jaeger | ✅ Match |
| **Analytics** | PostHog | PostHog (OSS recommended) | ✅ Match |
| **Alerting** | Prometheus rules | Healthchecks + custom | ✅ Match |
| **Frontend** | Cloudflare Pages | Any CDN | ✅ Match |
| **Backend** | Fly.io | Railway/Render/Fly | ✅ Match |

**Bottom line**: **Audit recommendations align with free/OSS options**. You can follow the deployment readiness audit for $0 additional software cost.

---

## CONCLUSION

**You can deploy Advay for production with**:

✅ $0 software licensing  
✅ $40/month infrastructure (backend + observability VPS)  
✅ 100% data ownership  
✅ No vendor lock-in  
✅ Industry-standard OSS tools (Jaeger, Prometheus, OpenSearch)  
✅ Full COPPA compliance  

**Timeline**: 3-4 weeks of setup  
**Effort**: ~20 hours engineering  
**Result**: Production-ready app with full observability

---

## REFERENCES

**Uptime Monitoring**:
- Uptime Kuma: https://github.com/louislam/uptime-kuma
- Statping-ng: https://github.com/statping-ng/statping-ng
- OneUptime: https://github.com/OneUptime/oneuptime

**Logging & Tracing**:
- OpenSearch: https://opensearch.org/
- Loki: https://grafana.com/oss/loki/
- Jaeger: https://www.jaegertracing.io/

**Analytics**:
- PostHog: https://github.com/PostHog/posthog
- Matomo: https://github.com/matomo-org/matomo

**Infrastructure**:
- Fly.io: https://fly.io/
- Cloudflare Pages: https://pages.cloudflare.com/
- Netlify: https://app.netlify.com/

**Last Updated**: 2026-03-14
