# RESEARCH-011: Deployment & Distribution Strategy

**Status**: ✅ COMPLETE
**Date**: 2026-01-31
**Priority**: HIGH
**Scope**: App store distribution, PWA deployment, platform requirements for kids apps

---

## Executive Summary

This research covers practical deployment strategies for Advay Vision Learning across Google Play, Apple App Store, and direct PWA distribution. Focus is on **code-level compliance** with kids category requirements rather than enterprise certifications.

### Key Decisions
| Aspect | Recommendation | Rationale |
|--------|---------------|-----------|
| Primary Platform | Google Play (TWA) | 96%+ Android in India, TWA allows PWA distribution |
| Secondary Platform | Direct PWA | Instant updates, no store review delays |
| Apple Strategy | Phase 2 | Smaller market share in India, stricter requirements |
| Kids Category | Mandatory | Required for apps targeting under-13 |

---

## 1. Google Play Store - Designed for Families Program

### 1.1 Program Requirements (2025-2026)

The **Designed for Families** program is **mandatory** for apps targeting children under 13.

#### Eligibility Requirements
```
✅ App must be family-friendly
✅ COPPA/applicable child privacy law compliance
✅ No ads OR only certified ad SDK ads (Google-certified)
✅ No in-app purchases that exploit children
✅ Age-appropriate content only
✅ Clear privacy policy
```

#### For Advay Vision Learning
| Requirement | Our Approach | Status |
|-------------|--------------|--------|
| Family-friendly | Educational games, no violence | ✅ Ready |
| COPPA compliance | No data collection from children | ✅ Ready |
| No ads | No ads in app | ✅ Ready |
| IAP policy | Parents manage purchases | 🔧 Implement |
| Privacy policy | Create child-focused policy | 🔧 Create |

### 1.2 Teacher Approved Program (Optional)

Google's **Teacher Approved** badge is optional but valuable for visibility:
- Apps reviewed by teachers and child development specialists
- Higher visibility in family-focused searches
- Credibility with parents

**Recommendation**: Apply for Teacher Approved after v1.0 launch and positive reviews.

### 1.3 Upcoming State Laws Affecting Google Play

| State | Law | Effective Date | Key Requirement |
|-------|-----|----------------|-----------------|
| Texas | SCOPE Act | Jan 1, 2026 | Parental consent, no targeted ads to minors |
| Utah | UCPPA | May 1, 2026 | Default privacy settings for minors |
| Louisiana | LA Act 440 | July 1, 2026 | Age verification for certain content |

**Code Implication**: Build age-gate and parental consent into core architecture now.

### 1.4 TWA (Trusted Web Activity) Distribution

Publish PWA to Google Play Store using TWA:

```bash
# Using Bubblewrap CLI
npx @aspect/aspect-cli init
# OR
npx @nickytonline/pwa-to-play-store
```

#### TWA Benefits
| Benefit | Details |
|---------|---------|
| PWA in Play Store | Users find app in familiar store |
| Instant Updates | Updates bypass store review |
| Smaller APK | Just a wrapper (~2-3MB) |
| Same Codebase | No separate Android codebase |

#### TWA Requirements
```javascript
// Required in manifest.json
{
  "display": "standalone",
  "start_url": "/",
  "scope": "/",
  "theme_color": "#...",
  "background_color": "#..."
}

// Required: Digital Asset Links
// .well-known/assetlinks.json on your domain
[{
  "relation": ["delegate_permission/common.handle_all_urls"],
  "target": {
    "namespace": "android_app",
    "package_name": "com.advay.vision.learning",
    "sha256_cert_fingerprints": ["..."]
  }
}]
```

---

## 2. Apple App Store - Kids Category

### 2.1 Kids Category Requirements (Stricter than Google)

Apple's Kids Category has **non-negotiable** requirements:

#### Hard Requirements
```
❌ NO third-party analytics (including Firebase Analytics)
❌ NO third-party advertising
❌ NO links to external websites
❌ NO social media integration
❌ NO in-app communications
❌ NO data collection without parental gate
```

#### Code Implications for iOS Build
```typescript
// Conditional feature loading
const isAppleKidsCategory = process.env.APPLE_KIDS_BUILD === 'true';

if (!isAppleKidsCategory) {
  // Only load analytics in non-Kids builds
  initializeAnalytics();
}

// Parental gate for any external links
const openExternalLink = (url: string) => {
  if (isAppleKidsCategory) {
    showParentalGate(() => window.open(url));
  } else {
    window.open(url);
  }
};
```

### 2.2 New Age Ratings (Effective Jan 31, 2026)

Apple introduces new age rating categories:
- **4+**: Current kids category
- **13+**: New teenage category
- **16+**: New mature teens
- **18+**: Adults only

**Advay Action**: Submit as **4+** (suitable for all ages).

### 2.3 App Store Connect Setup

```
Age Rating: 4+
Category: Education > Early Learning
Contains: No objectionable content
Kids Category: Yes (ages 5 and under OR 6-8)
Parental Gate: Required for purchases
Privacy Nutrition Labels: Complete disclosure
```

### 2.4 India-Specific Considerations

| Factor | Impact |
|--------|--------|
| iOS Market Share | ~3-5% in India |
| Premium Pricing | Apple users more likely to pay |
| Review Times | 24-48 hours (faster than Google) |
| TestFlight | Easy beta distribution |

**Recommendation**: iOS as Phase 2 after Android traction proven.

---

## 3. Direct PWA Distribution

### 3.1 PWA Installation Flow

