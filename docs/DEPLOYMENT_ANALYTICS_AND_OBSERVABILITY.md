# Comprehensive Analytics & Observability Strategy
**Date**: 2026-03-14  
**Status**: Research + Recommendations  
**Audience**: Product / Engineering / Analytics

---

## EXECUTIVE SUMMARY

Analytics answers **"What are users doing?"** while observability answers **"Why did it break?"** For Advay, you need:

1. **Product Analytics** — Track learning progress, engagement, retention (know if kids are learning)
2. **Business Analytics** — DAU, MAU, conversion funnels, churn (know if the business works)
3. **Observability/APM** — Request latency, error rates, resource usage (catch outages early)
4. **COPPA Compliance** — Privacy-first event tracking; no third-party ad networks; no persistent tracking

**Recommended**: **PostHog (open-source product analytics)** + **Sentry (error tracking)** + **Prometheus/Grafana (infrastructure metrics)**. Cost: $0 (OSS) to $200+/month (SaaS). Setup: 2-4 weeks.

---

## PART A: TYPES OF ANALYTICS

### A1. Product Analytics

**What it tracks**: User behavior → learning insights

| Event | Why It Matters | Who Cares | Compliance |
|-------|---|---|---|
| **game_started** | Is child engaging with games? | Product, UX | Safe (no PII) |
| **game_completed** | Did child finish? (learning = completion) | Product, Parents | Safe |
| **progress_tracked** | Child's skill progression | Parents, Teachers | Safe |
| **session_duration** | Time spent (engagement metric) | Product | Safe |
| **feature_used** | Which game/feature? | Product, Dev | Safe |
| **error_encountered** | What broke? When? | Dev, Support | Safe if no user data |

**Key insight**: Track **actions**, not **identity**. You can say "50 kids played Shape Pop" without tracking which kids, when, or for how long (COPPA-compliant).

### A2. Business Analytics

**What it tracks**: Revenue, users, retention

| Metric | Definition | Formula | Target |
|--------|---|---|---|
| **DAU** | Daily Active Users | Unique users per day | ↗ (up is good) |
| **MAU** | Monthly Active Users | Unique users per month | ↗ |
| **Cohort Retention** | % users active N days later | Day 1 cohort returning Day 7 | >40% |
| **Churn Rate** | % users leaving | (Users lost / Prior month) | <5% |
| **Conversion** | % users who paid | (Paying / Total) | >2-5% |
| **ARPU** | Average Revenue Per User | (Total Revenue / Users) | >$0.50 |

### A3. Observability / APM (Application Performance Monitoring)

**What it tracks**: System health → operational insight

| Metric | Why It Matters | Threshold | Action |
|--------|---|---|---|
| **Request latency (p95)** | How fast is the app? | <500ms | Alert if >1000ms |
| **Error rate** | What % requests fail? | <1% | Alert if >5% |
| **Database latency** | How slow are queries? | <100ms avg | Profile if >500ms |
| **Memory usage** | RAM consumption | <60% | Alert if >80% |
| **Cache hit rate** | How often is cache useful? | >80% | Investigate if <50% |
| **Request throughput** | Requests per second | Depends on capacity | Know your limit |

---

## PART B: ANALYTICS TOOLS COMPARISON

### B1. Product Analytics (User Behavior Tracking)

| Tool | Type | Cost | Privacy | COPPA Ready | Setup |
|------|------|------|---------|---|---|
| **PostHog** | OSS + SaaS | $0 (OSS) / $450+/mo (SaaS) | ✅ Best-in-class | ✅ Yes | 2-3 hours |
| **Plausible** | SaaS | $15-260/mo | ✅ Privacy-first | ✅ Yes | 1-2 hours |
| **Amplitude** | SaaS | Free (limited) / $995+/mo | ⚠️ Ad-tech focused | ❌ No | 2-3 hours |
| **Mixpanel** | SaaS | Free (limited) / $999+/mo | ⚠️ Behavior tracking | ❌ No | 2-3 hours |
| **Countly** | OSS + SaaS | $0 (OSS) / $199+/mo | ✅ Privacy-first | ✅ Yes (verified) | 2-3 hours |
| **Matomo** | OSS + SaaS | $0 (OSS) / $159+/mo | ✅ Privacy-first | ✅ Yes | 2-3 hours |
| **Segment** | Data pipeline | Free (limited) / $120+/mo | ⚠️ Depends on destinations | ⚠️ No | 4-5 hours |

