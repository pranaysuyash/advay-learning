# Project Setup Verification Prompt

Use this prompt when setting up the project for the first time or when ports/configuration need to change.

## Pre-Flight Checklist

Before running the app, verify:

### 1. Port Availability
```bash
# Check if ports are free
lsof -i :8000  # or 8001, 8002, etc.
lsof -i :5173  # or 6173, etc.
```

### 2. Backend Configuration
File: `src/backend/.env`

Required fields:
- `SECRET_KEY` - Any string for dev
- `DATABASE_URL` - SQLite path or PostgreSQL URL
- `ALLOWED_ORIGINS` - MUST include frontend URL

**CRITICAL: CORS Configuration**
The `ALLOWED_ORIGINS` must include the exact frontend URL including port:
```
# If frontend runs on localhost:6173
ALLOWED_ORIGINS=["http://localhost:6173"]

# If frontend runs on localhost:5173  
ALLOWED_ORIGINS=["http://localhost:5173"]

# Multiple origins
ALLOWED_ORIGINS=["http://localhost:6173","http://localhost:5173"]
```

### 3. Frontend Configuration
File: `src/frontend/.env` (create if doesn't exist)

```bash
VITE_API_BASE_URL=http://localhost:8001  # Match backend port
```

### 4. Verification Commands

```bash
# 1. Check backend CORS config
grep "ALLOWED_ORIGINS" src/backend/.env

# 2. Check frontend API URL
cat src/frontend/.env

# 3. Verify ports in docs
grep -E "800[0-9]|5173|6173" docs/QUICKSTART.md
```

## Common Issues & Fixes

### CORS Error
```
Access to XMLHttpRequest blocked by CORS policy
```
**Fix:** Add frontend URL to `src/backend/.env` ALLOWED_ORIGINS

### Port Already in Use
```
Error: Address already in use
```
**Fix:** Change port in both backend command AND frontend .env

### Connection Refused
```
net::ERR_CONNECTION_REFUSED
```
**Fix:** 
1. Check backend is running
2. Verify ports match between frontend .env and backend
3. Check firewall settings

## Setup Steps

1. **Choose ports** (check availability first)
   - Backend: 8000, 8001, 8002, etc.
   - Frontend: 5173, 6173, etc.

2. **Configure backend** (`src/backend/.env`)
   ```
   ALLOWED_ORIGINS=["http://localhost:FRONTEND_PORT"]
   ```

3. **Configure frontend** (`src/frontend/.env`)
   ```
   VITE_API_BASE_URL=http://localhost:BACKEND_PORT
   ```

4. **Update documentation** (`docs/QUICKSTART.md`)
   - Reflect chosen ports
   - Update all port references

5. **Verify before starting**
   ```bash
   # Check backend config
grep ALLOWED_ORIGINS src/backend/.env
   
   # Check frontend config
cat src/frontend/.env
   
   # Check docs
grep -E "(800[0-9]|5173|6173)" docs/QUICKSTART.md | head -5
   ```

## Evidence to Record

When updating ports/config, append to WORKLOG_TICKETS.md:
- Ports chosen
- CORS origins updated
- Files modified
- Verification commands run
