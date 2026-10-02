import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

import { defaultThemeCssPath, renderDefaultThemeCss } from './generate-theme-css.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));

describe('generate-theme-css', () => {
  it('keeps the checked-in default theme in sync with the generator', async () => {
    const committed = readFileSync(join(root, defaultThemeCssPath), 'utf8');

    expect(committed, 'run pnpm generate:theme-css').toBe(await renderDefaultThemeCss(root));
  });

  it('puts both modes in the kui.tokens layer with the neutral scales and solid roles', async () => {
    const css = await renderDefaultThemeCss(root);

    expect(css).toContain('@layer kui.tokens {');
    expect(css).toContain(':root,');
    expect(css).toContain("[data-kui-theme='dark']");
    expect(css).toContain('--kui-neutral-12:');
    expect(css).toContain('--kui-color-primary-on-fill:');
    expect(css).toContain('color-mix(in oklab');
  });
});
