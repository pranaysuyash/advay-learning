# Initiative 4: Backend Infrastructure — Research & Implementation Plan

**Date**: 2026-02-24  
**Status**: RESEARCH COMPLETE  
**Priority**: P1  
**Estimated Effort**: 2-3 weeks (9 story points)  

---

## Executive Summary

**Current State**: Backend exists but lacks production-grade infrastructure:
- No structured logging
- JWT refresh token rotation incomplete
- Error handling is basic
- No monitoring/alerting
- Missing user-friendly error messages

**Target State**:
- JSON structured logging for all API calls
- Secure refresh token rotation (one-time use)
- Custom exception hierarchy with user-facing messages
- Toast-based error display on frontend
- Real-time monitoring and alerts

**Key dependencies**: None (can run in parallel with other initiatives)

---

## Part 1: Logging Infrastructure

### Current State Assessment

**Problem**: Backend logs are unstructured.
```
// Current
console.log('User logged in');
console.error('Database error: TypeError: Cannot read property...');
```

**Result**: Hard to parse, debug, or analyze.

### Target: Structured JSON Logging

**Pattern**:
```json
{
  "timestamp": "2026-02-24T14:32:00.123Z",
  "level": "info",
  "service": "learning_api",
  "endpoint": "POST /api/games/emoji_match/score",
  "userId": "user_12345",
  "method": "POST",
  "path": "/api/games/emoji_match/score",
  "statusCode": 200,
  "duration": 145,
  "payload": {
    "gameId": "emoji_match",
    "score": 85,
    "time": 45000
  },
  "context": {
    "sessionId": "sess_xyz",
    "childId": "child_456",
    "environment": "production"
  }
}
```

### Implementation: Winston Logger

**File**: `src/backend/src/logger.ts` (new)

```typescript
import winston from 'winston';

const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'learning_api' },
  transports: [
    // Console (development)
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
    // File (combined)
    new winston.transports.File({ 
      filename: 'logs/combined.log',
      maxsize: 10485760, // 10MB
      maxFiles: 10,
    }),
    // File (errors only)
    new winston.transports.File({ 
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 10485760,
      maxFiles: 5,
    }),
  ],
});

export default logger;
```

### API Middleware Logging

**File**: `src/backend/src/middleware/requestLogger.ts` (new)

```typescript
export const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  // Log request
  logger.info({
    level: 'info',
    action: 'request_received',
    method: req.method,
    path: req.path,
    endpoint: `${req.method} ${req.path}`,
    userId: req.user?.id,
    childId: req.body?.childId,
    context: {
      sessionId: req.sessionID,
      userAgent: req.headers['user-agent'],
    },
  });
  
  // Capture response
  res.on('finish', () => {
    const duration = Date.now() - start;
    
    logger.info({
      level: 'info',
      action: 'request_completed',
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration,
      endpoint: `${req.method} ${req.path}`,
      userId: req.user?.id,
    });
  });
  
  next();
};
```

### Usage in Routes

```typescript
// In app.ts
app.use(requestLogger);

// In game routes
app.post('/api/games/emoji_match/score', async (req, res) => {
  logger.debug({
    action: 'score_submission',
    gameId: 'emoji_match',
    payload: req.body,
  });
  
  // ... game logic
  
  logger.info({
    action: 'score_recorded',
    gameId: 'emoji_match',
    score: req.body.score,
  });
});
```

---

## Part 2: JWT Refresh Token Rotation

### Current State

**Problem**: Tokens can be reused, increasing security risk.

### Target: One-Time Use Tokens

**Flow**:
```
1. User logs in
2. Backend returns: access_token (short-lived, 15min) + refresh_token (long-lived, 7 days)

3. User session continues...
4. Access token expires
5. Frontend sends refresh_token to /api/auth/refresh
6. Backend verifies refresh_token, marks as USED, returns NEW pair:
   - New access_token
   - New refresh_token
   - Old refresh_token is now invalid

7. If old refresh_token is replayed:
   - Endpoint detects reuse
   - Invalidates ALL tokens for that session
   - User forced to re-login (possible account compromise)
```

### Implementation

**File**: `src/backend/src/auth/tokenManager.ts` (new)

