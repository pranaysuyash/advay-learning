# RESEARCH-012: Safety & Content Moderation

**Status**: ✅ COMPLETE
**Date**: 2026-01-31
**Priority**: CRITICAL
**Scope**: Code-level safety standards for children's apps, legal compliance without enterprise certifications

---

## Executive Summary

This document focuses on **practical, code-implementable safety measures** to protect children and comply with COPPA (USA) and DPDP Act (India). No enterprise certifications (ISO, kidSAFE, etc.) are in scope—only code standards that prevent legal issues.

### The Simple Rule
>
> **Collect nothing. Store nothing. Track nothing.**
> If you don't have the data, you can't violate privacy laws.

---

## 1. Legal Framework Overview

### 1.1 COPPA 2025 (USA)

**Children's Online Privacy Protection Act** - Updated rules effective **June 23, 2025**.

| Requirement | What It Means | Our Approach |
|-------------|---------------|--------------|
| Verifiable Parental Consent | Must get parent approval before collecting data from under-13 | Don't collect ANY data |
| Biometric Data Included | Camera/face data now explicitly covered | Process locally, never upload |
| Data Retention Limits | Can only keep data as long as necessary | Keep nothing |
| New Consent Methods | Knowledge-based auth, photo ID, text-plus | Not needed if no collection |
| Right to Delete | Parents can request deletion | Nothing to delete |

#### COPPA Penalties

- Up to **$50,000+ per violation**
- FTC actively enforcing in 2025-2026
- Class action lawsuit risk

### 1.2 India DPDP Act (Digital Personal Data Protection)

**Full compliance required by May 2027**, but children's provisions active now.

| Requirement | Details | Our Approach |
|-------------|---------|--------------|
| Children = Under 18 | Not 13 like COPPA | Apply to all users |
| Verifiable Parental Consent | Mandatory for children's data | Age gate + no data collection |
| No Behavioral Tracking | Cannot track/target children | No analytics on children |
| No Harmful Processing | Cannot process data detrimental to child | Educational content only |
| Data Fiduciary Obligations | Heavy responsibilities if you hold data | Hold no data |

#### DPDP Penalties

- Up to **₹250 crore (~$30M USD)** for violations
- Data Protection Board can investigate
- Reputational damage in Indian market

### 1.3 The Safest Path

```
┌─────────────────────────────────────────────┐
│     IF data_collected == 0:                 │
│         violations_possible = 0             │
│         legal_risk = "minimal"              │
└─────────────────────────────────────────────┘
```

---

## 2. Code-Level Safety Architecture

### 2.1 Data Flow Principle

```
SAFE ARCHITECTURE:
┌──────────┐     ┌──────────┐     ┌──────────┐
│  Camera  │ ──► │ MediaPipe│ ──► │  Game    │
│  Feed    │     │ (Local)  │     │  Logic   │
└──────────┘     └──────────┘     └──────────┘
     │                │                │
     ▼                ▼                ▼
   [NEVER           [Landmarks       [Scores/
    STORED]          only, no         Progress
                     images]          LOCAL]


UNSAFE (DON'T DO):
┌──────────┐     ┌──────────┐     ┌──────────┐
│  Camera  │ ──► │  Server  │ ──► │ Database │
│  Feed    │     │  Upload  │     │  Storage │
└──────────┘     └──────────┘     └──────────┘
     │                │                │
     ▼                ▼                ▼
   [LEGAL           [LEGAL           [LEGAL
    RISK]            RISK]            RISK]
```

### 2.2 Camera Data Handling

