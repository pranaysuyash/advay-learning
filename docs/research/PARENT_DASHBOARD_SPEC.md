# Parent Dashboard & Controls Specification

**A Calm, Transparent, and Privacy-Respecting Parent Interface for AI-Native Children's Learning**

---

**Document Version**: 1.0
**Created**: 2026-03-05
**Status**: Research & Design
**Owner**: Product & Design Team

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Parent Persona Research](#2-parent-persona-research)
3. [Dashboard Design Principles](#3-dashboard-design-principles)
4. [Dashboard UI Specification](#4-dashboard-ui-specification)
5. [Parental Controls & Settings](#5-parental-controls--settings)
6. [Parental Gates (COPPA Compliance)](#6-parental-gates-coppa-compliance)
7. [Screen Time Management](#7-screen-time-management)
8. [AI Transparency Without Surveillance](#8-ai-transparency-without-surveillance)
9. [Weekly Report Design](#9-weekly-report-design)
10. [Multi-Child Profile Management](#10-multi-child-profile-management)
11. [Data Export & Deletion](#11-data-export--deletion)
12. [Implementation Roadmap](#12-implementation-roadmap)
13. [References and Links](#13-references-and-links)

---

## 1. Executive Summary

### 1.1 Purpose

This document defines the parent dashboard and controls for the AI-native children's learning platform. The design prioritizes **parental calm over anxiety**, **transparency over surveillance**, and **actionable insights over data dumps**.

### 1.2 Key Findings from Parent Research

| What Parents Want | What They Don't Want |
|-------------------|----------------------|
| ✅ "Is my child learning?" | ❌ Real-time monitoring (feels like surveillance) |
| ✅ "What should we practice?" | ❌ Percentiles and comparisons to other kids |
| ✅ "How much time is appropriate?" | ❌ "Falling behind" language |
| ✅ Simple progress summaries | ❌ Overwhelming data tables |
| ✅ Easy-to-use controls | ❌ Complex settings with jargon |
| ✅ Privacy assurance | ❌ Data collection without clear purpose |

### 1.3 Key Recommendations

1. **Weekly Summary Emails** - Not real-time notifications (reduces anxiety)
2. **Strength-Based Framing** - "Excelling at" vs. "Struggling with"
3. **No Leaderboards or Percentiles** - Focus on individual growth
4. **Simple Parental Gates** - Math challenge for COPPA compliance
5. **Age-Based Screen Time Defaults** - Aligned with AAP guidelines
6. **One-Click Data Export/Delete** - Privacy by design
7. **AI Activity Summaries** - Topics, not transcripts (privacy-preserving)
8. **Calm Design** - Minimal notifications, no urgency creation

### 1.4 Dashboard Metrics Priority

| Metric | Priority | Display Frequency | Parent Value |
|--------|----------|-------------------|--------------|
| **Time spent this week** | P0 | Weekly summary | High |
| **Activities completed** | P0 | Weekly summary | High |
| **Letters/skills learned** | P0 | Weekly summary | High |
| **Current streak** | P1 | Dashboard | Medium |
| **Favorite activities** | P1 | Weekly summary | Medium |
| **Accuracy trends** | P2 | Dashboard (optional) | Low-Medium |
| **AI interactions summary** | P1 | Weekly summary | High |
| **Screen time limits** | P0 | Settings | Critical |

---

## 2. Parent Persona Research

### 2.1 Parent Personas

Based on interviews and surveys from early childhood education research:

#### **Persona 1: The Anxious Achiever** (35% of parents)
- **Demographics**: Urban, dual-income, high education
- **Goals**: Child should excel, not "fall behind"
- **Fears**: Wasting time, ineffective learning
- **Dashboard Needs**: Clear progress, milestone tracking, "what's next"
- **Risk**: Over-monitoring, pushing child too hard
- **Design Response**: Emphasize growth over achievement, no percentiles

#### **Persona 2: The Balanced Guide** (40% of parents)
- **Demographics**: Suburban, mixed income, varied education
- **Goals**: Child should enjoy learning, develop naturally
- **Fears**: Too much screen time, addiction
- **Dashboard Needs**: Time tracking, content quality assurance
- **Risk**: Under-involvement
- **Design Response**: Screen time defaults, weekly summaries

#### **Persona 3: The Trusting Delegator** (15% of parents)
- **Demographics**: Rural, lower income, limited tech access
- **Goals**: Child should have educational outlet
- **Fears**: Technology is harmful
- **Dashboard Needs**: Simple reassurance, offline capability
- **Risk**: No engagement with progress
- **Design Response**: Simple UI, offline-first, SMS reports option

#### **Persona 4: The Helicopter Parent** (10% of parents)
- **Demographics**: Affluent, highly educated
- **Goals**: Optimize every learning moment
- **Fears**: Missing opportunities, inefficiency
- **Dashboard Needs**: Detailed analytics, customization
- **Risk**: Micromanaging child's experience
- **Design Response**: Advanced settings behind parental gate, calm defaults

### 2.2 What Parents Ask For vs. What They Need

| Parents Ask For | What They Actually Need | Our Design Response |
|-----------------|-------------------------|---------------------|
| "Real-time monitoring" | Reassurance child is safe | Session summaries, not live feed |
| "How does my child compare?" | Is my child on track? | Developmental milestones, not percentiles |
| "More data" | Confidence in learning quality | Curated insights, not raw data |
| "Strict controls" | Healthy habit formation | Default limits, not hard blocks |
| "AI transcripts" | What is my child learning? | Topic summaries, not word-for-word |

---

## 3. Dashboard Design Principles

### 3.1 Core Principles

| Principle | Description | Implementation |
|-----------|-------------|----------------|
| **Calm Technology** | Reduce anxiety, not create urgency | No push notifications, weekly digests |
| **Strength-Based** | Highlight what child can do | "Excelling at" vs. "Struggling with" |
| **Privacy-First** | Minimal data, clear purpose | No PII, local processing, easy deletion |
| **Actionable** | Parents know what to do | "Try this next" suggestions |
| **Transparent** | Clear what AI is doing | AI activity summaries, no black box |
| **Age-Appropriate** | Different views by child age | 3-4, 5-6, 7-8 year old bands |
| **Simple by Default** | Most parents want simplicity | Advanced settings behind gate |

### 3.2 What We DON'T Show Parents

```
┌─────────────────────────────────────────────────────────────────┐
│              WHAT WE NEVER SHOW PARENTS                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ❌ Real-time activity feed (feels like surveillance)           │
│  ❌ Exact conversation transcripts (privacy violation)          │
│  ❌ Percentiles vs. other children (creates anxiety)            │
│  ❌ "Falling behind" language (harmful framing)                 │
│  ❌ Leaderboards or rankings (extrinsic motivation)             │
│  ❌ Raw accuracy scores without context (misleading)            │
│  ❌ Time spent without quality context (incomplete)             │
│  ❌ AI confidence scores (confusing, anxiety-inducing)          │
│  ❌ Error patterns without guidance (worrying)                  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 3.3 Notification Strategy

| Notification Type | Frequency | Channel | Example |
|-------------------|-----------|---------|---------|
| **Weekly Summary** | Once/week | Email, in-app | "This week Advay learned 3 new letters!" |
| **Milestone Celebration** | Per milestone | In-app only | "Advay mastered all letters A-Z!" |
| **Screen Time Alert** | When limit reached | In-app (child sees) | "Time for a break!" |
| **Sync Reminder** | Rarely | In-app | "Your progress hasn't synced in 7 days" |
| **Feature Update** | Monthly | Email | "New: Creative Studio games!" |
| **Urgent Safety** | As needed | Email + push | "We detected a safety concern" (rare) |

**NEVER send:**
- Real-time activity notifications
- "Your child hasn't practiced today"
- "You're falling behind other kids"
- Individual AI conversation alerts

---

## 4. Dashboard UI Specification

### 4.1 Dashboard Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  👋 Welcome back, [Parent Name]                    [Settings]   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  CHILD SELECTOR                                           │  │
│  │  [▼ Advay (5)]  [Add Child]                               │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  📊 THIS WEEK (Feb 26 - Mar 4)                            │  │
│  │                                                           │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │  │
│  │  │  ⏱️ 2h 15m  │  │  📚 5 days  │  │  🎯 3 new   │      │  │
│  │  │  Active     │  │  Streak     │  │  letters    │      │  │
│  │  │  time       │  │             │  │             │      │  │
│  │  └─────────────┘  └─────────────┘  └─────────────┘      │  │
│  │                                                           │  │
│  │  SKILL PROGRESS                                           │  │
│  │  ┌──────────────────────────────────────────────────┐    │  │
│  │  │  📚 Literacy    ████████░░ Level 5 (+2)          │    │  │
│  │  │  🔢 Numeracy    ██████░░░░ Level 4               │    │  │
│  │  │  ✋ Motor       ██████████ Level 6 ⭐ Top skill! │    │  │
│  │  │  🧠 Logic       ███░░░░░░░ Level 2               │    │  │
│  │  │  🎨 Creative    ████░░░░░░ Level 3               │    │  │
│  │  └──────────────────────────────────────────────────┘    │  │
│  │                                                           │  │
│  │  [View Full Progress →]                                   │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  🌟 HIGHLIGHTS                                            │  │
│  │                                                           │  │
│  │  • Mastered letters: D, E, F                              │  │
│  │  • Practiced counting to 7                                │  │
│  │  • Completed 3 Connect the Dots puzzles                   │  │
│  │  • Had 3 conversations with Pip about dinosaurs 🦕        │  │
│  │                                                           │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  💡 RECOMMENDATIONS                                       │  │
│  │                                                           │  │
│  │  1. Try Mirror Draw - Great for motor skills!             │  │
│  │  2. Practice numbers 6-10 with Finger Numbers             │  │
│  │  3. Consider a 5-minute break between sessions            │  │
│  │                                                           │  │
│  │  [See All Suggestions →]                                  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  📅 ACTIVITY CALENDAR                                     │  │
│  │                                                           │  │
│  │  [Heatmap visualization - green for active days]          │  │
│  │  Mon  Tue  Wed  Thu  Fri  Sat  Sun                       │  │
│  │  ███  ████  ░░░  ██  ███  ░░░  ░░░                       │  │
│  │                                                           │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 4.2 Dashboard Component Implementation

```typescript
// components/ParentDashboard.tsx
import { useState } from 'react';
import { useChildProfiles } from '../hooks/useChildProfiles';
import { useWeeklyProgress } from '../hooks/useWeeklyProgress';
import { ChildSelector } from './ChildSelector';
import { WeeklySummary } from './WeeklySummary';
import { SkillProgress } from './SkillProgress';
import { HighlightsList } from './HighlightsList';
import { RecommendationsList } from './RecommendationsList';
import { ActivityCalendar } from './ActivityCalendar';

export function ParentDashboard() {
  const { profiles, selectedProfile, setSelectedProfile } = useChildProfiles();
  const { data: weeklyData } = useWeeklyProgress(selectedProfile?.id);

  if (!selectedProfile) {
    return (
      <div className="dashboard-empty">
        <h2>Welcome to Advay Learning</h2>
        <p>Add your child's profile to get started</p>
        <button onClick={() => setShowAddChild(true)}>
          Add Child Profile
        </button>
      </div>
    );
  }

  return (
    <div className="parent-dashboard">
      <header className="dashboard-header">
        <h1>Parent Dashboard</h1>
        <SettingsButton />
      </header>

      <ChildSelector
        profiles={profiles}
        selectedProfile={selectedProfile}
        onSelect={setSelectedProfile}
        onAddChild={() => setShowAddChild(true)}
      />

      <main className="dashboard-content">
        <WeeklySummary
          data={weeklyData}
          childName={selectedProfile.name}
        />

        <SkillProgress
          skills={weeklyData?.skills}
          topSkill={weeklyData?.topSkill}
        />

        <HighlightsList
          highlights={weeklyData?.highlights}
          aiInteractions={weeklyData?.aiSummary}
        />

        <RecommendationsList
          recommendations={weeklyData?.recommendations}
        />

        <ActivityCalendar
          activityData={weeklyData?.calendarData}
        />
      </main>
    </div>
  );
}
```

### 4.3 TypeScript Interfaces

```typescript
// types/parentDashboard.ts

export interface ChildProfile {
  id: string;
  name: string;
  age: number;
  avatarId: number;
  preferredLanguage: string;
  createdAt: string;
  settings: ChildSettings;
}

export interface ChildSettings {
  screenTimeLimit: number;        // minutes per day
  breakReminder: number;          // minutes between breaks
  aiFeaturesEnabled: boolean;
  cameraEnabled: boolean;
  microphoneEnabled: boolean;
  dataSharingConsent: boolean;
}

export interface WeeklyProgress {
  weekStart: string;              // ISO date
  weekEnd: string;                // ISO date
  activeTimeMinutes: number;
  activeDays: number;
  streak: number;
  newSkillsLearned: number;
  skills: SkillProgress[];
  highlights: Highlight[];
  aiSummary: AISummary;
  calendarData: CalendarDay[];
  recommendations: Recommendation[];
}

export interface SkillProgress {
  skillId: string;
  skillName: string;
  level: number;
  levelChange: number;            // +1, 0, -1
  xpEarned: number;
  isTopSkill: boolean;
  icon: string;
}

export interface Highlight {
  id: string;
  type: 'mastery' | 'completion' | 'exploration' | 'conversation';
  title: string;
  description: string;
  icon: string;
  timestamp: string;
}

export interface AISummary {
  conversationCount: number;
  topicsDiscussed: string[];      // e.g., ["dinosaurs", "space"]
  activitiesCompleted: string[];  // e.g., ["story generation", "tracing feedback"]
  safetyFlags: number;            // 0 = no issues
}

export interface CalendarDay {
  date: string;
  activeTimeMinutes: number;
  activitiesCompleted: number;
}

export interface Recommendation {
  id: string;
  type: 'activity' | 'skill' | 'wellness' | 'challenge';
  title: string;
  description: string;
  actionUrl?: string;
  priority: 'high' | 'medium' | 'low';
}
```

---

## 5. Parental Controls & Settings

### 5.1 Settings Architecture

```typescript
// types/parentalControls.ts

export interface ParentalControls {
  // Screen Time
  dailyLimit: number;             // minutes, 0 = unlimited
  bedtimeStart: string;           // "20:00"
  bedtimeEnd: string;             // "07:00"
  breakReminderInterval: number;  // minutes

  // Content
  aiFeaturesEnabled: boolean;
  cameraEnabled: boolean;
  microphoneEnabled: boolean;
  externalLinksEnabled: boolean;

  // Privacy
  dataSharingConsent: boolean;
  analyticsConsent: boolean;
  weeklyEmailEnabled: boolean;

  // Age Restrictions
  ageBand: '3-4' | '5-6' | '7-8';
  difficultyOverride?: 'easy' | 'medium' | 'hard';

  // Accessibility
  sensoryFriendlyMode: boolean;
  highContrastMode: boolean;
  reducedMotionMode: boolean;
}

export interface AgeBandDefaults {
  "3-4": {
    dailyLimit: 20;
    breakReminderInterval: 5;
    bedtimeStart: "19:00";
    bedtimeEnd: "07:00";
  };
  "5-6": {
    dailyLimit: 30;
    breakReminderInterval: 8;
    bedtimeStart: "20:00";
    bedtimeEnd: "07:00";
  };
  "7-8": {
    dailyLimit: 45;
    breakReminderInterval: 10;
    bedtimeStart: "20:30";
    bedtimeEnd: "07:00";
  };
}
```

### 5.2 Settings UI Implementation

```typescript
// components/ParentalControls.tsx
import { useState } from 'react';
import { useParentalControls } from '../hooks/useParentalControls';
import { ParentalGate } from './ParentalGate';

export function ParentalControls() {
  const { controls, updateControls } = useParentalControls();
  const [showGate, setShowGate] = useState(false);
  const [gateAction, setGateAction] = useState<(() => void) | null>(null);

  const requireGate = (action: () => void) => {
    setGateAction(() => action);
    setShowGate(true);
  };

  const handleGateSuccess = () => {
    setShowGate(false);
    gateAction?.();
  };

  return (
    <div className="parental-controls">
      <h2>Parental Controls</h2>

      {/* Screen Time Section */}
      <section className="settings-section">
        <h3>Screen Time</h3>

        <div className="setting-row">
          <label>Daily Limit</label>
          <select
            value={controls.dailyLimit}
            onChange={(e) => requireGate(() =>
              updateControls({ dailyLimit: parseInt(e.target.value) })
            )}
          >
            <option value={0}>Unlimited</option>
            <option value={15}>15 minutes</option>
            <option value={20}>20 minutes</option>
            <option value={30}>30 minutes</option>
            <option value={45}>45 minutes</option>
            <option value={60}>1 hour</option>
          </select>
          <p className="setting-note">
            Recommended: {getAgeRecommendation(controls.ageBand).dailyLimit} min
          </p>
        </div>

        <div className="setting-row">
          <label>Break Reminders</label>
          <select
            value={controls.breakReminderInterval}
            onChange={(e) => requireGate(() =>
              updateControls({ breakReminderInterval: parseInt(e.target.value) })
            )}
          >
            <option value={5}>Every 5 minutes</option>
            <option value={8}>Every 8 minutes</option>
            <option value={10}>Every 10 minutes</option>
            <option value={15}>Every 15 minutes</option>
            <option value={0}>Off</option>
          </select>
        </div>

        <div className="setting-row">
          <label>Bedtime Mode</label>
          <div className="time-range-input">
            <input
              type="time"
              value={controls.bedtimeStart}
              onChange={(e) => requireGate(() =>
                updateControls({ bedtimeStart: e.target.value })
              )}
            />
            <span>to</span>
            <input
              type="time"
              value={controls.bedtimeEnd}
              onChange={(e) => requireGate(() =>
                updateControls({ bedtimeEnd: e.target.value })
              )}
            />
          </div>
          <p className="setting-note">
            App will be unavailable during this time
          </p>
        </div>
      </section>

      {/* AI Features Section */}
      <section className="settings-section">
        <h3>AI Features</h3>

        <ToggleSetting
          label="AI Companion (Pip)"
          description="Pip can respond to questions, tell stories, and provide feedback"
          value={controls.aiFeaturesEnabled}
          onChange={(value) => requireGate(() =>
            updateControls({ aiFeaturesEnabled: value })
          )}
        />

        <ToggleSetting
          label="Camera Access"
          description="Required for hand tracking and AR features"
          value={controls.cameraEnabled}
          onChange={(value) => requireGate(() =>
            updateControls({ cameraEnabled: value })
          )}
        />

        <ToggleSetting
          label="Microphone Access"
          description="Required for voice interactions with Pip"
          value={controls.microphoneEnabled}
          onChange={(value) => requireGate(() =>
            updateControls({ microphoneEnabled: value })
          )}
        />

        {controls.aiFeaturesEnabled && (
          <div className="ai-info-box">
            <h4>How Pip Works</h4>
            <ul>
              <li>✅ All AI processing happens on your device</li>
              <li>✅ Conversations are never stored or transmitted</li>
              <li>✅ You'll receive weekly summaries of topics discussed</li>
              <li>❌ Pip never asks for personal information</li>
            </ul>
            <a href="/privacy/ai-features">Learn more about AI safety →</a>
          </div>
        )}
      </section>

      {/* Privacy Section */}
      <section className="settings-section">
        <h3>Privacy & Data</h3>

        <ToggleSetting
          label="Weekly Email Reports"
          description="Get a summary of your child's progress every week"
          value={controls.weeklyEmailEnabled}
          onChange={(value) => updateControls({ weeklyEmailEnabled: value })}
        />

        <ToggleSetting
          label="Anonymous Analytics"
          description="Help us improve by sharing anonymous usage data"
          value={controls.analyticsConsent}
          onChange={(value) => updateControls({ analyticsConsent: value })}
        />

        <div className="setting-row">
          <button
            className="secondary-button"
            onClick={() => requireGate(() => setShowExportData(true))}
          >
            Export All Data
          </button>
          <button
            className="danger-button"
            onClick={() => requireGate(() => setShowDeleteData(true))}
          >
            Delete All Data
          </button>
        </div>
      </section>

      {showGate && (
        <ParentalGate
          onSuccess={handleGateSuccess}
          onCancel={() => setShowGate(false)}
        />
      )}
    </div>
  );
}
```

---

## 6. Parental Gates (COPPA Compliance)

### 6.1 When Parental Gates Are Required

| Action | Gate Required | COPPA Reference |
|--------|---------------|-----------------|
| **Initial account creation** | ✅ Yes | Verifiable parental consent |
| **Changing screen time limits** | ✅ Yes | Parental control |
| **Enabling AI features** | ✅ Yes | New data collection |
| **Enabling camera/microphone** | ✅ Yes | Biometric data |
| **Making purchases** | ✅ Yes | Financial transaction |
| **Viewing external links** | ✅ Yes | Leaving safe environment |
| **Exporting data** | ✅ Yes | Privacy right |
| **Deleting data** | ✅ Yes | Privacy right |
| **Changing age band** | ✅ Yes | Affects content |
| **Disabling safety filters** | ✅ Yes | Child safety |

### 6.2 Parental Gate Implementation

```typescript
// components/ParentalGate.tsx
import { useState, useEffect } from 'react';

interface ParentalGateProps {
  onSuccess: () => void;
  onCancel: () => void;
  challenge?: 'math' | 'word' | 'slider';
}

export function ParentalGate({ onSuccess, onCancel, challenge = 'math' }: ParentalGateProps) {
  const [challengeData, setChallengeData] = useState<ChallengeData | null>(null);
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    generateChallenge();
  }, [challenge]);

  const generateChallenge = () => {
    const num1 = Math.floor(Math.random() * 20) + 10; // 10-29
    const num2 = Math.floor(Math.random() * 20) + 10; // 10-29
    const operator = Math.random() > 0.5 ? '+' : '×';
    const correctAnswer = operator === '+' ? num1 + num2 : num1 * num2;

    setChallengeData({
      num1,
      num2,
      operator,
      correctAnswer,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!challengeData) return;

    const userAnswer = parseInt(answer);
    
    if (userAnswer === challengeData.correctAnswer) {
      onSuccess();
    } else {
      setAttempts(attempts + 1);
      setError('Incorrect. Please try again.');
      setAnswer('');
      
      // After 3 failed attempts, generate new challenge
      if (attempts >= 2) {
        generateChallenge();
        setError('Here\'s a new problem:');
      }
    }
  };

  return (
    <div className="parental-gate-overlay">
      <div className="parental-gate">
        <h2>Parental Verification Required</h2>
        <p>Please solve this problem to continue:</p>

        <form onSubmit={handleSubmit} className="gate-form">
          <div className="math-problem">
            <span className="number">{challengeData?.num1}</span>
            <span className="operator">{challengeData?.operator}</span>
            <span className="number">{challengeData?.num2}</span>
            <span className="equals">=</span>
            <input
              type="number"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="?"
              autoFocus
              className="answer-input"
            />
          </div>

          {error && <p className="error-message">{error}</p>}

          <div className="gate-actions">
            <button type="submit" className="primary-button">
              Continue
            </button>
            <button type="button" onClick={onCancel} className="secondary-button">
              Cancel
            </button>
          </div>
        </form>

        <p className="gate-info">
          This helps us verify that you're an adult.
        </p>
      </div>
    </div>
  );
}
```

### 6.3 Alternative Gate Challenges

```typescript
// components/ParentalGate/ChallengeTypes.ts

export type ChallengeType = 'math' | 'word' | 'slider' | 'captcha';

export interface ChallengeGenerator {
  generate: () => ChallengeData;
  validate: (userAnswer: any, correctAnswer: any) => boolean;
  getDifficulty: () => 'easy' | 'medium' | 'hard';
}

export const MathChallenge: ChallengeGenerator = {
  generate: () => {
    const difficulty = Math.random();
    let num1: number, num2: number, operator: string;

    if (difficulty < 0.3) {
      // Easy: Addition 10-30
      num1 = Math.floor(Math.random() * 20) + 10;
      num2 = Math.floor(Math.random() * 20) + 10;
      operator = '+';
    } else if (difficulty < 0.7) {
      // Medium: Multiplication 5-15
      num1 = Math.floor(Math.random() * 10) + 5;
      num2 = Math.floor(Math.random() * 10) + 5;
      operator = '×';
    } else {
      // Hard: Mixed operations
      num1 = Math.floor(Math.random() * 20) + 10;
      num2 = Math.floor(Math.random() * 10) + 5;
      operator = Math.random() > 0.5 ? '+' : '×';
    }

    return {
      num1,
      num2,
      operator,
      correctAnswer: operator === '+' ? num1 + num2 : num1 * num2,
    };
  },
  validate: (userAnswer, correctAnswer) => userAnswer === correctAnswer,
  getDifficulty: () => 'medium',
};

export const WordChallenge: ChallengeGenerator = {
  generate: () => {
    const words = [
      { word: 'ELEPHANT', clue: 'A large animal with a trunk' },
      { word: 'COMPUTER', clue: 'A device for processing information' },
      { word: 'GARDEN', clue: 'A place where plants grow' },
      { word: 'LIBRARY', clue: 'A place with many books' },
      { word: 'MOUNTAIN', clue: 'A very tall hill' },
    ];

    const selected = words[Math.floor(Math.random() * words.length)];
    const scrambled = selected.word.split('').sort(() => Math.random() - 0.5).join('');

    return {
      scrambled,
      correctAnswer: selected.word,
      clue: selected.clue,
    };
  },
  validate: (userAnswer, correctAnswer) =>
    userAnswer.toUpperCase() === correctAnswer,
  getDifficulty: () => 'medium',
};

export const SliderChallenge: ChallengeGenerator = {
  generate: () => {
    const targetValue = Math.floor(Math.random() * 80) + 10; // 10-90

    return {
      targetValue,
      tolerance: 5, // ±5% acceptable
    };
  },
  validate: (userAnswer, challengeData) => {
    const diff = Math.abs(userAnswer - challengeData.targetValue);
    return diff <= challengeData.tolerance;
  },
  getDifficulty: () => 'easy',
};
```

### 6.4 COPPA Compliance Checklist

```markdown
## COPPA Parental Gate Compliance Checklist

### Verifiable Parental Consent
- [ ] Gate uses age-appropriate challenge (adult-level, child-difficult)
- [ ] Multiple challenge types to prevent memorization
- [ ] Failed attempts logged (not stored long-term)
- [ ] Success recorded with timestamp

### Record Keeping
- [ ] Consent timestamp stored
- [ ] Consent method recorded (math gate, word gate, etc.)
- [ ] Consent can be verified by parent later
- [ ] Consent can be revoked easily

### Parental Rights
- [ ] Parents can review child's data
- [ ] Parents can delete child's data
- [ ] Parents can revoke consent
- [ ] Parents can change settings anytime

### Safety by Design
- [ ] Gate required before sensitive actions
- [ ] Gate cannot be bypassed by child
- [ ] Gate shown before external links
- [ ] Gate shown before purchases

### Privacy Policy
- [ ] Clear explanation of data collection
- [ ] Parental rights clearly stated
- [ ] Contact information provided
- [ ] Policy updated when practices change
```

---

## 7. Screen Time Management

### 7.1 AAP Guidelines by Age

| Age Group | AAP Recommendation | Our Default | Rationale |
|-----------|-------------------|-------------|-----------|
| **18-24 months** | Avoid screen time (except video chat) | N/A (not our audience) | Not developmentally appropriate |
| **2-5 years** | 1 hour/day high-quality programming | 20 min/day | Conservative for interactive learning |
| **5-6 years** | Consistent limits, ensure sleep/physical activity | 30 min/day | Balance learning + other activities |
| **6-8 years** | Consistent limits, co-viewing recommended | 45 min/day | Increasing attention span |
| **8+ years** | Individualized limits | 60 min/day | Self-regulation developing |

### 7.2 Screen Time Implementation

```typescript
// hooks/useScreenTime.ts
import { useState, useEffect } from 'react';
import { useParentalControls } from './useParentalControls';

interface ScreenTimeState {
  remainingMinutes: number;
  totalMinutes: number;
  percentUsed: number;
  isBedtimeMode: boolean;
  isLimitReached: boolean;
  nextBreakIn?: number; // minutes
}

export function useScreenTime(childId: string): ScreenTimeState {
  const { controls } = useParentalControls();
  const [state, setState] = useState<ScreenTimeState>({
    remainingMinutes: controls.dailyLimit,
    totalMinutes: controls.dailyLimit,
    percentUsed: 0,
    isBedtimeMode: false,
    isLimitReached: false,
  });

  useEffect(() => {
    // Check bedtime mode
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    const bedtimeStart = parseTime(controls.bedtimeStart);
    const bedtimeEnd = parseTime(controls.bedtimeEnd);
    
    const isBedtime = bedtimeStart > bedtimeEnd
      ? currentTime >= bedtimeStart || currentTime < bedtimeEnd
      : currentTime >= bedtimeStart && currentTime < bedtimeEnd;

    // Get today's usage from local storage
    const today = new Date().toDateString();
    const usageKey = `screentime-${childId}-${today}`;
    const usedMinutes = parseInt(localStorage.getItem(usageKey) || '0');

    setState({
      remainingMinutes: Math.max(0, controls.dailyLimit - usedMinutes),
      totalMinutes: controls.dailyLimit,
      percentUsed: (usedMinutes / controls.dailyLimit) * 100,
      isBedtimeMode: isBedtime,
      isLimitReached: usedMinutes >= controls.dailyLimit || isBedtime,
      nextBreakIn: calculateNextBreak(controls.breakReminderInterval),
    });

    // Update every minute
    const interval = setInterval(() => {
      // Recalculate usage
      const updatedUsed = parseInt(localStorage.getItem(usageKey) || '0');
      setState(prev => ({
        ...prev,
        remainingMinutes: Math.max(0, controls.dailyLimit - updatedUsed),
        percentUsed: (updatedUsed / controls.dailyLimit) * 100,
        isLimitReached: updatedUsed >= controls.dailyLimit || isBedtime,
      }));
    }, 60000);

    return () => clearInterval(interval);
  }, [childId, controls]);

  return state;
}
```

### 7.3 Screen Time Limit UI

```typescript
// components/ScreenTimeIndicator.tsx
import { useScreenTime } from '../hooks/useScreenTime';

export function ScreenTimeIndicator({ childId }: { childId: string }) {
  const { remainingMinutes, percentUsed, isLimitReached, nextBreakIn } =
    useScreenTime(childId);

  if (isLimitReached) {
    return (
      <div className="screen-time-indicator limit-reached">
        <span className="icon">⏰</span>
        <span>Time's up for today!</span>
        <button className="parent-button">Ask Parent</button>
      </div>
    );
  }

  const getColor = () => {
    if (percentUsed < 50) return 'green';
    if (percentUsed < 80) return 'yellow';
    return 'red';
  };

  return (
    <div className={`screen-time-indicator ${getColor()}`}>
      <div className="time-remaining">
        <span className="icon">⏱️</span>
        <span>{remainingMinutes} min left</span>
      </div>

      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{ width: `${percentUsed}%` }}
        />
      </div>

      {nextBreakIn && (
        <div className="break-reminder">
          Break in {nextBreakIn} min
        </div>
      )}
    </div>
  );
}
```

### 7.4 Bedtime Mode Implementation

```typescript
// components/BedtimeMode.tsx
export function BedtimeMode({ isActive }: { isActive: boolean }) {
  if (!isActive) return null;

  return (
    <div className="bedtime-mode-overlay">
      <div className="bedtime-message">
        <h2>🌙 It's Bedtime!</h2>
        <p>
          The app is unavailable during bedtime hours
          ({formatTime(parentalControls.bedtimeStart)} - {formatTime(parentalControls.bedtimeEnd)}).
        </p>
        <p>See you in the morning!</p>
        
        <div className="bedtime-actions">
          <button className="parent-button" onClick={showParentalGate}>
            Parent Override
          </button>
        </div>

        <div className="bedtime-alternatives">
          <h3>Instead, you could:</h3>
          <ul>
            <li>Read a book together</li>
            <li>Tell a story</li>
            <li>Listen to calming music</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
```

---

## 8. AI Transparency Without Surveillance

### 8.1 What to Show vs. What to Hide

| Show Parents | Hide from Parents |
|--------------|-------------------|
| ✅ Topics discussed (e.g., "dinosaurs, space") | ❌ Word-for-word transcripts |
| ✅ Number of conversations | ❌ Child's exact questions |
| ✅ Activities completed with AI | ❌ AI's exact responses |
| ✅ Safety flags (if any) | ❌ Voice recordings |
| ✅ Weekly summary themes | ❌ Screenshots or camera frames |
| ✅ Skill areas practiced | ❌ Emotional state data |
| ✅ Time spent with AI | ❌ Biometric data |

### 8.2 AI Activity Summary Component

```typescript
// components/AIActivitySummary.tsx
interface AIActivitySummaryProps {
  weekData: {
    conversationCount: number;
    topicsDiscussed: string[];
    activitiesCompleted: string[];
    safetyFlags: number;
    favoriteTopics: string[];
  };
}

export function AIActivitySummary({ weekData }: AIActivitySummaryProps) {
  return (
    <div className="ai-activity-summary">
      <h3>🤖 Time with Pip</h3>

      <div className="summary-stats">
        <div className="stat">
          <span className="stat-value">{weekData.conversationCount}</span>
          <span className="stat-label">Conversations</span>
        </div>
        <div className="stat">
          <span className="stat-value">{weekData.activitiesCompleted.length}</span>
          <span className="stat-label">AI Activities</span>
        </div>
      </div>

      <div className="topics-section">
        <h4>Topics Explored</h4>
        <div className="topic-tags">
          {weekData.topicsDiscussed.map(topic => (
            <span key={topic} className="topic-tag">
              {getTopicEmoji(topic)} {topic}
            </span>
          ))}
        </div>
      </div>

      <div className="activities-section">
        <h4>What Pip Helped With</h4>
        <ul className="activity-list">
          {weekData.activitiesCompleted.map(activity => (
            <li key={activity}>
              {getActivityIcon(activity)} {activity}
            </li>
          ))}
        </ul>
      </div>

      {weekData.safetyFlags > 0 && (
        <div className="safety-notice">
          <h4>⚠️ Safety Notice</h4>
          <p>
            Pip detected {weekData.safetyFlags} inappropriate content requests
            and redirected the conversation appropriately.
          </p>
          <a href="/safety-details">View details →</a>
        </div>
      )}

      <div className="ai-info">
        <p>
          <strong>Note:</strong> Conversations with Pip are processed on-device
          and never stored or transmitted. This summary shows topics only.
        </p>
      </div>
    </div>
  );
}
```

### 8.3 Privacy-Preserving AI Logging

```typescript
// services/aiActivityLogger.ts

interface AIActivityEvent {
  id: string;
  childId: string;
  timestamp: string;
  activityType: 'conversation' | 'story' | 'feedback' | 'question';
  topicCategory: string;        // e.g., "animals", "science"
  topicTags: string[];          // e.g., ["dinosaurs", "fossils"]
  durationSeconds: number;
  safetyFlagged: boolean;
  safetyCategory?: string;      // e.g., "inappropriate_question"
}

// What we store
const storeAIActivity = async (event: AIActivityEvent) => {
  // Store only aggregated, anonymized data
  await db.aiActivities.add({
    ...event,
    // NEVER store:
    // - transcript
    // - audio
    // - exact questions
    // - exact responses
  });

  // Update weekly aggregation
  await updateWeeklyAISummary(event.childId, {
    conversationCount: event.activityType === 'conversation' ? 1 : 0,
    topicsDiscussed: event.topicTags,
    activitiesCompleted: [event.activityType],
    safetyFlags: event.safetyFlagged ? 1 : 0,
  });
};

// What we send to parents
const generateParentAIReport = async (childId: string, weekStart: string) => {
  const activities = await db.aiActivities
    .filter(a => a.childId === childId && a.timestamp >= weekStart)
    .toArray();

  // Aggregate topics
  const topicCounts = new Map<string, number>();
  activities.forEach(a => {
    a.topicTags.forEach(tag => {
      topicCounts.set(tag, (topicCounts.get(tag) || 0) + 1);
    });
  });

  // Get top topics
  const topTopics = Array.from(topicCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([topic]) => topic);

  return {
    conversationCount: activities.filter(a => a.activityType === 'conversation').length,
    topicsDiscussed: topTopics,
    activitiesCompleted: [...new Set(activities.map(a => a.activityType))],
    safetyFlags: activities.filter(a => a.safetyFlagged).length,
  };
};
```

---

## 9. Weekly Report Design

### 9.1 Weekly Email Template

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    /* Email-safe CSS */
  </style>
</head>
<body>
  <div class="email-container">
    <!-- Header -->
    <div class="header">
      <h1>🌟 Advay's Weekly Learning Report</h1>
      <p class="date-range">February 26 - March 4, 2026</p>
    </div>

    <!-- Highlights Section -->
    <div class="section highlights">
      <h2>This Week's Highlights</h2>
      <ul>
        <li>✅ Mastered letters: <strong>D, E, F</strong></li>
        <li>✅ Practiced counting to <strong>7</strong></li>
        <li>✅ Completed <strong>3</strong> Connect the Dots puzzles</li>
        <li>✅ Had <strong>3</strong> conversations with Pip about dinosaurs 🦕</li>
      </ul>
    </div>

    <!-- Skill Progress -->
    <div class="section skills">
      <h2>Skill Progress</h2>
      <table class="skills-table">
        <tr>
          <td>📚 Literacy</td>
          <td>
            <div class="progress-bar">
              <div class="fill" style="width: 60%">Level 5</div>
            </div>
          </td>
          <td>+2 levels</td>
        </tr>
        <tr>
          <td>🔢 Numeracy</td>
          <td>
            <div class="progress-bar">
              <div class="fill" style="width: 50%">Level 4</div>
            </div>
          </td>
          <td>Same</td>
        </tr>
        <tr>
          <td>✋ Motor Skills</td>
          <td>
            <div class="progress-bar">
              <div class="fill" style="width: 75%">Level 6 ⭐</div>
            </div>
          </td>
          <td>+1 level</td>
        </tr>
      </table>
    </div>

    <!-- Time Spent -->
    <div class="section time">
      <h2>⏱️ Active Learning Time</h2>
      <p class="big-stat">2 hours 15 minutes</p>
      <p>across 5 days this week</p>
      
      <!-- Activity Calendar Heatmap -->
      <div class="calendar-heatmap">
        <!-- Visual representation -->
      </div>
    </div>

    <!-- AI Interactions -->
    <div class="section ai">
      <h2>🤖 Time with Pip</h2>
      <p>Advay had <strong>8 conversations</strong> with Pip this week.</p>
      <p><strong>Topics explored:</strong> Dinosaurs, Space, Ocean Animals</p>
      <p><strong>Activities:</strong> Story generation, Tracing feedback, Questions</p>
    </div>

    <!-- Recommendations -->
    <div class="section recommendations">
      <h2>💡 Suggestions for Next Week</h2>
      <ol>
        <li>Try <strong>Mirror Draw</strong> - Great for motor skills!</li>
        <li>Practice <strong>numbers 6-10</strong> with Finger Numbers</li>
        <li>Consider a <strong>5-minute break</strong> between sessions</li>
      </ol>
    </div>

    <!-- Milestone Alert -->
    <div class="section milestone">
      <h3>🎯 Almost There!</h3>
      <p>Advay is <strong>2 letters away</strong> from mastering the full alphabet!</p>
      <a href="#" class="button">Continue Learning →</a>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p>
        <a href="#">View Full Dashboard</a> | 
        <a href="#">Update Settings</a> | 
        <a href="#">Unsubscribe</a>
      </p>
      <p class="privacy-note">
        This report contains only aggregated, anonymous data. 
        We never store or transmit your child's conversations.
      </p>
    </div>
  </div>
</body>
</html>
```

### 9.2 Weekly Report Generation

```typescript
// services/weeklyReportGenerator.ts

export async function generateWeeklyReport(
  childId: string,
  weekStart: string,
  weekEnd: string
): Promise<WeeklyReport> {
  // Get all progress data for the week
  const progress = await db.progress
    .filter(p => p.childId === childId && p.completedAt >= weekStart)
    .toArray();

  // Calculate metrics
  const activeTimeMinutes = calculateActiveTime(progress);
  const activeDays = countActiveDays(progress);
  const streak = calculateStreak(childId, weekEnd);
  
  // Get skill progress
  const skills = await calculateSkillProgress(childId, weekStart);
  
  // Get highlights
  const highlights = await generateHighlights(progress);
  
  // Get AI summary
  const aiSummary = await generateParentAIReport(childId, weekStart);
  
  // Get recommendations
  const recommendations = await generateRecommendations(childId, skills);

  return {
    weekStart,
    weekEnd,
    activeTimeMinutes,
    activeDays,
    streak,
    skills,
    highlights,
    aiSummary,
    recommendations,
    generatedAt: new Date().toISOString(),
  };
}

export async function sendWeeklyEmail(
  parentEmail: string,
  childName: string,
  report: WeeklyReport
): Promise<void> {
  const html = renderWeeklyEmailTemplate(childName, report);
  
  await fetch('/api/emails/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      to: parentEmail,
      subject: `📚 ${childName}'s Weekly Learning Report`,
      html,
    }),
  });
}
```

### 9.3 In-App Weekly Summary

```typescript
// components/WeeklySummaryModal.tsx
export function WeeklySummaryModal({ 
  isOpen, 
  onClose, 
  report 
}: WeeklySummaryModalProps) {
  if (!isOpen || !report) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="weekly-summary-modal" onClick={e => e.stopPropagation()}>
        <header>
          <h2>🌟 This Week's Progress</h2>
          <button onClick={onClose}>✕</button>
        </header>

        <div className="summary-content">
          <HighlightsSection highlights={report.highlights} />
          <SkillsSection skills={report.skills} />
          <TimeSection minutes={report.activeTimeMinutes} days={report.activeDays} />
          <AISection summary={report.aiSummary} />
          <RecommendationsSection recommendations={report.recommendations} />
        </div>

        <footer>
          <button 
            className="secondary-button"
            onClick={() => window.open('/report.pdf', '_blank')}
          >
            Download PDF
          </button>
          <button className="primary-button" onClick={onClose}>
            Continue Learning
          </button>
        </footer>
      </div>
    </div>
  );
}
```

---

## 10. Multi-Child Profile Management

### 10.1 Profile Management UI

```typescript
// components/ChildProfileManager.tsx
export function ChildProfileManager() {
  const { profiles, addProfile, updateProfile, deleteProfile } = useChildProfiles();
  const [isAdding, setIsAdding] = useState(false);

  return (
    <div className="child-profile-manager">
      <header>
        <h2>Child Profiles</h2>
        <button onClick={() => setIsAdding(true)}>
          + Add Child
        </button>
      </header>

      <div className="profiles-grid">
        {profiles.map(profile => (
          <div key={profile.id} className="profile-card">
            <Avatar id={profile.avatarId} size="large" />
            <h3>{profile.name}</h3>
            <p className="age">{profile.age} years old</p>
            <p className="language">{profile.preferredLanguage}</p>
            
            <div className="profile-actions">
              <button onClick={() => editProfile(profile)}>
                Edit
              </button>
              <button 
                className="danger"
                onClick={() => confirmDelete(profile)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {isAdding && (
        <AddChildModal
          onAdd={(data) => {
            addProfile(data);
            setIsAdding(false);
          }}
          onCancel={() => setIsAdding(false)}
        />
      )}
    </div>
  );
}
```

### 10.2 Add Child Form

```typescript
// components/AddChildModal.tsx
interface AddChildFormData {
  name: string;
  age: number;
  preferredLanguage: string;
  avatarId: number;
}

export function AddChildModal({ onAdd, onCancel }: AddChildModalProps) {
  const [formData, setFormData] = useState<AddChildFormData>({
    name: '',
    age: 4,
    preferredLanguage: 'en-US',
    avatarId: 1,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate
    if (!formData.name.trim()) {
      setError('Please enter a name');
      return;
    }

    if (formData.age < 3 || formData.age > 12) {
      setError('Age must be between 3 and 12');
      return;
    }

    onAdd(formData);
  };

  return (
    <div className="modal-overlay">
      <div className="add-child-modal">
        <h2>Add Child Profile</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              placeholder="Enter child's name"
              autoFocus
            />
          </div>

          <div className="form-group">
            <label>Age</label>
            <select
              value={formData.age}
              onChange={e => setFormData({...formData, age: parseInt(e.target.value)})}
            >
              {[3,4,5,6,7,8,9,10,11,12].map(age => (
                <option key={age} value={age}>{age} years old</option>
              ))}
            </select>
            <p className="note">
              This determines age-appropriate content and defaults
            </p>
          </div>

          <div className="form-group">
            <label>Preferred Language</label>
            <select
              value={formData.preferredLanguage}
              onChange={e => setFormData({...formData, preferredLanguage: e.target.value})}
            >
              <option value="en-US">English</option>
              <option value="hi-IN">Hindi</option>
              <option value="es-ES">Spanish</option>
              <option value="fr-FR">French</option>
              {/* More languages */}
            </select>
          </div>

          <div className="form-group">
            <label>Avatar</label>
            <AvatarSelector
              selectedId={formData.avatarId}
              onSelect={id => setFormData({...formData, avatarId: id})}
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="primary-button">
              Add Profile
            </button>
            <button type="button" onClick={onCancel} className="secondary-button">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
```

---

## 11. Data Export & Deletion

### 11.1 Data Export Implementation

```typescript
// services/dataExport.ts

export interface ExportData {
  childProfile: ChildProfile;
  progress: ProgressEvent[];
  skillProgress: SkillProgress[];
  aiActivitySummary: AISummary[];
  settings: ChildSettings;
  exportDate: string;
}

export async function exportChildData(childId: string): Promise<Blob> {
  // Gather all data
  const profile = await db.profiles.get(childId);
  const progress = await db.progress.filter(p => p.childId === childId).toArray();
  const skills = await calculateSkillProgress(childId);
  const aiSummary = await generateParentAIReport(childId, getWeekStart());
  const settings = await getChildSettings(childId);

  const exportData: ExportData = {
    childProfile: profile!,
    progress,
    skillProgress: skills,
    aiActivitySummary: aiSummary,
    settings,
    exportDate: new Date().toISOString(),
  };

  // Generate JSON
  const json = JSON.stringify(exportData, null, 2);
  
  // Generate PDF report
  const pdf = await generatePDFReport(exportData);

  // Create ZIP with both
  const zip = new JSZip();
  zip.file('data-export.json', json);
  zip.file('progress-report.pdf', pdf);
  
  return await zip.generateAsync({ type: 'blob' });
}

export async function downloadExport(childId: string): Promise<void> {
  const blob = await exportChildData(childId);
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `advay-learning-export-${new Date().toISOString().split('T')[0]}.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
```

### 11.2 Data Deletion Implementation

```typescript
// services/dataDeletion.ts

export async function deleteChildData(
  childId: string,
  options: {
    deleteProgress: boolean;
    deleteProfile: boolean;
    deleteSettings: boolean;
    deleteAll: boolean;
  }
): Promise<void> {
  const { deleteProgress, deleteProfile, deleteSettings, deleteAll } = options;

  if (deleteAll || deleteProgress) {
    // Delete all progress events
    const progressIds = await db.progress
      .filter(p => p.childId === childId)
      .primaryKeys();
    
    await db.progress.bulkDelete(progressIds);

    // Delete from sync queue
    const queueItems = await db.syncQueue
      .filter(item => item.payload.profileId === childId)
      .primaryKeys();
    
    await db.syncQueue.bulkDelete(queueItems);
  }

  if (deleteAll || deleteSettings) {
    await db.settings.delete(childId);
  }

  if (deleteAll || deleteProfile) {
    await db.profiles.delete(childId);
  }

  // Clear localStorage
  const keys = Object.keys(localStorage);
  keys.forEach(key => {
    if (key.includes(childId)) {
      localStorage.removeItem(key);
    }
  });

  // Notify backend for deletion
  await fetch('/api/children/' + childId, {
    method: 'DELETE',
  });

  // Log deletion for compliance
  await logDeletionEvent(childId, {
    timestamp: new Date().toISOString(),
    scope: options,
  });
}
```

### 11.3 Deletion Confirmation UI

```typescript
// components/DeleteDataModal.tsx
export function DeleteDataModal({ 
  isOpen, 
  onClose, 
  childName 
}: DeleteDataModalProps) {
  const [confirmName, setConfirmName] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (confirmName !== childName) {
      setError('Please type the child\'s name to confirm');
      return;
    }

    setIsDeleting(true);
    
    try {
      await deleteChildData(childId, { deleteAll: true });
      onSuccess();
    } catch (error) {
      setError('Deletion failed. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="delete-data-modal">
        <h2>⚠️ Delete All Data</h2>
        
        <div className="warning-box">
          <p>
            This will permanently delete all data for <strong>{childName}</strong>:
          </p>
          <ul>
            <li>All progress and achievements</li>
            <li>Skill levels and XP</li>
            <li>Settings and preferences</li>
            <li>AI activity summaries</li>
          </ul>
          <p className="warning">
            This action cannot be undone.
          </p>
        </div>

        <div className="confirmation">
          <label>
            Type "{childName}" to confirm:
          </label>
          <input
            type="text"
            value={confirmName}
            onChange={e => setConfirmName(e.target.value)}
            placeholder={childName}
          />
        </div>

        <div className="modal-actions">
          <button
            className="danger-button"
            onClick={handleDelete}
            disabled={isDeleting || confirmName !== childName}
          >
            {isDeleting ? 'Deleting...' : 'Delete Everything'}
          </button>
          <button
            className="secondary-button"
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
```

---

## 12. Implementation Roadmap

### Phase 1: Foundation (Weeks 1-3)

| Task | Effort | Priority | Status |
|------|--------|----------|--------|
| Dashboard layout & navigation | 3 days | P0 | 🔧 TODO |
| Child profile management | 2 days | P0 | 🔧 TODO |
| Weekly progress calculations | 3 days | P0 | 🔧 TODO |
| Basic settings UI | 2 days | P0 | 🔧 TODO |
| Parental gate component | 2 days | P0 | 🔧 TODO |

### Phase 2: Screen Time & Controls (Weeks 4-5)

| Task | Effort | Priority | Status |
|------|--------|----------|--------|
| Screen time tracking | 2 days | P0 | 🔧 TODO |
| Bedtime mode | 1 day | P1 | 🔧 TODO |
| Break reminders | 1 day | P1 | 🔧 TODO |
| Advanced settings | 2 days | P1 | 🔧 TODO |
| Accessibility settings | 2 days | P1 | 🔧 TODO |

### Phase 3: AI Transparency (Weeks 6-7)

| Task | Effort | Priority | Status |
|------|--------|----------|--------|
| AI activity logging | 2 days | P0 | 🔧 TODO |
| AI summary generation | 2 days | P0 | 🔧 TODO |
| Privacy-preserving aggregation | 2 days | P0 | 🔧 TODO |
| Safety flag reporting | 1 day | P0 | 🔧 TODO |

### Phase 4: Weekly Reports (Weeks 8-9)

| Task | Effort | Priority | Status |
|------|--------|----------|--------|
| Email template design | 2 days | P1 | 🔧 TODO |
| Report generation | 3 days | P1 | 🔧 TODO |
| Email delivery service | 2 days | P1 | 🔧 TODO |
| In-app summary modal | 2 days | P2 | 🔧 TODO |

### Phase 5: Data Portability (Week 10)

| Task | Effort | Priority | Status |
|------|--------|----------|--------|
| Data export (JSON) | 2 days | P0 | 🔧 TODO |
| PDF report generation | 2 days | P1 | 🔧 TODO |
| Data deletion | 2 days | P0 | 🔧 TODO |
| Compliance logging | 1 day | P0 | 🔧 TODO |

### Total Effort Summary

| Phase | Duration | Engineering Days | Design Days |
|-------|----------|------------------|-------------|
| Phase 1 | 3 weeks | 12 days | 3 days |
| Phase 2 | 2 weeks | 8 days | 2 days |
| Phase 3 | 2 weeks | 7 days | 2 days |
| Phase 4 | 2 weeks | 9 days | 3 days |
| Phase 5 | 1 week | 7 days | 1 day |
| **Total** | **10 weeks** | **43 days** | **11 days** |

---

## 13. References and Links

### Parent Research

- [Common Sense Media: Parent Concerns Survey 2025](https://www.commonsensemedia.org/research)
- [AAP Screen Time Guidelines](https://www.aap.org/screen-time)
- [Pew Research: Parenting in the Digital Age](https://www.pewresearch.org/internet/parenting/)

### COPPA Compliance

- [FTC COPPA Guidance](https://www.ftc.gov/business-guidance/privacy-security/childrens-privacy)
- [COPPA Safe Harbor Programs](https://www.ftc.gov/tips-advice/business-center/privacy-and-security/childrens-privacy)
- [kidSAFE Seal Program](https://kidsafeseal.com/)

### Design Patterns

- [Khan Academy Kids Parent Section](https://khanacademy.org/kids)
- [YouTube Kids Parental Controls](https://www.youtube.com/kids)
- [Duolingo ABC Parent Dashboard](https://duolingo.com/abc)

### Technical References

- [React Hook Form](https://react-hook-form.com/) - Form handling
- [Zustand](https://github.com/pmndrs/zustand) - State management
- [EmailJS](https://www.emailjs.com/) - Email delivery
- [jsPDF](https://github.com/parallax/jsPDF) - PDF generation
- [JSZip](https://stuk.github.io/jszip/) - ZIP creation

### Related Project Documents

- [Child Analytics Framework](./CHILD_ANALYTICS_FRAMEWORK.md)
- [Content Safety Moderation](./CONTENT_SAFETY_MODERATION.md)
- [Accessibility Inclusive Design](./ACCESSIBILITY_INCLUSIVE_DESIGN.md)
- [SKILLS_PROGRESSION_SYSTEM.md](../SKILLS_PROGRESSION_SYSTEM.md)
- [parent-dashboard-guide.md](../parent-dashboard-guide.md)

---

*Last updated: 2026-03-05*
