# Security & Privacy Policy

## Overview

This application is designed for a child (Advay) and prioritizes **safety, privacy, and parental control** above all else.

## Core Principles

1. **Privacy-First**: Minimal data collection, parental control over all stored data
2. **Minimal Data**: Collect only what's necessary for functionality
3. **Parental Control**: Parents have full visibility and control
4. **Transparent**: Clear about what data is used and why
5. **No Third-Party Sharing**: No data sold or shared with advertisers

## Data Collection

### What We Collect

| Data | Purpose | Storage | Retention |
|------|---------|---------|-----------|
| Learning progress | Track advancement | PostgreSQL (backend) | Until account deletion |
| Game scores | Gamification | PostgreSQL (backend) | 90 days |
| Settings/preferences | User experience | PostgreSQL (backend) | Until account deletion |
| User account (email, hashed password) | Authentication | PostgreSQL (backend) | Until account deletion |
| Child profiles (name, age, avatar) | Personalization | PostgreSQL (backend) | Until profile deletion |
| Error logs | Debugging | Local file (rotated) | 7 days |

### Authentication Data

- **Parent accounts**: Email and bcrypt-hashed passwords stored in PostgreSQL
- **JWT tokens**: Short-lived access tokens (15 min) and refresh tokens (7 days) stored in HTTP-only cookies
- **Session management**: Refresh tokens tracked in database for revocation
- **No PIN-based local auth**: Previous local-first PIN authentication has been replaced with secure web authentication

### What We DON'T Collect

- ❌ Video footage from camera
- ❌ Audio recordings
- ❌ Personal identifiable information (name, age, location)
- ❌ Device identifiers
- ❌ Usage analytics for third parties
- ❌ Photos or screenshots

## Camera Usage

### How Camera Data is Handled

```
Camera Feed
    ↓
[In-Memory Processing Only]
    ↓
Hand/Face Landmarks Extracted
    ↓
Original Frame Discarded
    ↓
Landmarks Used for Interaction
```

**Key Points:**

- Camera frames are processed in real-time
- No frames are stored to disk
- No frames are transmitted over network
- Processing happens locally using MediaPipe
- Camera can be disabled anytime

### Camera Permissions

- Explicit permission requested on first use
- Permission can be revoked in system settings
- App functions gracefully without camera (limited mode)
- Visual indicator when camera is active

## Storage Security

### Backend Database (PostgreSQL)

- **Type**: PostgreSQL 17+
- **Location**: Cloud-hosted or self-managed PostgreSQL instance
- **Encryption**: 
  - Transport: TLS 1.2+ for all connections
  - At-rest: Per database provider (AWS RDS, Google Cloud SQL, etc.)
- **Backup**: Automated daily backups with 30-day retention
- **Access**: 
  - API access via JWT token authentication
  - Database credentials stored in environment variables
  - No direct database access from frontend

### Data Access Controls

- **Row-level security**: Users can only access their own data and their children's profiles
- **API authorization**: All endpoints require valid JWT tokens
- **Rate limiting**: API requests are rate-limited to prevent abuse
- **Audit logging**: Security events (login, password changes) are logged

### Data Retention

| Data Type | Retention | Deletion Method |
|-----------|-----------|-----------------|
| User account + profiles | Until account deletion | Parent-initiated account deletion |
| Learning progress | Until account deletion | Cascading delete with account |
| Game history | 90 days | Automatic purge after 90 days |
| Refresh tokens | 7 days or on logout | Automatic expiry or revocation |
| Error logs | 7 days | Automatic rotation |
| Temporary files | Session only | Automatic cleanup |

### Right to Deletion

Parents can request complete account deletion which removes:
- User account and authentication credentials
- All child profiles
- All learning progress and game history
- All settings and preferences

Deletion is permanent and cannot be undone.

## Authentication

### Web-Based Authentication

- **Registration**: Email verification required before first login
- **Login**: Email + password with account lockout protection (5 failed attempts)
- **Session Management**: JWT access tokens (15-minute expiry) + refresh tokens (7-day expiry)
- **Token Storage**: HTTP-only, Secure, SameSite=Lax cookies
- **Password Security**: bcrypt hashing with 12 rounds
- **Auto-logout**: Token expiry enforces re-authentication

### Parent Features (Post-Login)

- **Settings access**: Full control over account and child profiles
- **Progress reports**: View all stored learning data
- **Data export**: JSON/CSV export of all account data
- **Account deletion**: Complete data removal on request

### Child Access

- Child profiles are managed under parent accounts
- No separate authentication required for children
- Child mode is a UI state, not an authentication tier

## Optional Cloud Sync

### When Enabled (Explicit Opt-In)

