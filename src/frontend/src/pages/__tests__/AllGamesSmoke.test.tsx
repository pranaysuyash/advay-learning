import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';

// This glob will pick up every TSX file directly under pages/ (not tests subfolder).
// It's a cheap way to ensure that all game/page components can be imported and rendered
// without throwing.  Any new page added in future will automatically be exercised here.
const modules = import.meta.glob('../*.tsx');

describe('all pages smoke test', () => {
  for (const path in modules) {
    // derive a friendly name from the filename
    const name = path.split('/').pop();
    it(`can import and render ${name}`, async () => {
      const mod: any = await modules[path]();
      // attempt to pick a react component export
      const Comp = mod.default || Object.values(mod)[0];
      if (!Comp) {
        throw new Error(`no component exported from ${path}`);
      }

      const consoleErrors: string[] = [];
      const errorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation((...args: any[]) => {
          const text = args.join(' ');
          // Ignore React `act(...)` warnings and known non-fatal library warnings.
          if (
            text.includes('An update to %s inside a test was not wrapped in act') ||
            text.includes('THREE.WARNING: Multiple instances of Three.js being imported') ||
            text.includes('Failed to fetch APOD')
          ) {
            return;
          }
          consoleErrors.push(text);
        });

      try {
        render(
          <MemoryRouter>
            <Comp />
          </MemoryRouter>,
        );

        // Let effects run briefly so any errors surface (e.g., hooks using window APIs)
        await new Promise((r) => setTimeout(r, 50));

        expect(consoleErrors, `Console errors during render of ${name}`).toEqual([]);
      } finally {
        errorSpy.mockRestore();
      }
    }, 15000);
  }
});