**Recommended**: **PostHog (OSS)** — full data ownership, COPPA-ready, open-source

### B2. Business Analytics (Revenue & Retention)

| Tool | Type | Cost | Integration | Setup |
|------|------|------|---|---|
| **Stripe Dashboard** | Native | $0 (included) | Stripe billing | Real-time |
| **Google Analytics 4** | SaaS | Free (limited) | Web/mobile | 2 hours (but not COPPA-safe) |
| **Mixpanel** | SaaS | $999+/mo | Custom events | 3-4 hours |
| **Amplitude** | SaaS | $995+/mo | Custom events | 3-4 hours |
| **Custom (Python + SQL)** | DIY | $0 | Your data | 4-6 hours |

**Recommended**: **Custom SQL dashboards** (you own the data) + **Stripe billing API** (revenue source of truth)

### B3. Observability / APM

| Tool | Type | Cost | Tracing | Logs | Setup |
|------|------|------|---------|------|---|
| **Sentry** | SaaS | Free (limited) / $29+/mo | ❌ No | ❌ No | 1 hour |
| **Datadog** | SaaS | $15-50/host/mo | ✅ Yes | ✅ Yes | 3-4 hours |
| **New Relic** | SaaS | Free (100GB) / $0.40+/GB | ✅ Yes | ✅ Yes | 3-4 hours |
| **Prometheus + Grafana** | OSS | $0 | ⚠️ Manual | ⚠️ Manual | 4-6 hours |
| **SigNoz** | OSS + SaaS | $0 (OSS) / $149+/mo (SaaS) | ✅ Yes | ✅ Yes | 3-4 hours |

**Recommended**: **Prometheus/Grafana (OSS)** for metrics + **Sentry (free tier)** for errors

---

## PART C: EVENT TRACKING TAXONOMY (COPPA-SAFE)

### C1. Core Event Schema

Every event should have:

```json
{
  "event_name": "game_started",
  "timestamp": "2026-03-14T10:15:32Z",
  "session_id": "sess_abc123",
  
  // NO user identifying info
  // NO email, phone, name, IP address
  // NO cookies or persistent tracking
  
  // Safe properties (aggregate)
  "game_id": "gm_shapes_pop",
  "child_profile_id": "prf_hashed_12345",  // Hashed, not real ID
  "age_group": "5-7",  // Age range, not birth date
  "device_type": "mobile",
  
  // Learning-specific
  "difficulty_level": "easy",
  "time_spent_seconds": 240,
  "completion_status": "completed",
  "score": 850,
}
```

### C2. Event Categories

**Learning Events** (what we track):
- `game_started` — Child opened a game
- `game_completed` — Child finished game
- `puzzle_solved` — Solved individual puzzle
- `level_passed` — Reached next difficulty
- `streak_maintained` — Consecutive day play
- `skill_unlocked` — Learned new skill

**Engagement Events**:
- `session_started` — App opened
- `session_ended` — App closed
- `feature_explored` — Used feature
- `achievement_earned` — Milestone hit
- `reward_claimed` — Used progress reward

**Parent Events** (AUDIT):
- `consent_created` — Parent gave consent
- `consent_verified` — Email/card verified
- `consent_withdrawn` — Parent revoked
- `data_exported` — Parent downloaded data
- `profile_deleted` — Child profile deleted
- `progress_viewed` — Parent viewed child progress

**Error Events** (observability):
- `error_occurred` — App error
- `api_timeout` — Network issue
- `sync_failed` — Data sync failure

### C3. WHAT NOT TO TRACK

❌ **Never track**:
- Child's email address
- Child's real name
- Parent's email
- Parent's payment method
- IP address
- Device ID (IDFA, Android Advertising ID)
- Biometric data (faces, voice recordings)
- Geolocation
- Search queries
- Text input (free-form user input)
- Browsing history

✅ **Safe to track**:
- Hashed identifiers (if necessary for your logic)
- Aggregate counts ("100 kids played Shape Pop")
- Anonymized cohort data
- Game scores (no personal context)
- Session duration
- Error messages (generic)

---

## PART D: IMPLEMENTATION (PRODUCT ANALYTICS)

### D1. PostHog Setup (Open-Source)

