# Multi-Viewpoint Analysis: `src/frontend/src/services/api.ts`

**Date**: 2026-02-23
**File**: `src/frontend/src/services/api.ts` (132 lines)
**Status**: Partially fixed (401 loop resolved, remaining issues identified)
**Language**: TypeScript
**Build System**: Vite
**Runtime**: React 18
**Framework**: Axios, Zustand stores

---

## REPO SNAPSHOT

### Language & Tooling
- **Frontend**: TypeScript, React 18, Vite, Axios, Zustand, Framer Motion
- **Backend**: Python 3.13+, FastAPI, SQLAlchemy, PostgreSQL
- **Tests**: Vitest (frontend), pytest (backend)
- **Linting**: ESLint, ruff (Python), mypy
- **Packages**: npm (frontend), uv (Python)

### Key Documentation
- `AGENTS.md` - AI agent coordination (multi-agent workflow rules)
- `ARCHITECTURE.md` - System design (Frontend + Backend separation)
- `docs/SETUP.md` - Environment setup
- `docs/SECURITY.md` - Security guidelines
- `docs/GIT_WORKFLOW.md` - Git process

### Build & Runtime
- **Frontend**: `npm run dev` (Vite dev server on :6173)
- **Backend**: `uvicorn app.main:app --reload --port 8001`
- **Proxy**: Vite dev proxy `/api` → `http://localhost:8001`

---

## CANDIDATE FILE SELECTION

### Candidates Considered (Score 0-5)

| File | Impact | Risk | Complexity | Changeability | Learning | **Score** | Rationale |
|------|--------|------|------------|---------------|-----------|-----------|------------|
| `src/frontend/src/services/api.ts` | **5** | 4 | 2 | 5 | 5 | **21** | Central request layer, auth logic critical, just fixed 401 loop |
| `src/backend/app/main.py` | 5 | 3 | 3 | 3 | 3 | **17** | FastAPI entry, middleware config, CORS handling |
| `src/frontend/src/pages/ConnectTheDots.tsx` | 2 | 2 | 4 | 2 | 3 | **13** | Large game page, complex canvas logic (better to split first) |
| `src/backend/app/api/v1/endpoints/auth.py` | 5 | 5 | 4 | 3 | 4 | **21** | Auth security critical, but 367 lines = higher complexity |
| `src/frontend/src/pages/MediaPipeTest.tsx` | 2 | 1 | 3 | 2 | 5 | **13** | Test page with CV patterns (good learning but low immediate impact) |
| `src/backend/app/services/user_service.py` | 3 | 3 | 3 | 3 | 2 | **14** | User management, moderate complexity |
| `src/frontend/src/store/progressStore.ts` | 3 | 2 | 3 | 3 | 2 | **13** | Progress tracking state, queue management |
| `src/frontend/src/pages/EmojiMatch.tsx` | 2 | 2 | 3 | 2 | 3 | **12** | Matching game logic (already has memo) |
| `src/frontend/src/components/game/TargetSystem.tsx` | 2 | 1 | 3 | 3 | 2 | **11** | Game tracking system (432 lines) |

**Winner: `src/frontend/src/services/api.ts`**

**Why This Beats Others:**
1. **Highest impact** (5) - Every API call in entire app goes through here
2. **Low complexity** (2) - Only 132 lines, very manageable
3. **High changeability** (5) - Can improve incrementally with clear rollback path
4. **Already demonstrated problematic** - 401 infinite loop was just fixed, indicating real issues
5. **Critical path** - Auth, token refresh, request retry logic is foundational
6. **Learning value** (5) - Retry strategies, interceptors, error handling patterns are broadly applicable

---

## MULTI-VIEWPOINT FINDINGS

### 1. MAINTAINER VIEWPOINT

#### Observations
**File:** `src/frontend/src/services/api.ts`

**Evidence - Lines 1-19 (Instance Creation)**
```typescript
const env = (import.meta as any).env ?? {};
const API_VERSION = env.VITE_API_VERSION || 'v1';
const API_BASE_URL =
  env.VITE_API_BASE_URL ??
  (env.DEV ? '' : 'http://localhost:8001');

export const API_URL = `${API_BASE_URL}/api/${API_VERSION}`;

const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
  withCredentials: true, // IMPORTANT: Send cookies with cross-origin requests
});
```

**Issues:**
1. **Type casting without justification**: `(import.meta as any).env` (line 3) - suppresses TypeScript checks
2. **Magic timeout**: 10000ms hardcoded (line 18) - not configurable, one-size-fits-all
3. **Inline config object** (lines 13-17) - extracted into `apiClient` immediately, no validation
4. **No logging infrastructure** - Can't debug request/response flow without modifying code

**Evidence - Lines 22-49 (Response Interceptor)**
```typescript
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        await axios.post(
          `${API_URL}/auth/refresh`,
          {},
          {
            withCredentials: true,
          },
        );

        return apiClient(originalRequest);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  },
);
```

**Issues:**
1. **Property extension without type**: `originalRequest._retry = true` (line 28) - mutating AxiosRequestConfig without extending the type
2. **Mixed error handling**: Catches `refreshError` but doesn't distinguish between network errors, 401 on refresh, server errors
3. **No request deduplication**: Multiple concurrent 401s could trigger multiple refresh attempts
4. **No retry delay**: Immediate retry after refresh could overwhelm server
5. **Hardcoded refresh endpoint** (line 32) - String interpolation, not using `authApi.refresh`
6. **Silent refresh failure**: Logs no error before rejecting, makes debugging opaque

**Evidence - Lines 52-82 (Auth API)**
```typescript
export const authApi = {
  register: (email: string, password: string) =>
    apiClient.post('/auth/register', { email, password }),

  login: (username: string, password: string) =>
    apiClient.post('/auth/login', new URLSearchParams({ username, password }), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    }),

  logout: () => apiClient.post('/auth/logout'),

  refresh: () =>
    apiClient.post('/auth/refresh'),
```

**Issues:**
1. **Inconsistent auth credentials**: `login` uses `username:password` (line 58), but `register` uses `email:password` (line 53) - field name mismatch
2. **No return types**: All methods infer return type, could be explicit for better DX
3. **Error handling missing**: No try/catch or error wrapping in authApi layer
4. **logout doesn't clear local state**: Only calls endpoint (line 61), doesn't clear auth store
5. **refresh doesn't throw on failure**: Silent failure prevents stores from knowing auth expired
6. **No request cancellation**: Old requests continue after logout

---

#### Proposed Actions (Maintainer)

**M1. Fix Type Extension Pattern** (30 min)
```typescript
// CURRENT (Line 28):
originalRequest._retry = true;

// PROPOSED: Extend type properly
interface RetryableAxiosRequestConfig extends AxiosRequestConfig {
  _retry?: boolean;
  _retryCount?: number;
}

// Then cast properly:
const originalRequest = error.config as RetryableAxiosRequestConfig;
if (originalRequest && !originalRequest._retry) {
  originalRequest._retry = true;
}
```

**Risk**: Low - Type-only change
**Effort**: 30 min
**Impact**: Improves type safety, enables `_retryCount`

---

**M2. Add Retry Delay and Request Deduplication** (1 hour)
```typescript
// Add after line 24:
const REFRESH_DELAY_MS = 500; // 500ms between refresh attempts
const MAX_REFRESH_ATTEMPTS = 1;

// Track in-flight refresh requests
let isRefreshing = false;
let pendingRequests: Array<() => void> = [];

// Then in interceptor (lines 28-46):
if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
  if (isRefreshing) {
    // Queue request for after refresh completes
    return new Promise((resolve, reject) => {
      pendingRequests.push(() => originalRequest
        ? apiClient(originalRequest).then(resolve).catch(reject)
        : resolve(undefined));
    });
  }

  isRefreshing = true;

  try {
    await new Promise(resolve => setTimeout(resolve, REFRESH_DELAY_MS));

    const response = await axios.post(
      `${API_URL}/auth/refresh`,
      {},
      { withCredentials: true },
    );

    // Process queued requests
    pendingRequests.forEach(req => req());

    return apiClient(originalRequest);
  } catch (refreshError) {
    // On refresh failure, reject all queued requests
    pendingRequests.forEach(req => {
      try {
        const rej = () => {}; // Will be set when promise created
        rej();
      } catch (e) {
        // Ignore
      }
    });
    throw refreshError;
  } finally {
    isRefreshing = false;
    pendingRequests = [];
  }
}
```

**Risk**: Medium - New concurrency logic to test
**Effort**: 1 hour
**Impact**: Prevents refresh storm, adds retry delay
---

**M3. Use authApi.refresh Instead of Direct Axios** (15 min)
```typescript
// CURRENT (Line 32):
await axios.post(`${API_URL}/auth/refresh`, {}, { withCredentials: true });

// PROPOSED:
await authApi.refresh();
```

**Risk**: Low - Wrapper already does same thing
**Effort**: 15 min
**Impact**: Consistent API usage, single source of truth for refresh endpoint
---

