/**
 * InMemoryProgressRepository
 * 
 * Test implementation of ProgressRepository using in-memory storage.
 * No localStorage dependency - perfect for unit tests and CI.
 */

import { ProgressItem } from '../services/progressQueue';
import { ProgressRepository, DeadLetterItem, QueueStats } from './ProgressRepository';

export class InMemoryProgressRepository implements ProgressRepository {
  private items: Map<string, ProgressItem> = new Map();
  private deadLetters: Map<string, DeadLetterItem> = new Map();
  private listeners: Set<() => void> = new Set();

  // Item Operations

  getAll(): ProgressItem[] {
    return Array.from(this.items.values());
  }

  getByStatus(status: ProgressItem['status']): ProgressItem[] {
    return this.getAll().filter(item => item.status === status);
  }

  getPending(): ProgressItem[] {
    return this.getAll().filter(
      item => item.status === 'pending' || item.status === 'error'
    );
  }

  getRetryable(maxRetries: number): ProgressItem[] {
    return this.getAll().filter(
      item => item.status === 'error' && (item.retryCount || 0) < maxRetries
    );
  }

  save(item: ProgressItem): void {
    this.items.set(item.idempotency_key, { ...item });
    this.notify();
  }

  saveMany(itemsToSave: ProgressItem[]): void {
    for (const item of itemsToSave) {
      this.items.set(item.idempotency_key, { ...item });
    }
    this.notify();
  }

  remove(idempotencyKey: string): boolean {
    const existed = this.items.has(idempotencyKey);
    this.items.delete(idempotencyKey);
    if (existed) this.notify();
    return existed;
  }

  removeMany(idempotencyKeys: string[]): number {
    let removed = 0;
    for (const key of idempotencyKeys) {
      if (this.items.delete(key)) removed++;
    }
    if (removed > 0) this.notify();
    return removed;
  }

  findById(idempotencyKey: string): ProgressItem | undefined {
    const item = this.items.get(idempotencyKey);
    return item ? { ...item } : undefined;
  }

  exists(idempotencyKey: string): boolean {
    return this.items.has(idempotencyKey);
  }

  // Status Operations

  updateStatus(
    idempotencyKey: string,
    status: ProgressItem['status'],
    metadata?: Partial<ProgressItem>
  ): boolean {
    const item = this.items.get(idempotencyKey);
    if (!item) return false;

    this.items.set(idempotencyKey, {
      ...item,
      status,
      ...metadata,
    });
    this.notify();
    return true;
  }

  markSynced(idempotencyKey: string): boolean {
    return this.updateStatus(idempotencyKey, 'synced', {
      syncedAt: new Date().toISOString(),
    });
  }

  markError(idempotencyKey: string, errorMessage: string): boolean {
    const item = this.items.get(idempotencyKey);
    if (!item) return false;

    const currentRetryCount = item.retryCount || 0;

    this.items.set(idempotencyKey, {
      ...item,
      status: 'error',
      retryCount: currentRetryCount + 1,
      lastError: errorMessage,
      lastRetryAt: new Date().toISOString(),
    });
    this.notify();
    return true;
  }

  clear(): void {
    this.items.clear();
    this.deadLetters.clear();
    this.notify();
  }

  // Statistics

  getStats(): QueueStats {
    const items = this.getAll();

    return {
      total: items.length,
      pending: items.filter(i => i.status === 'pending').length,
      error: items.filter(i => i.status === 'error').length,
      synced: items.filter(i => i.status === 'synced').length,
      deadLetters: this.deadLetters.size,
    };
  }

  // Dead Letter Queue Operations

  getDeadLetters(profileId?: string): DeadLetterItem[] {
    const all = Array.from(this.deadLetters.values());
    if (profileId) {
      return all.filter(dl => dl.item.profile_id === profileId);
    }
    return all;
  }

  addDeadLetter(deadLetter: DeadLetterItem): void {
    this.deadLetters.set(deadLetter.item.idempotency_key, { ...deadLetter });
    this.items.delete(deadLetter.item.idempotency_key);
    this.notify();
  }

  removeDeadLetter(idempotencyKey: string): boolean {
    const existed = this.deadLetters.has(idempotencyKey);
    this.deadLetters.delete(idempotencyKey);
    if (existed) this.notify();
    return existed;
  }

  retryDeadLetter(idempotencyKey: string): boolean {
    const deadLetter = this.deadLetters.get(idempotencyKey);
    if (!deadLetter) return false;

    this.deadLetters.delete(idempotencyKey);

    const itemToRetry: ProgressItem = {
      ...deadLetter.item,
      status: 'pending',
      retryCount: 0,
      lastError: undefined,
      lastRetryAt: undefined,
    };

    this.items.set(idempotencyKey, itemToRetry);
    this.notify();
    return true;
  }

  getDeadLetterCount(): number {
    return this.deadLetters.size;
  }

  // Subscription

  subscribe(callback: () => void): () => void {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  // Test helpers

  /**
   * Get internal state for test assertions
   */
  getInternalState(): {
    items: ProgressItem[];
    deadLetters: DeadLetterItem[];
  } {
    return {
      items: this.getAll(),
      deadLetters: this.getDeadLetters(),
    };
  }

  /**
   * Directly set internal state for test setup
   */
  setInternalState(state: {
    items?: ProgressItem[];
    deadLetters?: DeadLetterItem[];
  }): void {
    if (state.items) {
      this.items.clear();
      for (const item of state.items) {
        this.items.set(item.idempotency_key, { ...item });
      }
    }
    if (state.deadLetters) {
      this.deadLetters.clear();
      for (const dl of state.deadLetters) {
        this.deadLetters.set(dl.item.idempotency_key, { ...dl });
      }
    }
    this.notify();
  }

  // Private helpers

  private notify(): void {
    this.listeners.forEach(cb => {
      try {
        cb();
      } catch (error) {
        console.error('[InMemoryProgressRepository] Listener error:', error);
      }
    });
  }
}
