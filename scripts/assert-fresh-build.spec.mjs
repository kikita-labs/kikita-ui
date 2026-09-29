import { mkdirSync, mkdtempSync, utimesSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

import { assertFreshBuild, checkBuildFreshness } from './assert-fresh-build.mjs';

function makeFixture() {
  const root = mkdtempSync(join(tmpdir(), 'kikita-fresh-build-'));
  mkdirSync(join(root, 'src'), { recursive: true });
  mkdirSync(join(root, 'dist'), { recursive: true });
  return root;
}

function touch(file, seconds) {
  writeFileSync(file, 'x');
  utimesSync(file, seconds, seconds);
}

const options = (root) => ({
  name: 'Demo',
  outputs: ['dist/server.mjs'],
  sources: ['src'],
  buildCommand: 'pnpm build',
  root,
});

describe('assert-fresh-build', () => {
  it('accepts an artifact built after the latest source change', () => {
    const root = makeFixture();
    touch(join(root, 'src', 'a.ts'), 1_000);
    touch(join(root, 'dist', 'server.mjs'), 2_000);

    expect(checkBuildFreshness(options(root)).stale).toBe(false);
  });

  it('rejects an artifact older than a source file and names the offender', () => {
    const root = makeFixture();
    touch(join(root, 'dist', 'server.mjs'), 1_000);
    touch(join(root, 'src', 'changed.ts'), 2_000);

    const result = checkBuildFreshness(options(root));

    expect(result.stale).toBe(true);
    expect(result.message).toContain('changed.ts');
    expect(() => assertFreshBuild(options(root))).toThrow(/pnpm build/);
  });

  it('ignores test and prose files that cannot change the build', () => {
    const root = makeFixture();
    touch(join(root, 'dist', 'server.mjs'), 1_000);
    touch(join(root, 'src', 'a.spec.ts'), 2_000);
    touch(join(root, 'src', 'notes.md'), 2_000);

    expect(checkBuildFreshness(options(root)).stale).toBe(false);
  });

  it('reports a missing artifact', () => {
    const root = makeFixture();
    touch(join(root, 'src', 'a.ts'), 1_000);

    const result = checkBuildFreshness(options(root));

    expect(result.stale).toBe(true);
    expect(result.message).toContain('missing');
  });
});
