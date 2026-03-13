# Supported Device Matrix - March 12, 2026

## Public Beta Support Promise

The March 31, 2026 public beta officially supports these device/browser combinations:

- Android phones and tablets: Chrome current major and previous major
- iPhone and iPad: Safari current major and previous major
- Desktop macOS and Windows: Chrome, Edge, and Safari current major and previous major
- Firefox: best effort only during beta

## Camera and Input Expectations

- Camera-based games require HTTPS, camera permission, and a modern evergreen browser
- Stored child photos are disabled for beta; camera use is on-device only
- Touch-first mobile play is the primary target for parent flows and many games
- Keyboard/mouse fallback exists for selected games but is not the primary support promise

## Launch Validation Surfaces

Before launch freeze, verify on at least one real device in each primary cohort:

1. Android Chrome phone
2. iPhone Safari
3. iPad Safari
4. Desktop Chrome
5. Desktop Safari or Edge

## Must-pass Flows Per Cohort

1. Landing page, pricing/beta messaging, privacy, terms, support
2. Register, verify email, login
3. Create child profile and complete consent
4. Launch at least one shipped beta game
5. Confirm progress persists after reload/login
6. Export data from Settings

## Known Beta Constraints

- The current beta roster is fully enabled; route holdbacks should only be reintroduced with explicit launch-risk evidence and a worklog update
- Any game that regresses on progress, access, or device compatibility must be fixed or deliberately removed from the shipped roster before launch
- 3D game routes are intentionally excluded from the March public beta build unless `VITE_BETA_3D_GAMES_ENABLED=true` is explicitly enabled for a later release wave
- Firefox should not be marketed as a guaranteed platform until the launch roster is smoke-tested there