```typescript
interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

interface RefreshTokenRecord {
  token: string;
  userId: string;
  sessionId: string;
  usedAt?: number;
  isUsed: boolean;
  isRotated: boolean;
  createdAt: number;
}

export class TokenManager {
  async generateTokenPair(userId: string, sessionId: string): Promise<TokenPair> {
    const accessToken = jwt.sign(
      { userId, type: 'access' },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );
    
    const refreshToken = jwt.sign(
      { userId, sessionId, type: 'refresh' },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );
    
    // Store refresh token in DB
    await RefreshTokenDB.create({
      token: hashToken(refreshToken),
      userId,
      sessionId,
      isUsed: false,
      isRotated: false,
      createdAt: Date.now(),
    });
    
    return {
      accessToken,
      refreshToken,
      expiresAt: Date.now() + 15 * 60 * 1000,
    };
  }
  
  async rotateRefreshToken(oldRefreshToken: string): Promise<TokenPair> {
    // Verify old token validity
    const decoded = jwt.verify(oldRefreshToken, process.env.JWT_REFRESH_SECRET);
    
    // Check if already used
    const record = await RefreshTokenDB.findOne({
      token: hashToken(oldRefreshToken),
    });
    
    if (record.isUsed) {
      // Token reuse detected! Possible attack
      logger.warn({
        action: 'refresh_token_reuse_detected',
        userId: decoded.userId,
        sessionId: decoded.sessionId,
      });
      
      // Invalidate all tokens for this session
      await RefreshTokenDB.updateMany(
        { sessionId: decoded.sessionId },
        { isUsed: true, revokedAt: Date.now() }
      );
      
      throw new Error('Session compromised. Please re-login.');
    }
    
    // Mark old token as used
    await RefreshTokenDB.updateOne(
      { token: hashToken(oldRefreshToken) },
      { isUsed: true, usedAt: Date.now(), isRotated: true }
    );
    
    // Generate new pair
    const newPair = await this.generateTokenPair(
      decoded.userId,
      decoded.sessionId
    );
    
    logger.info({
      action: 'refresh_token_rotated',
      userId: decoded.userId,
      sessionId: decoded.sessionId,
    });
    
    return newPair;
  }
}
```

### Frontend Integration

**File**: `src/frontend/src/utils/api.ts` (modify existing)

```typescript
export const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
});

// Intercept 401 Unauthorized
apiClient.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) {
      // Token expired, try refresh
      const refreshToken = localStorage.getItem('refreshToken');
      
      try {
        const newTokens = await axios.post(
          `${process.env.REACT_APP_API_URL}/api/auth/refresh`,
          { refreshToken }
        );
        
        // Store new tokens
        localStorage.setItem('accessToken', newTokens.data.accessToken);
        localStorage.setItem('refreshToken', newTokens.data.refreshToken);
        
        // Retry original request
        error.config.headers.Authorization = `Bearer ${newTokens.data.accessToken}`;
        return apiClient(error.config);
      } catch (refreshError) {
        // Refresh failed, clear and redirect to login
        localStorage.clear();
        window.location.href = '/login';
        throw refreshError;
      }
    }
    
    throw error;
  }
);
```

---

## Part 3: Custom Exception Handling

### Exception Hierarchy

**File**: `src/backend/src/exceptions/index.ts` (new)

```typescript
export class AppException extends Error {
  constructor(
    public statusCode: number,
    public userMessage: string,
    public internalMessage: string,
    public errorCode: string
  ) {
    super(internalMessage);
  }
}

export class ValidationException extends AppException {
  constructor(message: string, errorCode = 'VALIDATION_ERROR') {
    super(400, 'Please check your input', message, errorCode);
  }
}

export class UnauthorizedException extends AppException {
  constructor(message = 'You are not logged in') {
    super(401, message, 'Authentication failed', 'UNAUTHORIZED');
  }
}

export class NotFoundException extends AppException {
  constructor(resource: string) {
    super(404, `${resource} not found`, `${resource} does not exist`, 'NOT_FOUND');
  }
}

export class ConflictException extends AppException {
  constructor(message: string) {
    super(409, message, message, 'CONFLICT');
  }
}

export class RateLimitException extends AppException {
  constructor() {
    super(
      429,
      'Too many requests. Please wait before trying again.',
      'Rate limit exceeded',
      'RATE_LIMIT_EXCEEDED'
    );
  }
}

export class DatabaseException extends AppException {
  constructor(message: string) {
    super(
      500,
      'Something went wrong. Please try again later.',
      `Database error: ${message}`,
      'DATABASE_ERROR'
    );
  }
}

export class InternalServerException extends AppException {
  constructor(message: string) {
    super(
      500,
      'Something went wrong. Please try again later.',
      message,
      'INTERNAL_ERROR'
    );
  }
}
```

### Global Error Handler

**File**: `src/backend/src/middleware/errorHandler.ts` (new)

