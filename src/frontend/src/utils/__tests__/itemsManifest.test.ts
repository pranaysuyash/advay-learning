import { describe, expect, it } from 'vitest';
import { getItemIconPath, getVisualTierFromRarity } from '../itemsManifest';

describe('itemsManifest', () => {
  it('returns mapped icon path when item is known', () => {
    expect(getItemIconPath('shape-star')).toBe('/assets/items/icons/star.png');
  });

  it('returns undefined for unknown item without fallback', () => {
    expect(getItemIconPath('unknown-item')).toBeUndefined();
  });

  it('returns fallback for unknown item when provided', () => {
    expect(getItemIconPath('unknown-item', '/fallback.png')).toBe('/fallback.png');
  });

  it('maps rarity to visual tier', () => {
    expect(getVisualTierFromRarity('common')).toBe('normal');
    expect(getVisualTierFromRarity('rare')).toBe('special');
    expect(getVisualTierFromRarity('legendary')).toBe('magical');
  });
});
