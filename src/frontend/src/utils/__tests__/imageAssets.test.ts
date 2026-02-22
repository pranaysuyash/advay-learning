import { describe, expect, it } from 'vitest';

import {
  getBestImageSource,
  getImageAsset,
  resolveImageUrl,
} from '../imageAssets';

describe('imageAssets helper', () => {
  it('returns asset metadata for known ids', () => {
    const asset = getImageAsset('bg-sunny');
    expect(asset).not.toBeNull();
    expect(asset?.fallbackSrc).toContain('bg_sunny.png');
  });

  it('returns best image source shape', () => {
    const source = getBestImageSource('pip-mascot');
    expect(source).not.toBeNull();
    expect(source?.fallbackSrc).toContain('red_panda_no_bg.png');
  });

  it('resolves optimized image URL for known ids', () => {
    const resolved = resolveImageUrl('adventure-map');
    expect(resolved).toContain('adventure-map');
  });
});