- Encrypted sync to parent-controlled storage
- Options: iCloud, Google Drive, Dropbox, or custom
- Encryption key managed by parent
- No data stored on our servers

### Sync Data

Only learning progress and settings (never camera data).

## CORS (Cross-Origin Resource Sharing) Policy

### Current Configuration

The backend CORS is configured in `src/backend/app/main.py`:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,  # Default: ["http://localhost:5173", "http://localhost:3000"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Security Considerations

⚠️ **WARNING**: The current configuration allows:

- All HTTP methods (`["*"]`)
- All headers (`["*"]`)
- Credentials (cookies, auth headers)

**Risk**: If `ALLOWED_ORIGINS` is set to `["*"]` (wildcard) with `allow_credentials=True`, this creates a security vulnerability where malicious websites could make authenticated requests.

### Recommended Configurations

**Development (Safe)**:

```python
ALLOWED_ORIGINS=["http://localhost:5173", "http://localhost:3000"]
allow_credentials=True
allow_methods=["GET", "POST", "PUT", "DELETE"]
allow_headers=["Authorization", "Content-Type"]
```

**Production (Safe)**:

```python
ALLOWED_ORIGINS=["https://yourdomain.com"]  # Explicit domains only
allow_credentials=True
allow_methods=["GET", "POST", "PUT", "DELETE"]
allow_headers=["Authorization", "Content-Type"]
allow_origin_regex=None  # Don't use regex in production
```

**Unsafe (DO NOT USE)**:

```python
ALLOWED_ORIGINS=["*"]  # Wildcard with credentials = DANGEROUS
allow_credentials=True
```

### Runtime Safety Check

The application logs a warning on startup if potentially dangerous CORS config is detected:

```python
if "*" in settings.ALLOWED_ORIGINS and allow_credentials:
    logger.warning("CORS: Wildcard origin with credentials is insecure!")
```

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `ALLOWED_ORIGINS` | `http://localhost:5173,http://localhost:3000` | Comma-separated list of allowed origins |

### Best Practices

1. **Never use wildcard (`*`) with credentials** in production
2. **Explicitly list domains** that need access
3. **Limit HTTP methods** to only those needed (GET, POST, etc.)
4. **Limit headers** to only those needed
5. **Regular audits** of CORS configuration

---

## Network Security

### Default: Offline

Application works completely offline by default.

### Optional Online Features

If online features are added (e.g., pronunciation audio):

- HTTPS only
- No tracking cookies
- Minimal data transmission
- Parental approval required

## Third-Party Dependencies

### Current Dependencies

| Package | Purpose | Data Access |
|---------|---------|-------------|
| MediaPipe | Hand/face tracking | Local processing only |
| OpenCV | Image processing | Local processing only |
| SQLAlchemy | Database ORM | PostgreSQL via API |
| PostgreSQL | Backend storage | Structured data (users, progress, profiles) |

### Dependency Security

- Pin exact versions in `requirements.txt`
- Regular security audits: `pip-audit`
- Minimal dependency tree
- Prefer well-maintained, audited libraries

## Privacy Controls

### Parent Dashboard

Accessible via Parent Mode:

- View all stored data
- Export data (JSON, CSV)
- Delete all data
- Configure sync settings
- View privacy audit log

### Privacy Audit Log

Records:

- When camera was accessed
- Data export events
- Settings changes
- Sync operations

## Incident Response

### Reporting Security Issues

1. Document the issue
2. Assess impact
3. Fix and test
4. Update documentation
5. Notify if data was affected

### Data Breach Response

Since data is local-only, breaches would require device compromise:

1. Guide parent through data audit
2. Provide data export/deletion tools
3. Update security recommendations

## Compliance

### Children's Privacy

- Designed for parental supervision
- No COPPA concerns (no online collection)
- No GDPR concerns (no personal data)

### Recommendations for Parents

1. **Device Security**: Keep operating system updated
2. **User Accounts**: Use separate user account for child
3. **Supervision**: Monitor child's app usage
4. **Backups**: Regular encrypted backups
5. **Review**: Periodically review stored progress data

## Security Checklist

### Development

- [ ] No hardcoded secrets
- [ ] Input validation on all user inputs
- [ ] Safe file path handling
- [ ] No SQL injection vulnerabilities (parameterized queries)
- [ ] No code injection vulnerabilities

### Release

- [ ] Dependencies audited
- [ ] No debug code left in
- [ ] Logging doesn't expose sensitive data
- [ ] Database migrations are safe

## Future Security Enhancements

- [ ] Database encryption by default
- [ ] Biometric auth for Parent Mode
- [ ] Time-based access controls
- [ ] Content filtering options

## Questions?

For security concerns or questions about this policy, refer to the project documentation or create an issue.
