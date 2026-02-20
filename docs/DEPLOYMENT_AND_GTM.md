# Advay Vision Learning — Deployment & Go-To-Market Strategy

> **Comprehensive deployment architecture, GTM strategy, compliance requirements, and cost analysis** for the Advay Vision Learning platform (ages 3–8, React+TypeScript+Vite frontend, FastAPI+PostgreSQL backend, 16 interactive camera-based learning games).

---

## Table of Contents

1. [Deployment Architecture](#1-deployment-architecture)
2. [Production Architecture](#2-production-architecture)
3. [CI/CD Pipeline](#3-cicd-pipeline)
4. [Go-To-Market Strategy](#4-go-to-market-strategy)
5. [Compliance & Privacy](#5-compliance--privacy)
6. [Cost Analysis](#6-cost-analysis)
7. [Key Metrics & KPIs](#7-key-metrics--kpis)

---

## 1. Deployment Architecture

### Frontend Hosting

| Platform | Pros | Cons | Free Tier | Paid |
|----------|------|------|-----------|------|
| **Vercel** | Best Vite support, edge functions, instant preview deploys, analytics | Vendor lock-in for serverless functions | 100 GB bandwidth, 6000 build min/mo | Pro $20/mo |
| **Netlify** | Great DX, form handling, split testing, identity service | Slower builds, limited edge functions | 100 GB bandwidth, 300 build min/mo | Pro $19/mo |
| **Cloudflare Pages** | Fastest global CDN, unlimited bandwidth, Workers integration | Newer platform, fewer integrations | Unlimited bandwidth, 500 builds/mo | Pro $25/mo |

**Recommendation: Vercel**
- Native Vite support with zero-config
- Preview deploys for every PR
- Edge caching optimized for SPA + large WASM bundles (MediaPipe)
- Built-in Web Analytics (privacy-friendly)

**Configuration:**
```bash
# vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

### Backend Hosting

| Platform | Pros | Cons | Free Tier | Paid |
|----------|------|------|-----------|------|
| **Railway** | One-click PostgreSQL, auto-deploy from GitHub, simple pricing | Limited regions (US/EU) | $5 credit/mo | Usage-based (~$5-50/mo) |
| **Render** | Free tier with PostgreSQL, auto-scaling, managed SSL | Cold starts on free tier (30s+) | 750 hrs/mo (web), 90-day free DB | Starter $7/mo |
| **Fly.io** | Global edge deployment, persistent volumes, low latency | More complex setup, CLI-focused | 3 shared VMs, 1 GB volumes | Usage-based |

**Recommendation: Railway**
- Easiest PostgreSQL provisioning (one-click add-on)
- Auto-deploy from GitHub push
- No cold starts
- Simple Docker deployment

**Docker Deployment:**
```dockerfile
FROM python:3.13-slim
WORKDIR /app
COPY pyproject.toml uv.lock ./
RUN pip install uv && uv sync --frozen
COPY src/backend ./src/backend
CMD ["uvicorn", "src.backend.app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Database

| Platform | Pros | Cons | Free Tier | Paid |
|----------|------|------|-----------|------|
| **Neon** | Serverless PostgreSQL, auto-scaling, branching, generous free tier | Newer, fewer regions | 0.5 GB storage, 190 compute hrs/mo | Pro $19/mo |
| **Supabase** | Full BaaS (auth, storage, realtime), PostgreSQL | Heavier than needed, vendor lock-in | 500 MB DB, 1 GB storage | Pro $25/mo |
| **Railway PostgreSQL** | Integrated with Railway hosting, simple | No serverless scaling, limited tooling | Included in $5 credit | Usage-based |

**Recommendation: Neon**
- Serverless auto-scaling (scale to zero when idle)
- Database branching for preview environments
- Generous free tier covers development + early users
- Standard PostgreSQL (no vendor lock-in)

### ML Model CDN

MediaPipe requires WASM binaries (~4 MB) and model files (~5-10 MB) that need fast, cached delivery.

| Option | Pros | Cons |
|--------|------|------|
| **jsDelivr** | Free, global CDN, npm package caching | No control over availability |
| **Cloudflare R2** | $0.015/GB storage, no egress fees, S3-compatible | Requires setup |
| **Bundled with frontend** | Simplest, no external dependency | Increases bundle size significantly |

**Recommendation: jsDelivr (primary) + bundled fallback**
```typescript
// Load from CDN with fallback
const MEDIAPIPE_CDN = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm';
```

---

## 2. Production Architecture

```
                    ┌─────────────────────────────┐
                    │         Cloudflare DNS       │
                    │     (DDoS protection, SSL)   │
                    └──────────┬──────────────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
     ┌────────▼──────┐  ┌─────▼──────┐  ┌──────▼──────┐
     │  Vercel CDN   │  │  Railway   │  │  jsDelivr   │
     │  (Frontend)   │  │  (API)     │  │  (ML Models)│
     │  React SPA    │  │  FastAPI   │  │  WASM+Model │
     │  + Assets     │  │  + Auth    │  │  Files      │
     └───────────────┘  └─────┬──────┘  └─────────────┘
                              │
                        ┌─────▼──────┐
                        │   Neon     │
                        │ PostgreSQL │
                        │ (Serverless)│
                        └────────────┘
```

**Security Layers:**
- HTTPS everywhere (enforced by all platforms)
- CORS: API allows only frontend origin
- Rate limiting: 100 req/min per user on API
- JWT auth with short-lived tokens (15 min access, 7 day refresh)
- Content-Security-Policy headers (restrict camera API sources)
- No PII stored from camera (only processed landmark data)

---

## 3. CI/CD Pipeline

### GitHub Actions Workflow

```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 18 }
      - run: npm ci
        working-directory: src/frontend
      - run: npm run lint
        working-directory: src/frontend
      - run: npm run type-check
        working-directory: src/frontend
      - run: npm run test -- --run
        working-directory: src/frontend
      - run: npm run build
        working-directory: src/frontend

  backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with: { python-version: '3.13' }
      - run: pip install uv && uv sync --frozen
      - run: uv run ruff check src/backend
      - run: uv run mypy src/backend/app
      - run: uv run pytest tests/
```

### Deployment Flow

1. **PR opened** → Preview deploy on Vercel (automatic)
2. **CI passes** → Merge to main
3. **Main push** → Auto-deploy frontend (Vercel) + backend (Railway)
4. **Database migrations** → Run via Railway deploy hook or manual trigger

---

## 4. Go-To-Market Strategy

### Market Analysis

**India EdTech Market:**
- Market size: $6.4B (2025), projected $18.2B by 2030
- CAGR: 39% (one of the fastest-growing globally)
- K-8 segment: ~35% of total market
- Smartphone penetration: 750M+ users (2025)
- Tier 2-3 city growth outpacing metros

**Target Segment:**
- Parents of children ages 3-8
- Tier 1-3 Indian cities
- English-medium and vernacular-medium schools
- Tech-savvy parents seeking quality screen time alternatives
- Monthly household income: ₹30,000+ (middle class and above)

**Competitive Landscape:**

| Competitor | Pricing | Strengths | Weaknesses |
|-----------|---------|-----------|------------|
| BYJU'S | ₹999-2,999/mo | Brand recognition, content depth | Declining trust, aggressive sales, expensive |
| Cuemath | ₹1,500-3,000/mo | Live tutoring, math focus | High price, limited subjects |
| Khan Academy Kids | Free | Quality content, no ads | No Indian languages, no camera interaction |
| Kiddopia | $7.99/mo (~₹660) | Polished games, good UX | No camera interaction, English only |
| **Advay Vision** | ₹199-299/mo | Camera-based interaction, 5 Indian languages, privacy-first, affordable | New brand, smaller content library |

**Key Differentiators:**
1. **Camera-based interactive learning** — unique in the market; no competitor uses MediaPipe hand/pose tracking
2. **Multilingual** — 5 Indian languages (English, Hindi, Kannada, Telugu, Tamil)
3. **Privacy-first** — no video recording, no ads, COPPA-compliant
4. **Affordable** — 5-10x cheaper than BYJU'S/Cuemath
5. **Progressive Web App** — works on any device with a browser and camera

### Pricing Strategy

| Tier | Price | Features |
|------|-------|----------|
| **Free** | ₹0 | 3 games (Alphabet Tracing, Finger Number Show, Connect the Dots), 15 min/day, 1 child profile |
| **Premium** | ₹199/mo or ₹1,499/yr (37% savings) | All 16 games, unlimited play time, 3 child profiles, progress tracking & reports |
| **Family** | ₹299/mo or ₹2,499/yr (30% savings) | All Premium features + 5 child profiles, teacher/parent dashboard, offline mode, priority support |

**Pricing Rationale:**
- Free tier provides enough value to demonstrate the camera interaction (primary differentiator)
- ₹199/mo is affordable for target segment (< cost of one tutoring session)
- Annual plans incentivize retention with significant savings
- Family plan targets households with multiple children or small preschools

### Distribution Channels

| Channel | Strategy | Timeline |
|---------|----------|----------|
| **PWA (Primary)** | Direct web access, installable on home screen, no app store fees | Month 1 |
| **Google Play Store** | TWA (Trusted Web Activity) wrapper or React Native shell | Month 3 |
| **Apple App Store** | Capacitor/React Native wrapper (requires Apple Developer account $99/yr) | Month 6 |
| **School Partnerships (B2B2C)** | Free pilot for 10 schools, teacher dashboard, bulk licensing | Month 5 |
| **WhatsApp Distribution** | Shareable game links with preview cards | Month 2 |

### Marketing Channels

| Channel | Tactic | Budget | Expected CAC |
|---------|--------|--------|-------------|
| **Instagram Reels / YouTube Shorts** | 15-30s clips of kids using camera games (wow factor) | ₹20K/mo | ₹50-100 |
| **Parenting Facebook Groups** | Organic posts, parent testimonials, "screen time that teaches" angle | ₹0 (organic) | ₹0 |
| **WhatsApp Viral Loops** | "Share with 3 parents, get 1 month free" referral program | ₹5K/mo (reward cost) | ₹30-50 |
| **SEO Content** | Blog: "Best learning apps for 3-year-olds India", "How to make screen time educational" | ₹10K/mo (content) | ₹20-40 |
| **Parent YouTubers** | Sponsored reviews from 10-50K subscriber channels | ₹15K/mo | ₹80-120 |
| **School Demo Days** | In-person demos at preschools, parent-teacher meetings | ₹5K/mo (travel) | ₹30-60 |
| **Google Ads** | Search ads for "kids learning app", "alphabet app for kids India" | ₹15K/mo | ₹100-150 |

### Launch Phases

#### Phase 1: Soft Launch (Month 1-2)
- **Goal:** Validate product-market fit with 50 families
- Invite-only beta via personal network + parenting groups
- Weekly user interviews (5-10 parents)
- Track: session length, game completion, NPS, bug reports
- Iterate on top 3 issues weekly
- **Success metric:** 40% D7 retention, NPS > 30

#### Phase 2: Public Launch (Month 3-4)
- **Goal:** Reach 500 users, establish brand presence
- PWA + Google Play Store launch
- Press release + 3 influencer partnerships
- Launch referral program
- Begin content marketing (2 blog posts/week)
- **Success metric:** 500 users, 5% free-to-paid conversion

#### Phase 3: Growth (Month 5-8)
- **Goal:** Reach 5,000 users, establish school channel
- School partnership pilot (10 schools)
- Regional language marketing (Hindi, Kannada content)
- Launch Family tier
- Performance marketing (Google Ads, Instagram Ads)
- **Success metric:** 5,000 users, 8% conversion, 3 school deals

#### Phase 4: Scale (Month 9-12)
- **Goal:** 20,000 users, sustainable unit economics
- Apple App Store launch
- B2B teacher dashboard
- Explore international markets (Southeast Asia, Middle East)
- Series seed fundraise if metrics support
- **Success metric:** 20,000 users, LTV:CAC > 3:1, ₹5L MRR

---

## 5. Compliance & Privacy

### COPPA (Children's Online Privacy Protection Act, US)

| Requirement | Implementation |
|------------|---------------|
| Parental consent for children under 13 | Email-based verifiable parental consent before account creation |
| No behavioral advertising | Zero ad network integrations; subscription-only monetization |
| Data minimization | Only collect: name, age, language preference, game progress |
| Parental access to data | Parent dashboard with view/export/delete capabilities |
| Secure data handling | Encrypted at rest (AES-256) and in transit (TLS 1.3) |
| Privacy policy | Child-friendly language, prominently displayed |

### India DPDPA (Digital Personal Data Protection Act, 2023)

| Requirement | Implementation |
|------------|---------------|
| Verifiable parental consent | OTP-based mobile verification for parent account |
| Data localization | Primary database hosted in India region (Neon/Railway Mumbai) |
| Purpose limitation | Data used solely for learning progress; no third-party sharing |
| Right to erasure | One-click "Delete my child's data" in parent settings |
| Data breach notification | Automated monitoring + 72-hour notification pipeline |
| Data Protection Officer | Designated DPO contact in privacy policy |

### Camera Consent & Safety

| Measure | Implementation |
|---------|---------------|
| Explicit opt-in | Camera permission requested per-game with clear explanation |
| Visual indicator | Green dot overlay when camera is active |
| No recording | Camera frames processed in-browser; only hand/pose landmarks extracted |
| No cloud upload | All MediaPipe processing runs client-side (WASM) |
| Easy disable | Visible "Stop Camera" button in every game |
| Privacy policy | Plain-language explanation of camera usage for parents |

### GDPR (General Data Protection Regulation, EU/International)

| Requirement | Implementation |
|------------|---------------|
| Lawful basis | Parental consent (Art. 8 — children's data) |
| Data subject rights | Access, rectification, erasure, portability via parent dashboard |
| Cross-border transfers | Standard Contractual Clauses for any US-hosted infrastructure |
| Privacy by design | Minimal data collection, client-side processing, encryption |

---

## 6. Cost Analysis

### 100 Users (Early Beta)

| Service | Provider | Plan | Monthly Cost |
|---------|----------|------|-------------|
| Frontend hosting | Vercel | Free (Hobby) | $0 |
| Backend hosting | Railway | Free tier ($5 credit) | $0 |
| Database | Neon | Free tier | $0 |
| ML models CDN | jsDelivr | Free | $0 |
| Domain | Cloudflare | $10/yr | ~$1 |
| Email (transactional) | Resend | Free (100/day) | $0 |
| **Total** | | | **~$1/mo** |

### 1,000 Users (Post-Launch)

| Service | Provider | Plan | Monthly Cost |
|---------|----------|------|-------------|
| Frontend hosting | Vercel | Pro | $20 |
| Backend hosting | Railway | Starter | $10 |
| Database | Neon | Launch | $19 |
| ML models CDN | jsDelivr | Free | $0 |
| Domain + DNS | Cloudflare | Free + domain | ~$1 |
| Email (transactional) | Resend | Pro | $20 |
| Error monitoring | Sentry | Free tier | $0 |
| **Total** | | | **~$70/mo** |

### 10,000 Users (Growth)

| Service | Provider | Plan | Monthly Cost |
|---------|----------|------|-------------|
| Frontend hosting | Vercel | Pro | $20 |
| Backend hosting | Railway | Pro (scaled) | $50 |
| Database | Neon | Scale | $69 |
| ML models CDN | Cloudflare R2 | Usage-based | $5 |
| Domain + DNS | Cloudflare | Pro | $20 |
| Email (transactional) | Resend | Pro | $20 |
| Error monitoring | Sentry | Team | $26 |
| Analytics | PostHog | Free (self-host) or Cloud | $0-50 |
| **Total** | | | **~$210-260/mo** |

### Revenue vs. Cost (Break-Even Analysis)

| Users | Free | Paid (8% conv.) | Monthly Revenue (₹199/mo) | Monthly Cost | Net |
|-------|------|-----------------|--------------------------|-------------|-----|
| 100 | 92 | 8 | ₹1,592 (~$19) | ~$1 | +$18 |
| 1,000 | 920 | 80 | ₹15,920 (~$190) | ~$70 | +$120 |
| 10,000 | 9,200 | 800 | ₹1,59,200 (~$1,900) | ~$250 | +$1,650 |

---

## 7. Key Metrics & KPIs

### Engagement Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| DAU/MAU ratio | 40%+ | Daily active / Monthly active users |
| Avg. session length | 12-15 minutes | Time from app open to close |
| Games per session | 2-3 | Number of distinct games played |
| Game completion rate | 70%+ | % of started games that reach completion |

### Retention Metrics

| Metric | Target | Industry Avg (Kids Apps) |
|--------|--------|------------------------|
| D1 retention | 60% | 40-50% |
| D7 retention | 40% | 20-30% |
| D30 retention | 25% | 10-15% |
| D90 retention | 15% | 5-8% |

### Business Metrics

| Metric | Target | Notes |
|--------|--------|-------|
| Free-to-paid conversion | 5-8% | After 7-day exposure |
| Monthly churn rate | <8% | Premium subscribers |
| LTV (Lifetime Value) | ₹2,000+ | 10+ months avg subscription |
| CAC (Customer Acquisition Cost) | ₹200-400 | Blended across channels |
| LTV:CAC ratio | >3:1 | Healthy SaaS benchmark |
| NPS (Net Promoter Score) | 50+ | Measured monthly via in-app survey |

### Technical Metrics

| Metric | Target | Notes |
|--------|--------|-------|
| Page load time (LCP) | <2.5s | Core Web Vital |
| Camera init time | <3s | Time to first hand detection |
| Error rate | <1% | Client-side errors per session |
| API response time (p95) | <200ms | Backend latency |
| Uptime | 99.9% | Monthly availability |

---

*Last updated: 2026-02-20*