```typescript
// CRITICAL: Camera frames NEVER leave the device

// MediaPipe processes frames locally
const processFrame = async (videoFrame: ImageData) => {
  // ✅ SAFE: Processing happens in browser
  const results = await handLandmarker.detect(videoFrame);

  // ✅ SAFE: Only landmarks (coordinates), no image data
  return results.landmarks;

  // ❌ NEVER DO: uploadToServer(videoFrame)
  // ❌ NEVER DO: saveToStorage(videoFrame)
  // ❌ NEVER DO: sendToAnalytics(videoFrame)
};

// Explicit safeguard
const assertNoFrameUpload = () => {
  if (process.env.NODE_ENV === 'development') {
    // Audit network requests for image uploads
    const originalFetch = window.fetch;
    window.fetch = async (url, options) => {
      if (options?.body instanceof Blob ||
          options?.body?.includes?.('data:image')) {
        console.error('🚨 BLOCKED: Attempted image upload');
        throw new Error('Image uploads are prohibited');
      }
      return originalFetch(url, options);
    };
  }
};
```

### 2.3 No Personal Data Collection

```typescript
// types/user.ts
interface LocalUserData {
  // ✅ SAFE: Pseudonymous, local only
  id: string;              // Random UUID, not linked to identity
  displayName: string;     // Parent-set, like "Advay"
  avatarId: number;        // Selected character, not photo

  // ❌ NEVER COLLECT:
  // email: string;        // PII
  // phone: string;        // PII
  // photo: string;        // Biometric
  // location: GeoPoint;   // Sensitive
  // birthdate: Date;      // Age indicator
}

// Generate anonymous user ID
const generateAnonymousId = (): string => {
  // Random UUID - cannot be traced back to person
  return crypto.randomUUID();
};

// What we DO store (locally only)
interface LocalProgress {
  lessonId: string;
  score: number;
  completedAt: number;  // timestamp
  attempts: number;
}
```

### 2.4 Local-Only Storage

```typescript
// All data stays on device
const storage = {
  // ✅ IndexedDB - local to device
  async saveProgress(progress: LocalProgress): Promise<void> {
    const db = await openDB('advay-progress', 1);
    await db.put('progress', progress);
  },

  // ✅ LocalStorage - local to device
  saveSettings(settings: AppSettings): void {
    localStorage.setItem('settings', JSON.stringify(settings));
  },

  // ❌ NEVER: Firebase, Supabase, any cloud storage for child data
};

// Export for parent (on their device)
const exportProgressReport = async (): Promise<Blob> => {
  const progress = await storage.getAllProgress();
  const report = generatePDFReport(progress);
  // Parent downloads locally - no server involved
  return report;
};
```

---

## 3. Age Gate Implementation

### 3.1 Simple Age Gate (Not Age Verification)

```typescript
// Simple age gate - not trying to verify, just asking
interface AgeGateProps {
  onAdultConfirmed: () => void;
  onChildMode: () => void;
}

const AgeGate: React.FC<AgeGateProps> = ({ onAdultConfirmed, onChildMode }) => {
  return (
    <div className="age-gate">
      <h2>Who's using this app?</h2>

      <button
        onClick={onChildMode}
        className="child-button"
      >
        <span className="icon">👶</span>
        I'm a Kid
      </button>

      <button
        onClick={() => showParentalChallenge(onAdultConfirmed)}
        className="adult-button"
      >
        <span className="icon">👨‍👩‍👧</span>
        I'm a Parent/Guardian
      </button>
    </div>
  );
};
```

### 3.2 Parental Gate (Math Challenge)

```typescript
// Parental gate - simple challenge a young child can't solve
const ParentalGate: React.FC<{ onSuccess: () => void }> = ({ onSuccess }) => {
  const [answer, setAnswer] = useState('');

  // Generate random math problem
  const [num1] = useState(() => Math.floor(Math.random() * 20) + 10);
  const [num2] = useState(() => Math.floor(Math.random() * 20) + 10);
  const correctAnswer = num1 + num2;

  const handleSubmit = () => {
    if (parseInt(answer) === correctAnswer) {
      onSuccess();
    } else {
      setAnswer('');
      // No punishment, just try again
    }
  };

  return (
    <div className="parental-gate">
      <p>To continue, please solve:</p>
      <p className="math-problem">{num1} + {num2} = ?</p>
      <input
        type="number"
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        placeholder="Enter answer"
      />
      <button onClick={handleSubmit}>Continue</button>
    </div>
  );
};
```

### 3.3 When to Show Parental Gate

