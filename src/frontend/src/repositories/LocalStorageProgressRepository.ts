/**
 * LocalStorageProgressRepository
 * 
 * Production implementation of ProgressRepository using localStorage.
 * Provides persistence across browser sessions.
 */

import { ProgressItem } from '../services/progressQueue';
import { STORAGE_KEY } from '../services/progressConstants';
import { ProgressRepository, DeadLetterItem, QueueStats } from './ProgressRepository';

const DEAD_LETTER_KEY = `${STORAGE_KEY}:deadLetters`;

export class LocalStorageProgressRepository implements ProgressRepository {
  private storageKey: string;
  private deadLetterKey: string;
  private listeners: Set<() => void> = new Set();

  constructor(
    storageKey: string = STORAGE_KEY,
    deadLetterKey: string = DEAD_LETTER_KEY
  ) {
    this.storageKey = storageKey;
    this.deadLetterKey = deadLetterKey;
  }

  // Item Operations

  getAll(): ProgressItem[] {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('[LocalStorageProgressRepository] Failed to getAll:', error);
      return [];
    }
  }

  getByStatus(status: ProgressItem['status']): ProgressItem[] {
    return this.getAll().filter(item => item.status === status);
  }

  getPending(): ProgressItem[] {
    return this.getAll().filter(
      item => item.status === 'pending'
    );
  }

  getRetryable(maxRetries: number): ProgressItem[] {
    return this.getAll().filter(
      item => item.status === 'error' && (item.retryCount || 0) < maxRetries
    );
  }

  save(item: ProgressItem): void {
    const items = this.getAll();
    const idx = items.findIndex(i => i.idempotency_key === item.idempotency_key);

    if (idx !== -1) {
      items[idx] = { ...items[idx], ...item };
    } else {
      items.push(item);
    }

    this.saveAll(items);
  }

  saveMany(itemsToSave: ProgressItem[]): void {
    const items = this.getAll();

    for (const item of itemsToSave) {
      const idx = items.findIndex(i => i.idempotency_key === item.idempotency_key);
      if (idx !== -1) {
        items[idx] = { ...items[idx], ...item };
      } else {
        items.push(item);
      }
    }

    this.saveAll(items);
  }

  remove(idempotencyKey: string): boolean {
    const items = this.getAll();
    const filtered = items.filter(i => i.idempotency_key !== idempotencyKey);

    if (filtered.length === items.length) {
      return false;
    }

    this.saveAll(filtered);
    return true;
  }

  removeMany(idempotencyKeys: string[]): number {
    const items = this.getAll();
    const keySet = new Set(idempotencyKeys);
    const filtered = items.filter(i => !keySet.has(i.idempotency_key));
    const removed = items.length - filtered.length;

    if (removed > 0) {
      this.saveAll(filtered);
    }

    return removed;
  }

  findById(idempotencyKey: string): ProgressItem | undefined {
    return this.getAll().find(i => i.idempotency_key === idempotencyKey);
  }

  exists(idempotencyKey: string): boolean {
    return this.getAll().some(i => i.idempotency_key === idempotencyKey);
  }

  // Status Operations

  updateStatus(
    idempotencyKey: string,
    status: ProgressItem['status'],
    metadata?: Partial<ProgressItem>
  ): boolean {
    const items = this.getAll();
    const idx = items.findIndex(i => i.idempotency_key === idempotencyKey);

    if (idx === -1) return false;

    items[idx] = {
      ...items[idx],
      status,
      ...metadata,
    };

    this.saveAll(items);
    return true;
  }

  markSynced(idempotencyKey: string): boolean {
    return this.updateStatus(idempotencyKey, 'synced', {
      syncedAt: new Date().toISOString(),
    });
  }

  markError(idempotencyKey: string, errorMessage: string): boolean {
    const items = this.getAll();
    const idx = items.findIndex(i => i.idempotency_key === idempotencyKey);

    if (idx === -1) return false;

    const currentRetryCount = items[idx].retryCount || 0;

    items[idx] = {
      ...items[idx],
      status: 'error',
      retryCount: currentRetryCount + 1,
      lastError: errorMessage,
      lastRetryAt: new Date().toISOString(),
    };

    this.saveAll(items);
    return true;
  }

  clear(): void {
    localStorage.removeItem(this.storageKey);
    localStorage.removeItem(this.deadLetterKey);
    this.notify();
  }

  // Statistics

  getStats(): QueueStats {
    const items = this.getAll();
    const deadLetters = this.getDeadLetters();

    return {
      total: items.length,
      pending: items.filter(i => i.status === 'pending').length,
      error: items.filter(i => i.status === 'error').length,
      synced: items.filter(i => i.status === 'synced').length,
      deadLetters: deadLetters.length,
    };
  }

  // Dead Letter Queue Operations

  getDeadLetters(profileId?: string): DeadLetterItem[] {
    try {
      const data = localStorage.getItem(this.deadLetterKey);
      const deadLetters: DeadLetterItem[] = data ? JSON.parse(data) : [];

      if (profileId) {
        return deadLetters.filter(dl => dl.item.profile_id === profileId);
      }
      return deadLetters;
    } catch (error) {
      console.error('[LocalStorageProgressRepository] Failed to getDeadLetters:', error);
      return [];
    }
  }

  addDeadLetter(deadLetter: DeadLetterItem): void {
    const deadLetters = this.getDeadLetters();

    // Remove if already exists
    const filtered = deadLetters.filter(
      dl => dl.item.idempotency_key !== deadLetter.item.idempotency_key
    );

    filtered.push(deadLetter);

    try {
      localStorage.setItem(this.deadLetterKey, JSON.stringify(filtered));
      // Remove from main queue
      this.remove(deadLetter.item.idempotency_key);
      this.notify();
    } catch (error) {
      console.error('[LocalStorageProgressRepository] Failed to addDeadLetter:', error);
    }
  }

  removeDeadLetter(idempotencyKey: string): boolean {
    const deadLetters = this.getDeadLetters();
    const filtered = deadLetters.filter(
      dl => dl.item.idempotency_key !== idempotencyKey
    );

    if (filtered.length === deadLetters.length) {
      return false;
    }

    try {
      localStorage.setItem(this.deadLetterKey, JSON.stringify(filtered));
      this.notify();
      return true;
    } catch (error) {
      console.error('[LocalStorageProgressRepository] Failed to removeDeadLetter:', error);
      return false;
    }
  }

  retryDeadLetter(idempotencyKey: string): boolean {
    const deadLetters = this.getDeadLetters();
    const deadLetter = deadLetters.find(
      dl => dl.item.idempotency_key === idempotencyKey
    );

    if (!deadLetter) return false;

    // Remove from dead letters
    const filtered = deadLetters.filter(
      dl => dl.item.idempotency_key !== idempotencyKey
    );

    try {
      localStorage.setItem(this.deadLetterKey, JSON.stringify(filtered));

      // Add back to queue with reset retry count
      const itemToRetry: ProgressItem = {
        ...deadLetter.item,
        status: 'pending',
        retryCount: 0,
        lastError: undefined,
        lastRetryAt: undefined,
      };

      this.save(itemToRetry);
      this.notify();
      return true;
    } catch (error) {
      console.error('[LocalStorageProgressRepository] Failed to retryDeadLetter:', error);
      return false;
    }
  }

  getDeadLetterCount(): number {
    return this.getDeadLetters().length;
  }

  // Subscription (for reactive updates)

  subscribe(callback: () => void): () => void {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  // Private helpers

  private saveAll(items: ProgressItem[]): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(items));
      this.notify();
    } catch (error) {
      console.error('[LocalStorageProgressRepository] Failed to save:', error);
      throw error;
    }
  }

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