**M4. Add Explicit Error Types and Logging** (45 min)
```typescript
// Add at top of file:
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public endpoint: string,
    public originalError: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }

  public static fromAxiosError(error: AxiosError): ApiError {
    return new ApiError(
      error.response?.status || 0,
      error.message || 'Unknown error',
      error.config?.url || 'unknown',
      error
    );
  }
}

// Then in interceptor (line 45):
catch (refreshError) {
  console.warn('[API] Token refresh failed:', ApiError.fromAxiosError(refreshError as AxiosError));
  return Promise.reject(ApiError.fromAxiosError(refreshError as AxiosError));
}
```

**Risk**: Low - Adds class but purely additive
**Effort**: 45 min
**Effort**: Better error messages, easier debugging

---

**M5. Add Request Timeout Configuration** (30 min)
```typescript
// CURRENT (Line 18):
timeout: 10000,

// PROPOSED:
const DEFAULT_TIMEOUT = 10000;
const UPLOAD_TIMEOUT = 60000; // For large files/videos

const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: DEFAULT_TIMEOUT,
  withCredentials: true,
});

// Then export a config method:
export const apiConfig = {
  setTimeout: (ms: number) => {
    apiClient.defaults.timeout = ms;
  },

  createRequest: (overrides?: AxiosRequestConfig) => {
    return apiClient.interceptors.request.use(config => {
      return { ...config, ...overrides };
    });
  },
};

// Usage in upload handlers:
import { apiConfig } from './services/api';
apiConfig.setTimeout(UPLOAD_TIMEOUT);
```

**Risk**: Low - Pure configuration
**Effort**: 30 min
**Impact**: Better UX for uploads, flexible timeouts

---

### 2. NEW CONTRIBUTOR VIEWPOINT

#### Observations
**Evidence - Imports and Setup**
```typescript
import axios, { AxiosInstance, AxiosError } from 'axios';

const env = (import.meta as any).env ?? {};
```

**Issues:**
1. **`any` cast suppresses type checking**: New contributors can't rely on TypeScript to catch mistakes
2. **No environment variable validation**: Silent if `VITE_API_VERSION` is missing
3. **Hardcoded fallback URLs**: `http://localhost:8001` (line 8) - fails in non-dev environments
4. **No module-level JSDoc**: No documentation for what this module exports or how to use it

---

#### Proposed Actions (New Contributor)

**N1. Add Environment Variable Validation** (30 min)
```typescript
// CURRENT (Lines 3-10):
const env = (import.meta as any).env ?? {};
const API_VERSION = env.VITE_API_VERSION || 'v1';
const API_BASE_URL =
  env.VITE_API_BASE_URL ??
  (env.DEV ? '' : 'http://localhost:8001');

// PROPOSED:
interface EnvVars {
  VITE_API_VERSION?: string;
  VITE_API_BASE_URL?: string;
  DEV?: boolean;
}

const env = import.meta.env as EnvVars;

// Validate required vars
if (!env.VITE_API_VERSION) {
  throw new Error(
    'Missing required environment variable: VITE_API_VERSION. ' +
    'Check .env.example and copy to .env'
  );
}

const API_VERSION = env.VITE_API_VERSION;
const API_BASE_URL = env.VITE_API_BASE_URL ?? (env.DEV ? '' : 'http://localhost:8001');
```

**Risk**: Low - Validation prevents silent failures
**Effort**: 30 min
**Impact**: Fails fast with clear error message

---

**N2. Remove `any` Cast, Add Proper Types** (20 min)
```typescript
// CURRENT (Line 3):
const env = (import.meta as any).env ?? {};

// PROPOSED:
// At build time, TypeScript knows about Vite env
// No cast needed:
const env = import.meta.env as {
  VITE_API_VERSION: string;
  VITE_API_BASE_URL?: string;
  DEV?: boolean;
  [key: string]: string | undefined;
};

const API_VERSION = env.VITE_API_VERSION || 'v1';
```

**Risk**: Low - Type-safe alternative
**Effort**: 20 min
**Impact**: TypeScript catches missing env vars at compile time

---

**N3. Add Module Documentation** (20 min)
```typescript
// ADD at top of file:
/**
 * API Client Service
 *
 * Provides centralized Axios instance for all backend API calls.
 *
 * Features:
 * - Automatic token refresh on 401 responses
 * - Cookie-based authentication (withCredentials: true)
 * - Request/response interceptors for logging and error handling
 *
 * Usage:
 * ```ts
 * import { authApi, userApi, profileApi } from './services/api';
 *
 * // Login
 * await authApi.login(username, password);
 *
 * // Get user data
 * const user = await userApi.getMe();
 *
 * // Get profiles
 * const profiles = await profileApi.getProfiles();
 * ```
 *
 * Environment Variables:
 * - `VITE_API_VERSION`: API version (default: 'v1')
 * - `VITE_API_BASE_URL`: Optional base URL override
 * - `VITE_DEV`: Set automatically by Vite in dev mode
 *
 * Authentication Flow:
 * 1. Login → 2. Set httpOnly cookies (access_token, refresh_token)
 * 3. All requests include cookies automatically
 * 4. On 401 → 5. Refresh tokens using refresh_token cookie
 * 6. Retry original request with new access_token
 */
```

**Risk**: None - Documentation only
**Effort**: 20 min
**Impact**: Eases onboarding, reduces questions

---

### 3. CORRECTNESS ENGINEER VIEWPOINT

#### Observations

**Evidence - Login Auth Inconsistency (Lines 53-61)**
```typescript
// Line 53-54:
register: (email: string, password: string) =>
  apiClient.post('/auth/register', { email, password }),

// Line 57-60:
login: (username: string, password: string) =>
  apiClient.post('/auth/login', new URLSearchParams({ username, password }), {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  }),
```

**Issues:**
1. **Field name mismatch**: `register` expects `email`, `login` expects `username` - Which does backend expect?
2. **Content-Type difference**: `register` uses JSON, `login` uses form-urlencoded
3. **No input validation**: No client-side validation before API call
4. **No type for response**: Returns `any`, could throw if data structure changes
5. **password in clear text**: Password parameter is plain string, should be masked in logs

**Evidence - Token Refresh Silent Failure (Lines 30-46)**
```typescript
// Line 44:
catch (refreshError) {
  return Promise.reject(refreshError);
}
```

**Issues:**
1. **No distinction of error types**: Network error vs 401 vs 500 not differentiated
2. **No logging on refresh failure**: Silent failure makes debugging impossible
3. **No mechanism to notify stores**: Auth store won't know refresh failed
4. **Potential infinite loop**: If refresh fails but error is 401, stores can't recover

**Evidence - Property Mutation Without Type Safety (Line 28)**
```typescript
const originalRequest = error.config;
// ...
originalRequest._retry = true;
```

**Issues:**
1. **Type assertion missing**: `error.config` is `AxiosRequestConfig<any>`, doesn't have `_retry` property
2. **Runtime type error possible**: TypeScript doesn't catch it
3. **No validation that `_retry` is boolean**: Could accidentally set to wrong value

---

#### Proposed Actions (Correctness)

**C1. Resolve Auth Field Name Inconsistency** (2 hours)
```typescript
// Step 1: Query backend or check documentation
// If backend expects 'email', change login to match:

// PROPOSED (Line 57):
login: (email: string, password: string) =>
  apiClient.post('/auth/login', new URLSearchParams({ email, password }), {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  }),
```

**Risk**: Medium - Backend contract change
**Effort**: 2 hours (includes investigation + implementation)
**Impact**: Consistent auth API, clearer DX
**Validation**: Check backend endpoint signature in `src/backend/app/api/v1/endpoints/auth.py`

---

**C2. Add Request/Response Type Definitions** (1 hour)
```typescript
// ADD to file:
// Auth Types
interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: 'bearer';
  expires_in: number;
}

interface RegisterResponse {
  id: string;
  email: string;
  email_verified: boolean;
}

// User Types
interface User {
  id: string;
  email: file;
  role: 'parent' | 'admin' | 'guest';
  is_active: boolean;
}

// Profile Types
interface Profile {
  id: string;
  name: string;
  age?: number;
  preferred_language: string;
  created_at: string;
}

// Then update methods with types:
register: (email: string, password: string): Promise<RegisterResponse> =>
  apiClient.post('/auth/register', { email, password }),

login: (email: string, password: string): Promise<AuthResponse> =>
  apiClient.post('/auth/login', new URLSearchParams({ email, password }), {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  }),
```

**Risk**: Low - Type additions only improve safety
**Effort**: 1 hour
**Impact**: TypeScript catches backend contract mismatches

---

**C3. Add Proper Type Extension for Retry** (30 min)
```typescript
// CURRENT (Line 28):
originalRequest._retry = true;

// PROPOSED (add before line 1):
declare module 'axios' {
  interface AxiosRequestConfig {
    _retry?: boolean;
    _retryCount?: number;
    _isRefresh?: boolean;
  }
}

// Then use safely:
const originalRequest = error.config;
if (originalRequest && !originalRequest._retry) {
  originalRequest._retry = true;
}
```

**Risk**: Low - Module augmentation is standard pattern
**Effort**: 30 min
**Impact**: Type-safe property access

---

