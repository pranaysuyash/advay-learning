import { describe, expect, it } from 'vitest';

import { assertAllowedAssetUrl } from '../assetLoader';

describe('assertAllowedAssetUrl', () => {
  it('allows same-origin image assets', () => {
    const url = assertAllowedAssetUrl('/assets/items/manifest.json', 'image');
    expect(url.pathname).toBe('/assets/items/manifest.json');
  });

  it('rejects cross-origin asset URLs', () => {
    expect(() =>
      assertAllowedAssetUrl('https://evil.example.com/payload.json', 'json')
    ).toThrow(/Cross-origin assets are not allowed/);
  });

  it('rejects inline json payloads', () => {
    expect(() =>
      assertAllowedAssetUrl('data:application/json,%7B%7D', 'json')
    ).toThrow(/JSON assets must use same-origin/);
  });
});
