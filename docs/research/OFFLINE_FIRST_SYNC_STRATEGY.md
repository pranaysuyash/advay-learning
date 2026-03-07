# Offline-First Architecture & Sync Strategy
**A Resilient, Privacy-Preserving Data Synchronization Framework for Children's Learning Apps**

---

**Document Version**: 1.1
**Created**: 2026-03-05
**Updated**: 2026-03-06
**Status**: IMPLEMENTED (Foundation Layer)
**Owner**: Engineering Team
**Priority**: P0 (Critical for "Local-First" Principle)

> **Implementation Note (2026-03-06):**
> - IndexedDB storage layer: `src/frontend/src/services/storage/indexedDB.ts`
> - Online status hooks: `src/frontend/src/hooks/useOnlineStatus.ts`
> - Progress queue: existing `services/progressQueue.ts` (localStorage-based)
> - PWA: ✅ IMPLEMENTED via `vite-plugin-pwa` in `vite.config.ts`

---

## Table of Contents
1. [Executive Summary](#1-executive-summary)
2. [Why Offline-First for Children's Apps](#2-why-offline-first-for-childrens-apps)
3. [Core Architecture Principles](#3-core-architecture-principles)
4. [Data Synchronization Patterns](#4-data-synchronization-patterns)
5. [Conflict Resolution Strategies](#5-conflict-resolution-strategies)
6. [Storage Layer Design](#6-storage-layer-design)
7. [Service Worker & PWA Integration](#7-service-worker--pwa-integration)
8. [AI Model Management Offline](#8-ai-model-management-offline)
9. [Implementation Roadmap](#9-implementation-roadmap)
10. [Testing & Monitoring](#10-testing--monitoring)
11. [References & Resources](#11-references--resources)

---

## 1. Executive Summary

### 1.1 Purpose
This document defines a comprehensive offline-first architecture for the Advay Vision Learning platform, enabling full functionality without network connectivity while ensuring seamless, conflict-free synchronization when connectivity is restored.

### 1.2 Key Principles
| Principle | Description | Implementation |
|-----------|-------------|----------------|
| **Local-First** | App works 100% offline; cloud is optional enhancement | All core features use local storage; sync is background task |
| **Event Sourcing** | Store immutable events, derive state | Progress events queued locally, synced when online |
| **Idempotent Sync** | Safe to retry; no duplicates | UUID-based idempotency keys; server-side deduplication |
| **Graceful Degradation** | Features scale with connectivity | Core learning works offline; AI/cloud features optional |
| **Privacy by Design** | Sync only what's necessary | Aggregate insights, not raw data; parent-controlled sharing |

### 1.3 Key Recommendations
1. **Adopt CRDTs or Event Sourcing**: Use conflict-free replicated data types or append-only event logs for sync
2. **Implement Queue-First Architecture**: All mutations go through local queue; sync is async background task
3. **Design for Intermittent Connectivity**: Assume network is unreliable; use exponential backoff, retry limits
4. **Enable Parent-Controlled Sync**: Allow parents to choose what syncs (progress only vs. full analytics)
5. **Cache AI Models Locally**: Download LLM/TTS models once; use IndexedDB for persistent storage
6. **Build Observable Sync State**: Expose sync status to UI for parent transparency ("Syncing...", "Offline", "Up to date")
7. **Test Offline Scenarios**: Include airplane mode, spotty WiFi, and network切换 in QA

### 1.4 What This Strategy Is NOT
- ❌ **Not real-time sync**: We prioritize correctness over immediacy; sync happens in background
- ❌ **Not cloud-dependent**: App is fully functional offline; cloud enhances but doesn't enable core features
- ❌ **Not complex for users**: Sync is invisible; parents see simple status indicators only
- ❌ **Not data-hungry**: We sync minimal, aggregated data; raw events stay on device unless explicitly shared

---

## 2. Why Offline-First for Children's Apps

### 2.1 Use Cases Requiring Offline Support
```
┌─────────────────────────────────────────────────────────┐
│              OFFLINE USE CASES                          │
├─────────────────────────────────────────────────────────┤
│ • Travel: Cars, planes, trains (no reliable WiFi)       │
│ • Rural areas: Limited or expensive cellular data       │
│ • School policies: Devices restricted from internet     │
│ • Parental control: Intentional offline-only sessions   │
│ • Cost sensitivity: Avoiding data overage charges       │
│ • Privacy preference: Minimizing cloud data exposure    │
└─────────────────────────────────────────────────────────┘
```

### 2.2 Business & UX Benefits
| Benefit | Impact |
|---------|--------|
| **Reliability** | App works anywhere; no "no internet" frustration for kids |
| **Performance** | Local operations are instant; no network latency |
| **Privacy** | Less data leaves device; parents have more control |
| **Cost** | Reduced server load; lower cloud infrastructure costs |
| **Accessibility** | Works in low-bandwidth regions; global reach |
| **Trust** | Parents appreciate transparency about data flow |

### 2.3 Technical Challenges
| Challenge | Mitigation |
|-----------|------------|
| **Conflict resolution** | CRDTs, last-write-wins with timestamps, or manual merge UI |
| **Storage limits** | IndexedDB quotas (~60% of disk); implement data retention policies |
| **Model size** | Quantized models (q4f16); lazy loading; optional model downloads |
| **Battery usage** | Throttle sync frequency; use Background Sync API; avoid polling |
| **Debugging** | Comprehensive logging; sync state visualization in dev tools |

---

## 3. Core Architecture Principles

### 3.1 High-Level Architecture
```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT (Browser/Device)              │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │   UI Layer  │  │  App Logic  │  │  Sync Mgr   │     │
│  │ (React)     │  │ (Business)  │  │ (Queue)     │     │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘     │
│         │                │                │            │
│         ▼                ▼                ▼            │
│  ┌─────────────────────────────────────┐              │
│  │         Local Storage Layer         │              │
│  │  • IndexedDB (structured data)      │              │
│  │  • Cache Storage (assets, models)   │              │
│  │  • localStorage (settings, tokens)  │              │
│  └────────────────┬────────────────────┘              │
│                   │                                   │
│                   ▼                                   │
│  ┌─────────────────────────────────────┐              │
│  │         Service Worker              │              │
│  │  • Request interception             │              │
│  │  • Background sync                  │              │
│  │  • Cache management                 │              │
│  └────────────────┬────────────────────┘              │
└───────────────────┼───────────────────────────────────┘
                    │ (when online)
                    ▼
┌─────────────────────────────────────────────────────────┐
│                    BACKEND (Optional)                   │
├─────────────────────────────────────────────────────────┤
│  • Idempotent API endpoints                             │
│  • Conflict resolution logic                            │
│  • Aggregated analytics storage                         │
│  • Parent dashboard data aggregation                    │
└─────────────────────────────────────────────────────────┘
```

### 3.2 Data Flow: Write Path (Offline-First)
```typescript
// All mutations go through local queue first
async function recordProgress(progress: ProgressEvent): Promise<void> {
  // 1. Generate idempotency key
  const idempotencyKey = crypto.randomUUID();
  
  // 2. Store locally (immediate)
  await localDB.progressEvents.add({
    id: idempotencyKey,
    ...progress,
    timestamp: Date.now(),
    synced: false,
  });
  
  // 3. Update UI immediately (optimistic)
  updateProgressUI(progress);
  
  // 4. Queue for sync (async, background)
  syncManager.queueSync('progress', idempotencyKey);
  
  // 5. Return immediately (no network wait)
  return;
}
```

### 3.3 Data Flow: Read Path (Local-First)
```typescript
// All reads come from local storage first
async function getChildProgress(childId: string): Promise<ProgressSummary> {
  // 1. Read from local DB (immediate)
  const localProgress = await localDB.progress
    .where('childId').equals(childId)
    .toArray();
  
  // 2. Return cached data (always available)
  return aggregateProgress(localProgress);
  
  // 3. (Optional) Refresh from server in background
  if (navigator.onLine) {
    syncManager.requestRefresh('progress', childId);
  }
}
```

### 3.4 Sync Manager Interface
```typescript
interface SyncManager {
  // Queue an item for sync
  queueSync(entityType: string, itemId: string): Promise<void>;
  
  // Process queue (called by Service Worker)
  processQueue(): Promise<SyncResult>;
  
  // Request fresh data from server
  requestRefresh(entityType: string, criteria: any): Promise<void>;
  
  // Get sync status for UI
  getSyncStatus(): SyncStatus;
  
  // Manual sync trigger (parent action)
  forceSync(): Promise<SyncResult>;
  
  // Handle connectivity changes
  onOnline(): void;
  onOffline(): void;
}

interface SyncStatus {
  isOnline: boolean;
  pendingItems: number;
  lastSync: Date | null;
  lastError: string | null;
  isSyncing: boolean;
}
```

---

## 4. Data Synchronization Patterns

### 4.1 Pattern 1: Append-Only Event Log (Recommended)
**Best for**: Progress tracking, activity logs, analytics

```typescript
// Local event schema
interface ProgressEvent {
  id: string;                    // UUID (idempotency key)
  childId: string;               // Local-only identifier
  activityType: string;          // 'letter_tracing', 'game', etc.
  contentId: string;             // 'letter-A', 'alphabet-game'
  score: number;
  duration: number;
  metadata: Record<string, any>; // Bounded, non-sensitive
  timestamp: number;             // Client timestamp
  synced: boolean;               // Sync status
}

// Sync payload (minimal, aggregated)
interface SyncPayload {
  events: ProgressEvent[];       // Batch of unsynced events
  deviceId: string;              // Anonymous device identifier
  appVersion: string;            // For compatibility
}

// Server endpoint (idempotent)
POST /api/sync/progress
{
  "events": [...],
  "deviceId": "anon-xyz",
  "appVersion": "1.2.3"
}
// Response: { "received": 5, "duplicates": 0 }
```

**Pros**: Simple, conflict-free, audit-friendly
**Cons**: Can grow large; requires periodic compaction

### 4.2 Pattern 2: CRDT-Based State Sync
**Best for**: User profiles, settings, collaborative features

```typescript
// Using Yjs or Automerge for CRDTs
import * as Y from 'yjs';

// Shared document structure
const doc = new Y.Doc();
const progressMap = doc.getMap('childProgress');

// Local update (immediate)
progressMap.set('letter-A', {
  attempts: 5,
  bestScore: 95,
  lastPracticed: Date.now(),
});

// Sync via WebSocket or HTTP
const update = Y.encodeStateAsUpdate(doc);
await fetch('/api/sync/crdt', {
  method: 'POST',
  body: update,
  headers: { 'Content-Type': 'application/octet-stream' }
});
```

**Pros**: Automatic conflict resolution, real-time capable
**Cons**: More complex; larger bundle size; learning curve

### 4.3 Pattern 3: Last-Write-Wins with Vector Clocks
**Best for**: Simple key-value data where conflicts are rare

```typescript
interface VersionedValue<T> {
  value: T;
  version: VectorClock;  // { [deviceId]: number }
  timestamp: number;
}

function mergeValues<T>(
  local: VersionedValue<T>,
  remote: VersionedValue<T>
): VersionedValue<T> {
  // If remote is causally after local, accept remote
  if (isCausallyAfter(remote.version, local.version)) {
    return remote;
  }
  // If concurrent, use timestamp as tiebreaker
  if (remote.timestamp > local.timestamp) {
    return remote;
  }
  return local;
}
```

**Pros**: Simple to implement; low overhead
**Cons**: Can lose data in concurrent edits; not ideal for complex state

### 4.4 Pattern Selection Matrix
| Data Type | Recommended Pattern | Reason |
|-----------|-------------------|--------|
| Progress events | Append-only log | Immutable, audit-friendly, no conflicts |
| Child profile | CRDT or LWW | Rare edits, simple merge logic |
| App settings | LWW with timestamps | Simple, conflicts unlikely |
| AI conversation history | Append-only (local only) | Privacy: don't sync raw conversations |
| Parent preferences | CRDT | May edit from multiple devices |

---

## 5. Conflict Resolution Strategies

### 5.1 Conflict Scenarios & Resolutions
| Scenario | Example | Resolution Strategy |
|----------|---------|-------------------|
| **Same event, different devices** | Child traces "A" on tablet, then phone | Idempotency key deduplication |
| **Conflicting profile updates** | Parent changes name on web, child on app | Last-write-wins with parent priority |
| **Offline progress + server change** | Child practices offline; parent resets progress online | Merge: keep child progress, log reset as separate event |
| **Model version mismatch** | App uses Qwen3.5-1.5B; server expects 3B | Version negotiation; graceful fallback |

### 5.2 Idempotency Implementation
```typescript
// Server-side deduplication (FastAPI example)
@app.post("/api/sync/progress")
async def sync_progress(payload: SyncPayload, db: Session = Depends(get_db)):
    received = 0
    duplicates = 0
    
    for event in payload.events:
        # Check if already processed
        existing = db.query(ProgressEvent).filter(
            ProgressEvent.id == event.id
        ).first()
        
        if existing:
            duplicates += 1
            continue
        
        # Store new event
        db_event = ProgressEvent(**event.dict())
        db.add(db_event)
        received += 1
    
    db.commit()
    return {"received": received, "duplicates": duplicates}
```

### 5.3 Parent-Mediated Conflict Resolution
For rare conflicts that can't be auto-resolved:

```typescript
interface Conflict {
  entityType: string;
  itemId: string;
  localValue: any;
  remoteValue: any;
  conflictType: 'edit' | 'delete' | 'version';
  timestamp: number;
}

// Present to parent in dashboard (not child)
function renderConflictResolution(conflict: Conflict): JSX.Element {
  return (
    <div className="conflict-banner">
      <p>We noticed different updates for {conflict.entityType}.</p>
      <div className="options">
        <button onClick={() => resolveConflict(conflict.itemId, 'local')}>
          Keep device version
        </button>
        <button onClick={() => resolveConflict(conflict.itemId, 'remote')}>
          Keep cloud version
        </button>
        <button onClick={() => resolveConflict(conflict.itemId, 'merge')}>
          Merge both
        </button>
      </div>
    </div>
  );
}
```

---

## 6. Storage Layer Design

### 6.1 IndexedDB Schema (Dexie.js)
```typescript
import Dexie from 'dexie';

class AdvayDB extends Dexie {
  progressEvents!: Dexie.Table<ProgressEvent, string>;
  childProfiles!: Dexie.Table<ChildProfile, string>;
  syncQueue!: Dexie.Table<SyncQueueItem, string>;
  aiModels!: Dexie.Table<AIModelMeta, string>;
  
  constructor() {
    super('AdvayDB');
    
    this.version(1).stores({
      progressEvents: 'id, childId, activityType, timestamp, synced',
      childProfiles: 'id, name, age, createdAt',
      syncQueue: 'id, entityType, itemId, priority, createdAt',
      aiModels: 'id, name, version, size, downloadedAt',
    });
  }
}

export const db = new AdvayDB();
```

### 6.2 Storage Quotas & Management
| Browser | Approx. Quota | Notes |
|---------|--------------|-------|
| Chrome | ~60% of disk | Prompted at ~80% usage |
| Firefox | ~50% of disk | Per-origin limit |
| Safari | ~1GB or 50% | More restrictive |
| Edge | ~60% of disk | Similar to Chrome |

**Management Strategies**:
```typescript
// Periodic cleanup of old events
async function cleanupOldEvents(daysToKeep: number = 90): Promise<void> {
  const cutoff = Date.now() - (daysToKeep * 24 * 60 * 60 * 1000);
  
  const deleted = await db.progressEvents
    .where('timestamp')
    .below(cutoff)
    .filter(event => event.synced) // Only delete synced events
    .delete();
  
  console.log(`Cleaned up ${deleted} old events`);
}

// Monitor storage usage
async function checkStorageHealth(): Promise<StorageHealth> {
  const estimate = await navigator.storage.estimate();
  const usagePercent = (estimate.usage! / estimate.quota!) * 100;
  
  return {
    usagePercent,
    isHealthy: usagePercent < 80,
    recommendation: usagePercent > 80 ? 'cleanup' : 'ok',
  };
}
```

### 6.3 Cache Storage for Assets & Models
```typescript
// Service Worker cache strategy
const CACHE_VERSION = 'v1';
const STATIC_CACHE = `advay-static-${CACHE_VERSION}`;
const MODEL_CACHE = `advay-models-${CACHE_VERSION}`;

// Precache critical assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll([
        '/',
        '/index.html',
        '/manifest.json',
        '/assets/icons/',
        '/assets/audio/pip-voice/',
      ]);
    })
  );
});

// Runtime caching for AI models (stale-while-revalidate)
self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('/models/')) {
    event.respondWith(
      caches.open(MODEL_CACHE).then(async (cache) => {
        const cached = await cache.match(event.request);
        const fetchPromise = fetch(event.request).then((response) => {
          cache.put(event.request, response.clone());
          return response;
        });
        return cached || fetchPromise;
      })
    );
  }
});
```

---

## 7. Service Worker & PWA Integration

### 7.1 Service Worker Lifecycle Management
```typescript
// Register with update logic
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js', { scope: '/' })
    .then((registration) => {
      // Check for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        newWorker?.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New version available; prompt parent
            showUpdateAvailable(() => {
              newWorker.postMessage({ type: 'SKIP_WAITING' });
            });
          }
        });
      });
    });
}
```

### 7.2 Background Sync API
```typescript
// Queue sync when offline
async function queueBackgroundSync(tag: string) {
  if ('serviceWorker' in navigator && 'SyncManager' in window) {
    const registration = await navigator.serviceWorker.ready;
    await registration.sync.register(tag);
  }
}

// Service Worker: handle sync event
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-progress') {
    event.waitUntil(processProgressQueue());
  }
  if (event.tag === 'sync-profile') {
    event.waitUntil(processProfileUpdates());
  }
});
```

### 7.3 Periodic Background Sync (Advanced)
```typescript
// Request periodic sync (Chrome 98+)
if ('periodicSync' in registration) {
  await registration.periodicSync.register('daily-sync', {
    minInterval: 24 * 60 * 60 * 1000, // 24 hours
  });
}

// Service Worker: handle periodic sync
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'daily-sync') {
    event.waitUntil(syncAllPendingData());
  }
});
```

**Note**: Periodic Sync has limited browser support; use as enhancement only.

### 7.4 Offline Detection & UX
```typescript
// Hook for offline status
function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  return isOnline;
}

// UI indicator (subtle, non-alarming for kids)
function ConnectivityIndicator() {
  const isOnline = useOnlineStatus();
  
  return (
    <div className={`connectivity ${isOnline ? 'online' : 'offline'}`}>
      {isOnline ? '☁️' : '📴'}
      <span className="sr-only">
        {isOnline ? 'Connected' : 'Working offline'}
      </span>
    </div>
  );
}
```

---

## 8. AI Model Management Offline

### 8.1 Model Download & Storage
```typescript
interface AIModelConfig {
  id: string;
  name: string;
  version: string;
  size: number;           // bytes
  quantization: 'q4f16' | 'q4f32' | 'fp16';
  downloadUrl: string;
  checksum: string;       // for integrity
  minWebGPU: boolean;     // requires WebGPU?
}

async function downloadModel(config: AIModelConfig): Promise<void> {
  // Check storage quota first
  const estimate = await navigator.storage.estimate();
  const available = estimate.quota! - estimate.usage!;
  
  if (available < config.size * 1.2) { // 20% buffer
    throw new Error('Insufficient storage for model');
  }
  
  // Download with progress
  const response = await fetch(config.downloadUrl);
  const reader = response.body?.getReader();
  
  let downloaded = 0;
  const chunks: Uint8Array[] = [];
  
  while (true) {
    const { done, value } = await reader!.read();
    if (done) break;
    
    chunks.push(value!);
    downloaded += value!.length;
    
    // Update progress UI
    onModelDownloadProgress(config.id, downloaded / config.size);
  }
  
  // Verify checksum
  const blob = new Blob(chunks);
  const arrayBuffer = await blob.arrayBuffer();
  const actualChecksum = await crypto.subtle.digest('SHA-256', arrayBuffer);
  
  if (actualChecksum !== config.checksum) {
    throw new Error('Model integrity check failed');
  }
  
  // Store in IndexedDB
  await db.aiModels.add({
    id: config.id,
    ...config,
    downloadedAt: Date.now(),
    data: blob,
  });
}
```

### 8.2 Model Selection by Connectivity & Capability
```typescript
async function selectBestModel(): Promise<AIModelConfig> {
  const isOnline = navigator.onLine;
  const hasWebGPU = !!navigator.gpu;
  const storage = await navigator.storage.estimate();
  const availableGB = (storage.quota! - storage.usage!) / (1024 ** 3);
  
  // Priority order: local capable > local fallback > cloud
  if (hasWebGPU && availableGB > 1) {
    // Best local experience
    return getModelConfig('Qwen3.5-1.5B-Instruct', 'q4f16');
  }
  
  if (availableGB > 0.5) {
    // Fallback local model
    return getModelConfig('Qwen3.5-0.5B-Instruct', 'q4f16');
  }
  
  if (isOnline && parentConsentsToCloud()) {
    // Cloud fallback (parent-gated)
    return getModelConfig('HF-Inference-Qwen3.5', 'cloud');
  }
  
  // Last resort: pre-composed responses
  return getModelConfig('CachedResponses', 'offline');
}
```

### 8.3 Model Updates & Versioning
```typescript
// Check for model updates (background, parent-notified)
async function checkModelUpdates(): Promise<ModelUpdate[]> {
  if (!navigator.onLine) return [];
  
  const installed = await db.aiModels.toArray();
  const updates: ModelUpdate[] = [];
  
  for (const model of installed) {
    const latest = await fetchLatestModelVersion(model.name);
    
    if (latest.version !== model.version) {
      updates.push({
        modelId: model.id,
        currentVersion: model.version,
        newVersion: latest.version,
        sizeDelta: latest.size - model.size,
        changelog: latest.changelog,
      });
    }
  }
  
  return updates;
}

// Notify parent of available updates
function showModelUpdateNotification(updates: ModelUpdate[]) {
  // Only notify parent, not child
  if (updates.length > 0) {
    parentDashboard.showNotification({
      type: 'model_update',
      title: 'Learning improvements available',
      message: `${updates.length} model${updates.length > 1 ? 's' : ''} can be updated for better performance.`,
      action: 'review_updates',
    });
  }
}
```

---

## 9. Implementation Roadmap

### Phase 1: Foundation (Weeks 1-2)
| Task | Component | Effort | Priority |
|------|-----------|--------|----------|
| Set up Dexie.js with schema | Storage layer | 2 days | P0 |
| Implement idempotent event logging | Progress tracking | 3 days | P0 |
| Create SyncManager with queue | Sync logic | 3 days | P0 |
| Basic Service Worker registration | PWA setup | 1 day | P1 |
| Offline status indicator | UI component | 1 day | P1 |

### Phase 2: Sync & Resilience (Weeks 3-4)
| Task | Component | Effort | Priority |
|------|-----------|--------|----------|
| Background Sync API integration | Service Worker | 2 days | P0 |
| Idempotent server endpoints | Backend API | 3 days | P0 |
| Conflict detection & logging | Sync logic | 2 days | P1 |
| Storage quota monitoring | Utilities | 1 day | P1 |
| Model download manager | AI layer | 3 days | P1 |

### Phase 3: Polish & Parent Controls (Weeks 5-6)
| Task | Component | Effort | Priority |
|------|-----------|--------|----------|
| Parent sync settings UI | Dashboard | 2 days | P1 |
| Sync status visualization | UI components | 2 days | P2 |
| Model update notifications | Parent comms | 1 day | P2 |
| Offline testing suite | QA automation | 3 days | P1 |
| Documentation & runbooks | DevOps | 2 days | P2 |

### Phase 4: Advanced (Future)
| Task | Component | Effort | Notes |
|------|-----------|--------|-------|
| CRDT integration (Yjs) | State sync | 5-7 days | If collaborative features added |
| Periodic Background Sync | Service Worker | 2 days | Chrome-only enhancement |
| Cross-device sync UI | Parent dashboard | 3 days | If multi-device support needed |
| Analytics compaction | Data pipeline | 2 days | For long-term storage efficiency |

### Effort Summary
```
Total estimated effort: ~35-45 engineering days
Team recommendation: 2 engineers (full-time), 1 designer (part-time)
Critical path: Phase 1 + Phase 2 (4 weeks) for MVP offline support
```

---

## 10. Testing & Monitoring

### 10.1 Test Scenarios
```typescript
describe('Offline-First Sync', () => {
  test('records progress when offline', async () => {
    // Simulate offline
    mockNetwork('offline');
    
    await recordProgress(testEvent);
    
    // Verify local storage
    const events = await db.progressEvents.toArray();
    expect(events).toHaveLength(1);
    expect(events[0].synced).toBe(false);
  });
  
  test('syncs when back online', async () => {
    // Start offline, record event
    mockNetwork('offline');
    await recordProgress(testEvent);
    
    // Go online, trigger sync
    mockNetwork('online');
    await syncManager.processQueue();
    
    // Verify server received event
    expect(mockServer.receivedEvents).toContainEqual(
      expect.objectContaining({ id: testEvent.id })
    );
  });
  
  test('handles duplicate events gracefully', async () => {
    // Send same event twice
    await syncManager.queueSync('progress', 'event-123');
    await syncManager.queueSync('progress', 'event-123');
    
    await syncManager.processQueue();
    
    // Server should only count once
    expect(mockServer.duplicates).toBe(1);
    expect(mockServer.received).toBe(1);
  });
  
  test('respects storage quotas', async () => {
    // Mock low storage
    mockStorageQuota(100 * 1024 * 1024); // 100MB
    
    // Try to download large model
    await expect(downloadModel(largeModelConfig))
      .rejects.toThrow('Insufficient storage');
  });
});
```

### 10.2 Monitoring & Observability
```typescript
// Sync metrics (anonymized, aggregated)
interface SyncMetrics {
  totalEventsQueued: number;
  totalEventsSynced: number;
  averageSyncLatency: number;
  conflictCount: number;
  storageUsagePercent: number;
  offlineSessionCount: number;
}

// Log to parent dashboard (opt-in)
function reportSyncMetrics(metrics: SyncMetrics) {
  if (parentConsentsToAnalytics()) {
    // Send only aggregated, anonymous metrics
    analytics.track('sync_health', {
      ...metrics,
      // No PII, no device identifiers
      timestamp: Date.now(),
      appVersion: APP_VERSION,
    });
  }
}
```

### 10.3 Debugging Tools (Dev Only)
```typescript
// Expose sync state in dev console
if (process.env.NODE_ENV === 'development') {
  (window as any).__ADVAY_SYNC__ = {
    getQueue: () => db.syncQueue.toArray(),
    forceSync: () => syncManager.forceSync(),
    clearQueue: () => db.syncQueue.clear(),
    getModelStatus: () => db.aiModels.toArray(),
    simulateOffline: () => mockNetwork('offline'),
    simulateOnline: () => mockNetwork('online'),
  };
}
```

---

## 11. References & Resources

### 11.1 Standards & Specifications
- [Progressive Web Apps](https://web.dev/progressive-web-apps/)
- [Background Sync API](https://developer.mozilla.org/en-US/docs/Web/API/Background_Sync_API)
- [IndexedDB API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- [Service Workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Web Storage API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API)

### 11.2 Libraries & Tools
- [Dexie.js](https://dexie.org/) - IndexedDB wrapper
- [Yjs](https://yjs.dev/) - CRDT library
- [Workbox](https://developer.chrome.com/docs/workbox/) - Service Worker utilities
- [localForage](https://localforage.dev/) - Simple storage API
- [idb](https://github.com/jakearchibald/idb) - Lightweight IndexedDB wrapper

### 11.3 Articles & Guides
- [Offline Cookbook](https://jakearchibald.com/2014/offline-cookbook/)
- [Building an Offline-First PWA](https://web.dev/offline-cookbook/)
- [CRDTs for the Rest of Us](https://martin.kleppmann.com/2020/07/06/crdt-paper.html)
- [IndexedDB Best Practices](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Using_IndexedDB)

### 11.4 Project-Specific References
- [`/docs/analytics/ARCHITECTURE.md`](../analytics/ARCHITECTURE.md) - Existing progress tracking
- [`/docs/SKILLS_PROGRESSION_SYSTEM.md`](../SKILLS_PROGRESSION_SYSTEM.md) - Skills data model
- [`/docs/research/CHILD_ANALYTICS_FRAMEWORK.md`](./CHILD_ANALYTICS_FRAMEWORK.md) - Privacy-first analytics
- [`/docs/research/CONTENT_SAFETY_MODERATION.md`](./CONTENT_SAFETY_MODERATION.md) - Safety constraints

---

## Appendix A: Idempotency Key Generation

```typescript
// Deterministic idempotency key for progress events
function generateIdempotencyKey(
  childId: string,
  activityType: string,
  contentId: string,
  timestamp: number
): string {
  const data = `${childId}:${activityType}:${contentId}:${timestamp}`;
  return crypto.randomUUID(); // Or hash for deterministic keys
}

// For deterministic keys (if needed for deduplication):
async function generateDeterministicKey(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
```

## Appendix B: Storage Health Check

```typescript
async function performStorageHealthCheck(): Promise<HealthReport> {
  const estimate = await navigator.storage.estimate();
  const usagePercent = (estimate.usage! / estimate.quota!) * 100;
  
  const report: HealthReport = {
    quotaGB: estimate.quota! / (1024 ** 3),
    usedGB: estimate.usage! / (1024 ** 3),
    usagePercent,
    status: usagePercent < 80 ? 'healthy' : 
            usagePercent < 95 ? 'warning' : 'critical',
    recommendations: [],
  };
  
  if (usagePercent > 80) {
    report.recommendations.push('Clean up old synced events');
  }
  if (usagePercent > 95) {
    report.recommendations.push('Urgent: Delete unused AI models');
  }
  
  return report;
}
```

---

**Last Updated**: 2026-03-05  
**Next Review**: Before Phase 1 implementation begins  
**Related**: `ARCHITECTURE.md`, `CHILD_ANALYTICS_FRAMEWORK.md`, `CONTENT_SAFETY_MODERATION.md`

---

*This document supports the "Local-First" design principle from the core architecture. All offline functionality must be tested on low-end devices with limited storage and spotty connectivity.*