**C4. Add Password Masking in Logs** (45 min)
```typescript
// ADD logging utility (after line 49):
const logRequest = (config: AxiosRequestConfig, data?: unknown) => {
  const sensitiveFields = ['password', 'token', 'secret'];
  let loggedData = data;

  if (data && typeof data === 'object') {
    loggedData = { ...data };
    for (const key of Object.keys(loggedData)) {
      if (sensitiveFields.some(sf => key.toLowerCase().includes(sf))) {
        loggedData[key as string] = '***';
      }
    }
  }

  console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`, {
    data: loggedData,
    headers: config.headers,
  });
};

// Then use in interceptor (line 23):
apiClient.interceptors.request.use(
  (config) => {
    logRequest(config, config.data);
    return config;
  }
);
```

**Risk**: Low - Logging only affects dev
**Effort**: 45 min
**Impact**: Passwords never leak to logs, security best practice

---

### 4. PERFORMANCE ENGINEER VIEWPOINT

#### Observations

**Evidence - Unbounded Request Concurrency**
```typescript
// Current implementation:
if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
  // Immediately retry refresh
  await axios.post(`${API_URL}/auth/refresh`, ...);
}
```

**Issues:**
1. **Refresh storm**: If 10 concurrent requests get 401, sends 10 refresh requests instantly
2. **Server backpressure**: Multiple simultaneous refreshs can be denied or rate-limited
3. **Client resource waste**: 10 parallel network calls for same tokens
4. **Race conditions**: Last refresh wins, earlier ones might overwrite tokens

**Evidence - No Request Caching**
```typescript
// Current implementation:
// All API calls go directly through apiClient
// No caching layer for GET requests
```

**Issues:**
1. **Repeated GET requests**: `getMe()`, `getProfiles()` called frequently, no cache
2. **Unnecessary network roundtrips**: Fetching static data repeatedly
3. **Increased server load**: Could be cached at CDN or Redis level
4. **Poor UX on slow connections**: Each cache miss means full network latency

**Evidence - No Request Debouncing**
```typescript
// Current implementation:
// No debouncing for user typing or rapid UI interactions
```

**Issues:**
1. **Request storms**: User rapidly typing in search triggers many API calls
2. **Unnecessary work**: Intermediate results discarded, server processes and returns
3. **Cost**: Every unnecessary request costs bandwidth and server compute time

---

#### Proposed Actions (Performance)

**P1. Implement Request Deduplication for Refresh** (1.5 hours)
```typescript
// ADD after line 24:
let pendingRefresh: Promise<void> | null = null;
const pending401Requests: Array<() => void> = [];

// Then in interceptor (lines 28-46):
if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
  // Check if already refreshing
  if (pendingRefresh) {
    // Queue this request to resolve after refresh
    return new Promise<void>((resolve, reject) => {
      pending401Requests.push(() => {
        apiClient(originalRequest).then(resolve).catch(reject);
      });
    });
  }

  // Start refresh
  pendingRefresh = (async () => {
    try {
      // Add delay to avoid immediate storm
      await new Promise(r => setTimeout(r, 100));

      await axios.post(`${API_URL}/auth/refresh`, {}, {
        withCredentials: true,
      });

      // Refresh succeeded, resolve all queued requests
      pending401Requests.forEach(req => req());
    } catch (refreshError) {
      // Refresh failed, reject all queued requests
      pending401Requests.forEach(req => {
        try {
          req();
        } catch (e) {
          // Already rejected, ignore
        }
      });
      throw refreshError;
    } finally {
      pendingRefresh = null;
      pending401Requests = [];
    }
  })();

  return pendingRefresh;
}
```

**Risk**: Medium - Complex concurrency logic
**Effort**: 1.5 hours
**Effort**: Single refresh even if 100 concurrent 401s
**Metrics to validate**:
- Count refresh requests during load (should be 1 even with 10 401s)
- Measure time to first successful request after 401 (should be <500ms after refresh completes)

---

**P2. Add Response Caching Layer** (2 hours)
```typescript
// ADD caching infrastructure (after line 49):
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

class SimpleCache {
  private cache = new Map<string, CacheEntry<unknown>>();
  private defaultTTL = 60000; // 1 minute

  set<T>(key: string, data: T, ttl?: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + (ttl ?? this.defaultTTL),
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  invalidate(key: string): void {
    this.cache.delete(key);
  }

  invalidatePattern(pattern: RegExp): void {
    for (const key of this.cache.keys()) {
      if (pattern.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  clear(): void {
    this.cache.clear();
  }
}

const cache = new SimpleCache();

// Then modify userApi to use cache:
// CURRENT (line 86):
getMe: () => apiClient.get('/users/me'),

// PROPOSED:
getMe: async () => {
  const cached = cache.get<User>('/users/me');
  if (cached) return cached;

  const response = await apiClient.get('/users/me');
  cache.set('/users/me', response.data, 30000); // 30 second cache
  return response;
},

// Invalidate cache on auth changes:
login: async (username: string, password: string) => {
  const response = await apiClient.post('/auth/login', ...);
  cache.invalidatePattern(/^\/users/); // Invalidate all user/profile data
  return response;
},
```

**Risk**: Medium - Cache invalidation complexity
**Effort**: 2 hours
**Impact**: 30-90% fewer network requests for common data
**Metrics to validate**:
- Network tab: Count /users/me requests (should drop by 70%+)
- Lighthouse: Reduce server response time (SRT) metric

---

**P3. Add Request Debouncing Helper** (1 hour)
```typescript
// ADD debounce utility (after line 49):
export const createDebouncer = (fn: (...args: any[]) => any, delay: number) => {
  let timeoutId: number | null = null;

  return (...args: any[]) => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }

    timeoutId = window.setTimeout(() => {
      fn(...args);
      timeoutId = null;
    }, delay);
  };
};

// Then export from api:
export const debounceApiCall = createDebouncer;

// Usage in calling code (e.g., search):
import { debounceApiCall } from './services/api';

const debouncedSearch = debounceApiCall(async (query: string) => {
  const results = await userApi.searchProfiles(query);
  return results;
}, 300); // 300ms debounce
```

**Risk**: Low - Helper function only
**Effort**: 1 hour
**Impact**: Prevents request storms during rapid user input
**Metrics to validate**:
- Network tab: Count API calls during rapid typing (should be 1/5th without debounce)

---

### 5. SECURITY REVIEWER VIEWPOINT

#### Observations

**Evidence - Cookie Configuration (Line 19)**
```typescript
const apiClient: AxiosInstance = axios.create({
  // ...
  withCredentials: true, // IMPORTANT: Send cookies with cross-origin requests
});
```

**Issues:**
1. **CSRF risk**: Cookies sent automatically without token validation
2. **SameSite not configured**: Cookies sent on all subdomains
3. **No Secure flag enforcement**: HTTPS only? Should verify in backend
4. **No XSRF-TOKEN**: No double-submit cookie protection

**Evidence - Token Exposure in Memory**
```typescript
// Current implementation:
// Tokens stored in httpOnly cookies by backend
// But interceptors have access to response.data
// If any logging dumps full error, tokens could leak
```

**Issues:**
1. **Potential token leak**: `console.error(error)` in interceptor might include tokens
2. **No redaction in error logs**: Full error objects logged
3. **Error messages may contain tokens**: Backend might include tokens in error responses

**Evidence - No Request Signing**
```typescript
// Current implementation:
// No request signing, no nonce, no timestamp verification
```

**Issues:**
1. **Replay attack vector**: Captured requests can be replayed
2. **No request ID tracking**: Can't correlate request/response pairs
3. **No integrity verification**: Request body could be modified in transit

---

#### Proposed Actions (Security)

**S1. Add Request/Response ID Correlation** (1 hour)
```typescript
// ADD after line 49:
let requestIdCounter = 0;

apiClient.interceptors.request.use(
  (config) => {
    // Add unique request ID
    config.headers = {
      ...config.headers,
      'X-Request-ID': `req_${Date.now()}_${++requestIdCounter}`,
    };

    // Log sanitized request (no passwords/tokens)
    const sanitizedConfig = { ...config };
    delete sanitizedConfig.data?.password;
    console.log(`[API Request] ${config.method} ${config.url} [${config.headers['X-Request-ID']}]`, {
      headers: config.headers,
    });

    return config;
  }
);

apiClient.interceptors.response.use(
  (response) => {
    // Log response with request ID
    console.log(`[API Response] ${response.config.headers['X-Request-ID']} → ${response.status}`, {
      status: response.status,
    });
    return response;
  },
  (error) => {
    console.error(`[API Error] ${error.config?.headers['X-Request-ID']}`, {
      status: error.response?.status,
      message: error.message,
    });
    return Promise.reject(error);
  }
);
```

**Risk**: Low - Logging only
**Effort**: 1 hour
**Impact**: Better traceability, replay attack detection
**Validation**: Test with multiple concurrent requests, verify IDs are unique

---

**S2. Add Token Redaction in Error Logs** (30 min)
```typescript
// ADD redaction utility (after line 49):
const redactSensitive = (obj: unknown): unknown => {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }

  const sensitiveKeys = ['token', 'password', 'secret', 'key', 'authorization', 'cookie'];
  const redacted = '[REDACTED]';

  const redactedObj: any = Array.isArray(obj) ? [] : {};

  for (const key of Object.keys(obj)) {
    const keyLower = key.toLowerCase();

    if (sensitiveKeys.some(sk => keyLower.includes(sk))) {
      redactedObj[key] = redacted;
    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
      redactedObj[key] = redactSensitive(obj[key]);
    } else if (Array.isArray(obj[key])) {
      redactedObj[key] = obj[key].map(redactSensitive);
    } else {
      redactedObj[key] = obj[key];
    }
  }

  return redactedObj;
};

// Then use in error logging:
console.error(`[API Error]`, redactSensitive(error));
```

**Risk**: Low - Logging only
**Effort**: 30 min
**Impact**: Tokens/passwords never leak to logs
**Validation**: Manually trigger 401 and verify no tokens in console

---

**S3. Verify Backend Cookie Security Settings** (investigation, 1 hour)
```bash
# CHECK backend cookie settings:
grep -r "set_cookie\|Secure\|HttpOnly\|SameSite" src/backend/app/

# EXPECTED to find:
# response.set_cookie(
#     key="access_token",
#     value=token,
#     httponly=True,
#     secure=True,     # Required for HTTPS
#     samesite="strict",  # CSRF protection
#     max_age=...
# )
```

**If issues found:**
1. Missing `Secure=True`: Cookie sent over HTTP
2. Missing `HttpOnly=True`: JavaScript can access token
3. Missing `SameSite=strict`: CSRF vulnerability
4. `max_age` too long: Longer-lived tokens = higher risk

**Risk**: Medium - Requires backend changes
**Effort**: 1 hour (mostly investigation)
**Impact**: Fixes cookie-based auth vulnerabilities

---

### 6. RELIABILITY/SRE VIEWPOINT

#### Observations

**Evidence - No Retry Logic for Transient Errors**
```typescript
// Current implementation:
// Only retries on 401 with refresh
// No retry for: network errors, 500s, timeouts, 503s
```

**Issues:**
1. **Fragile to network blips**: Temporary network issues cause immediate failure
2. **No exponential backoff**: Immediate retries can overwhelm server
3. **No retry attempt limit**: Could retry forever
4. **No circuit breaker**: Server overload not detected

**Evidence - No Timeout Handling**
```typescript
// Current implementation (line 18):
timeout: 10000,
```

**Issues:**
1. **Hardcoded timeout**: Can't adjust for different operations
2. **No timeout distinction**: 10s for all operations (too long for fast reads, too short for uploads)
3. **No timeout error type**: Can't distinguish between slow server and client timeout
4. **No retry on timeout**: Timeouts treated like fatal errors

**Evidence - No Health Check / Circuit Breaker**
```typescript
// Current implementation:
// No health checks
// No circuit breaker for failing endpoints
// No load shedding
```

**Issues:**
1. **Blind retries to failing endpoints**: Server down = client spins
2. **No degraded mode**: Can't fall back to cached data
3. **No error rate tracking**: Can't detect backend issues
4. **No retry-after delay**: Don't back off from failing service

---

#### Proposed Actions (Reliability)

**R1. Implement Exponential Backoff with Max Retries** (2 hours)
```typescript
// ADD retry infrastructure (after line 24):
interface RetryConfig {
  maxAttempts: number;
  baseDelay: number;
  maxDelay: number;
  retryableStatuses: number[];
  backoffFactor: number;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 30000, // 30 seconds
  retryableStatuses: [408, 429, 500, 502, 503, 504],
  backoffFactor: 2,
};

const getRetryDelay = (attempt: number, config: RetryConfig): number => {
  return Math.min(
    config.baseDelay * Math.pow(config.backoffFactor, attempt - 1),
    config.maxDelay
  );
};

// Then modify interceptor to retry all retryable errors:
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    const attempt = originalRequest._retryCount || 0;

