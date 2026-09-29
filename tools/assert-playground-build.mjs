import { assertFreshBuild } from '../scripts/assert-fresh-build.mjs';
import { librarySources } from './library-build-sources.mjs';

/**
 * Playwright `globalSetup` for suites that run against the built library Playground
 * (`dist/playground`). Fails when the artifact is older than the code under test.
 */
export default function assertLibraryPlaygroundBuild() {
  assertFreshBuild({
    name: 'Library Playground',
    outputs: ['dist/playground/server/server.mjs', 'dist/playground/browser/index.csr.html'],
    sources: [...librarySources, 'projects/playground'],
    buildCommand: 'pnpm.cmd build:playground',
  });
}