```typescript
export const errorHandler = (err, req, res, next) => {
  let exception: AppException;
  
  if (err instanceof AppException) {
    exception = err;
  } else if (err.name === 'ValidationError') {
    exception = new ValidationException(err.message);
  } else if (err.code === 'ENOENT') {
    exception = new NotFoundException('Resource');
  } else {
    exception = new InternalServerException(err.message);
  }
  
  // Log the error
  logger.error({
    action: 'error_occurred',
    statusCode: exception.statusCode,
    errorCode: exception.errorCode,
    internalMessage: exception.internalMessage,
    stack: err.stack,
  });
  
  // Send response
  res.status(exception.statusCode).json({
    error: {
      code: exception.errorCode,
      message: exception.userMessage,
    },
  });
};
```

### Frontend Error Display

**File**: `src/frontend/src/hooks/useApiError.ts` (new)

```typescript
export const useApiError = () => {
  const [error, setError] = useState<APIError | null>(null);
  
  const handleError = (err: any) => {
    const message = err.response?.data?.error?.message || 
                    'Something went wrong. Please try again.';
    
    setError({
      code: err.response?.data?.error?.code,
      message,
      timestamp: Date.now(),
    });
    
    // Auto-dismiss after 5 seconds
    setTimeout(() => setError(null), 5000);
  };
  
  return { error, setError, handleError };
};

// Usage in component
export function GameComponent() {
  const { error, handleError } = useApiError();
  
  const submitScore = async () => {
    try {
      await apiClient.post('/api/games/score', scoreData);
    } catch (err) {
      handleError(err); // Shows toast automatically
    }
  };
  
  return (
    <>
      {error && <ErrorToast message={error.message} />}
      {/* Rest of component */}
    </>
  );
}
```

---

## Part 4: Monitoring & Alerting

### Metrics Collection

**File**: `src/backend/src/monitoring/metrics.ts` (new)

```typescript
interface Metrics {
  requestCount: number;
  errorCount: number;
  avgResponseTime: number;
  p95ResponseTime: number;
  activeUsers: number;
}

export class MetricsCollector {
  private startTime = Date.now();
  private requests: Array<{ duration: number; statusCode: number }> = [];
  
  recordRequest(statusCode: number, duration: number) {
    this.requests.push({ statusCode, duration });
  }
  
  getMetrics(): Metrics {
    const errors = this.requests.filter(r => r.statusCode >= 400).length;
    const durations = this.requests.map(r => r.duration).sort((a, b) => a - b);
    
    return {
      requestCount: this.requests.length,
      errorCount: errors,
      avgResponseTime: 
        durations.reduce((a, b) => a + b, 0) / durations.length,
      p95ResponseTime: 
        durations[Math.floor(durations.length * 0.95)],
      activeUsers: this.calculateActiveUsers(),
    };
  }
  
  private calculateActiveUsers() {
    // Count unique users in last 5 minutes
    return new Set(
      this.requests
        .filter(r => r.timestamp > Date.now() - 5 * 60 * 1000)
        .map(r => r.userId)
    ).size;
  }
}
```

### Real-Time Alerts

**File**: `src/backend/src/monitoring/alerting.ts` (new)

```typescript
interface Alert {
  level: 'warning' | 'critical';
  title: string;
  message: string;
  timestamp: number;
}

export class AlertManager {
  async checkAndAlert(metrics: Metrics) {
    const alerts: Alert[] = [];
    
    // Alert: High error rate
    const errorRate = metrics.errorCount / metrics.requestCount;
    if (errorRate > 0.05) {
      alerts.push({
        level: 'critical',
        title: 'High Error Rate',
        message: `${(errorRate * 100).toFixed(1)}% of requests failing`,
        timestamp: Date.now(),
      });
      await notifyOncall(alerts[alerts.length - 1]);
    }
    
    // Alert: Slow response time
    if (metrics.p95ResponseTime > 2000) {
      alerts.push({
        level: 'warning',
        title: 'Slow Response Time',
        message: `95th percentile: ${metrics.p95ResponseTime}ms`,
        timestamp: Date.now(),
      });
    }
    
    // Alert: Database down (no requests in 30s)
    // (Would check MongoDB connection)
    
    return alerts;
  }
  
  private async notifyOncall(alert: Alert) {
    // Send to Slack, PagerDuty, email, etc.
    await fetch('https://hooks.slack.com/...', {
      method: 'POST',
      body: JSON.stringify({
        text: `🚨 ${alert.title}: ${alert.message}`,
      }),
    });
  }
}
```

---