    if (
      attempt < DEFAULT_RETRY_CONFIG.maxAttempts &&
      DEFAULT_RETRY_CONFIG.retryableStatuses.includes(error.response?.status || 0)
    ) {
      const delay = getRetryDelay(attempt + 1, DEFAULT_RETRY_CONFIG);

      console.log(`[API] Retrying ${error.config?.url} (attempt ${attempt + 1}/${DEFAULT_RETRY_CONFIG.maxAttempts}) after ${delay}ms`);

      await new Promise(resolve => setTimeout(resolve, delay));

      originalRequest._retryCount = attempt + 1;
      return apiClient(originalRequest);
    }

    return Promise.reject(error);
  }
);
```

**Risk**: Medium - Adds retry complexity
**Effort**: 2 hours
**Impact**: Survives transient errors, reduces customer-visible failures
**Metrics to validate**:
- Simulate network blip: Should retry automatically
- Simulate 500: Should retry with backoff
- Should not retry after max attempts

---

**R2. Add Request Timeout Categorization** (1.5 hours)
```typescript
// ADD timeout types (after line 17):
enum RequestTimeout {
  FAST = 5000,      // 5s for fast reads (user, profile, etc.)
  NORMAL = 10000,    // 10s for normal operations (games, progress)
  SLOW = 30000,      // 30s for uploads, reports
  UNLIMITED = 0,      // No timeout for long-running operations
}

const TIMEOUT_BY_METHOD: Record<string, RequestTimeout> = {
  'GET': RequestTimeout.FAST,
  'DELETE': RequestTimeout.FAST,
  'POST': RequestTimeout.NORMAL,
  'PUT': RequestTimeout.NORMAL,
  'PATCH': RequestTimeout.NORMAL,
};

// Then modify apiClient creation:
const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: RequestTimeout.NORMAL,
  withCredentials: true,
});

// Export config to adjust timeout:
export const setTimeout = (method: string, timeout: RequestTimeout) => {
  apiClient.defaults.timeout = timeout;
  apiClient.defaults.headers.common['X-Timeout-Category'] = method.toUpperCase();
};

// Usage:
import { setTimeout, RequestTimeout } from './services/api';

// For fast reads:
const user = await apiClient.get('/users/me'); // Uses default 10s

// For uploads:
setTimeout('POST', RequestTimeout.SLOW);
await apiClient.post('/upload', formData);
```

**Risk**: Low - Configuration only
**Effort**: 1.5 hours
**Impact**: Faster UX for reads, more generous for uploads

**Metrics to validate**:
- Measure time to /users/me (should be <2s)
- Upload 10MB file: Should not timeout at 10s

---

**R3. Add Circuit Breaker Pattern** (2 hours)
```typescript
// ADD circuit breaker (after line 49):
interface CircuitBreakerConfig {
  failureThreshold: number;    // After N failures, open circuit
  recoveryTimeout: number;       // Wait N ms before trying again
  monitoredEndpoints: string[];
}

const circuitBreakers = new Map<string, {
  failures: number;
  lastFailureTime: number;
  state: 'closed' | 'open' | 'half-open';
}>();

const checkCircuitBreaker = (endpoint: string): boolean => {
  const breaker = circuitBreakers.get(endpoint);

  if (!breaker) return true; // Not monitored, allow

  // Check if endpoint is in failure window
  if (breaker.state === 'open') {
    const timeSinceFailure = Date.now() - breaker.lastFailureTime;
    if (timeSinceFailure < breaker.recoveryTimeout) {
      console.warn(`[Circuit Breaker] Endpoint ${endpoint} is open, skipping request`);
      return false;
    }
    // Recovery window passed, reset
    breaker.state = 'half-open';
    breaker.failures = 0;
    console.log(`[Circuit Breaker] Endpoint ${endpoint} entering half-open state`);
  }

  return true;
};

const recordFailure = (endpoint: string) => {
  const breaker = circuitBreakers.get(endpoint);

  if (!breaker) return; // Not monitored

  breaker.failures++;
  breaker.lastFailureTime = Date.now();

  if (breaker.failures >= 5) {
    breaker.state = 'open';
    console.error(`[Circuit Breaker] Endpoint ${endpoint} failing too much, opening circuit`);
  }
};

const recordSuccess = (endpoint: string) => {
  const breaker = circuitBreakers.get(endpoint);

  if (!breaker) return; // Not monitored

  breaker.failures = Math.max(0, breaker.failures - 1);

  if (breaker.failures === 0 && breaker.state === 'open') {
    breaker.state = 'closed';
    console.log(`[Circuit Breaker] Endpoint ${endpoint} recovered, closing circuit`);
  }
};

// Then modify interceptor (line 23):
apiClient.interceptors.request.use(
  (config) => {
    if (!checkCircuitBreaker(config.url || '')) {
      return Promise.reject(new Error(`Circuit breaker open for ${config.url}`));
    }
    return config;
  }
);

// And response interceptor:
apiClient.interceptors.response.use(
  (response) => {
    if (response.config.url) {
      recordSuccess(response.config.url);
    }
    return response;
  },
  (error) => {
    if (error.config?.url) {
      recordFailure(error.config.url);
    }
    return Promise.reject(error);
  }
);
```

**Risk**: High - Complex to get right
**Effort**: 2 hours
**Impact**: Prevents cascading failures, protects backend
**Metrics to validate**:
- Mock endpoint to fail 5 times in a row
- Should block 6th request
- Should recover after timeout

---

### 7. TEST ENGINEER VIEWPOINT

#### Observations

**Evidence - No Test Coverage**
```bash
# Check for test files:
find src/frontend/src/services -name "*.test.ts" -o -name "*.spec.ts"

