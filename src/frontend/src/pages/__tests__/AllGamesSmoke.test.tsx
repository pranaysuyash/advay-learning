import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

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
      render(
        <MemoryRouter>
          <Comp />
        </MemoryRouter>,
      );
    }, 15000);
  }
});
