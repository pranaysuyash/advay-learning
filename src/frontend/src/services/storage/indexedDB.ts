/**
 * IndexedDB Storage Layer
 *
 * Simple IndexedDB wrapper for offline-first data persistence.
 * Replaces localStorage for larger data storage.
 *
 * @see docs/research/OFFLINE_FIRST_SYNC_STRATEGY.md
 */

const DB_NAME = 'advay-learning';
const DB_VERSION = 1;

interface DBSchema {
  progress: ProgressRecord;
  syncQueue: SyncQueueRecord;
  profiles: ProfileRecord;
  settings: SettingsRecord;
}

interface ProgressRecord {
  id: string;
  profileId: string;
  activityType: string;
  contentId: string;
  score: number;
  duration?: number;
  completed?: boolean;
  metadata?: Record<string, unknown>;
  timestamp: number;
  synced: boolean;
}

interface SyncQueueRecord {
  id: string;
  entityType: string;
  itemId: string;
  priority: number;
  createdAt: number;
  retryCount: number;
  lastError?: string;
}

interface ProfileRecord {
  id: string;
  name: string;
  age: number;
  createdAt: number;
  updatedAt: number;
}

interface SettingsRecord {
  key: string;
  value: unknown;
}

class IndexedDBStorage {
  private db: IDBDatabase | null = null;
  private initPromise: Promise<IDBDatabase> | null = null;

  async init(): Promise<IDBDatabase> {
    if (this.db) return this.db;
    if (this.initPromise) return this.initPromise;

    this.initPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(new Error('Failed to open IndexedDB'));

      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        if (!db.objectStoreNames.contains('progress')) {
          const progressStore = db.createObjectStore('progress', { keyPath: 'id' });
          progressStore.createIndex('profileId', 'profileId', { unique: false });
          progressStore.createIndex('synced', 'synced', { unique: false });
          progressStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        if (!db.objectStoreNames.contains('syncQueue')) {
          const syncStore = db.createObjectStore('syncQueue', { keyPath: 'id' });
          syncStore.createIndex('entityType', 'entityType', { unique: false });
          syncStore.createIndex('createdAt', 'createdAt', { unique: false });
        }

        if (!db.objectStoreNames.contains('profiles')) {
          const profileStore = db.createObjectStore('profiles', { keyPath: 'id' });
          profileStore.createIndex('createdAt', 'createdAt', { unique: false });
        }

        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' });
        }
      };
    });

    return this.initPromise;
  }

  private async getStore(storeName: keyof DBSchema, mode: IDBTransactionMode = 'readonly'): Promise<IDBObjectStore> {
    const db = await this.init();
    const transaction = db.transaction(storeName, mode);
    return transaction.objectStore(storeName);
  }

  async add<T extends keyof DBSchema>(storeName: T, record: DBSchema[T]): Promise<string> {
    const store = await this.getStore(storeName, 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.add(record);
      request.onsuccess = () => resolve((record as { id: string }).id);
      request.onerror = () => reject(request.error);
    });
  }

  async put<T extends keyof DBSchema>(storeName: T, record: DBSchema[T]): Promise<string> {
    const store = await this.getStore(storeName, 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.put(record);
      request.onsuccess = () => resolve((record as { id: string }).id);
      request.onerror = () => reject(request.error);
    });
  }

  async get<T extends keyof DBSchema>(storeName: T, id: string): Promise<DBSchema[T] | undefined> {
    const store = await this.getStore(storeName);
    return new Promise((resolve, reject) => {
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async delete<T extends keyof DBSchema>(storeName: T, id: string): Promise<void> {
    const store = await this.getStore(storeName, 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getAll<T extends keyof DBSchema>(storeName: T): Promise<DBSchema[T][]> {
    const store = await this.getStore(storeName);
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getByIndex<T extends keyof DBSchema>(
    storeName: T,
    indexName: string,
    value: IDBValidKey
  ): Promise<DBSchema[T][]> {
    const store = await this.getStore(storeName);
    const index = store.index(indexName);
    return new Promise((resolve, reject) => {
      const request = index.getAll(value);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getUnsyncedProgress(): Promise<ProgressRecord[]> {
    const all = await this.getAll('progress');
    return all.filter((p) => !p.synced);
  }

  async markProgressSynced(ids: string[]): Promise<void> {
    const db = await this.init();
    const transaction = db.transaction('progress', 'readwrite');
    const store = transaction.objectStore('progress');

    for (const id of ids) {
      const record = await this.get('progress', id);
      if (record) {
        record.synced = true;
        store.put(record);
      }
    }
  }

  async getStorageEstimate(): Promise<{ usage: number; quota: number; percentUsed: number }> {
    const estimate = await navigator.storage.estimate();
    return {
      usage: estimate.usage || 0,
      quota: estimate.quota || 0,
      percentUsed: estimate.quota ? ((estimate.usage || 0) / estimate.quota) * 100 : 0,
    };
  }
}

export const db = new IndexedDBStorage();
export type { ProgressRecord, SyncQueueRecord, ProfileRecord, SettingsRecord };