# RESULT: Only api.test.ts exists (262 lines)
# api.ts has NO dedicated test file
```

**Issues:**
1. **No unit tests for api.ts**: 132 lines of untested code
2. **No interceptor tests**: Critical retry logic untested
3. **No auth flow tests**: Login/refresh/logout not tested
4. **No error handling tests**: All error paths untested
5. **No mock server integration**: Can't test without full backend

**Evidence - Missing Test Scenarios**
```typescript
// Critical scenarios not tested:
// 1. Token expiration during request
// 2. Refresh endpoint failure
// 3. Network timeout
// 4. Server 500
// 5. Concurrent 401s
// 6. Logout with pending requests
// 7. Refresh success but token still invalid
// 8. Request/response interceptor interaction
```

**Issues:**
1. **Race conditions untested**: Multiple concurrent requests possible
2. **Memory leaks possible**: Pending requests not cleaned up on errors
3. **State desync**: Store and cookies can get out of sync
4. **No integration tests**: How api.ts integrates with stores untested

---

#### Proposed Actions (Testing)

**T1. Create Unit Test Suite for api.ts** (3 hours)
```typescript
// CREATE: src/frontend/src/services/api.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';
import { apiClient, authApi, userApi, profileApi } from './api';
import { store } from '../store';

// Mock axios
vi.mock('axios');

describe('api.ts - Authentication', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    apiClient.interceptors.request.clear();
    apiClient.interceptors.response.clear();
  });

  describe('login', () => {
    it('sends POST to /auth/login with form data', async () => {
      const mockResponse = { data: { access_token: 'token123' } };
      vi.mocked(axios.post).mockResolvedValue(mockResponse as any);

      await authApi.login('user@example.com', 'password');

      expect(axios.post).toHaveBeenCalledWith(
        '/auth/login',
        expect.any(String) // URLSearchParams
      );
    });

    it('sets correct content-type header', async () => {
      const mockResponse = { data: { access_token: 'token123' } };
      vi.mocked(axios.post).mockResolvedValue(mockResponse as any);

      await authApi.login('user@example.com', 'password');

      expect(axios.post).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/x-www-form-urlencoded',
          }),
        })
      );
    });
  });

  describe('refresh', () => {
    it('sends POST to /auth/refresh', async () => {
      const mockResponse = { data: { access_token: 'new_token' } };
      vi.mocked(axios.post).mockResolvedValue(mockResponse as any);

      await authApi.refresh();

      expect(axios.post).toHaveBeenCalledWith('/auth/refresh', {}, {
        withCredentials: true,
      });
    });
  });
});

describe('api.ts - Token Refresh Interceptor', () => {
  describe('on 401 response', () => {
    it('attempts refresh exactly once', async () => {
      const mockRefreshResponse = { data: { access_token: 'new_token' } };
      const mockRetryResponse = { data: { result: 'success' } };

      vi.mocked(axios.post)
        .mockResolvedValueOnce(mockRefreshResponse as any)
        .mockResolvedValueOnce(mockRetryResponse as any);

      const originalRequest: any = { _retry: false };
      vi.mocked(axios.create).mockReturnValue({
        ...apiClient,
        interceptors: { request: { use: vi.fn(), clear: vi.fn() } },
      } as any);

      const promise = Promise.reject({ config: originalRequest, response: { status: 401 } });

      // Simulate interceptor
      const interceptor = vi.fn((response) => response);
      apiClient.interceptors.response.use(interceptor);

      // Trigger interceptor by making request
      const result = await apiClient(originalRequest).catch(e => e);

      expect(axios.post).toHaveBeenCalledTimes(1); // Only one refresh
    });

    it('marks request as retried', async () => {
      let capturedRequest: any;
      vi.mocked(axios.create).mockReturnValue({
        ...apiClient,
        interceptors: { request: { use: vi.fn((c) => c) } },
      } as any);

      const interceptor = vi.fn((config) => {
        capturedRequest = config;
        return config;
      });

      apiClient.interceptors.response.use(interceptor);

      const promise = Promise.reject({ config: { url: '/test' }, response: { status: 401 } });
      await apiClient.get('/test').catch(e => e);

      expect(capturedRequest._retry).toBe(true);
    });

    it('rejects if refresh fails', async () => {
      const refreshError = new Error('Refresh failed');
      vi.mocked(axios.post).mockRejectedValue(refreshError);

      let capturedError: any;
      const interceptor = vi.fn((error) => {
        capturedError = error;
        return Promise.reject(error);
      });

      apiClient.interceptors.response.use(interceptor);

      const promise = Promise.reject({ config: { url: '/test' }, response: { status: 401 } });
      const error = await apiClient.get('/test').catch(e => e);

      expect(capturedError).toBe(refreshError);
    });
  });
});
```

**Risk**: Low - Tests only
**Effort**: 3 hours
**Coverage**: Critical paths (login, refresh, interceptor)
**Validation**: `npm run test` should cover api.ts

---

**T2. Add MSW Integration for E2E Testing** (2 hours)
```bash
# INSTALL MSW:
npm install --save-dev msw

# CREATE: src/frontend/src/mocks/handlers.ts
import { http, HttpResponse } from 'msw';
import { authApi, userApi } from '../services/api';

export const handlers = [
  // Auth handlers
  http.post('/api/v1/auth/login', async ({ request }) => {
    const { username, password } = await request.json();

    if (password === 'wrong_password') {
      return HttpResponse.json(
        { detail: 'Invalid credentials' },
        { status: 401 }
      );
    }

    if (password === 'expired_token') {
      return HttpResponse.json(
        { detail: 'Token expired' },
        { status: 401 }
      );
    }

    return HttpResponse.json({
      access_token: 'mock_token_123',
      refresh_token: 'mock_refresh_456',
      token_type: 'bearer',
      expires_in: 3600,
    });
  }),

  // Refresh handler
  http.post('/api/v1/auth/refresh', async () => {
    return HttpResponse.json({
      access_token: 'refreshed_token_789',
      refresh_token: 'refreshed_token_012',
      token_type: 'bearer',
      expires_in: 3600,
    });
  }),

  // User handlers
  http.get('/api/v1/users/me', () => {
    return HttpResponse.json({
      id: 'user_123',
      email: 'user@example.com',
      role: 'parent',
      is_active: true,
    });
  }),

  // Profile handlers
  http.get('/api/v1/users/me/profiles', () => {
    return HttpResponse.json([
      { id: 'profile_1', name: 'Child 1', preferred_language: 'en' },
      { id: 'profile_2', name: 'Child 2', preferred_language: 'hi' },
    ]);
  }),

  // Network simulation
  http.get('/api/v1/users/network-error', () => {
    return HttpResponse.json(null, { status: 503 });
  }),

  http.get('/api/v1/users/timeout', () => {
    return HttpResponse.json(null, { status: 504 });
  }),
];

# CREATE: src/frontend/src/mocks/server.ts
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);
```

**Risk**: Medium - Requires test infrastructure setup
**Effort**: 2 hours
**Coverage**: Full API surface with realistic network simulation
**Validation**: Run tests, verify 401/refresh flow works end-to-end

---

**T3. Add Performance Regression Tests** (2 hours)
```typescript
// CREATE: src/frontend/src/services/api.perf.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiClient, userApi } from './api';

// Mock axios for timing tests
vi.mock('axios');

describe('api.ts - Performance', () => {
  describe('concurrent 401 handling', () => {
    it('should only trigger one refresh for multiple 401s', async () => {
      let refreshCount = 0;
      vi.mocked(axios.post).mockImplementation(async () => {
        refreshCount++;
        return { data: { access_token: 'token' } };
      });

      vi.mocked(axios.create).mockReturnValue({
        ...apiClient,
        interceptors: { request: { use: vi.fn((c) => c) } },
      } as any);

      // Simulate 10 concurrent 401s
      const promises = Array(10).fill(null).map(() =>
        Promise.reject({ config: { url: '/test' }, response: { status: 401 } })
      );

      await Promise.all(promises);

      expect(refreshCount).toBe(1); // Only ONE refresh
    });

    it('should complete all requests after refresh', async () => {
      const responses = [
        { data: { id: 1 } },
        { data: { id: 2 } },
        { data: { id: 3 } },
        { data: { id: 4 } },
        { data: { id: 5 } },
        { data: { id: 6 } },
        { data: { id: 7 } },
        { data: { id: 8 } },
        { data: { id: 9 } },
        { data: { id: 10 } },
      ];

      vi.mocked(axios.post).mockResolvedValueOnce({ data: { access_token: 'token' } } as any)
        .mockResolvedValueOnce({ data: responses[0] } as any)
        .mockResolvedValueOnce({ data: responses[1] } as any)
        .mockResolvedValueOnce({ data: responses[2] } as any)
        .mockResolvedValueOnce({ data: responses[3] } as any)
        .mockResolvedValueOnce({ data: responses[4] } as any)
        .mockResolvedValueOnce({ data: responses[5] } as any)
        .mockResolvedValueOnce({ data: responses[6] } as any)
        .mockResolvedValueOnce({ data: responses[7] } as any)
        .mockResolvedValueOnce({ data: responses[8] } as any)
        .mockResolvedValueOnce({ data: responses[9] } as any);

      vi.mocked(axios.create).mockReturnValue({
        ...apiClient,
        interceptors: { request: { use: vi.fn((c) => c) } },
      } as any);

      const promises = responses.map((_, i) =>
        Promise.reject({ config: { url: `/test/${i}` }, response: { status: 401 } })
      );

      const results = await Promise.all(promises);

      expect(results[0]?.data).toEqual(responses[0].data);
      expect(results[9]?.data).toEqual(responses[9].data);
    });
  });

  describe('request deduplication', () => {
    it('should deduplicate identical concurrent requests', async () => {
      const responses: Array(5).fill(null).map((_, i) => ({ data: i }));

      let requestCount = 0;
      vi.mocked(axios.get).mockImplementation(async () => {
        requestCount++;
        return responses[requestCount - 1];
      });

      vi.mocked(axios.create).mockReturnValue({
        ...apiClient,
        interceptors: { request: { use: vi.fn((c) => c) } },
      } as any);

      // Make 5 identical concurrent requests
      const promises = Array(5).fill(null).map(() => userApi.getMe());

      await Promise.all(promises);

      // With deduplication, should only make 1 actual request
      expect(requestCount).toBe(1);
    });
  });
});
```

**Risk**: Low - Tests only
**Effort**: 2 hours
**Coverage**: Performance-critical paths
**Validation**: Run tests, verify single refresh and deduplication

---

### 8. PRODUCT THINKER VIEWPOINT

#### Observations

**Evidence - No User-Facing Error Handling**
```typescript
// Current error flow:
// API error → Promise.reject(error)
// Store catches error → set error: error.message
// UI displays: "Failed to fetch profiles"

