# IndexedDB Schema Design for Progress + Skills
**Privacy-First, Offline-First Data Layer for Children's Learning Apps**

---

**Document Version**: 1.0
**Created**: 2026-03-05
**Status**: Implementation-Ready
**Owner**: Engineering Team
**Priority**: P0 (MVP Blocking)

---

## Table of Contents
1. [Executive Summary](#1-executive-summary)
2. [Design Principles](#2-design-principles)
3. [Schema Overview](#3-schema-overview)
4. [Core Tables](#4-core-tables)
5. [Event Sourcing Pattern](#5-event-sourcing-pattern)
6. [Dexie.js Implementation](#6-dexiejs-implementation)
7. [Query Patterns for Parent Dashboard](#7-query-patterns-for-parent-dashboard)
8. [Data Migration Strategy](#8-data-migration-strategy)
9. [Sync & Conflict Resolution](#9-sync--conflict-resolution)
10. [Privacy & Data Retention](#10-privacy--data-retention)
11. [Testing Strategy](#11-testing-strategy)
12. [Implementation Checklist](#12-implementation-checklist)
13. [References](#13-references)

---

## 1. Executive Summary

### 1.1 Purpose
This document defines the IndexedDB schema and data access patterns for storing learning progress, skills progression, and analytics events in the Advay Vision Learning platform. The design prioritizes **offline-first operation**, **privacy by design**, and **efficient parent dashboard queries**.

### 1.2 Key Decisions
| Decision | Rationale | Implementation |
|----------|-----------|----------------|
| **Event Sourcing** | Immutable audit trail, easy sync, conflict-free | Append-only `ProgressEvent` table |
| **Dexie.js Wrapper** | Type-safe, query-friendly, migration support | `AdvayDB extends Dexie` class |
| **Local-Only PII** | COPPA/GDPR-K compliance | No cloud sync of child names, IDs are UUIDs |
| **Aggregated Views** | Fast parent dashboard queries | Pre-computed `SkillSummary` table |
| **Time-Partitioned Storage** | Efficient cleanup, retention policies | `timestamp` index on all event tables |

### 1.3 Storage Targets
| Data Type | Estimated Size/Child/Month | Retention | Notes |
|-----------|---------------------------|-----------|-------|
| Progress Events | ~50 KB | 90 days | Raw interaction data |
| Skill Summaries | ~5 KB | Indefinite | Aggregated, parent-facing |
| Session Metadata | ~10 KB | 30 days | For analytics, anonymized |
| AI Conversation Logs | 0 KB | Never stored | Privacy by design |
| Camera/Media Data | 0 KB | Never stored | Processed locally, discarded |

### 1.4 What This Document Covers
- ✅ Complete TypeScript interfaces for all data entities
- ✅ Dexie.js schema definition with indexes
- ✅ Event sourcing pattern implementation
- ✅ Query patterns for common parent dashboard views
- ✅ Data migration strategy for schema evolution
- ✅ Sync protocol with idempotency keys
- ✅ Privacy-preserving data retention policies
- ✅ Testing strategy (unit, integration, stress)

### 1.5 What This Document Does NOT Cover
- ❌ Backend API design (see `INITIATIVE_04_BACKEND_INFRA.md`)
- ❌ Cloud sync implementation (see `OFFLINE_FIRST_SYNC_STRATEGY.md`)
- ❌ Parent dashboard UI components (separate UX docs)
- ❌ Analytics export formats (CSV/PDF generation)

---

## 2. Design Principles

### 2.1 Privacy-First Data Model
```typescript
// What we store (local only)
interface LocalOnlyData {
  childId: string;        // UUID, not linked to real identity
  displayName: string;    // Parent-set nickname, e.g., "Advay"
  ageBand: '3-4' | '5-6' | '7-8'; // For age-appropriate content
  preferences: ChildPreferences; // UI settings, not PII
}

// What we NEVER store
interface ProhibitedData {
  // ❌ Personal identifiers
  email?: string;         // Never collect
  phone?: string;         // Never collect
  photo?: Blob;           // Never collect biometrics
  location?: GeoPosition; // Never collect
  
  // ❌ Raw interaction data
  cameraFrames?: Blob[];  // Process & discard immediately
  audioRecordings?: Blob[]; // Process & discard immediately
  keystrokeTimings?: number[]; // Too granular, privacy risk
  
  // ❌ Identifiable analytics
  deviceId?: string;      // Use anonymous session IDs only
  ipAddress?: string;     // Never log
  userAgent?: string;     // Only store browser family, not full string
}
```

### 2.2 Event Sourcing Benefits
```
┌─────────────────────────────────────────────────────────┐
│              EVENT SOURCING ARCHITECTURE                 │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────┐                                       │
│  │  Game Play  │                                       │
│  └──────┬──────┘                                       │
│         │                                              │
│         ▼                                              │
│  ┌─────────────┐                                       │
│  │ Append Event│  ← Immutable, append-only             │
│  │ to IndexedDB│                                       │
│  └──────┬──────┘                                       │
│         │                                              │
│         ▼                                              │
│  ┌─────────────┐  ┌─────────────┐                     │
│  │  Derive     │  │  Sync to    │                     │
│  │  State      │  │  Cloud*     │                     │
│  │  (Queries)  │  │  (Optional) │                     │
│  └─────────────┘  └─────────────┘                     │
│                                                         │
│  * Cloud sync is parent-gated, aggregated only         │
└─────────────────────────────────────────────────────────┘
```

**Benefits for Children's Apps:**
- ✅ **Conflict-free**: Events are immutable; no merge conflicts
- ✅ **Audit trail**: Full history for parent transparency (if enabled)
- ✅ **Easy sync**: Just upload unsynced events with idempotency keys
- ✅ **Flexible queries**: Derive any metric from raw events
- ✅ **Privacy**: Can delete raw events while keeping aggregates

### 2.3 Query Performance Targets
| Query Type | Target Latency | Index Strategy |
|------------|---------------|----------------|
| Get child's recent progress | <50ms | `[childId+timestamp]` compound index |
| Get skill mastery level | <20ms | Pre-computed `SkillSummary` table |
| Get weekly activity heatmap | <100ms | `[childId+activityType+date]` index |
| Export progress report | <500ms | Batch query with cursor |
| Find struggling areas | <200ms | `[childId+accuracy+timestamp]` index |

---

## 3. Schema Overview

### 3.1 Entity Relationship Diagram
```
┌─────────────────┐       ┌─────────────────┐
│   ChildProfile  │       │   ProgressEvent │
├─────────────────┤       ├─────────────────┤
│ id (PK)         │1    *│ id (PK)         │
│ displayName     │──────│ childId (FK)    │
│ ageBand         │       │ activityType    │
│ createdAt       │       │ contentId       │
│ updatedAt       │       │ score           │
│ preferences     │       │ duration        │
└─────────────────┘       │ metadata        │
                          │ timestamp       │
                          │ synced          │
                          │ idempotencyKey  │
                          └────────┬────────┘
                                   │
                                   ▼
                          ┌─────────────────┐
                          │   SkillEvent    │
                          ├─────────────────┤
                          │ id (PK)         │
                          │ childId (FK)    │
                          │ skillId         │
                          │ xpEarned        │
                          │ levelAchieved   │
                          │ timestamp       │
                          └────────┬────────┘
                                   │
                                   ▼
                          ┌─────────────────┐
                          │  SkillSummary   │
                          ├─────────────────┤
                          │ childId (PK,FK) │
                          │ skillId (PK)    │
                          │ currentLevel    │
                          │ currentXP       │
                          │ totalXP         │
                          │ lastUpdated     │
                          │ subskills       │ (JSON)
                          └─────────────────┘
```

### 3.2 Table Summary
| Table | Purpose | Approx. Rows/Child | Key Indexes |
|-------|---------|-------------------|-------------|
| `childProfiles` | Child metadata, preferences | 1 | `id` (PK) |
| `progressEvents` | Raw learning interactions | ~100/day | `[childId+timestamp]`, `[activityType+timestamp]` |
| `skillEvents` | XP/level progression events | ~20/day | `[childId+skillId+timestamp]` |
| `skillSummaries` | Pre-computed skill state | 5 (one per skill) | `[childId+skillId]` (PK) |
| `sessionMetadata` | Anonymous session analytics | ~5/day | `[childId+timestamp]` |
| `syncQueue` | Pending cloud sync items | Variable | `[priority+createdAt]` |
| `modelCache` | Cached AI responses | Variable | `[cacheKey+expiresAt]` |

---

## 4. Core Tables

### 4.1 ChildProfile Table
```typescript
// src/db/schemas/ChildProfile.ts

export interface ChildProfile {
  // Primary key - anonymous UUID
  id: string; // crypto.randomUUID()
  
  // Display name (parent-set, not PII)
  displayName: string; // e.g., "Advay", "Maya"
  
  // Age band for content adaptation
  ageBand: '3-4' | '5-6' | '7-8';
  
  // Learning preferences
  preferences: {
    primaryLanguage: string; // 'en', 'hi', 'es', etc.
    difficulty: 'easy' | 'medium' | 'hard';
    sessionLimitMinutes?: number; // Parent-set limit
    enableCamera?: boolean; // Default true, parent-toggleable
    enableVoice?: boolean; // Default true, parent-toggleable
  };
  
  // Metadata
  createdAt: number; // Unix timestamp
  updatedAt: number;
  lastActiveAt?: number;
  
  // Sync status (for multi-device households)
  lastSyncedAt?: number;
  syncVersion: number; // For conflict detection
}

// Dexie schema definition
export const childProfilesSchema = {
  id: '++id', // Auto-increment (or use string UUID)
  '&id': '',  // Unique index on id
  'displayName': '',
  'ageBand': '',
  'preferences.primaryLanguage': '',
  'createdAt': '',
  'lastActiveAt': '',
  // Compound index for common queries
  '[ageBand+lastActiveAt]': '',
};
```

### 4.2 ProgressEvent Table (Event Sourcing Core)
```typescript
// src/db/schemas/ProgressEvent.ts

export type ActivityType = 
  | 'letter_tracing'
  | 'letter_recognition'
  | 'finger_number_show'
  | 'connect_the_dots'
  | 'mirror_draw'
  | 'story_sequence'
  | 'color_by_number'
  | 'free_exploration';

export interface ProgressEvent {
  // Primary key - idempotency key for sync
  id: string; // UUID, generated client-side
  
  // Foreign key to child
  childId: string;
  
  // Activity identification
  activityType: ActivityType;
  contentId: string; // e.g., 'letter-A', 'number-5', 'dragon-story'
  
  // Performance metrics
  score: number; // 0-100
  accuracy?: number; // 0.0-1.0 for tracing
  durationSeconds: number;
  attempts?: number; // For retryable activities
  
  // Contextual metadata (bounded, non-sensitive)
  metadata: {
    // Tracing-specific
    letter?: string;
    strokeOrder?: number[];
    
    // Number-specific
    number?: number;
    fingerCount?: number;
    
    // Game-specific
    level?: number;
    hintsUsed?: number;
    
    // Always bounded - no free-form text
    [key: string]: string | number | boolean | null;
  };
  
  // Timestamps
  timestamp: number; // Unix timestamp (ms)
  createdAt: number; // Local DB insert time
  
  // Sync status
  synced: boolean;
  syncedAt?: number;
  idempotencyKey: string; // Same as id, for clarity
  
  // Optional: struggle indicators (for parent insights)
  struggleIndicators?: {
    timeoutIssues?: boolean;
    confusionPattern?: 'b-d' | 'p-q' | '6-9';
    neededHelp?: boolean;
  };
}

// Dexie schema definition
export const progressEventsSchema = {
  id: '++id',
  '&id': '', // Unique
  '&idempotencyKey': '', // Unique for deduplication
  'childId': '',
  'activityType': '',
  'contentId': '',
  'timestamp': '',
  'synced': '',
  // Compound indexes for common queries
  '[childId+timestamp]': '',
  '[childId+activityType+timestamp]': '',
  '[activityType+score+timestamp]': '', // For analytics
  '[childId+synced+timestamp]': '', // For sync queue
};
```

### 4.3 SkillEvent & SkillSummary Tables
```typescript
// src/db/schemas/SkillProgress.ts

export type SkillId = 'literacy' | 'numeracy' | 'motor' | 'logic' | 'creative';

export interface SkillEvent {
  id: string; // UUID
  childId: string;
  skillId: SkillId;
  
  // XP progression
  xpEarned: number; // Positive integer
  reason: 'activity_complete' | 'streak_bonus' | 'mastery_achievement';
  
  // Level changes (if any)
  levelAchieved?: number; // 1-10
  previousLevel?: number;
  
  // Source activity reference
  sourceActivityId?: string; // ProgressEvent.id
  
  timestamp: number;
}

export interface SkillSummary {
  // Composite primary key
  childId: string;
  skillId: SkillId;
  
  // Current state
  currentLevel: number; // 1-10
  currentXP: number; // XP in current level
  totalXP: number; // Lifetime XP
  
  // Sub-skill breakdown (for detailed insights)
  subskills: Record<string, {
    attempts: number;
    accuracy: number;
    mastered: boolean;
    lastPracticed?: number;
  }>;
  
  // Derived metrics
  streakDays: number;
  lastPracticedAt?: number;
  masteryProgress: number; // 0-100% to next level
  
  // Metadata
  lastUpdated: number;
}

// Dexie schema definitions
export const skillEventsSchema = {
  id: '++id',
  '&id': '',
  'childId': '',
  'skillId': '',
  'timestamp': '',
  '[childId+skillId+timestamp]': '',
};

export const skillSummariesSchema = {
  // Composite primary key in Dexie
  '[childId+skillId]': '',
  'childId': '',
  'skillId': '',
  'currentLevel': '',
  'totalXP': '',
  'lastPracticedAt': '',
  '[childId+currentLevel]': '', // For "kids at level X" queries
};
```

### 4.4 SessionMetadata Table (Anonymous Analytics)
```typescript
// src/db/schemas/SessionMetadata.ts

export interface SessionMetadata {
  id: string; // UUID
  childId: string;
  
  // Anonymous session identifiers
  sessionId: string; // Short ID, not traceable to device
  
  // Session metrics (aggregated, no PII)
  startTime: number;
  endTime: number;
  durationSeconds: number;
  activitiesCompleted: number;
  totalScore: number;
  
  // Device category (not specific model)
  deviceCategory: 'tablet' | 'phone' | 'desktop' | 'unknown';
  browserFamily: 'chromium' | 'firefox' | 'safari' | 'other';
  
  // Connectivity (for offline analysis)
  wasOffline: boolean;
  syncCompleted: boolean;
  
  timestamp: number;
}

export const sessionMetadataSchema = {
  id: '++id',
  '&id': '',
  '&sessionId': '', // Unique
  'childId': '',
  'startTime': '',
  'wasOffline': '',
  '[childId+startTime]': '',
  '[wasOffline+timestamp]': '', // For offline usage analysis
};
```

### 4.5 SyncQueue Table
```typescript
// src/db/schemas/SyncQueue.ts

export type SyncEntityType = 'progress' | 'skill' | 'session';

export interface SyncQueueItem {
  id: string; // UUID
  entityType: SyncEntityType;
  entityId: string; // Reference to source table PK
  
  // Sync metadata
  priority: 'low' | 'normal' | 'high'; // High for parent-visible data
  retryCount: number;
  lastAttemptAt?: number;
  nextAttemptAt: number; // Exponential backoff
  
  // Payload (minimal, aggregated)
  payload: {
    // For progress events
    activityType?: ActivityType;
    score?: number;
    timestamp?: number;
    
    // For skill events
    skillId?: SkillId;
    xpEarned?: number;
    
    // Always anonymized
    childId?: never; // Never include in sync payload
  };
  
  createdAt: number;
}

export const syncQueueSchema = {
  id: '++id',
  '&id': '',
  'entityType': '',
  'priority': '',
  'nextAttemptAt': '',
  'retryCount': '',
  // Index for processing queue
  '[priority+nextAttemptAt]': '',
  '[entityType+synced]': '',
};
```

---

## 5. Event Sourcing Pattern

### 5.1 Recording Events (Write Path)
```typescript
// src/db/repositories/ProgressEventRepository.ts

import { AdvayDB } from '../AdvayDB';
import { ProgressEvent, ActivityType } from '../schemas/ProgressEvent';

export class ProgressEventRepository {
  constructor(private db: AdvayDB) {}
  
  async recordEvent(event: Omit<ProgressEvent, 'id' | 'createdAt' | 'synced' | 'idempotencyKey'>): Promise<string> {
    // Generate idempotency key (deterministic for deduplication)
    const idempotencyKey = this.generateIdempotencyKey(event);
    
    const progressEvent: ProgressEvent = {
      ...event,
      id: crypto.randomUUID(),
      idempotencyKey,
      createdAt: Date.now(),
      synced: false,
    };
    
    // Transactional write
    await this.db.transaction('rw', this.db.progressEvents, async () => {
      // Check for duplicate (idempotency)
      const existing = await this.db.progressEvents.get(idempotencyKey);
      if (existing) {
        // Already recorded - return existing ID
        return existing.id;
      }
      
      // Insert new event
      await this.db.progressEvents.add(progressEvent);
      
      // Queue for sync (if online)
      if (navigator.onLine) {
        await this.queueForSync(progressEvent);
      }
      
      // Update skill summaries (denormalization for query performance)
      await this.updateSkillSummaries(progressEvent);
    });
    
    return progressEvent.id;
  }
  
  private generateIdempotencyKey(event: {
    childId: string;
    activityType: ActivityType;
    contentId: string;
    timestamp: number;
  }): string {
    // Deterministic key for deduplication across devices
    const data = `${event.childId}:${event.activityType}:${event.contentId}:${Math.floor(event.timestamp / 1000)}`;
    return crypto.randomUUID(); // Or hash for deterministic: await generateHash(data)
  }
  
  private async queueForSync(event: ProgressEvent): Promise<void> {
    await this.db.syncQueue.add({
      id: crypto.randomUUID(),
      entityType: 'progress',
      entityId: event.id,
      priority: 'normal',
      retryCount: 0,
      nextAttemptAt: Date.now(),
      payload: {
        activityType: event.activityType,
        score: event.score,
        timestamp: event.timestamp,
      },
      createdAt: Date.now(),
    });
  }
  
  private async updateSkillSummaries(event: ProgressEvent): Promise<void> {
    // Map activity to skills
    const skills = this.mapActivityToSkills(event.activityType);
    
    for (const skillId of skills) {
      // Increment XP
      const xpEarned = this.calculateXPEarned(event);
      
      // Upsert summary
      await this.db.skillSummaries.where('[childId+skillId]')
        .equals([event.childId, skillId])
        .modify(summary => {
          if (summary) {
            summary.currentXP += xpEarned;
            summary.totalXP += xpEarned;
            summary.lastPracticedAt = event.timestamp;
            summary.lastUpdated = Date.now();
            
            // Check for level up
            if (summary.currentXP >= this.getXPForLevel(summary.currentLevel + 1)) {
              summary.currentLevel += 1;
              summary.currentXP = 0;
            }
          }
        });
    }
  }
  
  private mapActivityToSkills(activity: ActivityType): SkillId[] {
    const mapping: Record<ActivityType, SkillId[]> = {
      'letter_tracing': ['literacy', 'motor'],
      'letter_recognition': ['literacy'],
      'finger_number_show': ['numeracy', 'motor'],
      'connect_the_dots': ['motor', 'logic'],
      'mirror_draw': ['motor', 'creative'],
      'story_sequence': ['literacy', 'logic'],
      'color_by_number': ['numeracy', 'creative'],
      'free_exploration': ['creative'],
    };
    return mapping[activity] || [];
  }
  
  private calculateXPEarned(event: ProgressEvent): number {
    // Base XP for completion
    let xp = 10;
    
    // Bonus for accuracy
    if (event.accuracy && event.accuracy > 0.8) xp += 5;
    
    // Bonus for speed (if applicable)
    if (event.durationSeconds && event.durationSeconds < 30) xp += 3;
    
    // Penalty for hints (encourages independence)
    if (event.metadata.hintsUsed && event.metadata.hintsUsed > 0) xp -= 2;
    
    return Math.max(1, xp); // Minimum 1 XP for participation
  }
  
  private getXPForLevel(level: number): number {
    // Exponential XP curve: Level 2 = 100, Level 10 = 4500
    return Math.round(100 * Math.pow(1.5, level - 2));
  }
}
```

### 5.2 Querying Events (Read Path)
```typescript
// src/db/repositories/AnalyticsRepository.ts

export class AnalyticsRepository {
  constructor(private db: AdvayDB) {}
  
  // Get recent progress for parent dashboard
  async getRecentProgress(childId: string, limit: number = 20): Promise<ProgressEvent[]> {
    return await this.db.progressEvents
      .where('[childId+timestamp]')
      .between([childId, Date.now() - 7 * 24 * 60 * 60 * 1000], [childId, Date.now()])
      .reverse()
      .limit(limit)
      .toArray();
  }
  
  // Get skill mastery levels
  async getSkillLevels(childId: string): Promise<Record<SkillId, number>> {
    const summaries = await this.db.skillSummaries
      .where('childId')
      .equals(childId)
      .toArray();
    
    return Object.fromEntries(
      summaries.map(s => [s.skillId, s.currentLevel])
    ) as Record<SkillId, number>;
  }
  
  // Get weekly activity heatmap data
  async getActivityHeatmap(childId: string, weeks: number = 4): Promise<HeatmapData[]> {
    const startDate = Date.now() - (weeks * 7 * 24 * 60 * 60 * 1000);
    
    // Group by date
    const events = await this.db.progressEvents
      .where('[childId+timestamp]')
      .between([childId, startDate], [childId, Date.now()])
      .toArray();
    
    // Aggregate by day
    const byDay = new Map<string, number>();
    for (const event of events) {
      const day = new Date(event.timestamp).toISOString().split('T')[0];
      byDay.set(day, (byDay.get(day) || 0) + 1);
    }
    
    return Array.from(byDay.entries()).map(([date, count]) => ({
      date,
      count,
      // Optional: break down by activity type
      // byType: await this.getBreakdownByType(childId, date),
    }));
  }
  
  // Identify areas needing support (struggle detection)
  async getStruggleAreas(childId: string): Promise<StruggleIndicator[]> {
    const recent = await this.db.progressEvents
      .where('[childId+timestamp]')
      .between([childId, Date.now() - 7 * 24 * 60 * 60 * 1000], [childId, Date.now()])
      .filter(e => e.struggleIndicators || (e.accuracy && e.accuracy < 0.5))
      .toArray();
    
    // Group by content
    const byContent = new Map<string, { count: number; avgAccuracy: number }>();
    for (const event of recent) {
      const key = `${event.activityType}:${event.contentId}`;
      const existing = byContent.get(key) || { count: 0, avgAccuracy: 0 };
      
      byContent.set(key, {
        count: existing.count + 1,
        avgAccuracy: (existing.avgAccuracy * existing.count + (event.accuracy || 0)) / (existing.count + 1),
      });
    }
    
    // Return items with low accuracy and multiple attempts
    return Array.from(byContent.entries())
      .filter(([, data]) => data.count >= 3 && data.avgAccuracy < 0.6)
      .map(([key, data]) => {
        const [activityType, contentId] = key.split(':');
        return {
          activityType: activityType as ActivityType,
          contentId,
          attempts: data.count,
          avgAccuracy: data.avgAccuracy,
          recommendation: this.getRecommendation(activityType as ActivityType, contentId),
        };
      });
  }
  
  private getRecommendation(activity: ActivityType, content: string): string {
    // Simple rule-based recommendations
    if (activity === 'letter_tracing' && /[bdpq]/.test(content)) {
      return 'Practice mirror letters with visual guides';
    }
    if (activity === 'finger_number_show' && parseInt(content) > 5) {
      return 'Use physical objects to practice counting';
    }
    return 'Try again with hints enabled';
  }
}

interface HeatmapData {
  date: string; // YYYY-MM-DD
  count: number;
}

interface StruggleIndicator {
  activityType: ActivityType;
  contentId: string;
  attempts: number;
  avgAccuracy: number;
  recommendation: string;
}
```

---

## 6. Dexie.js Implementation

### 6.1 Database Class Definition
```typescript
// src/db/AdvayDB.ts

import Dexie, { Table } from 'dexie';
import { 
  ChildProfile, 
  ProgressEvent, 
  SkillEvent, 
  SkillSummary, 
  SessionMetadata, 
  SyncQueueItem 
} from './schemas';

export class AdvayDB extends Dexie {
  // Table declarations (for TypeScript)
  childProfiles!: Table<ChildProfile, string>;
  progressEvents!: Table<ProgressEvent, string>;
  skillEvents!: Table<SkillEvent, string>;
  skillSummaries!: Table<SkillSummary, [string, SkillId]>; // Composite key
  sessionMetadata!: Table<SessionMetadata, string>;
  syncQueue!: Table<SyncQueueItem, string>;
  
  constructor() {
    super('AdvayDB');
    
    // Schema versioning (critical for migrations)
    this.version(1).stores({
      // Child profiles
      childProfiles: 'id, displayName, ageBand, preferences.primaryLanguage, createdAt, lastActiveAt, [ageBand+lastActiveAt]',
      
      // Progress events (event sourcing core)
      progressEvents: 'id, idempotencyKey, childId, activityType, contentId, timestamp, synced, [childId+timestamp], [childId+activityType+timestamp], [activityType+score+timestamp], [childId+synced+timestamp]',
      
      // Skill progression
      skillEvents: 'id, childId, skillId, timestamp, [childId+skillId+timestamp]',
      skillSummaries: '[childId+skillId], childId, skillId, currentLevel, totalXP, lastPracticedAt, [childId+currentLevel]',
      
      // Session analytics (anonymous)
      sessionMetadata: 'id, sessionId, childId, startTime, wasOffline, [childId+startTime], [wasOffline+timestamp]',
      
      // Sync queue
      syncQueue: 'id, entityType, priority, nextAttemptAt, retryCount, [priority+nextAttemptAt], [entityType+synced]',
    });
    
    // Future version example (schema evolution)
    // this.version(2).stores({
    //   // Add new fields or indexes
    //   progressEvents: '..., metadata.letter, metadata.number',
    // }).upgrade(tx => {
    //   // Migration logic
    //   return tx.table('progressEvents').toCollection().modify(event => {
    //     // Transform old schema to new
    //   });
    // });
  }
  
  // Helper: Open database with error handling
  static async open(): Promise<AdvayDB> {
    const db = new AdvayDB();
    try {
      await db.open();
      return db;
    } catch (error) {
      console.error('Failed to open IndexedDB:', error);
      // Fallback: return in-memory mock for development
      if (process.env.NODE_ENV === 'development') {
        return new MockAdvayDB();
      }
      throw error;
    }
  }
  
  // Helper: Clear all data (for testing or parent-initiated delete)
  async clearAll(childId?: string): Promise<void> {
    if (childId) {
      // Delete only specific child's data
      await this.childProfiles.delete(childId);
      await this.progressEvents.where('childId').equals(childId).delete();
      await this.skillEvents.where('childId').equals(childId).delete();
      await this.skillSummaries.where('childId').equals(childId).delete();
      await this.sessionMetadata.where('childId').equals(childId).delete();
    } else {
      // Delete everything (parent confirmation required)
      await this.delete();
    }
  }
  
  // Helper: Export data for parent download (privacy-preserving)
  async exportData(childId: string): Promise<ExportData> {
    const [profile, progress, skills, sessions] = await Promise.all([
      this.childProfiles.get(childId),
      this.progressEvents.where('childId').equals(childId).toArray(),
      this.skillSummaries.where('childId').equals(childId).toArray(),
      this.sessionMetadata.where('childId').equals(childId).toArray(),
    ]);
    
    return {
      exportedAt: new Date().toISOString(),
      child: {
        displayName: profile?.displayName,
        ageBand: profile?.ageBand,
        // Note: NOT including id or other identifiers
      },
      progress: progress.map(p => ({
        activityType: p.activityType,
        contentId: p.contentId,
        score: p.score,
        timestamp: p.timestamp,
        // Note: NOT including metadata that could be identifying
      })),
      skills: skills.map(s => ({
        skillId: s.skillId,
        currentLevel: s.currentLevel,
        totalXP: s.totalXP,
        lastPracticedAt: s.lastPracticedAt,
      })),
      sessions: sessions.map(s => ({
        durationSeconds: s.durationSeconds,
        activitiesCompleted: s.activitiesCompleted,
        startTime: s.startTime,
        // Note: NOT including sessionId or device info
      })),
    };
  }
}

interface ExportData {
  exportedAt: string;
  child: {
    displayName?: string;
    ageBand?: string;
  };
  progress: Array<{
    activityType: string;
    contentId: string;
    score: number;
    timestamp: number;
  }>;
  skills: Array<{
    skillId: string;
    currentLevel: number;
    totalXP: number;
    lastPracticedAt?: number;
  }>;
  sessions: Array<{
    durationSeconds: number;
    activitiesCompleted: number;
    startTime: number;
  }>;
}

// Mock database for testing/development
export class MockAdvayDB extends AdvayDB {
  // Override methods to use in-memory storage
  // Implementation omitted for brevity
}
```

### 6.2 Repository Pattern Usage
```typescript
// src/services/ProgressService.ts

import { AdvayDB } from '../db/AdvayDB';
import { ProgressEventRepository } from '../db/repositories/ProgressEventRepository';
import { AnalyticsRepository } from '../db/repositories/AnalyticsRepository';

export class ProgressService {
  private db: AdvayDB;
  private progressRepo: ProgressEventRepository;
  private analyticsRepo: AnalyticsRepository;
  
  constructor(db: AdvayDB) {
    this.db = db;
    this.progressRepo = new ProgressEventRepository(db);
    this.analyticsRepo = new AnalyticsRepository(db);
  }
  
  // Record a learning activity
  async recordActivity(params: {
    childId: string;
    activityType: ActivityType;
    contentId: string;
    score: number;
    durationSeconds: number;
    metadata?: Record<string, any>;
  }): Promise<void> {
    await this.progressRepo.recordEvent({
      childId: params.childId,
      activityType: params.activityType,
      contentId: params.contentId,
      score: params.score,
      durationSeconds: params.durationSeconds,
      metadata: params.metadata || {},
      timestamp: Date.now(),
    });
  }
  
  // Get data for parent dashboard
  async getParentDashboardData(childId: string): Promise<DashboardData> {
    const [recent, levels, heatmap, struggles] = await Promise.all([
      this.analyticsRepo.getRecentProgress(childId),
      this.analyticsRepo.getSkillLevels(childId),
      this.analyticsRepo.getActivityHeatmap(childId),
      this.analyticsRepo.getStruggleAreas(childId),
    ]);
    
    return {
      recentActivities: recent.slice(0, 10),
      skillLevels: levels,
      activityHeatmap: heatmap,
      struggleAreas: struggles,
      // Add computed insights
      insights: this.generateInsights(recent, levels, struggles),
    };
  }
  
  private generateInsights(
    recent: ProgressEvent[],
    levels: Record<SkillId, number>,
    struggles: StruggleIndicator[]
  ): Insight[] {
    const insights: Insight[] = [];
    
    // Celebrate progress
    const literacyLevel = levels.literacy;
    if (literacyLevel >= 3) {
      insights.push({
        type: 'achievement',
        message: `Great progress in reading! Level ${literacyLevel} unlocked.`,
      });
    }
    
    // Suggest practice for struggles
    if (struggles.length > 0) {
      insights.push({
        type: 'recommendation',
        message: `Try practicing ${struggles[0].contentId} with hints enabled.`,
      });
    }
    
    // Encourage consistency
    const recentCount = recent.filter(
      e => e.timestamp > Date.now() - 24 * 60 * 60 * 1000
    ).length;
    if (recentCount >= 3) {
      insights.push({
        type: 'encouragement',
        message: 'Amazing consistency! Keep up the great work.',
      });
    }
    
    return insights;
  }
}

interface DashboardData {
  recentActivities: ProgressEvent[];
  skillLevels: Record<SkillId, number>;
  activityHeatmap: HeatmapData[];
  struggleAreas: StruggleIndicator[];
  insights: Insight[];
}

interface Insight {
  type: 'achievement' | 'recommendation' | 'encouragement';
  message: string;
}
```

---

## 7. Query Patterns for Parent Dashboard

### 7.1 Common Dashboard Queries
```typescript
// src/db/queries/ParentDashboardQueries.ts

export class ParentDashboardQueries {
  constructor(private db: AdvayDB) {}
  
  // Query 1: "What did my child do today?"
  async getTodaysActivities(childId: string): Promise<ActivitySummary[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStart = today.getTime();
    const todayEnd = todayStart + 24 * 60 * 60 * 1000;
    
    const events = await this.db.progressEvents
      .where('[childId+timestamp]')
      .between([childId, todayStart], [childId, todayEnd])
      .toArray();
    
    // Group by activity type
    const byType = new Map<ActivityType, { count: number; avgScore: number }>();
    for (const event of events) {
      const existing = byType.get(event.activityType) || { count: 0, avgScore: 0 };
      byType.set(event.activityType, {
        count: existing.count + 1,
        avgScore: (existing.avgScore * existing.count + event.score) / (existing.count + 1),
      });
    }
    
    return Array.from(byType.entries()).map(([type, data]) => ({
      activityType: type,
      count: data.count,
      avgScore: Math.round(data.avgScore),
    }));
  }
  
  // Query 2: "Is my child improving?"
  async getProgressTrend(childId: string, days: number = 14): Promise<TrendData> {
    const startDate = Date.now() - days * 24 * 60 * 60 * 1000;
    
    const events = await this.db.progressEvents
      .where('[childId+timestamp]')
      .between([childId, startDate], [childId, Date.now()])
      .toArray();
    
    // Group by day
    const byDay = new Map<string, { scores: number[] }>();
    for (const event of events) {
      const day = new Date(event.timestamp).toISOString().split('T')[0];
      const existing = byDay.get(day) || { scores: [] };
      existing.scores.push(event.score);
      byDay.set(day, existing);
    }
    
    // Calculate daily averages
    const dailyAverages = Array.from(byDay.entries())
      .map(([date, data]) => ({
        date,
        avgScore: Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length),
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
    
    // Simple trend calculation
    const firstHalf = dailyAverages.slice(0, Math.floor(dailyAverages.length / 2));
    const secondHalf = dailyAverages.slice(Math.floor(dailyAverages.length / 2));
    
    const firstAvg = firstHalf.reduce((sum, d) => sum + d.avgScore, 0) / firstHalf.length || 0;
    const secondAvg = secondHalf.reduce((sum, d) => sum + d.avgScore, 0) / secondHalf.length || 0;
    
    return {
      dailyAverages,
      trend: secondAvg > firstAvg + 5 ? 'improving' : secondAvg < firstAvg - 5 ? 'declining' : 'stable',
      change: Math.round(secondAvg - firstAvg),
    };
  }
  
  // Query 3: "What should we practice next?"
  async getNextRecommendations(childId: string): Promise<Recommendation[]> {
    const skillSummaries = await this.db.skillSummaries
      .where('childId')
      .equals(childId)
      .toArray();
    
    // Find lowest skill level
    const weakest = skillSummaries.reduce((min, curr) => 
      curr.currentLevel < min.currentLevel ? curr : min
    );
    
    // Get recent activities in that skill area
    const skills = this.mapSkillToActivities(weakest.skillId);
    
    const recent = await this.db.progressEvents
      .where('[childId+activityType+timestamp]')
      .between([childId, skills[0], Date.now() - 7 * 24 * 60 * 60 * 1000], 
               [childId, skills[skills.length - 1], Date.now()])
      .toArray();
    
    // Find least-practiced activity
    const activityCounts = new Map<string, number>();
    for (const event of recent) {
      activityCounts.set(event.contentId, (activityCounts.get(event.contentId) || 0) + 1);
    }
    
    const leastPracticed = Array.from(activityCounts.entries())
      .sort((a, b) => a[1] - b[1])[0]?.[0];
    
    return [{
      skillId: weakest.skillId,
      activityType: skills[0],
      contentId: leastPracticed || this.getSuggestedContent(weakest.skillId),
      reason: `Focus on ${weakest.skillId} skills - current level ${weakest.currentLevel}`,
    }];
  }
  
  private mapSkillToActivities(skill: SkillId): ActivityType[] {
    const mapping: Record<SkillId, ActivityType[]> = {
      literacy: ['letter_tracing', 'letter_recognition', 'story_sequence'],
      numeracy: ['finger_number_show', 'color_by_number'],
      motor: ['letter_tracing', 'connect_the_dots', 'mirror_draw'],
      logic: ['connect_the_dots', 'story_sequence'],
      creative: ['mirror_draw', 'color_by_number', 'free_exploration'],
    };
    return mapping[skill] || [];
  }
  
  private getSuggestedContent(skill: SkillId): string {
    // Simple fallback suggestions
    const suggestions: Record<SkillId, string> = {
      literacy: 'letter-A',
      numeracy: 'number-1',
      motor: 'shape-circle',
      logic: 'pattern-AB',
      creative: 'color-red',
    };
    return suggestions[skill] || 'letter-A';
  }
}

interface ActivitySummary {
  activityType: ActivityType;
  count: number;
  avgScore: number;
}

interface TrendData {
  dailyAverages: Array<{ date: string; avgScore: number }>;
  trend: 'improving' | 'declining' | 'stable';
  change: number;
}

interface Recommendation {
  skillId: SkillId;
  activityType: ActivityType;
  contentId: string;
  reason: string;
}
```

### 7.2 Efficient Pagination with Cursors
```typescript
// src/db/utils/PaginationHelper.ts

export class PaginationHelper<T> {
  constructor(
    private table: Dexie.Table<T, any>,
    private index: string,
    private childId: string
  ) {}
  
  async fetchPage(params: {
    pageSize: number;
    startDate?: number;
    endDate?: number;
    cursor?: any;
  }): Promise<{ items: T[]; nextCursor: any; hasMore: boolean }> {
    let collection = this.table.where(this.index);
    
    // Apply childId filter
    if (this.index.includes('childId')) {
      collection = collection.equals(this.childId);
    }
    
    // Apply date range
    if (params.startDate && params.endDate) {
      collection = collection.between(
        [this.childId, params.startDate],
        [this.childId, params.endDate]
      );
    }
    
    // Apply cursor for pagination
    if (params.cursor) {
      collection = collection.above(params.cursor);
    }
    
    // Fetch with limit + 1 (to detect hasMore)
    const items = await collection.limit(params.pageSize + 1).toArray();
    
    const hasMore = items.length > params.pageSize;
    const pageItems = items.slice(0, params.pageSize);
    
    // Next cursor is the last item's key
    const nextCursor = hasMore ? pageItems[pageItems.length - 1] : null;
    
    return {
      items: pageItems,
      nextCursor,
      hasMore,
    };
  }
}

// Usage example:
// const paginator = new PaginationHelper(db.progressEvents, '[childId+timestamp]', childId);
// const page1 = await paginator.fetchPage({ pageSize: 20 });
// const page2 = await paginator.fetchPage({ pageSize: 20, cursor: page1.nextCursor });
```

---

## 8. Data Migration Strategy

### 8.1 Versioned Schema Evolution
```typescript
// src/db/migrations/SchemaVersions.ts

export const SCHEMA_VERSIONS = {
  1: {
    // Initial schema (documented in AdvayDB constructor)
    description: 'Initial release with event sourcing',
  },
  2: {
    description: 'Add struggle indicators to progress events',
    changes: [
      'Add struggleIndicators?: object to ProgressEvent',
      'Add index [childId+struggleIndicators.confusionPattern]',
    ],
    upgrade: async (tx: Dexie.Transaction) => {
      // No data transformation needed - new field is optional
      return Promise.resolve();
    },
  },
  3: {
    description: 'Add language support to metadata',
    changes: [
      'Add metadata.language?: string to ProgressEvent',
      'Add index [childId+metadata.language+timestamp]',
    ],
    upgrade: async (tx: Dexie.Transaction) => {
      // Backfill language from child profile for existing events
      const profiles = await tx.table('childProfiles').toArray();
      const profileMap = new Map(profiles.map(p => [p.id, p.preferences.primaryLanguage]));
      
      return tx.table('progressEvents')
        .toCollection()
        .modify(event => {
          if (!event.metadata.language && profileMap.has(event.childId)) {
            event.metadata.language = profileMap.get(event.childId);
          }
        });
    },
  },
};

// Usage in AdvayDB:
// this.version(2).stores({ ... }).upgrade(SCHEMA_VERSIONS[2].upgrade);
```

### 8.2 Safe Migration Testing
```typescript
// src/db/__tests__/MigrationTests.test.ts

describe('Schema Migrations', () => {
  it('should migrate v1 to v2 without data loss', async () => {
    // Setup v1 database with test data
    const v1DB = await createDBAtVersion(1);
    await seedTestData(v1DB);
    
    // Upgrade to v2
    const v2DB = await upgradeDB(v1DB, 2);
    
    // Verify data integrity
    const events = await v2DB.progressEvents.toArray();
    expect(events.length).toBeGreaterThan(0);
    
    // Verify new field is optional (no errors)
    for (const event of events) {
      expect(event).toHaveProperty('struggleIndicators');
      // Field can be undefined - that's OK
    }
  });
  
  it('should handle upgrade errors gracefully', async () => {
    const db = await createDBAtVersion(2);
    
    // Simulate upgrade failure
    jest.spyOn(db, 'transaction').mockRejectedValueOnce(new Error('Upgrade failed'));
    
    // Should not corrupt existing data
    await expect(upgradeDB(db, 3)).rejects.toThrow();
    
    // Original data should still be accessible
    const events = await db.progressEvents.toArray();
    expect(events.length).toBeGreaterThan(0);
  });
});

async function createDBAtVersion(version: number): Promise<AdvayDB> {
  // Helper to create DB at specific schema version for testing
  // Implementation uses Dexie's version() API
}

async function seedTestData(db: AdvayDB): Promise<void> {
  // Insert test data matching schema version
}

async function upgradeDB(db: AdvayDB, targetVersion: number): Promise<AdvayDB> {
  // Helper to run schema upgrades
}
```

### 8.3 Rollback Strategy
```typescript
// src/db/utils/RollbackHelper.ts

export class RollbackHelper {
  static async createBackup(db: AdvayDB, version: number): Promise<string> {
    // Export all tables to JSON for potential rollback
    const backup = {
      version,
      timestamp: Date.now(),
      tables: {} as Record<string, any[]>,
    };
    
    for (const tableName of db.tables.map(t => t.name)) {
      backup.tables[tableName] = await db.table(tableName).toArray();
    }
    
    // Store in a separate IndexedDB or localStorage (small datasets)
    const backupId = `backup_v${version}_${Date.now()}`;
    localStorage.setItem(backupId, JSON.stringify(backup));
    
    return backupId;
  }
  
  static async restoreFromBackup(db: AdvayDB, backupId: string): Promise<void> {
    const backupJson = localStorage.getItem(backupId);
    if (!backupJson) {
      throw new Error('Backup not found');
    }
    
    const backup = JSON.parse(backupJson);
    
    // Clear current data
    await db.delete();
    
    // Recreate at backup version
    const restoredDB = new AdvayDB();
    restoredDB.version(backup.version).stores({
      // Use schema from backup version
    });
    
    // Restore data
    for (const [tableName, records] of Object.entries(backup.tables)) {
      await restoredDB.table(tableName).bulkAdd(records as any[]);
    }
    
    // Replace current DB reference (caller must handle)
  }
}
```

---

## 9. Sync & Conflict Resolution

### 9.1 Idempotent Sync Protocol
```typescript
// src/services/sync/SyncProtocol.ts

export class SyncProtocol {
  constructor(private db: AdvayDB) {}
  
  // Client -> Server: Upload unsynced events
  async uploadPendingEvents(): Promise<SyncResult> {
    const pending = await this.db.syncQueue
      .where('[priority+nextAttemptAt]')
      .between(['high', 0], ['low', Date.now()])
      .limit(50) // Batch size
      .toArray();
    
    if (pending.length === 0) {
      return { uploaded: 0, errors: [] };
    }
    
    const payload = {
      events: pending.map(item => ({
        idempotencyKey: item.entityId, // Reference to source event
        ...item.payload,
      })),
      clientVersion: APP_VERSION,
      timestamp: Date.now(),
    };
    
    try {
      const response = await fetch('/api/sync/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        throw new Error(`Sync failed: ${response.status}`);
      }
      
      const result = await response.json();
      
      // Mark synced items
      await this.db.transaction('rw', this.db.syncQueue, this.db.progressEvents, async () => {
        for (const item of pending) {
          if (result.processed.includes(item.entityId)) {
            // Remove from queue
            await this.db.syncQueue.delete(item.id);
            
            // Mark source event as synced
            await this.db.progressEvents.update(item.entityId, {
              synced: true,
              syncedAt: Date.now(),
            });
          } else if (result.duplicates.includes(item.entityId)) {
            // Duplicate - safe to remove from queue
            await this.db.syncQueue.delete(item.id);
          }
          // Else: keep in queue for retry
        }
      });
      
      return {
        uploaded: result.processed.length,
        duplicates: result.duplicates.length,
        errors: result.errors || [],
      };
      
    } catch (error) {
      // Update retry counts with exponential backoff
      await this.db.syncQueue.bulkPut(
        pending.map(item => ({
          ...item,
          retryCount: item.retryCount + 1,
          nextAttemptAt: Date.now() + Math.min(
            1000 * Math.pow(2, item.retryCount),
            24 * 60 * 60 * 1000 // Max 24 hours
          ),
        }))
      );
      
      throw error;
    }
  }
  
  // Server -> Client: Download aggregated insights (optional, parent-gated)
  async downloadInsights(childId: string): Promise<ParentInsights | null> {
    // Only if parent has enabled cloud sync
    const profile = await this.db.childProfiles.get(childId);
    if (!profile?.preferences.enableCloudSync) {
      return null;
    }
    
    const response = await fetch(`/api/insights/${childId}`);
    if (!response.ok) return null;
    
    const insights = await response.json();
    
    // Store locally for offline parent dashboard
    // Note: These are aggregated, not raw events
    await this.db.insightsCache.put({
      childId,
      data: insights,
      fetchedAt: Date.now(),
      expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hour cache
    });
    
    return insights;
  }
}

interface SyncResult {
  uploaded: number;
  duplicates?: number;
  errors?: string[];
}

interface ParentInsights {
  // Aggregated, anonymized insights for parent dashboard
  // Never includes raw events or PII
  skillProgress: Record<SkillId, { level: number; trend: 'up' | 'down' | 'stable' }>;
  recommendations: Array<{
    activity: string;
    reason: string;
  }>;
  milestones: Array<{
    achieved: string;
    date: string;
  }>;
}
```

### 9.2 Conflict Resolution Strategy
```typescript
// src/services/sync/ConflictResolver.ts

export class ConflictResolver {
  // Strategy: Last-write-wins with parent preference for manual resolution
  
  static resolveProfileConflict(
    local: ChildProfile,
    remote: ChildProfile
  ): ChildProfile {
    // For profiles, prefer parent's explicit changes (remote) if newer
    if (remote.updatedAt > local.updatedAt) {
      return { ...local, ...remote }; // Merge, remote wins on conflicts
    }
    return local;
  }
  
  static resolvePreferenceConflict(
    local: ChildPreferences,
    remote: ChildPreferences
  ): ChildPreferences {
    // Preferences: always prefer local (parent set on this device)
    // Unless remote has explicit "synced from parent dashboard" flag
    if (remote._syncedFromParentDashboard) {
      return { ...local, ...remote };
    }
    return local;
  }
  
  // For events: no conflict possible (append-only, idempotent)
  static resolveEventConflict(
    local: ProgressEvent,
    remote: ProgressEvent
  ): 'keep_local' | 'keep_remote' | 'merge' {
    // Idempotency key ensures duplicates are detected
    if (local.idempotencyKey === remote.idempotencyKey) {
      return 'keep_local'; // Already have it
    }
    
    // Different events - keep both (no conflict)
    return 'merge';
  }
  
  // Manual resolution UI for parents (rare cases)
  static presentConflictToParent(
    conflict: SyncConflict
  ): Promise<'local' | 'remote' | 'merge'> {
    // Show modal with both versions
    // Let parent choose
    return new Promise((resolve) => {
      // UI implementation omitted
      // resolve('local') or resolve('remote') or resolve('merge')
    });
  }
}

interface SyncConflict {
  entityType: 'profile' | 'preference';
  entityId: string;
  local: any;
  remote: any;
  conflictFields: string[];
}
```

---

## 10. Privacy & Data Retention

### 10.1 Retention Policy Implementation
```typescript
// src/services/privacy/DataRetentionService.ts

export class DataRetentionService {
  constructor(private db: AdvayDB) {}
  
  // Run periodic cleanup (e.g., weekly via Background Sync)
  async cleanupExpiredData(params: {
    childId?: string; // Optional: cleanup specific child
    dryRun?: boolean; // For testing
  } = {}): Promise<CleanupReport> {
    const now = Date.now();
    const report: CleanupReport = {
      deleted: { events: 0, sessions: 0, cache: 0 },
      retained: { events: 0, sessions: 0 },
    };
    
    // Progress events: retain 90 days
    const eventCutoff = now - 90 * 24 * 60 * 60 * 1000;
    
    let eventQuery = this.db.progressEvents
      .where('timestamp')
      .below(eventCutoff)
      .filter(event => event.synced); // Only delete synced events
    
    if (params.childId) {
      eventQuery = eventQuery.and(event => event.childId === params.childId);
    }
    
    if (!params.dryRun) {
      const deleted = await eventQuery.delete();
      report.deleted.events = deleted;
    } else {
      report.retained.events = await eventQuery.count();
    }
    
    // Session metadata: retain 30 days
    const sessionCutoff = now - 30 * 24 * 60 * 60 * 1000;
    
    let sessionQuery = this.db.sessionMetadata
      .where('startTime')
      .below(sessionCutoff);
    
    if (params.childId) {
      sessionQuery = sessionQuery.and(s => s.childId === params.childId);
    }
    
    if (!params.dryRun) {
      const deleted = await sessionQuery.delete();
      report.deleted.sessions = deleted;
    }
    
    // Model cache: expire based on expiresAt
    const cacheDeleted = await this.db.modelCache
      .where('expiresAt')
      .below(now)
      .delete();
    
    report.deleted.cache = cacheDeleted;
    
    return report;
  }
  
  // Parent-initiated data deletion (COPPA right to delete)
  async deleteChildData(childId: string): Promise<void> {
    // Confirm this is intentional (parent gate required in UI)
    
    await this.db.transaction('rw', 
      this.db.childProfiles,
      this.db.progressEvents,
      this.db.skillEvents,
      this.db.skillSummaries,
      this.db.sessionMetadata,
      this.db.syncQueue,
      async () => {
        // Delete all child-specific data
        await this.db.childProfiles.delete(childId);
        await this.db.progressEvents.where('childId').equals(childId).delete();
        await this.db.skillEvents.where('childId').equals(childId).delete();
        await this.db.skillSummaries.where('childId').equals(childId).delete();
        await this.db.sessionMetadata.where('childId').equals(childId).delete();
        await this.db.syncQueue.where('entityId').anyOf(
          await this.db.progressEvents.where('childId').equals(childId).primaryKeys()
        ).delete();
      }
    );
    
    // Log deletion (anonymized, for audit)
    console.log(`Child data deleted: ${childId}`, {
      timestamp: Date.now(),
      // No PII logged
    });
  }
  
  // Export data for parent download (right to access)
  async exportChildData(childId: string): Promise<Blob> {
    const exportData = await this.db.exportData(childId);
    
    // Convert to JSON blob for download
    const json = JSON.stringify(exportData, null, 2);
    return new Blob([json], { type: 'application/json' });
  }
}

interface CleanupReport {
  deleted: {
    events: number;
    sessions: number;
    cache: number;
  };
  retained: {
    events: number;
    sessions: number;
  };
}
```

### 10.2 Privacy-Preserving Analytics
```typescript
// src/services/analytics/PrivacyAnalytics.ts

export class PrivacyAnalytics {
  // Only send aggregated, anonymized metrics (parent opt-in)
  
  static prepareAnalyticsPayload(
    events: ProgressEvent[],
    childId: string
  ): AnalyticsPayload {
    // Remove all identifying information
    return {
      // Aggregate counts, not individual events
      activityCounts: this.aggregateByType(events),
      scoreDistribution: this.calculateScoreDistribution(events),
      // Time buckets, not exact timestamps
      hourlyActivity: this.bucketByHour(events),
      // No childId, no deviceId, no IP
      metadata: {
        appVersion: APP_VERSION,
        ageBand: this.getAgeBandFromEvents(events), // Not specific child
        // No location, no device model
      },
    };
  }
  
  private static aggregateByType(events: ProgressEvent[]): Record<ActivityType, number> {
    const counts: Partial<Record<ActivityType, number>> = {};
    for (const event of events) {
      counts[event.activityType] = (counts[event.activityType] || 0) + 1;
    }
    return counts as Record<ActivityType, number>;
  }
  
  private static calculateScoreDistribution(events: ProgressEvent[]): {
    buckets: { range: string; count: number }[];
  } {
    const buckets = [
      { range: '0-20', min: 0, max: 20, count: 0 },
      { range: '21-40', min: 21, max: 40, count: 0 },
      { range: '41-60', min: 41, max: 60, count: 0 },
      { range: '61-80', min: 61, max: 80, count: 0 },
      { range: '81-100', min: 81, max: 100, count: 0 },
    ];
    
    for (const event of events) {
      const bucket = buckets.find(b => event.score >= b.min && event.score <= b.max);
      if (bucket) bucket.count++;
    }
    
    return { buckets };
  }
  
  private static bucketByHour(events: ProgressEvent[]): Record<string, number> {
    const byHour: Record<string, number> = {};
    for (const event of events) {
      const hour = new Date(event.timestamp).getHours();
      const key = `${hour}:00`;
      byHour[key] = (byHour[key] || 0) + 1;
    }
    return byHour;
  }
  
  private static getAgeBandFromEvents(events: ProgressEvent[]): '3-4' | '5-6' | '7-8' | 'unknown' {
    // Infer from activity types (not child-specific)
    const hasAdvanced = events.some(e => 
      e.activityType === 'story_sequence' || 
      (e.metadata.level && e.metadata.level > 3)
    );
    
    if (hasAdvanced) return '7-8';
    
    const hasBasic = events.some(e => 
      e.activityType === 'letter_tracing' || 
      e.activityType === 'finger_number_show'
    );
    
    if (hasBasic) return '5-6';
    
    return 'unknown';
  }
}

interface AnalyticsPayload {
  activityCounts: Record<ActivityType, number>;
  scoreDistribution: {
    buckets: { range: string; count: number }[];
  };
  hourlyActivity: Record<string, number>;
  metadata: {
    appVersion: string;
    ageBand: string;
  };
}
```

---

## 11. Testing Strategy

### 11.1 Unit Tests for Repositories
```typescript
// src/db/repositories/__tests__/ProgressEventRepository.test.ts

import { AdvayDB } from '../../AdvayDB';
import { ProgressEventRepository } from '../ProgressEventRepository';

describe('ProgressEventRepository', () => {
  let db: AdvayDB;
  let repo: ProgressEventRepository;
  
  beforeEach(async () => {
    db = await AdvayDB.open();
    repo = new ProgressEventRepository(db);
  });
  
  afterEach(async () => {
    await db.close();
  });
  
  describe('recordEvent', () => {
    it('should create event with idempotency key', async () => {
      const event = {
        childId: 'child-123',
        activityType: 'letter_tracing' as const,
        contentId: 'letter-A',
        score: 85,
        durationSeconds: 30,
        timestamp: Date.now(),
      };
      
      const id = await repo.recordEvent(event);
      
      expect(id).toBeDefined();
      
      // Verify event was stored
      const stored = await db.progressEvents.get(id);
      expect(stored).toMatchObject({
        ...event,
        synced: false,
      });
      expect(stored?.idempotencyKey).toBeDefined();
    });
    
    it('should be idempotent - duplicate calls return same result', async () => {
      const event = {
        childId: 'child-123',
        activityType: 'letter_tracing' as const,
        contentId: 'letter-A',
        score: 85,
        durationSeconds: 30,
        timestamp: Date.now(),
      };
      
      const id1 = await repo.recordEvent(event);
      const id2 = await repo.recordEvent(event); // Same params
      
      expect(id1).toBe(id2);
      
      // Only one event in DB
      const count = await db.progressEvents
        .where('childId')
        .equals('child-123')
        .count();
      expect(count).toBe(1);
    });
    
    it('should queue for sync when online', async () => {
      // Mock navigator.onLine
      Object.defineProperty(navigator, 'onLine', { value: true });
      
      const event = {
        childId: 'child-123',
        activityType: 'letter_tracing' as const,
        contentId: 'letter-A',
        score: 85,
        durationSeconds: 30,
        timestamp: Date.now(),
      };
      
      await repo.recordEvent(event);
      
      // Verify sync queue item was created
      const queueItems = await db.syncQueue.toArray();
      expect(queueItems).toHaveLength(1);
      expect(queueItems[0].entityType).toBe('progress');
    });
  });
  
  describe('updateSkillSummaries', () => {
    it('should increment XP for completed activity', async () => {
      // Setup: child with existing skill summary
      await db.skillSummaries.add({
        childId: 'child-123',
        skillId: 'literacy',
        currentLevel: 2,
        currentXP: 50,
        totalXP: 150,
        subskills: {},
        streakDays: 0,
        lastUpdated: Date.now(),
      });
      
      const event = {
        childId: 'child-123',
        activityType: 'letter_tracing' as const,
        contentId: 'letter-A',
        score: 90, // High accuracy = bonus XP
        durationSeconds: 20, // Fast = bonus XP
        timestamp: Date.now(),
      };
      
      await repo.recordEvent(event);
      
      // Verify XP was added
      const summary = await db.skillSummaries.get(['child-123', 'literacy']);
      expect(summary?.currentXP).toBeGreaterThan(50);
      expect(summary?.totalXP).toBeGreaterThan(150);
    });
    
    it('should trigger level up when XP threshold reached', async () => {
      // Setup: child near level up
      await db.skillSummaries.add({
        childId: 'child-123',
        skillId: 'literacy',
        currentLevel: 2,
        currentXP: 95, // Close to 100 threshold
        totalXP: 195,
        subskills: {},
        streakDays: 0,
        lastUpdated: Date.now(),
      });
      
      const event = {
        childId: 'child-123',
        activityType: 'letter_tracing' as const,
        contentId: 'letter-A',
        score: 85,
        durationSeconds: 30,
        timestamp: Date.now(),
      };
      
      await repo.recordEvent(event);
      
      // Verify level up occurred
      const summary = await db.skillSummaries.get(['child-123', 'literacy']);
      expect(summary?.currentLevel).toBe(3);
      expect(summary?.currentXP).toBeLessThan(100); // Reset for new level
    });
  });
});
```

### 11.2 Integration Tests for Sync
```typescript
// src/services/sync/__tests__/SyncProtocol.integration.test.ts

describe('SyncProtocol Integration', () => {
  it('should upload pending events and mark as synced', async () => {
    // Setup: DB with unsynced events
    const db = await AdvayDB.open();
    
    // Create test event
    const eventId = await db.progressEvents.add({
      id: crypto.randomUUID(),
      idempotencyKey: crypto.randomUUID(),
      childId: 'child-test',
      activityType: 'letter_tracing',
      contentId: 'letter-A',
      score: 80,
      durationSeconds: 30,
      timestamp: Date.now(),
      synced: false,
      createdAt: Date.now(),
    });
    
    // Queue for sync
    await db.syncQueue.add({
      id: crypto.randomUUID(),
      entityType: 'progress',
      entityId: eventId,
      priority: 'normal',
      retryCount: 0,
      nextAttemptAt: Date.now(),
      payload: {
        activityType: 'letter_tracing',
        score: 80,
        timestamp: Date.now(),
      },
      createdAt: Date.now(),
    });
    
    // Mock fetch for API call
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        processed: [eventId],
        duplicates: [],
        errors: [],
      }),
    });
    
    // Run sync
    const protocol = new SyncProtocol(db);
    const result = await protocol.uploadPendingEvents();
    
    // Verify results
    expect(result.uploaded).toBe(1);
    
    // Verify event marked as synced
    const event = await db.progressEvents.get(eventId);
    expect(event?.synced).toBe(true);
    expect(event?.syncedAt).toBeDefined();
    
    // Verify queue item removed
    const queueCount = await db.syncQueue.count();
    expect(queueCount).toBe(0);
  });
  
  it('should handle duplicate events gracefully', async () => {
    // Setup: event already synced on server
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        processed: [],
        duplicates: ['event-id-123'],
        errors: [],
      }),
    });
    
    const db = await AdvayDB.open();
    
    // Queue item referencing "duplicate" event
    await db.syncQueue.add({
      id: crypto.randomUUID(),
      entityType: 'progress',
      entityId: 'event-id-123',
      priority: 'normal',
      retryCount: 0,
      nextAttemptAt: Date.now(),
      payload: {},
      createdAt: Date.now(),
    });
    
    const protocol = new SyncProtocol(db);
    const result = await protocol.uploadPendingEvents();
    
    // Duplicate should be removed from queue without error
    expect(result.duplicates).toBe(1);
    
    const queueCount = await db.syncQueue.count();
    expect(queueCount).toBe(0);
  });
});
```

### 11.3 Performance/Stress Tests
```typescript
// src/db/__tests__/PerformanceTests.test.ts

describe('IndexedDB Performance', () => {
  it('should handle 1000 events insertion in <500ms', async () => {
    const db = await AdvayDB.open();
    
    const events = Array.from({ length: 1000 }, (_, i) => ({
      id: crypto.randomUUID(),
      idempotencyKey: crypto.randomUUID(),
      childId: 'child-test',
      activityType: 'letter_tracing' as const,
      contentId: `letter-${String.fromCharCode(65 + (i % 26))}`,
      score: Math.floor(Math.random() * 100),
      durationSeconds: Math.floor(Math.random() * 60),
      timestamp: Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000),
      synced: false,
      createdAt: Date.now(),
    }));
    
    const start = performance.now();
    
    await db.transaction('rw', db.progressEvents, async () => {
      await db.progressEvents.bulkAdd(events);
    });
    
    const duration = performance.now() - start;
    
    expect(duration).toBeLessThan(500);
    
    // Verify count
    const count = await db.progressEvents.count();
    expect(count).toBe(1000);
  }, 1000);
  
  it('should query recent events in <50ms', async () => {
    const db = await AdvayDB.open();
    
    // Ensure test data exists
    await seedTestData(db, 1000);
    
    const start = performance.now();
    
    const recent = await db.progressEvents
      .where('[childId+timestamp]')
      .between(['child-test', Date.now() - 7 * 24 * 60 * 60 * 1000], ['child-test', Date.now()])
      .reverse()
      .limit(20)
      .toArray();
    
    const duration = performance.now() - start;
    
    expect(duration).toBeLessThan(50);
    expect(recent.length).toBeLessThanOrEqual(20);
  });
  
  it('should handle pagination without memory leak', async () => {
    const db = await AdvayDB.open();
    await seedTestData(db, 10000); // 10k events
    
    const paginator = new PaginationHelper(
      db.progressEvents,
      '[childId+timestamp]',
      'child-test'
    );
    
    let total = 0;
    let cursor: any = undefined;
    let iterations = 0;
    
    do {
      const page = await paginator.fetchPage({
        pageSize: 100,
        cursor,
      });
      
      total += page.items.length;
      cursor = page.nextCursor;
      iterations++;
      
      // Force garbage collection hint (if available)
      if (global.gc) global.gc();
      
    } while (cursor && iterations < 200); // Safety limit
    
    expect(total).toBeGreaterThan(0);
    expect(iterations).toBeLessThan(200); // Didn't infinite loop
  });
});

async function seedTestData(db: AdvayDB, count: number): Promise<void> {
  // Bulk insert test data
  const events = Array.from({ length: count }, (_, i) => ({
    // ... same as above
  }));
  await db.progressEvents.bulkAdd(events);
}
```

---

## 12. Implementation Checklist

### Phase 1: Schema Foundation (Week 1-2)
| Task | Component | Effort | Status |
|------|-----------|--------|--------|
| Define TypeScript interfaces | `schemas/*.ts` | 1 day | ☐ |
| Create Dexie DB class | `AdvayDB.ts` | 2 days | ☐ |
| Implement ProgressEvent repository | `ProgressEventRepository.ts` | 2 days | ☐ |
| Add basic query patterns | `AnalyticsRepository.ts` | 2 days | ☐ |
| Write unit tests | `__tests__/*.test.ts` | 2 days | ☐ |

### Phase 2: Event Sourcing & Sync (Week 3)
| Task | Component | Effort | Status |
|------|-----------|--------|--------|
| Implement idempotency logic | `recordEvent()` deduplication | 1 day | ☐ |
| Add sync queue management | `SyncQueue` table + protocol | 2 days | ☐ |
| Build upload/download protocol | `SyncProtocol.ts` | 2 days | ☐ |
| Add conflict resolution | `ConflictResolver.ts` | 1 day | ☐ |
| Integration tests for sync | `SyncProtocol.integration.test.ts` | 2 days | ☐ |

### Phase 3: Parent Dashboard Queries (Week 4)
| Task | Component | Effort | Status |
|------|-----------|--------|--------|
| Implement dashboard queries | `ParentDashboardQueries.ts` | 2 days | ☐ |
| Add pagination helper | `PaginationHelper.ts` | 1 day | ☐ |
| Build struggle detection | `getStruggleAreas()` | 2 days | ☐ |
| Add insight generation | `generateInsights()` | 1 day | ☐ |
| Performance testing | `PerformanceTests.test.ts` | 2 days | ☐ |

### Phase 4: Privacy & Retention (Week 5)
| Task | Component | Effort | Status |
|------|-----------|--------|--------|
| Implement retention policies | `DataRetentionService.ts` | 2 days | ☐ |
| Add data export/delete | COPPA compliance features | 2 days | ☐ |
| Build privacy-preserving analytics | `PrivacyAnalytics.ts` | 2 days | ☐ |
| Add migration support | Schema versioning in `AdvayDB` | 2 days | ☐ |
| Documentation & runbooks | This doc + operational guides | 2 days | ☐ |

### Effort Summary
```
Total estimated effort: ~38 engineering days
Team recommendation: 2 engineers (full-time), 1 QA (part-time for testing)
Critical path: Phase 1 + Phase 2 (5 weeks) for MVP offline support
```

---

## 13. References

### 13.1 Libraries & Documentation
- [Dexie.js Documentation](https://dexie.org/docs/)
- [IndexedDB API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- [Event Sourcing Pattern](https://martinfowler.com/eaaDev/EventSourcing.html)
- [COPPA Compliance Guide](https://www.ftc.gov/tips-advice/business-center/guidance/complying-coppa-frequently-asked-questions)

### 13.2 Performance Resources
- [IndexedDB Best Practices](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Using_IndexedDB)
- [Dexie.js Performance Tips](https://dexie.org/docs/Performance)
- [Chrome DevTools: IndexedDB Panel](https://developer.chrome.com/docs/devtools/storage/indexeddb/)

### 13.3 Privacy & Compliance
- [GDPR-K Guidelines](https://edpb.europa.eu/our-work-tools/our-documents/guidelines/guidelines-022023-processing-personal-data-children_en)
- [Data Minimization Principles](https://ico.org.uk/for-organisations/guide-to-data-protection/guide-to-the-general-data-protection-regulation-gdpr/principles/data-minimisation/)
- [iKeepSafe COPPA Checklist](https://ikeepsafe.org/coppa-compliance-checklist/)

### 13.4 Project Documentation
- [`ARCHITECTURE.md`](../ARCHITECTURE.md) - System architecture
- [`OFFLINE_FIRST_SYNC_STRATEGY.md`](./OFFLINE_FIRST_SYNC_STRATEGY.md) - Sync patterns
- [`CHILD_ANALYTICS_FRAMEWORK.md`](./CHILD_ANALYTICS_FRAMEWORK.md) - Metrics design
- [`CONTENT_SAFETY_MODERATION.md`](./CONTENT_SAFETY_MODERATION.md) - Privacy requirements
- [`PROGRESS_CAPTURE_ARCHITECTURE_2026-02-23.md`](./PROGRESS_CAPTURE_ARCHITECTURE_2026-02-23.md) - Previous progress research

---

**Last Updated**: 2026-03-05
**Next Review**: After Phase 1 implementation
**Related**: `ARCHITECTURE.md`, `OFFLINE_FIRST_SYNC_STRATEGY.md`, `CHILD_ANALYTICS_FRAMEWORK.md`

---

*This document provides implementation-ready code patterns for IndexedDB schema design. All code examples are TypeScript and designed for the Advay Vision Learning platform's offline-first, privacy-by-design architecture.*