## Part 5: Implementation Phases

### Phase 1: Logging Foundation (Days 1-5)

**Goal**: Structured logging working for all API calls

**Tasks**:
1. Install Winston logger
2. Create logger.ts with configuration
3. Create requestLogger middleware
4. Add logging to all existing routes
5. Test log output (JSON format verification)

**Acceptance**:
- [ ] All API requests logged in JSON format
- [ ] Logs include timestamp, method, path, status
- [ ] No console.log in production code
- [ ] Log rotation working (10MB max)

### Phase 2: JWT Refresh Token Rotation (Days 6-10)

**Goal**: Secure token rotation prevents token reuse

**Tasks**:
1. Create TokenManager class
2. Create RefreshTokenDB schema
3. Implement refresh endpoint
4. Update login to use TokenManager
5. Update frontend API client for auto-refresh
6. Test token rotation with curl/Postman

**Acceptance**:
- [ ] Refresh token one-time use enforced
- [ ] Token reuse detected + session invalidated
- [ ] Frontend auto-retries with new token
- [ ] No token leakage in logs

### Phase 3: Custom Exceptions (Days 11-15)

**Goal**: Consistent error responses with user-friendly messages

**Tasks**:
1. Create exception hierarchy
2. Add global error handler middleware
3. Update all routes to throw AppException
4. Update frontend to handle error codes
5. Add ErrorToast component for UI display
6. Test error scenarios (validation, auth, not found, server error)

**Acceptance**:
- [ ] All error responses follow format
- [ ] User sees friendly message (not stacktrace)
- [ ] Internal errors logged (not exposed)
- [ ] Frontend shows toast on error

### Phase 4: Monitoring Setup (Days 16-20)

**Goal**: Metrics collected, alerts configured

**Tasks**:
1. Create MetricsCollector class
2. Integrate metrics into requestLogger
3. Create /api/health endpoint
4. Create /api/metrics endpoint (admin only)
5. Setup Slack alerting
6. Create monitoring dashboard (basic)

**Acceptance**:
- [ ] Metrics collected and exposed
- [ ] Anomalies trigger alerts
- [ ] Dashboard shows key metrics
- [ ] Oncall notification working

### Phase 5: Documentation & Runbook (Days 21-25)

**Goal**: Engineering team can operate the backend

**Tasks**:
1. Document logging format
2. Create log analysis guide
3. Document token rotation flow
4. Create runbook for common errors
5. Document monitoring dashboard
6. Train team on troubleshooting

**Acceptance**:
- [ ] Documentation complete
- [ ] Team can read logs effectively
- [ ] Team can troubleshoot common issues
- [ ] No gaps in coverage

---

## Part 6: Files Created/Modified

**New files** (10):
- `src/backend/src/logger.ts`
- `src/backend/src/middleware/requestLogger.ts`
- `src/backend/src/auth/tokenManager.ts`
- `src/backend/src/exceptions/index.ts`
- `src/backend/src/middleware/errorHandler.ts`
- `src/backend/src/monitoring/metrics.ts`
- `src/backend/src/monitoring/alerting.ts`
- `src/backend/src/db/refreshTokens.ts`
- Tests for all new modules
- Documentation (`docs/BACKEND_INFRASTRUCTURE.md`)

**Modified files** (~15):
- `src/backend/src/app.ts` (add middleware)
- All route files (use AppException)
- `src/frontend/src/utils/api.ts` (auto-refresh logic)
- All game endpoints (error handling)

---

## Part 7: Success Criteria

| Criterion | Target | Measurement |
|-----------|--------|-------------|
| Logging coverage | 100% of endpoints | Log audit of requests |
| Token rotation | One-time use enforced | Security audit, reuse test |
| Error consistency | All errors use format | Response validation test |
| Monitoring latency | <1s alert delay | Alert triggered, checked time |
| MTTR improvement | 50% faster resolution | Dashboard availability spike |
| Documentation | Complete runbook | Team capability test |

---

## Part 8: Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| Token rotation adds latency | Profile first; optimize JWT signing if needed |
| Log volume balloons | Use log level filtering; archive old logs |
| Monitoring adds overhead | Sample metrics (1% of requests) if needed |
| Alert fatigue | Tuned thresholds from baseline metrics |
| Database unavailable | Health check endpoint; graceful degradation |
| Oncall notification failure | Test notifications weekly |

---

## Conclusion

**This is the "reliability" initiative**: When the backend fails, we catch it, log it, alert on it, and recover quickly.

**Success = Downtime drops from hours to minutes; team resolves issues before customers notice.**