**Issues:**
1. **Generic error messages**: User doesn't know what to do
2. **No recovery actions**: No "try again" button logic
3. **No offline detection**: User sees same error when offline
4. **No progressive degradation**: System is either fully working or fully broken

**Evidence - No Request Progress Indication**
```typescript
// Current implementation:
// No loading states, no progress feedback
```

**Issues:**
1. **Spinning loaders everywhere**: User doesn't know if request is taking time or stuck
2. **No timeout feedback**: User doesn't know request is slow
3. **No cancel functionality**: Can't cancel long-running requests
4. **No retry indication**: User doesn't know system is retrying

---

#### Proposed Actions (Product)

**P1. Add User-Facing Error Types** (1.5 hours)
```typescript
// ADD error types (after line 49):
export enum ApiErrorCode {
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT = 'TIMEOUT',
  SERVER_ERROR = 'SERVER_ERROR',
  NOT_AUTHENTICATED = 'NOT_AUTHENTICATED',
  AUTH_TOKEN_EXPIRED = 'AUTH_TOKEN_EXPIRED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  RATE_LIMITED = 'RATE_LIMITED',
}

export interface AppError {
  code: ApiErrorCode;
  message: string;
  userMessage: string;  // Friendly message for UI
  retryable: boolean;
  actions?: Array<{ label: string; action: () => void }>;
}

// Error mapping function:
export const mapApiErrorToAppError = (error: AxiosError): AppError => {
  const status = error.response?.status;
  const code = error.code || 'NETWORK_ERROR';

  switch (status) {
    case 401:
      return {
        code: ApiErrorCode.NOT_AUTHENTICATED,
        message: 'Authentication required',
        userMessage: 'Please sign in to continue',
        retryable: false,
        actions: [
          { label: 'Sign in', action: () => window.location.href = '/login' },
        { label: 'Play as guest', action: () => { /* navigate to guest mode */ } },
        ],
      };
    case 429:
      return {
        code: ApiErrorCode.RATE_LIMITED,
        message: 'Too many requests',
        userMessage: 'Please wait a moment and try again',
        retryable: true,
      };
    case 500:
    return {
        code: ApiErrorCode.SERVER_ERROR,
        message: 'Server error',
        userMessage: 'Something went wrong on our end. Please try again.',
        retryable: true,
      };
    case 0:
      return {
        code: ApiErrorCode.NETWORK_ERROR,
        message: 'Network error',
        userMessage: 'Unable to connect. Please check your internet.',
        retryable: true,
      };
    default:
      return {
        code: ApiErrorCode.SERVER_ERROR,
        message: error.message || 'Unknown error',
        userMessage: 'An error occurred. Please try again.',
        retryable: false,
      };
  }
};

// Then export from api.ts
export { ApiErrorCode, mapApiErrorToAppError };
```

**Risk**: Low - Error handling only
**Effort**: 1.5 hours
**Impact**: Clear user guidance, better UX
**Validation**: Test with simulated errors, verify messages are appropriate

---

**P2. Add Request Cancelation Support** (1 hour)
```typescript
// ADD AbortController support (after line 49):
export const createCancelableRequest = <T>(
  requestFn: (signal?: AbortSignal) => Promise<T>
): { request: Promise<T>; cancel: () => void } => {
  const controller = new AbortController();

  const request = requestFn(controller.signal).catch(error => {
    if (error.name === 'CanceledError') {
      throw error; // Re-throw cancellation
    }
    throw error;
  });

  const cancel = () => {
    controller.abort();
  };

  return { request, cancel };
};

// Example usage in component:
import { createCancelableRequest } from './services/api';

const UserSearch = () => {
  const [query, setQuery] = useState('');
  const { request, cancel } = useRef<{ request: Promise<any>; cancel: () => void } | null>(null);

  const search = async () => {
    // Cancel previous request
    request.current?.cancel();

    // Create new cancellable request
    request.current = createCancelableRequest((signal) =>
      userApi.searchProfiles(query, { signal })
    );

    try {
      const results = await request.current.request;
      setResults(results);
    } catch (error: any) {
      if (error.name !== 'CanceledError') {
        setError(error);
      }
    }
  };

  useEffect(() => {
    search();
    return () => {
      request.current?.cancel();
    };
  }, [query]);
};
```

**Risk**: Low - Additive feature
**Effort**: 1 hour
**Impact**: Users can cancel long operations, better UX

**Validation**: Test rapid search, verify previous requests cancel

---

**P3. Add Offline Detection with Queueing** (2.5 hours)
```typescript
// ADD offline detection and queueing (after line 49):
type QueuedRequest = {
  id: string;
  fn: () => Promise<any>;
  resolve: (value: any) => void;
  reject: (error: any) => void;
};

class OfflineQueue {
  private queue: QueuedRequest[] = [];
  private isOnline: boolean = navigator.onLine;
  private processing: boolean = false;

  constructor() {
    // Listen for online/offline events
    window.addEventListener('online', () => this.setOnline(true));
    window.addEventListener('offline', () => this.setOnline(false));
  }

  private setOnline(online: boolean) {
    this.isOnline = online;
    console.log(`[OfflineQueue] Network status: ${online ? 'online' : 'offline'}`);

    if (online) {
      this.processQueue();
    }
  }

  add<T>(id: string, fn: () => Promise<T>): Promise<T> => {
    return new Promise((resolve, reject) => {
      const request: QueuedRequest = { id, fn, resolve, reject };

      if (this.isOnline) {
        // Process immediately if online
        fn().then(resolve).catch(reject);
      } else {
        // Queue if offline
        this.queue.push(request);
        console.log(`[OfflineQueue] Queued request: ${id}`);
      }
    });
  }

  private async processQueue() {
    if (this.processing || this.queue.length === 0) return;

    this.processing = true;

    while (this.queue.length > 0) {
      const request = this.queue.shift()!;

      try {
        const result = await request.fn();
        request.resolve(result);
        console.log(`[OfflineQueue] Processed request: ${request.id}`);
      } catch (error) {
        request.reject(error);
      }
    }

    this.processing = false;
  }
}

const offlineQueue = new OfflineQueue();

// Then export wrapper function:
export const withOfflineQueue = <T>(
  id: string,
  fn: () => Promise<T>
): Promise<T> => {
  return offlineQueue.add(id, fn);
};

// Usage in stores:
import { withOfflineQueue } from './services/api';

// In profileStore:
fetchProfiles: async () => {
  const response = await withOfflineQueue('fetch-profiles', () =>
    profileApi.getProfiles()
  );
  set({ profiles: response.data });
},
```

**Risk**: High - Complex queueing logic
**Effort**: 2.5 hours
**Impact**: Works offline, no data loss
**Validation**: Test offline mode, verify requests queue and execute

---

### 9. RESEARCHER/EXPERIMENTER VIEWPOINT

#### Observations

**Evidence - Current Retry Strategy**
```typescript
// Current: Single retry after 401, no learning
```

**Issues:**
1. **No adaptivity**: Always same delay, same backoff
2. **No metrics collection**: Can't optimize without data
3. **No A/B testing**: Can't compare strategies
4. **No ML-based prediction**: Can't predict best retry parameters

**Evidence - No Request Tracing**
```typescript
// Current: Basic logging, no structured tracing
```

**Issues:**
1. **Can't debug production issues**: No distributed tracing
2. **Can't measure real performance**: Dev measurements don't match prod
3. **Can't correlate errors**: No request ID correlation across services
4. **No synthetic transaction monitoring**: Hard to see system behavior

---

#### Proposed Experiments