```typescript
const PARENTAL_GATE_TRIGGERS = [
  'access_settings',
  'make_purchase',
  'view_external_link',
  'export_data',
  'delete_profile',
  'change_subscription',
];

const requiresParentalGate = (action: string): boolean => {
  return PARENTAL_GATE_TRIGGERS.includes(action);
};

// Usage
const handleSettingsClick = () => {
  if (requiresParentalGate('access_settings')) {
    showParentalGate(() => navigateTo('/settings'));
  }
};
```

---

## 4. Content Safety

### 4.1 Content Review Checklist

All game content must pass this checklist:

```markdown
## Content Review Checklist

### Visual Content
- [ ] No violence or weapons
- [ ] No scary imagery (monsters, ghosts, etc.)
- [ ] No inappropriate body imagery
- [ ] Characters are age-appropriate (animals, friendly robots)
- [ ] Colors are calming, not overwhelming
- [ ] No flashing lights (seizure risk)

### Audio Content
- [ ] No sudden loud sounds
- [ ] No scary music or sound effects
- [ ] Voice-overs are warm and encouraging
- [ ] No background music that's distracting

### Text Content
- [ ] All text is age-appropriate
- [ ] No complex vocabulary without explanation
- [ ] No negative or discouraging messages
- [ ] Instructions are simple and clear

### Gameplay
- [ ] No time pressure that causes stress
- [ ] No punishment for mistakes
- [ ] No competitive elements against other users
- [ ] Progress is always positive
```

### 4.2 Safe Feedback Messages

```typescript
// Feedback that's always positive
const FEEDBACK_MESSAGES = {
  correct: [
    "Great job! 🌟",
    "You did it!",
    "Wonderful!",
    "That's right!",
    "Amazing!",
  ],

  tryAgain: [
    "Almost! Try again",
    "So close! One more try",
    "Let's try that again",
    "You're learning!",
  ],

  // ❌ NEVER USE:
  // "Wrong!"
  // "You failed"
  // "Game over"
  // "You lost"
  // "Too slow"
};

const getRandomFeedback = (type: 'correct' | 'tryAgain'): string => {
  const messages = FEEDBACK_MESSAGES[type];
  return messages[Math.floor(Math.random() * messages.length)];
};
```

### 4.3 No External Links Without Gate

```typescript
// All external links require parental gate
const SafeLink: React.FC<{ href: string; children: React.ReactNode }> = ({
  href,
  children,
}) => {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();

    showParentalGate(() => {
      // Parent confirmed - open link
      window.open(href, '_blank', 'noopener,noreferrer');
    });
  };

  return (
    <a href={href} onClick={handleClick}>
      {children}
    </a>
  );
};

// In Kids Category build (Apple), external links are hidden entirely
const ExternalLink: React.FC<Props> = (props) => {
  if (process.env.KIDS_CATEGORY_BUILD === 'true') {
    return null; // Don't render external links at all
  }
  return <SafeLink {...props} />;
};
```

---

## 5. Analytics & Tracking Policy

### 5.1 What We CAN Track (Aggregated, Anonymous)

```typescript
// ✅ SAFE: Aggregate, anonymous metrics
const trackAnonymousEvent = (event: string, value?: number) => {
  // Only if parent opted in during setup
  if (!hasParentalAnalyticsConsent()) return;

  // Send only aggregate data, no user identifiers
  analytics.track({
    event,
    value,
    // ❌ NO user_id
    // ❌ NO device_id
    // ❌ NO session_id
    // ❌ NO IP address (anonymize at edge)
    timestamp: Date.now(),
    appVersion: APP_VERSION,
  });
};

// Example: Track which games are popular (not who plays them)
trackAnonymousEvent('game_completed', { game: 'alphabet_touch' });
```

### 5.2 What We CANNOT Track

