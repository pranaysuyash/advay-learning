import fs from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

import { GAME_REGISTRY } from '../../data/gameRegistry';

const APP_SOURCE = fs.readFileSync(
  path.resolve(__dirname, '../../App.tsx'),
  'utf8',
);

function extractGameRoutePaths(source: string): string[] {
  const matches = source.matchAll(/path='(\/games\/[^']+)'/g);
  return Array.from(matches, (match) => match[1]);
}

describe('Route and registry consistency', () => {
  it('does not define duplicate game route paths in App.tsx', () => {
    const routes = extractGameRoutePaths(APP_SOURCE);
    const duplicateEntries = routes.filter(
      (route, index) => routes.indexOf(route) !== index,
    );

    expect(duplicateEntries).toEqual([]);
  });

  it('covers every listed game registry path in App.tsx routes', () => {
    const appRoutes = new Set(extractGameRoutePaths(APP_SOURCE));
    const listedGamePaths = GAME_REGISTRY.filter((game) => game.listed).map(
      (game) => game.path,
    );

    const missingRoutes = listedGamePaths.filter((path) => !appRoutes.has(path));

    expect(missingRoutes).toEqual([]);
  });
});
