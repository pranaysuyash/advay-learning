/**
 * LocalStorageProgressRepository v2 - Optimized with Map-based caching
 *
 * Production implementation of ProgressRepository using localStorage.
 * Now with O(1) lookups via in-memory Map cache.
 *
 * Performance improvements:
 * - Map-based item storage (O(1) vs O(n) array scans)
 * - Status indexes for fast filtering
 * - Lazy loading with cache invalidation
 *
 * @ticket TCK-20260306-003 (ISSUE-004 Performance)
 */

import { ProgressItem } from '../services/progressQueue';
import { STORAGE_KEY } from '../services/progressConstants';
import { ProgressRepository, DeadLetterItem, QueueStats } from './ProgressRepository';

const DEAD_LETTER_KEY = `${STORAGE_KEY}:deadLetters`;

export class LocalStorageProgressRepository implements ProgressRepository {
  private storageKey: string;
  private deadLetterKey: string;
  private listeners: Set<() => void> = new Set();

  // v2: Map-based cache for O(1) lookups
  private itemsCache: Map<string, ProgressItem> | null = null;
  private deadLettersCache: Map<string, DeadLetterItem> | null = null;

  // v2: Status indexes for fast filtering
  private pendingIndex: Set<string> = new Set();
  private errorIndex: Set<string> = new Set();
  private syncedIndex: Set<string> = new Set();

  constructor(
    storageKey: string = STORAGE_KEY,
    deadLetterKey: string = DEAD_LETTER_KEY
  ) {
    this.storageKey = storageKey;
    this.deadLetterKey = deadLetterKey;
  }

  // v2: Load items into Map cache
  private loadItems(): Map<string, ProgressItem> {
    if (this.itemsCache) {
      return this.itemsCache;
    }

    try {
      const data = localStorage.getItem(this.storageKey);
      const items: ProgressItem[] = data ? JSON.parse(data) : [];

      this.itemsCache = new Map();
      this.pendingIndex.clear();
      this.errorIndex.clear();
      this.syncedIndex.clear();

      for (const item of items) {
        this.itemsCache.set(item.idempotency_key, item);
        this.updateStatusIndex(item.idempotency_key, item.status);
      }

      return this.itemsCache;
    } catch (error) {
      console.error('[LocalStorageProgressRepository] Failed to load items:', error);
      this.itemsCache = new Map();
      return this.itemsCache;
    }
  }

  // v2: Load dead letters into Map cache
  private loadDeadLetters(): Map<string, DeadLetterItem> {
    if (this.deadLettersCache) {
      return this.deadLettersCache;
    }

    try {
      const data = localStorage.getItem(this.deadLetterKey);
      const deadLetters: DeadLetterItem[] = data ? JSON.parse(data) : [];

      this.deadLettersCache = new Map();
      for (const dl of deadLetters) {
        this.deadLettersCache.set(dl.item.idempotency_key, dl);
      }

      return this.deadLettersCache;
    } catch (error) {
      console.error('[LocalStorageProgressRepository] Failed to load dead letters:', error);
      this.deadLettersCache = new Map();
      return this.deadLettersCache;
    }
  }

  // v2: Persist items from cache to localStorage
  private persistItems(): void {
    if (!this.itemsCache) return;

    try {
      const items = Array.from(this.itemsCache.values());
      localStorage.setItem(this.storageKey, JSON.stringify(items));
    } catch (error) {
      console.error('[LocalStorageProgressRepository] Failed to persist items:', error);
    }
  }

  // v2: Persist dead letters from cache to localStorage
  private persistDeadLetters(): void {
    if (!this.deadLettersCache) return;

    try {
      const deadLetters = Array.from(this.deadLettersCache.values());
      localStorage.setItem(this.deadLetterKey, JSON.stringify(deadLetters));
    } catch (error) {
      console.error('[LocalStorageProgressRepository] Failed to persist dead letters:', error);
    }
  }

  // v2: Update status indexes
  private updateStatusIndex(id: string, status?: ProgressItem['status']): void {
    this.pendingIndex.delete(id);
    this.errorIndex.delete(id);
    this.syncedIndex.delete(id);

    if (status === 'pending') this.pendingIndex.add(id);
    else if (status === 'error') this.errorIndex.add(id);
    else if (status === 'synced') this.syncedIndex.add(id);
  }

  // Item Operations - O(1) with Map cache

  getAll(): ProgressItem[] {
    return Array.from(this.loadItems().values());
  }

  getByStatus(status: ProgressItem['status']): ProgressItem[] {
    const items = this.loadItems();
    let keys: Set<string>;

    switch (status) {
      case 'pending':
        keys = this.pendingIndex;
        break;
      case 'error':
        keys = this.errorIndex;
        break;
      case 'synced':
        keys = this.syncedIndex;
        break;
      default:
        return [];
    }

    const result: ProgressItem[] = [];
    for (const key of keys) {
      const item = items.get(key);
      if (item) result.push(item);
    }
    return result;
  }

  getPending(): ProgressItem[] {
    return this.getByStatus('pending');
  }

  getRetryable(maxRetries: number): ProgressItem[] {
    const items = this.loadItems();
    const result: ProgressItem[] = [];

    for (const key of this.errorIndex) {
      const item = items.get(key);
      if (item && (item.retryCount || 0) < maxRetries) {
        result.push(item);
      }
    }
    return result;
  }

  save(item: ProgressItem): void {
    const items = this.loadItems();
    items.set(item.idempotency_key, { ...item });
    this.updateStatusIndex(item.idempotency_key, item.status);
    this.persistItems();
    this.notify();
  }