```typescript
// ❌ PROHIBITED - Never implement these
const PROHIBITED_TRACKING = [
  'user_id',           // Personal identifier
  'device_id',         // Device fingerprinting
  'advertising_id',    // IDFA/GAID
  'ip_address',        // Location indicator
  'session_recording', // Screen capture
  'heatmaps',          // Interaction patterns
  'crash_with_pii',    // Crash reports with user data
  'performance_user',  // Performance tied to user
  'ab_test_user',      // A/B tests tied to user
];

// Safeguard: Strip PII from any outgoing requests
const sanitizeAnalyticsPayload = (payload: object): object => {
  const sanitized = { ...payload };

  PROHIBITED_TRACKING.forEach(field => {
    delete sanitized[field];
  });

  return sanitized;
};
```

### 5.3 Apple Kids Category: No Third-Party Analytics

```typescript
// For Apple Kids Category build
const isKidsCategoryBuild = process.env.APPLE_KIDS_BUILD === 'true';

const initializeAnalytics = () => {
  if (isKidsCategoryBuild) {
    // Apple Kids Category: No third-party analytics allowed
    console.log('Analytics disabled for Kids Category build');
    return;
  }

  // Only first-party, privacy-focused analytics
  // Example: Plausible, Fathom, or self-hosted
  initPrivacyAnalytics({
    anonymizeIP: true,
    respectDoNotTrack: true,
    cookieless: true,
  });
};
```

---

## 6. Purchase Safety

### 6.1 Parental Gate for All Purchases

```typescript
const PurchaseButton: React.FC<{ productId: string }> = ({ productId }) => {
  const handlePurchase = async () => {
    // Always require parental gate
    showParentalGate(async () => {
      // After parent confirms, show purchase flow
      await initiatePurchase(productId);
    });
  };

  return (
    <button onClick={handlePurchase}>
      Upgrade to Premium
    </button>
  );
};
```

### 6.2 No Manipulative Purchase Prompts

```typescript
// ❌ PROHIBITED: Manipulative prompts
const BAD_PROMPTS = [
  "Don't you want to keep playing?",
  "Your friend Pip will be sad if you don't upgrade",
  "Limited time offer! Buy now!",
  "You're missing out!",
];

// ✅ ALLOWED: Clear, honest prompts
const GOOD_PROMPTS = [
  "Premium includes 50+ more games",
  "Ask a parent to unlock more activities",
  "See a parent to continue",
];
```

### 6.3 Clear Pricing Display

```typescript
const PricingDisplay: React.FC = () => {
  return (
    <div className="pricing">
      <h3>Premium Subscription</h3>

      {/* Clear, upfront pricing */}
      <p className="price">₹199/month</p>
      <p className="billing-note">Billed monthly. Cancel anytime.</p>

      {/* What's included */}
      <ul>
        <li>50+ educational games</li>
        <li>Progress tracking for parents</li>
        <li>Multiple child profiles</li>
      </ul>

      {/* Clear parent requirement */}
      <p className="parent-note">
        <strong>Parents:</strong> Tap below to subscribe
      </p>

      <ParentalGatedButton action="subscribe">
        Subscribe (Parents Only)
      </ParentalGatedButton>
    </div>
  );
};
```

---

## 7. Privacy Policy Requirements

### 7.1 Required Disclosures

Create a privacy policy page with these sections:

```markdown
# Privacy Policy for Advay Vision Learning

## Information We Collect
We collect NO personal information from children.
- Camera access is used ONLY for gameplay
- Camera images are processed on your device and never uploaded
- No photos or videos are stored or transmitted

## Information Stored on Your Device
- Game progress and scores (stored locally only)
- App settings and preferences
- Selected avatar and display name

## Information We Never Collect
- Real names or photos
- Email addresses
- Phone numbers
- Location data
- Device identifiers
- Biometric data

## Third-Party Services
This app does not use third-party analytics, advertising, or
tracking services in the Kids version.

## Parental Controls
Parents can:
- View their child's progress locally
- Delete all stored data
- Export progress reports
- Control app settings

## Data Deletion
All data is stored on your device. To delete:
1. Open Settings
2. Tap "Delete All Data"
3. Confirm deletion

## Contact
For privacy questions: privacy@advay.app

## Changes to This Policy
We'll notify you of changes through the app.

Last updated: [DATE]
```

### 7.2 Privacy Policy Placement

