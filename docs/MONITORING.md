# Monitoring & Health Checks

## Health Endpoints

### Backend Health
- **URL**: `GET /health`
- **Response**: 
```json
{
  "status": "healthy",
  "timestamp": "2026-02-19T12:00:00Z",
  "checks": {
    "database": "connected",
    "redis": "connected"
  }
}
```

### Liveness Probe
- **URL**: `GET /health/live`
- **Purpose**: Kubernetes liveness probe
- **Response**: `{"status": "ok"}`

### Readiness Probe
- **URL**: `GET /health/ready`
- **Purpose**: Kubernetes readiness probe
- **Response**: Checks if DB and Redis are reachable

## Docker Health Checks

```yaml
# docker-compose.yml
services:
  backend:
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8001/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

## Recommended Monitoring Stack

| Tool | Purpose | Setup |
|------|---------|-------|
| Prometheus | Metrics collection | Deploy alongside app |
| Grafana | Visualization | Import our dashboard |
| AlertManager | Alerting | Configure Slack/Email |

## Key Metrics to Monitor

### Application Metrics
- Request latency (p50, p95, p99)
- Request rate by endpoint
- Error rate
- Active connections

### Database Metrics
- Query latency
- Connection pool usage
- Deadlocks

### System Metrics
- CPU usage
- Memory usage
- Disk I/O
- Network traffic

## Alerting Rules

| Alert | Condition | Severity |
|-------|-----------|----------|
| HighErrorRate | error_rate > 5% for 5m | critical |
| HighLatency | p95_latency > 2s for 5m | warning |
| DatabaseDown | health check fails | critical |
| HighMemory | memory > 90% for 5m | warning |

## Logs

### Structured Log Format
```json
{
  "timestamp": "2026-02-19T12:00:00.000Z",
  "level": "info",
  "message": "User logged in",
  "user_id": "abc123",
  "ip": "192.168.1.1"
}
```

### Log Aggregation
- Use Docker logging driver to ship logs
- Recommended: CloudWatch, DataDog, or Loki

## Runbook

### High CPU Usage
1. Check `/metrics` endpoint for request spikes
2. Review slow queries in database
3. Check for runaway processes

### Database Connection Errors
1. Check database health: `pg_isready`
2. Review connection pool settings
3. Check for long-running queries

### 502/503 Errors
1. Check backend is running: `docker ps`
2. Review backend logs
3. Check health endpoint

## Dashboard JSON

Import this Grafana dashboard for quick setup:
(Dashboard JSON would be in `docs/dashboards/grafana-dashboard.json`)