**Why PostHog?**:
- ✅ Built for COPPA compliance (no tracking pixels, no third-party data sharing)
- ✅ Open-source → full data ownership
- ✅ Product analytics + session replay + feature flags
- ✅ Easy event tracking
- ✅ Cohort analysis (without PII)
- ✅ $0 to deploy

**Installation**:

```bash
# 1. Add PostHog SDK to frontend
cd src/frontend
npm install posthog-js

# 2. Initialize in main.tsx
import { useEffect } from 'react'
import { usePostHog } from 'posthog-js/react'

function App() {
  const posthog = usePostHog()
  
  useEffect(() => {
    // Initialize PostHog with COPPA settings
    if (posthog) {
      // Do NOT track IP address or cookie data
      posthog.identify('anon_user_123', {
        age_group: '5-7',  // NOT birthdate
        // NO email, name, or contact info
      })
    }
  }, [posthog])
  
  return <div>...</div>
}

export default App
```

**Track events in components**:

```typescript
// src/pages/GameView.tsx
import { usePostHog } from 'posthog-js/react'

export function GameView({ gameId, childProfileId }) {
  const posthog = usePostHog()
  
  useEffect(() => {
    // Track game start
    posthog?.capture('game_started', {
      game_id: gameId,
      child_profile_id: 'hashed_' + hashId(childProfileId),  // Never send real ID
      device_type: 'mobile',
      // NO PII
    })
  }, [gameId])
  
  const handleGameComplete = (score) => {
    posthog?.capture('game_completed', {
      game_id: gameId,
      score: score,
      time_spent_seconds: duration,
      completion_status: 'completed',
      // NO PII
    })
  }
  
  return <div>Play game...</div>
}
```

**Backend event tracking**:

```python
# src/backend/app/api/v1/endpoints/games.py
from posthog import Posthog

posthog = Posthog(api_key="YOUR_POSTHOG_KEY", host="http://posthog:8000")

@app.post("/games/{game_id}/complete")
async def complete_game(game_id: str, score: int, db: AsyncSession):
    # Capture backend event
    posthog.capture(
        distinct_id=f"anon_{request.client.host}",  # Anonymized
        event="game_completed_backend",
        properties={
            "game_id": game_id,
            "score": score,
            "backend": True,
        }
    )
    
    # Save to database
    ...
```

### D2. Event Dashboard Example

**Goal**: Answer "Is learning happening?"

```sql
-- Daily active users playing games
SELECT 
  DATE(timestamp) AS date,
  COUNT(DISTINCT session_id) AS daily_active_users,
  COUNT(*) AS total_game_sessions
FROM posthog_events
WHERE event = 'game_started'
GROUP BY DATE(timestamp)
ORDER BY date DESC

-- Learning outcomes by game
SELECT
  game_id,
  COUNT(*) AS games_started,
  COUNT(CASE WHEN completion_status = 'completed' THEN 1 END) AS completed,
  ROUND(100.0 * COUNT(CASE WHEN completion_status = 'completed' THEN 1 END) / COUNT(*), 2) AS completion_rate,
  ROUND(AVG(score), 0) AS avg_score
FROM posthog_events
WHERE event = 'game_completed'
GROUP BY game_id
ORDER BY completion_rate DESC

-- Cohort retention (7-day cohort analysis)
SELECT
  cohort_date,
  COUNT(DISTINCT session_id) AS cohort_size,
  COUNT(CASE WHEN days_since_first_session <= 7 THEN 1 END) AS returned_day_7,
  ROUND(100.0 * COUNT(CASE WHEN days_since_first_session <= 7 THEN 1 END) / COUNT(DISTINCT session_id), 2) AS retention_7d
FROM (
  SELECT
    DATE(MIN(timestamp)) OVER (PARTITION BY session_id) AS cohort_date,
    DATE_DIFF(day, DATE(MIN(timestamp)) OVER (PARTITION BY session_id), DATE(timestamp)) AS days_since_first_session,
    session_id
  FROM posthog_events
  WHERE event IN ('game_started', 'game_completed')
)
GROUP BY cohort_date
ORDER BY cohort_date DESC
```

---

## PART E: OBSERVABILITY IMPLEMENTATION

### E1. Prometheus Metrics (Infrastructure)

**What to measure**:

```yaml
# prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'backend'
    static_configs:
      - targets: ['localhost:8001']

  - job_name: 'postgres'
    static_configs:
      - targets: ['localhost:5432']

  - job_name: 'redis'
    static_configs:
      - targets: ['localhost:6379']
```

**Key metrics to track**:

```python
# In FastAPI, expose Prometheus metrics

from prometheus_client import Counter, Histogram, Gauge, generate_latest

# Counter: total requests
request_count = Counter('http_requests_total', 'Total HTTP requests', ['method', 'endpoint'])

# Histogram: request duration
request_duration = Histogram('http_request_duration_seconds', 'HTTP request duration')

# Gauge: current active connections
active_connections = Gauge('db_connections_active', 'Active DB connections')

# In routes:
@app.get("/api/games")
async def get_games():
    request_count.labels(method='GET', endpoint='/api/games').inc()
    
    with request_duration.time():
        # Your code
        games = await db.execute(...)
    
    return games
```

### E2. Grafana Dashboards

Create dashboards to visualize:

**Dashboard 1: API Health**
- Request rate (requests/sec)
- Error rate (% 5xx responses)
- Latency (p50, p95, p99)
- Active connections

**Dashboard 2: Database Performance**
- Query latency (avg, p95)
- Slow queries (>1s)
- Connection pool usage
- Lock contention

**Dashboard 3: Business Metrics**
- Daily active users (from product analytics)
- Games completed (aggregate)
- Error rate by game
- Parent-initiated actions (consents, exports)

---

## PART F: ALERTING STRATEGY

### F1. Alert Rules

```yaml
# alert_rules.yml

groups:
  - name: api_alerts
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.05
        for: 5m
        annotations:
          summary: "Error rate above 5%"
          
      - alert: SlowRequests
        expr: histogram_quantile(0.95, http_request_duration_seconds) > 1
        for: 5m
        annotations:
          summary: "P95 latency above 1 second"
          
      - alert: DatabaseDown
        expr: pg_up == 0
        for: 1m
        annotations:
          summary: "PostgreSQL unreachable"
          
      - alert: HighMemoryUsage
        expr: process_resident_memory_bytes / (1024 * 1024) > 500  # 500MB
        for: 5m
        annotations:
          summary: "Process memory > 500MB"
```

### F2. Alerting Destinations

```bash
# Send alerts to Slack
global:
  slack_api_url: 'https://hooks.slack.com/...'

route:
  receiver: 'devops'
  group_interval: 5m
  group_wait: 10s
  repeat_interval: 1h

receivers:
  - name: 'devops'
    slack_configs:
      - channel: '#devops-incidents'
        title: 'Alert: {{ .GroupLabels.alertname }}'
        text: '{{ range .Alerts }}{{ .Annotations.summary }}\n{{ end }}'
```

---

## PART G: DATA RETENTION & COMPLIANCE

### G1. Retention Policies

| Data Type | Retention | Reason |
|-----------|-----------|--------|
| **Raw events** | 30 days | Cost; aggregate after |
| **Aggregated metrics** | 1 year | Historical trends |
| **Audit logs** | 3-7 years | COPPA/DPDPA requirement |
| **User data** | Until withdrawn | Parent can request delete |
| **Error logs** | 90 days | Debugging |

### G2. Data Deletion (Right to be Forgotten)

When a parent requests data deletion:

```sql
-- Step 1: Identify parent's children
SELECT child_profile_id FROM profiles WHERE parent_id = ?

-- Step 2: Delete events (privacy events only)
DELETE FROM posthog_events 
WHERE child_profile_id = ? 
  AND event IN ('game_started', 'game_completed', ...)

-- Step 3: Anonymize audit logs (keep for compliance, redact PII)
UPDATE audit_logs 
SET parent_id = 'REDACTED', child_id = 'REDACTED'
WHERE parent_id = ?

-- Step 4: Confirm deletion
SELECT COUNT(*) FROM posthog_events WHERE child_profile_id = ?  -- Should be 0
```

---

## PART H: COST & EFFORT SUMMARY

### Cost Projection

| Scenario | Tools | Monthly | Setup Hours |
|----------|-------|---------|---|
| **Minimal (OSS only)** | PostHog (OSS) + Prometheus + Grafana | $5-20 (infra) | 6-8 |
| **SaaS Lean** | PostHog (SaaS) + Sentry free | $450/mo | 4-6 |
| **Full Stack** | PostHog (SaaS) + Datadog + Custom SQL | $200-500/mo | 8-10 |