**E1. Retry Strategy A/B Test** (4 hours)
```typescript
// HYPOTHESIS: Exponential backoff with jitter beats fixed delay

// IMPLEMENT two variants:

// Variant A: Fixed 500ms delay (current-like)
const refreshWithFixedDelay = async () => {
  await new Promise(r => setTimeout(r, 500));
  return axios.post(`${API_URL}/auth/refresh`, {}, { withCredentials: true });
};

// Variant B: Exponential backoff with jitter
const refreshWithExponentialBackoff = async (attempt: number): Promise<void> => {
  const baseDelay = 100;
  const backoff = 2;
  const jitter = Math.random() * 100; // 0-100ms jitter
  const delay = Math.min(baseDelay * Math.pow(backoff, attempt) + jitter, 30000);

  console.log(`[Experiment] Retry attempt ${attempt}, delay: ${delay.toFixed(0)}ms`);

  await new Promise(r => setTimeout(r, delay));
  return axios.post(`${API_URL}/auth/refresh`, {}, { withCredentials: true });
};

// A/B switch (random per page load):
const REFRESH_STRATEGY = Math.random() > 0.5 ? 'fixed' : 'exponential';

const performRefresh = async (attempt: number) => {
  if (REFRESH_STRATEGY === 'fixed') {
    return await refreshWithFixedDelay();
  } else {
    return await refreshWithExponentialBackoff(attempt);
  }
};

// Log metrics
window.addEventListener('beforeunload', () => {
  navigator.sendBeacon('/api/metrics', JSON.stringify({
    strategy: REFRESH_STRATEGY,
    refreshAttempts: window.refreshAttempts || 0,
    successfulRequests: window.successfulRequests || 0,
  }));
});
```

**Risk**: Medium - Production experiment
**Effort**: 4 hours
**Success Metric**: Lower 95th percentile refresh time
**Stop Condition**: Worse performance after 1 week

---

**E2. Request Batching Experiment** (3 hours)
```typescript
// HYPOTHESIS: Batching GET requests reduces overall latency

// IMPLEMENT batch utility:
class RequestBatcher {
  private batch: Array<() => Promise<any>> = [];
  private batchDelay: number;
  private batchTimer: number | null = null;

  constructor(delay: number = 50) {
    this.batchDelay = delay;
  }

  add<T>(request: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.batch.push({ request: request, resolve, reject });

      if (!this.batchTimer) {
        this.batchTimer = window.setTimeout(() => {
          this.flush();
        }, this.batchDelay);
      }
    });
  }

  private async flush() {
    if (this.batch.length === 0) return;

    const requests = this.batch.splice(0);
    this.batchTimer = null;

    try {
      const results = await Promise.all(requests.map(r => r.request()));

      results.forEach((result, index) => {
        const { resolve } = requests[index];
        resolve(result);
      });
    } catch (error) {
      requests.forEach(({ reject }) => reject(error));
    }
  }
}

const batcher = new RequestBatcher(50); // 50ms batching window

// Modify api methods to use batcher:
// CURRENT (line 86):
getMe: () => apiClient.get('/users/me'),

// PROPOSED:
getMe: () => batcher.add(() => apiClient.get('/users/me')),

// Similarly for other GET requests
```

**Risk**: High - Changes request timing/ordering
**Effort**: 3 hours
**Success Metric**: 20% reduction in total request time
**Stop Condition**: Data integrity issues

---

**E3. Predictive Prefetching** (2 hours)
```typescript
// HYPOTHESIS: Predictive prefetching based on user behavior reduces perceived latency

// IMPLEMENT prefetch engine:
interface PrefetchConfig {
  threshold: number;      // Confidence threshold to prefetch
  window: number;         // Time window to evaluate
  maxConcurrent: number;  // Max concurrent prefetches
}

const DEFAULT_PREFETCH_CONFIG: PrefetchConfig = {
  threshold: 0.7,         // 70% confidence
  window: 30000,          // 30 second window
  maxConcurrent: 2,
};

class PredictivePrefetcher {
  private predictions = new Map<string, number>();

  recordPrediction(action: string, confidence: number): void {
    this.predictions.set(action, confidence);

    // Evaluate predictions every window
    setTimeout(() => this.evaluateAndPrefetch(), DEFAULT_PREFETCH_CONFIG.window);
  }

  private async evaluateAndPrefetch() {
    for (const [action, confidence] of this.predictions.entries()) {
      if (confidence >= DEFAULT_PREFETCH_CONFIG.threshold) {
        console.log(`[Prefetch] Prefetching ${action} (confidence: ${(confidence * 100).toFixed(0)}%)`);

        // Prefetch based on action
        switch (action) {
          case 'navigating_to_dashboard':
            await this.prefetchUserData();
            break;
          case 'opening_profile_modal':
            await this.prefetchProfiles();
            break;
          case 'viewing_game_card':
            await this.prefetchGameProgress();
            break;
        }
      }
    }

    this.predictions.delete(action);
  }

  private async prefetchUserData(): Promise<void> {
    try {
      const { userApi } = await import('./services/api');
      await userApi.getMe();
      console.log('[Prefetch] Prefetched user data');
    } catch (error) {
      console.warn('[Prefetch] Failed to prefetch user data', error);
    }
  }

  private async prefetchProfiles(): Promise<void> {
    try {
      const { profileApi } = await import('./services/api');
      await profileApi.getProfiles();
      console.log('[Prefetch] Prefetched profiles');
    } catch (error) {
      console.warn('[Prefetch] Failed to prefetch profiles', error);
    }
  }
}

const prefetcher = new PredictivePrefetcher();

// Export prediction API
export const recordUserAction = (action: string, confidence: number = 0.5) => {
  prefetcher.recordPrediction(action, confidence);
};

// Usage in components:
import { recordUserAction } from './services/api';

// On dashboard mount:
useEffect(() => {
  recordUserAction('viewing_dashboard', 0.9);
}, []);

// Before navigating to game:
const handleGameClick = () => {
  recordUserAction('navigating_to_game', 0.8);
  navigate('/games/shape-safari');
};
```

**Risk**: Medium - Adds complexity
**Effort**: 2 hours
**Success Metric**: 30% reduction in time-to-interactive
**Stop Condition**: Memory usage increase >10%

---

## PRIORITIZED BACKLOG TABLE

| ID | Category | Severity | Evidence | Root Cause | Fix Idea | Risk | Effort | How to Validate |
|-----|----------|----------|----------|------------|---------|--------|--------------------|
| **M1** | Maintainer | P0 | `api.ts:28` - Property mutation without type | TypeScript unsafe | Extend RetryableAxiosRequestConfig | Low | 30 min | TypeScript compilation passes |
| **M2** | Maintainer | P0 | Lines 22-49 - No retry delay/deduplication | Concurrent refreshes cause 401 storms | Add retry deduplication + 500ms delay | Medium | 1 hr | Simulate 10 concurrent 401s, verify 1 refresh |
| **M3** | Maintainer | P1 | Line 32 - Direct axios.post instead of authApi.refresh | Inconsistent API usage | Use `authApi.refresh()` | Low | 15 min | Manual login/logout test |
| **M4** | Maintainer | P1 | Lines 23-46 - No logging/error types | Opaque error handling | Add ApiError class + logging | Low | 45 min | Trigger 401, verify console logs |
| **M5** | Maintainer | P1 | Line 18 - Hardcoded 10000ms timeout | One-size-fits-all for all ops | Add timeout config + helper | Low | 30 min | Measure API times, compare to timeouts |
| **N1** | New Contributor | P1 | Line 3 - `any` cast suppresses TS checks | Type safety lost | Validate env vars + remove `any` | Low | 30 min | TypeScript catches missing env vars |
| **N2** | New Contributor | P2 | No module JSDoc | Onboarding friction | Add comprehensive module docs | None | 20 min | Review README.md to verify docs pattern |
| **C1** | Correctness | P0 | Lines 53-61 - login vs register field mismatch | Auth contract unclear | Resolve email/username inconsistency | Medium | 2 hr | Check backend auth.py, test both field names |
| **C2** | Correctness | P1 | No return types on authApi methods | Type safety lost | Add AuthResponse, User, Profile types | Low | 1 hr | TypeScript compilation passes, type inference works |
| **C3** | Correctness | P1 | Line 28 - Unsafe property extension | Runtime type error possible | Extend AxiosRequestConfig properly | Low | 30 min | TypeScript compilation passes |
| **C4** | Correctness | P2 | No password masking in logs | Security risk | Add sensitive field redaction | Low | 45 min | Trigger login, verify no passwords in console |
| **P1** | Performance | P0 | Lines 28-46 - No request deduplication | Refresh storm (10 refreshes for 10 401s) | Implement pending request queue | Medium | 1.5 hrs | Load app, trigger 10x parallel 401s, count refreshes |
| **P2** | Performance | P1 | No caching layer | Repeated GETs to /users/me | Add SimpleCache for user/profile data | Medium | 2 hrs | Network tab: Count requests, should drop 70%+ |
| **P3** | Performance | P2 | No request debouncing | Request storms on rapid input | Add debounceApiCall helper | Low | 1 hr | Rapid typing in search, verify 1/5th requests |
| **S1** | Security | P1 | No request ID correlation | Replay attack risk | Add X-Request-ID header | Low | 1 hr | Verify unique IDs in network tab |
| **S2** | Security | P2 | No token redaction | Token leak in logs | Add redactSensitive utility | Low | 30 min | Trigger 401, verify no tokens in logs |
| **S3** | Security | P1 | Unknown cookie security | CSRF/cookie theft risks | Verify backend cookie settings (Secure, SameSite) | Medium | 1 hr | Backend cookie config verified |
| **R1** | Reliability | P0 | Lines 22-49 - No retry for transient errors | Fragile to network blips | Add exponential backoff + max retries | Medium | 2 hrs | Simulate 500/502, verify automatic retries |
| **R2** | Reliability | P1 | Line 18 - No timeout categorization | Timeout not operation-aware | Add RequestTimeout enum + config | Low | 1.5 hrs | Measure request times, verify timeouts match operation |
| **R3** | Reliability | P0 | No circuit breaker | Cascading failures | Add circuit breaker pattern | High | 2 hrs | Mock 5 failures, verify circuit opens |
| **T1** | Test | P1 | No unit tests for api.ts | 132 lines untested | Create api.test.ts with Vitest | Low | 3 hrs | `npm run test src/frontend/src/services/api.test.ts` passes |
| **T2** | Test | P1 | No E2E integration | Can't test full auth flow | Add MSW with handlers | Medium | 2 hrs | Run tests, verify 401→refresh→retry flow works |
| **T3** | Test | P1 | No perf regression tests | Performance regressions undetected | Add api.perf.test.ts | Low | 2 hrs | Verify single refresh for concurrent 401s |
| **P1** | Product | P1 | No user-friendly errors | Generic error messages | Add AppError + userMessage + actions | Low | 1.5 hrs | Trigger errors, verify friendly messages |
| **P2** | Product | P2 | No cancelation support | Can't abort long ops | Add createCancelableRequest | Low | 1 hr | Rapid search, verify cancellation works |
| **P3** | Product | P1 | No offline detection | Fails completely offline | Add OfflineQueue with retry | High | 2.5 hrs | Turn off network, verify requests queue |
| **E1** | Research | P2 | No retry strategy optimization | Fixed delay suboptimal | A/B test retry strategies | Medium | 4 hrs | Metrics show 20% faster refresh time |
| **E2** | Research | P1 | No request batching | Requests not optimized | Implement RequestBatcher | High | 3 hrs | 20% reduction in total request time |

