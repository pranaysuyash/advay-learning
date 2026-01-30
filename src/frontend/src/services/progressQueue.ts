// Offline progress queue service
// Simple IndexedDB fallback to localStorage (lightweight implementation for scaffolding)

export interface ProgressItem {
  idempotency_key: string;
  profile_id: string;
  activity_type: string;
  content_id: string;
  score: number;
  duration_seconds?: number;
  meta_data?: Record<string, any>;
  timestamp: string; // ISO
  status?: 'pending' | 'synced' | 'error';
}

const STORAGE_KEY = 'advay:progressQueue:v1';

function load(): ProgressItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Failed to load progress queue', e);
    return [];
  }
}

function save(items: ProgressItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    console.error('Failed to save progress queue', e);
  }
}

type Subscriber = () => void;

export const progressQueue = {
  _subscribers: new Set<Subscriber>(),

  enqueue(item: ProgressItem) {
    const items = load();
    items.push({ ...item, status: 'pending' });
    save(items);
    this._notify();
  },

  getPending(profileId?: string) {
    return load().filter(
      (i) =>
        i.status === 'pending' && (!profileId || i.profile_id === profileId),
    );
  },

  markSynced(idempotency_key: string) {
    const items = load();
    const idx = items.findIndex((i) => i.idempotency_key === idempotency_key);
    if (idx !== -1) {
      items[idx].status = 'synced';
      save(items);
      this._notify();
    }
  },

  subscribe(cb: Subscriber): () => void {
    this._subscribers.add(cb);
    return () => {
      this._subscribers.delete(cb);
    };
  },

  _notify() {
    this._subscribers.forEach((cb) => {
      try {
        cb();
      } catch (e) {
        console.error('progressQueue subscriber error', e);
      }
    });
  },

  async syncAll(apiClient: any) {
    // Group by profile
    const items = load().filter((i) => i.status === 'pending');
    if (items.length === 0) return { synced: 0 };

    const byProfile = items.reduce(
      (acc: Record<string, ProgressItem[]>, it) => {
        acc[it.profile_id] = acc[it.profile_id] || [];
        acc[it.profile_id].push(it);
        return acc;
      },
      {},
    );

    let synced = 0;
    for (const profileId of Object.keys(byProfile)) {
      try {
        const res = await apiClient.post(`/progress/batch`, {
          profile_id: profileId,
          items: byProfile[profileId],
        });
        const results = res.data?.results || [];
        results.forEach((r: any) => {
          if (r.status === 'ok' || r.status === 'duplicate') {
            this.markSynced(r.idempotency_key);
            synced += 1;
          }
        });
      } catch (e) {
        console.error('Batch sync failed for profile', profileId, e);
        // continue with next profile
      }
    }

    this._notify();
    return { synced };
  },
};
