# Security & Privacy Policy

## Overview

This application is designed for a child (Advay) and prioritizes **safety, privacy, and parental control** above all else.

## Core Principles

1. **Local-First**: All data stays on the device by default
2. **Minimal Data**: Collect only what's necessary for functionality
3. **Parental Control**: Parents have full visibility and control
4. **Transparent**: Clear about what data is used and why
5. **No Third-Party Sharing**: No data sold or shared with advertisers

## Data Collection

### What We Collect

| Data | Purpose | Storage |
|------|---------|---------|
| Learning progress | Track advancement | Local SQLite |
| Game scores | Gamification | Local SQLite |
| Settings/preferences | User experience | Local SQLite |
| Error logs | Debugging | Local file (rotated) |

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

### Local Database

- **Location**: `~/.advay_learning/app.db` (platform-specific)
- **Encryption**: SQLCipher for database encryption (optional)
- **Backup**: Encrypted backups to parent-specified location

### Data Retention

| Data Type | Retention |
|-----------|-----------|
| Learning progress | Until explicitly deleted |
| Game history | Last 90 days |
| Error logs | 7 days |
| Temporary files | Session only |

## Authentication

### Parent Mode

- **Purpose**: Access settings, progress reports, data export
- **Method**: PIN or password (configurable)
- **Timeout**: Auto-lock after 5 minutes of inactivity

### Child Mode

- No authentication required
- Limited to learning activities only
- Cannot access settings or data export

## Optional Cloud Sync

### When Enabled (Explicit Opt-In)

- Encrypted sync to parent-controlled storage
- Options: iCloud, Google Drive, Dropbox, or custom
- Encryption key managed by parent
- No data stored on our servers

### Sync Data

Only learning progress and settings (never camera data).

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
| PyQt6 | UI framework | None |
| SQLite | Local storage | Local file only |

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
