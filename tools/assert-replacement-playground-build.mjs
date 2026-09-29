import { assertFreshBuild } from '../scripts/assert-fresh-build.mjs';
import { librarySources } from './library-build-sources.mjs';

/**
 * Playwright `globalSetup` for the replacement Playground (`dist/kikita-ui-playground`).
 * Fails when the artifact is older than the code under test.
 */
export default function assertReplacementPlaygroundBuild() {
  assertFreshBuild({
    name: 'Replacement Playground',
    outputs: [
      'dist/kikita-ui-playground/server/server.mjs',
      'dist/kikita-ui-playground/browser/index.csr.html',
    ],
    sources: [
      ...librarySources,
      'projects/kikita-ui-playground/src',
      'projects/kikita-ui-playground/public',
      'projects/kikita-ui-playground/tsconfig.app.json',
    ],
    buildCommand: 'pnpm.cmd build:kikita-ui-playground',
  });
}
