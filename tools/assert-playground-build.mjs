import { assertFreshBuild } from '../scripts/assert-fresh-build.mjs';

const librarySources = ['projects/ui/src', 'angular.json', 'pnpm-lock.yaml', 'tsconfig.json'];

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

/**
 * Playwright `globalSetup` for the replacement Playground (`dist/kikita-ui-playground`).
 */
export function assertReplacementPlaygroundBuild() {
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