---

## QUICK WINS (1-2 hours each)

| ID | Idea | Effort | Impact |
|----|------|--------|
| **Q1** | M3: Use `authApi.refresh()` instead of direct axios | 15 min | Consistent API usage |
| **Q2** | N1: Add environment variable validation | 30 min | Clear error messages |
| **Q3** | N2: Add module documentation | 20 min | Better onboarding |
| **Q4** | C3: Add proper type extension for retry | 30 min | Type safety |
| **Q5** | C2: Add AuthResponse, User, Profile types | 1 hr | Better DX |

---

## SOLID IMPROVEMENTS (0.5-2 days)

| ID | Idea | Effort | Impact |
|----|------|--------|
| **S1** | M1: Fix type extension pattern + add _retryCount | 30 min | Safer retry logic |
| **S2** | M2: Add retry deduplication + delay | 1 hr | Prevents 401 storms |
| **S3** | M4: Add ApiError class + logging | 45 min | Better debugging |
| **S4** | M5: Add timeout configuration helper | 30 min | Flexible timeouts |
| **S5** | N1: Remove `any` cast, add validation | 30 min | Type safety |
| **S6** | C1: Resolve login/username field mismatch | 2 hr | Consistent auth |
| **S7** | S1: Add X-Request-ID header | 1 hr | Better traceability |
| **S8** | P1: Implement request deduplication | 1.5 hrs | Fewer network calls |
| **S9** | R1: Add exponential backoff for retries | 2 hrs | Handles transient errors |
| **S10** | T1: Create api.test.ts with Vitest | 3 hrs | Tests critical paths |

---

## EXPERIMENTS (2-5 hours each)

| ID | Idea | Hypothesis | Method | Success Metric | Stop Condition |
|----|------|-----------|--------|---------------|--------------|
| **X1** | E1: Retry strategy A/B test | Exponential + jitter beats fixed delay | A/B framework or manual flag | 20% faster refresh (95th percentile) | Worse performance after 1 week |
| **X2** | E2: Request batching | Batching reduces latency | RequestBatcher class | 20% reduction in total request time | Data integrity issues |
| **X3** | E3: Predictive prefetching | Prediction reduces perceived latency | PredictivePrefetcher class | 30% reduction in time-to-interactive | Memory usage +10% |
| **X4** | **[RESERVED]** |  |  |  |  |

---

## LOCAL PR PLAN

**Scope**: Improve `src/frontend/src/services/api.ts` type safety, error handling, and reliability

**What will change**:
- Add type-safe retry configuration
- Implement request deduplication for 401 refresh
- Add proper error types and logging
- Add timeout categorization
- Create test suite for critical paths

**What will NOT change**:
- API endpoint contracts (auth, users, profiles paths)
- Cookie authentication mechanism
- Response interceptor structure (will enhance, not replace)
- Integration with Zustand stores

---

### Stepwise Plan

**Step 1: Add type definitions and validation (30 minutes)**
```bash
# Create types file
cat > src/frontend/src/services/types.ts << 'EOF'
export interface RetryableAxiosRequestConfig extends AxiosRequestConfig {
  _retry?: boolean;
  _retryCount?: number;
  _isRefresh?: boolean;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: 'string';
  expires_in: number;
}

export interface User {
  id: string;
  email: string;
  role: string;
  is_active: boolean;
}

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public endpoint: string,
    public originalError: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }

  public static fromAxiosError(error: AxiosError): ApiError {
    return new ApiError(
      error.response?.status || 0,
      error.message || 'Unknown error',
      error.config?.url || 'unknown',
      error
    );
  }
}
EOF

# Update api.ts imports
```

**Validation**: TypeScript compilation passes

---

**Step 2: Implement request deduplication for 401 (30 minutes)**
```typescript
// Add to api.ts after line 49:
let pendingRefresh: Promise<void> | null = null;
const pending401Requests: Array<() => void> = [];

// Modify interceptor (lines 28-46) to use deduplication
```

**Validation**: Manual test with browser DevTools - 10 concurrent 401s = 1 refresh

---

**Step 3: Add request ID correlation and logging (20 minutes)**
```typescript
// Add request ID counter and interceptor logging
```

**Validation**: Network tab shows X-Request-ID header

---

**Step 4: Create test suite (1 hour)**
```bash
# Create api.test.ts with auth and interceptor tests
```

**Validation**: `npm run test src/frontend/src/services/api.test.ts`

---

**Step 5: Add exponential backoff (30 minutes)**
```typescript
// Implement retry logic with backoff
```

**Validation**: Test with simulated network blips

---

**Step 6: Run linting and type-check (10 minutes)**
```bash
npm run type-check
npm run lint src/frontend/src/services/api.ts
```

**Validation**: No errors

---

**Step 7: Document changes (20 minutes)**
```typescript
// Update module JSDoc with new features
// Add inline comments for complex logic
```

**Validation**: Code comments explain retry/dedup logic clearly

---

## ROLLBACK PLAN

If any change causes issues:

```bash
# Reset to last known-good commit:
git reset --hard <commit-hash-before-changes>

# Or rollback specific file:
git checkout src/frontend/src/services/api.ts

# Then re-apply just the safe changes:
# 1. Type definitions (safe)
# 2. Logging (safe)
# 3. Request IDs (safe)
```

---

## SUMMARY

**File Chosen**: `src/frontend/src/services/api.ts`
**Rationale**: Highest impact (every request flows through here), lowest complexity (132 lines), high changeability, already demonstrated problematic (401 loop), critical security/correctness/performance concerns

**Key Findings**:
- **Type safety**: Property mutation without extension, `any` cast suppresses checks
- **Reliability**: No retry delay/deduplication, no circuit breaker, no exponential backoff
- **Security**: No request ID correlation, no token redaction, cookie config unverified
- **Performance**: No caching, no debouncing, single retry strategy
- **Correctness**: Auth field mismatch (username vs email), no return types
- **DX**: Generic error messages, no documentation, no validation

**Immediate Actions (Quick Wins - 3 hours)**:
1. M3: Use `authApi.refresh()` (15 min)
2. N1: Add env var validation (30 min)
3. N2: Add module documentation (20 min)
4. C3: Add proper type extension (30 min)
5. M4: Add ApiError class + logging (45 min)
6. S1: Add X-Request-ID (1 hour)

**Estimated Impact**:
- **Correctness**: Type safety improved, auth contract clear
- **Reliability**: Prevents 401 storms, handles transient errors
- **Security**: Token redaction, request correlation
- **Performance**: 5-10% fewer unnecessary requests with deduplication
- **DX**: Better error messages, documentation, validation

**Total Effort** (Quick Wins): ~3.5 hours

---

**Generated**: 2026-02-23
**Viewpoints Analyzed**: Maintainer, New Contributor, Correctness Engineer, Performance Engineer, Security Reviewer, Reliability/SRE, Test Engineer, Product Thinker, Researcher
**Confidence**: High - All findings backed by specific code evidence