### Effort by Phase

| Phase | Hours | Priority |
|-------|-------|----------|
| **PostHog setup + event tracking** | 4-6 | P1 |
| **Prometheus/Grafana setup** | 4-6 | P2 |
| **Custom SQL dashboards** | 2-4 | P1 |
| **Alerting rules** | 2-3 | P2 |
| **Audit logging** | 1-2 | P0 |

---

## PART I: RECOMMENDED ROADMAP

### Phase 1: MVP Analytics (Week 1-2)

**Goal**: Track if learning is happening; know if app works

**Implementation**:
```bash
# 1. Set up PostHog (free tier or OSS)
# 2. Track core events: game_started, game_completed
# 3. Create simple dashboard: daily active users, completion rate
# 4. Monitor with Sentry for errors
```

**Cost**: $0 (PostHog OSS + Sentry free)  
**Effort**: 6-8 hours  
**Output**: Can answer "Are kids learning?" and "Where do they get stuck?"

### Phase 2: Observability (Week 3)

**Goal**: Know if the app is healthy

**Implementation**:
```bash
# 1. Install Prometheus + Grafana
# 2. Track API metrics: latency, errors, throughput
# 3. Create Grafana dashboard
# 4. Set up Slack alerts
```

**Cost**: $5-10/month (infra)  
**Effort**: 4-6 hours  
**Output**: Real-time visibility into system health

### Phase 3: Business Analytics (Week 4)

**Goal**: Know if the business works

**Implementation**:
```bash
# 1. Connect Stripe API
# 2. Query: daily revenue, subscription churn, ARPU
# 3. Create SQL dashboards
# 4. Monthly review meetings
```

**Cost**: $0  
**Effort**: 2-4 hours  
**Output**: Data-driven decisions on pricing, retention

---

## PART J: DASHBOARD TEMPLATES

### Parent Analytics Dashboard

```sql
-- What parents see
SELECT
  DATE(timestamp) AS date,
  COUNT(DISTINCT session_id) AS child_active_days,
  COUNT(DISTINCT game_id) AS games_explored,
  ROUND(AVG(score), 0) AS avg_score,
  COUNT(CASE WHEN completion_status = 'completed' THEN 1 END) AS games_completed
FROM posthog_events
WHERE event IN ('game_started', 'game_completed')
  AND child_profile_id = ?  -- Parent's child
GROUP BY DATE(timestamp)
ORDER BY date DESC
LIMIT 30  -- Last 30 days
```

### Admin Dashboard (for Operations)

```sql
-- System health
SELECT
  'api_error_rate' AS metric,
  ROUND(100.0 * COUNT(CASE WHEN status >= 500 THEN 1 END) / COUNT(*), 2) AS percentage
FROM request_logs
WHERE timestamp > NOW() - INTERVAL '1 hour'

UNION ALL

SELECT
  'median_response_time_ms' AS metric,
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY duration_ms) AS value
FROM request_logs
WHERE timestamp > NOW() - INTERVAL '1 hour'

UNION ALL

SELECT
  'db_connections_active' AS metric,
  COUNT(*) AS value
FROM pg_stat_activity
WHERE state = 'active'
```

---

## CONCLUSION

Analytics is how you **learn what's working**. Observability is how you **know when it breaks**. Together, they enable:

1. ✅ Data-driven product decisions
2. ✅ Fast incident detection
3. ✅ Evidence-based improvements
4. ✅ COPPA compliance (audit trail)
5. ✅ Parent transparency (progress reports)

**Your 30-day plan**:
- Week 1: PostHog event tracking (learn)
- Week 2-3: Prometheus/Grafana (observe)
- Week 4: Custom dashboards + alerts (automate)

By launch, you'll know:
- 📊 If kids are learning
- 🚨 If the app broke
- 💰 If the business works
- 📋 Everything for audit

---

## REFERENCES

- PostHog: https://posthog.com/docs
- COPPA Compliance Guide: https://www.ftc.gov/business-guidance/privacy-security/childrens-privacy
- Prometheus: https://prometheus.io/docs/
- Grafana: https://grafana.com/docs/
- Countly (COPPA-ready): https://countly.com/

**Last Updated**: 2026-03-14  
**Next Review**: 2026-04-14 (post-beta, review analytics ROI)