```typescript
// Privacy policy accessible from:
const PRIVACY_POLICY_LOCATIONS = [
  '/settings/privacy',        // In-app settings
  '/legal/privacy',           // Web page
  'App Store listing',        // Store description
  'Play Store listing',       // Store description
  'First-run onboarding',     // During setup
];

// Show privacy summary on first run
const FirstRunPrivacyNotice: React.FC = () => {
  return (
    <div className="privacy-notice">
      <h3>Your Privacy Matters</h3>
      <p>
        This app keeps everything on your device.
        We don't collect any personal information.
      </p>
      <button onClick={() => navigateTo('/legal/privacy')}>
        Read Full Privacy Policy
      </button>
    </div>
  );
};
```

---

## 8. Implementation Checklist

### 8.1 Critical (Before Any Release)

| Item | Status | Notes |
|------|--------|-------|
| Camera frames never uploaded | 🔧 Verify | Add network interceptor |
| No PII in any network request | 🔧 Verify | Audit all fetch calls |
| Local-only storage | ✅ Current | IndexedDB + localStorage |
| Age gate on first launch | 🔧 TODO | Simple who's-using screen |
| Parental gate for purchases | 🔧 TODO | Math challenge |
| Privacy policy page | 🔧 TODO | Create /legal/privacy |
| No external links without gate | 🔧 TODO | Wrap all <a> tags |

### 8.2 Before App Store Submission

| Item | Status | Notes |
|------|--------|-------|
| Privacy nutrition labels | 🔧 TODO | Apple requirement |
| Data safety form | 🔧 TODO | Google requirement |
| Designed for Families questionnaire | 🔧 TODO | Google Play |
| Kids Category questionnaire | 🔧 TODO | Apple App Store |
| Content rating completed | 🔧 TODO | Both stores |

### 8.3 Ongoing

| Item | Frequency | Notes |
|------|-----------|-------|
| Audit network requests | Each release | No PII leakage |
| Review third-party deps | Monthly | Check for tracking |
| Update privacy policy | As needed | Notify users |
| Monitor COPPA/DPDP updates | Quarterly | Law changes |

---

## 9. Code Review Checklist

Add this to PR review process:

```markdown
## Kids Safety Review

Before merging, verify:

### Data Collection
- [ ] No new network calls that send user data
- [ ] No new third-party SDKs added
- [ ] No localStorage/IndexedDB changes that store PII
- [ ] Camera/mic data stays local

### Content
- [ ] All new text is child-appropriate
- [ ] No new external links without parental gate
- [ ] No scary/violent imagery
- [ ] Audio is appropriate volume/content

### UX
- [ ] No new manipulative patterns
- [ ] No time pressure added
- [ ] Failure states are encouraging, not punishing
- [ ] Parental gate required for new sensitive actions

### Privacy
- [ ] Privacy policy updated if data handling changed
- [ ] No analytics on child-specific actions
- [ ] Consent flows updated if needed
```

---

## 10. Quick Reference Card

Print this for the team:

```
╔═══════════════════════════════════════════════════════╗
║           KIDS APP SAFETY QUICK REFERENCE             ║
╠═══════════════════════════════════════════════════════╣
║                                                       ║
║  ✅ DO                        ❌ DON'T                ║
║  ─────────────────────────────────────────────────── ║
║  Process camera locally       Upload camera frames    ║
║  Store progress on device     Store data in cloud     ║
║  Use parental gates           Let kids make purchases ║
║  Show encouraging feedback    Show "wrong" or "fail"  ║
║  Use anonymous analytics      Track individual users  ║
║  Gate external links          Direct link to web      ║
║  Simple age gate              Complex age verification║
║  Clear pricing                Hidden costs            ║
║                                                       ║
║  WHEN IN DOUBT: DON'T COLLECT IT                     ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
```

---

**Last Updated**: 2026-01-31
**Next Review**: Before each release
**Related**: RESEARCH-011-DEPLOYMENT-DISTRIBUTION.md, RESEARCH-001-TECHNICAL-PATTERNS.md