```typescript
// Service Worker for offline capability
// sw.js
const CACHE_NAME = 'advay-vision-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/static/js/main.js',
  '/static/css/main.css',
  // MediaPipe models for offline
  '/models/hand_landmarker.task',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS_TO_CACHE))
  );
});

// manifest.json
{
  "name": "Advay Vision Learning",
  "short_name": "Advay",
  "description": "Camera-based learning games for kids",
  "start_url": "/",
  "display": "standalone",
  "orientation": "portrait",
  "theme_color": "#6B46C1",
  "background_color": "#FAF5FF",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

### 3.2 Install Prompt UX

```typescript
// Deferred install prompt
let deferredPrompt: BeforeInstallPromptEvent | null = null;

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  showInstallButton();
});

const installApp = async () => {
  if (!deferredPrompt) return;

  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;

  if (outcome === 'accepted') {
    trackEvent('pwa_installed');
  }
  deferredPrompt = null;
};
```

### 3.3 PWA vs Native Comparison

| Feature | PWA | Native (TWA) |
|---------|-----|--------------|
| Discoverability | Lower | Play Store listing |
| Updates | Instant | Instant (TWA) |
| Permissions | Limited | Full Android |
| Offline | Yes | Yes |
| Push Notifications | Yes | Yes |
| Camera Access | Yes | Yes |

---

## 4. Version Management & Updates

### 4.1 Semantic Versioning

```
MAJOR.MINOR.PATCH
  1.0.0 - Initial release
  1.1.0 - New game added
  1.1.1 - Bug fix
  2.0.0 - Breaking change (new learning system)
```

### 4.2 Update Strategy

```typescript
// Version check on app start
const checkForUpdates = async () => {
  const response = await fetch('/version.json');
  const { version, forceUpdate } = await response.json();

  if (version !== APP_VERSION) {
    if (forceUpdate) {
      // Critical update - force reload
      showCriticalUpdateModal(() => window.location.reload(true));
    } else {
      // Optional update - show banner
      showUpdateAvailableBanner();
    }
  }
};
```

### 4.3 Rollback Strategy

```typescript
// Keep previous version cached
const VERSIONS_TO_KEEP = 2;

const cleanupOldVersions = async () => {
  const keys = await caches.keys();
  const versionKeys = keys.filter(k => k.startsWith('advay-vision-v'));

  if (versionKeys.length > VERSIONS_TO_KEEP) {
    const oldVersions = versionKeys.slice(0, -VERSIONS_TO_KEEP);
    await Promise.all(oldVersions.map(k => caches.delete(k)));
  }
};
```

---

## 5. Launch Checklist

### 5.1 Pre-Launch (Week -2)

```
□ Privacy policy URL live
□ Support email configured
□ App icons all sizes (48, 72, 96, 144, 192, 512)
□ Feature graphics (1024x500)
□ Screenshots (phone + tablet)
□ Short description (80 chars)
□ Full description (4000 chars)
□ Content rating questionnaire completed
□ Data safety form completed
```

### 5.2 Google Play Submission

```
□ Create Google Play Developer account (₹1,900 one-time)
□ Set up app in Play Console
□ Complete Designed for Families questionnaire
□ Upload signed AAB/APK (TWA)
□ Submit for review (3-7 days typically)
□ Set up staged rollout (10% → 50% → 100%)
```

### 5.3 Post-Launch (Week +1)

```
□ Monitor crash reports (Play Console)
□ Respond to reviews within 24 hours
□ Track install → first game completion funnel
□ Collect feedback for v1.1
□ Apply for Teacher Approved (after 50+ installs)
```

---

## 6. Pricing & Regions

### 6.1 Initial Launch Markets

| Priority | Market | Rationale |
|----------|--------|-----------|
| 1 | India | Primary market, Hindi/Kannada content |
| 2 | USA | English content, higher ARPU |
| 3 | UK/AU/CA | English content, similar ARPU to US |

### 6.2 Currency & Pricing

```javascript
const PRICING = {
  INR: { monthly: 199, yearly: 999 },
  USD: { monthly: 4.99, yearly: 29.99 },
  GBP: { monthly: 3.99, yearly: 24.99 },
};

// Localized pricing in Play Console
// Use Google's recommended prices per region
```

---

## 7. Implementation Priorities

### 7.1 Must-Have for Launch

| Item | Owner | Status |
|------|-------|--------|
| Privacy Policy page | Legal/Dev | 🔧 TODO |
| Parental gate for purchases | Frontend | 🔧 TODO |
| Age gate on first launch | Frontend | 🔧 TODO |
| manifest.json complete | Frontend | ✅ Exists |
| Service worker | Frontend | 🔧 TODO |
| TWA build setup | DevOps | 🔧 TODO |

### 7.2 Nice-to-Have Post-Launch

| Item | Priority |
|------|----------|
| Apple App Store submission | P2 |
| Teacher Approved application | P3 |
| Multiple language store listings | P2 |
| A/B test store screenshots | P3 |

---

## 8. References & Resources

### Official Documentation
- [Google Play Families Policy](https://support.google.com/googleplay/android-developer/answer/9893335)
- [Apple Kids Category Guidelines](https://developer.apple.com/app-store/kids-apps/)
- [PWA Criteria](https://web.dev/install-criteria/)
- [Bubblewrap TWA](https://github.com/aspect/aspect)

### Tools
- [PWA Builder](https://www.pwabuilder.com/) - Generate TWA from PWA
- [Maskable.app](https://maskable.app/) - Icon generator
- [Play Console](https://play.google.com/console)

---

**Last Updated**: 2026-01-31
**Next Review**: Before v1.0 launch
**Related**: RESEARCH-012-SAFETY-MODERATION.md, RESEARCH-002-MONETIZATION.md