  saveMany(itemsToSave: ProgressItem[]): void {
    const items = this.loadItems();

    for (const item of itemsToSave) {
      items.set(item.idempotency_key, { ...item });
      this.updateStatusIndex(item.idempotency_key, item.status);
    }

    this.persistItems();
    this.notify();
  }

  remove(idempotencyKey: string): boolean {
    const items = this.loadItems();
    const existed = items.has(idempotencyKey);

    if (existed) {
      items.delete(idempotencyKey);
      this.updateStatusIndex(idempotencyKey, undefined);
      this.persistItems();
      this.notify();
    }

    return existed;
  }

  removeMany(idempotencyKeys: string[]): number {
    const items = this.loadItems();
    let removed = 0;

    for (const key of idempotencyKeys) {
      if (items.delete(key)) {
        this.updateStatusIndex(key, undefined);
        removed++;
      }
    }

    if (removed > 0) {
      this.persistItems();
      this.notify();
    }

    return removed;
  }

  findById(idempotencyKey: string): ProgressItem | undefined {
    return this.loadItems().get(idempotencyKey);
  }

  exists(idempotencyKey: string): boolean {
    return this.loadItems().has(idempotencyKey);
  }

  // Status Operations - O(1) with Map cache

  updateStatus(
    idempotencyKey: string,
    status: ProgressItem['status'],
    metadata?: Partial<ProgressItem>
  ): boolean {
    const items = this.loadItems();
    const item = items.get(idempotencyKey);

    if (!item) return false;

    const updatedItem = { ...item, status, ...metadata };
    items.set(idempotencyKey, updatedItem);
    this.updateStatusIndex(idempotencyKey, status);
    this.persistItems();
    this.notify();
    return true;
  }

  markSynced(idempotencyKey: string): boolean {
    return this.updateStatus(idempotencyKey, 'synced', {
      syncedAt: new Date().toISOString(),
    });
  }

  markError(idempotencyKey: string, errorMessage: string): boolean {
    const items = this.loadItems();
    const item = items.get(idempotencyKey);

    if (!item) return false;

    const currentRetryCount = item.retryCount || 0;
    const updatedItem: ProgressItem = {
      ...item,
      status: 'error',
      retryCount: currentRetryCount + 1,
      lastError: errorMessage,
      lastRetryAt: new Date().toISOString(),
    };

    items.set(idempotencyKey, updatedItem);
    this.updateStatusIndex(idempotencyKey, 'error');
    this.persistItems();
    this.notify();
    return true;
  }

  clear(): void {
    this.itemsCache = new Map();
    this.deadLettersCache = new Map();
    this.pendingIndex.clear();
    this.errorIndex.clear();
    this.syncedIndex.clear();

    localStorage.removeItem(this.storageKey);
    localStorage.removeItem(this.deadLetterKey);
    this.notify();
  }

  // Statistics - O(1) with index counts

  getStats(): QueueStats {
    return {
      total: this.loadItems().size,
      pending: this.pendingIndex.size,
      error: this.errorIndex.size,
      synced: this.syncedIndex.size,
      deadLetters: this.loadDeadLetters().size,
    };
  }

  // Dead Letter Queue Operations - O(1) with Map cache

  getDeadLetters(profileId?: string): DeadLetterItem[] {
    const deadLetters = Array.from(this.loadDeadLetters().values());

    if (profileId) {
      return deadLetters.filter(dl => dl.item.profile_id === profileId);
    }
    return deadLetters;
  }

  addDeadLetter(deadLetter: DeadLetterItem): void {
    const deadLetters = this.loadDeadLetters();

    deadLetters.set(deadLetter.item.idempotency_key, deadLetter);

    // Remove from main queue
    const items = this.loadItems();
    items.delete(deadLetter.item.idempotency_key);
    this.updateStatusIndex(deadLetter.item.idempotency_key, undefined);

    this.persistDeadLetters();
    this.persistItems();
    this.notify();
  }

  removeDeadLetter(idempotencyKey: string): boolean {
    const deadLetters = this.loadDeadLetters();
    const existed = deadLetters.has(idempotencyKey);

    if (existed) {
      deadLetters.delete(idempotencyKey);
      this.persistDeadLetters();
      this.notify();
    }

    return existed;
  }

  retryDeadLetter(idempotencyKey: string): boolean {
    const deadLetters = this.loadDeadLetters();
    const deadLetter = deadLetters.get(idempotencyKey);

    if (!deadLetter) return false;

    deadLetters.delete(idempotencyKey);

    const itemToRetry: ProgressItem = {
      ...deadLetter.item,
      status: 'pending',
      retryCount: 0,
      lastError: undefined,
      lastRetryAt: undefined,
    };

    const items = this.loadItems();
    items.set(idempotencyKey, itemToRetry);
    this.updateStatusIndex(idempotencyKey, 'pending');

    this.persistDeadLetters();
    this.persistItems();
    this.notify();
    return true;
  }

  getDeadLetterCount(): number {
    return this.loadDeadLetters().size;
  }

  // Subscription

  subscribe(callback: () => void): () => void {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  // v2: Clear cache (useful for testing or memory management)
  clearCache(): void {
    this.itemsCache = null;
    this.deadLettersCache = null;
    this.pendingIndex.clear();
    this.errorIndex.clear();
    this.syncedIndex.clear();
  }

  // Private helpers

  private notify(): void {
    this.listeners.forEach(cb => {
      try {
        cb();
      } catch (error) {
        console.error('[LocalStorageProgressRepository] Listener error:', error);
      }
    });
  }
}

// Singleton instance for default usage
export const progressRepository = new LocalStorageProgressRepository();
